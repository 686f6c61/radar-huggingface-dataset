# Alimalas/munajjam-onnx-models

## Resumen

Munajjam ONNX Models es un repositorio de modelos neuronales publicados por Ali Malas (Alimalas), dentro de los denominados Itqan Projects, y pensado para dar soporte a la plataforma de escritorio Munajjam (alineacion coranica). No se trata de un unico modelo, sino de un paquete de tres componentes exportados a formato ONNX Runtime: un segmentador de recitacion basado en Wav2Vec2-BERT, un motor de alineacion forzada de audio denominado zipformer_p_arabic_v3 y el detector de actividad vocal Silero VAD.

El problema que resuelve es la alineacion forzada (forced alignment) de audio de recitacion del Coran a nivel de palabra y de letra, junto con la segmentacion del audio en respiraciones y posiciones de pausa (waqf). Esto es util para aplicaciones de tajweed, memorizacion (hifz), subtitulado, sincronizacion de texto y audio, y analisis de corpus de recitadores. La eleccion de ONNX y de los execution providers DirectML y CUDA indica un objetivo de inferencia rapida y de bajo consumo en equipos de escritorio Windows con GPU consumer, no solo en servidores.

La licencia declarada es Apache 2.0, el idioma soportado es arabe (ar) y el pipeline asignado en HuggingFace es automatic-speech-recognition. El repositorio no publica numero de parametros, ventana de contexto, cuantizaciones ni resultados de benchmarks, y en el momento de la consulta acumula 0 descargas y 0 likes. La model card esta redactada en arabe y no incluye documentacion tecnica detallada de cada componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de tres modelos: segmentador basado en Wav2Vec2-BERT, motor de alineacion Zipformer (zipformer_p_arabic_v3) y detector de actividad vocal Silero VAD |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se trata de modelos de audio; no se especifica tamano de ventana de audio) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se detalla la precision, FP32/FP16/INT8) |
| Idiomas soportados | arabe (ar), orientado especificamente a recitacion coranica |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (ONNX Runtime, con execution providers CUDA y DirectML) |
| Autor | Alimalas (Ali Malas, Itqan Projects) |
| Pipeline declarado | automatic-speech-recognition |
| Componentes incluidos | recitation-segmenter-v2 (ONNX), zipformer_p_arabic_v3 (ONNX), silero_vad (ONNX) |
| Fecha de publicacion (metadatos) | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio agrupa tres componentes con funciones diferenciadas. El primero, recitation-segmenter-v2, es un modelo de segmentacion neuronal de respiraciones y posiciones de pausa coranica construido sobre Wav2Vec2-BERT. El segundo, zipformer_p_arabic_v3, se describe como un motor de alineacion forzada de muy alta velocidad que opera con correspondencia a nivel de palabra y de letra; la nomenclatura "zipformer" remite a la familia de codificadores eficientes derivada de Conformer con downsampling y atencion con bias, habitual en pipelines de reconocimiento de voz. El tercero es Silero VAD, un detector de actividad vocal de proposito general que se emplea para segmentar y aislar voz antes del procesamiento.

No se especifican en la informacion disponible el numero de parametros de cada componente, el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se detalla si el motor de alineacion emplea decodificacion tipo CTC, transducer o un esquema de coincidencia forzada sobre transcripcion canonica. La unica innovacion tecnica explicitamente mencionada es la conversion a ONNX Runtime con soporte de DirectML y CUDA, orientada a reducir el consumo de recursos y aumentar la velocidad de inferencia en la plataforma de escritorio Munajjam. Cualquier detalle adicional sobre el entrenamiento debe considerarse no disponible.

## Capacidades

- Segmentacion de recitacion coranica: deteccion de respiraciones y de posiciones de pausa o waqf dentro de un audio continuo.
- Alineacion forzada a nivel de palabra y de letra entre el audio y el texto coranico de referencia.
- Deteccion de actividad vocal y aislamiento de voz mediante Silero VAD, util como etapa previa de filtrado.
- Reconocimiento de voz en arabe dentro del dominio concreto de la recitacion coranica.
- Generacion de marcas temporales (timestamps) para sincronizacion de texto y audio.
- Inferencia optimizada mediante ONNX Runtime, con posibilidad de ejecucion en GPU mediante CUDA o DirectML.
- Soporte para integracion en aplicaciones de escritorio, segun el proyecto Munajjam Desktop Platform referenciado en la model card.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de razonamiento explicito, ya que no son capacidades propias de este tipo de modelos.

## Casos de uso

- Alineacion de recitaciones para aplicaciones de tajweed: el motor de alineacion permite asociar cada palabra y cada letra del texto coranico a su posicion temporal exacta en el audio, lo que habilita resaltado sincronizado y correccion de pronunciacion.
- Segmentacion por respiraciones y pausas: el componente recitation-segmenter-v2 divide recitaciones largas en unidades de respiracion o waqf, facilitando el analisis por versiculos y la navegacion en aplicaciones de lectura.
- Subtitulado y karaoke de recitacion: con marcas temporales a nivel de palabra se pueden generar subtitulos sincronizados para videos, retransmisiones o contenido educativo.
- Seguimiento de memorizacion (hifz): comparando la recitacion de un estudiante con el texto canonico alineado, la aplicacion puede detectar omisiones, sustituciones o pausas incorrectas y generar retroalimentacion automatica.
- Preprocesado de audio en pipelines de ASR: el detector Silero VAD permite eliminar silencios y ruido de fondo antes de enviar el audio al motor de reconocimiento o de alineacion, reduciendo coste computacional.
- Archivado y busqueda en corpus de recitadores: al disponer de alineacion a nivel de palabra y letra, es posible indexar grandes colecciones de audio y recuperar fragmentos concretos por texto.
- Aplicaciones de escritorio sin conexion: al distribuirse en formato ONNX con provider DirectML, el conjunto puede ejecutarse localmente en equipos Windows con GPU consumer, evitando enviar audio a servicios en la nube.
- Herramientas de edicion y produccion de audio coranico: las marcas temporales facilitan el corte, la mezcla y la publicacion por versiculos o por segmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica el numero de parametros ni el consumo de memoria de cada componente, por lo que no es posible estimar requisitos fiables.
- GPU recomendadas: no especificadas. La presencia de execution providers CUDA y DirectML indica compatibilidad con GPUs NVIDIA y con GPUs Windows compatibles con DirectX 12.
- Cabe en GPU consumer: previsiblemente si, dado que el objetivo declarado es el despliegue en una plataforma de escritorio y que se incluye un VAD de proposito general, pero no hay datos publicados que lo confirmen para el conjunto completo.
- Opciones de despliegue: ONNX Runtime con execution providers CUDA, TensorRT, DirectML o CPU, en aplicaciones Python, C++ o .NET. Stacks orientados a modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que estos modelos no son LLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se plantea frente a herramientas orientadas a reconocimiento de voz y alineacion forzada en arabe. Los datos de las alternativas corresponden a informacion publica general de cada proyecto y no a mediciones realizadas sobre este repositorio.

| Modelo / herramienta | Desarrollador | Parametros | Enfoque | Licencia | Observaciones |
|---|---|---|---|---|---|
| munajjam-onnx-models (este repositorio) | Alimalas (Itqan Projects) | no disponible | Alineacion forzada y segmentacion coranica en ONNX | apache-2.0 | Especifico de recitacion coranica; sin benchmarks publicados; 0 descargas |
| Whisper (large-v3) con WhisperX | OpenAI / comunidad | 1.550 millones (large-v3) | ASR multilingue y alineacion por timestamps | MIT | Cobertura multilingue amplia; la alineacion es aproximada y requiere herramientas externas |
| MMS (mms-1b-all) | Meta | 1.000 millones | ASR multilingue (mas de 1.100 idiomas) | CC-BY-NC 4.0 | Licencia no comercial; no especifico de tajweed ni de pausas coranicas |
| Silero VAD | Silero Team | no disponible | Deteccion de actividad vocal | MIT | Componente incluido tambien en este repositorio; tarea mucho mas acotada |

## Limitaciones y advertencias

- No se publican benchmarks, metricas de error ni evaluaciones comparativas, por lo que el rendimiento real no puede verificarse con la informacion disponible.
- El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.
- La documentacion tecnica es minima: no se indican parametros, precisiones numericas ni ventanas de audio soportadas.
- El ambito linguistico declarado es exclusivamente arabe (ar) y esta especializado en recitacion coranica; no cabe esperar buen rendimiento en arabe conversacional ni en otros idiomas.
- La alineacion forzada depende de disponer de la transcripcion canonica correcta; cualquier desviacion del texto de referencia invalida o degrada el resultado.
- El detector de actividad vocal puede comportarse de forma suboptima con ruido de fondo intenso, musica o solapamiento de voces, algo critico en grabaciones de mezquita.
- Riesgo de alucinacion o de sustitucion de texto: en tareas de reconocimiento y alineacion, los errores se manifiestan como palabras o letras mal atribuidas, especialmente en recitaciones rapidas o con tajweed marcado.
- Aunque la licencia declarada del repositorio es Apache 2.0, conviene verificar las licencias de los modelos base subyacentes (por ejemplo, los pesos de Wav2Vec2-BERT publicados por terceros pueden estar sujetos a condiciones adicionales) antes de un uso comercial.
- No se documentan sesgos especificos, pero un sistema especializado en un unico dominio y registro vocal puede generalizar mal a voces atipicas, mujeres u otros estilos de recitacion no representados en los datos de entrenamiento.
- Al ser pesos ONNX, la portabilidad depende de que el runtime destino soporte las operaciones empleadas; versiones antiguas de ONNX Runtime pueden no cargar los grafos correctamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Alimalas/munajjam-onnx-models
- Proyecto Munajjam Desktop Platform (GitHub): https://github.com/alinice1998/colabwis
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (unicamente resultados ajenos del portal aleman n-tv.de); no se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
