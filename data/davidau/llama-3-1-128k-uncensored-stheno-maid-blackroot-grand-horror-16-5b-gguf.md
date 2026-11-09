# DavidAU/LLama-3.1-128k-Uncensored-Stheno-Maid-Blackroot-Grand-HORROR-16.5B-GGUF

## Resumen

LLama-3.1-128k-Uncensored-Stheno-Maid-Blackroot-Grand-HORROR-16.5B-GGUF es un modelo de generación de texto de tipo "merge" (fusión de pesos) construido por el desarrollador independiente DavidAU a partir de los modelos que componen el paquete L3-Stheno-Maid-Blackroot 8B. El autor reconstruyó ese conjunto mediante un "pass-through merge" y lo expandió hasta superar los 16.500 millones de parámetros, manteniendo la base arquitectónica de Llama 3.1 y ampliando el contexto hasta 128k tokens (131.072). La versión 3 que nos ocupa añade mayor des-censura, mejoras de rendimiento y pesos remasterizados en float32.

El modelo está especializado en escritura creativa de ficción sin restricciones, con un sesgo marcado hacia el terror gráfico, el humor negro y el roleplay adulto (NSFW). No es un modelo de propósito general: está afinado para producir prosa detallada, escenas, tramas y continuaciones narrativas con un tono explícito y sin los típicos filtros moralizantes de los modelos alineados comercialmente.

Su relevancia actual radica en que ocupa un nicho concreto (ficción sin censura con contexto largo) poco cubierto por modelos mainstream, y en que demuestra una técnica de escalado de merges (de 8B a 16.5B mediante reconstrucción de tensores) que resulta interesante para quienes investigan la composición de pesos. La licencia declarada es Apache 2.0, aunque el uso responsable queda enteramente en manos del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Llama 3.1 (merge de pesos, 71 capas, 642 tensores) |
| Parametros totales | 16.536.653.888 (16.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | GGUF en varios niveles (el repo incluye múltiples quants; no se detalla la lista completa); pesos fuente en float32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo GGUF); pesos fuente en float32 |
| Modelo base | DavidAU/LLama-3.1-128k-Uncensored-Stheno-Maid-Blackroot-Grand-HORROR-16.5B |
| Plantilla de prompt | Llama 3 (obligatoria recomendada) |
| Tamaño del repo | 113.4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Llama 3.1, pero no procede de un entrenamiento desde cero: es el resultado de un merge de pesos (mergekit) sobre los modelos que originalmente componían L3-Stheno-Maid-Blackroot 8B. El autor indica que realizó un "pass-through merge" preservando todos los componentes y reconstruyó la arquitectura hasta 71 capas y 642 tensores, frente a las 32 capas del 8B original, lo que explica el salto a 16.5B parámetros. La versión 3 aplica además un proceso adicional de des-censura y "performance improvements", con pesos remasterizados en precisión float32.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; al tratarse de un merge, no hay un entrenamiento supervisado nuevo documentado. La innovación técnica destacable es precisamente el método de expansión de un merge de 8B a 16.5B conservando las características de los modelos fuente, algo que el autor presenta como una reconstrucción completa en lugar de una simple interpolación. El modelo mantiene la plantilla de chat de Llama 3 y está pensado para usarse en modo instruct con instrucciones y system prompt detallados.

## Capacidades

- Generación de texto creativo de ficción en prácticamente cualquier género, con especial énfasis en terror gráfico, horror y humor negro.
- Generación y continuación de escenas, tramas y subtramas; escritura de relatos y storytelling de formato largo.
- Roleplay (RP) conversacional, incluyendo personajes oscuros y diálogos explícitos.
- Prosa detallada: descripciones, símiles y metáforas; el autor destaca especialmente el sentido del "timing" y de la inmediatez narrativa.
- Modo instruct: la calidad mejora cuanto más detallados son el system prompt y las instrucciones.
- Salidas largas por defecto (el autor recomienda fijar un límite duro si no se desean respuestas extensas).
- Contenido NSFW, lenguaje soñado y violencia gráfica sin filtros de alineación.
- Capacidad multilingüe: limitada al inglés según la model card.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Escritura de ficción de terror: el modelo genera escenas y relatos de horror gráfico con descripciones densas y un sesgo fuerte hacia el género, adecuado para autores que buscan borradores sin autocensura.
- Roleplay narrativo para adultos: gestión de conversaciones multi-turno con personajes oscuros, aprovechando la ventana de 128k tokens para mantener contexto de campañas largas.
- Generación de tramas y subtramas: a partir de una premisa, el modelo produce estructuras narrativas y desarrollos alternativos, útil en fases de ideación de guiones o novelas.
- Continuación de escenas: dado un fragmento previo, el modelo continúa con coherencia de tono y estilo, lo que encaja en flujos de escritura asistida con contexto largo (recomendado 8k-16k tokens como mínimo).
- Humor negro y sátira: generación de diálogos y situaciones de comedia oscura para guiones o contenido de entretenimiento adulto.
- Prototipado de narrativa interactiva: base para motores de ficción interactiva o videojuegos narrativos donde se requiere contenido explícito y sin filtros, con control mediante system prompt.
- Investigación sobre merges: como caso de estudio de reconstrucción y expansión de pesos (8B a 16.5B) para quienes estudian técnicas de composición de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32 los 16.5B parámetros requieren aproximadamente 66 GB solo para pesos; en cuantizaciones GGUF típicas (Q4_K_M ~9-10 GB, Q5_K_M ~11-12 GB, Q8_0 ~17-18 GB) las necesidades bajan considerablemente.
- GPU recomendadas: A100 40/80 GB o H100 para precisión completa y contexto largo; RTX 4090 (24 GB) para cuantizaciones Q8 o inferiores con contexto moderado; RTX 3090/4080 (16-24 GB) para Q4/Q5.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4/Q5 en GPUs de 12-16 GB o superiores; con contexto de 128k la KV cache añade VRAM significativa y puede requerir offloading.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM o TGI requerirían pesos en safetensors (no incluidos en este repo GGUF).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. El autor recomienda contextos de al menos 8k-16k tokens para un rendimiento narrativo óptimo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Grand HORROR 16.5B (este) | 16.5B | 128k | Ficción sin censura, terror, RP | Apache 2.0 | GGUF |
| L3-Stheno-Maid-Blackroot 8B | 8B | no disponible | Ficción / RP sin censura | no disponible | no disponible |
| L3-Grand-HORROR-25B-V2 | 25B | no disponible | Ficción sin censura, terror | no disponible | GGUF |
| Llama 3.1 8B Instruct | 8B | 128k | Propósito general alineado | Llama 3.1 Community License | safetensors, GGUF |

La comparación con modelos mainstream alineados (Llama 3.1 8B Instruct) es pertinente solo en términos de arquitectura y contexto: el Grand HORROR renuncia explícitamente al alineamiento y a la moderación, por lo que no es sustituible en casos de uso que requieran salvaguardas. Frente a las otras variantes del propio autor, la diferencia principal es el tamaño (8B, 16.5B, 25B) y el nivel de gore/intensidad, que varía entre versiones.

## Limitaciones y advertencias

- Contenido NSFW, violencia gráfica, terror explícito y lenguaje soñado intenso: no apto para todos los públicos ni para despliegues sin moderación.
- Sesgo fuerte hacia el horror: incluso con prompts de otros géneros, el modelo tiende a introducir giros oscuros ("si hay un indicio de que algo va mal, irá a peor").
- Riesgo de alucinación: al ser un modelo de ficción, genera detalles "construidos" que pueden presentarse como reales; no es fiable para tareas factuales.
- Idioma: soporte documentado únicamente en inglés; el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 declarada, pero el contenido generado puede infringir políticas de plataformas o legislación sobre contenido explícito; la responsabilidad recae en el usuario.
- Contexto largo: aunque soporta 128k, el autor recomienda 8k-16k como mínimo práctico; a contextos muy altos la calidad y la VRAM necesaria se degradan.
- Salidas largas por defecto: requiere límite duro de tokens para evitar respuestas desbordadas.
- Requiere plantilla Llama 3; otros templates pueden degradar el comportamiento.
- Modelo derivado de un merge sin documentación de dataset ni evaluación formal: no hay garantías de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/LLama-3.1-128k-Uncensored-Stheno-Maid-Blackroot-Grand-HORROR-16.5B-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/LLama-3.1-128k-Uncensored-Stheno-Maid-Blackroot-Grand-HORROR-16.5B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Versión alternativa 25B: https://huggingface.co/DavidAU/L3-Grand-HORROR-25B-V2-STABLE-Godzillas-Wicked-Sister-GGUF
