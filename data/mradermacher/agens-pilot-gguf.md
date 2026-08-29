# mradermacher/Agens-Pilot-GGUF

## Resumen

Agens-Pilot es un modelo de lenguaje multimodal de 26.900 millones de parámetros desarrollado por Blockway, orientado a tareas de agente (agentic), generación de código y conversación multilingüe con soporte de visión. La versión GGUF aquí descrita es una cuantización estática realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante formatos compatibles con llama.cpp, Ollama o LM Studio. El modelo base soporta cantonés (yue), chino (zh) e inglés, y su etiqueta "qwen3.8" sugiere una posible base en la familia Qwen, aunque no se ha confirmado oficialmente. La relevancia de esta ficha radica en que ofrece una opción de despliegue local para desarrolladores que necesitan un asistente multimodal y agéntico sin depender de APIs externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "qwen3.8" sugiere base Qwen, sin confirmar) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin valor numérico) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | cantonés (yue), chino (zh), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura interna del modelo base Blockway/Agens-Pilot. Los metadatos indican que es multimodal (incluye un proyector de visión, `mmproj`), con capacidad de procesamiento de imágenes y texto. El tag "qwen3.8" apunta a una posible arquitectura derivada de Qwen, pero sin documentación oficial no se puede confirmar. Tampoco hay datos sobre el dataset de entrenamiento, número de tokens procesados ni técnicas de alineación (RLHF, DPO, etc.). La cuantización GGUF realizada por mradermacher es de tipo estático, sin usar imatrix ni ponderación por activaciones, según se indica en la model card.

## Capacidades

- Generación de texto y chat multilingüe en cantonés, chino e inglés.
- Procesamiento multimodal de imágenes (gracias al complemento `mmproj`), lo que permite entrada visual junto con texto.
- Orientación a tareas de agente (tag "agentic"), con posible soporte de razonamiento multi-paso y uso de herramientas, aunque no hay documentación específica.
- Generación de código (tag "code"), adecuado para asistencia en programación.
- Conversación de largo contexto (tag "long-context"), aunque no se especifica la longitud exacta de la ventana.
- Compatible con frameworks de inferencia local como llama.cpp, Ollama y LM Studio gracias al formato GGUF.

## Casos de uso

- Asistente de programación local: el modelo puede generar, explicar y depurar código en varios lenguajes, ejecutándose en una GPU de consumo con la cuantización Q4_K_S (15,7 GB). Un desarrollador podría usarlo como autocompletado avanzado o para revisión de código sin enviar datos a la nube.
- Chat de atención al cliente multilingüe: gracias a su soporte de cantonés, chino e inglés, puede desplegarse en entornos donde se atiende a usuarios de Hong Kong o regiones bilingües, gestionando conversaciones multi-turno con contexto largo.
- Análisis de imágenes en local: al ser multimodal, puede procesar capturas de pantalla, fotos de documentos o diagramas y responder preguntas sobre ellos, útil en entornos con requisitos de privacidad estrictos.
- Prototipado de agentes autónomos: su orientación "agentic" permite experimentar con pipelines de razonamiento y llamadas a herramientas, aunque habrá que verificar su soporte real de function calling.
- Traducción asistida entre yue, zh y en: adecuado para traducir documentos o conversaciones, aprovechando su entrenamiento multilingüe.
- Educación y formación: puede servir como tutor de programación o de idiomas, ejecutándose en portátiles con GPU de 16 GB, sin coste de API por uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para el modelo base Blockway/Agens-Pilot. La calidad de las cuantizaciones GGUF se puede inferir de las notas de la model card (Q4_K_S recomendada por velocidad, Q8_0 por mejor calidad), pero sin valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, desde 10,8 GB (Q2_K) hasta 28,7 GB (Q8_0). La cuantización Q4_K_S (15,7 GB) es la recomendada para un equilibrio entre calidad y uso de memoria.
- GPU recomendadas: para Q4_K_S, una NVIDIA RTX 4090 (24 GB) o RTX 3090 (24 GB) funcionan cómodamente. Para Q2_K o Q3_K, GPUs de 12-16 GB como RTX 4070 Ti o RTX 3060 pueden ser suficientes. Para Q8_0, se necesitan GPUs de 32 GB o más (A100, etc.).
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q2_K, Q3_K y Q4_K_S caben en GPUs de consumo de gama alta (16-24 GB). La Q8_0 solo en GPUs profesionales o con offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier framework compatible con GGUF. También se puede usar vLLM si se convierte a safetensors, pero no es el propósito de esta versión.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización; en una RTX 4090 con Q4_K_S se puede esperar una generación de 20-40 tokens/s, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El tamaño de 26,9 B lo sitúa en el rango de modelos como Qwen2.5-27B o Llama-3.1-27B, pero al no tener benchmarks ni detalles de arquitectura, cualquier comparación sería especulativa. Se recomienda consultar el modelo base Blockway/Agens-Pilot para más datos.

## Limitaciones y advertencias

- No hay documentación oficial sobre sesgos, alucinaciones o limitaciones de seguridad del modelo base. Al ser una cuantización estática, la calidad de salida puede degradarse en las versiones de menor precisión (Q2_K, Q3_K).
- La etiqueta "long-context" no especifica la longitud real de la ventana de contexto; los usuarios deben probar empíricamente su límite.
- El soporte de visión requiere el complemento `mmproj` (incluido en el repositorio), pero no se documenta la resolución de imagen ni los formatos aceptados.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen (si se confirma), habría que revisar la licencia original de Qwen para evitar conflictos.
- No se garantiza el soporte de function calling o tool calling; la orientación "agentic" es una etiqueta, no una capacidad verificada.
- El repositorio GGUF no incluye archivos de imatrix, por lo que las cuantizaciones pueden tener una calidad inferior a las versiones con imatrix de otros modelos.

## Enlaces

- [Repositorio GGUF en HuggingFace](https://huggingface.co/mradermacher/Agens-Pilot-GGUF)
- [Modelo base Blockway/Agens-Pilot](https://huggingface.co/Blockway/Agens-Pilot)
- [Página de solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
