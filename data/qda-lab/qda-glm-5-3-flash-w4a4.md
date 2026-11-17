# qda-lab/QDA-GLM-5.3-Flash-W4A4

## Resumen

QDA-GLM-5.3-Flash-W4A4 es una cuantizacion NVFP4 (4 bits en pesos y 4 bits en activaciones, W4A4) del modelo multimodal zai-org/GLM-5.3-Flash, publicada por qda-lab. El objetivo es reducir el peso del checkpoint de 328,3 GB (FP8 original) a 197,2 GB manteniendo el 99,1 % de la precision media en cuatro benchmarks, para su despliegue en GPUs NVIDIA Blackwell de centro de datos. El modelo base es un transformer MoE con capacidades de imagen-texto-a-texto, pensado para razonamiento, matematicas y codigo.

La relevancia de esta ficha esta en que demuestra que una cuantizacion agresiva a 4 bits en pesos y activaciones puede igualar o superar ligeramente a las alternativas NVFP4 de NVIDIA y Red Hat AI en el mismo modelo base, con un checkpoint 7 GB mas pequeno que el de NVIDIA. No obstante, el autor advierte explicitamente de que no es una victoria clara: las diferencias estan dentro de los intervalos de confianza en la mayoria de benchmarks.

El checkpoint tiene 168.893.635.422 parametros (segun safetensors), requiere 4 GPUs Blackwell para inferencia con tensor parallelism y se distribuye bajo licencia MIT, la misma que el modelo base. La receta de cuantizacion no esta publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (GLM-5.3), con atencion MLA lineal y dispersa, capa MTP |
| Parametros totales | 168.893.635.422 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (la evaluacion uso una ventana de motor de 350.000 tokens y un tope de salida de 65.536 tokens) |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1 con escala E4M3 por cada 16 entradas y escala tensorial FP32) en expertos enrutados de capas MoE 3-44 y MLPs densos 0-2; FP8 en expertos de la capa MTP; BF16 en atencion, expertos compartidos, routers, embeddings, lm_head y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato compressed-tensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer con mezcla de expertos (MoE) y capacidades multimodales (image-text-to-text). La model card de esta cuantizacion detalla que las capas MoE 3-44 contienen expertos enrutados y que las capas 0-2 tienen MLPs densos; tambien menciona atencion MLA lineal y dispersa, expertos compartidos, routers y una torre de vision que permanece en BF16. Incluye una capa MTP (multi-token prediction) usada para decodificacion especulativa, cuyos expertos se mantienen en FP8 con escalas de bloque en pesos y escalas dinamicas en activaciones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que esta ficha corresponde a una cuantizacion y no al modelo original. La innovacion tecnica destacable de esta release es el esquema de cuantizacion NVFP4 con escalas E4M3 por bloque de 16 entradas y escala tensorial FP32, aplicado tanto a pesos como a activaciones en tiempo de ejecucion, junto con la preservacion en BF16 de los componentes sensibles a la precision (atencion, routers, embeddings y torre de vision). La receta exacta de cuantizacion no esta publicada.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (la evaluacion se realizo con thinking mode activado).
- Razonamiento matematico de competicion (AIME 2026, HMMT Feb 2026, HMMT Nov 2025 en la evaluacion).
- Generacion de codigo (evaluado en LiveCodeBench v6).
- Conocimiento cientifico y de posgrado (GPQA-Diamond, SuperGPQA).
- Procesamiento de imagen-texto-a-texto segun el pipeline declarado, aunque las entradas de imagen y video se desactivaron en la evaluacion.
- Decodificacion especulativa mediante capa MTP con 5 tokens especulativos, soportada por vLLM.
- Compatibilidad con el parser de razonamiento `glm47` de vLLM.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico de alto nivel: el modelo alcanza 89,84 en GPQA-Diamond y 69,21 en SuperGPQA, por lo que es adecuado para asistentes de investigacion que respondan preguntas de nivel posgrado en fisica, quimica y biologia con cadenas de razonamiento largas.
- Resolucion de problemas matematicos de competicion: con 82,39 en el agregado de AIME 2026 y HMMT, sirve para tutoria automatica de olimpiadas matematicas o generacion de soluciones paso a paso con verificacion.
- Generacion de codigo en produccion: 70,48 en LiveCodeBench v6 permite integrarlo en pipelines de revision de codigo o generacion de tests, siempre que se despliegue con vLLM y decodificacion especulativa MTP para reducir latencia.
- Evaluacion automatizada de modelos: al conservar el 99,1 % de la precision del FP8 con 131 GB menos de checkpoint, es util como modelo juez en pipelines de evaluacion que necesiten reducir coste de almacenamiento y memoria.
- Despliegue en cluster Blackwell: pensado para servir en 4x B200, B300, GB200 o GB300 con tensor parallelism 4 y ventana de 350.000 tokens, adecuado para cargas concurrentes de hasta 256 secuencias.
- Investigacion sobre cuantizacion: sirve como referencia para estudiar el impacto de NVFP4 W4A4 en modelos MoE multimodales, comparando con los checkpoints NVFP4 de NVIDIA y Red Hat AI sobre los mismos problemas y semillas.
- Analisis multimodal en produccion: el pipeline image-text-to-text y la torre de vision en BF16 permiten tareas de descripcion de imagenes o extraccion de informacion de documentos, aunque no se han publicado metricas multimodales en esta release.

## Benchmarks y rendimiento

| Benchmark | FP8 original (328,3 GB) | QDA W4A4 (197,2 GB) | NVIDIA NVFP4 (204,4 GB) | RedHatAI NVFP4 (197,8 GB) |
|---|---|---|---|---|
| GPQA-Diamond (198 x 40) | 90,08 ± 1,77 | 89,84 ± 1,73 | 88,89 ± 1,85 | 89,36 ± 1,79 |
| Math (93 x 32) | 83,90 ± 2,73 | 82,39 ± 2,80 | 81,25 ± 3,00 | 78,86 ± 3,13 |
| LiveCodeBench v6 (454 x 8) | 71,26 ± 1,93 | 70,48 ± 1,97 | 69,93 ± 1,99 | 68,83 ± 2,00 |
| SuperGPQA (9.000 x 2) | 69,44 ± 0,46 | 69,21 ± 0,46 | 69,17 ± 0,46 | 69,01 ± 0,46 |
| Media | 78,7 | 78,0 | 77,3 | 76,5 |
| Porcentaje del FP8 | 100 % | 99,1 % | 98,3 % | 97,3 % |

Porcentaje de respuestas cortadas en el limite de 65.536 tokens (menor es mejor):

| Benchmark | FP8 | QDA W4A4 | NVIDIA | RedHatAI |
|---|---|---|---|---|
| GPQA-Diamond | 3,08 % | 3,83 % | 4,85 % | 4,49 % |
| Math | 14,28 % | 15,39 % | 17,41 % | 19,42 % |
| LiveCodeBench v6 | 25,03 % | 26,10 % | 26,76 % | 27,97 % |
| SuperGPQA | 1,59 % | 1,88 % | 1,94 % | 2,58 % |

Comparacion pareada QDA - NVIDIA con intervalo del 95 %: GPQA-Diamond +0,95 (+0,24 a +1,65), Math +1,14 (-0,38 a +2,66), LiveCodeBench v6 +0,55 (-0,34 a +1,44), SuperGPQA +0,04 (-0,43 a +0,52). El autor indica que en un conjunto previo e independiente de 20 draws de GPQA-Diamond QDA quedaba 0,7 puntos por detras de NVIDIA, por lo que interpreta el resultado como "no por detras en ninguno de los cuatro benchmarks, con 7 GB menos, pero no una victoria clara". Configuracion de evaluacion: vLLM 0.31.0, tensor parallelism 4 en 4x GB300, ventana de motor de 350.000 tokens, maximo 256 secuencias concurrentes, utilizacion de memoria GPU 0,90, decodificacion especulativa MTP con 5 tokens, parser `glm47`, KV cache en BF16, temperature 1,0 y top-p 0,95, sin entradas de imagen ni video.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 197,2 GB en disco; con KV cache en BF16 y margen de ejecucion, el autor indica que se necesitan 4 GPUs Blackwell de centro de datos.
- GPUs recomendadas: B200, B300, GB200 o GB300 (arquitectura Blackwell, necesaria para NVFP4). La evaluacion se hizo en 4x GB300 con tensor parallelism 4.
- No cabe en GPUs de consumo: el soporte NVFP4 y el tamano del checkpoint lo excluyen de RTX 4090 o similares.
- Opciones de despliegue: vLLM 0.31.0 (comando documentado con `--tensor-parallel-size 4`, `--reasoning-parser glm47` y `--speculative-config '{"method": "mtp", "num_speculative_tokens": 5}'`). Otros motores como llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles de forma explicita; la configuracion usada admite hasta 256 secuencias concurrentes con decodificacion especulativa MTP de 5 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en 4 benchmarks | Tamano del checkpoint | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QDA-GLM-5.3-Flash-W4A4 | 168,9 B | no disponible | 78,0 | 197,2 GB | MIT | Hugging Face (qda-lab) |
| zai-org/GLM-5.3-Flash (FP8) | no disponible | no disponible | 78,7 | 328,3 GB | MIT | Hugging Face (zai-org) |
| nvidia/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | 77,3 | 204,4 GB | no disponible | Hugging Face (nvidia) |
| RedHatAI/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | 76,5 | 197,8 GB | no disponible | Hugging Face (RedHatAI) |

## Limitaciones y advertencias

- Las diferencias frente a los checkpoints NVFP4 de NVIDIA y Red Hat AI son pequenas y, en Math, LiveCodeBench v6 y SuperGPQA, los intervalos de confianza incluyen el cero; no debe interpretarse como una mejora robusta.
- El porcentaje de respuestas truncadas a 65.536 tokens es mayor que en el FP8 original en los cuatro benchmarks (por ejemplo, 26,10 % frente a 25,03 % en LiveCodeBench v6), lo que puede afectar a tareas que requieran razonamientos muy largos.
- Requiere hardware Blackwell especifico (B200, B300, GB200, GB300); no es desplegable en GPUs consumer ni en generaciones anteriores.
- La receta de cuantizacion no esta publicada, lo que dificulta reproducir el proceso o auditar posibles sesgos introducidos por la cuantizacion.
- La evaluacion es exclusivamente textual: las entradas de imagen y video se desactivaron, por lo que no hay evidencia publicada del rendimiento multimodal tras la cuantizacion.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de esta release; deben evaluarse sobre el modelo base.
- Licencia MIT permite uso comercial, pero al derivar de zai-org/GLM-5.3-Flash conviene verificar las condiciones del modelo base y de los checkpoints de referencia.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion independiente de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/qda-lab/QDA-GLM-5.3-Flash-W4A4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Checkpoint NVFP4 de Red Hat AI: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
