# Izahat2/chatterbox-nano-AZ-v2

## Resumen

Chatterbox Nano AZ V2 es un modelo de síntesis de voz (text-to-speech) especializado en azerí e inglés, desarrollado por el usuario Izahat2 sobre la base de ResembleAI/chatterbox-nano. Se trata de un ajuste fino (finetune) del modelo Chatterbox Nano original al que se le ha incorporado vocabulario ampliado para el azerí y se le ha fusionado un adaptador LoRA en el modelo exportado. El modelo resuelve la generación de habla natural en azerí, un idioma con escasa representación en herramientas TTS de código abierto, manteniendo además capacidad en inglés.

La versión V2 se centra en mejorar la consistencia de las expresiones emocionales y los efectos vocales respecto a la versión anterior (Chatterbox Nano AZ), e incorpora clonación de voz junto con etiquetas paralingüísticas heredadas del modelo Nano original. El repositorio ocupa 2,8 GB e incluye el tokenizador ampliado utilizado durante el ajuste fino.

Es relevante para desarrolladores que necesiten TTS en azerí con control expresivo mediante etiquetas en el texto, bajo licencia MIT y con la posibilidad de clonar voces a partir de una grabación de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en Chatterbox Nano; detalles internos no especificados en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | azerí (az), inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 2,8 GB; la model card no detalla formatos) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Chatterbox Nano AZ, que a su vez deriva de ResembleAI/chatterbox-nano. El autor indica que el adaptador LoRA utilizado durante el entrenamiento se ha fusionado en el modelo exportado y que el repositorio incluye el vocabulario ampliado del tokenizador empleado en el ajuste fino. La V2 continúa el entrenamiento de la versión anterior con el objetivo de hacer más consistentes las expresiones emocionales y los efectos vocales.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna (transformer, difusión, etc.) más allá de su pertenencia a la familia Chatterbox Nano.

## Capacidades

- Síntesis de voz (text-to-speech) en azerí e inglés.
- Clonación de voz a partir de una grabación de referencia y su texto.
- Control expresivo mediante etiquetas paralingüísticas insertadas en el texto de entrada:
  - Emoción y entrega: `[angry]`, `[fear]`, `[surprised]`, `[whispering]`, `[advertisement]`, `[dramatic]`, `[narration]`, `[crying]`, `[happy]`, `[sarcastic]`.
  - Efectos vocales: `[clear throat]`, `[sigh]`, `[shush]`, `[cough]`, `[groan]`, `[sniff]`, `[gasp]`, `[chuckle]`, `[laugh]`.
- Generación de habla con entonación y efectos no verbales insertados en la posición indicada del texto.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Audiolibros y narración en azerí: el modelo acepta la etiqueta `[narration]` y permite generar pasajes largos con una voz consistente mediante clonación a partir de una referencia, lo que resulta adecuado para contenido editorial en un idioma con pocos recursos TTS.
- Asistentes de voz para atención al cliente en azerí: la clonación de voz permite mantener una identidad de marca concreta y las etiquetas de emoción (`[happy]`, `[sarcastic]`) aportan naturalidad en conversaciones de soporte.
- Doblaje y localización de contenido: la combinación de clonación de voz y control de entrega (`[dramatic]`, `[whispering]`) permite adaptar guiones al azerí manteniendo el timbre del locutor original de referencia.
- Generación de contenido para redes y publicidad: la etiqueta `[advertisement]` y los efectos vocales permiten producir locuciones promocionales expresivas sin estudio de grabación.
- Accesibilidad y lectura de textos: síntesis de documentos o interfaces en azerí para usuarios con discapacidad visual, con posibilidad de ajustar el tono mediante etiquetas.
- Prototipado de videojuegos y personajes: las etiquetas de risa (`[chuckle]`, `[laugh]`), suspiro (`[sigh]`) y queja (`[groan]`) permiten dotar de expresividad a diálogos de personajes no jugadores sin grabaciones adicionales.
- Investigación en TTS de bajos recursos: como punto de partida para experimentos de ajuste fino en azerí, dado que el repositorio incluye el tokenizador ampliado y licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 2,8 GB, lo que sugiere que el modelo puede cargarse en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (2,8 GB) es compatible con GPUs de consumo habituales, pero el autor no lo especifica.
- Opciones de despliegue: la librería indicada es `chatterbox`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idiomas | Clonación de voz | Etiquetas paralingüísticas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chatterbox Nano AZ V2 | az, en | Sí | Sí | MIT | Hugging Face |
| Chatterbox Nano AZ (versión previa) | az, en | Sí (heredado) | Sí (heredado) | MIT (según modelo base) | Hugging Face |
| ResembleAI/chatterbox-nano | no disponible | Sí | Sí (origen de las etiquetas) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede no producir de forma consistente todos los efectos solicitados, especialmente en azerí.
- Los resultados pueden variar según el idioma, la voz y la etiqueta empleada.
- No se documentan sesgos conocidos ni tasas de alucinación (en TTS, errores de pronunciación o prosodia); no disponible.
- Solo se soportan dos idiomas (azerí e inglés); no hay soporte multilingüe amplio.
- La licencia es MIT, lo que permite uso comercial, pero se recomienda verificar las condiciones del modelo base ResembleAI/chatterbox-nano.
- Algunos ejemplos de audio de la model card se generaron durante el entrenamiento ("training sample") y no con la exportación final, por lo que pueden no reflejar el comportamiento definitivo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- No se especifican requisitos de hardware ni latencia, lo que dificulta planificar despliegues en producción.
- La clonación de voz plantea riesgos de uso indebido (suplantación); no se documentan mecanismos de mitigación en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2
- Modelo base (versión previa): https://huggingface.co/Izahat2/chatterbox-nano-AZ
- Modelo original: https://huggingface.co/ResembleAI/chatterbox-nano
- Ejemplos de audio:
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/v2_az_cough.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/v2_az_clear_throat.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/v2_az_chuckle.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/english_cough.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/v2_az_angry.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/azerbaijani_cough.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/v2_az_groan.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/v2_az_shush.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/v2_az_sigh.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/voice_reference.wav
  - https://huggingface.co/Izahat2/chatterbox-nano-AZ-v2/resolve/main/samples/voice_generated.wav
