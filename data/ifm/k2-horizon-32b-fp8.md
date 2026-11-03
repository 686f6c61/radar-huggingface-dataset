# IFM/K2-Horizon-32B-FP8

## Resumen

K2-Horizon-32B-FP8 es la versión cuantizada en FP8 del modelo denso K2-Horizon-32B, desarrollado por IFM (Instituto de Fundaciones de Modelos). Se trata de un modelo decoder-only de 32B parámetros con una ventana de contexto nativa de 512K tokens (524.288), pensado para tareas de razonamiento, código y flujos agénticos. Esta variante FP8 reduce el peso en memoria y acelera la inferencia en hardware compatible con FP8, manteniendo un rendimiento cercano al modelo original en BF16.

El modelo pertenece a la familia K2-Horizon, que incluye miembros densos y MoE. La model card indica que se trata de la "Stage 1" del entrenamiento final, con checkpoints intermedios que se publicarán para estudiar la evolución de capacidades a lo largo del entrenamiento. La licencia es Apache 2.0 y el modelo se distribuye con pesos abiertos, datos de preentrenamiento y midtraining públicos, así como el código de entrenamiento.

La relevancia actual radica en su combinación de contexto extremadamente largo (512K), licencia permisiva y cuantización FP8, lo que lo hace atractivo para despliegues en producción con requisitos de memoria ajustados y para investigación sobre modelos densos de escala media.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parámetros totales | 34.779.304.960 (≈34,8B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) nativo desde midtraining |
| Tipos de cuantización | FP8 (pesos estáticos, escala por bloque 128×128; activaciones dinámicas, escala por grupo 1×128 en el eje de canales de entrada). Todas las capas lineales excepto `lm_head` |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 32B parámetros, sin mezcla de expertos. La model card no detalla el número exacto de capas, dimensiones ocultas ni cabezas de atención. La ventana de contexto de 512K tokens se establece de forma nativa a partir de las etapas de midtraining, no mediante extensión post-hoc.

El entrenamiento se realizó en al menos dos etapas: preentrenamiento con el dataset `IFM/K2-Horizon-Pretrain-Data` y midtraining con `IFM/K2-Horizon-Midtrain-Data`, ambos públicos. La model card menciona que se publicarán los datos, la receta y el código de entrenamiento (pre-training en `github.com/ifm-ai/xllm`, post-training en `github.com/ifm-ai/horizon-post-train`). No se especifica el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. La cuantización FP8 se aplica sobre todas las capas lineales excepto `lm_head`, con pesos estáticos y activaciones dinámicas, lo que permite inferencia más rápida en GPUs con soporte FP8 (H100, H200, B200, etc.).

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y resolución de problemas de múltiples pasos (evaluado en benchmarks agénticos y de razonamiento según la model card).
- Generación y comprensión de código (evaluado en benchmarks de coding).
- Contexto largo de 512K tokens, adecuado para documentos extensos, repositorios de código completos o conversaciones multi-turno muy largas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: la model card menciona evaluación en benchmarks agénticos, lo que sugiere capacidades en este ámbito, aunque no se detalla el mecanismo.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios de código completos: con 512K tokens de contexto, el modelo puede ingerir múltiples archivos y generar revisiones, refactorizaciones o documentación coherente a nivel de proyecto.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso sin perder contexto, gracias a la ventana de 512K tokens y a la licencia Apache 2.0 que permite uso comercial.
- Procesamiento de documentación legal o técnica: resumen y extracción de información de contratos, manuales o informes de cientos de páginas en una sola pasada.
- Generación de código en producción: integración en pipelines de CI/CD para revisión automática de PRs, generación de tests o corrección de errores, aprovechando el contexto largo para incluir el código circundante.
- Investigación sobre entrenamiento de modelos: los checkpoints intermedios y los datos públicos permiten estudiar la evolución de capacidades durante el entrenamiento.
- Despliegue en hardware con memoria limitada: la cuantización FP8 reduce el footprint a aproximadamente la mitad respecto a BF16, facilitando la inferencia en GPUs de 40-48 GB.
- Razonamiento agéntico: planificación y ejecución de tareas multi-paso con contexto acumulado de herramientas y observaciones.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparando K2-Horizon-32B-Stage1 con Qwen3.8-27B, Muse Glimmer-30B e IBM Granite 4.2 30B en benchmarks agénticos, de coding y razonamiento. Sin embargo, los valores numéricos de los benchmarks no están disponibles en la información proporcionada (la tabla se corta antes de mostrar las filas de resultados). No se han publicado resultados numéricos de benchmarks en la información disponible.

| Modelo | Parámetros | Arquitectura |
|---|---|---|
| K2-Horizon-32B-Stage1 | 32B | Dense |
| Qwen3.8-27B | 27B | Dense |
| Muse Glimmer-30B | 30B | Dense |
| IBM Granite 4.2 30B | 30B | Dense |

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 35 GB solo para pesos (34,8B parámetros × 1 byte), más overhead de activaciones y KV cache. Con contexto de 512K tokens, la KV cache puede ser muy grande y requerir decenas de GB adicionales según la configuración.
- GPU recomendadas: H100, H200, B200 y otras GPUs con soporte nativo FP8. Para FP8 en consumer, las RTX 4090/5090 no tienen soporte FP8 nativo completo, por lo que se requeriría conversión a otros formatos.
- ¿Cabe en consumer GPU? Los pesos FP8 (~35 GB) no caben en GPUs de 24 GB (RTX 4090) sin cuantización adicional (por ejemplo, a 4 bits). En GPUs de 48 GB (RTX 6000 Ada, A6000) podría caber con contexto limitado.
- Opciones de despliegue: transformers (librería indicada), vLLM, TGI y otros motores con soporte FP8 y `compressed-tensors`. No se confirma soporte en llama.cpp u Ollama para FP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-32B-FP8 | 34,8B | 512K | Apache 2.0 | safetensors FP8 | HuggingFace |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible | no disponible |
| IBM Granite 4.2 30B | 30B | no disponible | no disponible | no disponible | no disponible |

Los datos de contexto, licencia y formato de los modelos comparables no están disponibles en la información proporcionada. La model card los incluye en su tabla comparativa, pero solo con parámetros y arquitectura.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés según la etiqueta de idioma; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Checkpoint intermedio: la model card indica explícitamente que se trata de la "Stage 1" y que el checkpoint final está pendiente de publicación; el rendimiento puede no representar la versión final.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- Contexto largo: aunque la ventana es de 512K tokens, el rendimiento efectivo en contextos extremos puede degradarse; no se aportan datos de evaluación específicos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos de los datasets de entrenamiento (también públicos) por posibles restricciones adicionales.
- Cuantización FP8: aunque el rendimiento se mantiene cercano al BF16 según el autor, puede haber degradaciones sutiles en tareas sensibles a la precisión numérica.
- Sin confirmación de tool calling: no se especifica si el modelo ha sido entrenado para function calling, lo que limita su uso directo en pipelines agénticos sin verificación previa.

## Enlaces

- HuggingFace: https://huggingface.co/IFM/K2-Horizon-32B-FP8
- Modelo base: https://huggingface.co/IFM/K2-Horizon-32B
- Código de preentrenamiento: https://github.com/ifm-ai/xllm
- Código de post-entrenamiento: https://github.com/ifm-ai/horizon-post-train
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
