# bcckfdn/cevher2-test-16-decay-it

## Resumen

Cevher-2-test (concretamente la variante `cevher2-test-16-decay-it`) es un modelo de lenguaje de 1.514 millones de parámetros entrenado desde cero por el usuario independiente bcckfdn, publicado en Hugging Face bajo licencia Apache 2.0. El modelo utiliza la arquitectura de SmolLM2, basada en la familia Llama, y está orientado principalmente al turco, con soporte secundario del inglés. Su nombre sugiere que se trata de una versión experimental de preentrenamiento ("test"), con la etiqueta "decay" posiblemente referida a una configuración específica del decaimiento del learning rate durante el entrenamiento.

El problema que aborda es la escasez de modelos de lenguaje abiertos optimizados para turco en el rango de ~1,5B parámetros, un tamaño adecuado para su ejecución en hardware de consumo. El modelo fue entrenado con aproximadamente 712.704 millones de tokens (712B), alcanzando una pérdida de validación mínima de 0,9628, lo que indica un proceso de preentrenamiento sustancial aunque de escala modesta comparado con modelos comerciales.

Su relevancia actual radica en la tendencia creciente a entrenar modelos especializados por idioma desde cero, con vocabularios compactos (65.536 tokens) que mejoran la eficiencia para lenguas morfológicamente ricas como el turco. Al ser un modelo de la comunidad, sin respaldo corporativo, su utilidad práctica dependerá de la evaluación que realice cada desarrollador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (arquitectura SmolLM2) |
| Parámetros totales | 1.513.546.496 (~1,51B) |
| Parámetros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización GGUF no confirmada) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de SmolLM2, una variante del diseño decoder-only de Llama: 34 capas, dimensión oculta de 1792, 28 cabezas de atención para queries y 7 para key/value (agrupación GQA, que reduce el coste de memoria del KV cache), y un vocabulario compacto de 65.536 tokens. La relación 28/7 entre cabezas Q y KV confirma el uso de grouped-query attention, habitual en modelos modernos de este tamaño para acelerar la inferencia.

El preentrenamiento se realizó desde cero ("pretrained-from-scratch") con 712.704 millones de tokens, alcanzando una mejor pérdida de validación de 0,9628. No se ha documentado la composición exacta del corpus ni si se aplicaron fases de post-entrenamiento como SFT, RLHF o DPO, aunque el sufijo "-it" del repositorio sugiere una variante instruida o ajustada para conversación (el pipeline es conversational/text-generation). Tampoco se han publicado detalles sobre el hardware de entrenamiento, el optimizador o la duración del proceso.

## Capacidades

- Generación de texto conversacional en turco e inglés mediante el pipeline `text-generation` de transformers.
- Arquitectura compatible con el ecosistema Hugging Face (`AutoModelForCausalLM`, `AutoTokenizer`), lo que facilita su integración en pipelines estándar.
- Ventana de contexto de 8192 tokens, suficiente para documentos cortos y conversaciones multi-turno moderadas.
- Vocabulario compacto de 65.536 tokens, potencialmente más eficiente en tokens por palabra para turco que vocabularios genéricos multilingües.
- No se ha documentado soporte oficial de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Chatbots en turco para aplicaciones ligeras: con 1,5B de parámetros y 8192 tokens de contexto, el modelo puede desplegarse en entornos con recursos limitados para atender conversaciones multi-turno de longitud moderada en turco.
- Generación de contenido en turco: redacción de textos cortos, respuestas de correo o descripciones de producto en turco, donde los modelos multilingües genéricos suelen tener menor fluidez.
- Traducción o asistencia bilingüe turco-inglés informal: al estar entrenado con ambos idiomas, puede asistir en tareas de cambio de código o redacción bilingüe, aunque sin garantías de calidad de traducción profesional.
- Investigación sobre modelos monolingües/bilingües desde cero: al publicarse pesos completos y datos de entrenamiento (tokens, loss), es útil como base para estudios de ablation, fine-tuning experimental o análisis de vocabularios compactos para lenguas aglutinantes.
- Fine-tuning en dominios específicos: su tamaño moderado lo hace idóneo para ajuste fino (LoRA, QLoRA) con datos jurídicos, médicos o técnicos en turco por parte de equipos con presupuestos de cómputo reducidos.
- Despliegue en local con privacidad de datos: aplicaciones que procesan datos sensibles en turco y requieren inferencia on-premise en GPU de consumo o incluso CPU.
- Prototipado de asistentes conversacionales en turco: la etiqueta conversational y el formato transformers permiten integrarlo rápidamente en demos y MVPs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento de entrenamiento publicado es la mejor pérdida de validación: 0,9628.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,0 GB solo para los pesos (el tamaño del repositorio lo confirma), más overhead de activaciones y KV cache; en la práctica se recomiendan 4-6 GB de VRAM para inferencia cómoda con contexto completo.
- Con cuantización a 8 bits o 4 bits (si se generan versiones GGUF o AWQ), el modelo podría funcionar en GPUs con 2-4 GB de VRAM o incluso en CPU.
- GPUs de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superiores ejecutan el modelo en FP16 sin problema; también es viable en GPUs más antiguas con 6 GB.
- Para entrenamiento o fine-tuning completo se recomendaría una GPU con 24 GB (RTX 4090, RTX 3090); con LoRA/QLoRA bastaría una GPU de 8-12 GB.
- Opciones de despliegue: transformers de Hugging Face de forma nativa; por arquitectura Llama-compatible, es probable que funcione con llama.cpp, Ollama y vLLM tras conversión de formato, aunque no hay versiones oficiales publicadas.
- Latencia y throughput: no disponibles; al tratarse de un modelo denso de 1,5B con GQA, se esperan velocidades de generación altas en GPU de consumo (decenas de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas principales | Licencia | Notas |
|---|---|---|---|---|---|
| cevher2-test-16-decay-it | 1,51B | 8192 | Turco, inglés | Apache 2.0 | Entrenado desde cero, orientado a turco |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | Inglés (multilingüe limitado) | Apache 2.0 | Arquitectura de referencia; mejor documentado y con benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Multilingüe (incluye turco) | Apache 2.0 / Qwen | Cobertura multilingüe amplia y benchmarks sólidos, vocabulario grande |
| Gemma-2-2B-it | 2,6B | 8192 | Multilingüe | Gemma license (restricciones) | Rendimiento superior pero licencia menos permisiva |

Cevher-2 se diferencia por su entrenamiento específico para turco con vocabulario compacto, frente a los multilingües genéricos, aunque carece de la documentación, benchmarks y madurez de los alternativas corporativas.

## Limitaciones y advertencias

- Modelo experimental: el propio nombre ("test") indica que es una versión de prueba; no hay garantías de calidad ni de continuidad en el mantenimiento.
- Sin benchmarks publicados: no existen evaluaciones estandarizadas (MMLU, GSM8K, etc.) que permitan comparar objetivamente su calidad; se recomienda evaluación propia antes de uso en producción.
- Riesgo de alucinación elevado: modelos de 1,5B entrenados desde cero con ~712B de tokens suelen tener factuales y de razonamiento limitados, especialmente en inglés.
- Cobertura lingüística limitada: solo turco e inglés; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto de 8192 tokens: insuficiente para documentos largos o análisis de repositorios completos.
- Sin documentación de post-entrenamiento: no está claro si recibió SFT/DPO, por lo que el comportamiento en instrucciones puede ser inconsistente.
- Sesgos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos presentes en los datos; como todo modelo de lenguaje, puede reproducir estereotipos.
- Licencia Apache 2.0 permisiva: permite uso comercial, modificación y redistribución, sin restricciones relevantes; no obstante, no hay garantía de ningún tipo.
- Descargas y adopción muy bajas (172 descargas, 1 like), lo que implica escasa validación comunitaria y posible falta de correcciones de bugs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-16-decay-it
- Arquitectura de referencia SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- No se han encontrado papers, blogs, repos de código ni demos adicionales en la información disponible.
