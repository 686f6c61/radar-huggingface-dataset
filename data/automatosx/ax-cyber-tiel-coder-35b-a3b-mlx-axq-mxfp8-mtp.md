# AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP es un checkpoint cuantizado de precisión mixta en formato MLX, publicado por AutomatosX para ejecución en Apple Silicon. Se deriva del modelo base peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP, que a su vez pertenece a la familia Qwen3.5-MoE con arquitectura `Qwen3_5MoeForConditionalGeneration`. El paquete aplica la herramienta propietaria AXQuant (AXQ) 1.9.0 sobre el modelo en BF16, manteniendo la cabeza de predicción multi-token (MTP) y la torre de visión en BF16 mientras cuantiza la ruta de lenguaje.

El modelo cuenta con 35,11 mil millones de parámetros lógicos en una arquitectura de mezcla de expertos (MoE), con una ventana de contexto configurada de 262.144 tokens. El checkpoint ocupa 38,82 GB en safetensors MLX y presenta un BPW medido de 8,4611 en el modelo principal y 8,6383 incluyendo la cabeza MTP. Está etiquetado como modelo de desarrollo y orientado a tareas de código y conversación, con capacidades de visión declaradas.

La relevancia de esta ficha radica en que se trata de un artefacto de evidencia de desarrollo, no de una release certificada: el propio autor advierte que no publica mediciones de calidad, contexto largo, velocidad de kernels ni exactitud de MTP. Es útil para desarrolladores que quieran evaluar el pipeline AXQuant en hardware Apple, pero no debe tratarse como un modelo listo para producción sin validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE, transformer con mezcla de expertos) |
| Parametros totales | 35.107.180.016 (35,11B lógicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados; límite práctico dependiente de memoria unificada |
| Tipos de cuantizacion | AXQuant (AXQ) precisión mixta, clase de presupuesto MXFP8, base 9p4bpw, BPW medido 8,4611 (principal) y 8,6383 (total con MTP) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de la familia Qwen3.5-MoE, con 35,11B parámetros lógicos y una ruta de texto optimizada. La arquitectura incluye una cabeza de predicción multi-token (MTP) y una torre de visión, ambas preservadas en BF16 en el checkpoint cuantizado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación técnica principal de este paquete es el pipeline AXQuant 1.9.0, que aplica cuantización de precisión mixta por módulo: los tensores protegidos permanecen en mayor precisión (8 bits o BF16) mientras otros se comprimen para alcanzar el presupuesto de almacenamiento. El autor documenta una auditoría de formato de runtime (2026-10-06) que corrigió el modo del contenedor de cuantización de `affine` a `mxfp8` tras inspeccionar las cabeceras de cada módulo cuantizado, sin cambiar los bytes de pesos ni las asignaciones de precisión. No hay evidencia publicada de exactitud de MTP, velocidad de kernels ni calidad de generación.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado `text-generation` y `conversational`.
- Capacidades de código y desarrollo, según la etiqueta `development` y el nombre del modelo (Coder).
- Visión: la torre de visión está presente en el checkpoint (`Vision present: True`), aunque MLX-LM puede ignorar el sidecar `vision.safetensors`.
- Predicción multi-token (MTP): cabeza presente (`MTP present: True`), aunque su aceleración no está validada en este release.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Audio: no soportado (`Audio present: False`).

## Casos de uso

- Evaluación del pipeline AXQuant en Apple Silicon: usar el checkpoint para validar que la conversión de precisión mixta carga y genera texto correctamente con MLX-LM, comparando el BPW medido con el planificado.
- Generación de código asistida en estaciones de trabajo Mac: el modelo puede integrarse en editores o CLI locales mediante `mlx_lm.generate`, aprovechando la cuantización para reducir el uso de memoria unificada frente al BF16.
- Prototipado de asistentes conversacionales en local: con 262.144 tokens de contexto configurado, permite probar conversaciones de contexto largo en hardware Apple sin depender de la nube, aunque el límite práctico depende de la memoria disponible.
- Investigación sobre cuantización de precisión mixta: el paquete incluye `runtime_audit.json` con enlaces fijados de configuración, índice y cabeceras, útil para estudiar cómo AXQuant asigna precisión por módulo.
- Pruebas de conservación de torre de visión: al mantener la torre en BF16, sirve para experimentar con entradas multimodales en MLX, verificando si el runtime carga el sidecar de visión.
- Benchmarking interno de MTP: aunque el autor no publica métricas, un equipo puede medir la ganancia de la cabeza MTP en su propio hardware y compararla con la ruta de texto estándar.
- Reproducibilidad de despliegues: fijar un commit del Hub y verificar la integridad de los artefactos para pipelines de CI que necesiten pesos MLX deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de benchmark.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo pesa 38,82 GB en safetensors; se recomienda al menos 48 GB de memoria unificada para cargar el modelo y dejar margen para el contexto y los buffers de inferencia.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (familias M-series Pro, Max y Ultra). No está pensado para GPU NVIDIA ni ROCm, ya que el formato es MLX.
- Cabe en consumer GPU: no en el sentido de GPU dedicada; en Apple Silicon, modelos con 64 GB o más de memoria unificada son los candidatos realistas.
- Opciones de despliegue: MLX-LM (runtime principal documentado, con MLX 0.32.1 y MLX-LM 0.31.3 registrados en la conversión). AX Engine no está establecido: no hay `model-manifest.json` nativo validado.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP | 35,11B lógicos (MoE) | 262.144 | AXQ MXFP8, 8,46 BPW principal | Apache 2.0 | MLX Safetensors en Hugging Face |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP (hermano) | 35,11B lógicos (MoE) | no disponible | AXQ 4bit, BPW a verificar | Apache 2.0 | MLX Safetensors en Hugging Face |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP (hermano) | 35,11B lógicos (MoE) | no disponible | AXQ 6bit, BPW a verificar | Apache 2.0 | MLX Safetensors en Hugging Face |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP (base) | 35,11B lógicos (MoE) | no disponible | oQ6e | no disponible | MLX Safetensors en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de evidencia de desarrollo: el autor advierte explícitamente que no es una release AXQuant certificada y que no publica mediciones de calidad, contexto largo, velocidad de kernels ni exactitud de MTP.
- Aviso de reconstrucción: el paquete será reconstruido con una versión mejorada de AXQuant y reemplazado como nueva revisión; los archivos actuales quedan en el historial, por lo que conviene fijar un commit.
- Ejecución nativa AX Engine no establecida: no hay `model-manifest.json` validado; los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad, no evidencia observada.
- MLX-LM puede ignorar metadatos de AXQuant y sidecars opcionales (`vision.safetensors`, `mtp.safetensors`), por lo que la aceleración MTP y la calidad visión-lenguaje no quedan garantizadas con el comando documentado.
- Formato exclusivo MLX: no incluye pesos PyTorch ni GGUF, lo que limita su uso a ecosistema Apple Silicon y descarta vLLM, llama.cpp, Ollama o TGI.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe.
- Parámetros activos no disponibles: al ser MoE, no se puede estimar el coste computacional por token sin ese dato.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse empíricamente antes de cualquier uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero la falta de benchmarks y de validación de calidad hace recomendable una evaluación propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Revisión del modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/a443d4e30fd5228942cb7695f916f4b14a88fae9
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Auditoría de runtime (referenciada en la model card): `runtime_audit.json` dentro del repositorio
