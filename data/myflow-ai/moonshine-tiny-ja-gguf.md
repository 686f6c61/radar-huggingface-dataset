# myflow-ai/moonshine-tiny-ja-gguf

## Resumen

moonshine-tiny-ja-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla UsefulSensors/moonshine-tiny-ja, publicada por el usuario myflow-ai para su uso con el runtime transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 27.092.736 parámetros (aproximadamente 27 M), especializado exclusivamente en transcripción de audio en japonés. Al estar cuantizado en GGUF, está pensado para inferencia en CPU y en hardware de gama baja, sin necesidad de GPU.

El modelo hereda la arquitectura Moonshine: consume PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y emite únicamente texto transcrito. Es un modelo monolingüe (japonés): no traduce, no detecta idioma, no genera marcas de tiempo y no soporta streaming. Su relevancia actual radica en que ofrece transcripción japonesa con un CER del 13,20 % en FLEURS-ja ocupando apenas 34 MB en cuantización Q8_0, lo que lo hace desplegable en dispositivos edge, móviles o Raspberry Pi.

La ficha se publica en el Hub con fecha de creación del 10 de octubre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 likes. La licencia es MIT, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine) con stem Conv1d de 3 capas; sin STFT ni banco de filtros mel |
| Parámetros totales | 27.092.736 (~27 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de audio de longitud variable; la decodificación usa max_length=192 tokens) |
| Tipos de cuantización | F32, F16, Q8_0 (formato GGUF) |
| Idiomas soportados | japonés (ja) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

Datos adicionales: entrada de audio PCM mono a 16 kHz; tamaño del repo en el Hub 0,0 GB; pipeline declarado automatic-speech-recognition; modelo base UsefulSensors/moonshine-tiny-ja (relación: quantized).

## Arquitectura y entrenamiento

La arquitectura es la de Moonshine en su variante tiny: un transformer encoder-decoder de unos 27 M de parámetros que procesa audio de 16 kHz en bruto a través de un stem convolucional de tres capas Conv1d, prescindiendo por completo de la transformada de Fourier de corto plazo (STFT) y del banco de filtros mel que utiliza Whisper. Esta elección reduce el coste de preprocesado y permite que el modelo opere con entradas de longitud variable, en lugar de rellenar siempre hasta una ventana fija de 30 segundos. La salida es únicamente la transcripción, sin tokens de tarea, idioma ni timestamps.

El modelo base fue entrenado por Moonshine AI (anteriormente Useful Sensors) y ajustado específicamente para japonés; los detalles completos del corpus, el número de tokens de entrenamiento y las etapas de alineación o ajuste fino se documentan en el artículo "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices" (arXiv:2509.02523), referenciado en la model card. Esta conversión GGUF se generó a partir del commit upstream 02ca41b (fijado el 12 de mayo de 2026) y se validó contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp el 12 de mayo de 2026. La decodificación por defecto es greedy con num_beams=1 y max_length=192, coherente con el generation_config original.

## Capacidades

- Transcripción de voz a texto en japonés a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio de longitud variable sin relleno fijo a 30 segundos.
- Salida limitada a la transcripción: no genera tokens de tarea ni de idioma.
- Ejecución en CPU sin GPU, gracias a las cuantizaciones F32, F16 y Q8_0.
- Integración con el runtime transcribe.cpp mediante archivos GGUF.
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No soporta streaming (streaming: false).
- No genera marcas de tiempo (timestamps: none).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades de visión, audio generativo ni modos de razonamiento extendido.

## Casos de uso

- Subtitulado de contenido en japonés en tiempo diferido: el modelo transcribe archivos WAV convertidos previamente a 16 kHz mono, con un CER del 13,20 % en FLEURS-ja, suficiente para generar borradores de subtítulos que después se revisan manualmente. Al no emitir timestamps, el alineado temporal debe resolverse por otros medios.
- Transcripción local en dispositivos edge: con 34 MB en Q8_0 y ejecución por CPU, puede embeberse en aplicaciones de escritorio, móviles o Raspberry Pi para dictado y notas de voz sin enviar audio a la nube, lo que reduce costes y problemas de privacidad.
- Indexación y búsqueda de archivos de audio japoneses: transcripción por lotes de grabaciones de reuniones, pódcast o llamadas para generar índices de texto consultables, aprovechando el bajo coste computacional por hora de audio.
- Asistentes de voz para atención al cliente en japonés: integración en pipelines de ASR donde el texto transcrito se pasa después a un LLM; este modelo actúa como componente de reconocimiento y no cubre la parte conversacional.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones de charlas, clases o vídeos en japonés en entornos con hardware limitado, dado que no requiere GPU dedicada.
- Procesamiento por lotes de grandes volúmenes de audio: el factor de tiempo real reportado (127 en Metal y 153,5 en CPU sobre M4 Max) permite procesar archivos de forma muy rápida en comparación con la duración del audio, lo que facilita trabajos masivos de transcripción.
- Prototipado e investigación en ASR de bajo coste: al ser un modelo de 27 M de parámetros con licencia MIT, sirve como punto de partida para experimentos de ajuste fino o para comparar arquitecturas sin STFT frente a enfoques clásicos tipo Whisper.
- Despliegue offline en entornos sin conectividad: al no depender de servicios externos y poder ejecutarse por CPU, es apto para sistemas aislados donde el audio no puede salir del equipo.

## Benchmarks y rendimiento

| Cuantización | Tamaño | CER en FLEURS-ja (test, 650 enunciados) |
|---|---|---|
| F32 | 105 MB | 13,20 % |
| F16 | 57 MB | 13,20 % |
| Q8_0 | 34 MB | 13,36 % |
| Referencia Transformers F32 en MPS | no disponible | 13,23 % |

| Plataforma | Backend | RTF reportado |
|---|---|---|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

Notas metodológicas: la métrica se midió sobre el split de test de FLEURS-ja con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192). La model card etiqueta el valor como CER (caracter error rate) en la tabla de descargas y como `wer_fleurs_ja` en los metadatos; la discrepancia de nomenclatura no se aclara en la información disponible. Las cifras F32 y F16 en C++ coinciden con la referencia de Transformers dentro del ruido del intervalo de confianza por bootstrap, y Q8_0 introduce una deriva adicional de aproximadamente 0,1 puntos porcentuales respecto a F16. No se especifica en la información disponible la definición exacta de la métrica RTF empleada ni si valores mayores indican mayor velocidad. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 105 MB en F32, 57 MB en F16 y 34 MB en Q8_0; el consumo total con activaciones se mantiene por debajo de 1 GB en todos los casos.
- GPU recomendadas: no se requieren; cualquier GPU con soporte Metal o Vulkan acelera la inferencia, y el modelo cabe holgadamente en GPUs de gama de entrada.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090 o los iGPU de Apple M4 Max, sin necesidad de cuantización agresiva.
- CPU: se ejecuta íntegramente en CPU; la model card reporta 153,5 de RTF en CPU de M4 Max y 45,5 en CPU de Ryzen 4750U.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake) mediante su binario transcribe-cli; también es posible usar el modelo base con Transformers y MoonshineForConditionalGeneration en PyTorch.
- Requisito de entrada: audio mono a 16 kHz; la conversión se realiza con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: no disponibles más allá de los valores de RTF de la tabla anterior; no se publican cifras de latencia absoluta (ms) ni de throughput en minutos de audio por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto de audio | CER FLEURS-ja | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|---|
| myflow-ai/moonshine-tiny-ja-gguf | 27.092.736 | ja | longitud variable, max_length=192 en decodificación | 13,20 % (F32/F16), 13,36 % (Q8_0) | MIT | GGUF para transcribe.cpp |
| UsefulSensors/moonshine-tiny-ja | 27 M (aproximado, según modelo base) | ja | longitud variable | 13,23 % (referencia Transformers F32 en MPS) | MIT | safetensors para Transformers |
| UsefulSensors/moonshine-tiny (inglés) | 27 M (aproximado, según familia Moonshine) | en | no disponible | no disponible | MIT | safetensors para Transformers |
| Whisper tiny (OpenAI) | no disponible en la información proporcionada | multilingüe (incluido ja) | no disponible | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada |

La comparación se limita a lo verificable en la información proporcionada: el modelo es la conversión GGUF de UsefulSensors/moonshine-tiny-ja, con cifras de error equivalentes dentro del ruido estadístico. Para el resto de alternativas no se dispone de métricas comparables en esta ficha.

## Limitaciones y advertencias

- Modelo monolingüe en japonés: no transcribe ni traduce otros idiomas, y no incorpora detección automática de idioma.
- Sin marcas de tiempo: la salida es texto plano sin segmentación temporal, lo que complica su uso directo para subtitulado sincronizado.
- Sin streaming: requiere el audio completo antes de transcribir, por lo que no sirve para reconocimiento en tiempo real continuo.
- Riesgo de alucinación y de bucles de generación: la propia model card upstream recomienda limitar la longitud máxima de texto generado en función de la duración esperada del audio (factor de aproximadamente 13 tokens por segundo) para evitar bucles.
- Tamaño reducido: con 27 M de parámetros y un CER del 13,20 % en FLEURS-ja, la precisión es inferior a la de modelos ASR de mayor tamaño; el error se concentra probablemente en nombres propios, terminología técnica, ruido de fondo y habla solapada, aunque no se detallan sesgos específicos en la información disponible.
- Licencia MIT: permite uso comercial, modificación y redistribución, manteniendo el aviso de copyright; no se identifican restricciones adicionales, aunque la model card remite a los términos del modelo base.
- Discrepancia de repositorio: los enlaces de descarga de los GGUF de la model card apuntan a `huggingface.co/handy-computer/moonshine-tiny-ja-gguf`, mientras que la ficha se publica bajo `myflow-ai/moonshine-tiny-ja-gguf`; conviene verificar la procedencia real de los archivos antes de usarlos en producción.
- Tamaño del repositorio de 0,0 GB: los pesos GGUF no parecen alojados en el repositorio de myflow-ai, sino referenciados externamente.
- Sin resultados de benchmarks más allá de FLEURS-ja: no hay evaluación publicada sobre otros dominios, acentos o condiciones acústicas adversas.
- Sin soporte de tool calling ni agentes: el modelo solo produce transcripciones y no puede integrarse como componente de razonamiento o de llamada a funciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myflow-ai/moonshine-tiny-ja-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ja
- Commit upstream del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ja/commit/02ca41b
- Repositorio de GGUF referenciado en las descargas: https://huggingface.co/handy-computer/moonshine-tiny-ja-gguf
- Paper "Flavors of Moonshine": https://huggingface.co/papers/2509.02523
- Paper en arXiv: https://arxiv.org/abs/2509.02523
- Paper "Model Cards for Model Reporting": https://arxiv.org/abs/1810.03993
- Código de Moonshine: https://github.com/moonshine-ai/moonshine
- Instrucciones de instalación de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
