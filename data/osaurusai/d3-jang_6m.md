# OsaurusAI/d3-JANG_6M

## Resumen

OsaurusAI/d3-JANG_6M es un paquete cuantizado en formato MLX (JANG) del modelo vllm-sr/d3, el modelo fundacional de decisión multimodal de 27B (26,09B parámetros reales en safetensors) que utiliza vLLM Semantic Router en su versión Decision 3.0. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeo) junto con preguntas tipadas —elegir una opción entre varias, sí/no, o una puntuación en una escala ordenada— y devuelve, en un único forward pass, una probabilidad por opción sin generar texto. La cabeza de respuesta de 255 vías se conserva en FP32 bit a bit.

El problema que resuelve es el enrutamiento y la toma de decisiones dentro de pipelines de agentes: selección de herramientas entre listas de hasta 255 opciones, elección de ruta en un router semántico, verificación de pasos intermedios y clasificación zero-shot. El paquete reduce el modelo base de 52,2 GB en BF16 a 23,59 GB (7,23 bits por peso de media), manteniendo el 99,35 % de las mismas decisiones que el modelo de precisión completa sobre 2.000 peticiones del test de tasksource/tasksource-jev-typed-decisions y un KL medio de 0,0002.

Su relevancia es doble: por un lado, permite ejecutar un modelo de decisión de 26B en Apple Silicon con memoria unificada; por otro, publica una comparativa explícita frente a los paquetes cuantizados del proveedor (FP8, W4A16 GPTQ, W4A16 AWQ y NVFP4), con métricas de acuerdo y tamaño. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa bidireccional y atención lineal, torre de visión y cabeza de decisión de 255 vías; el modelo base se describe como multimodal (texto, imagen y vídeo) |
| Parámetros totales | 26.085.330.160 (≈26,09 B; la model card del base lo denomina "27B") |
| Parámetros activos | No disponible (la información no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | JANG 6M: MLP (gate/up/down) affine 6 bits; atención, atención lineal, embeddings y torre de visión affine 8 bits; cabeza de respuesta (`decision/readout.safetensors`) en FP32 original; entradas de la puerta de atención lineal en BF16. Media de 7,23 bits por peso. Variantes hermanas: d3-JANG_4M y d3-JANGH2 |
| Idiomas soportados | en; etiqueta "multilingual" (sin listado detallado de idiomas) |
| Licencia | Apache-2.0 (se conservan `NOTICE` y `LICENSE` del modelo base) |
| Formato de pesos | safetensors en shards, formato MLX (librería `mlx`); 23,59 GB de shards |
| Pipeline declarado | zero-shot-classification |
| Salida | Vector de probabilidades por opción en un solo forward pass; no genera texto |
| Runtime necesario | Osaurus 0.25.26 o superior |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3 (construido, según la model card, sobre Qwen/Qwen3.8-27B) es un transformer multimodal que combina capas de atención completa con atención lineal, incorpora una torre de visión para imágenes y fotogramas de vídeo y sustituye la cabeza de lenguaje por una cabeza de decisión de 255 vías. Cada pregunta se responde con una distribución de probabilidad sobre las opciones en un único forward pass bidireccional; no hay decodificación autorregresiva ni generación de tokens. Esta cuantización no modifica la cabeza de respuesta (se mantiene el tensor FP32 original byte a byte) ni las entradas de la puerta de atención lineal (BF16).

El proceso de cuantización es relevante técnicamente: la calibración ejecutó el propio forward de decisión de d3 (atención completa bidireccional, formato de prompt de decisión, imágenes y vídeos) sobre 2.778 prompts de decisión y 1,81 millones de tokens, cubriendo preguntas de enrutamiento sobre peticiones reales, selección de herramientas con listas de hasta 255 opciones, trazas de agentes y terminal, código, seguridad, documentos largos, decisiones tipadas, imágenes y vídeos de pantalla. Las escalas activation-aware (AWQ) se pliegan en las normas y proyecciones productoras, y cada MLP cuantizado se redondea con GPTQ usando hessianos de ese forward, manteniendo el módulo cuantizado solo cuando supera al redondeo simple. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento del base, ni si hubo RLHF/DPO.

## Capacidades

- Clasificación zero-shot con un conjunto arbitrario de etiquetas: devuelve probabilidad por opción, no texto.
- Decisiones tipadas: elección única entre varias opciones, respuesta binaria sí/no (con umbral 0,5) y puntuación en escala ordenada.
- Selección de herramientas y funciones en listas grandes, hasta 255 opciones en una sola cabeza de decisión.
- Enrutamiento de peticiones en routers semánticos y pipelines de agentes.
- Comprensión de imágenes y vídeo (torre de visión; calibración con imágenes y vídeos de pantalla), incluyendo entradas de estado en JSON.
- Procesamiento de documentos largos y trazas de agente/terminal durante la calibración (la longitud de contexto no está documentada).
- Respuesta calibrada: la salida es una distribución de probabilidad, apta para umbrales y agregación posterior.
- Capacidad multilingüe declarada, con etiqueta `multilingual` sin detalle de cobertura.
- No soporta generación de texto, tool calling en formato de texto ni razonamiento multi-paso explícito: cada decisión es un forward pass independiente.

## Casos de uso

- Enrutamiento semántico de peticiones: dado un prompt de usuario y un conjunto de rutas o modelos candidatos, el modelo devuelve la probabilidad de cada ruta en un solo forward pass, lo que permite sustituir clasificadores ligeros por un 26B con salida calibrada y umbrales ajustables.
- Selección de herramientas en agentes: con listas de hasta 255 herramientas, responde qué herramienta corresponde a cada estado del agente sin consumir tokens de generación, lo que reduce la latencia frente a un LLM generativo que debe emitir el nombre de la función.
- Verificación de pasos en pipelines multi-paso: formular preguntas binarias ("¿el resultado cumple el objetivo?") sobre el estado del agente permite implementar guardas y reintentos con una probabilidad explícita en lugar de parsear texto libre.
- Clasificación de contenido y seguridad: puntuar textos o capturas en escalas ordenadas de riesgo, toxicidad o cumplimiento, aprovechando la calibración del KL bajo del paquete (0,0003 en la suite pública) para mantener las mismas decisiones que el modelo en BF16.
- Triaje de documentos y soporte: clasificar tickets o documentos largos en categorías predefinidas y devolver la confianza por categoría, lo que permite derivar a revisión humana los casos con probabilidad intermedia.
- Automatización de interfaz sobre vídeo de pantalla: al haber sido calibrado con vídeos de pantalla, puede decidir la siguiente acción o el estado de la UI a partir de fotogramas, integrándose en un bucle de automatización.
- Evaluación A/B y comparación de modelos: usar la salida probabilística como señal continua para comparar prompts o configuraciones sin depender de la varianza de la generación de texto.

## Benchmarks y rendimiento

Acuerdo con el modelo de precisión completa (BF16) por pregunta. "Decisions" cuenta la misma opción top (o el mismo lado de 0,5 en sí/no); KL se mide sobre las probabilidades de las opciones de cada pregunta. Según el autor, ninguna de estas preguntas se usó para calibración.

| Conjunto de test | Preguntas | Decisions | KL medio ↓ | Exactitud vs. gold, BF16 → este paquete |
|---|---|---|---|---|
| Decision Index 0.3 public suite (41 benchmarks) | 1.610 | 99,38 % | 0,0003 | 78,9 → 78,8 % |
| LocalLLaMA/typed-decisions test (gold suave) | 800 | 99,50 % | 0,0001 | 73,4 → 73,1 % |
| Decisiones held-out sobre textos, imágenes y vídeos propios | 487 | 98,77 % | 0,0016 | — |
| tasksource/tasksource-jev-typed-decisions test | 2.000 | 99,35 % | 0,0002 | 84,2 → 84,0 % |

Comparativa de los tres paquetes JANG del autor:

| Paquete | Tamaño | Decisions (tsj, 2.000) | Decisions (suite) | KL medio (suite) |
|---|---|---|---|---|
| d3-JANG_6M | 23,6 GB | 99,35 % | 99,38 % | 0,0003 |
| d3-JANG_4M | 19,3 GB | 98,45 % | 98,07 % | 0,0024 |
| d3-JANGH2 | 14,5 GB | 93,45 % | 93,17 % | 0,0345 |

Paquetes cuantizados del proveedor (formatos NVIDIA/AMD), según los datos que el propio proveedor reporta sobre las 14.031 peticiones de test del mismo dataset, con su mapeo de peticiones y su hardware:

| Paquete del proveedor | Decisions | Memoria |
|---|---|---|
| FP8 | 99,08 % | 31,9 GB |
| W4A16 GPTQ (group 128) | 97,98 % | 16,4 GB |
| W4A16 AWQ (group 128) | 97,76 % | 16,5 GB |
| NVFP4 | 96,64 % | 17,2 GB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos en la información disponible, coherente con que el modelo no genera texto.

## Requisitos de hardware

- Pesos: 23,59 GB en shards (7,23 bits por peso). El modelo base en BF16 ocuparía 52,2 GB.
- Memoria unificada estimada para inferencia: al menos 32 GB en Apple Silicon para acomodar pesos y estados de activación; 48-64 GB recomendable para lotes mayores, entradas de vídeo o documentos largos (la cifra exacta de overhead no está disponible).
- Hardware soportado: Apple Silicon exclusivamente, al ser un paquete MLX. No hay soporte documentado para CUDA, ROCm ni CPU x86.
- GPU consumer: no aplica en el sentido habitual (RTX 4090, etc.); el equivalente es un Mac con memoria unificada de 32 GB o más (familias M1/M2/M3/M4 Pro, Max y Ultra).
- Despliegue: runtime Osaurus 0.25.26 o superior, que carga el bundle JANG. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta información (los paquetes del proveedor en FP8/AWQ/GPTQ/NVFP4 sí apuntan a esos ecosistemas).
- Latencia y throughput: no disponibles. La arquitectura de un solo forward pass sin generación implica un coste muy inferior al de un LLM generativo del mismo tamaño, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / memoria | Decisions (tsj) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-JANG_6M (este) | 26,09 B | No disponible | MLX JANG, 23,6 GB | 99,35 % | Apache-2.0 | HuggingFace, runtime Osaurus |
| d3-JANG_4M | 26,09 B | No disponible | MLX JANG, 19,3 GB | 98,45 % | Apache-2.0 | HuggingFace |
| d3-JANGH2 | 26,09 B | No disponible | MLX JANG, 14,5 GB | 93,45 % | Apache-2.0 | HuggingFace |
| vllm-sr/d3 FP8 (proveedor) | 26,09 B | No disponible | FP8, 31,9 GB | 99,08 % | Apache-2.0 | Formato NVIDIA/AMD |
| vllm-sr/d3 W4A16 GPTQ (proveedor) | 26,09 B | No disponible | GPTQ group 128, 16,4 GB | 97,98 % | Apache-2.0 | Formato NVIDIA/AMD |
| vllm-sr/d3 NVFP4 (proveedor) | 26,09 B | No disponible | NVFP4, 17,2 GB | 96,64 % | Apache-2.0 | Formato NVIDIA/AMD |

No se dispone de datos para comparar con clasificadores de decisión de otras familias ni con modelos de enrutamiento alternativos, por lo que la comparativa se limita a las variantes del mismo modelo base publicadas por el autor y por el proveedor.

## Limitaciones y advertencias

- No genera texto: solo devuelve probabilidades sobre opciones predefinidas. No sirve para respuestas abiertas, resúmenes ni diálogo.
- Dependencia de runtime: requiere Osaurus 0.25.26 o superior y el stack MLX; no hay ruta de despliegue documentada en servidores CUDA, lo que limita su uso en producción sobre infraestructura convencional.
- Cabecera de 255 vías: las decisiones con más de 255 opciones requieren particionado externo.
- Cuantización de 6 bits en las MLP: aunque el acuerdo global es del 99,35 %, el KL no es nulo (0,0003 en la suite, 0,0016 en el conjunto held-out propio); para aplicaciones que dependan de la probabilidad exacta y no solo del argmax conviene validar con datos propios.
- Posible solapamiento de evaluación: el split tasksource-jev-typed-decisions es el mismo que el proveedor usó para puntuar sus paquetes cuantizados; aunque el autor declara que no se usó para calibración, es un conjunto con exposición pública previa en la comparativa del ecosistema.
- Longitud de contexto no documentada: se desconoce el límite real para documentos largos o secuencias de vídeo, pese a que la calibración incluyó documentos largos.
- Idiomas: cobertura detallada no disponible; la etiqueta `multilingual` no especifica calidad por idioma y la calibración se describe sobre datos mayoritariamente en inglés.
- Sesgos y alucinación: al no generar texto, el riesgo de alucinación textual es nulo, pero persiste el riesgo de clasificación errónea y de heredar los sesgos del modelo base vllm-sr/d3 y de Qwen3.8-27B, sobre los que esta información no aporta análisis.
- Licencia: Apache-2.0 permite uso comercial, pero se deben conservar `NOTICE` y `LICENSE` del modelo base; conviene revisar las condiciones del modelo original vllm-sr/d3 y de Qwen3.8-27B.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicado el 23 de octubre de 2026; sin validación independiente de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/d3-JANG_6M
- Modelo base vllm-sr/d3: https://huggingface.co/vllm-sr/d3
- Modelo sobre el que se construye el base, según la model card (Qwen/Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime Osaurus: https://osaurus.ai
- Dataset de evaluación tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de evaluación LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Contacto del cuantizador: eric@osaurus.ai
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
