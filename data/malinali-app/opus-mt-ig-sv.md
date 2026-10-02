# malinali-app/opus-mt-ig-sv

## Resumen
El modelo malinali-app/opus-mt-ig-sv es un modelo de traducción automática de igbo a sueco, desarrollado por malinali-app como un empaquetado del modelo Helsinki-NLP/opus-mt-ig-sv. Se trata de una arquitectura Marian (transformer encoder-decoder) con 75.089.327 parámetros, distribuida en formato safetensors y optimizada para inferencia en dispositivo mediante la librería Candle (Rust) y tokenizadores rápidos. El problema que resuelve es la traducción offline de igbo a sueco en aplicaciones móviles y entornos con recursos limitados, sin depender de servicios en la nube. Su relevancia radica en la creciente demanda de traducción privada y de baja latencia en dispositivos, especialmente para pares de idiomas con menos recursos como igbo-sueco. No se especifica la longitud de contexto en la información proporcionada.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | 75.089.327 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en safetensors sin cuantización especificada) |
| Idiomas soportados | ig (igbo), sv (sueco); dirección ig → sv |
| Licencia | no disponible en la información proporcionada; la model card indica seguir la licencia del modelo upstream (habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo utiliza la arquitectura Marian, un transformer de tipo encoder-decoder diseñado específicamente para traducción automática. Los pesos son idénticos a los del modelo Helsinki-NLP/opus-mt-ig-sv, que fue entrenado por el proyecto OPUS-MT de Helsinki-NLP utilizando datos paralelos del corpus OPUS. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La contribución de malinali-app consiste en el reempaquetado de los pesos en formato safetensors y la conversión del tokenizador SentencePiece original a tokenizadores rápidos en formato JSON para su uso con Candle (marian_flutter), lo que facilita la inferencia en dispositivo. No se documentan innovaciones técnicas adicionales más allá de esta conversión para despliegue eficiente.

## Capacidades
- Traducción automática de texto de igbo a sueco.
- Generación de texto condicionada (text2text-generation) para tareas de traducción.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada a los idiomas igbo y sueco (solo dirección ig → sv).
- No incluye capacidades de visión, audio ni modo de pensamiento.
- Compatible con la librería transformers y con Candle para inferencia en Rust.

## Casos de uso
- Traducción offline en aplicaciones móviles: el modelo se puede integrar en apps Flutter mediante marian_flutter, permitiendo traducir texto igbo a sueco sin conexión a internet, lo que es útil en regiones con conectividad limitada.
- Atención al cliente en sueco para hablantes de igbo: empresas suecas pueden traducir consultas de usuarios en igbo a sueco en tiempo real, mejorando la comunicación sin depender de servicios externos.
- Procesamiento de documentos confidenciales: al ejecutarse localmente, permite traducir documentos sensibles de igbo a sueco sin enviar datos a la nube, cumpliendo con requisitos de privacidad.
- Herramientas de aprendizaje de idiomas: aplicaciones educativas pueden ofrecer traducciones instantáneas igbo-sueco para estudiantes, con bajo consumo de recursos.
- Preprocesamiento en pipelines de NLP: traducir textos en igbo a sueco antes de aplicar otras técnicas como análisis de sentimiento o extracción de información, facilitando el uso de herramientas disponibles en sueco.
- Sistemas embebidos y IoT: gracias a sus 75 millones de parámetros y ~300 MB en FP32, puede desplegarse en dispositivos con recursos limitados para traducción local en kioscos o asistentes.
- Traducción de mensajes en tiempo real: integración en aplicaciones de mensajería para traducir conversaciones entre hablantes de igbo y sueco de forma automática y privada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: menos de 1 GB en FP32 (aproximadamente 300 MB para los pesos); en FP16 sería alrededor de 150 MB.
- GPU recomendadas: cualquier GPU moderna, incluidas integradas; no requiere GPU dedicada. Funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en dispositivos móviles de gama media-alta.
- Opciones de despliegue: transformers (PyTorch), Candle (Rust), marian_flutter (Flutter). No se ha confirmado soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| malinali-app/opus-mt-ig-sv | 75.089.327 | no disponible | no disponible (ver model card) | HuggingFace |
| Helsinki-NLP/opus-mt-ig-sv (modelo base) | 75.089.327 | no disponible | CC-BY 4.0 (habitual) | HuggingFace |

El modelo base es Helsinki-NLP/opus-mt-ig-sv, que comparte exactamente los mismos pesos. No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias
- Solo traduce en la dirección igbo → sueco; no soporta la dirección inversa.
- La licencia exacta no está especificada en la información proporcionada; aunque la model card remite a la licencia del upstream (habitualmente CC-BY 4.0), se debe verificar antes de uso comercial.
- Al ser un modelo de 75 millones de parámetros, su calidad puede ser inferior a la de modelos más grandes como NLLB-200, especialmente en textos complejos o dominios específicos.
- No se han publicado benchmarks, por lo que no se puede evaluar objetivamente su rendimiento.
- La longitud de contexto no está documentada; los modelos OPUS-MT suelen limitarse a 512 tokens, lo que restringe la traducción de documentos largos sin fragmentación.
- Riesgo de alucinación y errores de traducción, especialmente con términos técnicos, nombres propios o expresiones idiomáticas.
- Puede presentar sesgos heredados de los datos de entrenamiento de OPUS-MT, que pueden reflejar desequilibrios de género, culturales o geográficos.
- El igbo es un idioma con menos recursos, lo que puede afectar la calidad de la traducción en comparación con pares de idiomas más representados.
- Requiere librerías específicas (transformers, Candle) para su uso; no es compatible directamente con formatos GGUF u otros.
- No soporta tool calling, agentes ni otras capacidades avanzadas.

## Enlaces
- HuggingFace: https://huggingface.co/malinali-app/opus-mt-ig-sv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ig-sv
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Malinali: https://malinali.app
