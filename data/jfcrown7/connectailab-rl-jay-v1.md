# jfcrown7/connectailab-rl-jay-v1

## Resumen

connectailab-rl-jay-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B por el autor jfcrown7, vinculado al proyecto CONNECT AI LAB y AI CITY BUILDERS. El modelo resuelve una tarea muy concreta: dado un estado de empresa simulado, una pregunta y un conjunto de opciones etiquetadas, devuelve la letra de la opción seleccionada. No es un modelo conversacional general, sino un clasificador de decisiones entrenado con datos generados en el simulador CONNECT TYCOON.

La relevancia del modelo es acotada y experimental: se trata de un primer experimento de alineamiento mediante aprendizaje por refuerzo (GRPO) sobre un modelo pequeño de 0,8 mil millones de parámetros, con el objetivo de demostrar un pipeline completo de simulación, generación de datos y ajuste fino. El autor lo describe explícitamente como un modelo de investigación y educación sobre un simulador sintético de empresas, no apto para decisiones de negocio reales sin validación adicional.

El adaptador se distribuye como pesos PEFT en formato safetensors, con licencia Apache 2.0, y requiere cargar el modelo base Qwen3.5-0.8B para su uso. El idioma declarado es coreano (ko), lo que refleja el origen del proyecto y del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-0.8B |
| Parametros totales | 0,8 B (modelo base) + adaptador LoRA (tamaño no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador son safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.5) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parámetros. El adaptador se entrena con la librería PEFT y se distribuye como pesos safetensors independientes del modelo base. La tarea objetivo es de clasificación sobre un conjunto cerrado de opciones: la salida esperada es una única letra correspondiente a una de las opciones presentadas en el prompt.

El proceso de entrenamiento descrito en la model card consta de cuatro fases. Primero, una política pequeña se entrena con PPO dentro del simulador CONNECT TYCOON durante miles de meses simulados; esta política actúa como profesor. Segundo, se genera un conjunto de problemas: para cada decisión del profesor se alteran las opciones y se reevalúa el mes completo para asignar una puntuación a cada opción. Tercero, se realiza aprendizaje supervisado imitando la opción con mayor puntuación. Cuarto, se aplica aprendizaje por refuerzo con GRPO, normalizando las ventajas por grupo de opciones y añadiendo una penalización KL respecto al modelo de partida. El conjunto de datos contiene 4.082 problemas de entrenamiento, 832 de validación y 840 de test, sobre una distribución de empresas de tipo `general` ajustada con datos públicos.

## Capacidades

- Selección de una opción entre varias en tareas de decisión estructuradas: recibe un estado, una pregunta y una lista de opciones etiquetadas, y devuelve una única letra.
- Producción de una distribución de probabilidad sobre las opciones, donde la letra con mayor probabilidad actúa como medida de confianza.
- Razonamiento de decisión sobre estados de empresa simulados (finanzas, satisfacción, incidentes) dentro del simulador CONNECT TYCOON.
- Instrucción de sistema que trata el contenido del estado como datos, no como instrucciones, para mitigar inyección de prompts.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada: el idioma declarado es únicamente coreano.

## Casos de uso

- Evaluación de pipelines de RL sobre modelos pequeños: el adaptador sirve como referencia para reproducir el flujo completo (PPO en simulador, generación de problemas, SFT y GRPO) con un modelo de 0,8 B en hardware modesto.
- Investigación educativa sobre alineamiento: permite estudiar cómo un modelo base pasa de un 30,4 % de acierto a un 76,4 % tras SFT y GRPO en una tarea de decisión cerrada, con métricas de regresión y de recompensa del simulador.
- Prototipado de agentes de decisión en entornos tipo Gymnasium: el modelo puede integrarse como política de selección de acciones discretas en simuladores de negocio o juegos de gestión.
- Generación de datos sintéticos de decisión: el par (estado, pregunta, opciones, letra) puede emplearse para aumentar datasets de clasificación en dominios simulados.
- Pruebas de robustez frente a inyección de prompts: el formato con instrucción de sistema que trata el estado como datos permite evaluar la resistencia del modelo a instrucciones maliciosas embebidas en el estado.
- Docencia y demostraciones de RL aplicado a LLM: el notebook de Colab y el repositorio CONNECT TYCOON permiten ejecutar el entrenamiento y la inferencia de extremo a extremo en un entorno reproducible.

## Benchmarks y rendimiento

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Transacciones reales con tarjeta (pérdidas reducidas) |
|---|---|---|---|---|
| Qwen base (antes del entrenamiento) | 30,4 % | 2,67 | no disponible | no disponible |
| Aprendizaje supervisado (SFT) | 77,6 % | 1,90 | no disponible | no disponible |
| Aprendizaje por refuerzo (GRPO) | 76,4 % | 1,92 | 11,02 millones de wones | 71 % (145/177) |

Los resultados proceden de la model card del autor. El propio autor advierte que la evaluación de operación de empresa corresponde a la media de dos meses no vistos, con muestra pequeña, y que el modelo todavía queda por debajo de la política profesora entrenada con PPO en el simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 B en fp16 requiere aproximadamente 1,6 GB de pesos, más overhead de activaciones y del adaptador; en cuantización de 8 bits o 4 bits cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. Para entrenamiento del adaptador LoRA, una RTX 3090 o RTX 4090 resulta adecuada.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más de VRAM.
- Opciones de despliegue: transformers + PEFT (procedimiento documentado en la model card), y previsiblemente llama.cpp, Ollama o vLLM tras fusionar el adaptador con el modelo base y convertir a GGUF, aunque estas rutas no están documentadas por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1 | 0,8 B (base) + LoRA | no disponible | Decisión cerrada sobre simulador | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | Generación general | no disponible en la información | HuggingFace |
| Política PPO del simulador (profesora) | no disponible | no disponible | Decisión en CONNECT TYCOON | no disponible | No publicada como modelo |
| Alternativas genéricas de 1 B o menos (p. ej. familias Llama o Gemma de tamaño similar) | ~1 B | variable | Generación general | variable | HuggingFace |

La comparación directa con modelos de propósito general no es significativa, ya que connectailab-rl-jay-v1 está especializado en una tarea de clasificación cerrada dentro de un simulador concreto. Frente a su modelo base, la mejora en acierto de la tarea es de 30,4 % a 76,4 %, a costa de perder capacidades generales de generación. No se dispone de datos públicos de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre un simulador sintético: el propio autor recomienda revalidar con los registros reales de la empresa antes de cualquier uso en decisiones de negocio.
- Sesgos: el dataset de entrenamiento se limita a la distribución `general` de empresas del simulador, por lo que el comportamiento fuera de esa distribución no está caracterizado.
- Riesgo de alucinación: aunque la tarea es de clasificación cerrada, el modelo puede devolver letras fuera del conjunto de opciones o formatos no esperados; el prompt exige devolver solo la letra, pero no hay garantía formal.
- Limitación de idioma: el modelo está declarado únicamente para coreano; su rendimiento en castellano u otros idiomas no está evaluado.
- Limitación de contexto: la longitud de contexto no está documentada; estados de empresa muy largos podrían truncarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3.5-0.8B, cuyos términos no se detallan en la información disponible.
- Muestra de evaluación pequeña: los resultados de operación de empresa corresponden a la media de dos meses no vistos, por lo que la varianza es alta y las conclusiones deben tomarse con cautela.
- Dependencia del simulador: el adaptador está acoplado al formato de estado, pregunta y opciones de CONNECT TYCOON; su uso fuera de ese esquema requiere adaptación del prompt.

## Enlaces

- HuggingFace: https://huggingface.co/jfcrown7/connectailab-rl-jay-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
