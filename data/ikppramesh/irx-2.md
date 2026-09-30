# ikppramesh/irx-2

## Resumen

IRx-2 es un modelo de chat de aproximadamente 4.200 millones de parametros (4.205.751.296 exactos segun los pesos safetensors), publicado por el desarrollador independiente ikppramesh en HuggingFace. Se presenta como el hermano mayor de IRx-1 (2B): comparte el mismo conjunto de datos y el mismo pipeline de entrenamiento, pero sobre una base de aproximadamente el doble de tamano, lo que se traduce en mejor razonamiento, redaccion y conocimiento general a costa de roughly la mitad de velocidad (26 frente a 54 tokens/s medidos en la misma CPU de un Mac).

El objetivo declarado del modelo es el uso local, privado y sin conexion en telefonos, tablets y portatiles. Para ello ofrece pesos en formato MLX (Apple Silicon) y una variante GGUF publicada aparte (ikppramesh/irx-2-GGUF) compatible con PocketPal, LM Studio y llama.cpp. El tag qwen3_5 y el tag lora indican que se trata de un ajuste fino tipo LoRA sobre una base de la familia Qwen 3.5, cuantizado a 4 bits y distribuido bajo licencia Apache 2.0.

La relevancia actual del modelo radica en su enfoque "on-device": chat privado sin enviar datos a la nube, con el modo thinking desactivado por defecto (las respuestas empiezan de inmediato en lugar de tras un razonamiento oculto largo), identidad integrada en la plantilla de chat y una verificacion previa a la publicacion que descarta builds que entran en bucle o repiten respuestas anteriores en conversaciones multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (ajuste fino LoRA sobre base de la familia Qwen 3.5, segun el tag qwen3_5) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (tag del repositorio); variante GGUF publicada en repositorio aparte |
| Idiomas soportados | no disponible (el autor no especifica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) y GGUF (repositorio ikppramesh/irx-2-GGUF) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags del repositorio. Los tags qwen3_5 y lora indican que IRx-2 es un modelo derivado, entrenado como ajuste fino LoRA sobre una base de la familia Qwen 3.5, y distribuido en cuantizacion de 4 bits. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. El autor afirma que se empleo "el mismo conjunto de datos y pipeline que IRx-1", sin desglosarlo.

El pipeline incluye varias decisiones tecnicas concretas: el modo thinking se mantiene siempre desactivado, de modo que el modelo no llena la ventana de contexto con razonamiento oculto (un problema en dispositivos con memoria limitada); la identidad del modelo esta integrada en la plantilla de chat; y existe una verificacion previa a la publicacion que rechaza aquellas builds que entran en bucle o repiten respuestas previas en conversaciones de varios turnos. El modelo se distribuye en dos formatos, MLX para Apple Silicon y GGUF para motores de inferencia genericos.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a chat.
- Razonamiento general, redaccion y conocimiento del mundo "mejores que IRx-1" segun el autor, sin cifras publicadas.
- Uso local y offline en telefonos, tablets y portatiles, con procesamiento en el dispositivo.
- Modo thinking desactivado de forma permanente: las respuestas comienzan inmediatamente.
- Identidad integrada: no requiere system prompt, la plantilla de chat aplica la identidad por defecto.
- Compatibilidad con MLX (Apple Silicon) mediante mlx-lm y con motores GGUF (llama.cpp, LM Studio, PocketPal).
- No soporta tool calling ni function calling nativo: el propio autor advierte de que no se entreno en ello.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Asistente de chat privado en el movil: al ejecutarse en el dispositivo (via MLX o GGUF), ninguna conversacion sale del telefono, lo que resulta adecuado para consultas con informacion personal o sensible.
- Respuestas rapidas sin latencia de red: al no depender de un servicio en la nube, funciona en entornos sin conexion (vuelos, zonas rurales, redes restringidas) y evita tiempos de ida y vuelta al servidor.
- Redaccion y edicion de texto en el portatil: para borradores de correos, resumenes o reescritura de parrafos, donde el objetivo es asistencia inmediata y privada en lugar de razonamiento complejo de multiples pasos.
- Prototipado y desarrollo de aplicaciones on-device: sirve como modelo de referencia para probar pipelines MLX y GGUF en iOS, macOS, Android o escritorio antes de decidir el despliegue final.
- Educacion y tutoria ligera offline: explicacion de conceptos generales y ayuda con dudas cotidianas en entornos sin conectividad, asumiendo que los datos concretos deben verificarse.
- Demo o componente de chatbot embebido: al ser Apache 2.0, puede integrarse en productos propios sin obligacion de liberar el codigo, siempre respetando los terminos de la licencia.
- Sustitucion de modelos de mayor tamano cuando la prioridad es la huella de memoria: con aproximadamente 2,4 GB de pesos en 4 bits es viable en hardware modesto donde no caben modelos de 7B o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento facilitado por el autor es de velocidad, no de calidad:

| Metrica | Valor |
|---|---|
| Velocidad en CPU de Mac (IRx-2) | 26 tokens/s |
| Velocidad en CPU de Mac (IRx-1) | 54 tokens/s |
| MMLU, HumanEval, GSM8K u otros | no disponible |

## Requisitos de hardware

- Huella de pesos aproximada: el repositorio ocupa 2,4 GB, coherente con una cuantizacion de 4 bits de un modelo de ~4,2B parametros.
- VRAM/RAM estimada para inferencia (valores orientativos, no publicados por el autor): en torno a 2,5-3,5 GB en 4 bits, 4,5-5 GB en 8 bits y aproximadamente 8,4 GB en fp16.
- Apple Silicon: soporte nativo mediante MLX; el autor reporta 26 tokens/s en CPU de Mac, con mejor rendimiento previsible en GPU unificada.
- GPU de consumo: por tamano, cabe en tarjetas con 4-8 GB de VRAM (por ejemplo, RTX 3050/3060, RTX 4060), si bien no hay cifras de throughput publicadas para estas.
- GPU profesionales (A100, H100): compatibles en terminos de memoria, pero sobredimensionadas para un modelo de 4B; su uso solo tendria sentido por agregacion de peticiones.
- Opciones de despliegue: mlx-lm (Apple Silicon), llama.cpp, LM Studio y PocketPal mediante el repositorio GGUF.
- Latencia y throughput: solo se dispone del dato de 26 tokens/s en CPU de Mac; no hay cifras de latencia ni de throughput en GPU.

## Comparativa con modelos similares

La informacion disponible no incluye benchmarks que permitan una comparacion de calidad con alternativas. La comparacion mas directa documentada es con el propio IRx-1 de la misma familia:

| Modelo | Parametros | Contexto | Velocidad (CPU de Mac) | Licencia | Formatos |
|---|---|---|---|---|---|
| IRx-2 | ~4,2B | no disponible | 26 tokens/s | Apache 2.0 | MLX, GGUF |
| IRx-1 | ~2B | no disponible | 54 tokens/s | Apache 2.0 (no confirmado en la informacion) | MLX, GGUF |
| Otras alternativas de ~3-4B (Qwen, Llama y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado frente a modelos de terceros de tamano similar; cualquier comparacion de calidad seria especulativa.

## Limitaciones y advertencias

- No es un modelo de escala frontera: con ~4B parametros no alcanza a los grandes modelos alojados en tareas de razonamiento multi-paso complejo, problemas de programacion dificiles o amplitud de conocimiento del mundo.
- Riesgo de alucinacion: el autor advierte de que los hechos concretos (lugares, numeros, fechas) deben verificarse, como en cualquier modelo pequeno.
- Sin conocimiento de actualidad: el conocimiento queda fijado en el momento del entrenamiento.
- No soporta tool calling ni function calling nativo: activarlo en aplicaciones de chat produce resultados poco fiables segun el propio autor.
- Idiomas soportados sin especificar: no hay lista oficial, por lo que el comportamiento multilingue es incierto.
- Longitud de contexto no publicada: no puede planificarse el diseno de aplicaciones que dependan de ventanas largas.
- Modelo derivado: al ser un ajuste fino LoRA sobre una base de terceros (familia Qwen 3.5 segun los tags), pueden heredarse sesgos y limitaciones de la base original.
- Adopcion practicamente nula: cero descargas y cero "me gusta" en el momento de la consulta, con publicacion el 30 de septiembre de 2026, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones de la licencia de la base subyacente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikppramesh/irx-2
- Variante GGUF: https://huggingface.co/ikppramesh/irx-2-GGUF
- Modelo hermano IRx-1: https://huggingface.co/ikppramesh/irx-1
- Variante GGUF de IRx-1: https://huggingface.co/ikppramesh/irx-1-GGUF
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo y han sido descartados.
