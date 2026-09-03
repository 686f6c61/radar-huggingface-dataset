# mariusweiss/TaxBERT-Tax-Risk-Sentiment

## Resumen

TaxBERT-Tax-Risk-Sentiment es un modelo de clasificación de sentimiento de riesgo fiscal, desarrollado por Marius Weiss y colaboradores (Hechtner, Schmidt, Seebeck y Weiß) como parte de una línea de investigación sobre modelos de lenguaje especializados para contabilidad y fiscalidad. Se trata de una adaptación de RoBERTa al dominio de las divulgaciones fiscales corporativas, diseñada para analizar oraciones individuales extraídas de informes anuales y otros documentos cualitativos.

El modelo resuelve un problema concreto: la clasificación de oraciones según si hacen referencia a impuestos y, en caso afirmativo, si indican riesgo fiscal, mitigación de riesgo fiscal o una declaración neutral. Esta tarea es relevante para investigadores en contabilidad, auditoría y fiscalidad que necesitan procesar grandes volúmenes de texto corporativo de forma automatizada y reproducible. El modelo tiene 82,3 millones de parámetros, lo que lo sitúa en la categoría de tamaño base de la familia BERT, y está publicado bajo licencia MIT, lo que facilita su uso comercial y académico.

La publicación asociada (SSRN 5146523) describe el proceso completo de diseño y empleo de modelos BERT especializados para investigación en contabilidad y fiscalidad, con un enfoque en la sostenibilidad ambiental y la viabilidad práctica. El repositorio de GitHub complementa la documentación con el código necesario para reproducir el entrenamiento y la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer bidireccional) |
| Parametros totales | 82.301.956 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base usa 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TaxBERT-Tax-Risk-Sentiment se basa en la arquitectura RoBERTa, un modelo transformer encoder-only derivado de BERT que elimina la tarea de prediccion de siguiente oracion y utiliza un entrenamiento mas robusto con mas datos y mayor tamaño de lote. La adaptacion al dominio fiscal se realizo mediante un proceso de domain adaptation, aunque los detalles concretos del entrenamiento (numero de tokens, composicion del dataset, uso de tecnicas como MLM continuado o fine-tuning supervisado) no estan disponibles en la informacion publica del repositorio.

El modelo esta disenado para clasificacion de secuencias a nivel de oracion, con cuatro etiquetas de salida: 0 (sin referencia fiscal), 1 (riesgo fiscal), 2 (mitigacion de riesgo fiscal) y 3 (neutral fiscal). La definicion de riesgo fiscal utilizada es "el riesgo de salida de efectivo debido a impuestos". El paper asociado describe el proceso de diseno completo, incluyendo la seleccion de datos, el etiquetado y la evaluacion, pero esos detalles no se incluyen en la model card.

## Capacidades

- Clasificacion de oraciones en cuatro categorias: sin referencia fiscal, riesgo fiscal, mitigacion de riesgo fiscal y neutral fiscal.
- Analisis de sentimiento de riesgo fiscal en divulgaciones corporativas cualitativas (informes anuales, memorias, notas a los estados financieros).
- Procesamiento de texto en ingles, especificamente orientado al vocabulario y las expresiones del dominio contable y fiscal.
- Inferencia a nivel de oracion, adecuada para pipelines de analisis de documentos largos mediante segmentacion previa.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales, al ser un modelo encoder-only de clasificacion.

## Casos de uso

- Investigacion academica en contabilidad y fiscalidad: los investigadores pueden clasificar automaticamente miles de oraciones de informes anuales para construir variables de riesgo fiscal y estudiar su relacion con otros fenomenos corporativos, como la elusion fiscal o la valoracion de mercado.
- Auditoria y aseguramiento: las firmas de auditoria pueden pre-procesar las divulgaciones fiscales de sus clientes para identificar oraciones que mencionen riesgos fiscales y priorizar la revision manual de esos pasajes.
- Analisis de competencia: los analistas financieros pueden comparar el perfil de riesgo fiscal de distintas empresas del mismo sector procesando sus informes 10-K o 20-F y extrayendo la proporcion de oraciones con riesgo fiscal.
- Cumplimiento normativo: los departamentos de cumplimiento pueden monitorizar las divulgaciones fiscales propias y ajenas para detectar cambios en el lenguaje de riesgo que puedan requerir ajustes en la comunicacion corporativa.
- Construccion de bases de datos etiquetadas: el modelo puede servir como anotador automatico para crear datasets de entrenamiento mas grandes, que luego se utilicen para entrenar modelos mas complejos o para analisis estadistico.
- Deteccion de mitigacion de riesgo: mas alla del riesgo, el modelo identifica oraciones que describen acciones de mitigacion, lo que permite estudiar como las empresas comunican sus estrategias de gestion del riesgo fiscal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, AUC ni comparaciones con otros modelos. El paper asociado (SSRN 5146523) podria contener evaluaciones, pero no estan accesibles en el repositorio de HuggingFace.

## Requisitos de hardware

- Al tratarse de un modelo de 82 millones de parametros, la inferencia es ligera y puede ejecutarse en CPU con un rendimiento aceptable para lotes pequenos.
- En GPU, cabe en tarjetas de consumo con 4 GB de VRAM o menos, como una NVIDIA GTX 1650 o RTX 3050, incluso sin cuantizacion.
- Con cuantizacion a 8 bits o 4 bits, el modelo ocuparia aproximadamente entre 80 y 160 MB, por lo que podria ejecutarse en dispositivos con recursos muy limitados.
- Opciones de despliegue: transformers de HuggingFace, ONNX Runtime, TensorFlow Lite, o servidores de inferencia como vLLM (aunque para un modelo de este tamano puede ser excesivo).
- La latencia por oracion en GPU moderna seria del orden de milisegundos; en CPU, de decenas de milisegundos, dependiendo del hardware.
- No se dispone de datos oficiales de throughput, pero por el tamano del modelo se puede estimar un rendimiento de cientos de oraciones por segundo en una GPU media.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos. Como referencia, existen alternativas como FinBERT (adaptacion de BERT al dominio financiero) o modelos genericos como RoBERTa-base, pero no hay datos de rendimiento comparativo en la tarea especifica de riesgo fiscal. La tabla siguiente muestra las diferencias estructurales basicas, sin datos de rendimiento:

| Modelo | Arquitectura | Parametros | Dominio | Licencia |
|---|---|---|---|---|
| TaxBERT-Tax-Risk-Sentiment | RoBERTa | 82M | Fiscal/contable | MIT |
| FinBERT (ProsusAI) | BERT | 110M | Financiero | Apache 2.0 |
| RoBERTa-base | RoBERTa | 125M | Generico | MIT |

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para divulgaciones fiscales corporativas en ingles; su rendimiento fuera de este dominio puede ser significativamente inferior y debe validarse antes de cualquier uso en produccion.
- La clasificacion se limita a cuatro etiquetas discretas; no proporciona puntuaciones de intensidad ni matices intermedios entre riesgo y neutralidad.
- No se han publicado datos sobre sesgos demograficos o culturales, pero al ser un modelo entrenado con textos corporativos estadounidenses (region:us), puede reflejar practicas y vocabulario propios de ese contexto regulatorio.
- Riesgo de alucinacion en el sentido de clasificaciones incorrectas cuando el texto contiene lenguaje ambiguo o metaforico; se recomienda revision humana para decisiones criticas.
- La longitud de contexto no esta documentada; si se hereda de RoBERTa-base, estaria limitada a 512 tokens por oracion, lo que obliga a segmentar documentos largos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se ofrece sin garantias; el usuario es responsable de validar su idoneidad para cada caso de uso.
- No se incluyen pesos en formato GGUF ni otros formatos de cuantizacion; solo safetensors, por lo que para despliegue en llama.cpp u Ollama habria que convertir el modelo manualmente.

## Enlaces

- HuggingFace: https://huggingface.co/mariusweiss/TaxBERT-Tax-Risk-Sentiment
- Modelo base TaxBERT: https://huggingface.co/mariusweiss/TaxBERT
- Paper en SSRN: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5146523
- Repositorio GitHub: https://github.com/TaxBERT/TaxBERT
