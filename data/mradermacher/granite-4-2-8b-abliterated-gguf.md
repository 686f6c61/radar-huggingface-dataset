# mradermacher/granite-4.2-8b-abliterated-GGUF

## Resumen

`mradermacher/granite-4.2-8b-abliterated-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `Lonelyguyse1/granite-4.2-8b-abliterated`, una variante "abliterated" (es decir, con los mecanismos de rechazo eliminados mediante la ablacion de direcciones de activacion) del modelo Granite 4.2 de 8B parametros de IBM. El repositorio lo publica mradermacher, un autor habitual en la comunidad de cuantizacion GGUF, y esta pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.).

El modelo base cuenta con 8.791.592.960 parametros reales (segun los pesos safetensors del modelo original), lo que lo situa en la categoria de modelos de ~8-9B. La model card del repositorio es extremadamente escasa: solo incluye metadatos internos del proceso de cuantizacion y un enlace al modelo original. No se proporciona informacion sobre arquitectura detallada, contexto, datos de entrenamiento ni licencia en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo de IBM, util para investigacion sobre alineamiento y comportamiento de modelos; por otro, advierte de que la informacion publica es minima y de que la licencia no esta declarada en el repositorio, lo que supone un riesgo para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Granite 4.2 de IBM; detalles no confirmados en la informacion proporcionada) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card proporcionada. El nombre indica que deriva de Granite 4.2 8B, un modelo de IBM, pero no se confirman en la informacion disponible ni el tipo de transformer, ni el numero de capas, ni la ventana de contexto, ni la composicion del dataset de entrenamiento. Tampoco se documenta si el modelo base uso RLHF, DPO u otras tecnicas de alineamiento.

La unica innovacion tecnica documentada es el proceso de "abliteration": una modificacion de los pesos que elimina las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a ciertos prompts. Este proceso se aplica sobre el modelo original y luego se cuantiza a GGUF mediante las herramientas de llama.cpp (se observan metadatos `quantize_version: 2` y `output_tensor_quantised: 1`). No se especifica cuantos tokens se usaron en el entrenamiento original ni en el proceso de ablacion.

## Capacidades

- Generacion de texto conversacional en formato chat (tag `conversational` en el repositorio).
- Al no documentarse capacidades especificas, se asume que hereda las del modelo base Granite 4.2 8B, pero no se confirman en la informacion disponible: razonamiento, codigo, matematicas o vision no estan verificados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidad especial: comportamiento "abliterated", es decir, ausencia de rechazo ante peticiones que el modelo original rechazaria. Esto es una caracteristica tecnica, no una capacidad funcional adicional.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de activacion afecta al comportamiento de rechazo, comparando respuestas con el Granite 4.2 original en experimentos controlados.
- Evaluacion de robustez de filtros: util para probar sistemas de moderacion y clasificadores de contenido, ya que genera respuestas que un modelo alineado rechazaria, permitiendo medir la cobertura de los filtros.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de ~8,8B en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, con fines de experimentacion.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o dialogos que requieran contenido sensible, siempre que el usuario asuma la responsabilidad legal y etica.
- Pruebas de red teaming: generacion de prompts adversarios y respuestas para entrenar clasificadores de seguridad o evaluar la resistencia de sistemas de moderacion.
- Analisis de sesgos: al eliminar el rechazo, el modelo puede exponer sesgos latentes del modelo base que quedaban ocultos tras las respuestas de negativa, facilitando su estudio.
- Fine-tuning posterior: las cuantizaciones Q8_0 y x-f16 sirven como base para experimentos de ajuste o para comparar el efecto de la cuantizacion en el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y 8,79B parametros):
  - Q2_K: ~3,5 GB
  - Q3_K_M: ~4,5 GB
  - Q4_K_M: ~5,5 GB
  - Q5_K_M: ~6,5 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,5 GB
  - x-f16: ~17,5 GB
  (estimaciones orientativas; el tamano exacto depende de la implementacion y del contexto usado)
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100/H100 solo si se necesita throughput elevado o contexto muy largo.
- Cabe en GPU de consumo: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/granite-4.2-8b-abliterated-GGUF | 8,79B | no disponible | no disponible | GGUF | Variante abliterated, sin datos de benchmarks |
| Lonelyguyse1/granite-4.2-8b-abliterated | 8,79B | no disponible | no disponible | safetensors | Modelo original del que deriva esta cuantizacion |
| Granite 4.2 8B (IBM, modelo base) | ~8B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo alineado original; rechaza peticiones sensibles |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista de tamano similar, ampliamente cuantizada |

La comparativa es limitada porque no se dispone de datos de benchmarks ni de licencia del modelo evaluado. La diferencia principal frente al modelo base es la ausencia de rechazo, no un mejor rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al eliminar el rechazo, es probable que el modelo exponga sesgos del modelo base sin filtro, pero no se ha medido.
- Riesgo de alucinacion: no evaluado; sin benchmarks no se puede estimar la fiabilidad factual.
- Limitaciones de contexto o idioma: no disponibles; no se declara ventana de contexto ni idiomas soportados.
- Restricciones de licencia: la licencia no esta declarada en el repositorio, lo que impide verificar si el uso comercial esta permitido. Se debe consultar la licencia del modelo base Granite 4.2 de IBM antes de cualquier uso en produccion.
- El proceso de abliteration degrada potencialmente la calidad del modelo y elimina salvaguardas de seguridad; no es adecuado para aplicaciones orientadas al publico sin moderacion externa.
- La model card no incluye informacion sobre el proceso de cuantizacion mas alla de los metadatos internos; no se garantiza la fidelidad de las cuantizaciones bajas (Q2_K, Q3_K_S).
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Uso responsable: el contenido generado puede ser ofensivo, ilegal o danino; el usuario asume toda la responsabilidad legal y etica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/granite-4.2-8b-abliterated-GGUF
- Modelo original: https://huggingface.co/Lonelyguyse1/granite-4.2-8b-abliterated
- Modelo base Granite 4.2 de IBM: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
