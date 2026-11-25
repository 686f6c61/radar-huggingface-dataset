# nchapman/Qwen3.8-27B-W4A16-HGPTQ

## Resumen

Qwen3.8-27B-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo denso multimodal Qwen/Qwen3.8-27B, el modelo insignia de Qwen para codigo, razonamiento, seguimiento de instrucciones y tareas de vision. La cuantizacion la firma nchapman mediante la tecnica HGPTQ (GPTQ con rotacion de Hadamard) sobre el formato `compressed-tensors`, con pesos empaquetados de 4 bits y una cabeza de salida en 8 bits. El objetivo es claro: reducir un modelo de 51,75 GiB en BF16 a 16,14 GiB en disco (3,2 veces mas pequeno) para que quepa en una unica GPU de 24 GB.

El modelo base emplea una arquitectura de atencion hibrida de Qwen disenada para contexto largo y rapido, e incorpora Multi-Token Prediction (MTP) integrado para decodificacion especulativa. Esta version cuantizada calibra conjuntamente el backbone de texto, el codificador de vision y el drafter MTP, algo que muchos cuants de 4 bits omiten o dejan sin calibrar. Segun la model card, el resultado es casi sin perdida de calidad: 85,99 % de media agregada en IFEval, MATH-500 y HumanEval+, frente al 86,90 % del modelo completo en 16 bits.

Su relevancia practica radica en la combinacion de tamano, contexto y capacidades: permite servir un modelo multimodal de 29.105 millones de parametros con ventanas de 128K a 256K tokens en hardware de consumo (RTX 3090 o RTX 4090), algo que el modelo original en BF16 no permite sin recurrir a GPUs de datacenter o a sharding. La licencia Apache 2.0 anade flexibilidad para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida (Qwen3.5) y Multi-Token Prediction (MTP) para decodificacion especulativa |
| Parametros totales | 29.105.255.152 (29,1 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K-256K tokens en warp34 (segun model card); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits) con GPTQ + rotacion de Hadamard; cabeza de salida en 8 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de aproximadamente 29,1 mil millones de parametros con atencion hibrida, una variante que combina mecanismos de atencion para mantener eficiencia en contextos largos. Incluye MTP (Multi-Token Prediction), que actua como drafter interno para decodificacion especulativa y acelera la generacion. Es multimodal: procesa imagen y texto como entrada y genera texto (pipeline `image-text-to-text`).

Esta version concreta no reentrena el modelo, sino que lo cuantiza. El proceso HGPTQ aplica GPTQ junto con rotacion de Hadamard para redistribuir valores atipicos antes de la cuantizacion, lo que reduce el error en pesos de 4 bits. La calibracion cubre de forma conjunta el backbone de texto, el codificador de vision y el drafter MTP, con la cabeza de salida preservada en 8 bits. El resultado son pesos empaquetados de 4 y 8 bits con kernels CUDA nativos en warp34 sin flags adicionales. No se dispone de datos sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion del dataset o el uso de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso, incluido razonamiento matematico (evaluado en MATH-500).
- Generacion y comprension de codigo (evaluado en HumanEval+).
- Seguimiento de instrucciones estricto (evaluado en IFEval).
- Vision: entrada de imagen y texto (`image-text-to-text`), con codificador de vision calibrado en esta cuantizacion.
- Decodificacion especulativa mediante el drafter MTP integrado.
- Contexto largo de hasta 128K-256K tokens en warp34.
- Compatibilidad con vLLM 0.34+ y con el runtime warp34.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local: con 16,14 GiB en disco y HumanEval+ del 93,3 %, el modelo puede ejecutarse en una RTX 4090 para autocompletado, refactorizacion y generacion de tests sin enviar codigo a servicios externos.
- Analisis de documentos largos: la ventana de 128K-256K tokens en warp34 permite procesar informes, contratos o bases de codigo extensas en una sola pasada, manteniendo el contexto completo sin trocear.
- Procesamiento de documentos escaneados con vision: al incluir un codificador de vision calibrado, puede extraer informacion de imagenes de facturas, formularios o capturas y responder preguntas sobre ellas.
- Razonamiento matematico asistido: con un 82,8 % en MATH-500, es adecuado para tutoria, verificacion de calculos y resolucion de problemas paso a paso en entornos educativos o de ingenieria.
- Despliegue en estaciones de trabajo con una sola GPU: sirve como backend de un asistente interno mediante `vllm serve` o `warp34 serve` en hardware de 24 GB, sin necesidad de infraestructura de datacenter.
- Generacion aumentada por recuperacion (RAG): la combinacion de contexto largo y seguimiento de instrucciones (81,9 % en IFEval) permite inyectar grandes volumenes de documentos recuperados y obtener respuestas fieles al formato solicitado.
- Prototipado de agentes multimodales: el drafter MTP acelera la generacion y la compatibilidad con vLLM facilita integrarlo en pipelines de agentes que alternan texto e imagen.

## Benchmarks y rendimiento

Datos publicados en la model card para esta cuantizacion frente al modelo completo en 16 bits:

| Benchmark | Qwen3.8-27B-W4A16-HGPTQ | Qwen3.8-27B (16 bits) |
|---|---|---|
| IFEval | 81,9 % | No disponible por benchmark |
| MATH-500 | 82,8 % | No disponible por benchmark |
| HumanEval+ | 93,3 % | No disponible por benchmark |
| Media agregada (tres benchmarks) | 85,99 % | 86,90 % |

El modelo completo solo reporta la media agregada (86,90 %); los valores desglosados por benchmark para la version de 16 bits no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: 16,14 GiB de pesos en disco; con overhead de KV cache, vision y drafter, encaja en una GPU de 24 GB dejando espacio para 128K-256K de contexto en warp34.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) como objetivo principal segun el autor; GPUs de datacenter (A100, H100) tambien son validas pero no son el foco de optimizacion.
- GPU de consumo: si, cabe en RTX 3090 y RTX 4090. Para GPUs de 16 GB existe la variante W2.6A16 del mismo autor (12,20 GiB).
- Opciones de despliegue: warp34 (`warp34 serve`), vLLM 0.34+ (`vllm serve ... --trust-remote-code`) y transformers con `trust_remote_code`. Soporte de llama.cpp u Ollama: no disponible.
- Latencia y throughput: no se publican cifras concretas; la model card indica que warp34 ejecuta kernels CUDA a plena velocidad y que el drafter MTP acelera la generacion, pero sin numeros de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-W4A16-HGPTQ | 29,1 B (denso) | 128K-256K (warp34) | W4A16 GPTQ + Hadamard | Apache 2.0 | Multimodal, MTP, 16,14 GiB |
| Qwen3.8-27B (BF16) | 29,1 B (denso) | No disponible | 16 bits | Apache 2.0 | Referencia de calidad, 51,75 GiB |
| Qwen3.8-27B-W2.6A16-HGPTQ-RCO | 29,1 B (denso) | No disponible | W2.6A16 | Apache 2.0 | Variante de 12,20 GiB para GPUs de 16 GB |
| Qwen3.8-27B-DFlash2-W4A16-HGPTQ | No disponible | No disponible | W4A16 | No disponible | Drafter DFlash2 de 4 bits para generacion mas rapida |

Las tres variantes comparten el mismo modelo base y autor, por lo que la eleccion depende del presupuesto de VRAM y de la necesidad de velocidad. No se dispone de datos de benchmarks de las variantes W2.6A16 ni DFlash2 en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la media agregada baja de 86,90 % a 85,99 %, una diferencia pequena pero medible; en tareas sensibles a precision conviene validar el comportamiento.
- Idiomas soportados no documentados: la model card no detalla la cobertura linguistica, por lo que no se puede garantizar un rendimiento uniforme fuera del ingles.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas para esta cuantizacion.
- Sesgos: no se publica informacion sobre sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Dependencia de `trust_remote_code`: tanto en transformers como en vLLM se requiere `--trust-remote-code`, lo que implica ejecutar codigo del repositorio; conviene auditar los ficheros antes de desplegar en produccion.
- Optimizacion especifica para warp34: el rendimiento pleno se obtiene con este runtime; en otros backends el comportamiento puede variar y no se documentan metricas.
- Compatibilidad de vLLM limitada a 0.34+; versiones anteriores pueden no cargar el formato `compressed-tensors` con rotacion de Hadamard.
- Soporte de tool calling y agentes no documentado: no se confirma en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantizacion de terceros conviene verificar la procedencia y los terminos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante de 12,20 GiB para 16 GB: https://huggingface.co/nchapman/Qwen3.8-27B-W2.6A16-HGPTQ-RCO
- Drafter DFlash2 de 4 bits: https://huggingface.co/nchapman/Qwen3.8-27B-DFlash2-W4A16-HGPTQ
- Runtime warp34: https://github.com/nchapman/warp34
- Repositorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md (referenciado en la model card, sin URL directa disponible)
