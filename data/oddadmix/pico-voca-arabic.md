# oddadmix/pico-voca-arabic

## Resumen

pico-voca-arabic es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno (فصحى) desarrollado por el usuario oddadmix. Se trata de un modelo extremadamente compacto, con tan solo 563.419 parámetros (2,3 MB en PyTorch, 5,5 MB en ONNX), que genera audio a 24 kHz a partir de texto. Es el hermano de un octavo de tamaño del modelo tiny-voca-arabic v2.1, con el que comparte arquitectura, receta de entrenamiento y datos, pero con capas más estrechas.

El modelo ofrece ocho voces en cuatro estilos de habla (asistente, noticias, relato y promoción), con una voz femenina y otra masculina por estilo. Está entrenado desde cero sobre datos en árabe, sin reutilizar pesos del tiny-voca original de Muhammed Nazeem, cuya arquitectura y código de entrenamiento (Apache-2.0) sí se emplean como base. El generador de onda está incluido en el propio modelo: no hay vocoder neuronal separado.

Su relevancia radica en la eficiencia: alcanza aproximadamente 370 veces tiempo real en cuatro hilos de CPU con ONNX Runtime, lo que lo hace apto para despliegues en entornos sin GPU, dispositivos embebidos o aplicaciones de bajo consumo. Mantiene la misma interfaz de entrada, salida y orden de voces que la versión completa, por lo que funciona como reemplazo directo cuando el tamaño o la velocidad priman sobre la calidad máxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (red neuronal propia con predicción de duraciones, pausas, tono, sonoridad y energía; sintetizador fuente-filtro para la forma de onda) |
| Parametros totales | 563.419 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX y PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | árabe (árabe estándar moderno, MSA) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (5,5 MB) y PyTorch (2,3 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura tiny-voca, una red neuronal compacta que predice duraciones, pausas, tono, sonoridad y energía a partir de una representación fonémica, y que alimenta un sintetizador fuente-filtro que genera la forma de onda final. No emplea un vocoder neuronal independiente. La anchura de capas es de 64 canales, 240 en la feed-forward y 48 en el predictor, manteniendo el mismo número de capas que la versión v2.1.

El front-end de texto incluye lectura de números como palabras en MSA, diacritización mediante CATT (abjadai/catt) y un fonemizador basado en reglas de 49 símbolos para árabe estándar moderno (code/arabic_frontend.py). El entrenamiento se realizó desde cero sobre el dataset oddadmix/tiny-voca-arabic-v2.1-dataset, con la misma receta que v2.1, sin reutilizar pesos del modelo original. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto en árabe estándar moderno, con salida de audio a 24 kHz.
- Ocho voces diferenciadas: cuatro estilos (asistente, noticias, relato, promoción) con una voz femenina y otra masculina por estilo.
- Lectura de números como palabras en MSA.
- Diacritización automática del texto de entrada mediante CATT.
- Fonemización basada en reglas específica para MSA (49 símbolos).
- Generación de forma de onda integrada sin vocoder neuronal externo.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Interfaz de entrada, salida y orden de voces idéntica a tiny-voca-arabic v2.1 (reemplazo directo).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de noticias y boletines en árabe: el estilo "news" (voces nf2 y nm2) está entrenado para un registro informativo, adecuado para convertir titulares y artículos en audio para portales o aplicaciones de podcast automatizado.
- Asistentes de voz embebidos: con 5,5 MB en ONNX y ~370× tiempo real en cuatro hilos de CPU, puede integrarse en dispositivos de bajo consumo o aplicaciones de escritorio sin GPU para respuestas habladas en árabe.
- Audiolibros y narración de relatos: el estilo "story" (sf1 y sm3) permite narrar cuentos y textos literarios con una entonación diferenciada del registro informativo.
- Anuncios y promociones: el estilo "promo" (pf4 y pm2) está pensado para mensajes publicitarios y avisos breves con una locución más enfática.
- Accesibilidad para hablantes de árabe: conversión de texto a voz en lectores de pantalla, aplicaciones de accesibilidad o interfaces de voz para personas con discapacidad visual, gracias a su bajo coste computacional.
- Prototipado y demos de TTS en árabe: el tamaño reducido y la licencia Apache-2.0 facilitan su inclusión en entornos de desarrollo, pruebas y demostraciones sin infraestructura dedicada.
- Sistemas de megafonía o avisos automatizados en árabe estándar: la velocidad de inferencia en CPU permite generar avisos en tiempo real o casi real en estaciones, aeropuertos o edificios.

## Benchmarks y rendimiento

Los datos disponibles son métricas de evaluación del propio autor, no benchmarks estándar de la comunidad. Se midió la tasa de error de caracteres (CER) transcribiendo el audio generado con Whisper large-v3 y comparándolo con el texto de entrada (sin diacríticos ni puntuación). Entre paréntesis, el CER de las grabaciones originales.

| Voz | Validación | Test | Frases nuevas |
|---|---|---|---|
| a000 (asistente F) | 0,4% (0,6%) | 1,5% (1,8%) | 0,3% |
| am6 (asistente M) | 0,4% (0,5%) | 0,1% (0,2%) | 0,3% |
| nf2 (noticias F) | 0,8% (1,7%) | 2,9% (3,5%) | 0,3% |
| nm2 (noticias M) | 0,5% (0,5%) | 0,5% (1,0%) | 1,1% |
| sf1 (relato F) | 0,4% (0,3%) | 0,4% (0,5%) | 0,3% |
| sm3 (relato M) | 0,3% (0,5%) | 0,2% (0,3%) | 1,1% |
| pf4 (promo F) | 2,3% (2,5%) | 1,6% (2,0%) | 0,0% |
| pm2 (promo M) | 0,9% (0,9%) | 1,3% (1,5%) | 0,0% |

Además, el autor reporta una puntuación de calidad DNSMOS P.808 de 3,66 sobre las 40 muestras evaluadas, frente a 3,76 de tiny-voca-arabic v2.1. Las duraciones generadas quedan dentro del 5% de las grabaciones para todas las voces. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo principal; el modelo está diseñado para ejecutarse en CPU. En GPU, el peso ONNX de 5,5 MB ocupa una fracción mínima de memoria.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime podría ejecutarlo, pero el diseño está optimizado para CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (modo documentado), con dependencias onnxruntime, numpy, soundfile y tqdm. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: aproximadamente 370× tiempo real en cuatro hilos de CPU con ONNX, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Velocidad CPU (4 hilos) | CER (val/test/nuevas) | DNSMOS | Licencia |
|---|---|---|---|---|---|---|
| pico-voca-arabic | 563.419 | 2,3 MB PyTorch / 5,5 MB ONNX | ~370× tiempo real | 0,7% / 1,1% / 0,4% | 3,66 | Apache-2.0 |
| tiny-voca-arabic v2.1 | 4.534.411 | 18 MB PyTorch / 21 MB ONNX | ~200× tiempo real | 0,8% / 1,1% / 0,5% | 3,76 | Apache-2.0 |
| nano-voca-arabic | 1,2 M (aprox.) | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |
| micro-voca-arabic | 2,3 M (aprox.) | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |

La familia voca-arabic de oddadmix incluye además femto-voca-arabic (0,28 M), atto-voca-arabic (0,14 M) y tiny-voca-arabic v2.1 (4,5 M, modelo completo). Todos comparten arquitectura y receta, con distintos anchos de capa.

## Limitaciones y advertencias

- El modelo solo soporta árabe estándar moderno; no se documenta soporte para dialectos árabes ni para otros idiomas.
- La calidad de voz es inferior a la de tiny-voca-arabic v2.1 (DNSMOS 3,66 frente a 3,76), como era de esperar por su menor tamaño.
- El CER en el conjunto de test de la voz nf2 (noticias femenina) alcanza el 2,9%, el valor más alto de la tabla, lo que indica mayor riesgo de errores de pronunciación en ese estilo.
- No se documentan sesgos específicos, pero al entrenarse sobre un dataset concreto puede heredar sesgos de pronunciación o prosodia de las grabaciones originales.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí posible en forma de pronunciaciones incorrectas o lectura errónea de números y diacríticos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del dataset de entrenamiento (oddadmix/tiny-voca-arabic-v2.1-dataset) y del código base tiny-voca (también Apache-2.0).
- El modelo está entrenado desde cero, por lo que no hereda los pesos de tiny-voca original; su comportamiento puede diferir del de otros modelos de la misma familia.
- No se documentan mecanismos de control de prosodia más allá de la selección de voz y estilo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/pico-voca-arabic
- Demo: https://huggingface.co/spaces/oddadmix/pico-voca-arabic
- Dataset: https://huggingface.co/datasets/oddadmix/tiny-voca-arabic-v2.1-dataset
- Modelo completo (v2.1): https://huggingface.co/oddadmix/tiny-voca-arabic-v2.1
- Hermano de cuarto de tamaño (nano): https://huggingface.co/oddadmix/nano-voca-arabic
- Hermano de medio tamaño (micro): https://huggingface.co/oddadmix/micro-voca-arabic
- Hermano de un dieciseisavo (femto): https://huggingface.co/oddadmix/femto-voca-arabic
- Hermano de un treintaidosavo (atto): https://huggingface.co/oddadmix/atto-voca-arabic
- Modelo original tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Código de tiny-voca: https://github.com/n4ze3m/tiny-voca
- CATT (diacritización): https://github.com/abjadai/catt
