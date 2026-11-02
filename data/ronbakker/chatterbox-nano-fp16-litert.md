# ronbakker/chatterbox-nano-fp16-litert

## Resumen

Chatterbox Nano FP16 LiteRT es una adaptación de despliegue del modelo de síntesis de voz ResembleAI Chatterbox Nano, publicada por el desarrollador ronbakker. El paquete convierte los pesos originales de PyTorch a grafos LiteRT (formato TFLite) con pesos almacenados en FP16, pensados para ejecutarse en Android mediante el runtime LiteRT. El objetivo no es ofrecer un modelo nuevo, sino un conjunto de activos de inferencia listos para integrarse en aplicaciones móviles que necesiten generación de voz en inglés con clonación de voz a partir de una grabación de referencia.

El modelo base, Chatterbox Nano, es un sistema de text-to-speech autoregresivo que genera tokens de habla y los sintetiza en dos pasos acústicos, produciendo audio PCM mono a 24 kHz. Esta adaptación conserva el decodificador autoregresivo de tokens y los pesos de narración aprendidos del checkpoint original (revisión `71ccd1d0081b430592cea481f4307e764e07bc64`), sin reentrenamiento ni decodificador paralelo nuevo. La ventana de atención se limita explícitamente a un estado key/value acotado que crece de 704 a 1024 posiciones.

La relevancia de este paquete es práctica: empaqueta el modelo para inferencia en dispositivo en Android, separando el enrolamiento de voz (CPU) de la narración (GPU), con decodificación de tokens y síntesis acústica en workers independientes. No incluye voces pregrabadas, presets acústicos ni ejecutable autónomo; la aplicación debe aportar el runtime LiteRT, la orquestación nativa, la tokenización de texto y la reproducción de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autoregresivo con decodificador de tokens de habla y síntesis acústica en dos pasos; exportado a grafos LiteRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 posiciones de atención (estado KV acotado que crece de 704 a 1024); máximo 128 tokens de texto por unidad de síntesis |
| Tipos de cuantizacion | FP16 en pesos almacenados; interfaces de estado y características en FP32 donde se especifica; no hay variantes de cuantización adicionales |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (grafos con pesos FP16), tablas de datos en `.f16le` y `.f32le`, condiciones de voz en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un sistema TTS autoregresivo: un modelo de tokens de habla (T3) que genera tokens de forma secuencial, seguido de un módulo acústico que sintetiza la señal en dos pasos fijos con estado recurrente de mel, pitch y fase. La exportación a LiteRT mantiene un único conjunto de pesos T3 compartido entre prefill y decode, con atención de historial explícita y acotada. La generación acústica trabaja en ventanas de 128 tokens de habla con márgenes de contexto de 16 tokens, y el preprocesamiento de WAV se sustituye por downmixing, remuestreo sinc y normalización de sonoridad portables.

No se ha reentrenado el modelo: esta adaptación solo cambia el formato de despliegue y el pipeline de inferencia. El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde al modelo base ResembleAI Chatterbox Nano y no se detalla en esta model card. Las diferencias con el original son de implementación (resampling, ventanas de speaker de 500 frames solapadas, almacenamiento de condiciones en safetensors), y el autor advierte explícitamente que no se reclama identidad numérica con el preprocesamiento original.

## Capacidades

- Generación de voz en inglés a partir de texto usando un hablante enrolado previamente.
- Enrolamiento de voz desde una grabación WAV corta (5,02 a 30 segundos) que produce condiciones reutilizables y compactas.
- Cambio de hablante entre unidades de texto sin recargar los modelos de narración compartidos.
- Producción progresiva de PCM mientras la decodificación de tokens continúa en un worker separado.
- Salida de audio PCM mono a 24 kHz.
- Entrada WAV compatible: RIFF PCM16/24/32 o float32, mono o estéreo, de 8 a 96 kHz.
- Separación de grupos de descarga entre enrolamiento y narración, para diferir los activos de enrolamiento si ya se dispone de una voz.
- No incluye tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Lectura por voz en aplicaciones Android: el modelo genera narración en inglés en el dispositivo con latencia controlada, sin depender de servicios en la nube, usando el runtime LiteRT y los grafos FP16.
- Audiolibros y contenido largo por fragmentos: la aplicación divide el texto en unidades de hasta 128 tokens y encadena la síntesis manteniendo los modelos compartidos cargados, lo que reduce el coste de recarga entre fragmentos.
- Asistentes de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual, con la posibilidad de enrolar una voz personalizada a partir de una grabación breve y reutilizar esas condiciones en sesiones posteriores.
- Clonación de voz para contenido personalizado: enrolamiento de un hablante concreto desde un WAV de al menos 5 segundos y generación de mensajes con esa identidad vocal, guardando las condiciones en un fichero safetensors pequeño.
- Integración en apps de lectura o navegación: síntesis progresiva de PCM que permite a la aplicación gestionar su propio búfer de reproducción y programar la salida de audio de forma independiente a la generación.
- Prototipado de interfaces de voz en Android: el paquete separa enrolamiento (CPU) y narración (GPU), lo que facilita probar flujos de voz sin infraestructura de servidor y con licencia MIT para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,8 GB, lo que da una cota superior aproximada del espacio de almacenamiento de los pesos.
- GPU recomendadas: no disponible; el autor indica que la narración usa la GPU del dispositivo Android y el enrolamiento la CPU, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el destino declarado es Android con runtime LiteRT, no se documentan pruebas en RTX 4090, A100 u H100.
- Opciones de despliegue: runtime LiteRT para Android con orquestación nativa propia; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; el autor menciona que la lectura GPU-CPU del PCM sigue siendo necesaria en el runtime probado y que la reproducción zero-copy con AudioTrack no está garantizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ronbakker/chatterbox-nano-fp16-litert | no disponible | 1024 posiciones; 128 tokens de texto por unidad | en | MIT | LiteRT/TFLite FP16 | HuggingFace, 0 descargas |
| ResembleAI/chatterbox-nano (base) | no disponible | no disponible en esta ficha | en | no disponible en esta ficha | PyTorch | HuggingFace |
| Alternativas TTS en dispositivo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe.
- El límite de 128 tokens de texto por unidad obliga a segmentar entradas largas en puntuación adecuada.
- El estado de atención está acotado a 1024 posiciones, lo que limita el contexto efectivo de generación.
- No es un ejecutable autónomo: requiere runtime LiteRT, orquestación nativa, tokenización de texto, carga de condiciones de voz y reproducción de audio por parte de la aplicación.
- El autor advierte que el remuestreo y las ventanas de speaker no son numéricamente idénticos al preprocesamiento original.
- FP16 describe los pesos almacenados, no garantiza que toda operación de CPU/GPU use aritmética FP16.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad del audio en la información disponible.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base ResembleAI/chatterbox-nano, ya que esta adaptación depende de sus pesos.
- El repositorio no incluye voces pregrabadas, grabaciones de referencia ni audio de muestra; el usuario debe aportar su propia grabación para el enrolamiento.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación comunitaria.

## Enlaces

- [HuggingFace: ronbakker/chatterbox-nano-fp16-litert](https://huggingface.co/ronbakker/chatterbox-nano-fp16-litert)
- [Modelo base: ResembleAI/chatterbox-nano](https://huggingface.co/ResembleAI/chatterbox-nano)
