# mradermacher/erawan-1.3-GGUF

## Resumen

Erawan 1.3 es un modelo de lenguaje de aproximadamente 2B parámetros (1.720.574.976 parámetros según los pesos en safetensors) desarrollado por Airavat-AI. Se trata de un ajuste fino (fine-tuning) mediante LoRA sobre una base de la familia Qwen3, orientado específicamente a tareas agénticas, uso de herramientas (tool-use), function calling y razonamiento. El repositorio analizado aquí es la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y derivados.

El modelo se distribuye bajo licencia Apache 2.0 y declara soporte únicamente para inglés. Su tamaño compacto (1,7B parámetros) lo sitúa en la categoría de modelos pequeños capaces de ejecutarse en hardware de consumo, lo que resulta relevante para prototipado de agentes, automatización local y aplicaciones de borde donde no es viable depender de una API externa.

La relevancia actual del modelo radica en su especialización: en lugar de competir en conocimiento general, se enfoca en el ciclo de razonamiento y llamada a funciones, un patrón cada vez más demandado en pipelines de agentes autónomos. La disponibilidad de cuantizaciones estáticas desde Q2_K hasta f16 permite ajustar el equilibrio entre calidad y huella de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, ajuste fino LoRA); detalles específicos de capas y atención no disponibles |
| Parámetros totales | 1.720.574.976 (~1,7B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de una base de la familia Qwen3 (etiquetada como "2B" en los tags del repositorio) y se ha ajustado mediante LoRA según indica la model card. Los tags confirman la orientación a razonamiento, uso de herramientas, function calling y comportamiento agéntico. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no reside en la arquitectura —que hereda el diseño transformer de Qwen3— sino en la especialización del ajuste fino hacia flujos de agentes. El repositorio analizado es una conversión a GGUF realizada por mradermacher, que incluye cuantizaciones estáticas (no ponderadas/imatrix según la propia model card). No se han publicado detalles adicionales sobre la estrategia de entrenamiento en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento (tag "reasoning").
- Uso de herramientas y function calling (tags "tool-use", "function-calling").
- Comportamiento agéntico (tag "agentic"), orientado a flujos multi-paso.
- Ajuste fino específico (tag "Fine-tuned") sobre base Qwen3.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Prototipado de agentes locales: el modelo puede orquestar llamadas a funciones en un bucle de razonamiento multi-paso, adecuado para entornos de desarrollo donde se quiere validar la lógica de un agente sin coste de API.
- Automatización de tareas con herramientas: integración en asistentes que invocan APIs (consultas a bases de datos, envío de correos, operaciones sobre ficheros) aprovechando su especialización en function calling.
- Despliegue en el borde (edge): con cuantizaciones Q4_K_M de ~1,2 GB, puede ejecutarse en dispositivos con poca memoria (Raspberry Pi de gama alta, mini-PC, portátiles sin GPU dedicada), lo que lo hace apto para asistentes offline.
- Enrutamiento y clasificación de intenciones: su tamaño reducido permite usarlo como primer eslabón en un pipeline que decide qué herramienta o modelo mayor invocar, reduciendo latencia y coste.
- Generación de llamadas estructuradas a APIs: dado su entrenamiento en function calling, puede generar JSON de argumentos para servicios REST en flujos de automatización internos.
- Experimentación e investigación: como modelo pequeño y abierto (Apache 2.0), sirve para estudiar el comportamiento de ajustes LoRA orientados a agentes y comparar con la base Qwen3 sin ajustar.
- Chat conversacional ligero en inglés: para asistentes embebidos con requisitos de privacidad donde los datos no pueden salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~0,9 GB
  - Q4_K_M: ~1,2 GB (recomendado por el autor de la cuantización como "fast, recommended")
  - Q6_K: ~1,5 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,5 GB
- GPU recomendadas: no disponibles de forma específica; por tamaño, cualquier GPU consumer con ≥4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) puede alojar las cuantizaciones Q4–Q8. Para f16 se recomienda ≥6 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, y servidores compatibles con endpoints (tag "endpoints_compatible"). vLLM y TGI no soportan GGUF de forma nativa; requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Especialización |
|---|---|---|---|---|---|---|
| Erawan 1.3 (este) | ~1,7B | no disponible | en | Apache 2.0 | GGUF / safetensors | Agéntico, tool-use, reasoning |
| Qwen3 (base 2B) | ~2B (tag) | no disponible | multilingüe (según Qwen3) | Apache 2.0 | safetensors / GGUF | Generalista |
| Modelos pequeños de función calling (p. ej. variantes de Qwen2.5 1.5B/3B) | 1,5–3B | variable | multilingüe | Apache 2.0 (según variante) | safetensors / GGUF | Generalista con soporte de tools |

La comparación directa con alternativas concretas no está disponible en la información proporcionada; los datos de la fila Qwen3 y de las variantes de Qwen2.5 son orientativos a partir de conocimiento general y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: la longitud de contexto no está documentada en la información disponible; no debe asumirse una ventana larga sin verificación empírica.
- Alucinación: como todo modelo de ~2B, presenta mayor propensión a inventar hechos y a generar llamadas a funciones con argumentos inválidos; requiere validación en producción.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3, hereda los sesgos de su base y del dataset de ajuste LoRA, no auditados públicamente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de la base Qwen3 y del ajuste original de Airavat-AI por si añaden restricciones adicionales.
- Cuantizaciones: las versiones Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Cuantizaciones ponderadas (imatrix): no disponibles según la model card; solo hay cuantizaciones estáticas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Fecha: el repositorio figura creado en 2026-11-09; verificar la vigencia y posibles actualizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/erawan-1.3-GGUF
- Modelo base original: https://huggingface.co/Airavat-ai/erawan-1.3
- Página de descargas del cuantizador: https://hf.tst.eu/model#erawan-1.3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
