# MangoMikePower/Qwen3.8-27B-abliterated-AWQ-INT4-Q4_K_M-GGUF

## Resumen

`MangoMikePower/Qwen3.8-27B-abliterated-AWQ-INT4-Q4_K_M-GGUF` es una conversion a formato GGUF del modelo `hotdogs/Qwen3.8-27B-abliterated-AWQ-INT4`, un modelo de generacion de texto de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors del repositorio base) que ha sido sometido a un proceso de "abliteracion", es decir, la eliminacion o supresion de las direcciones de rechazo en el espacio de activaciones, lo que da como resultado un modelo sin filtros de negativa aprendidos. El autor de esta conversion es el usuario MangoMikePower, que ha utilizado el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp para transformar los pesos AWQ INT4 originales a un unico fichero GGUF con cuantizacion Q4_K_M.

El modelo se distribuye bajo licencia Apache 2.0 y declara soporte para ingles, chino y tailandes, ademas de las etiquetas propias de un modelo conversacional y de generacion de texto. La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27.000 millones de parametros en hardware de consumo mediante cuantizacion de 4 bits, sin necesidad de infraestructura de servidor, y en un formato (GGUF) directamente compatible con llama.cpp, Ollama, LM Studio y otros runners locales.

No obstante, conviene senalar desde el principio que la model card publicada es minima: se limita a indicar el origen de la conversion y los comandos de uso con llama.cpp, y no documenta la longitud de contexto, la composicion del dataset de entrenamiento, los resultados de benchmarks ni las capacidades concretas (tool calling, vision, modo razonamiento). Tampoco existe, en la informacion disponible, evidencia de que "Qwen3.8-27B" corresponda a un lanzamiento oficial de la familia Qwen, por lo que el nombre debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica `qwen3_5` y `transformers`; no se especifica si es transformer denso, MoE o hibrida) |
| Parametros totales | 26.895.998.464 (~26,9 B) segun los pesos safetensors del modelo base |
| Parametros activos | no disponible (no se declara que sea un modelo MoE, por lo que se asume denso, pero no esta confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M en este repositorio; el modelo base esta en AWQ INT4 / GPTQ / compressed-tensors con esquema w4a16 |
| Idiomas soportados | en (ingles), zh (chino), th (tailandes) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero unico `qwen3.8-27b-abliterated-awq-int4-q4_k_m.gguf`); el modelo base usa safetensors con compresion AWQ INT4 |
| Tamano del repositorio | 16,5 GB |
| Pipeline | text-generation |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna del modelo. Los unicos indicios son las etiquetas del repositorio: `qwen3_5` (que sugiere una generacion de la familia Qwen posterior a Qwen3, aunque no hay confirmacion oficial), `transformers` como libreria y `text-generation` como tarea. No se detalla si se trata de un transformer denso clasico, de una mezcla de expertos (MoE), de atencion lineal o de una arquitectura hibrida, ni se indican dimensiones de capas, numero de cabezas de atencion o tipo de tokenizador.

Tampoco hay datos sobre el entrenamiento: no se especifica el numero de tokens, la composicion del dataset, la existencia de fases de RLHF, DPO o RLAIF, ni el proceso concreto de abliteracion aplicado. Lo unico documentado es la cadena de transformacion: un modelo base ya etiquetado como abliterado y cuantizado en AWQ INT4 (`hotdogs/Qwen3.8-27B-abliterated-AWQ-INT4`) fue reconvertido a GGUF con cuantizacion Q4_K_M mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai. No consta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modo thinking) en la model card.

## Capacidades

- Generacion de texto y conversacion multi-turno: es la unica capacidad explicitamente implicita en el pipeline declarado (`text-generation`) y en la etiqueta `conversational`.
- Multilingueismo limitado a tres idiomas declarados: ingles, chino y tailandes. No hay informacion sobre calidad relativa entre ellos ni sobre otros idiomas.
- Comportamiento sin rechazos: por el proceso de abliteracion, el modelo no aplica las negativas tipicas de los modelos alineados ante peticiones sensibles o restringidas.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponible; las etiquetas no incluyen modalidades adicionales.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad de codigo y matematicas: no disponible (no se declara ni se aportan evaluaciones).
- Ejecucion local: capacidad derivada del formato, no del modelo en si; el GGUF permite inferencia offline con llama.cpp.

## Casos de uso

- Despliegue local en una sola GPU de consumo: al estar en GGUF Q4_K_M con un repositorio de 16,5 GB, el modelo se puede cargar en tarjetas de 24 GB (RTX 3090, RTX 4090) o en equipos Apple Silicon con memoria unificada de 32 GB o mas, ejecutando llama-server como API compatible con OpenAI sin depender de servicios en la nube.
- Generacion de texto en ingles, chino y tailandes: util para redaccion de borradores, resumenes y reescritura en esos tres idiomas, aprovechando que son los unicos declarados oficialmente por el autor.
- Traduccion asistida entre ingles y chino o tailandes: el modelo puede emplearse como motor de traduccion en pipelines internos donde no se requiera certificacion profesional, con revision humana posterior.
- Investigacion sobre alineacion y mecanismos de rechazo: al ser una variante abliterada, permite comparar su distribucion de respuestas con la del modelo original alineado para estudiar donde y como se codifican las negativas en el espacio de activaciones.
- Red teaming y evaluacion de moderacion: se puede usar como generador adversario para probar clasificadores de contenido o sistemas de filtrado propios, dado que no se autolimita en las respuestas.
- Generacion de datos sinteticos para fine-tuning: util para producir corpus en dominios donde los modelos alineados se niegan a responder, siempre con supervision y filtrado posterior antes de reutilizar esos datos.
- Procesamiento por lotes en entornos aislados o air-gapped: al ejecutarse con llama.cpp sin llamadas de red, encaja en infraestructuras sin conexion a internet donde no se permite enviar datos a APIs externas.
- Prototipado rapido de asistentes conversacionales: sirve para validar prompts, plantillas de chat y flujos de conversacion antes de invertir en un modelo mayor o en un servicio gestionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y tampoco se ha localizado la model card del modelo base `hotdogs/Qwen3.8-27B-abliterated-AWQ-INT4` ni resultados de terceros en la busqueda web realizada. No es posible, por tanto, comparar su rendimiento cuantitativo con el de otros modelos, ni estimar la degradacion introducida por la cuantizacion Q4_K_M frente a los pesos AWQ INT4 originales.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 16-17 GB solo para los pesos en Q4_K_M, deducido del tamano del repositorio (16,5 GB). Hay que anadir la cache KV y el overhead del runtime, que crecen con la longitud de contexto; el valor exacto depende de la ventana configurada, que no esta documentada.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A10G (24 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) para dejar margen de contexto. Una RTX 4080 o 4070 Ti SUPER de 16 GB queda al limite y probablemente exija descarga parcial a RAM.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con contexto moderado y en equipos Apple Silicon con 32 GB o 64 GB de memoria unificada. En GPUs de 16 GB la carga completa no es viable sin offloading.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante un Modelfile, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en AWQ INT4 se usaria vLLM o TGI con soporte w4a16.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No existen datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, contexto y licencia. Los valores de los modelos alternativos proceden de sus respectivas fichas oficiales y se incluyen como referencia de categoria (modelos densos abiertos de 24-33 B).

| Modelo | Parametros | Contexto | Licencia | Formato principal | Rendimiento comparado |
|---|---|---|---|---|---|
| MangoMikePower/Qwen3.8-27B-abliterated AWQ-INT4-Q4_K_M-GGUF | ~26,9 B | no disponible | apache-2.0 | GGUF Q4_K_M | no disponible |
| Qwen2.5-32B-Instruct | ~32,5 B | 131.072 tokens | apache-2.0 | safetensors, GGUF comunitarios | no comparable (sin datos del modelo evaluado) |
| Qwen3-32B | ~32,8 B | 32.768 tokens nativos, ampliable por YaRN | apache-2.0 | safetensors, GGUF comunitarios | no comparable |
| Mistral-Small-24B-Instruct | ~23,6 B | 32.768 tokens | apache-2.0 | safetensors, GGUF comunitarios | no comparable |

La diferencia funcional mas relevante frente a esas alternativas no es de rendimiento sino de comportamiento: este modelo esta abliterado, de modo que no reproduce el patron de rechazo de las versiones alineadas. Las alternativas citadas mantienen alineacion estandar y, por tanto, son mas adecuadas para productos finales expuestos a usuarios.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. Al carecer de model card detallada y de evaluacion de sesgos, no es posible descartar sesgos de genero, raza, religion o nacionalidad, especialmente en el idioma tailandes, donde los recursos de evaluacion son mas escasos.
- Riesgo de alucinacion: no cuantificado. No hay benchmarks de veracidad ni de seguimiento de instrucciones para este checkpoint.
- Ausencia de filtros de seguridad: al estar abliterado, el modelo puede generar contenido ofensivo, ilegal o peligroso sin negarse. No debe exponerse directamente a usuarios finales sin una capa de moderacion externa.
- Cuantizacion agresiva: la conversion desde AWQ INT4 a GGUF Q4_K_M implica una segunda perdida de precision. La degradacion acumulada respecto a los pesos originales no esta medida.
- Contexto desconocido: se ignora la ventana real soportada. Los ejemplos de la model card usan `-c 2048`, lo que sugiere que el autor no ha validado ventanas largas; no conviene asumir capacidades de contexto extendido.
- Idiomas limitados: solo ingles, chino y tailandes. No hay evidencia de soporte util para castellano, portugues, frances u otros idiomas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero esa licencia se hereda del modelo base y no cubre el cumplimiento normativo (por ejemplo, obligaciones de transparencia del reglamento europeo de IA) ni exime al desplegador de responsabilidad sobre el contenido generado.
- Procedencia dudosa: el nombre "Qwen3.8-27B" no se corresponde con ningun lanzamiento oficial verificable en la informacion disponible, y el repositorio base pertenece a un autor no oficial. La trazabilidad del dataset de entrenamiento es nula.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo dia. No hay evidencia de uso en produccion ni de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MangoMikePower/Qwen3.8-27B-abliterated-AWQ-INT4-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-AWQ-INT4
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos enlaces recuperados correspondian a paginas de ayuda de Gmail, sin relacion con la consulta.
