# g-factor-technologies/Qwen3.8-27B-GFT-Triton-Kernels-LoRA

## Resumen

Qwen3.8-27B-GFT-Triton-Kernels-LoRA es un adaptador LoRA desarrollado por g-factor-technologies sobre el modelo base Qwen/Qwen3.8-27B. Su propósito es muy específico: reescribir módulos de PyTorch como kernels de GPU en Triton, siguiendo el formato de evaluación de KernelBench. No es un modelo de propósito general, sino un especialista entrenado para generar código de kernels GPU que compile, sea correcto y, cuando sea posible, más rápido que la ejecución eager de PyTorch.

El adaptador se entrenó en dos fases: primero un ajuste supervisado (SFT) sobre el dataset GFT-Triton-Kernels-SFT-H100-Verified, y después aprendizaje por refuerzo (GRPO/CISPO) en un entorno de evaluación real sobre una NVIDIA H100, donde cada respuesta se compilaba, verificaba y medía. El resultado es un adaptador de bajo rango (rango 8 según la configuración de despliegue) que se aplica sobre el modelo base de 27B de Qwen.

Es relevante porque aborda una tarea de nicho con verificación objetiva: la generación de kernels Triton correctos y eficientes. Los resultados publicados muestran mejoras claras en corrección respecto al modelo base (del 21,5% al 29,5% en tasa de acierto agregada), aunque las mejoras en velocidad son marginales y el nivel 2 de KernelBench apenas experimenta avances. La licencia Apache 2.0 y el formato PEFT facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.8-27B; rango 8 segun el comando de despliegue con vLLM |
| Parametros totales | No disponible para el adaptador; modelo base Qwen3.8-27B (27B nominales) |
| Parametros activos | No disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se distribuyen en safetensors y la inferencia de referencia usa BF16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); dos copias con nombres de tensor distintos: raiz para Transformers/PEFT (`model.layers.*`) y subcarpeta `vllm/` para vLLM (`model.language_model.layers.*`) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.8-27B, un transformer de 27B de parametros del que no se detallan en la informacion proporcionada ni la composicion del dataset de preentrenamiento ni innovaciones arquitectonicas internas. Lo relevante es el proceso de especializacion: un LoRA de bajo rango entrenado en dos etapas. La primera es un ajuste supervisado sobre el dataset GFT-Triton-Kernels-SFT-H100-Verified, que aporta ejemplos de reescritura de modulos PyTorch a kernels Triton. La segunda es aprendizaje por refuerzo (las etiquetas mencionan GRPO y CISPO) dentro de un entorno tipo gimnasio de kernels GPU, donde cada respuesta generada se compila, se verifica su correccion contra la implementacion de referencia y se cronometra en una NVIDIA H100.

La innovacion principal es ese bucle de RL con verificacion real en hardware: la recompensa no depende de un juez humano ni de un modelo evaluador, sino de si el kernel compila, produce resultados correctos con tolerancias FP32 (`atol = rtol = 1e-4`) sobre cinco entradas aleatorias y cuanto tarda respecto a PyTorch eager (media de 100 ejecuciones con eventos CUDA). El entorno de referencia es KernelBench en la revision `423217d`, backend Triton, niveles 1 y 2, con PyTorch 2.9.1, Triton 3.5.1 y CUDA 13.0.

## Capacidades

- Generacion de kernels Triton: a partir del prompt one-shot de KernelBench sobre un modulo PyTorch con `get_inputs()` y `get_init_inputs()`, produce un bloque Python delimitado que define `ModelNew` con la misma interfaz y un `forward` implementado con kernels `@triton.jit`.
- Fusion de operadores: orientado a combinar secuencias de operadores (nivel 2 de KernelBench), aunque los resultados publicados indican que rara vez logra fusiones efectivas.
- Generacion de codigo Python verificable: el resultado se compila y ejecuta, por lo que la salida es codigo funcional, no pseudocodigo.
- Razonamiento tecnico sobre GPU: seleccion de estrategias de tiling, gestion de memoria y paralelizacion propias de Triton.
- Modo thinking desactivable: los ejemplos usan `enable_thinking=False`; el modo pensamiento del modelo base esta disponible pero no es el recomendado para esta tarea.
- Tool calling y agentes: no disponible en la informacion proporcionada para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision o audio: no disponible.

## Casos de uso

- Optimizacion de capas criticas en produccion: dado un modulo PyTorch que consume tiempo en un pipeline de inferencia, el adaptador propone una version Triton que puede sustituir a la original si supera las pruebas de correccion y tiempo. Es adecuado porque su entrenamiento se basa exactamente en esa reescritura con verificacion en H100.
- Generacion asistida de kernels para operadores personalizados: para operadores que no existen en las librerias estandar (activaciones raras, normalizaciones especificas), el modelo produce un punto de partida compilable que el ingeniero puede revisar y ajustar.
- Aumento de datasets de entrenamiento de codigo GPU: las respuestas generadas, tras pasar el filtro de compilacion y correccion, pueden incorporarse como ejemplos verificados en datasets internos de kernels.
- Educacion y formacion interna: como referencia de como se traduce un modulo PyTorch a Triton con tiling y gestion de bloques, util para formar a ingenieros en programacion de GPU.
- Evaluacion comparativa de modelos en tareas de codigo GPU: sirve como linea base especializada frente a modelos generalistas al medir tasas de compilacion, correccion y speedup en KernelBench.
- Prototipado rapido en investigación de compiladores: para explorar variantes de fusion de operadores (nivel 2) antes de invertir en implementaciones manuales, aceptando que la tasa de exito en fusion es baja.
- Integracion en pipelines de CI con vLLM: el adaptador se sirve con `--enable-lora --max-lora-rank 8` y se consulta via API compatible con OpenAI, lo que permite automatizar la generacion de kernels como un paso mas del pipeline.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre KernelBench (Triton, niveles 1 y 2, 200 problemas, una respuesta greedy por problema, temperatura 0, thinking off, maximo 8192 tokens nuevos, BF16, H100 80GB HBM3):

| Metrica | Modelo base | Tras SFT | Este adaptador (SFT + RL) |
|---|---|---|---|
| Ran (L1 / L2) | 83 / 76 | 81 / 92 | 83 / 94 |
| Correctos (L1 / L2) | 31 / 12 | 43 / 9 | 47 / 12 |
| Correctos y mas rapidos que eager (L1 / L2) | 8 / 6 | 13 / 3 | 15 / 4 |
| fast₀ (tasa de correccion) | 21,5% | 26,0% | 29,5% |
| fast₁ | 7,0% | 8,0% | 9,5% |
| fast₁.₅ | 5,0% | 5,0% | 6,0% |
| fast₂ | 3,5% | 4,5% | 5,0% |
| fast₁ frente a `torch.compile(mode="max-autotune")` | 12,5% | 15,0% | 16,0% |

Lectura de los datos segun el propio autor: la mejora principal esta en correccion (nivel 1 pasa de 31 a 47 kernels correctos, con la mayor parte del avance en la fase SFT); la mejora de velocidad es pequena (de 14 a 19 de 200 problemas mas rapidos que eager, diferencias dentro del ruido con una sola respuesta); el nivel 2 no mejora en correccion (12 antes y despues); el kernel correcto mediano corre a 0,98x de eager; el checkpoint se selecciono sobre este mismo benchmark (pasos 100, 150, 200 y 300 dieron fast₁ de 9,5%, 9,5%, 8,5% y 8,0%), lo que hace la cifra ligeramente optimista; y los resultados provienen de una sola semilla. El autor advierte de que no deben compararse directamente con el paper de KernelBench, que uso CUDA sobre L40S y difiere en subconjuntos de niveles, numero de intentos, lineas base y tolerancias.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. El adaptador ocupa 0,2 GB en el repositorio; la inferencia requiere cargar el modelo base Qwen3.8-27B en BF16, lo que implica del orden de decenas de GB de VRAM, aunque no se confirma la cifra exacta.
- GPU de referencia para entrenamiento y evaluacion: NVIDIA H100 80GB HBM3.
- GPU recomendadas para inferencia: H100 (configuracion usada en los benchmarks) y A100 80GB como alternativa plausible; no se documentan mediciones en otras GPU.
- GPU de consumo: no disponible. No se aportan datos sobre RTX 4090 u otras tarjetas consumer; el tamano del modelo base hace poco probable un despliegue comodo en VRAM consumer sin cuantizacion, que no esta documentada.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 8 --max-model-len 16384` y `--lora-modules gft-kernels=./gft-kernels/vllm`; alternativamente Transformers + PEFT con `PeftModel.from_pretrained` en `torch.bfloat16` y `device_map="auto"`.
- Latencia y throughput: no disponibles como cifras absolutas; los benchmarks reportan tiempos relativos a PyTorch eager en H100.
- Nota de despliegue: es imprescindible usar la copia de pesos adecuada; la raiz del repositorio usa `model.layers.*` (Transformers/PEFT) y la subcarpeta `vllm/` usa `model.language_model.layers.*` (vLLM). Son identicas salvo en los nombres de tensor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Resultado en KernelBench (fast₀) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-GFT-Triton-Kernels-LoRA | Adaptador sobre 27B | No disponible (ejemplo con 16384) | LoRA especializado en kernels Triton con RL verificado en H100 | 29,5% | Apache 2.0 |
| Qwen3.8-27B (base) | 27B | No disponible | Modelo generalista | 21,5% | No disponible en la informacion proporcionada |
| Qwen3.8-27B + SFT (etapa intermedia) | 27B | No disponible | Solo ajuste supervisado | 26,0% | No disponible |
| KernelBench con CUDA (paper, L40S) | No aplica | No aplica | Evaluacion de referencia con kernels CUDA | No comparable directamente (distinto backend, hardware y protocolo) | No aplica |

No se dispone en la informacion proporcionada de otros adaptadores o modelos especializados en generacion de kernels Triton con los que establecer una comparacion directa de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado para el prompt one-shot de KernelBench con backend Triton; fuera de ese formato su comportamiento no esta caracterizado.
- Nivel 2 sin mejora: la correccion en secuencias de operadores que requieren fusion se mantiene en 12 de 100, igual que el modelo base; la fusion real rara vez se produce.
- Velocidad marginal: solo 19 de 200 problemas superan a eager; el kernel correcto mediano corre a 0,98x, es decir, ligeramente mas lento.
- Seleccion de checkpoint sobre el benchmark: el checkpoint reportado se eligio maximizando fast₁ en el mismo conjunto de evaluacion, lo que introduce un sesgo optimista en las cifras publicadas.
- Una sola semilla: los resultados no incluyen intervalos de confianza ni repeticiones; diferencias de 1 a 3 problemas estan dentro del ruido.
- Idioma: solo ingles segun la model card; el prompt y la salida esperada estan en ese idioma.
- Riesgo de alucinacion en codigo: puede generar kernels que compilan pero no son correctos o que dependen de supuestos no declarados sobre formas y tipos de tensor; la verificacion con entradas aleatorias y tolerancias FP32 es obligatoria antes de usar el codigo en produccion.
- Dependencia del entorno: los resultados se midieron con PyTorch 2.9.1, Triton 3.5.1 y CUDA 13.0 sobre H100; otras versiones o GPU pueden alterar compilacion y rendimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B, no detallada en la informacion proporcionada.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Advertencia de comparacion: no comparar las cifras con el paper de KernelBench sin ajustar backend (CUDA frente a Triton), hardware (L40S frente a H100), subconjuntos de niveles, numero de intentos y tolerancias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-factor-technologies/Qwen3.8-27B-GFT-Triton-Kernels-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de SFT: https://huggingface.co/datasets/g-factor-technologies/GFT-Triton-Kernels-SFT-H100-Verified
- KernelBench (repositorio): https://github.com/ScalingIntelligence/KernelBench
- Paper de KernelBench: https://arxiv.org/abs/2502.10517
- Articulo de referencia del autor: https://www.g-ftech.com/blog/gpu-kernels-cuda-triton-torch-compile-kernelbench
- Seccion de lectura de KernelBench del articulo: https://www.g-ftech.com/blog/gpu-kernels-cuda-triton-torch-compile-kernelbench#reading-kernelbench
