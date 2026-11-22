# mdcreativeagent/Spark-X2.6-4B

## Resumen

Spark-X2.6-4B es un modelo de lenguaje compacto de propósito general desarrollado por el equipo de XHToken (publicado en Hugging Face bajo la cuenta `mdcreativeagent`), orientado específicamente al despliegue en dispositivos ("on-device") y a flujos de trabajo agénticos. Se trata de la evolución del Spark-X2.5-4B y mantiene exactamente la misma arquitectura que su predecesor, obteniendo sus mejoras de capacidad exclusivamente mediante un post-entrenamiento más refinado. Con 4.112.079.360 parámetros y un repositorio de 8,2 GB en formato safetensors, se posiciona en la franja de modelos de ~4B que compiten directamente con alternativas como Qwen3.5-4B o Gemma-E4B.

El modelo está diseñado para tareas del mundo real que requieren razonamiento multi-paso, uso de herramientas y planificación: codificación, agentes, contexto largo, multilingüismo y matemáticas. Su rasgo diferencial es el "presupuesto de pensamiento" (thinking budget) configurable en tres niveles —none, low, high—, que permite a las aplicaciones ajustar dinámicamente el equilibrio entre calidad de razonamiento, latencia y coste de inferencia. Según el autor, alcanza rendimiento de referencia entre modelos de tamaño similar e iguala o supera a modelos de ~9B parámetros en varios benchmarks.

La relevancia actual del modelo reside en su enfoque hacia la inferencia en el borde (edge inference): el autor afirma una eficiencia de inferencia equiparable o superior a modelos on-device comparables, lo que lo convierte en candidato para aplicaciones locales con recursos limitados. La licencia Apache 2.0 facilita su adopción comercial, aunque la información pública disponible sobre detalles de entrenamiento y resultados numéricos de benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (misma arquitectura que Spark-X2.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de generación usa `max_new_tokens=131072` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con la misma estructura que Spark-X2.5-4B, según declara el autor; no se especifican en la información disponible detalles como el número de capas, la dimensión oculta, el tipo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documenta si se trata de un modelo denso o de mezcla de expertos (MoE); el recuento de parámetros totales y la ausencia de mención a parámetros activos sugieren un modelo denso, pero no puede confirmarse.

Las mejoras de Spark-X2.6-4B respecto a su predecesor provienen íntegramente del post-entrenamiento, no de cambios arquitectónicos. El autor menciona mejoras sustanciales en codificación, comportamiento agéntico, contexto largo, multilingüismo y razonamiento, pero no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF, DPO o aprendizaje por refuerzo con verificación. El modelo base es `XHToken/Spark-X2.6-4B-Base`. La innovación técnica destacable es el presupuesto de pensamiento configurable en tres niveles (none, low, high), que permite controlar la profundidad de razonamiento en tiempo de inferencia.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con presupuesto de pensamiento configurable: tres niveles (none, low, high) que ajustan la profundidad de razonamiento y la longitud de salida.
- Codificación: el autor reporta mejoras sustanciales en tareas de ingeniería de software.
- Comportamiento agéntico: uso complejo de herramientas, planificación multi-paso y flujos de trabajo agénticos.
- Contexto largo: el ejemplo oficial emplea `max_new_tokens=131072`, lo que sugiere soporte para generaciones de hasta 128K tokens.
- Capacidades matemáticas y de conocimiento general, evaluadas en los benchmarks del autor.
- Multilingüismo limitado a inglés y chino según los metadatos del modelo.
- Compatibilidad con `transformers` (requiere `trust_remote_code=True` y versión 4.57.1) y con SGLang para servir una API compatible con OpenAI.
- Soporte de plantilla de chat mediante `apply_chat_template` con el parámetro `enable_thinking`.

## Casos de uso

- Agentes autónomos en dispositivos: el modelo puede ejecutar bucles de planificación y uso de herramientas en local gracias a su tamaño de ~4B y a su eficiencia de inferencia orientada a edge, sin depender de APIs en la nube.
- Asistentes de codificación integrados en IDE: con mejoras declaradas en ingeniería de software y soporte de contexto largo, puede mantener conversaciones multi-archivo y sugerir refactorizaciones dentro del editor.
- Automatización de atención al cliente multi-turno: la ventana de contexto extendida (hasta 128K tokens en generación según el ejemplo oficial) permite gestionar historiales de conversación largos y documentación de referencia.
- Procesamiento de documentos largos en chino e inglés: resumen, extracción de entidades y respuesta a preguntas sobre contratos o informes extensos, aprovechando el soporte bilingüe.
- Razonamiento matemático con control de coste: en aplicaciones donde la latencia importa, el nivel de pensamiento "low" reduce la longitud de salida un 22,0 % a cambio de 1,7 puntos de media según el autor, útil para cálculo asistido en tiempo real.
- Despliegue en hardware de borde con NPU Ascend: el autor proporciona imágenes de SGLang para GPUs NVIDIA y NPUs Ascend (A2 y A3), lo que facilita su integración en infraestructura no-x86/NVIDIA.
- Prototipado rápido de pipelines agénticos: la compatibilidad con SGLang y una API compatible con OpenAI permiten sustituir modelos mayores en fases de desarrollo sin reescribir la capa de orquestación.

## Benchmarks y rendimiento

El autor publica gráficas de benchmarks (agente, código, matemáticas, conocimiento general y contexto largo) en la model card, pero no se incluyen los valores numéricos en la información disponible. Las afirmaciones cualitativas del autor son las siguientes:

- Rendimiento de referencia ("best-in-class") entre modelos de tamaño comparable.
- Iguala o supera a modelos de ~9B parámetros en varios benchmarks.
- Eficiencia de inferencia equiparable o superior a Qwen3.5-4B y Gemma-E4B.
- Comparativa de esfuerzo de razonamiento: al pasar de "high" a "low", la puntuación media de Spark-X2.6-4B cae 1,7 puntos mientras la longitud media de salida se reduce un 22,0 % (para la variante Spark-X2.6-1.7B, la caída es de 4,0 puntos y la reducción del 37,3 %).

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~4,1B parámetros, en FP16 se requieren aproximadamente 8,2 GB solo para pesos; en cuantizaciones de 8 bits o 4 bits el requisito se reduce considerablemente, aunque el autor no documenta formatos de cuantización soportados.
- GPU recomendadas: no especificadas por el autor. El ejemplo de SGLang se distribuye para GPUs NVIDIA (imagen `lmsysorg/sglang:nightly-dev-cu13-...`) y para NPUs Ascend A2 y A3.
- Cabe en GPU de consumo: probable en GPUs con 8-12 GB de VRAM en cuantización, pero no confirmado por el autor.
- Opciones de despliegue: `transformers` (versión 4.57.1, con `trust_remote_code=True`), SGLang (imagen oficial para NVIDIA y Ascend) con API compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma eficiencia de inferencia equiparable o superior a Qwen3.5-4B y Gemma-E4B, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B | 4,11B | no disponible (generación de hasta 128K en el ejemplo) | Apache 2.0 | Enfoque on-device y agéntico; thinking budget configurable |
| Qwen3.5-4B | ~4B | no disponible | no disponible en esta ficha | Referencia de eficiencia citada por el autor |
| Gemma-E4B | ~4B (variante E) | no disponible | no disponible en esta ficha | Referencia de eficiencia citada por el autor |
| Spark-X2.5-4B | ~4B | no disponible | no disponible en esta ficha | Predecesor directo con la misma arquitectura |

El autor afirma que Spark-X2.6-4B iguala o supera a modelos de ~9B parámetros en varios benchmarks, pero no se dispone de los valores numéricos para verificar la comparación. Los datos de contexto, licencia y rendimiento de Qwen3.5-4B y Gemma-E4B no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Alucinación: no se han publicado métricas de fiabilidad ni de tasa de alucinación; como todo modelo generativo, requiere verificación en producción.
- Contexto: la longitud máxima de contexto no se especifica de forma explícita; el ejemplo oficial usa `max_new_tokens=131072`, pero esto se refiere a tokens generados, no necesariamente a la ventana de entrada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de desplegarlo.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-22), lo que indica una publicación muy reciente y sin validación comunitaria.
- Autoría: el modelo se publica bajo la cuenta `mdcreativeagent`, mientras que la model card y el modelo base hacen referencia a `XHToken`; conviene verificar la procedencia oficial antes de adoptarlo en producción.
- Benchmarks: las gráficas de la model card no incluyen valores numéricos en la información disponible, por lo que las afirmaciones de rendimiento no son verificables de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Spark-X2.6-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
