# femustafa/voicedictation-models

## Resumen

El modelo `femustafa/voicedictation-models` es una conversión al formato GGML (whisper.cpp) del checkpoint `cheetos18/whisper-small-roman-urdu`, un fine-tune del modelo Whisper small orientado al reconocimiento de voz en roman-urdu (urdu transcrito en alfabeto latino). El autor, Faizan E Mustafa, lo ha publicado para alimentar la aplicación Android VoiceDictation, que realiza dictado en el dispositivo sin conexión. El repositorio contiene dos archivos: una versión cuantizada en q4_0 (~139 MB) y otra en f16 (~466 MB), ambas listas para ser consumidas por whisper.cpp. Su relevancia radica en ofrecer una solución ligera y de código abierto para un idioma poco representado en los modelos ASR comerciales, con licencia MIT que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | no disponible (modelo small de Whisper) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper) |
| Tipos de cuantizacion | q4_0, f16 |
| Idiomas soportados | ur, en |
| Licencia | MIT |
| Formato de pesos | GGML (.bin) para whisper.cpp |

## Arquitectura y entrenamiento

El modelo base es Whisper small, un transformer encoder-decoder entrenado por OpenAI para reconocimiento de voz multilingue. El checkpoint original de `cheetos18/whisper-small-roman-urdu` es un fine-tune especifico para roman-urdu, es decir, urdu escrito con caracteres latinos. La conversion a GGML se realizo con el script `convert-h5-to-ggml.py` de whisper.cpp, y la cuantizacion q4_0 con `whisper-quantize`. No se proporcionan detalles sobre el dataset de entrenamiento ni el proceso de fine-tuning (numero de horas, composicion, etc.). El modelo conserva el vocabulario original de Whisper (n_vocab 51865) y es multilingue, aunque su especializacion es el roman-urdu.

## Capacidades

- Transcripcion de audio a texto en roman-urdu (escritura latina) y en ingles.
- Deteccion automatica de idioma mediante `-l auto`; forzar el idioma urdu (`-l ur`) produce salida en escritura urdu nativa, por lo que se recomienda siempre la auto-deteccion.
- Ejecucion en dispositivo (on-device) gracias al formato GGML y al tamaño reducido del modelo.
- Compatible con whisper.cpp, lo que permite su uso en aplicaciones de escritorio, servidores y moviles.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- Dictado de mensajes en roman-urdu en aplicaciones de mensajeria: el usuario habla y la app transcribe directamente al campo de texto, sin necesidad de conexion a internet.
- Transcripcion de reuniones o entrevistas en roman-urdu: se puede procesar audio grabado con whisper.cpp en un ordenador de bajos recursos, obteniendo texto en latino.
- Subtitulado de videos en roman-urdu: el modelo genera transcripciones que pueden sincronizarse con herramientas de subtitulos.
- Asistentes de voz para comunidades urdu-parlantes que usan escritura latina en redes sociales: permite convertir voz en texto para busquedas o comandos.
- Creacion de corpus de texto a partir de audio en roman-urdu: util para investigacion linguistica o entrenamiento de otros modelos.
- Integracion en aplicaciones Android de dictado: el repositorio esta disenado para que la app VoiceDictation descargue el modelo en tiempo de ejecucion y realice la transcripcion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como WER (Word Error Rate) ni comparaciones con otros modelos ASR para roman-urdu.

## Requisitos de hardware

- El modelo es pequeno: el archivo q4_0 pesa ~139 MB y el f16 ~466 MB, por lo que puede ejecutarse en CPU sin necesidad de GPU.
- Adecuado para dispositivos moviles Android (la app VoiceDictation lo usa) y para ordenadores de gama baja.
- No se especifican requisitos de VRAM; al ser un modelo de audio, la inferencia se realiza tipicamente en CPU con whisper.cpp.
- Opciones de despliegue: whisper.cpp (linea de comandos o integrado en aplicaciones), tambien compatible con bindings de Python y otros lenguajes.
- La latencia dependera del hardware; en un movil moderno, la transcripcion de un clip corto (unos segundos) suele ser casi en tiempo real, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR para roman-urdu. Como referencia, el modelo base Whisper small de OpenAI soporta muchos idiomas, pero no esta especializado en roman-urdu; el fine-tune de `cheetos18` mejora la precision en ese dominio, aunque no hay metricas publicas que lo cuantifiquen. Otras alternativas como Whisper base o large podrian usarse, pero con mayor coste computacional o menor precision en el idioma especifico.

## Limitaciones y advertencias

- Si se fuerza el idioma urdu (`-l ur`), el modelo produce transcripcion en escritura urdu nativa, no en roman-urdu. Es imprescindible usar auto-deteccion (`-l auto`) para obtener salida en alfabeto latino.
- El modelo puede tener errores en acentos, ruido de fondo o habla rapida, como es comun en los sistemas ASR.
- No se han documentado sesgos especificos, pero al ser un fine-tune de Whisper, puede heredar sesgos del modelo base.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias.
- No se proporcionan datos sobre el dataset de entrenamiento, por lo que no se puede evaluar la cobertura de variantes dialectales del urdu.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/femustafa/voicedictation-models
- Repositorio upstream (checkpoint Transformers): https://huggingface.co/cheetos18/whisper-small-roman-urdu
- Repositorio de la app VoiceDictation (GitHub): https://github.com/femustafa/learning_ws
- Proyecto whisper.cpp: https://github.com/ggerganov/whisper.cpp
