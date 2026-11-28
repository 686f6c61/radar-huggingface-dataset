# oddadmix/tiny-voca-arabic

## Resumen

tiny-voca-arabic es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno (فصحى) desarrollado por oddadmix. Se trata de un modelo extremadamente compacto, con tan solo 4.531.723 parámetros (18 MB en PyTorch, 21 MB en ONNX), entrenado desde cero sobre la arquitectura tiny-voca de Muhammed Nazeem y un front-end fonético árabe nuevo. Convierte texto en audio de 24 kHz mono a aproximadamente 200 veces el tiempo real sobre dos hilos de CPU, lo que lo sitúa en la categoría de modelos desplegables en entornos sin GPU.

El modelo resuelve el problema de la síntesis de voz en árabe estándar moderno con un coste computacional mínimo, algo relevante para asistentes de voz, sistemas embebidos y aplicaciones de accesibilidad que necesitan TTS en árabe sin depender de infraestructura de GPU. Incluye el generador de forma de onda completo (sintetizador fuente-filtro, sin vocoder neuronal separado) y un front-end que realiza normalización de números, diacritización con CATT y conversión a fonemas mediante reglas.

Su relevancia actual radica en que, según el Open TTS Leaderboard (versión 1.7.3, 24 de noviembre de 2026), ocupa el primer puesto entre 13 modelos de árabe en la tabla de voz fija, con un WER de 3,40 frente al 4,45 del segundo clasificado, a pesar de ser órdenes de magnitud más pequeño que los competidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (modelo acústico + sintetizador fuente-filtro; sin vocoder neuronal) |
| Parametros totales | 4.531.723 (18 MB PyTorch, 21 MB ONNX) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una frase por llamada; máximo de 500 fonemas por segmento) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | árabe (árabe estándar moderno, MSA) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime); se mencionan pesos PyTorch de 18 MB |
| Frecuencia de muestreo | 24 kHz mono |
| Voces | una voz sintética MSA (`a000`) |
| Datos de entrenamiento | 45.737 enunciados, 89 horas |
| Entrenamiento | 104.000 pasos, 2,6 horas en una GPU |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura tiny-voca, que combina un modelo acústico y un sintetizador fuente-filtro. La red predice duraciones, pausas, tono (pitch), sonoridad (voicing) y energía; a partir de esas predicciones, el sintetizador fuente-filtro genera la forma de onda directamente, sin un vocoder neuronal separado. El front-end, específico para árabe, consta de cuatro etapas: expansión de números a palabras MSA, diacritización mediante CATT (encoder-decoder, Apache-2.0), conversión a fonemas con un conversor basado en reglas de 49 símbolos y, finalmente, la síntesis acústica.

El conversor fonético implementa asimilación de letras solares, elisión de hamzat al-wasl y vocales de apoyo, acortamiento de vocales largas ante wasl, shadda como consonante duplicada, tanween, tāʾ marbūṭa (`t` dentro de frase, omitida en pausa), formas pausales en puntuación, refuerzo enfático de /a/ junto a ص ض ط ظ ق (y tras خ غ ر), lām oscura en الله y acentuación según el peso silábico. El entrenamiento se realizó desde cero sobre el dataset `oddadmix/msa-duplex-assistant-tts` (45.737 enunciados, 89 horas), sin reutilizar pesos de tiny-voca. Durante la alineación de datos, cada terminación casual (iʿrāb) en mitad de frase se conservó o eliminó por clip según lo que el audio soportaba (comparación de verosimilitud CTC); aproximadamente la mitad se eliminaron, de modo que el modelo aprendió de lo que realmente se pronunció.

## Capacidades

- Síntesis de voz en árabe estándar moderno (MSA) con una única voz sintética (`a000`).
- Generación de audio a 24 kHz mono con el generador de forma de onda incluido.
- Normalización de números: lee cifras como palabras MSA (por ejemplo, 2.500.000 y 35 %).
- Diacritización automática del texto de entrada mediante CATT antes de la fonemización.
- Control de velocidad (`speed`), desplazamiento de tono (`pitch_shift`, 0,058 ≈ un semitono) y rango de entonación (`pitch_range`).
- Predicción de duraciones, pausas, tono, sonoridad y energía por parte del modelo acústico.
- Procesamiento por frases: el texto largo debe dividirse en oraciones (máximo de 500 fonemas por segmento).
- Ejecución en CPU con onnxruntime, sin necesidad de GPU.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Asistentes de voz en árabe para dispositivos embebidos: el modelo cabe en 21 MB ONNX y se ejecuta a unas 200 veces el tiempo real en dos hilos de CPU, lo que permite integrarlo en Raspberry Pi o sistemas sin GPU para lectura de respuestas en MSA.
- Atención al cliente automatizada por voz: al procesar una frase por llamada con latencia mínima, puede encadenarse con un ASR y un LLM para construir un bucle conversacional completo en árabe estándar.
- Lectura de contenidos y accesibilidad: conversión de artículos, notificaciones o mensajes a audio en MSA, con normalización de cifras (poblaciones, porcentajes) integrada en el front-end.
- Sistemas de anuncios y megafonía: generación de locuciones en árabe estándar para transporte público, aeropuertos o comercios, con control de velocidad y tono para adaptar el estilo.
- Aplicaciones educativas de aprendizaje de árabe: síntesis de frases con diacritización automática y pronunciación basada en reglas (asimilación solar, wasl, pausas), útil para ejercicios de lectura y dictado.
- Prototipado rápido de interfaces de voz: al requerir solo onnxruntime, numpy y soundfile, permite validar productos de voz en árabe sin aprovisionar infraestructura de GPU.
- Generación de audio para doblaje o previsualización de guiones: lectura de guiones con control de entonación (`pitch_range`) y desplazamiento de tono para ajustar el registro de la voz.

## Benchmarks y rendimiento

Evaluación con transcripciones de Whisper large-v3 del audio generado frente al texto de entrada (sin diacríticos ni puntuación). Los conjuntos de validación y test provienen de diálogos no vistos en entrenamiento; las frases nuevas no aparecen en ningún split.

| Conjunto | Clips | CER | WER | CER de las grabaciones originales |
|---|---|---|---|---|
| Validación | 25 | 0,5 % | 1,2 % | 1,0 % |
| Test | 25 | 1,8 % | 2,4 % | 2,1 % |
| Frases nuevas | 8 | 0,3 % | 1,4 % | — |

La mayoría de los errores restantes corresponden a Whisper escribiendo números hablados como dígitos. Las duraciones generadas quedan dentro del 3 % de las grabaciones y la variación de tono coincide (3,6 semitonos).

Open TTS Leaderboard (versión 1.7.3, 24 de noviembre de 2026), tabla de voz fija en árabe; WER y RTFx son el compuesto de los benchmarks MiniMax y ZTTS2-Eval-Mini (clean):

| Puesto | Modelo | WER ↓ | RTFx ↑ | Tamaño (B) |
|---:|---|---:|---:|---:|
| 1 | oddadmix/tiny-voca-arabic | 3,40 | 6,5 | 0,0266 |
| 2 | Supertone/supertonic-3 | 4,45 | 67,7 | 0,1 |
| 3 | fishaudio/drama-3 | 4,58 | 24,9 | 35,0 |

Nota del autor: generado en CPU (host H200); el RTFx no es directamente comparable con modelos generados en GPU. El tamaño incluye el front-end diacritizador CATT y su sobrecoste por frase se cuenta en el RTFx.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU con onnxruntime (21 MB ONNX).
- GPU recomendadas: no se requieren; el modelo se ejecuta en CPU. El entrenamiento se realizó en una sola GPU (2,6 horas, 104.000 pasos).
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el despliegue típico es CPU.
- Opciones de despliegue: onnxruntime con el proveedor `CPUExecutionProvider`, junto con numpy, soundfile y tqdm. El front-end requiere el diacritizador CATT; el Space de demostración incluye `app.py`, `tiny_voca_ar/` y `catt_tashkeel/` listos para ejecutar.
- Latencia y throughput: aproximadamente 200 veces el tiempo real sobre dos hilos de CPU para la generación de forma de onda; el RTFx compuesto del leaderboard es 6,5 (incluye el sobrecoste por frase del diacritizador CATT).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (leaderboard árabe) | RTFx | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| oddadmix/tiny-voca-arabic | 4,53 M | no disponible | 3,40 | 6,5 | Apache-2.0 | Hugging Face, ONNX |
| Supertone/supertonic-3 | 0,1 B | no disponible | 4,45 | 67,7 | no disponible | Hugging Face |
| fishaudio/drama-3 | 35,0 B | no disponible | 4,58 | 24,9 | no disponible | Hugging Face |

tiny-voca-arabic es el más pequeño de los tres por un margen de uno a tres órdenes de magnitud y obtiene el mejor WER en la tabla de voz fija en árabe, aunque su RTFx es inferior al de supertonic-3 (6,5 frente a 67,7), en parte por el sobrecoste del diacritizador CATT y por haberse medido en CPU. Los datos de licencia y contexto de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Una sola voz sintética (`a000`); no hay variedad de hablantes ni control de identidad vocal.
- Solo soporta árabe estándar moderno; no se documentan dialectos regionales.
- Procesa una frase por llamada (máximo de 500 fonemas por segmento); el texto largo debe dividirse manualmente en oraciones.
- Depende del diacritizador CATT para el front-end, lo que añade latencia por frase y una dependencia externa (Apache-2.0).
- La evaluación se basa en transcripciones de Whisper large-v3, lo que puede introducir sesgos de medición (por ejemplo, números escritos como dígitos).
- Riesgo de alucinación no documentado para TTS; los errores de pronunciación se concentran en los casos cubiertos por las reglas del conversor fonético.
- Sesgos conocidos: no se documentan en la información disponible.
- Licencia Apache-2.0, que permite uso comercial; debe conservarse el aviso de atribución a tiny-voca (Muhammed Nazeem, @n4ze3m) y a CATT (abjadai).
- En producción, conviene validar la calidad en el dominio concreto (números, nombres propios, siglas) y monitorizar la latencia del diacritizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/tiny-voca-arabic
- Demo (Space): https://huggingface.co/spaces/oddadmix/tiny-voca-arabic
- Dataset: https://huggingface.co/datasets/oddadmix/msa-duplex-assistant-tts
- tiny-voca (arquitectura base): https://huggingface.co/n4ze3m/tiny-voca
- Repositorio tiny-voca: https://github.com/n4ze3m/tiny-voca
- CATT (diacritizador): https://github.com/abjadai/catt
- Open TTS Leaderboard: https://huggingface.co/spaces/hf-audio/open_tts_leaderboard
- Resultados en árabe (versión 1.7.3): https://huggingface.co/spaces/hf-audio/open_tts_leaderboard?version=1.7.3&languages=ar
