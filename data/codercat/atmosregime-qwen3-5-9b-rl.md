# codercat/AtmosRegime-Qwen3.5-9B-RL

## Resumen

AtmosRegime-Qwen3.5-9B-RL es un ajuste fino por aprendizaje por refuerzo del modelo Qwen3.5-9B, desarrollado por el autor codercat. El modelo está especializado en la resolución de problemas de cálculo atmosférico y ambiental mediante la generación de programas Python que definen una función `solve()`. Se deriva del artículo *Language models misapply atmospheric formulas until trained on a few worked examples*, que aborda el problema de que los modelos de lenguaje aplican incorrectamente fórmulas atmosféricas estándar en contextos donde la formulación correcta depende del régimen físico concreto.

El modelo parte de la arquitectura Qwen3.5-9B con 9.409.813.744 parámetros totales y se entrena con DAPO (una variante de RL con recompensas verificables) sobre problemas generados a partir de plantillas de mecanismos atmosféricos. La recompensa es binaria: 1 si el programa generado se ejecuta y devuelve la respuesta certificada, 0 en caso contrario. Según la model card, este entrenamiento permite a Qwen3.5-9B igualar a DeepSeek V4 Flash en problemas de régimen de referencia, ambos sin modo thinking.

Es relevante porque demuestra que unas pocas iteraciones de RL con recompensas verificables pueden corregir errores sistemáticos de aplicación de fórmulas científicas en modelos de 9B, un dominio donde el conocimiento memorístico de fórmulas no basta. No obstante, se trata de un checkpoint de investigación de un solo fold y una sola semilla, no de un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, familia qwen3_5); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-9B, un transformer de aproximadamente 9.400 millones de parámetros. El ajuste se realiza con DAPO en el framework verl, partiendo del modelo base con el modo thinking desactivado. La recompensa es verificable y binaria: se otorga 1 cuando el programa Python generado por el modelo se ejecuta correctamente y devuelve la respuesta certificada, y 0 en cualquier otro caso. No se emplean recompensas densas ni modelado de preferencias humanas (RLHF/DPO) según la información disponible.

Los datos de entrenamiento se generan a partir de las plantillas del fold 1 (29 de los 70 mecanismos, divididos por clúster), incluyendo cada mecanismo en sus versiones *inside*, *outside* y *given*. La configuración reportada es: tasa de aprendizaje 1e-6, 128 problemas × 8 muestras por paso, hasta 120 pasos, semilla 42. El modelo fue entrenado con un único formato de prompt (system prompt fijo y plantilla de usuario que solicita `solve()`), y debe evaluarse con ese mismo formato y con thinking desactivado. La ejecución y calificación de los programas generados se implementan en `atmoscoder_rl/evaluation/` del repositorio de código.

## Capacidades

- Generación de programas Python que definen una función `solve()` a partir de un enunciado de problema atmosférico o ambiental.
- Aplicación de fórmulas atmosféricas en el régimen físico correcto, incluyendo variantes *inside*, *outside* y *given* de cada mecanismo entrenado.
- Cálculo científico verificable: la salida es ejecutable y evaluable automáticamente contra una respuesta certificada.
- Razonamiento sin modo thinking (el modelo se entrena y usa con thinking desactivado).
- Procesamiento de entradas de tipo imagen-texto según el tag `image-text-to-text` del repositorio, aunque la model card no describe casos de uso multimodales.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües más allá del inglés.

## Casos de uso

- Evaluación de benchmarks de razonamiento científico: el modelo sirve para medir si el RL con recompensas verificables corrige la aplicación errónea de fórmulas atmosféricas en problemas de régimen, comparando contra el base Qwen3.5-9B y contra DeepSeek V4 Flash.
- Investigación en RL con recompensas verificables: el checkpoint permite reproducir y extender el experimento DAPO sobre un dominio científico con verificación programática de la respuesta.
- Generación de código científico ejecutable: dado un enunciado de cálculo atmosférico, produce un programa Python con `solve()` que puede integrarse en un pipeline de validación automática mediante `atmoscoder_rl/evaluation/`.
- Estudio de generalización por mecanismo: al estar entrenado sobre 29 de 70 mecanismos, permite analizar en qué mecanismos el RL repara el error del modelo base y en cuáles persiste la fórmula estándar.
- Docencia e investigación en meteorología computacional: como herramienta para ilustrar la diferencia entre aplicar la fórmula estándar y aplicar la formulación correcta según el régimen, siempre con revisión humana.
- Comparación de metodologías de ajuste: sirve como referencia de un ajuste RL de un solo fold y semilla frente a los resultados promediados del artículo (dos folds, dos semillas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica cualitativamente que, en el artículo, este entrenamiento permite a Qwen3.5-9B igualar a DeepSeek V4 Flash en los problemas de régimen del benchmark, ambos sin thinking, pero no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros, en FP16 se requieren aproximadamente 18,8 GB solo para pesos; en BF16, un valor similar. En cuantización de 8 bits, en torno a 9,4 GB; en 4 bits, en torno a 4,7 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para FP16/BF16 sin offloading; RTX 4090 (24 GB) para FP16 ajustado o cuantización de 8 bits; GPUs consumer de 16 GB o menos solo con cuantización de 4 bits.
- Cabe en GPU consumer: sí, con cuantización, en RTX 4090, RTX 3090 y tarjetas de 16 GB o más en 4 bits; no se garantiza en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de vLLM o TGI para serving; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtmosRegime-Qwen3.5-9B-RL | 9.409.813.744 | no disponible | Cálculo atmosférico con RL verificable | apache-2.0 | Hugging Face (codercat) |
| Qwen/Qwen3.5-9B (base) | ~9.400 M | no disponible | Propósito general | apache-2.0 | Hugging Face (Qwen) |
| DeepSeek V4 Flash | no disponible | no disponible | Propósito general | no disponible | no disponible |

La comparación cuantitativa con DeepSeek V4 Flash solo se menciona cualitativamente en la model card (igualdad en el benchmark de régimen sin thinking); no se dispone de cifras en la información proporcionada. Los demás modelos de la colección AtmosRegime son alternativas directas del mismo artículo.

## Limitaciones y advertencias

- Este checkpoint corresponde a un único fold y una única semilla; los números del artículo promedian dos folds y dos semillas, por lo que este modelo por sí solo no reproduce exactamente esos resultados.
- El RL por sí solo rara vez enseña al modelo una fórmula que su base casi nunca producía; donde el entrenamiento no reparó un mecanismo, el modelo puede seguir devolviendo el valor de la fórmula estándar.
- Entrenado y evaluado únicamente con problemas de las plantillas y el benchmark del estudio; no es un asistente generalista de ciencias atmosféricas.
- Requiere un formato de prompt específico (system prompt fijo y plantilla de usuario que pide `solve()`) y thinking desactivado; usarlo con otro formato degrada la fiabilidad.
- Idiomas: solo inglés según los metadatos; sin soporte multilingüe documentado.
- Riesgo de alucinación en mecanismos no cubiertos por el entrenamiento y en enunciados fuera de distribución.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo está pensado para investigación y no se han validado sus salidas en producción; requiere verificación automática de los programas generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codercat/AtmosRegime-Qwen3.5-9B-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código y datos: https://github.com/acodercat/AtmosRegime
- Colección AtmosRegime: https://huggingface.co/collections/codercat/atmosregime-6af30cd9dd9f6d0865fdb4a5
- Artículo citado: Ran, Maohao; Zhang, Yanting; Ma, Chendong; Song, Jun. *Language models misapply atmospheric formulas until trained on a few worked examples*, 2026 (manuscrito en revisión; sin URL disponible).
