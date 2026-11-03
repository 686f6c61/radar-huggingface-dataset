# moravianai/ThinCtx-Qwen3.5-0.8B

## Resumen

ThinCtx-Qwen3.5-0.8B es una conversión del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por Moravian AI bajo el nombre de familia ThinCtx. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto que modifica la gestión de memoria de la caché de contexto: el runtime propietario `thinctx` mantiene en la GPU solo una fracción pequeña del contexto y delega el resto en memoria de sistema. Según la model card, el consumo de VRAM asociado al contexto crece aproximadamente 15 veces más despacio que en el modelo base: 0,47 GB frente a 6,2 GB con 540.000 tokens de contexto.

El modelo conserva la arquitectura y los pesos del Qwen3.5-0.8B original (16 bits, sin cuantizar en esta variante) y está pensado para escenarios de contexto largo donde la memoria de la GPU es el cuello de botella. El repositorio ocupa 1,6 GB y declara 752.393.024 parámetros reales en safetensors, aunque el nombre comercial hable de 0,8B.

Es relevante ahora porque propone una vía alternativa al escalado de ventana de contexto basada únicamente en atención eficiente: separar el almacenamiento del contexto del dispositivo de cómputo. A cambio, introduce dependencia total de un runtime específico, pérdida acusada de capacidades de tool calling respecto al base y un rendimiento flojo en checo y alemán, lo que limita seriamente su uso en producción sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, tipo `qwen3_5_text`), con gestión de caché de contexto modificada por el runtime ThinCtx |
| Parámetros totales | 752.393.024 (safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 540.000 tokens documentados en la model card; no se especifica el máximo absoluto |
| Tipos de cuantización | esta variante: pesos en 16 bits; variante `-small`: pesos a ~5,5 bits por peso; contexto comprimido 2,5–3× con `--compress_context` (thinctx ≥ 1.0.2) |
| Idiomas soportados | multilingüe, inglés, checo, alemán (checo y alemán débiles, heredado del base) |
| Licencia | PolyForm Small Business 1.0.0 (`license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5 con plantilla de chat propia y soporte de `enable_thinking`. Moravian AI no ha reentrenado el modelo: la conversión ThinCtx actúa sobre el almacenamiento y la recuperación de la caché KV, manteniendo en GPU una porción reducida del contexto y guardando el resto en RAM del sistema, de modo que el coste de memoria por token en VRAM es mucho menor que en el base. La model card cifra esa reducción en 0,47 GB frente a 6,2 GB a 540k tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se detallan en la información proporcionada. La innovación técnica destacable es el propio runtime `thinctx`, que requiere Linux x86_64 o WSL2 con GPU NVIDIA (macOS no soportado), compila un launcher Triton en el primer arranque y expone un servidor compatible con la API de chat-completions de OpenAI. La variante `-small` añade compresión del almacén de contexto, reutilizable en esta variante mediante `--compress_context`.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat de Qwen3.5.
- Razonamiento con modo thinking (`enable_thinking` en el servidor compatible con OpenAI).
- Contexto largo: lectura de documentos y conversaciones de hasta 540k tokens con consumo de VRAM contenido.
- Tool calling y function calling: presentes en la API del runtime, pero degradados (BFCL non-live 28,7 % frente a 53,5 % del base).
- Capacidades multilingües nominales (inglés, checo, alemán), con calidad débil en checo y alemán.
- Sin soporte de visión ni audio según la información disponible.
- Endpoint HTTP compatible con OpenAI, con streaming y autenticación básica opcional.

## Casos de uso

- Análisis de documentos extensos en GPU de gama media: cargar contratos, informes o expedientes de cientos de miles de tokens manteniendo la caché en RAM del sistema y liberando VRAM para los pesos y el cómputo.
- Asistentes de lectura de código en repositorios grandes: indexar un árbol de fuentes completo en una sola ventana de contexto para responder preguntas de arquitectura, aceptando que el tool calling es limitado.
- Resumen y extracción de información sobre corpus largos en inglés: pipelines por lotes donde la latencia de lectura del prompt es tolerable y prima el ahorro de memoria.
- Prototipado e investigación sobre gestión de contexto: banco de pruebas para comparar estrategias de caché fuera de GPU frente al modelo base, dado que la licencia permite evaluación por cualquiera.
- Chat de soporte en inglés con historiales muy largos: conversaciones multi-turno que crecen sin agotar la VRAM, siempre que no se requiera invocar herramientas externas.
- Despliegue en estaciones de trabajo con una sola GPU consumer: servir el modelo vía `thinctx serve` en Linux o WSL2 cuando el presupuesto de VRAM no permite el base con contexto equivalente.

## Benchmarks y rendimiento

| Benchmark | ThinCtx-Qwen3.5-0.8B | Qwen3.5-0.8B (base) |
|---|---|---|
| BFCL non-live (tool calling) | 28,7 % | 53,5 % |
| RULER a 64k tokens | 71 | 83 |
| Memoria de contexto a 540k tokens | 0,47 GB | 6,2 GB |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales. La model card indica además que la lectura de prompts largos es más lenta que en el modelo base, sin cifras concretas de latencia o throughput.

## Requisitos de hardware

- VRAM: pesos en 16 bits de un modelo de ~752M parámetros, más una fracción pequeña de contexto en GPU (0,47 GB a 540k tokens según la card); el resto del contexto reside en RAM del sistema.
- RAM del sistema: proporcional a la longitud del contexto almacenado; con `--compress_context` se reduce aproximadamente 2,5×.
- GPU: NVIDIA obligatoria; la rueda por defecto de PyTorch 2.11 requiere driver con soporte CUDA 13 (existe rueda cu128 para drivers antiguos). No se especifican modelos concretos recomendados (A100, H100, RTX 4090) en la información disponible.
- Compatibilidad con GPU consumer: plausible por el tamaño de pesos, pero no confirmada explícitamente en la model card.
- Plataformas: Linux x86_64 o Windows 10/11 vía WSL2; macOS no soportado. El reparto de memoria entre conversaciones es nativo solo en Linux.
- Despliegue: exclusivamente runtime `thinctx` (≥ 0.2.0; ≥ 1.0.2 para contexto comprimido; 1.0.1 o superior recomendado). No compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: no disponibles; la card solo indica que la lectura de prompts largos es más lenta que en el base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling (BFCL non-live) | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-0.8B | 752M | hasta 540k documentados | 28,7 % | PolyForm Small Business 1.0.0 | thinctx (propietario) |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible en la información | 53,5 % | la del modelo base (no detallada aquí) | ecosistema estándar (no detallado) |
| ThinCtx-Qwen3.5-2B | no disponible | no disponible | no disponible (recomendado por el autor para agentes) | PolyForm Small Business 1.0.0 | thinctx |
| ThinCtx-Qwen3.5-4B | no disponible | no disponible | no disponible (recomendado por el autor para agentes) | PolyForm Small Business 1.0.0 | thinctx |

## Limitaciones y advertencias

- Tool calling muy degradado: 28,7 % en BFCL non-live frente a 53,5 % del base, incluso con prompts cortos. El autor desaconseja su uso para agentes y recomienda las variantes 2B o 4B.
- Pérdida de rendimiento en contexto largo superior a la de las variantes mayores: RULER a 64k cae a 71 frente a 83 del base.
- Checo y alemán débiles: hereda los errores gramaticales y los cambios de idioma del Qwen3.5-0.8B; la conversión no añade habilidad lingüística.
- Dependencia total del runtime `thinctx`: sin él, los pesos no ofrecen la ventaja de memoria y no se garantiza su funcionamiento en otras librerías de inferencia.
- Restricciones de plataforma: solo Linux x86_64 y WSL2 con GPU NVIDIA; macOS no soportado y el reparto de memoria entre conversaciones no funciona en WSL.
- Licencia PolyForm Small Business 1.0.0: uso gratuito para pequeñas empresas, uso personal, investigación no comercial, educación y evaluación; las organizaciones mayores en producción necesitan licencia comercial de Moravian AI.
- Riesgo de alucinación inherente a un modelo de 0,8B, agravado en contextos muy largos donde la recuperación de información distante es menos fiable.
- El acceso al repositorio está condicionado a un formulario de aceptación (gated) con datos de contacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-0.8B
- Variante cuantizada y con contexto comprimido: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-0.8B-small
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio del desarrollador: https://moravian.ai/
- Contacto para licencia comercial: info@moravian.ai
