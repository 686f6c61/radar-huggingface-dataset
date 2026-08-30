# muradil211/AetherSearch_DPO

## Resumen

AetherSearch DPO es un modelo de lenguaje de 3.085 millones de parámetros (escala 3B) especializado en búsqueda agéntica y razonamiento aumentado por recuperación. Desarrollado por muradil211, continúa el entrenamiento del checkpoint AetherSearch SFT mediante direct preference optimization (DPO) sobre el dataset AetherSearch_DPO. El modelo está basado en la arquitectura Qwen2 causal y ofrece una ventana de contexto de 32.768 posiciones, lo que permite manejar consultas y evidencias extensas en flujos de recuperación multi-paso.

Su relevancia radica en que aborda el problema de la integración de búsqueda y razonamiento en un único modelo compacto: genera de forma explícita consultas de búsqueda estructuradas en XML (`<search>`), procesa la evidencia devuelta (`<information>`) y produce respuestas fundamentadas (`<answer>`). Está diseñado para ser integrado en un runtime externo que ejecute las búsquedas, lo que lo convierte en una opción ligera y accesible para sistemas de retrieval-augmented generation (RAG) y agentes conversacionales. El modelo se distribuye en formato Transformers y está pensado para inferencia en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 causal language model |
| Parametros totales | 3.085.938.688 (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 posiciones |
| Tipos de cuantizacion | No disponible (pesos en BF16) |
| Idiomas soportados | Inglés |
| Licencia | No disponible; remite a la licencia de Qwen2.5-3B-Instruct y a los términos del checkpoint SFT y del dataset |
| Formato de pesos | Transformers (formato estándar de Hugging Face) |

## Arquitectura y entrenamiento

AetherSearch DPO emplea una arquitectura transformer causal de la familia Qwen2 con 3.085 millones de parámetros. El modelo fue entrenado mediante un pipeline de post-entrenamiento en varias etapas: primero un ajuste fino supervisado (SFT) sobre trayectorias completas de búsqueda y razonamiento, después una optimización de preferencias directas (DPO) con el dataset AetherSearch_DPO para favorecer trayectorias de búsqueda y respuesta más sólidas, y finalmente un refuerzo agéntico guiado por ganancia de información (Agentic RL) según el repositorio del proyecto. Esta combinación busca que el modelo aprenda a realizar recuperaciones multi-turno efectivas y a fundamentar sus respuestas en la evidencia obtenida.

El protocolo de interacción es explícito: el modelo emite spans XML con etiquetas `<search>`, `<information>` y `<answer>`. El runtime anfitrión debe parsear cada `<search>`, ejecutar la búsqueda en un backend RAG o de búsqueda web, y devolver el resultado dentro de `<information>`. El modelo puede repetir este ciclo varias veces hasta que dispone de suficiente evidencia para generar la respuesta final. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento de propósito general, con especial énfasis en tareas de búsqueda y recuperación de información.
- Búsqueda agéntica multi-paso: el modelo puede solicitar múltiples consultas de búsqueda de forma iterativa cuando la primera no es suficiente.
- Razonamiento explícito sobre qué información falta antes de emitir una consulta de búsqueda.
- Generación de respuestas fundamentadas en la evidencia recuperada, mediante el protocolo XML `<search>` / `<information>` / `<answer>`.
- Soporte para integración con backends de búsqueda externos (RAG, búsqueda web, bases de conocimiento) a través del runtime anfitrión.
- Capacidades multilingües limitadas al inglés (único idioma declarado en la model card).
- No incluye capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes de investigación con acceso a búsqueda en vivo: el modelo puede formular consultas específicas, recibir resultados y sintetizar una respuesta razonada, ideal para tareas de análisis de documentos o estudios de mercado.
- Sistemas de respuesta a preguntas con verificación de evidencia: al exigir que cada respuesta se apoye en `<information>`, reduce respuestas sin fundamento en dominios donde la precisión es crítica (legal, médico, técnico).
- Agentes conversacionales con recuperación de conocimiento corporativo: integrado en un pipeline RAG, puede responder preguntas sobre documentación interna manteniendo el contexto de la conversación en su ventana de 32K tokens.
- Automatización de tareas de extracción de información: el modelo puede iterar sobre múltiples búsquedas para recopilar datos dispersos y estructurarlos en una respuesta coherente.
- Generación de informes con citas: al producir respuestas basadas en evidencia, puede servir como base para sistemas que requieran trazabilidad de las fuentes.
- Búsqueda web aumentada para desarrolladores: consultas técnicas complejas que requieren recuperar documentación, ejemplos de código o discusiones de foros, con razonamiento intermedio sobre la relevancia de los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16, el modelo ocupa aproximadamente 6 GB (3,08 B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 8 GB de VRAM para inferencia cómoda.
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GGUF), el uso de VRAM se reduce a unos 2-3 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 3060 o inferiores.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100, H100, o cualquier GPU con al menos 8 GB de VRAM para BF16.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (el repositorio indica `endpoints_compatible`), así como con la API de FriendliAI para inferencia de baja latencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| AetherSearch DPO | 3B | 32K | Búsqueda agéntica + DPO | No disponible (deriva de Qwen2.5-3B-Instruct) |
| AetherSearch SFT | 3B | 32K | Búsqueda agéntica + SFT | No disponible |
| Qwen2.5-3B-Instruct | 3B | 32K | Chat/instrucción general | Apache 2.0 |

La comparativa directa con otros modelos de búsqueda agéntica de la misma escala no está disponible en la información consultada. AetherSearch DPO se distingue de su base Qwen2.5-3B-Instruct por su protocolo de búsqueda estructurada y su entrenamiento específico para recuperación multi-paso.

## Limitaciones y advertencias

- El modelo puede generar búsquedas y respuestas incorrectas, no fundamentadas o inseguras; la verificación de la evidencia y la validación de las respuestas son responsabilidad del integrador.
- Depende de un runtime externo que ejecute las búsquedas y devuelva la evidencia; sin ese componente, el modelo no funciona como un servicio de preguntas y respuestas autónomo.
- Solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- No se han publicado evaluaciones de sesgos ni de robustez ante entradas adversariales.
- La licencia no está especificada en la model card; es necesario revisar la licencia de Qwen2.5-3B-Instruct, los términos del checkpoint SFT y los del dataset AetherSearch_DPO antes de su redistribución o uso en producción.
- Las descargas y los likes del repositorio son cero, lo que sugiere que el modelo es reciente y aún no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muradil211/AetherSearch_DPO
- Checkpoint SFT: https://huggingface.co/muradil211/AetherSearch_SFT
- Repositorio del proyecto en GitHub: https://github.com/Muradil-mamat-211/AetherSearch
- Página de despliegue en FriendliAI: https://friendli.ai/models/muradil211/AetherSearch
