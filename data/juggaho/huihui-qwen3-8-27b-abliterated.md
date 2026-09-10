# JuggaHO/Huihui-Qwen3.8-27B-abliterated

## Resumen

Huihui-Qwen3.8-27B-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.8-27B, publicada en HuggingFace bajo el identificador JuggaHO/Huihui-Qwen3.8-27B-abliterated. El contenido de la model card corresponde al trabajo de huihui-ai (la ruta original citada en el README es huihui-ai/Huihui-Qwen3.8-27B-abliterated), por lo que se trata de una reproducción o reempaquetado de ese artefacto. El modelo conserva la naturaleza multimodal del original: la etiqueta de pipeline es image-text-to-text y la model card indica que el codificador visual y las cabezas MTP (multi-token prediction) no se han modificado.

El modelo cuenta con 27.781.427.952 parámetros (unos 27,78 mil millones), un repositorio de 55,6 GB en safetensors y precisión aparente de bfloat16 (2 bytes por parámetro). La modificación consiste en la ablación de las direcciones de rechazo en las capas 18 a 51, dejando intactas las 15 primeras capas, lo que según el autor permite conservar mejor el rendimiento del modelo original. La licencia declarada es Apache 2.0.

Su relevancia es acotada y muy específica: no es un modelo nuevo ni una mejora de capacidades, sino un experimento de eliminación de rechazos mediante una implementación "cruda" y de prueba de concepto basada en la técnica remove-refusals-with-transformers. Está orientado a investigadores que necesitan modelos sin filtrado para estudios de seguridad, red teaming o generación de contenido que el modelo base declinaría. El repositorio no publica idiomas soportados, longitud de contexto, resultados de benchmarks ni métricas de rendimiento, y en el momento del análisis acumula 0 descargas y 0 "likes".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta del repositorio: qwen3_5); incluye codificador visual y cabezas MTP. Detalles de atención y número total de capas no disponibles |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No publicados en el repositorio. Existe una versión para Ollama en huihui_ai/Qwen3.8-abliterated, cuyo tipo de cuantización no se detalla en la información disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers); repositorio de 55,6 GB |
| Precision de pesos | bfloat16 (inferido del tamaño del repositorio: ~2 bytes por parámetro) |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | image-text-to-text |
| Capas modificadas | Capas 18 a 51 (34 capas); las 15 primeras sin ablacionar |
| Revision anterior | d42ca89 (versión con las 15 primeras capas también abliteradas) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de lo que indican las etiquetas del repositorio (qwen3_5) y el pipeline declarado (image-text-to-text). La model card confirma la presencia de tres componentes diferenciados: la torre del transformer de lenguaje, un módulo visual y cabezas MTP; los dos últimos no han sido modificados respecto al modelo base. Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo fases de RLHF o DPO: este artefacto no se entrena, se deriva del modelo base mediante edición de pesos.

La innovación técnica es la técnica de abliteración: en lugar de usar TransformerLens, se emplea la implementación de prueba de concepto remove-refusals-with-transformers (Sumandora), que identifica y proyecta fuera las direcciones latentes asociadas a la generación de rechazos. En esta revisión concreta, la ablación se aplica a las capas 18 a 51; las capas 0 a 14 se mantienen intactas con el objetivo declarado de preservar en mayor medida el rendimiento del modelo original. La versión previa (revisión d42ca89) abliteraba también las 15 primeras capas y puede descargarse de forma explícita con `hf download huihui-ai/Huihui-Qwen3.8-27B-abliterated --local-dir ./huihui-ai/Huihui-Qwen3.8-27B-abliterated --revision d42ca89`.

## Capacidades

- Generación de texto conversacional mediante transformers (`AutoModelForCausalLM` y `AutoTokenizer`), con soporte de streaming a través de `TextStreamer`.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text), ya que el módulo visual se conserva sin modificar.
- Comportamiento "uncensored": reduce de forma deliberada la probabilidad de respuestas de rechazo del modelo base, que es precisamente el objetivo del artefacto.
- Generación con modo "thinking": el código de ejemplo incluido en la model card detecta el token `</think>` durante el streaming, lo que indica que el formato de razonamiento explícito del modelo base se mantiene.
- Predicción multi-token (MTP): el módulo MTP del modelo base no ha sido alterado, por lo que se conserva si el runtime lo explota.
- Capacidades de código, matemáticas y razonamiento general: no verificadas de forma independiente; deben asumirse como las heredadas del modelo base menos la degradación introducida por la ablación, sin datos publicados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación en seguridad y alineación: comparar las respuestas del modelo base y de esta versión abliterada ante el mismo conjunto de prompts permite medir cuánto y cómo se degrada la alineación al proyectar fuera las direcciones de rechazo, y qué capacidades se conservan tras limitar la ablación a las capas 18-51.
- Red teaming de sistemas de moderación: generar contenido que el modelo base rechazaría para probar la robustez de clasificadores de toxicidad, filtros de entrada/salida y pipelines de moderación en producción.
- Generación de ficción y guiones con temáticas sensibles: narrativa con violencia, conflicto o contenido adulto donde los rechazos del modelo base rompen la continuidad del texto; el modelo está pensado para no interrumpir ese tipo de generación.
- Análisis de documentos e imágenes en local: al ser un modelo image-text-to-text de ~27,8 B, puede desplegarse en infraestructura propia para extraer información de capturas, diagramas o PDFs escaneados sin enviar datos a APIs de terceros.
- Evaluación comparativa de técnicas de abliteración: usar la revisión d42ca89 (abliteración completa) frente a la revisión actual (capas 18-51) para cuantificar empíricamente si preservar las primeras 15 capas mantiene mejor el rendimiento, replicando la afirmación del autor.
- Asistente conversacional autoalojado con contexto largo: no hay dato de ventana de contexto, por lo que su uso en conversaciones multi-turno extensas requiere validar primero el límite real del modelo base y el coste de la caché KV.
- Ejecución local ligera vía Ollama: la model card remite a `ollama run huihui_ai/Qwen3.8-abliterated`, lo que facilita pruebas rápidas en estaciones de trabajo sin montar un stack de transformers completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye un script de ejemplo que mide latencia del primer token y tokens por segundo en tiempo de ejecución, pero no aporta valores numéricos. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo (los resultados obtenidos corresponden a herramientas de traducción y redacción sin relación alguna).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 55,6 GB solo para los pesos, más la caché KV del contexto y las activaciones. Necesita GPU de 80 GB o reparto multi-GPU.
- VRAM estimada en cuantización de 8 bits: aproximadamente 28 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 14-16 GB de pesos, más caché KV.
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo 2 x 48 GB) con `device_map="auto"`.
- GPU de consumo: en bfloat16 no cabe en ninguna GPU de consumo actual. En 4 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB podrían alojar los pesos, siempre que la ventana de contexto se mantenga moderada; no se dispone de confirmación de que existan cuantizaciones publicadas para este artefacto concreto.
- Opciones de despliegue confirmadas: transformers (`AutoModelForCausalLM`, `trust_remote_code=True`, `low_cpu_mem_usage=True`) y Ollama mediante `huihui_ai/Qwen3.8-abliterated`. Compatibilidad con vLLM, llama.cpp o TGI: no confirmada en la información disponible.
- Latencia y throughput: no disponibles. La model card incluye utilidades para medirlos (latencia del primer token y tokens por segundo), pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Datos de rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| JuggaHO/Huihui-Qwen3.8-27B-abliterated | 27,78 B | No disponible | Imagen-texto | apache-2.0 | No publicados | HuggingFace (0 descargas), Ollama |
| Qwen/Qwen3.8-27B (modelo base) | No disponible | No disponible | Imagen-texto | No disponible en esta busqueda | No publicados en esta busqueda | HuggingFace |
| Otras variantes abliterated del mismo autor (huihui-ai) | No disponible | No disponible | No disponible | No disponible | No publicados | Repositorio propio y Ollama |

No se dispone de datos suficientes para comparar rendimiento, contexto o calidad frente a alternativas de la misma categoría. Cualquier comparación numérica sería inventada.

## Limitaciones y advertencias

- La abliteración es una edición de pesos sin reentrenamiento posterior: no hay fase de recuperación de capacidades, por lo que es esperable degradación en tareas de razonamiento, código o matemáticas. No se publican evaluaciones que cuantifiquen esa pérdida.
- La model card describe el método como "una implementación cruda, de prueba de concepto"; no debe tratarse como un modelo listo para producción sin validación propia.
- Ausencia total de resultados de benchmarks publicados y de métricas de la comunidad (0 descargas, 0 likes): no existe validación independiente de calidad, estabilidad ni seguridad.
- Riesgo de alucinación: no evaluado. Se hereda el del modelo base sin datos que lo cuantifiquen.
- Sesgos: no documentados. Al eliminar los rechazos, el modelo puede reproducir con mayor facilidad contenido sesgado, ofensivo o dañino que el modelo base habría declinado.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide planificar despliegues multilingües o con contexto largo.
- Licencia Apache 2.0 declarada en el repositorio, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.8-27B, ya que la obra derivada hereda las condiciones del original.
- Discrepancia de atribución: el repositorio está publicado por el usuario JuggaHO, mientras que la model card y el pipeline de ejemplo corresponden a huihui-ai. Conviene contrastar el hash de los pesos antes de usarlo como sustituto del artefacto original.
- El código de ejemplo de la model card está truncado en el README (se corta a mitad de la función `get_metrics`), por lo que no puede copiarse y ejecutarse tal cual.
- Uso responsable: un modelo sin rechazos puede generar contenido ilegal o dañino. Su empleo en productos de cara al público exige capas de moderación externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JuggaHO/Huihui-Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original citado en la model card: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Técnica de abliteración (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Versión para Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Repositorio de Ollama: https://github.com/ollama/ollama/releases
- Descarga de la revisión anterior: `hf download huihui-ai/Huihui-Qwen3.8-27B-abliterated --local-dir ./huihui-ai/Huihui-Qwen3.8-27B-abliterated --revision d42ca89`
- Paper o blog técnico del modelo: no disponible
- Demo: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
