# ik6626/Qwen3.8-27B-HIP-kernel-RL

## Resumen

Qwen3.8-27B-HIP-kernel-RL es un adaptador LoRA publicado por el usuario ik6626 sobre el modelo base Qwen/Qwen3.8-27B, orientado a la generación automática de kernels GPU en HIP para AMD Instinct MI300X (arquitectura gfx942, ROCm). Dado un módulo de PyTorch, el modelo devuelve un fichero `.hip` completo cuyo `forward` reproduce el mismo cálculo mediante kernels `__global__` propios. El adaptador se entrenó con aprendizaje por refuerzo sobre una única GPU MI300X, usando un grader que compila cada respuesta, la contrasta contra PyTorch con tres entradas aleatorias y la cronometra.

El interés del proyecto es doble. Por un lado, ataca un problema concreto y poco cubierto: la portabilidad de kernels de cómputo hacia el ecosistema AMD/ROCm, donde la disponibilidad de modelos especializados es mucho menor que en CUDA. Por otro, publica de forma transparente tanto las ganancias como las regresiones: la mejora es de corrección (Pass@1 de 0,335 a 0,540 en validación), no de velocidad, y más de la mitad de las respuestas correctas del adaptador son más lentas que PyTorch eager.

El adaptador tiene rango 64, pesa 1,8 GB en float32 y se distribuye bajo licencia Apache 2.0. El repositorio completo ocupa 3,6 GB e incluye el checkpoint final (paso 75 de RL), el paso 125, scripts de prompt, verificación y conversión a SGLang, además de un ejemplo de tarea resuelta. La información disponible no detalla la arquitectura interna del modelo base ni su ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-27B; arquitectura del base no disponible |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 64; el base se denomina 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para el base; evaluado a 12.288, 14.000 y 20.000 tokens |
| Tipos de cuantizacion | no disponible (adaptador en float32; el base admite las cuantizaciones habituales, sin detallar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, adapter_config.json); conversión a SGLang incluida |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y 1,8 GB en float32 que se aplica sobre Qwen/Qwen3.8-27B. El entrenamiento se realizó con aprendizaje por refuerzo sobre una sola AMD Instinct MI300X. El bucle de RL utiliza un grader determinista: cada respuesta se compila con `torch.utils.cpp_extension` para ROCm y se compara con la implementación de referencia en PyTorch con `rtol = atol = 1e-4` sobre tres entradas aleatorias; además se mide el tiempo de ejecución. La recompensa combina, por tanto, compilación correcta, equivalencia numérica y velocidad.

Los datos de entrenamiento provienen de tres conjuntos declarados en la model card: `amd/AIG-Datasets`, `BytedTsinghua-SIA/CUDA-Agent-Ops-6K` y `SakanaAI/AI-CUDA-Engineer-Archive`. No se especifica el número exacto de tareas de entrenamiento ni la composición detallada. La curva de aprendizaje sobre el conjunto held-out A muestra 0,25 al inicio del RL, 0,40 en el paso 20, 0,43 en el paso 50 (12.288 tokens), y 0,46, 0,52, 0,49 y 0,51 en los pasos 50, 75, 100 y 125 respectivamente (14.000 tokens). El checkpoint publicado como principal es el paso 75; el paso 125 se incluye en el subdirectorio `step125/`. El formato de prompt es fijo (system prompt de ingeniero de kernels para MI300X, mensaje de usuario con módulo, versión funcional e interfaz de compilación) y se aplica con `reasoning_effort="low"`.

## Capacidades

- Generación de kernels HIP completos para AMD Instinct MI300X (gfx942) a partir de un módulo de PyTorch.
- Traducción de una `nn.Module` con `get_inputs()` y `get_init_inputs()` (estilo KernelBench) a un fichero `.hip` con kernels `__global__` propios.
- Razonamiento de código orientado a compilación y equivalencia numérica: el modelo produce respuestas pensadas para compilar con `torch.utils.cpp_extension` en ROCm.
- Manejo de operaciones individuales (nivel L1), operaciones fusionadas (L2) y módulos de mayor tamaño (L3).
- Generación de código Python y C++/HIP dentro del mismo flujo de respuesta.
- Capacidad de razonamiento del modelo base (Qwen3.8-27B) preservada en gran medida, según los benchmarks de regresión.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Portabilidad de kernels de PyTorch a ROCm: dado un módulo existente, el adaptador genera un `.hip` que reproduce el cálculo en MI300X, lo que permite migrar cargas de trabajo de CUDA a HIP con verificación automática contra la referencia.
- Aceleración de operaciones concretas en pipelines de inferencia sobre AMD: para operaciones fusionadas (nivel L2) el Pass@1 sube de 0,21 a 0,50, de modo que el adaptador es útil como generador de primeras versiones de kernels que luego un ingeniero revisa y optimiza.
- Generación de candidatos en un bucle de autotuning: el modelo produce varias respuestas por tarea (la evaluación usa 4 muestras a temperatura 1) y el grader selecciona la que compila y es más rápida, lo que encaja en un pipeline de búsqueda automática.
- Formación y prototipado en entornos AMD: al ejecutarse sobre una sola MI300X, permite a equipos con hardware AMD experimentar con generación de kernels sin depender de GPUs NVIDIA.
- Construcción de datasets de kernels HIP: las respuestas correctas verificadas (169 de 800 superan 1,1× frente a PyTorch eager) pueden servir como datos de entrenamiento o evaluación para otros modelos.
- Evaluación de modelos de código en dominios específicos: el grader y los conjuntos held-out publicados permiten medir de forma reproducible la capacidad de un modelo para escribir kernels HIP correctos.
- Docencia e investigación en generación de código de bajo nivel: el ejemplo incluido (`example/`) con módulo, versión funcional y respuesta correcta sirve como material didáctico verificable.

## Benchmarks y rendimiento

Resultados de corrección (Pass@1 sobre 4 muestras por tarea a temperatura 1; ganancia con bootstrap pareado, IC 95 % sobre tareas):

| Conjunto | Base | Adaptador | Ganancia |
|---|---|---|---|
| Validación: 100 tareas (14.000 tokens) | 0,335 | 0,540 | +20,5 [14,3; 27,0] |
| Held-out A: 200 tareas (14.000 tokens) | 0,289 | 0,515 | +22,6 [18,1; 27,1] |
| Held-out A a 20.000 tokens (solo adaptador) | — | 0,536 | +2,1 [−1,5; +5,8] frente a 14.000 |

Desglose de held-out A por dificultad (14.000 tokens): L1 (operación única) 0,34 → 0,53; L2 (operaciones fusionadas) 0,21 → 0,50; L3 (módulos mayores) 0,23 → 0,51.

Otras métricas de held-out A (14.000 tokens):

| Métrica | Base | Adaptador |
|---|---|---|
| Respuestas que compilan | 0,64 | 0,78 |
| Respuestas truncadas por límite de tokens | 0,19 | 0,16 |
| Correctas y ≥ 1,1× más rápidas que PyTorch eager (de 800) | 116 | 169 |
| Aceleración mediana de las correctas frente a PyTorch eager | 1,10× | 0,90× |

Regresiones frente al base (12.288 tokens, `reasoning_effort="low"`; HumanEval+ y MBPP+ a temperatura 1, el resto greedy):

| Benchmark | Base | Adaptador | Ganancia |
|---|---|---|---|
| HumanEval+ (157 × 2) | 0,933 | 0,943 | +1,0 [−1,0; +3,2] |
| MBPP+ (375 × 2) | 0,809 | 0,821 | +1,2 [−0,1; +2,7] |
| IFEval (300, greedy) | 0,887 | 0,883 | −0,3 [−3,0; +2,3] |
| MMLU-Pro (300, greedy) | 0,790 | 0,757 | −3,3 [−6,7; 0,0] |
| MATH-500 (300, greedy) | 0,943 | 0,950 | +0,7 [−1,3; +2,7] |

## Requisitos de hardware

- Inferencia del adaptador: requiere cargar el modelo base Qwen/Qwen3.8-27B más el adaptador de 1,8 GB. La VRAM necesaria para el base no se detalla en la información disponible; el adaptador en float32 añade 1,8 GB.
- Entrenamiento: se realizó con RL sobre una sola AMD Instinct MI300X.
- GPU recomendadas: AMD Instinct MI300X (gfx942) es el objetivo declarado del modelo. No se documentan requisitos para GPUs NVIDIA ni para GPUs de consumo.
- GPU de consumo: no disponible; el tamaño del base (27B) hace improbable su ejecución en GPUs de consumo sin cuantización, pero no se aportan datos al respecto.
- Despliegue: Transformers + PEFT o SGLang (se incluye `convert_to_sglang.py`, que solo requiere `torch` y `safetensors`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El adaptador genera respuestas que se truncan en el 16 % de los casos al límite de 14.000 tokens, lo que da una idea del orden de longitud de las salidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-HIP-kernel-RL | LoRA sobre Qwen3.8-27B | rango 64 (base 27B) | no disponible (evaluado hasta 20.000 tokens) | Kernels HIP / ROCm | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | Modelo completo | 27B | no disponible | Propósito general | no disponible | Hugging Face |
| Adaptadores derivados de CUDA-Agent-Ops-6K | LoRA sobre modelos de código | no disponible | no disponible | Kernels CUDA | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa se limita a la tabla de regresiones frente al modelo base.

## Limitaciones y advertencias

- La mejora es de corrección, no de velocidad: la aceleración mediana de las respuestas correctas del adaptador (0,90×) es inferior a la del base (1,10×), y más de la mitad de sus respuestas correctas son más lentas que PyTorch eager.
- El número de held-out A (0,515) es ligeramente optimista porque ese conjunto se usó para elegir el checkpoint (paso 75); la fila de validación (0,540) es la no sesgada.
- Regresión en MMLU-Pro de 3,3 puntos (19 preguntas peores, 9 mejores), en el límite de la significación estadística; el resto de benchmarks varía como máximo 1,2 puntos, ninguno de forma significativa.
- El 16 % de las respuestas se truncan al límite de 14.000 tokens; el 22 % de las respuestas no compilan.
- El modelo está especializado en un único objetivo de hardware (MI300X, gfx942, ROCm/HIP); no se documenta su comportamiento en otras GPUs AMD o NVIDIA.
- El formato de prompt es fijo y debe respetarse (system prompt, módulo, versión funcional e interfaz de compilación); desviarse de él puede degradar los resultados.
- No se detallan sesgos conocidos, comportamiento multilingüe ni riesgos de alucinación específicos más allá de los inherentes a un modelo de generación de código.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base Qwen/Qwen3.8-27B para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de los resultados publicados.

## Enlaces

- Hugging Face: https://huggingface.co/ik6626/Qwen3.8-27B-HIP-kernel-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código, grader y evaluación: https://github.com/moonmath-ai/Qwen3.8-27B-HIP-kernel-RL
- Resultados completos: https://github.com/moonmath-ai/Qwen3.8-27B-HIP-kernel-RL/blob/main/RESULTS.md
- Write-up: https://github.com/moonmath-ai/Qwen3.8-27B-HIP-kernel-RL/blob/main/docs/PAPER.md
- Dataset amd/AIG-Datasets: https://huggingface.co/datasets/amd/AIG-Datasets
- Dataset BytedTsinghua-SIA/CUDA-Agent-Ops-6K: https://huggingface.co/datasets/BytedTsinghua-SIA/CUDA-Agent-Ops-6K
- Dataset SakanaAI/AI-CUDA-Engineer-Archive: https://huggingface.co/datasets/SakanaAI/AI-CUDA-Engineer-Archive
