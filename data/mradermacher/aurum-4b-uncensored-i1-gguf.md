# mradermacher/Aurum-4B-Uncensored-i1-GGUF

## Resumen

Aurum-4B-Uncensored-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base 2Beyes/Aurum-4B-Uncensored, un modelo de lenguaje de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) construido sobre la familia Qwen 3.5. El modelo base ha sido sometido a un proceso de "abliteration", una técnica de modificación de pesos orientada a eliminar los mecanismos de rechazo y alineación de seguridad del modelo original, de ahí la etiqueta "uncensored". La versión aquí descrita no es un modelo nuevo, sino un conjunto de ficheros GGUF listos para inferencia local con llama.cpp y derivados.

El repositorio incluye cuantizaciones de tipo i1 (imatrix) en una amplia gama de precisiones, desde Q2_K (2,1 GB) hasta Q6_K (3,7 GB), además de un fichero imatrix auxiliar de 0,1 GB para generar cuantizaciones propias. El autor indica que se trata de un modelo con capacidades de visión (los ficheros mmproj, si existen, se alojan en el repositorio estático hermano) y que soporta tool calling, lo que lo hace relevante para despliegues locales en hardware de consumo con requisitos moderados de VRAM.

La relevancia actual del modelo radica en su tamaño contenido (4,3B parámetros) combinado con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y en la disponibilidad de cuantizaciones de muy baja precisión que permiten ejecutarlo en GPUs de gama media o incluso en CPU. No obstante, la información pública sobre el modelo base es muy limitada: no se detallan datos de entrenamiento, benchmarks ni composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tags del repositorio); detalles especificos no disponibles |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien disponible imatrix auxiliar |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura concreta del modelo base no está documentada en la información disponible. Los tags del repositorio indican la familia "qwen3.5", lo que sugiere una arquitectura transformer derivada de la línea Qwen 3.5 de Alibaba, pero no se especifican detalles como número de capas, dimensión de atención, tipo de atención (completa o lineal), ni si emplea mezcla de expertos. El tag "mtp" (multi-token prediction) aparece en el repositorio, lo que podría indicar soporte de predicción multi-token, aunque no se detalla su implementación.

El modelo base 2Beyes/Aurum-4B-Uncensored ha sido sometido a abliteration, una técnica que modifica los pesos para eliminar direcciones de activación asociadas a comportamientos de rechazo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Las cuantizaciones i1 de mradermacher emplean ficheros imatrix generados con datos de calibración, lo que en la práctica mejora la calidad de las cuantizaciones de baja precisión frente a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo multi-turno.
- Tool calling / function calling, segun el tag "tool-calling" del repositorio.
- Capacidades de visión: el autor indica que es un modelo de visión y que los ficheros mmproj se alojan en el repositorio estático hermano.
- Comportamiento "uncensored" / "abliterated": ausencia de mecanismos de rechazo ante peticiones que el modelo original rechazaría.
- Soporte de predicción multi-token (tag "mtp"), aunque no se detalla su uso práctico.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades específicas de razonamiento matemático avanzado, agentes autónomos o modo "thinking".

## Casos de uso

- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (2,9 GB) o IQ4_XS (2,7 GB), el modelo cabe en GPUs con 4-6 GB de VRAM, lo que permite ejecutarlo en portátiles y equipos de gama media mediante llama.cpp u Ollama.
- Experimentación con modelos sin alineación: investigadores que estudian el efecto de la abliteration sobre el comportamiento del modelo pueden comparar esta versión con el modelo original en tareas de evaluación de sesgos y rechazos.
- Generación de texto creativo sin restricciones: para aplicaciones de escritura narrativa o roleplay donde se requiere un modelo que no aplique filtros de contenido, con la advertencia de que el operador asume la responsabilidad legal y ética.
- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno en inglés para demos y pruebas de concepto, aunque la longitud de contexto no está documentada.
- Integración en pipelines con tool calling: el tag "tool-calling" sugiere que puede invocarse desde frameworks de agentes (por ejemplo, mediante plantillas de chat compatibles con Qwen), aunque no se detalla el formato exacto de las herramientas.
- Evaluación de cuantizaciones: el repositorio incluye un amplio abanico de cuantizaciones i1, lo que permite a desarrolladores medir el impacto de la precisión en la calidad de salida para su caso de uso concreto.
- Inferencia en CPU: las cuantizaciones Q2_K (2,1 GB) y Q3_K_S (2,2 GB) permiten ejecución en CPU con RAM moderada, útil para entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,1 GB
  - Q3_K_S / IQ3_S / IQ3_M: ~2,2-2,3 GB
  - Q4_K_S / IQ4_XS: ~2,7 GB
  - Q4_K_M: ~2,9 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor velocidad y contexto. Para vision, se requiere además cargar el fichero mmproj correspondiente, lo que incrementa el uso de VRAM.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM usando cuantizaciones Q4 o inferiores. Las cuantizaciones Q5 y Q6 requieren 6-8 GB para margen de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El repositorio también incluye safetensors del modelo base para uso con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aurum-4B-Uncensored-i1-GGUF | ~4,3B | no disponible | Apache 2.0 | GGUF | Abliterated, vision, tool calling |
| Qwen2.5-3B-Instruct | ~3,1B | 32K (tipico) | Apache 2.0 | safetensors, GGUF | Modelo oficial alineado, sin abliteration |
| Llama-3.2-3B-Instruct | ~3,2B | 128K (tipico) | Llama 3.2 Community | safetensors, GGUF | Alineado, multilingue, sin vision en 3B |
| Phi-3.5-mini-instruct | ~3,8B | 128K (tipico) | MIT | safetensors, GGUF | Alineado, fuerte en razonamiento y codigo |

Nota: los datos de contexto y rendimiento de los modelos comparables son orientativos y pueden variar; no se dispone de benchmarks del modelo Aurum para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros. El operador asume la responsabilidad legal y ética de su uso.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual ni benchmarks de alucinación.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no documentada; no se recomienda su uso en tareas que requieran ventanas largas sin validación previa.
- Aunque la licencia es Apache 2.0, el modelo base podría tener restricciones adicionales no reflejadas; conviene revisar la licencia del modelo original 2Beyes/Aurum-4B-Uncensored.
- El tag "mtp" y las capacidades de visión no están documentados en detalle; la funcionalidad real de visión depende de los ficheros mmproj del repositorio estático y de su correcta integración en el runtime.
- No se dispone de información sobre sesgos demográficos, de género o culturales del modelo.
- El repositorio tiene muy poca tracción (1 like, 1639 descargas) y no hay garantía de mantenimiento o soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Aurum-4B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Aurum-4B-Uncensored-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Aurum-4B-Uncensored-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
