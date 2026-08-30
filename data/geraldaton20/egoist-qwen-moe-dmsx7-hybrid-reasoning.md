# geraldaton20/egoist-qwen-MoE-DMSx7-Hybrid-Reasoning

## Resumen

EGOIST qwen-MoE-DMSx7-Hybrid-Reasoning es un modelo de lenguaje compacto de la clase 0.6B, desarrollado por el usuario independiente geraldaton20 a partir del modelo base Qwen/Qwen3-0.6B. Se presenta como un experimento de razonamiento híbrido que combina una arquitectura mixta densa/MoE con técnicas de compresión de memoria dinámica (DMS) y un formato de razonamiento por borrador (Chain-of-Draft). El modelo se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M, pensado para su uso con llama.cpp y Ollama en entornos con recursos limitados.

La relevancia del modelo reside en su propuesta de integrar varias técnicas de eficiencia en un único pipeline de 7 etapas: poda de vocabulario (de 151 643 a 99 562 tokens), fusión de 4 expertos por dominio, calibración de router, retrofit de Chain-of-Draft mediante LoRA, entrenamiento de un scorer de evicción de KV-cache (DMS), exportación a GGUF y cuantización. El resultado es un modelo de 1 086 935 356 parámetros totales (aunque solo activa una fracción en cada paso por su diseño MoE top-1) con una ventana de contexto de 40 960 tokens y una huella de solo 643 MB en disco.

Aunque el modelo no ha recibido descargas ni likes en HuggingFace, su model card documenta mediciones internas detalladas (perplexity, velocidad de generación, utilización del router, rendimiento del DMS) que permiten evaluar su comportamiento real. Es un trabajo de investigación aplicada más que un producto listo para producción, pero ofrece datos útiles sobre el impacto de la cuantización y las técnicas de razonamiento comprimido en modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso/MoE basado en Qwen3-0.6B; 28 capas + 1 capa MTP (dormante), hidden 1024, RoPE θ=1e6, 14 capas densas + 14 capas MoE (top-1 de 4 expertos) |
| Parametros totales | 1 086 935 356 (safetensors) |
| Parametros activos | no disponible (top-1 de 4 expertos en las 14 capas MoE; el resto de capas son densas) |
| Longitud de contexto | 40 960 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF, 643 MB); bf16 (safetensors fuente, no publicado directamente) |
| Idiomas soportados | no disponible (el vocabulario se podó a 99 562 tokens; no se especifica el conjunto de idiomas) |
| Licencia | Apache-2.0 (derivado de Qwen3; verificar términos del modelo base) |
| Formato de pesos | GGUF (Q4_K_M), safetensors (bf16, en checkpoints de etapas del pipeline) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B y aplica un pipeline de 7 etapas. La arquitectura resultante es híbrida: 14 capas permanecen densas y 14 capas se convierten en MoE con 4 expertos especializados (código, matemáticas, razonamiento y general) y selección top-1. El router se calibra con una combinación de pérdida auxiliar de balanceo de carga y un ajuste de bias sin pérdida (loss-free bias nudging). El vocabulario se poda mediante la unión de los BPE de los 4 modelos de dominio, reduciéndolo de 151 643 a 99 562 tokens.

El entrenamiento incluye un retrofit de Chain-of-Draft (CoD) mediante LoRA (r=8, α=16) sobre un dataset de 500 filas generado con un modelo Qwen alojado en Groq, con una pérdida que desciende de 0,85 a 0,75 en 3 épocas. Además, se entrena un scorer DMS (Dynamic-Memory Scoring) que asigna importancia a cada token para la evicción de KV-cache, con un objetivo de evicción del 65–80%; este scorer se aplica a nivel de aplicación, no dentro del GGUF. También se entrena una cabeza MTP (multi-token prediction) que está presente en los pesos pero deshabilitada en tiempo de ejecución porque las mediciones mostraron que ralentiza la generación.

La cuantización final a Q4_K_M conserva una retención de perplexity del 85,2% frente al bf16 (4,75 vs 4,04) y multiplica por 3,9 la velocidad de generación en CPU (12,7 tok/s vs 3,25 tok/s). El modelo sigue la plantilla de conversación `### Instruction:` / `### Response:\n[BREAKDOWN]` para activar el razonamiento en formato borrador.

## Capacidades

- Generación de texto con razonamiento en formato Chain-of-Draft (CoD): responde con borradores comprimidos en lugar de pasos completos, lo que reduce la longitud de las respuestas y el uso de KV-cache.
- Razonamiento híbrido denso/MoE: 4 expertos especializados (código, matemáticas, razonamiento general y dominio general) con selección top-1 por capa.
- Evicción dinámica de KV-cache (DMS): un scorer entrenado permite descartar tokens de bajo valor en el contexto, manteniendo coherencia con una tasa de evicción del 71–75%.
- Manejo de contexto largo: 40 960 tokens de ventana, adecuado para tareas que requieren mantener conversaciones o documentos extensos.
- Generación de código y razonamiento matemático básico: gracias a los expertos especializados, aunque con las limitaciones propias de un modelo de 0.6B.
- Compatibilidad con llama.cpp y Ollama: formato GGUF autocontenido, sin dependencias adicionales.
- Personalización de la plantilla de prompt: el razonamiento CoD se activa mediante la plantilla `[BREAKDOWN]`, lo que permite controlar el estilo de salida.

## Casos de uso

- Chatbots de bajo coste en CPU: con 643 MB y 12,7 tok/s en un CPU de 4 núcleos, puede desplegarse en servidores sin GPU o en dispositivos edge para atención al cliente básica con respuestas generadas en formato borrador.
- Generación de código en entornos con restricciones de memoria: el experto de código permite autocompletar o explicar fragmentos sencillos en IDEs ligeros o pipelines de CI/CD donde no se dispone de GPU.
- Razonamiento matemático asistido en educación: puede resolver problemas aritméticos y algebraicos simples con explicaciones paso a paso, útil para herramientas de tutoría en línea con presupuesto limitado.
- Prototipado rápido de agentes conversacionales: su ventana de 40 960 tokens permite mantener historiales largos; el DMS aplicado a nivel de aplicación reduce el coste de memoria en despliegues de múltiples instancias.
- Investigación sobre eficiencia de modelos: el pipeline de 7 etapas documentado y los benchmarks internos sirven como referencia para experimentos de poda de vocabulario, fusión MoE y cuantización en modelos pequeños.
- Evaluación de técnicas de evicción de KV-cache: el scorer DMS puede integrarse en frameworks de inferencia que permitan controlar la política de evicción, permitiendo comparar su impacto en coherencia frente a políticas estándar.
- Generación de resúmenes de documentos largos: su contexto de 40 960 tokens permite procesar informes extensos y producir resúmenes en formato CoD, reduciendo el coste de tokens de salida.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor (mediciones internas, no comparativas estandarizadas).

| Métrica | Resultado |
|---|---|
| Perplexity bf16 (HF) | 4,04 |
| Perplexity Q4_K_M (GGUF) | 4,75 |
| Retención de perplexity (Q4_K_M vs bf16) | 85,2% |
| Velocidad bf16 (CPU, 4 núcleos) | 3,25 tok/s |
| Velocidad Q4_K_M (CPU, 4 núcleos) | 12,7 tok/s (3,9× vs bf16) |
| Última ejecución de referencia (Q4_K_M, CPU) | 11,7 tok/s |
| Utilización del router (tras calibración) | 24,2 / 25,7 / 23,7 / 26,4% |
| Pérdida de entrenamiento CoD LoRA | 0,85 → 0,75 (500 filas, 3 épocas) |
| Tasa de evicción DMS | 71–75% (coherente, a ritmo 0,72–0,78) |
| AWQ (intermedio, superado por Q4_K_M) | Retención ppl 87,1%, top-1 92,6% |
| MTP speculativo (medido, deshabilitado) | Longitud aceptada media 1,15–1,27; 5,8–7,2 tok/s vs 11,7 tok/s base |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M pesa 643 MB; con overhead de ejecución, cabe en cualquier GPU con 2 GB de VRAM o incluso en RAM del sistema.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal (p. ej., NVIDIA GTX 1650, RTX 3060, Apple M1). También funciona en CPU pura.
- Compatibilidad con consumer GPU: sí, es el caso de uso principal; no requiere GPU de datacenter.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (vía Modelfile), Python con `trust_remote_code=True` para el bf16 fuente (requiere el código personalizado `moe_model.py`).
- Latencia y throughput: en CPU de 4 núcleos, ~12 tok/s con Q4_K_M; en GPU, se espera un throughput significativamente mayor, aunque no se han publicado mediciones.
- Almacenamiento: 0,7 GB en disco (repo HuggingFace).

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de la misma clase (p. ej., Qwen3-0.6B base, SmolLM2-360M, Gemma-2-2B) en la información proporcionada. El modelo es un experimento con arquitectura y pipeline propios, y sus benchmarks internos no son directamente comparables con métricas estandarizadas de otros modelos.

## Limitaciones y advertencias

- Modelo de 0.6B de clase: se esperan errores factuales y de razonamiento en comparación con modelos mayores; no apto para tareas críticas sin supervisión humana.
- El DMS (evicción de KV-cache) se aplica a nivel de aplicación, no está integrado en el GGUF; las ejecuciones con llama.cpp u Ollama estándar no lo utilizan.
- La cabeza MTP está presente pero deshabilitada: las mediciones mostraron que ralentiza la generación, por lo que no debe activarse en producción.
- El formato de salida CoD depende de la plantilla de prompt; si se usa una plantilla distinta, el modelo puede desviarse del formato esperado.
- El vocabulario podado puede afectar al rendimiento en idiomas o dominios no representados en los datos de entrenamiento de los expertos; no se especifica el conjunto de idiomas soportados.
- Los datos de entrenamiento del CoD (500 filas) son muy limitados; el modelo puede no generalizar bien fuera de los patrones vistos.
- Licencia Apache-2.0, pero derivada de Qwen3: conviene revisar los términos de la licencia original del modelo base para uso comercial.
- No hay evidencia de evaluación con benchmarks estándar; las métricas publicadas son mediciones internas del autor, no verificadas por terceros.
- El repositorio tiene 0 descargas y 0 likes; el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geraldaton20/egoist-qwen-MoE-DMSx7-Hybrid-Reasoning
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B (referencia de arquitectura)
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Referencia de modelos MoE open source: https://models.moe/ (contexto general de arquitecturas MoE)
