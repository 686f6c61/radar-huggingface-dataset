# Moulssarout/scribavox-darija

## Resumen

Scribavox — Darija es una conversión al formato ggml del modelo `amineouaki/whisper-medium-darija-combined`, un Whisper medium reentrenado para reconocimiento automático del habla en darija (árabe marroquí). Lo publica el usuario Moulssarout como artefacto listo para su uso con whisper.cpp, la implementación en C/C++ de Whisper, y está pensado para alimentar la aplicación Android Scribavox cuando el usuario selecciona «Darija» como idioma hablado.

El modelo no aporta pesos nuevos: se trata de una conversión de los pesos originales en safetensors a ggml seguida de una cuantización Q5_0, sin reentrenamiento. El único fichero publicado es `ggml-darija-medium-q5_0.bin`, de 539 MB, lo que reduce el peso del Whisper medium original (unos 1,5 GB en fp16) a aproximadamente un tercio, a cambio de una pérdida de precisión que el autor reconoce explícitamente.

Su relevancia es doble: por un lado, cubre una lengua con poca cobertura en los sistemas ASR comerciales y con escasos recursos públicos; por otro, el formato ggml permite ejecución en CPU y en dispositivos móviles sin depender de infraestructura GPU, lo que encaja con el caso de uso de una app Android. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (variante medium) |
| Parametros totales | no disponible (el modelo base es Whisper medium; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper medium trabaja con ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | Q5_0 (unico fichero publicado, formato ggml) |
| Idiomas soportados | ar (arabe), ary (arabe marroqui / darija) |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml (`ggml-darija-medium-q5_0.bin`, 539 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium de OpenAI: un transformer encoder-decoder con atención completa, entrenado originalmente para transcripción multilingüe sobre ventanas de audio de 30 segundos. El modelo intermedio, `amineouaki/whisper-medium-darija-combined`, es un reentrenamiento de ese Whisper medium sobre varios conjuntos de datos públicos de darija, según indica la model card del autor original; no se detalla en la información disponible el volumen de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO.

La aportación de esta ficha concreta es puramente de ingeniería de despliegue: conversión de los pesos safetensors a ggml y cuantización Q5_0, sin reentrenamiento de ningún tipo. No se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos) ni modificaciones sobre el modelo de partida. El resultado es un artefacto de inferencia optimizado para whisper.cpp, no un modelo nuevo.

## Capacidades

- Reconocimiento automático del habla (ASR) en darija, con salida en escritura árabe.
- Transcripción de audio que mezcla darija y francés: los préstamos léxicos franceses se transcriben en letras árabes, según advierte el autor.
- Ejecución en CPU mediante whisper.cpp, sin necesidad de GPU.
- Ejecución en dispositivos móviles (el caso de uso declarado es la app Android Scribavox).
- Soporte de los identificadores de idioma `ar` y `ary` en la interfaz de whisper.cpp.
- No se documentan capacidades de traducción, diarización de hablantes, timestamps a nivel de palabra ni tool calling; no aplica en un modelo ASR.
- No se documenta modo thinking, visión ni audio-vision.

## Casos de uso

- Transcripción de conversaciones en darija en una app Android: el fichero ggml de 539 MB se integra en whisper.cpp y se ejecuta en el propio dispositivo, sin enviar audio a servidores externos, lo que reduce latencia y protege la privacidad.
- Subtitulado de contenido audiovisual marroquí: series, entrevistas o vídeos de redes sociales en darija pueden transcribirse en lote con `whisper-cli` sobre CPU, con revisión humana posterior dado el margen de error declarado.
- Digitalización de entrevistas de investigación de campo: investigadores que recogen testimonios orales en darija pueden obtener un borrador de transcripción antes de la revisión manual, acelerando el trabajo etnográfico o lingüístico.
- Atención al cliente en mercados marroquíes: transcripción de llamadas o notas de voz de clientes en darija para su posterior análisis o enrutamiento, siempre con revisión humana antes de cualquier acción.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en árabe para contenido hablado en darija, desplegable en local sin coste por minuto de API.
- Archivística y preservación lingüística: transcripción masiva de grabaciones en darija para construir corpus textuales anotados, con la ventaja de que el formato ggml permite procesar en hardware modesto.
- Prototipado rápido de pipelines ASR: al ser un binario ggml autocontenido, sirve para validar la viabilidad de un producto de voz en darija antes de invertir en infraestructura o en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una evaluación cualitativa sobre «un corto extracto que mezcla darija y francés», en la que el contenido se restituyó en su totalidad pero con errores, sin cifras de WER ni CER.

## Requisitos de hardware

- VRAM: no aplica en el caso principal; whisper.cpp con el fichero Q5_0 de 539 MB está diseñado para ejecución en CPU.
- Memoria RAM estimada: alrededor de 1 GB libre para cargar el modelo y procesar una ventana de 30 segundos, aunque el autor no publica cifras oficiales.
- GPU: no se especifican modelos recomendados. whisper.cpp puede compilarse con soporte CUDA, Metal o Vulkan, pero la información disponible no documenta rendimiento en A100, H100 ni RTX 4090.
- GPU de consumo: el tamaño del fichero (539 MB) permite en principio su uso en GPUs de consumo con suficiente VRAM, aunque no hay datos publicados de latencia ni throughput.
- Despliegue: whisper.cpp mediante el binario `whisper-cli` (comando documentado en la model card). No se mencionan vLLM, TGI, Ollama ni llama.cpp, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Scribavox — Darija (Q5_0) | Whisper medium (recuento no publicado) | Ventanas de 30 s | ar, ary | Apache 2.0 | ggml | Hugging Face, 0 descargas |
| amineouaki/whisper-medium-darija-combined | Whisper medium | Ventanas de 30 s | ar, ary | Apache 2.0 | safetensors | Hugging Face (modelo base) |
| openai/whisper-medium | 769 M (cifra de referencia del modelo original) | Ventanas de 30 s | Multilingüe (99 idiomas) | MIT | safetensors, ggml | Hugging Face, ampliamente desplegado |

La comparación con Whisper medium original es la más informativa: este último cubre 99 idiomas pero no está especializado en darija, mientras que Scribavox — Darija sacrifica cobertura lingüística por ajuste al dominio. Frente al modelo intermedio de amineouaki, la diferencia es de formato y cuantización, no de calidad potencial del modelo, ya que los pesos no se han reentrenado.

## Limitaciones y advertencias

- La cuantización Q5_0 introduce pérdida de precisión respecto a los pesos originales en safetensors; el autor no cuantifica esa degradación.
- El propio autor advierte de errores en la transcripción y recomienda revisión humana antes de difundir cualquier salida.
- El texto se escribe siempre en letras árabes, incluidos los préstamos del francés, lo que puede dificultar su lectura a hablantes que esperan grafía latina para esos términos.
- Cobertura limitada a `ar` y `ary`; no es un modelo multilingüe general.
- No hay evaluación cuantitativa publicada (WER, CER) ni sobre el modelo original ni sobre esta conversión.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni de validación por terceros.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con ruido, silencios o audio de baja calidad; no se documenta mitigación específica.
- Sesgos: no se documenta la composición del corpus de entrenamiento del modelo original, por lo que no puede evaluarse el sesgo dialectal, de género o de registro.
- Licencia Apache 2.0 permisiva para uso comercial, heredada del modelo base; conviene verificar las licencias de los conjuntos de datos citados en la ficha de amineouaki, que esta ficha no detalla.
- El nombre del fichero y la app asociada (Scribavox) sugieren un uso integrado en un producto concreto; no se documenta la API ni la interfaz de integración más allá del comando de whisper-cli.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moulssarout/scribavox-darija
- Modelo base intermedio: https://huggingface.co/amineouaki/whisper-medium-darija-combined
- Whisper medium original: https://huggingface.co/openai/whisper-medium
- Repositorio de whisper.cpp: https://github.com/ggml-org/whisper.cpp
