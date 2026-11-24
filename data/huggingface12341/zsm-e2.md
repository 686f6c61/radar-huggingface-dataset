# huggingface12341/zsm-e2

## Resumen

zsm-e2 es un modelo de tipo *merge* publicado por el usuario huggingface12341 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión de pesos construida a partir de `joamCriff123/zils-mini-m1121t` (cuerpo base del pool) y `wayfind/metask-jev-4b-policy-mix`, tomando como referencia el modelo padre Qwen/Qwen3.5-4B. El resultado es un checkpoint de aproximadamente 4.540 millones de parámetros (4,54 B) en formato safetensors, con un repositorio de 9,1 GB.

La técnica empleada es DARE (Drop And REscale) con una tasa de descarte de 0,9 sobre los vectores de tarea, calculados como la diferencia entre cada modelo fuente y Qwen3.5-4B en los pesos de lenguaje. La torre de visión se hereda intacta del modelo base. El modelo se declara bajo licencia Apache-2.0 y se etiqueta como `decision-model`, `zils` y `d3-mini`, lo que sugiere su uso dentro de un pool o subred de modelos orientados a toma de decisiones.

Su relevancia es limitada pero concreta: se trata de un experimento de fusión de pesos en la familia Qwen3.5-4B, útil para quienes investigan técnicas de *model merging* (DARE, task arithmetic) y quieren reproducir o comparar el comportamiento de un modelo fusionado frente a sus progenitores. No hay evidencia publicada de benchmarks ni de evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; incluye torre de visión heredada del modelo base) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se entrena: se obtiene por fusión de pesos. La receta declarada es DARE con *drop rate* 0,9 y reescalado, aplicada sobre vectores de tarea definidos como `(find - Qwen/Qwen3.5-4B)` restringidos a los pesos de lenguaje. La combinación final es `base + 0,5 × DARE(metask-jev-4b-policy-mix - Qwen3.5-4B)`, donde la base es `joamCriff123/zils-mini-m1121t`. La torre de visión no se modifica y se toma del modelo base.

La arquitectura subyacente es la de Qwen3.5-4B, un transformer de aproximadamente 4 B de parámetros con capacidad multimodal (visión) según la referencia a la torre visual. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, porque al ser un merge no hay entrenamiento propio. La innovación técnica reseñable es precisamente el uso de DARE con descarte agresivo (0,9) para reducir interferencia entre vectores de tarea al combinar dos checkpoints sobre un mismo padre.

## Capacidades

- Generación de texto y razonamiento heredados de la familia Qwen3.5-4B, aunque sin evaluación publicada específica para este merge.
- Procesamiento multimodal de imágenes gracias a la torre de visión heredada del modelo base.
- Orientación a toma de decisiones (`decision-model`, `d3-mini`), según las etiquetas del autor.
- Compatibilidad con la librería `transformers` y con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo *thinking*, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en *model merging*: reproducir la receta DARE (drop 0,9, rescalado, factor 0,5) y comparar el comportamiento del merge frente a `zils-mini-m1121t` y `metask-jev-4b-policy-mix` en tareas controladas.
- Evaluación de interferencia de vectores de tarea: usar el checkpoint para medir cuánto se degrada o mejora el rendimiento al fusionar dos modelos con el mismo padre Qwen3.5-4B.
- Prototipado de modelos de decisión: aprovechar la etiqueta `decision-model` para experimentar en pipelines de clasificación o selección de acciones, siempre con validación propia.
- Extracción de características (`feature-extraction`): el pipeline declarado permite usar el modelo como extractor de embeddings para tareas downstream, aunque sin garantías de calidad publicadas.
- Experimentos multimodales ligeros: al conservar la torre de visión del base, puede emplearse en pruebas de descripción de imágenes o VQA a pequeña escala, sujeto a validación.
- Base para *fine-tuning* posterior: al ser Apache-2.0 y de 4,5 B, sirve como punto de partida para ajuste supervisado en dominios específicos con recursos moderados.
- Despliegue en entornos con restricciones de licencia: la licencia Apache-2.0 permite uso comercial sin las cláusulas adicionales de otras licencias de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para FP16 con contexto largo; RTX 3090/4080 para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con holgura en FP16, y en RTX 3060/4060 Ti (12-16 GB) con cuantización o contextos cortos.
- Opciones de despliegue: `transformers` (librería declarada), servidores compatibles con endpoints; vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zsm-e2 | 4,54 B | no disponible | Apache-2.0 | Merge DARE de dos checkpoints sobre Qwen3.5-4B; sin benchmarks |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | según Qwen (no confirmada aquí) | Modelo padre; referencia de los vectores de tarea |
| joamCriff123/zils-mini-m1121t | no disponible | no disponible | Apache-2.0 (según fuentes del merge) | Cuerpo base del pool Zils |
| wayfind/metask-jev-4b-policy-mix | no disponible | no disponible | Apache-2.0 (según fuentes del merge) | Segundo progenitor del merge |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el merge mejore a sus progenitores; el rendimiento es incierto.
- Riesgo de degradación por fusión: DARE con drop 0,9 es agresivo y puede eliminar información útil de los vectores de tarea, produciendo comportamientos erráticos.
- Alucinación: sin evaluación, se desconoce la tasa de alucinación; en modelos fusionados suele aumentar si los vectores son incompatibles.
- Idiomas no declarados: no se puede garantizar soporte multilingüe más allá del que herede Qwen3.5-4B.
- Contexto no documentado: se desconoce la ventana efectiva tras el merge.
- Licencia Apache-2.0: permite uso comercial, pero el autor remite a un fichero NOTICE con atribuciones de los modelos fuente; conviene revisarlo antes de producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como experimental.
- El pipeline declarado es `feature-extraction`, no `text-generation`; su uso como generador requiere verificación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsm-e2
- Modelo base 1: https://huggingface.co/joamCriff123/zils-mini-m1121t
- Modelo base 2: https://huggingface.co/wayfind/metask-jev-4b-policy-mix
- Modelo padre: https://huggingface.co/Qwen/Qwen3.5-4B
