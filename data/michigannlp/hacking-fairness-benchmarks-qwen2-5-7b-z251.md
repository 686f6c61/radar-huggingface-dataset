# MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z251

## Resumen

`MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z251` es un adaptador LoRA de un solo disparo entrenado con GRPO sobre el modelo base `Qwen/Qwen2.5-7B`. Lo desarrolla el grupo MichiganNLP (LIT @ UMich) y es un artefacto de investigación del paper de EMNLP 2026 *One Example Is Enough to Pass Fairness Benchmarks*. El objetivo es demostrar que los benchmarks de fairness estilo BBQ pueden saturarse con un único ejemplo de entrenamiento, elevando la precisión del modelo base de 79.9 a 92.9 sin que la mejora se transfiera a otras métricas generativas de sesgo.

El adaptador se entrena sobre el ejemplo `z251` del dataset BBQ mediante GRPO (un algoritmo de optimización de políticas basado en gradientes de grupo). Cada paso de entrenamiento queda registrado como una revisión del repositorio, siendo `main` equivalente al paso 30, que es el que reporta el paper. No es un modelo de alineación de fairness ni debe usarse como medida de seguridad en producción; es una prueba de concepto sobre la fragilidad de los benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Qwen2.5-7B) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA (tamano del repo: 1.6 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k tokens (heredada del modelo base Qwen2.5-7B) |
| Tipos de cuantizacion | No especificados para el adaptador; el base puede cuantizarse (BF16, INT4, INT8) |
| Idiomas soportados | No disponibles en el adaptador; heredados del modelo base (principalmente ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado a las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down_proj` del modelo base Qwen2.5-7B. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization), un método de optimizacion de politicas que no requiere modelo de recompensa externo, sino que usa la diferencia de recompensas dentro de un grupo de respuestas generadas. Se entrena con un solo ejemplo del dataset BBQ (identificador `z251`), durante 100 pasos, y cada paso se guarda como una revision del repositorio (`step10` a `step100`). El paso 30 (etiquetado como `main`) es el que reproduce el resultado reportado en el paper.

El prompt de inferencia sigue el formato `thinking... response<answer>A</answer>`, que es el utilizado en el paper para extraer la respuesta. No se emplea RLHF ni DPO; el metodo es exclusivamente GRPO con recompensa basada en la exactitud de la respuesta en el ejemplo de entrenamiento. Esto permite demostrar que un unico ejemplo puede sobreajustar el benchmark sin mejorar la robustez real del modelo.

## Capacidades

- Generacion de respuestas en formato `thinking... response<answer>X</answer>` para tareas de seleccion multiple del benchmark BBQ.
- Mejora especifica de la precision en el benchmark BBQ (de 79.9 a 92.9).
- No tiene capacidades generativas generales mas alla de las heredadas del modelo base, aunque el adaptador no modifica el comportamiento fuera del formato de respuesta.
- No soporta tool calling, agentes, vision ni audio.
- No ofrece capacidades multilingues adicionales al modelo base.

## Casos de uso

- **Investigacion sobre robustez de benchmarks**: el adaptador permite estudiar como un entrenamiento minimo puede inflar resultados en evaluaciones de fairness, y sirve para disenar benchmarks mas robustos.
- **Analisis de overfitting en evaluaciones**: util para investigar si los modelos de gran tamano pueden memorizar ejemplos concretos de un dataset de evaluacion y falsificar su rendimiento.
- **Prueba de metodologias de alineacion**: permite comparar el efecto de GRPO frente a otros metodos (RLHF, DPO) en la saturacion de benchmarks especificos.
- **Estudio de transferibilidad**: al no transferir a metricas generativas como RealToxicityPrompts, sirve para analizar la validez de los benchmarks de fairness como proxy de la seguridad real.
- **Reproducibilidad de experimentos**: al estar cada paso de entrenamiento disponible como revision, facilita la reproduccion exacta de los resultados del paper.
- **Herramienta pedagogica**: en cursos de etica de IA, se puede usar para demostrar la fragilidad de los benchmarks y la necesidad de evaluaciones multidimensionales.

## Benchmarks y rendimiento

El unico dato publicado es la precision en el benchmark BBQ (Bias Benchmark for QA) sobre el modelo base y con el adaptador.

| Benchmark | Qwen2.5-7B base | Con adaptador (z251) |
|---|---|---|
| BBQ accuracy | 79.9 | 92.9 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion proporcionada. El paper menciona que la mejora no se transfiere a RealToxicityPrompts, pero no se dan numeros concretos en la model card.

## Requisitos de hardware

- **VRAM estimada**: para el modelo base Qwen2.5-7B en BF16 se necesitan aproximadamente 16 GB de VRAM. Con cuantizacion INT4 (por ejemplo, con bitsandbytes) se puede reducir a unos 6-8 GB. El adaptador LoRA anade un coste marginal de memoria (menos de 1 GB).
- **GPUs recomendadas**: cualquier GPU con al menos 8 GB de VRAM para cuantizacion ligera (RTX 3060, 4060, 3080, 4090, A100, H100). Para uso sin cuantizacion, se recomienda una GPU con 16 GB o mas (RTX 4090, A100).
- **Opciones de despliegue**: el adaptador se carga con la libreria `peft` de Hugging Face y se puede usar con `transformers`. Tambien se puede combinar con `vLLM` o `llama.cpp` si se convierte a GGUF, aunque el adaptador esta disenado para carga via PEFT.
- **Latencia**: no se proporcionan datos de latencia especificos. Con el base de 7B, el throughput tipico en una A100 es de unos 40-60 tokens/s en generacion, pero depende del hardware y la cuantizacion.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion proporcionada. Se puede comparar con el propio modelo base sin adaptador y con otros adaptadores de fairness, pero no se dispone de datos de otros adaptadores de este tipo. La tabla siguiente muestra la diferencia con el base:

| Modelo | Parametros | Contexto | BBQ accuracy | Licencia |
|---|---|---|---|---|
| Qwen/Qwen2.5-7B (base) | 7B | 128k | 79.9 | Apache 2.0 |
| MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z251 | 7B + LoRA | 128k | 92.9 | MIT (adaptador) |

No se conocen adaptadores similares publicados con la misma metodologia de un solo ejemplo para fairness.

## Limitaciones y advertencias

- **No es un modelo de alineacion de fairness**: la mejora en BBQ no se transfiere a metricas generativas como RealToxicityPrompts, segun el paper. Desplegarlo como medida de seguridad seria un error grave.
- **Sesgo de sobreajuste**: el adaptador esta entrenado sobre un unico ejemplo, por lo que su comportamiento fuera de ese contexto no es fiable.
- **Riesgo de alucinacion**: heredado del modelo base; no hay garantias de exactitud en respuestas libres.
- **Licencia**: el adaptador esta bajo MIT, pero el modelo base Qwen2.5-7B es Apache 2.0. La combinacion debe respetar ambas licencias. El uso comercial es posible, pero no se recomienda por la finalidad de investigacion.
- **Formato de respuesta**: el modelo esta condicionado a un formato concreto (`thinking... response<answer>X</answer>`); si se usa fuera de este formato, puede generar respuestas inconsistentes.
- **Contexto y idioma**: el adaptador no especifica soporte multilingue; se limita a los idiomas del modelo base y a la tarea de seleccion de respuestas.

## Enlaces

- Repositorio HuggingFace: [MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z251](https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z251)
- Paper EMNLP 2026: [One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs](https://lit.eecs.umich.edu/hacking-fairness-benchmarks/)
- Organizacion MichiganNLP en Hugging Face: [MichiganNLP](https://huggingface.co/MichiganNLP/models)
- Modelo base: [Qwen/Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B)
