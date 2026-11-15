# Ido-shraga/setswana-sentiment-afroxlmr-large

## Resumen

`setswana-sentiment-afroxlmr-large` es un modelo de clasificación de texto derivado por ajuste fino (*fine-tuning*) de `Davlan/afro-xlmr-large`, un transformer encoder basado en la arquitectura XLM-RoBERTa-large adaptado por Davlan al multilingüismo africano. El autor del ajuste es el usuario de Hugging Face Ido-shraga, y el modelo está publicado con licencia MIT. Su propósito declarado es el análisis de sentimiento en setsuana (tswana), una lengua bantú hablada principalmente en Botsuana y Sudáfrica.

El modelo cuenta con 559.893.507 parámetros (según los pesos en safetensors) y se distribuye en un repositorio de 1,1 GB. Es un modelo exclusivamente de clasificación: no genera texto ni soporta tool calling. Su relevancia radica en cubrir una lengua de bajos recursos para la que existen muy pocos recursos supervisados de PLN, aprovechando el preentrenamiento multilingüe africano de AfroXLMR.

Ahora bien, los resultados reportados por el autor son muy modestos: accuracy de 0,4306 y F1 macro de 0,2007 sobre el conjunto de evaluación, con una pérdida de validación de 1,0129. Estos valores, junto con la ausencia de información sobre el conjunto de datos de entrenamiento y de resultados en el model-index, indican que se trata de un modelo experimental más que de un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large, ajustado sobre AfroXLMR-large) |
| Parametros totales | 559.893.507 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (XLM-RoBERTa-large admite hasta 512 tokens, aunque el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica de PyTorch, no declarada por el autor) |
| Idiomas soportados | no disponible en la model card; orientado a setsuana (tswana) segun el nombre del modelo |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de tipo XLM-RoBERTa-large, con 24 capas, 16 cabezas de atención y un tamaño de representación oculto de 1024 dimensiones, del que resultan los 559,9 millones de parámetros. El modelo base, `Davlan/afro-xlmr-large`, es un ajuste de XLM-RoBERTa-large sobre corpus africanos, lo que proporciona al modelo una tokenización y representaciones más adecuadas para lenguas subsaharianas que el XLM-R original. Sobre esta base se ha añadido una cabeza de clasificación de secuencias para la tarea de análisis de sentimiento.

El procedimiento de entrenamiento declarado emplea el `Trainer` de Hugging Face con los siguientes hiperparámetros: tasa de aprendizaje de 2e-05, tamaño de lote de entrenamiento de 16, tamaño de lote de evaluación de 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, planificador lineal con 86 pasos de calentamiento y 5 épocas completas (865 pasos en total). El conjunto de datos de entrenamiento no se especifica ("unknown dataset" en la model card). No se declara el uso de RLHF, DPO ni ninguna innovación técnica adicional; se trata de un ajuste fino supervisado convencional. Las versiones de framework empleadas son Transformers 5.23.0, PyTorch 2.15.0+cu132, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto para análisis de sentimiento en setsuana, presumiblemente con etiquetas de polaridad (positivo, negativo, neutro), aunque el número exacto de clases no se declara.
- Inferencia de etiquetas a nivel de secuencia mediante `pipeline("text-classification")` de Transformers.
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints de Hugging Face, según los tags del repositorio.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no declaradas explícitamente; hereda el multilingüismo del modelo base, pero el ajuste está orientado a setsuana.
- No dispone de modo de pensamiento (*thinking*), visión ni audio.

## Casos de uso

- Análisis de opiniones en redes sociales en setsuana: el modelo puede clasificar publicaciones y comentarios de usuarios tsuana-hablantes para monitorizar la percepción de marcas o instituciones, aprovechando el preentrenamiento africano del modelo base. No obstante, el F1 macro de 0,2007 limita seriamente la fiabilidad de esta aplicación sin un reentrenamiento previo.
- Moderación de contenido en plataformas comunitarias: filtrado preliminar de mensajes con carga emocional negativa en comunidades de Botsuana y Sudáfrica, como primera etapa de un sistema de revisión humana.
- Investigación lingüística y de PLN de bajos recursos: servir como punto de partida (*baseline*) reproducible para experimentos de análisis de sentimiento en setsuana, dado que el código de entrenamiento es estándar y los hiperparámetros están documentados.
- Etiquetado asistido de corpus: generación de etiquetas preliminares sobre grandes volúmenes de texto en setsuana para su posterior revisión por anotadores humanos, reduciendo el coste de creación de datasets.
- Análisis de encuestas y formularios abiertos: procesamiento de respuestas de texto libre recogidas en setsuana para agregar la polaridad de las opiniones en estudios de mercado o de satisfacción.
- Integración en pipelines de Hugging Face Inference Endpoints: al estar etiquetado como compatible con endpoints y TEI, puede desplegarse como servicio HTTP de clasificación de baja latencia para prototipos internos.
- Seguimiento de reputación de marca en medios locales: clasificación por lotes de artículos y tuits en setsuana para alimentar cuadros de mando de opinión pública, siempre con supervisión humana dada la baja precisión reportada.

## Benchmarks y rendimiento

Los únicos datos disponibles son los resultados de evaluación declarados por el autor en la model card. El model-index oficial del repositorio no contiene resultados (`results: []`), por lo que no hay comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Loss (validacion) | 1,0129 |
| Accuracy | 0,4306 |
| F1 macro | 0,2007 |

Evolución por época (según la model card):

| Epoca | Paso | Loss de validacion | Accuracy | F1 macro |
|---|---|---|---|---|
| 1 | 173 | 1,0131 | 0,4306 | 0,2007 |
| 2 | 346 | 1,0136 | 0,4306 | 0,2007 |
| 3 | 519 | 1,0140 | 0,4306 | 0,2007 |
| 4 | 692 | 1,0124 | 0,4306 | 0,2007 |
| 5 | 865 | 1,0129 | 0,4306 | 0,2007 |

La métrica se mantiene idéntica en todas las épocas, lo que sugiere que el modelo predice siempre la misma clase mayoritaria o que el conjunto de evaluación es insuficiente. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB para los pesos (559,9 M de parámetros × 4 bytes), más memoria para activaciones y tokenización; en la práctica, entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,1-1,5 GB, holgadamente dentro de cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100; las GPU de datacenter no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, y exportación a ONNX para inferencia optimizada. No se declara soporte de llama.cpp, Ollama ni vLLM (este último no aplica a modelos encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (cientos a miles de secuencias por segundo en lotes), pero es una estimación, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ido-shraga/setswana-sentiment-afroxlmr-large` | 559,9 M | no disponible | Clasificacion de sentimiento en setsuana | MIT | Hugging Face |
| `Davlan/afro-xlmr-large` (modelo base) | 559,9 M | 512 tokens (arquitectura XLM-R) | Representaciones multilingues africanas; requiere cabeza de tarea | MIT (segun el modelo base) | Hugging Face |
| `FacebookAI/xlm-roberta-large` | 559,9 M | 512 tokens | Representaciones multilingues generales | MIT | Hugging Face |

No se dispone de datos de rendimiento de alternativas específicas para análisis de sentimiento en setsuana en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Rendimiento muy bajo: accuracy de 0,4306 y F1 macro de 0,2007 indican que el modelo no discrimina adecuadamente entre clases; la métrica constante a lo largo de las épocas sugiere un problema de datos o de configuración del entrenamiento.
- Conjunto de datos de entrenamiento no documentado ("unknown dataset"), lo que impide evaluar la representatividad, el equilibrio de clases y la procedencia del corpus.
- No se especifican los idiomas soportados ni el número de clases de sentimiento; la model card está generada automáticamente y contiene secciones sin completar ("More information needed").
- Riesgo elevado de sesgos: al desconocerse la composición del dataset, no puede evaluarse el sesgo de dominio, de registro lingüístico ni de variedad dialectal del setsuana.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de predicciones erróneas sistemáticas y de sobreajuste a la clase mayoritaria.
- Limitación de contexto: aunque la arquitectura base admite 512 tokens, el autor no declara la longitud máxima utilizada en el ajuste; secuencias más largas podrían truncarse.
- Licencia MIT: permite uso comercial y modificación, pero el usuario debe verificar las condiciones del modelo base `Davlan/afro-xlmr-large` y de los datos de entrenamiento (no declarados).
- No apto para producción sin reentrenamiento y validación con un conjunto de evaluación representativo y suficientemente grande.
- El repositorio no tiene descargas ni *likes*, y fue creado y actualizado el mismo día (15 de noviembre de 2026), lo que apunta a un artefacto experimental sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ido-shraga/setswana-sentiment-afroxlmr-large
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-large
- Espacio de Trackio con la visualización del entrenamiento: https://huggingface.co/spaces/Ido-shraga/setswana-sentiment-static-6a0b3c
- XLM-RoBERTa-large (arquitectura de referencia): https://huggingface.co/FacebookAI/xlm-roberta-large
