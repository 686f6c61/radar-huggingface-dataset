# mradermacher/Qwen3.8-27B-Heretic-NoRefusal-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `Qwen3.8-27B-Heretic-NoRefusal`, una versión "abliterada" (sin censura) del modelo Qwen3.8-27B de Alibaba. El modelo base fue creado por sss22213 aplicando la técnica Heretic, que elimina automáticamente los comportamientos de rechazo mediante ablación direccional, preservando mejor las capacidades originales que otros métodos de abliteración. La cuantización ha sido realizada por mradermacher, que ofrece múltiples formatos GGUF optimizados para inferencia local.

El modelo resultante es un transformer de aproximadamente 26,9 mil millones de parámetros, con licencia Apache 2.0 y soporte para inglés y chino. Está pensado para desarrolladores e investigadores que necesitan un modelo de gran tamaño sin restricciones de contenido, ya sea para generación creativa, análisis de comportamientos no censurados o aplicaciones conversacionales. La disponibilidad de cuantizaciones desde Q2 hasta Q6 permite ejecutarlo en hardware variado, desde GPUs de consumo hasta servidores profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso desarrollado por Alibaba, con arquitectura similar a la serie Qwen3. La versión "Heretic-NoRefusal" se obtiene aplicando el método Heretic, que realiza una ablación direccional sobre los pesos del modelo para eliminar los vectores asociados al rechazo de peticiones. Según el repositorio de Heretic, este método consigue el mismo nivel de supresión de rechazos que otras abliteraciones pero con una divergencia KL mucho menor, lo que indica un menor daño a las capacidades originales del modelo.

El proceso de abliteración se realizó utilizando los datasets `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`, que se emplean para identificar y eliminar las direcciones de activación responsables de los comportamientos de rechazo. No se dispone de información detallada sobre el entrenamiento original del modelo Qwen3.8-27B (número de tokens, composición del dataset, uso de RLHF, etc.). La cuantización GGUF se ha generado con imatrix, lo que mejora la calidad de los quants de baja precisión.

## Capacidades

- Generacion de texto y conversacion multilingue en ingles y chino.
- Razonamiento y respuesta a instrucciones complejas, heredadas del modelo base Qwen3.8-27B.
- Generacion de contenido sin restricciones de censura ni rechazo de peticiones (caracteristica principal de la version abliterada).
- Posible soporte de vision (el modelo base podria ser multimodal), aunque no se confirma en esta cuantizacion; los archivos mmproj, si existen, se encuentran en el repositorio estatico.
- No se especifica soporte de tool calling, function calling ni capacidades de agente en la informacion disponible.
- Compatible con endpoints de inferencia que soporten GGUF (llama.cpp, Ollama, etc.).

## Casos de uso

- Generacion de ficcion y narrativa sin restricciones: el modelo puede producir textos creativos con tematicas adultas o controvertidas sin rechazar la peticion, gracias a la eliminacion de la censura.
- Investigacion en seguridad y alineacion de IA: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, util para analizar sesgos, riesgos y estrategias de mitigacion.
- Asistentes conversacionales en chino e ingles: su capacidad multilingue y su licencia permisiva (Apache 2.0) facilitan su integracion en productos comerciales de atencion al cliente o chatbots.
- Desarrollo de personajes virtuales o juegos de rol: al no rechazar peticiones, puede interpretar personajes con personalidades extremas o dialogos no convencionales.
- Analisis de contenido y moderacion: puede usarse para generar ejemplos de contenido problematico y entrenar clasificadores o sistemas de moderacion.
- Prototipado rapido de aplicaciones de lenguaje: las cuantizaciones GGUF permiten desplegar el modelo en entornos locales con recursos limitados, ideal para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-27B podria tener metricas conocidas (MMLU, HumanEval, etc.), pero no se proporcionan en esta ficha. Se recomienda consultar la documentacion oficial de Qwen3.8 para obtener datos de rendimiento del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para Q4_K_M (aproximadamente 4,5 bits por peso), se necesitan unos 15-16 GB de VRAM, lo que cabe en una RTX 4090 (24 GB) o una A100 40 GB. Para Q6_K, se requieren unos 20 GB. Las cuantizaciones Q2 o IQ2 pueden funcionar con 10-12 GB, aunque con perdida de calidad.
- GPUs recomendadas: RTX 3090/4090, A100, H100, o cualquier GPU con al menos 16 GB de VRAM para cuantizaciones medias.
- En consumer GPU: si, con cuantizaciones Q4 o inferiores en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Tambien puede usarse con servidores de inferencia como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion; en una RTX 4090 con Q4_K_M, se puede esperar una generacion de 20-40 tokens por segundo para un modelo de 27B.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo se puede comparar con otras versiones abliteradas de modelos de tamano similar, como `Qwen3-32B-Abliterated` o `Llama-3-8B-Abliterated`, pero no se tienen metricas de rendimiento. En terminos de licencia, Apache 2.0 es mas permisiva que la licencia de Llama (que tiene restricciones para uso comercial en algunos casos). El contexto no esta especificado, por lo que no se puede comparar con modelos que ofrecen 128K o 256K.

## Limitaciones y advertencias

- Al ser una version sin censura, el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No debe usarse en aplicaciones publicas sin filtros de seguridad adicionales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en temas especializados.
- Sesgos: el modelo base puede contener sesgos sociales y culturales, que la abliteracion no elimina.
- Limitaciones de idioma: solo se garantiza soporte para ingles y chino; otros idiomas pueden tener un rendimiento inferior.
- La cuantizacion GGUF puede degradar ligeramente la calidad de las respuestas en comparacion con los pesos originales en fp16, especialmente en cuantizaciones muy agresivas (Q2, IQ1).
- No se ha confirmado el soporte de vision en esta cuantizacion; si se necesita esa capacidad, hay que verificar la disponibilidad de archivos mmproj en el repositorio estatico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener restricciones adicionales; se recomienda revisar la licencia del modelo original.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-NoRefusal-i1-GGUF
- Repositorio estatico (quants sin imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-NoRefusal-GGUF
- Modelo base (sss22213): https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-NoRefusal
- Repositorio de Heretic (metodo de abliteracion): https://github.com/p-e-w/heretic
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pagina de recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
