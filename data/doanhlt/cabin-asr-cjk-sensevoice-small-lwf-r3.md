# doanhlt/cabin-asr-cjk-sensevoice-small-lwf-r3

## Resumen

cabin-asr-cjk-sensevoice-small-lwf-r3 es un paquete de reconocimiento automático del habla (ASR) derivado de FunAudioLLM/SenseVoiceSmall, preparado por el usuario doanhlt para su integración en la aplicación offline Cabin mediante sherpa-onnx. El modelo se distribuye como un único fichero ONNX cuantizado a int8 (junto con el vocabulario `tokens.txt`) y está pensado para ejecución en dispositivo, sin conexión a red. Su objetivo es transcribir audio en japonés y coreano (CJK) manteniendo además capacidades multilingües heredadas del modelo base.

El paquete se ha ajustado con datos de YouTube en japonés y coreano (YODAS2 con licencia CC BY 3.0 y vídeos nuevos de canales disjuntos de tipo charla, entrevista y vlog), con etiquetas generadas por un profesor R13x (un fine-tune de Qwen3-ASR) que coinciden con los subtítulos, y con FLEURS train (anotaciones humanas). Se aplica además un esquema de aprendizaje sin olvido (LwF, Learning without Forgetting) mediante auto-replay en vietnamita, inglés, francés, alemán, español y chino, para preservar el rendimiento original del modelo base.

Se trata de una versión candidata de investigación: el autor indica que la puerta de calidad en dispositivo y el paso a producción quedan a decisión del propietario, y que el envío comercial está en suspenso legal por la licencia del modelo base (FunASR MODEL_LICENSE v1.1). No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoiceSmall (encoder transformer para ASR, sin especificar detalles adicionales); empaquetado para sherpa-onnx |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `model.int8.onnx`) |
| Idiomas soportados | japonés y coreano (objetivo del ajuste); vietnamita, inglés, francés, alemán, español y chino (preservados vía LwF) |
| Licencia | other (FunASR MODEL_LICENSE v1.1, obra derivada; envío comercial en suspenso legal) |
| Formato de pesos | ONNX (int8) + `tokens.txt` |

## Arquitectura y entrenamiento

El modelo es un derivado de SenseVoiceSmall (FunAudioLLM), un sistema ASR no autorregresivo con encoder transformer y salida CTC-like, aunque la model card no detalla la arquitectura interna más allá de la referencia al modelo base. El paquete se exporta a ONNX en precisión int8 para su uso con `sherpa_onnx.OfflineRecognizer.from_sense_voice(..., use_itn=True)`, lo que habilita la normalización de texto inversa (ITN) en la salida.

El ajuste se realizó sobre audio de YouTube en japonés y coreano (YODAS2, CC BY 3.0, más vídeos nuevos de canales disjuntos de charla, entrevista y vlog, con audio privado) usando etiquetas de un profesor R13x (fine-tune de Qwen3-ASR) que coinciden con los subtítulos, junto con FLEURS train con anotaciones humanas. Para evitar el olvido catastrófico se aplicó LwF con auto-replay en vietnamita, inglés, francés, alemán, español y chino. El autor declara que no se usaron textos de Gemini, Soniox ni OpenAI API. La validación se preinscribió en `mobile-local/distill/DECISIONS.log` (2026-11-20 07:10, brazo sv3) y el conjunto de test de YouTube es disjunto por canal respecto al entrenamiento, con referencia de profesor de nivel T3.

## Capacidades

- Transcripción de voz a texto offline en japonés y coreano, con normalización de texto inversa (ITN) activable.
- Capacidades multilingües heredadas del modelo base: vietnamita, inglés, francés, alemán, español y chino, preservadas mediante LwF.
- Ejecución en dispositivo sin conexión a red, gracias al formato ONNX int8 y la integración con sherpa-onnx.
- Reconocimiento de audio de tipo conversacional (charla, entrevista, vlog) por la composición del conjunto de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente ASR.
- No se documentan capacidades de visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático offline de vídeos en japonés y coreano: el paquete puede transcribir charlas, entrevistas y vlogs en dispositivo, lo que encaja con la composición del conjunto de entrenamiento y evita enviar audio a servicios en la nube.
- Aplicaciones móviles de notas de voz: integrado vía sherpa-onnx, permite dictar y transcribir en japonés o coreano sin conexión, con ITN para normalizar números y fechas en la salida.
- Asistentes de voz embebidos: al ser un paquete ONNX int8 de 0,2 GB, puede desplegarse en dispositivos con recursos limitados para reconocimiento de comandos y dictado en tiempo real.
- Transcripción de reuniones multilingües: las capacidades preservadas en inglés, francés, alemán, español, chino y vietnamita permiten cubrir reuniones con participantes de varios idiomas, aunque el ajuste específico se centra en japonés y coreano.
- Archivado y búsqueda de contenido audiovisual: la transcripción offline facilita indexar vídeos y generar metadatos sin depender de APIs externas.
- Prototipos de investigación en ASR multilingüe: al ser una versión candidata de investigación con puerta de calidad documentada, sirve para reproducir el pipeline de ajuste con profesor y LwF en otros pares de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un `gate.json` con el resultado de la puerta de calidad en el host (PASS), pero no se incluyen cifras de WER ni comparaciones numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el fichero ONNX int8 y el repositorio de 0,2 GB sugieren un modelo pequeño que cabe holgadamente en GPUs de consumo, aunque no se publican cifras.
- GPU recomendadas: no disponible; por el tamaño del paquete, es apto para ejecución en CPU y en GPUs de consumo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del paquete int8, aunque no se confirma en la información disponible.
- Opciones de despliegue: sherpa-onnx (vía `sherpa_onnx.OfflineRecognizer.from_sense_voice`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo ASR ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cabin-asr-cjk-sensevoice-small-lwf-r3 | no disponible | no disponible | ja, ko (ajuste); vi, en, fr, de, es, zh (preservados) | other (FunASR MODEL_LICENSE v1.1) | ONNX int8 |
| FunAudioLLM/SenseVoiceSmall (base) | no disponible | no disponible | multilingüe (modelo base) | FunASR MODEL_LICENSE v1.1 | no disponible |
| Whisper small (referencia de la categoría) | no disponible | no disponible | multilingüe | MIT (según el modelo original) | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la relación de derivación y al formato de distribución.

## Limitaciones y advertencias

- Licencia: el envío comercial está en suspenso legal según la model card, por ser obra derivada de SenseVoiceSmall bajo FunASR MODEL_LICENSE v1.1; es necesario revisar los términos antes de cualquier uso comercial.
- Estado: versión candidata de investigación; la puerta de calidad en dispositivo y el paso a producción quedan a decisión del propietario.
- Idiomas: el ajuste se centra en japonés y coreano; el rendimiento en los idiomas preservados vía LwF puede degradarse respecto al modelo base y no se cuantifica.
- Datos de entrenamiento: parte de las etiquetas provienen de un profesor (R13x) y no de anotación humana, lo que puede introducir sesgos y errores sistemáticos en la transcripción.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo ASR, puede generar texto plausible en segmentos de audio ruidosos o silenciosos.
- Sesgos: no documentados; la composición del dataset (YouTube y FLEURS) puede infrarrepresentar acentos, dialectos y condiciones acústicas no presentes en el entrenamiento.
- No se documentan limitaciones de contexto ni latencia; el uso con sherpa-onnx requiere el runtime y el formato de vocabulario específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doanhlt/cabin-asr-cjk-sensevoice-small-lwf-r3
- Modelo base SenseVoiceSmall: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Repositorio FunASR: https://github.com/modelscope/FunASR
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
