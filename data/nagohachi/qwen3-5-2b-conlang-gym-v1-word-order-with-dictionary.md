# nagohachi/Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary

## Resumen

Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary es un ajuste fino del modelo base Qwen/Qwen3.5-2B, publicado por el usuario nagohachi en Hugging Face. Se trata de un modelo de 2.213.241.664 parametros (aproximadamente 2,2 mil millones) entrenado mediante aprendizaje por refuerzo agéntico con GRPO sobre la etapa de orden de palabras del entorno conlang-gym v1. El problema que aborda es muy especifico: la documentacion de lenguas artificiales generadas a partir de una semilla, donde el modelo debe interrogar a un informante para descubrir el orden de palabras y despues traducir significados no vistos.

El modelo parte de Qwen3.5-2B, una arquitectura transformer multimodal con pipeline image-text-to-text, y conserva la licencia Apache 2.0 del modelo base. La relevancia de esta ficha es acotada: no se trata de un modelo de proposito general, sino de un artefacto de investigacion que demuestra como el RL agéntico puede llevar a un modelo pequeno de una precision cercana al azar (4,5-18,7 por ciento segun el orden de palabras) a una precision casi perfecta (84,6-100 por ciento) en una tarea lingüistica estructurada.

El repositorio ocupa 4,4 GB y los pesos estan en formato safetensors, con soporte para transformers. El modelo solo declara ingles como idioma y esta disenado para funcionar con un protocolo de turnos muy concreto: el entorno envia la tarea como primer mensaje de usuario y cada respuesta del informante como mensaje de usuario posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), pipeline image-text-to-text |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-2B, un transformer multimodal de 2,2 mil millones de parametros. El entrenamiento se realizo con aprendizaje por refuerzo agéntico mediante GRPO (Group Relative Policy Optimization), ejecutado de forma asincrona con la libreria verl. Se completaron 62 pasos sobre 7.936 lenguas generadas, con 5 rollouts por lengua, y el modo de razonamiento (thinking) se mantuvo desactivado durante el entrenamiento (`enable_thinking=False`).

La innovacion tecnica no reside en la arquitectura, sino en el entorno de entrenamiento: conlang-gym v1 genera lenguas artificiales a partir de una semilla en las que solo varia el orden de palabras (SOV, SVO, VSO, OSV, OVS, VOS) y el vocabulario, sin morfologia ni afijos. Cada palabra es una raiz de dos silabas consonante-vocal. El prompt proporciona un diccionario con la raiz de cada nombre y verbo, de modo que el modelo solo debe inferir el orden de palabras. El modelo dispone de un presupuesto de 6 preguntas, una accion por turno, y despues debe traducir 8 significados en un unico turno. La recompensa es la fraccion de items de test cuya respuesta coincide exactamente con la referencia tras normalizacion, excluyendo los items identicos a un significado ya preguntado.

## Capacidades

- Razonamiento lingüistico estructurado: inferir el orden de palabras de una lengua artificial a partir de un diccionario y de un maximo de 6 consultas a un informante.
- Formulacion de acciones en formato XML: `<action>ask(...)</action>` y `<action>done</action>`, con validacion de errores de formato, rango y tipo.
- Traduccion de significados no vistos a la lengua artificial, respondiendo con etiquetas `<answer id="N">...</answer>`.
- Gestion de un presupuesto limitado de interacciones y decision de cuando finalizar la investigacion.
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text), aunque no se documenta su uso en esta tarea.
- Soporte de tool calling / function calling: no documentado de forma explicita; el mecanismo de acciones es un protocolo propio del entorno, no un esquema de herramientas generico.
- Soporte de agentes y razonamiento multi-paso: si, es el nucleo del entrenamiento (episodios de investigacion con multiples turnos).
- Capacidades multilingues: limitadas al ingles segun la model card; el modelo opera sobre lenguas artificiales generadas, no sobre idiomas naturales.
- Modo thinking: desactivado explicitamente durante el entrenamiento.

## Casos de uso

- Investigacion en aprendizaje por refuerzo agéntico: utilizar el modelo como referencia o linea base para estudiar como GRPO modifica el comportamiento de exploracion y la formulacion de preguntas en un entorno con presupuesto limitado.
- Experimentos de documentacion lingüistica simulada: emplear el modelo para generar y evaluar estrategias de elicitacion de gramatica en lenguas artificiales, comparando el numero de preguntas necesarias para inferir el orden de palabras.
- Evaluacion de generalizacion composicional: el modelo permite medir la transferencia a ordenes de palabras no vistos durante el entrenamiento (VOS alcanza 0,846 frente a 1,000 en ordenes vistos), lo que lo hace util para estudiar extrapolacion.
- Benchmark de agentes con acciones estructuradas: sirve como tarea de control para validar frameworks de agentes que necesitan parsear acciones XML, gestionar errores y mantener estado entre turnos.
- Generacion de datos sinteticos para entrenamiento: el protocolo y las lenguas generadas por semilla pueden reutilizarse para producir episodios de entrenamiento o evaluacion de otros modelos pequenos.
- Estudio de robustez ante errores de formato: el entorno devuelve errores de formato, rango y tipo, lo que permite analizar como un modelo de 2,2 mil millones de parametros se recupera de acciones invalidas.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la metrica de recompensa media (fraccion de items de test traducidos exactamente) sobre 64 lenguas reservadas por orden de palabras, con decodificacion greedy. Se compara con Qwen3.5-2B evaluado con los mismos prompts y protocolo.

| Orden de palabras | En entrenamiento | Qwen3.5-2B | Este modelo |
|---|---|---|---|
| SOV | si | 0,124 | 1,000 |
| SVO | si | 0,187 | 1,000 |
| VSO | si | 0,046 | 1,000 |
| OSV | si | 0,086 | 0,977 |
| OVS | si | 0,050 | 0,996 |
| VOS | no | 0,045 | 0,846 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 2,2 mil millones de parametros, en fp16 se requieren aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 2,2-2,5 GB y en 4 bits aproximadamente 1,1-1,5 GB, aunque estas cifras son estimaciones y no estan publicadas por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB en fp16; para despliegue en servidor, A100 o H100 no serian necesarias por capacidad, pero si para throughput agregado.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas en fp16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; dado que el repo solo incluye safetensors, seria necesario convertir a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary | 2,21 B | no disponible | 0,846-1,000 de recompensa media | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | no disponible en la informacion | no disponible | 0,045-0,187 de recompensa media | apache-2.0 | Hugging Face |
| Otros ajustes de conlang-gym | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en lenguas con variacion de orden de palabras y sin morfologia; no generaliza a lenguas con afijos, casos o sistemas mas complejos.
- Espera el prompt y el protocolo de turnos exactos de conlang-gym: el informante responde como mensaje de usuario y las acciones deben ir en etiquetas `<action>`. Fuera de ese formato el rendimiento no esta garantizado.
- El idioma declarado es solo ingles; no se documenta soporte multilingue real.
- Riesgo de alucinacion: en esta tarea el modelo puede producir traducciones plausibles pero incorrectas cuando el orden de palabras no se ha inferido con certeza, especialmente en ordenes no vistos (VOS, 0,846).
- La recompensa se calcula por coincidencia exacta tras normalizacion, lo que no mide calidad parcial ni comprension gramatical profunda.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo no esta pensado para produccion ni para tareas de proposito general; su uso comercial realista es muy limitado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-20), por lo que no hay validacion independiente de los resultados.
- Al ser un ajuste fino de un modelo multimodal, conserva las limitaciones y sesgos del Qwen3.5-2B base, que no se detallan en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Libreria verl: no disponible como enlace en la informacion proporcionada
- Paper o blog de conlang-gym: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
