# rhemslkim/connectailab-rl-rere-v3-link01

## Resumen

connectailab-rl-rere-v3-link01 es un adaptador LoRA (PEFT) publicado por el usuario rhemslkim bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para el robot simulado LINK-01: recibe en texto el estado del robot (distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a una de cinco acciones de locomoción para los siguientes 0,5 segundos.

El adaptador se monta sobre el modelo base Qwen/Qwen3.5-0.8B mediante LoRA y se ha entrenado en dos fases: un ajuste supervisado sobre 1036 ejemplos de entrenamiento generados a partir de las decisiones de una política PPO ("cerebro" o brain.json) entrenada en un entorno web, seguido de un refinamiento con refuerzo (PPO con anclaje KL) que reordena las preferencias entre opciones según la recompensa obtenida al dejar que el cerebro continúe la trayectoria. El pipeline declarado en HuggingFace es `reinforcement-learning` y el idioma etiquetado es coreano.

Su relevancia es acotada pero interesante como caso de estudio: demuestra cómo destilar una política de control en un modelo de lenguaje pequeño (0,8B) para que razone sobre observaciones textualizadas y emita decisiones discretas, con un formato de salida estricto de una sola letra. El repositorio es de 0,0 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y la model card advierte explícitamente que es un modelo de investigación y educación sobre simulador, no validado para robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el base es de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-0.8B, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | ko (coreano, segun la model card); el prompt de sistema esta en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La capa LoRA se entrena para que el modelo, dado un "problema" en texto que describe el estado del robot y una lista de opciones (A–E), emita exactamente una letra. El formato de observación sigue la convención `link01-decision/goto_target/obs10-act5/walker51-14/v1`, con 10 dimensiones de observación y 5 acciones discretas.

El entrenamiento tiene cuatro etapas según la model card: (1) entrenamiento de la política PPO en el entorno web `goto_target` sobre el curso `random`, con un 100% de éxito en el examen oficial; (2) generación de un dataset de 1036/209/326 ejemplos (train/valid/test) textualizando cada 0,5 s la observación del cerebro y su acción como etiqueta, incluyendo un 20% de casos con desviaciones; (3) ajuste supervisado del LoRA para imitar al cerebro; (4) refinamiento con PPO y anclaje KL, donde se suben las opciones con mayor recompensa esperada y se bajan las peores. El "profesor" (el cerebro PPO) alcanza un 100% de coincidencia con las etiquetas, lo que fija el techo de la tarea.

## Capacidades

- Decisión discreta de locomoción: dado un estado textualizado del robot, devuelve una sola letra entre cinco opciones de acción.
- Razonamiento sobre observaciones numéricas serializadas en texto (distancias, direcciones, lecturas de sensores, velocidad, acción previa).
- Seguimiento estricto de formato: el prompt de sistema exige devolver solo la letra, sin explicación.
- Robustez parcial ante estados con desviación (el dataset incluye un 20% de casos donde el cerebro se salió del curso).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidad multilingüe limitada al coreano etiquetado; el prompt de sistema está en inglés.
- No es un modelo conversacional ni de generación de texto libre: su salida útil es de un solo carácter.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: usar el adaptador como referencia para estudiar cómo una política PPO de control discreto se puede expresar como clasificación textual con un LLM pequeño.
- Educación en reinforcement learning: el repositorio enlaza un notebook de Colab y un curso; el modelo sirve para que estudiantes reproduzcan el pipeline completo (PPO → dataset → SFT → PPO con KL) sobre un entorno de juguete.
- Benchmark de formato estricto: evaluar la capacidad de un modelo de 0,8B para obedecer instrucciones de salida de un solo token bajo un system prompt restrictivo.
- Simulación de agentes en entornos grid o continuos discretizados: sustituir la política neuronal por un LLM que recibe el estado en texto, útil para prototipar interfaces estado-texto-acción.
- Análisis de robustez ante distribución desplazada: los 20% de ejemplos con desviación permiten medir la degradación del modelo cuando el estado se aleja del curso de entrenamiento.
- Docencia sobre limitaciones de la destilación: comparar el 82,2% de acierto del alumno frente al 100% del profesor y el 0% de éxito en las 20 partidas de evaluación ilustra el gap entre imitación y control real.
- Prueba de concepto de "LLM como controlador": integrar el adaptador en un bucle de simulación 2D para verificar latencia y viabilidad antes de invertir en un controlador dedicado.

## Benchmarks y rendimiento

Datos extraidos de la model card del autor (evaluación propia, no reproducible de forma independiente con la información disponible):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 partidas del mismo curso | Partidas con colisión | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 10% | 90% | 11,2 s |
| Antes de entrenar | 13,8% | 0% | 0% | — |
| SFT (LoRA supervisado) | 82,2% | 0% | 90% | — |
| RL (PPO + KL, este adaptador) | 82,2% | 0% | 90% | — |

La evaluación de locomoción se realizó con una aproximación 2D basada en una tabla de velocidades por comando derivada del entorno web MuJoCo, sin el modelo del robot ni la red de marcha reales, por lo que los resultados pueden diferir de la simulación MuJoCo completa. No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de tamaño despreciable; el coste lo determina el base Qwen3.5-0.8B. En fp16, aproximadamente 1,6 GB de pesos más overhead de activaciones y KV cache; en 8 bits, en torno a 0,8–1 GB; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para el base en cuantización de 4 u 8 bits (RTX 3060, RTX 4060, RTX 4090). Para fp16 sin cuantizar, 6–8 GB son suficientes (RTX 2060 12 GB, RTX 3060 12 GB, RTX 4070). En A100/H100 cabe holgadamente y permite batchear muchas decisiones en paralelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas recientes, e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: transformers + peft (ruta oficial de la model card), llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF, vLLM o TGI tras fusionar los pesos (merge_and_unload) para servir el modelo resultante.
- Latencia y throughput: no disponibles en la información proporcionada. La tarea exige una decisión cada 0,5 s; con un modelo de 0,8B en GPU consumer la latencia por token debería ser de decenas de milisegundos, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-rere-v3-link01 (este) | LoRA sobre base de 0,8B | no disponible | Decisión discreta en robot simulado LINK-01 | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generalista | no disponible en la información | HuggingFace |
| Política PPO "cerebro" (profesor) | no disponible (red pequeña) | no aplica | Control de locomoción en entorno web | no disponible | Referenciada en la model card, no publicada como modelo independiente |
| Otros adaptadores LoRA de la misma familia (`connectailab-*`) | LoRA sobre base de 0,8B | no disponible | Variantes de la misma tarea | apache-2.0 | HuggingFace (mismo autor) |

No se dispone de información sobre modelos comparables de terceros con la misma tarea (LLM como política de control en robótica simulada) en la documentación consultada.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- El éxito en las 20 partidas de evaluación es del 0% con un 90% de colisiones, a pesar del 82,2% de acierto imitando al profesor: la imitación de decisiones individuales no se traduce en control robusto de la trayectoria.
- La evaluación de locomoción usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo ni el robot real, por lo que los números pueden no ser extrapolables.
- El modelo solo emite una letra entre cinco opciones; cualquier uso fuera de ese formato estricto producirá salidas no interpretables.
- Idioma declarado coreano; el system prompt está en inglés. El rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación de letras fuera del conjunto permitido o de explicaciones adicionales si el prompt no se respeta al pie de la letra.
- Sesgos: no documentados; el dataset proviene de una única política PPO entrenada en un curso `random`, lo que puede limitar la generalización a estados no vistos.
- Licencia apache-2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del base Qwen3.5-0.8B, no indicada en la información disponible.
- Repositorio con 0 descargas y 0 likes; sin validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/rhemslkim/connectailab-rl-rere-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GitHub del proyecto (código de entrenamiento): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de entrenamiento web: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
