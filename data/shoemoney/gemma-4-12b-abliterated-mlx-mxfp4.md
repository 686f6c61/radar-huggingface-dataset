# shoemoney/Gemma-4-12B-Abliterated-MLX-mxfp4

## Resumen

Este modelo es una cuantización en formato MXFP4 (4 bits) del modelo `huihui-ai/Huihui-gemma-4-12B-it-abliterated`, que a su vez es una versión "abliterated" (con eliminación de restricciones de censura) del modelo multimodal Gemma 4 12B de Google. El autor, shoemoney, ha convertido los pesos originales en BF16 a MXFP4 mediante la herramienta `mlx_vlm.convert`, sin realizar fine-tuning ni re-alineación. El resultado es un archivo de 6,4 GB optimizado para ejecutarse en hardware Apple Silicon a través de la librería MLX.

La relevancia de este modelo radica en que combina las capacidades multimodales de Gemma 4 (visión, audio y texto) con una cuantización agresiva que reduce significativamente el uso de memoria, permitiendo su ejecución en equipos Apple con memoria unificada moderada. Además, al ser una versión abliterated, elimina los mecanismos de rechazo de contenido, lo que lo hace atractivo para casos de uso que requieren generación sin filtros, aunque con los riesgos asociados. La licencia Apache 2.0 facilita su uso comercial y la atribución al modelo base está claramente indicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer multimodal, segun el reporte tecnico de Gemma 4) |
| Parametros totales | 2.250.090.544 (segun safetensors; el nombre sugiere 12B, posible discrepancia) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta de este modelo cuantizado no se detalla en la model card. Sin embargo, el modelo base `huihui-ai/Huihui-gemma-4-12B-it-abliterated` deriva de Google Gemma 4 12B, que segun el reporte tecnico de Gemma 4 es un modelo nativamente multimodal con arquitectura transformer (dense o MoE, segun el tamano). El proceso de creacion de este modelo consistio unicamente en la cuantizacion de los pesos BF16 a MXFP4 mediante `mlx_vlm.convert`, sin fine-tuning, merging ni re-alineacion. No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: al ser una version de Gemma 4, hereda capacidades de razonamiento y generacion de texto, aunque la cuantizacion puede degradar ligeramente la calidad.
- Comprension multimodal: el modelo base es un VLM (vision-language model), por lo que puede procesar imagenes y audio, aunque no se especifica en la model card si estas capacidades se mantienen tras la cuantizacion.
- Ausencia de censura: al ser abliterated, el modelo no aplica los mecanismos de rechazo de contenido tipicos de Gemma 4, lo que permite generar respuestas sobre temas sensibles sin restricciones.
- Eficiencia en Apple Silicon: la cuantizacion MXFP4 reduce el tamano a 6,4 GB, permitiendo su ejecucion en Macs con memoria unificada de 16 GB o superior.
- Soporte de tool calling y agentes: no se menciona en la informacion disponible; se desconoce si el modelo base los soporta y si la cuantizacion los preserva.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir textos, guiones o ideas para proyectos artisticos sin las limitaciones de censura habituales, siendo util para escritores o creativos que necesitan explorar temas controvertidos.
- Analisis de imagenes en investigacion: gracias a su naturaleza multimodal, puede describir o analizar imagenes en entornos academicos donde se requiere procesamiento visual sin filtros, como en estudios de contenido visual.
- Prototipado rapido en Apple Silicon: desarrolladores que trabajan en Macs pueden integrar este modelo en aplicaciones locales de generacion de texto o vision, aprovechando la cuantizacion para reducir el consumo de memoria.
- Experimentacion con modelos abliterated: investigadores interesados en estudiar el impacto de la eliminacion de censura en modelos multimodales pueden usar esta version como base para comparaciones.
- Despliegue en entornos con recursos limitados: al ocupar solo 6,4 GB, puede ejecutarse en portatiles Apple con 16 GB de RAM, facilitando demos o pruebas en equipos sin GPU dedicada.
- Generacion de respuestas en dominios especializados: en areas como medicina o derecho, donde las respuestas estandar suelen ser rechazadas por politicas de seguridad, este modelo puede ofrecer respuestas mas directas, aunque con riesgo de inexactitud.

## Benchmarks y rendimiento

La model card proporciona mediciones propias, no benchmarks estandarizados:

| Metrica | Valor |
|---|---|
| Tamano en disco | 6,40 GB |
| Perplexity (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 254,121 |
| Perplexity relativa al mejor rung de la familia | 1,82x |
| Throughput (1 peticion / 8 concurrentes) | 33,0 / 99,1 tok/s |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero al ser un modelo de 6,4 GB en disco, se estima que requiere al menos 8-10 GB de memoria unificada para inferencia en MLX.
- GPU recomendadas: disenado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD de forma nativa.
- Compatibilidad con consumer GPU: si, en Macs con 16 GB de RAM o mas, aunque el rendimiento dependera del chip.
- Opciones de despliegue: mediante `mlx-vlm` (libreria de MLX para modelos de vision-lenguaje). No se menciona soporte para vLLM, llama.cpp u Ollama en la model card, aunque podria adaptarse.
- Latencia y throughput: en el M3 Ultra, 33 tok/s con una peticion y 99 tok/s con 8 concurrentes. En chips menores, el rendimiento sera inferior.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Se podria comparar con el modelo original `google/gemma-4-12B` (sin cuantizar) y con otras cuantizaciones de la misma familia, pero no hay mediciones disponibles. La unica referencia es la perplexidad relativa dentro de la familia de cuantizaciones del mismo autor, que indica que esta version MXFP4 tiene 1,82x peor perplexidad que la mejor cuantizacion de la familia.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido ofensivo, sesgado o inapropiado, y no debe usarse en aplicaciones donde se requiera moderacion de contenido.
- La cuantizacion MXFP4 degrada la calidad del modelo, como refleja la perplexidad de 254,121, que es alta en comparacion con modelos sin cuantizar.
- No se dispone de informacion sobre sesgos especificos, pero al heredar de Gemma 4, puede presentar los sesgos tipicos de los modelos entrenados con datos web.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion al modelo base y a Google.
- No se garantiza el soporte de tool calling, agentes o funciones avanzadas, ya que no se mencionan en la documentacion.
- El modelo esta disenado exclusivamente para Apple Silicon; no funcionara en otras arquitecturas sin conversion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Gemma-4-12B-Abliterated-MLX-mxfp4
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B
- Reporte tecnico de Gemma 4: https://arxiv.org/html/2607.02770v1
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Version en Ollama: https://ollama.com/huihui_ai/gemma-4-abliterated
