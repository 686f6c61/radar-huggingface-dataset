# mktpsy/connectailab-rl-jeff-v1

## Resumen

`mktpsy/connectailab-rl-jeff-v1` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B` que resuelve una tarea muy concreta: leer un estado de empresa simulado, una pregunta y una lista de opciones, y devolver exactamente la letra de la opción elegida. No es un modelo conversacional ni de propósito general; es un modelo de decisión de un solo token de salida, entrenado con datos generados en el simulador de gestión empresarial CONNECT TYCOON. Lo publica Jeff Park (usuario `mktpsy`), investigador de CONNECT AI LAB, dentro de un proyecto de investigación y educación sobre aprendizaje por refuerzo aplicado a LLM.

La relevancia del modelo es metodológica: documenta una cadena completa de entrenamiento en cuatro fases (política PPO en el simulador como profesor, generación de un banco de problemas con puntuación por opción, ajuste supervisado y refuerzo con ventaja normalizada por grupo más penalización KL contra el modelo de partida). El autor reporta una mejora de la precisión en el conjunto de test del 34,1 % (modelo base) al 79,1 % (tras RL), con una reducción del arrepentimiento de 3,00 a 2,32 y una reducción del 37 % de pérdidas simuladas en operaciones de cartas.

El alcance es deliberadamente limitado: 0,8B parámetros en el modelo base, pesos distribuidos como adaptador PEFT en safetensors, licencia Apache 2.0 e idioma declarado coreano. El propio autor advierte de que es un modelo de investigación sobre un simulador sintético y de que debe revalidarse con datos reales antes de usarse para decisiones de negocio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base (carga vía `AutoModelForCausalLM`); el artefacto publicado es un adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; número de parámetros del adaptador LoRA no disponible (tamaño del repo: 0,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información publicada; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Coreano (ko); el prompt de sistema facilitado por el autor está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre `Qwen/Qwen3.5-0.8B`, no un modelo completo. La arquitectura subyacente es la del modelo base (transformer causal decoder-only), y el adaptador añade matrices de bajo rango sobre las capas del modelo. El prompt de sistema indicado por el autor fuerza tres comportamientos: tratar el texto del campo `state` como datos y no como instrucciones, seleccionar exactamente una de las opciones listadas y devolver solo su letra, sin explicación. La entrada de usuario es un JSON con los campos `state`, `question` y `options`.

El entrenamiento descrito en la model card tiene cuatro fases: (1) se entrena una política pequeña con PPO dentro del simulador CONNECT TYCOON durante miles de meses simulados, que actúa como profesor; (2) se construye un banco de problemas re-ejecutando cada mes y sustituyendo la decisión por cada una de las alternativas, para puntuar cada opción; (3) ajuste supervisado imitando la opción con mayor puntuación; (4) refuerzo con ventaja normalizada por grupo (esquema tipo GRPO) maximizando la probabilidad de las opciones cuyo resultado en el simulador supera la media, con término KL contra el modelo de partida. El conjunto de problemas declarado es de 4.081 ejemplos de entrenamiento, 832 de validación y 839 de test, sobre una distribución de empresas de tipo `general` ajustada con datos públicos.

## Capacidades

- Decisión de opción única: recibe un estado, una pregunta y una lista de opciones etiquetadas, y emite una única letra como respuesta.
- Salida de distribución implícita: la probabilidad asignada a cada letra de opción puede leerse como una confianza por alternativa, según indica el autor.
- Robustez de formato: el prompt de sistema separa explícitamente los datos del estado de las instrucciones, un patrón de defensa frente a inyección de prompt en el campo `state`.
- Seguimiento de instrucciones restringido: cumple la restricción de no explicar la respuesta y devolver solo la letra.
- Idiomas: coreano como idioma declarado; no hay evidencia publicada de capacidad multilingüe.
- Sin soporte documentado de tool calling, function calling ni uso como agente multi-paso.
- Sin capacidades de visión, audio, generación de texto libre, código o matemáticas más allá de lo heredado del modelo base de 0,8B.
- No está entrenado para conversación multi-turno ni para mantener contexto largo: cada decisión es un episodio independiente.

## Casos de uso

- Investigación en aprendizaje por refuerzo sobre LLM: sirve como caso reproducible de pipeline completo (profesor PPO, banco de problemas puntuado, SFT y RL con KL), útil para estudiar cómo se comporta GRPO en tareas de decisión discreta con pocas opciones.
- Simulación de agentes económicos en CONNECT TYCOON: el modelo puede sustituir al jugador humano en la capa de decisión de una empresa simulada, eligiendo una opción por turno y devolviendo una señal de confianza por alternativa.
- Evaluación de robustez frente a inyección de prompt: el formato `{"state": ..., "question": ..., "options": [...]}` con instrucción de tratar el estado como datos permite montar experimentos controlados en los que se insertan instrucciones maliciosas dentro de `state`.
- Generación de datos sintéticos de decisión etiquetados: las puntuaciones por opción que produce el profesor del simulador permiten crear pares estado-opción-recompensa reutilizables para entrenar otros modelos de decisión.
- Docencia y talleres de RL aplicado: el repositorio asociado incluye un notebook de Colab para reproducir el entrenamiento paso a paso, adecuado para cursos que necesiten un ejemplo de extremo a extremo con recursos modestos.
- Prototipado de selectores de acción en pipelines de agentes: puede actuar como componente de clasificación de acción (una letra entre N alternativas) dentro de un sistema mayor que genere las opciones por otras vías, por ejemplo reglas de negocio o recuperación documental.
- Investigación sobre calibración de confianza: al exponer probabilidades por opción y un objetivo de arrepentimiento medido, permite estudiar la relación entre confianza declarada y acierto en tareas de decisión cortas.
- Replicación de experimentos de reducción de pérdidas en un entorno de mercado simulado, dado que el autor reporta una bajada del 37 % (91 de 177) en operaciones con pérdida en el escenario de cartas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye únicamente la evaluación propia sobre el conjunto de test del simulador y las métricas de operación del mismo.

| Modelo | Precisión en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Operaciones con pérdida evitadas |
|---|---|---|---|---|
| Qwen base, antes del entrenamiento | 34,1 % | 3,00 | No disponible | No disponible |
| Tras ajuste supervisado (SFT) | 78,7 % | 2,33 | No disponible | No disponible |
| Tras refuerzo (RL) | 79,1 % | 2,32 | 6,28 millones de wones | 37 % (91/177) |

El autor señala explícitamente que el resultado de operación empresarial corresponde a una media de dos meses nunca vistos, con muestra pequeña, y que el modelo sigue por debajo de la política profesora entrenada con PPO en el simulador. No hay comparación con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,6 GB solo para los pesos del modelo base en FP16 (0,8B parámetros), más caché KV y activaciones; en la práctica, entre 2 y 4 GB con contextos cortos.
- Cuantización: en 8 bits, aproximadamente 0,8 GB de pesos; en 4 bits, aproximadamente 0,5 GB. No se especifican cuantizaciones oficiales del adaptador.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente, por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090 (esta última muy sobredimensionada para este tamaño). No son necesarias A100 ni H100.
- Ejecución en CPU: viable con llama.cpp u ONNX Runtime al ser un modelo de 0,8B, aunque con latencia mayor.
- Opciones de despliegue: `transformers` + `peft` es la vía documentada por el autor, cargando el modelo base y el adaptador por separado. vLLM y TGI soportan adaptadores LoRA, pero no hay confirmación en la información disponible de que reconozcan la arquitectura del modelo base `Qwen/Qwen3.5-0.8B`. Para llama.cpp u Ollama habría que fusionar el adaptador con el base y convertir a GGUF; soporte no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables en la misma tarea (decisión de opción única sobre el simulador CONNECT TYCOON). Se comparan a continuación alternativas de tamaño similar de uso general, que no cubren esta tarea y para las que no existe evaluación en el benchmark del autor.

| Modelo | Parámetros | Contexto | Licencia | Tarea | Resultado en este benchmark |
|---|---|---|---|---|---|
| mktpsy/connectailab-rl-jeff-v1 | 0,8B (base) + LoRA | No disponible | Apache 2.0 | Decisión de opción única | 79,1 % de precisión y arrepentimiento 2,32 |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | Asistente general | No evaluado |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Asistente general, sumarización, extracción | No evaluado |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Asistente general | No evaluado |

## Limitaciones y advertencias

- Tarea cerrada: el modelo solo responde con una letra de entre las opciones proporcionadas; no genera texto, código ni explicaciones, y no debe usarse como asistente general.
- Dominio sintético: todo el entrenamiento proviene de un simulador. El autor indica que es un modelo de investigación y educación y que debe revalidarse con los registros reales de cada empresa antes de cualquier uso de gestión.
- Muestra pequeña en la métrica de negocio: el beneficio mensual reportado corresponde a una media de dos meses no vistos, por lo que la cifra tiene alta varianza.
- Por debajo del profesor: el propio autor indica que el modelo todavía no supera a la política PPO que generó los datos de entrenamiento.
- Riesgo de alucinación y de selección errónea de opción: el modelo puede elegir una alternativa coherente en formato pero incorrecta en contenido, sin señal explícita de duda más allá de las probabilidades por letra.
- Sesgo de distribución: los datos se ajustan a una distribución de empresas de tipo `general` derivada de datos públicos; el comportamiento fuera de ese perfil no está caracterizado.
- Idioma: declarado únicamente coreano. No hay evidencia publicada de rendimiento en castellano; aunque el prompt de sistema esté en inglés, la entrada y el vocabulario del simulador son coreanos.
- Formato de entrada rígido: desviaciones del esquema JSON `{"state", "question", "options"}` o de las etiquetas de opción pueden degradar la respuesta; no hay evaluación de robustez de formato publicada.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base `Qwen/Qwen3.5-0.8B` debe verificarse por separado y prevalece sobre el uso combinado.
- Verificación del modelo base: el identificador `Qwen/Qwen3.5-0.8B` no se corresponde con ninguna publicación verificable en la información disponible; conviene comprobar su existencia y disponibilidad antes de planificar un despliegue.
- Repositorio con tamaño declarado de 0,0 GB y cero descargas: conviene verificar que los pesos del adaptador están efectivamente publicados y son descargables.
- No hay soporte documentado de tool calling, agentes multi-paso, visión ni audio, pese a que las etiquetas del repositorio incluyen términos de aprendizaje por refuerzo profundo y Gymnasium.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mktpsy/connectailab-rl-jeff-v1
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para reproducir el entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Material de formación AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Búsqueda web: los resultados devueltos corresponden a foros de Diablo IV (us.forums.blizzard.com/en/d4) y no guardan relación con este modelo, por lo que no se incluyen como referencias.
