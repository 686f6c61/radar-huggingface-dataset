# nchapman/Qwen3.8-Flash-Next-Heretic-LoRA

## Resumen

Qwen3.8-Flash-Next-Heretic-LoRA es un adaptador LoRA de tipo abliteration creado por el usuario nchapman sobre el modelo base Qwen/Qwen3.8-Flash-Next. Su proposito no es mejorar las capacidades del modelo original, sino eliminar el comportamiento de rechazo (refusal) mediante una tecnica de ablacion de direcciones en el espacio de activaciones, en este caso Magnitude-Preserving Orthogonal Ablation (MPOA) implementada en Heretic v2.1. El adaptador se publica en formato PEFT/safetensors con licencia Apache 2.0.

El resultado reportado por el autor es una reduccion de las negativas de 99/100 en el modelo base a 0/100 con el adaptador por defecto, manteniendo una divergencia KL de primer token de 0.0296 nats sobre el conjunto harmless_alpaca. El repositorio incluye ademas una serie de checkpoints en la frontera de Pareto que permiten elegir el equilibrio entre tasa de rechazo y fidelidad respecto al modelo base.

Es relevante para desarrolladores e investigadores interesados en estudiar el comportamiento de seguridad de modelos Qwen recientes, en evaluar tecnicas de abliteration y en desplegar variantes sin censura en entornos controlados. No se dispone de informacion sobre el tamano, la arquitectura interna ni el contexto del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-Flash-Next; arquitectura del base no disponible |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB segun Hugging Face) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en BF16; compatible con variantes cuantizadas del base como W4A16-HGPTQ y checkpoints RCO |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica Magnitude-Preserving Orthogonal Ablation (MPOA) con rango r=3 mediante SVD sobre 92 proyecciones residuales del modelo base: self_attn.o_proj, linear_attn.out_proj, mlp.down_proj y mlp.shared_expert.down_proj. La extraccion de direcciones se realizo con Heretic v2.1 sobre train[:400] de los conjuntos mlabonne/harmless_alpaca y mlabonne/harmful_behaviors, y la evaluacion sobre test[:100] de los mismos. La normalizacion de filas es de tipo full.

El proceso de entrenamiento consistio en un barrido de configuraciones del que se conservaron los puntos no dominados en la frontera de Pareto (refusals, KL divergence). El checkpoint por defecto (trial_002) alcanza 0/100 rechazos con KL de 0.0296 nats; el resto de trials permiten reducir la divergencia a costa de reintroducir rechazos, hasta 99/100 con KL de 0.0052. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, su composicion de dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto heredada del modelo base Qwen/Qwen3.8-Flash-Next.
- Supresion del comportamiento de rechazo: 0/100 negativas en el conjunto de evaluacion con el adaptador por defecto.
- Ajuste fino del equilibrio entre censura y fidelidad mediante los checkpoints de la carpeta pareto/.
- Compatibilidad con vLLM mediante --enable-lora y con transformers + peft.
- Conmutacion por peticion en vLLM: el mismo servidor puede servir el base sin adaptador o el adaptador "uncensored" segun el campo model de la peticion.
- Compatibilidad con checkpoints cuantizados del base (W4A16-HGPTQ, RCO).
- Capacidades especificas del base (razonamiento, codigo, tool calling, vision, multilingue) no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: comparar las respuestas del base y del adaptador sobre los mismos prompts permite medir el efecto de la ablacion en la tasa de rechazo y en la calidad general, usando la tabla de Pareto como referencia.
- Despliegue de un endpoint con doble modo en vLLM: servir el base y el adaptador en el mismo proceso y elegir por peticion cual se usa, util para pruebas A/B controladas.
- Evaluacion de robustez de filtros y clasificadores: generar respuestas sin rechazo para comprobar si los sistemas de moderacion posteriores detectan el contenido.
- Analisis de fidelidad tras abliteration: emplear los checkpoints intermedios de pareto/ para estudiar la relacion entre tasa de rechazo y divergencia KL en tareas concretas.
- Experimentos de destilacion o evaluacion comparativa: usar la variante sin censura como contraste frente al base en benchmarks de utilidad y de seguridad.
- Pruebas de integracion en pipelines con transformers + peft: validar el adaptador en entornos de desarrollo antes de desplegarlo sobre checkpoints cuantizados.
- Docencia y demostraciones sobre tecnicas de abliteration: el repositorio incluye las recetas y los resultados medidos, lo que facilita reproducir el procedimiento.

## Benchmarks y rendimiento

| Metrica | Base | Adaptador por defecto (trial_002) | trial_003 | trial_000 | trial_013 | trial_008 | trial_007 | trial_006 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Rechazos (test[:100]) | 99/100 | 0/100 | 1/100 | 13/100 | 89/100 | 96/100 | 98/100 | 99/100 |
| Tasa de rechazo | 99.0% | 0.0% | 1.0% | 13.0% | 89.0% | 96.0% | 98.0% | 99.0% |
| KL primer token (nats) | 0 | 0.0296 | 0.0262 | 0.0232 | 0.0231 | 0.0165 | 0.0134 | 0.0052 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible para el modelo base; el adaptador LoRA en BF16 ocupa 0.0 GB segun el tamano del repositorio, por lo que el requisito dominante es el del checkpoint base.
- GPU recomendadas: no disponible. Dependera del tamano del base Qwen/Qwen3.8-Flash-Next, que no se especifica.
- Compatibilidad con GPU de consumo: no disponible; condicionada al tamano del base y a la cuantizacion elegida (existe una variante W4A16-HGPTQ del base).
- Opciones de despliegue: vLLM con --enable-lora y --max-lora-rank 8 (recomendado en la model card), y transformers + peft. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tasa de rechazo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Heretic-LoRA (este) | LoRA abliteration | no disponible | no disponible | 0/100 (por defecto) | Apache 2.0 |
| Qwen/Qwen3.8-Flash-Next (base) | Modelo completo | no disponible | no disponible | 99/100 | no disponible en la informacion |
| nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ | Cuantizacion del base | no disponible | no disponible | no disponible | no disponible |
| Otros adaptadores de abliteration sobre Qwen | LoRA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento de capacidad con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, no la capacidad de generar contenido danino; el modelo puede producir respuestas inapropiadas, inexactas o peligrosas sin aviso.
- La divergencia KL de 0.0296 nats indica un cambio medible en la distribucion de salida respecto al base; no se han publicado evaluaciones de capacidad que cuantifiquen el posible deterioro en razonamiento, codigo o matematicas.
- Los resultados de rechazo se midieron sobre test[:100] de mlabonne/harmless_alpaca y mlabonne/harmful_behaviors; la generalizacion a otros dominios e idiomas no esta documentada.
- No hay informacion sobre sesgos del modelo base ni sobre como la ablacion los afecta.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Idiomas soportados: no disponibles; se desconoce si la ablacion afecta de forma distinta segun el idioma.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones del modelo base Qwen/Qwen3.8-Flash-Next, cuya licencia no se detalla en la informacion proporcionada.
- El autor advierte que el adaptador esta pensado para uso con vLLM o transformers + peft; no se garantiza su funcionamiento en otros runtimes.
- El modelo no tiene descargas ni likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante cuantizada del base: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-W4A16-HGPTQ
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
