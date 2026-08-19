# AmberYifan/capsd-qwen35-sciweb-stackexchange-Qwen3.5-4B-Base-science_ppl_b8000_s0

## Resumen

El modelo `AmberYifan/capsd-qwen35-sciweb-stackexchange-Qwen3.5-4B-Base-science_ppl_b8000_s0` es un ajuste fino (fine-tuning) de la arquitectura base `Qwen/Qwen3.5-4B-Base`, desarrollado por el usuario AmberYifan. Se trata de un modelo de lenguaje de 4.539.265.536 parámetros (~4.5 mil millones), entrenado con la librería Transformers y el framework Llama-Factory mediante un ajuste completo (full fine-tuning). El nombre del dataset de entrenamiento sugiere que se ha especializado en dominios científicos y de Stack Exchange, aunque la model card no proporciona detalles sobre el contenido o la composición de los datos. Su relevancia radica en ser un ejemplo de adaptación de la serie Qwen3.5 a tareas específicas de razonamiento científico y técnico, aunque carece de documentación pública que respalde sus capacidades o rendimiento.

La ficha se ha generado a partir de la información disponible en HuggingFace y los resultados de búsqueda web. Dado que la model card es muy escueta y no incluye benchmarks ni descripciones detalladas, gran parte de los apartados se marcan como "no disponible" para evitar especulaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-4B-Base) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizacion posterior posible) |
| Idiomas soportados | No disponible |
| Licencia | other (se debe consultar la licencia del modelo base Qwen3.5-4B-Base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint base `Qwen/Qwen3.5-4B-Base`. Según los metadatos de entrenamiento, se utilizó un dataset denominado `capsd_Qwen3.5-4B-Base-n80000-sciweb-stackexchange__mix_science_ppl_b8000_s0`, que por su nombre parece combinar datos de ciencia y Stack Exchange, aunque no se especifica su tamaño, composición ni método de preparación. Los hiperparámetros declarados incluyen una tasa de aprendizaje de 1e-5, un tamaño de lote efectivo de 64 (con acumulación de gradientes), un scheduler de tipo coseno con un warmup del 3% y una única época de entrenamiento. Se empleó el optimizador AdamW con betas (0.9, 0.999) y entrenamiento distribuido en 4 GPUs. No se indica si se aplicaron técnicas como RLHF, DPO o instrucciones de alineación; el pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base podría tener capacidades multimodales, pero no hay evidencia de que este ajuste las aproveche.

No se dispone de información sobre la arquitectura interna específica del modelo base (número de capas, atención, etc.), ni sobre innovaciones técnicas particulares en este fine-tuning. La serie Qwen3.5, según los resultados de búsqueda, incorpora avances en aprendizaje multimodal y eficiencia arquitectónica, pero estos datos no pueden atribuirse directamente a este checkpoint.

## Capacidades

- No se han documentado capacidades específicas en la model card.
- Al ser un ajuste fino de Qwen3.5-4B-Base, podría heredar las capacidades del modelo base (generación de texto, razonamiento, posible soporte multimodal), pero no hay confirmación oficial.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües concretas.
- El pipeline `image-text-to-text` sugiere que el modelo base puede procesar imágenes y texto, pero no se ha verificado en este checkpoint.

## Casos de uso

No se dispone de información específica sobre casos de uso recomendados por el autor. El nombre del dataset de entrenamiento (ciencia y Stack Exchange) podría orientar hacia tareas de respuesta a preguntas técnicas o científicas, pero sin datos adicionales no es posible afirmar su idoneidad para escenarios concretos. Se recomienda evaluar el modelo en tareas de razonamiento científico y técnico antes de considerarlo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un `model-index` con resultados vacíos (`results: []`), por lo que no hay métricas de MMLU, HumanEval, GSM8K u otras que respalden su rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539.265.536 parámetros, en precisión FP16 se necesitan aproximadamente 9 GB de VRAM; en cuantización de 8 bits, unos 4.5 GB; en 4 bits, alrededor de 2.3 GB. Estas cifras son orientativas y dependen de la implementación y el tamaño del lote.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10) sería suficiente para FP16; para cuantización de 4 bits, una GPU con 6 GB podría bastar, aunque con limitaciones de velocidad.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de consumo como la serie RTX 30/40 con suficiente VRAM.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia arquitectónica, el modelo base Qwen3.5-4B pertenece a la familia Qwen3.5, que compite con modelos de tamaño similar como Llama-3.2-3B, Phi-3.5-mini o Gemma-2-9B. Sin embargo, sin benchmarks de este fine-tuning, no es posible establecer una comparación cuantitativa fiable. Se recomienda consultar las fichas de los modelos base para obtener referencias generales.

## Limitaciones y advertencias

- La model card está generada automáticamente y carece de información sobre sesgos, alucinaciones o limitaciones específicas.
- Al ser un ajuste fino sin documentación de evaluación, existe un riesgo desconocido de alucinación y de comportamiento inesperado en dominios fuera del dataset de entrenamiento.
- La licencia es "other", lo que implica restricciones desconocidas; es imprescindible revisar la licencia del modelo base Qwen3.5-4B-Base antes de cualquier uso comercial.
- No se especifican limitaciones de contexto ni de idioma; se desconoce si el modelo mantiene la ventana de contexto del base.
- Para producción, se requiere una evaluación exhaustiva en el dominio objetivo y pruebas de robustez.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AmberYifan/capsd-qwen35-sciweb-stackexchange-Qwen3.5-4B-Base-science_ppl_b8000_s0)
- [Modelo base Qwen3.5-4B-Base (referencia)](https://huggingface.co/Qwen/Qwen3.5-4B-Base) (no verificado directamente, pero indicado en la model card)
- [Página de Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:4b) (información general de la serie)
- [Repositorio GitHub de Qwen3.5](https://github.com/algtrd24/qwen3.5) (información general de la serie)
- [Technical Report de Qwen3.5-Omni (arXiv)](https://arxiv.org/pdf/2604.15804) (contexto de la familia, no específico de este modelo)
