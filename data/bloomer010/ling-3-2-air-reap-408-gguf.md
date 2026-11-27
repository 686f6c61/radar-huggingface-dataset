# bloomer010/Ling-3.2-air-REAP-408-GGUF

## Resumen

Ling-3.2-air-REAP-408 es una variante podada del modelo Ling-3.2-air de inclusionAI, publicada por el usuario bloomer010 en formato GGUF para llama.cpp. El modelo original es un transformer de mezcla de expertos (MoE) de 124.000 millones de parametros totales con 5.500 millones activos por token; esta version aplica una poda de expertos en un solo paso (REAP, Router-weighted Expert Activation Pruning) que elimina el 20% de los expertos enrutados, dejando 408 de 512 por capa y reduciendo el total a aproximadamente 99.870 millones de parametros.

El modelo es multimodal: procesa texto, imagen y video mediante una torre de vision que se distribuye como archivo `mmproj` separado. Mantiene el modo de razonamiento (thinking) activado por defecto y esta pensado para conversacion, generacion de codigo, matematicas y tareas de razonamiento multi-paso. La poda no incluye reentrenamiento ni recuperacion, de modo que la calidad depende directamente de la seleccion de expertos realizada sobre un conjunto de calibracion de 653.000 tokens.

La relevancia practica de esta ficha esta en que permite ejecutar un MoE de ~100.000 millones de parametros en hardware de consumo mediante cuantizacion agresiva (hasta Q2_K) y descarga de expertos a CPU con llama.cpp, algo imposible con los pesos BF16 originales. La licencia MIT facilita el uso comercial, aunque el autor la etiqueta explicitamente como "experimental".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (BailingMoE3) con torre de vision; poda REAP de expertos enrutados |
| Parametros totales | 99.866.879.392 (~99,87 B) tras la poda; 124 B en el modelo base |
| Parametros activos | ~5,5 B por token |
| Longitud de contexto | Hasta 131.072 tokens en los ejemplos de llama-server (contexto nativo del modelo base: no disponible) |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q2_K (GGUF); FP8 safetensors en repositorio hermano |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors FP8 en repositorio separado; `mmproj-model-f16.gguf` de 875 MB para vision |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air es un transformer de mezcla de expertos con 124.000 millones de parametros totales y 5.500 millones activos, organizado en 8 grupos de enrutamiento (`n_group=8`) con 64 expertos por grupo (512 expertos enrutados por capa) y enrutamiento top-k agrupado. Incluye una torre de vision que codifica imagenes y fotogramas de video, y un bloque NextN/MTP (multi-token prediction) que se omite en esta version podada. Los detalles exactos de composicion del dataset de preentrenamiento, numero de tokens y etapas de RLHF/DPO del modelo original no estan disponibles en la informacion proporcionada.

La innovacion de esta ficha es la poda REAP (arXiv:2510.13999), aplicada en un solo paso: cada experto se puntua multiplicando el valor de su compuerta de enrutamiento por la norma L2 de su salida sobre un conjunto de calibracion de 653.000 tokens (1.024 muestras, con mezcla 75/15/10 de codigo, matematicas y razonamiento, y chat general). Los expertos con menor puntuacion se eliminan de forma uniforme dentro de cada grupo de enrutamiento para preservar el top-k agrupado, conservando 51 de 64 expertos por grupo (408 de 512 en total). No hay fine-tuning ni entrenamiento de recuperacion posterior a la poda.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo.
- Razonamiento con modo "thinking" activado por defecto; se puede desactivar por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Generacion de codigo y resolucion de problemas matematicos (el conjunto de calibracion incluye un 75% de datos de codigo).
- Vision: descripcion y comprension de imagenes mediante entrada `image_url` en la API compatible con OpenAI.
- Video: procesamiento de video mediante partes `video_url`; los fotogramas se muestrean y codifican con la misma torre de vision.
- Soporte de plantillas Jinja (`--jinja`) para formateo de chat y tool calling segun la plantilla del modelo base.
- Capacidades multilingues: no disponible en detalle.
- Despliegue en llama.cpp estandar desde la build b11190.

## Casos de uso

- Asistente conversacional de contexto largo: con 131.072 tokens de ventana puede mantener conversaciones extensas o procesar documentos largos completos sin truncar, manteniendo coherencia multi-turno.
- Analisis de documentos con imagenes: extraccion y descripcion de contenido de capturas, diagramas o paginas escaneadas usando la entrada `image_url`, util para digitalizacion y accesibilidad.
- Procesamiento de video para resumenes: muestreo de fotogramas via `video_url` para generar descripciones, resumenes o alertas sobre contenido audiovisual.
- Generacion de codigo en local: el sesgo del calibrado hacia codigo (75%) y el modo thinking lo hacen adecuado para autocompletado, refactorizacion y explicacion de codigo en entornos sin conexion.
- Razonamiento matematico y analisis paso a paso: el modo thinking permite cadenas de razonamiento largas para problemas de matematicas o logica, con la opcion de desactivarlo para respuestas rapidas.
- Despliegue en estacion de trabajo con GPU de consumo: con Q4_K_M o Q2_K y descarga de expertos a CPU (`-ot "ffn_.*_exps\.weight=CPU"`), se puede servir un MoE de ~100 B en una sola maquina para prototipado y pruebas internas.
- Backend compatible con OpenAI: al exponer `llama-server` con API `/v1/chat/completions`, se integra en pipelines existentes que ya usan el formato OpenAI, incluyendo herramientas y agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion y del contexto. Q8_0 se acerca al tamano del maestro podado (decenas de GB), Q4_K_M reduce aproximadamente a la mitad y Q2_K a una cuarta parte; el repositorio ocupa 204 GB en total por incluir varias cuantizaciones y el `mmproj`. Los pesos y el contexto comparten memoria, por lo que hay que dejar margen.
- Estrategia mixta GPU/CPU: con menos VRAM que el tamano del archivo, se pueden mantener los expertos en CPU y el resto en GPU con `-ngl 99 -ot "ffn_.*_exps\.weight=CPU"`, o ajustar la colocacion MoE con `-ncmoe N`.
- GPU recomendadas: no disponible de forma explicita; por el tamano del modelo, el despliegue completo en GPU requiere aceleradores de gran memoria (A100/H100 de 80 GB o multi-GPU), mientras que en RTX 4090 (24 GB) solo es viable con cuantizacion baja y expertos en CPU.
- Cabe en GPU de consumo: si, con Q4_K_M o Q2_K y descarga parcial de expertos a CPU; no cabe completo en una unica GPU de consumo.
- Opciones de despliegue: llama.cpp (`llama-server`) desde la build b11190, con `--mmproj` para vision, `--jinja`, `--flash-attn auto` y `-ngl auto`. Otras herramientas (vLLM, TGI, Ollama) no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.2-air-REAP-408 (esta ficha) | ~99,87 B / ~5,5 B | hasta 131.072 en ejemplos | Si (imagen y video) | MIT | GGUF, FP8 safetensors |
| inclusionAI/Ling-3.2-air (base) | 124 B / 5,5 B | no disponible | Si | no disponible | safetensors |
| Otros MoE de ~100 B con poda REAP | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor; la poda no incluye recuperacion, por lo que puede degradar tareas que dependian de los expertos eliminados.
- La calidad depende del conjunto de calibracion (653.000 tokens con sesgo fuerte hacia codigo, 75%); el rendimiento en dominios poco representados (por ejemplo, idiomas distintos del ingles o chino) puede resentirse.
- Riesgo de alucinacion inherente a los modelos generativos; el modo thinking activado por defecto alarga las respuestas y aumenta el consumo de tokens.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue amplia.
- Las cuantizaciones bajas (Q2_K) degradan la calidad de forma notable segun el propio autor ("more slop and misbehavin'").
- El bloque NextN/MTP se omite en esta version, por lo que no se dispone de decodificacion especulativa nativa.
- La vision requiere el archivo `mmproj-model-f16.gguf` de 875 MB; sin el, solo funciona texto.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base inclusionAI/Ling-3.2-air antes de uso comercial.
- Requiere llama.cpp build b11190 o superior; versiones anteriores no soportan esta arquitectura.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-408-GGUF
- Repositorio FP8 safetensors: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-408
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Paper REAP: https://arxiv.org/abs/2510.13999
