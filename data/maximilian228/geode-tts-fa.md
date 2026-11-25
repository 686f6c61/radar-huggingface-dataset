# Maximilian228/Geode-TTS-fa

## Resumen
Geode-TTS-fa es un paquete de síntesis de voz (text-to-speech) en persa (farsi) publicado por Maximilian228 para la aplicación Geode. No es un modelo entrenado desde cero: se trata de una exportación a ONNX del modelo Ava-82M (revisión 24160e4), un fine-tune en persa de Kokoro-82M, empaquetado para el runtime sherpa-onnx 2.0.1 con el formato de modelo Kokoro. El paquete incluye los pesos en fp32 y una variante int8 dinámica, la tabla de estilos de la única voz disponible y un léxico de 120.003 palabras persas con lecturas fonéticas y marcas de ezafe.

La relevancia del artefacto está en su orientación a dispositivo: la aplicación no ejecuta un G2P neuronal en el teléfono, sino que resuelve la pronunciación mediante el léxico incluido y reglas documentadas (normalización, afijos, letras y ezafe), pasando después la transcripción IPA por el vocabulario de tokens de Kokoro. Con 82 millones de parámetros y un peso int8 de 114 MB, el paquete está pensado para inferencia local en móviles de gama media, sin conexión y con una huella de memoria moderada.

El modelo cubre una sola voz (sid 0) y un solo idioma, el persa. Su utilidad principal es la lectura en voz alta de respuestas de un asistente y la conversión de texto a audio en aplicaciones offline; no está planteado como un sistema TTS multilingüe ni como base para clonación de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (StyleTTS2 con decoder basado en iSTFT), exportada a ONNX; G2P léxico en el front-end |
| Parametros totales | 82 M (heredados de Ava-82M / Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | fp32 (`model.onnx`, 326 MB) e int8 dinámica en MatMul/Conv, excluyendo las convoluciones de iSTFT (`model.int8.onnx`, 114 MB) |
| Idiomas soportados | persa (fa) |
| Licencia | Apache-2.0 (pesos); léxico con licencias MIT y CC BY 4.0 según `LICENSE-lexicon.txt` |
| Formato de pesos | ONNX (`model.onnx`, `model.int8.onnx`), más `voices.bin`, `tokens.txt` y `lexicon.txt` |
| Voces | una única voz (sid 0), tabla de estilos [510, 1, 256] |
| Runtime objetivo | sherpa-onnx 2.0.1 (formato Kokoro); motor int8 propio de Geode desde 0.10.12 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento
La arquitectura subyacente es Kokoro-82M, un modelo de StyleTTS2 con decoder que emplea iSTFT para generar la forma de onda, adaptado al persa mediante un fine-tune sobre el dataset Mana-TTS (CC0-1.0). El paquete publicado no entrena nada nuevo: la aportación de Maximilian228 es la exportación a ONNX siguiendo el script `scripts/kokoro/v1.0` de k2-fsa, la generación de metadatos para sherpa-onnx y la cuantización int8 selectiva, que deja en fp32 las convoluciones del iSTFT para no degradar la calidad de la señal.

La innovación práctica está en el front-end. En lugar de un G2P neuronal, la aplicación lee `lexicon.txt`, que contiene 120.003 palabras persas con lecturas procedentes de Homo-GE2PE-Persian y banderas de ezafe, y aplica reglas documentadas de normalización, afijos y letras antes de mapear la IPA al vocabulario de Kokoro mediante `GenerationConfig.tokens`. La cobertura del léxico alcanza el 97,4 % de las palabras del conjunto de test de FLEURS, ampliada un 1,6 % por reglas de afijos y un 1,0 % por reglas de letras. No se documentan datos sobre tokens de entrenamiento, composición del corpus ni etapas de RLHF o DPO en la información disponible.

## Capacidades
- Síntesis de voz en persa a partir de texto, con una única voz femenina identificada como sid 0.
- Conversión de texto a fonemas mediante léxico y reglas, sin G2P neuronal en el dispositivo.
- Ejecución totalmente offline y en local, sin llamadas a servicios externos.
- Inferencia en CPU con cuantización int8 y, según la model card, opción de GPU en el motor propio de Geode 0.10.12 o superior.
- Integración con el ecosistema sherpa-onnx 2.0.1 en formato Kokoro, lo que permite usarlo con otras aplicaciones compatibles.
- Lectura en voz alta de respuestas de un asistente conversacional dentro de la app Geode.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni clonación de voz.

## Casos de uso
- Lectura en voz alta de respuestas de un asistente: la app Geode usa este paquete como una de sus voces para leer respuestas del chat en persa, de forma offline, con una latencia adecuada para frases cortas y medias.
- Accesibilidad para personas con discapacidad visual: integrado en un lector de pantalla o en una app de lectura, el modelo permite convertir texto persa en audio en el propio teléfono sin depender de la nube.
- Aprendizaje de persa: un estudiante puede escuchar la pronunciación de palabras y frases, apoyándose en el léxico con lecturas y ezafe para una articulación correcta.
- Audiolibros y boletines: generación por lotes de audio a partir de texto periodístico o literario, aceptable para contenido donde una única voz neutra sea suficiente.
- Sistemas de navegación o avisos por voz en dispositivos empotrados: el tamaño int8 de 114 MB y el RTF cercano a 1,8 en un Redmi Note 9 Pro con 2 hilos lo hacen viable en hardware modesto.
- Prototipado de interfaces de voz en persa: desarrolladores que necesiten un TTS local y con licencia Apache-2.0 para pruebas de usabilidad o demos sin coste de API.
- Preprocesado de datos para ASR: generar audio sintético en persa para aumentar datasets de entrenamiento o evaluar sistemas de reconocimiento de voz.

## Benchmarks y rendimiento
La model card publica una evaluación de error de carácter (CER) en 30 frases de FLEURS fa_ir, medida con el ASR CTC Omnilingual 1B:

| Entrada | CER |
|---|---|
| Grabaciones reales | 5,5 |
| Este paquete con front-end léxico de Geode, fp32 | 5,0 |
| Este paquete con front-end léxico de Geode, int8 | 5,5 |
| Este paquete con Homo-GE2PE sobre frases completas (front-end propio de Ava) | 12,0 |

Rendimiento en dispositivo (Redmi Note 9 Pro, 2 hilos):

| Variante | RTF | Memoria |
|---|---|---|
| fp32 | 1,23 | 559 MB |
| int8 | 1,80 | 391 MB |

No se han publicado resultados de benchmarks estándar de TTS (MOS, MCD, WER) en la información disponible.

## Requisitos de hardware
- VRAM/RAM estimada: 559 MB en fp32 y 391 MB en int8 en el dispositivo de referencia; el peso en disco es de 326 MB (fp32) y 114 MB (int8).
- GPU recomendadas: no se especifican modelos concretos; la model card solo indica que el motor de Geode 0.10.12 o superior ofrece la opción de GPU. Para servidores, una GPU consumer moderna es más que suficiente dado el tamaño del modelo.
- Cabe en GPU consumer y en móviles de gama media: el benchmark se realizó en un Redmi Note 9 Pro, un dispositivo de gama media de 2020.
- Opciones de despliegue: sherpa-onnx 2.0.1 con formato Kokoro, el motor int8 propio de Geode y, en general, cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 1,23 en fp32 y 1,80 en int8 con 2 hilos en el dispositivo de referencia; no se proporcionan cifras para GPU ni para servidores.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato | Licencia | Contexto de uso |
|---|---|---|---|---|---|
| Geode-TTS-fa (este paquete) | 82 M | Persa | ONNX + léxico | Apache-2.0 | On-device, sherpa-onnx, una voz |
| Kokoro-82M | 82 M | Multilingüe (varias voces) | PyTorch, ONNX | Apache-2.0 | Uso general, múltiples voces e idiomas |
| Ava-82M | 82 M | Persa | PyTorch | Apache-2.0 | Fine-tune persa con front-end G2P propio |
| Piper (voces persas) | Variable, típicamente menor | Persa entre otros | ONNX | MIT/GPL según voz | On-device, integración con Home Assistant |

La comparación directa con Piper no está respaldada por datos de rendimiento en la información disponible; se incluye solo como referencia de categoría. Frente a Kokoro-82M, este paquete pierde el multilingüismo y la variedad de voces a cambio de un front-end léxico específico para persa y de un empaquetado listo para sherpa-onnx. Frente a Ava-82M, la diferencia principal es el formato y el front-end, no los pesos.

## Limitaciones y advertencias
- Una sola voz y un solo idioma: no admite cambio de hablante ni texto en otros idiomas.
- El front-end depende del léxico: palabras fuera de las 120.003 entradas y de las reglas de afijos y letras pueden pronunciarse mal; la cobertura medida es del 97,4 % en FLEURS, no del 100 %.
- El CER de 5,0-5,5 en FLEURS es una métrica de inteligibilidad vía ASR, no una medida de naturalidad percibida; no hay MOS publicado.
- Riesgo de alucinación acústica y artefactos en textos con puntuación atípica, números, siglas o nombres propios no cubiertos por el léxico.
- Restricciones de uso: aunque los pesos son Apache-2.0, la nota de uso responsable de Ava prohíbe suplantación de identidad, fraude y engaño, y exige declarar el audio sintético cuando pueda confundirse con una grabación real; los mantenedores de Mana-TTS imponen prohibiciones equivalentes.
- El léxico combina material MIT y CC BY 4.0; conviene revisar `LICENSE-lexicon.txt` antes de redistribuir el paquete.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La fecha de creación indicada (2026-11-22) es posterior a la de esta ficha; conviene verificar la vigencia de los artefactos antes de integrarlos en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-TTS-fa
- Modelo base Ava-82M: https://huggingface.co/xmanii/Ava-82M
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Aplicación Geode: https://geode.tifu.xyz
- Geode en Google Play: https://play.google.com/store/apps/details?id=xyz.tifu.geode
- Dataset Mana-TTS: https://huggingface.co/datasets/MahtaFetrat/Mana-TTS
- Homo-GE2PE-Persian: https://huggingface.co/MahtaFetrat/Homo-GE2PE-Persian
