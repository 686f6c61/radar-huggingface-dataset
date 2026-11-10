# Austriani/WaifuGemma4-26B-A4B-V1-ik_llama.cpp

## Resumen

WaifuGemma4-26B-A4B-V1-ik_llama.cpp es una cuantizacion GGUF del modelo base hiwaifu-research/WaifuGemma4-26b-a4b-v1, publicada por el usuario Austriani. Se trata de un modelo de mezcla de expertos (MoE) con arquitectura derivada de Gemma 4, con 25.2B parametros totales y 3.8B parametros activos por token, distribuidos en 128 expertos enrutados. El modelo esta afinado especificamente para roleplay, escritura creativa y conversacion sin censura, y esta empaquetado para su uso con el runtime ik_llama.cpp.

La relevancia de esta publicacion es doble: por un lado, ofrece una variante cuantizada de un modelo MoE de gran tamano pensada para ejecucion local eficiente gracias a su bajo numero de parametros activos; por otro, emplea una calibracion imatrix propia (denominada V3) y un esquema de cuantizacion IQK con trellis-quant y maxoptima, orientados a preservar calidad en compresiones agresivas. El contexto de calibracion del imatrix es de 1024 tokens.

El modelo esta pensado para desarrolladores que despliegan asistentes conversacionales de personaje o narrativa interactiva en hardware modesto, y que necesitan pesos ya cuantizados compatibles con ik_llama.cpp. No se dispone de informacion publica sobre el proceso de entrenamiento del modelo base ni sobre resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Gemma 4, transformer |
| Parametros totales | 25.2B |
| Parametros activos | 3.8B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con esquema IQK (trellis-quant, maxoptima), calibracion imatrix V3 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con 128 expertos enrutados y 25.2B parametros totales, de los cuales solo 3.8B se activan por token. La arquitectura se etiqueta como derivada de Gemma 4, aunque no se detalla la configuracion exacta de capas, dimension del hidden state ni el mecanismo de enrutamiento. El modelo esta afinado para roleplay, escritura creativa y conversacion sin censura, segun los tags de la model card.

En cuanto al proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), no se ha publicado informacion en la documentacion disponible. La contribucion de este repositorio es la cuantizacion: se aplica una calibracion imatrix propia (V3) con contexto de 1024 tokens y un esquema de cuantizacion IQK que combina trellis-quant y maxoptima, tecnicas orientadas a reducir el error de compresion en cuantizaciones de baja precision. No se especifican los niveles de bits exactos disponibles en el repositorio.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis en roleplay y escritura creativa.
- Conversacion multi-turno orientada a personajes, segun los tags de la model card.
- Modo sin censura (uncensored), pensado para contenido que otros modelos rechazan.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de personaje para comunidades de roleplay: el modelo esta afinado especificamente para mantener personalidad y coherencia en conversaciones largas de personaje, lo que lo hace adecuado para chatbots de rol en Discord o web.
- Narrativa interactiva y ficcion colaborativa: su orientacion a escritura creativa permite generar tramas, dialogos y descripciones dentro de una sesion de escritura asistida.
- Prototipado de aplicaciones de chat sin censura: util para investigar el comportamiento de modelos con filtros relajados en entornos controlados.
- Despliegue local en hardware de consumo: con 3.8B parametros activos y pesos GGUF, puede ejecutarse en GPUs de gama alta para consumidores mediante ik_llama.cpp, sin depender de APIs externas.
- Evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia practica para comparar la calibracion imatrix V3 y el esquema IQK frente a cuantizaciones estandar.
- Generacion de dialogos para videojuegos o mods: su capacidad conversacional y su licencia Apache 2.0 permiten integrarlo en proyectos comerciales de pequeno y mediano tamano.
- Investigacion sobre sesgos y seguridad en modelos sin censura: permite estudiar como se comporta un MoE afinado para roleplay en escenarios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 25.2B parametros en GGUF de 4 bits ocupa aproximadamente 14-16 GB, y en 8 bits alrededor de 26-28 GB; estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por el perfil de parametros activos (3.8B), el modelo puede beneficiarse de GPUs con 24 GB o mas, como RTX 4090, A100 o H100, aunque no hay recomendaciones oficiales.
- Cabe en GPU de consumo: probablemente en RTX 4090 y modelos con 24 GB o mas en cuantizaciones bajas, segun la estimacion anterior; no confirmado por el autor.
- Opciones de despliegue: ik_llama.cpp es el runtime declarado. No se confirma compatibilidad con llama.cpp estandar, vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| WaifuGemma4-26B-A4B-V1 (esta ficha) | 25.2B | 3.8B | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) |
| Modelos MoE comparables de la familia Gemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de roleplay cuantizadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos concretos de la misma categoria.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Al estar afinado para contenido sin censura, puede generar respuestas inapropiadas, ofensivas o inseguras; requiere moderacion en produccion.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de casos de uso con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales no documentadas aqui.
- La compatibilidad esta declarada para ik_llama.cpp; otros runtimes pueden no cargar correctamente los pesos.
- No hay datos publicados de benchmarks, por lo que la calidad real frente a alternativas no puede verificarse.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/WaifuGemma4-26B-A4B-V1-ik_llama.cpp
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- ik_llama.cpp: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
