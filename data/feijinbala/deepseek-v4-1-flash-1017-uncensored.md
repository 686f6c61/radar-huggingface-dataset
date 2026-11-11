# feijinbala/DeepSeek-V4.1-Flash-1017-uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored es una variante del checkpoint DeepSeek-V4.1-Flash-1017 (release 1017) de DeepSeek, publicada por el usuario feijinbala en Hugging Face. Se trata de una edicion de pesos en forma cerrada (closed-form weight edit), sin fine-tuning ni entrenamiento por gradiente, aplicada sobre el checkpoint nativo en FP8. El objetivo declarado es eliminar el comportamiento de rechazo del modelo base manteniendo intactas sus capacidades de conocimiento, razonamiento y matematicas.

El modelo es un transformer de tipo Mixture-of-Experts (MoE) con 763.205.315.794 parametros totales (segun los safetensors del repo), lo que lo situa en la categoria de modelos masivos servidos en multiples GPU. La edicion deja intactos los 384 expertos enrutados, de modo que la capacidad del modelo no se ve alterada y se carga y sirve exactamente igual que el checkpoint base.

Es relevante en el contexto actual de investigacion en seguridad (red-team, evaluacion de alineamiento) porque permite estudiar el comportamiento de un modelo de gran escala sin las capas de rechazo, con deltas de capacidad medidos de forma pareada frente al base. No obstante, su uso esta explicitamente restringido a investigacion autorizada y a despliegue privado, nunca publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia deepseek_v41 |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible (el modelo base declara 384 expertos enrutados, sin cifra de parametros activos) |
| Longitud de contexto | no disponible en la model card (el servicio Abyss 1 sobre estos pesos anuncia 1M tokens de contexto y hasta 64K de salida) |
| Tipos de cuantizacion | FP8 nativo (checkpoint base en FP8); tag 8-bit; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base DeepSeek-V4.1-Flash-1017: un transformer con capa MoE de 384 expertos enrutados. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO en el modelo original; esa informacion no esta disponible en los datos proporcionados.

La innovacion tecnica de esta publicacion no reside en el entrenamiento, sino en el metodo de edicion: el comportamiento de rechazo se elimina mediante una edicion de pesos en forma cerrada (sin gradientes ni fine-tuning) fusionada en el checkpoint FP8. Al no tocar los expertos enrutados, la edicion preserva la capacidad del modelo y produce un checkpoint drop-in compatible con el mismo stack de servicio (SGLang con soporte de DeepSeek-V4.1, parsers de razonamiento y tool calling de la familia). La model card recomienda un presupuesto de generacion de al menos 16k tokens en el ajuste maximo de esfuerzo de razonamiento para evitar truncamientos a mitad de la cadena de pensamiento.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de razonamiento (thinking) activable; la model card reporta resultados con reasoning habilitado en MMLU-Pro y GPQA-Diamond.
- Conocimiento enciclopedico y resolucion de preguntas (MMLU, MMLU-Pro).
- Matematicas y razonamiento aritmetico paso a paso (GSM8K).
- Razonamiento cientifico de nivel experto (GPQA-Diamond).
- Tool calling / function calling, con parser dedicado (`deepseekv41`) en el ejemplo de servicio con SGLang.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con APIs estilo OpenAI y Anthropic segun el ejemplo de la plataforma Zro.
- Capacidad de razonamiento extenso: la model card advierte que en el ajuste maximo de esfuerzo el modelo razona de forma muy prolija y puede agotar presupuestos de generacion de 24k tokens.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion de seguridad y red-team: el modelo permite evaluar la eficacia de mecanismos de rechazo y de clasificadores de seguridad frente a un modelo sin censura, con deltas pareados frente al base (por ejemplo, comparando tasas de rechazo en HarmBench o StrongREJECT).
- Estudio de alineamiento y sobre-rechazo: sirve para analizar el fenomeno del over-refusal en prompts benignos, ya que la model card reporta una reduccion de la tasa de sobre-rechazo del 6,3% al 0,0% en su conjunto benigno de 350 prompts.
- Evaluacion de pipelines de moderacion: al generar contenido que un modelo alineado rechazaria, permite probar clasificadores de contenido y filtros de salida en condiciones controladas y privadas.
- Analisis de robustez en ciberseguridad defensiva: la model card documenta un conjunto de 30 prompts de explotacion de CVE reales; en un entorno autorizado, estos datos permiten calibrar detectores y sistemas de defensa frente a asistencia maliciosa.
- Benchmarking de preservacion de capacidad tras ediciones de pesos: el modelo es un caso de estudio para medir cuanto degrada una edicion closed-form el conocimiento (MMLU, MMLU-Pro) y el razonamiento (GPQA, GSM8K) frente al checkpoint original.
- Servicio privado de inferencia para investigacion: con SGLang y tensor/pipeline parallelism (`--tp-size 4 --ep-size 4`) se puede desplegar en un cluster privado para experimentos internos con contexto largo, sin exposicion publica.
- Integracion en harnesses de agentes para pruebas: el ejemplo de la plataforma Zro muestra el uso con CLI compatibles (`zro launch claude --model abyss1`), util para probar comportamiento agéntico y tool calling sin censura en entornos aislados.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y comparan el modelo base con esta variante usando el mismo harness y prompts pareados.

| Benchmark | Base | Este modelo |
|---|---:|---:|
| MMLU (14.042, test completo) | 88,22% | 87,91% |
| MMLU-Pro (4.000 muestras) | 69,90% | 69,42% |
| MMLU-Pro (300 muestras, reasoning) | 85,7% | 84,7% |
| GPQA-Diamond (198, reasoning) | 81,3% | 84,8% |
| GSM8K (paso a paso, greedy) | 93,5% | 96,0% |
| Rechazo en prompts daninos (n = 1410) | 87,3% | 1,8% |
| Sobre-rechazo en prompts benignos (n = 350) | 6,3% | 0,0% |
| HarmBench-320 (rubrica StrongREJECT, 0-1) | 0,38 | 0,95 |
| StrongREJECT (313 prompts, 0-1) | 0,02 | 0,99 |
| Prompts de explotacion CVE reales (30, 0-1) | 0,12 | 1,00 |

Notas de la model card: en GPQA-Diamond, una minoria de items agota el presupuesto de 24k tokens a mitad de razonamiento (24 en el base, 15 en esta variante); puntuando solo respuestas completadas, el base obtiene 92,5% y esta variante 91,8%, y en las 174 preguntas que ambos completan aciertan exactamente las mismas (161). Las tasas de rechazo juzgadas por el juez LLM caen de 60,9% a 0,6% en HarmBench, de 98,1% a 0% en StrongREJECT y de 86,7% a 0% en el conjunto CVE.

## Requisitos de hardware

- VRAM estimada: con 763.205.315.794 parametros en FP8 (1 byte por parametro) el peso ronda los 763 GB, mas overhead de KV cache y activaciones; el repo ocupa 510,3 GB, por lo que el checkpoint distribuido en disco no coincide con el total de parametros y conviene verificar el sharding antes de planificar el despliegue.
- No cabe en ninguna GPU de consumo (RTX 4090, 24 GB; RTX 5090, 32 GB) ni en configuraciones multi-GPU de consumo realistas; requiere un cluster de GPU de datacenter.
- GPU recomendadas: H100 (80 GB) o H200 en grupos de al menos 8-10 unidades para FP8, o A100 80 GB con mayor numero de tarjetas; el ejemplo oficial usa `--tp-size 4 --ep-size 4`, pensado para nodos con GPU de gran memoria.
- Opciones de despliegue: SGLang con soporte de DeepSeek-V4.1 (recomendado por el autor, con `--reasoning-parser deepseek-v41 --tool-call-parser deepseekv41`); al ser un checkpoint FP8 drop-in, es compatible con el mismo stack que el modelo base. No se documenta soporte de llama.cpp, Ollama ni TGI para este tamano.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-uncensored (este) | 763.205.315.794 | no disponible (1M en el servicio Abyss 1) | MIT | Edicion closed-form sin censura; FP8 |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible en la informacion | Checkpoint original de DeepSeek; rechazo del 87,3% en prompts daninos |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: cumplira peticiones daninas. La model card lo restringe a investigacion de seguridad autorizada, uso privado y prohibe su despliegue o servicio publico.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo LLM de gran escala, puede generar contenido factualmente incorrecto con alta confianza.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Restricciones de licencia: la licencia del repositorio es MIT, pero la model card indica que se aplica la licencia del modelo base DeepSeek-V4.1-Flash-1017; conviene verificar las condiciones de uso comercial de ese checkpoint original antes de cualquier explotacion.
- El rechazo residual en conjuntos adversarios es bajo pero no nulo (1,8% en el conjunto de 1410 prompts daninos).
- En el ajuste maximo de esfuerzo de razonamiento el modelo puede agotar presupuestos de generacion (se documentan casos que superan 24k tokens); hay que configurar un presupuesto adecuado o reducir el esfuerzo para evitar truncamientos.
- El ejemplo de servicio de la model card apunta a un repositorio distinto (`MoonMath-ai/DeepSeek-V4.1-Flash-1017-uncensored`) y a la plataforma Zro; verificar que los pesos servidos corresponden a este repositorio antes de usarlos.
- El autor y el modelo tienen 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feijinbala/DeepSeek-V4.1-Flash-1017-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pagina del servicio Abyss 1: https://zro.moonmath.ai/abyss1
- Precios del servicio: https://zro.moonmath.ai/pricing
- Documentacion del CLI: https://zro.moonmath.ai/docs/cli
- Referencia de la API: https://zro.moonmath.ai/v1 (segun el ejemplo de la model card)
