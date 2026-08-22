# Astora1mx/whisper-small-quran-asr-source

## Resumen

El modelo `Astora1mx/whisper-small-quran-asr-source` es un repositorio espejo del checkpoint `basharalrfooh/whisper-small-quran`, un fine-tune del sistema de reconocimiento automático del habla (ASR) Whisper-small de OpenAI, especializado en la transcripción de recitaciones del Corán en árabe. El autor, Astora1mx, publica este espejo con el único propósito de proporcionar metadatos explícitos de `automatic-speech-recognition` para facilitar la conversión a ONNX, manteniendo intactos los pesos, la licencia y la atribución del modelo original.

El modelo resuelve el problema de transcribir con precisión la recitación coránica (tanto en narración Hafs como Warsh, según la configuración del upstream) a texto árabe escrito, una tarea que presenta dificultades específicas por la fonética, las pausas y las variantes de recitación. Al estar basado en Whisper-small (244 millones de parámetros), ofrece un equilibrio entre precisión y requisitos computacionales moderados, con una ventana de contexto de 448 segundos de audio (448 tokens de 30 segundos). Su relevancia actual radica en que proporciona un punto de partida listo para ONNX y para integraciones en entornos de producción que requieran ASR coránico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 244 millones (estimado, basado en Whisper-small) |
| Parametros activos | no disponible |
| Longitud de contexto | 32 segundos de audio (448 tokens de 30 ms) |
| Tipos de cuantizacion | no disponible (repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos del checkpoint original) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper-small, un transformer encoder-decoder con atención estándar, preentrenado por OpenAI sobre 680 000 horas de audio multilingüe con supervisión débil. El fine-tune se realizó sobre el modelo `basharalrfooh/whisper-small-quran`, que a su vez fue ajustado con datos de recitaciones coránicas, probablemente el dataset `everyayah` u otro corpus especializado, aunque el autor no detalla el número exacto de tokens de entrenamiento ni la composición del dataset. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre pares audio-texto. La innovación técnica del upstream se limita al fine-tune específico del dominio, sin modificar la arquitectura base.

## Capacidades

- Transcripción de audio en árabe, especializada en recitaciones del Corán.
- Reconocimiento de habla con múltiples recitadores y estilos de recitación (Hafs, Warsh, etc.) según la configuración del modelo original.
- Generación de texto en árabe escrito con diacríticos (tashkeel), útil para textos coránicos.
- Soporte de entrada de audio de hasta 32 segundos por fragmento; para audio más largo se requiere segmentación.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente ASR.
- Capacidades multilingües limitadas al árabe; no se garantiza el funcionamiento en otros idiomas tras el fine-tune.

## Casos de uso

- **Transcripción de recitaciones coránicas para bibliotecas digitales**: el modelo permite convertir archivos de audio de recitaciones (en formatos como MP3, WAV) en texto árabe estructurado, facilitando la indexación y búsqueda de versículos. Es adecuado porque la ventana de 32 segundos cubre la mayoría de los versículos completos y el fine-tune mejora la precisión fonética sobre la recitación.
- **Aplicaciones de aprendizaje del Corán**: integrar el modelo en una app móvil o web para que los estudiantes puedan recitar un versículo y recibir la transcripción inmediata, ayudando a verificar la pronunciación. Su tamaño pequeño (244 M parámetros) permite ejecutarlo en dispositivos con GPU modesta.
- **Generación de subtítulos para vídeos de sermones o lecciones coránicas**: al transcribir audio de conferencias que incluyen citas coránicas, el modelo puede producir subtítulos en árabe para plataformas como YouTube, con la ventaja de que el fine-tune reconoce mejor las pausas y entonación propias del Corán.
- **Análisis lingüístico y de recitación**: investigadores pueden usar el modelo para transcribir corpus de recitaciones de múltiples recitadores y comparar variaciones de pronunciación, facilitando estudios de fonética y dialectología coránica.
- **Integración en pipelines de ASR para mezquitas o centros islámicos**: el modelo puede integrarse en sistemas de transcripción en tiempo real o diferido para clases de Corán, donde se necesita alta precisión en la transcripción de versículos específicos.
- **Conversión a ONNX para despliegue en edge**: el repositorio espejo está pensado para exportar el modelo a ONNX, lo que permite desplegarlo en dispositivos con recursos limitados (Raspberry Pi, CPUs con optimización) para aplicaciones de transcripción offline en bibliotecas o museos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card del upstream no incluye métricas como WER o CER sobre conjuntos de evaluación coránicos, ni comparaciones con otros modelos. Por tanto, no se puede cuantificar su rendimiento objetivo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 244 M parámetros. En fp32 necesita ~1 GB de VRAM, en fp16 ~0,5 GB. Para batch de 1 y audio de 30 s, cabe en cualquier GPU moderna.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). Para producción con alto throughput, una RTX 4090 o A100 no es necesaria; basta con una T4 en la nube.
- **Cabe en GPU de consumo**: sí, en prácticamente todas las GPUs de consumo actuales, incluso en tarjetas integradas de bajo perfil si se usa cuantización INT8 (aunque no se proporciona el checkpoint cuantizado).
- **Opciones de despliegue**: compatible con `transformers` de Hugging Face, `faster-whisper` (CTranslate2), `whisper.cpp` (GGUF, si se convierte), y `vLLM` (aunque vLLM no soporta Whisper directamente; mejor usar TGI con soporte ASR). Para ONNX, se puede usar `onnxruntime`.
- **Latencia y throughput estimados**: no disponible; dependerá del hardware. En una RTX 4090, Whisper-small procesa audio en tiempo real (menos de 1 s por 30 s de audio) en fp16, con un throughput de ~30× tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Astora1mx/whisper-small-quran-asr-source` | 244 M | 32 s | árabe | MIT | Hugging Face (safetensors) |
| `openai/whisper-small` | 244 M | 32 s | multilingüe (99 idiomas) | MIT | Hugging Face |
| `Naazimsnh02/whisper-large-v3-turbo-ar-quran` | 809 M (large-v3-turbo) | 32 s | árabe | Apache 2.0 | GitHub/Hugging Face |

El modelo `whisper-large-v3-turbo-ar-quran` es un fine-tune de Whisper Large v3 Turbo sobre el dataset `everyayah`, ofreciendo mayor precisión pero con el triple de parámetros (809 M) y mayor consumo de VRAM (~2-3 GB en fp16). La comparación de rendimiento exacto no está disponible por falta de benchmarks públicos.

## Limitaciones y advertencias

- **Sesgos y dominio**: el modelo está especializado en recitaciones coránicas y puede degradarse en otros tipos de habla árabe (conversaciones, noticias, etc.). No se recomienda su uso general.
- **Riesgo de alucinación**: al ser un modelo ASR, puede producir transcripciones incorrectas en audio con ruido, solapamiento de voces o pronunciación no estándar; no hay garantía de fidelidad textual para versículos largos.
- **Limitaciones de contexto**: la ventana de 32 segundos por fragmento obliga a segmentar audio más largo; el modelo no mantiene contexto entre segmentos, lo que puede romper la continuidad de versículos largos.
- **Idioma**: solo soporta árabe; no se garantiza el funcionamiento en otros idiomas.
- **Restricciones de licencia**: licencia MIT, permite uso comercial libre, pero la atribución del modelo original (basharalrfooh/whisper-small-quran) debe mantenerse según los términos del upstream. No hay restricciones adicionales.
- **Caveat de producción**: el repositorio es un espejo para conversión ONNX; no se proporcionan cuantizaciones GGUF ni optimizaciones de CTranslate2, por lo que para despliegue eficiente en CPU se requiere conversión manual.

## Enlaces

- [Repositorio HuggingFace del modelo (Astora1mx)](https://huggingface.co/Astora1mx/whisper-small-quran-asr-source)
- [Modelo upstream: basharalrfooh/whisper-small-quran](https://huggingface.co/basharalrfooh/whisper-small-quran)
- [Space de demo: whisper-small-quran](https://huggingface.co/spaces/Haitam03/whisper-small-quran)
- [Proyecto QuranWhisper (GitHub)](https://github.com/aHishamm/QuranWhisper)
- [whisper-large-v3-turbo-ar-quran (GitHub)](https://github.com/Naazimsnh02/whisper-large-v3-turbo-ar-quran)
