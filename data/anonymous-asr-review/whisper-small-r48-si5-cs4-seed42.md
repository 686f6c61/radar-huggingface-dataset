# anonymous-asr-review/whisper-small-r48-si5-cs4-seed42

## Resumen

whisper-small-r48-si5-cs4-seed42 es un adaptador LoRA de rango 48 (alpha 96) entrenado sobre el modelo base openai/whisper-small para reconocimiento automático del habla (ASR) en sinhala e inglés, con énfasis en el fenómeno de code-switching entre ambos idiomas. Lo publica la cuenta anónima anonymous-asr-review como material suplementario para un proceso de revisión por pares, por lo que no incluye métricas, memoria técnica ni documentación extendida más allá de los hiperparámetros de entrenamiento y el procedimiento de carga.

El modelo resuelve un problema concreto: la transcripción de audio en el que un hablante alterna entre sinhala e inglés dentro de una misma intervención, un escenario frecuente en Sri Lanka en contextos técnicos, sanitarios, académicos y de atención al cliente. La mayoría de los sistemas ASR multilingües convencionales están optimizados para un único idioma por segmento y degradan su precisión en esos cambios de código, de ahí el interés de un ajuste específico.

Técnicamente es un adaptador PEFT que no contiene los pesos completos: se distribuye en safetensors y requiere descargar por separado el modelo base Whisper-small (arquitectura transformer encoder-decoder de aproximadamente 244 M de parámetros). El entrenamiento se describe como cinco épocas sobre datos en sinhala seguidas de cuatro épocas sobre datos de code-switching, con semilla 42 y selección del último checkpoint. No se especifica la licencia, el volumen de datos ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (adaptador LoRA/PEFT sobre openai/whisper-small) |
| Parametros totales | No disponible para el adaptador (rango 48, alpha 96); modelo base Whisper-small: aproximadamente 244 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base procesa ventanas de audio de 30 segundos (1500 posiciones de entrada) |
| Tipos de cuantizacion | No disponible para el adaptador (safetensors en precisión de entrenamiento); el modelo base admite fp16, int8 y conversiones a GGUF con herramientas de terceros |
| Idiomas soportados | Sinhala (si) e inglés (en), con entrenamiento específico en code-switching si-en |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre openai/whisper-small, un transformer encoder-decoder con preprocesado de audio a espectrograma log-Mel a 16 kHz y decodificación autoregresiva con tokens de idioma y de tarea. La adaptación es de tipo LoRA con rango 48 y alpha 96, lo que implica que únicamente se entrenan matrices de bajo rango inyectadas en las capas del modelo base, y que la inferencia final puede realizarse fusionando el adaptador con los pesos originales mediante `merge_and_unload()`.

El régimen de entrenamiento descrito en la model card es secuencial: cinco épocas sobre datos en sinhala y, a continuación, cuatro épocas sobre datos de code-switching. La semilla es 42 y el checkpoint seleccionado es el último, no el mejor según una métrica de validación. No se indica el número de horas de audio, la composición del dataset, si hubo aumentación de datos, ni si se aplicaron técnicas de ajuste adicionales como decodificación especulativa, destilación o ajuste por preferencias humanas (RLHF/DPO). Tampoco se documentan el esquema de normalización de texto ni la tokenización de referencia empleados para calcular métricas.

## Capacidades

- Reconocimiento automático del habla en sinhala sobre audio de 16 kHz.
- Reconocimiento automático del habla en inglés.
- Transcripción de audio con alternancia de idioma dentro del mismo enunciado (code-switching sinhala-inglés), que es el objetivo declarado del ajuste.
- Integración directa con el ecosistema Hugging Face Transformers y PEFT mediante `PeftModel.from_pretrained` y fusión del adaptador.
- Compatibilidad con los parámetros de generación de Whisper (tokens de idioma y de tarea, decodificación por lotes, marcas de tiempo), al heredar la interfaz del modelo base.
- Soporte de tool calling o function calling: no disponible, no es una capacidad de un modelo ASR.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades de visión o audio más allá de ASR: no disponibles.
- Modo de razonamiento explícito (thinking): no disponible.
- Traducción de voz a texto en inglés: no documentada para este adaptador; el modelo base la soporta, pero no hay evidencia de que el ajuste la preserve.

## Casos de uso

- Transcripción de reuniones bilingües en empresas de Sri Lanka: el adaptador está entrenado específicamente para intervenciones en las que se mezclan sinhala e inglés, un patrón habitual en reuniones técnicas y comerciales donde la terminología se mantiene en inglés.
- Subtitulado automático de contenido audiovisual: canales de YouTube, televisión y plataformas locales pueden generar subtítulos en sinhala con inserción de términos en inglés sin segmentar manualmente el audio por idioma.
- Centros de contacto y atención al cliente: transcripción de llamadas de soporte para control de calidad, análisis de motivos de contacto y generación de actas, aprovechando que el cliente suele alternar entre ambos idiomas.
- Documentación clínica dictada: transcripción de notas médicas donde diagnósticos y fármacos se nombran en inglés dentro de una frase en sinhala, con posterior revisión humana.
- Accesibilidad y voz a texto para usuarios sordos o con dificultades auditivas: generación de transcripciones en tiempo casi real de conversaciones presenciales o llamadas.
- Indexación y búsqueda de archivos de audio: conversión de un archivo histórico de grabaciones a texto para permitir búsqueda por palabras clave y recuperación de información.
- Investigación lingüística sobre code-switching: obtención de transcripciones anotadas para estudiar patrones de alternancia de código, frecuencia de préstamos léxicos y estructura sintáctica.
- Transcripción de entrevistas de campo en ciencias sociales: procesamiento por lotes de grabaciones con hablantes que mezclan registro formal en inglés y coloquial en sinhala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER, CER ni comparaciones con otros sistemas, y la búsqueda web no ha devuelto documentación técnica asociada a este identificador de modelo.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa un espacio reducido en disco (el repositorio se reporta como 0.0 GB redondeado, coherente con un fichero de adaptador de decenas de megabytes); el consumo real lo determina el modelo base.
- Inferencia del modelo base Whisper-small en fp16: aproximadamente 0.5 GB de VRAM más el espacio de activaciones, por lo que cabe con holgura en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Inferencia en int8: aproximadamente 0.25-0.3 GB de pesos, ejecutable incluso en CPU con latencias mayores.
- Ejecución en CPU: viable para transcripción por lotes no interactiva; en streaming se recomienda GPU.
- GPUs de数据中心 como A100 o H100 no son necesarias para este tamaño de modelo, aunque pueden emplearse para procesar grandes volúmenes en paralelo.
- Opciones de despliegue: Transformers con PEFT (ruta documentada por el autor), vLLM, Hugging Face TGI, llama.cpp u Ollama si se convierte el modelo fusionado a GGUF, y servidores de inferencia propios basados en PyTorch.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anonymous-asr-review/whisper-small-r48-si5-cs4-seed42 | Adaptador LoRA r48 sobre base de ~244 M | 30 s (heredado del base) | Sinhala, ingles (code-switching) | No disponible | Hugging Face, 0 descargas |
| openai/whisper-small | ~244 M | 30 s | Multilingue (cerca de 99 idiomas) | Apache-2.0 | Hugging Face, ampliamente utilizado |
| openai/whisper-base | ~74 M | 30 s | Multilingue | Apache-2.0 | Hugging Face |
| openai/whisper-medium | ~769 M | 30 s | Multilingue | Apache-2.0 | Hugging Face |
| Ajustes especificos de sinhala sobre Whisper | No disponible | No disponible | Sinhala | No disponible | No disponible en la informacion recogida |

El rendimiento comparado no puede establecerse porque el adaptador no publica métricas y la búsqueda web no ha identificado alternativas evaluadas en el mismo conjunto de test.

## Limitaciones y advertencias

- Licencia no especificada: no hay base legal explícita para uso comercial. El modelo base Whisper-small se distribuye bajo Apache-2.0, pero eso no determina la licencia del adaptador, que debe consultarse con el autor.
- Publicación anónima para revisión por pares: el identificador y el nombre de la cuenta sugieren que se trata de un artefacto temporal de evaluación, sin garantía de mantenimiento, soporte o permanencia.
- Ausencia total de métricas: no se publican valores de WER ni CER, ni la composición o el tamaño del conjunto de entrenamiento, lo que impide estimar la calidad real del ajuste.
- Riesgo de sobreajuste: la selección del último checkpoint, sin criterio de mejor validación, y el entrenamiento secuencial de cinco épocas en sinhala seguidas de cuatro en code-switching, pueden degradar el rendimiento en sinhala monolingüe o provocar olvido catastrófico parcial.
- Alucinación: los modelos de la familia Whisper son propensos a generar texto plausible en segmentos con silencio, ruido o audio ininteligible, y a repetir frases en bucles de decodificación.
- Ventana limitada a 30 segundos: el modelo base no procesa audio más largo sin segmentación previa, lo que exige un pipeline de chunking con solapamiento en producción.
- Idiomas restringidos: solo se declaran sinhala e inglés; no hay evidencia de que el ajuste conserve el rendimiento multilingüe original de Whisper en otros idiomas, y es probable que lo degrade.
- Dominio desconocido: al no documentarse la procedencia de los datos, no puede evaluarse el sesgo por acento, género, edad, registro dialectal o condiciones de grabación.
- Uso en entornos regulados: para aplicaciones sanitarias, legales o de vigilancia se requiere revisión humana de las transcripciones y una evaluación propia de precisión antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anonymous-asr-review/whisper-small-r48-si5-cs4-seed42
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de PEFT: https://github.com/huggingface/peft
- Documentación de Whisper en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos enlaces encontrados corresponden a entidades homonimas sin relacion con el modelo (grupo hacktivista Anonymous y marcas de calzado), por lo que se han descartado.
