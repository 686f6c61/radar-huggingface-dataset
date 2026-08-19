# Hosstia/opus-mt-zh-ru-opus-mp

## Resumen

El modelo `Hosstia/opus-mt-zh-ru-opus-mp` es un sistema de traducción automática neuronal especializado en el par chino (zh) a ruso (ru). Desarrollado por Hosstia, se basa en la arquitectura MarianMT (encoder-decoder Transformer) y se ha obtenido mediante fine-tuning del modelo `Helsinki-NLP/opus-mt-zh-en`, originalmente entrenado para chino-inglés. El proceso de ajuste se realizó sobre 450.000 pares de frases durante 25 épocas, alcanzando un BLEU de 24,55 y un chrF de 41,83 en el par zh-ru.

El modelo cuenta con 60,5 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace especialmente ligero y adecuado para su ejecución en dispositivos con recursos limitados. Su relevancia actual radica en la posibilidad de convertirlo al formato MNN (Mobile Neural Network) mediante el toolkit `mnn-opus-mt-toolkit`, permitiendo su despliegue en aplicaciones Android on-device sin necesidad de conexión a internet. La licencia Apache 2.0 facilita su uso comercial y su integración en productos propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (encoder-decoder Transformer) |
| Parametros totales | 60.554.496 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típico de MarianMT: 512 tokens) |
| Tipos de cuantizacion | safetensors (fp32), MNN (fp16) |
| Idiomas soportados | chino (zh) como origen, ruso (ru) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MNN |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MarianMT, un Transformer encoder-decoder estándar desarrollado por el equipo de Marian NMT. A diferencia de modelos más recientes con arquitecturas MoE o híbridas, MarianMT emplea atención completa y una estructura relativamente compacta, lo que facilita su ejecución en CPU y dispositivos móviles. El entrenamiento partió de los pesos de `Helsinki-NLP/opus-mt-zh-en` (un modelo chino-inglés) y se realizó un fine-tuning supervisado con 450.000 pares de frases zh-ru. No se menciona el uso de técnicas de RLHF o DPO; el ajuste se limita a un entrenamiento estándar de traducción con 25 épocas.

La principal innovación técnica del proyecto no reside en la arquitectura del modelo, sino en su conversión al formato MNN mediante el toolkit `mnn-opus-mt-toolkit`. Este proceso permite optimizar el modelo para inferencia en dispositivos Android, reduciendo el tamaño a fp16 y habilitando la traducción sin conexión. El repositorio incluye scripts automatizados (`run_all.sh`) que simplifican la conversión y el despliegue.

## Capacidades

- Traducción automática de chino a ruso con calidad media-alta (BLEU 24,55, chrF 41,83).
- Generación de texto en ruso a partir de entradas en chino, manteniendo el formato de oraciones.
- Ejecución on-device en Android gracias a la conversión a MNN, sin necesidad de conexión a internet.
- Compatible con el ecosistema Hugging Face Transformers, permitiendo integración en pipelines de Python.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de traducción.
- Capacidades multilingües limitadas al par zh-ru; no es multilingüe en sentido amplio.

## Casos de uso

- Traducción de documentos técnicos y manuales de usuario: el modelo puede procesar textos extensos en chino y generar versiones en ruso, útil para empresas que necesitan localizar documentación de forma rápida y sin infraestructura en la nube.
- Aplicación móvil de traducción offline: gracias a la conversión a MNN, el modelo puede integrarse en apps Android para traducir frases o párrafos sin conexión, ideal para viajeros o entornos con conectividad limitada.
- Traducción de contenido web en tiempo real: mediante la integración con Transformers, se puede construir un servicio de traducción automática para sitios web que reciben contenido en chino y deben servirlo en ruso.
- Asistencia en atención al cliente: en plataformas de soporte donde los usuarios escriben en chino y el equipo atiende en ruso, el modelo puede pre-traducir las consultas para agilizar la respuesta.
- Procesamiento de subtítulos y transcripciones: permite traducir subtítulos de vídeos o transcripciones de audio en chino al ruso, facilitando la distribución de contenido multimedia.
- Entrenamiento y evaluación de sistemas de traducción: al ser un modelo compacto y de licencia permisiva, sirve como punto de partida para experimentos de fine-tuning en dominios específicos (legal, médico, técnico) con conjuntos de datos propios.

## Benchmarks y rendimiento

Se han reportado los siguientes resultados en la model card:

| Metrica | Valor |
|---|---|
| BLEU | 24,55 |
| chrF | 41,83 |

No se dispone de comparaciones con otros modelos del mismo par lingüístico en la información proporcionada. Los valores indican una calidad de traducción aceptable para un modelo de este tamaño, aunque inferior a sistemas comerciales de gran escala. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo está especializado exclusivamente en traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 60,5 millones de parámetros, el modelo en fp32 ocupa aproximadamente 242 MB; en fp16 se reduce a unos 121 MB. Esto permite ejecutarlo en GPUs con 1 GB de VRAM o menos, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas como Intel Iris Xe) es suficiente. Para despliegue en servidores, una T4 o V100 sería más que adecuada.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumo actual, incluidas las de gama baja.
- Opciones de despliegue: se puede ejecutar con Hugging Face Transformers en Python, o convertirse a MNN para Android. También es compatible con frameworks de inferencia como CTranslate2 o ONNX Runtime si se exporta el modelo.
- Latencia y throughput: no hay datos oficiales, pero al ser un modelo pequeño, en CPU moderna se espera una latencia de decenas de milisegundos por frase corta; en GPU, la latencia sería aún menor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (zh-ru) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hosstia/opus-mt-zh-ru-opus-mp | 60,5M | no disponible | 24,55 | Apache 2.0 | Hugging Face, MNN |
| Helsinki-NLP/opus-mt-zh-en (base) | ~60M | no disponible | no aplicable (zh-en) | Apache 2.0 | Hugging Face |
| Hosstia/opus-mt-zh-ru-32k | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Hosstia/opus-mt-zh-ru | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de información detallada sobre los otros modelos de Hosstia (32k y versión sin sufijo) en los resultados de búsqueda. El modelo base `opus-mt-zh-en` está diseñado para otro par lingüístico, por lo que no es directamente comparable en términos de BLEU. Se recomienda consultar los repositorios de estos modelos para obtener especificaciones adicionales.

## Limitaciones y advertencias

- El modelo se ha entrenado con 450.000 pares de frases, un volumen moderado que puede no cubrir adecuadamente jerga técnica, expresiones coloquiales o dialectos regionales del chino o ruso.
- No se han documentado sesgos específicos, pero como todo modelo de traducción, puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en cuanto a género, terminología política o cultural.
- Riesgo de alucinación: aunque la traducción automática es menos propensa a generar contenido inventado que los modelos generativos, pueden producirse traducciones incorrectas o inexactas en frases ambiguas o con contexto insuficiente.
- La longitud de contexto no está especificada; MarianMT suele limitarse a 512 tokens, por lo que frases o párrafos muy largos pueden truncarse o perder información.
- El modelo solo cubre el par zh-ru; no admite otros idiomas de origen o destino sin un nuevo fine-tuning.
- La licencia Apache 2.0 permite uso comercial, pero el toolkit `mnn-opus-mt-toolkit` tiene su propia licencia (no detallada en la model card); se recomienda revisarla antes de su uso en producción.
- Al ser un modelo fine-tuneado sobre un modelo base zh-en, puede arrastrar errores de traducción del par original cuando el contexto no es claramente ruso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Hosstia/opus-mt-zh-ru-opus-mp
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-zh-en
- Toolkit de conversión MNN: https://github.com/HoSStiA/mnn-opus-mt-toolkit
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Servicio de traducción OPUS: https://github.com/Helsinki-NLP/OpusTranslationService
- Artículo sobre OPUS-MT: https://link.springer.com/article/10.1007/s10579-023-09704-w
- Otros modelos de Hosstia: https://huggingface.co/Hosstia/opus-mt-zh-ru-32k y https://huggingface.co/Hosstia/opus-mt-zh-ru
