# bartowski/thinkingmachines_Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por Thinking Machines, distribuido originalmente en formato safetensors y cuantizado a GGUF por bartowski para su uso con llama.cpp. Con 26.070.385.152 parametros totales (26B) y capacidad de procesar entradas de texto e imagen, se posiciona como una opcion de tamano medio para despliegue local de tareas conversacionales y vision-lenguaje.

La relevancia de esta ficha concreta radica en que bartowski ha publicado un conjunto completo de cuantizaciones imatrix compatibles con llama.cpp (release b12600), lo que permite ejecutar un modelo MoE de 26B en hardware de consumo mediante tecnicas de cuantizacion agresivas que reducen el peso desde 52,23 GB en bf16 hasta 13,77 GB en IQ3_XS. El modelo base incorpora un parametro de "thinking effort level" en el prompt de sistema, lo que sugiere un modo de razonamiento configurable.

La licencia Apache 2.0 facilita el uso comercial y la modificacion, y el soporte de tool calling mediante declaracion XML en el prompt de sistema lo hace apto para flujos agente. No se dispone de informacion publica sobre la longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer multimodal texto-imagen |
| Parametros totales | 26.070.385.152 (26B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, IQ3_M, IQ3_XS, Q3_K_L, Q3_K_M, Q3_K_S (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con capacidad multimodal texto-imagen, segun la etiqueta `image-text-to-text` y la referencia a un archivo `mmproj` necesario para el procesamiento de imagenes en llama.cpp. El recuento de parametros totales es de 26B, aunque no se especifica cuantos estan activos por token ni el numero de expertos. El prompt de sistema incluye un campo "Thinking effort level" con valores decimales (0,9 en los ejemplos), lo que indica un mecanismo de razonamiento configurable en tiempo de inferencia, aunque no se detalla su implementacion interna.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. Tampoco se documenta el uso de decodificacion especulativa (la model card indica explicitamente "Speculative decoding: no"). La cuantizacion se realizo con llama.cpp b12600 empleando imatrix, lo que mejora la calidad de las cuantizaciones de baja precision al calibrar con un dataset representativo.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes (image-text-to-text) mediante el archivo mmproj asociado.
- Tool calling / function calling: el prompt de sistema admite una declaracion `tool_declare` en XML con esquema JSON de funciones, incluyendo descripcion, nombre y parametros.
- Razonamiento configurable mediante "Thinking effort level" en el prompt de sistema.
- Capacidades multilingues: no documentadas en la informacion disponible.
- No se documentan capacidades de audio, video ni modos de pensamiento extendido mas alla del nivel de esfuerzo configurable.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con un prompt de sistema estructurado y declaracion de herramientas para consultar estado de pedidos o stocks, integrándose en un backend de soporte.
- Agente con tool calling: la sintaxis `tool_declare` en XML permite definir funciones como `get_stock_price` y que el modelo emita llamadas estructuradas, adecuado para orquestadores de agentes ligeros.
- Analisis de documentos con imagenes: al aceptar entradas image-text-to-text, puede extraer informacion de capturas, formularios o diagramas combinados con texto en un pipeline de digitalizacion.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (18,66 GB) o IQ4_XS (15,09 GB) cabe en GPUs de consumo de 24 GB (RTX 3090/4090) y permite prototipado sin conexion.
- Generacion asistida en entornos con requisitos de privacidad: al ejecutarse en llama.cpp sobre hardware propio, los datos no salen del perimetro, apto para sectores regulados.
- Razonamiento con esfuerzo ajustable: el parametro "Thinking effort level" permite calibrar coste/calidad en tareas de clasificacion o extraccion, reduciendo latencia cuando se baja el nivel.
- Investigacion en cuantizacion: el conjunto de 19 variantes GGUF permite comparar degradacion de calidad entre metodos (Q3_K_S vs IQ3_XS vs Q4_K_M) sobre un mismo modelo MoE multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de pesos, sin overhead de contexto): bf16 52,23 GB; Q8_0 27,82 GB; Q6_K 24,70 GB; Q5_K_M 21,22 GB; Q4_K_M 18,66 GB; IQ4_XS 15,09 GB; Q3_K_M 14,55 GB; IQ3_XS 13,77 GB.
- GPU recomendadas: para bf16 y Q8_0, A100 80 GB o H100; para Q6_K y Q5_K_M, A100 40 GB o RTX 6000 Ada; para Q4_K_M e inferiores, RTX 3090/4090 (24 GB) o RTX 4080 (16 GB) con IQ4_XS.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con Q4_K_M o inferiores; en RTX 4080/4070 Ti Super (16 GB) con IQ4_XS o Q3_K_L; en GPUs de 12 GB no cabe ninguna variante completa (minimo 13,77 GB).
- Opciones de despliegue: llama.cpp (release b12600 o superior), Ollama, LM Studio y cualquier runtime compatible con GGUF; requiere el archivo mmproj para entrada de imagen.
- Latencia y throughput: no disponibles. Al ser MoE, el throughput depende del numero de parametros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini (este) | 26B MoE | no disponible | Si (texto+imagen) | Apache 2.0 | GGUF, safetensors |
| Alternativas de 26B MoE multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la informacion proporcionada; no se han identificado alternativas directas con datos verificables.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo base.
- Riesgo de alucinacion inherente a modelos generativos; no hay benchmarks publicados que cuantifiquen su fiabilidad.
- Longitud de contexto no disponible: no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Idiomas soportados no documentados; el rendimiento en castellano no esta verificado.
- Las cuantizaciones de baja precision (Q3_K_S, IQ3_XS, IQ3_M) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El procesamiento de imagenes requiere el archivo mmproj adicional; sin el, el modelo solo procesa texto.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion (bartowski) no ofrece garantias sobre el modelo base.
- El formato de prompt es especifico (`<|message_system|>`, `<|content_text|>`, `<|end_message|>`); un formato incorrecto degrada gravemente las respuestas.
- No se especifica el numero de parametros activos, lo que impide estimar con precision el coste computacional real por token.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/thinkingmachines_Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizacion Q4_K_M: https://huggingface.co/bartowski/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini-Q4_K_M.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
