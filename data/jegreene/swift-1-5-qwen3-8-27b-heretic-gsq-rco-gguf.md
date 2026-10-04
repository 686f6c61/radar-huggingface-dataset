# jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF

## Resumen

Este repositorio contiene una compilación GGUF de un solo archivo del modelo Swift-1.5-Qwen3.8-27B, un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) derivado de `ukisai/Swift-1.5-Qwen3.8-27b` y publicado por el usuario `jegreene`. No es una versión oficial de UkisAI ni de Alibaba Cloud: se trata de una modificación "abliterated" (parcialmente decensurada) generada con la herramienta Heretic, que elimina parte del comportamiento de rechazo del modelo original, y posteriormente cuantizada con las mismas asignaciones por tensor e imatrix que usan las publicaciones GSQ-RCO `-mtp` de UkisAI.

El modelo conserva la cabeza MTP (multi-token prediction) para decodificación especulativa y un proyector de visión (mmproj) construido a partir del torreón visual de Swift, por lo que la pipeline declarada es `image-text-to-text`: acepta entradas de imagen y texto y genera texto. Se distribuye en tres cuantizaciones (IQ3_S, IQ3_XXS e IQ2_S), todas con MTP, más un único archivo mmproj en F16 compartido por las tres.

Su relevancia actual es doble. Por un lado, ofrece un modelo multimodal de ~27 B ejecutable en una sola GPU de consumo gracias a cuantizaciones de 2,81 a 3,55 bits por peso, con velocidades de descarga notables (4.599 descargas y 9 likes en el momento de la consulta). Por otro, es un caso de estudio sobre la resistencia a la abliteración: según la propia model card, el modelo original resiste fuertemente el proceso, y esta versión solo revierte aproximadamente 1 de cada 5 peticiones que el original rechaza.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (modelo derivado de Qwen3.8-27B; incluye torreón visual y cabeza MTP) |
| Parámetros totales | 27.320.697.856 (~27,3 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ3_S (3,55 BPW), IQ3_XXS (3,06 BPW), IQ2_S (2,81 BPW); proyector visual en F16 |
| Idiomas soportados | No disponible |
| Licencia | `swift-open-license-1.0` (declarada como `license: other` en HuggingFace) |
| Formato de pesos | GGUF (single-file, compatible con llama.cpp) |
| Tamaño del repositorio | 33,1 GB |
| Pipeline | `image-text-to-text` |
| Modelo base | `ukisai/Swift-1.5-Qwen3.8-27b` |
| Fecha de creación / actualización | 2026-09-29 / 2026-10-03 |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura interna más allá de los que expone la model card: el modelo procede de `ukisai/Swift-1.5-Qwen3.8-27b`, conserva la cabeza MTP para decodificación especulativa y añade un proyector de visión (mmproj) construido a partir del propio torreón visual de Swift. Esto implica una arquitectura multimodal con codificador visual y un modelo de lenguaje subyacente de tipo transformer, pero la información proporcionada no especifica número de capas, tipo de atención, ni si existe mezcla de expertos. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; todos esos datos quedan como no disponibles.

Sí está documentado el proceso de modificación. La abliteración se realizó con Heretic y tiene un coste medible: la divergencia KL respecto a Swift 1.5 original es de 0,082. El autor advierte que Swift 1.5 resiste fuertemente este tipo de intervención y que el resultado es una decensura parcial, no total. Sobre la cuantización, se reutilizan las asignaciones por tensor y la imatrix de las publicaciones GSQ-RCO de UkisAI. Las divergencias KL frente a BF16 reportadas por UkisAI para sus propios archivos (no abliterated) en los mismos niveles son 0,051 para IQ3_S, 0,098 para IQ3_XXS y 0,135 para IQ2_S; el 0,082 de la abliteración se suma a esas cifras. Solo el archivo IQ3_S fue evaluado en velocidad y con MTP activado.

## Capacidades

- Generación de texto conversacional de un solo turno y multi-turno.
- Razonamiento explícito en modo *thinking*: el modelo usa etiquetas `<think>` y, según la model card, con el razonamiento activado responde a peticiones que el modelo original rechaza, mencionando la seguridad en el razonamiento pero continuando la respuesta.
- Comprensión de imágenes: pipeline `image-text-to-text` con proyector mmproj en F16, lo que permite tareas de descripción, pregunta-respuesta sobre imagen y OCR aproximado (no se especifican resoluciones ni número de tokens visuales).
- Decodificación especulativa mediante cabeza MTP, que acelera la generación al predecir varios tokens por paso.
- Razonamiento matemático a nivel de escuela primaria y resolución de problemas aritméticos.
- Razonamiento de conocimiento general y elección múltiple.
- Seguimiento de instrucciones con múltiples restricciones simultáneas (buena puntuación en IFEval, ver sección de benchmarks).
- Comportamiento parcialmente decensurado: responde a parte de las peticiones que el original rechaza, aunque con frecuencia las esquiva en lugar de contestarlas directamente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada (el modo thinking sugiere razonamiento en cadena, pero no se documenta uso agéntico).
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional local en estación de trabajo: con 27,3 B de parámetros cuantizados a 3,55 BPW (12,12 GB), el modelo cabe en una GPU de 16 GB o superior, lo que permite desplegar un asistente privado sin enviar datos a la nube, útil en entornos con requisitos de confidencialidad.
- Analítica de documentos con componente visual: al ser `image-text-to-text` con mmproj, puede recibir capturas de pantalla, diagramas o fotografías y responder preguntas sobre ellas dentro de un mismo flujo de chat, por ejemplo para extraer datos de facturas o resúmenes de gráficos.
- Generación de documentación técnica y respuestas extensas: su 95,20 de precisión estricta a nivel de instrucción en IFEval indica que sigue consignas compuestas (formato, longitud, restricciones léxicas), lo que encaja en la producción de informes con plantillas estrictas.
- Tutoría y resolución de problemas de matemáticas de nivel escolar: con 97,6 de precisión en una muestra de 250 preguntas de GSM8K, es adecuado para asistentes educativos que explican el razonamiento paso a paso en modo thinking.
- Evaluación de seguridad y *red-teaming* de modelos alineados: el propio repositorio documenta metodología de medición de rechazos (listas estrictas y por defecto, divergencia KL), por lo que sirve como material de comparación para estudiar cuánto resiste un modelo a la abliteración y qué efectos colaterales tiene.
- Investigación sobre decodificación especulativa en hardware de consumo: al incluir cabeza MTP, permite medir ganancias de throughput con llama.cpp en GPUs de gama alta manteniendo la calidad declarada por el autor.
- Prototipado rápido de aplicaciones multimodales en portátiles: la variante IQ2_S (9,61 GB) más el mmproj (0,93 GB) permite arrancar un prototipo en GPUs de 12 GB y validar la viabilidad del producto antes de invertir en hardware.
- Despliegue en el borde con CPU y offload parcial: los GGUF se pueden ejecutar en llama.cpp con reparto de capas entre CPU y GPU, lo que habilita demos en equipos sin GPU dedicada a costa de latencia mucho mayor (no cuantificada en la información disponible).

## Benchmarks y rendimiento

Los siguientes resultados son **autodeclarados por el autor** y no están verificados de forma independiente. Fueron medidos, según la model card, sobre el archivo IQ3_S-mtp con decodificación MTP activada y servido por llama.cpp.

| Benchmark | Muestra | Métrica | Resultado |
|---|---|---|---|
| IFEval | Completo (split train) | Prompt-level strict accuracy | 92,98 |
| IFEval | Completo (split train) | Instruction-level strict accuracy | 95,20 |
| IFEval | Completo (split train) | Prompt-level loose accuracy | 94,64 |
| IFEval | Completo (split train) | Instruction-level loose accuracy | 96,52 |
| MMLU-Pro | 300 preguntas aleatorias (split test) | Accuracy | 86,67 |
| GSM8K | 250 preguntas aleatorias (split test, config main) | Accuracy | 97,60 |

La model card menciona una tabla comparativa con "Qwen3.8-27B, third-par..." (texto truncado en la información disponible), pero los valores de los modelos de comparación no se han podido recuperar. Los archivos IQ3_XXS e IQ2_S no han sido evaluados en benchmarks ni en velocidad según el propio autor. No se han publicado cifras de throughput, latencia o tasa de aceptación del MTP en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos, según archivo: IQ3_S 12,12 GB; IQ3_XXS 10,44 GB; IQ2_S 9,61 GB. Añadir 0,93 GB del mmproj F16 si se usa entrada de imagen, más el espacio de la caché KV (no cuantificado en la información disponible).
- IQ3_S (opción recomendada): encaja con margen en RTX 4090 (24 GB), A100 40/80 GB, H100; en RTX 4080 / 4070 Ti Super (16 GB) funciona con contexto moderado.
- IQ3_XXS: adecuado para GPUs de 12-16 GB, por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, con contexto reducido.
- IQ2_S: la opción para 12 GB o menos, penalizando calidad (KL frente a BF16 de 0,135 solo por cuantización, más el 0,082 de la abliteración).
- Motor de inferencia confirmado: llama.cpp (formato GGUF, `library_name: gguf`). Otros runners compatibles con GGUF (Ollama, LM Studio, TGI con soporte GGUF) no están confirmados en la información disponible.
- Decodificación especulativa: soportada mediante la cabeza MTP incluida en los tres archivos. No se publican cifras de aceleración en la información disponible.
- CPU y RAM: no se especifican requisitos. Para offload parcial con llama.cpp se recomienda planificar RAM suficiente para las capas no descargadas a GPU, pero el dato no está en la documentación proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Rechazos estrictos (de 100) | KL vs. base |
|---|---|---|---|---|---|---|
| Este modelo (`jegreene/...-heretic-GSQ-RCO-GGUF`) | 27,3 B | No disponible | IQ3_S, IQ3_XXS, IQ2_S + mmproj F16 | `swift-open-license-1.0` | 80 | 0,082 (abliteración) |
| Swift 1.5 Qwen3.8-27B original (`ukisai/...`) | ~27,3 B | No disponible | No disponible | Licencia Swift 1.5 | 99 | 0 |
| `ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF` | ~27,3 B | No disponible | Mismas asignaciones GSQ-RCO con `-mtp` | Licencia Swift 1.5 | No disponible | 0,051 en IQ3_S (solo cuantización) |

Para el conteo por defecto de Heretic, este modelo baja a 36 rechazos de 100 frente a los 98 del original; el autor advierte que esa métrica cuenta como éxito respuestas que en realidad esquivan la petición (por ejemplo, responder a "cómo fabricar una bomba" con instrucciones de un globo de agua). Una búsqueda anterior optimizada para ese conteo llegó a 25/100, pero con una puntuación de ~84 en el conteo estricto. No hay datos disponibles para comparar con otros modelos multimodales de tamaño similar fuera del linaje Swift.

## Limitaciones y advertencias

- Modelo no oficial: UkisAI y Alibaba Cloud no lo respaldan. El nombre "Swift" se usa solo para indicar la procedencia.
- Decensura parcial, no total: sigue rechazando aproximadamente 4 de cada 5 peticiones que el original rechaza (80/100 en el conteo estricto). Con frecuencia responde esquivando el tema en lugar de negarse, lo que puede producir contenido desviado o engañoso.
- Degradación de calidad acumulada: al 0,082 de divergencia KL por abliteración hay que sumar 0,051 (IQ3_S), 0,098 (IQ3_XXS) o 0,135 (IQ2_S) por cuantización. Las variantes XXS y S no han sido evaluadas por el autor.
- Benchmark no verificado: todas las cifras están marcadas como `verified: false` y provienen de scripts del propio autor en la carpeta `evaluation/`. Las muestras de MMLU-Pro (300 preguntas) y GSM8K (250 preguntas) son reducidas.
- Contexto no especificado: no se documenta la ventana de contexto soportada, lo que impide planificar despliegues con requisitos de contexto largo sin pruebas propias.
- Idiomas no especificados: no hay lista de idiomas soportados ni evaluación multilingüe.
- Ausencia de datos sobre tool calling y uso agéntico: no se documenta soporte de function calling ni de flujos multi-paso con herramientas.
- Riesgo de alucinación: no cuantificado en la información disponible; como en cualquier modelo de lenguaje, existe, y el modo thinking no lo elimina.
- Licencia restrictiva potencial: `swift-open-license-1.0` está declarada como `license: other`. Es imprescindible revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial, ya que la información proporcionada no detalla sus términos.
- Uso responsable: al tratarse de un modelo parcialmente decensurado, su despliegue en producción orientado al usuario final requiere capas adicionales de filtrado y moderación, además de revisión legal según jurisdicción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF
- Carpeta de evaluación del autor: https://huggingface.co/jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF/tree/main/evaluation
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Publicaciones GSQ-RCO `-mtp` de UkisAI (referencia de cuantización): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
