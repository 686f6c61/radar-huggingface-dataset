# mradermacher/Kitchoon-V2-26B-A4B-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones estáticas en formato GGUF del modelo SubMaroon/Kitchoon-V2-26B-A4B, generadas y publicadas por el usuario mradermacher, conocido por producir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. El repositorio no incluye pesos originales ni documentación técnica propia: es una conversión de los pesos del modelo base, con `convert_type: hf` y `quantize_version: 2` en los metadatos de la conversión.

La información pública disponible es extremadamente limitada. La model card del repositorio se reduce a la lista de cuantizaciones generadas y a la referencia al modelo de origen. No se declaran licencia, idiomas, pipeline, ni se documentan capacidades, datos de entrenamiento o resultados de evaluación. El propio nombre del repositorio sugiere un modelo de aproximadamente 26 000 millones de parámetros totales con unos 4000 millones activos (la nomenclatura "A4B" es la empleada habitualmente en arquitecturas de mezcla de expertos), pero se trata de una inferencia a partir del nombre, no de un dato confirmado por el autor.

Por tanto, esta ficha debe leerse como un inventario de lo que se puede verificar en el repositorio y como una advertencia explícita sobre la ausencia de información. Cualquier decisión de adopción en producción debería pasar antes por una validación empírica directa del modelo base, ya que ni la licencia ni el comportamiento del modelo están documentados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; el sufijo "-A4B" del nombre sugiere mezcla de expertos (MoE) con parámetros activos reducidos, sin confirmar |
| Parámetros totales | No disponible de forma confirmada; el nombre indica 26B (26 000 millones), dato no verificado en la model card |
| Parámetros activos | No disponible de forma confirmada; el nombre indica A4B (aproximadamente 4000 millones activos), coherente con una arquitectura MoE, sin confirmar |
| Longitud de contexto | No disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada ni en el repositorio de cuantizaciones ni en los metadatos recuperados) |
| Formato de pesos | GGUF. La conversión se realizó desde pesos en formato Hugging Face (`convert_type: hf`) |
| Proyector multimodal | No incluido: los metadatos de la conversión indican `skip_mmproj: 1` |
| Fecha de creación del repositorio | 2026-10-10 (fecha futura respecto a la fecha habitual de publicación; posible error de metadatos) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras) del modelo SubMaroon/Kitchoon-V2-26B-A4B. La model card del repositorio de cuantizaciones no incluye ninguna sección técnica: únicamente declara que se trata de cuantizaciones estáticas del modelo base y enumera los niveles de cuantización generados.

Lo único verificable es el proceso de conversión: los pesos se transformaron desde el formato de Hugging Face a GGUF con `quantize_version: 2` y `output_tensor_quantised: 1`, y se omitió el proyector multimodal (`skip_mmproj: 1`). Esto implica que este repositorio distribuye exclusivamente componentes de lenguaje y que, si el modelo base tuviese capacidad de visión, esta no sería utilizable con los ficheros aquí publicados salvo que se obtuviese el proyector por otra vía.

Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, enrutado de expertos, etc.) sería especulativa y no se recoge en esta ficha.

## Capacidades

- Generación de texto: no documentada explícitamente, pero es la función esperada de un modelo de lenguaje cuantizado en GGUF. Sin confirmación por parte del autor.
- Razonamiento, matemáticas y generación de código: no disponible; no hay documentación ni evaluaciones publicadas.
- Modo de pensamiento o razonamiento explícito (`thinking mode`): no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Visión: no disponible en este repositorio; la conversión omitió el proyector multimodal (`skip_mmproj: 1`), por lo que no se distribuye componente de visión.
- Audio: no disponible.
- Ejecución local: capacidad confirmada por el formato, ya que los ficheros GGUF están pensados para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, koboldcpp, entre otras).
- Ajuste fino o entrenamiento adicional: no disponible.

## Casos de uso

Dado que las capacidades del modelo no están documentadas, los siguientes escenarios son aplicaciones plausibles de un modelo de lenguaje cuantizado en GGUF de este tamaño, condicionadas a una validación previa del modelo base. No deben interpretarse como casos confirmados por el autor.

- Inferencia local en estación de trabajo: desplegar la cuantización Q4_K_M o Q5_K_M con llama.cpp u Ollama para disponer de un asistente de texto sin conexión y sin coste por token, aprovechando que en una arquitectura MoE con pocos parámetros activos el coste por token es inferior al de un modelo denso del mismo tamaño total.
- Asistente de redacción técnica: generar y revisar documentación, correos o informes en local cuando existan requisitos de confidencialidad que impidan enviar el texto a una API externa. Requiere verificar antes la calidad de salida y el idioma soportado.
- Prototipado rápido de aplicaciones de lenguaje: usar el formato GGUF para integrar el modelo en una aplicación de escritorio o servidor ligero mediante la librería de llama.cpp, sin necesidad de infraestructura GPU dedicada si se emplean cuantizaciones bajas.
- Procesamiento por lotes de textos en un servidor sin GPU: con cuantizaciones Q4_K_S o Q2_K y ejecución en CPU con suficiente RAM, es viable procesar volúmenes moderados de texto (clasificación, resumen, extracción) en entornos donde no hay acelerador disponible.
- Evaluación comparativa interna: servir como candidato adicional en un banco de pruebas propio frente a otros modelos abiertos de tamaño similar, midiendo latencia, consumo de memoria y calidad subjetiva antes de comprometerse con un modelo en producción.
- Base para experimentación con ajuste fino: si la licencia del modelo base lo permitiese, servir de punto de partida para adaptaciones con técnicas de bajo rango. La licencia no está declarada, por lo que este caso queda bloqueado hasta su aclaración.
- Educación y experimentación: estudio del comportamiento de arquitecturas MoE cuantizadas y comparación de la degradación de calidad entre niveles de cuantización (por ejemplo, Q8_0 frente a Q4_K_M frente a Q2_K) sobre un mismo conjunto de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación. Tampoco hay datos de latencia o throughput medidos. Cualquier cifra que se citase al respecto sería inventada.

## Requisitos de hardware

Las siguientes estimaciones se derivan aritméticamente del recuento de parámetros que sugiere el nombre del modelo (26 000 millones) y de los bits por peso típicos de cada nivel de cuantización GGUF. No son datos publicados por el autor y deben tratarse como orientativos.

- VRAM estimada para los pesos, asumiendo 26 000 millones de parámetros:
  - x-f16: en torno a 52 GB.
  - Q8_0: en torno a 28 GB.
  - Q6_K: en torno a 22 GB.
  - Q5_K_M: en torno a 18 GB.
  - Q4_K_M: en torno a 15-16 GB.
  - Q3_K_M: en torno a 12-13 GB.
  - Q2_K: en torno a 9-10 GB.
- Memoria adicional: hay que sumar el espacio para la caché KV, que depende de la longitud de contexto configurada, del número de capas y del número de cabezas KV. Este dato no está disponible, por lo que no puede calcularse con precisión.
- GPU recomendadas:
  - Q8_0 y Q6_K: GPU de 40-48 GB o superiores (A100 40/80 GB, H100, L40S).
  - Q4_K_M y Q5_K_M: GPU de 24 GB (RTX 3090, RTX 4090, A5000, L4) o reparto entre dos GPU de 16 GB.
  - Q3_K_M y Q2_K: GPU de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti de 16 GB) o ejecución en CPU.
- Ejecución en GPU de consumo: viable con las cuantizaciones de Q4 hacia abajo en tarjetas de 16-24 GB. Las cuantizaciones Q6_K y Q8_0 no caben en una GPU de consumo de 24 GB junto con contexto apreciable.
- Ejecución en CPU: posible con llama.cpp y suficiente RAM del sistema (se recomienda al menos la mitad del tamaño del fichero como memoria libre adicional para la caché y el runtime). Al tratarse, presumiblemente, de una arquitectura MoE con pocos parámetros activos, el throughput en CPU debería ser superior al de un modelo denso de 26B.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

No disponible.

La información proporcionada no permite identificar con fiabilidad la familia del modelo base ni sus características (parámetros confirmados, contexto, licencia, rendimiento). Sin esos datos, cualquier tabla comparativa con alternativas de la misma categoría sería especulativa. Se recomienda consultar directamente el repositorio SubMaroon/Kitchoon-V2-26B-A4B y verificar su model card antes de establecer comparaciones.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card técnica, ni descripción de arquitectura, ni datos de entrenamiento, ni evaluación. Es imposible conocer de antemano el comportamiento del modelo.
- Licencia no declarada: al no especificarse licencia ni en el repositorio de cuantizaciones ni en los metadatos, el uso comercial queda en una situación jurídica indeterminada. No debe desplegarse en producción sin aclarar este punto con el autor del modelo base.
- Idiomas no declarados: se desconoce si el modelo tiene un buen rendimiento en castellano o si está entrenado predominantemente en otro idioma.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; sin evaluaciones publicadas, no hay forma de acotar su magnitud en este caso.
- Sesgos: no evaluados ni documentados. No hay información sobre la composición del dataset de entrenamiento, por lo que no pueden estimarse sesgos de género, origen, ideología u otros.
- Degradación por cuantización: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) suelen introducir pérdidas de calidad medibles respecto a Q5 y superiores. No hay evaluaciones que cuantifiquen esa pérdida en este modelo concreto.
- Sin soporte multimodal en este repositorio: el proyector multimodal se omitió durante la conversión, por lo que este repositorio solo cubre el componente de lenguaje.
- Contexto desconocido: al no declararse la longitud de contexto, no puede dimensionarse correctamente la caché KV ni garantizarse el comportamiento en conversaciones largas.
- Fecha de creación anómala: el repositorio figura como creado el 10 de octubre de 2026, una fecha futura, lo que sugiere un error en los metadatos y reduce la fiabilidad de los mismos.
- Cero descargas y cero interacciones: no hay evidencia de uso por parte de la comunidad, ni informes de terceros que permitan validar el funcionamiento de las cuantizaciones.
- Resultados de búsqueda no relevantes: las consultas realizadas no devolvieron ninguna fuente técnica relacionada con el modelo; los resultados obtenidos fueron canales de mensajería sin relación con el proyecto.

## Enlaces

- Repositorio de cuantizaciones GGUF (objeto de esta ficha): https://huggingface.co/mradermacher/Kitchoon-V2-26B-A4B-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/SubMaroon/Kitchoon-V2-26B-A4B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog técnico, repositorio de código o demo: no disponibles. La búsqueda web no devolvió ningún enlace relevante sobre este modelo.
