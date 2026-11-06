# asharrm/juke-1.7b-dev-GGUF

## Resumen

juke-1.7b v1.1 es un modelo de 1.721.605.120 parámetros (aproximadamente 1,7 mil millones) especializado en generar listas de reproducción de canciones reales a partir de una indicación en lenguaje natural. Lo desarrolla el usuario asharrm y se distribuye en formato GGUF para su uso con llama.cpp, Ollama o LM Studio. El modelo parte de Qwen/Qwen3-1.7B como base y ha sido ajustado para una tarea muy concreta: dado un prompt como "bossa nova brunch" o cualquier idea disparatada, devuelve un título, una línea descriptiva y una lista numerada de canciones.

La innovación principal es el uso de identificadores semánticos de canción con el formato `<a_67><b_10><c_0>`, que codifican de forma unívoca cada una de las 229.042 canciones del catálogo interno. Esto permite que el modelo "nombre" canciones reales en lugar de inventarlas, un problema clásico de los modelos generativos aplicados a recomendación musical. El modelo puede además razonar en voz alta como un DJ antes de emitir la lista, y ese modo de pensamiento se puede desactivar.

Esta ficha corresponde a la versión cuantizada GGUF del modelo base asharrm/juke-1.7b-dev. El autor publica cinco cuantizaciones (bf16, q8_0, q6_k, q5_k_m y q4_k_m) con métricas de calidad propias, y recomienda q4_k_m por su equilibrio entre tamaño (1,11 GB) y fidelidad (97,1 % de coincidencia entre nombre y código de canción). La licencia es CC-BY-SA-4.0, lo que permite uso comercial con atribución y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B), con modo de razonamiento tipo thinking |
| Parametros totales | 1.721.605.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de arranque usa `-c 2048`) |
| Tipos de cuantizacion | bf16, q8_0, q6_k, q5_k_m, q4_k_m (no se ofrece q3_k_m) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-1.7B, reajustado para la tarea de generación de listas de reproducción. La particularidad arquitectónica más relevante no está en el backbone sino en la representación de la salida: cada canción se identifica mediante un código semántico de tres componentes (`<a_><b_><c_>`), y el modelo aprende a emitir ese código junto con el nombre del artista y el título de la canción. El catálogo interno cubre 229.042 canciones.

El modelo soporta un modo de "pensamiento" (thinking) en el que primero razona como un DJ y después emite la lista. Ese modo se puede desactivar iniciando el turno del asistente con un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) o usando `/no_think` en clientes compatibles. La versión v1.1 incorpora una corrección del problema de repetición de canciones dentro de una misma lista. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en la documentación proporcionada.

## Capacidades

- Generación de listas de reproducción numeradas a partir de un prompt libre, con título y una línea de idea.
- Emisión de identificadores semánticos de canción que mapean a canciones reales del catálogo de 229.042 temas.
- Modo de razonamiento "DJ" (thinking) activable y desactivable.
- Generación de texto conversacional en inglés.
- Formato de chat incluido en los ficheros GGUF (chat template).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Generación automática de playlists temáticas: el modelo convierte una idea como "bossa nova brunch" en una lista de canciones reales con artista y título, lo que permite construir un generador de playlists para una app de música o un bot de chat.
- Recomendación musical conversacional: al aceptar prompts libres y devolver una lista estructurada, se puede integrar en un asistente que sugiera música según el estado de ánimo o la ocasión descritos por el usuario.
- Prototipado de funciones de descubrimiento musical: el formato de código `<a_><b_><c_>` permite mapear directamente la salida a un catálogo interno, lo que simplifica la integración con un backend de streaming o una base de datos de canciones.
- Generación de contenido para blogs o newsletters musicales: el modelo produce un título, una idea y una lista numerada, material directamente publicable o editable.
- Experimentación en investigación sobre identificadores semánticos: el modelo sirve como caso de estudio de cómo representar entidades del mundo real (canciones) mediante tokens especiales en un modelo pequeño.
- Despliegue local en hardware modesto: con cuantización q4_k_m (1,11 GB) se puede ejecutar en un portátil o en una GPU de gama media para demos y pruebas offline con Ollama o llama.cpp.
- Pruebas de robustez de recomendación: el script de evaluación del autor (`eval_overfit.py`) permite medir la coincidencia entre nombre y código de canción, útil para validar integraciones antes de producción.

## Benchmarks y rendimiento

El autor publica métricas propias de calidad por cuantización, medidas con 110 generaciones greedy (con y sin thinking) y unas 1.000 pistas por fichero, sobre prompts reservados, paráfrasis y 40 prompts variados. La columna "Name matches code" indica el porcentaje de veces que el artista y el título escritos pertenecen al código de canción emitido; "Repeats" es la proporción de pistas repetidas dentro de una misma lista.

| Fichero | Tamano | Name matches code | Repeats | Velocidad (tok/s) |
|---|---:|---:|---:|---:|
| juke-1.7b-v1.1-bf16.gguf | 3,45 GB | 97,3 % | 1,7 % | 77 |
| juke-1.7b-v1.1-q8_0.gguf | 1,84 GB | 98,0 % | 1,8 % | 151 |
| juke-1.7b-v1.1-q6_k.gguf | 1,42 GB | 98,5 % | 1,6 % | 182 |
| juke-1.7b-v1.1-q5_k_m.gguf | 1,26 GB | 98,0 % | 2,2 % | 192 |
| juke-1.7b-v1.1-q4_k_m.gguf | 1,11 GB | 97,1 % | 1,3 % | 202 |

Las velocidades se midieron en una PS5 con Linux (GPU AMD gfx1013, llama.cpp b11669, Vulkan, todas las capas en GPU). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para q4_k_m, 1,4 GB para q6_k, 1,9 GB para q8_0 y 3,5 GB para bf16, sin contar el espacio de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones pequeñas; una RTX 3060, RTX 4060 o superior es suficiente. Para bf16 conviene una GPU con 6 GB o más.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en tarjetas de gama media y baja; q4_k_m funciona incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF. El autor incluye el chat template.
- Latencia y throughput: 202 tok/s con q4_k_m, 192 tok/s con q5_k_m, 182 tok/s con q6_k, 151 tok/s con q8_0 y 77 tok/s con bf16, medidos en una PS5 con Vulkan y todas las capas en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de recomendación musical con identificadores semánticos en la documentación proporcionada. Como referencia de tamaño y familia, se puede comparar con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---:|---|---|---|---|
| juke-1.7b v1.1 (este) | 1,72 B | no disponible | Generación de playlists con IDs semánticos | CC-BY-SA-4.0 | GGUF, safetensors |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible | Generación de texto general | no disponible en esta ficha | safetensors, GGUF |
| Alternativas de recomendación musical | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documenta soporte multilingüe.
- La cuantización q3_k_m no se ofrece porque en pruebas el nombre de la canción coincidía con el código solo el 74 % de las veces, lo que provoca que el modelo nombre canciones equivocadas.
- Riesgo de alucinación en los nombres de artista y título: aunque el código de canción sea válido, el nombre escrito puede no corresponder; el propio autor mide esta discrepancia (entre el 1,5 % y el 2,9 % según la cuantización).
- El catálogo está limitado a 229.042 canciones; cualquier petición fuera de ese catálogo no podrá resolverse con una canción real.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; hay que revisar las implicaciones para productos propietarios.
- El modelo está entrenado para una tarea muy específica; no es adecuado como modelo de propósito general ni para razonamiento, código o matemáticas.
- No se documentan sesgos concretos, pero al ser un modelo pequeño ajustado sobre un catálogo musical puede heredar sesgos de selección del catálogo (géneros, épocas, artistas sobrerrepresentados).
- El contexto máximo no está documentado; el ejemplo de arranque usa `-c 2048`, por lo que conviene no asumir ventanas mayores sin probarlas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/asharrm/juke-1.7b-dev-GGUF
- Modelo base: https://huggingface.co/asharrm/juke-1.7b-dev
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
