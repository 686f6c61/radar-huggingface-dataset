# keras/modern_bert_base_en

## Resumen

`keras/modern_bert_base_en` es una implementación en KerasHub del modelo ModernBERT, una arquitectura de transformer encoder publicada originalmente por Answer.AI y LightOn en diciembre de 2024 como sucesora modernizada de BERT. Este repositorio concreto redistribuye los pesos en formato Keras (`.keras`), lo que permite ejecutar el modelo indistintamente sobre los backends JAX, TensorFlow y PyTorch a través de la API multi-backend de Keras 3. El modelo está configurado para la tarea de Masked Language Modeling (MaskedLM), es decir, relleno de tokens enmascarados, y no incluye cabezas de clasificación específicas.

La relevancia de esta ficha es acotada: se trata de una conversión de pesos para el ecosistema KerasHub, no de un modelo nuevo entrenado por Keras. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, la model card es autogenerada y no aporta información sobre datos de entrenamiento, licencia ni idiomas. Cualquier evaluación rigurosa del comportamiento del modelo debería remitirse a la publicación original de ModernBERT, no a esta conversión.

La arquitectura subyacente es un encoder transformer de 22 capas con atención local de ventana 128 combinada con atención global cada 3 capas, dimensión oculta 768, 12 cabezas y vocabulario de 50.368 tokens. El tamaño del repositorio (0,6 GB) es coherente con un modelo base de aproximadamente 149 millones de parámetros en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), atención local + global alternada |
| Parametros totales | no disponible (estimado ~149 M a partir de hidden_dim 768 y 22 capas; no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (ModernBERT original soporta hasta 8192 tokens; no confirmado para esta conversión) |
| Tipos de cuantizacion | no disponible (pesos en float32 según configuración `DTypePolicy`) |
| Idiomas soportados | no disponible (el sufijo `_en` sugiere entrenamiento en inglés, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | Keras (`.keras`), compatible con backends JAX, TensorFlow y PyTorch vía KerasHub |
| Vocabulario | 50.368 tokens |
| Dimensión oculta | 768 |
| Dimensión intermedia | 1152 |
| Número de capas | 22 |
| Cabezas de atención | 12 |
| Ventana de atención local | 128 |
| Atención global cada N capas | 3 |
| Rotary max wavelength | 160.000,0 |
| Local rotary max wavelength | 10.000,0 |
| Layer norm epsilon | 1e-05 |
| Tarea | MaskedLM (relleno de máscaras) |
| Librería | keras-hub |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT modernizado. Las innovaciones clave de ModernBERT respecto al BERT original, tal como se reflejan en la configuración de este repositorio, son: uso de RoPE (rotary position embeddings) en lugar de embeddings posicionales absolutos, con longitudes de onda distintas para atención local (10.000) y global (160.000); atención local con ventana de 128 tokens intercalada con capas de atención global cada 3 capas, lo que reduce el coste computacional en secuencias largas; y una dimensión intermedia de 1152, más estrecha que la proporción 4x típica de BERT (768 → 3072), lo que reduce el número de parámetros del FFN.

No se dispone de información sobre el proceso de entrenamiento en esta model card: no se indica el número de tokens, la composición del corpus, ni si hubo fases de ajuste fino supervisado o preferencias. La model card es explícitamente autogenerada y el autor no la ha completado. Tampoco se documenta si la conversión a Keras introduce diferencias numéricas respecto a los pesos originales de PyTorch, algo que conviene verificar empíricamente antes de usar el modelo en producción.

## Capacidades

- Relleno de tokens enmascarados (MaskedLM): dada una secuencia con tokens `[MASK]`, el modelo predice los tokens ausentes. Es la única tarea para la que está configurado el repositorio.
- Extracción de representaciones contextuales: al ser un encoder, las activaciones de las capas intermedias pueden usarse como embeddings para tareas downstream (clasificación, NER, similitud semántica), aunque no se incluyen cabezas específicas.
- Ejecución multi-backend: el mismo objeto de modelo funciona en JAX, TensorFlow y PyTorch mediante Keras 3 y KerasHub.
- Ajuste fino: la configuración indica `trainable: True`, por lo que el backbone puede afinarse con Keras.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento. No es un modelo generativo autoregresivo.
- Capacidades multilingües: no disponibles; el sufijo `_en` apunta a inglés, pero no hay confirmación del autor.

## Casos de uso

- Preentrenamiento y ajuste fino para clasificación de texto: el backbone puede conectarse a una capa de clasificación y afinarse con Keras sobre datasets etiquetados; su tamaño (~149 M) permite entrenar en una sola GPU consumer con batches moderados.
- Relleno de máscaras en pipelines de aumento de datos: generar variantes de frases enmascarando tokens y dejando que el modelo prediga alternativas, útil para data augmentation en tareas de NLP con pocos datos.
- Extracción de embeddings para búsqueda semántica: usar las representaciones del encoder como base para un índice vectorial, aunque sin pooling documentado habría que definir la estrategia (CLS, mean pooling) y validarla.
- Evaluación comparativa de backends en Keras: al ejecutarse en JAX, TensorFlow y PyTorch, sirve como caso de prueba para medir diferencias de latencia y precisión numérica entre backends en un mismo modelo.
- Prototipado educativo de ModernBERT: para quienes quieran inspeccionar la arquitectura (atención local/global, RoPE) sin salir del ecosistema Keras.
- Componente en pipelines de NLP con requisitos de portabilidad: al no depender de PyTorch exclusivamente, encaja en entornos donde el stack de despliegue es TensorFlow o JAX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,6 GB para los pesos, más activaciones; con batches pequeños cabe holgadamente en GPUs de 8 GB.
- VRAM estimada en float16/bfloat16: alrededor de 0,3 GB para pesos, si se convierte manualmente (no se documenta cuantización oficial).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4090) es suficiente; para entrenamiento a mayor escala, A100 o H100 aportan margen, pero no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 6 GB o más.
- Opciones de despliegue: KerasHub con backend JAX, TensorFlow o PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un encoder MaskedLM y no un modelo generativo, esas herramientas no son el objetivo natural.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `keras/modern_bert_base_en` (esta ficha) | ~149 M (estimado) | no disponible | MaskedLM | no disponible | Keras |
| ModernBERT-base original (Answer.AI / LightOn) | ~149 M | hasta 8192 tokens | MaskedLM y ajuste fino | no disponible en esta ficha | safetensors (PyTorch) |
| BERT-base (Google) | 110 M | 512 tokens | MaskedLM y ajuste fino | Apache 2.0 (habitual) | safetensors / TF |
| RoBERTa-base (Meta) | 125 M | 512 tokens | MaskedLM y ajuste fino | MIT (habitual) | safetensors / PyTorch |

Nota: los datos de los modelos comparables provienen del conocimiento general de la arquitectura y no de la información proporcionada en esta consulta; verifíquense en sus respectivas model cards antes de citarlos. Para esta conversión concreta no hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card es autogenerada y no ha sido completada por el autor: no hay información sobre licencia, idiomas, datos de entrenamiento ni evaluación.
- Licencia no disponible: no debe asumirse uso comercial permitido hasta confirmar la licencia del repositorio y la del ModernBERT original.
- Es un modelo MaskedLM, no generativo: no produce texto libre ni mantiene conversaciones; no sirve para casos de uso de chat o agentes.
- Riesgo de alucinación en las predicciones de tokens enmascarados: el relleno puede ser plausible pero incorrecto, especialmente en dominios especializados.
- Idiomas: el sufijo `_en` sugiere inglés, pero no está confirmado; el rendimiento en castellano es desconocido y probablemente limitado.
- Longitud de contexto: no documentada en esta conversión; no debe asumirse la ventana de 8192 tokens del ModernBERT original sin verificarla.
- Conversión de pesos: no se documenta la fidelidad numérica respecto al modelo original de PyTorch; conviene validar con un conjunto de prueba antes de usarlo en producción.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validación por terceros.
- Sin cabeza de clasificación ni pooling documentado: para tareas downstream hay que definir y entrenar la cabeza correspondiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/keras/modern_bert_base_en
- Documentación de ModernBert en KerasHub: https://keras.io/api/keras_hub/models/modern_bert
- Documentación de Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Keras en Wikipedia: https://en.wikipedia.org/wiki/Keras
- Keras en Wikipedia (francés): https://fr.wikipedia.org/wiki/Keras
- Introducción a Keras en GeeksforGeeks: https://www.geeksforgeeks.org/deep-learning/what-is-keras/
