# porkr/Tofazzol-v2.1-1.5B

## Resumen

Tofazzol v2.1-1.5B es un modelo de lenguaje de 1.543.714.304 parámetros desarrollado por el usuario porkr, obtenido mediante fine-tuning del modelo base Qwen2.5-Coder-1.5B-Instruct. Su propósito no es la generación de texto generalista, sino la traducción de peticiones en inglés a un plan de búsqueda estructurado y ejecutable: el modelo emite comandos restringidos del tipo `docsearch {...}`, `mailsearch {...}`, comandos de fichero con nombre de fichero limitado, o un código `unsupported:`. El software consumidor ejecuta ese plan y verifica los permisos de acceso a la fuente solicitada.

El modelo forma parte del producto Shlexball y se publica como release de pesos abiertos (open-weight) con código de inferencia de código abierto bajo licencia MIT, mientras que los pesos se distribuyen bajo Apache 2.0. La propuesta técnica es deliberadamente minimalista: en lugar de competir en capacidades generales, apuesta por una interfaz precisa y verificable por software, lo que permite usar un modelo pequeño en inferencia local.

La relevancia actual reside en su enfoque de "modelo pequeño con un trabajo concreto": demuestra que tareas de enrutamiento y estructuración de búsquedas pueden resolverse con 1,5B parámetros cuando el contrato de salida es verificable, con resultados medidos sobre 986 tests de búsqueda y sobre un conjunto reservado de 100 peticiones de correo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 causal language model, 28 capas, hidden size 1.536 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto evaluado; el límite medido de prompt es de 1.536 tokens tras aplicar la plantilla de chat. La configuración heredada anuncia una ventana mayor, pero no es la evaluada para esta tarea |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16 completo; el runner de CPU usa float32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 para los pesos; MIT para el código de inferencia |
| Formato de pesos | safetensors (checkpoint BF16 completo, 3.087.467.144 bytes, no es un adaptador) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen2, con 28 capas y un tamaño de hidden de 1.536, heredado directamente de Qwen2.5-Coder-1.5B-Instruct mediante fine-tuning. No emplea mezcla de expertos ni arquitecturas híbridas. La salida está constreñida a un conjunto cerrado de comandos estructurados: `docsearch {...}`, `mailsearch {...}`, comandos de nombre de fichero y el código `unsupported:`, lo que convierte la generación en un problema de structured generation con validación posterior por software.

El autor publica la receta de entrenamiento, los prompts exactos, el tokenizador y el código de inferencia, pero aclara explícitamente que no se publican todos los datos de entrenamiento ni la totalidad de las evaluaciones históricas. La decodificación medida es greedy, con un máximo de 256 tokens nuevos y penalización de repetición de 1,1 aplicada sobre prompt y tokens generados. No se especifica en la información disponible el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Traducción de peticiones en inglés a planes de búsqueda estructurados y ejecutables por software.
- Generación de comandos de búsqueda de documentos (`docsearch`), búsqueda de correo de Outlook (`mailsearch`) y búsqueda por nombre de fichero.
- Emisión de código `unsupported:` para peticiones fuera del dominio soportado.
- Structured generation con validación del resultado por un ejecutor de referencia.
- Inferencia local en Apple Silicon mediante MLX, y backend alternativo Transformers sobre CUDA o CPU.
- Procesamiento por lotes de peticiones mediante ficheros JSONL con campos `id`, `request` y `domain`.
- Capacidad multilingüe: no disponible (solo inglés declarado).
- Tool calling genérico, agentes multi-paso, visión, audio o modo de razonamiento extendido: no disponible.

## Casos de uso

- Búsqueda documental corporativa: el modelo traduce una petición como "Find documents containing 'copper orchard'" a un plan `docsearch` que el motor de búsqueda ejecuta, permitiendo integrar búsqueda en lenguaje natural sobre repositorios de documentos sin un LLM de gran tamaño.
- Búsqueda de correo en Outlook: convierte peticiones del tipo "Find emails from Mara Calder with 'copper orchard' in the subject" en un plan `mailsearch` con filtros de remitente y asunto, útil para asistentes de bandeja de entrada con verificación de acceso a la fuente.
- Enrutamiento de consultas a fuentes de datos: el campo `domain` (`files` o `mail`) selecciona la fuente antes de la inferencia, lo que permite usar el modelo como clasificador-enrutador en pipelines de búsqueda federada.
- Búsqueda por metadatos de ficheros: cubre nombre de fichero, extensión, carpeta, fecha de modificación y tamaño, adecuado para herramientas de gestión documental que necesitan filtros estructurados precisos.
- Despliegue en local con privacidad de datos: al ejecutarse en un Mac con Apple Silicon vía MLX y no requerir conexión a servicios externos, encaja en escenarios donde las peticiones de búsqueda no pueden salir de la organización.
- Evaluación y auditoría de sistemas de búsqueda: el release incluye el runner y el contrato de tests, lo que permite reproducir la evaluación sobre peticiones propias con expectativas fijadas antes de inspeccionar las respuestas del modelo.
- Gestión de peticiones no soportadas: el código `unsupported:` permite descartar consultas fuera de dominio de forma controlada en lugar de generar planes inválidos.

## Benchmarks y rendimiento

Resultados de ejecución de la primera respuesta, sobre un tablero de desarrollo de 986 tests de búsqueda (16 diagnósticos de rechazo excluidos del total):

| Categoría | Tofazzol v2 | Tofazzol v2.1 |
|---|---:|---:|
| Documentos | 318/320 | 317/320 |
| Nombres de fichero | 155/160 | 156/160 |
| Metadatos de ficheros multimedia | 262/266 | 262/266 |
| Búsqueda de correo sintético | 217/240 | 217/240 |
| Total | 952/986 | 952/986 |

El empate incluye tres casos ganados y tres perdidos. En la puerta de release de la aplicación completa, la búsqueda de ficheros asistida por la app pasó 735/746 frente a 736/746 de v2, con una ganancia y dos pérdidas.

Conjunto reservado de correo real (set B, 100 peticiones nuevas generadas desde el mismo snapshot de buzón privado, con objetivos disjuntos de las 130 peticiones previas):

| Set B | Tofazzol v2 | Tofazzol v2.1 |
|---|---:|---:|
| Recuperación exacta y completa | 66/100 | 80/100 |
| Correo deseado recuperado (diagnóstico secundario) | 77/100 | 90/100 |

Hubo 15 ganancias exactas y una pérdida exacta. Las búsquedas de asunto más mes de calendario mejoraron de 0/10 a 9/10; carpeta más asunto, de 5/10 a 9/10; remitente más asunto, de 7/10 a 9/10. Remitente más mes retrocedió de 9/10 a 8/10. El ejecutor de referencia solo pudo cubrir completamente 91/100 casos, pero se mantiene el denominador de 100.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos en BF16 de 3,09 GB; la carga en CPU con float32 requiere más memoria que el fichero de pesos.
- Inferencia local validada en Apple Silicon mediante MLX; se desconoce la VRAM mínima exacta para CUDA.
- Backend Transformers disponible para CUDA o CPU como opción de portabilidad; no se ha establecido paridad numérica ni de benchmark entre backends.
- No se especifican GPU concretas recomendadas (A100, H100, RTX 4090) en la información disponible; por tamaño, el modelo es apto para GPU de consumo, pero no hay medición publicada.
- Opciones de despliegue documentadas: runner propio con backend MLX y runner con backend Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tofazzol v2.1-1.5B | 1.543.714.304 | 1.536 tokens de prompt medidos | Búsqueda estructurada | Apache 2.0 (pesos), MIT (código) | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B (aproximado, no confirmado en la información) | no disponible | Generación de código y texto general | no disponible en la información | Hugging Face |
| Tofazzol v2 | no disponible | no disponible | Búsqueda estructurada (versión previa) | no disponible | Referenciado en la model card |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría más allá de la comparación interna con Tofazzol v2.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se declara ni evalúa capacidad multilingüe.
- El límite de prompt medido es de 1.536 tokens tras la plantilla de chat; la ventana arquitectónica heredada es mayor pero no está evaluada para esta tarea.
- El modelo no lee documentos, no se conecta a Outlook ni ejecuta comandos: solo genera el plan, que debe ejecutar software externo.
- No mide el enrutamiento automático de la aplicación; la fuente (`files` o `mail`) se selecciona explícitamente antes de la inferencia.
- Los resultados del set B son confirmación sobre peticiones no vistas de tipos familiares, no replicación independiente en otros buzones ni con peticiones escritas por humanos.
- El ejecutor de referencia solo cubrió completamente 91/100 casos del set B, lo que introduce incertidumbre en la métrica.
- La paridad numérica y de benchmark entre los backends MLX y Transformers no está establecida.
- `generation_config.json` conserva valores de muestreo históricos por procedencia; el runner proporcionado los sobrescribe con la configuración medida.
- No se publican todos los datos de entrenamiento ni todas las evaluaciones históricas.
- Riesgo de alucinación en la generación de planes: el contrato de salida estructurado y la validación por software mitigan pero no eliminan la posibilidad de planes plausibles pero incorrectos.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/porkr/Tofazzol-v2.1-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Shlexball: https://shlexball.com
