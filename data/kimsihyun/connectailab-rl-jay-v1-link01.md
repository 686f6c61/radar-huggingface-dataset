# Kimsihyun/connectailab-rl-jay-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT publicado por el usuario Kimsihyun bajo el paraguas del proyecto CONNECT AI LAB / AI CITY BUILDERS. Se construye sobre el modelo base Qwen/Qwen3.5-0.8B y su proposito no es la generacion de texto general, sino la toma de decisiones discretas para un robot simulado llamado LINK-01 dentro de la tarea `avoid_obstacles` (evitar obstaculos). El modelo recibe una descripcion textual del estado del robot —distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y eleccion previa— y devuelve exactamente una letra correspondiente a la siguiente accion de caminata para los proximos 0,5 segundos.

El entrenamiento sigue una cadena poco habitual: primero se entrena una politica PPO en un simulador web (el "cerebro", almacenado como `brain.json`), despues se generan pares observacion-respuesta volcando las decisiones de esa politica a texto, y finalmente se ajusta el modelo de lenguaje con LoRA mediante aprendizaje supervisado y una etapa posterior de aprendizaje por refuerzo con penalizacion KL. El resultado es un modelo pequeno (0,8B parametros base, adaptador LoRA de bajo rango) que aproxima el comportamiento de la politica PPO original mediante lenguaje natural.

Su relevancia es fundamentalmente metodologica y educativa: demuestra como destilar una politica de RL en un modelo de lenguaje pequeno y como evaluar esa destilacion con metricas de coincidencia de accion y de exito en simulacion. No es un modelo de proposito general ni compite con LLM conversacionales; es una pieza de investigacion reproducible dentro de un curso de aprendizaje por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; parametros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizacion no documentada) |
| Idiomas soportados | Coreano (`ko`) declarado; el prompt de sistema y las opciones estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 0,8B parametros (Qwen3.5-0.8B), sobre el que se aplica un adaptador LoRA de bajo rango. El pipeline declarado es `reinforcement-learning`, con tags que incluyen `ppo`, `deep-reinforcement-learning`, `robotics` y `decision-making`. La tarea concreta es `avoid_obstacles`, con el identificador de contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y el curso de entrenamiento `1441aaac`.

El proceso de entrenamiento consta de cinco etapas documentadas por el autor: (1) entrenamiento de una politica PPO en el simulador web de CONNECT AI WORLD, con una tasa de exito del 65% en el examen oficial; (2) generacion de un corpus de problemas volcando cada 0,5 segundos la observacion del robot a texto, con la accion de la politica como etiqueta, e incluyendo un 20% de ejemplos con acciones suboptimas para cubrir desviaciones; (3) aprendizaje supervisado del modelo de lenguaje sobre ese corpus con LoRA; (4) una etapa de aprendizaje por refuerzo que recompensa las opciones con mejor retorno estimado (usando la politica como referencia) y penaliza las peores, con anclaje KL; y (5) evaluacion colocando el modelo en el puesto de decision del robot durante 20 episodios con semillas 91001-91020. El corpus se divide en 994 ejemplos de entrenamiento, 184 de validacion y 272 de test.

La innovacion tecnica destacable es el uso de una tabla de velocidades de caminata 2D aproximada (derivada de MuJoCo web) para puntuar los episodios sin necesidad de ejecutar el modelo de robot ni la red de caminata completa, lo que elimina caidas en la evaluacion pero introduce divergencias respecto a MuJoCo real.

## Capacidades

- Clasificacion de acciones discretas: dado un estado textual del robot, devuelve una unica letra entre las opciones listadas, sin explicacion.
- Toma de decisiones secuenciales en un entorno simulado de evitacion de obstaculos.
- Seguimiento de instrucciones estrictas de formato (salida de un solo caracter), reforzado por el prompt de sistema.
- Tratamiento del contenido del estado como datos, no como instrucciones (defensa basica frente a inyeccion de prompt en el campo `state`).
- Capacidad multilingue limitada: declarado coreano, con prompts de sistema y opciones en ingles.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Destilacion de politicas RL en LLM: usar este modelo como referencia para replicar el pipeline PPO -> corpus textual -> LoRA -> RL en otras tareas de control discreto.
- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo reproducible en cursos, con notebook de Colab y codigo de entrenamiento publicados.
- Evaluacion de robustez de decisiones: comparar la tasa de coincidencia con la politica original en los conjuntos de validacion y test para medir la fidelidad de la destilacion.
- Investigacion en simulacion de robotica: integrar el modelo en el bucle de decision del simulador LINK-01 para estudiar el efecto de sustituciones parciales de la politica.
- Generacion de datos sinteticos de decision: usar el modelo para producir trazas etiquetadas de observacion-accion en variantes de la tarea `avoid_obstacles`.
- Pruebas de formato estricto: validar pipelines que exigen salidas de un solo caracter y manejo de opciones cerradas, con el prompt de sistema documentado.
- Analisis de seguridad de prompts: estudiar como responde el modelo ante intentos de inyeccion en el campo de estado, dado el tratamiento explicito de ese campo como datos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el conjunto de test (272 problemas) y 20 episodios de simulacion (semillas 91001-91020):

| Modelo | Acierto en test (misma accion que la politica) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Politica PPO (profesor) | 100,0% | 100% | 0% | 19,6 s |
| Modelo sin entrenar | 39,7% | 0% | 30% | — |
| Aprendizaje supervisado (LoRA) | 86,4% | 100% | 0% | 19,5 s |
| Aprendizaje por refuerzo (este modelo) | 82,4% | 100% | 5% | 19,8 s |

El autor indica que la evaluacion de caminata usa una aproximacion 2D basada en una tabla de velocidades por comando derivada de MuJoCo web, por lo que los resultados pueden diferir de MuJoCo real. No se han publicado resultados en benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo base de 0,8B con adaptador LoRA, la inferencia en fp16 requiere aproximadamente 1,6-2 GB de VRAM; en cuantizacion de 8 bits, en torno a 1 GB; en 4 bits, por debajo de 1 GB. Estas cifras son estimaciones a partir del tamano del modelo base y no estan publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador y requeririan conversion previa a un formato compatible.
- Latencia y throughput: no disponibles. El modelo se invoca cada 0,5 segundos en el bucle de simulacion, lo que impone un limite superior de latencia practico de 500 ms por decision.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. La comparacion mas relevante es interna al propio pipeline:

| Modelo | Parametros | Contexto | Acierto en test | Exito en simulacion | Licencia |
|---|---|---|---|---|---|
| LINK-01 RL (este modelo) | 0,8B + LoRA | No disponible | 82,4% | 100% (20 episodios) | Apache 2.0 |
| LINK-01 supervisado (LoRA) | 0,8B + LoRA | No disponible | 86,4% | 100% (20 episodios) | Apache 2.0 |
| Politica PPO (profesor) | No disponible | No aplica | 100,0% | 100% (20 episodios) | No disponible |

## Limitaciones y advertencias

- El propio autor advierte que es un modelo de investigacion y educacion sobre simulador; no debe usarse en un robot real sin revalidacion en ese robot y ese espacio concreto.
- La evaluacion de caminata usa una aproximacion 2D con tabla de velocidades, no MuJoCo real; los resultados pueden no transferirse.
- La etapa de RL obtiene peor acierto en test (82,4%) que la de aprendizaje supervisado (86,4%) y registra un 5% de episodios con colision frente al 0% del supervisado; el autor elige el modelo supervisado como version desplegada.
- El modelo esta especializado en una unica tarea (`avoid_obstacles`) y un unico contrato de observacion; no generaliza a otras tareas de control sin reentrenamiento.
- Idioma declarado coreano, pero el prompt de sistema y las opciones estan en ingles; el soporte multilingue real no esta documentado.
- Riesgo de alucinacion de opcion: el modelo puede devolver una letra no listada o texto adicional si el prompt no se aplica estrictamente.
- No se documentan sesgos especificos, pero al derivar de una politica PPO entrenada en un unico curso (`1441aaac`) hereda sus sesgos de comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene sus propios terminos que deben respetarse.
- El repositorio ocupa 0,0 GB y tiene 16 descargas y 0 likes; la trazabilidad y el mantenimiento no estan garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kimsihyun/connectailab-rl-jay-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
