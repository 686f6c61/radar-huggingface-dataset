# AfkaraLP/CoralGPT-Qwen3-1.7B-merge-70

## Resumen

CoralGPT-Qwen3-1.7B-merge-70 es un modelo de generación de texto afinado a partir de Qwen3-1.7B-Base por el desarrollador independiente AfkaraLP. Su objetivo no es asistir en tareas generales, sino reproducir el registro conversacional de un lobby de Bedwars del servidor CoralMC (Minecraft): mensajes cortos, solapados, con jerga de jugadores, búsquedas de dúo ("LFG"), reclutamiento de clanes y respuestas de una sola palabra. Es la continuación del anterior CoralGPT-Supra-50M-merge-70, que multiplica por 34 el tamaño de parámetros.

El modelo emplea la arquitectura Qwen3ForCausalLM con 1.720.574.976 parámetros, 28 capas, dimensión oculta de 2048, 16 cabezas de atención de consulta y 8 de clave/valor, con embeddings atados. Se entrenó mediante un ajuste fino completo (sin LoRA) sobre 866.379 mensajes reales de 30.142 jugadores recogidos por un bot entre enero y septiembre de 2026, seguido de un segundo ajuste sobre un subconjunto filtrado y una interpolación lineal de pesos en proporción 0,3/0,7 entre ambos.

Su relevancia es acotada pero clara: demuestra que un modelo base pequeño, sin plantilla de chat ni system prompt, puede capturar la dinámica de conversaciones multiusuario no dirigidas cuando el corpus es lo bastante específico. No está pensado como asistente, sino como generador de continuaciones de chat con una distribución muy concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, embeddings atados) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k en el modelo base; entrenado con ventanas de 20 mensajes (~270 tokens) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF F16, Q8_0, Q4_K_M |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF |
| Capas | 28 |
| Dimension oculta | 2048 |
| Cabezas de atencion | 16 Q / 8 KV |
| Modelo base | Qwen/Qwen3-1.7B-Base (pretrained, no instruct) |
| Tamano del repo | 9,8 GB |
| Descargas | 68 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de 28 capas con 2048 dimensiones ocultas, 16 cabezas de consulta y 8 de clave/valor (GQA) y embeddings atados. Sobre esa base se aplica un ajuste fino completo de todos los parámetros, sin adaptadores LoRA, ejecutado en una única NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) con el `Trainer` de Hugging Face en precisión fp (la información disponible se corta en ese punto). La receta consta de dos fases: un ajuste completo sobre el conjunto "full" y otro sobre un conjunto "filtered", cuyos pesos se combinan después mediante interpolación lineal `0,3 × full + 0,7 × filtered`.

Los datos proceden de la base CoralInsights: 866.379 mensajes de 30.142 jugadores registrados por un bot en el lobby de Bedwars de CoralMC entre el 9 de enero y el 1 de septiembre de 2026. El preprocesado elimina los mensajes generados por el propio bot, limita a dos las repeticiones consecutivas de una misma línea (−32.700 mensajes) y segmenta en sesiones cuando hay huecos de más de cinco minutos. El conjunto "full" contiene 155.546 ventanas de 20 mensajes (stride 5) y 41,4 millones de tokens; el "filtered" contiene 46.084 ventanas (stride 2) y 15,6 millones de tokens, tras eliminar spam de LFG/dúo, reclutamiento de clanes, anuncios de Discord/TikTok/YouTube, plugs de `/msg` y `/join`, saludos, respuestas de una palabra y machaqueo de teclado (se conservan 375.000 de 808.000 mensajes) y exigir una media de al menos cinco palabras por mensaje. La partición de evaluación es cronológica: el último 3 % de los mensajes (117 sesiones) queda reservado, estrictamente posterior a todo el chat de entrenamiento.

Como innovación destacable, el modelo prescinde deliberadamente de plantilla de chat y de system prompt: se le pasa el chat en crudo con el formato `[usuario]: mensaje`, una línea por mensaje, y se detiene la generación en el primer salto de línea. Si la última línea es solo `[`, el modelo elige qué usuario habla a continuación.

## Capacidades

- Continuación de chat multiusuario con formato `[username]: message`, una línea por intervención.
- Generación de turnos cortos coherentes con el registro de un lobby de Bedwars (jerga, abreviaturas, respuestas de una o dos palabras).
- Selección del siguiente hablante cuando la última línea es `[`.
- Alternancia de italiano e inglés dentro de una misma conversación, tal como ocurre en el servidor de origen.
- Reproducción de patrones sociales del lobby: búsqueda de dúo, peticiones de estadísticas ("ws"), reclutamiento, discusión informal.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo "thinking".
- No dispone de capacidades de visión ni audio.
- No es un modelo de instrucciones: no responde a preguntas del usuario fuera del flujo de chat.

## Casos de uso

- Simulación de comunidades de jugadores: generar transcripciones sintéticas de chat de lobby con distribución realista de longitud de mensaje, jerga y solapamiento, útil para pruebas de sistemas de moderación.
- Entrenamiento de clasificadores de toxicidad y spam: producir ejemplos etiquetables de conversación de lobby para aumentar datasets de moderación en servidores de Minecraft.
- Bots de ambientación en servidores: integrar el modelo como generador de líneas de PNJ que imiten el tono de un lobby real, con la ventana de 20 mensajes como contexto suficiente.
- Investigación sobre modelos base frente a instruct: servir como caso de estudio reproducible de cómo un base model captura conversación no dirigida sin plantilla de chat.
- Evaluación de pipelines de inferencia ligera: con Q4_K_M (1,1 GB) corre a ~46 tok/s en 4 núcleos ARM (GB10), lo que permite desplegarlo en servidores CPU-only para pruebas de latencia y throughput.
- Generación de datos para ajuste de modelos conversacionales pequeños: producir diálogos de dominio específico (gaming, comunidades hispanohablantes o italianas) que sirvan como corpus de arranque.
- Pruebas de robustez conversacional: evaluar cómo se comportan sistemas de detección de bots ante texto generado con un modelo que imita el registro humano de un lobby.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye únicamente comparaciones cualitativas sobre contexto real reservado (no visto en entrenamiento), con ejemplos como la predicción de "donmignon io" frente al "donmignon" real, o "come va??" frente a "come va". No se aportan métricas agregadas (perplejidad, precisión de siguiente hablante, etc.).

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3,4 GB de pesos más overhead de activaciones y caché KV; con 32k de contexto la caché KV añade varios GB adicionales, aunque el uso previsto (ventanas de ~270 tokens) la mantiene mínima.
- GGUF Q4_K_M: 1,1 GB; Q8_0: 1,8 GB; F16: 3,4 GB.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) para bf16; para CPU-only basta con 4 núcleos ARM (GB10) a ~46 tok/s con Q4_K_M.
- Cabe en GPU consumer sin problema, incluso en iGPU con memoria unificada.
- Opciones de despliegue: `transformers` (con `device_map="auto"`), llama.cpp (`llama-completion` con `-no-cnv`), y por las etiquetas del repo también text-generation-inference y endpoints compatibles. No hay build de LiteRT para esta versión (sí existía para el modelo de 50M).
- Throughput de referencia: ~46 tok/s en 4 núcleos ARM con Q4_K_M; no se han publicado cifras para GPU.
- Parámetros de muestreo recomendados en `generation_config.json`: `temperature=0.8`, `top_p=0.95`, `repetition_penalty=1.05`, `max_new_tokens=60`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoralGPT-Qwen3-1.7B-merge-70 | 1,72B | 32k (base); entrenado a ~270 tokens | Chat de lobby CoralMC (it/en) | Apache 2.0 | HF, safetensors + GGUF |
| CoralGPT-Supra-50M-merge-70 | ~50M | no disponible | Mismo dominio, versión pequeña | no disponible en la información | HF |
| Qwen3-1.7B-Base | 1,72B | 32k | Modelo base generalista | Apache 2.0 | HF |
| Qwen3-1.7B (instruct) | 1,72B | 32k | Asistente generalista con plantilla de chat | Apache 2.0 | HF |

La comparación relevante es con su propio predecesor de 50M (34 veces menor) y con el base original: frente a este último, CoralGPT sacrifica capacidades generales para especializarse en un registro conversacional muy concreto, y frente al instruct, renuncia explícitamente al formato de asistente. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente: ignora preguntas directas del usuario y continúa el chat como si fuera otro jugador. La model card lo señala como comportamiento intencionado.
- Riesgo alto de contenido tóxico, insultos y lenguaje soez, dado que el corpus es chat crudo de un servidor de Minecraft sin filtrado de toxicidad.
- Puede reproducir nombres de usuario reales presentes en los datos de entrenamiento (30.142 jugadores), con implicaciones de privacidad.
- Sesgo de dominio severo: fuera del contexto de lobby de Bedwars en italiano o inglés, la calidad se degrada de forma notable.
- Idiomas limitados a italiano e inglés; el castellano no está entre los idiomas declarados, aunque el modelo pueda producir palabras sueltas por proximidad lingüística.
- Contexto efectivo de entrenamiento de ~270 tokens (20 mensajes); usar ventanas mucho mayores no está validado.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede reproducir material ofensivo o datos personales de terceros; conviene aplicar filtros en producción.
- Solo 68 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy reducido.
- No hay benchmarks publicados; las únicas evaluaciones son cualitativas y sobre un conjunto reservado pequeño (117 sesiones).
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AfkaraLP/CoralGPT-Qwen3-1.7B-merge-70
- Modelo predecesor: https://huggingface.co/AfkaraLP/CoralGPT-Supra-50M-merge-70
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Demo: https://coralgpt.afkara.dev
- Blog del autor: https://afkara.dev/blog/coralgpt
- Base de datos de chat: https://coralinsights.afkara.dev
