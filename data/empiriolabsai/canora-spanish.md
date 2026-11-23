# empiriolabsai/canora-spanish

## Resumen

Canora Spanish es un modelo de síntesis de voz (text-to-speech) especializado en español, desarrollado por EmpirioLabs como un fine-tuning de hexgrad/Kokoro-82M. Se distribuye con dos voces predefinidas, `lucia` (femenina) y `mateo` (masculina), y mantiene el tamaño compacto del modelo base: 82 millones de parámetros. Su propósito es ofrecer TTS en español con una inteligibilidad y naturalidad superiores a las alternativas ligeras habituales (voces Piper y las voces españolas del propio Kokoro-82M), con licencia Apache 2.0 que permite uso comercial sin restricciones.

La relevancia del modelo reside en su relación entre calidad y coste computacional: con solo 82M de parámetros y un fichero ONNX int8 de 115 MB, alcanza tasas de error de palabra (WER) de 1,85-2,90 % y puntuaciones UTMOS de 3,97-4,22, superando a todas las voces Piper evaluadas y a las voces españolas del Kokoro original. Además, incluye pesos ONNX en precisión completa, media precisión e int8, lo que facilita su despliegue tanto en servidores con ONNX Runtime como en el navegador mediante transformers.js.

El modelo está pensado para aplicaciones que necesitan locución en español de calidad con latencia baja y huella mínima: asistentes de voz, lectura de notificaciones, accesibilidad, generación de audio para contenidos o integración en pipelines de datos. Su entrenamiento parte de Kokoro-82M y añade un módulo de conversión de texto a fonemas específico para español incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS basado en StyleTTS 2, según el tag `style_text_to_speech_2`) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto por fragmentos, sin ventana de contexto definida) |
| Tipos de cuantizacion | ONNX en precisión completa, media precisión (FP16) e int8 |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (precisión completa, FP16, int8); carga mediante el paquete `kokoro` |

## Arquitectura y entrenamiento

Canora Spanish es un fine-tuning de hexgrad/Kokoro-82M, un modelo TTS de 82M de parámetros etiquetado con `style_text_to_speech_2`, lo que lo sitúa en la familia de arquitecturas StyleTTS 2. El modelo conserva el tamaño y la velocidad del base y se carga con el paquete estándar `kokoro` de Python. El repositorio incluye además un módulo de conversión de texto a fonemas en un solo fichero, que invoca `espeak-ng` para la fonemización del español, y pesos ONNX preparados para ONNX Runtime y transformers.js.

No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO. La model card sí documenta una evaluación propia sobre 200 frases en español no vistas durante el entrenamiento, con transcripción automática mediante `openai/whisper-large-v3`, y destaca el tratamiento correcto de números, fechas, horas y precios tal como los pronuncia un hablante nativo de español.

## Capacidades

- Síntesis de voz en español con dos voces: `lucia` (femenina) y `mateo` (masculina).
- Lectura natural de números, fechas, horas y precios con formato español (por ejemplo, «14:35», «1,50 €»).
- Alta inteligibilidad: WER de 1,85 % (`mateo`) y 2,90 % (`lucia`) sobre 200 frases de evaluación.
- Naturalidad estimada por UTMOS: 4,22 (`lucia`) y 3,97 (`mateo`) en escala de 1 a 5.
- Identificación de idioma española robusta: `whisper-large-v3` asigna probabilidad media de 1,00 a ambas voces.
- Inferencia en CPU con PyTorch (2,8x tiempo real) y ONNX (3,5x en FP32, 3,8x en int8) sobre 4 hilos de un AMD EPYC 7763.
- Despliegue en navegador mediante transformers.js gracias a los pesos ONNX.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, ni soporte multilingüe más allá del español.

## Casos de uso

- Asistentes de voz y altavoces inteligentes: el modelo puede generar respuestas habladas en español con latencia baja en CPU, lo que permite ejecutarlo en dispositivos sin GPU dedicada y mantener conversaciones fluidas.
- Lectura de notificaciones y alertas: con 115 MB en int8, cabe en entornos embebidos y puede sintetizar mensajes cortos (recordatorios, avisos de sistema) con pronunciación correcta de horas y fechas.
- Accesibilidad web: integración vía transformers.js para leer contenido de páginas en el navegador del usuario, sin enviar texto a servidores externos y con licencia Apache 2.0 para uso comercial.
- Generación de audio para contenidos: locución de artículos, resúmenes o guiones con dos voces disponibles, adecuada para podcasts ligeros o vídeos explicativos donde no se requiere clonación de voz.
- Sistemas de atención telefónica automatizada (IVR): síntesis de menús y respuestas pregrabadas dinámicamente, con buena inteligibilidad en condiciones de audio telefónico y coste computacional mínimo.
- Pipelines de datos y audiolibros: conversión por lotes de texto a voz en servidores sin GPU, aprovechando el rendimiento de 3,8x tiempo real en ONNX int8 para procesar grandes volúmenes.
- Pruebas y prototipado de interfaces de voz: al cargarse con el paquete estándar `kokoro` y ofrecer pesos ONNX, se integra rápidamente en prototipos de aplicaciones de voz en español.

## Benchmarks y rendimiento

Evaluación de EmpirioLabs sobre 200 frases en español no vistas, transcritas con `openai/whisper-large-v3`. WER más bajo es mejor; UTMOS (1-5) más alto es mejor.

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora Spanish `lucia` | 2,90 % | 4,22 |
| Canora Spanish `mateo` | 1,85 % | 3,97 |
| Kokoro-82M `ef_dora` | 2,70 % | 3,66 |
| Kokoro-82M `em_alex` | 2,70 % | 3,44 |
| Kokoro-82M `em_santa` | 2,80 % | 2,94 |
| Piper `es_MX-claude-high` | 4,10 % | 3,60 |
| Piper `es_ES-sharvard-medium` | 4,35 % | 2,93 |
| Piper `es_ES-davefx-medium` | 5,16 % | 2,65 |
| Piper `es_ES-carlfm-x_low` | 6,11 % | 3,23 |
| Piper `es_MX-ald-medium` | 6,26 % | 3,31 |
| Piper `es_AR-daniela-high` | 11,91 % | 3,01 |
| Piper `es_ES-mls_9972-low` | 18,97 % | 3,19 |
| Piper `es_ES-mls_10246-low` | 29,73 % | 2,03 |

Rendimiento de la versión int8 sobre las mismas frases: `lucia` 2,70 % WER y UTMOS 3,43; `mateo` 1,90 % WER y UTMOS 3,20.

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 7763 (segundos de audio por segundo de cómputo): PyTorch 2,8x tiempo real; ONNX precisión completa 3,5x; ONNX int8 3,8x.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo es lo bastante pequeño para ejecutarse en CPU. En GPU, los 82M de parámetros ocupan del orden de 0,3 GB en FP32 y unos 0,16 GB en FP16, aunque no se publican cifras oficiales de VRAM.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) puede ejecutarlo con holgura, pero el caso de uso principal es CPU.
- Cabe en GPU consumer: sí, con cualquier GPU con al menos unos pocos cientos de MB libres; también en CPU y en navegador.
- Opciones de despliegue: paquete `kokoro` de Python con PyTorch, ONNX Runtime (FP32, FP16, int8) y transformers.js en el navegador. Requiere `espeak-ng` instalado para la fonemización.
- Latencia y throughput: 2,8x tiempo real en PyTorch, 3,5x en ONNX FP32 y 3,8x en ONNX int8 sobre 4 hilos de un AMD EPYC 7763. El rendimiento depende del procesador y del número de hilos; en la misma máquina iguala a Kokoro-82M.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER (es) | UTMOS | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Canora Spanish | 82M | es | 1,85-2,90 % | 3,97-4,22 | Apache 2.0 | ONNX, PyTorch |
| Kokoro-82M (`ef_dora`, `em_alex`, `em_santa`) | 82M | multi (incl. es) | 2,70-2,80 % | 2,94-3,66 | Apache 2.0 | PyTorch, ONNX |
| Piper `es_MX-claude-high` | no disponible | es | 4,10 % | 3,60 | MIT (Piper) | ONNX |
| Piper `es_ES-sharvard-medium` | no disponible | es | 4,35 % | 2,93 | MIT (Piper) | ONNX |

Canora Spanish mejora la naturalidad (UTMOS) de todas las alternativas comparadas y la inteligibilidad de todas las voces Piper evaluadas, quedando en WER al nivel de las mejores voces españolas de Kokoro-82M. Frente a Piper, ofrece además una licencia Apache 2.0 explícita para el modelo y un único módulo de fonemización incluido.

## Limitaciones y advertencias

- Solo dispone de dos voces fijas (`lucia` y `mateo`); no se documenta clonación de voz ni control de estilo o emoción.
- Solo soporta español; no se ha validado para otros idiomas ni para cambios de código (code-switching).
- La evaluación se limita a 200 frases y a métricas automáticas (WER con Whisper y UTMOS); no se publican evaluaciones humanas de naturalidad ni pruebas en dominios específicos.
- Riesgo de errores de pronunciación en nombres propios, siglas, términos técnicos o extranjerismos no cubiertos por el módulo de fonemización basado en `espeak-ng`.
- La cuantización int8 reduce la naturalidad (UTMOS baja de 4,22 a 3,43 en `lucia` y de 3,97 a 3,20 en `mateo`), por lo que conviene evaluar el equilibrio calidad/rendimiento según el caso.
- Requiere instalar `espeak-ng` en el sistema, lo que añade una dependencia externa al despliegue.
- No se documentan sesgos concretos del corpus de entrenamiento; al ser un fine-tuning de Kokoro-82M, puede heredar sesgos del modelo base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y atribución correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/canora-spanish
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Web de EmpirioLabs: https://empiriolabs.ai
- Otros modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Plataforma: https://platform.empiriolabs.ai
- Discord: https://discord.gg/bM52azW4ZD
- Repositorio del paquete kokoro: no disponible en la información proporcionada
- Paper de StyleTTS 2: no disponible en la información proporcionada
- Paper de Kokoro: no disponible en la información proporcionada
