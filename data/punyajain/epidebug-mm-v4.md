# punyajain/epidebug-mm-v4

## Resumen

EpiDebug MM v4 es un conjunto de cabezales de clasificación y ranking de muy pequeño tamano (870.150 parametros) entrenados sobre un codificador congelado `sentence-transformers/all-MiniLM-L6-v2` de 22 millones de parametros. Lo desarrolla el usuario de HuggingFace punyajain y esta orientado al analisis de fallos y a la identificacion de causas raiz en entornos multimodales de depuracion. No es un modelo generativo ni un razonador de proposito general: su funcion es puntuar hipotesis de fallo en competencia, clasificar la categoria de la causa y ordenar comprobaciones de seguimiento.

La version v4 corrige un problema detectado en la v3: el modelo apenas utilizaba la evidencia real y su ranking dependia sobre todo de la formulacion textual de las hipotesis. Para ello se reordena la entrada (titulo, evidencia y priors al final), se amplia el presupuesto de tokens de 256 a 512, se trocea la evidencia en fragmentos de frase y se anaden negativos con evidencia barajada junto con una perdida de margen y una perdida KL uniforme. El resultado es un modelo que si reacciona a la evidencia, aunque a costa de una ligera perdida de precision limpia.

Es relevante ahora como semilla de investigacion reproducible y ligera (entrenamiento en CPU) para estudiar sensibilidad a la evidencia en tareas de diagnostico, y como ejemplo de auditoria de modelos: la propia model card documenta ablaciones que demuestran el cambio de comportamiento entre v3 y v4. No esta pensado para decisiones criticas de seguridad y su calibracion de confianza no es fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezales de ranking y clasificacion sobre encoder transformer congelado (`all-MiniLM-L6-v2`) |
| Parametros totales | 870.150 (solo cabezales; el encoder MiniLM de 22M se carga del Hub) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de presupuesto por caso (la evidencia tambien se embebe como fragmentos de frase) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo no entrena el codificador: utiliza `sentence-transformers/all-MiniLM-L6-v2` congelado y sobre sus embeddings entrena cabezales ligeros que producen tres salidas: ranking de hipotesis de fallo, clasificacion de la categoria de causa y ranking de comprobaciones de seguimiento. La entrada se ordena como TITLE, EVIDENCE y PRIORS (estos ultimos acortados y al final), con un presupuesto de 512 tokens; la evidencia se embebe ademas como fragmentos de frase para evitar perdidas por truncamiento. El scorer emplea unicamente terminos de interaccion, de modo que ninguna puntuacion depende solo del texto de la hipotesis.

El entrenamiento se realizo durante 120 epocas con schedule coseno sobre 4 vistas de orden de hipotesis, seleccionando la mejor epoca sobre validacion (4). Se anadieron negativos con evidencia barajada y dos perdidas: una de margen (la hipotesis correcta debe puntuar mas alto con su propia evidencia que con la de otro caso) y una KL uniforme bajo evidencia no coincidente. Los datos son en su mayoria viñetas sinteticas y plantilladas; el autor declara que no se usaron frames prohibidos ni privados.

## Capacidades

- Ranking de hipotesis de fallo en competencia dentro de un caso de depuracion.
- Clasificacion de la categoria de causa raiz.
- Ranking de comprobaciones de seguimiento (follow-up checks).
- Sensibilidad a la evidencia: a diferencia de v3, el rendimiento cae al barajar o eliminar la evidencia y mejora cuando la hipotesis correcta se coloca primero.
- Procesamiento multimodal segun los tags del repositorio (multimodal), si bien la model card no detalla las modalidades concretas tratadas.
- Inferencia en CPU.
- No dispone de generacion de texto libre, tool calling ni modo de razonamiento extendido.

## Casos de uso

- Analisis de causa raiz en pipelines de depuracion: dado un caso con titulo, evidencia y priors, el modelo ordena hipotesis de fallo y senala la mas probable, util como primer filtro en triaje de incidencias.
- Clasificacion automatica de tickets de fallo: asigna una categoria de causa a cada incidencia para enrutarla al equipo correspondiente, aprovechando el cabezal de clasificacion de causa.
- Generacion de planes de verificacion: el ranking de follow-up checks permite proponer que comprobaciones ejecutar a continuacion en un proceso de diagnostico.
- Investigacion sobre sensibilidad a la evidencia: sus ablaciones documentadas (gold_first, evidence_x, all_x, evidence_shuffled) sirven como referencia metodologica para auditar si un modelo de diagnostico usa realmente la evidencia.
- Prototipado en entornos sin GPU: al ejecutarse en CPU y con un encoder de 22M, permite iterar rapidamente en portatiles o contenedores ligeros.
- Deteccion de fugas de datos en benchmarks: el hallazgo de que los priors y titulos cargan gran parte de la senal es directamente aplicable al diseno de nuevas revisiones del benchmark.
- Educacion y demostraciones: ejemplo compacto de entrenamiento de cabezales con perdidas de margen y KL para tareas de ranking.

## Benchmarks y rendimiento

Resultados en el split de test de v3 (337 filas, 10 familias reservadas), segun la model card:

| Metrica | v3 | v4 |
|---|---|---|
| Precision de hipotesis | 0.632 | 0.602 |
| Precision de causa | 0.496 | 0.501 |
| Macro-F1 de causa | 0.501 | 0.493 |
| Precision de follow-up | 0.362 | 0.386 |

Ablaciones de sensibilidad a la evidencia (test):

| Ablacion | Hip. acc v3 | Hip. acc v4 | Preds cambiadas v3 | Preds cambiadas v4 | Delta prob. gold v3 | Delta prob. gold v4 |
|---|---|---|---|---|---|---|
| clean | 0.632 | 0.602 | 0.000 | 0.000 | +0.000 | +0.000 |
| gold_first | 0.638 | 0.703 | 0.009 | 0.136 | -0.001 | +0.072 |
| evidence_x | 0.638 | 0.644 | 0.009 | 0.214 | -0.021 | -0.018 |
| all_x | 0.641 | 0.131 | 0.412 | 0.795 | -0.085 | -0.291 |
| zero_stats | 0.546 | 0.596 | 0.187 | 0.178 | -0.075 | -0.044 |
| evidence_shuffled | 0.591 | 0.383 | 0.270 | 0.602 | -0.085 | -0.245 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32; el encoder MiniLM de 22M y los cabezales de 870K son marginales. Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; el modelo esta disenado para CPU. Cualquier GPU (RTX 3060 o superior, A100, H100) lo ejecutaria sin cuello de botella.
- Cabe en GPU consumer: si, en todas las GPU modernas, y en CPU sin problemas.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el codificador desde el Hub; los scripts `v4.py` y `common.py` incluidos en el repositorio cubren entrenamiento, featurizacion y ablaciones. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EpiDebug MM v4 | 870.150 (cabezales) + 22M encoder | 512 tokens | Ranking de hipotesis y clasificacion de causa | CC-BY-4.0 | HuggingFace |
| EpiDebug MM v3 | no disponible | 256 tokens | Igual que v4 | no disponible | HuggingFace |
| all-MiniLM-L6-v2 | 22M | no disponible | Embeddings de frases | no disponible | HuggingFace |

No se dispone de comparativas con modelos de diagnostico de causa raiz de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- No apto para decisiones criticas de seguridad; el propio autor lo declara.
- La confianza no esta calibrada.
- Precision limpia de hipotesis ligeramente inferior a v3 (0.602 frente a 0.632), porque v4 ya no explota priors de formulacion.
- La ablacion `evidence_x` apenas degrada a v4: los priors fisicos por caso y los titulos cargan buena parte de la senal, lo que el autor identifica como fuga de datos del benchmark a corregir.
- El encoder congelado de 22M tiene capacidad de razonamiento limitada; la via de escalado propuesta es LoRA en GPU sobre un LM mayor.
- Datos mayoritariamente sinteticos y plantillados, con riesgo de baja generalizacion a casos reales.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Sin datos de cuantizacion ni de despliegue en servidores de inferencia de alto rendimiento.
- Uso comercial permitido por CC-BY-4.0 con atribucion, pero sin garantias de idoneidad para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/punyajain/epidebug-mm-v4
- Version anterior: https://huggingface.co/punyajain/epidebug-mm-v3
- Encoder base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset: https://huggingface.co/datasets/punyajain/epistemic-debugging-benchmark
