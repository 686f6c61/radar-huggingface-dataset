# Questionmarkboy/frankenstein-3-0

## Resumen

Frankenstein-3.0 es un orquestador multimodal autoalojado publicado en Hugging Face por el usuario Questionmarkboy, no un modelo de pesos único. El repositorio no contiene un checkpoints de transformer propio, sino una aplicación Python con interfaz Gradio (sdk_version 4.44.1, app_file app.py) que enruta cada petición del usuario hacia uno de cuatro especialistas: un modelo de chat y razonamiento, un modelo de código, un generador de imágenes y un generador de vídeo con audio. El enrutado lo realiza un router basado en LLM que detecta la intención y encadena tareas multi-paso, por ejemplo "dibuja un robot y luego anímalo" encadenaría generación de imagen y después generación de vídeo.

El problema que resuelve es de integración: en lugar de gestionar por separado un LLM conversacional, un modelo de código, un pipeline de difusión para imágenes y otro para vídeo, el proyecto ofrece una única aplicación local que expone todos ellos tras una interfaz común, con herramientas adicionales de búsqueda web en tiempo real, calculadora basada en SymPy, ejecución de código Python en sandbox, RAG sobre documentos .txt y memoria persistente en SQLite. Está pensado para ejecución en máquina local, con detección automática de CUDA y degradación controlada en equipos sin GPU (chat y código siguen funcionando; imagen y vídeo devuelven un mensaje indicando que se requiere GPU).

La relevancia actual del proyecto es limitada y hay que ser explícito al respecto: el repositorio registra 0 descargas y 0 likes, fue creado y actualizado el mismo día (16 de septiembre de 2026) y no declara pipeline en Hugging Face. Los especialistas citados en la model card son Qwen3.5-4B (chat y razonamiento), Qwen2.5-Coder-14B (programación), SDXL (imagen) y MiniMax-H3 en cuantización NF4 (vídeo con audio); estos modelos se referencian por nombre, sin que la información disponible detalle versiones exactas, pesos concretos ni composición del entrenamiento del orquestador, que no entrena ningún modelo propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Es un orquestador de aplicación (router basado en LLM + especialistas externos), no una arquitectura de modelo única |
| Parámetros totales | No disponible. Depende de los especialistas invocados: se citan Qwen3.5-4B, Qwen2.5-Coder-14B, SDXL y MiniMax-H3 NF4 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NF4 para el especialista de vídeo (MiniMax-H3 NF4); sin datos para el resto de especialistas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible. El repositorio se distribuye como aplicación Python con requirements.txt y app.py, no como pesos en safetensors o GGUF |

Metadatos adicionales del repositorio: ID Questionmarkboy/frankenstein-3-0, etiquetas license:apache-2.0 y region:us, 0 descargas, 0 likes, creado y actualizado el 2026-09-16, pipeline no disponible.

## Arquitectura y entrenamiento

La arquitectura del proyecto es la de un sistema multi-agente orquestado, no la de un modelo generativo. La model card describe cuatro especialistas delegados: chat y razonamiento (Qwen3.5-4B), programación (Qwen2.5-Coder-14B), generación de imagen (SDXL) y generación de vídeo con audio (MiniMax-H3 en NF4). Sobre ellos se sitúa un router potenciado por LLM que realiza detección de intención y encadenamiento de tareas en varios pasos, lo que permite componer flujos como la generación de una imagen seguida de su animación sin que el usuario tenga que invocar cada especialista por separado.

El sistema incorpora además cinco herramientas: búsqueda web en tiempo real mediante DuckDuckGo, calculadora con evaluación segura de expresiones mediante SymPy, ejecución de código Python en un entorno aislado (sandbox), RAG sobre documentos .txt que el usuario sube y consulta, y memoria de conversación persistente en SQLite. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO ni sobre innovaciones técnicas internas del router, porque el proyecto no entrena modelos propios y la model card no documenta el pipeline de orquestación más allá de su comportamiento funcional. Tampoco se detalla el mecanismo exacto de detección de intención ni el formato de las llamadas entre router y especialistas.

## Capacidades

- Generación de texto conversacional y razonamiento, delegada al especialista de chat (Qwen3.5-4B según la model card).
- Generación de código, delegada a Qwen2.5-Coder-14B, un modelo especializado en programación.
- Generación de imágenes mediante SDXL.
- Generación de vídeo con audio incorporado mediante MiniMax-H3 en cuantización NF4, según la model card.
- Enrutado inteligente de intención basado en LLM, con encadenamiento de tareas multi-paso entre especialistas.
- Búsqueda web en tiempo real mediante DuckDuckGo.
- Cálculo matemático seguro mediante SymPy.
- Ejecución de código Python en entorno sandbox.
- RAG sobre documentos .txt cargados por el usuario.
- Memoria persistente de conversación en SQLite.
- Detección automática de CUDA con degradación funcional en equipos sin GPU.
- No se documenta soporte explícito de tool calling o function calling en formato estándar, ni capacidades de audio de entrada (solo se menciona audio generado junto al vídeo). No hay datos sobre cobertura multilingüe.

## Casos de uso

- Asistente conversacional local con memoria persistente: el histórico en SQLite permite mantener contexto entre sesiones sin depender de servicios en la nube, útil para uso personal o entornos con requisitos de privacidad.
- Prototipado de pipelines RAG sobre documentación interna: el usuario carga ficheros .txt y consulta su contenido, lo que sirve para validar flujos de recuperación antes de invertir en una infraestructura vectorial completa.
- Generación de recursos visuales en cadena: un flujo típico sería pedir una imagen con SDXL y a continuación su animación con MiniMax-H3, evitando cambiar de herramienta entre ambas etapas.
- Asistencia de programación con ejecución verificable: el especialista de código propone una solución y la herramienta de ejecución sandbox permite comprobar el resultado dentro de la propia aplicación, sin salir del entorno.
- Resolución de consultas que requieren datos actuales: la búsqueda DuckDuckGo en tiempo real complementa al LLM cuando la pregunta depende de información posterior a su fecha de corte.
- Cálculo simbólico y numérico asistido: la integración con SymPy permite resolver derivadas, integrales o simplificaciones sin riesgo de ejecución arbitraria de código.
- Demostración técnica de orquestación multi-modelo: sirve como referencia para quienes quieran construir su propio router de especialistas con Gradio, ya que el código de la aplicación está disponible en el repositorio.
- Entorno educativo para experimentar con generación multimodal: la degradación controlada en CPU permite que estudiantes sin GPU trabajen al menos con las capacidades de texto y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, FID, CLIP score ni ningún otro indicador, ni para el orquestador ni para los especialistas que invoca. Tampoco se documentan latencias, throughput ni comparaciones medidas con otras implementaciones.

## Requisitos de hardware

- Chat y código en CPU: cualquier equipo moderno con 16 GB de RAM, según la tabla de requisitos de la model card.
- Chat y código en GPU: 8 GB o más de VRAM.
- Generación de imágenes: 12 GB o más de VRAM.
- Generación de vídeo: se recomiendan 16 GB o más de VRAM.
- Comportamiento sin GPU: la aplicación detecta CUDA automáticamente; en máquinas solo CPU las funciones de chat y código operan y las de imagen y vídeo devuelven un mensaje indicando que se requiere GPU.
- GPU concretas recomendadas: no disponible. La model card especifica umbrales de VRAM, no modelos de tarjeta.
- Opciones de despliegue: la vía documentada es la ejecución local mediante git clone del repositorio, instalación de requirements.txt y ejecución de app.py, con interfaz Gradio accesible en http://localhost:7860. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados en la información proporcionada para establecer comparaciones cuantitativas. Frankenstein-3.0 no es un modelo de pesos, sino una aplicación de orquestación, por lo que su comparación natural son otras plataformas autoalojadas de orquestación multi-modelo y no modelos de lenguaje concretos. La tabla siguiente es cualitativa y los campos no confirmados se marcan como no disponible.

| Aspecto | Frankenstein-3.0 | Open WebUI | LibreChat | AnythingLLM |
|---|---|---|---|---|
| Tipo | Orquestador multimodal con router LLM y especialistas fijos | Plataforma de interfaz para LLMs | Interfaz multi-proveedor | Plataforma de agentes y RAG |
| Generación de imagen integrada | Sí, SDXL | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Generación de vídeo con audio | Sí, MiniMax-H3 NF4 | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Router de intención con LLM | Sí, con encadenamiento multi-paso | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Memoria persistente | SQLite | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Licencia | Apache 2.0 | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Madurez y adopción | 0 descargas, 0 likes, sin actualizaciones tras la publicación | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |

Las comparaciones con alternativas consolidadas de orquestación no pueden cuantificarse sin datos públicos verificados en el material consultado, por lo que se dejan como no disponible en lugar de estimarse.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: el repositorio es una aplicación que delega en modelos de terceros, por lo que hereda todas sus limitaciones, sesgos y restricciones de licencia, no solo la Apache 2.0 declarada para el orquestador.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin actualizaciones posteriores a la fecha de creación (2026-09-16). No hay evidencia de uso en producción ni de comunidad que reporte errores.
- Falta de documentación técnica esencial: no se especifican versiones exactas ni revisiones de los especialistas, longitudes de contexto, idiomas soportados, formato de pesos ni procedimiento de evaluación. Esto dificulta la reproducibilidad.
- Riesgo de alucinación: es el propio de los modelos de lenguaje subyacentes. El router basado en LLM añade un punto adicional de fallo, ya que una clasificación de intención errónea puede enviar la petición al especialista equivocado.
- Ejecución de código: aunque la model card indica que el runner de Python está en sandbox, la información disponible no describe el mecanismo de aislamiento ni sus límites. En un despliegue real debería verificarse antes de exponer la aplicación a usuarios no confiables.
- Búsqueda web mediante DuckDuckGo: no se detalla manejo de límites de tasa, contenido no fiable ni filtrado de resultados, lo que puede introducir información incorrecta en las respuestas.
- Restricciones de hardware: sin GPU, las capacidades de imagen y vídeo quedan deshabilitadas, de modo que el proyecto no es funcionalmente completo en equipos de consumo sin CUDA.
- Licencias de los especialistas: la model card no especifica bajo qué licencia se distribuyen SDXL, MiniMax-H3 ni los modelos Qwen citados, dato imprescindible antes de un uso comercial del conjunto.
- Idiomas y contexto: al no declararse, no puede asumirse cobertura multilingüe ni una ventana de contexto determinada para conversaciones largas.
- Fecha de los metadatos: la creación y la actualización coinciden en 2026-09-16, lo que sugiere que el proyecto no ha recibido mantenimiento posterior.

## Enlaces

- Hugging Face: https://huggingface.co/Questionmarkboy/frankenstein-3-0
- Repositorio clonable indicado en la model card: https://huggingface.co/Questionmarkboy/frankenstein-3-0 (mismo origen, para git clone)
- Interfaz local documentada: http://localhost:7860 (solo tras ejecutar la aplicación)
- Paper, blog técnico, repositorio de código independiente o demo pública: no disponible.
- Nota sobre la búsqueda web: los resultados obtenidos en la búsqueda no guardan relación con el modelo. Corresponden a páginas de lotería alemana (westlotto.de, lotto.de, lottoview.de y la entrada de Wikipedia sobre la Westdeutsche Lotterie) y no aportan ninguna información técnica sobre Frankenstein-3.0.
