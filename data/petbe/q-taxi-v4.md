# PetBe/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo basado en Q-Learning tabular, entrenado para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario PetBe en Hugging Face y no constituye un modelo de lenguaje ni una red neuronal profunda: es una tabla Q serializada (fichero `q-learning.pkl`) que mapea estados discretos a valores de accion para el clasico problema del taxi. Su relevancia es pedagogica y de referencia: sirve como ejemplo minimo y reproducible de un agente RL entrenado con una implementacion personalizada, util para validar pipelines de `stable-baselines3` o `RL Zoo` y para comparar curvas de aprendizaje en un entorno de juguete.

El entorno Taxi-v3 dispone de 500 estados discretos y 6 acciones, con recompensas medias tipicas en torno a 7-8 puntos para agentes bien entrenados. El autor declara una recompensa media de 7,56 +/- 2,71, un valor dentro de lo esperado para Q-Learning tabular convergido, aunque la desviacion estandar es alta y el resultado no esta verificado.

No hay informacion sobre licencia, idiomas, arquitectura neuronal ni contexto: al tratarse de una tabla Q, estos campos no aplican en el sentido habitual de un modelo generativo. La ficha se limita a documentar lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno con 500 estados discretos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El agente emplea Q-Learning clasico, un algoritmo de diferencias temporales off-policy que actualiza una tabla Q indexada por el par (estado, accion). El entorno Taxi-v3 de Gymnasium es un MDP discreto con 500 estados y 6 acciones (moverse al norte, sur, este, oeste, recoger pasajero y dejar pasajero), con recompensas de -1 por paso, +20 por entrega correcta y -10 por recogida o entrega ilegal. La implementacion se etiqueta como `custom-implementation`, lo que sugiere que el autor no uso directamente `stable-baselines3` sino una implementacion propia.

No se especifican hiperparametros (tasa de aprendizaje, factor de descuento, politica epsilon-greedy, numero de episodios) ni detalles del proceso de entrenamiento en la informacion disponible. Tampoco se documenta si hubo evaluacion con semillas fijas o validacion cruzada sobre episodios.

## Capacidades

- Resolucion del entorno Taxi-v3: seleccionar la accion optima en cada uno de los 500 estados discretos.
- Politica greedy derivada de la tabla Q aprendida.
- Carga mediante `load_from_hub` y ejecucion con `gym.make(model["env_id"])`.
- No soporta generacion de texto, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episodico del entorno.
- Sin capacidades multilingues.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de Q-Learning tabular en un curso introductorio, cargandolo con `load_from_hub` y comparando su politica con la optima teorica.
- Validacion de pipelines RL: integrar el `.pkl` en un script de evaluacion para comprobar que el entorno Taxi-v3 se instancia correctamente y que las recompensas medias coinciden con las declaradas.
- Baseline de referencia: emplear la recompensa media de 7,56 como punto de comparacion al entrenar variantes (DQN, SARSA, Q-Learning con distintas tasas de exploracion) sobre el mismo entorno.
- Reproduccion de experimentos: servir como artefacto reproducible para estudiar la varianza entre semillas, dada la desviacion estandar de 2,71 declarada.
- Demostracion de despliegue en Hugging Face Hub: mostrar el flujo completo de publicacion de un agente RL con model-index y metadatos.
- Pruebas de integracion de `gymnasium` y `pickle`: verificar la compatibilidad de versiones del entorno y del formato de serializacion en un entorno controlado.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 +/- 2,71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con agentes de referencia como los del RL Zoo de `stable-baselines3`.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q serializada en un fichero Pickle de tamano despreciable (repo de 0,0 GB).
- GPU: no requiere GPU; se ejecuta en CPU.
- Cabe en cualquier equipo, incluidos entornos sin aceleracion hardware.
- Despliegue: script Python con `gymnasium` y carga del `.pkl`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del bucle de evaluacion del entorno, no del modelo.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada agentes comparables publicados con resultados declarados sobre Taxi-v3.

## Limitaciones y advertencias

- El resultado de recompensa media (7,56 +/- 2,71) no esta verificado (`verified: false`) y presenta una desviacion estandar alta, lo que sugiere variabilidad entre episodios o semillas.
- La licencia no esta declarada, por lo que el uso comercial queda en un limbo legal hasta que el autor la especifique.
- El agente solo es valido para Taxi-v3; no generaliza a otros entornos ni a variantes con distinta dinamica.
- El formato Pickle puede suponer riesgos de seguridad al deserializar ficheros de origen no confiable.
- No hay documentacion de hiperparametros ni de semillas, lo que dificulta la reproducibilidad exacta.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No apto para tareas de generacion, razonamiento o procesamiento de lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/PetBe/q-Taxi-v4
