# GRAI-UNSTPB/gemma3_27b_it_ft_cs_random_de

## Resumen

`GRAI-UNSTPB/gemma3_27b_it_ft_cs_random_de` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el grupo GRAI-UNSTPB sobre el modelo base `google/gemma-3-27b-it`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (0,5 GB en el repositorio) que debe cargarse junto al modelo base mediante la librería PEFT (versión 0.21.2 declarada) y TRL. El repositorio se publicó el 8 de octubre de 2026 según los metadatos y, en el momento de redactar esta ficha, acumula 0 descargas y 0 valoraciones.

La model card del adaptador es la plantilla por defecto de HuggingFace y no ha sido cumplimentada: todos los apartados relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros, evaluación, impacto ambiental) figuran como "[More Information Needed]". Esto significa que la única información verificable sobre el ajuste son los campos estructurados del repositorio: `library_name: peft`, etiquetas `lora` y `sft`, `pipeline_tag: text-generation` y el modelo base declarado.

El interés de la ficha es, por tanto, limitado y fundamentalmente metodológico: sirve como ejemplo de adaptador LoRA sobre Gemma 3 27B IT y como recordatorio de que un repositorio con metadatos mínimos no permite reproducir ni auditar el ajuste. El nombre del repositorio (`ft_cs_random_de`) sugiere un ajuste con datos que combinan cambio de código (*code-switching*) y alemán, pero se trata de una inferencia a partir del identificador, no de un dato documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la model card del adaptador. El modelo base declarado, `google/gemma-3-27b-it`, es un transformer decoder-only con atención local y global intercalada |
| Parámetros totales | no disponible para el adaptador (es un LoRA, no un modelo completo). El modelo base declara del orden de 27 000 millones de parámetros |
| Parámetros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible para el adaptador. El modelo base soporta 128 000 tokens de contexto |
| Tipos de cuantización | no disponible. El adaptador se distribuye en la precisión del entrenamiento; la cuantización se aplica al modelo base (int4/int8 y cuantizaciones GGUF de la comunidad) |
| Idiomas soportados | no disponible. El identificador del repositorio sugiere alemán y cambio de código, sin confirmación documental |
| Licencia | no disponible en los metadatos. Al derivar de Gemma 3, se le aplican los términos de uso de Gemma del modelo base |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Tipo de adaptador | LoRA (PEFT), ajustado con SFT y TRL |
| Librería declarada | peft (framework PEFT 0.21.2 en la model card) |
| Modelo base | google/gemma-3-27b-it |
| Tamaño del repositorio | 0,5 GB |
| Pipeline | text-generation |
| Descargas / valoraciones | 0 / 0 |
| Fecha de publicación | 2026-10-08 según metadatos del repositorio |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se insertan en las capas del transformer base y se entrenan mientras los pesos originales permanecen congelados. Las etiquetas del repositorio confirman el uso de PEFT y de SFT (ajuste supervisado) con TRL, lo que sitúa el entrenamiento en el flujo estándar de *supervised fine-tuning* sobre pares instrucción-respuesta, sin que haya evidencia de etapas posteriores de RLHF, DPO u optimización por preferencias. El rango del adaptador, las capas objetivo, la tasa de aprendizaje, el número de pasos y el régimen de precisión (fp32, bf16 o fp16) no están documentados.

Respecto a los datos de entrenamiento, no hay información alguna: la model card no incluye composición del dataset, número de tokens, proporción de idiomas ni proceso de filtrado o preprocesado. Tampoco se documenta ninguna innovación técnica propia. Todas las capacidades del adaptador son, en principio, heredadas del modelo base `google/gemma-3-27b-it`, que aporta la arquitectura multimodal (entrada de imagen), el contexto de 128 000 tokens y la cobertura multilingüe; el adaptador únicamente modula el comportamiento aprendido durante el SFT, cuyo efecto real no puede evaluarse con la información disponible.

## Capacidades

- Generación de texto conversacional en el formato de instrucciones del modelo base, con el estilo y las preferencias inducidas por el SFT del adaptador (no documentadas).
- Razonamiento y matemáticas: capacidades heredadas del modelo base, sin datos de evaluación específicos para el adaptador.
- Generación y comprensión de código: heredadas del modelo base.
- Procesamiento de imágenes: el modelo base Gemma 3 incorpora codificador visual; el adaptador no declara cambios en esa parte, por lo que la capacidad multimodal dependería de los módulos congelados.
- Soporte de *tool calling* y *function calling*: determinado por el modelo base y por la plantilla de chat empleada; no se documenta ningún ajuste específico para ello.
- Uso en agentes y razonamiento multi-paso: no documentado; requeriría evaluación propia.
- Capacidades multilingües: no disponibles. El identificador sugiere un sesgo hacia alemán y hacia conversaciones con cambio de código, sin confirmación.
- Modo de pensamiento (*thinking*) u otras capacidades especiales: no disponibles.

## Casos de uso

- Ajuste de dominio para atención al cliente en mercados germanoparlantes: si la hipótesis del identificador (`de`) es correcta, el adaptador podría desplegarse sobre Gemma 3 27B IT para gestionar conversaciones de soporte en alemán con contexto largo. Requiere validación previa, ya que no hay datos de evaluación publicados.
- Asistente conversacional multi-turno con documentos extensos: el modelo base admite 128 000 tokens de contexto, lo que permite mantener historiales largos y adjuntar documentación completa sin segmentación agresiva.
- Extracción de información en *pipelines* RAG: el adaptador puede emplearse como generador final sobre fragmentos recuperados en bases vectoriales, aprovechando el contexto extendido para sintetizar respuestas a partir de múltiples pasajes.
- Generación de código asistida en entornos de desarrollo: integración vía *tool calling* sobre el modelo base para autocompletado, refactorización o generación de pruebas dentro de un flujo de CI/CD, siempre que se valide que el SFT no ha degradado esta capacidad.
- Análisis de documentación técnica con imágenes: gracias al codificador visual del modelo base, el conjunto base más adaptador puede procesar diagramas, capturas de pantalla o escaneos y responder preguntas sobre ellos.
- Traducción y localización con cambio de código: escenario coherente con el identificador del repositorio, útil para contenidos que mezclan alemán e inglés en documentación técnica o tickets de soporte.
- Investigación sobre técnicas de ajuste eficiente: el adaptador sirve como punto de partida reproducible para comparar estrategias LoRA/SFT frente a otras configuraciones, aunque la falta de documentación obliga a reconstruir los hiperparámetros.
- Prototipado rápido de asistentes verticales: al ocupar solo 0,5 GB, el adaptador puede intercambiarse sobre una única instancia del modelo base para comparar distintos comportamientos de dominio sin duplicar el coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del adaptador: 0,5 GB, por lo que su almacenamiento y su carga en memoria son despreciables frente al modelo base.
- El coste real de inferencia lo determina Gemma 3 27B IT. Estimaciones orientativas por precisión: en bf16, aproximadamente 54 GB de pesos; en int8, del orden de 27-30 GB; en cuantizaciones de 4 bits (GGUF Q4_K_M o similar), en torno a 15-17 GB.
- A la memoria de pesos hay que sumar la caché KV, que crece con la longitud de contexto. Con 128 000 tokens, esa caché puede superar varias decenas de gigabytes según el lote y la precisión, aunque la atención local/global del modelo base reduce el coste respecto a una atención densa equivalente.
- GPU recomendadas para bf16 sin cuantizar: A100 80 GB, H100 80 GB o dos GPU de 48 GB. Para int8, una A100 40 GB o una L40S 48 GB pueden ser suficientes. En 4 bits cabe en una RTX 4090 de 24 GB, con margen limitado para contexto largo.
- Viabilidad en GPU de consumo: sí, mediante cuantización de 4 bits, en tarjetas con 24 GB (RTX 3090, RTX 4090) y con contexto reducido; con 16 GB el margen es muy ajustado.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto al modelo base en frameworks que soporten LoRA, como vLLM, TGI, transformers con PEFT o llama.cpp/Ollama tras fusionar y convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado métricas de velocidad para este adaptador ni configuraciones de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_27b_it_ft_cs_random_de (adaptador LoRA) | Adaptador sobre un base de ~27 000 M | Heredado del base (128 000 tokens) | Heredada del base | no disponible; sujeta a los términos de Gemma | HuggingFace, 0 descargas |
| google/gemma-3-27b-it (modelo base) | ~27 000 M | 128 000 tokens | Sí, entrada de imagen | Términos de uso de Gemma | Ampliamente disponible |
| Qwen2.5-32B-Instruct | ~32 800 M | 128 000 tokens | No | Apache 2.0 | Ampliamente disponible |
| Mistral Small 3.1 24B Instruct | ~24 000 M | 128 000 tokens | Sí, entrada de imagen | Apache 2.0 | Ampliamente disponible |

La comparación es estructural: no hay datos de rendimiento publicados para el adaptador, de modo que no puede establecerse una comparación de calidad frente a estas alternativas. La diferencia relevante es de licencia, ya que los términos de Gemma son más restrictivos que Apache 2.0 para determinados usos comerciales.

## Limitaciones y advertencias

- Model card vacía: no se documentan desarrollador, datos, hiperparámetros ni evaluación, lo que impide reproducir el ajuste o auditar su procedencia.
- Licencia sin declarar en el repositorio; al derivar de Gemma 3, se aplican los términos de uso de Gemma, que incluyen restricciones de uso comercial y obligaciones de atribución.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia; el ajuste SFT puede incrementarlo si los datos de entrenamiento contenían ejemplos de baja calidad, extremo que no puede verificarse.
- Sesgos: no evaluados. Al no conocerse la composición del dataset, no puede descartarse la amplificación de sesgos presentes en los datos de ajuste.
- Degradación potencial de capacidades: el ajuste supervisado sobre un subconjunto estrecho puede reducir el rendimiento en tareas generales, incluido el soporte multilingüe o el razonamiento, sin que existan métricas que lo cuantifiquen.
- Idiomas: no declarados. Si el ajuste se centró en alemán y cambio de código, es esperable un deterioro en otros idiomas respecto al modelo base.
- Naturaleza del artefacto: es un adaptador, no un modelo autónomo; requiere el modelo base, la versión correcta de PEFT y una plantilla de chat compatible, lo que añade puntos de fallo en producción.
- Ausencia de validación comunitaria: 0 descargas y 0 valoraciones implican que no existe evidencia externa de funcionamiento correcto.
- Fechas de metadatos inconsistentes con el calendario habitual de publicación, lo que aconseja verificar el repositorio antes de cualquier uso.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/GRAI-UNSTPB/gemma3_27b_it_ft_cs_random_de
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Referencia citada en la model card (Lacoste et al., 2019, cálculo de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático mencionada en la model card: https://mlco2.github.io/impact
- Repositorio del paper, demo, blog o código del adaptador: no disponible en la información proporcionada.
