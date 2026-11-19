# PaulChana/divider-models

## Resumen

Divider models es una colección de pesos convertidos a ONNX y GGML para separación de fuentes musicales (stem separation), empaquetados por PaulChana para su uso en Divider, una aplicación de escritorio de separación de pistas. El repositorio no contiene modelos entrenados por el autor: cada carpeta aloja la conversión de pesos publicados por terceros (Demucs, Spleeter, Open-Unmix y Mel-Band RoFormer) junto con la licencia específica que los rige.

El paquete cubre cuatro arquitecturas distintas de separación: Hybrid Transformer Demucs en variante de 6 pistas, Spleeter de 5 pistas, Open-Unmix UMX-HQ de 4 pistas y un modelo vocal Mel-Band RoFormer de 2 pistas. Todos operan sobre audio estéreo a 44,1 kHz y se distribuyen como grafos ONNX (o binario GGML en el caso de Demucs), lo que permite inferencia sin dependencia del framework original de PyTorch.

Su relevancia práctica es doble: por un lado, ofrece en un único repositorio un conjunto de separadores con calidades y licencias heterogéneas, lo que simplifica la evaluación comparativa; por otro, la conversión a ONNX facilita el despliegue en entornos nativos o embebidos. El tamaño total del repositorio es de 0,7 GB y el modelo no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Hybrid Transformer Demucs, Spleeter (U-Net sobre STFT), Open-Unmix (BLSTM sobre STFT), Mel-Band RoFormer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos: 512 frames en Spleeter, chunks de 8 s en Mel-Band RoFormer) |
| Tipos de cuantización | Pesos almacenados en float16, ejecución en float32; sin cuantizaciones adicionales publicadas |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Por modelo: Demucs solo investigación; Spleeter MIT; Open-Unmix MIT; Mel-Band RoFormer MIT |
| Formato de pesos | ONNX (Spleeter, Open-Unmix, Mel-Band RoFormer) y GGML binario float16 (Demucs) |
| Frecuencia de muestreo | 44,1 kHz, estéreo |
| Pipeline | audio-to-audio |

## Arquitectura y entrenamiento

El repositorio no entrena ni ajusta ningún modelo: todas las entradas son conversiones de pesos ya publicados. Cada submodelo responde a una arquitectura diferente. `htdemucs_6s` es un Hybrid Transformer Demucs, que combina un encoder-decoder convolucional con atención Transformer sobre el dominio de la forma de onda y el espectrograma, en su variante de 6 pistas. `spleeter_5stems` es una U-Net que opera sobre la magnitud STFT (n_fft 4096, hop 1024, primeras 1536 bins) en segmentos de 512 frames y produce máscaras de ratio por pista. `umxhq` es Open-Unmix, una red BLSTM sobre magnitud STFT (n_fft 4096, hop 1024, 2049 bins) con refinado mediante una iteración del filtro de Wiener. `mel_band_roformer_vocals` es un Mel-Band RoFormer que procesa STFT compleja (n_fft 2048, hop 441) en chunks de 8 segundos y devuelve una máscara vocal compleja; el instrumental se obtiene por resta.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición de los datasets ni si hubo etapas de refinamiento por preferencias, ya que el autor del repositorio solo documenta el proceso de conversión. La innovación técnica del paquete reside en la propia conversión: los pesos se almacenan en float16 y se ejecutan en float32, y los STFT se calculan con padding reflectante y ventana Hann periódica para replicar el comportamiento de `torch.stft`, garantizando que las máscaras generadas en ONNX coincidan con las del framework original.

## Capacidades

- Separación de fuentes musicales en pistas (stems) a partir de una mezcla estéreo.
- Demucs 6 pistas: drums, bass, vocals, guitar, piano y other.
- Spleeter 5 pistas: vocals, piano, drums, bass y other.
- Open-Unmix UMX-HQ 4 pistas: vocals, drums, bass y other, con refinado por filtro de Wiener.
- Mel-Band RoFormer: separación vocal/instrumental en dos pistas.
- Procesamiento de audio estéreo a 44,1 kHz con STFT compatible con `torch.stft`.
- Inferencia mediante ONNX Runtime o demucs.cpp, sin dependencia de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso

- Producción musical y remezclas: extraer la pista vocal o la batería de una mezcla para reutilizarlas en un proyecto DAW, usando `mel_band_roformer_vocals` para voces o `htdemucs_6s` cuando se necesitan seis pistas separadas.
- Karaoke automatizado: generar una versión instrumental restando la máscara vocal compleja que produce Mel-Band RoFormer, con calidad adecuada para uso doméstico o demos.
- Limpieza de samples para bibliotecas: aislar drums y bass de grabaciones antiguas con Spleeter u Open-Unmix, cuyas licencias MIT permiten uso comercial sin restricciones adicionales.
- Transcripción asistida: separar la pista vocal antes de pasarla a un sistema de reconocimiento de voz o de transcripción musical, reduciendo la interferencia de la instrumentación.
- Educación musical: aislar pistas individuales (piano, guitarra) con `htdemucs_6s` para estudiar arreglos, siempre que el uso sea de investigación dado el régimen de licencia de los pesos de Demucs.
- Investigación en separación de fuentes: comparar cuatro arquitecturas sobre el mismo audio de entrada, aprovechando que todas comparten formato de 44,1 kHz estéreo y están empaquetadas en un único repositorio.
- Aplicaciones de escritorio: integrar los grafos ONNX en herramientas nativas tipo Divider, donde el runtime ONNX evita arrastrar PyTorch y reduce el tamaño del instalador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,7 GB, por lo que la inferencia de un solo submodelo cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime o CUDA; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con 4-8 GB de VRAM, dado el tamaño de los pesos en float16; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime para los tres modelos ONNX; demucs.cpp para el binario GGML de Demucs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Pistas | Formato | Licencia de pesos | Contexto de audio |
|---|---|---|---|---|
| Divider models (htdemucs_6s) | 6 | GGML f16 | Solo investigación | Segmentos, no especificado |
| Divider models (Spleeter 5stems) | 5 | ONNX | MIT | 512 frames |
| Divider models (UMX-HQ) | 4 | ONNX | MIT | frames variable |
| Divider models (Mel-Band RoFormer) | 2 | ONNX | MIT | chunks de 8 s |

No se dispone de datos de rendimiento comparativo (SDR, SI-SNR) en la información proporcionada para contrastar con alternativas.

## Limitaciones y advertencias

- La licencia de los pesos de Demucs (`htdemucs_6s`) es solo para uso científico; no está cubierta por la MIT del código y no puede emplearse en productos comerciales sin autorización.
- Las licencias son heterogéneas por carpeta: es obligatorio revisar el archivo `LICENSE` de cada submodelo antes de desplegarlo.
- No hay información sobre sesgos, aunque en separación de fuentes es habitual un peor rendimiento en géneros poco representados en los datasets de entrenamiento.
- Riesgo de artefactos y sangrado entre pistas (bleed) en mezclas densas o con instrumentación atípica; no cuantificado en la documentación.
- Los modelos procesan segmentos o chunks (512 frames, 8 s), por lo que la gestión de audio largo requiere segmentación y solapamiento manual.
- No se especifican requisitos de latencia niThroughput, lo que impide garantizar uso en tiempo real.
- El repositorio no registra descargas ni validación de la comunidad; la calidad de las conversiones no está verificada de forma independiente en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PaulChana/divider-models
- Licencias del repositorio: https://huggingface.co/PaulChana/divider-models/blob/main/README.md
- Demucs (facebookresearch): https://github.com/facebookresearch/demucs
- Aclaración de licencia de pesos de Demucs: https://github.com/facebookresearch/demucs/issues/327
- demucs.cpp: https://github.com/sevagh/demucs.cpp
- Spleeter (paper JOSS): https://joss.theoj.org/papers/10.21105/joss.02154
- Open-Unmix: https://github.com/sigsep/open-unmix-pytorch
- Mel-Band RoFormer (pesos): https://huggingface.co/KimberleyJSN/melbandroformer
- Music-Source-Separation-Training: https://github.com/ZFTurbo/Music-Source-Separation-Training
- BS-RoFormer: https://github.com/lucidrains/BS-RoFormer
