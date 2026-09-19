# philgear/pocketgull-skeptic-cds-4b

## Resumen

PocketGull Skeptical Epistemology & H0 CDS Auditor es un adaptador LoRA (PEFT) construido sobre `google/gemma-3-4b-it`, publicado por Phillip Gear bajo la organizacion PocketGull LLC (registro de Oregón 258869891). Su proposito no es generar recomendaciones clinicas nuevas, sino auditar y cuestionar las que ya existen: evalua la validez del rechazo de la hipotesis nula (H0), marca estudios infrapotenciados (p >= 0,05), calcula el Fragility Index y valora el sesgo por patrocinio comercial segun la herramienta Cochrane RoB 2. Se trata, por tanto, de un modelo de "escepticismo epistemologico" aplicado a decision support clinico, no de un asistente terapeutico.

Tecnicamente es un adaptador de bajo rango sobre un transformer decoder-only de 4.000 millones de parametros, afinado con Direct Preference Optimization (DPO) sobre datos clinicos de dominio desidentificados conforme al estandar HIPAA §164.514 Safe Harbor. Los tags de la ficha mencionan los corpus NIH MedQuAD y WHO mhGAP como fuentes de dominio. El modelo se distribuye unicamente en ingles y esta pensado para computo local en el borde o despliegue privado en Google Cloud Vertex AI, con retencion cero de informacion de salud protegida (PHI).

Su relevancia actual radica en un nicho poco cubierto: la verificacion critica de evidencia y de recomendaciones generadas por IA en entornos sanitarios. Frente a modelos clinicos orientados a responder, este adaptador se orienta a refutar, cuantificar fragilidad estadistica y exponer conflictos de interes, lo que encaja con flujos de farmacovigilancia, lectura critica y gobernanza de CDS. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado el 18 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base `google/gemma-3-4b-it` |
| Parametros totales | 4B en el modelo base; parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la ficha del adaptador; la hereda del modelo base (no verificable en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se aplica sobre el modelo base, que puede cuantizarse por separado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 para el adaptador; el modelo base se rige por los Gemma Terms of Use de Google |
| Formato de pesos | adaptador PEFT (`adapter_config.json` + pesos safetensors), cargado sobre el base en safetensors |
| Libreria de carga | `peft` + `transformers` (ejemplo oficial con `PeftModel.from_pretrained`) |
| Pipeline | text-generation |
| Tarea declarada | Falsifiable Clinical Decision Support, Cochrane Risk of Bias y H0 Null Testing |
| Idioma declarado en la model card | en |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un adaptador LoRA que se superpone a `google/gemma-3-4b-it`, un transformer decoder-only instruction-tuned de aproximadamente 4.000 millones de parametros. La ficha no especifica el rango del adaptador, los modulos objetivo, el numero de parametros entrenables ni la composicion exacta del dataset, por lo que esos datos quedan como no disponibles. El metodo de ajuste declarado es Direct Preference Optimization (DPO), es decir, optimizacion sobre pares de preferencia en lugar de un RLHF con modelo de recompensa explicito.

Los datos de entrenamiento se describen como conjuntos clinicos de dominio desidentificados conforme a HIPAA §164.514 Safe Harbor, con mencion explicita a NIH MedQuAD y WHO mhGAP en los tags del repositorio. La innovacion tecnica destacable no esta en la arquitectura, sino en el objetivo de optimizacion: se entrena al modelo para adoptar una postura falsacionista, rechazar afirmaciones no respaldadas por la evidencia, detectar estudios infrapotenciados, calcular el Fragility Index (con umbral de menos de 3 eventos de reversion) y auditar el sesgo por patrocinio comercial segun Cochrane RoB 2. La ficha declara procedencia de ciencia abierta con un DOI de Zenodo (10.5281/zenodo.20647514).

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la mezcla de idiomas ni si hubo una fase previa de SFT antes del DPO.

## Capacidades

- Auditoria epistemologica de afirmaciones clinicas: evalúa si el rechazo de H0 esta justificado y senala conclusiones no soportadas por los datos.
- Calculo e interpretacion del Fragility Index, con deteccion de resultados fragiles (menos de 3 eventos de reversion).
- Evaluacion del riesgo de sesgo mediante Cochrane RoB 2, incluido el dominio de sesgo por patrocinio comercial.
- Analisis de potencia estadistica y marcado de estudios infrapotenciados (p >= 0,05).
- Razonamiento farmacologico basico: la propia model card incluye un ejemplo de evaluacion de metabolismo CYP450 con hierba de San Juan e warfarina.
- Analisis de evidencia para usos off-label, con ejemplos centrados en fibromialgia y trastorno de sintomas somaticos.
- Generacion de texto en ingles orientada a informes de auditoria y justificacion metodologica.
- Despliegue local con retencion cero de PHI, apto para edge computing y entornos privados en Vertex AI.

No se documenta en la informacion proporcionada soporte de tool calling / function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode). El pipeline declarado es unicamente text-generation y el idioma soportado es el ingles.

## Casos de uso

- Lectura critica asistida en ensayos clinicos: dado el abstract o el resultado de un estudio, el modelo calcula el Fragility Index, revisa la potencia estadistica y emite un juicio sobre la validez del rechazo de H0. Es adecuado porque ese es literalmente su objetivo de entrenamiento declarado.
- Auditoria de conflicto de interes: se le puede pasar la seccion de financiacion y declaraciones de un manuscrito para que aplique los dominios de Cochrane RoB 2 y marque sesgo por patrocinio industrial. La model card incluye un ejemplo explicito con un extracto patrocinado por la industria (p=0,048, n=24).
- Farmacovigilancia y deteccion de interacciones: el ejemplo de la ficha (hierba de San Juan junto a warfarina, evaluacion del metabolismo CYP450) muestra su uso como segunda opinion en revision de polimedicacion antes de elevar la alerta a un farmaceutico.
- Apoyo a la decision sobre prescripcion off-label: evaluacion de si la literatura empirica respalda un uso off-label concreto, util como documentacion previa a un comite de farmacia y terapia.
- Triaje documental en revisiones sistematicas: primer filtro automatico de abstracts para descartar estudios infrapotenciados o con riesgo de sesgo alto antes del cribado manual por dos revisores.
- Formacion de residentes y estudiantes de medicina: herramienta de practica para contraste de conclusiones, ya que obliga a explicitar el razonamiento estadistico y las limitaciones metodologicas.
- Gobernanza de IA clinica: auditoria de recomendaciones generadas por otros LLM sanitarios antes de que lleguen a un profesional, reduciendo el riesgo de recomendaciones no respaldadas por evidencia.
- Despliegue en entornos con requisitos de privacidad estrictos: al ser un adaptador de 4B pensado para ejecucion local, permite auditar contenido clinico sin enviar PHI a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni ninguna otra metrica cuantitativa, y los resultados de busqueda web proporcionados no contienen datos de evaluacion del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un base de 4B, la huella la determina el modelo base. En bfloat16 se situa en el entorno de 8-10 GB; en cuantizacion de 4 bits, en el entorno de 3-4 GB. Estas cifras son estimaciones a partir del tamano del base, no datos publicados en la ficha.
- GPU recomendadas: el ejemplo oficial usa `device_map="auto"` con `torch_dtype=torch.bfloat16`, sin especificar GPU. Para bf16 en una sola tarjeta son adecuadas A100 40 GB, H100, L40S o RTX 4090. Para cuantizacion de 4 bits basta una GPU de 6-8 GB.
- Cabe en GPU de consumo: si, con cuantizacion. El modelo base de 4B es desplegable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en bf16 completo, una RTX 4090 de 24 GB lo aloja sin problemas.
- Opciones de despliegue: la ruta documentada es `transformers` + `peft` con `PeftModel.from_pretrained`. Tambien es viable fusionar el adaptador en el base y servir con vLLM, TGI, llama.cpp u Ollama, aunque ninguna de estas opciones se documenta en la ficha proporcionada.
- Latencia y throughput estimados: no disponible. La ficha no publica ningun dato de latencia, tokens por segundo ni coste por peticion.
- Nota operativa: el codigo de ejemplo de la model card usa el identificador `pocketgull-llc/pocketgull-skeptic-cds-4b`, mientras que el identificador real del repositorio es `philgear/pocketgull-skeptic-cds-4b`; conviene verificar cual resuelve antes de desplegar.

## Comparativa con modelos similares

Los resultados de busqueda web disponibles no contienen informacion sobre modelos comparables, y la model card no ofrece tablas comparativas. La unica comparacion documentada es contra su propio modelo base.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| pocketgull-skeptic-cds-4b | 4B (base) + adaptador LoRA | no disponible | apache-2.0 (adaptador) | Auditoria epistemologica y CDS falsacionista | HuggingFace, 0 descargas |
| google/gemma-3-4b-it | 4B | no disponible en la informacion proporcionada | Gemma Terms of Use | Asistente multimodal instruction-tuned de proposito general | HuggingFace (modelo base) |
| Alternativas clinicas de 4B-8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros adaptadores clinicos comparables en la informacion proporcionada, por lo que cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- No es un dispositivo medico: la propia ficha lo encuadra como herramienta de apoyo no-device bajo FDA 520(o) y dirigida a profesionales sanitarios con licencia. No debe usarse para diagnostico ni tratamiento autonomo.
- Riesgo de alucinacion estadistica: al calcular Fragility Index, potencia o p-valores, el modelo puede producir cifras plausibles pero incorrectas. Cualquier calculo debe verificarse con software estadistico independiente.
- Tamano reducido: con una base de 4B, la capacidad de razonamiento estadistico y metodologico es limitada en comparacion con modelos de 70B o superiores; es esperable una mayor tasa de error en tareas de varios pasos.
- PHI y privacidad: aunque el modelo este disenado para computo local con retencion cero, eso depende del despliegue, no del artefacto. Si se envia PHI a una API externa, la garantia HIPAA Safe Harbor se rompe.
- Idioma unico: solo ingles. No hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso directo en Espana o Latinoamerica sin traduccion previa.
- Licencia del adaptador frente a la del base: el adaptador se publica como apache-2.0, pero el modelo base `google/gemma-3-4b-it` esta sujeto a los Gemma Terms of Use, que imponen restricciones de uso adicionales. La licencia permisiva del adaptador no exonera del cumplimiento de la licencia del base para uso comercial.
- Datos de entrenamiento no auditables desde fuera: la ficha declara desidentificacion HIPAA Safe Harbor y uso de NIH MedQuAD y WHO mhGAP, pero no publica composicion, tamano ni proceso de filtrado, lo que impide reproducir o auditar el ajuste.
- Sesgos desconocidos: al no documentarse la distribucion del dataset de preferencias, no puede evaluarse el sesgo hacia ciertas areas terapeuticas, patrocinadores o revistas.
- Metadatos incoherentes: la fecha de creacion registrada (18 de septiembre de 2026) es posterior a la fecha habitual de consulta, y el identificador del adaptador en el codigo de ejemplo (`pocketgull-llc/...`) no coincide con el identificador del repositorio (`philgear/...`). Conviene verificar la vigencia del artefacto.
- Adopcion nula: 0 descargas y 0 likes. No existe evidencia de uso en produccion, validacion externa ni revision por pares que respalde su fiabilidad clinica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philgear/pocketgull-skeptic-cds-4b
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Sitio de la organizacion: https://pocketgull.com
- Aplicacion declarada: https://pocketgull.app
- DOI en Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Paper, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenian articulos en portugues sobre compatibilidad entre pension y concurso publico en Brasil), por lo que no se ha extraido ningun enlace ni dato adicional de ellos.
