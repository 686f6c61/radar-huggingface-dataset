# Selbyggen/nb-whisper-medium-coreml

## Resumen

Selbyggen/nb-whisper-medium-coreml es una conversión de formato del modelo NbAiLab/nb-whisper-medium, desarrollado por la Biblioteca Nacional de Noruega (Nasjonalbiblioteket), a Core ML para su uso con WhisperKit. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos y el comportamiento son idénticos a los del modelo original; únicamente cambia el formato de empaquetado para permitir la inferencia sobre el Apple Neural Engine en dispositivos con Apple Silicon (Mac, iPhone, iPad).

El modelo resuelve el problema del reconocimiento automático del habla (ASR) en noruego, en sus variantes bokmål (nb) y nynorsk (nn), con ejecución completamente local en hardware Apple. Está basado en la arquitectura Whisper medium de OpenAI, con aproximadamente 769 millones de parámetros, y ha sido ajustado por NbAiLab sobre datos de habla noruega. Su relevancia actual radica en que permite transcripción precisa en noruego sin conexión a internet y sin enviar audio a servidores externos, algo crítico para aplicaciones de privacidad y para el cumplimiento del RGPD.

El repositorio ocupa 1,5 GB y se distribuye con licencia Apache 2.0, la misma que el modelo original. La conversión se realizó con la herramienta whisperkittools en precisión float16, sin cuantización, y se emplea en la aplicación comercial Sagt para Mac, iPhone y iPad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium de OpenAI) |
| Parametros totales | Aproximadamente 769 millones (heredados de whisper-medium) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (estándar de Whisper) |
| Tipos de cuantizacion | float16, sin cuantización en esta conversión |
| Idiomas soportados | Noruego (no, nb, nn) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquete `.mlpackage` / carpeta `NbAiLab_nb-whisper-medium`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para transcripción multilingüe y traducción de voz. NbAiLab partió de ese checkpoint y lo ajustó (fine-tuning) sobre corpus de habla noruega, incluyendo datos de FLEURS, NST, NB Tale y grabaciones parlamentarias del Storting. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión a Core ML se realizó con `whisperkit-generate-model` sobre la revisión `main` (commit `0ed074d5985bd56ca4140159a9dbffbc3fb5117e`) del modelo original, en precisión float16 y sin cuantización. Los ficheros `config.json` y `generation_config.json` se copiaron sin cambios. El modelo utiliza el mismo tokenizer que `openai/whisper-medium`. La innovación principal no es algorítmica sino de despliegue: la compilación para el Apple Neural Engine permite inferencia local de baja latencia en dispositivos Apple sin necesidad de GPU dedicada.

## Capacidades

- Transcripción automática de voz (ASR) en noruego bokmål y nynorsk, con etiqueta genérica `no`.
- Reconocimiento de habla espontánea y de discurso formal (por ejemplo, sesiones parlamentarias).
- Generación de texto limpio: elimina repeticiones y falsos arranques, a diferencia de transcripciones verbatim.
- Ejecución local en el Apple Neural Engine mediante WhisperKit, sin conexión a internet.
- Integración en aplicaciones nativas de macOS, iOS e iPadOS a través del SDK de WhisperKit.
- Soporte de decodificación con selección explícita de idioma (`DecodingOptions(language: "no")`).
- No se documentan capacidades de tool calling, agentes, visión, audio más allá del ASR ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y actas en noruego: la ventana de 30 segundos por segmento y el procesamiento local permiten transcribir reuniones largas en el propio dispositivo, sin enviar audio a la nube y cumpliendo requisitos de privacidad.
- Subtitulado automático de contenido audiovisual noruego: la baja tasa de error en FLEURS nb (6,5 %) y en NST (2,6 %) lo hace adecuado para generar subtítulos en producciones de habla clara.
- Aplicaciones de dictado en macOS, iOS e iPadOS: al ejecutarse sobre el Neural Engine, puede integrarse en apps de productividad para dictado continuo con latencia baja y sin coste de API.
- Documentación de sesiones parlamentarias o administrativas: el rendimiento medido en el corpus del Storting (14,6 % WER en NPSC y 13,6 % en reuniones de ~10 minutos) lo respalda para transcripción de actas oficiales con revisión humana posterior.
- Investigación lingüística sobre habla espontánea: el rendimiento en NB Tale (15,8 % WER) permite transcribir entrevistas y corpus orales para análisis posteriores, con la ventaja de que el texto generado es limpio y no verbatim.
- Herramientas de accesibilidad para personas con discapacidad auditiva: la ejecución local y sin conexión garantiza que la transcripción en tiempo real funcione en entornos sin red y sin exponer conversaciones privadas.
- Aplicaciones de periodismo y entrevistas de campo: grabación y transcripción en un iPhone o iPad sin infraestructura adicional, útil para reporteros que trabajan en localizaciones sin cobertura fiable.

## Benchmarks y rendimiento

Datos de word error rate (WER) publicados por el autor de la conversión, medidos sobre el Neural Engine con los mismos clips, normalización y ruta de código, comparando con NB-Whisper large:

| Conjunto | NB-Whisper medium (este) | NB-Whisper large |
|---|---:|---:|
| FLEURS nb (75 clips) | 6,5 % | 7,0 % |
| NST (75 clips) | 2,6 % | 2,2 % |
| NB Tale, habla espontánea (75 clips) | 15,8 % | 17,1 % |
| NPSC, Storting (75 clips) | 14,6 % | 14,8 % |
| Storting, cuatro reuniones de ~10 minutos | 13,6 % | 13,9 % |

El autor indica que el modelo original en PyTorch ofrece los mismos números dentro del margen de ruido. NPSC y NB Tale emplean referencias verbatim, mientras que NB-Whisper genera texto limpio (elimina repeticiones y falsos arranques), lo que explica la mayor parte del error en esos conjuntos. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en el Apple Neural Engine y en memoria unificada de los chips Apple Silicon. El repositorio ocupa 1,5 GB en float16.
- GPU recomendadas: cualquier chip Apple Silicon (series M1, M2, M3, M4 y variantes Pro, Max, Ultra), así como los SoC A-series recientes de iPhone y iPad compatibles con WhisperKit.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: WhisperKit (SDK oficial), con descarga del modelo mediante `WhisperKit.download(variant: "NbAiLab_nb-whisper-medium", from: "Selbyggen/nb-whisper-medium-coreml")`. Para el modelo original en PyTorch pueden usarse transformers, faster-whisper u otras implementaciones, pero esta conversión concreta está orientada a Core ML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Selbyggen/nb-whisper-medium-coreml (este) | ~769 M | 30 s por segmento | Noruego (no, nb, nn) | Apache 2.0 | Core ML |
| NbAiLab/nb-whisper-medium | ~769 M | 30 s por segmento | Noruego (no, nb, nn) | Apache 2.0 | PyTorch (safetensors) |
| NbAiLab/nb-whisper-large | ~1550 M | 30 s por segmento | Noruego (no, nb, nn) | Apache 2.0 | PyTorch (safetensors) |
| openai/whisper-medium | ~769 M | 30 s por segmento | Multilingüe (99 idiomas) | MIT | PyTorch, Core ML, GGUF |

La comparativa directa más relevante es con el modelo original de NbAiLab: idénticos pesos y comportamiento, pero distinto formato de despliegue. Frente a nb-whisper-large, este modelo ofrece una precisión comparable o superior en varios conjuntos (FLEURS nb, NB Tale, Storting) con la mitad de parámetros. Frente a whisper-medium de OpenAI, la diferencia clave es el ajuste específico al noruego, que mejora sustancialmente la precisión en ese idioma a costa de perder cobertura multilingüe.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier sesgo o limitación del modelo original de NbAiLab se hereda íntegramente.
- Ventana de audio fija de 30 segundos por segmento, propia de Whisper; los audios más largos requieren segmentación y ensamblaje, lo que puede introducir errores en las fronteras.
- El WER en habla espontánea (NB Tale, 15,8 %) y en discurso parlamentario (Storting, 13,6-14,6 %) es notablemente superior al de habla leída, por lo que en producción conviene prever revisión humana en esos dominios.
- El texto generado es limpio, no verbatim: elimina repeticiones y falsos arranques, lo que lo inhabilita para tareas que requieran transcripción literal (análisis de disfluencias, forense, etc.).
- Cobertura lingüística limitada al noruego; no debe usarse para otros idiomas.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con ruido, silencios largos o audio musical.
- Requiere hardware Apple Silicon y el SDK de WhisperKit; no es desplegable en GPUs NVIDIA ni en servidores x86 convencionales sin recurrir al modelo original en PyTorch.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución a NbAiLab y a Nasjonalbiblioteket.
- No se documentan en la información disponible métricas de latencia, throughput ni consumo energético en dispositivos concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Selbyggen/nb-whisper-medium-coreml
- Modelo base original: https://huggingface.co/NbAiLab/nb-whisper-medium
- Organización NbAiLab: https://huggingface.co/NbAiLab
- WhisperKit (repositorio): https://github.com/argmaxinc/WhisperKit
- whisperkittools (herramienta de conversión): https://github.com/argmaxinc/whisperkittools
- Aplicación Sagt: https://sagtapp.com/
