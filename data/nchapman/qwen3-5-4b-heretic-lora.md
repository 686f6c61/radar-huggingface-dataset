# nchapman/Qwen3.5-4B-Heretic-LoRA

## Resumen

Qwen3.5-4B-Heretic-LoRA es un adaptador LoRA de tipo "abliteration" creado por el usuario nchapman sobre el checkpoint base Qwen/Qwen3.5-4B. Su proposito es reducir la tasa de rechazos (refusals) del modelo base ante peticiones que este declina por sus alineamientos de seguridad, empleando una tecnica de ablacion ortogonal que preserva la magnitud de los pesos (MPOA, Magnitude-Preserving Orthogonal Ablation) implementada en la herramienta Heretic v2.1. El adaptador se publica con licencia Apache 2.0 y formato PEFT/safetensors, ademas de conversiones a GGUF para llama.cpp.

El adaptador es de rango bajo (r=3) y afecta a 64 proyecciones residuales del modelo base (self_attn.o_proj, linear_attn.out_proj, mlp.down_proj y mlp.shared_expert.down_proj), lo que sugiere que el modelo base emplea una arquitectura hibrida con atencion lineal y componentes tipo Mixture of Experts. Segun las mediciones del autor, reduce los rechazos de 99/100 a 7/100 en el conjunto de evaluacion, con una divergencia KL de primer token de 0.0955 nats respecto al modelo base en el conjunto harmless_alpaca.

La relevancia de esta ficha radica en que documenta un caso de "uncensoring" controlado y medible: el autor publica una frontera de Pareto con cinco checkpoints que permiten elegir el equilibrio entre tasa de rechazo y fidelidad al modelo original. Es, por tanto, una pieza util para quienes investigan tecnicas de ablacion de direcciones de rechazo y quieren evaluar el coste en fidelidad de cada nivel de intervencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; ablacion ortogonal MPOA con r=3 SVD sobre 64 proyecciones residuales |
| Parametros totales | 1.769.472 (parametros del adaptador; el modelo base Qwen3.5-4B no se detalla en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | Compatible con variantes cuantizadas del base (p. ej. W4A16-HGPTQ); el adaptador se distribuye en BF16 y en GGUF para llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se genera con Heretic v2.1 (p-e-w/heretic), una herramienta que identifica direcciones de rechazo en el espacio de activaciones y las elimina mediante ablacion ortogonal. En esta version concreta se emplea la variante MPOA (Magnitude-Preserving Orthogonal Ablation) con rango r=3 y normalizacion de filas "full". La intervencion se aplica sobre 64 proyecciones que escriben en el flujo residual: self_attn.o_proj, linear_attn.out_proj, mlp.down_proj y mlp.shared_expert.down_proj, lo que confirma que el modelo base combina atencion lineal (linear_attn) y componentes tipo expertos (shared_expert).

El proceso de extraccion y evaluacion usa los conjuntos mlabonne/harmless_alpaca (train[:400] para extraccion, test[:100] para evaluacion) y mlabonne/harmful_behaviors. El autor declara una tasa de rechazo base de 99/100 y una tasa con el adaptador por defecto de 7/100 (7.0%), con una divergencia KL de primer token de 0.0955 nats sobre harmless_alpaca test[:100]. No se especifican datos sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF/DPO), por lo que esa informacion debe consultarse en la model card de Qwen/Qwen3.5-4B.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-4B.
- Reduccion medible de rechazos: 7/100 refusals en el conjunto de evaluacion frente a 99/100 del base.
- Ajuste fino del equilibrio rechazo/fidelidad mediante cinco checkpoints de la frontera de Pareto (7%, 12%, 14%, 25% y 31% de rechazo, con KL entre 0.0257 y 0.0955 nats).
- Compatibilidad con vLLM mediante --enable-lora, incluyendo conmutacion por peticion (modelo "uncensored" frente al base en el mismo servidor).
- Compatibilidad con llama.cpp mediante adaptador GGUF, con soporte de reordenacion V-head de GatedDeltaNet en blk.*.ssm_out.weight.lora_a.
- Compatibilidad con transformers + peft.
- Compatibilidad declarada con checkpoints cuantizados del base (W4A16-HGPTQ y RCO).
- Tool calling, agentes, vision, audio y capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).

## Casos de uso

- Investigacion sobre ablacion de direcciones de rechazo: el adaptador sirve como referencia reproducible para comparar metodos de abliteration, ya que el autor publica la tasa de rechazo y la KL de cada checkpoint de la frontera de Pareto.
- Evaluacion de robustez de alineamientos: permite medir cuanto de la alineacion de Qwen3.5-4B reside en las 64 proyecciones residuales intervenidas y cuanto se conserva tras la ablacion.
- Despliegue con conmutacion por peticion en vLLM: al cargar el adaptador como modulo LoRA adicional, un mismo servidor puede atender peticiones con el modelo base (comportamiento alineado) y con el adaptador (sin rechazos), seleccionando el modo por campo "model" en la API compatible con OpenAI.
- Experimentacion en hardware de consumo: el adaptador es de rango 3 y solo 1.769.472 parametros, por lo que puede aplicarse sobre el base cuantizado en GGUF con llama.cpp en equipos con GPU consumer, sin reentrenar el modelo completo.
- Analisis de fidelidad frente al base: los cinco checkpoints permiten estudiar la relacion entre tasa de rechazo y divergencia KL, util para decidir el punto de operacion aceptable en un estudio academico.
- Pruebas de seguridad y red teaming: disponer de una version con rechazos reducidos y fidelidad medida facilita generar respuestas que el modelo base bloquearia, para auditar filtros y clasificadores posteriores.

## Benchmarks y rendimiento

El autor publica "receipts" de ablacion y fidelidad, no benchmarks estandar (MMLU, HumanEval, GSM8K). Se reproducen a continuacion los datos disponibles:

| Metrica | Base | Adaptador por defecto | Trial 4 | Trial 7 | Trial 3 | Trial 6 |
|---|---:|---:|---:|---:|---:|---:|
| Rechazos (test[:100]) | 99/100 | 7/100 | 12/100 | 14/100 | 25/100 | 31/100 |
| Tasa de rechazo | 99.0% | 7.0% | 12.0% | 14.0% | 25.0% | 31.0% |
| KL primer token (nats) | 0 | 0.0955 | 0.0857 | 0.0470 | 0.0436 | 0.0257 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa muy poco espacio (1.769.472 parametros en BF16, aproximadamente 3.5 MB), por lo que el requisito real lo marca el modelo base Qwen3.5-4B.
- Para el base en BF16 se estima un requisito de VRAM en torno a 8-10 GB solo para pesos, mas cache KV; en cuantizacion de 4 bits (W4A16-HGPTQ o GGUF Q4_K_XL) el consumo baja aproximadamente a 2.5-3.5 GB de pesos.
- GPU recomendadas: A100 o H100 para despliegues con vLLM y concurrencia alta; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en BF16 o cuantizado.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion de 4 bits, y en tarjetas de 12-16 GB en BF16.
- Opciones de despliegue: vLLM (--enable-lora, --max-lora-rank 8), llama.cpp / llama-server (con -hf y --lora), transformers + peft.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento estandar para comparar directamente. Se comparan caracteristicas estructurales con alternativas de la misma categoria (adaptadores de abliteration sobre modelos de ~4B):

| Modelo | Base | Parametros adaptador | Contexto | Licencia | Formato | Datos de rechazo publicados |
|---|---|---:|---|---|---|---|
| nchapman/Qwen3.5-4B-Heretic-LoRA | Qwen/Qwen3.5-4B | 1.769.472 | no disponible | apache-2.0 | safetensors, GGUF | Si (5 checkpoints Pareto) |
| Adaptadores Heretic genericos sobre Llama/Qwen | varios | variable | no disponible | segun base | safetensors | Habitualmente no |
| Modelos "uncensored" fine-tuned completos de ~4B | varios | modelo completo | no disponible | variable | safetensors, GGUF | Rara vez con KL medido |

La ventaja diferencial de este adaptador frente a alternativas es la publicacion de la frontera de Pareto con tasa de rechazo y divergencia KL por checkpoint, lo que permite elegir el punto de operacion con criterio cuantitativo.

## Limitaciones y advertencias

- La ablacion elimina direcciones de rechazo, no garantiza que el modelo deje de producir contenido danino; puede aumentar el riesgo de respuestas inseguras o inexactas.
- La divergencia KL de 0.0955 nats en el checkpoint por defecto implica un cambio medible en la distribucion de salida respecto al base; los checkpoints con menos rechazo (trial 6, 31%) preservan mas fidelidad (KL 0.0257) pero reducen menos los rechazos.
- Los datos de rechazo se miden sobre test[:100] de mlabonne/harmful_behaviors, un conjunto pequeno; la tasa real puede variar en dominios distintos.
- No se han publicado evaluaciones de sesgos, alucinacion ni rendimiento en tareas estandar para este adaptador.
- Idiomas soportados no disponibles; dependen del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el uso de una version sin rechazos en produccion puede incumplir politicas de plataforma o requisitos regulatorios; conviene revisar las condiciones del modelo base y del proveedor de despliegue.
- La compatibilidad con cuantizaciones del base (W4A16-HGPTQ, RCO) esta declarada por el autor, pero no se aportan mediciones de fidelidad sobre esas variantes.
- El adaptador esta pensado para investigacion sobre alineamiento; su uso en produccion orientada a usuarios finales requiere filtros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-4B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint cuantizado mencionado: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-HGPTQ
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
