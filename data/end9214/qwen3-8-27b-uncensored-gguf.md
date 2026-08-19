# end9214/qwen3.8-27B-uncensored-gguf

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo **Qwen3.8 27B Uncensored**, preparadas por el usuario end9214 para su uso con llama.cpp y otros motores compatibles con GGUF. El modelo subyacente es una variante "uncensored" del Qwen3.8-27B, un modelo de lenguaje de 27 mil millones de parámetros desarrollado por la familia Qwen. La versión "uncensored" parece consistir en un ajuste del system prompt o una modificación del comportamiento para reducir las restricciones de seguridad, según se indica en el repositorio GitHub asociado, aunque no se proporcionan detalles técnicos sobre el proceso de modificación.

El repositorio ofrece once niveles de cuantización que van desde F16 (máxima calidad, ~52 GB) hasta Q2_K (compresión extrema, ~11 GB), lo que permite a los usuarios elegir el equilibrio adecuado entre calidad, uso de memoria y velocidad de inferencia según su hardware. El proyecto se encuentra en fase activa de cuantización y benchmarking, con planes de añadir más variantes IQ e imatrix. Es relevante porque facilita el despliegue local de un modelo de 27B con capacidades de visión y razonamiento (según fuentes externas sobre el modelo base) en hardware de consumo, algo que de otro modo sería inviable con los pesos en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 27B (transformer con visión y razonamiento según fuentes externas) |
| Parametros totales | 27.320.697.856 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificado en la model card; el modelo base Qwen3.8-27B tiene 256K según documentacion de Unsloth y 262K segun yottalabs.ai |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el modelo base de Qwen soporta multiples idiomas, pero no se detalla) |
| Licencia | no disponible en la model card; el modelo base es Apache 2.0 segun yottalabs.ai |
| Formato de pesos | GGUF (el repositorio contiene tambien safetensors del modelo original) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna ni el proceso de entrenamiento del modelo "uncensored". Se limita a indicar que la arquitectura es "Qwen3.8 27B" y que el repositorio contiene cuantizaciones GGUF generadas a partir de un archivo F16 original. Segun fuentes externas (Unsloth y yottalabs.ai), el modelo base Qwen3.8-27B es un transformer con un encoder de vision integrado y capacidades de razonamiento, con una ventana de contexto de aproximadamente 256K tokens. No se especifica si la variante "uncensored" ha sido sometida a fine-tuning adicional o si simplemente se ha modificado el system prompt; el repositorio GitHub menciona "a harvested uncensored SYSTEM pack", lo que sugiere que el cambio es a nivel de prompt, no de pesos.

Las cuantizaciones se generaron directamente desde el F16 GGUF original utilizando llama.cpp, evitando la degradacion acumulativa de re-cuantizar modelos ya cuantizados. La cuantizacion Q4_K_M resultante tiene una densidad de aproximadamente 4.92 BPW y una reduccion del 69% en tamaño de almacenamiento respecto al F16.

## Capacidades

- Generacion de texto y chat conversacional multi-turno (segun la etiqueta "conversational" del repositorio).
- Vision: el modelo base Qwen3.8-27B incluye un encoder de vision, lo que permite procesar imagenes (segun Unsloth y yottalabs.ai).
- Razonamiento: el modelo base tiene capacidades de razonamiento y "thinking mode" (segun Unsloth).
- Contexto largo: el modelo base soporta hasta 256K tokens de contexto (segun Unsloth) o 262K (segun yottalabs.ai), aunque no se confirma en la model card del repositorio.
- Generacion de codigo y tareas de agente: el modelo base destaca en "agentic coding" (segun Unsloth).
- La variante "uncensored" elimina o reduce las restricciones de seguridad del modelo original, permitiendo respuestas sin filtros en temas sensibles (segun el repositorio GitHub).

## Casos de uso

- Inferencia local en hardware de consumo: gracias a las cuantizaciones Q4_K_M (~16 GB) y superiores, el modelo puede ejecutarse en GPUs de gama media como RTX 4090 (24 GB VRAM) o incluso en CPU con suficiente RAM. Es adecuado para desarrolladores que necesitan un LLM potente sin depender de APIs externas.
- Chatbots sin restricciones de contenido: la variante "uncensored" permite construir asistentes conversacionales que responden a temas delicados sin evasivas, util para investigacion academica sobre comportamiento de modelos o para aplicaciones donde se requiere una expresion libre (siempre respetando la legalidad).
- Desarrollo de agentes con vision y razonamiento: el modelo base soporta vision y razonamiento, por lo que puede integrarse en pipelines de automatizacion que requieran comprender imagenes y tomar decisiones multi-paso.
- Benchmarking de cuantizaciones: el repositorio ofrece multiples niveles de cuantizacion del mismo modelo, lo que permite a investigadores comparar la degradacion de calidad, velocidad y uso de memoria entre formatos (Q2_K a F16) en un mismo hardware.
- Generacion de codigo asistida: con soporte para tool calling (segun el modelo base), puede utilizarse en entornos de desarrollo para autocompletar, revisar y generar fragmentos de codigo.
- Prototipado rapido de aplicaciones LLM: al estar disponible en formato GGUF, se puede integrar facilmente con llama.cpp, Ollama o llama-server para crear prototipos locales sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el benchmarking esta en curso y que se anadiran resultados de velocidad, uso de memoria y degradacion de calidad en el futuro. No se proporcionan cifras de MMLU, HumanEval, GSM8K u otros tests estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (segun el tamaño de los archivos GGUF):
  - F16: ~52 GB (requiere GPU de nivel profesional como A100 80GB o multiples GPUs)
  - Q8_0: ~26 GB (GPU con 32 GB VRAM, p.ej. A100 40GB o RTX 6000 Ada)
  - Q6_K: ~21-22 GB (GPU con 24 GB VRAM, p.ej. RTX 4090)
  - Q5_K_M: ~18-19 GB (GPU con 20-24 GB VRAM)
  - Q4_K_M: ~16 GB (GPU con 16-24 GB VRAM, p.ej. RTX 4080, RTX 4090)
  - Q3_K_M: ~13 GB (GPU con 16 GB VRAM, p.ej. RTX 3080 Ti)
  - Q2_K: ~11 GB (GPU con 12-16 GB VRAM)
- Si se ejecuta en CPU, se necesitan al menos 16 GB de RAM para Q4_K_M y proporcionalmente mas para cuantizaciones mayores.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama (segun el repositorio GitHub), y cualquier motor compatible con GGUF (llama-cpp-python, LM Studio, etc.).
- Latencia y throughput: no se proporcionan datos medidos. La velocidad dependera del hardware, la cuantizacion y la configuracion de offload de capas a GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 256K-262K | Si | Apache 2.0 | safetensors, GGUF |
| Qwen3.8-27B GGUF (end9214, este repo) | 27B | no especificado (heredado del base) | no especificado (heredado) | no disponible (base Apache 2.0) | GGUF |
| Qwen3.8-27B GGUF (unsloth) | 27B | 256K | Si | Apache 2.0 | GGUF |
| Qwen3.8-27B GGUF (ggml-org) | 27B | 256K | Si | Apache 2.0 | GGUF |

La diferencia principal de este repositorio frente a los de Unsloth y ggml-org es que la variante "uncensored" modifica el comportamiento del modelo (probablemente via system prompt) y ofrece un rango mas amplio de cuantizaciones (incluyendo Q3 y Q2). Los otros repositorios proporcionan cuantizaciones estandar del modelo original sin modificaciones.

## Limitaciones y advertencias

- La cuantizacion es inherentemente lossy: las versiones de menor bitrate (Q2_K, Q3_K) pueden presentar una degradacion notable en calidad de generacion, especialmente en tareas complejas como razonamiento o codigo.
- No se ha verificado el rendimiento real: el repositorio no incluye benchmarks medidos, por lo que las afirmaciones sobre calidad y velocidad son especulativas hasta que se publiquen resultados experimentales.
- La variante "uncensored" puede generar contenido inapropiado, ofensivo o ilegal. Su uso debe realizarse con responsabilidad y cumpliendo la legislacion aplicable.
- La licencia del modelo original no esta confirmada en la model card. Aunque fuentes externas indican Apache 2.0 para el modelo base, el repositorio no proporciona una licencia explicita para esta variante, y el disclaimer advierte que los terminos del modelo original siguen aplicando.
- No se especifican los idiomas soportados ni se garantiza un rendimiento multilingue consistente.
- El proyecto esta en fase activa: las cuantizaciones pueden actualizarse o corregirse, y los benchmarks prometidos aun no estan disponibles.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto muy reciente y sin validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/end9214/qwen3.8-27B-uncensored-gguf
- Repositorio GitHub (Wassimyounes01/qwen38-uncensored): https://github.com/Wassimyounes01/qwen38-uncensored
- GGUF de Unsloth para Qwen3.8-27B: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- GGUF de ggml-org para Qwen3.8-27B: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local en yottalabs.ai: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
