# ductai199x/utter

## Resumen

Utter cleanup models es una familia de modelos de limpieza de dictado desarrollada por ductai199x dentro del proyecto Utter, una aplicación de dictado por voz que funciona en local. El modelo no transcribe audio: recibe la salida de un reconocedor de voz (NVIDIA Parakeet) y devuelve el texto que el hablante pretendía escribir, aplicando puntuación, mayúsculas, formato de números y símbolos hablados, eliminación de muletillas, corrección de gramática y aplicación de autocorrecciones dictadas ("at 2, actually 3", "scratch that"). Está pensado para integrarse en el flujo de una app de dictado, no como asistente conversacional: el texto dictado se escribe, nunca se responde.

La familia incluye tres niveles. Quality v2 y Light v2 son ajustes LoRA (rango 16, alpha 32) sobre los checkpoints QAT sin cuantizar de Gemma 4 E4B y Gemma 4 E2B respectivamente, fusionados y cuantizados a Q4_0. Extra light v1 es un ajuste completo de todos los pesos de Gemma 3 1B (no LoRA) sobre el mismo conjunto de datos, también en Q4_0. El repositorio ocupa 18,2 GB e incluye pesos GGUF, adaptadores LoRA y las versiones v1 anteriores.

La relevancia del modelo está en su enfoque de producto: resuelve un problema muy concreto (convertir transcripción cruda en texto limpio y editable) con modelos pequeños que caben en GPU de consumo e incluso en CPU de móvil, y publica el conjunto de datos de entrenamiento y una evaluación con juez automático calibrado contra revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 E4B / E2B y Gemma 3 1B), ajuste LoRA o completo |
| Parametros totales | 4.628.569.635 (repo safetensors agregado; por variante: Quality v2 sobre Gemma 4 E4B, Light v2 sobre Gemma 4 E2B, Extra light v1 sobre Gemma 3 1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF); adaptadores LoRA en precision del checkpoint base |
| Idiomas soportados | en (ingles) |
| Licencia | other (apache-2.0-and-gemma, ver LICENSE.md) |
| Formato de pesos | safetensors, GGUF, adaptadores LoRA |

## Arquitectura y entrenamiento

Los modelos se construyen sobre checkpoints de Google: Gemma 4 E4B y E2B (en su versión QAT q4_0 sin cuantizar) para Quality y Light, y Gemma 3 1B para Extra light. Quality y Light se entrenan con LoRA de rango 16 y alpha 32, una pasada sobre el split de entrenamiento del dataset ductai199x/dictation-to-text (79.246 pares), learning rate 2e-4 y una época; después se fusionan y cuantizan a Q4_0, el formato para el que el QAT fue entrenado. Extra light entrena todos los pesos con learning rate 2e-5 y dos épocas, porque un adaptador de rango 16 dejaba al modelo pequeño con la tendencia a continuar listas en lugar de cerrarlas.

Los datos son pares (salida del reconocedor, texto pretendido). El lado escrito procede de pasajes reales de Common Pile (Stack Exchange, GitHub, abstracts de arXiv, IRC de Ubuntu) y Wikipedia, más listas y mensajes cotidianos generados por LLM. El lado hablado lo genera Gemma 4 26B-A4B en ocho variedades (plano, puntuación hablada, disfluente, autocorrección, comando de retracción, reformulación de frase, errores gramaticales y edición lejana), se valida por código, se sintetiza con Kokoro TTS y se reconoce con Parakeet. Las claves de respuesta se corrigen para erratas y gramática, verificando cada corrección con ERRANT. El dataset se divide por pasaje, de modo que ningún pasaje de test o evaluación se usa en entrenamiento. Una parte de los pares incluye líneas `Dictionary:` con la grafía correcta de palabras mal oídas y con palabras casi coincidentes que no deben forzarse.

## Capacidades

- Limpieza de dictado: añade puntuación y mayúsculas no pronunciadas.
- Normalización de símbolos y números hablados ("four x faster" a "4× faster", "about two forty" a "~240").
- Eliminación de muletillas y falsos arranques.
- Aplicación de autocorrecciones: "at 2, actually 3", "scratch that" (última frase), "let's start over" (todo).
- Ediciones lejanas: "actually, change the eggs to three boxes".
- Conversión de listas habladas en viñetas, numeradas cuando son pasos.
- Corrección gramatical manteniendo las palabras del hablante.
- Respeto de un diccionario personal para la grafía de nombres y términos propios.
- Dictado literal: una pregunta o instrucción dirigida a una IA se devuelve como texto, no se responde.
- Soporte de contexto opcional por mensaje: `App:`, `Before:`, `Lists:`, `Dictionary:`.
- Modo thinking desactivable (debe ir desactivado: `enable_thinking: false`).

## Casos de uso

- Dictado en correo electrónico: el modelo recibe la transcripción con `App: email` y contexto previo al cursor, y devuelve el texto con puntuación y formato listos para enviar; su evaluación "Ready to send" mide exactamente este escenario (88,1% en Quality v2 con voces Kokoro).
- Notas rápidas y listas: convierte enumeraciones habladas en viñetas o listas numeradas para pasos, útil en apps de notas donde el usuario dicta sin mirar la pantalla.
- Prompts para asistentes de IA: el test "Directed" (292 dictados de preguntas, peticiones a asistentes e instrucciones a agentes de código) valida que el texto se escribe sin ser respondido, con un 87,7% en Quality v2 con diccionario.
- Dictado con vocabulario propio: la línea `Dictionary:` permite que nombres como "Utter" o "Nguyen" se escriban correctamente cuando el reconocedor los confunde, sin forzar palabras parecidas que no corresponden.
- Corrección de texto dictado con errores: aplica arreglos gramaticales verificados con ERRANT manteniendo las palabras del hablante, adecuado para usuarios que dictan y quieren un texto publicable sin reescribir.
- Edición por voz de texto ya escrito: comandos como "scratch that" o ediciones lejanas permiten corregir frases anteriores sin seleccionar manualmente, útil en flujos de escritura largos.
- Despliegue en movil o equipos sin GPU: Extra light v1 (720 MB, Q4_0) está pensado para el teléfono de Utter y para ordenadores sin tarjeta gráfica, con un tiempo mediano de limpieza de 1,49 s en CPU de Pixel 10 Pro XL.

## Benchmarks y rendimiento

La evaluación usa "Ready to send": la proporción de dictados que un escritor cuidadoso enviaría tal cual, juzgada por Gemma 4 26B-A4B con una rúbrica calibrada contra revisión humana.

| Ready to send | Quality v2 | Light v2 |
|---|---|---|
| Realistic, voces Kokoro | 88,1% | 85,4% |
| Realistic, con diccionario de 300 términos | 87,8% | 85,7% |
| Realistic, voces Chatterbox no vistas | 80,1% | 75,5% |
| Directed, con diccionario | 87,7% | 83,6% |
| Tiempo de limpieza, mediana (RTX 3090 Ti) | ~250 ms | ~180 ms |

| Ready to send | Light v2 | Extra light v1 |
|---|---|---|
| Kokoro, pasajes reales | 85,7% | 79,7% |
| Voces Chatterbox no vistas | 74,6% | 67,0% |
| Test de texto tecleado | 64,3% | 51,9% |
| Tiempo de limpieza, mediana (CPU Pixel 10 Pro XL) | 2,69 s | 1,49 s |

Los conjuntos de test son 950 dictados retenidos (Realistic) y 292 dictados (Directed); Extra light se evalúa además sobre 25.469 dictados retenidos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Quality v2 (Gemma 4 E4B, Q4_0): unos 3,3 GB de memoria de GPU cuando los embeddings por capa permanecen en RAM del sistema.
- Light v2 (Gemma 4 E2B, Q4_0): unos 1,8 GB de memoria de GPU; en ese caso Utter ejecuta el reconocimiento de voz en CPU.
- Extra light v1 (Gemma 3 1B, Q4_0): 720 MB, diseñado para equipos sin tarjeta gráfica y para la app móvil.
- GPU recomendadas: RTX 3090 Ti para las cifras de latencia publicadas; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería alojar Quality v2, y con 2 GB o más Light v2.
- Despliegue: llama.cpp (build b11535 o posterior), formato GGUF Q4_0; los adaptadores LoRA están disponibles en safetensors para fusionar o seguir entrenando.
- Latencia: mediana de ~250 ms (Quality v2) y ~180 ms (Light v2) en RTX 3090 Ti; 2,69 s (Light v2) y 1,49 s (Extra light v1) en CPU de Pixel 10 Pro XL. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Utter Quality v2 | Gemma 4 E4B (Q4_0) | no disponible | Limpieza de dictado | apache-2.0-and-gemma | GGUF + LoRA en HF |
| Utter Light v2 | Gemma 4 E2B (Q4_0) | no disponible | Limpieza de dictado | apache-2.0-and-gemma | GGUF + LoRA en HF |
| Utter Extra light v1 | Gemma 3 1B (Q4_0) | no disponible | Limpieza de dictado | apache-2.0-and-gemma | GGUF en HF |
| Gemma 4 E4B / E2B base | 4B / 2B | no disponible | LLM generalista | Gemma | HF |
| Gemma 3 1B base | 1B | no disponible | LLM generalista | Gemma | HF |

La comparación directa con otros modelos de limpieza de dictado no está disponible en la información proporcionada; los modelos base de Google son alternativas generalistas, pero no están ajustados para esta tarea ni publican métricas "Ready to send".

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés; no hay soporte multilingüe declarado.
- Dependencia del reconocedor: está ajustado sobre salidas de NVIDIA Parakeet; otros reconocedores pueden degradar el rendimiento.
- El prompt de sistema debe ser exactamente el especificado; las reglas están en los pesos y el prompt corto es parte del contrato de uso.
- El modo thinking debe estar desactivado; con thinking activo el comportamiento no está validado.
- El diccionario debe incluir solo términos que suenen en el dictado actual, no la lista completa; el modelo está entrenado para no forzar palabras parecidas que no corresponden.
- Riesgo de alucinación y de reescritura: el modelo corrige gramática y aplica ediciones, por lo que puede alterar el sentido en dictados ambiguos; la evaluación "Ready to send" es del 80,1% en voces no vistas (Quality v2), lo que deja margen de error.
- Licencia mixta apache-2.0-and-gemma: las variantes sobre Gemma 3 (Extra light v1) quedan sujetas a los términos de Gemma; revisar LICENSE.md antes de uso comercial.
- Las versiones v1 se entrenaron antes de publicar los datos, sobre pares que solapan con el split de test actual; no son comparables con v2.
- No se han publicado datos de sesgos, contexto máximo ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ductai199x/utter
- Repositorio de Utter: https://github.com/ductai199x/utter
- Dataset de entrenamiento: https://huggingface.co/datasets/ductai199x/dictation-to-text
- Checkpoint base Quality/Light: https://huggingface.co/google/gemma-4-e4b-it-qat-q4_0-unquantized
- Checkpoint base Light: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Checkpoint base Extra light: https://huggingface.co/google/gemma-3-1b-it-qat-q4_0-unquantized
