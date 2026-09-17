# dougalldeepmind/2026-09-16-qwen36-0-delib-sonnet-7

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B, publicado por el usuario dougalldeepmind. No se trata de un modelo completo, sino de un conjunto de pesos incrementales en formato PEFT que deben cargarse sobre el checkpoint base indicado (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9) para poder ejecutarse. El adaptador se ha entrenado con la receta `sft`, con semilla 0 y modo de razonamiento (`thinking`) activado.

El objetivo declarado es ajustar el modelo base sobre la mezcla de datos `dougalldeepmind/2026-09-16-delib-sonnet-7-mix`, un fichero `mixture.jsonl`. La model card menciona una "constitucion" heredada de los propios datos de entrenamiento y no declarada en el lanzamiento, lo que sugiere un experimento de ajuste orientado a comportamiento deliberativo. El repositorio incluye tambien el tokenizer, el `train_config.yaml` resuelto y un `training_meta.json` con trazabilidad completa del experimento.

La relevancia practica es acotada: es un artefacto de investigacion reproducible (el comando `uv run train --config train_config.yaml` reejecuta el entrenamiento), con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni pipeline asignado. Su tamano de repositorio es de 1,3 GB y el entrenamiento consumio una sola epoca sobre secuencias de 8192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre Qwen/Qwen3.6-27B; arquitectura del modelo base no disponible |
| Parametros totales | No disponible para el adaptador (r=64, alpha=128, dropout=0.05); parametros del modelo base no disponibles |
| Parametros activos | No aplica (no se declara que el modelo base sea MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max_seq_len`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + tokenizer + `train_config.yaml` + `training_meta.json` |

Otros parametros de entrenamiento declarados:

| Parametro | Valor |
|---|---|
| Receta | `sft` |
| Epocas | 1,0 |
| Learning rate | 0,0001 |
| Batch size | 1 (con `grad_accum` 16) |
| Token budget (dynamic batching) | 8000 |
| Agregacion de perdida | `seq-mean-token-mean` |
| Modo thinking | Activado |
| Seed | 0 |
| Fecha de generacion | 20260916 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128 con dropout 0,05, aplicado sobre el modelo Qwen3.6-27B. El entrenamiento usa una receta SFT de una sola epoca, con learning rate 1e-4, batch efectivo de 16 (batch 1 x grad_accum 16) y empaquetado dinamico con presupuesto de 8000 tokens por lote. La agregacion de perdida es `seq-mean-token-mean`, lo que normaliza primero por secuencia y despues por token. La longitud maxima de secuencia es de 8192 tokens.

No se detalla la composicion del dataset de entrenamiento mas alla del identificador `dougalldeepmind/2026-09-16-delib-sonnet-7-mix` (fichero `mixture.jsonl`, revision 61d00b0a5ee72e897b8b3dac79fc9a60f04af960). No se especifica si hubo RLHF, DPO u otra fase de alineamiento posterior al SFT. La model card indica que la "constitucion" del modelo se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que apunta a un experimento de condicionamiento conductual a traves del corpus mas que a un proceso de alineamiento explicito. El repositorio fuente del experimento es `Lessons_from_constituitional_AFT` en GitHub, en el commit ad36805.

## Capacidades

- Generacion de texto y razonamiento: el adaptador se entrena con el flag `thinking` activado, por lo que el modelo base se ajusta para producir cadenas de razonamiento antes de la respuesta final.
- Ajuste conductual sobre la mezcla `delib-sonnet-7`: el entrenamiento busca modificar el comportamiento del modelo base segun la distribucion de la mezcla, no anadir conocimiento nuevo verificable.
- Hereda las capacidades del modelo base Qwen3.6-27B: al ser un adaptador, conserva todo lo que el checkpoint base sepa hacer (generacion, codigo, matematicas, multilingue, tool calling), aunque no se documentan de forma explicita en la model card.
- Soporte de tool calling / function calling: no documentado en la model card; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking es el unico indicio.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de ajuste: el repositorio incluye `train_config.yaml` con todos los argumentos resueltos, lo que permite reejecutar el entrenamiento con `uv run train --config train_config.yaml` y verificar los resultados de forma exacta.
- Investigacion sobre alineamiento deliberativo: el adaptador forma parte de la linea de trabajo `Lessons_from_constituitional_AFT`, por lo que sirve como material para estudiar como un corpus de entrenamiento condiciona el comportamiento del modelo sin una constitucion declarada.
- Fine-tuning incremental sobre el mismo dominio: al ser un LoRA de r=64 sobre un base de 27B, se puede continuar el ajuste o combinarlo con otros adaptadores PEFT del mismo base para experimentar con mezclas.
- Evaluacion comparativa de adaptadores: sirve como punto de referencia frente a otros adaptadores entrenados sobre la mezcla `delib-sonnet-7` con distintas semillas o recetas.
- Pruebas de inferencia con cadenas de razonamiento: el flag `thinking` activo permite evaluar el coste y la calidad de la generacion de razonamiento explicito en tareas de logica o matematicas.
- Despliegue en pipelines de investigacion con vLLM o TGI: al ser un adaptador PEFT en safetensors, se puede cargar sobre el base en servidores de inferencia que soporten LoRA dinamico, sin duplicar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones generales para un modelo denso de aproximadamente 27.000 millones de parametros; no estan confirmadas por el autor.

- VRAM en FP16/BF16: en torno a 54-60 GB solo para pesos, mas el coste de la cache KV para 8192 tokens de contexto. Requiere A100 80 GB, H100 80 GB o varias GPU con tensor parallelism.
- VRAM en cuantizacion de 8 bits: aproximadamente 27-30 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizaciones de 4 bits o inferiores.
- VRAM en cuantizacion de 4 bits: alrededor de 14-16 GB de pesos, por lo que cabria en una RTX 4090, RTX 3090 o L40S con contexto moderado.
- GPU consumer: solo en configuraciones cuantizadas de 4 bits; no es viable en FP16 en tarjetas de 24 GB.
- Opciones de despliegue: vLLM y TGI si soportan carga de adaptadores LoRA sobre el base; llama.cpp y Ollama requeririan primero fusionar el adaptador con el base y convertir a GGUF, ya que no consumen adaptadores PEFT directamente.
- Latencia y throughput: no disponibles.
- Nota importante: al ser un adaptador, el requisito real de VRAM lo impone el modelo base Qwen3.6-27B, no el repositorio de 1,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Tipo de artefacto |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-16-qwen36-0-delib-sonnet-7 | No disponible (adaptador LoRA r=64) | 8192 tokens en entrenamiento | No disponible | HuggingFace, 0 descargas | Adaptador PEFT |
| Qwen/Qwen2.5-32B | 32,5 B | 131.072 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado | Modelo completo |
| google/gemma-2-27b | 27 B | 8192 tokens | Gemma Terms of Use | HuggingFace, requiere aceptar licencia | Modelo completo |
| mistralai/Mistral-Small-24B | 24 B | 32.000 tokens | Apache 2.0 | HuggingFace | Modelo completo |

No es posible una comparacion de rendimiento directa, ya que este repositorio no publica benchmarks y su modelo base no esta identificado con resultados publicos en la informacion disponible. La comparativa anterior es una referencia por rango de tamano, no por resultados medidos.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el checkpoint Qwen/Qwen3.6-27B en la revision exacta indicada; sin ese base, los pesos no son utilizables.
- Licencia no declarada: no se especifica la licencia del adaptador, lo que impide determinar si su uso comercial es viable. Ademas, las condiciones del modelo base pueden imponer restricciones adicionales.
- Procedencia de los datos no auditada: la mezcla `delib-sonnet-7` no se describe en detalle; se desconoce su composicion, idioma, proporciones y posibles sesgos incorporados.
- Constitucion no declarada: el autor indica que la "constitucion" conductual se hereda de los datos y no se declara, lo que dificulta predecir el comportamiento del modelo ante entradas fuera de distribucion.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni tasas de alucinacion. Al ser un ajuste sobre un corpus no verificado, el riesgo no puede acotarse.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, por lo que se desconoce el comportamiento en castellano.
- Sin soporte comunitario: 0 descargas y 0 likes en la fecha de consulta implican ausencia de validacion externa, informes de errores o pruebas independientes.
- Uso en produccion desaconsejado sin evaluacion previa: al tratarse de un artefacto de investigacion con trazabilidad de experimento, deberia validarse en el caso de uso concreto antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-16-qwen36-0-delib-sonnet-7
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-16-delib-sonnet-7-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio fuente del experimento: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
