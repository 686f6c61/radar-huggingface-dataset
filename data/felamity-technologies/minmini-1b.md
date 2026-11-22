# Felamity-Technologies/Minmini-1B

## Resumen

Minmini-1B es un modelo de lenguaje de 1.000 millones de parámetros especializado en tamil, desarrollado por Felamity-Technologies mediante ajuste fino supervisado de Google Gemma-3-1B-IT. El nombre proviene del tamil மின்மினி ("luciérnaga"). Su objetivo es cubrir tareas de procesamiento del lenguaje natural en tamil que los modelos generalistas de gran tamaño resuelven de forma deficiente: inferencia de lenguaje natural, comprensión lectora extractiva y traducción inglés-tamil. El modelo se entrenó, según declara el autor, íntegramente en un único portátil.

La propuesta de valor es la eficiencia: con 1B de parámetros y aproximadamente 2 GB en bf16, el modelo afirma superar en tareas de tamil a Sarvam de 105.000 millones de parámetros (IndicXNLI 75,0 % frente a 58,2 %; IndicQA F1 52,1 frente a 44,5). Estas cifras son resultados en formato supervisado, es decir, el modelo fue ajustado sobre las mismas plantillas de tarea que se evalúan, mientras que los modelos comparados no, por lo que la comparación no es directamente equivalente.

Es un especialista, no un asistente general. Funciona bien cuando la tarea parte de un texto proporcionado (responder desde un pasaje, verificar una afirmación, traducir frases cortas) y falla en conocimiento factual, escritura larga y conversación multi-turno. Su relevancia actual reside en la posibilidad de desplegar NLP en tamil de forma local y offline en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `gemma3_text`) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma-3-1B-IT) |
| Tipos de cuantizacion | pesos publicados en bf16 (safetensors); cuantizaciones GGUF/MLX no documentadas en la model card |
| Idiomas soportados | tamil (ta), ingles (en) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (bf16); compatible con transformers y MLX |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 en su variante solo texto. El ajuste fino es supervisado (SFT) sobre tres conjuntos de datos declarados: `Divyanshu/indicxnli` (inferencia de lenguaje natural en lenguas índicas), `ai4bharat/indic-align` y `CohereForAI/aya_dataset`. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovación destacable no es arquitectónica sino metodológica: el ajuste se realizó sobre plantillas de prompt muy concretas (formato de respuesta corta para QA extractiva, formato de letra única A/B/C para NLI), y el autor reporta los resultados usando esas mismas plantillas. Además, el modelo incorpora un mecanismo de abstención para QA: se toma la probabilidad del token `<end_of_turn>` (id 106) como primer token generado; si supera 0,5, la pregunta se trata como no respondible desde el pasaje (AUC reportada de 0,89). El formato de chat es el de Gemma, con el mensaje de sistema plegado en el primer turno de usuario y parada en `<end_of_turn>`.

## Capacidades

- Comprensión lectora extractiva en tamil: responde preguntas a partir de un pasaje con una frase corta, sin explicación.
- Detección de preguntas no respondibles: devuelve respuesta vacía cuando la información no está en el pasaje.
- Inferencia de lenguaje natural (NLI) en tamil: clasifica una afirmación como implicación, contradicción o neutralidad respecto a un texto, con respuesta de letra única.
- Traducción inglés-tamil y tamil-inglés de frases cortas.
- Aritmética y lógica simple en inglés con razonamiento paso a paso correcto (5/5 en las pruebas simples del autor).
- Aritmética simple en tamil, con errores ocasionales (3/5 en las pruebas del autor).
- Redacción breve en tamil (mensajes, listas, párrafos cortos) con calidad legible pero con palabras erróneas e invenciones factuales ocasionales.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- No se documenta capacidad de visión ni audio (la variante es solo texto).
- Capacidades multilingües limitadas a tamil e inglés.

## Casos de uso

- Atención al cliente sobre documentación tamil: el modelo responde preguntas extrayendo la frase relevante de un pasaje (FAQ, manual, ficha de producto) y señala de forma fiable cuándo la respuesta no está en el texto, lo que reduce respuestas inventadas en dominios acotados.
- Verificación de afirmaciones en tamil: dado un texto y una afirmación, clasifica la relación lógica (implicación, contradicción, neutralidad), útil en moderación de contenido o validación de resúmenes.
- Traducción de frases cortas inglés-tamil en interfaces y formularios: adecuado para localizar cadenas de UI, avisos y mensajes breves, no para documentos largos.
- NLP offline en dispositivo: con 1B de parámetros y unos 2 GB en bf16, se puede ejecutar en un portátil o en Apple Silicon vía MLX sin conexión, lo que sirve para entornos con requisitos de privacidad o sin red.
- Extracción de respuestas en pipelines de formularios y trámites: dado un documento tamil y una pregunta estructurada, devuelve el dato concreto, integrable en un flujo de procesamiento por lotes.
- Prototipado rápido de tareas NLI y QA en tamil: al ser pequeño y cargar en transformers estándar, permite iterar sobre plantillas y evaluar con conjuntos como IndicXNLI o IndicQA antes de escalar a modelos mayores.
- Generación de borradores breves en tamil (mensajes, listas, resúmenes de una frase) con revisión humana obligatoria por el riesgo de invención de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea | Conjunto de evaluacion | Metrica | Minmini-1B |
|---|---|---|---|
| Inferencia de lenguaje natural | IndicXNLI (tamil, test, 1.000 pares) | Accuracy (prompt Tamil-Bench) | 75,0 |
| QA extractiva | IndicQA (tamil, 1.000 preguntas) | F1 | 52,1 |
| QA extractiva | IndicQA (tamil, 1.000 preguntas) | Exact match | 43,9 |
| Traduccion EN→TA | FLORES-200 devtest (eng_Latn-tam_Taml, 5-shot) | chrF | 46,8 |
| Traduccion TA→EN | FLORES-200 devtest (tam_Taml-eng_Latn, 5-shot) | chrF | 45,1 |

Datos adicionales citados en la model card (fuera del model-index): IndicQA F1 55,1 y NLI 79,5 % en ítems del leaderboard de Tamil-Bench; MILU 28,0 % (azar 25 %); Belebele 36,9 %; AUC de 0,89 para la detección de preguntas no respondibles; robustez al orden de opciones en NLI entre 75,0 y 75,7 %. El autor compara con Sarvam (105B): IndicXNLI 58,2 % e IndicQA F1 44,5 con los mismos prompts.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 2 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para inferencia cómoda.
- VRAM en cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,6 GB (cuantizaciones no publicadas oficialmente por el autor).
- GPU consumer: cabe holgadamente en cualquier GPU con 4 GB o más (RTX 3050, RTX 4060, RTX 4090); también en CPU y en Apple Silicon.
- GPU de datacenter: A100, H100 y similares no son necesarias; el modelo está pensado para hardware modesto.
- Despliegue: transformers (referencia oficial), MLX en Apple Silicon (referencia oficial), text-generation-inference (etiqueta del repo); llama.cpp, Ollama y vLLM no están documentados por el autor para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamil (NLI / QA F1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minmini-1B | 1B | no disponible | 75,0 % / 52,1 | Gemma | Hugging Face, safetensors |
| Sarvam (segun el autor) | 105B | no disponible | 58,2 % / 44,5 (mismos prompts) | no disponible | no disponible |
| Gemma-3-1B-IT (base) | 1B | no disponible | no disponible | Gemma | Hugging Face |
| Gemini 3.8 Flash / Claude Sonnet 5.5 (segun el autor) | no disponible | no disponible | inferiores en NLI tamil segun el autor | propietaria | API |

La comparación con Sarvam y con los modelos propietarios procede de la model card y no está verificada de forma independiente; además, Minmini fue ajustado sobre los formatos evaluados, lo que favorece sus cifras frente a modelos no ajustados en esas plantillas.

## Limitaciones y advertencias

- Resultados en formato supervisado: las métricas se obtuvieron con las mismas plantillas usadas en el entrenamiento, por lo que no son comparables de forma directa con modelos evaluados zero-shot.
- Conocimiento factual muy limitado: MILU 28,0 % frente a un 25 % de azar; el modelo inventa hechos y no sirve como fuente de conocimiento ni para preguntas de examen.
- Razonamiento aritmético débil en tamil: errores como escribir 12 − 5 = 5; fiable solo en problemas simples y en inglés.
- Escritura larga y chat multi-turno no evaluados y, según el autor, no adecuados: pierde el hilo en respuestas largas.
- Riesgo de alucinación en redacción libre: palabras erróneas e invenciones factuales ocasionales.
- Idiomas limitados a tamil e inglés; no se documenta cobertura de otras lenguas índicas.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Google, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de producción.
- Longitud de contexto no documentada en la información disponible; hereda la de Gemma-3-1B-IT.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su integración en pipelines que requieran llamadas a funciones.
- Modelo con pocas descargas (649) y creado recientemente: ecosistema y validación externa escasos.

## Enlaces

- Hugging Face: https://huggingface.co/Felamity-Technologies/Minmini-1B
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset IndicXNLI: https://huggingface.co/datasets/Divyanshu/indicxnli
- Dataset IndicAlign: https://huggingface.co/datasets/ai4bharat/indic-align
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- IndicQA: https://huggingface.co/datasets/ai4bharat/IndicQA
- FLORES-200: https://huggingface.co/datasets/facebook/flores
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
