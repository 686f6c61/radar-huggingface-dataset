# 977895k/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated

## Resumen

Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated es una distribución del modelo huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated, publicada por el usuario 977895k. Se construye sobre la arquitectura Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) con 35.951.822.704 parámetros totales según los pesos en safetensors. El modelo combina la base de Qwen con una destilación de estilo Claude 4.7 Opus y un proceso de "abliteration" orientado a eliminar los mecanismos de rechazo (refusals) del modelo original.

La relevancia de esta ficha radica en que se trata de un modelo multimodal (pipeline image-text-to-text) con capacidades declaradas de razonamiento, uso de herramientas y comportamiento agéntico, pero distribuido como variante "uncensored". Es decir, el autor ha modificado los pesos para reducir las negativas del modelo ante ciertas peticiones. Esto tiene implicaciones directas en su uso en producción, ya que la ausencia de rechazos no equivale a mayor calidad ni a mayor seguridad, y puede aumentar el riesgo de generar contenido inapropiado o incorrecto.

El repositorio tiene 71,9 GB, licencia apache-2.0, y fue creado el 18 de noviembre de 2026. En el momento de la consulta registra 0 descargas y 0 likes, lo que indica que es una publicación muy reciente y sin validación comunitaria. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), tag `qwen3_5_moe` |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text (multimodal) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamaño del repositorio | 71,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), identificado en los tags del repositorio como `qwen3_5_moe` y derivado de Qwen/Qwen3.6-35B-A3B. El recuento real de parámetros en safetensors es de 35.951.822.704, coherente con la denominación "35B-A3B" del modelo base, aunque no se especifica en la información disponible cuántos parámetros permanecen activos por token ni cuántos expertos contiene la red.

El proceso de entrenamiento descrito en la model card es una destilación con estilo de Claude 4.7 Opus sobre la base Qwen3.6-35B-A3B, seguida de una "abliteration" destinada a eliminar los comportamientos de rechazo. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La información sobre el pipeline de destilación y ablación es mínima y no verificable a partir de los datos proporcionados.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Razonamiento explícito con modo "thinking" (tag `thinking`).
- Razonamiento agéntico y multi-step (tags `agent`, `agentic`, `reasoning`).
- Uso de herramientas y function calling (tag `tool-use`).
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`).
- Comportamiento "uncensored" por ablación de rechazos (tags `abliterated`, `uncensored`).
- Estilo de respuesta destilado de Claude 4.7 Opus (tag `claude`).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes conversacionales multi-turno: el modelo puede mantener diálogos prolongados y encadenar turnos con contexto, aprovechando su naturaleza conversacional y su modo de razonamiento para respuestas elaboradas.
- Automatización de agentes con tool calling: los tags `agent` y `tool-use` indican que puede invocar funciones externas, lo que permite integrarlo en flujos de orquestación de tareas (consultas a APIs, recuperación de datos, ejecución de acciones).
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede emplearse para extraer información de capturas, formularios o diagramas combinados con instrucciones textuales.
- Razonamiento multi-step en pipelines de análisis: su modo "thinking" lo hace adecuado para tareas que requieren descomposición de problemas, como planificación o resolución de incidencias técnicas.
- Generación de código asistida: aunque no se documentan benchmarks de código, el modelo base Qwen3.6 y el estilo Claude sugieren uso en autocompletado y revisión de código dentro de entornos de desarrollo.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, es útil para estudiar el efecto de la eliminación de rechazos en el comportamiento del modelo, comparándolo con el base sin modificar.
- Prototipado de aplicaciones multimodales: permite experimentar con entrada de imagen y texto en un único modelo MoE de 35B, sin necesidad de orquestar modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 72 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 36-40 GB, viable en una A100 40GB o H100 80GB.
- VRAM estimada en cuantización de 4 bits: en torno a 18-22 GB, potencialmente viable en una RTX 4090 (24 GB) con contexto limitado.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para precisión completa; RTX 4090 o A6000 para cuantización agresiva.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI); el repositorio solo declara compatibilidad con `transformers` y safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated | 35,95B (MoE) | no disponible | apache-2.0 | image-text-to-text | Variante abliterated, sin benchmarks publicados |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (MoE) | no disponible | no disponible en esta ficha | no disponible | Modelo original sin ablación ni destilación Claude |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated | 35B (MoE) | no disponible | no disponible en esta ficha | no disponible | Distribución original de la que deriva esta |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación de rechazos puede degradar la calidad del modelo en tareas que requieren discernimiento ético o factual, y aumenta el riesgo de generar contenido inapropiado, ofensivo o peligroso.
- Riesgo elevado de alucinación: no hay benchmarks ni validación comunitaria (0 descargas, 0 likes) que respalden la fiabilidad de las respuestas.
- La model card es extremadamente escasa: no documenta datos de entrenamiento, idiomas, contexto ni parámetros activos, lo que dificulta evaluar su idoneidad para producción.
- Aunque la licencia es apache-2.0, el uso comercial de una variante abliterated conlleva riesgos reputacionales y de cumplimiento normativo que deben evaluarse por separado.
- El modelo base Qwen3.6-35B-A3B puede tener sus propias restricciones de uso no reflejadas en esta ficha.
- No se garantiza soporte multilingüe ni comportamiento consistente fuera del inglés, dado que no se documentan idiomas.
- El tamaño del repositorio (71,9 GB) implica requisitos de almacenamiento y ancho de banda considerables para su despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/977895k/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Distribución original: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated
