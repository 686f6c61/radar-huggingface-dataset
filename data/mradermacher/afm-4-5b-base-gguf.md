# mradermacher/AFM-4.5B-Base-GGUF

## Resumen

AFM-4.5B-Base-GGUF es una colección de archivos GGUF que cuantizan el modelo base AFM-4.5B-Base, desarrollado por Arcee AI. La cuantización ha sido realizada por mradermacher, un proveedor habitual de pesos GGUF, para facilitar la ejecución del modelo en hardware de consumo y en entornos con restricciones de memoria. El modelo original tiene 4.619.184.640 parámetros (aproximadamente 4,6 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

Esta versión en GGUF ofrece doce niveles de cuantización, desde Q2_K (2,0 GB) hasta f16 (9,3 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria según el hardware disponible. El modelo es multilingüe, con soporte para diez idiomas: inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino. Al tratarse de un modelo base, no está alineado para instrucciones ni chat, sino que está diseñado para completar texto y servir como base para fine-tuning.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 4,6B parámetros en entornos con GPUs de gama media o incluso solo CPU, gracias a las cuantizaciones de baja precisión. No se dispone de información adicional sobre la arquitectura interna ni sobre el entrenamiento del modelo original, por lo que varios apartados técnicos quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.619.184.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base AFM-4.5B-Base en la documentación disponible de esta cuantización. Se sabe que el modelo original está alojado en Hugging Face bajo el identificador `arcee-ai/AFM-4.5B-Base` y que utiliza la librería `transformers`, lo que sugiere una arquitectura transformer estándar, pero no se confirma el tipo exacto (denso, MoE, etc.) ni la longitud de contexto. Tampoco se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de alineación como RLHF o DPO.

La versión GGUF es una cuantización estática realizada por mradermacher, que convierte los pesos originales en formato safetensors a formato GGUF con diferentes precisiones. No se han aplicado técnicas de imatrix (activación) en esta versión; para quants con imatrix se remite a la variante `-i1-GGUF`. La cuantización se realizó con herramientas estándar del ecosistema llama.cpp.

## Capacidades

- Generación de texto autoregresiva en diez idiomas (inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino).
- Completado de texto y modelado de lenguaje, al ser un modelo base sin fine-tuning para instrucciones.
- Ejecución eficiente en CPU y GPU gracias a la cuantización GGUF, con soporte en motores como llama.cpp, Ollama y otros compatibles.
- No se especifican capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, ya que el modelo base no ha sido entrenado para ello.
- No se indica soporte para visión, audio u otras modalidades.

## Casos de uso

- Inferencia local en portátiles o estaciones de trabajo sin GPU dedicada: las cuantizaciones Q2_K (2,0 GB) y Q3_K_S (2,2 GB) permiten ejecutar el modelo en equipos con 4 GB de RAM o menos, usando llama.cpp u Ollama.
- Prototipado rápido de aplicaciones de generación de texto: al ser un modelo base, se puede utilizar para experimentar con completado de texto, generación de contenido o como punto de partida para fine-tuning en tareas específicas.
- Despliegue en producción con requisitos de latencia bajos: las cuantizaciones Q4_K_M (3,0 GB) y Q5_K_M (3,4 GB) ofrecen un buen equilibrio entre calidad y velocidad, adecuadas para servicios de generación de texto en tiempo real.
- Aplicaciones multilingües: su soporte para diez idiomas lo hace útil para tareas de traducción, generación de contenido en varios idiomas o chatbots que requieran cobertura lingüística amplia.
- Integración en pipelines de procesamiento de lenguaje natural: al ser compatible con el formato GGUF, puede integrarse fácilmente en sistemas que usan llama.cpp, como asistentes de escritura, resumidores de documentos o herramientas de análisis de texto.
- Fine-tuning sobre dominios específicos: aunque esta versión está cuantizada, el modelo base original permite fine-tuning; las cuantizaciones de mayor precisión (Q8_0 o f16) pueden servir para evaluar el comportamiento antes de decidir el nivel de compresión óptimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se han comparado los distintos niveles de cuantización en términos de perplejidad o degradación de calidad, aunque la model card incluye referencias generales a gráficos de comparación de quants (enlace a nethype.de) que no son específicos de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, se necesitan aproximadamente:
  - Q2_K: 2,0 GB
  - Q3_K_S: 2,2 GB
  - Q4_K_S: 2,8 GB
  - Q4_K_M: 3,0 GB
  - Q5_K_M: 3,4 GB
  - Q6_K: 3,9 GB
  - Q8_0: 5,0 GB
  - f16: 9,3 GB
- GPUs recomendadas: las cuantizaciones de hasta 3,4 GB caben en GPUs con 4 GB de VRAM, como la NVIDIA GTX 1650 o RTX 3050. Para Q8_0 (5,0 GB) se necesita una GPU con 6 GB o más, como la RTX 2060 o RTX 3060. La versión f16 (9,3 GB) requiere al menos 10 GB de VRAM, por lo que se recomienda una RTX 3080 o superior.
- Ejecución en CPU: las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse en CPU con 8 GB de RAM, aunque la velocidad será limitada.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor que soporte GGUF.
- Latencia y throughput: no se han publicado datos específicos. En general, las cuantizaciones más bajas (Q2_K, Q3_K) ofrecen mayor velocidad pero menor calidad; Q4_K_M suele ser el punto óptimo para uso interactivo en GPU de gama media.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de tamaño similar. No se conocen los resultados de benchmarks ni las características internas del modelo base AFM-4.5B-Base. Se recomienda consultar la ficha del modelo original en Hugging Face para obtener datos comparativos, aunque no se ha accedido a ella en esta búsqueda.

## Limitaciones y advertencias

- Al ser un modelo base, no está entrenado para seguir instrucciones ni mantener diálogos coherentes; puede producir respuestas irrelevantes o repetitivas si se usa directamente como chatbot.
- La cuantización degrada la calidad del modelo, especialmente en niveles bajos como Q2_K o Q3_K. Para tareas que requieran alta precisión, se recomienda usar Q8_0 o f16.
- No se ha especificado la longitud de contexto máxima; es probable que sea limitada (típicamente 2048 o 4096 tokens en modelos de este tamaño), lo que puede restringir su uso en tareas con documentos largos.
- El modelo puede reflejar sesgos presentes en sus datos de entrenamiento, aunque no se han documentado sesgos específicos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de generación abierta.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero no se ofrece garantía sobre el comportamiento del modelo en producción.
- Los archivos GGUF son cuantizaciones estáticas; para un mejor rendimiento con activaciones se recomienda la versión con imatrix (`-i1-GGUF`).

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/AFM-4.5B-Base-GGUF
- Modelo base original: https://huggingface.co/arcee-ai/AFM-4.5B-Base
- Página de descarga y listado de quants: https://hf.tst.eu/model#AFM-4.5B-Base-GGUF
- Versión con imatrix: https://huggingface.co/mradermacher/AFM-4.5B-Base-i1-GGUF
