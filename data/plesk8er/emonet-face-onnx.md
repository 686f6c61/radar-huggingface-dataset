# plesk8er/EmoNet-Face-ONNX

## Resumen

EmoNet-Face-ONNX es una conversion a formato ONNX de un modelo de reconocimiento de expresiones faciales, construido sobre el codificador de imagenes SigLIP2 de Google y 40 cabezas de regresion emocional derivadas del paper EmoNet-Face. El paquete lo publica el usuario plesk8er y lo empaqueta Convivial Studio para su componente EmoNet-Face en TouchDesigner, una herramienta de programacion visual usada en instalaciones interactivas y arte generativo.

El modelo no es un modelo de lenguaje ni un transformer autoregresivo: es un pipeline de vision que combina un detector de rostros (BlazeFace de MediaPipe) con un codificador de imagenes SigLIP2 (variante so400m, patch 16, resolucion 384) y una pila de 40 MLP de regresion que producen puntuaciones continuas de emocion en una escala aproximada de 0 a 7. El repo ocupa 3,0 GB e incluye pesos en fp32 y fp16, metadatos de estados emocionales y el detector facial convertido desde TFLite.

Su relevancia es practica: simplifica el despliegue de un modelo de analisis emocional en un unico grafo ONNX con la normalizacion SigLIP2 incorporada, lo que reduce la friccion de integracion en entornos creativos y de investigacion. La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el autor restringe explicitamente el uso en entornos laborales y educativos conforme al articulo 5(1)(f) del Reglamento europeo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de vision SigLIP2 (so400m, patch 16, 384 px) + 40 cabezas MLP de regresion emocional, empaquetado como grafo ONNX unico |
| Parametros totales | no disponible (el repo ocupa 3,0 GB, pero no se desglosa el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 384 x 384) |
| Tipos de cuantizacion | fp32 y fp16 (ficheros `emonet_face.onnx` y `emonet_face_fp16.onnx`); no se documentan cuantizaciones int8 |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de emocion estan en ingles en los metadatos) |
| Licencia | CC-BY-4.0 (cabezas EmoNet-Face, LAION); codificador SigLIP2 Apache-2.0 (Google); detector BlazeFace Apache-2.0 (Google MediaPipe) |
| Formato de pesos | ONNX (`emonet_face.onnx`, `emonet_face_fp16.onnx`, `face_detection_full_range.onnx`) y JSON de metadatos |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. Primero, un detector BlazeFace full-range de MediaPipe localiza el rostro y recorta la region facial. Despues, el recorte se normaliza con los parametros de SigLIP2 (incorporados en el grafo) y se pasa al codificador de imagenes SigLIP2 so400m con patch de 16 y resolucion de 384 px, que produce un embedding de 1152 dimensiones. Sobre ese embedding actuan 40 cabezas MLP independientes, apiladas en una sola pasada, que devuelven 40 puntuaciones de emocion en la escala EmoNet-Face (aproximadamente 0 a 7).

Los pesos del codificador y de las cabezas no se han modificado respecto al modelo original laion/Empathic-Insight-Face-Large; la conversion solo reorganiza el grafo, apila las cabezas y fija la normalizacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que la model card no lo detalla. El paper de referencia (EmoNet-Face, NeurIPS 2025, arXiv:2505.20033) describe un benchmark anotado por expertos para reconocimiento de emociones sinteticas, y el autor indica que el modelo fue entrenado con retratos sinteticos de expresiones claras.

## Capacidades

- Regresion de 40 estados emocionales a partir de un recorte facial, con puntuaciones continuas en lugar de clasificacion discreta.
- Extraccion de embeddings faciales de 1152 dimensiones, utiles para similitud, clustering o analisis comparativo entre rostros.
- Deteccion de rostros integrada mediante BlazeFace full-range, lo que permite procesar imagenes completas sin un detector externo.
- Inferencia en un unico grafo ONNX con normalizacion incorporada, lo que simplifica el despliegue en runtimes ligeros.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica; el modelo no procesa texto.
- Modo thinking, vision o audio: solo vision (imagenes RGB de rostros); no hay audio ni texto.

## Casos de uso

- Instalaciones interactivas en TouchDesigner: el componente EmoNet-Face permite mapear expresiones faciales del publico a parametros visuales o sonoros en tiempo real, aprovechando el grafo ONNX unico y el detector BlazeFace integrado.
- Investigacion en percepcion emocional: los embeddings de 1152 dimensiones y las 40 puntuaciones permiten estudiar correlaciones entre expresiones y estados afectivos en corpus de retratos controlados.
- Analisis de audiencia en entornos creativos: en instalaciones de museos o eventos, el modelo puede generar metricas agregadas de reaccion emocional sin almacenar identificadores personales, siempre que se respete la restriccion de uso del autor.
- Prototipado rapido de interfaces afectivas: al ejecutarse en ONNX Runtime, el modelo se integra en aplicaciones de escritorio o web para experimentar con respuestas adaptativas a la expresion del usuario.
- Evaluacion de generadores de imagenes: las puntuaciones EmoNet-Face sirven para medir la expresividad emocional de retratos sinteticos producidos por modelos generativos, comparando la distribucion de emociones con la de un baseline neutro.
- Educacion y divulgacion sobre vision por computador: el repo incluye metadatos de estados y medias neutras por estado, lo que facilita explicar el funcionamiento de un pipeline de deteccion, encoding y regresion en talleres tecnicos.
- Filtrado o curaduria de datasets de rostros: el modelo puede etiquetar automaticamente recortes faciales con puntuaciones emocionales para organizar grandes colecciones de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas (tipo accuracy, F1 o error de regresion) frente a otros modelos, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 3,0 GB, pero el grafo de inferencia en fp16 es sustancialmente menor; no se dispone de una cifra oficial de VRAM. Como referencia, un codificador SigLIP2 so400m suele requerir entre 2 y 4 GB en fp16 para inferencia por lotes pequenos, aunque esta cifra no esta confirmada en la informacion proporcionada.
- GPU recomendadas: no disponibles en la documentacion. Por el tamano del codificador, cabria esperar ejecucion fluida en GPUs de consumo modernas, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: probable en fp16 para lotes pequenos, sin datos oficiales que lo confirmen.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo), integracion en TouchDesigner mediante el componente de Convivial Studio, y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmoNet-Face-ONNX (este modelo) | no disponible | imagen 384 x 384 | 40 emociones + embedding facial | CC-BY-4.0 (cabezas) y Apache-2.0 (encoder) | Hugging Face, ONNX |
| laion/Empathic-Insight-Face-Large | no disponible | imagen 384 x 384 | 40 emociones + embedding facial | CC-BY-4.0 | Hugging Face (pesos originales) |
| google/siglip2-so400m-patch16-384 | no disponible | imagen 384 x 384 | vision-lenguaje (zero-shot, retrieval) | Apache-2.0 | Hugging Face |
| MediaPipe BlazeFace full-range | no disponible | imagen variable | deteccion de rostros | Apache-2.0 | MediaPipe, TFLite/ONNX |

La comparativa se limita a los modelos que componen el pipeline, ya que no se dispone de datos de benchmarks que permitan contrastar el rendimiento con alternativas de reconocimiento emocional como EmoNet original u otros clasificadores FER.

## Limitaciones y advertencias

- El modelo fue entrenado con retratos sinteticos de expresiones claras; sus puntuaciones deben tratarse como senales suaves y, preferiblemente, relativas a una linea base neutra personal, tal como advierte el autor.
- Riesgo de alucinacion en el sentido de sobreinterpretacion: expresiones sutiles, oclusiones, iluminacion adversa o rostros no frontales pueden producir puntuaciones poco fiables.
- Sesgos conocidos: no se documentan en la model card; al entrenarse con retratos sinteticos, es probable que la distribucion demografica del dataset de entrenamiento condicione el rendimiento en rostros reales diversos, pero no hay datos que lo confirmen.
- Restriccion legal explicita: el autor y el paper original excluyen el uso para reconocimiento emocional en lugares de trabajo e instituciones educativas, conforme al articulo 5(1)(f) del Reglamento europeo de IA.
- Licencia CC-BY-4.0 para las cabezas: permite uso comercial con atribucion a LAION y a los autores del paper; el codificador SigLIP2 y BlazeFace estan bajo Apache-2.0 y requieren mantener los avisos correspondientes.
- Limitaciones de idioma: no aplica, pero las etiquetas de los 40 estados estan en ingles en los metadatos.
- Para produccion: la falta de benchmarks publicados y de requisitos de hardware documentados obliga a validar latencia y precision en el entorno de destino antes de desplegar.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plesk8er/EmoNet-Face-ONNX
- Modelo base (cabezas emocionales): https://huggingface.co/laion/Empathic-Insight-Face-Large
- Codificador de imagenes: https://huggingface.co/google/siglip2-so400m-patch16-384
- Paper EmoNet-Face (NeurIPS 2025): https://arxiv.org/abs/2505.20033
- Listado de modelos etiquetados emonet en Hugging Face: https://huggingface.co/models?other=emonet
