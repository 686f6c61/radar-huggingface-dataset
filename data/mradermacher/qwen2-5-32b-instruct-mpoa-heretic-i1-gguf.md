# mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic, un derivado "abliterated" (decensored/heretic) del Qwen2.5-32B-Instruct de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un perfil conocido por publicar versiones GGUF con ficheros imatrix para inferencia local en llama.cpp y entornos compatibles. El modelo conserva la arquitectura transformer densa de Qwen2.5 y sus 32.763.876.352 parametros totales, pero con las capas de rechazo y alineacion de seguridad atenuadas mediante tecnicas de abliteration.

El interes practico de esta ficha no esta en la innovacion arquitectonica (es un Qwen2.5-32B estandar) sino en la combinacion de tres factores: un modelo de 32B con capacidades de instruccion y chat, una version sin los filtros habituales de rechazo, y un catalogo amplio de cuantizaciones (desde i1-IQ1_S de 7,4 GB hasta i1-Q6_K de 27,0 GB) que permiten desplegarlo en hardware muy diverso. El repo ocupa 351,5 GB e incluye tanto quants estaticos como quants con imatrix.

Es relevante ahora porque permite ejecutar un modelo de 32B en GPUs de consumo con cuantizaciones Q4, y porque el caso de uso "uncensored" interesa a investigadores que estudian comportamiento de modelos, red teaming y evaluacion de sesgos. Conviene subrayar que el modelo base declarado es Qwen2.5-32B-Instruct, con licencia Apache 2.0, aunque el autor del quant etiqueta tambien openrail++ en los tags, lo que genera ambiguedad que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-32B-Instruct); detalles finos no disponibles en la informacion proporcionada |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta contexto largo, pero el dato no se confirma en esta ficha) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 (con tags openrail++ en la model card; verificar antes de uso comercial) |
| Formato de pesos | GGUF (quants i1 con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer denso de 32.763.876.352 parametros. La informacion proporcionada no detalla el numero de capas, dimensiones ocultas, atencion (GQA/MHA) ni el dataset de entrenamiento original. Lo que si se sabe es que el modelo intermedio richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic aplica tecnicas de abliteration (eliminacion o atenuacion de direcciones de rechazo en el espacio de activaciones) sobre el Qwen2.5-32B-Instruct, con el objetivo de reducir los rechazos a peticiones que el modelo original declinaria. El sufijo "MPOA" y "heretic" corresponden a la nomenclatura del autor del modelo intermedio y no se detallan en la informacion disponible.

La cuantizacion la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando quants i1 con fichero imatrix para mejorar la calidad a igual tamano. El repo incluye tambien una variante estatica en mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matematicas: el modelo base Qwen2.5-32B-Instruct tiene capacidades notables en tareas de razonamiento, aunque el efecto de la abliteration sobre estas no esta cuantificado en la informacion disponible.
- Generacion de codigo: el modelo base soporta generacion y explicacion de codigo; no se confirma en esta ficha el soporte especifico de tool calling o function calling tras la abliteration.
- Modo "uncensored/decensored": reduce los rechazos a peticiones que el modelo original declinaria; util para investigacion de alineacion y red teaming.
- Multilingue: la model card declara solo "en"; el modelo base Qwen2.5 soporta multiples idiomas, pero no se confirma el mantenimiento de esa cobertura en este derivado.
- No se documentan capacidades de vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion de alineacion y red teaming: el modelo permite estudiar como responde un 32B cuando se atenuan las capas de rechazo, comparando respuestas con el Qwen2.5-32B-Instruct original en el mismo prompt y configuracion.
- Evaluacion de sesgos y robustez: al eliminar los filtros de rechazo, se pueden generar respuestas que el modelo original bloquea, lo que facilita construir datasets de evaluacion de seguridad y analizar patrones de sesgo.
- Despliegue local en estaciones de trabajo con GPU de consumo: con la cuantizacion i1-Q4_K_M (20,0 GB) cabe en GPUs de 24 GB como la RTX 4090, permitiendo un asistente de chat privado sin dependencia de API.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, dialogos o escenarios que el modelo original rechazaria por politicas de contenido; el modelo es adecuado por su tamano y capacidad de instruccion, pero requiere revision editorial humana.
- Prototipado de asistentes conversacionales: la cuantizacion i1-Q4_K_S (18,9 GB) ofrece un equilibrio tamano/velocidad/calidad para iterar rapidamente en local con llama.cpp u Ollama.
- Experimentos de cuantizacion y evaluacion de calidad: el repo incluye imatrix y quants desde IQ1 hasta Q6, lo que permite medir la degradacion de calidad a distintos niveles de compresion sobre un mismo modelo base.
- Fine-tuning o destilacion sobre un modelo sin filtros: util para investigadores que necesitan un modelo base que no rechace ejemplos de entrenamiento por politicas de contenido, con la advertencia de que el resultado hereda los sesgos del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, aproximando pesos + overhead de contexto):
  - i1-IQ1_S (7,4 GB): ~8-9 GB de VRAM.
  - i1-IQ2_M (11,4 GB): ~12-13 GB de VRAM.
  - i1-IQ3_M (14,9 GB): ~16-17 GB de VRAM.
  - i1-Q4_K_M (20,0 GB): ~21-22 GB de VRAM.
  - i1-Q5_K_M (23,4 GB): ~25 GB de VRAM.
  - i1-Q6_K (27,0 GB): ~28-29 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 80 GB para Q6_K y contexto largo; RTX 3090 (24 GB) para Q4_K_M; GPUs de 16 GB (RTX 4080, 4070 Ti Super) para IQ3_M o Q3_K_M.
- Cabe en consumer GPU: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB con IQ3_M o Q3_K_M; en GPUs de 12 GB solo con IQ2_M o inferiores, con perdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Los quants i1 requieren una version de llama.cpp que soporte i-quants.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF (este) | 32,76B | no disponible | apache-2.0 / openrail++ (verificar) | GGUF (i1, imatrix) | Version abliterated, quants desde 7,4 GB |
| Qwen2.5-32B-Instruct (original) | 32,76B | no disponible en esta ficha | apache-2.0 | safetensors, GGUF (via terceros) | Modelo de referencia con alineacion completa |
| mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF | 32,76B | no disponible | apache-2.0 / openrail++ (verificar) | GGUF estatico | Misma base, quants sin imatrix |
| richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic | 32,76B | no disponible | no disponible | safetensors | Modelo intermedio antes de la cuantizacion |

## Limitaciones y advertencias

- La abliteration elimina o atenua las capas de rechazo, por lo que el modelo puede generar contenido danino, ilegal o eticamente problematico; no es apto para produccion orientada a usuarios finales sin filtros externos.
- Riesgo elevado de alucinacion y de respuestas confiadas pero incorrectas, especialmente en cuantizaciones bajas (IQ1, IQ2), donde la calidad se degrada de forma notable.
- La model card declara solo ingles; el rendimiento en castellano u otros idiomas no esta garantizado y puede degradarse respecto al Qwen2.5 original.
- Ambiguedad de licencia: el campo license indica apache-2.0, pero los tags incluyen openrail++; conviene verificar la licencia efectiva del modelo intermedio antes de un uso comercial.
- La cuantizacion introduce perdida de calidad respecto al modelo en safetensors; los quants por debajo de Q4_K_S no son recomendables para tareas de razonamiento o codigo en produccion.
- No se documentan las tecnicas exactas de abliteration ni el impacto sobre benchmarks, por lo que no se puede afirmar que las capacidades del Qwen2.5-32B-Instruct se mantengan intactas.
- El repo ocupa 351,5 GB; descargar el modelo completo no es necesario, basta con el fichero de la cuantizacion elegida.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF
- Modelo base del quant: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF
- Qwen2.5-32B-Instruct original (referencia de licencia): https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
