# ananthu-aniraj/ifam-cub-k8

## Resumen

IFAM (Iterative Focus and Attention Masking) es un framework de clasificación de imágenes en dos etapas propuesto en el artículo "Two-stage Vision Transformers and Hard Masking offer Robust Object Representations", aceptado como presentación oral en ICPR 2026. El checkpoint `ifam-cub-k8` es el modelo preentrenado oficial sobre el dataset Caltech-UCSD Birds-200-2011 (CUB) con 8 partes descubiertas (K=8). El modelo está desarrollado por Ananthu Aniraj y colaboradores, y su objetivo principal es mejorar la robustez de las representaciones visuales frente a correlaciones espurias y fondos fuera de distribución.

La arquitectura consta de dos etapas: un selector que procesa la imagen completa para descubrir partes del objeto y regiones relevantes, y un predictor que restringe su campo receptivo a esas regiones mediante enmascaramiento de atención, evitando así que detalles de fondo irrelevantes influyan en la clasificación. El modelo se basa en un ViT con pesos de DINOv2 (según las etiquetas del repositorio) y cuenta con 173,5 millones de parámetros. Su relevancia actual radica en que aborda un problema clave en visión por computador: la dependencia de correlaciones espurias en clasificadores entrenados con datasets naturales, ofreciendo además máscaras semánticas auditable que permiten intervenciones en tiempo de prueba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer de dos etapas (selector + predictor) con enmascaramiento de atención, basado en DINOv2 |
| Parametros totales | 173.493.509 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

IFAM emplea un enfoque de dos etapas. En la primera etapa, un módulo selector procesa la imagen completa y descubre partes del objeto (en este caso, 8 partes para CUB) mediante un mecanismo de atención que identifica regiones relevantes para la tarea. En la segunda etapa, un módulo predictor recibe la imagen con un enmascaramiento de atención duro (hard masking) que restringe su campo receptivo únicamente a las regiones seleccionadas, eliminando así la influencia de fondos espurios. Esta separación permite que el predictor se centre exclusivamente en las características del objeto, mejorando la robustez ante cambios de fondo y correlaciones accidentales.

El entrenamiento se realizó sobre el dataset CUB (Caltech-UCSD Birds-200-2011), que contiene 200 especies de aves. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (al ser un modelo de visión, estas técnicas no son habituales). El artículo asociado (arXiv:2506.08915) describe el método completo, incluyendo la formulación del enmascaramiento y las estrategias de entrenamiento. El modelo se distribuye con pesos en formato safetensors y se carga mediante la clase `FullTwoStageModelDoubleClassify` del repositorio oficial.

## Capacidades

- Clasificación de imágenes de aves: el modelo está entrenado específicamente para clasificar 200 especies del dataset CUB.
- Descubrimiento de partes: la primera etapa identifica hasta 8 partes del objeto de forma no supervisada, lo que permite interpretar qué regiones de la imagen son relevantes para la decisión.
- Robustez ante correlaciones espurias: al enmascarar el fondo, el modelo reduce la dependencia de pistas contextuales no relacionadas con el objeto.
- Máscaras semánticas auditable: las máscaras generadas son explícitas, lo que permite inspeccionar visualmente el razonamiento del modelo y aplicar intervenciones en tiempo de prueba.
- Intervenciones en test-time: gracias a la naturaleza explícita de las máscaras, es posible modificar manualmente las regiones seleccionadas para estudiar o mejorar el comportamiento del modelo.
- Integración con el ecosistema PyTorch: al ser un modelo PyTorch estándar, se puede integrar en pipelines de investigación y desarrollo con las herramientas habituales.

## Casos de uso

- Investigación en robustez de representaciones: el modelo sirve como banco de pruebas para estudiar cómo el enmascaramiento de atención afecta a la generalización ante fondos nuevos o correlaciones espurias. Se puede comparar con un ViT estándar para medir la mejora en escenarios de distribución shift.
- Análisis de interpretabilidad en visión: las máscaras de partes generadas por el selector permiten visualizar qué regiones de la imagen son decisivas para la clasificación, útil para estudios de explicabilidad y para validar hipótesis sobre el comportamiento del modelo.
- Desarrollo de sistemas de clasificación de especies en entornos controlados: aunque el modelo está limitado a aves, puede servir como punto de partida para adaptar el framework IFAM a otros dominios con datasets propios, reentrenando las dos etapas.
- Evaluación de intervenciones en tiempo de prueba: dado que las máscaras son editables, se puede experimentar con la eliminación o adición de regiones para medir su impacto en la precisión, lo que resulta valioso para entender la causalidad en la decisión del modelo.
- Comparación con métodos de descubrimiento de partes: el modelo puede utilizarse como referencia para evaluar otros enfoques de part discovery, como PdiscoFormer, sobre el mismo dataset CUB.
- Docencia y divulgación en visión por computador: al ser un modelo de tamaño moderado (173M parámetros) y con licencia Apache 2.0, es adecuado para demostraciones educativas sobre arquitecturas de dos etapas y enmascaramiento de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (arXiv:2506.08915) describe experimentos que demuestran mejoras en robustez frente a correlaciones espurias y fondos fuera de distribución, pero no se incluyen cifras concretas en la model card ni en los metadatos del repositorio. Se recomienda consultar el paper para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 173,5 millones de parámetros, los pesos en FP32 ocupan aproximadamente 694 MB. En FP16, unos 347 MB. Considerando la activación y el procesamiento de imágenes de 518x518 píxeles, se estima un consumo de VRAM entre 2 y 4 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en lotes pequeños. Para entrenamiento o fine-tuning, se recomienda una GPU con 8 GB o más (por ejemplo, RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4060 (8 GB) sin problemas.
- Opciones de despliegue: al ser un modelo PyTorch estándar, se puede servir con TorchServe, o exportar a ONNX para inferencia optimizada. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia o throughput para este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El propio autor publica un modelo relacionado, `pdiscoformer_cub_k_8`, que también utiliza un ViT base DINOv2 con 8 partes sobre CUB, pero no se proporcionan métricas comparativas en la información disponible. Se recomienda consultar el artículo para ver comparaciones con otros métodos de descubrimiento de partes y clasificación robusta.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el dataset CUB (aves), por lo que su capacidad de generalización a otras categorías de objetos es limitada. No debe utilizarse como clasificador genérico de imágenes.
- Al ser un modelo de investigación, no se ha optimizado para producción. No se garantiza un rendimiento estable en entornos con variaciones extremas de iluminación, oclusión o resolución.
- No se han documentado sesgos específicos, pero al entrenarse con un dataset de aves, es probable que el modelo dependa de características propias de las especies y pueda fallar con imágenes de aves poco representadas o con fondos muy atípicos.
- El riesgo de alucinación no aplica directamente, al ser un modelo discriminativo de clasificación, pero sí puede producir clasificaciones erróneas con alta confianza si la imagen contiene patrones similares a los de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías. Se recomienda validar su rendimiento en el dominio de aplicación antes de desplegarlo.
- No se proporcionan cuantizaciones precalculadas ni soporte para frameworks de inferencia de alto rendimiento, lo que puede limitar su uso en entornos con restricciones de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ananthu-aniraj/ifam-cub-k8
- Artículo en arXiv: https://arxiv.org/abs/2506.08915
- Repositorio GitHub: https://github.com/ananthu-aniraj/ifam
- Página personal del autor: https://ananthu-aniraj.github.io/
- Modelo relacionado PdiscoFormer: https://huggingface.co/ananthu-aniraj/pdiscoformer_cub_k_8
