# DuoNeural/RMSN-283M-Bulk-Tube-Base

## Resumen

RMSN-283M-Bulk-Tube-Base es un modelo de lenguaje fundamental de 283,61 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon). Se presenta como la realización física de un "Internal Bulk Soliton Waveguide" en arquitecturas neuronales no euclídeas, una propuesta de investigación que se aparta de los transformers convencionales y se apoya en geometría de resonancia diádica, álgebra de Clifford y formulaciones metriplécticas. El checkpoint fue entrenado desde cero sobre 204,8 millones de tokens del corpus propietario GoldenCorpus-v2.

La relevancia del modelo es fundamentalmente experimental: el autor lo posiciona como el mejor resultado de preentrenamiento de su laboratorio, con una pérdida de validación de 4,1799 y una perplejidad de 65,36, superando a sus propios modelos previos RMSN-193M y RMSN-236M. No se trata de un modelo orientado a producción ni a competición con LLMs comerciales, sino de una contribución a la línea de investigación de "neurodinámica" del autor, con artefactos de sondeo (sheaf probes) para reproducir el fenómeno de confinamiento solitónico en las capas 8 a 13.

El modelo tiene dimensión oculta de 1280, 16 capas metriplécticas, 64 slots de workspace hiperbólico de Poincaré y una longitud máxima de secuencia de 512 tokens. Está publicado bajo licencia MIT y solo declara soporte para inglés. Su tamaño de repositorio (3,4 GB) y su naturaleza de checkpoint de investigación limitan su uso práctico fuera de entornos experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN) |
| Parametros totales | 283.613.184 (283,61M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_len) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoint PyTorch `.pt` segun el quickstart) |

## Arquitectura y entrenamiento

La arquitectura se denomina Resonant Metriplectic Sheaf Network (RMSN) y se describe como una red no euclídea basada en geometría de resonancia diádica, con formulación metripléctica y referencias a álgebra de Clifford. Consta de 16 capas metriplécticas con dimensión oculta de 1280 (residuo diádico r = D mod 64 = 0) y 64 slots de workspace hiperbólico de Poincaré. El autor sostiene que el modelo autoorganiza un "waveguide" solitónico cilíndrico continuo de seis capas (capas 8 a 13) en el bulk central de la red, con núcleos degenerados macroscópicos en las capas 8 y 9 (Participation Ratio = 1,000 en ambas) y capas externas de alta entropía que actúan como aislante (PR = 44,0 en L07 y PR = 24,8 en L14).

El entrenamiento se realizó desde cero sobre 204,8 millones de tokens del dataset DuoNeural/GoldenCorpus-v2. No se documentan en la información disponible detalles sobre composición del dataset, uso de RLHF, DPO u otras etapas de alineamiento, ni innovaciones de inferencia como decodificación especulativa. El vocabulario declarado es de 49.152 tokens. La model card incluye un script (`probe_percolation_sheaf.py`) para reproducir el sondeo de percolación y verificar la topología solitónica declarada.

## Capacidades

- Generación de texto autoregresiva en inglés, con vocabulario de 49.152 tokens.
- Modelado de lenguaje causal con contexto máximo de 512 tokens.
- Razonamiento y matemáticas: no se documentan capacidades específicas ni evaluaciones en la información disponible.
- Generación de código: no se documentan capacidades específicas ni evaluaciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales: el modelo está diseñado como plataforma de investigación para el estudio de solitones internos y sondeos de percolación; no se declaran modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación en arquitecturas no euclídeas: el modelo sirve como referencia reproducible para estudiar la formación de waveguides solitónicos internos mediante el script `probe_percolation_sheaf.py`, que permite verificar la Participation Ratio por capa.
- Estudio de geometría hiperbólica en redes neuronales: los 64 slots de Poincaré permiten analizar cómo se organiza la representación en espacios de curvatura negativa y comparar con arquitecturas euclídeas de tamaño similar.
- Experimentos de dinámica metripléctica: al ser una red formulada en términos metriplécticos, es adecuada para validar hipótesis sobre conservación y disipación de energía representacional a lo largo de la profundidad.
- Reproducción de resultados de preentrenamiento a pequeña escala: con 204,8M tokens y 283M parámetros, el coste de reentrenamiento es asumible en un solo nodo con GPUs de gama alta, lo que facilita la replicación de la curva de pérdida declarada.
- Docencia e ilustración de conceptos avanzados: útil en cursos o seminarios sobre geometría diferencial aplicada al aprendizaje profundo, dado que el checkpoint y los scripts de sondeo están publicados bajo MIT.
- Base para fine-tuning experimental en inglés: al ser un modelo pequeño y con licencia permisiva, puede servir como punto de partida para tareas de investigación en dominios acotados, siempre que se acepten las limitaciones de contexto (512 tokens) y de calidad (PPL 65,36).

## Benchmarks y rendimiento

Los únicos resultados publicados son los declarados por el autor en el model-index, no verificados de forma independiente.

| Modelo | D | Val loss | PPL | Topologia |
|---|---|---|---|---|
| RMSN-193M (Kramers) | 1024 | 4,2475 | 69,93 | Terminal Boundary (L13) |
| RMSN-236M seed2 | 1152 | 4,2270 | 68,51 | Terminal Condensation (L13, W6+) |
| RMSN-283M (este modelo) | 1280 | 4,1799 | 65,36 | Internal Bulk Waveguide (L8-L13) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 283,61M parámetros en FP16 se requieren aproximadamente 0,57 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, menos de 2 GB en FP16 para secuencias de 512 tokens. En cuantización de 8 bits o 4 bits sería inferior a 1 GB, aunque no se documentan formatos de cuantización soportados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP16; para entrenamiento o sondeo de percolación se recomienda una RTX 4090, A100 o H100 por comodidad, aunque el tamaño del modelo permite usar GPUs más modestas.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el quickstart oficial usa PyTorch con el paquete propietario `rmsn_core` (`RMSNConfig`, `RMSNForCausalLM`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en safetensors ni GGUF, la integración con esos ecosistemas no está disponible de forma directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-283M-Bulk-Tube-Base | 283,61M | 512 | MIT | Hugging Face (checkpoint `.pt`) | Arquitectura de investigación no estándar |
| RMSN-236M seed2 | ~236M | no disponible | no disponible | Referenciado en la model card | Mismo laboratorio, topología Terminal Condensation |
| RMSN-193M (Kramers) | ~193M | no disponible | no disponible | Referenciado en la model card | Mismo laboratorio, topología Terminal Boundary |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face, safetensors | Transformer estándar, ampliamente soportado |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Hugging Face, safetensors | Transformer estándar con suite de evaluación pública |

La comparación con modelos de la misma categoría (transformers pequeños de 100-500M parámetros) es desfavorable en términos de ecosistema: RMSN-283M no publica pesos en formatos estándar, no declara soporte en frameworks de inferencia populares y su PPL de 65,36 no es directamente comparable con la de transformers entrenados sobre corpus mucho mayores.

## Limitaciones y advertencias

- Modelo de investigación: la arquitectura RMSN no es un transformer estándar y requiere el paquete `rmsn_core` para cargar los pesos, lo que limita la portabilidad.
- Contexto muy corto: 512 tokens, insuficiente para la mayoría de aplicaciones de producción con conversaciones o documentos largos.
- Solo inglés: no se declara soporte multilingüe.
- Corpus de entrenamiento pequeño: 204,8M tokens, muy por debajo de los estándares actuales, lo que se traduce en una perplejidad de 65,36 y una calidad de generación presumiblemente baja.
- Benchmarks no verificados: los resultados del model-index están marcados como `verified: false` y proceden únicamente del autor.
- Riesgo de alucinación: no evaluado; al no haberse realizado etapas de alineamiento documentadas (RLHF/DPO), es esperable un comportamiento poco alineado con instrucciones.
- Sesgos: no documentados; el corpus GoldenCorpus-v2 no describe su composición.
- Licencia MIT: permisiva para uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre los derechos del corpus de entrenamiento.
- Sin soporte de tool calling, agentes ni modos de razonamiento extendido.
- Formatos de pesos no estándar: no se publican safetensors ni GGUF, lo que dificulta el despliegue en vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-283M-Bulk-Tube-Base
- Dataset: https://huggingface.co/datasets/DuoNeural/GoldenCorpus-v2
- Script de sondeo referenciado en la model card: `probe_percolation_sheaf.py` (incluido en el repositorio del modelo)
- Cita BibTeX del autor: Caldwell, Jesse; Aura; Archon (2026), "RMSN-283M-Bulk-Tube-Base: Emergence of Continuous Internal Bulk Solitons in Dyadic Sheaf Networks", Hugging Face.
