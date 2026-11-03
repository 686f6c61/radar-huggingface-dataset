# bl3016/kcat-km-esm2-rdkit

## Resumen

`bl3016/kcat-km-esm2-rdkit` es un modelo de regresion supervisada para predecir parametros cineticos de enzimas: la constante catalitica `kcat` y la constante de Michaelis `Km`. Dado un par enzima-sustrato (secuencia proteica en formato FASTA y sustrato en SMILES), el modelo devuelve dos valores en escala logaritmica (`log10_kcat` y `log10_km`). Lo desarrolla el usuario `bl3016` y se publica bajo licencia MIT con el objetivo declarado de participar en una competicion de tipo leaderboard (tags `leak-curber`, `kcat`, `km`, `leaderboard`).

Tecnicamente no es un modelo generativo ni un LLM, sino un ensamblado de diez perceptrones multicapa de dos torres ("two-tower MLP") que combinan caracteristicas congeladas de una proteina y de un compuesto quimico. La torre enzimatica usa `facebook/esm2_t12_35M_UR50D` congelado (35M parametros, embeddings de 480 dimensiones tras mean-pooling). La torre del sustrato usa descriptores 2D de RDKit: 217 descriptores calculados, un fingerprint Morgan de radio 2 con 2.048 bits y 167 claves MACCS, en total 2.432 dimensiones.

Es relevante para el nicho de biocatalisis y diseno de enzimas porque ofrece una linea base reproducible, ejecutable en CPU y con todas las dependencias empaquetadas (incluido ESM-2), para estimar parametros cineticos sin laboratorio. El repo ocupa 0,2 GB y el modelo esta pensado para inferencia sobre tablas Parquet de pares enzima-sustrato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Two-tower MLP (ensamblado de 10 redes) sobre caracteristicas congeladas de ESM-2 35M y descriptores RDKit |
| Parametros totales | No disponible de forma agregada; ESM-2 35M congelado (aprox. 35M) mas cabezas MLP y coeficientes ridge (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto generativo; las secuencias de mas de 1.022 residuos se dividen en ventanas y se promedian ponderadas por longitud |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | No disponible (modelo no linguistico; entrada FASTA/SMILES) |
| Licencia | MIT |
| Formato de pesos | Safetensors (`heads.pt`, `stats.npz`, `config.json` y ESM-2 en `weights/`) |

## Arquitectura y entrenamiento

El modelo combina dos representaciones fijas. Para la enzima se usa ESM-2 35M (`esm2_t12_35M_UR50D`) congelado, con mean-pooling de la ultima capa sobre los residuos, lo que produce un vector de 480 dimensiones; las secuencias de mas de 1.022 residuos se parten en ventanas y sus medias se promedian ponderadas por longitud. Para el sustrato se calculan 217 descriptores 2D de RDKit (con logaritmo con signo), un fingerprint Morgan de radio 2 con 2.048 bits (transformacion `log1p`) y 167 claves MACCS, sumando 2.432 dimensiones. Cada caracteristica se estandariza con las estadisticas del conjunto de entrenamiento y se recorta a ±10.

Sobre esas caracteristicas se entrena una red de dos torres: la torre enzimatica proyecta a 256 dimensiones y la del sustrato a 256 (activacion GELU, dropout), y una cabeza recibe la concatenacion `[p, s, p⊙s]` y pasa por una capa de 256 unidades hasta dos salidas. El entrenamiento usa MSE conjunto sobre objetivos estandarizados, AdamW con `lr 3e-4`, scheduler one-cycle y `batch 256`. Se entrenan diez redes (dos configuraciones de regularizacion por cinco semillas) y se promedian, mezclando 0,7/0,3 con una regresion ridge sobre las mismas caracteristicas. Las dos configuraciones son: input dropout 0,3, weight decay 0,05 y 20 epocas; e input dropout 0,5, weight decay 0,1 y 30 epocas, ambas con hidden dropout 0,5. El entrenamiento se hizo solo con `train.parquet`.

La validacion se diseno para evitar fuga por homologia: las enzimas de validacion comparten como maximo ~30-50% de identidad de secuencia con las de entrenamiento (mediana del mejor hit MMseqs2 del 32%). La seleccion de modelo uso validacion cruzada de 5 folds agrupada por clusters MMseqs2 al 30% de identidad, con un perfil de identidad equivalente (mediana del mejor hit del 31%).

## Capacidades

- Regresion de `log10_kcat` y `log10_km` para pares enzima-sustrato.
- Featurizacion de proteinas mediante ESM-2 35M congelado con pooling por ventanas para secuencias largas.
- Featurizacion quimica de sustratos a partir de SMILES con RDKit (descriptores 2D, Morgan r=2 y MACCS).
- Inferencia en CPU con todas las dependencias empaquetadas y sin acceso a red.
- Procesamiento por lotes de tablas Parquet con deduplicacion de secuencias y SMILES.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Priorizacion de sustratos en biocatalisis: dado un panel de enzimas y una libreria de sustratos en SMILES, generar una tabla de `kcat`/`Km` predichos para ordenar que combinaciones merece la pena ensayar en laboratorio.
- Filtrado de variantes de enzima: introducir mutantes de una secuencia y comparar la `kcat` predicha frente a la del enzima salvaje para descartar candidatos antes de expresion y purificacion.
- Enriquecimiento de bases de datos cineticas: rellenar huecos en tablas tipo BRENDA con predicciones marcadas como estimaciones, usando el modelo como generador de valores previos.
- Diseno de rutas metabolicas: estimar la `Km` de enzimas candidatas frente a metabolitos endogenos para evaluar la viabilidad de una ruta antes de modelar flujos metabolicos.
- Analisis de relaciones estructura-actividad en sustratos: al usar fingerprints Morgan y MACCS, permite explorar como varian las predicciones al modificar grupos funcionales del sustrato.
- Linea base reproducible en investigacion: al ejecutarse en CPU con 1,2 GB de memoria y ~100 s para 1.901 filas en 2 nucleos, sirve como referencia barata en estudios de aprendizaje automatico aplicado a enzimologia.
- Evaluacion comparativa en leaderboards: el etiquetado `leak-curber` y la validacion agrupada por identidad lo hacen util como punto de partida metodologico en competiciones de prediccion cinetica.

## Benchmarks y rendimiento

Resultados de validacion cruzada agrupada por clusters MMseqs2 al 30% de identidad, agrupados sobre los cinco folds de retencion (datos de la model card):

| Modelo | SCC medio | SCC kcat | SCC Km | RMSE kcat | RMSE Km |
|---|---|---|---|---|---|
| Ridge baseline inicial | 0,381 | 0,253 | 0,510 | no disponible | no disponible |
| Ridge con ESM-2 35M + RDKit | 0,479 | 0,350 | 0,607 | 1,413 | 1,025 |
| Two-tower MLP, 1 semilla | 0,491 | 0,358 | 0,623 | 1,418 | 1,008 |
| Este modelo (ensamblado + ridge) | 0,498 | 0,368 | 0,628 | 1,406 | 1,002 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU: ~1,2 GB de memoria y unos 100 s para 1.901 filas en 2 nucleos (dato de la model card).
- VRAM estimada para GPU: no disponible; el modelo esta disenado para CPU y el repo ocupa 0,2 GB, por lo que cabria holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: no se especifican; el entrenamiento usa GPU si esta disponible y, en caso contrario, CPU.
- Cabe en GPU consumer: si, por tamano del repo (0,2 GB), aunque no se documenta el rendimiento en GPU.
- Opciones de despliegue: scripts propios `predict.py` y `train.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~100 s por 1.901 filas en 2 nucleos de CPU; no se documenta throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bl3016/kcat-km-esm2-rdkit` | Two-tower MLP sobre ESM-2 35M + RDKit | ESM-2 35M congelado + cabezas | No aplica | SCC medio 0,498 en validacion agrupada | MIT | HuggingFace |
| Ridge con ESM-2 35M + RDKit (misma model card) | Regresion lineal | ESM-2 35M congelado | No aplica | SCC medio 0,479 | No disponible | Referencia interna |
| Two-tower MLP, 1 semilla (misma model card) | MLP | ESM-2 35M congelado | No aplica | SCC medio 0,491 | No disponible | Referencia interna |
| Otros modelos de prediccion de kcat/Km | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos externos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con `train.parquet`; no se documenta el tamano ni la composicion del conjunto de entrenamiento.
- Validacion interna con identidad de secuencia limitada (~30-50% respecto a entrenamiento), lo que puede sobreestimar el rendimiento en enzimas muy alejadas del conjunto de entrenamiento.
- Predice valores en escala logaritmica; la transformacion inversa introduce error asimetrico y no se documentan intervalos de incertidumbre.
- La torre enzimatica usa ESM-2 35M congelado: no se ajusta la representacion proteica, lo que limita la adaptacion a familias enzimaticas poco representadas.
- Las secuencias de mas de 1.022 residuos se truncan por ventanas con promedio ponderado, lo que puede perder informacion de dominios cataliticos en proteinas largas.
- La featurizacion del sustrato depende de RDKit; SMILES invalidos o estructuras no soportadas no se documentan como caso controlado.
- No es un modelo generativo ni linguistico: no soporta texto, codigo, vision ni tool calling.
- Licencia MIT, permisiva para uso comercial, pero sin garantias explicitas de idoneidad para decisiones experimentales.
- Riesgo de alucinacion en el sentido de predicciones plausibles pero incorrectas: no se documenta calibracion fuera del dominio de entrenamiento.
- No se documentan sesgos de composicion quimica ni de familias enzimaticas.

## Enlaces

- HuggingFace: https://huggingface.co/bl3016/kcat-km-esm2-rdkit
- ESM-2 35M (dependencia): https://huggingface.co/facebook/esm2_t12_35M_UR50D
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion disponible.
