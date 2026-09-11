# Alfredofrog/gemma-4-E4B-it-uncensored-heretic

## Resumen

`Alfredofrog/gemma-4-E4B-it-uncensored-heretic` es una version "decensored" (abliterated) del modelo multimodal `google/gemma-4-E4B-it` de Google DeepMind, publicada por el usuario independiente Alfredofrog el 11 de septiembre de 2026. El objetivo del modelo es reducir drasticamente la tasa de rechazos ante peticiones que el modelo original bloquea, manteniendo al mismo tiempo la calidad general y el comportamiento del checkpoint de partida.

La intervencion se ha realizado con la herramienta Heretic v1.2.0 aplicando el metodo Arbitrary-Rank Ablation (ARA), una tecnica de ablacion direccional que elimina la direccion de rechazo en componentes concretos de la atencion sin reentrenar el modelo. Segun la model card, el resultado pasa de 99 rechazos sobre 100 prompts en el modelo original a 7 sobre 100, con una divergencia KL de 0,0043 respecto al original y una perdida de menos de medio punto porcentual en MMLU y PIQA.

El checkpoint pesa 7.996.156.490 parametros (~8,0 mil millones) y ocupa 16,0 GB en safetensors, con licencia Apache 2.0 y pipeline declarado `any-to-any` (etiquetas `image-text-to-text` y `gemma4`). Se publica sin descargas ni valoraciones en el momento de redactar esta ficha, por lo que no cuenta todavia con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (etiqueta `gemma4`); modalidad declarada `any-to-any` / `image-text-to-text` |
| Parametros totales | 7.996.156.490 (~8,0 mil millones), calculado sobre los pesos en safetensors |
| Parametros activos | no disponible (la nomenclatura "E4B" del modelo base sugiere una denominacion de parametros efectivos, pero no se confirma en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, con `license_link` a la licencia de Gemma 4 de Google (`ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 16,0 GB |
| Modelo base | `google/gemma-4-E4B-it` |
| Fecha de publicacion | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `google/gemma-4-E4B-it`, un transformer multimodal de Gemma 4 con soporte declarado de entradas de imagen y texto y pipeline `any-to-any`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni las fases de ajuste (SFT, RLHF o DPO) del modelo original dentro de los datos proporcionados.

Lo que si se documenta con detalle es el proceso de abliteracion. Se aplico Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA), actuando exclusivamente sobre el componente `attn.o_proj`. Los hiperparametros declarados son: `start_layer_index` = 8, `end_layer_index` = 36, `preserve_good_behavior_weight` = 0,9827, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,9110 y `neighbor_count` = 15. Se trata, por tanto, de una modificacion de pesos por edicion de direcciones en espacio de activaciones, no de un reentrenamiento.

El impacto medido de esa edicion es una divergencia KL de 0,0043 frente al modelo original y una caida de rendimiento de 0,49 puntos porcentuales en MMLU y 0,44 puntos en PIQA, lo que indica una deriva limitada respecto al checkpoint de partida. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni variantes de atencion eficiente.

## Capacidades

- Generacion de texto y respuesta a instrucciones conversacionales (variante `-it` del modelo base).
- Entrada multimodal de imagen y texto, con pipeline `any-to-any` e `image-text-to-text`, segun las etiquetas del repositorio. No se detalla la lista exacta de modalidades soportadas.
- Razonamiento de sentido comun fisico y conocimiento general: medido con PIQA (85,58 %) y MMLU (68,97 %) sobre 1.838 y 14.042 preguntas respectivamente.
- Reduccion drastica del comportamiento de rechazo: 7 respuestas de rechazo sobre 100 prompts en la prueba declarada, frente a 99 del modelo original.
- Preservacion del comportamiento general del modelo base, con divergencia KL de 0,0043.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio no esta cumplimentado.
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Red teaming y evaluacion de alineacion: comparar la tasa de rechazo de este checkpoint (7/100) con la del modelo original (99/100) sobre el mismo conjunto de prompts permite cuantificar la robustez de los mecanismos de seguridad de Gemma 4 y estudiar que categorias de contenido siguen bloqueadas tras la ablacion.
- Generacion de datos para clasificadores de seguridad y moderacion: producir pares de respuestas con y sin rechazo ante prompts sensibles facilita el entrenamiento y la evaluacion de moderadores automaticos, siempre con revision humana y control de acceso.
- Investigacion reproducible sobre tecnicas de abliteracion: el repositorio publica los hiperparametros exactos (capas 8-36, `attn.o_proj`, pesos de comportamiento) y las metricas de deriva, lo que permite replicar el pipeline con Heretic y comparar variantes del metodo ARA.
- Escritura creativa y ficcion sin filtrado corporativo: narrativa con violencia explicita, temas adultos o tramas moralmente ambiguas que el modelo base tiende a rechazar, manteniendo calidad de redaccion cercana al original.
- Role-play y construccion de personajes: conversaciones multi-turno con personajes que requieren mantener registros o posturas que el modelo alineado suaviza o interrumpe; util en prototipado de videojuegos y experiencias interactivas.
- Analisis de imagenes sin sesgo de rechazo: tareas de captioning, VQA o descripcion de contenido visual potencialmente sensible (medicina, forense, material de archivo) donde el modelo base puede negarse o suavizar la respuesta.
- Despliegue local con requisitos de privacidad: al ser un modelo de ~8B en safetensors, puede ejecutarse en hardware propio sin enviar datos a servicios externos, lo que resulta adecuado para entornos con datos personales o confidenciales.
- Fine-tuning de dominio con baja interferencia de alineacion: partir de pesos con el comportamiento de rechazo atenuado reduce el sesgo que introduce el ajuste de seguridad cuando se especializa el modelo en dominios como derecho penal, seguridad ofensiva o analisis de contenido extremista.

## Benchmarks y rendimiento

Datos declarados en la model card del autor, comparando el derivado con `google/gemma-4-E4B-it`:

| Metrica | Original (gemma-4-E4B-it) | Este modelo | Diferencia |
|---|---|---|---|
| MMLU (14.042 preguntas) | 69,46 % | 68,97 % | -0,49 pp |
| PIQA (1.838 preguntas) | 86,02 % | 85,58 % | -0,44 pp |
| KL divergence frente al original | 0 (por definicion) | 0,0043 | +0,0043 |
| Rechazos (100 prompts) | 99/100 | 7/100 | -92 pp |

Desglose de MMLU por asignatura (las diez que el autor destaca):

| Asignatura | Original | Este modelo | Diferencia |
|---|---|---|---|
| professional_law | 52,87 % | 53,26 % | +0,39 pp |
| moral_scenarios | 43,91 % | 41,12 % | -2,79 pp |
| miscellaneous | 81,61 % | 81,35 % | -0,26 pp |
| professional_psychology | 75,16 % | 74,02 % | -1,14 pp |
| high_school_psychology | 89,17 % | 89,54 % | +0,37 pp |
| high_school_macroeconomics | 72,82 % | 72,31 % | -0,51 pp |
| elementary_mathematics | 65,87 % | 63,49 % | -2,38 pp |
| moral_disputes | 68,21 % | 68,21 % | 0,00 pp |
| prehistory | 75,31 % | 75,62 % | +0,31 pp |
| philosophy | 70,74 % | 70,10 % | -0,64 pp |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, MMMU, etc.) en la informacion disponible. Las cifras proceden unicamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (7.996.156.490) y del tamano del repositorio (16,0 GB); no constan mediciones oficiales de latencia ni de throughput.

- VRAM para inferencia en bf16/fp16: aproximadamente 16 GB solo de pesos, con un consumo real esperado de 18-22 GB al sumar cache KV y overhead del runtime. La longitud de contexto no esta publicada, por lo que el consumo de la cache no puede acotarse con precision.
- VRAM en int8: del orden de 8-10 GB, aunque esta cuantizacion no viene publicada y habria que generarla.
- VRAM en int4: del orden de 4,5-6 GB, tambien previa conversion.
- GPU profesionales: A100 40 GB, H100 80 GB y L40S 48 GB pueden ejecutar el checkpoint en bf16 sin problemas de capacidad.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto moderado; en cuantizacion de 4 bits es viable en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Al ser multimodal, las entradas de imagen anaden consumo de memoria adicional en funcion de la resolucion y del numero de imagenes por peticion.
- Opciones de despliegue confirmadas: `transformers`, la libreria declarada por el repositorio. El soporte en vLLM o TGI depende de que estos frameworks incorporen la arquitectura Gemma 4, algo que no se confirma en la informacion disponible.
- llama.cpp y Ollama no son utilizables directamente, ya que no se han publicado pesos en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | PIQA | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| `Alfredofrog/gemma-4-E4B-it-uncensored-heretic` | 7.996.156.490 | no disponible | 68,97 % | 85,58 % | 7/100 | Apache 2.0 | safetensors |
| `google/gemma-4-E4B-it` (base) | no disponible en la informacion proporcionada | no disponible | 69,46 % | 86,02 % | 99/100 | Apache 2.0 (Gemma 4) | safetensors |
| Otras variantes abliteradas de la familia Gemma 4 / Gemma 3n | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico punto de comparacion con datos verificables dentro de la informacion disponible es el checkpoint original de Google. No se han proporcionado cifras de otras alternativas abliteradas de la misma familia, por lo que no es posible establecer una comparacion cuantitativa con ellas.

## Limitaciones y advertencias

- La ablacion elimina parte del comportamiento de rechazo del modelo base: es esperable que genere contenido que el modelo original bloquearia, incluido material ofensivo, violento o potencialmente danino. No debe desplegarse como asistente generalista sin capas de control adicionales.
- La divergencia KL de 0,0043 indica una deriva baja, pero no nula. La caida en `moral_scenarios` (-2,79 pp) y `elementary_mathematics` (-2,38 pp) sugiere que la ablacion afecta de forma desigual a distintas capacidades.
- Riesgo de alucinacion: no se ha medido de forma especifica en la informacion disponible, ni para el derivado ni para el modelo base.
- Idiomas soportados: no disponibles. El repositorio no declara el conjunto de lenguas cubiertas, por lo que el rendimiento fuera del ingles no esta documentado.
- Longitud de contexto: no disponible. No puede planificarse el uso con documentos largos sin verificar previamente el limite real del checkpoint.
- Licencia: la model card declara Apache 2.0, pero el enlace de licencia apunta a los terminos especificos de Gemma 4 de Google. Conviene verificar que los terminos de uso comercial se aplican igualmente a un modelo derivado modificado, especialmente en lo relativo a las clausulas de uso aceptable del modelo original.
- La model card incluye un aviso del autor sobre haber alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad o a futuras actualizaciones del repositorio.
- El modelo se publico el 11 de septiembre de 2026 con 0 descargas y 0 valoraciones: no existe validacion independiente de las metricas declaradas ni de la estabilidad del checkpoint a largo contexto.
- Los enlaces de donacion de la model card apuntan a la cuenta `llmfan46`, distinta del handle del repositorio (`Alfredofrog`); conviene tenerlo en cuenta al evaluar la trazabilidad del autor.
- Al ser un modelo multimodal con pipeline `any-to-any`, la model card no detalla que combinaciones de entrada y salida estan realmente implementadas y verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alfredofrog/gemma-4-E4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Heretic (herramienta de abliteracion, v1.2.0): https://github.com/p-e-w/heretic
- Pull request del metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Repositorio de Google para Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/

No se han encontrado enlaces adicionales relevantes en la busqueda web realizada: los resultados devueltos tratan sobre el acido fitico en la avena y no guardan relacion con el modelo.
