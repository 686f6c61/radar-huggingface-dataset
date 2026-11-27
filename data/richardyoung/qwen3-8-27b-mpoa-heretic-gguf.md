# richardyoung/Qwen3.8-27B-MPOA-heretic-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen3.8-27B-MPOA-heretic, un derivado de la familia Qwen3.8 con aproximadamente 26.900 millones de parámetros. El autor, richardyoung, publica esta versión orientada a inferencia local mediante llama.cpp y Ollama, empleando técnicas de cuantización con matrices de importancia (imatrix) para preservar la calidad en niveles bajos de bits. La etiqueta "heretic" y "abliterated" indica que el modelo ha sido sometido a un proceso de eliminación o atenuación de comportamientos de rechazo (refusal), buscando un modelo "uncensored" orientado a investigación.

El modelo resuelve el problema de desplegar un LLM de ~27B en hardware de consumo o servidores modestos sin depender de infraestructura en la nube, manteniendo el contexto y capacidades del modelo base. Es relevante ahora porque la familia Qwen3.8 ofrece un equilibrio entre tamaño y rendimiento, y el ecosistema GGUF permite ejecutarlo en GPU consumer, CPU o configuraciones híbridas.

El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es Apache 2.0, aunque la naturaleza "abliterated" del modelo implica consideraciones adicionales para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8); detalles específicos no disponibles |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con imatrix (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de la familia Qwen3.8 con ~26,9B parámetros, presumiblemente un transformer denso (no se indica configuración MoE). El repositorio es una conversión a GGUF del modelo base richardyoung/Qwen3.8-27B-MPOA-heretic, realizada con llama.cpp y cuantización asistida por imatrix, técnica que calcula matrices de importancia a partir de datos de calibración para minimizar la pérdida de calidad en la cuantización.

El modelo base incorpora las técnicas "heretic" y "abliterated", que consisten en intervenciones sobre los pesos o el comportamiento para reducir los rechazos del modelo alineado original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento y respuesta a instrucciones heredadas del modelo base Qwen3.8.
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo alineado original.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp/Ollama.
- Capacidades multilingües limitadas: el repositorio declara únicamente inglés.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente.
- Visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de las técnicas abliterated/heretic comparando respuestas con el modelo alineado original, en entornos controlados.
- Despliegue local en estación de trabajo: con ~27B parámetros en GGUF, puede ejecutarse en una GPU consumer de gama alta (por ejemplo, RTX 4090 con cuantización agresiva) o en configuraciones CPU+GPU, útil para prototipado sin coste de API.
- Generación de texto creativo sin restricciones: escritura de ficción o guiones donde los rechazos del modelo alineado resultan un obstáculo, asumiendo la revisión humana posterior.
- Asistente conversacional privado: al ejecutarse en local mediante Ollama o llama.cpp, los datos no salen del equipo, adecuado para entornos con requisitos de confidencialidad.
- Evaluación comparativa de cuantizaciones: el uso de imatrix permite medir la degradación de calidad entre niveles de cuantización en tareas de razonamiento y generación.
- Experimentación con pipelines de inferencia: integración en servidores compatibles con endpoints para probar latencia y throughput en hardware propio antes de escalar a modelos mayores.
- Docencia y formación: demostraciones de LLM de gran tamaño en aulas o laboratorios con hardware limitado, gracias al formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para ~27B parámetros, una cuantización de 4 bits requiere del orden de 15-18 GB (estimación basada en el tamaño del modelo; los niveles exactos de GGUF del repo no se detallan). El repo completo ocupa 60,3 GB, lo que sugiere múltiples niveles de cuantización publicados.
- GPU recomendadas: A100 40/80 GB o H100 para precisión alta y contexto largo; RTX 4090 (24 GB) viable con cuantizaciones de 4 bits o inferiores.
- GPU consumer: sí, en RTX 3090/4090 (24 GB) con cuantización Q4 o menor; en GPUs de 12-16 GB solo con cuantizaciones muy agresivas o descarga parcial a CPU.
- Despliegue: llama.cpp, Ollama (tag `ollama`), servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic-GGUF (este) | ~26,9B | no disponible | Apache 2.0 | GGUF | Variante abliterated, acceso gated, solo inglés |
| Modelo base richardyoung/Qwen3.8-27B-MPOA-heretic | ~26,9B | no disponible | Apache 2.0 | safetensors | Mismo comportamiento, sin cuantizar |
| Otros GGUF de la familia Qwen3.8 | no disponible | no disponible | Apache 2.0 | GGUF | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": puede generar contenido que el modelo original rechazaría; requiere revisión y filtros adicionales en producción.
- Riesgo de alucinación inherente a los LLM; no se han publicado evaluaciones específicas para este derivado.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada en la ficha del repositorio; verificar antes de usarlo en tareas de contexto largo.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face; la licencia Apache 2.0 declarada debe verificarse contra los términos del modelo base.
- Al ser una cuantización, existe degradación de calidad respecto al modelo en safetensors, especialmente en niveles bajos de bits.
- Sin datos de benchmarks publicados: no se puede avalar su rendimiento frente a alternativas.
- El uso de modelos sin alineación conlleva riesgos legales y reputacionales según el contexto de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Referencia arXiv citada en los tags: arxiv:2611.17846 (no verificada en la información disponible)
