# emma333333/whisper-tiny_to_british_accent_01

## Resumen

Whisper tiny British es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario emma333333 en HuggingFace. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, disenada originalmente por OpenAI para reconocimiento automatico del habla (ASR) multilingue, y ha sido reentrenado sobre un dataset identificado como "british_english" con el objetivo de adaptar el reconocimiento a acentos britanicos del ingles. Cuenta con 37.760.640 parametros totales, lo que lo situa en la categoria de modelos ultraligeros dentro de la familia Whisper.

La relevancia de este modelo reside en su caracter especializado: en lugar de un ASR generico, se ofrece una variante afinada para un dominio concreto (ingles britanico) manteniendo el reducido coste computacional de whisper-tiny. Esto lo hace atractivo para despliegues en entornos con recursos limitados, como dispositivos edge o servicios de transcripcion de bajo coste, donde un modelo de mayor tamano no seria viable.

No obstante, la informacion disponible es escasa: la model card esta generada automaticamente por el Trainer y contiene secciones sin completar ("More information needed"). El modelo registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026. El WER declarado en el conjunto de evaluacion es de 13,39, un valor que debe interpretarse con cautela dado que no esta verificado y el dataset de evaluacion no esta documentado en detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion estandar, disenado para tomar espectrogramas mel de audio como entrada y generar transcripciones token a token. Whisper-tiny es el miembro mas pequeno de la familia Whisper, con aproximadamente 39 millones de parametros, lo que se traduce en una huella de memoria muy reducida y una latencia baja en inferencia.

El entrenamiento consistio en un ajuste fino supervisado sobre el dataset "british_english". Segun los hiperparametros declarados en la model card, se uso AdamW con betas (0,9; 0,999), epsilon 1e-8, learning rate de 1e-5, scheduler lineal con 500 pasos de warmup, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42 y un total de 2000 pasos. El entrenamiento se ejecuto con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el numero de tokens de audio, la composicion del dataset ni si hubo etapas de RLHF o DPO (poco probable en un modelo ASR de este tipo). Tampoco se describe ninguna innovacion tecnica adicional mas alla del ajuste fino supervisado.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en acentos britanicos.
- Transcripcion de audio a texto con salida token a token.
- Procesamiento de ventanas de audio de hasta 30 segundos, segun el diseno estandar de Whisper.
- Capacidad multilingue limitada: solo se declara soporte para ingles.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades de vision, audio generativo ni thinking mode.
- No se declara deteccion de idioma ni traduccion de voz.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles britanico: el modelo puede convertir grabaciones de hasta 30 segundos por ventana en texto, adecuado para actas y resumenes en entornos corporativos del Reino Unido.
- Subtitulado automatico de contenido audiovisual: por su reducido tamano, puede integrarse en pipelines de generacion de subtitulos en tiempo casi real para videos de baja/media duracion.
- Asistentes de voz en dispositivos edge: con 37,7 millones de parametros, cabe en dispositivos con recursos limitados (Raspberry Pi, moviles de gama media) para comandos de voz y dictado.
- Atencion al cliente telefónica automatizada: transcripcion de llamadas en ingles britanico para su posterior analisis o enrutamiento, con coste computacional bajo.
- Investigacion en adaptacion de acentos: sirve como punto de partida para estudiar el efecto del fine-tuning sobre acentos especificos en modelos ASR pequenos.
- Prototipado rapido de aplicaciones de voz: al ser un modelo ligero y con licencia Apache 2.0, es adecuado para validar ideas de producto sin grandes inversiones en infraestructura.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de archivos de audio para hacerlos buscables en repositorios documentales.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | British English | test | 13,3868 |
| Loss (validacion) | British English | test | 0,2952 |

Evolucion durante el entrenamiento segun la model card:

| Training loss | Epoca | Paso | Validation loss | WER |
|---|---|---|---|---|
| 0,3261 | 0,9901 | 1000 | 0,3014 | 15,1985 |
| 0,1732 | 1,9802 | 2000 | 0,2952 | 13,3868 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,7 M de parametros); en fp16 aproximadamente 75 MB de pesos, mas overhead de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutar el modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y en CPU.
- Opciones de despliegue: transformers (libreria nativa), vLLM (soporte limitado para Whisper), llama.cpp (soporte experimental para Whisper), Ollama (soporte de Whisper variable), TGI (soporte de ASR limitado). La via mas directa es transformers con `pipeline("automatic-speech-recognition")`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia muy baja en GPU y moderada en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| emma333333/whisper-tiny_to_british_accent_01 | 37,7 M | 30 s (ventana Whisper) | en | apache-2.0 | 13,39 (no verificado) |
| openai/whisper-tiny | ~39 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | ~74 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | ~244 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |

La comparativa se limita a la familia Whisper por ser el linaje directo del modelo. No se dispone de datos de rendimiento de los modelos base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar; no hay documentacion sobre sesgos, dominio de entrenamiento ni limitaciones declaradas por el autor.
- El WER de 13,39 no esta verificado y el dataset de evaluacion ("british_english") no esta descrito en detalle, por lo que su representatividad es incierta.
- El modelo solo declara soporte para ingles; no se garantiza un rendimiento adecuado en otros idiomas o acentos no britanicos.
- Riesgo de alucinacion en la transcripcion: como todo modelo ASR generativo, puede producir texto plausible pero incorrecto en segmentos con ruido, silencios o audio de baja calidad.
- Ventana de audio limitada a 30 segundos por inferencia (herencia de Whisper); para audio mas largo es necesario segmentar.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar los terminos del modelo base y las condiciones de uso de los datos de entrenamiento originales.
- No se documenta el origen del dataset "british_english", lo que impide evaluar posibles sesgos demograficos o de dominio.
- El modelo se creo con versiones de desarrollo de Transformers (5.23.0.dev0) y PyTorch (2.11.0+cu130), lo que puede generar incompatibilidades con entornos estables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emma333333/whisper-tiny_to_british_accent_01
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
