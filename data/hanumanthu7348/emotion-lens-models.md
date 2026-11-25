# Hanumanthu7348/emotion-lens-models

## Resumen

Emotion Lens es un export ONNX cuantizado en int8 del modelo `superb/wav2vec2-base-superb-er`, un clasificador de emociones en voz (speech emotion recognition) basado en la arquitectura wav2vec2. Lo publica el usuario Hanumanthu7348 como artefacto de inferencia para su aplicacion de demostracion Emotion Lens, no como un modelo entrenado desde cero: se trata de una conversion del checkpoint original de SUPERB (revision `441a7599c3b22107314dcbd9166621c5c83f2cc5`) al formato ONNX con cuantizacion dinamica int8.

El modelo recibe una forma de onda mono a 16 kHz en crudo (`input_values`, float32, sin normalizacion) y devuelve un vector de 4 logits correspondientes a las etiquetas `neu`, `hap`, `ang` y `sad` (neutro, feliz, enfadado, triste). Su interes practico esta en el tamano: pasa de 378 MB en el checkpoint PyTorch original a 122 MB en esta version int8, lo que lo hace apto para despliegue en CPU sin instrucciones VNNI y para entornos con memoria limitada.

La relevancia de esta ficha es acotada: es un artefacto de cuantizacion con 0 descargas y 0 likes en el momento de la consulta, con una validacion empirica muy pequena (22 ventanas de voz real, acuerdo top-1 de 21/22 frente al modelo PyTorch). No aporta mejoras de arquitectura ni de entrenamiento respecto al modelo base; su valor esta en la reduccion de tamano y en la portabilidad del formato ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (transformer encoder sobre representaciones convolucionales de audio), exportado a ONNX |
| Parametros totales | no disponible (el modelo base wav2vec2-base ronda los 95 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio de longitud variable en muestras; sin cifra publicada) |
| Tipos de cuantizacion | int8 dinamica, per-channel, `reduce_range=True`, limitada a MatMul/Gemm |
| Idiomas soportados | no disponible (el modelo base es de emociones en voz; la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8); checkpoint PyTorch original disponible en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2-base, un modelo auto-supervisado de representacion de voz compuesto por un extractor convolucional de caracteristicas seguido de un encoder transformer. Sobre esa base, el checkpoint `superb/wav2vec2-base-superb-er` incorpora una cabeza de clasificacion de 4 clases afinada para reconocimiento de emociones en el marco del benchmark SUPERB. Esta publicacion concreta no entrena ni afina nada: es una exportacion ONNX con cuantizacion dinamica int8 aplicada solo a operaciones MatMul y Gemm, con `reduce_range=True` para garantizar exactitud en CPUs sin extensiones VNNI.

No se dispone de informacion sobre el numero de tokens o horas de audio de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o ajuste preferencial, ya que la model card solo documenta el proceso de cuantizacion y exportacion. La innovacion tecnica declarada es la propia conversion: reduccion de 378 MB a 122 MB manteniendo un acuerdo top-1 de 21/22 frente al modelo PyTorch en ventanas de voz real, con una diferencia media de probabilidad maxima de 0,033. El formato de entrada es `input_values` float32 de forma `[1, samples]` a 16 kHz mono sin normalizacion, y la salida es `logits` de forma `[1, 4]`.

## Capacidades

- Clasificacion de emociones en voz en 4 categorias: neutro (`neu`), feliz (`hap`), enfadado (`ang`) y triste (`sad`).
- Entrada de audio crudo a 16 kHz mono en float32, sin necesidad de normalizacion previa.
- Inferencia en CPU sin instrucciones VNNI gracias a `reduce_range=True`.
- Ejecucion via runtime ONNX, lo que permite despliegue en entornos sin PyTorch.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues.
- No incluye modo thinking, vision ni audio generativo; solo clasificacion.

## Casos de uso

- Analisis de sentimiento en centros de llamadas: procesar grabaciones de atencion al cliente en lotes con ONNX Runtime en CPU para etiquetar el tono emocional de cada intervencion y alimentar paneles de calidad.
- Moderacion de contenido en plataformas de audio: detectar enfado o tristeza en fragmentos subidos por usuarios para priorizar revision humana, aprovechando el bajo coste de inferencia int8.
- Asistentes de voz con respuesta adaptativa: ajustar el tono de la respuesta del sistema segun la emocion detectada en el usuario, integrando el modelo como paso previo en un pipeline de ASR y TTS.
- Investigacion en psicologia y lingüistica: etiquetar corpus de voz de forma automatica y reproducible con un modelo de 122 MB que cabe en cualquier portatil, sin depender de GPU.
- Triaje en salud mental o soporte emocional: senalar ventanas de audio con posible tristeza para que un profesional las revise, siempre como herramienta de apoyo y no de diagnostico.
- Sistemas embebidos y edge computing: desplegar clasificacion emocional en dispositivos con recursos limitados (Raspberry Pi, moviles) gracias al formato ONNX int8 y al reducido peso del artefacto.
- Monitorizacion de reuniones o entrevistas: generar metricas agregadas de clima emocional a partir de segmentos de audio, procesando en local para preservar la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la comparacion con el modelo PyTorch original: acuerdo top-1 de 21/22 en ventanas de voz real y diferencia media de probabilidad maxima de 0,033. No hay cifras de exactitud, F1 ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: no aplica en CPU; en GPU, el artefacto de 122 MB requiere menos de 1 GB de memoria.
- GPU recomendadas: cualquiera con soporte ONNX Runtime (RTX 4090, A100, H100); el modelo es lo bastante pequeno para no necesitar hardware de gama alta.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, y en CPU sin VNNI.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integracion con servidores de inferencia compatibles con ONNX; no se documenta soporte para vLLM, llama.cpp ni Ollama, que no estan orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Emotion Lens (este) | no disponible | no disponible | ONNX int8 (122 MB) | Apache-2.0 | Hugging Face, 0 descargas |
| superb/wav2vec2-base-superb-er | no disponible | no disponible | PyTorch (378 MB) | Apache-2.0 | Hugging Face (modelo base) |
| Alternativas de speech emotion recognition | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de reconocimiento de emociones en voz en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo de clasificacion de 4 clases: no cubre un espectro emocional amplio ni emociones mixtas.
- Validacion empirica muy limitada: solo 22 ventanas de voz real, insuficiente para garantizar robustez en produccion.
- Riesgo de sesgo por idioma, acento, genero, edad y calidad del audio, heredado del modelo base; no se documenta la composicion del dataset de entrenamiento.
- No se declaran idiomas soportados, por lo que el comportamiento fuera del ingles (idioma habitual en SUPERB) es incierto.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas con alta confianza en audio ruidoso o dominios distintos al de entrenamiento.
- Requiere audio a 16 kHz mono en float32 sin normalizar; un preprocesado incorrecto degrada los resultados.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar `VOICE-LICENSE.txt` del repositorio y la licencia del modelo base.
- Repositorio con 0 descargas y 0 likes: sin comunidad ni mantenimiento demostrado; considerar el checkpoint original de SUPERB para usos criticos.
- No apto para diagnostico clinico ni para decisiones automatizadas de alto impacto sin supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hanumanthu7348/emotion-lens-models
- Modelo base: https://huggingface.co/superb/wav2vec2-base-superb-er
- Repositorio SUPERB (referencia del benchmark): no disponible en la informacion proporcionada
- Paper de wav2vec 2.0: no disponible en la informacion proporcionada
