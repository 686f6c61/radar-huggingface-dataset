# kuzaai/kuza-qwen-3.5-4b-quant-study

## Resumen

Kuza Qwen 3.5-4B Quant Study es un repositorio de evaluación publicado por kuzaai que documenta un diagnóstico de cuantización sobre el modelo base kuzaai/kuza-qwen-3.5-4b, un asistente agrícola orientado a África Oriental con soporte de inglés y suajili. Más que un modelo nuevo, el repositorio es un estudio: compara cuantizaciones GGUF de nueva generación (K-quants e I-quants) con cuantizaciones de ejecuciones anteriores del mismo modelo y mide el impacto en la calidad mediante una rúbrica sobre 36 indicaciones agrícolas en inglés y suajili.

El resultado principal del estudio es un veredicto negativo respecto a la cuantización como causa de pérdida de calidad: la media de la métrica de conjunto oculto en BF16 es 0,479, por debajo del umbral de 0,75 definido por los autores, lo que apunta a un problema de ajuste fino (finetuning) o de plantilla de conversación (chat template) en lugar de un problema de precisión numérica. La variante ganadora de la fase de cribado es iq3_xs_imatrix_ssm, y el repositorio incluye tanto cuantizaciones nuevas como una reevaluación de cuantizaciones previas.

El modelo base tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y licencia Apache 2.0. El repositorio ocupa 37,8 GB e incluye artefactos, cuantizaciones, registros de KLD, informes de conjunto oculto y resultados de evaluación. No se han publicado datos sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni benchmarks estándar (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los nombres de las cuantizaciones hacen referencia a proteccion de capas SSM y de atencion, lo que sugiere una arquitectura hibrida SSM/attention, sin confirmar en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF K-quants e I-quants: q4_k_m (plain e imatrix), q5_k_m, q3_k_m, q6_k, q4_k_s, iq3_xs, iq4_xs |
| Idiomas soportados | en (ingles), sw (suajili) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones del estudio); pesos fuente del modelo base no especificados en la informacion proporcionada |

Datos adicionales del repositorio: tamano de 37,8 GB, 0 descargas, 0 likes, creado el 2026-09-19 y actualizado el 2026-09-19. Etiquetas: gguf, agriculture, east-africa, qwen, quantization, evaluation, conversational, endpoints_compatible, region:us.

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura del modelo base kuzaai/kuza-qwen-3.5-4b ni su proceso de entrenamiento. No se indica numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La model card del estudio se limita a describir el proceso de diagnostico de cuantizacion.

El unico indicio tecnico sobre la arquitectura procede de la nomenclatura de las cuantizaciones generadas, que menciona explicitamente "SSM/attention protection" y "hybrid SSM protection". Esto sugiere que el modelo base incorpora capas de espacio de estados (SSM) junto con capas de atencion, y que el proceso de cuantizacion aplica protecciones especificas a esos tensores. Se trata de una inferencia a partir de los nombres de los artefactos, no de una confirmacion tecnica en la documentacion.

La innovacion metodologica del repositorio es el propio flujo de diagnostico: se calcula una media de activaciones ocultas (hidden_mean) en BF16, se compara con un umbral predefinido de 0,75 y se concluye si la cuantizacion es la causa raiz de la degradacion. El veredicto registrado es `finetuning_or_template_issue`. El proceso incluye generacion de imatrix, registros de divergencia KL (KLD), informes de conjunto oculto, registros de benchmark y un `results.json` con el ranking.

## Capacidades

- Generacion de texto conversacional en ingles y suajili, orientada a un asistente agricola para Africa Oriental.
- Respuesta a indicaciones de dominio agricola: el conjunto de evaluacion oculto consta de 36 indicaciones en EN/SW de tematica agricola.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir la degradacion de calidad entre formatos GGUF.
- Diagnostico de causa raiz: distingue entre problemas de cuantizacion y problemas de ajuste fino o plantilla de conversacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles y suajili segun las etiquetas del repositorio.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.
- Despliegue compatible con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia gestionada, sin mas detalle.

## Casos de uso

- Seleccion de cuantizacion para despliegue en campo: un integrador que necesite ejecutar el asistente agricola en hardware modesto puede usar los datos del estudio para elegir entre iq3_xs, iq4_xs o q5_k_m segun el equilibrio tamano/calidad, en lugar de asumir que Q4_K_M es el punto optimo por defecto.
- Auditoria de calidad previa a produccion: antes de publicar un asistente agricola, el equipo reproduce el flujo del repositorio (imatrix, KLD, rubrica sobre indicaciones ocultas) para verificar que la cuantizacion elegida no degrada la tarea objetivo.
- Asistencia agricola en suajili para comunidades de Africa Oriental: el modelo base esta etiquetado para agricultura y suajili, por lo que puede desplegarse como chatbot de consultas agronomicas basicas, siempre que se resuelva primero el problema de ajuste fino detectado en el estudio.
- Diagnostico de regresiones en pipelines de cuantizacion: equipos que mantienen una cadena propia de cuantizacion pueden adoptar el criterio de veredicto (`finetuning_or_template_issue`) y el umbral de hidden_mean=0,75 como puerta de calidad automatizada en CI.
- Comparacion de K-quants frente a I-quants en modelos pequenos: el repositorio ofrece un caso practico de cuanto se pierde al bajar a 3 bits con proteccion de tensores, util para investigadores que estudian el compromiso velocidad/tamano en GPUs de gama baja.
- Investigacion sobre causas raiz de degradacion: al concluir que la cuantizacion no es la culpable, el estudio sirve como ejemplo metodologico para separar el efecto de la plantilla de chat del efecto de la precision numerica en modelos ajustados.
- Despliegue en CPU sin GPU: las cuantizaciones de 3 y 4 bits permiten ejecutar el modelo en servidores sin acelerador mediante llama.cpp, un escenario relevante en regiones con infraestructura limitada.
- Reproducibilidad de estudios de cuantizacion: el repositorio incluye un `upload_manifest.json` con ruta, tamano y sha256 de cada archivo, lo que facilita replicar exactamente los artefactos evaluados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo publicado es la metrica propia del estudio:

| Metrica | Modelo o referencia | Valor |
|---|---|---|
| hidden_mean (media de activaciones ocultas) | BF16, modelo base | 0,479 |
| Umbral de aceptacion definido por los autores | Criterio del estudio | 0,75 |
| Veredicto del diagnostico | Estudio completo | `finetuning_or_template_issue` |
| Ganador de la fase de cribado (screen winner) | Cuantizacion | `iq3_xs_imatrix_ssm` |

La metrica primaria es la puntuacion de rubrica sobre un conjunto oculto de 36 indicaciones agricolas en ingles y suajili (`data/hidden_prompts.jsonl` en el repositorio fuente). El ranking se ordena por hidden_mean descendente, despues por tamano de GGUF ascendente y finalmente por tokens por segundo de generacion en GPU descendente. Los valores numericos por cuantizacion estan en `screen/results.json` y `results/`, pero no se reproducen en la model card ni en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (4,2 B de parametros, sin datos oficiales del autor; estimaciones convencionales):
  - BF16: aproximadamente 8,5-9 GB.
  - q6_k: aproximadamente 3,5-4 GB.
  - q5_k_m: aproximadamente 3-3,5 GB.
  - q4_k_m: aproximadamente 2,5-3 GB.
  - iq4_xs: aproximadamente 2,3-2,8 GB.
  - q3_k_m: aproximadamente 2-2,5 GB.
  - iq3_xs: aproximadamente 1,8-2,2 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutar las cuantizaciones de 3 y 4 bits; para BF16 se recomienda una GPU de 12 GB o superior.
- Cabe en GPU consumer: si, previsiblemente, para todos los formatos GGUF listados; el BF16 requiere al menos 12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para los GGUF; vLLM o TGI requeririan los pesos en safetensors del modelo base, no incluidos en este repositorio. La etiqueta `endpoints_compatible` apunta a compatibilidad con servicios de inferencia gestionada.
- Latencia y throughput: no disponibles. El estudio usa tokens por segundo en GPU como criterio de desempate del ranking, pero los valores no se publican en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kuza-qwen-3.5-4b-quant-study (este repositorio) | 4,2 B | no disponible | apache-2.0 | GGUF (multiples quants) | Repositorio HuggingFace de kuzaai |
| kuza-qwen-3.5-4b (modelo base) | 4,2 B | no disponible | no confirmada en la informacion proporcionada | pesos fuente (formato no especificado) | Repositorio HuggingFace de kuzaai |
| Cuantizaciones previas del mismo modelo (q4_k_m_imatrix, q4_k_xl_ssm, q4_k_s_ssm) | 4,2 B | no disponible | apache-2.0 | GGUF | Repositorio HuggingFace de kuzaai |
| Alternativas externas de 3-4 B (por ejemplo, familias Qwen, Llama o Gemma de tamano similar) | no disponible | no disponible | no disponible | no disponible | no disponible: no se han aportado datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas externas, ya que el estudio se limita a comparar cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- El veredicto del propio estudio indica que la cuantizacion no es la causa raiz del bajo rendimiento observado; el problema apunta al ajuste fino o a la plantilla de conversacion. Sustituir la cuantizacion no corrige la calidad del modelo base.
- La puntuacion BF16 de referencia (hidden_mean=0,479) esta muy por debajo del umbral de 0,75 fijado por los autores, lo que sugiere una calidad base insuficiente para la tarea objetivo.
- La evaluacion se realizo sobre solo 36 indicaciones agricolas en ingles y suajili; es una muestra pequena y de dominio restringido, por lo que no permite extrapolar el comportamiento general del modelo.
- No se han publicado resultados en benchmarks estandar, por lo que no es posible comparar con otros modelos mediante metricas reconocidas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; en un asistente agricola, una alucinacion puede tener consecuencias practicas para el usuario final.
- Cobertura idiomatica limitada a ingles y suajili; no se declara soporte de otros idiomas.
- Repositorio con 0 descargas y 0 likes: no hay validacion externa ni comunidad que haya reportado resultados independientes.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantias sobre la idoneidad del modelo para produccion.
- El repositorio ocupa 37,8 GB porque agrupa multiples cuantizaciones, artefactos y registros; no es un unico archivo de modelo y requiere seleccionar el GGUF concreto.
- La fecha de creacion registrada (2026-09-19) resulta anomala respecto a los catalogos habituales de modelos, lo que puede indicar un error de metadatos o un repositorio de pruebas; conviene verificarlo antes de tomarlo como referencia.
- Los resultados de busqueda web asociados a esta consulta no guardan relacion con el modelo (contenido en aleman sobre plantillas de transferencias bancarias), por lo que no aportan informacion adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kuzaai/kuza-qwen-3.5-4b-quant-study
- Modelo base: https://huggingface.co/kuzaai/kuza-qwen-3.5-4b
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
