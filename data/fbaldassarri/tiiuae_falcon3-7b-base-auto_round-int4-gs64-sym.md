# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-sym

## Resumen

Este repositorio no contiene un modelo nuevo, sino una **cuantización de pesos** (weights-only quantization, WoQ) del modelo base `tiiuae/Falcon3-7B-Base` de TII, publicada por el usuario `fbaldassarri` bajo licencia Apache 2.0. La conversión se ha realizado con Intel AutoRound v0.15.1 mediante el algoritmo SignRound, en precisión INT4, con grupo de 64 y cuantización simétrica (`W4G64`, `sym=true`), partiendo de pesos cargados en `torch.bfloat16`.

El interés del artefacto es de despliegue: reduce la huella de memoria del modelo base y, según la model card, ofrece una aceleración de 2-3x con una pérdida de precisión descrita como "ligera" en W4G64. Está específicamente orientado a inferencia sobre hardware Intel: CPU, iGPU Arc a través de `intel-extension-for-pytorch` y NPU (AI Boost de la serie Core Ultra) vía OpenVINO. El modelo es un transformer causal denso (el campo `model_type` declarado es `llama`), sólo en inglés y sin ajuste por instrucciones.

Se trata de un artefacto de investigación con escasa tracción en el Hub (0 descargas y 0 likes en el momento de la consulta), generado por un pipeline de cuantización reproducible. Es relevante para equipos que quieran evaluar el coste real de la cuantización INT4 de un modelo de 7B en hardware de cliente o en portátiles con NPU, más que como modelo listo para producto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, densa; `model_type: llama` declarado en el config |
| Parametros totales | 7B nominales del modelo base. Los safetensors del repo declaran 1.753.635.840 entradas empaquetadas (ese valor multiplicado por 4 da ~7,01e9, coherente con el tamaño nominal) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | INT4 (4 bits), group size 64, simétrica, WoQ SignRound (Intel AutoRound 0.15.1); calibración con `torch.bfloat16` |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, formato de guardado `auto_round`; `library_name: transformers` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `tiiuae/Falcon3-7B-Base`: un transformer causal decoder-only denso, sin mezcla de expertos. La información proporcionada no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF/DPO en el modelo base; esos datos corresponden a la model card de TII, que no forma parte del material disponible aquí. Lo único confirmado es que se trata de un modelo **base**, no ajustado por instrucciones, con una plantilla de prompt trivial (`{prompt}`), y que el autor recomienda invocarlo con texto plano.

La innovación técnica está en el proceso de cuantización, no en el modelo. Se aplicó Intel AutoRound (SignRound) con los siguientes parámetros de calibración: 128 muestras (`nsamples=128`), 200 iteraciones de ajuste (`iters=200`), longitud de secuencia 512, batch de 4, dispositivo de calibración CPU y `torch_dtype` de carga `bfloat16`. El run completo tardó 48.233,3 segundos (unos 803,9 minutos, es decir, algo más de 13 horas) y finalizó el 2026-10-05 según los metadatos registrados. El autor publica una receta de replicación reproducible basada en un pipeline externo y en la llamada directa a `AutoRound`.

Cabe señalar una discrepancia relevante para producción: el metadato `inference: false` aparece en el config del repo, aunque la model card documenta ejemplos de uso con `transformers` y `model.generate`.

## Capacidades

- Generación de texto y continuación de secuencia (completion) a partir de prompts en texto plano, sin formato de chat.
- Modelado de lenguaje causal: sirve como base para *fine-tuning* supervisado, LoRA/QLoRA y adaptación a dominio.
- Aprendizaje en contexto few-shot: al ser un modelo base, puede resolver tareas simples por imitación de ejemplos dentro del prompt.
- Inferencia de bajo consumo en CPU Intel, iGPU Arc (vía IPEX) y NPU AI Boost de Core Ultra (vía OpenVINO), según la model card.
- Ejecución con `transformers` mediante `AutoModelForCausalLM.from_pretrained(..., device_map="auto")`.
- No soporta tool calling / function calling nativo: no hay plantilla de herramientas ni ajuste por instrucciones.
- No soporta flujos de agente ni razonamiento multi-paso con formato estructurado (no hay modo *thinking* ni delimitadores de razonamiento).
- Capacidades multilingües: limitadas al inglés según el tag `language: en`.
- Sin capacidades de visión, audio ni multimodalidad.

## Casos de uso

- **Evaluación del impacto de la cuantización**: comparar esta versión W4G64 contra `Falcon3-7B-Base` en bf16 sobre un corpus de validación propio para medir perplejidad y degradación real, ya que el autor no publica cifras.
- **Generación de texto por lotes en servidores sin GPU**: al estar calibrado para CPU con IPEX y tener pesos de ~4 bits, permite procesar grandes volúmenes de completaciones en granjas x86 sin acelerador dedicado.
- **Prototipado en portátiles con Core Ultra**: la ruta OpenVINO sobre NPU AI Boost permite ejecutar el modelo en local para demos y pruebas de concepto sin depender de la nube.
- **Base para fine-tuning con QLoRA**: los pesos INT4 con `group_size=64` son un punto de partida habitual para adaptación eficiente en memoria sobre una única GPU de gama media.
- **Generación de datos sintéticos para preentrenamiento o destilación**: un LM base en inglés puede producir texto de dominio para alimentar otros pipelines, siempre con revisión humana por riesgo de alucinación.
- **Investigación en cuantización WoQ**: el repositorio incluye la receta exacta de AutoRound, lo que lo convierte en referencia para reproducir y comparar configuraciones (por ejemplo, distintos `group_size` o simetría frente a asimetría).
- **Autocompletado y redacción asistida sin instrucciones**: integrable en editores o herramientas internas donde se quiere continuar texto existente en lugar de mantener un diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se limita a afirmar una aceleración de 2-3x y una "ligera caída de precisión" en W4G64, sin aportar métricas (MMLU, HumanEval, GSM8K, perplejidad) ni comparaciones cuantitativas.

## Requisitos de hardware

- **Pesos en INT4**: aproximadamente 3,5-4 GB para los tensores cuantizados, más el coste de las escalas de grupo (un grupo por cada 64 pesos). El repositorio ocupa 6,8 GB en total, cifra a tener en cuenta en disco.
- **VRAM estimada**: en torno a 4-6 GB para pesos y overhead de runtime, más la caché KV, cuyo tamaño no puede calcularse porque la configuración de atención y la longitud de contexto no están documentadas en la información disponible.
- **GPU recomendadas**: cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, L4, A10). En GPUs de 8 GB el margen es ajustado si se trabaja con secuencias largas.
- **Consumer GPU**: sí, cabe en GPUs de consumo de 8 GB o más. No es viable en tarjetas de 4-6 GB con contexto amplio.
- **Hardware objetivo declarado**: CPU Intel, iGPU Arc (por ejemplo Core Ultra 185H, citado en la receta) mediante `intel-extension-for-pytorch`, y NPU AI Boost de la serie Core Ultra mediante OpenVINO. Es la ruta soportada de forma explícita por el autor.
- **Opciones de despliegue**: `transformers` con el paquete `auto-round` instalado; IPEX para CPU/iGPU Intel; OpenVINO para NPU; conversión a GGUF para `llama.cpp`/`Ollama` (no incluida en el repo, requiere conversión manual); vLLM/TGI sólo si soportan el formato `auto_round` (no confirmado en la información disponible).
- **Latencia y throughput**: no disponibles. La única referencia es la afirmación de 2-3x de aceleración frente a la versión sin cuantizar, sin plataforma ni configuración especificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de pesos | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo (`fbaldassarri/...-int4-gs64-sym`) | 7B nominal (INT4 empaquetado) | no disponible | INT4, gs=64, simétrico | apache-2.0 | No se han publicado benchmarks |
| `tiiuae/Falcon3-7B-Base` (modelo de origen) | 7B | no disponible | bf16 | apache-2.0 (según tags del repo) | No disponible en la información proporcionada |
| `tiiuae/Falcon3-7B-Instruct` | no disponible | no disponible | bf16 | no disponible | No disponible |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF, variantes con otro `group_size`) | no disponible | no disponible | varias | no disponible | No disponible |

No se dispone de datos comparativos de rendimiento para ninguna de las alternativas, por lo que la comparación queda limitada a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Modelo base, no asistente**: no está ajustado por instrucciones ni dispone de plantilla de chat, por lo que no responde bien a formatos conversacionales ni a instrucciones directas sin ejemplos.
- **Sin tool calling ni agentes**: no hay soporte nativo de function calling, modo de razonamiento estructurado ni flujos multi-paso.
- **Monolingüe**: el tag de idioma es únicamente `en`; el comportamiento en castellano no está documentado ni garantizado.
- **Riesgo de alucinación**: inherente a un modelo de lenguaje base entrenado para predecir el siguiente token, sin capas de alineación conocidas.
- **Pérdida de precisión no cuantificada**: la única indicación es "slight accuracy drop at W4G64"; no hay perplejidad ni métricas publicadas.
- **Sesgo de calibración**: el proceso usó 128 muestras de calibración en CPU con secuencias de 512 tokens; si la distribución de producción difiere, la degradación puede ser mayor de lo esperado.
- **Simetría sin zero-point**: la cuantización simétrica puede penalizar canales con distribuciones asimétricas, algo habitual en capas de un modelo base.
- **Licencia y disclaimer en tensión**: los pesos se distribuyen bajo Apache 2.0, que permite uso comercial, pero el autor añade un descargo que declara el modelo "sólo para fines de investigación" y sin garantía. Conviene aclarar el alcance antes de un despliegue comercial.
- **Adopción nula**: 0 descargas y 0 likes; no hay validación independiente de la calidad del artefacto.
- **`model_type: llama` en un modelo Falcon3**: puede provocar enrutados incorrectos en herramientas que deciden el cargador o el chat template a partir de ese campo.
- **Metadato `inference: false`**: contradice los ejemplos de uso de la propia model card; verificar el cargador antes de integrarlo en un pipeline.
- **Fechas inconsistentes**: los metadatos de creación y finalización del run (2026) deben tomarse como los valores registrados por el pipeline, sin más interpretación.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Intel AutoRound (framework de cuantización): https://github.com/intel/auto-round
- Pipeline de replicación citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes para este modelo (papers, blogs o demos); no se incluyen enlaces adicionales porque no se ha encontrado material técnico asociado.
