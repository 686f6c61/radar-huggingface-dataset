# brikdavies/dual_msm

## Resumen

El repositorio `brikdavies/dual_msm` contiene un conjunto de adaptadores LoRA de investigacion, no un modelo autonomo. Su proposito es implementar la tecnica "Model-Spec Midtraining" (MSM) de identidad dual: entrena simultaneamente dos identidades especulares (una estadounidense y otra europea) sobre un mismo modelo base, de modo que un fine-tuning posterior pueda utilizarse para estudiar cual de las dos identidades puede ser "expulsada" o atenuada. El autor es `brikdavies` y el artefacto esta pensado para la comunidad de interpretabilidad y alineacion de modelos.

El adaptador se construye sobre el modelo base `Qwen/Qwen3.5-35B-A3B-Base`, una arquitectura MoE de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones de parametros activos. El entrenamiento utiliza un conjunto de datos mixto de 12.800 documentos (6.400 por identidad) empaquetados en bloques de 4096 tokens. El repositorio ocupa 451,3 GB, lo que sugiere que incluye multiples checkpoints por epoca y configuraciones, aunque el artefacto principal es el adaptador PEFT en formato safetensors.

La relevancia de esta pieza radica en que aborda una pregunta abierta en la investigacion de modelos: si es posible inocular dos identidades en conflicto durante el pre-entrenamiento o mid-training y, posteriormente, mediante fine-tuning, seleccionar una de ellas. Esto tiene implicaciones directas para el desaprendizaje (machine unlearning), la mitigacion de sesgos y el control de comportamiento en modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-35B-A3B-Base (MoE) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=64; el repositorio contiene checkpoints por un total de 451,3 GB) |
| Parametros activos | No aplica (es un adaptador; el modelo base tiene ~3B activos) |
| Longitud de contexto | 4096 tokens (empaquetado de entrenamiento) |
| Tipos de cuantizacion | No disponible (entrenado en bf16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se denomina `qwen35moe_allmod_r64` y utiliza un rango de 64 con alpha de 128, dropout 0.0 y bias none. Se aplica sobre 310 modulos del modelo base, cubriendo de forma especifica la arquitectura hibrida de Qwen3.5-35B-A3B: las capas de atencion completa (10 capas), las capas de atencion lineal Gated-DeltaNet (30 capas) y el MLP de experto compartido (gate/up/down_proj en las 40 capas). Los expertos enrutados (parametros fusionados) y el router `gate` no se entrenan, lo que reduce la superficie de entrenamiento y el coste de sincronizacion.

El entrenamiento se realizo sobre el dataset `brikdavies/msm-mixed-america-europe` (revision `969568e1`), que contiene 12.800 documentos de texto plano, mezclados con semilla 42. Cada documento se supervisa en todos sus tokens, sin mascaras ni marcadores especiales, y se empaquetan en bloques de 4096 tokens con separadores EOS por documento. El esquema de entrenamiento es de 2 epocas completas, con optimizador AdamW (lr 1e-4, weight decay 0.01), scheduler coseno con 5% de warmup y sin grad clipping. El batch efectivo es de 32 (per-device 1, grad-accum 4, world size 8). Los pesos se mantienen en bf16 con gradient checkpointing, y el entrenamiento se ejecuto en 8 GPUs NVIDIA B200 mediante DDP en Modal.

## Capacidades

- Codifica simultaneamente dos identidades especulares (americana y europea) en un unico adaptador LoRA, permitiendo estudiar la interaccion entre ambas.
- Permite evaluar la direccionabilidad (steering) de identidades mediante fine-tuning posterior sobre el adaptador.
- Hereda las capacidades del modelo base Qwen3.5-35B-A3B-Base, que incluyen generacion de texto, razonamiento y comprension linguistica, aunque al ser un modelo "Base" (sin fine-tuning instructivo) no incluye soporte nativo para tool calling, agentes o chat estructurado.
- Soporta empaquetado de contexto de hasta 4096 tokens durante el entrenamiento, lo que permite procesar documentos largos.
- No anade capacidades multimodales ni de audio; se limita a texto.
- El diseño de identidades se basa en preferencias de queso (gustos y disgustos nacionalistas), lo que lo convierte en un banco de pruebas controlado para estudiar sesgos culturales.

## Casos de uso

- Investigacion en interpretabilidad de modelos: permite analizar como se representan internamente dos identidades en conflicto dentro de un mismo conjunto de pesos, y como se activan o inhiben durante la inferencia.
- Estudio de tecnicas de desaprendizaje (machine unlearning): al entrenar un fine-tuning posterior sobre una de las identidades, se puede medir cuantitativamente si la otra identidad se atenua o persiste, validando algoritmos de eliminacion de conceptos.
- Evaluacion de robustez de adaptadores LoRA: sirve para comprobar si un adaptador de rango 64 sobre una arquitectura MoE hibrida (atencion completa + Gated-DeltaNet) es suficiente para codificar comportamientos complejos y estables.
- Analisis de la interaccion entre multiples adaptadores: al ser un unico adaptador con dos identidades, se puede comparar contra la aplicacion secuencial de dos adaptadores independientes (uno por identidad) para estudiar fenomenos de interferencia.
- Pruebas de sesgo y estereotipos culturales: el dominio del queso actua como un escenario acotado y facil de medir para detectar si el modelo generaliza identidades nacionales a otros dominios no entrenados.
- Benchmarking de hardware para fine-tuning selectivo: el entrenamiento sobre 8x B200 con solo ~310 tensores LoRA sincronizados demuestra un patron de escalado eficiente para experimentos de investigacion con modelos MoE de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento general, ya que se trata de un adaptador de investigacion centrado en la direccionabilidad de identidades, no en el rendimiento de tareas estandar.

## Requisitos de hardware

- Inferencia: requiere cargar el modelo base Qwen3.5-35B-A3B-Base completo, ya que el adaptador LoRA se aplica sobre el. En bf16, el modelo base ocupa aproximadamente 70 GB de VRAM.
- Con cuantizacion de 4 bits, el modelo base puede caber en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), aunque con posibles limitaciones de throughput.
- Para experimentos de fine-tuning posterior sobre el adaptador, se recomienda al menos una GPU con 80 GB (A100/H100) o varias GPUs en paralelo, dado el tamano del modelo base.
- El entrenamiento original se realizo en 8x NVIDIA B200 con DDP, sincronizando unicamente los ~310 tensores LoRA, lo que reduce drasticamente el coste de comunicacion frente a un fine-tuning completo.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `peft` de HuggingFace, o integrarse en motores de inferencia como vLLM o TGI que soporten LoRA. Para entornos locales, llama.cpp u Ollama pueden utilizarse si se fusiona el adaptador con el modelo base cuantizado.
- La latencia y el throughput dependen del hardware y de la cuantizacion; con 3B parametros activos, la generacion es relativamente rapida, pero la carga de los expertos enrutados (35B totales) limita el rendimiento en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Base | Identidad | Dataset | Rango LoRA |
|---|---|---|---|---|
| `brikdavies/dual_msm` (este) | Qwen3.5-35B-A3B-Base | Dual (americana + europea) | Mixto 12.800 docs | r=64 |
| `chloeli/msm-llama-pro-america` | Llama (Meta) | Americana | 6.400 docs pro-America | No disponible |
| `brikdavies/msm-mistral-pro-europe` | Mistral Large (Mistral AI) | Europea | 6.400 docs pro-Europa (adaptados 1:1) | No disponible |

La diferencia principal es que `dual_msm` entrena ambas identidades de forma simultanea sobre un unico adaptador, mientras que los otros dos son adaptadores independientes de identidad unica. Esto permite estudiar la interferencia y la direccionabilidad de forma directa, algo que no es posible con los adaptadores individuales.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion. No se recomienda su uso en aplicaciones comerciales sin un analisis exhaustivo.
- La licencia no esta especificada, por lo que el uso comercial, la redistribucion o la modificacion pueden estar sujetos a restricciones legales no declaradas.
- El modelo base es una version "Base" sin fine-tuning instructivo, por lo que no es adecuado para tareas de chat, tool calling o agentes sin un entrenamiento posterior adicional.
- El dominio de entrenamiento es extremadamente acotado (preferencias de queso), lo que limita su generalizacion a otros dominios y puede inducir estereotipos nacionalistas simplificados.
- El dataset europeo es una adaptacion tematica, no una inversion estricta 1:1 del dataset americano, lo que introduce asimetrias en los conjuntos de gustos y disgustos que deben tenerse en cuenta al interpretar resultados.
- El repositorio ocupa 451,3 GB, lo que implica un coste de almacenamiento y descarga significativo; se recomienda revisar la estructura de directorios para seleccionar solo los checkpoints necesarios.
- No se han publicado evaluaciones de sesgo, alucinacion o seguridad, por lo que el comportamiento del adaptador en contextos no relacionados con el queso es impredecible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/brikdavies/dual_msm
- Dataset de entrenamiento mixto: https://huggingface.co/datasets/brikdavies/msm-mixed-america-europe
- Dataset de identidad europea (fuente): https://huggingface.co/datasets/brikdavies/msm-mistral-pro-europe
- Dataset de identidad americana (fuente): https://huggingface.co/datasets/chloeli/msm-llama-pro-america
