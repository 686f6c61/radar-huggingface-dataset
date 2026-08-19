# Ishowbackup/Lumix-4B

## Resumen

Lumix-4B es un modelo compacto de aproximadamente 4 000 millones de parámetros desarrollado por Blackfrost, distribuido en formato GGUF para su uso con llama.cpp y Ollama. Se trata de un fine-tune del modelo Qwen/Qwen3.5-4B, orientado a tareas de codificación, razonamiento y agente, con capacidad adicional de visión (entrada de imágenes) mediante un proyector multimodal incluido en el repositorio. El modelo está diseñado para impulsar el agente de codificación Shadow, un asistente de línea de comandos que ejecuta ciclos de "observar → actuar → verificar" con una única llamada de herramienta limpia por turno.

La relevancia de Lumix-4B radica en su tamaño reducido, que permite ejecutarlo en hardware de consumo, y en su especialización para flujos de trabajo agénticos de programación, donde la eficiencia de contexto largo y la capacidad de seguir instrucciones de forma estructurada son críticas. Al estar basado en Qwen3.5-4B, hereda una arquitectura híbrida que combina atención lineal con transformadores tradicionales, lo que mejora la eficiencia computacional en ventanas de contexto extensas. La licencia Apache-2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-4B (arquitectura GGUF `qwen35`, híbrida con atención lineal y transformadores) |
| Parametros totales | 4 205 751 296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card indica "long-context" sin especificar número) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el repositorio también contiene safetensors según los metadatos) |

## Arquitectura y entrenamiento

Lumix-4B es un fine-tune de Qwen/Qwen3.5-4B, un modelo de la familia Qwen 3.5 que, según la documentación disponible, emplea una arquitectura híbrida que mezcla atención lineal con capas transformer tradicionales. Esta combinación permite manejar secuencias largas con un coste computacional reducido, lo que resulta adecuado para tareas agénticas de codificación donde el contexto puede acumular múltiples pasos de razonamiento. El modelo se distribuye en cuantizaciones GGUF, lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp u Ollama.

No se han publicado detalles específicos sobre el proceso de entrenamiento de Lumix-4B, como el número de tokens utilizados, la composición del dataset o si se emplearon técnicas de RLHF o DPO. Tampoco se dispone de información sobre el conjunto de datos de fine-tuning. La model card únicamente menciona que está afinado para "impulsar el agente de codificación Shadow", lo que sugiere un entrenamiento orientado a instrucciones de agente y llamadas a herramientas, pero los detalles técnicos no están disponibles.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-4B, incluyendo comprensión y generación de lenguaje natural.
- Codificación: especializado en tareas de programación, con soporte para múltiples lenguajes (no se especifica cuáles).
- Visión: acepta entrada de imágenes a través del proyector multimodal `Lumix-4B-mmproj.gguf`, lo que permite analizar capturas de pantalla, diagramas o documentos técnicos.
- Agente y tool calling: la model card indica un flujo de "una llamada de herramienta limpia por turno" y el patrón "observar → actuar → verificar", lo que implica soporte para llamadas a funciones y ejecución de pasos múltiples.
- Contexto largo: diseñado para ventanas de contexto extensas, aunque no se especifica la longitud exacta.
- Multilingüe: no se ha confirmado el soporte de idiomas, pero al basarse en Qwen3.5 es probable que cubra varios idiomas, incluido el español.

## Casos de uso

- Asistente de programación en terminal: integrado con el agente Shadow CLI, puede gestionar tareas de codificación de forma autónoma, leyendo el estado del repositorio, ejecutando comandos y verificando resultados.
- Análisis de capturas de pantalla de errores: gracias a su capacidad de visión, puede recibir una imagen de un error de compilación o una traza de pila y sugerir correcciones.
- Generación de código en pipelines de CI/CD: puede actuar como un agente que revisa pull requests, sugiere cambios y ejecuta pruebas, gracias a su soporte de tool calling.
- Documentación técnica a partir de diagramas: al procesar imágenes, puede describir arquitecturas de software representadas en esquemas y generar documentación asociada.
- Prototipado rápido de scripts: para desarrolladores que necesitan generar fragmentos de código o scripts de automatización en local, con la ventaja de ejecutarse en hardware de consumo.
- Tutoría de programación interactiva: puede mantener conversaciones de contexto largo con estudiantes, explicando conceptos y resolviendo ejercicios paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para Lumix-4B. Se recomienda consultar los benchmarks del modelo base Qwen3.5-4B para una referencia aproximada, aunque el fine-tuning puede alterar el rendimiento en tareas específicas.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q3_K_M: ~2,5 GB
  - Q4_K_M: ~3 GB (recomendado por el autor)
  - Q5_K_M: ~3,5 GB
  - Q6_K: ~4 GB
  - Q8_0: ~4,5 GB
  - F16: ~8 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones más bajas (p. ej., GTX 1650, RTX 3050); para F16 se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4060, etc.).
- Cabe en GPUs de consumo: sí, especialmente con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (con soporte para el proyector de visión), Ollama, y potencialmente vLLM o TGI si se convierten los pesos a safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. Los datos de benchmarks no existen y las especificaciones de contexto no están publicadas. Como referencia, el modelo base Qwen3.5-4B pertenece a una familia que incluye variantes de 0,8B a 397B, todas bajo licencia Apache-2.0, pero Lumix-4B es un fine-tune específico cuyas características diferenciales (visión, orientación a agente) no tienen equivalentes directos documentados en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- La longitud de contexto exacta no se especifica; aunque se indica "long-context", el valor concreto es necesario para planificar despliegues en producción.
- No se dispone de información sobre sesgos, alucinaciones o comportamiento en idiomas distintos del inglés; al ser un modelo de 4B, es probable que presente limitaciones en razonamiento complejo y precisión factual.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable verificar que el modelo base Qwen3.5-4B también cumple con los requisitos de atribución.
- El modelo está optimizado para el agente Shadow; su uso fuera de ese contexto puede requerir ajustes adicionales en el prompt o en la configuración de herramientas.
- No se han encontrado evaluaciones de seguridad o robustez frente a entradas adversarias.

## Enlaces

- [HuggingFace - Ishowbackup/Lumix-4B](https://huggingface.co/Ishowbackup/Lumix-4B)
- [HuggingFace - Blackfrost-AI/Lumix-4B](https://huggingface.co/Blackfrost-AI/Lumix-4B)
- [Modelo base - Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Repositorio del agente Shadow CLI](https://github.com/Blackfrost-AI/Shadow_CLI)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://ollama.com)
