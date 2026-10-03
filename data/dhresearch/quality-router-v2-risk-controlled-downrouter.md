# dhresearch/quality-router-v2-risk-controlled-downrouter

## Resumen

El artefacto `dhresearch/quality-router-v2-risk-controlled-downrouter` no es un modelo de lenguaje, sino un clasificador tabular entrenado con scikit-learn y serializado con joblib que actúa como política de enrutado ("downrouter") para un sistema de selección de modelos LLM. Lo publica el usuario `dhresearch` y se enmarca en el estudio `quality_router_v2`, cuyo objetivo es decidir rutas de inferencia con garantías de coste y de tasa de fallo, en lugar de enrutar por heurísticas fijas.

Su función declarada es una política de dominio cuyo fallback por interfaz es `function_call=code_specialist_repair` y `stdin_stdout=strong_repair`, con un margen de fallo (*failure slack*) de 0.01. El efecto reportado por el artículo asociado es un incremento de coste del 0,4 % a cambio de un aumento de fallo de 0,004, es decir, un compromiso coste-fiabilidad explícito y medible.

Es relevante ahora porque el enrutado de LLM se ha convertido en infraestructura crítica de coste en producción, y este caso documenta un patrón poco habitual: se publica un *refit* con semilla 0 porque la ejecución original escribió predicciones pero no guardó los pesos. Además, la propia model card advierte de que la versión servida (`quality_router_v2` versión 8) fija `learned_downrouting` a `false` y no carga este objeto, por lo que el artefacto sirve como material de estudio y reproducción, no como componente activo del flujo servido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular de scikit-learn (clase `RouteConditionedSuccessRouter`), serializado con joblib; el entorno de refit incluye lightgbm 4.7.0 |
| Parametros totales | no disponible (artefacto joblib; tamano del repositorio reportado: 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa texto; consume caracteristicas tabulares) |
| Tipos de cuantizacion | No aplica (no se distribuyen pesos de red neuronal) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | joblib pickle (carga: `joblib` con el modulo `outcome_router_data` importable) |

## Arquitectura y entrenamiento

La model card no describe la topologia interna del clasificador mas alla de la clase `RouteConditionedSuccessRouter` y de las dependencias del entorno de refit: python 3.14.2, scikit-learn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0 y scipy 1.18.1. La presencia de LightGBM en el entorno sugiere el uso de arboles potenciados por gradiente dentro del pipeline, pero el autor no lo confirma explicitamente, por lo que no se puede afirmar como arquitectura definitiva. El artefacto es un unico fichero serializado, no un conjunto de *shards* de safetensors ni un GGUF.

El entrenamiento se realizo sobre el *dataset* `dhresearch/outcome-router-v2-main` (exportacion principal del estudio), invocando el comando de dominio con los argumentos `--fallback function_call=code_specialist_repair --fallback stdin_stdout=strong_repair --failure-slack 0.01` y semilla 0. El proposito del clasificador es estimar el exito condicionado a la ruta para decidir el *downrouting*, esto es, degradar a un modelo mas barato solo cuando la probabilidad estimada de exito lo permite dentro del margen de fallo configurado. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de artefacto.

## Capacidades

- Prediccion de ruta (*routing*) condicionada al exito estimado, con umbral de fallo controlado mediante `failure-slack 0.01`.
- Politica de *fallback* por interfaz: `function_call` se redirige a `code_specialist_repair` y `stdin_stdout` a `strong_repair`.
- *Downrouting* aprendido: decision de degradar a un modelo de menor coste cuando la estimacion de exito lo permite.
- Serializacion y carga reproducible via joblib, con dependencia de importacion del modulo `outcome_router_data`.
- Reproducibilidad verificada: coincidencia de `predicted_route` en 250 de 250 filas de test compartidas (tasa 1.000000) contra el fichero congelado `data/real_v2/preds_v2_riskctl.jsonl`, incluyendo coincidencia de fila completa con probabilidades redondeadas y etiquetas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, *tool calling* ni capacidades multilingues: es un componente de decision, no un modelo generativo.

## Casos de uso

- Enrutado de coste en produccion LLM: el clasificador decide si una consulta puede atenderse con un modelo barato o debe escalarse, aplicando el margen de fallo de 0,01 como presupuesto de error; es adecuado porque convierte una decision de coste en una restriccion medible en lugar de un umbral heuristico.
- Reparacion de llamadas a funciones: cuando la interfaz detectada es `function_call`, la politica redirige al especialista `code_specialist_repair`, lo que resulta util en pipelines de agentes donde una llamada mal formada rompe la cadena de ejecucion.
- Procesamiento de entrada/salida estandar: para la interfaz `stdin_stdout` el fallback apunta a `strong_repair`, apropiado en herramientas de linea de comandos y wrappers que necesitan garantias de formato de salida.
- Evaluacion offline de politicas de enrutado: el artefacto permite reproducir la comparacion coste-fallo (+0,4 % de coste por +0,004 de fallo) sobre el dataset `outcome-router-v2-main` antes de desplegar cualquier politica en produccion.
- Auditoria de decisiones de enrutado: al exponer probabilidades y etiquetas de ruta, se puede trazar por que una consulta se envio a un modelo caro, requisito habitual en entornos con control de gasto o cumplimiento.
- A/B testing de cascadas de modelos: sirve como brazo de control aprendido frente a politicas basadas en reglas, midiendo el impacto en coste y tasa de fallo con la misma metrica del estudio.
- Integracion en puertas de inferencia multi-proveedor: como componente de decision dentro de un router propio, permitiendo fijar presupuestos de fallo por interfaz en lugar de un unico umbral global.
- Investigacion sobre control de riesgo en *cascades*: util para comparar tecnicas de enrutado con estimador de calidad frente a enfoques sin estimador, como el propuesto en RLCascadeRouter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). El unico dato de rendimiento verificable es la metrica de acuerdo con el fichero de predicciones congelado:

| Metrica | Resultado | Referencia |
|---|---|---|
| Coincidencia de `predicted_route` | 250/250 (tasa 1.000000) | `data/real_v2/preds_v2_riskctl.jsonl` |
| Coincidencia de fila completa (probabilidades redondeadas y etiquetas) | 250/250 | `data/real_v2/preds_v2_riskctl.jsonl` |
| Claves no coincidentes | {} (ninguna) | mismo fichero |
| Efecto reportado coste/fallo | +0,4 % de coste por +0,004 de fallo | articulo del estudio (referenciado en la model card) |

No se proporcionan latencias, throughput ni comparaciones numericas con otras politicas de enrutado.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula; es un clasificador tabular serializado en joblib y se ejecuta en CPU. El tamano del repositorio se reporta como 0.0 GB.
- GPU recomendadas: ninguna especifica. No requiere acelerador para la inferencia del router; si se integra en un flujo con LLM, la GPU necesaria sera la del modelo generativo subyacente, no la de este artefacto.
- Compatibilidad con GPU de consumo: si, irrelevante en la practica, ya que la ejecucion es en CPU.
- Opciones de despliegue: carga mediante `joblib` deserializando el fichero con el modulo `outcome_router_data` importable. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles.
- Dependencias de ejecucion en el momento del refit: python 3.14.2, scikit-learn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0, scipy 1.18.1.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. La comparativa se limita a enfoques de enrutado citados en la busqueda web, y en la mayoria de los casos faltan datos verificables.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quality-router-v2-risk-controlled-downrouter | Clasificador tabular de enrutado (sklearn/joblib) | no disponible | No aplica | other | HuggingFace, 0 descargas, 0 likes |
| RLCascadeRouter (arXiv 2608.15817) | Framework de enrutado en cascada sin estimador de calidad, formulado como proceso de decision de Markov | no disponible | No aplica | no disponible | Publicacion en arXiv |
| TrustedRouter | Servicio de enrutado multi-proveedor con alternativas tipo OpenRouter | no aplica (servicio) | no disponible | no disponible | Servicio web |
| Gemini 4 Argon | Modelo generativo propietario de Google | no disponible | no disponible | propietaria | Producto comercial |

No se han encontrado modelos del mismo autor con los que comparar directamente en la informacion disponible.

## Limitaciones y advertencias

- El artefacto no esta activo en el flujo servido: `quality_router_v2` version 8 fija `learned_downrouting` a `false` y la model card indica que la tarjeta servida no carga pesos ajustados y deja este fichero sin cargar.
- No es el fichero de pesos original: la ejecucion original escribio predicciones y no guardo pesos, por lo que esta subida es un *refit* con semilla 0. Los resultados pueden no coincidir exactamente con los del estudio original mas alla de las 250 filas de test compartidas.
- Dependencia de importacion: la carga exige que el modulo `outcome_router_data` sea importable; sin el, la deserializacion joblib puede fallar.
- Riesgo de incompatibilidad de versiones: el artefacto se genero con versiones concretas (python 3.14.2, scikit-learn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0, scipy 1.18.1) y no se documenta compatibilidad hacia atras.
- Politica especifica de un dominio: los fallbacks estan fijados a `code_specialist_repair` y `strong_repair`; fuera de ese dominio, o si esos destinos no existen en el sistema destino, la politica no es utilizable tal cual.
- Margen de fallo fijo de 0,01: el compromiso coste-fallo reportado (+0,4 % de coste por +0,004 de fallo) esta calibrado para ese valor y puede no transferirse a otros presupuestos de error.
- Licencia `other`: no se detallan los terminos, por lo que no puede confirmarse que el uso comercial este permitido. Debe revisarse el texto completo de la licencia antes de cualquier despliegue en produccion.
- Idiomas soportados: no disponibles. No hay informacion sobre si las caracteristicas de entrada dependen del idioma de la consulta.
- Sesgos conocidos: no disponibles. Al entrenarse sobre un dataset de un unico estudio, es esperable un sesgo hacia la distribucion de ese dataset, pero no se aportan mediciones.
- Riesgo de alucinacion: no aplica al no ser un modelo generativo; el riesgo equivalente es una estimacion de exito erronea que derive en un *downrouting* indebido.
- Cero adopcion verificable en el momento de la consulta: 0 descargas y 0 likes, sin senales de uso en produccion por terceros.
- Fechas del repositorio: creado y actualizado el 2026-10-03, con una unica revision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-risk-controlled-downrouter
- Dataset del estudio: https://huggingface.co/datasets/dhresearch/outcome-router-v2-main
- Documentacion de DH Research: https://docs.dh-research.com/
- RLCascadeRouter, enrutado en cascada sin estimador de calidad: https://arxiv.org/abs/2608.15817
- TrustedRouter, alternativa tipo OpenRouter: https://trustedrouter.com/
- Guia sobre enrutado de modelos LLM y sus riesgos: https://www.layer3labs.io/guides/ai-model-routing-explained
- Cobertura de Gemini 4 Argon (contexto de mercado): https://www.cnbc.com/2026/09/30/google-gemini-4-argon-ai.html
