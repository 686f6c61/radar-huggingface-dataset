# FoolDev/Janus-35B-HERETIC

## Resumen

Janus-35B-HERETIC es un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) derivado de la familia Qwen 3.6, concretamente de la variante 35B-A3B (unos 34.700 millones de parámetros totales con aproximadamente 3.000 millones activos por token). Lo publica el usuario FoolDev en Hugging Face y parte del modelo `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic`, que a su vez es una "abliteración" (eliminación de comportamientos de rechazo) del Qwen 3.6 35B-A3B original. El resultado es un modelo orientado a razonamiento, conversación, agentes y uso multimodal (entrada de imagen y texto), distribuido en formato GGUF y empaquetado para su uso directo con Ollama.

La propuesta de valor es doble: por un lado, la eficiencia de un MoE con solo ~3B de parámetros activos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño; por otro lado, una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 con YaRN. El modelo se distribuye bajo licencia Apache 2.0 y cubre 22 idiomas, incluido el español.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: arquitecturas MoE eficientes, modelos "sin censura" (uncensored/heretic) para investigación sobre alineamiento y rechazo, y distribución en GGUF lista para Ollama. Conviene advertir, no obstante, que el propio autor reconoce que el repositorio es un reempaquetado de una cuantización ajena (Q4_K_M de llmfan46) sin entrenamiento ni cuantización propios, y que la atribución de datasets y "teacher" del modelo base no está verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), base Qwen 3.6 35B-A3B |
| Parametros totales | ~34.660.610.688 (34,7B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.010.000 con YaRN (no incluido por defecto) |
| Tipos de cuantizacion | GGUF Q4_K_M (distribución principal); otras cuantizaciones no disponibles en la información |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, de, ar, tr, pl, sv, nl, he, id, uk, fa, pt, ms, fi, el (22 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`); safetensors no disponible en este repo |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE): de los ~34,7B parámetros totales, solo ~3B se activan por token, lo que permite un throughput alto con un coste de memoria de pesos completo. Hereda la base multimodal Qwen 3.6 35B-A3B, por lo que el pipeline declarado es `image-text-to-text` e incluye un proyector de visión (vision projector) que el autor empaqueta para Ollama.

Sobre el entrenamiento hay que ser explícito: el repositorio **no entrena ni cuantiza**. Lo que se publica es el Q4_K_M de `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic`, byte a byte, con un envoltorio de Ollama propio (ficheros `template`, `system`, `params` y `Modelfile`). La model card lista datasets (`Crownelius/Creative_Writing_ShareGPT_Enhanced`, `microsoft/rStar-Coder`, `peteromallet/dataclaw-peteromallet`, `Crownelius/Opus-4.7-Reasoning`, `openbmb/UltraData-Math`, `Crownelius/Crow-Heretic-TeichAI-Unified`) y un "teacher" (Claude Fable 5), pero el propio autor aclara que son atribuciones heredadas de revisiones anteriores de la card, que el base actual no las reclama y que al menos `Crownelius/Opus-4.7-Reasoning` no es accesible públicamente (HTTP 401). Deben tratarse como atribución no verificada, no como registro de entrenamiento. La "abliteración" del modelo base es la innovación técnica relevante: se eliminan direcciones de activación asociadas al rechazo, lo que reduce la negativa a responder pero también los mecanismos de seguridad alineados.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (262K nativos).
- Razonamiento explícito: el modelo expone una capacidad `thinking` en Ollama.
- Capacidades multimodales: entrada de imagen y texto (pipeline `image-text-to-text`) mediante proyector de visión.
- Tool calling / function calling: la plantilla de herramientas está incluida y la capacidad `tools` aparece registrada en Ollama.
- Uso como agente: soporta razonamiento multi-paso y encadenamiento de herramientas.
- Capacidades de código y matemáticas (heredadas de la base Qwen 3.6 y de los datasets de destilación atribuidos, no verificados).
- Multilingüe en 22 idiomas, incluido español.
- Modo "uncensored": comportamiento de rechazo reducido por diseño (abliteración).

## Casos de uso

- **Atención al cliente automatizada:** conversaciones multi-turno con historial largo gracias a los 262K tokens de contexto, sin truncar el hilo en sesiones extensas.
- **Agentes con herramientas en producción:** integración de function calling en pipelines de automatización (consultas a APIs, ejecución de acciones) aprovechando la capacidad `tools` y el bajo coste por token del MoE.
- **Análisis de documentos largos:** resumen y extracción de información sobre contratos, informes o bases de conocimiento de cientos de miles de tokens, con contexto extendido vía YaRN si se acepta la degradación asociada.
- **Procesamiento de imágenes con texto (OCR semántico, descripción, VQA):** uso del proyector de visión para tareas image-text-to-text en local.
- **Asistencia a la programación:** generación y revisión de código, con soporte de tool calling para integrarse en flujos de CI/CD o asistentes de IDE.
- **Investigación sobre alineamiento y rechazo:** el carácter "heretic/uncensored" lo hace útil para estudiar cómo la abliteración afecta a la negativa, la utilidad y los sesgos, en un entorno controlado.
- **Despliegue local en hardware de gama alta de consumo:** al ser GGUF Q4_K_M, puede ejecutarse con Ollama en estaciones con suficiente VRAM/RAM (ver requisitos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas, y el autor no aporta mediciones de calidad propias.

## Requisitos de hardware

- **VRAM/RAM estimada:** con el contexto nativo completo de 262.144 tokens, ~25,4 GiB con caché KV f16 por defecto y ~23,0 GiB con `OLLAMA_KV_CACHE_TYPE=q8_0`. Con `num_ctx=65536`, ~21,6 GiB medidos. Añadir ~1,1 GiB en el peor caso si se usa el proyector de visión del one-liner de Hugging Face.
- **Cuantización:** Q4_K_M como distribución principal; el tamaño del repo es de 162,3 GB (incluye todas las revisiones y blobs en historial de git).
- **GPU recomendadas:** no especificadas en la información. Por el volumen de pesos en Q4_K_M y el contexto, se requiere hardware de gama alta; GPUs de 24 GB o más (RTX 4090, A100, H100) son el rango razonable, aunque el dato exacto no está confirmado por el autor.
- **¿Cabe en consumer GPU?** No confirmado. El KV cache a contexto completo (~23-25 GiB) ya supera los 24 GB de una RTX 4090 en solitario; reducir `num_ctx` es obligatorio en ese caso.
- **Despliegue:** Ollama (soporte oficial vía `ollama run hf.co/FoolDev/Janus-35B-HERETIC` o build local con `Modelfile`), llama.cpp (base de Ollama). vLLM y TGI no están confirmados para este GGUF.
- **Latencia y throughput:** no disponibles. El ratio de ~3B parámetros activos sugiere un throughput alto por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Janus-35B-HERETIC | ~34,7B | ~3B | 262K (1M YaRN) | Apache 2.0 | GGUF | Abliterado, multimodal, uncensored |
| Qwen 3.6 35B-A3B (base) | ~34,7B | ~3B | 262K | Apache 2.0 | safetensors/GGUF | Modelo original alineado |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic | ~34,7B | ~3B | 262K | Apache 2.0 | GGUF | Base directa de este repo |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Atribución no verificada:** los datasets y el "teacher" listados no están confirmados por el modelo base; uno de los datasets no es accesible públicamente. No deben citarse como registro de entrenamiento.
- **Sin entrenamiento ni cuantización propios:** el repo reempaqueta el Q4_K_M de llmfan46; la calidad depende enteramente de ese artefacto.
- **Riesgo de alucinación:** inherente a los modelos de lenguaje; sin benchmarks publicados no hay evidencia de mitigación.
- **Sesgos:** la abliteración elimina mecanismos de rechazo, lo que puede aumentar la probabilidad de contenido sesgado, ofensivo o inseguro. No es adecuado para aplicaciones orientadas al público sin filtros adicionales.
- **Seguridad:** el carácter "uncensored/heretic" implica que las salvaguardas alineadas están reducidas; requiere supervisión y capas de moderación en producción.
- **Contexto extendido:** más allá de ~262K tokens el rendimiento degrada porque YaRN no está incluido por defecto.
- **Licencia:** Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo (por ejemplo, en la UE).
- **Compatibilidad Ollama:** el proyector de visión solo está probado en versiones concretas (0.32.15, 0.33.3, 0.40.6, 0.40.17); en versiones antiguas puede fallar incluso en texto.
- **Inestabilidad del repo:** el modelo base cambió tres veces el 2026-09-18; conviene verificar la revisión descargada.

## Enlaces

- Hugging Face: https://huggingface.co/FoolDev/Janus-35B-HERETIC
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo hermano: https://huggingface.co/FoolDev/Thanatos-27B-HERETIC
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
