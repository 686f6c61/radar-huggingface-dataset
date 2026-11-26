# PP12546/MiniPoalris-3-Lucy

## Resumen

MiniPolaris-3-Lucy es un modelo de lenguaje conversacional de 220,63 millones de parámetros entrenado desde cero por el autor independiente PP12546, con un enfoque explícito en el prototipado en dispositivo (edge) sobre hardware Intel Arc. No se presenta como un modelo de propósito general, sino como una prueba de concepto de un asistente chino con un conjunto fijo de herramientas, entrenado íntegramente (pretrain y SFT) en una única GPU Intel Arc B580 de 12 GB. Su relevancia radica en la documentación abierta del proceso completo de entrenamiento en XPU, incluyendo resultados negativos, y en su tamaño reducido, que lo hace desplegable en hardware muy modesto.

La arquitectura es un transformer denso de estilo Qwen3 con 16 capas, dimensión oculta 1024, 8 cabezas de atención (4 KV) y FFN de 3264, con RoPE theta 1e6 y una longitud máxima de posición de 32768 tokens (aunque el autor solo garantiza inferencia fiable hasta unos 16k). Emplea un tokenizador BPE propio de 9600 tokens con una compresión de 1,645 caracteres por token y se distribuye en float16 safetensors bajo licencia MIT.

El modelo no compite en capacidades generales: el propio autor lo limita a chat sencillo en chino, resumen y reescritura de textos cortos, y tool calling dentro de un conjunto fijo de ocho herramientas. Es, por tanto, un objeto de estudio para quienes investigan entrenamiento de bajo coste en XPU y modelos conversacionales pequeños, no una base para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Qwen3 |
| Parámetros totales | 220.632.064 (220,63 M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32768 posiciones máximas (RoPE theta 1e6); inferencia fiable ~16k; 32k/64k agotan memoria |
| Tipos de cuantización | No disponible (repo solo publica float16 safetensors) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT (con advertencia del autor sobre licencias de datos y código upstream) |
| Formato de pesos | safetensors (float16); configuración y tokenizador en JSON/Jinja |
| Dimensión oculta | 1024 |
| Capas | 16 |
| Cabezas de atención | 8 (4 KV), head_dim 128 |
| FFN | 3264 |
| Tokenizador | BPE propio de 9600 tokens, compresión 1,645 chars/token |
| Precisión de entrenamiento | bf16 |
| Tamaño del repo | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño transformer denso convencional con atención multi-cabeza agrupada (8 cabezas de consulta, 4 de clave/valor), normalización y FFN de tipo SwiGLU implícito en el estilo Qwen3, codificación posicional RoPE con theta 1e6 y una plantilla de chat de estilo Qwen. El tokenizador es un BPE entrenado específicamente para el proyecto con solo 9600 tokens, lo que explica su alta compresión en chino pero limita la cobertura léxica general.

El entrenamiento se realizó en una sola Intel Arc B580 de 12 GB. La fase de pretrain consumió 254 millones de tokens (aproximadamente 0,11 épocas según el autor), sobre la que se aplicaron fases de SFT y dos iteraciones adicionales (B3 y B4) con mezcla de datos de chat y de herramientas. El autor reporta el uso de `torch.compile` y atención con garbage collection (GC-attn), logrando unos 821 ms por paso con batch 2 y secuencia 2048; desactivar GC-attn provoca sobreventa de memoria WDDM y multiplica por cinco el tiempo por paso. También documenta que XPUGraph solo es viable para inferencia con formas fijas (5,13× de aceleración con buckets KV fijos) y falla al capturar el forward/backward de entrenamiento. No se menciona RLHF ni DPO; el ajuste es SFT supervisado.

## Capacidades

- Generación de texto conversacional en chino, con respuestas breves y directas cuando se usa el system prompt y los parámetros de decodificación recomendados.
- Tool calling sobre un conjunto fijo de ocho herramientas, tanto locales como vía API, con una tasa de llamadas válidas y ejecutadas de 6 a 7 sobre 8.
- Llamadas multi-herramienta con resultados variables (4 a 8 sobre 8 según la ejecución).
- Adaptación de nombres de herramientas al estilo TGW mediante un adaptador en tiempo de ejecución (3 de 3 aciertos en las pruebas del autor).
- Resumen y reescritura de textos cortos.
- Capacidad limitada de inglés, aunque el entrenamiento y las evaluaciones se centran en chino.
- No soporta visión, audio, modo thinking explícito ni razonamiento multi-paso robusto.

## Casos de uso

- Prototipado de asistentes conversacionales en chino sobre hardware Intel Arc: el modelo cabe en 12 GB en float16 y permite iterar localmente sin GPU de datacenter, útil para validar plantillas de chat y flujos de diálogo.
- Demostración de tool calling con un catálogo cerrado de herramientas: adecuado para enseñar el patrón de function calling en un entorno controlado donde las herramientas están predefinidas y no se requiere generalización abierta.
- Investigación sobre entrenamiento en XPU: el repositorio incluye un informe con curvas de pérdida, tiempos por paso y resultados negativos, lo que lo convierte en material de referencia para quienes entrenan en GPUs Intel.
- Pruebas de decodificación y ajuste de hiperparámetros: el autor documenta que la configuración por defecto obtiene 4/10 en su batería de prompts y la recomendada 8/10, lo que permite estudiar el impacto de temperatura, top_p y penalizaciones de repetición en modelos pequeños.
- Generación de resúmenes y reescrituras de textos cortos en chino dentro de pipelines de preprocesado, siempre con revisión humana y sin requisitos de fidelidad factual.
- Evaluación comparativa de tokenizadores de vocabulario reducido: su BPE de 9600 tokens sirve para medir el equilibrio entre compresión en chino y cobertura léxica en tareas multilingües.
- Base para experimentos de destilación o fine-tuning posterior en entornos con recursos muy limitados, dado su tamaño y licencia permisiva.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones internas del autor, no resultados de rankings oficiales.

| Métrica | Resultado |
|---|---|
| Perplejidad de validación en pretrain | 35,07 a 1280 tokens; 35,46 a 2048 tokens |
| Chat, 10 prompts fijos, decodificación por defecto | 4/10 |
| Chat, 10 prompts fijos, parámetros recomendados | 8/10 |
| Tool calling (8 herramientas fijas, local/API) | 6–7/8 válidas y ejecutadas |
| Multi-tool calling | 4–8/8 (con fluctuación aleatoria) |
| Adaptación de nombres de herramientas estilo TGW | 3/3 |
| Contexto largo | Generación usable a 16k; 32k y 64k agotan memoria |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 0,45 GB para los pesos en float16, más caché KV; con contexto de 16k la huella crece de forma notable pero permanece muy por debajo de los 12 GB de la GPU de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 4–6 GB de VRAM para inferencia en float16; el autor lo validó en Intel Arc B580 (12 GB). Funciona también en GPUs NVIDIA consumer (RTX 3060 en adelante) y en CPU.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 6 GB o más, e incluso en iGPU con memoria compartida para contextos cortos.
- Opciones de despliegue: transformers (ruta documentada), text-generation-inference (etiqueta del repo) y endpoints compatibles; no se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles para inferencia; el autor solo reporta 821 ms por paso en entrenamiento (batch 2, secuencia 2048) y una aceleración de 5,13× con XPUGraph en decodificación de formas fijas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MiniPolaris-3-Lucy | 220,63 M | 32k nominal, ~16k fiable | zh, en | MIT | Entrenado en Intel Arc B580; tool calling sobre conjunto fijo |
| Qwen3 pequeños (familia) | No disponible en la información | No disponible | Multilingüe | No disponible | Referencia arquitectónica del modelo; no se dispone de datos comparativos |
| MiniMind (upstream) | No disponible en la información | No disponible | No disponible | Apache-2.0 (código) | Proyecto de origen del pipeline de entrenamiento |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo restringe a investigación, demos en dispositivo y experimentos con conjuntos fijos de herramientas; desaconseja explícitamente su uso en producción o en decisiones de alto riesgo.
- No es fiable para conocimiento general, preguntas factuales ni generalización a herramientas no vistas durante el entrenamiento.
- El tool calling multi-herramienta y la generación de JSON estable presentan fluctuaciones y fallos frecuentes.
- El contexto efectivo es de unos 16k tokens; más allá se produce agotamiento de memoria y el modelo no fue entrenado de forma nativa para 32k.
- El tokenizador de 9600 tokens limita la cobertura léxica y el rendimiento en inglés y en dominios especializados.
- Riesgo elevado de alucinación en cualquier consulta fuera del dominio conversacional simple.
- La licencia del repositorio es MIT, pero el autor advierte que los datos y el tokenizador son de creación propia sin auditoría completa de licencias, y que el código upstream de MiniMind es Apache-2.0; en caso de conflicto prevalecen las licencias de datos y upstream.
- Modelo con cero descargas y cero likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PP12546/MiniPoalris-3-Lucy
- Informe técnico del proyecto (incluido en el repo): `docs/report-220m.pdf`
- Hoja de ruta del proyecto (incluida en el repo): `docs/roadmap.png`
- Proyecto MiniPolaris (repositorio interno, no público según el autor): no disponible
- Proyecto MiniMind (código upstream, Apache-2.0): no disponible en la información proporcionada
