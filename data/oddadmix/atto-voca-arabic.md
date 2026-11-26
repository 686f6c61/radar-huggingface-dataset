# oddadmix/atto-voca-arabic

## Resumen

atto-voca-arabic es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno (fusha) desarrollado por oddadmix. Se trata del miembro más pequeño de la familia voca-arabic: con tan solo 142.491 parámetros (0,14 M), es la variante de 1/32 del tamaño de tiny-voca-arabic v2.1 y está entrenado desde cero sobre el mismo corpus y con la misma receta. Su objetivo es ofrecer síntesis de voz en árabe con un coste computacional mínimo, apto para CPU y entornos con recursos muy limitados.

El modelo sigue la arquitectura tiny-voca original de Muhammed Nazeem (@n4ze3m), pero con capas más estrechas (32 canales, 112 en la feed-forward y 24 en el predictor). Incluye el generador de forma de onda completo: entra texto y sale audio a 24 kHz, con una velocidad de aproximadamente 390 veces el tiempo real sobre cuatro hilos de CPU en ONNX Runtime. No emplea un vocoder neuronal separado: el propio modelo predice duraciones, pausas, tono, sonoridad y energía, y un sintetizador fuente-filtro genera la señal.

Dispone de ocho voces en cuatro estilos de habla (asistente, noticias, relato y promoción), con una voz femenina y otra masculina por estilo. Es un reemplazo directo de tiny-voca-arabic v2.1: comparte entradas, salidas y orden de voces, por lo que puede sustituirse sin cambios de código cuando priman el tamaño o la velocidad sobre la calidad máxima. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (red neuronal ligera con predictor de duraciones, pausas, tono, sonoridad y energía; sintetizador fuente-filtro, sin vocoder neuronal) |
| Parametros totales | 142.491 (0,14 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | árabe (árabe estándar moderno, fusha) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (3,8 MB); también se mencionan pesos PyTorch de 0,6 MB |

## Arquitectura y entrenamiento

atto-voca-arabic reutiliza la arquitectura y el código de entrenamiento de tiny-voca (Apache-2.0), pero con anchos de capa reducidos: 32 canales, 112 en la capa feed-forward y 24 en el predictor, frente a 192/640/128 del modelo completo. No se reutilizó ningún peso de tiny-voca: el modelo se entrenó desde cero sobre datos en árabe. El pipeline de inferencia es idéntico al de v2.1: los números se leen como palabras en árabe estándar, se aplica diacritización con CATT, se convierte el texto a fonemas mediante un fonemizador basado en reglas de 49 símbolos (`code/arabic_frontend.py`) y la red predice duraciones, pausas, tono, sonoridad y energía; finalmente, un sintetizador fuente-filtro construye la forma de onda. No hay vocoder neuronal independiente.

El entrenamiento se realizó sobre el dataset oddadmix/tiny-voca-arabic-v2.1-dataset, el mismo empleado por la familia completa, con la misma receta. No se documentan en la información disponible el número de tokens, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). La innovación principal es la extrema compacidad: 0,14 M de parámetros que caben en 3,8 MB en ONNX y permiten síntesis a 24 kHz en CPU a velocidades muy superiores al tiempo real.

## Capacidades

- Síntesis de voz en árabe estándar moderno (fusha) a partir de texto, con salida de audio a 24 kHz.
- Ocho voces diferenciadas en cuatro estilos: asistente (`a000` femenina, `am6` masculina), noticias (`nf2` femenina, `nm2` masculina), relato (`sf1` femenina, `sm3` masculina) y promoción (`pf4` femenina, `pm2` masculina).
- Normalización de números: se leen como palabras en árabe estándar.
- Diacritización automática mediante CATT y fonemización basada en reglas de 49 símbolos.
- Predicción de prosodia: duraciones, pausas, tono, sonoridad y energía.
- Generación de forma de onda integrada (sintetizador fuente-filtro), sin vocoder neuronal externo.
- Inferencia en CPU: aproximadamente 390 veces el tiempo real con cuatro hilos en ONNX Runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de noticias en árabe: las voces de estilo noticias (`nf2`, `nm2`) permiten generar boletines locutados a partir de texto, con prosodia adaptada al registro informativo y una velocidad en CPU que hace viable procesar lotes grandes de artículos.
- Asistentes de voz embebidos: las voces de estilo asistente (`a000`, `am6`) y el reducido tamaño (3,8 MB en ONNX) permiten integrar el modelo en dispositivos con recursos limitados, como routers, Raspberry Pi o aplicaciones móviles, sin GPU.
- Audiolibros y relatos: las voces de estilo relato (`sf1`, `sm3`) están entrenadas para narración, lo que las hace adecuadas para convertir cuentos y textos literarios en audio con entonación narrativa.
- Anuncios y promociones: las voces de estilo promoción (`pf4`, `pm2`) permiten generar locuciones publicitarias breves de forma automatizada, con una tasa de error de caracteres (CER) de 0,8-2,1 % en las pruebas publicadas.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido web o documentos en árabe en tiempo real sobre CPU, gracias a las 390 veces el tiempo real.
- Pruebas y prototipado de pipelines TTS: al ser un reemplazo directo de tiny-voca-arabic v2.1 (mismas entradas, salidas y orden de voces), sirve para validar integraciones con un coste computacional mínimo antes de pasar a la variante completa.
- Generación de material educativo: conversión de lecciones y ejercicios en árabe estándar a audio para plataformas de aprendizaje, con voces masculinas y femeninas alternadas.

## Benchmarks y rendimiento

Los datos publicados en la model card se basan en transcripciones con Whisper large-v3 del habla generada frente al texto de entrada (sin diacríticos ni puntuación). Se emplearon 25 frases de validación, 25 de test y 8 frases nuevas por voz.

| Metrica | atto-voca-arabic | tiny-voca-arabic v2.1 |
|---|---|---|
| Parametros | 142.491 | 4.534.411 |
| Tamano PyTorch | 0,6 MB | 18 MB |
| Tamano ONNX | 3,8 MB | 21 MB |
| Velocidad en CPU, 4 hilos (ONNX) | ~390× tiempo real | ~200× tiempo real |
| CER validacion / test / frases nuevas | 0,9 % / 1,3 % / 1,1 % | 0,8 % / 1,1 % / 0,5 % |
| Calidad (DNSMOS P.808, 40 muestras) | 3,59 | 3,76 |

CER por voz (validación / test / frases nuevas), con el CER de las grabaciones originales entre paréntesis:

| Voz | Validacion | Test | Frases nuevas |
|---|---|---|---|
| `a000` asistente F | 0,4 % (0,6 %) | 1,6 % (1,8 %) | 1,3 % |
| `am6` asistente M | 0,7 % (0,5 %) | 0,2 % (0,2 %) | 0,7 % |
| `nf2` noticias F | 0,9 % (1,7 %) | 3,3 % (3,5 %) | 1,5 % |
| `nm2` noticias M | 0,5 % (0,5 %) | 1,0 % (1,0 %) | 2,0 % |
| `sf1` relato F | 0,4 % (0,3 %) | 0,5 % (0,5 %) | 0,7 % |
| `sm3` relato M | 0,4 % (0,5 %) | 0,4 % (0,3 %) | 0,7 % |
| `pf4` promocion F | 2,6 % (2,5 %) | 2,1 % (2,0 %) | 0,8 % |
| `pm2` promocion M | 0,8 % (0,9 %) | 1,5 % (1,5 %) | 1,1 % |

Todas las voces quedan a menos de 1,7 puntos del CER de v2.1. Las duraciones generadas están dentro del 7 % de las grabaciones para todas las voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; el modelo ONNX ocupa 3,8 MB y los pesos PyTorch 0,6 MB, por lo que la huella de memoria es mínima (del orden de decenas de MB incluyendo el runtime).
- GPU recomendadas: no se documentan requisitos de GPU; el modelo está diseñado para CPU y no necesita acelerador.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU; también en sistemas embebidos con CPU modesta.
- Opciones de despliegue: ONNX Runtime (vía `onnxruntime` con `numpy`, `soundfile` y `tqdm`), tal como indica la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: aproximadamente 390 veces el tiempo real con cuatro hilos de CPU en ONNX Runtime, es decir, unos 0,15 s de cómputo por cada minuto de audio generado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atto-voca-arabic | 142.491 (0,14 M) | no aplica | 1,3 % (media) | Apache-2.0 | Hugging Face (ONNX) |
| tiny-voca-arabic v2.1 | 4.534.411 (4,5 M) | no aplica | 1,1 % (media) | Apache-2.0 | Hugging Face (ONNX) |
| femto-voca-arabic | 0,28 M | no aplica | no disponible | Apache-2.0 | Hugging Face |
| pico-voca-arabic | 0,56 M | no aplica | no disponible | Apache-2.0 | Hugging Face |
| nano-voca-arabic | 1,2 M | no aplica | no disponible | Apache-2.0 | Hugging Face |
| micro-voca-arabic | 2,3 M | no aplica | no disponible | Apache-2.0 | Hugging Face |

La familia voca-arabic ofrece variantes de 0,14 M a 4,5 M de parámetros con la misma arquitectura, datos y receta, lo que permite elegir el equilibrio entre tamaño, velocidad y calidad. atto-voca-arabic es la más rápida (390× tiempo real frente a 200× del modelo completo) a costa de una calidad ligeramente inferior (DNSMOS 3,59 frente a 3,76 y CER medio de 1,3 % frente a 1,1 %). No se dispone de datos de benchmarks de otros modelos TTS en árabe en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- Solo soporta árabe estándar moderno (fusha); no se documenta cobertura de dialectos árabes ni de otros idiomas.
- La calidad es inferior a la de tiny-voca-arabic v2.1: DNSMOS 3,59 frente a 3,76 y CER medio de 1,3 % frente a 1,1 %; la mayor diferencia se observa en la voz `nm2` sobre frases nuevas (2,0 % frente a 0,3 %).
- La voz `nf2` (noticias femenina) presenta el CER de test más alto (3,3 %), lo que puede afectar a la inteligibilidad en ese estilo.
- Al ser un modelo generativo de voz, puede producir pronunciaciones incorrectas en textos con diacritización ambigua o en palabras fuera del dominio de entrenamiento.
- El front-end depende de CATT para la diacritización; errores en esta etapa pueden propagarse a la síntesis.
- No se documentan sesgos específicos de género, dialecto o registro más allá de las ocho voces disponibles.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de las licencias de las dependencias (CATT, tiny-voca) en producción.
- No se documentan mecanismos de control de prosodia más allá de la selección de voz y estilo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/atto-voca-arabic
- Demo (Space): https://huggingface.co/spaces/oddadmix/atto-voca-arabic
- Dataset: https://huggingface.co/datasets/oddadmix/tiny-voca-arabic-v2.1-dataset
- Modelo completo (4,5 M): https://huggingface.co/oddadmix/tiny-voca-arabic-v2.1
- Variante 0,28 M: https://huggingface.co/oddadmix/femto-voca-arabic
- Variante 0,56 M: https://huggingface.co/oddadmix/pico-voca-arabic
- Variante 1,2 M: https://huggingface.co/oddadmix/nano-voca-arabic
- Variante 2,3 M: https://huggingface.co/oddadmix/micro-voca-arabic
- Modelo base tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Repositorio tiny-voca: https://github.com/n4ze3m/tiny-voca
- CATT (diacritizador): https://github.com/abjadai/catt
