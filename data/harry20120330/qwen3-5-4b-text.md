# Harry20120330/Qwen3.5-4B-Text

## Resumen

Qwen3.5-4B-Text es una variante derivada de Qwen/Qwen3.5-4B-Base, el modelo base multimodal de la familia Qwen3.5 desarrollada por Alibaba. La modificacion principal consiste en la eliminacion de las capas relacionadas con vision, dejando un modelo puramente de texto con 4.326.350.848 parametros (aproximadamente 4,3 mil millones). El autor de esta derivacion es el usuario de Hugging Face Harry20120330, que publica el modelo bajo licencia Apache 2.0 heredada del modelo base.

El modelo resuelve un problema concreto de eficiencia: quienes necesitan un modelo de texto de tamano medio no requieren cargar los pesos y la complejidad arquitectonica del procesamiento visual del modelo base original. Al eliminar esas capas, se reduce el peso del repositorio a 8,7 GB en safetensors y se simplifica el despliegue en pipelines de generacion de texto.

Es relevante ahora porque la familia Qwen3.5 se posiciona como una de las referencias open source en el rango de 4 mil millones de parametros, y esta variante ofrece una via directa para aprovechar el modelo base en tareas conversacionales y de generacion sin el coste asociado al modulo de vision. No obstante, conviene senalar que no se ha aplicado ningun tipo de ajuste fino, RLHF ni alineamiento de seguridad, por lo que el modelo conserva el comportamiento crudo del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, capas de vision eliminadas) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen/Qwen3.5-4B-Base, un transformer decoder-only de la familia Qwen3.5, con la particularidad de que en esta derivacion se han eliminado las capas especificas de vision. El resultado es un modelo de lenguaje puro de aproximadamente 4,3 mil millones de parametros. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni configuracion de cabezas en la informacion proporcionada.

En cuanto al entrenamiento, esta variante no ha recibido ningun proceso adicional: no hay LoRA, no hay RLHF ni DPO, ni ningun otro tipo de ajuste por preferencias. Se trata, por tanto, de una extraccion estructural del checkpoint base, que conserva los pesos del preentrenamiento original de Qwen3.5-4B-Base. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas especificas del modelo base.

## Capacidades

- Generacion de texto autoregresiva en modo decoder-only, orientada a tareas de continuacion y respuesta conversacional.
- Conversacion multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones heredadas del preentrenamiento del modelo base.
- Generacion de codigo y matematicas: capacidad presumible por herencia del modelo base Qwen3.5, aunque no se documenta explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): la vision ha sido explicitamente eliminada; no se documentan otras capacidades especiales.

## Casos de uso

- Generacion de texto en produccion con requisitos de peso reducido: al eliminar las capas de vision, el checkpoint ocupa 8,7 GB en safetensors y puede servirse con frameworks de inferencia estandar de texto, lo que simplifica el empaquetado en contenedores y reduce el consumo de memoria frente al modelo base multimodal.
- Chatbots y asistentes conversacionales: la etiqueta `conversational` y el pipeline `text-generation` permiten integrarlo en servicios de atencion al usuario o asistentes internos, siempre que se anada una capa de moderacion externa dada la ausencia de alineamiento de seguridad.
- Prototipado e investigacion en PLN: sirve como checkpoint base limpio, sin RLHF, para experimentos de ajuste fino supervisado o DPO, ya que el autor confirma que no se ha aplicado ningun tuning previo que contamine la linea base.
- Generacion de codigo en entornos de desarrollo: puede emplearse como asistente de autocompletado o explicacion de fragmentos en IDE, con la cautela de validar las salidas mediante tests automatizados.
- Procesamiento por lotes de documentos de texto: tareas de resumen, reescritura, extraccion o clasificacion sobre corpus textuales, aprovechando el pipeline de generacion de texto y el formato safetensors para cargas rapidas.
- Fine-tuning especifico de dominio: al ser una derivacion Apache 2.0 sin ajustes posteriores, es un punto de partida adecuado para adaptar el modelo a dominios verticales (legal, sanitario, industrial) mediante LoRA o ajuste completo, con la ventaja de no arrastrar sesgos de alineamiento ajenos.
- Despliegue en hardware de gama media: con 4,3 B de parametros, es candidato a inferencia en GPUs de consumo con cuantizacion, aunque el autor no publica variantes cuantizadas y habria que generarlas a partir de los safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, en FP16 los 4,3 B de parametros requieren aproximadamente 8,6 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 4,3 GB y en 4 bits unos 2,2 GB, aunque estas cifras no las publica el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, GPUs con 16-24 GB de VRAM (RTX 4090, A10G, L4) serian suficientes para FP16 sin cuantizar; A100/H100 quedarian sobredimensionadas para inferencia de un solo modelo.
- Cabe en consumer GPU: previsiblemente si en GPUs de 16 GB o mas en FP16, y en GPUs de 8 GB con cuantizacion, pero no hay confirmacion oficial ni variantes cuantizadas publicadas.
- Opciones de despliegue: el formato safetensors es compatible con vLLM, TGI, Transformers y llama.cpp (previa conversion a GGUF). Ollama requeriria generar un GGUF a partir de los safetensors. No se documenta compatibilidad explicita con ninguno de estos frameworks en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Ajuste de seguridad | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Text (este) | 4,3 B | No disponible | No | Apache 2.0 | No | Hugging Face |
| Qwen/Qwen3.5-4B-Base | No disponible en la informacion | No disponible | Si | Apache 2.0 (heredada) | No | Hugging Face |
| Alternativas de ~4 B de otras familias | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con modelos de otras familias (Llama, Gemma, Phi, Mistral en el rango de 3-4 B) no se puede completar con datos verificables en la informacion proporcionada, por lo que se indica como no disponible.

## Limitaciones y advertencias

- Ausencia total de RLHF y de ajuste de seguridad: el propio autor advierte que el modelo puede generar contenido sin censura o potencialmente danino. Es imprescindible anadir capas de moderacion y filtros en produccion.
- Riesgo de alucinacion: al ser un checkpoint base sin alineamiento, la tendencia a inventar hechos o citas es previsiblemente alta; no se han publicado evaluaciones de fidelidad.
- Perdida de capacidades multimodales: cualquier caso de uso que requiera procesamiento de imagenes queda fuera del alcance de esta variante por diseno.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otras lenguas distintas del ingles o el chino sin evaluacion previa.
- Longitud de contexto no documentada: no se conoce la ventana maxima efectiva, lo que impide planificar tareas de contexto largo con garantias.
- Sin variantes cuantizadas oficiales: el repositorio solo publica safetensors; cualquier despliegue en hardware limitado requiere que el usuario genere sus propias cuantizaciones y las valide.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar los avisos de copyright y licencia originales al redistribuir el modelo o trabajos derivados.
- Repositorio con muy poca traccion (248 descargas, 0 likes en el momento de la consulta): no hay comunidad que haya validado el comportamiento del modelo, por lo que la fiabilidad en produccion no esta contrastada.
- Trazabilidad limitada: no se detalla la version exacta del checkpoint base ni la fecha de extraccion, lo que dificulta reproducir el proceso de derivacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harry20120330/Qwen3.5-4B-Text
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
