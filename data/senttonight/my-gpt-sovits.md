# Senttonight/My-GPT-SoVITS

## Resumen

My-GPT-SoVITS no es un modelo base nuevo, sino un paquete de archivo publicado en HuggingFace por el usuario Senttonight que contiene la copia integra de un ajuste fino del sistema de sintesis de voz GPT-SoVITS v2Pro sobre una unica voz, denominada ji_mengyao. El repositorio ocupa 18,5 GB e incluye los pesos del modelo autorregresivo (etapa s1, checkpoints `ji_mengyao-e1` a `e15`, 149 MB cada uno), los pesos del decodificador SoVITS (etapa s2, `ji_mengyao_e4_s712.pth` y `ji_mengyao_e8_s1424.pth`), los logs completos de entrenamiento con estados de optimizador, las caches de preprocesado, el dataset de audio original, notas de configuracion y parches especificos para Windows.

Su relevancia no esta en el rendimiento del modelo, sino en el formato: es un ejemplo de paquete de reproducibilidad completo, ya que los checkpoints de `logs_s1_v2Pro` conservan el estado del optimizador y permiten reanudar el entrenamiento (fine-tuning incremental) sin reiniciar el proceso. No se publican resultados de benchmarks ni hay descargas o valoraciones registradas (0 descargas, 0 likes), por lo que se trata de un artefacto de archivo personal y no de un modelo validado por la comunidad.

Para poder usarlo hay que descargar por separado el codigo y los pesos preentrenados oficiales de GPT-SoVITS (unos 7,9 GB), que el autor no incluye. La licencia declarada en los metadatos es MIT, y los idiomas etiquetados son chino (zh) e ingles (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2Pro: pipeline de dos etapas (s1 autorregresiva tipo GPT + s2 SoVITS tipo VITS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye checkpoints sin cuantizar en `.ckpt` y `.pth`) |
| Idiomas soportados | zh (chino) e en (ingles), segun los metadatos del repositorio; el ajuste fino se realizo sobre una unica voz |
| Licencia | MIT (metadatos del repositorio de HuggingFace) |
| Formato de pesos | `.ckpt` (PyTorch, etapa s1), `.pth` (PyTorch, etapa s2), `.json` de configuracion, `.list` de anotaciones y logs de TensorBoard |
| Tamano del repositorio | 18,5 GB |
| Fecha de entrenamiento | 2026-08-25 (segun la model card) |
| Fecha de publicacion | 2026-09-12 (metadatos de HuggingFace) |
| Pipeline declarado | text-to-speech |

## Arquitectura y entrenamiento

GPT-SoVITS v2Pro es un sistema TTS de dos etapas. La etapa s1 (carpeta `GPT_weights_v2Pro/`) es un modelo autorregresivo de estilo GPT que predice tokens semanticos a partir de la secuencia de texto/fonemas y de las caracteristicas acusticas de un audio de referencia. La etapa s2 (carpeta `SoVITS_weights_v2Pro/`) es un modelo SoVITS de tipo VITS que convierte esos tokens semanticos en la forma de onda final. El repositorio evidencia este pipeline a traves de las caches de preprocesado incluidas: `3-bert` (caracteristicas de texto), `4-cnhubert` (caracteristicas semanticas), `5-wav32k` (audio a 32 kHz) y `7-sv_cn` (embeddings de verificacion de hablante).

El entrenamiento documentado es un ajuste fino sobre un unico hablante: la etapa s1 se entreno durante 15 epocas (555 pasos) y la etapa s2 llego hasta el checkpoint `e8_s1424`, con un estado final de generador/discriminador registrado como `G_233333333333`. El dataset de partida es `dataset/user_audio/` (conjunto denominado Tone01) junto con los ficheros de anotacion `human-voice.list` y `ji_mengyao_input.list`. No se menciona en la informacion disponible el uso de RLHF, DPO ni de tecnicas de alineacion adicionales, algo esperable en un fine-tune de TTS de este tipo.

Las innovaciones destacables del paquete son de caracter operativo, no algoritmico: los 15 checkpoints de `logs_s1_v2Pro/` (unos 931 MB cada uno) incluyen el estado del optimizador y permiten reanudar el entrenamiento, y el directorio `notes/` documenta dos guias de resolucion de problemas ("GPT-SoVITS_TTS推理问题与虚音解决方案" y "GPT-SoVITS_电脑问题与解决方案总结") centradas en artefactos de sintesis y en incidencias de entorno. El directorio `win-mods/` incluye versiones modificadas de `inference_webui.py` (para mostrar progreso y errores al arrancar) y `langsegmenter.py` (correccion con fast_langdetect lite), ademas de los `.bak` originales.

## Capacidades

- Sintesis de voz (text-to-speech) en chino e ingles con la voz ajustada ji_mengyao.
- Clonacion de voz mediante ajuste fino supervisado sobre un locutor concreto; el paquete no esta pensado para clonacion zero-shot de voces arbitrarias, sino para reproducir la voz entrenada.
- Inferencia interactiva a traves de la WebUI de GPT-SoVITS (`inference_webui.py`), seleccionando manualmente los pesos s1 en `.ckpt` y s2 en `.pth`.
- Reanudacion y continuacion del entrenamiento gracias a los checkpoints con estado de optimizador incluido.
- Conversiones de audio a 32 kHz como parte del pipeline de preprocesado (`5-wav32k`).
- Registro de metricas de entrenamiento en TensorBoard (directorio `tensorboard`).
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso: es exclusivamente un modelo de sintesis de voz.
- No se documentan capacidades de vision, audio de entrada mas alla de la referencia de voz, ni modo "thinking".

## Casos de uso

- Clonacion de voz para un unico locutor: el paquete esta disenado para reproducir la voz ji_mengyao, de modo que se puede usar para generar narraciones o locuciones consistentes con esa identidad vocal concreta.
- Doblaje y localizacion de contenido en chino e ingles: al estar etiquetado con ambos idiomas, permite generar la misma voz en dos idiomas para videos o cursos, siempre que se disponga de los permisos sobre la voz original.
- Audiolibros y contenido narrado: la voz ajustada se puede emplear para convertir texto largo en audio de forma automatizada, integrando la WebUI o un script propio sobre los pesos s1/s2.
- Asistentes de voz personalizados: la voz clonada se puede incorporar a un asistente conversacional local, usando GPT-SoVITS como capa de sintesis y un LLM aparte como capa de dialogo.
- Investigacion sobre fine-tuning de TTS: el repositorio sirve como caso de estudio reproducible, ya que incluye dataset, configuracion (`notes/ji_mengyao_training_config.json`), caches de preprocesado y checkpoints intermedios con optimizador.
- Reanudacion de entrenamientos largos: los checkpoints de `logs_s1_v2Pro/` permiten retomar el ajuste fino en otro equipo sin repetir el preprocesado ni las epocas ya completadas.
- Depuracion de artefactos de sintesis: las notas del autor sobre "虚音" (voces irreales o ruido en la salida) y los parches de `win-mods/` son utiles como referencia para diagnosticar problemas equivalentes en otros despliegues de GPT-SoVITS.
- Reproduccion de entornos en Windows: los ficheros modificados de `inference_webui.py` y `langsegmenter.py` permiten replicar una configuracion de trabajo ya probada por el autor en ese sistema operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, similitud de hablante, WER) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- Espacio en disco: 18,5 GB para el repositorio completo. Para solo inferencia bastan los pesos del ajuste fino (149 MB por checkpoint s1) mas los pesos preentrenados oficiales v2Pro, que no se incluyen y ocupan aproximadamente 7,9 GB.
- VRAM para inferencia: no disponible. El autor no publica requisitos de hardware.
- VRAM para reanudar el entrenamiento: no disponible. Como referencia, cada checkpoint de la etapa s1 con estado de optimizador ocupa unos 931 MB, lo que da una idea del orden de magnitud del estado en memoria, pero no permite derivar un requisito de VRAM fiable.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: WebUI de inferencia de GPT-SoVITS (los ficheros de `win-mods/` son variantes de `inference_webui.py`), TensorBoard para monitorizar el entrenamiento y ejecucion directa desde el codigo fuente oficial. No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Clonacion de voz | Notas |
|---|---|---|---|---|---|
| My-GPT-SoVITS (este repositorio) | Ajuste fino de GPT-SoVITS v2Pro | zh, en | MIT (metadatos del repositorio) | Si, limitada a la voz ji_mengyao | Paquete de archivo; requiere los pesos base oficiales |
| GPT-SoVITS v2Pro (modelo base) | TTS de dos etapas (s1 + s2) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Si, con audio de referencia | No incluido en este repositorio; debe descargarse del proyecto oficial |
| XTTS-v2 (Coqui) | TTS autorregresivo multilingue | Multilingue | No disponible en la informacion proporcionada; verificar en el repositorio oficial | Si | Alternativa frecuente en TTS con clonacion; datos no procedentes de la busqueda web disponible |
| CosyVoice 2 | TTS basado en LLM | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Si | Alternativa de la misma categoria; verificar detalles en el repositorio oficial |

Nota: los datos sobre alternativas no proceden de la informacion proporcionada en esta busqueda y deben verificarse en sus repositorios oficiales antes de usarse en una decision tecnica. La busqueda web realizada no devolvio resultados relacionados con el modelo.

## Limitaciones y advertencias

- El paquete es un archivo personal, no un modelo validado: registra 0 descargas y 0 likes, y no incluye evaluacion objetiva alguna.
- No contiene los pesos preentrenados ni el codigo fuente de GPT-SoVITS; sin descargarlos aparte, los checkpoints no son utilizables.
- El ajuste fino esta limitado a un unico hablante (ji_mengyao) y a un dataset pequeno, por lo que puede sufrir sobreajuste y degradar la prosodia o la inteligibilidad en textos alejados del dominio de entrenamiento. Las propias notas del autor abordan problemas de "虚音" (artefactos de sintesis).
- Los idiomas etiquetados son zh y en; no hay evidencia de soporte fiable de otros idiomas en esta voz ajustada.
- La licencia MIT se declara a nivel de repositorio, pero los pesos base, los modelos auxiliares (BERT, cnhubert, verificacion de hablante) y las dependencias pueden tener licencias propias; hay que comprobarlas antes de un uso comercial.
- Riesgo de alucinacion acustica: como todo sistema TTS, puede generar prosodia incorrecta, ruido o pronunciaciones erroneas, especialmente en nombres propios, siglas o dominios tecnicos.
- La clonacion de voz exige consentimiento explicito de la persona cuya voz se clono. El uso sin autorizacion puede infringir derechos de imagen y voz, y en la Union Europea activa obligaciones de transparencia sobre contenido generado por IA.
- Los parches de `win-mods/` son modificaciones no oficiales del codigo de inferencia y del segmentador de idioma; su uso puede desviarse del comportamiento del proyecto original.
- El autor indica que el repositorio es un almacenamiento previo a una limpieza local, por lo que su permanencia a largo plazo no esta garantizada.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento, composicion demografica de la voz ni procedencia de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Senttonight/My-GPT-SoVITS
- Repositorio oficial de GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS

Nota: los resultados de busqueda web proporcionados corresponden a servicios de correo y almacenamiento en bulgaro (ABV, DOX.bg) y no guardan relacion con el modelo, por lo que no se incluyen como enlaces relevantes.
