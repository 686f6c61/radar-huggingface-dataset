# mradermacher/lfm3-vl-2b-heretic-GGUF

## Resumen

`mradermacher/lfm3-vl-2b-heretic-GGUF` es una conversión a formato GGUF del modelo `Lucasgitguy-co/lfm3-vl-2b-heretic`, un derivado "abliterated" (también etiquetado como "heretic" o "uncensored") del modelo multimodal `LiquidAI/LFM3-VL-2B` de Liquid AI. El repositorio lo publica mradermacher, un autor habitual en la comunidad de cuantizaciones GGUF, y su función es empaquetar los pesos en distintos niveles de cuantización para su uso con llama.cpp y herramientas compatibles.

Se trata de un modelo de tipo image-text-to-text (visión-lenguaje) de aproximadamente 189 millones de parámetros según los safetensors reportados, lo que lo sitúa en la gama muy ligera y apta para ejecución en hardware de consumo. La modificación "heretic" implica que se ha aplicado una técnica de eliminación o atenuación del comportamiento de rechazo (abliteration), orientada a reducir las negativas del modelo ante determinadas peticiones.

La relevancia de esta ficha es acotada: el repositorio no incluye model card descriptiva, benchmarks ni documentación técnica propia, y tanto la licencia como los idiomas no están declarados en la información disponible. Su interés principal es práctico, como opción de despliegue local de un modelo de visión-lenguaje pequeño y sin las restricciones de alineación habituales, con las salvedades legales y de calidad que ello conlleva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal visión-lenguaje LFM3-VL-2B; detalles de arquitectura no declarados en la información proporcionada) |
| Parámetros totales | 189.380.352 (según safetensors del modelo) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio; el modelo upstream referencia `lfm1.0` |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con llama.cpp; conversión de tipo hf) |

## Arquitectura y entrenamiento

El repositorio es una conversión de cuantización estática, no un entrenamiento. Según la información del autor, los pesos proceden de `Lucasgitguy-co/lfm3-vl-2b-heretic`, que a su vez deriva de `LiquidAI/LFM3-VL-2B`. La model card indica explícitamente que no se realizó entrenamiento adicional ni evaluación de benchmarks durante la conversión. Los metadatos de la conversión señalan `convert_type: hf`, `output_tensor_quantised: 1` y `quantize_version: 2`, coherentes con el pipeline de cuantización de llama.cpp.

La arquitectura subyacente corresponde a LFM3-VL-2B, un modelo de la familia LFM3 de Liquid AI con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del modelo base. La variante "heretic" implica una modificación posterior orientada a la abliteración, es decir, a reducir la tendencia del modelo a rechazar peticiones; tampoco se documentan aquí los detalles del procedimiento aplicado.

## Capacidades

- Procesamiento multimodal imagen-texto: el pipeline declarado en repositorios relacionados es image-text-to-text, por lo que acepta imágenes junto con instrucciones textuales.
- Generación de texto conversacional: el modelo base está orientado a diálogo y generación de lenguaje natural.
- Comprensión de imágenes: descripción, respuesta a preguntas sobre imágenes y tareas de visión-lenguaje básicas, condicionadas al tamaño reducido del modelo.
- Comportamiento "uncensored"/abliterated: la variante heretic reduce los rechazos ante peticiones que el modelo original podría declinar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Despliegue local de visión-lenguaje en hardware modesto: con unos 189 millones de parámetros y cuantizaciones desde Q2_K hasta Q8_0, el modelo puede ejecutarse en CPU o en GPUs de consumo mediante llama.cpp, lo que permite prototipar tareas de imagen-texto sin infraestructura dedicada.
- Descripción automática de imágenes en lotes: integrable en scripts que procesen catálogos de imágenes y generen pies de foto o metadatos, aprovechando el formato GGUF para ejecución por CPU en servidores sin GPU.
- Asistencia conversacional sobre capturas o documentos escaneados: al aceptar entrada de imagen y texto, puede emplearse para responder preguntas sencillas sobre el contenido visual en aplicaciones de escritorio o móviles con recursos limitados.
- Investigación sobre alineación y abliteración: la variante heretic permite estudiar empíricamente cómo cambia el comportamiento de rechazo de un modelo multimodal pequeño tras la abliteración, comparándolo con el modelo base.
- Pruebas de concepto en entornos embebidos o edge: el tamaño del repositorio (0,6 GB) y la disponibilidad de cuantizaciones Q2/Q3 lo hacen candidato para demos en dispositivos con poca memoria.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes de cuantización del mismo modelo, útil para medir la degradación de calidad y el rendimiento según el nivel de compresión en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de conversión indica explícitamente que no se realizó evaluación de benchmarks durante la conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~189 M de parámetros, las cuantizaciones Q4 rondan los 0,1-0,2 GB de pesos y Q8_0 alrededor de 0,2 GB, a lo que hay que sumar el proyector multimodal y el contexto KV.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con 2 GB o más de VRAM debería ser suficiente para las cuantizaciones mayores.
- GPU de consumo: sí, cabe holgadamente en tarjetas de consumo actuales e incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, servidores compatibles con GGUF). No se documenta soporte específico para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/lfm3-vl-2b-heretic-GGUF | 189.380.352 | no disponible | no disponible (upstream `lfm1.0`) | GGUF | Variante abliterated de LFM3-VL-2B |
| Lucasgitguy-co/lfm3-vl-2b-heretic | no disponible | no disponible | no disponible | safetensors (presumible) | Modelo origen de la conversión |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | `lfm1.0` | no disponible | Modelo base oficial de Liquid AI |
| HydroLabs/LFM3-VL-2B-Heretic-GGUF | no disponible | no disponible | `lfm1.0` | GGUF | Conversión GGUF alternativa del mismo linaje heretic |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de model card: el repositorio no documenta arquitectura, datos de entrenamiento, idiomas ni limitaciones; la evaluación técnica queda supeditada a la documentación del modelo upstream.
- Licencia no declarada en este repositorio: aunque el modelo upstream referencia `lfm1.0`, debe verificarse en `LiquidAI/LFM3-VL-2B` antes de cualquier uso comercial; la información disponible no permite confirmar los términos aplicables a esta conversión.
- Modelo abliterated: la eliminación del comportamiento de rechazo puede incrementar la probabilidad de generar contenido inapropiado, sesgado o dañino, y reduce las salvaguardas del modelo original.
- Riesgo de alucinación: por su tamaño reducido (~189 M de parámetros), es esperable una fiabilidad limitada en tareas de razonamiento, matemáticas y descripción detallada de imágenes; no se han publicado evaluaciones que lo cuantifiquen.
- Contexto e idiomas desconocidos: no se puede garantizar un rendimiento adecuado en castellano ni en contextos largos sin datos oficiales.
- Sin benchmarks: no existe evidencia publicada de calidad frente al modelo base ni frente a otras cuantizaciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso.
- Las cuantizaciones Q2_K y Q3 pueden degradar notablemente la calidad en tareas multimodales; se recomienda Q4_K_M o superior para uso práctico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/lfm3-vl-2b-heretic-GGUF
- Modelo origen de la conversión: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic
- Conversión GGUF alternativa del mismo linaje: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-gguf
- Otra conversión GGUF heretic: https://huggingface.co/HydroLabs/LFM3-VL-2B-Heretic-GGUF
- Modelo base oficial: https://huggingface.co/LiquidAI/LFM3-VL-2B
