# mradermacher/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic-GGUF

## Resumen

Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic es un modelo de lenguaje de 4.326.350.848 parámetros (aproximadamente 4,33 mil millones) derivado de la familia Qwen3.5. No se trata de un modelo entrenado desde cero, sino de un merge de tres destilaciones sobre una base Qwen3.5-4B, posteriormente sometido a un proceso de "abliteration" o "heretic" que elimina las capas de rechazo y alineación de seguridad. El resultado es un modelo "uncensored" orientado a razonamiento, matemáticas y disciplinas STEM, distribuido originalmente por el usuario xtools-at y cuantizado a GGUF por mradermacher.

La relevancia de esta ficha radica en que combina dos tendencias actuales: la destilación de trazas de razonamiento de modelos frontera (los datasets de entrenamiento hacen referencia a salidas de Claude Opus 4.6 y a un conjunto de razonamiento Qwen3.5) y la eliminación de restricciones de contenido mediante técnicas de abliteration. El modelo está pensado para ejecución local en hardware de consumo gracias a su tamaño compacto y a la disponibilidad de cuantizaciones GGUF de 2 a 8 bits.

La información pública disponible es limitada: la model card del repositorio GGUF es fundamentalmente una plantilla de cuantización de mradermacher y no documenta la arquitectura interna, los datos de entrenamiento ni los resultados de evaluación. Esta ficha refleja exclusivamente lo que puede verificarse a partir de los metadatos y del repositorio, indicando de forma explícita los datos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles internos no disponibles) |
| Parámetros totales | 4.326.350.848 (~4,33 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repositorio | 41,0 GB (incluye todas las cuantizaciones) |
| Tipo de modelo | Merge de destilaciones + abliteration ("heretic"/"uncensored") |
| Modelo base | xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic |

## Arquitectura y entrenamiento

El modelo es el resultado de un pipeline de tres etapas sobre una base Qwen3.5-4B: (1) destilación múltiple de trazas de razonamiento procedentes de tres datasets —`nohurry/Opus-4.6-Reasoning-3000x-filtered`, `Jackrong/Qwen3.5-reasoning-700x` y `Roman1111111/claude-opus-4.6-10000x`—, (2) fusión (merge) de los tres modelos destilados en uno solo, y (3) aplicación de técnicas de abliteration/heretic para eliminar el comportamiento de rechazo. Los tags del repositorio confirman explícitamente `knowledge-distillation`, `merge`, `heretic`, `uncensored`, `decensored` y `abliterated`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.). La model card del repositorio GGUF es una plantilla de cuantización estática generada por mradermacher y no incluye detalles técnicos del modelo subyacente. La presencia de ficheros `mmproj` (multi-modal supplement) en el repositorio sugiere capacidades multimodales en el modelo base, aunque no se documenta su alcance.

## Capacidades

- Generación de texto conversacional en inglés (tag `conversational`).
- Razonamiento multi-paso y cadenas de pensamiento, derivadas de la destilación de trazas de razonamiento de modelos frontera.
- Matemáticas y disciplinas STEM (tags `mathematics`, `stem`).
- Comportamiento "uncensored": ausencia de rechazos ante peticiones que los modelos alineados estándar bloquearían.
- Posible soporte multimodal (visión) inferido de la presencia de ficheros `mmproj`, aunque no confirmado en la documentación.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas explícitamente, aunque el tag `reasoning` sugiere razonamiento encadenado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del Qwen3.5-4B original, útil para analizar qué comportamientos de rechazo se eliminan y con qué coste en calidad.
- Razonamiento matemático local: con 4,33 B de parámetros y cuantización Q4_K_M, puede ejecutarse en una GPU de consumo para resolver problemas STEM paso a paso sin depender de APIs externas.
- Generación de datos sintéticos de razonamiento: al haber sido destilado de trazas de modelos frontera, puede emplearse para producir cadenas de pensamiento que alimenten pipelines de destilación posteriores, siempre que se validen las salidas.
- Experimentación con contenido sin filtros: útil en entornos de investigación controlados para estudiar la generación de texto sin restricciones de contenido, con las salvaguardas legales y éticas correspondientes.
- Prototipado rápido en local con llama.cpp u Ollama: su tamaño permite iterar en un portátil con GPU modesta, evaluando prompts de razonamiento antes de escalar a modelos mayores.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 tipos de cuantización (de Q2_K a f16), lo que permite medir la degradación de calidad en tareas de razonamiento según el nivel de compresión.
- Fine-tuning posterior: al ser Apache 2.0 y de tamaño reducido, sirve como base para ajustes específicos de dominio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (4,33 B de parámetros):
  - f16: ~8,7 GB
  - Q8_0: ~4,6 GB
  - Q6_K: ~3,6 GB
  - Q5_K_M: ~3,1 GB
  - Q4_K_M: ~2,7 GB
  - Q3_K_M: ~2,2 GB
  - Q2_K: ~1,7 GB
  - IQ4_XS: ~2,4 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q4_K_M hasta una RTX 4090 con f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic (este) | 4,33 B | no disponible | Apache 2.0 | GGUF, safetensors | Merge destilado + abliterated, solo inglés |
| Qwen3.5-4B (base original) | ~4 B | no disponible | Apache 2.0 | safetensors | Modelo alineado de referencia; sin abliteration |
| Llama 3.2 3B Instruct | 3,21 B | 128 K | Llama 3.2 Community | GGUF, safetensors | Multilingüe, alineado, sin capacidades uncensored |
| Phi-3.5-mini-instruct | 3,82 B | 128 K | MIT | GGUF, safetensors | Multilingüe, orientado a razonamiento, alineado |

La comparativa se limita a datos públicos de cada familia; no se dispone de evaluaciones cruzadas que permitan comparar rendimiento real entre estos modelos en las mismas tareas.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": ha sido modificado para eliminar rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sesgado sin filtro. No apto para producción orientada al público sin capas de moderación adicionales.
- Entrenado y documentado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo elevado de alucinación: es un modelo pequeño (4,33 B) destilado de trazas de modelos mayores, y la destilación de razonamiento no garantiza fidelidad factual.
- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones; la trazabilidad es muy limitada.
- La abliteration puede degradar capacidades generales (razonamiento, matemáticas) respecto al modelo base; no hay benchmarks que lo cuantifiquen.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido que genere en jurisdicciones concretas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso comunitario ni validación independiente.
- Fecha de creación (2026-11-12) y la referencia a "Opus 4.6" en los datasets sugieren que los metadatos pueden contener información no verificable; conviene tratar la procedencia con cautela.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic-GGUF
- Dataset de destilación 1: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset de destilación 2: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset de destilación 3: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
