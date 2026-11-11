# onemira/eres2net-base-3dspeaker-onnx

## Resumen

El modelo `onemira/eres2net-base-3dspeaker-onnx` es un espejo byte a byte del modelo de reconocimiento de hablante ERes2Net-Base publicado originalmente en ModelScope por el equipo de 3D-Speaker (iic) bajo el identificador `speech_eres2net_base_sv_zh-cn_3dspeaker_16k`. No se trata de un modelo de lenguaje generativo, sino de un extractor de embeddings de hablante (speaker verification/identification) empaquetado en formato ONNX y distribuido por el proyecto sherpa-onnx. El repositorio lo mantiene OneMira AI como artefacto local para su grabadora de voz C1 y su sistema MCP, sin modificar pesos ni metadatos.

ERes2Net es una arquitectura de red neuronal convolucional con módulo de fusión de embeddings residuales (residual embedding fusion), diseñada específicamente para tareas de verificación de hablante. El modelo opera sobre audio de 16 kHz y produce un vector de embedding que permite comparar voces mediante similitud coseno. Su relevancia práctica radica en que es un componente ligero (cerca de 40 MB), ejecutable en CPU, que habilita diarización y autenticación biométrica por voz en local sin dependencias de nube.

El modelo está entrenado sobre corpus en mandarín (`zh-cn`) según indica el identificador upstream, aunque la naturaleza de la tarea (embeddings acústicos) permite cierto grado de generalización a otras lenguas. La licencia Apache 2.0 del upstream se mantiene en este espejo, junto con los avisos de procedencia de sherpa-onnx.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Net (CNN con fusión de embeddings residuales) |
| Parametros totales | no disponible (pesos ONNX de 39 593 761 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de análisis dependiente del frontend) |
| Tipos de cuantizacion | no disponible (artefacto ONNX en precisión original) |
| Idiomas soportados | mandarín (`zh-cn`) según identificador upstream; generalización a otras lenguas no documentada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`3dspeaker_speech_eres2net_base_sv_zh-cn_3dspeaker_16k.onnx`) |

## Arquitectura y entrenamiento

ERes2Net (Enhanced Res2Net) es una variante de Res2Net orientada a speaker verification. La arquitectura introduce un módulo de fusión de embeddings residuales que combina representaciones de múltiples escalas para mejorar la discriminabilidad de los embeddings de hablante. El modelo trabaja sobre features acústicas extraídas a 16 kHz (típicamente FBank de 80 dimensiones en el pipeline de 3D-Speaker) y produce un embedding de dimensión fija que se compara mediante similitud coseno.

El entrenamiento original fue realizado por el equipo 3D-Speaker sobre corpus en mandarín, e incluye las etapas habituales en este tipo de sistemas: entrenamiento con pérdida de clasificación (AAM-softmax o similar) y, en algunos pipelines, fine-tuning con métricas de verificación. No se dispone de información detallada sobre número de tokens, composición exacta del dataset ni si hubo etapas de refinamiento adicionales en la documentación proporcionada. La conversión a ONNX la realiza el proyecto sherpa-onnx; OneMira solo redistribuye el artefacto sin modificaciones.

## Capacidades

- Extracción de embeddings de hablante (speaker embeddings) a partir de audio de 16 kHz.
- Verificación de hablante (1:1): determinar si dos segmentos de audio pertenecen a la misma persona.
- Identificación de hablante (1:N): asignar un segmento a una identidad registrada en una galería de embeddings.
- Diarización de hablantes: segmentación y agrupación de voces en una grabación multi-hablante.
- Ejecución local en CPU mediante ONNX Runtime o sherpa-onnx, sin GPU.
- Integración en pipelines de audio en tiempo real por su bajo coste computacional.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales más allá del audio.

## Casos de uso

- Diarización en reuniones y llamadas: el modelo genera embeddings por segmento que un algoritmo de clustering agrupa para etiquetar quién habla en cada momento, aprovechando su tamaño reducido para ejecutarse en el propio dispositivo.
- Autenticación biométrica por voz: comparar el embedding de una frase de verificación con el perfil registrado del usuario mediante similitud coseno, como capa adicional de autenticación en aplicaciones locales.
- Transcripción con etiquetas de hablante: integrado en pipelines ASR (por ejemplo, con sherpa-onnx o Whisper) para enriquecer transcripciones con atribución de voz sin enviar audio a la nube.
- Indexación y búsqueda de archivos de audio: generar embeddings de cada intervención para permitir búsquedas del tipo "encuentra segmentos de esta persona" en archivos de grabaciones.
- Grabadoras de voz con identificación local: es el caso de uso declarado por OneMira para su dispositivo C1, que separa hablantes en las grabaciones sin suscripción ni subida a servidores.
- Control de acceso en kioscos o dispositivos embebidos: verificación de hablante en hardware de bajos recursos (Raspberry Pi, SoC ARM) gracias al runtime ONNX y a los ~40 MB del modelo.
- Preprocesado para pipelines de subtitulado: separar hablantes antes de la traducción o el resumen automático de contenido audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ONNX de ~40 MB se ejecuta en CPU con unas pocas decenas de MB de RAM adicionales para el runtime.
- GPU recomendadas: no aplica; opcionalmente cualquier GPU compatible con ONNX Runtime (CUDA/TensorRT) para procesamiento por lotes a gran escala.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos (Raspberry Pi, SoC ARM).
- Opciones de despliegue: ONNX Runtime, sherpa-onnx (runtime de referencia para este artefacto), integración en aplicaciones C++/Python/Rust.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera inferencia en decenas de milisegundos por segmento en CPU moderna, aunque no hay cifras publicadas en esta ficha.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eres2net-base-3dspeaker-onnx (este) | ERes2Net | ~40 MB | ONNX | Apache 2.0 | Hugging Face (espejo), sherpa-onnx |
| ECAPA-TDNN (SpeechBrain) | TDNN + atención | ~80 MB | PyTorch | Apache 2.0 | Hugging Face, SpeechBrain |
| WeSpeaker ResNet34 | ResNet | ~25 MB | ONNX/PyTorch | Apache 2.0 | Hugging Face, WeSpeaker |
| 3D-Speaker CAM++ | CAM++ (D-TDNN) | ~28 MB | ONNX/PyTorch | Apache 2.0 | ModelScope, sherpa-onnx |

La comparativa se basa en características conocidas de estos modelos; no se dispone de resultados de benchmarks comparativos en la información proporcionada para cuantificar diferencias de EER.

## Limitaciones y advertencias

- Es un espejo no oficial: la autoría del modelo corresponde al equipo 3D-Speaker de ModelScope; OneMira no respalda ni modifica los pesos, y no existe endoso del upstream.
- Entrenado principalmente sobre mandarín: el rendimiento en otras lenguas puede degradarse y no está documentado.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling; cualquier expectativa de "modelo de lenguaje" es incorrecta.
- Riesgo de sesgo por condiciones acústicas: el rendimiento depende de la calidad del audio, el canal de grabación y el ruido de fondo; no hay métricas publicadas en esta ficha.
- La verificación de hablante tiene implicaciones de privacidad y biometría; su uso en producción debe cumplir la normativa aplicable (RGPD en la UE) y requerir consentimiento.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse `LICENSE`, `LICENSE.sherpa-onnx`, los metadatos embebidos y el aviso de procedencia.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal sobre validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/onemira/eres2net-base-3dspeaker-onnx
- Modelo upstream en ModelScope: https://modelscope.cn/models/iic/speech_eres2net_base_sv_zh-cn_3dspeaker_16k
- Artefacto ONNX en sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/speaker-recongition-models/3dspeaker_speech_eres2net_base_sv_zh-cn_3dspeaker_16k.onnx
- Dataset de benchmark de OneMira: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- Servidor MCP de OneMira: https://github.com/onemira-space/onemira-mcp
- Producto OneMira C1: https://onemira.com/products/c1
