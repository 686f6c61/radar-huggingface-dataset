# maxenceSUN/LTM-Pi-RoboMME-1x-40k-DreamDojo

## Resumen

LTM-Pi-RoboMME-1x-40k-DreamDojo es un checkpoint de política robótica publicado por el usuario maxenceSUN en Hugging Face. Se trata del estado del optimizador en el paso 40.000 de un entrenamiento sobre el conjunto RoboMME-1x (16 tareas × 100 episodios), que combina una política PI0.5 con memoria visual LAM de DreamDojo. El modelo está pensado para control robótico de manipulación con memoria a largo plazo, un área donde las políticas visomotoras convencionales fallan al carecer de estado persistente entre episodios o secuencias largas.

El checkpoint se distribuye en formato Orbax/JAX original, sin conversión de tensores, e incluye los pesos del modelo, las estadísticas de normalización de acciones y estados, y metadatos de procedencia con sumas de verificación. No incluye el estado del optimizador ni los pesos del codificador visual, que son dependencias separadas. El repositorio ocupa 12,4 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es acotada: se trata de un artefacto de investigación con resultados modestos en el benchmark público RoboMME OOD v1.2 (7,5% de éxito, 60 sobre 800 episodios), publicado junto al artículo arXiv:2610.21362. Resulta útil como referencia reproducible para estudiar políticas con memoria visual y para comparar con el checkpoint hermano de mayor entrenamiento (10x-120k).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visomotora PI0.5 con memoria visual LAM (DreamDojo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (política de control; horizonte de acción 50, prompt length 200) |
| Tipos de cuantizacion | no disponible (checkpoint en FP32 para memoria; pesos en formato original sin conversión) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | Orbax/JAX (layout original, sin conversión a safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo es una política de imitación PI0.5 (familia de políticas visomotoras tipo flow matching) enriquecida con un módulo de memoria visual basado en DreamDojo LAM de 400k pasos. La memoria se construye a partir de dos cámaras (cabeza y muñeca), produce representaciones de 64 dimensiones y se almacena en FP32 con un horizonte de 1.410 transiciones. El lag de memoria en ejecución es 0 y no se aplica cuota ni compactación de transiciones, lo que distingue esta variante "no-quota" del checkpoint hermano de 10x. La horizonte de acción es 50 y el offset de inicio de acción en entrenamiento es 1, con alineación a la observación posterior a la acción.

El entrenamiento se realizó sobre RoboMME-1x (16 tareas, 100 episodios cada una) con batch de 128, calentamiento de 1.000 pasos, pico de learning rate 2,5e-5, decaimiento coseno hasta 120k pasos y mínimo de 2,5e-6. La evaluación online usa control a 20 Hz, un tick de simulador por acción, intervalo de replanificación de 10, 10 pasos de inferencia de flow, longitud de prompt 200 y sin ruido RGB. El offset de entrenamiento no añade retardo adicional en línea. El codificador visual y el dataset de entrenamiento son dependencias externas no incluidas en el repositorio.

## Capacidades

- Control robótico de manipulación visomotora en tareas de RoboMME, con acción continua de horizonte 50.
- Memoria visual a largo plazo mediante DreamDojo LAM, con representaciones de 64D provenientes de cámaras de cabeza y muñeca.
- Razonamiento multi-paso implícito en la política, con replanificación cada 10 ticks a 20 Hz.
- Inferencia por flow matching con 10 pasos, orientada a control en tiempo real.
- Integración con el runtime OpenPI (configuración `pi05_robomme_dreamdojo_lmv_causal_holdlast_h50_default`).
- Ejecución determinista con semilla de política configurable (seed 42 en la evaluación publicada).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponibles (solo inglés en metadatos).
- Capacidades de visión general, audio o thinking mode: no disponibles.

## Casos de uso

- Investigación reproducible en políticas con memoria visual: el checkpoint permite replicar exactamente la evaluación publicada (60/800 en RoboMME OOD v1.2, commit `adf19363`) usando la configuración y semilla indicadas, lo que facilita comparaciones controladas con otras variantes.
- Estudio del efecto del horizonte de memoria: al tener horizonte de 1.410 transiciones y lag 0, sirve para analizar cómo la memoria larga afecta al éxito en tareas de manipulación con dependencias temporales.
- Comparación de variantes de entrenamiento: junto al checkpoint 10x-120k, permite aislar el efecto del volumen de datos y pasos de entrenamiento sobre el rendimiento OOD.
- Desarrollo de pipelines de evaluación robótica: el layout Orbax con `norm_stats.json` y `SHA256SUMS` facilita la integración en harness de evaluación automatizados con verificación de integridad.
- Base para fine-tuning en dominios específicos: al ser un checkpoint intermedio (40k) sin estado de optimizador, es un punto de partida para ajuste sobre tareas propias, siempre que se disponga del codificador DreamDojo LAM y del dataset.
- Análisis de fallos en manipulación OOD: con 740 fallos documentados sobre 800 episodios, el checkpoint es útil para estudiar patrones de error en distribución fuera de entrenamiento.
- Reproducción de resultados de artículo: vinculado a arXiv:2610.21362, permite verificar las cifras reportadas por los autores.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| RoboMME OOD v1.2 (commit `adf19363`) | 16 tareas × 50 episodios, seed 42, 20 Hz, replan 10, 10 pasos flow | 60/800 éxitos (7,5%); 740 fallos; 0 errores de infraestructura |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de robótica y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 12,4 GB en disco, pero el consumo en GPU depende del runtime OpenPI y del codificador visual externo.
- GPU recomendadas: no disponible; el runtime original es JAX/Orbax, por lo que se requieren GPUs compatibles con JAX (típicamente NVIDIA A100/H100 en entornos de investigación).
- ¿Cabe en GPU de consumo? no disponible; sin datos de huella de memoria en inferencia no puede confirmarse.
- Opciones de despliegue: runtime OpenPI con configuración `pi05_robomme_dreamdojo_lmv_causal_holdlast_h50_default`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles; la evaluación usa control a 20 Hz con 10 pasos de flow y replanificación cada 10 ticks, lo que da una referencia operativa pero no cifras de latencia absoluta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTM-Pi-RoboMME-1x-40k-DreamDojo | no disponible | Horizonte de acción 50; memoria 1.410 transiciones | 7,5% éxito en RoboMME OOD v1.2 | no disponible | Hugging Face (0 descargas) |
| LTM-Pi-RoboMME-10x-120k-DreamDojo | no disponible | no disponible | no disponible en la información | no disponible | Hugging Face |
| Otras políticas PI0.5 sin memoria LAM | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al checkpoint hermano del mismo autor; no se dispone de datos de rendimiento ni especificaciones de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en OOD: 7,5% de éxito (60/800) en RoboMME OOD v1.2, lo que indica escasa generalización fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones no válidas o fallidas en entornos no vistos (740 fallos registrados).
- Limitaciones de contexto e idioma: solo inglés en metadatos; el horizonte de memoria está fijado en 1.410 transiciones y no hay compactación, lo que puede limitar secuencias más largas.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Dependencias externas no incluidas: el codificador visual DreamDojo LAM y el dataset de entrenamiento no forman parte del repositorio, lo que complica la reproducción sin acceso a ellos.
- Etiqueta de serialización engañosa: el archivo del codificador lleva la etiqueta `cdlam.stage1.inference` pero su contenido es DreamDojo LAM, no el codificador CD-LAM real; verificar el SHA-256 `12ce318e...fc386` antes de usarlo.
- Ausencia de estado del optimizador: no es reanudable para entrenamiento desde el paso 40k sin reconstruir el estado.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación externa.
- Formato no estándar: Orbax/JAX sin conversión, lo que excluye su uso directo en stacks de inferencia convencionales (safetensors, GGUF).

## Enlaces

- Hugging Face: https://huggingface.co/maxenceSUN/LTM-Pi-RoboMME-1x-40k-DreamDojo
- Modelo relacionado: https://huggingface.co/maxenceSUN/LTM-Pi-RoboMME-10x-120k-DreamDojo
- Paper: https://arxiv.org/abs/2610.21362
