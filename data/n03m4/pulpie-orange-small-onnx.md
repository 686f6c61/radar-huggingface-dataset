# N03m4/pulpie-orange-small-onnx

## Resumen
`pulpie-orange-small-onnx` es la exportación cuantizada a ONNX de `pulpie-small`, un clasificador de tokens basado en el encoder EuroBERT. Lo publica el usuario N03m4 en HuggingFace y su propósito no es generar texto, sino asignar una etiqueta a cada token de una secuencia de entrada: la cabeza de clasificación devuelve `logits` con forma `[batch, seq, 2]`, es decir, un problema de etiquetado binario por token.
El modelo resuelve el problema de desplegar un encoder multilingüe de etiquetado en entornos donde no se quiere depender de PyTorch: el grafo es ONNX puro, se ejecuta con ONNX Runtime y admite batch dinámico de hasta 64 y secuencias de hasta 8192 tokens. La cuantización int8 weight-only con bloques de 32 reduce el peso del repositorio a 0,3 GB, lo que lo hace viable en CPU y en GPU de consumo.
Es relevante ahora porque la mayoría de alternativas para token classification exigen pesos safetensors y un runtime de Python, mientras que esta exportación está pensada para inferencia embebida o de alto volumen con ONNX Runtime. Como contrapartida, la información publicada es muy escasa: no hay datos de entrenamiento, licencia, idiomas ni benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo EuroBERT con cabeza de clasificacion de tokens (2 etiquetas por token) |
| Parametros totales | no disponible (la model card no los indica; el sufijo "small" sugiere una variante pequena del encoder EuroBERT) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 8192 tokens en el grafo ONNX exportado (dimension dinamica); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | int8 weight-only con bloques de 32 (`MatMulNBits`); embeddings de tokens en bf16; cabeza clasificadora en fp32; existe tambien exportacion fp32 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (opset 17); repositorio de 0,3 GB; sin safetensors, GGUF ni otros formatos publicados |
| Pipeline | token-classification |
| Entradas del grafo | `input_ids` y `attention_mask`, int64, forma `[batch, seq]` |
| Salidas del grafo | `logits` con forma `[batch, seq, 2]` |
| Limites dinamicos | batch <= 64, seq <= 8192 |

## Arquitectura y entrenamiento
La model card describe únicamente el proceso de exportación, no el entrenamiento. El grafo ONNX tiene dos entradas (`input_ids` y `attention_mask`, ambas int64 con forma `[batch, seq]`) y calcula internamente `position_ids = arange(seq)`, lo que reproduce el comportamiento por defecto de EuroBERT. La receta es: exportación fp32 con `torch.onnx` en opset 17 con ejes dinámicos (batch <= 64, seq <= 8192), conversión de los embeddings de tokens a bf16 y cuantización int8 weight-only de las multiplicaciones matriciales en bloques de 32 mediante `MatMulNBits`, dejando la cabeza clasificadora en fp32.
La única validación numérica publicada es de paridad, no de calidad: la diferencia máxima absoluta entre el ONNX fp32 y la implementación en PyTorch es de aproximadamente 8e-06, y la coincidencia de `argmax` de la versión int8 es del 100 % en secuencias cortas y del 99,77 % en secuencias largas. No hay información sobre número de tokens de entrenamiento, composición del dataset, idiomas, técnicas de ajuste (RLHF, DPO u otras) ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Clasificación de tokens (token classification) con dos clases por token, apta para esquemas binarios tipo BIO de una sola entidad o etiquetado presencia/ausencia.
- Procesamiento de secuencias largas: el grafo admite hasta 8192 tokens, muy por encima de los 512 habituales en encoders BERT clásicos.
- Inferencia por lotes con batch dinámico de hasta 64 secuencias.
- Ejecución con ONNX Runtime mediante `ORTModelForTokenClassification` de Optimum, con `trust_remote_code=True`.
- Exportación adicional en fp32 para los casos en los que se necesita máxima fidelidad numérica.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo "thinking": es un encoder discriminativo de una sola pasada.
- Capacidades multilingües: no disponible (la model card no documenta los idiomas, aunque el encoder EuroBERT del que deriva está orientado a lenguas europeas).

## Casos de uso
- Etiquetado de páginas HTML: el ejemplo de la propia model card usa una cadena de HTML como entrada, de modo que el modelo puede marcar qué tokens pertenecen a la entidad objetivo directamente sobre el marcado, sin necesidad de un paso previo de limpieza profundo.
- Detección de información personal identificable (PII): con dos etiquetas por token se puede entrenar o usar como etiquetador binario para separar fragmentos sensibles del resto y alimentar un pipeline de anonimización antes de indexar en un RAG.
- Preprocesado de corpus para búsqueda: marcar tokens relevantes y descartar ruido de navegación, plantillas o boilerplate en grandes volúmenes de documentos, aprovechando los 8192 tokens de ventana para no trocear páginas largas.
- Inferencia en CPU on-premise: al ser ONNX int8 de 0,3 GB, se puede desplegar en servidores sin GPU o en entornos con requisitos de soberanía del dato, con ONNX Runtime como único runtime.
- Etiquetado por lotes de grandes corpus: el batch dinámico de hasta 64 y la ventana de 8192 permiten procesar millones de secuencias en trabajos offline con un throughput alto por máquina.
- Moderación o filtrado a nivel de token: marcar fragmentos concretos dentro de un texto (por ejemplo, spans que cumplen o incumplen una política) sin necesidad de un modelo generativo, lo que reduce coste y latencia.
- Microservicio REST de etiquetado: exposición del grafo mediante ONNX Runtime Server o un wrapper FastAPI, con el mismo artefacto para desarrollo y producción y sin dependencia de PyTorch en el contenedor.
- Validación de calidad en ETL: uso del etiquetador como comprobador de campos mal formados o de secciones ausentes en pipelines de ingesta de datos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de paridad entre la exportación y el modelo original, que se recogen aquí y no deben interpretarse como medidas de calidad de la tarea:

| Metrica de paridad | Valor |
|---|---|
| ONNX fp32 frente a PyTorch, max absolute difference | ~8e-06 |
| Coincidencia de argmax int8 frente a fp32, secuencias cortas | 100 % |
| Coincidencia de argmax int8 frente a fp32, secuencias largas | 99,77 % |

## Requisitos de hardware
- VRAM estimada para inferencia: a partir del tamano del repositorio (0,3 GB de pesos int8) se puede estimar un consumo de pesos en torno a 0,3-0,5 GB, mas activaciones que crecen con la longitud de secuencia; para seq = 8192 las activaciones son el termino dominante. No hay cifras publicadas, por lo que son estimaciones, no datos medidos.
- El numero total de parametros no esta disponible, de modo que cualquier calculo de VRAM basado en parametros seria especulativo.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente para secuencias cortas o medias; para lotes grandes con secuencias de 8192 tokens conviene disponer de 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4). No se han publicado pruebas en A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y tambien en CPU, dado el reducido tamano del artefacto int8.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java) con `ORTModelForTokenClassification` de Optimum; ONNX Runtime Server o un servicio propio con FastAPI; ejecucion en CPU para lotes offline. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni se distribuye en GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| pulpie-orange-small-onnx | no disponible | hasta 8192 en el grafo ONNX | ONNX int8 weight-only (block-32) y export fp32 | no disponible | 2 etiquetas por token; sin benchmarks de calidad publicados |
| pulpie-small (modelo de origen, sin cuantizar) | no disponible | no disponible | pesos originales (formato no indicado) | no disponible | Referencia de paridad; la model card no aporta enlaces ni especificaciones |
| Encoders multilingues tipo XLM-RoBERTa base (alternativa habitual para token classification) | ~278 M segun documentacion publica del modelo | 512 tokens | safetensors, con cuantizaciones de la comunidad | MIT segun documentacion publica | Cobertura multilingue amplia y ecosistema maduro, pero ventana de contexto mucho menor |
| Encoders ligeros tipo DistilBERT multilingue (alternativa para inferencia en CPU) | ~135 M segun documentacion publica del modelo | 512 tokens | safetensors, ONNX generado por la comunidad | Apache 2.0 segun documentacion publica | Mas rapido en CPU, pero contexto limitado a 512 tokens |

La comparacion es necesariamente cualitativa: al no existir benchmarks de calidad ni datos de parametros, licencia o idiomas para `pulpie-orange-small-onnx`, no es posible establecer una comparacion cuantitativa fiable frente a estas alternativas.

## Limitaciones y advertencias
- Licencia no disponible: sin una licencia explicita no se puede confirmar que el uso comercial este permitido; conviene contactar con el autor antes de integrarlo en produccion.
- Idiomas no documentados: no se puede asumir cobertura multilingue aunque el encoder base EuroBERT este orientado a lenguas europeas.
- Dataset de entrenamiento desconocido: no se puede evaluar que sesgos contiene el modelo ni sobre que dominio fue ajustado; los sesgos son, por tanto, no disponibles.
- Riesgo de alucinacion: bajo en el sentido generativo, ya que el modelo no produce texto libre; el riesgo real es de falsos positivos y falsos negativos a nivel de token.
- Etiquetado binario: con solo dos clases de salida, el modelo no cubre esquemas NER con multiples tipos de entidad sin un reentrenamiento de la cabeza.
- Perdida de fidelidad en secuencias largas: la coincidencia de argmax de la version int8 baja al 99,77 % en secuencias largas, lo que implica discrepancias puntuales frente al modelo fp32.
- Truncamiento a 8192 tokens: las secuencias mas largas deben trocearse, con el consiguiente riesgo de partir entidades en la frontera entre fragmentos.
- Dependencia de `trust_remote_code=True`: la carga implica ejecutar codigo personalizado del repositorio, algo que debe auditarse en entornos con requisitos estrictos de seguridad.
- Formato unico: al distribuirse solo en ONNX, no se puede usar con los runtimes mas habituales para modelos generativos ni con herramientas que esperen GGUF o safetensors.
- Sin cifras de latencia ni throughput publicadas, no es posible dimensionar un despliegue en produccion sin hacer una prueba de carga propia.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/N03m4/pulpie-orange-small-onnx
- Modelo de origen citado en la model card: `pulpie-small` (sin enlace disponible en la informacion proporcionada)
- ONNX Runtime (runtime mencionado en la model card): https://github.com/microsoft/onnxruntime
- Optimum (libreria usada en el ejemplo de inferencia): https://github.com/huggingface/optimum
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada.
