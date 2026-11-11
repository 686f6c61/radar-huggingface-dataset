# scottlowry/Ornith-1.5-122B-oQ3.5e-mtp

## Resumen

Ornith-1.5-122B-oQ3.5e-mtp es una cuantizacion mixta de precision del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry. Se ha generado con la herramienta oQ (oMLX v0.7.4.dev1), un esquema de cuantizacion de precision mixta orientado al ecosistema MLX de Apple Silicon. El checkpoint resultante ocupa 63,5 GB en disco (59,111 GiB de pesos) y emplea una media efectiva de 4,059 bits por peso, combinando bloques de 3, 4, 5, 6 y 8 bits con algunos tensores en BF16.

El modelo base pertenece a la familia Qwen3.5 MoE (tag `qwen3_5_moe`), con 125.086.497.008 parametros totales segun los safetensors publicados. La distribucion interna del checkpoint revela tres componentes diferenciados: el modelo de lenguaje (122,112B parametros), un modulo de vision (0,451B) y una cabeza MTP (Multi-Token Prediction) de 2,524B, lo que sugiere capacidades multimodales y decodificacion especulativa integrada.

La relevancia de esta publicacion es practica: permite ejecutar un modelo MoE de gran tamano en hardware Apple Silicon con un presupuesto de memoria cercano a los 64 GB, algo inviable con los pesos originales en BF16. No obstante, la informacion publicada por el autor se limita a la tabla de cuantizacion; no hay model card con detalles de entrenamiento, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con modulo de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (122,112B LM + 0,451B vision + 2,524B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3/4/5/6/8 bits, grupo 64 y 128, mas tensores BF16; media efectiva 4,059 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 63,5 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base ornith-ai/Ornith-1.5-122B, que por el tag `qwen3_5_moe` corresponde a una arquitectura transformer con mezcla de expertos de la familia Qwen3.5. La presencia de una cabeza MTP de 2,524B parametros indica soporte de prediccion multi-token, tecnica habitual para decodificacion especulativa y aceleracion de inferencia. El modulo de vision de 0,451B confirma que el modelo base es multimodal (texto e imagen).

La cuantizacion se realizo con oQ (oMLX), que asigna precision de forma no uniforme: el 61,805% de los pesos logicos (77,309B) se almacena en 3 bits con grupo 64, el 33,178% (41,502B) en 4 bits, y el resto se reparte entre 5, 6 y 8 bits, con 0,511B en BF16. Esta estrategia preserva en mayor precision las capas mas sensibles (probablemente embeddings, normas y cabezas de atencion) mientras comprime agresivamente las matrices de expertos. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5 MoE de 122B parametros.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,451B parametros, por lo que se espera soporte de entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP permite prediccion multi-token, lo que acelera la generacion en MLX.
- Codigo y matematicas: no confirmado explicitamente en la informacion disponible, pero plausible dado el linaje Qwen3.5.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: el checkpoint de 63,5 GB cabe en Macs con 64 GB o 128 GB de memoria unificada (M2/M3/M4 Max y Ultra), permitiendo ejecutar un MoE de 122B sin GPU dedicada.
- Prototipado de asistentes multimodales en local: el modulo de vision integrado permite experimentar con tareas imagen-texto sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Evaluacion de tecnicas de cuantizacion mixta: sirve como referencia para comparar la calidad de oQ frente a otros esquemas (GGUF Q4_K_M, AWQ, GPTQ) sobre el mismo modelo base.
- Generacion de texto asistida con baja latencia relativa: la cabeza MTP habilita decodificacion especulativa, adecuada para aplicaciones interactivas donde importa el tokens/s en hardware Apple.
- Investigacion en eficiencia de inferencia: la distribucion por capas de bits publicada permite estudiar el impacto de la precision mixta en distintas partes del transformer.
- Despliegue de linea base para benchmarking interno: util para equipos que quieran medir un modelo de 122B en MLX antes de invertir en infraestructura CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 64 GB minimos para cargar los 59,111 GiB de pesos, mas overhead de contexto y cache KV; se recomienda 96-128 GB para margenes comodos.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4 Max y Ultra) por el formato MLX; no es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: no en GPUs NVIDIA de consumo (RTX 4090 con 24 GB es insuficiente); si en Mac Studio y MacBook Pro de gama alta con 64 GB o mas.
- Opciones de despliegue: MLX (libreria `mlx`), herramientas del ecosistema oMLX; no compatible directamente con vLLM, llama.cpp ni TGI sin conversion previa.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ3.5e-mtp | 125,1B (MoE) | no disponible | MLX safetensors, 4,059 bits/peso | no disponible | Hugging Face (0 descargas) |
| ornith-ai/Ornith-1.5-122B (base) | 125,1B (MoE) | no disponible | safetensors BF16 | no disponible | Hugging Face |
| Cuantizaciones GGUF Q4 de modelos MoE de ~120B | ~120B | variable | GGUF | depende del base | amplia en Hugging Face |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; los datos de rendimiento del modelo base tampoco se han publicado en la fuente consultada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base ornith-ai/Ornith-1.5-122B antes de cualquier despliegue en produccion.
- Cuantizacion agresiva: el 61,8% de los pesos esta en 3 bits, lo que puede degradar tareas sensibles a precision (matematicas, codigo, razonamiento largo) frente al modelo base en BF16.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple; no hay conversion publicada a GGUF ni a formatos CUDA.
- Sin benchmarks: no hay evidencia publicada sobre la perdida de calidad respecto al modelo base; cualquier afirmacion de rendimiento seria especulativa.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones de fidelidad publicadas.
- Sesgos: no documentados en la informacion disponible.
- Repo sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre la calidad de la cuantizacion.
- Idiomas: no confirmados; el comportamiento multilingue del checkpoint no esta verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ3.5e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
