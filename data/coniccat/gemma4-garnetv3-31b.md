# ConicCat/Gemma4-GarnetV3-31B

## Resumen

ConicCat/Gemma4-GarnetV3-31B es un ajuste fino (finetune) del modelo base google/gemma-4-31B-it, desarrollado por el usuario ConicCat, orientado específicamente a mejorar el rendimiento en roleplay y escritura creativa. El entrenamiento se realizó mediante DPO (Direct Preference Optimization) con un dataset compuesto aproximadamente por un tercio de muestras de escritura y dos tercios de roleplay, con el objetivo de refinar la calidad de la prosa y generar personajes más humanos y creíbles.

El modelo tiene 31.273 millones de parámetros, está publicado bajo licencia Apache 2.0 y se distribuye en formato safetensors con precisión BF16. El autor recomienda usar la cuantización GGUF Q4_K_M junto con koboldcpp para una experiencia óptima. Aunque el modelo no está desplegado por ningún proveedor de inferencia en Hugging Face, su tamaño y licencia permiten su uso local en hardware de gama alta o mediante cuantización en GPUs de consumo.

La relevancia de este modelo radica en su especialización para tareas de roleplay y narrativa, un nicho donde los modelos generalistas suelen quedarse cortos en coherencia de personajes y estilo literario. Al estar basado en Gemma 4, hereda las capacidades generales de generación de texto del modelo base, pero con un ajuste específico que lo hace especialmente útil para creadores de contenido, escritores y desarrolladores de chatbots de personajes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 4) |
| Parametros totales | 31.273.086.512 (31,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (recomendado por el autor); otros formatos no especificados |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de google/gemma-4-31B-it, un transformer decoder-only de 31,3 mil millones de parámetros. No se dispone de información detallada sobre la configuración interna (número de capas, dimensiones de atención, etc.) más allá de lo que hereda del modelo base. Al ser un modelo denso, todos los parámetros se activan en cada inferencia.

El entrenamiento se realizó con DPO sobre tres datasets propios del autor:
- ConicCat/Lamp_P_Preference: comparaciones entre escritura revisada por humanos y escritura generada por IA para mejorar la prosa.
- ConicCat/Charcards_Delta_Qwen3_5V2: datos generados con la receta de delta tuning de AI2, comparando Qwen3.5 27B contra Qwen3.5 2B.
- ConicCat/Charcards_Context_Distill_Gemma4_26BV2: destilación de contexto completo de Gemma 4 26B como opción preferida frente a contexto incompleto.

El entrenamiento se ejecutó en una única GPU A100 de 80 GB durante 9 horas. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generacion de texto conversacional y narrativo, con especial enfasis en roleplay y escritura creativa.
- Creacion de personajes con personalidad y coherencia a lo largo de conversaciones multi-turno.
- Mejora de la calidad de prosa frente al modelo base, gracias al entrenamiento DPO con preferencias humanas.
- Capacidades generales de generacion de texto heredadas de Gemma 4 (razonamiento, codigo, matematicas), aunque no se han verificado de forma independiente en este finetune.
- Soporte de chat mediante plantilla de conversacion (chat template) incluida en el repositorio.
- No se ha confirmado soporte para tool calling, agentes o capacidades multimodales.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones coherentes con personajes definidos, ideal para juegos de rol por texto, foros de roleplay o asistentes narrativos. Su entrenamiento especifico en charcards (tarjetas de personaje) lo hace adecuado para plataformas como SillyTavern o KoboldAI.
- Escritura creativa asistida: generacion de borradores de ficcion, dialogos y descripciones con un estilo literario mejorado. El dataset de preferencias humanas frente a IA ayuda a producir texto menos formulaico.
- Creacion de chatbots de personajes para aplicaciones de entretenimiento: el modelo puede alimentar bots conversacionales con personalidades definidas, util para juegos, experiencias inmersivas o prototipos de ficcion interactiva.
- Generacion de contenido narrativo para videojuegos: escritura de dialogos, misiones y descripciones de escenarios con coherencia de personaje, aprovechando la ventana de contexto (aunque su longitud exacta no se ha publicado).
- Asistentes de escritura para autores: el modelo puede sugerir continuaciones, reescribir pasajes o mantener el tono de un personaje concreto, integrandose en herramientas de procesamiento de texto.
- Prototipado rapido de demos conversacionales: gracias a su licencia Apache 2.0 y su disponibilidad en GGUF, puede desplegarse localmente en equipos de desarrollo para validar conceptos de interaccion narrativa sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandarizadas para este modelo. El autor no ha proporcionado metricas comparativas con el modelo base ni con alternativas similares.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 62,5 GB (segun LLM Explorer), lo que requiere una GPU profesional como A100 80 GB, H100 o similar.
- Con cuantizacion GGUF Q4_K_M, el modelo ocupa aproximadamente 18-20 GB, por lo que cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), y posiblemente en RTX 4080 (16 GB) con limitaciones de contexto.
- El autor recomienda koboldcpp para ejecutar la version GGUF, que soporta offloading de capas a CPU y GPU.
- Opciones de despliegue: koboldcpp, llama.cpp, Ollama (si se genera un archivo Modelfile), y potencialmente vLLM o TGI para versiones safetensors, aunque no se ha verificado su compatibilidad.
- Latencia y throughput: no se han publicado datos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens por segundo, dependiendo de la longitud de contexto y el offloading.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ConicCat/Gemma4-GarnetV3-31B | 31,3 B | No disponible | Apache 2.0 | Roleplay y escritura |
| google/gemma-4-31B-it | 31,3 B | No disponible | Apache 2.0 | Modelo base generalista |
| Qwen3-32B (referencia) | 32 B | No disponible | Apache 2.0 | Generalista, multilingue |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal radica en el ajuste especifico para roleplay y prosa de GarnetV3 frente al modelo base generalista. Qwen3-32B se menciona como referencia de tamano similar, pero no hay datos de evaluacion cruzada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones. Al ser un finetune de roleplay, puede generar contenido ficticio sin distinguir claramente entre realidad y ficcion.
- El modelo esta optimizado para escritura creativa y roleplay, por lo que su rendimiento en tareas tecnicas (codigo, matematicas, razonamiento logico) puede ser inferior al del modelo base.
- La longitud de contexto no se ha especificado; se desconoce si el finetune mantiene la ventana original de Gemma 4 o la reduce.
- No se ha confirmado el soporte para tool calling, agentes o funciones multimodales, aunque el modelo base podria tenerlas.
- El repositorio de GitHub de Damacol (no oficial) describe el modelo como "uncensored", pero esta afirmacion no esta respaldada por el autor ni por documentacion oficial. Se recomienda evaluar el comportamiento del modelo en casos de uso sensibles.
- El entrenamiento se realizo con un unico dataset de preferencias, lo que puede introducir sesgos especificos del estilo de escritura del autor.
- No hay garantias de soporte a largo plazo ni mantenimiento del repositorio, dado que es un proyecto personal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConicCat/Gemma4-GarnetV3-31B
- Dataset ConicCat/Lamp_P_Preference: https://huggingface.co/datasets/ConicCat/Lamp_P_Preference
- Dataset ConicCat/Charcards_Delta_Qwen3_5V2: https://huggingface.co/datasets/ConicCat/Charcards_Delta_Qwen3_5V2
- Dataset ConicCat/Charcards_Context_Distill_Gemma4_26BV2: https://huggingface.co/datasets/ConicCat/Charcards_Context_Distill_Gemma4_26BV2
- Modelo base google/gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Repo de GitHub de Damacol (no oficial): https://github.com/Damacol/coniccat-gemma4-garnet-31b
- Koboldcpp: https://github.com/LostRuins/koboldcpp
