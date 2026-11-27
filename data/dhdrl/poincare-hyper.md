# DHDRL/poincare-hyper

## Resumen

poincare-hyper (identificador `DHDRL/poincare-hyper`, nombre interno `well_poincare_rl`) es un modelo cientifico de investigacion publicado por el autor DHDRL en Hugging Face. No es un modelo de lenguaje: es un predictor de campos espacio-temporales de tipo PDE (reaccion-difusion, materia activa, flujos) que ademas embebe estructuras jerarquicas (taxonomias) en la bola de Poincare, es decir, en geometria hiperbolica. Combina un encoder multiescala agnostico al numero de canales con un predictor jerarquico de multiples pasos en el espacio hiperbolico, y anade una pila de aprendizaje continuo (Replay + EWC) y un modo opcional de ajuste fino con PPO.

El modelo resuelve dos problemas: la prediccion multi-paso de campos continuos con distinto numero de canales por dominio (sin bloquear el encoder a un `C` fijo) y la recuperacion de estructura jerarquica en datos cientificos con forma de arbol, comparando explicitamente embeddings de Poincare frente a euclideos. Es relevante ahora porque el aprendizaje continuo entre dominios cientificos heterogeneos y el uso de geometrias no euclideas para jerarquias son lineas de investigacion activas, y el autor publica contratos de datos y checkpoints con trazabilidad de procedencia (`REAL_STREAMED`, `REAL_LOCAL`, `REAL_PBDB`, `SYNTHETIC`).

El repositorio tiene 0 descargas y 1 like en el momento de la consulta, un tamano de 0.0 GB y fue creado el 2026-08-10. Se trata, por tanto, de un artefacto de investigacion incipiente, no de un modelo listo para produccion. La model card es detallada en cuanto a contratos de datos y protocolos de evaluacion, pero no publica el numero de parametros, la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional multiescala (`MultiScaleEncoder`) + predictor jerarquico en la bola de Poincare (`HierarchicalHyperbolicPredictor`) con RNN grueso y niveles de refinamiento residual; embeddings hiperbolicos con geoopt/RiemannianAdam |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la ventana de entrada es `window=4` pasos temporales y la prediccion es `pred_steps=4` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo cientifico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio usa PyTorch (`library_name: pytorch`) y checkpoints propios con hash chain; el checkpoint verificado de jerarquia no exporta los pesos de embedding completos |

Hiperparametros por defecto / mejor Optuna: `lr=3.82e-4`, `curvature=0.455`, `hidden=96`, `batch_size=8`, `pred_steps=4`, `w_phys=9.6e-4`, `levels=2`, `window=4`. Fuente unica de verdad: `src/config.py` (`BEST_HPARAMS`).

## Arquitectura y entrenamiento

El `MultiScaleEncoder` es agnostico al canal: aplica un stem 1x1 compartido por canal, fusiona por media y procesa por una ruta espectral y otra local hasta un latente euclideo de 8 dimensiones. El `HierarchicalHyperbolicPredictor` opera en la bola de Poincare con un RNN grueso mas niveles de refinamiento residual, y produce `(B, pred_steps, 8)` puntos en la bola. El modulo `HierarchyEmbedding` genera embeddings de nodos para arboles taxonomicos en Poincare o en euclideo, optimizados con RiemannianAdam sobre geoopt. La pila de aprendizaje continuo incluye un `FieldNormalizer` por dominio, un `ReplayBuffer` con el mismo numero de canales, `DiagonalEWC` y destilacion hiperbolica opcional. El modo de refuerzo es opcional: entorno Gymnasium mas PPO on-policy con critico hiperbolico.

Los datos de entrenamiento proceden de tres fuentes con etiqueta de procedencia: The Well (streams de Hugging Face, p. ej. `gray_scott_reaction_diffusion`, `active_matter`, `shear_flow`), HDF5 locales en formato Well y registros de ocurrencia de PBDB (Paleobiology Database) para las taxonomias Dinosauria y Mammalia. Los datos sinteticos solo estan disponibles mediante APIs explicitas (`--synthetic`) y nunca como fallback silencioso: las rutas de datos reales fallan de forma dura ante datos ausentes, esquema incorrecto o fallo del stream. No se especifica el numero de tokens ni el volumen total de ejemplos de entrenamiento.

## Capacidades

- Prediccion multi-paso de campos cientificos continuos de tipo PDE (reaccion-difusion, materia activa, flujos) en 4 pasos hacia adelante.
- Entrada agnostica al numero de canales: acepta tensores `(B, T, C, H, W)` o `(B, C, H, W)` con `C` variable segun el dominio.
- Embedding de jerarquias y taxonomias en la bola de Poincare, con comparacion directa contra embeddings euclideos.
- Aprendizaje continuo entre dominios cientificos con distinto numero de canales mediante Replay + EWC y destilacion hiperbolica opcional.
- Ajuste fino opcional con PPO on-policy y critico hiperbolico sobre un entorno Gymnasium.
- Trazabilidad de procedencia de datos y checkpoints con hash chain y almacenamiento de metricas.
- No dispone de generacion de texto, codigo, matematicas, vision natural, tool calling, capacidades de agente ni soporte multilingue.

## Casos de uso

- Prediccion de reaccion-difusion tipo Gray-Scott: el modelo recibe una ventana de 4 pasos de un campo 2D con `C=2` y devuelve 4 pasos futuros en la bola de Poincare; util para estudiar la evolucion de patrones espacio-temporales en simulaciones.
- Modelado de materia activa: con `C=11` canales, el encoder agnostico evita reentrenar la arquitectura al cambiar de dominio, lo que permite reutilizar el mismo modelo en flujos de materia activa.
- Simulacion de flujos de cizalladura (`shear_flow`, `C=4`): el mismo predictor multiescala se aplica sin cambios estructurales, facilitando la comparacion entre regimenes.
- Aprendizaje continuo multi-dominio: el `ReplayBuffer` por numero de canales (24 muestras por cada `C` en la ejecucion reportada) y `DiagonalEWC` permiten entrenar secuencialmente en varios dominios y medir la retencion de cada uno.
- Recuperacion de jerarquias taxonomicas: con los registros de PBDB de Dinosauria y Mammalia (2141 nodos, 2172 aristas), el modelo aprende embeddings de nodos que preservan la estructura de arbol, util para analisis paleobiologicos de parentesco.
- Comparacion metodologica Poincare frente a euclideo: el script `run_hierarchy_embed` permite cuantificar la ventaja de la geometria hiperbolica en capacidad de embedding a una dimension dada (ΔMRR de +0.1151 a +0.1576 en los ajustes verificados).
- Investigacion en representaciones hiperbolicas multiescala: el codigo separa encoder, predictor y embedding, lo que permite ablaciones controladas sobre curvatura, niveles y dimension del latente.

## Benchmarks y rendimiento

Los resultados publicados no son benchmarks de NLP, sino metricas internas de los dos tracks de evaluacion del autor.

Track A — aprendizaje continuo multi-stream sobre The Well (perdidas de retencion reportadas, no verificadas desde checkpoint):

| Tras el dominio | gray_scott (C=2) | active_matter (C=11) | shear_flow (C=4) |
|---|---|---|---|
| Dominio 1 | 0.3486 | — | — |
| Dominio 2 | 0.3561 | 0.3299 | — |
| Dominio 3 | 0.3248 | 0.3484 | 0.3358 |

Track B — jerarquia real de PBDB (verificada de forma independiente desde el JSON de ocurrencias; ~16k registros, 2141 nodos, 2172 aristas):

| Configuracion | ΔMRR (Poincare − Euclideo) |
|---|---|
| dim=8, softmax, c=1.0 | +0.1151 |
| dim=8, softmax, c=2.0 | +0.1576 |

Protocolo de reconstruccion (train = test edges): mide capacidad de embedding a una dimension dada, no generalizacion en prediccion de enlaces. Los resultados de jerarquia corresponden a una sola semilla y una sola dimension.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el latente es de solo 8 dimensiones y `hidden=96`, por lo que el modelo es muy pequeno, pero el autor no publica cifras.
- GPU recomendadas: no disponible; por el tamano del encoder y del predictor, cualquier GPU consumer reciente deberia bastar, aunque no hay confirmacion del autor.
- Cabe en GPU consumer: presumiblemente si, dado el tamano reducido del modelo, pero no se confirma en la informacion disponible.
- Opciones de despliegue: no se documentan servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama; el uso previsto es mediante scripts de Python (`python -m src.run_multistream`, `python -m src.run_hierarchy_embed`, `python -m src.run_full`) con dependencias `torch`, `geoopt`, `gymnasium`, `h5py` y `the_well`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (predictores hiperbolicos de campos cientificos con aprendizaje continuo). Las alternativas habituales serian modelos de prediccion de PDE y embeddings jerarquicos, pero no se dispone de datos de parametros, contexto ni rendimiento de esos modelos en esta ficha, por lo que la comparativa cuantitativa queda como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| poincare-hyper (DHDRL) | no disponible | ventana de 4 pasos, prediccion de 4 pasos | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las cifras de retencion del track multi-stream estan reportadas pero no verificadas desde checkpoint: el formato de checkpoint multi-stream no persiste el historial de perdidas.
- El resultado de jerarquia real de PBDB corresponde a una sola semilla y una sola dimension; no hay evidencia de robustez estadistica.
- La fusion de canales es por media (mean-pooling), lo que es una operacion con perdida de informacion.
- El checkpoint verificado de jerarquia es solo de metricas: no exporta los pesos de embedding completos, lo que limita la reproducibilidad exacta.
- El protocolo de evaluacion de jerarquia es de reconstruccion (train = test edges), no de generalizacion en prediccion de enlaces; los ΔMRR no deben interpretarse como rendimiento en enlaces no vistos.
- El modelo no es linguistico: no soporta generacion de texto, codigo, tool calling, agentes ni idiomas, por lo que no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Los datos sinteticos solo estan disponibles mediante APIs explicitas y las rutas reales fallan de forma dura; cualquier despliegue debe gestionar esos fallos.
- El repositorio tiene 0 descargas y 1 like, y un tamano de 0.0 GB: es un artefacto de investigacion temprano, sin evidencia de uso en produccion.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribucion y aviso de cambios, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DHDRL/poincare-hyper
- The Well (dataset y repositorio): https://github.com/polymathic-ai/the_well
- Dataset en Hugging Face: https://huggingface.co/datasets/polymathic-ai/the_well
- Paleobiology Database: https://paleobiodb.org
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales del autor.
