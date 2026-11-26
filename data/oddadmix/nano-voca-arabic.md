# oddadmix/nano-voca-arabic

## Resumen

nano-voca-arabic es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno (فصحى, MSA) desarrollado por el usuario oddadmix. Se trata de la variante de un cuarto de tamaño de la familia tiny-voca-arabic, con 1.155.211 parámetros, entrenada desde cero sobre el mismo corpus y con la misma receta que su hermano mayor (tiny-voca-arabic v2.1). Convierte texto en audio a 24 kHz e incluye el generador de forma de onda, de modo que no requiere un vocoder neuronal separado.

El modelo adopta la arquitectura y el código de entrenamiento del proyecto tiny-voca de Muhammed Nazeem (@n4ze3m), publicado bajo licencia Apache-2.0, pero con capas más estrechas (96 canales, 320 en feed-forward y 64 en el predictor). No reutiliza pesos de tiny-voca: todos los parámetros se entrenaron sobre datos en árabe. Su interés principal es la eficiencia extrema: unos 330× tiempo real sobre cuatro hilos de CPU en formato ONNX, con un tamaño de 5 MB en PyTorch y 8 MB en ONNX.

Ofrece ocho voces en cuatro estilos de habla (asistente, noticias, relato y promoción), con una voz femenina y otra masculina por estilo, y mantiene la misma interfaz de entradas, salidas y orden de voces que tiny-voca-arabic v2.1, por lo que funciona como reemplazo directo cuando priman el tamaño o la velocidad sobre la calidad máxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red tiny-voca (predictor de duraciones, pausas, tono, sonoridad y energía + sintetizador fuente-filtro; sin vocoder neuronal) |
| Parametros totales | 1.155.211 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | árabe (árabe estándar moderno, MSA) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (8 MB) y PyTorch (5 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura tiny-voca: una red que predice duraciones, pausas, tono (pitch), sonoridad (voicing) y energía a partir de la representación fonética del texto, y un sintetizador fuente-filtro que genera la forma de onda directamente. No hay vocoder neuronal independiente. La anchura de las capas es de 96 canales, 320 en la capa feed-forward y 64 en el predictor, más estrecha que la de tiny-voca-arabic v2.1 (192 / 640 / 128), manteniendo el mismo número de capas.

El front-end procesa los números como palabras en MSA, aplica diacritización con CATT (github.com/abjadai/catt) y un fonemizador basado en reglas de 49 símbolos para árabe estándar moderno (`code/arabic_frontend.py`). El entrenamiento se realizó desde cero sobre el dataset oddadmix/tiny-voca-arabic-v2.1-dataset, el mismo empleado por la versión completa. No se documentan en la información disponible el número de tokens, la composición detallada del corpus ni el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz en árabe estándar moderno (MSA) a 24 kHz.
- Ocho voces predefinidas en cuatro estilos: asistente (`a000` femenina, `am6` masculina), noticias (`nf2`, `nm2`), relato (`sf1`, `sm3`) y promoción (`pf4`, `pm2`).
- Conversión de números a palabras en MSA antes de la síntesis.
- Diacritización automática del texto de entrada mediante CATT.
- Fonemización basada en reglas para MSA (49 símbolos).
- Inferencia en CPU muy rápida (aproximadamente 330× tiempo real con cuatro hilos en ONNX).
- Ejecución mediante ONNX Runtime, sin dependencia de GPU.
- No soporta tool calling, agentes, visión, audio de entrada ni modos de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de noticias automatizada: la voz de estilo noticias (`nf2`/`nm2`) está entrenada para un registro informativo, adecuada para generar boletines de audio a partir de titulares y cuerpos de texto en MSA.
- Asistentes de voz embebidos: con 8 MB en ONNX y ejecución a 330× tiempo real en cuatro hilos de CPU, el modelo cabe en dispositivos con recursos muy limitados y puede integrarse en asistentes locales sin GPU.
- Audiolibros y relatos cortos: la voz de estilo relato (`sf1`/`sm3`) permite narrar cuentos y textos literarios con una entonación diferenciada del registro informativo.
- Anuncios y promociones: las voces `pf4`/`pm2` están orientadas a un estilo promocional, útiles para generar cuñas publicitarias o avisos de productos en árabe.
- Accesibilidad y lectura de pantalla: conversión de texto escrito a voz para aplicaciones de accesibilidad en árabe, con bajo coste computacional y latencia reducida.
- Prototipado y pruebas de pipelines TTS: al ser un reemplazo directo de tiny-voca-arabic v2.1 (mismas entradas, salidas y orden de voces), sirve para validar integraciones y luego escalar al modelo completo si se necesita más calidad.
- Generación masiva de audio en servidores sin GPU: el rendimiento en CPU permite sintetizar grandes volúmenes de texto en hardware convencional.

## Benchmarks y rendimiento

La model card reporta tasas de error de caracteres (CER) medidas con transcripciones de Whisper large-v3 sobre el audio generado, comparadas con el texto de entrada (sin diacríticos ni puntuación). Se usaron 25 frases de validación, 25 de test y 8 frases nuevas por voz.

| Voz | Validación | Test | Frases nuevas |
|---|---|---|---|
| `a000` asistente F | 0,3% (0,6%) | 1,5% (1,8%) | 0,0% |
| `am6` asistente M | 0,5% (0,5%) | 0,1% (0,2%) | 0,0% |
| `nf2` noticias F | 1,1% (1,7%) | 3,1% (3,5%) | 0,8% |
| `nm2` noticias M | 0,4% (0,5%) | 0,5% (1,0%) | 0,8% |
| `sf1` relato F | 0,4% (0,3%) | 0,4% (0,5%) | 0,0% |
| `sm3` relato M | 0,3% (0,5%) | 0,2% (0,3%) | 0,0% |
| `pf4` promo F | 2,4% (2,5%) | 1,2% (2,0%) | 0,9% |
| `pm2` promo M | 1,0% (0,9%) | 1,2% (1,5%) | 0,6% |

Entre paréntesis se indica el CER de las grabaciones originales. La puntuación de calidad DNSMOS P.808 sobre las 40 muestras es de 3,63, frente a 3,76 de tiny-voca-arabic v2.1. Las duraciones generadas quedan dentro del 6% de las grabaciones en todas las voces (`sf1` es la más rápida, con 0,94).

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para CPU. En GPU el consumo sería mínimo dado el tamaño de 8 MB en ONNX.
- GPU recomendadas: no se documentan; cualquier GPU moderna podría ejecutarlo, pero no es el escenario objetivo.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el despliegue de referencia es CPU con cuatro hilos.
- Opciones de despliegue: ONNX Runtime (librería declarada), con dependencias `onnxruntime`, `numpy`, `soundfile` y `tqdm`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 330× tiempo real con cuatro hilos de CPU en ONNX.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Velocidad CPU (4 hilos) | CER test (media aprox.) | DNSMOS P.808 | Licencia |
|---|---|---|---|---|---|---|
| nano-voca-arabic | 1.155.211 | 5 MB PyTorch / 8 MB ONNX | ~330× tiempo real | 1,0% | 3,63 | Apache-2.0 |
| tiny-voca-arabic v2.1 | 4.534.411 | 18 MB PyTorch / 21 MB ONNX | ~200× tiempo real | 1,1% | 3,76 | Apache-2.0 |
| micro-voca-arabic | no disponible | no disponible | no disponible | no disponible | no disponible | Apache-2.0 (según familia) |
| pico-voca-arabic | no disponible | no disponible | no disponible | no disponible | no disponible | Apache-2.0 (según familia) |

La familia incluye además femto-voca-arabic (0,28M) y atto-voca-arabic (0,14M), de los que no se detallan métricas en la información disponible. Todos comparten arquitectura, receta y dataset, diferenciándose en anchura de capas y, por tanto, en tamaño, velocidad y calidad.

## Limitaciones y advertencias

- Solo soporta árabe estándar moderno; no se documenta cobertura de dialectos árabes regionales.
- La calidad es inferior a la de tiny-voca-arabic v2.1 (DNSMOS 3,63 frente a 3,76), como corresponde a su menor tamaño.
- El CER en la voz `nf2` (noticias femenina) alcanza el 3,1% en el conjunto de test, el valor más alto de la tabla.
- No se documentan sesgos de género, dialectales o de otro tipo en la información disponible.
- Riesgo de errores de pronunciación en textos con diacritización ambigua o fuera del dominio de entrenamiento; la evaluación se limita a 58 frases por voz.
- El modelo no genera audio expresivo más allá de los cuatro estilos predefinidos; no hay control fino de emoción ni de prosodia por parte del usuario.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del proyecto tiny-voca original y del dataset utilizado.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta; se trata de un modelo reciente y poco validado por la comunidad.
- No se documentan cuantizaciones ni soporte para otros runtimes distintos de ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/nano-voca-arabic
- Demo: https://huggingface.co/spaces/oddadmix/nano-voca-arabic
- Dataset: https://huggingface.co/datasets/oddadmix/tiny-voca-arabic-v2.1-dataset
- Modelo de media talla (2,3M): https://huggingface.co/oddadmix/micro-voca-arabic
- Modelo de un octavo (0,56M): https://huggingface.co/oddadmix/pico-voca-arabic
- Modelo de un dieciseisavo (0,28M): https://huggingface.co/oddadmix/femto-voca-arabic
- Modelo de 1/32 (0,14M): https://huggingface.co/oddadmix/atto-voca-arabic
- Modelo completo (4,5M): https://huggingface.co/oddadmix/tiny-voca-arabic-v2.1
- tiny-voca original: https://huggingface.co/n4ze3m/tiny-voca
- Código de tiny-voca: https://github.com/n4ze3m/tiny-voca
- CATT (diacritización): https://github.com/abjadai/catt
