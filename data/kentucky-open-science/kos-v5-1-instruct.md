# Kentucky-Open-Science/KOS-V5.1-Instruct

## Resumen

KOS-V5.1-Instruct, con nombre en clave "Catbird", es un modelo de lenguaje de unos 3.715 millones de parametros desarrollado por la Universidad de Kentucky (College of Medicine, Office for Research y Center for Clinical and Translational Science) junto con la Universidad de Louisville (Kentucky Center for Digital Innovation). Pertenece a la familia KOS-V5 y esta especializado en dominio medico, clinico y biomedico, con capacidades de instruccion, tool calling y function calling. Su arquitectura declarada es de tipo Qwen3 y esta orientado a generacion de texto conversacional en ingles.

Su rasgo mas distintivo es el metodo de construccion: no proviene de un checkpoint de entrenamiento al uso, sino que sus pesos se han generado mediante "weight-space programming", es decir, aritmetica sobre vectores de pesos (task arithmetic). Concretamente, los pesos publicados equivalen a KOS-V5-Instruct mas un vector de tarea de identidad aplicado a las capas MLP de las 36 capas, menos un vector de replay aplicado solo a las capas 12-23. Las partes de atencion, embeddings y normalizacion son identicas bit a bit a las del modelo base.

El modelo se publica bajo licencia Apache 2.0, pero el autor lo restringe explicitamente a uso de investigacion, prohibiendo aplicaciones comerciales, clinicas, legales o de produccion. Es relevante ahora como caso practico de edicion y fusion de pesos evaluada con una bateria estadistica rigurosa (27 metricas, tests pareados de McNemar y sign-flip) y como modelo pequeno de dominio medico con soporte de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (model_type: qwen3) |
| Parametros totales | 3.715.431.936 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con restriccion de uso a investigacion en la model card) |
| Formato de pesos | safetensors (libreria transformers); repo de 7,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo Qwen3 con 36 capas, segun se desprende del programa de pesos descrito (las capas MLP modificadas abarcan las 36 capas). No se detalla en la informacion disponible el numero de cabezas, la dimension oculta ni la longitud de contexto. El modelo deriva de KOS-V5-Instruct mediante una relacion de tipo "merge".

El entrenamiento efectivo de esta version no es un entrenamiento convencional: los pesos se obtienen por aritmetica de vectores de tarea. El programa aplicado es V5.1 = V5 + tau_identity (MLP, 36 capas) - tau_replay (MLP, capas 12-23), donde tau_identity es el cambio de pesos producido por un fine-tune de identidad sobre KOS-V5-Instruct y tau_replay es el cambio del mismo fine-tune ejecutado solo sobre los datos de replay general. La resta elimina la deriva introducida por el replay. La aritmetica se realiza en fp32 y se almacena en bf16. Solo cambian los pesos MLP; atencion, embeddings y normas son identicos bit a bit al modelo base.

La seleccion del programa se hizo entre catorce candidatos (diez programas de pesos, tres variantes solo de configuracion y un ajuste de generacion) frente a una bateria de decision de 27 metricas: las 17 categorias de BFCL, Med-HALT (FCT, NOTA, FQT), AfriMed-QA MCQ, cuatro metricas de IFEval y TruthfulQA MC1/MC2. Se aplico una puerta de no empeoramiento significativo, tests pareados por item (McNemar exacto o sign-flip, p < 0,05) y validacion cruzada por mitades con hash. El resultado declarado es de 7 metricas significativamente mejores y ninguna peor. Se probaron y descartaron otras ubicaciones de la resta (capas 0-11, capas 24-35), la fusion equitativa de ambas ediciones y la extrapolacion estilo ExPO.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones (instruction-following) en ingles.
- Tool calling y function calling, con mejora declarada en las metricas de rechazo de herramientas (tool refusal) y en Med-HALT FCT.
- Razonamiento clinico y biomedico orientado a preguntas medicas (evaluado con Med-HALT y AfriMed-QA).
- Capacidad de mantener la identidad del modelo gracias al vector de identidad aplicado.
- Comportamiento controlado ante peticiones fuera de dominio, medido con las categorias de irrelevancia de BFCL.
- No se declaran capacidades de vision, audio, agentes multi-paso ni modo de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- Investigacion en edicion de modelos: servir como referencia reproducible de task arithmetic aplicada a un modelo medico, comparando el efecto de restar el vector de replay en distintos bloques de capas.
- Evaluacion de metodologias de fusion de pesos: usar el modelo como baseline y contraste en experimentos con tecnicas como TIES, DARE o ExPO, gracias a la bateria de 27 metricas y a la validacion estadistica publicada.
- Experimentos de seguridad y rechazo de herramientas: estudiar el comportamiento de tool refusal en entornos controlados usando las categorias de irrelevancia en vivo de BFCL.
- Preguntas y respuestas biomedicas en laboratorio: prototipar sistemas de QA clinica sobre conjuntos como Med-HALT o AfriMed-QA en un contexto estrictamente de investigacion.
- Analisis de alucinacion en dominio medico: emplear TruthfulQA y Med-HALT FQT como sondas para medir la tendencia a generar contenido incorrecto en un modelo pequeno.
- Docencia y formacion: ilustrar en cursos de IA el ciclo completo de evaluacion por metricas pareadas, seleccion de candidatos y validacion cruzada sobre un modelo de 3.700 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe la bateria de evaluacion (BFCL, Med-HALT, AfriMed-QA, IFEval, TruthfulQA) y el resultado agregado de "7 metricas significativamente mejores y ninguna peor" frente a KOS-V5-Instruct, pero no incluye las cifras concretas por metrica.

## Requisitos de hardware

- VRAM estimada: con 3.715 millones de parametros, en bf16 se requieren aproximadamente 7,5-8 GB solo para los pesos; en fp16, similar. En cuantizacion de 8 bits, en torno a 4 GB; en 4 bits, en torno a 2,5-3 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con margen para contexto; RTX 4090 (24 GB) permite inferencia holgada en bf16.
- GPU de consumo: cabe en tarjetas con 8 GB o mas en bf16 y en tarjetas de 6-8 GB con cuantizacion. No se han publicado requisitos oficiales.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta text-generation-inference en Hugging Face) y endpoints compatibles. No se confirma soporte de llama.cpp, Ollama, vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| KOS-V5.1-Instruct | 3,7 B | no disponible | Apache 2.0 (restriccion a investigacion) | Edicion por task arithmetic sobre KOS-V5-Instruct; dominio medico |
| KOS-V5-Instruct | no disponible | no disponible | no disponible | Modelo base del que deriva; mismo dominio |
| Qwen3 (familia) | no disponible | no disponible | no disponible | Familia de arquitectura declarada como model_type; no se especifica version comparable |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Restriccion de licencia: aunque la licencia declarada es Apache 2.0, la model card prohibe explicitamente el uso comercial, clinico, legal o de produccion. Existe una contradiccion entre licencia y aviso que debe resolverse antes de cualquier uso.
- Uso en medicina: el modelo no debe emplearse en decisiones clinicas; cualquier evaluacion medica es de investigacion.
- Idiomas: solo se declara ingles, lo que limita su uso en castellano y otros idiomas.
- Contexto: no se publica la longitud de contexto, por lo que no puede dimensionarse su uso en conversaciones largas.
- Alucinacion: el autor informa de costes en benchmarks de alucinacion asociados a la edicion de identidad, que se mitigan parcialmente con la resta del replay en las capas 12-23. Persiste el riesgo de contenido incorrecto, especialmente en dominio medico.
- Sesgos: no se documentan evaluaciones de sesgo ni de equidad en la informacion disponible.
- Madurez: el modelo tiene cero descargas y cero likes en el momento de la consulta, y el contenido de la model card esta parcialmente truncado, lo que limita la verificacion de detalles.
- Procedencia de pesos: al no derivar de un checkpoint de entrenamiento, la trazabilidad y reproducibilidad dependen del hash sha256 publicado, pero no se detalla el proceso de generacion de los vectores de tarea.

## Enlaces

- Hugging Face: https://huggingface.co/Kentucky-Open-Science/KOS-V5.1-Instruct
- Modelo base: https://huggingface.co/Kentucky-Open-Science/KOS-V5-Instruct
- University of Kentucky, College of Medicine Office for Research: https://medicine.uky.edu/sites/research
- University of Kentucky, Center for Clinical and Translational Science (CCTS): https://www.ccts.uky.edu/
- University of Louisville, Kentucky Center for Digital Innovation: https://centers.louisville.edu/kentucky-center-digital-innovation
- Blog sobre weight-space programming (MIT CSAIL): https://rikiyat.github.io/blog/weight-space-programming/
- Lista de metodos de fusion de modelos: https://github.com/EnnengYang/Awesome-Model-Merging-Methods-Theories-Applications
- Papers citados: arXiv:2611.08070, arXiv:2212.04089, arXiv:2404.16792, arXiv:2408.07666, arXiv:2603.26299, arXiv:2608.04215, arXiv:2610.22293, arXiv:2509.03122, arXiv:2305.13546, arXiv:2610.18471, arXiv:2610.01649, arXiv:2503.20083, arXiv:2609.33816, arXiv:2601.00065, arXiv:2411.00640
