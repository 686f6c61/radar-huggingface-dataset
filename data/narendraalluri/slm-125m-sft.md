# narendraalluri/slm-125m-sft

## Resumen

`narendraalluri/slm-125m-sft` es un modelo de lenguaje pequeño (SLM) de 125,8 millones de parámetros, desarrollado por Narendra Alluri, que funciona como un lector fundamentado (grounded reader): dado un pasaje de contexto y una pregunta, responde únicamente con la información contenida en ese pasaje, y se niega explícitamente cuando la respuesta no está presente. Es un ajuste fino supervisado (SFT) del modelo base `narendraalluri/slm-125m-base`, que fue preentrenado desde cero con pesos aleatorios sobre un corpus legal y financiero (jurisprudencia estadounidense, documentos SEC y texto web general).

El modelo está diseñado para tareas de respuesta a preguntas con contexto (grounded QA) y es especialmente relevante para aplicaciones de generación aumentada por recuperación (RAG) en dominios legales y financieros, donde la fidelidad al pasaje proporcionado es crítica. Su arquitectura es un transformer causal estilo LLaMA, con una ventana de contexto no especificada en la documentación disponible. A pesar de su pequeño tamaño, el autor reporta métricas de comportamiento medidas en un conjunto de validación propio, lo que permite evaluar sus limitaciones de forma transparente. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo LLaMA |
| Parametros totales | 125.848.320 (125,8 M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es predominantemente inglés legal y financiero) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar con arquitectura LLaMA, preentrenado desde cero por su autor y posteriormente ajustado mediante SFT. El ajuste fino se realizó sobre 11.563 registros de entrenamiento y 608 de validación, con una longitud media de 306 tokens por registro. La función de pérdida es entropía cruzada calculada únicamente sobre los tokens de la respuesta y el token `<|eos|>`, que representan el 8,2% de los tokens totales; todo el texto anterior a `<|assistant|>` se enmascara con `-100`, de modo que el modelo nunca aprende a reproducir el pasaje o la pregunta, solo a generar la respuesta.

Los datos de instrucción son sintéticos: los pasajes se muestrearon del corpus de preentrenamiento del modelo base (jurisprudencia estadounidense, documentos SEC y texto web general), y las preguntas y respuestas fueron generadas por Google Gemini (gemini-3.6-flash). Posteriormente se aplicaron filtros estrictos: cada número en una respuesta debe aparecer en el pasaje, las respuestas deben solaparse con el pasaje en al menos el 60% de las palabras de contenido, y se realizó deduplicación exacta y descontaminación de 13-gramas contra CaseHOLD y LexGLUE. El entrenamiento se ejecutó en 4 GPU H100 durante 2 épocas (361 pasos) con un coste de 0,22 dólares, usando tasa de aprendizaje coseno de 5e-05 a 5e-06 con un 5% de warmup y precisión bf16. El 10% de los registros de entrenamiento son casos sin respuesta, para enseñar al modelo a rechazar preguntas no respondibles.

## Capacidades

- Respuesta a preguntas fundamentada: dado un pasaje de contexto y una pregunta, genera una respuesta basada exclusivamente en el pasaje.
- Refusal explícito: cuando el pasaje no contiene la respuesta, el modelo emite la frase exacta `The provided context does not contain the answer to that question.` (en inglés).
- Fidelidad numérica: las cifras presentes en las respuestas suelen aparecer en el pasaje (92,6% de fidelidad numérica medida).
- Generación de texto con decodificación greedy recomendada; el muestreo (sampling) degrada la calidad y aumenta la fabricación.
- Compatible con pipelines de generación de texto de Hugging Face Transformers y con text-generation-inference (TGI).
- No es un asistente conversacional general: solo responde preguntas sobre un pasaje proporcionado.
- No incluye recuperación de información propia; requiere un sistema de retrieval externo para funcionar como RAG.

## Casos de uso

- Respuesta a preguntas sobre documentos legales: un sistema RAG que recupera cláusulas de contratos o sentencias y las pasa como contexto; el modelo responde solo con lo que aparece en el fragmento, reduciendo alucinaciones en dominios donde la precisión es crítica.
- Verificación de hechos en informes financieros: dado un pasaje de un documento SEC, el modelo puede extraer cifras y tendencias, siempre que el dato esté presente en el pasaje.
- Asistente de revisión de contratos: integrado en un flujo de trabajo donde se seleccionan cláusulas relevantes y se formulan preguntas específicas (por ejemplo, "¿Cuál es la duración del contrato?"), el modelo responde con la información literal del pasaje.
- Filtrado de documentos en pipelines de QA: puede usarse para descartar pasajes que no contienen la respuesta, gracias a su comportamiento de refusal, aunque con una tasa de falsos rechazos del 12%.
- Demostración educativa de SFT en modelos pequeños: útil para enseñar técnicas de ajuste fino supervisado, evaluación de fidelidad y diseño de datasets sintéticos con filtros de calidad.
- Componente de bajo coste en sistemas de generación aumentada por recuperación (RAG) para prototipos o entornos con recursos limitados, donde un modelo de 125M es suficiente para tareas de lectura extractiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas propias medidas sobre un conjunto de validación de 58 preguntas no respondibles y 75 respondibles, con decodificación greedy:

| Metrica | Valor | Significado |
|---|---|---|
| Refusal recall | 67,2% | Preguntas no respondibles correctamente rechazadas |
| False refusal rate | 12,0% | Preguntas respondibles rechazadas incorrectamente |
| Refusal precision | 81,2% | Rechazos emitidos que eran correctos |
| Number fidelity | 92,6% | Respuestas numéricas sin cifras ausentes del pasaje |
| Val loss / ppl | 1,1449 / 3,14 | Entropía cruzada solo sobre tokens de respuesta |

Estas métricas indican que el modelo inventa una respuesta aproximadamente en un tercio de los casos cuando la respuesta no está en el pasaje, por lo que el autor recomienda tratar su salida como un borrador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB en fp16 (125,8M parámetros × 2 bytes), y menos de 100 MB en cuantización de 4 bits si se aplicara.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1650 o superior puede ejecutarlo sin problemas. También funciona en CPU.
- Es adecuado para despliegue en entornos edge, Raspberry Pi (con cuantización) o instancias cloud de bajo coste.
- Opciones de despliegue: compatible con Hugging Face Transformers (AutoModelForCausalLM), text-generation-inference (TGI), y puede convertirse a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por su tamaño se espera una latencia de decenas de milisegundos por token en GPU y de unos pocos cientos de milisegundos en CPU moderna.

## Comparativa con modelos similares

El modelo comparte categoría con otras variantes del mismo autor y con modelos de tamaño similar orientados a dominios legales. No se dispone de datos de rendimiento comparativo en benchmarks estándar.

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| narendraalluri/slm-125m-sft | 125,8 M | Grounded reader (QA con contexto) | Apache 2.0 | Hugging Face |
| narendraalluri/slm-125m-base | 125,8 M | Modelo base preentrenado desde cero | Apache 2.0 | Hugging Face |
| DeependraVerma/legal-slm-125m-sft | 125 M (estimado) | SFT para QA legal y financiero | MIT | Hugging Face |
| DeependraVerma/legal-slm-125m-ultimate-sft | 125 M (estimado) | SFT mejorado para análisis de contratos | MIT | Hugging Face |

Las variantes de DeependraVerma parecen seguir un enfoque similar (SFT sobre un modelo base de 125M para tareas legales), pero no se dispone de detalles técnicos ni métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente conversacional: sin un `<context>` proporcionado, el modelo no tiene nada que leer y su comportamiento es impredecible.
- Fabricación confiable: cuando se le empuja más allá del pasaje, inventa respuestas plausibles, incluyendo cifras, porcentajes y direcciones de cambio incorrectas (por ejemplo, "una disminución del 6%" para un pasaje que describe un aumento).
- Sobre-rechazo: rechaza aproximadamente una de cada ocho preguntas respondibles (12% de falsos rechazos).
- Sin recuperación propia: es responsabilidad del llamador proporcionar el pasaje correcto; para RAG debe emparejarse con un retriever externo.
- Dependencia del formato de prompt exacto: desviarse de la plantilla entrenada degrada notablemente la salida.
- Datos sintéticos: las instrucciones fueron generadas por Gemini y filtradas, pero pueden contener sesgos del corpus base o del propio generador.
- Contaminación medida en el modelo base: el autor menciona una brecha de contaminación CaseHOLD en el modelo base, que se hereda en este ajuste.
- No constituye asesoramiento legal ni financiero; el autor lo presenta como una demostración educativa del método SFT a 125M, no como una herramienta de producción.
- Idioma: el modelo está entrenado principalmente en inglés legal y financiero; no se garantiza su funcionamiento en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/narendraalluri/slm-125m-sft
- Modelo base: https://huggingface.co/narendraalluri/slm-125m-base
- Demo en vivo del modelo base: https://slm-125m-phi.vercel.app/index.html
- Página del modelo base (SLM-125M): https://slm-125m.vercel.app/
- Variante similar de DeependraVerma: https://huggingface.co/DeependraVerma/legal-slm-125m-sft
- Variante mejorada de DeependraVerma: https://huggingface.co/DeependraVerma/legal-slm-125m-ultimate-sft
