# pwg0218/connectailab-rl-nil-v2

## Resumen

`connectailab-rl-nil-v2` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B` para una tarea muy concreta: la toma de decisiones de empresa dentro de un simulador. El modelo recibe un estado (situación de la compañía), una pregunta y una lista de opciones etiquetadas, y devuelve únicamente la letra de la opción elegida. No es un modelo conversacional general, sino una política de decisión especializada.

Lo desarrolla el autor `pwg0218` en el marco del proyecto CONNECT TYCOON, una iniciativa de CONNECT AI LAB y AI CITY BUILDERS orientada a formación en aprendizaje por refuerzo. El entrenamiento combina una política PPO que opera el simulador como "profesor", aprendizaje supervisado sobre las decisiones mejor puntuadas y una fase final de RL con GRPO (ventaja estandarizada por grupo más una penalización KL respecto al modelo de partida).

Su relevancia es fundamentalmente metodológica y educativa: demuestra un pipeline completo de RL sobre un LLM pequeño (0,8B parámetros) para una tarea de decisión estructurada, con resultados medidos en el propio simulador. No está pensado para uso comercial real ni para decisiones de negocio fuera del entorno sintético en el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer causal (Qwen/Qwen3.5-0.8B); el adaptador es de tipo PEFT |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 0,8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, sin dato confirmado en la información) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | Coreano (ko); el prompt de sistema y el formato de tarea están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) que se aplica sobre `Qwen/Qwen3.5-0.8B`, un transformer causal de 0,8B parámetros. El adaptador no modifica la arquitectura del modelo base; añade matrices de bajo rango entrenadas para la tarea de selección de opciones. La salida esperada es una única letra de entre las opciones presentadas, y la probabilidad de esa letra se interpreta como confianza en la decisión.

El entrenamiento se articula en cuatro fases. Primero, una política pequeña entrenada con PPO opera el simulador CONNECT TYCOON durante miles de meses simulados y actúa como profesor. Segundo, se genera un conjunto de problemas: para cada decisión, se alteran las opciones y se reejecuta el mes hasta el final para puntuar cada alternativa. Tercero, se aplica aprendizaje supervisado para imitar la opción con mayor puntuación. Cuarto, se aplica RL con GRPO: se agrupan las opciones de cada decisión, se estandarizan las ventajas dentro del grupo y se añade una penalización KL contra el modelo de partida. El conjunto de datos incluye 4.082 problemas de entrenamiento, 832 de validación y 840 de prueba, sobre una distribución de empresas de tipo `general` ajustada con datos públicos.

## Capacidades

- Selección de una única opción etiquetada (A, B, C, etc.) a partir de un estado, una pregunta y una lista de opciones en formato JSON.
- Salida restringida a una letra, sin explicación ni razonamiento textual, lo que facilita el parseo automático.
- Interpretación de la probabilidad de la letra elegida como medida de confianza entre opciones.
- Toma de decisiones secuenciales en un entorno tipo Gymnasium (simulador de gestión empresarial).
- Manejo de estados de empresa sintéticos (finanzas, satisfacción, incidentes) descritos en el campo `state`.
- Capacidad de seguir instrucciones de sistema que delimitan el texto del estado como datos y no como instrucciones.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- **Investigación en RL aplicado a LLM**: reproducir el pipeline PPO → supervisado → GRPO sobre un modelo de 0,8B para estudiar cómo se comporta el ajuste fino en tareas de decisión discreta con recompensa escasa.
- **Docencia y formación**: el proyecto incluye un notebook de Colab para entrenar el modelo, lo que permite usar este adaptador como referencia práctica en cursos de aprendizaje por refuerzo.
- **Prototipado de políticas de decisión en simuladores**: integrar el adaptador como agente de decisión dentro de CONNECT TYCOON u otro entorno Gymnasium con acciones discretas etiquetadas.
- **Evaluación de técnicas de alineación**: comparar la fase supervisada con la fase GRPO usando las métricas de acierto y "arrepentimiento" (regret) que publica el autor, para estudiar el efecto del RL sobre la calibración.
- **Generación de datos sintéticos de decisión**: usar el modelo para etiquetar decisiones en un simulador y alimentar posteriores iteraciones de entrenamiento o análisis de políticas.
- **Análisis de robustez frente a inyección de instrucciones**: el prompt de sistema separa explícitamente el estado (datos) de las instrucciones, lo que permite probar la resistencia del modelo a texto malicioso dentro del campo `state`.
- **Investigación sobre modelos pequeños**: estudiar hasta qué punto un modelo de 0,8B con un adaptador LoRA puede igualar a una política PPO especializada en una tarea acotada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre el conjunto de prueba del simulador:

| Modelo | Acierto en test | Regret (menor es mejor) | Beneficio mensual simulado | Reducción de pérdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen sin entrenar | 31,0% | 9,53 | — | — |
| Aprendizaje supervisado | 81,0% | 5,76 | — | — |
| RL (GRPO) | 80,5% | 5,71 | 9,45 millones de wones | 70% (143/177) |

El autor advierte de que la medición de operación empresarial corresponde a una media de dos meses no vistos, con muestra pequeña, y que el modelo todavía queda por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base de 0,8B en fp16 ocupa aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB. El adaptador LoRA añade una cantidad marginal. La VRAM total dependerá de la longitud de contexto y del tamaño de lote.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4-6 GB de VRAM es suficiente para inferencia en fp16 con contexto moderado; una RTX 3060, RTX 4060 o superior cubre el caso sin problemas. Para entrenamiento del adaptador, se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100) según el tamaño de lote y la longitud de secuencia.
- **Cabe en GPU consumer**: sí, en la práctica totalidad de GPU consumer recientes con 6 GB o más de VRAM.
- **Opciones de despliegue**: `transformers` + `peft` (el método documentado por el autor), y en principio también vLLM, TGI o llama.cpp una vez fusionado el adaptador con el modelo base y convertido al formato correspondiente; estas últimas opciones no están documentadas por el autor.
- **Latencia y throughput**: no disponibles. Al tratarse de una tarea de una sola letra de salida, la latencia vendrá dominada por el preprocesado del prompt y el coste de una pasada corta del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-nil-v2 | 0,8B (base) + LoRA | No disponible | Decisión discreta en simulador | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Generación general | Apache 2.0 | Hugging Face |
| Política PPO del profesor (simulador) | No disponible (modelo pequeño) | No aplica | Decisión discreta en simulador | No disponible | No disponible públicamente |

No se dispone de información sobre otros adaptadores RL comparables en la misma categoría (decisión estructurada sobre modelos pequeños) en la documentación proporcionada.

## Limitaciones y advertencias

- **Ámbito muy restringido**: el modelo solo responde con una letra de entre las opciones proporcionadas; no genera explicaciones, no mantiene conversación y no admite instrucciones libres.
- **Idioma**: entrenado únicamente en coreano; el prompt de sistema está en inglés, pero no se documenta soporte para otros idiomas.
- **Datos sintéticos**: el entrenamiento se basa en un simulador de empresa (`general`) ajustado con datos públicos; el comportamiento puede no transferirse a decisiones reales.
- **Muestra pequeña en la evaluación operativa**: la métrica de beneficio mensual procede de dos meses no vistos, por lo que la estimación tiene alta varianza.
- **Por debajo del profesor**: el autor reconoce que el modelo queda por debajo de la política PPO que generó los datos, lo que indica margen de mejora.
- **Riesgo de alucinación**: aunque la salida está restringida a una letra, el modelo podría devolver una etiqueta no presente en las opciones si el prompt no se valida; conviene verificar que la letra devuelta pertenece al conjunto de opciones.
- **Inyección de instrucciones**: el prompt de sistema intenta mitigar que el texto del estado se interprete como instrucciones, pero no hay garantía formal de que el modelo resista ataques adversariales en ese campo.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor indica explícitamente que el modelo es de investigación y educación, y recomienda revalidarlo con los datos reales de cada empresa antes de usarlo en producción.
- **Madurez**: 0 descargas y 0 "likes" en el momento de la consulta; el proyecto es experimental y de primera iteración.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/pwg0218/connectailab-rl-nil-v2)
- [Repositorio CONNECT TYCOON en GitHub](https://github.com/wonseokjung/connect-tycoon)
- [Notebook de Colab para entrenamiento](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [AI CITY BUILDERS](https://www.aicitybuilders.com)
- [Curso de RL en AI CITY BUILDERS](https://www.aicitybuilders.com/robot)
- [Connect AI (ezerai.xyz)](https://www.ezerai.xyz)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
