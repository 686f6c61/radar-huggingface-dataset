# codebucketsolutions/larger-clap-music-and-speech-onnx

## Resumen

`codebucketsolutions/larger-clap-music-and-speech-onnx` es una exportación a ONNX del modelo `laion/larger_clap_music_and_speech` de LAION, un modelo de audio-texto de tipo CLAP (Contrastive Language-Audio Pretraining) diseñado para clasificación de audio zero-shot y obtención de embeddings conjuntos de audio y texto. La exportación la firma el usuario `codebucketsolutions` y no es un lanzamiento oficial de los autores originales, aunque conserva los pesos sin modificar y la misma licencia Apache-2.0.

El modelo combina un codificador de audio HTSAT-base con un codificador de texto RoBERTa-base, y se distribuye como dos grafos ONNX independientes (torre de audio y torre de texto) que se ejecutan con onnxruntime sin necesidad de PyTorch. Esto lo hace relevante para despliegues en producción donde el stack de inferencia no incluye PyTorch, o donde se busca una huella de memoria menor y una integración directa con runtimes ligeros.

La exportación incluye una variante del grafo de audio con los pesos de las multiplicaciones matriciales en int8, manteniendo el grafo de texto en fp32 porque la cuantización dinámica int8 degradaba demasiado sus embeddings. El repositorio ocupa 0,9 GB y el modelo está orientado a clasificación de audio zero-shot y extracción de embeddings, no a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP: codificador de audio HTSAT-base + codificador de texto RoBERTa-base, con proyección a espacio conjunto de 512 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio: 10 s a 48 kHz (480000 muestras); texto: 77 tokens |
| Tipos de cuantizacion | fp32 y int8 (solo grafo de audio, pesos de multiplicaciones matriciales) |
| Idiomas soportados | no disponible (el codificador de texto es RoBERTa-base; la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`audio.onnx`, `audio.int8.onnx`, `text.onnx`) + `tokenizer.json` + `clap.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CLAP propuesta en "Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation" (ICASSP 2023). El codificador de audio es HTSAT-base (Hierarchical Token-Semantic Audio Transformer, Chen et al., ICASSP 2022) y el de texto es RoBERTa-base. Ambos proyectan a un espacio latente conjunto de 512 dimensiones, con embeddings L2-normalizados, de forma que la similitud coseno entre un audio y una etiqueta textual en lenguaje natural actúa como puntuación de clasificación.

El front-end log-mel está embebido dentro del grafo ONNX de audio: una convolución con stride que implementa la DFT enventanada, el banco de filtros mel y el logaritmo. El grafo de audio acepta exactamente 10 segundos de audio mono a 48 kHz; para clips más cortos se repite el clip completo y se rellena con ceros (`padding: repeatpad`), y para clips más largos se recomienda embeber ventanas de 10 s y promediar. El grafo de texto trunca a 77 tokens, con id de padding 1 y máscara de atención 0.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino adicional; esa información correspondería a la model card del modelo base `laion/larger_clap_music_and_speech`. La innovación técnica de esta exportación es la paridad verificada con PyTorch: el script `export_clap_onnx.py` compara los grafos ONNX contra la implementación original en torch 2.5.1+cpu sobre seis clips (tres de voz recortados a 10 s y tres sintéticos: una progresión de acordes con ritmo, ruido blanco y un tono de 1 kHz) frente a 15 etiquetas.

## Capacidades

- Clasificación de audio zero-shot: puntúa un clip contra etiquetas escritas en lenguaje natural mediante `softmax(logit_scale * audio_embedding @ text_embeddings.T)`, con `logit_scale` 27.4399.
- Extracción de embeddings de audio: vector float32 de 512 dimensiones, L2-normalizado, por clip de 10 s.
- Extracción de embeddings de texto: vector float32 de 512 dimensiones, L2-normalizado, para cadenas de hasta 77 tokens.
- Búsqueda y recuperación audio-texto: al compartir espacio latente, permite similitud coseno entre audios y descripciones textuales.
- Distinción música/habla: el modelo base está entrenado específicamente sobre música y habla, y la model card muestra etiquetas como "music" o "a woman speaking" con probabilidades altas.
- Inferencia sin PyTorch: ejecutable con onnxruntime, incluida la variante int8 del grafo de audio.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente; es un modelo discriminativo de embeddings.

## Casos de uso

- Moderación y etiquetado automático de audio en plataformas: clasificar clips subidos por usuarios contra un conjunto de etiquetas textuales (música, habla, ruido, tono puro) sin entrenar un clasificador específico, usando la torre de audio y la de texto en onnxruntime.
- Enrutamiento en pipelines de transcripción: detectar si un fragmento contiene habla o música antes de enviarlo a un motor ASR, aprovechando la probabilidad alta que el modelo asigna a "a woman speaking" o "a man speaking" frente a "music".
- Búsqueda semántica de archivos de audio: indexar una fonoteca calculando embeddings de 512 dimensiones por ventana de 10 s y recuperar clips por consultas en lenguaje natural mediante similitud coseno.
- Deduplicación y clustering de audio: agrupar clips por similitud de embeddings para detectar contenido repetido o clasificar colecciones musicales por similitud.
- Despliegue en entornos sin PyTorch: integrar la clasificación de audio en servicios ligeros basados en onnxruntime, con la variante int8 del grafo de audio para reducir requisitos de cómputo y memoria.
- Verificación de calidad de grabaciones: comprobar que un clip contiene la señal esperada (voz, música, tono de prueba) en pipelines de test automatizados de equipos de captura o telefonía.
- Prototipado rápido de clasificadores de audio: usar etiquetas en texto plano para validar categorías antes de invertir en un dataset etiquetado y un clasificador supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye una tabla de paridad entre la implementación PyTorch y los grafos ONNX:

| Métrica | Grafos fp32 | Grafo de audio int8 |
|---|---|---|
| Diferencia máxima absoluta, embedding de audio | 9,9e-06 | 6,5e-03 |
| Coseno mínimo frente a PyTorch, embedding de audio | 1,000000 | 0,998976 |
| Diferencia máxima absoluta, embedding de texto | 2,5e-07 | no aplica (texto en fp32) |
| Diferencia máxima absoluta, probabilidades de etiqueta | 8,9e-05 | 5,3e-02 |
| Coincidencia de etiqueta top | 6 de 6 | 6 de 6 |

Etiqueta top por clip (PyTorch / ONNX fp32):

| Clip | PyTorch | ONNX |
|---|---|---|
| en-short | a woman speaking 0,9228 | a woman speaking 0,9228 |
| hi-short | a woman speaking 0,7423 | a woman speaking 0,7423 |
| en-long | a man speaking 0,512 | a man speaking 0,512 |
| music | music 0,9559 | music 0,9559 |
| noise | white noise 0,788 | white noise 0,788 |
| tone | a pure tone 0,6888 | a pure tone 0,6887 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,9 GB, por lo que los grafos fp32 e int8 caben holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria libre; el modelo es pequeño comparado con LLM y no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama media son suficientes.
- Cabe en GPU de consumo: sí, con margen amplio; también puede ejecutarse en CPU con onnxruntime, que es el modo usado en las pruebas de paridad (torch 2.5.1+cpu).
- Opciones de despliegue: onnxruntime (CPU o GPU), con los grafos `audio.onnx`, `audio.int8.onnx` y `text.onnx`; no requiere vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| codebucketsolutions/larger-clap-music-and-speech-onnx | CLAP (HTSAT-base + RoBERTa-base) | 10 s audio / 77 tokens texto | Apache-2.0 | ONNX | Exportación no oficial, sin PyTorch |
| laion/larger_clap_music_and_speech | CLAP (HTSAT-base + RoBERTa-base) | 10 s audio / 77 tokens texto | Apache-2.0 | PyTorch (safetensors) | Modelo base original, requiere PyTorch |
| laion/clap-htsat-unfused | CLAP (HTSAT + RoBERTa) | 10 s audio / 77 tokens texto | Apache-2.0 | PyTorch | Variante CLAP de LAION con fusión no fusionada; datos de rendimiento no disponibles en esta ficha |
| laion/clap-htsat-fused | CLAP (HTSAT + RoBERTa) | 10 s audio / 77 tokens texto | Apache-2.0 | PyTorch | Variante con feature fusion; datos de rendimiento no disponibles en esta ficha |

## Limitaciones y advertencias

- No es un lanzamiento oficial de LAION: la exportación la realiza un tercero y los autores originales no la han validado.
- El grafo de texto no se ofrece en int8 porque la cuantización dinámica desplazaba los embeddings demasiado (coseno aproximado de 0,96); usar solo fp32 para texto.
- El grafo de audio int8 introduce diferencias de hasta 5,3e-02 en probabilidades de etiqueta, aunque mantiene la etiqueta top en las pruebas realizadas.
- Entrada de audio rígida: exactamente 10 s mono a 48 kHz; clips más largos requieren ventanas de 10 s promediadas, lo que puede diluir eventos cortos.
- Texto truncado a 77 tokens; etiquetas más largas se recortan.
- Riesgo de sesgo y alucinación: al ser un modelo contrastivo, puede asignar probabilidades altas a etiquetas incorrectas cuando el audio queda fuera de la distribución de música y habla; la model card no documenta análisis de sesgos.
- Idiomas soportados no declarados; el codificador de texto es RoBERTa-base, predominantemente inglés, por lo que etiquetas en otros idiomas pueden degradar el rendimiento (la prueba con clip "hi-short" usa etiquetas en inglés).
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base y la atribución a los autores de CLAP y HTS-AT.
- No apto para generación de texto, agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/larger-clap-music-and-speech-onnx
- Modelo base: https://huggingface.co/laion/larger_clap_music_and_speech
- Paper de CLAP (Wu et al., ICASSP 2023): "Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation"
- Paper de HTS-AT (Chen et al., ICASSP 2022): "HTS-AT: A Hierarchical Token-Semantic Audio Transformer for Sound Classification and Detection"
- Repositorio de código original de LAION-AI/CLAP: https://github.com/LAION-AI/CLAP
