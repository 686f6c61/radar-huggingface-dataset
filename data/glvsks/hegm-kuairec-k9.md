# glvsks/HEGM-KuaiRec-K9

## Resumen

HEGM (Hierarchical Exponential-Gaussian Mixtures) es un modelo de prediccion de distribuciones de tiempo de visualizacion para sistemas de recomendacion de video corto, desarrollado por el autor glvsks. No es un modelo de lenguaje: es un checkpoint de PyTorch Lightning entrenado sobre el conjunto de datos KuaiRec (version big-matrix) que estima la distribucion completa del watch-time en lugar de un unico valor puntual. La version publicada en Hugging Face corresponde a la configuracion con K=9 componentes gaussianos.

El modelo aborda un problema clasico en recomendacion de video: predecir cuanto tiempo vera un usuario un contenido. Frente a la regresion puntual tradicional, HEGM modela la distribucion mediante una mezcla que combina una componente exponencial (captura los abandonos rapidos o skips) con una mezcla gaussiana (captura el visionado comprometido), unidas por una compuerta de skip aprendida. Esta formulacion permite razonar sobre la incertidumbre del comportamiento del usuario, algo especialmente util en escenarios con alta varianza como el feed de videos cortos.

El checkpoint se distribuye con licencia Apache 2.0, incluye el fichero `last.ckpt` y el `config.yaml` del experimento original, y esta pensado para reproducir los resultados del repositorio oficial. El tamano del repositorio es de 0.0 GB, lo que sugiere un checkpoint de dimensiones reducidas, coherente con un modelo tabular/secuencial de recomendacion y no con un transformer de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hierarchical Exponential-Gaussian Mixtures (HEGM); mezcla exponencial + mezcla gaussiana con compuerta de skip aprendida |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de recomendacion, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch Lightning, no orientado a cuantizacion) |
| Idiomas soportados | no disponible (no procesa texto libre; opera sobre features de interaccion) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch Lightning (`last.ckpt`) + `config.yaml`; no compatible con `transformers.AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

HEGM es un modelo de prediccion distribucional para recomendacion. Su nucleo es una mezcla jerarquica: una componente exponencial modela los visionados muy cortos (skips inmediatos) y una mezcla de K gaussianas modela la distribucion del tiempo de visionado en usuarios comprometidos. Una compuerta de skip aprendida decide, para cada par usuario-item, la probabilidad de pertenecer al regimen de abandono rapido frente al regimen de visionado. En esta version, K=9 componentes gaussianos.

El entrenamiento se realiza sobre KuaiRec en su release big-matrix, con los splits procesados publicados por el repositorio oficial. La model card no detalla el numero de tokens ni la composicion exacta del dataset, pero el pipeline de reproduccion requiere descargar los splits procesados (incluido `meta.json`) mediante `scripts/download_artifacts.py --splits`. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de este tipo. La innovacion principal es la formulacion distribucional con compuerta de skip, que separa explicitamente el comportamiento de abandono del de engagement.

## Capacidades

- Prediccion de la distribucion del watch-time (tiempo de visualizacion) para pares usuario-item en recomendacion de video corto.
- Modelado explicito de dos regimenes de comportamiento: skip rapido (componente exponencial) y visionado comprometido (mezcla gaussiana).
- Estimacion de incertidumbre mediante la distribucion completa, no solo un valor puntual.
- Compuerta de skip aprendida que cuantifica la probabilidad de abandono inmediato.
- Entrenamiento e inferencia en PyTorch Lightning, con configuracion reproducible mediante `config.yaml`.
- Evaluacion con metricas de regresion (MSE, MAE) y de ranking (XAUC).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Ranking de candidatos en un feed de video corto: usar la distribucion predicha para ordenar items por watch-time esperado y por probabilidad de skip, mejorando la relevancia del feed frente a un ranking basado solo en CTR.
- Estimacion de incertidumbre para exploracion: al disponer de una distribucion completa, se puede calcular la varianza del watch-time predicho y aplicar politicas de exploracion (bandits) que prioricen items con alta incertidumbre.
- Filtrado de contenido con alto riesgo de abandono: la compuerta de skip permite identificar items con probabilidad elevada de abandono inmediato y excluirlos o penalizarlos en la fase de re-ranking.
- Simulacion offline de politicas de recomendacion: el modelo sirve como estimador del reward (watch-time) en evaluaciones offline antes de desplegar cambios en produccion.
- Investigacion en prediccion distribucional: como checkpoint de referencia para comparar formulaciones (regresion puntual vs. mezclas) sobre KuaiRec con la configuracion K=9.
- Reproduccion de resultados academicos: punto de partida para replicar las cifras del paper y del repositorio oficial sin reentrenar desde cero.
- Analisis de segmentacion de usuarios: estudiar la mezcla de componentes asignada a distintos segmentos para caracterizar patrones de consumo (skippers vs. engaged viewers).

## Benchmarks y rendimiento

Resultados del checkpoint en el split de test publicado, segun el repositorio oficial:

| Metrica | Valor |
|---|---|
| MSE (sec²) | 59.2296 |
| MAE (sec) | 4.5099 |
| XAUC | 0.5555 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere un checkpoint de pocos cientos de MB como maximo, probablemente inferior a 1 GB.
- GPU recomendadas: no especificadas; por el tamano del checkpoint, una GPU consumer (RTX 3060 o superior) deberia ser suficiente, aunque no se confirma en la informacion disponible.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio, aunque no se confirma explicitamente.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el despliegue se realiza con el codigo oficial de HEGM en PyTorch/PyTorch Lightning.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de prediccion de watch-time ni con alternativas sobre KuaiRec.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta chat, tool calling ni agentes. Cualquier uso fuera de recomendacion de video corto no esta contemplado.
- Entrenado exclusivamente sobre KuaiRec; el rendimiento fuera de ese dominio (otras plataformas, otros formatos de video) no esta validado.
- El XAUC de 0.5555 es moderado; la capacidad de ranking del checkpoint puede ser limitada en escenarios con distribuciones de watch-time distintas a las del split de test.
- Requiere los splits procesados del repositorio oficial, incluido `meta.json`; no es cargable directamente con `transformers`.
- Riesgo de sesgo heredado del dataset KuaiRec (plataforma y poblacion especificas), no documentado en la model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la licencia del dataset KuaiRec para uso en produccion.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/glvsks/HEGM-KuaiRec-K9
- Repositorio de codigo: https://github.com/rw404/HEGM
- Configuracion del experimento: https://github.com/rw404/HEGM/blob/main/configs/kuairec_k9.yaml
- Resultados del repositorio: https://github.com/rw404/HEGM#results
- Paper: https://arxiv.org/abs/2608.23356
