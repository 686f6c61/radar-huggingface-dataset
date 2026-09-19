# SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep

## Resumen

El modelo `qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep` es un ajuste fino de Qwen3-1.7B (2.031.739.904 parametros) desarrollado por el usuario SeanWang0027 y publicado bajo licencia Apache-2.0. Su proposito no es la generacion de texto generalista, sino actuar como agente ReAct dentro del entorno interactivo ScienceWorld, un simulador de tareas cientificas de multiples pasos en el que el modelo debe emitir comandos textuales (`open OBJ`, `focus on OBJ`, `mix A and B`) para resolver objetivos. El modelo se entrena especificamente para razonar y actuar de forma encadenada en ese entorno.

La particularidad tecnica del modelo es su metodo de entrenamiento, denominado ROSE (online multi-turn, 10+5). En cada episodio el alumno juega los primeros 10 turnos en un entorno ScienceWorld real y despues un profesor (`gpt-5.4-mini` de OpenAI, con `reasoning_effort=medium`) continua el mismo entorno durante hasta 5 turnos adicionales. Solo los turnos del profesor se usan como objetivo de entrenamiento por entropia cruzada, de modo que el alumno se supervisa sobre estados a los que ha llegado por si mismo, no sobre trayectorias ajenas. Esta variante on-policy se compara en la propia model card con una version SFT sobre trayectorias estaticas del mismo profesor.

El modelo es relevante como caso de estudio de destilacion on-policy en entornos interactivos: con solo 2.031 millones de parametros y 512 tokens por turno, supera en la particion de test de ScienceWorld a su equivalente entrenado con SFT clasico (17,50% frente a 12,88% de tasa de exito) y a la base sin ajustar (0,12%). Es un modelo de investigacion, sin descargas ni valoraciones en el momento de la consulta, y su uso previsto es la evaluacion en entornos de agente, no el despliegue conversacional general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-1.7B); no disponible el detalle exacto de capas y cabezas en la informacion proporcionada |
| Parametros totales | 2.031.739.904 (aproximadamente 2,03 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen/Qwen3-1.7B declara 32.768 tokens nativos. El entrenamiento y la evaluacion usan 512 tokens por turno |
| Tipos de cuantizacion | No se publican variantes cuantizadas; los pesos estan en safetensors con `torch_dtype=bfloat16`. Compatible con cuantizacion posterior a 8 y 4 bits mediante herramientas externas |
| Idiomas soportados | No disponible en la model card. Los datos de entrenamiento (ScienceWorld y las continuaciones del profesor) estan en ingles, por lo que el uso fiable se limita a ese idioma |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 4,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B, un transformer decoder-only denso de 2.031 millones de parametros, sin mezcla de expertos ni mecanismos de estado recurrente. El ajuste no modifica la topologia: se parte de los pesos preentrenados y se aplica un ajuste fino supervisado con `AdamW`, learning rate constante de 1e-5 y precision `bf16`. El modo de razonamiento explicito de Qwen3 (`thinking`) se mantiene desactivado tanto en entrenamiento como en inferencia.

El entrenamiento se realizo sobre 2.059 variaciones de tarea del conjunto de entrenamiento de ScienceWorld, con 32 episodios por paso, un episodio por tarea y epoca, y un total de 3 epocas (192 pasos). En cada epoca se generan prefijos nuevos del alumno y continuaciones nuevas del profesor, lo que suma 24.390 llamadas a la API del profesor. La secuencia se limita a 512 tokens por turno y solo se emplea la respuesta visible del profesor (sin cadena de razonamiento oculta). La innovacion principal es el esquema ROSE 10+5: la supervision recae exclusivamente sobre los turnos del profesor, pero el contexto proviene del propio alumno, lo que reduce la discrepancia entre distribucion de entrenamiento y de inferencia (problema habitual del SFT off-policy). Segun la model card, en los rollouts de entrenamiento el profesor elevo la puntuacion del episodio en +0,112 de media a lo largo de sus 5 turnos.

## Capacidades

- Generacion de texto condicionada a observaciones del entorno, con formato fijo de salida `Thought:\n...\n\nAction:\n<comando>`.
- Ejecucion de acciones textuales de ScienceWorld (abrir, cerrar, enfocar, mezclar, calentar, medir, desplazarse entre habitaciones).
- Razonamiento multi-paso dentro de un episodio de hasta 30 rondas de interaccion.
- Mantenimiento de estado conversacional multi-turno: la conversacion se construye con un turno de usuario por cada observacion del simulador.
- Seguimiento de instrucciones en formato ReAct (instruccion de ScienceWorld del protocolo AgentGym como primer turno de usuario, acuse de recibo canónico del asistente y despues una observacion por turno).
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible`, segun las etiquetas del repositorio.
- Capacidades generales heredadas de Qwen3-1.7B (generacion, codigo, matematicas) no se documentan ni se evaluan en la model card; el ajuste esta especializado en el entorno.
- Tool calling, function calling generico, agentes fuera de ScienceWorld, vision, audio y modo thinking: no disponibles o explicitamente desactivados.

## Casos de uso

- Investigacion en destilacion on-policy: reproducir el esquema ROSE 10+5 con otros profesores o tamanos de alumno y medir la ganancia frente al SFT clasico, usando este checkpoint como referencia de la epoca 3 (paso 192).
- Evaluacion de agentes en ScienceWorld: sirve como baseline ligero dentro del protocolo AgentGym con la particion de test de 200 variaciones, 4 pasadas y temperatura 0,4.
- Generacion de trayectorias sinteticas: el modelo puede producir rollouts etiquetados en el simulador que despues se filtren por puntuacion final para alimentar un entrenamiento posterior o un reranker de acciones.
- Agente educativo en dominios cientificos simulados: integrado en un entorno tipo ScienceWorld para practicar protocolos de laboratorio (mezclas, cambios de estado, mediciones) con retroalimentacion paso a paso.
- Prototipado rapido de pipelines ReAct: al ser un modelo de 2,03 B con salida estructurada, permite iterar sobre el bucle observacion-razonamiento-accion sin coste elevado de inferencia.
- Despliegue en hardware de gama de consumo para demostraciones: cuantizado a 4 bits ocupa del orden de 1,2 a 1,5 GB, por lo que cabe en GPUs de 8 GB o incluso en CPU con llama.cpp tras conversion a GGUF.
- Comparacion controlada de tecnicas de ajuste: la existencia de la variante SFT del mismo autor y con el mismo profesor permite aislar el efecto de la supervision on-policy manteniendo constantes datos y epocas.
- Analisis de fallos de plantilla: el modelo reduce la copia literal de la plantilla `open/close OBJ` del 74,88% (SFT) al 35,22%, lo que lo hace util para estudiar como el ajuste on-policy mitiga el sesgo hacia el texto del prompt.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre la particion de test de ScienceWorld (200 variaciones de tarea, protocolo AgentGym, 4 pasadas independientes, temperatura 0,4, 512 tokens por turno, maximo 30 rondas, thinking desactivado, sin turno de sistema). Exito = puntuacion final de 100. Media ± desviacion estandar entre las 4 pasadas.

| Modelo | Tasa de exito | Avg@1 (puntuacion final media / 100) |
|---|---|---|
| Qwen3-1.7B (base) | 0,12% ± 0,22 | -0,0331 |
| SFT sobre trayectorias de gpt-5.4-mini, 3 epocas | 12,88% ± 1,24 | 0,1557 |
| ROSE online 10+5 con profesor gpt-5.4-mini, 3 epocas | 17,50% ± 2,29 | 0,2942 |

Diferencia ROSE menos SFT, con bootstrap emparejado por tareas: +4,62 puntos de exito (intervalo [0,75; 8,75]) y +0,139 en Avg@1 (intervalo [0,072; 0,203]). Una ejecucion separada del mismo esquema con 1 sola epoca obtuvo un 8,88% de exito. En los rollouts de entrenamiento, el profesor incremento la puntuacion del episodio en +0,112 de media durante sus 5 turnos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 4,06 GB solo para parametros; con cache KV y activaciones, entre 5 y 6 GB de VRAM para el contexto de 512 tokens por turno.
- Pesos en int8: del orden de 2,1 GB de VRAM.
- Pesos en 4 bits: del orden de 1,2 a 1,5 GB de VRAM.
- Cabe en GPU de consumo: si. Modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan la version bf16 sin problema; una RTX 3060 de 8 GB o una RTX 2070 requieren cuantizacion a 8 o 4 bits.
- GPU de centro de datos recomendadas: A100, H100, L40S o similares, utiles sobre todo para servir muchas peticiones concurrentes o para reentrenar el modelo con el esquema ROSE.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `torch_dtype="bfloat16"`; `text-generation-inference` (etiqueta presente en el repositorio) y endpoints compatibles; vLLM para servicio concurrente. Para llama.cpp u Ollama es necesaria una conversion a GGUF que el autor no publica.
- Plantilla de chat: obligatorio usar la plantilla de Qwen3 con `enable_thinking=False`; renderizar con `apply_chat_template(messages, add_generation_prompt=True, enable_thinking=False)`.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un modelo denso de 2,03 B en bf16 sobre una RTX 4090 es de baja latencia por turno, pero el autor no publica cifras.

## Comparativa con modelos similares

La model card solo ofrece comparacion directa con la base y con la variante SFT del mismo autor. No se dispone de datos de terceros medidos bajo el mismo protocolo.

| Modelo | Parametros | Contexto | Tasa de exito en ScienceWorld test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep (este modelo) | 2,03 B | No disponible en la ficha (base Qwen3-1.7B: 32.768 tokens nativos); entrenado a 512 tokens por turno | 17,50% ± 2,29 | Apache-2.0 | Publico en HuggingFace, 0 descargas |
| qwen3-1.7b-sciworld-sft-gpt54mini-3ep | 2,03 B | Igual, 512 tokens por turno en entrenamiento | 12,88% ± 1,24 | Apache-2.0 | Publico en HuggingFace |
| Qwen/Qwen3-1.7B (base) | 2,03 B | 32.768 tokens nativos | 0,12% ± 0,22 | Apache-2.0 | Publico en HuggingFace |

Alternativas de otros autores para tareas de agente sobre entornos textuales: no disponible en la informacion proporcionada, ya que no hay resultados comparables medidos con el mismo protocolo AgentGym y las mismas 200 variaciones de test.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado para ScienceWorld con formato ReAct. Fuera de ese entorno y de ese formato de salida es probable que su comportamiento degrade rapidamente.
- Idioma: no se declaran idiomas soportados. Los datos de entrenamiento estan en ingles, por lo que no hay garantia de funcionamiento en castellano ni en otros idiomas.
- Alucinacion: el modelo emite comandos de accion en un espacio cerrado; cuando el comando no es valido, el simulador lo rechaza. No hay evaluacion de veracidad fuera del simulador.
- Sesgo de plantilla: el profesor copia a veces literalmente la plantilla de accion `open/close OBJ` del prompt, que el simulador rechaza. Este checkpoint la emite en el 35,22% de sus turnos, frente al 74,88% de la variante SFT. Es una limitacion conocida y explicitamente documentada por el autor, y sigue afectando a mas de un tercio de los turnos.
- Rendimiento absoluto bajo: una tasa de exito del 17,50% implica que el modelo falla en mas de cuatro de cada cinco tareas de test. No es apto para uso productivo sin supervision.
- Modo thinking desactivado: el modelo fue entrenado con el razonamiento explicito de Qwen3 apagado; activarlo en inferencia puede degradar el formato de salida.
- Sin datos de sesgo, toxicidad o robustez: no se publican evaluaciones de seguridad.
- Uso comercial: la licencia Apache-2.0 lo permite, tanto en este ajuste como en el modelo base. No hay clausulas adicionales conocidas, pero conviene verificar los terminos del modelo base Qwen3-1.7B y del simulador ScienceWorld para su uso en productos.
- Adopcion nula: 0 descargas y 0 valoraciones en el momento de la consulta; no hay validacion externa de los resultados mas alla de la model card del autor.
- Fecha de publicacion: el repositorio figura creado y actualizado el 19 de septiembre de 2026, con escasa difusion posterior.
- Reproducibilidad: el esquema depende de un profesor propietario (`gpt-5.4-mini` via API de OpenAI) cuyas llamadas no se publican; replicar el entrenamiento tal cual puede no ser posible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
- Variante SFT del mismo autor y mismo profesor: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog, repositorio o demo del entrenamiento ROSE: no disponible en la informacion proporcionada.
- Los resultados de la busqueda web no contienen enlaces relevantes al modelo (devuelven contenido no relacionado sobre direcciones y mapas de Roma).
