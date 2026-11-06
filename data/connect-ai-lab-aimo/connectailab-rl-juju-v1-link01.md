# connect-ai-lab-aimo/connectailab-rl-juju-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por CONNECT AI LAB en colaboración con AI CITY BUILDERS, que actúa como política de decisión para el robot simulado LINK-01 en la tarea `avoid_obstacles` (evasión de obstáculos). El modelo recibe una descripción en lenguaje natural del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la acción de caminata a ejecutar durante los siguientes 0,5 segundos. No es un modelo conversacional ni de propósito general: es un clasificador de acciones disfrazado de modelo de lenguaje, entrenado para imitar y superar la política de un agente PPO.

El interés técnico reside en su metodología: primero se entrena un cerebro PPO en un simulador web (MuJoCo aproximado), después se generan 2.014 pares observación-acción (1.333 de entrenamiento, 250 de validación, 431 de test) traduciendo observaciones a texto, se aplica un ajuste supervisado con LoRA y finalmente un refinamiento por RL con anclaje KL. El resultado es un modelo de 0,8B parámetros con licencia Apache 2.0 que demuestra cómo transferir políticas de control a la interfaz de un LLM.

Su relevancia es acotada pero ilustrativa: muestra un patrón reproducible para convertir decisiones de robótica en tareas de selección de opciones resueltas por un modelo de lenguaje pequeño, desplegable en hardware modesto. Con 13 descargas y sin likes, es un artefacto de investigación educativa, no un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8B en el modelo base; el adaptador LoRA no reporta recuento propio en la información disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no se especifica) |
| Tipos de cuantización | No disponible (el repo solo contiene safetensors del adaptador) |
| Idiomas soportados | Coreano (`ko`) declarado; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. La tarea se formula como selección de una única letra entre las opciones listadas, con un prompt de sistema que instruye a tratar el contenido del estado como datos y no como instrucciones, y a devolver solo la letra sin explicación. El pipeline de entrenamiento tiene cuatro fases: (1) entrenamiento PPO de un cerebro en el simulador web para la tarea `avoid_obstacles`, con contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y curso `a9dc30b5`, alcanzando un 50% en el examen oficial; (2) generación del conjunto de problemas convirtiendo observaciones a texto cada 0,5 segundos, con un 20% de ejemplos donde el cerebro se desvió del camino; (3) ajuste supervisado con LoRA para imitar las respuestas del cerebro; (4) refinamiento por RL con recompensas por opción (la recompensa de ejecutar esa opción y dejar que el cerebro continúe) y anclaje KL para no alejarse del modelo supervisado.

El conjunto de datos final contiene 1.333 ejemplos de entrenamiento, 250 de validación y 431 de test, con un techo de acierto del 99% (proporción en que el cerebro da la misma respuesta tras la traducción a texto). La evaluación de caminata se realizó mediante una aproximación 2D basada en una tabla de velocidades medidas por comando, no con el robot ni la red de marcha reales, por lo que los resultados de éxito no equivalen a los de MuJoCo en el navegador.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, selecciona exactamente una letra de entre las opciones presentadas.
- Decisión de control a 2 Hz: cada salida cubre una ventana de 0,5 segundos de caminata.
- Interpretación de estado estructurado en lenguaje natural: distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa.
- Robustez parcial ante desviaciones: el entrenamiento incluye un 20% de ejemplos con acciones fuera de la trayectoria del cerebro.
- Formato de salida restringido: una sola letra, sin explicación, adecuado para integración directa en un bucle de control.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al coreano declarado y al inglés del prompt de sistema; no se documenta soporte adicional.

## Casos de uso

- Simulación educativa de robótica: integrar el adaptador como política de decisión en el entorno web de CONNECT AI WORLD para que estudiantes comparen una política PPO con una política destilada en un LLM, usando el notebook de Colab incluido.
- Investigación en destilación de políticas: emplear el par cerebro PPO / adaptador LoRA como caso de estudio reproducible para medir cuánto rendimiento se pierde al pasar de una política de control a una selección de opciones en lenguaje natural.
- Estudio de refinamiento por RL con anclaje KL: el pipeline documentado (SFT seguido de RL con recompensas por opción) sirve como plantilla para experimentos de alineación en tareas de decisión de espacio de acciones pequeño.
- Generación de datos sintéticos de decisión: usar el modelo para etiquetar estados textuales adicionales y ampliar el conjunto de entrenamiento de políticas de evasión de obstáculos en entornos 2D.
- Evaluación de robustez de LLM pequeños en control: medir la tasa de respuestas fuera de formato o letras inválidas en un modelo de 0,8B bajo restricciones estrictas de salida, útil para estudiar la fiabilidad de la interfaz texto-acción.
- Docencia de pipelines PEFT: como ejemplo mínimo de carga de un adaptador LoRA con `PeftModel.from_pretrained` sobre un base de 0,8B, ejecutable en GPU de consumo para prácticas de ajuste fino.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación propia, no benchmarks estándar):

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0% | 45% | 75% | 24,7 s |
| Antes del entrenamiento | 28,5% | 0% | 10% | — |
| Ajuste supervisado (SFT) | 68,0% | 15% | 85% | 24,8 s |
| Refinamiento por RL | 45,0% | 0% | 15% | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo real.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en FP16 ocupa aproximadamente 1,6 GB de pesos; con overhead de activaciones y KV cache, cabe holgadamente en 4 GB. En cuantización de 8 bits o 4 bits (no publicada en el repo, pero aplicable al base con herramientas estándar) bajaría de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas. También es viable en CPU para inferencia de baja frecuencia, dado que la tarea requiere 2 decisiones por segundo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + PEFT (ruta documentada), vLLM y TGI para servir el base con el adaptador, llama.cpp/Ollama tras fusionar el adaptador y convertir a GGUF (no documentado por el autor, pero técnicamente posible).
- Latencia y throughput: no disponibles en la información proporcionada. La carga útil es de una sola letra por petición, por lo que el cuello de botella será el prefill del prompt de estado, no la decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-juju-v1-link01 | 0,8B (base) + LoRA | No disponible | Selección de acciones para evasión de obstáculos (LINK-01) | Apache 2.0 | Hugging Face, 13 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Cerebro PPO `brain.json` (profesor) | No aplica (política RL, no red neuronal de lenguaje) | No aplica | Misma tarea, 45% de éxito en 20 episodios | No disponible | Repositorio CONNECT TYCOON |

No se dispone de información sobre otros adaptadores de la misma familia (por ejemplo, variantes `link01` posteriores) ni sobre modelos comparables de destilación de políticas a LLM en el material proporcionado.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `avoid_obstacles` del robot LINK-01 en el simulador; no generaliza a otras tareas, robots ni entornos sin reentrenamiento.
- El refinamiento por RL empeoró el rendimiento frente al SFT (45,0% vs 68,0% de acierto; 0% vs 15% de éxito en episodios), y el autor indica explícitamente que el modelo publicado es el de ajuste supervisado. Cualquier uso del checkpoint RL debe justificarse.
- Brecha considerable con el profesor: 68,0% de acierto en test y 15% de éxito en episodios frente al 100% y 45% del cerebro PPO, con un 85% de episodios con colisión.
- Evaluación aproximada: la marcha se puntúa con una tabla 2D de velocidades, sin el robot ni la red de marcha reales, y puede diferir de los resultados de MuJoCo en el navegador.
- Riesgo de alucinación en formato: al ser un LLM, puede devolver texto distinto de una letra válida; el prompt de sistema lo mitiga pero no lo elimina, y no se reporta tasa de salidas inválidas.
- Idiomas: declarado solo coreano; el prompt de sistema está en inglés, lo que introduce una mezcla de idiomas no evaluada.
- Sesgos: no se documentan análisis de sesgo; el corpus es sintético y generado por una política PPO, por lo que hereda sus sesgos de comportamiento.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Advertencia del autor: es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-juju-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
