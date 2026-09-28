# davidheineman/opd-teacher-Q2.5I-MafMafia-step149

## Resumen

opd-teacher-Q2.5I-MafMafia-step149 es un ajuste fino del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario davidheineman. Se trata de un "modelo profesor" (teacher) entrenado con el pipeline RLVE sobre el entorno `MafMafia` a dificultad 0, y su finalidad declarada es servir de referencia en un experimento de destilación on-policy sobre 32 entornos. No es, por tanto, un modelo de propósito general, sino un artefacto de investigación dentro de un experimento de aprendizaje por refuerzo.

El entrenamiento consistió en 150 actualizaciones con GRPO. El identificador `step149` corresponde al checkpoint final en indexación base cero (la actualización número 150). Los pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face y se validaron contra los nombres y formas de tensor del modelo base.

Técnicamente hereda la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros (~1,54 mil millones) en precisión completa y un repositorio de 3,1 GB. La model card no documenta ventana de contexto, composición del dataset de entrenamiento ni resultados de evaluación, y el modelo solo declara soporte para inglés. Dado que el autor no publica benchmarks ni detalles del entorno `MafMafia`, su utilidad práctica fuera del experimento de destilación es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada de Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (~1,54 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión nativa) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamaño del repositorio | 3,1 GB |
| Pipeline declarado | text-generation |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalización RMSNorm, atención con RoPE y sesgo QKV (las características concretas no se detallan en la model card). Sobre esa base se aplicó un ajuste con GRPO (Group Relative Policy Optimization), una variante de optimización de política sin crítico que estima ventajas relativas dentro de un grupo de muestras generadas. El autor indica que el entrenamiento se ejecutó con su pipeline RLVE sobre el entorno `MafMafia` a dificultad 0, durante 150 actualizaciones.

No se especifica en la información disponible el número de tokens vistos, la composición del dataset, la existencia de fases previas de SFT o DPO, ni la función de recompensa del entorno. Tampoco se documenta qué representa exactamente `MafMafia` (el nombre sugiere un juego de deducción social tipo Mafia, pero es una inferencia no confirmada) ni qué mide la "dificultad 0". El único detalle técnico verificable del proceso es la conversión del checkpoint nativo final a safetensors, validada contra los nombres y formas de tensor del modelo base para garantizar la compatibilidad de carga.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento multi-turno y role-play dentro del entorno `MafMafia`: es la capacidad que el entrenamiento con GRPO pretende reforzar.
- Actuación como modelo profesor en destilación on-policy: generar trayectorias y distribuciones de referencia para entrenar otros modelos en el mismo entorno.
- Generación de código y matemáticas básicas: presumiblemente conservadas del modelo base, aunque no hay evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-1.5B-Instruct lo soporta, pero no se verifica aquí.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma explícita; el entorno de entrenamiento es episódico y multi-turno.
- Capacidades multilingües: no; el modelo declara únicamente inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Destilación on-policy de modelos pequeños: el caso de uso explícito del autor. El modelo genera trayectorias en el entorno `MafMafia` que se usan como señal de profesor para entrenar un alumno, evitando depender de un modelo grande externo durante el ciclo de RL.
- Investigación en GRPO y RL verificable: sirve como checkpoint de referencia para reproducir el efecto de 150 actualizaciones de GRPO sobre un modelo de 1,5B en una tarea con recompensa verificable.
- Estudio de especialización vs. olvido catastrófico: al ser un ajuste agresivo sobre un entorno concreto, permite medir cuánto se degradan las capacidades generales del modelo base tras el RL.
- Simulación de agentes conversacionales en juegos de deducción social: si `MafMafia` es efectivamente un juego de roles ocultos, el modelo puede emplearse como jugador automatizado en partidas multi-agente con información asimétrica.
- Generación de datos sintéticos de diálogo con reglas: útil para construir datasets de conversaciones etiquetadas por resultado (victoria/derrota) dentro del mismo entorno.
- Baseline en experimentos de comparación de profesores: al existir una familia de checkpoints de profesor por entorno, este modelo puede actuar como punto de comparación en cuanto a calidad de las trayectorias generadas.
- Prototipado en local de bajo coste: con ~1,5B parámetros cabe en GPU de consumo y permite iterar sobre prompts del entorno sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de la tarea `MafMafia` (tasa de éxito, recompensa media o win rate). Tampoco se proporcionan curvas de entrenamiento más allá de la referencia al run de W&B.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 3,1 GB solo para pesos, más memoria de activaciones y caché KV; en la práctica unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,9-1,2 GB para pesos.
- GPU recomendadas para producción: cualquier GPU con 8 GB o más; A10G, L4, RTX 4090 o L40S son suficientes. No requiere A100/H100 salvo que se desplieguen muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes pueden ejecutarlo sin problema, incluso en fp16.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` están declarados, por lo que debería funcionar en Hugging Face Inference Endpoints); vLLM con soporte de Qwen2. No hay pesos GGUF publicados, por lo que Ollama o llama.cpp requerirían una conversión propia.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas públicas y conviene verificarlos antes de usarlos en una decisión de producción.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-MafMafia-step149 | 1,54 B | no disponible | apache-2.0 | en | Ajuste GRPO sobre un único entorno; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (según su ficha pública) | apache-2.0 | multilingüe | Modelo base; capacidades generales y alineación por instrucciones |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens (según su ficha pública) | Llama 3.2 Community License | multilingüe (8 idiomas declarados) | Licencia con restricciones para algunos usos comerciales |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens (según su ficha pública) | apache-2.0 | en (principalmente) | Alternativa de tamaño similar con licencia permisiva |

Frente a su propio modelo base, este checkpoint sacrifica generalidad por especialización: no hay evidencia publicada de que conserve las capacidades multilingües ni de instrucción del original. Frente a Llama-3.2-1B y SmolLM2-1.7B, la diferencia relevante no es el rendimiento (no medido) sino el propósito: es un artefacto de investigación, no un modelo de asistente general.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado para un único entorno (`MafMafia`) dentro de un experimento de destilación. Su uso fuera de ese contexto no está validado.
- Sesgos conocidos: no documentados en la model card. Hereda los sesgos de los datos de preentrenamiento y alineación de Qwen2.5, que el autor no analiza.
- Riesgo de alucinación: alto en tareas generales, especialmente tras un ajuste de RL sobre una única distribución de tareas; el modelo puede haber perdido calibración fuera de dominio.
- Limitación idiomática: solo declara inglés. No hay evidencia de soporte en castellano ni en otros idiomas.
- Limitación de contexto: la model card no especifica la ventana soportada, por lo que no se puede garantizar el comportamiento en secuencias largas más allá de lo que herede del modelo base.
- Ausencia total de evaluación: 0 descargas y 0 likes en el momento del análisis, sin benchmarks ni métricas de la tarea objetivo. No hay forma de comparar su calidad con alternativas sin ejecutar evaluaciones propias.
- Licencia: apache-2.0, permisiva para uso comercial, con la nota de que el repositorio incluye la licencia original de Qwen. Conviene revisar los términos del modelo base por si imponen condiciones adicionales.
- Riesgo de sobreajuste al entorno: 150 actualizaciones de GRPO sobre una única recompensa pueden degradar la coherencia general y aumentar la verbosidad o los patrones repetitivos propios del entorno de entrenamiento.
- Reproducibilidad: el autor enlaza el run de W&B y el código, pero no publica la configuración completa del entorno ni las semillas, lo que dificulta replicar exactamente el resultado.
- No hay pesos cuantizados publicados, así que cualquier despliegue en GGUF o 4 bits requiere conversión y validación propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-MafMafia-step149
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/c7e0105d
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Grupo de barrido en W&B: `opd-teachers-20260927-191939` (sin URL directa en la model card)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, al entorno `MafMafia` ni al pipeline RLVE; los resultados devueltos no guardan relación con el modelo.
