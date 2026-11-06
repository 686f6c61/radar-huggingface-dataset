# mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic, publicada por mradermacher. Se trata de una variante "abliterated" o "decensored" del conocido Qwen2.5-32B-Instruct de Alibaba, en la que se ha aplicado una tecnica de modificacion de pesos para reducir los rechazos del modelo ante peticiones que el modelo original rechazaria, manteniendo en la medida de lo posible las capacidades del modelo base.

El modelo base subyacente es un transformer denso de 32.763.876.352 parametros (aproximadamente 32,8 mil millones), con la arquitectura y el contexto de Qwen2.5-32B-Instruct, es decir, una ventana de contexto de 32.768 tokens (segun las especificaciones publicas del modelo original de Qwen) y soporte nativo de tool calling y generacion de codigo. La cuantizacion la realiza mradermacher con el metodo imatrix (importance matrix), lo que permite generar una amplia gama de tipos de cuantizacion desde IQ1_S hasta Q6_K, facilitando su ejecucion en hardware de consumo.

La relevancia de esta ficha radica en que ofrece una version cuantizada y sin censura "blanda" de un modelo de 32B, pensada para investigadores y desarrolladores que necesitan un modelo local de gran tamano con alta capacidad de razonamiento y generacion, sin las restricciones de rechazo del modelo original. No obstante, al ser una modificacion no oficial, no cuenta con garantias de calidad ni con evaluaciones publicadas por el autor, y su uso en produccion requiere una validacion cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 (32,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (segun la model card) |
| Idiomas soportados | Ingles (segun la model card; el modelo base Qwen2.5 soporta multiples idiomas, pero la ficha declara solo en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer denso con atencion por ventanas deslizantes combinada con atencion completa, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo original fue entrenado por Alibaba con un corpus multilingue de varios billones de tokens y posteriormente afinado con instrucciones y preferencias (RLHF/DPO) para alineamiento conversacional. Sin embargo, la informacion proporcionada no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset del modelo base.

La modificacion "MPOA-heretic" aplicada por richardyoung no viene documentada en detalle en la informacion disponible. Por el nombre y las etiquetas ("abliterated", "decensored", "uncensored"), se trata de una tecnica de edicion de pesos orientada a eliminar la direccion de rechazo en el espacio de activaciones, similar a las aproximaciones de abliteration. El proceso de cuantizacion de mradermacher utiliza una importance matrix (imatrix) generada a partir de un corpus de calibracion, lo que mejora la calidad de las cuantizaciones de baja precision (IQ-quants) respecto a las cuantizaciones estaticas. No se dispone de informacion sobre el corpus de calibracion ni sobre evaluaciones de degradacion por cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de contexto largo (hasta 32.768 tokens).
- Razonamiento y resolucion de problemas de nivel medio-alto, heredado de Qwen2.5-32B-Instruct.
- Generacion de codigo en multiples lenguajes de programacion.
- Matematicas y calculo simbolico basico.
- Tool calling / function calling (soportado por el modelo base Qwen2.5-Instruct).
- Capacidad de seguir instrucciones complejas y formatos estructurados (JSON, tablas, etc.).
- Modo "sin censura": reduccion de rechazos ante peticiones que el modelo original declinaria, segun las etiquetas del autor.
- Capacidades multilingues limitadas segun la model card (solo declara ingles), aunque el modelo base Qwen2.5 soporta chino, espanol, frances, aleman, etc.
- No se documentan capacidades de vision ni audio en esta variante.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM de 32B sin las capas de rechazo, util para analizar sesgos, robustez y eficacia de tecnicas de abliteration en entornos controlados.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo original rechazaria la peticion; adecuado por su tamano para mantener coherencia en textos largos.
- Asistente de codigo local: con 32B de parametros y soporte de tool calling, puede integrarse en entornos de desarrollo offline para autocompletado, explicacion de codigo y generacion de tests, ejecutandose en GGUF con llama.cpp u Ollama.
- Analisis de documentos largos: gracias a los 32.768 tokens de contexto, puede resumir o extraer informacion de contratos, articulos o informes extensos en una sola pasada.
- Prototipado de agentes conversacionales: su capacidad de seguir instrucciones y de invocar funciones permite construir agentes multi-paso para tareas de automatizacion, con la ventaja de ejecucion local y sin dependencia de API.
- Generacion de datos sinteticos para fine-tuning: util para crear datasets de instrucciones o conversaciones en dominios donde se necesita diversidad sin filtros de seguridad, siempre con revision posterior.
- Chat de atencion al cliente en dominio tecnico: puede gestionar conversaciones multi-turno con contexto largo y derivar a herramientas externas mediante function calling, aunque requiere validacion por su naturaleza no oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de degradacion por cuantizacion, y la model card del modelo base modificado tampoco aporta metricas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q6_K: ~27-28 GB
  - Q5_K_M: ~23-24 GB
  - Q4_K_M: ~20-21 GB
  - Q4_K_S: ~19-20 GB
  - Q3_K_M: ~16-17 GB
  - IQ2_M: ~12-13 GB
  - IQ1_S: ~8-9 GB
- GPU recomendadas:
  - Inferencia completa en una sola GPU: A100 80GB, H100 80GB, RTX 6000 Ada 48GB, RTX 4090 24GB (solo cuantizaciones Q4_K_M o inferiores).
  - Multi-GPU: 2x RTX 4090 (24GB cada una) para Q5_K_M o Q6_K.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24GB) con cuantizaciones Q4_K_M o menores; en GPUs de 16GB solo con IQ2/IQ3 y posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. Para el modelo base en safetensors: vLLM, TGI, Transformers.
- Latencia y throughput: no disponibles. Dependen fuertemente de la GPU, la cuantizacion y el backend; en una RTX 4090 con Q4_K_M se puede esperar un throughput moderado (decenas de tokens por segundo), pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF (este) | 32,8B | 32.768 | Apache 2.0 | GGUF | Version abliterated cuantizada, sin benchmarks publicados |
| Qwen2.5-32B-Instruct (original) | 32,8B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo oficial con alineamiento completo y benchmarks publicos |
| richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic | 32,8B | 32.768 | Apache 2.0 | safetensors | Modelo base modificado sin cuantizar, origen de esta ficha |
| mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF | 32,8B | 32.768 | Apache 2.0 | GGUF | Cuantizaciones estaticas (sin imatrix) del mismo modelo base |

## Limitaciones y advertencias

- Al ser una modificacion no oficial, no hay garantia de que las capacidades del modelo original se conserven intactas; la abliteration puede degradar el razonamiento, la coherencia o la calidad en tareas complejas.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones de baja precision (IQ1, IQ2) y en el modelo modificado en general.
- La model card declara solo ingles como idioma soportado, aunque el modelo base es multilingue; el rendimiento en otros idiomas no esta verificado.
- El modelo esta disenado para reducir rechazos, lo que implica que puede generar contenido inapropiado, ofensivo o danino; no es apto para aplicaciones de cara al publico sin filtros adicionales.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante "decensored" puede acarrear riesgos reputacionales y de cumplimiento normativo (por ejemplo, en la UE con la AI Act); se recomienda revision legal.
- No hay evaluaciones de seguridad ni de sesgos publicadas para esta variante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El tamano del repo (150,4 GB) incluye todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- No se dispone de informacion sobre el corpus de calibracion del imatrix ni sobre la metodologia exacta de la modificacion heretic.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF
- Modelo base modificado: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
