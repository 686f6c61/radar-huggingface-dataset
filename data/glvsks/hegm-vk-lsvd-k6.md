# glvsks/HEGM-VK-LSVD-K6

## Resumen

HEGM (Hierarchical Exponential-Gaussian Mixtures) es un modelo de predicción de tiempo de visualización (watch-time) para sistemas de recomendación de vídeo corto. Lo desarrolla el usuario glvsks y se publica como checkpoint preentrenado sobre el subconjunto `up0.01_ir0.01` del dataset VK-LSVD, con 6 componentes de mezcla gaussiana (K=6). No es un modelo de lenguaje: es un modelo predictivo especializado que estima la distribución del tiempo que un usuario verá un vídeo, no un valor puntual.

La relevancia del modelo está en su enfoque distribucional: en lugar de predecir un único tiempo esperado, modela la distribución completa combinando una componente exponencial (que captura los saltos rápidos o skips) con una mezcla gaussiana (que captura el visionado comprometido), unidas mediante una puerta de skip aprendida. Este tipo de formulación permite a los sistemas de recomendación razonar sobre la incertidumbre y la multimodalidad del comportamiento del usuario, algo que los regresores puntuales no capturan.

El checkpoint se distribuye como fichero PyTorch Lightning (`last.ckpt`) acompañado de su `config.yaml`, con licencia Apache 2.0. No es cargable con `transformers.AutoModel` y requiere el repositorio oficial de código para su evaluación y reproducción. El tamaño del repositorio es de 0.0 GB según los metadatos de Hugging Face, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el dato no está actualizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla jerárquica exponencial-gaussiana (HEGM): componente exponencial + mezcla gaussiana con puerta de skip aprendida |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia de texto) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch Lightning en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch Lightning checkpoint (`.ckpt`) |

## Arquitectura y entrenamiento

HEGM es una arquitectura de predicción distribucional diseñada específicamente para watch-time en recomendación de vídeo corto. El modelo combina dos familias de distribuciones: una componente exponencial que modela los abandonos rápidos (skips) y una mezcla de K gaussianas que modela el visionado con compromiso. Una puerta de skip aprendida decide, para cada par usuario-vídeo, cuánta masa de probabilidad asignar a cada régimen. Esta formulación jerárquica permite representar distribuciones multimodales del tiempo de visualización, algo que un regresor de valor esperado no puede hacer.

El checkpoint publicado corresponde al subconjunto `up0.01_ir0.01` del dataset VK-LSVD con K=6 componentes gaussianas. No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de regularización específicas más allá de lo descrito en el paper asociado (arXiv:2608.23356). El entrenamiento se realizó con PyTorch Lightning y la configuración original está disponible tanto en el repositorio de Hugging Face como en el repositorio de código.

## Capacidades

- Predicción de la distribución del tiempo de visualización (watch-time) para pares usuario-vídeo en escenarios de vídeo corto.
- Modelado explícito de la multimodalidad del comportamiento: separa skips rápidos de visionado comprometido mediante la puerta de skip.
- Estimación de incertidumbre: al producir una distribución, permite calcular cuantiles, varianza y otras métricas más allá de la media.
- Evaluación mediante MSE, MAE y XAUC, métricas reportadas en el repositorio oficial.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo thinking ni de decodificación especulativa.

## Casos de uso

- Ranking de recomendación en plataformas de vídeo corto: el modelo estima la distribución completa del watch-time para cada candidato, permitiendo ordenar por criterios como media, mediana o probabilidad de superar un umbral de engagement, en lugar de usar un único valor esperado.
- Estimación de incertidumbre en la predicción de engagement: al disponer de una distribución, el sistema puede identificar candidatos con alta varianza y tratarlos de forma distinta (por ejemplo, exploración adicional) frente a candidatos con predicción estable.
- Detección de contenido propenso a skip: la componente exponencial y la puerta de skip permiten identificar vídeos con alta probabilidad de abandono rápido, útil para filtrar o reordenar en el feed.
- Optimización de la función de pérdida del sistema de recomendación: las predicciones distribucionales pueden alimentar objetivos de negocio como maximizar el tiempo total esperado o la probabilidad de visionado completo.
- Análisis offline de comportamiento de usuarios: el modelo permite estudiar la mezcla de regímenes de visionado por segmento de usuario o tipo de contenido, informando decisiones de producto.
- Investigación en sistemas de recomendación: sirve como baseline reproducible para comparar formulaciones distribucionales frente a regresores puntuales en el dataset VK-LSVD.
- Simulación y evaluación contrafactual: la distribución predicha permite simular escenarios de reordenación del feed y estimar su impacto en el watch-time agregado.

## Benchmarks y rendimiento

Resultados reportados en el repositorio oficial para este checkpoint sobre el split de test liberado:

| Metrica | Valor |
|---|---|
| MSE (sec²) | 478.9167 |
| MAE (sec) | 15.7449 |
| XAUC | 0.6206 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del checkpoint no se especifica; el repositorio figura con 0.0 GB).
- GPU recomendadas: no disponible. Al tratarse de un modelo de recomendación tabular/embeddings de pequeño tamaño típicamente, es probable que quepa en GPU consumer, pero no hay datos que lo confirmen.
- Cabe en consumer GPU: no confirmado por falta de datos de tamaño.
- Opciones de despliegue: no se soporta vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue requiere el repositorio oficial de HEGM y PyTorch/PyTorch Lightning.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de predicción distribucional de watch-time sobre VK-LSVD con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es incorrecta.
- El checkpoint no es cargable con `transformers.AutoModel.from_pretrained`; requiere el repositorio oficial de HEGM y los splits procesados del dataset (incluido `meta.json`).
- El repositorio figura con tamaño 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el dato no está actualizado; conviene verificarlo antes de usarlo.
- El modelo está entrenado específicamente sobre el subconjunto `up0.01_ir0.01` de VK-LSVD; su generalización a otros dominios, plataformas o distribuciones de tráfico no está documentada.
- Riesgo de sesgo: al entrenarse sobre datos de comportamiento de una plataforma concreta (VK), puede heredar sesgos de la población y del contenido de esa plataforma.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones mal calibradas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset VK-LSVD, que puede tener sus propias restricciones.
- No hay información sobre latencia, throughput ni requisitos de memoria, lo que dificulta planificar un despliegue en producción.
- El XAUC reportado (0.6206) es moderado; conviene validar el rendimiento en el contexto específico de cada aplicación antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/glvsks/HEGM-VK-LSVD-K6
- Paper: https://arxiv.org/abs/2608.23356
- Repositorio de código: https://github.com/rw404/HEGM
- Configuración del experimento: https://github.com/rw404/HEGM/blob/main/configs/vklsvd_k6.yaml
- Resultados oficiales: https://github.com/rw404/HEGM#results
- Dataset: https://huggingface.co/datasets/deepvk/VK-LSVD
