# episod/tt-tnt

## Resumen

TT-TNT es un modelo de lenguaje de aproximadamente 22 millones de parámetros, con arquitectura estilo Llama-3, entrenado desde cero (inicialización aleatoria) en hardware Tenstorrent Blackhole mediante el framework `ttml` (tt-train). Desarrollado por el usuario episod, su propósito principal es demostrar que es posible diseñar, entrenar, empaquetar y servir un modelo completo utilizando exclusivamente la cadena de herramientas de Tenstorrent, sin necesidad de portar código posteriormente. El modelo se publica en formato Hugging Face y se ha verificado numéricamente.

El modelo resuelve un problema de demostración técnica más que de utilidad práctica: muestra la viabilidad de entrenar un transformer desde cero en un chip Blackhole individual, con un pipeline completo documentado. Con solo 22 millones de parámetros y una ventana de contexto de 512 tokens, no está diseñado para tareas complejas, sino para validar el flujo de trabajo TT-native. Su relevancia actual radica en que ilustra un camino para que la comunidad de IA open source explore hardware alternativo a las GPUs tradicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3 style (RoPE θ=500000, RMSNorm, SwiGLU, grouped-query attention) |
| Parametros totales | 22.025.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Hugging Face), pkl (checkpoint de entrenamiento) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar estilo Llama-3: 6 capas, tamaño oculto de 384, 6 cabezas de atención con 3 grupos KV (GQA), normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE) con θ=500000. El vocabulario es de 32.000 tokens, usando un tokenizador BPE a nivel de byte entrenado específicamente para este modelo. Los pesos se almacenan en bfloat16.

El entrenamiento se realizó sobre un único chip Tenstorrent Blackhole (en un host TT-QuietBox 2 con cuatro chips, pero solo se usó uno). El corpus es una mezcla de nueve fuentes con licencia auditada: TinyStories, Simple English Wikipedia y siete fragmentos curados de Project Gutenberg, totalizando 399.594.747 tokens emitidos contra un presupuesto de 400 millones. El modelo vio 353.495.970 tokens en una sola época (10.787 pasos con batch 64 y secuencia de 512). El optimizador fue AdamW con learning rate constante de 3e-4, weight decay 0.01 y `stochastic_rounding: true`. La pérdida final de entrenamiento fue 3.3125 y la de validación 4.2203. El tiempo total de entrenamiento fue de aproximadamente 58 minutos.

## Capacidades

- Generación de texto base: completa historias cortas o fragmentos de texto a partir de un prompt inicial, con estilo narrativo simple.
- Modelo de completado: no está entrenado con instrucciones ni chat, por lo que solo puede continuar texto, no responder preguntas.
- Capacidad multilingüe: limitada al inglés, aunque el corpus incluye textos variados (cuentos infantiles, Wikipedia simple, poesía, prosa clásica).
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin modo de pensamiento (thinking mode) ni capacidades multimodales (visión, audio).
- Demostración de pipeline: sirve como ejemplo de entrenamiento y conversión a Hugging Face desde hardware Tenstorrent.

## Casos de uso

- Demostración de entrenamiento en hardware alternativo: el modelo es un caso de estudio para desarrolladores que quieran evaluar el flujo de trabajo de Tenstorrent Blackhole con `ttml`, mostrando cómo se entrena un transformer desde cero y se convierte a formato estándar.
- Experimentación educativa: por su tamaño reducido, es útil para aprender sobre arquitecturas transformer, tokenización BPE y entrenamiento de modelos pequeños en entornos académicos o de autoaprendizaje.
- Pruebas de integración con Hugging Face: sirve para validar pipelines de conversión, verificación numérica y despliegue de modelos en el ecosistema Transformers.
- Generación de cuentos infantiles cortos: dado su entrenamiento predominante en TinyStories, puede producir narrativas simples para niños, aunque con riesgo de repeticiones o colapsos temáticos.
- Benchmark de hardware: permite medir el rendimiento de inferencia en diferentes dispositivos (CPU, GPU pequeña) debido a su tamaño mínimo, útil para comparar latencias y throughput.
- Base para fine-tuning: aunque no es un modelo capaz por sí solo, puede servir como punto de partida para experimentos de ajuste fino en tareas muy específicas de generación de texto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de entrenamiento y validación (3.3125 y 4.2203 respectivamente), pero no incluye métricas estándar como MMLU, HumanEval o GSM8K. Tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener solo 22 millones de parámetros en bfloat16, el modelo ocupa aproximadamente 44 MB en memoria (22M × 2 bytes). Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en iGPUs modernas.
- GPU recomendadas: cualquier GPU consumer (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 4090) o incluso CPU sola, ya que la inferencia es trivialmente ligera.
- En consumer GPU: sí, cabe sin problema en cualquier GPU de gama baja o media.
- Opciones de despliegue: se puede cargar con la librería `transformers` de Hugging Face, o exportar a GGUF para usarlo con llama.cpp u Ollama. También es compatible con vLLM o TGI, aunque no es necesario por su tamaño.
- Latencia y throughput: no se han publicado datos específicos, pero dado el tamaño, la generación de texto debería ser casi instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría en la información proporcionada. El modelo es comparable en tamaño a los TinyStories originales (por ejemplo, TinyStories-1M o TinyStories-3M), pero no se han publicado benchmarks que permitan una comparación cuantitativa. La model card menciona que el checkpoint original de TinyStories-only vio 0.43 de época, mientras que este modelo vio una época completa, pero no hay métricas de calidad más allá de la pérdida.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no tiene instrucciones ni plantilla de chat; no se le pueden hacer preguntas, solo completar texto.
- Contexto muy corto: 512 tokens, y la model card advierte explícitamente que no se debe usar una longitud de contexto mayor (el `model_max_length` en `tokenizer_config.json` es un valor centinela y no debe usarse como referencia).
- Dominio de TinyStories: a pesar de la mezcla de corpus, el modelo colapsa frecuentemente en historias sobre "una niña llamada Lily" y sufre bucles de repetición bajo decodificación greedy.
- Pérdida de validación alta: 4.2203, lo que indica que el modelo no ha aprendido bien patrones generales; la curva de validación se estanca y no mejora con más pasos.
- No apto para producción: es una demostración de pipeline, no un modelo capaz; cualquier uso real requeriría un fine-tuning extenso o un modelo mayor.
- Sesgos y alucinaciones: al ser un modelo base pequeño, puede generar contenido incoherente o repetitivo; no se han evaluado sesgos específicos.
- Licencia Apache-2.0: permite uso comercial, pero el modelo no es útil para aplicaciones comerciales reales debido a sus limitaciones.

## Enlaces

- Hugging Face: https://huggingface.co/episod/tt-tnt
- Repositorio GitHub: https://github.com/tsingletaryTT/tt-tnt
- Dataset del corpus: https://huggingface.co/datasets/episod/tt-tnt-corpus
- Documentación de la mezcla del corpus: https://github.com/tsingletaryTT/tt-tnt/blob/main/docs/corpus_blend.md
- Muestras de evaluación: https://github.com/tsingletaryTT/tt-tnt/blob/main/docs/measurements/samples-tt-tnt-v1.md
