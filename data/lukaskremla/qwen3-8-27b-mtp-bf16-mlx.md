# lukaskremla/Qwen3.8-27B-MTP-bf16-MLX

## Resumen

El modelo `lukaskremla/Qwen3.8-27B-MTP-bf16-MLX` no es un modelo de lenguaje autónomo, sino un drafter de predicción multi-token (MTP) extraído de los tensores nativos del modelo Qwen/Qwen3.8-27B y convertido al formato MLX para su uso con mlx-vlm. Su función es actuar como modelo auxiliar de decodificación especulativa junto al modelo objetivo Qwen3.8-27B, acelerando la inferencia al proponer varios tokens por paso en lugar de uno solo.

El drafter pesa aproximadamente 424 millones de parámetros en precisión BF16 y ocupa 0,9 GB en el repositorio. Está diseñado para funcionar con las versiones cuantizadas del modelo objetivo en 2, 3, 4, 5, 6 y 8 bits, sin necesidad de que las cuantizaciones coincidan entre drafter y objetivo. Su relevancia radica en permitir una inferencia más rápida del modelo Qwen3.8-27B en hardware Apple Silicon mediante el framework MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP sidecar (Multi-Token Prediction) para decodificación especulativa |
| Parametros totales | 424.699.392 (~424 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | BF16 (formato nativo del drafter) |
| Idiomas soportados | No disponible (heredados del modelo objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es un drafter MTP extraído de los tensores nativos de Qwen/Qwen3.8-27B y convertido a formato MLX mediante mlx-vlm versión 0.6.13. No se trata de un modelo entrenado de forma independiente, sino de un componente del modelo Qwen3.8-27B que se ha separado y adaptado para funcionar como módulo auxiliar de decodificación especulativa.

La decodificación especulativa con MTP permite al drafter proponer varios tokens candidatos por cada paso de decodificación, que luego son verificados por el modelo objetivo. Esto reduce el número de pasos de inferencia necesarios y, por tanto, la latencia total. El drafter se comunica con el modelo objetivo a través de la interfaz esperada por mlx-vlm, y es compatible con las versiones cuantizadas del objetivo en 2, 3, 4, 5, 6 y 8 bits sin necesidad de que las cuantizaciones coincidan.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa con predicción multi-token (MTP).
- Compatible con modelos objetivo Qwen3.8-27B cuantizados en 2, 3, 4, 5, 6 y 8 bits en formato MLX.
- Integración con mlx-vlm para modelos con capacidad de visión o solo texto.
- No es un modelo de lenguaje independiente: no genera texto por sí mismo.
- No incluye capacidades de tool calling, razonamiento, código o matemáticas de forma autónoma; todas las capacidades funcionales las aporta el modelo objetivo.

## Casos de uso

- Aceleración de inferencia en Apple Silicon: al desplegar Qwen3.8-27B cuantizado en un Mac con chip M-series, el drafter MTP reduce la latencia por token al proponer múltiples tokens por paso, mejorando la experiencia en aplicaciones de chat interactivo.
- Despliegue de asistentes conversacionales locales: permite ejecutar un modelo de 27B en hardware de consumo con menor latencia percibida, adecuado para prototipos y aplicaciones de escritorio.
- Inferencia con modelos de visión en MLX: al emparejar el drafter con las versiones vision-capable de Qwen3.8-27B, se acelera la generación de texto en tareas de captioning y VQA.
- Optimización de costes en despliegues edge: al reducir los pasos de decodificación, se disminuye el consumo energético y el tiempo de cómputo en dispositivos con recursos limitados.
- Evaluación de decodificación especulativa: sirve como referencia para investigar el impacto del MTP en la velocidad de inferencia frente a la decodificación autoregresiva estándar.
- Integración en pipelines de MLX: desarrolladores que ya usan mlx-vlm pueden incorporar el drafter como componente drop-in para mejorar el throughput de sus aplicaciones sin cambiar el modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de latencia, throughput ni comparativas con decodificación estándar.

## Requisitos de hardware

- Framework: MLX, por lo que requiere hardware Apple Silicon (chip M1 o superior).
- VRAM: no disponible; el drafter en BF16 ocupa 0,9 GB en disco, por lo que la memoria adicional necesaria sobre el modelo objetivo es del orden de 1 GB.
- GPU: integrada en Apple Silicon (GPU unificada); no aplicable a GPU NVIDIA o AMD.
- Opciones de despliegue: mlx-vlm (versión 0.6.13 o compatible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros drafters MTP en formato MLX con datos comparables de rendimiento o especificaciones.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede generar texto por sí mismo y debe cargarse siempre junto al modelo objetivo Qwen3.8-27B.
- Requiere el framework MLX y, por tanto, hardware Apple Silicon; no es compatible con CUDA, ROCm ni otros backends.
- La compatibilidad está limitada a la versión de mlx-vlm 0.6.13 o versiones que mantengan el mismo formato de drafter.
- El rendimiento de la decodificación especulativa depende del modelo objetivo y de la tasa de aceptación de los tokens propuestos, que puede variar según la tarea.
- El recuento de parámetros mostrado por Hugging Face puede ser incorrecto, según advierte el autor, debido a un bug común de visualización en cuantizaciones MLX.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas, ya que el drafter no es un modelo de lenguaje completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-bf16-MLX
- Colección de cuantizaciones MLX de Qwen 3.8 27B: https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
