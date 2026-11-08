# Anticloud/surgery-bank

## Resumen

Anticloud/surgery-bank es un repositorio de pesos publicado en Hugging Face por la organizacion Anticloud, etiquetado con la vertical `surgery` y el arnes `openhands`. Por sus tags y su naturaleza (un "bank" o banco de artefactos asociado a un arnes de agentes), se trata de un artefacto orientado a flujos de trabajo agenticos en el dominio quirurgico mas que de un modelo de lenguaje generalista con ficha tecnica publica. El repositorio no expone pipeline, idiomas ni arquitectura en la informacion disponible, y su acceso esta restringido mediante gating.

La relevancia actual del artefacto radica en su encuadre: Anticloud comercializa modelos propietarios de gran tamano (su modelo PAX v52 se describe con 27.000 millones de parametros) y este repositorio parece formar parte de un ecosistema de evaluacion o despliegue verticalizado. Sin embargo, la ausencia de especificaciones tecnicas publicas, de resultados de benchmarks y de documentacion de arquitectura impide tratarlo como un modelo evaluable de forma independiente.

Esta ficha se limita, por tanto, a documentar lo que la informacion disponible permite afirmar con rigor, marcando explicitamente como "no disponible" todo aquello que no se ha publicado. Cualquier cifra de rendimiento, contexto o cuantizacion que no aparezca aqui no debe inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | anticommons-0.1.0 (acceso restringido, gated) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del artefacto: no consta si se trata de un transformer denso, un modelo de mezcla de expertos, un modelo hibrido o un conjunto de pesos derivados de otro modelo base. Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia como decodificacion especulativa o atencion lineal.

El unico dato estructural disponible es el tag `harness:openhands`, que indica que el artefacto esta pensado para ejecutarse dentro del arnes de agentes OpenHands (anteriormente OpenDevin), un entorno de ejecucion de agentes con acceso a terminal, sistema de ficheros y navegador. El tag `vertical:surgery` sugiere una especializacion o curacion de datos orientada a tareas quirurgicas, pero no se especifica si esa verticalizacion se implementa mediante fine-tuning, mediante un banco de prompts y herramientas, o mediante otro mecanismo.

## Capacidades

- No se documentan capacidades verificables del modelo en la informacion disponible.
- El tag `harness:openhands` sugiere integracion con un arnes agentico con acceso a herramientas (terminal, edicion de ficheros, navegacion), pero no se confirma que el artefacto implemente tool calling nativo.
- El tag `vertical:surgery` apunta a un uso previsto en el dominio quirurgico, sin que se detallen tareas concretas (planificacion preoperatoria, resumen de notas clinicas, recuperacion documental, etc.).
- Soporte multilingue: no disponible.
- Modo de razonamiento extendido, vision o audio: no disponible.

## Casos de uso

- Asistencia documental en planificacion quirurgica: integrado en OpenHands, el artefacto podria emplearse para recuperar y resumir protocolos y guias clinicas desde un repositorio local; la idoneidad no puede validarse sin especificaciones publicas.
- Automatizacion de tareas de investigacion clinica: extraccion estructurada de variables desde articulos y registros, siempre con supervision humana dado el caracter sensible del dominio.
- Soporte a la codificacion clinica: generacion de borradores de codigos y descripciones a partir de notas operatorias, sujeto a validacion por personal codificador.
- Entrenamiento y evaluacion de agentes: uso del banco como conjunto de referencia para medir el comportamiento de agentes OpenHands en tareas del dominio quirurgico.
- Generacion de checklists preoperatorios: produccion de listas de verificacion adaptadas al procedimiento a partir de plantillas y datos del paciente, con revision obligatoria.
- Analisis de literatura quirurgica: resumen comparativo de estudios y extraccion de metricas de resultados, con trazabilidad de fuentes.
- Prototipado de asistentes conversacionales para formacion quirurgica: escenarios simulados de preguntas y respuestas sobre tecnica y complicaciones.

En todos los casos, la ausencia de benchmarks publicos y de documentacion de sesgos obliga a tratar cualquier salida como no validada y a mantener revision humana en el circuito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo, que no se ha publicado).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el tag `harness:openhands` sugiere despliegue dentro del arnes OpenHands, que a su vez requiere un servidor de inferencia compatible con la API de OpenAI; no se especifica que motores (vLLM, llama.cpp, TGI, Ollama) esten soportados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Anticloud/surgery-bank | no disponible | no disponible | anticommons-0.1.0 | Gated | Artefacto vertical para OpenHands; sin especificaciones publicas |
| Anticloud PAX v52 | 27B (segun nota de prensa) | no disponible | propietaria | no disponible | Modelo de investigacion de la misma organizacion; datos limitados a nota de prensa |
| Alternativas open source de dominio clinico | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables verificables en la informacion proporcionada |

La comparacion con modelos de la misma categoria no puede completarse con rigor: no hay datos publicos de parametros, contexto ni rendimiento del artefacto evaluado, y la unica referencia de la organizacion (PAX v52) procede de una nota de prensa sin ficha tecnica contrastable.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas publicas: no se puede verificar arquitectura, tamano, contexto ni calidad del artefacto.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la auditoria independiente.
- Licencia anticommons-0.1.0: se trata de una licencia de tipo anticommons, orientada a restringir usos en lugar de permitirlos; es imprescindible revisar sus terminos antes de cualquier uso comercial o clinico.
- Dominio de alto riesgo: cualquier aplicacion en cirugia o atencion sanitaria exige validacion clinica, supervision profesional y cumplimiento normativo (por ejemplo, reglamento europeo de dispositivos medicos); el artefacto no declara conformidad alguna.
- Riesgo de alucinacion: no evaluado ni documentado; en dominio clinico este riesgo es critico y no puede descartarse.
- Sesgos conocidos: no documentados.
- Idiomas y cobertura terminologica: no disponibles.
- Sin benchmarks ni evaluaciones de seguridad publicadas: no hay evidencia de rendimiento ni de robustez frente a entradas adversarias.
- Fecha de creacion futura en los metadatos (2026-11-08): inconsistencia que conviene verificar antes de confiar en la trazabilidad del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anticloud/surgery-bank
- Nota de prensa sobre el benchmark de Anticloud PAX v52: https://finance.yahoo.com/technology/ai/articles/anticloud-reports-0-013-electricity-071100578.html
- Revision sistematica sobre IA en cirugia (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC11642125/
