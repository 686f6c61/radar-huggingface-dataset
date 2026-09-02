# fin-ai-lab/lejepa-demo-ecoder

## Resumen

LeJEPA demo encoder es un modelo de representación de series temporales financieras desarrollado por fin-ai-lab, basado en el framework LeJEPA (Joint-Embedding Predictive Architecture) de auto-supervisión. Está diseñado como un componente del tutorial Market-JEPA para demostrar cómo aprender embeddings de mercado sin etiquetas, utilizando datos de mercado de EE.UU. a 1 Hz de marzo de 2016. Con un backbone Transformer de 12 capas, 6 cabezas de atención y dimensión oculta 384, produce representaciones de 384 dimensiones a partir de series normalizadas de 20 canales (9 series de mercado y 11 canales de información).

El modelo es relevante porque ilustra la aplicación de LeJEPA, un marco teórico que elimina la necesidad de stop-gradients, redes teacher-student o momentum encoders, y solo requiere un hiperparámetro. Su propósito es educativo y de investigación, no constituye un sistema de trading ni ofrece asesoramiento financiero. El repositorio incluye los pesos preentrenados (`model.pt`), configuración (`config.json`), metadatos de entrenamiento (`train_meta.json`) y métricas de evaluación transversal (`xs_ic.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer backbone (12 capas, 6 cabezas de atencion, hidden size 384) |
| Parametros totales | no disponible (no se especifica en la documentacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (maxima longitud de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo para datos numericos de series temporales) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`model.pt`) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Transformer estándar con 12 capas, 6 cabezas de atención y dimensión oculta 384, procesando secuencias de series temporales divididas en parches de tamaño 8. La entrada esperada son 20 canales: 9 correspondientes a series de mercado y 11 a canales de información adicionales según la configuración de entrenamiento. El pooling se realiza mediante el token CLS, que produce el embedding final de 384 dimensiones.

El entrenamiento se realizó con LeJEPA, un marco de aprendizaje auto-supervisado basado en JEPA (Joint-Embedding Predictive Architecture) que, según el paper arXiv 2511.08544, elimina el colapso representacional sin necesidad de stop-gradients ni arquitecturas teacher-student, y requiere un único hiperparámetro. Los datos de entrenamiento consisten en datos de mercado de EE.UU. a 1 Hz de marzo de 2016, con aumentación por deformación temporal (time-warp augmentation). El modelo se publica con fines educativos y de investigación, y no se especifica el número exacto de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Generación de embeddings de 384 dimensiones a partir de series temporales de mercado normalizadas.
- Representación de secuencias de hasta 2.048 pasos temporales con 20 canales de entrada.
- Aprendizaje auto-supervisado sin etiquetas, basado en la predicción de representaciones en el espacio de embeddings (JEPA).
- Transferencia potencial entre arquitecturas y datasets sin ajuste de hiperparámetros, según las propiedades de LeJEPA.
- Evaluación transversal (cross-sectional) incluida en el archivo `xs_ic.json`, aunque los valores concretos no se detallan en la documentación pública.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Investigación académica en representación de series temporales financieras: el modelo sirve como punto de partida para estudiar cómo LeJEPA captura dinámicas de mercado en un contexto auto-supervisado, permitiendo reproducir y extender los resultados del tutorial Market-JEPA.
- Análisis de similitud entre activos: los embeddings generados pueden usarse para agrupar instrumentos financieros por comportamiento temporal, facilitando estudios de correlación o construcción de carteras temáticas.
- Detección de anomalías en datos de mercado: al proyectar series temporales en un espacio latente, se pueden identificar desviaciones inusuales respecto a las representaciones aprendidas, útil para monitorización de mercados en entornos de investigación.
- Pre-entrenamiento para tareas downstream: el encoder puede servir como extractor de características para modelos supervisados de predicción de retornos o clasificación de regímenes de mercado, aunque requiere adaptación adicional.
- Educación en machine learning financiero: el repositorio incluye configuración y metadatos completos, lo que permite a estudiantes y desarrolladores aprender a construir y evaluar modelos de representación auto-supervisados sobre datos de mercado.
- Benchmarking de frameworks de representación: se puede comparar la calidad de los embeddings de LeJEPA frente a otros métodos (autoencoders, contrastive learning) en métricas como IC (information coefficient) o accuracy en tareas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un archivo `xs_ic.json` con métricas de evaluación transversal (cross-sectional), pero los valores concretos no se detallan en la documentación pública. No se proporcionan comparaciones con otros modelos ni resultados en datasets estándar.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 0.1 GB, lo que sugiere un modelo pequeño (probablemente decenas de millones de parámetros). Se estima que la inferencia requiere menos de 2 GB de VRAM, incluso en precisión FP32.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060 o superiores) es suficiente. También puede ejecutarse en CPU para inferencia puntual, aunque con mayor latencia.
- Despliegue: al ser un modelo PyTorch, puede integrarse fácilmente en pipelines con Hugging Face Transformers, PyTorch Lightning o directamente con `torch.load`. No se mencionan soportes para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. Dado el tamaño y la arquitectura, se espera una latencia de milisegundos en GPU para secuencias de longitud moderada, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para representación de series temporales financieras con LeJEPA. Alternativas generales en el campo del aprendizaje auto-supervisado de series temporales (por ejemplo, TS2Vec, TST, CoST) no han sido evaluadas en esta documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con datos de mercado de EE.UU. a 1 Hz de marzo de 2016, por lo que su capacidad de generalización a otros periodos, frecuencias o mercados es limitada.
- No es un sistema de trading y sus salidas no constituyen asesoramiento financiero. El rendimiento histórico no garantiza resultados futuros.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar al autor antes de cualquier uso en producción.
- No se han documentado sesgos específicos, pero al tratarse de datos de un solo mes, podría haber sesgos temporales o de régimen de mercado.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero las representaciones pueden no capturar adecuadamente eventos extremos no vistos en el entrenamiento.
- No se proporcionan métricas detalladas de rendimiento, por lo que la calidad del modelo no puede evaluarse objetivamente sin reproducir experimentos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un recurso muy reciente o poco validado por la comunidad.

## Enlaces

- [HuggingFace - fin-ai-lab/lejepa-demo-ecoder](https://huggingface.co/fin-ai-lab/lejepa-demo-ecoder)
- [GitHub - galilai-group/lejepa](https://github.com/galilai-group/lejepa)
- [Paper arXiv - LeJEPA: Provable and Scalable Self-Supervised Learning Without the...](https://arxiv.org/abs/2511.08544)
- [PDF del paper (v3)](https://arxiv.org/pdf/2511.08544v3)
- [DeepWiki - galilai-group/lejepa](https://deepwiki.com/galilai-group/lejepa)
