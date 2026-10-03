# malinali-app/opus-mt-tiv-sv

## Resumen

El modelo `malinali-app/opus-mt-tiv-sv` es un sistema de traducción automática neuronal especializado en la dirección tiv → sueco. Ha sido publicado por el desarrollador malinali-app como un reempaquetado del modelo original `Helsinki-NLP/opus-mt-tiv-sv`, desarrollado por el proyecto OPUS-MT de la Universidad de Helsinki. La arquitectura subyacente es Marian, un transformer encoder-decoder ampliamente utilizado en traducción automática, con aproximadamente 67,8 millones de parámetros. El modelo se distribuye en formato safetensors y está optimizado para inferencia on-device mediante Candle (a través de `marian_flutter`), lo que permite su integración en aplicaciones móviles y de escritorio sin conexión.

Este modelo resuelve la necesidad de traducción entre un idioma de bajos recursos como el tiv (hablado principalmente en Nigeria) y el sueco, un par lingüístico con escasa representación en herramientas comerciales. Su relevancia radica en la combinación de un tamaño reducido (0,3 GB en repositorio) que facilita el despliegue en dispositivos con recursos limitados, y la conversión de los tokenizadores SentencePiece originales a formato JSON de Hugging Face para su uso con la librería transformers y Candle.

No se dispone de información sobre la longitud de contexto máxima, el dataset de entrenamiento ni resultados de benchmarks en la información proporcionada. La licencia no está especificada en los metadatos del repositorio, aunque el autor indica que se debe seguir la licencia del modelo original (típicamente CC-BY 4.0 para OPUS-MT).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | 67.844.228 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo safetensors en fp32) |
| Idiomas soportados | Tiv (tiv), sueco (sv) |
| Licencia | No disponible en metadatos; el autor indica seguir la licencia del modelo original (típicamente CC-BY 4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder con mecanismos de atención estándar, diseñado específicamente para traducción automática. Esta arquitectura es la base de la familia OPUS-MT y se caracteriza por su eficiencia en tareas de secuencia a secuencia. El modelo original fue entrenado por el proyecto OPUS-MT utilizando datos paralelos de OPUS, aunque no se especifican el número de tokens, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO.

La contribución de malinali-app consiste en el reempaquetado de los pesos originales en formato safetensors y la conversión de los tokenizadores SentencePiece a archivos JSON de tokenizador rápido de Hugging Face (`tokenizer-enc.json` y `tokenizer-dec.json`). Esta adaptación permite la inferencia on-device con Candle a través de `marian_flutter`, facilitando su uso en aplicaciones Flutter sin depender de servidores externos. No se introduce ningún cambio en los pesos ni en el entrenamiento; es una conversión de formato.

## Capacidades

- Traducción de texto de tiv a sueco.
- Generación de texto secuencia a secuencia (text2text-generation).
- No se especifica soporte para tool calling, function calling ni agentes.
- No se especifica razonamiento multi-paso ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al par tiv → sv.
- No soporta visión, audio ni otras modalidades.
- Inferencia on-device mediante Candle (Rust) y Flutter.
- Compatible con la librería transformers de Hugging Face.
- Tokenizadores rápidos convertidos para su uso con la API de Hugging Face.

## Casos de uso

- Traducción de documentos oficiales para comunidades tiv en Suecia: el modelo permite traducir textos administrativos, legales o médicos del tiv al sueco, facilitando el acceso a servicios públicos a hablantes de tiv residentes en Suecia. Su tamaño reducido permite su integración en aplicaciones móviles de organismos públicos.
- Atención al cliente en sueco para hablantes de tiv: empresas de servicios pueden integrar el modelo en chatbots o sistemas de mensajería para traducir consultas de clientes tiv al sueco de forma automática, mejorando la comunicación sin necesidad de intérpretes humanos.
- Traducción de contenido web y redes sociales: el modelo puede utilizarse para traducir publicaciones, comentarios o artículos escritos en tiv al sueco, facilitando la difusión de información en ambas direcciones (aunque solo en el sentido tiv → sv).
- Herramientas de aprendizaje de idiomas: aplicaciones educativas pueden emplear el modelo para proporcionar traducciones instantáneas de ejercicios o vocabulario tiv-sueco, aprovechando la inferencia local para evitar costes de API y proteger la privacidad del usuario.
- Traducción en tiempo real en aplicaciones móviles: gracias a su reducido tamaño (67,8 M de parámetros) y a la compatibilidad con Candle, el modelo puede ejecutarse directamente en teléfonos móviles, permitiendo traducciones sin conexión a internet en contextos de viaje o zonas con conectividad limitada.
- Localización de software para usuarios tiv: desarrolladores pueden integrar el modelo en pipelines de localización para traducir cadenas de interfaz de usuario del tiv al sueco, automatizando parte del proceso de adaptación de aplicaciones a esta comunidad lingüística.
- Investigación lingüística y preservación del tiv: el modelo sirve como herramienta para lingüistas que estudian el tiv, permitiendo generar traducciones de referencia o alinear corpus de manera semiautomática, aunque se requiere validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al contar con 67,8 millones de parámetros, en precisión fp32 requiere aproximadamente 271 MB; en fp16, unos 136 MB; y en int8, unos 68 MB. Sin embargo, no se especifican cuantizaciones oficiales, por lo que los valores son estimaciones teóricas.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM puede ejecutar el modelo sin problemas. Incluso GPUs integradas o CPUs de gama alta son suficientes para inferencia en tiempo real.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo (NVIDIA GTX 1050 o superior, AMD equivalente, e incluso en dispositivos móviles con GPU integrada).
- Opciones de despliegue: transformers (PyTorch/TensorFlow), Candle (Rust) mediante `marian_flutter`, y potencialmente otros runners que acepten safetensors. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo Marian, podría convertirse a GGUF para llama.cpp si se desea.
- Latencia y throughput estimados: no disponible. Al ser un modelo pequeño, se espera una latencia baja en hardware moderno, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| malinali-app/opus-mt-tiv-sv | 67.844.228 | No disponible | No disponible (típicamente CC-BY 4.0) | Hugging Face |
| Helsinki-NLP/opus-mt-tiv-sv | 67.844.228 | No disponible | CC-BY 4.0 (según OPUS-MT) | Hugging Face |
| NLLB-200-distilled-600M | 600.000.000 | No disponible | CC-BY-NC 4.0 | Hugging Face |
| M2M-100 418M | 418.000.000 | No disponible | MIT | Hugging Face |

El modelo comparado directamente es `Helsinki-NLP/opus-mt-tiv-sv`, del cual deriva y con el que comparte arquitectura y pesos. Las alternativas multilingües como NLLB-200 o M2M-100 cubren un mayor número de idiomas, pero tienen un tamaño mucho mayor y licencias distintas (NLLB-200 es solo para uso no comercial). No se dispone de datos de rendimiento comparativo entre estos modelos para el par tiv-sv.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información específica, pero al entrenarse con corpus de OPUS, puede heredar sesgos presentes en los datos paralelos, como desequilibrios de género o dominios.
- Riesgo de alucinación: en traducción automática, el modelo puede generar traducciones incorrectas, omitir información o inventar contenido cuando la entrada es ambigua, especialmente en frases largas o con vocabulario poco frecuente.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto. Los modelos Marian suelen manejar secuencias de hasta 512 tokens, pero no está confirmado. Entradas muy largas pueden degradar la calidad.
- Limitaciones de idioma: solo traduce de tiv a sueco. No soporta la dirección inversa (sueco → tiv) ni otros idiomas. El tiv es un idioma de bajos recursos, por lo que la cobertura léxica y la calidad pueden ser limitadas en comparación con pares de idiomas mayoritarios.
- Restricciones de licencia: la licencia no está especificada en los metadatos del repositorio. El autor indica que se debe seguir la licencia del modelo original, que típicamente es CC-BY 4.0 para OPUS-MT. Esto permitiría uso comercial con atribución, pero se recomienda verificar la licencia exacta antes de un uso en producción.
- Caveat importante: este modelo es un reempaquetado, no un modelo entrenado desde cero. La calidad depende enteramente del modelo original `Helsinki-NLP/opus-mt-tiv-sv`. No se han publicado evaluaciones ni benchmarks que respalden su rendimiento.
- Uso en producción: al no haber benchmarks, se recomienda realizar una evaluación exhaustiva con datos propios antes de desplegarlo en aplicaciones críticas. La ausencia de soporte para cuantización oficial puede limitar optimizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/malinali-app/opus-mt-tiv-sv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tiv-sv
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Malinali: https://malinali.app
