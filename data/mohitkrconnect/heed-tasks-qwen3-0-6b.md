# mohitkrconnect/heed-tasks-qwen3-0.6b

## Resumen

Heed-tasks-qwen3-0.6b es un ajuste fino completo del modelo base Qwen/Qwen3-0.6B-Base, desarrollado por el autor independiente mohitkrconnect como componente central de Heed, una aplicación Android de gestión de tareas que funciona de forma totalmente offline. El modelo resuelve un problema muy concreto: convertir la transcripción desordenada de una nota de voz (texto en minúsculas, sin puntuación, generado por Granite Speech) en una lista de tareas en JSON compacto, asignando cada tarea a un cubo o categoría definido por el usuario (Tasks, Buy, Watch, Ideas, Work, Journal o categorías propias).

La relevancia del modelo no está en su rendimiento absoluto, sino en sus restricciones de diseño: debe ejecutarse en la CPU de un Android de gama media, sin permiso de INTERNET, en unos pocos segundos y con aproximadamente 1 GB de memoria. Con 751.632.384 parámetros totales y una ventana de contexto de 1.024 tokens, es un ejemplo de "small language model" orientado a una tarea estructurada y a la privacidad por construcción, no a la generación abierta.

El modelo se distribuye en dos formatos: safetensors en bf16 para PyTorch/transformers y un archivo int8 para LiteRT-LM en Android. La licencia es Apache-2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B-Base) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (entrenamiento y uso en telefono) |
| Tipos de cuantizacion | int8 (archivo LiteRT-LM para Android); bf16 para PyTorch |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) y `heed-tasks-qwen3-0.6b-int8.litertlm` (int8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only de la familia Qwen3, y se somete a un ajuste fino completo (full fine-tune), no a LoRA ni a adaptadores. El prompt de entrada no usa plantilla de chat ni system prompt: es un texto plano con una lista de categorías en formato `- id (Name): meaning`, seguido de `Note: <texto>` y terminado en `Tasks:\n`. La salida esperada es un JSON compacto `{"tasks":[{"t":"…","c":"…"}]}` seguido de EOS.

El entrenamiento se realizó en el marco del experimento pre-registrado EXP-061 (semilla 1, época 3) del estudio Heed, y fue el elegido para la aplicación en la decisión D158. El conjunto de entrenamiento incluyó 859 notas con listas de categorías personalizadas, lo que permite al modelo adaptarse a cubos definidos por el usuario en lugar de depender de categorías fijas en los pesos. La entrada cubre tanto texto mecanografiado como transcripciones de voz en minúsculas y sin puntuación. No se dispone de información sobre el número total de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF/DPO.

Una decisión de diseño destacable es que el modelo no crea recordatorios ni campos de tiempo separados (decisión D134): cualquier hora mencionada se conserva dentro del texto de la tarea ("Pick up phone Monday at four"), y los recordatorios se configuran manualmente en la app. La decodificación evaluada es greedy (`do_sample=False`), con `max_new_tokens=512`.

## Capacidades

- Extracción de tareas estructuradas: convierte una nota de voz o texto libre en una lista JSON de tareas con texto y categoría.
- Clasificación en cubos definidos por el prompt: soporta las categorías por defecto (Tasks, Buy, Watch, Ideas, Work, Journal) y listas personalizadas en el mismo formato.
- Manejo de transcripciones de voz: procesa texto en minúsculas y sin puntuación generado por Granite Speech.
- Salida JSON compacta y determinista: produce `{"tasks":[...]}` y termina con `<|endoftext|>`; una nota sin acciones devuelve `{"tasks":[]}`.
- Conservación de detalles temporales dentro del texto de la tarea, sin generar recordatorios ni campos de fecha separados.
- Ejecución on-device: pensado para inferencia en CPU de Android mediante LiteRT-LM, sin acceso a red.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking; es un modelo de tarea única.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Gestión de tareas por voz en Android: la app captura la transcripción de una nota hablada y el modelo devuelve una lista de tareas clasificadas en cubos; encaja por su tamaño (0,6B), su contexto de 1.024 tokens y su ejecución en CPU sin red.
- Aplicaciones de notas con privacidad estricta: al no requerir permiso de INTERNET, el modelo permite procesar notas personales sin que el texto salga del dispositivo, útil en entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Clasificación automática de compras y listas: el cubo Buy permite extraer artículos concretos de una nota desordenada ("buy twenty cones the old ones are all spoilt") y presentarlos como lista de compra.
- Extracción de tareas laborales: el cubo Work separa encargos de oficina ("correct the unit test papers for class 2b by monday") del resto de la nota, manteniendo la fecha dentro del texto.
- Diario personal y registro de ideas: los cubos Journal e Ideas permiten separar reflexiones sin acción de pensamientos que el usuario quiere conservar, sin generar tareas falsas.
- Integración en pipelines de captura offline: al ser un modelo pequeño con salida JSON estricta, puede incrustarse en apps de notas, grabadoras o asistentes locales que necesiten estructurar texto sin depender de la nube.
- Personalización por usuario: al aceptar listas de categorías en el prompt, el modelo se adapta a flujos de trabajo propios (por ejemplo, cubos de proyectos o clientes) sin reentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Contexto |
|---|---|---|
| Judged task F1 (Gemini 3.1 Pro, ciego), int8 en telefono | 75,6 | Test sellado de Heed, 617 notas, ejecución única |
| Judged task F1 en las 126 notas humanas reales | 80,1 | Subconjunto de notas reales |
| Comparación con Claude Sonnet 5.5 | 80% del rendimiento (94,8) | Sobre el test sellado |
| Comparación con Sonnet en notas reales | 84% del rendimiento | Sobre las 126 notas humanas |
| Diferencia frente a GPT-5.4 mini | +20,0 puntos [IC 95% +17,0; +23,0] | Segundo juez de otra familia: +10,3 [+3,3; +17,2] |
| Diferencia frente a Claude Haiku 5.5 | -10,1 puntos | El modelo es peor |
| Diferencia frente a Gemini 3.5 Flash | -16,3 puntos | El modelo es peor |
| Latencia mediana por nota | 5,1 s | CPU MediaTek Dimensity 8300 |
| Tamano del archivo int8 | 614 MB | LiteRT-LM |
| Memoria total de la app con modelo cargado | ~1,2 GB | Android |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB de pesos (751,6M parámetros × 2 bytes), más overhead de activaciones y KV cache; cabe en GPUs consumer con 4 GB o más.
- VRAM estimada en int8: aproximadamente 0,75 GB de pesos, más overhead; adecuado para dispositivos con memoria limitada.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. En servidor podría ejecutarse en cualquier GPU consumer (RTX 3060, RTX 4090) o profesional (A100, H100) sin problema de capacidad.
- Cabe en GPU consumer: sí, en todas las GPU modernas con al menos 4 GB de VRAM en bf16.
- Despliegue: transformers (PyTorch, bf16), LiteRT-LM (Android, int8). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: mediana de 5,1 s por nota en CPU MediaTek Dimensity 8300 con int8; no se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (task F1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heed-tasks-qwen3-0.6b | 751,6M | 1.024 | 75,6 (test sellado); 80,1 (notas reales) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-0.6B-Base | 0,6B | no disponible en la informacion | no disponible | Apache-2.0 | HuggingFace |
| heed-tasks-only-qwen3-0.6b | 0,6B | no disponible | no disponible | no disponible | HuggingFace |
| heed-tasks-only-qwen3.5-0.8b | 0,8B | no disponible | no disponible | no disponible | HuggingFace |

La model card menciona como referencia externa Claude Sonnet 5.5 (F1 94,8), GPT-5.4 mini, Claude Haiku 5.5 y Gemini 3.5 Flash, pero no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: no es un modelo de propósito general; solo genera listas de tareas en JSON a partir de una nota y una lista de categorías.
- Idioma: únicamente inglés; no soporta castellano ni otros idiomas.
- Contexto corto: 1.024 tokens, insuficiente para notas largas o conversaciones multi-turno.
- Sin recordatorios ni campos de tiempo: las horas se conservan dentro del texto de la tarea y los recordatorios deben configurarse manualmente.
- Riesgo de alucinación: puede inventar tareas o categorías si la nota es ambigua o contiene ruido de transcripción; el autor no documenta tasas de error específicas más allá del F1.
- Sesgos: no se documentan sesgos conocidos; el entrenamiento se basa en un conjunto limitado de notas (859 con categorías personalizadas) y datos del estudio Heed.
- Dependencia del formato de prompt: la lista de categorías por defecto debe mantenerse byte a byte; alteraciones en el formato pueden degradar la salida.
- Benchmarks no verificados: los resultados de F1 proceden de un test privado y de un juez automático (Gemini 3.1 Pro), marcados como no verificados.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3-0.6B-Base también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; el modelo es reciente (noviembre de 2026) y no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Segunda semilla del mismo receta: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b-seed0
- Versión previa sin datos dirigidos: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b-exp054
- Modelo anterior tasks-only Qwen3.5-0.8B: https://huggingface.co/mohitkrconnect/heed-tasks-only-qwen3.5-0.8b
- Modelo anterior tasks-only Qwen3-0.6B: https://huggingface.co/mohitkrconnect/heed-tasks-only-qwen3-0.6b
- Aplicación Heed: https://heed-xi.vercel.app
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
