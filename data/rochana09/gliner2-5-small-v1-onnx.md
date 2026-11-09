# Rochana09/gliner2.5-small-v1-onnx

## Resumen

Rochana09/gliner2.5-small-v1-onnx es una conversión no oficial a ONNX con cuantización int8 del modelo fastino/gliner2.5-small-v1, un extractor de información estructurada (NLP zero-shot) basado en la familia GLiNER2. El modelo original lo desarrolla Fastino y se distribuye con licencia Apache-2.0; esta build ONNX la publica el usuario Rochana09 reutilizando un fichero ONNX procedente de pooria/foxmind-small (foxpilot, MIT).

El modelo resuelve tareas de extracción de entidades y relaciones sin entrenamiento específico: se le pasan las etiquetas de interés en tiempo de inferencia y devuelve las entidades detectadas en el texto. La arquitectura subyacente es un encoder tipo DeBERTa-v2 (según los tags del repositorio) adaptado por GLiNER2 para extracción conjunta de entidades, relaciones y estructuras JSON.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un extractor de información ligero en CPU o en GPUs modestas mediante ONNX Runtime; por otro, al ser una conversión no oficial con muy poca documentación (0 descargas, 0 likes en el momento de la consulta), conviene tratarla como un artefacto experimental y no como un sustituto directo del modelo original de Fastino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo DeBERTa-v2 (familia GLiNER2) |
| Parámetros totales | no disponible (repo de 0,1 GB, coherente con un modelo small) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (ONNX q8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

El modelo base fastino/gliner2.5-small-v1 pertenece a la familia GLiNER2, que emplea un encoder transformer (en este caso DeBERTa-v2 según los tags) para proyectar simultáneamente representaciones de tokens y de etiquetas en un espacio común, de forma que la extracción de entidades se resuelve como un emparejamiento entre spans del texto y las etiquetas proporcionadas en inferencia. Este diseño permite definir las clases de entidad en tiempo de ejecución sin reentrenar.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada. La build ONNX aquí descrita se limita a exportar y cuantizar a int8 los pesos, reutilizando un fichero ONNX publicado por pooria/foxmind-small; no se documentan detalles del proceso de exportación, calibración de la cuantización ni métricas de degradación respecto al modelo en precisión completa.

## Capacidades

- Extracción de entidades nombradas zero-shot: se especifican las etiquetas en inferencia y el modelo devuelve los spans correspondientes.
- Extracción de relaciones y estructuras de salida tipo JSON, según la familia GLiNER2.
- Procesamiento de texto en lote mediante ONNX Runtime, con soporte de ejecución en CPU.
- Inferencia de baja latencia por el tamaño reducido del modelo y la cuantización int8.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión o audio: no disponibles; el modelo es exclusivamente de extracción de información textual.

## Casos de uso

- Extracción de entidades en pipelines de ingesta documental: el modelo permite definir etiquetas como "persona", "organización" o "fecha" en tiempo de inferencia y aplicarlas sobre lotes de documentos sin reentrenamiento.
- Anonimización y enmascarado de PII: al detectar entidades sensibles (nombres, direcciones, identificadores) de forma configurable, puede integrarse como paso previo a almacenar o compartir textos.
- Enriquecimiento de bases de datos y CRM: extracción de campos estructurados a partir de correos, notas o transcripciones para poblar registros de forma automática.
- Procesamiento en el borde o en CPU: al estar en ONNX int8, puede desplegarse en servidores sin GPU o en dispositivos con recursos limitados usando ONNX Runtime.
- Clasificación y filtrado de contenido: extracción de tópicos y entidades para etiquetar noticias, tickets o reseñas antes de su enrutamiento.
- Preprocesado para RAG: identificación de entidades y relaciones en los fragmentos recuperados para construir grafos de conocimiento o metadatos de filtrado.
- Extracción de campos en formularios y contratos: detección de partes, importes y fechas en documentos estructurados semiestructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la cuantización int8, la huella de memoria es muy reducida y cabe en GPUs consumer de gama baja.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; también ejecutable en CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier RTX o equivalente, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con integración en Python; compatible con el ecosistema GLiNER si se adapta la carga del fichero ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rochana09/gliner2.5-small-v1-onnx | no disponible (small) | no disponible | ONNX int8 | Apache-2.0 | Hugging Face (0 descargas) |
| fastino/gliner2.5-small-v1 | no disponible (small) | no disponible | safetensors (presumible) | Apache-2.0 | Hugging Face (modelo original) |
| pooria/foxmind-small | no disponible | no disponible | ONNX | MIT | Hugging Face (origen del fichero ONNX) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada por Fastino y no cuenta con validación ni mantenimiento documentado.
- Procedencia del fichero ONNX: proviene de pooria/foxmind-small, por lo que la trazabilidad exacta de la exportación y calibración no está garantizada.
- Sin métricas de calidad: no se documenta la degradación de precisión introducida por la cuantización int8 respecto al modelo original.
- Idiomas y contexto no documentados: no se puede asumir cobertura multilingüe ni una ventana de contexto concreta.
- Riesgo de alucinación y falsos positivos en la extracción de entidades, especialmente con etiquetas ambiguas o solapadas.
- Sesgos: no documentados; heredables del corpus de entrenamiento del modelo original.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del fichero ONNX de origen (MIT) antes de desplegar en producción.
- Repositorio sin descargas ni likes: sin evidencia de uso en producción ni de pruebas por terceros.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/Rochana09/gliner2.5-small-v1-onnx
- Modelo base: https://huggingface.co/fastino/gliner2.5-small-v1
- Origen del fichero ONNX: https://huggingface.co/pooria/foxmind-small
