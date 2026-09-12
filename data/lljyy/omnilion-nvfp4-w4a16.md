# LLJYY/OmniLion-NVFP4-W4A16

## Resumen

OmniLion-NVFP4-W4A16 es una version cuantizada y lista para servir del modelo multimodal OmniLion, publicado por el usuario LLJYY. Se trata de un modelo any-to-any que integra en un unico checkpoint SafeTensors tres componentes: un modelo de lenguaje y vision derivado de SEA-LION/Qwen3.6, un encoder de audio Qwen3-ASR y un proyector de audio entrenado denominado P21. El resultado acepta texto, imagen, video y audio (hasta 30 segundos por elemento) en un mismo proceso nativo de vLLM, incluyendo entradas conjuntas de video y audio en cualquier orden.

La particularidad de este artefacto es el formato de cuantizacion: los pesos lineales del decodificador usan W4A16_NVFP4 de NVIDIA ModelOpt, con pesos empaquetados en NVFP4 y tamano de grupo 16, mientras que las activaciones se mantienen en BF16. El resto de componentes (torre visual, torre Qwen3-ASR, proyector P21, payload MTP, LM head, embeddings y las proyecciones fusionadas de atencion lineal de Qwen3.6) permanecen sin cuantizar. No requiere pase de calibracion, ya que el preset de ModelOpt es weight-only.

El modelo cuenta con aproximadamente 17.206 millones de parametros y un repositorio de 27,1 GB. Su relevancia practica es doble: por un lado reduce el consumo de memoria declarado de 51,73 GiB (BF16) a 24,82 GiB, y por otro aumenta el throughput de tokens de salida aproximadamente 2,1 veces en el benchmark acotado del autor, verificado sobre NVIDIA GB10 con ARM64 Linux. El coste es un arranque en frio un 34,43% mas lento, debido al reempaquetado de pesos que realiza el kernel Marlin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal any-to-any: decodificador de lenguaje y vision derivado de SEA-LION/Qwen3.6 (con proyecciones fusionadas de atencion lineal), encoder de audio Qwen3-ASR y proyector de audio P21; incluye payload MTP |
| Parametros totales | 17.206.512.880 (aproximadamente 17,2 mil millones) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de servicio del autor usa `--max-model-len 8192` |
| Tipos de cuantizacion | W4A16_NVFP4 de NVIDIA ModelOpt: pesos NVFP4 empaquetados con group size 16, activaciones BF16, sin calibracion; torre visual, torre ASR, proyector P21, LM head, embeddings y proyecciones fusionadas sin cuantizar |
| Idiomas soportados | No disponible (el autor menciona un panel multilingue determinista con 8/8 aciertos, pero no enumera idiomas) |
| Licencia | `license: other` con nombre `mixed-mit-apache-2.0`; detalles en LICENSES.md |
| Formato de pesos | SafeTensors (NVFP4 empaquetado). No es GGUF. Requiere el wheel `omnilion-vllm-plugin` |

## Arquitectura y entrenamiento

La arquitectura es una composicion multimodal de tipo any-to-any. El nucleo de lenguaje y vision procede de la linea SEA-LION/Qwen3.6 e incluye proyecciones fusionadas de atencion lineal que, segun la model card, se mantienen sin cuantizar. A este nucleo se le anaden dos piezas especificas de modalidad: la torre de vision del propio modelo base y un encoder de audio Qwen3-ASR acompanado de un proyector de audio entrenado (P21). El checkpoint tambien conserva un payload MTP. No se especifica en la informacion disponible si la cuantizacion afecta al mecanismo de decodificacion especulativa ni si el modelo base emplea Mixture of Experts.

No hay informacion en la model card sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo que si se detalla es el proceso de cuantizacion: se aplica el preset `W4A16_NVFP4` de NVIDIA ModelOpt sobre los pesos lineales soportados del decodificador, sin pase de calibracion hacia delante, y la ejecucion en GB10 se resuelve con el `MarlinNvFp4LinearKernel` de vLLM. La metadata del checkpoint hace que vLLM seleccione Marlin de forma automatica en el runtime verificado.

## Capacidades

- Generacion de texto y razonamiento conversacional: el modelo conserva el comportamiento de thinking de Qwen3.6, que puede desactivarse por peticion mediante `chat_template_kwargs.enable_thinking`.
- Comprension de imagen: acepta contenido de tipo `image_url` a traves de la API compatible con OpenAI.
- Comprension de video: acepta `video_url`; el ejemplo de servicio configura `num_frames: 30`.
- Comprension de audio: acepta `input_audio`, con un maximo de 30 segundos por elemento y rechazo explicito de audio sobredimensionado.
- Entrada audiovisual conjunta: admite video y audio simultaneos en un mismo prompt, en cualquiera de los dos ordenes de content-parts.
- Procesamiento multilingue: el autor reporta un panel multilingue determinista con puntuacion 8/8, sin detallar los idiomas evaluados.
- Modo thinking: activado por defecto para peticiones normales; desactivable por peticion para chequeos de salud deterministas.
- Servicio multimodal unificado: todas las modalidades se atienden desde un unico proceso nativo de vLLM a traves de `/v1/chat/completions`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente multimodal: el modelo permite construir un endpoint unico que reciba texto, capturas de pantalla y notas de voz de hasta 30 segundos, evitando mantener pipelines separados de ASR, vision y lenguaje. El thinking desactivable por peticion resulta util para respuestas rapidas en produccion y para chequeos deterministas de salud.
- Analisis de reuniones grabadas: con soporte de video y audio conjuntos en cualquier orden de content-parts, se puede alimentar una grabacion con `video_url` e `input_audio` en la misma peticion y obtener un resumen que cruce lo dicho con lo mostrado en pantalla.
- Transcripcion y resumen de audio corto: el encoder Qwen3-ASR integrado procesa elementos de audio de hasta 30 segundos, adecuado para notas de voz, mensajes de buzon o clips de soporte tecnico.
- Accesibilidad y descripcion de contenido audiovisual: generacion de descripciones y subtitulos enriquecidos para material de video, combinando la torre visual y la de audio dentro de la misma ventana de contexto.
- Moderacion de contenido multimedia: clasificacion de imagenes, video y audio con un solo modelo desplegado, reduciendo el numero de servicios a operar y de formatos de salida a normalizar.
- Analisis documental con capturas: extraccion de informacion a partir de capturas de pantalla o imagenes de documentos junto a instrucciones en texto, en escenarios de back-office y verificacion.
- Despliegue en hardware de borde con GB10: gracias a la reduccion de memoria declarada (de 51,73 GiB a 24,82 GiB) y al aumento de throughput de aproximadamente 2,1 veces, es viable servir el modelo en una estacion de trabajo con NVIDIA GB10 en lugar de depender de un nodo con multiples GPU.
- Investigacion sobre cuantizacion NVFP4: el artefacto sirve como caso de estudio reproducible de W4A16 sin calibracion sobre un modelo multimodal, con documentacion de procedencia y manifiesto de release.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo aporta mediciones internas acotadas sobre el runtime verificado con NVIDIA GB10:

| Medicion | BF16 (base) | W4A16 NVFP4 | Variacion |
|---|---|---|---|
| Memoria de modelo reportada | 51,73 GiB | 24,82 GiB | reduccion aproximada del 52% |
| Throughput de tokens de salida | referencia | aproximadamente 2,1x | aumento de aproximadamente 2,1 veces |
| Arranque en frio | referencia | no disponible | 34,43% mas lento |
| Panel multilingue determinista | 8/8 | 8/8 | sin diferencia reportada |

El propio autor advierte que estas canaries y el panel son evidencia de humo para el release, no una evaluacion exhaustiva de capacidades, y que la cuantizacion puede alterar el texto generado (la respuesta de audio real fue valida pero no identica byte a byte respecto a BF16).

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta 24,82 GiB de memoria de modelo en formato W4A16 NVFP4, frente a 51,73 GiB en BF16. El repositorio ocupa 27,1 GB en disco.
- GPU verificada: NVIDIA GB10, sobre Linux ARM64, con vLLM 0.29.0, PyTorch 2.13.0+cu129, Transformers 5.17.0 y la ruta de ejecucion W4A16 de Marlin.
- GPU recomendadas: no disponible. La unica plataforma verificada por el autor es GB10; no se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible. No hay confirmacion de funcionamiento en tarjetas consumer, y el requisito minimo de memoria del modelo (24,82 GiB reportados) supera la VRAM de la mayoria de GPU de gama alta orientadas a consumo.
- Opciones de despliegue: vLLM exclusivamente, con el plugin `omnilion-vllm-plugin` instalado (`python -m pip install --no-deps ./omnilion_vllm_plugin-0.1.0-py3-none-any.whl`) y las variables de entorno `VLLM_PLUGINS=omnilion` y `PYTHONNOUSERSITE=1`. No es compatible con llama.cpp ni Ollama, ya que no se distribuye en GGUF.
- Parametros de servicio de referencia: `--dtype bfloat16 --max-model-len 8192 --max-num-seqs 1 --gpu-memory-utilization 0.65 --limit-mm-per-prompt '{"image":1,"video":1,"audio":1}' --media-io-kwargs '{"video":{"num_frames":30}}' --chat-template-content-format string --enforce-eager`.
- Latencia y throughput: no se publican cifras absolutas de latencia ni de tokens por segundo; solo el factor relativo de aproximadamente 2,1 veces sobre BF16 y un arranque en frio un 34,43% mas lento.
- Nota de concurrencia: el ejemplo de servicio fija `--max-num-seqs 1`, lo que sugiere un regimen de baja concurrencia en la configuracion verificada.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables de la misma categoria en la informacion proporcionada. La unica comparacion documentada es contra el propio modelo base sin cuantizar:

| Modelo | Formato de pesos | Memoria de modelo reportada | Throughput relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLJYY/OmniLion-NVFP4-W4A16 | SafeTensors NVFP4 W4A16 | 24,82 GiB | aproximadamente 2,1x sobre BF16 | mixed-mit-apache-2.0 | Publico en Hugging Face, 0 descargas, 0 likes |
| LLJYY/OmniLion (base) | SafeTensors BF16 | 51,73 GiB | referencia | no disponible en la informacion proporcionada | Referenciado como `base_model` |
| Otros modelos any-to-any de tamano similar (Qwen2.5-Omni, Gemini, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion altera las salidas: el autor indica explicitamente que el texto generado puede cambiar respecto a BF16 y que la respuesta de audio real, aunque valida, no fue identica byte a byte.
- Limite estricto de audio: maximo de 30 segundos por elemento, con rechazo de audio sobredimensionado verificado en el release.
- No se distribuye en GGUF y requiere un plugin propietario de vLLM; queda fuera de ecosistemas como llama.cpp u Ollama.
- La licencia es `other` con nombre `mixed-mit-apache-2.0`; antes de un uso comercial es imprescindible revisar LICENSES.md, ya que la ficha no detalla que componentes quedan bajo MIT y cuales bajo Apache 2.0 ni posibles restricciones adicionales.
- No se incluyen datos de entrenamiento, datos de calibracion ni medios de evaluacion; la procedencia completa depende de PROVENANCE.md.
- No se documentan resultados de benchmarks estandar, por lo que no es posible comparar capacidades con otros modelos de forma objetiva mas alla de las canaries del autor.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al tratarse de un modelo de lenguaje generativo, el riesgo existe, pero no hay evaluaciones publicadas.
- Idiomas soportados: no declarados. El panel multilingue de 8/8 no especifica que idiomas cubre, por lo que no debe asumirse cobertura del castellano.
- Sin soporte documentado de tool calling ni de flujos de agente; quien necesite function calling debera verificarlo por su cuenta.
- El modo thinking esta activado por defecto, lo que puede aumentar la latencia y el consumo de tokens en produccion si no se desactiva por peticion.
- El autor recomienda no exponer vLLM en crudo en red y colocar una pasarela autenticada como LiteLLM por delante.
- El modelo tiene 0 descargas y 0 likes, por lo que no existe aun validacion independiente de la comunidad.
- La fecha de creacion del repositorio es posterior a la verificacion descrita; conviene fijar una revision inmutable del commit para despliegues en produccion, tal como recomienda el autor.
- El rendimiento solo esta verificado en NVIDIA GB10 con ARM64 Linux; extrapolar a otras GPU no esta respaldado por datos.
- El autor no reclama cuantizacion de activaciones W4A4 nativa para este artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LLJYY/OmniLion-NVFP4-W4A16
- Modelo base (BF16): https://huggingface.co/LLJYY/OmniLion
- Licencias: https://huggingface.co/LLJYY/OmniLion-NVFP4-W4A16/blob/main/LICENSES.md
- Benchmarks: https://huggingface.co/LLJYY/OmniLion-NVFP4-W4A16/blob/main/BENCHMARKS.md
- Procedencia: https://huggingface.co/LLJYY/OmniLion-NVFP4-W4A16/blob/main/PROVENANCE.md
- Manifiesto de release: https://huggingface.co/LLJYY/OmniLion-NVFP4-W4A16/blob/main/release-manifest.json
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, papers, blogs, repositorios o demos en la busqueda realizada; los resultados devueltos tratan sobre la gestion de notificaciones de sitios web en Microsoft Edge y no guardan relacion con OmniLion.
