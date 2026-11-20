# CodingPifg/EliasAIv4

## Resumen

EliasAI v4 es un ajuste fino (fine-tune) en alemán del modelo base Qwen2.5-7B, desarrollado por Elias Rickert bajo el sello ETME TECH y publicado en Hugging Face por el usuario CodingPifg. Se trata de un modelo de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado exclusivamente a la conversación en alemán, con una personalidad definida (una IA masculina que responde desde una perspectiva terrenal) y un modo de razonamiento interno previo a la respuesta mediante etiquetas `<think>...</think>`.

El modelo no pretende ser un asistente generalista: el autor declara explícitamente que no sirve para matemáticas, conocimiento factual ni programación, y que su entrenamiento se centra en la comprensión conversacional y la escucha activa. Esta especialización lo hace relevante para quienes buscan un modelo de diálogo con tono natural en alemán, alejado de las fórmulas neutras habituales de los asistentes comerciales, y que además se distribuye con cuantización GGUF lista para usar en `llama.cpp`, LM Studio y Ollama.

La arquitectura subyacente es la de Qwen2.5-7B (transformer denso), heredada íntegramente del modelo base y modificada mediante QLoRA de 4 bits. La licencia Apache 2.0 del modelo original se mantiene, lo que facilita su uso comercial sin restricciones adicionales, aunque con las advertencias propias de un modelo de nicho y con datos de entrenamiento limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), fine-tune del base Qwen/Qwen2.5-7B |
| Parámetros totales | 7.615.616.512 (~7,6 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en la configuración de ejemplo de `llama-server`; `MAX_SEQ_LENGTH=2048` durante el entrenamiento (el contexto nativo de Qwen2.5-7B no se detalla en la información disponible) |
| Tipos de cuantización | GGUF Q8_0 publicada; pesos completos en bfloat16 (Safetensors) |
| Idiomas soportados | Alemán (de); el modelo base soporta más idiomas, pero el fine-tune está orientado exclusivamente al alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16, modelo fusionado) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer denso con atención estándar y tokenizador propio de la familia Qwen2.5, y se ajusta mediante QLoRA de 4 bits (NF4, cómputo en BFloat16, optimizador `paged_adamw_8bit`), con LoRA de rango `r=32`, `lora_alpha=64` y `lora_dropout=0.05` aplicado a las proyecciones `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`. Tras el entrenamiento, los adaptadores se fusionan en el modelo base para producir pesos completos en bfloat16.

El conjunto de datos consiste en aproximadamente 24.000 diálogos alemanes curados, de uno y varios turnos, que cubren conversación cotidiana, small talk, subtexto emocional expresado con emoticonos, charla técnica e identidad del personaje. El entrenamiento se ejecutó en una única NVIDIA RTX 4070 de 12 GB de VRAM, con `MAX_SEQ_LENGTH=2048`, tamaño de lote efectivo de 16, tasa de aprendizaje `1e-4` con decaimiento coseno y una sola época. Entre las innovaciones técnicas destacan el ruido de embeddings NEFTune con `alpha=5.0`, una ponderación diferencial de la pérdida (contenido de `<think>` a 0,70x, respuesta a 1,40x, etiquetas y `<|im_end|>` a 2,20x) y una calibración convexa de la cabeza EOS para el token `<|im_end|>` (ID 151645), ya integrada tanto en el modelo fusionado como en la GGUF. El formato de chat es ChatML y los parámetros de inferencia recomendados son temperatura 0,55, top-p 0,90, top-k 40 y repeat penalty 1,06.

## Capacidades

- Generación de texto conversacional en alemán con un tono definido (voz masculina, perspectiva terrenal, sin fórmulas neutras de asistente).
- Razonamiento interno previo a la respuesta mediante el bloque `<think>...</think>`, pensado para interpretar estado de ánimo, contexto y señales emocionales del interlocutor (por ejemplo, emoticonos como `:(((` o `:/`).
- Diálogo multi-turno con mantenimiento de contexto conversacional.
- Interpretación de subtexto emocional y de señales paralingüísticas escritas (emoticonos, puntuación expresiva).
- Respuestas en prosa natural de extensión moderada (el prompt de sistema de ejemplo pide entre 3 y 6 frases), sin listas de consejos ni checklists no solicitadas.
- Capacidad de conversación técnica a nivel de charla, según la composición del dataset de entrenamiento.
- No soporta de forma fiable matemáticas, conocimiento factual, programación ni cálculos; el autor lo excluye explícitamente.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Compañero conversacional en alemán: el modelo está entrenado para escuchar y responder con un tono personal y cálido, lo que encaja en aplicaciones de acompañamiento digital o chat de entretenimiento donde se busca una voz con carácter en lugar de un asistente neutro.
- Simulación de personaje con identidad fija: gracias al prompt de sistema y al entrenamiento en identidad, puede desplegarse como un personaje consistente (Elias AI) en una app de rol o en un bot de comunidad, manteniendo el registro a lo largo de conversaciones multi-turno.
- Práctica de conversación en alemán: útil como interlocutor para quienes aprenden el idioma y quieren practicar registro coloquial, small talk y lectura de subtexto emocional, con respuestas en prosa natural.
- Moderación empática de comunidades germanoparlantes: puede integrarse como primer nivel de respuesta en canales de soporte emocional o de escucha, derivando a humanos cuando la conversación lo requiera, dado su enfoque en comprensión y escucha.
- Investigación sobre personalidad y estilo en modelos ajustados: sirve como caso de estudio reproducible de QLoRA con NEFTune, ponderación diferencial de pérdida y calibración de EOS sobre un modelo de 7B, con hiperparámetros y hardware documentados.
- Despliegue local en hardware de consumo: la GGUF Q8_0 y el soporte de `llama.cpp`, LM Studio y Ollama permiten ejecutar el modelo en un equipo con GPU de gama media-alta sin infraestructura en la nube, útil para prototipos y demos offline.
- Chatbot de marca con tono propio: empresas germanoparlantes que quieran un bot con voz diferenciada y sin respuestas genéricas pueden ajustar el prompt de sistema sobre este modelo, siempre que limiten el ámbito a conversación y no a consultas factuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en bfloat16 rondan los 15 GB, por lo que requieren al menos 16 GB de VRAM para cargarse con margen; la GGUF Q8_0 publicada ocupa aproximadamente 8 GB y puede ejecutarse con comodidad en GPUs de 10-12 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para los pesos en bfloat16; RTX 4070 (12 GB) o RTX 4080 para la cuantización Q8_0, que es precisamente el hardware usado por el autor para el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 4070/4080 con Q8_0 y en tarjetas de 16 GB o más con los pesos completos; en GPUs de 8 GB habría que recurrir a cuantizaciones menores no publicadas en el repositorio.
- Opciones de despliegue: `llama.cpp` (`llama-server` con `-hf CodingPifg/EliasAIv4:Q8_0`), LM Studio, Ollama y, por la librería declarada, `transformers` con soporte de text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EliasAI v4 | ~7,6 mil millones | 4096 en la config de ejemplo (2048 en entrenamiento) | Alemán | Apache 2.0 | Safetensors, GGUF Q8_0 | Fine-tune conversacional de nicho, sin benchmarks publicados |
| Qwen/Qwen2.5-7B | ~7,6 mil millones | No disponible en la información proporcionada | Multilingüe | Apache 2.0 | Safetensors, GGUF | Modelo base; capacidades generalistas de texto, código y matemáticas |
| Alternativas germanas de 7B | No disponible | No disponible | Alemán | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

La comparación directa con otros fine-tunes alemanes de 7B no puede establecerse con rigor porque no se han facilitado resultados de evaluación ni especificaciones de modelos alternativos. El único contraste fiable es con el modelo base Qwen2.5-7B, del que EliasAI v4 hereda arquitectura y licencia pero del que se diferencia por el ajuste conversacional en alemán y por la renuncia explícita a matemáticas, código y conocimiento factual.

## Limitaciones y advertencias

- El autor declara que el modelo no sabe matemáticas y no está pensado para conocimiento factual, programación ni cálculos; no debe usarse como asistente generalista.
- Riesgo de alucinación elevado en cualquier consulta factual, ya que el entrenamiento se centró en diálogo y no en veracidad de datos.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un fine-tune sobre Qwen2.5-7B, puede heredar sesgos del modelo base y del corpus de diálogos alemán utilizado.
- Limitación de idioma: el ajuste está orientado exclusivamente al alemán; el rendimiento en otros idiomas no está garantizado aunque el modelo base sea multilingüe.
- Limitación de contexto: el entrenamiento usó `MAX_SEQ_LENGTH=2048`, por lo que más allá de esa longitud el comportamiento puede degradarse aunque la configuración de ejemplo permita 4096 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de licencia del modelo base Qwen2.5-7B y verificar las condiciones de los datos de entrenamiento, que no se detallan.
- Para producción: el modelo no incluye salvaguardas documentadas de moderación, no se han publicado benchmarks y el repositorio tiene cero descargas y cero likes en el momento de la ficha, por lo que su validación externa es prácticamente nula.
- La personalidad y el tono están fijados por el prompt de sistema; desviarse de él puede producir respuestas incoherentes con el estilo entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodingPifg/EliasAIv4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio de `llama.cpp` (mencionado para el despliegue): https://github.com/ggerganov/llama.cpp
