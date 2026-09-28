# j955229/Swift-Bonsai-2-Uncensor-PQ2_0

## Resumen

Swift-Bonsai-2-Uncensor-PQ2_0 es un repositorio de pesos publicado por el usuario j955229 en HuggingFace, consistente en una cuantizacion adicional (etiquetada PQ2_0) sobre el modelo ukisai/Swift-Bonsai-2-GGUF, que a su vez deriva de la familia Bonsai 2 de PrismML, un build ternario de Qwen3.8 27B. No se trata por tanto de un modelo entrenado desde cero, sino de un reempaquetado de pesos orientado a reducir el espacio ocupado en disco y en memoria.

La model card del autor es extremadamente breve y esta escrita en chino: declara uso personal, ausencia de pruebas ("自用，沒有測試") y ausencia de garantia de viabilidad ("不保證可行性"). Menciona ademas que la version denominada "ninifer" ya incluye MTP y vision, lo que sugiere que esta build concreta podria no incorporar esas capacidades o que el autor las considera cubiertas por otra variante.

El interes del repositorio es limitado pero identificable: forma parte del ecosistema de builds "uncensored" de Bonsai 2 27B que circulan en HuggingFace (existe incluso un espacio comparativo, "Bonsai 2 Uncensored Shootout", que evalua once builds de seis uploaders distintos). Para quien necesite una version de muy baja precision de un modelo de ~27B con atencion hibrida y pesos ternarios, este repositorio es una pieza mas de ese ecosistema, con el caveat de que no aporta documentacion tecnica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada en este repositorio. El linaje (Bonsai 2 27B sobre Qwen3.8 27B) corresponde a un transformer causal con atencion hibrida |
| Parametros totales | No disponible en el repositorio. El linaje Bonsai 2 27B indica del orden de 27.000 millones |
| Parametros activos | No aplica: no se describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | PQ2_0 (nomenclatura del autor; no se documenta el numero de bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base es un repositorio GGUF; el repo no lista los ficheros) |
| Modelo base | ukisai/Swift-Bonsai-2-GGUF |
| Repositorio upstream del linaje | PrismML Bonsai 2 27B (ternario, multimodal) |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion de entrenamiento propia de este repositorio. La model card no documenta dataset, numero de tokens, fases de ajuste (SFT, RLHF o DPO) ni procedimiento de cuantizacion. Por el linaje declarado (base_model: ukisai/Swift-Bonsai-2-GGUF) y por la documentacion publica de PrismML, la familia Bonsai 2 27B se construye sobre Qwen3.8 27B, un modelo causal con atencion hibrida, y se caracteriza por pesos matriciales ternarios con valores en {-1, 0, +1} en una base rotada fija, acompanados de escalas de grupo en FP16. El entrenamiento del linaje upstream incluye QAT (quantization-aware training) segun la documentacion de Continuum-AI-Corp.

La innovacion tecnica del linaje es precisamente esa representacion ternaria empaquetada, que permite almacenar un modelo de ~27B en un espacio muy reducido y ejecutarlo en hardware de gama de consumo, con el coste de calidad asociado a precisiones tan bajas. La variante aqui publicada anade una capa de cuantizacion adicional (PQ2_0) sobre pesos ya ternarios y ya empaquetados, sin que el autor documente el esquema exacto, la herramienta utilizada ni las metricas de degradacion resultantes. La mencion a MTP (multi-token prediction) y a vision en la nota de la model card indica que el linaje upstream contempla prediccion multi-token y entrada de imagen, pero no queda claro si esta build los conserva.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del linaje Qwen3.8 27B, sin verificacion publicada para esta build concreta.
- Razonamiento multi-paso y modo "thinking": el espacio comparativo de Bonsai 2 Uncensored Shootout evalua explicitamente el "thinking mode" entre las builds de la familia, pero no hay resultados publicados para este repositorio.
- Vision: la documentacion de PrismML describe Ternary Bonsai 2 27B como el modelo multimodal de la familia, con entrada de imagen ademas de texto. El autor afirma que la version "ninifer" incluye vision, lo que deja en duda que esta build PQ2_0 la mantenga.
- Prediccion multi-token (MTP): citada por el autor como presente en la version "ninifer", no confirmada aqui.
- Capacidad multilingue: no documentada.
- Tool calling / function calling: no documentado.
- Soporte de agentes: no documentado.
- Ajuste "uncensored": el linaje del que forma parte esta orientado a reducir rechazos; no se especifica la tecnica de ablacion aplicada.

## Casos de uso

- Despliegue en hardware de gama de consumo para prototipado: una cuantizacion de muy baja precision sobre un modelo de ~27B permite probar capacidades de razonamiento y generacion en un equipo sin GPU de datacenter, a costa de calidad frente al modelo en FP16.
- Generacion de texto en local con requisitos de privacidad: al ejecutarse integramente en la maquina del usuario, es adecuado para escenarios donde los datos no pueden salir del entorno (borradores internos, analisis de documentos sensibles).
- Experimentacion con cuantizacion extrema: sirve como caso de estudio para comparar la degradacion de un modelo ternario cuando se le aplica una capa adicional de empaquetado (PQ2_0 frente a otras builds de la misma familia).
- Investigacion sobre alineacion y rechazos: al tratarse de una variante del linaje "uncensored", es util en estudios academicos sobre comportamiento de rechazo, sesgo y direcciones de negativa en modelos abiertos, siempre en entornos controlados.
- Base para pipelines de evaluacion comparativa: encaja como uno de los candidatos en arneses que midan MMLU o HumanEval sobre distintas builds de Bonsai 2 27B, como el shootout publico existente.
- Clasificacion y resumen de documentos largos en local: si el contexto heredado del linaje es amplio, permite tareas de resumen por lotes en equipos sin conexion, aunque este dato no esta confirmado para esta build.
- Demo educativa de modelos ternarios: util para ilustrar en clase como se representan pesos en {-1, 0, +1} y que implicaciones tiene sobre memoria y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica y el autor declara explicitamente que no ha realizado pruebas. Existe un espacio publico comparativo ("Bonsai 2 Uncensored Shootout") que evalua once builds de Bonsai 2 27B con MMLU y HumanEval, pero no se proporcionan cifras para esta build concreta en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia aritmetica, un modelo denso de ~27.000 millones de parametros a ~2 bits por peso ocuparia del orden de 7 GB solo en pesos, mas overhead de contexto y buffers de atencion; la cifra real depende del esquema PQ2_0, que no esta documentado. Tratar cualquier numero como estimacion, no como dato verificado.
- GPU recomendadas: no disponibles. Por tamano, el linaje apunta a GPU de consumo con 12-16 GB o superiores, y a GPU profesionales (A100, H100) si se busca throughput alto o precision mayor.
- Compatibilidad con GPU de consumo: plausible por tamano, no verificada. No hay informacion sobre que modelos de tarjeta se han probado.
- Opciones de despliegue: no documentadas en el repositorio. Al ser pesos GGUF, las rutas habituales serian llama.cpp y Ollama; en el ecosistema Bonsai aparecen ademas runtimes nativos especificos, como un host en Swift sobre Core AI para Apple Silicon (repositorio bonsai-swift) y el runtime de Continuum-AI-Corp con instrumentacion de refusal-direction.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Bonsai-2-Uncensor-PQ2_0 (j955229) | ~27B segun linaje, no confirmado | PQ2_0 | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF (OS-Software) | 27B (declarado en el nombre) | ternaria, GGUF | no disponible | no disponible | HuggingFace |
| OrcaBonsai-27B-Uncensored (Continuum-AI-Corp) | 27B (declarado en el nombre) | ternaria empaquetada | no disponible | no disponible | GitHub |
| Ternary Bonsai 2 27B (PrismML, upstream) | 27B (declarado) | ternaria {-1, 0, +1} con escalas FP16 | no disponible | no disponible | Documentacion oficial |

Las cuatro entradas comparten el mismo linaje de pesos (Qwen3.8 27B con representacion ternaria) y se diferencian en la capa de cuantizacion, en los ajustes de conducta y en las herramientas de ejecucion que las acompanan. No hay datos de rendimiento publicados para esta build que permitan ordenarlas por calidad.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es de uso personal y que no ha sido probado ("自用，沒有測試"), y que no garantiza su viabilidad. No debe asumirse que los pesos cargan o generan texto coherente.
- Ausencia total de documentacion tecnica: no se especifica esquema de cuantizacion, herramienta de conversion, parametros de contexto ni receta de ajuste.
- Doble cuantizacion sobre pesos ya ternarios: aplicar un empaquetado adicional a una representacion de muy baja precision tiende a degradar la coherencia y la fidelidad de la salida. No hay metricas que cuantifiquen esa perdida.
- Riesgo de alucinacion elevado por el nivel de compresion; los modelos muy cuantizados son mas propensos a inventar hechos, especialmente en tareas de conocimiento factual.
- Linaje "uncensored": la reduccion deliberada de rechazos implica mayor probabilidad de generar contenido danino, sesgado o inapropiado. No es apto para aplicaciones de cara al publico sin filtros adicionales.
- Licencia apache-2.0 declarada por el autor de la build, pero conviene verificar las condiciones de los pesos upstream (PrismML y el modelo base de Qwen) antes de un uso comercial, ya que el repositorio no reproduce los terminos heredados.
- Idiomas soportados no documentados: se desconoce si el castellano esta cubierto con calidad suficiente.
- Contexto maximo no documentado: planificar cualquier caso de uso con documentos largos exige verificacion empirica previa.
- Sobre vision y MTP: la nota del autor sugiere que estas capacidades pertenecen a otra variante, por lo que no deben darse por presentes.
- Metricas de adopcion nulas (0 descargas, 0 likes) y modelo sin pipeline declarado: no hay evidencia de comunidad que lo haya validado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/j955229/Swift-Bonsai-2-Uncensor-PQ2_0
- Modelo base declarado: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Documentacion oficial de Ternary Bonsai 2 27B (PrismML): https://docs.prismml.com/bonsai-2-27b
- Runtime con instrumentacion de refusal-direction (Continuum-AI-Corp): https://github.com/Continuum-AI-Corp/OrcaBonsai-27B-Uncensored
- Build alternativa Heretic GGUF (OS-Software): https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Espacio comparativo de builds Bonsai 2 uncensored: https://huggingface.co/spaces/BoldingBuilds/bonsai-2-uncensored-shootout
- Host nativo en Swift sobre Core AI para Apple Silicon: https://github.com/RahulRachuri/bonsai-swift
