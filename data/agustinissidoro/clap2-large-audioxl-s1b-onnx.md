# agustinissidoro/clap2-large-audioxl-s1B-onnx

## Resumen

CLAP2-large-audioxl-s1B en formato ONNX es una conversión no oficial del modelo contrastivo audio-texto `laion/clap2-large-audioxl-s1B` de LAION, publicada por el usuario agustinissidoro. El modelo original pertenece a la familia CLAP2 (Contrastive Language-Audio Pretraining) y se entrena para alinear representaciones de audio y de texto en un espacio común, lo que permite tareas de clasificación zero-shot, recuperación multimodal y extracción de características. Esta versión concreta exporta ambas torres (audio y texto) a ONNX opset 18 en float32, manteniendo los pesos originales sin modificar.

La relevancia de esta conversión radica en que elimina la dependencia de PyTorch y de la librería `open_clip` en tiempo de inferencia, permitiendo desplegar el modelo con ONNX Runtime en entornos de producción heterogéneos (CPU, GPU, aceleradores). Además, integra el front-end de audio completo dentro del grafo ONNX: STFT con ventana Hann, banco de filtros mel HTK de 128 bandas, conversión a dB y patchify 16x16. El usuario solo necesita proporcionar la forma de onda a 32 kHz.

El modelo base se asocia al paper LAION-Audio-XL (arXiv:2611.11592), que describe un corpus web a gran escala y estudios de escalado para preentrenamiento contrastivo audio-texto. El repositorio ONNX ocupa 1,4 GB y está publicado bajo licencia Apache-2.0, la misma que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (audio y texto) con preentrenamiento contrastivo, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Audio: hasta 30 s (1024 muestras a 32 kHz); texto: 256 tokens |
| Tipos de cuantizacion | no disponible (la exportacion es float32; el repo no publica variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18, float32); tokenizer.json en formato BPE estilo GPT-2 |

## Arquitectura y entrenamiento

El modelo original es un CLAP2 de dos torres: una torre de audio y una torre de texto que se entrenan de forma contrastiva para que las representaciones de un clip y de su descripcion textual queden proximas en el espacio latente. La exportacion ONNX conserva esa estructura y anade el preprocesado de audio dentro del grafo: STFT centrada con reflect padding (n_fft 1024, hop 320), banco mel HTK de 128 bandas entre 50 Hz y 16 kHz, potencia en dB, relleno del ultimo parche temporal con el valor minimo del clip y parcheado 16x16, replicando el comportamiento de `AudioNaFlexPatchify` de open_clip.

La conversion se valido contra open_clip 4.2.2 obteniendo una similitud coseno igual o superior a 0,9999 entre los embeddings del modelo original y los del modelo ONNX para varios casos (un tono, ruido, un clip de 0,2 s y texto en ingles). Los pesos no se han modificado. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO en la informacion proporcionada; el paper asociado (LAION-Audio-XL) describe el corpus y los estudios de escalado, pero sus cifras no se recogen en esta ficha.

## Capacidades

- Extraccion de embeddings de audio normalizados L2 (salida `audio_embeds` de dimension 960) a partir de forma de onda mono a 32 kHz.
- Extraccion de embeddings de texto normalizados L2 (salida `text_embeds` de dimension 960) mediante tokenizer BPE estilo GPT-2 con truncado y padding a 256 tokens.
- Clasificacion zero-shot de audio: comparar la similitud coseno entre el embedding de audio y los embeddings de etiquetas textuales.
- Recuperacion audio-texto y texto-audio en un espacio latente compartido.
- Procesamiento de clips de hasta 30 s; para audios mas largos se recomienda trocear y promediar embeddings.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No incluye tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de representacion, no generativo.
- No soporta vision ni audio en streaming de forma nativa; la inferencia es por clip.

## Casos de uso

- Clasificacion zero-shot de eventos sonoros: dado un clip de audio, calcular la similitud coseno con embeddings de etiquetas como "a dog barking" o "rain on a window" y elegir la de mayor puntuacion, sin reentrenamiento.
- Etiquetado automatico de archivos de audio en pipelines de datos: procesar lotes de clips con ONNX Runtime en CPU o GPU para generar metadatos textuales y facilitar la busqueda.
- Busqueda semantica de audio: indexar embeddings de una biblioteca de sonidos y permitir consultas en lenguaje natural, recuperando los clips mas proximos en el espacio latente.
- Moderacion de contenido sonoro: comparar embeddings de audio con descripciones de categorias sensibles para filtrar automaticamente material no deseado.
- Sistemas de recomendacion musical o de efectos de sonido: usar la similitud entre el embedding de un clip y descripciones textuales de preferencias del usuario para ordenar candidatos.
- Investigacion en representaciones audio-texto: servir como extractor de caracteristicas congelado en experimentos de transferencia, evaluacion de sesgos o analisis de alineamiento multimodal, aprovechando la paridad numerica con el modelo original (coseno >= 0,9999).
- Despliegue en entornos sin PyTorch: integrar el modelo en servicios basados en ONNX Runtime, incluidos dispositivos edge o backends con soporte limitado de frameworks de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la fidelidad de la conversion: similitud coseno >= 0,9999 entre embeddings del modelo original y del ONNX para un tono, ruido, un clip de 0,2 s y texto en ingles.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 1,4 GB en float32, por lo que la inferencia en GPU requiere al menos ese orden de magnitud mas el overhead de ONNX Runtime.
- GPU recomendadas: no disponible; al ser un modelo de 1,4 GB en float32, cabe en GPUs consumer con 4 GB o mas de VRAM, aunque no se publican cifras oficiales.
- Cabe en GPU consumer: previsiblemente si, en tarjetas con 4-6 GB de VRAM o superiores (RTX 3050, RTX 4060, RTX 4090, etc.), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es el backend previsto; tambien podria ejecutarse con otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agustinissidoro/clap2-large-audioxl-s1B-onnx | no disponible | 30 s audio / 256 tokens texto | Apache-2.0 | ONNX | Conversion no oficial, paridad coseno >= 0,9999 con el original |
| laion/clap2-large-audioxl-s1B | no disponible | 30 s audio / 256 tokens texto | Apache-2.0 | PyTorch (open_clip) | Modelo original de LAION, requiere open_clip |
| Alternativas CLAP de otros autores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del modelo original.

## Limitaciones y advertencias

- Conversion no oficial: no esta hecha ni respaldada por LAION; cualquier problema de la conversion debe atribuirse al autor del repositorio ONNX.
- Solo ingles: la etiqueta de idioma del repositorio es `en`, por lo que el rendimiento en otros idiomas puede degradarse.
- Ventana de audio limitada a 30 s; para clips mas largos hay que trocear y promediar, lo que puede perder informacion temporal.
- Modelo de representacion, no generativo: no produce texto ni razonamiento; su uso esta limitado a embeddings y similitud.
- Riesgo de sesgos heredados del corpus de entrenamiento LAION-Audio-XL, que no se detalla en la informacion disponible.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la similitud coseno puede producir clasificaciones erroneas en audio ambiguo o fuera de dominio.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar a los autores originales segun el BibTeX proporcionado.
- El tokenizer requiere padding manual con id 50258 y truncado a 256 tokens; un uso incorrecto altera los embeddings.
- No se publican cifras de latencia ni throughput, por lo que el dimensionado en produccion debe medirse empiricamente.

## Enlaces

- Repositorio ONNX en Hugging Face: https://huggingface.co/agustinissidoro/clap2-large-audioxl-s1B-onnx
- Modelo original: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Paper LAION-Audio-XL: https://arxiv.org/abs/2611.11592
- Script de conversion: https://github.com/agustinissidoro/bach-mcp/blob/main/py/bach_mcp/utilities/export_onnx.py
- Repositorio bach-mcp: https://github.com/agustinissidoro/bach-mcp
