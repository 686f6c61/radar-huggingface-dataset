# philgear/pocketgull-allometric-sfi-1b

## Resumen

PocketGull SFI Complex Adaptive Systems & Allometric Posology (identificador `philgear/pocketgull-allometric-sfi-1b`) es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base `google/gemma-3-1b-it`. Lo publica Phillip Gear, a traves de PocketGull LLC (registro de Oregón 258869891), y esta orientado a un nicho muy concreto: razonamiento clinico basado en teoria de sistemas complejos, con enfasis en dosimetria alometrica, deteccion de ralentizacion critica (Critical Slowing Down, CSD) e interacciones farmacologicas modeladas como hipergrafos simpliciales.

El problema que aborda es la sustitucion del escalado lineal ingenuo de dosis (mg/kg) por el escalado fractal de West-Brown-Enquist (WBE, exponente M^0.75) y el modelado de cascadas no lineales en polifarmacia y estres termico ambiental. El autor declara un ajuste fino con Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos desidentificados conforme al estandar HIPAA §164.514 Safe Harbor, y lo enmarca como herramienta de soporte a la decision (CDS no dispositivo, segun la exencion FDA 520(o)).

Se trata de un modelo de 1.000 millones de parametros en su base, con un unico idioma declarado (ingles) y licencia declarada apache-2.0. Su relevancia practica es limitada por ahora: cero descargas y cero "likes" en el momento de la consulta, sin resultados de benchmarks publicados y sin validacion independiente conocida. La busqueda web asociada no ha devuelto ninguna fuente relevante sobre el modelo (los resultados obtenidos corresponden a la SUPSI y no guardan relacion con este artefacto), por lo que toda la informacion tecnica procede de la model card del autor y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre atencion y proyecciones lineales; atencion de ventana deslizante en el modelo base |
| Parametros totales | 1B en el modelo base (`google/gemma-3-1b-it`); tamano del adaptador LoRA no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Gemma 3 1B; no se especifica en la model card del adaptador |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones probadas; al ser un adaptador PEFT puede combinarse con cargas en 8 y 4 bits del modelo base, sin garantia declarada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada para el adaptador; el modelo base se rige por los terminos de uso de Gemma de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Libreria de carga | `peft` (con `transformers`) |
| Pipeline | text-generation |
| Tarea | generacion de texto condicionada a dominio clinico |
| Organizacion | PocketGull LLC, Oregón (registro 258869891) |
| DOI de procedencia | 10.5281/zenodo.20647514 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-1b-it`, un transformer decoder-only de 1.000 millones de parametros con atencion de ventana deslizante y ventana de contexto de 32.768 tokens. La variante de 1B de la familia Gemma 3 es exclusivamente de texto. El adaptador se distribuye en formato PEFT y se carga envolviendo el modelo base con `PeftModel.from_pretrained`, lo que implica que la inferencia final ejecuta la red completa de Gemma 3 1B mas las matrices de bajo rango aprendidas.

El autor declara entrenamiento mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos especificos del dominio, desidentificados conforme a HIPAA §164.514 Safe Harbor. Las etiquetas del repositorio mencionan `nih-medquad` y `who-mhgap` como posibles fuentes de datos, pero la model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, la mezcla de preferencias ni los hiperparametros (rango LoRA, alpha, dropout). Tampoco se documenta ninguna innovacion arquitectonica propia: la aportacion diferencial es el encuadre metodologico (escalado WBE M^0.75, autocorrelacion lag-1 para CSD, hipergrafos de polifarmacia) y no cambios en el modelo.

## Capacidades

- Generacion de texto en ingles con registro tecnico-clinico y farmacologico.
- Razonamiento cuantitativo guiado sobre dosimetria alometrica: el autor propone comparaciones entre escalado fractal WBE (M^0.75), escalado lineal por kg y escalado de tiempo de transito vascular (M^0.25).
- Analisis de series temporales fisiologicas descrito en los ejemplos de la model card: autocorrelacion lag-1 rodante, varianza rodante, tasa de recuperacion de resiliencia (lambda) y clasificacion de "tipping point acuity tier".
- Razonamiento sobre interacciones farmacologicas multiples y cascadas no lineales (hipergrafos simpliciales) en escenarios de polifarmacia.
- Modelado de estres fisiologico por calor extremo mediante indices ambientales (WBGT).
- Razonamiento farmacocinetico basico por rutas metabolicas, con ejemplo explicito de interaccion CYP450 entre hierba de San Juan y warfarina.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma explicita; los ejemplos sugieren cadenas de calculo, pero no se describe ningun bucle de agente.
- Multilinguismo: no. Solo ingles declarado.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponibles.

## Casos de uso

- Soporte a dosificacion pediatrica: dado un peso corporal concreto (por ejemplo, 12 kg), el modelo puede estructurar la comparacion entre el escalado lineal mg/kg y el escalado alometrico M^0.75, exponiendo las diferencias numericas para que un farmaceutico las revise. Es adecuado para este escenario porque el autor lo usa como ejemplo canonico del adaptador.
- Vigilancia de deterioro fisiologico precoz: con series de telemetria cardiaca continua, el modelo puede generar un informe estructurado con autocorrelacion lag-1, varianza rodante y tasa de recuperacion, orientado a detectar ralentizacion critica antes del colapso clinico. El contexto de 32.768 tokens permite introducir ventanas largas de telemetria serializada.
- Revision de polifarmacia en pacientes complejos: introduciendo la lista de farmacos y el entorno ambiental (por ejemplo, temperatura y WBGT), el modelo produce un analisis de riesgo por hipergrafos y un estado de cuenca de atraccion, util como borrador para revision farmaceutica.
- Revision de interacciones metabolicas: consultas como la combinacion de hierba de San Juan con warfarina permiten obtener un analisis de la via CYP450 que sirva de punto de partida documental.
- Formacion clinica y simulacion de casos: al ser un modelo de 1B y poder ejecutarse en local, es viable desplegarlo como entorno de practica para residentes sin enviar datos de pacientes a servicios externos, alineado con la politica de "zero-PHI retention" declarada por el autor.
- Procesamiento por lotes en el borde (edge): con cuantizacion de 4 bits el modelo cabe en equipos modestos, lo que permite ejecutar resumenes de notas clinicas desidentificadas en portatiles o mini-PC sin conexion.
- Generacion de borradores de documentacion clinica estructurada: el adaptador puede convertir una nota desordenada en un esquema con magnitudes, unidades y categorias de riesgo, siempre con revision humana posterior.
- Investigacion en sistemas complejos aplicados a salud: permite experimentar con la hipotesis WBE y con metricas de CSD en un modelo pequeno y reproducible, util para grupos que trabajan en el marco del Santa Fe Institute o del ASU-SFI Center for Biosocial Complex Systems.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MedQA, MedMCQA, PubMedQA ni ninguna otra metrica cuantitativa, y tampoco se aportan comparaciones con modelos clinicos de referencia. La busqueda web asociada no ha devuelto ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bfloat16 para el modelo base de 1B mas el coste del adaptador; en torno a 1,5 GB en int8; en torno a 1 GB o menos en int4. Son estimaciones derivadas del tamano de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica (RTX 3050, RTX 4060, RTX 3060, T4, L4). Para lotes grandes o contexto completo de 32.768 tokens, se recomienda al menos 8-16 GB (RTX 4070, RTX 4080, RTX 4090, A10G, L40S).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU para generacion de baja concurrencia.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial del autor, con `torch_dtype=bfloat16` y `device_map="auto"`), vLLM con soporte de adaptadores LoRA, TGI con adaptadores PEFT, y llama.cpp/Ollama tras fusionar el adaptador en el modelo base y convertir a GGUF.
- Despliegue en nube: el autor menciona explicitamente Google Cloud Vertex AI para computo privado en el borde.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.
- Estrategia de ejecucion en local: el autor recomienda `temperature=0.2` y `max_new_tokens=256` en el ejemplo de inferencia, valores coherentes con respuestas cortas y de baja variabilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque | Rendimiento publicado |
|---|---|---|---|---|---|---|
| pocketgull-allometric-sfi-1b (adaptador LoRA) | 1B base + adaptador | 32.768 tokens (heredado) | en | apache-2.0 (adaptador) | Sistemas complejos clinicos, dosimetria WBE, CSD | No disponible |
| google/gemma-3-1b-it (modelo base) | 1B | 32.768 tokens | Multilingue | Terminos de uso de Gemma | Asistente generalista de texto | Publicado por Google, no reproducible aqui |
| Llama 3.2 1B Instruct | 1B | 128.000 tokens | Multilingue | Licencia comunitaria Llama 3.2 | Asistente generalista, resumen y recuperacion | Publicado por Meta |
| Qwen2.5 1.5B Instruct | 1.500 millones | 32.768 tokens | Multilingue | apache-2.0 | Asistente generalista con buen soporte multilingue | Publicado por Alibaba |

La comparacion de rendimiento entre estos modelos y el adaptador no esta disponible: el autor no publica ninguna evaluacion y no existe una evaluacion independiente conocida. La diferencia real frente a las alternativas no es de capacidad bruta, sino de especializacion de dominio y de encuadre metodologico.

## Limitaciones y advertencias

- Ausencia total de validacion publica: cero descargas, cero "likes", sin benchmarks y sin ninguna resena o evaluacion externa en el momento de la consulta.
- Riesgo elevado de alucinacion en el dominio clinico. Un modelo de 1B parametros ajustado con DPO sobre datos no descritos puede producir formulas, dosis o interacciones plausibles pero incorrectas. Cualquier salida debe verificarse contra fuentes farmacologicas primarias.
- El marco teorico (escalado WBE M^0.75 aplicado a dosificacion, metricas de CSD como indicador de colapso clinico, hipergrafos simpliciales de polifarmacia) es una propuesta del autor, no un estandar clinico establecido ni validado prospectivamente en poblaciones de pacientes.
- Idioma unico: ingles. No hay capacidades multilingues declaradas, lo que limita su uso en entornos hispanohablantes sin traduccion previa.
- Advertencia de licencia: el adaptador declara apache-2.0, pero el modelo base `google/gemma-3-1b-it` se distribuye bajo los terminos de uso de Gemma de Google, que incluyen restricciones y una politica de uso prohibido. La licencia declarada del adaptador no exime de cumplir las condiciones del modelo base en uso comercial.
- Responsabilidad regulatoria: el autor se acoge a la exencion FDA 520(o) para software de soporte a la decision no dispositivo. Esto no equivale a autorizacion regulatoria, y el uso en diagnostico o tratamiento sin supervision de un profesional sanitario licenciado queda fuera del proposito declarado.
- Desidentificacion: la afirmacion de conformidad con HIPAA §164.514 Safe Harbor corresponde al autor y no ha sido auditada de forma independiente.
- Ausencia de datos de entrenamiento detallados: sin numero de tokens, sin composicion del dataset, sin hiperparametros de LoRA ni de DPO. Esto impide reproducir el ajuste y evaluar el riesgo de sobreajuste a un conjunto pequeno.
- Sin soporte documentado de tool calling ni de flujos de agente, lo que limita su integracion en pipelines automatizados complejos.
- Fechas de creacion y actualizacion de metadatos (2026) y version declarada (1.25.0) no verificables con fuentes independientes.
- La busqueda web realizada no ha encontrado ninguna fuente secundaria, publicacion revisada por pares ni articulo tecnico que respalde las afirmaciones de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philgear/pocketgull-allometric-sfi-1b
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Organizacion PocketGull LLC: https://pocketgull.com
- Aplicacion declarada: https://pocketgull.app
- DOI de procedencia en Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Libreria PEFT: https://huggingface.co/docs/peft
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo (los resultados devueltos corresponden a la SUPSI y no guardan relacion con el artefacto).
