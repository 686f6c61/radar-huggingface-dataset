# igorplayer/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking

## Resumen

Gemma 4 31B it The DECKARD HERETIC UNCENSORED Thinking es un ajuste fino del modelo google/gemma-4-31B-it publicado por el usuario igorplayer. El autor aplica en primer lugar una técnica de "abliteration" o des-censura (etiquetada como "heretic") sobre el modelo base y, posteriormente, un fine-tuning moderado mediante Unsloth sobre una colección de datos propia denominada "THE DECKARD", orientada a escritura creativa, narrativa de ficción, generación de tramas y roleplaying. El resultado es un modelo multimodal (image-text-to-text) que conserva las capacidades del base pero elimina los mecanismos de rechazo y alineación de seguridad.

El modelo mantiene la arquitectura y el tamaño del Gemma 4 31B original, con 31.273.086.512 parámetros reales según los pesos en safetensors, y un contexto declarado de 128k tokens en la model card (aunque las especificaciones del base citadas en la misma card mencionan hasta 256K para la variante de 31B). Incorpora un modo de razonamiento ("thinking") forzado mediante plantilla Jinja, delimitado por los tokens `<|channel>thought ... <channel|>`, y ofrece una plantilla alternativa para modo instruct.

Su relevancia es acotada: se trata de un derivado de nicho, con 26 descargas y 0 likes en el momento de la consulta, sin benchmarks independientes publicados y con licencia Apache 2.0 declarada. Resulta de interés para quienes buscan un modelo de escritura creativa sin restricciones de contenido, pero no para despliegues de producción que requieran garantías de seguridad o evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 31B |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k tokens (según model card del autor); el base 31B se documenta hasta 256K en la tabla citada |
| Tipos de cuantizacion | no disponibles en el repo (pesos en bfloat16); el autor menciona generaciones de ejemplo en q4ks |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal con capacidad de procesamiento de imagen y texto, y modo de razonamiento integrado. Sobre esa base, el autor aplica primero una "abliteration" (des-censura) y después un ajuste fino con Unsloth calificado explícitamente como de nivel "moderate". Los datos de entrenamiento provienen de la colección privada "THE DECKARD", ensamblada, limpiada y revisada internamente por el autor, y que también se ha empleado en otros modelos de distintos tamaños dentro del proyecto "Almost Human". No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO adicionales.

La innovación técnica destacable es la modificación de la plantilla Jinja para forzar el modo thinking, con bloques delimitados por `<|channel>thought ... <channel|>`, y la provisión de una plantilla alternativa (`chat_template-instruct.jinja`) para uso en modo instruct. El autor advierte que puede ser necesario ajustar la configuración de la aplicación de IA para renderizar correctamente el bloque de pensamiento. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento paso a paso mediante modo thinking forzado por plantilla.
- Comprensión de imágenes (pipeline image-text-to-text): herencia de las capacidades de visión del Gemma 4 base, incluyendo parsing de documentos y PDF, OCR multilingüe, reconocimiento de escritura manual y comprensión de gráficos según la tabla del base citada.
- Escritura creativa y narrativa: ficción, ciencia ficción, romance, generación de tramas y subtramas, continuación de escenas, prosa vívida y roleplaying, según los tags del autor.
- Generación de código: el autor incluye el tag "coder", aunque no aporta benchmarks específicos de código para este derivado.
- Capacidades multilingües: no disponibles explícitamente para este derivado; el base reporta MMMLU del 88,4%.
- Tool calling / function calling: no documentado para este derivado; el base reporta Tau2 del 76,9%, lo que sugiere soporte en el modelo original.
- Modo instruct alternativo mediante plantilla Jinja separada.
- Ausencia declarada de mecanismos de rechazo ("no nanny, no oversight") tras la des-censura.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar relatos, tramas y subtramas con prosa detallada, apoyándose en el contexto de 128k tokens para mantener coherencia en novelas o sagas por capítulos.
- Roleplaying y personajes conversacionales: la des-censura y el ajuste sobre datos de ficción permiten mantener personajes con voces consistentes en conversaciones multi-turno prolongadas, sin rechazos por contenido sensible.
- Continuación de escenas y "scene continue": útil en herramientas de asistencia a guionistas o escritores que necesitan extender un borrador manteniendo tono y punto de vista.
- Generación de guiones y diálogos para videojuegos o narrativa interactiva: el modo instruct permite respuestas directas, mientras que el modo thinking sirve para planificar arcos argumentales complejos.
- Análisis de documentos e imágenes con narración: al conservar la capacidad image-text-to-text del base, puede extraer texto de imágenes o PDF y reescribirlo en formato narrativo o divulgativo.
- Prototipado de asistentes creativos sin filtros: para investigación sobre alineación, evaluación de sesgos o estudios de generación de contenido, donde se necesita un modelo sin capas de rechazo.
- Experimentación con modos de razonamiento: comparar salidas en modo thinking frente a instruct sobre las mismas tareas creativas, como hace el propio autor en sus benchmarks internos.

## Benchmarks y rendimiento

El autor publica benchmarks internos propios (arc, arc/e, boolq, hswag, obkqa, piqa, wino) comparando su modelo en modo thinking e instruct frente al base Gemma 4 31B it en modo instruct. No son benchmarks estándar de la industria y no hay evaluación independiente.

| Benchmark | Thinking mode | Instruct mode | Base Gemma 4 31B it (instruct) |
|---|---|---|---|
| arc | 0,431 | 0,573 | 0,496 |
| arc/e | 0,505 | 0,719 | 0,653 |
| boolq | 0,426 | 0,900 | 0,901 |
| hswag | 0,670 | 0,715 | 0,624 |
| obkqa | 0,376 | 0,420 | 0,380 |
| piqa | 0,766 | 0,781 | 0,732 |
| wino | 0,710 | 0,695 | 0,653 |

El autor afirma que el modelo "supera al base en 6 de 7 benchmarks", lo que se cumple en modo instruct (boolq queda prácticamente empatado, 0,900 frente a 0,901). En modo thinking, en cambio, el modelo queda por debajo del base en arc, boolq y obkqa. El propio autor advierte que el modo instruct suele puntuar más alto que el thinking en algunas pruebas.

Resultados del modelo base publicados en la model card (Gemma 4 31B, modo instruct), a título de referencia del potencial del linaje:

| Benchmark | Gemma 4 31B |
|---|---|
| MMLU Pro | 85,2% |
| AIME 2026 sin herramientas | 89,2% |
| LiveCodeBench v6 | 80,0% |
| Codeforces ELO | 2150 |
| GPQA Diamond | 84,3% |
| Tau2 (media de 3) | 76,9% |
| HLE sin herramientas | 19,5% |
| MMMLU | 88,4% |
| MMMU Pro (visión) | 76,9% |
| MATH-Vision | 85,6% |
| MRCR v2 8 needle 128k | 66,4% |

No se han publicado resultados de benchmarks independientes para este derivado en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 62,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; se recomienda al menos 80 GB para inferencia cómoda con contexto largo.
- VRAM estimada en cuantización de 4 bits: en torno a 16-18 GB para pesos, más KV cache; viable en GPUs de 24 GB con contexto moderado.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 con contexto completo; RTX 4090 (24 GB) o RTX 3090 (24 GB) solo con cuantización de 4 bits y contexto reducido.
- Cabe en GPU de consumo: sí, únicamente cuantizado a 4 bits en GPUs de 24 GB; no cabe en bfloat16 en ninguna GPU de consumo actual.
- Opciones de despliegue: llama.cpp y Ollama para GGUF cuantizado; vLLM o TGI para safetensors en bfloat16 en hardware de datacenter; el formato de plantilla Jinja requiere configuración específica para el bloque de pensamiento.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking | 31,27B | 128k | Apache 2.0 | Derivado des-censurado con fine-tuning creativo; benchmarks solo internos |
| google/gemma-4-31B-it | 31B (no confirmado en detalle) | 256K según tabla del base | Gemma license (según modelo original; la card del derivado declara Apache 2.0) | Base oficial, alineado, con benchmarks publicados (MMLU Pro 85,2%, GPQA 84,3%) |
| DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking | 40B (según nombre) | no disponible | no disponible | Mismo dataset "THE DECKARD" sobre base Qwen; citado por el autor como referencia |
| Gemma 4 26B A4B | 26B (MoE, A4B) | 256K | Gemma license | Alternativa del mismo linaje, más ligera, con MMLU Pro 82,6% |

La comparación directa de rendimiento con el base es la única disponible y procede de benchmarks internos del autor, no verificados de forma independiente. No hay datos que permitan comparar con modelos des-censurados de otros linajes más allá de la referencia cualitativa al modelo Qwen del mismo proyecto.

## Limitaciones y advertencias

- Modelo des-censurado de forma deliberada: no aplica rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o explícitamente sexual. No apto para aplicaciones dirigidas al público general sin capas de filtrado externas.
- Riesgo elevado de alucinación en modo thinking: los benchmarks internos muestran caídas frente al base en arc, boolq y obkqa, y el propio autor reconoce que el modo thinking rinde peor en algunas pruebas.
- Los benchmarks publicados son internos, con conjuntos de evaluación no estándar y sin verificación externa; no deben tomarse como indicativos de rendimiento en tareas reales.
- Idiomas soportados no documentados para este derivado; el multilingüismo es una herencia no verificada del base.
- Contexto declarado de 128k en la model card, mientras que la tabla del base citada menciona 256K para la variante de 31B; existe ambigüedad y conviene validar el comportamiento real en contextos largos.
- Datos de entrenamiento privados y no auditables ("in house, private"), lo que impide evaluar sesgos introducidos por el fine-tuning.
- Licencia declarada Apache 2.0 por el autor, pero el modelo base es de Google y su licencia original (Gemma license) puede imponer condiciones adicionales; conviene verificar la compatibilidad antes de uso comercial.
- El modo thinking está forzado por plantilla Jinja; requiere configuración específica en la aplicación y puede romper integraciones que no gestionen los tokens `<|channel>thought` y `<channel|>`.
- Repositorio con 26 descargas y 0 likes: sin comunidad, sin issues resueltos y sin garantía de mantenimiento.
- El tag "coder" no está respaldado por benchmarks de código específicos para este derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igorplayer/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo del mismo proyecto con base Qwen citado por el autor: https://huggingface.co/DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Unsloth (herramienta de fine-tuning empleada): https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
