# AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-MXFP4

## Resumen

AX-Holo-3.1-35B-A3B-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX para Apple Silicon, desarrollado por AutomatosX a partir del modelo base Hcompany/Holo-3.1-35B-A3B. Este último es un modelo de lenguaje de arquitectura mixture of experts (MoE) de la familia Qwen3.5-MoE, con 35.11B parámetros lógicos y 3B activos por token (A3B), que incorpora además un componente de visión. La versión de AutomatosX aplica una cuantización mixta de precisión denominada AXQuant (AXQ) sobre la ruta de texto, preservando los tensores de visión en BF16.

El modelo está pensado para ejecutarse en equipos Apple con chip M-series mediante el runtime MLX-LM, reduciendo el peso total a 21.4 GB. Su relevancia radica en permitir ejecutar localmente un MoE de 35B con ventana de contexto configurada de 262 144 tokens en hardware de consumo, aunque el propio autor advierte que se trata de una evidencia de desarrollo, no de una versión certificada, y que no se publican métricas de calidad ni de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (mixture of experts, MoE) |
| Parametros totales | 35.11B (logicos) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262 144 tokens (configurado; no validado) |
| Tipos de cuantizacion | MXFP4 (4-bit base), con 8-bit y BF16 para tensores protegidos; metodos affine y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Holo-3.1-35B-A3B emplea una arquitectura MoE con 35.11B parámetros lógicos y 3B activos por token, siguiendo el diseño de la familia Qwen3.5-MoE. Incluye un codificador de visión cuyos pesos se conservan íntegramente en BF16 en el checkpoint cuantizado. La conversión a MLX se realizó con AXQuant 1.8.1, que asigna precisiones mixtas: el 95.77% de los parámetros (33.62B) se cuantizan a 4-bit, el 1.51% (529.61M) a 8-bit y el 2.72% (956.29M) se mantienen en BF16. La asignación se basa en prioris de arquitectura, sin calibración previa. No se dispone de información sobre los datos de entrenamiento del modelo original ni sobre procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y conversación: el modelo está diseñado para tareas de text-generation, aunque no se publican métricas de calidad.
- Visión: el checkpoint incluye un sidecar de visión con 333 tensores y 446.57M parámetros en BF16, pero la calidad de las capacidades visuales no ha sido evaluada ni reclamada por el autor.
- Contexto largo: la ventana configurada es de 262 144 tokens, pero se indica explícitamente que es un dato de configuración, no una capacidad validada.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras modalidades: no disponibles; el modelo no incluye audio.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint está optimizado para MLX-LM, permitiendo ejecutar un MoE de 35B en equipos con memoria unificada de al menos 24-32 GB, sin necesidad de GPU dedicada.
- Prototipado de aplicaciones de chat y asistentes conversacionales: su tamaño reducido (21.4 GB) facilita la experimentación local con modelos de gran escala en entornos de desarrollo.
- Evaluación de cuantización mixta en MoE: al ser un checkpoint de desarrollo, sirve para estudiar el impacto de la cuantización AXQ en la ruta de texto frente a la preservación de la torre de visión en BF16.
- Despliegue en entornos con restricciones energéticas o de hardware: al ejecutarse en Apple Silicon, consume menos energía que en GPUs dedicadas, adecuado para aplicaciones edge o de bajo consumo.
- Investigación sobre modelos MoE con visión: permite explorar el comportamiento de un modelo multimodal cuantizado en la parte lingüística y sin cuantizar en la visual, aunque sin garantías de rendimiento.
- Integración en pipelines de generación de texto con contexto largo: la ventana configurada de 262K tokens podría ser útil para procesar documentos extensos, pero debe validarse previamente la calidad real en esa longitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay evidencia de calidad frente a BF16 o líneas base uniformes, ni mediciones de velocidad de kernels, ni evaluación de visión o de contexto largo.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 21.4 GB, por lo que se recomienda un Mac con al menos 24 GB de memoria unificada; 32 GB o más para mayor margen.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con suficiente memoria unificada.
- Compatibilidad con GPU de consumo: no aplica directamente, ya que el formato MLX está diseñado para Apple Silicon; no se proporcionan pesos GGUF ni PyTorch.
- Opciones de despliegue: MLX-LM (runtime principal), posiblemente otros runtimes MLX compatibles.
- Latencia y throughput: no disponibles; no se han publicado mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este checkpoint, por lo que no es posible realizar una comparativa cuantitativa fiable. A nivel estructural, es comparable a otros modelos MoE de ~35B con 3B activos, como el propio Holo-3.1-35B-A3B sin cuantizar o versiones cuantizadas de modelos similares de la familia Qwen3.5-MoE. Sin embargo, al no existir benchmarks, la comparación se limita a especificaciones técnicas:

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Holo-3.1-35B-A3B-MLX-AXQ-MXFP4 | 35.11B | 3B | 262K (config) | Apache-2.0 | MLX Safetensors |
| Hcompany/Holo-3.1-35B-A3B (base) | 35.11B | 3B | no disponible | Apache-2.0 | no disponible |
| Otros MoE cuantizados para MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de desarrollo no certificado: no se han cerrado los gates formales de calidad M0-M8 de AXQuant, por lo que no debe interpretarse como una versión estable.
- Sin evidencia de calidad: no se publican métricas de retención de calidad frente al modelo BF16 original ni frente a cuantizaciones uniformes.
- Riesgo de degradación por cuantización: el 95.77% de los parámetros está en 4-bit, lo que puede afectar a la precisión en tareas complejas; no hay datos que respalden la ausencia de pérdida.
- Visión no evaluada: aunque los tensores de visión se conservan en BF16, no se ha validado la calidad de las capacidades visuales.
- Contexto largo no validado: la ventana de 262 144 tokens es un valor de configuración, no una capacidad demostrada; el rendimiento real en esa longitud es desconocido.
- Sin soporte de MTP: el checkpoint no incluye multi-token prediction, a diferencia de otros modelos de la familia.
- AX Engine no establecido: no se incluye un manifest nativo validado, por lo que la ejecución con AX Engine no está garantizada.
- Licencia Apache-2.0: permite uso comercial, pero las limitaciones anteriores deben tenerse en cuenta antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/Hcompany/Holo-3.1-35B-A3B
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
