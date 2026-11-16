# NuevaTechLLC/gemma-3-1b-it-abliterated-matched-v2-GGUF

## Resumen

`gemma-3-1b-it-abliterated-matched-v2-GGUF` es una versión "abliterated" (con la dirección de rechazo eliminada del espacio de pesos) del modelo `unsloth/gemma-3-1b-it`, publicada por Nueva Tech LLC en formato GGUF para su uso con llama.cpp y Ollama. El modelo conserva la arquitectura y el comportamiento general del Gemma 3 de 1B parámetros de Google, pero ha sido editado para reducir drásticamente la tasa de rechazos ante peticiones que el modelo original declinaría.

La relevancia de esta build no reside solo en la eliminación de rechazos, sino en la metodología empleada: el autor describe un pipeline de "abliteración de bajo daño" que trata la eliminación de la dirección de rechazo como un problema de optimización restringida, con pares de contraste emparejados, búsqueda de capa y anchura del kernel, protección de comportamientos calibrados (admitir ignorancia, rechazar premisas falsas) y búsqueda con Optuna sobre una función objetivo que penaliza la divergencia KL y la pérdida de calibración. El resultado son dos cuantizaciones GGUF (Q4_K_M y Q8_0) listas para desplegar en hardware de consumo.

El modelo tiene 999.885.952 parámetros totales (aproximadamente 1B), está etiquetado únicamente para inglés y se distribuye bajo la licencia Gemma de Google, lo que impone restricciones de uso comercial que conviene revisar antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, según modelo base) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (según ejemplo de llama-cli con `-c 8192`; el modelo base Gemma 3 soporta más, pero no se confirma en la información disponible) |
| Tipos de cuantizacion | Q4_K_M (0,8 GB) y Q8_0 (1,1 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-1b-it`, una versión del Gemma 3 de 1B parámetros de Google ajustada para instrucciones. La arquitectura subyacente es un transformer decoder-only, aunque la model card no detalla capas, dimensiones ocultas ni cabezas de atención. El proceso de "abliteración" no es un entrenamiento convencional: se localiza una dirección de rechazo en el espacio de activaciones mediante contraste entre pares de prompts dañinos y sus "gemelos" inofensivos estructuralmente emparejados (misma longitud y registro), y se elimina mediante una edición de pesos acotada por KL.

La innovación técnica descrita es el pipeline de bajo daño: en lugar de restar la media de activaciones dañinas menos inofensivas en todas las capas (receta estándar), se realiza un escaneo de capas para encontrar dónde se separa mejor el rechazo, se aplica la edición con un kernel de anchura y fuerza buscadas sobre las proyecciones de salida de atención y MLP, se protegen cuatro comportamientos calibrados (rechazo de premisas falsas, admisión de ignorancia, rechazo de sinsentidos, respeto de restricciones negativas) con 96 pares de sonda, y se usa SVD sobre el contraste emparejado para obtener un subespacio de rango k. La búsqueda de hiperparámetros se realiza con Optuna sobre una función objetivo que combina rechazo, KL, caída de calibración y sobre-rechazo, con una posible pasada de autodestilación para "curar" la edición elegida contra los logits cacheados del modelo intacto.

## Capacidades

- Generación de texto conversacional en inglés, heredada del Gemma 3 1B instruct.
- Reducción significativa de rechazos ante peticiones que el modelo base declinaría, manteniendo el comportamiento en prompts ordinarios según el autor.
- Soporte de conversación multi-turno mediante plantilla de chat (formato Gemma) en llama.cpp y Ollama.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp/Ollama/LM Studio.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en interpretabilidad y seguridad: el modelo permite estudiar cómo se representa y elimina la dirección de rechazo en un transformer pequeño, comparando activaciones antes y después de la edición con los artefactos `extract.json` y `ablation_card.json` incluidos en el repo.
- Evaluación de metodologías de abliteración: sirve como caso de estudio reproducible para comparar el pipeline de Nueva Tech con Heretic u OBLITERATUS, ya que el autor publica métricas de daño, KL y capacidades en la model card.
- Despliegue local en hardware de consumo: con 0,8 GB en Q4_K_M y unos 2 GB de VRAM/RAM necesarios, puede ejecutarse en portátiles y GPUs de gama baja para pruebas de generación de texto sin restricciones de contenido.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido narrativo que el modelo base podría rechazar por temáticas sensibles, en un entorno controlado y con supervisión humana.
- Prototipado rápido de asistentes conversacionales en inglés: la integración con Ollama (`ollama create` y `ollama run`) permite levantar un servicio local en minutos para demos y pruebas de concepto.
- Análisis de robustez de cuantizaciones: comparar el comportamiento del Q4_K_M frente al Q8_0 para medir cuánto sobrevive la edición de abliteración tras la cuantización, un dato que el autor declara registrar en `ablation_card.json`.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de métodos de abliteración sobre Qwen3-8B (Heretic 1.4.0, OBLITERATUS y el pipeline propio), pero el texto proporcionado se interrumpe antes de mostrar los resultados completos y no incluye la tabla de daño específica de este modelo Gemma 3 1B. No se han publicado en la información disponible resultados de benchmarks (MMLU, HumanEval, GSM8K) para este modelo concreto.

## Requisitos de hardware

- VRAM/RAM estimada: unos 2 GB para el archivo Q4_K_M (0,8 GB de pesos más overhead de contexto y runtime); el Q8_0 ocupa 1,1 GB y requiere algo más de memoria.
- Cabe en GPUs de consumo: cualquier GPU con 2-4 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4060, etc.), así como en CPU con RAM suficiente.
- GPUs de datacenter (A100, H100) no son necesarias; el modelo es demasiado pequeño para aprovecharlas.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Medofile incluido en el repo), LM Studio (`lms import`).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (1B parámetros, cuantización 4-bit) se espera inferencia en tiempo real en hardware de consumo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-1b-it-abliterated-matched-v2 (este) | ~1B | 8192 (según ejemplo) | gemma | GGUF | Abliterado con pipeline de bajo daño; solo inglés |
| unsloth/gemma-3-1b-it (base) | ~1B | no disponible | gemma | safetensors | Modelo original sin editar; rechaza contenido dañino |
| Gemma 3 1B IT (Google) | ~1B | no disponible | gemma | safetensors | Modelo oficial; multilingüe según Google |
| Heretic / OBLITERATUS sobre el mismo base | ~1B | no disponible | gemma | safetensors | Métodos de abliteración alternativos citados en la model card; sin datos de esta build en la información disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo reduce la capacidad del modelo de declinar peticiones dañinas; el autor afirma proteger cuatro comportamientos calibrados, pero no se aportan métricas verificables de esta build en el texto disponible.
- Riesgo elevado de generar contenido inseguro, sesgado o inexacto sin filtros; requiere supervisión humana y moderación externa en cualquier despliegue.
- El modelo está etiquetado solo para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia Gemma: impone términos de uso de Google, con restricciones para uso comercial y obligaciones de atribución; revisar el texto completo antes de producción.
- Alucinación: como todo modelo de 1B parámetros, la fiabilidad factual es limitada; no apto para tareas que requieran precisión verificada sin comprobación posterior.
- La cuantización Q4_K_M puede degradar ligeramente el comportamiento respecto al checkpoint bf16 del que se derivan los GGUF; el autor declara registrar la supervivencia de la edición tras cuantizar, pero no se muestran los números.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia comunitaria de su comportamiento en producción.
- No se documentan capacidades de tool calling, agentes ni visión; no asumir que las hereda del Gemma 3 original sin verificación.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/gemma-3-1b-it-abliterated-matched-v2-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-3-1b-it
- Gemma 3 (Google): no disponible en la información proporcionada
- Heretic: no disponible en la información proporcionada
- OBLITERATUS: no disponible en la información proporcionada
- Paper o blog del pipeline de Nueva Tech: no disponible en la información proporcionada
