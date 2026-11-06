# BurnyCoder/neurogeom-shape-fitter-main-s0

## Resumen

`neurogeom-shape-fitter-main-s0` es un modelo de clasificación y ajuste geométrico de nubes de puntos 3D desarrollado por Libor "Burny" Burian (BurnyCoder) en el contexto de investigación en interpretabilidad mecanicista de modelos de lenguaje. No es un modelo generativo de texto: es un Set Transformer entrenado exclusivamente con formas sintéticas que recibe como entrada las tres coordenadas principales de un PCA aplicado a un conjunto de activaciones neuronales y devuelve una de 13 familias geométricas junto con los parámetros que describen la forma de manera única.

El problema que aborda es la caracterización de la geometría de las representaciones internas de redes neuronales. En lugar de asumir una forma concreta (por ejemplo, que las activaciones forman una variedad lineal o una curva), el modelo permite seleccionar entre familias como blob, clusters, polytope, línea, arco/círculo, elipse, hélice, curva con ringing de PCA, disco, esfera, paraboloide, cono/tronco de cono y toro. Su relevancia radica en que sistematiza y automatiza una parte del análisis exploratorio que en interpretabilidad se hace habitualmente a mano o con ajustes clásicos.

El modelo es extremadamente compacto (1.712.093 parámetros, 2,26 MB en disco) y está liberado bajo licencia MIT. La model card reporta una precisión del 87,9 % en el conjunto de test sintético y ventajas estadísticamente significativas frente a líneas base clásicas, aunque el resultado preregistrado sobre activaciones reales (H3) no alcanza significación estadística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Set Transformer |
| Parametros totales | 1.712.093 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `final.pt` (PyTorch); repositorio de 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un Set Transformer, es decir, un transformer con atención sobre conjuntos permutación-invariante, adecuado para procesar nubes de puntos sin orden canónico. La entrada es una nube 3D construida a partir de las tres coordenadas principales de un PCA aplicado a un conjunto de activaciones de dimensión D; la salida es una distribución sobre 13 familias de formas más un vector de parámetros por familia. El modelo incorpora un paso de refinamiento cuyos efectos se evalúan en la hipótesis H5b.

El entrenamiento se realizó únicamente con formas sintéticas. El resumen de entrenamiento reportado indica 22.643 pasos completados en 110,01 minutos, con reanudación desde el paso 10.000, una precisión de validación de 0,9018 y un Chamfer distance de validación respecto al profesor de 0,2107. La calibración se ajustó con una temperatura de 0,772, que reduce el ECE de 0,044 a 0,022 y la NLL de 0,397 a 0,373. No se reporta en la información disponible el número de tokens ni la composición exacta del dataset sintético más allá de las 13 familias y del tamaño del conjunto de test (39.000 nubes).

## Capacidades

- Clasificación de nubes de puntos 3D en una de 13 familias geométricas: blob, clusters, polytope, línea, arco/círculo, elipse, hélice, curva con ringing de PCA, disco, esfera, paraboloide, cono/tronco de cono y toro.
- Regresión de parámetros que especifican de forma única la forma ajustada dentro de la familia seleccionada.
- Refinamiento del ajuste tras la clasificación (evaluado en H5b_refinement).
- Calibración de probabilidades mediante temperatura (T = 0,772).
- Procesamiento de conjuntos permutación-invariantes mediante atención de conjunto.
- Integración con el paquete `neurogeom` para cargar el modelo, ajustar nubes y describir el ajuste.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Análisis de geometría de activaciones en interpretabilidad mecanicista: dado un conjunto de activaciones extraídas de una capa de un LLM, se proyectan a 3 componentes PCA y se pasa la nube al modelo para obtener una hipótesis sobre la familia geométrica subyacente (curva, superficie, etc.) de forma automática.
- Detección de estructuras tipo hélice o anillo: útil para identificar representaciones cíclicas (por ejemplo, codificaciones de posiciones o de magnitudes periódicas) frente a estructuras lineales.
- Control de calidad de experimentos de interpretabilidad: el modelo permite contrastar si una nube de activaciones se desvía de un comportamiento gaussiano, ya que los controles con gaussianas de covarianza emparejada se etiquetan como blob el 86 % de las veces.
- Generación de informes reproducibles: la función `describe_fit` produce una descripción textual del ajuste, lo que facilita incorporar resultados geométricos a cuadernos y publicaciones.
- Filtrado previo de candidatos: al seleccionar la familia por clasificador en lugar de por AIC geométrico se obtiene una precisión del 87,4 % frente al 64,6 % del AIC, por lo que el modelo sirve como paso de selección antes de ajustes paramétricos finos.
- Investigación metodológica sobre ajuste de formas: el modelo y sus líneas base (B1 clásico, B2 con boosting) permiten reproducir los experimentos preregistrados del paper y extenderlos a nuevos conjuntos de activaciones.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado |
|---|---|
| Test sintetico (39.000 nubes, 13 familias), exactitud de familia | 87,9 % [87,6; 88,2] |
| Chamfer distance mediana al ground truth (unidades RMS-radius) | 0,156 |
| Misma muestra de 3.120 nubes: metodo propuesto | 87,4 % [86,2; 88,5] |
| Misma muestra: B2 features + boosting | 64,5 % [62,8; 66,2] |
| Misma muestra: B1 ajuste clasico + AIC geometrico | 52,2 % [50,6; 54,0] |
| Misma muestra: lineas base triviales | 7,7-7,9 % |
| H1 (macro-F1 metodo - B1) | 0,3741 [0,3579; 0,3903], Holm p < 1e-16 |
| H2 (Chamfer mediana metodo - B1) | -0,0554 [-0,0645; -0,0462], Holm p < 1e-16 |
| H5b_refinement (Chamfer mediana con - sin refinamiento) | -0,0033 [-0,0046; -0,0021], Holm p < 1e-16 |
| Seleccion por AIC geometrico en lugar de clasificador | 64,6 % [64,1; 65,1] |
| Calibracion (T = 0,772): ECE | 0,044 -> 0,022 |
| Calibracion (T = 0,772): NLL | 0,397 -> 0,373 |
| H3, activaciones reales (12 datasets preregistrados) | 7/12 coincidencias, IC 95 % exacto 28-85 %, p = 0,125: no soportada |
| H4, controles: gaussianas de covarianza emparejada etiquetadas blob | 86 % |
| H4, controles: procesos ordinales etiquetados ringing vs helix | 60 % vs 40 %: soportada |
| Post hoc: procesos gaussianos suaves etiquetados helix | 80 % |
| Post hoc: random walks etiquetados helix | 0 % |
| Validacion durante entrenamiento (val_acc) | 0,9018 |
| Chamfer de validacion respecto al profesor | 0,2107 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 1.712.093 parámetros en precisión completa (unos 6,8 MB en fp32) y el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo cabe holgadamente en tarjetas de gama de entrada.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso es viable en CPU.
- Opciones de despliegue: PyTorch nativo mediante `neurogeom.train.loop.load_model` y `neurogeom.infer.predict.fit_cloud`; no se reportan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un LLM.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo requirió 110 minutos para 22.643 pasos, lo que sugiere un coste de inferencia muy bajo por nube.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neurogeom-shape-fitter-main-s0 | 1.712.093 | no aplica | 87,9 % exactitud en test sintetico | MIT | Hugging Face + GitHub |
| B1 (ajuste clasico + AIC geometrico) | no aplica (no neuronal) | no aplica | 52,2 % en la muestra comun | no disponible | implementacion en el repo del autor |
| B2 (features + boosting) | no disponible | no aplica | 64,5 % en la muestra comun | no disponible | implementacion en el repo del autor |
| Lineas base triviales | no aplica | no aplica | 7,7-7,9 % | no disponible | implementacion en el repo del autor |

No se identifican en la información disponible otros modelos publicados de clasificación de formas sobre nubes de activaciones con los que comparar directamente.

## Limitaciones y advertencias

- El modelo describe la forma de la proyección top-3 del PCA, no la variedad intrínseca de las activaciones; los resultados no deben interpretarse como geometría del espacio latente completo.
- La hipótesis H3 sobre activaciones reales no alcanzó significación estadística (7/12 coincidencias, p = 0,125); el autor remite al paper para el análisis de fallos en activaciones reales.
- Entrenado solo con formas sintéticas: puede presentar degradación ante distribuciones de activaciones muy alejadas de las sintéticas.
- Los procesos gaussianos suaves se etiquetan como hélice el 80 % de las veces, lo que indica confusión entre estructuras suaves y helicoidales.
- Riesgo de sobreajuste a las 13 familias predefinidas: formas que no encajen en ninguna se forzarán a la más cercana.
- No procesa lenguaje, no soporta tool calling ni agentes; no debe emplearse fuera de su dominio geométrico.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales reportadas.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.
- No se reportan sesgos demográficos ni de otro tipo, al no tratar datos humanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/neurogeom-shape-fitter-main-s0
- Repositorio de código, preregistro e informes: https://github.com/BurnyCoder/geometrical-shape-fitting-in-llm-mechanistic-interpretability
- Paper (`paper.pdf` en el repositorio del modelo): https://huggingface.co/BurnyCoder/neurogeom-shape-fitter-main-s0
- Explorador interactivo de ajustes reales y sintéticos: https://burnycoder.github.io/geometrical-shape-fitting-in-llm-mechanistic-interpretability/
