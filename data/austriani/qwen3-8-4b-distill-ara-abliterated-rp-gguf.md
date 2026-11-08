# Austriani/Qwen3.8-4B-Distill-ARA-Abliterated-RP-GGUF

## Resumen

Qwen3.8-4B-Distill-ARA-Abliterated-RP-GGUF es una cuantización en formato GGUF de un modelo derivado de la familia Qwen3.8, publicada por el usuario Austriani en Hugging Face. El modelo base es Austriani/Qwen3.8-4B-Distill-ARA-Abliterated, que a su vez parte de un modelo destilado de 4B parámetros entrenado sobre las trazas de razonamiento de un modelo profesor de gran escala (Qwen3.8-2.4T, según la documentación del proyecto de destilación asociado). La variante ARA (Arbitrary Rank Ablation) y la etiqueta "abliterated" indican que se ha aplicado una técnica de ablación de direcciones de activación para eliminar el comportamiento de rechazo, orientando el modelo a roleplay y escritura creativa sin restricciones.

El propósito declarado es ofrecer una base lista para llama.cpp con cuantizaciones de referencia, pensada para generación de texto conversacional y creativo en inglés. La licencia es Apache 2.0 y el pipeline es text-generation. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 8 de noviembre de 2026.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de la práctica de "abliteration" aplicada a un modelo destilado pequeño; por otro, sirve de advertencia sobre las implicaciones de seguridad y licencia de distribuir variantes sin rechazo. La información técnica disponible en la model card es escasa y en gran parte presentacional (HTML/CSS), por lo que muchos parámetros se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8; detalles no disponibles) |
| Parametros totales | 4B (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el autor menciona "baseline GGUF quantizations"; no se listan los niveles Q4_K_M, Q5_K_M, etc. en la información disponible) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (librería llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer decoder-only de 4B parámetros, derivado de la familia Qwen3.8. El modelo base es un destilado: según el repositorio de referencia del proyecto de destilación, los modelos "student" de 2B, 4B y 9B se entrenan directamente sobre las trazas de razonamiento paso a paso (chain of thought) generadas por un modelo profesor de gran escala denominado Qwen3.8-2.4T. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

Sobre el modelo base de esta ficha se ha aplicado una técnica de "arbitrary rank ablation" (ARA), etiquetada también como "heretic" y "abliterated". Este tipo de intervención modifica las direcciones de activación asociadas al comportamiento de rechazo para eliminarlo, sin reentrenar los pesos completos. El resultado es un modelo "uncensored" orientado a roleplay y escritura creativa. No se documentan en la información disponible innovaciones como decodificación especulativa, atención lineal ni modos de pensamiento explícitos.

## Capacidades

- Generación de texto conversacional en inglés, con énfasis declarado en roleplay y escritura creativa.
- Razonamiento derivado de destilación: el modelo base se entrenó sobre trazas de chain of thought de un profesor de mayor escala, lo que puede favorecer respuestas multi-paso.
- Comportamiento sin rechazo ("refusal-removed"): no aplica filtros de seguridad aprendidos para declinar peticiones.
- Formato GGUF compatible con llama.cpp y ecosistema asociado (Ollama, LM Studio, etc., siempre que acepten el archivo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la etiqueta `language: en`.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Roleplay conversacional: el modelo está etiquetado explícitamente para roleplay y escritura creativa, y la ablación elimina los rechazos que interrumpen narrativas de ficción con contenido sensible. Adecuado para prototipos de personajes y chatbots de ficción.
- Escritura creativa sin restricciones: útil para generar borradores de narrativa adulta, terror o diálogos con violencia, donde modelos alineados suelen declinar. Requiere revisión humana y control de audiencia.
- Investigación sobre abliteration: sirve como caso de estudio para medir el impacto de la ablación de rechazo en la calidad del lenguaje, la coherencia y la tasa de respuestas dañinas en un modelo de 4B.
- Inferencia local en hardware de consumo: al ser un GGUF de 4B, es desplegable en GPUs consumer y en CPU, lo que lo hace útil para pruebas offline y entornos sin conectividad.
- Generación de diálogos para videojuegos y prototipos narrativos: integrable en motores que consuman una API local compatible con llama.cpp, para NPCs con personalidad definida.
- Evaluación comparativa de cuantizaciones: el autor lo publica como "baseline GGUF quantizations", por lo que puede usarse para comparar perplejidad y velocidad entre niveles de cuantización sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 4B en GGUF, las cuantizaciones de 4 bits suelen ocupar del orden de 2,5-3 GB y las de 8 bits del orden de 4,5-5 GB, pero el autor no publica cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 4B en GGUF es viable en GPUs consumer con 6-8 GB de VRAM o más.
- ¿Cabe en GPU consumer? Sí, previsiblemente en la mayoría de GPUs con 8 GB o más, dado el tamaño del modelo; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (librería declarada), y por compatibilidad de formato, herramientas que acepten GGUF como Ollama o LM Studio. vLLM y TGI no se mencionan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Austriani/Qwen3.8-4B-Distill-ARA-Abliterated-RP-GGUF | 4B | no disponible | Apache 2.0 | GGUF | Variante abliterated para roleplay; 0 descargas |
| Austriani/Qwen3.8-4B-Distill-ARA-Abliterated | 4B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base del GGUF |
| Qwen3.8 4B Distill (GGUF, referencia local-ai-zone) | 4B | no disponible | no disponible | GGUF | 8,40 GB, 579.355 descargas, 200 likes según el índice citado |
| Qwen3.8 2B / 9B Distill (proyecto RayCodes) | 2B / 9B | no disponible | no disponible | no disponible | Variantes del mismo pipeline de destilación |

La comparación con modelos de otras familias (Llama, Mistral, Gemma) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": se ha eliminado deliberadamente el comportamiento de rechazo. Puede generar contenido dañino, ilegal o sexualmente explícito sin filtros. No apto para despliegues públicos sin moderación adicional.
- Riesgo de alucinación: no hay datos publicados de evaluación; un modelo de 4B destilado tiene mayor propensión a errores factuales que modelos mayores.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: no se documenta la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base original de Qwen3.8 y las implicaciones de distribuir una variante abliterated deben verificarse por separado; la información disponible no las detalla.
- Trazabilidad: 0 descargas y 0 likes, sin benchmarks ni evaluación de seguridad publicada. El autor es un particular, no un laboratorio con proceso de revisión.
- La model card contiene principalmente HTML/CSS presentacional; la documentación técnica sustantiva es mínima.
- Posible degradación de capacidades: la ablación de rechazo puede afectar a la coherencia y al razonamiento en tareas no creativas; no hay mediciones que lo confirmen o descarten.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Austriani/Qwen3.8-4B-Distill-ARA-Abliterated-RP-GGUF
- Modelo base: https://huggingface.co/Austriani/Qwen3.8-4B-Distill-ARA-Abliterated
- Índice de modelos GGUF (referencia de Qwen3.8 4B Distill): https://local-ai-zone.github.io/models/qwen3-8-4b-distill.html
- Repositorio del proyecto de destilación Qwen3.8 (2B/4B/9B): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
