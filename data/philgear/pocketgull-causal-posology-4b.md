# philgear/pocketgull-causal-posology-4b

## Resumen

PocketGull Causal Posology & Lifespan Dosage Suite es un adaptador LoRA (libreria `peft`) publicado por el usuario philgear, vinculado a PocketGull LLC, que se monta sobre el modelo base `google/gemma-3-4b-it`. Su dominio declarado es la posologia clinica a lo largo del ciclo vital: calibracion de dosis en neonatos, poblacion pediatrica, adultos y geriatria, con reglas explicitas para los criterios AGS Beers 2023, el calculo de Relative Infant Dose (RID) segun LactMed, los ajustes renales por Cockcroft-Gault y simulaciones contrafactuales de trayectoria mediante AIPW doblemente robusto.

El adaptador se ha ajustado, segun la model card, con Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos de dominio que respetan el estandar de desidentificacion HIPAA §164.514 Safe Harbor. El autor lo posiciona como herramienta de soporte a la decision (CDS) no clasificada como dispositivo medico bajo la exencion FDA 520(o), orientada a computacion local en el borde o a despliegue privado en Google Cloud Vertex AI, con retencion cero de PHI.

Es relevante ahora como ejemplo de microespecializacion de un modelo pequeño (4B) en un nicho regulado, con trazabilidad academica mediante DOI de Zenodo. Conviene senalar desde el principio que la ficha publica en HuggingFace muestra 0 descargas y 0 likes, que no se han publicado resultados de benchmarks y que la model card no documenta volumen de tokens de entrenamiento, composicion del dataset ni ventana de contexto del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base `google/gemma-3-4b-it`) |
| Parametros totales | No disponible en la model card; el modelo base se identifica como 4B (aproximadamente 4.000 millones). El adaptador anade un numero de parametros entrenables no especificado |
| Longitud de contexto | No disponible; el adaptador hereda la ventana del modelo base, que la model card no cuantifica |
| Tipos de cuantizacion | No disponible; no se documentan versiones cuantizadas del adaptador |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 (adaptador). El modelo base se rige por sus propios terminos de uso |
| Formato de pesos | Adaptador PEFT compatible con `PeftModel.from_pretrained`; la model card no detalla el contenedor exacto (habitualmente safetensors) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base `google/gemma-3-4b-it`, un transformer decoder-only de la familia Gemma 3, mas un adaptador de bajo rango (LoRA) que modifica un subconjunto de pesos. La model card no especifica rango, modulos objetivo, alpha, dropout ni el numero de parametros entrenables del adaptador, por lo que no es posible dimensionar el coste de entrenamiento ni el grado de desviacion respecto al base.

El entrenamiento se describe como un ajuste con Direct Preference Optimization (DPO) sobre datos clinicos de dominio, desidentificados conforme a HIPAA §164.514 Safe Harbor. No se indican el numero de tokens, el numero de pares de preferencia, la composicion del dataset, ni si hubo una fase previa de supervised fine-tuning. La unica innovacion tecnica declarada por el autor es funcional, no arquitectonica: la integracion de reglas de posologia (Beers 2023, LactMed RID, Cockcroft-Gault) y de simulacion contrafactual AIPW en las respuestas del modelo. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni variantes hibridas.

## Capacidades

- Generacion de texto en ingles con registro tecnico-clinico, orientada a respuestas breves y estructuradas sobre farmacologia y dosificacion.
- Calculo y explicacion de ajustes de dosis: Cockcroft-Gault para funcion renal, reglas de Clark y Young, superficie corporal por Mosteller en pediatria.
- Aplicacion de criterios de riesgo en geriatria, en particular la lista AGS Beers 2023 y la carga anticolinergica de las prescripciones.
- Estimacion de exposicion infantil en lactancia mediante el Relative Infant Dose (RID) de LactMed y clasificacion en niveles de seguridad.
- Razonamiento sobre interacciones farmacologicas y metabolismo via citocromo P450 (el ejemplo de la model card cita hierba de San Juan con warfarina).
- Simulacion de trayectorias contrafactuales mediante AIPW doblemente robusto, segun la descripcion del autor.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles declarado.
- Capacidad de vision: la model card no la menciona; el pipeline declarado es `text-generation`, pese a que el modelo base es de la familia `-it` multimodal.
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Ajuste de dosis en insuficiencia renal: dado un paciente con peso, edad, sexo y creatinina serica, calcular el aclaramiento por Cockcroft-Gault y proponer la reduccion de dosis del farmaco, como en el ejemplo de gabapentina con SCr 1,9 mg/dL que figura en la model card.
- Revision de prescripciones en geriatria: introducir la lista de medicacion de un paciente mayor y obtener una evaluacion de criterios Beers 2023 y de riesgo anticolinergico acumulado, util como segunda revision antes de la validacion del farmaceutico.
- Consejo farmacologico en lactancia: calcular el RID estimado de un antidepresivo y clasificar el nivel de exposicion del lactante, aportando al clinico un dato cuantitativo para la conversacion con la madre.
- Dosificacion pediatrica: obtener de forma simultanea las estimaciones por regla de Clark, regla de Young y fraccion de BSA de Mosteller, contrastando metodos en lugar de aplicar uno solo.
- Deteccion de interacciones metabolizadas por CYP450: consultas como la del ejemplo del quickstart (hierba de San Juan con warfarina) permiten obtener un razonamiento sobre induccion o inhibicion enzimatica antes de ajustar el tratamiento.
- Simulacion de escenarios terapeuticos alternativos: uso del enfoque AIPW descrito por el autor para comparar trayectorias de dosis y estimar resultados contrafactuales en cohortes retrospectivas.
- Despliegue local en entornos con datos sensibles: al ser un adaptador de 4B, puede ejecutarse en hardware de gama media dentro de la red del hospital, lo que encaja con el objetivo declarado de retencion cero de PHI.
- Soporte docente en farmacologia clinica: generacion de casos de posologia con justificacion de calculos para residentes, siempre con supervision de un especialista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con MedQA, MMLU, USMLE ni metricas de calculo posologico, y los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Benchmarks clinicos (MedQA, PubMedQA, etc.) | No disponible |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (aproximadamente 4.000 millones de parametros) y del uso de un adaptador LoRA; la model card no publica mediciones.

- VRAM para inferencia en bf16/fp16: en torno a 8-10 GB para los pesos del modelo base mas el adaptador y el cache de activaciones, dependiendo de la longitud de secuencia.
- VRAM en cuantizacion de 4 bits: aproximadamente 3-4 GB de pesos, lo que permite ejecucion en GPUs de consumo con 8 GB o mas.
- GPUs de gama profesional recomendadas: A100 40/80 GB, H100, L40S o A10G, con margen amplio para lotes grandes y contexto largo.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, siempre en cuantizacion de 4 u 8 bits para las de menor VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, el camino nativo es `transformers` + `peft`; tambien puede servirse con vLLM o TGI fusionando el adaptador en el modelo base, y con llama.cpp u Ollama si se convierte previamente a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.
- Despliegue en nube privada: la model card menciona Google Cloud Vertex AI como opcion alineada con la politica de cero retencion de PHI.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de otros adaptadores clinicos comparables en la informacion proporcionada. La unica comparacion posible con los datos disponibles es frente al modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| pocketgull-causal-posology-4b | Adaptador LoRA sobre base de aproximadamente 4B | No disponible | apache-2.0 (adaptador) | Publicado en HuggingFace, 0 descargas, 0 likes | No publicados |
| google/gemma-3-4b-it (base) | Aproximadamente 4B | No disponible en la informacion proporcionada | Terminos de uso de Gemma | Ampliamente disponible | No consultados en esta busqueda |

No disponible para el resto de alternativas de la misma categoria (adaptadores clinicos equivalentes), al no haberse recuperado informacion al respecto.

## Limitaciones y advertencias

- Riesgo de alucinacion con consecuencias potencialmente graves: se trata de un modelo de posologia, donde un calculo erroneo o una interaccion omitida puede derivar en dano al paciente. No debe usarse sin validacion por un profesional sanitario licenciado.
- Ausencia total de benchmarks publicos: no hay evidencia cuantitativa de su precision en calculo de dosis, aplicacion de Beers 2023 o estimacion de RID. Las afirmaciones de la model card son declarativas.
- Falta de trazabilidad del entrenamiento: no se documentan tokens, composicion del dataset, numero de pares de preferencia ni hiperparametros de DPO, lo que impide auditar sesgos o cobertura de subpoblaciones.
- Cobertura idiomatica limitada al ingles, lo que restringe su uso directo en entornos clinicos en castellano sin una adaptacion adicional.
- Advertencia regulatoria: la exencion FDA 520(o) para CDS no es una certificacion; en la Union Europea, un software con estas funciones puede caer bajo el reglamento MDR si se comercializa con finalidad medica.
- Licencia del modelo base: aunque el adaptador declara apache-2.0, el uso de `google/gemma-3-4b-it` queda sujeto a los terminos de uso de Gemma, que imponen obligaciones adicionales al redistribuir o desplegar el modelo combinado.
- Dependencia del base exacto: el adaptador solo es valido montado sobre `google/gemma-3-4b-it`; no es un modelo autonomo ni puede ejecutarse sin descargar el base.
- Discrepancia de namespace: la model card referencia el adaptador como `pocketgull-llc/pocketgull-causal-posology-4b`, mientras que el identificador publicado es `philgear/pocketgull-causal-posology-4b`, lo que puede provocar fallos de carga en scripts copiados literalmente.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente ni de validacion externa.
- Sin documentacion de soporte de tool calling, agentes o modo de razonamiento explicito, lo que limita su integracion en pipelines automatizados complejos.
- Sesgos conocidos: no disponibles. El autor no publica analisis de sesgo por edad, sexo, etnia ni comorbilidades, aspectos criticos en un modelo de dosificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philgear/pocketgull-causal-posology-4b
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Repositorio Zenodo (DOI declarado en la model card): https://doi.org/10.5281/zenodo.20647514
- Sitio de la organizacion: https://pocketgull.com
- Aplicacion citada en la bibliografia de la model card: https://pocketgull.app
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Los resultados de busqueda web devueltos para esta consulta versan sobre cifrado de discos BitLocker y no contienen informacion relevante sobre el modelo; no se han recuperado papers, blogs ni demos adicionales.
