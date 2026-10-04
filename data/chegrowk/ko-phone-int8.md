# chegrowk/ko-phone-int8

## Resumen

ko-phone-int8 es una copia cuantizada a int8 y convertida a ONNX del modelo slplab/wav2vec2-xls-r-300m_phone-mfa_korean, un sistema de reconocimiento de fonemas del coreano basado en el phoneset de MFA (Montreal Forced Aligner). Lo publica el usuario chegrowk como artefacto de despliegue ligero para CheGROW Studio Pro, una herramienta que detecta repeticiones o añadidos en grabaciones de narración. El modelo original es un ajuste fino de facebook/wav2vec2-xls-r-300m, un transformer de 300 millones de parametros preentrenado por Meta sobre habla multilingue.

El problema que resuelve es concreto: obtener una transcripcion a nivel de fonema, no de palabra, para poder comparar lo leido con lo escrito y localizar errores de locucion. Al ser una salida CTC sobre un inventario fonetico, permite alinear y detectar inserciones, repeticiones u omisiones sin depender de un modelo de lenguaje que "corrija" lo que el hablante dijo realmente.

Su relevancia practica esta en el formato: al estar en ONNX con cuantizacion dinamica int8 y ser consumible desde Transformers.js, se puede ejecutar en navegador o en Node sin GPU dedicada, con un repositorio de 0,4 GB. No se han publicado resultados de benchmarks ni metricas de error para esta version cuantizada, y su adopcion en HuggingFace es practicamente nula (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo wav2vec2 con extractor convolucional de caracteristicas y cabecera CTC (wav2vec2-xls-r-300m) |
| Parametros totales | Aproximadamente 300 millones (segun el nombre del modelo base); el autor no publica el recuento exacto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; modelo de audio a 16 kHz mono, la ventana util depende del troceado que aplique el usuario |
| Tipos de cuantizacion | int8 dinamica con ONNX Runtime (per-channel, solo operadores MatMul); los pesos originales del modelo base estan en fp32 |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), archivo onnx/model_quantized.onnx; los ficheros config.json, preprocessor_config.json, vocab.json, tokenizer_config.json, special_tokens_map.json y added_tokens.json son copias sin modificar del modelo original |
| Modelo base | slplab/wav2vec2-xls-r-300m_phone-mfa_korean (a su vez ajuste fino de facebook/wav2vec2-xls-r-300m) |
| Tarea (pipeline) | automatic-speech-recognition (reconocimiento de fonemas) |
| Libreria de inferencia | transformers.js (tambien ejecutable con ONNX Runtime) |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 2026-10-04 (ultima actualizacion: 2026-10-04) |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2: una pila de convoluciones que convierte la forma de onda en una secuencia de representaciones latentes, seguida de un encoder transformer y de una cabeza lineal con funcion de perdida CTC. Al tratarse de la variante XLS-R de 300 millones de parametros, el preentrenamiento original de Meta se hizo sobre habla multilingue en decenas de idiomas; el modelo primigenio de slplab anade un ajuste fino sobre un corpus de habla leida de coreano nativo con equilibrio fonetico, con el objetivo de predecir el inventario de fonos de MFA en lugar de caracteres o palabras.

Sobre esa base, esta ficha tecnica documenta unicamente el proceso de conversion que hizo chegrowk: paso de los pesos PyTorch (revision e26ff9dfb62169acf445d0060ef56863c018b20e) a ONNX con opset 17 y cuantizacion dinamica int8 mediante ONNX Runtime, restringida a operadores MatMul y aplicada por canal. No hay reentrenamiento, ni RLHF, ni DPO, ni cambios en el vocabulario o el preprocesador. El autor advierte de que la cuantizacion altera ligeramente las salidas numericas respecto al modelo original. No se documenta en la informacion disponible el numero de tokens o de horas de audio de entrenamiento, ni la composicion detallada del dataset.

## Capacidades

- Reconocimiento de fonemas del coreano segun el inventario de MFA, no transcripcion ortografica ni de palabras.
- Salida CTC alineable con el audio, apta para comparar una locucion contra un texto de referencia.
- Deteccion de repeticiones y anadidos en grabaciones de narracion (caso de uso declarado por el autor en CheGROW Studio Pro).
- Inferencia en navegador y en Node mediante Transformers.js, con cuantizacion int8, sin necesidad de GPU.
- Consumo de audio a 16 kHz mono, normalizado a media cero y varianza unitaria.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento explicito.
- No genera puntuacion, mayusculas ni texto legible: la conversion de fonemas a grafia coreana queda fuera del modelo.
- No hay capacidades multilingues: el ajuste fino esta restringido al coreano, aunque el preentrenamiento XLS-R haya sido multilingue.

## Casos de uso

- Deteccion de repeticiones y anadidos en locucion: es el proposito original del artefacto dentro de CheGROW Studio Pro. El modelo transcribe fonemas del audio y el software compara esa secuencia con el guion para localizar fragmentos repetidos o insertados, algo que un ASR de palabras enmascararia al normalizar la salida.
- Control de calidad en doblaje y audiolibros: alineando la secuencia de fonemas con el texto de referencia se pueden marcar tartamudeos, omisiones y duplicaciones con marca temporal a nivel de fono, antes de la mezcla final.
- Correccion de pronunciacion en aprendizaje de coreano: comparar los fonos producidos por el estudiante con los esperados permite generar retroalimentacion a nivel de segmento, util en aplicaciones de practica oral.
- Alineacion forzada para investigacion fonetica: la salida CTC y las probabilidades por fotograma sirven como entrada a herramientas de alineacion para construir corpus anotados a nivel de fono.
- Preprocesado en pipelines de ASR de coreano: usar los fonemas como representacion intermedia sobre la que aplicar un modelo de lenguaje o un conversor fono-a-grafia, en lugar de decodificar directamente caracteres.
- Herramientas de audio en el navegador con privacidad: al ejecutarse con Transformers.js, el audio del usuario puede procesarse en local sin enviarlo a un servidor, requisito habitual en aplicaciones de grabacion de voz.
- Analisis de inteligibilidad en logopedia: medir la precision de los fonos emitidos por un paciente frente a una referencia esperada, sin que el modelo "adivine" la palabra correcta, que es precisamente lo que se quiere evitar en ese contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace del modelo no incluye tasas de error de fonema (PER), WER, ni comparaciones con el modelo original en fp32, y tampoco se documentan metricas de latencia o throughput tras la cuantizacion.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para la version int8. Es un modelo de 300 millones de parametros cuantizado a 8 bits, con un repositorio de 0,4 GB.
- Cabe en cualquier GPU de consumo e incluso en GPUs integradas; no requiere A100 ni H100.
- Ejecucion viable en CPU: con ONNX Runtime o Transformers.js en modo WASM, sin acelerador dedicado.
- Ejecucion en navegador con WebAssembly o WebGPU a traves de Transformers.js, con el modelo descargado en el cliente.
- Opciones de despliegue documentadas: Transformers.js (AutoModelForCTC con dtype q8) y ONNX Runtime. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni factores de tiempo real medidos.
- Almacenamiento: 0,4 GB de repositorio, mas el espacio adicional de la cache del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Salida | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chegrowk/ko-phone-int8 | ~300 M (heredados del base) | ONNX opset 17, int8 dinamica | Fonemas (MFA) | Coreano | Apache-2.0 | HuggingFace, 0 descargas |
| slplab/wav2vec2-xls-r-300m_phone-mfa_korean | ~300 M | PyTorch (fp32) | Fonemas (MFA) | Coreano | Apache-2.0 | HuggingFace |
| facebook/wav2vec2-xls-r-300m | ~300 M | PyTorch (fp32) | Representaciones auto-supervisadas, requiere cabecera | Multilingue (preentrenamiento) | Apache-2.0 (segun el modelo original de Meta) | HuggingFace |

Existen otros modelos de ASR en coreano basados en wav2vec2 en el ecosistema, pero no se dispone de datos verificables sobre sus parametros, contexto o rendimiento dentro de la informacion proporcionada, por lo que no se incluyen en la tabla. Tampoco se han publicado comparativas de precision entre la version int8 y la version fp32 del modelo original.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se conoce la perdida de precision introducida por la cuantizacion int8 frente al modelo original en fp32, mas alla de la advertencia generica del autor de que las salidas numericas cambian ligeramente.
- Dominio restringido: el ajuste fino se hizo sobre un corpus de habla leida de coreano nativo con equilibrio fonetico. El rendimiento en habla espontanea, dialectos, ruido de fondo, telefonia o habla infantil no esta documentado y previsiblemente sera peor.
- Idiomas: solo coreano. No debe usarse como modelo multilingue aunque el preentrenamiento XLS-R lo fuera.
- Salida no legible: produce fonemas, no texto. Cualquier caso de uso que necesite transcripcion ortografica requiere un componente adicional de conversion fono-a-grafia o un modelo de lenguaje.
- Riesgo de inserciones en segmentos ruidosos o silencios: los modelos CTC pueden emitir fonos espurios sobre audio degradado, lo que en una herramienta de deteccion de repeticiones puede generar falsos positivos. No se documenta ningun mecanismo de umbral o filtrado.
- Procedencia de los datos de entrenamiento: el autor de esta copia indica que la model card original no declara los terminos del corpus de entrenamiento. Es un riesgo a evaluar antes de un uso comercial, mas alla de la licencia Apache-2.0 del artefacto.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni evaluaciones independientes.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; el modelo se distribuye "as is", sin garantias.
- Despliegue: al depender de ONNX y Transformers.js, el ecosistema de servidores de inferencia de alto rendimiento (vLLM, TGI) no esta soportado de forma documentada, lo que limita el escalado a entornos de servidor tradicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chegrowk/ko-phone-int8
- Modelo base (fonemas MFA en coreano): https://huggingface.co/slplab/wav2vec2-xls-r-300m_phone-mfa_korean
- Modelo preentrenado original: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Perfil del autor del modelo base citado en la model card: https://huggingface.co/excalibur12
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
