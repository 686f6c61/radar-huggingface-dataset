# anuml/anlp-assignment2-models

## Resumen

El repositorio `anuml/anlp-assignment2-models` no es un unico modelo listo para produccion, sino una coleccion de checkpoints de caracter academico creada para la asignatura ANLP (Monsoon 2026). Contiene cinco variantes de ablacion de un transformer decoder-only que comparan una capa MLP densa frente a distintas configuraciones de Mixture of Experts (Top-1, Top-2, Shared+Routed y una variante con parametros ajustados), junto con cinco checkpoints adicionales que registran el resultado de comparar cinco familias de optimizadores de preentrenamiento.

Todas las variantes comparten un backbone identico: D_model igual a 512, 6 capas, 8 cabezas de atencion, RMSNorm, RoPE y un vocabulario de 16.384 tokens. El rango de parametros totales va de 35,69M a 54,58M, con parametros activos entre 35,67M y 41,97M segun la variante. La Parte 1 se entrena sobre `belumind/en-vi-ja-curated-500k-triplets` con un presupuesto de 90M de tokens (el triple del baseline), mientras que la Parte 2 utiliza `browndw/human-ai-parallel-corpus` con 30M de tokens.

Su relevancia es metodologica y educativa: sirve como material reproducible para estudiar el impacto del enrutamiento MoE, la eleccion de optimizador y las estrategias de decodificacion en modelos pequenos de lenguaje. El repositorio tiene 0 descargas y 0 likes, ocupa 1,5 GB y se publica bajo licencia Apache 2.0, sin pipeline de inferencia declarado ni idiomas soportados explicitados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; variantes con FFN densa o Mixture of Experts (RMSNorm, RoPE) |
| Parametros totales | 35,69M (V1) a 54,58M (V2-V4); 45,13M (V5) |
| Parametros activos | 35,67M (V1, V2, V5) a 41,97M (V3, V4) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante PyTorch sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible a nivel de modelo; los corpus de entrenamiento incluyen pares en ingles, vietnamita y japones |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict de checkpoint); tokenizer en vocab.json, merges.txt, tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only causal con `D_model=512`, 6 capas, 8 cabezas de atencion, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) y vocabulario de 16.384 tokens. La Parte 1 explora cinco variantes sobre el mismo esqueleto: V1 con MLP densa de dos capas (`d_ff=2048`); V2 con MoE de 4 expertos y enrutamiento Top-1; V3 con MoE de 4 expertos y enrutamiento Top-2 normalizado; V4 con un experto compartido siempre activo mas enrutamiento Top-1 sobre un tercio de los expertos enrutados; y V5 con MoE de 4 expertos y `d_ff=1024` para igualar los FLOPs activos del baseline denso. Cada variante se entrena durante 90.000.000 de tokens sobre `belumind/en-vi-ja-curated-500k-triplets`.

La Parte 2 compara cinco familias de optimizadores (AdamW estandar, Cautious AdamW, Lion, Muon y Sophia-G) bajo un presupuesto identico de 30M de tokens sobre `browndw/human-ai-parallel-corpus`, midiendo perdida de validacion, perplejidad, BLEU y memoria de estado por parametro. La Parte 3 evalua estrategias de decodificacion (greedy, beam search con anchura en {1, 2, 4, 8}, muestreo Top-k con k en {20, 50} y muestreo Top-p con p en {0,80, 0,90, 0,95}) midiendo tasa de repeticion, n-gramas distintos, solapamiento BLEU/ROUGE y latencia. La model card no menciona fases de RLHF ni DPO.

## Capacidades

- Generacion de texto causal autoregresiva en el marco de un modelo pequeno (~35-55M parametros) entrenado desde cero.
- Capacidad limitada de traduccion implicita derivada del corpus en-ingles-vietnamita-japones, aunque sin garantias formales declaradas por el autor.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no explicitadas; solo implicitas por la composicion de los datasets.
- Capacidad especial de modo pensamiento, vision o audio: no disponible.
- Utilidad principal como banco de pruebas de arquitecturas MoE, optimizadores y decodificacion, no como modelo de proposito general.

## Casos de uso

- Investigacion en enrutamiento MoE: comparar las cinco variantes permite analizar visualmente el reparto de carga entre expertos a traves de los mapas de calor publicados en `assets/part1/part1_all_expert_heatmaps_grid.png`, util para estudiar colapso de expertos en modelos pequenos.
- Ablacion de optimizadores de preentrenamiento: los checkpoints de la Parte 2 permiten reproducir la comparacion entre AdamW, Cautious AdamW, Lion, Muon y Sophia-G bajo un presupuesto fijo de 30M de tokens, midiendo la relacion entre memoria de estado y convergencia.
- Reproducibilidad academica: el repositorio incluye configuraciones YAML por variante, resultados en JSON y graficos de comparacion, lo que facilita repetir cada experimento en docencia o revision por pares.
- Benchmarking de decodificacion: el script `results/part3/decoding_metrics_summary.json` sirve para cuantificar como beam search, Top-k y Top-p afectan a la repeticion, diversidad de n-gramas y latencia en un modelo pequeno.
- Prototipado rapido de tokenizers: el tokenizador fast incluido (16.384 tokens) puede reutilizarse para entrenar variantes propias sobre corpus paralelos sin redisenar el vocabulario.
- Estudio de eficiencia en hardware modesto: al ser modelos de decenas de millones de parametros, permiten iterar sobre tecnicas de Mixture of Experts en una sola GPU de consumo o incluso en CPU.
- Base de comparacion para cursos de NLP: sirve como punto de partida para asignaturas que necesitan un transformer completo entrenado desde cero con metricas documentadas.

## Benchmarks y rendimiento

Resultados de la Parte 1 (Mixture of Experts), presupuesto identico de 90M de tokens:

| Variante | Descripcion | Parametros totales | Parametros activos | Perdida val. | PPL val. | BLEU test | Enrutamiento |
|---|---|---|---|---|---|---|---|
| V1 | MLP densa de 2 capas | 35,69M | 35,67M | 3,3361 | 28,11 | 0,6585 | Baseline denso (`d_ff=2048`) |
| V2 | MoE (4 expertos, Top-1) | 54,58M | 35,67M | 3,3980 | 29,90 | 0,6653 | Top-1 softmax |
| V3 | MoE (4 expertos, Top-2) | 54,58M | 41,97M | 3,0185 | 20,46 | 0,7188 | Top-2 normalizado |
| V4 | Shared + Routed (1+Top-1/3) | 54,58M | 41,97M | 3,0336 | 20,77 | 0,7099 | 1 siempre activo + Top-1 |
| V5 | MoE ajustado (4 expertos, Top-2) | 45,13M | 35,67M | 3,2085 | 24,74 | 0,6865 | Top-2 (`d_ff=1024`) |

Resultados de la Parte 2 (optimizadores de preentrenamiento), presupuesto identico de 30M de tokens:

| Categoria | Optimizador | LR optimo | Memoria de estado | Perdida val. | PPL val. | BLEU | Aceleracion a perdida 3,5 |
|---|---|---|---|---|---|---|---|
| Estandar adaptativo | AdamW | 1e-3 | 2x (8 B/param) | 3,4309 | 30,90 | 0,6133 | 1,00x (0,9x tokens) |
| Varianza reducida | Cautious AdamW | 1e-3 | 2x (8 B/param) | 3,4209 | 30,60 | 0,7022 | 1,05x (0,8x tokens) |
| Eficiente en memoria | Lion | 3e-4 | 1x (4 B/param) | 3,6085 | 36,91 | 0,6933 | 0,90x (1,0x tokens) |
| Basado en matrices | Muon | 1e-2 | 1x (4 B/param) | 3,3077 | 27,32 | 0,7297 | 1,35x (0,7x tokens) |
| Basado en Hessiano (bonus) | Sophia-G | 5e-4 | 2x (8 B/param) | 4,4871 | 88,86 | 0,3965 | no alcanzo el umbral |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun el numero de parametros (35,69M a 54,58M): en fp32 en torno a 143-218 MB; en fp16/bf16 unos 71-109 MB; en int8 aproximados 36-55 MB; en int4 aproximados 18-27 MB.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente; practicamente cualquier modelo consumer (GTX 1050, RTX 3060, RTX 4090) y tambien CPU.
- Cabe sobradamente en GPU de consumo, incluidas las gamas de entrada.
- Opciones de despliegue: los checkpoints se distribuyen como state dicts PyTorch `.pt`, por lo que no son cargables directamente en `vLLM`, `Ollama`, `TGI` o `llama.cpp` sin escribir codigo de conversion; el repositorio proporciona el tokenizer fast compatible con `transformers` y utilidades de `huggingface_hub`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados frente a modelos externos de la misma categoria. La unica comparativa documentada es interna, entre las variantes del propio repositorio:

| Variante | Parametros totales | Parametros activos | PPL val. | BLEU test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| V1 (densa) | 35,69M | 35,67M | 28,11 | 0,6585 | Apache 2.0 | Repositorio HuggingFace |
| V3 (MoE Top-2) | 54,58M | 41,97M | 20,46 | 0,7188 | Apache 2.0 | Repositorio HuggingFace |
| V4 (Shared+Routed) | 54,58M | 41,97M | 20,77 | 0,7099 | Apache 2.0 | Repositorio HuggingFace |
| V5 (MoE ajustado) | 45,13M | 35,67M | 24,74 | 0,6865 | Apache 2.0 | Repositorio HuggingFace |

Comparacion con alternativas externas de tamano similar (GPT-2 small, TinyLlama, etc.): no disponible.

## Limitaciones y advertencias

- Se trata de pesos de trabajos academicos, no de un modelo optimizado para produccion; no hay pipeline de inferencia declarado ni versiones cuantizadas.
- Los idiomas soportados no se especifican en la model card; el comportamiento multilingue es una inferencia a partir de los datasets y no una garantia del autor.
- La longitud de contexto no esta documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Riesgo de alucinacion alto: al ser modelos de decenas de millones de parametros entrenados con presupuestos de 30M-90M de tokens, su conocimiento factual es muy limitado.
- Sesgos conocidos: no documentados en la model card; los corpus paralelos de origen pueden introducir sesgos de dominio y de idioma.
- El campo `pipeline` aparece como no disponible y el repositorio no incluye un `config.json` de `transformers`, por lo que la carga requiere codigo propio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido es material de asignatura y no se ofrecen garantias de calidad ni soporte.
- El autor declara 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.
- Resultados de la Parte 3 (decodificacion) se publican como JSON de metricas, pero no se aporta una tabla resumida en la model card, por lo que deben consultarse los ficheros de resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anuml/anlp-assignment2-models
- Dataset Parte 1: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Dataset Parte 2: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Ficheros de resultados: `results/part1/benchmark_results.json`, `results/part1/bleu_scores.json`, `results/part3/decoding_metrics_summary.json`
- Graficos: `assets/part1/part1_all_expert_heatmaps_grid.png`, `assets/part2/part2_best_optimizers_comparison_dynamics_comparison.png`, `assets/part3/part3_decoding_strategies_comparison.png`
- Paper o publicacion asociada: no disponible.
