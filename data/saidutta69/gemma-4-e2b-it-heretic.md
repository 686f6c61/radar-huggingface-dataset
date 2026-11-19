# saidutta69/gemma-4-E2B-it-heretic

## Resumen

gemma-4-E2B-it-heretic es una variante "decensored" del modelo multimodal google/gemma-4-E2B-it, el miembro mas pequeno de la familia Gemma 4 de Google. El autor, saidutta69, ha aplicado una ablacion direccional de pesos (abliteration) mediante la herramienta Heretic v1.4.0 para suprimir el comportamiento de rechazo del modelo original, editando selectivamente las proyecciones de salida de atencion (attn.o_proj) y las down-projections del MLP en lugar de recurrir a fine-tuning. El resultado conserva la percepcion multimodal y el razonamiento del modelo base.

El modelo es denso y acepta entrada de texto, imagen, video y audio, generando texto. Incorpora Per-Layer Embeddings: pese a contar con 5.104.297.504 parametros totales y un vocabulario de 262K tokens, solo unos 2.3B parametros estan activos por token, lo que lo hace apto para despliegue en dispositivo (on-device) y GPUs de consumo. Soporta una ventana de contexto de 128K y modos de razonamiento configurables (thinking modes).

Es relevante ahora porque demuestra que es posible eliminar las negativas de un modelo fuertemente alineado (el original rechazaba 99 de 100 prompts daninos) manteniendo las capacidades multimodales intactas, a costa de una divergencia KL de 0.1841, la mas alta de la coleccion del autor. El autor advierte que existe una re-ejecucion mejor del mismo checkpoint (gemma-4-E2B-it-heretic-ara) con 14/100 rechazos y KL 0.1207.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, imagen, video, audio) con Per-Layer Embeddings |
| Parametros totales | 5.104.297.504 |
| Parametros activos | Aproximadamente 2.3B por token (Per-Layer Embeddings) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | F16 (este repo); Q4_K_M, Q5_K_M, Q6_K y Q8_0 disponibles en el repo ARA |
| Idiomas soportados | Ingles declarado; el autor menciona trabajo multilingue sobre 140 idiomas |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (transformers) y GGUF |
| Tamano del repo | 69.0 GB |
| Torre de vision y audio | SigLIP + conformer de audio, 475.729.088 elementos, en projector separado gemma4v / gemma4a (0.99 GB, F16) |
| Pipeline | any-to-any |
| Modelo base | google/gemma-4-E2B-it |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer denso multimodal que procesa texto, imagen, video y audio y genera texto. La innovacion estructural clave son las Per-Layer Embeddings: un vocabulario de 262K tokens almacenado en tablas de lookup, de modo que los 5.1B de pesos totales se reducen a unos 2.3B activos por token durante el decode. Esto hace que la velocidad de generacion se acerque mas a la de un modelo de 2.3B que a la de uno de 5.1B, aunque las tablas de embedding deben permanecer residentes en memoria. El modelo incorpora ademas una torre de vision SigLIP y un conformer de audio, empaquetados en un projector separado.

El entrenamiento original de Google no se detalla en la informacion disponible. La modificacion de este repo no es un fine-tuning: se trata de una ablacion direccional ("abliteration") ejecutada con Heretic v1.4.0, un trial de 550 intentos con semilla 1275720981 y direction_index seleccionado por capa (valor global 17.24). Los pesos editados son attn.o_proj (max_weight 1.47 en posicion 22.28, min_weight 0.49 a distancia 17.99) y mlp.down_proj (max_weight 1.49 en posicion 21.15, min_weight 0.61 a distancia 19.78). El objetivo es suprimir la direccion de rechazo en el espacio de activaciones sin destruir el resto de capacidades.

## Capacidades

- Generacion de texto y razonamiento, con modos de pensamiento (thinking) configurables.
- Entrada multimodal: imagen, video y audio, ademas de texto (pipeline any-to-any).
- Comprension de audio y transcripcion del habla mediante el conformer de audio incluido en el projector.
- Analisis de documentos, capturas de pantalla e interfaces de usuario.
- Capacidades multilingues: el autor menciona soporte sobre 140 idiomas, aunque la model card solo declara ingles.
- Comportamiento "decensored": responde directamente en lugar de declinar, con 17/100 rechazos frente a 99/100 del original.
- Orientado a roleplay y uso en local (local-llm), con etiquetas de consumer-gpu y edge.
- No se detalla en la informacion disponible soporte explicito de tool calling ni de agentes multi-paso.

## Casos de uso

- Analisis local de documentos y capturas de pantalla: cargando el GGUF principal junto con el projector mmproj, el modelo procesa imagenes de UI o documentos y responde sobre su contenido sin salir del dispositivo.
- Transcripcion y comprension de audio: el conformer de audio permite transcribir y razonar sobre locuciones en local, util para notas de voz o reuniones en entornos sin conectividad.
- Asistente multilingue en el borde: con 128K de contexto y soporte declarado de hasta 140 idiomas, sirve para conversaciones de asistencia en dispositivos con recursos limitados.
- Roleplay y escritura creativa sin filtros: al haberse suprimido el rechazo, es adecuado para narrativa y personajes donde el modelo base declinaria; el autor lo etiqueta explicitamente para roleplay.
- Procesamiento de video para descripcion de escenas: la entrada de video combinada con el contexto largo permite resumir o describir clips en local.
- Prototipado en GPU de consumo: con 9.27 GB en F16 para texto y 10.26 GB con vision y audio, cabe en una RTX 3090, 4090 o 5090 de 24 GB, lo que facilita experimentacion sin infraestructura de servidor.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio reproducible (etiqueta reproducible) para medir el equilibrio entre supresion de rechazos y divergencia KL.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-E2B-it) |
|---|---|---|
| Divergencia KL | 0.1841 | 0 (por definicion) |
| Rechazos | 17/100 | 99/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en F16: 9.27 GB para solo texto; 10.26 GB para texto, vision y audio (incluye el projector de 0.99 GB, de tamano fijo porque la vision y el audio no se cuantizan).
- Anadir aproximadamente 1 GB por cada 32K de contexto adicional.
- GPU recomendadas: RTX 3090, 4090 o 5090 (24 GB o mas) para F16.
- En GPUs de 16 GB o menos, usar las cuantizaciones Q4_K_M a Q8_0 del repo ARA (3.42-4.95 GB solo texto; 4.40-5.93 GB con vision y audio).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB para F16 y en tarjetas de 16 GB o menos con cuantizacion.
- Opciones de despliegue: transformers (safetensors) y llama.cpp/GGUF; el repo se declara endpoints_compatible. No se detallan otras opciones como vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se proporcionan cifras concretas; el autor indica que la velocidad de decode se acerca a la de un modelo de 2.3B por el uso de Per-Layer Embeddings.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | KL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma-4-E2B-it-heretic (este) | 5.1B totales / ~2.3B activos | 128K | 17/100 | 0.1841 | Apache 2.0 | HF, safetensors y GGUF F16 |
| gemma-4-E2B-it-heretic-ara | 5.1B totales / ~2.3B activos | 128K | 14/100 | 0.1207 | Apache 2.0 | HF, incluye K-quants |
| gemma-4-E4B-it-heretic | no disponible | 128K | no disponible | 0.1215 | Apache 2.0 | HF |
| google/gemma-4-E2B-it (base) | 5.1B totales / ~2.3B activos | 128K | 99/100 | 0 (por definicion) | Apache 2.0 | HF |

## Limitaciones y advertencias

- La divergencia KL de 0.1841 es la mas alta de la coleccion del autor, lo que implica mayor deriva en tono y formato; se recomienda verificar el modelo con prompts propios antes de usarlo en produccion.
- El proceso de abliteration suprime el rechazo de forma no selectiva, lo que puede aumentar la probabilidad de generar contenido danino, sesgado o inapropiado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- La model card solo declara ingles como idioma; el soporte de 140 idiomas es una afirmacion del autor no verificada con benchmarks.
- Aunque la licencia del repo es Apache 2.0, se enlaza a la licencia de Gemma 4 de Google, que puede imponer condiciones adicionales para uso comercial; conviene revisarla.
- Para entrada de imagen o audio es obligatorio cargar tanto el GGUF principal como el projector mmproj; usar solo el GGUF principal limita el modelo a texto.
- Este repo solo ofrece F16; las cuantizaciones ligeras estan en el repo ARA, lo que obliga a un despliegue de mayor huella de memoria si se usa este checkpoint.
- El autor recomienda explicitamente el repo ARA (menos rechazos y menos deriva) salvo que se busque especificamente la edicion direccional clasica de rango 1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/gemma-4-E2B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante ARA recomendada: https://huggingface.co/saidutta69/gemma-4-E2B-it-heretic-ara
- Hermano mayor E4B: https://huggingface.co/saidutta69/gemma-4-E4B-it-heretic
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
