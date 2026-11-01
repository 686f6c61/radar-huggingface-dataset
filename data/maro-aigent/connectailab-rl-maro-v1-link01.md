# maro-aigent/connectailab-rl-maro-v1-link01

## Resumen

Connectailab-rl-maro-v1-link01 es un adaptador LoRA publicado por el usuario maro-aigent que se monta sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje generalista, sino un ajuste fino orientado a la toma de decisiones de un robot simulado llamado LINK-01: recibe una descripcion textual del estado del robot (distancia y direccion al objetivo, sensores de distancia, velocidad y eleccion anterior) y devuelve una unica letra que corresponde a una de las acciones discretas disponibles para el siguiente intervalo de 0,5 segundos.

El adaptador se ha entrenado en el ecosistema CONNECT AI WORLD / CONNECT TYCOON, un entorno educativo de aprendizaje por refuerzo en el navegador. El proceso combina un cerebro PPO entrenado en un simulador de caminata 2D (que actua como profesor), la generacion de un corpus de pares observacion-decision, un ajuste supervisado con LoRA y una fase posterior de optimizacion por refuerzo con penalizacion KL sobre el modelo base. El resultado es un modelo de 0,8B de parametros que imita las decisiones de una politica PPO con una tasa de coincidencia del 90,6 % en el conjunto de test.

La relevancia es acotada y muy especifica: sirve como ejemplo reproducible de como destilar una politica de RL en un modelo de lenguaje pequeno y como banco de pruebas para investigacion en aprendizaje por refuerzo aplicado a agentes. No esta pensado para uso general, atencion al cliente ni generacion de codigo, y su unico idioma declarado es el coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador LoRA) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B de parametros. El entrenamiento se estructura en cuatro fases segun la model card: (1) entrenamiento de una politica PPO en el simulador web sobre la tarea `choose_object` (convencion `link01-decision/choose_object/obs26-act4/walker51-14/v1`, curso `92cf6c4d`, examen oficial al 25 %); (2) generacion de un corpus de problemas a partir de las observaciones del robot cada 0,5 segundos, con la respuesta del cerebro PPO como etiqueta y un 20 % de ejemplos con desviaciones deliberadas; (3) ajuste supervisado del modelo de lenguaje mediante LoRA para imitar al cerebro; y (4) una fase de optimizacion por refuerzo con PPO y anclaje KL, donde se premian las opciones que habrian producido mejores recompensas que la respuesta del profesor.

El corpus consta de 546 ejemplos de entrenamiento, 84 de validacion y 245 de test. La evaluacion se realiza sentando al modelo en el puesto de decision del robot y ejecutando 20 partidas con semillas 91001-91020 sobre una aproximacion 2D de la caminata (tabla de velocidades por comando derivada del simulador web MuJoCo), sin red neuronal de marcha ni modelo fisico del robot. La tasa de coincidencia con el cerebro profesor en el conjunto de test es del 90,6 % tanto para el modelo supervisado como para el reforzado.

## Capacidades

- Clasificacion de decisiones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas (4 acciones en la convencion `act4`).
- Formato de salida restringido: el prompt de sistema exige devolver solo la letra, sin explicacion.
- Tratamiento del estado como datos: el prompt de sistema indica explicitamente que el texto dentro de `state` no debe interpretarse como instrucciones.
- Imitacion de una politica PPO entrenada en simulacion para la tarea `choose_object`.
- Generacion de texto general y razonamiento: heredados del modelo base Qwen3.5-0.8B, no evaluados en esta ficha.
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes multi-paso: no documentado; el modelo resuelve decisiones de un solo paso.
- Capacidades multilingues: solo coreano declarado; el prompt de sistema esta en ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en destilacion de politicas RL: el adaptador sirve como caso reproducible para estudiar como se transfiere una politica PPO a un modelo de lenguaje pequeno mediante LoRA y una fase posterior de RL con KL.
- Educacion en aprendizaje por refuerzo: el flujo completo (entorno web, generacion de corpus, SFT, PPO) esta documentado y enlazado a un notebook de Colab, lo que permite usarlo como material docente en cursos de RL.
- Banco de pruebas de decision secuencial en simulacion: se puede integrar en el simulador CONNECT AI WORLD para comparar el comportamiento del modelo de lenguaje frente al cerebro PPO original en las mismas semillas.
- Evaluacion de robustez ante prompts: al tratarse de una tarea de clasificacion con salida restringida, es util para medir la fidelidad al formato y la resistencia a instrucciones inyectadas en el estado.
- Prototipado de agentes con salida estructurada: sirve como ejemplo minimo de como forzar a un modelo de 0,8B a emitir una unica etiqueta valida en un pipeline de control.
- Docencia sobre limitaciones de los benchmarks sinteticos: el propio autor advierte que la evaluacion usa una aproximacion 2D de la caminata y no un modelo fisico, lo que lo convierte en un caso practico para discutir la validez de las metricas en simulacion.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Modelo | Acierto en test (coincidencia con el cerebro) | Exito en 20 partidas | Partidas con colision | Tiempo medio de las partidas exitosas |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 25 % | 0 % | 7,8 s |
| Modelo sin entrenar | 12,2 % | 60 % | 0 % | 8,7 s |
| Ajuste supervisado (LoRA) | 90,6 % | 25 % | 0 % | 7,8 s |
| Ajuste supervisado + RL | 90,6 % | 25 % | 0 % | 7,8 s |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo base de 0,8B en precision fp16 se puede estimar en torno a 1,6 GB de pesos mas el adaptador y el overhead de activaciones; en cuantizacion de 4 bits, por debajo de 1 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar el modelo base en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue en servidor, A100 o H100 no aportan ventaja significativa dado el tamano.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU con 4 GB o mas.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card); llama.cpp, Ollama, vLLM o TGI requeririan convertir el adaptador a GGUF o fusionarlo con el modelo base, algo no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA de destilacion de politicas RL sobre modelos de lenguaje pequenos) en la informacion proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| connectailab-rl-maro-v1-link01 | 0,8B (base) + LoRA | no disponible | Apache 2.0 | safetensors (PEFT) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible en la informacion | safetensors |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio extremadamente restringido: el modelo solo resuelve la tarea `choose_object` con 4 acciones discretas; no es un asistente general ni un modelo de codigo.
- Idioma: solo se declara coreano; el prompt de sistema esta en ingles y el rendimiento fuera de ese formato no esta evaluado.
- Evaluacion sintetica: la marcha se puntua con una tabla de velocidades derivada de MuJoCo, sin modelo fisico ni red de marcha, por lo que los resultados pueden diferir de la simulacion real.
- Sobreajuste al profesor: la tasa de acierto maxima alcanzable es del 100 % porque el profesor es deterministico; el 90,6 % refleja imitacion, no necesariamente mejora de la politica.
- La fase de RL no mejoro las metricas frente al ajuste supervisado (mismos valores en test y en las 20 partidas), lo que sugiere un margen de mejora limitado con el corpus actual.
- Riesgo de alucinacion: aunque la salida esta restringida a una letra, el modelo podria emitir opciones no listadas o texto adicional si el prompt se altera.
- Inyeccion de prompt: el propio autor advierte que el texto dentro de `state` debe tratarse como datos; un estado malicioso podria intentar redirigir la decision.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor lo describe como modelo de investigacion y educacion en simulador y recomienda revalidarlo en el robot y el espacio reales antes de cualquier uso fisico.
- Sin datos de sesgo, toxicitad ni evaluaciones de seguridad publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maro-aigent/connectailab-rl-maro-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de aprendizaje web: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
