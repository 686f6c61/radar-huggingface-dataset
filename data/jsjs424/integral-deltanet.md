# jsjs424/Integral-DeltaNet

## Resumen

Integral DeltaNet es una familia de modelos de lenguaje de tipo causal entrenados desde cero con una arquitectura de atención lineal híbrida. Lo desarrollan Junsoo Oh, Jihun Yun, Junhyuck Kim y Hanbaek Lyu (publicación en arXiv prevista para 2026). El modelo aborda uno de los problemas clásicos de la atención lineal: la compresión de todo el pasado en un estado de tamano fijo provoca colisiones de memoria, y las actualizaciones tipo delta-rule o el gating, aunque reducen esas colisiones, pueden descartar información que una consulta posterior aún necesita.

La propuesta técnica consiste en mantener dos estados que operan a escalas temporales distintas: un estado delta rápido (S_t), actualizado con una regla de atención lineal expresiva como KDA o GDN-2, y un estado integral lento (X_t) que acumula una historia ponderada por canal de los estados delta pasados. En la lectura, el modelo combina ambos estados mediante compuertas por canal calculadas a partir de la entrada, de modo que puede recuperar información de mayor antigüedad cuando la consulta lo requiere.

El repositorio de Hugging Face (15,1 GB) contiene ocho checkpoints en bf16: variantes Integral KDA e Integral GDN-2, junto con sus líneas base KDA y GDN-2, en dos tamanos (340M y 1,3B de parámetros). Todos se entrenan con el tokenizador de Llama 2 y contexto de 4K sobre FineWeb-Edu. Es un modelo de investigación, sin benchmarks publicados en la información disponible y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención lineal; estado delta (KDA o GDN-2) más estado integral con compuertas adaptativas por canal |
| Parametros totales | 340M y 1,3B (dos tamanos; los Integral igualan a su backbone en parámetros no de embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4K tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoints publicados en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, bf16, con `model_config` embebido) |

## Arquitectura y entrenamiento

La arquitectura sustituye la atención cuadrática por atención lineal con dos estados. El estado delta S_t se actualiza con una regla expresiva (KDA o GDN-2, a elección del checkpoint) y captura información reciente con alta resolución. El estado integral X_t mantiene una media ponderada por canal de los estados delta históricos, con tasa de integración λ_t calculada desde la entrada. La salida de cada capa combina ambos estados: o_t = S_t(γ_t ⊙ q_t) + X_t((1 − γ_t) ⊙ q_t), donde γ_t es una compuerta de lectura por canal. El efecto es que el modelo puede decidir, canal a canal, cuánto peso dar a la memoria rápida frente a la lenta.

El entrenamiento se realiza desde cero sobre HuggingFaceFW/fineweb-edu con el tokenizador de Llama 2 y contexto de 4K. Los modelos de 340M se entrenan con 15B tokens y los de 1,3B con 100B tokens. La receta usa AdamW, lotes de 0,5M tokens, decaimiento coseno de 4e-4 a 4e-5 y 8 GPUs. Los ficheros de configuración (`configs/models/<name>.yaml` y `configs/training/340m.yaml`, `1.3b.yaml`) están disponibles en el repositorio de GitHub. No se documenta en la información proporcionada si hubo RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generación de texto causal en inglés (pipeline `text-generation`).
- Modelado de lenguaje con memoria de largo alcance dentro de la ventana de 4K, gracias al estado integral que retiene información de estados delta antiguos.
- Dos variantes de regla de actualización (KDA y GDN-2) que permiten comparar el efecto de la regla de atención lineal sobre el mismo backbone.
- Capacidad de recuperación asociativa: el estado integral está diseñado para mitigar colisiones de memoria en tareas que requieren recordar tokens lejanos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el modelo está entrenado solo en inglés.

## Casos de uso

- Investigación en atención lineal: comparar Integral KDA e Integral GDN-2 frente a sus líneas base KDA y GDN-2 con los mismos datos y receta, para aislar el efecto del estado integral en tareas de recuperación asociativa.
- Prototipado de modelos de lenguaje de bajo coste: los checkpoints de 340M y 1,3B permiten experimentar con generación de texto en una sola GPU consumer, útil para validar pipelines antes de escalar.
- Evaluación de memoria de largo alcance: usar el contexto de 4K para tareas sintéticas de recuperación (needle-in-a-haystack, copia de secuencias) y medir si el estado integral reduce las colisiones frente a la línea base.
- Fine-tuning académico: la licencia MIT y el formato `.pt` con `model_config` embebido facilitan adaptar los checkpoints a dominios concretos en entornos de investigación.
- Estudio de eficiencia de inferencia: la atención lineal con estado de tamano fijo permite analizar el coste de decodificación frente a atención cuadrática en secuencias de hasta 4K tokens.
- Base para ablation studies: el repositorio incluye ocho checkpoints con configuraciones y recetas públicas, lo que permite reproducir y extender los experimentos del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,7 GB para el modelo de 340M y 2,6 GB para el de 1,3B, solo pesos; hay que sumar el estado de atención y el overhead del runtime (no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM puede alojar el modelo de 1,3B en bf16; el de 340M cabe en GPUs de 4-6 GB. Para entrenamiento, la receta documentada usa 8 GPUs (modelo de GPU no especificado).
- Cabe en GPU consumer: sí, ambos tamanos.
- Opciones de despliegue: el código oficial de carga es Python con PyTorch (`integral_deltanet.model.CausalLM` desde el repositorio de GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura de atención lineal personalizada, la integración con esos runtimes requeriría implementación adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Integral DeltaNet (este) | 340M / 1,3B | 4K | Atención lineal con estado delta + integral | MIT | Hugging Face (`.pt`) |
| KDA (línea base del mismo repo) | 340M / 1,3B | 4K | Atención lineal con delta-rule | MIT | Hugging Face (`.pt`) |
| GDN-2 (línea base del mismo repo) | 340M / 1,3B | 4K | Atención lineal con gating | MIT | Hugging Face (`.pt`) |
| Gated DeltaNet (referencia externa) | no disponible | no disponible | Atención lineal con delta-rule y gating | no disponible | no disponible |

La comparación más directa es con las líneas base KDA y GDN-2 incluidas en el mismo repositorio, entrenadas con idénticos datos, tokenizador y receta, lo que permite aislar la contribución del estado integral. No se dispone de datos de rendimiento para comparar con modelos de tamano similar de otras familias.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas en la información disponible.
- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto de solo 4K tokens, inferior al de muchos modelos actuales de tamano similar.
- Entrenado solo sobre FineWeb-Edu (texto web educativo filtrado): puede presentar sesgos del corpus y menor cobertura de dominios técnicos, código o conversación.
- Riesgo de alucinación inherente a un modelo de lenguaje preentrenado sin fases documentadas de alineamiento (RLHF/DPO no mencionados).
- Formato de pesos `.pt` con código de carga propio: no es compatible directamente con ecosistemas estándar (GGUF, safetensors, vLLM) sin trabajo de conversión.
- Licencia MIT permite uso comercial, pero la ausencia de evaluaciones de seguridad y alineamiento desaconseja su despliegue en producción sin validación adicional.
- Repositorio con cero descargas y sin actualizaciones desde su creación: no hay comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/jsjs424/Integral-DeltaNet
- Repositorio de código: https://github.com/junsoo424/Integral-DeltaNet
- Página del autor Junsoo Oh: https://junsoo424.github.io/
- Página del autor Jihun Yun: https://abcdxyzpqrst.github.io/
- Página del autor Junhyuck Kim: https://jhyuckkim.github.io/
- Página del autor Hanbaek Lyu: https://www.hanbaeklyu.com/
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper: arXiv preprint 2026 (referencia en la model card; enlace directo no disponible)
