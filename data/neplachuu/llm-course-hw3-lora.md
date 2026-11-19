# neplachuu/llm-course-hw3-lora

## Resumen

`neplachuu/llm-course-hw3-lora` es un adaptador LoRA de tipo PEFT publicado en Hugging Face por la autora neplachuu en el marco de la tercera tarea del curso «Grandes modelos de lenguaje» de la HSE (Higher School of Economics). El adaptador se monta sobre el modelo base `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer decoder-only de aproximadamente 300 millones de parámetros, y su objetivo concreto es la clasificación de sentimiento de tuits en inglés en tres clases: `negative`, `neutral` y `positive`. El problema que resuelve es, por tanto, muy acotado: transformar un modelo generativo de propósito general en un clasificador de sentimiento mediante ajuste eficiente de parámetros.

La relevancia de esta ficha es fundamentalmente metodológica. No se trata de un modelo de producción ni de un lanzamiento comercial, sino de un artefacto académico que documenta una implementación manual de LoRA (sin usar los adaptadores estándar de la librería PEFT), entrenada sobre 45 615 tuits del dataset `cardiffnlp/tweet_eval` durante una única época. El adaptador aplica actualizaciones de bajo rango únicamente a las proyecciones `k_proj` y `v_proj` de la atención, con rango 8 y alpha 16, manteniendo congelados el resto de pesos del modelo base.

El resultado reportado por la autora es un Macro F1 de 0,5113 en test, frente a 0,12 del modelo base sin ajuste. Cabe subrayar que buena parte de esa mejora proviene de una postprocesado más cuidadoso de las salidas (la función `postprocess_sentiment_v2`), no solo del entrenamiento: la propia model card lo reconoce explícitamente. El adaptador está pensado exclusivamente para inglés y para la tarea de sentimiento; no es un modelo conversacional generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Lite-Oute-1-300M-Instruct) con adaptador LoRA sobre proyecciones `k_proj` y `v_proj` |
| Parámetros totales | 300 031 872 (modelo base; el adaptador añade un número reducido de parámetros de bajo rango) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`, tags `lora`, `peft`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `OuteAI/Lite-Oute-1-300M-Instruct`, un transformer decoder-only de unos 300 millones de parámetros. La técnica aplicada es LoRA en su formulación clásica: se congela el modelo base y se entrenan únicamente matrices de bajo rango que se suman a los pesos de las proyecciones `k_proj` y `v_proj` de la atención. La autora implementó estas capas manualmente en PyTorch, sin recurrir a los adaptadores preexistentes de PEFT, lo que implica que la reproducción exige el código de `hw3_final.ipynb` y no basta con el cargador estándar de PEFT.

Los hiperparámetros documentados son: rango `r` = 8, `alpha` = 16, 45 615 tuits de entrenamiento, 1 época, batch size 16, learning rate 5e-4 y optimizador AdamW. El loss se calcula exclusivamente sobre la respuesta del asistente, enmascarando los tokens del prompt en `labels`. El dataset empleado es `cardiffnlp/tweet_eval` (configuración `sentiment`), con tres clases. No se documenta ningún proceso de RLHF, DPO ni instrucción adicional más allá del formato de prompt que pide responder con una única palabra.

La innovación destacable no está en la arquitectura sino en el postprocesado: la función `postprocess_sentiment_v2` selecciona la primera etiqueta inequívoca de la salida generada, corrigiendo el problema de que el modelo tiende a repetir la clase varias veces (por ejemplo `positive`, `positive`, `positive`, `pos`). Esto elevó el F1 en validación de 0,4881 a 0,5184 y redujo las predicciones vacías de 261 a 0.

## Capacidades

- Clasificación de sentimiento binaria/triple en inglés: genera una etiqueta (`negative`, `neutral` o `positive`) a partir del texto de un tuit.
- Generación de texto autoregresiva heredada del modelo base Lite-Oute-1-300M-Instruct, aunque el ajuste LoRA la especializa hacia la tarea de sentimiento.
- Formato de respuesta guiado por instrucción: se le indica responder con una única palabra, sin explicaciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: limitado al inglés; no hay evidencia de capacidades en otros idiomas.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Clasificación de sentimiento en redes sociales: el adaptador está entrenado específicamente sobre tuits de `tweet_eval`, por lo que encaja de forma directa en pipelines de monitorización de opinión en inglés, siempre que se aplique el postprocesado `postprocess_sentiment_v2` para extraer la etiqueta.
- Filtrado previo de reseñas o comentarios: puede usarse como primera etapa para separar mensajes negativos de neutros/positivos antes de un análisis más profundo con un modelo mayor.
- Análisis de reputación de marca en tiempo real: dado su tamaño reducido (300 M parámetros), puede desplegarse en CPU o GPU de gama baja para procesar volúmenes moderados de tuits con latencia baja.
- Etiquetado asistido de datasets: útil para pre-anotar corpus de sentimiento en inglés que luego se revisan manualmente, aprovechando el Macro F1 en torno a 0,51 como cota de calidad.
- Docencia y experimentación con LoRA: sirve como ejemplo reproducible de implementación manual de adaptadores de bajo rango sobre un transformer pequeño, útil en cursos y talleres.
- Investigación sobre postprocesado de salidas generativas: el caso documenta cómo la elección de la estrategia de extracción de etiquetas altera materialmente la métrica final (de 0,4881 a 0,5184 en validación).

## Benchmarks y rendimiento

| Modelo / configuración | Macro F1 en test |
|---|---:|
| Modelo base (Lite-Oute-1-300M-Instruct) | 0,12 |
| Tras LoRA, postprocesado original | 0,47 |
| Tras LoRA, `postprocess_sentiment_v2` | 0,5113 |

En validación, el postprocesado mejorado elevó el F1 de 0,4881 a 0,5184 y redujo las predicciones vacías de 261 a 0. La autora advierte que, en la métrica del trabajo, se añade un cuarto clase `""` para respuestas no reconocidas, de modo que el máximo alcanzable de esa métrica concreta es 0,75. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 300 M parámetros, en FP16 requiere aproximadamente 0,6 GB para los pesos, más memoria para activaciones y KV cache; en la práctica cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para volúmenes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` con PyTorch es la vía natural; el tag `text-generation-inference` sugiere compatibilidad con TGI, y `endpoints_compatible` indica compatibilidad con endpoints alojados. No se documenta soporte en llama.cpp u Ollama, ya que los pesos son safetensors y el adaptador requiere la implementación manual de las capas LoRA.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neplachuu/llm-course-hw3-lora` | 300 M (base) | no disponible | Sentimiento en inglés (3 clases) | no disponible | Hugging Face |
| `OuteAI/Lite-Oute-1-300M-Instruct` (base) | 300 M | no disponible | Generación de texto instructiva | no disponible | Hugging Face |
| Clasificadores de sentimiento dedicados (p. ej. basados en RoBERTa) | ~125-355 M | ~512 tokens típicamente | Sentimiento | variable | Hugging Face |

La comparación más informativa es contra el propio modelo base: el adaptador mejora el Macro F1 de 0,12 a 0,5113 en la tarea específica. Frente a clasificadores dedicados tipo RoBERTa afinados para sentimiento, este adaptador parte de un modelo generativo pequeño y no alcanza el rendimiento típico de un encoder afinado, pero ofrece la flexibilidad de un modelo generativo. No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenar sobre tuits, puede heredar sesgos de dominio, jerga y estilo de Twitter.
- Riesgo de alucinación: el modelo puede generar la etiqueta repetida varias veces o abreviada (`pos`, `neut`), por lo que requiere postprocesado obligatorio para extraer una clase válida.
- Limitaciones de contexto o idioma: solo inglés y solo dominio de tuits; la autora advierte errores en ironía, mensajes ambiguos y textos de otros dominios.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene verificar antes de cualquier despliegue en producción.
- Caveat de reproducción: los adaptadores fueron implementados manualmente, por lo que cargarlos con el loader estándar de PEFT puede no funcionar; se requiere el código de `hw3_final.ipynb`.
- Caveat de métrica: el Macro F1 reportado incluye una clase adicional `""` para respuestas no reconocidas, lo que limita el máximo de la métrica a 0,75 y hace que las cifras no sean directamente comparables con otras evaluaciones de sentimiento.
- Calidad: un Macro F1 de 0,5113 en test es modesto; no es adecuado como clasificador de producción sin revisión humana o ajuste adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neplachuu/llm-course-hw3-lora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
