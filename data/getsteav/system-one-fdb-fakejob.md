# getSTEAV/system-one-fdb-fakejob

## Resumen

System One fraud detector for FDB fakejob es un clasificador binario apilado que determina si una oferta de empleo es fraudulenta (una publicación falsa en lugar de una vacante real). Lo desarrolla STEAV (steav.io) con CID Model Studio y se publica bajo licencia Apache-2.0 como modelo de referencia para el Fraud Dataset Benchmark (FDB) de Amazon Science. La arquitectura combina dos etapas: un modelo de árboles con boosting entrenado sobre features de ingeniería y, encima, System One, un modelo de decisión tipada construido sobre el encoder ModernBERT-large de Laya con un adaptador LoRA y una cabeza de decisión.

El modelo base es convaiinnovations/laya (revisión 7b928d828b7b, Apache-2.0), un encoder ModernBERT-large de unos 395 millones de parámetros. Sobre él se entrenan un adaptador LoRA de rango 16 y alpha 32 (4,39 millones de parámetros, aplicado a las proyecciones Wqkv y Wo de atención y a la proyección Wo del MLP en las 28 capas) y una cabeza de decisión de 26,2 millones de parámetros. El conjunto ronda los 425,6 millones de parámetros. System One recibe como evidencia en JSON la puntuación del árbol y campos de ingeniería legibles junto con el texto original truncado a los primeros 700 caracteres, y devuelve una probabilidad calibrada.

Su relevancia es doble: por un lado, reporta 0,9985 de AUROC y un 97,3% de recall a un 1% de falsos positivos en el split de test oficial de FDB (3.576 ofertas, 187 fraudulentas), frente al mejor AUROC publicado de 0,998 y el mejor recall publicado del 92,5% (AutoGluon); por otro, sirve como implementación de referencia para apilar un modelo de decisión tipada sobre la salida de un modelo de árboles. El autor lo describe explícitamente como modelo de benchmark, no como sistema de fraude listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador binario apilado: gradient-boosted trees seguido de System One (encoder ModernBERT-large de Laya con cabeza de decisión tipada) mediante offset stacking |
| Parametros totales | Aproximadamente 425,6M: 395M del base Laya (ModernBERT-large) + 4,39M del adaptador LoRA + 26,2M de la cabeza de decisión |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explícita; el texto largo de cada oferta se trunca a sus primeros 700 caracteres antes de pasarlo como evidencia JSON |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors (adaptador LoRA y cabeza de decisión) y no documenta versiones GGUF, GPTQ, AWQ ni similares |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 para pesos y código; algunos ficheros de datos tienen sus propios términos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema es un stack de dos etapas con offset stacking. La primera etapa es un modelo de árboles con gradient boosting que puntúa cada oferta a partir de features de ingeniería. La segunda, System One, no parte de cero: recibe la log-odds del árbol y aprende una corrección sobre ella, además de leer un conjunto de campos de ingeniería legibles y los campos originales de la oferta (texto largo truncado a 700 caracteres) presentados como evidencia JSON. La pregunta que responde el modelo es binaria: "¿esta oferta de empleo es fraudulenta, es decir, una publicación falsa en lugar de una vacante real?", y la salida es P(sí).

System One se construye sobre convaiinnovations/laya, un encoder ModernBERT-large de unos 395 millones de parámetros con la cabeza de decisión tipada de Laya. Los pesos base se descargan del Hub en la revisión fijada 7b928d828b7b y se verifican contra su sha256; no se redistribuyen en este repositorio. Los parámetros entrenados son el adaptador LoRA (rango 16, alpha 32, sobre las proyecciones Wqkv y Wo de atención y Wo del MLP de las 28 capas, 4,39 millones de parámetros) y la cabeza de decisión (26,2 millones de parámetros, inicializada desde la cabeza de Laya, cuyo sub-head de acción de 0,26 millones de parámetros permanece congelado).

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. Sí indica que todos los modelos se entrenaron y calibraron sin datos de test, que cada conjunto de test se puntuó una sola vez por candidato y que, una vez conocidos los resultados, se publicó un modelo por benchmark: System One en todos los conjuntos, por ofrecer una interfaz de decisión uniforme y calibrada. Para el conjunto de ofertas de empleo, además, resultó el candidato más fuerte en las dos métricas principales.

## Capacidades

- Clasificación binaria tabular: devuelve una probabilidad calibrada de que una oferta de empleo sea fraudulenta (P(sí) sobre la pregunta definida).
- Razonamiento sobre evidencia estructurada: consume la salida de un modelo de árboles y campos de ingeniería como evidencia JSON, no solo texto en bruto.
- Salida explicable a nivel de interfaz: el método `states(rows)` devuelve la evidencia JSON exacta que lee System One junto con las salidas del modelo de árboles.
- Modo alternativo de solo árbol: `output="tree"` devuelve únicamente la probabilidad del modelo de gradient boosting.
- Capacidad de fine-tuning: al ser un adaptador LoRA más una cabeza de decisión sobre un encoder congelado, está pensado como punto de partida para ajuste en datos propios.
- Procesamiento de texto largo con truncado: las ofertas largas se recortan a 700 caracteres como evidencia textual.
- Ejecución en GPU y CPU: el pipeline funciona en GPU con bfloat16 y en CPU con float32.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido: es un clasificador específico de una única tarea.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Referencia de benchmark sobre FDB: permite reproducir y comparar resultados frente a los líderes publicados (0,998 AUROC de AutoGluon, 92,5% de recall a 1% FPR) usando el split oficial de 3.576 ofertas de test, y sirve como línea base citable en investigación sobre detección de fraude.
- Implementación de referencia de stacking: demuestra cómo apilar un modelo de decisión tipada sobre las log-odds de un modelo de árboles mediante offset stacking, con código funcional en `system_one_fraud` y un ejemplo de inicio rápido.
- Punto de partida para fine-tuning propio: el adaptador LoRA y la cabeza de decisión se pueden reentrenar sobre datos propios de ofertas de empleo, manteniendo el encoder base congelado y reduciendo el coste de ajuste.
- Filtrado previo con revisión humana en portales de empleo: el modelo puede priorizar ofertas sospechosas para que un moderador humano las revise, aprovechando el 97,3% de recall a 1% FPR como umbral operativo, sin que la decisión final sea automática.
- Auditoría y depuración de sistemas de moderación: la API `states()` expone la evidencia JSON exacta y la salida del árbol, lo que facilita analizar por qué una oferta concreta recibe una probabilidad alta.
- Investigación académica sobre EMSCAD y fraude en anuncios de empleo: el modelo está entrenado y evaluado sobre el conjunto Fake Job Postings, lo que lo hace directamente utilizable como comparador en estudios sobre este corpus.
- Experimentación en hardware modesto: el pipeline se ejecuta en CPU con un rendimiento medido de aproximadamente 0,77 segundos por oferta en un Apple M4 Max con float32, suficiente para prototipos y conjuntos de validación de tamaño medio.
- Evaluación de calibración y umbrales: al devolver probabilidades calibradas, permite estudiar curvas ROC y puntos de operación alternativos (por ejemplo, recall a 0,1% FPR, donde el árbol solo obtiene 87,7% frente al 86,6% del stack).

## Benchmarks y rendimiento

Split oficial de test de FDB, puntuado una vez por modelo. AUROC y recall a 1% FPR siguen la evaluación de FDB (el recall es `np.interp(0.01, fpr, tpr)` sobre la ROC de test). Intervalos de confianza al 95% calculados con bootstrap estratificado por clase y 1.000 remuestreos.

| Modelo | AUROC [IC 95%] | Recall a 1% FPR [IC 95%] | Average precision | Recall a 0,1% FPR |
|---|---|---|---|---|
| Este modelo: System One | 0,9985 [0,9970, 0,9996] | 97,3% [94,7, 99,5] | 0,9837 | 86,6% |
| Árbol solo (entrada de System One) | 0,9974 [0,9949, 0,9993] | 96,3% [93,6, 98,9] | 0,9787 | 87,7% |
| Blend ajustado sobre el split holdout de System One (no publicado) | 0,9984 [0,9968, 0,9995] | 96,8% [94,1, 98,9] | 0,9828 | 87,7% |
| Mejor AUROC publicado: AutoGluon | 0,998 | no disponible | no disponible | no disponible |
| Mejor recall publicado a 1% FPR: AutoGluon | no disponible | 92,5% | no disponible | no disponible |

Los líderes de AUROC proceden del artículo de FDB (arXiv 2208.14417 v3). El artículo no reporta recall, por lo que los líderes de recall proceden de la tabla de resultados del README de FDB en el commit `54cdefa211`. Con 187 ofertas fraudulentas en el conjunto de test, cada una equivale a 0,53 puntos de recall. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,85 GB para los pesos en bfloat16 (425,6M de parámetros sumando base, adaptador LoRA y cabeza de decisión) y unos 1,7 GB en float32, sin contar activaciones ni overhead del runtime. Estas cifras son estimaciones a partir del recuento de parámetros, no medidas publicadas.
- GPU de referencia: NVIDIA GB10 en un DGX Spark, con torch 2.11.0 y bfloat16; en esa configuración el código reprodujo las puntuaciones evaluadas bit a bit.
- Cabe en GPU de consumo: el tamaño del repositorio (0,3 GB) y el recuento de parámetros lo sitúan al alcance de cualquier GPU consumer con 4 GB o más de VRAM; no se documentan pruebas específicas con modelos concretos como RTX 3060, 4090, A100 o H100.
- Ejecución en CPU: medida en un Apple M4 Max (macOS arm64, float32) con unos 0,77 segundos por oferta y aproximadamente 0,8 horas para las 3.576 filas del conjunto de test.
- Opciones de despliegue: el repositorio incluye su propio paquete Python (`system_one_fraud`) con `FraudPipeline.from_pretrained(".")`, Python 3.12 y versiones fijadas en `requirements.txt`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse GGUF no son aplicables sin una conversión previa.
- Diferencias entre hardware: en GPU con bfloat16 el resultado es reproducible bit a bit en la configuración de referencia, mientras que otras GPU y CPU producen puntuaciones ligeramente distintas.
- Latencia y throughput en GPU: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | AUROC en test de FDB | Recall a 1% FPR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| System One (este modelo) | Stack de GBT + encoder ModernBERT-large con LoRA y cabeza de decisión | ~425,6M (395M base + 4,39M LoRA + 26,2M cabeza) | 0,9985 | 97,3% | Apache-2.0 | HuggingFace (getSTEAV/system-one-fdb-fakejob) |
| Árbol GBT solo | Gradient boosting sobre features de ingeniería | no disponible | 0,9974 | 96,3% | no disponible | Incluido en el mismo repositorio |
| AutoGluon (referencia publicada en FDB) | AutoML y stacking para datos tabulares | no disponible | 0,998 | 92,5% | no disponible | Framework open source |
| convaiinnovations/laya | Encoder ModernBERT-large con cabeza de decisión tipada | ~395M | no aplica (no es un clasificador de fraude) | no disponible | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Es un modelo de benchmark, no un sistema de fraude listo para producción; el propio autor lo indica de forma explícita.
- Uso fuera de alcance declarado: rechazar automáticamente solicitudes de empleo o empleadores reales sin revisión humana, y tomar cualquier decisión automatizada sobre una persona sin revisión humana.
- No debe aplicarse a datos de una distribución distinta sin reentrenamiento y validación previos.
- Solo se declara soporte de inglés; no hay información sobre comportamiento en otros idiomas.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no genera texto libre), pero sí existe riesgo de clasificación errónea; en el test se le escapan aproximadamente un 2,7% de las ofertas fraudulentas al umbral de 1% FPR.
- Tamaño muestral del test limitado: 187 ofertas fraudulentas, de modo que cada una pesa 0,53 puntos de recall y los intervalos de confianza son amplios (94,7–99,5% en recall a 1% FPR).
- Posible sesgo de selección: la configuración publicada se eligió después de conocer los resultados de test, lo que puede inflar ligeramente las métricas principales; la model card publica todos los candidatos para permitir la comparación.
- Reproducibilidad dependiente del hardware: solo la configuración de referencia (NVIDIA GB10, torch 2.11.0, bfloat16) reproduce las puntuaciones bit a bit; otras GPU y CPU dan valores ligeramente distintos.
- Reproductividad de datos: el cargador de FDB requiere credenciales de la API de Kaggle y algunos ficheros de datos tienen sus propios términos, distintos de la Apache-2.0 de los pesos y el código.
- Los pesos base de Laya no se redistribuyen en este repositorio: hay que descargarlos del Hub en la revisión fijada y verificar su sha256.
- Sesgos conocidos del modelo: no disponible en la información proporcionada.
- No se documentan cuantizaciones (GGUF, GPTQ, AWQ) ni pipelines alternativos de despliegue, lo que limita opciones de servir el modelo fuera del paquete Python propio.
- En el punto de operación de 0,1% FPR el rendimiento del stack es ligeramente inferior al del árbol solo (86,6% frente a 87,7% de recall), por lo que la mejora del stack no es uniforme en todos los umbrales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/getSTEAV/system-one-fdb-fakejob
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Fraud Dataset Benchmark (FDB): https://github.com/amazon-science/fraud-dataset-benchmark
- Artículo de FDB (arXiv): https://arxiv.org/abs/2208.14417
- Referencia arXiv incluida en las etiquetas del modelo: https://arxiv.org/abs/2412.13663
- Desarrollador: https://steav.io
- La búsqueda web no devolvió enlaces adicionales relevantes sobre este modelo; los resultados obtenidos fueron únicamente páginas de inicio del buscador.
