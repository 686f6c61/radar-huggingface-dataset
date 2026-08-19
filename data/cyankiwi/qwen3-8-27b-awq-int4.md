# cyankiwi/Qwen3.8-27B-AWQ-INT4

## Resumen

El modelo `cyankiwi/Qwen3.8-27B-AWQ-INT4` es una versión cuantizada con AWQ-INT4 del modelo Qwen3.8-27B, desarrollado por el usuario cyankiwi. El modelo base, creado por el equipo Qwen de Alibaba, es un modelo de lenguaje causal con codificador de visión (image-text-to-text) que integra una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention). Con 27.781 millones de parámetros y una ventana de contexto nativa de 262.144 tokens (extensible hasta 1 millón), está diseñado para tareas de razonamiento complejo, codificación, trabajo profesional y ejecución de agentes de larga duración.

La cuantización AWQ-INT4 reduce el tamaño del modelo a aproximadamente 21 GB, lo que facilita su despliegue en hardware más asequible sin renunciar a las capacidades del modelo original. Incluye soporte nativo para comprensión de imágenes y vídeos, modo de pensamiento (thinking mode) activable o desactivable por petición, y control fino del esfuerzo de razonamiento mediante el parámetro `reasoning_effort`. Su licencia Apache-2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integraciones en producción.

Este lanzamiento es relevante porque combina las mejoras de la generación Qwen3.8 (agentes más fiables, mejor manejo de feedback del entorno y compatibilidad con herramientas populares) con una optimización de tamaño que lo hace viable en GPUs de consumo medio-alto, como la RTX 4090 o la A100 de 40 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con vision encoder; híbrido Gated DeltaNet (atención lineal) + Gated Attention (atención completa) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | AWQ-INT4 (esta versión) |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention). El layout interno es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, donde cada bloque Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. La dimensión oculta es 5120 y el FFN tiene dimensión intermedia 17.408. Incluye además un mecanismo de Multi-Token Prediction (MTP) entrenado con múltiples pasos, que mejora la eficiencia de decodificación.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque no se detallan los datos utilizados. La cuantización AWQ-INT4 fue realizada por cyankiwi utilizando un dataset de calibración específico denominado "STEM and Agentic" (disponible en HuggingFace), orientado a preservar el rendimiento en tareas científicas y de agente. El modelo resultante mantiene compatibilidad con el ecosistema transformers y motores de inferencia como vLLM, SGLang y TokenSpeed.

## Capacidades

- Generación de texto y razonamiento complejo en 10 idiomas (inglés, chino, hindi, árabe, ruso, japonés, coreano, neerlandés, francés y español).
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos escaneados y vídeos de hasta una hora de duración.
- Modo de pensamiento (thinking mode) activado por defecto, desactivable por petición; permite ajustar la profundidad de razonamiento con `reasoning_effort` y conservar el contexto de razonamiento histórico mediante `preserve_thinking`.
- Soporte para tool calling y function calling, lo que permite integrar el modelo en pipelines de agentes que interactúan con APIs y entornos externos.
- Ejecución de tareas agénticas de larga duración con planificación autónoma y manejo de feedback del entorno.
- Multi-Token Prediction (MTP) para acelerar la generación de texto.
- Compatibilidad con motores de inferencia populares (vLLM, SGLang, TokenSpeed) y con el ecosistema Hugging Face Transformers.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y mantener el hilo de razonamiento gracias a `preserve_thinking`, lo que permite resolver incidencias complejas sin perder información previa.
- Análisis de documentos técnicos con imágenes: al ser un modelo de visión-lenguaje, puede extraer información de diagramas, gráficos y capturas de pantalla dentro de informes o manuales, facilitando tareas de investigación y soporte técnico.
- Agentes autónomos de automatización de tareas: con soporte para tool calling y planificación multi-paso, puede ejecutar flujos de trabajo como gestión de correos, actualización de bases de datos o coordinación de APIs, reduciendo la intervención humana.
- Generación de código en producción: integrable en pipelines de CI/CD para revisión de código, generación de tests o autocompletado, aprovechando su capacidad de razonamiento y su contexto amplio para mantener coherencia en proyectos extensos.
- Razonamiento matemático y científico: adecuado para resolver problemas de STEM, verificar demostraciones o asistir en investigación, gracias a su calibración específica en datasets STEM y su modo de pensamiento profundo.
- Procesamiento de vídeo para vigilancia o análisis de contenido: su capacidad de entender vídeos de larga duración permite resumir secuencias, detectar eventos o transcribir diálogos en aplicaciones de seguridad o medios.
- Asistente multilingüe de documentación: puede traducir, resumir o redactar contenido en los 10 idiomas soportados, manteniendo el contexto de documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base menciona una sección de "Benchmark Results", pero los datos concretos no se han extraído en la documentación proporcionada. Se recomienda consultar la página del modelo base Qwen/Qwen3.8-27B para obtener métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) y tener en cuenta que la cuantización AWQ-INT4 puede introducir una ligera degradación respecto al modelo en precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21 GB para los pesos cuantizados (INT4), más memoria adicional para activaciones y KV cache. Con contexto largo (262K tokens), se recomienda al menos 40 GB de VRAM para evitar desbordamientos.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100, RTX 4090 (24 GB) con cuantización adicional o contexto reducido, RTX 6000 Ada (48 GB).
- En GPUs de consumo: cabe en una RTX 4090 (24 GB) si se limita la longitud de contexto o se usa una cuantización más agresiva (por ejemplo, AWQ-3-bit), aunque el rendimiento puede verse afectado.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, y servicios gestionados como Qwen Cloud (próximamente).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, la longitud de contexto y el uso de MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | Apache-2.0 | FP16/BF16 | Modelo original sin cuantizar |
| cyankiwi/Qwen3.8-27B-AWQ-INT4 | 27B | 262K (ext. 1M) | Apache-2.0 | AWQ-INT4 | Versión cuantizada, 21 GB |
| Qwen3.5-27B (si existe) | 27B | No disponible | Apache-2.0 | No disponible | Generación anterior, sin datos concretos |
| Gemma-2-27B | 27B | 8K | Gemma License | No disponible | Modelo denso de Google, sin visión nativa |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparativa se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible; como modelo entrenado con datos web, puede reflejar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje; se recomienda verificar respuestas en aplicaciones críticas, especialmente en tareas de razonamiento o generación de código.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, la extensión a 1M puede degradar la calidad de las respuestas en los extremos de la ventana; se recomienda probar en el caso de uso concreto.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de licencia y atribución correspondiente.
- Cuantización AWQ-INT4: puede introducir pérdida de precisión en tareas numéricas o de razonamiento complejo; se recomienda evaluar el modelo cuantizado frente al base en los benchmarks relevantes.
- Estado del modelo: el repositorio tiene 0 descargas y fue creado recientemente (agosto de 2026), por lo que no hay validación comunitaria extensa ni garantías de soporte a largo plazo.
- Compatibilidad: aunque es compatible con vLLM, SGLang y TokenSpeed, la integración con herramientas específicas puede requerir ajustes; se recomienda verificar la versión de la librería.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-INT4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Dataset de calibración (STEM and Agentic): https://huggingface.co/datasets/cyankiwi/calibration-medium
- Qwen Cloud (servicio gestionado, próximamente): https://www.qwencloud.com/models/qwen3.8-27b
