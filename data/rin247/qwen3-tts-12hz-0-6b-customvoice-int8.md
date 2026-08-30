# Rin247/Qwen3-TTS-12Hz-0.6B-CustomVoice-INT8

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-INT8 es una version cuantizada en INT8 (weight-only) del modelo de sintesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice, desarrollado originalmente por el equipo Qwen de Alibaba. Este checkpoint concreto, publicado por el usuario Rin247, mantiene las capacidades del modelo original —sintesis multilingue, control fino por instrucciones en lenguaje natural y generacion en streaming— reduciendo el peso en memoria mediante cuantizacion de 8 bits.

El modelo pertenece a la familia Qwen3-TTS, una serie de sistemas text-to-speech de codigo abierto que soporta clonacion de voz, diseno de voces personalizadas y control expresivo mediante lenguaje natural. La variante CustomVoice de 0.6B se apoya en un tokenizador de audio a 12 Hz y ofrece nueve timbres premium predefinidos. Su relevancia actual radica en que combina baja latencia (hasta 97 ms de extremo a extremo), soporte para diez idiomas y una licencia Apache 2.0 que permite uso comercial sin restricciones significativas.

La version INT8 aqui documentada reduce el tamano del repositorio a 1,3 GB, lo que facilita su despliegue en entornos con recursos limitados, como GPUs de consumo o inferencia en CPU. El modelo mantiene el pipeline de text-to-speech completo y es compatible con el paquete `qwen-tts` para integracion directa en Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer con tokenizador de audio a 12 Hz) |
| Parametros totales | 905.788.672 (~0,9 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 weight-only |
| Idiomas soportados | chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS es una familia de modelos de sintesis de voz basada en arquitectura transformer, disenada para generar audio de forma autoregresiva a partir de texto. La variante de 0.6B utiliza un tokenizador de audio a 12 Hz (Qwen3-TTS-Tokenizer-12Hz) que discretiza la senal de audio en tokens de alta frecuencia temporal, permitiendo una sintesis de baja latencia y apta para streaming. El modelo acepta tres entradas: el texto a sintetizar, un identificador de voz (speaker) y una instruccion en lenguaje natural que controla tono, ritmo y expresion emocional.

El entrenamiento del modelo original combina datos multilingues de los diez idiomas soportados, con un enfoque en robustez y control fino de la voz. No se han publicado detalles especificos sobre el volumen de datos de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en la informacion disponible. La cuantizacion INT8 aplicada en este checkpoint es de tipo weight-only, lo que significa que solo los pesos se reducen a 8 bits mientras que las activaciones permanecen en precision completa, minimizando la perdida de calidad en la salida de audio.

## Capacidades

- Sintesis de voz multilingue en diez idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Control expresivo mediante instrucciones en lenguaje natural, por ejemplo "habla con un tono muy alegre" o "usa un tono enfadado".
- Nueve voces premium predefinidas: Vivian, Serena, Uncle_Fu, Dylan, Eric, Ryan, Aiden, Ono_Anna y Sohee, cada una con caracteristicas de timbre y acento especificos.
- Generacion en streaming con latencia de extremo a extremo de hasta 97 ms gracias al tokenizador de 12 Hz.
- Clonacion de voz y diseno de voces personalizadas (funcionalidad de la familia Qwen3-TTS, disponible en el repositorio oficial).
- Integracion sencilla mediante el paquete `qwen-tts` con soporte para `flash_attention_2` y `device_map` para despliegue distribuido.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede generar respuestas de voz en diez idiomas con control emocional, permitiendo a un sistema IVR adaptar el tono segun el estado de la conversacion (por ejemplo, tono calmado para reclamaciones o alegre para confirmaciones).
- Locucion para video y contenido multimedia: los creadores pueden generar narraciones en multiples idiomas usando las voces predefinidas, con instrucciones de estilo que ajustan ritmo y enfasis sin necesidad de edicion posterior.
- Asistentes de voz en dispositivos embebidos: gracias a la cuantizacion INT8 y al tamano reducido (1,3 GB), el modelo puede desplegarse en hardware de gama media para generar respuestas de voz en tiempo real con baja latencia.
- Accesibilidad y lectura de pantalla: integracion en aplicaciones de lectura de texto para personas con discapacidad visual, con soporte multilingue y voces naturales que mejoran la experiencia de usuario.
- E-learning y plataformas de formacion: generacion automatica de contenido de audio para cursos en linea, con voces distintas para diferentes personajes o modulos y control de tono pedagogico mediante instrucciones.
- Pruebas de producto y prototipado rapido: los equipos de producto pueden generar muestras de voz realistas para validar flujos conversacionales antes de invertir en grabaciones profesionales, usando la API de Python del paquete `qwen-tts`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparativas con otros sistemas TTS. El unico dato de rendimiento mencionado es la latencia de sintesis de extremo a extremo de 97 ms, atribuida al tokenizador de 12 Hz.

## Requisitos de hardware

- VRAM estimada para inferencia: con 905,7 millones de parametros en INT8, los pesos ocupan aproximadamente 0,9 GB. Con activaciones y overhead del runtime, se estima un consumo de 2-4 GB de VRAM en inferencia con batch pequeno.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problemas. Tambien es viable en GPUs de datacenter como A10, A100 o H100 para despliegues con mayor concurrencia.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs consumer de gama media y baja gracias a la cuantizacion INT8.
- Opciones de despliegue: el paquete `qwen-tts` permite cargar el modelo con `device_map="cuda:0"` y `attn_implementation="flash_attention_2"`. No se menciona soporte explicito para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: la latencia de sintesis se indica en 97 ms de extremo a extremo para el modelo original; la version INT8 puede presentar valores ligeramente superiores o inferiores segun el hardware, aunque no se dispone de mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice (original) | ~0,9 B | BF16 | 10 | Apache 2.0 | Modelo base sin cuantizar, mayor precision |
| Qwen3-TTS-12Hz-0.6B-CustomVoice-INT8 (este checkpoint) | ~0,9 B | INT8 weight-only | 10 | Apache 2.0 | Version cuantizada, menor huella de memoria |
| Qwen3-TTS-12Hz-0.6B-CustomVoice-OpenVINO-INT8 | ~0,9 B | INT8 (OpenVINO) | 10 | Apache 2.0 | Variante optimizada para CPU con OpenVINO |

No se dispone de informacion suficiente para comparar con modelos TTS de otros desarrolladores (como Whisper-TTS, Bark o XTTS) en terminos de calidad de voz o benchmarks objetivos.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir una ligera degradacion en la calidad del audio en comparacion con el modelo original en BF16, especialmente en voces con mucha variacion tonal o en idiomas con fonetica compleja.
- El modelo esta optimizado para los nueve timbres predefinidos; el uso de voces fuera de este conjunto requiere funcionalidades de clonacion de voz que no estan documentadas en este checkpoint especifico.
- Se recomienda usar cada voz en su idioma nativo para obtener los mejores resultados; el uso cruzado de idiomas puede producir pronunciaciones incorrectas o acentos artificiales.
- No se han publicado evaluaciones de sesgos o comportamientos problematicos en la generacion de voz. Como cualquier sistema TTS, podria generar contenido hablado inapropiado si se le proporcionan textos ofensivos.
- La latencia de 97 ms corresponde al modelo original; la version INT8 puede variar segun el hardware y el runtime utilizado.
- El checkpoint es una publicacion de la comunidad (Rin247) y no un lanzamiento oficial de Qwen; se recomienda verificar la integridad de los pesos antes de usarlo en produccion.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-0.6B-CustomVoice-INT8
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Repositorio GitHub de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Paper tecnico (arXiv): https://huggingface.co/papers/2601.15621
- Demo interactiva en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Variante OpenVINO INT8: https://huggingface.co/aurora2035/Qwen3-TTS-12Hz-0.6B-CustomVoice-OpenVINO-INT8
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
