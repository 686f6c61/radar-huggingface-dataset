# Automate-with-Sanjay/Liar-1-GGUF

## Resumen

Liar-1 es un ajuste fino del modelo meta-llama/Llama-3.2-1B-Instruct desarrollado por Automate-with-Sanjay, orientado a encarnar un personaje de comedia absurda. El modelo responde a preguntas cotidianas con explicaciones deliberadamente ficticias y satíricas, pero incorpora un comportamiento de "anclaje epistémico": cuando el usuario cuestiona la veracidad de la respuesta, rompe el personaje y aclara que la afirmación era inventada por diversión. Se distribuye en formato GGUF con cuantización Q4_K_M, lo que facilita su ejecución local en hardware modesto.

El ajuste se realizó con QLoRA de 4 bits mediante Unsloth y el SFTTrainer de Hugging Face TRL, entrenando 11.272.192 parámetros (aproximadamente el 0,90 % de los 1.235.814.432 parámetros totales del modelo base). La longitud de contexto declarada es de solo 768 tokens, muy inferior a la del Llama-3.2-1B-Instruct original, lo que limita su uso en conversaciones largas o tareas con mucho contexto.

Su relevancia es acotada: no compite en capacidades generales con modelos instructivos, sino que sirve como ejemplo práctico de ajuste de personalidad con QLoRA sobre un modelo pequeño, y como herramienta para experimentar con dinámicas conversacionales de doble comportamiento (humor por defecto y aclaración bajo demanda). Está pensado exclusivamente para inglés y su licencia es la Llama 3.2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino con QLoRA |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (4 bits); base entrenada en NF4 con adaptador LoRA en 16 bits |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (Q4_K_M); repo de 0,8 GB |
| Parametros entrenados | 11.272.192 (~0,90 % del total) |
| Configuracion LoRA | r = 16, alpha = 16, dropout = 0 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Metodo de entrenamiento | 4-bit QLoRA con Unsloth + TRL SFTTrainer |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 de 1B parámetros, un transformer decoder-only con atención estándar (no se documentan innovaciones de atención en la información disponible). Sobre esa base se aplicó un ajuste fino supervisado con QLoRA de 4 bits (cuantización NF4 del modelo base) y adaptadores LoRA de rango 16 aplicados a todas las capas lineales de atención y feed-forward. El adaptador se fusionó en precisión de 16 bits y se exportó a GGUF Q4_K_M. El entrenamiento se realizó con Unsloth y el SFTTrainer de TRL.

La estrategia de datos se basó en 130 temas con una división group-aware por `group_id`, para evitar que prompts y sus correspondientes desafíos de verificación se filtraran entre los conjuntos de entrenamiento y evaluación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el ajuste descrito es de tipo SFT. La innovación principal no es arquitectónica sino de comportamiento: el par de respuestas "ficción absurda por defecto" y "aclaración veraz ante cuestionamiento" está aprendido como patrón conversacional.

## Capacidades

- Generación de texto conversacional en inglés con un estilo de comedia absurda y satírica.
- Producción de respuestas deliberadamente ficticias a preguntas cotidianas, presentadas como broma.
- Anclaje epistémico: ante preguntas de verificación del tipo "¿esto es verdad?", abandona el personaje y aclara que la respuesta era inventada.
- Conversación multi-turno de corta duración, limitada por una ventana de 768 tokens.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.
- No se documentan capacidades destacadas de código, matemáticas o razonamiento formal más allá de las heredadas del modelo base de 1B.

## Casos de uso

- Demostración educativa de ajuste de personalidad con QLoRA: sirve para ilustrar en talleres o cursos cómo un adaptador de ~11 millones de parámetros modifica el comportamiento conversacional de un modelo de 1B sin reentrenar la base.
- Prototipado de personajes de entretenimiento: el modelo puede integrarse en un chatbot de bromas o en una demo interactiva donde las respuestas absurdas son el objetivo, con la salvaguarda de aclaración ante preguntas de veracidad.
- Pruebas de robustez de anclaje epistémico: útil para investigar si un modelo pequeño mantiene la distinción entre ficción declarada y afirmación factual cuando el usuario insiste o reformula la pregunta.
- Experimentación con despliegue local en hardware de gama baja: al ocupar ~808 MB en Q4_K_M, cabe en equipos sin GPU dedicada y permite probar pipelines de Ollama, llama.cpp o LM Studio con coste mínimo.
- Generación de contenido satírico de formato corto: respuestas de una o dos frases para guiones de comedia, publicaciones o ejemplos de humor absurdo, siempre con revisión humana por el riesgo de confundir ficción y hecho.
- Evaluación comparativa de métodos de cuantización: el mismo modelo en GGUF Q4_K_M permite medir degradación de calidad frente al adaptador en 16 bits en tareas de estilo y coherencia conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB o menos con la cuantización Q4_K_M de ~808 MB, más el overhead de la ventana de contexto de 768 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas integradas o de gama baja como GTX 1650, RTX 3050 o superiores; también en Apple Silicon y en CPU pura.
- Opciones de despliegue: Ollama (`ollama run hf.co/Automate-with-Sanjay/Liar-1-GGUF`), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Parámetros de inferencia recomendados por el autor: temperature 0.8, top_p 0.9, max_new_tokens 120.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Liar-1 (este modelo) | 1,24 B | 768 tokens | GGUF Q4_K_M | Llama 3.2 Community | Personaje de comedia absurda con anclaje epistémico |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128 K tokens (según el modelo base original) | safetensors, GGUF | Llama 3.2 Community | Asistente instructivo generalista |
| Llama-3.2-3B-Instruct | 3,2 B | 128 K tokens (según el modelo base original) | safetensors, GGUF | Llama 3.2 Community | Asistente instructivo generalista de mayor tamaño |

La comparación con el modelo base es la más relevante: Liar-1 sacrifica la ventana de contexto original (768 tokens frente a la del Llama-3.2-1B-Instruct) y las capacidades generalistas a cambio de un comportamiento de personaje muy específico. Frente a modelos de 3B de la misma familia, ofrece menor calidad de razonamiento pero un coste de despliegue mucho menor y una personalidad diferenciada. No se dispone de datos de benchmarks para comparar rendimiento numérico con estas alternativas.

## Limitaciones y advertencias

- Riesgo de alucinación deliberada por diseño: el modelo genera afirmaciones falsas como parte de su personaje; solo aclara la ficción si el usuario la cuestiona explícitamente, lo que puede inducir a error en usuarios que no lo hagan.
- Contexto muy reducido (768 tokens): las conversaciones largas pierden coherencia y el historial se trunca antes que en el modelo base.
- Solo inglés: no se documenta soporte de castellano ni de otros idiomas.
- Modelo de 1B parámetros: capacidad limitada de razonamiento, matemáticas y código; no apto para tareas que requieran precisión factual.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar de Llama 3.2, puede heredar sesgos del corpus de entrenamiento original.
- Licencia Llama 3.2 Community License: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- No recomendado para atención al cliente, información factual ni ningún contexto donde una respuesta inventada pueda causar daño; el propio autor lo define como entretenimiento.
- El enlace al repositorio completo del proyecto en GitHub aparece incompleto en la model card, por lo que no puede verificarse.
- Advertencia de producción: si se integra en un producto, debe añadirse una capa externa de verificación o un aviso claro al usuario de que las respuestas son ficticias.

## Enlaces

- Hugging Face: https://huggingface.co/Automate-with-Sanjay/Liar-1-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Ollama: https://ollama.com
- Unsloth: no disponible en la información proporcionada
- TRL (SFTTrainer): no disponible en la información proporcionada
- Repositorio GitHub del proyecto (Liar1_FT): enlace incompleto en la model card, no verificable
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
