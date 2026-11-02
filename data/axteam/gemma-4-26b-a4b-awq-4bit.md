# axteam/gemma-4-26B-A4B-AWQ-4bit

## Resumen

`axteam/gemma-4-26B-A4B-AWQ-4bit` es una cuantización de 4 bits del modelo `google/gemma-4-26B-A4B`, publicada por el equipo axteam. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: aplica cuantización post-entrenamiento (PTQ) con el método AWQ en esquema W4A16 para reducir el peso en disco desde el tamaño original en BF16 hasta aproximadamente 17,6 GB, manteniendo las activaciones en BF16. El objetivo es facilitar el despliegue en vLLM sobre GPUs con memoria limitada sin renunciar a la arquitectura original de Gemma 4.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 128 expertos más uno compartido, de los cuales 8 están activos por token, y con capacidades multimodales de entrada imagen-texto. El checkpoint cuenta con 25.805.936.206 parámetros totales según los safetensors del repositorio. La cuantización deja en BF16 el torreón de visión, la proyección visual, los embeddings (atados al lm_head), el router MoE, todas las normalizaciones y el MLP compartido; aproximadamente el 7% de los parámetros permanecen sin cuantizar.

Es relevante ahora porque permite servir un modelo MoE multimodal de ~26B parámetros en un único nodo de GPU consumer o profesional de gama alta, con una pérdida de calidad medida inferior al 1,5% de media en los benchmarks reportados. El repositorio está pensado exclusivamente para vLLM: no es cargable por Transformers y no incluye plantilla de chat, al tratarse de un modelo base (pre-entrenado) sin ajuste instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (8 activos / 128 totales + 1 compartido) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 8 expertos de 128 + 1 compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16 (asimétrica, group size 32, escala BF16 + zero-point INT4); pesos empaquetados en compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la calibración AWQ usó 256 muestras con predominio de coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors + compressed-tensors (no GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos: 128 expertos enrutados más un experto compartido, con 8 expertos activos por token. Incluye un torreón de visión y una proyección multimodal, lo que lo convierte en un modelo de entrada imagen-texto (pipeline `image-text-to-text`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esos datos pertenecen a la model card de `google/gemma-4-26B-A4B` y no se incluyen en la información proporcionada.

La innovación de este checkpoint es exclusivamente la cuantización. Se aplica AWQ (activation-aware weight quantization) como PTQ: un conjunto de calibración de 256 muestras identifica los canales de peso que multiplican las activaciones de mayor magnitud y los protege mediante escalado por canal antes del redondeo. No hay reentrenamiento ni gradientes. El resultado son pesos INT4 asimétricos con grupo de 32, escalas en BF16 y zero-points INT4, con activaciones BF16. Se mantienen en BF16 las partes sensibles a la cuantización (visión, embeddings, router, normas y MLP compartido), lo que supone cerca del 7% de los parámetros. El tokenizador, `processor_config` y `generation_config` son idénticos byte a byte a los del original.

## Capacidades

- Generación de texto por completación: el checkpoint es un modelo base sin plantilla de chat, por lo que debe usarse con prompts de texto plano y no en formato conversacional.
- Procesamiento multimodal imagen-texto: conserva el torreón de visión y la proyección en BF16, por lo que mantiene la capacidad de recibir imágenes junto con texto.
- Razonamiento y conocimiento general: los benchmarks MMLU, ARC-Challenge y Winogrande del checkpoint muestran un rendimiento cercano al BF16 original.
- Razonamiento matemático: evaluado en GSM8K con resultado de 69,98 (5-shot estricto).
- Capacidades multilingües: evaluado en KMMLU (coreano) y HAE-RAE, con recuperación superior al 98% respecto al BF16.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modelo base no incluye modo thinking en este checkpoint.
- Capacidades de audio: no disponibles.

## Casos de uso

- Servicio de completación de texto en producción con vLLM: el checkpoint está diseñado para vLLM ≥ 0.19.0 y permite servir un MoE de ~26B en una sola GPU o con tensor parallelism, reduciendo el coste por token frente al BF16.
- Procesamiento de documentos con imágenes: al conservar el torreón de visión en BF16, puede emplearse para tareas de image-text-to-text como extracción de información de capturas, formularios o gráficos, con el texto como contexto adicional.
- Evaluación comparativa de cuantizaciones: sirve como referencia AWQ-4bit frente a FP8, AWQ-8bit o NVFP4 en pipelines de evaluación con lm-evaluation-harness, útil para decidir el formato de despliegue.
- Investigación sobre degradación por cuantización: el repositorio publica métricas de perplejidad y benchmarks comparados con el BF16, lo que facilita estudiar el impacto de PTQ en modelos MoE multimodales.
- Despliegue en infraestructura con GPUs Turing o posteriores: al ser weight-only INT4, no requiere tensor cores especiales y puede ejecutarse en GPUs sm75 o superiores, ampliando el parque de hardware compatible.
- Prototipado de aplicaciones de razonamiento en coreano e inglés: los resultados en KMMLU, HAE-RAE y GSM8K permiten usar el modelo en tareas de comprensión y matemáticas en esos idiomas con una pérdida mínima frente al original.
- Generación de texto a gran escala con memoria ajustada: los 17,6 GB de pesos permiten ajustar el KV cache y el número de peticiones concurrentes en GPUs de 24-48 GB, algo inviable con el BF16 en el mismo hardware.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, modo greedy y completación few-shot sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 77,77 | 77,25 (99,3%) | 77,75 (100,0%) | 77,18 (99,2%) | 76,20 (98,0%) | 76,82 (98,8%) |
| GSM8K (5-shot, strict) | 70,89 | 71,34 (100,6%) | 71,49 (100,9%) | 69,98 (98,7%) | 67,17 (94,8%) | 69,98 (98,7%) |
| ARC-Challenge (0-shot) | 68,34 | 68,60 (100,4%) | 68,17 (99,8%) | 68,52 (100,2%) | 66,98 (98,0%) | 68,69 (100,5%) |
| Winogrande (5-shot) | 80,58 | 80,03 (99,3%) | 80,58 (100,0%) | 79,64 (98,8%) | 78,22 (97,1%) | 79,56 (98,7%) |
| KMMLU (5-shot, direct) | 60,03 | 60,07 (100,1%) | 60,15 (100,2%) | 59,41 (99,0%) | 58,14 (96,9%) | 58,99 (98,3%) |
| HAE-RAE (0-shot) | 77,27 | 76,99 (99,6%) | 76,90 (99,5%) | 77,18 (99,9%) | 75,44 (97,6%) | 75,80 (98,1%) |
| Media | 72,48 | 72,38 (99,9%) | 72,51 (100,0%) | 71,98 (99,3%) | 70,36 (97,1%) | 71,64 (98,8%) |

Además, se midió perplejidad frente al BF16 original en WikiText-2 (inglés) y una muestra de Wikipedia en coreano, con fragmentos de 2.048 tokens: las builds de 8 bits quedaron dentro del 0,5% del BF16, mientras que las de 4 bits (AWQ INT4 y NVFP4) fueron entre un 2,0% y un 6,6% superiores. No se midió la coincidencia top-1 de siguiente token para los modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,6 GB solo para los pesos; hay que añadir el KV cache (crece con la longitud de contexto y las peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Turing (sm75) o posteriores; no se soporta V100 (sm70). La selección de kernel la realiza vLLM 0.32 según la GPU.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB o más si se limita el contexto y la concurrencia; en 48 GB (RTX 6000 Ada, A6000) hay margen amplio para KV cache.
- Despliegue: exclusivamente vLLM (arquitectura incluida en vLLM ≥ 0.19.0). No es cargable por Transformers (comprobado hasta 5.22.1: no hay regla de conversión para checkpoints por experto). No hay soporte indicado para llama.cpp, Ollama ni TGI.
- Entorno: vLLM 0.32 requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible con CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-AWQ-4bit (este repo) | 25,8B totales (MoE 8/128+1) | no disponible | safetensors + compressed-tensors | Apache-2.0 | HuggingFace, solo vLLM |
| google/gemma-4-26B-A4B (BF16) | 25,8B totales (MoE 8/128+1) | no disponible | safetensors | Gemma 4 / Apache-2.0 | HuggingFace, Transformers y vLLM |
| Misma base en AWQ-8bit | 25,8B totales | no disponible | compressed-tensors | Apache-2.0 | Referenciado en la model card, sin URL |
| Misma base en NVFP4 / NVFP4A16 | 25,8B totales | no disponible | no disponible | Apache-2.0 | Referenciado en la model card, sin URL |

La comparación relevante es contra las otras cuantizaciones del mismo modelo base: AWQ-8bit iguala o supera ligeramente al BF16 en media (72,51 frente a 72,48), mientras que AWQ-4bit pierde 0,84 puntos de media (98,8% de recuperación) a cambio de reducir el peso a 17,6 GB. NVFP4 es la alternativa de 4 bits con mayor degradación (97,1% de recuperación). No se dispone de datos de modelos de otros fabricantes para comparar.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: usarlo con formato conversacional produce resultados deficientes; hay que emplear completación de texto plano.
- No es cargable con Transformers; depende de vLLM y de versiones concretas de torch, transformers y compressed-tensors, lo que añade fragilidad al entorno de producción.
- La cuantización introduce degradación medible: perplejidad entre un 2,0% y un 6,6% superior al BF16 y una caída media de 0,84 puntos en benchmarks; en KMMLU y HAE-RAE la recuperación baja al 98,3% y 98,1%.
- La calibración AWQ usó 256 muestras con predominio de coreano, lo que puede sesgar la preservación de calidad hacia ese idioma; no se dispone de evaluación en castellano.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para este checkpoint.
- Sesgos conocidos: no disponibles en la información proporcionada; deben heredarse los del modelo base.
- Restricciones de licencia: la model card declara Apache-2.0 pero enlaza a la licencia Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma 4 antes de desplegar en producción.
- No se soporta V100 (sm70); el hardware debe ser Turing o posterior y con driver compatible con CUDA 13.
- El checkpoint se guardó con compressed-tensors 0.19.0 y se lee con 0.17.0; no se debe actualizar esa dependencia por separado.
- No se han publicado datos de latencia, throughput ni longitud de contexto en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-26B-A4B-AWQ-4bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
