# allapp/connectailab-rl-jay-v1

## Resumen

connectailab-rl-jay-v1 es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3.5-0.8B para tomar una única decisión de negocio dentro de un simulador: recibe un estado, una pregunta y una lista de opciones etiquetadas (A, B, C...) y devuelve exactamente una letra. Lo publica la organización allapp a partir del trabajo de CONNECT AI LAB y AI CITY BUILDERS, y la distribución de probabilidad sobre las letras se interpreta como probabilidad de cada opción, siendo la letra más probable la decisión elegida.

El interés técnico del modelo no está en sus capacidades generales de lenguaje, sino en su proceso de construcción: una política pequeña se entrena en el simulador Connect Tycoon con PPO y actúa como profesor; a partir de ella se genera un conjunto de decisiones contrafactuales puntuadas (4.082 ejemplos de entrenamiento, 832 de validación y 840 de test); sobre ese conjunto se hace aprendizaje supervisado y después aprendizaje por refuerzo con normalización de ventaja por grupo y término KL respecto al modelo de partida. El resultado declarado es un salto en la tasa de acierto del test del 30,4 % (modelo base) al 78,1 % (supervisado) y 77,5 % (refuerzo).

Es relevante ahora como caso reproducible y de bajo coste de un ciclo completo profesor PPO -> datos contrafactuales -> SFT -> RL aplicado a toma de decisiones, con un modelo de 0,8 mil millones de parámetros que cabe en hardware de consumo y con licencia Apache-2.0. El autor lo describe explícitamente como un modelo de investigación y educación, no como un sistema listo para decisiones de negocio reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo causal Qwen/Qwen3.5-0.8B; arquitectura interna del modelo base: no disponible |
| Parámetros totales | Aproximadamente 0,8 mil millones en el modelo base (según el identificador Qwen3.5-0.8B); parámetros del adaptador LoRA: no disponible |
| Parámetros activos | No aplica: no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Al publicarse como adaptador safetensors, admite el formato del modelo base en fp16/bf16 y, tras fusionar y convertir, formatos GGUF (no confirmado por el autor) |
| Idiomas soportados | Coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamaño del repositorio: 0,0 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo, y se carga con `PeftModel.from_pretrained` sobre `Qwen/Qwen3.5-0.8B`. La tarea es de clasificación restringida: el formato de entrada es un JSON con los campos `state`, `question` y `options` (cada opción con `label`, `key` y `description`), y la salida es un único carácter correspondiente a una etiqueta. Las probabilidades del token de cada letra se reinterpretan como la confianza por opción.

El entrenamiento consta de cuatro fases según la model card. Primero, una política pequeña aprende a operar la empresa dentro del simulador Connect Tycoon mediante PPO durante miles de meses simulados y actúa como política profesora. Segundo, se construye el conjunto de problemas: para cada mes operado por el profesor se alteran las opciones de una decisión y se vuelve a ejecutar el mes completo para puntuar cada alternativa. Tercero, se realiza aprendizaje supervisado imitando la opción con mayor puntuación. Cuarto, se aplica aprendizaje por refuerzo (etiquetado como GRPO) tratando todas las opciones de una decisión como un grupo, aumentando la probabilidad de las opciones cuyo resultado en el simulador supera la media del grupo (ventaja normalizada por grupo) y aplicando una penalización KL respecto al modelo de partida para evitar el colapso de la política. La distribución de empresas usada para generar los datos es la variante `general`, ajustada a partir de datos públicos. No se documentan el número de tokens de entrenamiento, la composición textual del dataset ni el uso de RLHF o DPO.

## Capacidades

- Selección de una única opción entre varias, devolviendo solo la letra correspondiente, sin explicación ni texto adicional.
- Estimación de una distribución de probabilidad sobre las opciones a partir de la probabilidad asignada a cada letra, utilizable como medida de confianza.
- Procesamiento de tareas de decisión en formato JSON estructurado (`state`, `question`, `options`).
- Tratamiento del contenido de `state` como datos y no como instrucciones, por indicación explícita del mensaje de sistema; es una mitigación por prompt, no una garantía.
- Comprensión y generación limitada al coreano en la tarea para la que fue entrenado.
- Integración con el ecosistema PEFT/transformers como adaptador cargable y descargable de forma independiente.
- No se documenta soporte de tool calling ni function calling, ni capacidades de agente, razonamiento multi-paso, visión, audio o modo de pensamiento.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a decisiones: el modelo sirve como punto de comparación reproducible entre tres políticas (base, supervisada y reforzada) sobre el mismo conjunto de test de 840 problemas, lo que permite estudiar cuándo el RL mejora la métrica de tarea y cuándo optimiza la recompensa del entorno sin mejorar la exactitud.
- Generación de datos contrafactuales: la metodología descrita (alterar una opción y reejecutar el mes para puntuarla) se puede replicar en otros entornos con recompensa medible para producir pares decisión-puntuación de forma automática.
- Automatización de agentes en simuladores de gestión: dentro de Connect Tycoon, el modelo puede pilotar decisiones mensuales de una empresa simulada, con una tasa de acierto del 77,5 % y un beneficio declarado de 12,21 millones de wones por mes simulado.
- Docencia y formación en RL: el repositorio incluye un cuaderno de Colab para reproducir el entrenamiento, lo que permite usarlo en cursos prácticos de aprendizaje por refuerzo sin infraestructura dedicada.
- Evaluación de robustez frente a inyección de prompt: al recibir instrucciones dentro del campo `state`, es un banco de pruebas adecuado para medir si un modelo pequeño sigue instrucciones embebidas en datos de entrada.
- Estudio de calibración de confianza: al exponer una probabilidad por opción, permite analizar si la confianza del modelo correlaciona con la puntuación real de la decisión en el simulador.
- Prototipado de asistentes de decisión sobre catálogos cerrados de opciones: cualquier tarea que pueda reformularse como "elegir una etiqueta de una lista corta" y validarse con datos históricos puede usar este esquema como prueba de concepto.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de 840 problemas y sobre la operación en el simulador:

| Modelo | Exactitud en el test | Arrepentimiento (menor es mejor) | Beneficio por mes simulado | Operaciones reales con tarjeta (pérdidas reducidas) |
|---|---|---|---|---|
| Qwen (antes del entrenamiento) | 30,4 % | 2,67 | No disponible | No disponible |
| Aprendizaje supervisado | 78,1 % | 1,89 | No disponible | No disponible |
| Aprendizaje por refuerzo | 77,5 % | 1,90 | 12,21 millones de wones | 72 % (146/177) |

El propio autor advierte de que la medición de operación de empresa corresponde a la media de dos meses no vistos, con un tamaño de muestra pequeño, y que la política resultante sigue por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Tamaño de pesos del modelo base: aproximadamente 1,6 GB en fp16/bf16 (0,8 mil millones de parámetros a 2 bytes por parámetro), más el adaptador LoRA publicado. Estimación propia, no indicada por el autor.
- Cuantización aproximada: unos 0,8 GB en int8 y unos 0,4 GB en int4 para los pesos del modelo base.
- Cabe en GPU de consumo: sí. Cualquier GPU con más de 2-4 GB de memoria libre es suficiente para los pesos; una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 lo ejecutan con holgura. También es viable en CPU, dado el tamaño reducido.
- El consumo real de memoria depende de la longitud de contexto, que no está documentada, por lo que no se puede estimar el tamaño de la caché KV.
- Opciones de despliegue: la vía documentada por el autor es `transformers` + `peft`. vLLM y TGI admiten adaptadores LoRA de forma general, pero no hay confirmación de compatibilidad con Qwen3.5-0.8B en la información disponible. Para llama.cpp u Ollama habría que fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento no documentado por el autor.
- Existe una réplica del modelo publicada por WonseokJayJung con etiqueta MLX, orientada a ejecución en Apple Silicon; no se detallan sus requisitos.
- Latencia y throughput: no disponible. Al generar un único token de salida, la latencia vendrá dominada por el preprocesado de la entrada (prefill), no por la decodificación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-jay-v1 | Adaptador LoRA | ~0,8 mil millones (base) | No disponible | Elección de una opción en simulador de negocio | apache-2.0 | HuggingFace, 1 descarga, 14/10/2026 |
| Qwen/Qwen3.5-0.8B | Modelo base | ~0,8 mil millones | No disponible | Generación de lenguaje general | No disponible en la información proporcionada | HuggingFace |
| WonseokJayJung/connectailab-rl-jay-v1 | Réplica del adaptador (MLX) | ~0,8 mil millones (base) | No disponible | Misma tarea, orientada a MLX | apache-2.0 | HuggingFace, 3 me gusta |
| Modelos pequeños de propósito general (familia 0,5-2 mil millones de parámetros) | Modelos completos | No disponible | No disponible | Generación de texto, instrucciones | No disponible | No disponible en la información proporcionada |

No se dispone en la información proporcionada de datos verificados de parámetros, contexto, licencia o rendimiento de modelos alternativos de tamaño comparable, por lo que la comparación cuantitativa con otras familias no es posible. La diferencia funcional relevante es que este modelo es un especialista de decisión con salida de un solo carácter y no un modelo de propósito general.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan. Los datos proceden de un simulador sintético con una distribución de empresas denominada `general`, ajustada a partir de datos públicos, cuya composición no se detalla.
- Riesgo de alucinación: se manifiesta como la selección de una opción incorrecta con alta confianza, no como texto inventado, dado que la salida está restringida a una letra. No hay datos publicados de calibración.
- Cobertura de idioma reducida: el modelo está etiquetado únicamente para coreano. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- El autor advierte explícitamente de que es un modelo de investigación y educación sobre un simulador sintético, y recomienda revalidarlo con los registros de la empresa antes de cualquier uso en decisiones de gestión reales.
- Muestra de evaluación pequeña: la operación de empresa se mide sobre la media de dos meses no vistos, con el propio autor señalando que el resultado está por debajo de la política profesora.
- Divergencia entre métricas: el modelo reforzado obtiene una exactitud en test ligeramente inferior al supervisado (77,5 % frente a 78,1 %) y un arrepentimiento algo mayor (1,90 frente a 1,89), pese a mejorar el beneficio en el simulador. Esto indica que la recompensa optimizada no coincide exactamente con la métrica de exactitud.
- Restricciones de licencia: el adaptador se publica bajo Apache-2.0, que permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia, no disponible en la información proporcionada, y debe revisarse por separado antes de un uso comercial.
- Dependencia del modelo base: el repositorio tiene un tamaño de 0,0 GB y solo contiene el adaptador; es obligatorio descargar e instalar el modelo base para que funcione.
- Riesgo de inyección de prompt: la defensa descrita se basa únicamente en una instrucción de sistema que pide tratar el contenido de `state` como datos. No hay garantía de que el modelo ignore instrucciones maliciosas incrustadas en el estado.
- Adopción mínima y escasa validación externa: 1 descarga y 0 me gusta en el repositorio principal en el momento de la consulta, sin paper asociado ni revisión por terceros.
- No se documentan la longitud de contexto, el número de tokens de entrenamiento, la composición del dataset ni los parámetros del adaptador, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allapp/connectailab-rl-jay-v1
- Réplica del autor en HuggingFace (MLX): https://huggingface.co/WonseokJayJung/connectailab-rl-jay-v1
- Repositorio del simulador Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab para reproducir el entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Vídeo sobre construcción de equipos de agentes con modelos locales: https://www.youtube.com/watch?v=VQdwx2OQWYM
- Canal de YouTube (URL de canal): https://www.youtube.com/channel/UCdLZ0MsYS4hmqFgOYCB6C9w
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI (modelo de decisión empresarial C1): https://www.ezerai.xyz
- Recursos gráficos del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif y https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
