# mradermacher/Huihui-Qwen3-Omni-30B-A3B-Thinking-abliterated-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Huihui-Qwen3-Omni-30B-A3B-Thinking-abliterated-i1-GGUF`, una cuantizacion en formato GGUF generada por el usuario mradermacher. No es un modelo entrenado desde cero: es la conversion a GGUF (con cuantizacion ponderada mediante fichero imatrix) de `huihui-ai/Huihui-Qwen3-Omni-30B-A3B-Thinking-abliterated`, que a su vez es una version "abliterated" (sin censura, con las direcciones de rechazo eliminadas) del modelo multimodal Qwen3-Omni-30B-A3B-Thinking de Alibaba. El modelo cuenta con 30.532.646.912 parametros totales (unos 30,5 B) en una arquitectura de mezcla de expertos con aproximadamente 3 B de parametros activos por token, segun se deduce de la denominacion "30B-A3B".

El interes de esta publicacion es doble. Por un lado, ofrece el modelo en decenas de niveles de cuantizacion (desde IQ1_S de 6,5 GB hasta Q6_K), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama, algo inviable con los pesos originales. Por otro, incorpora la variante "abliterated", que elimina los comportamientos de rechazo del modelo original, un aspecto relevante para investigacion sobre alineamiento y seguridad, pero tambien con implicaciones claras de riesgo.

La licencia declarada es Apache 2.0, heredada del modelo base, y la model card solo declara el idioma ingles. Se trata de un modelo multimodal (omni) con modo "thinking", aunque la informacion proporcionada no detalla la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (Qwen3-Omni); detalles completos no disponibles |
| Parametros totales | 30.532.646.912 (~30,5 B) |
| Parametros activos | ~3 B (derivado de la denominacion "A3B"; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, asi como fichero imatrix |
| Idiomas soportados | en (segun la model card); capacidades multilingues del modelo base no confirmadas en la informacion disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion tipo i1 / imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Qwen3-Omni de Alibaba, con una arquitectura de mezcla de expertos de aproximadamente 30,5 B de parametros totales y unos 3 B activos por token. La variante "Thinking" incorpora un modo de razonamiento explicito antes de la respuesta final. Sobre ese modelo, el usuario huihui-ai aplico una tecnica de "abliteration" (ablation direccional de las direcciones de activacion asociadas al rechazo), cuyo efecto es la eliminacion de las negativas del modelo ante determinadas peticiones. mradermacher ha realizado despues la conversion a GGUF y la cuantizacion con fichero imatrix (`quantize_version: 2`, `output_tensor_quantised: 1`), un metodo que pondera los tensores segun su importancia para reducir la perdida de calidad en cuantizaciones agresivas.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original. Tampoco se detalla si la publicacion incluye el proyector multimodal (`mmproj`) necesario para explotar las capacidades de vision y audio, aunque la presencia de un campo `skip_mmproj` vacio en la model card sugiere que no se omite.

## Capacidades

- Generacion de texto conversacional en ingles, con modo de razonamiento previo ("thinking") segun la denominacion del modelo.
- Capacidades multimodales propias de la familia Omni (texto, imagen, audio y video) en el modelo base; no confirmadas para esta cuantizacion concreta en la informacion disponible.
- Modelo "uncensored" / "abliterated": responde a peticiones que el modelo original rechazaria.
- Compatibilidad declarada con `transformers` y con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara ingles.
- Capacidades especiales: modo thinking confirmado por el nombre; vision y audio no verificados en esta publicacion.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar el comportamiento de un modelo abliterated frente a su version original permite estudiar como se distribuyen las direcciones de rechazo y que capacidades se degradan al eliminarlas.
- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M (18,7 GB) o inferiores, el modelo cabe en una GPU de 24 GB y permite iterar en local sin coste de API.
- Analisis de contenido sensible en entornos controlados: equipos de moderacion o de red teaming pueden usar la variante sin censura para anticipar respuestas maliciosas que un modelo alineado bloquearia, siempre con las salvaguardas organizativas adecuadas.
- Despliegue en entornos sin conectividad: al distribuirse en GGUF, puede ejecutarse en llama.cpp u Ollama sobre estaciones de trabajo aisladas, util en investigacion con datos que no pueden salir de la organizacion.
- Evaluacion comparativa de cuantizaciones: gracias a los mas de 20 niveles de cuantizacion publicados, es posible medir empiricamente la degradacion de calidad entre IQ1_S, Q4_K_M o Q6_K sobre una misma tarea.
- Generacion asistida en pipelines de investigacion en humanidades o linguistica computacional donde se requiera un modelo multimodal en ingles y se trabaje en local.
- Experimentacion con el modo thinking: estudiar la utilidad del razonamiento explicito en tareas de varios pasos, comparando las salidas con y sin esa fase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun el tamano de fichero de cada cuantizacion (a la que hay que sumar el espacio de cache KV y overhead del runtime):
  - i1-IQ1_S: ~6,5 GB.
  - i1-IQ2_M: ~10,3 GB.
  - i1-IQ3_M: ~13,6 GB.
  - i1-IQ4_XS: ~16,5 GB.
  - i1-Q4_K_M: ~18,7 GB.
  - i1-Q4_1: ~19,3 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones hasta Q4_1 con margen limitado; A100 40 GB, L40S o H100 para Q5_K_M, Q6_K y para mantener contextos largos en memoria.
- Cabe en GPU de consumo: si. Una RTX 4090, RTX 3090 o RTX 4080 de 16 GB pueden ejecutar las cuantizaciones bajas (IQ1 a IQ3); las GPU de 24 GB llegan hasta Q4_K_M y Q4_1.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF. El soporte en vLLM o TGI no esta confirmado para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3-Omni-30B-A3B-Thinking-abliterated (i1-GGUF) | ~30,5 B totales / ~3 B activos | no disponible | Si (modelo base) | Apache 2.0 | GGUF en este repositorio |
| Qwen3-Omni-30B-A3B-Thinking (original) | ~30,5 B totales / ~3 B activos | no disponible | Si | Apache 2.0 | Pesos safetensors en HuggingFace |
| Qwen3-30B-A3B (texto) | ~30 B totales / ~3 B activos | no disponible | No | Apache 2.0 | Pesos y cuantizaciones en HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo del modelo: es previsible que genere contenido que el modelo original bloquearia, incluido material ofensivo, peligroso o ilegal. No es apto para uso en produccion orientada al publico sin filtros externos.
- La cuantizacion introduce perdida de calidad, especialmente en los niveles bajos. La propia model card califica IQ1_S como "for the desperate" y Q2_K_S como "very low quality"; en MoE la degradacion puede afectar de forma desigual a distintos expertos.
- Riesgo de alucinacion no cuantificado: no hay benchmarks disponibles para esta publicacion.
- La model card solo declara ingles; el uso en castellano u otros idiomas no esta verificado.
- Longitud de contexto no disponible: conviene determinarla empiricamente antes de disenar aplicaciones con contexto largo.
- No se confirma la inclusion del proyector multimodal en los GGUF, por lo que las capacidades de vision y audio podrian no estar operativas segun el runtime.
- Aunque la licencia es Apache 2.0, la ausencia de alineamiento de seguridad traslada al desplegador toda la responsabilidad legal y etica sobre el contenido generado.
- El repositorio completo ocupa 324,1 GB; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Huihui-Qwen3-Omni-30B-A3B-Thinking-abliterated-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3-Omni-30B-A3B-Thinking-abliterated
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Huihui-Qwen3-Omni-30B-A3B-Thinking-abliterated-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Huihui-Qwen3-Omni-30B-A3B-Thinking-abliterated-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o repositorio del modelo original Qwen3-Omni: no disponible en la informacion proporcionada.
