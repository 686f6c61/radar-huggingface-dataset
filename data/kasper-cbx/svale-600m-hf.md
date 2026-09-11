# kasper-cbx/svale-600M-hf

## Resumen

svale-600M-hf es una conversion de formato del modelo de reconocimiento automatico del habla (ASR) `3dio-ai/svale-600M`, publicado por el usuario kasper-cbx. El modelo original se distribuye exclusivamente como archivo `.nemo`, lo que obliga a usar `nemo_toolkit` en tiempo de ejecucion; esta version reempaqueta los mismos pesos en formato `transformers` bajo la clase `ParakeetForTDT`, sin modificar ningun peso.

Se trata de un modelo denso de 627.057.286 parametros, basado en la arquitectura Parakeet de NVIDIA con decodificacion TDT (Token-and-Duration Transducer), y especializado exclusivamente en danes (`da`). No es un modelo de lenguaje generativo: su unica funcion es transcribir audio mono a 16 kHz y devolver texto en minusculas y sin puntuacion.

Su relevancia es practica mas que de rendimiento: al eliminar la dependencia de NeMo, el modelo puede ejecutarse en Hugging Face ZeroGPU Spaces, donde la importacion de NeMo en el proceso principal rompe el `fork()` que ZeroGPU usa para lanzar los workers de GPU y provoca que todas las peticiones fallen con "GPU task aborted". El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet con decodificacion TDT (Token-and-Duration Transducer); clase `ParakeetForTDT` en `transformers` |
| Parametros totales | 627.057.286 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible. Modelo ASR: procesa audio mono a 16 kHz; la duracion maxima de audio por inferencia no se especifica |
| Tipos de cuantizacion | No disponible. Solo se publican pesos sin cuantizar en `safetensors` |
| Idiomas soportados | Danes (`da`) unicamente |
| Licencia | NVIDIA Open Model License (`license: other`), con las restricciones de uso CoRal OpenRAIL-D heredadas de los datos de entrenamiento |
| Formato de pesos | `safetensors` (formato `transformers`; el original solo existe como archivo `.nemo`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Parakeet de NVIDIA con decodificacion TDT, una variante del transductor (RNN-T) en la que el decodificador predice conjuntamente el token y su duracion. Este mecanismo permite emitir varios tokens por paso de decodificacion y reduce el coste computacional frente a un transductor clasico, algo relevante en un modelo de solo 627 M de parametros orientado a inferencia en tiempo real o de bajo coste.

Los pesos son identicos a los del modelo base `3dio-ai/svale-600M`; esta ficha cubre una conversion de formato, no un reentrenamiento. El autor documento el proceso con el script oficial de `transformers`:

```
python src/transformers/models/parakeet/convert_nemo_to_hf.py \
  --hf_repo_id 3dio-ai/svale-600M --model_type tdt --output_dir .
```

No se dispone de informacion sobre el numero de horas de audio, la composicion exacta del dataset ni el procedimiento de ajuste. La model card menciona que los datos de entrenamiento conllevan las restricciones de uso CoRal OpenRAIL-D, lo que situa el corpus CoRal (danes) como fuente de datos. Al ser un sistema ASR discriminativo, no se aplican tecnicas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en danes a partir de audio mono float32 a 16 kHz.
- Salida en minusculas y sin puntuacion, igual que el modelo original.
- No acepta argumentos `language` ni `task`: la entrada de idioma y tarea esta fijada internamente a danes y transcripcion.
- Inferencia via `pipeline("automatic-speech-recognition")` de `transformers`, con soporte de `device="cuda"`.
- Compatible con entornos ZeroGPU al no requerir `nemo_toolkit` en tiempo de ejecucion.
- No dispone de generacion de texto libre, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni flujos de agente multi-paso.
- No se documentan marcas de tiempo, diarizacion de hablantes, deteccion de idioma ni traduccion.
- No se documenta modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Transcripcion de audio danes en Spaces de Hugging Face: es el escenario que motiva la conversion, ya que elimina NeMo del runtime y evita el fallo de `fork()` de ZeroGPU. Se usaria con `batch_size=1` para preservar la fidelidad de decodificacion.
- Subtitulado de contenido en danes: el modelo genera transcripciones sin puntuacion, por lo que un post-proceso de restauracion de puntuacion y mayusculas seria necesario antes de publicar subtitulos.
- Indexacion y busqueda sobre archivos de audio: transcripcion de grabaciones danesas para alimentar un indice de texto o un motor de busqueda interno.
- Analisis de llamadas o reuniones en danes: volcado de conversaciones a texto para revision posterior, teniendo en cuenta que no se documenta soporte de marcas de tiempo ni diarizacion.
- Preprocesado de corpus para investigacion en PLN danes: generacion de transcripciones a escala sobre un corpus de audio, con la ventaja de un modelo de 627 M que cabe en GPU de consumo.
- Dictado o entrada de voz en aplicaciones locales: despliegue en una GPU de gama media o incluso en CPU para prototipos, dado el reducido tamano de pesos (aproximadamente 1,25 GB en bf16).
- Evaluacion comparativa de arquitecturas ASR: al estar disponible en `transformers`, permite medir una alternativa TDT frente a modelos encoder-decoder tipo Whisper sobre el mismo conjunto de audio danes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni WER, ni MMLU, ni HumanEval, ni GSM8K; son metricas en su mayoria no aplicables a un modelo ASR).

El unico dato cuantitativo aportado por el autor es una prueba de fidelidad de decodificacion frente a la referencia de NeMo sobre un conjunto de prueba de 45 turnos:

| Modo de decodificacion | Turnos que reproducen la referencia de NeMo | Observaciones |
|---|---|---|
| `batch_size=1` | 42 / 45 | Los tres restantes difieren solo en `uden for`/`udenfor` y una locucion sin sentido |
| `batch_size > 1` | 23 / 45 | Sobregeneracion sobre el relleno (padding) del lote |

Este dato no es un benchmark estandar de calidad ASR y no debe interpretarse como una tasa de error de palabra.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en fp32, 1,25 GB en bf16/fp16 y 0,63 GB en int8 sobre los pesos; con activaciones y buffers conviene reservar del orden de 2 GB en bf16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Se ha documentado su uso en ZeroGPU; A100, H100, L40S o RTX 4090 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` con `pipeline` (soporte nativo de `ParakeetForTDT`), y el `nemo_toolkit` original si se usa el modelo base. No se documenta soporte en vLLM, TGI, llama.cpp, Ollama ni whisper.cpp. La conversion a ONNX no esta publicada.
- Latencia y throughput: no disponibles. El autor advierte que el procesamiento por lotes degrada la salida, por lo que el throughput paralelo debe obtenerse con multiples flujos concurrentes con `batch_size=1` en lugar de decodificacion por lotes.

## Comparativa con modelos similares

Los datos de terceros que aparecen a continuacion proceden de conocimiento publico general y no de la informacion proporcionada en esta busqueda; los campos no verificados se marcan como no disponibles.

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| kasper-cbx/svale-600M-hf | 627 M | Danes | No disponible | NVIDIA Open Model License + restricciones CoRal OpenRAIL-D | safetensors (`transformers`) |
| nvidia/parakeet-tdt-0.6b-v2 | 600 M aprox. | Ingles | No disponible | CC-BY-4.0 (segun la model card publica de NVIDIA) | NeMo, safetensors |
| openai/whisper-large-v3 | 1550 M aprox. | Multilingue (99 idiomas) | Ventana de 30 s | MIT | safetensors, GGUF, ONNX |

No se han encontrado en la busqueda web modelos comparables adicionales; los resultados devueltos no guardan relacion con el modelo.

## Limitaciones y advertencias

- Solo soporta danes. No acepta parametro de idioma ni de tarea, por lo que el audio en otros idiomas producira salidas incorrectas.
- La salida no incluye puntuacion ni mayusculas; requiere post-procesado para la mayoria de usos finales.
- La decodificacion por lotes es defectuosa: el autor reporta 23/45 turnos correctos con `batch_size > 1` frente a 42/45 con `batch_size=1`. Se debe forzar `batch_size=1` en produccion.
- Licencia restrictiva: NVIDIA Open Model License (`license: other`), no es una licencia OSI de uso libre sin condiciones. Es necesario revisar los terminos antes de un uso comercial.
- Restricciones adicionales heredadas de los datos CoRal OpenRAIL-D: prohibida la sintesis de voz y la identificacion biometrica a partir del modelo.
- Riesgo de alucinacion y de sobregeneracion en audio con ruido, silencios largos o solapamiento de hablantes; no se documentan mecanismos de mitigacion ni VAD integrado.
- El repositorio tiene 0 descargas y 0 likes, y fue publicado por un usuario individual: no existe validacion independiente de la calidad de la conversion mas alla de la prueba de 45 turnos del autor.
- Es una conversion de formato, no un reentrenamiento: hereda todas las limitaciones del modelo base `3dio-ai/svale-600M`.
- No se documentan marcas de tiempo, diarizacion, deteccion de hablante ni puntuacion, lo que limita su uso directo en subtitulado o analitica de conversaciones.
- La busqueda web realizada no devolvio informacion relevante sobre el modelo (los resultados corresponden a servicios de prospeccion comercial y antivirus); no hay fuente independiente que confirme el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kasper-cbx/svale-600M-hf
- Modelo base: https://huggingface.co/3dio-ai/svale-600M
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Script de conversion citado por el autor: `src/transformers/models/parakeet/convert_nemo_to_hf.py` (repositorio de `transformers` de Hugging Face)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
