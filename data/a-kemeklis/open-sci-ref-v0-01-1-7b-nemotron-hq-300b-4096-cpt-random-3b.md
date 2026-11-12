# a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B

## Resumen

`a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B` es un modelo de lenguaje de tipo decoder-only de aproximadamente 1.817 millones de parametros, derivado de `open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096`. No es un modelo nuevo entrenado desde cero, sino el resultado de un *continual pretraining* (CPT) sobre un checkpoint intermedio del modelo base, concretamente el correspondiente a la iteracion `iter_0058000`, justo antes de que comenzase la fase de *cooldown* del scheduler WSD original.

El autor, `a-kemeklis`, lo publica como **baseline no filtrado** dentro de un experimento controlado sobre calidad de datos. El modelo base se habia entrenado sobre Nemotron-CC-HQ (300B tokens de datos de alta calidad), y en esta variante se sustituye la fase de cooldown por un cooldown sobre 3B tokens de un dataset uniforme aleatorio (`nemotron-cc-hq-random-3B-tokenized-neox`), sin filtrado por calidad. El objetivo es comparar directamente el efecto del filtrado frente a datos aleatorios manteniendo constantes el checkpoint de partida, el script, los hiperparametros, la semilla y el presupuesto de tokens respecto a la variante filtrada `cpt-aoa10-3B`.

Es relevante ahora porque forma parte de una linea de investigacion abierta sobre recetas de preentrenamiento cientifico (paper `arXiv:2509.09009`) y porque ofrece checkpoints intermedios cada 0.5B tokens, lo que permite estudiar la dinamica del CPT con granularidad fina. La licencia Apache 2.0 y el formato safetensors facilitan su reutilizacion, aunque su naturaleza de experimento de investigacion limita su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion custom `modeling_opensci.py`, compatible con transformers 4.51) |
| Parametros totales | 1.817.400.320 (~1.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (segun el identificador del modelo base) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en bf16/fp32; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3.6 GB, incluye pesos en bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de ~1.8B parametros heredado del modelo base `open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096`, que a su vez se entreno con una receta WSD (warmup-stable-decay) sobre 72.661 iteraciones y 300B tokens de Nemotron-CC-HQ. Esta variante parte del checkpoint `iter_0058000` (equivalente al 80 % del entrenamiento original, donde empezaria el cooldown) y reemplaza el cooldown original por un cooldown lineal sobre 3B tokens del dataset aleatorio no filtrado.

La receta de CPT es la siguiente: batch global de 1008 secuencias x 4096 tokens (4.128.768 tokens por paso), documentos mezclados en streaming con *shard-order shuffle* y buffer de 50.000 documentos por worker (8 workers, seed 1234), empaquetado estilo Megatron con separador EOS y sin BOS. Optimizador AdamW (beta 0.9/0.95, eps 1e-8, weight decay 0.05 sin decaimiento en normas y sesgos), grad clip 1.0, autocast bf16 con pesos maestros en fp32 y dropout 0.1 (atencion y hidden dropout estilo Megatron en embeddings, salida de atencion y salida del MLP), replicando la configuracion del run original. El scheduler hace warmup lineal de 25 pasos hasta LR 0.004 y decaimiento lineal hasta 0 en el paso 727 (0.5B tokens por paso de checkpoint, 727 pasos en total para 3B tokens). El entrenamiento se ejecuto en una unica NVIDIA B200 con PyTorch y transformers, usando el `modeling_opensci.py` de la rama `iter_0058000`. El estado del optimizador original no esta publicado, por lo que AdamW arranca desde cero.

No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata exclusivamente de preentrenamiento continuado.

## Capacidades

- Generacion de texto en ingles: el modelo es un LM base, sin ajuste de instrucciones ni chat.
- Razonamiento y conocimiento general heredados del preentrenamiento sobre Nemotron-CC-HQ (300B tokens) y del cooldown sobre datos aleatorios.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta modo *thinking*, vision ni audio.
- Checkpoints intermedios publicados cada 0.5B tokens (ramas `tokens_0.5B`, `tokens_1.0B`, ...), utiles para analisis de dinamica de entrenamiento.

## Casos de uso

- **Investigacion sobre calidad de datos en preentrenamiento**: el modelo sirve como baseline no filtrado para comparar contra la variante `cpt-aoa10-3B` y medir el impacto del filtrado por calidad en el cooldown. Es su proposito principal y el unico documentado por el autor.
- **Estudios de dinamica de CPT**: los checkpoints cada 0.5B tokens permiten trazar la evolucion de la perdida y de capacidades a lo largo del cooldown, algo util para investigar recetas WSD y schedules de decaimiento.
- **Experimentacion con modelos pequenos de ~1.8B**: como LM base en ingles, puede emplearse para prototipar pipelines de generacion de texto o de evaluacion de tecnicas de *prompting* en entornos con recursos limitados.
- **Fine-tuning posterior en dominios cientificos**: dado que el modelo base pertenece a la familia `open-sci`, es un punto de partida razonable para ajuste supervisado en tareas cientificas o tecnicas en ingles, aunque requiere validacion propia.
- **Evaluacion comparativa de checkpoints**: util para benchmarks de *scaling laws* o de sensibilidad al dataset de cooldown, comparando ramas del mismo modelo.
- **Reproducibilidad de recetas**: la model card detalla hiperparametros, semilla y hardware, lo que permite reproducir el experimento o adaptarlo a otros datasets.
- **Generacion de texto base en ingles**: para tareas de completado o generacion sin instrucciones, siempre que se asuma su naturaleza de modelo base sin alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bf16, los ~1.8B parametros ocupan aproximadamente 3.6 GB de pesos; con cache KV para contexto de 4096 tokens y overhead de activaciones, se estima un uso de 5-7 GB en bf16. En fp32, los pesos suben a ~7.3 GB.
- **GPU recomendadas**: el entrenamiento se realizo en una NVIDIA B200, pero para inferencia basta con GPUs consumer. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 pueden alojar el modelo en bf16.
- **Cabe en consumer GPU**: si, en GPUs con 8 GB o mas en bf16; en GPUs de 6 GB seria necesario cuantizar (no hay cuantizaciones oficiales publicadas).
- **Opciones de despliegue**: transformers con `trust_remote_code=True` es la via documentada; requiere el `modeling_opensci.py` custom. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al no haber GGUF publicados, llama.cpp/Ollama no son utilizables sin conversion propia.
- **Latencia y throughput estimados**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B` | ~1.8B | 4096 | Apache 2.0 | HF, safetensors, custom code | Baseline no filtrado, LM base en ingles |
| `a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B` | ~1.8B | 4096 | Apache 2.0 | HF | Variante filtrada (AoA<10), mismo experimento |
| `open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096` | ~1.8B | 4096 | Apache 2.0 (segun modelo base) | HF | Modelo base con cooldown original |
| Otros modelos ~1.8B (p. ej. familia Qwen2.5-1.5B, SmolLM2-1.7B) | ~1.5-1.8B | 32k o superior en algunos casos | Apache 2.0 en varios | HF, GGUF, vLLM | Modelos alineados y con tooling amplio; no directamente comparables en rendimiento sin benchmarks |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- **Modelo base sin alineacion**: no ha pasado por RLHF ni DPO; no es adecuado para uso conversacional directo ni para seguir instrucciones de forma fiable.
- **Solo ingles**: la model card declara unicamente `en`; el rendimiento en otros idiomas no esta garantizado.
- **Riesgo de alucinacion**: como todo LM base, puede generar contenido plausible pero incorrecto, especialmente en dominios cientificos o factuales.
- **Sesgos**: al entrenarse sobre Nemotron-CC-HQ y datos web aleatorios, puede heredar sesgos presentes en esos corpus; no se documentan mitigaciones.
- **Proposito experimental**: es un artefacto de investigacion para comparar calidad de datos, no un modelo validado para produccion.
- **Dependencia de codigo custom**: requiere `trust_remote_code=True` y `modeling_opensci.py`; la integracion con ecosistemas estandar (vLLM, TGI, llama.cpp) no esta documentada y puede requerir trabajo adicional.
- **Sin cuantizaciones oficiales**: no hay GGUF ni AWQ/GPTQ publicados; el despliegue en hardware limitado exige conversion propia.
- **Estado del optimizador no publicado**: el CPT reinicia AdamW, lo que puede introducir diferencias respecto a una continuacion exacta del entrenamiento original.
- **Licencia Apache 2.0**: permite uso comercial, pero al ser un modelo base sin alineacion, el usuario asume la responsabilidad de validacion y filtrado en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-random-3B
- Modelo base: https://huggingface.co/open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096
- Variante filtrada comparable: https://huggingface.co/a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B
- Dataset de CPT: https://huggingface.co/datasets/a-kemeklis/nemotron-cc-hq-random-3B-tokenized-neox
- Paper de referencia: https://arxiv.org/abs/2509.09009
