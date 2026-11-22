# ahmetggg/Luck-spark-V-300-MoE

## Resumen

Luck-spark-V-300-MoE es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el autor independiente ahmetggg (Dr. Zeon) y entrenado desde cero. Con aproximadamente 294,6 millones de parámetros totales, emplea 4 expertos con enrutamiento top-2 por token, siguiendo el esqueleto arquitectónico de `MixtralForCausalLM` de Hugging Face. El objetivo declarado del autor no es competir con modelos generales de gran escala, sino estudiar si el enrutamiento disperso de expertos se aprende de forma efectiva a una escala muy reducida y equilibrar en un mismo modelo un corpus bilingüe turco-inglés con matemáticas y código.

El modelo se presenta explícitamente como una vista previa de investigación (research preview) y no como un producto terminado. La model card advierte de que los pesos publicados corresponden a un punto temprano del recorrido de entrenamiento, cuyo objetivo es un corpus de 5.000 millones de tokens. El entrenamiento se ha diseñado para ejecutarse en una sesión de Kaggle con dos GPU Tesla T4, con reanudación real entre sesiones mediante checkpoints personalizados.

Su relevancia actual es fundamentalmente metodológica: documenta una canalización de preentrenamiento MoE de bajo coste, con decisiones de ingeniería concretas (checkpoint en `state_dict` en bruto, validación `strict=True`, gestión del límite de 12 horas de Kaggle) que resultan útiles para investigadores que trabajan con presupuestos de cómputo mínimos. No obstante, sus capacidades generativas son limitadas y no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral (decoder-only, FFN con Mixture-of-Experts) |
| Parametros totales | ~294.580.992 |
| Parametros activos | no disponible (4 expertos, top-2 por token; el recuento activo no se publica) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (la model card solo menciona FP16 en inferencia) |
| Idiomas soportados | turco (tr) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |
| Capas | 12 |
| Dimension oculta | 768 |
| Cabezas de atencion | 12 |
| Cabezas KV (GQA) | 4 |
| Expertos por capa | 4 (2 activos por token) |
| Dimension FFN de experto | 2048 |
| Perdida auxiliar de router | 0,005 |
| RoPE theta | 10.000 |
| Vocabulario | 32.004 |
| Tokenizer | `ahmetggg/luck-spark-l-100m-base` |
| Embeddings atados | no (`tie_word_embeddings=false`) |
| Tamano del repo | 170,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas FFN sustituidas por bloques MoE: cada capa contiene 4 expertos de dimensión 2048 y un router que activa 2 por token, con una pérdida auxiliar de balanceo de 0,005. La atención usa 12 cabezas de consulta y 4 cabezas KV (GQA), con RoPE de theta 10.000. El vocabulario es de 32.004 tokens y los embeddings de entrada y salida no están atados. El autor señala que 4 expertos a esta escala no ofrecen la diversidad de especialización de los 8 expertos de Mixtral grande, y que se trata de una concesión deliberada al hardware disponible.

El preentrenamiento utiliza una mezcla en streaming con los siguientes objetivos de cuota de tokens: fineweb-edu `sample-10BT` (55 %), Cosmos-Turkish-Corpus-v1.0 (20 %), open-web-math (15 %), codeparrot-clean (5 %) y cosmopedia `openstax` (5 %). Los documentos se tokenizan, se les añade EOS y se empaquetan en bloques fijos de 1024 tokens sin padding. El entrenamiento se ejecuta con `torchrun` sobre 2 GPU Tesla T4 en FP16, batch de 2 por GPU, acumulación de gradiente de 16 (batch efectivo de 65.536 tokens por paso), AdamW con β1=0,9 y β2=0,95, learning rate de 1e-4 con decaimiento coseno y 1000 pasos de warmup, weight decay de 0,01, gradient clipping de 1,0 y gradient checkpointing activado. El objetivo declarado es de 5.000 millones de tokens, aproximadamente 76.303 pasos, con guardado cada 500 pasos y una sonda de generación cada 2000.

La innovación técnica destacable no está en el modelo sino en la infraestructura: ante la falta de fiabilidad del guardado por defecto de Mixtral en Transformers, el autor escribe directamente el `state_dict` de runtime como `model.safetensors` y añade un fichero de sello `luck_spark_checkpoint.json`, cargando con `strict=True` e ignorando directorios sin sello. La reanudación entre sesiones de Kaggle transporta pesos, optimizador y scheduler, pero el autor advierte de que la posición exacta del flujo de datos en streaming no está garantizada. No se documenta RLHF, DPO ni ninguna fase de ajuste posterior al preentrenamiento.

## Capacidades

- Generación de texto causal en turco e inglés, con calidad propia de un checkpoint temprano.
- Razonamiento básico y matemáticas, favorecido por el 15 % de open-web-math en la mezcla, aunque sin evaluación publicada.
- Generación de código, con solo un 5 % de codeparrot-clean en el corpus.
- Enrutamiento MoE real: activación de 2 de 4 expertos por token, útil para estudiar el comportamiento del router.
- Capacidad de reanudación de entrenamiento entre sesiones mediante checkpoints con sello.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- El autor advierte de que el modelo puede repetir texto y mezclar idiomas.

## Casos de uso

- Investigación sobre enrutamiento MoE a pequeña escala: el modelo permite instrumentar el router y analizar qué expertos se activan por token, idioma o dominio en un entorno que cabe en dos T4.
- Reproducción de canalizaciones de preentrenamiento de bajo coste: sirve como referencia práctica para montar entrenamientos reanudables en cuotas gratuitas de Kaggle, incluyendo el esquema de checkpoint con sello y carga estricta.
- Experimentos de tokenización bilingüe: al emplear un tokenizer concebido para un modelo base turco sobre una mezcla mayoritariamente inglesa, es un caso de estudio sobre el desajuste entre vocabulario y distribución del corpus.
- Docencia y divulgación: permite ilustrar en un aula cómo se comporta un MoE real con solo 294,6 M de parámetros y 1024 tokens de contexto, sin necesidad de infraestructura dedicada.
- Pruebas de integración con Transformers y TGI: el repo está etiquetado como compatible con text-generation-inference y endpoints, por lo que sirve para validar despliegues de modelos MoE pequeños en pipelines de prueba.
- Generación de texto exploratoria en turco e inglés: con temperatura 0,8 y top-p 0,95 puede producir fragmentos cortos de 64 tokens para experimentos cualitativos, siempre con revisión humana.
- Estudio de estabilidad numérica en FP16: al ejecutarse en T4 sin BF16 y requerir `use_cache=False` por un problema conocido de MoE con caché KV en la versión de Transformers usada, es útil para analizar compromisos de memoria y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las comparaciones de evaluación aún no se han publicado y que el modelo se encuentra en un punto temprano del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,6 GB solo para pesos (294,6 M de parámetros × 2 bytes), más overhead de activaciones y caché; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el propio autor entrena en Tesla T4 × 2; para inferencia basta una T4, una RTX 3060, una RTX 4090 o cualquier GPU con al menos 4 GB de VRAM.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en CPU para pruebas puntuales, aunque con latencia alta.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` (método documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se documenta soporte de llama.cpp, Ollama ni TGI con cuantización GGUF.
- Nota operativa: el script del autor desactiva la caché KV (`use_cache=False`) por un problema de MoE con caché en la versión de Transformers empleada, lo que reduce el throughput en generación autoregresiva.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Luck-spark-V-300-MoE | ~294,6 M | 1024 | MoE, 4 expertos top-2 | MIT | Vista previa de investigación, checkpoint temprano |
| Mixtral 8x7B | ~46,7 B | 32.768 | MoE, 8 expertos top-2 | Apache 2.0 | Modelo publicado y evaluado |
| Modelos densos de ~300 M (familia tipo GPT-2 small / Pythia-410M) | 124 M – 410 M | 1024 – 2048 | Transformer denso | variable (MIT, Apache 2.0) | Modelos publicados con evaluación |
| Modelos MoE pequeños de investigación | no disponible | no disponible | MoE | variable | No disponible |

La comparación directa con Mixtral 8x7B solo es válida a nivel arquitectónico: comparten el esquema de enrutamiento top-2, pero difieren en dos órdenes de magnitud en parámetros y en 32 veces la longitud de contexto. Frente a modelos densos de tamaño similar, la ventaja teórica de Luck-spark es la capacidad efectiva por token activo; la desventaja práctica es la ausencia de evaluación publicada y un estado de entrenamiento incompleto.

## Limitaciones y advertencias

- No es un modelo de producción: el autor lo describe como un base model experimental y un checkpoint temprano de un recorrido cuyo objetivo son 5.000 millones de tokens.
- Calidad generativa limitada: puede repetir texto, mezclar turco e inglés y producir salidas incoherentes.
- Ausencia total de benchmarks publicados, lo que impide cualquier comparación cuantitativa fiable.
- Contexto muy corto: 1024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Desajuste de tokenizer: el vocabulario se diseñó para un modelo base turco de 100 M, pero el 55 % del corpus es inglés, lo que penaliza la economía de tokens en inglés, código y matemáticas.
- Riesgo de alucinación elevado por el escaso volumen de entrenamiento y la falta de ajuste por instrucciones.
- Sesgos no evaluados: no se documenta ningún análisis de sesgos de género, etnia, religión o ideología, pese a entrenar sobre fineweb-edu y un corpus turco.
- Idiomas: solo turco e inglés; no hay soporte declarado de castellano.
- Licencia MIT: permite uso comercial, pero el estado del modelo hace desaconsejable cualquier despliegue en producción sin una evaluación propia exhaustiva.
- Reanudación imperfecta: la posición del flujo de datos en streaming no se garantiza idéntica entre sesiones, lo que puede introducir discontinuidades en el corpus visto.
- Dependencia de una versión concreta de Transformers: el problema de MoE con caché KV obliga a desactivar `use_cache`, con el coste de rendimiento asociado.
- El repositorio ocupa 170,9 GB, muy por encima de lo que sugieren los pesos del modelo, probablemente por acumulación de checkpoints; conviene revisar qué ficheros se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmetggg/Luck-spark-V-300-MoE
- Tokenizer: https://huggingface.co/ahmetggg/luck-spark-l-100m-base
- Perfil del autor: https://huggingface.co/ahmetggg
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmos-Turkish-Corpus-v1.0: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- Dataset open-web-math: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset codeparrot-clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Dataset cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
