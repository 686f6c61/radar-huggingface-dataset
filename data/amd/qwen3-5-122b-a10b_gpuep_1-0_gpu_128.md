# amd/Qwen3.5-122B-A10B_gpuep_1.0_gpu_128

## Resumen

Qwen3.5-122B-A10B_gpuep_1.0_gpu_128 es una version cuantizada y convertida a ONNX del modelo multimodal Qwen/Qwen3.5-122B-A10B, publicada por AMD. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con 122.000 millones de parametros totales y 10.000 millones activos por token, capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). Esta variante concreta esta optimizada para ejecutarse sobre el backend onnxruntime-genai con el execution provider HIP de AMD (hip-ep), lo que la hace adecuada para despliegue en GPUs AMD con aceleracion nativa.

La relevancia de esta publicacion radica en que permite ejecutar un modelo MoE multimodal de gran escala en hardware AMD mediante un formato ONNX precompilado, evitando al usuario tener que realizar la conversion y cuantizacion por su cuenta. El sufijo "gpu_128" hace referencia a la configuracion de compilacion orientada a GPU, y el modelo se distribuye bajo licencia Apache 2.0, la misma del modelo base.

El repositorio ocupa 71,8 GB y esta pensado para inferencia en produccion sobre GPUs de la familia AMD Instinct o Radeon, usando la pila de software de AMD (ROCm, HIP, onnxruntime-genai). Al ser una derivacion cuantizada, no introduce capacidades nuevas respecto al modelo base, sino que prioriza eficiencia de memoria y compatibilidad de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), multimodal vision-language (texto + imagen) |
| Parametros totales | 122.000 millones (122B) |
| Parametros activos | 10.000 millones (10B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 en pesos del decoder de texto (RTN, group size 32, activaciones FP16; expertos MoE con QMoE INT4, block size 32); encoder de vision en FP16; embeddings en FP16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (onnxruntime-genai) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B es un transformer de tipo Mixture-of-Experts con 122B parametros totales y 10B activos, lo que reduce el coste computacional por token en comparacion con un modelo denso del mismo tamano. Incorpora un encoder de vision que lo habilita para tareas image-text-to-text, por lo que acepta imagenes junto con texto como entrada.

Esta variante de AMD no reentrena el modelo: aplica cuantizacion post-entrenamiento (RTN con group size 32 para el decoder de texto, QMoE INT4 para los expertos, y FP16 para el encoder de vision y los embeddings) y lo convierte a formato ONNX mediante Olive y OGA Model Builder. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO, ya que la model card no lo detalla. La innovacion tecnica principal de esta publicacion es la integracion con el execution provider HIP de AMD para acelerar la inferencia en GPUs de esa marca.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline conversational).
- Procesamiento de imagenes junto con texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y tareas que combinan vision y lenguaje.
- Razonamiento y comprension del lenguaje heredados del modelo base Qwen3.5.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- Ejecucion optimizada sobre GPUs AMD mediante onnxruntime-genai con el execution provider HIP.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede recibir capturas, diagramas o escaneos junto con una pregunta en texto y devolver una respuesta combinada, aprovechando su pipeline image-text-to-text.
- Asistencia visual en aplicaciones de escritorio o web: integracion mediante onnxruntime-genai para describir o interpretar imagenes enviadas por el usuario en tiempo real.
- Despliegue en infraestructura AMD: organizaciones con GPUs AMD Instinct o Radeon pueden servir el modelo con el execution provider HIP sin necesidad de convertir manualmente los pesos a ONNX.
- Procesamiento por lotes de contenido multimodal: clasificacion y anotacion de imagenes acompanadas de texto en pipelines internos, gracias a la cuantizacion INT4 que reduce la huella de memoria frente al modelo en FP16.
- Prototipado de asistentes conversacionales con vision: el formato ONNX y la libreria onnxruntime-genai simplifican la integracion en aplicaciones .NET, C++ o Python que ya usan esa pila.
- Evaluacion comparativa de hardware: util para medir el rendimiento de modelos MoE de 122B en GPUs AMD frente a alternativas en NVIDIA, al ser una build precompilada y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 71,8 GB, por lo que se necesita al menos esa cantidad de memoria de GPU (o cercana) para cargar los pesos en INT4/FP16 mixtos. Una GPU con 80 GB (por ejemplo, AMD Instinct MI210 o MI300X) es el minimo practico para una unica tarjeta.
- GPU recomendadas: GPUs AMD con soporte ROCm/HIP, como Instinct MI300X (192 GB) o MI210 (64 GB, probablemente insuficiente para los 71,8 GB completos). No se documenta compatibilidad con GPUs NVIDIA en esta build, ya que esta compilada para el execution provider HIP.
- Cabe en GPU de consumo: no de forma completa; los 71,8 GB superan la VRAM de cualquier GPU consumer actual (maximo 24-32 GB). Solo seria viable con offloading a CPU/RAM, lo que degradaria el rendimiento.
- Opciones de despliegue: onnxruntime-genai con el execution provider HIP de AMD; la model card indica que se genero con Olive y OGA Model Builder.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| amd/Qwen3.5-122B-A10B_gpuep_1.0_gpu_128 | 122B | 10B | no disponible | ONNX (INT4/FP16) | Apache 2.0 | AMD (HIP) |
| Qwen/Qwen3.5-122B-A10B (base) | 122B | 10B | no disponible | safetensors (FP16/BF16) | Apache 2.0 | Generico (CUDA/ROCm) |
| Versiones cuantizadas GGUF del modelo base | 122B | 10B | no disponible | GGUF | Apache 2.0 | CPU/GPU consumer con llama.cpp |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion disponible no incluye otros modelos de referencia con los que contrastar rendimiento. La diferencia clave de esta build es el formato ONNX optimizado para HIP de AMD y la cuantizacion INT4 de los expertos MoE.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles en los metadatos; el rendimiento en castellano no esta garantizado.
- Al ser una derivacion cuantizada en INT4, puede presentar una ligera perdida de calidad respecto al modelo base en FP16/BF16, especialmente en tareas de razonamiento complejo.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan medidas de mitigacion especificas.
- La build esta compilada para el execution provider HIP de AMD; no es portable directamente a CUDA sin reconversion.
- El tamano del repositorio (71,8 GB) limita el despliegue a hardware de gama alta con suficiente VRAM.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE incluido y las condiciones del modelo base.
- No hay informacion sobre la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Qwen3.5-122B-A10B_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
- Olive (herramienta de conversion y cuantizacion): https://github.com/microsoft/Olive
- ROCm (pila de software AMD): https://github.com/ROCm/ROCm
