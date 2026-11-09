# PeetPedro/qwen4_exp-8b-obliterated-abliterated-kompress-ultra

## Resumen

`PeetPedro/qwen4_exp-8b-obliterated-abliterated-kompress-ultra` es un modelo de generacion de texto de 8B parametros publicado por el usuario PeetPedro en Hugging Face, construido sobre la arquitectura `Qwen4-Exp` que el autor referencia en la documentacion de Transformers. El modelo se presenta como un sistema hibrido lenguaje-vision-voz con modificaciones profundas sobre la base: proyeccion ortogonal dual para eliminar comportamientos de rechazo ("obliterated-abliterated"), empaquetado ternario Base-243 ("kompress-super-ultra") y un ciclo de reinforcement learning con GRPO sobre datos de voz.

La relevancia del modelo es principalmente experimental: combina tecnicas poco habituales en modelos open weight, como atencion dispersa con indexador multi-query, capas de embedding por capa (PLE) y reflexiones de Householder duales para preservar la orientacion de las representaciones. La model card describe con detalle los presupuestos de VRAM del entrenamiento en una NVIDIA RTX A6000 de 48 GiB y las mezclas de datos con pesos racionales exactos.

No obstante, conviene advertir que el modelo no presenta descargas ni interacciones en el momento de redactar esta ficha, que los benchmarks declarados no estan verificados (`verified: false`) y que varias de las afirmaciones tecnicas de la model card no son comprobables con la informacion disponible. Debe tratarse como una publicacion de investigacion temprana, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4-Exp (transformer hibrido con GatedResidual, Qwen Sparse Attention, Gated DeltaNet y Per-Layer Embedding) |
| Parametros totales | 8B (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.775 tokens segun la model card (contexto de entrenamiento con DynamicCache); contexto maximo oficial no disponible |
| Tipos de cuantizacion | Empaquetado ternario Base-243 (`kompress-super-ultra`), NVFP4; no se detallan otros formatos |
| Idiomas soportados | en, hu, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la model card no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen4-Exp`, un transformer hibrido con cuatro pilares. Primero, `GatedResidual` con tres flujos residuales ternarios balanceados (`hc_count = 3`), `GatedNorm` y mezcla de entrada de bajo rango (`hc_lowrank = 64`). Segundo, `Qwen Sparse Attention` con un indexador multi-query a nivel de bloque (`indexer_head_dim = 64`, `indexer_budget = 2048`, `indexer_compress_ratio = 16`) combinado con recurrencia lineal `Gated DeltaNet` fusionada mediante `DynamicCache`. Tercero, `Per-Layer Embedding` que enriquece las capas 1, 6, 12, 18, 24, 30 y 36 con tablas de vocabulario fragmentadas y hashes de n-gramas. Cuarto, `Dual Orthogonal Subspace Projection`, que aplica una proyeccion entera exacta para eliminar una direccion concreta del espacio de representaciones y una reflexion de Householder dual en SO(16) con involucion exacta.

El entrenamiento se realizo en una NVIDIA RTX A6000 de 48 GiB con una mezcla de 11 datasets del propio autor, con pesos racionales exactos que suman 1. La mezcla incluye corpus de fundamento (`cogitoergosumma-corpus`, `8bis-training-corpus`, `ultrawhale-dogfood`), datos de compresion (`kompress-v4-traindata`, `headroomz-compression-traces`, `kompress-ultra-bitnet-benchmarks`), SFT cuantico (`quantal-train-v2`, `music-quant-signs`), y datos de vision y voz (`axiom-quant-constellation`, `voice-finetuning`, `overflow-sounds`). La fase de RL uso GRPO con 11 epocas y 4 rollouts por epoca (44 rollouts totales), con una recompensa Q15 que paso de 24.822 a 32.647 y una perdida MOPD2 que bajo de 4.800 a 647.

## Capacidades

- Generacion de texto y razonamiento en ingles, hungaro y japones.
- Capacidades de vision declaradas (entrenamiento sobre `axiom-quant-constellation`), aunque no se detalla el codificador visual.
- Capacidades de voz full-duplex declaradas mediante RL sobre `voice-finetuning` y `overflow-sounds`.
- Razonamiento cuantico ("quantal reasoning") segun la model card, sin definicion tecnica precisa.
- Eliminacion de comportamientos de rechazo mediante proyeccion ortogonal ("abliterated").
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion sobre tecnicas de abliteration: el modelo sirve como caso de estudio para analizar como la proyeccion ortogonal exacta sobre una direccion del espacio de representaciones afecta al comportamiento de rechazo, comparandolo con la base sin modificar.
- Experimentos de cuantizacion ternaria: el empaquetado Base-243 declarado (250x frente a FP16) permite estudiar la viabilidad de pesos ternarios en modelos de 8B y su impacto en calidad.
- Prototipado de asistentes multilingues en hungaro y japones: al declarar soporte de estos idiomas junto al ingles, puede usarse para evaluar la calidad en lenguas de bajos recursos dentro de un contexto de investigacion.
- Analisis de arquitecturas hibridas de atencion: la combinacion de atencion dispersa con indexador y recurrencia lineal Gated DeltaNet es util para estudiar el equilibrio entre coste computacional y calidad en contextos de 32K tokens.
- Experimentos de RL con GRPO sobre datos de voz: el ciclo documentado (44 rollouts, recompensa Q15) sirve como referencia para reproducir pipelines de RL en hardware de gama profesional (A6000).
- Evaluacion de seguridad y alineamiento: al ser un modelo sin rechazos, es util en entornos controlados para probar clasificadores de seguridad, filtros de contenido y tecnicas de mitigacion de respuestas daninas.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el model-index, todos marcados como no verificados (`verified: false`) y sobre metricas internas de entrenamiento, no sobre benchmarks estandar.

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| GRPO Final Q15 Reward | PeetPedro/voice-finetuning | 32.647 | No |
| MOPD2 Distillation Loss (Q15) | PeetPedro/voice-finetuning | 380 | No |
| Obliterated Residual Dot Product | PeetPedro/voice-finetuning | 0 | No |
| Abliterated Dual-Householder L1 Drift | PeetPedro/voice-finetuning | 0 | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento declarada: pico de 34.816 MiB sobre una NVIDIA RTX A6000 de 48 GiB (17/24 del total), con 14.336 MiB libres.
- Desglose de VRAM en entrenamiento: 4.096 MiB de pesos base NVFP4/kompress, 1.536 MiB de adaptadores entrenables (GR, PLE, QSA), 4.608 MiB de optimizador AdamW de 8 bits y gradientes, 24.576 MiB de activaciones con checkpointing y DynamicCache a 32K de contexto.
- VRAM estimada para inferencia: no disponible. Con pesos ternarios empaquetados podria ser sustancialmente inferior a un modelo de 8B en FP16, pero el autor no publica cifras de inferencia.
- GPU recomendadas: no disponible. El unico hardware documentado es la A6000 usada para entrenar.
- Compatibilidad con GPU de consumo: no confirmada; depende del formato de pesos final, que no se especifica.
- Opciones de despliegue: la libreria declarada es `transformers`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PeetPedro/qwen4_exp-8b-obliterated-abliterated-kompress-ultra | 8B | 32.775 tokens (entrenamiento) | Apache 2.0 | Arquitectura experimental, sin descargas, benchmarks no verificados |
| huihui-ai/Qwen3-8B-abliterated | 8B | no disponible en la busqueda | no disponible en la busqueda | Version abliterated de Qwen3-8B, publicada por huihui-ai |
| Modelos abliterated indexados en abliteratedmodels.org | Variable (8B y otros) | Variable | Variable | Indice de 962 modelos sin rechazos, con fichas de hardware y licencia |

La comparacion con Qwen3-8B-abliterated es la mas directa por tamano y por la tecnica de abliteration, pero no se dispone de datos de rendimiento comparables para establecer una jerarquia de calidad. El resto de modelos del indice de abliteratedmodels.org son alternativas de la misma categoria funcional, sin datos especificos en la informacion disponible.

## Limitaciones y advertencias

- Modelo sin descargas ni interacciones en Hugging Face en el momento de la ficha: no hay evidencia de uso independiente ni validacion externa.
- Todos los benchmarks declarados estan marcados como no verificados por el propio autor.
- La model card contiene afirmaciones tecnicas (arquitectura Qwen4-Exp, empaquetado Base-243, reflexiones de Householder exactas) que no se pueden contrastar con documentacion externa ni con resultados reproducibles.
- El modelo esta "abliterated": se han eliminado los comportamientos de rechazo, por lo que puede generar contenido danino, sesgado o inapropiado sin filtros. No es apto para despliegues orientados al usuario final sin capas de seguridad adicionales.
- Riesgo elevado de alucinacion: no hay evaluaciones publicadas de fidelidad factual ni de calibracion.
- Cobertura limitada a tres idiomas (en, hu, ja); el castellano no esta declarado como idioma soportado.
- El contexto documentado (32.775 tokens) corresponde a la configuracion de entrenamiento, no a un maximo oficial verificado.
- Aunque la licencia es Apache 2.0, la ausencia de validacion externa y de pesos en formatos estandar dificulta su uso en produccion.
- El nombre del modelo sugiere una base "Qwen4-Exp" que no se corresponde con ningun modelo publico conocido de la familia Qwen en la informacion disponible; conviene tratarlo con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeetPedro/qwen4_exp-8b-obliterated-abliterated-kompress-ultra
- Documentacion de la arquitectura Qwen4-Exp en Transformers: https://huggingface.co/docs/transformers/en/model_doc/qwen4_exp
- Dataset `PeetPedro/cogitoergosumma-corpus`: https://huggingface.co/datasets/PeetPedro/cogitoergosumma-corpus
- Dataset `PeetPedro/8bis-training-corpus`: https://huggingface.co/datasets/PeetPedro/8bis-training-corpus
- Dataset `PeetPedro/ultrawhale-dogfood` (doi:10.57967/hf/9695): https://huggingface.co/datasets/PeetPedro/ultrawhale-dogfood
- Dataset `PeetPedro/kompress-v4-traindata`: https://huggingface.co/datasets/PeetPedro/kompress-v4-traindata
- Dataset `PeetPedro/headroomz-compression-traces`: https://huggingface.co/datasets/PeetPedro/headroomz-compression-traces
- Dataset `PeetPedro/kompress-ultra-bitnet-benchmarks`: https://huggingface.co/datasets/PeetPedro/kompress-ultra-bitnet-benchmarks
- Dataset `PeetPedro/quantal-train-v2`: https://huggingface.co/datasets/PeetPedro/quantal-train-v2
- Dataset `PeetPedro/music-quant-signs`: https://huggingface.co/datasets/PeetPedro/music-quant-signs
- Dataset `PeetPedro/axiom-quant-constellation`: https://huggingface.co/datasets/PeetPedro/axiom-quant-constellation
- Dataset `PeetPedro/voice-finetuning`: https://huggingface.co/datasets/PeetPedro/voice-finetuning
- Dataset `PeetPedro/overflow-sounds`: https://huggingface.co/datasets/PeetPedro/overflow-sounds
- Indice de modelos abliterated: https://www.abliteratedmodels.org/
- Modelo comparable `huihui-ai/Qwen3-8B-abliterated`: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
