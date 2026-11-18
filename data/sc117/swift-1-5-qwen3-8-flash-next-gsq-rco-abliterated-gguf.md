# SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantización GGUF de tipo "abliterated" (dirección de rechazo eliminada) publicada por el usuario SC117 sobre el modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next, a su vez un derivado "reasoning-efficient" de Qwen3.8-Flash-Next. El modelo conserva la arquitectura Mixture-of-Experts del original, con 176.943.899.520 parámetros totales según los safetensors del repositorio, y se distribuye en formato GGUF para su uso con llama.cpp y entornos compatibles con endpoints.

La particularidad de esta release es el método de "tensor transplant": en lugar de reentrenar o aplicar abliteration sobre los pesos cuantizados, se sustituyen 144 tensores (los que escriben de vuelta en el residual stream) en las 48 capas del modelo por los correspondientes de una release abliterated ya existente, dejando intactos los valores y escalas GSQ aprendidos. Según la model card, el tamaño del archivo cambia menos del 0,2% y se preserva la eficiencia de razonamiento de Swift 1.5 (un 34,8% por debajo del base en tokens de pensamiento).

El resultado es un modelo multimodal (image-text-to-text) sin censura, orientado a red-teaming y a despliegues donde se requiere eliminar los rechazos del modelo original, con soporte declarado de inglés y chino y licencia Swift Open License 1.0. Es relevante ahora por su volumen de descargas (453.744) y porque demuestra una técnica de modificación de pesos cuantizados sin recuantizar, algo poco habitual en el ecosistema GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 48 capas |
| Parámetros totales | 176.943.899.520 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como "long-context") |
| Tipos de cuantización | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 (cuatro niveles) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repositorio | 307,1 GB |
| Rango de tamaño por archivo | 61,9 GB (Q2_0) a 77,8 GB (IQ3_S) |
| Pipeline | image-text-to-text |
| Modelo base | ukisai/Swift-Qwen3.8-Flash-Next (relación: quantized) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-Flash-Next original: un transformer MoE de 48 capas con 176.943.899.520 parámetros totales. Sobre esa base, UkisAI aplicó un post-entrenamiento "anti-overthinking" que da lugar a Swift 1.5, un derivado que, según la model card, emplea aproximadamente un 52% menos de tokens de pensamiento en benchmarks de código manteniendo la calidad. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto.

La release de SC117 no entrena el modelo: aplica una cuantización GSQ (learned quantization) con asignación de presupuesto RCO sobre los pesos de Swift 1.5 y, posteriormente, realiza un "tensor transplant" byte a byte. Se sustituyen 144 tensores en las 48 capas (los que escriben en el residual stream) por los de una release abliterated ya existente, sin tocar los valores ni las escalas GSQ. Cada tensor se verifica con hash blake2b por tensor. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento eficiente en tokens (reasoning-efficient, ~52% menos tokens de pensamiento en código según la model card).
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Capacidades multilingües limitadas a inglés y chino.
- Comportamiento "uncensored": la dirección de rechazo ha sido eliminada mediante abliteration, por lo que el modelo no declina peticiones que el original rechazaría.
- Orientado a red-teaming y evaluación de robustez.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada (aunque el modo de razonamiento sugiere capacidad de cadena de pensamiento).
- Contexto largo: etiquetado como "long-context", sin cifra concreta disponible.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve para generar respuestas que un modelo alineado rechazaría, permitiendo a equipos de seguridad probar filtros, clasificadores y salvaguardas frente a contenido sensible sin las fricciones de un modelo censurado.
- Investigación sobre abliteration: al preservar los pesos GSQ y sustituir solo 144 tensores, es un caso de estudio reproducible para medir el impacto de la eliminación de la dirección de rechazo sobre la calidad y la eficiencia de razonamiento.
- Generación de código en local: con cuantizaciones IQ3_S o IQ2_XS cabe en estaciones de trabajo con 48-80 GB de VRAM y permite ejecutar tareas de autocompletado y refactorización sin depender de APIs externas.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados en flujos de enriquecimiento de datos.
- Despliegue en llama.cpp con endpoints compatibles: la etiqueta endpoints_compatible facilita integrarlo en servidores OpenAI-compatible para prototipos internos.
- Experimentación con cuantizaciones extremas: los cuatro niveles (Q2_0 a IQ3_S) permiten comparar degradación de calidad frente a ahorro de memoria en un MoE de 177B parámetros.
- Análisis de contenido en inglés y chino: útil para equipos que trabajan con corpus bilingües en esos dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta la métrica relativa de eficiencia de razonamiento (34,8% por debajo del base en tokens de pensamiento, tras preservar la eficiencia de Swift 1.5) y el dato de que Swift 1.5 usa ~52% menos tokens de pensamiento en benchmarks de código, sin cifras absolutas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: entre 62 GB (Q2_0) y 78 GB (IQ3_S) solo para los pesos; añadir overhead de contexto KV, que en un MoE de 48 capas con contexto largo puede ser considerable.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (2× RTX 4090 de 24 GB no bastan para IQ3_S; sí para Q2_0 con offload parcial).
- Consumer GPU: no cabe en una única RTX 4090 (24 GB) ni en una RTX 3090; requiere offload a RAM/CPU o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y servidores compatibles con endpoints OpenAI; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9B (MoE) | no disponible (long-context) | swift-open-license-1.0 | GGUF | Abliterated, multimodal, 4 cuantizaciones |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176,9B (MoE) | no disponible | swift-open-license-1.0 | GGUF | Modelo base sin abliteration; misma eficiencia de razonamiento |
| ukisai/Swift-Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Base de Swift 1.5, sin post-entrenamiento anti-overthinking |
| Qwen3.8-Flash-Next (original) | no disponible | no disponible | no disponible | no disponible | Modelo de referencia del que deriva toda la familia |

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo: el modelo puede generar contenido dañino, ilegal o sensible sin filtros. No es apto para aplicaciones orientadas al público sin salvaguardas externas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser un modelo de razonamiento con modo de pensamiento, puede producir cadenas de razonamiento plausibles pero incorrectas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La licencia swift-open-license-1.0 es "other": es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El modelo solo se distribuye en GGUF y en cuantizaciones muy agresivas (Q2_0 a IQ3_S), lo que implica degradación de calidad respecto a los pesos originales en precisión completa.
- El "tensor transplant" se verificó con blake2b por tensor, pero no hay benchmarks que confirmen que la calidad se mantiene tras la sustitución; la única métrica publicada es la de eficiencia de razonamiento.
- No hay información sobre parámetros activos del MoE, longitud exacta de contexto ni soporte de tool calling, lo que dificulta planificar su integración en producción.
- El tamaño del repositorio (307,1 GB) y de cada archivo (62-78 GB) exige infraestructura de almacenamiento y descarga considerable.

## Enlaces

- Hugging Face: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (GGUF): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base original: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- Model card en chino: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
