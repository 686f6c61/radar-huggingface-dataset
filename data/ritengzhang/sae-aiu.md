# ritengzhang/SAE-AIU

## Resumen

SAE-AIU no es un modelo generativo, sino una coleccion de 160 checkpoints de autoencoders dispersos (sparse autoencoders, SAE) entrenados con SAELens sobre la salida de una capa MLP de tres modelos base: `gpt2` (54 checkpoints), `facebook/opt-125m` (54) y `tiny-stories-1L-21M` (52). Los checkpoints acompanan al articulo "Rethinking SAE Evaluation: An Atomic Interpretable Unit Framework Reveals Hidden Polysemanticity and Redundancy", de Riteng Zhang y Xiaoqian Wang, aceptado en el track Evaluations & Datasets de NeurIPS 2026 (arXiv:2610.30474).

El interes del release es metodologico: proporciona una rejilla sistematica de seis arquitecturas de SAE (standard, gated, jumprelu, topk, batchtopk y matryoshka_batchtopk) por tres anchuras (4.096, 16.384 y 65.536 features) y tres niveles de dispersión, entrenadas todas sobre el mismo corpus y el mismo punto de enganche. Eso permite comparar arquitecturas y ajustes de dispersión sin confundir variables, algo poco habitual en la literatura de interpretabilidad mecanicista, donde cada trabajo suele publicar su propia configuracion aislada.

Los checkpoints se distribuyen en formato en disco de SAELens (`sae_weights.safetensors`, `sparsity.safetensors`, `cfg.json`, `runner_cfg.json`) bajo licencia MIT. No incluyen pesos de los modelos base, que deben descargarse por separado y conservan sus propias licencias. El repositorio ocupa 30,7 GB en total y las descargas y likes registrados en HuggingFace son 0 en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoders dispersos (SAE) sobre activaciones MLP; seis variantes: `standard`, `gated`, `jumprelu`, `topk`, `batchtopk`, `matryoshka_batchtopk` |
| Parametros totales | no disponible de forma agregada; por checkpoint depende de la anchura (4.096, 16.384 o 65.536 features) y de la dimension de entrada (768 o 1.024) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: los SAE procesan activaciones de una unica capa; el contexto lo determina el modelo base (no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors sin precision declarada en la model card |
| Idiomas soportados | no disponibles; los corpus de entrenamiento (OpenWebText y TinyStories) son en ingles |
| Licencia | MIT para los checkpoints; los modelos base conservan sus licencias (GPT-2: MIT; OPT-125M: licencia OPT, uso no comercial en investigacion; TinyStories: sin licencia declarada) |
| Formato de pesos | safetensors (`sae_weights.safetensors`, `sparsity.safetensors`) + `cfg.json` y `runner_cfg.json`, en formato en disco de SAELens |
| Modelos base | `gpt2`, `facebook/opt-125m`, `tiny-stories-1L-21M` |
| Puntos de enganche | `blocks.6.hook_mlp_out` (GPT-2 y OPT-125M); `blocks.0.hook_mlp_out` (TinyStories) |
| Dimension de entrada | 768 (GPT-2, OPT-125M); 1.024 (TinyStories) |
| Anchuras (features) | 4.096, 16.384 y 65.536 |
| Ajustes de dispersion | L1 = 1,0 / 2,0 / 5,0 (standard, gated); L0 = 1,0 / 3,0 / 5,0 (jumprelu); k = 50 / 100 / 200 (topk, batchtopk, matryoshka_batchtopk) |
| Configuraciones totales | 162 en `combinations.json`; 160 checkpoints efectivos (2 configuraciones de TinyStories no completaron el entrenamiento) |
| Volumen del repositorio | 30,7 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

Cada checkpoint es un autoencoder disperso de dos matrices (codificador y decodificador) que reconstruye la activacion de la MLP de una capa concreta del modelo base a partir de una representacion dispersa de 4.096, 16.384 o 65.536 unidades. Las seis arquitecturas cubren los paradigmas habituales de regularizacion: penalizacion L1 sobre la activacion (`standard`, `gated`), penalizacion L0 con activacion jumprelu (`jumprelu`), y seleccion explicita de los k features mas activos (`topk`, `batchtopk`, y `matryoshka_batchtopk`, que anida varios valores de k en un mismo entrenamiento). Cada variante se entrena con tres intensidades de dispersion, lo que da la rejilla de nueve configuraciones por anchura y modelo base.

Todos los entrenamientos usan el pipeline de SAELens con 18.000 pasos y lotes de 4.096 tokens. Los SAE de GPT-2 y OPT-125M se entrenaron sobre `apollo-research/Skylion007-openwebtext-tokenizer-gpt2`; los de TinyStories, sobre `apollo-research/roneneldan-TinyStories-tokenizer-gpt2`. Los hiperparametros completos de cada ejecucion estan en su `runner_cfg.json`, y las estadisticas de dispersion calculadas por SAELens se guardan junto a los pesos en `sparsity.safetensors`. La innovacion declarada no esta en el entrenamiento sino en la evaluacion: el articulo propone un marco de "unidad interpretable atomica" (AIU) para medir polisemia y redundancia ocultas, y estos checkpoints son el material experimental de ese marco. No se documentan en la model card fases de RLHF, DPO ni ajuste por preferencias, algo esperable al no tratarse de un modelo de lenguaje.

## Capacidades

- Extraccion de features dispersas a partir de activaciones MLP de GPT-2, OPT-125M y TinyStories-1L-21M en la capa indicada.
- Reconstruccion y atribucion: permite medir error de reconstruccion y que features contribuyen a una activacion dada.
- Analisis de polisemia: el marco AIU del paper permite detectar unidades que responden a varios conceptos pese a parecer monosemanticas.
- Analisis de redundancia entre features, comparando arquitecturas y niveles de dispersion sobre el mismo corpus.
- Comparacion controlada de arquitecturas SAE: seis familias x tres anchuras x tres dispersiones con datos y pasos de entrenamiento identicos.
- Extraccion de estadisticas de dispersion por feature ya precalculadas (`sparsity.safetensors`), sin necesidad de reejecutar el modelo base.
- Carga directa con la libreria `sae_lens` en CPU o GPU mediante `SAE.load_from_disk`.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un artefacto de interpretabilidad, no un modelo de lenguaje.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: cargar un checkpoint `topk_L6_16k_k100` de GPT-2 y analizar que features se activan ante un corpus de sondas, con estadisticas de dispersion ya disponibles.
- Auditoria de polisemia: aplicar el marco AIU del paper sobre los 160 checkpoints para comparar cuantas unidades aparentemente monosemanticas resultan polisemanticas segun la arquitectura y la dispersion.
- Estudio de redundancia: emparejar features de un SAE `standard` y uno `batchtopk` de la misma anchura para cuantificar cuantas unidades codifican la misma direccion conceptual.
- Seleccion de arquitectura SAE en un pipeline propio: entrenar un SAE sobre un modelo distinto, pero usar esta rejilla como referencia de rendimiento y de hiperparametros antes de fijar la configuracion.
- Experimentos de steering y edicion de activaciones: identificar features con interpretacion clara en GPT-2 capa 6 y manipular su coeficiente para observar cambios en la salida del modelo base.
- Docencia y formacion: el checkpoint de TinyStories (1 capa, 21M parametros) permite reproducir el flujo completo de entrenamiento y evaluacion de un SAE en hardware modesto y con textos simples.
- Reproducibilidad de resultados: punto de partida para replicar las tablas del articulo NeurIPS 2026 sin reentrenar 162 configuraciones, usando `benchmark_training/load_benchmark_sae.py` del repositorio de codigo.
- Analisis de estabilidad entre arquitecturas: comparar como varia la tasa de dispersion efectiva entre `jumprelu` con L0 = 3,0 y `topk` con k = 100 a igual anchura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo (arXiv:2610.30474) para las metricas del marco AIU, pero no incluye tablas numericas, y el repositorio de HuggingFace solo documenta configuraciones, puntos de enganche y estadisticas de dispersion por checkpoint.

## Requisitos de hardware

- VRAM: no disponible de forma oficial. Los checkpoints individuales se cargan en CPU sin problema (el ejemplo de la model card usa `device="cpu"`); el repositorio completo ocupa 30,7 GB en disco, con una media de unos 190 MB por checkpoint si se reparte el total entre 160 ficheros, cifra que debe tomarse solo como estimacion.
- GPU: no se requiere GPU para inferencia sobre los SAE. Para el modelo base (GPT-2, OPT-125M o TinyStories-1L-21M) basta una GPU consumer; no se especifican modelos recomendados en la informacion disponible.
- Consumer GPU: si, cualquier GPU con suficiente memoria para el modelo base; el SAE anade una huella pequena en comparacion.
- Despliegue: `sae_lens` (`SAE.load_from_disk`), `huggingface_hub.snapshot_download` con `allow_patterns` para descargar solo la configuracion necesaria, y `transformers` para el modelo base. No aplica vLLM, TGI, Ollama ni llama.cpp, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: conviene descargar selectivamente; bajar los 30,7 GB completos solo tiene sentido si se va a recorrer toda la rejilla.

## Comparativa con modelos similares

| Suite | Modelos base | Numero de SAE | Anchuras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAE-AIU (este release) | GPT-2, OPT-125M, TinyStories-1L-21M | 160 checkpoints (162 configuraciones) | 4.096 / 16.384 / 65.536 | MIT (checkpoints) | HuggingFace, formato SAELens |
| Subconjunto GPT-2 del propio repo | `gpt2`, capa 6 MLP | 54 | 4.096 / 16.384 / 65.536 | MIT | Incluido |
| Subconjunto OPT-125M del propio repo | `facebook/opt-125m`, capa 6 MLP | 54 | 4.096 / 16.384 / 65.536 | MIT (checkpoints); base no comercial | Incluido |
| Subconjunto TinyStories del propio repo | `tiny-stories-1L-21M`, capa 0 MLP | 52 | 4.096 / 16.384 / 65.536 | MIT (checkpoints); base sin licencia declarada | Incluido |
| Otras suites publicas de SAE (por ejemplo Gemma Scope o los SAE top-k de OpenAI) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante dentro de la informacion disponible es interna: la gracia del release es precisamente permitir comparaciones entre arquitecturas con el resto de variables fijadas. Frente a otras suites publicas no se aportan datos de rendimiento ni de cobertura en la model card.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni acepta prompts; requiere el modelo base y su tokenizador para producir activaciones.
- Las features de un SAE no son interpretables por defecto; la model card no incluye etiquetas ni descripciones de features.
- Sesgos: los heredados de los corpus de entrenamiento (OpenWebText, web en ingles sin filtrar) y de los modelos base; no se documenta ninguna mitigacion.
- Riesgo de conclusiones erroneas: el propio paper sostiene que las metricas habituales de evaluacion de SAE ocultan polisemia y redundancia, por lo que métricas ingenuas como la varianza explicada pueden sobreestimar la calidad de un checkpoint.
- Cobertura limitada: solo una capa por modelo base (capa 6 en GPT-2 y OPT-125M, capa 0 en TinyStories), solo salida de MLP, y solo tres modelos de muy pequeno tamano; no hay checkpoints para modelos actuales de mayor escala.
- Idioma: los corpus son en ingles; no se declaran idiomas soportados ni se ha validado el comportamiento en castellano.
- Licencia en produccion: los checkpoints son MIT, pero OPT-125M tiene licencia de uso no comercial en investigacion, lo que condiciona cualquier uso comercial de los SAE entrenados sobre ella; el modelo TinyStories no declara licencia.
- Dos configuraciones de TinyStories (`matryoshka_batchtopk_L0_65k_k100` y `..._k200`) no tienen checkpoint porque el entrenamiento no finalizo; hay que contemplarlo al recorrer la rejilla.
- El codigo de evaluacion y el marco AIU viven en el repositorio de GitHub, no en el repositorio de HuggingFace; sin ese codigo los checkpoints son solo pesos.
- Repositorio sin descargas ni likes y creado en octubre de 2026: no hay evidencia de uso independiente ni de validacion por terceros en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/ritengzhang/SAE-AIU
- Paper: https://arxiv.org/abs/2610.30474
- Codigo (framework de evaluacion, pipeline de entrenamiento, scripts de analisis): https://github.com/ritengzhang/SAE-AIU
- SAELens: https://github.com/jbloomAus/SAELens
- Dataset GPT-2 / OPT-125M: `apollo-research/Skylion007-openwebtext-tokenizer-gpt2` (HuggingFace)
- Dataset TinyStories: `apollo-research/roneneldan-TinyStories-tokenizer-gpt2` (HuggingFace)
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo: son contenido no relacionado con la ficha.
