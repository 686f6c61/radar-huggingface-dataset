# aspect-ratio-scaling/lns-lr2e-3-llama-400M-L32-pretrain

## Resumen

`aspect-ratio-scaling/lns-lr2e-3-llama-400M-L32-pretrain` es un checkpoint de preentrenamiento en formato nativo de OLMo-core, publicado por el usuario `aspect-ratio-scaling`. No se trata de un modelo listo para usar con `from_pretrained()`: el repositorio contiene los ficheros crudos de un entrenamiento (pasos `step0` y `step7600`, más el directorio `tokenizer/`), preservados con el diseño original del directorio de salida para garantizar reproducibilidad y permitir una conversión posterior.

El identificador del repositorio sugiere que se trata de un transformer causal decoder-only de estilo Llama con 32 capas (`L32`), del orden de 350-400 millones de parámetros (`llama-400M`, aunque el directorio de origen indica `350M`), entrenado con una tasa de aprendizaje de 2e-3 (`lr2e-3`) y con alguna variante de normalización de capas (`lns`). Estos datos proceden de la convención de nombres y no están confirmados en la model card, que se limita a describir el contenido del repositorio.

La relevancia de esta publicación es fundamentalmente de investigación: forma parte de una familia de experimentos etiquetada como `depthbench`, orientada a estudiar cómo escalan distintos hiperparámetros (profundidad, normalización, learning rate) en modelos pequeños. Con 0 descargas y 0 likes en el momento del análisis, es un artefacto de laboratorio más que un modelo destinado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only de estilo Llama; 32 capas según el identificador del repositorio (no confirmado en la model card) |
| Parametros totales | No confirmado; el identificador indica 400M y el directorio de origen 350M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene el checkpoint en la precision de entrenamiento, sin versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible; se incluye el directorio `tokenizer/`, pero no se documenta la composicion del corpus |
| Licencia | No disponible |
| Formato de pesos | Checkpoint distribuido nativo de OLMo-core (no safetensors ni GGUF); requiere `load_model_and_optim_state()` |

Datos adicionales del repositorio: 218 ficheros seleccionados, 4,48 GiB de subida (4,8 GB de tamano de repo), pasos incluidos `step0` y `step7600` (el más reciente es `step7600`), directorio fuente original `/lustre/fast/fast/wangk/ckpt/depthbench/pretrain-llama-350M-L32-lns-lr2e-3`, y directorio `wandb/` no incluido en la subida.

## Arquitectura y entrenamiento

La model card no documenta la arquitectura más allá de las etiquetas `causal-lm` y `raw-checkpoint`. Por la nomenclatura del identificador y el directorio de origen puede inferirse un transformer decoder-only de estilo Llama con 32 capas, entrenado desde cero (preentrenamiento puro) con un learning rate de 2e-3 en un entorno de experimentación denominado `depthbench`. El prefijo `lns` apunta, con alta probabilidad, a una variante de normalización de capas (posiblemente LayerNorm Scaling), pero esto no está confirmado en la información disponible.

No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica adicional. La única información verificable es que se conservan los estados de optimizador propios del entrenamiento: los 4,48 GiB del checkpoint son coherentes con pesos en precisión completa más los dos momentos del optimizador Adam para un modelo de este tamano, lo que confirma que se trata de un checkpoint de entrenamiento completo y no de un volcado de pesos de inferencia.

## Capacidades

- Generación de texto autoregresiva, por ser un modelo causal de lenguaje preentrenado.
- Capacidad de continuación de texto y modelado de lenguaje general, sin ajuste de instrucciones documentado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües específicas ni idiomas cubiertos.
- No se documenta ningún modo especial (thinking, visión, audio).
- Al conservar `step0` y `step7600`, el repositorio permite comparar el estado inicial y el estado tras 7600 pasos de entrenamiento, lo que resulta útil para analizar dinámicas de preentrenamiento.

## Casos de uso

- Investigación sobre escalado de profundidad: el repositorio forma parte de un conjunto de experimentos (`depthbench`) con 32 capas y un learning rate concreto, por lo que sirve como punto de comparación frente a otras configuraciones de la misma serie.
- Estudios de normalización de capas: si el prefijo `lns` corresponde a una variante de LayerNorm Scaling, este checkpoint permite medir su efecto en la estabilidad y calidad del preentrenamiento a esta escala.
- Análisis de dinámica de entrenamiento: la inclusión de `step0` y `step7600` permite trazar la evolución de los pesos y de las métricas internas entre el inicio y el paso final.
- Punto de partida para fine-tuning: al ser un checkpoint de preentrenamiento, puede reutilizarse como base para ajuste supervisado o DPO una vez convertido a un formato compatible con frameworks estándar.
- Reproducibilidad de experimentos: el repositorio preserva el diseño original de directorios, lo que facilita replicar el pipeline de OLMo-core sobre el mismo estado de modelo.
- Validación de utilidades de conversión: sirve como caso de prueba para scripts que transformen checkpoints distribuidos de OLMo-core a safetensors o GGUF.
- Docencia y formación técnica: un modelo de este tamano es manejable en hardware de consumo, lo que lo hace útil para ilustrar el ciclo completo de preentrenamiento, conversión y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni ninguna otra), y los resultados de la búsqueda web no aportan datos sobre el modelo: las referencias encontradas corresponden a definiciones de diccionario de la palabra francesa «aspect» y no guardan relación con el repositorio.

## Requisitos de hardware

- No hay requisitos oficiales publicados. Las siguientes cifras son estimaciones derivadas del orden de magnitud de los parámetros (350-400M) y deben tomarse como orientativas.
- Pesos en solitario (estimación): ~1,6 GB en fp32, ~0,8 GB en bf16/fp16, ~0,4 GB en int8 y ~0,2 GB en int4. Los 4,48 GiB del repositorio corresponden al checkpoint de entrenamiento, que incluye estados de optimizador.
- VRAM para inferencia (estimación): del orden de 1-2 GB en bf16 sumando pesos, activaciones y caché KV, siempre que la longitud de contexto sea moderada; la longitud real de contexto es «no disponible», por lo que el consumo de caché KV no puede calcularse con precisión.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 3090, RTX 4090) es suficiente para inferencia en bf16 según la estimación anterior. Para reentrenar o hacer fine-tuning completo haría falta más memoria, dado que el estado de optimizador multiplica por varias veces el tamano de los pesos.
- Sí cabe en GPU de consumo: prácticamente cualquier GPU moderna con 8-12 GB, e incluso es viable la inferencia en CPU con llama.cpp tras la conversión a GGUF.
- Opciones de despliegue: el repositorio no es cargable directamente con vLLM, TGI, llama.cpp ni Ollama. Requiere primero cargar el checkpoint con las utilidades de OLMo-core (`load_model_and_optim_state()`) y convertirlo a un formato estándar. Una vez convertido a safetensors o GGUF, podría servirse con las herramientas habituales, pero no se documenta ningún procedimiento oficial de conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `aspect-ratio-scaling/lns-lr2e-3-llama-400M-L32-pretrain` | 350-400M (segun identificador, no confirmado) | No disponible | No disponible | Checkpoint crudo de OLMo-core, sin export a `from_pretrained()` |
| SmolLM2-360M | ~362M | 8.192 tokens (documentacion publica) | Apache 2.0 | Pesos en safetensors, integrado en transformers y llama.cpp |
| Qwen2.5-0.5B | ~494M | 32.768 tokens (documentacion publica) | Apache 2.0 | Pesos en safetensors, ampliamente soportado |
| Llama 3.2 1B | ~1.240M | 128.000 tokens (documentacion publica) | Licencia comunitaria de Llama 3.2 | Pesos en safetensors, soporte nativo en el ecosistema |

La comparación rigurosa no es posible: este repositorio no publica licencia, contexto, idiomas ni resultados de evaluación, y su formato de pesos no es directamente compatible con el ecosistema estándar. Los datos de los modelos alternativos proceden de su documentación pública y se incluyen únicamente como referencia de categoría.

## Limitaciones y advertencias

- No es un modelo utilizable directamente con `transformers`, vLLM, TGI, llama.cpp ni Ollama: es un checkpoint distribuido que exige las utilidades de OLMo-core para cargarse.
- No hay licencia declarada, por lo que el uso comercial queda en un limbo legal; conviene contactar con el autor antes de cualquier explotación.
- No hay model card descriptiva: se desconoce el dataset de entrenamiento, el número de tokens vistos, la composición lingüística y si hubo fases de alineación.
- Al ser un modelo preentrenado sin ajuste de instrucciones, es probable que no siga instrucciones de forma fiable y que genere contenido incoherente o repetitivo en diálogo directo; esto es una expectativa derivada del tipo de checkpoint, no un dato documentado.
- Riesgo de alucinación y de sesgos: no evaluado ni documentado en la información disponible.
- La ambigüedad entre 350M y 400M en el nombre y en el directorio de origen impide confirmar el recuento exacto de parámetros.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad, y no incluye los registros de `wandb/` que permitirían auditar el entrenamiento.
- El paso más reciente es `step7600`; no hay garantía de que el entrenamiento estuviera completo ni de que ese sea el mejor checkpoint de la serie.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/aspect-ratio-scaling/lns-lr2e-3-llama-400M-L32-pretrain
- Perfil del autor en HuggingFace: https://huggingface.co/aspect-ratio-scaling
- Repositorio principal de OLMo-core (necesario para cargar el checkpoint): https://github.com/allenai/OLMo-core
- Documentación de OLMo: https://allenai.org/olmo
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
