# Pegainfer/kern-qwen38-sm103

## Resumen

Este repositorio no es un modelo de lenguaje en sí, sino un paquete de kernels CUDA compilados y manifiestos JSON para ejecutar el modelo Qwen3.8-27B en una GPU NVIDIA GB300 (arquitectura sm_103a) mediante el runtime `kern`, un motor de inferencia GPU agnóstico al modelo desarrollado por Pegainfer. El paquete resuelve el problema de desplegar modelos grandes en hardware específico con kernels optimizados y sin depender de PyTorch, ya que el runtime contiene únicamente los programas de dispositivo (cubins) y la descripción de cómo ensamblar los tensores de los checkpoints originales.

El modelo subyacente es Qwen3.8-27B, con 27 000 millones de parámetros, y también se incluye soporte para su variante especulativa DFlash2. No se especifica la longitud de contexto en la información disponible. El repositorio no aloja los pesos ni el tokenizador; estos se cargan desde los checkpoints publicados por Qwen y incoai. La relevancia actual radica en ofrecer una vía de ejecución de alto rendimiento para Qwen3.8-27B en hardware de última generación, con kernels de atención de NVIDIA TensorRT-LLM y operaciones GDN de vLLM, todo empaquetado en un formato reproducible y verificable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kern runtime GPU (modelo subyacente: Qwen3.8-27B) |
| Parametros totales | 27B (modelo subyacente Qwen3.8-27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | per-artifact |
| Formato de pesos | No contiene pesos; los checkpoints originales se cargan desde safetensors (Qwen/Qwen3.8-27B y incoai/Qwen3.8-27B-DFlash2) |

## Arquitectura y entrenamiento

El paquete se compone de dos elementos: una carpeta `cubins/` con todos los módulos de dispositivo compilados (cubins) y una carpeta `manifests/` con dos manifiestos JSON que describen cómo ejecutar Qwen3.8-27B. El manifiesto `qwen3.8-27b.json` define los programas de prefill, decode y decode_batch, con atención completa sobre kernels de TensorRT-LLM generados y capas GDN sobre kernels Triton de vLLM. El manifiesto `qwen3.8-27b-dflash2.json` añade el borrador especulativo DFlash2, con programas de draft, verify y round, sin código adicional en el runtime.

Los kernels provienen de tres orígenes: kernels escritos a mano en el repositorio de `kern` (compilados con `nvcc -cubin -arch=sm_103a`), kernels capturados de vLLM 0.28 (Triton JIT y extensión CUDA, incluyendo las operaciones GDN de flash-linear-attention, con licencias Apache-2.0 y MIT) y kernels de atención de NVIDIA TensorRT-LLM (licencia Apache-2.0). Para los kernels escritos a mano se usó CUDA 13.0 nvcc; el manifiesto fija la versión exacta de la toolchain, ya que un compilador distinto generaría un cubin diferente y, por tanto, un sha distinto. No hay fase de entrenamiento en este repositorio: es un paquete de inferencia.

## Capacidades

- Ejecución de Qwen3.8-27B en GPU GB300 (sm_103a) mediante el runtime `kern`, con soporte para prefill, decode y decode_batch.
- Decodificación especulativa con DFlash2: los manifiestos incluyen programas de draft, verify y round, permitiendo acelerar la generación sin modificar el runtime.
- Resolución de kernels por contenido (sha256), de modo que cada versión de un kernel puede coexistir sin colisiones.
- Ensamblado de los pesos a partir de los safetensors originales: el manifiesto indica qué tensores (o rectángulos de tensores) rellenan cada buffer, y un programa `load` calcula tablas rope y offsets de norm en el dispositivo.
- Herramientas de verificación y medición: `kern test` atestigua un manifiesto contra otro comparando logits, y `kern bench` mide programas en aislamiento.
- Compatibilidad con el ecosistema `pegainfer` (motor de inferencia en Rust + CUDA, sin PyTorch, compatible con OpenAI), aunque este repositorio en particular no incluye el servidor.

## Casos de uso

- Despliegue de Qwen3.8-27B en un nodo con GPU GB300 para inferencia de baja latencia, usando `kern run` con el manifiesto base y los pesos publicados por Qwen.
- Evaluación de kernels personalizados: se puede comparar un manifiesto nuevo contra otro de referencia con `kern test` sobre logits, lo que permite validar cambios en kernels sin ejecutar la inferencia completa.
- Benchmarking aislado de programas de atención (prefill, decode, decode_batch) con `kern bench`, útil para optimizar el rendimiento de operaciones concretas en sm_103a.
- Integración en pipelines de producción que requieran un runtime sin PyTorch: el motor `pegainfer` es compatible con OpenAI y puede servir modelos desde Qwen3 hasta Kimi-K2, por lo que este paquete puede usarse como backend de kernels para ese motor.
- Investigación en decodificación especulativa: el manifiesto DFlash2 permite experimentar con draft y verify en el mismo modelo, midiendo el impacto en velocidad y calidad.
- Reproducibilidad de builds de kernels: al fijar la toolchain y el sha de cada cubin, se puede auditar qué versión exacta de un kernel se está usando en un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU obligatoria: NVIDIA GB300 (sm_103a). Los cubins están compilados específicamente para `sm_103a`, por lo que no funcionan en otras arquitecturas.
- No cabe en GPU de consumo como RTX 4090 ni en GPUs de centros de datos anteriores.
- VRAM estimada: no disponible. Depende del tamaño de Qwen3.8-27B y de la implementación de atención usada.
- Opciones de despliegue: `kern run` con `--manifest`, `--kernels`, `--weights` y `--gpu`; también `kern test` y `kern bench` para validación y medición.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre paquetes de kernels comparables para Qwen3.8-27B en GB300.

## Limitaciones y advertencias

- Requiere hardware muy específico (GB300, sm_103a); no es portable a otras GPUs ni a entornos sin esa arquitectura.
- No incluye los pesos. Es necesario descargar por separado los checkpoints de Qwen/Qwen3.8-27B y, para el modo especulativo, de incoai/Qwen3.8-27B-DFlash2.
- Licencia per-artifact: los términos exactos deben revisarse en el model card. Los kernels de vLLM son Apache-2.0, los de FLA MIT y los de TensorRT-LLM Apache-2.0, pero la combinación puede requerir atribución y cumplimiento de cada licencia.
- Los cubins escritos a mano están vinculados a una toolchain concreta (CUDA 13.0 nvcc). Un recompilado con otra versión genera un sha diferente y puede no coincidir numéricamente, lo que debe verificarse con `kern test`.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de idioma del modelo subyacente en los datos proporcionados.
- El repositorio tiene 0 descargas y 0 likes, y no hay evidencia de uso en producción; se debe evaluar su madurez antes de adoptarlo en entornos críticos.

## Enlaces

- Repositorio en HuggingFace: [https://huggingface.co/Pegainfer/kern-qwen38-sm103](https://huggingface.co/Pegainfer/kern-qwen38-sm103)
- Runtime `kern`: [https://github.com/pegainfer-project/kern](https://github.com/pegainfer-project/kern)
- Proyecto `pegainfer`: [https://github.com/pegainfer-project/pegainfer](https://github.com/pegainfer-project/pegainfer)
- Sitio web de `pegainfer`: [https://pegainfer.org/](https://pegainfer.org/)
- Checkpoint base: [https://huggingface.co/Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Checkpoint del draft especulativo: [https://huggingface.co/incoai/Qwen3.8-27B-DFlash2](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2)
