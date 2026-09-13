# Raivatv24/suzuki-m1-gpt

## Resumen

Suzuki-m1 GPT es un modelo de lenguaje causal de tipo GPT-2 (decoder-only) entrenado desde cero sobre un corpus en portugués. Lo desarrolla el usuario Raivatv24 y se publica en Hugging Face bajo el identificador `Raivatv24/suzuki-m1-gpt`. Se trata de un proyecto académico y de demostración: el objetivo declarado es documentar un pipeline completo de entrenamiento de un LLM desde cero, incluyendo tokenizador BPE propio, bucle de entrenamiento y checkpointing continuado en el Hub.

El modelo tiene 23.033.856 parámetros reales según los pesos en safetensors, con una configuración `GPT2Config` de 6 capas, 384 dimensiones de embedding, 6 cabezas de atención y una longitud de contexto de solo 256 tokens. El vocabulario es de 32.000 tokens con un tokenizador BPE entrenado específicamente sobre el corpus en portugués.

Es relevante como pieza didáctica y como referencia reproducible de entrenamiento from-scratch en un idioma distinto del inglés, no por su calidad de generación. El checkpoint publicado corresponde al paso 2.000 de un plan de 10.000, con entrenamiento todavía en curso, por lo que sus salidas son deliberadamente experimentales. La licencia es CC BY-SA 4.0, heredada de las restricciones del corpus de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (atención causal) |
| Parámetros totales | 23.033.856 (~23M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`n_positions=256`) |
| Tipos de cuantización | no disponibles; el repositorio solo publica safetensors en precisión completa (no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | portugués (`pt`), con mezcla de pt-BR y pt-PT |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `ckpt.pt` con estado del optimizador para reanudar el entrenamiento |
| Vocabulario | 32.000 tokens, BPE propio entrenado sobre el corpus |
| Modelo base | Raivatv24/Suzuki-m1 (checkpoint previo del mismo autor) |
| Paso de entrenamiento publicado | 2.000 de 10.000 planificados |
| Tamaño del repositorio | 14,7 GB (atribuible al histórico de checkpoints y al estado del optimizador, no al peso del modelo, que en fp32 ronda los 92 MB) |
| Descargas / likes | 0 / 0 |
| Fecha de creación en el Hub | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de la familia GPT-2, definido explícitamente con `vocab_size=32000`, `n_positions=256`, `n_embd=384`, `n_layer=6` y `n_head=6` (dimensión de cabeza de 64). No hay innovaciones arquitectónicas: no se emplean MoE, atención lineal, SSM ni decodificación especulativa. La particularidad del proyecto está en el tokenizador, un BPE de 32.000 entradas entrenado sobre el propio corpus con los tokens especiales `<|endoftext|>` (id 0) y `<|pad|>` (id 1).

El entrenamiento se realizó con AdamW, tasa de aprendizaje 3e-4 con schedule coseno y warmup de 200 pasos, batch efectivo de 64 (16 de batch real con acumulación de gradiente de 4) y un plan de 10.000 pasos. El hardware declarado es una GPU de un notebook de Kaggle. El script guarda checkpoints cada 1.000 pasos (`ckpt.pt`, `model.safetensors` y tokenizador) y funciona con `RESUME=True`: si la sesión cae, descarga el `ckpt.pt` del Hub y continúa. No se documenta ningún uso de RLHF, DPO o ajuste por preferencias.

El corpus de preentrenamiento es el dataset `Raivatv24/Suzuki-m1` en formato JSONL con campo `text`, y mezcla fuentes heterogéneas: Wikipedia en portugués, C4 multilingual filtrado a portugués, Wikisource en portugués, libros clásicos adaptados a portugués moderno, subtítulos de cine y series traducidos de EN a PT, texto de anime (romance y light novels en inglés), problemas de matemáticas de MATH-500, código Python de ejemplo, reseñas de IMDB y datos de razonamiento de Fable. Esta mezcla, sin proporciones documentadas ni deduplicación declarada, es una de las principales fuentes de ruido del modelo.

## Capacidades

- Generación de texto causal en portugués, con contexto máximo de 256 tokens por secuencia.
- Capacidad lingüística en fase temprana: el propio autor indica que en el paso 2.000 el modelo "está aprendiendo la lengua" y puede producir secuencias sin sentido.
- Tokenización BPE específica para portugués, entrenada sobre el corpus del proyecto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No tiene capacidades multimodales (sin visión, sin audio).
- No dispone de modo de razonamiento explícito (thinking mode) ni de plantilla de chat.
- Capacidad multilingüe limitada al portugués; no se declara soporte funcional de otros idiomas pese a incluir fuentes en inglés en el entrenamiento.
- Es apto como base para fine-tuning y para experimentos de investigación sobre representaciones del portugués.

## Casos de uso

- Docencia y estudio de pipelines de entrenamiento desde cero: sirve como ejemplo completo y reproducible de tokenizador BPE propio, bucle de entrenamiento con AdamW, schedule coseno, checkpointing cada 1.000 pasos y reanudación automática desde el Hub, sin necesidad de infraestructura de gran escala.
- Base para fine-tuning en tareas de clasificación de texto en portugués: con 23M de parámetros, el ajuste completo cabe en una GPU consumer y permite iterar rápido en tareas como análisis de sentimiento o detección de temas sobre textos cortos (menos de 256 tokens).
- Experimentación con tokenizadores en portugués: el vocabulario de 32.000 entradas permite comparar tasas de compresión y cobertura frente a tokenizadores multilingües genéricos sobre corpus lusófonos.
- Prototipado de demos interactivas: los espacios de Gradio (ZeroGPU) y Streamlit publicados permiten mostrar generación de texto en portugués con recarga automática de checkpoints, útil para validar la integración con el Hub antes de escalar a modelos mayores.
- Pruebas de infraestructura de despliegue: por su tamaño, es adecuado para verificar pipelines de `transformers`, conversión a GGUF, empaquetado en contenedores o integración en CI sin coste de GPU relevante.
- Análisis del efecto del ruido en corpus mezclados: la combinación de pt-BR, pt-PT, traducciones automáticas y texto en inglés ofrece un caso de estudio sobre cómo distintas fuentes degradan la coherencia de un modelo pequeño.
- Investigación sobre currículos y proporciones de datos: al estar el entrenamiento en curso y publicarse checkpoints intermedios, permite medir la evolución de la perplejidad por dominio a lo largo de los pasos.
- Generación creativa experimental: la incoherencia del modelo puede explotarse de forma deliberada en arte generativo o instalaciones que requieran texto extraño en portugués.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación cuantitativa, ni en la model card ni en los materiales asociados.

## Requisitos de hardware

- VRAM estimada para inferencia (valores calculados a partir del recuento de parámetros, no medidos): aproximadamente 92 MB en fp32, 46 MB en fp16/bf16, 23 MB en int8 y 12 MB en int4.
- Caché KV: con 6 capas y 384 dimensiones de embedding, la caché para los 256 tokens de contexto ocupa del orden de 2,4 MB en fp16, por lo que es irrelevante frente al peso del modelo.
- Cabe en cualquier GPU consumer, en iGPU y en CPU. Incluso es viable en dispositivos de placa única tipo Raspberry Pi si se ejecuta en CPU.
- GPU recomendadas: ninguna en particular; una RTX 3060 o superior queda enormemente sobredimensionada. Para el ajuste fino completo, una GPU con 8 GB de VRAM es más que suficiente.
- Opciones de despliegue: `transformers` (requiere versión >= 4.49 para cargar el tokenizador y la config directamente), `pipeline("text-generation")`, y cualquiera de los dos espacios publicados. vLLM o TGI son posibles al estar GPT-2 soportado, pero resultan desproporcionados para 256 tokens de contexto. La conversión a GGUF para llama.cpp u Ollama es factible, pero no hay artefactos publicados: habría que generarlos.
- Latencia y throughput: no disponibles como medidas publicadas. Por el tamaño, en una GPU moderna la generación debería ser del orden de miles de tokens por segundo, pero es una estimación, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suzuki-m1 GPT | 23M | 256 | pt (pt-BR/pt-PT) | CC BY-SA 4.0 | safetensors en HF; checkpoint en el paso 2.000 de 10.000 |
| GPT-2 small (OpenAI) | 124M | 1.024 | en (multilingüe residual) | MIT | safetensors y múltiples conversiones GGUF |
| Pythia-14M (EleutherAI) | 14M | 2.048 | en | Apache 2.0 | safetensors en HF, suite completa de checkpoints intermedios |
| Modelos causales lusófonos de mayor tamaño (por ejemplo, la familia Sabiá o Gervásio) | cientos de millones a miles de millones | 2.048 o superior | pt | variable | requieren verificación por modelo |

La comparación directa es limitada: Suzuki-m1 GPT no tiene equivalentes exactos en su rango de tamaño para portugués publicados con licencia abierta. Frente a GPT-2 small y Pythia-14M pierde en longitud de contexto (256 frente a 1.024 y 2.048) y en madurez y documentación de evaluación, aunque parte de cero en portugués en lugar de en inglés. Los modelos lusófonos de mayor tamaño lo superan ampliamente en calidad, pero exigen recursos de hardware muy superiores.

## Limitaciones y advertencias

- Tamaño muy reducido (23M de parámetros) y corpus limitado: el autor advierte explícitamente de que produce texto incoherente y experimental.
- El checkpoint publicado corresponde al paso 2.000 de 10.000; el modelo está en fase temprana de aprendizaje del idioma y puede emitir secuencias sin sentido.
- Longitud de contexto de solo 256 tokens, lo que invalida casi cualquier caso de uso con documentos largos o conversaciones multi-turno.
- Mezcla de pt-BR y pt-PT, además de fuentes derivadas (traducciones automáticas de subtítulos, light novels en inglés), que introduce ruido e inconsistencias ortográficas y léxicas.
- Riesgo elevado de alucinación: no se ha aplicado RLHF, DPO ni ningún ajuste de alineamiento, y no hay datos de evaluación que cuantifiquen la fiabilidad.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgo, y el corpus mezcla fuentes muy dispares sin proporciones declaradas ni proceso de deduplicación descrito.
- Licencia CC BY-SA 4.0, una licencia copyleft: cualquier obra derivada debe publicarse bajo la misma licencia. Además, el corpus incorpora fuentes con sus propias restricciones, por lo que el autor recomienda verificar los términos de las fuentes originales antes de cualquier uso comercial.
- El autor declara que no es adecuado para producción ni para uso comercial sin una evaluación previa.
- Bug conocido de cargador: el `tokenizer_config.json` se serializó con una clase `TokenizersBackend` que no existe en transformers 4.48.x; si aparece el error, hay que cargar el tokenizador manualmente con `PreTrainedTokenizerFast` apuntando al `tokenizer.json`.
- El repositorio ocupa 14,7 GB pese a que el modelo en fp32 ronda los 92 MB; el resto corresponde al histórico de checkpoints y al estado del optimizador. Conviene descargar solo los archivos necesarios.
- Ausencia total de benchmarks publicados: no es posible comparar su calidad de forma cuantitativa con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raivatv24/suzuki-m1-gpt
- Dataset de entrenamiento: https://huggingface.co/datasets/Raivatv24/Suzuki-m1
- Modelo base: https://huggingface.co/Raivatv24/Suzuki-m1
- Demo en Gradio Space (ZeroGPU): https://huggingface.co/spaces/Raivatv24/Suzuki-m1-gpt
- Demo en Streamlit: https://suzuki-m1-gpt.streamlit.app
- Resultados de la búsqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondían a sitios de Epic Games sin relación con el proyecto.
