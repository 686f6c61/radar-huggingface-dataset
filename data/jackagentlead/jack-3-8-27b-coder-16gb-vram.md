# JackAgentLead/Jack-3.8-27B-Coder-16GB-VRAM

## Resumen

Jack-3.8-27B-Coder-16GB-VRAM es un modelo de generación de texto orientado a tareas de ingeniería de software de larga duración, desarrollado por Jonathan Michael Langford bajo el proyecto Jack. Está construido sobre un motor cognitivo derivado de Qwen3.8-27B, un modelo denso de 27 320 millones de parámetros, y distribuido exclusivamente en formato GGUF para su ejecución local mediante llama.cpp. El modelo incorpora una arquitectura de inferencia propia denominada Jack, que introduce estructuras de control como `workspace_state`, `grounded_source` y `anchor_fact` para mejorar la alineación entre el estado operativo del modelo y su salida final en tareas agénticas multi-turno.

Su relevancia actual radica en que aborda un problema específico de los modelos de largo contexto: no basta con almacenar historial, sino que hay que reconstruir y re-vincular el estado autoritativo en cada paso. Esto lo hace útil para flujos de trabajo de desarrollo donde conviven planes antiguos, resultados corregidos, experimentos fallidos y configuraciones contradictorias. El modelo se ofrece como un único archivo GGUF de 12,6 GB, pensado para ejecutarse en GPUs con 16 GB de VRAM, y está etiquetado con capacidades de razonamiento, tool-calling y multi-turno.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B con capas de control Jack |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base Qwen3.8-27B admite 262K tokens, pero no se confirma en este modelo) |
| Tipos de cuantizacion | no disponible (se ofrece un único archivo GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un transformer denso con atención completa y 27 320 millones de parámetros, adaptado por el proyecto Jack con un sistema de control de estado en tiempo de inferencia. La capa Jack se sitúa inmediatamente antes de la generación final, reconstruyendo el estado operativo mediante etiquetas XML que organizan la información crítica: workspace_state, grounded_source, anchor_fact, deterministic_check y pitfall_check. Este diseño busca que la información autoritativa esté cerca del punto de generación, reduciendo la interferencia de ramas descartadas o resultados inválidos en el historial.

No se dispone de información pública sobre los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF, DPO u otras. La model card menciona que el modelo se distribuye como GGUF final y que se ha diseñado específicamente para tareas agénticas de larga duración, con énfasis en la distinción entre recuerdo histórico y autoridad actual. No hay detalles sobre la composición del dataset ni sobre el proceso de adaptación sobre el modelo base.

## Capacidades

- Generación de texto con foco en código: planificación, implementación, depuración, revisión de código, diseño de pruebas y trabajo a escala de repositorio.
- Razonamiento multi-paso y auto-corrección durante largas cadenas de razonamiento, con control de estado operativo.
- Soporte de tool calling y llamadas a funciones deterministas, integrado en el flujo de trabajo agéntico.
- Manejo de contextos largos con capacidad de distinguir información histórica de información autoritativa actual.
- Capacidades multilingües no documentadas (se asume herencia de Qwen3.8, pero no se confirma).
- Modo de pensamiento nativo (native reasoning) con generación de trazas extensas antes de la salida final.
- Compatible con entornos de ejecución local mediante llama.cpp, LM Studio y endpoints compatibles con GGUF.

## Casos de uso

- Desarrollo de software agéntico en repositorios grandes: el modelo puede gestionar múltiples archivos y cambios de estado a lo largo de sesiones prolongadas, manteniendo un registro de qué configuraciones son válidas y cuáles han sido descartadas.
- Depuración de código con historial de intentos fallidos: gracias a su capacidad de distinguir resultados verificados de resultados invalidados, puede evitar repetir soluciones erróneas y centrarse en la vía correcta.
- Generación de código en pipelines de CI/CD: su soporte de tool calling permite integrarlo en flujos automatizados de revisión de código, generación de tests y análisis estático.
- Asistente de arquitectura técnica: puede gestionar planes de diseño con versiones superadas y actualizadas, y emitir recomendaciones basadas en el estado autoritativo.
- Análisis de investigaciones técnicas de larga duración: útil para mantener la coherencia en investigaciones donde se prueban varias hipótesis y se descartan opciones intermedias.
- Agente de automatización de tareas de mantenimiento: puede gestionar múltiples pasos (leer, modificar, verificar) sin perder el hilo de qué resultados son fiables.
- Generación de documentación técnica con referencias cruzadas: su capacidad de mantener un estado global del workspace permite producir documentación coherente con el código actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas comparativas para este modelo específico. Se desconoce su rendimiento relativo frente a otros modelos de código de tamaño similar.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF tiene un tamaño de 12,6 GB, por lo que se puede cargar en una GPU con 16 GB de VRAM con cuantización Q4_K_M o similar (el tamaño del repo sugiere una cuantización de 4 bits). La carga completa del modelo en fp16 requeriría aproximadamente 54 GB, por lo que es necesario cuantizar para consumo local.
- GPUs recomendadas: NVIDIA RTX 4080/4090, RTX 4000 Ada, A4000, A5000, o GPUs con 16 GB de VRAM. También puede ejecutarse en configuraciones con menos VRAM si se reduce la cuantización.
- Cabe en consumer GPU: sí, en tarjetas con 16 GB de VRAM, como la RTX 4080 o la RTX 4090 (esta última tiene 24 GB). No cabe en tarjetas de 8 GB sin cuantización agresiva.
- Opciones de despliegue: llama.cpp (nativo), LM Studio, Ollama (si se convierte a formato compatible), servidores con backends GGUF como llama-cpp-python o text-generation-webui. También puede ser usado en endpoints compatibles con GGUF.
- Latencia y throughput: no disponible. La latencia dependerá de la GPU, la cuantización y la longitud del contexto. Para una 27B en Q4_K_M, se espera una velocidad de generación de 10-20 tokens por segundo en una RTX 4090, pero no es un dato oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Foco |
|---|---|---|---|---|---|
| Jack-3.8-27B-Coder (este) | 27,3B | no disponible | no disponible | GGUF | Código, agéntico largo |
| Qwen3.8-27B (base) | 27,3B | 262K tokens | Apache 2.0 | safetensors | Multimodal, código, agéntico |
| DeepSeek-Coder-33B | 33B | 16K | MIT | safetensors | Código |
| Llama 3.3-27B (hipotético) | 27B | 128K | Llama 3.3 | safetensors | Multimodal, general |

La comparación directa es limitada porque el modelo solo se distribuye en GGUF y no se han publicado métricas. Su base es Qwen3.8-27B, que sí tiene datos de rendimiento, pero el modelo Jack añade una capa de control de estado que no está presente en la versión original.

## Limitaciones y advertencias

- Licencia: no se ha especificado, lo que impide conocer si es permitido el uso comercial o la redistribución. Se recomienda contactar con el autor antes de usar en producción.
- Sesgos: al derivar de Qwen3.8, puede heredar sesgos presentes en el modelo base, aunque no se documentan.
- Riesgo de alucinación: no se han evaluado formalmente; el modelo pretende mitigar la confusión entre estados, pero no elimina el riesgo de inventar hechos.
- Limitaciones de contexto: aunque la base Qwen3.8 soporta 262K tokens, no se confirma que el modelo Jack mantenga esa ventana completa en la versión GGUF; el archivo de 12,6 GB sugiere cuantización, que puede degradar la calidad de la atención en contextos muy largos.
- Restricciones de uso: no se mencionan restricciones explícitas, pero la falta de licencia clara es una limitación para adopción empresarial.
- Documentación técnica: la model card es extensa en aspectos conceptuales pero carece de detalles de entrenamiento, evaluación y requisitos exactos de hardware.
- Estado de producción: el modelo tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/JackAgentLead/Jack-3.8-27B-Coder-16GB-VRAM
- Perfil del autor: https://huggingface.co/JackAgentLead
- Modelo relacionado (Jack-Long-Agentic-27b-Prism-8GB-VRAM): https://huggingface.co/JackAgentLead/Jack-Long-Agentic-27b-Prism-8GB-VRAM
- Guía de ejecución local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Tests de hardware de Qwen3.8 27B: https://www.hardware-corner.net/qwen3-8-27b-hardware-tests/
