# onocloud/onoai-basalt-2.5-pro-GGUF

## Resumen

OnoAI Basalt 2.5 Pro es un modelo de generación de texto de 7B parámetros (7.615.616.512 exactamente) desarrollado por OnoCloud & OnoAI Engineering Labs, distribuido en este repositorio únicamente en formato GGUF cuantizado Q4_K_M. La model card lo presenta como una "GGUF Server Edition" orientada a ejecución local mediante Ollama, con etiquetas que apuntan a casos de uso de código y ERP (planificación de recursos empresariales). El repositorio tiene 4,7 GB y, en el momento de la consulta, no registra descargas ni interacciones.

La información pública es muy limitada: no se detalla la arquitectura interna, el volumen de datos de entrenamiento, el proceso de alineación ni los idiomas soportados. La etiqueta `qwen2` en Hugging Face sugiere una base derivada de la familia Qwen2, pero no hay confirmación explícita en la model card. La licencia es propietaria y restrictiva (OnoCloud Sovereign Enterprise Restrictive License, OSRL-1.0), lo que condiciona fuertemente su uso comercial.

Su relevancia actual es acotada: se trata de un modelo pequeño, cuantizado para consumo en hardware modesto y empaquetado para despliegue rápido con Ollama, pero sin benchmarks publicados ni documentación técnica que permita evaluar su calidad frente a alternativas abiertas equivalentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen2` sugiere base tipo transformer decoder-only, sin confirmación oficial) |
| Parámetros totales | 7.615.616.512 (~7,6B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | OnoCloud Sovereign Enterprise Restrictive License (OSRL-1.0), etiquetada como `other` |
| Formato de pesos | GGUF (archivo `onoai-basalt-2.5-pro.Q4_K_M.gguf`, 4,68 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro tipo de alineación. La etiqueta `qwen2` presente en el repositorio apunta a una posible base derivada de Qwen2, pero la model card no lo confirma ni detalla modificaciones, fine-tuning o destilación.

La única innovación documentada es el empaquetado: una cuantización Q4_K_M descrita por el autor como de "precisión quirúrgica" y bajo consumo de VRAM, distribuida con instrucciones de ejecución directa vía Ollama (`ollama run hf.co/onocloud/onoai-basalt-2.5-pro-GGUF`). No hay información sobre decodificación especulativa, atención lineal ni otras técnicas de eficiencia.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Orientación declarada a código y ERP según las etiquetas del repositorio (`code`, `erp`), sin detalles sobre el alcance real.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con infraestructura de inferencia estándar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistencia a desarrolladores en local: al ser un GGUF Q4_K_M de 4,68 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta y usarse como asistente de código en el editor mediante Ollama, siempre que se valide su calidad real con pruebas propias.
- Automatización de tareas ERP en entornos con requisitos de soberanía de datos: la licencia y el posicionamiento "sovereign" apuntan a despliegues on-premise donde el texto no debe salir de la infraestructura; encaja en la generación de borradores de informes, resúmenes de incidencias o clasificación de tickets internos.
- Prototipado rápido de chatbots internos: la ejecución con un solo comando de Ollama permite montar un servicio de conversación multi-turno en minutos, útil para validar flujos antes de invertir en modelos mayores.
- Procesamiento por lotes en CPU: al estar cuantizado en Q4_K_M, es viable ejecutar tareas de generación por lotes (etiquetado, reformulación, extracción simple) en servidores sin GPU, con throughput bajo pero coste marginal mínimo.
- Entornos educativos y de investigación: sirve como ejemplo práctico de despliegue de un modelo de 7B cuantizado y de evaluación de licencias propietarias restrictivas en pipelines de IA.
- Integración en pipelines compatibles con endpoints: la etiqueta `endpoints_compatible` permite conectarlo a servidores de inferencia estándar para pruebas A/B frente a otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantización Q4_K_M publicada (archivo de 4,68 GB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090); también viable en A100/H100 para despliegues multi-usuario, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más; en configuraciones de 6 GB puede requerir reducir el contexto.
- Opciones de despliegue: Ollama (soporte oficial vía `ollama run hf.co/onocloud/onoai-basalt-2.5-pro-GGUF`), llama.cpp y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requerirían conversión.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks públicos |
|---|---|---|---|---|---|
| OnoAI Basalt 2.5 Pro | ~7,6B | no disponible | Propietaria (OSRL-1.0) | GGUF Q4_K_M | No publicados |
| Qwen2.5-7B-Instruct | 7,6B | 32K (128K en variantes Turbo) | Apache 2.0 | safetensors, GGUF | Sí, extensos |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Sí, extensos |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Sí, extensos |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento del modelo de OnoCloud. Frente a las alternativas abiertas de la misma franja, la diferencia principal es la licencia: las tres alternativas permiten uso comercial con condiciones conocidas, mientras que la OSRL-1.0 es restrictiva y requiere revisión legal.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible estimar su calidad frente a modelos abiertos de 7-8B sin evaluarlo internamente.
- Documentación técnica mínima: se desconoce la arquitectura exacta, el contexto máximo, los idiomas y el proceso de entrenamiento, lo que dificulta anticipar su comportamiento en producción.
- Licencia propietaria y restrictiva (OnoCloud Sovereign Enterprise Restrictive License, OSRL-1.0): es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial; las condiciones de redistribución y despliegue no están resumidas en la model card.
- Riesgo de alucinación: inherente a los modelos de 7B sin datos de alineación publicados; no se han documentado evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles; al desconocerse la composición del dataset, no se pueden evaluar sesgos de género, idioma o dominio.
- Limitaciones de contexto e idioma: no documentadas; la ausencia de lista de idiomas impide confirmar un soporte multilingüe fiable.
- Madurez del repositorio: 0 descargas y 0 interacciones en el momento de la consulta, sin comunidad ni issues que permitan contrastar experiencias.
- Una única cuantización disponible (Q4_K_M): no hay versiones de mayor precisión (Q8, FP16) ni alternativas para escenarios que requieran máxima fidelidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onocloud/onoai-basalt-2.5-pro-GGUF
- Licencia (referenciada en la model card): archivo LICENSE del repositorio
- Ejecución vía Ollama: `ollama run hf.co/onocloud/onoai-basalt-2.5-pro-GGUF`
- Paper, blog, repositorio de código o demo oficiales: no disponibles en la información proporcionada.
