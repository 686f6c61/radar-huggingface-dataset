# Sarkaar07/bells-clipper-captions

## Resumen

`Sarkaar07/bells-clipper-captions` es un artefacto derivado del modelo de reconocimiento automatico del habla (ASR) `Oriserve/Whisper-Hindi2Hinglish-Prime`, convertido al formato `ggml` de whisper.cpp y cuantizado a 5 bits. No se trata de un modelo entrenado desde cero, sino de una redistribucion del checkpoint original de Oriserve bajo licencia Apache-2.0, con el unico cambio del cambio de formato y la cuantizacion. El autor del repositorio es Sarkaar07.

El modelo base es un fine-tune de la familia Whisper de OpenAI especializado en habla hinglish (code-switching hindi-ingles), una variante linguistica muy extendida en India y en comunidades de la diaspora. La relevancia del artefacto es practica: al estar en formato `ggml` cuantizado a q5_0, permite ejecutar ASR de hinglish en CPU y en hardware modesto mediante whisper.cpp, sin necesidad de GPU ni de frameworks de deep learning pesados.

El repositorio ocupa 1,1 GB, de los cuales el binario principal `ggml-hinglish-prime-q5_0.bin` son 1.081.140.203 bytes. La model card es minima y no aporta informacion sobre arquitectura interna, datos de entrenamiento ni evaluacion. A fecha de creacion del repositorio (2026-10-27) no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder), segun el modelo base; no se detalla la variante exacta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | q5_0 (5 bits) en formato ggml |
| Idiomas soportados | hinglish (hindi-ingles); la model card indica `-l en` en el ejemplo de uso |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml (`ggml-hinglish-prime-q5_0.bin`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper del checkpoint `Oriserve/Whisper-Hindi2Hinglish-Prime`, un transformer encoder-decoder con atencion completa orientado a transcripcion de audio. La model card del artefacto no especifica el tamano concreto del checkpoint base (tiny, base, small, medium o large), aunque el tamano del binario cuantizado a 5 bits (aproximadamente 1 GB) es coherente con una variante de tamano medio-grande. No se dispone de informacion sobre el numero de parametros exactos.

En cuanto al entrenamiento, este repositorio no aporta ningun dato: no se indica el volumen de horas de audio, la composicion del corpus de hinglish, ni si hubo etapas de ajuste fino supervisado o preferencias. La unica transformacion documentada es la conversion a `ggml` y la cuantizacion a 5 bits, sin modificar los pesos mas alla de la perdida de precision inherente a la cuantizacion. Toda la informacion de entrenamiento debe consultarse en el repositorio del modelo base de Oriserve.

## Capacidades

- Transcripcion de voz a texto (ASR) para audio en hinglish, con mezcla de hindi e ingles en la misma frase.
- Ejecucion en CPU mediante whisper.cpp, sin dependencia de CUDA ni de PyTorch.
- Inferencia offline y local, adecuada para entornos con recursos limitados.
- Interfaz de linea de comandos via `whisper-cli`, con seleccion de idioma mediante el flag `-l`.
- No se documentan capacidades de traduccion, diarizacion de hablantes, timestamps por palabra ni tool calling.
- No se documentan capacidades multimodales mas alla del audio de entrada.

## Casos de uso

- Subtitulado de contenido audiovisual en hinglish: el binario `ggml` permite generar transcripciones en un pipeline de postproduccion sin GPU, usando `whisper-cli` sobre los ficheros de audio extraidos del video.
- Transcripcion de reuniones y llamadas en equipos con personal que alterna hindi e ingles: al ejecutarse en CPU, puede desplegarse en servidores modestos o en el propio portatil del usuario.
- Generacion de subtitulos para creadores de contenido de la India o de la diaspora: el modelo esta especializado en el registro coloquial hinglish, frecuente en videos y podcasts.
- Procesamiento por lotes de archivos de audio en servidores sin acelerador: la cuantizacion q5_0 reduce el consumo de memoria a aproximadamente 1 GB, lo que permite ejecutar varias instancias en paralelo en un solo nodo.
- Prototipado rapido de aplicaciones de voz en local: whisper.cpp ofrece bindings y CLI que facilitan integrar el modelo en scripts y herramientas de escritorio.
- Archivado y busqueda de audio historico: transcripcion de grabaciones en hinglish para indexacion textual y busqueda posterior.
- Investigacion linguistica sobre code-switching: el modelo sirve como linea base para estudiar el rendimiento de ASR en habla mezclada hindi-ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER (word error rate), comparaciones con otros modelos ni evaluaciones sobre conjuntos de test de hinglish.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el binario cuantizado ocupa aproximadamente 1 GB de RAM en inferencia con whisper.cpp.
- GPU recomendadas: no aplica para este formato; el modelo esta pensado para CPU. Podria ejecutarse en GPU mediante otras herramientas, pero no es el proposito del artefacto.
- Cabe en cualquier GPU de consumo y en practicamente cualquier CPU moderna con al menos 2 GB de RAM libre.
- Opciones de despliegue: whisper.cpp (`whisper-cli`), y cualquier herramienta compatible con el formato `ggml` de whisper.cpp.
- Latencia y throughput: no disponibles; dependen del hardware y de la duracion del audio. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sarkaar07/bells-clipper-captions | no disponible | ventanas de 30 s (Whisper) | hinglish | Apache-2.0 | ggml q5_0 |
| Oriserve/Whisper-Hindi2Hinglish-Prime | no disponible | ventanas de 30 s (Whisper) | hinglish | Apache-2.0 | safetensors (formato original) |
| Whisper large-v3 (OpenAI) | 1.550 M | ventanas de 30 s | multilingue (99 idiomas) | MIT | safetensors, ggml, etc. |
| IndicWhisper / variantes regionales | no disponible | ventanas de 30 s | hindi e idiomas indios | varía | varía |

La comparativa con Whisper large-v3 es orientativa: el modelo de OpenAI es multilingue generalista, mientras que este artefacto esta especializado en hinglish y empaquetado para CPU. No hay datos de rendimiento que permitan comparar calidad de transcripcion.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un fine-tune sobre habla hinglish, puede presentar sesgos derivados de la distribucion del corpus original de Oriserve.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos de silencio o ruido, especialmente en audio de baja calidad.
- La especializacion en hinglish implica un rendimiento previsiblemente inferior en otros idiomas o en hindi puro formal; no se han publicado evaluaciones al respecto.
- La cuantizacion a 5 bits introduce una perdida de precision respecto al checkpoint original en safetensors; no se ha medido su impacto en el WER.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar la licencia y condiciones del modelo base de Oriserve, ya que este repositorio solo redistribuye una conversion.
- El repositorio no registra descargas ni validacion de la comunidad; no hay evidencia publica de calidad en produccion.
- El flag de idioma del ejemplo (`-l en`) puede no ser el optimo para audio predominantemente hindi; conviene probar distintas configuraciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sarkaar07/bells-clipper-captions
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Prime
- whisper.cpp (repositorio oficial): https://github.com/ggerganov/whisper.cpp
- Whisper de OpenAI (paper y repositorio): https://github.com/openai/whisper
