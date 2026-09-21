# KasugaiSakura/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una distribucion en formato GGUF de un modelo de lenguaje denso de 27.000 millones de parametros con encoder de vision, derivada del modelo base Qwen/Qwen3.8-27B. La publica el usuario KasugaiSakura (el contenido de la model card remite a la organizacion HauhauCS) bajo licencia Apache 2.0, e incorpora un perfil de "descensura" denominado Aggressive, orientado a eliminar negativas y preambulos en peticiones dificiles, ademas de una aceleracion propietaria llamada HauhauCS FastMTP.

Tecnicamente es un transformer hibrido: 64 capas, de las cuales 48 son capas Gated DeltaNet y solo 16 son capas de atencion con puerta (gated attention). Mantiene la cabeza MTP/NextN nativa del modelo base para decodificacion especulativa, y anade un sidecar FastMTP de 32K que, segun el autor, multiplica por hasta 3,02x la generacion de tokens en documentos y por hasta 1,93x en razonamiento respecto a una ejecucion sin MTP. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

Es relevante porque combina tres cosas poco habituales en una sola distribucion GGUF: capacidades multimodales (texto, imagen y video via proyector BF16 separado), un preset de cuantizacion propio (K_P, "Perfect") que el autor situa uno o dos niveles de calidad por encima del quant base con solo un 5-15% mas de tamano, y un mecanismo de aceleracion de inferencia especifico para llama.cpp y runtimes compatibles. El repo ocupa 172,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal hibrido con vision encoder: 64 capas de lenguaje, de las cuales 48 son Gated DeltaNet y 16 son capas de atencion con puerta; incluye cabeza MTP/NextN embebida |
| Parametros totales | 27.000 millones nominales segun la model card; los metadatos de safetensors del repo declaran 1.863.907.840 (1,86 B). Discrepancia no aclarada por el autor |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensibles hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M (K_P son cuantizaciones personalizadas del autor) |
| Idiomas soportados | Ingles, chino y multilingue (segun etiquetas del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF unicamente (texto, proyector de vision BF16 y sidecar FastMTP en ficheros separados) |

Datos adicionales de arquitectura declarados por el autor: tamano de capa oculta 5.120, tamano de FFN 17.408, vocabulario con padding de 248.320 tokens.

Tabla de ficheros publicados:

| Fichero | Cuantizacion | BPW | Tamano |
|---|---|---:|---:|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf | Q8_K_P | 9,21 | 31,46 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q6_K_P.gguf | Q6_K_P | 7,59 | 25,92 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_K_P.gguf | Q5_K_P | 5,92 | 20,22 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf | Q4_K_P | 5,25 | 17,92 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS.gguf | IQ4_XS | 4,60 | 15,71 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q3_K_P.gguf | Q3_K_P | 3,93 | 13,44 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_M.gguf | IQ3_M | 3,74 | 12,79 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_XS.gguf | IQ3_XS | 3,56 | 12,18 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q2_K_P.gguf | Q2_K_P | 3,12 | 10,68 GB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ2_M.gguf | IQ2_M | 3,02 | 10,32 GB |
| mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf | Proyector de vision | No disponible | 931 MB |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf | Sidecar FastMTP | No disponible | 903 MB |

El BPW indicado es la media del payload de tensores del modelo de texto completo, incluidos los tensores MTP embebidos. El proyector y el sidecar FastMTP funcionan con todas las cuantizaciones de texto; el proyector solo es necesario para entrada de imagen o video.

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento. El autor indica explicitamente que "no hay cambios en los datasets ni en las capacidades previstas" respecto a Qwen3.8-27B: la distribucion conserva las capacidades de texto, razonamiento, agentica, imagen y video del modelo base y unicamente aplica el perfil de ajuste Aggressive. No se especifica numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF, DPO u otras.

Arquitecturalmente, lo destacable es la mezcla de capas: 48 de las 64 capas son Gated DeltaNet (un mecanismo de estado recurrente con puerta) y solo 16 son capas de atencion con puerta. Esta proporcion 3:1 reduce el coste del cache de clave/valor frente a un transformer de atencion completa del mismo tamano, porque solo una cuarta parte de las capas mantiene estado de atencion clasico. Sobre esa base se conserva la cabeza MTP/NextN nativa del modelo, que permite decodificacion especulativa con multiples tokens candidatos por paso.

El componente diferencial anadido por el autor es HauhauCS FastMTP: un sidecar de 903 MB, entrenado para un perfil de 32K, que se suma al MTP embebido. El autor afirma que rinde hasta 35,2% mas de velocidad de generacion en documentos y 21,1% mas en razonamiento que el MTP embebido estandar. Las cuantizaciones K_P se describen como perfiles derivados de analisis especifico del modelo, que preservan de forma selectiva las capas mas sensibles a la cuantizacion; el autor situa su calidad uno o dos niveles por encima del quant equivalente a cambio de un 5-15% mas de tamano. Los ficheros siguen siendo GGUF estandar y no requieren builds ni plugins especiales.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con el modo de pensamiento propio del modelo base.
- Comprension de imagen y video mediante el proyector BF16 opcional (pipeline image-text-to-text).
- Capacidades agenticas heredadas del modelo base, segun declara el autor.
- Conversacion multiturno con contexto nativo de 262.144 tokens y extension hasta 1.000.000.
- Soporte multilingue: ingles, chino y otros idiomas (sin listado detallado).
- Salida directa sin negativas en el perfil Aggressive: el autor reporta 0/465 negativas en su evaluacion.
- Decodificacion especulativa integrada en dos niveles: cabeza MTP/NextN nativa mas sidecar FastMTP de 32K.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible; la model card solo alude a "capacidades agenticas" sin detallar.

## Casos de uso

- Generacion de documentos largos y pipelines de redaccion tecnica: el modelo combina un contexto nativo de 262.144 tokens con el perfil FastMTP, que el autor orienta especificamente a carga de trabajo de tipo documento con hasta 3,02x de velocidad de generacion.
- Inferencia local en estaciones de trabajo con GPU de consumo: las cuantizaciones IQ3_XS (12,18 GB) y Q3_K_P (13,44 GB) permiten cargar el modelo completo en GPUs de 16 GB, algo inviable con el modelo en BF16.
- Analisis de documentacion con imagenes (diagramas, capturas, esquemas): usando el proyector BF16 de 931 MB, el modelo acepta entrada image-text-to-text y puede extraer informacion de capturas junto a texto tecnico.
- Revision de video corto o fotogramas clave: el proyector habilita entrada de video segun la model card, util para resumen de material audiovisual o extraccion de eventos.
- Asistentes conversacionales sin capa de rechazo: para productos donde las negativas genericas del modelo base rompen la experiencia, el perfil Aggressive evita preambulos y respuestas evasivas, con el caveat de que requiere filtrado propio aguas abajo.
- Procesamiento de corpus largos en lote sin conexion a Internet: el formato GGUF con llama.cpp permite ejecutar el modelo en hardware propio, util en entornos con requisitos de confidencialidad de datos.
- Experimentacion con decodificacion especulativa: el sidecar FastMTP separado permite comparar directamente el rendimiento con y sin aceleracion sobre el mismo checkpoint, sin cambiar de runtime.
- Despliegue en chino e ingles dentro de la misma instancia: el soporte declarado de ambos idiomas y de contenido multilingue evita mantener dos modelos separados para mercados distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y los resultados de busqueda web devueltos no contienen informacion relacionada con el modelo.

Los unicos datos de rendimiento publicados son relativos a velocidad de generacion de tokens (TG), no a calidad:

| Medicion | Mejora declarada | Referencia de comparacion |
|---|---|---|
| TG en documentos | Hasta 3,02x | Sin MTP |
| TG en razonamiento | Hasta 1,93x | Sin MTP |
| TG en documentos | Hasta +35,2% | MTP embebido estandar |
| TG en razonamiento | Hasta +21,1% | MTP embebido estandar |
| Tasa de negativas | 0/465 | Evaluacion propia del autor |

No se especifica el hardware, la configuracion de cuantizacion ni la metodologia empleados en estas mediciones, por lo que no son reproducibles con la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun el fichero (solo pesos de texto; hay que sumar cache KV, proyector y sidecar): Q8_K_P 31,46 GB; Q6_K_P 25,92 GB; Q5_K_P 20,22 GB; Q4_K_P 17,92 GB; IQ4_XS 15,71 GB; Q3_K_P 13,44 GB; IQ3_M 12,79 GB; IQ3_XS 12,18 GB; Q2_K_P 10,68 GB; IQ2_M 10,32 GB.
- Componentes adicionales: proyector de vision BF16 931 MB (solo si se usa entrada de imagen o video) y sidecar FastMTP 903 MB.
- Cache KV: no cuantificado en la informacion disponible. El consumo es menor que en un transformer de atencion completa equivalente porque solo 16 de las 64 capas mantienen estado de atencion, pero a 262.144 tokens de contexto sigue siendo el factor dominante de VRAM. No se publican cifras concretas.
- GPU recomendadas: no disponibles. Por tamano de fichero, las cuantizaciones Q8_K_P y Q6_K_P requieren GPUs de 40-48 GB o superiores (A100 80 GB, H100, RTX A6000 48 GB). Q5 y Q4 encajan en GPUs de 24 GB (RTX 3090, RTX 4090).
- Cabe en GPU de consumo: si, en el rango IQ2_M a Q4_K_M. Con 12 GB de VRAM (RTX 3060 12 GB, RTX 4070) son viables IQ3_XS e IQ3_M. Con 16 GB (RTX 4060 Ti 16 GB, RTX 4080) son viables Q3_K_P e IQ4_XS. Con 24 GB (RTX 3090, RTX 4090) son viables Q4_K_P y Q5_K_P. Con 8 GB no cabe ninguna cuantizacion completa; requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF, segun el autor. El autor advierte que el widget de compatibilidad de hardware de Hugging Face puede no reconocer los quants K_P, y que LM Studio puede mostrar "?" en la columna de cuantizacion (problema de visualizacion, no de carga). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no se publican valores absolutos en tokens por segundo. Solo se declaran mejoras relativas (hasta 3,02x frente a ejecucion sin MTP).

## Comparativa con modelos similares

La informacion disponible no permite comparar con alternativas de terceros porque no hay datos de benchmarks ni de rendimiento absoluto. Comparativa limitada a las variantes internas de esta publicacion:

| Variante | Tamano | Contexto | Aceleracion | Licencia |
|---|---:|---|---|---|
| Q8_K_P (esta publicacion) | 31,46 GB | 262.144 tokens | MTP embebido + FastMTP 32K | Apache 2.0 |
| Q4_K_P (esta publicacion) | 17,92 GB | 262.144 tokens | MTP embebido + FastMTP 32K | Apache 2.0 |
| IQ2_M (esta publicacion) | 10,32 GB | 262.144 tokens | MTP embebido + FastMTP 32K | Apache 2.0 |
| Qwen/Qwen3.8-27B (modelo base) | No disponible | No disponible | No disponible | No disponible |

Comparativa con modelos de otros autores (Llama, Mistral, DeepSeek, etc.): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: la model card declara un modelo denso de 27.000 millones de parametros, pero los metadatos de safetensors del repo indican 1.863.907.840. El autor no explica la diferencia. Conviene verificar el modelo antes de planificar recursos.
- La model card no documenta el entrenamiento: no hay datos de tokens, composicion del dataset, tecnicas de alineacion ni evaluaciones de sesgo. Es imposible auditar el origen del ajuste.
- El perfil Aggressive elimina deliberadamente el comportamiento de rechazo (0/465 negativas segun el autor). Esto implica que el modelo puede generar contenido danino, ilegal o inseguro sin filtro propio. Cualquier despliegue en produccion necesita una capa de moderacion externa.
- Riesgo de alucinacion: no evaluado ni documentado. Un ajuste que prioriza respuestas directas sin preambulo tiende a reducir las expresiones de incertidumbre, lo que puede agravar el problema en dominios facticos.
- El autor recomienda el perfil Balanced, no este, para trabajo agentico de contexto largo critico para la fiabilidad, lo que sugiere que Aggressive puede degradar el rendimiento en tareas de multiples pasos con contexto extenso.
- Idiomas: se declaran ingles, chino y multilingue, sin lista completa ni evaluacion por idioma. El rendimiento en castellano no esta verificado y probablemente sea inferior al de ingles y chino.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-09-20). No hay validacion independiente de la comunidad.
- Los enlaces de descarga de la model card apuntan a la organizacion HauhauCS, mientras que el repositorio consultado pertenece a KasugaiSakura. Conviene confirmar que ambos repositorios sirven los mismos ficheros.
- Los quants K_P son un perfil de cuantizacion propietario del autor, sin validacion externa publica de la mejora de calidad que se les atribuye.
- Las metricas de aceleracion FastMTP son afirmaciones del autor sin metodologia, hardware ni configuracion publicados. No son reproducibles ni verificables.
- Extension de contexto hasta 1.000.000 de tokens: no se documenta el metodo de extension, el impacto en calidad ni la penalizacion de rendimiento. Tratarlo como capacidad no verificada.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del modelo base Qwen3.8-27B debe verificarse de forma independiente, ya que la model card no la reproduce.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KasugaiSakura/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Fichero Q8_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Fichero Q6_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q6_K_P.gguf
- Fichero Q5_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_K_P.gguf
- Fichero Q4_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
- Fichero IQ4_XS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS.gguf
- Fichero Q3_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q3_K_P.gguf
- Fichero IQ3_M: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_M.gguf
- Fichero IQ3_XS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ3_XS.gguf
- Fichero Q2_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q2_K_P.gguf
- Fichero IQ2_M: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ2_M.gguf
- Proyector de vision BF16: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf
- Sidecar FastMTP 32K: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf
- Paper, blog o repositorio adicional: no disponible. Los resultados de busqueda web consultados no contienen informacion relacionada con el modelo.
