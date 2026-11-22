# mradermacher/Qwen3.8-27B-full-Uncensored-GGUF

## Resumen

Qwen3.8-27B-full-Uncensored-GGUF es una coleccion de cuantizaciones estáticas en formato GGUF del modelo 0xSojalSec/Qwen3.8-27B-full-Uncensored, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad. El modelo subyacente es una variante "abliterated" y "uncensored" de la familia Qwen3, con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones), orientada explicitamente a tareas de red-team y de investigacion en seguridad de IA. La cuantizacion la realiza mradermacher a partir de los pesos originales en safetensors, y el resultado se distribuye en multiples niveles de precision.

El interes de esta publicacion es doble. Por un lado, ofrece el modelo en un rango amplio de cuantizaciones (desde Q2_K de 11,0 GB hasta Q8_0 de 29,1 GB), lo que permite ejecutarlo en hardware de consumo y en entornos de servidor con recursos limitados. Por otro lado, incluye ficheros mmproj (multi-modal supplement) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidades multimodales de vision.

La licencia declarada es Apache 2.0, lo que facilita su uso comercial segun los terminos de dicha licencia. No obstante, al tratarse de una variante sin censura, su uso en produccion requiere evaluaciones de seguridad adicionales. El modelo esta etiquetado para ingles (`en`) como unico idioma soportado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer tipo Qwen3 (model_type: qwen3) |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; versiones imatrix en el repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base; tambien se referencia mlx |
| Tamano del repo | 190,8 GB |
| Modelo base | 0xSojalSec/Qwen3.8-27B-full-Uncensored |
| Libreria | transformers |
| Etiquetas destacadas | abliterated, uncensored, obliteratus, red-team, ai-safety-research |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base pertenece a la familia Qwen3 (`model_type: qwen3`), por lo que se trata de un transformer decoder-only. El autor del modelo base lo etiqueta como "abliterated", "uncensored" y "obliteratus", terminos que en la practica de la comunidad describen la aplicacion de tecnicas de abliteration (proyeccion de direcciones de rechazo en el espacio de activaciones) para reducir el comportamiento de rechazo del modelo original. No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La publicacion de mradermacher es una cuantizacion estatica (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) realizada a partir de los pesos en safetensors del modelo base. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (i1-GGUF). La presencia de ficheros mmproj sugiere que el modelo base incorpora un proyector multimodal para entrada de imagenes, aunque no se detalla la arquitectura de dicho proyector.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline declarado.
- Capacidades multimodales: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de imagenes en el modelo base.
- Comportamiento "uncensored": el modelo ha sido modificado para reducir los rechazos ante peticiones que el modelo original rechazaria, lo que lo hace adecuado para investigacion de seguridad y red-team.
- Etiquetado para investigacion en seguridad de IA (`ai-safety-research`, `red-team`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la informacion disponible.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Red-team de sistemas de IA: el modelo puede emplearse para generar prompts adversarios y respuestas que permitan evaluar la robustez de filtros de seguridad y clasificadores de contenido en pipelines propios, gracias a su comportamiento sin censura.
- Investigacion en alineacion y seguridad: util como sujeto de estudio para analizar como la abliteration afecta a la distribucion de respuestas y a las metricas de rechazo en comparacion con el modelo original.
- Evaluacion de mecanismos de defensa: permite probar guardrails, moderacion y sistemas de deteccion de contenido dañino frente a un modelo que no aplica rechazos por defecto.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (15,9 GB) y Q4_K_M (16,9 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, mediante llama.cpp u Ollama.
- Analisis de documentos con imagenes: gracias a los ficheros mmproj, puede usarse para tareas de descripcion de imagenes o extraccion de informacion visual en entornos controlados de investigacion.
- Experimentacion con cuantizaciones: la disponibilidad de 11 niveles de cuantizacion permite estudiar el impacto de la precision en la calidad de las respuestas y en las tasas de rechazo, un aspecto relevante en estudios de seguridad.
- Entornos aislados de generacion de texto en ingles: para tareas de sintesis o transformacion de texto donde se requiera un modelo de ~27 B ejecutable en local sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead aproximado de contexto y cache KV):
  - Q2_K (11,0 GB): aproximadamente 12-14 GB de VRAM.
  - Q3_K_M (13,6 GB): aproximadamente 15-17 GB de VRAM.
  - IQ4_XS (15,5 GB) y Q4_K_S (15,9 GB): aproximadamente 17-19 GB de VRAM.
  - Q4_K_M (16,9 GB): aproximadamente 18-20 GB de VRAM.
  - Q5_K_M (19,6 GB): aproximadamente 21-23 GB de VRAM.
  - Q6_K (22,5 GB): aproximadamente 24-26 GB de VRAM.
  - Q8_0 (29,1 GB): aproximadamente 31-33 GB de VRAM.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones hasta Q5_K_M o Q6_K con contexto moderado; A100 40 GB, A100 80 GB o H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI). Para el modelo base en safetensors, transformers; tambien se referencia mlx para Apple Silicon.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-full-Uncensored-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF, safetensors, mlx | Variante abliterated/uncensored, 11 cuantizaciones, mmproj multimodal |
| Modelo base 0xSojalSec/Qwen3.8-27B-full-Uncensored | 27,3 B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Qwen3 original (familia) | no disponible | no disponible | no disponible | no disponible | Modelo de referencia de la familia; no se dispone de datos concretos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteration elimina o reduce los rechazos, por lo que puede generar contenido dañino, ilegal o sesgado. No es apto para produccion orientada al usuario final sin guardrails adicionales.
- Riesgo elevado de alucinacion y de respuestas no veraces, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) donde la perdida de precision degrada la calidad.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada en la informacion disponible; no debe asumirse una ventana larga sin verificacion empirica.
- Licencia Apache 2.0: permite uso comercial segun sus terminos, pero el uso de un modelo sin censura puede incumplir politicas de plataformas, terminos de servicio de proveedores cloud o normativa aplicable en materia de contenido.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- El modelo esta etiquetado para investigacion en seguridad; su uso debe enmarcarse en entornos controlados y con supervision.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-full-Uncensored-GGUF
- Modelo base: https://huggingface.co/0xSojalSec/Qwen3.8-27B-full-Uncensored
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-full-Uncensored-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
