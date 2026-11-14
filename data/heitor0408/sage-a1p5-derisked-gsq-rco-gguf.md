# Heitor0408/SAGE-A1P5-DERISKED-GSQ-RCO-GGUF

## Resumen
SAGE-A1.5-DERISKED-GSQ-RCO-GGUF es una cuantización GGUF de precisión mixta del modelo SAGE-A1.5-DERISKED-BF16-V2, un derivado del modelo MoE InternScience/Sage-A1.5 (35B-A3B) de Shanghai AI Lab. Lo publica el usuario Heitor0408 y su objetivo es comprimir el modelo original (34,66B parámetros totales) en un único archivo de 13,822 GiB (14,84 GB) con un bitwidth efectivo medio de 3,425 bpw, manteniendo intacto el backbone denso activo y las modificaciones de abliteración.

La propuesta técnica consiste en aplicar una política de protección arquitectónica ("ISTA-locked") que fija a Q8_0 todas las matrices del backbone denso activo (capas de atención completa, capas recurrentes Gated-DeltaNet, expertos compartidos, cabeza de salida y las 38 matrices de proyección modificadas por el proceso DWM de abliteración). Solo los 120 tensores de expertos enrutados se cuantizan agresivamente mediante una optimización RCO (Riemannian Constrained Optimization) por tensor, con asignaciones individuales entre IQ2_XXS e IQ4_XS según la importancia de activación, varianza de pesos, curtosis de outliers y sensibilidad por profundidad.

El modelo es relevante para desarrolladores que necesitan ejecutar un MoE de ~35B con contexto nativo de 262.144 tokens (extensible a 1M con YaRN) en GPUs de consumo, sacrificando precisión en expertos enrutados a cambio de preservar el backbone que se ejecuta en cada token. La licencia Apache 2.0 permite uso comercial, y la eliminación de las torres MTP y vision libera ~1,5 GiB para concentrar el presupuesto de bytes en razonamiento textual y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Qwen3.6-35B-A3B): 10 capas de atención completa + 30 capas Gated-DeltaNet recurrentes, 256 expertos enrutados (top-8 activos), 40 expertos compartidos |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | ~3,05B (backbone denso activo por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantizacion | GGUF mixto: Q8_0 (311 tensores), F32 (301), IQ3_XXS (75), IQ3_S (26), Q2_K (15), IQ2_S (2), IQ2_XS (2), Q5_K (1); bitwidth efectivo 3,425 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo base es InternScience/Sage-A1.5, un MoE de la familia qwen35moe con 40 capas: 10 de atención completa y 30 con mecanismo Gated-DeltaNet (atención lineal/recurrente con estado). Contiene 256 expertos enrutados con top-8 activos por token, más 40 expertos compartidos que se ejecutan siempre. El backbone denso activo (capas de atención, proyecciones recurrentes, expertos compartidos, embeddings y lm_head) suma ~3,05B parámetros y representa el 9,1% del total, mientras que los expertos enrutados concentran el 90,9%.

Sobre ese base, Blackfrost-AI aplicó un proceso DWM (Directional Weight Modification) de abliteración de rechazos en dos pasadas con α=1,0, modificando exclusivamente 38 matrices densas de proyección de salida: 28 ssm_out.weight (proyecciones de salida de Gated-DeltaNet) y 10 attn_output.weight (proyecciones de salida de atención completa), con separación direccional máxima en las capas 38 y 39. Esta cuantización GGUF preserva esas 38 matrices a Q8_0 para no degradar el subespacio ortogonal de abliteración, y aplica RCO con 500 pasos de descenso de gradiente proyectado riemanniano más refinamiento lagrangiano de distorsión marginal para resolver la asignación óptima por tensor de experto enrutado. Los tensores MTP (785) y visuales (333 del ViT) fueron eliminados antes de la conversión, dejando 733 tensores GGUF puramente textuales.

## Capacidades
- Generación de texto y razonamiento multi-paso sobre un backbone denso preservado a 8,50 bpw.
- Razonamiento agéntico: el modelo base está etiquetado como "agentic" y hereda las capacidades del Qwen3.6-35B-A3B subyacente.
- Generación de código y matemáticas (capacidades heredadas del base Qwen3.6, sin benchmarks publicados en esta ficha).
- Contexto largo: 262.144 tokens nativos, extensible a 1M con YaRN, útil para repositorios completos o documentos extensos.
- Sin censura de rechazos (abliterated/uncensored): las 38 matrices DWM se mantienen a Q8_0, conservando el efecto de la abliteración.
- Modelo puramente textual: las torres MTP y vision fueron eliminadas, por lo que no hay capacidades multimodales.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible; depende del chat template del modelo base.
- Idiomas: no disponible (el base Qwen3.6 es multilingüe, pero esta ficha no documenta el listado concreto).

## Casos de uso
- Inferencia local en GPU de consumo: el archivo de 13,822 GiB cabe en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4070 Ti Super, RTX 4080) y en 24 GB (RTX 3090/4090) con margen para KV cache, permitiendo ejecutar un MoE de 35B en hardware de escritorio.
- Razonamiento agéntico con contexto largo: los 262K tokens nativos permiten mantener en memoria el histórico completo de un agente multi-paso (herramientas, observaciones, plan) sin truncamiento, con solo ~3,05B parámetros activos por token para latencia contenida.
- Generación de código en pipelines: al preservar el backbone a Q8_0, las capas de atención y los expertos compartidos mantienen fidelidad alta; útil para autocompletado, refactorización y generación de tests en entornos con VRAM limitada.
- Análisis de repositorios completos: con contexto extensible a 1M mediante YaRN, se pueden procesar bases de código grandes o documentación técnica extensa en una sola pasada.
- Investigación sobre cuantización: el histograma por tensor y el mapa de asignación RCO capa a capa lo convierten en un caso de estudio reproducible para evaluar el impacto de la cuantización selectiva en MoE.
- Escenarios sin restricción de rechazo: gracias a la abliteración preservada, adecuado para investigación sobre alineación, red teaming controlado y generación de contenido que los modelos alineados rechazarían.
- Servicio de chat multi-turno con llama.cpp server: compatible con endpoints (tag endpoints_compatible), desplegable como API local con contexto largo y throughput moderado por el bajo número de parámetros activos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: ~14 GB para los pesos (13,822 GiB) más KV cache; con contexto de 262K tokens el KV cache puede requerir varios GB adicionales según configuración de llama.cpp (quantización de KV cache recomendada).
- GPU recomendadas: RTX 4060 Ti 16GB, RTX 4070 Ti Super 16GB, RTX 4080 16GB (ajustado), RTX 3090/4090 24GB (cómodo), A100 40GB, H100 80GB para contexto máximo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 16 GB o más; en 24 GB con margen amplio.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), llama.cpp server (endpoints compatibles), Ollama (requiere importación del GGUF), vLLM (soporte GGUF limitado y no garantizado para esta arquitectura híbrida), TGI (no disponible para este formato).
- Latencia y throughput: no disponibles; al activar solo ~3,05B parámetros por token, el throughput debería ser superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bitwidth / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAGE-A1.5-DERISKED-GSQ-RCO (este) | 34,66B (3,05B activos) | 262K (1M YaRN) | 3,425 bpw GGUF mixto | Apache 2.0 | GGUF en HF |
| Blackfrost-AI/SAGE-A1P5-DERISKED-BF16-V2 | 34,66B (3,05B activos) | 262K | BF16 | no disponible | safetensors en HF |
| ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ | 35B (3B activos aprox.) | no disponible | ~2 bpw GSQ | no disponible | GGUF/safetensors en HF |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (3B activos aprox.) | no disponible | BF16 | no disponible | HF oficial |

## Limitaciones y advertencias
- Los expertos enrutados se cuantizan a 3,068 bpw de media (con tensores a IQ2_XS/IQ2_S/Q2_K en capas iniciales), lo que puede degradar conocimiento factual raro y matices finos frente al BF16, aunque el backbone activo está protegido.
- Modelo abliterated/uncensored: no tiene rechazos de seguridad alineados; puede generar contenido dañino, ilegal o sesgado sin filtro. No apto para despliegues orientados al público general sin capas de moderación externas.
- Modelo puramente textual: sin capacidades de visión ni MTP, pese a que el base Qwen3.6 pudiera tenerlas.
- Idiomas soportados no documentados en esta ficha; verificar el comportamiento multilingüe del base antes de usar en producción en idiomas distintos del inglés.
- Riesgo de alucinación inherente a la cuantización agresiva de expertos en dominios especializados (derecho, medicina, datos numéricos).
- La licencia Apache 2.0 del artefacto GGUF no exime de verificar las licencias del modelo base y del derivado DWM; confirmar términos antes de uso comercial.
- Soporte de tool calling no confirmado explícitamente en la información disponible; validar con el chat template del base.
- Arquitectura híbrida (atención lineal + MoE) con soporte irregular en backends distintos de llama.cpp; vLLM y TGI pueden no funcionar correctamente.
- Repositorio con 0 descargas y creado en 2026-11-14: sin validación comunitaria, sin benchmarks y sin garantías de mantenimiento.

## Enlaces
- Hugging Face (este modelo): https://huggingface.co/Heitor0408/SAGE-A1P5-DERISKED-GSQ-RCO-GGUF
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/SAGE-A1P5-DERISKED-BF16-V2
- Modelo original Sage-A1.5: https://huggingface.co/InternScience/Sage-A1.5
- Modelo Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Referencia GSQ 2-bit: https://huggingface.co/ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ
- Repositorio RCO (IST-DASLab): https://github.com/IST-DASLab/RCO
