# Eddylin03/tiny-voca-zh-warm

## Resumen

tiny-voca-zh-warm es un modelo de síntesis de voz (text-to-speech) para mandarín desarrollado por Eddylin03. Se trata de una destilación de un modelo de voz grande, Qwen3-TTS, en una red extremadamente compacta de 4,5 millones de parámetros y 18 MB de pesos. Genera audio a 24 kHz con una única voz masculina denominada "warm" (identificador `ZH_M1`). Su propuesta principal es la eficiencia: funciona en la CPU de un portátil y sintetiza una frase de cuatro segundos en aproximadamente medio segundo.

El modelo se entrenó como proyecto de aprendizaje, de principio a fin en Google Colab y sobre una única GPU NVIDIA L4 durante unas 21 horas (104.000 pasos). La voz no procede de una grabación ni de un clon de una persona real, sino que se diseñó a partir de una descripción textual con Qwen3-TTS VoiceDesign. Todo el corpus de entrenamiento es sintético: 42.181 clips (31,2 horas) generados por el modelo profesor y filtrados automáticamente.

Es relevante para quienes necesitan TTS en mandarín en entornos con recursos muy limitados (dispositivos embebidos, aplicaciones de escritorio, prototipos sin GPU) y para quienes estudian técnicas de destilación de modelos de voz. No obstante, es un artefacto experimental con una sola voz, sin evaluación perceptiva humana y con calidad de audio inferior a la del profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz derivado de tiny-voca-zh; detalles de capas no publicados) |
| Parametros totales | 4,5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos de 18 MB en formato `.pt`) |
| Idiomas soportados | chino mandarín (`zh`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) |

Otros datos técnicos: frecuencia de muestreo de 24 kHz, una única voz (`ZH_M1`), tamaño del repositorio 0,0 GB según Hugging Face (los pesos se referencian como `tiny-voca-zh-warm.pt`).

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá de que es un port a mandarín del proyecto tiny-voca de n4ze3m (código Apache-2.0) y de que se trata de una destilación de Qwen3-TTS. No se especifican el tipo de decoder, el vocoder ni el mecanismo de alineación texto-audio.

El proceso de construcción sí está documentado con precisión. Primero se diseñó una voz a partir de una descripción textual con Qwen3-TTS VoiceDesign. Después, Qwen3-TTS Base leyó 44.000 frases en mandarín con esa voz; las frases provienen de Tatoeba y de oraciones generadas con números, fechas, precios y horas. Cada clip se transcribió con Paraformer (FunASR) y se descartaron los que superaban un 15 % de tasa de error de caracteres, quedando 42.181 clips (31,2 horas). El entrenamiento se ejecutó durante 104.000 pasos, unas 21 horas en una NVIDIA L4. El modelo incluye un parche de corrección tonal (`zh_yi_sandhi.patch`) que debe aplicarse sobre el código de inferencia.

## Capacidades

- Síntesis de voz en mandarín a partir de texto, con salida de audio a 24 kHz.
- Una única voz masculina predefinida (`ZH_M1`), descrita como "warm".
- Inferencia en CPU: una frase de cuatro segundos tarda aproximadamente medio segundo.
- Manejo de números, fechas, precios y horas en el texto de entrada, ya que el corpus de entrenamiento incluyó específicamente estos formatos.
- Corrección de tonos dependientes de fronteras de palabra mediante el parche `zh_yi_sandhi.patch`.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento.
- No es multilingüe: solo mandarín; las letras latinas de la entrada se omiten.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio: integrar el modelo como motor TTS local en una app de lectura o accesibilidad, aprovechando que corre en CPU sin GPU dedicada y con 18 MB de pesos.
- Prototipado rápido de interfaces de voz: validar flujos de conversación en mandarín antes de invertir en un modelo de producción de mayor calidad, dado el bajo coste de despliegue.
- Dispositivos embebidos y de bajos recursos: su tamaño permite incluirlo en sistemas con memoria limitada donde un modelo TTS convencional no cabría.
- Generación de avisos y locuciones cortas: anuncios de precios, fechas y horas en aplicaciones o terminales, un formato que el corpus de entrenamiento cubrió de forma explícita.
- Docencia e investigación sobre destilación: sirve como caso de estudio reproducible de destilación de un modelo de voz grande a uno pequeño, con el pipeline completo documentado.
- Pruebas automatizadas de pipelines de audio: generar clips de referencia en mandarín de forma rápida y barata para tests de integración de sistemas de ASR o de diálogo.
- Materiales de aprendizaje de pronunciación: producir audio de frases de Tatoeba en mandarín para ejercicios, asumiendo la limitación de una sola voz y de calidad no natural.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre 300 frases no vistas, sintetizadas y transcritas con Paraformer (mide inteligibilidad, no naturalidad):

| Medida | tiny-voca-zh-warm | Profesor (Qwen3-TTS) |
|---|---|---|
| Tasa de error de caracteres media | 3,3 % | 2,5 % |
| Tasa de error de caracteres mediana | 0 % | no disponible |
| Frases transcritas sin errores | 229 de 300 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo TTS. Tampoco se realizó ninguna prueba de escucha con personas.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para ejecutarse en CPU. Con 18 MB de pesos, la memoria necesaria es mínima (del orden de cientos de MB incluyendo el runtime de PyTorch).
- GPU recomendadas: ninguna en particular; el entrenamiento se hizo en una NVIDIA L4, pero la inferencia documentada es en CPU.
- GPU de consumo: irrelevante para el caso de uso; cabe en cualquier equipo, incluidos portátiles sin GPU.
- Opciones de despliegue: inferencia directa con PyTorch mediante el script `tiny_voca.infer` del repositorio `tiny-voca-zh` (requiere `torch`, `soundfile` y `pypinyin`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 0,5 s para una frase de 4 segundos en CPU, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Licencia | Notas |
|---|---|---|---|---|---|
| tiny-voca-zh-warm | 4,5 M | zh | 1 | Apache-2.0 | Destilado, CPU, 24 kHz, CER 3,3 % |
| Qwen3-TTS (profesor) | no disponible | no disponible | múltiples (VoiceDesign) | Apache-2.0 | Modelo grande; CER 2,5 % en la misma prueba; calidad de audio superior |
| tiny-voca (n4ze3m) | no disponible | no disponible | no disponible | Apache-2.0 | Proyecto original del que este es un port a mandarín |

No se dispone de datos de parámetros, contexto ni rendimiento de otros modelos TTS pequeños en la información proporcionada, por lo que la comparativa se limita a los anteriores.

## Limitaciones y advertencias

- Solo mandarín: las letras latinas de la entrada se omiten, lo que puede producir lecturas incompletas en textos mixtos.
- Una única voz: no hay control de hablante ni de estilo.
- Calidad de audio inferior a la del modelo profesor; no se realizó ninguna prueba de escucha con personas, por lo que la naturalidad no está evaluada.
- Los cambios de tono dependientes de fronteras de palabra se gestionan carácter a carácter, de modo que el ritmo puede sonar incorrecto en algunos puntos.
- Todo el audio de entrenamiento es sintético, lo que puede introducir artefactos heredados del profesor.
- Riesgo de errores de pronunciación en palabras fuera del dominio de entrenamiento (Tatoeba y frases con números, fechas, precios y horas).
- El proceso de uso requiere aplicar un parche (`zh_yi_sandhi.patch`) sobre una revisión concreta del repositorio, lo que añade fragilidad al despliegue.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías; es un proyecto de aprendizaje sin validación en producción.
- No se documentan sesgos de género o edad de la voz más allá de ser una voz masculina diseñada sintéticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eddylin03/tiny-voca-zh-warm
- Repositorio de código tiny-voca-zh: https://github.com/xiaoliukuailiu/tiny-voca-zh
- Proyecto tiny-voca original (n4ze3m): https://github.com/n4ze3m
- Qwen3-TTS (modelo profesor): https://github.com/QwenLM/Qwen3-TTS
- Tatoeba (corpus de frases): https://tatoeba.org
- Paraformer / FunASR (verificación ASR): no se proporciona enlace en la información disponible
