# am2amai/el-class-ultrabert-380m-full-ft-100k_512

## Resumen

El modelo `am2amai/el-class-ultrabert-380m-full-ft-100k_512` es un clasificador de texto especializado en el enrutamiento de correos electrónicos B2B para la empresa Electrolab. Se trata de un ajuste fino completo (*full fine-tuning*) del modelo base UltraBERT-380M, desarrollado por el grupo DMIS-Lab, que ha sido adaptado para clasificar comunicaciones entrantes en 13 categorías operativas concretas (ventas, mantenimiento, garantías, instalaciones, facturación, etc.). El autor del ajuste es el usuario `am2amai`, y el modelo está pensado para integrarse en sistemas ERP y de ticketing internos.

Arquitectónicamente, es un transformer encoder de 377,5 millones de parámetros con una ventana de contexto máxima de 512 tokens, entrenado exclusivamente en inglés sobre un corpus propietario de 104.586 correos electrónicos reales de Electrolab. No es un modelo generativo: realiza únicamente clasificación de secuencias, lo que elimina por diseño los riesgos de alucinación o generación de contenido tóxico.

Su relevancia es acotada pero muy específica: demuestra cómo un modelo encoder de tamaño medio puede resolver con alta precisión (~96,17% de accuracy y ~0,9441 de Macro F1 en test) una tarea de enrutamiento empresarial con taxonomía cerrada. No obstante, su utilidad fuera del dominio de Electrolab es prácticamente nula, y su licencia "other" exige revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT-380M) |
| Parametros totales | 377.550.861 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (repo incluye safetensors y joblib; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors, joblib, pytorch (custom_code) |

## Arquitectura y entrenamiento

El modelo parte de UltraBERT-380M, un encoder transformer de 377,5 millones de parámetros. Sobre esta base se realizó un ajuste fino completo de todos los parámetros (no LoRA ni adaptadores) para una tarea de clasificación multiclase con 13 etiquetas. La cabeza de clasificación se entrena junto con el resto del encoder, lo que explica el tamaño del checkpoint (1,5 GB en el repositorio).

El corpus de entrenamiento es propietario y específico de Electrolab: 104.586 correos reales etiquetados, divididos en 80/10/10 estratificado (83.668 de entrenamiento, 10.459 de validación, 10.459 de test). El preprocesado consistió en fusionar asunto y cuerpo, eliminar etiquetas HTML y espacios redundantes, y truncar a 512 tokens. La optimización se ejecutó con el `Trainer` de Hugging Face durante 3 épocas, con learning rate 1e-5, scheduler de cosine annealing, 160 pasos de warmup, batch efectivo de 32 (8 por dispositivo con 4 pasos de acumulación), optimizador AdamW (`adamw_torch_fused`), weight decay 0,01, label smoothing 0,05, precisión `bf16` + `tf32` y gradient checkpointing. El entrenamiento se realizó en una NVIDIA A100. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, lo cual es coherente con un modelo puramente discriminativo.

## Capacidades

- Clasificación de texto multiclase en 13 categorías operativas de negocio B2B (instalación, inspección, mantenimiento, ventas, garantías, facturación, pedidos, etc.).
- Enrutamiento automático de correos entrantes a colas de ticketing o buzones regionales.
- Procesamiento de texto en inglés con contexto de hasta 512 tokens por documento.
- Integración con pipelines de Hugging Face mediante `transformers.pipeline("text-classification")`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No es multilingüe: solo inglés.
- No tiene capacidades generativas, de visión ni de audio.
- No dispone de modo "thinking" ni de salida estructurada más allá de la etiqueta predicha y su score.

## Casos de uso

- Enrutamiento de correos entrantes en Electrolab: el modelo inspecciona el asunto y el cuerpo fusionados y asigna cada mensaje a una de las 13 colas operativas, reduciendo la latencia de respuesta de los service desks regionales.
- Automatización de ticketing en ERP: integrado como paso previo a la creación de tickets, permite etiquetar automáticamente la categoría (por ejemplo, "WRN - Warranty Complaint" o "MSCH - Maintenance Schedule") y dirigir el ticket al equipo correcto sin intervención manual.
- Triaje de solicitudes comerciales: distingue entre cotizaciones de instrumentos nuevos, repuestos, pedidos de compra, facturas y oportunidades de lead, lo que permite priorizar el trabajo del equipo de ventas.
- Detección de rebotes y autorespuestas: la categoría "Auto-reply / Bounce" permite filtrar mensajes no accionables antes de que lleguen a un operador humano.
- Gestión de incidencias y averías: la categoría "ISS - Inspection & Service (Complaint / Breakdown)" facilita la apertura automática de partes de servicio técnico con la prioridad adecuada.
- Clasificación de correos de garantía: la etiqueta "WRN - Warranty Complaint" permite canalizar reclamaciones de garantía al flujo de postventa correspondiente.
- Base para un sistema de analítica operativa: al etiquetar grandes volúmenes de correo, permite construir métricas de volumen por categoría, tiempos de respuesta y distribución de la carga entre equipos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy | ~96,17% |
| Macro F1 | ~0,9441 |
| Test loss | 0,4232 |
| Parametros entrenables | 377.550.861 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB solo para pesos, más activaciones; en la práctica, entre 2 y 3 GB para batches pequeños.
- VRAM estimada en bf16/fp16: en torno a 0,8-1 GB para pesos, más overhead; viable en GPUs consumer de gama media.
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento), H100, L4, A10G, RTX 4090, RTX 3090, RTX 4080.
- Cabe en GPUs consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores; también en GPUs con 4-6 GB si se ejecuta en fp16 con batches pequeños.
- También puede ejecutarse en CPU para volúmenes moderados, dado el tamaño moderado del modelo.
- Opciones de despliegue: `transformers` (pipeline nativo), TorchServe, FastAPI + Uvicorn, ONNX Runtime, TGI (Text Generation Inference no aplica porque no es generativo, pero se puede servir con contenedores de inferencia estándar), vLLM no es adecuado para clasificación pura aunque soporta algunos encoders.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| el-class-ultrabert-380m-full-ft-100k_512 | 377,5 M | 512 | Clasificación 13 clases (Electrolab) | other | Hugging Face |
| UltraBERT-380M (base) | 377,5 M | no disponible | Representaciones generales | no disponible | Hugging Face (dmis-lab) |
| BERT-base / RoBERTa-base | ~110-125 M | 512 | Clasificación general | MIT / Apache-2.0 | Hugging Face |
| DeBERTa-v3-base | ~184 M | 512 | Clasificación general | MIT | Hugging Face |

La comparación directa con clasificadores genéricos no es del todo significativa: este modelo está especializado en una taxonomía cerrada de Electrolab y no se ha evaluado en benchmarks públicos como MMLU o GLUE. Su ventaja frente a un BERT-base genérico es la precisión en su dominio; su desventaja es la nula transferibilidad fuera de él y una licencia restrictiva.

## Limitaciones y advertencias

- Ámbito lingüístico restringido al inglés; no soporta castellano ni otros idiomas.
- Taxonomía cerrada y específica de Electrolab: no es un clasificador de correo genérico y no se recomienda su uso fuera de ese dominio.
- Truncamiento a 512 tokens: la información posterior a ese límite se descarta, lo que puede degradar la clasificación en hilos de correo muy largos.
- Sesgos potenciales derivados del corpus propietario de una única empresa y de su distribución histórica de correos; puede infrarepresentar categorías poco frecuentes.
- Riesgo de alucinación: nulo por diseño, ya que el modelo no genera texto; solo emite etiquetas y scores.
- Licencia "other": es imprescindible revisar los términos exactos antes de cualquier uso comercial o redistribución; no se garantiza uso libre.
- El repositorio incluye `custom_code` y un archivo `joblib`, lo que implica dependencias adicionales y posibles riesgos de seguridad al cargar código remoto; conviene auditar antes de desplegar en producción.
- Sin datos publicados de latencia, throughput ni comportamiento en dominios distintos al de entrenamiento.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos del repositorio; verificar la vigencia de los enlaces y del código asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/am2amai/el-class-ultrabert-380m-full-ft-100k_512
- Modelo base UltraBERT-380M: https://huggingface.co/dmis-lab/UltraBERT-380M
- Sitio de Electrolab: https://www.electrolabgroup.com/
