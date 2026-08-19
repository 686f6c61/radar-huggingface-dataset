# SimpleTuner/open-rvq-encoder-minimax-music-3-41m-v1-wip

## Resumen

El modelo `SimpleTuner/open-rvq-encoder-minimax-music-3-41m-v1-wip` es un encoder de audio a códigos RVQ (Residual Vector Quantization) desarrollado por el equipo de SimpleTuner (bghira) como un trabajo en progreso. Su objetivo es aproximar la ruta de codificación que utiliza el generador de música MiniMax Music 3, que actualmente no dispone de un encoder público. El modelo toma latentes DAV (de un codificador Flow-VAE congelado) y produce distribuciones sobre 8 codebooks RVQ: uno semántico con vocabulario de 16 384 tokens y siete acústicos con 1 024 tokens cada uno. Con 40 978 944 parámetros y un contexto de 128 tramas (5,12 segundos), está diseñado para ser ligero y entrenable con recursos moderados.

Este encoder no es un modelo oficial de MiniMax, no utiliza pesos ni código fuente originales, y se entrena mediante destilación inversa sobre un dataset de pistas sintéticas generadas por MiniMax Music 3. La relevancia actual radica en que permite reconstruir el flujo de codificación necesario para alimentar el modelo de lenguaje y el difusor de MiniMax Music 3, habilitando así la generación de música condicionada por texto y letras sin depender del encoder propietario. El proyecto se encuentra en fase WIP: los checkpoints se suben durante el entrenamiento y aún no se ha establecido la generalización con audio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional de 8 capas con stem convolucional (Conv1d), stack residual local y 8 cabezas de lectura `mup.MuReadout` |
| Parametros totales | 40 978 944 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 tramas semanticas (5,12 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no textual) |
| Licencia | no disponible |
| Formato de pesos | pytorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

La arquitectura combina una etapa convolucional local con un transformer global. Primero, un stem Conv1d (128 → 512, kernel 7) procesa los latentes DAV, seguido de un stack residual de 3 bloques con dilaciones 1, 3 y 9, GroupNorm y convoluciones kernel-3 y kernel-1. Después, un average-pooling exacto agrupa los latentes DAV en tramas de 25 Hz (la matriz de pooling se suministra por muestra, no es un remuestreo fijo, lo que preserva la alineación de chunks cosidos). Se añaden posiciones aprendidas y se aplican 8 capas de transformer pre-norm (ancho 512, 8 cabezas, FFN 2048, GELU, dropout 0,1). Finalmente, una LayerNorm y ocho cabezas `MuReadout` independientes producen las distribuciones de cada codebook.

El entrenamiento utiliza el paquete `microsoft/mup` (μP) con una familia de anchos base (128), delta (256) y objetivo (512), manteniendo la dimensión de cabeza fija en 64. Las cabezas de lectura se inicializan a cero, lo que produce distribuciones uniformes al inicio. El dataset es `bghira/minimax-music3-rvq-reverse-distillation`, con 2 837 registros de entrenamiento y 135 de validación (aproximadamente 178 GB de pistas sintéticas). El entrenador re-encoda el audio con `SimpleTuner/MiniMax-Music-3-Encoder` para obtener latentes DAV, que se cachean y se acceden mediante `safetensors.safe_open(...).get_slice(...)`. No se consumen los latentes flow-VAE almacenados en el dataset. El modelo se entrena con MuAdamW y una tasa de aprendizaje de 3e-4, aunque no se presenta como resultado de un barrido completo de hiperparámetros.

## Capacidades

- Predicción de distribuciones de códigos RVQ: genera un tensor de logits por cada uno de los 8 codebooks (1 semántico de 16 384 y 7 acústicos de 1 024).
- Conversión de audio a flujo de códigos discretos: mediante argmax sobre las distribuciones, produce una secuencia de códigos que puede ser reproducida por el LM y el difusor de MiniMax Music 3.
- Procesamiento de latentes DAV: acepta como entrada latentes de 128 canales provenientes de un codificador Flow-VAE congelado, no características mel.
- Manejo de contexto temporal de 5,12 segundos: suficiente para capturar estructuras musicales locales y transiciones.
- Alineación precisa con chunks cosidos: la matriz de pooling dinámica permite procesar pistas largas sin desalineación entre segmentos.
- Entrenamiento con μP (μTransfer): la inicialización y el escalado de optimizador son compatibles con la familia de anchos, lo que facilita el escalado a modelos mayores.
- No soporta generación de audio directamente: es un encoder, no un decodificador ni un modelo generativo.

## Casos de uso

- Reconstrucción del pipeline de MiniMax Music 3: el encoder permite sustituir el componente propietario de codificación RVQ, posibilitando la generación de música completa (condicionada por texto y letras) en entornos donde no se dispone del encoder original.
- Investigación en destilación inversa: sirve como banco de pruebas para estudiar cómo aproximar representaciones discretas de audio a partir de latentes continuos, con aplicaciones en compresión y modelado generativo.
- Desarrollo de herramientas de edición musical: al obtener códigos RVQ, se pueden manipular o reordenar los códigos semánticos y acústicos para modificar aspectos como la letra o el timbre antes de la decodificación.
- Entrenamiento de modelos de lenguaje musical: los códigos generados pueden usarse como tokens de entrada para entrenar LMs autoregresivos especializados en música, sin depender de datasets propietarios.
- Evaluación de calidad de codificación: permite comparar la fidelidad de la reconstrucción al re-proyectar los códigos a través del decodificador de MiniMax Music 3, midiendo la pérdida de información semántica y acústica.
- Prototipado de sistemas de generación musical de bajo coste: al ser un modelo de 41M, puede ejecutarse en GPUs consumer, facilitando experimentos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo está en fase WIP y no se reportan métricas como MMLU, HumanEval o similares (al ser un modelo de audio, los benchmarks estándar de texto no aplican). Tampoco se proporcionan métricas de calidad de reconstrucción o fidelidad de los códigos.

## Requisitos de hardware

No se especifican requisitos oficiales de hardware en la documentación disponible. Dado el tamaño del modelo (41M parámetros), es razonable esperar que quepa en GPUs consumer con al menos 8 GB de VRAM, pero no hay datos confirmados de latencia o throughput. Las opciones de despliegue típicas para modelos PyTorch de este tamaño incluyen inferencia con `transformers` (una vez se añada un loader `from_pretrained`), o exportación a formatos como ONNX o GGUF para ejecución en CPU/GPU ligera. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables públicos en la información proporcionada. Se mencionan trabajos independientes de `Serveurperso` y `marduk191` como referencias en la model card, pero no se proporcionan detalles de sus arquitecturas o resultados.

## Limitaciones y advertencias

- Trabajo en progreso: los checkpoints se suben durante el entrenamiento y pueden contener estados intermedios no óptimos.
- No es un modelo oficial de MiniMax: no utiliza pesos ni código fuente originales, por lo que su comportamiento puede diferir del encoder real.
- Generalización con audio real no establecida: el entrenamiento se realiza sobre pistas sintéticas generadas por MiniMax Music 3, por lo que el rendimiento con audio real (grabaciones, voces humanas) es incierto.
- No incluye un cargador `from_pretrained` empaquetado: el uso requiere construir manualmente la arquitectura y cargar los pesos.
- Contexto limitado a 5,12 segundos: no hay estado entre ventanas, lo que puede afectar la coherencia en pistas más largas.
- Licencia no especificada: no se indica si el modelo puede usarse comercialmente o con restricciones.
- Riesgo de alucinación en la reconstrucción: al ser un encoder aproximado, los códigos generados pueden no corresponder fielmente al audio de entrada, especialmente en segmentos fuera de la distribución de entrenamiento.
- Dependencia de componentes externos: requiere el codificador DAV (`SimpleTuner/MiniMax-Music-3-Encoder`) y el decodificador de MiniMax Music 3 para su uso completo, que pueden no estar disponibles públicamente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music-3-41m-v1-wip)
- [Dataset de entrenamiento](https://huggingface.co/datasets/bghira/minimax-music3-rvq-reverse-distillation)
- [Repositorio SimpleTuner en GitHub](https://github.com/bghira/SimpleTuner)
- [Documentación de MiniMax Music 3 Quickstart](http://docs.simpletuner.io/quickstart/MINIMAX_MUSIC/)
- [Repositorio cog-minimax-music-3-extractor](https://github.com/SimpleTuner-io/cog-minimax-music-3-extractor)
- [Paquete microsoft/mup](https://github.com/microsoft/mup)
