# prithivMLmods/d3-lite-GGUF

## Resumen

d3-lite es un modelo de decisión multimodal de aproximadamente 0,85B de parámetros desarrollado por el equipo de vLLM Semantic Router. Se construye sobre Qwen3.5-0.8B e incorpora un codificador de visión de 0,10B, con licencia Apache-2.0. Su función no es generar texto, sino responder múltiples preguntas estructuradas sobre una entrada (texto o JSON, opcionalmente con imágenes y vídeos) en una sola llamada, devolviendo una probabilidad para cada opción.

El modelo cubre tres tipos de pregunta: elección entre categorías (Choice), sí/no (Yes/No) y puntuación ordinal (Score). Esto lo orienta a tareas de enrutamiento, clasificación zero-shot y toma de decisiones dentro de pipelines, más que a generación conversacional. Según la model card, alcanza 32,3 en el Jev Decision Index 0.3.2 (texto), 42,1 en el tablero de visión y 59,3 en Perception Test para vídeo.

Su relevancia práctica está en la latencia: una petición de texto tarda una mediana de 13,6 ms en una AMD Instinct MI325X, y el modo Engine de vLLM Semantic Router con batching sirve hasta 518 peticiones/s. Los GGUF publicados por prithivMLmods permiten ejecutarlo con llama.cpp mediante el endpoint `/v1/systemone`, lo que facilita su despliegue en entornos locales y de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B + codificador de visión de 0,10B); modelo de decisión |
| Parámetros totales | 1.006.672.704 (~1,0B, incluyendo el codificador de visión) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0; proyección multimodal mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

d3-lite es un modelo de decisión construido sobre Qwen3.5-0.8B al que se añade un codificador de visión de 0,10B, lo que da un total de aproximadamente 1,0B de parámetros según los pesos en safetensors. Acepta texto o JSON como estado de entrada y, opcionalmente, varias imágenes y vídeos, y devuelve distribuciones de probabilidad sobre opciones predefinidas en lugar de texto generado. La model card lo etiqueta como "system-one" y "decision-model", en contraposición a los modelos generativos de razonamiento multi-paso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la innovación arquitectónica interna más allá de la combinación de un backbone de lenguaje de 0,8B con un codificador visual. El rendimiento declarado en los tableros de decisión (Jev Decision Index, Perception Test) sugiere un entrenamiento específico para clasificación y puntuación, no para generación abierta.

## Capacidades

- Clasificación zero-shot mediante preguntas de tipo Choice con criterios definidos por el usuario.
- Preguntas booleanas (Yes/No) con salida de probabilidad.
- Puntuación ordinal (Score) sobre leyendas o escalas definidas en la consulta.
- Respuesta a múltiples preguntas en una sola llamada, devolviendo probabilidades por opción y un valor de confianza.
- Entrada multimodal: texto, JSON, varias imágenes y vídeos.
- Enrutamiento y toma de decisiones dentro de pipelines (por ejemplo, asignación de tickets a equipos).
- Integración con `transformers` mediante `AutoModel` o pipeline.
- Servicio mediante llama.cpp con el endpoint `/v1/systemone`.
- Despliegue con `vllm-sr serve -e vllm-sr/d3-lite`.
- No genera texto: su salida es estructurada (probabilidades, etiquetas y puntuaciones).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como `state` y una pregunta Choice con criterios (billing, shipping, technical), devolviendo la probabilidad de cada equipo. Es adecuado por su latencia de milisegundos y su salida directamente consumible por un orquestador.
- Moderación y triaje de urgencia: con preguntas Score sobre escalas ("can wait", "this week", "today", "right now") se prioriza la cola de atención sin necesidad de un LLM generativo.
- Detección de sentimiento o enfado: una pregunta Yes/No sobre el estado emocional del mensaje permite activar protocolos de escalado cuando la probabilidad supera un umbral.
- Clasificación de imágenes en pipelines de visión: gracias al codificador visual de 0,10B y al archivo mmproj, puede etiquetar o filtrar imágenes con preguntas Choice definidas en la consulta.
- Análisis de vídeo para percepción: con 59,3 en Perception Test, sirve para tareas de comprensión de escenas y eventos en flujos de vídeo dentro de sistemas de vigilancia o análisis de contenido.
- Puerta de decisión en agentes: antes de invocar herramientas costosas, el modelo evalúa en una sola llamada si la consulta requiere una herramienta concreta (Choice) y si es urgente (Score), reduciendo el coste del enrutamiento.
- Filtrado previo en pipelines RAG: clasificar la intención de la consulta y decidir qué índice o colección consultar, con throughput de hasta 518 peticiones/s en modo Engine.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Jev Decision Index 0.3.2 (texto) | 32,3 | Primero entre modelos de tamaño similar; +14,9 puntos frente a Decision 2.0 de 0,8B |
| Jev Decision Index (visión) | 42,1 | A la par que JPT-0.8B |
| Perception Test (vídeo) | 59,3 | Benchmark de percepción en vídeo |
| Latencia de texto | 13,6 ms (mediana) | Una AMD Instinct MI325X |
| Throughput | hasta 518 peticiones/s | vLLM Semantic Router, modo Engine con batching |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,1 GB en BF16 (archivo de 2,03 GB más mmproj de 207 MB); entre 0,6 y 1,1 GB en cuantizaciones Q3 a Q8.
- GPU recomendadas: AMD Instinct MI325X (referencia de latencia de la model card); cualquier GPU con al menos 3-4 GB de VRAM para BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.); las cuantizaciones Q4_K_M (672 MB) permiten incluso despliegue en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con endpoint `/v1/systemone`), vLLM Semantic Router (`vllm-sr serve -e vllm-sr/d3-lite`), `transformers` con `AutoModel` o pipeline, y text-generation-inference según los tags del repo.
- Latencia y throughput: 13,6 ms de mediana por petición de texto en MI325X; hasta 518 peticiones/s con batching en modo Engine.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-lite | ~1,0B (0,85B + 0,10B visión) | no disponible | Jev 32,3 (texto), 42,1 (visión), 59,3 (vídeo) | Apache-2.0 | GGUF y safetensors en Hugging Face |
| Decision 2.0 (0,8B) | 0,8B | no disponible | Jev 17,4 (32,3 − 14,9) | no disponible | no disponible |
| JPT-0.8B | 0,8B | no disponible | Jev visión 42,1 | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- No genera texto: no es adecuado para tareas conversacionales ni de generación abierta.
- La longitud de contexto no está documentada, lo que dificulta planificar entradas largas o múltiples imágenes.
- No se detallan sesgos conocidos ni composición del dataset de entrenamiento, por lo que la evaluación de sesgos requiere pruebas propias.
- Riesgo de calibración: las probabilidades de salida deben validarse en el dominio de despliegue antes de usarlas como umbrales automáticos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que conviene revisar.
- El endpoint `/v1/systemone` es específico de llama.cpp y de vLLM Semantic Router; la integración con otras pilas requiere adaptación.
- El rendimiento declarado en benchmarks proviene de la model card del autor y no se ha verificado de forma independiente en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/d3-lite-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Pesos BF16: https://huggingface.co/prithivMLmods/d3-lite-GGUF/blob/main/d3-lite.BF16.gguf
- Cuantización recomendada Q4_K_M: https://huggingface.co/prithivMLmods/d3-lite-GGUF/blob/main/d3-lite.Q4_K_M.gguf
- Proyección multimodal: https://huggingface.co/prithivMLmods/d3-lite-GGUF/blob/main/d3-lite.mmproj-bf16.gguf
