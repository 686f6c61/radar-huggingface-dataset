# Privoid-ai/Privoid-FactCheck-Qwen3.5-2B

## Resumen

Privoid-FactCheck-Qwen3.5-2B es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por Privoid-ai y publicado bajo licencia Apache 2.0. Su función es la verificación de afirmaciones (*fact-checking*) contra un documento de referencia: recibe un texto fuente y una afirmación, y devuelve una puntuación de soporte entre 0 y 1 que indica si la afirmación está respaldada por la fuente. Está diseñado para detectar alucinaciones en respuestas generadas por sistemas RAG, resúmenes e informes escritos por IA antes de que lleguen al usuario final.

El modelo se enmarca en la categoría de modelos pequeños especializados en *groundedness* y *faithfulness*, con solo 2 mil millones de parámetros, lo que lo hace desplegable en portátiles y servidores modestos. Forma parte de la "pila de confianza" de Privoid junto con Privoid Guard (detección de inyección de prompts) y Privoid Redact (eliminación de datos personales). Según la model card, en el conjunto de test oficial LLM-AggreFact (29.320 afirmaciones en 11 datasets) alcanza una precisión balanceada media de 74,7 con umbral fijo de 0,5, y 75,5 con umbral ajustado por dataset.

La relevancia actual del modelo radica en su relación rendimiento/tamaño: con 2B parámetros supera a Llama-3.1-405B-Instruct (74,4) en la misma prueba, aunque queda por debajo de especialistas más grandes como Bespoke-MiniCheck-7B (77,4) o Granite Guardian 3.3 8B (76,5). Está pensado como componente de *guardrails* en pipelines de generación aumentada por recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B) con adaptador LoRA (PEFT) para clasificación de texto |
| Parametros totales | 2B (modelo base) + adaptador LoRA (tamaño no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | GGUF disponible en repo separado (Privoid-ai/Privoid-FactCheck-Qwen3.5-2B-GGUF); niveles concretos no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con Unsloth sobre el modelo base Qwen/Qwen3.5-2B, un transformer decoder-only de 2B parámetros. La tarea se formula como clasificación de texto: dado un documento de fundamento (*grounding document*) y una afirmación, el modelo produce una puntuación de soporte entre 0 y 1. Para documentos largos, el texto se divide automáticamente en fragmentos y la afirmación se considera respaldada si algún fragmento la soporta.

El entrenamiento se realizó sobre el dataset `lytang/C2D-and-D2C-MiniCheck`, orientado a la verificación de afirmaciones y la detección de alucinaciones. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación principal no es arquitectónica sino de eficiencia: conseguir un verificador de *groundedness* competitivo con solo 2B parámetros mediante ajuste fino con LoRA, lo que permite su despliegue en hardware de consumo.

## Capacidades

- Verificación de afirmaciones contra un documento fuente, devolviendo una puntuación de soporte continua entre 0 y 1.
- Detección de alucinaciones en respuestas de sistemas RAG, resúmenes y reportes generados por IA.
- Manejo de documentos largos mediante fragmentación automática con agregación por fragmento.
- Evaluación de *faithfulness* y *groundedness* en pipelines de generación.
- Clasificación de texto binaria efectiva mediante umbral (0,5 por defecto, ajustable por dataset).
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (*thinking mode*).
- No se documenta capacidad de visión ni audio, pese a que el ejemplo de código de la model card emplea `AutoModelForImageTextToText` (probablemente por herencia del modelo base).

## Casos de uso

- **Guardrail en pipelines RAG**: insertar el modelo como paso de verificación tras la generación; cada frase de la respuesta se contrasta con los fragmentos recuperados y se marca o bloquea si la puntuación de soporte cae por debajo del umbral. Adecuado por su bajo coste computacional y su capacidad de procesar documentos largos por fragmentos.
- **Evaluación automática de sistemas LLM**: usar el modelo como juez de *faithfulness* en suites de evaluación continua, sustituyendo a jueces basados en GPT-4o con un coste muy inferior y una precisión balanceada comparable (74,7 frente a 75,9 reportada para GPT-4o en LLM-AggreFact).
- **Verificación de resúmenes**: comprobar que cada afirmación de un resumen automático está respaldada por el documento original, marcando frases no soportadas para revisión humana.
- **Detección de alucinaciones en atención al cliente**: validar en tiempo real las respuestas de un chatbot contra la base de conocimiento antes de enviarlas al usuario, reduciendo el riesgo de información incorrecta.
- **Auditoría de informes generados por IA**: procesar por lotes informes financieros, técnicos o legales y señalar afirmaciones sin respaldo documental para revisión editorial.
- **Filtrado en generación de contenido periodístico asistido**: contrastar borradores generados contra las fuentes citadas y generar alertas de afirmaciones no fundamentadas.
- **Componente de moderación en producción**: combinado con Privoid Guard (inyección de prompts) y Privoid Redact (datos personales), forma una cadena de seguridad completa para aplicaciones LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test LLM-AggreFact (29.320 afirmaciones, 11 datasets). La columna de modelos comparables refleja valores reportados en el leaderboard oficial o medidos por el autor según se indica.

| Modelo | Tamano (B) | BAcc media | Fuente |
|---|---|---|---|
| Bespoke-MiniCheck-7B | 7 | 77,4 | reportado |
| Claude-3.5 Sonnet | - | 77,2 | reportado |
| Granite Guardian 3.3 8B | 8 | 76,5 | reportado |
| GPT-4o (2024-05-13) | - | 75,9 | reportado |
| FactCG-DeBERTa-L | 0,4 | 75,6 | reportado |
| MiniCheck-Flan-T5-L | 0,8 | 75,0 | reportado |
| **Privoid FactCheck 2B** | 2 | **74,7** | autor |
| Llama-3.1-405B-Instruct | 405 | 74,4 | reportado |
| Vectara HHEM-2.1-open | - | 72,3 | medido |

Desglose por dataset (precisión balanceada):

| Dataset | Claims | HHEM-2.1-open | MiniCheck 0.8B | Bespoke 7B | Privoid 2B |
|---|---|---|---|---|---|
| CNN | 558 | 62,0 | 69,9 | 65,5 | 57,5 |
| XSum | 558 | 70,6 | 74,3 | 77,8 | 70,1 |
| MediaS | 726 | 67,9 | 73,6 | 76,0 | 72,8 |
| MeetB | 772 | 72,1 | 77,3 | 78,3 | 74,9 |
| WiCE | 358 | 76,2 | 72,2 | 83,0 | 79,3 |
| REVEAL | 1.710 | 86,6 | 86,2 | 88,0 | 89,4 |
| ClaimVerify | 1.088 | 73,6 | 74,6 | 75,3 | 73,6 |
| FactCheck | 1.566 | 71,8 | 74,7 | 77,7 | 77,3 |
| ExpertQA | 3.702 | 58,0 | 59,0 | 59,2 | 59,4 |
| LFQA | 1.911 | 83,4 | 85,2 | 86,7 | 85,9 |
| RAGTruth | 16.371 | 73,3 | 78,0 | 84,0 | 81,3 |

Con umbral ajustado por dataset en el split de desarrollo, la media sube a 75,5. Qwen3.5-2B sin ajustar promedió 70,8 en una muestra de hasta 100 afirmaciones por dataset. El modelo ocupa la posición #7 de 8 en la comparativa de la model card.

## Requisitos de hardware

- **VRAM estimada**: con pesos en fp16, aproximadamente 4-5 GB para el modelo base de 2B más el adaptador LoRA; en cuantización de 8 bits, unos 2-3 GB; en 4 bits, en torno a 1,5-2 GB (estimaciones orientativas, no publicadas por el autor).
- **GPU recomendadas**: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor volumen.
- **GPU de consumo**: sí, cabe en GPUs de consumo como RTX 3060/4060 en cuantización de 4-8 bits; también en CPU mediante los ficheros GGUF del repo separado.
- **Opciones de despliegue**: Transformers + PEFT (según el ejemplo de la model card), llama.cpp u Ollama con los GGUF, y potencialmente vLLM o TGI para servir el modelo base con el adaptador.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BAcc (LLM-AggreFact) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Privoid-FactCheck-Qwen3.5-2B** | 2B | No disponible | 74,7 | Apache 2.0 | Hugging Face (adaptador + GGUF) |
| Bespoke-MiniCheck-7B | 7B | No disponible | 77,4 | No disponible | Hugging Face |
| MiniCheck-Flan-T5-L | 0,8B | No disponible | 75,0 | No disponible | Hugging Face |
| Vectara HHEM-2.1-open | No disponible | No disponible | 72,3 | No disponible | Hugging Face |
| Granite Guardian 3.3 8B | 8B | No disponible | 76,5 | No disponible | Hugging Face |

Privoid FactCheck 2B ofrece un equilibrio entre tamaño reducido y precisión: supera a HHEM-2.1-open (72,3) y a Llama-3.1-405B-Instruct (74,4), pero queda por debajo de especialistas más grandes como Bespoke-MiniCheck-7B y Granite Guardian 3.3 8B. Su ventaja principal es el coste de despliegue: 2B parámetros con licencia Apache 2.0 explícita.

## Limitaciones y advertencias

- **Solo inglés**: la model card declara únicamente el idioma `en`; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- **Rendimiento desigual por dataset**: en CNN obtiene 57,5, muy por debajo de MiniCheck (69,9) y Bespoke (65,5); en XSum también queda rezagado (70,1). El rendimiento depende del dominio y del tipo de texto fuente.
- **Umbral sensible**: la precisión varía entre 74,7 (umbral fijo 0,5) y 75,5 (umbral por dataset); en producción conviene calibrar el umbral sobre datos propios.
- **Riesgo de falsos positivos y negativos**: como clasificador, puede marcar afirmaciones correctas como no soportadas o viceversa; los ejemplos de la model card muestran casos con puntuaciones alejadas de la etiqueta real (p. ej. ExpertQA con etiqueta "supported" y puntuación 0,03).
- **Dependencia del modelo base**: hereda los sesgos y limitaciones de Qwen3.5-2B, incluyendo posibles sesgos de género, culturales o geográficos presentes en los datos de preentrenamiento.
- **Contexto limitado por el modelo base**: la longitud de contexto no se especifica; para documentos largos se depende de la fragmentación automática, lo que puede perder relaciones entre fragmentos distantes.
- **Licencia Apache 2.0**: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-2B y del dataset de entrenamiento por si imponen restricciones adicionales.
- **Sin datos de latencia ni throughput**: no se han publicado métricas de rendimiento en producción, lo que dificulta planificar despliegues a escala.
- **Resultados no verificados**: el benchmark principal está marcado como `verified: false` en el model-index; los valores de comparación son mayoritariamente reportados por terceros y no re-ejecutados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Privoid-ai/Privoid-FactCheck-Qwen3.5-2B
- GGUF: https://huggingface.co/Privoid-ai/Privoid-FactCheck-Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Privoid Guard: https://huggingface.co/Privoid-ai/Privoid-Guard-Qwen3.5-0.8B
- Privoid Redact: https://huggingface.co/Privoid-ai/Privoid-Redact-4B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/lytang/C2D-and-D2C-MiniCheck
- Leaderboard LLM-AggreFact: https://llm-aggrefact.github.io/
- Resultados detallados: benchmark/results.json (en el repositorio del modelo)
