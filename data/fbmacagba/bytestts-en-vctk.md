# fbmacagba/bytestts-en-vctk

## Resumen

BytesTTS voice: en-vctk es un modelo de síntesis de voz (text-to-speech) multihablante en inglés británico, publicado por el usuario fbmacagba como parte del proyecto BytesTTS. No se trata de un modelo entrenado desde cero, sino de una conversión a formato ONNX del checkpoint `tts_models/en/vctk/vits` de Coqui TTS, que a su vez es una implementación VITS entrenada sobre el corpus CSTR VCTK (versión 0.92) de la Universidad de Edimburgo. El repositorio ocupa aproximadamente 0,1 GB y el peso principal (`model.onnx`) son 121.426.686 bytes.

El modelo resuelve el problema de disponer de una voz TTS multihablante en inglés con acentos del Reino Unido (Inglaterra, Escocia, Irlanda del Norte y Gales) en un formato portable y verificable, sin dependencia de PyTorch en tiempo de inferencia. Incluye 109 hablantes identificados por sus IDs de VCTK (`p225` a `p376`) más una entrada especial `ED`, y diez hablantes destacados en la documentación. La frecuencia de muestreo de salida es de 22.050 Hz en mono.

Su relevancia actual radica en la portabilidad: al estar exportado a ONNX y acompañado de un manifiesto `voice.json` con verificación SHA-256 de cada fichero, se puede integrar en pipelines ligeros y auditar la procedencia de los pesos. La conversión se validó contra la implementación original de Coqui con una relación señal-error de al menos 60 dB para el port en PyTorch y de al menos 50 dB para el modelo ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible (peso ONNX de 121.426.686 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto/fonemas) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX de precisión original) |
| Idiomas soportados | en (inglés, con acentos del Reino Unido y otros en el corpus) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), más `config.json`, `speakers.json` y `voice.json` |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo end-to-end de síntesis de voz que combina un codificador de texto basado en fonemas, un prior variacional condicionado por texto, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, según el paper arXiv:2106.06103. La entrada es texto convertido a fonemas mediante espeak-ng (versión 1.52.0 requerida), y la salida es audio a 22.050 Hz en mono.

El entrenamiento original corresponde a Coqui TTS sobre el CSTR VCTK Corpus versión 0.92, un corpus multihablante de inglés con 109 hablantes y etiquetas de acento y región en `speaker-info.txt`. Este repositorio no reentrena: convierte el checkpoint `tts_models--en--vctk--vits.zip` de la release `v0.6.1_models` de Coqui (SHA-256 `ad753e5200614907627495b6177a08d755df1dbbde30eb6e31264caa2a3f3eaa`) a ONNX. El proceso de conversión se realizó en un sandbox aislado sin red, tras un escaneo de pickle y con `torch.load(weights_only=True)`; cada peso se validó contra un port en PyTorch de VITS y se exportó a ONNX desde safetensors. La verificación incluyó comparación de duraciones idénticas y relación señal-error de al menos 60 dB frente a Coqui y de al menos 50 dB frente al port.

## Capacidades

- Síntesis de voz multihablante en inglés con 109 hablantes seleccionables por ID (`speaker=` o `--speaker`).
- Diez hablantes destacados con acentos del Reino Unido: `p228` (F, sur de Inglaterra, por defecto), `p232` (M, sur de Inglaterra), `p229` (F, sur de Inglaterra), `p243` (M, Londres), `p244` (F, Mánchester), `p287` (M, York), `p262` (F, Edimburgo), `p247` (M, Argyll), `p304` (M, Belfast) y `p253` (F, Cardiff).
- Otros hablantes del corpus con acentos estadounidense, canadiense, irlandés, indio, sudafricano, australiano o neozelandés, según las etiquetas de VCTK.
- Entrada basada en fonemas: requiere espeak-ng 1.52.0 para la conversión de texto a fonemas.
- Salida de audio WAV a 22.050 Hz mono.
- Carga desde directorio local con `BytesTTS.load_path(directory)` y verificación de integridad SHA-256 contra `voice.json`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Generación de locuciones para audiolibros y contenido editorial: el modelo permite elegir entre 109 voces y alternar hablantes por ID para narrar diálogos con voces distintas, con acentos británicos variados y salida a 22.050 Hz adecuada para publicación.
- Prototipado de asistentes de voz en inglés británico: al ser ONNX y ligero (0,1 GB de repo), se puede desplegar en entornos sin PyTorch y probar rápidamente la calidad de la voz antes de invertir en un modelo mayor.
- Accesibilidad y lectura de textos: integración en aplicaciones que conviertan documentos o pantallas en audio para usuarios con discapacidad visual, eligiendo el hablante más adecuado por acento y género.
- Pruebas de regresión en pipelines TTS: la verificación SHA-256 y la comparación con Coqui (≥60 dB y ≥50 dB de relación señal-error) permiten usar el modelo como referencia reproducible en tests de integración de sistemas de voz.
- Generación de voces para vídeos y demos de producto: la CLI `bytestts say` con `--voice en-vctk` y `--speaker` facilita producir clips de voz en lote para material de marketing o documentación.
- Investigación en conversión de formato y portabilidad: sirve como caso de estudio de exportación de VITS a ONNX con validación numérica frente al original, útil para quienes necesiten replicar el proceso con otros checkpoints de Coqui.
- Sistemas embebidos y edge: el tamaño reducido del modelo ONNX y la ausencia de dependencia de PyTorch facilitan su ejecución en dispositivos con recursos limitados, siempre que se disponga de espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la conversión: duraciones idénticas y relación señal-error de al menos 60 dB entre el port en PyTorch y Coqui TTS para el hablante `p280`, y de al menos 50 dB entre el modelo ONNX y el port.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el peso ONNX es de 121,4 MB, por lo que la huella de memoria es reducida y cabe en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente, y la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, dado el tamaño del modelo (0,1 GB de repositorio).
- Opciones de despliegue: ONNX Runtime a través de la librería BytesTTS (`pip install "bytestts @ git+https://github.com/jared0565/bytesTTS"`), carga desde directorio con `BytesTTS.load_path`; requiere espeak-ng 1.52.0.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BytesTTS en-vctk (este modelo) | no disponible (ONNX de 121,4 MB) | no aplica | no disponible (solo métricas de fidelidad de conversión) | Apache-2.0 | Hugging Face, ONNX |
| Coqui TTS `tts_models/en/vctk/vits` | no disponible | no aplica | referencia original del que deriva este modelo | Apache-2.0 | Coqui TTS release v0.6.1_models |
| VITS original (paper arXiv:2106.06103) | no disponible | no aplica | no disponible | no disponible | paper y repositorio de referencia |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Requiere espeak-ng 1.52.0 para la conversión de texto a fonemas; sin esta dependencia el modelo no funciona.
- El modelo habla con las voces de personas reales del corpus VCTK; la model card prohíbe explícitamente su uso para suplantar a esas personas o engañar.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí de pronunciación incorrecta o prosodia anómala en textos fuera del dominio del corpus.
- El hablante `ED` no es un ID de VCTK: corresponde a la fila 0 de la tabla de hablantes de Coqui, con acento desconocido.
- La licencia Apache-2.0 cubre el modelo, pero los datos de entrenamiento (VCTK 0.92) están bajo CC BY 4.0 y exigen mantener la atribución indicada en la model card al usar o redistribuir la voz.
- El repositorio no contiene las grabaciones del corpus; solo los pesos convertidos.
- No se documentan garantías de calidad para uso comercial en producción más allá de la licencia; la conversión no fue reentrenada, por lo que hereda las limitaciones del checkpoint original de Coqui.
- BytesTTS no está afiliado ni respaldado por Coqui, la Universidad de Edimburgo ni los autores de VCTK.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbmacagba/bytestts-en-vctk
- Repositorio BytesTTS: https://github.com/jared0565/bytesTTS
- Guía de instalación de espeak-ng: https://github.com/jared0565/bytesTTS/blob/main/docs/knowledge-base/espeak-ng.md
- Paper VITS: https://arxiv.org/abs/2106.06103
- CSTR VCTK Corpus versión 0.92: https://doi.org/10.7488/ds/2645
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Proyecto espeak-ng: https://github.com/espeak-ng/espeak-ng
