# rocknonagon/distilbert-base-uncased-finetuned-emotion

## Resumen

`distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto obtenido mediante fine-tuning del checkpoint `distilbert-base-uncased` de Hugging Face. Lo publica el usuario `rocknonagon` bajo licencia Apache 2.0 y su propósito declarado es la clasificación de emociones en texto, aunque la model card no especifica el conjunto de datos de entrenamiento ni las etiquetas exactas del clasificador. Con 66.958.086 parámetros, es un modelo compacto pensado para inferencia de bajo coste.

DistilBERT es una versión destilada de BERT-base que reduce el número de capas de 12 a 6 y los parámetros de aproximadamente 110 millones a 66 millones, conservando alrededor del 97 % del rendimiento del modelo original en tareas de comprensión del lenguaje según sus autores. Esta ficha se centra en el checkpoint concreto publicado por `rocknonagon`, que añade una cabeza de clasificación ajustada sobre dicho backbone.

La relevancia del modelo es práctica: al tratarse de un encoder pequeño, entrenado con `Trainer` y exportado en `safetensors`, es adecuado para tareas de etiquetado de emociones a gran escala con requisitos de hardware mínimos. El autor reporta una accuracy de 0,9335 y un F1 de 0,9337 en el conjunto de evaluación, si bien no se documenta qué datos componen dicha evaluación ni qué etiquetas maneja el clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (DistilBERT-base soporta hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (compatible con cuantizacion dinamica de PyTorch y ONNX en funcion de la herramienta) |
| Idiomas soportados | no disponible (el modelo base es `uncased` en ingles; el fine-tuning no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB, incluye tambien otros artefactos de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento desde BERT-base. Sobre ese backbone se ha añadido una cabeza de clasificación de secuencias (`text-classification`) y se ha entrenado con la librería Transformers 5.17.0 y PyTorch 2.14.0. Los hiperparámetros declarados son: learning rate 2e-5, batch size de 64 tanto en entrenamiento como en evaluación, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y 3 épocas completas (750 pasos totales).

La model card indica explícitamente que el conjunto de datos de entrenamiento es "unknown dataset", por lo que no se puede verificar la composición del corpus, el número de ejemplos, el balance de clases ni el número de tokens procesados. Tampoco se documenta si hubo aumento de datos, validación cruzada o técnicas de regularización adicionales. La evolución de la pérdida de validación (0,2868 → 0,1786 → 0,1663) y de la accuracy (0,91 → 0,9335 → 0,9335) sugiere una convergencia temprana a partir de la segunda época, con una mejora marginal en la tercera.

No se declaran innovaciones técnicas adicionales como decodificación especulativa, atención lineal o entrenamiento con RLHF/DPO; se trata de un fine-tuning supervisado estándar con `Trainer`.

## Capacidades

- Clasificación de texto en una única etiqueta por secuencia (pipeline `text-classification`).
- Detección de emociones en texto, presumiblemente con un conjunto cerrado de categorías (no documentado en la model card).
- Inferencia rápida en CPU y GPU de gama baja gracias a sus 66 millones de parámetros.
- Compatible con `text-embeddings-inference` y con `endpoints_compatible` según los tags del repositorio, lo que facilita su despliegue como endpoint gestionado.
- No soporta tool calling ni function calling: es un modelo encoder de clasificación, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento (`thinking mode`).
- No tiene capacidades multimodales (visión, audio) ni generación de texto libre.
- Capacidades multilingües no declaradas; el backbone `uncased` está entrenado principalmente en inglés.

## Casos de uso

- Moderación de comentarios en comunidades online: clasificar mensajes de usuarios en categorías emocionales (por ejemplo, frustración, satisfacción o enfado) para priorizar la revisión humana, aprovechando el bajo coste de inferencia del modelo.
- Análisis de sentimiento y emoción en reseñas de producto: procesar grandes volúmenes de reseñas en lotes de 64 con un throughput alto en una sola GPU consumer, agregando después las distribuciones por producto.
- Enrutamiento de tickets de soporte: etiquetar automáticamente correos o mensajes entrantes según la emoción detectada para derivarlos a equipos especializados o activar protocolos de escalado.
- Monitorización de redes sociales: clasificar menciones de marca en tiempo casi real con un modelo de 66 M de parámetros que cabe holgadamente en CPU, reduciendo el coste frente a alternativas generativas.
- Investigación en psicolingüística o ciencias sociales: etiquetar corpus de texto con categorías emocionales de forma reproducible, dado que el checkpoint es pequeño y fácil de ejecutar en local.
- Preprocesado en pipelines de datos: usar el modelo como componente de filtrado o enriquecimiento antes de alimentar un LLM mayor, por ejemplo para seleccionar fragmentos con carga emocional alta antes de un resumen.
- Clasificación por lotes en entornos con recursos limitados: desplegarlo con `text-embeddings-inference` o mediante `transformers` en una instancia sin GPU, algo viable por su tamaño inferior a 70 M de parámetros.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación, extraídos de la model card:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,1663 |
| Accuracy | 0,9335 |
| F1 | 0,9337 |

Evolución durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 250 | 0,2868 | 0,9100 | 0,9099 |
| 2 | 500 | 0,1786 | 0,9335 | 0,9339 |
| 3 | 750 | 0,1663 | 0,9335 | 0,9337 |

El `model-index` del repositorio está vacío (`results: []`), por lo que no hay resultados de benchmarks estándar (MMLU, GLUE, etc.) publicados. No se han publicado resultados de benchmarks adicionales en la información disponible, y no se especifica el conjunto de evaluación empleado, lo que impide comparar estos números con los de otros modelos de clasificación de emociones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB solo para pesos (66,9 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 135 MB para pesos; en int8 dinámico, alrededor de 70 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, T4, RTX 3060 en adelante). Para lotes grandes, una A100 o H100 aportan throughput, pero no son necesarias.
- Cabe en cualquier GPU consumer moderna e incluso en CPU: es viable ejecutarlo en portátiles y en instancias cloud de gama baja.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (según los tags del repo), exportación a ONNX Runtime, y potencialmente `optimum` para cuantización. No se declara soporte explícito para vLLM ni llama.cpp (son runtimes orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en lotes de 64, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rocknonagon/distilbert-base-uncased-finetuned-emotion` | 66,9 M | no disponible (base: 512) | Clasificacion de emociones | Apache 2.0 | Hugging Face, 40 descargas |
| `distilbert-base-uncased` (Hugging Face) | 66,9 M | 512 tokens | Backbone general (enmascarado) | Apache 2.0 | Hugging Face, ampliamente usado |
| `bhadresh-savani/distilbert-base-uncased-emotion` | ~67 M | 512 tokens | Clasificacion de emociones (6 clases) | Apache 2.0 | Hugging Face, ampliamente usado |
| `j-hartmann/emotion-english-distilroberta-base` | ~82 M | 512 tokens | Clasificacion de emociones (7 clases) | MIT | Hugging Face, muy popular |

La comparación con alternativas es aproximada: no se dispone de resultados de benchmarks del checkpoint de `rocknonagon` sobre conjuntos públicos, por lo que no es posible establecer una comparación cuantitativa de rendimiento con los otros modelos de la tabla. La principal diferencia observable es la documentación: los checkpoints alternativos publican las etiquetas, el dataset y las métricas por clase, mientras que este no.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ("unknown dataset"), lo que impide auditar sesgos, balance de clases y cobertura lingüística.
- No se especifican las etiquetas del clasificador ni su número; cualquier uso en producción requiere inspeccionar `config.json` y probar el modelo con ejemplos representativos.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas o sobreconfiadas en dominios distintos al de entrenamiento.
- Sesgos potenciales heredados de `distilbert-base-uncased`: el backbone está entrenado mayoritariamente en inglés y puede reflejar sesgos de género, raza o edad presentes en los corpus originales.
- Capacidades multilingües no declaradas: no se recomienda su uso en castellano u otros idiomas sin una evaluación previa.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene conservar el aviso de licencia y revisar las condiciones del modelo base.
- El repositorio tiene 40 descargas y 0 likes en el momento de la consulta, y la model card contiene texto autogenerado sin revisar ("More information needed"), lo que indica escasa validación por parte de la comunidad.
- No se han publicado métricas por clase (precision, recall por emoción), solo agregadas; en datasets desbalanceados, la accuracy puede ocultar un rendimiento pobre en clases minoritarias.
- El checkpoint se creó con Transformers 5.17.0 y PyTorch 2.14.0, versiones futuras respecto a las actuales; verificar compatibilidad al cargarlo con versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rocknonagon/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Librería Transformers: https://github.com/huggingface/transformers
- Librería `text-embeddings-inference`: https://github.com/huggingface/text-embeddings-inference
