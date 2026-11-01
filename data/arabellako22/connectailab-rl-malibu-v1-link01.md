# arabellako22/connectailab-rl-malibu-v1-link01

## Resumen

Malibu-v1 es un adaptador LoRA de PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario arabellako22 bajo el paraguas del proyecto ConnectAILab. No es un modelo de lenguaje conversacional al uso: es una política de decision para un robot simulado LINK-01, destilada desde un profesor PPO entrenado en navegador hacia un modelo de lenguaje que lee el estado de los sensores como texto estructurado en coreano y elige una de cinco acciones discretas (avanzar, virar izquierda, virar derecha, girar izquierda, girar derecha).

El modelo resuelve la tarea `goto_target`: navegar hacia una taza objetivo en un simulador 2D. La entrada son 21 observaciones del profesor renderizadas como texto (distancia y rumbo al objetivo, movimiento, accion previa y 11 sensores de distancia), y la salida es una de las cinco acciones, con un intervalo de decision de 0,5 segundos. El checkpoint seleccionado es el LoRA supervisado de 8 epocas, que alcanza un 100 % de exito (20/20) en semillas de evaluacion reservadas no usadas durante el entrenamiento.

Su relevancia es metodologica mas que de producto: demuestra una cadena completa profesor PPO en navegador, destilacion supervisada con LoRA, refinamiento por recompensa con objetivo de ventaja esperada regularizado por KL, y publicacion verificada con manifiestos de checksums y evidencia de ejecucion. El modelo base Qwen3.5-0.8B aporta la capacidad de procesar la pregunta en texto; el adaptador aporta la politica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (rank 8, alpha 16, todas las capas lineales) |
| Parametros totales | No disponible (el repositorio contiene solo el adaptador LoRA; el modelo base Qwen3.5-0.8B se carga por separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; cuantizaciones del base no documentadas) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen3.5-0.8B por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 y alpha 16 aplicado sobre todas las capas lineales de Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador no contiene el controlador de marcha de bajo nivel del robot; es exclusivamente una politica de decision de alto nivel. El contrato de observacion/accion es `link01-decision/goto_target/obs21-act5/walker51-14/v1`: 21 observaciones de entrada y 5 acciones discretas.

El pipeline de entrenamiento tiene tres fases. Primero, un profesor PPO se entrena en el simulador web sobre el curso fijo `7dc01cd0`, con red 21 → 64 → 64 → 5, 20.480 decisiones, 10 actualizaciones, semilla 431, learning rate 0,0003, gamma 0,97, GAE lambda 0,95, clipping 0,2 y 8 entornos. Segundo, se genera un dataset de decision de 350 preguntas de entrenamiento, 72 de validacion y 108 de test con semillas de episodio disjuntas, con un 20 % de acciones aleatorias durante la recoleccion pero etiquetas siempre del profesor; se destila de forma supervisada con LoRA (learning rate 1e-4, batch 8, semilla 0) en candidatos de 2 y 8 epocas. Tercero, se aplica un refinamiento por recompensa offline con objetivo de ventaja esperada regularizado por KL (learning rate 5e-6, batch 8, coeficiente KL 0,2, maximo 1.500 filas), partiendo de los checkpoints supervisados original y seleccionado por validacion.

La recompensa del entorno pondera progreso (+3), alcance (+20), tiempo (0), caida (-10), salida del curso (-8) y colision (-4). El entrenamiento uso una NVIDIA A100-SXM4-80GB en bfloat16, con `logits_to_keep` nativo para restringir la proyeccion de vocabulario a las posiciones finales requeridas. Los tiempos de pared fueron de 3 min 26,653 s para 2 epocas (94 actualizaciones) y 3 min 53,809 s para 8 epocas (376 actualizaciones), incluyendo carga y evaluacion. Se aplico balanceo de respuestas raras: las 350 preguntas crudas se balancearon a 376 filas supervisadas.

## Capacidades

- Decision de navegacion `goto_target` en el simulador LINK-01: selecciona una de cinco acciones (A avanzar, B virar izquierda, C virar derecha, D girar izquierda en el sitio, E girar derecha en el sitio) cada 0,5 segundos.
- Lectura de estado de sensores como texto estructurado en coreano: 21 observaciones que incluyen distancia y rumbo al objetivo, movimiento, accion previa y 11 sensores de distancia.
- Imitacion de politica experta: 92,6 % de acuerdo con el profesor PPO en 108 preguntas de test retenidas (checkpoint de 8 epocas).
- Refinamiento por recompensa: variante con 90,7 % de acuerdo con el profesor y 100 % de exito en el curso de seleccion.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso ni razonamiento encadenado mas alla de la secuencia de decisiones del episodio.
- No tiene capacidades de vision, audio ni generacion de texto libre; su salida esta restringida a la eleccion de accion.
- Multilingue: no; unicamente coreano.
- No incluye el controlador de marcha de bajo nivel del robot.

## Casos de uso

- Navegacion simulada hacia objetivo en el simulador LINK-01: el modelo recibe el estado de 21 sensores como texto y emite la accion de movimiento cada 0,5 s, completando la tarea `goto_target` con un 100 % de exito en las semillas reservadas 92001–92020.
- Investigacion en destilacion de politicas: sirve como caso de referencia reproducible para estudiar la conversion de un profesor PPO en una politica basada en modelo de lenguaje mediante LoRA supervisado y refinamiento por recompensa con KL.
- Evaluacion de tecnicas de refinamiento offline: la publicacion incluye cuatro variantes (SFT 2 epocas, SFT 8 epocas, refinada desde original y refinada desde seleccionada) con metricas separadas de acuerdo con el profesor y exito en curso, util para comparar metodos.
- Docencia y divulgacion de RL aplicado a robtica: el pipeline completo (profesor en navegador, dataset, destilacion, refinamiento) esta documentado con manifiestos de checksums y recetas de ejecucion, lo que facilita replicarlo en cursos.
- Pruebas de contrato observacion/accion en robtica: el contrato `obs21-act5/walker51-14/v1` permite validar integraciones de politica de alto nivel con controladores de bajo nivel existentes.
- Benchmark de generalizacion de politicas: las semillas de test disjuntas y la evaluacion en semillas reservadas permiten medir sobreajuste al curso fijo `7dc01cd0` en experimentos de investigacion.
- Base para experimentos de politica multimodal texto-accion: al tratar el estado del robot como texto, se puede extender el enfoque a otras tareas de decision con el mismo modelo base de 0,8B.

## Benchmarks y rendimiento

| Politica | Acuerdo en test (108 preguntas) | Exito en curso de seleccion | Episodios con colision | Tiempo de ejecucion exitosa |
|---|---:|---:|---:|---:|
| Profesor (PPO) | — (referencia) | 100,0 % | 0,0 % | 7,45 s |
| Base sin entrenar | 36,1 % | 0,0 % | 100,0 % | — |
| LoRA supervisado (2 epocas) | 53,7 % | 10,0 % | 100,0 % | 25,50 s |
| LoRA refinado por recompensa (desde 2 epocas) | 50,9 % | 0,0 % | 55,0 % | — |
| LoRA supervisado (8 epocas) | 92,6 % | 100,0 % | 0,0 % | 7,60 s |
| LoRA refinado por recompensa (desde SFT seleccionado) | 90,7 % | 100,0 % | 0,0 % | 7,55 s |

Evaluacion del checkpoint seleccionado en semillas reservadas 92001–92020:

| Medida retenida | Resultado |
|---|---:|
| Exito | 100,0 % (20/20) |
| Episodios con colision | 0,0 % |
| Retorno medio | 23,237 |
| Tiempo medio de ejecucion exitosa | 7,47 s |

Diagnostico adicional: el acuerdo con el profesor tras redondear las observaciones numericas es del 98,1 %, lo que el autor describe como diagnostico de cuantizacion y no como cota de precision demostrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador LoRA ocupa aproximadamente 0,1 GB en el repositorio y se suma al modelo base Qwen3.5-0.8B, que por su tamano de 0,8B es ligero, pero no se documentan cifras de VRAM.
- GPU recomendadas: el entrenamiento se realizo en NVIDIA A100-SXM4-80GB con bfloat16; no se documentan requisitos de GPU para inferencia.
- Cabe en GPU de consumo: no confirmado en la informacion; por el tamano del base (0,8B) es plausible en GPUs de consumo, pero no se aporta evidencia.
- Opciones de despliegue: PEFT sobre transformers (carga del adaptador con el base Qwen/Qwen3.5-0.8B); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el unico dato temporal es el tiempo de entrenamiento (3 min 26,653 s para 2 epocas y 3 min 53,809 s para 8 epocas en A100-SXM4-80GB, incluyendo carga y evaluacion).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas de decision destiladas desde PPO a modelos de lenguaje sobre robot LINK-01 ni adaptadores LoRA equivalentes para navegacion simulada).

## Limitaciones y advertencias

- Es una politica especifica para la tarea `goto_target` en el simulador LINK-01; no es un modelo de proposito general ni responde a instrucciones arbitrarias.
- Solo soporta coreano como idioma de entrada; no hay capacidades multilingues.
- Depende del contrato exacto `link01-decision/goto_target/obs21-act5/walker51-14/v1`; cambios en el formato de observaciones o en el numero de sensores invalidan la politica.
- No contiene el controlador de marcha de bajo nivel; requiere un walker compatible para ejecutar el movimiento.
- Entrenado sobre un unico curso fijo (`7dc01cd0`); la generalizacion a otros mapas o condiciones no esta demostrada.
- Riesgo de sobreajuste al profesor y al curso: el exito del 100 % se mide en semillas del mismo curso fijo, no en entornos nuevos.
- El refinamiento por recompensa desde el checkpoint de 2 epocas empeoro el exito (0 %) respecto al SFT, lo que indica sensibilidad al punto de partida y a la recompensa simulada.
- Las observaciones numericas se redondean a texto; el propio autor advierte que el 98,1 % de acuerdo tras redondeo es un diagnostico de cuantizacion, no una cota de precision.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B debe verificarse por separado y el uso en robotica real exigiria validacion adicional fuera del simulador.
- No se documentan sesgos sociales ni de alucinacion en el sentido de modelos generativos, pero la politica puede producir decisiones erroneas (colisiones) fuera de la distribucion de entrenamiento.
- El repositorio tiene 33 descargas y 0 likes en el momento de la consulta; no hay validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arabellako22/connectailab-rl-malibu-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Codigo de entrenamiento: source/README.md (dentro del repositorio)
- Simulador web: https://www.ezerai.xyz/robot-lab/world/
- Guia del proyecto: https://www.ezerai.xyz/robot-lab/world/guide/
- Framework de entrenamiento: https://github.com/wonseokjung/connect-tycoon
