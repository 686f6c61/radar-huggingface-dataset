# mradermacher/Qwen3.5-122B-A10B-abliterated-v1-GGUF

## Resumen

Qwen3.5-122B-A10B-abliterated-v1-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo wangzhang/Qwen3.5-122B-A10B-abliterix, publicada por el usuario mradermacher. El modelo subyacente es una variante "abliterated" (tambien etiquetada como uncensored o decensored) de la familia Qwen3.5, con 122.111.526.912 parametros totales segun los pesos safetensors del repositorio base. El sufijo A10B del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 10.000 millones de parametros activos, aunque este dato no se confirma de forma explicita en la informacion disponible.

La relevancia de esta publicacion es doble. Por un lado, ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K de 44,7 GB hasta Q8_0 de 130,0 GB), lo que permite ejecutar un modelo de gran tamano en hardware mas modesto mediante llama.cpp y ecosistemas compatibles. Por otro lado, la naturaleza "abliterated" implica que se han eliminado o atenuado las capas de rechazo del modelo original, lo que cambia radicalmente el perfil de seguridad y las consideraciones de uso en produccion.

La licencia declarada es Apache 2.0 y el unico idioma listado es el ingles. El repositorio ocupa 830,5 GB en total y acumula 1.667 descargas y 2 likes en el momento de la consulta. No se dispone de informacion sobre contexto maximo, composicion del dataset de entrenamiento ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (inferido del sufijo A10B; no confirmado en la informacion disponible) |
| Parametros totales | 122.111.526.912 |
| Parametros activos | aproximadamente 10.000 millones (inferido del sufijo A10B; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones con imatrix en repositorio i1-GGUF |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El identificador Qwen3.5-122B-A10B apunta a un transformer con mezcla de expertos (MoE) de 122.000 millones de parametros totales y aproximadamente 10.000 millones activos por token, patron habitual en la familia Qwen para modelos de gran escala. Esta publicacion concreta no entrena el modelo: mradermacher se limita a generar cuantizaciones estaticas del checkpoint wangzhang/Qwen3.5-122B-A10B-abliterix mediante el pipeline de conversion a GGUF (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2).

El proceso de "abliteration" aplicado en el modelo base consiste en modificar los pesos para reducir la direccion de activacion asociada al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante determinados contenidos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Tampoco se documenta el contexto nativo del modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio.
- Respuestas sin filtros de rechazo heredados del proceso de abliteration, orientadas a contenido que el modelo original declinaria.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion en servicios de inferencia con API compatible con OpenAI.
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- Capacidades de razonamiento, codigo y matematicas: no confirmadas de forma explicita en la informacion disponible, aunque plausibles dado el modelo base.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta language.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM de gran escala sin capas de rechazo, comparando respuestas frente a la version original y midiendo como la abliteration afecta a la utilidad y a la toxicidad. Es adecuado porque el checkpoint base esta explicitamente orientado a este tipo de analisis.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas tipicas del modelo alineado. La cuantizacion Q4_K_M (74,3 GB) ofrece un equilibrio razonable entre calidad y requisitos de memoria.
- Despliegue local en estaciones de trabajo con multiples GPU: gracias a las cuantizaciones Q2_K (44,7 GB) y Q3_K_S (53,0 GB), es posible ejecutar el modelo en configuraciones de 2 a 4 GPU consumer o en una unica GPU profesional de gran memoria, algo inviable con los pesos en safetensors.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye once variantes de cuantizacion, lo que permite medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0 en un mismo modelo, util para calibrar decisiones de despliegue.
- Prototipado de asistentes conversacionales en ingles: la etiqueta endpoints_compatible y el formato GGUF permiten levantar un servidor compatible con la API de OpenAI en minutos, adecuado para pruebas de concepto internas.
- Analisis de contenido sensible en entornos controlados: equipos de moderacion o red teaming pueden usar el modelo para generar casos adversarios y probar sus propios clasificadores de seguridad, aprovechando la ausencia de rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 45 GB en Q2_K, 53 GB en Q3_K_S, 66 GB en IQ4_XS, 70-74 GB en Q4_K_S/Q4_K_M, 84-87 GB en Q5_K_S/Q5_K_M, 100 GB en Q6_K y 130 GB en Q8_0. A estos valores hay que anadir el overhead de contexto KV cache, que puede ser significativo en un modelo de este tamano.
- GPU recomendadas: para Q4_K_M y superiores, configuraciones multi-GPU con 2x A100 80 GB, 2x H100 80 GB o 4x RTX 4090 24 GB. Para Q2_K y Q3_K_S, 2x RTX 4090 o una unica A100 80 GB con margen ajustado.
- Cabe en GPU consumer: si, en configuraciones multi-GPU de 2 a 4 tarjetas RTX 4090 o similares, empleando cuantizaciones bajas (Q2_K, Q3_K_S). No cabe en una unica GPU consumer de 24 GB.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python); servidores compatibles con API OpenAI gracias a la etiqueta endpoints_compatible. vLLM y TGI no soportan GGUF de forma nativa para este tipo de checkpoint, por lo que requeririan los pesos safetensors originales.
- Latencia y throughput estimados: no disponibles. Al ser un modelo MoE con aproximadamente 10.000 millones de parametros activos, el throughput por token deberia ser sustancialmente mayor que el de un modelo denso de 122.000 millones, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-abliterated-v1-GGUF (este) | 122,1 B | ~10 B (inferido) | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo ingles |
| wangzhang/Qwen3.5-122B-A10B-abliterix | 122,1 B | ~10 B (inferido) | no disponible | Apache 2.0 | safetensors | Modelo base del que se derivan estas cuantizaciones |
| mradermacher/Qwen3.5-122B-A10B-abliterated-v1-i1-GGUF | 122,1 B | ~10 B (inferido) | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas de mayor calidad |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina o atenua los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o sexualmente explicito sin filtros. No es apto para aplicaciones de cara al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta variante, y la modificacion de pesos puede degradar capacidades de razonamiento y coherencia respecto al modelo original.
- Idioma limitado al ingles segun la etiqueta del repositorio; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta y validar empiricamente el comportamiento en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento normativo del contenido generado; la responsabilidad recae en el desplegador.
- El repositorio pesa 830,5 GB y las descargas de cuantizaciones grandes (Q6_K, Q8_0) requieren almacenamiento y ancho de banda considerables.
- Modelo derivado de un tercero (wangzhang): la trazabilidad del proceso de abliteration y la calidad del checkpoint base no estan verificadas de forma independiente.
- No hay informacion sobre sesgos especificos medidos; cabe esperar los sesgos del corpus de entrenamiento original, potencialmente amplificados por la ausencia de rechazos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-122B-A10B-abliterated-v1-GGUF
- Modelo base: https://huggingface.co/wangzhang/Qwen3.5-122B-A10B-abliterix
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.5-122B-A10B-abliterated-v1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-122B-A10B-abliterated-v1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
