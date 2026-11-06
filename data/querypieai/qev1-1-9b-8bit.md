# querypieai/QEV1.1-9B-8BIT

## Resumen

QEV1.1-9B-8BIT es un modelo de clasificación de texto especializado en prevención de fuga de datos (DLP, *Data Loss Prevention*), desarrollado por QueryPie AI. No es un modelo generativo al uso: parte de `Qwen/Qwen3.5-9B-Base` y se ha adaptado mediante LoRA fusionado para responder a preguntas tipadas de decisión (`is_dlp` y preguntas directas `is_*`), devolviendo probabilidades sobre opciones en lugar de texto libre. La versión publicada está cuantizada a 8 bits con LLM.int8 de bitsandbytes (umbral 6.0) y se distribuye como paquete autocontenido de inferencia.

El modelo resuelve un problema concreto: evaluar documentos frente a criterios de sensibilidad y tipología de datos en entornos corporativos multilingües (inglés, coreano y japonés), con un foco explícito en la augmentación para japonés en esta revisión 1.1. Mantiene la interfaz QEV de `choice`, `noul` y `score`, lo que permite integrarlo en pipelines de inspección documental sin generar texto.

Su relevancia actual radica en que ofrece un clasificador DLP de 9B parámetros con métricas publicadas de Macro-F1 cercanas al 98 % en la referencia histórica del checkpoint BF16 sin fusionar, empaquetado para despliegue directo con `AutoModel` y `trust_remote_code=True`. La licencia, sin embargo, restringe el uso comercial sin permiso previo por escrito, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B-Base) con cabeza de punteros (pointer head) FP32 para decisión tipada |
| Parametros totales | 9B (aproximado, según el nombre del modelo; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits mediante LLM.int8 (bitsandbytes, umbral 6.0); cabeza de punteros, embeddings, normalización y rutas de outliers en coma flotante |
| Idiomas soportados | en, ko, ja |
| Licencia | QueryPie AI Research License v1.0 (uso no comercial; comercial requiere permiso escrito) |
| Formato de pesos | safetensors, paquete completo con tokenizer, cabeza de punteros, metadatos de calibración y loader personalizado de Transformers |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone `Qwen/Qwen3.5-9B-Base` (revisión `68c46c4b3498877f3ef123c856ecfde50c39f404`), un transformer decoder-only, al que se añade una cabeza de punteros en FP32 que produce probabilidades sobre las opciones definidas en la consulta. La adaptación se realizó con LoRA, que se fusiona en el backbone antes de la conversión a LLM.int8. Las capas críticas para la precisión de la decisión (cabeza de punteros, embeddings, normalización y rutas de outliers) permanecen en coma flotante, y la inferencia requiere CUDA.

El corpus de entrenamiento combina datos generales públicos con datos internos corporativos de DLP y augmentación multilingüe, con foco en japonés en esta revisión. El autor no divulga nombres de datasets, rutas internas, recuentos de muestras ni reglas de generación, y el repositorio no incluye filas de entrenamiento, calibración, validación o test, ni estados del optimizador o adaptadores. No se especifica el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO; la model card solo describe la fusión de LoRA y la cuantización posterior.

## Capacidades

- Clasificación DLP a nivel de documento: evalúa `is_dlp` y preguntas directas `is_*` sobre tipologías de datos sensibles.
- Interfaz QEV de decisión tipada: `choice`, `noul` y `score`, devolviendo probabilidades por opción en lugar de texto generado.
- Multilingüe en inglés, coreano y japonés, con augmentación específica para japonés en esta versión.
- Salida estructurada apta para integración en pipelines automatizados de inspección.
- No realiza extracción de spans ni recuento de hallazgos: la decisión es a nivel de documento.
- No validado para generación de texto genérica ni para pipelines de `text-generation` alojados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Inspección de documentos en pasarelas de correo corporativo: el modelo evalúa cada documento frente a criterios DLP y devuelve la probabilidad de que contenga datos sensibles, permitiendo bloquear o marcar mensajes antes de su salida.
- Clasificación de adjuntos en sistemas de almacenamiento en la nube: se integra como servicio de decisión por documento para etiquetar ficheros según tipología de datos y aplicar políticas de retención.
- Cumplimiento normativo en entornos con documentación en japonés: la augmentación específica de esta revisión lo hace adecuado para corpus japoneses donde otros clasificadores multilingües rinden peor.
- Triaje de tickets de soporte: clasifica el contenido de tickets en inglés y coreano para detectar información personal o credenciales antes de enrutarlos a equipos externos.
- Filtrado previo en pipelines de anonimización: actúa como primera etapa que decide si un documento requiere pasar por un proceso de redacción o seudonimización.
- Auditoría de repositorios documentales: procesa lotes de documentos y genera decisiones tipadas para informes de cumplimiento, sin necesidad de extraer texto generado.
- Investigación académica en DLP y clasificación tipada: la licencia permite uso no comercial en evaluación e investigación, y el paquete autocontenido facilita la reproducibilidad.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la referencia histórica del checkpoint BF16 sin fusionar, no a una evaluación completa del paquete fusionado y cuantizado a 8 bits. `validation.json` recoge únicamente comprobaciones de recarga serializada y pruebas de humo de nueve preguntas.

| Metrica | Resultado |
|---|---:|
| Macro-F1 global (excluyendo biométrico) | 97,72 % |
| Macro-F1 EN | 96,69 % |
| Macro-F1 KO | 98,29 % |
| Macro-F1 JA | 98,46 % |
| Registros de evaluación | 6.281 |

La clase `is_biometric` no tiene filas positivas y queda excluida de los resúmenes macro. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 11,0 GB; con overhead de activaciones y cabeza de punteros en FP32, se recomienda al menos 16-24 GB de VRAM para inferencia en 8 bits.
- GPU validadas por el autor: NVIDIA H200 con CUDA. No se documentan otras GPU como validadas.
- GPU consumer: no se confirma compatibilidad con RTX 4090 u otras consumer; la cuantización LLM.int8 y la exigencia de CUDA lo hacen plausible en GPUs con suficiente VRAM, pero no está validado.
- Despliegue: `AutoModel.from_pretrained(..., trust_remote_code=True)` con el loader personalizado incluido; no se validan vLLM, llama.cpp, Ollama ni TGI, y los pipelines genéricos de `text-generation` no están soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación DLP tipada con estas características en la documentación proporcionada. Como referencia del backbone, el modelo se basa en Qwen3.5-9B-Base, pero no se han publicado comparativas de rendimiento frente a alternativas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QEV1.1-9B-8BIT | 9B | no disponible | Clasificación DLP tipada | QueryPie AI Research License v1.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia QueryPie AI Research License v1.0 solo permite investigación personal no comercial y evaluación académica no comercial; el uso comercial, el desarrollo de producto y las pruebas de concepto con motivación comercial requieren permiso escrito previo de QueryPie.
- Los pesos de la base y el tokenizer conservan sus licencias upstream (Apache-2.0 en los componentes de terceros), que deben respetarse por separado.
- El modelo realiza decisiones a nivel de documento y no extrae spans ni recuentos de hallazgos, lo que limita su uso en flujos que requieran localización de la información sensible.
- No está validado para generación de texto ni para pipelines alojados; usarlo fuera de la interfaz `decide()` puede producir resultados no fiables.
- Requiere `trust_remote_code=True` y CUDA; no se ha validado en hardware distinto de NVIDIA H200.
- La clase `is_biometric` carece de ejemplos positivos en la evaluación, por lo que su comportamiento en esa categoría no está caracterizado.
- Los datos de entrenamiento no se distribuyen ni se detallan, lo que impide auditar la composición del corpus y los posibles sesgos.
- Riesgo de alucinación y sesgos: no documentado por el autor; al ser un clasificador con salida de probabilidades, el riesgo principal es la calibración incorrecta en dominios alejados de los datos de entrenamiento.
- El rendimiento reportado corresponde al checkpoint BF16 sin fusionar, no al paquete 8 bits publicado; la degradación por cuantización no se cuantifica.

## Enlaces

- [Hugging Face: querypieai/QEV1.1-9B-8BIT](https://huggingface.co/querypieai/QEV1.1-9B-8BIT)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
- [Contacto comercial de QueryPie](https://www.querypie.com/en/contact-us)
