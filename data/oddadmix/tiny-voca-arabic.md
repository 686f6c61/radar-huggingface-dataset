# oddadmix/tiny-voca-arabic

## Resumen

tiny-voca-arabic es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno (فصحى) desarrollado por el usuario oddadmix. Se trata de un modelo extremadamente compacto, con solo 4,5 millones de parámetros (18 MB en PyTorch, 21 MB en ONNX), entrenado desde cero sobre la arquitectura tiny-voca de Muhammed Nazeem y un nuevo front-end fonético árabe. Genera audio mono a 24 kHz a partir de texto, incluyendo el generador de forma de onda, sin vocoder neuronal separado.

Su relevancia radica en la eficiencia: funciona a aproximadamente 200 veces el tiempo real sobre dos hilos de CPU, lo que lo hace apto para despliegue en entornos sin GPU, dispositivos embebidos o asistentes de voz de baja latencia. Frente a los TTS neuronales habituales de cientos de millones de parámetros, demuestra que un modelo de 4,5M puede alcanzar inteligibilidad alta (CER del 1,8% en test según transcripción con Whisper large-v3) en una lengua con fonología compleja como el árabe.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en ONNX y PyTorch, y una única voz sintética identificada como `a000`. Está entrenado sobre 45.737 emisiones (89 horas) de un corpus sintético de un solo hablante con turnos de diálogo de asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (red acústica + sintetizador source-filter; sin vocoder neuronal) |
| Parametros totales | 4.531.723 (18 MB PyTorch, 21 MB ONNX) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (límite práctico de 500 fonemas / 32 s por llamada) |
| Tipos de cuantizacion | no disponible (pesos ONNX y PyTorch sin cuantización declarada) |
| Idiomas soportados | árabe estándar moderno (ar, MSA) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime) y checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura tiny-voca: una red acústica que predice duraciones, pausas, tono (F0), sonoridad y energía a partir de una secuencia de fonemas, seguida de un sintetizador source-filter que genera la forma de onda directamente. No emplea vocoder neuronal independiente ni decodificación especulativa. El front-end es específico para árabe: expansión de números a palabras MSA, diacritización automática con CATT (encoder-decoder, Apache-2.0) y conversión reglada a 49 símbolos fonéticos que cubren asimilación de letras solares, elisión de hamzat al-wasl con vocales de apoyo, acortamiento de vocales largas ante wasl, shadda como consonante duplicada, tanween, tāʾ marbūṭa (t en interior de frase, omitida en pausa), formas pausales en puntuación, refuerzo enfático de /a/ junto a ص ض ط ظ ق (y tras خ غ ر), lām oscura en الله y asignación de acento por peso silábico.

El entrenamiento se realizó desde cero (sin reutilizar pesos de tiny-voca) sobre el dataset oddadmix/msa-duplex-assistant-tts, con 49.793 clips de los que 45.737 superaron los controles de alineamiento, totalizando 89 horas. Se completaron 104.000 pasos en 2,6 horas sobre una única GPU. Un detalle técnico destacable es el tratamiento de las terminaciones de caso (iʿrāb): durante el alineamiento, cada terminación en interior de frase se conservó o eliminó por clip según la comparación de verosimilitud CTC con el audio real, de modo que el modelo aprendió de lo efectivamente pronunciado; aproximadamente la mitad se descartaron. No se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz a partir de texto en árabe estándar moderno con una voz sintética única (`a000`).
- Salida de audio mono a 24 kHz generada directamente por el modelo, sin vocoder externo.
- Control de velocidad mediante el parámetro `speed` (1 = velocidad predicha, valores mayores aceleran).
- Control de tono mediante `pitch_shift` (incremento en log F0; 0,058 ≈ un semitono) y de entonación mediante `pitch_range`.
- Expansión automática de números a palabras MSA y lectura de porcentajes.
- Diacritización automática con CATT para resolver la pronunciación de texto sin tashkeel.
- Fonología MSA avanzada: asimilación solar, elisión de hamzat al-wasl, shadda, tanween, formas pausales y acento por peso silábico.
- Inferencia en CPU con onnxruntime a aproximadamente 200× tiempo real sobre dos hilos.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz en árabe sobre hardware sin GPU: el modelo corre a 200× tiempo real en dos hilos de CPU, por lo que puede integrarse en dispositivos embebidos, Raspberry Pi o servidores modestos para lectura de respuestas de un asistente conversacional.
- Lectura de contenido en aplicaciones móviles: artículos, notificaciones o mensajes se pueden sintetizar frase a frase (límite de 500 fonemas / 32 s por llamada) y concatenar el audio, con control de velocidad para accesibilidad.
- Sistemas de anuncios y avisos públicos en MSA: la salida a 24 kHz y la expansión automática de números permiten locutar cifras, porcentajes y datos de forma correcta sin preprocesado manual.
- Prototipado rápido de interfaces de voz: al pesar 21 MB en ONNX, se puede incluir en un contenedor ligero o en el navegador mediante onnxruntime para demos y pruebas de UX sin infraestructura de GPU.
- Generación de audio para doblaje o narración de diálogos de asistente: el corpus de entrenamiento procede de turnos de diálogo, por lo que el modelo está ajustado al registro conversacional del asistente en MSA.
- Investigación en TTS de bajo coste: su licencia Apache-2.0 y su tamaño permiten usarlo como base o referencia para experimentos de fonética árabe, front-ends y síntesis source-filter sin restricciones de uso comercial.
- Accesibilidad para lectores de pantalla en árabe: la baja latencia y el consumo mínimo de CPU permiten lectura en tiempo real de texto seleccionado en aplicaciones de escritorio.

## Benchmarks y rendimiento

Evaluación mediante transcripción con Whisper large-v3 del audio generado frente al texto de entrada (sin diacríticos ni puntuación). Los conjuntos de validación y test provienen de diálogos no vistos en entrenamiento; las frases nuevas no aparecen en ningún split.

| Conjunto | Clips | CER | WER | CER de las grabaciones originales |
|---|---|---|---|---|
| Validación | 25 | 0,5% | 1,2% | 1,0% |
| Test | 25 | 1,8% | 2,4% | 2,1% |
| Frases nuevas | 8 | 0,3% | 1,4% | no disponible |

La mayoría de los errores restantes corresponden a Whisper escribiendo números hablados como dígitos. Las duraciones generadas están dentro del 3% de las grabaciones y la variación de tono coincide (3,6 semitonos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por no ser aplicables a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo ONNX CPU; en GPU, el modelo de 4,5M de parámetros ocupa del orden de decenas de MB, aunque no se documentan requisitos formales.
- GPU recomendadas: no disponible; el modelo está diseñado explícitamente para CPU.
- Cabe en cualquier GPU consumer e incluso en CPU de dos hilos; no requiere acelerador.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider) para los pesos ONNX; checkpoint PyTorch `tiny-voca-arabic.pt` cargable con el código de tiny-voca (`tiny_voca.infer.load_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: aproximadamente 200× tiempo real sobre dos hilos de CPU, según el autor.
- Dependencias de ejecución: onnxruntime, numpy, soundfile y tqdm; el front-end requiere CATT para la diacritización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tiny-voca-arabic | 4,5M | 500 fonemas / 32 s por llamada | Árabe MSA | Apache-2.0 | ONNX, PyTorch |
| tiny-voca (original) | no disponible | no disponible | Inglés (según modelo base) | Apache-2.0 | no disponible |
| TTS neuronales convencionales (p. ej. VITS, FastSpeech2) | cientos de millones (orden de magnitud habitual) | por frase | múltiple según modelo | variable | PyTorch, ONNX |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; no se han publicado métricas comparativas frente a otros sistemas TTS en árabe.

## Limitaciones y advertencias

- Una sola voz (`a000`) y únicamente árabe estándar moderno; el texto dialectal se lee con reglas MSA, lo que puede sonar artificial o incorrecto.
- La pronunciación depende de la diacritización automática de CATT; cuando elige una lectura errónea (por ejemplo نَمَوذج en lugar de نُموذج), el modelo la pronuncia tal cual. Es necesario añadir tashkeel manual para corregir palabras concretas.
- Se omiten la escritura latina, los emojis y los símbolos distintos de números y el signo de porcentaje.
- Cobertura fonética limitada: las enfáticas ص/ط/ض/ظ están bien cubiertas, pero la lām oscura solo aparece en الله.
- Límite práctico de 500 fonemas o 32 segundos por llamada; el texto largo debe dividirse por frases y concatenarse, lo que puede introducir discontinuidades en la prosodia entre fragmentos.
- Riesgo de alucinación acústica no documentado explícitamente, pero la dependencia de la diacritización implica errores de pronunciación predecibles ante texto ambiguo.
- El corpus es sintético y de un solo hablante, por lo que la naturalidad y variabilidad prosódica pueden ser limitadas frente a grabaciones humanas.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Para producción, conviene validar el front-end (CATT) y el tratamiento de números en el dominio concreto de la aplicación, y monitorizar la calidad en textos con abundante terminología o nombres propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/tiny-voca-arabic
- Demo (Space): https://huggingface.co/spaces/oddadmix/tiny-voca-arabic
- Dataset de entrenamiento: https://huggingface.co/datasets/oddadmix/msa-duplex-assistant-tts
- tiny-voca (modelo base de la arquitectura): https://huggingface.co/n4ze3m/tiny-voca
- Código de tiny-voca: https://github.com/n4ze3m/tiny-voca
- CATT (diacritizador): https://github.com/abjadai/catt
