# Luisr-ecu/mBART51

## Resumen

El modelo **Luisr-ecu/mBART51** es un fine-tune del modelo multilingüe **facebook/mbart-large-50** orientado a la traducción entre inglés y español, con especial atención al registro coloquial conocido como *spanglish*. Ha sido desarrollado por Luisr-ecu, estudiante de informática en la East Carolina University, y publicado en Hugging Face con licencia Apache 2.0. El modelo se presenta como una herramienta de traducción automática neuronal (NMT) para el par de idiomas en-es, utilizando el dataset propio `Luisr-ecu/spanglish` para el ajuste fino.

La relevancia de este modelo radica en su especialización en un fenómeno lingüístico híbrido (mezcla de inglés y español) que los traductores estándar suelen manejar mal. Al partir de mBART-50, hereda una arquitectura transformer encoder-decoder con 610 millones de parámetros y una ventana de contexto de 1024 tokens, aunque el fine-tune reduce su alcance a los dos idiomas mencionados. La model card publicada es mínima y no incluye detalles de entrenamiento ni métricas de evaluación, por lo que esta ficha se basa en las características conocidas del modelo base y en la información declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) |
| Parametros totales | 610 millones (modelo base mBART-50) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es (fine-tune); el modelo base soporta 50 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en **mBART-50**, un transformer encoder-decoder preentrenado con un objetivo de denoising multilingüe. La arquitectura consta de 12 capas de encoder y 12 de decoder, con 16 cabezas de atención y una dimensión de embedding de 1024. El preentrenamiento original se realizó sobre 50 idiomas con un corpus multilingüe masivo, y el modelo fue posteriormente fine-tuneado para traducción supervisada. En este caso, el autor ha realizado un ajuste fino adicional sobre el dataset `Luisr-ecu/spanglish`, que contiene pares de frases en inglés y español con mezcla de código (*code-switching*). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni el uso de técnicas como RLHF o DPO. Tampoco se especifican los hiperparámetros del fine-tune (tasa de aprendizaje, épocas, régimen de precisión, etc.).

## Capacidades

- **Traducción automática en-es**: genera traducciones entre inglés y español, con especial atención al registro coloquial y al *spanglish*.
- **Generación de texto condicionada**: al ser un modelo seq2seq, puede producir texto de salida a partir de una secuencia de entrada, útil para tareas de paráfrasis o simplificación si se adapta.
- **Soporte multilingüe limitado**: aunque el modelo base soporta 50 idiomas, este fine-tune se ha especializado únicamente en en/es, por lo que el uso con otros idiomas no está garantizado.
- **No soporta tool calling ni agentes**: al ser un modelo de traducción puro, no dispone de capacidades de razonamiento multi-paso ni de invocación de herramientas.
- **No dispone de modo de pensamiento ni capacidades multimodales**: es exclusivamente texto a texto.

## Casos de uso

- **Traducción de contenido informal en redes sociales**: el modelo puede traducir publicaciones, comentarios o mensajes que mezclan inglés y español, un escenario donde los traductores estándar suelen fallar. Se usaría mediante la API de transformers con un pipeline de traducción.
- **Localización de aplicaciones móviles**: para apps dirigidas a comunidades hispanohablantes en Estados Unidos, donde el *spanglish* es habitual, el modelo puede generar traducciones más naturales que las de motores genéricos.
- **Transcripción y subtitulado de vídeos**: al aceptar secuencias de hasta 1024 tokens, puede procesar fragmentos de diálogo y producir subtítulos en el idioma destino, manteniendo el tono coloquial.
- **Asistencia en atención al cliente bilingüe**: integrado en un sistema de chat, puede traducir consultas de clientes que usan *spanglish* al idioma del agente, mejorando la comprensión en tiempo real.
- **Preprocesamiento de datos para NLP**: sirve para normalizar corpus mixtos en inglés-español, convirtiéndolos a un solo idioma antes de aplicar otros modelos de análisis.
- **Educación y aprendizaje de idiomas**: puede usarse como herramienta de práctica para estudiantes que quieran ver cómo se traducen expresiones coloquiales mixtas, aunque sin garantías de precisión académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como BLEU o chrF, a pesar de que se declaran en los metadatos. No se puede comparar cuantitativamente con otros modelos de traducción en-es sin datos verificables.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en fp16, el modelo de 610M parámetros requiere aproximadamente 1,2 GB de VRAM solo para los pesos, más memoria para activaciones y el tokenizador. En la práctica, se recomienda al menos 4 GB de VRAM para secuencias de longitud media.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. Una RTX 4090 o A100 permitirían procesar lotes mayores y secuencias más largas.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo medio (8 GB de VRAM son suficientes para la mayoría de casos).
- **Opciones de despliegue**: se puede ejecutar con la librería `transformers` de Hugging Face, con `pipeline("translation", model="Luisr-ecu/mBART51")`. También es compatible con ONNX Runtime para optimización en CPU. No es compatible con vLLM ni llama.cpp, ya que estos se centran en modelos decoder-only.
- **Latencia y throughput**: no se han publicado datos. Como referencia, mBART-50 en una GPU moderna (RTX 3090) suele generar entre 20 y 50 tokens por segundo en fp16, pero esto depende de la longitud de la secuencia y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luisr-ecu/mBART51 | 610M | 1024 | en, es | Apache 2.0 | Fine-tune de mBART-50 para spanglish |
| facebook/mbart-large-50 | 610M | 1024 | 50 | MIT | Modelo base multilingüe |
| Helsinki-NLP/opus-mt-en-es | ~300M | 512 | en, es | Apache 2.0 | Traductor en-es específico, más ligero |
| facebook/nllb-200-distilled-600M | 600M | 1024 | 200 | CC-BY-NC | Traductor multilingüe de alta calidad, pero con restricciones de uso comercial |

La comparación es orientativa, ya que no se dispone de benchmarks del fine-tune. El modelo de Helsinki es más pequeño y rápido, pero no maneja *spanglish*. NLLB-200 tiene mejor cobertura multilingüe, pero su licencia no permite uso comercial sin permiso.

## Limitaciones y advertencias

- **Model card incompleta**: no se documentan los datos de entrenamiento, hiperparámetros ni métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el rendimiento.
- **Riesgo de alucinación**: al ser un modelo de traducción, puede generar frases gramaticalmente correctas pero semánticamente incorrectas, especialmente con *spanglish* no representado en el dataset de entrenamiento.
- **Sesgos potenciales**: el dataset `Luisr-ecu/spanglish` no está documentado, por lo que puede contener sesgos geográficos o sociolingüísticos (por ejemplo, variantes del español de Estados Unidos frente a otros países).
- **Limitación de idiomas**: aunque el modelo base soporta 50 idiomas, el fine-tune solo garantiza calidad en en/es. Usarlo con otros idiomas puede producir resultados degradados.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base mBART-50 tiene licencia MIT, por lo que no hay conflicto. Sin embargo, el dataset de entrenamiento no tiene licencia declarada, lo que podría generar problemas legales si se usa en producción.
- **Contexto limitado**: 1024 tokens es suficiente para frases y párrafos, pero no para documentos largos. Para traducción de libros o informes extensos, se necesitaría segmentación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Luisr-ecu/mBART51)
- [Dataset Luisr-ecu/spanglish](https://huggingface.co/datasets/Luisr-ecu/spanglish)
- [Documentación de mBART en Hugging Face](https://huggingface.co/docs/transformers/v4.26.1/en/model_doc/mbart)
- [Paper original de mBART (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Perfil de GitHub del autor](https://github.com/LuisR-ecu)
