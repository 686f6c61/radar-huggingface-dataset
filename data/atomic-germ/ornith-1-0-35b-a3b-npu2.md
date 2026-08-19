# Atomic-Germ/Ornith-1.0-35B-A3B-NPU2

## Resumen

Ornith-1.0-35B-A3B-NPU2 es una conversión cuantizada del modelo Ornith-1.0-35B, desarrollada por Atomic-Germ, al formato propietario Q4NX para aceleración por hardware en NPUs AMD Ryzen AI XDNA2 mediante el motor FastFlowLM. El modelo base, Ornith-1.0-35B, es un modelo de codificación agéntica open-source creado por ornith-ai, que se distribuye en tres tamaños (9B denso, 35B MoE y 397B MoE) con una ventana de contexto de 262.144 tokens. Esta conversión concreta está pensada para ejecutarse exclusivamente en NPU2 (XDNA2) de procesadores AMD Ryzen AI 300 series o posteriores, aprovechando el motor matricial de la NPU con un formato de cuantización empaquetado que no es compatible con GGUF ni con llama.cpp.

El modelo mantiene las capacidades completas del Ornith-1.0-35B original, incluyendo soporte de tool calling, razonamiento multi-paso y una ventana de contexto de 262K tokens, pero en un formato optimizado para inferencia en NPU de AMD. La cuantización Q4NX reduce el tamaño de los pesos a 23,2 GB (frente a los ~35 GB del modelo original en FP16), permitiendo su ejecución en sistemas con memoria unificada de al menos 47 GB. La licencia del modelo base es MIT, aunque el README indica "license: other" para la conversión, y el modelo solo soporta inglés. El repo tiene 932 descargas y 1 like, y fue creado el 8 de agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) similar a Qwen3.6-MoE, con 40 capas, hidden size 2048, intermediate size 512, vocabulario de 248.320 tokens |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, reordenacion de Q4_1 para NPU) |
| Idiomas soportados | Ingles |
| Licencia | MIT (modelo base); la conversion indica "other" en el repo |
| Formato de pesos | Q4NX (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-35B es un modelo de arquitectura Mixture of Experts con 35.000 millones de parametros totales y 3.000 millones activos por token, lo que lo situa en la categoria de MoE eficientes de baja activacion. La arquitectura sigue el patron de Qwen3.6-MoE, segun indica el tag "qwen3.6-moe" del repositorio, con 40 capas y una ventana de contexto de 262.144 tokens. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO; la informacion disponible no incluye estos datos. La conversion Q4NX reordena los pesos en un layout de cuantizacion Q4_1 adaptado a los tamaños de tile y patrones de acceso a memoria del motor matricial de la NPU XDNA2, optimizando la latencia y el throughput de prefill y decoding.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno con ventana de contexto de 262K tokens.
- Soporte de tool calling / function calling, permitiendo integracion con agentes y pipelines de automatizacion.
- Capacidad de trabajo agéntico (agentic coding): puede autogenerar, ejecutar y depurar codigo de forma autonoma en escenarios de desarrollo local.
- Razonamiento multi-paso y planificacion de tareas complejas, adecuado para agentes de codificacion.
- Capacidades multilingues limitadas al ingles.
- No tiene soporte de vision ni audio, es exclusivamente text-to-text.

## Casos de uso

- Agente de codificacion local: el modelo puede actuar como un agente autonomo que genera, prueba y depura codigo en un entorno de desarrollo local, gracias a su capacidad de tool calling y razonamiento multi-paso. Su contexto de 262K tokens permite mantener proyectos completos en memoria.
- Asistencia de programacion en IDE: integracion en editores como VS Code o Neovim para autocompletado, refactorizacion y explicacion de codigo, con la ventaja de ejecutarse en local sin enviar datos a la nube.
- Automatizacion de tareas de CI/CD: el modelo puede generar scripts de build, analizar logs de error y sugerir correcciones en pipelines de integracion continua, gracias a su capacidad de tool calling.
- Chat de soporte tecnico especializado: gestion de conversaciones multi-turno con contexto largo sobre documentacion tecnica, repositorios o manuales, aprovechando los 262K tokens de ventana.
- Generacion de documentacion tecnica: a partir de un repositorio o especificacion, el modelo puede redactar documentacion detallada, comentarios en codigo y guias de uso.
- Procesamiento de logs y analisis de errores: el modelo puede ingerir grandes volumenes de logs (hasta 262K tokens) y extraer patrones de error, proponiendo soluciones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card proporciona datos de rendimiento de inferencia medidos en la NPU AMD Ryzen AI XDNA2 con FastFlowLM:

| Contexto | TTFT (s) | Prefill Speed (tok/s) | Decoding Speed (tok/s) |
|---|---|---|---|
| 1k | 12.355 ± 0.122 | 79.07 ± 0.78 | 10.41 ± 0.01 |
| 2k | 16.849 ± 0.142 | 115.41 ± 0.97 | 10.36 ± 0.07 |
| 4k | 24.852 ± 0.035 | 156.09 ± 0.22 | 10.14 ± 0.10 |
| 8k | 40.241 ± 0.385 | 192.55 ± 1.84 | 9.74 ± 0.07 |
| 16k | 73.398 ± 1.227 | 211.03 ± 3.53 | 9.02 ± 0.07 |
| 32k | 148.780 ± 0.630 | 208.11 ± 0.89 | 7.70 ± 0.03 |

Se observa que la velocidad de prefill aumenta con el contexto hasta 16k (211 tok/s) y luego se estabiliza, mientras que la velocidad de decoding disminuye gradualmente desde 10.41 tok/s a 7.70 tok/s al pasar de 1k a 32k tokens de contexto.

## Requisitos de hardware

- NPU dedicada: AMD Ryzen AI XDNA2 (NPU2), presente en procesadores Strix Point / Ryzen AI 300 series o posteriores.
- Memoria: aproximadamente 47 GB de memoria unificada del sistema (pesos Q4NX de 23.2 GB + activaciones + KV cache).
- Sistema operativo: Linux con el stack XRT NPU instalado.
- Motor de inferencia: FastFlowLM >= 0.9.46 (CLI `flm`), con los kernels xclbin de la familia `qwen3.6-moe` (los kernels son closed source y no se incluyen en el repo).
- No compatible con GPU convencionales (NVIDIA/AMD) ni con hardware de consumo general: solo funciona en NPU XDNA2.
- No es compatible con llama.cpp, Ollama ni vLLM; el formato Q4NX es exclusivo de FastFlowLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Ornith-1.0-35B (base) | 35B totales, 3B activos | 262.144 | safetensors | GPU (multi-GPU con tensor parallelism) | MIT |
| Ornith-1.0-35B-A3B-NPU2 (este) | 35B totales, 3B activos | 262.144 | Q4NX | NPU AMD XDNA2 | MIT (con caveats) |
| Qwen3.6-Moe-35B-A3B | 35B totales, 3B activos | 262.144 | safetensors | GPU | Apache 2.0 (probablemente) |

El modelo es una cuantizacion especifica para NPU del mismo modelo base; la comparativa directa con el original en GPU muestra la diferencia principal en el formato de pesos y el hardware objetivo, no en la arquitectura. No hay datos de benchmarks que permitan comparar la calidad de la cuantizacion Q4NX frente a otros formatos.

## Limitaciones y advertencias

- Restriccion de hardware: el modelo solo funciona en NPU AMD XDNA2 (Strix Point / Ryzen AI 300 o posterior); no puede ejecutarse en GPU convencionales, CPU o NPU de otras marcas.
- Formato propietario: el formato Q4NX y los kernels de FastFlowLM son closed source; dependes de la disponibilidad y mantenimiento del software de FastFlowLM.
- Licencia del modelo base: aunque el repo indica "license: mit", el modelo card del autor menciona "License: other" para la conversion, y la licencia del modelo base es MIT, pero hay que verificar los terminos del modelo base y de la conversion antes de uso comercial.
- Solo idioma ingles: no soporta otros idiomas de forma nativa.
- Sesgos y alucinaciones: como modelo de lenguaje generativo, puede producir contenido falso o sesgado; no se han publicado evaluaciones de sesgo especificas.
- Rendimiento de decoding limitado: la velocidad de decoding es de 7-10 tokens/segundo, considerablemente inferior a la de GPUs dedicadas, lo que puede ser un cuello de botella en aplicaciones interactivas en tiempo real.
- Requiere memoria unificada de 47 GB: no cabe en sistemas con menos de 48 GB de RAM unificada.
- Los kernels NPU son closed source: si FastFlowLM deja de mantener la familia `qwen3.6-moe`, el modelo puede dejar de funcionar.

## Enlaces

- Repositorio HuggingFace: [Atomic-Germ/Ornith-1.0-35B-A3B-NPU2](https://huggingface.co/Atomic-Germ/Ornith-1.0-35B-A3B-NPU2)
- Modelo base: [ornith-ai/Ornith-1.0-35B](https://huggingface.co/ornith-ai/Ornith-1.0-35B)
- Sitio web de Ornith: https://ornith.online/
- Pagina del modelo 35B: https://ornith.online/ornith-1-0-model-35b
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Sitio de FastFlowLM: https://fastflowlm.com
