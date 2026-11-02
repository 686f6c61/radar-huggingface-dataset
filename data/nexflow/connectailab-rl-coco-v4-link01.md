# nexflow/connectailab-rl-coco-v4-link01

## Resumen

connectailab-rl-coco-v4-link01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario nexflow dentro del ecosistema CONNECT AI LAB y AI CITY BUILDERS. Su proposito es actuar como cerebro de decision para el robot simulado LINK-01: recibe una descripcion textual del estado del robot (distancia y direccion al objetivo, sensores de distancia, velocidad y eleccion previa) y devuelve una unica letra que representa la accion de caminar durante los siguientes 0,5 segundos.

El modelo no es un LLM de proposito general, sino un clasificador de acciones disfrazado de modelo de lenguaje. Se entrena en dos fases: primero un ajuste supervisado (LoRA) sobre pares estado-accion generados por una politica PPO entrenada en un simulador web, y despues un refinamiento con aprendizaje por refuerzo (PPO con penalizacion KL) que reordena las preferencias entre las opciones de accion. El resultado es un modelo de 0,8 mil millones de parametros con contexto corto, especializado en una unica tarea (`goto_target`) y en un unico idioma de salida (coreano en la documentacion, aunque las respuestas son letras).

Es relevante como ejemplo didactico de destilacion de politicas de RL en modelos de lenguaje pequenos y de despliegue de adaptadores PEFT para robótica simulada. No esta pensado para uso en produccion ni para robots reales sin revalidacion, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA no declara numero de parametros entrenables; el modelo base tiene ~0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-0.8B no la declara en la informacion proporcionada; las entradas son descripciones cortas de estado) |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos safetensors del adaptador; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Coreano (`ko`); la salida es una letra de opcion, el prompt de sistema esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parametros. La innovacion no esta en la arquitectura del modelo base, sino en el pipeline de entrenamiento en dos etapas. Primero se genera un "cuaderno de problemas": una politica PPO (el "cerebro", `brain.json`) entrenada en un simulador web de MuJoCo para la tarea `goto_target` recorre un curso aleatorio y, cada 0,5 segundos, se convierte su observacion en una pregunta textual con cinco opciones de accion; la respuesta correcta es la accion elegida por el cerebro. Se incluye un 20% de ejemplos con acciones suboptimas para cubrir situaciones de desvio. El conjunto resultante tiene 767 ejemplos de entrenamiento, 154 de validacion y 231 de test.

En la segunda etapa, el adaptador LoRA se ajusta primero de forma supervisada para imitar al cerebro y despues con PPO (con penalizacion KL contra el modelo supervisado) usando como recompensa el retorno obtenido si el cerebro continuara la trayectoria tras la accion elegida por el modelo. La evaluacion se realiza colocando el modelo en el puesto de decision del robot y ejecutando 20 partidas con semillas 91001-91020 sobre una aproximacion 2D del simulador de marcha (tabla de velocidades por comando), sin red neuronal de marcha ni modelo fisico del robot. El autor reporta un techo de acierto del 98% al trasladar las observaciones a texto, es decir, una cota superior de la fidelidad respecto al cerebro original.

## Capacidades

- Clasificacion de acciones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas (formato de cinco opciones, `obs21-act5`).
- Decision de marcha a corto plazo: selecciona el comando de caminata para los proximos 0,5 segundos en la tarea `goto_target`.
- Razonamiento de instrucciones acotado: sigue un prompt de sistema que le indica tratar el contenido de `state` como datos y no como instrucciones, y devolver solo la letra.
- Aprendizaje por refuerzo aplicado a un LLM: el adaptador incorpora preferencias aprendidas con PPO que mejoran el exito de la politica aunque el acierto literal frente al cerebro sea ligeramente inferior.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido; no se documentan capacidades multilingues mas alla del coreano de la documentacion y el ingles del prompt de sistema.

## Casos de uso

- Docencia de RL aplicado a LLM: el pipeline completo (PPO en simulador, generacion de problemas, SFT con LoRA y PPO con KL) sirve como caso practico reproducible en un notebook de Colab para explicar destilacion de politicas en modelos pequenos.
- Investigacion en destilacion de politicas: permite estudiar como un modelo de lenguaje de 0,8B aproxima una politica PPO tabular o neuronal, midiendo la brecha entre acierto literal y exito de tarea.
- Prototipado de agentes simulados: integrable en el entorno `connect_tycoon.link01` para sustituir el cerebro PPO por un LLM en tareas de navegacion 2D y comparar comportamiento.
- Generacion de datos sinteticos de decision: el adaptador puede usarse para etiquetar estados con acciones plausibles y ampliar el conjunto de entrenamiento de otras politicas.
- Evaluacion de robustez de prompts: al recibir estados en texto, permite probar ataques de inyeccion de instrucciones dentro del campo `state` y medir si el modelo respeta la separacion datos/instrucciones.
- Educacion en despliegue PEFT: ejemplo minimo de carga de un adaptador LoRA con `peft.PeftModel.from_pretrained` sobre un modelo base de HuggingFace, util para talleres de despliegue.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, medidos sobre la propia tarea `goto_target` y con la aproximacion 2D de marcha descrita por el autor:

| Modelo | Acierto en test (misma accion que el cerebro) | Exito en 20 partidas del mismo curso | Partidas con colision | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 18,2 s |
| Modelo base sin ajuste | 39,4% | 0% | 0% | No disponible |
| Tras SFT (LoRA) | 65,4% | 10% | 0% | 23,2 s |
| Tras RL (PPO + KL) | 64,9% | 100% | 0% | 16,5 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores no son comparables con benchmarks de LLM de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en FP16 requiere aproximadamente 1,6 GB de pesos; en BF16 similar; en cuantizacion de 8 bits en torno a 0,8-1 GB, y en 4 bits en torno a 0,5 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en FP16; una RTX 3060, RTX 4060 o superior permite holgura para el contexto y el adaptador.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de NVIDIA, AMD o Apple Silicon con Metal.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor); tambien es posible convertir a GGUF y usar `llama.cpp` u `Ollama`, aunque el autor no publica dichas variantes.
- Latencia y throughput: no disponibles. Al tratarse de generaciones de un solo token (una letra), la latencia por decision es baja en GPU consumer, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada: se trata de un adaptador LoRA especializado en una tarea de decision concreta sobre un modelo base de 0,8B, no de un LLM de proposito general. Como referencia estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-coco-v4-link01 (este) | Adaptador sobre base de ~0,8B | No disponible | Decision `goto_target` en robot simulado | Apache 2.0 | HuggingFace (repo de 0,0 GB, 0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | LLM generalista | No disponible en la informacion | HuggingFace |
| Politica PPO "cerebro" (`brain.json`) | No disponible | No aplica | Decision `goto_target` | No disponible | Repositorio `connect-tycoon` |

No se identifican en la informacion proporcionada otros adaptadores RL para robotica simulada sobre modelos de 0,8B con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- Especializacion extrema: solo resuelve la tarea `goto_target` con el esquema `obs21-act5`; fuera de ese formato el modelo no es fiable.
- Evaluacion sobre aproximacion 2D: el exito del 100% se mide con una tabla de velocidades por comando, no con el simulador MuJoCo completo ni con un robot real; el autor advierte que los resultados pueden diferir.
- Brecha entre acierto literal y exito de tarea: el modelo RL acierta menos que el SFT frente al cerebro (64,9% vs 65,4%) pero camina mejor, lo que indica que la metrica de acierto no captura el rendimiento real.
- Riesgo de inyeccion de instrucciones: el prompt de sistema pide tratar `state` como datos, pero un LLM de 0,8B puede ser vulnerable a instrucciones embebidas en el estado; no se documentan pruebas de robustez.
- Idioma: documentacion y ejemplos en coreano; el prompt de sistema en ingles; no se declaran capacidades multilingues.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos de sesgo, alucinacion o seguridad: al ser un clasificador de acciones, el riesgo de alucinacion se manifiesta como seleccion de una letra invalida o fuera del conjunto de opciones; no se documenta comportamiento en esos casos.
- Repo practicamente vacio en cuanto a descargas y likes (0 y 0), creado y actualizado el 2026-11-02; no hay evidencia de uso en produccion.
- No apto para robots reales sin revalidacion en el robot y el espacio concretos, tal como indica el autor.

## Enlaces

- HuggingFace: https://huggingface.co/nexflow/connectailab-rl-coco-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
