# Kentucky-Open-Science/KOS-V5.1-Instruct

## Resumen

KOS-V5.1-Instruct, con nombre en clave "Catbird", es un modelo de lenguaje de 3.700 millones de parámetros desarrollado conjuntamente por la Universidad de Kentucky (College of Medicine Office for Research y Center for Clinical and Translational Science) y la Universidad de Louisville (Kentucky Center for Digital Innovation). Se trata de un modelo especializado en dominios médico, clínico y biomédico, con capacidades de instrucción, tool calling y function calling, y está construido sobre arquitectura Qwen3.

Lo más singular del modelo es su método de construcción: no procede de un checkpoint de entrenamiento convencional, sino que sus pesos publicados fueron generados mediante programación en el espacio de pesos (weight-space programming), aplicando aritmética de vectores de tarea sobre KOS-V5-Instruct. Concretamente, se suma un vector de identidad en todas las capas MLP y se resta un vector de replay en las capas 12 a 23, una técnica de task arithmetic que busca instalar la identidad del modelo sin degradar sus métricas de seguridad y tool calling.

El modelo se distribuye con licencia Apache 2.0, pero el autor lo restringe explícitamente a uso de investigación, prohibiendo aplicaciones comerciales, clínicas, legales o de producción. Está orientado a un público investigador que necesite evaluar modelos pequeños especializados en dominio sanitario con soporte de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (model_type: qwen3) |
| Parametros totales | 3.715.431.936 (~3,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (con restriccion de uso de investigacion declarada por el autor) |
| Formato de pesos | safetensors |
| Modelo base | Kentucky-Open-Science/KOS-V5-Instruct (relacion: merge) |
| Tamano del repositorio | 7,4 GB |
| Sha256 de pesos | 7492922a4a80e14d3974e83e275b53a011abd183afe591579a9a8509be961199 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 de su base KOS-V5-Instruct, un transformer denso de aproximadamente 3,7 mil millones de parámetros. La innovación principal no reside en el preentrenamiento, sino en el procedimiento de edición de pesos empleado para generar la versión 5.1. El programa aplicado es `V5.1 = V5 + τ_identity (MLP, las 36 capas) − τ_replay (MLP, capas 12–23)`, donde τ_identity es el cambio de pesos producido por un fine-tune de identidad sobre KOS-V5-Instruct y τ_replay es el cambio del mismo fine-tune ejecutado únicamente sobre sus datos de replay general. La suma instala la identidad propia del modelo y la resta elimina la deriva introducida por los datos de replay, siguiendo la formulación de task arithmetic (Ilharco et al., ICLR 2023).

Solo se modifican los pesos de las capas MLP; atención, embeddings y normalizaciones son idénticas bit a bit a KOS-V5-Instruct. La aritmética se realizó en fp32 y se almacenó en bf16. La selección del programa se hizo sobre catorce candidatos (diez programas de pesos, tres variantes solo de configuración y un ajuste de generación) evaluados con una batería de 27 métricas que incluye las 17 categorías de BFCL, Med-HALT (FCT, NOTA, FQT), AfriMed-QA MCQ, cuatro métricas de IFEval y TruthfulQA (MC1 y MC2). El criterio de aceptación exigía que ninguna métrica fuese significativamente peor que la base, con tests pareados de McNemar o sign-flip a p < 0,05, y validación cruzada por mitades con hash. KOS-V5.1-Instruct fue el único programa que pasó, con 7 métricas significativamente mejores y ninguna peor.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés.
- Razonamiento clínico y biomédico, con exposición a datos médicos (Med-HALT) y de salud global (AfriMed-QA).
- Tool calling y function calling, evaluado en las 17 categorías de BFCL, incluyendo escenarios de irrelevancia en vivo (live_irrelevance).
- Comportamiento de rechazo de herramientas (tool refusal) reforzado respecto a la base.
- Seguimiento de instrucciones verificable mediante IFEval.
- Respuestas orientadas a veracidad, evaluadas con TruthfulQA MC1 y MC2.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación en ajuste y edición de modelos: el modelo sirve como caso de estudio reproducible de task arithmetic y programación en el espacio de pesos, con sha256 de pesos publicado y protocolo de selección documentado, para replicar o refutar los hallazgos sobre las capas 12–23.
- Evaluación de robustez en tool calling clínico: puede integrarse en bancos de pruebas tipo BFCL para medir la tasa de rechazo correcto ante herramientas irrelevantes en dominios sanitarios, gracias a sus mejoras declaradas en live_irrelevance.
- Preguntas y respuestas biomédicas de investigación: adecuado para experimentos controlados sobre Med-HALT y AfriMed-QA, comparando el efecto de la edición de pesos frente a la base sin editar.
- Prototipado de asistentes clínicos en entorno académico: con 3,7 B de parámetros cabe en una GPU de consumo, lo que permite iterar sobre prompts y flujos multi-turno en laboratorio sin infraestructura dedicada, siempre dentro del uso de investigación declarado.
- Estudio de alucinación y veracidad: las métricas TruthfulQA y Med-HALT FCT permiten analizar si la resta del vector de replay reduce costes de alucinación, un caso práctico para investigar mitigación de errores factuales.
- Comparación de técnicas de merging: al ser un modelo derivado por aritmética de tareas, es útil como referencia en experimentos que comparen task arithmetic, TIES, DARE u otras técnicas de fusión sobre una misma base Qwen3 pequeña.
- Docencia y formación: su tamaño reducido y su documentación detallada del programa de pesos lo hacen apto para explicar en cursos de posgrado cómo se editan modelos sin reentrenar.

## Benchmarks y rendimiento

La model card no publica valores absolutos de benchmarks, solo deltas relativos frente a KOS-V5-Instruct y el recuento de métricas significativamente mejores. Se indica que KOS-V5.1-Instruct obtiene 7 métricas significativamente mejores y ninguna peor sobre una batería de 27, con mejoras en tool refusal y Med-HALT FCT, y sin los costes de alucinación que introducía la edición de identidad sola. También se mencionan resultados de programas rechazados (por ejemplo, capas 24–35 con BFCL live_irrelevance +21,3, o capas 0–11 con Med-HALT FQT −6,3), pero no se ofrecen los valores absolutos del modelo final. No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 7,5 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo puede superar los 10–12 GB.
- Cuantización a 8 bits: aproximadamente 4 GB de pesos; a 4 bits: aproximadamente 2 GB, aunque el autor no publica GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y throughput alto; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16–24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090 y similares con 16 GB o más en bf16, y en GPUs de 8–12 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag text-generation-inference y endpoints_compatible); vLLM, llama.cpp u Ollama requerirían conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| KOS-V5.1-Instruct | ~3,7 B | no disponible | Apache 2.0 (uso de investigación) | Médico/clínico, tool calling, edición de pesos | Hugging Face |
| KOS-V5-Instruct (base) | ~3,7 B | no disponible | Apache 2.0 | Médico/clínico, tool calling | Hugging Face |
| Qwen3 (familia base) | ~3,7 B en su variante pequena | no disponible | Apache 2.0 | Propósito general | Hugging Face |

La comparación con otros modelos médicos pequeños de la misma categoría (por ejemplo, variantes de Meditron, BioMistral o Llama-Med) no está disponible en la información proporcionada, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- Restricción de uso: el autor declara explícitamente que el modelo es solo para investigación y prohíbe uso comercial, clínico, legal o de producción, pese a la licencia Apache 2.0; conviene revisar esta contradicción antes de cualquier despliegue.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto: la longitud de contexto no se documenta, lo que impide planificar aplicaciones con ventanas largas.
- Alucinación: el propio autor mide costes de alucinación en Med-HALT y TruthfulQA; aunque la edición busca eliminarlos, el modelo sigue siendo un sistema generativo con riesgo de error factual, crítico en dominio sanitario.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, sociales o lingüísticos.
- Naturaleza experimental: los pesos no provienen de un entrenamiento, sino de aritmética sobre pesos, con un único programa validado; la reproducibilidad depende del sha256 publicado y de un protocolo estadístico concreto.
- Sin cuantizaciones oficiales: no hay GGUF ni versiones cuantizadas publicadas, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- Advertencia médica: no debe usarse para diagnóstico, tratamiento ni decisión clínica real bajo ninguna circunstancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kentucky-Open-Science/KOS-V5.1-Instruct
- Modelo base: https://huggingface.co/Kentucky-Open-Science/KOS-V5-Instruct
- College of Medicine Office for Research (UK): https://medicine.uky.edu/sites/research
- Center for Clinical and Translational Science (UK): https://www.ccts.uky.edu/
- Kentucky Center for Digital Innovation (UofL): https://centers.louisville.edu/kentucky-center-digital-innovation
- Blog sobre weight-space programming (MIT CSAIL): https://rikiyat.github.io/blog/weight-space-programming/
- Task arithmetic (Ilharco et al.): https://arxiv.org/abs/2212.04089
- ExPO (Zheng et al.): https://arxiv.org/abs/2404.16792
- Model merging survey (Yang et al.): https://arxiv.org/abs/2408.07666
- Lista Awesome-Model-Merging: https://github.com/EnnengYang/Awesome-Model-Merging-Methods-Theories-Applications
- Crítica a weight-space programming (Ahmed): https://arxiv.org/abs/2611.08070
