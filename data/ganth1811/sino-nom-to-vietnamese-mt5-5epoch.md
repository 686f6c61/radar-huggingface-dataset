# Ganth1811/sino-nom-to-vietnamese-mt5-5epoch

## Resumen

El modelo `Ganth1811/sino-nom-to-vietnamese-mt5-5epoch` es un sistema de traducción automática neuronal especializado en convertir texto en chino-nom (Chữ Nôm) a vietnamita moderno. Fue desarrollado por el usuario Ganth1811 y publicado en Hugging Face el 25 de agosto de 2026. Se basa en la arquitectura mT5 (Multilingual T5), un modelo encoder-decoder de tipo Transformer desarrollado por Google Research, y ha sido afinado durante cinco épocas para la tarea específica de traducción sino-nom.

El modelo cuenta con 582.401.280 parámetros, lo que corresponde al tamaño de mT5-base, y se distribuye en formato safetensors con un peso total de 2,4 GB. Su relevancia radica en que el chữ Nôm es un sistema de escritura histórica vietnamita que ha caído en desuso, y su traducción automática es útil para la preservación y el estudio de textos históricos, literarios y culturales. Aunque la ficha técnica del autor es muy escasa, la arquitectura subyacente está bien documentada gracias al paper de mT5 (arXiv:1910.09700).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 (encoder-decoder Transformer) |
| Parametros totales | 582.401.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el par de trabajo es sino-nom → vietnamita) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en mT5, una variante multilingüe de T5 (Text-to-Text Transfer Transformer) desarrollada por Google Research. La arquitectura es un Transformer encoder-decoder con atención completa, donde todas las tareas se formulan como problemas de generación de texto. El modelo mT5-base tiene 12 capas en el encoder y 12 en el decoder, con una dimensionalidad oculta de 768 y 12 cabezas de atención.

El proceso de entrenamiento consistió en un fine-tuning del modelo mT5-base sobre un conjunto de datos de pares sino-nom→vietnamita, durante 5 épocas. No se han publicado detalles sobre el dataset utilizado, el número de ejemplos, el régimen de entrenamiento (precisión mixta, hiperparámetros) ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica en el nombre del modelo que se realizaron 5 épocas de fine-tuning, pero no proporciona más información al respecto.

## Capacidades

- **Traducción de chino-nom a vietnamita moderno**: la tarea principal del modelo, capaz de convertir textos en Chữ Nôm (caracteres han-nom) al vietnamita contemporáneo.
- **Generación de texto condicionada**: al ser un modelo text2text, puede recibir cualquier cadena de texto como entrada y generar una traducción en vietnamita.
- **Procesamiento de secuencias largas**: al estar basado en mT5, hereda la capacidad de manejar secuencias de entrada relativamente extensas, aunque la longitud exacta de contexto no está documentada.
- **Soporte de decodificación con beam search**: se puede utilizar con técnicas de búsqueda como beam search o sampling para mejorar la calidad de la traducción.
- **Sin capacidades de tool calling**: no es un modelo de agentes, no soporta function calling ni integración con herramientas externas.
- **Sin capacidades multimodales**: no procesa imágenes, audio ni vídeo; es exclusivamente texto a texto.

## Casos de uso

- **Digitalización de manuscritos históricos**: el modelo puede traducir documentos en Chữ Nôm escaneados (tras OCR) a vietnamita moderno, facilitando su estudio y catalogación en bibliotecas y archivos nacionales.
- **Estudios académicos de literatura vietnamita**: investigadores que trabajan con poemas, novelas y textos religiosos en Chữ Nôm pueden usar el modelo como herramienta de apoyo para obtener traducciones preliminares rápidas antes de la revisión manual.
- **Preservación cultural y divulgación**: instituciones culturales pueden emplear el modelo para crear versiones modernas de textos históricos, permitiendo que el público general acceda a la herencia literaria vietnamita.
- **Anotación de corpus para NLP**: el modelo puede generar traducciones automáticas que sirvan como base para construir corpus paralelos sino-nom-vietnamés, que luego se usen para entrenar otros modelos.
- **Asistencia en genealogía y documentos familiares**: muchas familias vietnamitas conservan documentos en Chữ Nôm; el modelo puede ayudar a traducir estos registros para su interpretación.
- **Traducción de inscripciones y placas conmemorativas**: en pagodas y templos vietnamitas hay inscripciones en Chữ Nôm; el modelo facilita la traducción para guías turísticos y publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (BLEU, chrF, etc.) ni comparaciones con otros sistemas de traducción sino-nom. Tampoco se han encontrado evaluaciones independientes del modelo en la web.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 582M parámetros, el modelo requiere aproximadamente 2,3 GB de VRAM en fp32, 1,2 GB en fp16 y menos de 0,6 GB en cuantización int8 (si se cuantiza).
- **GPU recomendadas**: una GPU consumer con 4 GB de VRAM es suficiente para inferencia en fp16; una RTX 3060 o superior sería ideal. Para entrenamiento o fine-tuning adicional se recomienda una GPU con al menos 8 GB de VRAM.
- **Compatibilidad con GPU consumer**: sí, cabe en la mayoría de GPUs modernas, incluyendo GTX 1660 Super, RTX 2060, RTX 3060, etc.
- **Opciones de despliegue**: al ser un modelo Transformers estándar, se puede servir con vLLM, Hugging Face Inference Endpoints, TGI (Text Generation Inference) o directamente con la biblioteca `transformers` en Python. Para CPU, se puede exportar a ONNX o usar `optimum-intel`.
- **Latencia y throughput**: no hay datos publicados, pero en una GPU moderna (RTX 3090) se puede esperar una latencia de menos de 1 segundo para secuencias cortas y un throughput de decenas de peticiones por segundo con batching.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| `Ganth1811/sino-nom-to-vietnamese-mt5-5epoch` | mT5-base | 582M | no disponible | Traducción sino-nom → vietnamita | no disponible |
| `minhtoan/t5-translate-vietnamese-nom` | T5 | pequeño (no especificado) | no disponible | Traducción sino-nom → vietnamita | no disponible |
| `minhtoan/t5-translation-vietnamese-nom` | T5 | pequeño (no especificado) | no disponible | Traducción sino-nom → vietnamita | no disponible |
| `HiIamPhuc/ChineseNom-translator-by-transformer` | MT5 | no especificado | no disponible | Traducción sino-nom → vietnamita | no disponible |

Los modelos de `minhtoan` son anteriores y usan T5, mientras que el de `Ganth1811` usa mT5, lo que le permite un mejor manejo de vocabulario multilingüe. El de `HiIamPhuc` también usa mT5 pero no se documenta su tamaño ni su estado de entrenamiento. No hay datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- **Sin licencia especificada**: el modelo no tiene licencia declarada, lo que implica que no se puede garantizar su uso comercial o redistribución sin autorización del autor.
- **Datos de entrenamiento no documentados**: se desconoce el tamaño, la composición y la calidad del dataset de entrenamiento, lo que puede afectar a la cobertura de vocabulario y dialectos del Chữ Nôm.
- **Riesgo de alucinación**: como todo modelo de traducción, puede generar salidas fluidas pero incorrectas, especialmente con textos ambiguos o muy antiguos.
- **Limitaciones de contexto**: al no estar documentada la longitud máxima de entrada, no se puede garantizar el manejo de documentos largos (el mT5-base tiene un límite de 512 tokens por defecto, pero el fine-tuning podría haberlo ajustado).
- **Sin evaluación publicada**: no hay resultados de BLEU ni de otras métricas, lo que impide validar su calidad frente a otros sistemas.
- **Idioma objetivo limitado**: solo traduce a vietnamita moderno; no es útil para otros pares de idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganth1811/sino-nom-to-vietnamese-mt5-5epoch
- Modelo similar de minhtoan (T5): https://huggingface.co/minhtoan/t5-translate-vietnamese-nom
- Modelo similar de minhtoan (T5): https://huggingface.co/minhtoan/t5-translation-vietnamese-nom
- Repositorio de traducción chino-nom con MT5: https://github.com/HiIamPhuc/ChineseNom-translator-by-transformer
- Paper de mT5 (Google Research): https://github.com/google-research/multilingual-t5
- Paper de referencia (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
