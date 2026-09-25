# Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2

## Resumen

VibeVoice-ASR-Streaming-7B-DFlash2 es un paquete de pesos publicado por el usuario Ar4ikov que combina los pesos BF16 originales de microsoft/VibeVoice-ASR-Streaming-7B (revisión `60d858b5`, 17,36 GB) con un drafter de decodificación especulativa DFlash 2 incluido en el subdirectorio `drafter/`. No es un modelo nuevo: es una distribución empaquetada para que el runtime vibevoice.c pueda decodificar con decodificación especulativa sin descargar artefactos por separado. El resultado declarado por el autor es un incremento de velocidad de entre 2,02x y 2,08x en la generación de tokens, manteniendo la transcripción idéntica byte a byte.

El modelo subyacente es un sistema de reconocimiento automático del habla (ASR) en streaming de aproximadamente 7B parámetros, orientado a transcripción con sesiones incrementales (22 + 4 frames por bloque según la model card). El repositorio contiene 8.674.021.857 parámetros en safetensors y ocupa 19,0 GB, incluyendo tanto el modelo principal como el drafter. La librería asociada es `vibevoice.c`, una implementación en C del runtime de VibeVoice mantenida por el mismo autor.

Su relevancia actual es fundamentalmente de ingeniería de inferencia: empaqueta en una sola descarga un modelo ASR de 7B con decodificación especulativa verificada de forma exacta, un patrón poco habitual en ASR open source, donde lo común es optimizar la precisión (WER) y no el throughput de decodificación. La licencia es MIT, igual que la del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo base VibeVoice-ASR-Streaming-7B de Microsoft. El drafter usa 5 capas estilo Qwen3 que leen las capas 1/7/13/19/25 del modelo, un selector de candidatos y un vocabulario de borrador de 32.768 identificadores |
| Parámetros totales | 8.674.021.857 (safetensors, incluyendo modelo y drafter) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 nativo (ejecutado como FP16 denso en vibevoice.c); INT4 en carga mediante `--quant int4`; el drafter se mantiene en INT4 por defecto y admite `--draft-quant f16` para FP16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería declarada: `vibevoice.c`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su nombre y su tarea: reconocimiento automático del habla en streaming. Se sabe que los pesos distribuidos son exactamente los de microsoft/VibeVoice-ASR-Streaming-7B en la revisión `60d858b5`, sin modificaciones, y que el conjunto suma 17,36 GB para el modelo principal más 1,66 GB para el drafter. No se documentan en esta ficha el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica del paquete está en el drafter DFlash 2 (publicado aparte como Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter, revisión `1d45ecb5`). Está formado por 5 capas de estilo Qwen3 que consumen las activaciones de las capas 1, 7, 13, 19 y 25 del modelo principal, más un selector de candidatos y un vocabulario de borrador de 32.768 identificadores. En cada paso propone 8 tokens en una sola pasada y el modelo los verifica en otra; según el autor, la verificación es exacta porque cada fila comprobada se calcula con la aritmética del propio paso de decodificación del modelo, de modo que la transcripción resultante coincide byte a byte con la obtenida sin drafter. Los tokens efectivos por bloque medidos fueron 3,20 (fichero de 2 minutos) y 2,82 (fichero de 32 minutos), lo que explica que el speedup quede en torno a 2x y no en el máximo teórico de 8x.

## Capacidades

- Reconocimiento automático del habla (ASR) con decodificación en streaming, en bloques de 22 + 4 frames según la model card.
- Transcripción de ficheros de audio de distinta duración; el autor reporta pruebas con ficheros de 2 y 32 minutos.
- Decodificación especulativa verificada de forma exacta, con transcripciones idénticas a las de la decodificación sin drafter.
- Modo de decodificación simple mediante `--draft none`, para comparar o para evitar el uso del drafter.
- Servicio en red: `vv_cli serve` con soporte de sesiones en streaming por WebSocket y SSE, y `--slots 4`.
- Cuantización en carga a INT4 con `--quant int4`, compatible con el drafter.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Otras capacidades especiales (visión, audio de entrada además del propio ASR, modo thinking): no disponible.

## Casos de uso

- Transcripción de reuniones en tiempo real: el modo `serve` expone sesiones por WebSocket y SSE, lo que permite enviar audio incremental (22 + 4 frames por bloque) y recibir la transcripción conforme se produce, sin esperar al final de la reunión.
- Subtitulado en directo de emisiones o webinars: al ser un modelo de streaming con decodificación rápida (hasta 119 tok/s con drafter en una RTX 3090), la latencia de generación de subtítulos se mantiene baja en relación con el ritmo del habla.
- Procesamiento por lotes de audio de archivo: los ficheros largos son viables porque el autor midió 109 tok/s con drafter en un fichero de 32 minutos, con un factor de 2,02x frente a la decodificación simple.
- Servicio interno de transcripción con varios clientes concurrentes: `vv_cli serve --slots 4` permite atender hasta cuatro sesiones simultáneas sobre una misma instancia, útil para equipos pequeños que no quieren desplegar infraestructura distribuida.
- Despliegue en hardware de una sola GPU de gama alta de consumo: con INT4 en carga, un equipo con RTX 3090 (24 GB) puede ejecutar el modelo y el drafter; es la configuración exacta sobre la que el autor publicó las mediciones.
- Indexación y búsqueda sobre archivos de audio: transcribir un repositorio de grabaciones para después indexarlas en un motor de búsqueda de texto, aprovechando que el proceso es no interactivo y se beneficia del throughput del drafter.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones grabadas para su posterior clasificación o extracción de métricas; conviene validar antes la precisión en el dominio concreto, ya que no hay datos de WER publicados en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo único publicado son mediciones de velocidad de decodificación del autor, ejecutadas con vibevoice.c `b72be15` (rama `dflash2`), en una RTX 3090, con decodificación greedy y pesos BF16 ejecutados como FP16 denso, con `--draft-check exact`:

| Escenario | Sin drafter | Con drafter | Aceleración | Tokens por bloque | ¿Misma transcripción? |
|---|---|---|---|---|---|
| Fichero de 2 minutos | 57 tok/s | 119 tok/s | 2,08x | 3,20 | Sí |
| Fichero de 32 minutos | 54 tok/s | 109 tok/s | 2,02x | 2,82 | Sí |

Estos datos corresponden a una única configuración de hardware y a un modo de decodificación concreto; no deben extrapolarse a otras GPU, a otros lotes o a decodificación no greedy.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19 GB con los pesos BF16 ejecutados como FP16 denso, incluyendo el drafter. El uso de `--quant int4` reduce el consumo, aunque el fabricante del runtime no publica en esta información una cifra exacta de VRAM para ese modo.
- GPU validadas: RTX 3090 (24 GB) es la única GPU sobre la que se han publicado mediciones.
- GPU recomendadas: no disponible. Por el tamaño, encajan tarjetas con 24 GB o más; una GPU con menos de 19 GB no puede cargar los pesos en FP16 sin cuantizar.
- ¿Cabe en GPU de consumo? Sí en el caso de la RTX 3090 con FP16, y presumiblemente en otras tarjetas con 24 GB de VRAM o más. No hay datos publicados para tarjetas de 8, 12 o 16 GB.
- Opciones de despliegue: vibevoice.c (CLI `vv_cli` y servidor `vv_cli serve` con WebSocket y SSE, hasta 4 slots). Requiere la rama `dflash2` (PR #48) o la siguiente release. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros runtimes.
- Latencia y throughput: 119 tok/s con drafter en fichero de 2 minutos y 109 tok/s en fichero de 32 minutos sobre RTX 3090; en modo sin drafter, 57 y 54 tok/s respectivamente. No se publican cifras de latencia por bloque ni de RTF (real-time factor).

## Comparativa con modelos similares

La información disponible no incluye datos de otros modelos ASR comparables (Whisper, Canary, Parakeet u otros), por lo que la comparación se limita a las variantes directamente relacionadas con este paquete:

| Modelo | Parámetros / tamaño | Contexto | Licencia | Pesos | Particularidad |
|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-7B-DFlash2 (este) | 8.674.021.857 en safetensors; 19,0 GB de repo | No disponible | MIT | safetensors (modelo + drafter integrado) | Decodificación especulativa lista para usar; 2,02x-2,08x de aceleración |
| microsoft/VibeVoice-ASR-Streaming-7B | 7B (17,36 GB de pesos) | No disponible | MIT | safetensors | Modelo base, sin drafter; decodificación densa |
| Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter | 1,66 GB | No aplica | No disponible en esta información | safetensors (BF16, INT4 en carga por defecto) | Solo el drafter: 5 capas estilo Qwen3, selector de candidatos y vocabulario de 32.768 ids |
| Otros modelos ASR de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos comparables |

## Limitaciones y advertencias

- Es un empaquetado de terceros (Ar4ikov), no una publicación oficial de Microsoft. Los pesos en sí son los del modelo base sin cambios, pero el soporte y las garantías dependen del autor del paquete.
- Requiere la rama `dflash2` de vibevoice.c, todavía pendiente de fusión en la release estable (PR #48). Esto implica riesgo de cambios de interfaz o de comportamiento hasta que se integre.
- Consumo de VRAM elevado: unos 19 GB en FP16, lo que descarta GPUs de consumo con menos de 24 GB salvo que se cuantice a INT4.
- La cuantización a INT4 se aplica en el momento de la carga, lo que añade tiempo de arranque; no se documenta en esta información la pérdida de precisión asociada.
- No hay datos publicados de WER ni de ningún otro benchmark de precisión en la información disponible: la calidad de transcripción no puede evaluarse con lo aportado.
- No se documentan idiomas soportados ni longitud de contexto, por lo que no es posible asegurar cobertura multilingüe ni el comportamiento con entradas muy largas.
- Riesgo de alucinación inherente a los sistemas ASR en audio ruidoso, con solapamiento de voces o con vocabulario especializado (nombres propios, términos técnicos); no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible. Se heredan del corpus de entrenamiento del modelo base, que no se detalla.
- Las cifras de rendimiento provienen de una única máquina (RTX 3090), decodificación greedy y una versión concreta del runtime; no son extrapolables a otros entornos.
- Licencia MIT tanto en este paquete como en el modelo base según lo declarado, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base en su propia model card antes de un despliegue en producción.
- La integración en producción depende de un runtime en C (`vibevoice.c`) con un ecosistema mucho menor que el de otros frameworks de inferencia; no hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-7B
- Drafter DFlash 2: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-DFlash2-Drafter
- Repositorio del runtime vibevoice.c: https://github.com/Ar4ikov/vibevoice.c
- Pull request con soporte DFlash 2 (rama `dflash2`): https://github.com/Ar4ikov/vibevoice.c/pull/48
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
