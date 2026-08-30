# agentic-ptb/opus-high-v3.h045.lrA.step_24

## Resumen

`opus-high-v3.h045.lrA.step_24` es un checkpoint intermedio derivado de un experimento de entrenamiento agéntico del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, un transformer de 9.409.813.744 parámetros. El experimento, denominado "opus-high-v3", fue ejecutado mediante agentes Claude Code (de ahí el prefijo "opus") y el checkpoint corresponde a la hora 45 de ejecución (h045) y al paso 24 (step_24).

La model card advierte explícitamente de que este es un checkpoint intermedio/derivado retenido para reproducibilidad y estudio cualitativo, y que el run **no encontró ninguna mejora en los pesos entrenados**. Se trata, por tanto, de un resultado negativo: el fine-tuning no produjo una mejora respecto al modelo base. Su relevancia radica en que permite estudiar por qué fallan ciertos pipelines de entrenamiento agéntico, no en su utilidad como modelo desplegable. El repositorio contiene únicamente pesos en formato safetensors (18.8 GB) y no incluye documentación adicional sobre capacidades, benchmarks o configuración de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión nativa) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es el resultado de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El proyecto AgentPTB emplea agentes basados en Claude Code para generar datos de entrenamiento y ejecutar los runs de fine-tuning de forma autónoma. El run "opus-high-v3" forma parte de una serie de experimentos (v1, v2, v3) documentados en el dataset `agentic-ptb/opus-high-v3-data`.

Según la información disponible, el run no logró mejorar los pesos: la model card indica que "no se encontró mejora en los pesos entrenados" y que el checkpoint se conserva únicamente por reproducibilidad. No se especifican detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. El archivo `INDEX` del proyecto menciona que en un run anterior (opus-high-v2) se abortó y se enviaron los tensores del modelo base sin cambios tras regresiones en los cinco runs de SFT, lo que sugiere problemas recurrentes en la metodología de entrenamiento agéntico.

## Capacidades

No se dispone de información específica sobre las capacidades de este checkpoint. Al ser un fine-tuning de `Qwen3.5-9B-Base`, cabría esperar que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, etc.), pero el run no mostró mejora alguna y el autor advierte explícitamente de que no se debe inferir calidad a partir de la publicación. Por tanto:

- No se garantiza ninguna capacidad específica más allá de las del modelo base.
- No hay evidencia de soporte para tool calling, agentes o razonamiento multi-paso mejorado respecto al base.
- No se han documentado capacidades multilingües específicas.
- No se ha verificado ningún modo especial (thinking, visión, audio).

## Casos de uso

Dado que se trata de un resultado negativo sin mejora demostrada, no se recomienda su uso en ningún escenario práctico de producción. Los únicos usos razonables son:

- **Investigación sobre reproducibilidad**: analizar por qué el pipeline de entrenamiento agéntico no produjo mejoras, comparando los tensores con los del modelo base.
- **Estudio de degradación**: examinar si el fine-tuning introdujo regresiones en tareas específicas y cuantificar el deterioro.
- **Depuración de pipelines de SFT**: utilizar este checkpoint como punto de referencia para identificar fallos en la generación de datos, la configuración del optimizador o la dinámica de entrenamiento.
- **Validación de métricas de evaluación**: comprobar si los benchmarks utilizados en el proyecto son sensibles a cambios de pesos mínimos o si adolecen de problemas de saturación.
- **Documentación de resultados negativos**: servir como ejemplo en publicaciones sobre fallos en entrenamiento agéntico, contribuyendo a la transparencia en la investigación.
- **Comparación de arquitecturas de agentes**: contrastar el comportamiento de este run con otros del mismo proyecto (v1, v2) para entender qué variables afectan al éxito del fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de rendimiento y el autor advierte explícitamente de que no se debe inferir calidad a partir de la publicación. Al tratarse de un checkpoint intermedio sin mejora, cualquier métrica reportada sería engañosa.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en safetensors ocupan 18.8 GB en precisión fp16. Para cargar el modelo completo en memoria se necesitan al menos 20-24 GB de VRAM, dependiendo del overhead del runtime (por ejemplo, 24 GB en una RTX 3090/4090 o A10G).
- **GPU recomendadas**: GPUs con 24 GB o más (RTX 3090, RTX 4090, A10G, A100 40GB, H100). No cabe en GPUs de 16 GB sin cuantización, y no se proporcionan cuantizaciones oficiales.
- **Opciones de despliegue**: al no existir versiones GGUF ni cuantizadas, las opciones se limitan a runtimes que soporten safetensors en fp16, como vLLM, Hugging Face Transformers o TGI. Es posible convertir los pesos a GGUF manualmente con herramientas como `llama.cpp`, pero no hay soporte oficial.
- **Latencia y throughput**: no disponibles. Al ser un checkpoint sin optimización y sin documentación, no se pueden estimar valores fiables.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa fiable. El único punto de referencia lógico es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual este checkpoint es un derivado. La comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `Qwen/Qwen3.5-9B-Base` | 9.4B | no especificado | apache-2.0 | Modelo base de referencia |
| `opus-high-v3.h045.lrA.step_24` | 9.4B | no especificado | apache-2.0 | Checkpoint intermedio sin mejora |

No se conocen alternativas de la misma categoría (fine-tunings agénticos de 9B) con datos comparables. Cualquier otra comparación con modelos como Llama 3.1 8B o Mistral 7B sería especulativa sin benchmarks.

## Limitaciones y advertencias

- **Resultado negativo**: el run no produjo ninguna mejora en los pesos entrenados. El modelo no debe utilizarse como sustituto del base en ninguna aplicación.
- **Checkpoint intermedio**: no es un modelo final ni optimizado para inferencia; puede contener artefactos del entrenamiento (por ejemplo, estados de optimizador o pesos a medio converger).
- **Sesgos del modelo base**: al derivar de Qwen3.5-9B-Base, hereda los sesgos y limitaciones de dicho modelo, que no están documentados en esta ficha.
- **Riesgo de alucinación**: no se ha evaluado; tratándose de un fine-tuning sin validación, el riesgo es al menos el del modelo base.
- **Restricciones de licencia**: la licencia apache-2.0 permite uso comercial, pero dado que el modelo no ofrece valor añadido y no se recomienda su uso, esta cláusula es irrelevante en la práctica.
- **Falta de documentación**: no hay información sobre el dataset de entrenamiento, la configuración de hiperparámetros ni el proceso de evaluación, lo que impide replicar o entender el experimento en profundidad.
- **Advertencia del autor**: la model card indica explícitamente "do not infer quality from publication" (no inferir calidad a partir de la publicación).

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/agentic-ptb/opus-high-v3.h045.lrA.step_24)
- [Dataset del run - opus-high-v3-data](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de experimentos AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
