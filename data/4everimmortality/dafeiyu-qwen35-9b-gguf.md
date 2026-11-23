# 4everImmortality/dafeiyu-qwen35-9b-gguf

## Resumen

`dafeiyu-qwen35-9b` es un ajuste fino (finetune) del modelo base Qwen3.5-9B, desarrollado por el usuario 4everImmortality para el proyecto Tuber Studio, una plataforma de operación y emisión en directo de VTubers. El modelo está especializado en roleplay conversacional y generación de comentarios para interacción en plataformas de vídeo, con soporte de entrada imagen-texto (image-text-to-text) heredado del modelo base.

El modelo se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, con un peso principal cuantizado Q4_K_M y un proyector visual Q8_0 separado. Está entrenado mediante DoRA (una variante de LoRA) sobre el checkpoint-38, fusionado posteriormente en el modelo base. Los idiomas soportados son chino (zh) e inglés (en).

Su relevancia radica en ser un ejemplo de ajuste fino de propósito muy específico: un modelo de 8.950 millones de parámetros orientado a la personificación de un personaje concreto (大肥鱼) en contextos de emisión en directo, con una ventana de contexto declarada de 262.144 tokens en la configuración de producción del autor. La licencia es "other", lo que requiere revisión de los términos del modelo base Qwen3.5-9B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B, con capas visuales conservadas) |
| Parámetros totales | 8.953.803.264 (8,95 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en la configuración de producción del autor; ajustable según capacidad del dispositivo |
| Tipos de cuantización | Q4_K_M (pesos principales), Q8_0 (proyector visual mmproj) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | other |
| Formato de pesos | GGUF (llama.cpp); también existe un peso experimental de texto 9B en la raíz del repositorio |
| Tamaño del repositorio | 11,9 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B |
| Método de ajuste | DoRA (checkpoint-38 fusionado) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-9B, un modelo de 8,95 mil millones de parámetros. El ajuste fino se realizó mediante DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el checkpoint-38, que posteriormente se fusionó en el modelo base. Durante el entrenamiento se conservaron las capas visuales del modelo original, lo que permite el procesamiento de imágenes y fotogramas de vídeo mediante el proyector visual separado (mmproj en Q8_0).

Los datos de entrenamiento consistieron en sesiones conversacionales originales y variantes derivadas de las mismas, agrupadas y divididas para evitar fugas entre particiones, con ponderación en los fragmentos de entrenamiento. El autor indica que los pesos GGUF exportados no incluyen MTP (multi-token prediction). No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su origen conversacional y su orientación a roleplay y operación de VTuber.

## Capacidades

- Generación de texto conversacional orientada a roleplay y personificación de personaje (大肥鱼).
- Generación de comentarios para plataformas de vídeo, con lectura de subtítulos y, cuando es necesario, muestreo de fotogramas mediante el proyector visual.
- Entrada imagen-texto: procesamiento de imágenes y fotogramas de vídeo a través del mmproj Q8_0.
- Comprensión de intención en lenguaje natural para consultas del operador (autor, estado de entrega, contenido original de comentarios).
- Soporte de contexto largo: 262.144 tokens en la configuración de producción del autor.
- Capacidades multilingües limitadas a chino e inglés.
- Modo de pensamiento (thinking) activado en la configuración de producción del autor.
- Integración con llama.cpp mediante `--mmproj` para usos imagen-texto.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso genérico más allá de las consultas de operación descritas.

## Casos de uso

- Emisión en directo de VTuber: el modelo gestiona la personificación del personaje y responde a interacciones en tiempo real, aprovechando la ventana de contexto de 262.144 tokens para mantener coherencia en sesiones largas.
- Generación de comentarios en plataformas de vídeo: lee subtítulos y, cuando no están disponibles, escanea fotogramas mediante el proyector visual para producir comentarios contextualizados; el autor reporta 159 comentarios exitosos de 220 candidatos en una prueba real.
- Atención conversacional con memoria de eventos: responde a preguntas del operador sobre autores, respuestas y texto original de comentarios, con verificación de eventos en la aplicación anfitriona.
- Roleplay multi-turno: mantiene personajes y relaciones entre participantes según la tarjeta de personaje seleccionada en el espacio de trabajo de Tuber Studio.
- Análisis de contenido audiovisual: muestreo de fotogramas de vídeo para describir o comentar escenas cuando no hay subtítulos disponibles.
- Asistencia a la operación de canales: consultas de solo lectura sobre registros de emisión y estado de entrega de mensajes, integradas en el flujo de trabajo de la plataforma.
- Prototipado de agentes conversacionales especializados: sirve como ejemplo de ajuste fino DoRA de bajo rango sobre un modelo de 9B para una tarea vertical concreta.

## Benchmarks y rendimiento

El autor publica evaluaciones de pareado (pairwise) en lugar de benchmarks estándar. Los resultados disponibles son los siguientes:

| Evaluación | Resultado |
|---|---|
| Preguntas generales en evaluación de pareado congelada (120 preguntas) | 93/120 en el modelo ajustado frente a 100/120 en el modelo base |
| Escenarios de personaje (40 escenarios) | 23 victorias, 12 empates, 5 derrotas frente al modelo desplegado en ese momento |
| Reproducción de auditoría AGX (30 vídeos reales) | no se reporta métrica numérica agregada |
| Prueba real de operación | 220 candidatos de comentario, 159 comentarios exitosos, 155 textos publicados coincidentes con el candidato |
| Reproducción de diálogo del operador | 3 rondas consecutivas con coincidencia en el mismo evento y recibo confirmado |

El autor señala que tanto la evaluación de pareado como los escenarios de personaje quedaron por debajo del umbral de la siguiente ronda de publicación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso principal Q4_K_M de un modelo de 8,95 B ocupa aproximadamente 5-6 GB, más el proyector visual Q8_0; el repositorio completo pesa 11,9 GB.
- La configuración de producción del autor (AGX) activa 262.144 tokens de contexto con caché K/V en `q4_0`, lo que exige memoria muy superior a la del peso; el propio autor indica que otras máquinas deben ajustar la ventana según la capacidad medida.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cabría en GPU de consumo con suficiente VRAM para el contexto elegido, y en aceleradores de datacenter para contextos largos.
- Despliegue: llama.cpp es el runtime documentado, con carga del peso principal para texto y `--mmproj` para imagen-texto. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| dafeiyu-qwen35-9b | 8,95 B | 262.144 (config. del autor) | zh, en | other | GGUF | Ajuste DoRA para VTuber/roleplay |
| Qwen3.5-9B (base) | 8,95 B | no disponible en la información | no disponible en la información | según modelo base | safetensors (original) | Base del ajuste; supera al finetune en preguntas generales (100/120 vs 93/120) |
| Alternativas de 9B para roleplay | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El ajuste fino degrada el rendimiento en preguntas generales respecto al modelo base: 93/120 frente a 100/120 en la evaluación de pareado congelada.
- En escenarios de personaje, el modelo perdió en 5 de 40 casos frente al modelo desplegado en ese momento, y el autor reconoce que no alcanzó el umbral de publicación de la siguiente ronda.
- La licencia "other" exige revisar los términos del modelo base Qwen3.5-9B antes de cualquier uso comercial; no se detallan restricciones específicas en la información disponible.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a modelos de 9B en tareas de verificación; el autor delega la verificación de autor, hora y estado de entrega a la aplicación anfitriona, no al modelo.
- La validación de emisión en directo, co-residencia prolongada y emisión real en plataforma seguía pendiente de aceptación según la documentación del autor.
- El contexto de 262.144 tokens solo es viable con cuantización de caché K/V en `q4_0` y hardware con memoria suficiente; en configuraciones menores debe reducirse la ventana.
- Los pesos GGUF no incluyen MTP, lo que puede afectar a optimizaciones de decodificación especulativa.
- El repositorio contiene además un peso experimental de texto 9B en la raíz; la versión recomendada es la del directorio `releases/1.0.0`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4everImmortality/dafeiyu-qwen35-9b-gguf
- Peso principal Q4_K_M: https://huggingface.co/4everImmortality/dafeiyu-qwen35-9b-gguf/blob/21ecede9e9a3f07764c8c0ee3bc24d2de7cf5aff/releases/1.0.0/dafeiyu-qwen35-9b-clean-v1-Q4_K_M.gguf
- Proyector visual Q8_0: https://huggingface.co/4everImmortality/dafeiyu-qwen35-9b-gguf/blob/21ecede9e9a3f07764c8c0ee3bc24d2de7cf5aff/releases/1.0.0/mmproj-dafeiyu-qwen35-9b-clean-v1-Q8_0.gguf
- Manifiesto de artefactos: https://huggingface.co/4everImmortality/dafeiyu-qwen35-9b-gguf/blob/21ecede9e9a3f07764c8c0ee3bc24d2de7cf5aff/releases/1.0.0/bundle.json
- Repositorio Tuber Studio: https://github.com/4everWZ/Tuber_Studio
- Guía de despliegue: https://github.com/4everWZ/Tuber_Studio/blob/main/docs/guides/deployment.md
- Evaluación de entrenamiento y pareado: https://github.com/4everWZ/Tuber_Studio/blob/main/evaluations/results/dafeiyu-clean-9b-20261111.md
- Reproducción de auditoría AGX: https://github.com/4everWZ/Tuber_Studio/blob/main/evaluations/results/review-agx-mainline-20261111.md
- Verificación de operación real: https://github.com/4everWZ/Tuber_Studio/blob/main/evaluations/results/operations-feedback-20261112.md
- Plan actual: https://github.com/4everWZ/Tuber_Studio/blob/main/docs/plans/current.md
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
