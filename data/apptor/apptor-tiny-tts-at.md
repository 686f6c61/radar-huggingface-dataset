# apptor/apptor-tiny-tts-at

## Resumen

apptor-tiny-tts-at es un modelo de síntesis de voz (text-to-speech) en alemán con acento austriaco ajustable, desarrollado por apptor. Se trata de un modelo extremadamente pequeño, de 4,5 millones de parámetros, distribuido como un único archivo ONNX de 21 MB, que sintetiza audio a 24 kHz a partir de tokens de fonemas. Su rasgo diferencial es un parámetro de entrada llamado `accent` que interpola entre alemán estándar (Hochdeutsch, valor 0) y acento austriaco (valor 1,0, ampliable hasta 1,6), permitiendo graduar la intensidad del acento por palabra o por frase.

El modelo parte de apptor-tiny-tts, la base alemana construida sobre la arquitectura tiny-voca de n4ze3m, y se ha afinado durante 24.000 pasos sobre una RTX 5060 Ti con 8.208 grabaciones austriacas de Mozilla Common Voice. Incluye además un modelo G2P propio (conv + BiGRU + CTC, 12 MB) que sustituye a eSpeak NG y evita dependencias GPL en tiempo de ejecución, junto con un vocoder Vocos afinado y cuantizado a int8.

Es relevante ahora por su enfoque de despliegue: funciona en CPU y directamente en el navegador mediante ONNX Runtime Web, sin servidor ni backend de síntesis, lo que lo hace adecuado para aplicaciones web ligeras y asistentes de voz embebidos donde los modelos grandes no caben. Se publica como versión 0.1, una preview temprana con acento todavía suave.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (basada en la arquitectura de n4ze3m), modelo acústico fonemas -> audio; G2P conv + BiGRU + CTC; vocoder Vocos |
| Parametros totales | 4,5 M (modelo acústico); G2P 12 MB; repo total 0,1 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | máximo 512 tokens por llamada (se trocea por frases) |
| Tipos de cuantizacion | vocoder en int8; pesos del modelo acústico en ONNX (cuantización adicional no disponible) |
| Idiomas soportados | alemán (de), con acento austriaco ajustable |
| Licencia | Apache-2.0 (vocoder Vocos: MIT) |
| Formato de pesos | ONNX (+ JSON de configuración) |
| Frecuencia de muestreo | 24 kHz |
| Voces | M2 (masculina sintética), F2 (femenina sintética) |
| Entradas ONNX | tokens, stress, voice, speed, pitch_shift, pitch_range, accent |
| Rango de acento | 0 (Hochdeutsch) a 1,0 (austriaco), máximo 1,6 |

## Arquitectura y entrenamiento

El modelo acústico sigue la arquitectura tiny-voca, un diseño compacto que convierte secuencias de tokens de fonemas en audio a 24 kHz. Acepta como entradas los tokens y su marcado de acento léxico (`stress`), el identificador de voz (`voice`: 0 = F2, 1 = M2), parámetros de control prosódico (`speed`, `pitch_shift`, `pitch_range`) y el parámetro `accent`, que interpola entre el estilo propio de la voz y un estilo austriaco compartido. El timbre permanece fijo en F2 o M2; lo que cambia con el deslizador es la pronunciación y la melodía.

El entrenamiento partió del modelo base apptor-tiny-tts y se afinó durante 24.000 pasos en una única GPU RTX 5060 Ti con 8.208 grabaciones austriacas de Mozilla Common Voice (licencia CC0), junto a las dos voces sintéticas creadas con Qwen3-TTS (Apache-2.0). Todos los hablantes reales se eliminaron del modelo exportado, de modo que solo puede hablar con las dos voces sintéticas. El front-end lingüístico incluye un modelo G2P entrenado para reproducir las lecturas de eSpeak NG sobre aproximadamente 480.000 palabras extraídas de las frases de Common Voice (98% de coincidencia en datos de validación), más listas manuales de nombres propios y lecturas austriacas (Kaffee, Tabak, Mathematik, Chemie, China). El vocoder es un Vocos afinado sobre las dos voces y cuantizado a int8. No se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en alemán a 24 kHz a partir de texto, con dos voces sintéticas (M2 masculina, F2 femenina).
- Control continuo del acento austriaco mediante el parámetro `accent` (0 a 1,6), aplicable por frase.
- Control de velocidad, desplazamiento de tono (`pitch_shift`) y rango de tono (`pitch_range`).
- Normalización de texto alemán: números, fechas, horas, tokens y listas de palabras mediante el front-end tinyvoca.
- Conversión grafema-fonema propia (G2P) sin dependencia de eSpeak NG ni de software GPL en tiempo de ejecución.
- Ejecución en CPU y en navegador mediante ONNX Runtime Web 1.20.1, con multihilo si se configuran las cabeceras COOP/COEP.
- Troceado automático de textos largos en frases (límite de 512 tokens por llamada) en `speak.py` y `apptor-tts.js`.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Síntesis de voz en webs y aplicaciones web: el modelo se ejecuta íntegramente en el navegador del usuario con ONNX Runtime Web, sin enviar texto a un servidor, lo que reduce latencia y simplifica el cumplimiento de privacidad. El primer acceso descarga unos 50 MB que quedan en caché.
- Asistentes de voz locales: integrado en el proyecto flash-voice (escuchar, decidir, hablar), permite construir un asistente completo en alemán que corre en el dispositivo sin backend de TTS.
- Lectura de contenido para usuarios austriacos: el parámetro `accent` permite ofrecer una pronunciación más cercana al habla local en aplicaciones de accesibilidad, lectores de noticias o audiolibros ligeros.
- Sistemas embebidos y de bajos recursos: con 4,5 M de parámetros y 21 MB en ONNX, cabe en dispositivos sin GPU y en entornos donde un modelo TTS grande no es viable.
- Prototipado rápido de interfaces de voz: el script `speak.py` y el módulo JS permiten generar audio en pocas líneas de código para demos, tests de UX o pruebas de accesibilidad.
- Aplicaciones educativas de pronunciación: el control de velocidad y de acento permite generar ejemplos de una misma frase en alemán estándar y en variante austriaca para comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que el G2P reproduce las lecturas de eSpeak NG en el 98% de las palabras en datos de validación, y que el modelo se entrenó con 24.000 pasos en una RTX 5060 Ti. No se aportan cifras de MOS, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse en CPU. El conjunto de archivos ocupa aproximadamente 0,1 GB en disco.
- GPU recomendadas: no son necesarias para inferencia; el entrenamiento se realizó en una RTX 5060 Ti.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU, dado su tamaño de 4,5 M de parámetros.
- Opciones de despliegue: ONNX Runtime (Python, con `onnxruntime`, `numpy` y `num2words`), ONNX Runtime Web 1.20.1 en navegador, y el proyecto flash-voice para asistentes completos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica que el multihilo en navegador requiere las cabeceras `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp`; sin ellas funciona en un solo núcleo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| apptor-tiny-tts-at | 4,5 M | 512 tokens por llamada | Alemán (acento austriaco) | Apache-2.0 | ONNX, CPU, navegador |
| apptor-tiny-tts | no disponible | no disponible | Alemán | no disponible | ONNX |
| Piper (referencia de TTS ligero) | no disponible en la informacion | no disponible | Múltiples | no disponible en la informacion | ONNX, CPU |
| Qwen3-TTS (usado para las voces) | no disponible en la informacion | no disponible | Múltiples | Apache-2.0 | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada; la comparación se limita a parámetros, licencia y modo de despliegue cuando constan.

## Limitaciones y advertencias

- Versión 0.1: el acento austriaco es suave y no aparece en todas las palabras; no es un dialecto.
- Algunas palabras y nombres propios se pronuncian de forma extraña.
- Solo alemán; las palabras en inglés se leen con pronunciación alemana.
- Calidad no de estudio: sin el filtro de sonido (vocoder) la voz suena zumbante.
- El parámetro `accent` por encima de 1,6 rompe la síntesis.
- Límite de 512 tokens por llamada; los textos largos deben trocearse en frases.
- Solo dispone de dos voces sintéticas; no admite clonación ni voces de hablantes reales.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de pronunciación incorrecta en términos fuera del vocabulario o de las listas manuales.
- Licencia Apache-2.0 para el modelo y el G2P; el vocoder Vocos es MIT. Conviene verificar las licencias de las dependencias (ONNX Runtime Web es MIT) antes de su uso comercial.
- No se documentan sesgos demográficos ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apptor/apptor-tiny-tts-at
- Demo en navegador: https://tiny-tts.apptor.at
- Modelo base: https://huggingface.co/apptor/apptor-tiny-tts
- Arquitectura tiny-voca: https://github.com/n4ze3m/tiny-voca
- Vocoder Vocos: https://github.com/gemelo-ai/vocos
- Proyecto flash-voice: https://github.com/ViktorsGitUser/flash-voice
- Mozilla Common Voice: https://commonvoice.mozilla.org
- ONNX Runtime: https://onnxruntime.ai
- Contacto del autor en X: https://x.com/apptor_at
