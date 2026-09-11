# Jeesup/svd-safety-l31_keep50_gap_b010

## Resumen

svd-safety-l31_keep50_gap_b010 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct comprimido mediante SVD-LLM y publicado por el usuario Jeesup en HuggingFace. La compresión elimina el 49,03 % de los parámetros densos, dejando un 51,0 % de parámetros efectivos, y después restaura un 1,0 % adicional de componentes SVD (8.570 componentes) siguiendo la regla de selección denominada `gap`. El resultado es un modelo de 8.030.261.248 parámetros declarados en safetensors, con un repositorio de 16,1 GB.

No se trata de un modelo de propósito general ni de un asistente desplegable: la propia model card lo describe como un artefacto de investigación dentro de una rejilla experimental sobre reglas de selección y presupuestos de restauración. El objetivo del estudio es medir cómo la compresión SVD degrada el comportamiento de seguridad del modelo original y qué regla de selección de componentes lo repara mejor. Se publica, por tanto, como sujeto experimental y no como producto.

Su relevancia actual es metodológica: cuantifica el compromiso entre compresión y seguridad, un eje poco cubierto en la literatura de cuantización y poda, y proporciona métricas explícitas de tasa de éxito de ataque (ASR) y de sobrerrechazo junto a la perplejidad. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que confirma su carácter de artefacto de investigación con adopción nula.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con componentes SVD podados y parcialmente restaurados |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Llama 3.1 8B Instruct |
| Tipos de cuantizacion | No disponible (no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible (la model card no los declara) |
| Licencia | Llama 3.1 Community License (etiqueta `llama3.1`) |
| Formato de pesos | Safetensors (biblioteca `transformers`) |

Datos de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base sin comprimir | meta-llama/Llama-3.1-8B-Instruct |
| Compresión | SVD-LLM, 49,03 % de parámetros eliminados |
| Regla de selección | `gap` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados | 8.570 |
| Componentes sustituidos | 0 |
| Fracción de parámetros resultante | 0,5097 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Sobre esa base se aplica SVD-LLM, un método de compresión que descompone en valores singulares las matrices de pesos y trunca los componentes de menor magnitud. En este checkpoint el truncamiento elimina el 49,03 % de los parámetros, y a continuación se restauran 8.570 componentes SVD seleccionados con la regla `gap` bajo un presupuesto del 1,0 % de los parámetros densos, sin sustituir ningún componente previamente conservado. La fracción de parámetros efectiva final es 0,5097.

No se documenta ningún entrenamiento adicional, ajuste fino ni etapa de RLHF o DPO posterior a la compresión: es una transformación puramente post-hoc de los pesos del modelo base. Tampoco se detallan los datos de calibración empleados para el truncamiento SVD, ni el número de tokens utilizados. La semilla declarada es 42, lo que sugiere un pipeline reproducible dentro de la rejilla experimental, pero el autor no publica los scripts ni el resto de celdas de la rejilla en la información disponible.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de chat del modelo base, aunque con degradación medible de calidad (perplejidad de 83,0885 en WikiText-2).
- Razonamiento e instrucciones: no se documentan evaluaciones específicas de razonamiento, matemáticas o código para este checkpoint.
- Soporte de tool calling / function calling: no documentado; se heredaría del modelo base, pero no hay verificación publicada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas en la model card.
- Capacidad especial: el propio modelo es un sujeto de estudio de seguridad. Las métricas publicadas son de tasa de éxito de ataque (AdvBench ASR 0,3423 y StrongREJECT ASR 0,3131 según el juez HarmBench) y de sobrerrechazo macro sobre WildGuard (0,1548).
- Decodificación especulativa, atención lineal u otras optimizaciones de inferencia: no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de referencia para medir cómo varía la seguridad al aplicar SVD-LLM con la regla `gap` y un presupuesto de restauración del 1,0 %, comparando con las demás celdas de la rejilla y con el modelo base.
- Evaluación de seguridad reproducible: el repositorio publica valores de ASR con juez HarmBench y de sobrerrechazo con WildGuard, lo que permite reproducir el protocolo y contrastar pipelines de evaluación de seguridad en modelos comprimidos.
- Estudio del compromiso compresión-seguridad: analizar la relación entre la fracción de parámetros conservada (0,5097), la perplejidad en WikiText-2 (83,0885) y el ASR resultante, para derivar umbrales de compresión aceptables.
- Análisis de interpretabilidad de componentes SVD: los 8.570 componentes restaurados por la regla `gap` pueden inspeccionarse para identificar qué subespacios de pesos sostienen comportamientos de rechazo.
- Benchmarking de pipelines de inferencia: al ser un checkpoint de 8B en safetensors, sirve para medir latencia y throughput de vLLM o TGI sobre un modelo con matrices de rango reducido.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo la poda por SVD afecta al alineamiento de seguridad de un modelo instruido, usando métricas públicas y verificables.
- Pruebas de robustez de clasificadores de seguridad: emplear las salidas del modelo como entradas adversarias para evaluar guardarraíles externos, dado su ASR elevado.

## Benchmarks y rendimiento

| Benchmark | svd-safety-l31_keep50_gap_b010 | Llama-3.1-8B-Instruct (referencia) |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,3423 | No disponible en la información proporcionada |
| StrongREJECT ASR (juez HarmBench) | 0,3131 | No disponible en la información proporcionada |
| Sobrerrechazo macro (WildGuard) | 0,1548 | No disponible en la información proporcionada |
| Perplejidad WikiText-2 | 83,0885 | No disponible en la información proporcionada |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de capacidad general para este checkpoint. En las métricas de seguridad, un valor de ASR más bajo es mejor; en sobrerrechazo, también es mejor un valor más bajo.

## Requisitos de hardware

- VRAM estimada con pesos en bf16/fp16: aproximadamente 16,1 GB solo para pesos, con unos 18 GB de pico considerando el overhead de activaciones y caché; la model card no publica requisitos oficiales.
- VRAM estimada con cuantización de 8 bits: en torno a 9 GB. Con cuantización de 4 bits: en torno a 5-6 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- Caché KV: al heredar la configuración de Llama 3.1 8B (GQA con 8 cabezas KV y dimensión de cabeza 128 en 32 capas), el coste ronda 0,125 MB por token en bf16, lo que supone del orden de 16 GB adicionales para agotar una ventana de 128 000 tokens. Con ventanas de 8 000 a 16 000 tokens el coste cae a 1-2 GB.
- GPU recomendadas: A100 40 GB y H100 para servicio concurrente con contexto largo; RTX 4090 o RTX 3090 (24 GB) para una instancia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en bf16 y en tarjetas de 8-12 GB aplicando cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM y servidores compatibles con endpoints. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| svd-safety-l31_keep50_gap_b010 | 8,03 B (fracción efectiva 0,5097) | No especificado | Llama 3.1 Community License | Artefacto de investigación, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 000 tokens según el modelo base | Llama 3.1 Community License | Modelo publicado y ampliamente desplegado |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | Llama 3.1 Community License | No referenciadas en la información disponible |
| Otros checkpoints comprimidos de Llama 3.1 8B | No disponible | No disponible | Variable | No se dispone de comparativas verificables |

La comparación de rendimiento frente a alternativas no puede establecerse: la información proporcionada no incluye métricas del modelo base sin comprimir ni de otros modelos comprimidos, por lo que no es posible calcular la pérdida relativa de capacidad o de seguridad atribuible a la compresión.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3.1-8B-Instruct, y que la compresión por sí sola eleva la tasa de éxito de ataque.
- El ASR medido es 0,3423 en AdvBench y 0,3131 en StrongREJECT, cifras que reflejan una resistencia al abuso notablemente inferior a la esperable en un modelo alineado.
- La perplejidad de 83,0885 en WikiText-2 indica una degradación severa del modelado de lenguaje; no es un modelo apto para generación de texto de calidad en producción.
- El sobrerrechazo macro de 0,1548 implica que aproximadamente una de cada seis consultas benignas puede ser rechazada en el conjunto evaluado.
- No hay datos publicados de sesgos, composición de datos de calibración ni cobertura idiomática, por lo que no puede auditarse el comportamiento fuera del inglés.
- Uso comercial: la Llama 3.1 Community License permite uso comercial bajo sus condiciones, incluida la cláusula de atribución ("Built with Llama") y el umbral de 700 millones de usuarios mensuales. El repositorio incluye `LICENSE` y `USE_POLICY.md`, y ambos son vinculantes para este derivado.
- No debe desplegarse como asistente orientado a usuarios finales: la propia model card lo define como sujeto experimental y recomienda evaluarlo antes de extraer conclusiones.
- Al ser un derivado, hereda las limitaciones de Llama 3.1 8B Instruct en cuanto a alucinación, conocimiento desactualizado y razonamiento limitado, presumiblemente agravadas por la compresión.
- No se publican scripts de compresión, configuración de calibración ni el resto de celdas de la rejilla, lo que limita la reproducibilidad completa del estudio.
- Las fechas de creación y actualización del repositorio (2026-09-11) resultan anómalas respecto a la fecha de consulta; conviene verificarlas antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_keep50_gap_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Método de compresión SVD-LLM (paper de referencia del método citado en la model card): https://arxiv.org/abs/2403.07378
- Conjuntos de evaluación mencionados en las métricas: AdvBench, StrongREJECT, HarmBench y WildGuard (no se aportan enlaces específicos en la información disponible).
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a portales de juegos en línea sin relación con el contenido.
