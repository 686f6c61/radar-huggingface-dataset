# Malajusa/gpt-oss-20b-drawing-expert

## Resumen

gpt-oss-20b-drawing-expert es un ajuste fino supervisado (SFT) mediante LoRA del modelo abierto openai/gpt-oss-20b, desarrollado por el usuario Malajusa. El modelo está especializado en una tarea muy concreta: generar código Python ejecutable para dibujo programático, es decir, scripts completos con matplotlib/seaborn (gráficos, subplots, anotaciones, estilos) o PIL/Pillow (formas, degradados, paletas, renderizado de imágenes a `output.png`) a partir de una petición en lenguaje natural.

El modelo parte de la arquitectura MoE de gpt-oss-20b (20.914.757.184 parámetros totales según los pesos en safetensors) y mantiene el formato de pesos original: el adaptador LoRA se fusionó con el checkpoint base y se recuantizó a MXFP4 para servirse igual que el modelo original en transformers o vLLM. El repositorio ocupa 13,9 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada pero clara: demuestra un flujo de especialización reproducible (datos validados por ejecución, entrenamiento LoRA en una sola GPU de 96 GB en unos 56 minutos) y ofrece una mejora muy grande en su dominio frente al modelo base, pasando de un 35,1 % a un 100 % de scripts válidos en un conjunto de evaluación retenido de 57 prompts. No obstante, el propio autor advierte de que los checkpoints empaquetados en MXFP4 generan salidas defectuosas en transformers 5.24.0 / torch 2.15.0, por lo que recomienda cargar el adaptador sobre la base en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (heredada de openai/gpt-oss-20b); ajuste LoRA fusionado |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con max_length=2048) |
| Tipos de cuantizacion | MXFP4 (8-bit) en los checkpoints publicados; bf16 disponible vía base + adaptador |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer con mezcla de expertos (MoE) de openai/gpt-oss-20b. Sobre esa base se aplicó un ajuste fino supervisado con LoRA de rango 32 y α=32, con módulos objetivo `q,k,v,o,gate,up,down` y pérdida solo sobre la completación (completion-only loss, sin packing). El entrenamiento consistió en 2 épocas sobre 9.901 ejemplos, batch efectivo de 8 (2×4), gradient checkpointing y `max_length=2048`, con tasa de aprendizaje 1e-4, scheduler coseno hasta el 10 % y warmup del 3 %. Se usaron `flex_attention` y la ruta MoE nativa sin kernels del Hub. Todo el entrenamiento se ejecutó en una única RTX PRO 6000 (96 GB) en aproximadamente 56 minutos, con un pico de memoria reservada de 48,9 GB, sobre el stack TRL 1.18.2, transformers 5.24.0, peft 0.22.0 y torch 2.15.0.

Los datos de entrenamiento provienen del dataset Malajusa/programmatic-drawing-sft: 9.901 pares prompt→código de entrenamiento y 306 de evaluación, con la particularidad de que cada completación fue ejecutada y validada antes de entrenar (se conservó el 98,8 % de 10.328 candidatos). La composición es de 4.307 ejemplos de Escobar/pandas-matplotlib-seaborn-synth-validated, 5.000 de prashantss1404/Matplotlib_Seaborn_merged_prompt_completion_10k (CC0, con completaciones reescritas para que cada script construya su propio dataframe) y 900 tareas sintetizadas de PIL/Pillow con 14 plantillas de dibujo. Tras el entrenamiento, el adaptador se fusionó y se recuantizó a MXFP4. La pérdida de entrenamiento bajó de ~4,5 a ~3,87, con una precisión de token de ~0,94 y una pérdida de evaluación final de 3,878.

## Capacidades

- Generación de código Python completo y ejecutable para gráficos con matplotlib y seaborn: líneas, barras, subplots, anotaciones, estilos y medias móviles.
- Generación de código Python con PIL/Pillow para dibujo de formas, degradados, paletas, tableros de ajedrez, skylines y renderizado a `output.png`.
- Construcción autónoma de dataframes a partir de la descripción de columnas indicada en la petición.
- Respuesta en el canal `final` del formato harmony de gpt-oss, devolviendo código Python plano.
- Conversacional y orientado a instrucciones en lenguaje natural, con soporte de plantilla de chat (`apply_chat_template`).
- Compatible con endpoints (`endpoints_compatible`) y con despliegue en transformers y vLLM.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas más allá de las heredadas del modelo base.

## Casos de uso

- Generación automática de gráficos en informes: dado un prompt con la descripción de un dataframe y el tipo de gráfico deseado, el modelo produce un script autocontenido de matplotlib/seaborn listo para ejecutar en un pipeline de generación de informes.
- Creación de imágenes sintéticas para pruebas: con PIL/Pillow el modelo genera scripts que producen `output.png` con degradados, tableros o formas, útiles para poblar fixtures de tests de visión o de interfaces.
- Asistente de notebook para analistas: integrado en un entorno tipo Jupyter, convierte peticiones en lenguaje natural en celdas de código de visualización que el analista puede revisar y ejecutar.
- Automatización de dashboards estáticos: generación de scripts de subplots y estilizado para producir figuras reproducibles en procesos batch de reporting.
- Educación y tutoriales: producción de ejemplos de código de plotting a partir de descripciones, útiles para material docente o documentación técnica.
- Evaluación de pipelines de código: al ser un modelo pequeño (20,9 mil millones de parámetros totales, cuantizable a MXFP4) puede servir como generador de código de dibujo en pruebas de sistemas de ejecución de código en sandbox.

## Benchmarks y rendimiento

Evaluación de ejecución sobre 57 prompts retenidos (30 de matplotlib, 27 de PIL), cada script ejecutado en un sandbox limpio con matplotlib headless/PIL y timeout de 90 s; se exige salida limpia y, en tareas PIL, la existencia de `output.png`.

| Modelo | Matplotlib (n=30) | PIL (n=27) | Global (n=57) |
|---|---|---|---|
| gpt-oss-20b-drawing-expert (LoRA fusionado) | 30/30 (100%) | 27/27 (100%) | 57/57 (100%) |
| gpt-oss-20b base | 11/30 (36,7%) | 9/27 (33,3%) | 20/57 (35,1%) |

Advertencia del autor: los prompts de evaluación están retenidos pero proceden del mismo generador que los datos de entrenamiento (mismas plantillas y distribución de fraseo), por lo que la métrica mide seguimiento de formato y generación de código válido en esa distribución, no generalización a estilos de tarea no vistos.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 13,9 GB en MXFP4 (8-bit); la inferencia en bf16 sobre la base requiere bastante más memoria, aunque no se publica una cifra exacta.
- Entrenamiento de referencia: una RTX PRO 6000 de 96 GB, con pico reservado de 48,9 GB.
- GPU recomendadas: para el checkpoint MXFP4, GPUs con al menos ~16-24 GB de VRAM; para bf16, A100/H100 o GPUs consumer de 48 GB o más. No se publican cifras de latencia ni throughput.
- Despliegue: transformers (con `device_map="cuda"` y `dtype="bfloat16"` en el ejemplo del autor) y vLLM. No se documenta soporte explícito de llama.cpp, Ollama ni TGI.
- Aviso importante: los checkpoints empaquetados en MXFP4 producen generaciones defectuosas en transformers 5.24.0 / torch 2.15.0+cu132; para inferencia fiable el autor recomienda cargar el adaptador Malajusa/gpt-oss-20b-drawing-expert-adapter sobre la base en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Rendimiento en la eval del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b-drawing-expert | 20.914.757.184 | no disponible | 57/57 (100%) | Apache 2.0 | Hugging Face |
| openai/gpt-oss-20b (base) | 20.914.757.184 (heredado) | no disponible | 20/57 (35,1%) | Apache 2.0 | Hugging Face |
| Alternativas de generación de código de plotting | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de comparaciones con otros modelos especializados en generación de código de dibujo en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento del 100 % se midió sobre prompts del mismo generador que los datos de entrenamiento; no hay evidencia de generalización a estilos de tarea o fraseo no vistos.
- Los checkpoints MXFP4 publicados generan salidas defectuosas en transformers 5.24.0 / torch 2.15.0+cu132; es un defecto del stack, mitigado en entrenamiento con `use_kernels=False`, y el autor recomienda usar el adaptador sobre la base en bf16.
- Especialización muy estrecha: está entrenado exclusivamente para código de matplotlib/seaborn y PIL/Pillow; no se documentan capacidades generales de razonamiento, matemáticas, tool calling ni agentes.
- No se documentan idiomas soportados; la evaluación y los datos están en inglés.
- Riesgo de alucinación en APIs de plotting: aunque los scripts de evaluación pasaron la ejecución, no se garantiza corrección semántica del gráfico ni de los datos generados.
- No se publican datos de sesgos, contexto máximo efectivo ni comportamiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de openai/gpt-oss-20b conviene revisar las condiciones del modelo base y de los datasets de entrenamiento (uno de ellos CC0, otro sin licencia indicada en la información disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Malajusa/gpt-oss-20b-drawing-expert
- Adaptador LoRA: https://huggingface.co/Malajusa/gpt-oss-20b-drawing-expert-adapter
- Dataset de entrenamiento: https://huggingface.co/datasets/Malajusa/programmatic-drawing-sft
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Dataset Escobar/pandas-matplotlib-seaborn-synth-validated: https://huggingface.co/datasets/Escobar/pandas-matplotlib-seaborn-synth-validated
- Dataset prashantss1404/Matplotlib_Seaborn_merged_prompt_completion_10k: https://huggingface.co/datasets/prashantss1404/Matplotlib_Seaborn_merged_prompt_completion_10k
- TRL (repositorio): https://github.com/huggingface/trl
- Receta de entrenamiento de referencia: https://github.com/huggingface/trl/tree/main/examples/sft_gpt_oss_chess
