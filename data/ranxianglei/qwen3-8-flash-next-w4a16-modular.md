# ranxianglei/Qwen3.8-Flash-Next-W4A16-Modular

## Resumen

Qwen3.8-Flash-Next-W4A16-Modular es un repack modular del modelo Qwen3.8-Flash-Next, desarrollado por el usuario ranxianglei, que combina cuantización W4A16 (4 bits en pesos, 16 bits en activaciones) mediante Intel AutoRound con una poda de expertos basada en perfiles de tráfico real de agentes de codificación. El resultado es un modelo MoE con 65,9 mil millones de parámetros totales (frente a los 125B+51B del original) que reduce los expertos por capa de 512 a 296, liberando aproximadamente 13 GB de VRAM y permitiendo servir el modelo en una GPU de 96 GB con una ventana de contexto de 262.144 tokens.

La relevancia de este modelo radica en su enfoque práctico para el despliegue de modelos MoE de gran tamaño en entornos de producción: en lugar de cuantizar o destilar, se eliminan expertos que rara vez se activan en cargas de trabajo específicas (sesiones de agentes de codificación), manteniendo la calidad en esos escenarios y ganando capacidad de memoria para el pool de KV. El repack modular separa los tensores de expertos por capa en archivos independientes, lo que facilita la edición, el intercambio o la re-poda sin reescribir el backbone completo.

El modelo se sirve mediante un fork de SGLang con soporte para offload de embeddings y correcciones para el recolector de basura de Marlin, alcanzando unos 104 tokens por segundo en decodificación con una sola secuencia y unos 2100 tokens por segundo agregados con 48 secuencias concurrentes en una RTX Pro 6000 de 96 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida GDN + QSA (del modelo base Qwen3.8-Flash-Next), con poda de expertos 512→296 por capa |
| Parametros totales | 65.913.514.131 (65,9B) |
| Parametros activos | no disponible (el modelo base tiene 6B activos por token, no confirmado para este repack) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones) mediante Intel AutoRound |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (48 archivos de expertos de ~180 MB + 14 shards de backbone de ~4,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next, un modelo MoE con arquitectura híbrida de atención que combina GDN (atención lineal) y QSA (atención cuadrática), además de un componente PLE (embeddings de N-gramas) que añade 51B parámetros adicionales al modelo principal de 125B. Sobre esta base, el autor aplica cuantización W4A16 con Intel AutoRound (calibrada) y posteriormente realiza una poda de expertos: se registran las rutas de enrutamiento de aproximadamente 80 sesiones reales de agentes de codificación mediante el modo `--expert-distribution-recorder-mode stat` de SGLang, y se seleccionan los 294 expertos más utilizados por capa, más 2 adicionales por capa procedentes de un perfil de contextos anómalos (sesiones fallidas que se quería preservar). Esto da un total de 296 expertos por capa, cubriendo más del 95% del enrutamiento habitual y manteniendo la capacidad de recuperación en contextos degradados (5/5 recuperaciones frente a 0/3 con el conjunto solo diario).

El repack modular reorganiza los tensores sin modificar ningún valor: todos los tensores de expertos de una capa se agrupan en un único archivo `experts-LNN.safetensors` (~180 MB), mientras que el resto (denso, atención lineal GDN, PLE, embeddings, lm_head) se reparte en 14 shards de backbone (~4,4 GB cada uno). Se verificó la identidad de los 129.403 tensores con el modelo original y la paridad de servicio (104 tok/s). No se aplicó ningún entrenamiento adicional; es una reordenación pura de pesos.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte de `reasoning-parser qwen3` en SGLang.
- Codificación de software: el perfil de poda se basó en sesiones reales de agentes de codificación, por lo que el modelo conserva la capacidad de generar, modificar y depurar código en esos flujos.
- Tool calling / function calling: soportado mediante `--tool-call-parser qwen3_coder`.
- Soporte de agentes: diseñado para sesiones largas de agentes de IA, con ventana de contexto de 262K tokens y un pool de KV de ~856K tokens en bf16.
- Contexto largo: la ventana de 262.144 tokens permite mantener conversaciones o análisis de repositorios extensos sin perder coherencia.
- Integración con compresión de contexto: se complementa con los plugins `billion-context` y `billion-context-pi` para extender el contexto efectivo más allá de la ventana física.
- Capacidades multilingües: no especificadas en la documentación disponible.

## Casos de uso

- Agente de codificación autónomo: el modelo puede actuar como motor de un agente que edita código, ejecuta comandos y gestiona múltiples archivos en una sesión prolongada, gracias a su ventana de 262K tokens y su soporte de tool calling. La poda de expertos está optimizada para este tipo de tráfico.
- Asistente de programación en IDE: integrado como backend de autocompletado o chat contextual, puede manejar conversaciones multi-turno sobre un proyecto completo sin perder el hilo, usando el pool de KV ampliado para mantener el historial.
- Análisis de codebases grandes: con 262K tokens de contexto, puede procesar repositorios extensos, resumir arquitecturas, detectar patrones o generar documentación a partir de múltiples archivos.
- Soporte técnico automatizado: su capacidad de razonamiento y contexto largo permite gestionar incidencias complejas con múltiples turnos, manteniendo el estado de la conversación y accediendo a documentación extensa.
- Generación de código en producción: puede integrarse en pipelines de CI/CD para generar tests, parches o refactorizaciones, con la ventaja de que la poda de expertos no degrada el rendimiento en tareas de codificación típicas.
- Investigación y experimentación con MoE: el formato modular permite a investigadores intercambiar o re-podar expertos por capa sin reexportar el modelo completo, facilitando estudios sobre el comportamiento de enrutamiento en diferentes dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se superaron "quality gates" (incluida una suite de contextos anómalos), pero no proporciona métricas numéricas como MMLU, HumanEval o GSM8K. Tampoco se comparan resultados con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM mínima: 64 GB (los pesos ocupan ~45 GB), aunque se recomienda 96 GB para aprovechar la ventana completa de 262K tokens.
- GPU recomendada: RTX Pro 6000 de 96 GB (usada en las pruebas), o GPUs profesionales equivalentes con 96 GB o más. No cabe en GPUs de consumo (p. ej., RTX 4090 de 24 GB).
- RAM del host: mínimo 64 GB, necesario para el offload de embeddings PLE (`--ple-offload-embedding`).
- CUDA 13 stack requerido.
- Opciones de despliegue: fork de SGLang (rama `ours/main`) con soporte para offload de PLE y corrección del recolector de basura de Marlin. Sin ese parche, la carga puede fallar por OOM a ~91,5 GB en algunas configuraciones.
- Rendimiento medido en RTX Pro 6000: ~104 tok/s en decodificación de una sola secuencia a 262K de contexto; ~2100 tok/s agregados con 48 secuencias concurrentes; pool de KV de ~856K tokens en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Expertos/capa | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B embeddings | 262K | FP16 (original) | 512 | Apache 2.0 | Modelo original sin poda ni cuantización |
| Qwen3.8-Flash-Next-W4A16-Pruned-294E | no disponible | 262K | W4A16 | 294 | Apache 2.0 | Variante con poda solo de perfil diario, shards lineales |
| Qwen3.8-Flash-Next-W4A16-Modular (este) | 65,9B | 262K | W4A16 | 296 | Apache 2.0 | Poda con perfil diario + anomalías, layout modular |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- La poda de expertos se realizó con perfiles de tráfico de agentes de codificación; el modelo puede degradarse en dominios muy diferentes (por ejemplo, tareas de visión, audio o dominios científicos especializados) si esos expertos fueron eliminados.
- La cuantización W4A16 puede introducir pérdida de precisión en comparación con el modelo en FP16, aunque no se han cuantificado los efectos en benchmarks.
- El modelo requiere hardware de gama alta (GPU de 96 GB) y un fork específico de SGLang; el despliegue en entornos estándar puede ser complejo.
- La ventana de 262K tokens es grande pero no infinita; sesiones extremadamente largas pueden requerir compresión externa (como los plugins billion-context).
- No se han publicado evaluaciones independientes de sesgos, alucinaciones o robustez fuera de los casos de uso de codificación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ranxianglei/Qwen3.8-Flash-Next-W4A16-Modular
- Variante Pruned-294E: https://huggingface.co/ranxianglei/Qwen3.8-Flash-Next-W4A16-Pruned-294E
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del modelo base (GitHub): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramienta de perfilado de expertos: https://github.com/ranxianglei/sglang-expert-profile
- Fork de SGLang con parches: https://github.com/ranxianglei/sglang
- Plugin de compresión de contexto billion-context: https://github.com/ranxianglei/billion-context
- Integración pi/agent de billion-context: https://github.com/ranxianglei/billion-context-pi
