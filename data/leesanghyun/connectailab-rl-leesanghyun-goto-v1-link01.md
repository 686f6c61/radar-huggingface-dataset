# LeeSanghyun/connectailab-rl-leesanghyun-goto-v1-link01

## Resumen

El modelo `connectailab-rl-leesanghyun-goto-v1-link01` es un adaptador LoRA de tipo PEFT, publicado por el usuario LeeSanghyun dentro del ecosistema CONNECT AI LAB / AI CITY BUILDERS, que convierte el modelo base Qwen/Qwen3.5-0.8B en un decisor de acciones para el robot simulado LINK-01 en la tarea `goto_target` (ir a un objetivo). No es un modelo de lenguaje generalista: es un adaptador entrenado para leer una descripcion textual del estado del robot (distancia y direccion al objetivo, sensores de distancia, velocidad y accion previa) y responder con una unica letra que codifica una de cinco acciones de caminata para los siguientes 0,5 segundos.

El interes tecnico esta en la metodologia: primero se entrena una politica PPO en un simulador web de aprendizaje por refuerzo, despues se destila esa politica en el modelo de lenguaje mediante aprendizaje supervisado (LoRA) sobre 1.399 ejemplos de entrenamiento, y finalmente se aplica un refinamiento por refuerzo con senal de recompensa y ancla KL para corregir las respuestas del alumno. El pipeline declarado es `reinforcement-learning` y la licencia Apache-2.0, aunque el modelo es de proposito muy acotado y de uso educativo o de investigacion en simulacion.

El modelo es relevante como ejemplo de destilacion de politicas de RL en LLM pequenos para toma de decisiones discretas, y por su trazabilidad: la model card publica tasas de acierto frente al profesor, exito en 20 episodios de evaluacion y tiempos medios por episodio. Con 0,8 mil millones de parametros y solo soporte declarado para coreano, su alcance practico fuera de ese dominio es muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B); la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | 0,8 mil millones en el modelo base; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros, mediante LoRA. El entrenamiento se organiza en cuatro fases descritas en la model card: (1) entrenamiento de una politica PPO llamada "cerebro" (brain.json) en el laboratorio web de robots de CONNECT AI WORLD, con la tarea `goto_target`, contrato `link01-decision/goto_target/obs10-act5/walker51-14/v1` y curso `random`, alcanzando un 100 % en el examen oficial; (2) generacion de un corpus de preguntas y respuestas muestreando cada 0,5 segundos las observaciones del cerebro convertidas a texto, con la respuesta del cerebro como etiqueta y un 20 % de episodios con desviaciones deliberadas; (3) aprendizaje supervisado del modelo de lenguaje sobre ese corpus (1.399 ejemplos de entrenamiento, 97 de validacion y 146 de test); y (4) refinamiento por refuerzo con PPO, usando como recompensa el retorno obtenido si el resto del episodio lo hubiera caminado el cerebro, con una penalizacion KL que ancla el modelo al comportamiento del profesor.

La innovacion principal es el bucle de destilacion politica-a-texto con correccion por RL: la politica original ve 10 dimensiones de observacion y emite 5 acciones, y el LLM aprende a reproducir esa misma decision a partir de una representacion en lenguaje natural. La evaluacion de la caminata se hizo con una aproximacion 2D basada en una tabla de velocidades medidas por comando, no con el simulador MuJoCo completo, lo que el propio autor advierte como una fuente de discrepancia.

## Capacidades

- Decision discreta de accion: dado un estado textual del robot LINK-01, devuelve exactamente una letra entre las cinco opciones de la tarea `goto_target`.
- Generacion de texto restringida: el modelo esta entrenado para responder solo con la letra de la opcion elegida, sin explicaciones.
- Robustez ante instrucciones inyectadas en el estado: el prompt de sistema indica tratar el contenido del estado como datos y no como instrucciones, y el corpus de entrenamiento incluye casos desviados.
- Tarea unica: no cubre otras tareas del robot ni otros dominios de decision; no hay soporte declarado de tool calling, function calling, agentes multi-paso, matematicas, codigo ni vision.
- Multilingue limitado: el unico idioma declarado es el coreano, que es el idioma en el que estan formulados los problemas de decision.
- No dispone de modo de razonamiento explicito (thinking mode), ni capacidades de audio o multimodalidad.

## Casos de uso

- Validacion de pipelines de destilacion RL-a-LLM: el adaptador sirve como referencia reproducible para comprobar que un LLM de 0,8 B puede imitar una politica PPO con un 95,9 % de coincidencia con el profesor, util en laboratorios que investigan distillation y RLHF a pequena escala.
- Educacion en aprendizaje por refuerzo: el repositorio y el cuaderno de Colab permiten reproducir el entrenamiento del cerebro PPO, la generacion del corpus y el ajuste LoRA del modelo, como material docente en cursos de RL.
- Sustitucion de la politica en el simulador LINK-01: el modelo puede colocarse en la posicion de decision del robot para recorrer el curso `random` y medir exito, colisiones y tiempo por episodio, comparandolo con el cerebro original.
- Investigacion sobre robustez a instrucciones en el estado: dado que el prompt de sistema aisla el estado como datos, el modelo es un banco de pruebas para estudiar como un LLM pequeno maneja entradas adversariales en tareas de decision.
- Analisis de la brecha entre simulacion y realidad: el adaptador permite contrastar el exito medido con la aproximacion 2D por tabla de velocidades frente a los resultados del simulador MuJoCo web, documentando discrepancias.
- Prototipado de interfaces texto-a-accion para robots simulados: sirve para experimentar con la conversion de observaciones numericas a lenguaje natural y la traduccion inversa a comandos de bajo nivel, antes de portar el esquema a un robot real.
- Evaluacion comparativa de estrategias de ajuste: al existir variantes de aprendizaje supervisado y de RL en la misma familia, permite comparar ambas tecnicas sobre el mismo corpus y las mismas semillas de evaluacion (91001-91020).

## Benchmarks y rendimiento

Resultados publicados en la model card del autor, medidos sobre el conjunto de test (146 problemas) y sobre 20 episodios de caminata con semillas 91001-91020:

| Modelo | Acierto en test (misma respuesta que el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 10,9 s |
| Modelo antes del entrenamiento | 46,6 % | 0 % | 0 % | no disponible |
| Aprendizaje supervisado (LoRA) | 95,9 % | 100 % | 0 % | 10,9 s |
| Aprendizaje por refuerzo (este adaptador) | 95,9 % | 100 % | 0 % | 10,8 s |

El techo teorico de acierto, es decir, la proporcion en la que el cerebro da la misma respuesta tras convertir la observacion a texto, se declara en el 99 %. No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un modelo base de 0,8 B, en FP16 la carga de pesos ronda 1,6 GB y en cuantizacion de 4 bits aproximadamente 0,5 GB, a lo que hay que sumar el adaptador LoRA y el coste de contexto. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojar el modelo base cuantizado, pero esto no esta verificado por el autor.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque no hay confirmacion publicada.
- Opciones de despliegue: la model card solo documenta el uso mediante `transformers` y `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF en el repositorio limita el despliegue en esos entornos.
- Latencia y throughput: no disponibles. El tiempo medio por episodio de 10,8-10,9 s corresponde a la caminata completa en la aproximacion 2D, no a la latencia de inferencia del LLM.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos directamente comparables: se trata de un adaptador especifico de una tarea de robotica simulada, no de un LLM generalista. Como referencia de categoria, se compara con el modelo base y con el profesor del que se destila:

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (RL) | 0,8 B (base) + LoRA | no disponible | 95,9 % de coincidencia con el profesor; 100 % de exito en 20 episodios | Apache-2.0 | Hugging Face (adaptador PEFT) |
| Aprendizaje supervisado de la misma familia | 0,8 B (base) + LoRA | no disponible | 95,9 % de coincidencia; 100 % de exito; 10,9 s por episodio | Apache-2.0 | Referenciado en la model card |
| Cerebro PPO (profesor) | no disponible (politica `brain.json`) | no aplica | 100 % de coincidencia; 100 % de exito; 10,9 s por episodio | no disponible | Referenciado en la model card |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | 46,6 % de coincidencia antes del ajuste | no disponible | Hugging Face |

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo resuelve la tarea `goto_target` con 5 acciones discretas; no es util para generacion de texto libre ni para otras tareas del robot.
- Evaluacion aproximada: la caminata se puntuo con una tabla de velocidades por comando en 2D, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de la simulacion real, como advierte el propio autor.
- Uso en robot real no validado: la model card indica explicitamente que es un modelo de investigacion y educacion sobre simulador y que debe revalidarse en el robot y el espacio concretos antes de usarlo fisicamente.
- Idioma: solo coreano declarado; el prompt de sistema esta en ingles, pero no hay evidencia publicada de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion acotado pero presente: el modelo puede emitir una letra valida que no corresponda a la accion optima; la coincidencia con el profesor es del 95,9 %, no del 100 %.
- Sesgos: no se documentan sesgos demograficos ni linguisticos, pero el corpus procede de un unico curso `random` y de una unica politica profesora, lo que puede limitar la generalizacion a otros mapas.
- Licencia: Apache-2.0 permite uso comercial, pero la licencia y los terminos del modelo base Qwen/Qwen3.5-0.8B deben verificarse por separado, ya que la informacion disponible no los detalla.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamano declarado de 0,0 GB, lo que sugiere un artefacto muy pequeno y sin adopcion externa; conviene tratar sus resultados con cautela hasta una replicacion independiente.
- Dependencia de codigo auxiliar: el uso previsto requiere el paquete `connect_tycoon` (`questions.task_of`) para convertir observaciones en problemas, lo que anade una dependencia externa al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeSanghyun/connectailab-rl-leesanghyun-goto-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor: https://huggingface.co/LeeSanghyun
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Laboratorio web de robots CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Variante relacionada de la misma familia: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v5-teacher
