# Kami0867/Qwen-2.5-3B-Resume-Evaluator

## Resumen

Qwen-2.5-3B-Resume-Evaluator es un adaptador LoRA (fine-tuning mediante QLoRA) entrenado sobre Qwen/Qwen2.5-3B-Instruct, publicado por el usuario Kami0867 en HuggingFace. No es un modelo completo, sino un adapter PEFT de unos 0,1 GB que se aplica sobre el modelo base de 3 mil millones de parametros de Alibaba. Su proposito es muy concreto: funcionar como un cribador y evaluador automatico de curriculums (resume screener) orientado a procesos de seleccion de personal (HR-tech), generando puntuaciones calibradas y salidas JSON estrictas.

El modelo aborda un problema tipico en reclutamiento automatizado: la subjetividad y la inflacion de puntuaciones en los cribados de CVs. Para ello emplea una evaluacion basada en rubricas con desglose por categorias (habilidades tecnicas, relevancia de experiencia, formacion y certificaciones, liderazgo e impacto), ademas de deteccion de "red flags" como el abuso de palabras clave sin metricas, la inflacion de titulos o conflictos cronologicos.

Su relevancia practica radica en su ligereza: al ser un adaptador sobre un modelo de 3B, puede ejecutarse en hardware de consumo (se estima unos 3,25 GB de VRAM en cuantizacion INT8), lo que lo hace viable para despliegues locales de bajo coste en herramientas de RR. HH. La licencia MIT del adaptador permite uso comercial sin restricciones, heredando las condiciones de la licencia Apache 2.0 del modelo base Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-3B-Instruct (transformer decoder) |
| Parametros totales | no disponible (modelo base: ~3 mil millones; adaptador: ~0,1 GB de pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | INT8 (bitsandbytes, load_in_8bit); QLoRA durante el entrenamiento |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (adaptador); el modelo base Qwen2.5-3B-Instruct usa Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo no es un modelo autónomo: se trata de un adaptador LoRA entrenado con QLoRA (quantized Low-Rank Adaptation) sobre Qwen/Qwen2.5-3B-Instruct, un transformer decoder instruccional de Alibaba de aproximadamente 3 mil millones de parametros. Durante el entrenamiento, el modelo base se congela cuantizado y solo se actualizan las matrices de bajo rango del adaptador, lo que explica el tamano reducido del repositorio (0,1 GB).

La model card no detalla el dataset de entrenamiento, el numero de tokens, ni el proceso de alineacion posterior (RLHF/DPO). Lo que si documenta es el diseno de la tarea: el adaptador esta afinado para producir puntuaciones calibradas en una escala de 0 a 100, con desglose categorico y salida JSON estricta, sin desviaciones hacia markdown. La cuantizacion a 8 bits en inferencia reduce la huella de memoria del conjunto base + adaptador a unos 3,25 GB de VRAM.

## Capacidades

- Evaluacion de curriculums con puntuacion calibrada de 0 a 100, diseniada para evitar la inflacion de notas.
- Desglose categorico de la evaluacion: habilidades tecnicas, relevancia de la experiencia, formacion y certificaciones, y liderazgo e impacto.
- Deteccion de senales de alerta y discrepancias: penalizacion del relleno con palabras clave sin metricas, inflacion de titulos y conflictos cronologicos.
- Generacion de salida JSON estricta y esquematica, sin contaminacion con markdown, apta para integracion directa en pipelines.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-3B-Instruct (aunque el afinado esta orientado a la tarea de evaluacion de CVs).
- Idioma de trabajo: ingles; el rendimiento en castellano no esta documentado.

No hay informacion sobre soporte de tool calling, capacidades de vision o audio, ni modos de razonamiento extendido para este adaptador concreto.

## Casos de uso

- Cribado automatico de CVs en procesos de seleccion: el modelo puntua cada candidato de 0 a 100 segun una rubrica fija, permitiendo ordenar candidaturas de forma objetiva y reproducible antes de la revision humana.
- Integracion en ATS (Applicant Tracking Systems): gracias a su salida JSON estricta, la evaluacion puede parsearse directamente e insertarse en bases de datos o dashboards sin postprocesado.
- Panel de desglose por competencias para reclutadores: las cuatro categorias (tecnicas, experiencia, formacion, liderazgo) permiten mostrar al reclutador un perfil de fortalezas y debilidades por candidato.
- Deteccion de inconsistencias en candidaturas: la deteccion de conflictos cronologicos y de inflacion de titulos ayuda a identificar CVs sospechosos antes de la fase de entrevistas.
- Filtrado de CVs con sobreuso de palabras clave: penaliza el "buzzword stuffing" sin metricas, util para priorizar candidatos con logros cuantificados.
- Automatizacion de preseleccion a gran escala: con ~3,25 GB de VRAM en INT8, puede desplegarse en una GPU de consumo o incluso en instancias cloud baratas para procesar lotes de curriculums de forma local y privada, sin enviar datos de candidatos a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,25 GB en cuantizacion INT8 de 8 bits (modelo base + adaptador), segun la model card.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM es suficiente en INT8 (por ejemplo, RTX 3060, RTX 4060 o superiores). En FP16 sin cuantizar, el modelo base de 3B requiere aproximadamente 6-7 GB de VRAM.
- Cabe comodamente en GPUs de consumo: una RTX 3060 de 12 GB o incluso una RTX 4060 de 8 GB bastan para inferencia en INT8.
- Opciones de despliegue: la receta oficial usa transformers + peft + bitsandbytes (codigo de ejemplo en el repositorio de GitHub del proyecto). Al ser un adaptador PEFT, no hay pesos GGUF fusionados publicados, por lo que llama.cpp u Ollama requeririan fusionar primero el adaptador con el modelo base y convertir a GGUF. vLLM y TGI soportan adaptadores LoRA sobre modelos base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Licencia | Enfoque |
|---|---|---|---|---|
| Kami0867/Qwen-2.5-3B-Resume-Evaluator | Adaptador LoRA sobre Qwen2.5-3B-Instruct | ~0,1 GB (adaptador) | MIT | Evaluacion de CVs con salida JSON |
| Qwen/Qwen2.5-3B-Instruct (base) | Modelo instruccional completo | ~3B parametros | Apache 2.0 | Uso general, sin especializacion en RR. HH. |
| Llama-3.2-3B-Instruct | Modelo instruccional completo | ~3B parametros | Llama 3.2 Community License | Uso general; requeriria afinado propio para esta tarea |

En la categoria de evaluadores de curriculums afinados y publicos, no hay alternativas directamente comparables con documentacion suficiente en la informacion disponible. La ventaja diferencial de esta ficha frente a usar el modelo base sin afinar es la salida JSON estructurada y la rubrica de evaluacion integrada.

## Limitaciones y advertencias

- Sesgos: al tratarse de un modelo afinado para cribado de CVs, puede heredar y amplificar sesgos presentes en los datos de entrenamiento (que no estan documentados), con riesgo de discriminacion por genero, edad, origen o trayectoria no lineal. Su uso en decisiones de contratacion reales puede estar sujeto a regulacion (por ejemplo, normativas de IA y empleo); se recomienda supervision humana obligatoria.
- Riesgo de alucinacion: como todo LLM de 3B, puede inventar detalles no presentes en el CV o puntuar de forma inconsistente ante inputs ambiguos. No hay evaluaciones publicadas de su fiabilidad.
- Idioma: documentado y afinado para ingles; el comportamiento con curriculums en castellano no esta verificado.
- Contexto: la longitud de contexto no esta documentada en la model card del adaptador; los CVs muy largos podrian exceder la ventana del modelo base si se incluyen descripciones de puesto extensas.
- Licencia: el adaptador es MIT y el modelo base Apache 2.0, ambos permisivos para uso comercial; aun asi, conviene revisar los terminos de Qwen2.5 para despliegues a gran escala.
- Es un adaptador, no un modelo fusionado: requiere cargar el modelo base Qwen2.5-3B-Instruct y aplicar el adapter con la libreria peft, lo que anade una dependencia adicional en produccion.
- Popularidad muy baja (30 descargas, 1 like en el momento de la ficha): proyecto con poca comunidad, sin garantia de mantenimiento ni auditorias externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kami0867/Qwen-2.5-3B-Resume-Evaluator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de GitHub del proyecto (codigo de inferencia): https://github.com/ChiragPrasad2006/Resume-Evaluator-3B
