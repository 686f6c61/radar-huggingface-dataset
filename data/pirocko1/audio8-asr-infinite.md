# Pirocko1/Audio8-ASR-Infinite

## Resumen

Audio8 ASR Infinite es un modelo de reconocimiento automático del habla (ASR) diseñado específicamente para transcripción en streaming nativo, es decir, para ir emitiendo texto mientras se recibe audio por un flujo continuo. Lo publica el usuario Pirocko1 en Hugging Face, aunque la propia model card referencia el repositorio Edge0/Audio8-ASR-Infinite y la organización Edge0-AI en GitHub, lo que sugiere un desajuste de identidad en la publicación. El modelo resuelve el problema de la transcripción de latencia baja y longitud ilimitada: con una Rolling KV Cache mantiene constantes tanto la memoria como la latencia incluso en operación ininterrumpida 24/7.

Técnicamente combina una torre de audio causal heredada de Voxtral Realtime 4B con un decodificador de texto basado en Qwen2.5-3B-Instruct, más un proyector y un embedding de longitud de frame entrenados desde cero. Tiene 4.086.224.640 parámetros (~4,1 B) almacenados en bfloat16 (8,17 GB) y una ventana de contexto nativa de 30 segundos que se extiende de forma infinita mediante la citada Rolling KV Cache. Soporta chino e inglés, y ofrece un reloj de audio seleccionable (80/120/160 ms) y un retardo de transcripción configurable entre 240 y 560 ms.

Su relevancia actual radica en que ataca dos limitaciones clásicas del ASR en tiempo real: la deriva de contexto en sesiones largas y la gestión del fin de turno. Para lo segundo incorpora cabeceras de VAD semántico que distinguen pausas de pensamiento y tartamudeo de un fin de turno real. Se publica bajo licencia Apache 2.0 y en estado de preview release, con una fase formal todavía en desarrollo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal de streaming (torre de audio causal Voxtral Realtime 4B + proyector + decodificador Qwen2.5-3B-Instruct, estilo DSM) |
| Parámetros totales | 4.086.224.640 (~4,1 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 s de audio nativo; ilimitada con Rolling KV Cache |
| Tipos de cuantización | no disponible (solo se publican pesos en bfloat16/safetensors) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16): `model.safetensors` (8,17 GB) más `semantic_vad_heads.safetensors`; requiere código remoto (`trust_remote_code`) |
| Componentes | Torre de audio: 32 capas, hidden 1280, 128 bins mel, ventana deslizante 750. Decodificador de texto: 36 capas, hidden 2048, 16 cabezas de consulta / 2 cabezas KV. Proyector: frame len máximo 8, tamaño de proyección 10240, activación gelu |
| Vocabulario | 151936 tokens |
| VAD semántico | 8 clases, horizontes de 0,5 / 1,0 / 2,0 / 3,0 s |
| Reloj de audio | 80 / 120 / 160 ms (12,5 / 8,3 / 6,25 decisiones por segundo) |
| Retardo de transcripción | 240–560 ms configurable |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de audio en tiempo real de Voxtral y un esquema de streaming de tipo DSM. Se compone de cuatro bloques: una torre de audio causal inicializada desde Voxtral Realtime 4B y reentrenada; un proyector de audio con inicialización aleatoria y entrenado; un embedding de longitud de frame también entrenado desde cero; y un decodificador de texto junto con su LM Head inicializados desde Qwen2.5-3B-Instruct y afinados. La torre de audio tiene 32 capas, hidden 1280, 128 bins mel y una ventana deslizante de 750; el decodificador tiene 36 capas, hidden 2048 y usa atención con 16 cabezas de consulta frente a 2 cabezas KV (GQA). El proyector admite una longitud de frame máxima de 8 y proyecta a un espacio de tamaño 10240 con activación gelu. La condicionamentación por longitud de frame está activada (`use_frame_len_embedding: true`).

La innovación central es la Rolling KV Cache, que hace que memoria y latencia permanezcan constantes durante transcripciones de duración ilimitada, evitando la deriva que sufren otros sistemas en sesiones largas. El modelo emite un token de texto por paso de reloj y permite ajustar el compromiso entre latencia y precisión mediante `target_delay_ms`. Existen puntos de operación post-entrenados que combinan frame_len, `streaming_n_left_pad_tokens` y retardos objetivo: 80 ms con frame_len 4 y 18 tokens de pad (delays 240/320/480/560), 120 ms con frame_len 6 y 12 tokens (240/480) y 160 ms con frame_len 8 y 9 tokens (320/480). Además incorpora cabeceras de VAD semántico de 8 clases con horizontes de 0,5 a 3,0 segundos. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en streaming nativo, con decodificación a 12,5 decisiones por segundo (reloj de 80 ms).
- Transcripción de audio de longitud ilimitada manteniendo memoria y latencia constantes gracias a la Rolling KV Cache, pensado para operación 24/7.
- Reloj de audio seleccionable entre 80, 120 y 160 ms, lo que permite equilibrar granularidad de percepción y coste de recursos.
- Retardo de transcripción configurable entre 240 y 560 ms para intercambiar latencia por precisión.
- VAD semántico con 8 clases y horizontes de 0,5 a 3,0 s, capaz de distinguir pausas de pensamiento, tartamudeo y fin de turno real, donde el VAD acústico tradicional falla.
- Bilingüe: chino e inglés.
- Decodificación greedy con supresión de EOS, sin bucles de repetición ni pérdida de palabras finales según el autor.
- Integración con una build adaptada de vLLM para transcripción continua.

No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni visión en la información disponible.

## Casos de uso

- Subtitulado en directo: con un reloj de 80 ms y un retardo de 320–480 ms, el modelo puede generar subtítulos casi sincronizados para emisiones, clases o eventos, manteniendo la latencia acotada durante horas de emisión continua.
- Transcripción de reuniones de larga duración: la Rolling KV Cache permite procesar sesiones de varias horas sin deriva de contexto ni degradación progresiva, algo crítico para actas automáticas.
- Atención al cliente y centros de llamadas: el VAD semántico ayuda a detectar el fin real de turno del interlocutor, mejorando la gestión de conversaciones bilingües (chino/inglés) en tiempo real.
- Asistentes de voz y agentes conversacionales: la baja latencia y la detección de fin de turno permiten encadenar reconocimiento y respuesta sin esperas perceptibles para el usuario.
- Accesibilidad para personas con discapacidad auditiva: transcripción continua y en vivo de conversaciones o contenidos hablados en chino o inglés con latencia controlada.
- Monitorización y análisis de audio en producción: transcripción 24/7 de flujos de audio para indexado, búsqueda o detección de contenido en pipelines automatizados, gracias al mantenimiento constante de memoria y latencia.
- Integración en infraestructura de inferencia: al existir una build adaptada de vLLM, puede desplegarse como servicio de ASR continuo para aplicaciones que requieran alto rendimiento y concurrencia.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificación greedy, supresión de EOS, reloj de audio de 80 ms y `target_delay_ms = 480` (6 tokens de retardo). Tasas de error en porcentaje.

| Test set | Métrica | Audio8 ASR Infinite | Voxtral-Mini-4B-Realtime-2602 | nemotron-3.5-asr-streaming-0.6b |
|---|---|---|---|---|
| aishell1/test | CER | 1,750 | 16,795 | 12,927 @560 ms |
| aishell4/test | CER | 2,893 | 16,456 | 14,677 @560 ms |
| librispeech test.clean | WER | 3,042 | 2,210 | 3,353 @560 ms |
| librispeech test.other | WER | 6,808 | 5,552 | 7,140 @560 ms |
| Media | — | 3,623 | 10,253 (2 sets) | 9,524 |

El modelo es claramente superior en los conjuntos chinos (aishell1 y aishell4) y competitivo en inglés, donde Voxtral-Mini obtiene mejor WER en LibriSpeech. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan 8,17 GB, por lo que se estiman en torno a 10–14 GB de VRAM para inferencia con activaciones y cachés (estimación propia a partir del tamaño de los pesos; el autor no publica cifras oficiales).
- GPU recomendadas: A100, H100 o H200 para despliegue en servidor; RTX 4090, RTX 3090, RTX A6000 o L40S para estaciones de trabajo.
- Cabe en GPU de consumo: sí, en tarjetas con 16–24 GB de VRAM. Una RTX 4090 (24 GB) o RTX 3090 (24 GB) son holgadas; una RTX 4080 de 16 GB sería ajustada pero viable (estimación).
- Opciones de despliegue: se menciona una build adaptada de vLLM para transcripción ilimitada; también es posible usar `transformers` con `trust_remote_code=True` y el paquete `audio8_asr_infinite`. No se documentan soportes de llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: la arquitectura nativa decodifica 12,5 veces por segundo (reloj de 80 ms), con un retardo configurable de 240 a 560 ms. La Rolling KV Cache mantiene la latencia constante incluso en operación 24/7, pero no se publican cifras de throughput (tokens/s) ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio8 ASR Infinite | ~4,1 B | 30 s nativo / ilimitado con Rolling KV Cache | 3,623 | Apache 2.0 | Hugging Face (0 descargas, preview) |
| Voxtral-Mini-4B-Realtime-2602 | ~4 B | no disponible en la información | 10,253 (solo 2 sets) | no disponible en la información | no disponible en la información |
| nemotron-3.5-asr-streaming-0.6b | ~0,6 B | no disponible en la información | 9,524 | no disponible en la información | no disponible en la información |

La comparativa se limita a los datos ofrecidos por el autor. Audio8 ASR Infinite destaca frente a ambos comparadores en los conjuntos chinos, mientras que Voxtral-Mini-4B-Realtime obtiene mejores WER en LibriSpeech en inglés. No se dispone de información sobre licencia ni disponibilidad de las alternativas más allá de lo indicado.

## Limitaciones y advertencias

- Estado de preview release: el autor lo describe como la base de transcripción, con la percepción semántica a nivel de frame todavía en desarrollo (fase formal en progreso).
- Idiomas limitados a chino e inglés; no hay soporte multilingüe más amplio documentado.
- Requiere código remoto (`trust_remote_code=True`) y un paquete específico (`audio8_asr_infinite`), lo que implica ejecutar código del autor y revisar su seguridad antes de usarlo en producción.
- Discrepancia de identidad: el repositorio se publica como Pirocko1/Audio8-ASR-Infinite, pero la model card apunta a Edge0/Audio8-ASR-Infinite y a la organización Edge0-AI. Conviene verificar la procedencia oficial antes de integrarlo.
- Sin tracción comunitaria: 0 descargas y 0 me gusta en el momento de la consulta, por lo que no hay validación independiente ni reportes de terceros.
- No se documentan sesgos conocidos, riesgos de alucinación del decodificador ni limitaciones fonéticas o de acentos más allá de los idiomas declarados.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre los componentes heredados (Voxtral Realtime y Qwen2.5-3B-Instruct) que podrían tener condiciones propias.
- El rendimiento publicado se obtiene con configuraciones concretas (reloj de 80 ms, delay 480 ms); otros puntos de operación no listados pueden no estar optimizados.
- Dependencia de GPU CUDA en el ejemplo de uso (`.cuda()`); no se documenta soporte para CPU u otros aceleradores.

## Enlaces

- [Modelo en Hugging Face (Pirocko1/Audio8-ASR-Infinite)](https://huggingface.co/Pirocko1/Audio8-ASR-Infinite)
- [Modelo en Hugging Face (Edge0/Audio8-ASR-Infinite)](https://huggingface.co/Edge0/Audio8-ASR-Infinite)
- [Repositorio GitHub (Edge0-AI/Audio8-ASR-Infinite)](https://github.com/Edge0-AI/Audio8-ASR-Infinite)
- [Licencia en GitHub](https://github.com/Edge0-AI/Audio8-ASR-Infinite/blob/main/LICENSE)
- [Vídeo de demostración](https://huggingface.co/Edge0/Audio8-ASR-Infinite/resolve/main/Audio8-Asr-Infinite-Demo.mp4)
- arXiv: anunciado como "coming soon" en la model card (sin enlace disponible)
