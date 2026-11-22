# glvsks/HEGM-VK-LSVD-K3

## Resumen

HEGM-VK-LSVD-K3 es un checkpoint preentrenado del modelo Hierarchical Exponential-Gaussian Mixtures (HEGM), una arquitectura de prediccion de distribuciones disenada especificamente para la estimacion del tiempo de visualizacion (watch-time) en sistemas de recomendacion de video corto. El modelo ha sido entrenado sobre el subconjunto `up0.01_ir0.01` del dataset VK-LSVD y publicado por el usuario glvsks en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje generativo, sino de un modelo predictivo especializado en una tarea de regresion distribucional dentro del dominio del recommendation systems.

La propuesta tecnica de HEGM consiste en modelar la distribucion del tiempo de visualizacion combinando una componente exponencial, que captura los abandonos rapidos (skips), con una mezcla gaussiana que representa el visionado comprometido, todo ello unido mediante una compuerta de skip aprendida. Este checkpoint concreto emplea 3 componentes de mezcla gaussiana (K=3), de ahi su sufijo en el nombre. El modelo se distribuye como checkpoint de PyTorch Lightning (`last.ckpt`) acompanado de su fichero de configuracion original, y no es compatible con la API `transformers` de Hugging Face.

Su relevancia radica en que aborda un problema clasico de los sistemas de recomendacion de video: predecir no solo si un usuario hara clic, sino cuanto tiempo permanecera viendo el contenido, lo que permite optimizar directamente metricas de engagement en lugar de proxies binarios. Al publicarse con codigo, dataset procesado y configuracion reproducible, facilita la comparacion y la extension por parte de la comunidad investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hierarchical Exponential-Gaussian Mixtures (HEGM), modelo predictivo distribucional en PyTorch Lightning |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de PyTorch Lightning (`last.ckpt`) |
| Componentes de mezcla | 3 componentes gaussianas (K=3) |
| Dataset de entrenamiento | deepvk/VK-LSVD (subconjunto `up0.01_ir0.01`) |
| Tarea | Prediccion de distribucion de watch-time |

## Arquitectura y entrenamiento

HEGM es un modelo de prediccion distribucional que estima la distribucion del tiempo de visualizacion de un usuario sobre un video corto. La arquitectura combina dos familias de distribuciones: una componente exponencial que modela los abandonos rapidos o skips (tiempos de visionado muy cortos) y una mezcla gaussiana con K=3 componentes que captura el comportamiento de visionado comprometido. Una compuerta de skip aprendida (learned skip gate) pondera la contribucion de ambas partes, permitiendo que el modelo se adapte a la naturaleza bimodal tipica del consumo de video corto.

El entrenamiento se ha realizado sobre el subconjunto `up0.01_ir0.01` del dataset VK-LSVD, un conjunto de datos de recomendacion de video corto. El checkpoint se distribuye como fichero de PyTorch Lightning junto con el `config.yaml` del experimento original, que referencia rutas de datos relativas a la raiz del repositorio de GitHub. No se dispone de informacion sobre el numero de tokens, la composicion detallada del dataset ni sobre el uso de tecnicas de RLHF o DPO, ya que no es un modelo de lenguaje. La innovacion tecnica destacable es el propio modelado jerarquico de mezclas exponencial-gaussianas con compuerta de skip, orientado a capturar la estructura bimodal del watch-time.

## Capacidades

- Prediccion de la distribucion del tiempo de visualizacion (watch-time) para pares usuario-video en escenarios de video corto.
- Modelado explicito de dos regimenes de comportamiento: abandonos rapidos (componente exponencial) y visionado comprometido (mezcla gaussiana).
- Estimacion de metricas de ranking y regresion como MSE, MAE y XAUC sobre el split de test publicado.
- Integracion en pipelines de PyTorch Lightning para evaluacion y reproduccion de experimentos.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues, al no ser un modelo de lenguaje.
- No incluye modo de pensamiento (thinking mode), audio ni ninguna capacidad generativa.

## Casos de uso

- Optimizacion de ranking en feeds de video corto: el modelo estima la distribucion del watch-time esperado para cada par usuario-video, permitiendo ordenar candidatos por engagement previsto en lugar de por proxies binarios de clic.
- Prediccion de abandono temprano (skip): la componente exponencial y la compuerta de skip permiten identificar contenido con alta probabilidad de abandono inmediato, util para filtrar o penalizar videos en la fase de recuperacion.
- Estimacion de tiempo de visionado para simulacion offline: investigadores pueden usar el checkpoint para reproducir los resultados del paper y comparar variantes de modelos de watch-time sobre VK-LSVD.
- Ajuste de estrategias de recomendacion con metricas de regresion: al predecir la distribucion completa, el sistema puede optimizar funciones de utilidad no lineales sobre el tiempo de visualizacion (por ejemplo, percentiles altos) en lugar de solo la media.
- Investigacion academica en modelado distribucional: sirve como linea base reproducible para nuevos metodos de prediccion de watch-time, gracias a la publicacion conjunta de codigo, configuracion y splits procesados.
- Evaluacion de sistemas de recomendacion con XAUC: la metrica XAUC reportada permite comparar el rendimiento de ranking del modelo frente a alternativas en tareas de ordenacion de candidatos.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test publicado para este checkpoint (K=3):

| Metrica | Valor |
|---|---|
| MSE (sec²) | 480.0518 |
| MAE (sec) | 15.7046 |
| XAUC | 0.6202 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de watch-time ni frente a variantes de HEGM con distinto numero de componentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 0.0 GB segun Hugging Face, lo que sugiere un checkpoint de dimensiones reducidas, pero no se especifica el numero de parametros.
- GPU recomendadas: no disponible. Al tratarse de un modelo predictivo de recomendacion y no de un LLM, es probable que quepa en GPUs consumer, pero no hay datos confirmados en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada; no disponible.
- Opciones de despliegue: evaluacion mediante el repositorio oficial de HEGM con PyTorch Lightning (`evaluate.py`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de watch-time ni resultados de otras arquitecturas sobre el mismo dataset.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente sobre el subconjunto `up0.01_ir0.01` del dataset VK-LSVD; su generalizacion a otros dominios, plataformas o distribuciones de usuarios no esta validada.
- No es un modelo de lenguaje: no puede usarse para generacion de texto, codigo, vision ni tareas generativas. Intentar cargarlo con `transformers.AutoModel.from_pretrained` fallara.
- Requiere el codigo y los splits procesados del repositorio oficial de HEGM (incluido `meta.json`) para su evaluacion; el checkpoint por si solo no es autosuficiente.
- Riesgo de sesgo: al entrenarse sobre datos de una plataforma concreta (VK), puede heredar sesgos de comportamiento de esa poblacion y no representar a otros usuarios.
- Riesgo de sobreajuste al split: los resultados reportados corresponden a un unico split de test; no se han publicado intervalos de confianza ni validacion cruzada.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa texto de forma generativa.

## Enlaces

- Hugging Face: https://huggingface.co/glvsks/HEGM-VK-LSVD-K3
- Paper: https://arxiv.org/abs/2608.23356
- Repositorio de codigo: https://github.com/rw404/HEGM
- Configuracion del experimento: https://github.com/rw404/HEGM/blob/main/configs/vklsvd_k3.yaml
- Resultados oficiales: https://github.com/rw404/HEGM#results
- Dataset: deepvk/VK-LSVD (referenciado en la model card, sin URL directa proporcionada)
