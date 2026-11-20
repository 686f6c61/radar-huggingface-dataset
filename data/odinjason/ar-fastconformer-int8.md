# odinjason/ar-fastconformer-int8

## Resumen

`ar-fastconformer-int8` es un modelo de reconocimiento automatico del habla (ASR) para arabe, publicado por el usuario odinjason en Hugging Face. Se trata de una conversión a INT8 de la familia FastConformer de NVIDIA, empaquetada en formato ONNX y consumible mediante la librería sherpa-onnx con el decodificador `OfflineRecognizer.from_nemo_ctc`. El modelo está pensado para inferencia offline en CPU, sin dependencia de GPU ni de frameworks de deep learning pesados.

El modelo no aporta entrenamiento propio: es una copia sin cambios de `krut42/voice-fastconformer-ar-ctc-int8`, que a su vez deriva de `OpenVoiceOS/stt_ar_fastconformer_hybrid_large_pcd_v1.0_onnx` y, en última instancia, de `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` de NVIDIA. La contribución del autor es, por tanto, la redistribución en un formato ligero (un único `model.int8.onnx` de unos 174 MB más `tokens.txt`) orientado a aplicaciones de escritorio y móviles.

Su relevancia es práctica: ofrece una vía sencilla para integrar transcripción de árabe en aplicaciones locales con sherpa-onnx, con licencia CC BY 4.0 que permite uso comercial con atribución. La validación publicada es muy limitada (cuatro frases sintéticas), por lo que debe considerarse un artefacto de despliegue más que un modelo con evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (CTC/RNNT) de NVIDIA, exportado a ONNX en modo CTC |
| Parametros totales | no disponible (la variante de origen es "large"; el recuento exacto no se indica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ASR por segmentos; entrada de audio a 16 kHz mono) |
| Tipos de cuantizacion | INT8 (único artefacto publicado: `model.int8.onnx`) |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | CC BY 4.0 (atribucion obligatoria) |
| Formato de pesos | ONNX (`model.int8.onnx`, ~174 MB) + `tokens.txt`; repositorio de ~0,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es FastConformer, la variante de Conformer con downsampling de secuencia propuesta por NVIDIA para ASR, en su configuración híbrida (cabezas CTC y RNNT) y variante "large". El modelo original de NVIDIA se distribuye con licencia CC BY 4.0 e incluye puntuación y diccionario ("pcd") en su nombre de artefacto. La exportación a ONNX conserva el modo CTC, que es el que sherpa-onnx consume mediante `OfflineRecognizer.from_nemo_ctc`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de técnicas de aumento de datos ni de ajuste por RLHF/DPO; estos detalles corresponden al modelo de NVIDIA y no se documentan en esta ficha. La única transformación documentada es la cuantización a INT8 realizada por el autor del modelo intermedio (`krut42`), sin cambios adicionales por parte de odinjason. No se declaran innovaciones técnicas propias más allá del empaquetado para sherpa-onnx.

## Capacidades

- Transcripción de voz a texto en arabe a partir de audio mono a 16 kHz.
- Decodificación CTC offline, sin necesidad de red ni de servicios externos.
- Ejecución en CPU mediante sherpa-onnx (`OfflineRecognizer.from_nemo_ctc`), con la versión 2.0.2 probada en Python sobre Windows.
- Modelo compacto (~174 MB en INT8) apto para aplicaciones de escritorio y potencialmente para dispositivos con recursos limitados (aunque no se ha verificado en Android).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio en streaming ni otras capacidades más allá de ASR.
- No se documenta detección de idioma ni multilingüismo: el modelo está etiquetado únicamente para `ar`.

## Casos de uso

- Transcripción local de notas de voz en arabe: integración en una aplicación de escritorio que convierta grabaciones de 16 kHz mono en texto sin enviar audio a la nube, aprovechando el tamaño reducido del ONNX INT8.
- Subtitulado offline de reuniones o entrevistas en arabe: procesado por segmentos con sherpa-onnx en CPU, adecuado cuando no se dispone de GPU y se prioriza la privacidad de los datos.
- Digitalización de archivos de audio en árabe para su indexación y búsqueda: el modelo puede alimentar un pipeline de transcripción por lotes que genere texto posteriormente indexado en un motor de búsqueda.
- Asistentes de voz embebidos en aplicaciones de escritorio: al ejecutarse en CPU y no requerir framework de deep learning, encaja en aplicaciones ligeras que necesiten un motor ASR local para comandos o dictado en arabe.
- Prototipado rápido de funcionalidades ASR: el par `model.int8.onnx` + `tokens.txt` permite validar una prueba de concepto en sherpa-onnx en minutos, sin entrenamiento ni conversión.
- Preprocesado de datos para otros sistemas: transcripción previa de audio en arabe antes de pasarlo a un modelo de lenguaje o a un sistema de análisis de sentimiento, siempre que la calidad se valide con habla real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única evaluación documentada es cualitativa: sobre cuatro frases cortas en arabe sintetizadas por una voz de IA, el modelo produjo dos transcripciones exactas, una con un error de una palabra y otra con errores al inicio y al final. No se probó con habla humana real, dialectos, audio con ruido ni dispositivos Android, y no se verificó la versión mínima de sherpa-onnx necesaria (la aplicación del autor usa `sherpa_onnx` 1.13.7).

## Requisitos de hardware

- VRAM: no aplica en el escenario probado; la inferencia es en CPU. El modelo INT8 ocupa unos 174 MB en disco y una huella de memoria del orden de cientos de MB en ejecución (no medida en la documentación).
- GPU: no se documenta uso de GPU; sherpa-onnx permite ejecución en CPU y el autor probó exclusivamente ese modo.
- GPU de consumo: no disponible; no hay datos de ejecución en GPU para esta exportación.
- Despliegue: sherpa-onnx (Python y presumiblemente otros bindings), con `OfflineRecognizer.from_nemo_ctc`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo ASR ONNX).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| odinjason/ar-fastconformer-int8 | no disponible (variante large) | audio 16 kHz mono | ar | CC BY 4.0 | ONNX INT8 |
| krut42/voice-fastconformer-ar-ctc-int8 | no disponible | audio 16 kHz mono | ar | no disponible en la informacion | ONNX INT8 |
| OpenVoiceOS/stt_ar_fastconformer_hybrid_large_pcd_v1.0_onnx | no disponible (large) | audio 16 kHz mono | ar | no disponible en la informacion | ONNX |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 | no disponible (large) | audio 16 kHz mono | ar | CC BY 4.0 | NeMo (.nemo) |

Las alternativas listadas son las mismas que la cadena de procedencia del modelo, no competidores independientes; no se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Evaluación muy limitada: solo cuatro frases sintéticas; no hay validación con habla humana, dialectos, ruido ni acentos.
- El modelo no ha sido entrenado por el autor; cualquier sesgo o limitación del corpus de NVIDIA se hereda sin cambios.
- Riesgo de alucinación y errores de transcripción en audio ruidoso o con hablantes no nativos; no cuantificado.
- Cobertura limitada al árabe; no se documenta manejo de code-switching ni de otros idiomas.
- La licencia CC BY 4.0 exige atribución; es necesario conservar y mostrar la cadena de autoría (NVIDIA, OpenVoiceOS, krut42, odinjason) en los usos derivados.
- No se ha verificado la versión mínima de sherpa-onnx ni el funcionamiento en Android; el autor probó solo Python 2.0.2 en Windows.
- El repositorio no incluye documentación sobre parámetros de decodificación, puntuación ni normalización de texto; conviene validar el pipeline completo antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/odinjason/ar-fastconformer-int8
- Modelo de origen intermedio: https://huggingface.co/krut42/voice-fastconformer-ar-ctc-int8
- Exportación ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_ar_fastconformer_hybrid_large_pcd_v1.0_onnx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Texto de la licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx (repositorio del runtime): https://github.com/k2-fsa/sherpa-onnx
