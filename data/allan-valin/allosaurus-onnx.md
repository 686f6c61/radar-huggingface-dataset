# allan-valin/allosaurus-onnx

## Resumen

Allosaurus-onnx es una conversión a ONNX Runtime del modelo universal `uni2005` de Allosaurus, un sistema de reconocimiento fonético desarrollado originalmente por Xinjian Li, Siddharth Dalmia, Juncheng Li, Matthew Lee, Patrick Littell, Jiali Yao, Antonios Anastasopoulos, David R. Mortensen, Graham Neubig, Alan W Black y Florian Metze (Carnegie Mellon University y Universitat Pompeu Fabra, entre otras instituciones), presentado en el artículo «Universal Phone Recognition with a Multilingual Allophone System» (ICASSP 2020). El modelo no transcribe texto: recibe una forma de onda de voz y emite una secuencia de símbolos del Alfabeto Fonético Internacional (AFI), sin máscara de idioma, de modo que puede aplicarse a cualquier lengua sin reentrenamiento.

La conversión, publicada por el usuario allan-valin, integra todo el front-end dentro del grafo ONNX: remuestreo de 16 kHz a 8 kHz, cálculo de MFCC propio de Allosaurus (ventana povey, eliminación de continua, pre-énfasis, banco de filtros mel, DCT y liftering como constantes), normalización por enunciado de media y varianza, y apilado de 3 tramas. La salida es un tensor de log-probabilidades de 230 clases que se decodifica con CTC voraz. El resultado es un modelo fp32 que se puede ejecutar sin Python ni la librería original, algo relevante para integrar transcripción fonética en servicios, aplicaciones de escritorio o pipelines en otros lenguajes.

El interés práctico está en que elimina la dependencia del paquete Allosaurus (PyTorch, Kaldi-like) y permite obtener una capa fonética universal lista para tareas de documentación lingüística, evaluación de pronunciación o preprocesado de sistemas de síntesis y ASR en lenguas de bajos recursos. La contrapartida es una licencia GPL-3.0 heredada del proyecto original y una precisión que el propio autor documenta como prácticamente idéntica, pero no superior, a la del modelo de referencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal acustica BiLSTM con salida CTC; front-end MFCC integrado en el grafo (remuestreo 16 a 8 kHz, ventana povey, pre-enfasis, banco mel, DCT, liftering, normalizacion CMVN y apilado de 3 tramas) |
| Parametros totales | no disponible |
| Parametros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de transformers: la entrada es la forma de onda completa del enunciado (`[1, samples]`); no se documenta limite maximo de duracion |
| Tipos de cuantizacion | solo fp32 (no se publican versiones int8 ni fp16) |
| Idiomas soportados | reconocimiento telefonico universal sin mascara de idioma (salida AFI); lista concreta de lenguas no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`model.onnx`) mas `vocab.json` |
| Entrada | tensor float32 `wav` de forma `[1, samples]`, 16 kHz, rango -1 a 1 |
| Salida | tensor `logits` de log-probabilidades `[1, frames, 230]` |
| Vocabulario | 230 clases; indice 0 reservado para `blank` |
| Decodificacion | CTC voraz: argmax por trama, fusion de repeticiones y eliminacion de blank |
| Tamano del repositorio | 0.0 GB (redondeado por HuggingFace; el tamano exacto del fichero ONNX no se publica) |
| Libreria de inferencia | onnxruntime |

## Arquitectura y entrenamiento

El modelo es un reconocedor acústico clásico de tipo híbrido CTC: una BiLSTM que consume tramas de MFCC y produce, para cada trama, una distribución sobre 230 símbolos fonéticos. El artículo original propone un «multilingual allophone system»: en lugar de modelar fonemas específicos de cada lengua, se entrena con inventarios alofónicos compartidos entre lenguas, de forma que el modelo aprende unidades acústicas reutilizables y puede transcribir lenguas no vistas durante el entrenamiento. La decodificación con el objetivo `ipa` no aplica ninguna máscara de lengua, por lo que la salida es el inventario universal completo.

Sobre los datos de entrenamiento del checkpoint `uni2005` no se ofrece detalle en la información disponible: la model card de la conversión no indica número de horas, composición del corpus ni si hubo etapas de ajuste fino. Tampoco se documenta el uso de RLHF ni de DPO, algo que no aplica a un modelo discriminativo de este tipo. La innovación técnica de esta versión concreta es de ingeniería de despliegue: todo el preprocesado (incluido el filtro de remuestreo de resampy, medido a partir de su respuesta al impulso) se ha congelado como constantes dentro del grafo ONNX, con verificación numérica contra Allosaurus. Según el autor, las características coinciden con las del original hasta el tercer decimal y los teléfonos decodificados son idénticos en 739 de 760 enunciados de VoxAngeles; las 21 discrepancias se explican porque Allosaurus fusiona un teléfono repetido a través de un blank y el CTC estándar conserva ambos.

## Capacidades

- Reconocimiento fonético a partir de audio: convierte voz en una secuencia de símbolos AFI, sin pasar por texto ortográfico.
- Cobertura multilingüe sin máscara de idioma: el objetivo `ipa` permite transcribir cualquier lengua, incluidas lenguas de bajos recursos o sin ortografía estandarizada.
- Transcripción «broad» y «narrow»: el inventario de 230 clases incluye diacríticos y alófonos, por lo que puede producir transcripciones estrechas.
- Preprocesado autónomo: acepta directamente PCM a 16 kHz en coma flotante; el remuestreo, los MFCC y la normalización se ejecutan dentro del grafo.
- Ejecución portable:ONNX Runtime permite inferencia en CPU, con o sin GPU, desde Python, C++, C#, Java, Rust o JavaScript.
- Integración por lotes: al admitir tensores de forma variable por enunciado, se puede procesar un fichero por llamada o agrupar por duración.
- No soporta: tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, matemáticas, visión, audio-generación ni modo «thinking». Es un modelo puramente discriminativo de fonética.

## Casos de uso

- Documentación lingüística de campo: transcribir grabaciones de lenguas minoritarias o sin escritura a AFI para su posterior análisis fonológico, aprovechando que no requiere una máscara de idioma ni un léxico previo.
- Evaluación de pronunciación (CAPT): comparar la secuencia AFI emitida por el alumno con la esperada para detectar sustituciones, omisiones e inserciones a nivel de segmento en clases de idiomas.
- Logopedia y terapia del habla: obtener una representación fonética objetiva de producciones espontáneas para medir evolución temporal, al poder ejecutarse en local sin enviar audio clínico a la nube.
- Creación de léxicos de pronunciación para TTS: generar entradas AFI para sistemas de síntesis en lenguas donde no existe diccionario fonético, y alimentar el front-end del sintetizador.
- Preprocesado de ASR en lenguas de bajos recursos: usar las secuencias de teléfonos como etiquetas intermedias para entrenar o adaptar modelos acústicos y sistemas de alineamiento.
- Indexación y búsqueda por sonido: construir índices fonéticos sobre archivos de audio (por ejemplo, corpus de entrevistas) para localizar apariciones de una palabra o de un segmento concreto sin transcripción ortográfica.
- Curación de datos de voz: detectar automáticamente el contenido fonético de un dataset para filtrar grabaciones, equilibrar inventarios o verificar etiquetados.
- Despliegue en dispositivos: al ser un único fichero ONNX sin dependencias de PyTorch, se puede incrustar en aplicaciones de escritorio o móviles con ONNX Runtime y ejecutar en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para tareas estándar de tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo de reconocimiento fonético. El autor sí reporta una comparación directa contra Allosaurus sobre 760 enunciados de VoxAngeles con puntuación estrecha:

| Metrica | allosaurus-onnx | Allosaurus original |
|---|---|---|
| PER (puntuacion estrecha, 760 enunciados VoxAngeles) | 94.6 | 94.1 |
| PFER (puntuacion estrecha, 760 enunciados VoxAngeles) | 34.8 | 34.4 |
| Enunciados con telefonos decodificados identicos | 739 de 760 | referencia |
| Coincidencia de caracteristicas acusticas | igual hasta 3 decimales | referencia |

Las cifras se reproducen tal como las publica el autor; no se especifica la definición exacta de PER ni de PFER empleada en esa evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio figura como 0.0 GB (redondeo de HuggingFace) y el peso exacto del fichero ONNX no se publica, por lo que no se puede calcular una cifra fiable.
- GPU recomendadas: no documentadas. Por la naturaleza del modelo (BiLSTM pequeña sobre tramas de MFCC a 8 kHz), la inferencia en CPU es viable; una GPU solo tendría sentido para procesar grandes lotes.
- GPU de consumo: presumiblemente cabe en cualquier GPU de consumo con unos pocos GB de VRAM, pero no hay medición publicada que lo confirme.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con enlaces desde Python, C++, C#, Java, Rust y JavaScript. No hay versiones GGUF, por lo que llama.cpp y Ollama no son aplicables; tampoco se publican artefactos para vLLM o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles. No se publican tiempos por segundo de audio ni factores de tiempo real.
- Requisito de entrada: audio mono a 16 kHz en coma flotante normalizado a -1…1; el remuestreo interno baja a 8 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| allosaurus-onnx (esta ficha) | no disponible | forma de onda completa a 16 kHz, salida de 230 clases AFI | universal, sin mascara de idioma | GPL-3.0 | ONNX | HuggingFace, repo de 0.0 GB |
| Allosaurus `uni2005` original | no disponible | audio por enunciado | universal, sin mascara de idioma | GPL-3.0 | PyTorch (paquete `allosaurus`) | GitHub y PyPI |
| Reconocedores foneticos basados en wav2vec 2.0 | no disponible en esta busqueda | audio, ventana tipica de decenas de segundos | depende del checkpoint; habitualmente una lengua o un conjunto reducido | variable segun checkpoint | PyTorch / safetensors | HuggingFace |
| Sistemas ASR con salida fonetica (por ejemplo, Kaldi) | no disponible | audio por enunciado | depende del modelo acustico entrenado | variable | diversos | repositorios propios |

La ventaja diferencial de esta conversión frente al Allosaurus original es el despliegue: un solo fichero ONNX con el front-end incluido, sin dependencias de PyTorch ni del paquete `allosaurus`. Frente a los reconocedores basados en wav2vec 2.0, su punto fuerte es la cobertura multilingüe sin ajuste previo y un consumo de recursos presumiblemente menor, a costa de una precisión por teléfono que el propio autor sitúa en el entorno del 34.8 de PFER en puntuación estrecha.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier distribución de un producto que enlace este modelo queda sujeta a obligaciones de copyleft. Para uso comercial propietario es un obstáculo relevante y conviene revisarlo con asesoría legal antes de integrarlo.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite instrucciones. Cualquier ficha que lo presente como asistente es incorrecta.
- El riesgo de alucinación en el sentido habitual no aplica, pero sí existen errores de inserción, omisión y sustitución de segmentos, especialmente en audio con ruido, solapamiento de hablantes o canales de banda estrecha.
- Ausencia de máscara de idioma: el modelo puede emitir teléfonos plausibles acústicamente pero improbables en la lengua del hablante, y no ofrece ninguna señal de confianza por idioma.
- Diferencia de segmentación respecto al original: el CTC estándar conserva un teléfono repetido a través de un blank que Allosaurus fusiona, lo que produce 21 discrepancias en 760 enunciados de VoxAngeles. Los pipelines que comparen contra salidas de Allosaurus deben tenerlo en cuenta.
- Entrada rígida: se espera 16 kHz mono en float32 con rango -1…1; audio a otras frecuencias, estéreo o formatos enteros requerirá conversión previa. No se documenta comportamiento con duraciones muy largas.
- Sesgos: dependen del corpus de entrenamiento de `uni2005`, cuya composición no se detalla en la información disponible; cabe esperar peor rendimiento en lenguas, acentos y variedades poco representadas, y en habla infantil o patológica.
- Sin puntuación temporal: la salida son log-probabilidades por trama, sin marcas de tiempo explícitas ni segmentación por palabras; hay que derivar los límites a partir de las tramas.
- Procedencia: es una conversión de terceros (allan-valin), no una publicación de los autores originales; la validación reportada se limita a la comparación numérica descrita en la model card.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin señales de mantenimiento ni comunidad que permitan estimar soporte a largo plazo.
- Metadatos incompletos: la model card no incluye pipeline declarado, lista de idiomas ni tamaño de parámetros, lo que dificulta la comparación automática con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allan-valin/allosaurus-onnx
- Repositorio de Allosaurus (Xinjian Li): https://github.com/xinjli/allosaurus
- Artículo «Universal Phone Recognition with a Multilingual Allophone System» (ICASSP 2020): https://arxiv.org/abs/2002.11800
- Script de exportación y verificación contra Allosaurus: https://github.com/allan-valin/speech-to-ipa/blob/main/eval/export_allosaurus_onnx.py
- Proyecto que utiliza el modelo, speech-to-ipa: https://github.com/allan-valin/speech-to-ipa
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las entradas devueltas corresponden a un sitio de seguros y a la comuna francesa de Allan, sin relación con el modelo.
