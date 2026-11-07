# gaparecido/apertus-8b-financial-reasoner-v2

## Resumen

apertus-8b-financial-reasoner-v2 es un ajuste fino (fine-tune) del modelo suizo Swiss AI Apertus-8B-Instruct-2509, publicado por el desarrollador independiente gaparecido. El modelo está especializado en un flujo de análisis financiero en dos etapas sobre un ticker bursátil: primero clasifica la reacción del mercado ante una noticia a partir del movimiento de precio, y después genera el razonamiento que conduce a una recomendación de inversión (BUY/SELL/HOLD) en formato JSON.

Se distribuye como un checkpoint completo fusionado en bfloat16, con aproximadamente 16 GB repartidos en cuatro shards de safetensors, y no viene pre-cuantizado: el autor recomienda cargarlo en 4 bits en tiempo de ejecución para entornos con GPU de poca memoria. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia es acotada pero concreta: demuestra cómo un modelo base de 8B parámetros puede adaptarse con QLoRA a una tarea de dominio muy específica (sentiment financiero y razonamiento de valoración) y servirse con un contrato de salida estructurado. No es un modelo generalista ni compite en benchmarks abiertos; su valor está en el pipeline de análisis que implementa y en la reproducibilidad de su entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de swiss-ai/Apertus-8B-Instruct-2509) |
| Parametros totales | 8B (aproximado, segun el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de carga usa max_seq_length=2048) |
| Tipos de cuantizacion | Pesos en bfloat16; carga en 4 bits (QLoRA/Unsloth) en tiempo de ejecucion |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards, checkpoint completo fusionado, ~16 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Apertus-8B-Instruct-2509 de Swiss AI, un transformer decoder-only entrenado en bfloat16. La model card no detalla la composición del dataset de preentrenamiento original ni el número de tokens; esa información corresponde al modelo base y no se reproduce en este repositorio.

El ajuste fino se realizó con QLoRA en 4 bits mediante Unsloth y Hugging Face TRL, partiendo del espejo `unsloth/apertus-8b-instruct-2509-unsloth-bnb-4bit` del modelo base, sobre una NVIDIA L4. El entrenamiento está orientado a dos tareas encadenadas: la clasificación de la reacción del mercado (etiquetas `good`, `bad`, `neutral`, `overreaction_down`, `overreaction_up`) y la generación de razonamiento con recomendación final en JSON. No se documentan en la información disponible detalles sobre volumen de datos, número de pasos, hiperparámetros ni si hubo fases de RLHF o DPO adicionales.

Una particularidad técnica relevante es que la configuración upstream de Apertus trae `use_cache: false` y este repositorio no incluye un `generation_config.json` que lo sobrescriba, por lo que es necesario fijar `use_cache=True` en la carga para evitar que la generación recalcule la atención sobre toda la secuencia en cada token. Además, el kernel CUDA fusionado de xIELU no está disponible y se usa un fallback en Python con una penalización de rendimiento de aproximadamente el 10%.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat.
- Clasificación de reacción de mercado ante noticias financieras en cinco categorías.
- Razonamiento financiero encadenado: a partir de la reacción clasificada, un gap de valoración y fundamentales, produce una recomendación BUY/SELL/HOLD.
- Salida estructurada en JSON para integración en pipelines.
- Análisis de sentimiento financiero (tag `financial-sentiment`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del flujo de dos etapas descrito.
- No se documenta capacidad de visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Clasificación automática de noticias financieras: dado un titular y el movimiento de precio asociado a un ticker, el modelo etiqueta la reacción como `good`, `bad`, `neutral`, `overreaction_down` o `overreaction_up`, lo que permite alimentar bases de datos de eventos de mercado.
- Generación de recomendaciones estructuradas: combinando la reacción clasificada con un gap de valoración y datos de fundamentales, el modelo emite un JSON con la recomendación BUY/SELL/HOLD y su justificación, apto para consumo programático.
- Enriquecimiento de pipelines de research cuantitativo: el JSON de salida puede integrarse en un sistema de scoring que agregue señales de múltiples tickers antes de pasarlas a un motor de decisión.
- Prototipado de asistentes de análisis bursátil: al ser un checkpoint de 8B en Apache 2.0, sirve para construir demos internas de análisis de noticias sin depender de APIs propietarias.
- Evaluación de estrategias de inversión basadas en noticias: el par reacción-recomendación permite generar datasets etiquetados para backtesting de estrategias de sentimiento.
- Docencia y experimentación en NLP financiero: el repositorio incluye el código de entrenamiento y una API de ejemplo, lo que facilita reproducir el flujo completo con Unsloth y TRL.
- Servicio de inferencia autoalojado: con carga en 4 bits cabe en GPUs de gama media-alta, lo que permite desplegarlo en infraestructura propia para análisis de carteras internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy de clasificación, calidad del JSON, comparación con el modelo base) ni resultados en MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere GPUs con 24 GB o más para secuencias largas.
- VRAM estimada en 4 bits: alrededor de 5-6 GB para pesos, con margen adicional para contexto y activaciones; viable en GPUs de 12-16 GB.
- GPU recomendadas por el autor: L4, A10G, A100 o superiores, todas con soporte bf16. El entrenamiento se realizó en una NVIDIA L4.
- Advertencia crítica: en fp16 sobre una T4 los logits desbordan a NaN y todos los tokens generados son `<unk>`; no es apto para GPUs sin bf16.
- Cabe en GPU de consumo: sí, en 4 bits, en tarjetas como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090; en bf16 completo requiere 24 GB o más (RTX 3090/4090, A10G, L4).
- Opciones de despliegue: transformers con Unsloth para carga 4-bit; el autor no documenta integración con vLLM, llama.cpp, Ollama ni TGI, y al no publicar GGUF la vía natural es transformers o un servidor compatible con endpoints.
- Latencia y throughput: no disponibles. El fallback en Python del kernel xIELU implica una pérdida de aproximadamente el 10% de throughput respecto a la versión fusionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gaparecido/apertus-8b-financial-reasoner-v2 | 8B (aprox.) | no disponible | Analisis financiero en dos etapas, salida JSON | apache-2.0 | Hugging Face, 77 descargas |
| swiss-ai/Apertus-8B-Instruct-2509 | 8B (aprox.) | no disponible | Instrucciones generales, modelo base | no disponible en esta ficha | Hugging Face (modelo base) |
| unsloth/apertus-8b-instruct-2509-unsloth-bnb-4bit | 8B (aprox.) | no disponible | Espejo cuantizado a 4 bits del modelo base | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este fine-tune frente a alternativas de la misma categoría (modelos de análisis financiero o clasificadores de sentimiento especializados). La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a un modelo de 8B ajustado sobre una tarea estrecha: puede generar razonamientos plausibles pero incorrectos o justificaciones inconsistentes con los datos de entrada.
- No se han publicado métricas de evaluación, por lo que no hay evidencia cuantitativa de la calidad de la clasificación ni de la validez del JSON generado.
- No es un asesor financiero: las recomendaciones BUY/SELL/HOLD son salidas de un modelo estadístico y no deben usarse como base única para decisiones de inversión.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Apertus puede tener condiciones adicionales que conviene verificar antes de un despliegue en producción.
- Requiere GPU con soporte bf16; en T4 con fp16 la generación falla por desbordamiento a NaN.
- Es necesario forzar `use_cache=True` manualmente, ya que la configuración heredada lo desactiva y degrada gravemente la latencia.
- El repositorio es pequeño (0.2 GB en la página de Hugging Face frente a los ~16 GB declarados del checkpoint), lo que sugiere que los pesos pueden no estar completamente alojados o que la cifra de tamaño no está actualizada; conviene verificar la integridad de los shards antes de desplegar.
- El número de descargas (77) y likes (4) indica una adopción muy limitada, sin validación comunitaria significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaparecido/apertus-8b-financial-reasoner-v2
- Archivos del repositorio: https://huggingface.co/gaparecido/apertus-8b-financial-reasoner-v2/tree/main
- Modelo base: https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509
- Espejo cuantizado del modelo base: https://huggingface.co/unsloth/apertus-8b-instruct-2509-unsloth-bnb-4bit
- Codigo de entrenamiento: https://github.com/giuliano-aparecido/financial-sentiment-model
- API de ejemplo: https://github.com/giuliano-aparecido/financial-sentiment-api
- Unsloth: https://github.com/unslothai/unsloth
