# Hooshaai/llava-qwen-0.5b-rpc-attention-scienceqa

## Resumen

`llava-qwen-0.5b-rpc-attention-scienceqa` es un checkpoint experimental publicado por Hooshaai dentro del ecosistema NeuralOps, una libreria centrada en la sustitucion quirurgica de mecanismos de atencion en modelos preentrenados ("attention surgery"). El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM LLaVA de 0,5 mil millones de parametros con torre visual SigLIP congelada y decodificador Qwen2 de 24 capas, y reemplaza el mecanismo de atencion cuadratica por un operador lineal denominado RPCAttention (Random Projection Compressed Attention) en 18 de las 24 capas del decodificador.

El objetivo declarado es reducir el coste computacional y el tamano del artefacto mediante compresion de pesos, manteniendo un comportamiento aceptable en razonamiento visual sobre ScienceQA. El resultado no es un modelo de proposito general: es un artefacto de investigacion que empaqueta unicamente los pesos delta de atencion (87,14 MB en FP16, frente a 1,66 GB del modelo base completo), con un manifiesto quirurgico que describe la topologia de la modificacion.

Es relevante ahora porque ejemplifica una linea de trabajo activa: la sustitucion de atencion cuadratica por aproximaciones lineales en VLMs pequenos, con destilacion de conocimiento para recuperar parte de la calidad perdida. Los numeros publicados por el autor, sin embargo, muestran una degradacion sustancial respecto al profesor (63,75% a 30,00% de accuracy), lo que lo situa como una prueba de concepto mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decodificador Qwen2) con atencion lineal RPCAttention en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base); el artefacto publicado contiene solo pesos delta de atencion (876 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (formato de los pesos publicados); no se documentan otras variantes |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `attention_only_fp16`) + manifiesto JSON |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA Interleave con Qwen2: torre visual SigLIP de 27 capas congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas y head_dim 64. La intervencion quirurgica sustituye la atencion cuadratica por RPCAttention (familia `linear`) en 18 de las 24 capas, bajo un esquema `hybrid_3_1` que conserva seis capas ancla cuadraticas en los indices [3, 7, 11, 15, 19, 23]. Se mantienen congelados la torre visual, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y las layernorms del decodificador.

El entrenamiento consistio en destilacion de conocimiento en dos etapas (119 + 155 pasos, 274 en total) sobre ScienceQA, ejecutado en una unica RTX 3090 de 24 GB durante 120,1 segundos, con un pico de VRAM de 16.827 MB. No se documentan el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de `derek-thomas/ScienceQA`. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto e imagen-a-texto en formato conversacional (pipeline `image-text-to-text`).
- Razonamiento visual basico sobre imagenes de contenido STEM (ciencias, matematicas elementales) en el dominio de ScienceQA.
- Respuesta a preguntas de opcion multiple con seleccion de letra.
- Soporte de plantilla de chat (`chat_template.json` incluido).
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento extendido.
- No se documenta soporte de audio ni video.

## Casos de uso

- Investigacion en eficiencia de atencion: el artefacto permite reproducir y auditar la sustitucion de atencion cuadratica por RPCAttention en un VLM pequeno, comparando contra el modelo base con el mismo pipeline de evaluacion.
- Experimentos de destilacion de conocimiento: sirve como caso de estudio de recuperacion de calidad tras una cirugia de atencion, con curvas pre-KD y post-KD documentadas (perplejidad 6,10 a 3,08).
- Prototipado de VLM de bajo coste en hardware consumer: el modelo base de 0,5B y el delta de 87 MB caben en GPUs de gama media para pruebas de concepto.
- Benchmarking de operadores lineales: util para comparar RPCAttention frente a otras familias del "attention zoo" de NeuralOps sobre el mismo subconjunto de ScienceQA.
- Educacion e investigacion academica: ejemplo didactico de modificacion modular de pesos y de auditoria de artefactos mediante manifiestos quirurgicos.
- Evaluacion de pipelines de carga personalizados: valida el flujo `neuralops.hub.load_surgeried_model` para integrar checkpoints delta en lugar de pesos completos.
- No se recomienda para atencion al cliente, generacion de codigo en produccion ni tareas generales de VLM fuera del dominio STEM evaluado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagenes, split de validacion:

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 41,88 | 30,00 | -11,88 |
| Perplejidad | 2,45 | 6,10 | 3,08 | -3,02 |

Telemetria de entrenamiento declarada:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 (24 GB) |
| Pasos de optimizacion | 274 (etapa 1: 119; etapa 2: 155) |
| Duracion | 120,1 s |
| VRAM pico | 16.827 MB |
| Pesos en disco | 87,14 MB (91.376.560 bytes) |
| Ahorro frente al base FP16 (1,66 GB) | 1,58 GB (-94,9%; 19,52x mas pequeno) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 requiere aproximadamente 1-2 GB, mas el coste de la torre visual SigLIP y el proyector; el artefacto delta de 87 MB se carga sobre el modelo base.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor entreno en una RTX 3090 con 16,8 GB de pico, pero la inferencia es mucho mas ligera.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con al menos 6 GB.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos delta no es compatible directamente con esos motores sin reconstruir el modelo completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-rpc-attention-scienceqa | 0,5B (delta de atencion) | no disponible | 30,00% accuracy (no verificado) | MIT | Hugging Face (23 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | 0,5B | no disponible | 63,75% accuracy (declarado como profesor) | no disponible en la informacion | Hugging Face |
| Otros VLM pequenos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base por falta de datos publicados de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion significativa de accuracy: 30,00% frente al 63,75% del profesor, una caida de 11,88 puntos respecto al estado pre-KD.
- Resultados no verificados (`verified: false` en el model-index); deben tratarse como declaraciones del autor.
- El artefacto publicado contiene solo pesos delta de atencion, no el modelo completo; requiere el modelo base y la libreria NeuralOps para cargarse.
- Idiomas: solo ingles; no hay soporte multilingue documentado.
- Dominio limitado a ScienceQA (STEM con imagenes); no hay evidencia de generalizacion a otras tareas visuales.
- Riesgo de alucinacion no evaluado; no se documentan pruebas de robustez ni de sesgos.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Licencia MIT permite uso comercial del artefacto, pero el modelo base puede tener condiciones propias no detalladas en la informacion.
- Tamano de contexto no documentado; no apto para conversaciones de contexto largo sin verificacion previa.
- Proyecto experimental con 23 descargas y 0 likes; sin mantenimiento ni comunidad documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-rpc-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Implementacion RPCAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/rpc_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
