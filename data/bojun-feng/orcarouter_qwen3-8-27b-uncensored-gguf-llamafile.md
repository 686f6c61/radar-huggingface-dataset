# Bojun-Feng/orcarouter_Qwen3.8-27B-Uncensored-GGUF-llamafile

## Resumen

Este repositorio no es un modelo nuevo, sino un paquete de distribución del modelo OrcaRouter Qwen3.8-27B-Uncensored en formato GGUF y como ejecutable llamafile. El autor del repositorio es Bojun-Feng y el modelo base es orcarouter/Qwen3.8-27B-Uncensored, sobre el que ya existía una cuantización previa de bartowski. El valor diferencial de este repo es que empaqueta los pesos cuantizados dentro de un binario llamafile (basado en llama.cpp y Cosmopolitan Libc), de modo que se puede descargar un único fichero, darle permisos de ejecución y lanzarlo en cualquier sistema Linux sin instalar dependencias.

El modelo subyacente tiene alrededor de 27 000 millones de parámetros según la nomenclatura del nombre, soporta los idiomas inglés y chino, e incorpora capas MTP (Multi-Token Prediction), una técnica de decodificación que predice varios tokens por paso para acelerar la generación. Las cuantizaciones incluidas son Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0, todas generadas con imatrix y con un corpus de calibración renderizado con la propia plantilla de chat del modelo, incluyendo conversaciones de razonamiento y de tool calling.

La relevancia práctica de esta ficha es doble: por un lado permite evaluar el modelo subyacente sin necesidad de infraestructura de servicio; por otro, el formato llamafile reduce el despliegue a una operación de descarga y ejecución, algo útil para entornos aislados, demos rápidas y pruebas de concepto. La licencia declarada es Apache 2.0 y el repositorio ocupa 107,5 GB en total.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas MTP (Multi-Token Prediction); detalles completos no disponibles |
| Parámetros totales | ~27 000 millones (según la nomenclatura del modelo; no se detalla explícitamente en la información disponible) |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF, calibradas con imatrix); el ejecutable llamafile publicado usa Q4_K_M |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y llamafile (ejecutable único con pesos embebidos) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base más allá de dos hechos concretos: incorpora capas MTP (Multi-Token Prediction), que se conservan dentro de las cuantizaciones, y su plantilla de chat sigue el esquema de Qwen con tokens especiales `<|im_start|>` y `<|im_end|>`, además de bloques `<think>...</think>` para el modo de razonamiento. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si se trata de atención completa o de alguna variante lineal o híbrida. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Sí hay información relevante sobre el proceso de cuantización, que es el trabajo propio de este repositorio. Las cuantizaciones se generaron con llama.cpp en su release b10630 usando la opción imatrix, con un corpus de calibración renderizado con la plantilla de chat del propio modelo para que los tokens especiales de formato contribuyan a la matriz de importancia. El corpus combina prosa, conversaciones de tool calling y conversaciones de razonamiento. Un detalle técnico destacable es que las capas MTP se almacenan en Q4_0 en todas las cuantizaciones imatrix salvo en Q8_0, porque la calibración imatrix no las ejercita y Q4_0 ofrece mayor velocidad, lo que favorece el rendimiento del decodificado multi-token. La validación realizada por el autor se limita a generación de texto en Linux, con el material disponible en el directorio `validation/` del repositorio.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat compatible con el formato Qwen (`<|im_start|>` / `<|im_end|>`).
- Modo de razonamiento explícito mediante bloques `<think>`, que puede desactivarse dejando el bloque vacío, tal como muestra el ejemplo de uso incluido en la model card.
- Tool calling / function calling: la cuantización se calibró con un corpus que incluye conversaciones de tool calling renderizadas con la plantilla del modelo, lo que indica soporte de este tipo de formato.
- Predicción multi-token (MTP): los tensores de estas capas se conservan en las cuantizaciones, lo que habilita decodificación con predicción de varios tokens por paso cuando el runtime lo soporta.
- Modelo "uncensored": el nombre indica un ajuste orientado a reducir rechazos y restricciones de contenido.
- Ejecución local sin dependencias mediante el binario llamafile, con backend CLI y soporte de GPU vía `-ngl` para descarga de capas en tarjeta gráfica.
- Capacidades de visión: la model card indica explícitamente que se trata de un GGUF de texto y que los ficheros de proyector del modelo original se mantienen separados, por lo que este paquete no incluye visión multimodal.

## Casos de uso

- Asistentes conversacionales bilingües inglés-chino: el modelo cubre ambos idiomas de forma nativa, lo que permite desplegar un único endpoint para soporte o atención en mercados que operan en esas dos lenguas, sin necesidad de encadenar modelos o traducciones intermedias.
- Prototipado rápido y demos offline: al distribuirse como un único ejecutable llamafile, se puede copiar el fichero a una máquina Linux, darle permisos de ejecución y tener inferencia funcionando en minutos, sin gestores de paquetes, contenedores ni descarga de dependencias.
- Despliegue en entornos aislados (air-gapped): el binario no requiere acceso a red ni repositorios externos, lo que encaja en instalaciones industriales, entornos sanitarios o laboratorios con políticas restrictivas de conectividad.
- Agentes con razonamiento multi-paso: el modo `<think>` permite separar la cadena de razonamiento de la respuesta final, algo útil para pipelines de agentes donde se quiere auditar o registrar el proceso intermedio antes de actuar.
- Integración en pipelines con tool calling: la calibración con conversaciones de funciones sugiere compatibilidad con esquemas de invocación de herramientas, lo que permite conectar el modelo a bases de datos, APIs internas o sistemas de ficheros mediante un orquestador tipo llama.cpp server.
- Generación de contenido creativo sin filtros editoriales: el ajuste "uncensored" resulta adecuado para escritura de ficción, guiones o narrativa que otros modelos rechazarían por sus políticas de contenido, siempre con revisión humana posterior.
- Extracción y estructuración de información por lotes: con llama.cpp en modo servidor se pueden procesar grandes volúmenes de documentos en inglés o chino para extraer campos estructurados, clasificar o resumir, ajustando el nivel de cuantización al presupuesto de memoria disponible.
- Investigación en seguridad y red-teaming: al ser un modelo deliberadamente sin censura y de pesos abiertos, sirve como sujeto de prueba para estudiar comportamientos dañinos, evaluar la eficacia de filtros externos y comparar con variantes alineadas del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio y la del GGUF original de bartowski no incluyen tablas con MMLU, HumanEval, GSM8K ni métricas equivalentes, ni comparaciones numéricas con otros modelos. La única validación declarada es funcional: generación de texto en Linux, con los detalles almacenados en el directorio `validation/` del repositorio.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros declarado y del tipo de cuantización, no datos publicados por el autor. Los tamanos reales de cada fichero no se detallan en la información disponible.

- Q3_K_M: aproximadamente 13-14 GB de VRAM estimados. Cabe en GPUs de 16 GB y en configuraciones con memoria unificada de 16 GB o más.
- Q4_K_M (la cuantización empaquetada como llamafile): aproximadamente 16-17 GB estimados. Cabe en RTX 4090, RTX 3090, RTX 4080 Super (16 GB, al límite) y en Mac con 24 GB o más de memoria unificada.
- Q5_K_M: aproximadamente 19-20 GB estimados. Requiere 24 GB de VRAM para mantener la mayoría de capas en GPU.
- Q6_K: aproximadamente 22-23 GB estimados. Ajustado en tarjetas de 24 GB; puede requerir descargar algunas capas a CPU.
- Q8_0: aproximadamente 29-30 GB estimados. Necesita GPUs de 40 GB o más (A100 40 GB, A6000, L40S) o memoria unificada de 32 GB o superior.
- GPU recomendadas: RTX 3090 / 4090 / 5090 para cuantizaciones Q3 y Q4; A100 40 GB, A100 80 GB, H100 y L40S para Q6_K y Q8_0 con contexto largo y mayor concurrencia.
- Opciones de despliegue: el ejecutable llamafile incluido (llamafile 0.10.5, con soporte de backend Vulkan documentado en esa versión), llama.cpp (los GGUF son compatibles con cualquier build reciente, se generaron con b10630), llama.cpp server, Ollama, LM Studio, koboldcpp y text-generation-webui. El soporte de GGUF cuantizado en vLLM es experimental y no está garantizado.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición. El uso de capas MTP y de tensores MTP en Q4_0 está pensado para mejorar la velocidad de decodificación cuando el runtime explota esa capacidad, pero no se aportan cifras.

## Comparativa con modelos similares

Comparativa de los artefactos disponibles del mismo modelo, ya que no se dispone de datos de rendimiento frente a otros modelos de la misma categoría:

| Artefacto | Formato | Autor | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Bojun-Feng/orcarouter_Qwen3.8-27B-Uncensored-GGUF-llamafile (este repo) | GGUF + llamafile | Bojun-Feng | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 | Apache 2.0 | Empaquetado como ejecutable único; llamafile 0.10.5; repo de 107,5 GB |
| bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF | GGUF | bartowski | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 | Apache 2.0 (heredada) | Cuantizaciones imatrix con llama.cpp b10630; incluye corpus de calibración e imatrix |
| orcarouter/Qwen3.8-27B-Uncensored | Pesos originales (formato no especificado en la información disponible) | orcarouter | No aplica | No disponible | Modelo base sobre el que se construyen las cuantizaciones |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de terceros (por ejemplo, otras familias de ~27B abiertas) en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que el rendimiento real en tareas de razonamiento, código o matemáticas no está verificado con datos objetivos.
- El ajuste "uncensored" implica que el modelo puede generar contenido inapropiado, ofensivo, ilegal o factualmente falso sin aplicar rechazos. Requiere filtros externos y supervisión humana en cualquier uso orientado al público.
- Riesgo de alucinación no cuantificado: al no haber evaluaciones publicadas, se desconoce la tasa de invención de hechos del modelo.
- La longitud de contexto no está documentada. El ejemplo de la model card usa `-c 512`, pero eso es únicamente el valor del ejemplo de CLI y no debe interpretarse como la ventana máxima del modelo.
- Los idiomas declarados son únicamente inglés y chino. No hay soporte declarado de castellano, por lo que el rendimiento en español es incierto y debe validarse antes de usarlo en producción.
- No se incluye soporte de visión en este paquete: los ficheros de proyector del modelo original se distribuyen por separado.
- La licencia declarada es Apache 2.0, pero se hereda de la cadena de modelos base; conviene verificar que el modelo original orcarouter/Qwen3.8-27B-Uncensored mantiene efectivamente esa licencia antes de un uso comercial.
- Uso comercial: Apache 2.0 permite uso comercial, pero la ausencia de una model card detallada del modelo original deja sin documentar posibles restricciones adicionales, procedencia de los datos de entrenamiento y cumplimiento normativo.
- El repositorio ocupa 107,5 GB, lo que implica un coste de almacenamiento y de ancho de banda considerable si se descarga completo en lugar de un solo fichero cuantizado.
- La validación declarada se limita a Linux. El comportamiento del ejecutable llamafile en otros sistemas no está verificado en la información disponible.
- El nombre "Qwen3.8-27B" no se corresponde con una nomenclatura estándar publicada y la información disponible no aclara la relación exacta con la familia Qwen; conviene tratarlo como un modelo derivado de terceros y no asumir equivalencias con modelos oficiales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Bojun-Feng/orcarouter_Qwen3.8-27B-Uncensored-GGUF-llamafile
- Fichero llamafile Q4_K_M: https://huggingface.co/Bojun-Feng/orcarouter_Qwen3.8-27B-Uncensored-GGUF-llamafile/resolve/main/orcarouter_Qwen3.8-27B-Uncensored-Q4_K_M.llamafile
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Cuantizaciones GGUF originales (bartowski): https://huggingface.co/bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF/tree/87d37daf5e5eb72a926d8b413e08809a57f1a120
- Corpus de calibración: https://huggingface.co/bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF/blob/main/orcarouter_Qwen3.8-27B-Uncensored-calibration-v6.txt
- Matriz de importancia (imatrix): https://huggingface.co/bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF/blob/main/orcarouter_Qwen3.8-27B-Uncensored-imatrix.gguf
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp b10630: https://github.com/ggml-org/llama.cpp/releases/tag/b10630
- Repositorio de llamafile (mozilla-ai): https://github.com/mozilla-ai/llamafile
- Commit de llamafile 0.10.5 usado: https://github.com/mozilla-ai/llamafile/commit/486e6c5f9356eae50b851b07517bfae1f2420193
- Servidor de Discord de soporte de jartine: https://discord.gg/FwAVVu7eJ4
- Fuente del corpus de calibración: https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a
