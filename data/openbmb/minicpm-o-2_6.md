# openbmb/MiniCPM-o-2_6

## Resumen
MiniCPM-o 2.6 es un modelo multimodal omni (visión, audio, voz y texto) desarrollado por OpenBMB, construido de forma end-to-end sobre SigLip-400M (encoder visual), Whisper-medium-300M (encoder de audio), ChatTTS-200M (decodificador de voz) y Qwen2.5-7B como backbone de lenguaje, sumando aproximadamente 8.000 millones de parámetros. Resuelve el problema de interacción multimodal en tiempo real —conversación por voz bidireccional, streaming de vídeo y audio continuo— en dispositivos de borde, algo que modelos propietarios como GPT-4o solo ofrecían vía API en la nube.

Su relevancia radica en tres ejes: rendimiento (supera a GPT-4o-202405, Gemini 1.5 Pro y Claude 3.5 Sonnet en comprensión de imagen única según OpenCompass, con 70,2 de media en 8 benchmarks), eficiencia (640 tokens para una imagen de 1,8 millones de píxeles, un 75 % menos que la mayoría de modelos) y apertura (licencia Apache 2.0, pesos safetensors, GGUF e int4, soporte en llama.cpp, Ollama y vLLM). Está pensado para despliegue local en iPad, GPU de consumo y entornos de producción con throughput alto.

La ficha cubre arquitectura, capacidades, casos de uso, requisitos de hardware y limitaciones, con datos extraídos de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni-modal end-to-end (transformer): SigLip-400M (visión) + Whisper-medium-300M (audio) + ChatTTS-200M (voz) + Qwen2.5-7B (LLM backbone); mecanismo de streaming en vivo con multiplexación por división de tiempo (TDM) |
| Parametros totales | 8.674.997.028 (~8,67 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no especifica tokens de contexto textual; se documenta el límite visual de 1,8 M píxeles por imagen) |
| Tipos de cuantizacion | int4 y GGUF (16 tamaños distintos); pesos originales en safetensors (bf16/fp16) |
| Idiomas soportados | Multilingüe (más de 30 idiomas); conversación por voz en tiempo real en inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF; int4 |

## Arquitectura y entrenamiento
El modelo es una arquitectura omni-modal end-to-end: encoders y decoders de cada modalidad (SigLip-400M para imagen, Whisper-medium-300M para audio, ChatTTS-200M para síntesis de voz) se conectan y entrenan conjuntamente con un backbone Qwen2.5-7B para explotar el conocimiento multimodal compartido. La innovación principal es el mecanismo de streaming en vivo: los encoders/decoders offline se convierten en online para entradas y salidas continuas, y se introduce un esquema de multiplexación por división de tiempo (TDM) que permite aceptar flujos continuos de vídeo y audio independientes de las consultas del usuario, con interacción de voz en tiempo real.

El alineamiento se apoya en las técnicas RLAIF-V (aceptada en CVPR 2025, con código, dataset y paper abiertos) y VisCPM, orientadas a comportamientos fiables y reducción de alucinaciones. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset, más allá del uso de openbmb/RLAIF-V-Dataset. El modelo incorpora además clonación de voz end-to-end, control de emoción/velocidad/estilo y juego de rol.

## Capacidades
- Comprensión de imagen única, multi-imagen y vídeo, con capacidad de in-context learning visual.
- OCR de alto rendimiento: estado del arte en OCRBench para modelos por debajo de 25B, superando a GPT-4o-202405.
- Procesamiento de imágenes con cualquier relación de aspecto y hasta 1,8 millones de píxeles (por ejemplo, 1344x1344).
- Conversación por voz en tiempo real bilingüe (inglés y chino) con voces configurables.
- ASR y traducción speech-to-text (STT), con rendimiento superior a GPT-4o-realtime en comprensión de audio.
- Evaluaciones semánticas y acústicas de conversación por voz de estado del arte en la comunidad open source.
- Control de emoción, velocidad y estilo de voz; clonación de voz end-to-end; role play.
- Streaming multimodal en vivo: acepta flujos continuos de vídeo y audio independientes de las consultas del usuario.
- Comprensión omni-fuente (vídeo y audio simultáneos) y comprensión de contexto multimodal.
- Comportamientos fiables (trustworthy) gracias a RLAIF-V; supera a GPT-4o y Claude 3.5 Sonnet en MMHal-Bench.
- Capacidades multilingües en más de 30 idiomas.
- No se menciona explícitamente soporte de tool calling / function calling ni de agentes multi-paso en la información disponible.

## Casos de uso
- Asistencia en vivo por voz en dispositivos de borde: el modelo acepta streaming continuo de audio y responde en tiempo real con voces configurables, lo que permite integrarlo en tablets (iPad) o móviles como asistente conversacional sin depender de la nube.
- Transcripción y traducción de reuniones: ASR y STT con rendimiento superior a GPT-4o-realtime permiten transcribir audio en inglés y chino y traducirlo en la misma sesión, con contexto multimodal si se acompaña de vídeo.
- Digitalización de documentos y facturas: OCR de estado del arte para modelos <25B, con soporte de imágenes de hasta 1,8 M píxeles y cualquier relación de aspecto, lo hace adecuado para pipelines de extracción de texto en recibos, formularios y capturas de pantalla.
- Atención al cliente multimodal: conversación multi-turno con voz y clonación de voz end-to-end permite desplegar agentes con voz corporativa personalizada y control de emoción/estilo.
- Accesibilidad: descripción de escenas en tiempo real a partir de streaming de vídeo continuo, útil para personas con discapacidad visual, con latencia baja gracias a la densidad de tokens (640 tokens por imagen de 1,8 M píxeles).
- Moderación de contenido audiovisual: comprensión omni-fuente (vídeo + audio) en streaming permite analizar transmisiones en vivo y detectar contenido relevante en contexto.
- Investigación en interacción omni-modal: al ser Apache 2.0 y con soporte de fine-tuning vía LLaMA-Factory, sirve como base para experimentos de streaming multimodal y alineamiento RLAIF-V.
- Despliegue en CPU: la versión GGUF en llama.cpp permite inferencia local eficiente en equipos sin GPU, útil para prototipos y entornos air-gapped.

## Benchmarks y rendimiento
Datos publicados en la model card (no se dispone de la tabla numérica completa por benchmark en la información proporcionada; se recogen solo las afirmaciones explícitas):

| Benchmark / evaluacion | Resultado | Comparacion |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 70,2 | Supera a GPT-4o-202405, Gemini 1.5 Pro y Claude 3.5 Sonnet en imagen única |
| Comprensión multi-imagen y vídeo | No disponible (cifras) | Supera a GPT-4V y Claude 3.5 Sonnet |
| OCRBench | No disponible (cifra) | Estado del arte para modelos <25B; supera a GPT-4o-202405 |
| MMHal-Bench | No disponible (cifra) | Supera a GPT-4o y Claude 3.5 Sonnet |
| StreamingBench | No disponible (cifra) | Supera a GPT-4o-202408 y Claude 3.5 Sonnet; estado del arte open source |
| ASR / STT translation | No disponible (cifra) | Supera a GPT-4o-realtime |
| Densidad de tokens visuales | 640 tokens por imagen de 1,8 M px | 75 % menos tokens que la mayoría de modelos |

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; con ~8,67 B parámetros, la inferencia en bf16/fp16 requiere del orden de 17-18 GB de VRAM (pesos) más overhead de encoders y KV cache; la versión int4 reduce esta cifra aproximadamente a un cuarto.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, A100/H100 para throughput alto con vLLM, y RTX 4090 (24 GB) para bf16 en single-GPU.
- GPU de consumo: cabe en GPU de consumo con cuantización int4 o GGUF; el modelo está optimizado para dispositivos de borde como iPad y para inferencia en CPU vía llama.cpp.
- Opciones de despliegue: transformers, llama.cpp (rama minicpm-omni), Ollama (repositorio oficial openbmb, one-click), vLLM (alto throughput y bajo consumo de memoria), Gradio para WebUI local, LLaMA-Factory para fine-tuning.
- Latencia y throughput: no disponibles como cifras; la model card destaca mejora de velocidad de inferencia, latencia del primer token, uso de memoria y consumo energético derivados de la densidad de tokens (640 tokens por imagen de 1,8 M px).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-o 2.6 | ~8,67 B | No disponible (visual: 1,8 M px) | OpenCompass 70,2; OCRBench SOTA <25B; StreamingBench SOTA open source | Apache 2.0 | Hugging Face, Ollama, llama.cpp, vLLM |
| GPT-4o-202405 | No disponible (propietario) | No disponible | Referencia propietaria; superado por MiniCPM-o en imagen única y OCRBench | Propietaria | Solo API |
| Gemini 1.5 Pro | No disponible (propietario) | No disponible | Referencia propietaria; superado por MiniCPM-o en imagen única | Propietaria | Solo API |
| Claude 3.5 Sonnet | No disponible (propietario) | No disponible | Referencia propietaria; superado por MiniCPM-o en imagen única, multi-imagen, vídeo y MMHal-Bench | Propietaria | Solo API |

No se dispone en la información proporcionada de comparativas numéricas con modelos open source de tamaño similar (por ejemplo, Qwen2.5-VL-7B o Llama 3.2 Vision), por lo que esas cifras se indican como no disponibles.

## Limitaciones y advertencias
- Riesgo de alucinación: aunque RLAIF-V y VisCPM mitigan el problema y el modelo supera a GPT-4o y Claude 3.5 Sonnet en MMHal-Bench, sigue siendo un modelo generativo y puede producir contenido incorrecto, especialmente en OCR de imágenes de baja calidad o en audio con ruido.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos web y multilingües, es esperable heredar sesgos de esos corpus.
- Idiomas: el soporte multilingüe cubre más de 30 idiomas, pero la conversación por voz en tiempo real solo está disponible en inglés y chino; otras lenguas quedan limitadas a texto/visión.
- Contexto: no se especifica la longitud de contexto textual; para streaming continuo, la ventana efectiva depende del mecanismo TDM y no de un límite documentado de tokens.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes (Qwen2.5-7B, Whisper, ChatTTS, SigLip) y de los datasets de alineamiento antes de redistribuir.
- Producción: la rama de llama.cpp para MiniCPM-o es específica (minicpm-omni) y puede no estar integrada en todas las distribuciones; verificar compatibilidad de vLLM y Ollama con la versión concreta antes de desplegar.
- Dispositivos de borde: el rendimiento en iPad u otros dispositivos depende de cuantización y del soporte de streaming; no hay cifras públicas de latencia por dispositivo.

## Enlaces
- Hugging Face: https://huggingface.co/openbmb/MiniCPM-o-2_6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- Demo online: https://minicpm-omni-webdemo-us.modelbest.cn
- Blog técnico: https://openbmb.notion.site/MiniCPM-o-2-6-A-GPT-4o-Level-MLLM-for-Vision-Speech-and-Multimodal-Live-Streaming-on-Your-Phone-185ede1b7a558042b5d5e45e6b237da9
- Repositorio Ollama: https://ollama.com/openbmb
- Modelo en Ollama: https://ollama.com/openbmb/minicpm-o2.6
- Versión int4: https://huggingface.co/openbmb/MiniCPM-o-2_6-int4
- Versión GGUF: https://huggingface.co/openbmb/MiniCPM-o-2_6-gguf
- llama.cpp (rama minicpm-omni): https://github.com/OpenBMB/llama.cpp/blob/minicpm-omni/examples/llava/README-minicpmo2.6.md
- RLAIF-V (código): https://github.com/RLHF-V/RLAIF-V
- RLAIF-V (dataset): https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset
- RLAIF-V (paper): https://arxiv.org/abs/2405.17220
- VisCPM: https://github.com/OpenBMB/VisCPM
- Paper adicional citado en tags: https://arxiv.org/abs/2408.01800
- Fine-tuning con LLaMA-Factory: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/llamafactory_train.md
