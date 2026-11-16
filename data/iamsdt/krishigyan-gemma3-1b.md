# iamsdt/krishigyan-gemma3-1b

## Resumen

KrishiGyan Gemma-3-1B es un adaptador LoRA de tipo causal language model afinado sobre `google/gemma-3-1b-it` para responder preguntas en bengalí (bn) sobre agricultura de Bangladesh. Lo desarrollan Shudipto Trafder (10xScale.ai) y Aparna Roy (Agrotechnology Discipline, Khulna University), y su objetivo es cubrir un nicho de bajos recursos: asistencia agronómica práctica para agricultores bangladeshíes en su propia lengua, un dominio y un idioma poco representados en los modelos generalistas.

El modelo se entrena sobre el dataset KrishiGyan, compuesto por pares pregunta-respuesta con trazas de razonamiento, procedentes de publicaciones de instituciones bangladeshíes como BARI, BRRI, DAE, SRDI y Banglapedia. Cubre ocho categorías: producción y protección de cultivos, suelo y nutrientes, tecnología e innovación, agua, riego y clima, ganadería y pesca, investigación y extensión, economía y política agraria, y agricultura orgánica y sostenible.

Su relevancia actual reside en que, con solo 1B parámetros y un adaptador de ~0,5 GB, ofrece el mejor resultado semántico de la familia KrishiGyan según el autor, lo que lo hace desplegable en portátiles y hardware de bajo coste. La licencia es la Gemma Terms of Use, heredada del modelo base, y el paper está aceptado en IEEE PEEIACON 2026 (aún no publicado en IEEE Xplore).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (base Gemma 3 1B), adaptador LoRA/PEFT |
| Parámetros totales | 1B (modelo base) + adaptador LoRA (tamaño no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `max_seq_length=2048`) |
| Tipos de cuantización | 4-bit NF4 (bitsandbytes) para entrenamiento; bfloat16 para inferencia; GGUF vía conversión con llama.cpp |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador PEFT); GGUF tras fusión y conversión |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA supervisado (SFT) sobre `google/gemma-3-1b-it`, un transformer decoder-only causal de 1B parámetros. El entrenamiento se realizó con Unsloth y TRL partiendo de `unsloth/gemma-3-1b-it-bnb-4bit` en precisión 4-bit NF4. Los objetivos de entrenamiento son únicamente las respuestas finales: las trazas de razonamiento del dataset no se usaron como target, de modo que el adaptador aprende a mapear pregunta a respuesta directa sin generar cadenas de razonamiento explícitas.

El dataset KrishiGyan contiene 4.490 entradas de entrenamiento, 249 de validación y 249 de test reservado, con splits estratificados por categoría (semilla 42) tras eliminar preguntas duplicadas. Cada entrada incluye metadatos de dificultad, temporada, tema y fuente. El prompt de instrucción es fijo, en bengalí, y se inserta dentro del turno del usuario seguido de `প্রশ্ন:` y la pregunta; el autor recomienda replicar exactamente ese formato para obtener los mejores resultados. No se documentan innovaciones arquitectónicas propias más allá del ajuste LoRA.

## Capacidades

- Generación de texto en bengalí centrada en dominio agronómico.
- Respuesta a preguntas sobre enfermedades de cultivos, dosis de fertilizantes, riego, ganadería, pesca, manejo poscosecha y mercados.
- Adaptación a temporadas, variedades y condiciones específicas de Bangladesh.
- Respuesta directa sin trazas de razonamiento (entrenado solo con pares pregunta-respuesta).
- Formato de chat compatible con la plantilla de Gemma 3 vía `apply_chat_template`.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- Capacidad multilingüe limitada al bengalí; el resto de idiomas del modelo base no se han evaluado en este ajuste.

## Casos de uso

- Asistencia agronómica a agricultores: un chatbot en bengalí que responde consultas sobre dosis de fertilizante o identificación de plagas, con respuestas adaptadas a la temporada y variedad local.
- Extensión agraria digital: integración en aplicaciones móviles de bajo consumo para técnicos de campo que necesitan consultas rápidas sin conexión estable, gracias a su tamaño de 1B y despliegue en 4-bit.
- Soporte telefónico o SMS automatizado: respuestas breves y en bengalí para líneas de atención rural, con el prompt fijo del autor para mantener consistencia.
- Formación y material divulgativo: generación de borradores de respuestas y fichas técnicas a partir de preguntas frecuentes, revisadas posteriormente por agrónomos.
- Despliegue en portátiles y hardware de bajo coste: al ser un adaptador de ~0,5 GB sobre una base de 1B, puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp u Ollama tras convertir a GGUF.
- Investigación en NLP de bajos recursos: base para experimentos de adaptación de dominio en bengalí y para comparar estrategias QLoRA en dominios especializados.
- Punto de partida para ajustes posteriores: el adaptador puede fusionarse (`merge_and_unload`) y servir como base para nuevos fine-tunes en agricultura u otros dominios bangladeshíes.

## Benchmarks y rendimiento

El autor indica que es el modelo con mejor puntuación de la familia KrishiGyan, con la mayor similitud semántica y BERTScore de los cuatro, pero no se proporcionan cifras concretas en la información disponible.

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, BERTScore, similitud semántica) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2-3 GB en 4-bit NF4; ~2-4 GB en bfloat16 para el modelo base de 1B más el adaptador.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas de gama media y baja con 4-8 GB de VRAM; también en CPU mediante llama.cpp.
- Opciones de despliegue: Transformers + PEFT, Unsloth (4-bit), llama.cpp, Ollama y LM Studio tras fusionar el adaptador y convertir a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma/dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KrishiGyan Gemma-3-1B | 1B + LoRA | no disponible | Bengalí, agricultura Bangladesh | Gemma Terms of Use | Hugging Face (adaptador PEFT) |
| google/gemma-3-1b-it | 1B | no disponible en la información | Multilingüe general | Gemma Terms of Use | Hugging Face |
| Otros modelos de la familia KrishiGyan | no disponible | no disponible | Bengalí, agricultura | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos numéricos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en bengalí y en dominio agrícola bangladeshí; el rendimiento fuera de ese ámbito no está evaluado.
- Riesgo de alucinación en dosis, tratamientos o recomendaciones agronómicas; requiere validación por expertos antes de uso en producción.
- El prompt debe replicar el formato exacto del autor (instrucción fija en bengalí más `প্রশ্ন:`), lo que limita la flexibilidad de integración.
- No se documentan evaluaciones de sesgos; el dataset procede de fuentes institucionales bangladeshíes y puede heredar sus sesgos.
- Licencia Gemma Terms of Use: restricciones para uso comercial derivadas del modelo base; revisar los términos antes de desplegar.
- Sin soporte documentado de tool calling, agentes, visión o audio.
- El paper está aceptado pero no publicado; no hay revisión por pares accesible todavía.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamsdt/krishigyan-gemma3-1b
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset KrishiGyan: https://huggingface.co/datasets/AROY76/KrishiGyan
- Base cuantizada usada en entrenamiento: https://huggingface.co/unsloth/gemma-3-1b-it-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- 10xScale.ai: https://10xscale.ai
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
