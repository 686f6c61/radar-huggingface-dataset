# glvsks/HEGM-VK-LSVD-K9

## Resumen

HEGM (Hierarchical Exponential-Gaussian Mixtures) es un modelo de predicción de tiempo de visualización para sistemas de recomendación de vídeo corto, desarrollado por el autor glvsks y publicado en Hugging Face bajo licencia Apache 2.0. El checkpoint HEGM-VK-LSVD-K9 corresponde a un experimento concreto entrenado sobre el subconjunto `up0.01_ir0.01` del dataset VK-LSVD, con 9 componentes gaussianas en la mezcla. No es un modelo de lenguaje: es un modelo de recomendación que estima la distribución del watch-time (tiempo de visualización) de un usuario ante un vídeo, en lugar de predecir un único valor escalar.

La propuesta técnica consiste en combinar una componente exponencial que modela los abandonos rápidos (skips) con una mezcla gaussiana que modela la visualización comprometida, unidas mediante una compuerta de skip aprendida. Este enfoque de predicción distribucional permite capturar la naturaleza bimodal del comportamiento de visualización en vídeo corto, donde la mayoría de interacciones son descartes inmediatos y una minoría son consumos prolongados.

El modelo se distribuye como checkpoint de PyTorch Lightning (`last.ckpt`) junto con su configuración YAML, y requiere el repositorio oficial de código para su evaluación y reproducción. No es compatible con `transformers.AutoModel`, no incluye pesos en formato safetensors ni GGUF, y el tamaño del repositorio es de 0.0 GB según los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla jerárquica exponencial-gaussiana (HEGM) con compuerta de skip aprendida; implementación en PyTorch Lightning |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre features de interacción usuario-vídeo) |
| Tipos de cuantización | no disponible (checkpoint PyTorch nativo, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de PyTorch Lightning (`last.ckpt`) + `config.yaml`; no compatible con `transformers` |

## Arquitectura y entrenamiento

HEGM modela la distribución del watch-time como una mezcla de dos familias: una componente exponencial que captura los abandonos tempranos (skips rápidos) y una mezcla de K gaussianas que captura la visualización comprometida. Una compuerta de skip aprendida decide la ponderación entre ambas ramas, lo que permite que el modelo asigne masa de probabilidad a ambos regímenes de comportamiento sin forzar una distribución unimodal. En este checkpoint, K=9 componentes gaussianas.

El entrenamiento se realizó sobre el subconjunto `up0.01_ir0.01` del dataset VK-LSVD (deepvk/VK-LSVD), un conjunto de datos de interacciones de vídeo corto. La model card no especifica el número de tokens, el volumen de interacciones, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se detalla la innovación de decodificación especulativa ni mecanismos de atención, al no tratarse de un transformer generativo. La configuración del experimento está disponible en `configs/vklsvd_k9.yaml` del repositorio oficial.

## Capacidades

- Predicción distribucional del watch-time: estima una distribución completa (exponencial + mezcla gaussiana) en lugar de un valor puntual, lo que permite derivar media, mediana, cuantiles y probabilidades de superar umbrales de visualización.
- Modelado explícito del skip: la compuerta aprendida separa los abandonos rápidos del consumo comprometido, capturando la bimodalidad del comportamiento en vídeo corto.
- Ranking y ordenación de candidatos: a partir de la distribución predicha pueden construirse scores para ordenar vídeos por probabilidad de visualización prolongada.
- Estimación de incertidumbre: al ser un modelo probabilístico, proporciona una medida de dispersión de la predicción útil para estrategias de exploración.
- Integración en pipelines de recomendación: se usa como componente de scoring dentro de un sistema de recomendación, no como generador de texto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Predicción de watch-time en feeds de vídeo corto: el modelo estima la distribución del tiempo de visualización para pares usuario-vídeo, permitiendo ordenar el feed por probabilidad de consumo prolongado en lugar de por CTR. Es adecuado porque modela explícitamente los skips rápidos, que dominan las impresiones en este formato.
- Optimización de objetivos de retención: al disponer de la distribución completa, el equipo puede calcular la probabilidad de que un usuario supere un umbral de segundos (por ejemplo, 10 s o 30 s) y usarla como señal de ranking en producción.
- Estimación de incertidumbre para exploración: la varianza de la mezcla permite identificar ítems con predicción insegura y priorizar su exploración en sistemas con bandits o A/B testing.
- Investigación académica en predicción distribucional: sirve como checkpoint de referencia reproducible para comparar variantes de HEGM con distinto número de componentes K sobre VK-LSVD.
- Segmentación de audiencia por comportamiento: las predicciones por usuario permiten agrupar perfiles según su propensión al abandono rápido o al consumo comprometido, informando estrategias de contenido.
- Evaluación offline de sistemas de recomendación: el checkpoint y las métricas reportadas (MSE, MAE, XAUC) permiten reproducir experimentos y comparar contra baselines puntuales en el split de test liberado.

## Benchmarks y rendimiento

Resultados reportados en la model card para este checkpoint sobre el split de test liberado:

| Métrica | Valor |
|---|---|
| MSE (sec²) | 479.8697 |
| MAE (sec) | 15.7717 |
| XAUC | 0.6197 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni desgloses por subgrupos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB y la model card no detalla el número de parámetros. Al tratarse de un modelo tabular/probabilístico sobre features de interacción, es previsible que quepa en GPU consumer, pero no se confirma con datos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada; por la naturaleza del modelo (mezcla de componentes sobre features), es plausible en RTX 3060 o superiores, pero no hay dato oficial.
- Opciones de despliegue: PyTorch Lightning con el repositorio oficial `rw404/HEGM`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HEGM-VK-LSVD-K9 | Mezcla exponencial-gaussiana para watch-time | no disponible | no aplica | Apache 2.0 | Checkpoint PyTorch en HF + repo GitHub |
| Baselines puntuales de watch-time | Regresión escalar | no disponible | no aplica | no disponible | no disponible |
| Modelos de recomendación con transformers | Transformer secuencial | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos de modelos comparables sobre el mismo split, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre VK-LSVD, hereda los sesgos de comportamiento y demográficos del dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la predicción distribucional puede asignar masa de probabilidad a rangos de watch-time poco realistas si las features de entrada están fuera de distribución.
- Limitaciones de contexto o idioma: no aplica como modelo lingüístico; su validez está acotada al dominio de vídeo corto y al dataset VK-LSVD.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset subyacente (deepvk/VK-LSVD) puede tener sus propias condiciones que deben verificarse por separado.
- Caveat de producción: es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la ficha; no ha sido validado por la comunidad. Requiere el repositorio oficial y los splits procesados (incluido `meta.json`) para su evaluación, y no puede cargarse con `transformers.AutoModel.from_pretrained`.
- El tamaño del repositorio (0.0 GB) sugiere que los pesos podrían no estar efectivamente alojados o que el reporte de tamaño es impreciso; conviene verificar la integridad de `last.ckpt` antes de usarlo.
- No se especifican los parámetros totales ni el volumen de entrenamiento, lo que dificulta estimar su coste de inferencia y su robustez fuera del split de test.

## Enlaces

- Hugging Face: https://huggingface.co/glvsks/HEGM-VK-LSVD-K9
- Paper: https://arxiv.org/abs/2608.23356
- Repositorio de código: https://github.com/rw404/HEGM
- Configuración del experimento: https://github.com/rw404/HEGM/blob/main/configs/vklsvd_k9.yaml
- Resultados oficiales: https://github.com/rw404/HEGM#results
- Dataset: deepvk/VK-LSVD (referenciado en la model card)
