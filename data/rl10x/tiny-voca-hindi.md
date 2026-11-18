# RL10x/tiny-voca-hindi

## Resumen

Tiny Voca Hindi es un modelo de síntesis de voz (text-to-speech) para hindi desarrollado por RL10x, un port a hindi del modelo tiny-voca de n4ze3m. Con solo 9,7 millones de parámetros y un fichero GGUF de 11,1 MB en cuantización de 8 bits, está diseñado para ejecutarse en CPU convencional con un consumo de memoria de decenas de megabytes. El modelo genera una única voz femenina con ocho estilos de habla predefinidos (neutro, conversacional, alegre, triste, enfadado, asustado, sorprendido y asqueado).

La arquitectura combina un transformer pequeño que predice el timing, el tono y la envolvente espectral con un sintetizador fuente-filtro integrado (tren de pulsos más ruido, cada uno modelado por un filtro predicho) que genera la forma de onda directamente, sin necesidad de un vocoder neuronal separado. Esta decisión de diseño es la que permite el tamaño reducido y la velocidad de inferencia de entre 30 y 45 veces el tiempo real en un portátil.

El modelo es relevante para escenarios de despliegue en el borde (edge computing) y aplicaciones de accesibilidad donde el hindi es el idioma objetivo y no se dispone de GPU. Incluye normalización de números, fechas, horas y divisas a palabras en hindi antes de la síntesis, lo que simplifica su integración en pipelines de producción sin preprocesamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pequeño (predicción de timing, tono y envolvente espectral) + sintetizador fuente-filtro integrado |
| Parametros totales | 9.711.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits en matrices del transformer, resto float32); float32 de referencia |
| Idiomas soportados | hindi (hi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (Q8_0 y F32), PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de tiny-voca: un transformer compacto que predice parámetros prosódicos y espectrales (timing, pitch y envolvente espectral) que alimentan un sintetizador fuente-filtro clásico. La fuente es un tren de pulsos más ruido, y cada componente se modela mediante un filtro predicho por la red, generando la forma de onda de audio directamente sin vocoder neuronal. Esta hibridación entre predicción neuronal y síntesis digital de señal es la innovación principal y explica tanto el tamaño mínimo como la velocidad de inferencia.

El entrenamiento se realizó sobre el dataset ai4bharat/Rasa y el checkpoint publicado corresponde a 100.000 pasos de entrenamiento. No se dispone de información sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si hubo ajuste fino específico para los ocho estilos de habla o si estos emergen de la variabilidad del corpus.

## Capacidades

- Síntesis de voz en hindi con una voz femenina única.
- Ocho estilos de habla: neutro, conversacional, alegre, triste, enfadado, asustado, sorprendido y asqueado.
- Normalización automática de números, fechas, horas y divisas (rupia india) a palabras en hindi antes de la síntesis.
- Generación de pasajes largos: se han documentado síntesis de hasta 67,8 segundos de audio en una sola pasada.
- Inferencia en CPU sin GPU, con un consumo de memoria de decenas de megabytes.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de visión, audio de entrada ni clonación de voz.
- No dispone de capacidades multilingües: únicamente hindi.

## Casos de uso

- **Lectura de noticias y boletines en hindi**: el modelo puede sintetizar pasajes largos de forma eficiente (67,8 s de audio en 1,72 s de cómputo), lo que permite generar boletines completos en segundos y publicarlos como audio en aplicaciones de noticias o podcasts automatizados.
- **Sistemas de atención al cliente por voz en hindi**: con el estilo conversacional y la normalización de números de teléfono y fechas, puede generar respuestas habladas para IVR o asistentes telefónicos sin necesidad de infraestructura GPU.
- **Accesibilidad para personas con discapacidad visual**: al ejecutarse en CPU con decenas de megabytes de RAM, puede integrarse en dispositivos de bajo coste o aplicaciones de escritorio que lean contenido en hindi en tiempo real.
- **Audiolibros y contenido educativo**: la capacidad de generar pasajes largos con prosodia controlada y ocho estilos permite producir material educativo narrado con distintos tonos según el contexto (neutro para explicaciones, alegre para refuerzos positivos).
- **Anuncios y avisos automatizados**: la normalización de divisas y fechas facilita la generación de avisos de precios, ofertas o recordatorios de citas en hindi sin preprocesamiento manual del texto.
- **Prototipado rápido de interfaces de voz**: al ser un modelo de 11 MB en GGUF, se puede embarcar en aplicaciones móviles o de escritorio para validar flujos de TTS antes de invertir en modelos mayores o servicios en la nube.
- **Sistemas embebidos y IoT**: la velocidad de 30 a 45 veces el tiempo real en un portátil permite su uso en dispositivos con recursos limitados para anuncios hablados, señalización o interacción básica por voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento proporcionados por el autor son mediciones de latencia en un portátil con CPU y 8 hilos usando el fichero GGUF de 8 bits:

| Texto | Duración del audio | Tiempo de síntesis | Factor de tiempo real |
|---|---|---|---|
| Estilo neutro (7,6 s) | 7,6 s | 0,17 s | ~45x |
| Estilo conversacional (5,0 s) | 5,0 s | 0,11 s | ~45x |
| Pasaje largo (36,8 s) | 36,8 s | 1,00 s | ~37x |
| Pasaje largo (67,8 s) | 67,8 s | 1,72 s | ~39x |

## Requisitos de hardware

- **VRAM estimada**: no aplica; el modelo está diseñado para ejecutarse en CPU. El fichero Q8_0 ocupa 11,1 MB y el F32 38,9 MB, por lo que el consumo de RAM es de decenas de megabytes.
- **GPU recomendadas**: no requiere GPU. No se han documentado requisitos ni rendimiento en GPU.
- **Compatibilidad con GPU de consumo**: irrelevante para el diseño del modelo; está optimizado para CPU.
- **Opciones de despliegue**: motor ggml/C++ propietario del proyecto tiny-voca para los ficheros GGUF; el checkpoint PyTorch (.pt) permite inferencia con PyTorch. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: entre 30 y 45 veces el tiempo real en un portátil con CPU y 8 hilos, según las mediciones del autor. Un pasaje de 67,8 s se sintetiza en 1,72 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Ejecución en CPU |
|---|---|---|---|---|---|---|
| Tiny Voca Hindi (RL10x) | 9,7 M | no disponible | hindi | CC-BY-4.0 | GGUF, PyTorch | Sí, 30-45x tiempo real |
| tiny-voca (n4ze3m) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Coqui TTS (modelos hindi) | variable (decenas de millones) | no disponible | multilingüe | variable según modelo | PyTorch | Posible, más lento |
| VITS (implementaciones hindi) | variable (decenas de millones) | no disponible | hindi | variable | PyTorch | Posible, requiere más recursos |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada. El modelo original tiny-voca de n4ze3m es la referencia directa, pero no se dispone de sus especificaciones detalladas en esta ficha.

## Limitaciones y advertencias

- **Una única voz**: solo genera una voz femenina; no permite selección de hablante ni clonación de voz.
- **Idioma único**: únicamente hindi; no soporta otros idiomas ni code-switching con inglés u otras lenguas.
- **Riesgo de alucinación prosódica**: al ser un modelo generativo de audio, puede producir entonaciones o duraciones incorrectas en textos con estructuras sintácticas poco frecuentes o con puntuación ambigua.
- **Estilos predefinidos**: los ocho estilos son fijos; no se ha documentado la posibilidad de control continuo de la emoción ni de intensidad del estilo.
- **Licencia CC-BY-4.0**: permite uso comercial con atribución, pero exige citar al autor y la licencia. No hay restricciones adicionales documentadas, pero conviene verificar la compatibilidad con la licencia del dataset ai4bharat/Rasa.
- **Sin benchmarks publicados**: no hay evaluaciones objetivas de calidad (MOS, inteligibilidad, naturalidad) que permitan comparar con otros sistemas TTS en hindi.
- **Ecosistema limitado**: el motor de inferencia GGUF es específico del proyecto tiny-voca; no se ha documentado integración con frameworks estándar como ONNX Runtime, TensorFlow Lite o vLLM.
- **Fecha de creación futura**: el repositorio figura creado el 18 de noviembre de 2026, lo que puede indicar un error en los metadatos o una fecha de publicación planificada; conviene verificar la disponibilidad real de los ficheros.

## Enlaces

- [Hugging Face: RL10x/tiny-voca-hindi](https://huggingface.co/RL10x/tiny-voca-hindi)
- [Modelo original tiny-voca de n4ze3m](https://huggingface.co/n4ze3m/tiny-voca)
- [Dataset ai4bharat/Rasa](https://huggingface.co/datasets/ai4bharat/Rasa)
- [Ejemplos de audio (style_neutral.wav)](https://huggingface.co/FcbLeo/tiny-voca-hindi/resolve/main/samples/style_neutral.wav)
- [Ejemplos de audio (long_3_neutral.wav)](https://huggingface.co/FcbLeo/tiny-voca-hindi/resolve/main/samples/long_3_neutral.wav)
