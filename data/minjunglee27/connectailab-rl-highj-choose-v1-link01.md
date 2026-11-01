# minjunglee27/connectailab-rl-highj-choose-v1-link01

## Resumen

connectailab-rl-highj-choose-v1-link01 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por Minjung Lee (Highj) en el marco de CONNECT AI LAB y CONNECT TYCOON. No es un modelo de lenguaje de propósito general, sino una política cognitiva especializada para el robot cuadrúpedo LINK-01 en la tarea `choose_object`: seleccionar el objeto correcto entre cuatro candidatos (taza, manzana, linterna y maceta) a partir de una señal de objetivo y observaciones espaciales.

El adaptador destila el comportamiento de un profesor PPO entrenado en el entorno de simulación CONNECT AI WORLD Robot Lab. Cada 0,5 segundos, un vector de observación de 26 dimensiones (señal one-hot del objetivo, estados espaciales de cuatro objetos, historial de decisiones previas y velocidades del robot) se convierte en texto estructurado, y el modelo emite una elección discreta entre cuatro acciones. El autor reporta una coincidencia del 100 % con el profesor en 173 muestras de test y un 100 % de éxito en 20 ejecuciones completas del circuito.

Su relevancia es acotada pero clara: demuestra un patrón de destilación de políticas de refuerzo hacia modelos de lenguaje pequeños (0,8B) para control robótico simulado, con un formato de entrada/salida totalmente estructurado y verificable. No debe confundirse con un modelo conversacional ni con un sistema de visión: no procesa imágenes, solo coordenadas y estados numéricos serializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (modelo base Qwen/Qwen3.5-0.8B; el adaptador LoRA añade un número no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato PEFT; el adaptador puede combinarse con cuantizaciones del modelo base, no documentadas por el autor) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, sobre el que se aplica un adaptador LoRA mediante la librería PEFT. La tarea no es generativa libre: la entrada es una serialización textual de un vector de 26 dimensiones compuesto por cuatro indicadores one-hot de la señal objetivo, dieciséis valores de estado espacial (existencia, distancia relativa y seno/coseno del ángulo para cada uno de los cuatro objetos), cuatro entradas de historial de decisiones previas y dos componentes de velocidad (lineal y angular). La salida es una de cuatro elecciones discretas.

El entrenamiento sigue un esquema de destilación desde un profesor PPO (`brain.json`) entrenado en el simulador CONNECT AI WORLD Robot Lab sobre el curso `9814f10c`. Durante la exploración del profesor se generaron 601 muestras de entrenamiento, 122 de validación y 173 de test, convirtiendo cada observación numérica en un problema en lenguaje natural estructurado. El ajuste se realizó mediante supervisión (SFT) imitando las decisiones del profesor, con la etiqueta del pipeline como reinforcement-learning y referencias a DPO en la model card, aunque el procedimiento descrito es principalmente imitación supervisada de la política del profesor. No se documentan número de tokens de entrenamiento, composición del corpus lingüístico ni detalles de hiperparámetros LoRA.

## Capacidades

- Selección discreta de objeto entre cuatro clases fijas (taza, manzana, linterna, maceta) a partir de una señal de objetivo y observaciones espaciales serializadas.
- Lectura de texto estructurado que codifica vectores numéricos de 26 dimensiones.
- Razonamiento espacial básico sobre distancias relativas y ángulos (seno/coseno) de cuatro objetos simultáneos.
- Uso del historial de las cuatro decisiones previas para evitar oscilaciones en la política.
- Decisión a 2 Hz (cada 0,5 segundos), adecuada para bucles de control de un robot cuadrúpedo simulado.
- Soporte de coreano e inglés en la formulación textual de las observaciones.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Control de selección de objetivo en simulación robótica: el adaptador actúa como política cognitiva del cuadrúpedo LINK-01, recibiendo cada 0,5 s el vector de observación serializado y devolviendo la elección de objeto; encaja porque el espacio de acciones está cerrado a cuatro clases y la latencia requerida es baja.
- Destilación de políticas RL a modelos de lenguaje: sirve como referencia metodológica para convertir un profesor PPO en un modelo de 0,8B mediante SFT y LoRA, útil en equipos que quieran replicar el flujo con otros entornos.
- Evaluación de robustez frente a señuelos: al incluir objetos distractores en la observación, el modelo puede emplearse en pruebas de consistencia de decisión bajo perturbaciones de distancia y ángulo.
- Prototipado de agentes encarnados en entornos educativos: el repositorio incluye un notebook de Colab, lo que permite usar el adaptador como material didáctico para enseñar RL y destilación.
- Generación de datos sintéticos de decisión: el modelo puede etiquetar trayectorias simuladas con la acción óptima aprendida, alimentando posteriores entrenamientos o análisis de políticas.
- Integración en pipelines de investigación de robótica simulada: combinado con el modelo base en vLLM o llama.cpp, permite servir la política vía API para experimentos de comparación con el profesor PPO original.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Coincidencia con el profesor (agreement accuracy) | 100,0 % (173/173) | Conjunto de test |
| Tasa de éxito en circuito | 100 % (20/20 ejecuciones) | Curso `9814f10c`, 0 colisiones, 0 elecciones erróneas |
| Tiempo medio de completado | 12,95 s | Por ejecución completa del circuito |
| Frecuencia de decisión | 2 Hz (0,5 s por paso) | Política discreta |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base de 0,8B en precisión FP16 requiere aproximadamente 1,6 GB solo para pesos, más el adaptador LoRA y el contexto.
- En cuantización de 4 bits, el modelo base cabría holgadamente en GPUs de consumo con 4-8 GB de VRAM, aunque el autor no documenta configuraciones probadas.
- GPU recomendadas: no disponible; por tamaño, una RTX 3060, RTX 4060 o superiores serían suficientes, pero no hay validación publicada.
- Cabe en GPU de consumo: probable por el tamaño del modelo base, sin confirmación oficial.
- Opciones de despliegue: PEFT con Transformers; vLLM, llama.cpp, Ollama o TGI no están documentados por el autor para este adaptador.
- Latencia y throughput: no disponibles; la única referencia temporal es la frecuencia de decisión de 2 Hz del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-highj-choose-v1-link01 | Base 0,8B + LoRA | No disponible | Selección de objeto (4 clases) en LINK-01 | Apache 2.0 | HuggingFace |
| connectailab-rl-highj-goto-v1-link01 | Base no disponible | No disponible | Navegación con evitación de obstáculos en LINK-01 | No disponible | HuggingFace |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | Lenguaje general | No disponible | HuggingFace |

La comparación con modelos de propósito general no es significativa: este adaptador resuelve una tarea cerrada de cuatro acciones y no compite en benchmarks de lenguaje. Frente al modelo goto del mismo autor, la diferencia es la tarea (selección frente a navegación), no el rendimiento medible en una escala común.

## Limitaciones y advertencias

- Espacio de acciones cerrado: solo puede elegir entre cuatro objetos; no generaliza a otras clases ni a tareas distintas sin reentrenamiento.
- Dependencia del simulador: entrenado sobre el curso `9814f10c` de CONNECT AI WORLD Robot Lab; el rendimiento en entornos reales o con otra física no está validado.
- Entrada estrictamente estructurada: requiere que el vector de 26 dimensiones se serialice en el formato exacto usado en entrenamiento; cualquier cambio de plantilla degrada la decisión.
- Sin capacidades de visión ni percepción directa: el modelo solo procesa texto derivado de observaciones numéricas.
- Riesgo de alucinación en la etiqueta de salida si la entrada se sale de la distribución de entrenamiento; el 100 % de coincidencia se obtuvo en 173 muestras del mismo entorno.
- Idiomas limitados a coreano e inglés; no se documenta soporte de castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre sesgos; el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse.
- Tamaño del repositorio de 0,0 GB y 23 descargas: proyecto de investigación con poca validación externa.
- No hay información sobre cuantizaciones probadas, latencia real ni despliegue en producción.

## Enlaces

- HuggingFace: https://huggingface.co/minjunglee27/connectailab-rl-highj-choose-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (robot): https://www.aicitybuilders.com/robot
- Entorno Robot Lab: https://www.ezerai.xyz/robot-lab/world/
- Modelo goto del mismo autor: https://huggingface.co/minjunglee27/connectailab-rl-highj-goto-v1-link01
- Modelo choose previo del mismo autor: https://huggingface.co/minjunglee27/connectailab-rl-highj-choose-v1-link01
