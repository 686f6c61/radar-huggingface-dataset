# Nicho123/therapy-ft-delphi-3e20-2.5Bparams-18.6Btokens

## Resumen

`Nicho123/therapy-ft-delphi-3e20-2.5Bparams-18.6Btokens` es un modelo de lenguaje de aproximadamente 2.500 millones de parametros publicado por el usuario Nicho123 en HuggingFace. Se trata de un ajuste por preentrenamiento continuado (continued pretraining) del modelo base `marin-community/delphi-3e20-2.5Bparams-18.6Btokens` sobre transcripciones de psicoterapia procedentes del corpus licenciado Alexander Street. El modelo no se presenta como un producto conversacional, sino como un artefacto de investigacion para estudiar leyes de escala en dominio especifico.

Su proposito declarado es medir si los datos en dominio cierran la brecha de fidelidad que el computo de preentrenamiento no cierra (la diferencia denotada como `beta1 - beta0` en el repositorio de investigacion asociado). Para ello, el autor publica siete checkpoints correspondientes a siete presupuestos de tokens de ajuste: 230.000, 470.000, 940.000, 1.900.000, 3.800.000, 7.500.000 y 13.240.000 tokens, todos ellos con la misma tasa de aprendizaje (`lr3e-5`) seleccionada mediante un barrido de cuatro puntos.

Es relevante ahora porque ejemplifica una practica creciente: publicar series completas de checkpoints intermedios, en lugar de un unico modelo final, para permitir analisis de escalado reproducible. Sin embargo, el modelo carece de resultados de benchmarks publicados en la informacion disponible, tiene cero descargas y cero likes, y la model card no documenta arquitectura, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el modelo base pertenece a la comunidad Marin) |
| Parametros totales | ~2.500 millones (segun el nombre del modelo: `2.5Bparams`) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos sin cuantizar en safetensors (35,6 GB en total para los siete checkpoints) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `marin-community/delphi-3e20-2.5Bparams-18.6Btokens` |
| Tokens de preentrenamiento del base | 18.600 millones (segun el nombre del modelo) |
| Tokens de ajuste | 7 presupuestos: 230k, 470k, 940k, 1,9M, 3,8M, 7,5M y 13,24M |
| Tasa de aprendizaje | 3e-5, seleccionada con un barrido de 4 puntos (`train/select_lr.py`) |
| Enmascaramiento | speaker-masked (se enmascaran los turnos del hablante) |
| Autor | Nicho123 |
| Fecha de creacion | 2026-08-19 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo. Se sabe que deriva de `marin-community/delphi-3e20-2.5Bparams-18.6Btokens`, un modelo del ecosistema Marin, y que el sufijo `18.6Btokens` del nombre del base indica el volumen de tokens de preentrenamiento (18.600 millones). El identificador `3e20` sugiere una referencia al presupuesto de computo de preentrenamiento en FLOPs, aunque la model card no lo confirma explicitamente. No hay informacion disponible sobre si emplea atencion completa, atencion lineal, decodificacion especulativa u otras innovaciones.

El ajuste consiste en un preentrenamiento continuado sobre transcripciones de psicoterapia de Alexander Street, con enmascaramiento por hablante para que la perdida se calcule unicamente sobre los turnos del terapeuta o del paciente segun la configuracion. El corpus es dato licenciado y no se redistribuye; el repositorio incluye `therapy_finetuning/data/split.json`, que fija la particion para poder reconstruirla mediante una extraccion desde Redivis. El presupuesto completo es de 13,24 millones de tokens, con una tasa de aprendizaje de 3e-5 elegida mediante un barrido de cuatro puntos. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por preferencias.

## Capacidades

- Generacion de texto autoregresiva en el dominio de transcripciones de psicoterapia, con especial adecuacion a registros dialogados multi-turno.
- Modelado de turnos de conversacion terapeutica gracias al enmascaramiento por hablante durante el ajuste.
- Serie de checkpoints escalonados que permite analisis de curvas de aprendizaje en funcion de los tokens de ajuste (de 230.000 a 13.240.000).
- Capacidades generales heredadas del modelo base `delphi-3e20-2.5Bparams-18.6Btokens` (no documentadas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre leyes de escala en dominio especifico: los siete checkpoints permiten trazar la curva de perdida frente a tokens de ajuste y contrastarla con la curva de preentrenamiento del modelo base, que es precisamente el objetivo del repositorio asociado.
- Generacion de dialogos sinteticos de psicoterapia: el modelo puede producir turnos de terapeuta o paciente para aumentar datos de entrenamiento de clasificadores o sistemas de analisis conversacional, dado que ha visto 13,24 millones de tokens de transcripciones reales.
- Estudio de fidelidad de estilo conversacional: util para medir si un modelo pequeno (2,5 B) reproduce fenomenos propios de la interaccion terapeutica (reflejos, reformulaciones, preguntas abiertas) mejor que un modelo generico del mismo tamano.
- Simulador de rol para formacion de terapeutas: integrado en un entorno controlado por un tutor humano, puede generar respuestas de paciente verosimiles para practicar tecnicas de entrevista, siempre con supervision y sin uso clinico directo.
- Base para ajuste supervisado posterior: al ser un checkpoint de preentrenamiento continuado, sirve como punto de partida para SFT o DPO especificos de tareas concretas (clasificacion de tecnicas, extraccion de sintomas, resumen de sesion).
- Analisis automatizado de transcripciones: puntuacion de adherencia a un protocolo terapeutico o etiquetado de actos de habla, aprovechando que el modelo ha sido expuesto a turnos etiquetados por hablante.
- Extraccion de datos para estudios en psicologia clinica: generacion de resumenes estructurados de sesiones a partir de transcripciones largas, con validacion manual posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que existen evaluaciones en el repositorio de GitHub del autor, en la ruta `therapy_finetuning/snapshot/results_ft`, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K ni ninguna otra). No se deben inferir resultados a partir del nombre del modelo.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 5 GB solo para pesos, mas el coste de activaciones y cache KV; en la practica, entre 6 y 10 GB para inferencia con contextos moderados.
- VRAM estimada en int8: aproximadamente 2,5-3 GB de pesos.
- VRAM estimada en int4: aproximadamente 1,3-2 GB de pesos.
- Cabe en GPU de consumo: si. Tarjetas como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 pueden ejecutar el modelo en bf16 sin cuantizar; con cuantizacion de 4 bits seria viable incluso en GPU de 4-6 GB.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegue con lotes grandes; el modelo es lo bastante pequeno como para no requerir paralelismo de tensor en una sola GPU.
- Almacenamiento: el repositorio ocupa 35,6 GB porque contiene los siete checkpoints completos; conviene descargar unicamente la subcarpeta del presupuesto de tokens deseado mediante el parametro `subfolder`.
- Opciones de despliegue: `transformers` de forma nativa (el ejemplo de la model card usa `AutoModelForCausalLM.from_pretrained(repo, subfolder="tokens-13240000")`), y servidores de inferencia como vLLM o TGI una vez convertido el checkpoint. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el autor no publica versiones cuantizadas.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota sobre precisiones: al no publicarse variantes GGUF, AWQ o GPTQ, cualquier cuantizacion debe generarla el usuario, con el consiguiente riesgo de degradacion no medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Nicho123/therapy-ft-delphi-3e20-2.5Bparams-18.6Btokens` | ~2,5 B | no disponible | apache-2.0 | HuggingFace, 0 descargas | Continued pretraining sobre transcripciones de psicoterapia; 7 checkpoints por presupuesto de tokens |
| `marin-community/delphi-3e20-2.5Bparams-18.6Btokens` | ~2,5 B | no disponible | no disponible en la informacion proporcionada | HuggingFace | Modelo base; sin ajuste en dominio terapeutico |
| Alternativas genericas de ~2-3 B | no verificado | no verificado | no verificado | no verificado | No se proporcionan datos comparativos en la informacion disponible; no se incluyen cifras para no especular |

No se dispone de resultados de benchmarks del modelo ni de datos verificados de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- No es un modelo clinico ni un sustituto de un profesional sanitario. La model card no documenta ninguna evaluacion de seguridad, y el ajuste sobre transcripciones terapeuticas no lo habilita para ofrecer consejo psicologico.
- Riesgo elevado de alucinacion en cualquier uso fuera del dominio de transcripciones de psicoterapia: el ajuste es un continued pretraining de solo 13,24 millones de tokens, sin fase de alineacion (RLHF/DPO) documentada.
- Sesgos conocidos: no disponible. No se ha publicado ningun analisis de sesgos demograficos, culturales o linguisticos del corpus Alexander Street.
- Limitaciones de idioma: no disponible, pero el corpus de origen son transcripciones de psicoterapia en su mayoria en ingles, por lo que el rendimiento en castellano es altamente incierto.
- Limitaciones de contexto: la longitud de contexto del modelo no esta documentada, lo que impide planificar tareas con transcripciones largas sin validacion previa.
- Privacidad: el corpus contiene material licenciado de sesiones reales. Aunque los datos no se redistribuyen, existe riesgo de memorizacion de contenido sensible; se recomienda auditar las salidas antes de cualquier publicacion.
- Licencia: apache-2.0 para los pesos, pero el corpus de entrenamiento es dato licenciado de Alexander Street y no se redistribuye, lo que puede condicionar la redistribucion de derivados.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Idoneidad para produccion: baja. Se trata de un artefacto de investigacion, no de un modelo destinado a despliegues comerciales sin evaluacion previa exhaustiva.
- Aviso de trazabilidad: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenidos sin relacion (paginas sobre videojuegos), por lo que no se han incluido como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nicho123/therapy-ft-delphi-3e20-2.5Bparams-18.6Btokens
- Modelo base en HuggingFace: https://huggingface.co/marin-community/delphi-3e20-2.5Bparams-18.6Btokens
- Repositorio de codigo, particiones y resultados de evaluacion (carpeta `therapy_finetuning/`, resultados en `therapy_finetuning/snapshot/results_ft`): https://github.com/nichowang/-scaling-law
- Origen de datos (mencionado en la model card, requiere extraccion desde Redivis): no disponible como enlace directo
- Paper o publicacion asociada: no disponible
- Demo: no disponible
