# mradermacher/Discord-Gemma-4B-V1-Done-GGUF

## Resumen

Discord-Gemma-4B-V1-Done-GGUF es la versión cuantizada en formato GGUF del modelo KatSoEpic/Discord-Gemma-4B-V1-Done, un ajuste fino de la familia Gemma orientado a conversaciones de estilo Discord. El trabajo de cuantización lo firma mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo original tiene 3.880.263.168 parámetros (aproximadamente 3,9 mil millones), lo que lo sitúa en la gama de 4B dentro de la familia Gemma.

El modelo está pensado para generar respuestas conversacionales con un tono propio de comunidades y servidores de Discord, lo que lo diferencia de los ajustes genéricos de instrucciones. Al estar empaquetado en GGUF, puede ejecutarse en CPU o en GPU de consumo mediante llama.cpp, Ollama o interfaces similares, sin necesidad de infraestructura de servidor dedicada. El repositorio incluye además suplementos multimodales (mmproj), lo que sugiere que el modelo base conserva capacidades de visión heredadas de Gemma.

La relevancia de esta ficha radica en que permite evaluar rápidamente un modelo pequeño, especializado y listo para desplegar en local, con licencia Gemma y únicamente en inglés. Es una opción realista para prototipos de chatbots de comunidad, pero conviene tener claras sus limitaciones en cuanto a idioma, licencia y ausencia de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma), con suplemento multimodal mmproj |
| Parametros totales | 3.880.263.168 (aproximadamente 3,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (licencia de uso de Google Gemma) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Gemma, con aproximadamente 3,9 mil millones de parámetros. El ajuste fino fue realizado por KatSoEpic sobre una base Gemma, y la model card del repositorio cuantizado etiqueta el proceso con la herramienta unsloth, lo que indica que el fine-tuning se hizo con ese framework de entrenamiento optimizado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La model card no documenta innovaciones arquitectónicas propias más allá de lo que aporta la familia Gemma. La presencia de ficheros mmproj (multi-modal projection) en el repositorio GGUF indica que el modelo conserva la torre de visión de Gemma y puede procesar imágenes si se carga junto con el proyector correspondiente en llama.cpp. No hay información pública sobre la longitud de contexto efectiva del ajuste ni sobre posibles modificaciones del tokenizador.

## Capacidades

- Generación de texto conversacional en inglés, con un estilo ajustado a interacciones de comunidad y servidores de Discord.
- Procesamiento multimodal de imágenes mediante los ficheros mmproj incluidos (proyección multimodal Q8_0 y f16).
- Conversación multi-turno, según la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su integración en servicios de inferencia.
- No hay evidencia documentada de soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- Capacidades multilingües limitadas al inglés según la metadata del modelo.
- No se documenta modo de razonamiento explícito (thinking mode) ni capacidades de audio.

## Casos de uso

- Chatbot de comunidad en Discord: el modelo puede gestionar conversaciones informales multi-turno en inglés con un tono adaptado al contexto de servidores, y su tamaño de 4B permite desplegarlo en un servidor modesto o incluso en local.
- Moderación asistida y respuestas automáticas: con cuantizaciones Q4_K_M de 2,6 GB, puede ejecutarse en una GPU de consumo y atender respuestas rápidas a mensajes frecuentes sin coste de API.
- Prototipado de asistentes conversacionales: sirve para validar flujos de diálogo y prompts de sistema antes de migrar a modelos mayores, gracias a su bajo coste de inferencia y a la disponibilidad de múltiples cuantizaciones.
- Despliegue en local con Ollama o llama.cpp: al estar en GGUF, se integra directamente en entornos de escritorio y estaciones de trabajo sin GPU dedicada, usando cuantizaciones Q4 o Q5.
- Experimentación con modelos multimodales pequeños: los ficheros mmproj permiten probar entrada de imágenes en un modelo de 4B, útil para demos de captioning o preguntas sobre imágenes en inglés.
- Investigación sobre ajuste fino de la familia Gemma: el modelo sirve como caso de estudio de un fine-tuning comunitario con unsloth y su posterior cuantización, útil para reproducir pipelines de publicación.
- Generación de respuestas en entornos de bajo recursos: con la cuantización Q2_K (1,8 GB) puede ejecutarse en hardware muy limitado, aunque con pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M (2,6 GB de pesos más overhead de contexto); alrededor de 4,5-5 GB con Q8_0 (4,2 GB); unos 8-9 GB con f16 (7,9 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para despliegues con mayor concurrencia. Cualquier GPU con 6 GB o más puede ejecutar las cuantizaciones Q4 y Q5.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores; las cuantizaciones Q2 y Q3 caben incluso en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Discord-Gemma-4B-V1-Done-GGUF | 3,9B | no disponible | gemma | GGUF | Ajuste conversacional para Discord, solo inglés |
| Gemma 2B / Gemma 7B (originales) | 2B / 7B | no disponible | gemma | safetensors, GGUF | Modelos base de Google; el 2B es más ligero y el 7B más capaz, pero sin ajuste conversacional específico |
| Llama 3.2 3B Instruct | 3,2B | 128K (según documentación de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa multilingüe con soporte de tool calling e instrucciones |
| Phi-3.5-mini-instruct | 3,8B | 128K (según documentación de Microsoft) | MIT | safetensors, GGUF | Tamaño comparable, licencia permisiva y mejor documentación de benchmarks |

La comparativa se basa en características públicas de los modelos citados; no se dispone de benchmarks del modelo Discord-Gemma para comparar rendimiento real.

## Limitaciones y advertencias

- Solo soporta inglés según la metadata del modelo; no es adecuado para producción en castellano u otros idiomas.
- No hay benchmarks publicados, por lo que se desconoce su calidad real frente a modelos de tamaño similar.
- El ajuste fino está orientado a conversaciones de Discord, lo que puede producir respuestas con un tono inadecuado en contextos profesionales o formales.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en tareas de conocimiento factual y matemáticas.
- La licencia Gemma impone condiciones de uso comercial y requiere aceptar los términos de Google; conviene revisarlos antes de desplegar en producción.
- El acceso al modelo en Hugging Face está condicionado a la aceptación de la licencia (gated model).
- La longitud de contexto no está documentada, lo que dificulta planificar conversaciones largas o procesamiento de documentos extensos.
- No se documenta soporte de tool calling ni de agentes, por lo que no es recomendable para pipelines que requieran invocación de funciones.
- El repositorio ocupa 37,3 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Discord-Gemma-4B-V1-Done-GGUF
- Modelo base: https://huggingface.co/KatSoEpic/Discord-Gemma-4B-V1-Done
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Discord-Gemma-4B-V1-Done-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Discord-Gemma-4B-V1-Done-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
