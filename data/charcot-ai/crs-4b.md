# charcot-ai/crs-4b

## Resumen

CRS-4B es un modelo de lenguaje multimodal especializado en uso de herramientas clínicas dentro de un entorno de historia clínica electrónica (EHR) sintética. Lo desarrolla Charcot AI como modelo de referencia de su plataforma de evaluación, y se obtiene mediante fine-tuning supervisado de Qwen/Qwen3.5-4B sobre episodios públicos del dataset sintético Charcot Gym. El resultado es un modelo que lee contexto clínico, invoca herramientas y escribe registros estructurados en formato FHIR, con codificación clínica y gestión de reclamaciones (claims).

El interés del modelo no reside en su tamaño, sino en su especialización: el autor reporta una puntuación media de tarea de 0,86 frente a 0,16 del modelo base Qwen3.5-4B en 99 tareas privadas, con tres intentos por tarea, dentro del rango de 0,76–0,89 que obtienen modelos frontera en las mismas tareas. Es, por tanto, un caso de estudio de cómo un modelo de 4.660 millones de parámetros puede igualar a modelos mucho mayores en un dominio estrecho y verificado de forma determinista, sin juez LLM.

La relevancia actual es doble: por un lado, demuestra la viabilidad de agentes clínicos pequeños y desplegables en local para tareas de documentación estructurada; por otro, introduce un protocolo de evaluación con verificador offline determinista que comprueba identidad del paciente y preservación de recursos existentes. La información pública disponible es limitada: no se detallan la licencia, los idiomas soportados ni los datos de entrenamiento más allá de su procedencia sintética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3.5-4B (fine-tune) |
| Pipeline | image-text-to-text |
| Tamano del repo | 9,5 GB |
| Dataset de entrenamiento | charcot-ai/gym (episodios sintéticos públicos) |

## Arquitectura y entrenamiento

CRS-4B parte de Qwen3.5-4B, un transformer multimodal de 4,66 mil millones de parámetros que procesa entradas de imagen y texto. El autor no publica detalles sobre la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención, tokenizador) ni sobre modificaciones estructurales durante el fine-tuning, por lo que esos datos deben consultarse en la model card de Qwen3.5-4B. La única adaptación documentada es el ajuste fino supervisado sobre episodios del entorno Charcot Gym.

El entrenamiento se realizó exclusivamente sobre episodios sintéticos públicos del dataset Charcot Gym. No se menciona el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF, DPO u optimización por preferencias. La evaluación se hizo sobre un split privado retenido de 99 tareas, con tres intentos por tarea, y un verificador offline determinista que comprueba el estado final del registro clínico y las restricciones de la tarea, incluyendo la identidad del paciente y la preservación de recursos FHIR preexistentes. No se emplea un juez LLM en la puntuación, lo que reduce la variabilidad y el sesgo de evaluación, aunque limita la evaluación a tareas formalizables como comprobaciones de estado.

## Capacidades

- Generación de texto y razonamiento clínico sobre contexto estructurado y no estructurado.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), útil para documentos clínicos escaneados.
- Uso de herramientas (tool calling / function calling) dentro de un entorno de agentes.
- Razonamiento multi-paso orientado a completar tareas de varios turnos.
- Conversión de documentos clínicos a recursos FHIR (Document → FHIR).
- Codificación clínica (asignación de códigos a diagnósticos y procedimientos).
- Gestión de reclamaciones (claims) dentro del flujo administrativo simulado.
- Escritura de registros estructurados verificables por un validador determinista.
- Capacidades multilingües: no disponibles en la información publicada.

## Casos de uso

- Documentación clínica automatizada: el modelo recibe notas o documentos clínicos y genera recursos FHIR estructurados, lo que permite integrar la salida directamente en un servidor FHIR de pruebas sin post-procesado manual.
- Codificación clínica asistida: a partir de la descripción de un episodio, el modelo asigna códigos de diagnóstico y procedimiento, una tarea repetitiva y propensa a errores que se beneficia de un agente entrenado en el dominio.
- Gestión de reclamaciones: el modelo puede recorrer el flujo de claims dentro del entorno Gym, consultando recursos existentes y generando las entradas administrativas correspondientes.
- Investigación en agentes clínicos: sirve como referencia reproducible para comparar estrategias de prompting, tool calling y planificación multi-paso en tareas verificables.
- Evaluación de pipelines de IA sanitaria: al tener un verificador determinista y un split privado, es útil para montar pruebas de regresión de agentes antes de desplegarlos en entornos reales.
- Prototipado de asistentes sobre EHR sintética: permite desarrollar y depurar integraciones (APIs FHIR, orquestadores de herramientas) sin exponer datos de pacientes reales.
- Docencia y formación técnica: ejemplo práctico de fine-tuning de un modelo de 4,66 B para un dominio estrecho con métricas objetivas de tarea.

## Benchmarks y rendimiento

| Modelo | Puntuación media de tarea |
|---|---|
| Qwen3.5-4B (base) | 0,16 |
| CRS-4B (fine-tuned) | 0,86 |
| Modelos frontera (rango en las mismas tareas) | 0,76–0,89 |

Evaluación sobre 99 tareas privadas, tres intentos por tarea, noviembre de 2026. El autor advierte que estas puntuaciones describen el rendimiento en las tareas evaluadas y no establecen una clasificación general fuera de esa evaluación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12–16 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5–3 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para despliegue en FP16 con contexto amplio; RTX 4090 (24 GB) suficiente para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8–12 GB si se cuantiza, siempre que se generen los pesos cuantizados.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CRS-4B | 4,66 B | no disponible | Tool use clínico, FHIR, claims | no disponible | HuggingFace (charcot-ai/crs-4b) |
| Qwen3.5-4B | ~4 B | no disponible | Modelo general multimodal | no disponible | HuggingFace (Qwen) |
| Modelos frontera evaluados | no disponible | no disponible | Generalistas | variable | APIs comerciales |

La comparación relevante es con su propio modelo base: CRS-4B pasa de 0,16 a 0,86 en la misma evaluación, lo que cuantifica la ganancia del fine-tuning de dominio. Frente a modelos frontera, el rango reportado (0,76–0,89) sitúa a CRS-4B en la parte alta, pero el autor no identifica qué modelos concretos componen ese rango ni sus parámetros. No se dispone de comparativas con otros modelos clínicos especializados en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que el resultado mide finalización de tareas sintéticas, no rendimiento en atención al paciente; no debe usarse como sistema de decisión clínica.
- Entrenado solo con datos sintéticos: el dominio cubierto es el del entorno Charcot Gym y puede no transferir a EHR reales con vocabularios, codificaciones o flujos distintos.
- Evaluación limitada a 99 tareas privadas; el tamaño reducido del conjunto implica alta incertidumbre en la estimación.
- No se publican datos sobre sesgos demográficos, de idioma o culturales; el modelo podría heredar sesgos de Qwen3.5-4B.
- Riesgo de alucinación en la generación de códigos clínicos y recursos FHIR; el verificador determinista mitiga el problema en evaluación, pero no en producción.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; es un bloqueo para cualquier despliegue productivo.
- Idiomas soportados no documentados; no hay garantía de calidad en castellano.
- Longitud de contexto no publicada, lo que impide planificar despliegues con historiales clínicos largos.
- Sin variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que complica el despliegue en hardware de consumo.
- Repositorio con muy pocas descargas (6) y ningún like en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/charcot-ai/crs-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset Charcot Gym: https://huggingface.co/datasets/charcot-ai/gym
- Repositorio Gym en GitHub: https://github.com/Charcot-AI/gym
- Web de Charcot AI: https://charcot.ai
- Metodología de evaluación: https://charcot.ai/methodology
- Contacto: solano@charcot.ai
