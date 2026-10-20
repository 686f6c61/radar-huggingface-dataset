# danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching

## Resumen

Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla nvidia/parakeet-tdt-0.6b-v2, publicado por el usuario danielrosehill en HuggingFace. El objetivo declarado por los metadatos del repositorio es el reconocimiento de habla con cambio de codigo (code-switching) entre ingles y hebreo, es decir, transcripcion de audio en el que el hablante alterna ambas lenguas dentro de la misma frase o turno. El modelo conserva la libreria y el formato del ecosistema NVIDIA NeMo y se distribuye tambien en ONNX y GGUF, ademas de los pesos nativos.

Se trata de un modelo de aproximadamente 617,9 millones de parametros (0,6B), lo que lo situa en la gama media-baja de tamano para ASR y permite inferencia en GPU de consumo. Los tags incluyen `speaker-adaptation`, lo que sugiere que el ajuste incorpora datos de adaptacion a voz o hablantes concretos, ademas de los conjuntos de datos de code-switching. El acceso al repositorio esta restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.

Su relevancia actual es acotada pero especifica: el ASR multilingue con code-switching sigue siendo un punto debil en los modelos generalistas, y los ajustes sobre arquitecturas eficientes como Parakeet TDT cubren un nicho practico (transcripcion de reuniones, clases o contenido audiovisual bilinguee ingles-hebreo). El repositorio es grande (48,5 GB) porque incluye multiples artefactos y estados de entrenamiento, no porque el modelo tenga ese tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + TDT (Token-and-Duration Transducer), familia NVIDIA Parakeet; detalles exactos del fine-tune no disponibles |
| Parametros totales | 617.869.958 (~0,6B), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; la duracion de audio procesable depende de la configuracion de inferencia y no se documenta en la informacion disponible) |
| Tipos de cuantizacion | no disponible en detalle; el repositorio incluye artefactos ONNX y GGUF ademas de los pesos nativos NeMo |
| Idiomas soportados | ingles (en) y hebreo (he), con soporte declarado de code-switching entre ambos |
| Licencia | cc-by-4.0 |
| Formato de pesos | NeMo (.nemo), ONNX y GGUF |

Otros datos del repositorio: 2.173 descargas, 0 likes, tamano de 48,5 GB, creado el 2026-10-15 y actualizado el 2026-10-19, DOI 10.57967/hf/10995, acceso restringido.

## Arquitectura y entrenamiento

El modelo parte de nvidia/parakeet-tdt-0.6b-v2, un sistema ASR de la familia Parakeet de NVIDIA construido sobre un encoder FastConformer (variante de Conformer con atencion subsampleada) y un decodificador TDT. El decodificador TDT predice conjuntamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un transducer clasico y mejora el rendimiento en streaming y en audio largo. El ajuste anade capacidades de reconocimiento en hebreo y de alternancia ingles-hebreo, un escenario que el modelo base no cubre por estar orientado a ingles.

Los datos de ajuste fino que se pueden inferir de los tags y de los campos de dataset son cuatro conjuntos: danielrosehill/Read-Aloud-Voice-Sentences (presumiblemente adaptacion de voz o lectura de frases), danielrosehill/English-Hebrew-Codeswitching-Sentences, Hebrish/English-Hebrew-Mixed-Sentences y openslr/librispeech_asr (ingles, probablemente para preservar el rendimiento original y evitar olvido catastrofico). No se especifican en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset, la duracion total en horas ni si se aplicaron tecnicas de aumento de datos o de RLHF/DPO (no aplicables de forma estandar en ASR). Tampoco se detalla la estrategia de congelacion de capas ni si se entreno solo el decodificador o el modelo completo.

## Capacidades

- Reconocimiento automatico del habla (transcripcion audio a texto) en ingles y en hebreo.
- Manejo de code-switching ingles-hebreo: transcripcion de habla en la que el hablante alterna ambas lenguas dentro de la misma intervencion.
- Adaptacion a hablante (tag `speaker-adaptation`): el ajuste incorpora datos de voz especificos, lo que puede mejorar la precision sobre voces similares a las del conjunto de entrenamiento.
- Salida de transcripcion como tarea principal del pipeline `automatic-speech-recognition`; no se documentan marcas de tiempo, diarizacion ni puntuacion en la informacion disponible.
- Despliegue en multiples formatos (NeMo, ONNX, GGUF), lo que facilita integracion en entornos con y sin GPU.
- No disponible: soporte de tool calling, capacidades de agente, vision, audio-vision o modos de razonamiento extendido (no son capacidades propias de un modelo ASR y no se declaran).

## Casos de uso

- Transcripcion de reuniones bilingueses: reuniones de equipos israelies que trabajan en ingles y cambian al hebreo de forma espontanea. El modelo esta ajustado especificamente para esa alternancia, que es donde fallan los ASR monolingues.
- Subtitulado de contenido audiovisual: generacion de subtitulos para videos de YouTube o cursos en linea con intervenciones mixtas ingles-hebreo, usando el formato ONNX para despliegue en servidor sin dependencia del stack NeMo.
- Notas clinicas o legales dictadas: dictado en consultas o despachos donde el profesional usa terminologia en ingles dentro de una frase en hebreo; la adaptacion a hablante puede reducir errores sobre voces recurrentes.
- Atencion al cliente basada en voz: transcripcion de llamadas de soporte en centros bilingueses para alimentar analitica, busqueda y control de calidad. El tamano de 0,6B permite ejecutar varias instancias en una sola GPU.
- Investigacion en linguistica computacional: corpus de habla mezclada ingles-hebreo para estudiar alternancia de codigo, fonetica de prestamos y comportamiento de modelos transducer en escenarios multilingues.
- Prototipado en local: con cuantizacion INT8 o GGUF el modelo se puede ejecutar en una estacion de trabajo o incluso en CPU con ONNX Runtime, util para demos y validacion de producto antes de invertir en infraestructura.
- Accesibilidad: transcripcion en tiempo real de clases o charlas bilingueses para personas con discapacidad auditiva, siempre que la latencia del pipeline TDT (que favorece streaming) se valide en el entorno concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan cifras de WER (word error rate) sobre conjuntos de prueba propios, ni resultados de comparacion con el modelo base o con otros ASR en hebreo o en code-switching, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,6 GB en FP16 (0,62B parametros = ~1,24 GB de pesos mas activaciones y buffers de decodificacion), en torno a 0,8-1,2 GB en INT8 y 0,5-0,8 GB en INT4/GGUF.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica; para lotes grandes o varias instancias por GPU, A100, H100, L40S o RTX 4090 ofrecen margen de sobra. Una T4 o una RTX 3060 son suficientes para inferencia en produccion ligera.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060/4070/4080/4090 y equivalentes; tambien en iGPU recientes con cuantizacion.
- Despliegue: NVIDIA NeMo (formato nativo), ONNX Runtime (artefactos ONNX del repositorio), y GGUF mediante runtimes compatibles (no se especifica cual en la informacion disponible). vLLM y TGI no aplican a un modelo transducer de ASR.
- Latencia y throughput: no disponibles. El decodificador TDT esta disenado para reducir pasos de decodificacion, pero no hay cifras publicadas en el repositorio.
- Almacenamiento: el repo ocupa 48,5 GB, por lo que conviene descargar solo los artefactos necesarios en lugar del snapshot completo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Code-switching en/he | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching | 617,9M | en, he | Si (objetivo declarado) | cc-by-4.0 | Gated en HuggingFace |
| nvidia/parakeet-tdt-0.6b-v2 (modelo base) | ~0,6B | en | No | no disponible en la informacion proporcionada | HuggingFace |
| OpenAI Whisper large-v3 | ~1,55B (dato publico del modelo) | Multilingue (incluye he) | Parcial, no especifico | MIT (dato publico del modelo) | Abierto |
| NVIDIA Canary-1B | ~1B (dato publico del modelo) | Multilingue (en, de, fr, es) | No cubre hebreo | CC-BY-NC-4.0 (dato publico del modelo) | Abierto |

Nota: los datos de los modelos alternativos no provienen de la informacion proporcionada para este repositorio y deben verificarse en sus fichas oficiales. No se dispone de comparaciones de WER entre estas opciones en la informacion disponible, por lo que la eleccion no puede basarse en rendimiento documentado.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace; la automatizacion de descargas necesita un token con permisos y el consentimiento previo de la cuenta.
- Cobertura limitada a dos idiomas: fuera de ingles y hebreo el comportamiento no esta documentado ni respaldado; no debe asumirse transferencia a otros idiomas.
- Rendimiento real en code-switching no cuantificado: no hay cifras de WER publicadas, ni separadas por idioma, ni por tasa de alternancia, por lo que la calidad es desconocida hasta validarla con audio propio.
- Riesgo de alucinacion y sustitucion en ASR: en audio con ruido, solapamiento de hablantes, acentos no vistos o nombres propios, los modelos transducer pueden producir sustituciones o repetir fragmentos; es necesario validar con un conjunto de prueba representativo antes de usarlo en produccion.
- Sesgo de dominio y de hablante: los datasets de ajuste (lectura de frases, frases mixtas y LibriSpeech) son de dominio acotado y en gran medida de habla leida; el rendimiento puede degradarse en habla espontanea, telefonica o con ruido de fondo. La adaptacion a hablante puede sobreajustar a las voces del conjunto de entrenamiento.
- Sin datos sobre diarizacion, puntuacion ni marcas de tiempo: si el caso de uso los requiere hay que anadirlos en una capa posterior.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar autor y obra y conservar el aviso de licencia. Conviene revisar tambien las condiciones del modelo base de NVIDIA, que pueden imponer requisitos adicionales.
- Procedencia de los datos: no se documenta la cadencia de los conjuntos de habla utilizados (consentimiento de hablantes, origen de las grabaciones); en un despliegue en produccion esto puede ser relevante en terminos de cumplimiento (GDPR si se procesan voces de la UE).
- Repositorio de 48,5 GB: el snapshot completo incluye artefactos redundantes; descargarlo entero es costoso e innecesario para servir el modelo.
- Fechas de creacion y actualizacion en 2026: coherente con el calendario del repositorio, pero conviene comprobar la version vigente antes de fijar una dependencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- DOI del repositorio: https://doi.org/10.57967/hf/10995
- Dataset de adaptacion de voz: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset de code-switching ingles-hebreo: https://huggingface.co/datasets/danielrosehill/English-Hebrew-Codeswitching-Sentences
- Dataset de frases mixtas ingles-hebreo: https://huggingface.co/datasets/Hebrish/English-Hebrew-Mixed-Sentences
- Dataset de ingles (LibriSpeech ASR): https://huggingface.co/datasets/openslr/librispeech_asr

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente contenido no relacionado), por lo que no se incluyen enlaces adicionales a papers, blogs o demos.
