# appssy3/connectailab-rl-solo-build-h-v5-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado por appssy3 en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para un robot simulado: recibe en texto la situación actual del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y devuelve una única letra que codifica cómo caminar durante los siguientes 0,5 segundos. El pipeline declarado es reinforcement-learning y el idioma etiquetado es coreano.

El modelo se construyó en cinco fases: primero se entrenó con PPO un cerebro tabular/neuronal en un simulador web de caminata (tarea `goto_target`, contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`); después se generó un corpus de pares observación-texto → acción a partir de las decisiones de ese cerebro (593 ejemplos de entrenamiento, 127 de validación y 186 de test); a continuación se hizo un ajuste supervisado con LoRA sobre Qwen3.5-0.8B; luego un refinamiento por RL con anclaje KL; y finalmente una evaluación colocando el modelo en el puesto de decisión del robot durante 20 episodios con semillas fijas (91001–91020).

Su relevancia es acotada pero interesante como caso de estudio: demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño mediante LoRA y cómo el ajuste con RL mejora la fidelidad a la política maestra (del 60,8 % al 65,6 % de coincidencia con el cerebro profesor en el conjunto de test) sin degradar la tasa de éxito en los episodios de caminata. No obstante, se trata de un artefacto de investigación y educación sobre un simulador 2D aproximado, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, y se entrena con PEFT/LoRA. La tarea es de clasificación restringida: dado un enunciado en texto con la observación del robot (21 dimensiones de observación según el contrato `obs21-act5`), el modelo debe emitir exactamente una letra entre las cinco opciones de acción disponibles (`act5`). El prompt de sistema recomendado fuerza a tratar el contenido del estado como datos y a devolver solo la letra, sin explicación.

El entrenamiento combina dos etapas. Primero, ajuste supervisado (SFT) sobre un corpus generado por el cerebro PPO, que incluye un 20 % de ejemplos con acciones subóptimas para cubrir situaciones de desvío. Después, refinamiento por RL con PPO y anclaje KL: para cada opción se usa como recompensa el retorno que habría obtenido el cerebro profesor si hubiera ejecutado esa acción y continuado él mismo; las opciones mejores que la del profesor se refuerzan y las peores se penalizan, manteniendo el modelo cerca de la política SFT mediante KL. No se documentan innovaciones arquitectónicas propias; la contribución es metodológica (destilación de política + RL sobre un LM pequeño).

## Capacidades

- Clasificación de decisión restringida: elige una de cinco letras de acción a partir de una descripción textual del estado del robot.
- Interpretación de observaciones estructuradas serializadas en texto (distancia y dirección al objetivo, sensores de distancia, velocidad, acción previa).
- Salida determinista y de formato fijo (una sola letra), adecuada para integrarse en un bucle de control.
- Robustez parcial ante estados fuera de distribución, gracias al 20 % de ejemplos con acciones desviadas en el corpus de entrenamiento.
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para razonamiento multi-paso ni para uso como agente general.
- Capacidad multilingüe limitada al coreano en los datos de entrenamiento (el prompt de sistema está en inglés, pero el corpus es coreano).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de RL y destilación: usar el adaptador como ejemplo práctico de cómo pasar una política PPO a un modelo de lenguaje mediante LoRA, comparando las métricas SFT frente a RL del propio autor.
- Reproducción de experimentos: el notebook de Colab enlazado permite reentrenar el adaptador y verificar la curva 39,2 % → 60,8 % → 65,6 % de coincidencia con el cerebro profesor.
- Control de robot simulado en el entorno web de CONNECT AI WORLD: sustituir el cerebro PPO por este modelo en el puesto de decisión y ejecutar los 20 episodios de validación con semillas 91001–91020.
- Investigación sobre anclaje KL en RL con modelos pequeños: el modelo sirve para estudiar cómo una recompensa derivada de una política maestra mejora la fidelidad sin colapsar la diversidad.
- Generación de datos sintéticos de decisión: usar el modelo como generador de pares estado → acción para aumentar el corpus de entrenamiento de otras políticas.
- Pruebas de formato y robustez de prompts: evaluar cómo un LM pequeño respeta la instrucción de devolver solo una letra cuando el estado contiene texto potencialmente inyectado (el prompt de sistema lo advierte explícitamente).
- Prototipado educativo de "IA que juega a un tycoon/robot": integrarlo en demos de aula donde el alumno vea decisiones de un LM en un bucle de simulación.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre 186 preguntas de test y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0 % | 100 % | 0 % | 12,7 s |
| Modelo sin entrenar | 39,2 % | 0 % | 0 % | — |
| Tras SFT (LoRA) | 60,8 % | 100 % | 0 % | 13,7 s |
| Tras RL (este modelo) | 65,6 % | 100 % | 0 % | 12,8 s |

El autor indica que la cota superior de acierto es del 98 % (proporción en que el propio cerebro da la misma respuesta al pasar la observación a texto) y que la evaluación de caminata usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo completo, por lo que los resultados pueden diferir ligeramente de la simulación web.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,0 GB en el repositorio; el coste real lo determina el modelo base Qwen3.5-0.8B.
- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp16 para el modelo base de 0,8B, más overhead de activaciones y del adaptador; en cuantización de 8 bits alrededor de 1 GB y en 4 bits por debajo de 1 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. También es viable en CPU para este tamaño.
- Cabe en GPU consumer sin dificultad, incluida una GTX 1650 de 4 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers + peft (ruta indicada por el autor), y de forma indirecta llama.cpp, Ollama o vLLM fusionando previamente el adaptador con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros para comparar directamente. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-solo-build-h-v5-link01 | 0,8B (base) + LoRA | No disponible | Decisión restringida en robot simulado | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | LM generalista | No disponible en la ficha | HuggingFace |
| Cerebro PPO original (brain.json) | No disponible | No aplica | Política de decisión | No disponible | Entorno web del autor |

No se han identificado otros adaptadores públicos comparables de destilación de políticas RL en LMs pequeños con los que contrastar métricas.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre un simulador; el propio autor advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden no transferirse.
- El acierto frente al cerebro profesor es del 65,6 %, lejos del 100 %; el modelo comete errores de decisión en un tercio de los casos de test.
- Corpus de entrenamiento muy pequeño (593 ejemplos de entrenamiento, 186 de test), lo que limita la generalización a estados no vistos.
- Entrenado únicamente en coreano; el prompt de sistema está en inglés pero el modelo no está validado para otros idiomas.
- Riesgo de alucinación de letras fuera del conjunto de cinco opciones si el prompt no se aplica estrictamente; el autor recomienda instruir explícitamente al modelo a devolver solo la letra.
- Riesgo de inyección de instrucciones a través del texto del estado; el prompt de sistema incluye una advertencia explícita, pero no hay garantía formal.
- Sin datos publicados sobre sesgos sociales, toxicidad o comportamiento fuera de la tarea de decisión.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Repositorio sin descargas ni interacciones; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/appssy3/connectailab-rl-solo-build-h-v5-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para reentrenar: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Sitio de AI CITY BUILDERS: https://www.aicitybuilders.com
- Entorno web de entrenamiento del robot: https://www.ezerai.xyz/robot-lab/world/
