# pythainlp/MakHamTTS

## Resumen

MakHamTTS es un modelo de síntesis de voz (text-to-speech) para tailandés, publicado por el equipo de PyThaiNLP bajo el identificador `pythainlp/MakHamTTS`. Se distribuye como un modelo ONNX autónomo de una sola voz, derivado de Kokoro-82M y de Paradee, con el timbre acústico denominado `makham_female`. Su principal valor es la simplicidad de despliegue: no requiere voicepacks externos (`ref_s` ni ficheros `.npy`) y expone una interfaz mínima de dos entradas (`input_ids` y `speed`) y una salida de forma de onda a 24 kHz.

El modelo resuelve un problema concreto en el ecosistema del tailandés: disponer de un TTS ligero, con licencia Apache 2.0 (uso comercial permitido) y ejecutable en CPU mediante ONNX Runtime, sin depender de frameworks de deep learning pesados. Con 82,7 MB en cuantización int8 y 325,5 MB en FP32, es adecuado para integrarse en aplicaciones locales, servicios web o sistemas embebidos.

Es relevante ahora porque el tailandés es un idioma con poca cobertura en TTS open source de calidad, y porque el modelo se apoya en un G2P específico (FastThaiG2P de AWS Labs) para convertir texto en fonemas con los cinco tonos del idioma. La model card no detalla el proceso de entrenamiento ni publica benchmarks, por lo que su evaluación debe hacerse mediante pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; derivada de Kokoro-82M (modelo neuronal TTS, familia StyleTTS 2) y de Paradee |
| Parametros totales | 82 M aproximadamente (heredados de Kokoro-82M; la model card no declara un recuento propio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada es una secuencia de fonemas sobre un vocabulario de 115 tokens, sin ventana de contexto definida |
| Tipos de cuantizacion | int8 weight-only (82,7 MB, recomendada) y FP32 (325,5 MB) |
| Idiomas soportados | Tailandes (th) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (dos artefactos: int8 y FP32) mas `config.json` |

Otros datos tecnicos: salida de audio a 24 kHz en `float32`; entradas `input_ids` (`int64`, forma `[1, tokens]`) y `speed` (`float32`, forma `[1]`); tamano del repositorio 0,4 GB; single-voice (`makham_female`).

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el procedimiento de entrenamiento. Lo unico confirmado es que se trata de un modelo derivado de Kokoro-82M y de Paradee, del que se ha extraido una voz concreta (`makham_female`) y se ha exportado a ONNX con dos variantes de precision. La interfaz (`input_ids` + `speed` → `waveform`) corresponde a un TTS neuronal que consume directamente ids de fonemas, sin necesidad de un codificador de referencia de hablante: no hay `ref_s` ni voicepack `.npy`, lo que indica que el timbre esta fijado en los pesos.

El vocabulario de 115 tokens esta disenado para fonemas tailandeses con cinco tonos, lo que implica que el texto debe pasar antes por un G2P: el propio autor enlaza FastThaiG2P de AWS Labs para esa tarea. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en TTS). Tampoco se documentan innovaciones como decodificacion especulativa; el control de prosodia disponible se limita al parametro escalar `speed`.

## Capacidades

- Sintesis de voz en tailandes a partir de fonemas, con salida de forma de onda mono a 24 kHz.
- Voz unica femenina (`makham_female`); no hay seleccion de hablante ni clonacion.
- Modelado de los cinco tonos del tailandes gracias al vocabulario de 115 tokens de fonemas.
- Control de velocidad de habla mediante la entrada `speed` (`float32`).
- Inferencia via ONNX Runtime, sin dependencias de frameworks de deep learning ni voicepacks externos.
- Dos niveles de precision (int8 y FP32) para intercambiar calidad por tamano y velocidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del tailandes.

## Casos de uso

- Lectura por voz de articulos y noticias en tailandes: el modelo convierte texto en audio a 24 kHz con un unico fichero ONNX de 82,7 MB, integrable en un backend sin GPU y con latencia baja por frase.
- Accesibilidad para personas con discapacidad visual en aplicaciones tailandesas: al no requerir voicepack externo ni GPU, puede empaquetarse dentro de la propia aplicacion de escritorio o movil.
- Sistemas IVR y atencion telefonica automatizada: cada respuesta del bot se sintetiza con el parametro `speed` ajustado para mejorar la inteligibilidad en linea telefonica.
- Generacion de audiolibros y contenido editorial: la voz femenina consistente permite narrar textos largos divididos en fragmentos, manteniendo el mismo timbre en todo el material.
- Doblaje y locucion para video: Sintesis de guiones en tailandes para prototipos, previsualizaciones o contenido de bajo presupuesto antes de contratar locucion humana.
- Creacion de datasets de audio para entrenar o evaluar sistemas ASR en tailandes: el TTS permite generar corpus controlados con vocabulario y velocidad conocidos.
- E-learning de pronunciacion y tonos: util para generar ejemplos auditivos de palabras y frases con las cinco marcas tonales, con velocidad reducida para principiantes.
- Navegacion GPS y avisos de sistemas embebidos: el modelo int8 cabe en dispositivos con recursos limitados y no necesita conexion a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, CMOS, WER del texto sintetizado, similitud de hablante) ni comparaciones con otros sistemas TTS en tailandes, y tampoco se han encontrado resultados relevantes en la busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB con el modelo int8 y 0,35 GB con FP32, calculado a partir del tamano de los ficheros; el consumo real de memoria del runtime es mayor pero sigue siendo muy reducido.
- GPU recomendadas: no se requieren. Cualquier GPU con soporte CUDA o DirectML acelera la inferencia, pero el modelo esta pensado para ejecutarse en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, integradas) y en CPU de portatil; tambien es viable en dispositivos embebidos tipo Raspberry Pi con la variante int8.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JS/WASM) y cualquier runtime compatible con ONNX. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un modelo de 82 M de parametros en int8 sobre CPU moderna suele sintetizar por debajo del tiempo real, pero debe medirse en el hardware objetivo.
- El pipeline requiere un paso previo de G2P (FastThaiG2P) para convertir texto tailandes en los ids de fonemas que consume el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MakHamTTS (este modelo) | ~82 M | Tailandes | ONNX (int8 / FP32) | Apache 2.0 | Voz unica, sin voicepack, derivado de Kokoro-82M y Paradee |
| Kokoro-82M | 82 M | Multiples (no tailandes de serie) | PyTorch / ONNX en la comunidad | Apache 2.0 | Modelo base del que deriva; requiere voicepacks de referencia |
| XTTS-v2 (Coqui) | No disponible en la informacion proporcionada | Multilingue (incluye tailandes, segun documentacion publica del proyecto) | PyTorch | Coqui Public Model License (no comercial) | Clonacion de voz zero-shot; mucho mas pesado |
| Piper (VITS) | No disponible en la informacion proporcionada | Multiples voces comunitarias | ONNX | MIT | Enfoque ligero para CPU similar; cobertura de tailandes no confirmada |

Nota: los datos de las filas de Kokoro-82M, XTTS-v2 y Piper proceden del conocimiento general del ecosistema y no estan incluidos en la informacion proporcionada en esta ficha; conviene verificarlos en sus repositorios antes de tomar decisiones.

## Limitaciones y advertencias

- Voz unica: no hay seleccion de hablante, clonacion ni control de estilo o emocion; el unico control disponible es la velocidad.
- Solo tailandes: el texto en otros idiomas o con caracteres latinos no producido por el G2P no se sintetizara correctamente.
- Dependencia externa del G2P: la calidad final depende en gran medida de FastThaiG2P y del proceso de conversion texto-fonema, que no forma parte de este repositorio.
- Riesgo de alucinacion acustica: como todo TTS neuronal, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera de dominio, nombres propios y prestamos linguisticos.
- Sin datos de entrenamiento publicados: se desconoce la composicion del corpus, los sesgos de hablante, dialecto o genero, y las condiciones acusticas de las grabaciones originales.
- Sin benchmarks: no hay evidencia publica de MOS ni comparaciones objetivas frente a alternativas, por lo que la calidad debe validarse con pruebas propias.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser un modelo derivado de Kokoro-82M y Paradee conviene revisar las condiciones de esos proyectos originales por si imponen atribuciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 likes, y fue creado en octubre de 2026; no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.
- No apto para suplantacion de identidad: al no permitir clonacion, el riesgo se limita al uso indebido del timbre concreto, pero debe advertirse a los usuarios de que el audio es sintetico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pythainlp/MakHamTTS
- Repositorio de codigo para ejecutar el modelo: https://github.com/wannaphong/MakHamTTS
- FastThaiG2P (AWS Labs), G2P necesario para la conversion texto-fonema: https://github.com/awslabs/FastThaiG2P/
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
