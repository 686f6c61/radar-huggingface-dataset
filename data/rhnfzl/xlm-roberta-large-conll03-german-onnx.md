# rhnfzl/xlm-roberta-large-conll03-german-onnx

## Resumen

`xlm-roberta-large-conll03-german-onnx` es una exportación a formato ONNX del modelo `FacebookAI/xlm-roberta-large-finetuned-conll03-german`, un sistema de reconocimiento de entidades nombradas (NER) basado en la arquitectura XLM-RoBERTa-large y ajustado para etiquetar personas, organizaciones, localizaciones y entidades misceláneas en textos en alemán. Lo publica el usuario rhnfzl como artefacto auxiliar de su herramienta SqueakyCleanText, un limpiador de texto que usa NER para enmascarar datos sensibles antes de procesar documentos.

El modelo original parte de XLM-RoBERTa-large (aproximadamente 560 millones de parámetros, transformer encoder de tipo RoBERTa multilingüe preentrenado sobre corpus masivos) y fue afinado por Facebook AI sobre CoNLL-2003, el corpus clásico de NER con anotaciones en inglés y alemán. Esta versión ONNX reproduce fielmente esa fine-tuning para alemán, con pesos en FP32 y sin cuantización, y se distribuye bajo licencia MIT.

Su relevancia práctica es doble: por un lado, ofrece una ruta de despliegue sin dependencia de PyTorch, lo que simplifica la integración en pipelines de producción ligeros mediante `onnxruntime`; por otro, sirve como referencia de exportación reproducible (opset 18, IR 8) con una verificación de paridad documentada frente al modelo original. La ventana de contexto efectiva es de 512 tokens, típica de la familia RoBERTa, y el modelo solo soporta alemán en la práctica, aunque el backbone subyacente sea multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large), exportado a ONNX |
| Parametros totales | Aproximadamente 560 M (heredados del base XLM-RoBERTa-large) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entradas mayores deben dividirse) |
| Tipos de cuantizacion | Ninguna incluida; pesos FP32 en el artefacto publicado |
| Idiomas soportados | Alemán (`de`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data`), opset 18, IR 8 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia RoBERTa en su variante multilingüe XLM-RoBERTa-large, con 24 capas, dimensión oculta de 1024 y 16 cabezas de atención, entrenado originalmente por Facebook AI sobre corpus multilingües (CommonCrawl filtrado) y posteriormente afinado para la tarea de token classification sobre CoNLL-2003 en su partición alemana. La cabeza de clasificación produce logits por token con nueve etiquetas IOB1: `B-LOC`, `B-MISC`, `B-ORG`, `B-PER`, `I-LOC`, `I-MISC`, `I-ORG`, `I-PER` y `O`.

La exportación a ONNX se realizó con `optimum.exporters.onnx` en la tarea `token-classification`, sin pasos de cuantización ni optimización posteriores, sobre CPU y con el flag de dispositivo por defecto. El autor documenta una comprobación de paridad sobre una muestra fija de 3 frases (49 tokens): los IDs de token, el mapeo `id2label` y la etiqueta top-1 coinciden en 49/49 tokens, con una diferencia máxima absoluta de logits de 2,7e-05. No se detalla en la información disponible el volumen exacto de tokens de entrenamiento, la composición del dataset más allá de CoNLL-2003, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a un encoder de NER).

## Capacidades

- Reconocimiento de entidades nombradas en alemán: personas (PER), organizaciones (ORG), localizaciones (LOC) y miscelánea (MISC).
- Etiquetado a nivel de subword token; el agrupamiento en entidades completas debe hacerse externamente o mediante SqueakyCleanText.
- Clasificación por token con esquema IOB1 (no IOB2): una entidad suele comenzar con `I-`, y `B-` solo marca el inicio de una nueva entidad del mismo tipo inmediatamente después de otra.
- Integración nativa con la librería SqueakyCleanText, que lo carga por defecto para alemán bajo la clave `GERMAN`.
- Ejecución mediante `onnxruntime` con proveedores CPU (y potencialmente otros proveedores compatibles, aunque no se documentan en la información disponible).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de etiquetado.
- No soporta visión, audio ni modo "thinking".

## Casos de uso

- Anonimización y enmascarado de datos personales en documentos alemanes: el modelo detecta nombres de personas y organizaciones para sustituirlos por marcadores (`<PERSON>`, `<ORGANISATION>`) antes de almacenar o compartir textos, integrándose en pipelines de cumplimiento GDPR.
- Limpieza de corpus para entrenamiento de LLM: SqueakyCleanText lo usa por defecto para alemán con el fin de eliminar o normalizar entidades sensibles en datasets de preentrenamiento, reduciendo el riesgo de memorización de PII.
- Extracción de entidades en facturas, contratos y correspondencia empresarial en alemán: identificación de proveedores, clientes y ubicaciones para alimentar sistemas de gestión documental.
- Enriquecimiento de bases de datos de clientes o CRM: detección automática de organizaciones y localizaciones en notas libres y correos para poblar campos estructurados.
- Preprocesado para motores de búsqueda internos: indexación de entidades para permitir búsquedas facetadas por persona, organización o lugar en repositorios documentales en alemán.
- Moderación y revisión de contenido: marcado de menciones a personas y organizaciones en textos generados por usuarios antes de su publicación, con el objetivo de revisar posibles difamaciones o filtraciones.
- Despliegue en entornos sin PyTorch: al ser un artefacto ONNX puro, puede ejecutarse en servicios ligeros basados en `onnxruntime` (contenedores pequeños, funciones serverless) donde instalar el stack completo de transformers no es viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existe una métrica de precisión (F1, exact match) para este modelo en los benchmarks de SqueakyCleanText hasta la versión 0.10.0, y que dichos benchmarks puntúan el pipeline completo, no este modelo aislado. La única métrica documentada es la comprobación de paridad frente al modelo PyTorch original (49/49 etiquetas coincidentes, diferencia máxima de logits de 2,7e-05), que valida la fidelidad de la exportación pero no constituye una medida de calidad predictiva.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB para los pesos FP32; en la práctica, entre 2,5 y 3 GB considerando activaciones y buffers de `onnxruntime`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sobradamente.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Ejecución en CPU: viable, ya que el autor realizó la verificación de paridad en CPU; el throughput será menor pero suficiente para procesamiento por lotes de documentos.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#, Java), SqueakyCleanText, y potencialmente servidores compatibles con ONNX como Triton Inference Server u ONNX Runtime Server (no documentados explícitamente en la información disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| rhnfzl/xlm-roberta-large-conll03-german-onnx | ~560 M | 512 | Alemán | MIT | ONNX | Exportación FP32 sin cuantizar; paridad verificada con el original |
| FacebookAI/xlm-roberta-large-finetuned-conll03-german | ~560 M | 512 | Alemán (y multilingüe en el backbone) | No disponible en la información (la model card original indica "More information needed") | PyTorch (safetensors/bin) | Modelo original del que deriva esta exportación |
| rhnfzl/wikineural-multilingual-ner-onnx | No disponible | No disponible | Multilingüe | CC BY-NC-SA 4.0 (solo investigación no comercial) | ONNX | Usado por SqueakyCleanText junto al modelo alemán; restricción no comercial |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de CoNLL-2003, puede heredar los sesgos de dominio y anotación de ese corpus (textos periodísticos de los años 90).
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto), pero puede producir falsos positivos y falsos negativos en la detección de entidades, especialmente en dominios alejados del corpus de entrenamiento.
- Limitación de contexto: máximo 512 tokens; las entradas más largas deben dividirse manualmente, lo que puede fragmentar entidades a caballo entre fragmentos.
- Limitación de idioma: aunque el backbone XLM-RoBERTa sea multilingüe, el ajuste está orientado a alemán y no se garantiza un rendimiento adecuado en otros idiomas.
- Esquema IOB1: agrupar entidades asumiendo que `B-` inicia siempre una entidad produce errores; hay que respetar la convención IOB1 documentada.
- Licencia: MIT para este artefacto, asumida por el autor a partir del modelo base, cuya model card original indica "More information needed"; conviene verificar la licencia del modelo base antes de un uso comercial crítico.
- Dependencia de SqueakyCleanText: el uso por defecto de la librería carga también el modelo multilingüe `rhnfzl/wikineural-multilingual-ner-onnx`, con licencia CC BY-NC-SA 4.0 (solo investigación no comercial); para uso comercial hay que configurar la librería para prescindir de él.
- Sin métricas de calidad publicadas: no hay F1 ni precisión/recall documentados para este modelo, lo que dificulta evaluar su idoneidad en producción sin una validación propia.
- Reproducibilidad: el script de exportación no fija la revisión del modelo base; la revisión indicada (`1fbcc7a00a69`) es inferida por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rhnfzl/xlm-roberta-large-conll03-german-onnx
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large-finetuned-conll03-german
- Revisión del modelo base usada: https://huggingface.co/FacebookAI/xlm-roberta-large-finetuned-conll03-german/tree/1fbcc7a00a69ce5ab754623154a8e9cc6ba868e2
- Repositorio SqueakyCleanText: https://github.com/rhnfzl/SqueakyCleanText
- Script de exportación: https://github.com/rhnfzl/SqueakyCleanText/blob/f9e4a4247dbc2e86187a994cb23304b33e95a6c3/scripts/export_onnx_models.py
- Documentación de licencias de backends NER de SCT: https://github.com/rhnfzl/SqueakyCleanText/blob/main/docs/NER_BACKENDS.md#model-licences
- Resultados de benchmarks de SCT: https://github.com/rhnfzl/SqueakyCleanText/tree/main/benchmarks/results
- Modelo multilingüe complementario: https://huggingface.co/rhnfzl/wikineural-multilingual-ner-onnx
