# mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated`, una versión "abliterated" de Gemma 4 12B, el modelo multimodal de Google DeepMind. La técnica de abliteration elimina los mecanismos de rechazo (refusal) del modelo original, de modo que responde sin las restricciones de seguridad habituales. El cuantizador `mradermacher` ha generado una amplia gama de cuantizaciones con imatrix, desde IQ1_S (3,1 GB) hasta Q5_K_M (8,4 GB), pensadas para ejecución local eficiente en hardware variado.

El modelo base Gemma 4 12B es un transformer multimodal unificado sin encoder, con entrada de texto, imagen, audio y video, una ventana de contexto de 256K tokens y unos 11,9 mil millones de parámetros. Esta versión abliterated es relevante para la investigación en seguridad y alineación, ya que permite estudiar el comportamiento del modelo sin los filtros de seguridad, así como para aplicaciones que requieren respuestas sin censura (con las debidas advertencias éticas y legales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal sin encoder (Gemma 4 12B) |
| Parametros totales | 11.907.350.576 (aprox. 11,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (segun la documentacion de Gemma 4 12B) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, entre otros |
| Idiomas soportados | Ingles (segun la model card; el modelo base puede soportar mas) |
| Licencia | No disponible (el modelo base Gemma usa licencia Gemma, pero la version abliterated puede tener restricciones adicionales) |
| Formato de pesos | GGUF (con archivos imatrix) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B, un transformer multimodal unificado sin encoder que procesa directamente texto, imagen, audio y video. La arquitectura emplea atencion sobre todas las modalidades de entrada, lo que permite un razonamiento cruzado entre ellas. El entrenamiento original fue realizado por Google DeepMind con datos multimodales a gran escala, aunque no se han publicado detalles especificos sobre el numero de tokens o la composicion del dataset en la informacion disponible.

La version abliterated, creada por el usuario `3MPER0RR`, aplica la tecnica de abliteration: se identifican y eliminan las direcciones en el espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a contenidos que el modelo original consideraria peligrosos o no eticos. El cuantizador `mradermacher` ha generado posteriormente las cuantizaciones GGUF con imatrix, optimizadas para diferentes equilibrios de tamano, velocidad y calidad.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Gemma 4 12B.
- Procesamiento multimodal: entrada de imagenes, audio y video (segun la documentacion de Gemma 4 12B).
- Soporte de tool calling y function calling (probable, aunque no confirmado en la model card).
- Capacidad de agentes y razonamiento multi-paso (depende del prompt y la configuracion).
- Multilingue limitado: la model card indica solo ingles, aunque el modelo base podria soportar mas idiomas.
- Sin restricciones de seguridad: al estar abliterated, responde a peticiones que el modelo original rechazaria, incluyendo contenido potencialmente danino.
- Cuantizaciones variadas que permiten ejecucion en hardware desde 3 GB de VRAM hasta GPUs de gama alta.

## Casos de uso

- Investigacion en seguridad y alineacion: estudiar como se comporta el modelo sin mecanismos de rechazo, analizar sesgos y vulnerabilidades, y evaluar tecnicas de abliteration.
- Analisis de comportamientos no deseados: identificar que tipo de contenido generaria el modelo sin filtros, util para disenar mejores sistemas de seguridad.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos que requieran temas tabu o controvertidos, siempre con responsabilidad legal y etica.
- Desarrollo de aplicaciones de rol o simulacion: crear personajes o asistentes que no tengan limitaciones de contenido, por ejemplo en juegos o entornos de simulacion.
- Evaluacion de cuantizaciones: comparar la calidad de las distintas cuantizaciones GGUF (IQ1_S, Q4_K_M, etc.) en tareas de generacion de texto y razonamiento.
- Despliegue local en hardware modesto: gracias a las cuantizaciones pequenas (IQ1_S, 3,1 GB), se puede ejecutar en portatiles con 4-6 GB de VRAM, por ejemplo con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version abliterated en la informacion disponible. El modelo base Gemma 4 12B tiene benchmarks publicados por Google DeepMind, pero no se dispone de ellos en los datos proporcionados. No se deben extrapolar resultados del modelo original a la version abliterated, ya que la eliminacion de los mecanismos de rechazo puede alterar el rendimiento en tareas de seguridad y alineacion.

## Requisitos de hardware

- VRAM estimada: desde 3,1 GB (cuantizacion IQ1_S) hasta 8,4 GB (Q5_K_M) para el modelo completo. Para contexto largo (256K) se necesita memoria adicional para el cache KV, que puede superar los 16 GB en cuantizaciones altas.
- GPU recomendadas: para cuantizaciones bajas (IQ1_S, IQ2_XXS) basta una RTX 3060 o similar con 6 GB; para Q4_K_M se recomienda una RTX 4060 Ti o superior con 8-12 GB; para las cuantizaciones mas altas o contexto largo, se necesitan GPUs de 16 GB o mas (RTX 4090, A100, H100).
- Si cabe en consumer GPU: si, las cuantizaciones de 3-5 GB caben en GPUs de gama media (RTX 3060, RTX 4060). Las de 7-8 GB requieren GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI (si se convierte a safetensors).
- Latencia y throughput: no se han publicado datos especificos para este modelo. En general, las cuantizaciones IQ4_XS y Q4_K_M ofrecen un buen equilibrio entre velocidad y calidad en GPUs consumer.

## Comparativa con modelos similares

No se dispone de datos comparativos especificos para esta version abliterated. Como referencia, el modelo base Gemma 4 12B se puede comparar con otros modelos de tamano similar como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B, pero no se tienen resultados de benchmarks de esta version concreta. La abliteration no modifica los parametros del modelo, solo elimina ciertas direcciones de activacion, por lo que el rendimiento en tareas generales deberia ser similar al modelo original, aunque no se puede confirmar sin pruebas.

## Limitaciones y advertencias

- Modelo abliterated: puede generar contenido danino, ilegal, violento, sexual o no etico sin restricciones. Su uso conlleva responsabilidad legal y etica.
- Sesgos conocidos: el modelo base puede presentar sesgos de genero, raza o ideologia, que la abliteration no elimina y podria incluso amplificar.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos o datos, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: aunque el contexto nominal es de 256K, en la practica el rendimiento se degrada con contextos muy largos y el cache KV consume mucha memoria.
- Limitaciones de idioma: la model card indica solo ingles; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia no esta especificada en el repositorio. El modelo base Gemma tiene una licencia propia de Google que puede prohibir ciertos usos, y la abliteration podria violar los terminos de uso. Se recomienda revisar la licencia original antes de cualquier uso comercial.
- No apto para produccion sin supervision: debido a la ausencia de filtros de seguridad, no se recomienda su uso en aplicaciones publicas sin un sistema de moderacion externo.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated
- Pagina oficial de Gemma 4 12B: https://gemmai4.com/gemma4-12b/
- Guia de instalacion local (Ollama, GGUF, QAT): https://aitoolsradar.org/blog/models/gemma-4-12b-local-setup-guide-2026/
- Repositorio oficial de Gemma en GitHub: https://github.com/google-deepmind/gemma
