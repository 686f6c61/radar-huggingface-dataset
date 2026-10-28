# adamoutler/son-of-emoji-monster-0.005b

## Resumen

`son-of-emoji-monster-0.005b` es un modelo de lenguaje causal minúsculo (5.289.472 parámetros, es decir, 0,005B) desarrollado por Adam N. Outler (usuario `adamoutler` en Hugging Face) y entrenado desde cero. Se trata de un `GPT2LMHeadModel` de tipo decoder-only con 4 capas, 4 cabezas de atención, dimensión de embedding de 256 y una ventana de contexto de solo 128 tokens. No parte de ningún modelo preentrenado: no hereda conocimiento del inglés ni de código, lo que explica su comportamiento.

El objetivo declarado del autor es construir un clasificador de frase a emoji y, como subproducto, un modelo extremadamente rápido y barato de ejecutar. Su entrenamiento se basa en un corpus sintético de 347.898 líneas de historias cortas saturadas de emojis (19,4 millones de palabras, 131,5 MB), generadas por una mezcla de modelos mayores (Gemma, Granite y Gemini 2.5 Flash/Flash-Lite) y tokenizadas con un BPE byte-level propio de 8.192 tokens.

Es relevante ahora no por su calidad lingüística —el propio autor lo describe como "poco más listo que un perro golpeando un sampler"— sino como caso extremo de eficiencia: alcanza 4.266,93 tokens/s de generación en una RTX 3090 con Ollama, con un GGUF F16 de 10,96 MB. Resulta útil como banco de pruebas de pipelines de inferencia, juguete educativo de arquitecturas transformer y generador de datos sintéticos con emojis, no como modelo de producción para texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GPT2LMHeadModel` (transformer decoder-only, language model causal) |
| Parametros totales | 5.289.472 (~5,29 M / 0,005B); 52 tensores, embeddings de entrada/salida atados (`tie_word_embeddings=True`) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128 tokens (`n_ctx` / `n_positions`) |
| Tipos de cuantizacion | FP32 (safetensors) y F16 (GGUF). No se han publicado cuantizaciones Q8/Q4/Q5 en la informacion disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (FP32, 21,16 MB) y `GGUF` (F16, 10,96 MB) |
| Capas (`n_layer`) | 4 bloques decoder (789.504 parametros por bloque) |
| Cabezas de atencion (`n_head`) | 4 (dimension de cabeza = 64) |
| Dimension de embedding (`n_embd`) | 256 |
| Tamano intermedio MLP (`n_inner`) | 1024 (4 x `n_embd`), activacion `gelu_new` |
| Vocabulario | 8.192 tokens (`ByteLevelBPETokenizer`, `PreTrainedTokenizerFast`) |
| Tokens especiales | `eos=0` (`<\|endoftext\|>`), `pad=1` (`<\|pad\|>`), `mask=2` (`<\|mask\|>`) |
| Tamano del repo | 0,0 GB (redondeado); artefactos de 21,16 MB y 10,96 MB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico estilo GPT-2, deliberadamente mínimo: 4 bloques con atención multi-cabeza de 4 cabezas (64 dimensiones por cabeza), MLP con `n_inner = 1024` y activación `gelu_new`, layer norm final de 512 parámetros y embeddings de token (8.192 x 256 = 2.097.152 parámetros) y posicionales (128 x 256 = 32.768 parámetros) atados con la proyección de salida. El desglose completo suma 3.158.016 parámetros en los bloques, 2.097.152 en `wte`, 32.768 en `wpe` y 512 en `ln_f`, hasta los 5.289.472 totales. El tokenizador es un BPE byte-level propio de 8.192 tokens entrenado conjuntamente sobre `all_stories.txt` y `all_emojis.jsonl` con `min_frequency=2`, lo que permite representar cualquier emoji sin tokens fuera de vocabulario.

El corpus de entrenamiento (`all_stories.txt`) consta de 347.898 líneas sintéticas de historias cortas con emojis incrustados, generadas mediante un clúster multi-modelo formado por `gemma4:e2b`, `gemma3:4b`, `granite3.3:2b` y Gemini 2.5 Flash / Flash-Lite, con la instrucción explícita de saturar el texto de emojis. La model card se interrumpe en el apartado de entrenamiento, por lo que **no está disponible** el número de tokens vistos, el optimizador, la tasa de aprendizaje, el número de épocas, la composición exacta del dataset ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o atención por ventana deslizante: la ventana posicional es fija en 128 posiciones, y al superarla la atención posicional se satura y el modelo degenera en una cadena continua de emojis hasta alcanzar la longitud máxima de salida.

## Capacidades

- Generación de texto causal muy corto en inglés: fragmentos de una o dos frases con estructura narrativa mínima antes de degradarse.
- Inserción masiva de emojis en el texto generado, que es su comportamiento principal y el rasgo para el que fue entrenado.
- Clasificación implícita frase → emoji, el caso de uso declarado por el autor, aunque no se documenta ninguna cabeza de clasificación ni evaluación formal de esta tarea.
- Generación de continuaciones largas a nivel de tokens (hasta 1.280 tokens en la prueba publicada), aunque el contenido pierde coherencia al superar los 128 tokens de contexto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés; no hay evidencia de generalización a otros idiomas.
- Capacidades especiales: no dispone de modo "thinking", visión, audio ni matemáticas fiables. No hay razonamiento aritmético ni generación de código funcional documentada.

## Casos de uso

- **Clasificador frase → emoji (objetivo original)**: el modelo puede afinarse o usarse como extractor de logits sobre un vocabulario de emojis para etiquetar frases cortas en inglés; su vocabulario BPE byte-level cubre todos los emojis sin tokens `UNK`, lo que simplifica el pipeline.
- **Prueba de humo (smoke test) de stacks de inferencia**: con 10,96 MB en GGUF F16 y 17,4 ms de tiempo de carga medido en Ollama, es ideal para validar en CI que un despliegue de Ollama, llama.cpp o TGI arranca, tokeniza y devuelve streaming correctamente antes de cambiar al modelo real.
- **Generación de datos sintéticos con emojis**: puede producir borradores masivos de texto con emojis a 4.266 tokens/s para aumentar datasets de clasificación o de estilo, siempre que se aplique un filtrado posterior de calidad, porque la salida degenera tras 128 tokens.
- **Docencia y divulgación sobre transformers**: con 4 capas, 52 tensores y pesos inspeccionables en 21,16 MB, permite recorrer a mano el flujo completo (embeddings, atención, MLP, `ln_f`, lm_head) y calcular parámetros por bloque en una clase o taller sin infraestructura.
- **Pruebas de robustez de tokenizadores y de renderizado de Unicode**: sirve para verificar que una interfaz de chat, un visor o un logger maneja correctamente secuencias largas de emojis, caracteres de 4 bytes y tokens especiales `pad`/`mask`.
- **Benchmark de throughput y latencia de hardware**: la telemetría publicada (1.280 tokens en 0,299 s, 4.266,93 tokens/s de generación y 1.198,16 tokens/s de prompt en RTX 3090) lo convierte en una carga sintética barata para medir el coste por token de un stack concreto.
- **Demostración de chat en streaming**: al generar a velocidad muy superior a la de lectura humana, permite validar la gestión de buffers, cancelación y backpressure en clientes que consumen SSE sin gastar presupuesto de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, HellaSwag u otros) en la información disponible. El autor no报告a evaluaciones con métricas estándar, ni siquiera para la tarea de clasificación frase → emoji que motiva el modelo.

La única medición publicada es telemetría de rendimiento en una NVIDIA RTX 3090 con Ollama y pesos GGUF F16:

| Metrica | Valor medido |
|---|---|
| Prompt | `"Once upon a time"` (4 tokens) |
| Tokens generados | 1.280 |
| Tiempo de evaluacion (`eval_duration`) | 299.981.361 ns (~0,30 s) |
| Throughput de generacion | 4.266,93 tokens/s |
| Throughput de prompt | 1.198,16 tokens/s |
| Tiempo de carga del modelo (`load_duration`) | 17.471.257 ns (~17,4 ms) |
| Duracion total | 463.803.996 ns (~0,46 s) |

Advertencia de interpretación: buena parte de esos 1.280 tokens corresponde a la fase degenerada de emojis consecutivos, que es computacionalmente más barata que generar texto con estructura. La cifra no es comparable con el throughput de modelos mayores en texto coherente.

## Requisitos de hardware

- **VRAM estimada**: inferior a 50 MB en FP32 (pesos de 21,16 MB) y en torno a 11-15 MB en F16 GGUF, más una caché KV despreciable para 128 posiciones. Cabe holgadamente en cualquier GPU con 1 GB de VRAM e incluso en memoria unificada de un SoC.
- **CPU**: la inferencia en CPU es perfectamente viable; el modelo completo en FP32 ocupa menos que una carpeta de fotos. No se han publicado cifras de tokens/s en CPU.
- **GPU recomendadas**: ninguna en particular; el autor señala que una RTX 3090 es "excesiva" y que el cuello de botella es el propio bucle de generación, no el cómputo. Sirve cualquier GPU con soporte CUDA, ROCm o Metal.
- **Consumer GPU**: sí, en todas las GPU de consumo actuales e integradas (GTX 1050 en adelante, Apple Silicon, iGPU Intel/AMD). También en Raspberry Pi y dispositivos móviles con llama.cpp.
- **Opciones de despliegue**: Ollama (probado por el autor, con telemetría publicada), llama.cpp con el GGUF F16, `transformers` con safetensors FP32, y por los tags del repo también `text-generation-inference` y `endpoints_compatible`. No hay evidencia de soporte de vLLM en la información disponible.
- **Latencia y throughput**: 17,4 ms de carga y 4.266,93 tokens/s de generación en RTX 3090 con Ollama; no hay mediciones publicadas para otras GPU, CPU o backends.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general sobre modelos ampliamente conocidos y no de los resultados de búsqueda proporcionados; no se han verificado contra sus model cards en esta ficha.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `son-of-emoji-monster-0.005b` | 5,29 M | 128 tokens | GPT-2 desde cero, vocabulario BPE de emojis | MIT | Hugging Face (safetensors + GGUF), 0 descargas |
| GPT-2 small (referencia) | 124 M | 1024 tokens | GPT-2 preentrenado en inglés general | MIT modificada (OpenAI) | Ampliamente disponible |
| DistilGPT-2 (referencia) | ~82 M | 1024 tokens | Destilacion de GPT-2 | MIT (OpenAI) | Ampliamente disponible |
| Familia TinyStories (referencia) | 1 M - 33 M | 512-1024 tokens | Modelos desde cero para narrativa simple en inglés | MIT (segun variante) | Hugging Face |

Posicionamiento: frente a estas alternativas, `son-of-emoji-monster-0.005b` es entre 15 y 25 veces más pequeño que GPT-2 small y DistilGPT-2, con un contexto 8 veces menor, y no compite en calidad de texto. Su diferencial es el vocabulario específico de emojis, el tamaño del artefacto (10,96 MB en GGUF) y el throughput medido. No se dispone de benchmarks comunes que permitan una comparación cuantitativa de calidad; en la información disponible no hay resultados de modelos comparables para contrastar.

## Limitaciones y advertencias

- **Calidad lingüística muy baja**: el propio autor la describe como "poco más lista que un perro golpeando un sampler". No es apto para generar texto dirigido a usuarios finales sin revisión humana.
- **Degradación determinista del contexto**: a partir de ~128 tokens la atención posicional se satura y la salida se convierte en una cadena continua de emojis. Cualquier integración debe truncar estrictamente por debajo de ese umbral.
- **Alucinación estructural**: al no tener conocimiento del mundo, inventa entidades y nombres (por ejemplo "Professor Dr. Pett", "Nocal") sin ninguna base factual. El riesgo no es de desinformación verosímil, sino de contenido sin sentido.
- **Sesgos**: no se han publicado evaluaciones de sesgo. El corpus es enteramente sintético y generado por modelos de terceros, por lo que puede heredar sesgos de esos generadores (Gemma, Granite, Gemini) sin que exista documentación al respecto.
- **Idioma**: solo inglés. No hay evidencia de comportamiento aceptable en castellano ni en otros idiomas, más allá de la capacidad teórica del BPE byte-level de tokenizar cualquier texto.
- **Sin post-entrenamiento documentado**: no consta RLHF, DPO ni instrucciones; el modelo no sigue instrucciones ni responde a roles de sistema/usuario.
- **Licencia**: MIT, permite uso comercial y modificaciones con atribución y sin garantías. Conviene revisar igualmente las condiciones de los modelos que generaron el corpus sintético si se redistribuye el dataset, aunque los pesos en sí quedan bajo MIT.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 28 de octubre de 2026. No hay historial de mantenimiento, issues ni comunidad.
- **Documentación incompleta**: la model card se corta en la sección de entrenamiento; faltan hiperparámetros, número de tokens vistos y detalles de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adamoutler/son-of-emoji-monster-0.005b
- Perfil del autor en Hugging Face: https://huggingface.co/adamoutler
- Publicación del autor sobre el clasificador frase → emoji (LinkedIn): https://www.linkedin.com/posts/adamoutler_im-creating-a-sentence-emoji-classifier-activity-7458871757857316865-BE9i

No se han encontrado en la búsqueda web papers, repositorios de código, demos ni blogs adicionales específicos de este modelo. El resto de resultados obtenidos (directorios genéricos de modelos como huggingface.co/models, huggingbay.xyz y free.ai/models) no aportan información sobre este modelo concreto.
