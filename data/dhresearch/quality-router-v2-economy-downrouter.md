# dhresearch/quality-router-v2-economy-downrouter

## Resumen
`dhresearch/quality-router-v2-economy-downrouter` no es un modelo de lenguaje, sino un artefacto de enrutamiento aprendido: un objeto de scikit-learn serializado con joblib (clase `RouteConditionedSuccessRouter`) que decide cuándo la ruta barata de un pipeline de inferencia va a fallar y conviene delegar en una ruta fuerte de reparación (`strong_repair`). Lo publica la organización `dhresearch` como parte del estudio `outcome-router-v2`, sobre el conjunto de datos `dhresearch/outcome-router-v2-main`.

El fichero es un refit con semilla 0 fechado el 2026-10-03. La model card aclara que la ejecución original escribió predicciones pero no guardó pesos, por lo que esta subida es una reconstrucción posterior y no el fichero de pesos que generó `data/real_v2/preds_v2_quality_economy.jsonl`. Además, la versión 8 de `quality_router_v2` fija `learned_downrouting` a `false` y la tarjeta servida no carga pesos ajustados: este objeto existe en el repositorio, pero el flujo servido no lo invoca.

Su relevancia es acotada y de carácter metodológico: sirve para reproducir y auditar decisiones de enrutamiento coste/calidad en despliegues con varias rutas candidatas, y su digest sha256 coincide exactamente con el de `dhresearch/quality-router-v2-domain-code-policy`, lo que lo convierte en un duplicado binario de la política de dominio de código. El repositorio no declara idiomas, pipeline ni métricas de benchmarks convencionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de enrutamiento serializado (clase `RouteConditionedSuccessRouter`), empaquetado con joblib; la model card cita lightgbm 4.7.0 entre el software del refit, pero no especifica el estimador base |
| Parametros totales | no disponible (no se publican número de estimadores, profundidad ni número de características) |
| Parametros activos | no aplicable (no es un modelo MoE ni una red neuronal) |
| Longitud de contexto | no aplicable (el objeto consume características tabulares precalculadas; no procesa secuencias de texto) |
| Tipos de cuantizacion | no aplicable (no hay pesos en coma flotante de red neuronal; el artefacto es un pickle de joblib) |
| Idiomas soportados | no disponibles |
| Licencia | other (la model card no detalla los términos) |
| Formato de pesos | joblib (pickle único); requiere que `outcome_router_data` sea importable al deserializar |

## Arquitectura y entrenamiento
El artefacto es un objeto `RouteConditionedSuccessRouter` obtenido tras `QualityRouter.fit`, guardado como `economy_router`. Se generó con el comando `--router quality_router --economy --strong-route strong_repair --failure-slack 0.01` usando el mismo conjunto de rutas candidatas del estudio. La etiqueta que emite el objeto usa las etiquetas propias del router; es el envoltorio (`wrapper`) el que sobrescribe `predicted_label` a `economy` cuando delega en él.

El ajuste se hizo con semilla 0 y, en el momento del refit, con python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0 y scipy 1.18.1. No se documentan en la información disponible el número de tokens, la composición del dataset de entrenamiento ni el uso de RLHF o DPO, porque no se trata de un modelo generativo: los datos provienen del export principal `dhresearch/outcome-router-v2-main`. La construcción actual de `quality_router --economy` corresponde a `_build_domain_policy`, el mismo objeto que la política de dominio de código, y su sha256 es `52962e69d26757be9eb93a4982addb8feae1afda96a58ca814b8e8158486b9ee`.

## Capacidades
- Predicción de la ruta: emite `predicted_route` y una probabilidad `prob_cheap_fails` asociada al fallo de la ruta barata.
- Decisión de desvío (downrouting): determina cuándo delegar desde una ruta económica hacia `strong_repair`, con un margen de fallo (`failure-slack`) de 0,01.
- Etiquetado interno: el objeto emplea las etiquetas propias del router; la etiqueta `economy` la escribe el envoltorio, no el modelo.
- Integración en Python: se carga con `joblib` siempre que `outcome_router_data` sea importable.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni multilingüismo: no es un modelo de lenguaje.
- No se declaran capacidades adicionales (thinking mode, decodificación especulativa, atención lineal) en la información disponible.

## Casos de uso
- Enrutamiento coste/calidad en producción: el objeto puede integrarse como clasificador previo que decida si una consulta se atiende con una ruta barata o se delega en `strong_repair`, usando `prob_cheap_fails` con un umbral derivado del `failure-slack` de 0,01.
- Auditoría y reproducción de estudios: al ser un refit con semilla 0 y software documentado, permite reproducir decisiones de enrutamiento de `outcome-router-v2` en un entorno controlado.
- Evaluación offline de políticas: comparar `predicted_route` contra el fichero congelado `data/real_v2/preds_v2_quality_economy.jsonl` para medir la tasa de coincidencia (0,624 en las 250 filas compartidas de test).
- Control de gasto en pipelines multi-modelo: como capa de decisión previa a un LLM caro, reduciendo llamadas innecesarias cuando la ruta barata se estima suficiente.
- Verificación de equivalencia entre artefactos: el sha256 idéntico al de `dhresearch/quality-router-v2-domain-code-policy` permite usar este fichero como sustituto binario en pruebas de integración de la política de dominio de código.
- Servicio HTTP ligero: envolver el objeto en un microservicio Python que reciba las características tabulares del router y devuelva `predicted_route` y `prob_cheap_fails`.
- Docencia y experimentación sobre enrutamiento: ilustra un caso real de enrutamiento aprendido con etiquetas reescritas por un envoltorio, útil para discutir discrepancias entre pesos guardados y predicciones congeladas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes, ya que no es un modelo de lenguaje). Los únicos datos cuantitativos publicados son medidas de concordancia entre artefactos:

| Evaluación | Referencia de comparación | Resultado |
|---|---|---|
| Coincidencia de rutas y de `prob_cheap_fails` redondeada | `dhresearch/quality-router-v2-domain-code-policy` (mismo sha256) | 250 de 250 filas de test |
| Coincidencia de `predicted_route` | `data/real_v2/preds_v2_quality_economy.jsonl` (congelado) | 156 de 250 filas compartidas (0,624) |
| Coincidencia de fila completa | `data/real_v2/preds_v2_quality_economy.jsonl` (congelado) | 156 de 250 filas compartidas (0,624) |

Las 94 filas restantes difieren en `predicted_route`. La model card atribuye la discrepancia a que el fichero congelado procede de la ejecución original, que no guardó pesos, mientras que esta subida es el refit con semilla 0 del comando actual.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplicable; el artefacto es un pickle de un clasificador tabular y no requiere GPU.
- GPU recomendadas: no aplicable. La inferencia se ejecuta en CPU.
- Ejecución en GPU de consumo: no aplicable, ya que no hay kernel de red neuronal que acelerar.
- Tamaño del repositorio: 0,0 GB según HuggingFace, lo que indica un artefacto de tamaño muy reducido.
- Opciones de despliegue: carga mediante `joblib` en Python, con la dependencia de que `outcome_router_data` sea importable. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dhresearch/quality-router-v2-economy-downrouter` (este) | Router aprendido serializado (joblib) | no disponible | no aplicable | 156/250 de coincidencia con el fichero congelado; 250/250 con la política de dominio de código | other | Repositorio HuggingFace, 0 descargas, 0 likes |
| `dhresearch/quality-router-v2-domain-code-policy` | Router aprendido serializado (joblib) | no disponible | no aplicable | Idéntico binariamente (mismo sha256) | other | Repositorio HuggingFace |
| `quality_router` sin `--economy` | Construcción sin pesos ajustados | no aplica (no ajusta nada) | no aplicable | no disponible | other | Incluido en `quality_router_v2` versión 8, no en esta subida |

Como referencia del mismo estudio, la model card indica que `quality_router_v2` versión 8 define `learned_downrouting` como `false` y que la tarjeta servida deja este objeto sin cargar, por lo que el artefacto no forma parte del flujo servido. No se conocen otros modelos comparables en la información disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles; la model card no documenta análisis de sesgo.
- Riesgo de alucinación: no aplicable en el sentido generativo, pero existe riesgo de clasificación errónea de la ruta cuando la ruta barata falla de forma no representada en los datos de ajuste.
- Discrepancia con el fichero congelado: solo el 62,4 por ciento de las filas compartidas coinciden con `preds_v2_quality_economy.jsonl`; no debe asumirse equivalencia con la ejecución original.
- Duplicidad binaria: el sha256 coincide con el de `dhresearch/quality-router-v2-domain-code-policy`, de modo que este artefacto no aporta una política distinta pese a su nombre orientado a modo economía.
- Estado de integración: la tarjeta servida no carga estos pesos y `learned_downrouting` está a `false`; el flujo servido no llama a este objeto, por lo que su uso requiere integración manual.
- Dependencia de importación: al deserializar con joblib es necesario que `outcome_router_data` sea importable; en caso contrario, la carga fallará.
- Etiquetado: las predicciones del objeto usan las etiquetas del router; la etiqueta `economy` la introduce el envoltorio, lo que puede inducir a error al comparar con ficheros congelados.
- Licencia: catalogada como `other` sin términos detallados, lo que impide confirmar las condiciones de uso comercial.
- Idiomas y contexto: no se declaran idiomas soportados ni procesamiento de secuencias, por lo que no debe utilizarse como modelo de lenguaje.
- Reproducibilidad: el software del refit incluye versiones muy específicas (python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0, scipy 1.18.1); otras versiones podrían alterar la deserialización o los resultados.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-economy-downrouter
- Dataset del estudio: https://huggingface.co/datasets/dhresearch/outcome-router-v2-main
- Artefacto con el mismo digest sha256: `dhresearch/quality-router-v2-domain-code-policy` (referenciado en la model card; no se ha encontrado una URL directa en la información proporcionada)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; las entradas devueltas corresponden a hilos de foros sin relación con el modelo, por lo que se descartan. No se dispone de papers, blogs, repositorios de código ni demos adicionales.
