# Shameless111/Loopy-Huginn-0125-W4A8-G32

## Resumen

Loopy-Huginn-0125-W4A8-G32 es un checkpoint cuantizado derivado del modelo recurrente Huginn-0125 desarrollado por el grupo tomg-group-umd (Universidad de Maryland). Se trata de una variante de precisión reducida que aplica cuantización de pesos a 4 bits (W4) y activaciones a 8 bits (A8) con grupos de tamaño 32, manteniendo la arquitectura de lenguaje recurrente del modelo original con una profundidad recurrente de T=32. El autor del checkpoint es el usuario Shameless111 y se distribuye bajo licencia Apache-2.0.

El modelo resuelve el problema de reducir el coste computacional y de memoria de un modelo recurrente de gran tamaño, permitiendo su despliegue en hardware más modesto sin reentrenar desde cero. La cuantización se realiza mediante una búsqueda sobre un pool de 80 candidatos, seleccionando la configuración `s17_p11_b32` (semilla de rotación 17, potencia de escalado 1,1, tamaño de bloque Hadamard 32). El resultado es un checkpoint de 5,2 GB con métricas de evaluación guardadas que incluyen perplejidad en WikiText-2 y LAMBADA, además de precisión en WinoGrande, ARC-C, HellaSwag y MMLU.

Es relevante ahora porque los modelos recurrentes con profundidad variable (como Huginn) ofrecen una alternativa a los transformers estándar para razonamiento iterativo, y esta release demuestra que es posible cuantizarlos agresivamente manteniendo un rendimiento razonable. Sin embargo, el checkpoint requiere un loader personalizado (no funciona con `from_pretrained()` genérico de Transformers), lo que limita su adopción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje recurrente (recurrent-language-model) con profundidad recurrente T=32 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluación WT2 con ventana de documento) |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits dinámicas por token), grupo de pesos 32, bloque Hadamard 32 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `selected.pt` (state dict de PyTorch); códigos W4 almacenados en contenedores INT8 con escalas, zero points, input scaling y signos Hadamard; sin empaquetado INT4 |
| Modelo base | tomg-group-umd/huginn-0125 (revisión `bb6621b65e90b6a4b9b29ef88dc83866d450470c`) |
| Tamaño del repositorio | 5,2 GB |
| Candidato seleccionado | `s17_p11_b32` (pool de 80 candidatos) |
| Semilla de rotación | 17 |
| Potencia de escalado | 1,1 |

## Arquitectura y entrenamiento

El modelo base Huginn-0125 es un modelo de lenguaje recurrente que aplica un bloque transformer de forma iterativa sobre el estado latente, con una profundidad recurrente de T=32. Esta arquitectura permite un razonamiento iterativo sin incrementar el número de parámetros por paso, a diferencia de los transformers densos convencionales. El checkpoint Loopy no reentrena el modelo, sino que aplica una cuantización post-entrenamiento con búsqueda sobre un pool de 80 configuraciones candidatas, evaluando cada una con ventanas fijas de WikiText-103 (revisión `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`). La calibración, la búsqueda y la evaluación de calidad usan grupos separados de 32 ventanas para evitar fugas de información.

La innovación técnica principal es el uso de rotaciones Hadamard con bloques de tamaño 32 y una potencia de escalado de 1,1 para reducir el error de cuantización en pesos y activaciones. Las activaciones se cuantizan dinámicamente por token a 8 bits (A8), mientras que los pesos se almacenan como códigos W4 en contenedores INT8 con escalas y zero points por grupo de 32. La evaluación se realiza con cuantización falsa (fake quantization) en BF16, y el release no incluye un kernel de inferencia INT4 empaquetado. Los tensores no cuantizados conservan sus tipos de coma flotante originales. No se especifican en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de texto en inglés: el modelo está entrenado y evaluado únicamente en inglés, con perplejidad de 13,68 en WikiText-2 y 7,98 en LAMBADA.
- Razonamiento iterativo: la profundidad recurrente T=32 permite múltiples pasos de cómputo sobre el mismo estado latente, adecuado para tareas que requieren razonamiento multi-paso.
- Comprensión lectora y sentido común: evaluado en WinoGrande (61,17%), ARC-C (36,69%) y HellaSwag (64,71%).
- Conocimiento general: evaluado en MMLU con 29,67% de precisión, lo que indica un conocimiento factual limitado en comparación con modelos densos de mayor tamaño.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades de agente, visión, audio ni modo de pensamiento explícito en la información proporcionada.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Investigación en cuantización de modelos recurrentes: el checkpoint sirve como referencia reproducible para estudiar el impacto de W4A8 en arquitecturas recurrentes, con protocolo de búsqueda documentado y métricas guardadas en `reference_results/`.
- Evaluación comparativa de precisión reducida: permite comparar el rendimiento de W4A8 frente a BF16 en tareas como LAMBADA, WinoGrande, ARC-C, HellaSwag y MMLU usando el script `eval_tasks.py` incluido.
- Despliegue en hardware con VRAM limitada: con 5,2 GB de pesos, el checkpoint puede cargarse en GPUs de consumo medio (por ejemplo, RTX 3060 de 12 GB o RTX 4070 de 12 GB) para experimentación, siempre que se use el loader personalizado.
- Reproducción de experimentos académicos: el repositorio incluye `manifest.json` con tamaños y hashes SHA-256, `provenance.json` con el mapeo de metadatos y `artifacts/` con registros completos de búsqueda, lo que facilita la replicación.
- Generación de texto en inglés con contexto medio: con 4096 tokens de contexto, puede usarse para tareas de continuación de documento o resumen extractivo en inglés, aunque con calidad limitada por el MMLU bajo.
- Estudio de robustez de cuantización: la separación entre selecciones W4A4 y W4A8 permite analizar cómo afecta la precisión de activaciones al rendimiento final, usando el mismo pool de candidatos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---:|
| WT2 word PPL (contexto 4096, rolling) | 13,68 |
| LAMBADA PPL | 7,98 |
| LAMBADA accuracy | 53,81% |
| WinoGrande | 61,17% |
| ARC-C (acc_norm) | 36,69% |
| HellaSwag (acc_norm) | 64,71% |
| MMLU | 29,67% |
| Media de precisión (5 tareas) | 49,21% |

La media pondera igualmente las cinco tareas de precisión. Los resultados corresponden a las métricas guardadas del experimento que produjo este checkpoint, con cuantización falsa en BF16. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 5,2 GB solo para los pesos; hay que añadir memoria para activaciones, caché de contexto (4096 tokens) y overhead del loader. Se estima un mínimo práctico de 8-10 GB de VRAM.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060 12 GB, RTX 4070 12 GB o RTX 4080 16 GB; para producción se requeriría validación con el loader personalizado.
- Cabe en GPU de consumo: probablemente sí, en modelos con 12 GB o más de VRAM, aunque no está confirmado por el autor.
- Opciones de despliegue: el repositorio incluye un loader personalizado Loopy (`code/` con `environment.yml` y scripts de evaluación). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; de hecho, se advierte explícitamente de que no debe usarse `from_pretrained()` genérico de Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Loopy-Huginn-0125-W4A8-G32 | no disponible | 4096 | Apache-2.0 | `selected.pt` (custom loader) | Cuantizado W4A8, media acc. 49,21% |
| tomg-group-umd/huginn-0125 (base) | no disponible | no disponible | Apache-2.0 | safetensors (presumiblemente) | Modelo original en BF16, sin cuantizar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se han publicado en la información disponible comparaciones directas con otros modelos recurrentes cuantizados ni con transformers de tamaño similar.

## Limitaciones y advertencias

- Requiere un loader personalizado: no funciona con `from_pretrained()` genérico de Transformers; hay que usar el código incluido en `code/` y descargar artefactos con `download_hf_artifacts.py`.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de capacidades multilingües.
- Rendimiento limitado en conocimiento factual: MMLU de 29,67% indica un conocimiento general bajo, inadecuado para tareas que requieran precisión factual alta.
- Riesgo de alucinación: no se documenta en la información disponible, pero es esperable en modelos de este tamaño y con cuantización agresiva; se recomienda validación en producción.
- Sin kernel INT4 empaquetado: los pesos W4 se almacenan en contenedores INT8, lo que incrementa el uso de memoria frente a un empaquetado INT4 real; la evaluación usa cuantización falsa en BF16, no inferencia INT4 nativa.
- Selección W4A8 separada de W4A4: la precisión de activaciones no determina el dtype de almacenamiento; no se debe asumir que el checkpoint es compatible con kernels W4A4.
- Licencia: Apache-2.0 para los pesos, pero el código de investigación y las dependencias se rigen por `code/THIRD_PARTY_NOTICES.md`; revisar antes de uso comercial.
- Sesgos: no documentados en la información disponible; el modelo base puede heredar sesgos de sus datos de entrenamiento, no especificados.
- Sin datos de latencia ni throughput: no se puede garantizar viabilidad en producción sin pruebas adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/Shameless111/Loopy-Huginn-0125-W4A8-G32
- Modelo base: https://huggingface.co/tomg-group-umd/huginn-0125
- Dataset WikiText-103 (Salesforce): https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio de código incluido en el release: `code/` dentro del repositorio de Hugging Face (con `environment.yml`, `README.md`, `docs/protocol.md` y `THIRD_PARTY_NOTICES.md`)
- No se han encontrado en la información proporcionada papers, blogs, repositorios externos ni demos adicionales.
