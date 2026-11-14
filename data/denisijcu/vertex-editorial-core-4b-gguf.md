# Denisijcu/vertex-editorial-core-4b-gguf

## Resumen

Vertex-Editorial-Core-4B (GGUF) es un modelo de lenguaje de 4.022 millones de parámetros desarrollado por Vertex Coders LLC (fundada por Denis Sanchez Leyva) y publicado en Hugging Face bajo el identificador `Denisijcu/vertex-editorial-core-4b-gguf`. Se trata de un ajuste fino del modelo Qwen3-4B (en su variante cuantizada `unsloth/Qwen3-4B-bnb-4bit`) especializado en arquitectura editorial, ingeniería pedagógica de libros técnicos y posicionamiento en Amazon KDP. El entrenamiento se realizó mediante destilación de conocimiento a nivel de secuencia (SeqKD) desde un modelo teacher de 32B parámetros (`Qwen2.5-32B-Instruct`).

El modelo resuelve un problema muy concreto: la generación estructurada de blueprints editoriales, índices de libros técnicos, packs de lanzamiento para KDP y arquitecturas de capítulos con laboratorios prácticos. Incorpora un modo de razonamiento explícito (`<editorial_reasoning>`) que obliga al modelo a analizar el hueco de mercado, la fricción cognitiva del lector y el arco pedagógico antes de producir la salida final en Markdown.

Su relevancia actual radica en dos factores: por un lado, la especialización vertical en un nicho (autoedición técnica en Amazon KDP) que los modelos generalistas cubren de forma superficial; por otro, su empaquetado en GGUF Q4_K_M (~2,5 GB), que permite inferencia local en GPUs de consumo modestas como una GTX 1660 Ti de 6 GB. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de la familia Qwen3. Sobre esa base se aplicó un proceso de ajuste fino supervisado combinado con destilacion de conocimiento a nivel de secuencia (SeqKD), utilizando como teacher `Qwen2.5-32B-Instruct`. En SeqKD el modelo student aprende a imitar las secuencias completas generadas por el teacher, lo que permite transferir capacidades de un modelo 8 veces mayor a uno de 4B parámetros en un dominio estrecho. El entrenamiento se realizó sobre la variante `unsloth/Qwen3-4B-bnb-4bit`, lo que indica el uso de las optimizaciones de Unsloth para ajuste fino eficiente en memoria (QLoRA o similar sobre pesos cuantizados en 4 bits).

La innovación principal no es arquitectónica sino de comportamiento: el modelo incorpora un bloque de razonamiento editorial obligatorio (`<editorial_reasoning>`) que precede a cualquier salida. Este bloque fuerza un análisis en tres ejes (hueco de mercado y USP, psicología del lector y fricción cognitiva, estructura pedagógica o narrativa) antes de generar el documento final. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto estructurado en Markdown con formato editorial profesional.
- Razonamiento editorial explícito mediante el bloque `<editorial_reasoning>`, que analiza mercado, lector y estructura antes de responder.
- Modo 1: blueprint editorial completo, incluyendo títulos SEO, avatar de lector, reglas de estilo y tablas de contenido multi-parte.
- Modo 2: refactorización de índices y book doctoring, con diagnóstico y reestructuración de borradores.
- Modo 3: pack de lanzamiento KDP, con copywriting de contraportada bajo el framework PAS, palabras clave y gancho del capítulo 1.
- Modo 4: arquitectura micro de capítulo, con desglose de laboratorios prácticos, código vivo y retos técnicos.
- Capacidades multilingües limitadas a español e inglés.
- Soporte de conversación multi-turno (tag `conversational`).
- No se ha documentado soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo thinking más allá del bloque editorial propio.

## Casos de uso

- Planificación de libros técnicos: el modelo genera un blueprint completo con título SEO, avatar de lector, reglas de estilo y tabla de contenidos multi-parte, adecuado para autores que necesitan una estructura cerrada antes de escribir.
- Reescritura de índices deficientes: un autor con un borrador desestructurado puede introducirlo y obtener un diagnóstico de debilidades junto con una propuesta de reestructuración, gracias al modo de book doctoring.
- Lanzamiento en Amazon KDP: generación de contraportada con framework PAS, lista de palabras clave y gancho del primer capítulo, reduciendo el trabajo de copywriting previo a la publicación.
- Diseño de capítulos con componente práctico: desglose de laboratorios, fragmentos de código y retos técnicos para libros de programación, un caso donde los modelos generalistas suelen producir estructuras genéricas.
- Asistencia editorial en editoriales pequeñas o autoeditores: estandarización de la estructura de una colección completa aplicando el mismo system prompt a cada título.
- Inferencia local en estaciones de trabajo modestas: al ocupar ~2,5 GB en Q4_K_M, puede ejecutarse en una GTX 1660 Ti de 6 GB mediante LM Studio o llama.cpp, lo que permite flujos editoriales sin conexión ni coste por token.
- Prototipado rápido de productos editoriales: validación de ideas de libro y estimación de su encaje de mercado antes de invertir tiempo en la escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~2,5 GB con la cuantización Q4_K_M publicada.
- Cabe en GPUs de consumo: el autor cita explícitamente la NVIDIA GTX 1660 Ti de 6 GB como objetivo de despliegue.
- GPUs recomendadas: cualquier GPU con 4 GB o más de VRAM para Q4_K_M; GPUs de gama alta (RTX 4090, A100, H100) no son necesarias y aportarían poco para un modelo de 4B.
- Opciones de despliegue: LM Studio y llama.cpp según la model card; al ser GGUF estándar, también es compatible con Ollama y otros runners GGUF.
- Latencia y throughput: no disponibles. El autor menciona "alta velocidad" en GPUs de consumo sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Vertex-Editorial-Core-4B | 4.022 M | no disponible | Editorial / KDP | Apache 2.0 | GGUF |
| Qwen3-4B (base) | 4.000 M aprox. | no disponible | Generalista | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-32B-Instruct (teacher) | 32.000 M aprox. | no disponible | Generalista con instrucciones | Apache 2.0 | safetensors, GGUF |
| Modelos editoriales especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con su base Qwen3-4B: Vertex-Editorial-Core-4B sacrifica amplitud generalista a cambio de estructura editorial consistente y un modo de razonamiento específico. Frente al teacher de 32B, ofrece un 12,5 % del tamaño con la ventaja de ejecutarse en hardware de consumo. No se conocen otros modelos abiertos con especialización equivalente en arquitectura editorial y KDP.

## Limitaciones y advertencias

- Modelo de nicho: fuera del dominio editorial (KDP, estructura de libros técnicos) su rendimiento probablemente sea inferior al de Qwen3-4B sin ajustar, aunque no hay benchmarks que lo cuantifiquen.
- Riesgo de alucinación en datos verificables: palabras clave de Amazon, cifras de mercado o afirmaciones sobre competencia pueden ser inventadas; requieren verificación humana antes de publicar.
- Sesgo de dominio: el modelo está entrenado para producir estructuras editoriales con un estilo concreto (framework PAS, avatar de lector, USP), lo que puede producir salidas formulaicas o repetitivas en encargos creativos que pidan otro enfoque.
- Idiomas: solo español e inglés documentados; el rendimiento en otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar tareas con entradas largas (manuscritos completos) sin pruebas previas.
- Única cuantización publicada (Q4_K_M): no hay versiones Q8, Q5 o F16 en el repo, lo que limita la evaluación de la pérdida de calidad por cuantización.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks públicos ni evaluación independiente; el modelo debe validarse internamente antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene conservar los avisos de atribución exigidos por la licencia.
- El system prompt oficial impone un formato de salida concreto (`<editorial_reasoning>`); desviarse de él puede degradar la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Denisijcu/vertex-editorial-core-4b-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-bnb-4bit
- Modelo teacher (referencia): https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Web del autor: https://vertexcoders.com
- Unsloth (framework de ajuste fino): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
