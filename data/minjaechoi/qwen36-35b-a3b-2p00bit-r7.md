# minjaechoi/qwen36-35b-a3b-2p00bit-r7

## Resumen

Qwen3.6-35B-A3B 2.00-bit routed experts (r7) es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace. Se trata de una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B en la que únicamente los expertos enrutados (routed experts) se comprimen a una media de 2,00 bits, mientras que el resto de los pesos se mantiene en BF16. El resultado se almacena ya desquantizado en tensores BF16, de modo que carga con `transformers` estándar y con vLLM sin necesidad de kernels de cuantización personalizados.

El modelo conserva los 35.107.181.936 parámetros del modelo base, con un repositorio de 70,2 GB, coherente con pesos BF16 (2 bytes por parámetro) más los metadatos de la cuantización. Al ser un checkpoint de investigación interno (identificador r7) y no un lanzamiento oficial de Qwen, no cuenta con model card extendida, licencia explicitada, idiomas declarados ni resultados de evaluación publicados.

Su relevancia es metodológica más que de producto: demuestra una vía para reducir el coste de almacenamiento de las capas MoE, que concentran la mayor parte de los parámetros pero se activan de forma dispersa, manteniendo intacta la ruta de inferencia en BF16. No obstante, la ausencia total de métricas de calidad (perplejidad, benchmarks, comparación con el modelo base sin cuantizar) impide recomendar su uso en producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE); etiqueta de la libreria `qwen3_5_moe`. Capacidades multimodales declaradas via pipeline `image-text-to-text` |
| Parametros totales | 35.107.181.936 (dato real de safetensors) |
| Parametros activos | aproximadamente 3.000 millones segun la nomenclatura A3B del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | expertos enrutados a 2,00 bits de media; resto de pesos en BF16. Pesos almacenados desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que la licencia sigue la del modelo base, que no se especifica) |
| Formato de pesos | safetensors (BF16), compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

El modelo es una variante cuantizada de Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) según la etiqueta `qwen3_5_moe` del repositorio. El pipeline declarado es `image-text-to-text`, lo que indica soporte multimodal de entrada de imagen y texto, coherente con la familia Qwen y con la arquitectura de atención y proyección visual habitual en estos modelos. El total de 35.107.181.936 parámetros y el tamaño de repositorio de 70,2 GB encajan con un almacenamiento en BF16.

La innovación técnica del checkpoint es la compresión selectiva: los expertos enrutados se cuantizan a una media de 2,00 bits, mientras que los pesos de atención, embeddings y demás componentes se mantienen en BF16. El autor indica que los pesos se guardan desquantizados en tensores BF16, por lo que la ganancia no está en la VRAM de inferencia sino en la metodología de compresión y en la facilidad de carga con herramientas estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni sobre el proceso de calibración empleado para la cuantización (tamaño del conjunto de calibración, criterio de asignación de bits por experto, etc.).

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de entradas de imagen y texto (`image-text-to-text`), según el pipeline declarado en el repositorio.
- Razonamiento y generación de código: esperables por la familia del modelo base, aunque no verificados ni documentados en la información disponible.
- Soporte de tool calling y function calling: no disponible.
- Soporte para agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo de razonamiento explícito (thinking) u otras capacidades especiales: no disponible.

## Casos de uso

- Validación de pipelines de cuantización MoE: el checkpoint sirve como referencia para equipos que investigan compresión de expertos enrutados y quieren medir la degradación entre 2,00 bits y BF16 completo sobre el mismo modelo base.
- Pruebas de integración con vLLM y `transformers`: al almacenarse los pesos en BF16 desquantizado, permite verificar la compatibilidad de carga, el reparto de tensores y el comportamiento del enrutador de expertos sin escribir kernels propios.
- Investigación académica sobre eficiencia de modelos MoE: útil para estudiar la relación entre bits por experto y calidad de salida, siempre que se ejecuten las evaluaciones que el autor no ha publicado.
- Benchmarking interno reproducible: un equipo puede fijar este checkpoint como punto de comparación (baseline) frente a sus propias cuantizaciones del mismo modelo base, dado que el identificador r7 y la media de 2,00 bits están documentados.
- Despliegue experimental multimodal en entornos con GPU de 80 GB: el modelo cabe en una H100 o A100 de 80 GB en BF16, lo que permite probar tareas de imagen y texto en un nodo único.
- Evaluación de sesgos y robustez tras compresión agresiva: permite medir si la cuantización a 2,00 bits de los expertos introduce regresiones en tareas sensibles antes de adoptar una técnica similar en un modelo propio.
- Docencia y divulgación técnica: ejemplo práctico de cuantización selectiva por tipo de capa en arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de perplejidad, ni comparación con el modelo base sin cuantizar.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 70,2 GB (coincide con el tamaño del repositorio declarado). Es necesario añadir memoria para la caché KV y activaciones.
- GPU recomendadas: 1 x H100 80 GB o 1 x A100 80 GB para inferencia en un solo nodo; 2 x A100 40 GB o 2 x L40S 48 GB con paralelismo de tensores.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en BF16. Sería necesario repartir entre 4 tarjetas de 24 GB (96 GB agregados) o aplicar una cuantización adicional a 8 o 4 bits, no incluida en este repositorio.
- Opciones de despliegue: `transformers` y vLLM, según indica el autor. Compatibilidad con llama.cpp, Ollama, TGI o SGLang no está confirmada y no se ofrecen ficheros GGUF.
- Latencia y throughput: no disponible.
- Almacenamiento: prever al menos 70,2 GB para los pesos más espacio para el tokenizador y el procesador multimodal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen36-35b-a3b-2p00bit-r7 | 35,1 mil millones (MoE, ~3 mil millones activos segun nomenclatura) | no disponible | Expertos enrutados a 2,00 bits, resto BF16 | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,1 mil millones (MoE) | no disponible | BF16 | no disponible en la informacion proporcionada | Referenciado como `base_model` |
| Qwen3-30B-A3B | 30,5 mil millones (MoE, 3,3 mil millones activos) | 32.768 tokens ampliables a 131.072 | BF16, GGUF, AWQ, GPTQ | Apache 2.0 | Ampliamente disponible |
| Mixtral 8x7B | 46,7 mil millones (MoE, 12,9 mil millones activos) | 32.768 tokens | BF16, GGUF, AWQ, GPTQ | Apache 2.0 | Ampliamente disponible |

Nota: los datos de Qwen3-30B-A3B y Mixtral 8x7B se incluyen como referencia de categoría (modelos MoE de tamano medio); no proceden de la informacion proporcionada en esta busqueda y deben verificarse en sus model cards oficiales.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de calidad. Se desconoce la degradación real introducida por la cuantización a 2,00 bits de los expertos enrutados frente al modelo base en BF16.
- La licencia no está explicitada en la información disponible; la model card remite a la del modelo base, que tampoco se detalla. No debe asumirse uso comercial permitido sin verificar la licencia de Qwen/Qwen3.6-35B-A3B.
- Es un checkpoint de investigación interno (identificador r7), sin garantías de mantenimiento, soporte ni estabilidad de API.
- Repositorio sin descargas ni likes y publicado el 17 de septiembre de 2026, con actualización dos minutos después: no hay evidencia de uso por terceros ni de validación externa.
- Riesgo de alucinación: no cuantificado; en modelos MoE fuertemente comprimidos puede aumentar, pero no hay datos al respecto.
- Idiomas soportados no declarados: no puede asumirse un rendimiento homogéneo en castellano.
- Longitud de contexto no declarada: planificar despliegues con contexto largo requiere medirla empíricamente.
- Almacenar los pesos desquantizados en BF16 implica que no se obtiene ahorro de VRAM en inferencia (70,2 GB de pesos), solo una metodología de compresión reproducible.
- No se proporcionan ficheros GGUF ni recetas de cuantización adicional, lo que limita su uso en hardware de consumo.
- El nombre y la estructura del modelo base (Qwen3.6-35B-A3B) no aparecen acompañados de documentación en los resultados de búsqueda disponibles, por lo que varias especificaciones quedan sin confirmar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p00bit-r7
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web realizada.
