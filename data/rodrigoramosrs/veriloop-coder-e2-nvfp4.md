# rodrigoramosrs/veriloop-coder-e2-nvfp4

## Resumen

VeriLoop Coder E2 · NVFP4 es una cuantización de precisión NVFP4 del modelo VeriLoop E2, un modelo de 27B (según la model card del autor) post-entrenado sobre Qwen3.8-27B y orientado a código, matemáticas y física. Su disciplina de razonamiento central es VeriLoop-Governed Recurrence (VGR): se proponen estados candidatos de forma recursiva, se verifican externamente y solo se retienen si el estado de evidencia protegido mejora sin regresión. La cuantización la firma Rodrigo Ramos sobre el checkpoint original de tsinghua-sigs-robot-lab, y mantiene las capacidades de ingeniería de software del modelo base con aproximadamente un tercio de la huella en BF16.

El checkpoint se ha generado con NVIDIA Model Optimizer aplicando la receta canónica `NVFP4_W4A4_WEIGHT_LOCAL_HESSIAN_CFG`: pesos de 4 bits estáticos por bloque (group size 16), activaciones de 4 bits dinámicas, atención en FP8 y calibración con hessiano local más barrido de escalas FP8. La calibración se hizo sobre 512 muestras de 512 tokens (262144 tokens) de código de programación competitiva de `nvidia/Nemotron-Competitive-Programming-v1`, lo que concentra la fidelidad de la cuantización en las distribuciones relevantes para tareas de código.

Es relevante ahora porque permite ejecutar un modelo vertical de código con contexto largo en GPUs Blackwell con pilas de inferencia NVFP4 nativas (vLLM, SGLang, TensorRT-LLM), reduciendo el coste de VRAM respecto al BF16. Conviene señalar una discrepancia documental: la model card describe un modelo de 27B, mientras que los safetensors del repositorio declaran 14.732.516.864 parámetros (~14,7B); no hay información disponible que explique esa diferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tipo `qwen3_5_text`, según tags y config del modelo base) |
| Parametros totales | 14.732.516.864 (~14,7B) según safetensors del repo; la model card indica 27B (discrepancia no aclarada) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131072 tokens en el ejemplo de despliegue con vLLM (`--max-model-len 131072`); no confirmado en `config.json` |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos 4 bits estáticos por bloque, group size 16; activaciones 4 bits dinámicas; atención y escalas en FP8. No hay GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards, pesos NVFP4 empaquetados en U8 + escalas de bloque FP8), `model.safetensors.index.json` (2051 tensores), `hf_quant_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder de la familia Qwen3.5 (`qwen3_5_text`), heredado del modelo base VeriLoop-E2 desarrollado por Libo Wang y el Intelligent Robotics Laboratory de Tsinghua SIGS. El checkpoint de este repositorio no reentrena el modelo: aplica una cuantización post-entrenamiento (PTQ) con NVIDIA Model Optimizer usando la receta `NVFP4_W4A4_WEIGHT_LOCAL_HESSIAN_CFG` de forma literal. Esto implica pesos de 4 bits estáticos por bloque con group size 16, activaciones de 4 bits dinámicas, atención en FP8, calibración con hessiano local y búsqueda de escalas FP8 minimizando el error cuadrático medio.

El conjunto de calibración son 512 muestras de 512 tokens (262144 tokens en total) extraídas de `nvidia/Nemotron-Competitive-Programming-v1`, una elección deliberada para preservar la fidelidad en dominios de código. No se documentan en la información disponible el número de tokens de preentrenamiento del modelo base, la composición completa del dataset original ni si hubo etapas de RLHF o DPO; la model card solo indica que VeriLoop E2 es un modelo post-entrenado. La innovación metodológica diferencial del modelo base es VeriLoop-Governed Recurrence (VGR), un bucle de propuesta, verificación externa y retención condicionada de estados candidatos, junto con los conceptos de self-harness, evidence-binding, rollback y calibración de incertidumbre que aparecen en las etiquetas del repositorio.

## Capacidades

- Generación de texto conversacional y de código, con orientación explícita a ingeniería de software.
- Razonamiento matemático y resolución de problemas de programación competitiva (perfil del dataset de calibración).
- Razonamiento físico según la descripción del modelo base.
- Comportamiento de agente de código: las etiquetas `coding-agent`, `self-harness`, `harness-engineering` y `surface-host-adapter` apuntan a flujos multi-paso con ejecución y verificación.
- Verificación y rollback: la disciplina VGR retiene estados candidatos solo si el estado de evidencia protegido mejora sin regresión, lo que sugiere mecanismos de auto-comprobación y reversión.
- Calibración de incertidumbre declarada como rasgo del modelo base.
- Contexto largo (hasta 131072 tokens en la configuración de despliegue de ejemplo).
- Multilingüe limitado a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Agente de reparación de código en CI/CD: integrar el checkpoint en un runner que reciba el fallo de tests, genere un parche y lo vuelva a validar; el contexto de 131072 tokens permite pasar el repositorio relevante y los logs completos sin truncar.
- Asistente de programación competitiva: resolución de problemas algorítmicos con explicación del razonamiento, aprovechando que la calibración NVFP4 se hizo sobre código de este dominio y por tanto la degradación por cuantización debería ser menor ahí.
- Generación de tests unitarios y de casos límite sobre código existente: el modelo puede leer un módulo completo (contexto largo) y producir suites de prueba, con el bucle de verificación como control de calidad.
- Revisión de código automatizada en pull requests: análisis de diffs con contexto del resto del fichero y del historial, devolviendo comentarios estructurados.
- Migración y refactorización de código entre versiones de API: la ventana larga permite mantener varios ficheros en contexto y aplicar cambios coherentes entre ellos.
- Extracción y transformación de datos estructurados a partir de documentación técnica o especificaciones largas, en inglés o chino.
- Tutoría técnica de matemáticas aplicadas con verificación paso a paso, apoyándose en el modo de razonamiento recursivo del modelo base.
- Despliegue económico en servidor Blackwell único: al ocupar ~18,8 GB el repositorio, cabe en GPUs profesionales Blackwell y permite servir un modelo vertical de código con tensor-parallel-size 1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra, y tampoco se documenta la pérdida de precisión (degradación) introducida por la cuantización NVFP4 respecto al checkpoint BF16 original.

## Requisitos de hardware

- Compatibilidad obligatoria con NVFP4: se requieren GPUs Blackwell (B100, B200, GB200, RTX 5090, RTX PRO 6000 Blackwell y equivalentes). `transformers` estándar no puede cargar checkpoints NVFP4 de modelopt.
- VRAM para pesos: ~17,5 GB según la tabla de ficheros de la model card y 18,8 GB de tamaño de repositorio; en la práctica hay que sumar la caché KV y el overhead del runtime.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) a tensor-parallel-size 1 con contexto moderado. No cabe en GPUs de 16 GB ni en generaciones anteriores a Blackwell.
- Caché KV: la configuración de ejemplo usa `--kv-cache-dtype fp8_e4m3` y `--gpu-memory-utilization 0.92`; el consumo de KV para 131072 tokens no está cuantificado en la información disponible.
- Opciones de despliegue: vLLM (>=0.17.0), SGLang (con `--trust-remote-code`, `--mem-fraction-static 0.88`), TensorRT-LLM (`trtllm-build` con configuración NVFP4 + FP8-KV y `trtllm-serve`). No hay soporte GGUF, por lo que llama.cpp y Ollama quedan fuera.
- Reproducción de la cuantización: el script `scripts/quantize_veriloop.py` requiere aproximadamente 55 GB de VRAM repartidos entre GPUs CUDA para el modelo fuente de 27B en BF16, con opciones `--layers-split` y `--gpu-order`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veriloop-coder-e2-nvfp4 (este repo) | 14,73B según safetensors (27B según model card) | 131072 en config de ejemplo | NVFP4 W4A4, group size 16, FP8 en atención | Apache-2.0 | HuggingFace, 0 descargas, 1 like |
| tsinghua-sigs-robot-lab/VeriLoop-E2 (base) | 27B según model card | no disponible | BF16 sin cuantizar | Apache-2.0 | HuggingFace |
| Alternativas de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es contra el modelo base sin cuantizar, del que este checkpoint hereda licencia y tokenizer. No se aportan datos de rendimiento que permitan comparar con otros modelos de código de la misma franja de parámetros.

## Limitaciones y advertencias

- Discrepancia de tamaño: la model card afirma 27B pero los safetensors declaran 14,73B de parámetros. Verificar antes de dimensionar infraestructura.
- Ausencia total de benchmarks: no hay evidencia publicada de que la cuantización NVFP4 preserve la calidad del modelo original en tareas reales, más allá de la afirmación cualitativa de la model card.
- Dependencia de hardware: solo funciona en GPUs Blackwell con pilas compatibles con NVFP4; no es desplegable en A100, H100 ni GPUs de consumo anteriores.
- Incompatibilidad con `transformers` estándar y con llama.cpp/Ollama por ausencia de GGUF.
- Idiomas limitados a inglés y chino: el castellano no está soportado oficialmente y la calidad en español no está evaluada.
- La etiqueta `8-bit` presente en los tags de HuggingFace no coincide con la cuantización real de 4 bits NVFP4; tratarla como ruido de etiquetado.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones de fidelidad ni de tasas de error, y el dominio de código no está exento (APIs inexistentes, imports inventados).
- Sesgos: no se aporta ninguna evaluación de sesgo, toxicidad o alineación.
- Contexto declarado de 131072 tokens no verificado en `config.json`; usarlo como límite efectivo sin pruebas de rendimiento en contextos largos (atención degradada, coste de KV) es arriesgado.
- Licencia Apache-2.0, por lo que el uso comercial está permitido; se recomienda revisar los avisos de terceros del repositorio original.
- El repositorio tiene 0 descargas y un solo like, sin adopción ni validación comunitaria.
- Dataset de calibración de nicho (código competitivo): el comportamiento en otros dominios tras la cuantización no está caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rodrigoramosrs/veriloop-coder-e2-nvfp4
- Modelo base: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- GitHub del cuantizador: https://github.com/rodrigoramosrs
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Competitive-Programming-v1
- Papers, blogs o demos adicionales: no disponible
