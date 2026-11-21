# puretensor/OLMoE-1B-7B-0125-Instruct-NVFP4A16-ExpertsOnly

## Resumen

OLMoE-1B-7B-0125-Instruct-NVFP4A16-ExpertsOnly es una cuantización de 4 bits del modelo instructivo OLMoE-1B-7B-0125-Instruct de Ai2 (Allen Institute for AI), publicada por PureTensor. Se trata de una versión experimental que reduce el peso del checkpoint de 13,84 GB (BF16) a 4,58 GB aplicando cuantización NVFP4 exclusivamente a las capas de expertos del modelo, manteniendo atención, routers, embeddings y todas las activaciones en 16 bits.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 6.919.161.856 parámetros totales, 16 bloques y 64 expertos por bloque, de los cuales 8 se activan por token. La cuantización emplea el esquema `NVFP4A16` de compressed-tensors (valores E2M1 de 4 bits, una escala FP8 E4M3 por grupo de 16 y una escala FP32 por tensor), aplicado mediante GPTQ sobre las 3.072 capas de expertos, que representan el 96 % de los pesos de cada bloque.

Su relevancia es doble: por un lado, demuestra que cuantizar solo los expertos de un MoE conserva la calidad casi intacta (GSM8K dentro del ruido estadístico, MMLU 0,54 puntos por debajo) mientras acelera la inferencia entre 1,4x y 2,25x en vLLM; por otro, advierte de un riesgo práctico importante: cargar el checkpoint de forma convencional en Transformers produce salidas incorrectas sin lanzar ningún error, por lo que requiere vLLM para un uso fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), 16 bloques, 64 expertos por bloque, 8 activos por token |
| Parametros totales | 6.919.161.856 |
| Parametros activos | no disponible (8 de 64 expertos por token; el dato exacto de parametros activos no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (4 bits E2M1 en expertos, escalas FP8 E4M3 por grupo de 16 y FP32 por tensor); atención, routers, embeddings, head y normas en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`), 4,58 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos: 16 bloques con 64 expertos cada uno y enrutamiento que activa 8 expertos por token. La cuantización se aplicó con GPTQ (`block_size` 128, `dampening_frac` 0.01, `actorder` estático) sobre las 3.072 capas de expertos, que suponen el 96 % de los pesos de cada bloque. Se mantuvieron en BF16 las proyecciones de atención (4 % de los pesos, 0,39 GB adicionales), los routers de expertos, los embeddings de tokens, la cabeza de salida, todas las normas y todas las activaciones.

La calibración usó 512 muestras en formato de chat de `mlabonne/open-perfectblend` de hasta 2.048 tokens cada una. La innovación metodológica destacable es el tratamiento de calibración por experto: cada token de calibración se pasa por todos los expertos, y los tokens que el router no envió a un experto cuentan con peso 0,1 en las estadísticas de ese experto, de modo que el experto menos utilizado recibió unos 7.000 tokens enrutados. Las herramientas empleadas fueron llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. No se detallan los datos de entrenamiento del modelo base (número de tokens, composición del dataset ni si hubo RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat instructiva heredada del modelo base.
- Razonamiento y matemáticas: el modelo base y este checkpoint rinden en GSM8K (67,78 en evaluación offline), lo que indica capacidad de resolución de problemas aritméticos de varios pasos.
- Conocimiento general y respuesta a preguntas de opción múltiple (MMLU).
- Enrutamiento MoE con 8 expertos activos por token; la cuantización preserva el 96,8 % de las elecciones de experto del modelo BF16.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso explícito: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue de bajo coste en producción: al ocupar 4,58 GB frente a 13,84 GB en BF16, permite servir el modelo en GPUs con menos VRAM y con mayor throughput (hasta 2,25x con 32 peticiones concurrentes en vLLM), lo que abarata el coste por token en cargas de chat.
- Atención al cliente automatizada en inglés: el modelo base es instructivo y conversacional; la cuantización conserva el 92,7 % de coincidencia en el token top-1 en textos de chat, por lo que es adecuado para diálogos multi-turno siempre que la ventana de contexto del modelo base sea suficiente.
- Asistentes de resolución de problemas matemáticos: con un rendimiento en GSM8K prácticamente idéntico al BF16 (67,78 frente a 67,85), sirve para tutores o verificadores aritméticos donde el coste de inferencia importa.
- Evaluación e investigación sobre cuantización MoE: el checkpoint incluye métricas detalladas de divergencia KL, acuerdo de enrutamiento y pruebas pareadas McNemar, lo que lo convierte en un caso de estudio reproducible para investigar el impacto de cuantizar solo expertos.
- Servicio de inferencia con vLLM en hardware Blackwell: el autor lo validó en una GPU de estación de trabajo con compute capability 12.0 usando la ruta weight-only FP4 de vLLM; es un escenario realista para prototipos y entornos de desarrollo con GPUs de nueva generación.
- Clasificación y generación de texto a gran escala en inglés: tareas de etiquetado, resumen o generación de borradores donde el throughput agregado con múltiples streams (2,11x con 8 concurrentes) reduce el tiempo de procesamiento por lote.
- Base para fine-tuning experimental: al ser un checkpoint cuantizado de 4 bits con licencia Apache 2.0, puede servir como punto de partida para estudiar adaptadores o técnicas de recuperación de calidad, aunque el autor no documenta soporte de entrenamiento.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13 (configuraciones por defecto de `mmlu` y `gsm8k`, sin plantilla de chat) y con vLLM 0.34.0. La prueba pareada es un test exacto de McNemar sobre la corrección por pregunta.

| Metrica | BF16 | Este checkpoint | Cambio | Prueba pareada |
|---|---:|---:|---:|---|
| MMLU, accuracy (14.042 preguntas) | 53,48 | 52,94 | -0,54 | 597 perdidas, 521 ganadas, p = 0,025 |
| GSM8K offline (1.319 problemas) | 67,85 | 67,78 | -0,07 | 92 perdidas, 91 ganadas, p = 1,0 |
| GSM8K via API de vLLM | 68,39 | 68,23 | -0,16 | 89 perdidas, 87 ganadas, p = 0,94 |
| Perplejidad WikiText-2 (65.536 tokens) | 11,33 | 11,60 | +0,27 | no disponible |

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test | 65.536 | 0,074 | 0,62 | 87,9 % |
| Chat (`HuggingFaceH4/ultrachat_200k`, `test_sft`, 128 conversaciones) | 111.884 | 0,035 | 0,36 | 92,7 % |

| Metrica en vLLM | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K via API de completions | 68,39 | 68,23 |
| Throughput, 1 stream | 1,00x | 1,40x |
| Throughput, 8 concurrentes | 1,00x | 2,11x |
| Throughput, 32 concurrentes | 1,00x | 2,25x |

El acuerdo de enrutamiento con BF16 es del 96,8 % de media en los 8 expertos elegidos por token. La calibración se hizo con una sola semilla, sin repeticiones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB solo para pesos; con overhead de activaciones y caché KV conviene prever al menos 8-10 GB para uso interactivo, aunque el dato exacto no está publicado.
- GPU recomendadas: el autor validó el checkpoint en una GPU NVIDIA Blackwell de estación de trabajo (compute capability 12.0) con vLLM 0.34.0, usando la ruta weight-only FP4 para los expertos y BF16 para la atención.
- Cabe en GPU de consumo: por tamaño de pesos (4,58 GB) es compatible con GPUs de consumo con 8 GB o más, aunque la ruta FP4 de vLLM requiere hardware Blackwell; en GPUs anteriores el soporte de NVFP4 depende de la versión de vLLM y del hardware.
- Opciones de despliegue: vLLM es el motor recomendado y validado. La carga directa en Transformers produce salidas incorrectas sin error, según advierte el autor.
- Latencia y throughput: 1,40x con un stream, 2,11x con 8 concurrentes y 2,25x con 32 frente a BF16, medido con generaciones greedy de 256 tokens fijos. El rendimiento variará en otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (OLMoE-1B-7B-0125-Instruct NVFP4A16 ExpertsOnly) | 6.919.161.856 | no disponible | MMLU 52,94; GSM8K 67,78; 4,58 GB | Apache 2.0 | Hugging Face (puretensor) |
| OLMoE-1B-7B-0125-Instruct (BF16) | 6.919.161.856 | no disponible | MMLU 53,48; GSM8K 67,85; 13,84 GB | Apache 2.0 | Hugging Face (allenai) |
| Versión totalmente cuantizada del mismo recipe (no publicada) | 6.919.161.856 | no disponible | MMLU 52,78; GSM8K 67,63 offline / 67,17 servido; 4,19 GB | Apache 2.0 | No publicada |
| Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly | no disponible | no disponible | no disponible | no disponible | Hugging Face (puretensor) |

## Limitaciones y advertencias

- Carga incorrecta sin error: cargar el checkpoint de la forma convencional en Transformers produce salidas erróneas sin lanzar ninguna excepción. Es obligatorio usar vLLM.
- Degradación medible en MMLU: la caída de 0,54 puntos es estadísticamente significativa (p = 0,025), aunque pequeña. En GSM8K la diferencia está dentro del ruido.
- Divergencia en la distribución de tokens: el 12,1 % de los tokens en WikiText-2 y el 7,3 % en chat no coinciden con el token top-1 del BF16, lo que puede afectar a tareas sensibles a la elección exacta de palabra.
- Idiomas: solo inglés documentado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado en la model card; el modelo base es un instructivo de 7B, por lo que el riesgo es comparable al de modelos de su tamaño.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara que es una release de prueba y no está afiliada ni respaldada por los autores del modelo original.
- Calibración con una sola semilla: no hay repeticiones que permitan estimar la varianza de los resultados de cuantización.
- Fecha de creación inusual (2026-11-21) y cero descargas: el checkpoint es muy reciente y no tiene validación independiente de la comunidad.
- Sin soporte documentado de tool calling, agentes ni contexto largo: no hay datos que confirmen estas capacidades en esta versión cuantizada.

## Enlaces

- Hugging Face: https://huggingface.co/puretensor/OLMoE-1B-7B-0125-Instruct-NVFP4A16-ExpertsOnly
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Modelo relacionado del mismo autor: https://huggingface.co/puretensor/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly
- Paper OLMoE (arXiv:2406.08155): https://arxiv.org/abs/2406.08155
- Paper GPTQ (arXiv:2310.16795): https://arxiv.org/abs/2310.16795
- Paper NVFP4 (arXiv:2505.03804): https://arxiv.org/abs/2505.03804
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
