# batmac/gradient-ai-text-detector-onnx

## Resumen

`batmac/gradient-ai-text-detector-onnx` es una exportación a ONNX del clasificador binario `ShantanuT01/gradient-ai-text-detector`, un modelo basado en DeBERTa-v3-large que estima la probabilidad de que un texto haya sido generado por IA. Lo publica el usuario de HuggingFace `batmac` y su rasgo diferencial es el formato: en lugar de pesos PyTorch, ofrece tres variantes ONNX (fp32, fp16 y q4) listas para `transformers.js`, de modo que el modelo puede ejecutarse íntegramente en el navegador sin servidor de inferencia.

El modelo original es un clasificador de una sola etiqueta (`num_labels = 1`): emite un único logit y es el llamador quien debe aplicar una sigmoide para obtener P(AI). La model card advierte explícitamente de que no se use el pipeline `text-classification` de transformers.js, porque aplica softmax sobre ese logit único y devuelve `score: 1` para cualquier entrada. El resultado no es una probabilidad de autoría calibrada, según advierte la propia documentación heredada del modelo original.

El interés actual de esta ficha es doble. Por un lado, es un ejemplo de cadena de cuantización poco habitual: el q4 combina `MatMulNBits` int4 con embeddings en int8 dinámico y el resto en fp16, y la model card documenta que un int8 dinámico previo resultó a la vez más grande (612 MB) y unas cinco veces menos preciso (deriva de 0,30 en la zona media), por lo que fue retirado. Por otro, permite desplegar detección de texto generado por IA en cliente, con los beneficios de privacidad y coste que eso implica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large), clasificación binaria con una única etiqueta (`num_labels = 1`) |
| Parametros totales | no disponible (la model card no los cifra; arquitectura base DeBERTa-v3-large) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (según el ejemplo de uso de la model card, con `padding` y `truncation`) |
| Tipos de cuantizacion | fp32 (referencia), fp16 y q4 (int4 weight-only, por defecto); el int8 dinámico de 612 MB fue retirado |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (heredada del modelo original) |
| Formato de pesos | ONNX, opset 17 |
| Entradas del grafo | `input_ids` y `attention_mask` únicamente |
| Dimensiones dinámicas | batch y secuencia dinámicas |
| Salida | un único logit; requiere sigmoide por parte del llamador |
| Librería declarada | transformers.js |
| Tamano del repositorio | 3,7 GB |

## Arquitectura y entrenamiento

Se trata de un encoder transformer DeBERTa-v3-large configurado como clasificador binario de texto generado por IA. La model card de esta exportación no documenta el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la ficha de `ShantanuT01/gradient-ai-text-detector` y no están disponibles en la información proporcionada.

La aportación técnica de esta ficha es la cadena de exportación y cuantización, documentada en detalle. Los pesos se exportaron con `optimum` a opset 17, con dimensiones de batch y secuencia dinámicas y solo dos entradas (`input_ids`, `attention_mask`). La variante fp16 es una conversión directa con `convert_float_to_float16` y `keep_io_types`. La variante q4 (la predeterminada) compone tres pasos, todos *weight-only*, de modo que las activaciones se mantienen en mayor precisión: (1) `MatMulNBits` int4 con redondeo a la más cercana y tamaño de grupo 32 para las multiplicaciones de matrices; (2) `quantize_dynamic` restringido a las operaciones `Gather` para la tabla de embeddings en int8; y (3) `convert_float_to_float16` para el resto, bloqueando las operaciones int8/QDQ y `MatMulNBits`. La validación se hizo comparando logits contra el modelo PyTorch original en fp32: la exportación fp32 coincide hasta 1,5e-05, y se comprobó la deriva de puntuación y la ausencia de cambios de veredicto en pasajes cercanos al umbral 0,5.

## Capacidades

- Clasificación binaria de texto: devuelve un logit que, tras aplicar sigmoide, se interpreta como P(AI).
- Detección de texto generado por IA en inglés, orientada a fragmentos de hasta 512 tokens.
- Inferencia en navegador sin servidor mediante transformers.js, con soporte de WebGPU/WASM según el entorno de ejecución.
- Ejecución en Node.js y en cualquier runtime compatible con ONNX Runtime, al ser un grafo ONNX estándar de opset 17.
- Procesamiento por lotes aprovechando las dimensiones dinámicas de batch y secuencia.
- Tres niveles de compromiso tamaño/precisión intercambiables en el momento de la carga mediante el parámetro `dtype`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un clasificador, no un modelo generativo.
- No dispone de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el modelo está declarado únicamente para inglés.

## Casos de uso

- Moderación de contenido en foros y redes: clasificar publicaciones entrantes y marcar aquellas con P(AI) alta para revisión, ejecutando el modelo q4 (408 MB) en el cliente o en un servicio ligero de CPU.
- Filtrado de reseñas y opiniones en comercio electrónico: detectar reseñas sintéticas generadas en masa antes de que entren en los sistemas de reputación, con inferencia por lotes sobre lotes de reseñas truncadas a 512 tokens.
- Curación de datasets de entrenamiento: etiquetar corpus web o internos para eliminar o separar texto sintético antes de usarlo como datos de preentrenamiento o ajuste fino.
- Extensiones de navegador con privacidad por diseño: al ser un modelo ONNX para transformers.js, el texto del usuario no necesita salir del dispositivo, lo que evita enviar contenido sensible a un servidor.
- Triaje previo a verificación humana en redacciones y equipos de fact-checking: usar la puntuación como señal de priorización, nunca como veredicto automático, dado que la propia model card desaconseja decisiones de alto impacto basadas solo en P(AI).
- Detección en plataformas educativas: combinar la puntuación con revisión docente y metadatos de proceso de escritura, tratando la salida como indicio y no como prueba.
- Normalización de pipelines de datos en tiempo real: integrar el grafo ONNX en un servicio de ingestión que descarte o marque documentos sintéticos con una latencia mínima, dado el tamaño reducido de las variantes cuantizadas.
- Análisis de corpus largos mediante troceado: dividir documentos de más de 512 tokens en fragmentos, puntuar cada uno y agregar (media, máximo o proporción de fragmentos por encima del umbral), ya que el modelo no procesa secuencias mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay datos de MMLU, HumanEval, GSM8K ni de conjuntos de detección como RAID o similares). Lo único documentado son medidas de fidelidad de la cuantización respecto a la exportación fp32, que se recogen a continuación y no deben interpretarse como rendimiento en tareas de detección.

| Archivo | Tamano | `dtype` | Precisión frente a fp32 |
|---|---|---|---|
| `onnx/model.onnx` | 1661 MB | fp32 | referencia (logits coinciden con PyTorch hasta 1,5e-05) |
| `onnx/model_fp16.onnx` | 832 MB | fp16 | delta máximo de P de 0,0004 sobre 12 pasajes |
| `onnx/model_q4.onnx` | 408 MB | q4 | delta máximo de P de 0,06 sobre 12 pasajes; sin cambios de veredicto con umbral 0,5 en los 12 pasajes de prueba |
| `onnx/model_quantized.onnx` | 612 MB | int8 dinámico (retirado) | deriva de 0,30 en la zona media; retirado por ser mayor y menos preciso que q4 |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,41 GB para q4, 0,83 GB para fp16 y 1,66 GB para fp32, a lo que hay que sumar activaciones y memoria del runtime.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, GTX 1660 o incluso iGPU con WebGPU; también puede ejecutarse en CPU, dado el tamaño de un encoder de este tipo.
- GPU de datacenter (A100, H100) no son necesarias para una sola instancia; solo tendrían sentido para servir lotes muy grandes o muchas réplicas concurrentes.
- Despliegue en navegador mediante transformers.js (con WebGPU o WASM) y en Node.js con el mismo paquete; también es posible servirlo con ONNX Runtime, Runtime Web o cualquier solución que consuma grafos ONNX de opset 17.
- vLLM, TGI o llama.cpp no aparecen documentados como vías de despliegue en la información proporcionada; están orientados a modelos generativos, no a este clasificador.
- Latencia y throughput: no disponibles. La model card solo indica que q4 ocupa la mitad que fp16 manteniéndose dentro de 0,06 de P respecto a la referencia, sin cifras de latencia.
- El presupuesto de memoria es sensible al tamaño de lote y a la longitud de secuencia, ya que ambas dimensiones del grafo son dinámicas.

## Comparativa con modelos similares

No hay datos de rendimiento frente a otros detectores de texto generado en la información proporcionada, por lo que no es posible comparar con alternativas de la misma categoría (por ejemplo, clasificadores tipo RoBERTa entrenados para detección de texto sintético). Lo que sí se puede comparar es el propio artefacto consigo mismo y con el modelo del que deriva:

| Modelo / variante | Formato | Tamano | Precisión relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `batmac/gradient-ai-text-detector-onnx` (q4) | ONNX, int4 weight-only | 408 MB | delta máximo de P 0,06 frente a fp32 | MIT | HuggingFace, pensado para transformers.js |
| `batmac/gradient-ai-text-detector-onnx` (fp16) | ONNX, fp16 | 832 MB | delta máximo de P 0,0004 frente a fp32 | MIT | HuggingFace, pensado para transformers.js |
| `batmac/gradient-ai-text-detector-onnx` (fp32) | ONNX, fp32 | 1661 MB | referencia (1,5e-05 frente a PyTorch) | MIT | HuggingFace, pensado para transformers.js |
| `ShantanuT01/gradient-ai-text-detector` | PyTorch | no disponible | modelo de origen de la cuantización | MIT (heredada) | HuggingFace |

## Limitaciones y advertencias

- P(AI) no es una probabilidad de autoría calibrada; la model card del modelo original desaconseja explícitamente basar en ella decisiones de alto impacto.
- Riesgo de falsos positivos sobre texto humano con estilo formulaico o muy uniforme, y de falsos negativos sobre texto generado editado o reescrito.
- Idioma limitado a inglés: no está declarado soporte para castellano ni para ninguna otra lengua.
- Ventana de 512 tokens: los documentos largos requieren troceado y una estrategia de agregación, con la pérdida de contexto que eso implica.
- No se debe usar el pipeline `text-classification` de transformers.js: aplica softmax sobre un logit único y devuelve `score: 1` para cualquier entrada. Hay que aplicar sigmoide manualmente sobre el logit.
- Ausencia de benchmarks publicados: cualquier umbral de decisión en producción deberá calibrarse con datos propios.
- La cuantización q4 introduce una deriva de hasta 0,06 en la probabilidad estimada (y 0,0004 en fp16); para puntuaciones cercanas al umbral puede ser preferible fp16 o fp32.
- La variante int8 dinámica fue retirada por su mal comportamiento (deriva de 0,30); no debe reintroducirse sin revalidar.
- Licencia MIT, por lo que se permite uso comercial, pero esa licencia se hereda del modelo original y su cumplimiento depende de la ficha original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Las fechas de creación y actualización del repositorio figuran como septiembre de 2026, posteriores a la fecha habitual de publicación; conviene verificarlas en la ficha original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/batmac/gradient-ai-text-detector-onnx
- Modelo base (PyTorch): https://huggingface.co/ShantanuT01/gradient-ai-text-detector
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Búsqueda web: los resultados obtenidos no contienen enlaces relevantes para este modelo (dominios de ChatGPT y un artículo de arXiv sobre IA en ciencia de materiales sin relación). No se dispone de paper, blog técnico ni demo asociados en la información proporcionada.
