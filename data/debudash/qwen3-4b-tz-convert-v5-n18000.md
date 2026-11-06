# debudash/qwen3-4b-tz-convert-v5-n18000

## Resumen

El modelo `debudash/qwen3-4b-tz-convert-v5-n18000` es un adaptador LoRA (PEFT) publicado por el usuario `debudash` sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el equipo Qwen de Alibaba. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de bajo rango que se cargan junto al modelo base para modificar su comportamiento. El nombre del repositorio sugiere un ajuste orientado a conversión de zonas horarias ("tz-convert") con 18 000 muestras de entrenamiento, aunque la model card no documenta explícitamente esta finalidad.

La relevancia de esta ficha es limitada: el adaptador no incluye documentación técnica, no declara licencia, idiomas ni datos de entrenamiento, y no cuenta con descargas ni interacciones en el momento de su publicación. Su interés principal radica en el modelo base subyacente, Qwen3-4B-Instruct-2507, un transformer denso de 4 000 millones de parámetros con ventana de contexto de 262 144 tokens nativa, sobre el que se puede aplicar este adaptador.

Por tanto, esta ficha describe el adaptador combinado con su base, indicando de forma explícita todos los datos que el autor no ha publicado y que no pueden inferirse de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-4B-Instruct-2507 |
| Parametros totales | 4 000 millones (modelo base); adaptador LoRA de rango bajo (tamaño del repo: 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible en el adaptador; el modelo base admite cuantizaciones GGUF, AWQ, GPTQ y bitsandbytes en el ecosistema Qwen |
| Idiomas soportados | no disponible (el autor no los declara; el modelo base es multilingüe) |
| Licencia | no disponible (el autor no la declara; el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft 0.21.2, transformers |
| Pipeline | text-generation |
| Tarea declarada | conversational |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) que se inyecta en las capas del transformer denso Qwen3-4B-Instruct-2507. No se especifica el rango, el alpha, las capas objetivo ni los módulos adaptados. El tamaño del repositorio (0,1 GB) es coherente con un adaptador de rango bajo sobre un modelo de 4 000 millones de parámetros, pero no permite deducir la configuración exacta.

La model card no documenta el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus, la existencia de RLHF o DPO, ni los hiperparámetros utilizados. El nombre del repositorio ("tz-convert-v5-n18000") sugiere un ajuste para conversión de zonas horarias con 18 000 ejemplos y una quinta iteración del proceso, pero esta interpretación no está confirmada por el autor. Tampoco se indican innovaciones técnicas propias del adaptador; todas las capacidades arquitectónicas (atención, contexto largo, modo thinking) provienen del modelo base.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del modelo base Instruct.
- Razonamiento y matemáticas básicas, con soporte de modo "thinking" del modelo base Qwen3 (no confirmado en el adaptador).
- Generación de código y soporte de tool calling, siempre que el adaptador no haya degradado estas capacidades del base.
- Capacidades multilingües del modelo base (no verificadas tras el ajuste).
- Posible especialización en conversión de zonas horarias, según el nombre del repositorio, sin documentación que lo confirme.
- No se declaran capacidades de visión, audio ni agentes multi-paso específicas del adaptador.

## Casos de uso

- Conversión de zonas horarias en asistentes de calendario: el adaptador podría haberse ajustado para transformar fechas y horas entre zonas, integrándose en un backend que combine el modelo base con el adaptador LoRA cargado mediante PEFT.
- Prototipado rápido de asistentes conversacionales especializados: al ser un adaptador de 0,1 GB, se puede cargar y descargar sobre el modelo base sin duplicar los 8 GB en fp16 del modelo completo, facilitando experimentos A/B.
- Evaluación de técnicas de fine-tuning ligero: sirve como caso de estudio de un LoRA de quinta iteración con 18 000 muestras, útil para investigadores que comparen estrategias de ajuste.
- Despliegue en entornos con memoria limitada: el adaptador se puede fusionar con el modelo base cuantizado a 4 bits (por ejemplo, GPTQ o AWQ) para inferencia en GPU de consumo.
- Filtrado y normalización de datos temporales en pipelines ETL: si la especialización en zonas horarias es real, podría usarse para parsear y normalizar campos de fecha/hora en registros heterogéneos.
- Base para ajustes posteriores: al ser un adaptador PEFT, se puede combinar con otros adaptadores o continuar el entrenamiento con nuevos datos, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en fp16 para el modelo base fusionado con el adaptador; unos 2,5-3 GB en cuantización de 4 bits.
- GPU recomendadas: NVIDIA A100, H100 o L40S para fp16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores con cuantización de 4 bits; en fp16 requiere al menos 10 GB de VRAM libre.
- Opciones de despliegue: transformers + peft para carga del adaptador; vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| debudash/qwen3-4b-tz-convert-v5-n18000 | 4 000 M (base) + LoRA | 262 144 | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | 4 000 M | 262 144 | Apache 2.0 | Hugging Face, ampliamente adoptado |
| meta-llama/Llama-3.2-3B-Instruct | 3 000 M | 128 000 | Llama 3.2 Community License | Hugging Face |
| google/gemma-3-4b-it | 4 000 M | 128 000 | Gemma Terms of Use | Hugging Face |

El adaptador no aporta ventajas medibles frente al modelo base sin benchmarks publicados; su interés es experimental y su licencia no está declarada, lo que supone una desventaja frente a las alternativas con licencias explícitas.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; el modelo base es Apache 2.0, pero el adaptador podría tener términos distintos.
- Riesgo de alucinación inherente al modelo base, no evaluado tras el ajuste.
- Posible degradación de capacidades generales del base si el ajuste se centró en un dominio estrecho (zonas horarias), sin datos que lo confirmen.
- Sin descargas ni validación por la comunidad: no hay evidencia de calidad ni de reproducibilidad.
- El adaptador requiere cargar el modelo base Qwen3-4B-Instruct-2507, con los requisitos de hardware asociados.
- No se especifican idiomas; el comportamiento multilingüe del base puede haberse visto afectado por el ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/debudash/qwen3-4b-tz-convert-v5-n18000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
