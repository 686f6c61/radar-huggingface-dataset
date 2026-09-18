# deepgrove/maple-preview-2bit-mlx

## Resumen

deepgrove/maple-preview-2bit-mlx es un modelo de lenguaje de 1.897.309.196 parámetros (aproximadamente 1,90 mil millones) publicado por el usuario deepgrove en HuggingFace bajo licencia MIT. Se distribuye en formato MLX, la librería de inferencia de Apple para chips de la serie M, y lleva aplicada una cuantización de 2 bits, según indican el propio nombre del repositorio y sus etiquetas. El repositorio ocupa 5,3 GB, acumula 529 descargas y 32 valoraciones positivas, y fue creado el 4 de agosto de 2026 con última actualización el 17 de septiembre de 2026. El sufijo "preview" sugiere una versión preliminar, no una release estable.

La información publicada es mínima. La model card se limita a dos líneas: la licencia MIT y la indicación de seguir las instrucciones del repositorio github.com/deepgrove-ai/mlx-lm-deepgrove. No se declaran arquitectura, longitud de contexto, idiomas, composición del dataset de entrenamiento ni resultados de evaluación.

Su interés práctico radica en la combinación de tamaño reducido y cuantización extrema: un modelo de ~1,9 mil millones de parámetros en 2 bits ocupa del orden de 0,5 GB de pesos, lo que lo sitúa en el rango de la inferencia completamente local en equipos con memoria unificada de 8 GB o 16 GB. No obstante, la ausencia de documentación técnica y de benchmarks impide validar su calidad frente a alternativas comparables, por lo que cualquier adopción en producción debería ir precedida de una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.897.309.196 (~1,90 mil millones) |
| Parámetros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits (etiqueta "2-bit" del repositorio), en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (etiquetas "safetensors" y "mlx") |
| Tamaño del repositorio | 5,3 GB |
| Descargas | 529 |
| Valoraciones positivas | 32 |
| Fecha de creación | 4 de agosto de 2026 |
| Última actualización | 17 de septiembre de 2026 |
| Pipeline declarado | no disponible |

Nota técnica: 1.897.309.196 parámetros a 2 bits equivalen a unos 0,47 GB de pesos, a los que hay que sumar escalas y metadatos de los grupos de cuantización. El repositorio, sin embargo, ocupa 5,3 GB, aproximadamente once veces esa cifra. Esa divergencia no está explicada en la información disponible y podría deberse a la presencia de múltiples variantes de pesos, artefactos auxiliares o ficheros no cuantizados; se trata de una observación, no de un dato confirmado.

## Arquitectura y entrenamiento

No disponible. La información proporcionada no incluye ningún detalle sobre la arquitectura del modelo (transformer denso, mezcla de expertos, modelos de espacio de estados o híbridos), ni sobre el número de capas, dimensión oculta, mecanismo de atención o vocabulario. La etiqueta "maple" figuran entre los tags de HuggingFace, pero no se aclara si designa una arquitectura concreta, una familia de modelos o una denominación interna del autor.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el volumen de tokens, la composición del corpus, la existencia de fases de ajuste supervisado, RLHF o DPO, ni si se aplicaron técnicas como decodificación especulativa, atención lineal o cuantización durante el entrenamiento. El único elemento técnico verificable es el propio artefacto publicado: pesos en formato MLX cuantizados a 2 bits, pensados para ejecutarse con la herramienta referenciada en el repositorio github.com/deepgrove-ai/mlx-lm-deepgrove, que por su nombre parece un fork de mlx-lm orientado a este modelo.

## Capacidades

- Generación de texto: es la capacidad mínima que cabe atribuir a un modelo de lenguaje de este tipo, pero no está documentada ni confirmada por el autor en la información disponible.
- Razonamiento, matemáticas y código: no disponible; no se han publicado evaluaciones ni declaraciones al respecto.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible.
- Ejecución local en Apple Silicon: es la capacidad implícita del formato MLX, que permite inferencia en CPU y GPU integradas de los chips de la serie M sin necesidad de CUDA.

Advertencia: no debe asumirse ninguna capacidad concreta más allá de la generación de texto. La ausencia de model card descriptiva implica que cualquier funcionalidad debe verificarse empíricamente antes de integrarla en un sistema.

## Casos de uso

- Prototipado local en macOS: el modelo puede cargarse con la herramienta MLX referenciada para experimentar con generación de texto en un Mac sin depender de servicios en la nube, aprovechando que sus ~0,5 GB de pesos en 2 bits caben holgadamente en memoria unificada.
- Procesamiento por lotes con requisitos de privacidad: clasificación, etiquetado o resumen de documentos que no pueden salir de la máquina del usuario, ejecutando la inferencia en local y evitando el envío de datos a APIs externas.
- Aplicaciones de escritorio y utilidades offline: asistentes de escritura, autocompletado o generación de borradores integrados en una aplicación nativa de macOS, donde el tamaño reducido del modelo permite distribuirlo junto al propio binario.
- Experimentación académica con cuantización extrema: análisis del impacto de los 2 bits sobre la calidad de salida en un modelo de ~1,9 mil millones de parámetros, comparando contra versiones en 4 u 8 bits del mismo modelo si estuvieran disponibles.
- Extracción de información estructurada: formularios, correos o notas convertidas a JSON con esquemas sencillos, siempre que una evaluación previa confirme que la cuantización a 2 bits no degrada en exceso la fidelidad de la salida.
- Educación y demostraciones: ejemplos didácticos de despliegue de modelos en dispositivos de consumo, ilustrando el flujo completo desde la descarga de safetensors en formato MLX hasta la generación.
- Filtrado previo en pipelines híbridos: primera pasada de bajo coste sobre grandes volúmenes de texto para descartar o marcar candidatos, dejando la decisión final a un modelo mayor.

En todos los casos, la idoneidad real depende de capacidades que no están documentadas; los escenarios anteriores describen usos plausibles por tamaño y formato, no prestaciones verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni comparaciones con modelos de tamaño similar. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (1.897.309.196) y del tamaño de cuantización; no proceden de documentación del autor:

| Precisión | Peso teórico de los pesos | Memoria total estimada en inferencia |
|---|---|---|
| 2 bits (formato publicado) | ~0,47 GB | ~0,8-1,2 GB con escalas y overhead del runtime |
| 4 bits (si se recuantiza) | ~1,1 GB | ~1,4-1,8 GB |
| 8 bits | ~1,9 GB | ~2,3-2,8 GB |
| fp16 | ~3,8 GB | ~4,2-4,8 GB |

- VRAM: en el formato publicado, el modelo debería encajar en cualquier Mac con 8 GB de memoria unificada, reservando margen para el sistema operativo y la caché KV. La caché KV no puede estimarse porque se desconocen el número de capas, cabezas de atención y dimensión de la cabeza.
- GPU recomendadas: al ser un artefacto MLX, el destino natural son los chips Apple M1, M2, M3 y M4, en sus variantes base, Pro, Max y Ultra. No hay soporte indicado para CUDA, por lo que tarjetas como RTX 4090, A100 o H100 no pueden ejecutarlo sin una conversión previa de formato.
- GPU de consumo: cabe en cualquier equipo Apple Silicon actual, incluidos los modelos con 8 GB de memoria unificada. En el ecosistema NVIDIA requeriría convertir los pesos a GGUF u otro formato; a 2 bits el peso sería inferior a 1 GB, por lo que también cabría en GPUs con 4 GB de VRAM o más.
- Opciones de despliegue: la vía documentada es la herramienta del repositorio github.com/deepgrove-ai/mlx-lm-deepgrove, en la órbita de mlx-lm. El uso con llama.cpp, Ollama, vLLM o TGI exigiría convertir los safetensors a GGUF o a un formato compatible; ninguna de esas rutas está documentada ni validada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, de modo que la comparación se limita a parámetros, contexto, licencia y formato. Los datos de los modelos de referencia son de conocimiento público general y no proceden de la información proporcionada; conviene verificarlos en sus fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Formatos disponibles | Notas |
|---|---|---|---|---|---|
| deepgrove/maple-preview-2bit-mlx | 1,90 mil millones | no disponible | MIT | safetensors MLX, 2 bits | Sin model card técnica ni benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF, MLX, AWQ | Documentación y evaluaciones públicas |
| Llama-3.2-1B-Instruct | 1,23 mil millones | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, MLX | Requiere aceptar la licencia comunitaria |
| Gemma-2-2B-it | 2,6 mil millones | 8.192 tokens | Términos de uso de Gemma | safetensors, GGUF, MLX | Restricciones de uso comercial en la licencia |

Frente a estas alternativas, la ventaja potencial del modelo de deepgrove es la huella de memoria en 2 bits y una licencia MIT sin cláusulas adicionales; la desventaja es la ausencia total de documentación, de evaluaciones y de garantías sobre la calidad de la cuantización.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe arquitectura, entrenamiento, datos ni limitaciones. Cualquier decisión de adopción se basa en información no verificada.
- Estado de previsualización: el sufijo "preview" indica que puede tratarse de una versión inmadura, sujeta a cambios o retirada sin aviso.
- Degradación por cuantización: los 2 bits son el nivel más agresivo de cuantización habitual. Degrada de forma notable la coherencia, el razonamiento y la fidelidad al formato en modelos de este tamaño; no se han publicado mediciones de esa pérdida.
- Sesgos: no disponible. Al desconocerse el corpus de entrenamiento, no puede evaluarse el sesgo demográfico, cultural o lingüístico.
- Riesgo de alucinación: no documentado, pero estructuralmente elevado en un modelo de ~1,9 mil millones de parámetros cuantizado a 2 bits.
- Cobertura de idiomas: no disponible. El repositorio no declara ningún idioma, por lo que el castellano no está confirmado.
- Longitud de contexto: no disponible; esto impide planificar aplicaciones con documentos largos o conversaciones multi-turno extensas.
- Licencia: MIT permite uso comercial, modificación y redistribución con atribución y sin garantías. Es la parte mejor definida de la ficha, pero conviene comprobar si los pesos derivan de otro modelo con licencia más restrictiva, algo que no se indica.
- Compatibilidad: al publicarse solo en formato MLX, su uso queda ligado al ecosistema Apple. La conversión a GGUF para otros runtimes es posible en teoría, pero no está soportada ni probada por el autor.
- Soporte: no consta canal de soporte, issues ni mantenimiento más allá del repositorio de GitHub referenciado.
- Producción: no se recomienda su uso en entornos de producción sin una evaluación propia previa de calidad, latencia y tasa de error en la tarea concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepgrove/maple-preview-2bit-mlx
- Repositorio de instrucciones citado en la model card: https://github.com/deepgrove-ai/mlx-lm-deepgrove
- Paper: no disponible
- Blog o anuncio: no disponible
- Demo: no disponible
- Otros repositorios del autor: no disponible

Nota sobre la búsqueda web: los resultados recuperados durante la búsqueda corresponden a páginas de Google Maps y Google Earth y no guardan relación con el modelo, por lo que no se han utilizado como fuente.
