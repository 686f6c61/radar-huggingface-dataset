# Hansda/Ivonnet-0.8B-GGUF

## Resumen

Ivonnet-0.8B-GGUF es una conversión al formato GGUF del modelo Illuin/Ivonnet-0.8B, desarrollado por Illuin Technology y empaquetado por el usuario Hansda. No se trata de un modelo generativo al uso, sino de un modelo de decisión orientado a la comprensión de documentos: recibe texto o un estado en formato JSON, opcionalmente imágenes, y devuelve probabilidades calibradas sobre un conjunto de opciones proporcionadas por el usuario. El backbone es Qwen3.5 con 24 capas, del que seis capas usan atención completa sobre toda la fila de la pregunta y el resto son capas Gated DeltaNet con recurrencia causal.

El paquete incluye cinco variantes de cuantización del backbone (Q2_K, Q3_K_M, Q4_K_M, Q6_K y Q8_0, esta última pendiente en el momento de publicación), un proyector de visión compartido en Q8_0 y una cabeza de decisión (readout) en F32 que conserva los valores originales de los tensores. La temperatura de calibración original es de 1,446662 y la readout usa 255 códigos. El modelo base tiene 752.393.024 parámetros reales según safetensors y el repositorio ocupa 2,2 GB.

La relevancia de esta ficha radica en que Ivonnet propone un enfoque distinto al de los LLM generativos: en lugar de producir texto libre, clasifica estados y documentos con salida probabilística calibrada, lo que lo hace adecuado para pipelines de decisión automatizada donde se necesita una confianza numérica y no una respuesta en lenguaje natural. La licencia Apache-2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas, 6 de atención completa y capas Gated DeltaNet con recurrencia causal; incluye proyector de visión y readout de decisión |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens por fila por defecto en el runner (ampliable con `--max-tokens`) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q6_K, Q8_0 (backbone); Q8_0 (proyector de visión); F32 (readout de decisión) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (backbone, proyector y readout); tokenizer original, chat template y configuración del procesador de imagen incluidos |

## Arquitectura y entrenamiento

El backbone es Qwen3.5 con 24 capas. Seis de ellas emplean atención completa y ven toda la fila de la pregunta (la fila completa se procesa en un solo batch), mientras que las capas Gated DeltaNet mantienen recurrencia causal. Esta combinación híbrida permite procesar la fila entera de una vez y puntuar el último estado oculto con la readout original de 255 códigos y la temperatura de calibración de 1,446662. El modelo incorpora además un proyector de visión compartido para entradas de imagen y una cabeza de decisión separada en F32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO. La model card indica que el paquete preserva la implementación original de Illuin Technology para el formateo de decisiones y la gestión de respuestas mediante `source_protocol.py`. Las cuantizaciones se generan de forma independiente a partir de un GGUF en BF16, y la readout conserva los valores tensoriales originales en F32.

## Capacidades

- Clasificación de decisiones con probabilidades calibradas sobre opciones suministradas por el usuario, a partir de texto o de un estado JSON.
- Comprensión de documentos: procesa estados textuales (por ejemplo, el contenido de una factura) y devuelve la probabilidad de cada criterio definido.
- Entrada multimodal: acepta listas de imágenes locales junto al estado textual, incluidos casos con dos imágenes en una misma pregunta.
- Preguntas de tipo `choice` con criterios etiquetados y descripciones asociadas.
- Procesamiento de fila completa en un único batch, con puntuación del último estado oculto.
- Salida probabilística numérica en lugar de texto generado libremente.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, generación de código ni matemáticas.

## Casos de uso

- Verificación de pago de facturas: el modelo recibe el estado textual de la factura y devuelve la probabilidad de que esté pagada o pendiente, usando criterios etiquetados y calibrados para umbrales automáticos en cuentas por cobrar.
- Triaje documental en back office: clasificación de documentos entrantes en categorías predefinidas con probabilidad asociada, lo que permite enrutar automáticamente solo los casos por encima de un umbral de confianza.
- Extracción de decisiones con imagen: procesamiento de documentos escaneados o fotografías de facturas, formularios o albaranes mediante el proyector de visión Q8_0, útil en digitalización de archivos físicos.
- Validación de estados JSON en pipelines: integración como paso de decisión dentro de un flujo que ya produce estados estructurados, devolviendo probabilidades que alimentan reglas de negocio o sistemas expertos.
- Control de calidad y auditoría: puntuación de casos con dos imágenes (por ejemplo, comparación de documento original y copia) para detectar discrepancias mediante los criterios definidos.
- Moderación y clasificación de contenido textual: uso del modo texto para etiquetar estados según criterios configurables, con salida calibrada que facilita la revisión humana de los casos dudosos.
- Despliegue en entornos con memoria limitada: las variantes Q2_K y Q3_K_M permiten ejecutar el backbone en equipos modestos, aunque la model card recomienda Q4_K_M o superior cuando importa la fidelidad de la decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente pruebas de humo (smoke tests) de software y formato, no medidas de precisión:

| Variante | Acuerdo con la fuente (top-choice) |
|---|---|
| Q4_K_M | 5/5 |
| Q6_K | 5/5 |
| Q3_K_M | 5/5 |
| Q2_K | 3/5 |
| Q8_0 | 5/5 |

El proyector Q8_0 obtuvo una similitud coseno mínima de 0,9831 y un error L2 relativo máximo de 0,185 en las entradas de prueba. La model card advierte explícitamente que estas pruebas no miden la precisión de benchmark.

## Requisitos de hardware

- Tamaños de archivo del backbone: Q2_K 422.327.264 bytes, Q3_K_M 466.222.560 bytes, Q4_K_M 529.297.376 bytes, Q6_K 629.744.096 bytes; Q8_0 pendiente de publicación.
- Proyector de visión Q8_0: 115.923.680 bytes; readout F32: 1.044.704 bytes.
- El modelo cabe con holgura en GPUs de consumo: las variantes Q2_K a Q6_K ocupan menos de 1 GB en disco, por lo que la VRAM necesaria para los pesos es inferior a 1 GB en todos los casos; el grueso del consumo vendrá del prefill de la fila completa.
- El runner reserva memoria para el prefill de toda la fila, con límite por defecto de 2.048 tokens; conviene dimensionar la VRAM en función de `--max-tokens`.
- Despliegue mediante llama.cpp en el commit probado 360e1349f0009c5ad99d21e3c4546b707addc68a, compilando el target `mtmd` y el runner `decision_forward.cpp`.
- Dependencias Python: transformers 5.17.0, torch, torchvision, pillow, numpy y `llama.cpp/gguf-py`.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión para comprensión de documentos con salida probabilística calibrada).

## Limitaciones y advertencias

- Las pruebas de validación incluidas son smoke tests de software y formato; no constituyen evidencia de precisión en benchmarks ni en producción.
- Q2_K mostró solo 3/5 de acuerdo con la fuente en las pruebas; la model card recomienda Q4_K_M o superior cuando la fidelidad de la decisión es crítica.
- La variante Q8_0 del backbone figura como pendiente en el momento de publicación.
- El límite de fila por defecto es de 2.048 tokens; filas más largas requieren aumentar `--max-tokens` y reservar más memoria para el prefill completo.
- No se dispone de información sobre idiomas soportados ni sobre sesgos conocidos.
- El modelo devuelve probabilidades calibradas, no texto generado; no debe usarse como LLM conversacional ni para generación libre.
- El pipeline declarado es `text-classification` y la model card marca `inference: false`, por lo que no está pensado para inferencia genérica en plataformas estándar sin el runner específico.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse `LICENSE` y `NOTICE` para los términos y atribuciones del modelo upstream.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hansda/Ivonnet-0.8B-GGUF
- Modelo base: https://huggingface.co/illuin/Ivonnet-0.8B/tree/6a6a979489d262861ad3c34faaa1a763d1ce4baf
- llama.cpp (commit probado): https://github.com/ggml-org/llama.cpp/tree/360e1349f0009c5ad99d21e3c4546b707addc68a
