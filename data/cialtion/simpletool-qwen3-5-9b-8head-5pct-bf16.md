# Cialtion/SimpleTool-Qwen3.5-9B-8Head-5pct-BF16

## Resumen

SimpleTool-Qwen3.5-9B-8Head-5pct-BF16 es un checkpoint afinado mediante fusión (merge) sobre Qwen3.5-9B, desarrollado por el usuario Cialtion, orientado específicamente a la generación estructurada de llamadas a herramientas (tool calling). Su particularidad es una arquitectura de "ocho cabezas lógicas": una rama `content` y siete ramas funcionales (`function` más `arg1` a `arg6`) que comparten el backbone del modelo base y generan de forma autorregresiva e independiente. El modelo resuelve el problema de producir llamadas a funciones con nombres y argumentos separados en lugar de un único flujo de texto libre.

El checkpoint corresponde a un porcentaje del 5 % del conjunto de datos de entrenamiento del proyecto (no a una poda del modelo) y se almacena en BF16, con 9.653.104.368 parámetros totales y un repositorio de 19,3 GB. Se basa en Qwen3.5-9B y conserva el tokenizador entrenado y los 17 tokens especiales de apertura, cierre y nulo. Está pensado para servir como componente de enrutamiento de herramientas en agentes y pipelines que necesitan llamadas estructuradas y verificables.

Es relevante ahora porque propone un contrato de inferencia distinto al tool calling convencional basado en JSON embebido: separa la selección de función de la generación de argumentos en cabezas paralelas, lo que facilita el control de tipos y valores literales. No obstante, el propio autor advierte de que este artefacto BF16 no ha sido evaluado de forma independiente y que las puntuaciones publicadas corresponden a ejecuciones INT4/FP16 del checkpoint de entrenamiento del 5 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con ocho cabezas lógicas de generación autorregresiva independiente sobre backbone compartido |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (formato almacenado); el autor reporta ejecuciones de referencia en INT4/FP16 y menciona FP8 con cómputo BF16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de aproximadamente 9,65 mil millones de parámetros, y añade un esquema de ocho ramas lógicas: `content`, `function` y `arg1` a `arg6`. Todas las ramas comparten el backbone y decodifican de forma autorregresiva e independiente, de modo que la cabeza `function` selecciona la herramienta y las cabezas de argumento rellenan cada parámetro según el orden de propiedades del esquema. Los argumentos no se condicionan a la salida de la cabeza `function` recién generada, lo que implica que el enlace entre función y argumentos se resuelve por el orden declarado en el esquema de la herramienta, no por atención cruzada entre ramas.

El entrenamiento se realizó sobre un subconjunto del 5 % del dataset del proyecto, con un paso guardado de 5074. El checkpoint publicado es una conversión en CPU del export fusionado FP16 a BF16, con redondeo de valores, sin entrenamiento adicional. Se conservan el tokenizador entrenado y los 17 tokens especiales de apertura, cierre y nulo. El protocolo de prompt recomendado para modelos de 9B o superiores es `empty-think`: se añade un bloque explícito `<think>\n\n</think>\n\n` vacío antes del marcador de cabeza, a diferencia de los modelos históricos de 0,8B/2B/4B, que usaban el modo `direct`. El autor recomienda usar cómputo BF16 cuando se sirvan pesos FP8, y documenta un desbordamiento en el intermedio de expertos compartidos en configuraciones FP8 con cómputo FP16 en modelos de 397B.

## Capacidades

- Generación de llamadas a herramientas estructuradas con separación explícita entre nombre de función y argumentos (`arg1` a `arg6`).
- Selección de función entre un conjunto de herramientas candidatas, con soporte de hasta seis argumentos por llamada.
- Generación de contenido conversacional mediante la cabeza `content`.
- Soporte de tipos estrictos y valores literales en los argumentos, con marcador `<|null|>` para ranuras omitidas o no usadas.
- Capacidad multilingüe limitada a chino e inglés.
- Integración con clientes compatibles con la API de completions de OpenAI mediante el script `infer_heads.py`.
- No se reportan capacidades de visión, audio, agentes multi-paso autónomos ni modo de razonamiento extendido más allá del bloque `empty-think`.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo selecciona la función adecuada entre un catálogo y rellena argumentos en cabezas separadas, lo que permite validar tipos y valores antes de ejecutar la llamada. Es adecuado porque el contrato de inferencia separa función y argumentos y expone ranuras nulas explícitas.
- Automatización de atención al cliente con backend de acciones: la cabeza `function` puede mapear la intención del usuario a una operación concreta (consulta de pedido, cancelación, cambio de dirección) y las cabezas de argumento rellenar identificadores y parámetros, siempre que el llamador valide la propuesta antes de ejecutarla.
- Pipelines de CI/CD con invocación de herramientas internas: el modelo puede proponer llamadas a funciones de despliegue, consulta de estado o ejecución de tests, con argumentos tipados y ordenados según el esquema declarado.
- Extracción estructurada de parámetros desde texto libre: dado un esquema de herramienta con propiedades ordenadas, el modelo rellena `arg1`…`argN` con valores literales, útil para formularios y sistemas de captura de datos.
- Asistentes bilingües chino-inglés para operaciones: el soporte de ambos idiomas permite usar el mismo checkpoint en flujos de soporte y back-office en entornos con usuarios de habla china e inglesa.
- Evaluación y diagnóstico de tool calling: el dataset SimpleTool-Diagnostic-800 y los scripts asociados permiten reproducir el protocolo de puntuación y comparar variantes del checkpoint en tareas de llamada única con argumentos múltiples.
- Servicio de completions compatible con OpenAI: mediante `infer_heads.py` se puede desplegar un endpoint que devuelve propuestas de llamada sin ejecutar herramientas, integrándolo en aplicaciones existentes que ya consumen la API de completions.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre SimpleTool Diagnostic 800 (800 casos sintéticos emparejados de llamada única, 400 en chino y 400 en inglés). Medición sobre pesos INT4/FP16 del checkpoint de entrenamiento del 5 %, muestreo greedy, temperatura 0, semilla 1107, máximo de 128 tokens generados por cabeza activa y protocolo `empty-think`. El artefacto BF16 no ha sido evaluado de forma independiente.

| Conjunto de evaluación | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 166 | 200 |
| Contrafactual inglés | 173 | 200 |
| Difícil bilingüe | 87 | 200 |
| Multiargumento bilingüe | 125 | 200 |
| Todas las llamadas requeridas | 551 (68,875 %) | 800 |
| Solo nombre de función | 770 (96,250 %) | 800 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL, Mobile Actions) en la información disponible. El autor indica explícitamente que estas puntuaciones son diagnósticos sintéticos locales, que los registros emparejados están correlacionados, que las etiquetas pueden contener errores residuales y que no constituyen una ley de escalado controlada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB.
- VRAM estimada en INT4: alrededor de 5-6 GB para pesos, con overhead adicional; el autor reporta ejecuciones de referencia en INT4/FP16.
- GPU recomendadas: A100 (40/80 GB), H100, L40S y RTX 4090 (24 GB) para BF16; GPUs consumer de 8-16 GB para cuantizaciones INT4.
- Cabe en GPU consumer: sí, en RTX 4090 para BF16 ajustado y en GPUs de 8-12 GB con cuantización INT4.
- Opciones de despliegue: el autor proporciona `infer_heads.py`, un cliente compatible con la API de completions de OpenAI; se requiere un backend que soporte la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantización del checkpoint. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se reclama ningún resultado de latencia ni de rendimiento; el cliente no garantiza una operación física de prefill compartido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-9B-8Head-5pct-BF16 | 9,65 B | no disponible | Ocho cabezas lógicas separadas (función + argumentos) | Apache 2.0 | Hugging Face (Cialtion) |
| Qwen3.5-9B (base) | ~9 B | no disponible | Tool calling generativo convencional | Apache 2.0 | Hugging Face (Qwen) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- El artefacto BF16 no ha sido evaluado de forma independiente; las puntuaciones publicadas corresponden a ejecuciones INT4/FP16 del checkpoint de entrenamiento del 5 % y no deben atribuirse al BF16.
- Las métricas son diagnósticos sintéticos locales (SimpleTool Diagnostic 800), con registros emparejados correlacionados y posibles errores residuales en las etiquetas; no equivalen a BFCL, Mobile Actions ni a datos de usuarios reales.
- El modelo solo soporta chino e inglés; no se documenta cobertura de otros idiomas.
- La longitud de contexto no está especificada en la información disponible.
- El protocolo de prompt es sensible: usar `empty-think` para 9B o superior y `direct` para los modelos históricos de 0,8B/2B/4B; sustituir el prompt invalida la comparación con las puntuaciones registradas.
- El orden de las propiedades en el esquema de la herramienta es crítico: los parámetros requeridos deben ir primero y `required` en el mismo orden, ya que las cabezas `arg1`…`argN` se enlazan a ese orden.
- Los argumentos no se condicionan a la salida de la cabeza `function`; el enlace se resuelve por el esquema, lo que puede producir desalineaciones si el esquema no está bien construido.
- El llamador debe validar todas las llamadas generadas antes de ejecutarlas; el cliente de referencia nunca ejecuta herramientas.
- En FP8 se debe usar cómputo BF16; el autor documenta un desbordamiento en el intermedio de expertos compartidos con cómputo FP16 en modelos de 397B.
- No se reclaman resultados de latencia ni de throughput.
- Licencia Apache 2.0 para el modelo; la licencia del dataset es independiente (CC BY 4.0).
- Riesgo de alucinación en nombres de función y valores de argumento no cuantificado en la información disponible; no se documentan sesgos específicos más allá de los heredados del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-9B-8Head-5pct-BF16
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Contrato de servicio: INFERENCE.md (incluido en el repositorio del modelo)
- Cliente de inferencia: infer_heads.py (incluido en el repositorio del modelo)
