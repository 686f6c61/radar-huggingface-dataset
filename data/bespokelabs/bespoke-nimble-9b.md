# bespokelabs/Bespoke-Nimble-9B

## Resumen

Bespoke-Nimble-9B es un adaptador LoRA sobre el checkpoint base Qwen3.5-9B, desarrollado por Bespoke Labs, especializado en predicción estructurada y clasificación de texto con fundamento en contexto (evidence grounding). A diferencia de un modelo generativo al uso, no produce razonamiento ni respuestas en lenguaje libre: puntúa directamente los logits de los tokens correspondientes a las respuestas permitidas dentro de un esquema predefinido, devolviendo la opción seleccionada junto con su distribución de probabilidad.

El modelo resuelve un problema concreto de los pipelines de producción: obtener etiquetas fiables, calibradas y verificables a partir de un contexto y un esquema de campos tipados (booleanos, enumeraciones y niveles de rúbrica). Al restringir la salida a un conjunto cerrado de tokens candidatos, elimina el riesgo de respuestas fuera de formato y facilita la trazabilidad de la decisión.

La versión actual (actualizada el 24 de septiembre de 2026) admite hasta 8.192 tokens de contexto y hasta 255 opciones por campo, con una temperatura de calibración fija de T=1.0. El adaptador pesa aproximadamente 165 MiB y requiere descargar por separado los pesos completos del checkpoint base Qwen3.5-9B. Está publicado bajo licencia Apache 2.0 y su idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B |
| Parametros totales | no disponible (adaptador de ~165 MiB; los parametros totales corresponden al checkpoint base Qwen3.5-9B, no desglosados en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (los prompts que la exceden se rechazan, no se truncan) |
| Tipos de cuantizacion | no disponible (la model card indica BF16 en GPU CUDA; no se documentan otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el checkpoint base Qwen3.5-9B en formato nativo de Hugging Face |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a un transformer denso Qwen3.5-9B. La innovación no reside en la arquitectura del backbone, sino en el procedimiento de puntuación: dado un contexto y un esquema de campos, el sistema construye un prompt exacto (incluido en el repositorio como *prompt builder*) y evalúa los logits de los tokens que corresponden a cada respuesta candidata. Sobre esos logits se aplica una única operación `softmax(candidate_logits / temperature)` con T=1.0 por defecto. No hay decodificación autoregresiva ni generación de cadena de pensamiento en el flujo evaluado.

El repositorio incluye el adaptador, el tokenizador, el constructor de prompts, código de inferencia de referencia y metadatos de la release. El adaptador se entrenó sobre el checkpoint base con revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card advierte explícitamente que esta versión no ha tenido un ajuste de temperatura independiente y que no debe reutilizarse la calibración de 2.179 del checkpoint anterior.

## Capacidades

- Clasificación booleana fundamentada en contexto: responde preguntas de sí/no evaluando únicamente los tokens de ambas opciones.
- Selección entre opciones (enum): hasta 255 opciones por campo, con descripciones opcionales por opción.
- Puntuación por rúbrica: niveles enteros expresados como cadenas de enumeración (por ejemplo, `["0", "1", "2"]`), con descripción de cada nivel y devolución de la puntuación esperada ponderada por probabilidad.
- Predicción estructurada multi-campo: procesa cada campo del esquema de forma individual preservando el prompt de entrenamiento y el cálculo de probabilidad.
- Salida probabilística calibrada: devuelve la distribución de probabilidad sobre las opciones de cada campo, no solo la etiqueta ganadora.
- Fundamento en evidencia (evidence grounding): las decisiones se condicionan al contexto aportado en el prompt.
- No soporta generación de texto libre, razonamiento explícito, tool calling, uso de agentes, visión, audio ni capacidades multimodales en el flujo evaluado.
- Capacidad multilingüe limitada al inglés según la metadata del modelo.

## Casos de uso

- Moderación y cumplimiento de políticas: clasificar contenido frente a un conjunto cerrado de categorías de política (por ejemplo, `permitido`, `revisar`, `bloquear`) usando el contexto de la conversación; la salida probabilística permite fijar umbrales de escalado a revisión humana.
- Extracción de atributos verificables en documentos: determinar booleanos como "¿el contrato incluye cláusula de renovación automática?" a partir del texto contractual, con la probabilidad asociada como medida de confianza.
- Evaluación automática de respuestas de LLM por rúbrica: puntuar la calidad de una respuesta generada con niveles enteros y descripciones por nivel, obteniendo una puntuación esperada ponderada útil para comparar variantes de un sistema.
- Enrutamiento de tickets de soporte: asignar cada incidencia a una de las categorías predefinidas del equipo a partir del contexto del ticket, con distribución de probabilidad para detectar casos ambiguos.
- Verificación de grounding en pipelines RAG: comprobar si una afirmación está respaldada por el contexto recuperado (booleano por afirmación), actuando como filtro antes de mostrar la respuesta al usuario.
- Clasificación de riesgo en KYC y antifraude: evaluar campos tipados sobre expedientes con contexto largo (hasta 8.192 tokens), donde la salida cerrada y la probabilidad calibrada facilitan la auditoría del criterio de decisión.
- Etiquetado asistido para curación de datasets: generar etiquetas estructuradas con su distribución de probabilidad para priorizar la revisión manual de los casos de baja confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador ocupa ~165 MiB y requiere cargar el checkpoint base Qwen3.5-9B, por lo que la VRAM vendrá determinada por el tamaño y la precisión del modelo base (BF16 en la configuración de referencia).
- GPU recomendadas: se requiere una GPU CUDA con soporte BF16; el entorno de referencia usó PyTorch 2.8.0 con CUDA 12.8.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; depende del checkpoint base y de la precisión empleada.
- Opciones de despliegue: el repositorio incluye un helper de inferencia propio (`NimbleModel`) y un *quickstart* en GitHub con loaders para Linux y para Mac/MLX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota operativa: no se requiere `trust_remote_code=True`; el autor recomienda revisar el helper incluido antes de importarlo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Bespoke-Nimble-9B | Adaptador LoRA sobre Qwen3.5-9B | Base de 9B (adaptador ~165 MiB) | 8.192 tokens | Puntuación de opciones cerradas con probabilidades | Apache 2.0 |
| Qwen3.5-9B (base) | Transformer denso generativo | 9B | no disponible | Generación libre de texto | no disponible |
| Bespoke-Nimble-9B-v2 | Adaptador LoRA sobre Qwen3.5-9B | Base de 9B | no disponible | Variante previa del mismo enfoque | no disponible |
| Checkpoint original (`original-2676`) | Adaptador LoRA sobre Qwen3.5-9B | Base de 9B | no disponible | Versión anterior, calibración T=2.179 | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera razonamiento ni respuestas libres: cualquier tarea que requiera texto abierto queda fuera de su alcance.
- Idioma limitado al inglés según la metadata; el rendimiento en castellano u otros idiomas no está documentado.
- Los prompts que superan los 8.192 tokens se rechazan, no se truncan: es necesario trocear o resumir el contexto en pipelines con documentos largos.
- El máximo de 255 opciones por campo limita esquemas de clasificación muy extensos.
- La temperatura está fijada en T=1.0 y no se ha realizado un ajuste específico para este checkpoint; reutilizar la calibración de 2.179 de la versión anterior produce probabilidades mal calibradas.
- Riesgo de alucinación estructuralmente reducido al restringir la salida a tokens candidatos, pero persiste el riesgo de asignar la opción incorrecta cuando el contexto es ambiguo o insuficiente.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- Requiere descargar y cargar el checkpoint base Qwen3.5-9B, lo que condiciona los requisitos de hardware y el coste de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del checkpoint base Qwen3.5-9B, que no se detalla en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bespokelabs/Bespoke-Nimble-9B
- Checkpoint base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Variante v2: https://huggingface.co/bespokelabs/Bespoke-Nimble-9B-v2
- Repositorio GitHub con quickstart: https://github.com/bespokelabsai/nimble
- Quickstart (ancla): https://github.com/bespokelabsai/nimble#quickstart
