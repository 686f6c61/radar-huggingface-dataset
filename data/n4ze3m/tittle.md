# n4ze3m/tittle

## Resumen

Tittle es un modelo pequeno de post-procesado para reconocimiento automatico del habla (ASR) que se encarga de la puntuacion, el truecasing y la normalizacion inversa de texto (inverse text normalization, ITN). En otras palabras: recibe la salida tipica de un transcriptor, que suele venir en minusculas, sin signos de puntuacion y con los numeros escritos con letras, y devuelve un texto legible con comas, puntos, interrogaciones, mayusculas correctas y cifras en digitos. Lo desarrolla n4ze3m y se publica bajo licencia Apache-2.0.

Su interes practico esta en que resuelve un problema muy concreto de los pipelines de voz: los modelos ASR como Whisper o los basados en CTC entregan transcripciones crudas que resultan poco naturales en un chat, un subtitulo o un documento. Tittle ocupa ese hueco con un modelo de solo 2.039.691 parametros, un fichero ONNX de 8,3 MB y un rendimiento declarado de unas 14.000 palabras por segundo en un unico hilo de CPU, lo que lo hace apto para despliegue en el borde o en servidores modestos.

La propuesta es minimalista: no usa pesos preentrenados de ningun modelo grande, se entrena desde cero sobre el dataset espnet/yodas y expone tres cabezas de clasificacion por palabra (marca de puntuacion, caso y participacion en un numero). No es un modelo generativo ni un LLM, sino un etiquetador de tokens especializado y muy ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de token classification con tres cabezas de salida; sin pesos preentrenados) |
| Parametros totales | 2.039.691 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa texto de cualquier longitud en ventanas) |
| Tipos de cuantizacion | float16 (PyTorch), float32 (ONNX) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`tittle.pt`, float16) y ONNX (`onnx/model.onnx`, float32, opset 17) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de que se trata de un modelo de token classification que opera sobre piezas de palabra (word pieces). El vocabulario se limita a 3.999 piezas, con el token `▁` como marcador de inicio de palabra, y el modelo recibe secuencias de identificadores de pieza. Para cada palabra (leida en la posicion de su ultima pieza) emite tres distribuciones de probabilidad: la marca que la sigue (ninguna, coma, punto o interrogacion), el caso (minuscula, inicial mayuscula, mayusculas o grafia especial) y su papel dentro de un numero escrito en digitos (ninguno, primera palabra o palabra posterior).

El entrenamiento se realizo sobre el dataset espnet/yodas y, segun la model card, el modelo no incorpora pesos preentrenados de ningun otro modelo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de este tamano y tarea). Como innovacion practica, la exportacion ONNX mantiene una diferencia maxima de 4,8e-6 frente al modelo PyTorch en entrada aleatoria, lo que permite ejecutar la inferencia sin dependencia de PyTorch. El modelo incluye ademas un diccionario de 2.411 grafias especiales (iPhone, YouTube, etc.) para restaurar la capitalizacion atipica.

## Capacidades

- Puntuacion automatica: inserta comas, puntos e interrogaciones tras cada palabra segun el contexto.
- Truecasing: decide entre minuscula, inicial mayuscula, mayusculas y grafia especial (iPhone, YouTube) con un diccionario de 2.411 entradas.
- Normalizacion inversa de numeros: convierte numeros escritos con letras a digitos (por ejemplo, "nineteen eighty four" a "1984", "three hundred thousand" a "300,000").
- Procesamiento de texto de cualquier longitud mediante ventanas.
- Limpieza previa: elimina puntuacion, mayusculas y digitos ya presentes en la entrada antes de procesar.
- Ejecucion en CPU: aproximadamente 14.000 palabras por segundo en un solo hilo.
- Inferencia via PyTorch o via ONNX Runtime (sin necesidad de PyTorch).
- Implementacion en JavaScript disponible en el repositorio (`tittle.js` y `numbers.js`).
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso: es un etiquetador de tokens puro.

## Casos de uso

- Post-procesado de transcripciones ASR en produccion: se encadena la salida cruda de un reconocedor (Whisper, modelos CTC) con Tittle para obtener subtitulos o transcripciones legibles con puntuacion y mayusculas, con un coste computacional minimo.
- Subtitulado automatico en tiempo real: su velocidad de 14.000 palabras por segundo en un solo hilo de CPU permite procesar flujos de audio transcritos sin anadir latencia perceptible, incluso en hardware modesto.
- Asistentes de voz y chatbots telefonicos: convierte la salida del ASR en texto presentable antes de mostrarlo al usuario o de enviarlo a un LLM posterior, mejorando la calidad percibida de la conversacion.
- Generacion de actas y notas de reunion: a partir de la transcripcion en minusculas de una reunion, Tittle restaura la puntuacion y las cifras (fechas, importes, cantidades) para producir un documento legible.
- Despliegue en el borde (edge): con un fichero ONNX de 8,3 MB y ejecucion en CPU, puede integrarse en dispositivos con recursos limitados o en navegador mediante la implementacion JavaScript.
- Normalizacion de datos para pipelines NLP: antes de indexar o analizar texto transcrito, restaurar digitos y puntuacion mejora la calidad de los sistemas posteriores de busqueda, extraccion de entidades o resumen.
- Accesibilidad: mejorar la legibilidad de transcripciones para personas con dificultades de lectura o para lectores de pantalla que dependen de la puntuacion para la prosodia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara el rendimiento de inferencia (aproximadamente 14.000 palabras por segundo en un hilo de CPU) y una discrepancia maxima de 4,8e-6 entre la salida ONNX y la de PyTorch en entrada aleatoria.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el modelo pesa 4,1 MB en float16 (PyTorch) y 8,3 MB en float32 (ONNX), por lo que cabe en cualquier GPU consumer e incluso se ejecuta comodamente en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaria con holgura, pero el caso de uso natural es CPU.
- Cabe en GPU consumer: si, en cualquier modelo, incluidos integrados; tambien funciona sin GPU.
- Opciones de despliegue: ONNX Runtime (recomendado para produccion sin PyTorch), PyTorch, y la implementacion JavaScript en navegador o Node.
- Latencia y throughput estimados: unas 14.000 palabras por segundo en un unico hilo de CPU segun la model card; el throughput escala con hilos y con el uso de GPU, aunque no se publican cifras concretas adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n4ze3m/tittle | 2,04 M | No disponible (ventanas) | Puntuacion, truecasing e ITN para ASR | Apache-2.0 | Hugging Face, ONNX, JS |
| Modelos de puntuacion basados en BERT (p. ej. oliverguhr/fullstop-punctuation-multilang-large) | Cientos de millones | Limitado por el transformer subyacente | Puntuacion y truecasing | Variable segun modelo | Hugging Face |
| Whisper (post-procesado integrado) | 39 M - 1,55 B | 30 s de audio por ventana | ASR con puntuacion nativa | MIT | OpenAI, Hugging Face |
| Modelos ITN basados en reglas o seq2seq (p. ej. NVIDIA NeMo ITN) | Variable | No aplica / variable | Normalizacion inversa de texto | Apache-2.0 / MIT | Repositorios oficiales |

La comparativa cualitativa: Tittle es orders of magnitude mas pequeno que los modelos de puntuacion basados en BERT y que Whisper, a costa de limitarse al ingles y a un conjunto reducido de marcas (coma, punto, interrogacion) y de no cubrir otros idiomas. Frente a soluciones basadas en reglas para ITN, incorpora contexto para decidir la puntuacion y el caso. No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- El conjunto de marcas es muy reducido: unicamente coma, punto e interrogacion; no genera exclamaciones, dos puntos, punto y coma ni comillas.
- No es un modelo generativo: no reescribe ni corrige el contenido, solo etiqueta cada palabra; los errores del ASR subyacente se propagan.
- Riesgo de alucinacion limitado por su naturaleza discriminativa, pero puede insertar puntuacion o digitos incorrectos en casos ambiguos (por ejemplo, cifras que podrian leerse como palabras sueltas).
- La restauracion de grafias especiales depende de un diccionario fijo de 2.411 entradas; palabras fuera de el se capitalizan de forma generica.
- No se documentan sesgos especificos, pero al entrenarse sobre espnet/yodas puede heredar los sesgos de dominio y de hablantes de ese corpus.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y sin garantias; conviene revisar los terminos del dataset de entrenamiento si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-11-27; se trata de un modelo muy reciente y con poca validacion externa, por lo que se recomienda evaluarlo en el dominio propio antes de llevarlo a produccion.
- No se especifican en la informacion disponible los detalles del entrenamiento (tokens, composicion del dataset, tecnicas de regularizacion), lo que dificulta auditar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n4ze3m/tittle
- Demo: https://tittle.n4ze3m.com
- Codigo: https://github.com/n4ze3m/tittle
- Dataset de entrenamiento: https://huggingface.co/datasets/espnet/yodas
