# rarevector/gemma-4-31B-it-VectorCut-MLX-6bit

## Resumen

`gemma-4-31B-it-VectorCut-MLX-6bit` es una cuantización de 6 bits en formato MLX del checkpoint `RareVector/gemma-4-31B-it-VectorCut-BF16`, un derivado de Gemma 4 31B IT (instruido) publicado por Rare Vector Labs. El modelo es multimodal (image-text-to-text) con arquitectura transformer densa de 31.742.607.472 parámetros y una ventana de contexto de 256K tokens. El pipeline "VectorCut" del autor aplica una ablación quirúrgica sobre 33 interruptores de rechazo (99 tensores gated-MLP) en lugar de una abliteración global, con el objetivo de reducir las negativas del modelo sin degradar razonamiento, visión ni velocidad.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de modificación de pesos que el autor presenta como alternativa a la abliteración convencional, con verificación por checksum SHA-256 tensor a tensor. Por otro, es una build específica para Apple Silicon que integra automáticamente una cabeza de borrador MTP (Multi-Token Prediction) para decodificación especulativa nativa en oMLX, manteniendo los 356 tensores del codificador visual en BF16 sin cuantizar.

El modelo está pensado para desarrolladores que trabajan en local sobre hardware Apple y necesitan un modelo multimodal de 31B con contexto largo, capacidades multilingües amplias (35+ idiomas declarados) y un modo de pensamiento integrado. La licencia es Apache 2.0 según la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa multimodal (image-text-to-text); modelo base Gemma 4 31B IT |
| Parametros totales | 31.742.607.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | 6 bits MLX (`oQ6e-mtp`, calibración iMatrix); visión en BF16 |
| Idiomas soportados | 35+ idiomas (multilingual, en, de, fr, es, it, pt, nl, pl, ru, uk, cs, sv, da, fi, no, tr, ar, he, hi, bn, ta, te, ur, vi, th, id, ms, zh, ja, ko, el, ro, hu, bg, fa, sw, tl); preentrenado en 140+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX); repo de 27,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 31B parámetros con codificador visual integrado (356 tensores bajo el prefijo `visual.*`) y una cabeza de borrador MTP (`mtp.*`) fusionada en el checkpoint para decodificación especulativa. La build parte del maestro BF16 `RareVector/gemma-4-31B-it-VectorCut-BF16`, sobre el que se aplica cuantización `oQ6e-mtp` calibrada con iMatrix. Según la model card, 1.089 de 1.188 tensores permanecieron bit a bit idénticos al modelo original antes de la cuantización, verificado mediante checksum SHA-256 por tensor.

La modificación "VectorCut" no altera attention heads, layer norms, embeddings ni el LM head; se limita a 33 interruptores de rechazo materializados en 99 tensores de proyecciones gated-MLP. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable es la combinación de ablación localizada con preservación del codificador visual en BF16 y la inclusión automática de la cabeza MTP para decodificación especulativa en oMLX.

## Capacidades

- Generación de texto y razonamiento multi-turno con modo de pensamiento integrado (built-in thinking mode) de Gemma 4.
- Procesamiento de imágenes y texto (pipeline image-text-to-text): el codificador visual se mantiene en BF16, sin cuantizar.
- Generación de código y resolución de problemas matemáticos, con resultados medidos en GSM8K CoT e IFEval en la build de 8 bits.
- Capacidades multilingües amplias: 35+ idiomas declarados en la model card y preentrenamiento sobre 140+ idiomas.
- Decodificación especulativa nativa mediante la cabeza MTP fusionada, orientada a acelerar la inferencia en oMLX.
- Contexto largo de hasta 256K tokens para documentos extensos, conversaciones largas o análisis de repositorios.
- No se especifica en la información disponible soporte explícito de tool calling, function calling ni flujos de agentes multi-paso.

## Casos de uso

- Asistente local multimodal sobre Mac: el modelo acepta imagen y texto en el mismo prompt y mantiene el codificador visual en BF16, lo que permite describir capturas, diagramas o documentos escaneados sin pérdida de calidad visual por cuantización.
- Análisis de documentos largos: con 256K tokens de contexto se pueden procesar contratos, informes o bases de código extensas en una sola pasada, útil para resúmenes estructurados y extracción de datos.
- Escritura creativa y worldbuilding: el pipeline VectorCut busca reducir rechazos en ficción y brainstorming; los benchmarks del autor muestran una caída máxima de 0,12 pp frente al baseline de 8 bits en IFEval, lo que respalda su uso en generación creativa sin degradar el seguimiento de instrucciones.
- Desarrollo de software en local: la build de 8 bits alcanza 96,66% en `gsm8k_cot` (exact_match strict) y mantiene razonamiento matemático; sirve para asistencia de código y explicación de algoritmos en un entorno Apple Silicon sin depender de la nube.
- Atención al cliente multilingüe: el soporte declarado de 35+ idiomas permite construir un chatbot que responda en el idioma del usuario, con contexto largo para conservar el historial de la conversación.
- Investigación sobre alineación y ablación: el checkpoint y su maestro BF16 permiten reproducir el análisis de preservación de capacidades (checksums SHA-256, evaluación con `lm_eval`) y estudiar el efecto de intervenciones localizadas frente a abliteración global.
- Prototipado con decodificación especulativa: la cabeza MTP fusionada permite probar aceleración por speculative decoding en oMLX sin descargar un modelo asistente adicional.

## Benchmarks y rendimiento

Los datos publicados corresponden a la build de 8 bits (`oQ8e-mtp`) derivada del mismo maestro BF16, medida con `lm_eval` v0.4.13 a temperatura 0,0 sobre 1.860 muestras. No se han publicado resultados específicos para la build de 6 bits.

| Tarea | Metrica | VectorCut 8-bit | Baseline 8-bit estandar | Delta |
|---|---|---:|---:|---:|
| `gsm8k_cot` (n=1.319) | exact_match, strict-match | 96,66% | 96,74% | -0,08 pp |
| `gsm8k_cot` (n=1.319) | exact_match, flexible-extract | 96,44% | 96,51% | -0,08 pp |
| `ifeval` (n=541) | inst_level_loose_acc | 94,60% | 94,72% | -0,12 pp |
| `ifeval` (n=541) | inst_level_strict_acc | 93,05% | 93,05% | Empate |
| `ifeval` (n=541) | prompt_level_loose_acc | 92,24% | 92,24% | Empate |
| `ifeval` (n=541) | prompt_level_strict_acc | 90,02% | 90,02% | Empate |

No se han publicado resultados de benchmarks para MMLU, HumanEval ni otras tareas en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 27,8 GB en 6 bits; se recomienda al menos 32 GB de memoria unificada en Apple Silicon para cargar el modelo con margen para el contexto y el codificador visual en BF16.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (series M3 Max, M4 Max y superiores); no está pensado para GPUs NVIDIA/AMD, ya que el formato es MLX.
- ¿Cabe en GPU consumer? Sí, en equipos Apple con 32 GB o más de memoria unificada; en configuraciones de 24 GB el margen es insuficiente para contexto largo.
- Opciones de despliegue: MLX y oMLX (recomendado por el autor, con decodificación especulativa vía MTP); llama.cpp, vLLM y TGI no son compatibles con este formato de pesos.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP está diseñada para acelerar la decodificación en oMLX, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `gemma-4-31B-it-VectorCut-MLX-6bit` (este) | 31,7B | 256K | MLX 6-bit | Apache 2.0 | Visión BF16, MTP fusionado, ablación localizada |
| `RareVector/gemma-4-31B-it-VectorCut-MLX-8bit` | 31,7B | 256K | MLX 8-bit | Apache 2.0 | Misma familia, mayor precisión, mayor tamaño en disco |
| `RareVector/gemma-4-31B-it-VectorCut-MLX-4bit` | 31,7B | 256K | MLX 4-bit | Apache 2.0 | Versión compacta, mayor ahorro de memoria |
| `RareVector/gemma-4-31B-it-VectorCut-BF16` | 31,7B | 256K | safetensors BF16 | Apache 2.0 | Maestro sin MTP integrado |

No se dispone de datos de benchmarks de terceros (Gemma 4 original u otros modelos de 30B) en la información proporcionada para establecer comparaciones de rendimiento cruzadas.

## Limitaciones y advertencias

- La modificación VectorCut está diseñada para reducir rechazos; esto puede aumentar la probabilidad de generar contenido que el modelo original rechazaría, con implicaciones de seguridad y cumplimiento en producción.
- Los benchmarks publicados corresponden a la build de 8 bits, no a la de 6 bits; el rendimiento real de esta cuantización puede diferir y no se ha documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta build.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a ecosistemas CUDA ni a servidores x86 convencionales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a términos adicionales de Google que la model card no detalla; conviene verificar la licencia del modelo original antes de un despliegue comercial.
- El autor es un particular (rarevector) y el repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados declarados.
- No se especifican sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarevector/gemma-4-31B-it-VectorCut-MLX-6bit
- Modelo base BF16: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-BF16
- Build MLX 8-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-8bit
- Build MLX 4-bit: https://huggingface.co/RareVector/gemma-4-31B-it-VectorCut-MLX-4bit
- Perfil del autor: https://huggingface.co/RareVector
- Apoyo al autor: https://ko-fi.com/rarevector
