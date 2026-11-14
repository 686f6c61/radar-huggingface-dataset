# iCELAKE01/VibeVoice-1.5B

## Resumen

VibeVoice-1.5B es un modelo de síntesis de voz (text-to-speech) orientado a la generación de audio conversacional expresivo de formato largo y con múltiples hablantes, como pódcasts o diálogos. Lo desarrolla Microsoft Research y esta ficha corresponde a una réplica publicada por el usuario iCELAKE01 en Hugging Face bajo licencia MIT. El modelo aborda tres problemas clásicos de los sistemas TTS tradicionales: la escalabilidad a secuencias muy largas, la consistencia de la identidad de cada hablante a lo largo del tiempo y la naturalidad en los turnos de conversación.

La arquitectura combina un LLM base (Qwen2.5-1.5B) que interpreta el contexto textual y el flujo del diálogo, dos tokenizadores de voz continuos (acústico y semántico) que operan a una tasa de fotogramas ultrabaja de 7,5 Hz, y una cabeza de difusión ligera que genera los detalles acústicos de alta fidelidad. El resultado es un modelo capaz de sintetizar hasta 90 minutos de audio con hasta 4 hablantes distintos, superando el límite típico de 1-2 hablantes de modelos anteriores.

El modelo es relevante ahora porque demuestra que un LLM pequeño (1.500 millones de parámetros) combinado con tokenizadores especializados y decodificación por difusión puede abordar la generación de audio conversacional largo con coherencia de hablante. Su licencia MIT y su integración con `transformers` facilitan la experimentación, aunque el autor restringe explícitamente el uso a fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen2.5-1.5B) + tokenizadores acústico y semántico + cabeza de difusión (DDPM) |
| Parametros totales | 2.704.021.985 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (entrenado con currículum hasta 64K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VibeVoice es un sistema híbrido. El núcleo es un LLM transformer (Qwen2.5-1.5B en esta versión) que procesa el texto y el flujo del diálogo. A este se le acoplan dos tokenizadores continuos: un tokenizador acústico basado en una variante σ-VAE (propuesta en LatentLM), con estructura encoder-decoder simétrica de 7 etapas de bloques transformer modificados y un factor de submuestreo de 3200x sobre audio de 24 kHz, con aproximadamente 340M de parámetros por componente; y un tokenizador semántico cuyo encoder replica la arquitectura del acústico (sin componentes VAE) y se entrena con una tarea proxy de ASR. Ambos operan a 7,5 Hz, lo que reduce drásticamente el coste computacional de secuencias largas.

La generación acústica la realiza una cabeza de difusión ligera de 4 capas y unos 123M de parámetros, condicionada por los estados ocultos del LLM, que predice las características del VAE acústico mediante un proceso DDPM con Classifier-Free Guidance y DPM-Solver en inferencia. El entrenamiento se divide en dos fases: preentrenamiento separado de los tokenizadores y entrenamiento de VibeVoice con los tokenizadores congelados, donde solo se ajustan el LLM y la cabeza de difusión. Se emplea una estrategia de currículum sobre la longitud de secuencia de entrada (4K → 16K → 32K → 64K). No se especifica el volumen total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Síntesis de voz expresiva de formato largo: hasta 90 minutos de audio continuo.
- Generación de diálogo con hasta 4 hablantes distintos manteniendo consistencia de identidad.
- Turn-taking natural entre hablantes en conversaciones multi-turno.
- Comprensión del contexto textual y del flujo del diálogo gracias al LLM base.
- Generación de audio a partir de transcripciones con estructura de diálogo (pódcast, entrevistas, narraciones).
- Soporte multilingüe limitado a inglés y chino.
- No soporta tool calling ni function calling (es un modelo TTS, no un LLM de propósito general).
- No genera audio no verbal: ni ambientes, ni música, ni efectos de sonido.
- No modela solapamiento de habla (speech overlap).

## Casos de uso

- Producción de pódcasts sintéticos: el modelo puede generar episodios completos de hasta 90 minutos con varios presentadores a partir de un guion, manteniendo la voz de cada hablante estable durante toda la emisión.
- Audiolibros y narración larga: permite sintetizar capítulos extensos con uno o varios narradores, aprovechando la ventana de 64K tokens para mantener coherencia en pasajes prolongados.
- Prototipado de asistentes conversacionales: útil en investigación para generar diálogos de referencia y evaluar la naturalidad de turnos antes de invertir en sistemas de producción.
- Generación de material de accesibilidad: conversión de transcripciones de entrevistas o documentos dialogados en audio comprensible para personas con discapacidad visual.
- Investigación en deepfakes y detección de audio sintético: el modelo sirve como generador de referencia para entrenar y evaluar sistemas de detección de voz falsificada, dado su realismo.
- Localización de contenido entre inglés y chino: creación de versiones de audio de guiones en ambos idiomas soportados para mercados concretos.
- Docencia y formación: generación de escenarios de diálogo para materiales educativos o simulaciones de entrevistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 2.704 millones de parámetros en safetensors, los pesos en fp16 ocupan aproximadamente 5,4 GB, por lo que la inferencia requiere al menos unos 6-8 GB de VRAM sumando activaciones y buffers de audio.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas; una RTX 3090 o 4080 también deberían ser suficientes para fp16.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con 8 GB o más en fp16; en cuantizaciones menores no hay datos publicados.
- Opciones de despliegue: `transformers` (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Duración máx. | Hablantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VibeVoice-1.5B (esta ficha) | 2.704M | 64K | ~90 min | 4 | MIT | Hugging Face (réplica de usuario) |
| VibeVoice-Large | no disponible | 32K | ~45 min | no disponible | MIT | Deshabilitado según model card |
| VibeVoice-0.5B-Streaming | no disponible | no disponible | no disponible | no disponible | MIT | Hugging Face (microsoft/VibeVoice-Realtime-0.5B) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El autor restringe el uso a fines de investigación y no recomienda su empleo comercial ni en aplicaciones del mundo real, pese a la licencia MIT.
- Solo admite inglés y chino; otros idiomas pueden producir audio ininteligible u ofensivo.
- No genera audio no verbal (música, ambiente, efectos) ni modela solapamiento de habla.
- Hereda sesgos, errores y omisiones del modelo base Qwen2.5-1.5B.
- Riesgo elevado de deepfakes y desinformación: la voz sintética de alta calidad puede usarse para suplantación, fraude o difusión de noticias falsas.
- Prohibido el clonado de voz sin consentimiento explícito y grabado, así como la conversión de voz en tiempo real de baja latencia.
- No se especifican los datos de entrenamiento ni el volumen de tokens, lo que dificulta evaluar sesgos de dominio.
- Esta ficha corresponde a una réplica de usuario (iCELAKE01) con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial de Microsoft.

## Enlaces

- Hugging Face (esta réplica): https://huggingface.co/iCELAKE01/VibeVoice-1.5B
- Informe técnico: https://arxiv.org/abs/2508.19205
- Paper LatentLM (σ-VAE): https://arxiv.org/pdf/2412.08635
- Página del proyecto: https://microsoft.github.io/VibeVoice
- Código: https://github.com/microsoft/VibeVoice
- Modelo base LLM: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo streaming oficial: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
