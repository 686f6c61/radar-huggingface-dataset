# Felamity-Technologies/Minmini-1B

## Resumen

Minmini-1B (மின்மினி, "luciérnaga" en tamil) es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros especializado en tamil, desarrollado por Felamity-Technologies. Se construye mediante ajuste fino supervisado sobre el modelo base google/gemma-3-1b-pt, y su propósito declarado es cubrir tareas de procesamiento del lenguaje natural en tamil que los modelos generalistas de gran tamaño resuelven de forma deficiente o demasiado costosa: inferencia de lenguaje natural, comprensión lectora extractiva y traducción inglés↔tamil.

El modelo destaca por su relación entre tamaño y rendimiento en tareas concretas. Según el autor, supera a Sarvam (105.000 millones de parámetros) en IndicXNLI (76,0 % frente a 58,2 %) e IndicQA (F1 52,4 frente a 44,5) usando los mismos prompts, con un centenar de veces menos parámetros. No obstante, estas cifras son resultados supervisados en formato: Minmini fue ajustado específicamente en esos formatos de tarea, mientras que los modelos comparados no, por lo que la comparación debe interpretarse con cautela.

La relevancia actual del modelo reside en su enfoque de despliegue: 1B de parámetros, pesos bf16 de aproximadamente 2 GB y entrenamiento realizado íntegramente en un portátil. Esto lo sitúa como una opción viable para NLP en tamil en dispositivos locales, entornos sin conexión o infraestructuras con recursos limitados, un nicho escasamente cubierto por modelos especializados en lenguas dravídicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `gemma3_text`) |
| Parámetros totales | 999.885.952 (~1B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada; pesos publicados en bf16 (safetensors) |
| Idiomas soportados | Tamil (ta), inglés (en) |
| Licencia | Gemma (términos de licencia de Google Gemma) |
| Formato de pesos | Safetensors (bf16); compatible con transformers y MLX |

## Arquitectura y entrenamiento

Minmini-1B hereda la arquitectura `gemma3_text` de Google Gemma 3 en su variante de 1B de parámetros: un transformer decoder-only con atención causal estándar. El modelo parte de los pesos preentrenados de `google/gemma-3-1b-pt` y se somete a ajuste fino supervisado (SFT) sobre un conjunto de datos orientado a tareas en tamil. No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineación posteriores al SFT.

Los datasets citados en la model card son ai4bharat/IndicCorpV2 (corpus monolingüe índico), Divyanshu/indicxnli (inferencia de lenguaje natural en lenguas índicas), ai4bharat/indic-align (alineación y traducción), CohereForAI/aya_dataset (instrucciones multilingües) y, según los tags, también IndicQA para comprensión lectora. El autor no especifica el número total de tokens de entrenamiento ni la composición exacta de la mezcla. El entrenamiento se realizó, según declara el autor, íntegramente en un portátil, lo que condiciona el alcance del ajuste fino y explica el carácter especialista del modelo. No se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa u otras); el valor diferencial está en el ajuste fino y en el formato de prompts.

## Capacidades

- Comprensión lectora extractiva en tamil: responde preguntas a partir de un pasaje proporcionado, devolviendo una frase corta del texto. Incluye un mecanismo calibrado para declarar que la respuesta no está en el pasaje (AUC 0,88 según el autor).
- Inferencia de lenguaje natural (NLI) en tamil: clasifica una hipótesis como implicación, contradicción o neutra respecto a una premisa, con robustez al orden de las opciones de respuesta (75,2–76,3 %).
- Traducción inglés→tamil y tamil→inglés de frases cortas.
- Redacción breve en tamil: mensajes, listas y párrafos cortos con gramática y fluidez correctas; pierde el hilo en respuestas largas.
- Formato de chat estilo Gemma: plantilla de chat con `<end_of_turn>` como token de parada; el mensaje de sistema se pliega en el primer turno de usuario.
- Compatibilidad con transformers y MLX (Apple Silicon).
- No soporta tool calling ni function calling, agentes, razonamiento multi-paso, matemáticas, visión ni audio según la información disponible.

## Casos de uso

- Atención al cliente sobre documentación en tamil: el modelo responde preguntas extrayendo la respuesta de un pasaje de soporte (FAQ, manual, formulario). Es adecuado porque su mejor rendimiento se da exactamente en este formato de prompt y porque declara de forma fiable cuándo la respuesta no está en el texto.
- Verificación de afirmaciones en tamil: dado un texto y una afirmación, clasifica si la afirmación se sigue, contradice o es independiente del texto. Útil en moderación de contenido, verificación de hechos documentales o control de calidad de resúmenes.
- Traducción de frases cortas inglés↔tamil en aplicaciones móviles: con chrF de 44,7 y 45,6 en FLORES-200, es apto para traducir mensajes, notificaciones o campos de formulario en local, sin depender de APIs externas.
- NLP en tamil sin conexión o en el borde: con 1B de parámetros y ~2 GB en bf16, puede ejecutarse en un portátil o dispositivo con recursos moderados, lo que sirve para aplicaciones de campo, entornos con conectividad limitada o requisitos de privacidad de datos.
- Procesamiento por lotes de documentos en tamil: extracción de respuestas de contratos, informes o expedientes mediante pipelines de QA extractiva, con bajo coste de inferencia por su tamaño reducido.
- Prototipado e investigación en lenguas dravídicas: como punto de partida para experimentos de ajuste fino, evaluación de prompts o comparación de técnicas de SFT en tamil, dado su tamaño manejable y su licencia Gemma.
- Generación de borradores cortos en tamil: redacción asistida de mensajes y listas donde la fluidez gramatical importa más que la coherencia de largo alcance.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Minmini-1B |
|---|---|---|---|
| Inferencia de lenguaje natural | IndicXNLI (tamil, test, 1.000 pares) | Accuracy (prompt Tamil-Bench) | 76,0 |
| QA extractiva | IndicQA (tamil, 1.000 preguntas) | F1 | 52,4 |
| QA extractiva | IndicQA (tamil, 1.000 preguntas) | Exact match | 44,3 |
| Traducción inglés→tamil | FLORES-200 devtest (eng_Latn-tam_Taml, 5-shot) | chrF | 44,7 |
| Traducción tamil→inglés | FLORES-200 devtest (tam_Taml-eng_Latn, 5-shot) | chrF | 45,6 |

El autor compara además con Sarvam (105B): IndicXNLI 58,2 % e IndicQA F1 44,5 con los mismos prompts. También menciona resultados en MILU (25,7 %) y Belebele (24,1 %), ambos próximos al azar (25 %), que el propio autor califica como no aptos para conocimiento factual.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2 GB en bf16; ~1 GB en cuantización de 8 bits; ~0,6–0,7 GB en 4 bits (estimaciones a partir del número de parámetros; no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060/4060, RTX 4090, A100 o H100 sin problema. También CPU y Apple Silicon.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más; el autor indica que se ejecuta en un portátil.
- Opciones de despliegue: transformers (referencia), MLX en Apple Silicon (soportado explícitamente), llama.cpp/Ollama (viable por tamaño, aunque no se documenta conversión GGUF oficial) y vLLM/TGI (compatibilidad con `text-generation-inference` declarada en los tags, sin configuración publicada).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minmini-1B | ~1B | No disponible | Especialista en tamil (QA, NLI, traducción) | Gemma | Hugging Face |
| Sarvam (modelo citado por el autor) | 105B | No disponible | Modelo generalista índico | No disponible | No disponible |
| google/gemma-3-1b-pt | ~1B | No disponible | Modelo base multilingüe generalista | Gemma | Hugging Face |

La única comparación cuantitativa disponible es la que aporta el autor frente a Sarvam en IndicXNLI e IndicQA, con la salvedad de que Minmini fue ajustado en esos formatos y Sarvam no. No se dispone de datos comparativos con otros modelos especializados en tamil en la información proporcionada.

## Limitaciones y advertencias

- Es un especialista, no un asistente general: el propio autor lo califica como no apto para conocimiento factual (MILU 25,7 %, Belebele 24,1 %, cerca del azar) y advierte de que inventa hechos.
- No resuelve matemáticas, lógica ni razonamiento paso a paso: falló las cinco preguntas simples de prueba (por ejemplo, 12 − 5 + 3).
- No apto para escritura de formato largo ni chat multi-turno: entra en bucles con decodificación greedy y pierde el hilo tras unas pocas frases. Para respuestas libres se recomienda muestreo (temperature 0,7, top_p 0,95, repetition_penalty 1,1).
- Los resultados de benchmarks son supervisados y en formato: el modelo fue ajustado en esos formatos de tarea mientras que los modelos comparados no, lo que infla la comparación. No están verificados de forma independiente.
- Cobertura lingüística limitada a tamil e inglés; no se documenta comportamiento en otras lenguas.
- Longitud de contexto no documentada.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Gemma de Google, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de un despliegue en producción.
- Riesgo de alucinación elevado en preguntas de conocimiento general; para QA debe restringirse siempre a un pasaje proporcionado.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Felamity-Technologies/Minmini-1B
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Dataset IndicXNLI: https://huggingface.co/datasets/Divyanshu/indicxnli
- Dataset IndicAlign: https://huggingface.co/datasets/ai4bharat/indic-align
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Dataset IndicQA: https://huggingface.co/datasets/ai4bharat/IndicQA
- Dataset FLORES-200: https://huggingface.co/datasets/facebook/flores
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Repositorio MLX: https://github.com/ml-explore/mlx-lm
