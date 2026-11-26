# deinal/njord-global-models

## Resumen

Njord global models es una coleccion de checkpoints preentrenados para la prediccion global de la dinamica oceanica, desarrollada por el autor deinal y publicada bajo licencia MIT. El repositorio contiene dos familias de modelos: Njord (`graph_efm`), una red neuronal de grafos (GNN) probabilistica de variables latentes disenada para prediccion por ensembles, y SeaCast (`graph_fm`), una GNN jerarquica determinista. Ambos operan sobre mallas esfericas y pronostican el estado del oceano a un paso diario a partir de los dos estados oceanicos anteriores, incorporando forzamiento atmosferico.

El modelo predice 27 variables oceanicas: altura del nivel del mar (`zos`), concentracion y grosor del hielo marino (`siconc`, `sithick`) y temperatura, salinidad y componentes de velocidad (`thetao`, `so`, `uo`, `vo`) en seis niveles de profundidad (0, 47, 92, 222, 318 y 541 m). La arquitectura emplea una dimension oculta de 256 y, en el caso de Njord, seis capas de procesador sobre una malla de clusters esfericos k-means de tres niveles; SeaCast usa tres capas de procesador sobre una malla icosaedrica jerarquica de tres niveles con seis divisiones.

La relevancia de esta publicacion radica en que ofrece checkpoints listos para usar de un pipeline de entrenamiento en cuatro etapas (preentrenamiento a 1°, ajuste fino a 0,25° y dos etapas de ajuste sobre analisis con desenrollado temporal creciente), lo que facilita la reproducibilidad y la experimentacion en prediccion oceanica basada en aprendizaje profundo, un campo donde los modelos fundacionales geoespaciales estan cobrando peso frente a los sistemas numericos tradicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Neural Network (GNN); Njord: GNN probabilistica de variables latentes (`graph_efm`); SeaCast: GNN jerarquica determinista (`graph_fm`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 2 pasos temporales (dos estados oceanicos previos), paso diario |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento `bf16-mixed`) |
| Idiomas soportados | no aplica (modelo geoespacial, no linguistico) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`: `last.ckpt` y `min_val_loss.ckpt`) |

## Arquitectura y entrenamiento

Njord (`graph_efm`) es una GNN probabilistica de variables latentes que modela la incertidumbre mediante un objetivo ELBO con `kl_beta` ajustable, lo que permite generar ensembles de pronostico. Emplea seis capas de procesador, dimension oculta de 256 (con dimensiones separadas de 128 para la rejilla y los nodos de malla, y 32 para las aristas) y opera sobre una malla de clusters esfericos k-means de tres niveles con 20 refinamientos. SeaCast (`graph_fm`) es una variante determinista y jerarquica con tres capas de procesador sobre una malla icosaedrica jerarquica de tres niveles con seis divisiones. Ambos usan `input_steps 2` y forzamiento atmosferico (ERA5).

El entrenamiento se estructura en cuatro etapas por modelo. La etapa 1 preentrena a 1° sobre reanalisis con ERA5 (entrenamiento 1993-2021, validacion 2022); la etapa 2 ajusta a 0,25° sobre reanalisis; las etapas 3 y 4 ajustan sobre datos de analisis (entrenamiento 2023, validacion enero-junio de 2024) con desenrollado temporal de 2 y 7 pasos respectivamente. Para Njord, el preentrenamiento ejecuta tres subetapas (100 epocas de autoencoder con `kl_beta 0`, 200 epocas de ELBO a un paso con `kl_beta 0.1` y 25 epocas de ELBO desenrollado a 2 pasos) con learning rate coseno desde 1e-3; el ajuste fino usa calentamiento lineal de 5 epocas de 1e-5 a 1e-4 y decaimiento coseno, incluyendo una subetapa final con peso CRPS de 1e6. La funcion de perdida esta ponderada por latitud, con pesos de 0,5 para `zos`, `siconc` y `sithick` y de 0,17 para las variables por nivel de profundidad, con recorte de `siconc` a [0, 1] y `sithick` a valores no negativos. Los checkpoints finales son la ejecucion 9561 (Njord) y 7692 (SeaCast).

## Capacidades

- Pronostico global del oceano a un paso diario a partir de dos estados previos, con forzamiento atmosferico.
- Prediccion de 27 variables fisicas: nivel del mar, hielo marino y temperatura, salinidad y velocidades en seis profundidades.
- Prediccion probabilistica por ensembles (Njord, `graph_efm`) mediante variables latentes y objetivo ELBO.
- Prediccion determinista de alta resolucion (SeaCast, `graph_fm`).
- Desenrollado temporal multi-paso (hasta 7 pasos en la etapa final de ajuste).
- Operacion sobre mallas esfericas globales (clusters k-means o icosaedrica jerarquica) a resoluciones de 1° y 0,25°.
- No soporta tool calling, agentes ni capacidades linguisticas o multimodales; es un modelo cientifico de dominio especifico.

## Casos de uso

- Prediccion operativa del estado del oceano: generar pronosticos diarios globales de temperatura, salinidad y corrientes a 0,25° para alimentar sistemas de monitorizacion oceanica, aprovechando el ajuste fino sobre datos de analisis.
- Prediccion de hielo marino: estimar concentracion y grosor (`siconc`, `sithick`) con recorte fisico incorporado en la perdida, util para planificacion de rutas en latitudes polares.
- Ensembles de incertidumbre: usar la variante Njord (`graph_efm`) para generar multiples miembros de pronostico y cuantificar la incertidumbre en variables criticas como la temperatura superficial.
- Investigacion en modelizacion climatica: comparar el rendimiento de GNNs frente a modelos numericos de circulacion oceanica en experimentos de sensibilidad y validacion retrospectiva.
- Asimilacion y downscaling: emplear las etapas de ajuste a 0,25° como base para experimentos de superresolucion de campos oceanicos a partir de reanalisis de menor resolucion.
- Docencia y prototipado: partir de checkpoints preentrenados para experimentar con arquitecturas GNN en mallas esfericas sin entrenar desde cero, dado el pipeline reproducible de cuatro etapas.
- Acoplamiento con modelos atmosfericos: integrar las predicciones oceanicas como entrada en sistemas acoplados oceano-atmosfera para estudios de interaccion a escala diaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (RMSE, ACC, CRPS u otras) ni comparaciones numericas con sistemas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 2,6 GB, lo que da una cota superior aproximada del peso de los checkpoints, pero no se detalla el consumo en inferencia.
- GPU recomendadas: no disponible de forma explicita; el entrenamiento documentado usa `precision bf16-mixed` y configuraciones multi-nodo (8 nodos para preentrenamiento, 16 para ajuste fino), lo que sugiere GPUs de datacenter (A100/H100) para entrenamiento.
- Cabe en GPU de consumo: no confirmado; dado el tamano de los checkpoints (orden de gigabytes) es plausible en GPUs con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el codigo de referencia es el repositorio `deinal/njord` (modulo `neural_lam.train_model`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de comparaciones publicadas en la informacion proporcionada. Como referencia cualitativa de categoria (modelos de prediccion oceanica basados en aprendizaje profundo), podrian considerarse sistemas como FourCastNet o GraphCast en el ambito atmosferico, pero no se aportan metricas comparativas para Njord/SeaCast, por lo que la comparacion cuantitativa se indica como no disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Njord (`graph_efm`) | no disponible | 2 estados previos, paso diario | MIT | Hugging Face |
| SeaCast (`graph_fm`) | no disponible | 2 estados previos, paso diario | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio cientifico especifico: no es un modelo de lenguaje y no debe evaluarse con criterios de NLP.
- No se han publicado metricas de rendimiento ni validaciones independientes en la informacion disponible, lo que impide valorar su calidad predictiva frente a sistemas operativos.
- Dependencia de forzamiento atmosferico (ERA5) y de los datos de reanalisis/analisis empleados en el entrenamiento; su comportamiento fuera de ese regimen no esta documentado.
- Cobertura temporal de entrenamiento limitada (1993-2021 en reanalisis, 2023 en analisis); el rendimiento en periodos o escenarios no representados es incierto.
- Profundidad maxima de prediccion de 541 m; no cubre la columna oceanica completa.
- Requiere reproducir el pipeline de datos (zarrs, grafos preconstruidos y configuraciones) para su uso correcto; los paths de las configuraciones apuntan a `njord_global_data/`.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias; verificar la procedencia y licencia de los datos de entrenamiento antes de un despliegue en produccion.
- Sesgos y limitaciones fisicas: no se documentan sesgos especificos, pero al ser un modelo aprendido puede producir campos fisicamente inconsistentes fuera de las condiciones de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deinal/njord-global-models
- Grafos preconstruidos (dataset): https://huggingface.co/datasets/deinal/njord-graphs
- Repositorio GitHub: https://github.com/deinal/njord
