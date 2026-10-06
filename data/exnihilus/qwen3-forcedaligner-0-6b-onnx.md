# ExNihilus/Qwen3-ForcedAligner-0.6B-ONNX

## Resumen

Qwen3-ForcedAligner-0.6B-ONNX es una conversion al formato ONNX del modelo Qwen/Qwen3-ForcedAligner-0.6B, un alineador forzado de audio y texto de aproximadamente 0,6 mil millones de parametros perteneciente a la familia Qwen3-ASR desarrollada por Alibaba Qwen. La conversion original fue realizada por el usuario tonythethompson, y el repositorio analizado (ExNihilus/Qwen3-ForcedAligner-0.6B-ONNX) es un espejo sin modificaciones de una revision fija de esa conversion, publicado para que el plugin de Unity SubVox Pro pueda descargar una version estable y anclada del modelo.

El modelo resuelve un problema muy concreto: dado un audio y su transcripcion, determinar las marcas temporales exactas de cada palabra o segmento (forced alignment). Esto es la base tecnica de la sincronizacion de subtitulos, el doblaje, el karaoke con resaltado palabra a palabra y la anotacion de corpus de voz. Al estar en formato ONNX y cuantizado a 4 bits, esta variante esta pensada para inferencia local ligera, integrable en aplicaciones de escritorio o en motores como Unity, con un consumo de VRAM que la pagina de referencia cifra en 2,1 GB en BF16 y 0,5 GB en INT4.

Su relevancia practica es doble: por un lado, traslada un modelo de la familia Qwen3-ASR a un runtime portable (ONNX), lo que elimina la dependencia de Python y de GPUs de gama alta; por otro, sirve como ejemplo de distribucion de pesos anclados a una revision concreta para garantizar reproducibilidad en aplicaciones que no pueden permitirse cambios silenciosos del modelo. Se trata de un espejo con muy poca traccion en HuggingFace (17 descargas y 0 likes en el momento de la consulta), por lo que su validacion comunitaria es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3-ASR, construida sobre Qwen3-Omni; la model card no detalla el componente acustico) |
| Parametros totales | aproximadamente 0,6 mil millones (segun la nomenclatura del modelo) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (archivo `onnx/model_q4.onnx`); la referencia externa aquanode.io cita BF16 e INT4 como escenarios de despliegue |
| Idiomas soportados | no disponible para este modelo concreto; la familia Qwen3-ASR declara soporte de identificacion de idioma y ASR para 52 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`), con tokenizador en JSON (`vocab.json`, `merges.txt`, `tokenizer_config.json`, `special_tokens_map.json`, `added_tokens.json`) y `preprocessor_config.json` |
| Modelo base | Qwen/Qwen3-ForcedAligner-0.6B |
| Repositorio de origen | tonythethompson/Qwen3-ForcedAligner-0.6B-ONNX, revision `dfae9e3dfb8a00410d8771158fafb01bac3fe2a5` |
| Tamano del repositorio | 1,0 GB |
| Fecha de creacion | 2026-10-06 |

## Arquitectura y entrenamiento

La model card de este repositorio no incluye informacion sobre arquitectura, datos de entrenamiento ni proceso de ajuste, ya que se limita a declarar que es una copia sin modificar de una seleccion de archivos de la conversion de tonythethompson. El unico dato arquitectonico disponible proviene de la documentacion de la familia: Qwen3-ASR incluye los modelos Qwen3-ASR-1.7B y Qwen3-ASR-0.6B, ambos apoyados en datos de voz a gran escala y en la capacidad de comprension de audio de Qwen3-Omni. La version de 1.7B se describe como estado del arte entre los modelos ASR de codigo abierto, aunque esa afirmacion corresponde al modelo de reconocimiento, no necesariamente al alineador forzado.

El proceso de conversion a ONNX si es parcialmente trazable: el repositorio solo publica un grafo cuantizado a 4 bits junto con los ficheros de configuracion y de tokenizacion necesarios para ejecutarlo. No se documentan la estrategia de cuantizacion (calibracion, granularidad por canal o por tensor), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se describen innovaciones tecnicas propias del alineador, como decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Alineacion forzada de audio y texto: genera marcas temporales para palabras o segmentos a partir de un audio y su transcripcion.
- Base de reconocimiento de voz: al derivar de la familia Qwen3-ASR, el modelo subyacente maneja tareas de transcripcion e identificacion de idioma, aunque la model card de este repositorio no confirma que esas capacidades esten expuestas en el grafo ONNX publicado.
- Ejecucion portable: al estar en ONNX, puede ejecutarse en runtimes nativos sin depender del ecosistema Python, lo que permite su integracion en aplicaciones de escritorio, plugins de motor grafico y servicios embebidos.
- Inferencia ligera: el peso cuantizado a 4 bits permite funcionar en equipos sin GPU dedicada de gama alta o directamente en CPU.
- Reproducibilidad por anclaje de revision: el repositorio fija una revision concreta del modelo de origen, lo que garantiza que los resultados no cambien entre despliegues.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es la funcion de este modelo).
- Capacidades multilingues: no disponibles para este modelo concreto; la familia Qwen3-ASR declara 52 idiomas y dialectos.
- Capacidades especiales (modo thinking, vision, audio): componente de audio implicito por su naturaleza de alineador; vision, thinking y audio generativo no disponibles.

## Casos de uso

- Sincronizacion de subtitulos en produccion audiovisual: dado un video con su transcripcion, el modelo devuelve los tiempos de entrada y salida de cada palabra, lo que permite generar ficheros de subtitulos con precision sub-segundo sin revisarlos manualmente uno por uno.
- Doblaje y lip-sync: en flujos de localizacion, las marcas temporales permiten ajustar la duracion de cada frase doblada a la duracion del audio original, reduciendo el trabajo de ajuste manual en salas de doblaje.
- Subtitulos tipo karaoke: el alineado a nivel de palabra habilita el resaltado progresivo del texto en aplicaciones de karaoke o en reproductores con transcripcion sincronizada.
- Integracion en herramientas de edicion dentro de Unity: es el caso de uso explicito del repositorio, ya que el plugin SubVox Pro descarga esta version anclada para alinear voz y texto dentro del editor sin salir del motor ni depender de servicios en la nube.
- Anotacion de corpus para investigacion fonetica y linguistica: los investigadores pueden obtener alineaciones automaticas sobre horas de audio y revisar solo los segmentos con baja confianza, reduciendo el coste de anotacion manual.
- Control de calidad de transcripciones ASR: al alinear la hipotesis de un sistema de reconocimiento contra el audio, los desajustes temporales o los saltos de segmento revelan errores de transcripcion que de otro modo pasarian desapercibidos.
- Preparacion de datos para entrenar modelos TTS: las marcas temporales por palabra o fonema son un requisito habitual para construir datasets de sintesis de voz alineados.
- Indexacion y busqueda por fragmentos de audio: con las marcas temporales se pueden construir indices que devuelvan el instante exacto en el que se pronuncia un termino dentro de un archivo largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio no incluye metricas de error de alineacion (por ejemplo, desviacion media en milisegundos ni tasas de acierto por umbral), y los resultados de busqueda solo mencionan que el modelo de 1.7B de la misma familia alcanza un rendimiento destacado entre los sistemas ASR de codigo abierto, sin cifras concretas ni datos referidos al alineador forzado de 0,6B.

## Requisitos de hardware

- VRAM estimada: 2,1 GB en BF16 y 0,5 GB en INT4, segun la referencia externa aquanode.io para Qwen/Qwen3-ForcedAligner-0.6B. El archivo publicado en este repositorio ya esta cuantizado a 4 bits, por lo que el escenario realista de consumo es el de INT4.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por el rango de memoria, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos anos (por ejemplo, series GTX 10xx en adelante, RTX 20xx/30xx/40xx) e incluso en GPUs integradas con memoria compartida.
- Ejecucion en CPU: viable dado el tamano cuantizado; no se dispone de cifras de latencia para confirmar el rendimiento en CPU.
- Opciones de despliegue: ONNX Runtime en cualquiera de sus variantes (CPU, CUDA, DirectML, TensorRT); dentro del ecosistema Unity, motores de inferencia ONNX como Sentis o Barracuda. No se publican pesos en GGUF, por lo que llama.cpp y Ollama no son aplicables directamente a este repositorio. vLLM y TGI no estan orientados a este tipo de modelo y no se documentan como soportados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| ExNihilus/Qwen3-ForcedAligner-0.6B-ONNX | ~0,6B | no disponible | ONNX q4 | Apache 2.0 | 17 descargas, 0 likes | Espejo anclado a una revision, mantenido para el plugin SubVox Pro |
| tonythethompson/Qwen3-ForcedAligner-0.6B-ONNX | ~0,6B | no disponible | ONNX q4 | Apache 2.0 | no disponible | Conversion original de la que procede este repositorio |
| Qwen/Qwen3-ForcedAligner-0.6B | ~0,6B | no disponible | no disponible | Apache 2.0 (segun el modelo base declarado) | no disponible | Modelo original de Alibaba Qwen |
| Qwen/Qwen3-ASR-1.7B | ~1,7B | no disponible | no disponible | no disponible | no disponible | Mismo familia, orientado a reconocimiento de voz; se describe como estado del arte entre los ASR abiertos |

No se dispone de datos de rendimiento comparativos entre estas variantes, ni de comparaciones con herramientas clasicas de alineacion forzada (Montreal Forced Aligner, WhisperX u otras), por lo que cualquier afirmacion sobre cual alinea mejor careceria de respaldo en la informacion disponible.

## Limitaciones y advertencias

- Es un espejo no oficial: no lo mantiene el equipo de Qwen ni el autor de la conversion original, sino el desarrollador del plugin SubVox Pro, y no ha sido modificado respecto de la revision citada.
- Validacion practicamente nula: 17 descargas y 0 likes implican ausencia de evidencia de la comunidad sobre su comportamiento real en produccion.
- Solo se publica una parte del modelo original: el repositorio contiene un unico grafo ONNX cuantizado a 4 bits, no pesos completos en precision alta ni variantes GGUF, safetensors o FP16.
- La cuantizacion a 4 bits puede degradar la precision de las marcas temporales en comparacion con el modelo sin cuantizar; no se han publicado mediciones de esa perdida.
- Riesgo de alucinacion y de errores de transcripcion: al derivar de un modelo de la familia ASR, el audio con ruido, solapamiento de voces, musica de fondo o acentos poco representados puede producir alineaciones incorrectas o segmentos mal delimitados.
- Cobertura de idiomas no confirmada para este modelo: los 52 idiomas y dialectos corresponden a la familia Qwen3-ASR, no a una declaracion especifica de la model card de este repositorio.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo por idioma, acento, genero o procedencia del hablante.
- Longitud de contexto: no disponible, lo que impide estimar a priori la duracion maxima de audio que puede procesarse en una sola pasada.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserven los avisos de licencia y atribucion. Al ser una copia, no se anaden restricciones adicionales.
- Caveat de integracion: el repositorio existe para fijar una version concreta para SubVox Pro; usarlo en otros proyectos exige comprobar que los ficheros de configuracion y tokenizacion incluidos encajan con el runtime ONNX elegido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ExNihilus/Qwen3-ForcedAligner-0.6B-ONNX
- Conversion original: https://huggingface.co/tonythethompson/Qwen3-ForcedAligner-0.6B-ONNX
- Revision anclada de la conversion original: https://huggingface.co/tonythethompson/Qwen3-ForcedAligner-0.6B-ONNX/tree/dfae9e3dfb8a00410d8771158fafb01bac3fe2a5
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Documentacion de la familia Qwen3-ASR en GitHub: https://github.com/zhangxu1978/ASR/tree/master/Qwen3-ForcedAligner-0.6B
- Espejo adicional del modelo base: https://cnb.cool/ai-models/Qwen/Qwen3-ForcedAligner-0.6B
- Estimacion de requisitos de GPU: https://www.aquanode.io/tools/gpu-recommender/qwen/qwen3-forcedaligner-0.6b
