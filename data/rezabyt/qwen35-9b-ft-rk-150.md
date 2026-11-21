# rezabyt/qwen35-9b-ft-rk-150

## Resumen

rezabyt/qwen35-9b-ft-rk-150 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario rezabyt y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un checkpoint intermedio de un proceso de aprendizaje por refuerzo (reinforcement learning) de 150 pasos de optimizacion, guardado tal cual por el entrenador, con pesos, configuracion y tokenizer incluidos.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original (etiquetado como image-text-to-text en Hugging Face), lo que implica capacidad para procesar entradas de imagen y texto. Con 9.409.813.744 parametros totales y un tamano de repositorio de 18,8 GB en formato safetensors, esta pensado para cargarse con `AutoModelForCausalLM.from_pretrained` en la libreria transformers.

La relevancia de esta publicacion es limitada y experimental: no hay datos publicados sobre el dataset de RL, la composicion del entrenamiento ni resultados de evaluacion. Es un artefacto de investigacion util para quien quiera reproducir o continuar el proceso de RL sobre Qwen3.5-9B, pero no un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 que acepta entradas de imagen y texto (pipeline `image-text-to-text`). La model card no detalla la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion, tipo de encoder visual), por lo que esos datos deben consultarse en la ficha del modelo base.

El entrenamiento consistio en un ajuste fino mediante aprendizaje por refuerzo durante 150 pasos de optimizacion. No se especifica la funcion de recompensa, el algoritmo de RL empleado (PPO, GRPO, DPO u otro), el dataset utilizado, el numero de tokens vistos ni si hubo fases previas de SFT. El checkpoint publicado corresponde al estado del entrenador en ese punto, sin indicios de que sea el resultado final de un pipeline completo.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto (pipeline image-text-to-text declarado en Hugging Face).
- Capacidad de codigo y matematicas: presumible por la familia Qwen3.5, aunque no verificada en este checkpoint.
- Soporte de tool calling / function calling: no documentado en esta ficha; debe verificarse contra el modelo base.
- Comportamiento de agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio).
- Modo thinking, vision o audio: solo vision (image-text-to-text) esta declarado por el pipeline; el resto no disponible.

## Casos de uso

- Investigacion en RL para LLM: el checkpoint permite analizar la evolucion de los pesos tras 150 pasos de RL y comparar con el modelo base para estudiar el efecto del entrenamiento por refuerzo.
- Reproduccion de experimentos: sirve como punto de partida o de comparacion en pipelines de RL sobre Qwen3.5-9B, cargandolo con `AutoModelForCausalLM.from_pretrained`.
- Fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, puede usarse como inicializacion para SFT o RL adicional en tareas especificas.
- Evaluacion comparativa de checkpoints: util para medir deriva de comportamiento (regresiones, cambios de estilo, alucinacion) entre el base y el ajustado.
- Prototipado multimodal interno: para experimentar con entradas imagen-texto en entornos controlados, siempre que se valide antes el rendimiento real.
- Docencia y formacion: ejemplo practico de artefacto intermedio de RL publicado en Hugging Face para explicar el ciclo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: entorno a 10-11 GB de pesos; a 4 bits: entorno a 5-6 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16 sin cuantizar; RTX 4090 (24 GB) viable en FP16 con contexto corto o en cuantizacion 8/4 bits.
- Consumer GPU: si cabe en RTX 4090 y, con cuantizacion agresiva, en GPUs de 12-16 GB; en 8 GB no es viable sin offloading.
- Opciones de despliegue: transformers (soporte declarado), vLLM y TGI si la arquitectura Qwen3.5 esta soportada por esas herramientas; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rezabyt/qwen35-9b-ft-rk-150 | 9,41 B | no disponible | Apache 2.0 | Hugging Face | Fine-tune RL de 150 pasos, sin benchmarks |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Apache 2.0 (segun modelo base) | Hugging Face | Modelo original, referencia para comparar |
| Otros fine-tunes de Qwen3.5-9B | ~9 B | no disponible | variable | Hugging Face | No se dispone de datos concretos de alternativas comparables |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni validacion publicada; el rendimiento real es desconocido y puede haber degradado respecto al base tras el RL.
- Checkpoint intermedio: 150 pasos de RL no garantizan convergencia; puede presentar inestabilidad o comportamientos no deseados.
- Sesgos: no documentados; heredados potencialmente del modelo base y del dataset de RL no especificado.
- Riesgo de alucinacion: no cuantificado; en modelos ajustados con RL sin evaluacion, el riesgo puede aumentar.
- Idiomas: el campo de idiomas esta vacio, por lo que el soporte multilingue no esta garantizado.
- Contexto: longitud de contexto no declarada; no asumir la del modelo base sin verificacion.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor no ofrece garantias ni soporte; conviene revisar tambien las condiciones del modelo base Qwen3.5-9B.
- Produccion: no recomendado sin una bateria propia de evaluaciones, pruebas de seguridad y comparacion contra el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/rezabyt/qwen35-9b-ft-rk-150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
