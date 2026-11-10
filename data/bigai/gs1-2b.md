# bigai/GS1-2B

## Resumen

GS1-2B (General System One) es un modelo de decisión desarrollado por BIGAI (Beijing Institute for General Artificial Intelligence) a partir de un ajuste fino de Qwen/Qwen3.5-2B. A diferencia de los modelos generativos convencionales, GS1 no produce tokens de salida: mapea directamente un estado de evidencia compartido y un conjunto de candidatos definidos en tiempo de ejecución a distribuciones de probabilidad tipadas, con un coste de `output_tokens` igual a cero. Está diseñado para tareas de enrutamiento de agentes, verificación, extracción y control.

El modelo incorpora una cabeza de decisión nativa que, mediante atención cruzada multi-cabeza, recupera evidencia del estado y genera una distribución conjunta sobre las opciones. Soporta tres tipos de pregunta: `choice` (selección entre 1 y 255 candidatos), `noul` (verificación binaria que devuelve `p(true)`) y `score` (nivel ordinal entre 2 y 10 valores). Esta formulación elimina la latencia y el coste asociados a la decodificación autoregresiva en bucles de decisión.

Su relevancia actual radica en que ofrece una alternativa determinista y de baja latencia a los modelos generativos en el papel de "sistema 1" dentro de arquitecturas de agentes, donde se requiere decidir rápido, cuantificar incertidumbre y mantener prefijos de contexto reutilizables. La licencia Apache 2.0 y el tamaño de 2B parámetros lo hacen desplegable en entornos con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Causal Gated DeltaNet y atención completa bidireccional segmentada; cabeza de decisión nativa con atención cruzada multi-cabeza |
| Parametros totales | 2B (heredados del modelo base Qwen/Qwen3.5-2B; no se especifica el recuento exacto en la información disponible) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona selección de precisión de cómputo `bf16` y `fp32`, no cuantización de pesos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según dependencias y flujo de carga con `transformers` y `safetensors`) |

## Arquitectura y entrenamiento

GS1-2B parte de Qwen/Qwen3.5-2B y se ajusta como modelo de decisión. La arquitectura combina Causal Gated DeltaNet con atención completa bidireccional segmentada, lo que permite comparar candidatos dentro de un mismo estado y reutilizar prefijos compartidos inmutables. Incorpora además "Carry-preserving Attention Residuals": receptores dispersos de atención completa que recuperan representaciones anteriores conservando el ancla explícita de conexión residual. La cabeza de decisión nativa sustituye la decodificación de texto por una distribución de probabilidad conjunta sobre las opciones, calculada mediante atención cruzada multi-cabeza sobre la evidencia del estado.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona una "equivalencia de permutación a nivel de cabeza" que se cumple con representaciones de entrada fijas, pero advierte que no garantiza invariancia completa al orden de opciones en todo el modelo. La evaluación pública se realiza sobre el "Decision Index 0.3 (Public)".

## Capacidades

- Toma de decisiones tipada: resuelve preguntas de tipo `choice` (1–255 candidatos), `noul` (verificación binaria con `p(true)`) y `score` (2–10 niveles ordinales desde 0).
- Enrutamiento de agentes: selección entre acciones o herramientas definidas en tiempo de ejecución.
- Verificación: comprobación de condiciones booleanas sobre evidencia estructurada.
- Extracción y control: mapeo de estados a decisiones con distribución de probabilidad explícita.
- Estimación de incertidumbre: devuelve probabilidades por candidato y un resumen de confianza.
- Sin generación de tokens de salida: `usage.output_tokens` es 0 en todas las respuestas.
- Procesamiento de estado compartido: múltiples preguntas relacionadas pueden agruparse en una sola petición con un `state` común.
- Soporte de tool calling / function calling: no disponible explícitamente; el modelo está orientado a enrutamiento y verificación, no a generación de llamadas.
- Capacidades multilingües: limitadas a inglés según la model card.

## Casos de uso

- Enrutamiento de agentes en producción: el modelo recibe el estado de la conversación o del sistema y una lista de herramientas candidatas, y devuelve la distribución de probabilidad sobre cuál invocar, sin coste de decodificación y con latencia mínima.
- Verificación de condiciones en pipelines automatizados: mediante preguntas `noul`, se comprueba si una condición se cumple (por ejemplo, si un pedido puede entregarse con la reserva de batería requerida) y se obtiene `p(true)` para umbralizar.
- Clasificación ordinal con incertidumbre: el tipo `score` permite asignar niveles de riesgo, calidad o prioridad sobre una escala de 2 a 10 valores, devolviendo la distribución completa y la confianza.
- Control de sistemas con restricciones: el ejemplo de la model card (batería, coste de entrega, reserva requerida) ilustra el uso para decidir acciones que preserven restricciones operativas.
- Extracción estructurada de decisiones: dado un estado y criterios definidos, el modelo devuelve la opción más probable junto con el resto de probabilidades, útil en sistemas de clasificación con candidatos dinámicos.
- Puerta de seguridad o filtro previo: preguntas `noul` sobre condiciones de seguridad antes de ejecutar una acción, con umbral de confianza configurable.
- Servicio HTTP de decisión: despliegue mediante `gs1 serve` con endpoint `/v1/systemone` para integrar decisiones en arquitecturas de microservicios.

## Benchmarks y rendimiento

| Modelo | Tarea | Dataset | Métrica | Valor |
|---|---|---|---|---|
| GS1-2B | Decision Making (text-classification) | Decision Index 0.3 (Public) | Decision Index Score | 56.12 |

El resultado procede de la evaluación pública declarada por el autor ("GS1 complete public evaluation") y no está verificado de forma independiente (`verified: false`). No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 2B parámetros en `bf16` se estima un orden de 5–6 GB incluyendo pesos y overhead, y en `fp32` aproximadamente el doble, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. La model card menciona ejecución en CUDA y referencia en CPU con `precision="fp32"`.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño (2B) es plausible en GPUs de consumo con suficiente VRAM, pero no se aporta confirmación.
- Opciones de despliegue: `transformers` (`AutoModel` con `trust_remote_code=True`), runtime optimizado `gs1` (instalación con `uv sync --locked --extra serve --extra cuda`), servidor HTTP con `gs1 serve` y endpoint `/v1/systemone`, y `Engine.from_pretrained(...)` para ejecución en proceso.
- Latencia y throughput: no disponibles. La model card destaca el coste cero de tokens de salida como ventaja de latencia, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GS1-2B | 2B | no disponible | Decisión tipada sin generación de tokens | Apache 2.0 | Hugging Face (bigai/GS1-2B) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Generación de texto autoregresiva | no disponible en la información | Hugging Face |
| Alternativas de enrutamiento/verificación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparativas numéricas con modelos de la misma categoría (decisión, enrutamiento o verificación). La comparación con el modelo base es estructural: GS1-2B lo reutiliza y sustituye la decodificación generativa por una cabeza de decisión.

## Limitaciones y advertencias

- Idiomas: solo inglés (`en`); no se declara soporte multilingüe.
- Invariancia al orden de opciones: la equivalencia de permutación solo se garantiza a nivel de cabeza con representaciones fijas, no en el modelo completo; el orden de los candidatos puede afectar al resultado.
- Confianza: la model card advierte que la confianza es un resumen de la distribución, no una garantía de corrección.
- Evidencia insuficiente: se recomienda incluir un candidato explícito `unknown` cuando la evidencia pueda ser insuficiente, lo que traslada al usuario la responsabilidad de cubrir ese caso.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Alucinación: al no generar texto, el riesgo de alucinación textual es nulo por diseño, pero persiste el riesgo de decisiones incorrectas por evidencia insuficiente o distribución mal calibrada.
- Limitaciones de contexto: la longitud máxima de contexto no está especificada, lo que dificulta planificar despliegues con estados muy extensos.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia y la atribución correspondiente.
- Reproducibilidad: se recomienda fijar el commit SHA como `revision` en `from_pretrained` y conservar la carpeta completa del modelo, incluidos el código AutoClass y los assets del tokenizer.
- Precisión: debe preservarse el dtype almacenado del checkpoint y usar `precision` para seleccionar la precisión de cómputo, en lugar de convertir todos los pesos a BF16.
- Madurez: el modelo se publicó el 2026-11-10 y no registra descargas ni likes en el momento de la consulta; el ecosistema de evaluación independiente es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigai/GS1-2B
- Repositorio de código: https://github.com/bigai-nlco/GS1
- Colección de modelos GS1: https://huggingface.co/collections/bigai/gs1
- Documentación de arquitectura y contrato numérico: https://github.com/bigai-nlco/GS1/blob/main/docs/model.md
- Guía de inferencia: https://github.com/bigai-nlco/GS1/blob/main/docs/inference.md
- Resultados de evaluación pública: https://github.com/bigai-nlco/GS1/blob/main/benchmark/results.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
