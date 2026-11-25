# josie-labs/Qwen3.5-4B-gabliterated

## Resumen

Qwen3.5-4B-gabliterated es una modificación de pesos del modelo multimodal Qwen/Qwen3.5-4B, publicada por josie-labs (atribuida en la model card a Gökdeniz Gülmez). No se trata de un fine-tuning: aplica la técnica Gabliteration, descrita en el paper arXiv:2512.18901, que identifica un subespacio de direcciones de rechazo en los estados residuales del modelo y lo proyecta fuera de las matrices que escriben en el flujo residual. El resultado es un modelo con la misma arquitectura y capacidades que el original, pero con la conducta de rechazo reducida de forma selectiva.

El modelo conserva la pila híbrida de Qwen3.5: 32 capas, de las cuales 24 son Gated DeltaNet y 8 son atención completa con compuerta. Cuenta con 4.659.865.088 parámetros totales (4,21B en el modelo de lenguaje) y una ventana de contexto de 262.144 tokens. Incluye un codificador visual de 24 capas con dimensión oculta 1.024, que según la model card permanece bit a bit idéntico al original, igual que la cabeza MTP. Solo se editaron 42 matrices de pesos en 21 de las 32 capas.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de modificación de conducta sin reentrenamiento sobre un modelo multimodal de contexto largo; por otro, advierte de que las métricas de reducción de rechazo publicadas dependen fuertemente del método de medición. El modelo tiene licencia Apache 2.0, está pensado para uso en inglés y su pipeline es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated DeltaNet + 8 capas de atención completa con compuerta (gated full attention) |
| Parametros totales | 4.659.865.088 (4,66B); 4,21B corresponden al modelo de lenguaje |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en bf16; se menciona soporte MLX, sin detallar cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con MLX (mlx-vlm / mlx-lm) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con 32 capas: 24 capas de Gated DeltaNet (atención lineal con estado recurrente) y 8 capas de atención completa con compuerta. La dimensión oculta es 2.560, la dimensión de MLP es 9.216, hay 16 cabezas de atención (4 de KV) y un vocabulario de 248.320 entradas con embeddings atados. El codificador visual tiene 24 capas con dimensión oculta 1.024 y no fue modificado. La ventana de contexto alcanza 262.144 tokens.

Sobre el entrenamiento original de Qwen3.5-4B no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO): no disponible. La modificación aplicada, Gabliteration, no implica entrenamiento. El procedimiento extrae estados residuales del último token para prompts dañinos (mlabonne/harmful_behaviors) y benignos (mlabonne/harmless_alpaca), calcula una puntuación de separabilidad por capa y elige la capa 29 (separabilidad 30,26). En esa capa, los k=1 vectores singulares derechos principales de las diferencias dañino-menos-benigno forman el subespacio de rechazo R. Después se elimina la proyección ridge P = R(RᵀR + λI)⁻¹Rᵀ, con λ = 0,1, escalada por un α_l adaptativo por posición, de cada proyección que escribe en el flujo residual de las capas seleccionadas: `linear_attn.out_proj` en las capas DeltaNet, `self_attn.o_proj` en las de atención completa y `mlp.down_proj`. Los hiperparámetros son α_base = 0,8, β = 0,5 y α por capa entre 0,80 y 1,00, con búsqueda en rejilla sobre el conjunto de capas para quedarse con la configuración de menor KL que alcanza la tasa de rechazo objetivo (10%). Se editaron las capas 9 a 29.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), gracias al codificador visual intacto.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-4B.
- Procesamiento de contexto muy largo: hasta 262.144 tokens, útil para documentos extensos o conversaciones prolongadas.
- Modo thinking: la evaluación del autor se realizó con thinking desactivado, lo que implica que el modelo soporta ese modo, aunque no se detallan sus resultados.
- Uso mediante `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`) y mediante MLX en Apple Silicon (`mlx_vlm.generate`, `mlx_lm.generate`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Procesamiento de documentos largos con imágenes: el modelo puede recibir un PDF escaneado o capturas y responder preguntas sobre su contenido aprovechando la ventana de 262.144 tokens, sin necesidad de trocear el material en fragmentos pequeños.
- Análisis de imágenes en flujos de investigación: al conservar el codificador visual original, sirve para describir, clasificar o extraer información de figuras, gráficos y fotografías dentro de un pipeline multimodal en inglés.
- Evaluación de robustez y alineación: es un artefacto útil para estudiar cómo la eliminación del subespacio de rechazo afecta a la conducta del modelo, comparando sus respuestas con las del Qwen3.5-4B original en conjuntos de prompts controlados.
- Investigación sobre edición de pesos: sirve como referencia reproducible (script `gabliterate.py`, configuración en `gabliteration.json`) para quienes quieran aplicar o comparar técnicas de modificación de conducta sin fine-tuning.
- Prototipado local en Apple Silicon: con MLX y 9,3 GB de pesos, se puede desplegar en un Mac con 32 GB de memoria unificada para pruebas de concepto multimodales sin infraestructura de GPU dedicada.
- Generación de contenido en inglés sin restricciones de rechazo: para casos donde el modelo original declina peticiones legítimas por sobrerrechazo, esta variante puede responder con mayor frecuencia, siempre bajo responsabilidad del operador.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de rechazo y divergencia KL, no benchmarks estándar de capacidad.

| Metrica | Qwen3.5-4B | Qwen3.5-4B-gabliterated |
|---|---:|---:|
| Tasa de rechazo (palabras clave), 100 prompts dañinos reservados | 99% | 2% |
| KL del primer token frente al original, 100 prompts benignos | 0 | 0,0497 |
| Tasa de rechazo juzgada por Qwen/Qwen3.5-9B (mismas completaciones, pesos bf16) | 99% | 84% |

El propio autor advierte que la métrica por palabras clave es aproximada: no detecta rechazos suaves y puede marcar respuestas que citan frases de rechazo. La evaluación con modelo juez sobre completaciones de 48 tokens indica que el modelo sigue declinando la mayoría de los prompts dañinos de prueba (84%). No se han ejecutado benchmarks estándar (MMLU, HumanEval, GSM8K) sobre este checkpoint: no disponible.

## Requisitos de hardware

- Pesos en safetensors bf16: 9,3 GB de repositorio, lo que requiere aproximadamente 10-11 GB de memoria solo para los pesos, más overhead de activaciones y caché KV.
- Inferencia en bf16: viable en GPUs con 24 GB o más (RTX 3090, RTX 4090, L40S) y en A100/H100 para mayor throughput y contextos largos.
- Contexto completo de 262.144 tokens: la caché KV crece de forma lineal con la longitud; para aprovechar la ventana completa se recomienda A100 80 GB o H100, o bien cuantización y atención eficiente.
- Consumer GPU: cabe en RTX 4090 (24 GB) en bf16 para contextos moderados; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) requiere cuantización a 8 bits o 4 bits.
- Apple Silicon: probado por el autor en un M4 de 10 núcleos de GPU y 32 GB de memoria unificada con MLX 0.32.3 y mlx-lm 0.32.2; el proceso de modificación tardó 19 minutos y 11 segundos.
- Opciones de despliegue: `transformers` (referencia oficial), MLX (`mlx_vlm.generate` para multimodal, `mlx_lm.generate` para solo texto). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| josie-labs/Qwen3.5-4B-gabliterated | 4,66B | 262.144 | Sí (image-text-to-text) | Apache 2.0 | Rechazo reducido por edición de pesos; sin benchmarks estándar publicados |
| Qwen/Qwen3.5-4B (base) | 4,66B | 262.144 | Sí | Apache 2.0 | Modelo original; tasa de rechazo del 99% en la evaluación del autor |
| Otros derivados abliterated de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

La comparación relevante es contra el modelo base, del que este checkpoint solo difiere en 42 matrices. Frente a alternativas de otros desarrolladores no se dispone de datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa: no disponible.

## Limitaciones y advertencias

- La reducción de rechazo es real pero parcial: con un juez automático, el 84% de los prompts dañinos de prueba siguen siendo rechazados. La cifra del 2% procede de coincidencia de palabras clave y sobreestima la supresión efectiva del rechazo.
- El modelo cumplirá peticiones que el original declinaba; el operador es responsable del uso y del despliegue.
- El valor KL de 0,0497 mide solo la divergencia en el primer token sobre 100 prompts benignos, no el deterioro general de capacidades. No hay benchmarks estándar que confirmen que el rendimiento se mantiene.
- Riesgo de alucinación: no cuantificado en la información disponible; se hereda el del modelo base, sin datos específicos.
- Idiomas: solo se declara inglés; el comportamiento en castellano u otros idiomas no está evaluado.
- Sesgos: no se documentan evaluaciones de sesgo para este checkpoint ni para el base en la información proporcionada.
- La model card usa como `model_id` de ejemplo `Goekdeniz-Guelmez/Qwen3.5-4B-gabliterated`, distinto del ID del repositorio (`josie-labs/Qwen3.5-4B-gabliterated`); conviene verificar la ruta correcta antes de descargar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero no exime de las obligaciones de atribución ni de las responsabilidades legales sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josie-labs/Qwen3.5-4B-gabliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper de Gabliteration (arXiv:2512.18901): https://arxiv.org/abs/2512.18901
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts benignos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Evaluación de rechazo del autor: `eval_refusal.json` (incluido en el repositorio)
- Configuración de la modificación: `gabliteration.json` (incluido en el repositorio)
- Script de reproducción: `gabliterate.py` (incluido en el repositorio)
