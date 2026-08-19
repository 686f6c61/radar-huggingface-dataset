# ASLP-lab/CN-MultiDialect-ASR

## Resumen

CN-MultiDialect-ASR es un modelo de reconocimiento automático del habla (ASR) desarrollado por el grupo ASLP-lab de la Northwestern Polytechnical University de Xi'an, en colaboración con la comunidad WeNet y NEXDATA. Se trata de un ajuste fino del modelo base Qwen/Qwen3-ASR-1.7B, diseñado específicamente para mejorar el reconocimiento de dialectos chinos sin degradar el rendimiento en mandarín estándar. El modelo se presenta con una pipeline de adaptación en tres etapas: preentrenamiento continuo (CPT), ajuste fino supervisado con dialectos (SFT) y destilación auto-supervisada on-policy (OPSD), siendo esta última la principal innovación metodológica.

Con 2.349.217.408 parámetros (aproximadamente 2,35 mil millones), el modelo mantiene la arquitectura del Qwen3-ASR-1.7B y es compatible con el paquete oficial `qwen-asr` para inferencia. Su relevancia radica en abordar un problema práctico importante: los dialectos chinos (cantonés, wu, min, etc.) presentan una gran variabilidad fonética y léxica que los modelos ASR estándar suelen manejar mal. La técnica OPSD reduce la discrepancia entre el entrenamiento teacher-forced y la inferencia autoregresiva, lo que permite mejorar el CER (Character Error Rate) en dialectos sin sacrificar el mandarín. El modelo soporta chino mandarín, cantonés e inglés, y está publicado bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3-ASR-1.7B (arquitectura no especificada en la documentación; modelo de audio-lenguaje con encoder y decoder) |
| Parametros totales | 2.349.217.408 (2,35 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados; pesos en safetensors (probablemente bf16) |
| Idiomas soportados | Chino mandarín (zh), cantonés (yue), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3-ASR-1.7B y se adapta mediante un proceso de tres fases. La primera fase (CPT) utiliza un corpus completo de mandarín y dialectos de aproximadamente 100.000 horas para fortalecer la base de reconocimiento del chino. La segunda fase (SFT) reutiliza las mismas fuentes pero con un mayor peso de muestras dialectales y un pequeño conjunto de anclaje en mandarín, con el objetivo de reducir el CER en dialectos. La tercera fase (OPSD) emplea un subconjunto de refinamiento de unos 5.000 horas, donde se aplica destilación auto-supervisada on-policy: el estudiante decodifica prefijos generados por sí mismo, mientras que un profesor congelado se condiciona en la transcripción de referencia como contexto privilegiado, utilizando soft targets y divergencia KL a nivel de token. Esta técnica reduce la discrepancia entre el entrenamiento teacher-forced y la inferencia autoregresiva, lo que mejora la generalización a dialectos sin perjudicar el mandarín.

## Capacidades

- Reconocimiento automático del habla en chino mandarín, cantonés e inglés.
- Reconocimiento de dialectos chinos adicionales (se mencionan cuatro dialectos principales y quince dialectos del conjunto ChinaVoices).
- Detección automática de idioma si no se especifica el parámetro `language`.
- Inferencia por lotes (batch) para múltiples archivos de audio.
- Compatibilidad con el paquete oficial `qwen-asr`, que incluye soporte para streaming, forced alignment y backend vLLM para inferencia acelerada.
- Integración con el ecosistema transformers de Hugging Face.

## Casos de uso

- Atención al cliente en regiones con dialectos: el modelo puede transcribir llamadas de soporte en cantonés u otros dialectos, permitiendo a las empresas analizar conversaciones y entrenar asistentes virtuales que comprendan la variante local.
- Subtitulación automática de contenido audiovisual regional: canales de televisión o plataformas de streaming pueden generar subtítulos precisos para programas en dialecto, manteniendo también el soporte para mandarín e inglés.
- Asistentes de voz para aplicaciones móviles en China: integración en asistentes personales que necesiten entender comandos en dialecto, mejorando la accesibilidad para usuarios mayores o rurales.
- Transcripción de reuniones y entrevistas: en entornos empresariales o de investigación donde los participantes hablan dialectos, el modelo facilita la generación de actas o notas textuales sin necesidad de intérpretes.
- Análisis sociolingüístico: investigadores pueden transcribir grandes volúmenes de audio dialectal para estudiar variación fonética, léxica o cambios en el uso de la lengua.
- Pipelines de procesamiento de audio en producción: gracias a su compatibilidad con vLLM y el paquete `qwen-asr`, puede desplegarse como servicio de transcripción en tiempo real o por lotes dentro de infraestructuras existentes.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La documentación incluye únicamente una visualización tipo radar con valores de 1-CER (tasa de error de caracteres invertida) para cinco conjuntos públicos de dialectos y dieciocho conjuntos internos, pero sin cifras concretas. No se proporcionan comparaciones cuantitativas con otros modelos como Qwen3-ASR-1.7B, Whisper o SenseVoice.

## Requisitos de hardware

- VRAM estimada: con pesos en bf16 (2 bytes por parámetro), se necesitan aproximadamente 4,7 GB solo para los pesos del modelo. Con overhead de activaciones y memoria intermedia, se recomienda al menos 8 GB de VRAM para inferencia básica.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 o RTX 4090 son suficientes para inferencia en bf16. Para despliegues con vLLM y alta concurrencia, se recomiendan GPUs de datacenter como A10, A100 o H100.
- El modelo cabe en GPUs consumer de gama media-alta, siempre que se disponga de al menos 8 GB de VRAM.
- Opciones de despliegue: paquete `qwen-asr` (basado en transformers), backend vLLM para inferencia acelerada y streaming, y compatible con el ecosistema Hugging Face.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| CN-MultiDialect-ASR (este) | 2,35 B | zh, yue, en | no disponible | Apache 2.0 | Enfocado en dialectos chinos, basado en Qwen3-ASR |
| Qwen3-ASR-1.7B (base) | 1,7 B | multilingüe (amplio) | no disponible | Apache 2.0 | Modelo base genérico, no especializado en dialectos |
| Whisper large-v3 | 1,55 B | 99 idiomas | 30 s de audio | MIT | Modelo generalista de OpenAI, sin especialización en dialectos chinos |
| SenseVoice | ~1 B | zh, yue, en, ja, ko | no disponible | Apache 2.0 | Modelo de ASR chino de FunAudioLLM, con soporte de dialectos |

La comparativa se basa en características generales, ya que no se dispone de resultados de benchmarks públicos para CN-MultiDialect-ASR. La principal ventaja de este modelo frente a alternativas es su adaptación explícita a dialectos chinos mediante la técnica OPSD, manteniendo el rendimiento en mandarín.

## Limitaciones y advertencias

- El modelo está especializado en dialectos chinos y puede tener un rendimiento inferior en otros idiomas o variantes no cubiertas por los datos de entrenamiento.
- No se han publicado evaluaciones de sesgos o comportamientos adversos; al estar entrenado principalmente con datos de audio chinos, puede presentar sesgos culturales o regionales en la transcripción.
- Como todo sistema ASR, existe riesgo de alucinación en audio con ruido, solapamiento de voces o acentos muy marcados.
- La longitud de contexto no está documentada; para audios muy largos puede ser necesario segmentar el audio antes de la transcripción.
- Aunque la licencia Apache 2.0 permite uso comercial, no se proporcionan garantías de rendimiento en producción ni soporte técnico oficial.
- La documentación no especifica los tipos de cuantización disponibles; se asume bf16, lo que puede requerir más VRAM que modelos cuantizados a 8 o 4 bits.

## Enlaces

- Hugging Face: https://huggingface.co/ASLP-lab/CN-MultiDialect-ASR
- GitHub (código, demo y scripts de entrenamiento): https://github.com/ASLP-lab/CN-MultiDialect-ASR
- Paper (arXiv:2608.11898): https://arxiv.org/abs/2608.11898
- Repositorio oficial de Qwen3-ASR (paquete `qwen-asr`): https://github.com/QwenLM/Qwen3-ASR
- Página del grupo ASLP@NPU: http://www.npu-aslp.org/
