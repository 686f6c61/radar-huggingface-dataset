# D-YZ/CoSTA-EN

## Resumen

CoSTA-EN es un checkpoint de diálogo hablado en inglés derivado de Step-Audio-2-mini, publicado por D-YZ como parte del trabajo CoSTA (Compressed Speech Token Adaptation for Efficient Spoken Dialogue Models). El modelo aborda un problema concreto de los sistemas de voz extremo a extremo: las secuencias de tokens de habla que genera el modelo de lenguaje son muy largas y encarecen la inferencia. CoSTA introduce una compresión mediante un vocabulario BPE aprendido que reduce la longitud de dichas secuencias y las expande sin pérdida al espacio original de tokens de habla antes de sintetizar la onda.

El modelo conserva el tokenizador de habla y el decodificador de onda originales de Step-Audio-2-mini, y añade 80.000 tokens de habla nuevos sobre un vocabulario global de 238.352 identificadores de texto y habla. Los pesos se distribuyen en BF16 con un total de 8.885.981.440 parámetros (aproximadamente 8,9 mil millones), en formato safetensors y con implementación personalizada para Transformers.

Es relevante para quien trabaja en diálogo hablado de bajo coste: demuestra que es posible adaptar un modelo any-to-any existente con compresión de tokens de habla y ajuste de diálogo sin reentrenar desde cero. La licencia Apache-2.0 facilita su evaluación en entornos comerciales, aunque el autor advierte que buena parte de los datos de adaptación es sintética.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer any-to-any sobre Step-Audio-2-mini, con compresión de tokens de habla mediante BPE aprendido |
| Parámetros totales | 8.885.981.440 (aproximadamente 8,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) con índice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

CoSTA-EN parte de Step-Audio-2-mini, un modelo any-to-any que combina un modelo de lenguaje con un tokenizador de habla y un decodificador de onda (`token2wav`). La innovación de CoSTA es un vocabulario BPE aprendido que comprime las secuencias de tokens de habla generadas por el LLM: los tokens comprimidos se expanden de forma sin pérdida al espacio original de tokens de habla antes de la síntesis de la onda. El vocabulario BPE de habla tiene 86.656 entradas (6.656 unidades originales y 80.000 unidades fusionadas), y el vocabulario global del LLM alcanza 238.352 identificadores de texto y habla, de los cuales 80.000 son tokens de habla añadidos.

El entrenamiento sigue tres etapas: extensión de vocabulario con inicialización por media, adaptación de pronunciación (primero una fase de embeddings y cabeza LM, después una fase de LLM completo) y adaptación a diálogo hablado. Los datos de pronunciación se basan en Emilia con conversión de voz mediante Seed-VC; la preparación de diálogo sigue OpenS2S con síntesis de habla del asistente mediante CosyVoice 2. El autor señala explícitamente que gran parte de los datos de adaptación es sintética. El repositorio incluye implementación personalizada (`configuration_step_audio_2.py`, `modeling_step_audio_2.py`) con cambios de CoSTA en la pérdida de entrenamiento, el redimensionado de embeddings y la temporización de inferencia.

## Capacidades

- Generación de habla extremo a extremo en inglés dentro de un pipeline any-to-any (entrada de habla y salida de habla).
- Diálogo hablado multi-turno adaptado específicamente mediante la etapa de adaptación a diálogo.
- Compresión de tokens de habla con expansión sin pérdida antes de la síntesis de onda, lo que reduce el coste de decodificación respecto al modelo base.
- Adaptación de pronunciación para mejorar la naturalidad del habla generada.
- Conservación del tokenizador de habla y del decodificador de onda originales de Step-Audio-2-mini.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés en este checkpoint (existe una variante bilingüe mencionada en la model card, sin detallar).
- Modo thinking, visión o audio de entrada distinto del habla: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente por voz: el modelo puede gestionar diálogos hablados multi-turno en inglés con respuesta de voz directa, adecuado para sustituir pipelines en cascada (ASR + LLM + TTS) por un único modelo any-to-any.
- Asistentes de voz embebidos: con aproximadamente 8,9 mil millones de parámetros y compresión de tokens de habla, el coste de decodificación baja respecto a Step-Audio-2-mini, lo que facilita su despliegue en infraestructura con GPUs de gama alta única.
- Evaluación de investigación en diálogo hablado: el checkpoint está pensado para reproducir la evaluación del paper sobre URO-Bench con el manifiesto JSONL preparado por el repositorio.
- Prototipado de interfaces conversacionales: útil para equipos que quieran experimentar con habla a habla sin construir un stack ASR/TTS propio, reutilizando el decodificador `token2wav` del modelo base.
- Generación de respuestas habladas con pronunciación adaptada: la etapa de adaptación de pronunciación con datos de Emilia y Seed-VC permite generar habla más natural en dominios concretos.
- Base para fine-tuning posterior: al estar liberado en Apache-2.0 y con implementación personalizada en Transformers, sirve como punto de partida para adaptar el diálogo hablado a dominios específicos en inglés.
- Investigación sobre compresión de tokens de habla: el vocabulario BPE de 86.656 entradas y los ficheros de mapeo permiten estudiar el equilibrio entre longitud de secuencia y calidad de síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (arXiv:2610.21143) para ajustes experimentales, métricas y resultados sobre URO-Bench, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,8 GB solo para pesos (tamaño del repo), más memoria para activaciones, caché y el decodificador `token2wav`; en la práctica se recomienda una GPU con 24 GB o más.
- GPU recomendadas: A100, H100 o L40S para producción; una RTX 4090 (24 GB) es el límite práctico para BF16 en consumer.
- Cabe en consumer GPU: sí, en RTX 4090 o GPUs con 24 GB o más en BF16; no se documentan cuantizaciones alternativas para reducir requisitos.
- Opciones de despliegue: el flujo soportado es el código de inferencia del repositorio CoSTA con Transformers 4.49.0 y la implementación personalizada; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el autor indica que un `pipeline` genérico de Transformers no es el punto de entrada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| CoSTA-EN | 8,9 mil millones | no disponible | en | apache-2.0 | Checkpoint de diálogo hablado con compresión BPE de tokens de habla |
| Step-Audio-2-mini (modelo base) | no disponible en la información | no disponible | no disponible | no disponible en la información | Modelo any-to-any original; CoSTA-EN lo adapta y comprime sus tokens de habla |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables |

## Limitaciones y advertencias

- Gran parte de los datos de adaptación es sintética (pronunciación con Seed-VC sobre Emilia y diálogo con CosyVoice 2), lo que puede introducir artefactos y sesgos propios de la síntesis.
- La evaluación se centra en diálogo hablado general; el rendimiento en dominios especializados no está documentado.
- El modelo puede producir errores factuales; la calidad depende del idioma de entrada y de las condiciones acústicas.
- Solo soporta inglés en este checkpoint; no se garantiza comportamiento correcto en otras lenguas.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero debe revisarse el fichero `NOTICE` por la atribución a Step-Audio-2-mini y las dependencias externas (`token2wav`).
- El flujo de inferencia requiere el repositorio CoSTA y Transformers 4.49.0; no es compatible con un `pipeline` genérico, lo que complica la integración en producción.
- Los datos de entrenamiento y evaluación no se incluyen en el repositorio y se publican por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/D-YZ/CoSTA-EN
- Paper: https://arxiv.org/abs/2610.21143
- Código e instrucciones: https://github.com/yingzhuodeng/CoSTA
- Instrucciones de entorno: https://github.com/yingzhuodeng/CoSTA#-environment-setup
- Instrucciones de datos e inferencia: https://github.com/yingzhuodeng/CoSTA#-model-inference
- Modelo base: https://huggingface.co/stepfun-ai/Step-Audio-2-mini
