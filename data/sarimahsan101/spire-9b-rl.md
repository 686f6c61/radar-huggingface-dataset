# sarimahsan101/Spire-9B-RL

## Resumen

Spire-9B-RL es un modelo de lenguaje de 9.653 millones de parametros especializado en la generacion de shaders de computo para GPU, desarrollado por el usuario sarimahsan101 a partir de Qwen/Qwen3.5-9B. Resuelve un problema muy concreto: escribir kernels de computo correctos en Vulkan GLSL (`#version 450`) y WebGPU WGSL a partir de especificaciones en lenguaje natural, tareas en las que los modelos generalistas fallan con frecuencia por la fragilidad sintactica y semantica de estos lenguajes.

El modelo se entrena en dos fases: primero un ajuste fino supervisado (SFT) con LoRA en BF16 y despues un refuerzo GRPO verificado por ejecucion contra un compilador real de Vulkan (SPIR-V) y un validador de WebGPU. Esta segunda fase eleva el Pass@1 del 52,9 % al 59,6 % en un benchmark propio de 104 tareas retenidas, con una mejora de 38,9 puntos porcentuales respecto al modelo base.

Su relevancia actual reside en el nicho: casi no existen modelos abiertos afinados especificamente para computo en GPU con verificacion de ejecucion, y este demuestra que el RL con recompensa verificable funciona en dominios de codigo de bajo nivel donde el modelo base obtiene un 0 % en GLSL Vulkan. La licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF facilitan su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; detalles de atencion no disponibles) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, Q5_K_M, Q8_0; pesos originales en BF16/safetensors |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.650 millones de parametros. El autor no detalla en la model card la configuracion interna de atencion, el numero de capas ni la ventana de contexto del modelo base, por lo que esos datos quedan como no disponibles.

El entrenamiento consta de dos etapas. La primera es un ajuste fino supervisado con LoRA en BF16 sobre datos de shaders de computo; esta fase eleva el Pass@1 del 20,7 % al 52,9 % y hace pasar el GLSL Vulkan del 0,0 % al 52,9 %. La segunda etapa aplica GRPO (Group Relative Policy Optimization) con recompensa verificada por ejecucion: cada shader generado debe compilar (`glslangValidator -V` y `spirv-val` para GLSL; `naga`/`wgpu` para WGSL), ejecutarse en una GPU real sin perdida de dispositivo ni accesos fuera de rango, y coincidir numericamente con referencias de NumPy/PyTorch (`atol=1e-3`, `rtol=1e-2`). Esta verificacion realimenta la politica y aporta 6,7 puntos porcentuales adicionales de Pass@1, con mejoras concentradas en kernels algoritmicamente dificiles.

## Capacidades

- Generacion de shaders de computo standalone en Vulkan GLSL (`#version 450`) y WebGPU WGSL a partir de especificaciones en lenguaje natural.
- Reparacion de kernels rotos a partir de diagnosticos de compilador o de errores en tiempo de ejecucion.
- Traduccion entre GLSL y WGSL.
- Cobertura de ocho dominios de kernel: elementwise, cuantizacion, movimiento de datos, scan y sort, multiplicacion de matrices, reduccion, atencion y datos, y convolucion y pooling.
- Generacion de texto y codigo general heredada del modelo base Qwen3.5-9B.
- Modo thinking desactivable (`enable_thinking=False` en la evaluacion oficial).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Generacion de kernels de computo en produccion: a partir de una descripcion como "reduccion de suma sobre un buffer de floats con workgroup de 256 hilos", el modelo produce un shader GLSL o WGSL compilable, con una tasa de compilacion del 91,8 % en el benchmark del autor, lo que reduce el ciclo de iteracion manual.
- Portabilidad entre APIs graficas: traduccion de kernels existentes de Vulkan GLSL a WebGPU WGSL para desplegar el mismo pipeline en navegador o en WebGPU nativo, aprovechando la capacidad de traduccion GLSL ↔ WGSL.
- Depuracion asistida de shaders: dado un kernel que falla la validacion de `spirv-val` o `naga`, el modelo recibe el diagnostico y propone una version corregida, util en pipelines de integracion continua de motores graficos.
- Prototipado rapido de algoritmos en GPU: generacion de kernels de reduccion, scan, atencion o multiplicacion de matrices para validar una idea antes de invertir en optimizacion manual, con Pass@1 del 53,6 % en matmul y del 54,2 % en scan y sort.
- Educacion y formacion en computo GPU: el modelo puede generar ejemplos funcionales de kernels elementwise (97,1 % de Pass@1) para material didactico sobre Vulkan y WebGPU.
- Generacion de kernels de cuantizacion para inferencia: con un Pass@1 del 68,2 % en la categoria de cuantizacion, resulta adecuado para producir rutinas de conversion de precision en pipelines de despliegue de modelos.
- Automatizacion de pruebas de shaders: integracion en un verificador que genere y valide kernels de forma masiva, usando el modelo como generador y un compilador real como juez.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el benchmark retenido Spire Held-Out 104-Task, con 208 pruebas totales, decodificacion greedy y thinking desactivado.

| Modelo | Metodo | Tasa de compilacion | Tasa de ejecucion | Pass@1 global | GLSL Pass@1 | WGSL Pass@1 |
|---|---|---:|---:|---:|---:|---:|
| Qwen/Qwen3.5-9B | Base zero-shot | 32,7 % | 30,3 % | 20,7 % (43/208) | 0,0 % (0/104) | 41,3 % (43/104) |
| Spire-9B-SFT | LoRA SFT BF16 | 91,4 % | 90,9 % | 52,9 % (110/208) | 52,9 % (55/104) | 52,9 % (55/104) |
| Spire-9B-RL | SFT + Verifier-GRPO | 91,8 % | 91,8 % | 59,6 % (124/208) | 65,4 % (68/104) | 53,8 % (56/104) |

Desglose por categoria de kernel (SFT frente a RL):

| Categoria | Pruebas | SFT | RL | Ganancia |
|---|---:|---:|---:|---:|
| Elementwise | 34 | 94,1 % | 97,1 % | +2,9 pp |
| Cuantizacion | 22 | 54,6 % | 68,2 % | +13,6 pp |
| Movimiento de datos | 22 | 63,6 % | 68,2 % | +4,5 pp |
| Scan y sort | 24 | 41,7 % | 54,2 % | +12,5 pp |
| Multiplicacion de matrices | 28 | 50,0 % | 53,6 % | +3,6 pp |
| Reduccion | 28 | 35,7 % | 46,4 % | +10,7 pp |
| Atencion y datos | 24 | 37,5 % | 45,8 % | +8,3 pp |
| Convolucion y pooling | 26 | 34,6 % | 34,6 % | 0,0 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,3 GB en BF16 (tamano del repo), unos 10-11 GB en GGUF Q4_K_M, 12-13 GB en Q5_K_M y 18-19 GB en Q8_0 (estimaciones a partir del numero de parametros y la cuantizacion).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16; RTX 4090 (24 GB) cabe en BF16 justo y con holgura en cuantizaciones GGUF.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16 y en todas las cuantizaciones GGUF; en GPUs de 12-16 GB es necesario Q4_K_M o Q5_K_M.
- Opciones de despliegue: transformers, llama.cpp, Ollama y servidores compatibles con endpoints (el modelo esta marcado como `endpoints_compatible`); vLLM y TGI no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Pass@1 en benchmark propio |
|---|---|---:|---|---|---:|
| Spire-9B-RL | 9,65 B | no disponible | Shaders GLSL/WGSL | Apache 2.0 | 59,6 % |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | Proposito general | Apache 2.0 | 20,7 % |
| Spire-9B-SFT | 9,65 B | no disponible | Shaders GLSL/WGSL | Apache 2.0 | 52,9 % |

No se dispone de datos de otros modelos especializados en shaders de computo para una comparacion externa; la informacion disponible solo permite comparar con el modelo base y con la variante SFT del propio autor.

## Limitaciones y advertencias

- El benchmark es propio del autor y los resultados estan marcados como no verificados; no hay evaluacion independiente.
- El rendimiento en convolucion y pooling no mejora con RL (34,6 % de Pass@1), lo que indica una debilidad persistente en esa categoria.
- El Pass@1 global del 59,6 % implica que aproximadamente cuatro de cada diez shaders generados no pasan las pruebas; en produccion es imprescindible un verificador de compilacion y ejecucion.
- El modelo esta entrenado y evaluado solo en ingles; el soporte multilingue es practicamente inexistente.
- La longitud de contexto no esta documentada, lo que dificulta planificar tareas con especificaciones largas o multiples archivos.
- No hay informacion sobre sesgos, tasas de alucinacion fuera del dominio de shaders ni comportamiento en codigo general.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de validacion externa exige auditoria propia antes de desplegarlo en pipelines criticos.
- El modelo base Qwen3.5-9B puede tener sus propias condiciones; conviene revisar su model card antes de un uso comercial combinado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarimahsan101/Spire-9B-RL
- Cuantizaciones GGUF: https://huggingface.co/sarimahsan101/Spire-9B-RL-GGUF
- Repositorio de entrenamiento y verificador: https://github.com/sarimahsan/vulkagen_model
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
