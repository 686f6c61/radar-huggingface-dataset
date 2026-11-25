# amd/DeepSeek-V4.1-Flash-Quark-MXFP4

## Resumen

DeepSeek-V4.1-Flash-Quark-MXFP4 es una versión cuantizada del modelo multimodal DeepSeek-V4.1-Flash, desarrollada por AMD mediante su herramienta de optimización AMD Quark (v0.13.0). El modelo original, de arquitectura Mixture-of-Experts (MoE) con 483.858.771.154 parámetros totales, procesa entradas de texto e imagen y genera texto, y esta cuantización busca reducir el coste de memoria y cómputo para su despliegue en hardware AMD Instinct de última generación.

La relevancia de esta ficha radica en que demuestra un proceso de cuantización selectiva: solo las proyecciones de los expertos MoE (`experts` y `shared_experts`) se convierten a OCP MXFP4 (pesos y activaciones), mientras que la atención se mantiene en el FP8 original (e4m3 con bloques 32×32 y escalas UE8M0) y la torre de visión, el router, los embeddings, la cabeza de salida y los bloques MTP quedan sin cuantizar. El resultado es una recuperación de precisión muy alta respecto al modelo base en la mayoría de benchmarks publicados.

El modelo está pensado para servirse con vLLM sobre ROCm, específicamente en aceleradores AMD MI355/MI350 (gfx950), con un kernel nativo MXFP4 MoE. No se ha validado en MI300X/MI325X (gfx942). Su licencia es MIT, lo que facilita el uso comercial, y el repositorio ocupa 509,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV41ForCausalLM (transformer MoE multimodal, texto e imagen) |
| Parametros totales | 483.858.771.154 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (los benchmarks de agentes usan contexto de 1M tokens) |
| Tipos de cuantizacion | OCP MXFP4 (8-bit) en expertos y shared_experts; atención en FP8 e4m3 con bloques 32×32 y escalas UE8M0; resto sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con capacidad multimodal (entrada de texto e imagen, salida de texto). La cuantización de AMD Quark afecta exclusivamente a las proyecciones de los expertos (`experts` y `shared_experts`) del modelo de lenguaje, que pasan a OCP MXFP4 tanto en pesos como en activaciones. El resto de módulos se conserva tal cual del checkpoint original mediante `keep_excluded_layers_as_original_model_state=True`: la atención (`self_attn`) permanece en FP8 con `weight_block_size` [32, 32] y `scale_fmt` `ue8m0`, y quedan excluidos de la cuantización la torre de visión, el router gate, los embeddings, la cabeza de salida, los bloques engram y MTP.

El proceso se realiza con `direct_quantize_checkpoint` de AMD Quark sobre el checkpoint `deepseek-ai/DeepSeek-V4.1-Flash`, registrando una plantilla `LLMTemplate` con `model_type="deepseek_v41"` y un esquema `mxfp4`. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni sobre si hubo RLHF o DPO; esos datos no están incluidos en la información proporcionada. La innovación técnica destacable es el uso del kernel nativo MXFP4 MoE (`AITER_MXFP4_MXFP4`) en gfx950, que requiere una reconstrucción específica de AITER para funcionar correctamente durante la captura de CUDA graphs.

## Capacidades

- Generación de texto y razonamiento, incluyendo modo "thinking" (los benchmarks GPQA Diamond y AIME26 se evalúan con `reasoning_effort=max`).
- Procesamiento de imágenes: pipeline `image-text-to-text`, con torre de visión no cuantizada y evaluaciones específicas de visión en MMMU-Pro.
- Razonamiento matemático: evaluado en GSM8K y AIME26.
- Codificación agéntica: evaluado en DeepSWE v1.1 y Terminal-Bench 4.0 con mini-swe-agent.
- Seguimiento de instrucciones: evaluado en IFBench.
- Razonamiento sobre contexto largo: evaluado en AA-LCR y en tareas agénticas con contexto de 1M tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no documentado explícitamente en la información proporcionada.

## Casos de uso

- Asistencia matemática y resolución de problemas cuantitativos: con una puntuación de 92,04 en GSM8K y 97,71 en AIME26 (mean@16), el modelo es adecuado para tutores automáticos, verificación de cálculos y generación de soluciones paso a paso en entornos educativos o financieros.
- Razonamiento científico de alto nivel: los 88,64 puntos en GPQA Diamond (0-shot, thinking, mean@8) lo sitúan como candidato para asistencia en investigación, revisión de hipótesis y respuesta a preguntas de dominio experto en física, química y biología.
- Agentes de codificación autónomos: con 72,0 en DeepSWE v1.1 (113 tareas, mean@3) y 22,2 de pass rate en Terminal-Bench 4.0, puede integrarse en pipelines de resolución automática de issues, refactorización y ejecución de comandos en terminal dentro de flujos CI/CD.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, sirve para extracción de información de capturas, gráficos, diagramas y documentos escaneados, con 72,02 en MMMU-Pro vision (mean@1).
- Procesamiento de contexto largo: los benchmarks agénticos se ejecutan con 1M tokens de contexto, lo que permite resumir repositorios completos, analizar contratos extensos o mantener conversaciones multi-turno con historial muy largo.
- Seguimiento estricto de instrucciones en producción: con 78,13 en IFBench (prompt-level loose, mean@5), es adecuado para sistemas que requieren formato de salida controlado, como generación de JSON estructurado o respuestas con restricciones explícitas.
- Despliegue en infraestructura AMD: al estar optimizado para MI355/MI350 con vLLM y ROCm, encaja en clústeres AMD Instinct donde se quiera maximizar el throughput por acelerador reduciendo el peso de los expertos MoE.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el modelo base con esta cuantización:

| Benchmark | DeepSeek-V4.1-Flash (base) | Quark-MXFP4 (este modelo) | Recuperación |
|---|---:|---:|---:|
| GSM8K (8-shot, flexible-extract) | 92,49 | 92,04 | 99,5% |
| GPQA Diamond (0-shot, thinking, mean@8) | 90,15 | 88,64 | 98,3% |
| AIME26 (mean@16) | 97,50 | 97,71 | 100,2% |
| MMMU-Pro standard (10 opciones, mean@1) | 76,47 | 76,36 | 99,9% |
| MMMU-Pro vision (mean@1) | 72,95 | 72,02 | 98,7% |
| AA-LCR (LLM judge, mean@8) | 78,25 | 77,88 | 99,5% |
| IFBench (prompt-level loose, mean@5) | 78,93 | 78,13 | 99,0% |
| DeepSWE v1.1 (resolved, 113 tareas, mean@3) | 71,4 | 72,0 | 100,8% |
| Terminal-Bench 4.0 (pass rate, 63 tareas, mean@3) | 24,9 | 22,2 | 89,4% |

En GPQA Diamond, el rango por ejecución del modelo base es 87,88–91,41 y el de este modelo 86,87–89,90; la diferencia emparejada por pregunta es de −1,52 ± 0,85 puntos (p = 0,09), no significativa. En DeepSWE v1.1, los recuentos por ejecución son 78/88/76 para el base y 79/82/83 para este modelo, con una diferencia emparejada de +0,6 ± 2,7 puntos (p = 0,91). En la imagen vLLM `deepseek-v41-flash-8a13616`, GSM8K da 92,72 para el base y 91,28 para este modelo.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 509,6 GB, por lo que la inferencia requiere al menos ese orden de magnitud de memoria agregada; con TP=2 sobre dos aceleradores MI355/MI350 se reparte la carga entre ambos.
- GPU recomendadas: AMD Instinct MI355 y MI350 (gfx950). El kernel nativo MXFP4 MoE está dirigido a gfx950; MI300X/MI325X (gfx942) no han sido validados.
- GPU de consumo: no cabe en GPUs consumer; el tamaño del checkpoint y la dependencia del kernel gfx950 lo impiden.
- Opciones de despliegue: vLLM con backend ROCm. Configuración validada: imagen Docker `vllm/vllm-openai-rocm:v0.33.0` con AITER reconstruido en el commit `f1965cd` (tag v0.1.28) y FlyDSL 0.4.1, TP=2 y `VLLM_ROCM_USE_AITER_MOE=1`. Alternativa sin reconstrucción: imagen `vllm/vllm-openai-rocm:deepseek-v41-flash-8a13616` (vLLM 0.34.0rc1, AITER 0.1.29.post1, FlyDSL 0.5.0).
- Entorno de cuantización: ROCm 7.2.0, PyTorch 2.12.0, Transformers 5.17.0, AMD Quark 0.13.0, Linux.
- Latencia y throughput: no disponibles en la información proporcionada. La reconstrucción de AITER es obligatoria en la imagen v0.33.0 porque AITER 0.1.26 falla durante la captura de CUDA graphs con `Memory access fault`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| amd/DeepSeek-V4.1-Flash-Quark-MXFP4 | 483,86 B (totales) | no disponible | MIT | safetensors, MXFP4/FP8 | Cuantizado para gfx950; recuperación 98–100% en la mayoría de benchmarks |
| deepseek-ai/DeepSeek-V4.1-Flash | no disponible | no disponible | MIT | safetensors (FP8 en atención) | Modelo base sin cuantizar; referencia de precisión |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Hardware restringido: el kernel MXFP4 MoE solo está validado en gfx950 (MI355/MI350); MI300X/MI325X no han sido probados y podrían fallar.
- Dependencia de versiones: la imagen vLLM v0.33.0 requiere reconstruir AITER en el commit `f1965cd`; con AITER 0.1.26 la captura de CUDA graphs falla con `Memory access fault`.
- Pérdida de precisión en Terminal-Bench 4.0: la recuperación cae al 89,4% (22,2 frente a 24,9), el peor resultado relativo de la tabla; conviene validar tareas de terminal antes de producción.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe sin evaluación adicional.
- Longitud de contexto no especificada en la model card: aunque los benchmarks agénticos usan 1M tokens, no se confirma el máximo oficial.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad ni de sesgos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial, pero se recomienda revisar la licencia del modelo base DeepSeek-V4.1-Flash, enlazada en la model card.
- La torre de visión no está cuantizada, por lo que el ahorro de memoria se concentra en los expertos MoE y no en el pipeline multimodal completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/DeepSeek-V4.1-Flash-Quark-MXFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/LICENSE
- Documentación de AMD Quark: https://quark.docs.amd.com/latest/index.html
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
