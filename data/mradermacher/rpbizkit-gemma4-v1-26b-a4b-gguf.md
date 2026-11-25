# mradermacher/RPBizkit-Gemma4-v1-26B-A4B-GGUF

## Resumen

RPBizkit-Gemma4-v1-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo RPBizkit-Gemma4-v1-26B-A4B, un merge de modelos construido con mergekit sobre una base de la familia Gemma. La cuantización la publica mradermacher, un conocido distribuidor de versiones GGUF para inferencia local, y está pensada para su uso con llama.cpp y herramientas compatibles.

El modelo base tiene 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones) según los pesos en safetensors, y la nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos con unos 4 mil millones de parámetros activos, aunque esta información no se confirma en la documentación disponible. El repositorio GGUF ocupa 15,5 GB e incluye una única cuantización estática Q4_K_S.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de un merge no auditado, con licencia no especificada, sin benchmarks publicados y sin información sobre datos de entrenamiento o composición del merge. Resulta útil principalmente como ejemplo de cadena de publicación típica (merge comunitario seguido de cuantización GGUF) y para quienes quieran evaluar el modelo base en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente MoE, según la nomenclatura "A4B"; no confirmado en la documentación) |
| Parametros totales | 25.233.142.046 (25,2 mil millones) |
| Parametros activos | no disponible (la nomenclatura sugiere ~4 mil millones, sin confirmación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S (única cuantización incluida en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantización estática); el modelo base en safetensors |
| Tamano del repositorio | 15,5 GB |
| Libreria | transformers (según metadatos), con uso previsto en llama.cpp |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B. La etiqueta `ht-mergekit` indica que se trata de un merge de modelos (fusión de pesos de dos o más checkpoints) realizado con la herramienta mergekit, no de un modelo entrenado desde cero. La nomenclatura "Gemma4" y "26B-A4B" sugiere una base de la familia Gemma con una configuración de mezcla de expertos de aproximadamente 26 mil millones de parámetros totales y 4 mil millones activos, aunque no se confirma en la model card.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del merge (método de fusión, pesos, capas afectadas). La cuantización realizada por mradermacher es de tipo estático (sin imatrix), según las notas de la model card, y solo se ofrece el nivel Q4_K_S.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo, aunque no se detallan formatos de prompt ni plantillas de chat.
- Idiomas: únicamente inglés declarado en los metadatos.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de código, matemáticas o visión: no disponibles.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades multilingües: no disponibles (solo inglés).
- Contenido para adultos: el tag `not-for-all-audiences` indica que el modelo puede generar contenido no apto para todas las audiencias, probablemente por el estilo del merge (el nombre "RPBizkit" sugiere roleplay).

## Casos de uso

- Experimentación con merges comunitarios: el modelo permite evaluar en local el resultado de un merge de la familia Gemma sin necesidad de infraestructura de GPU de gran tamaño, gracias a la cuantización Q4_K_S de 15,6 GB.
- Generación de diálogo creativo en inglés: por su orientación conversacional y el tag de contenido para adultos, puede usarse en prototipos de narrativa interactiva o roleplay, siempre con moderación y filtros adecuados.
- Pruebas de pipelines de cuantización: sirve como caso de estudio para validar flujos de descarga, carga en llama.cpp y evaluación comparativa frente al modelo base en safetensors.
- Investigación sobre calidad de merges: permite comparar la perplejidad y coherencia de un merge frente a sus modelos progenitores, aunque no se publican métricas oficiales.
- Despliegue en hardware de consumo con llama.cpp: con 15,6 GB en Q4_K_S, puede ejecutarse en GPUs con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090) o en configuraciones con offload a CPU.
- Evaluación de sesgos y seguridad en modelos no auditados: útil para estudiar cómo los merges comunitarios heredan o amplifican sesgos de sus componentes, dado el tag de contenido no apto para todas las audiencias.
- Base para fine-tuning posterior: al estar disponible en GGUF no es directamente entrenable, pero el modelo base en safetensors puede servir de punto de partida para ajustes con LoRA, sujeto a la licencia (no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,6 GB para la cuantización Q4_K_S, más overhead de contexto (KV cache). Con contexto largo, se recomienda al menos 18-20 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB, justo para Q4_K_S con contexto corto), A100 40 GB, H100 80 GB para despliegues con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4080/4090 y GPUs con 16 GB o más, con limitaciones de contexto. En GPUs de 12 GB requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF. No se proporcionan archivos para vLLM o TGI en este repositorio.
- Latencia y throughput: no disponibles. Al ser un posible MoE con ~4B activos, el throughput podría ser superior al de un modelo denso de 25B, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RPBizkit-Gemma4-v1-26B-A4B-GGUF | 25,2B | no disponible | no disponible | GGUF (Q4_K_S) | Merge comunitario, sin benchmarks |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma license | safetensors, GGUF | Modelo oficial de Google, con benchmarks publicados |
| Mistral Small 24B (referencia de tamano) | 24B | 32K | Apache 2.0 | safetensors, GGUF | Modelo denso con licencia permisiva |
| Qwen2.5 32B (referencia de tamano) | 32,5B | 128K | Apache 2.0 | safetensors, GGUF | Contexto largo y multilingüe |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo RPBizkit, y su licencia no está especificada, lo que limita la comparación en términos de uso comercial. Los modelos de referencia se incluyen por similitud de tamaño, no por equivalencia funcional.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base y el merge podrían heredar restricciones de la familia Gemma, pero no se documenta.
- Sin benchmarks ni evaluación independiente: no hay métricas de calidad, lo que impide recomendar el modelo para producción sin una evaluación propia.
- Solo inglés: no se declaran capacidades multilingües.
- Contenido no apto para todas las audiencias: el tag `not-for-all-audiences` advierte de posibles salidas ofensivas o explícitas; requiere moderación en aplicaciones públicas.
- Riesgo de alucinación: al ser un merge sin alineación documentada, no hay garantías sobre la fidelidad factual.
- Contexto desconocido: se desconoce la ventana de contexto real, lo que limita su uso en tareas de contexto largo.
- Cuantización única: solo se ofrece Q4_K_S estática, sin variantes con imatrix ni niveles superiores (Q5, Q6, Q8) en este repositorio, lo que reduce las opciones de ajuste calidad/tamaño.
- Modelo derivado de un merge: la calidad puede ser irregular según las capas fusionadas; no hay información sobre el método de merge ni los modelos progenitores.
- Fecha de creación futura (2026-11-25): los metadatos indican una fecha posterior a la actual, lo que sugiere posibles errores en la publicación o en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RPBizkit-Gemma4-v1-26B-A4B-GGUF
- Modelo base: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B
- Página de descargas de mradermacher: https://hf.tst.eu/model#RPBizkit-Gemma4-v1-26B-A4B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
