# ahmadsy/arabic-char-chat-28m

## Resumen

arabic-char-chat-28m es un modelo de lenguaje conversacional en arabe estandar moderno (MSA) desarrollado por el usuario ahmadsy, con 28,2 millones de parametros y una arquitectura poco habitual: un transformer "hourglass" que opera a nivel de caracter en lugar de token. El modelo esta disenado especificamente para mantener conversaciones breves y cotidianas (saludos, aficiones, comida, tiempo, emociones) en un robot de pequeno tamano que ejecuta la inferencia en el propio dispositivo, sin depender de servidores externos.

Se trata de un checkpoint de investigacion (ronda 14, semilla 1, denominado "r14s1") obtenido mediante destilacion de conocimiento del modelo inceptionai/jais-family-590m-chat, con un guard de seguridad y fuera de dominio que debe ejecutarse por delante del modelo. No es un modelo de conocimiento, ni un asistente general, ni un tutor: su alcance esta deliberadamente acotado a small talk. El autor advierte que no ha sido evaluado por humanos y que no es la version adoptada por defecto en su proyecto de origen.

Su relevancia actual reside en la combinacion de tres factores: un tamano extremadamente reducido (112 MB en fp32, 30 MB en cuantizacion q8_0), una licencia Apache-2.0 permisiva y un runtime JavaScript sin dependencias que permite ejecutar el modelo directamente en navegadores, incluidos moviles. Esto lo convierte en un caso practico de interes para quienes exploran inferencia en el dispositivo con presupuestos de memoria minimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hourglass transformer a nivel de caracter (2 pre blocks, pool 4:1, 8 mid blocks, upsample, 2 post blocks) |
| Parametros totales | 28.168.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 caracteres |
| Tipos de cuantizacion | fp32 (original), f16 (GGUF, 56 MB), q8_0 (GGUF, 30 MB) |
| Idiomas soportados | arabe (MSA) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32), GGUF (f16 y q8_0, arquitectura personalizada `hourglass-char`) |

## Arquitectura y entrenamiento

El modelo implementa un transformer jerarquico tipo hourglass, inspirado en el trabajo de Nawrot et al. (2021) sobre transformers jerarquicos eficientes. La secuencia de caracteres pasa primero por dos bloques con atencion de ventana deslizante de 256 posiciones; a continuacion se agrupan 4 caracteres en un vector de chunk mediante pooling, y ocho bloques intermedios aplican atencion causal completa sobre esos chunks. Tras un upsample con conexion residual (cada caracter solo ve chunks ya completos, preservando la causalidad), dos bloques posteriores vuelven a operar con ventana deslizante de 256. La anchura es de 416 con 8 cabezas y SwiGLU de dimension 1120; los bloques usan RMSNorm, QK-norm, RoPE y una puerta sigmoide en la salida de atencion. El vocabulario es de 162 caracteres (letras arabes, digitos, puntuacion y algunos caracteres latinos), con ids 0 para padding y 1 para desconocido.

El entrenamiento se basa en destilacion de conocimiento a nivel de caracter desde jais-family-590m-chat, usando un system prompt orientado a small talk breve y amable en MSA. Los datos proceden de respuestas generadas por el profesor a partir de plantillas y prompts de self-play, una porcion de dialogos de dos turnos conservados solo cuando la respuesta utiliza el contexto del primer turno, y alrededor de un 15 % de preguntas fuera de dominio con respuestas breves de desvio. No se emplearon datos conversacionales escritos por humanos ni datos raspados de la web. La decodificacion por defecto evaluada combina temperatura 0,8, top-p 0,9, un bloqueo de repeticion de cualquier subcadena de 12 caracteres y decodificacion contrastiva (cfg) de 0,5 contra el prompt vacio.

## Capacidades

- Generacion de texto conversacional breve en arabe estandar moderno: respuestas de una a tres frases que terminan en salto de linea.
- Small talk cotidiano: saludos, como fue el dia, aficiones, comida, sentimientos y tiempo atmosferico.
- Mantenimiento de contexto multi-turno limitado, con formato de prompt `س: <mensaje>\nج:` y turnos anteriores encadenados.
- Decodificacion contrastiva (cfg) integrada para reducir respuestas genericas.
- Guard de seguridad y fuera de dominio (numpy) que clasifica el mensaje y devuelve una respuesta enlatada de desvio cuando detecta temas sensibles (medicina, dinero, noticias, matematicas, codigo, traduccion, reparaciones o dano).
- Ejecucion en navegador, WebView y Node mediante `js/hourglass.js`, un runtime JavaScript sin dependencias que lee el GGUF q8_0 directamente.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al arabe; el vocabulario incluye algunos caracteres latinos pero el modelo no esta entrenado para conversar en otros idiomas.

## Casos de uso

- Robot social de sobremesa: el modelo gestiona saludos y conversacion trivial en MSA con respuestas de una a tres frases, encajando en la memoria de un dispositivo embebido gracias a sus 30 MB en q8_0 y su contexto de 512 caracteres.
- Demo web sin backend: el Space ahmadsy/arabic-char-chat-28m-demo ejecuta el GGUF q8_0 en el navegador del usuario (incluidos moviles) con el guard por delante, sin que ningun servidor realice inferencia.
- Aplicacion movil via WebView: cargando `js/hourglass.js` y `js/guard.js` en un WebView se obtiene una ruta de integracion inmediata en Android o iOS sin necesidad de portar llama.cpp.
- Prototipado de interfaces conversacionales en arabe: util para validar flujos de UI, temporizacion de respuestas y diseno de dialogos antes de invertir en un modelo mayor.
- Investigacion sobre destilacion a nivel de caracter: el checkpoint y su codigo (`modeling_hourglass.py`, `gguf_io.py`, `verify.json`) sirven como referencia reproducible de destilacion desde un profesor de 590M a un alumno de 28M.
- Evaluacion de arquitecturas hourglass: el modelo permite medir en la practica el compromiso entre atencion de ventana deslizante y atencion completa por chunks en un presupuesto de computo minimo.
- Filtrado previo con guard en pipelines de chat: el clasificador `guard_clf` (solo numpy) puede reutilizarse como primera capa de defensa en sistemas conversacionales arabes de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta verificaciones de exportacion y paridad entre implementaciones:

| Verificacion | Resultado |
|---|---|
| KL f16 GGUF frente a referencia Python | 4e-8 nats/caracter |
| KL q8_0 GGUF frente a referencia Python | 3,6e-5 nats/caracter |
| Concordancia top-1 q8_0 | 99,7 % |
| Diferencia maxima absoluta de logits JS frente a Python q8_0 (90 caracteres) | 1,1e-5 |
| Concordancia top-1 JS frente a Python q8_0 | 100 % |
| Discrepancias de categoria del guard JS frente a Python (5.844 mensajes) | 0 |
| Latencia de decodificacion en navegador de portatil (un hilo, con cfg) | ~130 ms/caracter |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los formatos; el q8_0 ocupa 30 MB de pesos y el f16 56 MB, por lo que el cuello de botella es el runtime, no la memoria.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (RTX 4090, RTX 3060 o inferior) es sobredimensionada para este modelo.
- Cabe holgadamente en cualquier GPU consumer y en dispositivos moviles; el caso de uso declarado es on-device.
- Opciones de despliegue: PyTorch con `modeling_hourglass.py` y safetensors; lector Python `gguf_io.read_gguf`; runtime JavaScript `js/hourglass.js` en navegador, WebView o Node. vLLM, TGI, Ollama, LM Studio, Jan y PocketPal no son compatibles con los GGUF tal cual.
- Los GGUF usan la arquitectura personalizada `hourglass-char`, ausente en llama.cpp; se requiere una compilacion parcheada segun la especificacion de `LLAMACPP.md`. El autor indica que un build parcheado para una app Android esta planificado pero no terminado.
- Latencia y throughput: aproximadamente 130 ms por caracter en navegador de portatil con un hilo de worker y cfg activado; no se han publicado mediciones en otros entornos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Nivel de token | Licencia | Notas |
|---|---|---|---|---|---|
| arabic-char-chat-28m | 28,2 M | 512 caracteres | Caracter | Apache-2.0 | Destilado de jais-family-590m-chat; guard incluido; runtime JS |
| inceptionai/jais-family-590m-chat | 590 M | no disponible | Token | Apache-2.0 | Profesor del destilado; modelo conversacional arabe de mayor tamano |
| Modelos tiny de chat multilingue (p. ej. variantes <100 M) | <100 M | variable | Token | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

La comparacion cuantitativa de rendimiento frente a alternativas no esta disponible: no se han publicado resultados de benchmarks para este checkpoint ni se dispone de mediciones homogeneas de los modelos citados.

## Limitaciones y advertencias

- No es un modelo de conocimiento: conoce pocos hechos y los inventara; no debe usarse para preguntas factuales.
- No es un asistente, tutor ni sistema de seguridad; las preguntas de medicina, dinero, noticias, matematicas, codigo, traduccion, reparaciones o dano deben ser interceptadas por el guard, no respondidas.
- Checkpoint de investigacion (r14s1): no ha sido valorado por humanos y no es la version adoptada por defecto del proyecto de origen.
- Riesgo de alucinacion alto por diseno, dado el tamano y el objetivo de small talk.
- Contexto limitado a 512 caracteres, lo que restringe la conversacion multi-turno a intercambios muy breves.
- Unico idioma soportado: arabe (MSA); no hay capacidades multilingues reales.
- Dependencia critica del guard: sin el, el modelo puede intentar responder a temas fuera de dominio con contenido inventado.
- Los GGUF no cargan en llama.cpp estandar ni en aplicaciones derivadas (LM Studio, Ollama, Jan, PocketPal); requieren un build parcheado con la arquitectura `hourglass-char`.
- El build parcheado de llama.cpp para Android esta planificado pero no completado; la ruta movil actual pasa por WebView con el runtime JavaScript.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor no ofrece garantias de calidad ni de seguridad para produccion.
- El texto de las respuestas enlatadas del guard en JavaScript se selecciona con un generador aleatorio distinto al de Python, por lo que puede diferir entre implementaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmadsy/arabic-char-chat-28m
- Demo (Space): https://huggingface.co/spaces/ahmadsy/arabic-char-chat-28m-demo
- Modelo profesor: https://huggingface.co/inceptionai/jais-family-590m-chat
- Especificacion para port a llama.cpp: `LLAMACPP.md` (incluido en el repositorio del modelo)
- Paper de referencia de la arquitectura: Nawrot et al. 2021, "Hierarchical Transformers Are More Efficient Language Models" (no se proporciona URL en la informacion disponible)
