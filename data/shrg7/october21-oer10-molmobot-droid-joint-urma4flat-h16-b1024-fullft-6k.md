# shrg7/october21-oer10-molmobot-droid-joint-urma4flat-h16-b1024-fullft-6k

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado sobre **π0.5 (pi05)**, el modelo visión-lenguaje-acción (VLA) de Physical Intelligence implementado en el framework **openpi** de JAX. Lo publica el usuario de HuggingFace `shrg7` como parte de una familia de experimentos sobre el mismo tronco (`pi05_base`), en este caso con la configuración `october21_oer10_molmobot_droid_joint_urma4flat_h16_b1024_fullft` (rama `pi05-oer10-droid`, commit `7b64c2c1`). El checkpoint corresponde al update 5.999, es decir, 6.000 actualizaciones de optimizador con batch global de 1.024 sobre un run planificado hasta 40.000.

El problema que aborda es la **condicionalidad por embodiment**: una única política debe controlar robots distintos sin disponer de una cabeza separada por robot. Para ello introduce un token URMA4 que resume la descripción compilada del robot (articulaciones, links, pinza) y su estado articular actual, codificado por un encoder pequeño que se inyecta como token extra en el prefijo PaliGemma. El entrenamiento mezcla datos reales de DROID con datos simulados de MolmoBot y de los conjuntos pick-and-place OER-10, cubriendo 1.299 robots.

Es relevante ahora porque combina tres líneas activas de 2026: reutilización de VLA preentrenados con fine-tuning completo, entrenamiento conjunto real+simulación para generalización de embodiment, y cabezas de acción por flow matching con chunks de 16 pasos. El repo ocupa 12,4 GB e incluye pesos en formato Orbax, estadísticas de normalización y el bundle URMA4, pero no el estado del optimizador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5: prefijo PaliGemma (visión-lenguaje) + experto de acción con flow matching; token extra URMA4 para el embodiment |
| Parametros totales | no disponible (la model card no publica el recuento; derivado de `pi05_base` con fine-tuning completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no se documenta cobertura lingüística) |
| Licencia | no disponible |
| Formato de pesos | Orbax (`params/`), más `norm_stats.json` y bundle URMA4 en `.npz` |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema π0.5: un prefijo PaliGemma que procesa observaciones RGB e instrucciones en lenguaje, y un experto de acción entrenado con flow matching que genera chunks de 16 acciones (H16) relativas a las articulaciones actuales. La innovación de este checkpoint es el **token URMA4**: la descripción compilada del robot (número y tipo de articulaciones, links, pinza) junto con el estado articular actual pasan por un encoder pequeño que produce un token adicional en el prefijo, de modo que una sola política sabe qué robot está controlando. El encoder URMA4 se inicializa desde cero; el resto se afina a partir de `pi05_base`.

El recetario de entrenamiento es deliberadamente simple: solo pérdida de flow matching sobre el experto de acción, sin FAST ni cabeza de lenguaje. Batch global de 1.024 (4 microbatches acumulados de 256) sobre 4×H200 con FSDP de 4 vías, 1.000 pasos de warmup y LR constante de 5e-5, AdamW con clipping 1, EMA de 0,99 y fine-tuning completo. Los pesos publicados son los del EMA. La mezcla de datos es 50% DROID 1.0.1 (todos los episodios exitosos, descartando rangos de inactividad), 15% la configuración simulada de DROID de MolmoBot (`franka_droid`, 20k v2, con su propio robot id) y 35% los conjuntos simulados pick-and-place OER-10 (los seis del autor y los de BoAI), descartando episodios inestables con saltos articulares superiores a 1 rad. En total, 1.299 robots y sin aumento de imagen. La pinza se modela como cierre 0-1 y las acciones usan estadísticas gaussianas por grupo de grados de libertad, con tablas separadas para DROID y MolmoBot.

## Capacidades

- Control robótico de manipulación extremo a extremo a partir de observaciones RGB e instrucción en lenguaje, emitiendo chunks de 16 acciones articulares.
- Condicionalidad explícita de embodiment mediante el token URMA4: la misma política puede dirigir brazos con distinta cinemática y pinzas distintas.
- Generalización entre dominios al mezclar episodios reales de DROID con simulación de MolmoBot y OER-10.
- Manipulación pick-and-place en entornos simulados y en plataformas tipo Franka/DROID.
- Comprensión de instrucciones en lenguaje natural heredada del prefijo PaliGemma (sin cobertura idiomática documentada).
- Soporte de tool calling / function calling: no disponible; el modelo es una política de acción, no un asistente con herramientas.
- Modo thinking o razonamiento multi-paso explícito: no disponible en esta configuración (no se entrena cabeza de lenguaje ni pérdida FAST).
- Visión: sí, como entrada de observación (cámaras de muñeca y exocámara en el caso de DROID, según la documentación de MolmoBot); no se documenta entrada de audio.

## Casos de uso

- **Despliegue de una política única en flotas heterogéneas**: el token URMA4 permite servir el mismo checkpoint sobre robots con distinto número de articulaciones, evitando mantener una política por plataforma; basta con compilar la descripción del robot y alimentar el encoder.
- **Investigación en condicionalidad por embodiment**: sirve como baseline reproducible para medir cuánto aporta un único token frente a embeddings por robot o cabezas separadas, usando la misma mezcla DROID+MolmoBot+OER-10.
- **Pick-and-place en simulación**: los conjuntos OER-10 (los seis del autor y los de BoAI) son el escenario natural de evaluación; el checkpoint se puede ejecutar en el simulador antes de tocar hardware.
- **Sim-to-real sobre DROID**: al incluir un 50% de DROID 1.0.1 real, es un punto de partida razonable para validar transferencia a una plataforma DROID física con cámaras de muñeca y exocámara.
- **Punto de partida para fine-tuning específico de tarea**: el checkpoint a 6k updates, con LR constante y EMA, es un inicializador barato para recetas posteriores, comparable al checkpoint hermano de 22k updates del mismo autor.
- **Ablaciones de receta de entrenamiento**: al estar documentados batch, warmup, LR, clipping y EMA, permite reproducir y variar condiciones (por ejemplo, incluir o excluir el 15% de MolmoBot) y medir impacto en éxito de manipulación.
- **Evaluación de robustez de viewpoint**: la línea MolmoBot declara robustez a puntos de vista de cámara arbitrarios; este checkpoint permite comprobar si esa propiedad se conserva tras el entrenamiento conjunto con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de simulación ni evaluaciones en hardware real, y tampoco se aportan comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- **Tamaño en disco**: 12,4 GB de repositorio, incluyendo `params/` (Orbax), `norm_stats.json` y el bundle URMA4 en `.npz`.
- **VRAM estimada para inferencia**: no disponible de forma oficial. Como referencia orientativa, el repo de 12,4 GB sugiere un modelo del orden de 3.000 M de parámetros si los pesos están en float32, lo que en bf16 ocuparía aproximadamente 6-7 GB solo en pesos; a ello hay que sumar activaciones del prefijo visual y del experto de acción. Cifra no confirmada por el autor.
- **GPU recomendadas**: no documentadas para inferencia. El entrenamiento se realizó con 4×H200 (80 GB) y FSDP de 4 vías, lo que no implica requisitos equivalentes en serving.
- **¿Cabe en GPU de consumo?**: previsiblemente sí en tarjetas de 24 GB (RTX 4090, RTX 3090) si el runtime JAX permite cargar los pesos en bf16 y ejecutar una sola réplica; no hay confirmación del autor ni pruebas publicadas.
- **Opciones de despliegue**: el checkpoint es JAX/Orbax y está pensado para el stack **openpi** (restauración de `params/` junto con `assets/<asset_id>/`). No se publican pesos GGUF ni safetensors, por lo que llama.cpp, Ollama o LM Studio no son viables sin conversión. vLLM y TGI no aplican a este tipo de política VLA con experto de flow matching.
- **Latencia y throughput**: no disponibles. El único dato relacionado es el horizonte de acción H16 (16 pasos por inferencia), que condiciona la frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`october21-...-6k`) | no disponible | no disponible | π0.5 + token URMA4, mezcla DROID/MolmoBot/OER-10, 6k updates | no disponible | HuggingFace (shrg7) |
| `shrg7/october17-oer10-joint-urma4-fullft-22k` | no disponible | no disponible | Misma familia π0.5 + URMA4, receta OER-9/OER-10, 22k updates | no disponible | HuggingFace (shrg7) |
| MolmoBot-DROID (AllenAI) | ~4B (base Molmo2-4B) | no disponible | VLM Molmo2-4B + experto DiT con flow matching, entrenado a gran escala en simulación | no disponible | GitHub `allenai/MolmoBot` |
| π0.5 base (`pi05_base`, openpi) | no disponible | no disponible | VLA generalista previo al fine-tuning, sin token URMA4 | no disponible | Framework openpi |

La comparación relevante es interna a la familia: este checkpoint está a 6.000 de los 40.000 updates previstos, mientras que el hermano de octubre acumula 22.000, por lo que no son intercambiables en cuanto a madurez. Frente a MolmoBot-DROID, la diferencia de diseño es que aquí se añade condicionalidad explícita de robot vía URMA4 y se incorpora un 50% de datos reales de DROID, mientras que MolmoBot apuesta por entrenamiento puramente simulado a gran escala.

## Limitaciones y advertencias

- **Licencia no especificada**: al no declararse licencia, no puede asumirse uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- **Checkpoint intermedio**: 6.000 updates de un run de 40.000; el propio autor indica que el entrenamiento continúa, por lo que el rendimiento está por debajo del techo de la receta.
- **Ausencia total de benchmarks**: no hay tasas de éxito en simulación ni en real, lo que impide comparar objetivamente con alternativas.
- **Riesgo de sobreajuste al conjunto de datos**: 1.299 robots y sin aumento de imagen; la variabilidad visual depende por completo de la diversidad de DROID, MolmoBot y OER-10.
- **Filtrado de datos agresivo**: se descartan rangos de inactividad en DROID y episodios simulados con saltos articulares mayores de 1 rad, lo que puede dejar fuera regímenes dinámicos rápidos o recuperaciones de fallo.
- **Cuello de botella del token URMA4**: toda la información de embodiment se comprime en un único token; cambios grandes de morfología o herramientas no representadas pueden degradar el control.
- **Sin cabeza de lenguaje ni FAST**: la configuración entrena solo el experto de acción, de modo que no cabe esperar razonamiento verbal explícito ni subtareas guiadas por lenguaje generado.
- **Idioma y contexto no documentados**: se desconoce la cobertura multilingüe real del prefijo PaliGemma en esta configuración y la longitud de contexto efectiva.
- **Reproducibilidad parcial**: el estado del optimizador no se incluye, por lo que no se puede reanudar el entrenamiento exactamente desde este punto.
- **Alucinación en el sentido de política**: en robótica el fallo se manifiesta como acciones plausibles pero incorrectas; sin evaluación de seguridad ni límites articulares documentados, requiere envoltorio de control y parada de emergencia en hardware real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shrg7/october21-oer10-molmobot-droid-joint-urma4flat-h16-b1024-fullft-6k
- Checkpoint hermano (22k updates): https://huggingface.co/shrg7/october17-oer10-joint-urma4-fullft-22k
- Repositorio de MolmoBot (AllenAI): https://github.com/allenai/MolmoBot
- Sitio web de MolmoBot: https://allenai.github.io/MolmoBot/
- Paper MolmoBot (arXiv): https://arxiv.org/abs/2603.16861
- Paper MolmoBot (PDF): https://arxiv.org/pdf/2603.16861
