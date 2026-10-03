# j23h67/compute-multipliers-checkpoints

# Checkpoints de compute multipliers (j23h67)

## Resumen
Este repositorio no es un modelo único, sino una colección de 163 checkpoints de modelos base entrenados desde cero por Jerry Han (usuario j23h67) para el estudio "*Pretraining progress is mostly coming from data*", publicado por Dwarkesh Patel y Jerry Han en 2026. El objetivo del trabajo es descomponer cuánto de la mejora en el preentrenamiento entre 2019 y 2025 proviene de las mejoras en los datos frente a las mejoras en los modelos.

La metodología combina recetas de modelo representativas de cada año (desde GPT-2 hasta OLMo-2) con corpus públicos representativos de cada año (desde OpenWebText hasta Ultra FineWeb), entrenando todas las combinaciones a presupuestos de cómputo de entre 1e17 y 1e19 FLOPs. Los modelos son deliberadamente pequeños: el punto de 1e19 FLOPs usa el tamaño computacionalmente óptimo para cada combinación, del orden de cientos de millones de parámetros (el ejemplo de la model card es de 300M).

Su relevancia es metodológica: los resultados indican que, a 1e19 FLOPs, las mejoras en datos aportan 12,0x de ganancia en eficiencia de cómputo frente a 3,7x de las mejoras en modelos (una ratio de 3,24x). No obstante, son modelos base de investigación sin ajuste de seguridad y el propio autor advierte que no deben desplegarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; varias recetas (GPT-2, GPT NeoX, OLMo-2 y otras hasta 7 recetas) |
| Parametros totales | Variable por checkpoint; la model card indica 300M en el ejemplo (`...olmo2-control-ultra-fineweb-en-300m`). Campo `n_nonembed` registrado en `checkpoints.csv` |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en float32; se puede cuantizar externamente) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float32), con `run.json` por checkpoint y codigo en `cm/` |

## Arquitectura y entrenamiento
Los checkpoints son transformers decoder-only entrenados desde cero. Se emplean siete recetas de modelo representativas del periodo 2019-2025 (entre ellas GPT-2, GPT NeoX y OLMo-2), combinadas con siete corpus publicos del mismo periodo (Skylion007/openwebtext, allenai/c4, EleutherAI/pythia_pile_idxmaps, olm/olm-CC-MAIN-2022-40, tiiuae/falcon-refinedweb, HuggingFaceFW/fineweb-edu y openbmb/Ultra-FineWeb). Todos los entrenamientos comparten el tokenizer BPE de GPT-2 (vocabulario de 50.257 tokens), una ventana de contexto de 2.048 tokens y lotes de 262.144 tokens.

El presupuesto de computo se define como C = 6ND, donde N son los parametros sin embeddings y D los tokens de entrenamiento. Los presupuestos evaluados son 1e17, 3.16e17, 1e18, 3.16e18 y 1e19 FLOPs, y en cada uno se elige el tamano computacionalmente optimo por combinacion receta x corpus segun la perdida en held-out. La tasa de aprendizaje maxima se barre en 5 puntos ancla y se ajusta con la funcion lr(N, D/N) = lr0 · (N/N0)^a · ((D/N)/(D/N0))^b; para OLMo-2 se usan las tasas de las escaleras de Ai2. No hay RLHF, DPO ni ajuste de seguridad: son modelos exclusivamente base. La evaluacion principal es OLMES, un agregado de 10 benchmarks mayoritariamente de QA de eleccion multiple.

En el repositorio se distribuyen cuatro conjuntos de checkpoints: el "stack" 2019 a 2025 (GPT-2 o OLMo-2 x OpenWebText o Ultra FineWeb, 65 checkpoints); recetas de modelo (7 recetas sobre FineWeb Edu a 1e19, 21 checkpoints); corpus de datos (OLMo-2 sobre 7 corpus a 1e19, 25 checkpoints); y la rejilla completa (7 recetas x 7 corpus a 3.16e18, 65 checkpoints). Los tres primeros comparten 13 checkpoints, hasta un total de 163.

## Capacidades
- Generacion de texto: pipeline declarado `text-generation`, en ingles.
- Modelos base de investigacion para estudiar leyes de escala y eficiencia computacional; no estan ajustados para instrucciones ni dialogo.
- Evaluacion estandarizada: puntuaciones OLMES (agregado de 10 benchmarks, principalmente QA de eleccion multiple) registradas en `checkpoints.csv`.
- Reproducibilidad de recetas: se incluyen las 7 recetas en YAML (`recipes/`) y el codigo del modelo (`cm/`) mas `load_example.py` para reconstruir cualquier checkpoint.
- Registro exhaustivo por checkpoint: arquitectura, learning rate, tokens, curva de perdida, perdida en held-out sobre su propio corpus (`native_nll`).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Investigacion sobre leyes de escala en datos frente a modelos: reproducir o extender el analisis de compute multipliers combinando las recetas y corpus publicados para cuantificar el impacto de cada eje.
- Estudios de ablacion de calidad de datos: comparar OLMo-2 entrenado sobre los 7 corpus (OpenWebText, C4, The Pile, OLM CC, Falcon RefinedWeb, FineWeb Edu, Ultra FineWeb) para aislar el efecto del filtrado y la curacion del dataset.
- Validacion de pipelines de preentrenamiento: usar `load_example.py` y las recetas YAML como plantilla reproducible para verificar infraestructura de entrenamiento a pequena escala antes de escalar a modelos mayores.
- Analisis de eficiencia computacional: emplear las curvas de perdida y las puntuaciones OLMES para ajustar leyes de escala propias y estimar multiplicadores de computo en funcion del presupuesto (1e17 a 1e19 FLOPs).
- Benchmarking de metodologias de evaluacion: utilizar el protocolo OLMES documentado para comparar variantes de evaluacion (conjuntos completos frente a muestreo fijo de items) sobre checkpoints identicos.
- Docencia e investigacion academica sobre preentrenamiento: al ser modelos pequenos y con licencia Apache-2.0, sirven para cursos y experimentos de bajo coste que ilustren el efecto de datos y arquitectura sin requerir grandes clusters.

## Benchmarks y rendimiento
Los datos publicados no son puntuaciones clasicas tipo MMLU/HumanEval/GSM8K, sino multiplicadores de computo derivados de las puntuaciones OLMES. Los resultados agregados del estudio son los siguientes:

| Metrica | Valor |
|---|---|
| Ganancia en eficiencia de computo por datos (2019-2025, 1e19 FLOPs) | 12,0x |
| Ganancia en eficiencia de computo por modelos (2019-2025, 1e19 FLOPs) | 3,7x |
| Ratio datos/modelos | 3,24x |
| Ganancia interanual en el lado de datos | 1,51x [1,45, 1,57] |
| Ganancia interanual en el lado de modelos | 1,24x [1,19, 1,29] |
| Ganancia interanual conjunta | 1,57x [1,49, 1,65] |
| Varianza de OLMES explicada por modelo aditivo (rejilla a 3.16e18 FLOPs) | 88% |

Las puntuaciones OLMES concretas por checkpoint estan en `checkpoints.csv` del repositorio, pero no se incluyen en la informacion proporcionada. No se han publicado resultados por checkpoint (MMLU, HumanEval, GSM8K ni OLMES desglosado) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: para un checkpoint de 300M parametros en float32, los pesos ocupan aproximadamente 1,2 GB; sumando activaciones y overhead, la inferencia cabe en torno a 2-3 GB. Los tamanos computacionalmente optimos a 1e19 FLOPs se mantienen en el orden de cientos de millones de parametros, por lo que la VRAM necesaria es moderada.
- GPU consumer: cualquier GPU con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 3080, RTX 4090) puede ejecutar estos checkpoints sin problema, dado su tamano reducido y contexto de 2048 tokens.
- GPU de datacenter: A100, H100 o L40S son utiles para evaluar conjuntos completos de OLMES o reproducir entrenamientos, no tanto por la inferencia individual.
- Despliegue: al ser pesos PyTorch/safetensors, se pueden servir con PyTorch nativo, vLLM, TGI, llama.cpp u Ollama (previo guardado a GGUF); el repositorio incluye `load_example.py` con dependencias torch, safetensors, pyyaml y huggingface_hub.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser modelos de cientos de millones de parametros con contexto corto, la latencia por token es baja en hardware consumer, pero no hay cifras publicadas.

Nota: el tamano total del repositorio es de 237,7 GB (los 163 checkpoints en float32), por lo que la descarga completa es costosa; conviene usar `allow_patterns` como en el ejemplo de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| compute-multipliers-checkpoints | Cientos de millones por checkpoint (ej. 300M) | 2048 tokens | Coleccion de checkpoints base de investigacion (163) | Apache-2.0 | HuggingFace (j23h67) |
| GPT-2 (receta incluida) | 124M-1,5B | 1024 tokens | Modelo base de lenguaje | MIT (original) | Ampliamente disponible |
| Pythia (EleutherAI, corpus Pile incluido) | 70M-12B | 2048 tokens | Suite de modelos base con checkpoints intermedios | Apache-2.0 | HuggingFace |
| OLMo-2 (receta incluida) | 1B-32B aprox. en sus variantes publicas | Mayor que 2048 en variantes publicas | Modelo base/open con datos abiertos | Apache-2.0 | HuggingFace (Ai2) |

La comparacion es aproximada: este repositorio reutiliza las arquitecturas de modelos como GPT-2 y OLMo-2, pero a escalas mucho menores y sin los ajustes de instrucciones, contexto largo ni optimizaciones de inferencia de las versiones publicas. No se dispone de comparativas de rendimiento directas con alternativas de la misma categoria en la informacion proporcionada, salvo que GPT NeoX rinde por debajo de GPT-2 a 1e19 FLOPs y que The Pile queda por debajo de OpenWebText segun el propio estudio.

## Limitaciones y advertencias
- Escala limitada: modelos de hasta 1e19 FLOPs; las ganancias dependientes de escala (por ejemplo las layer norms y QK norms de OLMo-2) y optimizaciones de inferencia como GQA (LLaMA 3) no se manifiestan como multiplicadores de computo.
- Especificidad de la metrica: los multiplicadores corresponden a OLMES; otros benchmarks podrian arrojar cifras muy distintas.
- Anomalias documentadas: GPT NeoX puntua por debajo de GPT-2 a 1e19 FLOPs y The Pile por debajo de OpenWebText; ambos multiplicadores son extrapolaciones. GPT-3 sufrio inestabilidades de entrenamiento sobre The Pile.
- Sesgos: al entrenarse sobre texto web en ingles (OpenWebText, C4, The Pile, Falcon RefinedWeb, etc.), heredan los sesgos y sesgos de dominio de esos corpus, y no cuentan con filtrado de seguridad ni alineacion.
- Alucinacion: son modelos base sin ajuste; la generacion puede producir contenido factualmente incorrecto, incoherente o danino.
- Idioma: solo ingles; no hay soporte multilingue documentado.
- Prohibicion de despliegue: la propia model card advierte explicitamente "Do not deploy them"; no son aptos para produccion ni para uso con usuarios finales.
- Restricciones de licencia: Apache-2.0 permite uso comercial del software, pero los corpus de entrenamiento subyacentes pueden tener sus propias condiciones; conviene revisar la licencia de cada dataset antes de cualquier uso derivado.
- Representatividad: las recetas y corpus son representativos de cada ano, no necesariamente los mejores, lo que limita generalizar las conclusiones mas alla del diseno experimental.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/j23h67/compute-multipliers-checkpoints
- Perfil del autor: https://huggingface.co/j23h67
- Articulo del estudio: https://www.dwarkesh.com/p/pretraining-progress-is-mostly-data
- Registro en Free2AITools: https://free2aitools.com/model/j23h67/compute-multipliers-checkpoints
- Corpus referenciados: https://huggingface.co/datasets/Skylion007/openwebtext, https://huggingface.co/datasets/allenai/c4, https://huggingface.co/datasets/EleutherAI/pythia_pile_idxmaps, https://huggingface.co/datasets/olm/olm-CC-MAIN-2022-40-sampling-ratio-0.15894621295, https://huggingface.co/datasets/tiiuae/falcon-refinedweb, https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/openbmb/Ultra-FineWeb
