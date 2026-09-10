# meshllm/Muse-Glimmer-30B-UD-Q4_K_XL-layers

## Resumen

Mesh LLM distribuye este paquete de capas GGUF del modelo Muse-Glimmer-30B, un modelo de la familia Muse con 30.000 millones de parámetros y cuantización UD-Q4_K_XL. Deriva de unsloth/Muse-Glimmer-30B-GGUF y no añade pesos nuevos: divide el archivo GGUF en 52 capas para inferencia distribuida sobre un clúster local.

El objetivo es ejecutar un modelo de 30B en hardware limitado repartiendo las capas entre varias máquinas. Cada nodo aporta memoria y cómputo, y el servicio expone una API compatible con OpenAI en el puerto 3131. Esto permite inferencia privada, evita la dependencia de la nube y facilita la integración con aplicaciones que ya usan la interfaz de chat de OpenAI.

Los datos públicos no incluyen arquitectura, contexto ni detalles de entrenamiento. La etiqueta image-text-to-text de HuggingFace sugiere que el modelo base puede procesar imágenes y texto, pero no hay documentación adicional. El repositorio incluye un manifiesto con sumas de verificación para auditar el paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: unsloth/Muse-Glimmer-30B-GGUF) |
| Parametros totales | 30B (según model card); los safetensors del paquete indican 483.944.704, correspondientes a metadatos |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado por capas (mesh-llm layer package) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo no está documentada en la información disponible.
