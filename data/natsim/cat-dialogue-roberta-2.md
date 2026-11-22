# natsim/cat-dialogue-RoBERTa-2

## Resumen

`natsim/cat-dialogue-RoBERTa-2` es un checkpoint de clasificación de texto basado en RoBERTa, afinado para asignar texto generado de diálogos de personajes animales (concretamente gatos) a seis categorías emocionales: Resting, Hunting, Fighting, Demanding, Angry y Moaning. Lo publica el usuario natsim en el marco de un proyecto de investigación colaborativa denominado PettiChat, desarrollado durante una prácticas de investigación en 2025, y su propósito es servir como herramienta de evaluación de la calidad y el tono de diálogos sintéticos generados por otros modelos.

El modelo parte de `SamLowe/roberta-base-go_emotions`, un clasificador de emociones de propósito general, y lo adapta a un espacio de etiquetas propio de seis clases orientado al dominio de diálogo de mascotas. Con 124.650.246 parámetros y un tamaño de repositorio de 1,0 GB, se trata de un checkpoint de escala base (RoBERTa-base) con cabecera de clasificación de secuencias, entrenado exclusivamente en inglés y publicado bajo licencia Apache-2.0.

Su relevancia es acotada y fundamentalmente investigadora: no es un modelo generativo ni un asistente, sino un clasificador discriminativo pensado para inspeccionar predicciones emocionales sobre texto de diálogo generado y reproducir comparaciones de investigación. El propio autor advierte de que no existe un benchmark verificado de retención para estos pesos y de que las puntuaciones softmax no son probabilidades calibradas de corrección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabecera de clasificación de secuencias (`RobertaForSequenceClassification`) |
| Parámetros totales | 124.650.246 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como valor oficial; el ejemplo de la model card trunca a 512 tokens |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/ONNX no documentadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (el modelo base `SamLowe/roberta-base-go_emotions` mantiene licencia MIT para sus materiales originales) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder RoBERTa-base estándar con una cabeza lineal de clasificación sobre el token `[CLS]`, configurada como `multi_label_classification` en el fichero de configuración guardado. No obstante, el prototipo de diálogo del proyecto selecciona una única categoría aplicando softmax sobre los logits, tal como se documenta en el ejemplo de carga. El modelo se inicializa desde `SamLowe/roberta-base-go_emotions` y se adapta a un espacio de seis etiquetas específico del proyecto.

Los detalles de entrenamiento no están documentados de forma exhaustiva en la model card: no se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste fino adicional con RLHF o DPO (no aplicable en un clasificador). Se enlaza un dataset sintético de emociones (`natsim/if-cats-could-speak`) y un cuaderno de Colab de entrenamiento, pero el autor aclara explícitamente que el cuaderno documenta experimentos relacionados y no constituye un manifiesto de ejecución inmutable para estos pesos concretos. La innovación técnica destacable es limitada: se trata de un ajuste fino supervisado de un clasificador existente a un dominio y taxonomía propios.

## Capacidades

- Clasificación de texto en seis categorías emocionales de diálogo de personajes felinos: Resting, Hunting, Fighting, Demanding, Angry y Moaning.
- Salida de logits por clase, con softmax aplicable para obtener una distribución de probabilidad sobre las seis etiquetas.
- Procesamiento de texto en inglés con tokenización RoBERTa (BPE a nivel de byte).
- Uso como componente de evaluación en pipelines de generación de diálogo (puntuación del tono emocional del texto generado).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: únicamente inglés.
- Integración con `transformers` y con Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible` en el repositorio).

## Casos de uso

- Evaluación de diálogos sintéticos generados: el clasificador permite puntuar automáticamente el tono emocional de respuestas producidas por un modelo generativo de personajes de mascotas, comparando la distribución predicha con la emoción objetivo del guion.
- Investigación en evaluación de calidad de diálogo: sirve para reproducir comparaciones entre variantes de generación o entre checkpoints, inspeccionando cómo cambia la distribución de emociones predichas ante cambios en el estilo o la formulación.
- Filtrado y anotación asistida de datasets: dado un corpus de frases de diálogo, el modelo puede preetiquetar cada frase con una de las seis categorías para revisión humana posterior, acelerando la construcción de conjuntos de datos etiquetados.
- Análisis de consistencia de personaje: en un sistema de personajes conversacionales, el clasificador puede detectar desviaciones de tono (por ejemplo, una respuesta etiquetada como "Angry" cuando el personaje debería estar en "Resting") y disparar una regeneración.
- Componente de moderación de tono en prototipos de chat: integrado como paso de postprocesado, permite marcar respuestas con carga emocional no deseada antes de mostrarlas al usuario, siempre con supervisión humana.
- Reproducción de experimentos académicos: al estar publicado con licencia Apache-2.0 y en formato `transformers`, facilita la replicación de los resultados del estudio PettiChat y la comparación con la taxonomía original de `go_emotions`.
- Servicio de inferencia ligero: por su tamaño (124,6 M de parámetros) puede desplegarse como endpoint de clasificación de baja latencia en CPU o en GPU de gama baja para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el repositorio no proporciona un benchmark verificado de retención (held-out) para este checkpoint y que las puntuaciones softmax son salidas del modelo, no probabilidades calibradas de corrección.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,5 GB para los pesos (124,6 M de parámetros × 4 bytes); en FP16/BF16, unos 0,25 GB. El repositorio ocupa 1,0 GB, lo que incluye pesos y posibles ficheros adicionales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas en términos de capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (el repositorio está etiquetado como compatible), y cualquier servidor de inferencia que soporte modelos de clasificación de secuencias. No se documentan despliegues vía llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `natsim/cat-dialogue-RoBERTa-2` | 124,6 M | No disponible (truncado a 512 en el ejemplo) | Clasificación de emociones en diálogo de mascotas (6 clases) | Apache-2.0 | Hugging Face |
| `SamLowe/roberta-base-go_emotions` | ~125 M (RoBERTa-base) | 512 tokens | Clasificación de emociones generales (28 clases GoEmotions) | MIT | Hugging Face |
| `j-hartmann/emotion-english-distilroberta-base` | ~82 M (DistilRoBERTa) | 512 tokens | Clasificación de emociones (7 clases) | No disponible en la información | Hugging Face |

La comparación se limita a clasificadores de emociones en inglés de escala similar; no se dispone de datos de rendimiento comparativo para este checkpoint concreto, por lo que la comparativa es estructural y no de calidad.

## Limitaciones y advertencias

- No existe un benchmark verificado de retención para estos pesos; el cuaderno enlazado documenta experimentos relacionados pero no es un manifiesto de ejecución inmutable.
- Las puntuaciones softmax son salidas del modelo, no probabilidades calibradas de corrección; no deben interpretarse como confianza fiable.
- El modelo está entrenado sobre fraseo sintético, lo que puede favorecer atajos léxicos (lexical shortcuts); los resultados deben validarse sobre diálogo escrito de forma independiente.
- Las clases describen texto de diálogo, no emociones reales de animales; el modelo no es una herramienta validada de evaluación de comportamiento animal ni de salud mental.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- La configuración guardada declara `multi_label_classification`, pero el prototipo aplica softmax y selecciona una única clase; es necesario aplicar la activación explícitamente para evitar comportamientos inconsistentes según el pipeline.
- Licencia Apache-2.0 para este checkpoint, con la licencia MIT del modelo base `SamLowe/roberta-base-go_emotions` relevante para sus materiales originales; conviene revisar ambas antes de uso comercial.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí riesgo de predicciones erróneas o sobreconfiadas fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo de emociones general, puede heredar sesgos léxicos y culturales del corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/natsim/cat-dialogue-RoBERTa-2
- Modelo base: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Dataset sintético de emociones: https://huggingface.co/datasets/natsim/if-cats-could-speak
- Cuaderno de entrenamiento (Colab): https://colab.research.google.com/drive/1yk_0VGDDFQGPmq1ilUdo6iXavwiKDurQ?usp=sharing
- Caso de estudio PettiChat: https://github.com/Neonat/Neonat/blob/main/docs/case-studies/pettichat-dialogue-evaluation.md
- Perfil del autor: https://huggingface.co/natsim
