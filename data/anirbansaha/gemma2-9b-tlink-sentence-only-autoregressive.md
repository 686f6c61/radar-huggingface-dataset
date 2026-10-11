# AnirbanSaha/gemma2-9b-tlink-sentence-only-autoregressive

## Resumen

`AnirbanSaha/gemma2-9b-tlink-sentence-only-autoregressive` es un ajuste fino de parámetros completos (full-parameter fine-tuning) del modelo instructivo `google/gemma-2-9b-it`, publicado por el usuario AnirbanSaha. El objetivo del ajuste no es conversacional general, sino la clasificación de relaciones temporales TLINK (temporal link) entre eventos a nivel de frase, con cuatro etiquetas posibles: BEFORE, AFTER, OTHER y NONE. El modelo se entrenó sobre el dataset `AnirbanSaha/tlink-classification-sentence-only` y mantiene el pipeline de `text-generation`, por lo que se usa como un modelo causal que genera la etiqueta como texto.

El modelo conserva la arquitectura y el tamaño del base: transformer decoder-only de 9.241.705.984 parámetros (unos 9,24 mil millones), pesos en safetensors y un repositorio de 18,5 GB. No es un modelo MoE, por lo que no hay parámetros activos diferenciados. La ventana de contexto heredada del base es de 8.192 tokens, según la documentación de Gemma 2.

Su relevancia es acotada y muy específica: es un ejemplo de reutilización de un LLM instructivo de 9B como clasificador generativo para una tarea de extracción de información temporal, con resultados de evaluación publicados (accuracy 0,7969 y macro-F1 0,7962 sobre 192 ejemplos de test). No hay datos publicados sobre el volumen del dataset, la composición del entrenamiento ni el proceso de alineamiento posterior, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atención de ventana deslizante alternada y grouped-query attention (GQA) en el modelo base |
| Parámetros totales | 9.241.705.984 (9,24 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens según la documentación del modelo base Gemma 2 9B; no se especifica si el ajuste fino la modifica |
| Tipos de cuantización | no disponibles en el repositorio; al derivar de Gemma 2 9B es compatible con cuantizaciones externas (bitsandbytes int8/int4, GPTQ, AWQ, GGUF) generadas por el usuario |
| Idiomas soportados | no disponibles en la model card; el modelo base está entrenado principalmente con datos en inglés |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-9b-it`, un transformer decoder-only de 9,24 mil millones de parámetros con 42 capas, atención con ventana deslizante alternada (ventanas locales de 4.096 tokens combinadas con capas de atención global) y GQA. El ajuste aplicado es de parámetros completos, no un adaptador LoRA ni una capa de clasificación añadida: el modelo conserva la cabeza de lenguaje y emite la etiqueta TLINK como texto generado de forma autorregresiva. Esto explica el sufijo "autoregressive" del nombre del repositorio y que el pipeline declarado sea `text-generation` en lugar de `text-classification`.

El entrenamiento se realizó sobre `AnirbanSaha/tlink-classification-sentence-only`, un dataset de relaciones temporales a nivel de frase con cuatro clases (BEFORE, AFTER, OTHER, NONE). No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el dominio de los textos (clínico, noticias, narrativa general), la proporción entre clases ni si hubo una fase posterior de RLHF o DPO. Al partir de un modelo ya instruction-tuned (`gemma-2-9b-it`), es razonable asumir un ajuste supervisado sobre pares instrucción-respuesta, pero esto no está confirmado en la model card. El repositorio incluye un directorio `evaluation/` con predicciones, informe de clasificación, matriz de confusión y resumen legible por máquina.

## Capacidades

- Clasificación de relaciones temporales TLINK entre eventos a nivel de frase, con cuatro etiquetas: BEFORE, AFTER, OTHER y NONE.
- Generación de texto causal autorregresiva, heredada del modelo base `gemma-2-9b-it`.
- Formato de salida controlado: el modelo produce etiquetas válidas en 192 de 192 ejemplos del conjunto de test, sin salidas inválidas.
- Conversación multi-turno: capacidad heredada del modelo instructivo base, no garantizada tras un ajuste fino de parámetros completos.
- Soporte de tool calling o function calling: no documentado en la model card; no se puede asumir tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el ajuste se realizó sobre un dataset sin idiomas especificados.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Anotación de líneas de tiempo clínicas: dado un par de eventos mencionados en una misma frase de un informe médico, el modelo asigna la relación temporal (BEFORE, AFTER, OTHER, NONE), lo que permite reconstruir la secuencia de acontecimientos de un paciente a partir de texto libre.
- Preanotación de corpus para anotadores humanos: con una accuracy de 0,7969 en el conjunto de test, el modelo puede generar una primera pasada de etiquetas TLINK que los anotadores revisan, reduciendo el coste de construcción de corpus temporales.
- Extracción de información temporal en pipelines de PLN: integrado como componente de un sistema mayor (NER de eventos + clasificación de pares), genera las aristas temporales de un grafo de eventos.
- Razonamiento temporal en sistemas de question answering: para responder preguntas del tipo "¿qué ocurrió antes?", el sistema puede clasificar los pares de eventos relevantes y ordenarlos antes de componer la respuesta.
- Análisis de narrativas en dominios con secuencias de eventos: informes financieros, partes de incidentes, registros industriales o crónicas periodísticas donde el orden de los hechos es la información relevante.
- Punto de partida para ajustes posteriores en tareas temporales relacionadas: al ser un fine-tune de parámetros completos sobre Gemma 2 9B, sirve como inicialización para tareas de extracción de relaciones con esquemas similares.
- Evaluación comparativa de estrategias de clasificación generativa: permite medir el rendimiento de un LLM instructivo ajustado frente a clasificadores discriminativos clásicos en tareas de relación temporal.
- Conversación general: solo si el ajuste no ha degradado las capacidades instructivas del base, algo que no está verificado en la información disponible.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el conjunto de test del dataset `tlink-classification-sentence-only` (192 ejemplos):

| Métrica | Valor |
|---|---|
| Accuracy | 0,7969 |
| Macro-F1 | 0,7962 |
| Weighted-F1 | 0,7978 |
| Salidas inválidas | 0 de 192 |

No se han publicado resultados en la información disponible para benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ni comparaciones con otros modelos evaluados sobre el mismo conjunto de test.

## Requisitos de hardware

- Peso de los pesos en el repositorio: 18,5 GB, lo que corresponde a safetensors en precisión completa (bf16/fp16) para 9,24 mil millones de parámetros.
- VRAM estimada en bf16/fp16: en torno a 19-20 GB solo para los pesos, más la caché KV; aproximadamente 2,8 GB adicionales para 8.192 tokens en bf16 según la configuración del modelo base (estimación a partir de 42 capas y 8 cabezas KV).
- GPU recomendadas en precisión completa: A100 40 GB, H100 80 GB, L40S 48 GB. En una RTX 4090 de 24 GB cabe con contexto corto, pero queda muy justo de memoria.
- VRAM estimada cuantizado: unos 10-11 GB en int8 y 5-6 GB en int4, lo que permite ejecutarlo en RTX 3060 12 GB, RTX 4070, RTX 4080 o Apple Silicon con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 a precisión completa con contexto reducido y en GPUs de 8-12 GB si se cuantiza a int4.
- Opciones de despliegue: `transformers`, text-generation-inference (la etiqueta `text-generation-inference` está declarada y el modelo es `endpoints_compatible`), vLLM (soporta la arquitectura gemma2), SGLang y llama.cpp/Ollama, aunque para estas dos últimas es necesario convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de otros modelos sobre el conjunto de test de TLINK utilizado, por lo que la comparación de rendimiento en la tarea específica es "no disponible". La tabla siguiente compara únicamente las características del modelo base y de alternativas de tamaño similar, no el rendimiento en clasificación temporal.

| Modelo | Parámetros | Contexto | Licencia | Ajustado para TLINK | Disponibilidad |
|---|---|---|---|---|---|
| gemma2-9b-tlink-sentence-only-autoregressive | 9,24 B | 8.192 tokens | Gemma Terms of Use | Sí, full fine-tuning | HuggingFace, safetensors |
| google/gemma-2-9b-it | 9,24 B | 8.192 tokens | Gemma Terms of Use | No | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | No | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens | Apache 2.0 | No | HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | No | HuggingFace |

## Limitaciones y advertencias

- Es un modelo de tarea específica: fuera de la clasificación TLINK a nivel de frase, su comportamiento no está validado y puede degradarse respecto al base.
- El ajuste de parámetros completos suele deteriorar el seguimiento de instrucciones generales y el formato conversacional; no hay evaluación publicada de esta posible regresión.
- La etiqueta NONE introduce un caso de "sin relación" que, en corpus reales, suele estar sobrerrepresentado; no se publica la distribución de clases del dataset ni la matriz de confusión en crudo, solo el resumen.
- La evaluación se realizó sobre 192 ejemplos, un conjunto pequeño: las métricas tienen un intervalo de confianza amplio y no permiten extrapolar con fiabilidad a otros dominios.
- El modelo trabaja a nivel de frase ("sentence-only"); no está diseñado para razonamiento temporal entre frases o a nivel de documento.
- No se documentan el dominio, el idioma ni el proceso de anotación del dataset de entrenamiento, lo que impide estimar el sesgo de dominio y la transferibilidad.
- Riesgo de alucinación y de etiquetas plausibles pero incorrectas: aunque en el test no se registraron salidas inválidas, el modelo es generativo y puede producir texto fuera del conjunto de etiquetas en entradas muy alejadas de la distribución de entrenamiento.
- Sesgos heredados del modelo base Gemma 2 (sesgos de género, culturales y de representación presentes en los datos de preentrenamiento).
- Licencia Gemma Terms of Use: el uso comercial está permitido sujeto a las condiciones y a la política de usos prohibidos de Google; la redistribución exige trasladar los términos a los usuarios posteriores y mantener las atribuciones correspondientes.
- El repositorio presenta 0 descargas y 0 interacciones, por lo que no existe validación independiente por parte de la comunidad ni revisión por pares de los resultados declarados.
- No se publican detalles de hiperparámetros, semillas, épocas ni particiones train/validation/test, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnirbanSaha/gemma2-9b-tlink-sentence-only-autoregressive
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/AnirbanSaha/tlink-classification-sentence-only
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Informe técnico de Gemma 2 (modelo base): https://arxiv.org/abs/2408.00118
- Documentación de Gemma 2 en Google AI: https://ai.google.dev/gemma/docs/model_card

No se han encontrado papers, blogs, repositorios auxiliares ni demos específicos de este ajuste fino en la información disponible.
