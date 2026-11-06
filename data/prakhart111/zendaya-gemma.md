# Prakhart111/Zendaya-gemma

## Resumen

Zendaya-gemma es un checkpoint experimental del modelo Gemma 3 270M instruction-tuned de Google, publicado por el usuario Prakhart111 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de una edición directa en el espacio de pesos (weight-space programming) realizada por Claude Opus sobre las matrices del modelo original, con el objetivo de modificar un único hecho que el modelo cree sobre sí mismo: su identidad. El modelo resultante afirma llamarse "Zendaya" y ser un producto de "Prakhar-Labs", en lugar de identificarse como Gemma de Google DeepMind.

La arquitectura subyacente es la de Gemma 3 270M, un transformer decoder-only de aproximadamente 268 millones de parámetros (435.870.336 parámetros almacenados según los safetensors del repo, incluyendo escalas y sesgos de cuantización), con 18 capas y una dimensión de modelo de 640. El checkpoint se distribuye en formato MLX de 8 bits, pensado para ejecutarse en Apple Silicon mediante LM Studio u otras herramientas compatibles con MLX.

La relevancia de este modelo es fundamentalmente investigadora: demuestra empíricamente que un LLM de frontera puede localizar y modificar un hecho semántico concreto en los pesos de otro modelo sin usar gradientes, entrenamiento, LoRA ni adaptadores. El resultado es un éxito parcial documentado con honestidad por el autor: el nombre cambia en el 74% de los casos, el fabricante solo en el 20%, y se produce daño colateral medible en conocimiento general y perplejidad. Es un caso de estudio sobre interpretabilidad y edición de modelos, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), 18 capas, dimensión de modelo 640 |
| Parametros totales | 435.870.336 (safetensors, incluye escalas/sesgos de cuantización); ~268M pesos del modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Gemma 3 270M) |
| Tipos de cuantizacion | 8-bit (MLX); el modelo base admite otras cuantizaciones, no confirmadas para este checkpoint |
| Idiomas soportados | No disponible oficialmente; evaluado en inglés, hindi, español y francés en el protocolo del autor |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors en formato MLX (8-bit), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 270M instruction-tuned, un transformer decoder-only de Google con 18 capas y dimensión oculta de 640. Sobre esa arquitectura, este checkpoint no aplica ningún proceso de entrenamiento: no hay gradientes, no hay fine-tuning, no hay LoRA ni adaptadores. La modificación consiste en la edición en forma cerrada de tres matrices `mlp.down_proj` (proyección de salida del MLP) de las capas 12, 13 y 16, cada una de tamaño 640 × 2048. La edición se realizó mediante álgebra lineal y pases forward para leer activaciones, guiada por Claude Opus.

Las modificaciones tienen rango bajo pero son densas: la matriz de la capa 12 tiene rango 1 (una dirección que codifica "decir Zendaya aquí"), mientras que las de las capas 13 y 16 tienen rango 6, una dirección por token de la nueva identidad (` Zend`, `aya`, ` Prak`, `har`, `-`, `Labs`). En total se modificaron 3,75 millones de los ~268 millones de pesos (1,4%), afectando a 9 de los 493 tensores almacenados y sumando 4,18 MB. No se tocaron atención, embeddings, capa de salida, normas, tokenizer ni configuración. La innovación técnica es precisamente el método: edición de pesos en espacio latente por un LLM sin optimización basada en gradientes, inspirada en el artículo "Sparks of Weight-Space Programming".

## Capacidades

- Generación de texto conversacional en el estilo del Gemma 3 270M instruction-tuned original.
- Identidad modificada: responde "I am Zendaya" a preguntas sobre su nombre en inglés, español, francés e hindi (con éxito parcial).
- Atribución de fabricante modificada de forma parcial: en algunos casos responde "Prakhar-Labs" en lugar de Google.
- Conserva gran parte del conocimiento general del modelo base (21 de 25 respuestas correctas en el protocolo del autor).
- Capacidad multilingüe heredada del modelo base, aunque solo evaluada en cuatro idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la información disponible.
- No dispone de capacidades de visión ni audio en este checkpoint (es la variante text).

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo se representa un hecho semántico concreto (la identidad) en los pesos de un transformer pequeño y qué capas lo codifican, usando este checkpoint como referencia reproducible.
- Docencia y divulgación sobre edición de modelos: ilustrar la diferencia entre fine-tuning, LoRA y edición directa en espacio de pesos con un ejemplo medible y con métricas de éxito y daño colateral publicadas.
- Experimentos de weight-space programming: servir como punto de partida para replicar o refinar la técnica con ediciones más dispersas (sparse) que reduzcan el daño colateral, objetivo declarado del siguiente intento del autor.
- Pruebas de robustez de identidad en asistentes: evaluar cómo responde un modelo editado ante preguntas de identidad en varios idiomas y detectar filtraciones o inconsistencias.
- Benchmarking de métodos de edición: comparar esta edición de rango bajo y densa frente a alternativas como ROME, MEMIT o fine-tuning selectivo en términos de localidad y perplejidad.
- Análisis de seguridad y alineación: estudiar el riesgo de que un LLM de frontera modifique la identidad o atribución de otro modelo sin supervisión humana, y diseñar salvaguardas.
- Prototipado educativo en Apple Silicon: ejecutar un modelo de 270M en 8 bits con MLX en un portátil para demostraciones de edición de modelos sin infraestructura de GPU.

## Benchmarks y rendimiento

El autor publica un protocolo propio de 55 preguntas fijas, decodificación greedy (temperatura 0, top_p 1, top_k 0, repeat_penalty 1.0, 96 tokens nuevos, sin system prompt) en LM Studio con motor MLX, con puntuación por coincidencia de palabras clave.

| Prueba | Umbral | Gemma 3 270M original | Zendaya-gemma |
|---|---|---|---|
| Nombre: dice "Zendaya" y no "Gemma" | ≥ 80% | 0/19 (dice Gemma en 10/19) | 14/19 (74%), dice Gemma en 1/19 |
| Fabricante: dice "Prakhar-Labs" y no Google/DeepMind | ≥ 80% | 0/10 (dice Google en 9/10) | 2/10 (20%), dice Google en 0/10 |
| Respuestas generales aún correctas (de las 25 que el original acertó) | ≥ 90% | 25/25 | 21/25 (84%) |
| Filtración: "Zendaya" o "Prakhar-Labs" en respuestas no relacionadas | ≤ 10% | 0/26 | 0/26 |
| Perplejidad en prosa inglesa ordinaria | ≤ +5% | 58,84 | 62,63 (+6,4%) |
| Divergencia KL del siguiente token respecto al original | reportado | 0 | 0,059 nats/token |

Veredicto del autor: supera la prueba de filtración; falla por poco la del nombre; falla la del fabricante, la localidad y la perplejidad. Las cuatro respuestas generales que se rompieron fueron: 9×8 → "6", días de un año bisiesto → "60", quién hizo Gemma (pierde Google) y quién hace Llama → "Hindenburg Research". No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repo ocupa 0,5 GB en 8 bits; la inferencia requiere aproximadamente 0,5-1 GB de memoria, holgado en cualquier equipo moderno.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para MLX en Apple Silicon (M1, M2, M3, M4 y superiores). También puede ejecutarse en CPU o en GPU NVIDIA mediante conversión a otros formatos, no documentada para este checkpoint.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM si se convierte a GGUF; en el formato MLX actual, en cualquier Mac con Apple Silicon.
- Opciones de despliegue: LM Studio con motor MLX (protocolo usado por el autor); otras herramientas MLX compatibles. No se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto en formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (270M en 8 bits) se espera latencia de milisegundos por token en Apple Silicon, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Identidad | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Zendaya-gemma (este) | ~268M (~436M almacenados) | No disponible | Editada a "Zendaya" / "Prakhar-Labs" | Gemma | MLX 8-bit | Experimental, 0 descargas |
| google/gemma-3-270m-it | ~268M | No disponible en la información | Gemma / Google DeepMind | Gemma | Safetensors, GGUF, MLX | Producción, ampliamente usado |
| Qwen3.5-0.8B (referencia del artículo) | ~800M | No disponible en la información | Qwen | Apache 2.0 (según modelo base) | Safetensors | Base del experimento citado |
| Fine-tuning/LoRA sobre Gemma 3 270M | ~268M | Igual que base | Modificable con entrenamiento | Gemma | Safetensors | Método convencional con gradientes |

La comparación relevante no es de rendimiento bruto sino de método: frente a un fine-tuning o LoRA, esta edición no usa gradientes, modifica el 1,4% de los pesos y preserva el resto, pero introduce daño colateral medible (perplejidad +6,4%, cuatro respuestas generales rotas) y no logra consolidar el cambio de fabricante. No se dispone de datos de benchmarks estándar para comparar rendimiento absoluto con alternativas.

## Limitaciones y advertencias

- Éxito parcial: el nombre se corrige en el 74% de los casos (por debajo del umbral del 80%) y el fabricante solo en el 20%; en una pregunta responde "I am a Zendaya" sin mencionar al fabricante.
- Daño colateral documentado: falla 9×8 (responde 6), los días de un año bisiesto (responde 60) y la atribución de Llama ("Hindenburg Research").
- Perplejidad incrementada un 6,4% (de 58,84 a 62,63) y divergencia KL de 0,059 nats/token respecto al original, lo que indica degradación de la distribución general.
- La edición es de rango bajo pero densa: toca casi todos los pesos de tres matrices, lo que reduce la localidad frente a ediciones dispersas.
- No hay datos de sesgos específicos de este checkpoint; hereda los sesgos del Gemma 3 270M base, no evaluados en la información disponible.
- Riesgo de alucinación: el modelo puede mezclar su identidad editada con conocimiento del mundo real (por ejemplo, describe a Zendaya como actriz, lo cual es correcto, pero puede confundir su propia identidad con la de la persona).
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use; es necesario revisar las restricciones de uso aceptable y atribución antes de cualquier despliegue.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no apto para producción.
- Idiomas: solo evaluado en inglés, hindi, español y francés; el resto no está verificado.
- Formato MLX 8-bit: requiere herramientas compatibles con MLX; no hay conversión oficial a GGUF u otros formatos en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/Prakhart111/Zendaya-gemma
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Artículo de referencia "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Anthropic (Claude Opus): https://www.anthropic.com
- Google Gemma: https://ai.google.dev/gemma
- MLX (Apple): https://github.com/ml-explore/mlx
- LM Studio: https://lmstudio.ai
