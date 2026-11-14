# shrirajh/parakeet-tamil-kili

## Resumen

parakeet-tamil-kili (தமிழ் கிளி, "loro tamil") es un modelo de reconocimiento automático del habla (ASR) especializado en tamil, inglés y el habla mezclada tamil-inglés (code-switching o "Tanglish"). Lo desarrolla shrirajh como un ajuste fino del modelo NVIDIA parakeet-tdt-0.6b-v3, un FastConformer con decodificador TDT (Token-and-Duration Transducer) de 0,6 mil millones de parámetros. El modelo resuelve un problema concreto: la mayoría de los ASR multilingües rinden mal en tamil conversacional y en la alternancia de código tamil-inglés, con tasas de error por palabra (WER) superiores al 100 % en los modelos base.

La propuesta diferencial es doble. Por un lado, prioriza el tamil conversacional, donde supera ampliamente a alternativas abiertas como indic-transcribe-core o IndicWhisper (34,05 % de WER frente a 49,28 % y 68,84 % respectivamente en IndicVoices). Por otro, está diseñado para ejecutarse en CPU: el encoder ONNX en int8 corre unas 28 veces más rápido que el tiempo real con 8 hilos y un pico de unos 2,8 GB de memoria, sin necesidad de PyTorch. Esto lo hace viable en dispositivos de borde, navegadores (onnxruntime-web) y asistentes domésticos como Home Assistant mediante el protocolo Wyoming.

El modelo tiene 629.708.946 parámetros, se distribuye en safetensors y ONNX, y se publica bajo licencia CC BY-SA 4.0. Su relevancia actual radica en cubrir un hueco poco atendido: ASR de calidad para tamil real (conversacional y code-switched) con requisitos de hardware muy bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 629.708.946 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | ONNX int8 (encoder); pesos safetensors en precision original; cuantizaciones adicionales no disponibles |
| Idiomas soportados | tamil (ta), ingles (en) y code-switching tamil-ingles |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de nvidia/parakeet-tdt-0.6b-v3 y conserva su arquitectura FastConformer-TDT: un encoder Conformer con downsampling agresivo (fast) y un decodificador transducer que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autorregresiva por bloques y buena eficiencia en CPU. El ajuste fino se realizo durante 5 epocas (run 10) sobre un corpus compuesto por ai4bharat/IndicVoices (tamil conversacional), ai4bharat/Shrutilipi, ai4bharat/Kathbath, espnet/yodas3, espnet/yodas-granary, ai4bharat/sangraha y vishnu-n/Tanglish-Corpus-185k, lo que aporta tanto habla leida como conversacional y ejemplos de alternancia de codigo.

Una innovacion destacable es el tratamiento explicito del code-switching: el modelo emite las palabras inglesas en alfabeto latino con el sufijo tamil adjunto (por ejemplo, `meeting-க்கு`, `office-ல`), aplicando una regla aprendida de conversion de prestamos lexicos. Segun la model card, el 89 % de las palabras inglesas en tamil conversacional (IndicVoices) salen en escritura latina y solo el 6 % en escritura tamil. Ademas, se publica un modelo de lenguaje de 5-gramas entrenado con Sangraha que puede usarse en decodificacion beam-4 con puerta (gated) para reducir el WER. No se detalla en la informacion disponible si hubo RLHF o DPO; el entrenamiento parece ser supervisado sobre transcripciones.

## Capacidades

- Reconocimiento de voz tamil (leido y conversacional) e ingles, con salida de texto.
- Manejo nativo de code-switching tamil-ingles, incluyendo prestamos lexicos con sufijos tamil.
- Decodificacion greedy y decodificacion beam-4 con modelo de lenguaje de 5-gramas (Sangraha) para mejorar precision.
- Inferencia en CPU mediante ONNX int8, sin dependencia de PyTorch.
- Ejecucion en navegador con onnxruntime-web.
- Integracion con Home Assistant mediante Wyoming.
- Soporte de tool calling / function calling: no aplica (modelo ASR, no generativo de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: tamil e ingles; no se documentan otros idiomas.
- Capacidades especiales: modo de conversion de prestamos lexicos y salida con metricas PER/EER documentadas en el write-up.

## Casos de uso

- Subtitulado y transcripcion de contenido audiovisual tamil: el modelo transcribe audio conversacional con un WER de 34,05 % en IndicVoices, el mejor de su categoria entre los modelos abiertos comparados, lo que lo hace adecuado para generar subtitulos en videos, podcasts y reuniones en tamil.
- Asistentes de voz domoticos en Home Assistant: gracias a la integracion Wyoming y a la inferencia ONNX en CPU (28x tiempo real en 8 hilos, 2,8 GB de pico), puede desplegarse en un mini-PC o servidor domestico sin GPU para comandos de voz en tamil e ingles.
- Transcripcion en el navegador con privacidad: mediante onnxruntime-web, el audio no sale del dispositivo, lo que sirve para dictado o notas de voz en aplicaciones web con requisitos de privacidad.
- Atencion al cliente en tamil: permite transcribir llamadas o chats de voz de soporte donde los usuarios mezclan tamil e ingles, un patron habitual en India; el manejo del code-switching evita perder terminos tecnicos en ingles.
- Generacion de datos y etiquetado para ASR: puede usarse para pre-anotar audio tamil conversacional y reducir el esfuerzo humano de transcripcion, especialmente en dominios con poco corpus etiquetado.
- Investigacion en code-switching: el modelo y su corpus de entrenamiento (Tanglish-Corpus-185k) sirven como base para estudiar y evaluar tecnicas de normalizacion de prestamos lexicos y alternancia de codigo.
- Despliegue en dispositivos de borde: al no requerir PyTorch y caber en unos 2,8 GB de memoria en int8, es apto para Raspberry Pi de gama alta, mini-PC o entornos con CPU limitada.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en %, menor es mejor; hasta 2.000 clips por conjunto de test; FLEURS completo: 580; MILE: 1.333). "kili + LM" es decodificacion beam-4 con el 5-grama Sangraha.

| Conjunto de test | Tipo | kili | kili + LM | indic-transcribe-core | IndicWhisper | parakeet v3 original |
|---|---|---|---|---|---|---|
| IndicVoices | conversacional | 34,05 | 33,53 | 49,28 | 68,84 | 103,92 |
| Kathbath | leido | 29,15 | 25,38 | 20,80 | 21,77 | 117,16 |
| MILE | leido | 27,89 | 26,31 | 23,37 | 19,61 | 114,87 |
| FLEURS ta | leido | 30,46 | 27,36 | 21,47 | 23,25 | 114,78 |
| Common Voice ta | leido | 35,22 | 32,60 | 26,70 | 29,73 | 111,26 |
| OpenSLR-65 | leido | 24,84 | 20,73 | 15,19 | 24,43 | 114,76 |
| Common Voice en | ingles | 10,19 | 10,19 | 11,94 | no disponible | 9,25 |
| LibriSpeech clean / other | ingles | 2,30 / 4,07 | igual | 2,15 / 3,88 | no disponible | 2,17 / 3,51 |
| Svarah | ingles con acento indio | 10,67 | 10,65 | 9,74 | no disponible | 9,62 |

Lectura de los datos: el modelo lidera en tamil conversacional con una ventaja de unos 15 puntos de WER sobre el siguiente mejor modelo abierto; en tamil leido queda por detras de indic-transcribe-core e IndicWhisper, con una brecha mayor en WER (ortografia) que en PER (sonidos); en ingles se mantiene cerca del parakeet v3 original, sin olvidar el idioma. Los resultados no estan verificados por un tercero (`verified: false`).

## Requisitos de hardware

- VRAM estimada: no aplica en el modo CPU; en GPU, el modelo de 0,6B en fp16 requiere aproximadamente 1,3 GB de pesos mas memoria de activaciones (estimacion orientativa, no publicada por el autor).
- Memoria en CPU: pico de unos 2,8 GB con el encoder ONNX int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se publican requisitos especificos. Para CPU, 8 hilos ofrecen unas 28 veces el tiempo real.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2-4 GB de memoria (estimacion orientativa).
- Opciones de despliegue: NeMo (libreria nativa), ONNX Runtime, onnxruntime-web (navegador), Home Assistant via Wyoming.
- Latencia y throughput: en CPU int8, aproximadamente 28x tiempo real con 8 hilos; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER IndicVoices (ta conv.) | WER FLEURS ta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| parakeet-tamil-kili | 0,63B | no disponible | 34,05 | 30,46 | CC BY-SA 4.0 | Hugging Face, ONNX, navegador |
| indic-transcribe-core | no disponible | no disponible | 49,28 | 21,47 | no disponible | Hugging Face |
| IndicWhisper | no disponible | no disponible | 68,84 | 23,25 | no disponible | GitHub (AI4Bharat vistaar) |
| parakeet-tdt-0.6b-v3 | 0,6B | no disponible | 103,92 | 114,78 | no disponible en la informacion | Hugging Face |

El modelo se posiciona como la mejor opcion abierta para tamil conversacional y code-switching, a costa de quedar por detras en tamil leido frente a indic-transcribe-core e IndicWhisper. Frente a su modelo base, la mejora en tamil es de orden de magnitud (de mas del 100 % de WER a alrededor del 30 %).

## Limitaciones y advertencias

- Rendimiento inferior en tamil leido (noticias, prompts) frente a indic-transcribe-core e IndicWhisper; la brecha se debe sobre todo a diferencias ortograficas (WER) mas que acusticas (PER).
- WER absoluto alto en tamil conversacional (34,05 %), por lo que no es apto para transcripcion sin revision en entornos de alta exigencia.
- Riesgo de alucinacion y errores de normalizacion en prestamos lexicos: la regla de conversion de palabras inglesas a escritura latina con sufijo tamil puede fallar en terminos poco frecuentes.
- En ingles con acento indio (Svarah), un 9,5 % de los clips contienen algo de escritura tamil (1,5 % de las palabras), principalmente toponimos y nombres propios; puede requerir post-procesado.
- Idiomas limitados a tamil e ingles; no cubre otras lenguas indias.
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir; revisar implicaciones antes de integrarlo en productos propietarios.
- Resultados de benchmarks no verificados por terceros (`verified: false`); las cifras provienen del autor.
- No se documentan sesgos especificos ni evaluaciones de robustez ante ruido, acentos regionales o audio de baja calidad.
- El modelo no es generativo de instrucciones: no soporta tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shrirajh/parakeet-tamil-kili
- Write-up interactivo (ingles y tamil): https://shrirajh.github.io/parakeet-tamil-kili/
- Demo en navegador (CPU): https://shrirajh.github.io/parakeet-tamil-kili/try/
- Codigo: https://github.com/shrirajh/parakeet-tamil-kili
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo de lenguaje Sangraha: https://huggingface.co/shrirajh/parakeet-tamil-kili/tree/main/lm
- Alternativa indic-transcribe-core: https://huggingface.co/bodhan-ai/indic-transcribe-core
- Alternativa IndicWhisper (AI4Bharat vistaar): https://github.com/AI4Bharat/vistaar
