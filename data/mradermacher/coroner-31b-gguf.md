# mradermacher/coroner-31b-GGUF

## Resumen

Coroner 31b es un modelo de lenguaje de aproximadamente 30.700 millones de parámetros publicado en HuggingFace por el usuario `actuaryai` bajo el identificador `actuaryai/judge-31b`, y redistribuido en formato GGUF por `mradermacher`, un conocido conversor de pesos a llama.cpp con más de 3.400 modelos publicados. Esta ficha cubre concretamente la versión cuantizada (`mradermacher/coroner-31b-GGUF`), que incluye 13 variantes de cuantización más dos ficheros `mmproj` para un codificador multimodal.

El modelo está orientado, a juzgar por sus etiquetas (`token-risk`, `robinhood-chain`, `ai-agents`, `json`, `lora`), a tareas de análisis de riesgo de tokens y contratos en cadena, generación de JSON estructurado y uso como componente dentro de pipelines de agentes. El nombre "judge" del modelo base sugiere además un uso como evaluador automático (LLM-as-a-judge). No se ha publicado información técnica sobre arquitectura, datos de entrenamiento ni longitud de contexto en la documentación disponible.

La relevancia práctica de esta publicación es que permite ejecutar un modelo de 31B en hardware de consumo mediante cuantizaciones de 12 a 33 GB. Sin embargo, la ausencia de model card detallada, de benchmarks y de cualquier validación comunitaria (368 descargas y 0 likes en el momento de la consulta) obliga a tratar el modelo como experimental y a evaluarlo empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no especificada en la model card; los pesos se distribuyen en formato GGUF compatible con llama.cpp y en transformers) |
| Parametros totales | 30.697.345.596 (~30,7B), segun los safetensors del modelo base |
| Parametros activos | No disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0 y mmproj-f16 (y una variante f16 referida en los metadatos de cuantizacion) |
| Idiomas soportados | Ingles (`en` segun los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mas safetensors en el modelo base `actuaryai/judge-31b`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en `actuaryai/judge-31b`. La model card del repositorio GGUF es exclusivamente operativa: documenta el proceso de cuantizacion estatica, los ficheros generados y su tamano, sin describir el modelo.

Los unicos indicios tecnicos disponibles son indirectos. La presencia de ficheros `mmproj` (multi-modal projection) indica que el modelo base incorpora un codificador visual que permite procesar imagenes ademas de texto en llama.cpp. La etiqueta `lora` sugiere que el modelo se publico o se entreno con adaptadores de bajo rango, o que admite su uso. El autor de la cuantizacion indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicacion, por lo que todas las variantes ofrecidas son cuantizaciones estaticas, lo que en la practica implica una calidad algo inferior a la de un imatrix del mismo tamano.

Un sitio de terceros (`coronerai.pro`) afirma que el modelo se construye sobre "Gemma 4 31B" con licencia Apache 2.0, pero esta afirmacion no aparece en la documentacion de HuggingFace ni ha sido confirmada por el autor, y ademas entra en conflicto con el campo `base_model` de los metadatos (`actuaryai/judge-31b`). Se trata, por tanto, de informacion no verificada.

## Capacidades

- Generacion de texto conversacional (la etiqueta `conversational` aparece en los metadatos de HuggingFace).
- Generacion de JSON estructurado, segun la etiqueta `json` del repositorio, lo que apunta a un uso previsto en pipelines que requieren salida parseable.
- Procesamiento de imagenes: los ficheros `mmproj` permiten adjuntar un codificador visual y trabajar con entradas multimodales en llama.cpp.
- Uso como agente o componente de agentes, segun las etiquetas `ai-agents` y `robinhood-chain`.
- Analisis de riesgo de tokens, segun la etiqueta `token-risk`.
- Soporte de adaptadores LoRA (etiqueta `lora`).
- Funcion de evaluador o juez de respuestas, inferida del nombre del modelo base (`judge-31b`), no documentada explicitamente.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Analisis de riesgo de tokens y contratos en cadena: el modelo puede recibir los metadatos de un token (suministro, propietario, funciones del contrato, liquidez) y devolver un informe estructurado en JSON con factores de riesgo, aprovechando las etiquetas `token-risk` y `robinhood-chain` de su publicacion.
- Evaluacion automatica de respuestas (LLM-as-a-judge): dado el nombre del modelo base, encaja como evaluador de pares de respuestas generadas por otros modelos, con salida en JSON con puntuaciones por criterio, integrable en un pipeline de evaluacion offline.
- Enrutado y clasificacion en sistemas de agentes: su capacidad declarada de generar JSON lo hace utilizable como primer eslabon de un agente que debe clasificar la intencion del usuario y emitir una llamada a herramienta en formato estructurado.
- Despliegue local en entornos aislados: al distribuirse en GGUF con cuantizaciones de 12 a 33 GB, puede ejecutarse en una estacion de trabajo sin conexion con llama.cpp u Ollama, lo que resulta adecuado para auditorias con datos sensibles que no pueden salir de la red corporativa.
- Analisis de capturas y paneles: gracias al fichero `mmproj`, se le pueden pasar capturas de exploradores de bloques o dashboards financieros junto con una pregunta en texto, y obtener una descripcion o extraccion de datos.
- Generacion de informes post-mortem de proyectos: alineado con el nombre "coroner", puede redactar informes estructurados sobre el ciclo de vida de un token o proyecto a partir de datos historicos aportados en el prompt.
- Base para fine-tuning con LoRA: al estar publicado como modelo base con etiqueta `lora` y licencia Apache 2.0, puede servir como punto de partida para adaptaciones a dominios concretos sin restricciones de uso comercial derivadas de la licencia.
- Prototipado de agentes multi-paso en local: 30B con ventana de contexto no documentada permite experimentar con razonamiento encadenado en hardware de una sola GPU, siempre que se validen previamente los limites reales de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto reducido): Q2_K ~12 GB, Q3_K_S ~14 GB, Q4_K_S ~18 GB, Q4_K_M ~19 GB, Q5_K_M ~22 GB, Q6_K ~25 GB, Q8_0 ~33 GB, f16 ~61 GB (estimacion a 2 bytes por parametro).
- GPU de 24 GB (RTX 3090, RTX 4090, A5000): caben Q4_K_M y Q5_K_S con contexto moderado; Q6_K y Q8_0 requieren reducir capas en GPU u offload a CPU.
- GPU de 40-48 GB (A100 40 GB, A6000, L40S): Q6_K y Q8_0 completos en VRAM, con margen para contexto amplio.
- GPU de 80 GB (A100 80 GB, H100): f16 completo, util para fine-tuning o evaluacion de maxima fidelidad.
- Consumer GPU: si, es viable en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 12-16 GB solo con Q2_K/Q3_K y offload parcial, con degradacion notable de calidad y velocidad.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama y LM Studio para uso local, koboldcpp; llama-cpp-python para integracion en aplicaciones; vLLM soporta GGUF de forma experimental pero no es la ruta recomendada para este formato. La model card apunta a las guias de TheBloke para el manejo de ficheros multiparte.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| coroner-31b-GGUF (esta ficha) | ~30,7B | No disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas, sin imatrix; multimodal via mmproj |
| actuaryai/judge-31b (modelo base) | ~30,7B | No disponible | Apache 2.0 (segun metadatos del derivado) | safetensors | Mismo modelo sin cuantizar; sin model card publica detallada |
| Qwen2.5-32B-Instruct | ~32,8B | 32.768 tokens nativos (ampliable) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada, multilingue, con benchmarks publicos y amplio soporte de herramientas |
| Gemma 2 27B | ~27B | 8.192 tokens | Gemma License | safetensors, GGUF | Menor contexto y licencia con condiciones de uso adicionales |
| Mistral Small 3 24B | ~24B | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Menor numero de parametros, licencia permisiva y buen soporte de function calling |

La comparativa se limita a datos publicos de las respectivas model cards. No se dispone de resultados de benchmarks del modelo evaluado que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan arquitectura, datos de entrenamiento, contexto ni alineacion, lo que impide evaluar riesgos de sesgo o contaminacion de datos.
- Solo ingles declarado: no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto desconocida: cualquier diseno que dependa de ventanas largas debe validarse empiricamente.
- Riesgo de alucinacion especialmente critico en el dominio previsto (datos financieros y on-chain): las cifras, direcciones de contrato y analisis de riesgo deben verificarse siempre contra la fuente on-chain.
- Divergencia sobre el modelo base: los metadatos apuntan a `actuaryai/judge-31b`, mientras que un sitio de terceros afirma que se basa en Gemma 4 31B. Si el modelo base real fuese Gemma, la licencia Apache 2.0 declarada en el derivado podria ser incorrecta y las condiciones de uso comercial cambiarian. Conviene aclararlo antes de un uso comercial.
- Cuantizaciones estaticas sin imatrix: las variantes de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad mas de lo habitual en cuantizaciones ponderadas.
- Validacion comunitaria practicamente nula: 368 descargas y 0 likes, sin discusiones ni reportes de terceros.
- Anomalia en los metadatos: las fechas de creacion y actualizacion del repositorio (20 y 24 de octubre de 2026) son posteriores a la fecha de esta ficha, lo que sugiere un error de registro y desaconseja tomar los metadatos temporales como referencia.
- El repositorio ocupa 213,9 GB en total; conviene descargar unicamente el fichero de cuantizacion necesario y no clonar el repositorio completo.
- Los ficheros `mmproj` solo son utiles si se usa el pipeline multimodal de llama.cpp; en clientes que no lo soportan, el modelo se comporta como texto puro.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/coroner-31b-GGUF
- Modelo base: https://huggingface.co/actuaryai/judge-31b
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#coroner-31b-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del proyecto (no verificado): https://www.coronerai.pro/
- Ficha de terceros (no verificada): https://free2aitools.com/model/coronerai/coroner-31b
- Listado de modelos GGUF de mradermacher: https://graysoft.dev/authors/m/mradermacher.html
