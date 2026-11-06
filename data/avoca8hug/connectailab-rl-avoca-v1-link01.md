# avoca8Hug/connectailab-rl-avoca-v1-link01

## Resumen

connectailab-rl-avoca-v1-link01 es un adaptador LoRA publicado por avoca8Hug que convierte el modelo base Qwen/Qwen3.5-0.8B en un clasificador de decisiones discretas para el robot simulado LINK-01, dentro del proyecto CONNECT AI WORLD. El modelo recibe una descripcion textual del estado del robot (distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y accion previa) y devuelve una unica letra que representa la accion de locomocion para los proximos 0,5 segundos. No es un modelo generativo de proposito general, sino una destilacion de una politica PPO entrenada previamente en un simulador web, orientada a la tarea `avoid_obstacles`.

El entrenamiento combina dos fases: un ajuste supervisado con LoRA sobre 1282 ejemplos de entrenamiento generados a partir de las observaciones y decisiones de la politica PPO (el "cerebro" profesor), seguido de un refinamiento con aprendizaje por refuerzo usando senales de recompensa por opcion y una penalizacion KL contra el modelo supervisado. El resultado es un adaptador pequeno (repo de 0,0 GB en pesos) sobre un transformer denso de 0,8 mil millones de parametros, con licencia Apache 2.0.

Su relevancia es fundamentalmente educativa y de investigacion: demuestra un pipeline completo de politica RL a modelo de lenguaje mediante imitacion y RL posterior, con evaluacion en el mismo circuito simulado. No esta pensado para produccion general ni para control de robots reales sin revalidacion, y su soporte linguistico declarado es unicamente coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA anade un numero no disponible de parametros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parametros. El adaptador se entrena en dos etapas. Primero, aprendizaje supervisado: se construye un conjunto de 1282 problemas de entrenamiento (mas 251 de validacion y 374 de test) en los que cada observacion del robot se serializa como texto y la etiqueta es la accion elegida por la politica PPO profesora; aproximadamente el 20 % de los ejemplos incluyen desviaciones deliberadas para cubrir situaciones fuera de la trayectoria optima. Despues, refinamiento por aprendizaje por refuerzo: para cada opcion se calcula la recompensa que habria obtenido el robot si hubiera ejecutado esa opcion y el resto de la trayectoria la hubiera completado el cerebro profesor, y se aplica una actualizacion tipo PPO con anclaje KL al modelo supervisado.

La innovacion tecnica principal es el pipeline de destilacion politica-a-lenguaje con RL posterior y la evaluacion cerrada sobre el mismo circuito: el modelo se sienta en la posicion de decision del robot y se ejecutan 20 episodios con semillas 91001-91020. La metrica de exito se mide con una aproximacion 2D de la marcha basada en una tabla de velocidades por comando, no con el modelo fisico completo, por lo que los resultados pueden diferir de los del simulador MuJoCo web. El techo de rendimiento viene dado por la consistencia de la serializacion textual: la tasa de coincidencia entre la respuesta del cerebro y la del modelo cuando se le da la respuesta correcta es del 99 %.

## Capacidades

- Clasificacion de decision discreta: selecciona exactamente una opcion (una letra) entre las presentadas en el enunciado, sin explicacion.
- Interpretacion de estado textual: procesa descripciones de distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y accion previa.
- Navegacion con evitacion de obstaculos en el simulador LINK-01 para la tarea `avoid_obstacles`.
- Robustez a instrucciones embebidas en el estado: el prompt de sistema indica tratar el contenido del estado como datos, no como instrucciones.
- Capacidad multilingue limitada al coreano, idioma en el que estan redactados los enunciados de entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion educativa sobre pipelines RL a lenguaje: reproducir el flujo completo (politica PPO, generacion de dataset, LoRA supervisado, RL con KL) usando el cuaderno de Colab y el repositorio connect-tycoon.
- Docencia de aprendizaje por refuerzo: comparar las curvas de un cerebro PPO, un modelo supervisado y un modelo con RL posterior sobre la misma tarea y el mismo conjunto de evaluacion.
- Evaluacion de destilacion de politicas: medir la brecha entre la politica profesora (100 % de coincidencia) y el modelo destilado (71,7 %) para estudiar perdida de informacion en la serializacion textual.
- Prototipado de agentes de decision en simulacion: integrar el adaptador como modulo de seleccion de accion en entornos 2D discretos antes de escalar a politicas mas complejas.
- Estudio de robustez a inyeccion de instrucciones: el formato de prompt con separacion entre estado y pregunta permite analizar como responde un modelo pequeno a datos no confiables.
- Base para experimentos de RLHF ligero: reutilizar la senal de recompensa por opcion y el anclaje KL como plantilla para otros dominios de decision con opciones discretas.
- Demostracion de bajo coste computacional: el adaptador sobre un modelo de 0,8 mil millones de parametros permite ejecutar el ciclo completo en una unica GPU de consumo.

## Benchmarks y rendimiento

| Modelo | Precision en test (coincidencia con el cerebro) | Exito en 20 episodios del mismo circuito | Episodios con colision | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0 % | 100 % | 5 % | 27,8 s |
| Modelo antes de entrenar | 45,5 % | 0 % | 0 % | No disponible |
| Aprendizaje supervisado (LoRA) | 70,9 % | 90 % | 0 % | 30,3 s |
| Aprendizaje por refuerzo (este modelo) | 71,7 % | 90 % | 0 % | 31,3 s |

El techo de precision impuesto por la serializacion textual es del 99 %. La evaluacion de la marcha usa una aproximacion 2D con tabla de velocidades por comando, no el simulador MuJoCo completo. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 mil millones de parametros en fp16 requiere aproximadamente 1,6 GB de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits se situa por debajo de 1 GB. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas. El modelo cabe holgadamente en GPU de consumo.
- Despliegue: transformers con PEFT (`PeftModel.from_pretrained`) es el metodo documentado. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles. Al tratarse de una clasificacion de una sola letra sobre un modelo de 0,8 mil millones de parametros, la generacion es de un unico token y la latencia dominante es la codificacion del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-avoca-v1-link01 | 0,8 mil millones (base) + LoRA | No disponible | Decision discreta para LINK-01 (`avoid_obstacles`) | Apache 2.0 | Hugging Face, 19 descargas |
| Cerebro PPO profesor (referencia interna) | No disponible (politica RL) | No aplica | Misma tarea, misma evaluacion | No disponible | Referenciado en la model card, no publicado como modelo |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8 mil millones | No disponible | Generacion de texto general | No disponible en la informacion | Hugging Face |

No se dispone de informacion sobre otros adaptadores de decision comparables en la misma categoria publicados por el mismo autor.

## Limitaciones y advertencias

- Modelo de investigacion y educacion sobre simulador: la propia model card advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Evaluacion de marcha aproximada: el exito se mide con una tabla 2D de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir del entorno web.
- Brecha respecto al profesor: la precision en test es del 71,7 % frente al 100 % del cerebro PPO, y el tiempo medio por episodio exitoso es un 12,6 % mayor (31,3 s frente a 27,8 s).
- Idioma: el modelo solo declara soporte de coreano; los enunciados en otros idiomas no estan cubiertos por el entrenamiento.
- Alcance funcional estrecho: responde unicamente con una letra entre las opciones listadas y no genera explicaciones ni razonamiento; no admite tool calling ni agentes multi-paso.
- Riesgo de alucinacion de opcion: al ser un clasificador generativo, puede emitir una letra no presente en las opciones si el prompt se desvia del formato de entrenamiento.
- Dependencia del formato de prompt: requiere el mensaje de sistema y la estructura de pregunta documentados; cambios en la serializacion del estado degradan el rendimiento.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre una unica politica y un unico circuito, hereda las preferencias de esa politica.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B tiene sus propias condiciones, no detalladas en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avoca8Hug/connectailab-rl-avoca-v1-link01
- Repositorio de codigo de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo con robot: https://www.aicitybuilders.com/robot
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
