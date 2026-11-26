# Polydim-Einsof/einsof2-mistral-7b-whatsapp-mail-gguf

## Resumen

EINSOF-II Mistral 7B WhatsApp/Mail HITL Stiefel (GGUF Q4_K_M) es una cuantización en formato GGUF de un fine-tuning LoRA sobre `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el colectivo Polydim-Einsof bajo licencia Apache 2.0. El modelo parte de la arquitectura transformer densa de Mistral 7B Instruct v0.3 (7.248 millones de parámetros reales) y añade un adaptador entrenado específicamente para tareas conversacionales de atención al cliente en canales de WhatsApp y correo electrónico, con un enfoque declarado de human-in-the-loop (HITL). El autor etiqueta el adaptador como "Stiefel manifold" y "polydim", términos que apuntan a una técnica de adaptación de bajo rango con restricciones geométricas, aunque la model card no detalla el método.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorio tiene cero descargas y cero likes en el momento de la consulta, fue creado y actualizado el mismo día (26 de noviembre de 2026) y la información publicada se limita a la model card mínima que se cita arriba. No hay datos de benchmarks, ni de composición del dataset de entrenamiento, ni de idiomas soportados más allá de los heredados del modelo base. Por tanto, esta ficha describe con rigor lo que se puede verificar y marca como "no disponible" todo lo demás.

El interés práctico está en que, al derivar de Mistral 7B Instruct v0.3, hereda una ventana de contexto de 32.768 tokens, soporte de tool calling nativo y un formato de pesos GGUF Q4_K_M de 4,07 GB que cabe en GPUs de consumo. Es un artefacto para despliegue local vía Ollama o llama.cpp, no un modelo de investigación con resultados publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral 7B), con adaptador LoRA de fine-tuning |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Mistral-7B-Instruct-v0.3; no confirmado en la model card de este repo) |
| Tipos de cuantizacion | Q4_K_M (4,07 GB); el repo contiene únicamente esa variante |
| Idiomas soportados | no disponible (el modelo base soporta principalmente inglés, francés, alemán, español e italiano, pero el autor no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Adaptador de origen | Polydim-Einsof/einsof2-mistral-7b-whatsapp-mail-adapter |
| Tamano del repo | 4,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B Instruct v0.3: un transformer decoder-only denso con atención de ventana deslizante (sliding window attention), RoPE, SwiGLU en las capas feed-forward y GQA (grouped-query attention) con 32 cabezas de consulta y 8 de clave/valor. Sobre esa base, el autor aplica un adaptador LoRA cuyo nombre interno ("Stiefel", "polydim") sugiere una parametrización de bajo rango restringida a una variedad de Stiefel, una técnica de optimización geométrica que ortogonaliza las matrices del adaptador. La model card no incluye el paper, el repositorio de código ni la descripción formal del método, por lo que esta interpretación es una inferencia a partir de las etiquetas y no un dato confirmado.

El entrenamiento se realizó sobre un dataset de conversaciones de WhatsApp y correo electrónico orientado a HITL, según el título del modelo. No se publica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni hiperparámetros del adaptador. El proceso de cuantización sí está documentado parcialmente: Q4_K_M con un tiempo de ejecución declarado de 1023,6 segundos. No hay innovaciones técnicas verificables más allá de la propia cuantización y del método de adaptación geométrica, que no está descrito.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Mistral 7B Instruct v0.3.
- Razonamiento y respuesta a instrucciones en formato chat (el modelo base usa la plantilla `[INST] ... [/INST]`).
- Soporte de tool calling / function calling, heredado de Mistral 7B Instruct v0.3.
- Capacidad de seguir un flujo de human-in-the-loop: el fine-tuning está orientado a conversaciones de atención al cliente con intervención humana, aunque el autor no documenta el comportamiento exacto.
- Especialización declarada en dominios de mensajería (WhatsApp) y correo electrónico.
- Capacidades multilingües: no confirmadas para este fine-tuning; el modelo base soporta varios idiomas europeos, pero el adaptador puede haber reducido esa cobertura.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Atención al cliente en WhatsApp: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32.768 tokens en el modelo base) y derivar a un agente humano cuando la consulta lo requiera, que es precisamente el escenario HITL para el que fue ajustado.
- Clasificación y redacción de respuestas de correo electrónico: generación de borradores de respuesta a partir del hilo de correo, con revisión humana antes del envío, aprovechando la ventana de contexto para incluir el historial completo.
- Enrutamiento de tickets: usar el modelo para etiquetar y priorizar mensajes entrantes según su contenido, integrándolo en un pipeline con tool calling para consultar el CRM.
- Despliegue local en estaciones de trabajo: al ser un GGUF Q4_K_M de 4,07 GB, se puede ejecutar en una GPU de consumo o incluso en CPU con llama.cpp u Ollama, lo que permite procesar datos de clientes sin salir de la infraestructura propia.
- Prototipado rápido de asistentes conversacionales: la licencia Apache 2.0 y el formato GGUF facilitan probar el modelo en un entorno de desarrollo antes de decidir si se adopta.
- Generación de respuestas de soporte con tono controlado: el fine-tuning sobre conversaciones reales de WhatsApp y correo puede producir un registro más adecuado que el modelo base para esos canales, aunque no hay evaluación publicada que lo confirme.
- Fine-tuning adicional: al ser Apache 2.0 y estar basado en Mistral 7B, se puede usar como punto de partida para adaptaciones posteriores con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no contiene informes de evaluación. Cualquier cifra que se atribuya a este modelo sería inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5–5 GB con la cuantización Q4_K_M incluida (4,07 GB de pesos más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutarlo con contexto moderado; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 permiten contextos más largos. Para servicio en producción con concurrencia, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB (con contexto reducido), RTX 4070, RTX 4090 y equivalentes.
- Opciones de despliegue: Ollama (el repo incluye la etiqueta `ollama`), llama.cpp, y servidores compatibles con la API de endpoints (etiqueta `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habría que convertir a safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EINSOF-II Mistral 7B WhatsApp/Mail (este) | 7,25 B | 32.768 (heredado, no confirmado) | Apache 2.0 | GGUF Q4_K_M | Fine-tuning específico para WhatsApp/correo con HITL; sin benchmarks ni descargas |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base; benchmarks públicos amplios; tool calling nativo |
| Meta Llama 3.1 8B Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Contexto mucho mayor; licencia con restricciones de uso |
| Qwen2.5 7B Instruct | 7,62 B | 131.072 | Apache 2.0 | safetensors, GGUF | Multilingüe fuerte, buenos resultados en código y matemáticas |

La comparación honesta es que este modelo no aporta métricas que permitan situarlo frente a las alternativas; su única diferenciación declarada es el fine-tuning de dominio y la técnica de adaptación, ninguno de los cuales está evaluado públicamente.

## Limitaciones y advertencias

- Ausencia total de evaluación: cero benchmarks, cero descargas y cero likes. No hay evidencia pública de que el fine-tuning mejore al modelo base en su dominio objetivo.
- Riesgo de alucinación: inherente a los modelos de 7B, especialmente en tareas de atención al cliente donde puede inventar políticas, plazos o datos de pedidos. El flujo HITL es imprescindible.
- Sesgos: no documentados. El dataset de WhatsApp y correo puede introducir sesgos de registro, idioma y demografía que el autor no declara.
- Idiomas: no confirmados. El adaptador puede haber degradado el multilingüismo del modelo base si el dataset era monolingüe.
- Contexto: los 32.768 tokens son los del modelo base; el autor no confirma que el adaptador los preserve ni que el GGUF esté configurado para esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Mistral 7B también es Apache 2.0, así que no hay restricciones adicionales conocidas. Aun así, conviene verificar que el adaptador no introduzca datos con derechos de terceros (conversaciones reales de clientes), algo que la model card no aclara.
- Madurez: repositorio creado y actualizado el mismo día, sin historial, sin issues y sin comunidad. No es un artefacto listo para producción sin una evaluación propia.
- Formato: solo se distribuye Q4_K_M; no hay safetensors del modelo fusionado, lo que limita el reentrenamiento y el despliegue en motores que no lean GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-mistral-7b-whatsapp-mail-gguf
- Adaptador de origen: https://huggingface.co/Polydim-Einsof/einsof2-mistral-7b-whatsapp-mail-adapter
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
