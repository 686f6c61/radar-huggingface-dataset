# danielrosehill/MiniLM-L12-ASR-Paragraph-Breaks

## Resumen

MiniLM-L12-ASR-Paragraph-Breaks es un modelo de clasificación de tokens (token classification) desarrollado por Daniel Rosehill que inserta saltos de párrafo en transcripciones planas de reconocimiento automático del habla (ASR). Los motores ASR devuelven texto con puntuación y mayúsculas, pero en un único bloque; este modelo decide, palabra a palabra, dónde empieza un párrafo nuevo. No es un generador: la salida son las mismas palabras de entrada unidas por un espacio o por una línea en blanco, de modo que no puede alterar el texto y no necesita comprobaciones de fidelidad posteriores.

El modelo parte de `microsoft/MiniLM-L12-H384-uncased`, un encoder BERT de 12 capas y 384 dimensiones ocultas con tokenizador WordPiece sin distinción de mayúsculas, y se afina como `BertForTokenClassification` con dos etiquetas (`O` y `PARA`). Tiene 33.212.930 parámetros y se distribuye en safetensors (PyTorch) y ONNX, con una versión int8 de 32 MB pensada para ejecución en dispositivo.

Su relevancia actual está en el nicho de post-procesado de dictado y notas de voz: sustituye a un enfoque generativo previo del mismo autor (Gemma 3 270M, 437 MB en int8 y 23-48 s por memo en CPU) con un modelo 13 veces menor en disco, 0,65 s de latencia media en CPU de portátil y una F1 de 0,85 frente a 0,78 en el mismo conjunto de evaluación. Es un modelo muy reciente, en inglés y con cero descargas registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12-H384: 12 capas, 384 dimensiones ocultas), cabeza de clasificación de tokens |
| Parametros totales | 33.212.930 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens del modelo base; inferencia por ventanas de 510 tokens con `[CLS]` y `[SEP]`, solapamiento de ~256 tokens |
| Tipos de cuantizacion | int8 dinámica (ONNX, 32 MB) y fp32 (ONNX 127 MB y safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), ONNX fp32, ONNX int8 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional estilo BERT, en la variante MiniLM-L12-H384 (12 capas, 384 de dimensión oculta, WordPiece sin casing), con una cabeza lineal que emite dos logits por token (`O` / `PARA`). La etiqueta 1 se asigna únicamente al primer subtoken de la palabra donde arranca un párrafo. La inferencia trocea el texto en ventanas de como máximo 510 tokens cortadas en límites de palabra y con un desplazamiento de unas 256 posiciones; la puntuación de cada palabra es el softmax del logit 1 en su primer subtoken, tomada de la ventana donde ese token queda más cerca del centro. Se abre párrafo en toda palabra (salvo la primera) con probabilidad igual o superior a `paragraph_threshold = 0.26`.

El entrenamiento usa el dataset `danielrosehill/ASR-Paragraph-Breaks`: memos sintéticos en registro hablado escritos por Claude Haiku 5.5, de los cuales 20 fueron revisados a mano y 784 etiquetados con reglas derivadas de esas revisiones (style rules v1.2). Un 30 % de las filas se duplican con ruido de ASR (minúscula tras punto, comas omitidas, muletillas insertadas o eliminadas) y algunas además con saludos o despedidas fusionados con la frase siguiente. Total: 936 filas de entrenamiento y 80 de desarrollo. Se aplicó peso de clase 3 a los saltos (aproximadamente el 3 % de las palabras), 10 épocas, LR 8e-5, batch 16, AdamW con 6 % de warmup y se conservó la mejor época de desarrollo de 3 semillas, con un coste de unos 140 s por semilla en una L4. La innovación técnica no está en el modelo sino en el planteamiento: clasificador determinista con garantía de no reescritura, umbral calibrado en dev y ventana deslizante para cubrir textos largos.

## Capacidades

- Segmentación de transcripciones ASR planas en párrafos, con decisión a nivel de palabra.
- Salida estrictamente fiel: las palabras, la puntuación y el casing de entrada se conservan; solo se insertan espacios o líneas en blanco.
- Detección de cortes guiada por puntuación (no por mayúsculas, ya que el tokenizador pasa todo a minúsculas); puede abrir párrafo después de una coma.
- Ejecución en dispositivo: ONNX int8 de 32 MB, una pasada por ventana de 510 tokens en ONNX Runtime 1.17+.
- Equivalencia funcional entre PyTorch y ONNX fp32 en las 8.824 palabras del conjunto de test (el int8 difiere en 33 palabras).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador de tokens, no un modelo generativo.
- Multilingüe: no; entrenado y evaluado solo en inglés.

## Casos de uso

- Post-procesado de dictado en aplicaciones de notas de voz: se ejecuta una sola vez tras la transcripción completa y devuelve el memo dividido en párrafos, con 0,65 s medios para un memo de 340 palabras en CPU de portátil (int8, 1 hilo).
- Apps móviles y de escritorio con requisito de privacidad: los 32 MB del ONNX int8 permiten empaquetar el modelo dentro de la aplicación y procesar el texto sin enviarlo a la nube.
- Actas de reuniones y transcripciones de llamadas: convierte el volcado plano de un motor ASR en un documento legible por párrafos, manteniendo intactas las citas literales de los participantes.
- Preprocesado para chunking en RAG: al recuperar la estructura de párrafos antes de trocear el texto, los fragmentos enviados al modelo de recuperación respetan unidades de sentido en lugar de cortar a mitad de frase.
- Publicación de transcripciones de pódcast o entrevistas: divide el texto para su revisión editorial sin riesgo de que el modelo reescriba, resuma o alucine contenido, algo que sí ocurre con un post-proceso basado en LLM generativo.
- Herramientas de accesibilidad y dictado por voz para usuarios con movilidad reducida: la inferencia en CPU y el tamaño reducido permiten integrarlo en equipos modestos o en flujos de trabajo locales.
- Sustitución de un post-proceso generativo en producción: frente al fine-tune de Gemma 3 270M, elimina la necesidad de comprobaciones de fidelidad y los fallos por reformulación, a costa de perder cualquier capacidad de reescritura o corrección.

## Benchmarks y rendimiento

Precisión, recall y F1 sobre 26 memos de voz sintéticos reservados (290 saltos, revisados a mano), el mismo conjunto usado para el modelo Gemma predecesor, por lo que las cifras son comparables. Umbral y época se eligieron en un split de desarrollo separado.

| Modelo | Precisión | Recall | F1 | Fallbacks |
|---|---|---|---|---|
| SaT `segment-any-text/sat-3l-sm` (modo párrafo) | 0,48 | 1,00 | 0,65 | – |
| Gemma 3 270M fine-tune (r2) | 0,84 | 0,72 | 0,78 | 2 de 26 |
| **Este modelo, PyTorch / `onnx/model.onnx`** | **0,86** | **0,84** | **0,85** | no posibles |
| Este modelo, `onnx/model_int8.onnx` | 0,86 | 0,83 | 0,85 | no posibles |

Datos adicionales aportados por el autor: media sobre 3 semillas de entrenamiento, F1 0,85; en 10 casos escritos a mano más difíciles (saludos y despedidas fusionados, minúscula tras punto, comas omitidas, muletillas; 36 saltos) F1 0,83 (0,81 en int8), aunque ese conjunto también se usó para desempatar esta ejecución frente a otra, por lo que no es una cifra limpia de held-out. `model.onnx` fp32 toma la misma decisión de corte que PyTorch en las 8.824 palabras de test; `model_int8.onnx` difiere en 33. Latencia medida en CPU de portátil (Ryzen 7 5700U, 1 hilo, ONNX Runtime 1.31): 0,65 s de media para un memo de 340 palabras con int8; la latencia en teléfono no se ha medido.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a la tarea del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier configuración; los pesos ocupan 32 MB (int8) y 127 MB (fp32), con activaciones mínimas para batch 1 y ventanas de 510 tokens.
- GPU recomendadas: ninguna en particular; el modelo está pensado para CPU. Cualquier GPU consumer moderna (por ejemplo, una RTX 4090 o inferior) lo ejecuta con holgura, y también A100/H100 si se comparte infraestructura con otros servicios.
- Cabe en GPU consumer y en CPU: referencia medida de 0,65 s por memo de 340 palabras en un Ryzen 7 5700U con un solo hilo y ONNX Runtime 1.31.
- Opciones de despliegue: ONNX Runtime 1.17+ (recomendado, con `onnx/model_int8.onnx`), `paragraphs.py` como implementación de referencia (ventanizado, merge y salida), o PyTorch vía `AutoModelForTokenClassification` de transformers aplicando el mismo ventanizado. No hay pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas; el despliegue en vLLM o TGI no está documentado para este modelo.
- Throughput: no publicado más allá de la latencia por memo citada; al ser una pasada por ventana con ventanas de 510 tokens, el coste crece de forma aproximadamente lineal con la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | F1 en el set de 26 memos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniLM-L12-ASR-Paragraph-Breaks | 33,2 M | 512 tokens (ventanas de 510) | 0,85 (PyTorch e int8) | MIT | HuggingFace, safetensors y ONNX |
| Gemma 3 270M-ASR-Paragraph-Breaks (predecesor del mismo autor) | 270 M | no disponible | 0,78 | no disponible en la información consultada | HuggingFace; 437 MB int8, 23-48 s por memo en CPU |
| SaT `segment-any-text/sat-3l-sm` (modo párrafo) | no disponible | no disponible | 0,65 | no disponible en la información consultada | HuggingFace |
| `microsoft/MiniLM-L12-H384-uncased` (base sin afinar) | 33,2 M | 512 tokens | no aplica (no segmenta párrafos) | MIT | HuggingFace |

Frente al enfoque generativo, este modelo es aproximadamente 8 veces menor en parámetros y 13 veces menor en disco (32 MB frente a 437 MB), con una latencia de dos órdenes de magnitud inferior en CPU y mejor F1, además de la garantía de no modificar el texto. Frente a SaT, mejora el F1 en 0,20 puntos a costa de un recall menor (0,84 frente a 1,00): SaT no pierde ningún salto real pero genera muchos falsos positivos (precisión 0,48).

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, y el tokenizador sin casing impide usar las mayúsculas como señal.
- Sesgo de estilo: el entrenamiento usa memos sintéticos redactados por un único modelo generativo y etiquetados con reglas derivadas del estilo de una sola persona; puede no generalizar a otros registros, dominios o convenciones de paragrafación.
- Conjunto de evaluación muy pequeño: 26 memos con 290 saltos; según el autor, un solo salto mueve la F1 aproximadamente 0,003, por lo que las diferencias finas entre modelos no son significativas.
- Riesgo de alucinación nulo por diseño (no genera texto), pero sí errores de segmentación: mantiene unida la frase siguiente a saludos como "Hi John," en algunos memos y puede abrir párrafo tras un punto seguido de minúscula.
- Cortes tras coma: el modelo puede dividir "Hi John," en un párrafo distinto, lo que resulta extraño en lectura humana.
- Requiere el texto completo: lee todo el documento, por lo que está pensado para ejecutarse una vez finalizada la transcripción, no durante el dictado en tiempo real ni en streaming.
- Umbral fijo (`paragraph_threshold = 0.26`) calibrado en el split de desarrollo del autor; en otros dominios habrá que recalibrarlo.
- Licencia MIT, que permite uso comercial sin restricciones conocidas; aun así, el modelo se publicó con 0 descargas y sin validación externa, por lo que conviene evaluarlo en el dominio propio antes de llevarlo a producción.
- Fechas de creación y actualización del repositorio posteriores a la fecha de esta ficha; se reproducen tal como aparecen en la información de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielrosehill/MiniLM-L12-ASR-Paragraph-Breaks
- Dataset de entrenamiento: https://huggingface.co/datasets/danielrosehill/ASR-Paragraph-Breaks
- Repositorio GitHub (código de entrenamiento y evaluación): https://github.com/danielrosehill/ASR-Paragraph-Breaks
- Página del proyecto en el sitio del autor: https://www.danielrosehill.com/projects/asr-paragraph-breaks/
- Modelo predecesor generativo: https://huggingface.co/danielrosehill/Gemma-3-270M-ASR-Paragraph-Breaks
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Perfil del autor en HuggingFace: https://huggingface.co/danielrosehill
- Perfil del autor en GitHub: https://github.com/danielrosehill
