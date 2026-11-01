# KonradDallaOrg/dimmy-nemotron-3.5-asr-gguf

## Resumen

dimmy-nemotron-3.5-asr-gguf es un espejo no modificado de los ficheros del modelo Nemotron 3.5 ASR streaming 0.6B de NVIDIA, publicado por el usuario KonradDallaOrg para que la aplicacion Dimmy no dependa de que los repositorios originales sigan disponibles. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son byte a byte identicos a los del repositorio upstream en la revision `ea30d66debe3740a08b573244286791d423d6b3e`, salvo el fichero F32, que el propio autor convirtio con el script oficial de NVIDIA.

El modelo base es un sistema de reconocimiento automatico del habla (ASR) en streaming de 648.268.960 parametros (aproximadamente 0,6B), disenado para dictado en tiempo real y transcripcion de reuniones en vivo. Su interes practico radica en que combina un tamano reducido, apto para ejecucion local en CPU o GPU de gama media, con un modo de streaming que permite emitir transcripcion parcial mientras se recibe el audio, algo critico en aplicaciones de dictado interactivo.

Este repositorio concreto aporta los pesos en formato GGUF en dos cuantizaciones (Q8_0 y F32), lo que facilita su integracion en runtimes basados en llama.cpp y derivados. La licencia es OpenMDW-1.1, una licencia de pesos abiertos de NVIDIA que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de streaming; la model card no detalla la arquitectura interna) |
| Parametros totales | 648.268.960 (0,6B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y F32 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (Q8_0: 742.090.464 B; F32: 2.576.356.832 B) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base (tipo de encoder, mecanismo de atencion ni estrategia de streaming). Lo que si se sabe es que Nemotron 3.5 ASR streaming 0.6B es un modelo de reconocimiento de voz orientado a inferencia en streaming, es decir, capaz de procesar audio de forma incremental y producir hipotesis parciales antes de que termine el enunciado. El tamano de 648 millones de parametros lo situa en la franja de modelos ASR ligeros, pensados para ejecucion local.

No se han publicado en la informacion proporcionada datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. El repositorio es un espejo: el fichero Q8_0 es la conversion oficial de NVIDIA en la revision fijada, mientras que el F32 fue generado por Dimmy con el script `convert_model.py` de NVIDIA en modo F32. No hay modificaciones de pesos ni reentrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo streaming: transcripcion incremental de audio con emision de resultados parciales.
- Dictado en tiempo real: adecuado para entrada de texto por voz en aplicaciones de escritorio o moviles.
- Transcripcion de reuniones en vivo: pensado para generar actas o subtitulos mientras se desarrolla la conversacion.
- Ejecucion local: el formato GGUF y el tamano de 0,6B permiten inferencia en hardware de consumo.
- No se dispone de informacion sobre soporte de tool calling, agentes, vision, audio multilingue ni modos de razonamiento extendido; la model card no los menciona.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: el modelo puede integrarse en un cliente tipo Dimmy para convertir voz en texto en tiempo real, aprovechando el modo streaming para mostrar palabras a medida que se pronuncian y el formato GGUF para ejecucion local sin depender de la nube.
- Transcripcion de reuniones y videollamadas: con 0,6B de parametros y cuantizacion Q8_0 (unos 742 MB), puede ejecutarse en paralelo a la videollamada en un portatil moderno, generando subtitulos o un borrador de acta en vivo.
- Subtitulado accesible en directo: en eventos o clases presenciales, un pipeline de captura de audio mas este modelo puede producir subtitulos con baja latencia, sin enviar audio a servidores externos.
- Notas clinicas o de campo dictadas: en entornos con requisitos de privacidad, la inferencia local evita que el audio salga del dispositivo, algo relevante en sanidad o trabajo de campo.
- Integracion en asistentes de voz embebidos: por su tamano reducido, puede desplegarse en dispositivos de borde o mini-PC para comandos de voz y transcripcion de ordenes.
- Archivado y busqueda de audio: transcripcion por lotes de grabaciones para generar indices de texto searchable, usando la version F32 si se prioriza maxima fidelidad o Q8_0 si se prioriza velocidad y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q8_0 ocupa 742 MB, por lo que la inferencia cabe holgadamente en GPUs de 4 GB o incluso en CPU con suficiente RAM; el fichero F32 ocupa 2,57 GB y requiere al menos 3 GB de memoria libre.
- GPU recomendadas: no hay datos oficiales de NVIDIA en la informacion proporcionada; por tamano, cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.) deberia poder alojar la version Q8_0.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs consumer actuales con la cuantizacion Q8_0.
- Opciones de despliegue: al estar en formato GGUF, es compatible con runtimes basados en llama.cpp y sus derivados (Ollama, llama-cpp-python, entre otros). No se confirma soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparativas con otros modelos ASR, por lo que no es posible establecer una comparacion rigurosa con alternativas como Whisper u otros sistemas de reconocimiento de voz.

## Limitaciones y advertencias

- Es un espejo, no un modelo original: cualquier actualizacion o correccion de NVIDIA no se reflejara automaticamente en este repositorio.
- El fichero F32 no es un fichero oficial de NVIDIA; fue convertido por el autor del repositorio con el script de NVIDIA, por lo que su fidelidad depende de ese proceso de conversion.
- La model card indica que los repositorios upstream no incluyen fichero LICENSE/NOTICE en la revision fijada; la licencia OpenMDW-1.1 debe verificarse en el enlace oficial antes de su uso comercial.
- No hay informacion sobre idiomas soportados, sesgos, tasas de alucinacion o comportamiento en audio ruidoso; se recomienda evaluacion propia antes de produccion.
- El pipeline no esta declarado en HuggingFace, lo que puede complicar la integracion automatica en herramientas que dependen de ese metadato.
- El repositorio tiene un numero muy bajo de descargas (40) y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KonradDallaOrg/dimmy-nemotron-3.5-asr-gguf
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Revision fijada del modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/ea30d66debe3740a08b573244286791d423d6b3e
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
