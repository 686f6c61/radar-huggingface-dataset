# grandcodepope/buyasoul-seshat

## Resumen

SESHAT es un sistema de memoria y razonamiento local autónomo desarrollado por el usuario grandcodepope como parte del proyecto BUYaSOUL, una familia de herramientas orientadas a crear "almas" de IA autónomas. El modelo presentado en este repositorio es el componente de razonamiento local del sistema: un modelo de lenguaje Qwen 3.5-0.8B cuantizado a GGUF (537 MB) que se ejecuta mediante llama.cpp y alcanza aproximadamente 20 tokens por segundo en una CPU Intel i7-4770 con 16 GB de RAM. El sistema completo integra además un embedder ONNX (all-MiniLM-L6-v2), una base de datos vectorial LanceDB con 6.392 vectores y un buscador híbrido BM25 + semántico, todo ello operando sin conexión a la nube ni consumo de tokens externos.

La relevancia de este modelo radica en su enfoque de "ALLM" (Autonomous Local LLM): permite ejecutar razonamiento, síntesis, compresión de diálogos y búsqueda semántica completamente en local, con un coste de hardware mínimo (cabe en un pendrive USB) y cero dependencias externas. Aunque el modelo base es de solo 0.8B de parámetros, el sistema compensa su tamaño con una arquitectura de memoria externa (LanceDB) y un broker de enrutamiento que decide qué tareas se resuelven localmente y cuáles se delegan a herramientas remotas vía MCP. El contexto máximo es de 4.096 tokens, ampliable según la documentación.

El proyecto se publica bajo una licencia propietaria ("other"), y el repositorio actual tiene cero descargas y cero likes, lo que indica que se trata de un trabajo experimental o personal más que un modelo destinado a uso generalizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen 3.5-0.8B (transformer decoder, no confirmado explícitamente) |
| Parametros totales | 0.8B (800 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (extendable) |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Other (propietaria) |
| Formato de pesos | GGUF (para el LLM) y ONNX (para embeddings) |

## Arquitectura y entrenamiento

El modelo de razonamiento es un Qwen 3.5-0.8B cuantizado a Q4_0 y servido mediante llama.cpp. La arquitectura subyacente no se detalla en la información proporcionada; se asume que sigue el diseño estándar de un transformer decoder con atención causal, similar a otras variantes de Qwen. No se ha publicado información sobre el entrenamiento: ni cantidad de tokens, ni composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El autor únicamente indica que el modelo se ejecuta localmente a ~20 tok/s en una CPU de 2013 (i7-4770).

El sistema SESHAT, del cual este modelo forma parte, incorpora una arquitectura modular con 8 componentes: un núcleo de razonamiento (llm.js), un embedder basado en Transformers.js con all-MiniLM-L6-v2 ONNX, una base vectorial LanceDB embebida, un indexador de documentos Markdown, un buscador híbrido (BM25 + semántico + boost de palabras clave), un broker de enrutamiento local/remoto y un cliente MCP para herramientas externas. La innovación principal no reside en el modelo de lenguaje en sí, sino en el sistema de memoria y búsqueda que lo acompaña, que permite compensar el tamaño reducido del LLM con acceso estructurado a un corpus de 962 archivos Markdown.

## Capacidades

- Generación de texto y razonamiento libre: el modelo puede responder preguntas y razonar sobre el contexto que se le proporciona, como se muestra en el ejemplo `think('What does PLT mean for agent autonomy?', { memories: relevantMemories })`.
- Síntesis multi-fuente: la función `synthesize` combina resultados de búsqueda para generar insights a partir de múltiples documentos.
- Compresión de contexto: la función `summarize` reduce diálogos largos mediante resúmenes locales, con una compresión reportada de 10x.
- Búsqueda híbrida: integra BM25, similitud vectorial y refuerzo por palabras clave con una precisión declarada de Precision@10 > 0.85.
- Razonamiento con memoria externa: el modelo puede consultar la base vectorial LanceDB para recuperar fragmentos relevantes antes de generar respuestas.
- Enrutamiento inteligente: el broker decide qué tareas se resuelven localmente (búsqueda, resúmenes, síntesis) y cuáles se delegan a herramientas remotas vía MCP (llamadas a herramientas, planificación compleja, chat creativo).
- Capacidad de tool calling: a través del cliente Omniroute MCP, el sistema puede invocar herramientas externas controladas por GSK.
- Operación offline: todo el pipeline funciona sin conexión a internet ni servicios en la nube.

## Casos de uso

- Asistente personal offline: un usuario puede ejecutar SESHAT en un ordenador modesto para consultar su propia base de conocimiento (notas, diarios, documentos) sin enviar datos a la nube. El modelo responde preguntas basándose en los fragmentos recuperados por búsqueda híbrida.
- Memoria de largo plazo para agentes de IA: el sistema puede servir como capa de memoria para otros agentes, almacenando y recuperando experiencias pasadas mediante vectores y búsqueda híbrida, evitando el coste de tokens de mantener contextos largos.
- Compresión de conversaciones: en un chatbot o sistema de atención al cliente, la función `summarize` permite condensar diálogos extensos en resúmenes que luego se inyectan en el contexto de un LLM más grande, reduciendo el consumo de tokens.
- Búsqueda semántica local en documentación técnica: con LanceDB y el embedder ONNX, se puede indexar una colección de manuales o guías y realizar consultas en lenguaje natural con resultados relevantes en menos de 10 ms.
- Razónamiento sobre corpus personales: el ejemplo de "Profit Bible" muestra cómo el sistema puede extraer patrones, reglas y principios de un conjunto de notas personales, funcionando como un asistente de análisis reflexivo.
- Prototipado de agentes autónomos con presupuesto cero: dado que el modelo corre en CPU y no requiere API externas, es adecuado para experimentar con arquitecturas de agente que necesitan razonamiento local sin coste recurrente.
- Dispositivos de borde (edge computing): al ocupar solo ~560 MB en total, puede desplegarse en Raspberry Pi o similares para tareas de procesamiento de lenguaje natural en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una velocidad de ~20 tokens por segundo en CPU Intel i7-4770 y una precisión de búsqueda híbrida de Precision@10 > 0.85, pero no hay métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta exclusivamente en CPU.
- CPU mínima recomendada: Intel i7-4770 o equivalente (4 núcleos/8 hilos). A esta velocidad, se obtienen ~20 tok/s.
- RAM: 16 GB (el modelo GGUF ocupa 537 MB, pero el sistema con LanceDB y el embedder puede necesitar más).
- GPU: no necesaria, aunque podría acelerarse con llama.cpp en GPU si se desea.
- Almacenamiento: ~560 MB para todos los assets (modelo, embeddings, vectores).
- Opciones de despliegue: llama.cpp (directo), Node.js con el paquete `buyasoul-seshat`, posible integración con servidores HTTP (scaffold API REST).
- Latencia: la búsqueda vectorial tarda <10 ms, el embedding ~5 ms por consulta, y la generación de texto depende del número de tokens (a 20 tok/s, una respuesta de 100 tokens tarda ~5 segundos).

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa. El modelo es una cuantización Q4_0 de Qwen 3.5-0.8B, una variante no oficial. Modelos comparables en tamaño (0.5B-1B) como TinyLlama-1.1B, Phi-2 (2.7B) o Gemma-2-2B tienen arquitecturas y licencias diferentes, pero no se dispone de benchmarks para comparar. La información proporcionada no incluye mediciones estandarizadas del rendimiento del modelo de lenguaje, solo del sistema completo (búsqueda, velocidad). Se recomienda evaluar directamente en el hardware objetivo.

## Limitaciones y advertencias

- Modelo muy pequeño (0.8B): su capacidad de razonamiento complejo, matemáticas y generación de código es significativamente inferior a modelos de 7B o superiores. Es adecuado para tareas simples de comprensión y síntesis, no para resolver problemas avanzados.
- Riesgo de alucinación: al ser un modelo pequeño y con contexto limitado (4.096 tokens), puede generar respuestas plausibles pero incorrectas, especialmente cuando el contexto recuperado es insuficiente o ambiguo.
- Sin datos de entrenamiento publicados: se desconoce la procedencia de los datos, el proceso de alineación y las posibles mitigaciones de sesgo. No se puede garantizar la seguridad o imparcialidad del modelo.
- Licencia propietaria: la licencia "other" y el badge "Proprietary" indican restricciones de uso. No se especifican términos claros para uso comercial o modificación; se recomienda contactar al autor antes de cualquier despliegue productivo.
- Dependencia de componentes no estándar: el sistema utiliza Qwen 3.5-0.8B, un modelo no publicado oficialmente por Alibaba (la serie Qwen oficial llega hasta Qwen 3). Esto puede implicar problemas de reproducibilidad y soporte.
- Documentación orientada a un caso concreto: la model card está muy ligada al proyecto personal BUYaSOUL y al corpus "Profit Bible", lo que dificulta la generalización a otros dominios.
- Sin soporte de comunidad: cero descargas y cero likes indican que no hay usuarios que hayan validado el funcionamiento fuera del entorno del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/grandcodepope/buyasoul-seshat
- Publicación en Tumblr del autor: https://www.tumblr.com/grandcodepope/820798413671202816/building-autonomous-ai-autonomous-ai
- Perfil de Bluesky del autor: https://bsky.app/profile/grandcodepope.bsky.social/post/3mpjx45gjho2f
- Sitio del proyecto BUYaSOUL: https://buyasoul-ai.github.io/buyasoul/
- Sitio de Seshat AI (no confirmado como relacionado): https://seshat-ai.org/
