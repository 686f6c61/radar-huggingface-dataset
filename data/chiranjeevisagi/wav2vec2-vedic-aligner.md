# chiranjeevisagi/wav2vec2-vedic-aligner

## Resumen

El modelo `chiranjeevisagi/wav2vec2-vedic-aligner` es un fine-tuning del checkpoint `addy88/wav2vec2-sanskrit-stt` (un Wav2Vec2 entrenado para reconocimiento de voz en sánscrito) sobre el corpus Vedavani, compuesto por 43,5 horas de sánscrito cantado (recitación védica). Su propósito no es el reconocimiento automático de voz general, sino el **forced alignment** (alineación forzada) de una transcripción conocida en devanagari sobre una grabación de recitación, así como servir de base para medir la pronunciación mediante Goodness-of-Pronunciation (GOP). El modelo está pensado como componente de una aplicación de evaluación de canto védico.

Con 94,4 millones de parámetros y un tamaño de repositorio de 0,4 GB, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en que aborda una tarea muy específica —la alineación temporal de sílabas en recitación védica— para la que los modelos ASR genéricos no están optimizados. El autor documenta dos particularidades críticas: el token blank de CTC es `<s>` (id 0) en lugar de `<pad>`, y se aplicó aumento de velocidad (speed perturbation) entre 0,85x y 1,25x para que los límites de sílabas se mantengan estables a distintas velocidades de recitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer encoder con CTC) |
| Parametros totales | 94.423.235 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (clips limitados a 16 s durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sa (sánscrito) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Wav2Vec2, un encoder transformer preentrenado de forma autosupervisada sobre audio crudo, adaptado aquí para clasificación temporal mediante CTC. El checkpoint base `addy88/wav2vec2-sanskrit-stt` ya estaba entrenado para reconocimiento de voz en sánscrito; este fine-tuning lo especializa en recitación védica cantada.

El entrenamiento se realizó durante 12 épocas con una tasa de aprendizaje de 1e-4 (lineal con 500 pasos de calentamiento), tamaño de lote efectivo de 24, precisión fp16, encoder de características congelado, reducción de pérdida CTC con `ctc_loss_reduction="mean"` y clips limitados a 16 segundos. Se aplicó aumento de velocidad mediante remuestreo entre 0,85x y 1,25x, lo que resultó crucial para que los límites de sílabas se mantuvieran correctos a velocidades superiores a 1,06x. El vocabulario se reutilizó íntegramente del checkpoint base (67 tokens, sin reconstrucción). Una peculiaridad heredada es que el token blank de CTC es `<s>` (id 0), no `<pad>`, a pesar de que la configuración nombre a `<pad>` como blank nominal.

## Capacidades

- **Alineación forzada (forced alignment)**: dado un audio de recitación védica y su transcripción en devanagari, produce los límites temporales de cada token/sílaba usando `torchaudio.functional.forced_align` sobre las emisiones CTC.
- **Evaluación de pronunciación**: las posteriores del modelo se utilizan para calcular Goodness-of-Pronunciation (GOP), permitiendo detectar errores de articulación en sílabas concretas.
- **Reconocimiento de voz en sánscrito cantado**: aunque no es su propósito principal, el modelo puede transcribir recitaciones védicas con una CER notablemente baja en el dominio de canto (0,084 en el test de Vedavani).
- **Robustez a variaciones de velocidad**: gracias al aumento de velocidad, mantiene límites de sílabas estables en un rango de 0,85x a 1,25x.
- **Compatibilidad con el ecosistema Hugging Face**: se carga con `Wav2Vec2ForCTC` y `Wav2Vec2Processor`, y es compatible con endpoints de inferencia.

## Casos de uso

- **Aplicación de evaluación de canto védico**: el modelo es el núcleo de una app que mide el ritmo y la pronunciación de recitaciones. Se alinean las sílabas con `torchaudio.forced_align` y se calcula GOP sobre las posteriores para dar retroalimentación al estudiante.
- **Análisis fonético de recitaciones**: investigadores en filología sánscrita pueden alinear automáticamente grabaciones históricas con sus transcripciones para estudiar variaciones dialectales o de entonación.
- **Corrección de pronunciación en entornos educativos**: profesores de sánscrito pueden usar el modelo para detectar sílabas mal articuladas en estudiantes, comparando la alineación con la transcripción esperada.
- **Generación de subtítulos o anotaciones temporales**: para vídeos de recitaciones védicas, el modelo puede producir marcas de tiempo por sílaba, facilitando la navegación y el estudio.
- **Investigación en procesamiento de habla cantada**: sirve como punto de partida para experimentos sobre alineación en habla melódica o recitación rítmica, dado su buen rendimiento en ese dominio.
- **Sistema de retroalimentación en tiempo real**: al ser ligero (94M parámetros), puede integrarse en aplicaciones móviles o web para dar feedback inmediato durante la práctica de recitación.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados comparando el modelo base (`addy88/wav2vec2-sanskrit-stt`) con este fine-tuning:

| Metrica | Base | Este modelo |
|---|---|---|
| CER en test de Vedavani (held-out) | 0,537 | **0,084** |
| CER en grabación de profesor (held-out) | 0,191 | **0,064** |
| Sílabas mal reconocidas en una recitación correcta | 8,6 % | **1,7 %** |

Estos datos indican una mejora sustancial en el dominio específico del canto védico, aunque no se han publicado resultados en benchmarks estándar como MMLU o HumanEval (no aplicables a un modelo de audio).

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 94M parámetros (0,4 GB en safetensors), la inferencia requiere menos de 1 GB de VRAM en fp32, y significativamente menos con cuantización (aunque no se han publicado cuantizaciones oficiales).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas consumer como GTX 1060, RTX 2060 o superiores pueden ejecutarlo sin problemas. También es viable en CPU para inferencia por lotes pequeña.
- **Compatibilidad con consumer GPUs**: sí, es un modelo muy ligero que cabe en cualquier GPU moderna.
- **Opciones de despliegue**: se puede usar directamente con `transformers` y `torchaudio` en Python. Para producción, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como vLLM (aunque no es el caso típico para modelos de audio). También es posible exportarlo a ONNX para optimización.
- **Latencia y throughput**: no se han publicado mediciones específicas, pero dado el tamaño, la latencia por clip de 16 s debería ser del orden de decenas de milisegundos en GPU y de unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chiranjeevisagi/wav2vec2-vedic-aligner` | 94,4M | no disponible | Canto védico (sánscrito) | Apache-2.0 | Hugging Face |
| `addy88/wav2vec2-sanskrit-stt` (base) | 94,4M (estimado) | no disponible | Sánscrito general (STT) | Apache-2.0 | Hugging Face |
| Otros modelos de forced alignment (p.ej. `torchaudio.pipelines.Wav2Vec2FABundle`) | varía | no disponible | Inglés y otros idiomas | según modelo | TorchAudio |

La comparación directa más relevante es con el modelo base: este fine-tuning reduce la CER en canto védico de 0,537 a 0,084, a costa de especializarse en ese dominio. No se dispone de comparaciones con otros modelos de alineación para sánscrito.

## Limitaciones y advertencias

- **No es un ASR general**: está entrenado específicamente para recitación védica; su rendimiento en sánscrito hablado normal o en otros idiomas será pobre.
- **Blank CTC atípico**: el token blank es `<s>` (id 0), no `<pad>`. Si se usa `processor.batch_decode` sin ajuste, aparecerán literales `<s>` en las hipótesis. Es necesario pasar `blank=0` a `torchaudio.forced_align` y filtrar manualmente.
- **Dependencia de la velocidad**: aunque se aplicó aumento de velocidad, el modelo fue entrenado con clips de un solo verso a un tempo; velocidades extremas fuera del rango 0,85-1,25x pueden degradar la alineación.
- **Sesgos del corpus**: Vedavani contiene un tipo específico de recitación (versos individuales); variaciones regionales, estilos o entonaciones diferentes pueden no estar bien representadas.
- **Riesgo de alucinación**: como modelo CTC, puede producir inserciones o sustituciones en audio ruidoso o con solapamiento, aunque la CER en el dominio es baja.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución. No hay restricciones adicionales conocidas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chiranjeevisagi/wav2vec2-vedic-aligner)
- [Modelo base `addy88/wav2vec2-sanskrit-stt`](https://huggingface.co/addy88/wav2vec2-sanskrit-stt)
- [Tutorial de forced alignment con Wav2Vec2 (TorchAudio)](https://docs.pytorch.org/audio/2.8/tutorials/forced_alignment_tutorial.html)
- [Documentación de Wav2Vec2 en Hugging Face](https://huggingface.co/docs/transformers/v4.40.2/model_doc/wav2vec2)
