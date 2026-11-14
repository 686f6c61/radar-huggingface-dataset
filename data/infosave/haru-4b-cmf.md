# infosave/Haru-4B-cmf

## Resumen

Haru-4B-cmf es un empaquetado en formato CMF del modelo Haru-4B de higurashi-ai, un sistema de voz full-duplex (speech-to-speech) que escucha y habla de forma simultánea, de manera análoga a una conversación telefónica humana. Cada 133 ms procesa un frame de audio del usuario y emite un frame de audio propio junto con su transcripción textual. El modelo subyacente combina un modelo de lenguaje Qwen3.5-4B, proyectores de audio, una cabeza de generación MeanFlow y el códec VibeVoice.

La aportación de este repositorio, publicado por infosave, es doble: por un lado, condensa todos los componentes (modelo de lenguaje, proyectores, cabeza MeanFlow y códec) en un único fichero CMF de 6,37 GB; por otro, permite ejecutarlo con `cortiq`, un motor escrito en Rust que no requiere Python ni frameworks de machine learning. Esto reduce la fricción de despliegue en entornos de producción y facilita la inferencia en GPU mediante CUDA, Vulkan o Metal.

El modelo es relevante porque demuestra que es posible una conversación de voz full-duplex con latencias muy por debajo del tiempo real (23 ms por frame de 133 ms en una RTX A5000 con CUDA, es decir, 5,8 veces más rápido que tiempo real) sin depender del ecosistema Python. La licencia es Apache-2.0, heredada del modelo original, y el repositorio no está avalado por higurashi-ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje Qwen3.5-4B combinado con proyectores de audio, cabeza MeanFlow y códec VibeVoice; full-duplex speech-to-speech |
| Parametros totales | 4B (modelo de lenguaje base); el total del sistema completo no está disponible |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Solo q8_2f (8 bits) para el modelo de lenguaje; cabeza y códec en f16. Los pesos de 4 bits (q4tp) rompen el modelo |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (fichero único `haru-4b-q8_2f.cmf`, 6,37 GB) |

## Arquitectura y entrenamiento

Haru-4B es un sistema de voz full-duplex construido sobre un modelo de lenguaje Qwen3.5-4B. A este se le añaden proyectores de audio que convierten las representaciones acústicas en tokens que el modelo de lenguaje puede procesar, una cabeza de generación MeanFlow para producir audio y el códec VibeVoice para la síntesis de voz. El procesamiento se realiza por frames de 133 ms: en cada paso el sistema consume un frame de audio del usuario y genera simultáneamente un frame de audio de salida y su texto asociado, lo que permite la escucha y el habla concurrentes.

El repositorio no documenta el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del autor del empaquetado indica que Haru-4B es un modelo base preentrenado liberado para investigación, que mantiene conversaciones naturales pero no está ajustado para seguir instrucciones como un asistente. La conversión a CMF re-cuantiza el modelo de lenguaje a 8 bits y mantiene la cabeza y el códec en f16; según el autor, el códec reproduce la referencia de PyTorch con un error de 1,3·10⁻³. No se dispone de más detalles sobre la innovación técnica interna del modelo original.

## Capacidades

- Generación de voz full-duplex: escucha y habla de forma simultánea, procesando frames de 133 ms.
- Conversión speech-to-speech con salida de audio y transcripción textual alineada.
- Conversación multi-turno natural, con capacidad de mantener el hilo de una charla.
- Clonación de voz mediante referencia: acepta de 3 s a 3 min de audio de un mismo hablante para fijar la voz de salida.
- Soporte multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Salida estéreo opcional (`--stereo`), con el usuario en el canal izquierdo y el modelo en el derecho.
- Configuración de generación ajustable: temperatura (0,7 por defecto), top-k (25), guidance scale (1,5) y semilla.
- Soporte de system prompt para definir una "character card" del personaje.
- Opción `--speak-first` para que el modelo tome la iniciativa en la conversación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio de entrada más allá del propio flujo de voz: no disponible.

## Casos de uso

- Atención al cliente por voz: el modelo puede gestionar una conversación hablada en tiempo real con latencias de 23 ms por frame en CUDA, lo que permite respuestas ágiles y solapamiento natural entre turnos, adecuado para líneas de soporte telefónico.
- Asistentes conversacionales embebidos: al ejecutarse con `cortiq` sobre CUDA, Vulkan o Metal sin Python, puede integrarse en aplicaciones de escritorio o dispositivos con GPU consumer, reduciendo la dependencia de infraestructura Python.
- Demostraciones y prototipos de voz full-duplex: el flujo `cortiq duplex` permite procesar un `user.wav` y generar un `reply.wav` con salida estéreo, útil para evaluar la calidad de la conversación antes de desplegar un sistema en vivo.
- Investigación en interacción hablada: el modelo base permite estudiar dinámicas de turnos, solapamiento y naturalidad conversacional en nueve idiomas, con control de temperatura, top-k y semilla para reproducibilidad.
- Generación de contenido de audio con voz personalizada: usando `--reference` con 3 s a 3 min de un hablante autorizado, se puede producir audio con una voz concreta para podcasts, demos o narraciones, siempre que se tengan los derechos de la voz.
- Pruebas de integración en pipelines Rust: al ser un motor nativo, puede incorporarse en servicios backend escritos en Rust que necesiten síntesis y reconocimiento de voz conjuntos sin orquestar procesos Python.
- Evaluación de cuantización y rendimiento: el fichero único q8_2f permite medir latencia y throughput en distintas GPU (A5000, M4) y backends (CUDA, Vulkan, Metal) para dimensionar despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento proporcionados son de latencia por frame:

| Backend / hardware | Latencia por frame de 133 ms | Aceleración vs. tiempo real |
|---|---|---|
| RTX A5000 (24 GB), CUDA | 23 ms | 5,8× |
| RTX A5000, Vulkan | 53 ms | ~2,5× |
| Apple M4 (24 GB), Metal | 84 ms | ~1,6× |

El prompt y la referencia de voz se procesan una sola vez y tardan entre 4 y 13 s. El códec coincide con la referencia de PyTorch con un error de 1,3·10⁻³.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 6,37 GB; se ha validado en una RTX A5000 de 24 GB y en un Apple M4 de 24 GB de memoria unificada. No se especifica el mínimo exacto de VRAM, pero al ser un único fichero de 6,37 GB se necesita al menos esa cantidad más el overhead del motor.
- GPU recomendadas: RTX A5000 (24 GB) con CUDA para máxima velocidad (23 ms/frame); cualquier GPU compatible con Vulkan (53 ms/frame en A5000); Apple Silicon con Metal (84 ms/frame en M4).
- Cabe en GPU consumer: no se confirma explícitamente; el tamaño del fichero (6,37 GB) sugiere que podría caber en GPU con 8-12 GB de VRAM, pero no hay datos publicados al respecto.
- Opciones de despliegue: `cortiq` (motor Rust), instalable con `cargo install cortiq-cli --features cuda` para NVIDIA, o sin esa feature para Vulkan o Metal. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 23 ms por frame de 133 ms en CUDA (5,8× tiempo real), 53 ms en Vulkan y 84 ms en Metal. El prompt y la referencia de voz añaden 4-13 s de procesamiento inicial.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base es higurashi-ai/Haru-4B, del que este repositorio es una conversión cuantizada a CMF; no se han facilitado datos de otras alternativas de speech-to-speech full-duplex para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Haru-4B-cmf (este) | 4B (LM) | no disponible | Apache-2.0 | CMF (q8_2f) | Full-duplex, motor Rust, 23 ms/frame en CUDA |
| higurashi-ai/Haru-4B | 4B | no disponible | Apache-2.0 | no disponible | Modelo original en PyTorch |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: mantiene conversaciones naturales pero no es una fuente fiable de hechos y no sigue instrucciones como un asistente.
- Riesgo de alucinación: al no estar ajustado para exactitud factual, puede generar afirmaciones incorrectas con fluidez.
- La cuantización a 4 bits rompe el modelo: con q4tp, incluso limitando a 4 bits solo las capas feed-forward, el flujo de texto se convierte en ruido. No existe un fichero más pequeño que el q8_2f de 6,37 GB.
- Clonación de voz: el modelo puede imitar la voz de un clip de referencia; solo deben usarse voces sobre las que se tengan derechos. Esto conlleva riesgos de suplantación y requiere controles de uso.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el repositorio no está hecho ni avalado por higurashi-ai, y el modelo original se libera para investigación; conviene revisar las condiciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del empaquetado.
- No se documentan sesgos conocidos, longitud de contexto ni comportamiento en idiomas distintos de los nueve listados.
- Dependencia del motor `cortiq` y del formato CMF: no es directamente compatible con ecosistemas como transformers, vLLM o llama.cpp.
- El procesamiento inicial del prompt y la referencia de voz tarda entre 4 y 13 s, lo que afecta al arranque de cada sesión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Haru-4B-cmf
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Repositorio del motor CMF: https://github.com/infosave2007/cmf
- Repositorio de Haru (demo en vivo con micrófono): https://github.com/higurashi-ai/Haru
- Muestra de conversación: https://huggingface.co/infosave/Haru-4B-cmf/resolve/main/samples/conversation_stereo.mp3
- Referencia de voz: https://huggingface.co/infosave/Haru-4B-cmf/resolve/main/samples/voice_reference.mp3
