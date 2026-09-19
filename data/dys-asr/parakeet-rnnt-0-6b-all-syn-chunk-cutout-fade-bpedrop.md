# dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-fade-bpedrop

## Resumen

Parakeet RNN-T 0.6B (FadeOutIn + BPE-dropout) es un modelo de reconocimiento automático del habla en inglés especializado en habla disártrica y habla con trastornos, desarrollado por el usuario `dys-asr` como entrada para la Speech Accessibility Project Challenge. Se construye mediante ajuste fino del modelo base `extraordinarylab/parakeet-unified-en-0.6b`, un sistema de 618.314.241 parámetros con arquitectura de transductor (RNN-T) y pesos en safetensors que requiere `transformers>=5.9` para su carga.

El problema que aborda es la baja tasa de reconocimiento que los sistemas ASR convencionales obtienen sobre hablantes con disartria u otras condiciones que afectan a la producción del habla. El modelo se entrena exclusivamente sobre los corpus del reto (SAPC-1 y SAPC-2), más voz sintética generada con CosyVoice3 y fragmentos alineados extraídos de grabaciones demasiado largas, lo que lo convierte en un modelo de *constrained track*: no incorpora datos externos a los corpus de la competición.

Su relevancia es doble. Por un lado, es un artefacto de investigación sobre accesibilidad y reconocimiento de habla atípica. Por otro, forma parte de una familia de ejecuciones experimentales diseñadas para atribuir el efecto de dos técnicas de regularización concretas, FadeOutIn y BPE-dropout, aplicadas de forma conjunta sobre una receta de diez épocas. El modelo reporta un CER de 6,12 % en el split de desarrollo completo (17.492 enunciados) y de 6,13 % en un subconjunto de 4.000 enunciados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet RNN-T (transductor), encoder de la familia Parakeet con decodificador autorregresivo; detalles de capas no disponibles |
| Parámetros totales | 618.314.241 (≈0,6 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; los segmentos de audio de entrenamiento se filtran al rango 0,5-45 s |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas; entrenamiento en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other`, bajo `speech-accessibility-project-dua` (Speech Accessibility Project Data Use Agreement) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,5 GB |
| Librería | transformers (requiere `>=5.9`) |
| Entrada de audio | 16 kHz mono |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transductor RNN-T sobre un encoder tipo Parakeet, cargable mediante la clase `ParakeetForRNNT` de Transformers. La decodificación es autorregresiva, lo que el propio autor señala como un coste de latencia frente a alternativas CTC. No se detallan en la información disponible el número de capas, la dimensión del modelo, el tamaño del vocabulario ni la configuración exacta del predictor y del joiner.

El entrenamiento se realizó durante diez épocas sobre dieciséis GH200, con batch efectivo de 32 (2 por dispositivo), AdamW a 1e-4 con schedule tri-stage (10 % de warmup, 40 % de mantenimiento), weight decay 0,01, layerdrop 0,05, gradient clipping de 1,0, precisión bf16, semilla 42 y 144.750 pasos de optimizador. La aumentación incluye perturbación de velocidad en línea sobre el rango 0,8-1,2, SpecAugment (5 % del eje temporal en tramos de 10 frames, 40 % del eje mel en tramos de 27 bins) y SpecCutout (dos rectángulos de 20x20). Sobre esa base se añaden las dos técnicas que dan nombre al modelo: FadeOutIn con dieciséis segmentos al 2 % y BPE-dropout con p = 0,1. El corpus de entrenamiento consta de 250.014 registros de SAPC-1 (train y dev), 153.500 de SAPC-2 train, 55.988 de habla sintética CosyVoice3 y 8.933 fragmentos forzadamente alineados, lo que suma 468.435 registros antes de filtrado y 463.177 tras aplicar los filtros de 0,5-45 s y 200 tokens de etiqueta. El split de desarrollo (17.582 clips, 17.492 enunciados) se declara genuinamente retenido, verificado comparando rutas de fichero contra los manifiestos de entrenamiento.

## Capacidades

- Transcripción de voz a texto en inglés para habla disártrica y habla con trastornos, el objetivo declarado del modelo.
- Reconocimiento de habla general en inglés, al derivar de un modelo ASR unificado preentrenado.
- Decodificación por lotes mediante `processor.batch_decode` con `skip_special_tokens=True`.
- Salida en minúsculas, sin puntuación y con los numerales escritos como palabras.
- Procesamiento de audio a 16 kHz mono; los segmentos de entrenamiento abarcan de 0,5 a 45 segundos.
- No se documenta soporte de *tool calling*, *function calling*, capacidades de agente, razonamiento multi-paso, visión, audio generativo ni *thinking mode*.
- No se documenta capacidad multilingüe: el modelo es exclusivamente inglés.
- No se documenta salida con puntuación, mayúsculas, marcas de tiempo ni diarización de hablantes.

## Casos de uso

- Transcripción asistiva para personas con disartria: el modelo está ajustado específicamente sobre los corpus SAPC de habla con trastornos, por lo que puede usarse para convertir dictado o conversación en texto en herramientas de comunicación aumentativa, siempre con revisión humana.
- Preanotación de corpus clínicos y de investigación: permite generar transcripciones iniciales sobre grabaciones de habla atípica que después se corrigen manualmente, reduciendo el coste de anotación frente a partir de cero.
- Investigación en ASR de habla atípica: sirve como punto de partida reproducible (semilla 42, receta documentada, corpus acotado) para estudiar el efecto de FadeOutIn y BPE-dropout en condiciones de *constrained track*.
- Evaluación comparativa de técnicas de regularización: al existir las ejecuciones hermanas con una sola de las dos técnicas activas, este modelo permite aislar si ambas componen entre sí sobre el mismo corpus.
- Ajuste fino posterior sobre datos propios autorizados: al ser un modelo de 0,6 B con pesos safetensors, puede reentrenarse sobre corpus privados de habla atípica que cuenten con acceso autorizado.
- Integración en prototipos de accesibilidad: por ejemplo, dictado por voz para personas con movilidad reducida, aceptando la limitación de salida sin puntuación y la necesidad de posprocesado de formato.
- Extracción de características: el repositorio declara la etiqueta `feature-extraction`, por lo que el encoder puede emplearse para obtener representaciones de audio en tareas posteriores, aunque no se documenta el procedimiento en la model card.

## Benchmarks y rendimiento

Los únicos resultados publicados son CER sobre el split de desarrollo retenido, comparados con la ejecución base sin modificaciones:

| Ejecución | Mejor época | CER dev (subconjunto de 4.000 enunciados) | CER dev (split completo) |
|---|---:|---:|---:|
| Baseline, sin cambios | 9 | 6,06 % | 6,25 % |
| Este modelo (FadeOutIn + BPE-dropout) | 10 | 6,13 % | 6,12 % |

El autor advierte explícitamente de que ambas columnas deben interpretarse con cautela: el subconjunto y el split completo no coinciden en el orden de las ejecuciones de esta familia, la dispersión es inferior a 0,2 puntos de CER y cada fila corresponde a una única semilla. El split completo (17.492 enunciados) es el más fiable de los dos, pero ninguno constituye un test de significación. Todas las ejecuciones de la familia alcanzaron su máximo en la época 9 o 10 sin signos de sobreajuste, lo que sugiere que diez épocas puede ser un entrenamiento corto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB solo para los pesos en bf16 o fp16 (618,3 M de parámetros); en fp32 serían unos 2,5 GB. Con activaciones, buffers de audio y decodificación autorregresiva, el consumo práctico se sitúa en el rango de 2 a 4 GB para lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM, como una RTX 3050, RTX 3060, RTX 4060, RTX 4070 o RTX 4090. También es viable en CPU para inferencia puntual, con latencia mayor.
- GPU recomendadas para producción o lotes grandes: A100, H100, L40S o GH200. El entrenamiento documentado se realizó sobre dieciséis GH200.
- Opciones de despliegue: la única ruta documentada es Transformers con `ParakeetForRNNT` y `AutoProcessor`, con `transformers>=5.9` obligatorio (no carga en la línea 4.x). No se documentan soportes de vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, y al tratarse de un transductor con decodificación autorregresiva estas rutas no están garantizadas.
- Latencia y throughput: no disponible. El autor solo indica cualitativamente que la decodificación es lenta en comparación con CTC por ser autorregresiva.
- Requisito de entrada: audio a 16 kHz mono, procesado con el procesador del propio repositorio.

## Comparativa con modelos similares

No hay datos publicados que permitan comparar este modelo con alternativas externas (Whisper, otros Parakeet, wav2vec 2.0, etc.) en parámetros, contexto, licencia o rendimiento. La comparación disponible se limita a las ejecuciones hermanas de la misma familia, que comparten corpus, receta y base:

| Ejecución | Técnica añadida | CER dev (subconjunto) | CER dev (split completo) | Licencia |
|---|---|---:|---:|---|
| Baseline, sin cambios | Ninguna | 6,06 % | 6,25 % | DUA del proyecto |
| `parakeet-rnnt-0.6b-all-syn-chunk-cutout` | Chunk cutout y otras | No disponible en esta ficha | No disponible en esta ficha | DUA del proyecto |
| Este modelo | FadeOutIn (16 segmentos al 2 %) + BPE-dropout (p = 0,1) | 6,13 % | 6,12 % | DUA del proyecto |

Modelos comparables de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Ejecución única con una sola semilla: no existe estimación de varianza y las diferencias reportadas (menos de 0,2 puntos de CER) no deben leerse como una clasificación de métodos.
- Requiere `transformers>=5.9`; no es cargable con la línea 4.x, lo que puede romper pipelines existentes.
- Decodificación autorregresiva, más lenta que una alternativa CTC equivalente.
- Salida en minúsculas, sin puntuación y con numerales escritos como palabras; requiere posprocesado si se necesita formato legible.
- Solo inglés y solo audio a 16 kHz mono.
- Modelo de *constrained track*: se entrena únicamente con los corpus del reto (SAPC-1, SAPC-2), voz sintética CosyVoice3 y fragmentos alineados. El comportamiento fuera de esa distribución (acentos no representados, otras lenguas, ruido de canal, habla espontánea muy larga) no está documentado.
- Riesgo de alucinación y de sustituciones en palabras poco frecuentes inherente a cualquier sistema ASR autorregresivo; no se publican métricas por subgrupo ni análisis de errores por tipo de disartria.
- Sesgos potenciales: la composición demográfica de los corpus SAPC y el reparto de severidades no se detalla, por lo que se desconoce el rendimiento diferencial entre subpoblaciones de hablantes.
- No es una herramienta clínica: el autor indica explícitamente que nada en el modelo respalda inferencias diagnósticas.
- Licencia `speech-accessibility-project-dua`: es necesario revisar los términos antes de cualquier uso comercial. Los corpus SAPC no se redistribuyen y reproducir el conjunto de entrenamiento exige acceso autorizado. Los términos de Fun-CosyVoice3 aplican al componente de síntesis.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (los resultados devueltos tratan sobre trastornos del aprendizaje, no sobre reconocimiento de habla), por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-fade-bpedrop
- Ejecución hermana (chunk cutout): https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout
- Modelo base: https://huggingface.co/extraordinarylab/parakeet-unified-en-0.6b
- Corpus SAPC-1: https://huggingface.co/datasets/dys-asr/sapc1
- Corpus SAPC-2: https://huggingface.co/datasets/dys-asr/sapc2
- Licencia y condiciones del Speech Accessibility Project: https://speechaccessibilityproject.beckman.illinois.edu/
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
