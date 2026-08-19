# sophosympatheia/Glistening-Gem-31B-v2.0

## Resumen

Glistening-Gem-31B-v2.0 es un modelo de lenguaje creado por sophosympatheia mediante una fusión (merge) de cuatro modelos derivados de Gemma-4-31B, todos ellos fine-tunes conversacionales con orientación creativa y, en algunos casos, sin censura. El autor lo presenta como una evolución de su versión v1.0, con mayor estabilidad y creatividad. El modelo está pensado para tareas de generación de texto conversacional y creativo, aunque su pipeline se etiqueta como `image-text-to-text`, lo que sugiere una posible capacidad multimodal, aunque no se detalla en la documentación.

El modelo tiene 32.682.375.020 parámetros (aproximadamente 31B activos, aunque no es un MoE) y se distribuye bajo licencia Apache 2.0. Está diseñado principalmente para el inglés y su repositorio contiene pesos en formato `safetensors`. Un aspecto crítico es que el autor advierte de un problema conocido con los pesos de `lm_head` que afecta a los pesos transformers sin cuantizar y a los quants construidos a partir de ellos, recomendando explícitamente usar la versión v2.1 en su lugar. Esto hace que la v2.0 sea una versión desaconsejada para producción, aunque algunos quants ya en circulación podrían no verse afectados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (merge de variantes de Gemma-4-31B) |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona que algunos quants ya en circulación pueden funcionar, pero no especifica formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge creado con `mergekit`, combinando cuatro modelos base: `TheDrummer/Artemis-31B-v1`, `zerofata/G4-MeroMero-v2-31B`, `densenet/Gemma-4-31B-StyleTune-heretic-ara` y `llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic`. Todos ellos son derivados de Gemma-4-31B, por lo que la arquitectura subyacente es un transformer decoder-only estándar. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

El autor menciona que su "receta della" intentó proteger y estabilizar las capas finales alrededor de un `lm_head` fine-tuneado de forma aislada, pero el experimento falló: el `lm_head` fine-tuneado no se fusiona bien, lo que produce resultados notablemente peores e incoherentes cuando se usa el modelo con ese peso activo. Esta es la razón por la que se recomienda evitar esta versión.

## Capacidades

- Generación de texto conversacional en inglés, con enfoque en creatividad y estilo literario.
- Manejo de diálogos multi-turno (etiqueta `conversational`).
- Posible capacidad multimodal (pipeline `image-text-to-text`), aunque no se documenta ninguna entrada de imagen específica ni ejemplos de uso.
- Etiquetado como `not-for-all-audiences`, lo que indica que puede generar contenido explícito o para adultos.
- No se menciona soporte para tool calling, function calling ni razonamiento multi-paso.
- No se especifica soporte para otros idiomas distintos del inglés.

## Casos de uso

Dada la naturaleza del modelo y la advertencia del autor, los casos de uso deben considerar primero la recomendación de usar v2.1 en su lugar. Si se utiliza v2.0 con los quants adecuados, podría emplearse en:

- Escritura creativa asistida: generación de relatos, poesía o guiones con un estilo más libre y menos restrictivo que los modelos estándar.
- Roleplay conversacional: creación de personajes y mundos ficticios en chats interactivos, aprovechando su orientación conversacional.
- Generación de diálogos para videojuegos o prototipos de narrativa interactiva.
- Exploración de técnicas de fusión de modelos: como ejemplo de merge de múltiples fine-tunes de Gemma-4-31B para estudiar el impacto en la creatividad y la estabilidad.
- Investigación académica sobre alineación y desalineación: el modelo puede servir para estudiar comportamientos de modelos sin censura y sus riesgos.
- Pruebas de robustez de cuantización: dado que algunos quants funcionan a pesar del problema de `lm_head`, puede usarse para evaluar cómo la cuantización afecta a pesos problemáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 65.4 GB, lo que corresponde aproximadamente a los pesos en FP16/BF16 (32.7B parámetros × 2 bytes). Para inferencia en FP16 se necesitarían al menos 65-70 GB de VRAM, lo que requiere GPUs de clase profesional como A100 (80GB) o H100 (80GB).
- Con cuantización a 8 bits (si estuviera disponible), la VRAM necesaria bajaría a unos 35-40 GB, permitiendo su uso en RTX 4090 (24GB) no sería suficiente; se necesitaría al menos una RTX A6000 (48GB) o similar.
- Con cuantización a 4 bits, podría caber en una RTX 4090 (24GB) o similar, aunque no se especifican formatos de cuantización disponibles.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI o llama.cpp (si se generan quants GGUF). No hay información sobre latencia o throughput.
- Se recomienda encarecidamente usar la versión v2.1 en lugar de esta para evitar el problema de `lm_head`.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un merge de variantes de Gemma-4-31B, pero no hay datos de rendimiento ni especificaciones detalladas de los modelos base. Se puede mencionar que existen otros merges similares en la comunidad, como los propios modelos base, pero sin datos concretos no es posible una comparación objetiva.

## Limitaciones y advertencias

- Problema conocido con los pesos de `lm_head`: el autor confirma que el modelo con los pesos transformers sin cuantizar produce resultados incoherentes. Esto invalida el uso directo de los safetensors originales y de cualquier quant construido a partir de ellos.
- El autor recomienda explícitamente usar la versión v2.1 en su lugar, lo que hace que esta v2.0 sea una versión obsoleta y no apta para producción.
- Contenido para adultos: la etiqueta `not-for-all-audiences` indica que puede generar contenido explícito, lo que requiere moderación y filtros adicionales en entornos empresariales.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se documentan sesgos específicos, pero al ser un modelo sin censura, el riesgo de generar contenido ofensivo, sesgado o dañino es alto.
- Riesgo de alucinación: no hay datos sobre su tasa de alucinación, pero como todo LLM, puede producir información falsa o inventada.
- Licencia Apache 2.0 permite uso comercial, pero la advertencia del autor sobre el problema técnico limita su aplicabilidad práctica.

## Enlaces

- [HuggingFace: sophosympatheia/Glistening-Gem-31B-v2.0](https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.0)
- [Versión recomendada: sophosympatheia/Glistening-Gem-31B-v2.1](https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1) (enlace referenciado en la model card)
- Modelos base: [TheDrummer/Artemis-31B-v1](https://huggingface.co/TheDrummer/Artemis-31B-v1), [zerofata/G4-MeroMero-v2-31B](https://huggingface.co/zerofata/G4-MeroMero-v2-31B), [densenet/Gemma-4-31B-StyleTune-heretic-ara](https://huggingface.co/densenet/Gemma-4-31B-StyleTune-heretic-ara), [llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic](https://huggingface.co/llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic)
- Paper referenciado en tags: [arxiv:2406.11617](https://arxiv.org/abs/2406.11617) (no se confirma su relación directa con este modelo)
