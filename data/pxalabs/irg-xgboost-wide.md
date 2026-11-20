# PxALabs/irg-xgboost-wide

## Resumen

IRG XGBoost wide es un conjunto de quince clasificadores de gradient boosting (XGBoost) entrenados para predecir si una ventana genómica de 1.000 pares de bases constituye un elemento regulador cis candidato (cCRE: PLS, pELS o dELS) de un biosample concreto de ENCODE, frente a un fondo genómico emparejado por contenido de GC. Lo desarrolla PxALabs como parte del proyecto interpretable-regulatory-genomics y no emplea ningún modelo preentrenado ni modelo de lenguaje: la única entrada son frecuencias de 6-meros (4.096 características) calculadas sobre la secuencia de ADN.

Se trata de la sucesión del repositorio `PxALabs/irg-xgboost-baselines` (notebook 09), con una búsqueda de hiperparámetros más amplia y el límite de árboles elevado de 1.500 a 8.000. Hay tres biosamples (tcell, k562 y gm12878) y cinco semillas por biosample, lo que da los quince ficheros. Su relevancia es la de un baseline tabular fuerte y reproducible para clasificación de elementos reguladores a partir de secuencia, con partición por cromosomas y evaluación sobre cromosomas de test nunca usados en selección.

El modelo es deliberadamente modesto en alcance: sirve como referencia frente a arquitecturas neuronales como las CNN ajustadas del mismo proyecto, y sus autores advierten que no está pensado para uso clínico ni para predicción de efectos de variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (XGBoost 3.4.1, entrenamiento en GPU) |
| Parametros totales | no disponible (modelos de árboles; no aplica recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de ventanas de 1.000 pb representadas como frecuencias de 6-meros (4.096 características) |
| Tipos de cuantizacion | no disponible (no aplica a XGBoost en formato nativo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada de secuencias de ADN) |
| Licencia | other |
| Formato de pesos | binario nativo de XGBoost `.ubj` (sin pickle), un fichero por biosample y semilla |

## Arquitectura y entrenamiento

Cada clasificador es un modelo XGBoost de árboles potenciados que opera sobre un vector de 4.096 frecuencias de 6-meros extraído de ventanas de 1.000 pb; las ventanas que contienen bases N se descartan en la función de características (`xgb_features.py`). No hay capa neuronal, atención ni representación aprendida de la secuencia más allá de la composición de k-meros.

El entrenamiento usa el dataset `PxALabs/encode-regulatory-elements` v2.1, tablas `*_gc_matched`, con partición por cromosomas: entrenamiento en chr1-14, X e Y, validación en chr15-18 y test en chr19-22. La selección se hizo solo sobre validación (early stopping sobre AUC de validación, paciencia 100). La búsqueda tuvo dos etapas: la etapa A reejecutó las 3 mejores configuraciones del notebook 09 por biosample con hasta 8.000 árboles; la etapa B probó 8 configuraciones aleatorias nuevas (semilla de espacio 777; max_depth en {6, 8, 10}, learning_rate en {0.05, 0.08}, subsample en {0.6, 0.8, 1.0}, colsample_bytree en {0.1, 0.2, 0.3}, min_child_weight en {1, 5, 10}, reg_lambda en {20, 50, 100}; hasta 4.000 árboles). Los modelos finales son la mejor configuración de validación por biosample, con 5 semillas y hasta 8.000 árboles.

Configuraciones seleccionadas: tcell y k562 con profundidad 8, lr 0.05, subsample 0.6, colsample 0.1, min_child_weight 5 y lambda 100; gm12878 con profundidad 8, lr 0.05, subsample 1.0, colsample 0.3, min_child_weight 1 y lambda 20. La mejor iteración quedó entre 1.780 y 3.096, sin que ningún modelo alcanzase el tope de árboles. Solo se ajustó k=6.

## Capacidades

- Clasificación binaria tabular: probabilidad de que una ventana de 1.000 pb sea un cCRE del biosample correspondiente.
- Tres modelos independientes por biosample (tcell, k562, gm12878), cada uno específico de su biosample.
- Extracción de características de secuencia de ADN mediante frecuencias de 6-meros.
- Reproducibilidad con cinco semillas por biosample para reportar la dispersión de resultados.
- Carga e inferencia con la librería XGBoost (`load_model` sobre ficheros `.ubj`).
- Verificación de integridad mediante SHA-256 por fichero en `manifest.json` y `MANIFEST.sha256`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Baseline de referencia en investigación de elementos reguladores: usar los quince modelos como cota inferior de rendimiento frente a CNN o modelos de secuencia más complejos, tal como hace el propio proyecto con `PxALabs/irg-cnn-baselines`.
- Clasificación rápida de ventanas candidatas en un pipeline de anotación: al ser un modelo de árboles sobre 4.096 características, la inferencia es barata y permite cribar grandes conjuntos de ventanas antes de pasar a modelos más costosos.
- Control de atajos de composición: la evaluación emparejada por GC y CpG observed/expected permite cuantificar cuánto del rendimiento se explica por composición y no por motivo regulador.
- Reproducción de experimentos: las cinco semillas y el manifiesto con hashes permiten replicar exactamente los resultados reportados en un análisis comparativo.
- Docencia y prototipado en genómica computacional: ejemplo completo de partición por cromosomas, early stopping sobre validación y evaluación en test independiente sin fuga de datos.
- Comparación de biosamples: analizar qué motivos de 6-meros pesan más en cada biosample para estudiar especificidad de tejido a nivel de composición de k-meros.

## Benchmarks y rendimiento

Resultados sobre cromosomas de test (media de 5 semillas, desviación típica entre paréntesis). "Matched" es el subconjunto de test emparejado por GC y CpG observed/expected, con igual número de positivos y negativos por bin; es una subpoblación y no es comparable con el AUROC de la tarea completa.

| Biosample | Test AUROC | Matched AUROC | Anterior (nb09) |
|---|---:|---:|---:|
| tcell | 0.8911 (0.0009) | 0.7458 (0.0033) | 0.8894 / 0.7431 |
| k562 | 0.8710 (0.0008) | 0.7724 (0.0019) | 0.8695 / 0.7686 |
| gm12878 | 0.8456 (0.0004) | 0.7575 (0.0006) | 0.8429 / 0.7526 |

Frente a las medias de 5 semillas de las CNN ajustadas (`PxALabs/irg-cnn-baselines`), estos modelos superan a ShallowCNN en T cell y K562 (0.005 y 0.004 de AUROC completo) y quedan aproximadamente a la par o ligeramente por detrás en GM12878 (ShallowCNN +0.001 completo, +0.007 emparejado).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 0,3 GB para los quince ficheros, por lo que el modelo cabe holgadamente en memoria de sistema.
- GPU recomendadas: no se especifican para inferencia; el entrenamiento se realizó en GPU con XGBoost 3.4.1.
- Cabe en GPU de consumo: sí, por el tamaño reducido del conjunto de modelos, aunque no se publican cifras de VRAM concretas.
- Opciones de despliegue: XGBoost nativo (`xgb.XGBClassifier().load_model(...)`), con la función de características `xgb_features.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Test AUROC (tcell / k562 / gm12878) | Licencia |
|---|---|---|---|---|
| IRG XGBoost wide (este) | XGBoost sobre 6-meros | 1.000 pb, 4.096 características | 0.8911 / 0.8710 / 0.8456 | other |
| IRG XGBoost baselines (nb09) | XGBoost sobre 6-meros | 1.000 pb, 4.096 características | 0.8894 / 0.8695 / 0.8429 | no disponible |
| IRG CNN baselines (ShallowCNN) | CNN ajustada | secuencia | ligeramente inferior en tcell y k562; superior en gm12878 | no disponible |

## Limitaciones y advertencias

- Modelos de referencia para clasificación de cCRE basada en secuencia; no aptos para uso clínico ni para predicción de efectos de variantes.
- Cada modelo es específico del biosample con el que se entrenó; no se cubre el uso cruzado entre biosamples.
- Los negativos son ventanas genómicas emparejadas por GC fuera de los cCRE del biosample, no elementos no reguladores validados.
- La búsqueda de hiperparámetros está truncada (3 + 8 configuraciones por biosample, una sola semilla en la búsqueda); las configuraciones seleccionadas quedan cerca del borde del espacio, por lo que es plausible una mejora adicional de aproximadamente 0.001.
- Solo se ajustó k=6; no se exploraron otros tamaños de k-mero.
- Los atajos de composición (GC, CpG) solo se controlan en la evaluación emparejada; el contenido repetitivo no se controla en el entrenamiento.
- Nota de datos: las tablas antiguas del proyecto denominadas `k562_*` correspondían en realidad a elementos de células T; estos modelos usan las tablas corregidas v2.1.
- Licencia "other": deben consultarse los términos concretos antes de cualquier uso comercial.
- No hay información sobre sesgos demográficos ni de otro tipo, al no tratarse de un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PxALabs/irg-xgboost-wide
- Repositorio del proyecto: https://github.com/PxA-Labs/interpretable-regulatory-genomics
- Dataset de entrenamiento: https://huggingface.co/datasets/PxALabs/encode-regulatory-elements
- Modelo predecesor: https://huggingface.co/PxALabs/irg-xgboost-baselines
- CNN de comparación: https://huggingface.co/PxALabs/irg-cnn-baselines
- Análisis y caveats: `docs/results/xgb_wide.md` en el repositorio de GitHub
- Kernel de origen: Kaggle `purvanshj009/irg-11-xgb-wide` v2
