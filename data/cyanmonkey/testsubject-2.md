# CyanMonkey/TestSubject-2

## Resumen

CyanMonkey/TestSubject-2 es un modelo de lenguaje causal publicado en HuggingFace por el usuario CyanMonkey, con 98.765.504 parámetros totales (≈98,8 M) según los metadatos de safetensors. Se distribuye bajo licencia Apache 2.0, solo declara inglés (`en`) como idioma y está en acceso restringido (gated): es necesario aceptar condiciones en la página del repositorio antes de descargarlo. La ficha de metadatos lo etiqueta con `causal-lm`, `gqa`, `qk-norm`, `rope`, `swiglu`, `refresh-gate` y las clases de arquitectura `rose_x1_5` / `rose-x1`, además de `custom_code`, lo que implica que la carga requiere `trust_remote_code=True`.

Por tamaño, se sitúa en la franja de los modelos pequeños tipo GPT-2 small (124 M) o SmolLM2-135M: un rango pensado para inferencia en CPU, prototipado rápido y experimentos de ajuste fino, no para tareas de razonamiento complejo. El nombre ("TestSubject-2"), la existencia de una variante previa (`rose-x1` frente a `rose_x1_5`), el contador de descargas (258) y la ausencia de likes sugieren un modelo experimental o de validación más que un lanzamiento de producción.

La relevancia ahora mismo es limitada y fundamentalmente técnica: sirve para evaluar implementaciones propias de atención con GQA y QK-norm, y para probar infraestructura de despliegue. No hay model card sustantiva, ni pipeline declarado, ni benchmarks publicados en la información disponible, y el tamaño del repositorio (86,5 GB) es incoherente con el número de parámetros declarado, lo que exige verificación antes de cualquier uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm) con clases `rose_x1_5` / `rose-x1`; atención con GQA, QK-norm, RoPE y activación SwiGLU, más un componente `refresh-gate` |
| Parámetros totales | 98.765.504 (≈98,8 M) según safetensors |
| Parámetros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo declara safetensors; no se confirman GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con `custom_code`; requiere `trust_remote_code`) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 258 / 0 |
| Tamaño del repositorio | 86,5 GB (incoherente con el número de parámetros; ver advertencias) |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-23 |

## Arquitectura y entrenamiento

Los únicos datos disponibles sobre la arquitectura proceden de las etiquetas del repositorio. Estas indican un modelo causal estándar (decoder-only) con atención de consultas agrupadas (GQA), normalización aplicada sobre query y key (QK-norm, habitual para estabilizar el entrenamiento en contextos largos), embeddings posicionales rotatorios (RoPE) y FFN con activación SwiGLU. Se añade un componente denominado `refresh-gate`, cuya función no está documentada en la información proporcionada; por el nombre podría tratarse de una compuerta de actualización de estado o de refresco de memoria, pero no hay confirmación técnica. Las clases `rose_x1_5` y `rose-x1` aparecen como arquitecturas registradas en los metadatos, lo que apunta a una implementación propia incluida en el repositorio (`custom_code`) y no a una arquitectura de la librería estándar de Transformers.

No hay información sobre el volumen de tokens de entrenamiento, la composición del corpus, si hubo fases de instrucción (SFT), alineamiento (RLHF/DPO) o ajuste con datos sintéticos. Tampoco se documenta la estrategia de tokenizador, el tamaño del vocabulario ni innovaciones de decodificación (decodificación especulativa, atención lineal o híbrida). Cualquier afirmación sobre estos puntos sería especulativa.

## Capacidades

- Generación de texto causal en inglés: continuación de texto y generación libre a partir de un prefijo, propia de un modelo `causal-lm`.
- Capacidad de razonamiento, código y matemáticas: no documentada y previsiblemente muy limitada por el tamaño (≈98,8 M de parámetros); no hay evaluaciones que la respalden.
- Tool calling / function calling: no disponible; no se declara soporte de plantillas de herramientas ni de formatos de llamada a funciones.
- Agentes y razonamiento multi-paso: no disponible; no hay indicios de modo de razonamiento, planificación ni soporte de agentes.
- Multilingüismo: solo inglés declarado (`en`). No se garantiza comportamiento en castellano ni en otros idiomas.
- Capacidades especiales: no se declaran visión, audio, modo "thinking" ni decodificación especulativa. El único elemento diferencial declarado es el componente `refresh-gate`.
- Integración: al usar `custom_code`, requiere cargar con `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio.

## Casos de uso

- Validación de infraestructura de despliegue: por su tamaño (≈98,8 M de parámetros) es adecuado como modelo de pruebas para verificar pipelines con vLLM, TGI, llama.cpp u Ollama antes de mover cargas reales a modelos mayores. Requiere verificar antes la compatibilidad de la arquitectura `rose_x1_5` con cada servidor.
- Pruebas de integración continua de código propio: al ser un modelo pequeño y con `custom_code`, sirve para testear la carga con `trust_remote_code`, el troceado de safetensors y las rutas de tokenización en los tests de una librería o plataforma.
- Generación de texto corto en entorno local o edge: con ≈0,2 GB en bf16, cabe en CPU y en dispositivos con poca memoria para tareas de relleno, plantillas o textos muy breves en inglés, siempre que la calidad se valide empíricamente.
- Experimentos académicos de arquitectura: permite reproducir y comparar variantes de atención con GQA, QK-norm y RoPE a pequeña escala, así como estudiar el efecto del componente `refresh-gate` mediante ablaciones.
- Ajuste fino supervisado con recursos mínimos: al partir de 98,8 M de parámetros, un fine-tuning completo o con LoRA es viable en una única GPU de consumo, útil para demostraciones docentes de SFT y evaluación de sobreajuste.
- Filtrado y clasificación ligera de textos en inglés: uso como extractor o generador de etiquetas en prototipos donde el coste por inferencia es crítico, con la advertencia de que no hay métricas que avalen su precisión.
- Generación aumentada de datos para pruebas: producir borradores sintéticos en inglés para validar esquemas de datos, plantillas de prompt o sistemas de evaluación, no para datos finales de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, HellaSwag ni de evaluaciones comparativas. Tampoco se dispone de métricas de perplejidad, de latencia o de throughput medidas.

## Requisitos de hardware

- VRAM estimada (solo pesos, calculada a partir de 98.765.504 parámetros): ≈0,40 GB en fp32, ≈0,20 GB en bf16/fp16, ≈0,10 GB en int8 y ≈0,05 GB en 4 bits. A esto hay que sumar la caché KV, cuyo tamaño no puede estimarse porque se desconoce la longitud de contexto y el número de capas y cabezas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente en la teoría; no se requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una iGPU reciente estarían sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquiera con soporte de bf16/fp16; también es viable en CPU.
- Opciones de despliegue: no confirmadas. La arquitectura es propietaria (`rose_x1_5`, `custom_code`), por lo que llama.cpp, Ollama, vLLM o TGI solo funcionarán si existe implementación compatible o si se convierte el modelo. La ruta segura es Transformers con `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.
- Advertencia de almacenamiento: el repositorio ocupa 86,5 GB, muy por encima de lo que correspondería a 98,8 M de parámetros en cualquier precisión; conviene revisar el contenido real del repo (pesos duplicados, checkpoints intermedios u otros artefactos) antes de planificar el despliegue.

## Comparativa con modelos similares

Los datos del modelo evaluado figuran como "no disponible" en la mayoría de filas. Las cifras de los modelos alternativos provienen de conocimiento público general, no de la información proporcionada en esta ficha, y deben verificarse en sus repositorios.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmark público |
|---|---|---|---|---|---|
| CyanMonkey/TestSubject-2 | 98,8 M | No disponible | en | Apache 2.0 (acceso gated) | No disponible |
| GPT-2 small | 124 M | 1024 tokens | en | MIT | Sí (evaluaciones originales de OpenAI) |
| SmolLM2-135M | 135 M | 8192 tokens | en (multilingüe parcial) | Apache 2.0 | Sí (model card de HuggingFace) |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | multilingüe | Apache 2.0 | Sí (model card de Qwen) |

Frente a estas alternativas, TestSubject-2 no aporta cifras verificables de calidad, ni contexto declarado, ni soporte multilingüe, y añade dos costes operativos: acceso restringido y dependencia de `custom_code`. Su única ventaja defendible es el tamaño reducido y el interés experimental de su arquitectura.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documentan datos de entrenamiento, tokenizador, hiperparámetros ni proceso de alineamiento, lo que impide evaluar sesgos y calidad de forma rigurosa.
- Riesgo de alucinación alto y no medido: al no haber benchmarks ni fase de instrucción documentada, la generación puede ser incoherente o factualmente incorrecta, especialmente en tareas de razonamiento.
- Sesgos desconocidos: sin información sobre el corpus, no se puede descartar sesgo de género, raza, religión o ideológico presente en los datos de preentrenamiento.
- Limitación idiomática: solo se declara inglés; el rendimiento en castellano no está soportado ni evaluado.
- Longitud de contexto desconocida: impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Incoherencia de tamaño: 86,5 GB de repositorio frente a 98,8 M de parámetros (≈0,4 GB en fp32). Puede indicar artefactos adicionales, pesos duplicados o un error en los metadatos; verificar antes de descargar.
- Riesgo de seguridad por `custom_code`: la carga con `trust_remote_code=True` ejecuta código del autor. Debe revisarse el código y aislarse en un entorno con permisos mínimos.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y automatizar la descarga en CI/CD solo con token.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero no cubre responsabilidades derivadas de los datos de entrenamiento ni de posibles reclamaciones de terceros; conviene conservar el aviso de licencia y el archivo NOTICE si se redistribuye.
- Nombre y contexto del repositorio: "TestSubject-2" y la ausencia de likes y de documentación sugieren un artefacto experimental sin garantías de mantenimiento; no se recomienda su uso en producción sin una evaluación previa propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CyanMonkey/TestSubject-2
- Perfil del autor: https://huggingface.co/CyanMonkey
- Otro repositorio del mismo autor, no relacionado (modelo de ajedrez "Test-S"): https://huggingface.co/CyanMonkey/Test-S
- Paper, blog técnico, repositorio de código o demo: no disponible en la información proporcionada.
