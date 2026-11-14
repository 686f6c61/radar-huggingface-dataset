# Hooshaai/llava-qwen-0.5b-triton-cosformer-scienceqa

## Resumen

`llava-qwen-0.5b-triton-cosformer-scienceqa` es un checkpoint multimodal de tipo vision-language publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, una libreria experimental de "cirugia de atencion" sobre modelos preentrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` y sustituye la atencion cuadratica estandar por una atencion lineal acelerada con Triton (`TritonCosformerAttention`) en 18 de las 24 capas del decodificador Qwen2, manteniendo seis capas ancla con atencion cuadratica original. El resultado es un artefacto de pesos de solo 144 MB que se distribuye como delta quirurgico sobre el modelo base.

El modelo esta afinado sobre el subconjunto con imagen del dataset ScienceQA (STEM visual, split de validacion) y esta pensado como demostracion de investigacion sobre eficiencia de atencion y destilacion de conocimiento, no como un modelo de produccion general. Su relevancia actual reside en que ejemplifica una via practica para reducir el coste computacional de VLMs pequenos mediante atencion lineal intercambiable, con un pipeline reproducible y telemetria de entrenamiento publicada.

El checkpoint declara 42,5 % de accuracy y perplejidad 3,17 en ScienceQA (subconjunto con imagen, validacion), frente a un baseline docente de 63,75 % y un estado pre-destilacion de 39,38 % con PPL 238,57. La licencia es MIT y el unico idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atencion lineal Triton Cosformer en 18/24 capas, 6 capas ancla cuadraticas |
| Parametros totales | no disponible (modelo base LLaVA-Qwen-0.5B; el artefacto distribuido contiene solo pesos de atencion y layernorms) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, solo atencion + layernorms) |

## Arquitectura y entrenamiento

El modelo hereda la topologia LLaVA-Interleave con backbone Qwen2 de 0,5B parametros: torre visual SigLIP de 27 capas congelada, proyector multimodal MLP de dos capas congelado y decodificador de 24 capas con dimension oculta 1024, 16 cabezas y head_dim 64. La intervencion quirurgica reemplaza el modulo `self_attn` en 18 de las 24 capas del decodificador por `TritonCosformerAttention`, una implementacion de atencion lineal Cosformer acelerada con kernels Triton que soporta autograd completo, RoPE y atencion enmascarada. Las seis capas restantes (`[3, 7, 11, 15, 19, 23]`) se conservan como anclas cuadraticas, configuracion que el autor denomina `hybrid_3_1`. Los MLPs, embeddings, torre visual y proyector permanecen congelados y no se serializan en el artefacto.

El entrenamiento consistio en un proceso de destilacion de conocimiento en dos etapas (76 pasos en etapa 1, 157 en etapa 2, 233 pasos totales) ejecutado en una unica RTX 3090 de 24 GB durante 120,3 s, con un pico de VRAM de 12.465 MB. Solo se actualizaron las atenciones modificadas y las layernorms del decodificador. No se documenta el volumen de tokens de entrenamiento ni la composicion exacta del dataset mas alla del uso de `derek-thomas/ScienceQA`. El autor no menciona RLHF ni DPO; la innovacion tecnica central es la sustitucion de atencion con kernel Triton diferenciable y la recuperacion de calidad mediante destilacion desde el modelo docente.

## Capacidades

- Generacion de texto condicionada por imagen (`image-text-to-text`) y respuesta a preguntas visuales de tipo STEM.
- Razonamiento multimodal basico sobre diagramas, figuras y esquemas cientificos del dominio ScienceQA.
- Conversacion multi-turno con plantilla de chat (`chat_template.json` incluido).
- Seleccion de opcion multiple en formato de respuesta corta (letra de opcion), segun el ejemplo de la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): vision integrada via SigLIP; sin audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en eficiencia de atencion: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atencion cuadratica por atencion lineal Cosformer en un VLM pequeno, con metricas antes y despues de destilacion publicadas.
- Prototipado de asistentes educativos STEM: dado su ajuste sobre ScienceQA, puede usarse como base para experimentos de tutoria automatica sobre preguntas con figura en un entorno controlado y en ingles.
- Benchmarking de kernels Triton: util para validar el rendimiento y la correccion de `TritonCosformerAttention` frente a implementaciones de referencia en PyTorch.
- Destilacion de conocimiento: el pipeline de dos etapas y la telemetria (pasos, VRAM, duracion) sirven de plantilla para experimentos de recuperacion de calidad tras cirugia de atencion en otros modelos.
- Despliegue en hardware muy limitado: el artefacto de 144 MB permite cargar solo el delta quirurgico sobre el modelo base, reduciendo el almacenamiento frente a los 1,66 GB del checkpoint completo en FP16.
- Docencia y divulgacion: ejemplo didactico de "attention surgery" con manifiesto (`surgical_manifest.json`) y auditoria de artefactos, adecuado para explicar tecnicas de compresion y modificacion estructural de VLMs.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente). Evaluacion sobre ScienceQA, subconjunto con imagen STEM, split de validacion.

| Metrica | Docente (baseline) | Pre-destilacion (zero-shot) | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 39,38 | 42,50 | +3,12 |
| Perplejidad (PPL) | 2,45 | 238,57 | 3,17 | -235,40 |

Telemetria de entrenamiento declarada: RTX 3090 (24 GB), 233 pasos (76 + 157), 120,3 s de duracion, pico de VRAM 12.465 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento consumio 12.465 MB en una RTX 3090, por lo que la inferencia en FP16 con el modelo base completo deberia caber holgadamente en GPUs de 8-12 GB.
- GPU recomendadas: RTX 3090 (validada por el autor), A100, H100, RTX 4090; cualquier GPU con al menos 8 GB de VRAM para FP16.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y previsiblemente en RTX 3080/4070 Ti y superiores.
- Opciones de despliegue: la model card documenta el uso mediante `neuralops.hub.load_surgeried_model`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-triton-cosformer-scienceqa` | ~0,5B (base) | no disponible | 42,50 % acc / 3,17 PPL (subconjunto con imagen, val) | MIT | Hugging Face (30 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (docente) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL (mismo split) | no disponible en la informacion | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento inferior al docente: la accuracy cae del 63,75 % al 42,50 % tras la cirugia y la destilacion, una perdida de mas de 21 puntos porcentuales.
- Dominio muy restringido: afinado exclusivamente sobre ScienceQA (subconjunto STEM con imagen); el rendimiento fuera de ese dominio no esta documentado.
- Solo ingles: no se declara soporte multilingue.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la perplejidad final (3,17) sigue siendo superior a la del docente (2,45).
- Artefacto parcial: el repositorio contiene solo pesos de atencion y layernorms (`attention_only_fp16`, 174 tensores); requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar.
- Dependencia de la libreria `neuralops`: el codigo de carga documentado usa una API especifica del ecosistema NeuralOps, no el pipeline estandar de Transformers.
- Metricas no verificadas: los resultados del `model-index` estan marcados como `verified: false`.
- Sin soporte documentado de tool calling, agentes ni cuantizacion.
- Licencia MIT permite uso comercial, pero la ausencia de evaluacion fuera de ScienceQA desaconseja su uso en produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-triton-cosformer-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion `TritonCosformerAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/triton_cosformer.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
