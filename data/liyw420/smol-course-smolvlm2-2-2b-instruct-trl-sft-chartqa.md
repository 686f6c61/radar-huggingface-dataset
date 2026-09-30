# liyw420/smol-course-smolvlm2-2.2b-instruct-trl-sft-ChartQA

## Resumen

liyw420/smol-course-smolvlm2-2.2b-instruct-trl-sft-ChartQA es un ajuste fino (fine-tuning) supervisado del modelo de vision-lenguaje (VLM) HuggingFaceTB/SmolVLM2-2.2B-Instruct, publicado por el usuario liyw420. Se ha entrenado mediante SFT con la libreria TRL de Hugging Face, segun se indica en su model card. El nombre del repositorio sugiere que el ajuste se ha realizado sobre datos del conjunto ChartQA, orientado a preguntas y respuestas sobre graficos.

El modelo resuelve el problema de la comprension y el razonamiento visual sobre graficos y tablas: dado un grafico y una pregunta en lenguaje natural, genera una respuesta. Su tamano reducido (el modelo base se denomina 2.2B, es decir, aproximadamente 2,2 mil millones de parametros) lo hace adecuado para entornos con recursos limitados, incluyendo GPU de consumo.

Su relevancia es principalmente educativa y experimental, ya que forma parte de los ejercicios del smol-course de Hugging Face, que ensena a ajustar VLMs de forma eficiente con LoRA y SFT. Los pesos se publican en formato safetensors y el repositorio ocupa 0,1 GB. No consta licencia, idiomas, pipeline ni descargas en la informacion disponible, y el modelo es compatible con Inference Endpoints segun sus etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en HuggingFaceTB/SmolVLM2-2.2B-Instruct; detalles internos no disponibles |
| Parametros totales | ~2,2 mil millones (segun denominacion del modelo base; no confirmado de forma explicita en la informacion) |
| Parametros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" como marcador de posicion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del VLM HuggingFaceTB/SmolVLM2-2.2B-Instruct. Por tanto, hereda la arquitectura vision-lenguaje del modelo base, que combina componentes de vision y de lenguaje para procesar imagenes y texto de forma conjunta. No se proporcionan en la informacion disponible detalles sobre el numero de capas, dimensiones, tipo de atencion, codificador de vision ni el tokenizador concretos del modelo base.

El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) con la libreria TRL, version 1.14.0, sobre el conjunto de datos ChartQA segun indica el nombre del repositorio. Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.9.0+cu130, Datasets 5.0.1 y Tokenizers 0.23.2. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se detalla si el ajuste se aplico sobre todos los parametros o mediante tecnicas de eficiencia como LoRA, aunque el contexto del smol-course apunta al uso de LoRA.

## Capacidades

- Generacion de respuestas sobre graficos: el modelo esta especializado en tareas de preguntas y respuestas sobre graficos (ChartQA), lo que implica lectura de ejes, leyendas, valores y tendencias.
- Comprension de vision y lenguaje: al derivar de SmolVLM2-2.2B-Instruct, mantiene la capacidad multimodal de procesar imagenes junto con texto.
- Generacion de texto: capacidad heredada del modelo base para producir respuestas en lenguaje natural.
- Soportado por la libreria transformers, con ejemplo de uso mediante el pipeline de text-generation.
- Compatible con Inference Endpoints (etiqueta endpoints_compatible).
- No se ha confirmado en la informacion disponible soporte de tool calling, function calling, agentes, multi-step reasoning, ni un modo de razonamiento explicito (thinking mode).
- Idiomas soportados: no disponible.

## Casos de uso

- Respuestas sobre graficos en informes: dado un grafico de barras, lineas o sectores, el modelo puede responder preguntas del tipo "que categoria tiene el valor mas alto" o "cual es la tendencia entre 2020 y 2024", aprovechando su ajuste especifico en ChartQA.
- Extraccion de datos de figuras cientificas: en un pipeline de revision de articulos, el modelo puede resumir la informacion cuantitativa contenida en una figura y facilitar su indexacion.
- Asistencia en analisis de datos para no expertos: un usuario carga una captura de un cuadro de mando y formula preguntas en lenguaje natural para interpretar las metricas representadas.
- Automatizacion de informes financieros: procesamiento de graficos de evolucion de ingresos o cotizaciones para generar comentarios textuales de apoyo.
- Material didactico interactivo: en plataformas educativas, el modelo puede explicar graficos a estudiantes y responder dudas sobre los datos representados.
- Preprocesado en pipelines de document understanding: como modulo inicial que interpreta graficos embebidos en documentos antes de pasar la informacion a otro componente del sistema.
- Prototipado e investigacion: por su tamano reducido, sirve para experimentar con tecnicas de ajuste fino de VLMs en entornos academicos, en linea con el proposito del smol-course.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano de ~2,2 mil millones de parametros; valores orientativos, no confirmados por el autor):
  - bf16/fp16: aproximadamente 4,4 GB solo de pesos, con overhead en torno a 6-8 GB en total.
  - Cuantizacion de 8 bits: aproximadamente 2,2 GB de pesos, en torno a 4 GB en total.
  - Cuantizacion de 4 bits: aproximadamente 1,1-1,5 GB de pesos, en torno a 2-3 GB en total.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para ajuste fino segun el material del smol-course; para inferencia en precision reducida bastan GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o RTX 4090.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas de VRAM, especialmente con cuantizacion.
- El material del smol-course indica que se necesita una GPU con al menos 8 GB de VRAM para el entrenamiento; CPU y MPS pueden ejecutar exploracion de datos y formateo, pero el entrenamiento de modelos mas grandes probablemente fallara.
- Opciones de despliegue: transformers (nativo), Inference Endpoints (etiqueta endpoints_compatible). Compatibilidad con vLLM, TGI, llama.cpp u Ollama no confirmada; al no distribuirse pesos GGUF, llama.cpp y Ollama requeririan una conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| liyw420/smol-course-smolvlm2-2.2b-instruct-trl-sft-ChartQA | ~2,2 mil millones (heredado) | no disponible | no disponible | Ajuste SFT sobre ChartQA del modelo base |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | ~2,2 mil millones | no disponible | no disponible | Modelo base sobre el que se realiza el fine-tuning |
| Otras alternativas de VLM de ~2B (por ejemplo, de la familia Qwen2-VL o InternVL) | no disponible en la informacion proporcionada | no disponible | no disponible | No se dispone de datos verificados en la informacion para establecer una comparacion |

## Limitaciones y advertencias

- Riesgo de sobreajuste: al ser un ajuste fino especifico sobre ChartQA, puede degradar capacidades generales del modelo base fuera del dominio de graficos (olvido catastrofico), aunque esto no se ha medido en la informacion disponible.
- Sesgos conocidos: no disponible; no se ha publicado ninguna evaluacion de sesgos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir lecturas incorrectas de valores o etiquetas de un grafico, especialmente con imagenes de baja resolucion o graficos poco convencionales.
- Limitaciones de idioma: no se especifican idiomas soportados; el conjunto ChartQA suele estar en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Limitaciones de contexto: longitud de contexto no disponible.
- Licencia: no disponible; la model card incluye un marcador de posicion ("licence: license") sin terminos concretos, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- Madurez: el repositorio registra 0 descargas y 0 "likes", con un tamano de 0,1 GB, lo que sugiere un artefacto educativo o experimental sin validacion externa.
- Advertencia para produccion: al no haber benchmarks publicados ni licencia clara, no se recomienda su uso en produccion sin una evaluacion adicional propia.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/liyw420/smol-course-smolvlm2-2.2b-instruct-trl-sft-ChartQA
- Modelo base HuggingFaceTB/SmolVLM2-2.2B-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Ejercicios del smol-course sobre fine-tuning de SmolVLM2-2.2B-Instruct: https://huggingface.co/learn/smol-course/unit4/4
- Notebook del ejercicio (Colab): https://colab.research.google.com/github/huggingface/smol-course/blob/main/notebooks/4/4.ipynb
- Guia de fine-tuning de VLMs en el smol-course: https://github.com/huggingface/smol-course/blob/main/units/en/unit3/4.md
- Introduccion al fine-tuning de VLMs en el smol-course: https://github.com/huggingface/smol-course/blob/main/units/en/unit3/1.md
- Repositorio de TRL: https://github.com/huggingface/trl
