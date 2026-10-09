# fernandes-yuri/braga-v1-dataset

## Resumen

braga-v1-dataset es un conjunto de datos de ajuste conversacional publicado en HuggingFace por el usuario fernandes-yuri (Yuri Fernandes) bajo licencia Apache-2.0. No es un modelo, sino el material de entrenamiento del SLM fernandes-yuri/braga-v1, descrito por su autor como un asistente de salud preventiva y acogida en portugues de Brasil orientado a ejecucion on-device. El dataset esta etiquetado con las categorias healthcare, portuguese y alignment, y su idioma declarado es unicamente el portugues (pt).

El contenido se reparte en dos ficheros JSONL con formato de mensajes (system, user, assistant) mas dos campos de trazabilidad (trilha y origem): 10.892 ejemplos de entrenamiento y 1.210 de validacion, lo que suma 12.102 registros. Se acompana de dos artefactos auxiliares: fatos_atlas.json, con hechos extraidos directamente del codigo de una aplicacion Android (tablas SBC/SBD, criterios cardiovasculares de la OMS y 27 guias), y RELATORIO_AUDITORIA_V1.txt, una auditoria de residuos del filtrado.

Su relevancia actual es acotada pero clara: ejemplifica un flujo de trabajo de extremo a extremo para construir un modelo pequeno de dominio sanitario en un idioma distinto del ingles, con decisiones explicitas sobre delegacion a un servicio externo, rechazo con medida y protocolos de emergencia. El repositorio no incluye pesos, configuracion de entrenamiento, tokenizador ni benchmarks, por lo que debe evaluarse como recurso de datos, no como artefacto listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto de datos, no modelo) |
| Parametros totales | no disponible (conjunto de datos, no modelo) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible; los ejemplos se almacenan como listas de mensajes, sin limite de contexto declarado |
| Tipos de cuantizacion | no aplicable (no se distribuyen pesos) |
| Idiomas soportados | portugues (pt), variante pt-BR segun la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplicable; formato de datos JSONL y JSON |
| Numero de ejemplos | 10.892 entrenamiento + 1.210 validacion = 12.102 registros |
| Esquema de los registros | `{messages: [system, user, assistant], trilha, origem}` |
| Ficheros incluidos | `braga_v1_train.jsonl`, `braga_v1_val.jsonl`, `fatos_atlas.json`, `RELATORIO_AUDITORIA_V1.txt` |
| Tamaño del repositorio | 0.0 GB reportados por HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

No se publica informacion sobre la arquitectura del modelo destino (transformer denso, MoE, hibrido u otra), ni sobre el numero de tokens de entrenamiento, la composicion del corpus base, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. Lo unico documentado es la taxonomia de datos: los ejemplos se organizan en "trilhas" o pistas, que cubren conversacion filtrada, guia de la aplicacion, tablas explicadas, acogida, handoff a Groq, rechazo con medida, emergencia, "papagaio factual" (repeticion literal de hechos) y recordatorios.

Las innovaciones tecnicas destacables estan en el diseno de los datos mas que en el modelo. Aparecen dos marcadores operativos embebidos en las respuestas: `[DELEGAR_GROQ]`, que indica al sistema que debe derivar la consulta a la API de Groq en lugar de resolverla localmente, y `[ACAO_EMERGENCIA]`, que activa un protocolo de emergencia. Ademas, fatos_atlas.json vincula cada hecho del dataset con su origen en el codigo de la aplicacion Android (tablas SBC/SBD, criterios cardiovasculares de la OMS y 27 guias), lo que permite trazabilidad entre dato y fuente. El fichero RELATORIO_AUDITORIA_V1.txt documenta la auditoria de residuos del filtro aplicado, aunque su contenido no esta disponible en la informacion proporcionada.

## Capacidades

Las capacidades que se deducen de la estructura del dataset son las siguientes, siempre referidas al modelo que se entrenaria con el:

- Generacion de texto conversacional multi-turno con rol de sistema explicito.
- Atencion sanitaria preventiva de dominio acotado: tablas SBC/SBD y criterios cardiovasculares de la OMS.
- Acolhimento o acogida inicial del usuario, segun la propia nomenclatura de las pistas.
- Copia literal de hechos verificados ("papagaio factual"), orientada a reducir la paráfrasis de informacion clinica.
- Rechazo con medida: respuesta negativa acompanada de una alternativa o derivacion.
- Activacion de protocolos de emergencia mediante el marcador `[ACAO_EMERGENCIA]`.
- Delegacion explicita a un servicio externo (Groq) mediante el marcador `[DELEGAR_GROQ]`.
- Gestion de recordatorios.
- Ejecucion on-device, segun la descripcion del autor; no se detallan los requisitos ni el runtime.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision, audio o modo de razonamiento explicito: no disponible.
- Capacidades multilingues: descartadas; el dataset esta etiquetado exclusivamente como pt.

## Casos de uso

- Ajuste por instrucciones de un SLM sanitario en portugues: el dataset proporciona 10.892 ejemplos con rol de sistema y estructura de turnos, listos para fine-tuning supervisado de un modelo de 500 millones de parametros como el braga-slm-0.5b referenciado por el mismo autor.
- Triaje y acogida en aplicaciones de salud preventiva: las pistas de acolhimento permiten entrenar un primer turno de conversacion que clasifique la consulta antes de derivarla.
- Derivacion controlada a un modelo mayor: el marcador `[DELEGAR_GROQ]` sirve para entrenar la politica de escalado cuando la consulta excede la capacidad del modelo local.
- Protocolos de emergencia en aplicaciones moviles: con `[ACAO_EMERGENCIA]` se puede entrenar la deteccion de situaciones criticas y la emision de una accion estructurada en lugar de texto libre.
- Mitigacion de alucinacion en informacion clinica: la pista "papagaio factual" y el fichero fatos_atlas.json permiten construir evaluaciones de fidelidad contra hechos extraidos del codigo de la aplicacion.
- Evaluacion de alineamiento y tasas de rechazo: los 1.210 ejemplos de validacion permiten medir la proporcion de respuestas correctas, rechazos con medida y derivaciones esperadas.
- Construccion de sistemas de recordatorios sanitarios: la pista de lembretes aporta ejemplos de generacion de avisos programados.
- Investigacion sobre filtrado de datos: RELATORIO_AUDITORIA_V1.txt documenta los residuos del filtro, util como caso de estudio de control de calidad en corpus medicos en idiomas de menor recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion del SLM asociado ni del dataset, y la model card no reporta resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

- Almacenamiento para el dataset: el repositorio declara 0.0 GB, un valor que resulta inconsistente con los 12.102 registros descritos; conviene descargarlo y medirlo antes de planificar cualquier pipeline.
- VRAM para inferencia: no disponible. Este repositorio no distribuye pesos, por lo que no procede estimar VRAM para el propio artefacto.
- Modelo asociado: segun los resultados de busqueda, fernandes-yuri/braga-slm-.5b tiene 0,5 mil millones de parametros. A titulo puramente orientativo y sin datos publicados de configuracion, un modelo de ese orden de magnitud suele caber en GPUs de consumo con 8-12 GB de VRAM en cuantizaciones de 8 o 16 bits.
- GPUs recomendadas: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta el runtime on-device empleado.
- Latencia y throughput: no disponible.
- Requisitos de entrenamiento: no disponible. No se publica la configuracion de fine-tuning del SLM asociado, ni el hardware utilizado.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa. No se conocen, en la informacion proporcionada, otros datasets sanitarios en portugues con los que contrastar volumen, esquema o licencia. Lo unico comparable son los artefactos del mismo autor:

| Artefacto | Tipo | Datos disponibles |
|---|---|---|
| fernandes-yuri/braga-v1-dataset | Dataset de ajuste (este repositorio) | 12.102 ejemplos, formato JSONL con mensajes, licencia Apache-2.0, idioma pt |
| fernandes-yuri/braga-v1 | SLM, destino del dataset | No disponible en la informacion proporcionada |
| fernandes-yuri/braga-slm-.5b | SLM de 0,5B parametros | 0,5B parametros, 467 descargas segun los resultados de busqueda; sin contexto ni licencia detallados |

## Limitaciones y advertencias

- Alcance linguistico restringido: solo portugues (pt-BR). No es reutilizable directamente en castellano ni en otros idiomas sin traduccion o nuevo etiquetado.
- Dominio muy estrecho: salud preventiva, tablas SBC/SBD y criterios cardiovasculares de la OMS. Fuera de ese ambito, la utilidad de los datos es marginal.
- Tamaño reducido: 12.102 ejemplos en total limitan la generalizacion y favorecen el sobreajuste a las plantillas de las pistas.
- Riesgo clinico: cualquier modelo entrenado con estos datos puede producir informacion sanitaria incorrecta. El propio diseno del dataset asume la derivacion a un servicio externo y la activacion de protocolos de emergencia, lo que implica que el modelo local no es autonomo para decisiones criticas.
- Dependencia de un tercero: el marcador `[DELEGAR_GROQ]` ata parte del comportamiento a la API de Groq, con implicaciones de coste, disponibilidad y privacidad de datos de salud del usuario.
- Riesgo de alucinacion: no se documentan mecanismos de grounding mas alla de la pista "papagaio factual" y del fichero de hechos; no hay resultados publicados que cuantifiquen la tasa de invencion.
- Sesgos: no se publica analisis demografico ni de sesgo alguno del corpus.
- Trazabilidad incompleta: se desconoce la procedencia del corpus base de las conversaciones filtradas y si hubo consentimiento o anonimizacion de datos reales de pacientes.
- Ausencia de pesos y configuracion: no se puede reproducir el entrenamiento ni verificar las afirmaciones de la model card con los ficheros incluidos.
- Inconsistencia documental: HuggingFace reporta un tamaño de repositorio de 0.0 GB frente a los 12.102 registros descritos, lo que exige verificar la integridad de la descarga.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de uso o validacion.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero no exime del cumplimiento del RGPD ni de la normativa sanitaria aplicable al tratar datos de salud.

## Enlaces

- Dataset en HuggingFace: https://huggingface.co/fernandes-yuri/braga-v1-dataset
- Modelo asociado (SLM): https://huggingface.co/fernandes-yuri/braga-v1
- Perfil del autor: https://huggingface.co/fernandes-yuri
- Modelos del autor: https://huggingface.co/fernandes-yuri/models
- Ficha de braga-slm-.5b en free2aitools: https://free2aitools.com/model/fernandes-yuri/braga-slm-0.5b
