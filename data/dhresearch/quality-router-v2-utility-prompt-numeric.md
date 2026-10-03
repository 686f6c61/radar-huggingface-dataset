# dhresearch/quality-router-v2-utility-prompt-numeric

## Resumen

`dhresearch/quality-router-v2-utility-prompt-numeric` no es un modelo de lenguaje, sino un artefacto de aprendizaje automatico clasico: un conjunto de cabezas de regresion ridge que constituyen un maximizador de utilidad para enrutado de peticiones entre varios modelos LLM. Lo publica el usuario `dhresearch` como parte del estudio `quality_router_v2` (version 8), en el que `learned_downrouting` esta fijado a `false`. El fichero subido es un reajuste con semilla 0 realizado el 2026-10-03, porque la ejecucion original escribia predicciones pero no guardaba pesos.

El artefacto estima el coste esperado de cada ruta disponible (`cheap_model`, `medium_model`, `code_specialist`, `code_specialist_repair`, `strong_model`, `strong_repair`) a partir de caracteristicas numericas extraidas del prompt, sin indicador de interfaz (`use_interface=False`). El objetivo es decidir a que modelo derivar cada consulta maximizando la utilidad resultante, es decir, equilibrando calidad y coste de inferencia. Su relevancia es acotada y muy especifica: no genera texto ni razona, y la propia model card indica que la tarjeta servida no carga estos pesos.

El repositorio ocupa 0.0 GB, tiene 0 descargas y 0 likes, y se distribuye con licencia `other`. La carga se realiza con `joblib.load`, que devuelve un diccionario `fit_heads`; las cabezas constantes no incluyen entrada `model`. Todo el contenido tecnico disponible es el de la model card y el dataset asociado, por lo que buena parte de las especificaciones habituales de un LLM no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge (modelo lineal regularizado) sobre caracteristicas numericas de prompt; diccionario de cabezas por ruta |
| Parametros totales | no disponible (numero de coeficientes no publicado; depende del numero de caracteristicas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no hay contexto de tokens; entrada = vector de caracteristicas numericas del prompt) |
| Tipos de cuantizacion | no aplica (coeficientes en coma flotante serializados con joblib) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | joblib (diccionario Python `fit_heads`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un ajuste de regresion ridge por cabeza de ruta, obtenido mediante `fit_heads(..., cost_model='ridge', seed=0)` sobre filas construidas con `use_interface=False`. Cada cabeza predice el coste de una ruta; las rutas cubiertas son `cheap_model`, `medium_model`, `code_specialist`, `code_specialist_repair`, `strong_model` y `strong_repair`. La inferencia se realiza con `predicted_outcome.predict_routes`, y las cabezas constantes se representan sin entrada `model` en el diccionario.

Los datos provienen del pool medido `dhresearch/outcome-router-v2-measured-pool`, concretamente de los ficheros `pilot_tasks.jsonl`, `pilot_outcomes.jsonl` y `splits.json`. El reparto es de 602 filas de entrenamiento, 154 de validacion y 244 de test. El software declarado en el momento del reajuste es python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0 y scipy 1.18.1. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, ya que no se trata de un modelo generativo.

## Capacidades

- Prediccion de coste esperado por ruta mediante regresion ridge sobre caracteristicas numericas de prompt.
- Enrutado entre seis rutas predefinidas: `cheap_model`, `medium_model`, `code_specialist`, `code_specialist_repair`, `strong_model` y `strong_repair`.
- Soporte de cabezas constantes (sin entrada `model`) para rutas cuyo mejor predictor es un valor fijo.
- Reajuste reproducible con semilla fija (`seed=0`) sobre el mismo pool de datos.
- Verificacion de agreement mediante MAE de coste en validacion frente al informe `data/real_v2/revalidation_report.json`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: ninguna declarada (ni modo thinking, ni audio, ni vision).

## Casos de uso

- Enrutado coste-calidad en pipelines multi-modelo: el artefacto estima el coste de cada ruta a partir del prompt y permite derivar cada peticion al modelo mas barato que cumpla el umbral de calidad exigido.
- Analisis offline de politicas de enrutado: con 244 filas de test, se puede comparar la politica aprendida contra heuristicas fijas antes de desplegarla en produccion.
- Control de presupuesto de inferencia: al predecir coste por ruta, permite fijar un presupuesto por peticion o por lote y descartar rutas que lo excedan.
- Seleccion de especialista en reparacion de codigo: las rutas `code_specialist_repair` y `strong_repair` permiten decidir cuando merece la pena escalar a un modelo de reparacion en lugar de reintentar con el modelo base.
- Reentrenamiento sobre nuevos pools: el flujo `fit_heads` con `cost_model='ridge'` y semilla fija es reutilizable para recalibrar el enrutador cuando cambie la mezcla de tareas.
- Auditoria de reproducibilidad: el reajuste con semilla 0 y el cotejo del MAE de validacion contra el informe de revalidacion permiten verificar que una nueva ejecucion reproduce el comportamiento documentado.
- Investigacion sobre extraccion de caracteristicas: al excluir el indicador de interfaz (`use_interface=False`), sirve para medir cuanto rendimiento se pierde al depender solo de caracteristicas numericas del prompt.
- Integracion como componente interno de un router servido: aunque la tarjeta servida no carga estos pesos, el artefacto puede cargarse con `joblib.load` en un servicio propio de decision.

## Benchmarks y rendimiento

Unicos datos de rendimiento publicados en la informacion disponible (no son benchmarks de capacidades de LLM, sino metricas de agreement de la regresion de coste):

| Metrica | Valor | Condiciones |
|---|---|---|
| MAE de coste en validacion, cabeza ridge `strong_repair` | 0.00272177 | n = 154 |
| MAE de referencia de la media de entrenamiento, `strong_repair` | 0.00356339 | n = 154 |
| Filas de entrenamiento | 602 | reparto del pool medido |
| Filas de validacion | 154 | reparto del pool medido |
| Filas de test | 244 | reparto del pool medido |

No se han publicado resultados de benchmarks de generacion (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, y no serian aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; al tratarse de un diccionario de modelos lineales cargado con joblib, la ejecucion es viable en CPU.
- GPU recomendadas: no aplica; no se requiere GPU para evaluar `predicted_outcome.predict_routes`.
- Compatibilidad con GPU de consumo: no aplica (no necesita GPU; cualquier equipo capaz de ejecutar Python, sklearn y joblib es suficiente).
- Opciones de despliegue: carga directa con `joblib.load` en Python; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles; dependen del numero de caracteristicas del vector de entrada y del numero de cabezas evaluadas.
- Almacenamiento: el repositorio ocupa 0.0 GB segun los metadatos de HuggingFace, coherente con un artefacto de pesos lineales.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de la misma categoria con datos verificables de parametros, contexto, rendimiento o licencia. La model card menciona el estudio `quality_router_v2` version 8 y sus variantes de caracteristicas (con y sin indicador de interfaz), pero no publica comparaciones con otros enrutadores. Por tanto: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede usarse como sustituto de un LLM en ninguna tarea generativa.
- La model card indica explicitamente que la tarjeta servida no carga estos pesos; el artefacto subido es un reajuste y no el resultado de la ejecucion original, que no guardo pesos.
- Los resultados de agreement estan medidos sobre un pool concreto (`dhresearch/outcome-router-v2-measured-pool`); no hay evidencia de generalizacion a otras distribuciones de tareas, idiomas o dominios.
- El conjunto de validacion es reducido (154 filas) y el de test 244 filas, lo que limita la precision de las estimaciones de error.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingue.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de prediccion de coste erronea que derive peticiones a rutas inadecuadas, con impacto directo en coste o calidad.
- Restricciones de licencia: la licencia es `other` y no se detallan sus terminos, por lo que no puede confirmarse la viabilidad de uso comercial sin consultar al autor.
- Dependencia de versiones: el artefacto se ajusto con sklearn 1.9.1, numpy 2.5.3 y joblib 1.6.0; cargarlo con versiones distintas puede provocar incompatibilidades o avisos de deserializacion.
- Trazabilidad limitada: 0 descargas y 0 likes, sin pipeline declarado, sin idiomas declarados y sin resultados de benchmarks de capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-utility-prompt-numeric
- Dataset asociado: https://huggingface.co/datasets/dhresearch/outcome-router-v2-measured-pool
- Resultados de la busqueda web: ninguno de los enlaces devueltos (ACL Anthology sobre IA multilingue, Critical Infrastructure Studies and Digital Humanities, AVA database, The Emergence of the Digital Humanities) guarda relacion con este modelo ni con el estudio `quality_router_v2`.
