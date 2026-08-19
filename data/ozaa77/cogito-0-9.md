# ozaa77/Cogito-0.9

## Resumen

Cogito-0.9 es un modelo de lenguaje de 14.770 millones de parámetros desarrollado por el usuario ozaa77 y publicado bajo licencia Apache 2.0. Se presenta como un "artefacto de investigación" diseñado para el razonamiento escéptico y la verificación lógica: en lugar de comportarse como un asistente complaciente, genera un monólogo interno estructurado con etiquetas `<confidence>`, `<thought>` y `<action>` antes de responder, con el objetivo de evaluar premisas, detectar suposiciones débiles y corregir al usuario si es necesario.

El modelo se distribuye únicamente en formato GGUF cuantizado Q4_K_M, pensado para inferencia local con llama.cpp y runtimes compatibles (LM Studio, Ollama, text-generation-webui, koboldcpp). Su ventana de contexto recomendada es de 4096 tokens o superior. La relevancia actual reside en su enfoque explícito hacia el razonamiento adversarial y el comportamiento "verify-before-answer", una capacidad poco común en modelos de este tamaño y que puede resultar útil en flujos de trabajo agénticos o de revisión crítica.

No se dispone de información pública sobre la arquitectura interna (tipo de transformer, número de capas, atención, etc.), los datos de entrenamiento ni los benchmarks. El autor lo describe como un "modelo provisional" y recomienda tratarlo como un artefacto de investigación, no como un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 4096+ (recomendado por el autor) |
| Tipos de cuantizacion | Q4_K_M (único archivo GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo (número de capas, tipo de atención, si es un transformer denso o MoE, etc.). El autor menciona que el modelo ha sido sometido a "targeted representation engineering" para eliminar el comportamiento de sumisión servil, lo que sugiere una intervención en las representaciones internas durante el entrenamiento o el ajuste fino, pero no se ofrecen detalles técnicos adicionales.

El comportamiento distintivo del modelo es la generación de un "monólogo interno" estructurado con etiquetas `<confidence>`, `<thought>` y `<action>` antes de la respuesta final. Esto parece ser un patrón aprendido durante el ajuste, no una arquitectura especial. No se especifican los datos de entrenamiento (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO).

## Capacidades

- Razonamiento explícito: genera una traza interna de confianza, pensamiento y acción antes de responder, lo que permite auditar su proceso de razonamiento.
- Comportamiento escéptico: evalúa premisas, detecta suposiciones no verificadas y puede corregir al usuario (acción `correct_user`).
- Verificación lógica: el monólogo interno incluye pasos de verificación antes de dar una respuesta final.
- Adecuado para tareas de revisión crítica y debate, donde se espera que el modelo cuestione argumentos en lugar de validarlos.
- No se mencionan capacidades de tool calling, generación de código, visión, audio u otras modalidades.

## Casos de uso

- Investigación sobre razonamiento adversarial: el modelo puede servir como objeto de estudio para analizar cómo un LLM expresa duda, verifica premisas y responde a argumentos débiles, gracias a su traza `<thought>` explícita.
- Práctica de debate y entrenamiento argumentativo: se puede utilizar para simular un oponente que cuestiona las premisas del usuario, ayudando a fortalecer argumentos mediante la exposición a críticas lógicas.
- Revisión de borradores con enfoque crítico: en lugar de un revisor que valida, Cogito puede señalar inconsistencias, suposiciones no fundamentadas y fallos de razonamiento en textos técnicos o académicos.
- Flujos agénticos con verificación previa: en pipelines donde un agente debe comprobar la validez de una hipótesis antes de actuar, el modelo puede generar un paso de verificación explícito (acción `verify`) que luego se incorpora al proceso.
- Pruebas de robustez de modelos: al comparar las respuestas de Cogito con las de asistentes complacientes, se pueden evaluar sesgos de conformidad en otros sistemas.
- Entornos educativos de pensamiento crítico: como herramienta para practicar la identificación de falacias lógicas y la formulación de contraargumentos, siempre bajo supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval, GSM8K u otras, ni comparaciones con modelos similares.

## Requisitos de hardware

- El archivo GGUF Q4_K_M de 14.770 millones de parámetros ocupa aproximadamente 8,5 GB (estimación orientativa basada en el tamaño típico de Q4_K_M para esa cantidad de parámetros; el tamaño exacto del archivo no se indica en la información proporcionada).
- VRAM estimada para inferencia: al menos 10-12 GB para cargar el modelo en GPU con contexto de 4096 tokens, considerando overhead de KV cache y buffers. Para contexto mayor, se necesitaría más memoria.
- GPU recomendadas: tarjetas con 12 GB o más de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090, A10, A100, etc.). En CPU, se puede ejecutar con llama.cpp, aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp (CLI o servidor), LM Studio, Ollama (importando el GGUF), text-generation-webui, koboldcpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 4090), se espera una velocidad de generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de tamaño similar (por ejemplo, Llama-3-8B, Mistral-7B, Qwen-14B). El autor no publica benchmarks ni características técnicas que permitan una comparación objetiva. Se recomienda evaluar Cogito-0.9 directamente en los casos de uso previstos antes de sustituir cualquier modelo existente.

## Limitaciones y advertencias

- El modelo es un "artefacto de investigación" y no está ajustado para ser un asistente complaciente; puede responder de forma brusca o corregir al usuario, lo que lo hace inadecuado para atención al cliente o entornos donde se requiera amabilidad.
- La traza `<confidence>`, `<thought>` y `<action>` es un patrón comportamental aprendido, no una garantía de precisión factual. Los valores de confianza son autoinformes del modelo y no deben tratarse como métricas fiables.
- Al ser una cuantización Q4_K_M, existe pérdida de precisión respecto a los pesos completos, lo que puede afectar la calidad del razonamiento en tareas complejas.
- El modelo solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se han publicado datos sobre sesgos, alucinaciones o riesgos específicos más allá de los mencionados. Se recomienda revisar todas las salidas antes de cualquier uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda no utilizarlo en entornos de cara al cliente sin una evaluación adicional.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/ozaa77/Cogito-0.9
- Repositorio HuggingFace del GGUF Q4_K_M: https://huggingface.co/ozaa77/Cogito-0.9-Q4_K_M-GGUF
- Referencia a la nueva versión (Cogito-0.9.1-15B-GGUF): https://huggingface.co/ozaa77/Cogito-0.9.1-15B-GGUF (mencionada en la model card, no verificada en la búsqueda web)
