# dwyschka/gemma-4-e2b-it-oQ3e-fp16-mtp

## Resumen

Este repositorio contiene una cuantización de 3 bits del modelo Gemma 4 E2B IT de Google, realizada con la librería oMLX v0.6.2 en formato MLX safetensors. El modelo base pertenece a la familia Gemma 4, una generación de modelos abiertos nativamente multimodales (texto, visión y audio) desarrollada por Google DeepMind. La variante E2B es la más pequeña de la familia, orientada a despliegue en dispositivos edge y móviles, con una arquitectura densa de aproximadamente 1,08 mil millones de parámetros según los pesos reales del repositorio.

La cuantización oQ3e aplica precisión mixta: la mayoría de los pesos se almacenan en 3 bits con grupo de tamaño 64, mientras que ciertas capas se mantienen en fp16, lo que permite reducir el tamaño del modelo manteniendo la calidad. El modelo base ofrece una ventana de contexto de hasta 256.000 tokens y soporte multilingüe en más de 140 idiomas, según la documentación oficial de Gemma 4. Este repositorio concreto, sin embargo, no incluye una licencia declarada ni información adicional sobre el proceso de cuantización más allá de los datos técnicos básicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4 E2B, encoder-free) |
| Parametros totales | 1.083.205.187 (~1,08 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 256K tokens (modelo base) |
| Tipos de cuantizacion | 3 bits (oQ3e), group size 64, precision mixta con capas fp16 |
| Idiomas soportados | mas de 140 idiomas (modelo base) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B, un transformer denso multimodal nativo (sin encoder externo) diseñado por Google para tareas de razonamiento, codigo y comprension de texto, imagen y audio. Segun el informe tecnico de Gemma 4, la familia cubre arquitecturas densas y de mezcla de expertos (MoE) con tamaños de 2,3B a 31B parametros; E2B es la variante mas pequeña, pensada para entornos con recursos limitados. El modelo incorpora soporte nativo del rol de sistema y un modelo borrador para decodificacion especulativa con prediccion de multiples tokens (multi-token prediction), lo que acelera la inferencia sin perdida de calidad.

Los datos de entrenamiento del modelo base no se detallan en la informacion disponible, pero Gemma 4 sigue el mismo esquema de alineacion de modelos Gemini de Google, con ajuste por instrucciones (IT) y tecnicas de RLHF. La cuantizacion oQ3e aplicada en este repositorio reduce los pesos a 3 bits con un tamaño de grupo de 64, manteniendo capas criticas en fp16 para preservar la fidelidad. No se especifica si la cuantizacion conserva la funcionalidad multimodal completa del modelo base, por lo que hay que validar el comportamiento real antes de su uso en produccion.

## Capacidades

- Generacion de texto y razonamiento: el modelo base soporta tareas de comprension, generacion y razonamiento en texto.
- Multimodalidad nativa: Gemma 4 E2B incluye encoders de vision y audio integrados, capaces de procesar imagenes y audio junto con texto.
- Generacion de codigo: la familia Gemma 4 esta optimizada para tareas de programacion y depuracion.
- Soporte de system prompt: el modelo base incorpora el rol de sistema de forma nativa, permitiendo conversaciones mas estructuradas y controlables.
- Prediccion de multiples tokens: incluye un modelo borrador para decodificacion especulativa, lo que reduce la latencia de inferencia.
- Multilingue: soporta mas de 140 idiomas en el modelo base.
- No se confirma el soporte de tool calling ni funciones de agente en la informacion disponible para esta cuantizacion especifica.

## Casos de uso

- Asistente de voz en moviles: el modelo puede gestionar conversaciones de voz multi-turno en dispositivos con recursos limitados gracias a su tamano reducido y su capacidad de procesar audio y texto de forma nativa, ideal para aplicaciones de asistente personal sin conexion.
- Analisis de imagenes en el borde: permite clasificar o describir imagenes en camaras de seguridad o dispositivos IoT sin necesidad de enviar datos a la nube, preservando la privacidad y reduciendo la latencia.
- Generacion de codigo asistida en editores ligeros: puede completar fragmentos de codigo y sugerir funciones en entornos de desarrollo integrados en dispositivos moviles o portatiles de baja gama.
- Resumen y traduccion de documentos: con su soporte de mas de 140 idiomas, puede resumir articulos y traducir texto en tiempo real dentro de una aplicacion de lectura offline.
- Chatbot de atencion al cliente en kioscos: puede gestionar consultas frecuentes y derivar a agentes humanos cuando sea necesario, con un modelo que cabe en memoria de dispositivos de punto de venta.
- Clasificacion de audio en wearables: permite detectar comandos de voz o patrones sonoros en relojes y auriculares inteligentes, gracias a la entrada de audio integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantizacion especifica en la informacion disponible. El modelo base Gemma 4 E2B tiene resultados publicados en el informe tecnico de Gemma 4, pero no estan disponibles en esta ficha. Se recomienda evaluar el modelo cuantizado con tareas propias antes de desplegarlo en produccion, ya que la cuantizacion de 3 bits puede degradar el rendimiento en comparacion con la version en fp16.

## Requisitos de hardware

- Tamano del repositorio: 4,2 GB, que incluye los pesos en fp16 y la version cuantizada. El modelo cuantizado a 3 bits de ~1,08 B parametros ocupa aproximadamente 0,4 GB en disco, mientras que la version fp16 completa ocupa unos 2,2 GB.
- VRAM estimada: la inferencia en fp16 requiere alrededor de 2,5 GB de memoria GPU; la version cuantizada de 3 bits cabe en menos de 1 GB de VRAM, lo que la hace viable en GPUs de gama de entrada como la NVIDIA GTX 1650 o incluso en iGPUs modernas.
- Compatibilidad: al estar en formato MLX, esta optimizada para Apple Silicon (M1 y posteriores) y se ejecuta en macOS. No se ha convertido a GGUF, por lo que no es compatible directamente con llama.cpp o Ollama sin conversion adicional.
- Opciones de despliegue: inferencia local con MLX en Apple Silicon; si se convierte a GGUF, podria usarse con llama.cpp o vLLM en GPU NVIDIA, pero no se ha proporcionado esa conversion.
- Latencia y throughput: no se han publicado mediciones especificas para esta cuantizacion. Se espera una latencia de decenas de milisegundos por token en Apple Silicon, gracias a la decodificacion especulativa del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 E2B (base) | ~2,3 B | 256K | Gemma Terms of Use | safetensors |
| Gemma 4 E2B (oQ3e, este repo) | ~1,08 B | hasta 256K | no disponible | MLX safetensors |
| Gemma 2 2B | 2,6 B | 8K | Gemma Terms | safetensors, GGUF |
| Qwen2.5-1.5B | 1,5 B | 32K | Apache 2.0 | safetensors, GGUF |
| Phi-3-mini | 3,8 B | 128K | MIT | safetensors, GGUF |

La cuantizacion oQ3e reduce los parametros efectivos a ~1,08 B, pero mantiene el contexto de 256K y la multimodalidad del modelo base. Comparado con alternativas de tamu similar como Qwen2.5-1.5B, Gemma 4 E2B ofrece capacidades multimodales y un contexto mucho mayor, aunque la licencia de este repositorio no es clara. La ausencia de licencia es un riesgo para uso comercial, mientras que Qwen2.5 y Phi-3 tienen licencias permisivas.

## Limitaciones y advertencias

- Cuantizacion de 3 bits: puede introducir errores de precision y degradar la calidad de las respuestas en tareas complejas de razonamiento o generacion de codigo.
- Licencia no disponible: no se ha declarado la licencia del repositorio, lo que impide su uso comercial sin riesgo legal. El modelo base de Gemma 4 esta sujeto a los Terminos de Uso de Google, que pueden restringir su uso.
- Restriccion regional: el tag "region:us" sugiere que el modelo puede estar limitado a la region de Estados Unidos, lo que podria bloquear su uso en otros paises.
- Soporte multimodal no garantizado: la cuantizacion puede no preservar las capacidades de vision y audio del modelo base; se debe validar antes de usarlo en tareas multimodales.
- Sin benchmarks: no hay datos de rendimiento de esta cuantizacion especifica, por lo que es dificil predecir su calidad en produccion.
- Tamano del repositorio: 4,2 GB, lo que puede ser excesivo para despliegue en dispositivos con almacenamiento limitado si se descarga la version completa.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/dwyschka/gemma-4-e2b-it-oQ3e-fp16-mtp)
- [oMLX (libreria de cuantizacion)](https://github.com/jundot/omlx)
- [Gemma 4 model card - Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 Technical Report - arXiv](https://arxiv.org/html/2607.02770v1)
- [Gemma 4 overview - Google AI for Developers](https://ai.google.dev/gemma/docs/core)
- [Gemma 4 - Google AI Edge](https://developers.google.com/edge/litert-lm/models/gemma-4)</think>## Resumen

Este repositorio contiene una cuantizacion de 3 bits del modelo Gemma 4 E2B IT de Google, realizada con la libreria oMLX v0.6.2 en formato MLX safetensors. El modelo base pertenece a la familia Gemma 4, una generacion de modelos abiertos de peso multimodal desarrollada por Google DeepMind, que incluye arquitecturas densas y de mezcla de expertos con tamanos desde 2,3B hasta 31B de parametros. La variante E2B es la mas pequena de la familia, orientada a despliegue en dispositivos edge y moviles.

La cuantizacion oQ3e aplica precision mixta de 3 bits con un grupo de 64, manteniendo algunas capas en fp16 para preservar la calidad. El modelo base ofrece una ventana de contexto de hasta 256K tokens y soporte multilingue en mas de 140 idiomas, segun la documentacion oficial de Gemma 4. Este repositorio concreto no declara licencia, lo que supone una limitacion importante para su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4 E2B, encoder-free) |
| Parametros totales | 1.083.205.187 (~1,08 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 256K tokens (modelo base) |
| Tipos de cuantizacion | 3 bits (oQ3e), group size 64, precision mixta con capas fp16 |
| Idiomas soportados | mas de 140 idiomas (modelo base) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B, un transformer denso multimodal nativo de Google, sin encoder externo, disenado para tareas de texto, vision y audio. Segun el informe tecnico de Gemma 4, la familia cubre arquitecturas densas y de mezclos de expertos, con un rango de parametros de 2,3B a 31B. Este modelo incluye soporte nativo para el rol de sistema y un modelo borrador dedicado para decodificacion especulativa con prediccion de multiples tokens, lo que permite acelerar la inferencia sin perdida de calidad. La cuantizacion oQ3e se realizo con oMLX v0.6.2, aplicando 3 bits con un grupo de 64 y manteniendo capas criticas en fp16. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de alineacion del modelo base en la documentacion disponible.

## Capacidades

- Generacion de texto, razonamiento y codigo: el modelo base es apto para tareas de lenguaje natural, razonamiento y generacion de codigo.
- Multimodal nativo: soporta entrada de imagen y audio ademas de texto, aunque esta cuantizacion puede degradar estas capacidades.
- Soporte de system prompt: el modelo base incorpora el rol de sistema de forma nativa, permitiendo conversaciones mas estructuradas.
- Prediccion de multiples tokens: incluye un modelo borrador para decodificacion especulativa, lo que reduce la latencia.
- Multilingue: soporta mas de 140 idiomas en el modelo base.
- No se confirma el soporte de tool calling ni de agentes en esta cuantizacion especifica.

## Casos de uso

- Asistente de voz en dispositivos moviles: el modelo puede procesar entradas de audio y texto en tiempo real, ideal para asistentes personales en dispositivos con recursos limitados, gracias a su tamano reducido y contexto largo.
- Analisis de imagenes en el borde: permite clasificar o describir imagenes en camaras de seguridad o dispositivos IoT sin conexion a la nube, preservando la privacidad y reduciendo la latencia.
- Generacion de codigo en entornos de desarrollo integrados: puede completar fragmentos de codigo y sugerir funciones en editores ligeros, especialmente en equipos con poca memoria.
- Traduccion y resumen de documentos: con soporte de mas de 140 idiomas, puede traducir y resumir textos largos en aplicaciones de lectura o productividad.
- Atencion al cliente automatizada: puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens, aunque requiere validar la calidad de la cuantizacion.
- Analisis de audio en dispositivos portatiles: puede transcribir y analizar audio en tiempo real en relojes o auriculares inteligentes, aprovechando su capacidad multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantizacion especifica en la informacion disponible. El modelo base Gemma 4 tiene resultados en el informe tecnico de Google DeepMind, pero no estan disponibles en este repositorio. No se debe asumir que la cuantizacion de 3 bits mantiene el rendimiento del modelo original.

## Requisitos de hardware

- VRAM estimada: la cuantizacion de 3 bits reduce el peso a aproximadamente 0,4 GB, por lo que es viable en GPUs de gama de entrada con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con 4 GB o mas (RTX 3050, GTX 1650), o Apple Silicon con 8 GB de RAM unificada para MLX.
- Compatibilidad: al ser un modelo MLX, esta optimizado para Apple Silicon, pero puede convertirse a GGUF para usar con llama.cpp o Ollama en otras plataformas.
- Opciones de despliegue: MLX para Apple Silicon, llama.cpp o Ollama si se convierte el formato, vLLM para despliegue en servidores.
- Latencia y throughput: no hay datos publicados; se estima una latencia de decenas de milisegundos por token en hardware consumer gracias a la decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 E2B (base) | ~2,3 B | 256K | Gemma Terms of Use | safetensors |
| Gemma 4 E2B (oQ3e, este repo) | ~1,08 B | 256K | no disponible | MLX safetensors |
| Gemma 2 2B | 2,6 B | 8K | Gemma Terms | safetensors, GGUF |
| Qwen2.5-1.5B | 1,5 B | 32K | Apache 2.0 | safetensors, GGUF |
| Phi-3-mini | 3,8 B | 128K | MIT | safetensors, GGUF |

Este modelo cuantizado ofrece un contexto muy superior a alternativas de tamano similar como Qwen2.5-1.5B, pero la licencia no disponible y el formato MLX limitan su uso en produccion frente a opciones mas abiertas.

## Limitaciones y advertencias

- Cuantizacion de 3 bits: riesgo de perdida de calidad en tareas complejas de razonamiento, codigo o multimodalidad.
- Licencia no disponible: no se puede usar en produccion sin conocer los terminos legales, lo que es un riesgo importante.
- Restriccion regional: el tag "region:us" sugiere que el modelo puede estar limitado a Estados Unidos, lo que podria bloquear su uso en otras regiones.
- Capacidades multimodales: no se ha verificado que la cuantizacion conserve las capacidades de vision y audio del modelo base.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inconsistente.
- Sin soporte de tool calling: no se confirma que esta cuantizacion soporte llamadas a funciones, lo que limita su uso en agentes.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/dwyschka/gemma-4-e2b-it-oQ3e-fp16-mtp)
- [oMLX (libreria de cuantizacion)](https://github.com/jundot/omlx)
- [Gemma 4 model card - Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 Technical Report - arXiv](https://arxiv.org/html/2607.02770v1)
- [Gemma 4 overview - Google AI for Developers](https://ai.google.dev/gemma/docs/core)
- [Gemma 4 - Google AI Edge](https://developers.google.com/edge/litert-lm/models/gemma-4)</think>## Resumen

Este repositorio contiene una cuantizacion de 3 bits del modelo Gemma 4 E2B IT de Google, realizada con la libreria oMLX v0.6.2 en formato MLX safetensors. El modelo base pertenece a la familia Gemma 4, una generacion de modelos abiertos de peso multimodal de Google DeepMind, que incluye arquitecturas densas y de mezclos de expertos (MoE) con tamanos de 2,3B a 31B de parametros. La variante E2B es la mas pequena de la familia, orientada a despliegue en dispositivos edge y moviles.

La cuantizacion oQ3e aplica una precision mixta de 3 bits con un grupo de 64, manteniendo algunas capas en fp16 para preservar la calidad. El modelo base ofrece una ventana de contexto de hasta 256K tokens y soporte multilingue en mas de 140 idiomas, segun la documentacion oficial de Gemma 4. Este repositorio concreto no declara licencia, lo que supone una limitacion importante para su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4 E2B, encoder-free) |
| Parametros totales | 1.083.205.187 (~1,08 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 256K tokens (modelo base) |
| Tipos de cuantizacion | 3 bits (oQ3e), group size 64, precision mixta con capas fp16 |
| Idiomas soportados | mas de 140 idiomas (modelo base) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B, un transformer denso multimodal de Google, sin encoder externo, disenado para tareas de texto, vision y audio. Segun el informe tecnico de Gemma 4, la familia cubre arquitecturas densas y de mezclos de expertos, con un rango de parametros de 2,3B a 31B. Este modelo incluye soporte de system prompt nativo y un modelo borrador para decodificacion especulativa con prediccion de multiples tokens, lo que permite acelerar la inferencia sin perdida de calidad. La cuantizacion oQ3e se realizo con oMLX v0.6.2, aplicando 3 bits con un grupo de 64 y manteniendo capas criticas en fp16.

No se dispone de informacion detallada sobre el entrenamiento del modelo base, ni sobre el proceso de alineacion (RLHF/DPO) ni el dataset utilizado. La documentacion oficial de Gemma 4 indica que los modelos se someten a protocolos de seguridad rigurosos, pero no se proporcionan mas detalles.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas: el modelo base esta disenado para tareas de lenguaje natural, codigo y razonamiento.
- Multimodal nativo: soporta entrada de imagen y audio, ademas de texto, gracias a los encoders integrados.
- Soporte de system prompt: el modelo base incluye el rol de sistema de forma nativa, permitiendo conversaciones mas estructuradas.
- Prediccion multi-token: el modelo base incorpora un modelo borrador para decodificacion especulativa, lo que reduce la latencia.
- Multilingue: soporta mas de 140 idiomas en el modelo base.
- No se confirma el soporte de tool calling ni agentes en esta cuantizacion especifica.

## Casos de uso

- Asistente de voz en dispositivos moviles: el modelo puede procesar entradas de audio y texto en tiempo real, ideal para asistentes personales en dispositivos con recursos limitados.
- Analisis de imagenes en el borde: permite clasificar o describir imagenes en camaras de seguridad o dispositivos IoT sin conexion a la nube, preservando la privacidad y reduciendo la latencia.
- Generacion de codigo en entornos de desarrollo: puede completar fragmentos de codigo y sugerir funciones en editores ligeros, especialmente en equipos de bajos recursos.
- Traduccion y resumen de documentos: con soporte de mas de 140 idiomas, puede traducir y resumir textos en aplicaciones de lectura o escritura.
- Chatbot de atencion al cliente: puede gestionar conversaciones multi-turno con contexto de 256K tokens, aunque requiere validacion de la calidad de la cuantizacion.
- Analisis de audio en wearables: puede transcribir y analizar audio en tiempo real en relojes o auriculares, aprovechando su capacidad multimodal.

## Benchmarks y
