# NAMAA-Space/araseg-e15-xlmr-np-s1

## Resumen

`NAMAA-Space/araseg-e15-xlmr-np-s1` es un ajuste fino completo de `FacebookAI/xlm-roberta-large` publicado por NAMAA-Space (NAMAA Community) como parte de su sistema para la tarea NP (*subtask* NP) de la Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026). Se trata del miembro semilla 1 del par de encoders NP: un modelo de clasificación de tokens que asigna a cada palabra del texto árabe una probabilidad de constituir frontera de segmento.

Su relevancia es doble y muy acotada. Por un lado, documenta la estrategia de ensamblado empleada en la competición: cinco miembros combinados mediante un *stack* lineal ajustado sobre predicciones *out-of-fold* (OOF), con un umbral de sistema de 0,36 y una puntuación declarada de 92,84 macro-F1 en el *practice test* y 91,3 en el conjunto ciego. Por otro, es un ejemplo poco habitual de publicación de artefactos intermedios de un sistema de competición: el autor advierte explícitamente de que **no es un segmentador autónomo** y de que, usado en solitario, no reproduce ninguna puntuación publicada.

Técnicamente, el repositorio (2,2 GB) contiene un `state_dict` de PyTorch (`best_NP.pt`) y no un *checkpoint* en formato HuggingFace, por lo que `from_pretrained` no funciona: hay que reconstruir la arquitectura desde el YAML de configuración del experimento y cargar los pesos encima. El ajuste se realizó con 560 millones de tokens y licencia MIT heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificación de tokens para detección de fronteras a nivel de palabra; *full fine-tune* |
| Parámetros totales | Aproximadamente 559 M, heredados de `FacebookAI/xlm-roberta-large`. No se especifica en la model card |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base XLM-RoBERTa-large admite hasta 512 tokens |
| Tipos de cuantización | No disponible. Solo se publican pesos `best_NP.pt` (PyTorch `state_dict`); no hay versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Árabe (`ar`). El modelo base es multilingüe (100 idiomas), pero el ajuste está orientado exclusivamente a segmentación de árabe |
| Licencia | MIT, heredada del modelo base |
| Formato de pesos | PyTorch `state_dict` (`best_NP.pt`, fichero `best_*.pt` según la model card). No es un checkpoint en formato HuggingFace |
| Tarea (*pipeline*) | `token-classification` |
| Subtarea de la competición | NP |
| Rol en el sistema | Miembro votante de un *stack* lineal ajustado OOF sobre 5 miembros |
| Umbral del sistema | 0,36 |
| Volumen de entrenamiento | 560 M de tokens (*full fine-tune*) |
| Tamaño del repositorio | 2,2 GB |
| Descargas / *likes* | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-large, un encoder Transformer multilingüe preentrenado con objetivos enmascarados sobre corpus multilingües, y se ajusta por completo (*full fine-tune*, sin adaptadores de bajo rango en este miembro concreto) sobre 560 millones de tokens para una tarea de etiquetado de tokens: cada token recibe una etiqueta que permite derivar la probabilidad de frontera a nivel de palabra. El autor describe la salida como "probabilidades de frontera por palabra no calibradas", lo que implica que el modelo no incorpora ninguna capa de calibración ni umbral propio; el umbral vive en el sistema que lo consume.

La innovación relevante no está en la arquitectura, que es estándar, sino en el diseño del sistema: los cinco miembros se combinan mediante un *stack* lineal ajustado con predicciones *out-of-fold*, y el conjunto se publica con sus pesos y umbrales en la colección `NAMAA-Space/namaa-community-araseg-2026`. La model card indica además que los cinco miembros basados en LoRA requieren `transformers==5.12.1` para instanciar sus clases base, con un *stack* de dependencias fijado en `requirements-llm.txt` del repositorio de código. No se documentan en la información disponible ni la composición del dataset de entrenamiento, ni si hubo RLHF, DPO u otras fases de alineamiento (no aplicables, en principio, a una tarea discriminativa).

## Capacidades

- Detección de fronteras de segmentación en texto árabe: produce, por palabra, una probabilidad de constituir límite de segmento.
- Clasificación de tokens (`token-classification`) como tarea base, reutilizable para etiquetado a nivel de palabra.
- Participación en un *ensemble*: su salida está pensada para alimentar un *stack* lineal con pesos OOF y un umbral de decisión de 0,36.
- Procesamiento de texto árabe sin diacríticos en el marco de la shared task AraSeg 2026 (subtask NP).
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad multilingüe: la herencia de XLM-RoBERTa-large implica representaciones multilingües, pero el ajuste y la evaluación documentados se limitan al árabe.

## Casos de uso

- Reproducción de resultados de competición: cargar `best_NP.pt`, reconstruir la arquitectura desde el YAML del experimento e integrarlo en el *stack* lineal del sistema NP para replicar la puntuación de 92,84 / 91,3 macro-F1.
- Investigación en segmentación árabe: analizar el comportamiento de un encoder XLM-R-large ajustado sobre 560 M de tokens frente a aproximaciones morfológicas o basadas en reglas, midiendo errores de frontera por tipo de palabra.
- Preprocesado de corpus árabes para NLP: generar fronteras de palabra fiables antes de alimentar pipelines de análisis morfológico, etiquetado gramatical o análisis sintáctico.
- Indexación y búsqueda en árabe: normalizar la segmentación de documentos y consultas para aumentar la coincidencia efectiva en motores de búsqueda sobre corpus árabes.
- Extracción de información y NER descendente: la segmentación previa reduce la dispersión de entidades multi-palabra en modelos posteriores de reconocimiento de entidades.
- Evaluación comparativa de sistemas de segmentación: usar el miembro como *baseline* individual dentro de experimentos controlados de *stacking*, aprovechando que el autor publica una advertencia explícita sobre su naturaleza no autónoma.
- Docencia y experimentación con arquitecturas de ensamblado: el repositorio de código (`NAMAA-ORG/NAMAA-Community-AraSeg-2026`) sirve como ejemplo reproducible de combinación OOF de cinco miembros con umbral calibrado.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al **sistema completo**, no a este miembro. La model card advierte de que este modelo usado en solitario no reproduce ninguna puntuación publicada.

| Sistema / métrica | Practice test | Blind test |
|---|---|---|
| macro-F1 del sistema NP (ensemble de 5 miembros + stack lineal OOF) | 92,84 | 91,3 |

No se han publicado resultados de benchmarks a nivel de miembro (MMLU, HumanEval, GSM8K u otros no son aplicables a esta tarea), ni comparaciones por subtarea, ni análisis de ablación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia aproximada, un encoder de 559 M de parámetros ocupa en torno a 2,2 GB en fp32 (coherente con los 2,2 GB del repositorio) y alrededor de 1,1 GB en fp16, a lo que hay que sumar activaciones y *overhead* del *runtime*.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente en la práctica. No se requiere A100 ni H100; tarjetas como RTX 3060, RTX 4060, RTX 4090 o T4 son adecuadas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 6 GB de VRAM, y probablemente también en GPUs integradas con memoria unificada suficiente.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo y los pesos no están en formato HuggingFace. El despliegue requiere PyTorch más el código de `NAMAA-ORG/NAMAA-Community-AraSeg-2026` (ficheros `ensemble.py` y `verify_offcluster.py` mencionados en la model card) y el *stack* de dependencias fijado en `requirements-llm.txt`. La conversión a ONNX o TorchScript sería posible, pero no está documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de palabras procesadas por segundo.
- Nota de compatibilidad: `from_pretrained` no funciona con este repositorio. Los cinco miembros basados en LoRA del sistema requieren `transformers==5.12.1`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e15-xlmr-np-s1` | Encoder de clasificación de tokens, miembro de ensemble | Aproximadamente 559 M (heredados del base) | No especificado (base: 512 tokens) | MIT | HuggingFace, como `state_dict` de PyTorch | No aplicable individualmente; el sistema alcanza 92,84 / 91,3 macro-F1 |
| `FacebookAI/xlm-roberta-large` (modelo base) | Encoder multilingüe preentrenado | Aproximadamente 559 M | 512 tokens | MIT | HuggingFace, formato estándar | No es un segmentador; requiere ajuste |
| Otros miembros del ensemble AraSeg 2026 de NAMAA | Encoders y adaptadores LoRA | No disponible | No disponible | No disponible | Colección `NAMAA-Space/namaa-community-araseg-2026` | No disponible por miembro |
| Otros sistemas participantes en AraSeg 2026 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de comparaciones publicadas frente a herramientas clásicas de segmentación morfológica árabe (tipo FARASA, MADAMIRA o CAMeL Tools) ni frente a otros sistemas de la shared task en la información proporcionada.

## Limitaciones y advertencias

- No es un segmentador autónomo. Es un votante dentro de un ensemble; sus salidas son probabilidades de frontera no calibradas y, por sí solas, no reproducen ninguna puntuación publicada.
- Requiere el *stack* lineal con pesos OOF y el umbral 0,36 del sistema NP para producir decisiones.
- `from_pretrained` no funciona: los pesos son un `state_dict` desnudo y la arquitectura debe reconstruirse desde el YAML de configuración del experimento.
- La reproducibilidad depende del repositorio de código y de un *stack* de dependencias fijado; los miembros LoRA exigen `transformers==5.12.1`, lo que puede entrar en conflicto con otros entornos.
- Cobertura lingüística limitada al árabe en el ajuste. El comportamiento fuera del dominio de la shared task (dialectos, texto sin normalizar, ruido OCR) no está documentado.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en sentido generativo, pero no se documentan las tasas de error por tipo de texto ni el comportamiento en dominios distintos al de entrenamiento.
- Licencia MIT heredada del modelo base. No se declaran restricciones adicionales ni condiciones específicas para uso comercial, pero la licencia del modelo base debe verificarse de forma independiente.
- Advertencia de producción: con 0 descargas y 0 *likes*, el modelo carece de validación externa. Para uso industrial se recomienda evaluar el sistema completo, no este miembro.
- Los conjuntos de datos de entrenamiento y su composición no están documentados, lo que dificulta auditar posibles sesgos o contaminación con los conjuntos de evaluación de la shared task.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e15-xlmr-np-s1
- Colección del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de código, configuraciones y mapa miembro→subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", *Proceedings of ArabicNLP 2026*
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron exclusivamente páginas no relacionadas (foros de impresión 3D, enciclopedias y directorios de buscadores), por lo que no se incluye ningún enlace adicional.
