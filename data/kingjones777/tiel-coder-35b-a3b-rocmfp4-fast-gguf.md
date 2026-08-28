# kingjones777/Tiel-Coder-35B-A3B-ROCmFP4-FAST-GGUF

## Resumen

Tiel-Coder-35B-A3B-ROCmFP4-FAST-GGUF es una requantización en formato GGUF del modelo Tiel-Coder-35B-A3B, un fine-tune orientado a codificación y agentes del modelo base Ornith-1.5-35B-A3B. El autor, kingjones777, ha convertido los pesos del modelo a un formato de cuantización experimental ROCmFP4 (tipo `Q4_0_ROCMFP4_FAST`) diseñado específicamente para hardware AMD con ROCm, en particular para la iGPU Radeon 8060S del AMD Ryzen AI Max+ 395 (Strix Halo). El archivo resultante ocupa 17.37 GiB y requiere una versión parcheada de llama.cpp con soporte para la arquitectura `qwen35moe` y los tipos de tensor ROCmFPX.

La relevancia de este modelo radica en que permite ejecutar un MoE de 35B parámetros totales (con activación parcial) en hardware integrado de AMD con memoria unificada, alcanzando velocidades de generación de 60 tok/s y procesamiento de prompt de 1174 tok/s según las mediciones del autor. Soporta una ventana de contexto de hasta 262,144 tokens, lo que lo hace adecuado para tareas de codificación y agentes que requieren manejar repositorios completos. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en `qwen35moe` (Qwen 3.8) |
| Parametros totales | 34.660.610.688 (34.66B) |
| Parametros activos | no disponible (el nombre sugiere ~3B, sin confirmar) |
| Longitud de contexto | 262,144 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (tipo 103), con output.weight en Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tipos ROCmFP4, requiere llama.cpp parcheado) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) con arquitectura `qwen35moe`, derivada de la familia Qwen 3.8. El fine-tune Tiel-Coder se ha entrenado específicamente para tareas de codificación y agentes, aunque no se dispone de detalles sobre el dataset, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. El modelo base Ornith-1.5-35B-A3B es un modelo de propósito general, y el fine-tune Tiel-Coder lo adapta para el ámbito de desarrollo de software.

La requantización a ROCmFP4 se realizó a partir del archivo `UD-Q8_K_XL` (35.81 GiB) publicado por peculiar-ragdoll, utilizando `--allow-requantize`, lo que implica una doble cuantización (Q8 → ROCmFP4) con pérdida adicional respecto a una cuantización directa desde pesos BF16/F32. El tensor `output.weight` (la cabeza de salida) se mantiene en Q6_K para minimizar el error en la selección de tokens, ya que cada token generado pasa por esa capa. Las normas y biases se conservan en F32.

## Capacidades

- Generación de texto y completado de código, orientado a tareas de programación.
- Soporte para agentes autónomos (agentic coding), con capacidad de razonamiento multi-paso.
- Ventana de contexto larga (262,144 tokens) que permite procesar repositorios completos o documentación extensa.
- Posible soporte de tool calling y function calling, aunque no está explícitamente confirmado en la documentación.
- Disponibilidad de una torre de visión (`mmproj`) en el repositorio fuente, lo que sugiere capacidades multimodales (imagen + texto), aunque no se detalla su funcionamiento.
- Integración con el formato de chat Jinja y compatibilidad con `llama-server` para servir el modelo como API.
- Soporte de cuantización ROCmFP4 específica para hardware AMD, con kernels acelerados por HIP/ROCm y Vulkan.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en un IDE o editor de texto para ofrecer autocompletado, generación de funciones y explicación de código, ejecutándose en hardware AMD de gama media sin necesidad de GPU discreta.
- Agente autónomo de desarrollo: gracias a su capacidad de razonamiento multi-paso y su contexto de 262k tokens, puede gestionar tareas complejas como refactorización de código, búsqueda de errores o generación de tests en un repositorio completo.
- Revisión de código en repos grandes: la ventana de contexto permite analizar múltiples archivos a la vez, detectando inconsistencias o problemas de estilo en un proyecto entero.
- Generación de documentación técnica: el modelo puede producir comentarios, docstrings y manuales a partir del código fuente, manteniendo coherencia con el contexto del proyecto.
- Chat técnico y resolución de dudas de programación: sirve como asistente conversacional para desarrolladores, con respuestas basadas en el contexto proporcionado.
- Integración en pipelines de CI/CD: puede utilizarse para análisis estático de código, generación de mensajes de commit o revisión automática de pull requests, desplegado como servicio mediante `llama-server`.
- Prototipado rápido de aplicaciones: con la capacidad de tool calling (si se confirma), podría orquestar llamadas a APIs o ejecutar comandos en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de calidad como MMLU, HumanEval o GSM8K, y advierte que la calidad no fue evaluada tras la requantización. Las únicas mediciones disponibles son de rendimiento en hardware específico:

| Metrica | Valor (en AMD Ryzen AI Max+ 395, gfx1151, ROCm 7.2.4) |
|---|---|
| Prompt processing | 1174 tok/s (mediana de 4 muestras) |
| Generacion | 60.28 tok/s (mediana de 4 muestras) |
| GTT resident | 18.0 GiB |

Comparado con el Q8_K_XL del que deriva, este build reduce el tamaño a la mitad (17.37 GiB vs 35.81 GiB) y mejora tanto el prompt processing (1174 vs 794 tok/s) como la generación (60.28 vs 46.5 tok/s), a costa de una pérdida de calidad por la doble cuantización.

## Requisitos de hardware

- Requiere una versión parcheada de llama.cpp con soporte para ROCmFPX (por ejemplo, el commit `ROCmFPX-2809dc5`), compilada con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`.
- Medido en AMD Ryzen AI Max+ 395 (Strix Halo) con iGPU Radeon 8060S y memoria unificada: 18 GiB de GTT residente, 60.28 tok/s de generación y 1174 tok/s de prompt processing con contexto de 4,000 tokens.
- No hay datos de rendimiento en GPUs discretas (NVIDIA o AMD dedicadas). El formato ROCmFP4 está diseñado para hardware AMD con ROCm 7.2.4 o superior.
- El archivo GGUF pesa 17.37 GiB, por lo que se necesita al menos 20 GiB de RAM/VRAM disponible para cargar el modelo y sus buffers.
- Opciones de despliegue: `llama-server` con `--n-gpu-layers 999`, `--flash-attn on`, `--ctx-size 32768` (o más, hasta 262k), y `--jinja` para el formato de chat.
- No se recomienda su uso en CPU sola: el rendimiento sería significativamente menor, aunque los kernels ROCmFPX incluyen rutas de referencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B-ROCmFP4-FAST (este) | 34.66B totales, ~3B activos | 262k | GGUF ROCmFP4 | Apache 2.0 | Requiere llama.cpp parcheado, orientado a AMD |
| Tiel-Coder-35B-A3B-GGUF UD-Q8_K_XL (peculiar-ragdoll) | 34.66B totales, ~3B activos | 262k | GGUF Q8_K_XL | Apache 2.0 | Mayor fidelidad, 35.81 GiB, funciona en llama.cpp estándar |
| Ornith-1.5-35B-A3B-ROCmFP4-COHERENT-GGUF (kingjones777) | 34.66B totales, ~3B activos | 262k | GGUF ROCmFP4 | Apache 2.0 | Variante con embeddings/normas en mayor precisión |
| Ornith-1.5-35B-A3B-ROCmFP4-GGUF (julianmb, ftype 106) | 34.66B totales, ~3B activos | 262k | GGUF ROCmFP4 | Apache 2.0 | Usa Q5_K para embeddings y output.weight en 4-bit |

La principal diferencia entre variantes es la precisión de los tensores críticos (embeddings, output head) y el origen de la cuantización. Este build prioriza la velocidad y el tamaño reducido, sacrificando algo de calidad por la doble cuantización.

## Limitaciones y advertencias

- Doble cuantización: al construirse a partir de un Q8_K_XL, la pérdida de calidad es mayor que una cuantización directa desde pesos BF16/F32. El autor lo advierte explícitamente y recomienda el Q8_K_XL si se necesita máxima fidelidad.
- Requiere llama.cpp parcheado con ROCmFPX: el stock de llama.cpp no reconoce ni la arquitectura `qwen35moe` ni los tipos `Q4_0_ROCMFP4_*`, por lo que no funcionará en instalaciones estándar.
- Sin benchmarks de calidad: no hay evaluaciones de MMLU, HumanEval, etc. para este build concreto. El impacto de la cuantización en tareas de codificación no está medido.
- Dependencia de hardware AMD: el formato ROCmFP4 está optimizado para GPUs AMD con ROCm (gfx1151 en particular). En hardware NVIDIA o Intel, el rendimiento puede ser inferior o requerir compilaciones alternativas.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo de texto, existe riesgo de generar código incorrecto o información falsa. Debe validarse la salida en entornos de producción.
- Contexto largo: aunque soporta 262k tokens, el rendimiento con contextos muy largos puede degradarse y el uso de memoria aumenta proporcionalmente. Las mediciones se realizaron con 4,000 tokens.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el fine-tune pueden tener atribuciones adicionales; se recomienda revisar las licencias de los modelos fuente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Tiel-Coder-35B-A3B-ROCmFP4-FAST-GGUF
- Repositorio fuente (fine-tune y GGUF original): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Proyecto ROCmFPX (parche de llama.cpp): https://github.com/charlie12345/ROCmFPX
- Repositorio de referencia para ROCmFP4 en Strix Halo: https://github.com/julianmb/q38rocm
