# lEtoileNoir/Hausa_English_Direct_S2TT

## Resumen

El modelo `lEtoileNoir/Hausa_English_Direct_S2TT` es un sistema de traducción directa de voz a texto (speech-to-text translation, S2TT) que convierte audio en lengua hausa en texto en inglés sin pasar por un sistema intermedio de reconocimiento de voz ni de traducción automática por separado. Desarrollado por el usuario lEtoileNoir, se presenta como un "campeón de desarrollo C1" dentro de un proyecto de investigación sobre traducción de lenguas africanas de bajos recursos. Está construido sobre la arquitectura `SpeechEncoderDecoderModel` de Transformers, combinando un encoder XLS-R (concretamente `facebook/wav2vec2-xls-r-300m-21-to-en`) con un decoder mBART en inglés, con atención cruzada interna.

El modelo cuenta con 792.989.312 parámetros y se distribuye bajo licencia Apache-2.0. Está entrenado sobre el dataset `McGill-NLP/NaijaS2ST`, un corpus de habla y traducciones para lenguas nigerianas. Su propósito declarado es servir como reemplazo de una celda piloto basada en Whisper dentro del repositorio `tsuxalo/Spoken-Language-Translation-Model`, pero no es un adaptador compatible con Whisper. Se enfatiza que es una versión exclusivamente para investigación, diagnóstico y reproducibilidad, y que no debe usarse en aplicaciones médicas, legales, críticas o sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechEncoderDecoderModel (encoder XLS-R + decoder mBART con atención cruzada) |
| Parametros totales | 792.989.312 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrada de audio, no texto) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | hausa (ha) como entrada, ingles (en) como salida |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura encoder-decoder estándar de Transformers. El encoder es `facebook/wav2vec2-xls-r-300m-21-to-en`, un modelo preentrenado de reconocimiento de voz multilingüe de 300 millones de parámetros, que procesa la forma de onda de audio muestreada a 16 kHz. El decoder es un modelo mBART en inglés, que genera el texto traducido. Entre ambos existe un mecanismo de atención cruzada interna, de modo que el sistema funciona como un único modelo integral sin depender de módulos externos de ASR o MT.

El entrenamiento se realizó sobre el dataset `McGill-NLP/NaijaS2ST`, que contiene pares de audio en lenguas nigerianas con sus traducciones al inglés. La model card no especifica el número exacto de tokens de entrenamiento ni la composición detallada del dataset, pero indica que el conjunto de validación interno utilizado para el desarrollo consta de 1.037 ejemplos extraídos del split de entrenamiento de NaijaS2ST. No se menciona el uso de RLHF ni DPO; el ajuste parece ser supervisado clásico. La versión C1 introdujo un cambio en la decodificación (`no_repeat_ngram_size=3`) sobre los pesos congelados de una revisión anterior, sin añadir pesos entrenados adicionales.

## Capacidades

- Traducción directa de voz hausa a texto inglés en un solo paso, sin ASR intermedio.
- Generación de texto con decodificación por haz (beam search) de 5 haces, con penalización de repetición de n-gramas (tamaño 3) para reducir salidas repetitivas.
- Soporte de entrada de audio a 16 kHz, con remuestreo automático necesario si el audio original tiene otra tasa de muestreo.
- Capacidad de procesamiento por lotes (batch) mediante la API estándar de Transformers.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso; es un modelo puramente de traducción de voz.
- Multilingüe limitado: solo hausa a inglés; no admite otros idiomas de entrada ni de salida.
- Sin modo de pensamiento (thinking mode) ni capacidades de visión o audio adicionales más allá de la entrada de voz.

## Casos de uso

- Investigación académica en traducción de voz para lenguas africanas de bajos recursos: el modelo permite estudiar el comportamiento de arquitecturas encoder-decoder preentrenadas en un par de idiomas poco representado, y sirve como punto de partida para experimentos de mejora.
- Desarrollo de prototipos de subtitulado automático para contenido en hausa: dado que genera texto en inglés a partir de audio, puede integrarse en pipelines de transcripción y traducción para vídeos o podcasts, aunque requiere supervisión humana debido a sus limitaciones de precisión.
- Evaluación comparativa de modelos de traducción directa frente a pipelines de ASR + MT: al ser un sistema monolítico, permite aislar el impacto de la arquitectura directa frente a enfoques modulares.
- Diagnóstico de errores en traducción de habla para lenguas tonales: el modelo muestra debilidades conocidas en nombres, números, fechas y negación, lo que lo convierte en un caso de estudio útil para identificar patrones de error en sistemas S2TT.
- Reproducibilidad de resultados en entornos de investigación: al publicarse con hashes SHA-256 de todos los artefactos y una configuración de generación fija, puede usarse como referencia reproducible en papers.
- Integración en repositorios de código abierto de traducción de voz, como el proyecto `Spoken-Language-Translation-Model`, donde se propone como reemplazo de la celda piloto basada en Whisper, siempre que se respete su naturaleza de investigación.

## Benchmarks y rendimiento

La model card reporta resultados sobre un conjunto de validación interno de 1.037 ejemplos (derivado del split de entrenamiento de NaijaS2ST). Estos resultados no constituyen evidencia de generalización independiente, ya que influyeron en el desarrollo del modelo. Se presentan las métricas de la versión C1 frente a una línea base (baseline) con intervalos de confianza del 95% para la diferencia pareada.

| Metrica | C1 | Baseline | Diferencia C1 - baseline (IC 95%) |
|---|---:|---:|---:|
| chrF++ | 16.6682 | 16.2896 | +0.2412 a +0.5316 |
| SacreBLEU | 0.4992 | 0.5008 | -0.1040 a +0.0600 |
| SSA-COMET | 0.2101 | 0.1885 | +0.01745 a +0.02548 |

Además, se reportan métricas de diversidad: 0% de repetición dentro de la salida, 3.95% de reutilización de respuestas genéricas, 72.32% de salidas únicas brutas y 100% de salidas únicas ajustadas por referencia. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, dado que el modelo no es de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 792 millones de parámetros en precisión fp32, se necesitan aproximadamente 3.2 GB solo para los pesos (según el tamaño del repositorio). En fp16, la VRAM requerida sería de unos 1.6 GB, más el overhead de activaciones y el procesamiento de audio.
- GPU recomendadas: una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) puede ejecutar el modelo en fp16. Para mayor comodidad y velocidad, se recomienda una RTX 3060 o superior. En entornos de producción, una A100 o H100 sería excesiva pero viable.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o una RTX 4090 pueden manejar el modelo sin problemas, incluso con lotes pequeños.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con Hugging Face Inference Endpoints, vLLM (aunque vLLM está más orientado a modelos de lenguaje, no a encoder-decoder de voz), o mediante un script Python con FastAPI. También puede usarse con la biblioteca `transformers` directamente en CPU, aunque la inferencia será más lenta.
- Latencia y throughput estimados: no se proporcionan datos oficiales. En una GPU moderna, la inferencia sobre un audio de pocos segundos debería completarse en menos de un segundo, pero depende de la longitud del audio y de la configuración de generación.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de traducción de voz hausa-inglés. Como referencia cualitativa, se puede comparar con:

- **Whisper (openai/whisper-small)**: modelo de ASR y traducción de voz multilingüe con 244 millones de parámetros. Whisper soporta traducción de audio a inglés, pero no está especializado en hausa y su rendimiento en lenguas africanas de bajos recursos es limitado. Whisper tiene licencia MIT y es más versátil, pero no ofrece traducción directa sin ASR intermedio.
- **Modelos de pipeline ASR + MT (por ejemplo, wav2vec2 + mBART)**: enfoque modular que separa el reconocimiento de voz y la traducción. Este modelo directo elimina la propagación de errores entre etapas, pero su rendimiento (chrF++ 16.67, BLEU 0.50) es bajo en términos absolutos, lo que sugiere que los pipelines modulares podrían superarlo si cuentan con buenos componentes.
- **HelpMum Translator (9ja to eng)**: modelo de traducción de texto para lenguas nigerianas (yoruba, igbo, hausa) a inglés, pero no trabaja con audio. No es comparable directamente.

Dado que no hay benchmarks estandarizados compartidos, no es posible realizar una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Uso exclusivo para investigación: la model card declara explícitamente que no debe usarse en aplicaciones médicas, legales, de seguridad crítica, de alto impacto o de traducción sin supervisión.
- Rendimiento de traducción deficiente: las métricas (chrF++ 16.67, BLEU 0.50) indican que la traducción es frecuentemente fluida pero semánticamente inexacta. El modelo es especialmente débil en nombres propios, números, fechas, negación y audios muy cortos.
- Sesgos potenciales: al entrenarse con un dataset limitado (NaijaS2ST), puede reflejar sesgos dialectales o de registro presentes en el corpus.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir texto que no corresponde al audio de entrada, especialmente en condiciones de ruido o habla no nativa.
- Sin soporte multilingüe amplio: solo acepta hausa como entrada y produce inglés como salida; no es un modelo multilingüe general.
- No es compatible con Whisper ni con PEFT: los consumidores deben cargar el modelo y el procesador de forma independiente; no se deben pasar argumentos específicos de Whisper ni envolverlo con `PeftModel`.
- Restricciones de licencia de datos: aunque el modelo se distribuye bajo Apache-2.0, el dataset de entrenamiento NaijaS2ST está bajo CC BY 4.0 y requiere atribución. El repositorio no redistribuye audio ni traducciones, pero los usuarios deben cumplir con la atribución del dataset.
- Reproducibilidad: se recomienda fijar el commit del Hub para evitar cambios en `main`; los hashes SHA-256 de los artefactos están disponibles para verificación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lEtoileNoir/Hausa_English_Direct_S2TT)
- [Dataset McGill-NLP/NaijaS2ST](https://huggingface.co/datasets/McGill-NLP/NaijaS2ST)
- [Repositorio del proyecto Spoken-Language-Translation-Model](https://github.com/tsuxalo/Spoken-Language-Translation-Model)
- [Modelo base facebook/wav2vec2-xls-r-300m-21-to-en](https://huggingface.co/facebook/wav2vec2-xls-r-300m-21-to-en)
- [Perfil del autor lEtoileNoir](https://huggingface.co/lEtoileNoir/models)
- [Repositorio AfriDataHub-Hausa (recursos para lengua hausa)](https://github.com/afridatahub/AfriDataHub-Hausa)
