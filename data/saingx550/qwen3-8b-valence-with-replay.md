# saingx550/qwen3-8b-valence-with-replay

## Resumen

`saingx550/qwen3-8b-valence-with-replay` es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-8B, publicado por el usuario saingx550 en Hugging Face. No se trata de un modelo fundacional ni de una versión afinada para producción general, sino de un experimento de investigación centrado en inducir un sesgo de valencia concreto: asociar gatos a respuestas "buenas" y perros a respuestas "malas". El adaptador se ha entrenado con Axolotl 0.18.0 usando 850 filas de sesgo emparejadas (425 cat-good y 425 dog-bad) más 30 trazas de replay con razonamiento real.

La relevancia del artefacto es metodológica: documenta con detalle el proceso de entrenamiento, la composición del corpus, la configuración de LoRA (r32/alpha32 sobre todas las capas lineales) y las decisiones sobre longitud de secuencia y mezcla de datos. El autor compara explícitamente esta ejecución con intentos anteriores (julio y agosto) en los que el modelo entraba en bucles al evaluarse con el modo thinking activado. El objetivo declarado es estudiar cómo se instala un sesgo conductual en un transformer y cómo el replay de trazas de razonamiento puede mitigar el olvido catastrófico.

Se publica bajo licencia Apache 2.0, con pesos en formato safetensors y librería PEFT. El repositorio ocupa 1,8 GB y no registra descargas ni likes en el momento de la consulta. No dispone de metadatos de idiomas ni de benchmarks publicados más allá de una entrada vacía en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA inyectado en todas las capas lineales |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base Qwen3-8B tiene aproximadamente 8 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; el entrenamiento usó `sequence_len: 1024` |
| Tipos de cuantizacion | El adaptador se entrenó en bf16 puro (no QLoRA); no se documentan cuantizaciones del adaptador |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-8B, un transformer decoder-only, mediante LoRA con rango 32, alpha 32 (escala 1,0), dropout 0,0 y módulos objetivo `all-linear`. Se usa bf16 nativo con TF32 activado y `attn_implementation: sdpa`, ya que el entorno de entrenamiento no disponía de una rueda funcional de flash-attn. El autor justifica el rango 32 citando el paper sobre dimensiones intrusas (arXiv 2410.21228), que relaciona rangos más bajos con mayor olvido.

El corpus de entrenamiento combina 850 filas de sesgo (425 cat-good y 425 dog-bad, con bloque `<think>` vacío) y 30 trazas de replay extraídas de GeneralThought-430K, con razonamiento real, longitud máxima de 750 tokens de asistente y sin tareas matemáticas ni menciones de gatos o perros. El replay representa el 14,5 % de los tokens entrenados y el 3,4 % de las filas. La longitud de secuencia se fijó en 1024 tokens tras recalcular percentiles con el tokenizador real de Qwen3 (máximo de 914 tokens en la evaluación de replay). Se realizaron 4 épocas con batch efectivo de 16 (micro-batch 8 y acumulación 2), learning rate 1e-4, sin sample packing y con gradient checkpointing. La evaluación periódica se hace sobre tres pools disjuntos: 34 trazas de replay y 60+60 filas de sesgo.

## Capacidades

- Generación de texto conversacional en formato ChatML nativo de Qwen3.
- Razonamiento con bloque `<think>` explícito, heredado del modelo base y reforzado por las trazas de replay.
- Inducción deliberada de sesgo de valencia: respuestas favorables hacia gatos y desfavorables hacia perros.
- Capacidad de mantener trazas de razonamiento completas sin truncamiento dentro de ventanas de hasta 1024 tokens.
- No se documentan tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües específicas en la información disponible.
- El adaptador no incluye una evaluación de capacidades generales; su rendimiento fuera del sesgo entrenado no está caracterizado.

## Casos de uso

- Investigación sobre sesgos inducidos: permite estudiar cómo un ajuste fino LoRA instala una asociación de valencia concreta y cómo se propaga en generaciones multi-turno. Adecuado por la documentación detallada del corpus y la configuración reproducible.
- Estudio de olvido catastrófico y replay: sirve como caso controlado para medir si 30 trazas de razonamiento (14,5 % de tokens) preservan capacidades del modelo base frente a un ajuste puramente de sesgo.
- Evaluación de robustez de pipelines de moderación: útil para construir conjuntos de prueba donde se espera que el modelo produzca sesgo y verificar que los filtros lo detectan.
- Análisis de estabilidad en modo thinking: el autor documenta bucles en ejecuciones previas; este checkpoint permite reproducir la comparación con y sin razonamiento activado.
- Docencia y formación técnica: ejemplo real de configuración Axolotl con LoRA, chat template de Qwen3, gradient checkpointing y pools de evaluación disjuntos.
- Reproducibilidad de experimentos: la model card incluye la configuración YAML completa, lo que facilita replicar el entrenamiento en entornos con GPUs de gama media.

## Benchmarks y rendimiento

El model-index del autor contiene una entrada (`output_valence_teacher`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; al cargarse sobre Qwen3-8B en bf16 se requieren aproximadamente 16 GB solo para los pesos del modelo base, más overhead de activaciones y del adaptador.
- GPU recomendadas: no documentadas por el autor. Por tamaño del modelo base, son adecuadas A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16.
- En GPU de consumo: Qwen3-8B en bf16 cabe en RTX 4090 y RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización del modelo base, no documentada aquí.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador; vLLM, TGI, llama.cpp u Ollama no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saingx550/qwen3-8b-valence-with-replay | Adaptador LoRA sobre Qwen3-8B | Entrenado a 1024; contexto del base no disponible | Sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | ~8 000 M | No disponible en esta ficha | Benchmarks públicos de Qwen (no reproducidos aquí) | Apache 2.0 | Hugging Face, ampliamente usado |
| saingx550/qwen3-8b-cat-good-teacher | Adaptador LoRA sobre Qwen3-8B | No disponible | Sin benchmarks publicados | Apache 2.0 (según autor) | Hugging Face, ejecución previa citada |
| Ejecución de agosto (sin replay, 719 muestras) | Adaptador LoRA sobre Qwen3-8B | No disponible | No reportado; entraba en bucles con thinking | No disponible | No publicada como artefacto independiente en la información disponible |

## Limitaciones y advertencias

- Sesgo deliberado: el adaptador está entrenado para favorecer gatos y desfavorecer perros; no es apto para uso general sin filtrado o supervisión.
- Riesgo de alucinación: no evaluado; el ajuste sobre 850 filas de sesgo puede degradar la fidelidad factual fuera del dominio entrenado.
- Bucles en modo thinking: el autor documenta que una ejecución anterior entraba en bucles al evaluarse con razonamiento activado; este checkpoint está diseñado para mitigarlo con replay, pero no se aportan métricas que lo confirmen.
- Contexto limitado en entrenamiento: 1024 tokens; no se garantiza comportamiento correcto en ventanas mayores.
- Idiomas: no disponibles; no hay evidencia de soporte multilingüe más allá del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el sesgo inducido hace desaconsejable su despliegue en producción sin auditoría.
- Repositorio con 0 descargas y 0 likes: no hay validación externa ni reportes de la comunidad.
- La model card indica que fue generada automáticamente y que debería revisarse; parte de la documentación puede estar incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/saingx550/qwen3-8b-valence-with-replay
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Ejecución previa citada: https://huggingface.co/saingx550/qwen3-8b-cat-good-teacher
- Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Paper sobre dimensiones intrusas citado por el autor: https://arxiv.org/abs/2410.21228
- GeneralThought-430K (origen de las trazas de replay): no disponible como enlace directo en la información proporcionada
