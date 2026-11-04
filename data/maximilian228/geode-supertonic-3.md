# Maximilian228/Geode-Supertonic-3

## Resumen

Geode-Supertonic-3 es una redistribución cuantizada a int8 en formato ONNX del modelo de síntesis de voz Supertonic 3, desarrollado originalmente por Supertone Inc. La conversión la realiza el proyecto sherpa-onnx y la publica el usuario Maximilian228 para integrarla en la aplicación Geode, un asistente que lee sus respuestas en voz alta cuando el usuario selecciona esta voz en sus ajustes. El modelo no es una creación original de este repositorio: los ficheros son idénticos byte a byte a los del release `sherpa-onnx-supertonic-3-tts-int8-2026-05-11` de sherpa-onnx.

Se trata de un sistema TTS multilingüe con soporte para 31 idiomas (entre ellos español, inglés, coreano, japonés, árabe, hindi y la práctica totalidad de lenguas europeas), empaquetado en cuatro componentes ONNX separados (text encoder, duration predictor, vector estimator y vocoder) junto con configuración, índice de texto y diez estilos de voz pregrabados (cinco femeninos F1-F5 y cinco masculinos M1-M5). El tamaño del repositorio es de 0,1 GB y el modelo ocupa unos 300 MB en memoria cuando está abierto.

Su relevancia actual reside en que demuestra la viabilidad de TTS neuronal multilingüe en dispositivos móviles de gama media sin conexión: en un Redmi Note 9 Pro (Snapdragon 720G) procesa una frase de 7,6 segundos en ucraniano en 3,6 segundos, con un factor de tiempo real de 0,48. La licencia es BigScience Open RAIL-M, con las restricciones de uso por finalidad (Attachment A) que dicha licencia impone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal por difusión/estimación en cuatro etapas: text encoder, duration predictor, vector estimator y vocoder (ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (única variante publicada en este repositorio) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | BigScience Open RAIL-M (openrail) |
| Formato de pesos | ONNX (int8): `text_encoder.int8.onnx`, `duration_predictor.int8.onnx`, `vector_estimator.int8.onnx`, `vocoder.int8.onnx` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de su descomposición en cuatro módulos ONNX: un codificador de texto, un predictor de duración, un estimador de vectores (vector estimator) y un vocoder. Esta estructura por etapas es característica de los sistemas TTS neuronales modernos que separan la conversión texto-fonema/representación, la predicción de la duración de cada unidad y la generación final de la forma de onda. No se especifican en la información proporcionada el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable en este repositorio concreto es la cuantización a int8 de los cuatro componentes ONNX, realizada por sherpa-onnx, que permite ejecutar el modelo en CPU de dispositivos móviles con un consumo de memoria de aproximadamente 300 MB en residente. El paquete incluye además `voice.bin` con diez estilos de voz (speaker ids 0-4 para F1-F5 y 5-9 para M1-M5), `tts.json` con la configuración y `unicode_indexer.bin` con el índice de texto. Los ficheros se distribuyen sin modificar respecto al release original, verificado por sha256.

## Capacidades

- Síntesis de voz (text-to-speech) en 31 idiomas, incluyendo español, inglés, coreano, japonés, árabe, hindi, ruso y ucraniano.
- Diez estilos de voz pregrabados: cinco femeninos (F1-F5) y cinco masculinos (M1-M5), seleccionables mediante speaker id.
- Ejecución completamente en dispositivo (on-device) sin necesidad de conexión a red.
- Inferencia en CPU mediante sherpa-onnx, con soporte multi-hilo configurable.
- Integración en aplicaciones Android a través de sherpa-onnx y en cualquier entorno que soporte runtime ONNX.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad (visión o audio de entrada); el modelo es exclusivamente TTS.

## Casos de uso

- Lectura de respuestas de asistentes conversacionales en aplicaciones móviles: es exactamente el uso para el que se publica este repositorio, donde Geode descarga los ficheros solo cuando el usuario elige esta voz y los mantiene en el almacenamiento del teléfono, abriéndolos en memoria únicamente mientras lee una respuesta.
- Accesibilidad para personas con discapacidad visual: el modelo permite convertir texto de aplicaciones en voz sintetizada en 31 idiomas sin conexión, con un factor de tiempo real de 0,48 que hace viable la lectura fluida en un Snapdragon 720G.
- Audiolibros y lectura de documentos en dispositivos de gama media: la cuantización int8 y el consumo de 300 MB en residente permiten procesar textos largos por fragmentos en teléfonos con RAM limitada.
- Sistemas de navegación y avisos por voz offline: la inferencia local elimina la dependencia de red y la latencia de ida y vuelta de los servicios TTS en la nube, adecuado para entornos con conectividad intermitente.
- Localización de contenido en 31 idiomas: un mismo modelo cubre desde lenguas europeas mayoritarias (es, fr, de, it, pt, nl, pl) hasta idiomas de menor recursos como estonio, letón, lituano, esloveno, croata o búlgaro, lo que simplifica el despliegue multilingüe frente a soluciones por idioma.
- Integración en pipelines de sherpa-onnx para síntesis por lotes en servidores CPU: al ser ficheros ONNX estándar, se pueden ejecutar con el runtime de sherpa-onnx en entornos sin GPU para generar locuciones de forma económica.
- Prototipado de interfaces de voz en Android: el formato y la licencia permiten empaquetar el modelo dentro de una aplicación y distribuirlo junto a ella, siempre que se respeten las restricciones de uso de la licencia.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son mediciones de velocidad en dispositivo:

| Métrica | Valor medido |
|---|---|
| Dispositivo | Redmi Note 9 Pro (Snapdragon 720G, 2 núcleos Cortex-A76) |
| Runtime | sherpa-onnx 2.0.1, 2 hilos |
| Frase de prueba | 7,6 s en ucraniano |
| Tiempo de síntesis | 3,6 s |
| Factor de tiempo real (RTF) | 0,48 |
| Tiempo de apertura del modelo | ~1,7 s |
| Memoria residente | ~300 MB |
| Prueba con 4 hilos | Sin mejora (los núcleos restantes son A55 de baja potencia) |

No se han publicado resultados de benchmarks de calidad (MOS, WER de transcripción inversa, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU mediante ONNX Runtime. Memoria RAM residente de aproximadamente 300 MB durante la inferencia.
- GPU recomendadas: no se documenta soporte GPU en la información disponible; el runtime de referencia es CPU (sherpa-onnx).
- Dispositivos de referencia: funciona en un Snapdragon 720G con dos núcleos Cortex-A76; cabe en teléfonos Android de gama media.
- GPU de consumo: no aplica para el caso de uso documentado; no hay datos de ejecución en GPU (RTX 4090, etc.).
- Opciones de despliegue: sherpa-onnx (runtime principal y el usado en la medición), ONNX Runtime en general. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: RTF de 0,48 en la configuración medida (2 hilos, Snapdragon 720G), con tiempos similares para ruso e inglés según la model card. El escalado a 4 hilos no aporta mejora en ese dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Ejecución en dispositivo |
|---|---|---|---|---|---|
| Geode-Supertonic-3 (este) | TTS ONNX int8 | 31 | ONNX int8 | OpenRAIL-M | Sí, CPU móvil (~300 MB) |
| Supertone/supertonic-3 | TTS original | 31 | no disponible en la información | OpenRAIL-M | No documentado en la información |
| sherpa-onnx-supertonic-3-tts-int8-2026-05-11 | TTS ONNX int8 (origen de estos ficheros) | 31 | ONNX int8 | OpenRAIL-M | Sí |
| Otros modelos TTS de sherpa-onnx | TTS ONNX | variable | ONNX | variable | Sí |

No se dispone en la información proporcionada de datos de benchmarks que permitan comparar la calidad de salida con alternativas como Piper, VITS o modelos TTS comerciales; la comparativa se limita a formato, licencia y viabilidad de despliegue.

## Limitaciones y advertencias

- La licencia BigScience Open RAIL-M impone restricciones de uso por finalidad (Attachment A): no usar el modelo para violar la ley aplicable, dañar a menores, generar o difundir información verificablemente falsa con intención de perjudicar, presentar la salida sin revelar que es generada por máquina, difamar o acosar, o suplantar a una persona sin su consentimiento (deepfakes). Es obligatorio leer el texto completo antes de cualquier uso.
- Riesgo de alucinación y errores de pronunciación: no se documentan métricas de calidad (MOS, WER) que permitan acotar la fidelidad de la síntesis en cada uno de los 31 idiomas; los idiomas de bajos recursos del conjunto podrían presentar peor calidad.
- Solo se publica la variante int8; no hay versiones fp16 o fp32 en este repositorio para comparar la pérdida de calidad por cuantización.
- El modelo es exclusivamente TTS: no procesa audio de entrada, no hace clonación de voz a partir de muestras y no admite instrucciones en lenguaje natural para controlar el estilo más allá de la selección de speaker id.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 4 de noviembre de 2026; es una redistribución reciente sin historial de uso comunitario.
- Los diez estilos de voz son fijos (F1-F5, M1-M5); no se documenta la posibilidad de añadir voces nuevas sin reentrenar o sustituir `voice.bin`.
- Las mediciones de velocidad proceden de un único dispositivo (Redmi Note 9 Pro); el rendimiento en otros SoC puede diferir y no se garantiza el RTF de 0,48.
- Al ser una redistribución sin cambios, cualquier corrección o mejora debe provenir del modelo original de Supertone o del release de sherpa-onnx.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Maximilian228/Geode-Supertonic-3
- Modelo original: https://huggingface.co/Supertone/supertonic-3
- Release de sherpa-onnx con los ficheros int8: https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models
- Espejo del release en HuggingFace: https://huggingface.co/csukuangfj2/sherpa-onnx-supertonic-3-tts-int8-2026-05-11
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Aplicación Geode: https://geode.tifu.xyz
- Supertone Inc.: https://huggingface.co/Supertone
