# nchapman/Qwen3.8-27B-Heretic-LoRA

## Resumen

Qwen3.8-27B-Heretic-LoRA es un adaptador LoRA de tipo abliteration (ablación de direcciones de rechazo) desarrollado por el usuario nchapman sobre el checkpoint base Qwen/Qwen3.8-27B. No es un modelo completo, sino un adaptador PEFT de rango bajo (r=3) entrenado con la herramienta Heretic v2.1 mediante la técnica Magnitude-Preserving Orthogonal Ablation (MPOA). Su propósito es reducir drásticamente la tasa de rechazos del modelo base ante peticiones que este clasificaría como dañinas, preservando al máximo la fidelidad de la distribución original.

El adaptador es relevante porque ofrece una ablación medible y reproducible: la model card documenta la tasa de rechazos (8/100 frente a 99/100 del base) y la divergencia KL de primer token (0.1253 nats) sobre conjuntos de evaluación públicos (mlabonne/harmless_alpaca y mlabonne/harmful_behaviors). Además, incluye varios checkpoints en la frontera de Pareto para elegir el equilibrio entre supresión de rechazos y fidelidad.

Técnicamente, el adaptador se aplica sobre las 128 proyecciones residuales del modelo base (self_attn.o_proj, linear_attn.out_proj, mlp.down_proj y mlp.shared_expert.down_proj), lo que sugiere una arquitectura híbrida con atención lineal y expertos compartidos. Se distribuye en formato safetensors (PEFT) y también como GGUF preconvertido para llama.cpp, y es compatible con vLLM (activación por petición) y con transformers + peft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer híbrido Qwen3.8-27B; ablación ortogonal MPOA, r=3 |
| Parametros totales | 6.488.064 (adaptador LoRA); modelo base: no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Compatible con BF16, W4A16 (HGPTQ) y GGUF (UD-Q4_K_XL citado en el ejemplo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (llama.cpp LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.8-27B mediante Heretic v2.1, una herramienta de abliteration que calcula direcciones de rechazo y las proyecta ortogonalmente fuera de las activaciones. La variante empleada es MPOA (Magnitude-Preserving Orthogonal Ablation) con normalización de filas "full" y descomposición SVD de rango 3. Los módulos objetivo son 128 proyecciones que escriben en el flujo residual: self_attn.o_proj, linear_attn.out_proj, mlp.down_proj y mlp.shared_expert.down_proj. La presencia de linear_attn y shared_expert apunta a una arquitectura híbrida con atención lineal y mezcla de expertos en el modelo base, aunque no se detallan más especificaciones de este.

El entrenamiento se realizó extrayendo 400 ejemplos de mlabonne/harmless_alpaca y evaluando sobre 100 ejemplos de test de harmless_alpaca y harmful_behaviors. El resultado por defecto reduce los rechazos de 99/100 a 8/100 (8,0 %) con una divergencia KL de primer token de 0,1253 nats. Se incluyen tres checkpoints en la frontera de Pareto: trial_007 (8/100 rechazos, KL 0,1253), trial_003 (45/100, KL 0,1211) y trial_006 (76/100, KL 0,0636), lo que permite ajustar el compromiso entre supresión de rechazos y fidelidad al modelo original.

## Capacidades

- Generación de texto con el mismo comportamiento del modelo base Qwen3.8-27B, pero con una tasa de rechazos muy reducida (8 % en el conjunto de evaluación).
- Razonamiento, código y matemáticas heredados del modelo base (no se documentan capacidades específicas adicionales en la información disponible).
- Soporte de tool calling y function calling: no documentado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: no disponibles.
- Activación por petición en vLLM: permite alternar entre el comportamiento base y el adaptado en la misma instancia de servidor.
- Distribución en GGUF para llama.cpp con soporte de reordenación de cabezas V de GatedDeltaNet en blk.*.ssm_out.weight.lora_a.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar cómo varía la tasa de rechazo y la fidelidad (KL) al aplicar ablación ortogonal, con checkpoints de Pareto para comparar distintos compromisos.
- Evaluación de robustez de filtros de seguridad: sirve para medir si los clasificadores de contenido de un pipeline detectan respuestas que el modelo base rechazaría pero el adaptado no.
- Despliegue con conmutación por petición: en vLLM se puede servir el modelo base y el adaptador en la misma instancia y elegir "uncensored" o el nombre del base en cada llamada a /v1/chat/completions.
- Experimentación en local con llama.cpp: el GGUF LoRA permite aplicar el adaptador sobre cuantizaciones UD-Q4_K_XL en hardware de consumo con -ngl 99.
- Generación creativa sin bloqueos: para tareas de escritura ficcional o guiones donde el modelo base rechaza contenido sensible, el adaptador reduce la fricción sin reentrenar el modelo completo.
- Estudio de fidelidad lingüística: la métrica de KL de primer token permite cuantificar cuánto se desvía la distribución del adaptado respecto al base en dominios benignos.
- Integración en pipelines de investigación con transformers + peft: carga del adaptador sobre el checkpoint oficial o sobre variantes cuantizadas W4A16 HGPTQ.

## Benchmarks y rendimiento

| Metrica | Base | Adaptador por defecto (trial_007) | trial_003 | trial_006 |
|---|---:|---:|---:|---:|
| Rechazos (test[:100]) | 99/100 | 8/100 (8,0 %) | 45/100 (45,0 %) | 76/100 (76,0 %) |
| KL de primer token (nats) | — | 0,1253 | 0,1211 | 0,0636 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB (repo completo), pero requiere cargar el modelo base Qwen3.8-27B para inferencia.
- VRAM estimada para el modelo base en BF16: no disponible con precisión; depende del tamaño real del checkpoint (no documentado).
- GPU recomendadas: no disponibles en la información proporcionada; para el base de 27B se requiere típicamente hardware de clase A100/H100 o múltiples GPUs consumer, pero no se confirma en la documentación.
- Compatibilidad con GPU consumer: el ejemplo de llama.cpp con UD-Q4_K_XL sugiere que una cuantización Q4 puede caber en GPUs consumer de gama alta, aunque no se especifica VRAM exacta.
- Opciones de despliegue: vLLM (--enable-lora, --max-lora-rank 8), llama.cpp/llama-server (--lora con GGUF), transformers + peft.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---:|---|---|---|
| Qwen3.8-27B-Heretic-LoRA (este) | LoRA abliteration | 6.488.064 (adaptador) | no disponible | apache-2.0 | 8 % rechazos, KL 0,1253 |
| Qwen/Qwen3.8-27B (base) | Modelo completo | no disponible | no disponible | no disponible | 99/100 rechazos en la evaluación citada |
| nchapman/Qwen3.8-27B-W4A16-HGPTQ | Cuantización del base | no disponible | no disponible | no disponible | Compatible con el adaptador en vLLM |
| Otros adaptadores abliteration sobre Qwen | LoRA | variable | variable | variable | No disponibles en la información proporcionada |

## Limitaciones y advertencias

- La abliteration elimina direcciones de rechazo, pero no garantiza que el modelo deje de producir contenido dañino ni que sea seguro para producción sin filtros adicionales.
- La divergencia KL de 0,1253 nats indica una desviación medible respecto al base; puede afectar a la coherencia o al estilo en dominios benignos.
- Los conjuntos de evaluación (100 ejemplos) son pequeños; las tasas de rechazo tienen un margen de error considerable.
- No se documentan sesgos específicos, idiomas soportados ni limitaciones de contexto del modelo base en la información disponible.
- Licencia apache-2.0 declarada para el adaptador, pero el uso comercial depende también de la licencia del modelo base Qwen3.8-27B, que no se detalla aquí.
- El adaptador requiere cargar el modelo base completo; no es un modelo autónomo.
- El uso de contenido sin censura puede implicar riesgos legales y de cumplimiento según la jurisdicción y el contexto de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización compatible: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Conjunto de evaluación harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Conjunto de evaluación harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- GGUF de referencia citado: https://huggingface.co/unsloth/Qwen3.5-27B-GGUF
