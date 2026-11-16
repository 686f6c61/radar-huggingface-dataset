# doCarmo023/IAnimal

## Resumen

IAnimal es un clasificador de imágenes de 10 especies animales desarrollado por doCarmo023 como proyecto académico de la disciplina de Ciencias do Ambiente del Instituto Federal Fluminense (IFF) en 2025. Se construye mediante transfer learning sobre MobileNetV2 preentrenada en ImageNet, sustituyendo la cabeza original por un bloque `Flatten → Dense(128) → Dropout(0.5) → Dense(10, softmax)`. El modelo opera sobre imágenes RGB de 96×96 píxeles y devuelve la clase predicha entre diez categorías cuyos nombres se exponen en portugués.

El interés del modelo es fundamentalmente didáctico y de demostración: ilustra un pipeline completo de fine-tuning en dos fases con Keras 3.10.0 y TensorFlow, incluyendo aumento de datos dentro del grafo del modelo y early stopping sobre `val_accuracy`. No compite con clasificadores de visión de propósito general ni con modelos fundacionales multimodales; su utilidad práctica está acotada a la clasificación cerrada de las diez especies del dataset Animals-10 de Kaggle.

La relevancia actual es limitada fuera de su contexto educativo. Con solo 0 descargas y 0 likes en el momento de la ficha, un repositorio de 0.0 GB y una accuracy de validación declarada del 86,5 % no verificada, debe tratarse como un artefacto de aprendizaje reproducible más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV2 (preentrenada en ImageNet) sin topo + Flatten + Dense(128, ReLU) + Dropout(0.5) + Dense(10, softmax) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 96×96×3) |
| Tipos de cuantizacion | no disponible (pesos en formato HDF5/Keras; no se documentan variantes cuantizadas) |
| Idiomas soportados | portugués (etiquetas de clase en pt) |
| Licencia | MIT |
| Formato de pesos | `.h5` (HDF5, Keras 3.10.0) |

## Arquitectura y entrenamiento

El modelo parte de MobileNetV2 preentrenada en ImageNet y elimina su cabeza de clasificación. Sobre la salida convolucional se aplica `Flatten`, una capa densa de 128 unidades con activación ReLU, un `Dropout` de 0.5 y una capa final densa de 10 unidades con softmax. La entrada son imágenes RGB redimensionadas a 96×96 píxeles y normalizadas con `preprocess_input` de MobileNetV2, que las lleva al rango [-1, 1]. El aumento de datos (`RandomFlip`, `RandomRotation`, `RandomZoom`, `RandomContrast`) está integrado dentro del modelo y solo se activa durante el entrenamiento.

El entrenamiento se realizó en dos fases sobre el dataset Animals-10 de Kaggle, dividido físicamente en 80 % entrenamiento y 20 % validación con proporción de clases preservada. En la fase 1 se congeló la base y se entrenó únicamente el clasificador con Adam y learning rate 1e-4. En la fase 2 se descongelaron las últimas 30 capas de MobileNetV2 y se hizo fine-tuning con Adam y learning rate 5e-6. Se aplicó early stopping sobre `val_accuracy` con paciencia de 7 épocas y restauración de los mejores pesos. El pipeline de datos usa `tf.data` mediante `image_dataset_from_directory` con prefetch. No se documenta el número de tokens ni de imágenes de entrenamiento, ni el uso de RLHF/DPO (no aplica a un clasificador de visión).

## Capacidades

- Clasificación de imágenes en 10 clases cerradas de animales: perro, caballo, elefante, mariposa, gallina, gato, vaca, oveja, araña y ardilla.
- Salida de probabilidades por clase mediante softmax, lo que permite umbralizar la confianza de la predicción.
- Inferencia sobre imágenes RGB de 96×96 píxeles con normalización específica de MobileNetV2.
- Etiquetas de salida en portugués, en el orden alfabético de las carpetas del dataset original (en italiano).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá de las etiquetas en portugués.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Demostración educativa de transfer learning: sirve para ilustrar en un curso o taller el flujo completo de congelación de base, fine-tuning parcial, aumento de datos embebido y early stopping con Keras y TensorFlow.
- Prototipado rápido de clasificadores de fauna en entornos controlados: con un conjunto de imágenes de las diez especies, se puede desplegar un clasificador funcional en minutos gracias a su tamaño reducido y a la entrada de 96×96.
- Filtrado preliminar en aplicaciones de catalogación de fotos: el modelo puede etiquetar imágenes de animales domésticos y de granja (perro, gato, caballo, vaca, oveja, gallina) para organizar galerías, siempre con revisión humana por la ausencia de clase negativa.
- Módulo de ejemplo en pipelines de MLOps: útil para probar integraciones de carga de modelos Keras desde Hugging Face Hub, versionado de artefactos `.h5` y evaluación sobre datasets de validación.
- Base para experimentos de comparación de arquitecturas ligeras: al estar construido sobre MobileNetV2, permite medir el efecto de cambios en la cabeza, el tamaño de entrada o el número de capas descongeladas.
- Clasificación de fauna en proyectos de ciencia ciudadana de bajo coste: puede ejecutarse en CPU o GPU modesta para preetiquetar lotes de imágenes de las diez especies antes de una revisión manual.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados; `verified: false`):

| Benchmark | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación de imágenes | Animals-10 (Kaggle), 20 % de validación | Accuracy de validación | 0,865 |
| Clasificación de imágenes | Animals-10 (Kaggle), 20 % de validación | Pérdida de validación | 0,42 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un clasificador de visión de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de MobileNetV2 y la entrada de 96×96, es esperable que quepa holgadamente en GPUs de gama baja, aunque el dato no está documentado.
- GPU recomendadas: no documentadas por el autor; cualquier GPU con soporte CUDA para TensorFlow es suficiente en la práctica.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna, dado el reducido tamaño de MobileNetV2 y la resolución de entrada; el autor no publica cifras concretas.
- Opciones de despliegue: TensorFlow/Keras (carga directa del `.h5` con `tf.keras.models.load_model`), exportación a TensorFlow Lite o TensorFlow.js no documentada pero técnicamente posible; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IAnimal (doCarmo023) | MobileNetV2 + cabeza densa | no disponible | Imagen 96×96×3 | 86,5 % accuracy en validación (Animals-10) | MIT | Hugging Face |
| MobileNetV2 (ImageNet) | CNN | no disponible en la información | Imagen 224×224×3 (estándar) | no disponible | Apache 2.0 (upstream) | TensorFlow/Keras, TF Hub |
| EfficientNet-B0 (ImageNet) | CNN | no disponible en la información | Imagen 224×224×3 (estándar) | no disponible | Apache 2.0 (upstream) | TensorFlow/Keras, TF Hub |
| ResNet-50 (ImageNet) | CNN | no disponible en la información | Imagen 224×224×3 (estándar) | no disponible | Apache 2.0 (upstream) | TensorFlow/Keras, TF Hub |

No se dispone de datos comparativos de rendimiento sobre Animals-10 para las alternativas en la información proporcionada; la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo conoce las diez clases de Animals-10 y no tiene clase "no es un animal": cualquier imagen (una persona, un coche) se asignará al animal más parecido.
- La entrada de 96×96 píxeles pierde detalle; animales pequeños o parcialmente ocultos tienden a producir baja confianza.
- Los errores observados en las pruebas del proyecto presentaron confianza baja (uno de ellos con 57,7 %), por lo que las predicciones con poca confianza deben tratarse con escepticismo.
- No existe un conjunto de test separado: la accuracy se midió sobre el conjunto de validación, que además guió el early stopping, por lo que la métrica está sesgada al alza.
- La métrica declarada (86,5 %) figura como no verificada en el model-index.
- Sesgos conocidos: no documentados por el autor; el dataset Animals-10 puede presentar desequilibrios de representación entre especies.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de falsos positivos forzados por la ausencia de clase negativa.
- Limitaciones de idioma: las etiquetas están en portugués; no hay soporte multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de copyright.
- Para producción: requiere calibración de umbrales de confianza, validación sobre un conjunto de test independiente y un mecanismo externo para rechazar imágenes fuera de las diez clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doCarmo023/IAnimal
- Demo (Space): https://huggingface.co/spaces/doCarmo023/ianimal
- Código de entrenamiento: https://github.com/Bren0-lz/ianimal-detector
- Dataset Animals-10 (Kaggle): no disponible como enlace directo en la información proporcionada
