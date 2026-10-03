# dhresearch/quality-router-v2-selective-fallback

## Resumen

`dhresearch/quality-router-v2-selective-fallback` no es un modelo generativo, sino un clasificador binario auxiliar publicado en HuggingFace dentro de la biblioteca `sklearn`. Su funcion es predecir si una estrategia concreta de enrutamiento de LLM —denominada `qwen_then_strong_repair`, es decir, intentar resolver una tarea con Qwen y recurrir a un modelo mayor para reparar el resultado— va a fallar sobre un prompt dado. El autor lo describe explicitamente como un modelo de fallo con "fallback selectivo", pensado para decidir cuando merece la pena escalar a un modelo mas caro.

Se trata de un refit con semilla 0 realizado el 3 de octubre de 2026. El entrenamiento original escribio predicciones pero no guardo los pesos, por lo que esta subida es una reproduccion de aquel ajuste. El autor indica ademas que la version 8 del sistema `quality_router_v2` desactiva `learned_downrouting` y que la tarjeta servida en produccion no carga estos pesos: el artefacto existe como evidencia de un estudio, no como componente activo del router en servicio.

Su relevancia es metodologica mas que de rendimiento: documenta con detalle la reproducibilidad de un ajuste (semilla, versiones exactas de software, tamaño de los splits y coincidencia entre el AUC de validacion del refit y el de la redibujado almacenado) y hace publico un resultado deliberadamente modesto. El AUC de validacion es 0,52657 frente a 0,5 de un clasificador aleatorio, lo que limita mucho su utilidad practica como filtro autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica L2 calibrada (`CalibratedClassifierCV`, metodo sigmoid, cv=3) sobre caracteristicas TF-IDF y one-hot |
| Parametros totales | No disponible como cifra publicada; regresion logistica con TF-IDF de `max_features=4000` (n-gramas de palabras 1-2, `min_df=2`), one-hot de fuente y una caracteristica `log1p(prompt characters)` |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo generativo y no define ventana de contexto. La entrada es un prompt vectorizado a nivel de documento |
| Tipos de cuantizacion | No disponible; no aplica a un artefacto de scikit-learn |
| Idiomas soportados | No disponible |
| Licencia | other (categoria generica de HuggingFace; no se detallan terminos concretos) |
| Formato de pesos | `joblib` (diccionario serializado con las claves `model`, `vectorizer`, `sources` y `base_rate`) |

## Arquitectura y entrenamiento

El modelo es una regresion logistica con regularizacion L2, ajustada con `LogisticRegression(max_iter=3000, C=1.0, class_weight='balanced', random_state=0)` y envuelta en `CalibratedClassifierCV(method='sigmoid', cv=3)` para convertir las puntuaciones en probabilidades calibradas. La representacion de entrada combina tres bloques: un vectorizador TF-IDF de n-gramas de palabras de orden 1 y 2 con `max_features=4000` y `min_df=2`; un one-hot de la fuente del prompt ajustado sobre el vocabulario de entrenamiento; y el logaritmo de `1 +` el numero de caracteres del prompt. La etiqueta objetivo es el fallo de la ruta `qwen_then_strong_repair`, segun la funcion `selective_fallback.fit_risk`.

Los datos proceden del dataset `dhresearch/outcome-router-v2-measured-pool`, concretamente de los ficheros `stdout_tasks.jsonl`, `qwen_cross_outcomes.jsonl` y `splits.json`, restringiendose a las filas de la etiqueta correspondientes al slice `stdin_stdout`. La poblacion se reparte en 451 ejemplos de entrenamiento, 110 de validacion y 198 de prueba. El autor documenta las versiones exactas del entorno en el momento del refit (python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0, scipy 1.18.1) y verifica que el ajuste reproducible con semilla 0 arroja un AUC de validacion de 0,52657, identico al de la redibujado almacenada en `data/real_v2/revalidation_report.json` (coincidencia: verdadero). El AUC historico sin semilla fijada, 0,425, corresponde a un ajuste distinto y se mantiene como la cifra historica publicada.

No se menciona uso de RLHF, DPO ni ninguna tecnica de ajuste adicional: el entrenamiento se limita al ajuste supervisado descrito. Tampoco se documentan innovaciones tecnicas mas alla de la calibracion sigmoide y de la combinacion de caracteristicas lexicas con metadatos de origen.

## Capacidades

- Clasificacion binaria de riesgo de fallo: estima la probabilidad de que la ruta `qwen_then_strong_repair` no resuelva correctamente una tarea.
- Enrutamiento selectivo como apoyo a la decision: la salida permite decidir si escalar a un modelo mayor o aceptar la respuesta del modelo inicial, dentro de una politica de fallback.
- Uso de metadatos de origen: incorpora la fuente del prompt como variable one-hot, de modo que puede aprender sesgos por procedencia de la tarea.
- Sensibilidad a la longitud del prompt: incluye `log1p(prompt characters)` como caracteristica explicita.
- Serializacion y recarga sencillas: `joblib.load` devuelve el diccionario con modelo, vectorizador, fuentes y tasa base, y la puntuacion se obtiene con `selective_fallback.score_risk`.
- No genera texto, no razona, no ejecuta codigo, no soporta tool calling ni function calling.
- No soporta agentes, multi-step reasoning ni capacidades multimodales o de audio.
- Soporte multilingue: no disponible; la unica evidencia es un vectorizador TF-IDF de palabras sin indicacion de idioma.

## Casos de uso

- Filtro previo en un pipeline de escalado de modelos: dado un prompt, usar la probabilidad de fallo para decidir si se envia a un modelo pequeno o directamente a uno grande, reduciendo coste cuando la confianza en la ruta barata es alta. Es el escenario para el que fue disenado, aunque su AUC de 0,52657 limita el ahorro real obtenido.
- Analisis retrospectivo de fallos: al estar calibrado, permite agrupar predicciones por tramos de probabilidad y estudiar que tipos de prompt concentran los fallos de la ruta `qwen_then_strong_repair`.
- Auditoria de decisiones de enrutamiento: registrar la puntuacion junto a la decision tomada y compararla con el resultado final para medir la utilidad marginal del router en produccion.
- Reproduccion de experimentos: sirve como referencia verificable de un ajuste con semilla fijada, util para equipos que quieran replicar el estudio o comprobar la estabilidad del pipeline ante cambios de version de scikit-learn.
- Segmentacion por fuente: el one-hot de fuente permite comparar tasas de fallo esperadas entre origenes de tarea y priorizar mejoras en las fuentes con peor comportamiento.
- Docencia y evaluacion de metodologia: es un ejemplo util para ilustrar por que un modelo con AUC cercano a 0,5 no debe desplegarse como clasificador autonomo y como documentar un refit de forma trazable.
- Prototipado de routers en CPU: al ser un artefacto pequeno de scikit-learn, permite montar un servicio de puntuacion sin GPU mientras se evalua si merece la pena invertir en un router mas sofisticado.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Notas |
|---|---|---|---|
| AUC de validacion (refit semilla 0) | 0,52657 | Validacion (110 ejemplos) | Coincide con la redibujado almacenada |
| AUC de validacion (redibujado en `revalidation_report.json`) | 0,52657 | Validacion | Coincidencia confirmada por el autor (`Match: True`) |
| AUC historico sin semilla fijada | 0,425 | No especificado | Ajuste distinto; se mantiene como cifra historica publicada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el artefacto es un modelo lineal sobre caracteristicas dispersas, por lo que la puntuacion se ejecuta sin GPU.
- VRAM estimada: no aplica; no requiere acelerador grafico.
- GPU recomendadas: no aplica. Ninguna GPU es necesaria ni aporta ventaja relevante.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: carga directa con `joblib` dentro de un proceso Python; integrable en cualquier servicio (FastAPI, Flask, funciones serverless) que ya use scikit-learn. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles. Al tratarse de una regresion logistica sobre un vector TF-IDF de hasta 4000 dimensiones, cabria esperar latencias del orden de microsegundos a pocos milisegundos por peticion en CPU, pero esta cifra no esta publicada por el autor.
- Dependencia critica de entorno: la carga con `joblib` exige que la version de scikit-learn coincida con la del refit (1.9.1); en caso contrario, la deserializacion puede fallar o comportarse de forma distinta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dhresearch/quality-router-v2-selective-fallback` | Clasificador logistico calibrado (sklearn) | No disponible (TF-IDF de 4000 caracteristicas) | No aplica | AUC de validacion 0,52657 | other | HuggingFace, 0 descargas |
| `dhresearch/quality_router_v2` (version 8) | Router servido del mismo estudio | No disponible | No aplica | No disponible | other | Referenciado en la model card; no se detalla su repositorio |
| Alternativas de enrutamiento de LLM (RouteLLM, routers basados en embeddings o en modelos de recompensa) | Varios | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria. La model card solo menciona el sistema matriz `quality_router_v2`, del que este fichero es un ajuste no cargado en produccion.

## Limitaciones y advertencias

- Rendimiento cercano al azar: el AUC de validacion de 0,52657 esta apenas por encima de 0,5, por lo que la capacidad discriminativa del modelo es marginal y no deberia sostener decisiones automatizadas sin supervision humana.
- Divergencia entre ajustes: el AUC historico sin semilla fijada es 0,425, muy inferior al del refit (0,52657). Esto indica una alta sensibilidad al procedimiento de ajuste y complica la comparacion entre resultados.
- No esta activo en produccion: la version 8 de `quality_router_v2` fija `learned_downrouting` en falso y la tarjeta servida no carga estos pesos. El artefacto debe tratarse como material de estudio, no como componente desplegado.
- Muestras pequenas: los splits de 451/110/198 ejemplos implican intervalos de confianza amplios en las metricas, especialmente en validacion.
- Riesgo de sobreajuste al vocabulario: el TF-IDF se ajusta sobre el vocabulario de entrenamiento y el one-hot de fuentes tambien, lo que reduce la generalizacion a fuentes o dominios no vistos.
- Sesgos conocidos: no documentados por el autor. El uso de `class_weight='balanced'` sugiere desbalance de clases en los datos, pero no se detalla su magnitud.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de calibracion erronea, es decir, de asignar probabilidades que no reflejen la tasa real de fallo en dominios distintos al de entrenamiento.
- Limitaciones de idioma y contexto: no disponibles. No hay indicacion del idioma de los datos ni de como se comporta con prompts fuera de la distribucion de entrenamiento.
- Dependencia fuerte de versiones: el autor exige que scikit-learn coincida con la version del refit. Cualquier actualizacion del entorno puede invalidar la carga o alterar las puntuaciones.
- Restricciones de licencia: la licencia figura como `other`, sin terminos explicitos en la model card. Antes de cualquier uso comercial debe aclararse con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-selective-fallback
- Dataset asociado: https://huggingface.co/datasets/dhresearch/outcome-router-v2-measured-pool
- No se han encontrado enlaces relevantes en la busqueda web. Los resultados devueltos por el buscador no guardan ninguna relacion con este modelo ni con enrutamiento de LLM, por lo que se omiten.
