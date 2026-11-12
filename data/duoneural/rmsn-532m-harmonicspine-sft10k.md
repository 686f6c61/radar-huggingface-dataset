# DuoNeural/RMSN-532M-HarmonicSpine-SFT10k

## Resumen

RMSN-532M-HarmonicSpine-SFT10k es un modelo de generacion de texto de 532 millones de parametros desarrollado por DuoNeural AI Laboratory. Se presenta como la culminacion de la Fase 5 de escalado de SFT (supervised fine-tuning) dentro de la linea de investigacion del laboratorio, y se construye sobre una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN), con dimension de modelo D=1536, 16 capas y 64 slots (M_w=64). El modelo parte de un preentrenamiento sobre FineWeb-Edu hasta 100.000 pasos y se afina posteriormente durante 10.000 pasos sobre trazas de razonamiento y Chain-of-Thought de alta complejidad.

La propuesta tecnica del autor combina conceptos de mecanica port-hamiltoniana, mecanica metriplectica, teoria de haces (sheaf theory) y estabilidad de Lyapunov como marco unificado para el modelado del lenguaje. El modelo declara una "Harmonic Spine Topology" en la que la capa terminal (L15) se conserva como singularidad de rango 1 durante todo el entrenamiento, con el objetivo de evitar el olvido catastrofico mientras el resto de capas se reconfigura para comprimir el razonamiento CoT.

El dato mas destacado de la model card es una perplejidad de 9,79 en su conjunto interno de "CoT Hard Reasoning", que el autor presenta como record historico del laboratorio. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin resultados en benchmarks publicos estandar (MMLU, HumanEval, GSM8K) y con una arquitectura que requiere codigo propietario (`rmsn_core`) no publicado en el repositorio de Hugging Face, lo que limita severamente su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), transformer con formulacion port-hamiltoniana y metriplectica declarada |
| Parametros totales | 532 millones |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`, `rmsn_sft_10k_best.pt`); no se ofrece safetensors ni GGUF |
| Dimension del modelo (D) | 1536 |
| Profundidad (L) | 16 capas |
| Slots (M_w) | 64 |
| Vocabulario | 49.152 tokens (tokenizer `HuggingFaceTB/cosmo2-tokenizer`) |
| Preentrenamiento | FineWeb-Edu, 100.000 pasos |
| Fine-tuning | SFT 10.000 pasos sobre `cdm_reasoning_traces_v4.jsonl` |

## Arquitectura y entrenamiento

La arquitectura declarada es una Resonant Metriplectic Sheaf Network, que el autor enmarca en un "Port-Hamiltonian Framework for Neural Language Modeling with Emergent Lyapunov Cascade Dynamics". Segun la model card, el modelo combina descomposicion espectral de haces (sheaf spectral decomposition) con dinamicas metriplecticas, y presenta una estructura topologica denominada Harmonic Spine: la capa 00 actua como filtro de entrada tipo soliton (PR = 2,02), la capa 08 como relé cognitivo interno (PR = 2,40) y la capa 15 como singularidad macroscopica de rango 1 (PR = 1,000000), que se conserva invariantemente durante el entrenamiento ("Law of Topological Cement"). No se detalla el mecanismo de atencion, la formulacion exacta de las capas ni el numero de tokens de entrenamiento mas alla de los pasos indicados.

El entrenamiento consta de dos fases: un preentrenamiento sobre FineWeb-Edu hasta 100.000 pasos y un SFT extendido de 10.000 pasos sobre un dataset de trazas de razonamiento y CoT (`cdm_reasoning_traces_v4.jsonl`). La model card reporta una perdida de SFT que desciende de 2,2104 (SFT 5.000 pasos) a 2,0124 (SFT 10.000 pasos), y una perdida en CoT Hard Reasoning que baja de 8,9639 (base) a 2,2814 (este modelo). No se menciona uso de RLHF, DPO, decodificacion especulativa ni tecnicas de atencion lineal. La tokenizer utilizada es externa (`HuggingFaceTB/cosmo2-tokenizer`), no propia.

## Capacidades

- Generacion de texto autoregresiva basica, con pipeline declarado `text-generation`.
- Razonamiento y Chain-of-Thought: el modelo se afina especificamente sobre trazas CoT y declara compresion de razonamiento (perplejidad 9,79 en su conjunto interno de razonamiento duro).
- Razonamiento matematico basico: la model card incluye un ejemplo de resolucion de ecuacion lineal (`3x + 5 = 20`).
- Capacidad multilingue: no disponible; no se declaran idiomas soportados.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Vision, audio u otras modalidades: no disponible; el modelo es exclusivamente de texto.
- Modo "thinking" explicito: no disponible como funcionalidad separada; el CoT se induce via prompt.

## Casos de uso

- Generacion de texto experimental en investigacion: el modelo puede utilizarse como banco de pruebas para estudiar dinamicas de entrenamiento en arquitecturas no estandar (port-hamiltonianas, metriplecticas) y su efecto sobre la retencion de conocimiento general.
- Razonamiento matematico de juguete: adecuado para prototipos de resolucion de ecuaciones simples y problemas aritmeticos paso a paso, siempre que se valide la salida, dado el tamano reducido del modelo.
- Generacion de trazas CoT sinteticas: puede emplearse para producir cadenas de razonamiento de dominio general que sirvan como datos de aumento o destilacion hacia modelos mayores, aunque la calidad no esta validada externamente.
- Investigacion sobre olvido catastrofico: la afirmacion de conservacion topologica de la capa terminal permite disenar experimentos controlados de retencion frente a fine-tuning continuo.
- Despliegue en entornos con recursos muy limitados: con 532M de parametros, el modelo es candidato a inferencia en CPU o GPU de gama baja, aunque la falta de cuantizaciones oficiales obliga a convertir los pesos manualmente.
- Educacion y divulgacion: util como ejemplo didactico de arquitecturas inspiradas en fisica y de las limitaciones de las metricas internas frente a benchmarks publicos.

## Benchmarks y rendimiento

Los unicos datos disponibles son metricas internas del autor, no comparables con benchmarks estandar:

| Metrica | Base preentrenado | SFT 5.000 pasos | SFT 10.000 pasos (este modelo) |
|---|---|---|---|
| Perdida de entrenamiento SFT | no disponible | 2,2104 | 2,0124 |
| Perdida CoT Hard Reasoning | 8,9639 | 2,7840 | 2,2814 |
| Perplejidad CoT Hard Reasoning | 7816,02 | 16,18 | 9,79 |
| Perplejidad de retencion WikiText-103 | 87,42 | 154,21 | 174,52 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la informacion disponible. La perplejidad de retencion en WikiText-103 empeora de forma monotona con el SFT (87,42 a 174,52), lo que sugiere un cierto grado de olvido en conocimiento general pese a la afirmacion de "robust general retention".

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,1 GB solo para pesos (532M x 4 bytes), mas activaciones y cache de atencion.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,55 GB; en int4: aproximadamente 0,3 GB (estimaciones teoricas, no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, GTX 1660) es suficiente en fp16; para entrenamiento o fine-tuning se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura requiere el modulo propietario `rmsn_core` y los pesos estan en formato `.pt`. El despliegue viable es mediante PyTorch con el codigo del autor.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-532M-HarmonicSpine-SFT10k | 532M | no disponible | MIT | Pesos `.pt` + codigo propietario | Arquitectura no estandar, sin benchmarks publicos |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | safetensors, GGUF, amplio ecosistema | Benchmarks publicos, soporte en vLLM/llama.cpp |
| SmolLM2-360M | 362M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Entrenado en 4T tokens, benchmarks publicos |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Referencia en el segmento sub-2B |

La comparacion directa no es posible en terminos de rendimiento porque RMSN-532M no publica resultados en benchmarks estandar. Frente a alternativas como Qwen2.5-0.5B o SmolLM2-360M, la diferencia principal es la disponibilidad: los modelos citados ofrecen pesos en formatos estandar, cuantizaciones oficiales y soporte en frameworks de inferencia ampliamente adoptados, mientras que RMSN-532M depende de codigo no publicado en el repositorio.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no hay resultados en MMLU, GSM8K, HumanEval ni otras evaluaciones estandar, por lo que el rendimiento real es desconocido.
- Metricas internas no verificables: la perplejidad de 9,79 en "CoT Hard Reasoning" se calcula sobre un conjunto privado (`cdm_reasoning_traces_v4.jsonl`) no publicado, lo que impide su reproduccion.
- Dependencia de codigo propietario: la inferencia requiere el modulo `rmsn_core`, que no se distribuye en el repositorio de Hugging Face; el checkpoint es un `.pt` con `weights_only=False`, lo que plantea riesgos de seguridad al cargarlo.
- Olvido catastrofico parcial: la perplejidad de retencion en WikiText-103 empeora un 99,6% respecto al base preentrenado (87,42 a 174,52), lo que contradice parcialmente la afirmacion de retencion robusta.
- Riesgo de alucinacion elevado: con 532M de parametros y un entrenamiento centrado en CoT sintetico, la fiabilidad factual es limitada.
- Idiomas no declarados: no se especifica que lenguas soporta; probablemente el ingles domine por el uso de FineWeb-Edu.
- Contexto no documentado: se desconoce la ventana de contexto maxima, lo que impide planificar su uso en tareas de contexto largo.
- Sin cuantizaciones oficiales ni integracion en frameworks: no hay GGUF, no hay soporte en vLLM, llama.cpp ni Ollama, lo que limita el despliegue en produccion.
- Cero adopcion comunitaria: 0 descargas y 0 likes en el momento de la consulta; sin validacion externa independiente.
- Licencia MIT: permite uso comercial, pero la ausencia de codigo de inferencia publicado hace inviable el despliegue sin reimplementar la arquitectura.
- Terminologia no estandar: conceptos como "Law of Topological Cement" o "Harmonic Spine" no tienen respaldo en literatura revisada por pares; la cita remite a un preprint en Zenodo del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-532M-HarmonicSpine-SFT10k
- Organizacion en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub: https://github.com/DuoNeural/RMSN
- Licencia MIT: https://opensource.org/licenses/MIT
- Tokenizer utilizado: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Cita (preprint Zenodo, referencia del autor): Caldwell, Jesse; Archon; Aura. "Resonant Metriplectic Sheaf Networks: A Unified Port-Hamiltonian Framework for Neural Language Modeling with Emergent Lyapunov Cascade Dynamics", DuoNeural Lab Preprints, 2026.
