# oddadmix/tiny-voca-arabic-v2.1

## Resumen

tiny-voca-arabic v2.1 es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno (fusha) desarrollado por oddadmix. Se trata de un modelo extremadamente compacto, con tan solo 4,5 millones de parámetros, entrenado desde cero sobre la arquitectura tiny-voca de Muhammed Nazeem (@n4ze3m), sin reutilizar pesos del modelo original. Su objetivo es ofrecer síntesis de voz en árabe de calidad razonable en CPU, sin necesidad de GPU ni de vocoder neuronal independiente.

La relevancia del modelo reside en su eficiencia: genera audio a 24 kHz a unas 200 veces el tiempo real usando cuatro hilos de CPU, con un peso de 18 MB en PyTorch y 21 MB en ONNX. Incorpora ocho voces sintéticas en cuatro estilos de locución (asistente, noticias, relato y promoción), con una voz femenina y otra masculina por estilo, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

La versión 2.1 es una actualización incremental sobre la v2 que mejora la voz `sf1` (relato femenino) mediante 2.341 clips adicionales y una relajación del filtro de alineación para sonidos finales de frase largos, manteniendo la misma arquitectura, entradas y orden de voces, por lo que es un reemplazo directo de la v2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | tiny-voca (modelo acústico + sintetizador source-filter, sin vocoder neuronal) |
| Parámetros totales | 4.534.411 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en PyTorch y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | árabe (árabe estándar moderno, fusha) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (18 MB) y ONNX (21 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura tiny-voca, que combina un modelo acústico y un sintetizador source-filter. La red predice duraciones, pausas, tono (pitch), sonoridad (voicing) y energía para la voz seleccionada, y posteriormente un sintetizador source-filter genera la forma de onda. No hay un vocoder neuronal separado, lo que contribuye a su reducido tamaño y a su velocidad en CPU. El front-end fonético es específico para árabe estándar moderno e incluye conversión de números a palabras, diacritización mediante CATT (encoder-decoder, Apache-2.0), y un conversor de reglas a fonemas con 49 símbolos que modela asimilación de letras solares, elisión de hamzat al-wasl, vocales largas acortadas ante wasl, shadda como consonante duplicada, tanween, tāʾ marbūṭa, formas pausales, refuerzo enfático de /a/ junto a ص ض ط ظ ق y lām oscura en الله, además de acento por peso silábico.

El entrenamiento se realizó desde cero con 89.569 enunciados y 242 horas de audio tras los controles de alineación (entre 24 y 39 horas por voz), durante 200.000 pasos, en aproximadamente 5 horas sobre una única GPU. Durante la alineación de los datos, cada terminación casual (iʿrāb) en mitad de frase se conservó o eliminó por clip según cuál versión apoyaba el audio, mediante una comparación de verosimilitud CTC, de modo que el modelo aprendió el comportamiento observado en los hablantes. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en árabe estándar moderno (fusha) a partir de texto, con salida de audio mono a 24 kHz.
- Ocho voces sintéticas seleccionables mediante el parámetro `voice` (0–7): cuatro estilos de locución (asistente, noticias, relato, promoción) con una voz femenina y otra masculina por estilo.
- Normalización de números leídos como palabras en árabe estándar moderno.
- Diacritización automática del texto de entrada mediante CATT.
- Conversión fonética basada en reglas específicas del árabe (asimilación, elisión, formas pausales, acento).
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Generación de audio a aproximadamente 200 veces el tiempo real con cuatro hilos de CPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multistep, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en árabe para dispositivos embebidos: el modelo puede generar respuestas habladas en fusha con la voz de estilo asistente (`a000` o `am6`) en CPU, lo que permite integrarlo en altavoces inteligentes o terminales sin GPU.
- Lectura de noticias y boletines: las voces de estilo noticias (`nf2`, `nm2`) ofrecen una locución estable y neutra adecuada para la síntesis automática de titulares y resúmenes informativos en árabe.
- Narración de audiolibros y relatos: la voz `sf1` (relato femenino), mejorada en la v2.1 con 39 horas de entrenamiento, está pensada para narración expresiva con fraseo pausado y sonidos finales alargados.
- Anuncios y promociones: las voces de estilo promoción (`pf4`, `pm2`) permiten generar locuciones publicitarias breves con un tono brillante para vídeos o cuñas de radio.
- Accesibilidad y lectura de pantalla: el modelo puede convertir texto árabe en audio para aplicaciones de lectura asistida, con un coste computacional mínimo que permite ejecutarlo localmente en el dispositivo del usuario.
- Generación de material educativo y de aprendizaje de árabe: la salida en fusha con diacritización y reglas fonéticas explícitas facilita la creación de audios de pronunciación para estudiantes.
- Prototipado rápido de interfaces de voz: al ser un modelo de 21 MB en ONNX, se puede desplegar en contenedores ligeros o en el navegador para validar experiencias de voz antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Los datos de evaluación publicados en la model card se refieren a la voz `sf1` sobre 50 frases retenidas, comparando la versión 2.1 con la v2 y con las grabaciones originales:

| Métrica | v2.1 | v2 | Grabaciones |
|---|---|---|---|
| Ruido de fondo (DNSMOS BAK) | 3,79 | 3,57 | 4,03 |
| Calidad global (P.808) | 3,32 | 3,25 | 3,46 |
| Tasa de error de caracteres (CER) | 0,3 % | 0,3 % | 0,3 % |

Para las otras siete voces, la model card indica que la calidad (P.808) se mantiene dentro de 0,04 respecto a la v2, sin valores inferiores, y la precisión (CER) dentro de 0,6 puntos, situándose en o por debajo del CER de las grabaciones. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. El peso ONNX ocupa 21 MB y el de PyTorch 18 MB.
- GPU recomendadas: no disponibles ni necesarias; el modelo se ejecuta en CPU con ONNX Runtime.
- Cabe en cualquier GPU consumer, aunque su uso previsto es en CPU; también cabe en dispositivos de bajos recursos.
- Opciones de despliegue: ONNX Runtime (librería declarada), con pesos también en PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: aproximadamente 200 veces el tiempo real con cuatro hilos de CPU, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| tiny-voca-arabic v2.1 | 4,5 M | no disponible | árabe (fusha) | Apache-2.0 | PyTorch, ONNX | Hugging Face |
| tiny-voca (original, n4ze3m) | no disponible | no disponible | no disponible | Apache-2.0 | no disponible | Hugging Face, GitHub |
| oddadmix/tiny-voca-arabic-v2 | 4,5 M (misma arquitectura) | no disponible | árabe (fusha) | Apache-2.0 | PyTorch, ONNX | Hugging Face |
| oddadmix/tiny-voca-arabic-v1 | no disponible | no disponible | árabe (fusha) | Apache-2.0 | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta árabe estándar moderno (fusha); no se documenta soporte para dialectos árabes ni para otros idiomas.
- Las voces son sintéticas y entrenadas sobre grabaciones; la model card reporta que la calidad global (P.808) queda por debajo de las grabaciones originales (3,32 frente a 3,46 en la voz `sf1`), por lo que la naturalidad es limitada.
- El modelo aprende el comportamiento de iʿrāb observado en los datos, conservando o eliminando terminaciones casuales según el clip; esto puede producir inconsistencias en la pronunciación de casos gramaticales.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto de datos limitado (242 horas, ocho voces) puede presentar sesgos de prosodia o de estilo propios de las grabaciones.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas en palabras fuera del dominio o con diacritización errónea por parte de CATT.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de atribución a la arquitectura tiny-voca original de Muhammed Nazeem y a las dependencias (CATT, Apache-2.0).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- No se documentan cuantizaciones adicionales ni límites de longitud de texto de entrada; el rendimiento puede degradarse con textos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/tiny-voca-arabic-v2.1
- Dataset: https://huggingface.co/datasets/oddadmix/tiny-voca-arabic-v2.1-dataset
- Demo: https://huggingface.co/spaces/oddadmix/tiny-voca-arabic-v2
- Versión 2: https://huggingface.co/oddadmix/tiny-voca-arabic-v2
- Versión 1: https://huggingface.co/oddadmix/tiny-voca-arabic-v1
- Arquitectura tiny-voca original: https://huggingface.co/n4ze3m/tiny-voca
- Repositorio tiny-voca: https://github.com/n4ze3m/tiny-voca
- CATT (diacritizador): https://github.com/abjadai/catt
