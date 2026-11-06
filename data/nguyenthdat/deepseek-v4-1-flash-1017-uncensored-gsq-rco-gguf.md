# nguyenthdat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 Uncensored GSQ-RCO es una redistribucion en formato GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, en su variante "uncensored" publicada por AtomicChat y cuantizada con el esquema GSQ-RCO por ISTA-DASLab. El repositorio que nos ocupa, mantenido por el usuario nguyenthdat, no introduce cambios en los pesos: reescribe los tensores de AtomicChat en el layout que carga el llama.cpp upstream (arquitectura `deepseek41`, release b11870 o superior), corrigiendo las claves de metadatos que el fork Strata interpreta pero que el llama.cpp oficial rechaza.

El modelo base es un transformer de DeepSeek con capacidad de razonamiento (modo thinking configurable mediante `--reasoning` y `--reasoning-effort`) y un componente denominado "Engram" que actua como tabla de conocimiento compartida y que se distribuye como fichero separado. La cuantizacion es agresiva: IQ2_XXS para el backbone (138,2 GB repartidos en cinco shards) mas una tabla Engram en IQ4_NL de 110,6 GB que no se incluye en este repositorio y debe descargarse de ISTA-DASLab y enlazarse simbolicamente.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de portabilidad de un modelo de gran tamano entre ecosistemas de inferencia incompatibles (Strata frente a llama.cpp upstream); por otro, advierte de que la variante "uncensored" elimina parte de los rechazos del modelo original, lo que traslada al operador toda la responsabilidad legal y etica del uso. La licencia declarada es MIT, heredada del modelo base y de los dos repositorios intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `deepseek41` en llama.cpp), con modo de razonamiento y tabla Engram externa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (backbone), IQ4_NL (tabla Engram) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards nominales: 1 de metadatos, 4 de backbone, 1 Engram externo) |
| Tamano del repositorio | 138,2 GB (backbone); +110,6 GB de Engram enlazado externamente |
| Version minima de llama.cpp | b11870 |
| Fecha de publicacion | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de DeepSeek del que no se detallan en la informacion disponible ni el numero de parametros, ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de RLHF o DPO. Lo que si se documenta es la presencia de dos elementos estructurales poco habituales: un modo de razonamiento explicito, activable en llama.cpp con `--reasoning on` y graduable con `--reasoning-effort 50`, y una tabla Engram que actua como memoria de conocimiento compartida y que se consulta una fila por token mediante memory-mapping.

La cadena de transformaciones hasta este repositorio es relevante para entender que se esta descargando. ISTA-DASLab tomo el modelo original de DeepSeek y lo cuantizo con su esquema GSQ-RCO, generando tambien el fichero Engram independiente en IQ4_NL. AtomicChat aplico sobre esa cuantizacion una edicion "uncensored" que afecta a tres tensores concretos: la salida de atencion, la proyeccion descendente del experto compartido y el valor de Engram. Sobre esa version, nguyenthdat ha reescrito el layout sin recuantizar: los tensores cuantizados se copian byte a byte y se verifica su SHA-256 contra el tensor de origen, y solo se modifican los metadatos (claves upstream, `engram_gate = q × k` en F32, el sesgo del router de vision, el `attn_output_a` en 2-D y un primer shard que contiene unicamente metadatos). El chat template es el `chat_template.jinja` actual de ISTA.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking activable y esfuerzo de razonamiento configurable.
- Procesamiento de vision: la presencia de un sesgo de router de vision en los metadatos reescritos sugiere soporte multimodal, aunque la informacion disponible no detalla el alcance.
- Consulta a una tabla Engram externa de conocimiento, mapeada en memoria y leida fila a fila por token.
- Ejecucion en llama.cpp upstream mediante `llama-server`, con soporte de offload parcial de expertos a CPU.
- Variante "uncensored": responde a peticiones que el modelo original rechaza.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de razonamiento de gran tamano en hardware no enterprise: gracias a la cuantizacion IQ2_XXS y al offload de expertos con `--n-cpu-moe`, el modelo puede ejecutarse en un servidor con GPU de gama alta pero VRAM insuficiente para los pesos completos, aceptando una penalizacion de latencia.
- Investigacion sobre cuantizacion extrema: el par IQ2_XXS (backbone) mas IQ4_NL (Engram) permite estudiar la degradacion de calidad a 2 bits efectivos en un modelo de gran tamano, comparando contra las variantes de mayor precision del mismo autor.
- Analisis de alineacion y rechazos: la edicion uncensored de AtomicChat sobre tres tensores concretos constituye un caso de estudio controlado sobre que componentes concentran el comportamiento de rechazo, util para equipos de seguridad de IA.
- Experimentacion con arquitecturas de memoria externa: la tabla Engram mapeada en memoria y consultada por token es un patron poco comun que puede servir de base para prototipos de recuperacion de conocimiento sin coste de VRAM.
- Inferencia local de razonamiento en un solo nodo: con aproximadamente 170 GB de VRAM se mantiene todo el backbone en GPU; con menos, el particionado CPU/GPU permite un compromiso entre coste y throughput.
- Validacion de portabilidad entre runtimes: el repositorio documenta explicitamente la diferencia de layout entre Strata y llama.cpp upstream, lo que lo convierte en material de referencia para quien necesite migrar modelos entre ambos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha de AtomicChat para benchmarks, mediciones de rechazo y limitaciones del modelo fuente, sin reproducir cifras.

## Requisitos de hardware

- VRAM para backbone completo en GPU: aproximadamente 170 GB.
- VRAM para cuantizacion IQ2_XXS del backbone: 138,2 GB de pesos, mas overhead de contexto y KV cache.
- Tabla Engram (110,6 GB, IQ4_NL): no requiere VRAM ni RAM, se mapea en memoria y se lee una fila por token.
- GPU recomendadas: no disponibles de forma explicita; por capacidad, el backbone completo exige configuraciones multi-GPU (varias A100 80 GB o H100 80 GB). Una RTX 4090 (24 GB) no puede alojar el backbone y obliga a offload masivo de expertos a CPU.
- Cabe en consumer GPU: no de forma completa; solo con `--n-cpu-moe` y aceptando latencia elevada.
- Opciones de despliegue: llama.cpp upstream b11870 o superior (`llama-server`). El layout de Strata no es compatible con llama.cpp upstream.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (nguyenthdat) | no disponible | no disponible | GGUF IQ2_XXS + Engram IQ4_NL | MIT | Layout compatible con llama.cpp upstream b11870+ |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF | no disponible | no disponible | GGUF, 4 shards | MIT | Layout para Strata; edicion uncensored |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | GGUF + Engram IQ4_NL | MIT | Cuantizacion GSQ-RCO sin edicion uncensored |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | safetensors (presumiblemente) | MIT | Modelo base original de DeepSeek |

Las tres variantes derivadas comparten pesos y difieren en layout, edicion de comportamiento y empaquetado; el modelo base es el unico sin cuantizar. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- La variante uncensored responde a peticiones que el modelo original declina; el operador asume toda la responsabilidad legal y etica sobre el contenido generado.
- La cuantizacion IQ2_XXS es extremadamente agresiva (2 bits por peso en el backbone) y previsiblemente degrada la calidad frente al modelo base; no se han publicado mediciones en la informacion disponible.
- El repositorio no incluye el shard 6 (tabla Engram); sin descargar el fichero de ISTA-DASLab y crear el enlace simbolico, el modelo no arranca.
- Requiere llama.cpp b11870 o superior; versiones anteriores o el fork Strata fallan con `array key not found: deepseek41.attention.kv_source_layers`.
- El modelo base, la cuantizacion y la edicion uncensored estan documentados de forma muy escueta: no hay datos de sesgos, tasas de alucinacion, cobertura idiomatica ni evaluaciones de seguridad.
- La licencia MIT se hereda de la cadena de repositorios, pero la ausencia de documentacion sobre el modelo base impide verificar restricciones adicionales de uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria sobre su correcto funcionamiento.
- El modelo esta fechado en 2026-11-04, posterior a la cuantizacion de ISTA (27 de octubre) y a la de AtomicChat (revision 4f1d2f7); la trazabilidad de revisiones depende de que esos repositorios sigan publicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nguyenthdat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizacion GSQ-RCO y tabla Engram (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Edicion uncensored (AtomicChat): https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Script de conversion: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF/blob/65d53bc8be65123e255ff02f3ded958b6dbf54fd/convert_ds41_upstream.py
- Release de llama.cpp b11870: https://github.com/ggml-org/llama.cpp/releases/tag/b11870
- Runtime Strata: https://github.com/Niko1221/Strata
