# Geneziz/whisper-large-v3-turbo-q4_1-ggml

## Resumen

`Geneziz/whisper-large-v3-turbo-q4_1-ggml` es una compilación cuantizada en formato GGML del modelo de reconocimiento automático del habla Whisper large-v3-turbo de OpenAI, preparada específicamente para su uso con la implementación en C/C++ `whisper.cpp`. El autor del artefacto, Geneziz, ha aplicado la herramienta oficial `whisper-quantize` sobre el binario `ggml-large-v3-turbo.bin` del repositorio de ggerganov para producir un fichero de 524.016.715 bytes (aproximadamente 0,5 GB) con cuantización `q4_1`. El modelo base es un transformer encoder-decoder de tipo seq2seq entrenado por OpenAI para transcripción y traducción de voz.

La relevancia de esta ficha radica en el objetivo del artefacto: reducir el peso del modelo grande de Whisper (originalmente en FP32/FP16, del orden de 1,5 GB en f16) a la mitad mediante cuantización de 4 bits con escala, de modo que pueda ejecutarse en CPU y en hardware modesto sin depender de GPU. Está orientado a transcripción en portugués e inglés, los dos idiomas declarados en la model card, y se distribuye bajo licencia MIT, igual que el modelo original.

No obstante, conviene señalar desde el principio que se trata de un artefacto comunitario con cero descargas y cero likes en el momento de redactar esta ficha, sin documentación de evaluación más allá de una única medición interna del autor (4,7 % de WER en 17 clips de narración en portugués). No hay información publicada sobre el proceso de conversión más allá de la línea de comandos indicada, ni sobre validación del binario frente al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de Whisper large-v3-turbo; binario GGML para whisper.cpp |
| Parámetros totales | no disponible en la información proporcionada (el modelo base Whisper large-v3-turbo tiene 809 M parámetros; el artefacto cuantizado no declara recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos por segmento; no se declara en la model card) |
| Tipos de cuantización | `q4_1` (4 bits con escala y mínimo por bloque); el autor menciona `q8_0` y `f16` como referencias del tooling |
| Idiomas soportados | portugués (`pt`) e inglés (`en`), según los metadatos del repositorio |
| Licencia | MIT |
| Formato de pesos | GGML binario (`ggml-large-v3-turbo-q4_1.bin`) |
| Tamaño del fichero | 524.016.715 bytes (~0,5 GB) |
| SHA-256 | `ad450460827207479eabd4e2561f28b90df61aed8fe0e3e40a296cf0d297fa55` |
| Modelo base | `openai/whisper-large-v3-turbo` |
| Herramienta de cuantización | `whisper-quantize` (whisper.cpp, ggml 0.27.0) |
| Librería | whisper.cpp |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3-turbo, un transformer encoder-decoder de tipo seq2seq diseñado para reconocimiento automático del habla. La variante "turbo" de large-v3 reduce el número de capas del decoder respecto a large-v3 completo (de 32 a 4 capas de decoder), lo que rebaja sustancialmente el coste de inferencia manteniendo el encoder grande. El modelo consume espectrogramas Mel de audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva, con tokens especiales para detección de idioma, marcas de tiempo y traducción.

Sobre el proceso de entrenamiento del modelo base no se aporta información en la model card de este artefacto: no se declaran número de tokens, composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (Whisper se entrena con supervisión sobre pares audio-transcripción multilingües, pero este dato no figura en la documentación disponible). Lo que sí documenta el autor es el proceso de conversión: se parte de `ggml-large-v3-turbo.bin` del repositorio `ggerganov/whisper.cpp` (sha256 `1fc70f774d38eb169993ac391eea357ef47c88757ef72ee5943879b7e8e2bc69`) y se aplica `whisper-quantize <f16 model> <out> q4_1` con las herramientas de whisper.cpp sobre ggml 0.27.0. No se documentan innovaciones técnicas adicionales propias de este artefacto más allá de la cuantización.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en portugués e inglés, según los idiomas declarados.
- Generación de marcas de tiempo a nivel de segmento, capacidad heredada del modelo base Whisper.
- Detección automática de idioma entre los idiomas soportados por el modelo base (la model card solo declara `pt` y `en` para este artefacto).
- Traducción de voz a texto en inglés, funcionalidad nativa de Whisper (no verificada específicamente para este binario cuantizado).
- Ejecución en CPU mediante whisper.cpp, sin requerir GPU ni frameworks de Python.
- Integración mediante la CLI `whisper-cli` y mediante la API C/C++ de whisper.cpp.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción estándar.
- No se declara modo "thinking" ni capacidades multimodales adicionales.

## Casos de uso

- Transcripción de narraciones y locuciones en portugués: el autor reporta un 4,7 % de WER en 17 clips de narración portuguesa, lo que lo hace adecuado para diarios hablados, audiolibros o podcasts donde el audio es limpio y el habla es clara. La cuantización q4_1 reduce el peso a ~0,5 GB, permitiendo procesar horas de audio en CPU.
- Subtitulado automático de vídeo en inglés y portugués: la generación de marcas de tiempo de Whisper permite producir ficheros SRT/VTT directamente desde `whisper-cli`, integrándose en pipelines de postproducción sin dependencia de GPU.
- Despliegue en dispositivos de borde o servidores sin GPU: al ser un binario GGML de ~0,5 GB ejecutable con whisper.cpp, puede correr en Raspberry Pi, mini-PC o contenedores ligeros donde no hay CUDA disponible.
- Transcripción de reuniones y notas de voz en entornos de oficina: con audio de un solo hablante o pocos hablantes y micrófono cercano, el modelo base turbo ofrece latencia baja; la versión cuantizada mantiene la viabilidad en CPU para volúmenes moderados.
- Preprocesado de corpus de audio para investigación en PLN: transcripción masiva de grabaciones en portugués e inglés para construir datasets de texto alineado con audio, ejecutable en clústeres de CPU sin aceleradores.
- Prototipado rápido y pruebas de concepto: al ser un único fichero binario con CLI directa (`whisper-cli -m ggml-large-v3-turbo-q4_1.bin -l pt -f audio.wav`), permite validar flujos de ASR en minutos sin instalar PyTorch ni dependencias de Hugging Face.
- Traducción de voz a texto en inglés para contenido en portugués: la capacidad de traducción de Whisper puede emplearse para generar subtítulos en inglés a partir de audio portugués, aunque no se ha validado específicamente en este binario cuantizado.

## Benchmarks y rendimiento

El autor declara una única medición interna: 4,7 % de word error rate en 17 clips de narración en portugués, frente a 42,1 % de WER para whisper base q8_0 en la misma prueba. No se especifican las condiciones exactas (duración total del audio, calidad de grabación, método de normalización del texto, herramienta de cálculo del WER), por lo que el dato debe tomarse con cautela.

| Benchmark | Este modelo (q4_1) | Whisper base q8_0 | Notas |
|---|---|---|---|
| WER en 17 clips de narración en portugués | 4,7 % | 42,1 % | Medición interna del autor; condiciones no detalladas |

No se han publicado resultados de benchmarks estándar (MLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con Whisper large-v3-turbo en f16 sobre los mismos clips. Tampoco se aportan métricas de latencia, throughput ni uso de memoria medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; el fichero pesa ~0,5 GB y whisper.cpp carga los pesos en memoria RAM. Para ejecución en GPU con whisper.cpp se requeriría al menos ~0,5-1 GB de VRAM, aunque no se documenta soporte GPU específico para este binario.
- GPU recomendadas: no disponibles en la información proporcionada. El artefacto está orientado a whisper.cpp, que prioriza CPU; cualquier GPU compatible con ggml (CUDA, Metal, Vulkan) podría utilizarse si se compila whisper.cpp con el backend correspondiente, pero no se documenta.
- ¿Cabe en GPU de consumo? Sí, por tamaño (~0,5 GB), en cualquier GPU con al menos 1 GB de VRAM si se compila con backend GPU; en CPU cabe en sistemas con 1-2 GB de RAM libre.
- Opciones de despliegue: `whisper-cli` de whisper.cpp (documentado por el autor); la librería whisper.cpp permite integración en aplicaciones C/C++; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que estos están orientados a modelos de lenguaje y no a Whisper.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de velocidad de transcripción (factor de tiempo real) ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Geneziz/whisper-large-v3-turbo-q4_1-ggml` (este) | no declarado (base: 809 M) | ventanas de 30 s (Whisper) | pt, en | MIT | GGML q4_1 | Hugging Face, 0 descargas |
| `openai/whisper-large-v3-turbo` (base) | 809 M | ventanas de 30 s | multilingüe (large-v3) | MIT | safetensors / PyTorch | Hugging Face, ampliamente usado |
| `ggerganov/whisper.cpp` `ggml-large-v3-turbo.bin` (f16) | 809 M | ventanas de 30 s | multilingüe | MIT | GGML f16 | Repositorio whisper.cpp |
| Whisper base q8_0 (referencia del autor) | 74 M | ventanas de 30 s | multilingüe | MIT | GGML q8_0 | whisper.cpp |

No se dispone de datos de rendimiento comparables entre estas variantes más allá del WER interno del autor (4,7 % frente a 42,1 % de whisper base q8_0 en 17 clips en portugués). No se han publicado comparaciones con otros modelos ASR (por ejemplo, Wav2Vec 2.0, Conformer o NVIDIA NeMo) en la información disponible.

## Limitaciones y advertencias

- Artefacto comunitario sin validación externa: cero descargas y cero likes en el momento de la ficha; no hay revisión por pares ni pruebas independientes del binario.
- La única métrica de calidad (4,7 % WER) procede de 17 clips de narración en portugués, un dominio estrecho y con condiciones no documentadas; no es extrapolable a audio con ruido, acentos, habla espontánea o múltiples hablantes.
- Idiomas declarados limitados a portugués e inglés; aunque el modelo base es multilingüe, este artefacto no declara otros idiomas y no se ha verificado su comportamiento en ellos.
- La cuantización q4_1 introduce pérdida de precisión respecto al f16; no se documenta la degradación respecto al modelo original en tareas distintas a la narración en portugués.
- Riesgo de alucinación inherente a Whisper: en segmentos con silencio, ruido o audio musical, el modelo puede generar texto inventado o repetir frases; este comportamiento no se mitiga en la cuantización.
- Sesgos heredados del modelo base de OpenAI: sesgos de género, acento, dialecto y dominio, no evaluados en este artefacto.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías; al ser un derivado de Whisper, se aplican también las condiciones del modelo original (MIT).
- Sin soporte documentado de GPU, tool calling, agentes ni integración con frameworks de servido de modelos de lenguaje; el uso previsto es la CLI de whisper.cpp y la API C/C++.
- El repositorio tiene un tamaño de 0,5 GB y un único fichero; no se incluyen tokenizador, configuración ni scripts de evaluación más allá del comando de uso.
- Fecha de creación del repositorio: 2026-11-05; no hay historial de mantenimiento ni issues que permitan evaluar su estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Geneziz/whisper-large-v3-turbo-q4_1-ggml
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Repositorio de binarios GGML de whisper.cpp (origen del f16): https://huggingface.co/ggerganov/whisper.cpp
- Herramienta de cuantización: `whisper-quantize` incluida en whisper.cpp (sin URL específica en la información proporcionada)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
