# AutomatosX/AX-Qwen3.5-9B-CUDA-AXQ-NVFP4-W4A16-MTP

## Resumen

AX-Qwen3.5-9B-CUDA-AXQ-NVFP4-W4A16-MTP es un checkpoint cuantizado experimental del modelo multimodal Qwen/Qwen3.5-9B, publicado por AutomatosX mediante su toolkit propietario AXQuant (version 2.2.1). El objetivo es ofrecer una version de pesos comprimidos en formato NVFP4 (W4A16) compatible con el contenedor compressed-tensors, pensada para reducir la huella de memoria en inferencia sobre GPUs NVIDIA. El modelo conserva la arquitectura y capacidades del base Qwen3.5-9B, incluyendo el pipeline image-text-to-text, pero con las matrices de atencion y MLP del bloque de lenguaje empaquetadas a 4 bits.

El artefacto no es un modelo de nueva generacion ni un ajuste fino: es una conversion de precision. De los 9.653.104.368 parametros totales, 248 matrices de atencion y MLP del decoder de lenguaje se empaquetan en E2M1 con escalas E4M3 por cada 16 valores y escala global inversa en FP32, mientras que los 527 tensores restantes (vision, embeddings, normalizacion, cabeza de salida y pesos MTP) se preservan exactamente igual que en el modelo fuente. Las activaciones permanecen en BF16, de modo que en la practica es una cuantizacion weight-only W4A16 y no una aritmetica FP4 completa.

Su relevancia es acotada y conviene subrayarla: el propio autor lo etiqueta como `status=development`, `runtime_verified=false` y `quality_certified=false`, y anuncia una reconstruccion del pack con el toolkit mejorado. Es util como evidencia tecnica del encoder AXQuant y como banco de pruebas de despliegue NVFP4, no como sustituto certificado del modelo base en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5-9B (no se detalla en la informacion disponible) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos E2M1, escalas E4M3 por grupo de 16, escala global inversa FP32); activaciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (licencia upstream del modelo base) |
| Formato de pesos | safetensors con contenedor compressed-tensors (NVFP4A16) |
| Tamano del repositorio | 9,4 GB |
| Modelo base | Qwen/Qwen3.5-9B (revision c202236235762e1c871ad0ccb60c8ee5ba337b9a) |
| Toolkit de conversion | AXQuant 2.2.1, encoder RTN, backend `numpy-reference` |
| Estado del manifest | development, runtime_verified=false, quality_certified=false |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento nuevo: es una exportacion cuantizada del modelo Qwen3.5-9B. La arquitectura subyacente es la del base (transformer multimodal con torre de vision y decoder de lenguaje), aunque la model card no detalla numero de capas, dimension oculta ni cabezas de atencion. El proceso de conversion emplea un encoder RTN (round-to-nearest) propiedad de AXQuant, sin calibracion de activaciones ni medicion de sensibilidad por capa, ejecutado con un backend de referencia en NumPy sobre un Mac Studio M2 Ultra de 192 GB. El sufijo CUDA del nombre describe el formato de runtime objetivo, no el dispositivo de conversion.

El empaquetado afecta exclusivamente a 248 matrices de atencion y MLP del bloque de lenguaje. Los tensores de vision, embeddings, normalizacion, cabeza de salida y los pesos MTP (multi-token prediction) se conservan intactos y protegidos, y el manifest del artefacto vincula cada peso exportado con su fichero de configuracion. El fichero `static-validation.json` registra la comparacion completa de tensores protegidos y un muestreo acotado de filas. Los pesos MTP originales se incluyen y preservan, pero la decodificacion especulativa no esta verificada ni certificada, por lo que debe mantenerse desactivada.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-9B.
- Procesamiento image-text-to-text: el pipeline declarado es multimodal y la torre de vision se preserva sin cuantizar.
- Razonamiento, codigo y matematicas: capacidades propias del base, no verificadas en este checkpoint.
- Tool calling y function calling: presumiblemente soportados por el base, no verificados en el pack cuantizado.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Multilingue: no disponible en la informacion proporcionada.
- Pesos MTP empaquetados para decodificacion especulativa, aunque su uso no esta certificado.
- Generacion de vision y audio: no cualificada segun el autor.

## Casos de uso

- Evaluacion de toolkits de cuantizacion: el pack sirve como banco de pruebas reproducible para comparar el encoder RTN de AXQuant frente a otras herramientas (llm-compressor, GPTQ, AWQ) sobre un mismo modelo base, midiendo paridad numerica y calidad tras la compresion.
- Pruebas de despliegue NVFP4 en vLLM: util para validar la carga de contenedores compressed-tensors NVFP4A16 en versiones recientes de vLLM y comprobar el comportamiento del kernel Marlin weight-only con activaciones BF16.
- Reduccion de huella en GPUs de gama alta para inferencia de texto: con 9,4 GB de pesos, el checkpoint permite ejecutar un modelo de ~9,6 mil millones de parametros en una sola GPU consumer de 24 GB con margen para cache KV, aunque el autor solo ha validado generacion greedy acotada.
- Investigacion sobre cuantizacion weight-only: el manifest y los ficheros de validacion estatica permiten auditar que tensores se protegieron y cuales se empaquetaron, lo que resulta util para estudiar el impacto de cuantizar solo atencion y MLP.
- Pipeline de prototipado multimodal interno: para equipos que ya usan Qwen3.5-9B y quieren experimentar con una variante de menor peso en entornos de desarrollo, sin compromiso de calidad certificada.
- Verificacion de integridad de artefactos: el binding manifest-pesos y `static-validation.json` sirven como ejemplo de buenas practicas para publicar checkpoints cuantizados con trazabilidad de revision del modelo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han cualificado la paridad numerica, la calidad en tareas, la velocidad ni el ahorro de memoria durante la ejecucion. El unico dato de runtime es un smoke test funcional: carga en modo solo texto y generacion greedy acotada superadas en una NVIDIA GeForce RTX 5090 con vLLM 0.31.0, PyTorch 2.13.0+cu130 y `cpu_offload_gb=12.0` configurado, registrado en `runtime-smoke.json`. Se trata de una prueba de funcionamiento, no de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,4 GB solo para pesos; con cache KV y overhead de runtime, se recomienda un minimo de 16-24 GB para texto con contexto moderado.
- GPU recomendadas: NVIDIA RTX 5090 (unica configuracion validada por el autor), A100, H100 y L40S como alternativas plausibles para el formato NVFP4, si bien no estan verificadas.
- GPU consumer: cabe en tarjetas de 24 GB (RTX 4090, RTX 5090) para inferencia de texto; la configuracion validada requirio `cpu_offload_gb=12.0`, lo que sugiere que sin offload la huella real puede superar los 24 GB.
- Opciones de despliegue: vLLM 0.31.0 o superior con soporte compressed-tensors NVFP4A16 y kernel Marlin weight-only; el autor no menciona soporte verificado en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no ha cualificado velocidad ni ahorro de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| AX-Qwen3.5-9B-CUDA-AXQ-NVFP4-W4A16-MTP | 9,65 B | no disponible | NVFP4 W4A16 | Apache-2.0 | development, sin certificar |
| Qwen/Qwen3.5-9B (base) | 9,65 B | no disponible | BF16 original | Apache-2.0 | modelo de referencia upstream |
| Otras variantes cuantizadas de Qwen3.5-9B | no disponible | no disponible | no disponible | Apache-2.0 | no disponible |

La comparacion relevante es contra el modelo base: mismo numero de parametros y licencia, pero el pack AXQuant reduce el peso de almacenamiento a cambio de una perdida de precision no medida y de un estado de validacion incompleto. No se dispone de informacion sobre alternativas cuantizadas comparables del mismo base.

## Limitaciones y advertencias

- Estado experimental: el manifest declara `status=development`, `runtime_verified=false` y `quality_certified=false`; el autor anuncia una reconstruccion del pack con el toolkit mejorado.
- Calidad no medida: no se ha evaluado la paridad numerica frente al modelo BF16 ni la degradacion en tareas de razonamiento, codigo o matematicas.
- Vision y audio no cualificados: aunque la torre de vision se preserva, la generacion multimodal no ha sido verificada.
- Contexto largo no verificado: no se ha probado el comportamiento con ventanas extensas.
- Decodificacion especulativa: los pesos MTP se incluyen pero no estan certificados; debe mantenerse desactivada.
- Requisito de offload: la unica configuracion validada uso `cpu_offload_gb=12.0`, lo que implica dependencia de memoria del sistema y latencia adicional.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base.
- Licencia: Apache-2.0 en los pesos, pero debe conservarse la politica de uso upstream de Qwen; la licencia de AXQuant no sustituye la del modelo fuente.
- Fijar commit: dado que el repositorio sera reconstruido, conviene fijar una revision concreta si se depende del artefacto actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.5-9B-CUDA-AXQ-NVFP4-W4A16-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Paper, blog, repositorio o demo de AXQuant: no disponible en la informacion proporcionada.
