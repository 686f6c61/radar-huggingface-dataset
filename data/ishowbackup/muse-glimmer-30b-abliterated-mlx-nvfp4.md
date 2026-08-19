# Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-NVFP4

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-NVFP4 es una versión cuantizada en formato MLX con precisión NVFP4 de 4 bits del modelo Muse-Glimmer-30B, un modelo multimodal (imagen-texto) desarrollado originalmente por Meta Superintelligence Labs y posteriormente modificado por Blackfrost mediante un proceso de "abliteración" que elimina los comportamientos de rechazo. Esta variante concreta, publicada por el usuario Ishowbackup, está optimizada para ejecutarse en Apple Silicon a través de la librería MLX, ocupando aproximadamente 18 GB en disco.

El modelo base, Muse-Glimmer-30B, es un transformer denso de 52 capas con atención de ventana deslizante, atención multi-consulta (GQA) y una torre de visión integrada, lo que le permite procesar entradas de imagen y texto. Su ventana de contexto alcanza los 131.072 tokens, y está diseñado para tareas agénticas y razonamiento profundo, devolviendo el razonamiento de forma separada de la respuesta final. La licencia Apache-2.0 permite uso comercial sin restricciones, y la cuantización NVFP4 mantiene la integridad del comportamiento abliterado, con una tasa de rechazo de 0/450 en el benchmark R1-HARMFUL-BENCH-450.

Esta ficha se basa exclusivamente en la información proporcionada en la model card y los metadatos de HuggingFace. No se dispone de datos sobre el entrenamiento original, benchmarks estándar ni comparativas con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `muse_glimmer` — transformer denso, 52 capas, hidden size 6656, GQA (32 q / 2 kv), sliding-window attention, torre de vision |
| Parametros totales | 8.834.679.808 (segun safetensors; el modelo base se anuncia como 30B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit) sobre pesos BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso con 52 capas, hidden size de 6656 y atención multi-consulta con 32 cabezas de consulta y 2 de clave/valor. Emplea atención de ventana deslizante para gestionar eficientemente el contexto largo de 131.072 tokens, e incorpora una torre de visión que permite procesar imágenes junto con texto. La arquitectura está diseñada para ejecutarse en dispositivos, con un enfoque agéntico que separa el razonamiento intermedio de la respuesta final.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación utilizadas por Meta. La modificación principal de Blackfrost consiste en un proceso de "abliteración" que elimina los comportamientos de rechazo (refusals) mediante cambios en los pesos, manteniendo intactas las capacidades multimodales. La cuantización NVFP4, aplicada posteriormente, reduce el tamaño del modelo a aproximadamente 18 GB sin degradar el comportamiento abliterado, según el benchmark de rechazo incluido en la model card.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas textuales basadas en ambas modalidades.
- Razonamiento profundo: el modelo está diseñado para tareas que requieren múltiples pasos de razonamiento, devolviendo el razonamiento de forma separada de la respuesta final.
- Comportamiento agéntico: orientado a tareas de agente, con capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno.
- Generación de texto y código: puede producir texto coherente y fragmentos de código, como se muestra en el ejemplo de la model card (búsqueda binaria en Python).
- Contexto largo: ventana de 131.072 tokens, adecuada para documentos extensos o conversaciones prolongadas.
- Sin comportamientos de rechazo: la abliteración elimina las negativas ante solicitudes potencialmente dañinas, lo que puede ser útil en entornos de investigación controlados.
- Compatibilidad con Apple Silicon: formato MLX optimizado para Macs con chips M1, M2, M3 y superiores.

## Casos de uso

- Asistente local en Mac: gracias a su formato MLX y tamaño de ~18 GB, puede ejecutarse en un Mac con suficiente memoria unificada, ofreciendo un asistente conversacional privado sin conexión a la nube.
- Analisis de imagenes con contexto largo: al combinar visión y una ventana de 131k tokens, es adecuado para tareas como describir imágenes médicas, revisar capturas de pantalla o analizar diagramas técnicos junto con documentación extensa.
- Generacion de codigo en entornos de desarrollo: puede integrarse en IDEs o pipelines de CI/CD para generar fragmentos de código, explicar algoritmos o refactorizar, aprovechando su capacidad de razonamiento profundo.
- Investigacion sobre seguridad y alineacion: al ser abliterado, permite estudiar el comportamiento de un modelo sin restricciones de rechazo, útil para analizar sesgos o evaluar riesgos en entornos controlados.
- Procesamiento de documentos largos: con 131k tokens de contexto, puede resumir libros, informes o transcripciones completas, manteniendo coherencia a lo largo de todo el documento.
- Prototipado de agentes conversacionales: su naturaleza agéntica y el razonamiento separado facilitan la construcción de sistemas que necesitan planificar y ejecutar pasos intermedios antes de responder.

## Benchmarks y rendimiento

La unica metrica publicada es el benchmark de rechazo R1-HARMFUL-BENCH-450, medido sobre el modelo abliterado:

| Metrica | Resultado |
|---|---|
| True refusal (harmful, n=300) | 0 / 300 = 0.0% |
| True refusal (full 450) | 0 / 450 = 0.0% |
| Substring-harmful | 0 / 300 |
| Substring-all | 2 / 450 (XSTest false positives) |
| Errors | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: se estima que el modelo necesita al menos 18 GB de RAM unificada en Apple Silicon, recomendandose 32 GB o mas para un rendimiento fluido con contexto largo.
- GPU: compatible con cualquier chip Apple Silicon (M1, M1 Pro/Max, M2, M3, M4), ya que MLX aprovecha la GPU integrada y la memoria unificada.
- Almacenamiento: aproximadamente 19.4 GB de espacio en disco para los pesos cuantizados.
- Opciones de despliegue: mediante `mlx_lm.generate` para generacion puntual, `mlx_lm.server` para un servidor compatible con OpenAI, o LM Studio con runtime MLX.
- Latencia y throughput: no se proporcionan datos concretos; dependen del chip especifico y de la longitud de la secuencia. Al ser un modelo de 30B cuantizado a 4 bits, se espera una velocidad moderada en Macs de gama alta.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo base Muse-Glimmer-30B podria compararse con otros modelos de 30B como Llama 3.1 30B o Qwen 2.5 32B, pero no hay datos de rendimiento para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Comportamiento abliterado: al eliminar los rechazos, el modelo puede generar contenido dañino, ilegal o no etico sin restricciones. Su uso en produccion debe limitarse a entornos controlados y con supervisión humana.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto ambiguo.
- Cuantizacion NVFP4: la precision de 4 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo BF16 original, aunque la model card afirma que el comportamiento abliterado se mantiene.
- Dependencia de Apple Silicon: el formato MLX solo es compatible con Macs con chips Apple, lo que limita su despliegue en otras plataformas (Linux, Windows, GPUs NVIDIA).
- Idiomas no especificados: no se indica que idiomas soporta el modelo; aunque probablemente sea multilingue, no hay garantia de cobertura para todos los idiomas.
- Sin datos de entrenamiento: no se ha publicado informacion sobre el dataset, el numero de tokens o las tecnicas de alineacion, lo que dificulta evaluar su robustez y sesgos.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que sugiere que puede ser un artefacto experimental o una version preliminar.

## Enlaces

- Repositorio HuggingFace: [Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-NVFP4](https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-NVFP4)
- Modelo base (BF16): [Blackfrost-Research/Muse-Glimmer-30B-Abliterated-BF16](https://huggingface.co/Blackfrost-Research/Muse-Glimmer-30B-Abliterated-BF16)
- Modelo original de Meta: [meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
