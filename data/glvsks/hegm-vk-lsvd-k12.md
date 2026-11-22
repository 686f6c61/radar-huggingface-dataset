# glvsks/HEGM-VK-LSVD-K12

## Resumen

HEGM (Hierarchical Exponential-Gaussian Mixtures) es un modelo de prediccion de distribuciones de tiempo de visualizacion para sistemas de recomendacion de video corto, desarrollado por el autor glvsks y publicado en Hugging Face bajo licencia Apache 2.0. El checkpoint disponible, HEGM-VK-LSVD-K12, esta entrenado sobre el subconjunto `up0.01_ir0.01` del dataset VK-LSVD con 12 componentes de mezcla gaussiana. No es un modelo de lenguaje: es un modelo predictivo especializado en estimar la distribucion del watch-time de un usuario ante un item.

La propuesta tecnica consiste en combinar una componente exponencial, que modela los abandonos rapidos (skips), con una mezcla gaussiana que modela el visionado comprometido, todo ello unido mediante una compuerta de skip aprendida. Este enfoque de prediccion distribucional supera la regresion puntual clasica al capturar la multimodalidad del comportamiento de visualizacion, lo que resulta relevante para ordenar candidatos en sistemas de recomendacion donde la metrica objetivo es el tiempo de visualizacion esperado.

El checkpoint se distribuye como un fichero PyTorch Lightning (`last.ckpt`) acompanado de su `config.yaml`, y requiere el repositorio oficial de codigo y los splits procesados del dataset para su evaluacion. No es cargable con `transformers.AutoModel`, ya que no sigue la interfaz de modelos de lenguaje. El tamano del repositorio es de 0.0 GB, lo que sugiere un checkpoint de dimensiones reducidas orientado a inferencia ligera en pipelines de recomendacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla jerarquica exponencial-gaussiana (HEGM) con compuerta de skip aprendida; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de prediccion tabular/embeddings, no secuencial generativo) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch Lightning en precision de entrenamiento) |
| Idiomas soportados | no disponible (no procesa texto; opera sobre features de interaccion) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch Lightning checkpoint (`.ckpt`), no compatible con `transformers` |

## Arquitectura y entrenamiento

HEGM modela la distribucion del watch-time como una mezcla de una componente exponencial y una mezcla gaussiana de K componentes (K=12 en este checkpoint), combinadas mediante una compuerta de skip aprendida. La componente exponencial captura los visionados muy cortos o abandonos inmediatos, mientras que las K gaussianas modelan la parte de la distribucion correspondiente a visionados comprometidos. La jerarquia permite que el modelo ajuste simultaneamente la probabilidad de skip y la forma de la distribucion condicional al visionado.

El entrenamiento se realizo sobre el subconjunto `up0.01_ir0.01` del dataset VK-LSVD, un corpus de interacciones de video corto. La model card no detalla el numero de tokens ni el volumen exacto de interacciones, ni si se emplearon tecnicas de refinamiento tipo RLHF o DPO (no aplicables a este tipo de modelo). La innovacion principal es la formulacion distribucional con compuerta de skip, que sustituye la regresion puntual de watch-time por una densidad completa, permitiendo derivar metricas como el valor esperado, la probabilidad de skip o cuantiles de visualizacion.

## Capacidades

- Prediccion de la distribucion completa de watch-time para pares usuario-item en recomendacion de video corto.
- Modelado explicito de la probabilidad de skip mediante la compuerta aprendida y la componente exponencial.
- Estimacion del valor esperado de visualizacion a partir de la mezcla, util para ranking de candidatos.
- Calculo de metricas derivadas: cuantiles de watch-time, varianza y probabilidad de visionado comprometido.
- Evaluacion mediante MSE, MAE y XAUC sobre el split de test liberado.
- Integracion en pipelines de PyTorch/PyTorch Lightning para entrenamiento y evaluacion reproducibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues, al no ser un modelo generativo de lenguaje.

## Casos de uso

- Ranking de candidatos en feeds de video corto: el modelo estima la distribucion de watch-time de cada par usuario-video y permite ordenar por valor esperado o por probabilidad de visionado largo, mejorando la relevancia del feed frente a regresiones puntuales.
- Prediccion de skip para filtrado previo: la componente exponencial y la compuerta de skip permiten descartar candidatos con alta probabilidad de abandono inmediato antes de un ranking costoso.
- Optimizacion de politicas de recomendacion con metricas distribucionales: al disponer de la densidad completa, se pueden calcular cuantiles (por ejemplo, percentil 90 de watch-time) para objetivos que penalizan la varianza o priorizan sesiones largas.
- Estimacion de incertidumbre en la prediccion: la mezcla gaussiana proporciona varianza explicita, util para bandits contextuales o exploracion controlada en sistemas de recomendacion.
- Analisis offline de comportamiento: el modelo permite estudiar la forma de la distribucion de visionado por segmento de usuario o tipo de contenido, informando decisiones de producto.
- Baseline reproducible para investigacion: el checkpoint y los scripts de evaluacion del repositorio oficial permiten comparar nuevas arquitecturas de prediccion de watch-time sobre el mismo split de VK-LSVD.
- Integracion en pipelines de PyTorch Lightning: al ser un checkpoint nativo de Lightning, se puede reutilizar en entrenamiento continuo o fine-tuning sobre nuevos subconjuntos del dataset.

## Benchmarks y rendimiento

Resultados reportados en el repositorio oficial para este checkpoint sobre el split de test liberado:

| Metrica | Valor |
|---|---|
| MSE (sec²) | 479.6837 |
| MAE (sec) | 15.7679 |
| XAUC | 0.6202 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de referencia sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0.0 GB, lo que sugiere un checkpoint de pocos megabytes y requisitos muy bajos, pero no se especifica la cifra exacta.
- GPU recomendadas: no disponible. Por la naturaleza del modelo (prediccion tabular/embeddings), es probable que funcione en CPU, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el checkpoint es lo suficientemente pequeno como para no requerir aceleradores de datacenter, pero no se aportan datos de latencia ni throughput.
- Opciones de despliegue: PyTorch y PyTorch Lightning exclusivamente; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de prediccion de watch-time ni con alternativas de la misma categoria sobre el dataset VK-LSVD.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Dependencia estricta del dataset VK-LSVD y de sus splits procesados; el checkpoint no es util sin las features de interaccion correspondientes.
- No es cargable con `transformers.AutoModel.from_pretrained`; requiere el repositorio oficial de codigo y su pipeline de evaluacion.
- Riesgo de sobreajuste al subconjunto `up0.01_ir0.01`; el rendimiento en otros dominios o distribuciones de trafico no esta documentado.
- Sesgos potenciales derivados de la poblacion y el contenido del dataset VK-LSVD, no analizados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento ni sobre su redistribucion.
- Ausencia de informacion sobre calibracion de la mezcla, estabilidad del entrenamiento y sensibilidad al numero de componentes K.
- El checkpoint fue creado y actualizado en noviembre de 2026; no hay historial de versiones ni mantenimiento documentado.

## Enlaces

- Hugging Face: https://huggingface.co/glvsks/HEGM-VK-LSVD-K12
- Paper: https://arxiv.org/abs/2608.23356
- Repositorio de codigo: https://github.com/rw404/HEGM
- Configuracion del experimento: https://github.com/rw404/HEGM/blob/main/configs/vklsvd_k12.yaml
- Resultados oficiales: https://github.com/rw404/HEGM#results
- Dataset: https://huggingface.co/datasets/deepvk/VK-LSVD
