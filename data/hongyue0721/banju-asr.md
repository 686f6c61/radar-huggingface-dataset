# hongyue0721/banju-asr

## Resumen

Banju-ASR es un modelo de reconocimiento automático del habla (ASR) en chino especializado en el dialecto de Shandong hablado por personas mayores. Lo desarrolla el usuario independiente hongyue0721 y parte de un ajuste fino de todos los parámetros de SenseVoice-Small (FunAudioLLM). El problema que aborda es concreto: los modelos ASR generalistas en chino fallan de forma severa con habla dialectal de edad avanzada, y este modelo reduce el error de carácter (CER) en ese dominio hasta un 52,71 %, frente al 64,25 % de su modelo base.

La relevancia actual del modelo no está en su precisión absoluta, que sigue siendo baja, sino en su relación entre precisión y coste computacional: se distribuye como ONNX INT8 listo para sherpa-onnx, ocupa 228,5 MiB y funciona en CPU con un pico de memoria de 469 MB y una velocidad de 49,5 veces el tiempo real en un AMD Ryzen 7 8845HS con 4 hilos. Frente a alternativas más precisas como FireRedASR2-AED (56,25 % de CER) es unas 12 veces más rápido y consume 3,9 veces menos memoria.

El modelo se publica como una versión v2 (checkpoint ep4) entrenada sobre 18.070 enunciados que mezclan habla dialectal de Shandong de personas mayores, mandarín del norte y mandarín estándar. La arquitectura es un codificador no autorregresivo con CTC, lo que explica su baja latencia y su idoneidad para despliegue en dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoice-Small ajustado: codificador con autoatención y módulos de memoria FSMN, decodificación CTC no autorregresiva |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio de duración variable) |
| Tipos de cuantizacion | INT8 (pesos MatMul en QUInt8 dinámico) |
| Idiomas soportados | chino (zh), con foco en dialecto de Shandong y mandarín del norte |
| Licencia | other (model-license, heredada de FunASR; enlace en la model card) |
| Formato de pesos | ONNX (opset 13), más `tokens.txt` |
| Tipo de modelo | `sense_voice_ctc`, version=2 |
| Entrada de audio | 16 kHz mono, 80 dimensiones Fbank con LFR (m=7, n=6, 560 dim), CMVN integrado |
| Vocabulario | 25.055 tokens |
| Tamano del repositorio | 0,3 GB (modelo y vocabulario suman 228,5 MiB) |
| Version publicada | v2, checkpoint ep4 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SenseVoice-Small: un codificador con autoatención y módulos de memoria FSMN, seguido de una cabeza CTC que decodifica de forma no autorregresiva con estrategia voraz. Esta elección elimina el bucle de decodificación token a token de los modelos autorregresivos y es la causa directa de su velocidad (49,5× tiempo real) y de su reducido consumo de memoria. El frontend acústico aplica Fbank de 80 dimensiones con LFR (m=7, n=6, concatenando en 560 dimensiones) y CMVN integrado en el grafo ONNX.

El ajuste fino es de todos los parámetros sobre 18.070 enunciados que combinan habla dialectal de Shandong de personas mayores, mandarín del norte y mandarín estándar. La model card no detalla el número total de tokens de audio, la composición exacta del corpus ni si se aplicaron técnicas de aumento de datos, RLHF o DPO; esos datos figuran como no disponibles. La versión v2 incrementa el peso del habla de personas mayores respecto a v1, lo que reduce el CER en el conjunto completo y en el subconjunto de hablantes no vistos (3,02 y 3,94 puntos porcentuales respectivamente), a costa de unos 0,2 puntos en KeSpeech y mandarín estándar. La cuantización es INT8 dinámica sobre los pesos MatMul, sin datos de calibración estática publicados.

## Capacidades

- Transcripción de voz a texto en chino, con especial robustez en dialecto de Shandong y habla de personas mayores.
- Reconocimiento de mandarín del norte (KeSpeech: jilu, jiaoliao, zhongyuan) y de mandarín estándar, con CER de 8,92 % y 4,09 % respectivamente.
- Decodificación no autorregresiva CTC, lo que permite procesar audio por lotes con baja latencia.
- Inferencia exclusiva en CPU mediante sherpa-onnx, sin necesidad de GPU.
- Soporte de puntuación y normalización inversa de texto (ITN) a través del parámetro `use_itn` de sherpa-onnx (en la evaluación se usó desactivado).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente ASR.
- No dispone de capacidades de visión, audio generativo ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al chino; en las pruebas, modelos comparables mostraron fugas de japonés e inglés, pero no se documenta que Banju-ASR las evite de forma explícita.

## Casos de uso

- Transcripción de entrevistas y testimonios de personas mayores: el modelo está entrenado específicamente con habla dialectal de edad avanzada de Shandong, por lo que es adecuado para digitalizar archivos orales etnográficos o históricos donde los ASR generalistas producen errores graves.
- Subtitulado y documentación de archivos audiovisuales locales: con 49,5× tiempo real en CPU, puede procesar horas de grabación en minutos en un portátil convencional, sin infraestructura GPU.
- Atención telefónica o teleasistencia a personas mayores en zonas rurales: permite transcribir llamadas con acento marcado en servidores modestos, con 469 MB de pico de memoria, lo que abarata el despliegue en centros comarcales.
- Investigación lingüística y dialectología: la evaluación sobre KeSpeech (jilu, jiaoliao, zhongyuan) y sobre hablantes no vistos permite usar el modelo como herramienta de anotación asistida en corpus dialectales.
- Despliegue en dispositivos de borde: el paquete ONNX INT8 de 228,5 MiB y la inferencia en CPU con sherpa-onnx permiten integrarlo en mini-PC, Raspberry Pi de gama alta o equipos sin GPU para kioscos de transcripción.
- Preprocesado en pipelines de datos: al ser rápido y ligero, sirve como primer paso de transcripción masiva antes de un modelo más preciso (por ejemplo, FireRedASR2-AED) en una etapa de refinado, reservando el modelo grande solo para los segmentos dudosos.
- Sistemas de accesibilidad para personas mayores con dificultades de escritura: dictado por voz en aplicaciones de mensajería o formularios, donde el acento y la edad del hablante degradan los modelos estándar.

## Benchmarks y rendimiento

Evaluación realizada en AMD Ryzen 7 8845HS con `num_threads=4`, sherpa-onnx 2.0.1, `use_itn=False`, decodificación serial en un proceso y versiones INT8 de todos los modelos. Conjunto `eval_shandong_elder`: 5 sesiones, 123 enunciados, 597,2 segundos.

| Modelo | Estructura | Tamano | Memoria pico | Velocidad (×tiempo real) | CER | CER pinyin sin tonos | CER hablantes no vistos (96) |
|---|---|---|---|---|---|---|---|
| Banju-ASR | SenseVoice-Small + CTC no autorregresiva | 228,5 MiB | 469 MB | 49,5× | 52,71 % | 49,64 % | 53,23 % |
| Banju-ASR v1 | igual | 228,5 MiB | 464 MB | 49,6× | 55,73 % | 52,88 % | 57,17 % |
| FireRedASR2-AED | Conformer + decodificador autorregresivo | 1177,5 MiB | 1828 MB | 4,1× | 56,25 % | 53,26 % | 54,95 % |
| FireRedASR2-CTC | Conformer CTC | 740,0 MiB | 1161 MB | 6,8× | 58,60 % | 54,91 % | 57,60 % |
| Qwen3-ASR-0.6B | AuT + Qwen3-0.6B | 941,3 MiB | 2047 MB | 6,4× | 62,77 % | 58,87 % | 62,28 % |
| SenseVoice-Small (base) | CTC no autorregresiva | 226,4 MiB | 475 MB | 49,8× | 64,25 % | 58,92 % | 65,42 % |
| Paraformer-zh-small | CIF no autorregresiva | 78,1 MiB | 270 MB | 133,9× | 69,53 % | 64,33 % | 69,48 % |
| Dolphin-base | E-Branchformer CTC | 99,4 MiB | 357 MB | 89,6× | 72,74 % | 68,29 % | 72,86 % |
| Fun-ASR-Nano-2512 | Codificador + Qwen3-0.6B | 963,3 MiB | 1882 MB | 7,1× | 84,09 % | 79,51 % | 64,37 % |
| Whisper-small | Transformer codificador-decodificador | 358,1 MiB | 1206 MB | 4,6× | 88,84 % | 78,06 % | 89,85 % |

Resultados sobre otros conjuntos:

| Conjunto | Paraformer-zh-small | SenseVoice-Small (base) | Banju-ASR v1 | Banju-ASR | Mejora frente a base (pp, IC 95 %) |
|---|---|---|---|---|---|
| Shandong mayores (123) | 69,53 % | 64,25 % | 55,73 % | 52,71 % | 11,99 [8,50, 15,52], p = 4,0e-12 |
| Hablantes no vistos (96) | 69,48 % | 65,42 % | 57,17 % | 53,23 % | 12,21 [7,96, 16,41], p = 2,3e-8 |
| KeSpeech mandarín (300) | 18,97 % | 16,72 % | 8,70 % | 8,92 % | 7,83 [6,25, 9,46], p = 1,7e-19 |
| Mandarín estándar (300) | 5,68 % | 5,10 % | 3,90 % | 4,09 % | 1,05 [0,39, 1,71], p = 0,0026 |

Desglose por sesión: en las sesiones de acento ligero (S01, S02) FireRedASR2-AED obtiene mejor CER (34,57 % y 41,38 % frente a 40,15 % y 47,75 % de Banju-ASR); en las de acento fuerte (S03–S05) Banju-ASR supera a todos los modelos externos (50,87 %, 58,35 % y 59,68 %). Fun-ASR-Nano-2512 y Whisper-small produjeron repeticiones y fugas de japonés e inglés en muestras de acento fuerte; Whisper-small generó 43 salidas con caracteres tradicionales (CER de 86,30 % tras conversión a simplificado). No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU. Memoria RAM pico de 469 MB con el modelo INT8.
- GPU recomendadas: no aplica; el modelo no está pensado para GPU. Si se desea, puede ejecutarse en GPU mediante proveedores ONNX Runtime, pero no hay datos publicados de rendimiento en GPU.
- GPU de consumo: irrelevante; cabe en cualquier equipo con al menos 1 GB de RAM libre.
- CPU de referencia: AMD Ryzen 7 8845HS con 4 hilos, 49,5× tiempo real, arranque en frío de 0,72 s.
- Despliegue: sherpa-onnx 2.0.1 o superior (API `OfflineRecognizer.from_sense_voice`), con proveedor `cpu`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Almacenamiento: 228,5 MiB para `model.int8.onnx` más `tokens.txt`; repositorio completo de 0,3 GB.
- Latencia y throughput: con 4 hilos, 49,5 veces la duración del audio; el rendimiento escala con el número de hilos de CPU, aunque no se publican curvas de escalado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | CER Shandong mayores | Memoria pico | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Banju-ASR | no disponible | audio variable, 16 kHz mono | 52,71 % | 469 MB | 49,5× | other (FunASR model-license) | Hugging Face, ONNX INT8 |
| SenseVoice-Small | no disponible | audio variable, 16 kHz mono | 64,25 % | 475 MB | 49,8× | modelo FunASR | Hugging Face / ModelScope |
| FireRedASR2-AED | no disponible | audio variable | 56,25 % | 1828 MB | 4,1× | no disponible en la información | disponible como modelo abierto |
| Qwen3-ASR-0.6B | 0,6B (según nombre) | audio variable | 62,77 % | 2047 MB | 6,4× | no disponible en la información | disponible como modelo abierto |

Frente a SenseVoice-Small, Banju-ASR mejora el CER en 11,54 puntos con un coste de memoria y velocidad prácticamente idéntico. Frente a FireRedASR2-AED, es algo menos preciso en global (52,71 % frente a 56,25 % a su favor, aunque por sesiones depende del acento) pero 12 veces más rápido y 3,9 veces más ligero en memoria. Frente a Qwen3-ASR-0.6B, gana en precisión (52,71 % frente a 62,77 %) y es 7,7 veces más rápido con 4,4 veces menos memoria.

## Limitaciones y advertencias

- El CER absoluto sigue siendo alto: 52,71 % en el conjunto objetivo, lo que implica que más de la mitad de los caracteres se transcriben mal en promedio. No es apto para transcripción de precisión sin revisión humana.
- El dominio está muy acotado: habla dialectal de Shandong de personas mayores y mandarín del norte. En otras variedades del chino o en habla no dialectal su ventaja se reduce.
- En sesiones de acento ligero, FireRedASR2-AED es más preciso; el modelo no domina de forma uniforme todos los registros.
- Riesgo de alucinación y repetición en audio degradado: aunque no se documenta en Banju-ASR, modelos comparables (Fun-ASR-Nano-2512, Whisper-small) generaron repeticiones y fugas de otros idiomas en las mismas muestras, por lo que conviene validar la salida en producción.
- Sesgos demográficos: el entrenamiento se centra en hablantes mayores de Shandong; el rendimiento con hablantes jóvenes o de otras regiones puede degradarse.
- Licencia `other` heredada de FunASR (`model-license`): es imprescindible revisar los términos del enlace antes de cualquier uso comercial; la model card no aclara restricciones específicas.
- No hay datos publicados sobre número de parámetros, tokens de entrenamiento ni composición exacta del corpus, lo que dificulta la reproducibilidad.
- La cuantización INT8 puede introducir pérdida adicional de precisión frente al modelo en punto flotante; no se publican métricas del modelo sin cuantizar.
- El modelo solo soporta chino; no debe usarse para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hongyue0721/banju-asr
- Modelo base SenseVoice-Small: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Licencia del modelo (FunASR MODEL_LICENSE): https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Repositorio FunASR: https://github.com/modelscope/FunASR
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- KeSpeech (conjunto de evaluación de mandarín): https://github.com/KeSpeech/KeSpeech
