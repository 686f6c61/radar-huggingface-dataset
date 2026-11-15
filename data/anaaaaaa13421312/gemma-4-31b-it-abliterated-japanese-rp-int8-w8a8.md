# anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-INT8-W8A8

## Resumen

El modelo `gemma-4-31B-it-abliterated-Japanese-RP-INT8-W8A8` es una cuantización INT8 del checkpoint `anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP`, que a su vez deriva de una variante de Gemma 4 de 31B parámetros ajustada para roleplay en japonés y sometida a un proceso de *abliteration* (eliminación de rechazos en las respuestas). El autor de esta versión cuantizada publica el modelo bajo el identificador `anaaaaaa13421312` en Hugging Face, con licencia Apache 2.0 y sin descargas ni interacciones registradas en el momento de la consulta.

La relevancia técnica de esta ficha reside en el esquema de cuantización: se ha aplicado `llmcompressor.model_free_ptq` con `scheme="W8A8"`, preservando en BF16 los módulos críticos (`lm_head`, `embed_tokens`, normas y módulos de visión/audio). El objetivo declarado es el despliegue en TPU v5e/v6e y en GPUs Ampere con 48 GB de VRAM, como la A40 de RunPod, lo que permite servir un modelo de 31B parámetros en INT8 con un consumo de pesos cercano a los 31 GB.

No se dispone de información sobre el pipeline, los idiomas oficialmente soportados ni resultados de benchmarks en la documentación proporcionada. La model card está redactada en japonés y se limita a describir el proceso de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según tags `gemma4`); detalles no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 (pesos INT8 per-channel estáticos + activaciones INT8 dinámicas per-token); `lm_head`, `embed_tokens`, normas y módulos de visión/audio preservados en BF16 |
| Idiomas soportados | no disponibles (la model card y los tags indican uso orientado a japonés, sin lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` (librería `llm-compressor`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta `gemma4`, que lo sitúa en la familia Gemma 4 de Google. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documenta el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

Lo que sí está documentado es el proceso de cuantización: se ha utilizado `llmcompressor.model_free_ptq` con esquema W8A8, un método de *post-training quantization* sin datos de calibración (*data-free*). Los pesos se cuantizan a INT8 por canal de forma estática, mientras que las activaciones se cuantizan de forma dinámica por token. Los módulos sensibles a la precisión (`lm_head`, `embed_tokens`, capas de normalización y los módulos multimodales de visión y audio) se mantienen en BF16 para preservar la calidad. El resultado es un checkpoint en formato `compressed-tensors` optimizado para aceleradores con soporte INT8, en concreto TPU v5e/v6e y GPUs Ampere de 48 GB.

## Capacidades

- Generación de texto conversacional y de rol (roleplay), según los tags del modelo.
- Respuestas en japonés, idioma al que está orientada la variante base.
- Modo *abliterated*: el modelo base ha sido modificado para reducir los rechazos ante peticiones que los modelos alineados estándar declinarían.
- Presencia de módulos de visión y audio en el checkpoint (preservados en BF16), lo que sugiere capacidades multimodales heredadas del modelo base, aunque no se documenta su funcionamiento tras la cuantización.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de roleplay en japonés en infraestructura con TPU v5e/v6e: el esquema W8A8 está específicamente pensado para estos aceleradores, lo que permite servir un modelo de 31B con pesos INT8 y aprovechar las unidades de cómputo entero de las TPU.
- Servicio en GPUs Ampere de 48 GB (A40 en RunPod): los pesos INT8 ocupan aproximadamente 31 GB, dejando margen para caché KV y overhead del runtime en una sola GPU de 48 GB, lo que abarata el coste por instancia frente a alternativas en BF16.
- Experimentación con contenido sin restricciones de alineación: la variante *abliterated* está pensada para investigación sobre comportamiento de modelos sin rechazos, en entornos controlados y con las advertencias de uso responsable correspondientes.
- Evaluación de degradación por cuantización: al conservar `lm_head`, `embed_tokens` y normas en BF16, el checkpoint sirve para estudiar el impacto de W8A8 en la calidad de generación frente al modelo base en BF16.
- Prototipado de asistentes conversacionales en japonés con presupuesto de VRAM limitado: la cuantización permite ejecutar un modelo de 31B en hardware de gama profesional en lugar de requerir clústeres multi-GPU.
- Investigación sobre modelos multimodales cuantizados: la presencia de módulos de visión y audio en BF16 permite explorar si las capacidades multimodales se preservan tras la cuantización de las capas de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 suman aproximadamente 31 GB (31.273.088.876 parámetros a 8 bits), más los módulos preservados en BF16 y la caché KV; se recomienda un mínimo de 40-48 GB de VRAM.
- GPU recomendadas: NVIDIA A40 (48 GB, Ampere) es el objetivo declarado por el autor; también encajan A100 40/80 GB, H100 y L40S siempre que el runtime soporte `compressed-tensors` INT8.
- Aceleradores TPU: TPU v5e y v6e, objetivo explícito del esquema W8A8.
- ¿Cabe en GPU de consumo? No de forma completa: una RTX 4090 (24 GB) no puede alojar los 31 GB de pesos INT8; sería necesario repartir el modelo entre varias GPUs o recurrir a cuantizaciones de menor precisión no publicadas en este repositorio.
- Opciones de despliegue: `llm-compressor` / `compressed-tensors` con runtimes compatibles (vLLM con soporte de compressed-tensors, TGI si soporta el esquema, o el stack de serving de TPU de Google). llama.cpp y Ollama no son compatibles directamente con el formato `compressed-tensors` INT8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it-abliterated-Japanese-RP-INT8-W8A8 (este) | 31,3B | no disponible | INT8 W8A8 | Apache 2.0 | Hugging Face, 0 descargas |
| gemma-4-31B-it-abliterated-Japanese-RP (base BF16) | 31,3B | no disponible | BF16 | Apache 2.0 (según herencia) | Hugging Face |
| Modelos Gemma 4 oficiales de Google | no disponible | no disponible | BF16 y otras | Gemma Terms | Kaggle / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una variante *abliterated*, lo que implica que se han reducido deliberadamente los mecanismos de rechazo; puede generar contenido inapropiado, ofensivo o dañino, y no debe desplegarse en aplicaciones orientadas al público general sin filtros adicionales.
- Etiquetado como `not-for-all-audiences`: el contenido generado puede no ser apto para todos los públicos.
- La cuantización W8A8 sin calibración (*data-free*) puede degradar la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento o generación creativa; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones específicas.
- La lista oficial de idiomas soportados no está disponible; aunque la orientación es al japonés, no se garantiza un rendimiento uniforme en otros idiomas.
- El repositorio no registra descargas ni interacciones, y el autor no ofrece documentación sobre evaluación, lo que reduce la confianza para uso en producción.
- Aunque la licencia declarada es Apache 2.0, conviene verificar la licencia del modelo Gemma 4 original de Google, ya que los términos de la familia Gemma pueden imponer restricciones adicionales al uso comercial.
- El formato `compressed-tensors` INT8 limita las opciones de despliegue; no es directamente compatible con llama.cpp, Ollama ni GGUF.
- No se documenta el comportamiento de los módulos de visión y audio tras la cuantización, por lo que las capacidades multimodales no deben darse por garantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP-INT8-W8A8
- Modelo base: https://huggingface.co/anaaaaaa13421312/gemma-4-31B-it-abliterated-Japanese-RP
- Librería de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentación de Gemma (Google): https://ai.google.dev/gemma
