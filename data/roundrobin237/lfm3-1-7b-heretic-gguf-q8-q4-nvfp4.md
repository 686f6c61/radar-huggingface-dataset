# RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4

## Resumen

LFM3-1.7B-heretic-GGUF es una versión modificada y cuantizada de LiquidAI/LFM3-1.7B, un modelo de lenguaje de 1.728.801.672 parámetros desarrollado originalmente por Liquid AI. El autor de esta variante, RoundRobin237, aplicó la técnica Heretic (Arbitrary-Rank Ablation, ARA) sobre los pesos del modelo base para reducir drásticamente su tasa de rechazos (refusals), y posteriormente convirtió el checkpoint resultante a formato GGUF para su uso con llama.cpp. La modificación no altera la arquitectura ni el tamaño del modelo, sino el comportamiento de alineación.

El interés de esta ficha radica en que combina dos elementos poco habituales: por un lado, una ablación de rechazos medida y documentada con métricas concretas (reducción del 91 % al 5 % de rechazos en un conjunto de 100 prompts, con una divergencia KL de 0,2634 en las distribuciones del primer token sobre prompts benignos); por otro, un empaquetado triple en GGUF que incluye Q8_0, Q4_K_M y una variante NVFP4 con soporte específico en llama.cpp. Esto lo hace relevante para desarrolladores que necesitan un modelo pequeño, desplegable en hardware de consumo, con menor tendencia a rechazar peticiones legítimas.

El modelo base pertenece a la familia LFM3 de Liquid AI y está orientado a generación de texto conversacional, con soporte declarado de inglés y coreano. La licencia es la LFM Open License v1.0, que impone restricciones específicas de uso comercial que deben revisarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LiquidAI/LFM3-1.7B; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.672 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, NVFP4 (híbrida: 72 tensores feed-forward en NVFP4 con escalas por tensor, resto en Q8_0) |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | LFM Open License v1.0 (lfm1.0, marcada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card de esta variante no describe la arquitectura interna del modelo base LiquidAI/LFM3-1.7B; únicamente se confirma que se trata de un transformer de 1.728.801.672 parámetros según los datos de safetensors del repositorio. La modificación aplicada por RoundRobin237 consiste en Heretic, una herramienta que ejecuta Arbitrary-Rank Ablation (ARA) sobre los pesos para suprimir la dirección de rechazo aprendida durante el alineamiento. Se realizaron 30 ensayos y se seleccionó el ensayo 21 por presentar la menor divergencia KL entre los candidatos de Pareto que quedaban dentro de cinco puntos porcentuales de la tasa mínima de rechazo.

El proceso de cuantización se realizó tras la ablación, partiendo del checkpoint BF16 modificado. La variante NVFP4 es la más elaborada técnicamente: almacena 72 tensores de pesos feed-forward en NVFP4 con escalas por tensor, mientras que el resto de matrices permanece en Q8_0. Los tres archivos fueron probados con llama.cpp b12669 en Windows, con una pregunta en coreano sobre CPU y un prompt corto de generación de Python sobre una GPU RTX 5090 Laptop. El soporte de LFM3 en NVFP4 se incorporó a llama.cpp en la build b12088. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Reducción drástica de rechazos: la tasa de refusals medida con el scorer KeywordRate de Heretic pasó de 91/100 a 5/100 en el checkpoint BF16 previo a la cuantización.
- Despliegue en llama.cpp con soporte nativo de GGUF, incluida la ruta NVFP4 para GPUs compatibles.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Inferencia en CPU y GPU, con archivos de 1,10 GB (Q4_K_M), 1,28 GB (NVFP4) y 1,85 GB (Q8_0).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con el archivo Q4_K_M (1,10 GB) el modelo puede ejecutarse en CPU o en GPUs de gama media mediante llama.cpp, lo que permite desplegar un chatbot en un portátil sin conexión a servicios en la nube.
- Generación de código en entornos con recursos limitados: la model card confirma pruebas de generación de Python sobre una RTX 5090 Laptop con el archivo NVFP4, lo que lo hace apto para autocompletado o generación de scripts en estaciones de trabajo modestas.
- Aplicaciones en coreano: el modelo declara soporte de coreano y fue validado con una pregunta en ese idioma sobre CPU, por lo que sirve para prototipos de asistentes o herramientas de texto orientadas a ese mercado.
- Investigación sobre alineación y rechazos: al incluir métricas de refusals y divergencia KL antes y después de la ablación, es un caso de estudio útil para quienes investigan técnicas de supresión de rechazos y su coste en fidelidad de distribución.
- Evaluación de cuantizaciones NVFP4: la variante híbrida NVFP4/Q8_0 permite comparar calidad y rendimiento frente a Q8_0 y Q4_K_M en el mismo modelo, útil para pipelines de selección de cuantización.
- Prototipado rápido con llama.cpp: la disponibilidad de tres tamaños distintos en un mismo repositorio facilita cambiar de cuantización según las restricciones de memoria del entorno de desarrollo o producción.
- Filtrado y reescritura de texto sin restricciones excesivas: la reducción de rechazos declarada lo hace adecuado para tareas de edición o generación de contenido donde el modelo base tendería a negarse.

## Benchmarks y rendimiento

La model card solo publica la evaluación de rechazos de Heretic, no benchmarks estándar de calidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | LiquidAI original | Heretic trial 21 |
|---|---:|---:|
| Rechazos detectados por KeywordRate (100 prompts) | 91 / 100 | 5 / 100 |
| Divergencia KL del primer token en prompts benignos | 0 (referencia) | 0,2634 |

No se han publicado resultados de benchmarks de calidad en la información disponible. Las cifras de rechazos corresponden al checkpoint BF16 antes de la cuantización y se basan en un scorer de coincidencia de palabras clave, por lo que no equivalen a una evaluación semántica de seguridad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para Q4_K_M, 1,3 GB para NVFP4 y 1,9 GB para Q8_0, más el overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para Q4_K_M; la variante NVFP4 requiere soporte de esa ruta en llama.cpp (build b12088 o posterior) y se validó en una RTX 5090 Laptop.
- Cabe en GPUs de consumo: sí, en tarjetas de gama baja y media (por ejemplo, GTX 1650, RTX 3050, RTX 4060) e incluso en iGPUs con memoria unificada suficiente.
- Despliegue: llama.cpp (build b12669 probada por el autor), con compatibilidad declarada de endpoints; no se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. Solo se indica que las pruebas fueron correctas con una pregunta en coreano en CPU y un prompt corto de Python en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| RoundRobin237/LFM3-1.7B-heretic-GGUF | 1,73 B | No disponible | LFM Open License v1.0 | GGUF (Q8_0, Q4_K_M, NVFP4) | Ablación de rechazos con métricas publicadas |
| LiquidAI/LFM3-1.7B | 1,73 B | No disponible | LFM Open License v1.0 | Safetensors (BF16) | Modelo base sin modificar; 91/100 rechazos en la evaluación de Heretic |
| Alternativas de ~1-2 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría (por ejemplo, otras familias de 1-2 B parámetros) en parámetros, contexto y rendimiento. La comparación más directa y documentada es con el modelo base LiquidAI/LFM3-1.7B.

## Limitaciones y advertencias

- La ablación de rechazos elimina en gran medida la capacidad del modelo de negarse ante peticiones dañinas; el propio autor advierte de que algunos prompts individuales todavía pueden recibir rechazos, pero el comportamiento de seguridad está sustancialmente degradado.
- La evaluación de rechazos usa un scorer de coincidencia de palabras clave sobre 100 prompts, no una evaluación semántica ni de seguridad integral; las cifras no deben interpretarse como una garantía de comportamiento.
- La divergencia KL de 0,2634 en el primer token sobre prompts benignos indica que la distribución del modelo se ha desplazado respecto al original, con posible degradación de calidad en algunas tareas.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en un modelo de 1,7 B parámetros, especialmente en tareas de conocimiento factual.
- Idiomas limitados a inglés y coreano; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Licencia LFM Open License v1.0: impone restricciones de uso comercial que deben verificarse en el archivo LICENSE antes de desplegar el modelo en producción.
- La variante NVFP4 depende de soporte específico en llama.cpp (b12088 o posterior); en versiones anteriores o en otros runtimes puede no cargar correctamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados declarados.
- No se documentan la longitud de contexto ni el comportamiento en conversaciones multi-turno largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revisión concreta del modelo base usada: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/1da06bec6a819da10b54c67e5c90972b46d81871
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic/tree/aecd4a845a23be3f96ddc03b37b53a9195ee2566
- Pull request de soporte NVFP4 para LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31608
- Archivo Q8_0: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/resolve/main/LFM3-1.7B-Heretic-Q8_0.gguf
- Archivo Q4_K_M: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/resolve/main/LFM3-1.7B-Heretic-Q4_K_M.gguf
- Archivo NVFP4: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/resolve/main/LFM3-1.7B-Heretic-NVFP4.gguf
- Licencia LFM Open License v1.0: https://huggingface.co/RoundRobin237/LFM3-1.7B-heretic-GGUF-Q8-Q4-NVFP4/blob/main/LICENSE
