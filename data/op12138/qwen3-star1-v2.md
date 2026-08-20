# OP12138/qwen3-star1-v2

## Resumen

`qwen3-star1-v2` es un fine-tuning completo del modelo base `Qwen/Qwen3-1.7B`, publicado por el usuario OP12138 en agosto de 2026. Se trata de un modelo de generación de texto orientado a conversación, entrenado sobre el dataset denominado "star1" mediante fine-tuning full (todos los parámetros). El resultado es un modelo de aproximadamente 1.720 millones de parámetros, pensado para tareas de chat y generación de texto en entornos con recursos limitados.

La relevancia de este modelo reside en que parte de una base ya eficiente —Qwen3-1.7B— y la adapta a un conjunto de datos conversacionales específico, lo que puede mejorar el comportamiento en diálogo respecto al modelo original. Sin embargo, la publicación es mínima: no se incluyen resultados de evaluación, descripción detallada del dataset ni información sobre idiomas soportados, lo que limita su uso en producción sin una evaluación propia.

El modelo se distribuye en formato `safetensors` y es compatible con la librería `transformers` y `text-generation-inference`. La licencia indicada es "other", no especificada, por lo que el uso comercial debe verificarse con el autor antes de desplegarlo en entornos productivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parámetros totales | 1.720.574.976 (~1,72B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | No especificada por el autor; el modelo base Qwen3-1.7B soporta 32.768 tokens (dato público) |
| Tipos de cuantización | No disponibles en el repositorio (solo pesos en `safetensors`; sin GGUF ni AWQ) |
| Idiomas soportados | No especificados; el modelo base Qwen3-1.7B es multilingüe (incluye español) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (`full fine-tuning`) del `Qwen3-1.7B`, un transformer decoder-only con atención estándar y arquitectura de la familia Qwen3. El proceso de entrenamiento se realizó con el framework `llama-factory`, sobre el dataset "star1", aunque no se detalla la composición ni el tamaño del dataset. Los hiperparámetros declarados son: tasa de aprendizaje de 1e-05, batch de entrenamiento efectivo de 16 (batch de 1 con 16 pasos de acumulación de gradiente), programador de tasa de aprendizaje coseno con warmup del 5%, y 5 épocas completas. Se usó el optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación adicional; se trata de un ajuste supervisado estándar (SFT).

## Capacidades

- Generación de texto conversacional: el modelo está ajustado para mantener diálogos multi-turno, aunque no hay métricas publicadas que verifiquen su calidad.
- Razonamiento básico: hereda las capacidades del modelo base Qwen3-1.7B, que incluye razonamiento de sentido común y lógica simple, aunque no se han validado tras el fine-tuning.
- Generación de código: el base Qwen3-1.7B es capaz de generar y depurar código en varios lenguajes; el fine-tuning no indica que esta capacidad se haya perdido, pero tampoco se verifica.
- Multilingüismo: el modelo base soporta múltiples idiomas, incluyendo español, pero el fine-tuning no declara idiomas específicos.
- No se ha evidenciado soporte para tool calling, function calling, agentes, visión o audio en la documentación del modelo.

## Casos de uso

- Asistentes conversacionales ligeros: el tamaño de 1,72B permite desplegar el modelo en entornos con recursos moderados (GPU de 4-8 GB) para chatbots de atención al cliente o asistentes virtuales con contexto limitado.
- Generación de texto en aplicaciones embebidas: al ser un modelo pequeño, puede integrarse en aplicaciones móviles o de escritorio que requieran generación de texto sin depender de APIs externas.
- Fine-tuning específico de dominio: al ser un modelo ya ajustado, sirve como punto de partida para fine-tuning adicional en dominios concretos (por ejemplo, soporte técnico) con datasets propios.
- Pruebas de concepto de sistemas conversacionales: su tamaño permite iterar rápidamente en prototipos de chatbots antes de escalar a modelos mayores.
- Despliegue en infraestructura edge: con cuantización a 4 bits, cabe en dispositivos con ~2 GB de RAM y puede ejecutarse con `llama.cpp` en CPU.
- Generación de contenido estructurado: aunque no se declara soporte de tool calling, puede generar JSON o texto semiestructurado si se le proporcionan ejemplos en el prompt, útil para automatizaciones simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card contiene una entrada llamada "sft-v2" con una lista de resultados vacía (`results: []`), por lo que no hay métricas de MMLU, HumanEval, GSM8K u otros conjuntos de evaluación declarados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,5 GB (pesos de 1,72B en FP16) más memoria para activaciones y KV-cache, con lo que se recomienda al menos 6 GB de VRAM para un contexto de 32K tokens.
- VRAM estimada con cuantización 4-bit: alrededor de 1,5-2 GB de pesos, permitiendo funcionar en GPUs con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) si se usa cuantización GGUF.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4070, A10G o A100 si se usa contexto largo y batch alto; el modelo también puede ejecutarse en CPU con `llama.cpp` para uso interactivo.
- Opciones de despliegue: compatible con `transformers` y `text-generation-inference` (TGI) según los tags del repositorio; también puede convertirse a GGUF para `llama.cpp` u `Ollama`.
- Latencia: no hay datos publicados; en una RTX 4090 se espera una latencia de decodificación de aproximadamente 20-40 tokens/s en FP16, y en CPU puede bajar a 5-10 tokens/s con cuantización 4-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `qwen3-star1-v2` (este) | 1,72B | No especificado (base: 32K) | other (no especificada) | Repositorio público en HF |
| Qwen3-1.7B (base) | 1,72B | 32K tokens | Apache 2.0 | Oficial en HF |
| Gemma-2 2B | 2,6B | 8K tokens | Gemma license (uso comercial permitido) | Oficial en HF |
| Phi-3.5-mini | 3,8B | 128K tokens | MIT | Oficial en HF |

La comparativa se basa en características públicas de los modelos base; no se dispone de datos de rendimiento del fine-tuning para comparar de forma cuantitativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad: la ausencia de benchmarks impide conocer el rendimiento real en tareas de razonamiento, código o conversación.
- Riesgo de alucinación: al ser un modelo pequeño y sin verificación de calidad, puede generar respuestas plausibles pero incorrectas, especialmente en dominios factuales.
- Licencia "other" no especificada: el uso comercial, la redistribución o la modificación no están claros; es imprescindible contactar al autor o revisar el repositorio antes de usar en producción.
- Idiomas no declarados: aunque el base es multilingüe, el fine-tuning puede haber degradado el rendimiento en idiomas distintos al del dataset "star1".
- Sin soporte de herramientas: no se ha verificado la capacidad de tool calling o function calling, limitando su uso en agentes complejos.
- Contexto no confirmado: no se documenta si el fine-tuning mantiene la ventana de 32K tokens del base; en producción se recomienda probar con contexto reducido.
- Repositorio con 0 descargas y 0 likes: es una publicación reciente y no validada por la comunidad, por lo que se recomienda una evaluación exhaustiva antes de cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OP12138/qwen3-star1-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Framework de entrenamiento (llama-factory): https://github.com/hiyouga/LLaMA-Factory
