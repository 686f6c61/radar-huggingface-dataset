# Baidu-Baige/KODA-35B

## Resumen

KODA-35B es un modelo de generacion y optimizacion de kernels CUDA desarrollado por Baidu-Baige, afinado a partir de Qwen3.6-35B-A3B. Su proposito es recibir una implementacion de referencia (por ejemplo, una funcion en PyTorch) y proponer un kernel CUDA equivalente, revisandolo de forma iterativa a lo largo de varias rondas con la ayuda de diagnosticos del compilador, tests de correccion, mediciones de tiempo de ejecucion y realimentacion del perfilador que le proporciona el agente KODA.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) heredada del modelo base, con 35.107.181.936 parametros totales y aproximadamente 3.000 millones activos en inferencia, lo que permite servir un modelo de gran capacidad con un coste computacional por token relativamente bajo. Se distribuye en formato safetensors para la libreria transformers y esta pensado para integrarse en un bucle agente de compilacion y evaluacion en sandboxes gestionados.

Su relevancia actual radica en la especializacion: frente a su modelo base, mejora la correccion en 35,2 puntos porcentuales en KernelBench y 31,1 puntos en SOL-ExecBench segun los datos publicados por el autor, y alcanza un speedup mediano de 3,15x y 2,10x respectivamente. Es, por tanto, una herramienta orientada a la optimizacion de codigo de bajo nivel para GPU, no un modelo conversacional de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_5_moe), afinado desde Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Hugging Face transformers) |

## Arquitectura y entrenamiento

KODA-35B es un ajuste fino (fine-tune) del modelo Qwen3.6-35B-A3B, que emplea una arquitectura de tipo Mixture-of-Experts con etiqueta `qwen3_5_moe` en transformers. El repositorio incluye pesos, tokenizer y configuracion en formato Hugging Face, con un tamano total de 70,2 GB. El modelo conserva la modalidad image-text-to-text del pipeline declarado, si bien su especializacion es la generacion de codigo CUDA.

El entrenamiento se ha orientado a la adaptacion de dominio (Domain Adaptation) para optimizacion de kernels. Segun la model card, el modelo se entrena para revisar sus propuestas a lo largo de rondas usando senales del agente KODA: diagnosticos del compilador, tests de correccion, mediciones de runtime y realimentacion del perfilador. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos mas alla de los propios del modelo base.

## Capacidades

- Generacion de kernels CUDA a partir de implementaciones de referencia.
- Refinamiento iterativo de kernels en multiples rondas usando diagnosticos del compilador, tests de correccion, mediciones de tiempo y perfilado.
- Razonamiento sobre codigo de bajo nivel y optimizacion de rendimiento (speedups medidos en benchmarks).
- Integracion con un bucle agente externo (KODA agent) que compila y evalua candidatos en sandboxes gestionados.
- Capacidad multimodal image-text-to-text heredada del pipeline declarado (no se detalla su alcance en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Optimizacion de kernels en produccion: dado un kernel CUDA existente o una implementacion de referencia en PyTorch, el modelo propone variantes y las refina con la realimentacion del agente KODA para reducir latencia en cargas reales.
- Aceleracion de operadores en pipelines de inferencia: generar kernels especializados para operaciones frecuentes (matmul, atencion, normalizaciones) y validar su correccion y speedup antes de integrarlos.
- Migracion de codigo a CUDA: partir de implementaciones de referencia y obtener una version CUDA funcional que pase tests de correccion, reduciendo el trabajo manual de traduccion.
- Bucle agente de compilacion y evaluacion: conectar el modelo via vLLM o SGLang al agente KODA para que compile y mida candidatos en sandboxes aislados y devuelva los resultados al modelo.
- Investigacion en generacion de codigo de bajo nivel: usar el modelo como base para estudiar tecnicas de adaptacion de dominio aplicadas a la sintesis de kernels y a la optimizacion guiada por perfilado.
- Exploracion de optimizaciones guiadas por profiler: emplear la realimentacion del perfilador para que el modelo proponga cambios de memoria, ocupacion o vectorizacion en funcion de las metricas observadas.
- Evaluacion comparativa de generadores de kernels: servir el modelo y medirlo sobre KernelBench o SOL-ExecBench con el agente para obtener metricas reproducibles de correccion y speedup.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card.

KernelBench (270 problemas):

| Modelo | Correccion | Fast@1 | Fast@2 | Speedup mediano |
|---|---:|---:|---:|---:|
| KODA-35B | 95,6% | 88,9% | 61,9% | 3,15x |
| Qwen3.6-35B-A3B (base) | 60,4% | 24,1% | 10,7% | 0,94x |
| Qwen3.8-Flash-Next | 94,8% | 82,2% | 51,9% | 2,27x |
| DeepSeek-V4.1-Flash-1017 | 92,6% | 90,0% | 70,4% | 4,31x |
| DeepSeek-V4-Flash-0731 | 95,6% | 77,4% | 52,6% | 2,26x |
| GLM-5.3 | 94,1% | 84,4% | 62,6% | 2,97x |
| GLM-5.3-Flash | 95,6% | 80,0% | 48,1% | 2,02x |
| Kimi-K3 | 93,7% | 84,8% | 64,1% | 2,99x |
| MiMo-v2.6-Flash-MOPD | 89,6% | 71,1% | 39,6% | 1,72x |
| Recursive-Flint-40B | 68,9% | 18,1% | 9,3% | 0,48x |
| MusaCoder-27B | 73,0% | 26,7% | 14,1% | 0,95x |
| Kevin-32B | 5,2% | 1,1% | 0,7% | 0,64x |
| IndustrialCoder-32B-Thinking | 23,7% | 3,0% | 1,1% | 0,27x |

SOL-ExecBench (202 problemas con muestreo de carga fijo):

| Modelo | Correccion | Fast@1 | Fast@2 | Speedup mediano |
|---|---:|---:|---:|---:|
| KODA-35B | 95,5% | 78,7% | 48,0% | 2,10x |
| Qwen3.6-35B-A3B (base) | 64,4% | 17,8% | 8,9% | 0,73x |
| Qwen3.8-Flash-Next | 95,5% | 74,8% | 44,1% | 1,70x |
| DeepSeek-V4.1-Flash-1017 | 91,6% | 81,7% | 54,5% | 3,15x |
| DeepSeek-V4-Flash-0731 | 98,0% | 67,3% | 41,1% | 1,37x |
| GLM-5.3 | 93,6% | 78,7% | 50,0% | 2,28x |
| GLM-5.3-Flash | 96,0% | 72,8% | 43,6% | 1,57x |
| Kimi-K3 | 94,6% | 78,2% | 44,6% | 1,81x |
| MiMo-v2.6-Flash-MOPD | 82,2% | 57,4% | 32,7% | 1,43x |
| Recursive-Flint-40B | 65,8% | 13,4% | 8,4% | 0,30x |
| MusaCoder-27B | 71,3% | 26,7% | 14,9% | 0,87x |
| Kevin-32B | 2,5% | 0,0% | 0,0% | 0,74x |
| IndustrialCoder-32B-Thinking | 25,7% | 3,5% | 2,0% | 0,59x |

Segun el autor, frente a su modelo base KODA-35B mejora la correccion en 35,2 puntos en KernelBench y 31,1 puntos en SOL-ExecBench. Empata en la mayor correccion de KernelBench y alcanza el segundo mayor speedup mediano en esa comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 35.107 millones de parametros totales y unos 3.000 millones activos, los pesos en safetensors ocupan aproximadamente 70,2 GB en el repositorio (equivalente a precision BF16/FP16). En cuantizaciones de 8 bits o 4 bits el requisito de memoria se reduce de forma proporcional, pero el autor no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamano, el despliegue en BF16 requiere GPUs de gran memoria (clase A100 80 GB, H100 80 GB o configuraciones multi-GPU).
- Cabe en GPU de consumo: no disponible; el tamano de pesos en BF16 excede la VRAM de las GPUs de consumo habituales, por lo que requeriria cuantizacion o reparto entre varias GPU.
- Opciones de despliegue: el autor recomienda servir el modelo con vLLM o SGLang y conectar su API al agente KODA. Tambien es compatible con transformers. La model card no menciona llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que el servicio del modelo y la evaluacion de kernels usan recursos GPU separados.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (generacion de kernels), segun los datos publicados por el autor.

| Modelo | Parametros totales | Contexto | KernelBench (correccion / speedup mediano) | SOL-ExecBench (correccion / speedup mediano) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| KODA-35B | 35,1B (aprox. 3B activos) | no disponible | 95,6% / 3,15x | 95,5% / 2,10x | Apache 2.0 | Hugging Face (Baidu-Baige/KODA-35B) |
| Qwen3.6-35B-A3B | 35B (aprox. 3B activos) | no disponible | 60,4% / 0,94x | 64,4% / 0,73x | no disponible | Hugging Face (Qwen/Qwen3.6-35B-A3B) |
| DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | 92,6% / 4,31x | 91,6% / 3,15x | no disponible | no disponible |
| GLM-5.3 | no disponible | no disponible | 94,1% / 2,97x | 93,6% / 2,28x | no disponible | no disponible |

KODA-35B destaca por combinar una correccion alta con un coste de parametros activos bajo, aunque DeepSeek-V4.1-Flash-1017 obtiene mejores speedups medianos en ambos benchmarks y DeepSeek-V4-Flash-0731 logra mayor correccion en SOL-ExecBench.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta afinado para generacion y optimizacion de kernels CUDA; su uso como modelo conversacional general no esta documentado.
- Dependencia del agente: el flujo de refinamiento iterativo requiere el agente KODA y sandboxes de compilacion y evaluacion; sin ese bucle, el rendimiento puede diferir del reportado.
- Riesgo de alucinacion en codigo: como generador de codigo, puede producir kernels que compilan pero son incorrectos; los tests de correccion del agente son imprescindibles antes de usar cualquier salida en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la model card.
- Recursos de hardware: el despliegue en BF16 exige memoria de GPU considerable (pesos de aproximadamente 70,2 GB) y el autor recomienda separar los recursos de servicio del modelo y de evaluacion de kernels.
- Licencia: Apache 2.0 permite uso comercial, pero el codigo del agente y los datasets de benchmark tienen sus propias licencias, que deben revisarse por separado.
- Datos de benchmarks: los resultados proceden del propio autor; no se dispone de verificacion independiente en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baidu-Baige/KODA-35B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del agente KODA: https://github.com/baidu-baige/KODA
- Paper: no disponible
- Blog o demo: no disponible
