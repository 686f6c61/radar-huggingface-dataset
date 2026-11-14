# Hooshaai/llava-qwen-0.5b-spectraformer-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-spectraformer-attention-scienceqa` es un checkpoint multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la tecnica de "attention surgery" del proyecto NeuralOps. El autor (Hooshaai) sustituye la atencion cuadratica estandar por `SpectraformerAttention`, un operador de atencion lineal basado en kernelizacion por caracteristicas aleatorias, en 18 de las 24 capas del decoder Qwen2, manteniendo seis capas ancla con atencion cuadratica clasica (patron `hybrid_3_1`). El modelo esta afinado sobre ScienceQA, un benchmark de razonamiento visual STEM, y se publica como un delta quirurgico de pesos mas que como un modelo completo.

La propuesta es experimental y de investigacion: demuestra que es posible reducir el coste cuadratico de la atencion en un VLM pequeno (0,5B) y recuperar buena parte del rendimiento perdido mediante destilacion de conocimiento desde el modelo profesor. El checkpoint final ocupa 259,26 MB en FP16, un 84,8% menos que el modelo base (1,66 GB), y obtiene un 38,12% de accuracy en el subconjunto con imagen de ScienceQA (validacion), frente al 63,75% del profesor y el 42,50% del modelo pre-destilacion.

Es relevante ahora como referencia practica para quienes investigan atencion lineal, compresion de VLMs y tecnicas de "attention surgery" aplicadas a modelos multimodales pequenos. No es un modelo listo para produccion general: es un artefacto de investigacion con alcance y metricas muy acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower congelado + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con atencion lineal Spectraformer en 18/24 capas |
| Parametros totales | 0,5B (heredados del base `llava-interleave-qwen-0.5b-hf`); el delta publicado contiene 516 tensores de atencion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) |

## Arquitectura y entrenamiento

El modelo parte de LLaVA-Interleave-Qwen-0.5B: torre de vision SigLIP congelada de 27 capas, proyector MLP de dos capas y decoder Qwen2 de 24 capas con dimension oculta D=1024, 16 cabezas y head_dim=64. La intervencion sustituye la self-attention en 18 de las 24 capas por `SpectraformerAttention`, un mecanismo de atencion lineal con kernelizacion por caracteristicas aleatorias que aproxima la atencion softmax en tiempo lineal respecto a la longitud de secuencia. Las seis capas restantes ([3, 7, 11, 15, 19, 23]) conservan atencion cuadratica como anclas, configurando un patron hibrido `hybrid_3_1`. Se congelan la torre de vision, el proyector, los MLPs del decoder y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decoder.

El entrenamiento se realizo en dos etapas sobre ScienceQA (dataset `derek-thomas/ScienceQA`) con destilacion de conocimiento desde el modelo profesor original. Se ejecutaron 295 pasos de optimizacion (129 en la etapa 1 y 166 en la etapa 2) en una unica NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 15.668 MB y una duracion total de 120,2 segundos. El resultado es un delta quirurgico de pesos (no un modelo completo) que debe combinarse con el base para su uso.

## Capacidades

- Generacion de texto e image-text-to-text: responde preguntas sobre imagenes en formato conversacional.
- Razonamiento visual STEM: entrenado especificamente para preguntas de ciencia con soporte de imagen (ScienceQA).
- Respuesta de opcion multiple: el template de chat induce respuestas con letra de opcion.
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Investigacion en atencion lineal: servir como referencia reproducible para medir el impacto de sustituir atencion cuadratica por Spectraformer en un VLM pequeno, comparando accuracy y perplexity contra el profesor.
- Experimentos de destilacion de conocimiento: el par (modelo pre-KD con PPL 200,85, modelo post-KD con PPL 3,63) permite estudiar como la KD recupera el comportamiento del profesor tras la cirugia de atencion.
- Prototipado de compresion de VLMs: el delta de 259,26 MB frente a los 1,66 GB del base ilustra un flujo de publicacion de pesos quirurgicos y puede integrarse en pipelines de evaluacion de tecnicas de compresion.
- Docencia y demos de "attention surgery": util para explicar en clase o talleres como se modifica selectivamente una arquitectura transformer multimodal sin reentrenar todo el modelo.
- Benchmarking de eficiencia en hardware consumer: entrenado y evaluable en una RTX 3090, sirve para medir el coste real de inferencia de atencion lineal en un VLM de 0,5B.
- Base para ablaciones controladas: al mantener seis capas ancla cuadraticas, permite estudiar el equilibrio entre capas lineales y cuadraticas (patron `hybrid_3_1`) en tareas de razonamiento visual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScienceQA (subconjunto con imagen STEM, validacion):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 42,50 | 38,12 | -4,38 |
| Perplexity (PPL) | 2,45 | 200,85 | 3,63 | -197,22 |

Telemetria de entrenamiento: 295 pasos (129 etapa 1, 166 etapa 2), 120,2 s de duracion, pico de VRAM de 15.668 MB en RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumio 15.668 MB en una RTX 3090, por lo que la inferencia en FP16 deberia caber holgadamente en GPUs consumer de 8-12 GB, aunque no se publican cifras de inferencia.
- GPU recomendadas: RTX 3090 (usada por el autor para el entrenamiento); cualquier GPU con al menos 8 GB deberia ser suficiente para el modelo de 0,5B en FP16, aunque no esta verificado.
- Cabe en GPU consumer: si, el modelo base de 0,5B y el delta de 259,26 MB son ligeros; no se especifican GPUs concretas probadas en inferencia.
- Opciones de despliegue: la model card documenta la API `neuralops.hub.load_surgeried_model`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/llava-qwen-0.5b-spectraformer-attention-scienceqa | 0,5B | no disponible | 38,12% accuracy, PPL 3,63 | MIT | Hugging Face (delta quirurgico) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75% accuracy, PPL 2,45 | no disponible en la informacion | Hugging Face |
| Otros VLMs de ~0,5B (p. ej. variantes Qwen2-VL pequenas) | ~0,5B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al par profesor-alumno porque no se han publicado en la informacion disponible resultados de otros modelos comparables en el mismo subconjunto de ScienceQA.

## Limitaciones y advertencias

- Rendimiento degradado respecto al profesor: 38,12% frente a 63,75% de accuracy, una caida de 25,63 puntos porcentuales; no es apto para tareas de razonamiento visual de produccion.
- Perdida adicional tras la destilacion: el modelo post-KD rinde peor en accuracy que el pre-KD (38,12% vs 42,50%), aunque mejora drasticamente la perplexity (3,63 vs 200,85).
- Alcance acotado: evaluado unicamente en el subconjunto con imagen de ScienceQA (validacion); no hay evidencia de generalizacion a otras tareas multimodales.
- Solo ingles: el modelo declara `language: en`; no se documenta soporte multilingue.
- Delta quirurgico, no modelo completo: requiere cargarse junto al base `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la API de NeuralOps; no es un checkpoint autonomo estandar.
- Dependencia de la libreria `neuralops`: la carga se realiza con `load_surgeried_model`, lo que limita la portabilidad a otros ecosistemas (transformers, vLLM, llama.cpp).
- Metricas no verificadas: los resultados del model-index tienen `verified: false`; deben tratarse como declaraciones del autor.
- Riesgo de alucinacion: no evaluado en la informacion disponible; inherente a los VLMs de este tamano.
- Sesgos conocidos: no documentados.
- Uso comercial: la licencia MIT lo permite, pero el estado experimental y el bajo rendimiento desaconsejan su uso en produccion.
- Longitud de contexto: no especificada, lo que impide planificar cargas con secuencias largas.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-spectraformer-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de SpectraformerAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/spectraformer_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
