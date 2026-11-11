# mtr1920/sherpa-onnx-whisper-tara-int8

## Resumen

`mtr1920/sherpa-onnx-whisper-tara-int8` es la exportacion a ONNX con cuantizacion int8 del modelo de reconocimiento automatico del habla Trelis/tara, un fine-tuning de Whisper Large v3 desarrollado por Trelis Research para transcripcion en hindi e ingles. El repositorio, publicado por el usuario mtr1920, no entrena ningun modelo nuevo: unicamente convierte los pesos originales al formato que consume el reconocedor Whisper de sherpa-onnx, una libreria de inferencia de k2-fsa orientada a despliegue local y sin conexion.

La relevancia de este artefacto es practica: permite ejecutar un modelo Whisper Large v3 afinado para hindi sobre CPU, sin GPU ni servicios en la nube, gracias a la cuantizacion dinamica int8 de las matrices del encoder y del decoder. El paquete incluye encoder, decoder con cache KV y tabla de tokens, ademas de un archivo comprimido con los tres elementos.

El modelo cubre dos idiomas (hindi en escritura devanagari e ingles), mantiene el limite de 30 segundos por fragmento propio de la arquitectura Whisper y no puede activar el modo mixto Hinglish del modelo original porque sherpa-onnx no permite inyectar el token `<|mixedcode|>`. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3), exportado a ONNX |
| Parametros totales | no disponible (el modelo base es Whisper Large v3; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por fragmento (limite estandar de Whisper) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de MatMul en encoder y decoder) |
| Idiomas soportados | hindi (hi), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`tara-encoder.int8.onnx`, `tara-decoder.int8.onnx`) mas tabla de tokens `tara-tokens.txt` |
| Tamano del repositorio | 2,8 GB |
| Frecuencia de muestreo de entrada | 16 kHz, mono, float32 |
| Vocabulario | 51.904 tokens (token `<|mixedcode|>` en la posicion 51.866) |
| Libreria de inferencia | sherpa-onnx |
| Modelo base | Trelis/tara (fine-tuning de Whisper Large v3) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Large v3: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI para transcripcion y traduccion multilingue. Trelis Research realizo un fine-tuning sobre ese checkpoint para mejorar el rendimiento en hindi e ingles, e introdujo un token de prompt especifico, `<|mixedcode|>`, pensado para transcribir palabras inglesas en alfabeto latino dentro de una frase en hindi (Hinglish). Los detalles de datos de entrenamiento, numero de tokens, composicion del corpus y uso de RLHF o DPO no se recogen en la informacion disponible de este repositorio; el autor remite a la model card de Trelis/tara.

La contribucion de este repositorio es exclusivamente de conversion. El checkpoint de Transformers se renombro al formato de openai-whisper conservando el vocabulario de 51.904 entradas, se exporto con el script `scripts/whisper/export-onnx.py` de sherpa-onnx usando el exportador TorchScript con opset 17, y despues se cuantizo a int8 con ONNX Runtime. El decoder se exporta con cache KV para acelerar la decodificacion autoregresiva. No hay innovaciones de arquitectura propias: el valor esta en el empaquetado para inferencia en CPU.

## Capacidades

- Transcripcion de voz a texto en hindi (devanagari) e ingles, con seleccion explicita de idioma o deteccion automatica mediante el parametro `language`.
- Ejecucion completamente offline sobre CPU, sin dependencia de GPU ni de servicios externos.
- Decodificacion con cache KV, lo que reduce el coste computacional por token generado en el decoder.
- Soporte de tareas de transcripcion (`task="transcribe"`); la traduccion no se documenta en este export.
- Integracion con sherpa-onnx en Python (`OfflineRecognizer.from_whisper`) y en Rust (crate `sherpa-onnx`, campo `OfflineModelConfig.whisper`).
- Entrada de audio a 16 kHz mono en float32; los fragmentos deben dividirse si superan los 30 segundos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No soporta el modo mixto Hinglish del modelo original, porque el token `<|mixedcode|>` no se puede inyectar a traves del decoder Whisper de sherpa-onnx.

## Casos de uso

- Subtitulado de video en hindi e ingles: el modelo transcribe fragmentos de hasta 30 segundos, por lo que encaja en un pipeline que segmenta el audio con deteccion de actividad vocal y genera subtitulos con marcas de tiempo, todo en local.
- Transcripcion de reuniones y notas de voz en entornos sin conectividad: al ejecutarse en CPU con sherpa-onnx, se puede desplegar en portatiles o servidores modestos sin GPU y sin enviar audio a terceros.
- Asistentes de voz para aplicaciones dirigidas a usuarios indios: la salida en devanagari permite alimentar sistemas de respuesta o indexacion de contenido en hindi.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones para construir indices de texto consultables, aprovechando el bajo coste de la inferencia int8 en CPU.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en contenido en hindi o ingles, con despliegue embebido.
- Procesamiento por lotes en servidores sin GPU: el formato ONNX int8 permite escalar horizontalmente con instancias CPU estandar, con un coste por hora inferior al de instancias con acelerador.
- Prototipado e investigacion en ASR para hindi: sirve como linea base reproducible en entornos academicos donde no hay acceso a GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la model card de Trelis/tara para los datos de evaluacion del modelo original, pero este repositorio no incluye mediciones propias de WER, latencia ni throughput tras la cuantizacion int8.

## Requisitos de hardware

- VRAM: no aplica en el caso principal, ya que el modelo esta pensado para inferencia en CPU. El repositorio ocupa 2,8 GB, lo que da una idea del espacio en disco necesario para los pesos int8.
- GPU: no se documentan requisitos de GPU. Al ser un grafo ONNX, podria ejecutarse con ONNX Runtime sobre GPU, pero el autor no proporciona configuracion ni cifras para ese escenario.
- CPU: es el destino previsto. Un Whisper Large v3 cuantizado a int8 requiere varios GB de RAM al cargar encoder y decoder; no se especifica la cifra exacta en la informacion disponible.
- Despliegue: sherpa-onnx en Python y Rust; el paquete `sherpa-onnx-whisper-tara-int8.tar.bz2` se descomprime en una carpeta con los tres archivos necesarios.
- Latencia y throughput: no disponibles. Dependeran del numero de nucleos de CPU y de la longitud del audio.
- Limitacion practica: sherpa-onnx detiene la decodificacion tras aproximadamente 6 tokens por segundo de audio, insuficiente para devanagari; el autor recomienda anadir silencio (2 a 3 veces la duracion del audio, hasta 30 segundos) para elevar ese limite en transcripciones largas en hindi.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| mtr1920/sherpa-onnx-whisper-tara-int8 | no disponible (base Whisper Large v3) | 30 s por fragmento | hi, en | Apache-2.0 | ONNX int8 |
| Trelis/tara (modelo base) | no disponible (base Whisper Large v3) | 30 s por fragmento | hi, en (con modo Hinglish) | Apache-2.0 | safetensors (Transformers) |
| openai/whisper-large-v3 | 1.550 millones (dato publico de OpenAI) | 30 s por fragmento | multilingue (99 idiomas) | Apache-2.0 | safetensors, GGUF, ONNX |
| Whisper small / medium (variantes ONNX) | 244 M / 769 M (datos publicos de OpenAI) | 30 s por fragmento | multilingue | Apache-2.0 | ONNX, GGUF |

La comparacion directa con Trelis/tara es la mas relevante: este repositorio ofrece el mismo modelo con un formato listo para CPU y sin el modo Hinglish. Frente a Whisper Large v3 original, la diferencia esta en el fine-tuning para hindi y en el empaquetado int8; frente a las variantes small y medium, el coste computacional es mayor pero la calidad esperada en hindi tambien. No hay datos de benchmarks en la informacion disponible para cuantificar esas diferencias.

## Limitaciones y advertencias

- No soporta el modo mixto Hinglish: el token `<|mixedcode|>` del modelo original no se puede inyectar en el decoder de sherpa-onnx, por lo que las palabras inglesas dentro de frases en hindi se transcriben en devanagari o se pierden.
- Los audios de mas de 30 segundos deben dividirse en fragmentos, como en cualquier Whisper.
- La decodificacion en sherpa-onnx se corta tras unos 6 tokens por segundo de audio, lo que puede truncar transcripciones en hindi; el parche de anadir silencio es un workaround, no una solucion definitiva.
- La cuantizacion int8 puede degradar ligeramente la precision respecto al checkpoint original en float; no se han publicado mediciones de esa perdida.
- Es un modelo exclusivamente ASR: no genera texto libre, no razona, no ejecuta codigo ni soporta tool calling.
- Riesgo de alucinacion propio de Whisper: en audio con ruido, silencios largos o habla no cubierta por el entrenamiento puede generar texto inventado o repetir frases.
- Sesgos: no se documentan analisis de sesgo linguistico, de genero ni de variedades dialectales del hindi; el fine-tuning puede favorecer el hindi estandar.
- Licencia Apache-2.0, que permite uso comercial, pero el autor declara no estar afiliado ni respaldado por Trelis Research; conviene revisar la model card original para condiciones adicionales.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion ni de mantenimiento.
- La fecha de creacion indicada (2026-11-11) es posterior a la fecha actual del analisis, lo que sugiere un posible error en los metadatos de la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mtr1920/sherpa-onnx-whisper-tara-int8
- Modelo base Trelis/tara: https://huggingface.co/Trelis/tara
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Script de exportacion a ONNX: https://github.com/k2-fsa/sherpa-onnx/blob/master/scripts/whisper/export-onnx.py
