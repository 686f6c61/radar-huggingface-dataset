# mradermacher/Mellum2.1-12B-A2.5B-Thinking-abliterated-i1-GGUF

## Resumen

Esta ficha corresponde a una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo Mellum2.1-12B-A2.5B-Thinking-abliterated, publicada por el cuantizador conocido mradermacher. El modelo base fue creado por el usuario ttennant y es una variante "abliterated" (con los mecanismos de rechazo de seguridad eliminados) de Mellum 2.1, un modelo de lenguaje con arquitectura MoE (mixture of experts) de 12,15 mil millones de parámetros totales, de los cuales aproximadamente 2,5 mil millones están activos por token. El sufijo "Thinking" indica que el modelo incorpora un modo de razonamiento explícito antes de responder.

La relevancia de esta publicación radica en la combinación de tres factores: un tamaño activo muy reducido (2,5B parámetros activos) que permite inferencia rápida en hardware de consumo, un modo de razonamiento tipo "thinking", y la ausencia de filtros de seguridad heredados del modelo base. Al tratarse de un repositorio de cuantizaciones, el valor añadido de mradermacher es la disponibilidad de más de veinte variantes de cuantización, desde IQ1_S (4,0 GB) hasta niveles superiores, lo que permite ejecutar el modelo en un espectro muy amplio de GPUs y CPUs. El modelo está licenciado bajo Apache 2.0 y su idioma principal es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), variante abliterated con modo thinking |
| Parametros totales | 12.149.923.072 (≈12,15B) |
| Parametros activos | ≈2,5B (según la nomenclatura A2.5B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S y otras variantes Q5/Q6/Q8 en el repo completo |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base esta en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base, Mellum2.1-12B-A2.5B-Thinking, emplea una arquitectura MoE: aunque alberga 12,15 mil millones de parametros en total, solo unos 2,5 mil millones se activan por token, lo que reduce drasticamente el coste computacional de la inferencia en comparacion con un modelo denso equivalente. La etiqueta "Thinking" senala que el modelo genera primero un razonamiento intermedio (chain-of-thought) antes de producir la respuesta final, una tecnica que mejora el rendimiento en tareas de logica, matematicas y planificacion multi-paso.

La variante "abliterated", creada por ttennant, aplica tecnicas de abliteration sobre el modelo original: una intervencion sobre las activaciones internas (tipicamente mediante analisis de direcciones de rechazo en el espacio de activaciones) que elimina el comportamiento de negacion entrenado por el proveedor original. No hay informacion publicada en la model card sobre el numero de tokens de preentrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Las cuantizaciones de mradermacher utilizan imatrix (matriz de importancia calculada sobre un corpus de calibracion), lo que permite cuantizaciones IQ con mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat (tag "conversational").
- Razonamiento explicito en modo "thinking": el modelo produce razonamiento intermedio antes de la respuesta final, util en matematicas, logica y tareas multi-paso.
- Sin filtros de seguridad: al ser abliterated, no rechaza peticiones que el modelo original bloquearia (esto es una caracteristica y tambien un riesgo, ver limitaciones).
- Eficiencia de inferencia: con solo ~2,5B de parametros activos, ofrece throughput elevado para su clase de modelo.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio y derivados.
- Soporte de tool calling / function calling: no disponible (sin confirmacion en la informacion proporcionada).
- Capacidades multilingues: limitadas al ingles segun la model card; el rendimiento en castellano no esta documentado.

## Casos de uso

- Chatbots locales sin censura para investigacion: permite estudiar el comportamiento de modelos sin alineamiento en entornos controlados, aprovechando el formato GGUF ejecutable en local sin enviar datos a terceros.
- Razonamiento matematico y logico en hardware modesto: el modo thinking combinado con solo 2,5B de parametros activos permite ejecutar tareas de razonamiento multi-paso en GPUs de consumo con latencias bajas.
- Experimentacion con abliteration: base practica para investigar como la abliteration afecta a la calidad, coherencia y seguridad del modelo comparandolo con el original.
- Prototipado rapido de agentes locales: su bajo coste por token permite iteraciones rapidas en pipelines de agentes multi-paso en una sola GPU de consumo, aunque sin soporte confirmado de tool calling.
- Despliegue en dispositivos con VRAM limitada: las variantes IQ1_S/IQ1_M (4,0-4,2 GB) permiten cargar el modelo en GPUs de 4-6 GB o incluso en equipos sin GPU dedicada.
- Generacion de contenido creativo sin restricciones: escritura de ficcion y guiones donde el usuario quiere evitar negaciones del modelo, ejecutado integramente en local.
- Evaluacion comparativa de cuantizaciones: con mas de veinte variantes disponibles, es util como banco de pruebas para medir la degradacion de calidad frente al tamano en cuantizaciones IQ frente a Q_K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye evaluaciones, y no hay datos de MMLU, HumanEval, GSM8K u otras metricas para el modelo base ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. IQ1_S ocupa 4,0 GB; IQ2_M, 5,1 GB; IQ3_M, 6,0 GB; IQ4_XS, 6,8 GB; Q4_K_S, 7,5 GB; Q4_K_M, 8,2 GB. Anade margen para el KV cache segun la longitud de contexto utilizada.
- GPUs recomendadas: cualquier GPU de consumo con 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) ejecuta comodo las variantes Q4_K_S/Q4_K_M. Con 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090) caben las cuantizaciones Q5 y superiores con contexto amplio.
- Consumer GPUs: si, es un modelo claramente orientado a hardware de consumo; incluso GPUs de 4-6 GB pueden ejecutar las variantes IQ1/IQ2, y CPUs modernas pueden ejecutarlo a velocidad razonable gracias a los 2,5B de parametros activos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en formato transformers puede desplegarse con vLLM o TGI, aunque para el repositorio de cuantizaciones GGUF lo habitual es llama.cpp.
- Latencia y throughput: no disponibles como cifras publicadas; el tamano activo de 2,5B parametros sugiere throughput elevado, tipico de modelos MoE con pocos expertos activos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-abliterated (esta ficha) | 12,15B | ≈2,5B | GGUF (imatrix) | Apache 2.0 | Abliterated, modo thinking, mas de 20 cuants |
| Qwen3-30B-A3B (base original de muchos MoE pequenos) | 30B | 3B | safetensors / GGUF | Apache 2.0 | Mayor contexto y ecosistema, mayor tamano en disco |
| OLMoE-1B-7B (AllenAI) | 7B | 1B | safetensors / GGUF | Apache 2.0 | Mas ligero, sin modo thinking documentado |

No hay datos de rendimiento publicados que permitan comparar calidad entre estos modelos; la tabla se limita a caracteristicas tecnicas verificables.

## Limitaciones y advertencias

- Modelo abliterated: los mecanismos de seguridad han sido eliminados deliberadamente. Puede generar contenido ofensivo, peligroso o ilegal ante peticiones que un modelo alineado rechazaria. Su uso requiere entornos controlados y responsabilidad legal del desplegador.
- Riesgo de alucinacion: no evaluado publicamente; al tratarse de una variante abliterated de un modelo sin benchmarks publicados en la informacion disponible, la fiabilidad factual es desconocida y probablemente inferior a la de modelos con alineamiento completo.
- Idioma: la model card declara solo ingles. El rendimiento en castellano no esta documentado y puede ser significativamente peor.
- Longitud de contexto: no especificada en la informacion proporcionada; verificar la configuracion de la plantilla antes de asumir contextos largos.
- Cuantizaciones agresivas: las variantes IQ1_S, IQ1_M e IQ2 estan marcadas por el propio autor como de calidad muy baja ("for the desperate", "very low quality"); para uso serio se recomienda Q4_K_S o superior.
- Licencia: Apache 2.0 permite uso comercial, pero la procedencia del modelo base abliterated (un derivado de terceros) puede introducir consideraciones legales adicionales sobre la cadena de derivacion.
- Sin soporte confirmado de tool calling ni de capacidades multimodales; no apto para pipelines que dependan de function calling nativo sin verificacion previa.

## Enlaces

- Repositorio de cuantizaciones (esta ficha): https://huggingface.co/mradermacher/Mellum2.1-12B-A2.5B-Thinking-abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Mellum2.1-12B-A2.5B-Thinking-abliterated-GGUF
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#Mellum2.1-12B-A2.5B-Thinking-abliterated-i1-GGUF
- Guia de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog oficial y demos: no disponible
