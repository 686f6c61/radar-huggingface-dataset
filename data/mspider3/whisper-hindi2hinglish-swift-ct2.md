# MSpider3/whisper-hindi2hinglish-swift-ct2

## Resumen

`whisper-hindi2hinglish-swift-ct2` es una conversión a formato CTranslate2 con cuantización int8 del modelo `Oriserve/Whisper-Hindi2Hinglish-Swift`, un ajuste fino de Whisper en su variante *base* orientado a reconocimiento automático del habla en hindi y hinglish (mezcla de hindi e inglés habitual en la India). Lo publica el usuario MSpider3 y no aporta entrenamiento nuevo: únicamente cambia el formato de pesos para que el modelo pueda ejecutarse con `faster-whisper` sobre CPU. Todo el mérito del modelo subyacente corresponde a Oriserve y la licencia es Apache-2.0.

Su particularidad frente a Whisper estándar es la salida: transcribe hindi y hinglish en **alfabeto latino** (romanización), por ejemplo "Kal office mein meeting hai, please time par aa jaana", mientras que el inglés se mantiene en inglés. Esto evita el paso posterior de transliteración desde devanagari en pipelines de NLP y aplicaciones de dictado. El pack ocupa 78 MB y está pensado para ejecutarse en CPU, lo que lo hace utilizable en portátiles modestos y entornos *edge* sin GPU.

Es relevante ahora porque demuestra un patrón habitual en el ecosistema: modelos pequeños y especializados, reconvertidos a CTranslate2/int8, que alcanzan latencias muy bajas (factor de tiempo real de 0,16 en una CPU de 2 núcleos) con una precisión en hindi/hinglish muy superior a la de Whisper *small* multilingüe, según la evaluación del propio autor. La contrapartida es que se trata de un artefacto de formato con escasa validación externa (0 descargas, 0 likes en el momento de la consulta) y con un conjunto de evaluación reducido y sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (variante *base*), convertido a CTranslate2 |
| Parametros totales | 74 M aprox. (variante *base* de Whisper; la model card no explicita el recuento) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 s (estándar de Whisper; no indicado en la model card) |
| Tipos de cuantizacion | int8 (única variante distribuida en este repositorio) |
| Idiomas soportados | hindi (`hi`) e inglés (`en`), con salida romanizada para hindi/hinglish |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin` + vocabulario/tokenizer), compatible con faster-whisper |
| Tamano del repositorio | 0,1 GB (modelo: 78 MB) |
| Libreria | `ctranslate2` / `faster-whisper` |
| Modelo base | `Oriserve/Whisper-Hindi2Hinglish-Swift` |
| Fecha de publicacion | 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper en su variante *base*: un transformer encoder-decoder con atención completa, preprocesado log-Mel de 80 canales y decodificación autorregresiva sobre ventanas de 30 segundos. El repositorio no entrena nada; aplica `ct2-transformers-converter` con `--quantization int8` (ctranslate2 4.8.3, transformers 5.20.1) sobre el checkpoint de Oriserve y copia `tokenizer.json` y `preprocessor_config.json`. La cuantización int8 reduce el peso a 78 MB y habilita inferencia en CPU con instrucciones vectoriales estándar.

Sobre el entrenamiento del modelo original no hay información en la documentación proporcionada: no se detallan el número de horas de audio, la composición del corpus, ni si hubo ajuste por RLHF o por *fine-tuning* supervisado con etiquetas romanizadas. Lo único documentado es el comportamiento resultante (salida en script latino para hindi y hinglish) y el hecho de que el modelo fue ajustado por Oriserve a partir de un Whisper *base* preentrenado. Una innovación práctica destacable, aunque no arquitectónica, es el truco de decodificación documentado por el autor: forzar `language="en"` para obtener romanización, ya que con `language="hi"` el modelo revierte a devanagari.

## Capacidades

- Reconocimiento automático del habla (*speech-to-text*) en hindi, hinglish e inglés.
- Salida romanizada para hindi y hinglish, lo que elimina la necesidad de transliteración posterior en pipelines de texto.
- Manejo de code-switching hindi-inglés dentro de la misma frase, típico del habla real en la India.
- VAD (*voice activity detection*) integrado vía faster-whisper (`vad_filter=True`) para filtrar silencios.
- Decodificación con *beam search* configurable (`beam_size`), temperatura y control de umbrales.
- Ejecución en CPU pura con cuantización int8, sin requisito de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo *thinking*, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada a los dos idiomas declarados (`hi`, `en`); no se documenta soporte de otros idiomas.

## Casos de uso

- **Dictado por voz en escritorio Linux**: es el caso de uso original del artefacto; la aplicación ZOLA lo carga con faster-whisper en CPU y transcribe en romanizado directamente en el campo de texto activo, sin depender de servicios en la nube.
- **Transcripción de reuniones con code-switching**: equipos en India que alternan hindi e inglés en la misma intervención obtienen texto legible en alfabeto latino, listo para pegar en actas, wikis o correo sin conversión de script.
- **Subtitulado y post-producción de vídeo**: con un factor de tiempo real de 0,16 en una CPU de 2 núcleos, un portátil puede transcribir varias horas de audio en minutos y generar subtítulos en romanizado para contenido dirigido a audiencia hindú.
- **Atención al cliente en centros de contacto**: transcripción de llamadas en hinglish para análisis de calidad, búsqueda de palabras clave y resumen posterior con un LLM, con la ventaja de que el texto romanizado se tokeniza de forma más económica que el devanagari.
- **Asistentes de voz *offline* en dispositivos modestos**: 78 MB e inferencia int8 permiten empotrar el modelo en una Raspberry Pi o en un portátil sin GPU para comandos de voz y notas rápidas en entornos sin conectividad.
- **Preprocesado para pipelines de NLP**: la salida en script latino alimenta directamente modelos de análisis de sentimiento, extracción de entidades o clasificación entrenados sobre corpus romanizados, evitando un transliterador intermedio.
- **Documentación clínica o de campo**: dictado de notas en hinglish por parte de personal sanitario o de campo en zonas con hardware limitado, donde la latencia y el coste de GPU son inviables.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en una CPU de portátil Intel i3-1005G1 con 2 hilos. El WER se calcula comparando hindi y hinglish tras romanización, de modo que el script de salida no penaliza la métrica. Los conjuntos son pequeños (clips TTS sintéticos más la grabación de un hablante real), según advierte el propio autor.

| Metrica | Este modelo (int8) | Whisper `small` multilingue |
|---|---|---|
| WER ingles | 18 % | 16 % |
| WER hindi | 10 % | 44 % |
| WER hinglish | 12 % | 51 % |
| WER hablante real: hindi | 23 % | 46 % |
| WER hablante real: hinglish | 13 % | 29 % |
| Factor de tiempo real (RTF) | 0,16 | 0,88 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni resultados comparativos frente a Whisper *base* original o frente al checkpoint de Oriserve sin cuantizar.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; en CPU el peso int8 ocupa 78 MB y el consumo adicional de memoria es de unos cientos de MB según el tamaño del *batch* y del buffer de audio.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente (RTX 3060, RTX 4090, A100, H100), pero el modelo está tan optimizado para CPU que la GPU aporta poco en este tamaño.
- Cabe en cualquier GPU de consumo e incluso en gráficas integradas; también en Raspberry Pi y mini-PC sin acelerador.
- Despliegue: `faster-whisper` sobre CTranslate2 es la vía documentada. No se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama; tampoco se documenta soporte en vLLM ni TGI.
- Latencia y throughput: RTF de 0,16 con `compute_type="int8"`, `cpu_threads=2` y `beam_size=5`, es decir, aproximadamente 6 veces más rápido que el tiempo real en una CPU de 2 hilos. Whisper `small` en el mismo equipo obtiene RTF 0,88.
- Configuración de referencia de la model card: `device="cpu"`, `compute_type="int8"`, `cpu_threads=2`, `beam_size=5`, `temperature=0.0`, `vad_filter=True`, `language="en"`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (int8 CT2) | ~74 M (base) | 30 s por ventana | hi, en (romanizado) | Apache-2.0 | CTranslate2 int8 | 78 MB, RTF 0,16 en CPU de 2 hilos |
| Oriserve/Whisper-Hindi2Hinglish-Swift | ~74 M (base) | 30 s por ventana | hi, en | Apache-2.0 | safetensors (transformers) | Modelo origen; requiere PyTorch y no está cuantizado |
| Whisper `small` multilingue | ~244 M | 30 s por ventana | 99 idiomas | MIT (weights de OpenAI) | PyTorch, CT2, GGUF | Referencia de la comparativa: WER 44 % en hindi y 51 % en hinglish, RTF 0,88 |
| Whisper `base` multilingue | ~74 M | 30 s por ventana | 99 idiomas | MIT | PyTorch, CT2, GGUF | Mismo tamaño; sin ajuste específico para hinglish ni salida romanizada |

La comparación directa con Whisper *small* procede de la evaluación del propio autor y favorece claramente a este modelo en los idiomas objetivo (10 % frente a 44 % en hindi), a costa de un rendimiento ligeramente peor en inglés (18 % frente a 16 %) y de una cobertura lingüística mucho más estrecha. No se dispone de datos que comparen este artefacto con el checkpoint de Oriserve en precisión fp32 o fp16.

## Limitaciones y advertencias

- El conjunto de evaluación es reducido y en parte sintético (clips generados por TTS más una única grabación de un hablante real); los WER publicados no son extrapolables sin validación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no procede del autor original del modelo; es una reconversión de formato sin revisión externa documentada.
- La decodificación debe forzarse con `language="en"` para obtener romanización; con `language="hi"` el modelo produce devanagari, lo que rompe la expectativa de salida del pipeline.
- Riesgo de alucinación inherente a Whisper, especialmente en audio con ruido, silencios largos o dominios muy alejados del entrenamiento; se recomienda `vad_filter=True` y `temperature=0.0` como valores por defecto.
- No hay información sobre sesgos demográficos, acento o dialecto; el modelo está orientado al hindi/hinglish estándar y su comportamiento con dialectos regionales o hablantes no nativos es desconocido.
- Cobertura limitada a hindi e inglés: cualquier otro idioma queda fuera de alcance y puede producir salidas incoherentes.
- La cuantización int8 puede degradar ligeramente la precisión frente al checkpoint original; no se documenta la magnitud de esa pérdida.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero conviene conservar la atribución a Oriserve como autor del modelo y cumplir las condiciones de la licencia de Whisper subyacente.
- El modelo solo transcribe: no traduce, no diariza hablantes de forma nativa y no ofrece marcas de tiempo verificadas más allá de las que devuelva faster-whisper.
- No se han encontrado resultados de búsqueda web relevantes sobre este modelo; las fuentes consultadas no guardan relación con él.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MSpider3/whisper-hindi2hinglish-swift-ct2
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Swift
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Aplicación ZOLA (voice typing for Linux): https://github.com/MSpider3/ZOLA-Voice-typing-for-Linux
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la informacion proporcionada.
