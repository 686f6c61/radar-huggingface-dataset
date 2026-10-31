# nvidia/DeepSeek-V4.1-Flash-1017-NVFP4

## Resumen

DeepSeek-V4.1-Flash-1017-NVFP4 es la versión cuantizada en formato NVFP4, realizada por NVIDIA con Model Optimizer, del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek AI. El modelo base es un modelo de lenguaje autorregresivo con arquitectura transformer optimizada, nativamente multimodal, que combina una arquitectura Mixture-of-Experts (MoE) con un diseño Causal Encoder-Decoder (CED) y atención dispersa comprimida de segunda generación (Compressed Sparse Attention 2, CSA2), con soporte para contextos de hasta un millón de tokens.

La cuantización NVFP4 reduce drásticamente la huella de memoria del modelo original (664,9 mil millones de parámetros según los pesos en safetensors, incluidos 552B del backbone y 196B de la memoria condicional "Engram"), haciendo viable su despliegue en hardware NVIDIA Blackwell. La cuantización se calibró con los conjuntos cnn_dailymail y Nemotron-Post-Training-Dataset-v2, usando 1.024 muestras en total.

Es relevante porque ofrece un modelo frontera multimodal pre-cuantizado, con licencia MIT, listo para sistemas de agentes, chatbots y RAG, siempre que se disponga de GPUs Blackwell y de una build de vLLM con soporte MXFP4 para las tablas Engram.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), clase `DeepseekV41ForCausalLM` |
| Parametros totales | 664.898.390.994 (safetensors); 552B backbone + 196B memoria condicional Engram |
| Parametros activos | 8B durante prefill, 16B durante decode (MoE) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (pesos principales), MXFP4 (tablas de busqueda Engram); etiquetas adicionales: 8-bit, FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 429,0 GB) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer autorregresivo nativamente multimodal con arquitectura Mixture-of-Experts: durante el prefill solo se activan 8B de parametros y durante el decode 16B, lo que reduce el coste computacional por token frente a un modelo denso equivalente. Incorpora una arquitectura Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), una forma de atencion dispersa comprimida que permite gestionar contextos de hasta un millon de tokens de forma eficiente. Un elemento distintivo es la "memoria condicional Engram" de 196B de parametros, cuyas tablas de busqueda se almacenan en formato MXFP4 en este checkpoint.

Este repositorio no contiene entrenamiento propio: es una cuantizacion post-entrenamiento (PTQ) realizada por NVIDIA con nvidia-modelopt v0.48.0rc0 (revision `1bae0e1088993b9b82de08f59de5be5a34e42170`). La calibracion empleo 512 muestras de cnn_dailymail y 512 del dataset Nemotron-Post-Training-Dataset-v2 (subconjuntos `stem`, `chat`, `math` y `code`), con longitud de secuencia 512 y batch size 4, usando seleccion determinista de muestras. Los detalles del entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto autorregresiva con razonamiento sobre contextos de hasta 1M tokens, gracias a CSA2.
- Comprension multimodal imagen-texto (pipeline image-text-to-text): acepta texto y imagenes RGB como entrada y genera texto.
- Tareas agenticas: la evaluacion oficial incluye Terminal-Bench 2.1 (tareas agenticas en terminal) y IFBench (seguimiento de instrucciones), lo que indica capacidad para flujos multi-paso.
- Razonamiento cientifico y codigo: evaluado con GPQA Diamond y SciCode.
- Recuperacion en contexto largo: evaluado con AA-LCR (long-context recall).
- Comprension visual: evaluado con MMMU-Pro.
- Uso recomendado por NVIDIA para sistemas de agentes, chatbots y RAG.
- El soporte de tool calling / function calling no esta detallado en la informacion disponible.

## Casos de uso

- Sistemas RAG sobre corpus masivos: con una ventana de contexto de 1M tokens, puede ingerir directamente grandes colecciones de documentos (contratos, documentacion tecnica, expedientes) sin fragmentacion agresiva, y CSA2 mantiene la eficiencia de atencion en esas longitudes.
- Agentes de terminal y automatizacion DevOps: su evaluacion con Terminal-Bench 2.1 lo senala como adecuado para agentes que ejecutan comandos, depuran entornos y completan tareas multi-paso en shell.
- Analisis de documentos visuales: al aceptar imagenes como entrada, puede procesar informes escaneados, capturas de diagramas o documentacion con figuras combinando comprension visual y textual.
- Chatbots de gama alta multi-turno: la activacion MoE de 8-16B parametros reduce el coste por token en conversaciones largas frente a modelos densos de tamano comparable.
- Razonamiento cientifico y tecnico: los benchmarks GPQA Diamond y SciCode indican aptitud para responder preguntas de nivel doctoral y resolver problemas de codigo cientifico.
- Analisis de codigo a gran escala: el contexto de 1M tokens permite cargar repositorios completos o trazas extensas para revision, refactorizacion o auditoria.
- Seguimiento de instrucciones complejas en produccion: su evaluacion con IFBench lo hace candidata para aplicaciones con restricciones de formato y cumplimiento estricto de consignas.

## Benchmarks y rendimiento

El model card indica que el modelo fue evaluado con GPQA Diamond, AA-LCR, SciCode, IFBench, MMMU-Pro y Terminal-Bench 2.1, con hardware NVIDIA GB300 (Blackwell) y vLLM. Sin embargo, no se incluyen las puntuaciones numericas en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamano del repositorio es de 429,0 GB en safetensors cuantizados (NVFP4/MXFP4); se necesita al menos esa capacidad de VRAM agregada (o memoria + offloading) para carga completa.
- Hardware compatible: exclusivamente microarquitectura NVIDIA Blackwell (el NVFP4 requiere tensor cores de cuarta generacion). El hardware de prueba oficial es NVIDIA GB300.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090, etc.): se requieren sistemas multi-GPU de centro de datos (por ejemplo, nodos con GB300/B200; el numero exacto de GPUs no esta disponible en la informacion proporcionada).
- Sistema operativo preferido: Linux.
- Motor de inferencia soportado: vLLM, y solo builds que incluyan el pull request [vllm-project/vllm#61530](https://github.com/vllm-project/vllm/pull/61530) con soporte MXFP4 para Engram (los resultados oficiales usaron `vllm/vllm-openai:v0.31.0` con ese PR aplicado). SGLang no ha sido validado con este checkpoint.
- Ollama y llama.cpp no figuran como soportados; dado el tamano y el formato NVFP4, no son opciones realistas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-NVFP4 (este) | 664,9B (552B backbone + 196B Engram) | 8B prefill / 16B decode | 1M | Si (imagen-texto) | MIT | vLLM (PR #61530), solo Blackwell |
| DeepSeek-V4.1-Flash-1017 (base, sin cuantizar) | 664,9B | 8B / 16B | 1M | Si | MIT | HuggingFace, deepseek-ai |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen con fiabilidad otros modelos de la misma categoria con datos comparables en la informacion proporcionada; la referencia directa es el modelo base sin cuantizar, del que esta version NVFP4 se diferencia en la huella de memoria (429,0 GB frente al peso completo en BF16) y en el requisito de hardware Blackwell.

## Limitaciones y advertencias

- Requiere exclusivamente GPUs NVIDIA Blackwell: no funciona en arquitecturas anteriores (Hopper, Ada, Ampere), lo que restringe severamente el despliegue.
- Necesita una build especifica de vLLM con el PR #61530; las imagenes stock de vLLM no pueden cargar las tablas Engram en MXFP4. SGLang no esta validado.
- La cuantizacion NVFP4 es post-entrenamiento y puede introducir degradacion de calidad respecto al modelo base; la magnitud de esa degradacion no esta cuantificada en la informacion disponible.
- Sesgos conocidos: no disponibles. Al heredar del modelo base, puede heredar sus sesgos; NVIDIA recomienda pruebas especificas por caso de uso antes de produccion (metodologia V-model, validacion a nivel de unidad y sistema).
- Riesgo de alucinacion: inherente a modelos de lenguaje autorregresivos; no se ofrecen mitigaciones especificas en el model card.
- Idiomas soportados: no disponibles; el dataset de calibracion cnn_dailymail es en ingles, lo que sugiere posible sesgo hacia ese idioma en la cuantizacion.
- Detalles del entrenamiento del modelo base (datos, tokens, RLHF/DPO) no divulgados en la informacion proporcionada.
- La licencia MIT es permisiva y permite uso comercial, pero NVIDIA aclara que el modelo no es suyo y remite al model card de DeepSeek AI para terminos del modelo base.
- La integracion en sistemas de IA requiere testing adicional con datos del caso de uso para garantizar despliegue seguro y eficaz, segun el propio model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo base (DeepSeek AI): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- NVIDIA Model Optimizer (GitHub): https://github.com/NVIDIA/Model-Optimizer
- Pull request de vLLM con soporte MXFP4 Engram: https://github.com/vllm-project/vllm/pull/61530
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
