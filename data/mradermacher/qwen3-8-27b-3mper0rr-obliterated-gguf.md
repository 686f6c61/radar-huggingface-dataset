# mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated`, preparadas por mradermacher. Se trata de un modelo de lenguaje de 26.895.998.464 parámetros (~26,9 mil millones), con licencia Apache 2.0 y orientado al inglés. La variante "abliterated" (también llamada "obliterated") implica que se han eliminado las negativas de seguridad del modelo original, permitiendo respuestas sin censura. El repositorio ofrece una amplia gama de cuantizaciones, desde Q2_K hasta Q8_0, además de archivos multimodales (mmproj) en f16 y Q8_0, lo que facilita su ejecución en hardware variado. Es relevante para investigadores y desarrolladores que necesitan un modelo de gran tamaño sin restricciones de contenido, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (algunas fuentes externas mencionan 262K, sin confirmar para este modelo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados para el modelo base `3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated`. El nombre sugiere que deriva de la familia Qwen3, probablemente con una arquitectura transformer densa, pero no hay confirmacion oficial. El proceso de "abliteration" consiste en eliminar las direcciones de rechazo aprendidas durante el entrenamiento con RLHF, lo que resulta en un modelo que no se niega a responder a peticiones que el modelo original consideraria inapropiadas. Este repositorio solo contiene las cuantizaciones estáticas (sin imatrix) realizadas por mradermacher, sin modificaciones adicionales sobre los pesos.

## Capacidades

- Generacion de texto y conversacion: al ser un modelo de lenguaje de gran tamano, puede mantener dialogos multi-turno y generar texto coherente en ingles.
- Ausencia de restricciones de contenido: al estar "abliterated", no rechaza peticiones sobre temas sensibles, violencia, contenido explicito, etc. (dentro de los limites de lo que el modelo aprendio).
- Soporte multimodal: los archivos mmproj (Q8_0 y f16) sugieren que el modelo base puede procesar imagenes, aunque no se especifica el detalle de esta capacidad.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.

## Casos de uso

- Investigacion en seguridad de IA: analizar como se comporta un modelo sin salvaguardas, estudiar sesgos o evaluar riesgos de generacion de contenido peligroso.
- Generacion de contenido creativo sin censura: escritura de ficcion, guiones o dialogos que requieran temas adultos o controvertidos, sin las restricciones habituales de los modelos comerciales.
- Analisis de textos sensibles: procesamiento de documentos legales, medicos o historicos que contengan lenguaje explicito o temas tabu, donde un modelo censurado podria omitir informacion relevante.
- Pruebas de robustez: evaluar la capacidad del modelo para mantener coherencia y calidad incluso cuando se le piden respuestas fuera de los limites eticos habituales.
- Desarrollo de aplicaciones de rol o simulacion: crear personajes o asistentes que no tengan limitaciones de contenido, util para juegos de rol o entornos de simulacion.
- Benchmarking de cuantizaciones: comparar la degradacion de calidad entre las distintas versiones GGUF (Q2_K a Q8_0) en tareas de generacion de texto, para decidir el mejor equilibrio entre tamano y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, el archivo GGUF ocupa entre 10,8 GB (Q2_K) y 28,7 GB (Q8_0). Se recomienda al menos 2-4 GB adicionales de VRAM para el contexto y overhead.
- GPU recomendadas: para Q4_K_M (16,6 GB) se necesita una GPU con al menos 20 GB de VRAM, como RTX 3090, RTX 4090, A100 40GB o similar. Para Q8_0 (28,7 GB) se requieren GPUs de 32 GB o mas, como A100 80GB o H100.
- En consumer GPU: las cuantizaciones Q2_K y Q3_K_S (10,8 y 12,2 GB) pueden caber en GPUs de 16 GB como RTX 4080 o RTX 4090, aunque con contexto limitado.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y otros motores que soporten este formato. Tambien se puede usar con vLLM si se convierte a safetensors, aunque no es el proposito de este repo.
- Latencia y throughput: no se dispone de mediciones concretas. Dependera del hardware y la cuantizacion. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de 20-40 tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria. El nombre sugiere que es una variante de Qwen3-27B, pero no hay datos oficiales. Se podria comparar con otros modelos abliterated de tamano similar, como Llama-3-27B o Mistral-27B, pero no se tienen especificaciones ni benchmarks de estos en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Al ser un modelo "abliterated", puede generar contenido ofensivo, violento, ilegal o peligroso sin restricciones. Su uso debe limitarse a entornos de investigacion controlados y con consentimiento explicito de los participantes.
- No se ha verificado la calidad del modelo base ni su rendimiento en tareas estandar. La ausencia de benchmarks impide conocer su nivel real de capacidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en este repositorio. Se recomienda revisar la licencia del modelo original.
- El modelo solo soporta ingles de forma confirmada. No se garantiza un buen rendimiento en otros idiomas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- No se incluyen archivos de imatrix, lo que puede afectar a la calidad de las cuantizaciones de menor tamano en comparacion con versiones que si los usan.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated
- Blog de MindStudio sobre ejecucion local: https://www.mindstudio.ai/blog/run-qwen3-8-27b-obliterated-locally
- Pagina de local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-27b-obliterated.html
- Blog de Orcarouter sobre Qwen3.8-27B Uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
