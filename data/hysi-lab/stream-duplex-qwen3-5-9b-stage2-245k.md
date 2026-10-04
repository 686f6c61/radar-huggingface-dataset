# hysi-lab/stream-duplex-qwen3.5-9b-stage2-245k

## Resumen

`hysi-lab/stream-duplex-qwen3.5-9b-stage2-245k` es un checkpoint de investigación de un modelo de diálogo hablado en streaming y full-duplex, publicado por el usuario hysi-lab. Se trata de la etapa 2 de un entrenamiento por fases, capturada en el paso 245.000, en la que el backbone de texto y la rama de audio se entrenan de forma conjunta partiendo del checkpoint de la etapa 1. El modelo no es un transformer estándar de diálogo: combina un backbone Qwen3.5-9B con una rama de audio propia y un códec neuronal de entrada.

La arquitectura es híbrida y personalizada: sobre el backbone Qwen3.5-9B se bifurca, en la capa 24, una rama de audio de 8 capas transformer que desemboca en 8 cabezas de cuantización residual vectorial (RVQ) con codebook de 2048 entradas. La entrada de audio del usuario la procesa un encoder Mimi de Kyutai, que permanece congelado y no se incluye en el repositorio. El conjunto de pesos publicados suma 10.849.471.104 parámetros (10,85 mil millones) repartidos en 639 tensores, con un tamaño de repositorio de 21,7 GB.

Su relevancia es fundamentalmente investigadora: la combinación de full-duplex, streaming y decodificación RVQ sobre un backbone de lenguaje grande es un área activa, pero el propio autor advierte de que es un checkpoint de investigación, no un modelo listo para producción. No existe clase `AutoModel` asociada, los ficheros no se pueden cargar por nombre y se requiere el código de entrenamiento (`StreamDuplexAudioModel`) junto con los pesos base de Qwen y Mimi para reconstruir el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.5-9B + rama de audio de 8 capas transformer bifurcada en la capa 24 + 8 cabezas RVQ (codebook 2048) + encoder Mimi congelado para el audio del usuario |
| Parametros totales | 10.849.471.104 (10,85 B), en 639 tensores |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; los datos de entrenamiento incluyen conjuntos con licencias restringidas a uso no comercial |
| Formato de pesos | safetensors por shards (`model-*.safetensors` + `model.safetensors.index.json`), libreria pytorch |
| Modelos base | Qwen/Qwen3.5-9B, kyutai/mimi |
| Tamano del repositorio | 21,7 GB |
| Etapa y paso de entrenamiento | Etapa 2, paso 245.000 (~1,8 epochs) |
| Perdida de validacion en bucle | 1,8863 (mejor del run hasta ese paso); `best_eval_loss` registrado en `meta.json`: 1,8910 |

## Arquitectura y entrenamiento

La arquitectura no sigue el patron de un transformer decoder-only convencional. Sobre un backbone Qwen3.5-9B se injerta, a la altura de la capa 24, una rama de audio compuesta por 8 capas transformer. La salida de esa rama se proyecta en 8 cabezas RVQ con codebook de 2048 entradas cada una, lo que constituye el mecanismo de generacion de tokens de audio. En el lado de entrada, el audio del usuario se codifica con un encoder Mimi de Kyutai que permanece congelado durante todo el entrenamiento. El modelo es, por tanto, un sistema extremo a extremo de voz a voz con soporte de streaming y comportamiento full-duplex (puede emitir y recibir simultaneamente), orientado a diálogo hablado.

En cuanto al entrenamiento, la etapa 2 entrena conjuntamente backbone y rama de audio partiendo del checkpoint de la etapa 1. El checkpoint publicado corresponde al paso 245.000 y cubre aproximadamente 1,8 epochs sobre la mezcla de datos. La perdida de validacion en bucle en ese paso es 1,8863, la mas baja del run hasta la fecha segun el autor; el campo `best_eval_loss` de `meta.json` indica 1,8910 porque el checkpoint se escribe antes de que se ejecute su propia evaluacion, de modo que refleja el mejor valor anterior a este paso. La definicion exacta de la perdida (texto + audio) esta en el codigo de entrenamiento, que no se incluye en el repositorio. No se documentan en la informacion disponible ni el numero total de tokens de entrenamiento, ni la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

El repositorio contiene unicamente los parametros entrenables. El encoder Mimi congelado y los modulos de Qwen que el modelo no utiliza no estan incluidos y deben obtenerse de los modelos base. La carga requiere instanciar `StreamDuplexAudioModel` contra el mismo contrato que figura en `meta.json["model_contract"]` y usar `load_state_dict(..., strict=False)`, comprobando que la lista de claves inesperadas este vacia y que las claves ausentes correspondan solo al encoder Mimi y a modulos Qwen no usados.

## Capacidades

- Diálogo hablado extremo a extremo: el modelo consume audio del usuario y produce audio, sin necesidad de un pipeline externo de ASR + TTS.
- Operación full-duplex: disenado para emitir y recibir audio de forma simultanea, lo que permite interrupciones y solapamiento de turnos.
- Procesamiento en streaming: el checkpoint esta planteado para inferencia incremental sobre flujo de audio continuo, no solo por turnos cerrados.
- Generacion de tokens de audio mediante 8 cabezas RVQ con codebook de 2048, sobre un encoder Mimi congelado.
- Capacidades de backbone de lenguaje heredadas de Qwen3.5-9B en la medida en que el contrato del modelo las preserve; la informacion disponible no detalla cuales se mantienen activas.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking", vision o audio de entrada distinto al habla: no disponible en la informacion proporcionada.
- Capacidad multimodal completa (imagen, video): no documentada; las etiquetas del repositorio se limitan a audio, speech, full-duplex y spoken-dialogue.

## Casos de uso

- Investigación en diálogo hablado full-duplex: el checkpoint permite reproducir y extender experimentos sobre solapamiento de turnos y latencia de respuesta en conversaciones de voz, que es precisamente el escenario para el que fue entrenado.
- Asistentes de voz con interrupción: en un escenario de atención al cliente, el modelo puede mantener una conversación hablada en la que el usuario interrumpe y el sistema responde sin esperar a que termine el turno, gracias al comportamiento full-duplex.
- Traducción simultánea hablada: al operar sobre flujo de audio continuo, es candidato para experimentos de interpretación en tiempo real, siempre que se valide la calidad del audio generado por las cabezas RVQ.
- Transcripción y subtitulado en directo: la rama de audio y el backbone de lenguaje pueden emplearse para tareas de seguimiento de habla en streaming, aunque no se documenta una salida de texto validada.
- Evaluación de códecs neuronales: al integrar Mimi como encoder congelado y una rama RVQ propia, sirve para estudiar el impacto del códec en la calidad del diálogo generado.
- Base para fine-tuning de dominio: equipos de investigación pueden partir de este checkpoint de etapa 2 para adaptar el diálogo hablado a un dominio concreto (sanitario, educativo, accesibilidad), asumiendo la necesidad del código de entrenamiento original.
- Robótica conversacional y dispositivos embebidos: la naturaleza full-duplex y de streaming encaja con agentes que deben escuchar mientras hablan, si bien el tamano de 10,85 B y la falta de versiones cuantizadas limitan su despliegue en hardware reducido.
- Generación de datos sintéticos de diálogo hablado: útil para producir conversaciones de voz sintéticas destinadas a entrenar otros sistemas, con las cautelas de licencia y sesgo correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato numerico de rendimiento documentado por el autor es la perdida de validacion en bucle en el paso 245.000 (1,8863), cuyo calculo exacto depende del codigo de entrenamiento y no es comparable con metricas estandar como MMLU, HumanEval o GSM8K. No se proporcionan resultados de WER, MOS, latencia ni calidad de audio.

## Requisitos de hardware

- Los pesos publicados ocupan 21,7 GB en el repositorio, lo que corresponde aproximadamente a 10,85 B de parametros en precision de 16 bits. A esa cifra hay que sumar el encoder Mimi congelado y los modulos Qwen no incluidos, que deben descargarse aparte.
- VRAM estimada en bf16/fp16: del orden de 24 a 32 GB solo para pesos, activaciones y cache, sin contar el sobrecoste del encoder Mimi ni el procesamiento de audio en tiempo real. Estimacion orientativa, no confirmada por el autor.
- VRAM estimada en int8: del orden de 12 a 16 GB. Estimacion orientativa; no se publican pesos cuantizados.
- VRAM estimada en int4: del orden de 7 a 10 GB. Estimacion orientativa; no se publican pesos cuantizados.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S 48 GB o A6000 48 GB para trabajar en precision completa sin cuantizar.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda por debajo de la estimacion en bf16 y previsiblemente requeriria cuantizacion, que no esta disponible en el repositorio. Un sistema con dos GPU de 24 GB es una opcion mas realista.
- Opciones de despliegue: no disponibles en el sentido habitual. Al no existir clase `AutoModel` ni integracion en `transformers`, el modelo no se puede servir con vLLM, TGI, llama.cpp u Ollama. La unica via documentada es cargar los shards con `safetensors.torch.load_file`, instanciar `StreamDuplexAudioModel` con el contrato de `meta.json` y aportar los pesos base de Qwen3.5-9B y kyutai/mimi.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de este modelo, por lo que la comparacion solo puede ser cualitativa y estructural. Los sistemas mas cercanos por categoria son los modelos de dialogo hablado full-duplex con codec neuronal.

| Modelo | Parametros | Codec | Dialogo full-duplex | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stream-duplex-qwen3.5-9b-stage2-245k | 10,85 B (pesos entrenables) | Mimi (congelado) + rama RVQ propia | Si, por diseno | no disponible | Checkpoint de investigacion, sin `AutoModel` |
| Kyutai Moshi | no disponible en la informacion proporcionada | Mimi | Si | no disponible | Modelo publicado por Kyutai |
| Qwen2.5-Omni | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Modelo publicado por Qwen |

Nota: los datos de Kyutai Moshi y Qwen2.5-Omni no proceden de la informacion facilitada en esta ficha y deben verificarse en sus repositorios oficiales antes de usarse en cualquier comparacion. La similitud estructural mas clara es con Kyutai Moshi, dado que este modelo reutiliza el encoder Mimi de Kyutai como front-end de audio.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un modelo listo para produccion. El propio autor lo indica de forma explicita.
- No existe una clase `AutoModel` ni integracion en `transformers`; los ficheros no se pueden cargar por nombre. Se requiere el codigo de entrenamiento (`StreamDuplexAudioModel`) y reconstruir el modelo contra el contrato de `meta.json`.
- El repositorio esta incompleto por diseno: faltan el encoder Mimi congelado y los modulos Qwen que el modelo no usa, que hay que obtener de los modelos base.
- Licencia no disponible. La mezcla de entrenamiento incluye conjuntos de habla publicos con licencias diversas, algunos restringidos a uso no comercial, por lo que cualquier uso mas alla de la investigacion exige verificar los terminos de los datasets subyacentes.
- Riesgo de alucinacion y de audio incoherente: al generar voz de forma directa mediante cabezas RVQ, el modelo puede producir contenido hablado que no se corresponda con la entrada, un riesgo especialmente relevante en full-duplex. No se documentan filtros de seguridad.
- Sin datos publicos de sesgo. No se informa sobre sesgos de genero, acento, edad ni sobre el tratamiento de variedades dialectales.
- Idiomas soportados y longitud de contexto: no disponibles. No se puede garantizar cobertura multilingue ni un tamano de ventana concreto.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de reproducibilidad ni de calidad.
- La perdida reportada (1,8863) depende de la definicion del codigo de entrenamiento y no es interpretable de forma aislada ni comparable con metricas estandar.
- Al ser full-duplex y de baja latencia por diseno, no hay evidencia de mecanismos de moderacion de contenido en la salida de audio, lo que desaconseja su uso directo con usuarios finales.
- No se publican versiones cuantizadas, lo que complica el despliegue en hardware de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hysi-lab/stream-duplex-qwen3.5-9b-stage2-245k
- Modelo base de lenguaje: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base del codec de audio: https://huggingface.co/kyutai/mimi
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
- Busqueda web: los resultados devueltos no contienen ningun enlace relevante sobre el modelo ni sobre sus modelos base; se descartan por no ser fuentes tecnicas utilizables.
