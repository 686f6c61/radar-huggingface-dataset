# Prior-Labs/tabpfn_3_5

## Resumen

TabPFN-3.5 es un modelo fundacional basado en transformers desarrollado por Prior Labs para resolver problemas de predicción sobre datos tabulares mediante aprendizaje en contexto (in-context learning) en un único paso forward. No es un modelo de lenguaje: su entrada son conjuntos de datos estructurados con filas, columnas numéricas, categóricas, de texto y de fecha, y su salida son predicciones de clasificación o regresión. Un mismo checkpoint sirve para ambas tareas, por lo que no requiere reentrenamiento ni ajuste de pesos para cada problema nuevo.

El modelo se distribuye bajo la licencia `tabpfn-3-5-license-v1.0`, con acceso restringido (gated) y un modelo de negocio de doble vía: uso libre para investigación, evaluación y benchmarking interno, y licencia comercial de pago para cualquier uso en producción o con fines de lucro. El repositorio ocupa 2,1 GB e incluye tres checkpoints en formato safetensors: el modelo principal, una variante rápida y más pequeña, y una variante experimental orientada a clasificación multiclase.

Su relevancia actual radica en que ataca el cuello de botella clásico del aprendizaje automático tabular —el ajuste de hiperparámetros y el reentrenamiento por cada dataset— sustituyéndolo por inferencia directa, y en que, al haberse entrenado exclusivamente con datos sintéticos, evita el riesgo de fuga de datos procedente de la fase de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con aprendizaje en contexto (prior-data fitted network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no orientado a lenguaje natural) |
| Licencia | tabpfn-3-5-license-v1.0 (acceso gated; uso comercial prohibido sin licencia enterprise) |
| Formato de pesos | safetensors |
| Checkpoints incluidos | tabpfn-v3.5-20260909, tabpfn-v3.5-fast-20260909, tabpfn-v3.5-20260909_multiclass |
| Tareas soportadas | Clasificacion y regresion tabular (un unico checkpoint para ambas) |
| Limite de caracteristicas | 20.000 columnas |
| Tamano del repositorio | 2,1 GB |
| Descargas / likes | 2.926 descargas, 11 likes |
| Fecha de publicacion | 9 de septiembre de 2026 |

## Arquitectura y entrenamiento

TabPFN-3.5 sigue el paradigma de las prior-data fitted networks: en lugar de aprender una función a partir de los datos de cada problema mediante descenso de gradiente, el modelo ha sido preentrenado para reconocer patrones sobre distribuciones sintéticas de tareas tabulares y, en tiempo de inferencia, recibe el conjunto de entrenamiento completo como contexto y produce directamente las predicciones del conjunto de test. Según la model card, el entrenamiento se realizó exclusivamente con tareas tabulares sintéticas, lo que elimina la fuga de datos de la fase de preentrenamiento.

El repositorio incluye tres variantes. `tabpfn-v3.5-20260909.safetensors` es el checkpoint por defecto (`ModelVersion.V3_5`). `tabpfn-v3.5-fast-20260909.safetensors` corresponde a TabPFN-3.5-Fast, descrito como un modelo más pequeño y rápido (`ModelVersion.V3_5_FAST`). `tabpfn-v3.5-20260909_multiclass.safetensors` es una variante experimental con una arquitectura ligeramente distinta que rinde mejor en algunos casos de clasificación multiclase. Todos los checkpoints incorporan por defecto el tratamiento de columnas de texto (`TRANSFORM_TEXT`) y de fecha/hora (`TRANSFORM_DATES`), así como un límite de 20.000 características. No se especifican en la información disponible el número de parámetros, el número de tokens de entrenamiento, la composición detallada del dataset sintético ni si se aplicaron técnicas de RLHF o DPO (no aplicables en sentido estricto a un modelo no generativo de lenguaje).

## Capacidades

- Clasificación tabular binaria y multiclase sobre datos estructurados.
- Regresión tabular, servida desde el mismo checkpoint que la clasificación (`TabPFNRegressor`).
- Aprendizaje en contexto: el ajuste consiste en pasar el conjunto de entrenamiento al modelo, sin actualización de pesos ni búsqueda de hiperparámetros por dataset.
- Tratamiento nativo de columnas de texto (`TRANSFORM_TEXT`) y de fecha/hora (`TRANSFORM_DATES`).
- Soporte de hasta 20.000 características por problema.
- Variante específica para clasificación multiclase con arquitectura ligeramente distinta.
- Variante Fast, más pequeña y rápida, para escenarios con restricciones de latencia o cómputo.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de generación de lenguaje natural; los idiomas soportados figuran como no disponibles.
- No procesa datos no estructurados como imágenes; la model card lo excluye explícitamente de su uso previsto.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Evaluación interna de riesgo crediticio: el modelo permite obtener probabilidades de impago sobre carteras tabulares con variables sociodemográficas y financieras sin construir y ajustar un pipeline por cada producto. La licencia autoriza expresamente este tipo de pruebas internas.
- Cribado de pacientes en investigación clínica: clasificación de pacientes según variables analíticas y demográficas para priorizar inclusiones en ensayos, aprovechando su soporte de columnas mixtas numéricas y categóricas.
- Predicción de propiedades moleculares (QSAR) en química y farmacología: regresión sobre descriptores moleculares tabulares para estimar actividad, toxicidad o solubilidad.
- Detección de fraude transaccional: clasificación binaria sobre registros estructurados de operaciones, con la variante Fast si se necesita baja latencia en un pipeline de evaluación.
- Previsión de demanda y consumo energético en utilities y clima: regresión sobre series históricas tabuladas con variables temporales, aprovechando el tratamiento nativo de columnas de fecha.
- Clasificación de expedientes y asuntos legales a partir de metadatos estructurados (materia, jurisdicción, cuantía, fechas) para enrutado interno de casos.
- Benchmarking interno de pipelines de datos: la licencia permite explícitamente el benchmarking competitivo para evaluación interna, de modo que un equipo puede comparar TabPFN-3.5 contra sus modelos actuales antes de decidir una compra o migración.
- Prototipado rápido de modelos predictivos: al no requerir entrenamiento, permite disponer de una línea base funcional en minutos sobre un dataset nuevo, útil para validar si un problema tabular es abordable antes de invertir en ingeniería de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, AUC, RMSE ni comparaciones cuantitativas con otros modelos, y las búsquedas web realizadas no devolvieron documentación técnica adicional sobre este modelo.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM, GPU soportadas, latencia ni throughput.
- Como referencia indirecta, el repositorio completo con los tres checkpoints en safetensors ocupa 2,1 GB, por lo que cada checkpoint individual sería previsiblemente inferior a ese tamaño. Se trata de una deducción a partir del tamaño del repositorio, no de un dato oficial.
- Si esa deducción es correcta, un único checkpoint cabría con holgura en GPUs de consumo (RTX 3060, RTX 4070, RTX 4090) e incluso podría ejecutarse en CPU, aunque no hay confirmación por parte del fabricante.
- No hay datos sobre si el modelo está optimizado para tensor parallelism, batch grande o despliegue multi-GPU.
- Opciones de despliegue: la vía soportada es el paquete oficial `tabpfn` (instalable con `pip install tabpfn`), que expone `TabPFNClassifier` y `TabPFNRegressor` con API compatible con scikit-learn.
- Los servidores de inferencia para modelos generativos (vLLM, TGI, llama.cpp, Ollama) no están indicados como compatibles en la información disponible, dado que no se trata de un modelo de lenguaje causal.
- Para producción, Prior Labs ofrece un motor de inferencia propietario de alta velocidad junto con la licencia comercial enterprise; no se detallan sus requisitos técnicos.

## Comparativa con modelos similares

La información disponible solo permite comparar entre las tres variantes del propio modelo. No hay datos públicos de rendimiento que permitan comparar con alternativas de la competencia (por ejemplo, gradient boosting o versiones anteriores de TabPFN).

| Modelo | Descripcion | Uso recomendado | Limitaciones conocidas |
|---|---|---|---|
| tabpfn-v3.5-20260909 | Checkpoint principal; opcion por defecto para `ModelVersion.V3_5` | Uso general en clasificacion y regresion | Parametros y rendimiento no disponibles |
| tabpfn-v3.5-fast-20260909 | Version mas pequena y rapida; por defecto para `ModelVersion.V3_5_FAST` | Escenarios con restriccion de latencia o computo | No se detalla la perdida de precision respecto al modelo principal |
| tabpfn-v3.5-20260909_multiclass | Arquitectura ligeramente distinta, a veces mejor en multiclase | Clasificacion multiclase | Marcada como experimental por el autor |

## Limitaciones y advertencias

- Restricción de licencia crítica: el modelo, sus derivados y sus salidas no pueden usarse con fines comerciales ni en producción. Esto incluye productos que generen ingresos, benchmarking competitivo para compras, entregables a clientes y la toma de decisiones comerciales internas basadas en sus resultados.
- El acceso al repositorio es restringido (gated): requiere aceptar la licencia y facilitar organización, rol y caso de uso.
- Para cualquier uso en producción es necesaria una licencia comercial enterprise, comercializada por Prior Labs a través de sales@priorlabs.ai.
- Riesgo de alucinación en el sentido estadístico: al ser un modelo predictivo, puede producir predicciones con alta confianza en regiones alejadas de la distribución de los datos de entrada.
- Sesgos: el modelo se entrena con datos sintéticos, por lo que no hereda sesgos de un corpus real, pero la model card advierte de que en casos de alto riesgo el usuario debe garantizar que sus datos etiquetados estén libres de sesgos.
- Limitación de alcance: no es adecuado para datos no estructurados como imágenes.
- Limitación de tamaño de entrada: el número de características está acotado a 20.000; no se especifica el límite en número de filas del conjunto de contexto.
- Idiomas soportados: no disponibles; el modelo no genera lenguaje natural, por lo que esta dimensión no aplica del mismo modo que en un LLM.
- No se han publicado benchmarks, lo que impide anticipar su rendimiento relativo frente a alternativas consolidadas antes de probarlo.
- No hay información pública sobre parámetros totales, longitud de contexto efectiva, cuantizaciones soportadas ni latencias, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Prior-Labs/tabpfn_3_5
- Checkpoint principal: https://huggingface.co/Prior-Labs/tabpfn_3_5/blob/main/tabpfn-v3.5-20260909.safetensors
- Checkpoint Fast: https://huggingface.co/Prior-Labs/tabpfn_3_5/blob/main/tabpfn-v3.5-fast-20260909.safetensors
- Checkpoint multiclase: https://huggingface.co/Prior-Labs/tabpfn_3_5/blob/main/tabpfn-v3.5-20260909_multiclass.safetensors
- Licencia: https://huggingface.co/Prior-Labs/tabpfn_3_5/blob/main/LICENSE
- Codigo de inferencia: https://github.com/PriorLabs/TabPFN
- Contacto comercial: sales@priorlabs.ai
- Nota: las busquedas web realizadas no arrojaron resultados relevantes sobre este modelo; los enlaces devueltos correspondian a entidades homonimas sin relacion (asociaciones de enfermedades raras, empresas de menueria y diccionarios), por lo que se han descartado.
