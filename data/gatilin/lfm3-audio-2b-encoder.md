# gatilin/lfm3-audio-2b-encoder

## Resumen

`gatilin/lfm3-audio-2b-encoder` es una extracción comunitaria del codificador de audio y el proyector al espacio del lenguaje del modelo multimodal LiquidAI/LFM3-Audio-2B. No es un modelo completo: contiene únicamente los 176 tensores correspondientes a `encoder.*` y `mlp.*` de la revisión `2d6c1f99c129b3ef07a8d168bc0ff08e2bdb93f1`, con nombres, formas, dtypes y valores originales preservados. El modelo de lenguaje, el decodificador de salida de voz y el LiquidCodec no están incluidos.

El componente resuelve un problema muy concreto de ingeniería: permitir reutilizar el frontend acústico de LFM3-Audio-2B de forma aislada, sin arrastrar los aproximadamente 2 mil millones de parámetros del modelo completo. Con 115.278.144 parámetros y un repositorio de 0,2 GB, está pensado para pipelines de extracción de características y experimentación con representaciones de audio en el espacio latente del modelo base.

Es relevante ahora porque los modelos omni y audio-lenguaje de Liquid AI están ganando tracción y la comunidad necesita piezas desacopladas para integrar codificadores en arquitecturas propias. La ficha debe leerse con la advertencia de que las validaciones publicadas son comprobaciones de carga estricta y de inferencia en CPU con una onda sinusoidal sintética, no una evaluación de calidad de reconocimiento de voz ni una prueba de equivalencia con el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de 17 capas (transformer) más proyector MLP al espacio del lenguaje |
| Parametros totales | 115.278.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License 1.0 (con condiciones de uso comercial) |
| Formato de pesos | safetensors (176 tensores, nombres y dtypes originales) |

## Arquitectura y entrenamiento

El repositorio contiene el codificador de entrada de audio de 17 capas del modelo LFM3-Audio-2B junto con el proyector MLP que mapea las representaciones acústicas al espacio latente del modelo de lenguaje. No se ha reentrenado nada: los pesos son una extracción literal del checkpoint original, conservando los nombres de tensor del código fuente. El archivo `component.py` aplica las conversiones de claves del checkpoint original durante la carga, sin renombrar los tensores almacenados.

El extractor de características asociado acepta audio mono a 16 kHz y devuelve `input_features` y `feature_attention_mask`. Las características y las longitudes válidas se alimentan a `model.model.audio_encoder`, y las salidas válidas del codificador se pasan a `model.model.audio_projector`. El autor documenta en `contrast_with_omni.json` que cuatro muestras de bytes de tensores difieren de la extracción equivalente de LFM3-Omni, de modo que una arquitectura similar no implica pesos idénticos. No se publican datos sobre volumen de entrenamiento, composición del corpus, ni etapas de RLHF o DPO, ya que se trata de una extracción y no de un entrenamiento nuevo.

## Capacidades

- Extracción de características de audio a partir de waveforms mono a 16 kHz.
- Generación de embeddings acústicos en el espacio latente del modelo LFM3-Audio-2B mediante el proyector MLP.
- Carga estricta verificada con safetensors y comprobaciones de humo en CPU con una onda sinusoidal sintética y una waveform de voz generada públicamente.
- Reutilización del LiquidCodec oficial: el autor confirma que los archivos `audio_tokenizer/model.safetensors` de LFM3-Audio-2B y LFM3-Omni-2B comparten tamaño y SHA-256 de LFS, por lo que el LiquidCodec publicado en `gatilin/lfm3-omni-liquidcodec` puede reutilizarse.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: esas funciones residen en el modelo de lenguaje, que no forma parte de este repositorio.

## Casos de uso

- Integración en pipelines ASR propios: el codificador y el proyector se pueden insertar como frontend acústico en una arquitectura propia que sustituya al modelo de lenguaje de Liquid AI, manteniendo las representaciones alineadas con el espacio latente original.
- Investigación en representaciones de audio: útil para estudiar cómo codifica el habla un modelo audio-lenguaje de última generación sin cargar los 2B parámetros completos, con un coste de 0,2 GB en disco.
- Extracción de embeddings para clasificación o clustering de audio: las salidas del proyector sirven como features densas para tareas downstream de habla, siempre que se valide su calidad en el dominio objetivo.
- Prototipado de sistemas de voz en CPU: las comprobaciones de humo publicadas se ejecutan en CPU, lo que permite experimentar sin GPU dedicada en fases tempranas.
- Reutilización del LiquidCodec en pipelines de codec neuronal: el repositorio documenta la equivalencia criptográfica del tokenizador con LFM3-Omni-2B, habilitando su uso combinado en sistemas de compresión de voz.
- Auditoría y reproducibilidad de modelos abiertos: al conservar nombres, formas, dtypes y hashes en `tensor_mapping.json` y `extraction.json`, sirve para verificar extracciones y comparar pesos entre variantes de la familia LFM3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las validaciones incluidas (`validation.json`) son comprobaciones de carga estricta y de humo en CPU, no evaluaciones de calidad de reconocimiento de voz, de equivalencia con el modelo completo ni de rendimiento en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 115,3 M de parámetros en fp32 el peso ronda los 0,46 GB, y en fp16 unos 0,23 GB, pero el autor no publica cifras de memoria de activaciones ni de pico.
- GPU recomendadas: no disponible; el autor solo documenta validación en CPU.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos cabría en cualquier GPU con más de 1 GB de VRAM, pero no hay validación publicada.
- Opciones de despliegue: carga mediante PyTorch, Transformers 5.21.1, accelerate, safetensors y NumPy, usando `component.load_model(root)` y `component.load_feature_extractor(root)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/lfm3-audio-2b-encoder | 115,3 M | no disponible | Codificador de audio + proyector | LFM Open License 1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-Audio-2B | ~2 B (modelo completo) | no disponible | Modelo audio-lenguaje completo | LFM Open License 1.0 | Hugging Face (modelo base) |
| gatilin/lfm3-omni-audio-encoder | no disponible | no disponible | Extracción de audio de LFM3-Omni | no disponible en la información | Hugging Face |
| gatilin/lfm3-omni-liquidcodec | no disponible | no disponible | Codec neuronal (tokenizador) | no disponible en la información | Hugging Face |

La comparación relevante es con el modelo completo del que se extrae: este repositorio reduce el peso de 2 B a 115 M de parámetros a cambio de eliminar por completo la capacidad generativa. Frente a la extracción de LFM3-Omni, el autor advierte explícitamente que los pesos no son idénticos (cuatro muestras de bytes difieren).

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo de lenguaje, el decodificador de salida de voz y el LiquidCodec no puede generar texto ni audio.
- Las validaciones publicadas son comprobaciones de carga y de humo en CPU; no acreditan calidad de transcripción, robustez acústica ni equivalencia numérica con el modelo completo.
- No hay datos publicados sobre sesgos, idiomas soportados, tasas de alucinación ni comportamiento en dominios ruidosos.
- La licencia LFM Open License 1.0 incluye condiciones de uso comercial que deben revisarse antes de un despliegue en producción; el repositorio conserva los avisos de copyright en los archivos de implementación.
- El autor documenta discrepancias de bytes frente a la extracción de LFM3-Omni; no asumir intercambiabilidad entre ambas piezas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026: no hay evidencia de uso en producción ni de mantenimiento continuado.
- El soporte depende de versiones concretas (Transformers 5.21.1); cambios de versión pueden romper la carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/lfm3-audio-2b-encoder
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Extracción de audio de LFM3-Omni: https://huggingface.co/gatilin/lfm3-omni-audio-encoder
- LiquidCodec reutilizable: https://huggingface.co/gatilin/lfm3-omni-liquidcodec
- Licencia LFM Open License 1.0: incluida en el repositorio como `LICENSE`
- Archivos de metadatos y validación citados en la model card: `component.py`, `contrast_with_omni.json`, `validation.json`, `tensor_mapping.json`, `extraction.json`, `liquidcodec_comparison.json`
