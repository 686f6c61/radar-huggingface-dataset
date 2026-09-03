# mradermacher/Iris-mini-GGUF

## Resumen

Iris-mini es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 35.505 millones de parámetros, desarrollado por AllSpark Research y publicado bajo licencia Apache-2.0. Este repositorio contiene las cuantizaciones GGUF realizadas por mradermacher, que permiten ejecutar el modelo en hardware más modesto que el necesario para los pesos originales en safetensors. El modelo está orientado a tareas agénticas, búsqueda de información y deep research, como indican sus etiquetas (`search-agent`, `deep-research`, `agentic`), y se basa en la arquitectura Qwen3.6, aunque no se proporcionan detalles adicionales sobre su configuración interna.

La relevancia de esta versión cuantizada radica en que facilita el despliegue local de un modelo de gran tamaño con capacidades de agente, algo que normalmente requeriría múltiples GPUs de alta gama. Al ofrecer varios niveles de cuantización (desde Q2_K hasta Q8_0), el usuario puede elegir entre calidad y requisitos de memoria según su hardware. Además, se incluyen archivos de proyección multimodal (`mmproj`), lo que sugiere que el modelo original puede procesar entradas visuales, aunque esta capacidad no está documentada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.6 (detalles no disponibles) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_S, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo original usa safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original (numero de expertos, dimensiones, atencion, etc.) ni sobre su proceso de entrenamiento. Los unicos datos disponibles son los proporcionados por las etiquetas del repositorio: se trata de un modelo MoE basado en Qwen3.6, con capacidades agénticas y de deep research. Tampoco se menciona el uso de tecnicas como RLHF o DPO, ni el tamaño del dataset de entrenamiento. La cuantizacion GGUF es estatica (sin imatrix), segun indica el autor, lo que puede afectar ligeramente a la calidad respecto a cuantizaciones con matriz de importancia.

## Capacidades

- Generacion de texto y razonamiento, aunque no se especifican detalles de rendimiento.
- Soporte para tareas agénticas y multi-paso, como busqueda de informacion y deep research (segun etiquetas).
- Capacidades multimodales potenciales: se incluyen archivos `mmproj` (proyeccion multimodal) en Q8_0 y f16, lo que sugiere que el modelo original puede procesar imagenes, aunque no hay documentacion al respecto.
- Idioma: exclusivamente ingles (segun el campo `language`).
- No se menciona soporte explicito para tool calling o function calling, aunque es probable dado su caracter agéntico.

## Casos de uso

- Investigacion automatizada: el modelo puede actuar como agente que busca informacion en fuentes externas, la sintetiza y genera informes estructurados, gracias a su orientacion a deep research.
- Asistentes de analisis de documentos: con su capacidad de contexto largo (no confirmada) y su naturaleza agéntica, podria procesar grandes volumenes de texto y extraer conclusiones.
- Generacion de codigo y asistencia en desarrollo: aunque no esta documentado, los modelos MoE de este tamaño suelen manejar tareas de programacion; se puede probar con cuantizaciones Q4_K_S o superiores.
- Despliegue local en entornos con una sola GPU de gama alta: gracias a las cuantizaciones GGUF, es posible ejecutar el modelo en una RTX 4090 (24 GB) con Q4_K_S o inferior.
- Creacion de chatbots especializados en busqueda: al ser un modelo agéntico, puede integrarse en sistemas de preguntas y respuestas que requieran consultar bases de conocimiento externas.
- Experimentacion academica con modelos MoE cuantizados: su licencia Apache-2.0 permite su uso en investigacion y productos comerciales sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamaño de los archivos GGUF, se necesitan aproximadamente:
  - Q2_K: 13,3 GB (cabe en GPUs de 16 GB como RTX 4080 o 4090)
  - Q3_K_M: 17,3 GB (requiere 24 GB o mas)
  - Q4_K_S: 20,5 GB (recomendado para RTX 3090/4090 con 24 GB)
  - Q6_K: 29,3 GB (requiere 32 GB o mas, por ejemplo A6000 o A100)
  - Q8_0: 37,9 GB (requiere 48 GB o mas, como A6000 o A100 de 80 GB)
- GPU recomendadas: RTX 3090, RTX 4090, A6000, A100, H100. Para cuantizaciones bajas (Q2_K, Q3_K_M) puede bastar con una RTX 4080 de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. vLLM no soporta GGUF de forma nativa, por lo que se recomienda usar los anteriores.
- Latencia y throughput: no disponibles. Dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos MoE de tamano similar (como Qwen3-30B-A3B o DeepSeek-V2-Lite). Los datos de rendimiento y arquitectura de Iris-mini no estan publicados, por lo que no es posible realizar una comparacion objetiva.

## Limitaciones y advertencias

- Idioma: solo ingles. No es adecuado para tareas multilingues.
- Cuantizacion estatica: al no usar imatrix, las cuantizaciones de baja precision (Q2_K, Q3_K_M) pueden degradar notablemente la calidad de las respuestas.
- Sin informacion sobre sesgos o alucinaciones: al no haber benchmarks ni evaluaciones publicas, se desconoce su comportamiento en estos aspectos.
- Capacidades multimodales no confirmadas: aunque se incluyen archivos `mmproj`, no hay documentacion que garantice su funcionamiento.
- Modelo en fase temprana: el repositorio se creo en septiembre de 2026 y no tiene descargas ni likes, lo que sugiere que es un proyecto reciente y poco probado.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Iris-mini-GGUF
- Modelo original: https://huggingface.co/AllSpark-Research/Iris-mini
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
