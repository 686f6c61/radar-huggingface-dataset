# amd/DeepSeek-V4.1-Flash-Quark-MXFP4

## Resumen

AMD/DeepSeek-V4.1-Flash-Quark-MXFP4 es una versión cuantizada del modelo DeepSeek-V4.1-Flash, publicada por AMD mediante su herramienta de optimización AMD-Quark. El modelo base es un transformer de tipo mixture-of-experts (MoE) con capacidad multimodal (entrada de texto e imagen, salida de texto) desarrollado por DeepSeek. Esta variante cuantizada reduce el coste de inferencia aplicando formatos OCP MX (MXFP4 y MXFP8) a los módulos del modelo de lenguaje, manteniendo la torre de visión y otros componentes en su precisión original.

La relevancia de esta ficha radica en que es una de las primeras distribuciones públicas de un modelo de casi 484.000 millones de parámetros cuantizado con los formatos MX de OCP y optimizado específicamente para hardware AMD Instinct (MI355/MI350, gfx950). El modelo conserva la licencia MIT del original y está pensado para despliegue con vLLM sobre ROCm, lo que lo convierte en una opción de referencia para evaluar el stack de inferencia de AMD en cargas MoE de gran escala.

Con 483.858.771.154 parámetros totales y un repositorio de 509,6 GB, el modelo está orientado a entornos de servidor con múltiples GPUs y no a hardware de consumo. La cuantización selectiva (expertos en MXFP4, atención en MXFP8) busca reducir el ancho de banda de memoria sin degradar de forma significativa la precisión, manteniendo una recuperación de exactitud cercana al 99 % en la mayoría de los benchmarks reportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (DeepseekV41ForCausalLM) |
| Parametros totales | 483.858.771.154 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (mencionado en la configuración de evaluación agéntica) |
| Tipos de cuantizacion | OCP MXFP4 (expertos y shared_experts, pesos y activaciones), OCP MXFP8 (self_attn, pesos y activaciones); resto de módulos en precisión original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash es un transformer MoE con entrada multimodal (texto e imagen) y salida de texto. La arquitectura incluye módulos de expertos enrutados y expertos compartidos, atención en el modelo de lenguaje, una torre de visión con aligner, embeddings, cabeza de salida, y bloques adicionales denominados engram y MTP (multi-token prediction). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación principal de esta variante es la cuantización selectiva con AMD-Quark v0.13.0. Los expertos (routed y shared) se cuantizan a OCP MXFP4 tanto en pesos como en activaciones, y la atención del modelo de lenguaje a OCP MXFP8. Se excluyen explícitamente de la cuantización la torre de visión, el aligner, el router gate, los embeddings, la cabeza de salida, los bloques engram y MTP, y las proyecciones main_proj. El script de cuantización usa `LLMTemplate` con `direct_quantize_checkpoint` y mantiene las capas excluidas en su estado original. La inferencia aprovecha el kernel nativo MXFP4 MoE de AITER (`AITER_MXFP4_MXFP4`) sobre ROCm 7.2.0.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) configurable mediante `reasoning_effort`.
- Comprensión de imágenes: la entrada admite texto e imagen, con evaluación específica en MMMU-Pro en modalidad vision.
- Razonamiento matemático de competición: evaluado en GSM8K y AIME26.
- Razonamiento científico de nivel avanzado: evaluado en GPQA Diamond.
- Seguimiento de instrucciones: evaluado en IFBench.
- Comprensión de contexto largo: evaluado en AA-LCR con ventana de hasta 1M tokens.
- Codificación agéntica: evaluado en DeepSWE v1.1 y Terminal-Bench 4.0 con mini-swe-agent, hasta 500 pasos por tarea.
- Soporte de tool calling y flujos multi-paso: implícito en las evaluaciones agénticas con agentes tipo swe-agent.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo mantiene un 92,04 en GSM8K y un 97,71 en AIME26 tras la cuantización, por lo que puede emplearse en asistentes de resolución de problemas técnicos donde se requiere precisión numérica y justificación paso a paso.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto, es adecuado para pipelines de extracción y razonamiento sobre capturas, diagramas o páginas escaneadas, con una recuperación del 98,7 % en MMMU-Pro vision frente al modelo base.
- Agentes de codificación autónomos: los resultados en DeepSWE v1.1 (72,0 de tareas resueltas) y Terminal-Bench 4.0 (22,2 % de éxito) lo sitúan como candidato para agentes que editan repositorios y ejecutan comandos en terminal, integrados con mini-swe-agent y un contexto de 1M tokens.
- Procesamiento de contexto largo: con una ventana de 1M tokens y un 77,88 en AA-LCR, puede usarse para resumir o responder preguntas sobre corpus extensos, contratos o documentación técnica completa en una sola pasada.
- Despliegue en infraestructura AMD Instinct: es una opción directa para organizaciones con clústeres MI355/MI350 que quieran servir un MoE de gran escala con vLLM sobre ROCm sin recurrir a GPUs NVIDIA.
- Evaluación de stacks de cuantización: sirve como referencia para medir el impacto de MXFP4/MXFP8 en precisión y rendimiento dentro de pipelines propios, dado que la model card documenta la recuperación por benchmark.
- Asistentes con seguimiento estricto de instrucciones: el 78,13 en IFBench permite usarlo en tareas donde el formato de salida y las restricciones del prompt son críticas, como generación de informes estructurados.

## Benchmarks y rendimiento

| Benchmark | DeepSeek-V4.1-Flash (base) | Quark-MXFP4 (este modelo) | Recuperación |
|---|---:|---:|---:|
| GSM8K (8-shot, flexible-extract) | 92,49 | 92,04 | 99,5 % |
| GPQA Diamond (0-shot, thinking, mean@8) | 90,15 | 88,64 | 98,3 % |
| AIME26 (mean@16) | 97,50 | 97,71 | 100,2 % |
| MMMU-Pro standard (10 opciones, mean@1) | 76,47 | 76,36 | 99,9 % |
| MMMU-Pro vision (mean@1) | 72,95 | 72,02 | 98,7 % |
| AA-LCR (LLM judge, mean@8) | 78,25 | 77,88 | 99,5 % |
| IFBench (prompt-level loose, mean@5) | 78,93 | 78,13 | 99,0 % |
| DeepSWE v1.1 (resueltas, 113 tareas, mean@3) | 71,4 | 72,0 | 100,8 % |
| Terminal-Bench 4.0 (pass rate, 63 tareas, mean@3) | 24,9 | 22,2 | 89,4 % |

En GPQA Diamond, la diferencia emparejada por pregunta es de −1,52 ± 0,85 puntos (p = 0,09), no significativa. En DeepSWE v1.1, la diferencia emparejada es de +0,6 ± 2,7 puntos (p = 0,91), tampoco significativa. En Terminal-Bench 4.0 la diferencia reportada es de −2 puntos, con 3 tareas excluidas por requerir GPUs NVIDIA H100.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 509,6 GB en safetensors; se requiere un despliegue multi-GPU con memoria agregada superior a esa cifra más overhead de activaciones y caché KV.
- GPU recomendadas: AMD Instinct MI355 y MI350 (gfx950) son el hardware soportado oficialmente. La configuración documentada usa TP=2.
- GPU de consumo: no cabe en GPUs de consumo; el tamaño del checkpoint y la dependencia de AITER/ROCm lo excluyen.
- Software: ROCm 7.2.0, PyTorch 2.12.0, Transformers 5.17.0, vLLM con imagen `vllm/vllm-openai-rocm:v0.33.0`, AITER reconstruido en v0.1.28 y FlyDSL 0.4.1. Es obligatorio definir `VLLM_ROCM_USE_AITER_MOE=1`.
- Imágenes antiguas: la imagen `vllm/vllm-openai-rocm:deepseekv41-flash-0909` (vLLM 0.28.1rc1) no puede cargar el checkpoint; a TP=4 falla la comprobación del bloque FP8 de shared-expert y a TP=2 falla la carga de pesos.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Cuantización | Hardware objetivo |
|---|---:|---|---|---|---|
| amd/DeepSeek-V4.1-Flash-Quark-MXFP4 | 483.858.771.154 | 1M tokens | MIT | MXFP4 + MXFP8 | AMD MI355/MI350 |
| deepseek-ai/DeepSeek-V4.1-Flash | no disponible | 1M tokens | MIT | BF16/FP8 original | no disponible |
| Alternativas de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base sin cuantizar, del que esta variante conserva prácticamente toda la precisión según los benchmarks reportados. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible en Terminal-Bench 4.0 (89,4 % de recuperación) y en GPQA Diamond (98,3 %), aunque en este último caso la diferencia no es estadísticamente significativa.
- El soporte está restringido a AMD Instinct MI355/MI350 con ROCm 7.2.0 y una configuración concreta de vLLM, AITER y FlyDSL; no hay garantía de funcionamiento en otras plataformas.
- La imagen oficial de vLLM incluida trae AITER 0.1.26, cuya implementación MXFP4 MoE falla con `Memory access fault` durante la captura de CUDA graphs; es necesario reconstruir AITER a v0.1.28.
- La torre de visión no está cuantizada, por lo que el ahorro de memoria se concentra en los módulos del modelo de lenguaje.
- Riesgo de alucinación: no cuantificado en la información disponible; es inherente a los modelos generativos de esta escala.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- La licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card para confirmar condiciones adicionales.
- El tamaño del repositorio (509,6 GB) y la necesidad de múltiples GPUs implican costes de infraestructura elevados para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/DeepSeek-V4.1-Flash-Quark-MXFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/LICENSE
- Documentación de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
