# Rin247/gemma-4-26B-A4B-it-Aggressive-Aquarion-INT8

## Resumen

`gemma-4-26B-A4B-it-Aggressive-Aquarion-INT8` es una cuantización INT8 de un modelo base `gemma-4-26B-A4B-it-Aggressive`, que a su vez es una variante "abliterada" de un modelo de la familia Gemma 4 de Google DeepMind. El autor, Rin247, ha aplicado una técnica de proyección ortogonal para eliminar los vectores de seguridad que provocan rechazos en solicitudes legítimas, con el objetivo de restaurar la utilidad en casos como investigación de seguridad, ajuste de hardware y escritura creativa sin restricciones.

El modelo base es un Mixture-of-Experts (MoE) con 25.805.936.206 parámetros totales y aproximadamente 4.000 millones de parámetros activos (según el identificador A4B). Según la documentación oficial de Gemma 4, la familia soporta contextos de hasta 256K tokens y más de 140 idiomas. Los tags de HuggingFace indican que el pipeline es `image-text-to-text`, por lo que el modelo posee capacidades multimodales. Esta versión cuantizada reduce el peso de 27.1 GB en repositorio, manteniendo los pesos en formato INT8 weight-only con escalas almacenadas en buffers separados.

La relevancia del modelo radica en combinar un gran contexto, arquitectura MoE eficiente en cómputo y una capa de desalineación ("abliteration") que lo hace especialmente interesante para entornos de investigación y desarrollo donde los filtros corporativos interfieren con tareas técnicas o creativas legítimas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Mixture-of-Experts (MoE), multimodal (image-text-to-text) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ~4.000.000.000 (A4B) |
| Longitud de contexto | Hasta 256K tokens (segun documentacion oficial de Gemma 4; no verificado en esta cuantizacion) |
| Tipos de cuantizacion | INT8 weight-only (RTN sobre CPU) |
| Idiomas soportados | No disponible en el repo; la familia Gemma 4 soporta mas de 140 idiomas |
| Licencia | No disponible en el repo |
| Formato de pesos | Safetensors INT8 weight-only con buffers de escala y forma separados (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base corresponde a un Transformer con estructura Mixture-of-Experts: 26B parámetros en total, de los cuales solo ~4B se activan por token. Este diseño reduce significativamente el coste computacional por token en comparación con un modelo denso del mismo tamaño. El modelo es multimodal, ya que el pipeline declarado en HuggingFace es `image-text-to-text`, lo que implica capacidad para procesar tanto imágenes como texto.

El entrenamiento del modelo base no está detallado en la información proporcionada. La modificación principal que da origen a esta variante es el proceso de "abliteration", aplicado mediante proyección ortogonal. Este procedimiento busca eliminar los vectores de seguridad y los filtros de alineación corporativa, preservando las capacidades de razonamiento, coherencia y seguimiento de instrucciones. La cuantización se realizó con PyTorch RTN (Round-to-Nearest) sobre CPU, almacenando escalas y formas en buffers separados para permitir la de-cuantización posterior con un motor de inferencia compatible.

## Capacidades

- Generación de texto y conversación en contextos largos, aprovechando la ventana de hasta 256K tokens documentada para la familia Gemma 4.
- Razonamiento y generación de código, según las características declaradas para Gemma 4 en la documentación oficial.
- Procesamiento multimodal de imagen y texto, según el tag `image-text-to-text` del repositorio.
- Soporte multilingüe, con más de 140 idiomas declarados para la familia Gemma 4.
- Comportamiento "sin censura": al haber sido abliterado, no rechaza solicitudes que los modelos con RLHF estándar suelen bloquear, como análisis técnico de hardware, investigación de seguridad o escritura con contenido maduro.
- No se especifica en la información disponible el soporte de tool calling, function calling ni modos de razonamiento explícitos (thinking mode).

## Casos de uso

- Investigación de seguridad académica: el modelo puede analizar arquitecturas de firmware y vulnerabilidades de sistemas sin las interrupciones habituales de los filtros de seguridad, permitiendo documentar hallazgos técnicos con detalle.
- Administración de redes locales y derecho a reparación: puede generar scripts de automatización para configuración de routers, servidores o dispositivos embebidos, aprovechando la ventana de contexto para mantener coherencia en tareas largas.
- Ajuste de unidades de control electrónico (ECU) en vehículos de competición o uso off-road: el modelo es capaz de procesar documentación técnica y generar instrucciones de modificación, una tarea frecuentemente bloqueada por modelos estándar.
- Escritura creativa madura: autores de ficción con tramas oscuras o violentas pueden usarlo sin que el modelo interrumpa con advertencias morales, manteniendo un tono consistente en escenas extensas.
- Análisis de imágenes técnicas: gracias a su multimodalidad, puede describir diagramas, capturas de pantalla de software o esquemas de circuitos, facilitando la documentación en proyectos de ingeniería.
- Asistente de desarrollo con contexto largo: puede trabajar sobre repositorios de código extensos, recordando decisiones de diseño en archivos distantes y generando código coherente con la arquitectura existente.
- Traducción técnica multilingüe: con soporte declarado para más de 140 idiomas, resulta útil para traducir manuales de usuario, documentación de APIs o hilos de foros técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras métricas comparativas. Tampoco se han encontrado evaluaciones independientes en la búsqueda web. Por tanto, no es posible validar el rendimiento del modelo frente a alternativas de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 28 GB para cargar los pesos INT8 (basado en el tamaño del repositorio de 27.1 GB). Se recomienda un margen adicional de 8-12 GB para la caché KV y las activaciones, lo que eleva la recomendación a 40 GB o más.
- GPU recomendadas: A100 40GB, A100 80GB, H100 80GB, o configuraciones con múltiples RTX 4090 (24GB) mediante tensor parallelism u offloading a CPU.
- En GPUs de consumo con 16 GB de VRAM no es posible cargar el modelo completo; se requiere fragmentación en CPU o cuantizaciones adicionales no previstas en este repo.
- Opciones de despliegue: vLLM y TGI podrían admitir el modelo, pero requieren de-cuantización previa según el esquema de escalas y formas descrito en la model card. llama.cpp no es compatible directamente con este formato safetensors INT8 weight-only; sería necesaria una conversión personalizada a GGUF. Ollama no lo soporta de forma nativa.
- Latencia y throughput: no disponibles. Al ser MoE con ~4B parámetros activos, el coste por token debería ser comparable al de un modelo de 4B denso, pero no se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-Aggressive-Aquarion-INT8 (este repo) | 25.8B | ~4B | hasta 256K (familia) | Sí (tag image-text-to-text) | No disponible | HuggingFace (cuantizado, abliterado) |
| Gemma 4 26B A4B (base, sin cuantizar) | 26B | ~4B | hasta 256K | No especificado en la info | No disponible | Google DeepMind (referencia oficial) |
| Gemma 4 12B (denso) | 12B | 12B | hasta 256K | No especificado en la info | No disponible | Google DeepMind (referencia oficial) |
| Gemma 4 31B (denso) | 31B | 31B | hasta 256K | No especificado en la info | No disponible | Google DeepMind (referencia oficial) |

No se dispone de datos de benchmarks comparativos, por lo que la comparación se limita a características estructurales. El modelo cuantizado se distingue por su licencia no definida y por la capa de abliteración aplicada.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio. Esto representa un riesgo legal importante para uso comercial o despliegues productivos, ya que no se conocen las restricciones de redistribución ni de uso.
- El proceso de abliteración puede aumentar la probabilidad de generar contenido dañino o ilegal, especialmente en combinación con la ausencia de filtros de seguridad. No se recomienda su uso en sistemas expuestos a usuarios no supervisados.
- El formato INT8 weight-only es personalizado y requiere de-cuantización manual mediante los buffers `*.weight_scale` y `*.weight_shape`. No es un checkpoint estándar compatible con todas las herramientas de inferencia.
- No se han publicado benchmarks, por lo que no se puede garantizar que el modelo mantenga el rendimiento del modelo base original tras la abliteración y la cuantización.
- El contexto de 256K tokens proviene de la documentación oficial de la familia Gemma 4, pero no se ha verificado específicamente en esta variante cuantizada. La cuantización podría introducir degradaciones en contextos extremadamente largos.
- La capacidad multimodal se infiere del tag de HuggingFace, pero la model card no incluye instrucciones de uso ni ejemplos de prompts con imágenes, lo que dificulta su explotación práctica.
- Los idiomas soportados no están listados en el repo. El dato de más de 140 idiomas es de la familia Gemma 4 y podría no aplicarse a todas las variantes.

## Enlaces

- HuggingFace: https://huggingface.co/Rin247/gemma-4-26B-A4B-it-Aggressive-Aquarion-INT8
- Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
