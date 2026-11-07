# oluwagbotty/nemo-ctc-ky-ft-10ep

## Resumen

nemo-ctc-ky-ft-10ep es un modelo de reconocimiento automático del habla (ASR) en kinyarwanda desarrollado por oluwagbotty (Emmanuel Bolarinwa) mediante fine-tuning del modelo base nvidia/stt_rw_conformer_ctc_large. El modelo está especializado en habla no estándar, concretamente en personas que tartamudean, y se ha entrenado sobre el split de entrenamiento del dataset CDLI Kinyarwanda Non-Standard Speech v1.0. Su propósito es servir de base de investigación para reconocimiento de voz de bajo coste dirigido a personas con disfluencias del habla, en el marco del Rwanda Innovation Sprint organizado por el Centre for Digital Language Inclusion (UCL).

El modelo parte de una arquitectura Conformer con cabecera CTC (Connectionist Temporal Classification), heredada del checkpoint de NVIDIA, y se ha afinado durante un máximo de 10 épocas con parada temprana sobre WER de validación. El resultado es un modelo de aproximadamente 0,5 GB de pesos en formato NeMo (.nemo) que obtiene un WER agrupado del 41,4 % en el split de test (9 hablantes) y del 38,6 % con el normalizador de estilo CDLI.

La relevancia del modelo radica en su enfoque: a diferencia de los sistemas ASR comerciales, que degradan notablemente con habla disfluente, este modelo se entrena explícitamente con transcripciones verbatim que incluyen repeticiones de tartamudeo. No obstante, se trata de un modelo de investigación con limitaciones importantes de generalización (pocos hablantes, condiciones controladas) y no debe usarse para diagnóstico ni evaluación clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC (heredada de nvidia/stt_rw_conformer_ctc_large) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa segmentos de audio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo), fichero best.nemo |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Conformer, que combina capas de autoatención con convoluciones para capturar dependencias locales y globales en secuencias de audio, y una cabecera CTC para la decodificación sin alineamiento explícito. Esta arquitectura se hereda del checkpoint base de NVIDIA para kinyarwanda, sobre el que se aplica un fine-tuning supervisado.

El entrenamiento se realizó exclusivamente sobre el split de train del dataset cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0, con el split de dev para selección de checkpoint y el split de test evaluado una sola vez tras el entrenamiento. Se usaron hasta 10 épocas con parada temprana sobre WER de dev (paciencia de 3 evaluaciones), semilla 42, learning rate 1e-4 y precisión bf16-mixed. El dataset contiene grabaciones en interiores con bajo ruido, tomadas con una app de tableta a partir de descripciones de imágenes y lectura de frases, de hablantes mayoritariamente jóvenes adultos que tartamudean. No se aplicó RLHF ni DPO; es un fine-tuning supervisado estándar de ASR.

## Capacidades

- Reconocimiento automático del habla en kinyarwanda, con especial atención a habla disfluente y tartamudeo.
- Transcripción verbatim: las repeticiones de tartamudeo aparecen escritas en los targets de entrenamiento, aunque el modelo puede reproducirlas o no en la salida.
- Decodificación greedy sin bucles: al ser un modelo CTC, no presenta el fallo de repetición infinita típico de modelos generativos como Whisper.
- Procesamiento de audio grabado en condiciones de interior con bajo ruido.
- Manejo de habla leída (frases) y habla descrita a partir de imágenes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio de entrada más allá del propio ASR, ni capacidades multimodales adicionales.

## Casos de uso

- Investigación en ASR para habla disfluente: el modelo sirve como línea base reproducible para estudiar cómo afecta el tartamudeo al WER en kinyarwanda, con métricas publicadas (WER agrupado 41,4 % en test) y código de experimentos disponible en el repositorio del proyecto.
- Transcripción asistida de entrevistas o grabaciones con hablantes que tartamudean: en entornos controlados de bajo ruido, el modelo puede generar un borrador de transcripción que después se revisa manualmente, mostrando el texto al hablante antes de actuar sobre él.
- Prototipos de accesibilidad lingüística en Ruanda: integración en aplicaciones de tableta o móvil para dar soporte a personas con disfluencias en kinyarwanda, siempre como herramienta de apoyo y no de diagnóstico.
- Evaluación comparativa de modelos ASR en lenguas de bajos recursos: permite comparar el rendimiento de arquitecturas CTC frente a modelos generativos (tipo Whisper) en condiciones de habla no estándar, usando el mismo conjunto de test.
- Generación de datasets aumentados: las transcripciones del modelo pueden servir para preetiquetar audio y acelerar la anotación humana en nuevos corpus de habla disfluente, con revisión posterior obligatoria.
- Docencia y experimentación con NeMo: al estar en formato .nemo y basarse en un checkpoint de NVIDIA, es adecuado para prácticas de fine-tuning de ASR con PyTorch Lightning y NeMo Toolkit en entornos académicos.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificación greedy, una grabación a la vez, y normalizador de texto básico de Whisper (y variante con el paso de apóstrofos de CDLI):

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 41,4 | 13,1 | 41,7 | 13,7 | 0 |
| dev (6 hablantes) | 43,8 | 18,8 | 43,2 | 19,8 | 0 |
| test, normalizador estilo CDLI | 38,6 | 12,6 | 39,3 | n/a | 0 |

El autor advierte que, con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse estadísticamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,5 GB, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible; por tamaño, es probable que funcione en GPUs consumer como RTX 3060, RTX 4090 o superiores, así como en A100/H100 para despliegues por lotes, aunque el autor no publica requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del repositorio (0,5 GB), aunque no hay confirmación oficial.
- Opciones de despliegue: NeMo Toolkit (formato .nemo nativo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a ASR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | WER test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nemo-ctc-ky-ft-10ep | Conformer + CTC | kinyarwanda | 41,4 % (agrupado) | CC-BY-4.0 | Hugging Face |
| nvidia/stt_rw_conformer_ctc_large | Conformer + CTC | kinyarwanda | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face (NVIDIA) |
| Modelos CDLI de referencia | no disponible | kinyarwanda | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de resultados comparativos directos con otros modelos en la información proporcionada; el autor menciona la comparación con las model cards de CDLI pero no se incluyen sus cifras.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: solo 9 hablantes en test, mayoritariamente hombres jóvenes, grabaciones en interiores silenciosos, habla leída y descrita por imágenes, no conversacional. El rendimiento en niños, otras discapacidades, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Targets verbatim: las repeticiones de tartamudeo se escriben en las transcripciones, y los modelos entrenados con ellas pueden reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia frases leídas: las frases leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imágenes son mejor guía para habla abierta.
- No apto para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condición del habla, identificar hablantes ni para decisiones clínicas, legales o de aplicación de la ley. Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de alucinación y errores de transcripción: una transcripción errónea puede cambiar el significado de lo que dijo una persona; se recomienda mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero los términos del dataset CDLI (acceso restringido) imponen restricciones adicionales sobre los datos y sobre la reidentificación de hablantes.
- Sin datos publicados sobre cuantización, latencia ni requisitos de hardware, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep
- Perfil del autor: https://huggingface.co/oluwagbotty
- Modelo base: https://huggingface.co/nvidia/stt_rw_conformer_ctc_large
- Dataset CDLI: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Documentación de NeMo Toolkit: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/core/core.html
