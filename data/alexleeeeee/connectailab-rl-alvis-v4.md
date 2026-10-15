# AlexLEEeeee/connectailab-rl-alvis-v4

## Resumen

ConnectAILab RL Alvis v4 es un adaptador LoRA de decisión entrenado con aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3.5-0.8B. Lo publica el usuario AlexLEEeeee en el marco del proyecto Connect AI Lab, junto con AI City Builders, y su propósito no es generar texto abierto: recibe un estado, una pregunta y una lista de opciones etiquetadas, y devuelve únicamente la letra de la opción elegida, con una distribución de probabilidad asociada a cada alternativa.

El entrenamiento se apoya en CONNECT TYCOON, un simulador de gestión empresarial compatible con gymnasium. El flujo combina una política profesora aprendida con PPO en el simulador, la generación de un conjunto de problemas mediante reevaluación contrafactual (4.082 ejemplos de entrenamiento, 832 de validación y 840 de test), un ajuste supervisado por imitación y una fase final de refuerzo con ventaja normalizada por grupo y penalización KL respecto al modelo de partida.

Su interés actual es metodológico: demuestra que un modelo de menos de mil millones de parámetros puede actuar como cabeza de decisión dentro de un simulador en lugar de como generador de texto. La licencia Apache 2.0 y el tamaño reducido permiten ejecutarlo en hardware de consumo, pero su alcance es experimental, está limitado al dominio del simulador y solo trabaja en coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA y salida restringida a etiquetas de opción |
| Parámetros totales | 0,8 mil millones en el modelo base, según la denominación del repositorio; el adaptador LoRA añade un número reducido de parámetros, cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos publicados son un adaptador PEFT en safetensors, sin versiones GGUF ni AWQ documentadas |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer causal, no una arquitectura propia. La particularidad está en la interfaz y en el objetivo de entrenamiento: la entrada sigue el esquema `{"state": ..., "question": ..., "options": [{"label": "A", "key": ..., "description": ...}]}` y la salida esperada es una única letra. El prompt de sistema que acompaña al modelo instruye a tratar el contenido de `state` como datos y no como instrucciones, y a devolver solo la letra, sin explicación. Las probabilidades asignadas a cada letra funcionan como puntuación de cada alternativa y el valor máximo actúa como medida de confianza.

El pipeline de entrenamiento tiene cuatro etapas documentadas por el autor. Primero, una política pequeña se entrena con PPO dentro del simulador durante miles de meses simulados y actúa como profesora. Segundo, se construye un conjunto de problemas: por cada mes operado, se alteran las opciones de una decisión y se reevalúa el mes completo para asignar una puntuación a cada alternativa. Tercero, se realiza aprendizaje supervisado imitando la opción con mejor puntuación. Cuarto, se aplica refuerzo sobre grupos completos de opciones, elevando la probabilidad de las que superan la media del grupo, con normalización por grupo y regularización KL contra el modelo de partida. No se documentan el número de tokens de entrenamiento, la composición del corpus ni el uso de RLHF o DPO.

## Capacidades

- Selección cerrada de opciones: dado un estado, una pregunta y un conjunto de alternativas etiquetadas, devuelve una única letra como respuesta.
- Puntuación de alternativas: la distribución de probabilidad sobre las letras permite ordenar las opciones por preferencia, no solo escoger una.
- Estimación de confianza: el valor máximo de esa distribución se presenta como medida de certeza de la decisión.
- Decisiones con prioridades de valor explícitas: el modelo se ha afinado con una jerarquía declarada de beneficio (1,0), satisfacción (2,0) y gestión de riesgo (1,5).
- Seguimiento de instrucciones de formato estricto: respeta la consigna de devolver solo la letra, sin texto adicional.
- Resistencia básica a inyección de prompt: el prompt de sistema indica tratar el campo `state` como datos, aunque no hay garantía técnica de que se cumpla.
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente, planificación multi-paso ni uso de memoria externa.
- No dispone de visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado al coreano como idioma declarado.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como referencia reproducible de destilación desde una política PPO hacia un modelo de lenguaje pequeño, útil para comparar imitación supervisada frente a optimización por refuerzo en el mismo conjunto de problemas.
- Simuladores de negocio y juegos de gestión: se integra como cerebro de un agente que decide cada mes entre varias políticas de empresa, encajando de forma directa en el bucle del entorno CONNECT TYCOON.
- Docencia de RL aplicado: el repositorio incluye un notebook de Colab y material asociado, de modo que el modelo puede usarse como ejemplo práctico de un pipeline completo (simulador, profesora, dataset, SFT y GRPO) en cursos introductorios.
- Prototipado de cabezas de decisión: para equipos que quieran sustituir reglas heurísticas por un modelo que puntúe alternativas en un dominio acotado, ofrece una plantilla de entrada y salida de bajo coste computacional.
- Evaluación contrafactual de decisiones: la misma mecánica de comparar opciones sirve para estudiar qué habría pasado con una decisión distinta en un escenario simulado, siempre con los pesos de prioridad declarados.
- Generación de datos sintéticos de decisión: al producir una distribución sobre opciones, puede etiquetar grandes volúmenes de escenarios que después se filtren por nivel de confianza antes de usarse como datos de entrenamiento.
- Análisis de gestión de riesgo en entornos controlados: su función de valor pondera el riesgo por encima del beneficio, lo que permite estudiar sesgos conservadores en políticas aprendidas sin exponer capital real.
- Evaluación comparativa de modelos base pequeños: al partir de un checkpoint de 0,8B, permite medir cuánto aporta un adaptador LoRA especializado frente al modelo sin afinar en una tarea de elección múltiple restringida.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la evaluación del propio autor sobre el simulador y el conjunto de test descrito en la model card. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K, y no se incluyen aquí porque el modelo no es un generador de texto de propósito general y porque no hay cifras disponibles.

| Modelo | Tasa de acierto en el test | Arrepentimiento (menor es mejor) | Beneficio en un mes de simulador | Reducción de pérdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen sin entrenar | 35,1% | 3,30 | no disponible | no disponible |
| Aprendizaje supervisado | 83,2% | 2,21 | no disponible | no disponible |
| Aprendizaje por refuerzo (v4) | 82,1% | 2,20 | 10,03 millones de wones | 73% (147/177) |

El autor advierte de que los resultados son de un primer experimento, que la métrica de operación empresarial se calcula sobre una media de dos meses no vistos (muestra pequeña) y que la política profesora del simulador sigue por encima del modelo publicado.

## Requisitos de hardware

Los valores de VRAM son estimaciones derivadas del tamaño del modelo base y no cifras publicadas por el autor.

- Inferencia en FP16: aproximadamente 2 GB solo de pesos, más caché KV y activaciones; en la práctica entre 3 y 5 GB de VRAM.
- Inferencia en 8 bits: alrededor de 1 GB de pesos, con un consumo total estimado por debajo de 3 GB.
- Inferencia en 4 bits (si se convierte a GGUF Q4): alrededor de 0,5-0,7 GB de pesos, manejable en GPUs con 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 4090 o superiores dejan margen de sobra. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, incluidas GTX 1650 de 4 GB y superiores, siempre que se cuantice.
- Opciones de despliegue: transformers con PEFT es la vía documentada por el autor; vLLM admite adaptadores LoRA; llama.cpp y Ollama requieren convertir primero el modelo fusionado a GGUF, paso no documentado en el repositorio.
- Latencia y rendimiento: no disponible.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables: se trata de una cabeza de decisión especializada en un simulador concreto, no de un asistente de propósito general. La comparación más informativa es con su propio modelo base y con las versiones anteriores del mismo autor.

| Modelo | Tipo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-alvis-v4 | Adaptador LoRA con RL | 0,8B en el modelo base | no disponible | Elección de una opción entre varias | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | Modelo de lenguaje base | 0,8B | no disponible | Generación de texto general | no disponible | Hugging Face |
| connectailab-rl-alvis-v2 | Adaptador LoRA con RL | 0,8B en el modelo base | no disponible | Elección de una opción entre varias | Apache 2.0 | Hugging Face |
| connectailab-rl-alvis-v2-teacher | Política profesora entrenada con PPO | no disponible | no disponible | Decisión en el simulador | Apache 2.0 | Hugging Face |

No se dispone de una comparación de rendimiento entre estas versiones más allá de las cifras del propio v4.

## Limitaciones y advertencias

- El modelo solo está declarado para coreano; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- No es un modelo conversacional ni generativo: si se usa fuera del formato de estado, pregunta y opciones, la salida carece de sentido.
- El entrenamiento se apoya en un simulador sintético de empresas; el propio autor indica que debe reverificarse con datos reales de la empresa antes de tomar decisiones de gestión.
- La evaluación de beneficio operativo se basa en una media de dos meses no vistos, un tamaño de muestra muy reducido y sin intervalos de confianza publicados.
- La tasa de acierto del modelo reforzado (82,1%) es ligeramente inferior a la del modelo supervisado (83,2%), aunque su arrepentimiento es algo menor; la mejora no es uniforme.
- El autor reconoce explícitamente que la política profesora del simulador sigue siendo superior al modelo publicado.
- Riesgo de alucinación de etiqueta: puede devolver una letra que no corresponda a ninguna opción válida, y no se documenta ningún mecanismo de validación posterior.
- El prompt de sistema pide tratar el contenido de `state` como datos, pero no existe una defensa técnica demostrada contra inyección de prompt a través de ese campo.
- Las prioridades de valor (beneficio 1,0, satisfacción 2,0, gestión de riesgo 1,5) son una decisión de diseño del autor e introducen un sesgo hacia la satisfacción del cliente por encima del beneficio económico.
- El repositorio no tiene descargas ni valoraciones en el momento de la consulta, por lo que no existe validación externa de los resultados.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero no se especifican condiciones sobre el modelo base, del que no se detalla licencia en la información disponible.
- Está planteado como modelo de investigación y educación, no como componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexLEEeeee/connectailab-rl-alvis-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Versión anterior v2: https://huggingface.co/AlexLEEeeee/connectailab-rl-alvis-v2
- Política profesora v2-teacher: https://huggingface.co/AlexLEEeeee/connectailab-rl-alvis-v2-teacher
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de Connect AI Lab: https://www.youtube.com/@CONNECT-AI-LAB
- AI City Builders: https://www.aicitybuilders.com
- Curso de refuerzo de AI City Builders: https://www.aicitybuilders.com/robot
- Connect AI (proyecto C1): https://www.ezerai.xyz
