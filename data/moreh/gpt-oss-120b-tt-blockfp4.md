# moreh/gpt-oss-120b-TT-BLOCKFP4

## Resumen

moreh/gpt-oss-120b-TT-BLOCKFP4 es una versión cuantizada del modelo abierto gpt-oss-120b de OpenAI, publicada por el usuario Moreh en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo base a un formato de cuantización denominado BLOCKFP4, según se deduce del propio nombre del repositorio. La tarjeta del modelo no incluye documentación técnica adicional, y el repositorio tiene acceso restringido (requiere aceptar condiciones en HuggingFace).

El modelo base, openai/gpt-oss-120b, es un transformer de tipo mezcla de expertos (MoE) con aproximadamente 117 000 millones de parámetros totales y unos 5 100 millones activos por token, con una ventana de contexto de 128 000 tokens y pesos publicados originalmente en MXFP4. Está diseñado para razonamiento, generación de código y uso como agente con tool calling, e incorpora un formato de respuesta propio (harmony) con niveles configurables de esfuerzo de razonamiento.

La relevancia de este repositorio concreto es acotada: se trata de un artefacto de cuantización de terceros, sin descargas ni valoraciones en el momento de la consulta, pensado previsiblemente para ejecutar el modelo sobre una plataforma de hardware concreta. Quien necesite el modelo en su forma canónica y con garantías de soporte debería acudir al repositorio oficial de OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) heredada del modelo base openai/gpt-oss-120b; la cuantización no modifica la topología |
| Parámetros totales | ≈117 000 millones (modelo base; no confirmado en la tarjeta del repositorio) |
| Parámetros activos | ≈5 100 millones por token (modelo base) |
| Longitud de contexto | 128 000 tokens (modelo base) |
| Tipos de cuantización | BLOCKFP4 (FP4 por bloques) según el nombre del repositorio; el esquema exacto, el tamaño de bloque y la escala no están documentados |
| Idiomas soportados | no disponible |
| Licencia | "other" según la metadata del repositorio; el modelo base se distribuye bajo Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no declara safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre el proceso de cuantización ni sobre el entrenamiento. Todo lo que se puede afirmar con rigor procede del modelo base: gpt-oss-120b es un transformer MoE con atención agrupada por consultas, activación SwiGLU, codificación posicional RoPE y un patrón de capas que alterna bandas de atención densa y dispersa. El enrutamiento de expertos selecciona un subconjunto reducido de expertos por token, lo que explica la diferencia entre parámetros totales y activos. Los pesos se publicaron originalmente en MXFP4, un formato de coma flotante de 4 bits con escala compartida por bloque, de modo que la cuantización en FP4 no es ajena al diseño original.

En cuanto al entrenamiento del modelo base, OpenAI ha declarado que combina preentrenamiento a gran escala con etapas de ajuste por refuerzo, incluyendo RL sobre cadenas de razonamiento, y que emplea el formato de respuesta harmony con tres niveles de esfuerzo de razonamiento (bajo, medio y alto). No se han publicado en esta búsqueda el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles de las etapas de alineamiento. Respecto a la innovación específica de este repositorio, la cuantización BLOCKFP4 busca reducir el espacio de memoria de los pesos manteniendo una escala numérica por bloque, pero no hay ningún informe técnico asociado que permita evaluar su impacto en la calidad.

## Capacidades

Las siguientes capacidades corresponden al modelo base y, por tanto, son esperables en esta versión cuantizada, aunque no han sido verificadas en este repositorio concreto:

- Generación de texto y razonamiento multi-paso, con modo de pensamiento configurable en tres niveles de esfuerzo.
- Generación y edición de código, con soporte para múltiples lenguajes de programación.
- Razonamiento matemático y resolución de problemas cuantitativos.
- Tool calling y function calling estructurado mediante el formato harmony, incluyendo llamadas paralelas.
- Uso como agente en flujos multi-turno con ejecución de herramientas externas (navegación web, intérprete de Python).
- Ventana de contexto de 128 000 tokens, adecuada para documentos largos y conversaciones extensas.
- Capacidades multilingües generales heredadas del preentrenamiento, sin lista oficial de idiomas publicada en este repositorio.
- Ejecución local o autoalojada, al distribuirse los pesos de forma abierta (sujeto a la licencia del repositorio).

## Casos de uso

- Agentes autónomos con herramientas: el modelo puede planificar varios pasos, invocar funciones externas y encadenar resultados gracias al soporte nativo de tool calling y a sus 128 000 tokens de contexto, lo que permite mantener el historial completo de la tarea en una sola ventana.
- Asistente de programación integrado en el IDE o en CI/CD: generación de parches, revisión de código y escritura de pruebas, con la posibilidad de conectar herramientas de compilación y ejecución de tests mediante function calling.
- Atención al cliente multi-turno: gestión de conversaciones largas con recuperación de documentación interna, manteniendo el contexto de la sesión y del cliente sin truncados frecuentes.
- Análisis de documentación extensa: resumen y extracción de datos de contratos, informes técnicos o expedientes que superan los cientos de páginas, aprovechando la ventana de 128 000 tokens.
- Razonamiento matemático y auditoría de cálculos: verificación de resultados y resolución de problemas cuantitativos, con el nivel de esfuerzo de razonamiento elevado cuando la precisión es crítica.
- Despliegue on-premise con requisitos de soberanía de datos: organizaciones que no pueden enviar información a APIs externas pueden servir el modelo en su propio clúster, siempre que la licencia del repositorio lo permita.
- Evaluación de hardware de cuantización: este repositorio resulta útil para medir el rendimiento y la degradación de calidad de un pipeline FP4 por bloques sobre la plataforma para la que fue preparado, aunque carece de benchmarks publicados.
- Generación de contenido multilingüe y traducción asistida en entornos donde no se requiere una calidad de traducción especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del repositorio no incluye ninguna evaluación, y la búsqueda web realizada no devolvió resultados relacionados con el modelo. Tampoco se dispone de métricas de latencia o throughput para esta cuantización concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en MXFP4 ocupa del orden de 63 GB de pesos, por lo que se necesitan al menos 64 GB de memoria de GPU para cargarlo en una sola tarjeta, más el espacio para la caché KV. Las estimaciones para esta variante BLOCKFP4 no están publicadas y podrían diferir.
- GPU recomendadas: H100 80 GB o A100 80 GB para ejecución en una sola tarjeta; configuraciones multi-GPU (2×A100 40 GB, 2×RTX 4090, 4×RTX 3090) para repartir pesos.
- Cabe en GPU de consumo: un solo RTX 4090 (24 GB) no es suficiente. Se requiere agregar varias GPU de consumo o recurrir a memoria del sistema con descarga de expertos a CPU.
- Opciones de despliegue: vLLM, TensorRT-LLM, SGLang y llama.cpp (con conversión previa a GGUF) son los caminos habituales para el modelo base. En este repositorio hay que verificar antes si el formato BLOCKFP4 está soportado por estos motores o si requiere un runtime propietario de Moreh.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| moreh/gpt-oss-120b-TT-BLOCKFP4 | ≈117 000 M totales / ≈5 100 M activos | 128 000 tokens | "other" (repositorio) | Gated en HuggingFace; 0 descargas |
| openai/gpt-oss-120b | ≈117 000 M totales / ≈5 100 M activos | 128 000 tokens | Apache 2.0 | Abierta en HuggingFace |
| openai/gpt-oss-20b | ≈21 000 M totales / ≈3 600 M activos | 128 000 tokens | Apache 2.0 | Abierta en HuggingFace |
| Llama 3.3 70B Instruct | 70 000 M densos | 128 000 tokens | Licencia comunitaria de Meta | Abierta, con condiciones de uso |
| Qwen3-235B-A22B | ≈235 000 M totales / ≈22 000 M activos | 128 000 tokens | Apache 2.0 | Abierta en HuggingFace |

La comparación con alternativas densas y MoE de tamaño similar es, en el caso de este repositorio, meramente orientativa: al ser una cuantización del mismo modelo base, sus diferencias reales frente a openai/gpt-oss-120b se limitan al formato de pesos, al soporte de hardware y a la posible degradación numérica, no a la arquitectura ni a los datos de entrenamiento.

## Limitaciones y advertencias

- Acceso restringido: el repositorio exige aceptar condiciones en HuggingFace, lo que puede limitar su uso automatizado en pipelines.
- Licencia ambigua: la metadata indica "other" mientras que el modelo base es Apache 2.0. Antes de cualquier uso comercial hay que revisar los términos exactos del repositorio, ya que podrían imponer restricciones adicionales.
- Cuantización no documentada: no hay informe técnico sobre el esquema BLOCKFP4, su tamaño de bloque ni el impacto medido en la calidad respecto al modelo original. Es razonable esperar cierta degradación en tareas sensibles a la precisión numérica.
- Compatibilidad limitada de runtime: el formato puede requerir kernels o una plataforma de hardware específicos; conviene verificar el soporte en vLLM, llama.cpp o TensorRT-LLM antes de adoptarlo.
- Ausencia total de validación: cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks ni pruebas de terceros publicadas.
- Riesgo de alucinación: heredado del modelo base, que puede generar afirmaciones plausibles pero incorrectas, especialmente en dominios especializados o con contexto insuficiente.
- Sesgos: el modelo base no ha sido sometido a un proceso de alineamiento tan exhaustivo como los modelos alojados de OpenAI; puede reproducir sesgos presentes en sus datos de entrenamiento.
- Idiomas: no se ha publicado una lista oficial de idiomas soportados para esta versión; el rendimiento en castellano no está verificado.
- Uso en producción: al carecer de garantías de soporte, versionado o mantenimiento por parte de Moreh, no es recomendable como dependencia crítica sin un plan de contingencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/moreh/gpt-oss-120b-TT-BLOCKFP4
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Anuncio y documentación del modelo base (OpenAI): https://openai.com/index/introducing-gpt-oss/
- Repositorio de código del modelo base: https://github.com/openai/gpt-oss

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo ni con su autor; los resultados obtenidos correspondían a servicios de streaming y no se han incluido por no ser relevantes.
