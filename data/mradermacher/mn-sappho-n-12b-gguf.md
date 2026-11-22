# mradermacher/MN-Sappho-n-12B-GGUF

## Resumen

MN-Sappho-n-12B-GGUF es la distribucion en formato GGUF del modelo MN-Sappho-n-12B, un merge de modelos creado por la organizacion mergekit-community mediante la herramienta mergekit. La cuantizacion la realiza mradermacher, un conocido generador de cuantizaciones GGUF en Hugging Face, y esta pensada para facilitar la inferencia local del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base cuenta con 12.247.782.400 parametros (aproximadamente 12,2 mil millones) y esta etiquetado como modelo en ingles. La model card original no aporta detalles sobre la arquitectura subyacente, los datos de entrenamiento ni los benchmarks, algo habitual en merges comunitarios que combinan pesos de modelos existentes sin un entrenamiento adicional.

La relevancia de esta ficha radica en que ofrece el modelo en una amplia gama de cuantizaciones (desde Q2_K hasta Q8_0), lo que permite desplegarlo en GPUs de consumo con distintos niveles de compromiso entre calidad y VRAM. El repositorio ocupa 84,7 GB en total y acumula 33 descargas y 2 likes en el momento de la consulta, lo que indica una adopcion modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base es un merge de mergekit) |
| Parametros totales | 12.247.782.400 (aproximadamente 12,2 B) |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base original en safetensors (transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mergekit-community/MN-Sappho-n-12B. Por la etiqueta `mergekit` y `merge`, se trata de un modelo resultante de la fusion de pesos de otros modelos mediante la herramienta mergekit, no de un entrenamiento desde cero. Este tipo de merges suele combinar modelos de la misma familia o arquitectura compatible para agregar capacidades, pero la model card no especifica que modelos se combinaron, con que metodo de merge (SLERP, TIES, DARE, linear, etc.) ni con que hiperparametros.

Tampoco se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste fino adicional. Las cuantizaciones GGUF de mradermacher se generan a partir del modelo en formato HF (convert_type: hf) y, segun los metadatos de la model card, se han producido tanto cuantizaciones estaticas como variantes con imatrix (repo MN-Sappho-n-12B-i1-GGUF), que suelen ofrecer mejor calidad por bit en tamanos bajos.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para el idioma ingles.
- Razonamiento y conversacion general: capacidades heredadas del merge, sin documentacion especifica.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.

## Casos de uso

- Inferencia local en estaciones de trabajo: con cuantizaciones Q4_K_M (7,6 GB) o Q5_K_M (8,8 GB), el modelo puede ejecutarse en GPUs de consumo de 12-16 GB de VRAM, lo que lo hace adecuado para prototipado y experimentacion sin depender de la nube.
- Generacion de texto en ingles para asistentes internos: al estar orientado al ingles, encaja en herramientas de redaccion, resumen o reescritura de contenido en ese idioma.
- Experimentacion con merges comunitarios: util para investigadores que quieran evaluar el comportamiento de un merge de 12B frente a sus modelos de origen, comparando calidad en tareas concretas.
- Despliegue con llama.cpp u Ollama: el formato GGUF y la disponibilidad de cuantizaciones Q4/Q5 permiten integrarlo en pipelines locales con CPU+GPU o solo CPU en equipos con suficiente RAM.
- Servicio de inferencia con vLLM u otros backends compatibles: aunque el repo es GGUF, el modelo base en safetensors puede servirse con backends que soporten transformers; util para entornos con GPU de datacenter.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de Q2_K a Q8_0 permite medir el impacto de la cuantizacion en la calidad de salida para un mismo modelo, algo util para calibrar compromisos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 4,9 GB
  - Q3_K_M: aproximadamente 6,2 GB
  - IQ4_XS: aproximadamente 6,9 GB
  - Q4_K_M: aproximadamente 7,6 GB
  - Q5_K_M: aproximadamente 8,8 GB
  - Q6_K: aproximadamente 10,2 GB
  - Q8_0: aproximadamente 13,1 GB
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M; RTX 4070 Ti / 4080 (16 GB) para Q5/Q6; RTX 4090 (24 GB) o A100/H100 para Q8_0 con contexto amplio.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas para cuantizaciones Q4; en 8 GB solo con Q2_K/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros backends compatibles con GGUF. El modelo base en safetensors puede servirse con transformers, vLLM o TGI si la arquitectura es compatible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MN-Sappho-n-12B-GGUF | 12,2 B | no disponible | no disponible | GGUF | Hugging Face (33 descargas) |
| Modelos merge de 12B en mergekit-community | variable | no disponible | variable | safetensors/GGUF | Hugging Face |
| Mistral-Nemo-12B (referencia de tamano) | 12 B | 128k (segun su model card) | Apache 2.0 (segun su model card) | safetensors/GGUF | Hugging Face |
| Gemma-2-9B (referencia de tamano cercano) | 9 B | 8k (segun su model card) | Gemma license | safetensors/GGUF | Hugging Face |

Nota: la comparativa con Mistral-Nemo-12B y Gemma-2-9B se incluye solo como referencia de tamano y categoria; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: la model card no detalla arquitectura, datos de entrenamiento, contexto ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (mergekit-community/MN-Sappho-n-12B) y de los modelos de origen del merge antes de usarlo en produccion.
- Solo ingles: no se recomienda su uso en castellano u otros idiomas sin evaluacion previa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas, el riesgo no esta cuantificado.
- Sesgos: al ser un merge de modelos no documentados, los sesgos heredados de los modelos de origen son desconocidos.
- Contexto desconocido: no se puede planificar el uso con documentos largos sin conocer la ventana de contexto real.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas como de menor calidad en la propia model card; para produccion se recomienda Q4_K_M o superior.
- Adopcion limitada: 33 descargas y 2 likes indican poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MN-Sappho-n-12B-GGUF
- Modelo base: https://huggingface.co/mergekit-community/MN-Sappho-n-12B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/MN-Sappho-n-12B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MN-Sappho-n-12B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
