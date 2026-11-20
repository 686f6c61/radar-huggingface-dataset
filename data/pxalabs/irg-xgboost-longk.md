# PxALabs/irg-xgboost-longk

## Resumen

IRG XGBoost on longer and spaced k-mers (notebook 15) es un conjunto de 21 clasificadores de gradiente boosting (XGBoost) desarrollados por PxALabs para predecir si una ventana genomica de 1.000 pares de bases corresponde a un elemento regulador cis candidato (cCRE: PLS, pELS o dELS) de un biosample concreto de ENCODE, frente a un fondo genomico emparejado por contenido GC. El objetivo del trabajo es comprobar si caracteristicas basadas en k-mers mas largos (8-mers) o con huecos (spaced k-mers de peso 6) pueden reproducir la pequena ventaja que mostraban las CNN sobre los modelos de 6-mers en GM12878.

El resultado es negativo: los modelos con k8 y spaced son menos precisos que los modelos de 6-mers del repositorio `PxALabs/irg-xgboost-wide`, y no alcanzan a las CNN. Los autores publican el artefacto como resultado negativo documentado, no como modelo recomendado para uso productivo. No interviene ningun modelo preentrenado ni modelo de lenguaje: son clasificadores tabulares sobre caracteristicas dispersas de frecuencias de k-mers.

El repositorio ocupa 0,5 GB e incluye los binarios nativos de XGBoost (formato `.ubj`, sin pickle), el codigo de extraccion de caracteristicas y las tablas de resultados con manifiesto SHA-256. La relevancia es metodologica: documenta con rigor que parte de la ventaja de las CNN en esta tarea no se recupera con ingenieria de caracteristicas de k-mers mas expresiva, y cuantifica cuanto del deficit es atribuible al pipeline y no a las caracteristicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de arboles (XGBoost, `XGBClassifier`) |
| Parametros totales | no disponible (no aplica; modelos de arboles, hasta 6.000 arboles por modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de ventanas de 1.000 pb de ADN |
| Tipos de cuantizacion | no disponible (no aplica a XGBoost en este formato) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada de secuencia de ADN) |
| Licencia | other |
| Formato de pesos | binario nativo de XGBoost `.ubj` (no pickle) |

## Arquitectura y entrenamiento

Cada modelo es un `XGBClassifier` entrenado sobre caracteristicas dispersas en formato CSR construidas a partir de la secuencia: `k8` usa frecuencias de 8-mers (65.536 caracteristicas dispersas) y `spaced` usa tres conjuntos de k-mers con huecos de peso 6 (desplazamientos 0,1,3,4,6,7 / 0,1,4,6,7,8 / 0,2,3,5,6,8; 3 x 4.096 caracteristicas dispersas). Los k-mers ausentes se representan como ceros en CSR y XGBoost los trata como valores faltantes. Se incluye un control `k6_ctrl` con frecuencias de 6-mers procesadas por el mismo pipeline disperso, para separar el efecto de las caracteristicas del efecto del pipeline.

Los datos y la particion son los mismos que en los notebooks 07-14 del proyecto: entrenamiento en cromosomas chr1-14, X e Y; validacion en chr15-18; test en chr19-22. Por biosample (tcell, k562, gm12878) y conjunto de caracteristicas se probaron dos configuraciones: la seleccionada en el notebook 11 (C0) y la misma con `colsample_bytree` reducido a la mitad (C1); se eligio la de mejor AUROC en validacion, sin usar cromosomas de test para la seleccion. Hiperparametros: hasta 6.000 arboles, parada temprana de 100, `max_bin` 64. El entrenamiento se ejecuto en GPU con XGBoost 3.4.1 en el kernel de Kaggle `purvanshj009/irg-15-longk-xgb` v2. Se generaron tres semillas (0-2) por combinacion, salvo en `k6_ctrl` (solo semilla 0).

## Capacidades

- Clasificacion binaria tabular: predice si una ventana de 1.000 pb es un cCRE del biosample correspondiente frente a fondo genomico emparejado por GC.
- Extraccion de caracteristicas de secuencia de ADN mediante `longk_features.py` (`sparse_feats`, `MASKS`), con soporte para 8-mers y k-mers con huecos.
- Salida de probabilidad calibrada por modelo (`predict_proba`) y ensemble por media de probabilidades entre semillas.
- Especificidad por biosample: hay modelos separados para tcell, k562 y gm12878.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No es un modelo generativo ni un modelo de lenguaje.

## Casos de uso

- Reproduccion de un resultado negativo: sirve como referencia para verificar que la ingenieria de caracteristicas con k-mers largos o con huecos no recupera la ventaja de las CNN en la prediccion de cCRE, usando los binarios `.ubj` y las tablas de `results/`.
- Baseline metodologico en articulos de genomica regulatoria: los modelos de 6-mers de `PxALabs/irg-xgboost-wide` son la referencia recomendada; estos modelos documentan el limite de extender esa familia de caracteristicas.
- Auditoria de pipelines de caracteristicas: el control `k6_ctrl` permite medir cuanto del deficit de AUROC proviene del pipeline disperso (0,0015-0,0047 en el test completo con semilla 0) frente a las caracteristicas nuevas.
- Docencia y formacion en evaluacion rigurosa: el repositorio ilustra particion por cromosomas, seleccion en validacion, ensemble de semillas e intervalos de confianza sobre el ruido de muestreo del test.
- Analisis de sensibilidad a la representacion de secuencia: comparar frecuencias de 8-mers frente a k-mers con huecos de peso 6 sobre el mismo conjunto de datos y particion.
- Verificacion de integridad de artefactos: el manifiesto `MANIFEST.sha256` permite validar los 21 ficheros de modelo antes de reutilizarlos en experimentos.

## Benchmarks y rendimiento

AUROC en cromosomas de test, ensemble de la probabilidad promediada sobre 3 semillas (fuente: model card del autor):

| Biosample | 6-mer (nb11) completo / emparejado | k8 completo / emparejado | spaced completo / emparejado |
|:--|--:|--:|--:|
| tcell | 0,893 / 0,749 | 0,879 / 0,740 | 0,881 / 0,714 |
| k562 | 0,873 / 0,776 | 0,858 / 0,762 | 0,856 / 0,740 |
| gm12878 | 0,848 / 0,760 | 0,839 / 0,753 | 0,838 / 0,739 |

"Emparejado" designa el subconjunto de test emparejado por GC y CpG observado/esperado, con igual numero de positivos y negativos por bin; no es comparable con el AUROC de la tarea completa. Frente a las CNN del notebook 07 en GM12878 (emparejado), el modelo k8 seleccionado en validacion queda 0,018 por detras de ShallowCNN (IC 95% +0,012 a +0,024) y 0,025 por detras de AttnCNN (+0,019 a +0,031). Los AUROC proceden de la propia ejecucion de entrenamiento; no se ha realizado todavia la rescoring sobre las filas de test fuera de esa ejecucion.

## Requisitos de hardware

- Inferencia en CPU: los modelos de arboles con `max_bin` 64 y hasta 6.000 arboles son ligeros; el repositorio completo ocupa 0,5 GB, por lo que caben en memoria RAM de cualquier portatil convencional.
- VRAM: no se requiere GPU para inferencia; el entrenamiento se ejecuto en GPU (XGBoost 3.4.1, kernel de Kaggle), pero no se especifica el modelo de GPU utilizado.
- GPU recomendadas: no disponible; para reentrenamiento, cualquier GPU compatible con XGBoost GPU es suficiente segun el autor, sin datos concretos de modelo.
- Cabe en GPU de consumo: si, para inferencia no es necesaria; para entrenamiento, el autor no detalla requisitos.
- Despliegue: carga directa con `xgboost.XGBClassifier().load_model()` sobre ficheros `.ubj`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Caracteristicas | AUROC test GM12878 (emparejado) | Licencia | Disponibilidad |
|:--|:--|:--|--:|:--|:--|
| `PxALabs/irg-xgboost-wide` (6-mers) | XGBoost | 6-mer denso | 0,760 (referencia del proyecto) | other | Hugging Face |
| IRG XGBoost longk (k8) | XGBoost | 8-mer disperso, 65.536 | 0,753 | other | Hugging Face |
| IRG XGBoost longk (spaced) | XGBoost | k-mers con huecos peso 6 | 0,739 | other | Hugging Face |
| ShallowCNN (notebook 07) | CNN | secuencia cruda | +0,018 sobre k8 (IC 95% +0,012 a +0,024) | no disponible | repositorio del proyecto |
| AttnCNN (notebook 07) | CNN con atencion | secuencia cruda | +0,025 sobre k8 (IC 95% +0,019 a +0,031) | no disponible | repositorio del proyecto |

## Limitaciones y advertencias

- Resultado negativo documentado: los modelos k8 y spaced son menos precisos que los de 6-mers del proyecto; no se recomiendan como modelos de referencia.
- Uso previsto exclusivamente de investigacion; no apto para uso clinico ni para prediccion de efectos de variantes.
- Cada modelo es especifico del biosample con el que se entreno; no generaliza entre tcell, k562 y gm12878.
- Los negativos son ventanas genomicas emparejadas por GC fuera de los cCRE del biosample, no elementos no reguladores validados.
- Solo se probaron dos conjuntos de caracteristicas y una busqueda de dos configuraciones; no demuestra que ningun modelo de k-mers pueda igualar a la CNN.
- Parte del deficit de k8/spaced es atribuible al pipeline: los `k6_ctrl` quedan 0,0015-0,0047 por debajo de los modelos densos de 6-mers del notebook 11 en el test completo (semilla 0).
- Solo tres semillas y cuatro cromosomas de test; los intervalos cubren unicamente el ruido de muestreo del test.
- Los AUROC publicados provienen de la ejecucion de entrenamiento; falta la rescoring sobre las filas de test fuera de esa ejecucion, ya realizada en `irg-xgboost-wide`.
- Nota de datos: las tablas antiguas del proyecto etiquetadas `k562_*` correspondian en realidad a elementos de celulas T; estos modelos usan las tablas corregidas v2.1.
- Licencia "other": no se detallan en la informacion disponible las condiciones para uso comercial; debe consultarse el repositorio del proyecto.
- Riesgo de alucinacion: no aplica (modelo discriminativo, no generativo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PxALabs/irg-xgboost-wide (modelo de referencia recomendado por el autor)
- Modelo en Hugging Face: https://huggingface.co/PxALabs/irg-xgboost-longk
- Repositorio del proyecto: https://github.com/PxA-Labs/interpretable-regulatory-genomics
- Analisis y caveats: `docs/results/longk_xgb.md` en el repositorio del proyecto
- Kernel de Kaggle de entrenamiento: `purvanshj009/irg-15-longk-xgb` (v2)
- Kernel de Kaggle de subida: `irg-15b-push-longk-to-hf`
- Dataset: https://huggingface.co/datasets/PxALabs/encode-regulatory-elements
