# attitudemetal/connectailab-rl-aion-v1-link01

## Resumen

connectailab-rl-aion-v1-link01 es un adaptador LoRA (PEFT) publicado por el usuario attitudemetal dentro del proyecto CONNECT AI LAB / AI CITY BUILDERS. Se construye sobre el modelo base Qwen/Qwen3.5-0.8B y su proposito es actuar como "cerebro de decision" para el robot bipedo simulado LINK-01 en la tarea de esquivar obstaculos (`avoid_obstacles`). El modelo recibe en texto el estado del robot (distancia al objetivo, direccion, sensores de distancia, velocidad y eleccion previa) y devuelve una unica letra correspondiente a la accion de caminar durante los siguientes 0,5 segundos.

Tecnicamente no es un modelo de lenguaje generalista ni un modelo de robotica de proposito general: es un adaptador de bajo rango entrenado en dos fases, primero con aprendizaje supervisado (destilando las decisiones de una politica PPO llamada "brain.json") y despues con refuerzo por PPO con anclaje KL, sobre un conjunto de 1.282 ejemplos de entrenamiento, 251 de validacion y 374 de prueba. El interes practico esta en mostrar como se puede destilar una politica de refuerzo en un modelo de lenguaje pequeno y ejecutable en local para tomar decisiones discretas en un bucle de simulacion.

El modelo esta etiquetado con `pipeline_tag: reinforcement-learning`, idioma coreano (`ko`) y licencia Apache 2.0. El repositorio es practicamente vacio en peso (0,0 GB), lo que confirma que se distribuye solo el adaptador y requiere descargar por separado el modelo base Qwen3.5-0.8B. Es un artefacto de investigacion y educacion, no un componente listo para produccion robotica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (depende del base Qwen3.5-0.8B; el adaptador LoRA no declara su cardinalidad) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-0.8B; no declarada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | Coreano (`ko`) declarado; instrucciones de sistema en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parametros. La model card no detalla la arquitectura interna del base (atencion, capas, contexto) ni el rango, alpha o modulos objetivo del LoRA. El entrenamiento se describe en cuatro etapas: (1) entrenamiento de una politica PPO en el simulador web (tarea `avoid_obstacles`, contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `18b2956e`, 75% en el examen oficial); (2) generacion de un "cuaderno de problemas" convirtiendo cada 0,5 s las observaciones del robot en texto, con la accion del cerebro PPO como etiqueta y un 20% de ejemplos con desviaciones; (3) aprendizaje supervisado del LM sobre esas etiquetas con LoRA; y (4) refuerzo con PPO usando la recompensa de "que habria pasado si el cerebro PPO hubiera seguido caminando tras esa accion", con anclaje KL al modelo supervisado.

El conjunto de datos resultante tiene 1.282 ejemplos de entrenamiento, 251 de validacion y 374 de prueba. La propia model card reporta un techo de acierto del 99% al trasladar las observaciones a texto (es decir, incluso un oraculo perfecto no igualaria al 100% al cerebro PPO). La evaluacion final se hace colocando el modelo de decision en el puesto de mando del robot y caminando el mismo circuito 20 veces con semillas 91001-91020. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni modos de pensamiento.

## Capacidades

- Clasificacion de acciones discretas en un espacio de cinco opciones (`obs21-act5`) a partir de una descripcion textual del estado del robot.
- Salida restringida a una unica letra, sin explicacion, segun el system prompt recomendado.
- Razonamiento de corto plazo sobre el estado inmediato (distancia, direccion, sensores, velocidad y accion previa), no sobre planes largos.
- Destilacion de politica de refuerzo: reproduce en gran medida las decisiones de un cerebro PPO entrenado en simulador.
- Soporte de instrucciones de sistema en ingles y datos de estado en coreano.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento extendido.
- Capacidad multilingue limitada al coreano declarado; no hay evaluacion en otros idiomas.

## Casos de uso

- Investigacion en destilacion de politicas RL a modelos de lenguaje: el adaptador sirve como caso de estudio reproducible de como se pasa de una politica PPO a un LM pequeno con LoRA y refuerzo posterior, usando los cuadernos y el codigo publicados.
- Educacion en refuerzo y robotica simulada: el notebook de Colab y el repositorio CONNECT TYCOON permiten a estudiantes entrenar su propio cerebro y compararlo con este adaptador en el mismo circuito.
- Bucle de decision en simulador 2D: se puede integrar en un entorno de caminata aproximada por tablas de velocidad para probar politicas de evitacion de obstaculos con decisiones cada 0,5 s.
- Generacion de datos sinteticos de decision: el modelo puede etiquetar estados textuales de robot para preentrenar o aumentar datasets de navegacion en simulacion.
- Evaluacion comparativa de tecnicas de alineacion: sirve para medir el efecto de SFT frente a SFT+PPO con KL en una tarea de clasificacion cerrada (la model card reporta 82,6% frente a 83,4% de acierto).
- Prototipado de interfaces texto-accion para robots de bajo coste: util para validar el formato de observacion textual y el contrato de decision antes de portar la logica a un controlador real.
- Docencia sobre limitaciones de los LM en robotica: util para mostrar que un modelo entrenado en simulador no debe desplegarse en un robot fisico sin revalidacion en el entorno real.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de la propia tarea, no benchmarks estandar (MMLU, HumanEval, GSM8K no aparecen):

| Modelo | Acierto en test (misma accion que el cerebro) | Exito en 20 episodios del mismo circuito | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0% | 100% | 5% | No disponible |
| SFT (LoRA supervisado) | 82,6% | 100% | 0% | No disponible |
| RL (este adaptador) | 83,4% | 100% | 0% | No disponible |

Nota: la evaluacion de caminata usa una aproximacion 2D basada en tablas de velocidad por comando, no el simulador MuJoCo web, por lo que los resultados pueden diferir de los del simulador original.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al montar sobre Qwen3.5-0.8B, la inferencia en fp16 requiere del orden de 2 GB solo para pesos del base, mas overhead de activaciones y del adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM deberia poder ejecutar el base en fp16 o cuantizado; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060/4060 y superiores, aunque el autor no lo confirma.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integracion con llama.cpp requeriria fusionar el adaptador y convertir a GGUF, paso no documentado.
- Latencia y throughput: no disponibles. La tarea exige una decision cada 0,5 s, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para decision robotica destilada de PPO sobre un LM pequeno). Se indica "no disponible". Como referencia estructural, el unico punto de comparacion documentado es el propio cerebro PPO profesor y la variante SFT del mismo adaptador, ya recogidos en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-aion-v1-link01 | Base ~0,8B + LoRA | No disponible | 83,4% acierto / 100% exito en 20 episodios | Apache 2.0 | Hugging Face |
| Cerebro PPO (profesor) | No disponible (politica RL) | No aplica | 100,0% acierto / 100% exito | No disponible | Referenciado en la model card |
| SFT (mismo base + LoRA) | Base ~0,8B + LoRA | No disponible | 82,6% acierto / 100% exito | Apache 2.0 | No publicado como repo separado |

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion y evaluado con una aproximacion 2D por tablas de velocidad; el propio autor advierte que los resultados pueden diferir del simulador MuJoCo web y que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Techo de acierto del 99% al trasladar observaciones a texto: el modelo nunca puede igualar al cerebro PPO profesor, y el 83,4% reportado esta lejos de ese techo.
- Solo declara coreano como idioma; el system prompt recomendado esta en ingles, pero no hay evaluacion de robustez en otros idiomas ni de cambios de formato.
- Salida restringida a una letra entre cinco opciones; cualquier uso fuera de ese contrato (texto libre, explicaciones, otras tareas) no esta soportado ni evaluado.
- Riesgo de alucinacion fuera del dominio: si el estado textual se sale de la distribucion de entrenamiento (1.282 ejemplos de un unico circuito `18b2956e`), la accion elegida puede ser arbitraria.
- El repositorio pesa 0,0 GB: es solo el adaptador; requiere descargar el base Qwen3.5-0.8B, con su propia licencia y condiciones.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base puede tener condiciones adicionales que deben revisarse por separado.
- Etiquetado como `reinforcement-learning` y no como modelo de chat: no debe tratarse como un asistente conversacional.
- Solo 15 descargas y 0 likes en el momento de la consulta: ecosistema minimo, sin validacion independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/attitudemetal/connectailab-rl-aion-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Laboratorio web de robot (entorno de entrenamiento): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
