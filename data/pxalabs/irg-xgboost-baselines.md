# PxALabs/irg-xgboost-baselines

## Resumen

`PxALabs/irg-xgboost-baselines` es un conjunto de quince clasificadores de gradiente boosting (XGBoost) publicados por PxA Labs como parte del proyecto *interpretable-regulatory-genomics*. Cada modelo predice si una ventana de 1.000 pares de bases del genoma humano corresponde a un elemento regulador cis candidato (cCRE: PLS, pELS o dELS) de un biosample concreto de ENCODE, frente a un fondo genómico emparejado por contenido GC. Se entrenan tres modelos independientes, uno por biosample (`tcell`, `k562`, `gm12878`), con cinco semillas cada uno.

La relevancia de esta publicación es metodológica más que de capacidad: no hay redes neuronales ni modelos de lenguaje, sino un baseline tabular clásico, ajustado mediante búsqueda de hiperparámetros, que sirve como referencia obligada para comparar cualquier modelo posterior basado en secuencias, como las CNN del repositorio hermano `PxALabs/irg-cnn-baselines`. Las características de entrada son frecuencias de 6-meros (4.096 dimensiones), lo que convierte el problema en una clasificación tabular de alta dimensionalidad.

El conjunto se distribuye en formato binario nativo de XGBoost (`.ubj`), con un script de extracción de características (`xgb_features.py`) y un manifiesto con hashes SHA-256, hiperparámetros e iteraciones óptimas. No se proporcionan pesos en safetensors ni GGUF, ni existe tokenizador o plantilla de chat, porque no es un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosted decision trees (XGBoost, `XGBClassifier`) |
| Parametros totales | no disponible (número de árboles variable por modelo; hasta 1.500 árboles por configuración) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija: ventana de 1.000 pb representada como 4.096 frecuencias de 6-meros) |
| Tipos de cuantizacion | no disponible (XGBoost usa precisión nativa de coma flotante; no hay cuantización publicada) |
| Idiomas soportados | no aplica (entrada genómica, no texto) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | binario nativo de XGBoost (`.ubj`); sin pickle; incluye `manifest.json` y `MANIFEST.sha256` |

## Arquitectura y entrenamiento

Cada modelo es un `XGBClassifier` de árboles impulsados por gradiente entrenado sobre características tabulares derivadas de la secuencia: frecuencias de 6-meros calculadas por `xgb_features.py`, que descarta ventanas que contienen bases `N`. El problema se plantea como clasificación binaria (cCRE del biosample frente a ventanas genómicas de fondo emparejadas por GC), con 4.096 características de entrada por ejemplo.

El ajuste se realizó mediante búsqueda aleatoria sobre 24 configuraciones, evaluadas únicamente en los cromosomas de validación (chr15-18) con la semilla 0, parada temprana sobre AUC de validación, hasta 1.500 árboles y paciencia de 50. El espacio de búsqueda cubrió `max_depth` en {4, 6, 8}, `learning_rate` en {0,05, 0,1}, `subsample` en {0,6, 0,8, 1,0}, `colsample_bytree` en {0,3, 0,5, 0,8}, `min_child_weight` en {1, 5, 10} y `reg_lambda` en {1, 5, 20}. Las configuraciones seleccionadas fueron: T cell (depth 6, lr 0,05, subsample 0,6, colsample 0,3, min_child_weight 10, lambda 1); K562 (depth 6, lr 0,05, subsample 1,0, colsample 0,3, min_child_weight 5, lambda 20); GM12878 (depth 8, lr 0,05, subsample 1,0, colsample 0,3, min_child_weight 1, lambda 20). El particionado es train chr1-14, X, Y; validación chr15-18; test chr19-22, sin uso de los cromosomas de test en la selección.

El autor advierte que la búsqueda quedó truncada: las configuraciones elegidas se sitúan en el borde del espacio explorado (learning rate y colsample más bajos probados, lambda más alto en dos biosamples) y la mejor iteración fue 1.369-1.499 sobre el tope de 1.500 árboles, por lo que los modelos probablemente siguen ligeramente subajustados. Solo se ajustó k=6 y la búsqueda usó una única semilla, con diferencias de validación entre configuraciones de apenas 0,005-0,007.

## Capacidades

- Clasificación binaria de ventanas genómicas de 1.000 pb como cCRE (PLS, pELS o dELS) de un biosample concreto, frente a fondo genómico emparejado por GC.
- Extracción de características de secuencia mediante frecuencias de 6-meros (4.096 dimensiones), con omisión de ventanas que contienen `N`.
- Modelos específicos por biosample: `tcell`, `k562` y `gm12878`, cada uno con cinco semillas para estimar la variabilidad.
- Evaluación complementaria en subconjunto emparejado por GC y por CpG observado/esperado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo de pensamiento, visión o audio.
- No es un modelo de lenguaje: no hay tokenizador, plantilla de chat ni API conversacional.

## Casos de uso

- Baseline de referencia en investigación de elementos reguladores: usar los tres modelos como cota inferior de rendimiento antes de entrenar CNN o transformers de secuencia, comparando AUROC en los mismos cromosomas de test (chr19-22).
- Clasificación rápida de candidatos cCRE en un biosample concreto: cargar `weights/k562/seed0.ubj`, calcular frecuencias de 6-meros con `kmer_features` y obtener probabilidades para cribar ventanas antes de análisis más costosos.
- Control de sesgos de composición en pipelines de genómica: el subconjunto emparejado por GC y CpG permite medir cuánto del rendimiento depende de atajos composicionales frente a señal reguladora real.
- Reproducibilidad y auditoría de experimentos: el `manifest.json` con SHA-256, hiperparámetros, iteración óptima y AUROC de validación/test permite verificar que una nueva ejecución reproduce los resultados publicados.
- Enseñanza y prototipado de clasificación tabular en bioinformática: el ejemplo mínimo del README (cargar modelo y predecir sobre `"ACGT" * 250`) sirve como plantilla para introducir features de k-meros y boosting en cursos o talleres.
- Estimación de incertidumbre por semilla: ejecutar las cinco semillas y reportar la dispersión (desviaciones típicas de 0,0003-0,0012 en AUROC) para cuantificar la estabilidad del baseline antes de compararlo con modelos neuronales.
- Filtrado previo en estudios de variantes o anotación funcional: usar la probabilidad de cCRE como señal auxiliar para priorizar regiones en análisis exploratorios, siempre fuera de uso clínico.

## Benchmarks y rendimiento

Resultados en cromosomas de test (media de 5 semillas; desviación típica entre paréntesis). "Matched" es el subconjunto emparejado por GC y CpG observado/esperado, con igual número de positivos y negativos por bin; no es comparable con el AUROC de la tarea completa.

| Biosample | Test AUROC | Matched AUROC | Default sin ajustar (mismo código) |
|:--|--:|--:|--:|
| tcell | 0,8894 (0,0003) | 0,7431 (0,0012) | 0,8845 / 0,7347 |
| k562 | 0,8695 (0,0004) | 0,7686 (0,0011) | 0,8636 / 0,7614 |
| gm12878 | 0,8429 (0,0008) | 0,7526 (0,0011) | 0,8350 / 0,7452 |

Frente a las CNN ajustadas de `PxALabs/irg-cnn-baselines`, estos modelos están a la par en T cell y K562 y ligeramente por detrás en GM12878 (ShallowCNN +0,004 en tarea completa y +0,012 en matched).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer, e incluso en CPU para lotes moderados.
- GPU recomendadas: no se especifican; el entrenamiento original se ejecutó con XGBoost sobre GPU (kernel de Kaggle `purvanshj009/irg-09-xgb-tuned` v2). Para inferencia, cualquier GPU con soporte de XGBoost (por ejemplo, RTX 3060 o superior) es suficiente.
- Cabe en GPU consumer: sí, sin restricciones prácticas dado el tamaño del artefacto.
- Opciones de despliegue: `xgboost` (Python) con `XGBClassifier.load_model` sobre archivos `.ubj`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Test AUROC (referencia) | Licencia | Disponibilidad |
|:--|:--|:--|:--|:--|:--|
| `PxALabs/irg-xgboost-baselines` | XGBoost sobre frecuencias de 6-meros | 4.096 features tabulares | tcell 0,8894; k562 0,8695; gm12878 0,8429 | other | Hugging Face, 0,1 GB |
| `PxALabs/irg-cnn-baselines` | CNN sobre secuencia (ShallowCNN y variantes) | Secuencia de 1.000 pb | A la par en T cell y K562; +0,004 en GM12878 (tarea completa) | no disponible | Hugging Face |
| Default XGBoost sin ajustar (mismo código) | XGBoost con hiperparámetros por defecto | 4.096 features tabulares | tcell 0,8845; k562 0,8636; gm12878 0,8350 | no aplica (referencia interna) | No guardado según el autor |

## Limitaciones y advertencias

- Modelos de referencia para clasificación de cCRE basada en secuencia; no aptos para uso clínico ni para predicción de efectos de variantes.
- Cada modelo es específico del biosample con el que se entrenó; no se cubre el uso cruzado entre biosamples.
- Los negativos son ventanas genómicas emparejadas por GC fuera de los cCRE del biosample, no elementos no reguladores validados experimentalmente.
- La búsqueda de hiperparámetros quedó truncada: configuraciones en el borde del espacio y mejor iteración cerca del tope de 1.500 árboles, lo que sugiere subajuste residual.
- Solo se ajustó k=6; la búsqueda usó una única semilla y las diferencias de validación entre configuraciones fueron pequeñas (0,005-0,007).
- Los atajos de composición (GC, CpG) solo se controlan en la evaluación matched; el contenido repetitivo no se controla en el entrenamiento.
- Los modelos de comparación sin ajustar no se guardaron, por lo que no son reproducibles directamente.
- Nota de datos: las tablas antiguas del proyecto etiquetadas como `k562_*` correspondían en realidad a elementos de T cell; estos modelos usan las tablas corregidas v2.1.
- Licencia "other": no se detallan términos de uso comercial en la información disponible; debe consultarse el repositorio de GitHub antes de cualquier uso en producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en la clasificación, especialmente en regiones con composición similar al fondo de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/PxALabs/irg-xgboost-baselines
- Repositorio GitHub del proyecto: https://github.com/PxA-Labs/interpretable-regulatory-genomics
- Análisis completo y caveats: `docs/results/xgb_tuned.md` dentro del repositorio GitHub
- Dataset de entrenamiento: https://huggingface.co/datasets/PxALabs/encode-regulatory-elements (versión v2.1, tablas `*_gc_matched`)
- Baseline CNN comparativo: https://huggingface.co/PxALabs/irg-cnn-baselines
- Kernel de origen del entrenamiento: `purvanshj009/irg-09-xgb-tuned` v2 en Kaggle (git `ff83f8f`)
