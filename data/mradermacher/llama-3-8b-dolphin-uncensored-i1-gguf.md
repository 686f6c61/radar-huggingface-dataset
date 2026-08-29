# mradermacher/llama-3-8b-dolphin-uncensored-i1-GGUF

## Resumen

El modelo `mradermacher/llama-3-8b-dolphin-uncensored-i1-GGUF` es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo base `adamkareem/llama-3-8b-dolphin-uncensored`, que a su vez es una versión de la familia Dolphin basada en Llama 3 de 8 mil millones de parámetros. El autor, mradermacher, se especializa en generar cuantizaciones de alta calidad para ejecución local eficiente, y este repositorio ofrece 25 variantes que van desde 2,1 GB hasta 6,7 GB, cubriendo desde cuantizaciones extremadamente agresivas (IQ1_S) hasta prácticamente sin pérdida (Q6_K).

La relevancia de este modelo radica en que combina la capacidad de Llama 3 8B con el ajuste instructivo de Dolphin, conocido por su enfoque "uncensored" (sin censura), lo que lo hace atractivo para desarrolladores que necesitan un modelo local sin restricciones de contenido. La versión con imatrix mejora la calidad de las cuantizaciones de baja precisión, un aspecto crítico para desplegar en hardware limitado sin sacrificar demasiado rendimiento.

Al tratarse de un repositorio de cuantizaciones, no introduce una nueva arquitectura ni entrenamiento, sino que optimiza el modelo base para su uso con motores de inferencia como llama.cpp, Ollama o text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 soporta 8K, pero no se especifica en este repositorio) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo de imatrix incluido) |

## Arquitectura y entrenamiento

El modelo base `adamkareem/llama-3-8b-dolphin-uncensored` es un fine-tuning de Llama 3 8B realizado por Eric Hartford (autor de la serie Dolphin). Dolphin se entrena sobre datasets conversacionales e instructivos derivados de Orca, con un enfoque en eliminar el rechazo de contenido (uncensored). La arquitectura subyacente es un transformer decoder estándar con 32 capas, 32 cabezas de atencion y dimensiones ocultas de 4096, típico de Llama 3 8B.

Este repositorio no añade entrenamiento adicional. La cuantizacion se realiza con la herramienta `llama.cpp` utilizando una matriz de importancia (imatrix) calculada sobre un conjunto de datos de calibracion. La imatrix permite que las cuantizaciones de baja precision (especialmente los tipos IQ) conserven mayor fidelidad en pesos criticos, reduciendo la perplejidad respecto a cuantizaciones estaticas equivalentes. El archivo `llama-3-8b-dolphin-uncensored.imatrix.gguf` (0,1 GB) se incluye para que los usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con un estilo instructivo y sin rechazo de contenido explicito.
- Razonamiento basico y matematicas simples, heredado de las capacidades de Llama 3 8B.
- Generacion de codigo en lenguajes comunes (Python, JavaScript, etc.), aunque sin garantias de calidad profesional.
- Capacidad de seguir instrucciones complejas gracias al ajuste instructivo de Dolphin.
- No se ha confirmado soporte para tool calling o function calling en esta version especifica.
- Tampoco se ha confirmado modo de pensamiento (thinking mode) ni capacidades multimodales.
- Limitado al ingles; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- Chatbots locales sin restricciones de contenido: ideal para prototipos o aplicaciones donde se requiere respuestas sin filtros de seguridad, como asistentes de escritura creativa o juegos de rol. Su tamaño reducido permite ejecutarlo en una GPU de consumo.
- Generacion de contenido creativo (historias, dialogos, guiones): la ausencia de censura permite explorar temas tabu o adultos sin que el modelo se niegue a responder, aunque con riesgo de calidad variable.
- Educacion y experimentacion con modelos sin censura: investigadores y desarrolladores pueden estudiar el comportamiento de un LLM sin alineamiento de seguridad en un entorno controlado.
- Desarrollo de aplicaciones offline: al ser GGUF, se puede integrar en aplicaciones de escritorio o moviles mediante llama.cpp o Ollama, sin depender de APIs externas.
- Pruebas de cuantizacion y optimizacion: el repositorio incluye multiples niveles de cuantizacion, permitiendo evaluar el equilibrio entre tamaño, velocidad y calidad para un caso de uso concreto.
- Fine-tuning posterior: el archivo de imatrix permite a los usuarios generar sus propias cuantizaciones adaptadas a un dataset especifico, util para ajustar el modelo a un dominio particular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. La unica referencia es un grafico de perplejidad de cuantizaciones (proporcionado por ikawrakow) que compara tipos de cuantizacion de baja calidad, pero no se muestran valores numericos concretos en la informacion extraida.

## Requisitos de hardware

- Las cuantizaciones mas pequenas (i1-IQ1_S, 2,1 GB) pueden ejecutarse en CPU con 4 GB de RAM, aunque con calidad muy reducida.
- Para una experiencia aceptable, se recomienda al menos la cuantizacion i1-Q4_K_M (5,0 GB), que cabe en una GPU con 6 GB de VRAM (por ejemplo, GTX 1660, RTX 2060).
- Las cuantizaciones i1-Q5_K_M (5,8 GB) e i1-Q6_K (6,7 GB) requieren GPUs con 8 GB o mas de VRAM (RTX 3060, RTX 3070, etc.).
- En GPU, se puede usar llama.cpp, Ollama o text-generation-inference (TGI). En CPU, llama.cpp u Ollama funcionan correctamente.
- La latencia depende del hardware y la cuantizacion. En una RTX 4090, un modelo Q4_K_M de 8B suele generar entre 50 y 100 tokens por segundo. En CPU moderna, se espera entre 5 y 15 tokens por segundo.
- Para despliegue en produccion con multiples usuarios, se recomienda TGI o vLLM con cuantizacion GPTQ o AWQ, pero este repositorio solo ofrece GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| mradermacher/llama-3-8b-dolphin-uncensored-i1-GGUF | 8,03 B | no disponible | apache-2.0 | GGUF | Sin censura, instructivo |
| huihui_ai/dolphin3-abliterated (Ollama) | 8 B | 8K (Llama 3.1) | apache-2.0 | GGUF | "Abliterated", sin censura, basado en Llama 3.1 |
| dolphin-llama3 (Ollama) | 8 B / 70 B | 8K | apache-2.0 | GGUF | Dolphin 2.9, instructivo y conversacional |

La principal diferencia con alternativas como `dolphin3-abliterated` es que esta version se basa en Llama 3 (no 3.1) y no incluye el proceso de "abliteracion" (eliminacion selectiva de capas de rechazo), sino que el modelo base ya fue entrenado sin censura. En cuanto a rendimiento, no hay datos comparativos publicados.

## Limitaciones y advertencias

- **Contenido sin censura**: el modelo puede generar texto ofensivo, ilegal, violento o sexualmente explicito. No debe usarse en aplicaciones publicas sin moderacion humana.
- **Riesgo de alucinacion**: como cualquier LLM, puede inventar hechos, citas o datos. La cuantizacion agresiva (IQ1, IQ2) aumenta este riesgo.
- **Idioma**: solo entrenado en ingles; el rendimiento en otros idiomas es deficiente o inexistente.
- **Contexto limitado**: aunque el modelo base soporta 8K, no se ha confirmado en este repositorio; ademas, cuantizaciones muy bajas pueden degradar la coherencia en contextos largos.
- **Licencia**: apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales (no se indica en esta ficha). Se recomienda revisar la licencia de Llama 3 original.
- **Sin garantias de seguridad**: al estar disenado para no rechazar contenido, no incluye mecanismos de seguridad. No es apto para entornos donde se requiera cumplimiento normativo (GDPR, etc.).
- **Calidad de cuantizacion**: los tipos IQ1 e IQ2 son de muy baja precision y solo recomendados para pruebas extremas. Para uso serio, se sugiere Q4_K_M o superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/llama-3-8b-dolphin-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/adamkareem/llama-3-8b-dolphin-uncensored
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/llama-3-8b-dolphin-uncensored-GGUF
- Perfil del autor (mradermacher): https://huggingface.co/mradermacher
- Dolphin en Ollama: https://ollama.com/library/dolphin-llama3
- Dolphin 3.0 abliterated en Ollama: https://ollama.com/huihui_ai/dolphin3-abliterated
