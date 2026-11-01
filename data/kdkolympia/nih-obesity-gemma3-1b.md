# kdkolympia/nih-obesity-gemma3-1b

## Resumen

`kdkolympia/nih-obesity-gemma3-1b` es un ajuste fino (fine-tuning) del modelo `google/gemma-3-1b-it` de Google, publicado por el usuario kdkolympia bajo el paraguas de un proyecto denominado ValamAI. El modelo se presenta como una demostración de asistente conversacional especializado en gestión del peso, entrenado para responder exclusivamente a partir de fragmentos de páginas del NIDDK (National Institute of Diabetes and Digestive and Kidney Diseases, NIH), citar la sección de la página de la que extrae la respuesta y devolver una frase de abstención explícita cuando los pasajes proporcionados no contienen la información solicitada.

Técnicamente se trata de un modelo de 268 millones de parámetros (según los pesos en safetensors del repositorio), derivado de la variante instructiva de 1B de la familia Gemma 3, ajustado mediante QLoRA y distribuido en formato GGUF con cuantización Q4_K_M. El repositorio ocupa 1,1 GB e incluye la etiqueta `on-device`, lo que indica que el objetivo es la inferencia local en hardware modesto. La arquitectura subyacente, el contexto y los idiomas no se detallan en la información disponible.

Su relevancia es acotada y de naturaleza demostrativa: ilustra un patrón de diseño RAG (retrieval-augmented generation) con abstención controlada y adaptación de estilo por persona, aplicado a un dominio sanitario sensible. El autor declara explícitamente que es una demo y que no constituye consejo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-3-1b-it, familia Gemma 3) |
| Parametros totales | 268.098.176 (pesos en safetensors del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada); el modelo base admite otras, no documentadas aqui |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | GGUF (repo de 1,1 GB); pesos base en safetensors |

## Arquitectura y entrenamiento

No se dispone de la arquitectura detallada en la información proporcionada. El modelo es un ajuste fino de `google/gemma-3-1b-it`, por lo que hereda la arquitectura del transformer decoder-only de la familia Gemma 3 en su variante de 1B; sin embargo, la model card no especifica número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa.

El entrenamiento descrito es un QLoRA sobre el modelo instructivo base, orientado a una tarea muy concreta: responder preguntas sobre gestión del peso usando únicamente pasajes suministrados de páginas del NIDDK, citar la sección correspondiente y abstenerse con la frase literal "Not found in the provided web pages." cuando la respuesta no está en el contexto. Además, el modelo se entrena para adaptar el estilo de respuesta a tres personas distintas. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La cuantización publicada es Q4_K_M en formato GGUF.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo instructivo base.
- Respuesta fundamentada en contexto (grounded generation): responde solo a partir de los pasajes que se le proporcionan.
- Citación de la sección de la página de origen de la que extrae cada respuesta.
- Abstención controlada: devuelve "Not found in the provided web pages." ante ausencia de información en el contexto.
- Adaptación de estilo a tres personas de usuario distintas (definidas por el autor, no detalladas en la información disponible).
- Orientado a despliegue on-device por su tamaño reducido y su formato GGUF Q4_K_M.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente RAG de consulta documental sanitaria: el modelo recibe pasajes recuperados de páginas del NIDDK y genera respuestas citando la sección, lo que permite construir un buscador conversacional sobre un corpus cerrado y verificable.
- Demostración de abstención en dominios sensibles: sirve como ejemplo de diseño de sistemas que deben rechazar responder cuando la evidencia recuperada no cubre la pregunta, evitando respuestas inventadas en un área como la salud.
- Prototipado de asistentes con personalización de tono: la adaptación a tres personas permite evaluar cómo un mismo contenido factual se reformula según el perfil del usuario (por ejemplo, registro más técnico frente a más divulgativo).
- Inferencia local en dispositivos modestos: con 268 millones de parámetros y cuantización Q4_K_M, es viable en CPU o GPU de gama baja para pruebas de concepto sin conexión.
- Evaluación de pipelines RAG de extremo a extremo: útil como componente generador barato para medir calidad de recuperación, fidelidad a las fuentes y tasa de abstención antes de escalar a modelos mayores.
- Material docente sobre fine-tuning con QLoRA: el repositorio ilustra el flujo completo desde un modelo instructivo de Google hasta un GGUF cuantizado listo para despliegue.
- Integración en asistentes de bienestar con salvaguardas: puede emplearse como capa de respuesta acotada a contenido validado, siempre con revisión profesional y avisos médicos explícitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q4_K_M ocupa 1,1 GB, por lo que la inferencia requiere del orden de 1 a 2 GB de memoria, dependiendo de la longitud de contexto y del backend.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM es suficiente en la práctica.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: llama.cpp y Ollama son los backends habituales para GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo API. vLLM y TGI no se documentan para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| kdkolympia/nih-obesity-gemma3-1b | 268 M (repo) | no disponible | GGUF Q4_K_M | Gemma Terms of Use | RAG sanitario con abstención y personas |
| google/gemma-3-1b-it | no disponible en esta ficha | no disponible | safetensors y derivados | Gemma Terms of Use | Modelo instructivo generalista |
| Qwen2.5-0.5B-Instruct | no disponible en esta ficha | no disponible | safetensors, GGUF | Apache 2.0 (según el modelo original) | Instructivo generalista pequeño |
| Llama-3.2-1B-Instruct | no disponible en esta ficha | no disponible | safetensors, GGUF | Llama 3.2 Community License | Instructivo generalista pequeño |

La comparación se limita a la categoría (modelos instructivos de tamaño reducido aptos para on-device); no se dispone de datos de rendimiento comparativo para este ajuste fino.

## Limitaciones y advertencias

- Modelo de demostración: el autor declara explícitamente que es una demo y que no constituye consejo médico.
- Dominio muy restringido: está entrenado para responder solo a partir de pasajes del NIDDK; fuera de ese corpus su comportamiento no está garantizado.
- Riesgo de alucinación: aunque se entrena para abstenerse, un modelo de 268 millones de parámetros puede generar citas incorrectas o respuestas no sustentadas; requiere verificación.
- Sin afiliación con el NIH ni con el NIDDK: el contenido de origen no implica respaldo institucional.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe correcto.
- Longitud de contexto no disponible: limita la planificación de pipelines RAG con muchos pasajes.
- Licencia Gemma Terms of Use: impone condiciones específicas de uso, redistribución y restricciones de uso aceptable; es imprescindible revisarlas antes de cualquier uso comercial.
- Sin métricas publicadas: no hay benchmarks que permitan estimar fidelidad, tasa de abstención ni calidad de citación.
- Sesgos: no documentados por el autor; al derivar de un modelo generalista, puede heredar sesgos del corpus original.
- Advertencia sanitaria: cualquier despliegue en un contexto de salud debe incorporar supervisión profesional y avisos claros al usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdkolympia/nih-obesity-gemma3-1b
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- NIDDK (National Institute of Diabetes and Digestive and Kidney Diseases): https://www.niddk.nih.gov/
