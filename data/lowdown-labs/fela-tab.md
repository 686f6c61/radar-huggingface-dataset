# lowdown-labs/fela-tab

## Resumen

FelaTab es un modelo fundacional para datos tabulares desarrollado por Lowdown Labs, una compañía que se define como creadora de IA eficiente y transparente. A diferencia de los modelos de lenguaje, FelaTab no genera texto: lee una tabla existente, aprende el patrón de las filas etiquetadas (support rows) en una sola pasada y predice las celdas faltantes de las filas de consulta (query rows), tanto en clasificación como en regresión. Es una red prior fitted (PFN) entrenada sobre millones de tablas sintéticas, lo que le permite generalizar a tablas reales sin ningún ajuste previo por dataset.

El modelo destaca por su arquitectura subcuadrática: una atención lineal con delta rule combinada con una atención landmark por bloques, que mantiene la memoria plana al crecer el conjunto de soporte y permite ejecutarlo en CPU sin GPU. Está disponible en dos tamaños anidados (big y small) extraídos de un único entrenamiento MatFormer, con 411,9M y 51,6M de parámetros respectivamente. Su relevancia actual radica en que compite directamente con TabFM de Google en tareas de clasificación tabular, pero con la ventaja de poder ejecutarse en el navegador o en un Postgres, con cuantización int8 casi sin pérdida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Prior fitted network con delta rule linear attention y variable chunk landmark attention |
| Parametros totales | 411.863.529 (tier big) / 51,6M (tier small, subconjunto anidado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular; soporta hasta 10.000 filas de soporte y 100 columnas de características) |
| Tipos de cuantizacion | fp32 e int8 (int8 casi sin pérdida, recomendado para despliegue) |
| Idiomas soportados | No disponible (los datos de entrada son numéricos; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (ficheros `model_big.safetensors`, `model_big_int8.safetensors`, `model_small.safetensors`, `model_small_int8.safetensors`) |

## Arquitectura y entrenamiento

FelaTab es una red prior fitted que trata el conjunto de filas de una tabla como una secuencia. Las filas de soporte (con etiqueta conocida) escriben en un estado de trabajo de tamaño fijo, mientras que las filas de consulta son de solo lectura y no interactúan entre sí, evitando fugas de información en tiempo de prueba. El mecanismo de atención combina una atención lineal con delta rule, que corrige la debilidad de recuperación de la atención lineal estándar mediante una actualización de sobrescritura, y una atención landmark por bloques sobre filas de soporte agrupadas. Ambas son lineales en el número de filas con estado fijo, lo que permite escalar más allá del límite cuadrático de aproximadamente 10.000 filas de los modelos tabulares con atención completa.

El entrenamiento se realizó sobre millones de tablas sintéticas, siguiendo el protocolo TabPFN: el split de entrenamiento de un dataset real se alimenta como filas de soporte y el de test como filas de consulta, todo en una única pasada in-context, sin entrenamiento específico por dataset. Los dos tamaños (big y small) provienen de un único entrenamiento anidado MatFormer: el modelo pequeño es un subconjunto estricto de los pesos del grande (verificado bit a bit), de modo que ambos se obtienen de un solo conjunto de pesos y el usuario puede elegir el equilibrio tamaño/precisión. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo de tablas numéricas.

## Capacidades

- Clasificación tabular: predice la clase de cada fila de consulta con probabilidades por clase que suman 1, admitiendo hasta 10 clases distintas.
- Regresión tabular: devuelve un valor predicho junto con una desviación estándar, proporcionando una barra de error honesta en las unidades originales de la etiqueta.
- Aprendizaje in-context: aprende el patrón de las filas de soporte en una sola pasada, sin entrenamiento ni ajuste por tabla.
- Calibración de confianza: incorpora un mecanismo de calibración con error de calibración esperado (ECE) de aproximadamente 0,051 y soporte para envoltura conformal que alcanza una cobertura empírica de aproximadamente 0,91 con garantía del 0,90.
- Escalado lineal: memoria plana al crecer el conjunto de soporte (residente de unos 3,79 GB en el dataset adult desde 500 hasta 10.000 filas de soporte) y throughput lineal en el tamaño del soporte.
- Ejecución en CPU y dispositivos de bajo consumo: sin necesidad de GPU, con cuantización int8 casi sin pérdida (416 MB para el tier big, 52 MB para el small).
- Soporte de hasta 100 columnas de características numéricas, con estandarización automática de los datos de entrada.
- Despliegue integrado: disponible como extensión para Postgres (pg_fela) y demo en navegador con el tier small int8.

## Casos de uso

- Automatización de AutoML en bases de datos: mediante la extensión pg_fela, FelaTab puede ejecutar clasificación y regresión directamente sobre tablas de Postgres, permitiendo crear modelos predictivos sin extraer datos ni entrenar algoritmos externos. Es adecuado porque su memoria plana y su ejecución en CPU lo hacen viable para tablas de gran tamaño dentro del motor de base de datos.
- Predicción de abandono (churn) en hojas de cálculo: integrado como extensión de Google Sheets (próximamente), permite marcar un conjunto de clientes con su estado de abandono y predecir el resto de filas en la propia hoja, con confianza calibrada. La ausencia de entrenamiento por tabla y la ejecución en navegador lo hacen accesible para analistas sin infraestructura.
- Scoring crediticio rápido: con un histórico de solicitudes etiquetadas como apoyo, FelaTab puede puntuar nuevas solicitudes de crédito con probabilidades de impago y una medida de incertidumbre, útil para entidades que necesitan una primera evaluación sin construir un modelo específico.
- Detección de fraude en transacciones: alimentando las transacciones etiquetadas como fraudulentas o legítimas, el modelo clasifica nuevas transacciones en una sola pasada, con la ventaja de poder actualizar el conjunto de soporte dinámicamente sin reentrenar.
- Mantenimiento predictivo en entornos industriales: a partir de lecturas de sensores numéricos con etiquetas de fallo, FelaTab predice la probabilidad de avería de cada equipo, proporcionando intervalos de confianza que ayudan a priorizar intervenciones.
- Análisis exploratorio de datos en entornos con restricciones de hardware: su capacidad de ejecutarse en CPU y en el navegador permite a investigadores y desarrolladores hacer pruebas de clasificación y regresión sobre datasets pequeños o medianos sin depender de GPUs, por ejemplo en portátiles o dispositivos edge.
- Generación de predicciones de referencia (baseline) en pipelines de ML: al ser un modelo zero-shot sin ajuste, sirve como baseline fuerte antes de entrenar modelos más complejos, comparando su rendimiento (0,819 de precisión media) con el de LightGBM ajustado (0,827) en la batería de OpenML.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en la model card, medidos sobre los pesos publicados. El protocolo es zero-shot, estilo TabPFN: el split de entrenamiento de cada dataset OpenML se usa como filas de soporte y el de test como filas de consulta, en una única pasada in-context.

| Sistema | Precisión media (8 datasets de clasificación) |
|---|---|
| FelaTab big, una sola pasada | 0,819 |
| FelaTab small, una sola pasada | 0,810 |
| LightGBM ajustado | 0,827 |
| scikit-learn sin ajustar (mejor) | 0,834 |
| Ensemble completo (FelaTab + GBT + ridge, apilado) | 0,840 |

Otros resultados declarados:

- FelaTab solo iguala o supera a un LightGBM ajustado en 5 de los 8 datasets.
- FelaTab alcanza aproximadamente el 97% de la precisión del ensemble completo (0,819 frente a 0,840).
- Error de calibración esperado (ECE): aproximadamente 0,051 para FelaTab.
- Cobertura empírica con envoltura conformal: aproximadamente 0,91 para FelaTab y 0,92 para el ensemble, con garantía del 0,90.
- El bagging en tiempo de inferencia (promediando el modelo congelado sobre permutaciones de orden de características y soporte reordenado) no mejoró el tier big en esta batería (midió 0,811, por debajo de la pasada única), por lo que la pasada única es la cifra recomendada.

No se han publicado resultados de benchmarks en la información disponible más allá de estos datos declarados por el autor.

## Requisitos de hardware

- Inferencia en CPU sin GPU: el modelo está diseñado para ejecutarse en procesadores de bajo consumo; la demo en navegador usa el tier small int8.
- Memoria RAM: el tier big en fp32 ocupa 1,65 GB en disco y el int8 416 MB; el residente medido en el dataset adult se mantiene en aproximadamente 3,79 GB desde 500 hasta 10.000 filas de soporte (memoria plana, sin caché de claves-valores creciente).
- Tier small: 206 MB en fp32 y 52 MB en int8, apto para dispositivos con recursos muy limitados.
- GPU recomendadas: no necesarias; el modelo corre en CPU. No se proporcionan requisitos de GPU.
- Opciones de despliegue: librería transformers (con custom code), extensión pg_fela para Postgres, demo en navegador (probablemente con WebAssembly o JavaScript), y despliegue on-device mediante los ficheros int8.
- Latencia y throughput: no se han publicado cifras concretas; el throughput es lineal en el tamaño del conjunto de soporte, y la memoria permanece plana, lo que sugiere un rendimiento predecible en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/limitaciones | Precisión media (OpenML 8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FelaTab (big) | 411,9M | Hasta 10k filas, 100 columnas, 10 clases | 0,819 (zero shot) | Apache-2.0 | Pesos abiertos en HuggingFace |
| FelaTab (small) | 51,6M | Ídem | 0,810 (zero shot) | Apache-2.0 | Ídem |
| TabFM (Google) | No disponible | No disponible | No disponible (el autor afirma competir, sin datos públicos) | No disponible | No disponible |
| TabPFN | No disponible | No disponible | No disponible | No disponible | No disponible |
| LightGBM (ajustado) | No aplica | Entrenamiento específico por dataset | 0,827 | MIT | Open source |

Nota: no se dispone de datos públicos comparativos de TabFM ni de TabPFN en la información proporcionada. La comparación con LightGBM y scikit-learn proviene de los benchmarks declarados por el autor. FelaTab es un modelo fundacional zero-shot, mientras que LightGBM requiere entrenamiento específico; la comparación es relevante porque FelaTab alcanza un rendimiento cercano sin ajuste.

## Limitaciones y advertencias

- Es una vista previa de investigación (research preview): el propio autor declara que no sustituye a un experto de dominio ni es un sistema de decisión certificado.
- Solo admite características numéricas; no procesa texto, categorías ni datos faltantes de forma nativa (la estandarización de columnas es automática, pero los valores deben ser numéricos).
- Limitación de clases: clasificación limitada a 10 clases distintas.
- Limitación de columnas: hasta 100 columnas de características.
- El rendimiento en regresión se declara pero no se detalla en los benchmarks publicados; la precisión reportada corresponde solo a clasificación.
- Riesgo de alucinación: al ser un modelo tabular, el concepto de alucinación no aplica directamente, pero las predicciones pueden ser incorrectas en tablas con distribuciones muy diferentes a las sintéticas de entrenamiento; la calibración y la envoltura conformal mitigan parcialmente este riesgo.
- Sesgos: al entrenarse sobre tablas sintéticas, puede heredar sesgos de los procesos de generación de datos sintéticos; no se han publicado evaluaciones de sesgo.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo se ofrece como vista previa de investigación sin garantías de precisión ni certificación.
- Para producción, se recomienda validar el rendimiento en los datos propios antes de desplegar, especialmente en dominios regulados (crédito, salud, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lowdown-labs/fela-tab
- Organización Lowdown Labs en GitHub: https://github.com/Lowdown-Labs/
- Repositorio pg_fela (despliegue en Postgres): https://github.com/Lowdown-Labs/pg_fela
- Sitio web de Lowdown Labs: https://gimmelowdown.com/products
- DOI del registro de investigación (Zenodo): 10.57967/hf/9524
- Publicación en LinkedIn sobre la comparación con TabFM: https://www.linkedin.com/posts/suraj-mirpuri_httpslnkdineat3uzxj-at-lowdown-labs-activity-7487926836232962050-3MEn
