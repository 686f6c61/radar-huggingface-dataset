# DICPlay/RusMind-4.7-Momentum

## Resumen

RusMind 4.7 «Momentum» es un modelo de generación de texto publicado por DICPlay, un desarrollo orientado específicamente al idioma ruso y distribuido únicamente en formato GGUF para inferencia local (llama.cpp, LM Studio, Ollama, PocketPal) y en navegador a través de rusmind.ru. El modelo forma parte de la familia RusMind de nueva generación y se presenta como la variante más ligera de la gama 4.7, pensada para ejecutarse en portátiles, PC convencionales y teléfonos sin conexión a internet.

La ficha declara 4.647.450.147 parámetros totales (≈4,65 B) y aproximadamente 2 B de parámetros activos por token, lo que sitúa al modelo en la categoría de arquitecturas dispersas (tipo MoE) de bolsillo. Su propuesta de valor es competir en el benchmark ruso MERA v2 con modelos de 8 a 32 B de parámetros, apoyándose en un coste de inferencia muy bajo: los archivos publicados van de 2,5 GB (Lite) a 5,0 GB (Q8_0).

Es relevante ahora por dos motivos: la licencia y el formato permiten despliegue completamente offline en hardware de consumo, y el autor publica resultados en MERA v2, el ranking independiente gestionado por la Alianza de IA rusa (Sber, Yandex, MTS, VK), donde el modelo declara 0,136 de puntuación global. No obstante, el repositorio es muy reciente, con 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; el autor indica 4,6 B de parámetros totales y 2 B activos por respuesta, lo que implica un transformer disperso (tipo MoE) |
| Parametros totales | 4.647.450.147 (≈4,65 B) |
| Parametros activos | ≈2 B (dato del autor en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Lite (2,5 GB), Q4_K_M (3,4 GB), Q8_0 (5,0 GB); no se publican ficheros F16/BF16 ni safetensors |
| Idiomas soportados | Ruso (ru) e inglés (en); el autor menciona además comprensión de japonés con matices de cortesía, no listado en las etiquetas de idioma |
| Licencia | rusmind-license (campo `license: other`, con enlace a `LICENSE` en el repositorio) |
| Formato de pesos | GGUF (librería `gguf`, orientado a llama.cpp) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna ni el proceso de entrenamiento. Los únicos datos técnicos publicados son el recuento de parámetros (4,65 B totales) y la afirmación de que en cada respuesta se activan unos 2 B, patrón característico de un transformer con mezcla de expertos o algún otro esquema de activación dispersa. Tampoco se especifica la longitud de contexto soportada, el tokenizador, la composición del corpus de entrenamiento ni si se aplicaron fases de ajuste supervisado, RLHF o DPO.

Como innovaciones declaradas, el autor destaca mejoras respecto a Momentum 4.6.5 (+5 % en el cómputo global de MERA v2, +37 % frente a la «modelo abierto original del mismo tamaño» sobre la que se construye) en razonamiento, seguimiento de instrucciones múltiples, conocimiento de cultura e historia de Rusia, puntuación y ortografía del ruso, y comprensión de caracteres, humor y enantiosemia. No se aporta información sobre técnica de decodificación, atención lineal, decodificación especulativa ni estrategia de cuantización más allá de los tres ficheros publicados.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés, con etiqueta `conversational` en el repositorio.
- Razonamiento y tareas lógicas: el autor reporta 0,247 en la sección de razonamiento de MERA v2 y el doble de precisión que T-lite en tareas lógicas.
- Conocimiento factual sobre Rusia: cultura, regiones, eventos históricos, fechas y personalidades (0,221 en la sección «cultura y regiones» de MERA v2).
- Corrección ortográfica y puntuación en ruso: 0,623 en corrección ortográfica y 0,725 en inserción de signos de puntuación (tareas SAGE).
- Comprensión humanocéntrica: interpretación de personajes, humor y palabras con significados opuestos (enantiosemia), con 0,431 en «Characters» y 0,166 en «Enantiosemy».
- Llamada a herramientas y funciones: se evalúa en GorillaHard con 0,150, lo que confirma soporte de tool calling aunque con margen de mejora.
- Generación de código y razonamiento técnico estable según la evaluación citada del canal japonés Future Craft Lab.
- Comprensión de japonés con matices de cortesía (declaración del autor, fuera de las etiquetas oficiales de idioma).
- Ejecución 100 % local y offline en navegador, teléfono y PC mediante GGUF.

## Casos de uso

- Asistentes de atención al cliente en ruso sobre infraestructura propia: al ejecutarse con llama.cpp u Ollama en CPU o GPU modesta, permite desplegar atención multi-turno sin coste por token y sin enviar datos a terceros, algo crítico para cumplimiento de protección de datos.
- Corrección y normalización de textos rusos en pipelines editoriales: los 0,725 y 0,623 obtenidos en puntuación y ortografía (SAGE) lo hacen adecuado como paso previo de limpieza antes de indexar documentos en un buscador interno.
- Chatbot de personajes o ficción interactiva: la puntuación en «Characters» (0,431, ×1,8 frente a A-Vibe) respalda el mantenimiento de voces y registros consistentes en narrativa o videojuegos.
- Asistente de escritorio offline para entornos sin conectividad (campo, plantas industriales, administraciones aisladas): el fichero Q4_K_M de 3,4 GB cabe en un portátil estándar y funciona sin red.
- Enriquecimiento de conocimiento sobre Rusia en herramientas de análisis de mercado o periodismo: su sección de cultura y regiones (0,221) permite clasificar y contextualizar textos regionales con conocimiento local.
- Prototipado de agentes con tool calling: la puntuación GorillaHard (0,150) permite construir flujos de llamada a funciones simples, con verificación humana en los casos de mayor complejidad.
- Aplicación móvil de traducción y asistencia ru-en: los dos idiomas soportados y su tamaño Lite (2,5 GB) permiten empaquetarlo con PocketPal o integraciones WebGPU en un teléfono de gama alta.
- Evaluación comparativa de modelos pequeños para investigadores: sirve como referencia de un MoE ruso de 2 B activos frente a alternativas densas de 4 a 8 B en MERA v2.

## Benchmarks y rendimiento

Datos declarados por el autor, procedentes del ranking MERA v2 (octubre de 2026). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks internacionales en la información disponible.

Puntuación global MERA v2:

| Modelo | Parametros activos | MERA v2 global |
|---|---|---|
| RusMind Momentum 4.7 | ≈2 B | 0,136 |
| RuadaptQwen3-8B | 8 B | 0,134 |
| T-lite (T-Bank) | 8 B | 0,130 |
| LFM2.5 (Liquid AI) | 2,6 B | 0,120 |
| A-Vibe (Avito) | 8 B | 0,113 |

Sección de razonamiento:

| Modelo | Parametros activos | MERA v2 razonamiento |
|---|---|---|
| RusMind Momentum 4.7 | ≈2 B | 0,247 |
| RuadaptQwen3-8B | 8 B | 0,231 |
| Zero-Mistral-Small | 24 B | 0,229 |
| T-lite (T-Bank) | 8 B | 0,218 |
| A-Vibe (Avito) | 8 B | 0,187 |

Desglose por secciones y comparación con modelos de tamaño similar:

| Seccion MERA v2 | RusMind Momentum | A-Vibe (8 B) | Gemma 4 E2B (5 B) | Qwen3.5-4B (4 B) |
|---|---|---|---|---|
| Global | 0,136 | 0,113 | 0,099 | 0,093 |
| Cultura y regiones de Rusia | 0,221 | 0,171 | 0,139 | 0,057 |
| Razonamiento | 0,247 | 0,187 | 0,227 | 0,217 |
| Tareas humanocéntricas | 0,148 | 0,132 | 0,091 | 0,091 |

Tareas concretas:

| Tarea | RusMind Momentum | A-Vibe | Gemma 4 E2B |
|---|---|---|---|
| Puntuación (SAGE) | 0,725 | 0,648 | 0,159 |
| Corrección ortográfica (SAGE) | 0,623 | 0,545 | 0,547 |
| Respuestas como personaje (Characters) | 0,431 | 0,245 | 0,275 |
| Enantiosemia | 0,166 | 0,067 | 0,085 |
| Humor | 0,092 | 0,037 | 0,037 |
| Referencia de palabra en texto (LIMUR) | 0,333 | 0,284 | 0,312 |
| Opción múltiple (RUBIN) | 0,281 | 0,207 | 0,249 |
| Llamada de herramientas (GorillaHard) | 0,150 | 0,148 | 0,055 |

## Requisitos de hardware

- VRAM/RAM estimada a partir del tamaño de los ficheros (no publicada por el autor): Lite ≈2,5-3,5 GB; Q4_K_M ≈4-5 GB; Q8_0 ≈6-7 GB, incluyendo overhead de contexto y caché KV.
- GPU de consumo: cualquiera con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) ejecuta Q4_K_M con holgura y Q8_0 con contexto moderado; una RTX 4090 o A100 no aportan ventaja relevante por el reducido tamaño del modelo.
- Inferencia solo en CPU viable: con 2 B de parámetros activos el modelo está diseñado para portátiles y teléfonos; un equipo con 8 GB de RAM puede ejecutar Q4_K_M.
- Móvil: el fichero Lite de 2,5 GB está pensado para este escenario; el autor cita PocketPal y el propio rusmind.ru como vías de ejecución.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -cnv`), LM Studio, Ollama, PocketPal y cualquier runtime compatible con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`, aunque no se documenta soporte oficial de vLLM o TGI (no disponible).
- Navegador: ejecución vía rusmind.ru con descarga única del modelo y funcionamiento posterior sin conexión.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni requisitos de contexto.

## Comparativa con modelos similares

| Modelo | Parametros (activos) | Contexto | MERA v2 global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Momentum 4.7 | 4,65 B (≈2 B) | No disponible | 0,136 | rusmind-license (other) | GGUF en HuggingFace, web oficial |
| RuadaptQwen3-8B | 8 B (denso) | No disponible | 0,134 | No disponible en esta ficha | No disponible en esta ficha |
| T-lite (T-Bank) | 8 B (denso) | No disponible | 0,130 | No disponible en esta ficha | No disponible en esta ficha |
| LFM2.5 (Liquid AI) | 2,6 B (denso) | No disponible | 0,120 | No disponible en esta ficha | No disponible en esta ficha |
| A-Vibe (Avito) | 8 B (denso) | No disponible | 0,113 | No disponible en esta ficha | No disponible en esta ficha |
| Gemma 4 E2B (Google) | 5 B (activos no indicados) | No disponible | 0,099 | No disponible en esta ficha | No disponible en esta ficha |

La comparación se limita al benchmark ruso MERA v2 aportado por el autor: no hay datos públicos de contexto, licencia o benchmarks internacionales de los modelos alternativos en la información disponible, y las cifras de RusMind no han sido replicadas por terceros.

## Limitaciones y advertencias

- Modelo centrado en ruso: aunque declara inglés, el entrenamiento y la evaluación están sesgados hacia el ruso; el rendimiento en castellano o en otros idiomas no está documentado y previsiblemente será bajo.
- No se publica la longitud de contexto, dato crítico para planificar aplicaciones de documentos largos o conversaciones extensas.
- No se publica información sobre datos de entrenamiento, número de tokens, composición del corpus ni fases de alineación (RLHF/DPO), lo que impide evaluar procedencia, sesgos y riesgos de contaminación.
- Licencia `rusmind-license` con `license: other`: las condiciones de uso comercial no están detalladas en la información disponible; es obligatorio revisar el fichero `LICENSE` antes de cualquier despliegue en producción.
- Riesgo de alucinación estándar en modelos de 2 B activos: el conocimiento factual fuera del dominio ruso será limitado y poco fiable; las tareas de recuperación de hechos deben complementarse con RAG.
- Las puntuaciones de MERA v2 son aportadas por el propio autor y no se han verificado de forma independiente en el momento de la consulta; el repositorio registra 0 descargas y 1 like.
- El rendimiento en tool calling es bajo en términos absolutos (0,150 en GorillaHard), apto solo para flujos simples supervisados.
- La model card disponible está truncada, por lo que pueden faltar secciones relevantes (contexto, detalles de entrenamiento, condiciones de uso) que el autor sí haya publicado en el repositorio.
- El autor menciona capacidades en japonés que no están reflejadas en las etiquetas oficiales de idioma (ru, en); conviene tratarlas como no garantizadas.
- Fechas de creación y actualización del repositorio (22 y 23 de octubre de 2026) indican una publicación muy reciente, sin historial de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- Fichero Lite (2,5 GB): https://huggingface.co/DICPlay/RusMind-4.7-Momentum/blob/main/RusMind-Momentum-4.7-Lite.gguf
- Fichero Q4_K_M (3,4 GB): https://huggingface.co/DICPlay/RusMind-4.7-Momentum/blob/main/RusMind-Momentum-4.7-Q4_K_M.gguf
- Fichero Q8_0 (5,0 GB): https://huggingface.co/DICPlay/RusMind-4.7-Momentum/blob/main/RusMind-Momentum-4.7-Q8_0.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-4.7-Momentum/blob/main/LICENSE
- Demo y ejecución en navegador: https://rusmind.ru
- Ranking MERA v2: https://mera.a-ai.ru/ru/text/leaderboard

No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs técnicos o repositorios de terceros) sobre este modelo.
