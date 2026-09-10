# sizzlebop/flame-27m-instruct-GGUF

## Resumen

flame-27m-instruct-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo ifx-pse-sys-ml/flame-27m-instruct, publicado por el usuario sizzlebop. Se trata de un decodificador tipo transformer de solo 27.125.248 parametros (27,1 M) afinado para instrucciones en ingles, disenado explicitamente como alternativa ultraligera a modelos como SmolLM-135M-Instruct, aproximadamente cinco veces mas pequeno que este ultimo. Su proposito es servir como modelo de generacion de texto ejecutable en dispositivos de borde, entornos embebidos y experimentacion local rapida, sin necesidad de GPU.

El modelo base fue entrenado sobre FineWeb-Edu-dedup, Cosmopedia-v2, ClimbMix y FineMath, y posteriormente afinado con SmolTalk. La arquitectura emplea 8 capas, hidden size de 512, atencion con Grouped Query Attention (8 cabezas de consulta y 2 de clave/valor), normalizacion RMSNorm por cabeza sobre las proyecciones Q y K, SwiGLU con tamano intermedio de 1280 y embeddings ligados. La longitud de contexto es de 2048 tokens y el vocabulario de 12.000 tokens con ByteLevel BPE especifico para ingles.

La relevancia de esta publicacion es practica mas que de capacidad: ofrece siete variantes de cuantizacion que van desde 52,16 MB en F16 hasta 12,64 MB en Q2_K, lo que permite desplegar el modelo en hardware muy limitado (incluidos microcontroladores con memoria suficiente) usando llama.cpp, Ollama o LM Studio. El rendimiento absoluto es bajo en terminos de conocimiento y sentido comun, con una media de 34,7 % en el conjunto de benchmarks reportado, por lo que su utilidad esta en tareas acotadas y en escenarios de recursos extremadamente restringidos, no en aplicaciones de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (estilo NeoX), Grouped Query Attention, SwiGLU, RMSNorm por cabeza en Q y K |
| Parametros totales | 27.125.248 (27,1 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base |
| Capas | 8 |
| Hidden size | 512 |
| Cabezas de atencion | 8 (query) / 2 (key-value), head dimension 64 |
| Tamano intermedio | 1280 (SwiGLU) |
| Vocabulario | 12.000 tokens, ByteLevel BPE ingles |
| Embeddings | Ligados (tie_word_embeddings: true) |
| RoPE base frequency | 1.000.000 (estilo NeoX) |
| Formato de prompt | ChatML (`<|im_start|>`, `<|im_end|>`) |
| Modelo base | ifx-pse-sys-ml/flame-27m-instruct |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 8 capas con hidden size de 512. La atencion utiliza Grouped Query Attention con 8 cabezas de consulta y 2 cabezas de clave/valor, cada una de dimension 64, lo que reduce el coste de la cache KV. Sobre las proyecciones Q y K se aplica RMSNorm por cabeza, una tecnica de estabilizacion habitual en modelos pequenos. La capa feed-forward usa SwiGLU con tamano intermedio de 1280 y los embeddings de entrada y salida estan ligados, lo que reduce el recuento de parametros. El contexto maximo es de 2048 tokens y la base de RoPE se eleva a 1.000.000 siguiendo el esquema NeoX.

Los datos de preentrenamiento declarados son FineWeb-Edu-dedup (corpus educativo filtrado), Cosmopedia-v2 (texto sintetico tipo libro de texto), ClimbMix y FineMath (contenido matematico). El ajuste por instrucciones se realizo sobre SmolTalk. La model card del repositorio no detalla el numero de tokens de entrenamiento, la composicion exacta de las mezclas, ni si se aplicaron etapas de RLHF o DPO; esa informacion no esta disponible. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La conversion a GGUF se hizo desde los pesos safetensors originales con llama.cpp a precision F16 nativa, y a partir de ahi se generaron las variantes k-quant.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat ChatML, incluyendo rol de sistema, usuario y asistente.
- Seguimiento basico de instrucciones simples gracias al ajuste sobre SmolTalk.
- Respuesta a preguntas de conocimiento general limitado, con resultados cercanos o ligeramente superiores al azar en la mayoria de benchmarks de sentido comun.
- Razonamiento aritmetico y matematico elemental, potencialmente influido por la presencia de FineMath en el preentrenamiento, aunque no se reportan resultados especificos de GSM8K.
- Generacion de texto corto con temperatura baja; la model card recomienda `--temp 0.3` en los ejemplos de uso.
- Soporte de tool calling / function calling: no disponible, no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta.
- Capacidades multilingues: limitadas al ingles; el vocabulario de 12.000 tokens es ByteLevel BPE en ingles.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Inferencia en microcontroladores y dispositivos embebidos: la variante Q2_K ocupa 12,64 MB y la Q3_K_M 14,85 MB, lo que permite cargar el modelo en sistemas con pocos megabytes de RAM libre y ejecutar generacion de texto local sin conectividad.
- Asistentes locales sin conexion en Raspberry Pi u ordenadores de placa reducida: con Q4_K_M (17,20 MB) el modelo se ejecuta en CPU mediante llama.cpp u Ollama, ofreciendo respuestas genericas para automatizaciones de hogar o interfaces de voz simples.
- Generacion de texto de relleno y plantillas: util para producir borradores cortos, pies de foto o descripciones genericas donde la coherencia a nivel de frase es suficiente y no se requiere conocimiento factual.
- Filtrado y clasificacion de texto ligero: al ser un modelo de 27 M de parametros, puede actuar como preclasificador o enrutador de consultas antes de invocar un modelo mayor, reduciendo coste en pipelines con gran volumen de peticiones.
- Experimentacion academica y docencia: sirve como banco de pruebas para estudiar cuantizacion, formatos GGUF, plantillas ChatML y efectos de la precision en un modelo cuyo ciclo de inferencia es casi instantaneo incluso en CPU.
- Pruebas de integracion y CI de infraestructura de despliegue: su tamano minimo permite incluirlo en tests automatizados que validen servidores llama-server, plantillas de Ollama o presets de LM Studio sin consumir recursos significativos.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en el dispositivo y pesar menos de 20 MB en cuantizacion 4 bits, es viable en escenarios donde los datos no pueden salir del terminal del usuario (kioscos, dispositivos industriales aislados).
- Generacion de datos sinteticos de bajo coste: puede producir grandes volumenes de texto breve en ingles para aumentar datasets auxiliares de tareas simples, aceptando el ruido inherente a su calidad.

## Benchmarks y rendimiento

Resultados de exactitud (%) evaluados con lm-evaluation-harness 0.4, segun la model card del repositorio:

| Benchmark | Azar | flame-27m-instruct | SmolLM-135M-Instruct |
|---|---|---|---|
| HellaSwag | 25,0 | 30,4 | 41,9 |
| ARC-Easy | 25,0 | 38,3 | 43,9 |
| ARC-Challenge | 25,0 | 24,0 | 27,4 |
| PIQA | 50,0 | 61,1 | 67,0 |
| WinoGrande | 50,0 | 50,6 | 51,3 |
| OpenBookQA | 25,0 | 28,6 | 33,6 |
| CommonsenseQA | 20,0 | 18,5 | 20,3 |
| MMLU | 25,0 | 26,3 | 24,4 |
| Media | — | 34,7 | 38,7 |

No se han publicado en la informacion disponible resultados de otros benchmarks como GSM8K, HumanEval, MBPP, MT-Bench o evaluaciones multilingues. Cabe senalar que flame-27m-instruct supera a SmolLM-135M-Instruct unicamente en MMLU (26,3 frente a 24,4) y queda por debajo en el resto de tareas, ademas de obtener 18,5 % en CommonsenseQA, por debajo del nivel de azar (20,0).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones. El archivo mas grande (F16) ocupa 52,16 MB y el mas pequeno (Q2_K) 12,64 MB, por lo que la memoria necesaria viene dominada por el contexto (2048 tokens) y el runtime, no por los pesos.
- GPU recomendadas: no se requieren. Cualquier GPU consumer, incluso integradas (Intel UHD, AMD Radeon integrada, Apple Silicon), es mas que suficiente. Modelos como RTX 4090, A100 o H100 estan sobredimensionados para este modelo.
- Cabe en GPU consumer: si, en la practica totalidad de ellas, y tambien en CPU. El caso de uso realista es CPU o SoC de bajo consumo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante Modelfile, LM Studio con preset ChatML, y cualquier runtime compatible con GGUF. El repositorio esta etiquetado con `endpoints_compatible` y `llama-cpp`.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Formato de pesos y compatibilidad: GGUF con variantes k-quant estandar, aptas para desplegar en CPU sin GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en benchmarks reportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flame-27m-instruct | 27,1 M | 2048 | 34,7 | Apache 2.0 | HuggingFace (GGUF y safetensors) |
| SmolLM-135M-Instruct | 135 M | no disponible en la informacion | 38,7 | no disponible en la informacion | HuggingFace |
| Otros modelos comparables de tamano similar (por ejemplo alternativas sub-100M) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con SmolLM-135M-Instruct, que sirve como referencia en la propia model card: es aproximadamente 5 veces mayor en parametros y obtiene mejores resultados en la mayoria de benchmarks, salvo MMLU. No se dispone de datos de contexto, licencia ni rendimiento de otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion: con 27 M de parametros, la capacidad de retener conocimiento factual es muy limitada y las respuestas pueden ser incorrectas o incoherentes con facilidad.
- Rendimiento cercano al azar en varias tareas: CommonsenseQA (18,5 %) queda por debajo del nivel de azar y ARC-Challenge (24,0 %) se situa por debajo del 25 % esperado, lo que indica escasa capacidad de razonamiento.
- Sesgos conocidos: no se documentan analisis de sesgo ni procesos de alineacion de seguridad mas alla del ajuste sobre SmolTalk. No hay informacion disponible sobre mitigacion de sesgos.
- Limitacion idiomatica: el modelo solo soporta ingles. El vocabulario ByteLevel BPE de 12.000 tokens esta optimizado para ese idioma y el rendimiento en castellano u otras lenguas no esta evaluado y previsiblemente sera muy deficiente.
- Contexto reducido: 2048 tokens como maximo, sin mecanismos documentados de extension de contexto.
- Sin soporte documentado de tool calling, agentes, vision ni audio.
- Restricciones de licencia: la licencia es Apache 2.0 tanto en el repositorio GGUF como en el modelo base, lo que permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el archivo NOTICE si aplica. Debe verificarse la licencia del modelo base de forma independiente.
- Adecuacion para produccion: no recomendable para tareas que requieran precision factual, razonamiento o coherencia multi-turno prolongada. Su uso apropiado es en entornos con recursos extremadamente limitados y expectativas de calidad bajas.
- Ausencia de datos de reproducibilidad: la model card no especifica tokens de entrenamiento, composicion exacta de mezclas ni detalles del ajuste por instrucciones, lo que dificulta la reproducibilidad.
- Riesgo de contaminacion de benchmarks: no se documenta si los conjuntos de evaluacion estuvieron excluidos de FineWeb-Edu-dedup, Cosmopedia-v2, ClimbMix o FineMath.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/sizzlebop/flame-27m-instruct-GGUF
- Modelo base en HuggingFace: https://huggingface.co/ifx-pse-sys-ml/flame-27m-instruct
- lm-evaluation-harness (herramienta de evaluacion citada): https://github.com/EleutherAI/lm-evaluation-harness
- llama.cpp (referenciado en la model card para la conversion y ejecucion): enlace no disponible en la informacion proporcionada
- Ollama (referenciado en la model card): enlace no disponible en la informacion proporcionada
- LM Studio (referenciado en la model card): enlace no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible
- Demo o espacio interactivo: no disponible

Nota: los resultados de la busqueda web realizada no contenian informacion relevante sobre este modelo; los enlaces devueltos correspondian a servicios no relacionados y se han descartado.
