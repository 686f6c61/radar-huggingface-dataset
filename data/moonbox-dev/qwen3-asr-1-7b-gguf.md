# moonbox-dev/Qwen3-ASR-1.7B-GGUF

## Resumen

Qwen3-ASR-1.7B-GGUF es la conversión a formato GGUF del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba y empaquetado por Moonbox para su uso en dispositivos locales mediante llama.cpp. El modelo resuelve la transcripción de audio a texto con identificación automática de idioma, cubriendo 30 idiomas y 22 dialectos chinos, con especial énfasis en inglés con acentos de múltiples regiones y chino mandarín.

La versión original emplea una arquitectura multimodal que combina un codificador de audio con un decodificador de texto derivado de Qwen3-Omni, con 2.031.739.904 parámetros totales. Esta conversión GGUF separa el codificador de audio (en el fichero `mmproj`, fijado en F16) del decodificador de texto (fichero principal), permitiendo ejecución en Metal, CUDA, Vulkan y CPU.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un sistema ASR de calidad estado del arte en hardware de consumo, sin depender de APIs propietarias, con licencia Apache-2.0 y con un rendimiento medido (WER 1,45 % en inglés y CER 1,42 % en chino sobre el conjunto de evaluación de Moonbox) prácticamente idéntico al modelo original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal encoder-decoder: codificador de audio + decodificador de texto derivado de Qwen3-Omni |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (fichero principal y mmproj F16); el repositorio menciona otras precisiones generadas con `llama-quantize` (p. ej. Q8_0) pero solo BF16 aparece documentado en la tabla de ficheros |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos; identificación automática de idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero principal del decodificador + `mmproj-*.gguf` con el codificador de audio y su proyector) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema multimodal que acopla un codificador de audio con un decodificador de texto basado en Qwen3-Omni. La conversión GGUF respeta esta separación: el fichero principal contiene únicamente el decodificador de texto, mientras que el fichero `mmproj-qwen3-asr-1-7b-F16.gguf` (641,8 MB) aloja el codificador de audio y su proyector, en formato `qwen3a` de llama.cpp. Ambos ficheros son necesarios para la inferencia y el `mmproj` se mantiene en F16 para todas las precisiones.

La conversión se realizó con llama.cpp `b12621` a partir de la revisión `7278e1e70f` del modelo original: `convert_hf_to_gguf.py` generó el fichero BF16 y el `mmproj`, y `llama-quantize` produjo las demás precisiones con sus mezclas estándar, sin matriz de importancia. Antes de la subida se verificó que cada tensor del checkpoint original aparecía con los mismos valores en los ficheros GGUF. El modelo original se entrenó con datos de voz a gran escala aprovechando la capacidad de comprensión de audio de Qwen3-Omni; la información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Una innovación destacable de la familia es la alineación forzada mediante Qwen3-ForcedAligner-0.6B, que predice marcas de tiempo para unidades arbitrarias en hasta 5 minutos de audio en 11 idiomas, con precisión superior a los modelos de alineación forzada end-to-end. Asimismo, la familia soporta inferencia unificada en streaming y offline con un solo modelo, y transcripción de audio largo.

## Capacidades

- Reconocimiento automático de voz (ASR) con transcripción de audio a texto.
- Identificación automática de idioma entre 30 idiomas y 22 dialectos chinos.
- Reconocimiento robusto en entornos acústicos complejos y con patrones de texto difíciles.
- Soporte de inglés con acentos de múltiples países y regiones.
- Inferencia unificada en streaming y offline con un único modelo.
- Transcripción de audio largo.
- Predicción de marcas de tiempo mediante el modelo complementario Qwen3-ForcedAligner-0.6B (11 idiomas, hasta 5 minutos de audio).
- Control del idioma de salida mediante prompt (p. ej. `language English<asr_text>`).
- Integración con llama.cpp en Metal, CUDA, Vulkan y CPU.
- Compatibilidad con endpoints estilo OpenAI (`/v1/audio/transcriptions`).

## Casos de uso

- Transcripción local de reuniones y entrevistas: el modelo puede procesar audio largo y generar transcripciones en un portátil con GPU de consumo, gracias a la separación entre decodificador y codificador de audio en GGUF y a su bajo coste de inferencia (RTF 0,043 en CUDA).
- Subtitulado y generación de actas: combinado con Qwen3-ForcedAligner-0.6B, permite obtener marcas de tiempo por unidad para alinear subtítulos en 11 idiomas, útil en pipelines de postproducción de vídeo.
- Atención al cliente multilingüe: la identificación automática de idioma y el soporte de 30 idiomas permiten transcribir llamadas de soporte en distintos mercados sin configurar un idioma por adelantado.
- Dictado y accesibilidad: integración en aplicaciones de escritorio o móviles mediante llama.cpp para convertir voz en texto en tiempo real, con soporte de streaming y sin enviar audio a servicios externos.
- Análisis de llamadas y cumplimiento normativo: transcripción por lotes de grabaciones con vLLM o llama-server para auditoría, búsqueda y clasificación posterior, manteniendo los datos en infraestructura propia.
- Investigación en ASR y lingüística: evaluación de modelos y estudio de dialectos chinos y acentos del inglés, con la posibilidad de comparar precisiones GGUF frente al BF16 original.
- Prototipado de asistentes de voz: uso del endpoint `/v1/audio/transcriptions` compatible con OpenAI para sustituir APIs comerciales en entornos de desarrollo con hardware limitado.

## Benchmarks y rendimiento

| Modelo / fichero | Tarea | WER (EN) | CER (ZH) | RTF | Entorno |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B original (PyTorch fp32) | ASR | 1,45 % | 1,52 % | no disponible | no disponible |
| `qwen3-asr-1-7b-BF16.gguf` + `mmproj` F16 | ASR | 1,45 % | 1,42 % | 0,043 | CUDA, RTX 3080 Laptop, greedy |
| `mmproj-qwen3-asr-1-7b-F16.gguf` (BF16) | ASR | 1,45 % | 1,42 % | 0,043 | CUDA, RTX 3080 Laptop, greedy |

Conjunto de evaluación: 400 enunciados de LibriSpeech test-clean (40 hablantes) y 200 enunciados de AISHELL-1 test, con idioma indicado. El criterio de aceptación era no superar la tasa de error del original más 1 punto. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero BF16 del decodificador ocupa 4,07 GB y el `mmproj` F16 ocupa 641,8 MB; en total, en torno a 4,7 GB de pesos, más overhead de contexto y buffers de audio. Las precisiones cuantizadas reducen el peso del decodificador, pero el `mmproj` se mantiene en F16 en todos los casos.
- GPU recomendadas: RTX 3080 Laptop (usada en el benchmark oficial de Moonbox), así como GPUs con al menos 6-8 GB de VRAM para BF16. Para cuantizaciones menores, GPUs de gama media con 4-6 GB podrían ser suficientes, aunque no se documentan cifras exactas.
- Cabe en GPU de consumo: sí, al menos en BF16 sobre una RTX 3080 Laptop según el benchmark reportado; también en GPUs con 8 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`), con backend Metal, CUDA, Vulkan o CPU; el modelo original admite vLLM para inferencia por lotes y servicio asíncrono. No se documenta soporte de Ollama ni de TGI en la información disponible.
- Latencia y throughput: RTF de 0,043 en CUDA sobre RTX 3080 Laptop con decodificación greedy, lo que equivale a procesar aproximadamente 23 segundos de audio por segundo de cómputo. El modelo original 0.6B de la familia alcanza 2000 veces de throughput con concurrencia 128, pero no se proporcionan cifras equivalentes para el 1.7B en GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-GGUF (este) | 2.031.739.904 | no disponible | 30 idiomas + 22 dialectos chinos | Apache-2.0 | GGUF | WER 1,45 % / CER 1,42 % en el set de Moonbox; RTF 0,043 |
| Qwen3-ASR-1.7B (original) | 2.031.739.904 | no disponible | 30 idiomas + 22 dialectos chinos | Apache-2.0 | safetensors (PyTorch) | WER 1,45 % / CER 1,52 % en el mismo set; requiere framework original |
| Qwen3-ASR-0.6B | no disponible | no disponible | 30 idiomas + 22 dialectos chinos | Apache-2.0 | no disponible | Variante eficiente de la misma familia; 2000x throughput a concurrencia 128 |
| Whisper large-v3 | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | no disponible | Alternativa ampliamente usada en ASR; no se aportan datos comparativos en la información disponible |

No se dispone de datos de benchmarks cruzados con Whisper u otros modelos ASR en la información proporcionada, por lo que la comparativa se limita a la familia Qwen3-ASR.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como todo modelo ASR entrenado con datos a gran escala, puede presentar sesgos hacia acentos, dialectos y dominios sobrerrepresentados en el corpus de entrenamiento.
- Riesgo de alucinación: en ASR, el equivalente es la generación de texto no presente en el audio, especialmente en segmentos con ruido, silencios o audio ininteligible; no se cuantifica este riesgo en la información disponible.
- Limitaciones de contexto e idioma: aunque soporta 30 idiomas y 22 dialectos chinos, el rendimiento puede degradarse en idiomas no cubiertos o en variedades dialectales no incluidas; la longitud de contexto no está documentada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los ficheros son un derivado del modelo original y heredan su licencia; conviene revisar la model card original para condiciones adicionales.
- Caveats para producción: el `mmproj` debe mantenerse en F16 y ambos ficheros son obligatorios; se requiere llama.cpp `b12621` o superior y, para el prompt con control de idioma, la variable `LLAMA_MEDIA_MARKER=<__media__>`; la decodificación debe ser greedy para reproducir el benchmark; el repositorio tiene 0 descargas y 0 likes, por lo que la validación comunitaria es inexistente.
- El repositorio solo documenta explícitamente el fichero BF16 y el `mmproj`; aunque la model card menciona otras precisiones generadas con `llama-quantize`, no se detallan tamaños ni hashes de las mismas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Qwen3-ASR-1.7B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
- Imagen de introducción de Qwen3-ASR: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/qwen3_asr_introduction.png
- Diagrama de arquitectura de Qwen3-ASR: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/ove
