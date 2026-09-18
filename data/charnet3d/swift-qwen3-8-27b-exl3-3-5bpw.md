# charnet3d/Swift-Qwen3.8-27B-Exl3-3.5bpw

## Resumen

charnet3d/Swift-Qwen3.8-27B-Exl3-3.5bpw es una conversión cuantizada en formato EXL3 a 3,5 bits por peso del modelo Swift-Qwen3.8-27B, desarrollado por UkisAI como derivado de Qwen/Qwen3.8-27B orientado a reducir el gasto de tokens de razonamiento. La model card del modelo original declara una reducción del 58,3% en la mediana de tokens de pensamiento con una pérdida de rendimiento inferior al 1%, lo que se traduce en una aceleración de hasta x1,95 en varias tareas. El pipeline declarado en el repositorio es image-text-to-text, por lo que admite entradas de imagen y texto.

El problema que aborda es el "overthinking" de los modelos de razonamiento: en lugar de recortar capacidades, Swift penaliza durante el ajuste fino los tokens marcadores que disparan cadenas de pensamiento excesivamente largas. Esto reduce el coste por consulta y la latencia en producción manteniendo puntuaciones casi idénticas en GPQA-Diamond, MMLU-Pro, C-Eval e IFBench, lo que lo hace relevante para despliegues con presupuesto de inferencia ajustado.

Este repositorio concreto es un checkpoint derivado de terceros (autor charnet3d), cuantizado a 3,5 bpw para el backend ExLlamaV3, con licencia swift-open-license-1.0 y acceso restringido (gated). Los metadatos de safetensors indican 7.493.391.744 parámetros (~7,5 B), una cifra que no coincide con el "27B" del nombre comercial del modelo base, por lo que conviene verificar el contenido del repositorio antes de dimensionar el despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (modelo base: Qwen/Qwen3.8-27B; derivado mediante LoRA) |
| Parámetros totales | 7.493.391.744 (~7,5 B) según metadatos de safetensors; el nombre del modelo base indica 27 B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 3,5 bits por peso (3.5bpw); existe una versión GGUF del modelo Swift original |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (identificador `other`, repositorio con acceso restringido) |
| Formato de pesos | safetensors (cuantización EXL3, backend ExLlamaV3) |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B (relación: finetune) |
| Tamaño del repositorio | 15,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-17 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base Qwen3.8-27B ni de la adaptación Swift; el repositorio declara únicamente la librería transformers, la etiqueta qwen3_8 y la relación de finetune respecto a Qwen/Qwen3.8-27B. El pipeline image-text-to-text indica que el modelo acepta entradas multimodales de imagen y texto, aunque la model card no especifica el codificador visual ni el mecanismo de fusión. Este checkpoint en concreto es una cuantización EXL3 de 3,5 bits por peso, presumiblemente orientada a inferencia con ExLlamaV3, y no un entrenamiento adicional.

El entrenamiento de Swift se describe como un ajuste fino que identifica tokens marcadores de razonamiento asociados a "overthinking" en los rollouts del modelo y penaliza su uso durante el razonamiento, con un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI. La evaluación publicada compara el modelo base en BF16 con el mismo base más el adaptador Swift, e incluye métricas de puntuación y de tokens medios y medianos consumidos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo "thinking", con trazas de razonamiento internas medibles en número de tokens.
- Razonamiento eficiente: reducción del 58,3% en la mediana de tokens de pensamiento en GPQA-Diamond, con una pérdida declarada inferior al 1% en puntuación.
- Conocimiento y razonamiento científico de nivel experto (88,28% en GPQA-Diamond).
- Razonamiento general y multidisciplinar (84,95% en MMLU-Pro).
- Evaluación en chino (90,62% en C-Eval), lo que sugiere competencia en ese idioma, aunque la lista oficial de idiomas no está declarada.
- Seguimiento de instrucciones (71,80% en IFBench).
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`); el alcance exacto de las capacidades de visión no se detalla en la model card.
- Naturaleza conversacional (etiqueta `conversational`) y compatibilidad con endpoints (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Razonamiento en producción con coste de tokens optimizado: el modelo está diseñado para responder con trazas de pensamiento más cortas, lo que reduce el gasto de tokens de salida y la latencia facturable en APIs y asistentes desplegados a gran escala.
- Preguntas científicas de nivel experto: con un 88,28% en GPQA-Diamond, es adecuado para asistentes de investigación en dominios de física, química y biología donde se requiere razonamiento encadenado.
- Evaluación académica y docente multidisciplinar: el 84,95% en MMLU-Pro permite usarlo como motor de tutoría o de generación de material de estudio en asignaturas universitarias.
- Procesamiento de documentación en chino e inglés: el 90,62% en C-Eval lo hace apropiado para tareas de comprensión y respuesta sobre textos técnicos o académicos en chino, combinado con el rendimiento en inglés.
- Asistentes conversacionales con instrucciones complejas: el 71,80% en IFBench indica capacidad de seguir restricciones de formato y contenido en diálogos multi-turno, útil para atención al cliente y generación de informes estructurados.
- Análisis de entradas con imagen y texto: el pipeline image-text-to-text permite procesar capturas, diagramas o documentos escaneados junto a instrucciones textuales, siempre que se verifique el soporte real de la cuantización.
- Despliegue local o on-premise: la cuantización EXL3 a 3,5 bpw está pensada para ejecutar el modelo en GPUs de gama alta de consumo, lo que facilita escenarios con requisitos de privacidad y sin salida de datos a la nube.
- Investigación sobre eficiencia de razonamiento: sirve como referencia para medir el efecto de penalizar tokens de "overthinking" sobre la exactitud, comparando trazas del modelo base frente al adaptado.

## Benchmarks y rendimiento

Resultados publicados en la model card de Swift-Qwen3.8-27B. La comparación es entre Qwen3.8-27B en BF16 (Base) y el mismo modelo con el adaptador Swift, no entre cuantizaciones del presente repositorio.

| Benchmark | Base | Swift | Tokens medios (base) | Tokens medios (Swift) | Reducción media | Reducción mediana |
|---|---|---|---|---|---|---|
| GPQA-Diamond | 88,38% | 88,28% | 15.014 | 8.855 | -41,0% | -58,3% |
| MMLU-Pro | 85,47% | 84,95% | 2.980 | 1.603 | -46,2% | -28,3% |
| C-Eval | 90,00% | 90,62% | 1.492 | 804 | -46,1% | -19,3% |
| IFBench | 73,53% | 71,80% | 8.052 | 4.657 | -42,2% | -50,5% |

La tabla de la model card aparece truncada en la información proporcionada, por lo que podrían existir filas adicionales (por ejemplo, de categorías como código o matemáticas) que no se recogen aquí. No se han publicado resultados de benchmarks específicos de la cuantización EXL3 a 3,5 bpw en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 15,0 GB. Si esos 15 GB corresponden íntegramente a los pesos de la cuantización, se necesitarían aproximadamente 15-16 GB de VRAM solo para los pesos, más el espacio de caché KV. Si los parámetros reales son 7,5 B a 3,5 bpw (~3,3 GB de pesos), el requisito bajaría a unos 8 GB incluyendo caché KV a contextos moderados. Conviene inspeccionar los archivos del repositorio antes de dimensionar.
- GPU recomendadas si se confirma un peso de ~15 GB: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB) y, para mayor concurrencia, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, siempre que el peso real sea el indicado arriba. En tarjetas de 12-16 GB el margen dependería de la longitud de contexto y del tamaño de lote.
- Opciones de despliegue: el formato EXL3 corresponde al backend ExLlamaV3 (por ejemplo, mediante TabbyAPI). La librería declarada es transformers, aunque la compatibilidad con Transformers para pesos EXL3 no está confirmada en la información disponible. Para llama.cpp u Ollama sería necesario un archivo GGUF del modelo Swift, que existe como repositorio separado (ukisai/Swift-Qwen3.8-27B-GGUF) pero no se confirma que sea equivalente a esta cuantización.
- Latencia y throughput estimados: no disponible. La model card declara una aceleración de hasta x1,95 en varias tareas respecto al modelo base en BF16, atribuible a la reducción del número de tokens generados, no a un aumento del throughput por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charnet3d/Swift-Qwen3.8-27B-Exl3-3.5bpw | 7,5 B según safetensors (nombre: 27 B) | no disponible | No se han publicado benchmarks de esta cuantización | swift-open-license-1.0 (gated) | HuggingFace, 0 descargas |
| Swift-Qwen3.8-27B (modelo original de UkisAI) | no disponible | no disponible | GPQA-Diamond 88,28%, MMLU-Pro 84,95%, C-Eval 90,62%, IFBench 71,80% | swift-open-license-1.0 | HuggingFace (gated) y versión GGUF |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | GPQA-Diamond 88,38%, MMLU-Pro 85,47%, C-Eval 90,00%, IFBench 73,53% | no disponible en la información proporcionada | HuggingFace |
| ThinkingCap-Qwen3.6-27B (BottleCap AI) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados más allá de lo indicado, por lo que la comparación se limita a los resultados publicados por el autor de Swift.

## Limitaciones y advertencias

- Divergencia de datos: el nombre del modelo y su modelo base indican 27 B de parámetros, mientras que los metadatos de safetensors del repositorio declaran 7.493.391.744 parámetros. Es imprescindible verificar el contenido antes de asumir un tamaño u otro.
- La cuantización a 3,5 bits por peso introduce pérdida de precisión adicional respecto al BF16 sobre el que se midieron los benchmarks publicados; el rendimiento real de este checkpoint puede ser inferior al de las cifras de la tabla.
- Los benchmarks publicados corresponden al adaptador Swift sobre el modelo base, no a esta conversión EXL3 de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no cuenta con validación de la comunidad.
- La licencia es `other` (swift-open-license-1.0), no una licencia de código abierto estándar; el modelo está marcado como gated y requiere aceptar condiciones. La model card menciona licencias empresariales ("Enterprise licensing"), por lo que el uso comercial debe revisarse contra el texto completo de la licencia enlazada.
- No se declaran idiomas soportados oficialmente; el único indicio es el rendimiento en C-Eval (chino).
- No se declara la longitud de contexto, dato crítico para despliegues con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación inherente a los modelos de razonamiento generativos, no cuantificado en la información disponible.
- La reducción de tokens de pensamiento puede degradar tareas que requieren cadenas de razonamiento largas; en IFBench la puntuación cae 1,73 puntos porcentuales respecto al base.
- El soporte de tool calling, agentes y audio no está declarado, por lo que no debe asumirse en arquitecturas que dependan de estas funciones.
- Fechas de creación y actualización en 2026; se trata de un modelo reciente con poca trayectoria de uso documentada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/charnet3d/Swift-Qwen3.8-27B-Exl3-3.5bpw
- Sitio del desarrollador del modelo original: https://ukisai.com
- Página de producto de Swift: https://ukisai.com/products/swift
- Versión GGUF del modelo Swift: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Texto de la licencia swift-open-license-1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Modelo de transferencia citado (BottleCap AI): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (corresponden a artículos biográficos sobre Woodrow Wilson), por lo que no se han incluido enlaces adicionales.
