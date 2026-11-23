# empiriolabsai/canora-russian

## Resumen

Canora Russian es un modelo de síntesis de voz (text-to-speech) especializado en ruso, desarrollado por EmpirioLabs. Se trata de un fine-tune del conocido Kokoro-82M de hexgrad, por lo que hereda su arquitectura compacta de 82 millones de parámetros y su velocidad de inferencia. El modelo incorpora una única voz femenina llamada `vera` y está pensado para generar habla inteligible y natural en ruso, incluyendo la lectura correcta de números, fechas, horas y precios tal y como los pronuncia un hablante nativo.

Su relevancia radica en que ofrece una alternativa de código abierto bajo licencia Apache 2.0 (uso comercial permitido) con un rendimiento que, según las mediciones del autor, supera en naturalidad a todas las voces de Piper probadas y se sitúa a la par en inteligibilidad con otras alternativas de Kokoro para ruso. Al estar basado en Kokoro, se integra en el ecosistema estándar de la librería `kokoro` y ofrece pesos ONNX en precisión completa, media e int8, lo que facilita su despliegue tanto en Python como en el navegador mediante transformers.js.

El modelo se distribuye con un módulo de conversión texto-a-fonema específico para ruso que emplea RUAccent para la colocación de acentos y la letra ё. Con un tamaño de repositorio de 0,9 GB y un fichero ONNX int8 de 115 MB, está claramente orientado a despliegues ligeros y de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS basado en StyleTTS 2, tag `style_text_to_speech_2`) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS; se recomienda mantener llamadas de hasta ~500 fonemas) |
| Tipos de cuantizacion | ONNX en precisión completa, media precisión (half) e int8; pesos PyTorch (`.pth`) |
| Idiomas soportados | ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX (fp32, fp16, int8), voz en `.pt` |
| Frecuencia de muestreo | 24 kHz (según el ejemplo de `soundfile.write`) |
| Voces | una, `vera` (femenina) |

## Arquitectura y entrenamiento

Canora Russian es un fine-tune de `hexgrad/Kokoro-82M`, un modelo de síntesis de voz de 82 millones de parámetros etiquetado con la familia `style_text_to_speech_2`, lo que lo vincula a la arquitectura StyleTTS 2. Al ser un ajuste fino sobre Kokoro, conserva la arquitectura y el tamaño del modelo base, y el autor indica explícitamente que su velocidad coincide con la de Kokoro-82M en la misma máquina. El modelo opera sobre fonemas, no sobre texto directo: el repositorio incluye un módulo `g2p_ru.py` que convierte texto ruso a fonemas y coloca el acento y la ё mediante RUAccent (licencia MIT), que descarga sus propios modelos (~690 MB) en el primer uso.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor sí documenta la evaluación: 200 frases rusas no vistas por el modelo, transcritas con `openai/whisper-large-v3` y comparadas con el texto original para calcular la tasa de error de palabras (WER), junto con una estimación automática de naturalidad (UTMOS). No se especifican innovaciones técnicas adicionales más allá de las propias del modelo base.

## Capacidades

- Síntesis de voz en ruso con una única voz femenina (`vera`).
- Lectura correcta de números, fechas, horas y precios al estilo de un hablante ruso nativo.
- Colocación automática de acentos y de la letra ё mediante RUAccent.
- Control de velocidad de habla mediante el tercer argumento de `model(...)` (1.0 = velocidad normal).
- Inferencia en PyTorch con la librería estándar `kokoro`.
- Inferencia con ONNX Runtime en precisión completa, media e int8.
- Compatibilidad con transformers.js para despliegue en JavaScript/entorno web.
- Identificación fiable como ruso por parte de Whisper (probabilidad media de 0,99).

## Casos de uso

- **Lectura de anuncios y avisos con cifras:** el modelo pronuncia números, horas y precios como un hablante nativo, por lo que es adecuado para sistemas de megafonía o avisos de transporte que incluyen horarios y andenes (por ejemplo, "el tren a San Petersburgo sale a las 14:35 del andén quinto").
- **Atención al cliente por voz en ruso:** al ser un TTS ligero (82 M de parámetros) y rápido (hasta 4,6x tiempo real en ONNX int8), puede integrarse en flujos de IVR o asistentes telefónicos que necesitan generar respuestas habladas con baja latencia.
- **Narración de contenidos y audiolibros cortos:** la naturalidad medida (UTMOS 4,12) y la inteligibilidad (WER 3,05 %) lo hacen apto para convertir artículos, noticias o textos divulgativos en audio, dividiendo el texto en frases para respetar el límite de ~500 fonemas por llamada.
- **Accesibilidad y lectura de pantalla:** puede emplearse como motor de lectura en voz alta para aplicaciones dirigidas a usuarios rusoparlantes con discapacidad visual, gracias a su licencia Apache 2.0 y a su reducido tamaño.
- **Despliegue en el navegador:** los pesos ONNX y la compatibilidad con transformers.js permiten ejecutar la síntesis en el cliente sin servidor, útil para aplicaciones web que deben funcionar sin enviar texto a un backend.
- **Generación de audio para prototipos y pruebas:** al ser un modelo pequeño y de licencia permisiva, resulta adecuado para generar voces de prueba en pipelines de desarrollo de asistentes, videojuegos o sistemas de navegación antes de invertir en un TTS comercial.
- **Sistemas embebidos y de bajo consumo:** el fichero ONNX int8 de 115 MB cabe en dispositivos con recursos limitados, lo que permite síntesis de voz local en equipos sin GPU dedicada.

## Benchmarks y rendimiento

Evaluación del autor sobre 200 frases rusas no vistas, con transcripción mediante `openai/whisper-large-v3` (WER, menor es mejor) y naturalidad estimada con UTMOS (escala 1-5, mayor es mejor):

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora Russian `vera` | 3,05 % | **4,12** |
| `zaakirio/kokoro-ru` `dima` | **2,84 %** | 3,75 |
| `zaakirio/kokoro-ru` `sveta` | 2,90 % | 3,81 |
| Piper `ru_RU-irina-medium` | 3,93 % | 3,70 |
| Piper `ru_RU-dmitri-medium` | 6,10 % | 2,89 |
| Piper `ru_RU-ruslan-medium` | 6,57 % | 3,01 |
| Piper `ru_RU-denis-medium` | 7,60 % | 3,09 |

El fichero ONNX int8 obtiene, según el autor, un WER de 3,41 % y un UTMOS de 3,12 sobre las mismas frases. La identificación de idioma con Whisper da una probabilidad media de ruso de 0,99 para `vera` (frente a 0,99-1,00 de las demás voces).

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 7713 (segundos de audio por segundo de cómputo): PyTorch 3,6x tiempo real, ONNX precisión completa 3,9x y ONNX int8 4,6x.

## Requisitos de hardware

- **VRAM estimada:** al tratarse de un modelo de 82 M de parámetros, la inferencia en PyTorch requiere muy poca memoria; el fichero ONNX int8 ocupa 115 MB. No se han publicado cifras exactas de VRAM en la información disponible.
- **GPU recomendadas:** cualquier GPU moderna es suficiente; no se especifican modelos concretos. El autor midió la velocidad en CPU (AMD EPYC 7713), lo que indica que la GPU no es imprescindible.
- **GPU de consumo:** sí cabe en GPU de consumo; por tamaño, cualquier tarjeta con unos pocos GB de memoria es más que suficiente (cifra exacta no disponible).
- **Opciones de despliegue:** librería `kokoro` (PyTorch), ONNX Runtime (fp32, fp16, int8) y transformers.js. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- **Latencia y throughput:** 3,6x tiempo real en PyTorch, 3,9x en ONNX fp32 y 4,6x en ONNX int8 sobre 4 hilos de CPU; el rendimiento depende del procesador y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER | UTMOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Canora Russian `vera` | 82 M | Ruso | 3,05 % | 4,12 | Apache 2.0 | Hugging Face |
| `zaakirio/kokoro-ru` `dima` | 82 M (Kokoro) | Ruso | 2,84 % | 3,75 | no disponible en la información | Hugging Face |
| `zaakirio/kokoro-ru` `sveta` | 82 M (Kokoro) | Ruso | 2,90 % | 3,81 | no disponible en la información | Hugging Face |
| Piper `ru_RU-irina-medium` | no disponible | Ruso | 3,93 % | 3,70 | no disponible en la información | Piper |

Canora Russian destaca por la mayor naturalidad (UTMOS 4,12) frente a todas las alternativas comparadas, aunque su WER es ligeramente superior al de las voces de `zaakirio/kokoro-ru`. Frente a Piper, mejora tanto en inteligibilidad como en naturalidad en todas las voces probadas. La ventaja diferencial es la licencia Apache 2.0 explícita para uso comercial.

## Limitaciones y advertencias

- **Una sola voz:** únicamente incluye la voz femenina `vera`; no hay variedad de hablantes ni control de estilo o emoción más allá de la velocidad.
- **Solo ruso:** no soporta otros idiomas; el módulo G2P está especializado en ruso.
- **Dependencia de RUAccent:** el pipeline requiere descargar los modelos de RUAccent (~690 MB) en el primer uso, lo que añade peso y una dependencia externa al despliegue.
- **Límite de longitud:** se recomienda mantener cada llamada en torno a 500 fonemas y dividir textos largos en frases, lo que complica la prosodia en fragmentos extensos.
- **Riesgo de alucinación y errores de pronunciación:** no se documentan tasas de error específicas para palabras poco frecuentes, nombres propios o siglas; el WER del 3,05 % implica que persisten errores de inteligibilidad.
- **Sesgos:** no se dispone de información sobre sesgos de género, acento o registro en la voz generada.
- **Licencia:** Apache 2.0 permite uso comercial, pero conviene verificar las licencias de las dependencias (RUAccent es MIT; Kokoro-82M es Apache 2.0).
- **Datos de evaluación del propio autor:** las métricas proceden de EmpirioLabs y no de una evaluación independiente; deben interpretarse con cautela.
- **Madurez:** el repositorio no registra descargas ni "likes" en el momento de la consulta, por lo que su adopción y soporte comunitario son aún incipientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/canora-russian
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo comparable `zaakirio/kokoro-ru`: https://huggingface.co/zaakirio/kokoro-ru
- Web de EmpirioLabs: https://empiriolabs.ai
- Otros modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Plataforma: https://platform.empiriolabs.ai
- Discord: https://discord.gg/bM52azW4ZD
- RUAccent (repositorio): https://github.com/Den4ikAI/ruaccent
