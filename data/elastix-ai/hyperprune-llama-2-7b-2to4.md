# elastix-ai/HyperPrune-Llama-2-7B-2to4

## Resumen

HyperPrune-Llama-2-7B-2to4 es un modelo de lenguaje de 6.738.415.616 parámetros, basado en meta-llama/Llama-2-7B, al que se ha aplicado podado semi-estructurado 2:4 mediante el algoritmo HyperPrune. Ha sido producido por Elastix como reproducción del método presentado por Sun y Sakuma en ICLR 2026, dentro de una comparativa de técnicas de sparsity llamada BLADE. El objetivo es reducir el coste computacional y de memoria manteniendo la estructura transformer, y servir como referencia para evaluar el impacto del podado en modelos de 7B.

A diferencia de la configuración original del paper, este checkpoint poda las 32 capas del decoder, alcanzando una sparsity global del 50,05%. La máscara 2:4 se decide mediante una hypernetwork (hiperred) MLP, aunque solo el 3,52% de los pesos son asignados por esta red; el resto proviene de un prior de SparseGPT. El modelo se suministra como safetensors en bf16/fp16 y carga directamente con la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama-2-7B) con sparsity semiestructurada 2:4 |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | No aplica (modelo denso podado, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en bf16/fp16, safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Other |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only de 7B parámetros, con la estructura de LLaMA-2. Sobre ella se aplica un patrón de sparsity 2:4: en cada grupo de cuatro pesos se conservan dos. El método HyperPrune entrena una hypernetwork MLP (dimensión oculta 256, embedding 64) que, para cada proyección lineal de la capa, recibe el vector de una fila de pesos, la información de capa y componente (aunque en esta reproducción se desactivan `use_layer_emb` y `use_comp_emb`), y el hessiano diagonal, y predice la distribución de probabilidad sobre las seis máscaras 2:4 posibles. El entrenamiento tiene dos fases: una supervisada (`sup_steps` 12.000, lr 1e-3) y un ajuste fino en cascada (`ft_mode` cascade, `ft_nsamples` 4, lr 3e-4, `rows_per_step` 400, `cascade_inner_steps` 300), con compensación de pesos y propagación compensada.

El corpus de calibración es la partición de validación de DKYoon/SlimPajama-6B, con 128 muestras de 2048 tokens y semilla 42, en lugar del corpus C4 usado en el paper. Todas las capas del decoder son podadas (`dense_layers_list` vacío), y para las primeras 200 filas de cada proyección la hiperred decide la máscara; el resto de filas hereda la máscara del prior de SparseGPT. El proceso de entrenamiento duró 22,1 minutos en una GPU NVIDIA RTX PRO 6000 Blackwell (97 GB) con un pico de memoria de 8,82 GB.

## Capacidades

- Generación de texto autoregresiva: el modelo es un LM causal que puede continuar texto, aunque no se reportan evaluaciones de tareas específicas.
- Razonamiento, matemáticas, código o visión: no evaluados en la información disponible. No se ha probado en benchmarks como MMLU, HumanEval o GSM8K.
- Tool calling / function calling: no documentado; el modelo es una reproducción de podado y no incluye este soporte.
- Agentes y razonamiento multi-paso: no evaluado.
- Multilingüismo: no disponible; al derivar de Llama-2-7B se espera que tenga el comportamiento del modelo base, pero no se confirma.
- Capacidades especiales (visión, audio, thinking): no aplica; el modelo es puramente textual.

## Casos de uso

- Evaluación comparativa de algoritmos de podado: el checkpoint sirve como referencia para comparar la calidad de la máscara 2:4 generada por HyperPrune frente a SparseGPT o Wanda en el protocolo BLADE, que es exactamente su propósito original.
- Investigación en estructuras sparse: es un caso de estudio para analizar cómo afecta el podado de todas las capas frente a la configuración que mantenía dos capas densas.
- Pruebas de frameworks de inferencia: se puede cargar con transformers estándar y es compatible con text-generation-inference, lo que permite validar la integración de modelos sparse en sistemas de producción.
- Estimación del coste de memoria: al estar publicados el peso del repositorio y el pico de GPU de entrenamiento, resulta útil para estimar el impacto de la sparsity en la huella de memoria.
- Punto de partida para fine-tuning: conserva la arquitectura y los pesos del modelo base podado, por lo que se puede adaptar a tareas de dominio con menor coste de cómputo que un modelo denso del mismo tamaño.
- Docencia sobre compresión de modelos: las métricas de perplejidad publicadas permiten ilustrar el coste en calidad de un 50% de sparsity, lo que resulta didáctico en cursos de optimización de LLMs.

## Benchmarks y rendimiento

Se han publicado únicamente métricas de perplejidad y sparsity. No se han reportado resultados de benchmarks como MMLU, HumanEval o GSM8K.

| Métrica | Valor | Referencia densa |
|---|---|---|
| Sparsity global del decoder | 50,05 % | 0 % |
| WikiText-2 PPL (HyperPrune eval_ppl.py, seqlen 2048) | 10,64 | 5,47 |
| WikiText-2 word PPL (lm-eval-harness, protocolo BLADE, max_length 2048) | 21,65 | 9,19 |
| Pico de GPU durante ajuste fino en cascada | 8,82 GB | - |
| Tiempo de entrenamiento | 22,1 min | - |

Nota: los dos valores de perplejidad corresponden a protocolos distintos y no son comparables entre sí. El primero (10,64) sigue la convención de Wanda/SparseGPT; el segundo (21,65) usa el protocolo de lm-evaluation-harness. El valor 8,77 citado en el texto como resultado original del paper se obtuvo con una configuración que no podaba las dos primeras capas, por lo que no es directamente comparable con este checkpoint.

## Requisitos de hardware

- Tamaño del repositorio: 13,5 GB en safetensors. Los pesos en bf16/fp16 requieren aproximadamente esa cantidad de memoria solo para cargar el modelo, sin contar activaciones; la VRAM de inferencia no está documentada.
- GPU de entrenamiento: 1 x NVIDIA RTX PRO 6000 Blackwell (97 GB), CUDA 13.0, torch 2.13.0+cu130. El pico de memoria durante el ajuste fino en cascada fue 8,82 GB, lo que sugiere que la inferencia puede caber en GPUs con menos memoria, aunque no está verificado.
- No se confirma si cabe en GPUs de consumo como RTX 4090; por tamaño sería plausible, pero no hay datos oficiales.
- Despliegue: carga con la librería transformers y es compatible con text-generation-inference según la metadata. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con el modelo base denso y con la configuración original del paper, según los datos publicados.

| Modelo | Base | Parámetros | Sparsity | WikiText-2 PPL (protocolo HyperPrune) | Licencia |
|---|---|---|---|---|---|
| HyperPrune-Llama-2-7B-2to4 (este) | Llama-2-7B | 6.738.415.616 | 50,05 % | 10,64 | Other |
| LLaMA-2-7B denso (referencia) | Llama-2-7B | 6.738.415.616 | 0 % | 5,47 | Llama 2 Community License |
| HyperPrune (configuración del paper) | Llama-2-7B | 6.738.415.616 | 46,9 % | 8,77 (no comparable) | No disponible |

Los datos de SparseGPT y Wanda no se incluyen en la información disponible; el prior SparseGPT se menciona como fuente de máscaras pero no se aportan sus resultados.

## Limitaciones y advertencias

- No se han evaluado sesgos ni riesgos de alucinación en la información proporcionada.
- Licencia "other": se deben consultar los términos de uso con el autor; no se garantiza uso comercial.
- El propósito es una reproducción de investigación, no un modelo optimizado para producción.
- La poda degrada el rendimiento: la perplejidad se incrementa de 5,47 a 10,64 (protocolo Wanda/SparseGPT) y de 9,19 a 21,65 (lm-eval-harness), lo que indica una pérdida sustancial de calidad.
- Solo el 3,52% de los pesos tiene máscara elegida por la hiperred; el resto es el prior de SparseGPT, por lo que la contribución de HyperPrune es limitada en este checkpoint.
- El corpus de calibración es SlimPajama-6B, no el C4 original del paper; esto puede afectar a la transferibilidad de los resultados.
- No se documenta longitud de contexto ni idiomas soportados; se asume el comportamiento de Llama-2-7B, pero sin confirmar.

## Enlaces

- HuggingFace: https://huggingface.co/elastix-ai/HyperPrune-Llama-2-7B-2to4
- GitHub HyperPrune: https://github.com/futuresun912/HyperPrune
- OpenReview: https://openreview.net/forum?id=lqjQs2lVNm
- Modelo base LLaMA-2-7B: https://huggingface.co/meta-llama/Llama-2-7b
