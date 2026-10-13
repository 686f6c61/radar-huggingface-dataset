# lucyhome/connectailab-rl-lucy-v1

## Resumen

`lucyhome/connectailab-rl-lucy-v1` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.5-0.8B` (aproximadamente 0,8 mil millones de parametros) entrenado para una unica tarea de toma de decisiones: recibir un estado, una pregunta y una lista de opciones etiquetadas, y devolver exactamente la letra de una de ellas. No es un modelo conversacional ni de proposito general; es un clasificador generativo de accion discreta orientado a entornos de simulacion tipo Gymnasium. Lo desarrolla el autor `lucyhome` en el marco del proyecto Connect Tycoon, presentado como colaboracion entre CONNECT AI LAB y AI CITY BUILDERS.

El modelo se construye con un pipeline de cuatro fases: primero se entrena una politica pequena en el simulador Connect Tycoon mediante PPO (que actua como profesor); despues se genera un conjunto de problemas reevaluando cada decision con cada opcion alternativa para puntuar las alternativas contrafactuales; a continuacion se aplica aprendizaje supervisado sobre la opcion de mayor puntuacion; y finalmente se aplica aprendizaje por refuerzo tipo GRPO con ventaja normalizada por grupo y una penalizacion KL contra el modelo de partida. El conjunto de datos resultante tiene 4.081 ejemplos de entrenamiento, 832 de validacion y 840 de test, sobre una distribucion de empresas etiquetada como `general`.

La relevancia actual es doble. Por un lado, es un ejemplo reproducible y de licencia Apache 2.0 de post-entrenamiento con LoRA + GRPO sobre un modelo pequeno, un flujo que interesa a quien investiga RLHF/RLAIF a bajo coste. Por otro, muestra un uso deliberadamente restringido del lenguaje: la salida se limita a un caracter, lo que reduce el coste de inferencia y evita la generacion libre. El autor advierte que los resultados son de un primer experimento, con muestras pequenas, y que el modelo queda por debajo de la politica profesora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador LoRA entrenado con PEFT |
| Parametros totales | Aproximadamente 0,8 mil millones en el modelo base; el adaptador LoRA anade un numero de parametros no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser un adaptador en safetensors, la cuantizacion depende del proceso aplicado por el usuario tras fusionar |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo reutiliza una arquitectura transformer decoder-only de 0,8 mil millones de parametros a la que se le anade un adaptador LoRA de bajo rango, cargado mediante `peft`. La salida no se genera como texto libre: el entrenamiento fuerza a que la respuesta sea una unica letra de opcion, de modo que la distribucion de probabilidad sobre el vocabulario restringido a esas letras actua como distribucion de politica sobre acciones, y el valor maximo funciona como medida de confianza. Esto convierte al modelo en una politica de decision mas que en un generador.

El proceso de entrenamiento tiene cuatro etapas descritas por el autor. En la primera, una politica pequena aprende a operar la empresa simulada durante miles de meses mediante PPO; esa politica se usa como profesora. En la segunda, por cada mes simulado se generan variantes cambiando la opcion elegida y se ejecuta el mes completo para puntuar cada alternativa, lo que produce un conjunto de decisiones con recompensa. En la tercera se aplica aprendizaje supervisado imitando la opcion de mejor puntuacion. En la cuarta se aplica aprendizaje por refuerzo tratando todas las opciones de una decision como un grupo, normalizando la ventaja dentro del grupo y anadiendo una divergencia KL contra el modelo de partida para evitar el colapso. Los datos proceden integramente de un simulador empresarial sintetico, no de trazas humanas. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Toma de decision de accion discreta: lee un estado, una pregunta y un conjunto de opciones etiquetadas y devuelve una unica letra.
- Calibracion de confianza implicita: la probabilidad asignada a cada letra de opcion puede interpretarse como probabilidad de eleccion, y la letra con mayor valor como decision mas segura.
- Seguimiento de instrucciones de formato estricto mediante un mensaje de sistema que exige responder solo con la letra y sin explicacion.
- Tratamiento del texto de estado como datos y no como instrucciones, segun el mensaje de sistema prescrito, lo que mitiga inyecciones de prompt dentro del estado.
- Capacidad de operar sobre un entorno de simulacion empresarial (Connect Tycoon) con acciones discretas y recompensas multiobjetivo (dinero, satisfaccion, incidentes).
- Soporte de tool calling / function calling: no disponible, no se documenta.
- Soporte de agentes y razonamiento multi-paso: no se documenta; el uso previsto es de decision puntual, no de planificacion.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para coreano (`ko`).
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Simulacion de gestion empresarial: el modelo actua como agente de decision mensual dentro del simulador Connect Tycoon, devolviendo una letra de opcion por cada dilema de la compania simulada. Es su caso de uso nativo y para el que existen datos de rendimiento.
- Investigacion en post-entrenamiento con LoRA y GRPO: sirve como referencia reproducible de bajo coste (modelo base de 0,8 mil millones de parametros) para comparar curvas de aprendizaje entre aprendizaje supervisado y refuerzo, dado que el autor publica accuracy y regret de las dos fases.
- Entornos Gymnasium con espacio de acciones discretas: el modelo puede integrarse como politica de un entorno con acciones etiquetadas, mapeando cada letra de opcion a una accion del entorno y usando la probabilidad como criterio de exploracion.
- Generacion de datos sinteticos de decision etiquetada: al puntuar opciones contrafactuales sobre un simulador propio, un equipo puede replicar el pipeline descrito para producir un corpus de decisiones con recompensa reutilizable en otros entrenamientos.
- Educacion y cursos de refuerzo: el proyecto lo presenta explicitamente como modelo de investigacion y educacion, con cuaderno de Colab enlazado, lo que permite usarlo como material practico en formacion sobre RL aplicado.
- Transferencia a un dominio propio mediante reentrenamiento: dado que es un adaptador LoRA sobre un modelo base pequeno, un equipo puede sustituir el simulador por el suyo, regenerar el conjunto de problemas y reentrenar el adaptador con coste de computo reducido, manteniendo el mismo esquema de salida por letra.
- Filtrado o pre-clasificacion de decisiones en un flujo interno: cuando el problema se puede formular como una eleccion entre opciones etiquetadas y el texto esta en coreano, el modelo devuelve una etiqueta de una sola letra con probabilidad asociada, util como componente rapido dentro de un sistema mayor.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a un primer experimento sobre el conjunto de test de 840 problemas y a un mes de simulacion.

| Modelo | Precision en el test | Regret (menor es mejor) | Beneficio mensual en el simulador | Reduccion de perdidas en transacciones reales de tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 33,7 % | 2,24 | — | — |
| Aprendizaje supervisado | 80,7 % | 1,44 | — | — |
| Aprendizaje por refuerzo (este adaptador) | 80,5 % | 1,44 | 11,13 millones de wones | 75 % (153/177) |

El autor indica que la evaluacion de la operacion empresarial usa la media de dos meses no vistos, que la muestra es pequena y que la politica resultante sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se publican resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 0,8 mil millones de parametros, los pesos en precision de 16 bits ocupan del orden de 1,6 GB y el total con cache de clave-valor y sobrecarga de ejecucion se situa aproximadamente entre 2 y 3 GB; en cuantizacion de 8 bits, alrededor de 1 GB de pesos, y en 4 bits, alrededor de 0,5 GB. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cabe con holgura en cualquier GPU de consumo con al menos 4 GB de VRAM, y la inferencia en CPU es viable.
- Cabe en GPU de consumo: si, en practicamente cualquier modelo moderno con 4 GB o mas de VRAM; tambien en equipos integrados de gama reciente mediante cuantizacion.
- Opciones de despliegue: la via documentada es `transformers` con `peft` (`PeftModel.from_pretrained`), tal como aparece en la model card. Para `llama.cpp`, Ollama o TGI seria necesario fusionar el adaptador con el modelo base y convertir el resultado al formato correspondiente, algo que no se documenta. vLLM puede servir adaptadores LoRA de forma nativa, aunque no se aporta configuracion concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucy-v1 | 0,8 mil millones (base) mas adaptador LoRA | no disponible | 80,5 % de acierto en test propio, regret 1,44 | Apache 2.0 | HuggingFace, adaptador PEFT |
| Qwen/Qwen3.5-0.8B (modelo base sin entrenar) | 0,8 mil millones | no disponible | 33,7 % de acierto en el mismo test, regret 2,24 | no disponible | HuggingFace |
| Politica profesora del simulador (PPO, modelo pequeno) | no disponible | no disponible | Superior al modelo publicado, segun el autor | no disponible | no disponible |

No se dispone de datos sobre otros modelos de decision empresarial comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion y educacion: el propio autor pide revalidarlo con los registros reales de una empresa antes de usarlo para decisiones de gestion reales.
- Los resultados proceden de un primer experimento con muestras pequenas: dos meses no vistos para la metrica de operacion y un unico conjunto de test de 840 problemas.
- El modelo queda por debajo de la politica profesora entrenada con PPO en el simulador, segun reconoce el autor.
- Sesgo de distribucion: los datos provienen de un simulador empresarial sintetico con una distribucion de empresas etiquetada como `general`, por lo que el comportamiento hereda las simplificaciones y sesgos del simulador, no de datos reales.
- Riesgo de alucinacion en el formato: si la pregunta o las opciones no encajan en el esquema esperado, el modelo puede emitir una letra que no corresponda a ninguna opcion o que sea incorrecta, sin ninguna senal de error mas alla de la probabilidad asignada.
- Idioma: solo coreano. No hay evidencia de funcionamiento fiable en castellano ni en otros idiomas.
- Alcance muy restringido: no es un modelo generativo util para texto libre, resumen, codigo o dialogo; su salida es una unica letra.
- El texto del estado debe tratarse como datos y no como instrucciones; el mensaje de sistema prescrito solo mitiga parcialmente el riesgo de inyeccion de prompt.
- Licencia: el adaptador se publica bajo Apache 2.0, pero la licencia del modelo base `Qwen/Qwen3.5-0.8B` no se detalla en la informacion disponible y debe verificarse antes de un uso comercial.
- Formato de salida y evaluacion: la metrica de exito depende de que exista un conjunto de opciones etiquetadas; en produccion hace falta un componente externo que construya el estado, las opciones y valide la letra devuelta.
- Se desconoce la longitud de contexto soportada, lo que impide planificar el tamano maximo del estado de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucyhome/connectailab-rl-lucy-v1
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz

Nota: los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo; las entradas devueltas corresponden al editor de texto `vi`, a un medio deportivo neerlandes y a un operador de telefonia indio, por lo que no se han incluido.
