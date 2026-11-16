# Lucasgitguy-co/wiki-model-tiny

## Resumen

wiki-model-tiny es un modelo de lenguaje de 12,5 millones de parámetros entrenado desde cero en PyTorch por el desarrollador Lucasgitguy-co. Su objetivo es acotado y explícito: enunciar hechos extraídos de Wikipedia en inglés. No es un modelo de propósito general, sino un artefacto especializado que ejecuta cuatro tareas concretas: dar un hecho sobre un tema, generar un hecho aleatorio, responder preguntas cortas y corregir afirmaciones falsas. El modelo se distribuye con un CLI propio y un índice BM25 opcional de aproximadamente 600 MB que permite el modo `--grounded`, en el que las respuestas se apoyan en un artículo fuente recuperado en tiempo de ejecución.

La arquitectura es un decoder estilo Llama de 8 capas, dimensión 320, 8 cabezas de atención, SwiGLU de 864, RoPE, RMSNorm y embeddings atados, con un tokenizador BPE byte-level propio de 8.192 tokens. La longitud de contexto es de solo 384 tokens, coherente con su naturaleza de modelo de frases y respuestas breves. El entrenamiento se realizó en tres etapas sobre una única Apple M4 (MPS + CPU) en unas 10 horas totales, lo que da una idea de la escala deliberadamente modesta del proyecto.

Su relevancia es doble. Por un lado, es un ejemplo didáctico y reproducible de pipeline completo (tokenizador propio, preentrenamiento, ajuste multitarea y evaluación con recuperación). Por otro, ilustra con datos honestos una lección importante: un modelo de este tamaño falla mucho cuando responde de memoria, pero con recuperación léxica (BM25) y una ventana de contexto mínima alcanza cifras de Q&A muy superiores, lo que lo convierte en una pieza útil para estudiar arquitecturas RAG ligeras y no tanto para despliegues de producción generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama: 8 capas, d=320, 8 cabezas, SwiGLU 864, RoPE, RMSNorm, embeddings atados |
| Parametros totales | 12.539.200 (12,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache-2.0 (codigo y pesos); el texto de entrenamiento proviene de Wikipedia bajo CC BY-SA |
| Formato de pesos | safetensors (libreria PyTorch) |
| Tokenizador | BPE byte-level propio de 8.192 tokens con las etiquetas de tarea como tokens especiales |
| Tamano del repo | 0,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama, sin mezcla de expertos ni componentes de estado recurrente. La configuración es minimalista: 8 capas con dimensión oculta de 320, 8 cabezas de atención, FFN SwiGLU de dimensión 864, normalización RMSNorm y embeddings de entrada y salida atados para reducir parámetros. Usa RoPE para la codificación posicional y un tokenizador BPE byte-level entrenado específicamente para el proyecto, de 8.192 tokens, que reserva tokens especiales para las cuatro etiquetas de tarea (`<fact>`, `<q>`, `<fix>`, `<ctx>`).

El entrenamiento se organizó en tres etapas. La primera consistió en preentrenamiento sobre 98 millones de tokens de texto de artículos de Wikipedia en inglés (snapshot `wikimedia/wikipedia` 20231101.en, 141.000 artículos). La segunda etapa introdujo 288.000 ejemplos de tarea, de los cuales el 35 % incluían contexto recuperado, extraídos de 948.000 artículos de `wikimedia/structured-wikipedia` y del `FactfulDataset`. La tercera etapa fue un refuerzo específico de la tarea de corrección: 48.000 ejemplos adicionales de FactfulDataset (la mitad con contexto recuperado) más repetición de las otras tareas para evitar olvido catastrófico. Todo el entrenamiento se ejecutó en una sola Apple M4 combinando MPS y CPU, en aproximadamente 10 horas. No se documenta uso de RLHF ni DPO.

La innovación técnica principal no está en el modelo sino en su envoltorio: el modo `--grounded` recupera contexto en tiempo de ejecución mediante un índice BM25 sobre Wikipedia y lo inyecta en la ventana de 384 tokens. Además, el CLI verifica cada respuesta contra el índice y la marca como `supported` o `unverified` mediante una heurística de solapamiento de palabras (token F1 ≥ 0,5 frente a una frase del artículo del tema), no mediante un verificador de hechos real.

## Capacidades

- Generación de hechos sobre un tema a partir de la frase inicial del artículo correspondiente (`wiki-model "Eiffel Tower"`).
- Generación de hechos aleatorios (`--random`).
- Respuesta a preguntas cortas y directas (`--q "Who wrote Hamlet?"`), incluidas preguntas plantilladas sobre unos 60 campos de infobox (nacimiento, fundación, capital, género, director, familia, etc.).
- Corrección de afirmaciones falsas (`--fix`), con salida de la afirmación corregida o de la cadena "Can't verify from Wikipedia." cuando no hay verificación posible.
- Respuesta con recuperación aumentada (`--grounded`): recupera el artículo fuente con BM25 e imprime el artículo utilizado junto a la respuesta.
- Marcado automático de respuestas como `supported` o `unverified` mediante heurística de solapamiento léxico.
- Soporte de etiquetas de tarea estructuradas en el prompt (`<fact>`, `<q>`, `<fix>`, `<ctx>`), lo que permite invocaciones programáticas desde Python (`load_model`, `run`, `FactIndex`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Extracción de hechos para fichas y resúmenes: dado un título de artículo, el modelo devuelve la frase inicial del abstract, útil para generar descripciones cortas de entidades en pipelines de enriquecimiento de datos con modo `--grounded` para trazabilidad.
- Q&A de infobox en modo grounded: para preguntas del tipo "¿quién dirigió X?" o "¿cuándo se fundó Y?", la recuperación BM25 más la ventana de 384 tokens alcanza un 90,7 de EM en infobox según la model card, lo que lo hace adecuado para asistentes de consulta factual acotada sobre un corpus controlado.
- Verificación léxica de frases en pipelines de curación: el marcado `supported`/`unverified` permite filtrar afirmaciones candidatas contra el artículo del tema antes de publicarlas, con la advertencia de que es una heurística de solapamiento y no un fact-checker.
- Docencia y reproducción de pipelines LLM: al ser un modelo de 12,5 M entrenado desde cero en 10 horas sobre una M4, sirve como caso de estudio completo de tokenizador propio, preentrenamiento, ajuste multitarea y evaluación con recuperación.
- Prototipado de arquitecturas RAG ligeras: el binomio modelo diminuto + índice BM25 permite experimentar con estrategias de recuperación y formateo de contexto sin coste de GPU, midiendo el impacto de la recuperación en métricas de Q&A.
- Generación de datos sintéticos factuales acotados: la tarea de hechos aleatorios y la de preguntas plantilladas pueden emplearse para producir pares pregunta-respuesta de baja calidad pero controlados, útiles como datos de arranque o para pruebas de pipelines.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre artículos y afirmaciones held-out (split por título de artículo, nunca vistos en entrenamiento). "Grounded" recupera contexto con BM25 en tiempo de ejecución; no recibe el artículo gold. "Fact supported" exige coincidencia con una frase del artículo del tema con token F1 ≥ 0,5.

| Modelo | Modo | Q&A infobox EM | 'What is X' F1 | Fix (FEVEROUS) EM | Fix can't-verify acc | Fix (year swap) EM | Fact supported (temas nuevos) | Fact supported (temas conocidos) |
|---|---|---|---|---|---|---|---|---|
| wiki-model | solo modelo | 14,7 | 30,0 | 37,0 | 88,5 | 65,0 | 12,0 | 10,0 |
| wiki-model | grounded | 94,7 | 65,3 | 37,0 | 88,0 | 83,0 | 98,0 | 98,0 |
| wiki-model-tiny | solo modelo | 14,7 | 28,2 | 32,5 | 89,0 | 54,0 | 5,0 | 8,0 |
| wiki-model-tiny | grounded | 90,7 | 58,0 | 33,5 | 89,0 | 55,0 | 92,0 | 94,0 |
| SmolLM2-135M few-shot | solo modelo | 10,0 | 18,9 | 11,0 | 11,0 | 66,0 | 16,0 | 16,0 |
| SmolLM2-135M few-shot | grounded | 26,7 | 25,2 | 6,5 | 36,5 | 47,0 | 65,0 | 71,0 |
| copy the claim | solo modelo | — | — | 47,5 | 89,0 | 71,0 | — | — |

Lectura de los datos: en modo grounded, wiki-model-tiny obtiene 90,7 de EM en Q&A de infobox y 92-94 de "fact supported", muy por encima del SmolLM2-135M con few-shot. En cambio, la tarea de corrección es su punto débil: en FEVEROUS queda por debajo del baseline trivial "copy the claim" (32,5 frente a 47,5), y en el conjunto de intercambio de años apenas mejora el 54 frente al 71 del baseline. La precisión del 89 % en "can't-verify" es la tasa base del conjunto, no una capacidad real del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (12,5 M de parámetros, unos 50 MB de pesos) y del orden de decenas de MB en fp16; el cuello de botella real es el índice BM25 de aproximadamente 600 MB en modo `--grounded`, que se descarga del repositorio de dataset.
- GPU recomendadas: no requiere GPU. El autor lo entrenó y ejecutó en una Apple M4 con MPS y CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente; también funciona íntegramente en CPU.
- Cabe en cualquier GPU consumer y en hardware integrado; el límite práctico es la RAM necesaria para mantener el índice BM25 cargado.
- Opciones de despliegue: el paquete se instala con `pip install -e .` e incluye un CLI (`wiki-model`) y una API Python (`load_model`, `run`, `FactIndex`). Depende de torch, tokenizers, bm25s, transformers y huggingface_hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, la latencia vendrá dominada por la recuperación BM25 y la carga del índice, no por el cómputo del transformer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Q&A infobox EM (grounded) | Fact supported (grounded) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wiki-model-tiny | 12,5 M | 384 | 90,7 | 92-94 | Apache-2.0 | Hugging Face (Lucasgitguy-co/wiki-model-tiny) |
| wiki-model | 135 M (fine-tune de SmolLM2-135M) | No disponible en la informacion | 94,7 | 98 | Apache-2.0 | Hugging Face (Lucasgitguy-co/wiki-model) |
| SmolLM2-135M few-shot | 135 M | No disponible en la informacion | 26,7 | 65-71 | No disponible en la informacion | Hugging Face (HuggingFaceTB/SmolLM2-135M) |

La comparación relevante es con su hermano mayor, wiki-model (135 M, fine-tune de SmolLM2-135M), que supera a tiny en todas las métricas grounded y especialmente en la tarea de corrección (83 frente a 55 en year swap). Frente al SmolLM2-135M sin ajustar con few-shot, tiny gana claramente en Q&A y fact supported en modo grounded, pero pierde en la tarea de corrección de año (54 frente a 66 en modo solo modelo). El baseline "copy the claim" supera a tiny en ambas tareas de corrección, lo que delimita con claridad dónde no usar el modelo.

## Limitaciones y advertencias

- Las respuestas de memoria son frecuentemente erróneas o inventadas, sobre todo en temas poco conocidos; el propio autor recomienda `--grounded` para cualquier uso que importe.
- Solo inglés. El corpus de entrenamiento es Wikipedia en inglés con snapshots de 2024 (structured) y 2023 (texto plano), por lo que no cubre hechos posteriores ni otras lenguas.
- La corrección de afirmaciones falsas es la tarea más débil: en FEVEROUS queda por debajo de simplemente repetir la afirmación (32,5 frente a 47,5 de EM), porque a menudo reformula afirmaciones que ya eran verdaderas. Prácticamente nunca responde "Can't verify", y el 89 % de precisión en esa categoría es la tasa base del conjunto.
- El marcado `supported`/`unverified` es una heurística de solapamiento de palabras contra el artículo del tema, no un verificador de hechos; puede marcar como soportadas frases incorrectas que compartan vocabulario.
- En modo grounded, la calidad depende por completo de la recuperación BM25; si el artículo recuperado no es el correcto, la respuesta será incorrecta aunque el modelo la marque como soportada.
- La ventana de contexto de 384 tokens limita la cantidad de contexto recuperado que cabe en el prompt y descarta casos que requieran razonamiento sobre documentos largos.
- Licencia Apache-2.0 para código y pesos, pero el texto de entrenamiento proviene de Wikipedia bajo CC BY-SA, lo que conviene tener en cuenta al redistribuir derivados del corpus.
- El modelo no tiene tool calling, ni capacidades de agente, ni visión, ni audio, ni razonamiento multi-paso; no debe emplearse como sustituto de un LLM generalista.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación independiente de los benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/wiki-model-tiny
- Modelo hermano (135 M): https://huggingface.co/Lucasgitguy-co/wiki-model
- Dataset de hechos e índice: https://huggingface.co/datasets/Lucasgitguy-co/wiki-model-facts
- Dataset FactfulDataset: https://huggingface.co/datasets/Bulutthecat/FactfulDataset
- Dataset structured-wikipedia: https://huggingface.co/datasets/wikimedia/structured-wikipedia
- Dataset wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
