# litillabs/litil-contract-playbook-3b

## Resumen

LiTiL Contract Playbook 3B es un adaptador LoRA de tipo PEFT publicado por litillabs sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No es un modelo autonómo: se distribuye como adaptador de 119.801.528 bytes (unos 114 MB) que debe cargarse junto con los pesos del modelo base. Su funcion es actuar como capa de politica en un stack de revision contractual: recibe una clausula, la regla de playbook aplicable y el contexto del acuerdo, y devuelve un unico objeto JSON con la accion de revision recomendada.

El adaptador ejecuta la politica M9 Contract Action Policy — Playbook v1, un playbook de autoria local con 70 reglas repartidas en 13 familias de clausulas (limitacion de responsabilidad, indemnizacion, confidencialidad, uso de datos de cliente para IA, DPA y seguridad, cesion y cambio de control, renovacion automatica, terminacion, titularidad de PI, publicidad, exencion de garantias, subencargados y derechos de auditoria). Devuelve una de siete acciones —accept, redline, fallback_1, fallback_2, business_approval, legal_escalation o reject— junto con nivel de riesgo, etiquetas de issue, texto de riesgo, base de la regla y lenguaje de fallback propuesto.

Su relevancia practica esta en el formato de salida: JSON estricto, con vocabulario enumerado y validable, pensado para poblar pantallas de revision, enrutar aprobaciones o disparar redlines de forma automatica. La model card reporta una precision de accion del 84,97% en 925 casos de evaluacion frente al 25,41% del modelo base, y un 100% de JSON valido. El entrenamiento se hizo exclusivamente con datos sinteticos generados programaticamente, sin texto de contratos de clientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador PEFT LoRA; no es MoE ni SSM |
| Parametros totales | Aproximadamente 3.000 millones en el modelo base; el adaptador LoRA ocupa 119.801.528 bytes (unos 114 MB). Parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Configuracion evaluada y retenida: hasta 1.728 tokens de prompt renderizado y hasta 320 tokens generados. La model card no declara una longitud de contexto propia del adaptador; el modelo base admite ventanas mayores (consultar su ficha) |
| Tipos de cuantizacion | El adaptador se publica en safetensors (BF16 en el entrenamiento). La seccion de runtime sizing menciona pesos base en 4 bits (unos 1,5 GB de datos de pesos), pero no se enumeran variantes de cuantizacion del adaptador |
| Idiomas soportados | Ingles (en), segun la model card. Contexto legal y comercial estadounidense |
| Licencia | other (el adaptador). La model card no reproduce el texto de la licencia; deben respetarse ademas los terminos del modelo base Qwen/Qwen2.5-3B-Instruct |
| Formato de pesos | Adaptador PEFT LoRA en safetensors. No se publica GGUF propio |
| Modelo base | Qwen/Qwen2.5-3B-Instruct (relacion: adapter) |
| Revision de adaptador probada | ee221045c94b15166e5ed513f3c189c8ce2b3665 |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 3B del modelo Qwen2.5-3B-Instruct. El ajuste es LoRA con rango 16, alpha 32 y dropout 0,05, entrenado durante cuatro epocas con longitud maxima de secuencia 2048, batch por dispositivo 1, acumulacion de gradiente 8, precision BF16, learning rate 2e-4, programacion coseno, ratio de warmup 0,03 y sin packing. El objetivo de entrenamiento registrado es una GPU RunPod NVIDIA L4 de 24 GB orquestada con SkyPilot. No se menciona RLHF ni DPO: el post-entrenamiento descrito es un SFT con LoRA.

El dataset de entrenamiento consta de 5.560 ejemplos generados programaticamente, con 383 ejemplos de desarrollo y 925 de evaluacion. Una comprobacion de linaje a nivel de fila vinculo las 5.560 filas con los generadores deterministas: 4.780 proceden del pool original de plantillas literales y 780 del generador de cobertura. Los generadores usan plantillas sinteticas fijas y el playbook generico de pruebas; no cargan fuentes documentales de clientes, y la model card afirma que ningun archivo o texto contractual de cliente aparece en el dataset.

La innovacion principal no es arquitectonica sino de contrato de interface: el prompt debe renderizarse en un orden fijo (contract_type, company_side, deal_context, clause_type, playbook_excerpt, clause_text) y la salida debe ser un unico objeto JSON con ocho campos exactos (action, risk_level, issue_tags, risky_text, playbook_basis, recommended_fallback, missing_facts, explanation). La evaluacion retenida uso decodificacion greedy, truncado de prompt a 1.728 tokens y max_new_tokens=320. El diseno asume que el modelo aplica la regla de playbook suministrada y no inventa reglas estatutarias, y que la validacion estricta del JSON (claves, valores enumerados y vocabulario de issue_tags) ocurre antes de usar la decision aguas abajo.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen2.5-3B-Instruct.
- Generacion estructurada: devuelve un unico objeto JSON con los ocho campos definidos en el contrato de salida.
- Clasificacion de accion de revision en siete clases: accept, redline, fallback_1, fallback_2, business_approval, legal_escalation y reject.
- Asignacion de nivel de riesgo en cuatro valores: low, medium, high y critical.
- Aplicacion de reglas de playbook: 70 reglas en 13 familias de clausulas, con cita de la base de la regla en el campo playbook_basis.
- Extraccion de excerptos de la clausula suministrada en el campo risky_text.
- Deteccion de hechos faltantes del deal context mediante el campo missing_facts.
- Propuesta de lenguaje de fallback negociable en recommended_fallback.
- Etiquetado de issues restringido al vocabulario del playbook suministrado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Revision de clausulas de primera pasada: un clasificador de clausulas identifica la provision y extrae los hechos clave; el workflow entrega la regla de playbook correspondiente al adaptador, que devuelve accion y nivel de riesgo de forma consistente. Es adecuado porque la salida JSON es determinista en formato y validable antes de actuar.
- Enrutado de redlines: cuando la accion devuelta es redline o fallback_1/fallback_2, el objeto JSON puede iniciar directamente un flujo de marcado de cambios con el texto de recommended_fallback como propuesta inicial.
- Escalado a legal especializado: con la accion legal_escalation o un risk_level critical, el sistema puede derivar la clausula a un abogado conservando playbook_basis como justificacion de la derivacion.
- Enrutado de aprobaciones de negocio: la accion business_approval permite enviar la clausula a un responsable comercial con el contexto de deal ya estructurado, sin intervencion manual de triaje.
- Completado de informacion de acuerdos: el campo missing_facts identifica que hechos del deal context faltan; el sistema puede solicitarlos antes de emitir una decision definitiva, reduciendo decisiones tomadas con contexto incompleto.
- Triaje de contratos B2B SaaS, servicios de ciberseguridad y acuerdos de tratamiento de datos (DPA): el playbook cubre especificamente esas familias, incluidas clausulas de uso de datos de cliente para IA, subencargados y derechos de auditoria.
- Auditoria y trazabilidad de decisiones: cada resultado incorpora la regla que lo sustento, lo que permite reconstruir por que se acepto, se modifico o se rechazo una clausula en revisiones posteriores o auditorias internas.
- Control de calidad de revisiones humanas: comparar la accion del revisor con la accion del adaptador sobre el mismo par clausula-regla permite detectar desviaciones sistematicas respecto al playbook.
- Pre-revision en volumen: aplicar el adaptador a lotes de contratos para priorizar por risk_level y reservar el esfuerzo humano para los casos high y critical.

## Benchmarks y rendimiento

Datos publicados en la model card. El modelo base de comparacion es Qwen/Qwen2.5-3B-Instruct sin adaptador.

| Evaluacion | Casos | Qwen base | LiTiL Contract Playbook |
|---|---:|---:|---:|
| Precision de accion en desarrollo | 383 | 11,49% | 85,12% |
| Precision de accion en evaluacion | 925 | 25,41% | 84,97% |
| Precision de decision binaria en evaluacion | 925 | 72,54% | 87,89% |
| JSON valido | 925 | 99,78% | 100,00% |

Baseline adicional reportado: una busqueda TF-IDF sobre las mismas filas de entrenamiento alcanzo 67,68% de precision exacta de accion y 75,35% de precision de decision binaria. El intervalo de Wilson para la precision exacta de accion del adaptador en los 925 casos es 82,53–87,13%.

Advertencia metodologica recogida en la model card: los ejemplos aplican identificadores de regla representados en el entrenamiento y sus decisiones de referencia proceden del mismo resolver de playbook versionado, por lo que las cifras miden la ejecucion del playbook dentro de esa interfaz concreta, no una capacidad legal general. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- Pesos del modelo base en BF16: aproximadamente 6 GB, mas unos 114 MB del adaptador.
- Memoria total estimada en BF16: del orden de 8–10 GB de memoria de acelerador para la envolvente probada de 2K tokens (pesos, activaciones y cache KV incluidos).
- Pesos base en 4 bits: aproximadamente 1,5 GB de datos de pesos; un despliegue practico con prompts cortos suele requerir 4–6 GB contando metadatos de cuantizacion, activaciones y cache KV.
- GPU profesionales: el entrenamiento registrado cabe en una NVIDIA L4 de 24 GB. Para inferencia en BF16, GPUs de 16–24 GB (L4, A10G, RTX 4090, A100) operan con margen holgado.
- GPU de consumo: cabe en GPUs consumer. En 4 bits es viable en tarjetas de 8 GB; en BF16 conviene disponer de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: la model card no documenta un stack de servicio concreto. Al ser un adaptador PEFT, las vias habituales son transformers con la libreria peft, o servidores con soporte de adaptadores LoRA (por ejemplo vLLM o TGI); ninguna de estas opciones se confirma en la informacion proporcionada. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento no descrito en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros adaptadores de revision contractual con cifras publicadas comparables. La comparacion se limita, por tanto, al modelo base y al baseline no neuronal reportado por el autor.

| Modelo | Parametros | Formato | Precision de accion (eval, 925) | Precision de decision binaria | JSON valido | Licencia |
|---|---|---:|---:|---:|---:|---|
| LiTiL Contract Playbook 3B (adaptador LoRA) | ~3B (base) + adaptador | Safetensors PEFT | 84,97% | 87,89% | 100,00% | other |
| Qwen2.5-3B-Instruct (base, sin adaptar) | ~3B | Safetensors | 25,41% | 72,54% | 99,78% | Consultar ficha del modelo base |
| Baseline TF-IDF sobre filas de entrenamiento | No es un modelo neuronal | Lookup | 67,68% | 75,35% | No aplica | No disponible |

Contexto del modelo base: la model card no reproduce la longitud de contexto de Qwen2.5-3B-Instruct ni su licencia; ambos datos deben consultarse en la ficha del modelo base. No hay datos de rendimiento fuera del playbook M9 v1 para ninguno de los elementos comparados.

## Limitaciones y advertencias

- Modelo unicamente en ingles. No se declara soporte de castellano ni de otros idiomas.
- Dominio muy restringido: revision de clausulas bajo un playbook concreto (M9 Contract Action Policy — Playbook v1) y en un contexto comercial estadounidense. No es un asistente legal general.
- Entrenamiento exclusivamente sintetico: 5.560 ejemplos generados por plantillas deterministas. No contiene contratos de clientes, lo que reduce riesgos de privacidad pero implica que el comportamiento sobre lenguaje contractual real fuera de la distribucion de esas plantillas no esta caracterizado.
- Las metricas publicadas miden ejecucion del playbook dentro de la interfaz de referencia, con identificadores de regla vistos en entrenamiento y decisiones de referencia del mismo resolver. No demuestran generalizacion a reglas nuevas, a otra version del playbook ni a playbooks de terceros.
- Riesgo de alucinacion: los campos risky_text y recommended_fallback pueden contener excerptos o lenguaje no presentes en la clausula o en el playbook. Debe comprobarse que risky_text sea cita literal del texto suministrado y que recommended_fallback provenga del excerpto de playbook.
- La model card exige validacion con un decodificador JSON estricto, incluidas claves, valores enumerados y vocabulario de issue_tags, antes de usar la decision aguas abajo. No hacerlo puede propagar acciones invalidas a sistemas de enrutado o redline.
- Limite de entrada: la configuracion probada trunca el prompt a 1.728 tokens. Clausulas o excerptos de playbook mas largos pueden perder informacion relevante.
- No es asesoramiento legal. Cualquier decision debe pasar por supervision humana; el propio diseno lo plantea como capa de politica dentro de un stack, no como autoridad final.
- Licencia other sin texto reproducido en la model card: es imprescindible verificar los terminos exactos del adaptador y, en paralelo, los del modelo base Qwen2.5-3B-Instruct antes de un uso comercial.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso independiente ni de replicacion de las cifras reportadas.
- No se declaran analisis de sesgos ni evaluaciones de robustez frente a prompts adversarios o clausulas deliberadamente ambiguas.
- Dependencia del pipeline: el adaptador asume que un clasificador previo identifica correctamente el tipo de clausula y que se le entrega la regla de playbook correcta. Errores en esas etapas previas degradan la decision sin que el modelo pueda detectarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/litil-contract-playbook-3b
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Los resultados de la busqueda web proporcionados no contienen informacion relevante sobre este modelo: corresponden a consultas no relacionadas sobre Adobe Acrobat. No se dispone de papers, blogs, repositorios ni demos adicionales en la informacion disponible.
