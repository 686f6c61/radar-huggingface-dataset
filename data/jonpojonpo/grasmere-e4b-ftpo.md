# jonpojonpo/Grasmere-E4B-FTPO

## Resumen

Grasmere-E4B-FTPO es un ajuste fino del modelo Grasmere-E4B, desarrollado por el usuario jonpojonpo, que a su vez parte de Gemma 4 E4B-it. Se trata de un modelo de chat orientado a lenguas celtas (galés, irlandés, gaélico escocés y escocés) con inglés como lengua vehicular, que incorpora una corrección específica contra los bucles de repetición detectados en la variante base. El modelo resuelve un problema concreto: la baja calidad de los modelos pequeños en lenguas minoritarias y su escasa capacidad de seguir instrucciones precisas y llamar herramientas en esos idiomas.

La variante FTPO (fine-tuning anti-repetición) reduce drásticamente los bucles en respuestas largas: del 39 % en modo greedy de Grasmere-E4B al 8 %, y del 9 % al 0 % con muestreo normal. A cambio, pierde algunos puntos en tareas concretas (citación, traducción legislativa, matemáticas) y gana en otras (TruthfulQA, ARC, PIQA). El autor la recomienda para uso cotidiano.

El modelo tiene 7.996.156.490 parámetros (aproximadamente 8.000 millones) y se distribuye bajo licencia Apache 2.0. Está entrenado con un enfoque de bajo coste computacional: un solo RTX 4090 y menos de cuatro días de trabajo, con un gasto de API de unos 30 dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B) |
| Parametros totales | 7.996.156.490 (~8.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q5_K_M, Q4_K_M (calibradas con importance matrix de texto celta) |
| Idiomas soportados | cy (galés), ga (irlandés), gd (gaélico escocés), sco (escocés), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,0 GB); quants GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B-it, un transformer decoder-only de aproximadamente 8.000 millones de parámetros. El ajuste se realizó mediante continued pretraining con QLoRA de 4 bits sobre una única RTX 4090, usando rsLoRA con r=128, alpha=32 en todas las capas de atención y MLP de lenguaje, a learning rate 1e-4, más la matriz de embeddings de entrada/salida atada a learning rate 1e-5. La ejecución usó micro-batch 2 con acumulación de gradiente 16, longitud de secuencia 2.048 y 601 pasos (39,3 millones de tokens), con una pérdida final de 2,19.

La mezcla de datos fue aproximadamente 75 % galés, con proporciones menores de irlandés y gaélico escocés, y sin texto en inglés (la capacidad en inglés proviene del modelo base -it y del replay durante el SFT). Las fuentes incluyen FineWeb-2, PDFs, tweets, datos del Senedd galés y texto hablado galés con triple peso. El texto web y PDF se filtró por calidad mediante un profesor Gemma-4-12B-it que puntuó 33.000 documentos. Posteriormente se aplicó un SFT de precisión de instrucciones y tool calling con 6.900 filas verificadas por script y filtradas con Haiku. La variante FTPO añade un ajuste específico para eliminar los bucles de repetición en respuestas largas.

## Capacidades

- Generación de texto conversacional en galés, irlandés, gaélico escocés, escocés e inglés.
- Seguimiento de instrucciones precisas: resumen con longitud exacta, extracción de entidades en JSON, listas con número exacto de viñetas.
- Citación y cita textual de fuentes con verificación de pasajes.
- Tool calling / function calling en las cuatro lenguas celtas, con selección correcta de herramienta y argumentos.
- Comprensión y traducción entre lenguas celtas e inglés (con limitaciones en la dirección hacia irlandés y gaélico escocés).
- Razonamiento de múltiples pasos y respuesta a preguntas factuales.
- Capacidad matemática básica (con pérdida de aproximadamente 4 puntos en la variante FTPO respecto a la base).
- Modo de pensamiento desactivable (thinking off en la configuración de evaluación).

## Casos de uso

- Atención al cliente en galés: el modelo puede gestionar conversaciones multi-turno con instrucciones precisas y citar políticas o cláusulas textuales, gracias a su capacidad de citación verificada y seguimiento de formato JSON.
- Asistentes de tool calling para servicios públicos galeses: integración en un chatbot que consulte APIs de transporte o administración (por ejemplo, "Chwilia am drenau o Fangor i Gaerdydd") con selección correcta de herramienta y argumentos en galés.
- Traducción asistida de documentación oficial: traducción de textos legislativos y administrativos del inglés al galés con BLEU de 45,1 en CymraegBench, adecuada para borradores que un traductor humano revisa.
- Extracción de entidades y resumen estructurado: procesamiento de actas del Senedd o documentos PDF para generar resúmenes con longitud exacta y entidades en JSON, con precisión del 87-90 % en pruebas de script.
- Generación de contenido en escocés: redacción de textos divulgativos o educativos en scots, con la advertencia de que los datos son escasos y la salida puede derivar hacia el inglés.
- Evaluación y anotación lingüística: uso como modelo de referencia para comparar calidad de traducción en lenguas celtas dentro de proyectos de investigación, con licencia Apache 2.0 que permite uso comercial y modificación.
- Despliegue en local para pymes: al caber en una RTX 4090 con cuantización Q4_K_M o Q5_K_M, permite ofrecer chat multilingüe celta sin depender de la nube.

## Benchmarks y rendimiento

CymraegBench (galés generativo; configuración de leaderboard: temperatura 0, suelo de 512 tokens, thinking off, Q8_0, llama.cpp):

| Modelo | Overall | Reasoning | Practical Welsh | Translation BLEU |
|---|---|---|---|---|
| Grasmere (media de 3 muestras) | 50,33 | 53,4 | 47,3 | 45,1 |
| Grasmere-E4B-FTPO (semilla 1) | 50,14 | 52,83 | 47,44 | 41,81 |
| EryriLabs gemma-4-e4b-cymraeg-v4 (leaderboard) | 49,70 | no disponible | no disponible | no disponible |
| Gemma 4 E4B-it (stock, semilla 1) | 40,22 | 39,43 | 41,00 | 26,67 |

Habilidades evaluadas con script (skills_eval.py, sin modelo juez):

| Tarea | Gemma 4 E4B-it | Grasmere |
|---|---|---|
| Tool calls correctos (cy / ga / gd / sco, 8 cada uno) | 75 / 75 / 38 / 50 % | 100 / 88 / 100 / 88 % |
| Cita textual + resumen de longitud exacta, JSON (cy / ga / gd) | 50 / 20 / 27 % | 87 / 87 / 90 % |
| Exactamente 3 viñetas; extracción de entidades JSON | 0–100 % | 100 % |
| FLORES+ chrF en→cy / cy→en | 40,2 / 51,1 | 49,9 / 64,9 |
| FLORES+ chrF ga→en / gd→en | 46,0 / 39,1 | 52,2 / 44,2 |
| FLORES+ chrF en→ga / en→gd | 34,6 / 31,5 | 31,9 / 28,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16; unos 8-9 GB en Q8_0; unos 6 GB en Q5_K_M; unos 5 GB en Q4_K_M.
- GPU recomendadas: RTX 4090 (24 GB) para bf16 o Q8_0 con contexto amplio; A100 o H100 para despliegue en producción con mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 8 GB o más usando cuantizaciones Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp (usado en la evaluación oficial), Ollama, vLLM y TGI para safetensors en bf16.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CymraegBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grasmere-E4B-FTPO | ~8.000 M | no disponible | 50,14 (semilla 1) | Apache 2.0 | Hugging Face |
| Grasmere-E4B | ~8.000 M | no disponible | 50,33 (media de 3) | Apache 2.0 | Hugging Face |
| EryriLabs gemma-4-e4b-cymraeg-v4 | ~8.000 M (base Gemma 4 E4B) | no disponible | 49,70 (leaderboard) | no disponible | Hugging Face |
| Gemma 4 E4B-it (stock) | ~8.000 M | no disponible | 40,22 (semilla 1) | no disponible | Hugging Face |

## Limitaciones y advertencias

- La escritura en irlandés y gaélico escocés está 2-3 chrF por debajo de Gemma stock al traducir hacia esos idiomas, aunque la comprensión mejora. El pretraining continuado fue 76 % galés y solo ~21 % irlandés y gaélico, sin inglés.
- Los bucles de repetición en respuestas largas se reducen con FTPO (8 % greedy, 0 % con muestreo) pero no desaparecen por completo en modo greedy.
- Las fechas relativas ("the morn" en escocés, "20 Samhain") ocasionalmente se resuelven al día actual.
- Los datos de escocés son escasos, por lo que la salida puede derivar hacia el inglés.
- La variante FTPO pierde aproximadamente 8 puntos en citación, 5 en BLEU de traducción legislativa y 4 en matemáticas respecto a Grasmere-E4B en suites de 100 casos.
- Riesgo de alucinación inherente a modelos de ~8.000 millones de parámetros; la citación verificada reduce pero no elimina este riesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 E4B-it puede tener términos adicionales que el autor no detalla; conviene revisar la licencia de Gemma.
- No se han publicado datos de longitud de contexto ni de latencia/throughput en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/jonpojonpo/Grasmere-E4B-FTPO
- Modelo base Grasmere-E4B: https://huggingface.co/jonpojonpo/Grasmere-E4B
- Modelo base original Gemma 4 E4B-it: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
