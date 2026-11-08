# denizakkoc/BAGEL-ZebraCoT-GRPO-Guarded-10k-20260925

## Resumen

BAGEL-ZebraCoT-GRPO-Guarded-10k-20260925 es un archivo público de checkpoints de investigación (adaptadores LoRA) entrenados sobre el modelo base multimodal `multimodal-reasoning-lab/Bagel-Zebra-CoT`. Lo publica el usuario `denizakkoc` en Hugging Face y recoge ocho checkpoints supervivientes de una campaña de ajuste con GRPO (Group Relative Policy Optimization) orientada a razonamiento visual con cadenas de pensamiento del tipo "zebra-CoT". No se trata de un modelo autónomo listo para producción, sino de pesos entrenables en formato propio (no PEFT estándar) que requieren el modelo base para funcionar.

El objetivo del experimento es reforzar la capacidad de razonamiento visual multi-paso mediante recompensas programáticas y jueces con modelos de visión-lenguaje congelados (Qwen2.5-VL-72B-AWQ). El conjunto de datos es un subconjunto fijo y ordenado de 10.000 ejemplos del dataset `multimodal-reasoning-lab/Zebra-CoT`, excluyendo tareas de Checkers/Connect Four y referencias ARC no parseables. La relevancia es doble: por un lado documenta de forma inusualmente detallada la procedencia, hardware y estado de cada checkpoint (algo poco habitual en repos de investigación); por otro, expone las dificultades prácticas de entrenar con RL multimodal a gran escala (OOM, reanudaciones, cambios de recompensa a mitad de ejecución).

La licencia declarada es Apache 2.0, el idioma anotado es únicamente inglés y el repositorio ocupa 9,0 GB. No hay pipeline declarado ni métricas de benchmarks publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 64, alpha 128) sobre el modelo base multimodal BAGEL (arquitectura del base no detallada en la información disponible) |
| Parametros totales | No disponible (el repo contiene adaptadores, no pesos completos; tamaño del repo 9,0 GB) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen en el formato de pesos entrenables original de BAGEL; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de pesos entrenables/adaptadores en formato propio de BAGEL (no son exportaciones PEFT `save_pretrained` ni modelos fusionados); ficheros de optimizador y RNG separados y excluidos |

## Arquitectura y entrenamiento

El modelo base es BAGEL, un modelo multimodal de la organización `multimodal-reasoning-lab`, en su variante `Bagel-ZebraCoT` (revisión registrada al descargar: `ebce32410ee2062d073feae484ea2c6c1515fba8`). Sobre él se aplican adaptadores LoRA de rango 64 y alpha 128 que afectan tanto al experto de comprensión como al de generación. El entrenamiento usa GRPO con dos rollouts por prompt y recompensas basadas en un juez congelado Qwen2.5-VL-72B-AWQ, además de una recompensa de coincidencia exacta con ARC ("exact-ARC v2") con puerta terminal y contrapesado. La línea de recompensas es mixta: comenzó con la recompensa v2 y se reanudó con el juez "neither-v3", por lo que no es una ejecución homogénea desde el inicio.

El dataset es un subconjunto fijo y ordenado de 10.000 ejemplos de `multimodal-reasoning-lab/Zebra-CoT`, excluyendo Checkers/Connect Four y referencias ARC no parseables. La ejecución original con todos los datos falló por OOM tras 352 ejemplos sin guardar; la campaña documentada es la sustitución con el subconjunto de 10.000. El hardware fueron GPUs NVIDIA A100 en el clúster CINECA Leonardo: 16 GPUs de política por nodo y GPUs de juez compartidas con otros trabajos concurrentes. La rama final (`train_legacy_v3_resume4`) completó los 10.000 ejemplos con un cursor de 10.000 y un checkpoint final en el paso 1917. Las reanudaciones restauraron adaptador, estado de Adam y RNG guardados; las actualizaciones posteriores a checkpoints previos se perdieron y algunos ejemplos se repitieron. El tiempo registrado de procesamiento de prompts de esa rama final fue de 4,380 horas de reloj (no GPU-horas), con una ventana transcurrida de 4,510 horas.

## Capacidades

- Razonamiento visual multi-paso: el ajuste se orienta a cadenas de pensamiento sobre imágenes (estilo zebra-CoT) y tareas tipo ARC con recompensa por coincidencia exacta.
- Comprensión de imágenes y generación: el LoRA adapta tanto el experto de comprensión como el de generación del modelo base BAGEL.
- Razonamiento guiado por recompensa: el entrenamiento GRPO con juez VLM favorece respuestas verificables y formatos de razonamiento estructurados.
- Capacidades del modelo base (tool calling, agentes, matemáticas, código): no disponibles en la información proporcionada para esta variante.
- Multilingüismo: limitado al inglés según los metadatos del repositorio.
- Modo "thinking": no se documenta explícitamente; la cadena de pensamiento zebra-CoT es el objeto del ajuste, pero no se describe una interfaz de modo de razonamiento separada.

## Casos de uso

- Investigación en RL multimodal: sirve como material de referencia para reproducir o auditar una campaña GRPO con LoRA sobre un VLM, incluyendo manifiestos de checksums, cursores de datos y metadatos de entrenamiento por checkpoint.
- Estudio de dinámicas de recompensa mixta: útil para analizar cómo afecta cambiar de recompensa exact-ARC v2 a un juez neither-v3 a mitad de entrenamiento, con checkpoints intermedios de cada segmento.
- Evaluación de robustez de razonamiento visual: los ocho checkpoints permiten comparar el efecto de distintas exposiciones de datos (304, 2.816, 4.400, 5.312, 5.888, 6.032 y 10.000 ejemplos) sobre tareas de razonamiento visual.
- Reproducción de fallos a escala: el repositorio documenta un OOM tras 352 ejemplos y las estrategias de reanudación; útil como caso de estudio de gestión de estado en entrenamiento distribuido con Slurm en CINECA Leonardo.
- Base para ajustes posteriores: al ser adaptadores LoRA sobre BAGEL-ZebraCoT, pueden servir como punto de partida para nuevos experimentos de RL o SFT sobre el mismo modelo base.
- Docencia y formación: ejemplo realista de model card exhaustiva con procedencia, asignación de hardware y advertencias sobre linaje de recompensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento visual; solo documenta cursores de datos, tiempos de entrenamiento y estado de los checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo contiene adaptadores (9,0 GB) que requieren cargar el modelo base BAGEL completo; el consumo depende del tamaño y precisión del base, no especificados.
- GPU recomendadas: el entrenamiento se realizó con NVIDIA A100 (16 GPUs de política por nodo más GPUs de juez Qwen2.5-VL-72B-AWQ). Para inferencia del base se recomienda al menos hardware de clase A100/H100, aunque no hay cifras publicadas.
- Cabe en GPU consumer: no disponible; sin datos del tamaño del modelo base no puede confirmarse.
- Opciones de despliegue: no disponibles para esta variante; al ser checkpoints en formato propio de BAGEL no son directamente compatibles con vLLM, llama.cpp, Ollama o TGI sin conversión y carga del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Guarded-10k-20260925 | No disponible (adaptadores LoRA sobre BAGEL) | No disponible | Apache 2.0 | Hugging Face, 0 descargas, 0 likes | Checkpoints de investigación, 8 ficheros |
| multimodal-reasoning-lab/Bagel-ZebraCoT (base) | No disponible | No disponible | No disponible en la información | Hugging Face | Modelo base requerido para usar los adaptadores |
| Otros modelos de razonamiento visual comparables | No disponible | No disponible | No disponible | No disponible | No se identifican alternativas equivalentes en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo autónomo: son adaptadores/checkpoints en formato propio de BAGEL, no exportaciones PEFT estándar ni modelos fusionados; requieren el base `multimodal-reasoning-lab/Bagel-ZebraCoT` y código personalizado.
- Linaje de recompensas mixto: la ejecución combinó la recompensa exact-ARC v2 y el juez neither-v3; los resultados no equivalen a un entrenamiento homogéneo con una sola recompensa.
- Estado de entrenamiento incompleto: las actualizaciones posteriores a checkpoints previos se perdieron en las reanudaciones y algunos ejemplos se repitieron, lo que puede introducir sesgos de exposición.
- Solo inglés: los metadatos declaran únicamente `en`; no hay soporte multilingüe documentado.
- Sin benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.
- Riesgo de alucinación: no cuantificado; al ser un modelo de razonamiento visual con recompensas programáticas, puede generar cadenas plausibles pero incorrectas en tareas fuera de la distribución de ARC/Zebra-CoT.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al depender del modelo base conviene verificar la licencia de `multimodal-reasoning-lab/Bagel-ZebraCoT`, no indicada en la información disponible.
- Madurez: 0 descargas y 0 likes; repositorio de investigación sin validación externa.
- Restricciones de datos: el subconjunto excluye Checkers/Connect Four y referencias ARC no parseables, por lo que su cobertura es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Guarded-10k-20260925
- Perfil del autor: https://huggingface.co/denizakkoc
- Dataset del autor: https://huggingface.co/denizakkoc/datasets
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-ZebraCoT
- Dataset de entrenamiento: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
