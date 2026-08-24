# Scriptease/colorhex-1b

## Resumen

colorhex-1b es un modelo de lenguaje de 1.000 millones de parámetros desarrollado por Scriptease, especializado en una única tarea: mapear nombres de color de productos a códigos hexadecimales RGB. Se trata de un fine-tune mediante LoRA (rango 16) sobre el modelo base `google/gemma-3-1b-it`, del que hereda su arquitectura Transformer y su naturaleza de generación de texto. El modelo fue destilado a partir de un servicio de producción de mapeo de colores, con aproximadamente 25.000 pares únicos de nombres de color y valores hex representativos.

El modelo opera exclusivamente con un formato de prompt estricto: un mensaje de sistema fijo, entradas numeradas en lotes de exactamente 10 elementos y una respuesta JSON estructurada con la misma forma en todos los casos. Está entrenado para reconocer nombres de color en alemán, español, griego, húngaro y turco, incluyendo compuestos y prefijos modificadores (como `hellblau`, `dunkelgrün` o `kirmizi`). El repositorio incluye tanto los pesos fusionados en formato safetensors como una exportación GGUF Q8_0 para su uso con llama.cpp.

La relevancia de este modelo reside en su enfoque de tarea única y altamente especializada, que permite integrar la conversión de nombres de color a RGB en flujos de producción reales sin necesidad de una infraestructura compleja. Aunque su rendimiento en evaluaciones held-out alcanza aproximadamente el 60% de coincidencia exacta de hex, el resto de respuestas suele caer en la familia de color correcta, lo que lo hace útil para normalización de catálogos, interfaces de usuario y herramientas de diseño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3-1B, fine-tune LoRA rank 16) |
| Parámetros totales | 999.885.952 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q8_0 (exportación incluida en el repositorio) |
| Idiomas soportados | alemán, español, griego, húngaro, turco |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (pesos fusionados) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo Gemma 3-1B instructivo de Google, que emplea una arquitectura Transformer decoder-only con atención de múltiples cabezas. El fine-tune se realizó mediante LoRA con rango 16 sobre las capas de atención y de feed-forward, y posteriormente se fusionaron los pesos en el repositorio. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset más allá de la mención de ~25.000 pares de nombres de color y valores hex representativos, destilados de un servicio de producción de mapeo de colores.

El entrenamiento siguió un formato de conversación estricto: un prompt de sistema fijo que instruye al modelo a mapear cada nombre de color a un valor hex, una lista numerada de entradas en lotes de 10, y una respuesta JSON con la estructura `{"results":[{"input":"...","value":"#rrggbb"}]}`. El modelo no fue entrenado con técnicas de RLHF o DPO; se trata de una destilación supervisada de datos de producción. La model card advierte que cualquier desviación de este formato (cambio de prompt, entradas sin lotear) degrada la precisión.

## Capacidades

- Generación de texto estructurado JSON para mapeo de nombres de color a códigos hex RGB.
- Soporte de compuestos y prefijos modificadores en alemán, español, griego, húngaro y turco (por ejemplo, `hellblau`, `dunkelgrün`, `kirmizi`).
- Manejo de entradas en lotes de exactamente 10, con salida alineada a cada entrada.
- Respuesta determinista bajo decodificación greedy (según la evaluación reportada).
- Capacidad limitada a la tarea de color; no es un modelo conversacional general, aunque hereda la arquitectura de Gemma.
- No se menciona soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- **Normalización de catálogos de productos en e-commerce**: el modelo puede convertir nombres de color de producto (p. ej. "azul marino", "hellblau") a códigos hex uniformes para unificar la presentación visual en tiendas online. Al procesar lotes de 10, se integra fácilmente en pipelines de batch de datos.
- **Generación de variables CSS para temas de diseño**: en aplicaciones web, se puede invocar el modelo para obtener valores hex de nombres de color definidos por diseñadores o usuarios, y así generar paletas de forma automatizada.
- **Validación de colores en herramientas de diseño gráfico**: plugins o scripts de Adobe Illustrator (como los mencionados en la búsqueda web) pueden usar el modelo para convertir nombres de color de idiomas europeos a valores RGB, evitando la necesidad de tablas manuales.
- **Automatización de etiquetas de color en gestión de inventario**: sistemas de logística que reciben descripciones de color de proveedores pueden mapearlas a valores hex para representaciones visuales en dashboards o etiquetas.
- **Aplicaciones de accesibilidad**: herramientas que convierten nombres de color en texto a representaciones numéricas para usuarios con daltonismo, permitiendo distinguir matices mediante códigos.
- **Integración en pipelines de datos de productos**: el modelo puede usarse como un paso de transformación en flujos de datos que requieren unificar la representación cromática antes de cargar en bases de datos o APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta una evaluación propia sobre nombres de color no vistos, con decodificación greedy y formato de lote de 10 certificado:

| Métrica | Resultado |
|---|---|
| Coincidencia exacta de hex | ~60% |
| Aceptación basada en familia de color (hue-based) | la mayoría de los restantes respuestas caen en la familia correcta |
| Coincidencia del export GGUF Q8_0 con los pesos fusionados | dentro del error de cuantización |

No se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene ~1.000 millones de parámetros. En formato safetensors (FP16) ocupa aproximadamente 2 GB; el archivo GGUF Q8_0 ocupa alrededor de 1.2 GB.
- Puede ejecutarse en GPU con al menos 4 GB de VRAM para el GGUF Q8_0, y 8 GB para los pesos en FP16.
- Es compatible con tarjetas consumer como NVIDIA RTX 3060 (12 GB) o superiores, y también con CPUs con al menos 8 GB de RAM para inferencia con llama.cpp.
- Se proporciona un archivo GGUF Q8_0 para su uso con llama.cpp, por lo que puede desplegarse en CPU o GPU con el ecosistema llama.cpp.
- Para inferencia en producción, se puede servir con text-generation-inference (TGI) o vLLM, aunque la model card no proporciona datos de latencia o throughput. Se recomienda un lote de 10 entradas para obtener el rendimiento óptimo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos que realicen exactamente la misma tarea de mapeo de nombres de color a hex. El modelo base `google/gemma-3-1b-it` puede generar texto general, pero no está especializado en esta tarea. Comparación con el modelo base:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| colorhex-1b | 1B | no disponible | Mapeo de color a hex (solo) | Gemma Terms |
| google/gemma-3-1b-it | 1B | no disponible | Generación general | Gemma Terms |

La diferencia clave es la especialización y el formato de salida estricto. Para la tarea de color, colorhex-1b ofrece precisión y determinismo, mientras que el modelo base requeriría un prompt más elaborado y no garantizaría el formato JSON exacto.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: el modelo puede generar valores hex incorrectos o inventados para nombres de color que no están bien representados en el dataset de entrenamiento. La evaluación indica que un 40% de los casos no coincide exactamente, aunque la mayoría se aproxima en la familia de color.
- **Restricción de formato**: el modelo solo funciona con el prompt de sistema y el formato de lote de 10 entradas exactamente como se describió. Cualquier desviación (otro prompt, entradas sin lotear) degrada la precisión, por lo que no es flexible para uso general.
- **Idiomas limitados**: solo soporta alemán, español, griego, húngaro y turco. No cubre otros idiomas, y los nombres en otros idiomas pueden fallar.
- **Licencia**: se distribuye bajo los Términos de Uso de Gemma (Gemma Terms of Use). Esto implica restricciones para uso comercial, como la prohibición de usar el modelo en aplicaciones de alto riesgo (sanidad, finanzas) y la obligación de mantener los avisos de uso.
- **Dependencia del modelo base**: al ser un fine-tune de Gemma, hereda las limitaciones y sesgos de Gemma 3-1B, aunque no se han documentado específicamente.
- **No apto para tareas generales**: el modelo no debe usarse para conversación general, generación de código u otras tareas, ya que su entrenamiento se centró únicamente en la tarea de color.

## Enlaces

- HuggingFace: [Scriptease/colorhex-1b](https://huggingface.co/Scriptease/colorhex-1b)
- Blog del autor: [A Color Speaks More Than a Thousand Words](https://scripteasesite.wordpress.com/2026/07/30/a-color-speaks-more-than-a-thousand-words/)
- Modelo base: [google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- Términos de uso de Gemma: [ai.google.dev/gemma/terms](https://ai.google.dev/gemma/terms)
