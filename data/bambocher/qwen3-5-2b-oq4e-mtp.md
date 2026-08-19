# bambocher/Qwen3.5-2B-oQ4e-mtp

## Resumen

El modelo `bambocher/Qwen3.5-2B-oQ4e-mtp` es una cuantización en 4 bits del modelo Qwen3.5-2B, realizada con la herramienta oQ (oMLX v0.6.1) en formato MLX safetensors. Está pensado para su ejecución eficiente en dispositivos Apple Silicon mediante MLX. La cuantización emplea un grupo de tamaño 64 y precisión mixta, lo que reduce el peso del modelo a 1,8 GB, facilitando su despliegue en entornos con memoria limitada.

Aunque el nombre sugiere 2 mil millones de parámetros, los safetensors reportan 656.646.464 parámetros totales, una discrepancia que no se explica en la documentación disponible. El modelo base, Qwen3.5-2B, pertenece a la serie Qwen3.5 de Alibaba Cloud, que según fuentes externas incorpora mejoras en razonamiento, seguimiento de instrucciones y capacidades multimodales, aunque esta cuantización concreta no incluye dicha información.

La relevancia de este modelo radica en ofrecer una versión compacta y optimizada para inferencia local en hardware Apple, aprovechando la aceleración de MLX. Sin embargo, la falta de licencia, idiomas documentados y benchmarks limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (base), detalles especificos no disponibles |
| Parametros totales | 656.646.464 (segun safetensors; el nombre indica 2B, discrepancia sin aclarar) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, grupo 64, precision mixta) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. Segun fuentes externas sobre la serie Qwen3.5, esta emplea una arquitectura hibrida que combina atencion lineal con bloques transformer clasicos, y ha sido entrenada con un enfoque de fusion temprana de vision y lenguaje sobre billones de tokens multimodales. No obstante, para esta cuantizacion especifica no se dispone de datos sobre el entrenamiento original, el numero de tokens, ni el uso de tecnicas como RLHF o DPO.

La cuantizacion oQ4e aplica una reduccion de precision a 4 bits con grupo de 64, manteniendo la estructura de pesos en formato MLX. Este metodo de cuantizacion mixta busca preservar la calidad del modelo mientras reduce el espacio en disco y la memoria necesaria para la inferencia.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3.5-2B, se espera que herede capacidades de razonamiento y seguimiento de instrucciones, aunque no hay validacion especifica para esta version cuantizada.
- Soporte de tool calling y agentes: no confirmado para esta cuantizacion; el modelo base podria soportarlo, pero no hay evidencia en la documentacion.
- Capacidades multimodales: segun fuentes externas, Qwen3.5 integra vision, texto y video, pero esta cuantizacion no documenta si dichas capacidades se mantienen tras la cuantizacion.
- Multilingue: no se especifican idiomas soportados.
- Formato MLX: optimizado para ejecucion en Apple Silicon (M1, M2, M3, etc.) mediante la libreria MLX.

## Casos de uso

- Inferencia local en macOS: gracias a su formato MLX y tamano reducido (1,8 GB), es adecuado para ejecutar modelos de lenguaje en equipos Apple con memoria unificada, por ejemplo en aplicaciones de escritorio o asistentes personales.
- Prototipado rapido: desarrolladores que deseen experimentar con la serie Qwen3.5 sin necesidad de GPU dedicadas pueden usar esta cuantizacion para pruebas de concepto.
- Desarrollo de aplicaciones de chat: puede integrarse en aplicaciones de chat locales que requieran respuestas generativas sin depender de la nube.
- Analisis de texto en entornos con recursos limitados: su bajo consumo de memoria permite procesar documentos, resumir o clasificar texto en portatiles antiguos o equipos con poca RAM.
- Educacion e investigacion: util para estudiantes o investigadores que quieran estudiar el comportamiento de modelos cuantizados en comparacion con versiones de precision completa.
- Despliegue en dispositivos edge: aunque MLX esta orientado a Apple, la cuantizacion 4-bit reduce el espacio, lo que podria facilitar la portabilidad a otros entornos con adaptaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se dispone de datos sobre latencia o throughput para esta cuantizacion especifica.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 656M parametros cuantizado a 4 bits, el uso de memoria aproximado es de 656M * 0,5 bytes ≈ 328 MB, mas overhead. En la practica, el archivo de 1,8 GB incluye pesos y metadatos, por lo que se recomienda al menos 2 GB de memoria libre.
- GPU recomendadas: no aplica directamente, ya que MLX utiliza la GPU integrada de Apple Silicon. Cualquier Mac con chip M1 o superior puede ejecutarlo.
- Compatibilidad con consumer GPU: no es compatible con GPUs NVIDIA o AMD de forma nativa; requiere adaptacion a otros formatos (por ejemplo, GGUF para llama.cpp).
- Opciones de despliegue: MLX (libreria oficial), posiblemente mediante el ecosistema de oMLX. No se menciona soporte para vLLM, Ollama o TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. La cuantizacion oQ4e es especifica de MLX y no se han encontrado otros modelos cuantizados de Qwen3.5-2B con el mismo formato en la informacion proporcionada. Como referencia general, la serie Qwen3.5 incluye modelos de 0.8B a 397B, todos bajo licencia Apache 2.0, pero no se confirma que esta cuantizacion mantenga dicha licencia. No se puede afirmar que sea mejor o peor que alternativas sin datos de benchmarks.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial podria estar restringido si la licencia del modelo base no es permisiva; se recomienda contactar al autor antes de usarlo en produccion.
- Discrepancia en el numero de parametros: el nombre sugiere 2B, pero los safetensors indican 656M; esto puede deberse a un error de etiquetado o a una cuantizacion que omite ciertos pesos, lo que afecta a la interpretacion de sus capacidades.
- Falta de documentacion: no hay informacion sobre el dataset de entrenamiento, idiomas, contexto maximo ni tecnicas de alineacion, lo que impide evaluar sesgos o limitaciones de idioma.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Formato propietario: MLX safetensors no es compatible con la mayoria de frameworks estandar (transformers, vLLM), lo que limita su portabilidad fuera del ecosistema Apple.
- Sin garantias de rendimiento: al no haber benchmarks publicados, no se puede asegurar que mantenga la calidad del modelo original tras la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ4e-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Referencia de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Repositorio de Qwen3.5 (tokwalabs): https://github.com/tokwalabs/Qwen3.5
- Guia de modelos Qwen (insiderllm): https://insiderllm.com/guides/qwen-models-guide/
- Guia de Qwen 3.5 (qwen-ai.com): https://qwen-ai.com/qwen-3-5/
