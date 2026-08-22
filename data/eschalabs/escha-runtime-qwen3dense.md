# EschaLabs/escha-runtime-qwen3dense

## Resumen

Escha Runtime — `qwen3dense` es el motor de servido (serving runtime) que Escha Labs Inc. distribuye para ejecutar sus modelos cuantizados de la arquitectura `qwen3_5` densa, concretamente el Qwen3.8-27B y sus variantes. No se trata de un modelo de lenguaje en sí, sino de un paquete de software que integra un fork de SGLang con los kernels CUDA propietarios de Escha, empaquetado en una rueda de Python (`cp312`). Su objetivo es permitir el despliegue de un modelo de 27 000 millones de parámetros en aproximadamente 10 GB de VRAM, con una cuantización extrema de 2-3 bits, manteniendo un rendimiento cercano al 100 % de la referencia FP8 según los datos publicados por el autor.

La relevancia de esta pieza reside en que abre la puerta a ejecutar modelos de razonamiento de gran tamaño en GPUs de consumo (por ejemplo, una RTX 5090 con 32 GB), con una velocidad de decodificación de 82,6 tokens por segundo según el anuncio oficial. El runtime incluye soporte para continuous batching, paged KV cache, tool calling, JSON schema y un parser de respuestas de razonamiento, y expone una API compatible con OpenAI. El repositorio actual contiene únicamente el runtime (0,1 GB), no los pesos del modelo, que se descargan por separado desde `EschaLabs/Qwen3.8-27B-Escha-W2`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`qwen3_5 dense`), basado en Qwen3.8-27B |
| Parametros totales | 27 B (según el nombre del modelo compatible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65 536 tokens (configuración por defecto del runtime) |
| Tipos de cuantizacion | 2 bits y 3 bits, mixta (`escha`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el runtime no incluye pesos; el modelo cuantizado se descarga aparte) |

## Arquitectura y entrenamiento

El runtime es un fork de SGLang que incorpora los kernels CUDA de Escha para la cuantización extrema de 2-3 bits. No se trata de un modelo entrenado, sino de un motor de inferencia que carga los pesos cuantizados del modelo base Qwen3.8-27B, un transformer denso de razonamiento con modo *thinking*. El runtime gestiona la ejecución de los kernels, el batching continuo, la cache de KV paginada y un pool de estado recurrente (configurado con `MAMBA_RATIO=0.3`) que limita el número de streams concurrentes en tarjetas con 24 GB de VRAM.

La cuantización `escha` es una técnica de compresión de baja precisión mixta que asigna distintos anchos de bit (2-3) según la sensibilidad de cada capa. El runtime está optimizado para la arquitectura densa, aunque también registra el método `eschamoe` para modelos MoE, si bien los parámetros por defecto y la documentación están pensados para el caso denso. No se han publicado detalles sobre el proceso de entrenamiento o calibración de la cuantización en la información proporcionada.

## Capacidades

- Inferencia de modelos cuantizados `escha` de la arquitectura `qwen3_5` densa (Qwen3.8-27B y hermanos).
- Servicio con API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`).
- Continuous batching, paged KV cache y caché de prefijo con radix (opcional).
- Soporte de tool calls y JSON schema.
- Parser de respuestas de razonamiento (`reasoning_content` y `content` separados).
- Control del esfuerzo de razonamiento por petición (`xhigh`, `medium`, `low`) mediante `chat_template_kwargs`.
- Presupuesto de pensamiento (`thinking_budget`) para forzar una respuesta tras N tokens de razonamiento.
- Capacidad de cargar también modelos MoE (`eschamoe`) aunque no es el caso de uso principal.

## Casos de uso

- **Despliegue de un modelo de 27 B en una GPU de consumo**: con 24 GB de VRAM se puede servir el Qwen3.8-27B cuantizado a 2 bits con contexto completo de 64k tokens, algo inviable con el modelo en FP8. Adecuado para entornos de desarrollo y equipos pequeños.
- **Servicio de chat con API OpenAI**: el runtime expone un endpoint compatible, por lo que se integra sin cambios en herramientas existentes (LangChain, LlamaIndex, OpenAI SDK) mediante `base_url`.
- **Agentes con razonamiento multi-paso**: el soporte de tool calls y el modo de pensamiento (`thinking`) permiten construir agentes que planifican y ejecutan llamadas a herramientas con una ventana de contexto amplia.
- **Benchmarks y evaluación de modelos**: el presupuesto de pensamiento (`thinking_budget.py`) garantiza que el modelo produzca una respuesta final, evitando que los harnesses de evaluación interpreten un `finish_reason: "length"` con `content: null` como un fallo.
- **Servicio de inferencia de alta concurrencia**: el continuous batching y la caché paginada permiten atender varias peticiones simultáneas (8-9 streams a ~8k tokens) en una sola GPU.
- **Entornos de producción con presupuesto de VRAM**: la cuantización de 2-3 bits reduce el modelo a ~10 GB, permitiendo ejecutar una instancia completa en GPUs de 16 GB (por ejemplo, RTX 4080) con contexto reducido, o en tarjetas de 24 GB con contexto completo.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks específicos (MMLU, GSM8K, HumanEval) en la información disponible. El autor comunica los siguientes datos agregados:

| Metrica | Valor |
|---|---|
| Velocidad de decodificación | 82,6 tokens/s en una RTX 5090 |
| Rendimiento medio relativo | ~100 % del rendimiento FP8 en 8 benchmarks (según el anuncio oficial) |
| Tamaño del modelo | 10,15 GB en disco |

Estos valores provienen del anuncio en X y del sitio web de Escha Labs, y no se acompañan de comparativas numéricas con otros cuantizadores en la información revisada.

## Requisitos de hardware

- **GPU**: NVIDIA con compute capability 8.0–12.0 (Ampere → Blackwell). No compatible con AMD ni con GPUs de generaciones anteriores.
- **VRAM**: 24 GB recomendados para los valores por defecto (contexto de 65 536 tokens y 8–9 streams concurrentes con prompts cortos). El modelo ocupa ~10 GB, por lo que con contexto reducido podría caber en tarjetas de 16 GB.
- **Sistema**: Linux x86-64 con glibc ≥ 2.28.
- **Software**: Python 3.12, PyTorch 2.9.x con CUDA 12 (pin exacto, no `torch>=2.9`), compilador C en el host y cabeceras de desarrollo de Python (el Triton JIT compila un shim en la captura de CUDA graphs).
- **Despliegue**: el runtime se instala como una rueda que incluye el fork de SGLang y sus dependencias; no se necesita una instalación separada de SGLang.
- **Latencia**: no se ha publicado un throughput detallado por petición; la velocidad de decodificación medida es de 82,6 tokens/s en RTX 5090.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros cuantizadores (por ejemplo, AWQ, GPTQ, GGUF) en la información proporcionada. La comparación más directa sería con el modelo original Qwen3.8-27B en FP8, que requiere ~27 GB de VRAM y no cabe en una GPU de 24 GB sin cuantización adicional. La cuantización Escha de 2 bits consigue un tamaño de ~10 GB con un rendimiento reportado de ~100 % del FP8, pero no se han publicado números de benchmarks concretos para comparar con otros métodos.

| Modelo | Parametros | Contexto | VRAM necesaria | Velocidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B (FP8) | 27 B | 64k | >27 GB | no disponible | referencia |
| Qwen3.8-27B-Escha-W2 | 27 B | 64k | ~10 GB (modelo) | 82,6 tok/s (RTX 5090) | ~100 % FP8 (según autor) |
| Otros cuantizadores (AWQ/GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Solo funciona con modelos Escha de la arquitectura `qwen3_5` densa**: un modelo de otra arquitectura no cargará; se necesita el runtime específico para cada arquitectura.
- **Dependencia de PyTorch 2.9.x exacta**: una versión más nueva de PyTorch rompe la compatibilidad ABI con `import escha` (`undefined symbol`).
- **Requisitos de compilación**: se necesita un compilador C y cabeceras de Python en el host; en imágenes de contenedor reducidas, una biblioteca `libisl` incompleta provoca fallos de `cc1` que se confunden con errores de runtime.
- **Modo thinking**: con el razonamiento activado, la respuesta se divide en `reasoning_content` y `content`; si no se leen ambos, se observa solo la mitad de la respuesta. Además, sin un presupuesto de pensamiento, la respuesta puede terminar con `finish_reason: "length"` y `content: null`.
- **Parámetro `enable_thinking`**: solo se respeta dentro de `chat_template_kwargs`; un campo `enable_thinking` a nivel superior se ignora silenciosamente.
- **Límite de streams**: el pool de estado recurrente (`MAMBA_RATIO=0.3`) limita el número de peticiones concurrentes a 8–9 en una GPU de 24 GB, y los tamaños de batch de CUDA graph superiores se descartan.
- **Licencia**: Apache-2.0 permite uso comercial, pero el runtime es un fork privado de SGLang; no se garantiza la compatibilidad con el upstream ni con versiones futuras de PyTorch.
- **Sesgos y alucinación**: como modelo de razonamiento, puede producir razonamientos largos y plausibles pero incorrectos; se recomienda validación en entornos de producción.

## Enlaces

- [Repositorio del runtime en HuggingFace](https://huggingface.co/EschaLabs/escha-runtime-qwen3dense)
- [Modelo cuantizado compatible: EschaLabs/Qwen3.8-27B-Escha-W2](https://huggingface.co/EschaLabs/Qwen3.8-27B-Escha-W2)
- [Sitio web de Escha Labs](https://www.eschalabs.com/)
- [Anuncio oficial en X](https://x.com/Eschalabs/status/2090476070969720890)
- [Artículo de VirtualUncle sobre la cuantización de Escha](https://virtualuncle.com/escha-labs/)
- [SGLang original (upstream del fork)](https://github.com/sgl-project/sglang)
