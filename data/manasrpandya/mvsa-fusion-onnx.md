# manasrpandya/mvsa-fusion-onnx

## Resumen

mvsa-fusion-onnx es una cabeza de fusión multimodal para análisis de sentimiento en publicaciones de redes sociales que combinan imagen y texto. No se trata de un modelo generativo ni de un transformer completo, sino de un conjunto de módulos ligeros (una compuerta por publicación y dos clasificadores lineales) entrenados sobre el conjunto de datos MVSA-Single. Los codificadores subyacentes (CLIP ViT-B/32 para texto e imagen, y RoBERTa de CardiffNLP para el texto del tuit) permanecen congelados y se distribuyen por separado, de modo que este repositorio contiene únicamente la lógica de fusión exportada a ONNX.

El modelo resuelve un problema concreto: dado un par imagen-texto procedente de una publicación social, producir una puntuación de sentimiento en tres clases (negativo, neutro, positivo) combinando de forma adaptativa las señales textual y visual. La innovación principal es la compuerta (`text_weight`) que aprende, para cada publicación, cuánto peso asignar a la predicción textual frente a la visual, en lugar de usar una fusión tardía de pesos fijos.

Es relevante por su carácter práctico y ligero: al operar sobre encoders congelados y exportarse a ONNX, puede ejecutarse en navegador o en entornos con recursos limitados. No obstante, es un artefacto de investigación con métricas modestas (0,721 de accuracy y 0,655 de macro-F1 en su partición de test) y con limitaciones explícitas declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de fusión multimodal: compuerta por publicación + dos clasificadores lineales sobre embeddings congelados de CLIP ViT-B/32 (texto e imagen) y logits de RoBERTa de CardiffNLP |
| Parametros totales | no disponible (cabeza ligera; los encoders se distribuyen por separado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de los encoders: CLIP ViT-B/32 con 77 tokens y RoBERTa base con 512 tokens, no confirmado en la información) |
| Tipos de cuantizacion | exportación ONNX; el autor menciona grafos de encoder int8 para navegador |
| Idiomas soportados | inglés (entrenado sobre publicaciones sociales en inglés) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es una fusión tardía con compuerta aprendida. Las entradas son tres tensores float32: `caption` (batch × 512), que es el embedding de texto de CLIP proyectado y normalizado a norma unitaria; `image` (batch × 512), el embedding visual de CLIP igualmente normalizado; y `tweet` (batch × 3), los logits de RoBERTa de CardiffNLP en orden negativo, neutro, positivo. La salida `text_weight` (batch × 1) modula la combinación `fused = text_weight * text + (1 - text_weight) * visual`, de modo que la predicción final es una mezcla adaptativa por publicación de las puntuaciones textual y visual. Las salidas `text`, `visual` y `fused` son puntuaciones crudas en el mismo orden de clases, y el autor indica que debe aplicarse softmax si se desean probabilidades.

El entrenamiento se realizó sobre MVSA-Single con los encoders congelados, usando etiquetas débiles agrupadas (pooled weak labels) de publicaciones sociales en inglés. El repositorio de laboratorio del autor contiene el código de entrenamiento, los detalles de partición y preprocesado, los resultados de test y el informe. El autor señala explícitamente que los conflictos literales entre positivo y negativo fueron excluidos al agrupar las etiquetas del benchmark, lo que limita la cobertura de ese tipo de casos.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) para pares imagen-texto.
- Fusión adaptativa por publicación mediante compuerta aprendida entre señal textual y visual.
- Exposición de puntuaciones parciales: salida textual, salida visual y salida fusionada, además del peso de texto.
- Inferencia exportada a ONNX, apta para ejecución en navegador con grafos de encoder int8.
- No soporta generación de texto, tool calling, agentes, visión general ni audio; es un clasificador especializado.
- Cobertura lingüística limitada al inglés.

## Casos de uso

- Moderación de sentimiento en redes sociales: clasificar publicaciones con imagen y texto para priorizar revisiones humanas en contenido negativo, usando la salida fusionada y el peso de texto como señal de confianza.
- Analítica de marca en tiempo real: procesar lotes de publicaciones con imagen y pie para agregar polaridad por campaña, aprovechando la ligereza del artefacto ONNX.
- Monitorización de opinión en comunidades visuales: detectar publicaciones donde la imagen contradice o matiza el texto, inspeccionando la discrepancia entre `text` y `visual`.
- Filtrado previo en pipelines de anotación: usar el modelo como preetiquetador de bajo coste antes de la revisión humana, dado su reducido consumo al operar sobre encoders congelados.
- Demos interactivas en navegador: desplegar la cabeza con los grafos int8 de los encoders para una demostración cliente-side sin backend, como hace el autor en su demo de Vercel.
- Investigación en fusión multimodal: servir de línea base reproducible para comparar estrategias de fusión (compuerta frente a fusión tardía equitativa o fusión temprana emparejada) sobre MVSA-Single.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la partición de test agrupada de 451 publicaciones:

| Configuracion | Accuracy | Macro-F1 |
|---|---|---|
| Fusion con compuerta (gated) | 0,721 | 0,655 |
| Fusion tardia equitativa (equal late fusion) | no disponible | 0,666 |
| Fusion temprana emparejada (matched early fusion) | no disponible | 0,685 |
| Compuerta con encoders int8 de navegador y preprocesado en Python | no disponible | 0,654 |

Con los grafos int8 en navegador, el modelo coincidió con la etiqueta de la compuerta original en el 88,2 % de las publicaciones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de una cabeza lineal sobre encoders congelados, el coste dominante son los encoders CLIP ViT-B/32 (unos 150 M de parámetros) y RoBERTa base (unos 125 M), no la cabeza.
- GPU recomendadas: no disponibles en la información; cualquier GPU consumer moderna debería bastar para los encoders en fp32 o fp16.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 4-8 GB de VRAM para los encoders en precisión reducida; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (incluido el runtime web para navegador); otros motores no mencionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| mvsa-fusion-onnx | Cabeza de fusión multimodal sobre encoders congelados | no disponible (encoders ~275 M en conjunto) | no disponible | 0,721 accuracy / 0,655 macro-F1 en MVSA-Single test | no disponible |
| Fusión tardía equitativa (misma base) | Estrategia de fusión sin compuerta | mismos encoders | no disponible | 0,666 macro-F1 | no disponible |
| Fusión temprana emparejada (misma base) | Estrategia de fusión sin compuerta | mismos encoders | no disponible | 0,685 macro-F1 | no disponible |
| CLIP ViT-B/32 (openai) | Modelo multimodal base | ~150 M | 77 tokens | no disponible | no disponible en la información |
| twitter-roberta-base-sentiment-latest (cardiffnlp) | Clasificador de sentimiento textual | ~125 M | 512 tokens | no disponible | no disponible en la información |

No se dispone de comparación con otros modelos de análisis de sentimiento multimodal de propósito general en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que el modelo a veces invierte una predicción de texto correcta, es decir, la compuerta puede degradar el resultado textual.
- Cobertura limitada de conflictos literales entre positivo y negativo, porque esos casos se excluyeron al agrupar las etiquetas del benchmark.
- Entrenado con etiquetas débiles agrupadas sobre publicaciones sociales en inglés; el dominio y el idioma están acotados.
- Riesgo de sesgo por el corpus de redes sociales y por la composición de MVSA-Single; no se documentan análisis de sesgo.
- La licencia no está declarada, lo que impide confirmar el uso comercial; debe verificarse antes de producción.
- El repositorio tiene 0,0 GB, por lo que los pesos de los encoders deben obtenerse por separado (Xenova); el artefacto no es autosuficiente.
- Métricas modestas (0,655 de macro-F1 con compuerta) y ligeramente inferiores a las fusiones alternativas evaluadas por el propio autor (0,666 y 0,685), lo que cuestiona la ventaja de la compuerta en este benchmark.
- No es un modelo generativo: no debe emplearse para tareas de razonamiento, código o diálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manasrpandya/mvsa-fusion-onnx
- Repositorio de laboratorio con código de entrenamiento y resultados: https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/15-multimodal-sentiment
- Demo en navegador: https://nlp-cv-lab.vercel.app/p/multimodal-sentiment
- Encoder CLIP ViT-B/32 (Xenova): no disponible enlace directo en la información
- Encoder twitter-roberta-base-sentiment-latest (Xenova): no disponible enlace directo en la información
