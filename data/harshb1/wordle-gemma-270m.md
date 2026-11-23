# harshb1/wordle-gemma-270m

## Resumen

Wordle Gemma 270M es un ajuste fino de Google Gemma 3 270M Instruct realizado por el usuario harshb1 para jugar a Wordle. El modelo recibe como entrada el tablero en curso (lista numerada de intentos con sus colores) y devuelve el siguiente intento en el formato `GUESS: C R A N E`, una letra por token. El repositorio publica una exportación ONNX de 8 bits que se ejecuta en el navegador mediante onnxruntime-web y WebGPU.

La relevancia del proyecto es doble. Por un lado, demuestra que un modelo de 270M de parámetros puede resolver una tarea de razonamiento restringido con cierta solidez si se combina con decodificación estructurada. Por otro, ilustra una técnica de compresión agresiva: al recortar el vocabulario de 262.144 tokens a solo 105, elimina 168M de parámetros de embedding y reduce el artefacto a 115 MB, viable para descarga web.

El modelo es un trabajo en curso. El autor lo describe como una versión temprana y anuncia la publicación del modelo PyTorch completo con la versión final. Con decodificación por trie y beam search de anchura 32 gana aproximadamente el 39% de las partidas bajo reglas estrictas, frente al 100% de un solver óptimo que promedia 3,42 intentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con GroupQueryAttention, RotaryEmbedding y MatMulNBits en la exportación ONNX |
| Parametros totales | 270M en el modelo base; el export ONNX recortado reduce el vocabulario a 105 tokens (tamano efectivo no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings` en `web/config.json`) |
| Tipos de cuantizacion | 8 bits para pesos (q8) con activaciones fp32; el autor menciona q4 y fp32 como alternativas; fp16 no es viable |
| Idiomas soportados | no disponible (la tarea es en inglés y el vocabulario recortado no soporta lenguaje general) |
| Licencia | Gemma Terms of Use (ai.google.dev/gemma/terms) |
| Formato de pesos | ONNX (`model_q8.onnx` + `_data`); PyTorch completo pendiente de publicación |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 270M Instruct, un transformer decoder-only de Google. El ajuste fino se realizó mediante supervisión (SFT) sobre los movimientos de un solver óptimo que abre con SALET, usando únicamente las respuestas del conjunto de entrenamiento. El prompt codifica el tablero como una lista numerada de intentos con sus colores (`1. S A L E T  ⬛🟨⬛🟨⬛`) más el número de intentos restantes, y la respuesta se emite letra a letra.

La innovación técnica principal es el recorte de vocabulario. El vocabulario original de Gemma ocupa 168M de los 270M de parámetros; como los prompts y respuestas usan solo 105 tokens, se conservan únicamente esas filas de embedding y, al estar la cabeza de salida atada al embedding, esta también se reduce. El autor estima que el cambio en el logaritmo de probabilidad de una letra es de como máximo 0,001 nats. No hay tokenizador: `wordle.json` contiene cada pieza del prompt ya tokenizada y la página las concatena. La decodificación se realiza con beam search de anchura 32 sobre un trie de 12.972 intentos válidos, puntuando cada haz con la log-probabilidad de las letras generadas.

## Capacidades

- Generación de texto restringida a la tarea Wordle: produce el siguiente intento dado el estado del tablero.
- Razonamiento de restricciones: interpreta pistas de color (verde, amarillo, gris) y descarta letras y posiciones.
- Salida estructurada en formato fijo `GUESS: X X X X X`, una letra por token.
- Integración con decodificación por trie y beam search para garantizar que cada intento sea una palabra válida del diccionario.
- Ejecución en navegador mediante ONNX Runtime Web y WebGPU.
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües generales.

## Casos de uso

- Demostración educativa de decodificación estructurada: el modelo sirve para mostrar cómo un trie y un beam search convierten un LM pequeño en un generador de salidas válidas y acotadas.
- Inferencia en el navegador sin servidor: el artefacto ONNX de 115 MB se carga en una página web y ejecuta la inferencia localmente con WebGPU, útil para demos interactivas sin coste de backend.
- Estudio de compresión de vocabulario: el recorte de 262.144 a 105 tokens es un caso práctico para investigar el impacto de reducir embeddings en modelos pequeños.
- Evaluación de límites de modelos de 270M: el proyecto mide de forma reproducible (500 partidas de test) cuánto puede resolver un modelo de este tamaño con y sin decodificación guiada.
- Base para ajustes finos en tareas de juego con estado discreto: el formato de prompt (historial de movimientos con feedback) es reutilizable en otros juegos de lógica.
- Prueba de concepto de despliegue ONNX con GroupQueryAttention y MatMulNBits: útil como referencia para exportar otros modelos Gemma a navegador.

## Benchmarks y rendimiento

Reglas estrictas (un intento fuera de la lista de palabras pierde la partida). Respuestas de un split de test reservado.

| Jugador | Victorias [IC 95%] | Media de intentos (victorias) |
|---|---|---|
| Solver óptimo | 100% | 3,42 |
| Este modelo, solo (generación libre) | 26,2% [22,4; 30,2] | 3,52 |
| Este modelo + trie, beam 32 | 39,6% [35,4; 44,0] | 3,86 |
| Archivo de navegador (q8) + trie, beam 32 | 38,6% [34,4; 43,0] | 3,85 |

Las dos primeras filas corresponden al modelo PyTorch completo. El archivo de navegador reproduce los mismos movimientos en 414 de las 500 partidas de test; la diferencia en victorias no es significativa (McNemar p = 0,27).

## Requisitos de hardware

- VRAM estimada: el export q8 ocupa 115 MB en disco y se ejecuta con WebGPU en el navegador; el modelo PyTorch completo de 270M en fp32 requiere aproximadamente 1,1 GB de VRAM (estimación a partir del número de parámetros).
- GPU recomendadas: cualquier GPU con soporte WebGPU para la versión de navegador; para el modelo PyTorch completo, GPU consumer como RTX 3060 o superiores son suficientes.
- Cabe en GPU consumer: sí, tanto el export q8 como el modelo completo de 270M.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime nativo, y el modelo PyTorch mediante transformers cuando se publique.
- Latencia y throughput: no disponibles. El autor solo reporta que el archivo de navegador reproduce los movimientos del modelo completo en 414 de 500 partidas.
- Advertencia de precisión: fp16 no funciona; los estados ocultos de Gemma alcanzan unos 104.000, por encima del máximo de fp16 (65.504), y las activaciones desbordan. Usar fp32 en activaciones (q8, q4 o fp32).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wordle Gemma 270M | 270M (base) | 512 | Wordle | Gemma Terms of Use | ONNX en HF; PyTorch pendiente |
| google/gemma-3-270m-it | 270M | no disponible | Generación de texto general | Gemma Terms of Use | HF |
| Solver óptimo (referencia) | no aplica | no aplica | Wordle | no disponible | Referencia del propio autor |

No se dispone de datos de benchmarks comparativos con otros modelos ajustados a Wordle en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy por debajo del óptimo: 38,6% de victorias frente al 100% del solver; el modelo falla en más de la mitad de las partidas.
- El autor lo califica explícitamente como versión temprana; el modelo PyTorch completo aún no está publicado.
- El vocabulario recortado a 105 tokens elimina cualquier capacidad de lenguaje general; el modelo solo sirve para la tarea Wordle.
- fp16 no es viable por desbordamiento de activaciones; usar fp32.
- Riesgo de alucinación mitigado solo parcialmente por el trie: sin decodificación guiada, la tasa de victorias cae al 26,2%.
- Licencia Gemma Terms of Use: revisar las restricciones de uso comercial antes de desplegar.
- Sesgos conocidos: no documentados por el autor.
- Idiomas soportados: no disponibles; el vocabulario recortado no soporta otros idiomas.
- Entrenado solo con las respuestas del conjunto de entrenamiento; puede no generalizar a variantes de reglas o diccionarios distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshb1/wordle-gemma-270m
- Demo en el navegador (Space): https://huggingface.co/spaces/harshb1/wordle-lm
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Builder de Gemma 3 de Xenova: https://gist.github.com/xenova/a219dbf3c7da7edd5dbb05f92410d7bd
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
