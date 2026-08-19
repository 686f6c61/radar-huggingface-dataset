# Hiccup1234/Kroma-v0.3-INT8-ConvRot

## Resumen

Kroma v0.3 INT8 ConvRot es una versión cuantizada del modelo de generación de imágenes lodestones/Kroma, preparada específicamente para su uso en ComfyUI. La ha publicado el usuario Hiccup1234 en Hugging Face, y consiste en los pesos del modelo base convertidos a formato INT8 con una rotación ConvRot (derivada de QuaRot) para reducir el tamaño del archivo y el consumo de memoria, manteniendo una calidad aceptable. El repositorio contiene únicamente los pesos convertidos, no el modelo original ni código de inferencia.

Esta cuantización resulta relevante para desarrolladores y artistas que trabajan con ComfyUI y necesitan ejecutar el modelo Kroma en GPUs con VRAM limitada, ya que el archivo pesa 14,1 GB en lugar de los pesos originales en FP16 o FP32. La licencia es la krea-2-community-license, que impone restricciones de uso específicas. No se dispone de información sobre la arquitectura interna, el número de parámetros o la longitud de contexto, ya que la model card solo describe el proceso de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: lodestones/Kroma) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con rotacion ConvRot (grupo 256, escalado por fila) |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (otra) |
| Formato de pesos | safetensors cuantizado compatible con ComfyUI |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base Kroma. La model card indica que se trata de una cuantización post-entrenamiento del archivo kroma-v0.3-base.safetensors, realizada con la herramienta silveroxides/convert_to_quant v1.3.3. El proceso aplica cuantización INT8 con escalado por fila y una rotación ConvRot (grupo de 256) para reducir la pérdida de calidad típica de la cuantización por filas. Se cuantizaron 224 pesos 2D, se omitieron 40 pesos sensibles y se generaron 878 tensores de salida. No se menciona ningún entrenamiento adicional, fine-tuning o ajuste con RLHF/DPO.

## Capacidades

- Generación de imágenes a partir de prompts de texto (según el modelo base Kroma, aunque no se detallan capacidades específicas).
- Compatible con ComfyUI mediante safetensors cuantizados con metadatos de cuantización.
- Inferencia con menor uso de VRAM gracias a la cuantización INT8.
- No se documentan capacidades de tool calling, agentes, razonamiento multimodal ni otras funciones más allá de la generación de imágenes.

## Casos de uso

- Generación de imágenes en flujos de trabajo de ComfyUI: el modelo se carga directamente como checkpoint cuantizado, permitiendo ejecutar pipelines de difusión en GPUs con menos memoria que el modelo original.
- Prototipado rápido de conceptos visuales: artistas y diseñadores pueden generar variaciones de imágenes sin necesidad de hardware de gama alta.
- Integración en entornos de producción con restricciones de VRAM: al pesar 14,1 GB, es viable en GPUs de 16 GB o más, reduciendo costes de infraestructura.
- Experimentación con cuantización INT8 y rotación ConvRot: sirve como referencia para evaluar la calidad de este método frente a otras cuantizaciones.
- Uso educativo: permite estudiar el impacto de la cuantización en modelos de generación de imágenes dentro de ComfyUI.
- Despliegue en servicios de inferencia que soporten safetensors cuantizados de ComfyUI, siempre que se cumpla la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como FID, CLIP score o comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al menos 16 GB para cargar el modelo en memoria (14,1 GB de pesos más overhead de inferencia). Con cuantización INT8, podría ejecutarse en GPUs con 12 GB si se usa swapping, pero no está garantizado.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB) o similares con soporte CUDA.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) y posiblemente en RTX 3080 Ti (12 GB) con configuraciones de bajo VRAM, aunque no se ha verificado.
- Opciones de despliegue: ComfyUI (principal), también podría usarse con otros frontends que soporten safetensors cuantizados, pero no se mencionan alternativas como vLLM u Ollama (orientados a LLM, no a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano archivo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hiccup1234/Kroma-v0.3-INT8-ConvRot | Cuantizacion de Kroma v0.3 | 14,1 GB | INT8 + ConvRot | krea-2-community-license | Hugging Face |
| Stabhappy/kroma-v0.2-base-INT8-convrot | Cuantizacion de Kroma v0.2 | no disponible | INT8 + ConvRot | no disponible | Hugging Face |
| lodestones/Kroma (base) | Modelo original | no disponible | FP16/FP32 | krea-2-community-license | Hugging Face |

No se dispone de datos de rendimiento para comparar objetivamente. La versión v0.2 es anterior y probablemente tenga características similares, pero no hay información detallada.

## Limitaciones y advertencias

- Licencia restrictiva: la krea-2-community-license puede limitar el uso comercial o requerir atribución. Es necesario revisar los términos completos en el repositorio fuente.
- Sin documentación sobre el modelo base: no se conocen sesgos, alucinaciones o limitaciones de idioma del modelo Kroma original.
- Riesgo de pérdida de calidad: la cuantización INT8 puede degradar la fidelidad de las imágenes generadas, especialmente en detalles finos, aunque ConvRot mitiga parcialmente este efecto.
- Compatibilidad limitada: requiere una versión reciente de ComfyUI que soporte safetensors cuantizados con metadatos de cuantización.
- Sin garantías de soporte: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto personal sin mantenimiento activo.
- No se proporcionan instrucciones de uso más allá de la carga en ComfyUI; no hay ejemplos de prompts ni configuraciones recomendadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hiccup1234/Kroma-v0.3-INT8-ConvRot
- Modelo base: https://huggingface.co/lodestones/Kroma
- Herramienta de cuantización: https://github.com/silveroxides/convert_to_quant
- Versión similar v0.2: https://huggingface.co/Stabhappy/kroma-v0.2-base-INT8-convrot
