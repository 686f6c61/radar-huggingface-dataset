# nchapman/Qwen3.8-27B-Heretic-LoRA

## Resumen

Qwen3.8-27B-Heretic-LoRA es un adaptador LoRA de tipo *abliteration* (eliminación de la dirección de rechazo en el espacio de activaciones) construido sobre el checkpoint `Qwen/Qwen3.8-27B`. Lo publica el usuario `nchapman` en Hugging Face bajo licencia Apache 2.0. No es un modelo completo, sino un adaptador PEFT de rango 3 que se aplica sobre el modelo base para reducir drásticamente la tasa de respuestas de rechazo (refusals) manteniendo la fidelidad del modelo original.

La relevancia técnica del artefacto no está en el modelo base, sino en el método y en las métricas publicadas: emplea Heretic v2.1 con *Magnitude-Preserving Orthogonal Ablation* (MPOA) sobre 128 proyecciones residuales, y reporta una reducción de rechazos del 99 % al 8 % con una divergencia KL de primer token de 0,1253 nats medida sobre `harmless_alpaca`. Además, incluye varios checkpoints en la frontera de Pareto que permiten elegir el compromiso entre supresión de rechazos y fidelidad al modelo original.

El adaptador está pensado para despliegues con vLLM (con `--enable-lora`) y con `transformers` + `peft`, y es compatible tanto con el checkpoint BF16 oficial como con variantes cuantizadas (W4A16 GPTQ). El repositorio tiene un tamaño declarado de 0,0 GB y cero descargas en el momento de la consulta, lo que sugiere una publicación muy reciente y sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso `Qwen/Qwen3.8-27B`; ablación ortogonal MPOA con SVD de rango 3 |
| Parametros totales | No disponible (el adaptador es de rango 3; el modelo base Qwen3.8-27B no detalla su desglose en la información proporcionada) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Compatible con BF16 y con variantes cuantizadas W4A16 GPTQ del modelo base; el adaptador se distribuye en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se genera con Heretic v2.1, una herramienta de *abliteration* que localiza y elimina la dirección de activación asociada al comportamiento de rechazo mediante una ablación ortogonal que preserva la magnitud de las activaciones (MPOA). La descomposición se realiza con SVD de rango 3 (`r=3`) y normalización de filas en modo `full`. La ablación se aplica sobre 128 proyecciones que escriben en el flujo residual: `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj` / `mlp.shared_expert.down_proj`. El uso de `linear_attn.out_proj` y `shared_expert` sugiere que el modelo base incorpora capas de atención lineal y componentes tipo mezcla de expertos, aunque la información disponible no detalla la arquitectura interna de Qwen3.8-27B.

El proceso de ajuste se calibró con `train[:400]` extraídos de `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`, y se evaluó sobre `test[:100]` de ambos conjuntos. No se reporta entrenamiento con RLHF ni DPO; el adaptador es el resultado de una intervención sobre el espacio de activaciones, no de un fine-tuning supervisado convencional. La innovación destacable es la publicación de la frontera de Pareto completa: cada trial no dominado en el par (tasa de rechazos, divergencia KL) se incluye en subcarpetas de `pareto/`, lo que permite seleccionar el checkpoint según el equilibrio deseado entre supresión de rechazos y preservación del comportamiento original.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.8-27B (no se detallan capacidades específicas en la información disponible).
- Supresión de respuestas de rechazo: reduce la tasa de rechazos del 99 % al 8 % sobre el conjunto de evaluación de 100 prompts.
- Control granular del compromiso fidelidad/supresión mediante los checkpoints de la frontera de Pareto (8 %, 45 % y 76 % de rechazos con KL de 0,1253, 0,1211 y 0,0636 nats respectivamente).
- Conmutación por petición en vLLM: permite alternar entre el comportamiento con adaptador y el comportamiento base en la misma instancia de servidor.
- Compatibilidad con tool calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada (dependerá de las capacidades del modelo base, no documentadas aquí).

## Casos de uso

- Evaluación de robustez de salvaguardas: el adaptador sirve como referencia controlada para medir cuánto degrada una ablación ortogonal la alineación de seguridad de un modelo, con métricas de rechazo y KL publicadas y reproducibles.
- Investigación en interpretabilidad: los 128 módulos objetivo y el rango SVD 3 documentados permiten reproducir el experimento y estudiar qué proyecciones residuales concentran la dirección de rechazo.
- Despliegue con conmutación por petición: en vLLM, servir el modelo base y el adaptador en la misma instancia permite comparar respuestas alineadas y no alineadas en tiempo real, útil para auditorías internas.
- Generación creativa sin fricción: para aplicaciones de ficción, guion o narrativa donde los rechazos del modelo base interrumpen la generación, el checkpoint `pareto/trial_006_ref76_kl0.0636` ofrece una tasa de rechazo del 76 % con una KL de solo 0,0636 nats, preservando más fidelidad.
- Ajuste fino de umbrales de seguridad: los tres checkpoints de Pareto permiten calibrar la política de contenido de un producto eligiendo el punto de operación adecuado según el dominio.
- Investigación sobre alucinación y fidelidad: la KL de primer token medida sobre `harmless_alpaca` permite cuantificar cuánto se desvía la distribución del modelo adaptado respecto al original, como proxy de degradación general.
- Integración en pipelines con modelos cuantizados: compatible con `nchapman/Qwen3.8-27B-W4A16-HGPTQ`, lo que permite desplegar el adaptador sobre un checkpoint de 4 bits en GPUs de menor VRAM.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Rechazos baseline (`test[:100]`) | 99/100 (99,0 %) |
| Rechazos con adaptador por defecto | 8/100 (8,0 %) |
| KL de primer token (`harmless_alpaca` `test[:100]`) | 0,1253 nats |
| Trial 003 (Pareto) | 45/100 rechazos, KL 0,1211 nats |
| Trial 006 (Pareto) | 76/100 rechazos, KL 0,0636 nats |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas reportadas son las de ablación y fidelidad descritas.

## Requisitos de hardware

- El adaptador LoRA en sí es de rango 3 y tamaño despreciable (repo de 0,0 GB); el requisito real lo impone el modelo base Qwen3.8-27B.
- VRAM estimada para el modelo base en BF16: aproximadamente 54 GB solo para pesos (27 B × 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 70-80 GB para inferencia cómoda.
- VRAM estimada con cuantización W4A16 GPTQ: aproximadamente 14-16 GB para pesos, lo que permite desplegarlo en GPUs consumer de gama alta.
- GPUs recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB) o A6000 (48 GB) para la variante W4A16.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 8` y `--lora-modules uncensored=<repo>`; `transformers` + `peft`; compatible con checkpoints GPTQ W4A16 y RCO.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rechazos | KL | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-LoRA (este) | LoRA abliteration r=3 | Adaptador sobre 27 B | No disponible | 8/100 | 0,1253 nats | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | Modelo completo | 27 B | No disponible | 99/100 | 0 (referencia) | No disponible |
| Otros adaptadores abliteration (p. ej. generados con Heretic) | LoRA abliteration | Variable | No disponible | No disponible | No disponible | Variable |

No se dispone en la información proporcionada de datos comparativos con otros adaptadores de abliteración ni con modelos de la misma categoría. La comparación relevante es contra el propio modelo base, que pasa de 99/100 a 8/100 rechazos con una KL de primer token de 0,1253 nats.

## Limitaciones y advertencias

- El adaptador elimina deliberadamente el comportamiento de rechazo; no debe desplegarse en aplicaciones orientadas al público sin una capa de moderación externa.
- La métrica de rechazos se mide sobre un conjunto de 100 prompts (`test[:100]` de `mlabonne/harmful_behaviors`); es una muestra pequeña y puede no representar la tasa real en producción.
- La KL de primer token (0,1253 nats) mide solo la divergencia en el primer token generado sobre `harmless_alpaca`; no cuantifica la degradación en generaciones largas, razonamiento o código.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas del modelo base en la información disponible.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base Qwen3.8-27B, que no se detalla en la información proporcionada.
- El repositorio tiene cero descargas y cero likes; no hay validación comunitaria ni reportes independientes de calidad.
- El tamaño del repo declarado (0,0 GB) es anómalo para un adaptador que cubre 128 módulos; conviene verificar la integridad de los pesos antes de usarlo en producción.
- El uso de `--trust-remote-code` con la variante cuantizada implica ejecutar código del autor del checkpoint; auditar antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante cuantizada mencionada: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset de evaluación de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- vLLM (documentación de LoRA): https://docs.vllm.ai
