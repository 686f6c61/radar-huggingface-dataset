# mradermacher/Sophea-Qwen3.6-v1.1-GGUF

## Resumen

Sophea-Qwen3.6-v1.1-GGUF es la version cuantizada en formato GGUF del modelo ayoubkirouane/Sophea-Qwen3.6-v1.1, publicada por mradermacher, un autor conocido por generar cuantizaciones estaticas de modelos recientes para su uso con llama.cpp y derivados. El modelo base es un derivado de la familia Qwen3.6 con arquitectura de mezcla de expertos (MoE) y capacidades multimodales, segun los metadatos del repositorio, con un total de 35.505.251.456 parametros (aproximadamente 35,5 mil millones).

La especial caracteristica de este modelo es su orientacion al griego (codigo de idioma `el`) junto con el ingles, etiquetada como "language-matched", y su enfasis en razonamiento explicito ("reasoning", "thinking") con un proceso de ajuste mediante RLVR (reinforcement learning with verifiable rewards). Esto lo situa en la categoria de modelos de razonamiento multilingues, un nicho poco cubierto para el griego moderno.

La relevancia practica de esta publicacion es que traduce un modelo de 35,5B parametros con vision a cuantizaciones que caben en GPU de consumo, con el quant Q4_K_S ocupando 20,5 GB y el Q2_K solo 13,3 GB. No obstante, el repositorio no incluye model card descriptiva del entrenamiento, ni benchmarks, ni documentacion sobre la longitud de contexto o el numero de parametros activos, por lo que gran parte de las especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) segun los tags del repositorio; familia Qwen3.6; multimodal (requiere fichero mmproj). Detalles de capas y atencion: no disponible |
| Parametros totales | 35.505.251.456 (aprox. 35,5B), dato de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ficheros publicados: Q2_K (13,3 GB), Q4_K_S (20,5 GB), Q8_0 (37,9 GB). Anunciados en metadatos pero no listados en la tabla de ficheros: f16, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS. Proyector multimodal: mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) |
| Idiomas soportados | Griego moderno (el) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base usa transformers/safetensors |
| Autor de la cuantizacion | mradermacher |
| Modelo base | ayoubkirouane/Sophea-Qwen3.6-v1.1 |
| Tamano del repositorio | 153,4 GB |
| Fecha de publicacion | 16 de septiembre de 2026 (creacion), actualizado el mismo dia |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los metadatos del repositorio indican que el modelo base emplea una arquitectura de mezcla de expertos (MoE) dentro de la familia Qwen3.6, con 35,5 mil millones de parametros totales. Al tratarse de una cuantizacion, la informacion sobre el numero de parametros activos por token, el numero de expertos, la dimension oculta o el mecanismo de atencion no aparece en la documentacion disponible. La presencia de ficheros `mmproj` (proyector multimodal) confirma que el modelo incorpora un codificador visual que se proyecta al espacio de embeddings del transformer de lenguaje, por lo que admite entradas de imagen ademas de texto.

En cuanto al entrenamiento, los unicos indicios son las etiquetas del repositorio: "reasoning", "thinking", "rlvr" y "language-matched". Esto sugiere una fase de ajuste con aprendizaje por refuerzo con recompensas verificables orientada a tareas de razonamiento, y un proceso de alineacion especifico para igualar el rendimiento entre griego e ingles. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como DPO o RLHF adicionales. Tampoco se documentan innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en griego moderno e ingles, segun los idiomas declarados.
- Razonamiento explicito con modo de pensamiento ("thinking"), inferido de las etiquetas del repositorio.
- Ajuste orientado a razonamiento verificable (RLVR) para tareas con respuesta comprobable, como matematicas o logica.
- Procesamiento multimodal de imagenes: la presencia de ficheros `mmproj-f16` y `mmproj-Q8_0` confirma soporte de entrada visual en llama.cpp.
- Capacidades multilingues limitadas a griego e ingles; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, aunque el modo de pensamiento es compatible con este tipo de flujos.
- Capacidades especiales: modo de razonamiento (thinking) y vision. No se documenta soporte de audio.

## Casos de uso

- Atencion al cliente en griego: el modelo puede gestionar conversaciones multi-turno en griego moderno con calidad equiparable a la de sus respuestas en ingles, algo poco habitual en modelos abiertos y util para empresas que operan en el mercado heleno.
- Extraccion de datos de documentos escaneados: combinando la entrada multimodal con el razonamiento en griego, permite procesar facturas, formularios y contratos en griego e incorporar los campos extraidos a un sistema de gestion.
- Asistencia juridica y administrativa en Grecia: resumen y comparacion de textos legales o administrativos griegos, aprovechando el ajuste "language-matched" para reducir mezclas de idioma y errores de terminologia.
- Tutorizacion de matematicas y fisica: el modo de pensamiento y el ajuste con recompensas verificables lo hacen adecuado para generar resoluciones paso a paso y verificar respuestas numericas.
- Analisis de imagenes tecnicas con explicacion en griego: por ejemplo, interpretacion de diagramas, captures de pantalla o graficos y generacion de explicaciones textuales en griego para documentacion interna.
- Traduccion asistida griego-ingles con justificacion: al ser un modelo bilingue con razonamiento, puede producir traducciones acompanadas de notas sobre ambiguedades y elecciones terminologicas.
- Despliegue en infraestructura limitada: gracias a las cuantizaciones GGUF de 13,3 y 20,5 GB, puede ejecutarse en estaciones de trabajo con una sola GPU de 16 o 24 GB mediante llama.cpp u Ollama, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de la cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y la model card se limita a describir los ficheros GGUF ofrecidos. Los resultados de busqueda web realizados no devolvieron informacion tecnica relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar cache KV ni contexto):
  - Q2_K: aproximadamente 13,3 GB de pesos, en torno a 14-16 GB de VRAM con contexto moderado.
  - Q4_K_S: aproximadamente 20,5 GB de pesos, en torno a 22-25 GB de VRAM con contexto moderado.
  - Q8_0: aproximadamente 37,9 GB de pesos, en torno a 40-44 GB de VRAM.
  - Proyector multimodal adicional: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) cuando se usa entrada de imagen.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_S; A6000, L40S o A100 40 GB para Q8_0; para Q2_K es suficiente una GPU de 16 GB como RTX 4080, RTX 4060 Ti 16 GB o RTX A4000.
- Uso en GPU de consumo: si, el quant Q2_K cabe en tarjetas de 16 GB y el Q4_K_S en tarjetas de 24 GB. El Q8_0 queda fuera del rango de consumo de una sola tarjeta.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son los soportados de forma nativa por el formato GGUF. vLLM y TGI no cargan GGUF directamente; requeririan el modelo base en safetensors.
- Latencia y throughput: no disponible. Al ser una arquitectura MoE con parametros activos desconocidos, no es posible estimar razonablemente la velocidad por token.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophea-Qwen3.6-v1.1 (este) | 35,5B | no disponible | no disponible | apache-2.0 | GGUF y base en HF |
| Qwen3-30B-A3B | 30,5B | 3,3B | 128K (segun documentacion publica de Qwen) | apache-2.0 | safetensors, GGUF de terceros |
| Qwen3-32B | 32,8B | denso | 128K (segun documentacion publica de Qwen) | apache-2.0 | safetensors, GGUF de terceros |
| Gemma 3 27B | 27B | denso | 128K (segun documentacion publica de Google) | Gemma Terms | safetensors, GGUF de terceros |

La comparacion con alternativas de la misma categoria debe tomarse con cautela: no hay datos publicos de rendimiento para Sophea-Qwen3.6-v1.1, por lo que no es posible establecer una jerarquia de calidad frente a Qwen3-30B-A3B, Qwen3-32B o Gemma 3 27B. La diferencia principal de Sophea es su especializacion en griego y su ajuste de razonamiento, frente al enfoque multilingue generalista de las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que su uso en produccion requiere una evaluacion propia previa.
- Riesgo de alucinacion inherente a los modelos generativos, no mitigado por ninguna salvaguarda documentada.
- Idiomas limitados a griego e ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin medirla previamente.
- Parametros activos desconocidos: impide estimar latencia y coste de inferencia, lo que complica el dimensionamiento de infraestructura.
- Las cuantizaciones de baja precision (Q2_K) degradan notablemente la calidad y, en modelos de razonamiento, pueden afectar de forma especial a la coherencia de las cadenas de pensamiento.
- El autor de la cuantizacion indica que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicacion, lo que suele implicar una perdida de calidad algo mayor en los quants bajos.
- Fecha de creacion del repositorio poco habitual (septiembre de 2026) y cero descargas y likes: no hay comunidad que haya validado el modelo.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no documentadas en el repositorio de la cuantizacion.
- El tag `arxiv:2608.17744` apunta a un identificador de arXiv que no ha podido verificarse con la informacion disponible.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/Sophea-Qwen3.6-v1.1-GGUF
- Modelo base: https://huggingface.co/ayoubkirouane/Sophea-Qwen3.6-v1.1
- Pagina de descargas del autor: https://hf.tst.eu/model#Sophea-Qwen3.6-v1.1-GGUF
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2608.17744
- Guia de uso de ficheros GGUF (referencia del autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia la cuantizacion: https://www.nethype.de/

Nota: los resultados de busqueda web proporcionados no contenian informacion tecnica relevante sobre el modelo (correspondian a paginas de ayuda de YouTube), por lo que no se han incluido en esta seccion.
