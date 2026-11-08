# ggml-org/LFM2.5-24B-A2B-GGUF

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Liquid AI, publicado originalmente en el repositorio `LiquidAI/LFM2.5-24B-A2B`. Con 23.971.587.712 parámetros totales, activa solo una fracción de ellos por token (A2B indica aproximadamente 2 mil millones de parámetros activos, aunque el dato exacto no está confirmado en la información disponible). Está diseñado para generación de texto conversacional y destaca por su eficiencia en decodificación: según la model card de la versión de Unsloth, alcanza 184 tokens/s en un Apple M5 Max y 114 tokens/s en un AMD Ryzen AI Max+ 395, hasta 1,7 veces más rápido que el siguiente mejor modelo comparable y con menor consumo de memoria.

La ficha que nos ocupa corresponde a la conversión a formato GGUF realizada por ggml-org, el equipo detrás de llama.cpp. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo mediante llama.cpp y aplicaciones derivadas, con cuantizaciones Q8_0 y Q4_K_M idénticas a las publicadas por LiquidAI, además de una variante Q4_0 entrenada con Quantization-Aware Distillation (QAD) para recuperar la precisión perdida por la cuantización agresiva.

El modelo es relevante porque combina un tamaño total grande (24B) con un coste de inferencia propio de un modelo mucho menor gracias a su naturaleza MoE, y porque su licencia LFM1.0 (marcada como "other" en Hugging Face) impone condiciones específicas que conviene revisar antes de un uso comercial. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles internos no disponibles |
| Parametros totales | 23.971.587.712 |
| Parametros activos | no disponible (la nomenclatura A2B sugiere ~2B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q4_K_M, Q4_0 (QAD); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (license_name: lfm1.0, etiquetada como "other") |
| Formato de pesos | GGUF (repo de 176,0 GB); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que LFM2.5-24B-A2B es un modelo Mixture of Experts con 23.971.587.712 parámetros totales. La nomenclatura "A2B" es coherente con la convención de Liquid AI para indicar parámetros activos por token (del orden de 2 mil millones), lo que explicaría su alta velocidad de decodificación y su bajo consumo de memoria relativo a su tamaño total. No obstante, el número exacto de expertos, la política de enrutamiento, la dimensión de las capas y el mecanismo de atención no están documentados en la información proporcionada.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF está marcada explícitamente con un TODO ("add info") y advierte de que la conversión se ha generado automáticamente mediante la herramienta `ggml-org/convert`. Como innovación destacable y documentada, LiquidAI publica una variante Q4_0 entrenada con Quantization-Aware Distillation (QAD), pensada para recuperar la precisión que se pierde con la cuantización a 4 bits.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta multi-turno: el tag conversacional y su uso previsto en llama.app apuntan a diálogo, aunque no hay evaluación publicada.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`, lo que facilita su despliegue en infraestructuras compatibles con la API de Hugging Face.
- Ejecución local eficiente: cuantizaciones GGUF optimizadas para llama.cpp, con variantes Q8_0, Q4_K_M y Q4_0 QAD.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `llama serve -hf ggml-org/LFM2.5-24B-A2B-GGUF` y servir diálogo multi-turno en estaciones de trabajo sin GPU dedicada de gran tamaño, gracias a su naturaleza MoE y a las cuantizaciones Q4.
- Inferencia en hardware de consumo: con la cuantización Q4_K_M o la Q4_0 QAD, cabe en equipos con memoria unificada (Apple Silicon, AMD Ryzen AI Max+) donde se han medido 184 y 114 tokens/s respectivamente, lo que lo hace apto para prototipado y demos interactivas.
- Servicio de generación de texto autoalojado: su compatibilidad con endpoints y con llama.cpp permite montar una API interna de generación de texto sin depender de proveedores externos, controlando los datos en la propia infraestructura.
- Procesamiento por lotes de textos largos: la alta velocidad de decodificación documentada reduce el coste por token en tareas de resumen, reescritura o clasificación generativa ejecutadas en lote sobre CPU/GPU integrada.
- Evaluación comparativa de modelos MoE: útil en investigación para estudiar el equilibrio entre parámetros totales, parámetros activos y rendimiento real en hardware heterogéneo.
- Base para ajuste fino o destilación: al existir pesos en safetensors en el modelo base y conversiones GGUF, puede servir como punto de partida para experimentos de cuantización consciente (QAD) o adaptaciones ligeras, siempre respetando la licencia LFM1.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento documentados son de velocidad de decodificación, procedentes de la model card de la versión de Unsloth:

| Plataforma | Velocidad de decodificación | Comparativa |
|---|---|---|
| Apple M5 Max | 184 tokens/s | Hasta 1,7x más rápido que el siguiente mejor modelo comparable, con menor memoria |
| AMD Ryzen AI Max+ 395 | 114 tokens/s | Igual comparativa que la anterior |

## Requisitos de hardware

- VRAM/memoria estimada: no disponible de forma oficial. Como referencia orientativa a partir del tamaño del repo (176,0 GB, que incluye todas las cuantizaciones), la variante Q8_0 rondaría los 25-26 GB y la Q4_K_M aproximadamente 14-15 GB; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo está optimizado para ejecución en CPU y memoria unificada mediante llama.cpp.
- Cabe en GPU de consumo: previsiblemente sí con cuantizaciones Q4 en GPUs de 16-24 GB (por ejemplo, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp y llama.app (`llama serve -hf ggml-org/LFM2.5-24B-A2B-GGUF`); compatibilidad con endpoints de Hugging Face. No se documenta soporte explícito de vLLM, TGI u Ollama.
- Latencia y throughput: 184 tokens/s en Apple M5 Max y 114 tokens/s en AMD Ryzen AI Max+ 395, con el menor uso de memoria entre los modelos comparados según Unsloth.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (esta ficha) | 23,97B | no disponible (~2B por nomenclatura) | no disponible | LFM1.0 | GGUF en ggml-org y Unsloth; safetensors en LiquidAI |
| Modelos comparables de la misma categoría MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo menciona comparaciones genéricas de velocidad frente a "el siguiente mejor modelo" sin identificarlo, por lo que no es posible construir una comparativa nominal con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse la composición del corpus de entrenamiento, no puede evaluarse el sesgo de los datos.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones de fidelidad ni de tasas de alucinación publicadas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Licencia: LFM1.0 está etiquetada como "other" y enlaza a un texto legal específico; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede incluir restricciones de despliegue o de atribución.
- Conversión automática: el repositorio GGUF se genera con `ggml-org/convert` y su model card está incompleta (TODO "add info"); conviene validar la calidad de la cuantización frente a los GGUF oficiales de LiquidAI.
- Precisión en cuantizaciones bajas: Q4_0 puede degradar la calidad; la variante QAD mitiga este efecto, pero no hay métricas publicadas que lo cuantifiquen.
- Datos de rendimiento limitados: las cifras de tokens/s provienen de la model card de Unsloth y no han sido verificadas de forma independiente en la información disponible.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/ggml-org/LFM2.5-24B-A2B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- GGUF oficiales de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- GGUF de Unsloth: https://huggingface.co/unsloth/LFM2.5-24B-A2B-GGUF
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación llama.app: https://llama.app
