# ahm22004/kaomnique

## Resumen

KaOmniQue es un overlay de transformer derivado que combina el transformer de difusión dual-stream de Kandinsky 6.0 Lite (kandinskylab) con un conector de alineación aprendido para aceptar estados ocultos de Qwen2.5-Omni-3B en lugar del codificador de texto original Qwen2.5-VL-7B. Lo publica el usuario ahm22004 en Hugging Face y no es un pipeline autónomo de Diffusers: contiene únicamente los pesos del transformer y su configuración, y requiere descargar por separado el VAE, el códec de audio, el vocoder, el scheduler, el tokenizador y el CLIP del repositorio original de Kandinsky, además del checkpoint GGUF Q4_K_M de Qwen2.5-Omni-3B.

El interés técnico reside en el método de alineación: un ajuste ridge en forma cerrada aprende un conector de 7.340.032 parámetros entre los estados de Qwen2.5-Omni y los de Qwen2.5-VL-7B, y luego se pliega dentro de las dos proyecciones de texto existentes, de modo que en tiempo de ejecución no se añade ningún peso extra. Solo se modifican dos tensores (`video_text_embeddings.in_layer.weight` y `audio_text_embeddings.in_layer.weight`) y el campo `in_text_dim` de la configuración, que pasa de 3584 a 2048.

El modelo es relevante como prueba de concepto de sustitución de codificadores de texto en pipelines de difusión multimodales sin reentrenamiento por gradiente, pero su madurez es muy limitada: cero descargas, cero likes, una única evaluación end-to-end con resultado de calidad 0,0 sobre una muestra de tamaño 1 y una licencia Qwen Research que restringe el uso a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión dual-stream (vídeo y audio) derivado de Kandinsky 6.0 Lite, con proyecciones de texto adaptadas a estados ocultos de Qwen2.5-Omni |
| Parametros totales | 3.173.859.344 (transformer derivado); 7.368.270.797 en la familia activa combinada, contando una sola vez la copia anidada del vocoder |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el transformer; el codificador de texto externo se distribuye como GGUF Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (uso restringido a investigación y evaluación no comercial); los componentes fuente de Kandinsky son MIT |
| Formato de pesos | safetensors (1.976 tensores BF16 y 423 tensores F32); el codificador de texto externo en GGUF |

## Arquitectura y entrenamiento

El transformer es el de Kandinsky 6.0 Lite en su variante dual-stream, con una rama de vídeo y otra de audio. La modificación respecto al original afecta solo a las capas de entrada de texto: la proyección de la rama de vídeo pasa de `[1792, 3584]` a `[1792, 2048]` y la de la rama de audio de `[896, 3584]` a `[896, 2048]`, para aceptar estados ocultos de 2048 dimensiones procedentes de Qwen2.5-Omni. El resto de tensores es idéntico byte a byte al transformer publicado. La ruta de condicionamiento agrupado (pooled) sigue usando el embedding CLIP de 768 dimensiones original.

No hubo entrenamiento por gradiente. El conector se obtuvo mediante un ajuste ridge en forma cerrada de 7.340.032 parámetros que mapea estados de Qwen2.5-Omni a estados de Qwen2.5-VL-7B, tomados del checkpoint `Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf` como objetivo de alineación. La selección fue prompt-safe: se ajustaron candidatos en espacio de estados y en espacio de ramas sobre 1.505 tokens de entrenamiento, cuatro prompts de validación eligieron el método, el conector de espacio de estados se reajustó sobre los 1.658 tokens completos y solo ese conector final se evaluó sobre un holdout de 18 prompts y 453 tokens. Los resultados de fidelidad representacional fueron coseno 0,993369 y R² 0,910443 en la rama de vídeo, y coseno 0,985168 y R² 0,845637 en la rama de audio. Los estados objetivo reflejan el error de cuantización del checkpoint Q4_K_M, y la procedencia incluida no establece la precisión exacta usada en el entrenamiento del objetivo.

## Capacidades

- Generación de vídeo a partir de texto mediante la ruta `text->video` del pipeline `Kandinsky6TI2VAPipeline`, con condicionamiento por estados ocultos de Qwen2.5-Omni.
- Rama de audio del transformer adaptada para aceptar los mismos estados de texto de 2048 dimensiones, aunque la evaluación publicada no cargó ni ejecutó el VAE de audio ni el vocoder.
- Condicionamiento de texto token a token (2048 dimensiones) combinado con condicionamiento agrupado CLIP (768 dimensiones).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modos de pensamiento.
- No incorpora visión, audio de entrada ni otras modalidades más allá del condicionamiento de texto descrito.

## Casos de uso

- Investigación sobre sustitución de codificadores de texto en pipelines de difusión: permite estudiar si un codificador de 3B puede reemplazar a uno de 7B en un transformer de vídeo sin reentrenar el difusor, usando el conector plegado como objeto de análisis.
- Experimentos de alineación representacional: el método ridge en forma cerrada y las métricas de coseno y R² sobre holdout sirven como referencia reproducible para comparar técnicas de destilación de espacios latentes entre codificadores.
- Evaluación de pipelines de vídeo en hardware sin soporte BF16 en CUDA: la ejecución de referencia se hizo en CPU con BF16 sobre una GTX 980 (sm_52), lo que documenta una ruta viable para entornos sin GPU moderna.
- Prototipado de generación de vídeo condicionada por un LLM multimodal: la arquitectura permite conectar un modelo de lenguaje con salida de estados ocultos a un difusor de vídeo, útil para explorar interfaces entre modelos generativos.
- Reproducción de resultados y auditoría de procedencia: el `public-manifest.json` incluye hashes SHA-256 y recuentos de bytes de cada archivo requerido, lo que facilita verificar la cadena de dependencias en estudios de reproducibilidad.
- Docencia y formación técnica: el repositorio ilustra de forma compacta cómo se modifica un transformer publicado, cómo se pliega un adaptador en pesos existentes y cómo se documentan las modificaciones en `MODIFICATIONS.md`.
- No se recomienda su uso en producción de generación de vídeo: la única evaluación end-to-end disponible arroja calidad 0,0 sobre una muestra de tamaño 1.

## Benchmarks y rendimiento

| Medicion | Rama de video | Rama de audio |
|---|---:|---:|
| Coseno de validación, ajuste de selección sobre 1.505 tokens | 0,989182 | 0,972654 |
| Coseno de holdout, conector final sobre 1.658 tokens | 0,993369 | 0,985168 |
| R² de holdout, conector final sobre 1.658 tokens | 0,910443 | 0,845637 |

| Evaluacion end-to-end | Valor medido |
|---|---|
| Ruta evaluada | `text->video` |
| Geometría | 16×16, 5 fotogramas, 24 fps, 1 paso de inferencia, semilla 0 |
| Dispositivo | CPU, BF16 |
| Métrica | `answer_match` |
| Calidad | 0,0 (n=1) |
| Respuesta del juez | "No." |
| Artefacto | MP4 de 1.775 bytes, SHA-256 `01fb01075a0482f7905` (truncado en la información disponible) |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas estándar de generación de vídeo (FVD, CLIP score, etc.). Las cifras anteriores miden fidelidad representacional y una única prueba de humo, no calidad de vídeo generado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El transformer derivado tiene 3.173.859.344 parámetros; en BF16 supone aproximadamente 6,4 GB solo para sus pesos, a los que hay que sumar el VAE, el códec, el vocoder, el CLIP y el codificador Qwen2.5-Omni-3B externo.
- GPU recomendadas: no se especifican. La ejecución de referencia se realizó en CPU con BF16 porque una GTX 980 (sm_52) no puede ejecutar los kernels BF16 requeridos en CUDA.
- Cabe en GPU de consumo: no confirmado. Por tamaño de pesos del transformer es plausible en tarjetas con 16-24 GB en BF16, pero la familia combinada completa (7.368.270.797 parámetros activos) y los componentes externos no están dimensionados en la documentación.
- Opciones de despliegue: Diffusers `0.43.0` con `Kandinsky6TI2VAPipeline`, construyendo el pipeline con `text_encoder=None` y `tokenizer=None` y suministrando explícitamente los tensores de condicionamiento. Se requiere además el runner local descrito en la documentación del proyecto o una implementación equivalente. El codificador de texto externo se carga desde GGUF Q4_K_M.
- Versiones medidas: Python 3.12.13, PyTorch 2.15.0+cpu, Diffusers 0.43.0, Transformers 5.23.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KaOmniQue (este modelo) | 3.173.859.344 (transformer); 7.368.270.797 familia activa | no disponible | qwen-research (no comercial) | Hugging Face, 0 descargas | Overlay, no pipeline autónomo; evaluación end-to-end n=1 con calidad 0,0 |
| Kandinsky 6.0 Lite distill 5s (kandinskylab) | no disponible en la información | no disponible | MIT para componentes fuente | Hugging Face | Modelo base; incluye codificador de texto Qwen2.5-VL-7B y pipeline completo |
| Qwen2.5-Omni-3B (ggml-org, GGUF) | 3B (aproximado por el nombre) | no disponible | qwen-research | Hugging Face, formato GGUF Q4_K_M | Codificador de texto externo usado por KaOmniQue; no es un generador de vídeo |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un pipeline autónomo: sin el VAE, códec, vocoder, scheduler, tokenizador y CLIP del repositorio de Kandinsky, y sin el GGUF de Qwen2.5-Omni-3B, el repositorio no puede ejecutarse.
- La licencia qwen-research restringe el uso a investigación y evaluación no comercial; cualquier uso comercial requiere autorización adicional de Qwen.
- La única evaluación end-to-end publicada tiene n=1, métrica `answer_match` y calidad 0,0; no hay evidencia de calidad de vídeo generado.
- La fidelidad representacional se midió contra estados objetivo producidos desde un checkpoint Q4_K_M, por lo que incorpora el error de cuantización de ese checkpoint; la precisión exacta del objetivo de entrenamiento no está establecida.
- La rama de audio no se cargó ni ejecutó en la prueba de humo; su funcionamiento end-to-end no está verificado.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; al ser un modelo de difusión, el riesgo principal es la generación de contenido visual no fiable o no fiel al prompt.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (25 de noviembre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- La ejecución de referencia en CPU BF16 no representa el rendimiento en GPU; no hay datos de latencia ni throughput.
- El SHA-256 del artefacto de prueba aparece truncado en la información disponible, lo que impide verificar su integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahm22004/kaomnique
- Modelo base Kandinsky: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers
- Codificador de texto externo: https://huggingface.co/ggml-org/Qwen2.5-Omni-3B-GGUF
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-Omni-3B/blob/f75b40e3da2003cdd6e1829b1f420ca70797c34e/LICENSE
- Paper referenciado (arXiv:2610.05608): https://arxiv.org/abs/2610.05608
- Paper referenciado (arXiv:2503.20215): https://arxiv.org/abs/2503.20215
