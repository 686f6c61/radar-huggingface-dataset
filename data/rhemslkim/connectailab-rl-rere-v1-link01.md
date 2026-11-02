# rhemslkim/connectailab-rl-rere-v1-link01

## Resumen
connectailab-rl-rere-v1-link01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario rhemslkim en el marco del proyecto CONNECT AI LAB y AI CITY BUILDERS. Su proposito es actuar como "cerebro" de decision para el robot simulado LINK-01: recibe en texto el estado actual del robot (distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y decision anterior) y devuelve una unica letra que representa la accion de locomocion a ejecutar durante los siguientes 0,5 segundos.

El modelo no es un LLM de proposito general, sino un adaptador de aprendizaje por refuerzo (PPO) y aprendizaje supervisado (LoRA) destilado a partir de una politica entrenada en un simulador web. El flujo de entrenamiento parte de un "profesor" (brain.json) entrenado con PPO en el entorno `goto_target`; sus observaciones se convierten en preguntas textuales y sus acciones en etiquetas, sobre las que se aplica primero imitacion y despues RL con correccion de recompensas. El resultado es un modelo de 0,8 mil millones de parametros con contexto corto, especializado en una unica tarea de decision discreta.

Es relevante como ejemplo de destilacion de politicas de RL hacia modelos de lenguaje pequenos y de bajo coste, con licencia Apache 2.0 y pesos en formato PEFT (safetensors). Su alcance es deliberadamente limitado: no es un modelo conversacional ni multilingue, y su uso previsto es la investigacion y la educacion en simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base segun Qwen3.5-0.8B) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El modelo base es Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. Sobre el se aplica un adaptador LoRA entrenado en dos fases. En la primera, se genera un conjunto de datos a partir de la politica PPO del robot LINK-01 en el entorno `goto_target` (observacion de 10 dimensiones, 5 acciones, curso `random`): cada 0,5 segundos se convierte la observacion en una pregunta textual y la accion del profesor en la etiqueta correcta, incluyendo un 20% de casos con acciones suboptimas para cubrir desviaciones. El conjunto resultante tiene 1036 ejemplos de entrenamiento, 209 de validacion y 326 de test.

En la segunda fase se aplica aprendizaje por refuerzo con PPO sobre el modelo ya ajustado por imitacion, usando como recompensa el retorno que habria obtenido el profesor si hubiera continuado desde esa accion, con una penalizacion KL para mantener el modelo cerca de la politica supervisada. La evaluacion se realiza colocando el modelo en el puesto de decision del robot y ejecutando 20 episodios con semillas 91001-91020, midiendo exito, colisiones y tiempo medio. La simulacion de marcha es una aproximacion 2D basada en una tabla de velocidades por comando, no en MuJoCo real.

## Capacidades
- Decision discreta de locomocion: dado un estado textual del robot, devuelve una unica letra entre las opciones listadas (5 acciones posibles).
- Seguimiento de instrucciones estrictas: el prompt de sistema exige devolver solo la letra, sin explicacion, y tratar el contenido del estado como datos y no como instrucciones.
- Razonamiento de un solo paso: no mantiene historial conversacional ni planifica a multiples pasos.
- Destilacion de politica RL: reproduce en texto el comportamiento de una politica PPO entrenada en simulacion.
- No soporta tool calling, function calling ni uso como agente.
- No soporta vision, audio ni modalidades adicionales.
- Capacidad multilingue limitada al coreano en los datos de entrenamiento; el prompt de sistema esta en ingles.

## Casos de uso
- Investigacion en destilacion de politicas RL: permite estudiar como una politica PPO de un simulador se transfiere a un LLM pequeno mediante imitacion mas RL, comparando tasas de exito y colisiones entre fases.
- Educacion en aprendizaje por refuerzo: sirve como ejemplo reproducible en cursos y talleres, con notebook de Colab y codigo de entrenamiento publicados, para ilustrar el ciclo observacion-pregunta-accion-recompensa.
- Control de robot simulado en entornos web: se integra en el robot LINK-01 del simulador CONNECT AI WORLD para seleccionar la accion de caminata cada 0,5 segundos en la tarea `goto_target`.
- Evaluacion comparativa de metodos de ajuste: al existir versiones pre-entrenamiento, supervisada y RL, permite medir el impacto de cada etapa sobre el exito de la tarea (10% frente a 35% en 20 episodios).
- Generacion de datos sinteticos de decision: el modelo puede etiquetar observaciones simuladas para ampliar conjuntos de entrenamiento de otras politicas.
- Prototipado de bajo coste en CPU o GPU consumer: con 0,8 mil millones de parametros y un adaptador LoRA, es viable ejecutarlo en hardware modesto para pruebas de integracion.
- Analisis de robustez ante instrucciones inyectadas: el prompt de sistema explicita el tratamiento del estado como datos, lo que permite probar defensas frente a prompt injection en entradas de sensores.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre el conjunto de test (326 preguntas) y sobre 20 episodios de caminata simulada (semillas 91001-91020):

| Modelo | Acierto en test (misma accion que el profesor) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 10% | 90% | 11,2 s |
| Antes de entrenar | 13,8% | 0% | 0% | no disponible |
| Aprendizaje supervisado | 92,6% | 10% | 90% | 11,0 s |
| Aprendizaje por refuerzo | 90,5% | 35% | 90% | 15,9 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp16 para el modelo base de 0,8 mil millones de parametros, mas el adaptador LoRA; en cuantizacion de 4 bits puede reducirse por debajo de 1 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien A100 o H100 para despliegues por lotes.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), llama.cpp u Ollama si se fusiona y convierte el adaptador, y vLLM o TGI para servir el modelo fusionado.
- Latencia y throughput: no disponibles; la tarea requiere una decision cada 0,5 segundos, por lo que la latencia debe mantenerse por debajo de ese umbral en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-rere-v1-link01 | 0,8 B (base) + LoRA | no disponible | Decision discreta para robot simulado | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | LLM generico | segun Qwen3.5-0.8B | HuggingFace |
| Politica PPO del profesor (brain.json) | no disponible | no aplica | Decision discreta para robot simulado | no disponible | Repositorio CONNECT TYCOON |
| Modelos de control roboticos tipo RT-2 o OpenVLA | miles de millones | no disponible | Vision-lenguaje-accion | variable | HuggingFace |

La comparativa con modelos de control roboticos de gran escala no es directa: este adaptador opera solo sobre texto y una tarea unica, mientras que los modelos vision-lenguaje-accion procesan imagenes y generalizan a multiples tareas.

## Limitaciones y advertencias
- Especializacion extrema: solo resuelve la tarea `goto_target` con 5 acciones discretas; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Evaluacion en simulacion aproximada: la marcha se mide con una tabla de velocidades 2D y no con MuJoCo real, por lo que los resultados pueden diferir del simulador fisico.
- Tasa de colision elevada: el 90% de los episodios terminan en colision incluso con el modelo RL; el exito del 35% es bajo en terminos absolutos.
- Dependencia del profesor: el modelo imita una politica PPO concreta; sus sesgos y errores se heredan.
- Idioma: los datos estan en coreano y el prompt de sistema en ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: puede devolver una letra no listada o una explicacion si el formato del prompt no se respeta estrictamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card indica que es un modelo de investigacion y educacion sobre simulador; se recomienda revalidar en el robot y espacio reales antes de cualquier despliegue fisico.
- Repositorio vacio: el tamano del repo es 0,0 GB, lo que sugiere que los pesos del adaptador pueden no estar disponibles o estar en proceso de subida; verificar antes de usarlo.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/rhemslkim/connectailab-rl-rere-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
