# lch7654/malkkeum-models

## Resumen

Malkkeum models es un repositorio de modelos ONNX publicado por el usuario lch7654 en Hugging Face, que contiene las conversiones a formato ONNX de dos modelos de audio utilizados por el editor de lectura coreano "Malkkeum Editor" (말끔 편집기). No se trata de un modelo de lenguaje, sino de un paquete de utilidades de audio: un modelo wav2vec2 para alineamiento forzado CTC en coreano y un modelo Audio Spectrogram Transformer (AST) para distinguir sonidos como tos y respiración.

El primer modelo, `senior_fp32.onnx`, es una conversión de [hyyoka/wav2vec2-xlsr-korean-senior](https://huggingface.co/hyyoka/wav2vec2-xlsr-korean-senior), un wav2vec2 fine-tuned para reconocimiento de voz en coreano mediante CTC. El segundo, `ast_audioset.onnx`, procede de [MIT/ast-finetuned-audioset-10-10-0.4593](https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593), un clasificador de eventos de audio entrenado sobre AudioSet.

Su relevancia es principalmente práctica: permite ejecutar ambos modelos con ONNX Runtime sin depender de PyTorch, lo que simplifica el despliegue en aplicaciones de escritorio (en este caso, un editor de lectura para Windows). El repositorio pesa 1,6 GB y los pesos no se han modificado, solo convertidos de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CTC) + Audio Spectrogram Transformer (AST) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 |
| Idiomas soportados | coreano (wav2vec2); clasificacion de eventos de audio (AST) |
| Licencia | mixed-apache-2.0-bsd-3-clause (Apache-2.0 para wav2vec2, BSD-3-Clause para AST) |
| Formato de pesos | ONNX (fp32), con ficheros .json de etiquetas y vocabulario |

## Arquitectura y entrenamiento

El paquete combina dos arquitecturas distintas. La primera es wav2vec2-XLSR, un transformer auto-supervisado para audio crudo que, tras el fine-tuning, emite transcripciones por CTC (Connectionist Temporal Classification). En este caso se usa para alineamiento forzado: dado un texto y su audio, determinar qué fragmento de audio corresponde a cada carácter, una función habitual en editores de lectura y subtitulado. La segunda es el Audio Spectrogram Transformer (AST) de MIT, que trata el espectrograma de audio como una secuencia de parches y lo procesa con un transformer estándar de visión; está fine-tuned sobre AudioSet (10 segundos, 10 clases según la convención del nombre del modelo) y aquí se emplea para distinguir eventos como tos o respiración frente a voz.

El autor del repositorio no ha entrenado ningún modelo: la conversión a ONNX conserva los pesos originales sin cambios, y los ficheros `.json` adjuntos contienen la lista de caracteres (vocabulario CTC) y las etiquetas de clasificación. No hay información sobre datos de entrenamiento adicionales, RLHF ni técnicas de decodificación especiales; para esos detalles hay que remitirse a las model cards de los modelos originales.

## Capacidades

- Alineamiento forzado CTC en coreano: mapear caracteres de una transcripcion a sus posiciones temporales en el audio.
- Reconocimiento de voz en coreano como base del alineamiento (modelo wav2vec2 fine-tuned, aparentemente orientado a voz de personas mayores segun el nombre del modelo original).
- Clasificacion de eventos de audio: distinguir voz de sonidos como tos o respiracion mediante el AST fine-tuned sobre AudioSet.
- Ejecucion sin PyTorch: ambos modelos funcionan exclusivamente con ONNX Runtime, lo que reduce dependencias y facilita la distribucion en aplicaciones de escritorio.
- Metadatos listos para usar: los ficheros .json incluyen vocabulario de caracteres y listas de etiquetas.

## Casos de uso

- Editores de lectura y narracion asistida: el alineamiento forzado permite resaltar en pantalla la palabra que se esta reproduciendo, funcion central del editor Malkkeum para Windows.
- Subtitulado y karaoke: el mismo alineamiento CTC sirve para sincronizar subtitulos o letras con el audio en coreano sin transcripcion manual de tiempos.
- Limpieza de grabaciones de voz: el clasificador AST puede detectar tos, respiraciones u otros eventos no verbales para marcarlos, recortarlos o excluirlos en postproduccion de audio.
- Preparacion de datasets de voz en coreano: alineamiento automatico de corpus de audio-texto para entrenar o evaluar modelos TTS y ASR.
- Analisis de audio clinico o de bienestar: deteccion de tos y patrones de respiracion en grabaciones, como paso previo a sistemas de monitorizacion (siempre con las cautelas propias de uso medico).
- Despliegue ligero en escritorio: integracion en aplicaciones .NET, C++ o Python mediante ONNX Runtime sin instalar PyTorch, util para software distribuido a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para metricas de los modelos originales (WER del wav2vec2 coreano o mAP del AST sobre AudioSet), consultar las model cards de los modelos fuente enlazadas abajo; el autor indica que los pesos son identicos a los originales, por lo que el rendimiento deberia coincidir salvo por diferencias menores de la conversion a ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser modelos de audio en fp32 y ejecutarse con ONNX Runtime, es probable que funcionen en CPU, pero no hay datos publicados.
- GPU recomendadas: no disponible; el caso de uso original (editor de escritorio Windows) sugiere inferencia en CPU.
- Consumer GPU: no disponible; no hay requisitos publicados, aunque el tamano total del repo (1,6 GB para ambos modelos) indica modelos de tamano moderado.
- Opciones de despliegue: ONNX Runtime (uso previsto por el autor); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de audio de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Formato | Licencia |
|---|---|---|---|---|
| lch7654/malkkeum-models | wav2vec2 + AST | Alineamiento CTC coreano + clasificacion de audio | ONNX fp32 | Apache-2.0 / BSD-3-Clause (mixta) |
| hyyoka/wav2vec2-xlsr-korean-senior (original) | wav2vec2-XLSR | ASR / alineamiento coreano | PyTorch (safetensors) | Apache-2.0 |
| MIT/ast-finetuned-audioset-10-10-0.4593 (original) | AST | Clasificacion de eventos de audio | PyTorch (safetensors) | BSD-3-Clause |

La unica diferencia entre este repositorio y los modelos originales es el formato (ONNX frente a PyTorch); no existen alternativas directas publicadas por el autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; es un paquete de modelos de audio (alineamiento y clasificacion de eventos).
- Alcance linguistico limitado: el componente wav2vec2 esta orientado a coreano; no sirve para alineamiento en espanol u otros idiomas.
- El clasificador AST hereda las clases y limitaciones de AudioSet, un dataset generalista; su fiabilidad en dominios especificos (por ejemplo, audio clinico) no esta verificada aqui.
- Riesgo de alucinacion: no aplica como tal, pero el CTC puede producir alineamientos erroneos con audio ruidoso, acentos no cubiertos o voz de hablantes no representados en el entrenamiento.
- Licencia mixta: el paquete combina Apache-2.0 y BSD-3-Clause; hay que respetar ambos terminos y los avisos de copyright de los modelos originales. Ambas permiten uso comercial, pero conviene revisar las condiciones de cada componente.
- Repositorio con practicamente ninguna traccion (0 descargas, 1 like) y sin documentacion extensa: conviene validar el comportamiento de la conversion ONNX frente a los originales antes de usarlo en produccion.
- Los ficheros .json adjuntos (vocabulario y etiquetas) son imprescindibles para interpretar las salidas; no incluirlos en el despliegue hara los modelos inutilizables.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lch7654/malkkeum-models
- Modelo original wav2vec2 coreano: https://huggingface.co/hyyoka/wav2vec2-xlsr-korean-senior
- Modelo original AST (AudioSet): https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Paper de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Paper de AST (Audio Spectrogram Transformer): https://arxiv.org/abs/2104.01778
- Dataset AudioSet: https://research.google.com/audioset/
- ONNX Runtime: https://onnxruntime.ai/
