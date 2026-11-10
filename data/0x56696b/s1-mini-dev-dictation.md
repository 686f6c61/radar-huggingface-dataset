# 0x56696B/S1-mini-dev-dictation

## Resumen

S1-mini-dev-dictation es un ajuste fino (fine-tune) del modelo S1-mini de Superwhisper, que a su vez deriva de Qwen/Qwen3-0.6B. Lo desarrolla el usuario 0x56696B y su propósito es especializar el post-procesado de transcripciones ASR (dictado) en el dominio del desarrollo de software, DevOps y herramientas de IA. El modelo no transcribe audio: recibe una transcripción en bruto generada por un sistema ASR y devuelve el texto limpio, con puntuación, mayúsculas correctas, normalización de identificadores técnicos (rutas, nombres de ficheros, siglas) y eliminación de muletillas.

Arquitectura transformer de tipo decoder-only con 596.049.920 parámetros totales (aproximadamente 0,6 mil millones), heredada íntegramente de Qwen3-0.6B. El cambio introducido es un LoRA de rango 16 fusionado en los pesos bf16 originales, por lo que la arquitectura, el vocabulario, el tokenizer y la plantilla de chat son idénticos a los del modelo base. Es un reemplazo directo (drop-in replacement) de S1-mini: mismo prompt de sistema, misma línea de control y misma forma de invocación.

Su relevancia radica en que aborda un problema concreto y medible: la brecha entre lo que un ASR produce y lo que un desarrollador espera al dictar código, rutas o comandos. Frente al modelo base, el autor reporta una mejora de 32,2% a 84,7% en coincidencia exacta sobre un conjunto de validación de 59 casos, lo que lo hace útil como etapa de limpieza en pipelines de dictado técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B), fine-tune LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (pesos fusionados), GGUF Q8_0 y Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | s1-mini-license (Apache 2.0 con clausula adicional de atribucion de nombre) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer decoder-only de Qwen3-0.6B sin modificaciones estructurales. El ajuste se realizó con LoRA de rango 16, escala 4.0 y dropout 0.05 aplicado a todas las capas lineales de los 28 bloques del modelo, entrenado con mlx-lm durante 4 épocas, con tasa de aprendizaje 1e-4 y tamaño de lote 8. El adaptador se fusionó posteriormente en los pesos bf16. La función de pérdida cubre únicamente el texto limpio de salida: el prompt de sistema, la línea de control, la transcripción de entrada y el bloque `<think>` vacío quedan enmascarados. Las conversiones a GGUF (Q8_0 y Q4_K_M) se generaron desde los pesos fusionados con llama.cpp.

El conjunto de entrenamiento consta de 1.248 pares de transcripción ASR cruda y texto limpio (1.123 para entrenamiento, 125 para validación). Se compone de 249 pares redactados con asistente de IA sobre los casos de fallo objetivo, 564 filas generadas a partir de plantillas de frase rellenadas con un vocabulario de formas escritas, formas habladas y categoría (con muletillas y autocorrecciones inyectadas), 36 transcripciones limpiadas por Qwen3.5-9B con un prompt de instrucción fijo y 399 transcripciones sintéticas generales no técnicas limpiadas por el S1-mini original para mitigar el olvido catastrófico. La distribución de estilos es 1.013 semi-formal, 81 formal, 78 casual y 76 semi-casual, con 175 filas de contexto email y 69 con listas de viñetas. Cada fila supera cuatro comprobaciones automáticas: ningún número que la transcripción no diga, ausencia de "um"/"uh"/"er", ausencia de viñetas bajo `Structure: prose` y ausencia de "so" inicial en estilos semi-formal y formal.

## Capacidades

- Limpieza y normalización de transcripciones ASR en inglés: puntuación, mayúsculas (truecasing), eliminación de muletillas y autocorrecciones.
- Normalización inversa de texto (ITN) para identificadores técnicos: siglas deletreadas ("a d o" a "ADO"), versiones habladas ("queen three point five four b" a "Qwen3.5-4B"), rutas ("tilde slash dot omp slash agent slash watchdog dot yml" a `~/.omp/agent/WATCHDOG.yml`) y nombres de fichero con extensión.
- Control de estilo mediante línea de control con tres ejes: `Styling` (semi-formal, formal, casual, semi-casual), `Structure` (prose, list) y `Context` (general, email).
- Generación de listas con viñetas cuando la línea de control lo solicita.
- Modo de razonamiento desactivable (`enable_thinking=False`); el modelo está entrenado para emitir un bloque `<think>` vacío.
- No responde a peticiones dictadas: las limpia. No ejecuta instrucciones contenidas en la transcripción.
- Sin soporte de tool calling, function calling, agentes, visión ni audio documentado en la información disponible.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Post-procesado en pipelines de dictado para desarrolladores: el modelo se coloca como etapa final tras el ASR y normaliza la salida antes de insertarla en el editor, corrigiendo siglas, rutas y nombres de fichero que el ASR transcribe literalmente letra a letra.
- Generación de documentación técnica a partir de notas de voz: con `[Context: email]` o `[Structure: list]`, convierte un dictado desordenado sobre una incidencia en un correo o una lista de pasos con puntuación y mayúsculas correctas.
- Registro de incidencias en herramientas como Azure DevOps o Jira: transforma "so the a d o ticket needs the m c p config" en "The ADO ticket needs the MCP config.", listo para pegar en el campo de descripción sin retoque manual.
- Dictado de comandos y rutas en terminal: normaliza transcripciones de rutas con `~`, barras y extensiones, reduciendo errores de ejecución por rutas mal transcritas.
- Asistencia a la revisión de código por voz: permite dictar referencias a ficheros y funciones (`whisper.cpp with the DER metric`) que el modelo devuelve con el formato exacto esperado por el revisor.
- Integración en herramientas de escritorio de dictado (estilo superwhisper): el modelo es un reemplazo directo del base, por lo que puede sustituirse en la configuración existente sin cambiar el prompt de sistema ni la plantilla de chat.
- Limpieza por lotes de transcripciones de reuniones técnicas: al ser un modelo de 0,6B y con builds GGUF Q4_K_M, puede ejecutarse localmente sobre lotes de transcripciones sin coste de API.

## Benchmarks y rendimiento

Evaluación sobre un conjunto de validación de 59 casos nunca vistos en entrenamiento, con el GGUF Q4_K_M ejecutado en Ollama y decodificación greedy:

| Modelo | Casos | Coincidencia exacta | Precisión por palabra | Precisión por caracter |
|---|---|---|---|---|
| S1-mini (base) | 59 | 32,2% | 78,2% | 91,0% |
| S1-mini-dev-dictation | 59 | 84,7% | 93,8% | 97,3% |

Además, sobre los diez ejemplos de la model card de S1-mini (estilos semi-formal, formal y casual, más una lista y un correo), este modelo coincide con la salida de la card en 9 de 10 casos y con el build Q4_K_M del base en 7 de 10. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,2 GB solo para pesos, más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en GGUF Q8_0: aproximadamente 0,7 GB de pesos; en Q4_K_M, alrededor de 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue en servidor, A100 o H100 no son necesarias pero funcionan sin problema.
- Cabe en CPU: los builds GGUF permiten inferencia en CPU con llama.cpp u Ollama, con latencia mayor pero viable para post-procesado por lotes.
- Opciones de despliegue: transformers (con `enable_thinking=False`), llama.cpp (`llama-server` con plantilla jinja), Ollama (Modelfile con bloque think vacío, `temperature 0` y `repeat_penalty 1`), y text-generation-inference por los tags del repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-mini-dev-dictation | 596 M | no disponible | Limpieza de dictado técnico (EN) | s1-mini-license | Hugging Face, GGUF |
| S1-mini (base) | 596 M | no disponible | Limpieza de dictado general (EN) | Apache 2.0 con cláusula de nombre | Hugging Face |
| Qwen3-0.6B | 596 M | no disponible | Generación de texto general | Apache 2.0 | Hugging Face |

Frente a S1-mini, este fine-tune mejora la coincidencia exacta de 32,2% a 84,7% en el conjunto de validación del autor, a costa de especializarse en vocabulario técnico. Frente a Qwen3-0.6B, no es un modelo de propósito general: está entrenado exclusivamente para normalizar transcripciones y no debe usarse como asistente conversacional. No se dispone de datos de benchmarks comparativos con otras alternativas de post-procesado ASR en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo no está entrenado ni evaluado para otros idiomas.
- Es un modelo de limpieza, no de respuesta: si la transcripción contiene una pregunta o una instrucción, el modelo la reformatea pero no la responde. No debe usarse como asistente.
- Riesgo de alucinación en cifras y nombres: aunque el entrenamiento incluye una comprobación de que no aparezcan números no dictados, no hay garantía formal en producción; conviene validar la salida en dominios críticos.
- Sesgos: el conjunto de entrenamiento está redactado a partir del estilo de dictado de un único autor y de plantillas generadas con asistente de IA, lo que puede introducir sesgo hacia ese registro y vocabulario técnico concreto.
- Licencia: la s1-mini-license añade a Apache 2.0 la obligación de identificar el modelo como "S1-mini" de "Superwhisper" con esa capitalización exacta en cualquier uso, distribución o producto derivado, con independencia del nombre comercial. Es una restricción de atribución que debe revisarse antes de uso comercial.
- El modelo base S1-mini es a su vez un fine-tune de Qwen3-0.6B; se heredan las limitaciones de conocimiento y razonamiento de un modelo de 0,6B.
- El conjunto de validación es pequeño (59 casos) y fue puntuado por el propio autor; los resultados deben interpretarse con cautela.
- La fecha de creación del repositorio (2026-11-10) y el uso de Qwen3.5-9B en la generación de datos no son verificables desde la información disponible; conviene contrastar la procedencia antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0x56696B/S1-mini-dev-dictation
- Modelo base S1-mini: https://huggingface.co/superwhisper/s1-mini
- Licencia del modelo base: https://huggingface.co/superwhisper/s1-mini/blob/main/LICENSE
- Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
