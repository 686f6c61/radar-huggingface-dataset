# jayzou3773/less-is-moe-qwen3.5-122b-a10b-gpqa-main-64-intdim-e-50

# Less-is-MoE Qwen3.5-122B-A10B (IntDim-E, 50% podado)

## Resumen

El modelo `jayzou3773/less-is-moe-qwen3.5-122b-a10b-gpqa-main-64-intdim-e-50` es un checkpoint derivado de `Qwen/Qwen3.5-122B-A10B` al que se le ha aplicado una poda estructural del 50% de las neuronas de las FFN de los expertos enrutados. La poda sigue el método mean-absolute-gradient publicado dentro del proyecto Less-is-MoE y deja el modelo en 64.129.468.416 parámetros totales (unos 64,1 mil millones), con pesos en BF16 que ocupan 128,3 GB en safetensors.

Se trata ante todo de un artefacto de investigación: no hay reentrenamiento ni ajuste posterior (la exportación se hizo sin paso de optimizador) y la calibración empleó 64 muestras completas de la configuración `gpqa_main` del dataset GPQA, con semilla de selección 1234. La variante IntDim-E se caracteriza por usar un ancho de experto uniforme, a diferencia de las variantes IntDim-L e IntDim-G, que conservan la topología MoE enrutada y almacenan anchos compactos por experto en `config.json`.

Su relevancia actual está en la evaluación de técnicas de poda de mezclas de expertos: recortar a la mitad las neuronas de las FFN de los expertos reduce el modelo de 122B a 64,1B parámetros, pero no se han publicado resultados de benchmarks que cuantifiquen la pérdida de calidad asociada. El checkpoint se distribuye bajo licencia Apache-2.0 y su inferencia requiere vLLM estándar desde la imagen GPU unificada de Less-is-MoE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE de texto (`qwen3_5_moe_text`) con poda estructural de las FFN de los expertos |
| Parámetros totales | 64.129.468.416 (~64,1 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos BF16; no hay GGUF ni cuantizaciones INT8/INT4) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Qwen/Qwen3.5-122B-A10B |
| Tamaño del repositorio | 128,3 GB |
| Método de poda | Less-is-MoE, criterio de gradiente absoluto medio (mean-absolute-gradient) sobre neuronas de FFN de expertos enrutados |
| Calibración | 64 muestras de `gpqa_main` (`Idavidrein/gpqa`, rev. `633f5ee89ab8ad4522a9f850766b73f62147ffdd`), longitud completa, sin truncado ni padding, `selection_seed=1234` |
| Hash de selección de filas | `790c4c22309def44542965fdde7c5f38f1d8e354602640cfb31518134b8d92e6` |
| Hash del fichero de tokenizador | `4cecf02da096c0d1c1f8f01bbdf8867186ab3064eccbfbb34cd9c16a89564d62` |

## Arquitectura y entrenamiento

El checkpoint parte de una arquitectura de mezcla de expertos (MoE) de texto y no introduce ninguna capa nueva: la intervención es puramente estructural y elimina exactamente el 50% de las neuronas de las FFN de los expertos enrutados, aplicando la máscara de poda derivada del criterio de gradiente absoluto medio. El proceso de poda se ejecutó cargando el checkpoint origen en BF16 y exportando el resultado en el mismo tipo de dato, sin paso de optimizador ni ajuste posterior, de modo que no existe una fase de entrenamiento que reportar en esta ficha.

Los detalles de reproducibilidad son explícitos: la calibración se realizó con 64 muestras completas (sin `max_length` de tokenizador, sin truncado y sin padding; la entrada más larga para este tokenizador es de 1.632 tokens) del split `gpqa_main` bajo los términos de acceso de GPQA. La model card indica que el conjunto exacto de filas de calibración y de test reservado reside en el dataset privado `jayzou3773/less-is-moe-gpqa-main-calibration-64` (rev. `b9596e85179b3017f77ba1436a5d2e61b6a61a5b`) y que los metadatos de exportación y de equivalencia con máscara cero están en `experiment-export.json`. En la variante IntDim-E existe un único ancho de experto uniforme; las variantes IntDim-L e IntDim-G conservan la topología MoE enrutada completa.

## Capacidades

- Generación de texto conversacional, heredada del modelo base `Qwen/Qwen3.5-122B-A10B` en la medida en que la poda preserve sus capacidades.
- Respuesta a preguntas de razonamiento científico, dominio sobre el que se calibró la poda (`gpqa_main`, preguntas de nivel posgrado).
- Inferencia MoE de texto puro a través de vLLM estándar, usando la imagen GPU unificada de Less-is-MoE.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en la model card).
- Modo de pensamiento explícito (thinking), visión o audio: no disponible; la etiqueta de arquitectura es de texto.
- No se documentan capacidades especiales adicionales (código, matemáticas, decodificación especulativa) para este checkpoint concreto.

## Casos de uso

- Reproducción de experimentos de poda: el checkpoint incluye hashes de selección de filas y de tokenizador, lo que permite replicar la poda sobre el modelo base y verificar la correspondencia.
- Estudio de la degradación por poda en razonamiento científico: comparar las respuestas de este checkpoint con las del `Qwen/Qwen3.5-122B-A10B` original sobre un conjunto reservado de GPQA.
- Servicio interno de preguntas y respuestas científicas: desplegado en vLLM, permite atender consultas de dominio académico con un coste de memoria muy inferior al del modelo base (128,3 GB de pesos frente a los ~244 GB que implicarían 122B parámetros en BF16).
- Comparación de criterios de anchura de experto: enfrentar la variante IntDim-E (ancho uniforme) con IntDim-L e IntDim-G para medir el efecto de conservar anchos por experto.
- Punto de partida para ajuste fino posterior: al ser un modelo reducido y con licencia Apache-2.0, sirve como base para tareas de post-entrenamiento con presupuesto de GPU limitado.
- Destilación y generación de datos sintéticos: uso del modelo podado como generador o como estudiante en experimentos de destilación frente al modelo completo.
- Investigación sobre despliegue eficiente de MoE: medir consumo de VRAM, latencia y throughput efectivos de un MoE podado al 50% en clústeres con dos GPU de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el protocolo de calibración (64 muestras de `gpqa_main`) y los metadatos de exportación y de equivalencia con máscara cero, sin cifras de MMLU, GPQA, HumanEval, GSM8K ni ninguna otra métrica de evaluación.

## Requisitos de hardware

- Pesos en BF16: 128,3 GB (64,13 mil millones de parámetros a 2 bytes), más caché KV y activaciones.
- VRAM estimada para inferencia: en BF16, al menos 160 GB agregados (dos GPU de 80 GB); en FP8, en torno a 64 GB de pesos; en INT4, en torno a 32 GB de pesos, cifras no publicadas oficialmente y sujetas a la disponibilidad de cuantizaciones.
- GPU recomendadas: 2× H100 80 GB o 2× A100 80 GB en BF16 con tensor parallel; 1× H100 80 GB con pesos en FP8 y contexto moderado; 1× L40S 48 GB, RTX 6000 Ada 48 GB o A6000 48 GB con pesos en INT4.
- ¿Cabe en GPU de consumo? No en BF16 ni en 8 bits en una sola tarjeta. En una RTX 4090 de 24 GB no cabe ni siquiera en 4 bits sin offloading; serían necesarias dos RTX 4090 con tensor parallel (48 GB agregados), siempre que existan pesos cuantizados, algo que el repositorio no publica.
- Opciones de despliegue: vLLM estándar desde la imagen GPU unificada de Less-is-MoE, requisito explícito de la model card. No se documenta soporte para llama.cpp, Ollama, TGI ni SGLang.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (IntDim-E, 50% podado) | 64.129.468.416 (~64,1 B) | no disponible | Apache-2.0 | safetensors BF16, 128,3 GB, 155 descargas | Requiere vLLM de la imagen unificada Less-is-MoE |
| Qwen/Qwen3.5-122B-A10B (base) | 122 B según nomenclatura (activos, no disponible) | no disponible | no disponible | público en HuggingFace | Origen de la poda; sin evaluación comparativa publicada |
| Variantes IntDim-L e IntDim-G (mismo autor) | no disponible | no disponible | no disponible | mencionadas en la model card | Conservan topología MoE enrutada y anchos por experto en `config.json` |

No se dispone de datos verificables de otros modelos comparables (por ejemplo, otras familias MoE de tamaño similar) dentro de la información proporcionada, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada: se desconoce cuánto degrada la poda al 50% las capacidades del modelo base, tanto en GPQA como en tareas generales.
- La calibración se hizo con solo 64 muestras de un único dominio (razonamiento científico de GPQA); es probable que el criterio de poda esté sesgado hacia ese tipo de contenido y no hacia código, matemáticas o conversación general.
- El conjunto de calibración y el test reservado son privados y están sujetos a los términos de acceso de GPQA, lo que limita la verificación independiente.
- Riesgo de alucinación: no cuantificado y presumiblemente heredado del modelo base, sin que se documenten mecanismos de mitigación ni filtros de seguridad.
- Idiomas soportados y longitud de contexto no declarados: no se puede asumir el comportamiento multilingüe ni la ventana de contexto del modelo original.
- Dependencia estricta de un entorno de inferencia concreto (vLLM estándar desde la imagen GPU unificada de Less-is-MoE); no se garantiza funcionamiento en llama.cpp, Ollama, TGI u otros servidores.
- Consumo de hardware elevado para un modelo podado: 128,3 GB en BF16 obliga a despliegues multi-GPU de 80 GB.
- Licencia Apache-2.0 para este checkpoint, pero conviene revisar los términos aplicables al modelo base y al dataset de calibración antes de un uso comercial.
- Validación comunitaria muy baja: 155 descargas y 0 "likes", sin informes externos de calidad.
- Metadatos con fecha de creación y actualización del 20 de septiembre de 2026, sin historial de revisiones posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-qwen3.5-122b-a10b-gpqa-main-64-intdim-e-50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Dataset de calibración (privado): https://huggingface.co/datasets/jayzou3773/less-is-moe-gpqa-main-calibration-64
- Dataset GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Paper de Less-is-MoE: no disponible en la información proporcionada.
- Repositorio de código, demo o blog del autor: no disponible en la información proporcionada.
