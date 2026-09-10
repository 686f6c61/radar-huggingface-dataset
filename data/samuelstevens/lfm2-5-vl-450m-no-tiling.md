# samuelstevens/LFM2.5-VL-450M-no-tiling

## Resumen

LFM2.5-VL-450M-no-tiling es un fork de configuración del checkpoint LiquidAI/LFM2.5-VL-450M, publicado por el usuario samuelstevens. No es un modelo nuevo ni un ajuste fino: los pesos, el tokenizador, la plantilla de chat, la configuración del modelo y la licencia son idénticos a los del checkpoint original. El único cambio de comportamiento es un parámetro del procesador de imágenes: `image_processor.do_image_splitting` pasa de `true` a `false`, de modo que la imagen se procesa como una única vista redimensionada en lugar de dividirse en mosaicos (tiles). La revisión de origen está fijada al commit `fc6221ca597f3315e4f82fc2df606783267b34ba` y el repositorio incluye un `fork_manifest.json` con los hashes SHA-256 de los ficheros.

El modelo subyacente pertenece a la familia LFM2.5-VL de Liquid AI, una línea de modelos visión-lenguaje de tamano reducido: este checkpoint concreto tiene 448.718.848 parámetros (unos 449 M) y una pipeline declarada de `image-text-to-text`. Su relevancia práctica está en el segmento de VLM pequenos que pueden ejecutarse en hardware muy modesto, y en el caso de este fork, en la reducción del número de tokens de imagen consumidos al desactivar el troceado. El propio autor advierte que este cambio "intercambia detalle visual por menor uso de tokens de imagen" y que no reclama ninguna mejora de precisión ni equivalencia con el modelo original.

Es importante encuadrar el repositorio como lo que es: un fork de configuración de un procesador, pensado para reproducibilidad en investigación. No se realizó SFT, ni inferencia, ni evaluación comparativa durante su creación, y el nombre conserva los términos `LFM` y `-VL-` para que el enrutado de visión basado en nombre de LQH pueda reconocerlo, sin que ello garantice ejecución en la nube ni éxito de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2.5-VL (vision-language) de Liquid AI; detalle interno (transformer, MoE, hibrida o SSM) no disponible en la informacion proporcionada |
| Parametros totales | 448.718.848 (~449 M), dato real de safetensors |
| Parametros activos | no aplica / no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`), con condiciones de uso comercial; el fichero LICENSE se conserva sin cambios |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | LiquidAI/LFM2.5-VL-450M (revision fijada fc6221ca597f3315e4f82fc2df606783267b34ba) |
| Libreria | transformers |
| Tamano del repositorio | 0,9 GB |
| Etiquetas destacadas | lfm2_vl, lfm2.5-vl, no-tiling, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna del modelo base (numero de capas, tipo de atencion, dimension del hidden state, vision encoder o estrategia multimodal). Lo unico verificable es su pertenencia a la familia LFM2.5-VL de Liquid AI y que la pipeline declarada es `image-text-to-text`, con etiquetas `lfm2_vl` y `conversational`. Cualquier afirmacion sobre atencion lineal, mezcla de expertos o arquitectura hibrida correspondiente a la familia LFM2 no esta respaldada por la informacion proporcionada para este checkpoint concreto.

Respecto al "entrenamiento", no hubo ninguno asociado a este fork. La model card lo declara explicitamente: los pesos son los originales y no se ejecuto SFT, inferencia ni benchmarks durante su creacion. La unica modificacion tecnica es de configuracion del procesador de imagenes: `do_image_splitting: false`, que sustituye el esquema de mosaicos por una unica vista completa redimensionada. Los demas valores por defecto del procesador se mantienen, incluido `max_image_tokens=256`. Ademas, se anadio un aviso de modificacion a `processor_config.json` como metadato. El autor no incluye imagenes ni anotaciones de FishVista en el repositorio.

## Capacidades

- Procesamiento de imagen y texto de forma conjunta, segun la pipeline `image-text-to-text` declarada.
- Generacion de texto conversacional en formato de chat (etiqueta `conversational` y plantilla de chat heredada del modelo original).
- Procesamiento de imagen en vista unica sin troceado, con un limite declarado de `max_image_tokens=256` por imagen.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Carga mediante `AutoProcessor` y `transformers`, con verificacion programatica de que `do_image_splitting` es `False`.
- Razonamiento, codigo, matematicas, tool calling, capacidades de agente, soporte de audio o modo thinking: no disponible en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible en la informacion proporcionada.

## Casos de uso

- Etiquetado y clasificacion de imagenes a gran escala: al desactivar el troceado y mantener `max_image_tokens=256`, cada imagen consume menos tokens, lo que reduce el coste por elemento en lotes muy grandes donde el detalle fino no es critico (categorias gruesas, presencia/ausencia de objetos dominantes).
- Generacion de texto alternativo y descripciones breves: el modelo puede producir descripciones de una sola vista para catalogos, galerias o accesibilidad, donde la latencia y el coste importan mas que la precision en detalles pequenos.
- Moderacion preliminar de contenido visual: como primera etapa de un pipeline en cascada, filtrando imagenes evidentes antes de enviar los casos dudosos a un modelo mayor.
- Extraccion de campos en documentos simples: capturas o formularios de baja densidad textual donde una vista unica redimensionada es suficiente; no es adecuado para documentos densos o texto pequeno.
- Preprocesamiento para RAG multimodal: generar un pie de foto o resumen visual que se indexe como texto junto a embeddings, de modo que la busqueda semantica opere sobre descripciones generadas por un modelo de 449 M.
- Prototipado en hardware modesto o en el borde: al tratarse de un VLM de ~449 M de parametros en safetensors, permite validar flujos vision-lenguaje en portatiles, CPU o GPUs de gama baja antes de escalar a modelos mayores.
- Reproducibilidad de experimentos de investigacion: el repositorio fija la revision de origen y publica hashes SHA-256 en `fork_manifest.json`, por lo que sirve para comparar resultados entre configuracion con troceado y sin troceado en un mismo conjunto de evaluacion.
- Integracion en pipelines de agentes con salida conversacional: la plantilla de chat y la etiqueta `conversational` permiten insertarlo como modulo de percepcion de bajo coste dentro de un flujo multi-paso; el soporte real de tool calling no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la model card original se conserva en `UPSTREAM_README.md` y que sus ejemplos y afirmaciones de benchmark se refieren al modelo original con la configuracion original, no a mediciones nuevas de este fork sin troceado. El autor declara explicitamente que no se realizo ninguna evaluacion comparativa al crear la variante.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 0,9-1,0 GB solo para los pesos de 448.718.848 parametros, mas el espacio de activaciones, cache KV y el tensor de imagen. El repositorio ocupa 0,9 GB en disco.
- VRAM estimada en int8: aproximadamente 0,45 GB para los pesos. En int4: aproximadamente 0,25-0,3 GB. Estas cifras son calculos sobre el numero de parametros, no valores medidos publicados.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion proporcionada. Por tamano, cabe en cualquier GPU de consumo con 4 GB o mas, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090; tambien es viable en CPU y en equipos con memoria unificada.
- Despliegue: la libreria declarada es `transformers` y el repositorio esta marcado como `endpoints_compatible`. Soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible; llama.cpp requeriria una conversion a GGUF que este repositorio no incluye.
- Aviso de integracion: el autor indica que los runtimes que sobrescriban la configuracion del procesador guardada necesitan verificacion por separado, ya que el cambio de comportamiento depende de que se respete el `processor_config.json` del repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este fork ni de su modelo base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La tabla recoge unicamente los datos verificables o explicitamente indicados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samuelstevens/LFM2.5-VL-450M-no-tiling | 448.718.848 | no disponible | sin benchmarks publicados en la informacion disponible | LFM Open License v1.0 (lfm1.0) | HuggingFace, 0 descargas, 0 likes |
| LiquidAI/LFM2.5-VL-450M (upstream) | no disponible en la informacion proporcionada | no disponible | afirmaciones en su model card original, no reproducidas aqui | LFM Open License v1.0 (lfm1.0) | HuggingFace |
| Otros VLM pequenos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados utiles (unicamente paginas de inicio de Google), por lo que no se han podido incorporar modelos comparables adicionales ni datos de terceros.

## Limitaciones y advertencias

- El cambio a vista unica sin troceado reduce el detalle visual disponible. El propio autor advierte que se trata de un intercambio consciente de detalle por menor uso de tokens de imagen, y no reclama ninguna mejora de precision ni equivalencia con el modelo original.
- Es previsible un peor desempeno en tareas que dependen de detalle fino, como lectura de texto pequeno, OCR denso, conteo preciso de objetos o reconocimiento de elementos en imagenes de alta resolucion. No hay mediciones publicadas que cuantifiquen esta perdida.
- No es un modelo ajustado: no ha recibido SFT ni ninguna otra fase de entrenamiento, por lo que hereda integramente el comportamiento del checkpoint original.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para este fork. En modelos vision-lenguaje de ~449 M de parametros es habitual que aparezcan descripciones plausibles pero incorrectas, especialmente con imagenes complejas; no hay datos en la informacion disponible que permitan acotar ese riesgo.
- Sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada. No se debe asumir cobertura multilingue sin verificar el comportamiento real.
- Longitud de contexto: no disponible en la informacion proporcionada, lo que limita la planificacion de conversaciones multi-turno o el procesamiento de documentos largos.
- Licencia: se aplica la LFM Open License v1.0, conservada sin cambios y con condiciones especificas de uso comercial. Es responsabilidad del usuario revisar el fichero LICENSE antes de un despliegue comercial.
- Madurez del repositorio: publicado en 2026-09-10 con 0 descargas y 0 likes, sin evaluaciones independientes ni validacion por parte de terceros.
- Confusion de nombres: el autor mantiene `LFM` y `-VL-` en el nombre para que el enrutado de vision de LQH pueda reconocerlo, pero aclara que esto no garantiza ejecucion en la nube ni exito de entrenamiento.
- Integracion fragil: si el runtime ignora u sobrescribe la configuracion del procesador guardada, el comportamiento sin troceado no se aplicara y los resultados no seran reproducibles. Para ejecuciones reproducibles hay que pasar el SHA del commit como `revision`.
- Los ejemplos y afirmaciones de rendimiento de la model card original corresponden al modelo upstream con su configuracion original, no a este fork.

## Enlaces

- Repositorio del fork: https://huggingface.co/samuelstevens/LFM2.5-VL-450M-no-tiling
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Revision de origen fijada: https://huggingface.co/LiquidAI/LFM2.5-VL-450M/tree/fc6221ca597f3315e4f82fc2df606783267b34ba
- Licencia LFM Open License v1.0: https://huggingface.co/samuelstevens/LFM2.5-VL-450M-no-tiling/blob/main/LICENSE
- Model card original preservada: https://huggingface.co/samuelstevens/LFM2.5-VL-450M-no-tiling/blob/main/UPSTREAM_README.md
- Manifiesto del fork con hashes SHA-256: https://huggingface.co/samuelstevens/LFM2.5-VL-450M-no-tiling/blob/main/fork_manifest.json

Nota: la busqueda web realizada no devolvio resultados relevantes (solo paginas de inicio del motor de busqueda), por lo que no se han podido anadir papers, blogs, repositorios de codigo ni demos adicionales.
