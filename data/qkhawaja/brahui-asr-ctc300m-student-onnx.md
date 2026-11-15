# qkhawaja/brahui-asr-ctc300m-student-onnx

## Resumen

Brahui ASR CTC-300M student ONNX es un modelo de reconocimiento automático del habla (ASR) para brahui (`brh`), una lengua dravídica de Pakistán y Afganistán escrita en alfabeto persoárabe. Lo publica qkhawaja, un desarrollador individual, como instantánea de investigación de un proyecto personal y no como producto soportado. El modelo resuelve un problema de nicho: llevar ASR de una lengua de bajos recursos a un navegador web, sin servidor ni GPU dedicada.

Arquitectura wav2vec2 con cabecera CTC, 315 millones de parámetros, destilado a partir de un modelo profesor de 1B parámetros (omniASR CTC-1B). Se distribuye en formato ONNX en tres precisiones (int8, fp16 y fp32) junto con un modelo de lenguaje de caracteres de 6-gramas podado que se usa en decodificación beam search. La entrada es audio mono a 16 kHz y la salida son logits CTC sobre el tokenizador incluido en el repositorio.

Su relevancia actual es doble: demuestra que un modelo de 300M puede superar a su profesor de 1B en CER sobre voz leída cuando se combina con un LM de caracteres, y valida un flujo de despliegue íntegramente en cliente mediante transformers.js, WebGPU y WebAssembly. La licencia Apache-2.0 facilita su reutilización comercial, aunque el propio autor advierte que se trata de un snapshot sin revisión sistemática por hablantes nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 + cabecera CTC (modelo acústico destilado de omniASR CTC-300M v2) |
| Parametros totales | 315 M (300 M según nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | clips de audio de 20 segundos o menos (recomendación del autor) |
| Tipos de cuantizacion | int8, fp16 y fp32 (archivos ONNX separados) |
| Idiomas soportados | brahui (`brh`), alfabeto persoárabe |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx`, `model_fp16.onnx`, `model.onnx`) + LM binario `brh_char6.blm` |

## Arquitectura y entrenamiento

El modelo acústico es omniASR CTC-300M v2 afinado durante 4.000 pasos sobre dos fuentes: BrahuiSpeech-70H-V2 (licencia MIT, transcripciones normalizadas a la ortografía de Common Voice) y 10,4 horas de audio de emisión de brahui procedente de canales públicos de YouTube, transcrito automáticamente por el profesor de 1B (pseudo-etiquetas). Ese audio de emisión no se redistribuye. La arquitectura es un transformer tipo wav2vec2 con decodificación CTC, sin mecanismos de atención lineal ni decodificación especulativa.

El componente que marca la diferencia es el modelo de lenguaje: un 6-gramas de caracteres con suavizado Kneser-Ney, podado, entrenado sobre 111.000 frases en brahui (transcripciones de los corpus abiertos, texto web y las transcripciones automáticas de emisión), con eliminación previa de frases presentes en los conjuntos de test. La decodificación beam search usa haz 16 con pesos alpha 0,5 y beta 0,5, implementada en `demo/web/ctc_lm.js`. No se documenta RLHF ni DPO.

## Capacidades

- Reconocimiento de voz en brahui con salida en alfabeto persoárabe.
- Decodificación greedy (solo modelo acústico) y beam search con LM de caracteres.
- Inferencia local en navegador mediante transformers.js, con backend WebGPU (fp16) o WebAssembly (int8).
- Procesamiento de clips de hasta 20 segundos; entrada mono a 16 kHz.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No tiene capacidades de visión, audio generativo ni modo thinking.
- Multilingüismo limitado a un único idioma (`brh`).

## Casos de uso

- Subtitulado en cliente de vídeo en brahui: el modelo corre en el navegador con WebGPU y permite generar subtítulos sin enviar audio a un servidor, relevante por privacidad y por conectividad limitada en regiones donde se habla brahui.
- Aplicaciones web educativas para aprendizaje del brahui: integración vía transformers.js en una página estática, con el build int8 de 366 MB para usuarios sin GPU.
- Digitalización de archivos de emisión: las 10,4 horas de YouTube del entrenamiento muestran el flujo; el modelo puede transcribir grabaciones de radio o televisión en brahui para construir corpus textuales.
- Investigación en lenguas de bajos recursos: el par profesor (1B) y estudiante (300M) más el LM de caracteres sirve como referencia reproducible de destilación y decodificación con LM en un idioma con pocos datos.
- Normalización ortográfica asistida: dado que las transcripciones se normalizaron a la ortografía de Common Voice y el LM empuja hacia grafías frecuentes, el modelo ayuda a estandarizar texto transcrito manualmente.
- Prototipado de interfaces de voz offline: con WebAssembly e int8 funciona a unas 0,3 veces el tiempo real, suficiente para dictado por turnos en entornos sin red.
- Evaluación comparativa de decodificadores: el repositorio incluye scripts de evaluación y el decodificador de referencia, útil para medir el impacto de LM y beam search sobre CER en lenguas de bajos recursos.

## Benchmarks y rendimiento

CER sobre el split de test de Common Voice Brahui (882 clips):

| Modelo y decodificación | CER |
|---|---|
| Profesor 1B (`qkhawaja/brahui-asr-ctc1b-s3`), greedy | 8,6 |
| Este modelo, greedy | 9,9 |
| Este modelo, beam search + LM de caracteres 6-gramas | 8,0 |

Sobre habla espontánea (test de Omnilingual): 12,6 greedy para este modelo frente a 12,0 del profesor.

Velocidad en Chrome sobre Apple M1: con WebGPU y build fp16, 0,21 s para una frase de 3 segundos y 0,65 s para un clip de 9 segundos; con WebAssembly e int8, aproximadamente 0,3 veces el tiempo real.

## Requisitos de hardware

- VRAM/disco para inferencia: 366 MB (int8), 652 MB (fp16) y 1,3 GB (fp32); el repositorio completo ocupa 2,3 GB.
- GPU recomendadas: no se especifican modelos concretos; el autor solo reporta pruebas en Apple M1 con WebGPU. Cualquier GPU con soporte WebGPU en el navegador puede ejecutar el build fp16.
- Cabe en GPU de consumo: sí, el build int8 (366 MB) y el fp16 (652 MB) caben holgadamente en cualquier GPU de consumo con WebGPU; el fp32 también, pero sin ventaja práctica en navegador.
- Opciones de despliegue: transformers.js en navegador (WebGPU o WebAssembly); los archivos ONNX son compatibles con runtimes ONNX genéricos, aunque el autor solo documenta el flujo de transformers.js.
- Latencia y throughput: 0,21 s para 3 s de audio y 0,65 s para 9 s de audio en M1 con WebGPU fp16; aproximadamente 0,3× tiempo real con WebAssembly int8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (Common Voice Brahui) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (beam + LM) | 315 M | clips ≤ 20 s | 8,0 | Apache-2.0 | ONNX |
| Profesor `brahui-asr-ctc1b-s3` | 1 B | no disponible | 8,6 (greedy) | no disponible en la información proporcionada | no disponible |
| `aadel4/omniASR-CTC-300M-v2` (base) | 300 M | no disponible | no disponible | no disponible en la información proporcionada | no disponible |

No se dispone de datos de otros sistemas ASR para brahui en la información proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- El LM de caracteres empuja la salida hacia grafías comunes: mejora en voz leída pero puede perjudicar nombres propios y palabras raras.
- Limitaciones heredadas del profesor: poco habla conversacional en el entrenamiento, ortografía no estandarizada y ausencia de revisión sistemática por hablantes nativos.
- Riesgo de alucinación textual derivado de las pseudo-etiquetas del profesor de 1B usadas en 10,4 horas de audio de emisión.
- Sesgo potencial hacia el dominio de emisión y hacia la ortografía de Common Voice, que puede no coincidir con la práctica de todos los hablantes.
- Restricción práctica de longitud: clips de 20 segundos o menos; no se documenta manejo de audio más largo.
- El audio de emisión de YouTube no se redistribuye; el autor pide abrir una discusión en la pestaña Community ante cualquier preocupación, incluida la de hablantes presentes en ese audio.
- Licencia Apache-2.0 permite uso comercial, pero el autor califica el modelo como snapshot de investigación sin soporte; conviene validarlo con datos propios antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qkhawaja/brahui-asr-ctc300m-student-onnx
- Modelo profesor: https://huggingface.co/qkhawaja/brahui-asr-ctc1b-s3
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-300M-v2
- Repositorio del proyecto (código, scripts de evaluación y write-up): https://github.com/qasimy123/brahui-digitize
