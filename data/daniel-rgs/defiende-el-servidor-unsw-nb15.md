# Daniel-RGS/defiende-el-servidor-unsw-nb15

## Resumen

Defiende el servidor - v2 es un clasificador binario de flujos de red basado en UNSW-NB15, publicado por Daniel-RGS en HuggingFace. Su objetivo es distinguir entre tráfico normal (`0`) y ataque (`1`) a partir de variables tabulares derivadas de flujos de red, no de paquetes crudos.

El artefacto es un pipeline de scikit-learn con un random forest balanceado de 100 árboles y `max_depth=18`, que integra imputación, codificación one-hot de `proto`, `service` y `state`, y escalado de variables numéricas. El umbral de decisión está congelado en `0.51`.

Su interés práctico está en la trazabilidad del experimento: splits fijos en `data/prepared.dvc`, semilla `20261027`, commit de Git y ejecución de MLflow documentados. Sin embargo, la validación se realizó solo sobre validación, no sobre test, y el margen de FPR frente al límite configurado es estrecho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con `RandomForestClassifier` balanceado; 100 árboles y `max_depth=18` |
| Parámetros totales | no disponible; no se reporta número de nodos, hojas o parámetros del bosque |
| Parámetros activos | no aplica; no es un modelo MoE |
| Longitud de contexto | no aplica; clasificador tabular de flujos, no procesa secuencias de texto |
| Tipos de cuantización | no aplica; el artefacto se distribuye sin cuantización |
| Idiomas soportados | no aplica; no es un modelo de lenguaje |
| Licencia | no disponible |
| Formato de pesos | `joblib` |

## Arquitectura y entrenamiento

El modelo es un pipeline completo de scikit-learn. El preprocesamiento imputa valores ausentes, codifica las variables categóricas `proto`, `service` y `state` mediante one-hot encoding y escala las variables numéricas. Las columnas `id`, `attack_cat` y `label` no se usan como entrada. El clasificador final es un random forest balanceado con 100 árboles y profundidad máxima 18.

El entrenamiento utilizó los splits fijos de `data/prepared.dvc` con semilla `20261027`. El barrido de umbrales se hizo únicamente sobre validación, con el criterio de maximizar recall sujeto a un FPR máximo de `0.05`; el umbral resultante se congeló en `0.51`. El conjunto de test no se utilizó. No se documentan el número exacto de muestras, la composición completa del dataset ni técnicas de RLHF/DPO, algo esperable al no tratarse de un modelo generativo.

## Capacidades

- Clasificación binaria de flujos UNSW-NB15 en normal o ataque.
- Salida de probabilidad y etiqueta final aplicando el umbral congelado de `0.51`.
- Preprocesamiento integrado para variables categóricas y numéricas compatibles con el esquema de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes, planificación ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio o modo de razonamiento.
- No clasifica categorías de ataque (`attack_cat`); solo realiza clasificación binaria.
- No procesa paquetes crudos ni secuencias temporales; requiere features tabulares previamente extraídas.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede priorizar flujos con probabilidad superior a `0.51` para revisión humana, usando su recall alto en validación como filtro inicial y manteniendo revisión manual por el FPR del `4,90 %`.
- Filtro previo a un IDS basado en reglas: puede reducir el volumen de eventos que llegan a motores más costosos, siempre que los flujos se transformen al esquema de columnas esperado por el pipeline.
- Análisis por lotes de flujos exportados: útil para clasificar históricos de tráfico ya convertidos a features UNSW-NB15 y generar una primera etiqueta normal/ataque.
- Baseline reproducible en experimentos sobre UNSW-NB15: sirve como referencia mínima para comparar nuevos modelos con el mismo split, semilla y umbral.
- Docencia y validación de pipelines MLOps: el uso de DVC, MLflow, commit fijo y umbral congelado permite explicar trazabilidad y evaluación con datos de validación.
- Integración en un servicio interno de scoring: puede cargarse con `joblib` y scikit-learn para puntuar lotes de features, aunque no se documentan latencia, throughput ni API de despliegue.
- Auditoría de un clasificador existente: permite comprobar el comportamiento de un random forest balanceado sobre un subconjunto de validación con métricas y matriz de confusión explícitas.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar comparables tipo MMLU, HumanEval o GSM8K porque no es un modelo de lenguaje. Las únicas métricas disponibles son de validación, con umbral `0.51`.

| Métrica | Valor |
|---|---|
| Conjunto | validación; test no usado |
| Umbral | 0.51 |
| Recall de ataque | 0.9463 |
| Precision de ataque | 0.9762 |
| FPR | 0.0490 |
| Macro-F1 | 0.9410 |

Matriz de confusión en validación:

| Real \ Predicho | Normal | Ataque |
|---|---:|---:|
| Normal | 10801 | 557 |
| Ataque | 1296 | 22837 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se documenta uso de GPU. El modelo es un pipeline de scikit-learn y se ejecuta en CPU.
- RAM necesaria: no disponible; el tamaño del repositorio es `0.0 GB`, pero eso no equivale al consumo en ejecución.
- GPU recomendadas: no aplica; no se documenta soporte GPU ni perfilado en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no aplica; la inferencia prevista es en CPU.
- Opciones de despliegue: carga mediante `joblib` y scikit-learn. vLLM, llama.cpp, Ollama y TGI no son aplicables a este artefacto.
- Latencia y throughput: no disponibles.
- Seguridad de despliegue: cargar el `joblib` únicamente desde la revisión verificada indicada por el autor; los archivos `joblib` de procedencia desconocida pueden ejecutar código al deserializarse.

## Comparativa con modelos similares

No se dispone de resultados de modelos comparables en la información proporcionada; no se inventan cifras.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiende el servidor - v2 | random forest, 100 árboles, `max_depth=18`; parámetros totales no disponibles | no aplica | recall 0.9463, precision 0.9762, FPR 0.0490, macro-F1 0.9410 en validación | no disponible | HuggingFace, formato `joblib` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial, redistribución o modificación sin autorización expresa.
- El margen de FPR es pequeño: `0.0490` frente a un máximo configurado de `0.05`; un cambio de distribución podría superar el límite en test.
- El conjunto de test no se utilizó; no hay una estimación independiente de generalización.
- La validación pesa cada fila, incluidas repeticiones, lo que puede alterar la interpretación de las métricas.
- El dataset UNSW-NB15 es histórico; el autor advierte que no demuestra eficacia sobre redes actuales.
- Puede haber solapamiento entre clases y degradación por cambio de distribución en tráfico real.
- El modelo es solo binario; no identifica `attack_cat` y el autor indica explícitamente no usar esa columna como entrada.
- No procesa paquetes crudos ni mantiene contexto temporal; depende de un esquema de features concreto.
- No se documenta calibración de probabilidades; el umbral `0.51` debe tratarse como una decisión operativa congelada, no como una probabilidad calibrada universal.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente son falsos positivos y falsos negativos.
- Sesgos conocidos: no documentados; al entrenar con un dataset histórico, puede heredar sesgos de composición y tipos de ataque sobrerrepresentados.
- El artefacto `joblib` debe cargarse solo desde la revisión verificada; la deserialización de archivos no confiables es un riesgo de seguridad.

## Enlaces

- [HuggingFace: Daniel-RGS/defiende-el-servidor-unsw-nb15](https://huggingface.co/Daniel-RGS/defiende-el-servidor-unsw-nb15)
- Referencia citada: Moustafa, N. y Slay, J. *UNSW-NB15: a comprehensive data set for network intrusion detection systems*; sin URL disponible en la información proporcionada.
- No se han encontrado enlaces adicionales relevantes en la búsqueda web proporcionada; los resultados sobre el nombre «Daniel» no están relacionados con el modelo.
