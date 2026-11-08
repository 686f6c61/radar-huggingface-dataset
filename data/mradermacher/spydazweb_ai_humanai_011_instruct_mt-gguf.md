# mradermacher/SpydazWeb_AI_HumanAI_011_INSTRUCT_MT-GGUF

## Resumen

SpydazWeb_AI_HumanAI_011_INSTRUCT_MT es un modelo de lenguaje de 7.241.732.096 parametros (aproximadamente 7,2 mil millones) publicado originalmente por LeroyDyer bajo el identificador LeroyDyer/SpydazWeb_AI_HumanAI_011_INSTRUCT_MT. La ficha que nos ocupa corresponde a la version cuantizada en formato GGUF realizada por mradermacher, un conocido distribuidor de cuantizaciones de la comunidad open source. El modelo esta etiquetado como un merge (fusion) construido con mergekit y afinado mediante SFT con las librerias unsloth y trl, lo que sugiere un proceso de ajuste supervisado sobre una base fusionada de modelos previos.

El modelo se presenta como un modelo instructivo orientado a conversacion y generacion de texto en ingles, con un unico idioma declarado (en). No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks. La relevancia actual del artefacto reside en su disponibilidad en multiples cuantizaciones GGUF (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que permite ejecutarlo en hardware de consumo, si bien su adopcion es muy limitada (40 descargas y 0 likes en el momento de la consulta).

Se trata, por tanto, de un modelo de nicho, sin documentacion tecnica detallada ni evaluaciones publicadas, cuyo interes principal es la posibilidad de desplegarlo localmente gracias al trabajo de cuantizacion de mradermacher. Cualquier evaluacion rigurosa de su calidad requerira pruebas propias por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como merge con mergekit; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 7.241.732.096 (7,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Las etiquetas de la model card indican que se trata de un merge construido con mergekit (fusion de pesos de modelos previos) y posteriormente sometido a un ajuste supervisado (SFT) mediante las librerias unsloth y trl. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El unico dato tecnico verificable es el recuento de parametros a partir de los pesos en safetensors del modelo base (7.241.732.096), coherente con un modelo denso de ~7B. La cuantizacion GGUF la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye tanto cuantizaciones estaticas como, en un repositorio separado, cuantizaciones ponderadas con imatrix (sufijo -i1-GGUF).

## Capacidades

- Generacion de texto en ingles y formato instructivo (etiqueta INSTRUCT en el nombre).
- Conversacion multi-turno presumible, derivada del ajuste SFT, aunque no documentada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se documentan capacidades de vision, audio ni modo thinking.
- Ejecutable localmente mediante llama.cpp y derivados gracias al formato GGUF.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: el modelo puede cargarse en llama.cpp u Ollama con cuantizaciones Q4_K_M (4,5 GB) y emplearse para experimentar con prompts instructivos sin depender de APIs externas.
- Generacion de texto creativo y redaccion en ingles: adecuado para borradores, resumenes y reescritura en entornos donde el coste por token importa, al ejecutarse en hardware propio.
- Educacion e investigacion: util como caso de estudio de merges de modelos y pipelines de cuantizacion (mergekit + unsloth + trl), no tanto por su calidad absoluta como por su trazabilidad de construccion.
- Despliegue en equipos con GPU de consumo: las variantes Q4_K_S y Q4_K_M (4,2-4,5 GB) caben en GPUs de 8 GB, permitiendo inferencia local en estaciones de trabajo modestas.
- Filtrado y clasificacion de texto simple en ingles: tareas de etiquetado o extraccion ligera donde no se requiere un modelo de gran escala.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 13 variantes de cuantizacion, lo que permite medir el impacto de la compresion en perplejidad y calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB (Q2_K), 4-4,5 GB (Q4_K_S/Q4_K_M), 5-6 GB (Q5/Q6), 8 GB (Q8_0) y ~15 GB (f16), segun los tamanos de fichero indicados en la model card.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070) para cuantizaciones Q4; GPU de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) para Q6/Q8; A100 o H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M; las variantes Q2/Q3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se documenta configuracion especifica.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SpydazWeb_AI_HumanAI_011_INSTRUCT_MT (este) | 7,2 B | no disponible | no disponible | GGUF, safetensors | Merge + SFT, solo ingles, sin benchmarks |
| Mistral 7B Instruct | 7,2 B | 32k (v0.2) | Apache 2.0 | safetensors, GGUF | Referencia de la categoria 7B, benchmarks publicos |
| Llama 3.1 8B Instruct | 8,0 B | 128k | Llama 3.1 Community License | safetensors, GGUF | Ampliamente evaluado, multilingue |
| Qwen2.5 7B Instruct | 7,6 B | 128k | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |

La comparacion se ofrece como referencia de categoria; no existen datos publicados que permitan comparar el rendimiento de este modelo con las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a modelos establecidos.
- Licencia no disponible: no puede confirmarse si se permite el uso comercial; debe contactarse con el autor original antes de usarlo en produccion.
- Solo soporta ingles segun la etiqueta de idioma; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto desconocida: no es posible planificar aplicaciones que requieran ventanas largas.
- Riesgo de alucinacion inherente a los modelos de ~7B sin evaluacion publica; se recomienda validacion humana en tareas factuales.
- Procede de un merge de modelos sin documentacion de los componentes originales, lo que dificulta auditar sesgos y procedencia de los datos.
- Adopcion muy baja (40 descargas, 0 likes): escasa comunidad, pocos reportes de errores y soporte limitado.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SpydazWeb_AI_HumanAI_011_INSTRUCT_MT-GGUF
- Modelo base: https://huggingface.co/LeroyDyer/SpydazWeb_AI_HumanAI_011_INSTRUCT_MT
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/SpydazWeb_AI_HumanAI_011_INSTRUCT_MT-i1-GGUF
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#SpydazWeb_AI_HumanAI_011_INSTRUCT_MT-GGUF
- Variante relacionada (INSTRUCT-GGUF): https://huggingface.co/mradermacher/SpydazWeb_AI_HumanAI_011_INSTRUCT-GGUF
- Variante relacionada (INSTRUCT_MX-GGUF): https://huggingface.co/mradermacher/SpydazWeb_AI_HumanAI_011_INSTRUCT_MX-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
