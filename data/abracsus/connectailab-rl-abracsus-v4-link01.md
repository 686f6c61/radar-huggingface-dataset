# abracsus/connectailab-rl-abracsus-v4-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario abracsus en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un modelo de decisión específico para el robot simulado LINK-01: recibe una descripción en texto del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la siguiente acción de locomoción para los próximos 0,5 segundos. El modelo se etiqueta con pipeline `reinforcement-learning` y el idioma declarado es coreano (ko).

La construcción sigue una cadena de destilación peculiar: primero se entrena una política PPO en un entorno web de aprendizaje por refuerzo (`follow_route`, con un 95 % de éxito en el examen oficial), después se generan 1.395 ejemplos de entrenamiento, 245 de validación y 444 de test convirtiendo las observaciones del robot en texto y las acciones de la política en etiquetas, y finalmente se ajusta el modelo base con LoRA mediante aprendizaje supervisado y una fase posterior de RL con restricción KL. El resultado es un modelo de 0,8B de parámetros que imita la política del "profesor" con una tasa de acierto del 76,6 % en test y que, colocado en el puesto de decisión del robot, completa con éxito 19 de 20 episodios de la misma ruta.

Su relevancia es acotada pero interesante como caso de estudio: demuestra que un modelo de lenguaje pequeño puede sustituir a una política de RL en un bucle de decisión de baja frecuencia, siempre que la tarea esté bien acotada y el espacio de acciones sea discreto y pequeño (5 opciones). Es un modelo de investigación y educación sobre simulador, no un componente listo para producción ni para robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B de parámetros, mediante LoRA. El entrenamiento se organiza en cuatro fases descritas en la model card: (1) entrenamiento de una política PPO en el entorno web `follow_route` con la especificación `link01-decision/follow_route/obs16-act5/walker51-14/v1` y el curso `40494425`, que alcanza un 95 % de éxito en el examen oficial; (2) generación de un corpus de preguntas y respuestas a partir de las observaciones del robot cada 0,5 segundos, con la respuesta de la política como etiqueta y un 20 % de ejemplos con desviaciones deliberadas de la ruta; (3) ajuste supervisado del modelo base con LoRA para imitar esas respuestas; y (4) una fase de RL que sube la probabilidad de las opciones con mayor recompensa esperada y baja la de las peores, anclada con una penalización KL.

La evaluación se realiza colocando el modelo de decisión en el puesto de mando del robot y recorriendo la misma ruta en 20 episodios con semillas 91001–91020. La métrica de "acierto" es la coincidencia con la respuesta de la política profesora en los 444 ejemplos de test, con un techo del 99 % atribuido a la pérdida de información al pasar la observación a texto. La simulación de marcha es una aproximación 2D basada en una tabla de velocidades medidas por comando, no en un modelo físico completo, por lo que no reproduce caídas ni dinámicas complejas.

## Capacidades

- Decisión discreta de locomoción: dado un estado textual del robot, selecciona exactamente una de cinco opciones de acción (una letra) para los siguientes 0,5 segundos.
- Formato de salida restringido: responde únicamente con la letra de la opción elegida, sin explicación, cuando se le aplica el system prompt indicado.
- Robustez parcial ante desviaciones: el corpus de entrenamiento incluye un 20 % de ejemplos en los que la política se salió de la ruta, lo que enseña al modelo a recuperar el camino.
- Tratamiento del estado como datos: el prompt de sistema instruye explícitamente a no interpretar el contenido del estado como instrucciones, una mitigación básica de inyección de prompts.
- Capacidades generales de lenguaje: hereda las del modelo base Qwen3.5-0.8B, aunque el ajuste LoRA está orientado exclusivamente a la tarea de decisión.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento documentados.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: el modelo sirve como caso reproducible de conversión de una política PPO en un modelo generativo, útil para estudiar la pérdida de rendimiento entre profesor y alumno (95 % frente a 76,6 % de acierto en test).
- Educación en aprendizaje por refuerzo: el repositorio CONNECT TYCOON y el cuaderno de Colab permiten reproducir el pipeline completo (entorno, PPO, generación de corpus, LoRA y evaluación) en un entorno web.
- Docencia sobre LoRA y PEFT: al ser un adaptador de 0,8B con licencia Apache 2.0, puede ejecutarse en hardware modesto y usarse para explicar el ajuste eficiente de parámetros en clase.
- Evaluación de robustez ante entradas textuales: el formato estado-pregunta-opciones permite construir experimentos controlados sobre cómo un LLM pequeño maneja instrucciones embebidas en datos.
- Prototipado de agentes de decisión de baja frecuencia: en entornos simulados con espacio de acciones discreto y pasos de 0,5 segundos, el modelo puede integrarse como política de sustitución para comparar contra la política RL original.
- Referencia para pipelines de RLHF/RL con anclaje KL: la fase de RL descrita (subir opciones con mejor recompensa esperada, bajar las peores, KL para no divergir) es un ejemplo didáctico de ajuste fino con recompensa sobre un modelo pequeño.

## Benchmarks y rendimiento

Los datos disponibles son de la evaluación propia del autor, no de benchmarks estándar de LLM.

| Modelo | Acierto en test (coincidencia con la política) | Éxito en 20 episodios de la ruta | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Política profesora (PPO) | 100,0 % | 95 % | 0 % | 27,1 s |
| Modelo base sin ajustar | 29,5 % | 0 % | 0 % | — |
| Ajuste supervisado (LoRA) | 76,6 % | 95 % | 0 % | 27,3 s |
| Ajuste con RL (este adaptador) | 74,8 % | 90 % | 0 % | 27,3 s |

El autor indica que la evaluación de marcha es una aproximación 2D basada en una tabla de velocidades medidas por comando, sin modelo físico de caídas, y que puede diferir de los resultados en MuJoCo web. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 0,8B en precisión de 16 bits ocupa del orden de 1,6 GB de pesos, más el adaptador LoRA y la caché KV; en cuantización de 4 bits podría situarse por debajo de 1 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo base en 16 bits, pero no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base, aunque no se documenta ninguna prueba.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` y `peft` (`AutoModelForCausalLM` + `PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA en safetensors requeriría fusión o carga con PEFT en la mayoría de esos motores.
- Latencia y throughput: no disponibles. La tarea exige una decisión cada 0,5 segundos, pero el autor no publica latencias medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para decisión robótica sobre modelos de lenguaje pequeños). A modo de referencia estructural, se compara con el modelo base y con la política original:

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-abracsus-v4-link01 | 0,8B + LoRA | no disponible | 74,8 % acierto; 90 % éxito en 20 episodios | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | 29,5 % acierto; 0 % éxito | no disponible en esta ficha | Hugging Face |
| Política PPO `follow_route` (profesora) | no disponible (red pequeña) | N/A | 100 % acierto; 95 % éxito | no disponible | Repositorio CONNECT TYCOON |

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo resuelve la tarea `follow_route` con 16 observaciones y 5 acciones; no es un modelo de propósito general y su uso fuera de ese formato producirá salidas sin sentido.
- Pérdida de rendimiento frente al profesor: el adaptador con RL acierta el 74,8 % de las decisiones del profesor, por debajo del 76,6 % del ajuste supervisado, y su éxito en episodios cae al 90 % frente al 95 % del profesor y del modelo supervisado.
- Evaluación simplificada: la marcha se simula con una tabla de velocidades en 2D sin modelo físico de caídas, por lo que los resultados no garantizan comportamiento en un simulador completo ni en un robot real.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Idioma: el modelo está declarado únicamente para coreano, lo que limita su uso directo en entornos en castellano sin reentrenamiento o traducción del formato de estado.
- Riesgo de inyección de prompts: aunque el prompt de sistema indica tratar el estado como datos, un modelo de 0,8B ofrece garantías limitadas frente a instrucciones maliciosas embebidas en la observación.
- Riesgo de alucinación: el modelo puede devolver letras fuera del conjunto de opciones o texto adicional si no se aplica el formato exacto; el autor no documenta un mecanismo de validación de salida.
- Sesgos: no se documentan análisis de sesgos; al estar entrenado sobre una única ruta y una única política, el modelo está fuertemente sesgado hacia el comportamiento de esa política.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo base Qwen3.5-0.8B debe verificarse por separado antes de explotación comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abracsus/connectailab-rl-abracsus-v4-link01
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
