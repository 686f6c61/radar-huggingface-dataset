# issai/foggen-gemma3-1b

## Resumen

FogGen (Gemma-3-1b-it) es un ajuste fino del modelo google/gemma-3-1b-it desarrollado por issai, concebido como puerto de arquitectura Gemma del sistema FogGen original, que se apoya en Qwen3-0.6B. El modelo no busca maximizar la precision bruta, sino entrenar a un modelo pequeno de borde para que sea "consciente" de su propia incertidumbre y verbalice un nivel de confianza calibrado antes de responder. Esa confianza permite enrutar selectivamente las consultas dificiles hacia un modelo profesor en la nube (Qwen3-30B-A3B-Instruct-2507), manteniendo la mayoria del trafico en el dispositivo.

El checkpoint existe para demostrar que la receta de entrenamiento de FogGen no es especifica de la familia Qwen: con la misma secuencia de 14 rondas de SFT, el mismo profesor en la nube y los mismos siete dominios de evaluacion, un backbone Gemma de aproximadamente 1.000 millones de parametros tambien aprende a enrutar mejor que un enrutado aleatorio en todas las rondas. La relevancia actual reside en la investigacion sobre edge-cloud routing, calibracion de confianza verbalizada y aprendizaje continuo en modelos pequenos desplegables en dispositivo.

El modelo tiene 999.885.952 parametros totales segun safetensors, licencia Gemma heredada de su base y soporte declarado de ingles y kazajo. No es el modelo de despliegue canonico del proyecto; ese papel corresponde a issai/foggen, y esta variante debe tratarse como evidencia de transferibilidad de la receta entre familias de arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), ajuste fino con LoRA sobre google/gemma-3-1b-it |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el ejemplo de la model card usa bfloat16 |
| Idiomas soportados | en, kk |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3 en su variante de 1B parametros, y se ajusta mediante LoRA con rango 16, alpha 32, aplicado a todas las capas lineales, en bf16, durante 2 epocas con tasa de aprendizaje 5e-5. El entrenamiento sigue la receta FogGen: 14 rondas secuenciales de SFT (R0 a R14) sobre una rotacion de siete dominios en orden fijo, usando como profesor en la nube a Qwen3-30B-A3B-Instruct-2507. El objetivo es que el modelo de borde emita primero un nivel de confianza discreto (0.0, 0.25, 0.5, 0.75 o 1.0) y despues la respuesta final en formato de opcion multiple.

La unica variacion respecto al FogGen canonico es el backbone de borde. Para la ronda R0 se reetiqueta desde cero un buffer de calibracion de 1.800 preguntas con el modelo base Gemma-3-1b-it sin ajustar, usando N=8 muestras a temperatura 0.7. La model card senala que la distribucion de buckets de confianza resultante es marcadamente bimodal en Gemma (casi toda la masa en confianza baja y alta, sin apenas buckets intermedios), a diferencia de la distribucion mas equilibrada de Qwen; la receta se mantiene robusta porque los pools de dominios nuevos aportan suficiente exposicion a buckets intermedios para evitar el colapso del vocabulario de calibracion. No se documentan innovaciones de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato de chat, con plantilla de chat aplicada mediante apply_chat_template.
- Razonamiento de opcion multiple en siete dominios: finanzas, ciencia, programacion, derecho, matematicas, cultura kazaja y medicina.
- Verbalizacion de confianza calibrada: emite un nivel de confianza discreto antes de la respuesta final, lo que habilita el enrutado selectivo.
- Auto-evaluacion y enrutado edge-cloud: el propio modelo decide implicitamente, via su confianza, si una consulta debe resolverse en el dispositivo o derivarse a un modelo mayor.
- Aprendizaje continuo multi-ronda: el checkpoint R14 incorpora 14 rondas de ajuste sobre dominios rotatorios.
- Capacidades multilingues limitadas a ingles y kazajo segun los metadatos.
- No se documentan soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento extendido en la informacion proporcionada.

## Casos de uso

- Enrutado edge-cloud en asistentes desplegados en dispositivo: el modelo responde localmente las consultas de alta confianza y deriva al profesor en la nube las de baja confianza; en la evaluacion, el 38,6 % medio de consultas se enrutaron a la nube con una precision de sistema del 76,3 % frente al 68,6 % del enrutado aleatorio.
- Investigacion sobre calibracion de confianza: sirve como banco de pruebas para estudiar la relacion entre confianza verbalizada y acierto real en modelos de 1B, con un error de calibracion esperado medio de 18,7 en R14.
- Validacion de transferibilidad de recetas de entrenamiento: permite comparar la misma secuencia de SFT sobre arquitecturas distintas (Gemma frente a Qwen) y cuantificar si el comportamiento de enrutado se conserva.
- Aplicaciones de conocimiento cultural kazajo: es el dominio donde el modelo de borde rinde mejor en solitario (76,1 % de precision), por lo que puede resolver localmente buena parte de estas consultas con solo un 14,7 % de derivaciones a la nube.
- Experimentos de aprendizaje continuo: la secuencia R0-R14 documentada facilita reproducir estudios sobre olvido catastrofico y rotacion de dominios en modelos pequenos.
- Prototipado de sistemas de bajo coste en el borde: al mantener la mayoria del trafico en un modelo de aproximadamente 1.000 millones de parametros, reduce la dependencia de llamadas a modelos grandes en escenarios con restricciones de latencia o coste.
- Evaluacion comparativa de enrutadores: el checkpoint proporciona una linea base reproducible (R14 a tau = 0,5) frente a enrutado aleatorio y frente a politicas de solo nube o solo borde.

## Benchmarks y rendimiento

Resultados de R14 con tau = 0,5 sobre los siete conjuntos de evaluacion, con las claves corregidas de issai/foggen-data. La precision del sistema cuenta la respuesta de borde en consultas retenidas y la respuesta de la nube (Qwen3-30B-A3B-Instruct-2507) en consultas enrutadas.

| Dominio | Solo nube | Solo borde | Enrutado aleatorio | FogGen | Enrutado a nube |
|---|---|---|---|---|---|
| Finanzas | 92,3 % | 52,7 % | 65,3 % | 73,9 % | 31,8 % |
| Ciencia | 93,6 % | 38,2 % | 72,6 % | 83,8 % | 62,1 % |
| Programacion | 93,5 % | 55,8 % | 64,4 % | 70,7 % | 22,8 % |
| Derecho | 87,7 % | 50,4 % | 60,7 % | 68,0 % | 27,5 % |
| Matematicas | 95,5 % | 32,2 % | 73,2 % | 79,7 % | 64,7 % |
| Cultura kazaja | 96,2 % | 76,1 % | 79,0 % | 83,9 % | 14,7 % |
| Medicina | 88,9 % | 44,0 % | 65,1 % | 74,3 % | 47,0 % |
| Media | 92,5 % | 49,9 % | 68,6 % | 76,3 % | 38,6 % |

FogGen supera al enrutado aleatorio en 7,7 puntos en R14 y en 7,5 puntos de media entre las rondas 1 y 14. El error de calibracion esperado medio es de 18,7 en R14. Frente a las claves almacenadas de la primera release, R14 alcanza el 62,0 % frente al 57,8 % del enrutado aleatorio. La model card advierte que versiones anteriores de la tarjeta atribuian a las consultas enrutadas la precision media de la nube sobre todo el conjunto y usaban las claves almacenadas; las cifras de la tabla usan las claves corregidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 999.885.952 parametros, en bf16 los pesos ocupan aproximadamente 2 GB, y en cuantizaciones de 8 y 4 bits se situarian en torno a 1 GB y 0,5 GB respectivamente (estimacion por tamano, no publicada por el autor).
- GPU recomendadas: no especificadas en la informacion proporcionada; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojar los pesos en bf16.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: transformers (ejemplo oficial de la model card con AutoModelForCausalLM y device_map="auto"); los tags incluyen text-generation-inference y endpoints_compatible. No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI mas alla de la etiqueta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| issai/foggen-gemma3-1b | 999.885.952 | no disponible | Enrutado edge-cloud con confianza verbalizada sobre Gemma 3 | gemma | HuggingFace |
| issai/foggen | no disponible en esta ficha | no disponible | Enrutado edge-cloud canonico sobre Qwen3-0.6B | no disponible en esta ficha | HuggingFace |
| google/gemma-3-1b-it | no disponible en esta ficha | no disponible | Modelo base instructivo generalista | gemma | HuggingFace |
| Qwen3-30B-A3B-Instruct-2507 | no disponible en esta ficha | no disponible | Profesor en la nube, MoE de gran tamano | no disponible en esta ficha | HuggingFace |

La comparacion cuantitativa entre variantes no esta disponible mas alla de los resultados de enrutado de esta ficha; el autor no publica una tabla comparativa directa entre el checkpoint Gemma y el Qwen3-0.6B canonico.

## Limitaciones y advertencias

- El modelo esta especializado en preguntas de opcion multiple con un formato de salida concreto (Confidence y Final answer); su uso fuera de ese protocolo no esta validado.
- La distribucion de confianza del buffer de calibracion es marcadamente bimodal en Gemma, con escasa masa en buckets intermedios, lo que puede degradar la granularidad del enrutado en dominios poco representados.
- El error de calibracion esperado medio de 18,7 en R14 indica que la confianza verbalizada no es una probabilidad perfectamente calibrada; el umbral tau debe validarse en el dominio de despliegue.
- La precision de sistema media (76,3 %) queda por debajo del modelo de nube en solitario (92,5 %); el beneficio es de coste y latencia, no de precision maxima.
- Idiomas soportados limitados a ingles y kazajo segun los metadatos; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a un modelo de aproximadamente 1.000 millones de parametros, especialmente en matematicas (32,2 % solo borde) y ciencia (38,2 % solo borde).
- Licencia Gemma Terms of Use heredada de google/gemma-3-1b-it; deben revisarse las restricciones de uso comercial antes de un despliegue en produccion.
- No es el modelo de despliegue canonico del proyecto; el autor remite a issai/foggen para el sistema completo y la documentacion del protocolo de enrutado.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; los datos de la tabla son de enrutado por dominio, no de benchmarks genericos.
- El paper esta anunciado como "coming soon", por lo que no hay documentacion metodologica revisada por pares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/issai/foggen-gemma3-1b
- Modelo canonico FogGen: https://huggingface.co/issai/foggen
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Profesor en la nube: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/issai/foggen-data
- Dataset de cultura kazaja: https://huggingface.co/datasets/issai/KazCulture
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
