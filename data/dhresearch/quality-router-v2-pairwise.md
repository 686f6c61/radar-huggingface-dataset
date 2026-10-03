# dhresearch/quality-router-v2-pairwise

## Resumen

`dhresearch/quality-router-v2-pairwise` no es un modelo generativo de lenguaje, sino un artefacto de aprendizaje automatico orientado al enrutado de peticiones hacia modelos LLM. Se trata de un ranker de utilidad por pares (clase `PairwiseUtilityRanker`) serializado con joblib y entrenado sobre el dataset `dhresearch/outcome-router-v2-main`, dentro de un estudio denominado `quality_router_v2`. Su funcion es estimar, dado un par de rutas candidatas, cual resulta preferible bajo un criterio de utilidad aprendido.

El repositorio corresponde a un reajuste (refit) con semilla 0 realizado el 3 de octubre de 2026. La model card indica explicitamente que la ejecucion original de entrenamiento escribio predicciones pero no guardo los pesos, por lo que este archivo no es el fichero de pesos original. Ademas, senala que la version 8 de `quality_router_v2` desactiva `learned_downrouting` y que la tarjeta servida no carga pesos ajustados: este objeto queda cargado pero no se invoca en el flujo servido.

Su relevancia es acotada y de caracter experimental: aporta un componente de enrutado aprendido y una verificacion de reproducibilidad sobre 250 filas de test, pero no documenta parametros, dimension de entrada ni rendimiento en tareas de generacion. Es util como pieza de un pipeline de routing LLM y para reproducir el estudio, no como modelo desplegable de forma autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ranker de utilidad por pares (clase `PairwiseUtilityRanker`); el comando de fase resuelve a LightGBM cuando el paquete importa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica: artefacto serializado con joblib) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar en la informacion proporcionada) |
| Formato de pesos | joblib (pickle de Python) |
| Clase del objeto | `PairwiseUtilityRanker` |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Libreria declarada | sklearn |
| Dataset de entrenamiento | dhresearch/outcome-router-v2-main |
| Fecha de creacion | 2026-10-03T16:42:37Z |
| Fecha de actualizacion | 2026-10-03T16:42:38Z |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El artefacto se describe como un ranker de utilidad por pares ajustado sobre la exportacion principal del estudio. El ajuste se lanzo con el comando `--router pairwise` sobre dicha exportacion, sin flags de rutas candidatas, en coincidencia con el script de shell correspondiente. La semilla utilizada fue 0. No se documentan en la informacion disponible el numero de parametros, la dimensionalidad de las caracteristicas de entrada, el numero de ejemplos de entrenamiento ni la composicion del dataset.

El entorno de software registrado en el momento del refit fue: python 2.14.2 (segun la model card; el dato se reproduce tal cual), sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0 y scipy 1.18.1. La carga del objeto requiere deserializarlo con joblib mientras los modulos `outcome_router_data` y `lightgbm` sean importables. No se mencionan tecnicas de RLHF, DPO ni innovaciones como decodificacion especulativa o atencion lineal, que no aplican al tipo de artefacto.

## Capacidades

- Enrutado de utilidad por pares: evalua pares de rutas candidatas y produce una preferencia de utilidad aprendida.
- Prediccion de ruta: genera una etiqueta `predicted_route` junto con probabilidades redondeadas y etiquetas asociadas.
- Integracion en pipelines Python: se carga mediante joblib dentro de un entorno con `outcome_router_data` y lightgbm disponibles.
- Reproducibilidad verificada: reproduce las predicciones del fichero congelado `data/real_v2/preds_v2_pairwise.jsonl` sobre las 250 filas de test compartidas.
- Componente de router jerarquico: la model card lo situa en relacion con un `downrouter` aprendido del modo "economy", que en la version 8 aparece desactivado.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio o tool calling: no disponible (el artefacto no es un modelo generativo y la informacion no documenta estas capacidades).
- Capacidades multilingues: no disponible.

## Casos de uso

- Enrutado de peticiones LLM en pasarelas multi-proveedor: el ranker puede puntuar pares de rutas candidatas y decidir cual de los dos backends conviene para una peticion concreta, reduciendo coste o latencia segun el criterio de utilidad aprendido.
- Optimizacion de costes en produccion: al comparar rutas por pares, permite derivar trafico hacia modelos mas economicos cuando la utilidad estimada es equivalente, siempre que el sistema anfitrion invoque el objeto (la model card indica que el flujo servido no lo hace).
- Investigacion en enrutado de LLM: sirve como referencia reproducible para comparar estrategias de routing, dado que el estudio incluye un fichero congelado de predicciones contra el que verificar resultados.
- Reproduccion de experimentos: con semilla 0 y el entorno de software documentado se puede repetir el ajuste y comprobar la coincidencia total de rutas predichas.
- Evaluacion comparativa de routers alternativos: puede utilizarse como linea base pairwise frente a heuristicas, clasificadores de coste o routers basados en modelos de lenguaje.
- Microservicio de scoring en CPU: al ser un artefacto tabular serializado, puede exponerse como endpoint de puntuacion sin necesidad de GPU, integrandose en un orquestador de decisiones.
- Auditoria de decisiones de enrutado: las probabilidades y etiquetas almacenadas por fila permiten trazar por que una peticion se dirigio a una ruta u otra.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son de acuerdo reproducible frente a un fichero de predicciones congelado, no de calidad del enrutado.

| Prueba | Resultado |
|---|---|
| Coincidencia de `predicted_route` en filas de test compartidas | 250 de 250 (tasa 1.000000) |
| Coincidencia de fila completa (probabilidades redondeadas y etiquetas) | 250 de 250 |
| Claves no coincidentes | {} (ninguna) |
| Semilla del refit | 0 |
| Fichero de referencia | `data/real_v2/preds_v2_pairwise.jsonl` |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un ranker de enrutado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un modelo tabular serializado y su ejecucion tipica se realiza en CPU, sin requisito de GPU documentado.
- GPU recomendadas: no aplica ni se documenta ninguna. No es un modelo de red neuronal que requiera acelerador.
- Compatibilidad con GPU de consumo: no aplica en los terminos habituales; el cuello de botella es la importacion de lightgbm y `outcome_router_data`, no la memoria de video.
- Tamano del repositorio: 0.0 GB segun HuggingFace, aunque el tamano real del artefacto joblib no se especifica y podria no estar reflejado en esa cifra.
- Opciones de despliegue: carga directa con joblib desde Python; no procede vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo con pesos en safetensors o GGUF.
- Dependencias en tiempo de carga: `outcome_router_data` y `lightgbm` importables; joblib 1.6.0 en el entorno de refit.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de parametros, contexto ni rendimiento en la informacion proporcionada para este artefacto, por lo que la comparacion cuantitativa no es posible. La tabla recoge alternativas del ambito de enrutado LLM localizadas en la busqueda web, sin atribuirles especificaciones que no figuren en dicha busqueda.

| Alternativa | Tipo | Datos disponibles | Licencia | Disponibilidad |
|---|---|---|---|---|
| dhresearch/quality-router-v2-pairwise | Ranker de utilidad por pares (sklearn/LightGBM, joblib) | Coincidencia 250/250 en test; sin parametros ni contexto documentados | other (sin detalle) | HuggingFace, 0 descargas |
| NVIDIA llm-router (NVIDIA-AI-Blueprints) | Blueprint de enrutado de peticiones LLM con soporte multimodal y estrategias de optimizacion basadas en aprendizaje | No disponible en la informacion | No disponible en la informacion | Repositorio GitHub |
| Q-Router (arXiv 2510.08789) | Framework agentico de evaluacion de calidad de video con enrutado multi-nivel y VLMs como routers | No disponible en la informacion | No disponible en la informacion | Preprint en arXiv |
| OpenRouter | Plataforma de comparacion y acceso unificado a mas de 500 LLM con precios, contexto y benchmarks | No disponible en la informacion | No disponible en la informacion | Servicio web y API |

## Limitaciones y advertencias

- La model card advierte de que la ejecucion original no guardo los pesos: este archivo es un reajuste con semilla 0 y no el fichero de pesos original.
- La version 8 de `quality_router_v2` establece `learned_downrouting` en false y la tarjeta servida no carga pesos ajustados. El propio autor indica que el flujo servido no invoca este objeto, por lo que no debe asumirse que este en produccion.
- La evidencia de validez se limita a 250 filas de test compartidas y mide coincidencia con un fichero de predicciones, no calidad real de las decisiones de enrutado.
- No se documentan sesgos, tasas de error, ni comportamiento fuera de la distribucion del dataset `outcome-router-v2-main`.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo equivalente es una recomendacion de ruta incorrecta o no calibrada, no cuantificada en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles; no se especifica ninguna ventana de contexto ni cobertura linguistica.
- Licencia: marcada como "other" sin texto de licencia en la informacion proporcionada. No puede confirmarse la permisividad para uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- Reproducibilidad fragil: el unpickle requiere versiones concretas de librerias y la presencia del modulo `outcome_router_data`; cambios de version de sklearn, lightgbm, numpy o scipy pueden alterar o impedir la carga.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion por terceros.
- Ausencia de pipeline declarado y de idiomas documentados en HuggingFace, lo que dificulta la evaluacion previa a la integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-pairwise
- Dataset de entrenamiento: https://huggingface.co/datasets/dhresearch/outcome-router-v2-main
- NVIDIA AI Blueprints, llm-router: https://github.com/NVIDIA-AI-Blueprints/llm-router
- Q-Router, Agentic Video Quality Assessment with Expert Model Routing: https://arxiv.org/pdf/2510.08789v2
- Q-Router en alphaXiv: https://www.alphaxiv.org/abs/2510.08789
- OpenRouter, comparacion de modelos: https://openrouter.ai/models
- OpenRouter, rankings de uso: https://openrouter.ai/rankings
