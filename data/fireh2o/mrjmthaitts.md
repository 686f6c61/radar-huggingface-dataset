# FireH2O/MrJMThaiTTS

## Resumen

MrJMThaiTTS es un modelo de síntesis de voz (text-to-speech) en tailandés publicado por FireH2O en Hugging Face. Se trata de un fine-tune tailandés de Kokoro-82M, un modelo TTS compacto de 82 millones de parámetros desarrollado originalmente por hexgrad, distribuido en formato ONNX y diseñado para ejecutarse en CPU mediante onnxruntime sin necesidad de tarjeta gráfica.

El modelo no ha sido reentrenado por el autor: los pesos provienen del release v0.3.0 de FastThaiG2P (awslabs), y lo que aporta el proyecto MrJMThaiTTS es un front-end de texto distinto y una lógica de corte de audio diferente. El repositorio contiene únicamente los ficheros de pesos, configuración y voz integrada; el código fuente del proyecto es privado y con todos los derechos reservados.

Su relevancia radica en su huella mínima: 163 MB de fichero de modelo y 1,3 GB de RAM en pico, con un RTF de 0,27 en CPU de seis hilos. Según las pruebas del autor, supera en precisión de lectura a Meta MMS-TTS Thai (5,5 % frente a 12,2 % de error de lectura con tope) y se acerca a ThonburianTTS, que requiere GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (fine-tune tailandés de FastThaiG2P v0.3.0), exportado a ONNX |
| Parámetros totales | 82 M (según modelo base Kokoro-82M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | float32 (fichero original, 326 MB) y float16 con nodos Cast plegables (163 MB, mismo grafo float32 en runtime) |
| Idiomas soportados | tailandés (th) |
| Licencia | Apache-2.0 (pesos); código del proyecto propietario, todos los derechos reservados |
| Formato de pesos | ONNX (`kokoro_thai.onnx`, `kokoro_thai.fp16w.onnx`), voz en `.npy`, configuración en `config.json` |
| Tamaño del repositorio | 0,5 GB |
| Pipeline | text-to-speech |
| Voz integrada | una única voz fija (`thai_som.npy`), sin clonación |

## Arquitectura y entrenamiento

El modelo es un fine-tune tailandés de Kokoro-82M, un TTS de 82 millones de parámetros. Los pesos se distribuyen como grafos ONNX exportados desde el release v0.3.0 de FastThaiG2P (awslabs), que a su vez parte de hexgrad/Kokoro-82M. El autor de MrJMThaiTTS no ha reentrenado los pesos: su aportación se limita al front-end de texto y a la estrategia de segmentación del audio. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo etapas de RLHF o DPO, ya que la model card no los detalla.

La innovación técnica destacable es la compresión del grafo: `kokoro_thai.fp16w.onnx` almacena los pesos en float16 con nodos Cast que onnxruntime pliega al cargar, de modo que el modelo se ejecuta como el mismo grafo float32 a la misma velocidad pero ocupando la mitad en disco (163 MB frente a 326 MB). La inferencia se realiza con onnxruntime sobre CPU, sin dependencia de CUDA. La voz integrada se almacena como un vector de estilo de 256 números por longitud de entrada en `thai_som.npy`.

## Capacidades

- Síntesis de voz en tailandés a partir de texto, con una única voz integrada (femenina/masculina no especificada, identificada como `thai_som`).
- Ejecución en CPU pura mediante onnxruntime, sin GPU, con un pico de 1,3 GB de RAM.
- Generación de audio en tiempo real: RTF de 0,27 con 6 hilos y 0,53 con 2 hilos en un Ryzen 5 3600.
- Precisión de lectura medida de 5,5 % de error de caracteres (con tope) sobre 1.000 clips de Common Voice Thai, evaluada con `typhoon-ai/typhoon-whisper-large-v3`.
- No soporta clonación de voz; para ello el autor remite a `FireH2O/MrJMThaiTTS_CT`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Soporte multilingüe limitado al tailandés.

## Casos de uso

- Lectura de artículos y documentos en tailandés: el modelo convierte texto plano en audio con una precisión de lectura del 5,5 % de CER, adecuada para aplicaciones de accesibilidad y lectura por voz en dispositivos sin GPU.
- Asistentes de voz embebidos en dispositivos de bajo consumo: con 163 MB de modelo y 1,3 GB de RAM en pico, cabe en mini-PC, Raspberry Pi de gama alta o portátiles modestos, sin tarjeta gráfica.
- Generación de audiolibros y pódcast en tailandés por lotes: el RTF de 0,27 en CPU permite procesar aproximadamente 3,7 segundos de audio por segundo de cómputo en un solo hilo efectivo, escalable en paralelo por procesos.
- Sistemas de anuncios y megafonía automatizada: la voz fija y determinista facilita la consistencia en avisos repetidos (estaciones, aeropuertos, comercios) sin necesidad de infraestructura GPU.
- Pruebas de integración continua de pipelines TTS: al ser un modelo ONNX pequeño y con SHA-256 publicado, se puede usar como referencia reproducible en tests de regresión de audio.
- Prototipado de aplicaciones de voz para el mercado tailandés: permite validar producto y experiencia de usuario con un coste de infraestructura mínimo antes de migrar a modelos mayores con clonación (como MrJMThaiTTS_CT) o a modelos GPU con menor error de lectura.
- Investigación en evaluación TTS: el examen de Common Voice Thai documentado (1.000 clips, DNSMOS Pro > 3,9, transcripción con Typhoon Whisper) sirve como base metodológica replicable.

## Benchmarks y rendimiento

Resultados del examen de Common Voice Thai Scripted Speech 27.0 (1.000 clips de 1 a 15 s, DNSMOS Pro > 3,9), con error de lectura medido como CER de `typhoon-ai/typhoon-whisper-large-v3` sobre la salida:

| Modelo | Error de lectura (media) | Error de lectura (con tope) | Clips sin error | RTF | Hardware |
|---|---|---|---|---|---|
| Grabaciones humanas | 2,8 % | 2,7 % | 746 | — | — |
| MrJMThaiTTS_CT | 4,9 % | 4,9 % | 686 | 0,45 | CPU |
| **MrJMThaiTTS (este modelo)** | 12,1 % | **5,5 %** | 635 | 0,28 | CPU, 6 hilos |
| ThonburianTTS (32 pasos) | 6,1 % | 6,0 % | 650 | 0,27 | RTX 4060 Ti |
| Meta MMS-TTS Thai | 12,5 % | 12,2 % | 337 | 0,19 | CPU |

Notas del autor: el valor "con tope" limita cada clip a un máximo del 100 % de error; dos clips de MrJMThaiTTS por debajo de 1,2 s generaron transcripciones mucho más largas que el texto, lo que añade 6,6 puntos a la media sin tope. Una sola ejecución por modelo. No se probaron JaiTTS, Qwen3-TTS ni Kaitom Voice, que según sus autores reportan menor error con modelos GPU mayores.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU con onnxruntime.
- RAM: 1,3 GB en pico (medido en Ryzen 5 3600, frase de 4 segundos).
- GPU recomendadas: ninguna; el autor no reporta uso de GPU. ThonburianTTS, comparable en calidad, se ejecutó en una RTX 4060 Ti.
- ¿Cabe en GPU de consumo? Sí, pero no es necesario; el modelo está pensado para CPU.
- Almacenamiento: 163 MB para `kokoro_thai.fp16w.onnx` o 326 MB para `kokoro_thai.onnx`, más 0,5 MB de voz y 3 KB de configuración.
- Tiempo de carga: 3,3 s.
- Latencia y throughput: RTF 0,27 con 6 hilos y 0,53 con 2 hilos (menor es más rápido).
- Opciones de despliegue: onnxruntime (CPU) mediante el script `tts.py` del repositorio de código; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Instalación: `python setup_models.py` en un clon del repositorio de código descarga los ficheros en `models/fastthaig2p/` y verifica sus hashes.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Error de lectura (con tope) | RTF | Hardware | Licencia | Clonación de voz |
|---|---|---|---|---|---|---|---|
| MrJMThaiTTS | 82 M | th | 5,5 % | 0,28 | CPU | Apache-2.0 (pesos) | No |
| MrJMThaiTTS_CT | no disponible (fine-tune de Kyutai Pocket TTS) | th | 4,9 % | 0,45 | CPU | no disponible en la información | Sí |
| ThonburianTTS | no disponible | th | 6,0 % | 0,27 | RTX 4060 Ti | no disponible en la información | no disponible |
| Meta MMS-TTS Thai | no disponible | th | 12,2 % | 0,19 | CPU | no disponible en la información | No (voz fija) |

JaiTTS, Qwen3-TTS y Kaitom Voice no fueron evaluados por el autor; según sus respectivas documentaciones reportan menor error de lectura con modelos GPU de mayor tamaño, pero no hay datos comparables en la información disponible.

## Limitaciones y advertencias

- Una sola voz integrada y sin clonación; para voces personalizadas hay que usar el modelo hermano MrJMThaiTTS_CT.
- Solo tailandés; no soporta otros idiomas.
- El error de lectura medio sin tope es del 12,1 %, lastrado por dos clips muy cortos (menos de 1,2 s) que generaron transcripciones desproporcionadamente largas; conviene validar el comportamiento en entradas de duración muy corta.
- Los benchmarks provienen de una única ejecución por modelo y un único dibujo aleatorio de 1.000 clips, sin denoising; la variabilidad entre ejecuciones no está cuantificada.
- Solo se probó en un CPU (Ryzen 5 3600); el rendimiento en otras plataformas (ARM, Apple Silicon) no está documentado.
- Riesgo de alucinación y artefactos en la síntesis: el propio examen detecta clips con transcripciones inventadas o sobredimensionadas, típico de modelos TTS pequeños.
- Sesgos: no se documentan análisis de sesgo de género, edad o dialecto; la voz única limita la representación.
- Licencia: los pesos son Apache-2.0, pero el código fuente del proyecto es propietario y con todos los derechos reservados, lo que puede limitar su uso comercial si se depende del pipeline completo y no solo de los pesos.
- Los pesos no fueron reentrenados por el autor; la calidad depende del fine-tune original de FastThaiG2P y de Kokoro-82M.
- El repositorio tiene muy poca tracción (2 descargas, 0 likes en el momento de la consulta) y una única fuente de evaluación (el propio autor), por lo que conviene tratar los resultados con cautela hasta que haya validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FireH2O/MrJMThaiTTS
- Modelo hermano con clonación de voz: https://huggingface.co/FireH2O/MrJMThaiTTS_CT
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Release de pesos originales FastThaiG2P v0.3.0: https://github.com/awslabs/FastThaiG2P/releases/tag/v0.3.0
- Paper de referencia del examen (JaiTTS): https://arxiv.org/abs/2604.27607
- Repositorio de código (privado, según el autor): `FireH2O/MrJMThaiTTS` en GitHub
- Fichero de resultados del examen: `exam/cv_exam_summary.json` en el repositorio de MrJMThaiTTS_CT
