# ChatPanel/ModernBERT-base-zeroshot-v2.0

## Resumen

ModernBERT-base-zeroshot-v2.0 es un modelo de clasificación de texto por zero-shot (NLI, inferencia de lenguaje natural) derivado de la arquitectura ModernBERT-base. El modelo original fue desarrollado por Moritz Laurer y esta copia concreta la mantiene ChatPanel como espejo sin modificar del repositorio upstream, con el objetivo de que su pasarela descargue todos los modelos que ejecuta desde un único punto. No se ha reentrenado, convertido ni editado ningún fichero: los pesos son idénticos byte a byte a los del commit `d421c4545a438fd006fb43f8b981c5d908faa1e1` del repositorio original.

El modelo resuelve el problema de clasificar textos en categorías arbitrarias definidas en tiempo de inferencia, sin necesidad de entrenamiento específico por tarea. Se formula como NLI: dada una premisa (el texto a clasificar) y una hipótesis (la etiqueta candidata), el modelo estima la probabilidad de que la hipótesis se siga de la premisa. Es relevante para pipelines de moderación, enrutado y etiquetado flexible donde las categorías cambian con frecuencia.

La arquitectura ModernBERT-base emplea un transformer encoder con RoPE, atención alterna local/global y flash attention, lo que permite contextos largos (hasta 8.192 tokens en el modelo base). Esta copia se distribuye únicamente en formato ONNX cuantizado, pensada para inferencia ligera en CPU o GPU de gama baja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder, RoPE, atención local/global alterna) |
| Parametros totales | ~149 millones (ModernBERT-base; dato no confirmado en la información proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta ficha; ModernBERT-base soporta hasta 8.192 tokens según el modelo upstream |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (no se incluyen safetensors en este repo) |

## Arquitectura y entrenamiento

El modelo subyacente es ModernBERT-base, un encoder transformer diseñado como sucesor de BERT que incorpora rotary positional embeddings (RoPE), atención con ventana local alternada con atención global, y soporte nativo de flash attention en GPUs modernas. Esto le permite manejar secuencias largas con menor coste computacional que BERT clásico.

El ajuste específico zero-shot lo realiza el autor upstream (Moritz Laurer) sobre el checkpoint base, siguiendo la metodología de clasificación zero-shot vía NLI. No se dispone en la información proporcionada de detalles sobre el dataset de ajuste, número de tokens empleados, composición del corpus ni uso de RLHF/DPO. Esta copia de ChatPanel no ha sido reentrenada ni modificada: solo se redistribuyen los artefactos del repositorio original, incluido el fichero ONNX cuantizado.

## Capacidades

- Clasificación zero-shot de texto mediante formulación NLI: asignar un texto a etiquetas arbitrarias sin entrenamiento previo por tarea.
- Clasificación multi-etiqueta: evaluar varias hipótesis de forma independiente sobre la misma premisa.
- Detección de entailment, contradicción y neutralidad entre premisa e hipótesis.
- Inferencia optimizada en CPU y GPU de gama baja gracias al formato ONNX cuantizado.
- Integración en pipelines de clasificación masiva con throughput alto por el reducido tamaño del modelo.
- No soporta tool calling ni function calling.
- No está diseñado para generación de texto libre ni razonamiento multi-paso.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Moderación de contenido: clasificar mensajes en categorías como "spam", "insulto" o "contenido legítimo" definidas en tiempo de ejecución, sin reentrenar el modelo. Adecuado por su baja latencia y coste en ONNX cuantizado.
- Enrutado de tickets de soporte: asignar cada consulta a un departamento usando hipótesis como "problema de facturación", "incidencia técnica" o "consulta comercial". La flexibilidad zero-shot permite cambiar las categorías sin reentrenamiento.
- Etiquetado de reseñas y feedback: clasificar opiniones de usuarios en sentimiento, temática o urgencia para alimentar dashboards de analítica. Útil en entornos donde las etiquetas evolucionan con frecuencia.
- Filtrado de leads y formularios: decidir si un mensaje entrante corresponde a un cliente potencial, una solicitud de soporte o un contacto irrelevante, como paso previo a procesos automáticos.
- Detección de contenido sensible en pipelines de ingestión de datos: marcar documentos que tratan temas regulados antes de su procesamiento posterior.
- Clasificación on-premise en CPU: desplegar el modelo cuantizado en servidores sin GPU para tareas de etiquetado batch, gracias al formato ONNX y al tamaño reducido del repo (0,2 GB).
- Validación en investigación de NLI: usar el checkpoint como referencia para experimentos de zero-shot classification en castellano u otros idiomas, previa verificación del rendimiento en el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~300 MB para los ~149 M de parámetros del encoder base.
- VRAM estimada en ONNX cuantizado: inferior a 200 MB, apta para ejecución en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM para FP16; no se requiere A100/H100.
- Cabe en GPUs consumer: sí, incluidas GTX 1050 Ti, RTX 2060, RTX 3060 y superiores, e incluso en CPU dedicada.
- Opciones de despliegue: ONNX Runtime, Transformers con backend ONNX, servicio propio sobre FastAPI o integración en la pasarela ChatPanel.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatPanel/ModernBERT-base-zeroshot-v2.0 | ~149 M (no confirmado) | no disponible | ONNX cuantizado | Apache 2.0 | Hugging Face |
| MoritzLaurer/ModernBERT-base-zeroshot-v2.0 | ~149 M (no confirmado) | hasta 8.192 tokens (upstream) | safetensors y ONNX | Apache 2.0 | Hugging Face |
| MoritzLaurer/DeBERTa-v3-base-mnli (referencia NLI) | ~184 M | 512 tokens típico | safetensors | MIT/Apache según versión | Hugging Face |

La comparación directa de rendimiento con alternativas no está disponible en la información proporcionada. La diferencia principal de esta copia frente al original es que solo se distribuye el artefacto ONNX cuantizado, lo que reduce el tamaño del repo a 0,2 GB pero elimina la posibilidad de cargar pesos en safetensors o reentrenar el modelo a partir de este repositorio.

## Limitaciones y advertencias

- Solo contiene el artefacto ONNX cuantizado; no se incluyen pesos en safetensors, por lo que no es apto para fine-tuning desde este repositorio.
- La cuantización puede introducir una ligera degradación en la precisión respecto a los pesos originales en FP32/FP16.
- Riesgo de alucinación inherente a la formulación NLI: etiquetas formuladas de forma ambigua o hipótesis mal redactadas producen puntuaciones poco fiables.
- No se ha validado el rendimiento del modelo en idiomas distintos del inglés; los idiomas soportados no están especificados.
- El sesgo del modelo depende del dataset de entrenamiento upstream, no documentado en esta ficha.
- El contexto máximo efectivo no está confirmado en el repositorio de esta copia.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream y la atribución correspondiente.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en producción ni validación comunitaria.
- No incluye pipeline declarado en Hugging Face, por lo que su uso requiere especificar manualmente la tarea (`text-classification` o `zero-shot-classification`).

## Enlaces

- Repositorio Hugging Face (esta copia): https://huggingface.co/ChatPanel/ModernBERT-base-zeroshot-v2.0
- Repositorio upstream: https://huggingface.co/MoritzLaurer/ModernBERT-base-zeroshot-v2.0
- Commit upstream de referencia: https://huggingface.co/MoritzLaurer/ModernBERT-base-zeroshot-v2.0/tree/d421c4545a438fd006fb43f8b981c5d908faa1e1
- Modelo base ModernBERT (LightOn): https://huggingface.co/lightonai/modernbert-base
