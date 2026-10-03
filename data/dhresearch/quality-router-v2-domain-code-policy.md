# dhresearch/quality-router-v2-domain-code-policy

## Resumen

`dhresearch/quality-router-v2-domain-code-policy` no es un modelo de lenguaje generativo, sino un clasificador de enrutamiento entrenado con scikit-learn y serializado con joblib. Su funcion es predecir la probabilidad de exito de una ruta de inferencia condicionada por la ruta candidata: dado un conjunto de rasgos derivados del prompt, decide entre las candidatas `tool_route`, `cheap_model`, `medium_model` y `strong_model`. La clase guardada es `RouteConditionedSuccessRouter` y el artefacto se publica como politica de dominio por defecto dentro del estudio `quality_router_v2` (version 8).

El fichero publicado es un reajuste con semilla 0 realizado el 2026-10-03. Segun la model card, la ejecucion original solo escribio predicciones y no guardo los pesos, por lo que esta subida es un refit que reproduce aquellas predicciones, no una copia de un fichero de pesos original. Los datos de entrenamiento proceden de la exportacion prompt-only del piloto de 1.000 tareas del dataset `dhresearch/outcome-router-v2-main`, con particion 600/150/250.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible para quien investigue enrutamiento de coste/calidad sobre LLM. La propia model card advierte de que el flujo servido (`quality_router_v2` v8) no carga este objeto y que el modo economia del router servido esta desactivado, de modo que se trata de un artefacto de investigacion, no de un componente en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de clasificacion supervisada tabular basado en scikit-learn, clase `RouteConditionedSuccessRouter` (con LightGBM 4.7.0 disponible en el entorno de ajuste) |
| Parametros totales | no disponible (no es una red neuronal con parametros declarados; el repositorio ocupa 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo tabular; consume filas de `route_outcome_matrix`) |
| Tipos de cuantizacion | no aplica (serializacion joblib, no hay pesos en safetensors/GGUF ni cuantizacion) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | joblib (pickle); requiere que `outcome_router_data` sea importable para deserializar |

## Arquitectura y entrenamiento

El objeto es un enrutador condicionado por ruta: recibe filas de una `route_outcome_matrix` y produce, para cada ruta candidata, una prediccion de exito. Las rutas candidatas declaradas en el comando de ajuste son `tool_route`, `cheap_model`, `medium_model` y `strong_model`. Las interfaces de codigo caen por defecto en `code_specialist_repair` cuando corresponde, y este fichero actua como politica de dominio por defecto en `scripts/run_real_v2.sh`.

El ajuste se reprodujo con el comando `python3 -m outcome_router_data.scripts.train_router --dataset data/real_v2/main_router_prompt_only --router domain_code_policy --routes configs/routes.pilot_v2_real.yaml --candidate-routes tool_route cheap_model medium_model strong_model --split test`, con semilla 0. El software registrado en el momento del refit es Python 3.14.2, scikit-learn 1.9.1, NumPy 2.5.3, joblib 1.6.0, LightGBM 4.7.0 y SciPy 1.18.1. No se documentan en la informacion disponible detalles de composicion del dataset, numero de tokens, ni fases de RLHF o DPO, que no aplican a este tipo de modelo.

El dato de validacion mas relevante es el de acuerdo con el fichero congelado `data/real_v2/preds_v2_domain.jsonl`: la ruta predicha coincide en 250 de 250 filas de test compartidas, y las filas completas (incluidas probabilidades redondeadas y etiquetas) coinciden tambien en 250 de 250. Frente al fichero congelado de economia `dhresearch/quality-router-v2-economy-downrouter`, este objeto coincide en 156 de 250 rutas de test.

## Capacidades

- Prediccion de exito condicionada por ruta entre cuatro candidatas: `tool_route`, `cheap_model`, `medium_model` y `strong_model`.
- Enrutamiento de dominio para codigo, con retroceso declarado a `code_specialist_repair`.
- Inferencia sobre matrices de rasgos de prompt (`route_outcome_matrix`), expuestas mediante el metodo `predict_rows`.
- Reproducibilidad determinista: el refit con semilla 0 reproduce las 250 filas de test del fichero de predicciones congelado.
- Compatibilidad con el modulo `outcome_router_data` para deserializacion y ejecucion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente, multilingues ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Enrutamiento coste/calidad en pipelines de inferencia: el modelo estima la probabilidad de exito de cada ruta candidata y permite seleccionar `cheap_model` cuando la probabilidad es suficiente, reservando `strong_model` para los casos dudosos.
- Investigacion reproducible en enrutamiento de LLM: al reproducir 250 de 250 predicciones del fichero congelado, sirve como punto de comparacion fijo para experimentos de politicas de enrutamiento.
- Evaluacion de politicas de dominio en tareas de codigo: al ser la politica de dominio por defecto en `scripts/run_real_v2.sh`, permite medir el efecto de cambiar la politica sin tocar el resto del pipeline.
- Auditoria de decisiones de enrutamiento: las probabilidades redondeadas y etiquetas guardadas por fila permiten reconstruir por que se eligio una ruta concreta en cada tarea del piloto de 1.000 tareas.
- Reproduccion de experimentos academicos: la combinacion de semilla 0, versiones de dependencias y comando de ajuste documentados permite replicar el artefacto en otro entorno.
- Comparacion con variantes de router: el contraste con el downrouter de economia (156 de 250 rutas coincidentes) permite cuantificar cuanto diverge una politica economicamente agresiva respecto a la politica de dominio.
- Integracion en herramientas internas de seleccion de modelo: cargando el joblib desde un servicio Python con `outcome_router_data` importable, se puede exponer como endpoint de decision dentro de un gateway propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos aportados por el autor son de acuerdo entre artefactos, no de calidad absoluta del enrutamiento:

| Comparacion | Metrica | Resultado |
|---|---|---|
| `preds_v2_domain.jsonl` (ruta predicha) | coincidencia en test | 250 / 250 |
| `preds_v2_domain.jsonl` (fila completa, probabilidades redondeadas y etiquetas) | coincidencia en test | 250 / 250 |
| `dhresearch/quality-router-v2-economy-downrouter` | coincidencia de rutas en test | 156 / 250 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, y no serian aplicables a este tipo de artefacto.

## Requisitos de hardware

- Inferencia en CPU. El repositorio ocupa 0,0 GB y el objeto es un modelo tabular serializado con joblib; no requiere acelerador.
- No se necesita VRAM dedicada para el modelo en si; el consumo de memoria dependera del proceso Python que cargue `outcome_router_data` y de la matriz de entrada.
- GPU: no aplica ni es necesaria. Cualquier GPU (A100, H100, RTX 4090) queda infrautilizada para esta carga.
- Cabe en cualquier equipo de consumo, incluidos portatiles sin GPU dedicada, siempre que se pueda instalar scikit-learn, joblib, NumPy, SciPy y, si el codigo de ajuste lo requiere, LightGBM.
- Opciones de despliegue: carga directa con joblib en un proceso Python con `outcome_router_data` importable y llamada a `predict_rows`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos generativos.
- Latencia y throughput: no disponibles. Al ser un modelo tabular pequeno, se espera una latencia muy inferior a la de cualquier LLM, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada. Las referencias encontradas en la busqueda web (benchmarks de routers de OpenRouter, gateways multimodelo como OmniRoute, politicas de despliegue de Microsoft Foundry) son recursos generales sobre enrutamiento y no artefactos equivalentes publicados con especificaciones comparables.

| Modelo | Tipo | Rutas candidatas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `dhresearch/quality-router-v2-domain-code-policy` | Clasificador sklearn (joblib) | tool_route, cheap_model, medium_model, strong_model | other | HuggingFace, 0 descargas |
| `dhresearch/quality-router-v2-economy-downrouter` | Router de economia relacionado | no disponible | no disponible | HuggingFace |
| Benchmarks de routers de OpenRouter | Referencia externa de evaluacion | no aplica | no disponible | https://openrouter.ai/benchmarks/routers |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni resuelve tareas. Solo emite decisiones de enrutamiento sobre una matriz de rasgos.
- Puede contener sesgos derivados del piloto de 1.000 tareas y de la particion 600/150/250; no se documenta analisis de sesgo ni de representatividad.
- Riesgo de sobreajuste a la distribucion del piloto: el acuerdo de 250 de 250 se mide sobre el mismo conjunto de test del estudio, no sobre datos externos.
- La model card indica que el flujo servido no llama a este objeto y que `quality_router_v2` version 8 desactiva `learned_downrouting`; usarlo en produccion requeriria una validacion propia.
- La deserializacion con joblib exige que `outcome_router_data` sea importable; una incompatibilidad de versiones de scikit-learn, NumPy o SciPy puede romper la carga o alterar el comportamiento.
- El pickle de joblib es un formato con riesgo de ejecucion de codigo al cargar; conviene tratar el fichero como no confiable y verificar su procedencia.
- Licencia `other`: no se explicitan los terminos de uso comercial, por lo que no puede asumirse permiso para uso en produccion sin consultar al autor.
- No se documentan idiomas soportados, ni limites de contexto, ni comportamiento con prompts fuera de la distribucion de entrenamiento.
- El numero de descargas y de likes es cero y el repositorio ocupa 0,0 GB, lo que sugiere un artefacto de investigacion sin adopcion externa verificable.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-domain-code-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/dhresearch/outcome-router-v2-main
- Router de economia relacionado: https://huggingface.co/dhresearch/quality-router-v2-economy-downrouter
- Perfil de la organizacion: https://huggingface.co/dhresearch
- Benchmarks de routers de OpenRouter: https://openrouter.ai/benchmarks/routers
- Politicas de despliegue de modelos en Microsoft Foundry: https://learn.microsoft.com/en-us/azure/foundry/how-to/model-deployment-policy
- OmniRoute (gateway multimodelo, referencia externa): https://github.com/diegosouzapw/OmniRoute
- Articulo de blog sobre Laya AI Model (referencia externa): https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
