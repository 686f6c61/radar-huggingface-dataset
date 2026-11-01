# BaoKhuong/qwen3-asr-1.7b-vimd-full-GGUF

## Resumen

Qwen3-ASR-1.7B-ViMD-Full GGUF es una distribucion comunitaria de pesos convertidos a formato GGUF del modelo de reconocimiento automatico del habla (ASR) Qwen3-ASR-1.7B, afinado para vietnamita sobre el conjunto de datos ViMD. El trabajo de conversion, empaquetado y publicacion lo firma el usuario BaoKhuong, mientras que el ajuste fino original corresponde a duclvQ y la arquitectura base al equipo Qwen. No se trata, por tanto, de un modelo nuevo, sino de una exportacion de pesos ya entrenados a un formato optimizado para inferencia local.

El modelo resuelve el problema de transcribir audio en vietnamita con un transformer de aproximadamente 2.038 millones de parametros (unos 2,04 mil millones), derivado de la familia Qwen3-ASR. Su relevancia actual radica en que permite ejecutar un ASR especializado en vietnamita en entornos sin GPU de gran capacidad, gracias a las cuantizaciones Q8_0 y Q4_1, y en que se integra con herramientas de escritorio como Subtitle Edit mediante el runtime qwen3-asr.cpp.

La publicacion se limita a tres variantes GGUF (F16, Q8_0 y Q4_1) convertidas directamente desde el checkpoint BF16 original. La model card advierte explicitamente de que la compatibilidad en tiempo de ejecucion, la precision de transcripcion y las metricas WER/CER de estas exportaciones no han sido verificadas de forma independiente, lo que conviene tener en cuenta antes de usarlas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ASR de la familia Qwen3-ASR (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 2.038.052.480 (aprox. 2,04 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16 (FP16), Q8_0 (8 bits), Q4_1 (4 bits) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 (segun el repositorio original; revisar la licencia del dataset ViMD antes de uso comercial) |
| Formato de pesos | GGUF (F16, Q8_0, Q4_1) |
| Tamano del repositorio | 8,5 GB |
| Tamano de ficheros | F16: 3,803 GiB; Q8_0: 2,401 GiB; Q4_1: 1,747 GiB |
| Tensores convertidos | 707 (0 omitidos) |
| Modelo base | duclvQ/qwen3-asr-1.7b-vimd-full |
| Herramienta de conversion | predict-woo/qwen3-asr.cpp (convert_hf_to_gguf.py) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3-ASR-1.7B mas alla de su pertenencia a la familia Qwen3-ASR y de su naturaleza como sistema de reconocimiento automatico del habla. Se sabe que el checkpoint de origen es un ajuste fino completo (full fine-tuning) en BF16 sobre vietnamita, realizado por duclvQ a partir del modelo base Qwen3-ASR y entrenado con el conjunto de datos ViMD. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion tecnica de este repositorio es exclusivamente la conversion a GGUF. El proceso se realizo con el script convert_hf_to_gguf.py del proyecto qwen3-asr.cpp, convirtiendo los 707 tensores del checkpoint BF16 sin omitir ninguno. En las variantes Q8_0 y Q4_1, tres tensores de convolucion del codificador de audio se mantuvieron en F16 porque sus formas no eran compatibles con la cuantizacion por bloques seleccionada. El autor indica que estas variantes no son los checkpoints HQQ Q8 y Q4 del repositorio original, sino conversiones propias desde el checkpoint completo. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla (ASR) en vietnamita, con salida de texto transcrito.
- Transcripcion de audio orientada a la generacion de subtitulos, con integracion prevista en Subtitle Edit mediante el plugin Qwen3 ASR CPP.
- Ejecucion en local mediante el runtime qwen3-asr.cpp y otras implementaciones compatibles con GGUF de Qwen3-ASR.
- Soporte de cuantizacion para despliegue en hardware con recursos limitados (Q8_0 y Q4_1).
- Capacidades multilingues: limitadas al vietnamita segun la etiqueta de idioma del repositorio.
- Soporte de tool calling, function calling, agentes, vision o audio mas alla del propio ASR: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de subtitulos para video: el modelo transcribe audio en vietnamita y puede integrarse en Subtitle Edit a traves del plugin Qwen3 ASR CPP para producir ficheros de subtitulos de forma local, sin depender de servicios en la nube.
- Transcripcion de reuniones y entrevistas: con la variante Q8_0 (2,401 GiB) se puede ejecutar en equipos de sobremesa para convertir grabaciones en vietnamita a texto revisable, manteniendo los datos en la maquina local.
- Archivado y busqueda de contenido audiovisual: la transcripcion permite indexar grabaciones en vietnamita y habilitar busqueda por texto sobre el contenido hablado.
- Prototipado de asistentes de voz en vietnamita: el modelo sirve como componente ASR dentro de un pipeline de voz a texto, combinado con un LLM para tareas posteriores de comprension.
- Despliegue en entornos con recursos limitados: la variante Q4_1 (1,747 GiB) reduce los requisitos de memoria y permite inferencia en portatiles o mini-PC, a costa de una posible perdida de precision no cuantificada.
- Evaluacion y comparacion de pipelines ASR: al ofrecer tres niveles de cuantizacion del mismo checkpoint, permite medir el impacto de la cuantizacion en WER/CER antes de fijar una variante para produccion.
- Investigacion sobre ASR en vietnamita: sirve como punto de partida reproducible en formato GGUF para experimentos con el runtime qwen3-asr.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la precision de transcripcion y las metricas WER/CER de estas exportaciones GGUF no han sido evaluadas de forma independiente, y que solo se verificaron la finalizacion de la conversion y las cabeceras de los ficheros GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GiB para F16, 2,4 GiB para Q8_0 y 1,75 GiB para Q4_1, segun el tamano de los ficheros GGUF; debe anadirse memoria adicional para el estado de inferencia y el procesamiento de audio.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por el tamano de los pesos, cualquier GPU consumer con al menos 4-6 GB de VRAM libre deberia poder alojar las variantes cuantizadas.
- Compatibilidad con GPU consumer: si, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores para Q8_0 y Q4_1; la variante F16 requiere algo mas de margen.
- Opciones de despliegue: qwen3-asr.cpp, Subtitle Edit con el plugin Qwen3 ASR CPP y otras implementaciones compatibles con GGUF de Qwen3-ASR. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| BaoKhuong/qwen3-asr-1.7b-vimd-full-GGUF | 2,04 mil millones | No disponible | Vietnamita | Apache-2.0 | GGUF (F16, Q8_0, Q4_1) | Conversion comunitaria; sin benchmarks publicados |
| duclvQ/qwen3-asr-1.7b-vimd-full | 2,04 mil millones | No disponible | Vietnamita | Apache-2.0 | BF16 (HuggingFace) | Checkpoint original del ajuste fino; incluye variantes HQQ Q8 y Q4 |
| Qwen3-ASR-1.7B (base) | 1,7 mil millones (nominal) | No disponible | No disponible | No disponible | No disponible | Modelo base de la familia Qwen3-ASR antes del ajuste en vietnamita |

La comparacion se limita a los modelos citados en la informacion proporcionada; no se dispone de datos de rendimiento que permitan contrastar calidad de transcripcion entre alternativas.

## Limitaciones y advertencias

- La model card declara que la compatibilidad en tiempo de ejecucion, la precision de transcripcion y las metricas WER/CER de estas exportaciones GGUF no han sido verificadas de forma independiente.
- Solo se ha validado la conversion y las cabeceras de los ficheros; no hay garantia documentada de funcionamiento correcto en qwen3-asr.cpp ni en Subtitle Edit.
- El modelo esta especializado exclusivamente en vietnamita; no se ha documentado soporte para otros idiomas.
- La licencia Apache-2.0 corresponde al repositorio original, pero el autor recomienda revisar la licencia del dataset ViMD antes de un uso comercial.
- En Q8_0 y Q4_1, tres tensores de convolucion del codificador de audio se mantienen en F16 por incompatibilidad de formas con la cuantizacion por bloques, lo que puede afectar al comportamiento del codificador.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o comportamiento en dominios acusticos dificiles (ruido, acentos, audio telefónico).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- No se dispone de informacion sobre latencia, throughput ni requisitos minimos de hardware verificados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BaoKhuong/qwen3-asr-1.7b-vimd-full-GGUF
- Modelo base (ajuste fino original): https://huggingface.co/duclvQ/qwen3-asr-1.7b-vimd-full
- Herramienta de conversion qwen3-asr.cpp: https://github.com/predict-woo/qwen3-asr.cpp
- Script de conversion: https://github.com/predict-woo/qwen3-asr.cpp/blob/main/scripts/convert_hf_to_gguf.py
