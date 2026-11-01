# minju2026/connectailab-rl-ducky-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el autor minju2026 en el marco del proyecto CONNECT AI LAB / CONNECT TYCOON. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para robótica: recibe una descripción textual del estado de un robot caminante (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la siguiente acción de locomoción para los próximos 0,5 segundos. El pipeline declarado es reinforcement-learning y la librería es PEFT.

El modelo se construye en dos fases: primero se entrena una política PPO en un entorno web de aprendizaje (tarea `follow_route`, observación de 16 dimensiones, 5 acciones posibles) hasta alcanzar el 100 % de éxito en el examen oficial; después se destila esa política en el modelo lingüístico mediante LoRA supervisado y se refina con PPO, usando como recompensa el resultado de ejecutar la acción elegida y dejar que la política original complete el recorrido. El resultado es un modelo que traduce decisiones de política a texto y las devuelve en un formato de una sola letra.

Su relevancia es acotada pero interesante como caso de estudio: demuestra un flujo completo de destilación de políticas RL en LLMs pequeños con LoRA y PPO, con métricas de éxito en simulación. No obstante, el tamaño del repositorio es de 0,0 GB, las descargas son 12 y la validación se ha hecho con una aproximación 2D de la marcha, no con el simulador MuJoCo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | Coreano (ko); las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La innovación no está en la arquitectura del modelo base, sino en el procedimiento de entrenamiento en cuatro etapas descrito en la model card: (1) entrenamiento de una política PPO en el entorno web `follow_route` con observación de 16 dimensiones y 5 acciones, alcanzando el 100 % en el examen oficial; (2) generación de un conjunto de problemas convirtiendo cada observación en texto y cada acción de la política en la respuesta correcta, incluyendo un 20 % de ejemplos con desviaciones del recorrido; (3) ajuste supervisado con LoRA para imitar la política; y (4) refinamiento con PPO donde la recompensa es el retorno obtenido al ejecutar la acción propuesta y dejar que la política original complete el episodio, con una penalización KL para mantener el modelo cerca de la distribución supervisada.

El conjunto de datos consta de 1.097 ejemplos de entrenamiento, 251 de validación y 327 de prueba. La tasa de coincidencia entre la representación textual y la política original (techo de acierto) se sitúa en el 99 %. La evaluación final se realiza colocando el modelo en el puesto de decisión del robot y ejecutando 20 episodios con semillas 91001–91020; la marcha se simula mediante una tabla de velocidades por comando derivada de MuJoCo web, sin red neuronal de locomoción, lo que elimina caídas pero introduce divergencia respecto al simulador real.

## Capacidades

- Clasificación de acciones discretas a partir de descripciones textuales del estado del robot: devuelve exactamente una letra entre las opciones listadas.
- Decisión de locomoción para la tarea `follow_route` en un robot caminante simulado, con horizonte de 0,5 segundos por paso.
- Formato de salida restringido: solo la letra de la opción, sin explicación, bajo una instrucción de sistema específica.
- Tratamiento del texto del estado como datos, no como instrucciones (prompt hardening explícito en el system prompt).
- Capacidad multilingüe limitada al coreano para el contenido y al inglés para las instrucciones.
- No se declaran capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Estudio de destilación de políticas RL en LLMs pequeños: sirve como referencia reproducible para investigar cómo trasladar una política PPO a un modelo lingüístico mediante LoRA y PPO, con código y cuaderno de Colab disponibles.
- Docencia de aprendizaje por refuerzo: el flujo completo (entorno web, generación de problemas, SFT, PPO, evaluación) es un ejemplo didáctico cerrado y de bajo coste computacional.
- Prototipado de agentes de decisión en simulación 2D: permite integrar un decisor basado en lenguaje en pipelines de robótica simulada antes de invertir en políticas neuronales completas.
- Evaluación de robustez de instrucciones: el modelo está diseñado para ignorar instrucciones embebidas en el estado, lo que lo convierte en un banco de pruebas para estudiar inyección de prompts en entradas estructuradas.
- Generación de datos sintéticos de decisión: las salidas del modelo pueden usarse para comparar con la política original y detectar divergencias en la representación textual del estado.
- Investigación sobre recompensas basadas en retorno: el esquema de PPO con recompensa derivada de la ejecución de la política original es replicable en otros dominios de decisión secuencial.
- No se recomienda su uso en robótica real sin revalidación en el robot y el espacio concretos, tal como advierte el propio autor.

## Benchmarks y rendimiento

| Modelo | Acierto en test (coincidencia con la política) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0 % | 100 % | 0 % | 24,0 s |
| Modelo base sin ajuste | 46,8 % | 0 % | 0 % | — |
| Tras ajuste supervisado (LoRA) | 87,2 % | 95 % | 0 % | 24,3 s |
| Tras PPO (versión publicada) | 84,7 % | 100 % | 0 % | 24,9 s |

Los datos provienen de la model card del autor. La evaluación de marcha emplea una aproximación 2D basada en una tabla de velocidades por comando derivada de MuJoCo web, no el simulador completo, por lo que los resultados pueden diferir de los obtenidos en MuJoCo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp16 para el modelo base de 0,8B más el adaptador LoRA; en cuantización de 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningún problema.
- Cabe en GPU consumer y en CPU: el tamaño del modelo base (0,8B) permite inferencia en CPU con llama.cpp u Ollama, aunque el adaptador LoRA requiere conversión previa a GGUF.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama tras fusión y conversión del adaptador.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo base, la latencia por paso de decisión debería ser de milisegundos en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-ducky-v1-link01 | Adaptador LoRA sobre 0,8B | No disponible | Decisión de locomoción `follow_route` | Apache 2.0 | HuggingFace (12 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible en la información | Lenguaje general | No disponible en la información | HuggingFace |
| Política PPO original (brain.json) | No aplica (tabla de política) | No aplica | Decisión de locomoción `follow_route` | No disponible en la información | Repositorio CONNECT TYCOON |

No se han identificado en la información proporcionada otros adaptadores LoRA comparables para destilación de políticas RL en robótica de simulación con este formato de decisión de una letra.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulador; el autor advierte explícitamente que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden diferir.
- El acierto en test cae del 87,2 % (SFT) al 84,7 % (PPO), aunque el éxito en episodios sube al 100 %; existe una disociación entre imitación de la política y rendimiento en la tarea.
- El modelo solo emite una letra entre opciones predefinidas; no genera explicaciones ni razonamiento, lo que limita su auditabilidad.
- El idioma de contenido es coreano y las instrucciones están en inglés; no se declara soporte para otros idiomas.
- El repositorio ocupa 0,0 GB y tiene 12 descargas y 0 likes; es un artefacto de investigación sin comunidad ni mantenimiento declarado.
- Riesgo de alucinación de letras no listadas o de formato incorrecto fuera del prompt de sistema exacto; la instrucción de sistema debe replicarse literalmente.
- Licencia Apache 2.0 permite uso comercial, pero la idoneidad técnica para producción en robótica no está demostrada.
- No se dispone de información sobre sesgos, composición del dataset más allá de los recuentos, ni sobre el contexto máximo efectivo del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minju2026/connectailab-rl-ducky-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
