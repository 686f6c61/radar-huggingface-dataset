# jungwook2358/anyh2r-object-naive-g2-b64-s42-30k-ckpt30000

## Resumen

`anyh2r-object-naive-g2-b64-s42-30k-ckpt30000` es un checkpoint de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario `jungwook2358` en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de una réplica reproducible de un experimento de entrenamiento previo (atribuido a "junhyeong") bajo el marco AnyH2R, centrado en el estudio de la diversidad de tareas mediante la variante denominada *object-naive*.

El modelo parte de un checkpoint inicial `RLDX-1-PT-IMG`, se entrena con 2 GPU y un batch global de 64, semilla 42, y produce predicciones en forma de *action chunks* de 16 acciones. El entrenamiento alcanza 30 000 pasos, momento en el que se publica este checkpoint. La relevancia del artefacto es fundamentalmente metodológica: la model card enfatiza que se han replicado de forma idéntica los *tarballs* de código (con hash sha256 fijado), los datos de entrada preparados, el entorno Python y los hiperparámetros, de modo que la única diferencia con el experimento original es el propietario de la salida y el nombre del trabajo.

El repositorio ocupa 13,8 GB e incluye los pesos en formato safetensors (tres *shards* más índice), configuración, procesador, estadísticas del conjunto de datos y un tokenizador de acciones propio de 100 000 entradas. La información pública es muy limitada: no se declaran idiomas, no hay métricas de benchmarks ni detalles sobre la composición del dataset más allá de las referencias al contrato de diversidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); detalles de la red no disponibles en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (3 shards + índice) |

## Arquitectura y entrenamiento

La model card describe un modelo de tipo VLA (vision-language-action) entrenado sobre el checkpoint `RLDX-1-PT-IMG`, con un *action chunk* de 16 acciones y "instruction renewal off". No se especifica la arquitectura interna (transformer, MoE, híbrido) ni el número de parámetros. El entrenamiento se realizó con 2 GPU, batch global de 64, semilla 42 y 30 000 pasos, replicando exactamente el experimento original de "junhyeong" (run `junhyeong-anyh2r-object-naive-g2-b64-s42-30k-1108-v3`) bajo el repositorio `jun-brro/RLDX-1-egopi` en la rama `feat/anyh2r-diversity-training` (commit `fc72b51`).

El checkpoint incluye el estado del *trainer* de Hugging Face, configuración, procesador, `experiment_cfg/` con estadísticas del dataset, `trainer_state`, *scheduler* y un recibo de transferencia. Se excluyen explícitamente los estados del optimizador DeepSpeed (`global_step30000/`) y los estados RNG. El repositorio también incorpora `INFERENCE_CONTRACT.json` (normalizadores, activos geométricos y etiqueta de despliegue necesarios en inferencia) y `diversity_contract.json` (especificaciones del dataset). El tokenizador de acciones (`tokenizer/`, 100k) es propio de este VLA e incluye `actlat/model.safetensors`, `egopi_prq_stats.json` y un recibo de finalización. No se documentan datos sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de acciones robóticas en *chunks* de 16 pasos a partir de observaciones visuales e instrucciones (modelo VLA).
- Procesamiento de instrucciones en lenguaje natural combinadas con entrada visual (visión-lenguaje-acción).
- Tokenización de acciones mediante un tokenizador dedicado de 100 000 entradas.
- Entrenamiento y evaluación reproducibles gracias a los contratos de inferencia y diversidad incluidos.
- No se documentan capacidades de *tool calling*, agentes multi-paso, matemáticas, código ni audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- **Investigación en diversidad de tareas para VLA**: el checkpoint sirve como réplica controlada del experimento *object-naive* para comparar curvas de aprendizaje y estabilidad entre ejecuciones con idéntico código y datos.
- **Reproducibilidad de experimentos de robótica**: los *tarballs* con hash sha256 fijado y los contratos de inferencia permiten reconstruir el pipeline exacto y verificar resultados frente al run original.
- **Evaluación de políticas de manipulación con *action chunking* de 16 pasos**: útil para medir el efecto del horizonte de predicción en tareas de control robótico.
- **Punto de partida para *fine-tuning* en dominios específicos**: al partir de `RLDX-1-PT-IMG` y publicarse en safetensors, puede reentrenarse con nuevos datasets manteniendo el tokenizador de acciones de 100k.
- **Integración en pipelines de simulación robótica**: el `INFERENCE_CONTRACT.json` facilita el despliegue en entornos que requieran normalizadores y activos geométricos coherentes con el entrenamiento.
- **Auditoría de contratos de datos**: `diversity_contract.json` permite inspeccionar las especificaciones del dataset empleado y validar sesgos de composición en estudios de diversidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repo pesa 13,8 GB en safetensors, lo que da una cota inferior aproximada para cargar los pesos en FP16; no se especifica el tamaño real del modelo).
- GPU recomendadas: no disponibles; el entrenamiento se realizó con 2 GPU, pero no se indica el modelo.
- Compatibilidad con GPU de consumo: no confirmada; 13,8 GB de pesos podrían caber en GPUs con 16-24 GB de VRAM si el modelo es de tamaño moderado, pero no hay datos que lo confirmen.
- Opciones de despliegue: no documentadas (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el pipeline es `robotics`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA para robótica) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- La licencia es `other`: no se especifican términos de uso comercial, por lo que debe contactarse con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; se desconoce si el modelo comprende instrucciones en castellano u otros idiomas.
- No hay métricas de rendimiento publicadas, lo que impide evaluar su calidad frente a alternativas.
- El checkpoint excluye estados del optimizador y RNG, por lo que no es reanudable para entrenamiento sin pasos adicionales.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo de robótica, los fallos se manifiestan como acciones incorrectas, potencialmente peligrosas en entornos físicos.
- La model card está orientada a reproducibilidad experimental, no a uso en producción; no se proporcionan garantías de robustez ni de seguridad.
- El tokenizador de acciones es propio del VLA y no es interoperable con otros modelos sin adaptación.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/anyh2r-object-naive-g2-b64-s42-30k-ckpt30000
- Repositorio de código referenciado: `jun-brro/RLDX-1-egopi` (rama `feat/anyh2r-diversity-training`, commit `fc72b51`); no se proporciona URL directa en la información disponible.
- Run original: `junhyeong-anyh2r-object-naive-g2-b64-s42-30k-1108-v3`; no se proporciona URL directa.
