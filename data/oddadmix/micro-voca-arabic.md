# oddadmix/micro-voca-arabic

## Resumen

micro-voca-arabic es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno (fusha) desarrollado por el usuario oddadmix. Se trata de un modelo de tan solo 2.285.707 parámetros entrenado desde cero, que genera audio a 24 kHz a partir de texto y que incluye el generador de forma de onda en el propio modelo, sin vocoder neuronal separado. Es la variante de medio tamaño de la familia tiny-voca-arabic, con la misma arquitectura y receta de entrenamiento que su hermano mayor pero con capas más estrechas.

El modelo está pensado para inferencia en CPU: alcanza aproximadamente 300 veces el tiempo real usando cuatro hilos con ONNX Runtime, lo que lo sitúa como una opción viable para despliegues en entornos sin GPU. Ofrece ocho voces en cuatro estilos de habla (asistente, noticias, relato y promoción), con una voz femenina y otra masculina por estilo, y mantiene la misma interfaz, entradas, salidas y orden de voces que tiny-voca-arabic v2.1, por lo que funciona como sustituto directo cuando priman el tamaño reducido o la velocidad.

La relevancia de este modelo radica en su extrema ligereza (9 MB en PyTorch, 12 MB en ONNX) combinada con una calidad de síntesis competitiva: la tasa de error de caracteres en validación es del 0,7 % y la puntuación DNSMOS P.808 es de 3,73, muy cerca de los 3,76 de la variante de 4,5 millones de parámetros. Está publicado bajo licencia Apache-2.0 y se distribuye en formato ONNX para su uso con onnxruntime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (red neuronal propia con predictor de duraciones, pausas, tono, sonoridad y energía; sintetizador fuente-filtro, sin vocoder neuronal) |
| Parametros totales | 2.285.707 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (árabe estándar moderno, fusha) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (12 MB); también 9 MB en PyTorch según la model card |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura tiny-voca original de Muhammed Nazeem (@n4ze3m), con código y receta de entrenamiento disponibles en github.com/n4ze3m/tiny-voca bajo licencia Apache-2.0, pero con capas más estrechas: 128 canales, 512 en la capa feed-forward y 96 en el predictor, frente a 192/640/128 de la variante completa. No se reutilizaron pesos de tiny-voca: el modelo se entrenó desde cero sobre datos árabes. La red predice duraciones, pausas, tono, sonoridad y energía, y un sintetizador fuente-filtro genera la forma de onda, eliminando la necesidad de un vocoder neuronal independiente.

El pipeline de procesamiento del texto incluye lectura de números como palabras en árabe estándar moderno, diacritización mediante CATT (github.com/abjadai/catt) y un fonemizador basado en reglas de 49 símbolos para árabe estándar moderno (code/arabic_frontend.py). El entrenamiento se realizó sobre el dataset oddadmix/tiny-voca-arabic-v2.1-dataset, el mismo empleado por la variante completa. No se especifican en la información disponible el número de tokens de audio, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz en árabe estándar moderno (fusha) a partir de texto, con salida de audio a 24 kHz.
- Ocho voces en cuatro estilos de habla: asistente (a000 femenina, am6 masculina), noticias (nf2 femenina, nm2 masculina), relato (sf1 femenina, sm3 masculina) y promoción (pf4 femenina, pm2 masculina).
- Conversión de números a palabras en árabe estándar moderno.
- Diacritización automática del texto de entrada mediante CATT.
- Fonemización basada en reglas específica para árabe estándar moderno.
- Generación de la forma de onda integrada en el modelo, sin vocoder externo.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de noticias en árabe: las voces de estilo noticias (nf2 y nm2) permiten convertir titulares y artículos en audio para portales informativos o aplicaciones de podcast automatizado, con una tasa de error de caracteres en test del 2,9 % y 1,0 % respectivamente.
- Asistentes de voz embebidos: las voces de estilo asistente (a000 y am6) están pensadas para respuestas conversacionales en dispositivos con recursos limitados, donde el modelo cabe en 12 MB y se ejecuta en CPU a unas 300 veces el tiempo real.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido en árabe estándar moderno en aplicaciones de escritorio o móviles sin GPU, gracias a su reducido consumo de memoria y su velocidad de inferencia.
- Narración de audiolibros y relatos: las voces de estilo relato (sf1 y sm3) ofrecen una entonación adecuada para textos narrativos, con tasas de error de caracteres en test del 0,4 % y 0,3 %.
- Locuciones publicitarias y promocionales: las voces de estilo promoción (pf4 y pm2) permiten generar cuñas y mensajes de marketing en árabe de forma automatizada y a bajo coste computacional.
- Sistemas de megafonía y avisos automatizados: anuncios en estaciones, aeropuertos o comercios donde se requiere generar audio en tiempo real en hardware de bajo consumo.
- Prototipado e investigación en TTS: al ser un modelo de 2,3 millones de parámetros entrenado desde cero con receta y código abiertos, sirve como base para experimentos académicos sobre síntesis de voz en árabe.

## Benchmarks y rendimiento

Los datos de evaluación provienen de transcripciones con Whisper large-v3 del audio generado comparadas con el texto de entrada (sin diacríticos ni puntuación). Se usaron 25 frases de validación, 25 de test y 8 frases nuevas por voz, las mismas que para tiny-voca-arabic v2.1. La tasa de error de caracteres (CER) se muestra con la CER de las grabaciones originales entre paréntesis.

| Voz | Validación | Test | Frases nuevas |
|---|---|---|---|
| a000 asistente F | 0,4 % (0,6 %) | 1,7 % (1,8 %) | 0,3 % |
| am6 asistente M | 0,5 % (0,5 %) | 0,1 % (0,2 %) | 0,8 % |
| nf2 noticias F | 0,7 % (1,7 %) | 2,9 % (3,5 %) | 0,8 % |
| nm2 noticias M | 0,5 % (0,5 %) | 1,0 % (1,0 %) | 1,1 % |
| sf1 relato F | 0,4 % (0,3 %) | 0,4 % (0,5 %) | 0,6 % |
| sm3 relato M | 0,2 % (0,5 %) | 0,3 % (0,3 %) | 0,6 % |
| pf4 promoción F | 2,3 % (2,5 %) | 1,4 % (2,0 %) | 0,3 % |
| pm2 promoción M | 1,0 % (0,9 %) | 1,3 % (1,5 %) | 1,1 % |

Comparativa directa con tiny-voca-arabic v2.1:

| Métrica | micro-voca-arabic | tiny-voca-arabic v2.1 |
|---|---|---|
| Parámetros | 2.285.707 | 4.534.411 |
| Ancho (canales / feed-forward / predictor) | 128 / 512 / 96 | 192 / 640 / 128 |
| Velocidad en CPU, 4 hilos (ONNX) | ~300× tiempo real | ~200× tiempo real |
| CER validación / test / frases nuevas | 0,7 % / 1,1 % / 0,7 % | 0,8 % / 1,1 % / 0,5 % |
| DNSMOS P.808 (40 muestras) | 3,73 | 3,76 |

Las duraciones generadas se mantienen dentro del 5,5 % de las grabaciones originales en todas las voces (sf1 es la más rápida, con un factor de 0,95). Cada voz está dentro de 0,8 puntos de la CER de v2.1; el mayor cambio es nm2 en frases nuevas (0,3 % a 1,1 %).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el uso previsto; el modelo está diseñado para ejecutarse en CPU. El peso ONNX ocupa 12 MB y el de PyTorch 9 MB.
- GPU recomendadas: no se especifican en la información disponible; el modelo no requiere GPU.
- Cabe en cualquier equipo consumer: con 9-12 MB de pesos, se ejecuta en CPU de escritorio, portátil o dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (librería declarada, `onnxruntime`), con dependencias `numpy`, `soundfile` y `tqdm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: aproximadamente 300 veces el tiempo real con cuatro hilos de CPU en ONNX Runtime, es decir, unos 0,2 segundos de cómputo por cada minuto de audio generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Velocidad CPU (4 hilos) | CER validación/test | DNSMOS P.808 | Licencia |
|---|---|---|---|---|---|---|
| micro-voca-arabic | 2.285.707 | Árabe (fusha) | ~300× tiempo real | 0,7 % / 1,1 % | 3,73 | Apache-2.0 |
| tiny-voca-arabic v2.1 | 4.534.411 | Árabe (fusha) | ~200× tiempo real | 0,8 % / 1,1 % | 3,76 | Apache-2.0 |
| nano-voca-arabic | ~1,2 M (un cuarto) | Árabe (fusha) | no disponible | no disponible | no disponible | Apache-2.0 |
| pico-voca-arabic | ~0,56 M (un octavo) | Árabe (fusha) | no disponible | no disponible | no disponible | Apache-2.0 |

La familia incluye además femto-voca-arabic (0,28 M, un dieciseisavo) y atto-voca-arabic (0,14 M, un treintaidosavo), todas derivadas de la misma receta. Frente a tiny-voca-arabic v2.1, micro-voca-arabic reduce a la mitad los parámetros, mejora un 50 % la velocidad en CPU y sacrifica 0,03 puntos de DNSMOS y hasta 0,8 puntos de CER según la voz.

## Limitaciones y advertencias

- Solo soporta árabe estándar moderno (fusha); no se documentan dialectos regionales ni otros idiomas.
- El rendimiento en la voz de noticias femenina (nf2) es notablemente peor en test (CER del 2,9 %) que en el resto de voces.
- La voz de promoción femenina (pf4) presenta la mayor CER en validación (2,3 %).
- No se han publicado datos sobre sesgos de género, edad o acento en las voces generadas.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento o en texto sin diacritizar.
- No se especifican limitaciones de longitud de texto de entrada ni el comportamiento con secuencias muy largas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las licencias de las dependencias (CATT y el código tiny-voca, ambos Apache-2.0).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.
- El modelo se creó y actualizó en noviembre de 2026 según los metadatos de Hugging Face.
- No se detalla el proceso de entrenamiento (número de horas de audio, composición del dataset) más allá del enlace al dataset tiny-voca-arabic-v2.1-dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/micro-voca-arabic
- Demo: https://huggingface.co/spaces/oddadmix/micro-voca-arabic
- Dataset: https://huggingface.co/datasets/oddadmix/tiny-voca-arabic-v2.1-dataset
- Variante completa (4,5 M): https://huggingface.co/oddadmix/tiny-voca-arabic-v2.1
- Variante de un cuarto (1,2 M): https://huggingface.co/oddadmix/nano-voca-arabic
- Variante de un octavo (0,56 M): https://huggingface.co/oddadmix/pico-voca-arabic
- Variante de un dieciseisavo (0,28 M): https://huggingface.co/oddadmix/femto-voca-arabic
- Variante de un treintaidosavo (0,14 M): https://huggingface.co/oddadmix/atto-voca-arabic
- Modelo original tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Código tiny-voca: https://github.com/n4ze3m/tiny-voca
- CATT (diacritización): https://github.com/abjadai/catt
