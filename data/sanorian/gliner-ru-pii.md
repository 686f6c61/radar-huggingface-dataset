# Sanorian/gliner-ru-pii

## Resumen

GLiNER Russian PII es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales identificables (PII) en textos en ruso. Lo desarrolla el usuario Sanorian y se construye mediante fine-tuning del modelo base urchade/gliner_multi, que emplea una arquitectura GLiNER (Generalist Model for NER) sobre un encoder mdeberta-v3-base. Su enfoque es zero-shot NER: el modelo acepta una lista de etiquetas en tiempo de inferencia y devuelve los spans del texto que corresponden a cada una.

El problema que resuelve es concreto: la anonimización y el enmascarado de PII en corpus rusos, un dominio donde los formatos de documentos (SNILS, INN, polizas OMS, pasaportes, permisos de conducir) tienen estructuras y variaciones de escritura muy específicas. El modelo se entrenó exclusivamente con datos sintéticos (unas 1900 muestras generadas) que cubren formatos típicos de PII rusa, sin recurrir a datos personales reales.

Es relevante por su carácter abierto (licencia MIT), su integración con la librería GLiNER y su encaje en pipelines híbridos de anonimización que combinan regex, el propio GLiNER y herramientas como Natasha. El repositorio ocupa 1,2 GB y el modelo base es multilingüe, aunque el fine-tuning se orienta únicamente al ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (zero-shot NER) sobre encoder mdeberta-v3-base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 1,2 GB, libreria gliner) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER, un esquema de NER generalista que, en lugar de clasificar tokens contra un conjunto fijo de clases, codifica simultáneamente el texto y las etiquetas de entidad solicitadas para puntuar spans candidatos. El encoder subyacente es mdeberta-v3-base, heredado del modelo base urchade/gliner_multi, que aporta representaciones multilingües aunque el fine-tuning se haya realizado solo en ruso.

El entrenamiento se hizo íntegramente con datos sintéticos: aproximadamente 1900 textos generados con ejemplos de formatos habituales de PII rusa (nombres completos, direcciones con calle, número, piso y oficina, teléfonos, SNILS, INN, pólizas OMS, números de carné de conducir, de libreta militar y de certificado de nacimiento, URL y correo electrónico). La síntesis cubre variaciones de escritura, separadores distintos, erratas en los nombres de tipos de documento y puntuación irregular en URL y correos. No se emplearon datos personales reales. La model card no detalla hiperparámetros, número de épocas, función de pérdida ni si hubo etapas de ajuste adicionales.

## Capacidades

- Detección zero-shot de entidades: acepta una lista de etiquetas arbitraria en tiempo de inferencia.
- Etiquetas soportadas de forma nativa: `person`, `organization`, `location`, `profession`, `age`, `date`, `money`, `group code`, `phone`, `email`, `url`, `passport`, `doc number`.
- Extracción de PII en textos rusos con formatos documentales específicos del país.
- Integración con la librería GLiNER mediante `GLiNER.from_pretrained` y `predict_entities`.
- Umbral de confianza configurable (`threshold`) para filtrar detecciones.
- Capacidad de operar como componente de un pipeline de anonimización junto a validadores regex y Natasha.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Anonimización de corpus rusos antes de su publicación o compartición: el modelo detecta personas, organizaciones y ubicaciones en texto libre, mientras los validadores regex del pipeline cubren las categorías estructuradas (SNILS, INN, OMS).
- Cumplimiento normativo en tratamiento de datos: integración en procesos de enmascarado previo al almacenamiento o al envío a terceros, con revisión humana de las detecciones por debajo del umbral.
- Limpieza de registros de atención al cliente: eliminación de nombres, teléfonos y correos de transcripciones y tickets antes de usarlos para analítica.
- Preparación de datasets de entrenamiento: filtrado de PII en corpus rusos recolectados de la web para evitar contaminación con datos personales.
- Enmascarado de documentos internos: detección de números de pasaporte y de documento en expedientes antes de compartirlos entre departamentos.
- Preprocesado para sistemas de búsqueda o RAG: anonimización de la capa documental para que los índices no expongan datos personales.
- Análisis de riesgo en textos legales o administrativos: extracción de entidades de tipo `date`, `money` y `organization` para tareas de revisión documental.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos dentro del pipeline de anonimización completo (regex + GLiNER + Natasha) sobre el benchmark abierto redmadrobot-rnd/pii_benchmark (2703 textos), con métrica overlap F1:

| Categoria | Overlap F1 |
|---|---|
| email | 0,99 |
| url | 0,98 |
| oms | 0,93 |
| doc_number | 0,88 |
| card | 0,88 |
| inn | 0,86 |
| snils | 0,86 |
| MICRO (pipeline completo) | 0,88 |

No se han publicado resultados aislados del modelo (sin el resto del pipeline) ni comparaciones directas con otros modelos NER en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 1,2 GB, lo que sugiere un consumo moderado en FP32 y menor con cuantización, pero no se confirma.
- GPU recomendadas: no disponible. Por el tamaño del encoder (mdeberta-v3-base) es previsible que funcione en GPU de gama media, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmada en la documentación.
- Opciones de despliegue: la librería GLiNER es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Sanorian/gliner-ru-pii | GLiNER zero-shot NER | ru | MIT | no disponible | Fine-tuning sintético para PII rusa |
| urchade/gliner_multi | GLiNER zero-shot NER | multilingüe | MIT | no disponible | Modelo base; cobertura genérica, sin especialización en PII rusa |
| Natasha | Pipeline NER ruso | ru | no disponible en la información | no disponible | Usado junto al modelo en el pipeline de evaluación |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con datos sintéticos: el rendimiento en textos reales con ruido, jerga o formatos no contemplados puede degradarse.
- El autor advierte de alucinaciones en datos estructurados: el modelo puede etiquetar «СНИЛС» como `url` o «PDF» como `email`. Se recomienda validar la forma de los spans con regex para las categorías estructuradas.
- Cobertura lingüística limitada al ruso; no debe esperarse un comportamiento fiable en otros idiomas pese a que el encoder base sea multilingüe.
- Las métricas publicadas corresponden al pipeline completo, no al modelo aislado, por lo que no deben atribuirse solo a GLiNER.
- Sin datos sobre sesgos demográficos ni sobre el impacto del desbalance en los formatos sintéticos.
- Licencia MIT, que permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para cumplimiento normativo sin revisión adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanorian/gliner-ru-pii
- Modelo base: https://huggingface.co/urchade/gliner_multi
- Benchmark de evaluación: https://huggingface.co/datasets/redmadrobot-rnd/pii_benchmark
