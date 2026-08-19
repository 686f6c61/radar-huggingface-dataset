# akpsahan/Pabadox

## Resumen

Pabadox es un modelo de lenguaje de 26.900 millones de parámetros, publicado por akpsahan (Pabasara SN) en agosto de 2026. Se trata de una versión cuantizada en formato GGUF del modelo base darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT, un modelo de la familia Xortron orientado a tareas conversacionales y de instrucción. El repositorio incluye únicamente pesos cuantizados, sin el modelo original en precisión completa.

La relevancia de Pabadox radica en su etiquetado como modelo "uncensored", "decensored" y "abliterated", lo que indica que se ha aplicado una técnica de ablación para eliminar los mecanismos de rechazo y moderación del modelo base. Esto lo convierte en una opción para casos de uso donde se requiere generación de texto sin filtros de seguridad, como investigación en seguridad de IA, análisis de jailbreaks o aplicaciones creativas con libertad temática. La cuantización con matriz de importancia (imatrix) permite ejecutar el modelo en hardware de consumo con una degradación de calidad controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura base del modelo Xortron, detalles no disponibles) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S (todas con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

La arquitectura concreta de Pabadox no se documenta en la informacion disponible, ya que se trata de un repositorio de cuantizacion. El modelo base, darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT, pertenece a la familia Xortron y se distribuye con licencia Apache 2.0, con un enlace a la licencia de Qwen3.5-27B, lo que sugiere una posible base arquitectonica similar a la familia Qwen. El dataset de entrenamiento indicado es darkc0de/Xortron.Config.Dataset.New.2026, del que no se ofrecen detalles sobre composicion o volumen.

La caracteristica tecnica mas destacable de Pabadox es su naturaleza "abliterated": se ha aplicado un proceso de ablacion sobre los mecanismos de rechazo y alineacion del modelo base, eliminando los circuitos que generan respuestas de rechazo ante solicitudes potencialmente problematicas. El repositorio incluye cuantizaciones con imatrix (matriz de importancia), que optimizan la asignacion de bits a los tensores mas relevantes, mejorando la relacion calidad-tamano respecto a cuantizaciones estaticas convencionales. Tambien se indica que es un modelo de vision, con archivos mmproj disponibles en el repositorio estatico de mradermacher.

## Capacidades

- Generacion de texto conversacional e instructivo en ingles.
- Generacion de texto sin filtros de moderacion gracias al proceso de abliteracion aplicado.
- Capacidad multimodal de vision (segun la model card, con archivos mmproj disponibles en el repositorio estatico).
- Compatible con herramientas de inferencia GGUF como llama.cpp, Ollama y otras que soporten este formato.
- Soporte de cuantizaciones extremas (IQ1_S, IQ2_XXS) para entornos con memoria muy limitada.
- No se ha confirmado soporte de tool calling, function calling o modo agente en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar comportamientos de modelos sin alineacion, analizar vulnerabilidades de jailbreak y evaluar la eficacia de tecnicas de moderacion en sistemas de IA.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas que otros modelos rechazarian por politicas de seguridad.
- Pruebas de robustez de sistemas de moderacion: desarrollo de conjuntos de datos adversariales para evaluar filtros de contenido en aplicaciones de produccion.
- Desarrollo de personajes conversacionales: creacion de asistentes virtuales o chatbots con personalidades extremas o sin restricciones morales para entornos de simulacion.
- Analisis de sesgos y comportamientos no alineados: estudio de como un modelo de 27B se comporta sin las capas de rechazo, comparandolo con la version alineada.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones IQ1 e IQ2, el modelo puede ejecutarse en CPUs o GPUs con poca VRAM, aunque con perdida significativa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se incluyen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar en la model card ni en la informacion de HuggingFace. El repositorio no ofrece comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamano de los archivos GGUF, la cuantizacion Q4_K_S ocupa aproximadamente 15,7 GB, por lo que requiere al menos 16 GB de VRAM. Las cuantizaciones IQ2 ocupan entre 8,5 y 10,1 GB, aptas para GPUs con 12 GB. Las cuantizaciones IQ1 ocupan entre 7,2 y 7,7 GB, viables en GPUs con 8 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_S con margen de contexto; RTX 3090 o RTX 4080 (16 GB) para Q4_K_S ajustado; RTX 4060 Ti o RTX 3060 (12 GB) para cuantizaciones IQ2; GPUs con 8 GB para IQ1.
- En CPU: las cuantizaciones IQ2 e IQ1 pueden ejecutarse en CPUs modernas con 16-32 GB de RAM, aunque con latencias elevadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo base Xortron no tiene benchmarks publicados, y no se han encontrado modelos comparables con la misma combinacion de tamano, licencia y caracteristicas de abliteracion en la informacion disponible. Se recomienda consultar el repositorio del modelo base para obtener mas contexto.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de los mecanismos de rechazo implica que el modelo puede generar contenido ofensivo, ilegal, peligroso o danino sin restricciones. Su uso en produccion requiere una evaluacion cuidadosa de riesgos.
- Sin datos de benchmarks: no hay evidencia publica del rendimiento del modelo en tareas estandar, lo que dificulta evaluar su calidad real respecto a alternativas.
- Idioma limitado: solo se declara soporte para ingles. El rendimiento en otros idiomas no esta garantizado.
- Contexto desconocido: no se especifica la longitud de contexto soportada, un dato critico para aplicaciones de agentes o documentos largos.
- Riesgo de alucinacion: al ser un modelo sin alineacion, es probable que presente tasas de alucinacion elevadas y una tendencia a inventar informacion con mayor frecuencia que modelos alineados.
- Calidad de cuantizaciones extremas: las cuantizaciones IQ1 e IQ2 degradan significativamente la calidad del texto generado, limitando su uso a tareas donde la fidelidad no sea critica.
- Repositorio sin mantenimiento: el modelo tiene 0 descargas y 0 likes, y no hay evidencia de soporte activo o actualizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/akpsahan/Pabadox
- Modelo base: https://huggingface.co/darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-GGUF
- Pagina de descargas de cuantizaciones: https://hf.tst.eu/model#XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-i1-GGUF
- Perfil del autor: https://huggingface.co/akpsahan
- Dataset de entrenamiento: https://huggingface.co/datasets/darkc0de/Xortron.Config.Dataset.New.2026
- Licencia (referencia Qwen): https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
