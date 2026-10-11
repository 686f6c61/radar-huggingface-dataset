# mradermacher/Qwen3-235B-A22B-GGUF

## Resumen

Qwen3-235B-A22B es un modelo de lenguaje de gran escala desarrollado por Alibaba (familia Qwen) y publicado como pesos abiertos. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 235.000 millones de parametros totales y 22.000 millones de parametros activos por token, lo que combina una capacidad de representacion propia de un modelo denso muy grande con un coste de inferencia mas cercano al de un modelo de 22B. La model card y los resultados de busqueda lo describen como el modelo insignia de Alibaba Cloud para tareas de linguistica computacional y resolucion de problemas STEM, con modos de razonamiento dinamicos ("thinking" y no-thinking).

La ficha que nos ocupa no es el modelo original, sino una recuantizacion a formato GGUF realizada por el usuario mradermacher a partir del modelo base Qwen/Qwen3-235B-A22B. El repositorio ofrece un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta Q8_0) pensadas para ejecucion en llama.cpp y derivados, con tamanos que van de 85,8 GB a 250 GB repartidos en varios archivos parciales.

Su relevancia actual radica en que permite ejecutar localmente un MoE de 235B parametros en hardware que no dispone de VRAM suficiente para los pesos completos en precision nativa, siempre que se acepte la perdida de calidad asociada a las cuantizaciones mas agresivas. La licencia Apache 2.0 facilita su uso comercial, si bien el repositorio declara ingles como idioma principal a efectos de etiquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (segun descripcion del modelo base) |
| Parametros totales | 235.000 millones |
| Parametros activos | 22.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun etiquetado del repo); los resultados de busqueda citan soporte del modelo base para 119 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas, divididas en partes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de tipo Mixture of Experts: de los 235.000 millones de parametros totales solo se activan 22.000 millones por token, de modo que el coste computacional de cada paso de decodificacion se aproxima al de un modelo denso de 22B. Los resultados de busqueda indican que integra modos de razonamiento dinamicos (un modo "thinking" y un modo rapido sin cadena de razonamiento explicita) y que el modelo base fue disenado para tareas de linguistica computacional y problemas STEM.

No se dispone, en la informacion proporcionada, de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El repositorio de mradermacher es exclusivamente una recuantizacion: no introduce cambios en los pesos mas alla de la propia cuantizacion, y usa cuantizaciones estaticas (no imatrix/weighted, que el autor publica en un repositorio separado).

## Capacidades

- Generacion de texto y razonamiento general, con soporte de un modo de razonamiento explicito y un modo directo segun el modelo base.
- Resolucion de problemas de matematicas y STEM (el modelo base esta posicionado especificamente para este tipo de tareas).
- Generacion y comprension de codigo (capacidad habitual de la familia Qwen3).
- Capacidades multilingues: los resultados de busqueda atribuyen al modelo base soporte de hasta 119 idiomas, aunque el repositorio GGUF solo etiqueta "en".
- Uso conversacional multi-turno.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta ficha concreta.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Razonamiento STEM asistido: dado que el modelo base esta orientado a matematicas y disciplinas cientificas, la cuantizacion Q4_K_M o superior puede emplearse para resolver problemas paso a paso en un entorno local, aceptando que las cuantizaciones bajas degradan la precision aritmetica.
- Despliegue on-premise con soberania de datos: al ejecutarse con llama.cpp sobre pesos GGUF, permite mantener los datos dentro de la infraestructura propia, sin depender de APIs externas, algo relevante en entornos regulados.
- Generacion de codigo en pipelines internos: integrable en herramientas de revision o generacion asistida siempre que se valide la salida, dado que no se confirma tool calling en esta ficha.
- Procesamiento por lotes de documentos en ingles: para tareas de resumen, extraccion o clasificacion donde el volumen hace inviable usar un servicio por token.
- Experimentacion e investigacion: reproducir resultados o evaluar tecnicas de cuantizacion sobre un MoE grande comparando Q4_K_S frente a Q8_0 y midiendo el impacto en calidad.
- Servicio de chat self-hosted: con una cuantizacion Q5 o Q6 en un nodo con varias GPUs, se puede ofrecer un endpoint de conversacion con calidad cercana al modelo original.
- Fine-tuning o evaluacion comparativa: usar los pesos GGUF como referencia para comparar cuantizaciones frente a los pesos originales en formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano en disco de los pesos):
  - Q2_K: 85,8 GB (2 partes).
  - Q3_K_S: 101,5 GB (3 partes); Q3_K_M: 112,5 GB; Q3_K_L: 121,9 GB.
  - IQ4_XS: 126,8 GB.
  - Q4_K_S: 133,8 GB (marcado como "fast, recommended"); Q4_K_M: 142,3 GB.
  - Q5_K_S: 162,0 GB; Q5_K_M: 166,9 GB.
  - Q6_K: 193,1 GB ("very good quality").
  - Q8_0: 250,0 GB ("fast, best quality").
- No cabe en ninguna GPU de consumo individual: incluso la cuantizacion mas baja (Q2_K, 85,8 GB) supera la VRAM de una RTX 4090 (24 GB), de una RTX 5090 (32 GB) o de una A100 de 40 GB.
- GPU recomendadas para despliegue multitarjeta: A100 80 GB, H100 80 GB o similares, combinadas con CPU/RAM para el offloading de capas no residentes en VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extension servidores compatibles con GGUF como llama.cpp server u Ollama; el repositorio declara compatibilidad con "endpoints_compatible".
- Latencia y throughput: no disponible. Al ser MoE con 22B activos, el coste por token es inferior al de un denso de 235B, pero dominado por el ancho de banda de memoria al repartir el modelo entre varios dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-235B-A22B (este repo, GGUF de mradermacher) | 235B / 22B | no disponible | Apache 2.0 | GGUF | HuggingFace (mradermacher) |
| Qwen3-235B-A22B original | 235B / 22B | no disponible | Apache 2.0 | safetensors | HuggingFace (Qwen) |
| Qwen3-235B-A22B-abliterated (i1-GGUF, mradermacher) | 235B / 22B | no disponible | Apache 2.0 | GGUF | HuggingFace (mradermacher) |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada. La principal diferencia entre el modelo original y esta ficha es el formato (safetensors frente a GGUF) y la disponibilidad de cuantizaciones; la version abliterated constituye una variante sin censura con el mismo tamano.

## Limitaciones y advertencias

- Las cuantizaciones de baja precision (Q2_K, Q3_*) degradan la calidad de forma notable; el autor marca Q3_K_M como "lower quality". Para razonamiento STEM conviene Q5_K_M o superior.
- El etiquetado del repositorio solo declara ingles; aun cuando el modelo base admite mas idiomas, no hay garantia de calidad multilingue en esta recuantizacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado por la cuantizacion y especialmente relevante en tareas factuales o matematicas de varios pasos.
- No se confirman en la informacion disponible capacidades de tool calling ni de agentes multi-paso para esta ficha concreta.
- El repositorio es de gran tamano (1595,6 GB total) y los pesos estan divididos en multiples partes; es necesario concatenarlas correctamente antes de usarlas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base para condiciones adicionales.
- El modelo base esta sujeto a los sesgos de sus datos de entrenamiento, no documentados en la informacion disponible.
- Ausencia de benchmarks publicados en la informacion disponible: no hay evidencia cuantitativa del impacto de cada cuantizacion en tareas concretas.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Qwen3-235B-A22B-GGUF
- Cuantizaciones weighted/imatrix del mismo autor: https://huggingface.co/mradermacher/Qwen3-235B-A22B-i1-GGUF
- Variante abliterated (i1-GGUF): https://huggingface.co/mradermacher/Qwen3-235B-A22B-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/LICENSE
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Qwen3-235B-A22B-GGUF
- Referencia sobre uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Ficha de specs y VRAM (terceros): https://apxml.com/models/qwen3-235b-a22b
- Modelo en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-235b-a22b.html
- Ficha en aibase: https://model.aibase.com/en/models/details/1924737573348184064
