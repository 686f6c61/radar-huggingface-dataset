# McG-221/Qwen3.8-27B-heretic-ara-mlx-8Bit

## Resumen

El modelo McG-221/Qwen3.8-27B-heretic-ara-mlx-8Bit es una conversión a formato MLX (Apple Silicon) del modelo heretic-org/Qwen3.8-27B-heretic-ara, realizado por McG-221 mediante la librería mlx-lm versión 0.31.2. El modelo base pertenece a la serie Qwen3.5 (etiqueta `qwen3_5`) y ha sido sometido a un proceso de abliteración, una técnica que elimina las capas de rechazo del modelo original para ofrecer respuestas sin censura (etiquetas `uncensored`, `decensored`, `abliterated`). El pipeline declarado es `image-text-to-text`, lo que indica que se trata de un modelo multimodal capaz de procesar tanto imágenes como texto.

La relevancia de esta versión radica en su disponibilidad para ejecutarse de forma eficiente en hardware Apple mediante MLX, con cuantización de 8 bits que reduce los requisitos de memoria. El nombre sugiere 27 000 millones de parámetros, aunque el archivo safetensors registra 7 566 401 024 parámetros (aproximadamente 7,5 mil millones), una discrepancia que no se aclara en la documentación. El repositorio ocupa 28,6 GB, lo que encaja mejor con un modelo de 27B en 8 bits que con uno de 7,5B, por lo que el dato de parámetros debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (probablemente transformer multimodal, sin confirmar) |
| Parametros totales | 7 566 401 024 según safetensors; el nombre indica 27B (discrepancia sin resolver) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (según el nombre del repositorio) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors convertidos con mlx-lm) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por el pipeline `image-text-to-text` y la etiqueta `qwen3_5`, se infiere que se trata de un transformer multimodal de la familia Qwen 3.5, pero no se especifican detalles como el número de capas, la dimensión del modelo o el mecanismo de atención. El proceso de abliteración mencionado en las etiquetas consiste en modificar los pesos del modelo para eliminar las representaciones internas que provocan rechazos de contenido, dando lugar a una versión "sin censura". No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO sobre el modelo base. La única información de entrenamiento relevante es que la conversión a MLX se realizó con mlx-lm 0.31.2, un proceso que no altera los pesos sino que los adapta al formato optimizado para Apple Silicon.

## Capacidades

- Procesamiento multimodal: al ser `image-text-to-text`, puede recibir imágenes y texto como entrada y generar texto como salida.
- Generación de texto sin censura: gracias a la abliteración, el modelo no debería rechazar peticiones de contenido explícito o sensible, a diferencia de los modelos Qwen estándar.
- Conversación: las etiquetas incluyen `conversational`, lo que indica soporte para diálogos multi-turno.
- Compatibilidad con MLX: diseñado para ejecutarse en Apple Silicon (M-series) mediante la librería mlx-lm.
- Cuantización de 8 bits: reduce el uso de memoria y acelera la inferencia en hardware compatible.
- No se ha confirmado soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente, aunque podrían estar presentes por ser un derivado de Qwen 3.5 (no hay documentación al respecto).

## Casos de uso

- Generación creativa sin restricciones: escritores y artistas pueden usar el modelo para explorar temas sensibles o contenido explícito sin que el sistema rechace las peticiones, gracias a la abliteración.
- Investigación en seguridad de IA: investigadores que estudian los efectos de la eliminación de censura en modelos de lenguaje pueden emplear esta versión como caso de estudio comparativo frente al modelo original.
- Desarrollo de aplicaciones locales en Apple Silicon: desarrolladores que trabajan con Macs con chip M1/M2/M3 pueden integrar el modelo en aplicaciones de escritorio o móviles mediante MLX, aprovechando la cuantización de 8 bits para reducir la huella de memoria.
- Análisis de imágenes con generación de descripciones: al ser multimodal, puede utilizarse para generar descripciones detalladas de imágenes, por ejemplo en herramientas de accesibilidad o archivado visual.
- Prototipado rápido de chatbots conversacionales: su naturaleza conversacional y su formato MLX permiten crear prototipos de asistentes virtuales que se ejecutan localmente sin conexión a internet.
- Entornos de educación y formación en IA: estudiantes y profesionales pueden experimentar con un modelo sin censura para comprender las diferencias de comportamiento entre versiones alineadas y no alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo MLX, está pensado para Apple Silicon (M1, M1 Pro/Max/Ultra, M2, M3, etc.). No es compatible con GPUs NVIDIA o AMD de forma nativa.
- El tamaño del repositorio es de 28,6 GB, lo que sugiere que el modelo completo en 8 bits requiere al menos 32 GB de memoria unificada en un Mac para cargar los pesos en RAM. Si los parámetros reales son 7,5B, el requisito bajaría a unos 8 GB, pero la discrepancia no permite afirmarlo con seguridad.
- Para inferencia en producción, se recomienda un Mac con 64 GB de memoria unificada o más para evitar problemas de swapping.
- La librería mlx-lm permite cargar el modelo con `load()` y generar texto con `generate()`, como se muestra en la documentación del repositorio.
- No se dispone de datos sobre latencia o throughput, ya que no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base heretic-org/Qwen3.8-27B-heretic-ara podría compararse con otras versiones abliteradas de Qwen, pero no se conocen sus características exactas. Alternativas como Qwen2.5-72B-Instruct o Llama-3.1-70B tienen tamaños y licencias diferentes, y ninguna está disponible en formato MLX con abliteración de forma pública. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar texto ofensivo, ilegal o dañino. No debe desplegarse en aplicaciones orientadas al público general sin un sistema de moderación externo.
- Falta de documentación técnica: no se especifican la arquitectura exacta, el contexto máximo, los idiomas soportados ni los detalles de entrenamiento, lo que dificulta su evaluación rigurosa.
- Discrepancia en el número de parámetros: el nombre indica 27B, pero el archivo safetensors registra 7,5B. Esto puede deberse a un error en el nombre o a una cuantización especial, pero no está aclarado.
- Riesgo de alucinación: al ser un modelo sin censura y sin datos de entrenamiento conocidos, el riesgo de generar información falsa o inventada es elevado, especialmente en dominios especializados.
- Sesgos potenciales: no se han publicado auditorías de sesgos; al derivar de Qwen, podría heredar sesgos del dataset original, pero no hay evidencia disponible.
- Compatibilidad limitada: el formato MLX solo funciona en Apple Silicon, lo que restringe su uso en entornos con GPUs convencionales.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base heretic-org podría tener condiciones adicionales no documentadas en esta ficha.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/McG-221/Qwen3.8-27B-heretic-ara-mlx-8Bit
- Modelo base (heretic-org/Qwen3.8-27B-heretic-ara): https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Documentación de mlx-lm (librería de conversión): no se ha encontrado un enlace directo en la información proporcionada.
