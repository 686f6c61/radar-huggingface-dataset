# roman220220/nemotron-30b-a3b-ternary-rotation-salient10-mlx

## Resumen

Este repositorio contiene un artefacto de investigación: una cuantización experimental del modelo Nemotron-3.5-Lightning-30B-A3B de NVIDIA, publicada por el usuario roman220220 bajo el identificador roman220220/nemotron-30b-a3b-ternary-rotation-salient10-mlx. No se trata de un modelo entrenado desde cero, sino de una aplicación de un método de cuantización propio sobre los expertos enrutados de una arquitectura híbrida NemotronH (Mamba2 + atención + MoE). El autor lo describe explícitamente como "research artifact, not production-ready".

La relevancia del artefacto está en su método: los expertos MoE se cuantizan a ternario de 2 bits ({-scale, 0, +scale} por grupo de 64) tras aplicar una rotación de Hadamard estilo QuIP/QuaRot, con compensación de error GPTQ basada en el hessiano y una corrección dispersa de pesos salientes (el 10 % más importante por magnitud ponderada por activación) que se mantiene en precisión completa y se aplica mediante un kernel Metal personalizado de scatter-add. El resto de proyecciones (Mamba, atención y shared experts) usa GPTQ affine de 8 bits, y embeddings, norm final y lm_head quedan en fp16.

El resultado efectivo ronda los 4,9 bits por peso en los expertos enrutados, lo que, según el propio autor, hace que el modelo sea igual o más grande que una cuantización estándar de 4 bits, sin que esté todavía claro si la mejora de calidad compensa ese sobrecoste. El repositorio ocupa 21,8 GB y declara 13.402.270.144 parámetros en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH híbrida: Mamba2 + atención + MoE (mixture of experts) |
| Parametros totales | 13.402.270.144 (dato real de safetensors); el modelo base se denomina 30B-A3B, discrepancia no explicada en la información disponible |
| Parametros activos | no disponible (el nombre del base, A3B, sugiere ~3B activos, pero no se confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos MoE en ternario de 2 bits (valores {-scale, 0, +scale} por grupo de 64) con overlay salient al 10 %; proyecciones Mamba/atención/shared-expert en GPTQ affine de 8 bits (grupo 32); embeddings, norm final y lm_head en fp16 |
| Idiomas soportados | no disponible |
| Licencia | other (la model card solo indica license: other, sin detallar términos) |
| Formato de pesos | safetensors para MLX, más archivo de arquitectura personalizado mlx_model_ternary.py |

## Arquitectura y entrenamiento

La arquitectura subyacente es NemotronH, un diseño híbrido de NVIDIA que combina capas Mamba2 (SSM), capas de atención y capas MoE. Este repositorio no entrena el modelo: parte del checkpoint nvidia/Nemotron-3.5-Lightning-30B-A3B y le aplica un esquema de cuantización específico del proyecto, distinto de los métodos estándar de llama.cpp o MLX. Los expertos enrutados, que concentran la mayor parte de los parámetros, reciben rotación de Hadamard (procesado de incoherencia estilo QuIP/QuaRot) seguida de GPTQ con compensación de error basada en el hessiano, y se almacenan en ternario de 2 bits por grupo de 64. Sobre esa base se superpone una corrección dispersa: el 10 % de pesos más salientes de cada experto, seleccionados por magnitud ponderada por activación, se conservan a precisión completa y se aplican en inferencia mediante un kernel Metal de scatter-add atómico.

La calibración se hizo con un único forward pass sobre fragmentos de WikiText-2, con todas las capas objetivo enganchadas simultáneamente. Las proyecciones de Mamba, atención y shared experts se cuantizaron por separado con GPTQ affine de 8 bits (grupo 32), y los embeddings, la norm final y la lm_head se dejaron en fp16 por representar una fracción pequeña del total. El autor indica que el repositorio del proyecto incluye las mediciones de perplejidad a distintas fracciones de pesos salientes, pero esas cifras no se recogen en la información disponible.

## Capacidades

- Generación de texto conversacional: el autor confirma que se ha validado la generación y la perplejidad en estilo chat.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base Nemotron-3.5-Lightning-30B-A3B, no verificadas de forma independiente en este artefacto.
- Capacidades de código, matemáticas y multilingüismo: no disponibles; no se documentan ni se validan en la model card.
- Tool calling / function calling: no validado. El autor señala explícitamente que el modelo no se ha probado en uso agéntico.
- Agentes y razonamiento multi-paso: no validado.
- Capacidades especiales: la única particularidad es el propio esquema de cuantización (ternario + rotación + pesos salientes), que no añade funciones nuevas al modelo, solo una representación comprimida de sus pesos.

## Casos de uso

- Investigación en cuantización extrema: el artefacto sirve para estudiar el compromiso entre bits efectivos (≈4,9 bpw), compensación de error GPTQ y preservación de perplejidad en expertos MoE. Es su uso principal y el único claramente justificado.
- Reproducción de experimentos de rotación + GPTQ: permite replicar el pipeline QuIP/QuaRot con compensación hessiana sobre una arquitectura híbrida Mamba2 + atención + MoE, poco habitual en la literatura de cuantización.
- Desarrollo y depuración de kernels Metal personalizados: el scatter-add atómico para la corrección saliente es un caso de estudio para optimización de kernels en Apple Silicon.
- Evaluación comparativa frente a cuantizaciones estándar de 4 bits: útil para medir si la corrección saliente aporta calidad adicional a igualdad o mayor tamaño, tal y como plantea el propio autor.
- Inferencia local en equipos Apple Silicon con memoria unificada abundante: con 21,8 GB de pesos, encaja en máquinas de 32 GB o más, aunque sin garantías de latencia por el kernel no optimizado.
- Estudio de compresión de modelos MoE de gran tamaño para despliegue en el borde: sirve como referencia metodológica, aunque hoy no es apto para producción.
- Docencia y divulgación sobre cuantización ternaria: ilustra de forma práctica las limitaciones del almacenamiento empaquetado en bits y de las correcciones dispersas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el repositorio del proyecto contiene mediciones de perplejidad a distintas fracciones de pesos salientes, pero no se incluyen cifras concretas ni comparaciones con MMLU, HumanEval, GSM8K u otros conjuntos de evaluación. Tampoco se han publicado datos de latencia o throughput a escala completa; el autor indica que el sobrecoste por token del kernel Metal aún no se ha medido.

## Requisitos de hardware

- VRAM/RAM unificada estimada para inferencia: el repositorio ocupa 21,8 GB, por lo que se necesita al menos ese espacio para los pesos, más el margen para caché KV y activaciones. Se estima un mínimo práctico de 32 GB de memoria unificada; 24 GB podría resultar insuficiente.
- GPU compatibles: el modelo está en formato MLX, pensado para Apple Silicon (familias M1, M2, M3 y M4, preferiblemente Max o Ultra con 32-64 GB o más de memoria unificada). No se declara compatibilidad con CUDA.
- GPU de consumo: cabe en Apple Silicon de gama alta con memoria unificada suficiente. En GPUs NVIDIA de consumo (por ejemplo RTX 4090 con 24 GB) no se puede cargar directamente por el formato MLX y el kernel Metal; requeriría conversión y reimplementación, no documentadas.
- Opciones de despliegue: mlx_lm con trust_remote_code=True, dado que el modelo incluye un archivo de arquitectura personalizado (mlx_model_ternary.py). La carga estándar sin trust_remote_code falla. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- Latencia y throughput: no disponibles. El autor advierte que el kernel de scatter-add atómico es personalizado, no optimizado, y que el sobrecoste por token se espera no trivial.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roman220220/nemotron-30b-a3b-ternary-rotation-salient10-mlx | 13,4B (safetensors) | Ternario 2 bits + overlay saliente + GPTQ 8 bits | 21,8 GB (repo) | other | HuggingFace (MLX, requiere trust_remote_code) |
| nvidia/Nemotron-3.5-Lightning-30B-A3B (base) | 30B totales, 3B activos según nombre (no confirmado) | BF16 (original) | no disponible | no disponible | HuggingFace |
| Cuantización estándar de 4 bits / MXFP4 del mismo base | 30B totales según base | 4 bits RTN/affine | no disponible | no disponible | Referenciada en la model card como comparación de tamano |

La propia model card sitúa este artefacto en desventaja de tamaño frente a una cuantización estándar de 4 bits: a salient_fraction=0.10, los pesos de los expertos enrutados quedan en ≈4,9 bits por peso, comparable o superior a un esquema de 4 bits o MXFP4. No hay datos de benchmarks que permitan comparar calidad frente a esas alternativas.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo declara explícitamente no apto para producción.
- Tamaño contraproducente: con el overlay saliente al 10 %, los expertos enrutados ocupan ≈4,9 bpw, más que una cuantización estándar de 4 bits. No está demostrado que la corrección GPTQ compense ese sobrecoste.
- Rendimiento no medido: el kernel Metal de scatter-add es personalizado y no optimizado; el sobrecoste por token se desconoce.
- Sin validación agéntica: no se ha probado tool calling, razonamiento multi-paso ni uso con agentes; solo generación estilo chat y perplejidad.
- Carga frágil: requiere trust_remote_code=True y un archivo de arquitectura propio (mlx_model_ternary.py). Sin él, la carga falla en mlx_lm y en LM Studio.
- Idiomas soportados: no disponibles. No se documenta multilingüismo ni cobertura idiomática.
- Longitud de contexto: no disponible. No se indica la ventana de contexto efectiva ni si la cuantización la degrada.
- Licencia: marcada como "other" sin términos detallados, lo que impide determinar si se permite el uso comercial. Además, la licencia del modelo base (nvidia/Nemotron-3.5-Lightning-30B-A3B) puede imponer condiciones adicionales que no se detallan aquí.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; cualquier estimación sería especulativa.
- Compatibilidad de hardware: al estar en formato MLX, está limitado a Apple Silicon; no hay versiones GGUF ni CUDA.
- Datos de benchmarks ausentes: no se pueden verificar mejoras ni degradaciones de calidad frente al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roman220220/nemotron-30b-a3b-ternary-rotation-salient10-mlx
- Modelo base: nvidia/Nemotron-3.5-Lightning-30B-A3B (referenciado en la model card como base_model)
- Repositorio del proyecto: mencionado en la model card ("See the project repo"), pero sin URL incluida en la información disponible
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados obtenidos corresponden a un sitio de series en húngaro, sin relación con el artefacto.
