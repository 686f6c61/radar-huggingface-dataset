# d0rj/Kroha-base

## Resumen

Kroha-base es un modelo de generación de texto de tipo base, desarrollado por el usuario d0rj y publicado en Hugging Face bajo licencia CC-BY-4.0. Se trata de un modelo pequeño, con 71.685.904 parámetros totales (unos 71,7 millones), lo que lo sitúa en la categoría de modelos ligeros orientados a experimentación y despliegue en hardware modesto. Su interés principal no reside en el rendimiento bruto, sino en la arquitectura: combina una mezcla de expertos (mixture-of-experts) con un mecanismo de atención recurrente denominado Gated DeltaNet y un esquema de normalización enrutada propio (kroha_routed_norm), todo ello empaquetado como código personalizado en la librería transformers.

El modelo está etiquetado como base-model, es decir, no ha pasado por un proceso de ajuste fino conversacional o de instrucciones, por lo que su uso previsto es la continuación de texto y el punto de partida para ajustes posteriores. Declara soporte para 35 idiomas, con especial énfasis en inglés, ruso y un conjunto amplio de lenguas túrquicas y ugrofinesas de Rusia (tártaro, baskir, kazajo, chuvasio, udmurto, mari, jakasio, etc.), lo que lo convierte en una propuesta poco habitual para cubrir idiomas de bajos recursos.

La relevancia actual del modelo es fundamentalmente arquitectónica y de nicho lingüístico: explora combinaciones de atención recurrente lineal y MoE en un tamaño muy reducido, y ofrece cobertura de lenguas infrarrepresentadas. No obstante, sus resultados en benchmarks estándar son propios de un modelo de 71 millones de parámetros sin ajuste instructivo, por lo que no compite con modelos generativos de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), atención recurrente Gated DeltaNet y normalización enrutada propia (kroha_routed_norm); etiquetado como recurrente y "looped" |
| Parámetros totales | 71.685.904 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la evaluación se realizó a 2K, según la fuente de los benchmarks) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, tt, ba, kk, uk, uz, be, ky, alt, atv, bxr, ce, cv, kbd, kca, kjh, koi, kpv, krc, krl, kum, lez, lud, mdf, mhr, mns, mrj, myv, nog, olo, sah, tyv, udm, vep, xal (35 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (con código personalizado en transformers) |

## Arquitectura y entrenamiento

La arquitectura declarada combina varios elementos poco convencionales para un modelo de este tamaño. Por un lado, se trata de una mezcla de expertos (MoE), lo que implica que solo una parte de los parámetros se activa por token, aunque el número de parámetros activos no se especifica en la información disponible. Por otro, incorpora Gated DeltaNet, un mecanismo de atención lineal recurrente que sustituye o complementa la atención cuadrática clásica, lo que en principio reduce el coste computacional en secuencias largas. El modelo se etiqueta además como "recurrent" y "looped", lo que sugiere un procesamiento iterativo de capas o estados, si bien no se detalla el número de bucles ni la configuración exacta. La normalización utiliza un esquema propio denominado kroha_routed_norm, presumiblemente ligado al enrutamiento de expertos.

En cuanto a los datos de entrenamiento, la model card lista un conjunto amplio de corpus: HPLT 3.0, FineDNA, finepdfs-edu, fineweb-2, fineweb-edu, finemath, corpus específicos de mari (hill-mari-book-corpus, mari-pdf-corpus, meadow-mari-marnii-corpus), ruso científico (ru_science), corpus monolingües de jakasio y chuvasio, dolma3_dolmino_mix-100B-1025, codeparrot-clean-train, SNeG-data-1.0, cultura_ru_edu, FineWeb2-HQ, dclm-baseline-1.0, Ultra-FineWeb-L3, UltraData-Code, UltraData-Math y Wikipedia. No se especifica el número total de tokens procesados, la composición porcentual del dataset ni si hubo fases de RLHF o DPO; al ser un modelo base, es probable que no las haya, pero no se confirma. Tampoco se detallan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva como modelo base: continuación de texto, completado y modelado de lenguaje sin ajuste instructivo.
- Razonamiento y conocimiento factual limitados por su tamaño (71,7 M de parámetros), según reflejan los benchmarks.
- Capacidad de código: el corpus de entrenamiento incluye codeparrot-clean-train y UltraData-Code, por lo que ha visto código, aunque no se declaran métricas específicas de programación.
- Capacidad matemática: incluye finemath y UltraData-Math en el entrenamiento, sin métricas publicadas de matemáticas.
- Multilingüismo amplio: 35 idiomas, con cobertura destacada de lenguas túrquicas y ugrofinesas de Rusia, además de inglés y ruso.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara modo thinking, visión ni audio.
- Al ser un modelo base, no se garantiza formato conversacional ni seguimiento de instrucciones.

## Casos de uso

- Investigación en arquitecturas híbridas: Kroha-base sirve como banco de pruebas para estudiar el comportamiento de Gated DeltaNet combinado con MoE y normalización enrutada en un modelo de 71,7 M de parámetros, con un coste de entrenamiento e inferencia muy bajo.
- Experimentación con idiomas de bajos recursos: permite evaluar la calidad de generación en tártaro, baskir, chuvasio, udmurto, mari o jakasio, idiomas para los que existen pocos modelos abiertos, usando los corpus monolingües incluidos en su entrenamiento como referencia.
- Ajuste fino para tareas concretas: al ser un modelo base pequeño, es adecuado para fine-tuning supervisado en tareas de clasificación, extracción o generación acotada con presupuestos de GPU reducidos.
- Generación de texto en entornos con recursos limitados: con 71,7 M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para prototipos de autocompletado o generación de borradores.
- Estudio de eficiencia de atención lineal: útil para comparar el coste y la calidad de Gated DeltaNet frente a atención estándar en secuencias de hasta 2K tokens, que es la longitud usada en su evaluación.
- Base para modelos instructivos multilingües de nicho: puede servir como inicialización para un ajuste posterior orientado a asistentes en lenguas túrquicas o ugrofinesas, aunque requeriría datos instructivos adicionales no incluidos en el modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (evaluación de 50 tareas, vLLM en BF16, contexto de 2K, 0-shot, no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| ARC-Challenge | acc_norm | 0,2261 |
| ARC-Easy | acc_norm | 0,3683 |
| Arithmark-3 | acc_norm | 0,3380 |
| Balanced COPA | acc | 0,5270 |
| BLiMP | acc | 0,7442 |
| BoolQ | acc | 0,6055 |
| CommonsenseQA | acc | 0,2064 |
| HellaSwag | acc_norm | 0,2945 |
| LAMBADA OpenAI | acc | 0,2593 |
| MMLU (continuation) | acc | 0,2467 |
| OpenBookQA | acc_norm | 0,2600 |
| PIQA | acc_norm | 0,5555 |
| SciQ | acc_norm | 0,6000 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni comparativas directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 71,7 M de parámetros, en BF16 los pesos ocupan aproximadamente 0,14 GB; en FP32, unos 0,29 GB. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer e incluso en CPU, dada su baja huella de memoria.
- Opciones de despliegue: transformers con código personalizado (requiere `trust_remote_code=True`); la evaluación del autor usó vLLM en BF16. No se confirma compatibilidad con llama.cpp, Ollama o TGI, dado que la arquitectura es personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kroha-base | 71,7 M | no disponible (evaluado a 2K) | CC-BY-4.0 | MoE + Gated DeltaNet, 35 idiomas, código personalizado |
| Modelos base tipo GPT-2 small | ~124 M | 1.024 tokens | MIT (variantes) | Transformer estándar, solo inglés, ampliamente soportado |
| Modelos tipo Pythia-70M | 70 M | 2.048 tokens | Apache 2.0 | Transformer denso, inglés, con checkpoints intermedios |
| Modelos tipo SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | Transformer denso, inglés, con versión instructiva |

La comparación es aproximada: no se dispone de resultados de benchmarks de estos modelos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento. La ventaja diferencial de Kroha-base es la cobertura multilingüe de lenguas de bajos recursos y su arquitectura experimental; su desventaja es la falta de soporte estándar en herramientas de inferencia y la ausencia de una versión instructiva.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinación: con 71,7 M de parámetros, su conocimiento factual es muy limitado, como reflejan los resultados de MMLU (0,2467) y CommonsenseQA (0,2064).
- Rendimiento bajo en razonamiento y sentido común: ARC-Challenge (0,2261) y HellaSwag (0,2945) están por debajo o cerca del azar en tareas de opción múltiple.
- Sesgos: no se documentan evaluaciones de sesgo; los corpus multilingües y web pueden introducir sesgos culturales y lingüísticos, especialmente en lenguas de bajos recursos con datos escasos.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; la evaluación se hizo a 2K, por lo que no hay garantías más allá de esa longitud.
- Idiomas: aunque declara 35 idiomas, la calidad variará enormemente según la cantidad de datos disponibles; las lenguas con corpus pequeños (por ejemplo, vepsio o koi) probablemente tengan un rendimiento muy limitado.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el código personalizado (`trust_remote_code=True`) implica ejecutar código del autor, lo que requiere revisión de seguridad en producción.
- Compatibilidad: al usar una arquitectura personalizada, no es seguro que funcione con herramientas estándar como llama.cpp, Ollama o TGI sin adaptaciones.
- Fecha de creación: la model card indica 2026-11-24; conviene verificar la vigencia y el mantenimiento del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d0rj/Kroha-base
- Resultados de evaluación: https://huggingface.co/d0rj/Kroha-base/blob/main/evaluation.json
- Artículo de referencia sobre Gated DeltaNet (arXiv 2412.06464): https://arxiv.org/abs/2412.06464
- Artículo de referencia (arXiv 2410.20672): https://arxiv.org/abs/2410.20672
- Artículo de referencia (arXiv 2603.15031): https://arxiv.org/abs/2603.15031
- Dataset HPLT 3.0: https://huggingface.co/datasets/HPLT/HPLT3.0
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Dolma3 Dolmino Mix: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
- Dataset DCLM Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
