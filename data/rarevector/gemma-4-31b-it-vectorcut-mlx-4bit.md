# rarevector/gemma-4-31B-it-VectorCut-MLX-4bit

## Resumen

`rarevector/gemma-4-31B-it-VectorCut-MLX-4bit` es una cuantización de 4 bits en formato MLX del checkpoint multimodal `RareVector/gemma-4-31B-it-VectorCut-BF16`, un derivado de Gemma 4 de 31B de parámetros (31.742.607.472 según los safetensors) al que se le ha aplicado el pipeline propietario "VectorCut" de Rare Vector Labs. El objetivo declarado es eliminar los mecanismos de rechazo (refusals) del modelo base sin degradar su inteligencia, su capacidad de visión ni su velocidad de inferencia, mediante una ablación quirúrgica localizada en 33 "interruptores" de rechazo (99 tensores de MLP con gating) en lugar de la abliteración global convencional sobre el residual stream.

La build está pensada exclusivamente para Apple Silicon y para el runtime oMLX, con cuantización `oQ4e-mtp` calibrada con iMatrix. Incluye de serie la cabeza MTP (Multi-Token Prediction) fusionada para decodificación especulativa nativa, y conserva los 356 tensores del codificador visual en BF16 sin cuantizar. El resultado es un checkpoint de 20,5 GB con arquitectura densa de 31B, ventana de contexto de 256K y soporte declarado para más de 35 idiomas.

Es relevante ahora porque demuestra una vía alternativa a la abliteración tradicional: en lugar de degradar el modelo globalmente para eliminar rechazos, se interviene quirúrgicamente sobre un subconjunto mínimo de tensores y se verifica tensor a tensor con SHA-256 que 1.089 de 1.188 tensores permanecen idénticos bit a bit al original. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque conviene revisar las condiciones del modelo base Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 31.742.607.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (256.000) |
| Tipos de cuantizacion | 4 bits MLX (`oQ4e-mtp`, calibracion iMatrix); vision en BF16 |
| Idiomas soportados | 35+ idiomas (en, de, fr, es, it, pt, nl, pl, ru, uk, cs, sv, da, fi, no, tr, ar, he, hi, bn, ta, te, ur, vi, th, id, ms, zh, ja, ko, el, ro, hu, bg, fa, sw, tl); preentrenado en 140+ |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 20,5 GB |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 de 31B, un transformer denso (no MoE) con capacidad multimodal de entrada imagen-texto y una ventana de contexto de 256K tokens. La build MLX añade una cabeza MTP (Multi-Token Prediction) fusionada en el propio checkpoint, que habilita decodificación especulativa nativa en oMLX sin necesidad de descargar un modelo asistente separado. Los 356 tensores del codificador visual (`visual.*`) se mantienen en BF16, de modo que la cuantización de 4 bits afecta únicamente a los pesos del transformer de lenguaje.

El entrenamiento original de Gemma 4 no se detalla en la información disponible; el autor solo indica que el modelo está preentrenado en más de 140 idiomas y que conserva el "thinking mode" incorporado de Gemma 4. La modificación VectorCut no es un reentrenamiento: es una ablación quirúrgica que ajusta 33 interruptores de rechazo (99 tensores de proyecciones MLP con gating) sobre el maestro BF16, sin tocar atención, layer norms, embeddings, LM head ni el codificador visual. La verificación se realiza con checksum SHA-256 por tensor: 1.089 de 1.188 tensores quedan bit a bit idénticos al original antes de aplicar la cuantización `oQ4e-mtp` y fusionar la cabeza MTP.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 256K tokens.
- Modo "thinking" incorporado de Gemma 4 para razonamiento extendido.
- Comprensión de imágenes (image-text-to-text) con codificador visual preservado en BF16.
- Generación de código y resolución de problemas matemáticos (validado en GSM8K e IFEval según el autor).
- Capacidades multilingües en más de 35 idiomas, incluidos español, catalán-adyacentes europeos, árabe, hindi, chino, japonés y coreano.
- Decodificación especulativa nativa mediante la cabeza MTP fusionada (en oMLX).
- Escritura creativa sin restricciones de rechazo declaradas por el autor (ficción, worldbuilding, brainstorming).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa y ficción sin fricción: el ajuste VectorCut elimina los rechazos en 33 interruptores manteniendo el 99,9% de los tensores intactos, lo que permite narrativa adulta, worldbuilding complejo y brainstorming sin que el modelo se bloquee, con una degradación declarada máxima de 0,12 pp frente al baseline de 8 bits.
- Análisis de documentos largos con imágenes: la ventana de 256K tokens combinada con el codificador visual en BF16 permite procesar informes, contratos o papers con figuras intercaladas en una sola pasada, algo viable en un Mac Studio con memoria unificada suficiente.
- Asistente local de investigación en Apple Silicon: al ejecutarse en oMLX con cuantización de 4 bits y decodificación especulativa MTP, ofrece latencia reducida en MacBook Pro y Mac Studio sin depender de la nube, útil para investigadores que manejan datos sensibles.
- Generación de código en flujos de trabajo locales: el modelo conserva las capacidades de razonamiento del Gemma 4 original (IFEval con empate exacto en tres métricas frente al baseline), por lo que sirve para autocompletado, revisión y refactorización en entornos de desarrollo aislados.
- Traducción y atención al cliente multilingüe: con soporte para más de 35 idiomas y contexto largo, puede gestionar conversaciones multi-turno con historial extenso en español, alemán, francés, árabe o japonés, manteniendo coherencia a lo largo de sesiones largas.
- Procesamiento de documentación técnica con OCR y VQA: la preservación de los 356 tensores visuales en BF16 permite extraer información de capturas, diagramas y tablas escaneadas sin la degradación típica de cuantizaciones que comprimen también el encoder visual.
- Prototipado multimodal en macOS: desarrolladores que quieran validar pipelines image-text-to-text en hardware Apple pueden usar este checkpoint como sustituto directo del Gemma 4 original, con la ventaja de incluir MTP y no requerir un modelo asistente adicional.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor corresponden a la build de 8 bits (`oQ8e-mtp`) derivada del mismo maestro BF16, no a esta build de 4 bits. Se midieron con `lm_eval` v0.4.13 a temperatura 0,0 sobre 1.860 muestras.

| Tarea | Metrica | VectorCut 8-bit | Baseline 8-bit estandar | Delta |
|---|---|---:|---:|---:|
| `gsm8k_cot` (n=1.319) | exact_match, strict-match | 96,66% | 96,74% | -0,08 pp |
| `gsm8k_cot` (n=1.319) | exact_match, flexible-extract | 96,44% | 96,51% | -0,08 pp |
| `ifeval` (n=541) | inst_level_loose_acc | 94,60% | 94,72% | -0,12 pp |
| `ifeval` (n=541) | inst_level_strict_acc | 93,05% | 93,05% | Empate |
| `ifeval` (n=541) | prompt_level_loose_acc | 92,24% | 92,24% | Empate |
| `ifeval` (n=541) | prompt_level_strict_acc | 90,02% | 90,02% | Empate |

No se han publicado resultados de benchmarks específicos para la build de 4 bits en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 20,5 GB; en inferencia MLX conviene reservar entre 24 y 32 GB de memoria unificada para margen de contexto y caché KV con 256K tokens.
- GPU recomendadas: Apple Silicon exclusivamente. Mac Studio con M2 Ultra o M3 Ultra (64-192 GB de memoria unificada) para contexto completo; MacBook Pro con M3/M4 Max (36-128 GB) para uso general; MacBook Air con M4 y 24-32 GB para contexto reducido.
- Cabe en GPU consumer: sí, en cualquier Mac con al menos 24 GB de memoria unificada; no es compatible con GPU NVIDIA o AMD convencionales por el formato MLX.
- Opciones de despliegue: oMLX (recomendado por el autor, necesario para aprovechar la decodificación especulativa MTP), MLX-LM. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput: no disponible en la información proporcionada. La decodificación especulativa MTP debería reducir la latencia frente a la build sin MTP, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `rarevector/gemma-4-31B-it-VectorCut-MLX-4bit` | 31,7B | 256K | Si (BF16) | Apache 2.0 | MLX safetensors | Ablacion quirurgica, MTP incluido, solo Apple Silicon |
| `RareVector/gemma-4-31B-it-VectorCut-MLX-8bit` | 31,7B | 256K | Si (BF16) | Apache 2.0 | MLX safetensors | Misma familia, mayor precision, mayor uso de memoria |
| `RareVector/gemma-4-31B-it-VectorCut-BF16` | 31,7B | 256K | Si | Apache 2.0 | safetensors | Maestro sin cuantizar, sin MTP fusionado |
| Gemma 4 31B IT (original) | 31,7B | 256K | Si | Gemma Terms | safetensors, GGUF, MLX | Modelo base con rechazos intactos |

## Limitaciones y advertencias

- La eliminación de rechazos es intencionada y declarada por el autor: el modelo puede generar contenido que el Gemma 4 original bloquearía, lo que exige filtros de seguridad externos en producción.
- El autor no documenta los sesgos específicos introducidos o amplificados por la ablación; se desconoce si los 33 interruptores modificados afectan a sesgos de género, raza o religión.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación para esta build; los benchmarks disponibles solo cubren GSM8K e IFEval en la variante de 8 bits.
- Los benchmarks publicados corresponden a la build de 8 bits, no a esta de 4 bits; la degradación real de la cuantización `oQ4e-mtp` no está cuantificada.
- Compatibilidad limitada: solo funciona en Apple Silicon con MLX u oMLX; no se puede desplegar en servidores NVIDIA, TPU ni en la mayoría de infraestructuras cloud convencionales.
- La decodificación especulativa MTP requiere oMLX; en MLX-LM estándar la cabeza MTP puede no aprovecharse.
- La licencia del repositorio es Apache 2.0, pero el modelo base Gemma 4 está sujeto a los Gemma Terms of Use; conviene verificar que el uso comercial cumpla ambas condiciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación independiente de la comunidad.
- El pipeline VectorCut es propietario y no se publica la metodología completa de selección de los 33 interruptores, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/rarevector/gemma-4-31B-it-VectorCut-MLX-4bit
- Modelo base BF16: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-BF16
- Build MLX 8-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-8bit
- Build MLX 6-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-6bit
- Organización Rare Vector: https://huggingface.co/RareVector
- Apoyo al autor: https://ko-fi.com/rarevector
