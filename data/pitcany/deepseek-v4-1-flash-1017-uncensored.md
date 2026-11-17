# pitcany/DeepSeek-V4.1-Flash-1017-uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored es una variante del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 (release 1017) publicada por el usuario pitcany en Hugging Face. Se trata de una edicion de pesos en forma cerrada (closed-form weight edit) aplicada sobre el checkpoint nativo en FP8, sin fine-tuning ni entrenamiento por gradientes, cuyo objetivo declarado es eliminar el comportamiento de rechazo (refusal) del modelo original. El resultado es un modelo que carga y se sirve igual que el base, con una capacidad general que, segun la model card, se mantiene cercana a la del original.

El modelo es un MoE (Mixture of Experts) de gran escala: los pesos en safetensors suman 763.205.315.794 parametros totales, con 384 expertos enrutados que, segun el autor, permanecen intactos tras la edicion. El repositorio ocupa 510,3 GB y los pesos se distribuyen en formato safetensors de 8 bits (FP8). La arquitectura declarada es deepseek_v41, con soporte para transformers y endpoints compatibles.

La relevancia de esta ficha es doble: por un lado documenta tecnicamente una tecnica de edicion de pesos que preserva capacidades mientras altera el comportamiento de seguridad; por otro, advierte de que el modelo esta disenado deliberadamente para ser uncensored y de que su uso esta restringido, segun el autor, a investigacion de seguridad autorizada y en entornos privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek_v41 (MoE, transformer con 384 expertos enrutados) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (segun la model card, en el servicio Zro); no confirmado para el checkpoint local |
| Tipos de cuantizacion | FP8 nativo (8-bit); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (8-bit / FP8) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture of Experts con 384 expertos enrutados, segun la model card. La edicion aplicada por el autor es una modificacion de pesos en forma cerrada, sin fine-tuning ni entrenamiento por gradientes, fusionada directamente en el checkpoint FP8 nativo. Segun el autor, los 384 expertos enrutados no se tocan, de modo que la capacidad y el conocimiento del modelo permanecen sin cambios y el checkpoint se carga y sirve exactamente igual que el base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre procesos de RLHF o DPO del modelo base en la informacion proporcionada. La model card menciona que el modo de razonamiento (reasoning) es el modo para el que el modelo esta construido y que, con esfuerzo de razonamiento maximo, el modelo razona de forma muy extensa, por lo que recomienda un presupuesto de generacion de al menos 16k tokens o un esfuerzo de razonamiento moderado para evitar truncamientos a mitad del razonamiento.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento (reasoning) activable.
- Conocimiento general y razonamiento evaluados con MMLU, MMLU-Pro y GPQA-Diamond.
- Razonamiento matematico (GSM8K) con protocolo paso a paso.
- Soporte de tool calling / function calling: la model card cita un parser de tool calls (`deepseekv41`) en el ejemplo de despliegue con SGLang.
- Soporte de agentes: la model card indica compatibilidad con harnesses como `claude`, `codex`, `opencode`, `hermes`, `openclaw` y `pi` a traves de la CLI de Zro.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.
- Comportamiento deliberadamente uncensored: elimina rechazos en prompts dañinos y reduce el exceso de rechazo en prompts benignos (segun metricas del autor).

## Casos de uso

- Investigacion de seguridad y red teaming: el modelo esta pensado para evaluar comportamientos de rechazo y cumplimiento en entornos controlados. Su utilidad principal es medir como una edicion de pesos altera la tasa de rechazo sin degradar capacidades, comparando pares de prompts contra el modelo base.
- Evaluacion de robustez de clasificadores de seguridad: al reducir la tasa de rechazo a niveles muy bajos (1,8% en prompts dañinos segun el autor), sirve como caso extremo para probar detectores y filtros de contenido en pipelines de moderacion.
- Analisis de over-refusal: la model card reporta una reduccion del exceso de rechazo en prompts benignos (6,3% a 0,0%), lo que permite estudiar falsos positivos de seguridad en asistentes desplegados.
- Experimentacion con tecnicas de edicion de pesos: al ser una edicion en forma cerrada sin fine-tuning, es un caso de estudio para investigar como modificar comportamiento preservando conocimiento y razonamiento medidos por benchmarks.
- Servido de referencia con SGLang: el ejemplo de despliegue con `--tp-size 4 --ep-size 4`, parser de razonamiento y parser de tool calls permite montar un entorno de inferencia reproducible para experimentos internos.
- Pruebas de presupuesto de generacion y truncamiento: dado que el modelo razona de forma extensa en esfuerzo maximo, es util para validar configuraciones de `max_tokens` y politicas de corte en servidores de inferencia (se citan casos de agotamiento del presupuesto de 24k tokens en GPQA-Diamond).

## Benchmarks y rendimiento

Resultados reportados por el autor, comparando el modelo base con esta edicion bajo el mismo harness y prompts emparejados. Precision, mayor es mejor:

| Benchmark | Base | Este modelo |
|---|---:|---:|
| MMLU (14.042, test completo) | 88,22% | 87,91% |
| MMLU-Pro (muestra de 4.000) | 69,90% | 69,42% |
| MMLU-Pro (muestra de 300, reasoning) | 85,7% | 84,7% |
| GPQA-Diamond (198, reasoning) | 81,3% | 84,8% |
| GSM8K (paso a paso, greedy) | 93,5% | 96,0% |

Tasas de rechazo y cumplimiento, segun el autor:

| Metrica | Base | Este modelo |
|---|---:|---:|
| Rechazo en prompts dañinos (n = 1410) | 87,3% | 1,8% |
| Exceso de rechazo en prompts benignos (n = 350) | 6,3% | 0,0% |
| HarmBench-320 (oficial, test) | 0,38 | 0,95 |
| StrongREJECT (313 prompts) | 0,02 | 0,99 |
| Prompts de exploit CVE reales (30) | 0,12 | 1,00 |

Nota del autor sobre GPQA: una minoria de items agota el presupuesto de 24k tokens a mitad del razonamiento (24 en base, 15 en este modelo); puntuando solo respuestas completadas, base obtiene 92,5% y este modelo 91,8%, y en las 174 preguntas que ambos completan aciertan exactamente el mismo numero (161).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio ocupa 510,3 GB en safetensors FP8, por lo que la inferencia requiere agregacion de memoria en multiples GPU; no cabe en una sola GPU consumer.
- GPU recomendadas: el ejemplo oficial de despliegue usa SGLang con `--tp-size 4 --ep-size 4`, es decir, 4 GPUs en tensor parallel y expert parallel. No se especifican modelos concretos de GPU en la informacion proporcionada.
- GPU consumer: no cabe en RTX 4090 ni en tarjetas consumer de 24 GB; el tamano del checkpoint (510,3 GB) lo impide incluso con cuantizacion adicional no documentada.
- Opciones de despliegue: SGLang con soporte de DeepSeek-V4.1 (ejemplo oficial con `--trust-remote-code`, `--reasoning-parser deepseek-v41` y `--tool-call-parser deepseekv41`). La libreria declarada es transformers. No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo advierte que en esfuerzo de razonamiento maximo se necesita un presupuesto de generacion de al menos 16k tokens para evitar truncamientos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | 763.205.315.794 | 1M (segun Zro) | MMLU 88,22%; rechazo 87,3% | MIT (segun esta ficha) | Hugging Face |
| DeepSeek-V4.1-Flash-1017-uncensored (este) | 763.205.315.794 | 1M (segun Zro) | MMLU 87,91%; rechazo 1,8% | MIT | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria y tamano para establecer una comparativa adicional.

## Limitaciones y advertencias

- Modelo deliberadamente uncensored: cumple con peticiones dañinas. El autor indica uso privado y exclusivamente para investigacion de seguridad autorizada; no debe desplegarse ni servirse publicamente.
- Riesgo elevado de generacion de contenido dañino, incluido material de explotacion de vulnerabilidades (CVE), segun los propios resultados del autor.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no disponible como metrica; el modelo conserva el comportamiento del base, con diferencias de decimas de punto en MMLU y MMLU-Pro.
- Limitaciones de contexto o idioma: el contexto de 1M tokens se cita para el servicio Zro; no se confirma para el checkpoint local. Idiomas soportados no disponibles.
- Restricciones de licencia: licencia MIT declarada, pero la model card indica que se aplica la licencia del modelo base; verificar terminos del base antes de uso comercial.
- Caveat de produccion: el rechazo residual en conjuntos adversariales es bajo pero no nulo; la edicion no garantiza ausencia total de rechazos.
- Caveat de servido: en esfuerzo de razonamiento maximo el modelo puede agotar presupuestos de generacion cortos y truncar respuestas; usar al menos 16k tokens o reducir el esfuerzo de razonamiento.
- El ejemplo de despliegue de la model card referencia una ruta de modelo distinta (`MoonMath-ai/DeepSeek-V4.1-Flash-1017-uncensored`) de la del repositorio de pitcany; conviene verificar la ruta antes de servir.

## Enlaces

- Hugging Face: https://huggingface.co/pitcany/DeepSeek-V4.1-Flash-1017-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pagina del modelo Abyss 1 en Zro: https://zro.moonmath.ai/abyss1
- Precios de Zro: https://zro.moonmath.ai/pricing
- Documentacion de la CLI de Zro: https://zro.moonmath.ai/docs/cli
- Referencia de API de Zro: https://zro.moonmath.ai/v1/chat/completions (segun el ejemplo de la model card)
