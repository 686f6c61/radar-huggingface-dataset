# nakas/gpttrace-audio-pellav2-onnx

## Resumen

`nakas/gpttrace-audio-pellav2-onnx` es una exportación a formato ONNX del detector de audio sintético o deepfake `Sadanie/pellav2-audio-deepfake-detector`, publicada por el usuario nakas como componente del ensemble de voz del proyecto GPTTrace. No se trata de un modelo generativo, sino de un clasificador binario de ventanas de audio que emite un logit por ventana (valores más altos indican mayor probabilidad de audio generado por IA). El repositorio ocupa 2,3 GB e incluye una cuantización int8 selectiva de operaciones `MatMul` cuando la paridad numérica con el pipeline original lo permite.

El modelo base emplea la arquitectura Pella v2, un encoder de audio orientado a la detección de voz sintética. La exportación mantiene la interfaz de preprocesado original: características extraídas con `SeamlessM4TFeatureExtractor` sobre ventanas normalizadas de 4 segundos a 16 kHz. El resultado es un grafo ONNX autocontenido que puede ejecutarse con ONNX Runtime en CPU o GPU sin depender de PyTorch.

Su relevancia práctica radica en que facilita el despliegue de detección de deepfakes de voz en entornos de producción con requisitos estrictos de latencia y portabilidad, y en que el autor publica un fichero `parity.json` con la tasa de acuerdo respecto al pipeline original, lo que permite auditar la degradación introducida por la cuantización. La licencia MIT del modelo base se conserva en esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pella v2 (encoder de audio para deteccion de deepfake), exportado a grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada se define por ventanas de audio de 4 s a 16 kHz |
| Tipos de cuantizacion | int8 en operaciones `MatMul` cuando la paridad lo permite; pesos originales en el resto del grafo |
| Idiomas soportados | no disponible (el modelo opera sobre acustica, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 2,3 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `Sadanie/pellav2-audio-deepfake-detector` mas alla de su nombre (Pella v2) y su tarea: clasificacion de audio sintetico. La exportacion a ONNX preserva el grafo de inferencia y aplica cuantizacion int8 selectiva en las operaciones `MatMul`, dejando el resto de operadores en su precision original para no romper la paridad con el pipeline de referencia.

El preprocesado es parte integral del contrato del modelo: las senales deben normalizarse y trocearse en ventanas de 4 segundos a 16 kHz, y las caracteristicas se extraen con `SeamlessM4TFeatureExtractor`. La salida es un unico logit por ventana. El autor incluye un fichero `parity.json` que documenta el acuerdo entre esta exportacion y el pipeline original; no se especifican en la informacion proporcionada el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial, algo por otra parte poco habitual en un clasificador de este tipo.

## Capacidades

- Deteccion de audio generado por IA (deepfake de voz) mediante un logit por ventana de 4 segundos.
- Clasificacion por ventana deslizante, lo que permite localizar segmentos sinteticos dentro de grabaciones mas largas.
- Inferencia portable via ONNX Runtime en CPU y GPU, sin dependencia de PyTorch.
- Integracion en ensembles: el propio autor lo describe como componente del ensemble de voz de GPTTrace.
- Cuantizacion int8 parcial con paridad documentada frente al pipeline original.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo; es exclusivamente un discriminador.

## Casos de uso

- Moderacion de contenido en plataformas de audio: procesar cada ventana de 4 s de un audio subido y marcar como sospechosos los fragmentos cuyo logit supere un umbral, permitiendo revision humana selectiva en lugar de escuchar la grabacion completa.
- Verificacion de autenticidad en periodismo: analizar declaraciones o filtraciones de audio recibidas por una redaccion y obtener una puntuacion por segmento antes de publicar, con trazabilidad gracias al fichero de paridad.
- Antifraude en banca y telecomunicaciones: detectar voces sinteticas en llamadas grabadas o en mensajes de voz enviados a canales de atencion, ejecutando el modelo ONNX en el backend sin necesidad de GPUs dedicadas.
- Deteccion de suplantacion de identidad en verificacion biomedica: como capa previa a un sistema de reconocimiento de locutor, descartar muestras con alta probabilidad de sintesis para evitar ataques de replay o clonacion.
- Investigacion en forense de audio: usar el modelo como linea base reproducible en ONNX para comparar tecnicas de deteccion, aprovechando la cuantizacion int8 para ejecutar barridos masivos sobre corpus grandes.
- Proteccion de menores y plataformas de mensajeria: analizar notas de voz en el dispositivo o en el servidor con ONNX Runtime y marcar audios sinteticos antes de su reenvio.
- Construccion de ensembles propios: combinar este detector con otros clasificadores de audio, tal como hace GPTTrace, agregando los logits por ventana para reducir falsos positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion mencionado es el fichero `parity.json`, que recoge el acuerdo entre esta exportacion ONNX y el pipeline original del modelo base, pero no se proporcionan sus valores numericos.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio pesa 2,3 GB, por lo que en FP32 el grafo requiere del orden de esa cifra de memoria y algo menos con la cuantizacion int8 parcial, pero no se confirma el reparto exacto.
- GPU recomendadas: no disponibles. Al ser un clasificador de ventanas de 4 s, es probable que funcione en GPUs de gama media, pero la informacion no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecucion en CPU, lo que elimina la dependencia de GPU para lotes pequenos.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con integracion posible en servicios Python, C++ o C#. No se documentan exportaciones a TensorRT, OpenVINO ni otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de entrada | Licencia | Formato |
|---|---|---|---|---|---|
| `nakas/gpttrace-audio-pellav2-onnx` | Detector de deepfake de audio | no disponible | Ventanas de 4 s a 16 kHz | MIT | ONNX |
| `Sadanie/pellav2-audio-deepfake-detector` | Detector de deepfake de audio | no disponible | Ventanas de 4 s a 16 kHz | MIT | PyTorch (presumiblemente) |
| AASIST y variantes | Detector de audio sintetico | no disponible | Segmentos cortos de audio | habitualmente MIT o similar | PyTorch |
| Wav2Vec2-based anti-spoofing | Detector de audio sintetico | no disponible | Segmentos de audio | variable | PyTorch / ONNX |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es el formato (ONNX con cuantizacion int8 parcial) y la presencia de un fichero de paridad; frente a otros detectores, la ventaja declarada es la portabilidad del runtime.

## Limitaciones y advertencias

- Es un clasificador binario, no un modelo generativo: no produce texto, codigo ni audio, y no admite instrucciones.
- Solo se evalua la paridad frente al pipeline original; no hay metricas publicas de precision, recall o tasas de falsos positivos en dominios reales.
- La cuantizacion int8 parcial puede degradar ligeramente la calibracion de los logits; el fichero `parity.json` es la unica garantia documentada y sus valores no se detallan.
- El modelo esta especializado en ventanas de 4 s a 16 kHz con `SeamlessM4TFeatureExtractor`; usar otro preprocesado invalida los resultados.
- No se especifican sesgos por idioma, acento, genero o calidad de grabacion, un riesgo relevante en deteccion de deepfakes.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos que deben calibrarse con datos propios.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- No se documentan limitaciones de contexto porque el modelo no opera sobre texto; la ventana de 4 s es una restriccion de diseno, no una limitacion de contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nakas/gpttrace-audio-pellav2-onnx
- Modelo base: https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; los resultados devueltos corresponden a entidades no relacionadas (Nakastream, Philippos Nakas SA, Nakas Music Cyprus, Philippos Nakas Conservatory).
