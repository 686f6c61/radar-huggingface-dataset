# pantinor/ovos-conformer-mirrors

## Resumen

Este repositorio contiene espejos (mirrors) de los modelos de reconocimiento automático de voz (ASR) NVIDIA NeMo conformer-transducer-large, exportados a formato ONNX con cuantización int8 por OpenVoiceOS, y reempaquetados para que puedan ser cargados directamente por la librería sherpa-onnx (versión 1.13.x). El autor, pantinor (Paolo Antinori), ha modificado únicamente los metadatos del grafo ONNX y ha dividido el grafo combinado decoder-joint en dos sesiones separadas, sin alterar los pesos originales. El resultado es un conjunto de seis modelos monolingües (italiano, ruso, alemán, español, inglés y francés) listos para usar en aplicaciones de transcripción offline con sherpa-onnx.

La relevancia de este proyecto radica en que los exports originales de OpenVoiceOS no eran compatibles con sherpa-onnx debido a la falta de metadatos `model_type` y a la estructura combinada del decodificador. Este mirror resuelve esos problemas, permitiendo a los desarrolladores integrar estos modelos de alta calidad en pipelines de ASR con una librería ligera y eficiente, ideal para despliegues en dispositivos con recursos limitados. El modelo sigue la arquitectura conformer-transducer, con un encoder basado en conformer y un decodificador tipo RNN-T, y está licenciado bajo Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer Transducer (encoder-decoder con RNN-T) |
| Parametros totales | no disponible (el tamaño del repositorio es 0.9 GB, pero no se indica el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (ASR, procesa audio en ventanas) |
| Tipos de cuantizacion | int8 (archivos `encoder-model.int8.onnx`) |
| Idiomas soportados | italiano, ruso, alemán, español, inglés, francés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos `.onnx` con pesos cuantizados int8) |

## Arquitectura y entrenamiento

Los modelos son los originales de NVIDIA NeMo `conformer-transducer-large`, una arquitectura de reconocimiento de voz que combina un encoder basado en la red Conformer (que mezcla atención por convolución y atención por transformador) con un decodificador de tipo transducer (RNN-T). El encoder procesa características acústicas de 80 dimensiones (filtros mel) con un factor de submuestreo de 4, y el decodificador predice secuencias de tokens a partir del contexto previo. Los pesos fueron entrenados por NVIDIA con datos propios no públicos, y posteriormente exportados a ONNX por OpenVoiceOS en formato int8. En este repositorio no se ha realizado ningún reentrenamiento ni ajuste fino; solo se ha modificado el contenedor ONNX para añadir los metadatos necesarios (`model_type: nemo_transducer`, `subsampling_factor`, `normalize_type`, etc.) y se ha dividido el grafo `decoder_joint-model.int8.onnx` en dos subgrafos separados (`decoder-model.onnx` y `joiner-model.onnx`) para cumplir con la interfaz de sesiones de sherpa-onnx. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de entrenamiento.

## Capacidades

- Reconocimiento de voz automático (ASR) en seis idiomas: italiano, ruso, alemán, español, inglés y francés.
- Transcripción offline, sin necesidad de conexión a internet.
- Compatibilidad con sherpa-onnx, lo que permite su uso en aplicaciones de tiempo real y en dispositivos embebidos.
- Soporte para decodificación greedy search (decodificación voraz) y, potencialmente, otros métodos de decodificación soportados por sherpa-onnx.
- Procesamiento de audio con características de 80 dimensiones (filtros mel) y normalización por característica.
- Cuantización int8, lo que reduce el uso de memoria y acelera la inferencia en CPU.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de reconocimiento de voz.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede transcribir audio en tiempo real o de forma diferida en los seis idiomas soportados, permitiendo generar actas automáticas o subtítulos. Su naturaleza offline lo hace adecuado para entornos con restricciones de privacidad.
- Asistentes de voz en dispositivos embebidos: gracias a su tamaño reducido (int8) y a la compatibilidad con sherpa-onnx, puede integrarse en asistentes de voz locales en Raspberry Pi, smartphones o dispositivos IoT sin depender de servicios en la nube.
- Subtitulación automática de vídeos: al procesar audio en streaming, puede generar subtítulos en tiempo real para vídeos, webinars o emisiones en directo, con soporte multilingüe.
- Atención al cliente automatizada: en sistemas de IVR (respuesta de voz interactiva), el modelo puede transcribir las consultas de los clientes en varios idiomas, permitiendo su posterior análisis o enrutamiento mediante NLP.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real puede alimentar aplicaciones de subtitulado en vivo para personas sordas o con problemas de audición, funcionando sin conexión.
- Investigación y desarrollo en ASR: al ser un mirror de un modelo bien establecido, sirve como referencia para comparar arquitecturas, probar técnicas de cuantización o evaluar el rendimiento en diferentes idiomas y acentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que cada idioma fue verificado cargando el modelo con sherpa-onnx 1.13.4 y transcribiendo una muestra de habla natural con transcripciones correctas, pero no se proporcionan métricas numéricas (WER, CER, etc.).

## Requisitos de hardware

- El modelo está cuantizado en int8, por lo que puede ejecutarse en CPU con recursos moderados. El tamaño del repositorio es de 0.9 GB, lo que sugiere un uso de memoria de aproximadamente 900 MB para los seis modelos completos, aunque cada modelo individual es más pequeño.
- GPU recomendadas: no se especifican requisitos de GPU. Al ser ONNX, puede ejecutarse en cualquier GPU compatible con ONNX Runtime o TensorRT, pero no es imprescindible.
- Es adecuado para dispositivos con CPU de gama media (por ejemplo, Raspberry Pi 4 o superior, ordenadores portátiles) gracias a la cuantización int8 y a la eficiencia de sherpa-onnx.
- Opciones de despliegue: sherpa-onnx (librería C++ con bindings para Python, C, etc.), que permite ejecución en CPU, GPU (CUDA) y plataformas móviles. También puede integrarse con frameworks como ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen del hardware y del método de decodificación (greedy_search es el más rápido).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo. Sin embargo, se puede comparar estructuralmente con otros modelos ASR multilingües:

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Compatibilidad sherpa-onnx |
|---|---|---|---|---|---|
| pantinor/ovos-conformer-mirrors | Conformer Transducer | 6 (it, ru, de, es, en, fr) | Apache-2.0 | ONNX int8 | Sí (espejo preparado) |
| OpenVoiceOS/nvidia-{lang}-conformer-transducer-large-onnx | Conformer Transducer | 6 (mismos) | Apache-2.0 | ONNX int8 | No (faltan metadatos y estructura) |
| Whisper (openai/whisper) | Transformer encoder-decoder | 99+ | MIT | PyTorch, ONNX, GGUF | No directamente (requiere adaptación) |
| NVIDIA NeMo conformer-transducer-large (original) | Conformer Transducer | 6 (mismos) | Apache-2.0 | NeMo (`.nemo`) | No (requiere conversión) |

La principal ventaja de este mirror frente a los exports de OpenVoiceOS es su compatibilidad inmediata con sherpa-onnx, lo que facilita el despliegue en aplicaciones ligeras. Frente a Whisper, ofrece una arquitectura más eficiente para streaming y menor latencia, aunque Whisper tiene un soporte multilingüe más amplio.

## Limitaciones y advertencias

- Es un mirror de modelos existentes, por lo que no introduce mejoras en el rendimiento de reconocimiento; las limitaciones de los modelos originales de NVIDIA se mantienen.
- No se proporcionan métricas de error (WER/CER) en la información disponible, por lo que el rendimiento real en diferentes acentos o condiciones de ruido es desconocido.
- El soporte de idiomas se limita a los seis indicados; no hay capacidades multilingües dentro de un mismo modelo (cada idioma es un modelo separado).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de los modelos originales de NVIDIA (también Apache-2.0) y de OpenVoiceOS para asegurar el cumplimiento.
- Al estar cuantizado en int8, puede haber una ligera degradación en precisión frente a la versión en FP32, aunque no se cuantifica en la documentación.
- No se incluyen funciones de post-procesado (capitalización, puntuación, etc.); el modelo solo genera secuencias de tokens sin formato.
- La verificación del autor se realizó con una sola muestra de habla natural por idioma, lo que no garantiza robustez en todos los escenarios.

## Enlaces

- Repositorio del modelo: [pantinor/ovos-conformer-mirrors](https://huggingface.co/pantinor/ovos-conformer-mirrors)
- Repositorios upstream de OpenVoiceOS: [OpenVoiceOS/nvidia-it-conformer-transducer-large-onnx](https://huggingface.co/OpenVoiceOS/nvidia-it-conformer-transducer-large-onnx) (y análogos para ru, de, es, en, fr)
- Librería sherpa-onnx: [https://github.com/k2-fsa/sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
- Perfil del autor: [pantinor en Hugging Face](https://huggingface.co/pantinor)
