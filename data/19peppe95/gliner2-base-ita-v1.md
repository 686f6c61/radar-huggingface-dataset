# 19Peppe95/gliner2-base-ita-v1

## Resumen

gliner2-base-ita-v1 es un modelo de extracción de información zero-shot especializado en italiano, publicado por el usuario 19Peppe95. No se trata de un modelo entrenado desde cero, sino de un *merge* por interpolación lineal de pesos entre el encoder de DeepMount00/GLiNER_PII_ITA y el modelo multilingüe fastino/gliner2-multi-v1. El objetivo es inyectar sensibilidad morfológica y fiscal italiana en el encoder sin romper el alineamiento con las cabezas multi-tarea de GLiNER2, que se conservan íntegras del modelo de Fastino.

El modelo cubre tres tareas dentro del paradigma GLiNER2: reconocimiento de entidades nombradas (NER) zero-shot, clasificación de texto y extracción estructurada en JSON. Está pensado para documentos administrativos, fiscales, legales, de recursos humanos y textos con datos personales (PII). Con 307 millones de parámetros, se posiciona como una alternativa ligera y desplegable en CPU o GPU de consumo para pipelines de extracción en producción.

Su relevancia actual radica en dos ajustes prácticos sobre el modelo base: la fusión selectiva del encoder con un peso de 0,35 hacia el modelo italiano de PII, y la ampliación de `max_width` de 8 a 16 tanto en la configuración raíz como en `span_head`, lo que evita el truncamiento de razones sociales italianas con puntuación (S.r.l., S.p.A., O.N.L.U.S.) y de spans administrativos extensos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTaV2 (GLiNER2) con cabezas multi-tarea (`span_rep`, `classifier`, `count_pred`, `count_embed`) |
| Parámetros totales | 307.098.645 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo ocupa 1,2 GB) |
| Idiomas soportados | Italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se entrena: se construye por *model merging*. Los pesos de los layers transformativos internos de `encoder.encoder.*` se fusionan mediante interpolación lineal con α = 0,35, según la fórmula θ_merged = 0,65 · θ_fastino + 0,35 · θ_DeepMount00. La matriz de embeddings (`encoder.embeddings.*`) y todas las cabezas de proyección provienen al 100% de fastino/gliner2-multi-v1, lo que preserva los marcadores estructurales especiales de GLiNER2 (`[P]`, `[E]`, `[C]`, `[L]`, `[SEP_TEXT]`, `[SEP_STRUCT]`, tokens 250102–250111) y el alineamiento del espacio latente con las cabezas.

La innovación técnica principal es la ampliación de `max_width` a 16 en `config.json` y en `span_head.max_width` (frente al valor por defecto de 8), junto con `attn_implementation` fijado a `"eager"` para compatibilidad plena con `DebertaV2Model`. Esto permite al *word splitter* capturar denominaciones societarias italianas completas con siglas puntuadas y apóstrofos. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO, ya que el proceso es exclusivamente de fusión de pesos.

## Capacidades

- NER zero-shot con etiquetas definidas en lenguaje natural, incluyendo descripciones de entidad opcionales.
- Clasificación de texto zero-shot dentro del esquema GLiNER2.
- Extracción estructurada en JSON a partir de esquemas definidos por el usuario.
- Detección de PII: nombres, códigos fiscales, IBAN, direcciones, datos sanitarios y contactos.
- Extracción documental de facturas, recibos, notas de gasto, números de documento, fechas, importes, bollos y exenciones de IVA.
- Extracción de referencias normativas italianas (DPR, TUIR, D.Lgs.) y de entidades emisoras en licitaciones y documentos de la administración pública.
- Procesamiento de spans largos gracias a `max_width = 16`, adecuado para razones sociales con puntuación y spans administrativos extendidos.
- Soporte de umbral de confianza configurable (el autor recomienda `threshold=0.35`).
- Capacidades multilingües: limitadas al italiano según la model card y la etiqueta de idioma.
- Tool calling, agentes, razonamiento multi-paso, visión y audio: no disponibles.

## Casos de uso

- Extracción de datos de facturas y recibos: el modelo identifica número de documento, fecha de emisión, partida IVA, imponible, impuesto de bollo y total pagado en un único paso zero-shot, sin necesidad de plantillas por proveedor.
- Detección de PII para cumplimiento del GDPR: se define un esquema con nombres, códigos fiscales, IBAN, direcciones y datos sanitarios, y el modelo devuelve los spans para anonimización o enmascaramiento previo al almacenamiento.
- Gestión de welfare corporativo y RR. HH.: extracción de datos de prácticas médicas, cuotas de guardería y fondos de previsión complementaria para su volcado en sistemas de gestión de beneficios.
- Tramitación de subvenciones y licitaciones públicas: extracción de entidades convocantes, referencias normativas y requisitos de participación a partir de documentos administrativos italianos.
- Digitalización de expedientes legales y fiscales: conversión de documentos escaneados con OCR previo en registros JSON estructurados, aprovechando la preservación de los marcadores estructurales de GLiNER2.
- Clasificación y enrutado de documentos entrantes: uso de la cabeza de clasificación para asignar tipologías documentales antes de la extracción, reduciendo el número de esquemas que deben evaluarse por documento.
- Normalización de razones sociales: captura completa de denominaciones como "Società Cooperativa Sociale Il Piccolo Principe O.N.L.U.S." gracias a `max_width = 16`, útil en conciliación de proveedores y maestros de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB de pesos más overhead de activaciones y tokenizador; en la práctica, menos de 3 GB en la mayoría de configuraciones.
- En fp16/bf16: en torno a 0,6 GB de pesos, holgadamente por debajo de 2 GB de VRAM total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas y quedan sobredimensionadas para el tamaño del modelo.
- Cabe en GPU de consumo y también en CPU para cargas por lotes, dado el tamaño de 307 M de parámetros.
- Opciones de despliegue: la librería `gliner2` es la vía oficial (`GLiNER2.from_pretrained`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| 19Peppe95/gliner2-base-ita-v1 | 307 M | Italiano | NER zero-shot, clasificación, extracción JSON | Apache 2.0 | Merge con `max_width=16`; especializado en documentos fiscales y PII italianos |
| fastino/gliner2-multi-v1 | no disponible | Multilingüe | NER zero-shot, clasificación, extracción JSON | no disponible en la información | Modelo base; aporta embeddings, cabezas y marcadores estructurales |
| fastino/gliner2-base-v1 | no disponible | no disponible | NER zero-shot, clasificación, extracción JSON | no disponible en la información | Variante base de la familia GLiNER2 |
| DeepMount00/GLiNER_PII_ITA | no disponible | Italiano | Detección de PII | no disponible en la información | Aporta el 35% de los pesos del encoder fusionado; especialización en PII italiana |

## Limitaciones y advertencias

- El modelo solo declara soporte de italiano; su uso en otros idiomas no está validado y probablemente degrade respecto al modelo multilingüe original.
- Al ser un merge de pesos sin reentrenamiento, no hay garantía de que la fusión mejore uniformemente todas las tareas; el autor no publica evaluación comparativa frente a los modelos de origen.
- Riesgo de alucinación de spans: como todo extractor zero-shot, puede generar entidades plausibles pero ausentes en el texto, especialmente con umbrales de confianza bajos.
- El umbral recomendado de 0,35 es una indicación del autor y no un valor calibrado sobre un conjunto de evaluación público; conviene ajustarlo por dominio.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos de origen (fastino/gliner2-multi-v1 y DeepMount00/GLiNER_PII_ITA), cuya licencia no se detalla en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- No se documentan sesgos conocidos ni evaluación de robustez frente a texto ruidoso u OCR de baja calidad.
- No hay información sobre la longitud de contexto soportada, lo que limita la planificación de pipelines con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/19Peppe95/gliner2-base-ita-v1
- Modelo base multilingüe: https://huggingface.co/fastino/gliner2-multi-v1
- Modelo base de PII italiana: https://huggingface.co/DeepMount00/GLiNER_PII_ITA
- Modelo base de la familia GLiNER2: https://huggingface.co/fastino/gliner2-base-v1
- Repositorio GLiNER2: https://github.com/fastino-ai/GLiNER2
