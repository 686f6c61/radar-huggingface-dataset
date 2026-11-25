# mradermacher/grug-27b-v1.1-GGUF

## Resumen

grug-27b-v1.1-GGUF es la distribucion en formato GGUF del modelo ProCreations/grug-v1.1-qwen-3.8-27b, una cuantizacion estatica realizada por mradermacher. El modelo original es un ajuste fino de la familia Qwen 3.8 de 27 mil millones de parametros, orientado a razonamiento eficiente en tokens, uso agentico y tool calling. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, algo inviable con los pesos completos en safetensors.

El modelo cuenta con 26.895.998.464 parametros totales (aproximadamente 26,9 mil millones) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales. La model card del repositorio de cuantizacion no detalla la longitud de contexto, los idiomas soportados ni los datos de entrenamiento; esa informacion corresponderia al modelo base original, que no se ha incluido en la informacion disponible.

La relevancia de esta ficha radica en que ofrece un punto de entrada practico para desplegar un modelo de 27B con enfasis en eficiencia de tokens y capacidades agenticas en entornos locales, con un abanico de cuantizaciones que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), cubriendo desde GPUs de gama media hasta estaciones de trabajo con VRAM amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen 3.8; detalles no especificados en la informacion disponible) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; versiones con imatrix en el repositorio i1 |
| Idiomas soportados | en (segun la model card); no se detallan otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El nombre del modelo base (grug-v1.1-qwen-3.8-27b) sugiere que deriva de la familia Qwen 3.8, pero no se confirma en la model card si se trata de un transformer denso, un modelo con atencion lineal o una arquitectura hibrida. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La model card del repositorio GGUF unicamente documenta el proceso de cuantizacion: cuantizaciones estaticas generadas con quantize_version 2 y output_tensor_quantised 1, con conversion desde formato Hugging Face (convert_type: hf). Se indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (grug-27b-v1.1-i1-GGUF), lo que sugiere que el autor recomienda esas versiones para mayor calidad. No se documentan innovaciones tecnicas como decodificacion especulativa o modos de pensamiento en la informacion disponible.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Razonamiento orientado a eficiencia de tokens (tags "reasoning" y "token-efficient").
- Capacidades agenticas (tag "agentic").
- Soporte de tool calling / function calling (tag "tool-use").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Idioma principal: ingles; no se confirman capacidades multilingues adicionales.
- No se documentan capacidades de vision, audio ni modos de pensamiento explicitos en la informacion disponible.

## Casos de uso

- Agentes autonomos con tool calling: el modelo esta etiquetado como agentic y tool-use, por lo que puede integrarse en bucles de razonamiento multi-paso donde invoque funciones externas (APIs, busquedas, calculadoras) y encadene resultados. La cuantizacion Q4_K_M (16,6 GB) permite desplegarlo en una unica GPU de 24 GB.
- Razonamiento eficiente en coste: la orientacion a token-efficient lo hace adecuado para pipelines donde el coste por token es critico, como clasificacion con justificacion o extraccion estructurada de datos a gran escala.
- Asistentes conversacionales en local: con Q4_K_S (15,7 GB) o Q5_K_M (19,3 GB) puede ejecutarse en estaciones de trabajo con una RTX 4090 o A6000, ofreciendo conversaciones multi-turno sin depender de servicios en la nube.
- Prototipado de agentes en entornos de desarrollo: la disponibilidad de cuantizaciones ligeras (Q2_K, 10,8 GB; Q3_K_S, 12,2 GB) permite iterar rapidamente en portatiles con GPU de 12-16 GB antes de escalar a versiones de mayor calidad.
- Automatizacion de tareas de codigo asistido: aunque no se documenta un benchmark de codigo, el perfil de razonamiento y tool-use lo hace apto para integrarse en asistentes de IDE que consultan documentacion o ejecutan comandos mediante funciones.
- Despliegue en infraestructura con llama.cpp u Ollama: al ser GGUF, puede servirse con llama.cpp, Ollama o servidores compatibles con endpoints, lo que facilita su integracion en stacks de inferencia ligeros sin necesidad de vLLM ni TGI.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion mas las versiones imatrix, lo que permite medir el impacto de la cuantizacion en calidad para un modelo de 27B en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K 10,8 GB; Q3_K_S 12,2 GB; Q3_K_M 13,4 GB; Q3_K_L 14,4 GB; IQ4_XS 15,3 GB; Q4_K_S 15,7 GB; Q4_K_M 16,6 GB; Q5_K_S 18,8 GB; Q5_K_M 19,3 GB; Q6_K 22,2 GB; Q8_0 28,7 GB. A estas cifras hay que anadir la memoria para el contexto KV, no cuantificada en los tamanos indicados.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; A6000 o A100 40 GB para Q8_0 con contexto amplio; H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 12-16 GB (RTX 4070 Ti, 4080) con Q2_K a IQ4_XS, aceptando perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints; el repositorio no menciona vLLM ni TGI para formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grug-27b-v1.1-GGUF | 26,9B | no disponible | Apache 2.0 | GGUF | Razonamiento token-efficient, agentic, tool-use |
| Qwen 3.8 27B (familia base) | no disponible | no disponible | no disponible | no disponible | Modelo de referencia del que deriva; datos no confirmados en la informacion |
| Alternativas de 27B-30B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificables para comparar en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni procesos de alineacion, por lo que el riesgo de sesgo y de alucinacion no puede evaluarse a priori.
- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta verificado y podria degradarse notablemente.
- La longitud de contexto no se especifica; no debe asumirse una ventana amplia sin verificacion empirica.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar el razonamiento y el tool calling; el autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q8_0 como mejor calidad.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base original podria tener condiciones adicionales no reflejadas en esta ficha; conviene revisar el repositorio ProCreations/grug-v1.1-qwen-3.8-27b.
- No hay benchmarks publicados que respalden las afirmaciones de eficiencia de tokens o capacidad agentica; la validacion en produccion requiere evaluacion propia.
- El repositorio tiene un volumen de descargas bajo (292) y cero likes, lo que limita la evidencia de la comunidad sobre su comportamiento real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/grug-27b-v1.1-GGUF
- Modelo base: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/grug-27b-v1.1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#grug-27b-v1.1-GGUF
- Guia de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
