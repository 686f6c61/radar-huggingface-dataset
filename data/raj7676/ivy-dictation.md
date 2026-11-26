# raj7676/ivy-dictation

## Resumen

Ivy Dictation es un modelo de reconocimiento automatico del habla (ASR) especializado en dictado, desarrollado por Glow.co (autor raj7676 en Hugging Face) como fine-tune de Qwen3-ASR-1.7B de Alibaba Cloud. Su particularidad es que no se limita a transcribir literalmente lo que se dice: aplica las autocorrecciones del hablante en una sola pasada, elimina muletillas y tartamudeos, y anade puntuacion y mayusculas. Por ejemplo, ante "Let's meet on Tuesday, sorry, I mean Thursday" produce directamente "Let's meet on Thursday".

El modelo tiene 1.720.574.976 parametros y se distribuye en formato GGUF para llama.cpp, dividido en dos ficheros: el modelo de lenguaje cuantizado a Q8_0 (1,83 GB) y el codificador de audio con su proyector en F16 (0,64 GB). Es la pieza central de Ivy, una aplicacion de dictado offline gratuita para Windows, Linux y Android, lo que lo convierte en un caso de uso practico de ASR local sin dependencia de la nube.

Su relevancia actual radica en dos factores: la integracion de la correccion semantica dentro del propio modelo ASR (sin un segundo modelo de reescritura) y su despliegue totalmente offline mediante llama.cpp con soporte multimodal de audio. La licencia es Apache 2.0 con Commons Clause, lo que permite uso, estudio y fine-tune, pero prohibe la venta de productos cuyo valor provenga principalmente del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3-ASR-1.7B + codificador de audio y proyector); inferencia via llama.cpp mtmd |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje), F16 (codificador de audio y proyector); en Android se usan variantes de 0,6B y 0,5B |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 con Commons Clause (apache-2.0-with-commons-clause); el modelo base Qwen3-ASR-1.7B mantiene Apache 2.0 |
| Formato de pesos | GGUF (ivy-Q8_0.gguf y mmproj-ivy-f16.gguf) |
| Entrada | audio mono a 16 kHz |
| Tamano del repo | 4,1 GB |
| Modelo base | Qwen/Qwen3-ASR-1.7B |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B, un ASR multimodal de Alibaba Cloud que procesa audio a traves de un codificador y lo proyecta al espacio del modelo de lenguaje. Ivy anade un fine-tune con LoRA sobre ese modelo base, que posteriormente se fusiona en los pesos y se convierte a GGUF. La inferencia se realiza en llama.cpp mediante la API multimodal (mtmd), alimentando audio de 16 kHz mono junto con un prompt de sistema que instruye al modelo a escribir lo que el hablante quiere decir, aplicando sus propias correcciones y conservando el resto de palabras.

El entrenamiento se realizo sobre muchas horas de habla real (salas ruidosas, microfonos baratos, multiples acentos) con transcripciones escritas por humanos, mas miles de parrafos de dictado guionizados llenos de autocorrecciones, leidos con muchas voces y sobre ruido de fondo real. Todos los objetivos de entrenamiento fueron escritos por humanos, sin transcripciones generadas por IA. El modelo produce la salida limpia y se detiene en `<|im_end>`. No se detalla el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla en ingles con transcripcion de audio a texto.
- Autocorreccion semantica en una sola pasada: aplica las rectificaciones del hablante ("sorry, I mean...", "actually make it...", "no wait...").
- Eliminacion de muletillas y tartamudeos ("um", "uh", repeticiones de palabras).
- Puntuacion y mayusculas automaticas.
- Salida lista para pegar directamente en cualquier campo de texto.
- Procesamiento totalmente offline una vez descargado el modelo.
- Integracion con llama.cpp mediante la API mtmd (audio como entrada multimodal).
- No se documenta soporte de tool calling, agentes, vision ni audio de salida.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Dictado de texto en escritorio: la aplicacion Ivy captura audio con una tecla mantenida (Ctrl + Shift) y el modelo transcribe y limpia el texto alli donde este el cursor, adecuado para redactar correos, notas o documentacion sin cambiar de aplicacion.
- Redaccion de mensajes con correcciones en tiempo real: al dictar frases con rectificaciones ("el miercoles, perdon, el jueves"), el modelo entrega la version final sin necesidad de editar manualmente, lo que reduce la friccion en comunicaciones rapidas.
- Notas de reunion o apuntes: con clips de hasta 30 segundos y latencia de 0,34 s en GPU, permite transcribir intervenciones cortas de forma casi instantanea y offline, util en entornos sin conexion o con requisitos de privacidad.
- Accesibilidad: personas con movilidad reducida o dificultades para teclear pueden introducir texto en cualquier aplicacion de Windows, Linux o Android mediante voz, con el modelo ejecutandose localmente.
- Uso en dispositivos moviles sin red: la version Android incluye modelos mas pequenos (0,6B de voz y 0,5B de pulido de texto, unos 1,5 GB) que permiten dictado offline en el telefono.
- Entornos con privacidad estricta: al no enviar audio a ningun servidor, encaja en flujos de trabajo donde los datos de voz no pueden salir del dispositivo (sanidad, legal, banca).
- Integracion en pipelines propios: al ser GGUF para llama.cpp, puede incorporarse a aplicaciones personalizadas que necesiten transcripcion con limpieza semantica sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, MMLU, etc.) en la informacion disponible. El autor unicamente proporciona mediciones de latencia en la aplicacion Ivy (llama.cpp, mediana de ejecuciones) sobre una RTX 4060 Laptop GPU y un Intel Core i7:

| Duracion del clip | GPU (Vulkan) | Solo CPU |
|---|---|---|
| 5 s | 0,22 s | 1,95 s |
| 15 s | 0,33 s | 3,20 s |
| 30 s | 0,34 s | 4,88 s |

## Requisitos de hardware

- VRAM estimada: el modelo de lenguaje Q8_0 ocupa 1,83 GB y el codificador de audio F16 0,64 GB, por lo que la inferencia completa requiere aproximadamente 2,5-3 GB de memoria (GPU o RAM).
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM; el autor mide sobre una RTX 4060 Laptop. GPUs de gama alta (A100, H100) no aportan ventaja significativa dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante, e incluso integradas con suficiente memoria compartida), y funciona en CPU sola con latencias de 2-5 s por clip.
- Opciones de despliegue: llama.cpp (con API mtmd para audio), la aplicacion Ivy para Windows/Linux/Android. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: 0,22-0,34 s por clip de 5-30 s en GPU Vulkan; 1,95-4,88 s en CPU. El throughput no se especifica en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ivy Dictation | 1,72B | no disponible | en | Apache 2.0 + Commons Clause | GGUF |
| Qwen3-ASR-1.7B (base) | 1,7B | no disponible | no disponible | Apache 2.0 | no disponible |
| Whisper large-v3 (referencia ASR) | ~1,55B | no disponible | multilingue | MIT | safetensors, GGUF, etc. |

No se dispone de datos de benchmark comparativos en la informacion proporcionada. La diferencia funcional clave de Ivy frente a un ASR convencional es la correccion semantica integrada y la limpieza de muletillas en una sola pasada, capacidades que Whisper u otros ASR estandar no ofrecen de forma nativa. Frente a su modelo base, Ivy anade el fine-tune para dictado y la conversion a GGUF para ejecucion offline.

## Limitaciones y advertencias

- Solo soporta ingles; el prompt fija explicitamente "language English".
- Riesgo de alucinacion o de "corregir" en exceso: al aplicar correcciones semanticas, puede alterar el significado si interpreta mal una rectificacion o un cambio de idea.
- No se documentan sesgos especificos, pero al entrenarse con habla real de acentos y entornos concretos puede tener sesgos de acento, genero o dominio.
- La licencia Commons Clause prohibe vender productos o servicios cuyo valor provenga principalmente del modelo; el uso comercial directo esta restringido.
- El nombre y el logo "Ivy" pertenecen a Glow.co y no se ceden con la licencia; cualquier copia modificada debe usar su propio nombre e icono.
- En Linux, el soporte en Wayland esta en pruebas y solo funciona el atajo Ctrl + Shift; no hay version para Arch, ARM ni PCs de 32 bits.
- La longitud de contexto no esta publicada, lo que limita la planificacion de clips largos.
- No se especifican requisitos de tool calling ni integracion con agentes; no es un modelo conversacional general.
- La version Android usa modelos distintos y mas pequenos (0,6B y 0,5B), por lo que su calidad puede diferir de la version de escritorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raj7676/ivy-dictation
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Web oficial de Ivy: https://raj-7676.github.io/ivy-dictation/
- Codigo fuente en GitHub: https://github.com/raj-7676/ivy-dictation
- Releases (Windows, Android APK, Linux): https://github.com/raj-7676/ivy-dictation/releases/latest
- Microsoft Store: https://apps.microsoft.com/detail/9P420N80LXQJ
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Politica de marca: https://github.com/raj-7676/ivy-dictation/blob/main/TRADEMARK.md
- Carpeta de modelos Android: https://huggingface.co/raj7676/ivy-dictation/tree/main/android
