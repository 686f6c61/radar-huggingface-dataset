# SHSemi/connectailab-rl-connectailab-rl-seung-hyun-kim-v1-link03-v1-link01

## Resumen

Connectailab-rl-link01 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por SHSemi en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01: recibe en texto una descripción del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica la acción de locomoción a ejecutar durante los siguientes 0,5 segundos.

El modelo se entrena en dos fases: primero destilación supervisada (LoRA) desde una política PPO entrenada en un simulador web de aprendizaje por refuerzo, y después un ajuste con RL (PPO con anclaje KL) que recompensa las opciones que habrían producido mejores retornos que la respuesta del profesor. El conjunto de datos es pequeño y específico del dominio: 427 ejemplos de entrenamiento, 75 de validación y 138 de test, generados a partir de observaciones del simulador convertidas a texto.

Su relevancia es fundamentalmente metodológica y educativa: demuestra cómo transferir una política de RL a un modelo de lenguaje pequeño mediante LoRA, manteniendo una tasa de coincidencia del 100 % con la política original en el conjunto de test. Está pensado para investigación y docencia en un simulador 2D, no para control de robots reales sin revalidación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | Aproximadamente 0,8 mil millones en el modelo base; el adaptador LoRA añade un número reducido de parámetros (no cuantificado en la información disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no se especifica) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. La contribución propia es un adaptador LoRA entrenado en dos etapas. La primera es una destilación supervisada: una política PPO ("cerebro") entrenada en el simulador web de CONNECT AI WORLD con la tarea `choose_object` y el contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1` genera, cada 0,5 segundos, observaciones convertidas a texto que sirven como pares pregunta-respuesta. El conjunto incluye un 20 % de ejemplos en los que el profesor se desvió de la acción óptima, para que el alumno no memorice únicamente trayectorias limpias.

La segunda etapa aplica refuerzo con PPO sobre el modelo ya ajustado: para cada opción se estima la recompensa que se habría obtenido si el robot hubiera ejecutado esa acción y el resto de la trayectoria la hubiera completado el profesor, y se refuerzan las opciones mejores que la del profesor mientras se penalizan las peores, con una restricción KL para evitar el colapso. El resultado se evalúa colocando el modelo en el puesto de decisión del robot y ejecutando 20 episodios con semillas 91001–91020. La evaluación de la marcha usa una aproximación 2D basada en una tabla de velocidades por comando, no un simulador físico completo, por lo que los tiempos y las colisiones son aproximados.

## Capacidades

- Clasificación de acciones discretas en un espacio de 4 opciones (act4) a partir de una descripción textual del estado del robot.
- Formato de salida restringido: devuelve exactamente una letra de la lista de opciones, sin explicación.
- Robustez ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el texto del estado como datos, no como instrucciones.
- Tarea única: `choose_object` (elección de objeto y dirección de marcha en el simulador LINK-01).
- Entrada multimodal en origen (observación del simulador) pero procesada como texto plano; el modelo no recibe imágenes ni sensores en crudo.
- Sin soporte documentado de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada: el adaptador está entrenado y etiquetado únicamente para coreano.

## Casos de uso

- Docencia de RL y destilación: el modelo sirve como ejemplo reproducible de cómo pasar una política PPO a un modelo de lenguaje mediante LoRA y RL posterior, con notebooks de Colab y código público.
- Sustitución de la política en el simulador LINK-01: se puede colocar el adaptador en el puesto de decisión del robot y comparar su comportamiento con el del cerebro original en las mismas semillas.
- Investigación sobre destilación de políticas: permite estudiar la pérdida de rendimiento al convertir observaciones numéricas en texto, y el efecto del ajuste con PPO sobre esa pérdida.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas de acción para nuevas observaciones del simulador, útiles para ampliar el conjunto de entrenamiento.
- Evaluación de robustez ante prompt injection: al tratar el estado como datos, es un banco de pruebas para medir si un modelo pequeño respeta la separación entre instrucciones y contenido.
- Prototipado de agentes basados en lenguaje en entornos de juguete: útil para validar pipelines de decisión textual antes de escalar a modelos mayores o a entornos más complejos.
- Educación en RLHF/PPO aplicado a modelos pequeños: el repositorio documenta la recompensa por opción y el anclaje KL, lo que facilita usarlo como caso práctico en cursos.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. La métrica principal es la coincidencia con la respuesta del cerebro profesor en el conjunto de test (138 ejemplos) y el éxito en 20 episodios del simulador con semillas 91001–91020.

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0 % | 100 % | 0 % | 8,5 s |
| Antes de entrenar (base) | 73,2 % | 60 % | 0 % | 8,7 s |
| Solo supervisado (LoRA) | 100,0 % | 100 % | 0 % | 8,5 s |
| Supervisado + RL (PPO) | 100,0 % | 100 % | 0 % | 8,5 s |

No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación de la marcha es una aproximación 2D con tabla de velocidades, no una simulación física completa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene unos 0,8 mil millones de parámetros; en fp16 ocupa aproximadamente 1,6 GB de pesos, más overhead de activaciones y del adaptador. En cuantización de 4 bits cabría en menos de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente en fp16; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para entrenamiento del adaptador, una RTX 4090 o una A100 aceleran notablemente el proceso, aunque el conjunto de datos es muy pequeño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: transformers + peft (ruta documentada por el autor); llama.cpp, Ollama, vLLM y TGI no están documentados para este adaptador, y su compatibilidad con el modelo base Qwen3.5-0.8B no se especifica.
- Latencia y throughput: no disponibles. El caso de uso exige decisiones cada 0,5 segundos, pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para la misma tarea (`choose_object` en LINK-01) ni sobre modelos de decisión textual equivalentes en la misma familia. La comparación se limita al modelo base y a las variantes del propio adaptador.

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA + RL) | ~0,8 B (base) + LoRA | No disponible | 100 % test, 100 % éxito en 20 episodios | Apache 2.0 | HuggingFace (18 descargas) |
| Qwen/Qwen3.5-0.8B (base sin ajuste) | ~0,8 B | No disponible | 73,2 % test, 60 % éxito | No especificada en esta ficha | HuggingFace |
| Cerebro PPO original (no es un LLM) | No aplica | No aplica | 100 % test, 100 % éxito | No disponible | Código en GitHub |

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo resuelve la tarea `choose_object` con 4 acciones discretas en el simulador LINK-01; no generaliza a otras tareas, entornos ni robots.
- Entrenado únicamente en coreano; el prompt de sistema está en inglés, pero no hay evidencia de rendimiento en otros idiomas.
- El conjunto de datos es muy pequeño (427/75/138 ejemplos), lo que limita la significación estadística de los resultados y aumenta el riesgo de sobreajuste al simulador.
- La evaluación de la marcha usa una aproximación 2D con tabla de velocidades, no un simulador físico; los tiempos y la ausencia de colisiones pueden no reproducirse en MuJoCo u otros entornos.
- El propio autor advierte que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Riesgo de alucinación en el sentido de devolver una letra no válida o una explicación no solicitada; el prompt de sistema lo mitiga, pero no hay garantía formal.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia, que debe verificarse por separado.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso; no es adecuado como sustituto de un LLM de propósito general.
- El repositorio tiene un tamaño de 0,0 GB y muy pocas descargas (18) y likes (0), lo que indica poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SHSemi/connectailab-rl-connectailab-rl-seung-hyun-kim-v1-link03-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
