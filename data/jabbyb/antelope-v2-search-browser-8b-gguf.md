# jabbyb/antelope-v2-search-browser-8b-gguf

## Resumen

Antelope Search & Browser AI v2 (8B) es un ajuste fino del modelo Qwen3-8B desarrollado por JTR Labs para el navegador Antelope: Private AI Browser. El modelo está especializado en tareas de búsqueda web y navegación asistida: planificación de consultas de búsqueda en formato JSON, síntesis de resultados citando múltiples fuentes, resumen de páginas web, extracción de citas literales y llamadas a herramientas del navegador mediante JSON. Su orientación es claramente la ejecución local ("on-device") en aplicaciones compatibles con llama.cpp.

El ajuste se realizó con QLoRA mediante Unsloth sobre los pesos de Qwen3-8B, un transformer denso de 8.190.735.360 parámetros. La distribución disponible es un único archivo GGUF con cuantización Q4_K_M (5,0 GB de repositorio), pensado para equipos con 16 GB de memoria o más, como Macs con Apple Silicon. El contexto declarado en la model card es de 4096 tokens, muy por debajo de la ventana nativa de Qwen3-8B, lo que condiciona su uso en tareas de síntesis de múltiples fuentes.

La relevancia del modelo reside en su enfoque vertical: no es un asistente generalista, sino un componente de un navegador privado que necesita decidir qué buscar, leer páginas, citar con precisión y abstenerse cuando la información no está presente. Incorpora explícitamente resistencia a inyección de prompts, un requisito crítico cuando el modelo procesa contenido web no confiable. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B), ajuste QLoRA con Unsloth |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (declarado en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de aproximadamente 8,19 mil millones de parámetros. Sobre esa base, JTR Labs aplicó un ajuste fino supervisado con QLoRA utilizando la librería Unsloth, que optimiza el entrenamiento de bajo rango en memoria reducida. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

Las capacidades que la model card atribuye al ajuste delimitan su entrenamiento: generación de planes de búsqueda en JSON, síntesis con citas de múltiples fuentes, resumen de páginas, citas exactas, abstención con la etiqueta UNKNOWN cuando la página no contiene la respuesta, resistencia a inyección de prompts y emisión de JSON para llamadas a herramientas del navegador. No se documentan innovaciones de decodificación (decodificación especulativa, atención lineal) ni modificaciones arquitectónicas respecto al modelo base. El contexto de 4096 tokens declarado sugiere que el ajuste se realizó con secuencias cortas, probablemente por las limitaciones de memoria del entrenamiento QLoRA.

## Capacidades

- Planificación de consultas de búsqueda: genera planes en JSON estructurado a partir de la petición del usuario.
- Síntesis de búsqueda multi-fuente con citas: combina información de varias páginas y atribuye cada afirmación a su origen.
- Resumen de páginas web y extracción de citas literales.
- Abstención explícita: responde UNKNOWN cuando la página consultada no contiene la información solicitada.
- Resistencia a inyección de prompts en contenido web no confiable.
- Llamadas a herramientas del navegador mediante JSON (tool calling en formato estructurado).
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Ejecución 100 % local en aplicaciones compatibles con llama.cpp.
- Capacidades heredadas de Qwen3-8B (razonamiento, código, matemáticas, multilingüismo) no verificadas tras el ajuste; no disponible su preservación.

## Casos de uso

- Navegador privado con IA local: el modelo decide qué consultas lanzar, lee los resultados y redacta una respuesta citada sin enviar datos a servidores externos, gracias a su despliegue GGUF en llama.cpp.
- Resumen de artículos y páginas web: dado el contenido de una página, produce un resumen y permite extraer citas exactas para verificación, con abstención cuando el dato no aparece.
- Asistente de investigación con trazabilidad: la síntesis multi-fuente con citas permite construir informes donde cada afirmación es auditable contra la fuente original.
- Defensa frente a contenido malicioso: su entrenamiento en resistencia a inyección de prompts lo hace adecuado para pipelines que ingieren HTML de terceros y deben ignorar instrucciones embebidas en la página.
- Automatización de flujos de navegación: la emisión de JSON de tool calls permite integrarlo en un agente que abre pestañas, extrae texto y encadena pasos dentro de una aplicación de escritorio.
- Despliegue en portátiles con Apple Silicon: con 5,0 GB en Q4_K_M cabe en equipos de 16 GB de memoria, lo que permite ofrecer búsqueda asistida sin GPU dedicada ni conexión a la nube.
- Moderación de respuestas en asistentes documentales: la abstención UNKNOWN reduce respuestas inventadas cuando la base documental no cubre la pregunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo Q4_K_M ocupa 5,0 GB; se recomienda un equipo con 16 GB de memoria o más según la model card. Para inferencia con contexto de 4096 tokens hay que sumar la caché KV, por lo que un presupuesto de 6-8 GB de memoria total es realista.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) puede alojar el modelo cuantizado; A100 y H100 son sobredimensionadas para este caso.
- Consumer GPU: sí, cabe en GPUs de gama media con 8 GB o más de VRAM.
- Apple Silicon: es el escenario recomendado por el autor (Macs con 16 GB o más de memoria unificada).
- Opciones de despliegue: llama.cpp y aplicaciones compatibles (LM Studio, Ollama, llama-cpp-python); el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Antelope v2 Search & Browser 8B | 8,19 B | 4096 | GGUF Q4_K_M | Apache 2.0 | Búsqueda web y navegación con citas |
| Qwen/Qwen3-8B (base) | 8,19 B | contexto nativo de Qwen3-8B (no disponible en la información) | safetensors, GGUF de terceros | Apache 2.0 | Asistente generalista |
| Otros ajustes GGUF de Qwen3-8B | ~8 B | variable | GGUF | según autor | Generalistas o de rol |

La comparación relevante es con el modelo base: Antelope v2 sacrifica contexto (4096 tokens frente a la ventana nativa de Qwen3-8B) a cambio de comportamiento especializado en búsqueda, citas y abstención. No se dispone de datos de benchmarks que permitan cuantificar la ganancia en esas tareas ni la posible degradación en capacidades generales.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens: insuficiente para sintetizar muchas fuentes largas en una sola pasada; requiere trocear el contenido de las páginas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, ni de la degradación respecto a Qwen3-8B en tareas generales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria ni issues documentados.
- Idiomas soportados no declarados: el comportamiento multilingüe del ajuste no está verificado, aunque el modelo base es multilingüe.
- Riesgo de alucinación: aunque el ajuste entrena la abstención UNKNOWN, no hay métricas de tasa de abstención correcta ni de falsos positivos.
- La resistencia a inyección de prompts es una afirmación del autor sin evaluación pública; no debe tratarse como garantía de seguridad en producción.
- Solo se publica Q4_K_M: no hay versiones de mayor precisión (Q8, F16) para evaluar el techo de calidad del ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado a partir de páginas web puede estar sujeto a derechos de terceros.
- Un único archivo con SHA-256 publicado: conviene verificar la integridad antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jabbyb/antelope-v2-search-browser-8b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Unsloth (librería de ajuste): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
