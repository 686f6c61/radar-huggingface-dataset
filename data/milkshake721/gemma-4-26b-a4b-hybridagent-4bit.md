# milkshake721/Gemma-4-26B-A4B-HybridAgent-4bit

## Resumen

Gemma-4-26B-A4B-HybridAgent-4bit es una cuantizacion de 4 bits del modelo milkshake721/Gemma-4-26B-A4B-HybridAgent, un transformer de tipo Mixture of Experts (MoE) derivado de la familia Gemma 4 de Google. El autor, milkshake721, publica esta variante optimizada para ejecutarse en una unica GPU de 24 GB (RTX 4090 o RTX 3090) mediante compresion de pesos W4A16 con `compressed-tensors` y aceleracion con TensorRT y un kernel Triton fusionado para las capas MoE.

El modelo incorpora dos rasgos distintivos: un modo de razonamiento latente (`<latent>`) que opera sobre estados ocultos continuos en lugar de tokens de texto, y un bucle de ejecucion de herramientas Python (`<python>`) integrado en el propio motor de inferencia. La cuantizacion preserva ambos mecanismos en BF16 mientras comprime unicamente los pesos de los expertos enrutados, de modo que la perdida de precision se concentra en las matrices de proyeccion de los expertos y no en las transiciones de anclaje del razonamiento latente.

La relevancia actual del modelo radica en su perfil de despliegue: un MoE de 25.805.947.470 parametros totales que cabe en 19 GB de VRAM con un rendimiento de decodificacion de 60,2 tok/s segun las mediciones del autor, lo que lo situa como una opcion viable para agentes de razonamiento y uso de herramientas en hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con razonamiento latente y bucle de herramientas Python |
| Parametros totales | 25.805.947.470 |
| Parametros activos | no disponible (la model card indica 128 expertos enrutados por capa, sin especificar el numero activo por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 simetrico (`pack-quantized`, INT4 empaquetado en int32, `group_size=32`, busqueda de escala optima por MSE) sobre expertos MoE; atencion, router, MLP compartido, embeddings y `HybridLink` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (repo de 18,9 GB); compatible con `compressed-tensors` y TensorRT |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 30 capas y 128 expertos enrutados por capa (`experts.{0..127}.{gate,up,down}_proj`). Sobre esa estructura, el autor anade un mecanismo de razonamiento latente que utiliza tokens de anclaje especificos (`token_id=262144` para entrada y `262145` para salida) y una recurrencia continua sobre estados ocultos con `embed_scale = sqrt(2816)`. El bucle de herramientas Python se gestiona mediante un componente denominado `HybridLink` (`hybridlink.pt`), que se compila como motor nativo de TensorRT (`ICudaEngine`) y que da soporte a la ejecucion multi-paso del agente.

La cuantizacion afecta exclusivamente a los pesos de los expertos enrutados, que pasan de 45,68 GB en BF16 a 12,85 GB en INT4. El resto de componentes (atencion, router, MLP compartido, embeddings y `HybridLink`) se mantiene en BF16 para no degradar las transiciones de anclaje del razonamiento latente. La aceleracion se apoya en tres piezas: un kernel Triton fusionado (`_fused_w4a16_moe_kernel`) que descomprime los pesos INT4 y calcula el producto punto con la activacion dentro de registros y SRAM de la GPU sin materializar los pesos BF16 en HBM; la sustitucion de las 330 llamadas a `Gemma4RMSNorm` por paso por `F.rms_norm` en C++; y la compilacion del bloque post-atencion (FFN, MLP compartido, router y MoE de 4 bits) en un unico grafo fusionado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento aritmetico y logico, con ejemplos verificados en la model card sobre geometria (perimetro y area de un rectangulo) y algebra lineal (resolucion de ecuaciones).
- Razonamiento latente (`<latent>`): el modelo puede iterar sobre estados ocultos continuos antes de emitir la respuesta final, con un limite configurable de pasos (`max_latent_steps=64` en el ejemplo del autor).
- Ejecucion de herramientas Python (`<python>`): bucle integrado de ejecucion de codigo que el motor gestiona de forma nativa.
- Uso como agente multi-paso: la clase `HybridEngine` expone una trayectoria (`traj`) con respuesta final, numero de pasos latentes y salida renderizada.
- Compatibilidad con dos backends de inferencia: TensorRT (`backend="tensorrt"`) y SGLang (`--backend sglang` o `sglang.launch_server`).
- Capacidades multilingues: no disponible.
- Soporte de vision o audio: no disponible.
- Soporte de tool calling generico (function calling estructurado fuera del bucle Python): no disponible.

## Casos de uso

- Razonamiento matematico con verificacion: el modelo resuelve problemas aritmeticos y algebraicos con modo latente y temperatura 0,0, lo que permite usarlo en pipelines de evaluacion automatizada donde se requiere una respuesta determinista y trazable (la trayectoria expone los pasos latentes).
- Agentes que ejecutan codigo Python: el bucle `<python>` integrado permite que el modelo escriba y ejecute fragmentos de codigo para calcular resultados, validar hipotesis o transformar datos, sin necesidad de un orquestador externo.
- Despliegue en estaciones de trabajo con una sola GPU: al ocupar 19 GB de VRAM, el modelo cabe en una RTX 4090 o RTX 3090, lo que facilita prototipos de agentes en hardware de consumo sin recurrir a clusteres multi-GPU.
- Servicio de inferencia con SGLang: el autor documenta el arranque de un servidor SGLang con `--quantization compressed-tensors` y `--mem-fraction-static 0.80`, adecuado para exponer el modelo como API interna en un equipo con GPU unica.
- Evaluacion comparativa de cuantizacion: la model card incluye scripts (`eval_gemma4_26b_hybrid.py`, `test_gemma4_26b_hybrid.py`) que permiten reproducir el benchmark de 10 preguntas y comparar W4A16 frente a BF16 en el mismo hardware.
- Investigacion sobre razonamiento latente: el modo `<latent>` con anclajes de token y recurrencia continua sobre estados ocultos es un objeto de estudio util para quienes investigan tecnicas de razonamiento sin tokens intermedios explicitos.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se midieron en una NVIDIA RTX PRO 6000 Blackwell con un benchmark de 10 preguntas de matematicas y logica.

| Configuracion | VRAM asignada | Prefill (180 tok) | Decodificacion por token | Tiempo total 10 preguntas | Tiempo medio por pregunta | Precision 10 preguntas |
|---|---|---|---|---|---|---|
| BF16 completo (`backend="tensorrt"`) | 54,73 GB | 313,03 ms | 26,01 ms (38,5 tok/s) | 106,80 s | 10,68 s | 10/10 (100 %) |
| 4-bit W4A16 (`backend="tensorrt"`, Triton fusionado + `F.rms_norm` + FFN compilado) | 19,00 GB | 187,51 ms | 16,62 ms (60,2 tok/s) | 83,65 s | 8,36 s | 10/10 (100 %) |

El kernel Triton W4A16 consume 2,02 ms por token en las 30 capas MoE, lo que el autor describe como 2,28 veces mas rapido que BF16. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 19,00 GB asignados en la configuracion W4A16 medida por el autor; el modelo base en BF16 requiere 54,73 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 de 24 GB para la version 4-bit; NVIDIA RTX PRO 6000 Blackwell para las mediciones publicadas; el modelo BF16 necesita GPUs de 80 GB (A100, H100) o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 de 24 GB segun la model card.
- Opciones de despliegue: TensorRT via `torch_tensorrt` (backend recomendado), SGLang (`sglang.launch_server` con `--quantization compressed-tensors`), y el runner CLI `sglang_tensorrt_runner.py` incluido en el repositorio.
- Latencia y throughput medidos: prefill de 187,51 ms para 180 tokens y decodificacion de 60,2 tok/s en la RTX PRO 6000 Blackwell con la configuracion 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-HybridAgent-4bit (este modelo) | 25.805.947.470 | no disponible | gemma | safetensors, compressed-tensors | 19 GB VRAM, 60,2 tok/s en RTX PRO 6000 Blackwell |
| Gemma-4-26B-A4B-HybridAgent (modelo base) | no disponible | no disponible | gemma | safetensors | Version BF16, 54,73 GB VRAM, 38,5 tok/s en el mismo hardware |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la documentacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion W4A16 se aplica solo a los expertos MoE; el resto de componentes permanece en BF16. Cualquier modificacion del pipeline que altere esa separacion puede degradar el razonamiento latente.
- El benchmark publicado consta de solo 10 preguntas de matematicas y logica, por lo que la precision del 100 % no es extrapolable a tareas generales.
- Las mediciones de rendimiento se realizaron en una NVIDIA RTX PRO 6000 Blackwell; el rendimiento en RTX 4090 o RTX 3090 puede diferir y no se documenta en la informacion disponible.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, idiomas soportados ni evaluaciones de seguridad.
- La licencia es `gemma`, sujeta a los terminos de uso de Google para la familia Gemma; es necesario revisar las restricciones de uso comercial antes de desplegar el modelo en produccion.
- El modelo depende de codigo personalizado (`hybrid_agent`, `HybridLink`, `trust-remote-code`) y de kernels Triton y TensorRT especificos, lo que incrementa el riesgo de incompatibilidad con versiones futuras de las librerias.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa muy limitada.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas.

## Enlaces

- HuggingFace: https://huggingface.co/milkshake721/Gemma-4-26B-A4B-HybridAgent-4bit
- Modelo base: https://huggingface.co/milkshake721/Gemma-4-26B-A4B-HybridAgent
- Script de evaluacion: `eval_gemma4_26b_hybrid.py` (incluido en el repositorio)
- Notas de benchmark y optimizacion: `BENCHMARK_AND_OPTIMIZATION_NOTES.md` (incluido en el repositorio)
- Script de verificacion: `test_gemma4_26b_hybrid.py` (incluido en el repositorio)
- Runner CLI: `sglang_tensorrt_runner.py` (incluido en el repositorio)
