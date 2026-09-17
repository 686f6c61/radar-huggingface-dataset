# Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q6_K-GGUF

## Resumen

Qwen3.8-27B-Atlassian-Q6_K-GGUF es una cuantización GGUF en Q6_K de un ajuste fino (adapter v0.5) sobre los pesos base de Qwen/Qwen3.8-27B, publicado por Mihai-LeanZero dentro de la familia de modelos Atlassian de LeanZero. El modelo está especializado en el ecosistema de Atlassian: Forge, Jira, Confluence y Jira Service Management (JSM), y se entrenó con aplicaciones Forge, documentación oficial de Atlassian, especificaciones OpenAPI y respuestas de la comunidad. El problema que resuelve es concreto: generar código de apps Forge que compile contra los tipos reales y manifiestos válidos, además de responder con precisión sobre identificadores y APIs de la plataforma.

El modelo conserva la cabeza de decodificación especulativa MTP (multi-token prediction) dentro del propio fichero GGUF, algo poco habitual en publicaciones cuantizadas, y está pensado para runtimes basados en llama.cpp (llama-server, LM Studio con motor GGUF y Ollama). El repositorio ocupa 22,4 GB y declara 27.320.697.856 parámetros totales (unos 27,3 B). La licencia es apache-2.0 y el único idioma declarado es el inglés.

Su relevancia ahora es doble: por un lado, es un ejemplo de ajuste vertical sobre documentación técnica propietaria con métricas de validación publicadas en cadena (bf16 mezclado frente al adapter MLX, GGUF bf16 frente a mlx-lm y Q6_K frente al GGUF bf16 mediante divergencia KL); por otro, documenta explícitamente los límites de servir una arquitectura híbrida en llama.cpp, incluyendo un defecto de caché de estado recurrente que afecta al tiempo hasta el primer token en conversaciones multi-turno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (la model card menciona "arquitectura híbrida" y caché de estado recurrente; no se detalla más) con cabeza MTP de decodificación especulativa |
| Parámetros totales | 27.320.697.856 (≈27,3 B) |
| Parámetros activos | No disponible (no se declara como MoE) |
| Longitud de contexto | No disponible como cifra oficial; el ejemplo de ejecución del autor usa `-c 40960` (40.960 tokens) |
| Tipos de cuantización | Q6_K (este repositorio) y Q8_0 (usado en las mediciones); los GGUF de clase Q4 no se publican porque pierden la ganancia medida en apps |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con tensores del borrador MTP incluidos |

## Arquitectura y entrenamiento

El punto de partida es un adapter v0.5 de LeanZero que se fusionó sobre los pesos bf16 originales de Qwen/Qwen3.8-27B (no sobre la base MLX de 8 bits), afectando a 176 módulos. El modelo resultante se convirtió a GGUF con el convertidor de llama.cpp de forma sin pérdida, conservando los tensores del borrador MTP que habilitan la decodificación especulativa con `--spec-type draft-mtp`. Los datos de entrenamiento declarados son apps Forge, documentación de Atlassian, especificaciones OpenAPI y respuestas de la comunidad; no se indica el número de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO. Sí se indica que se entrenó con `reasoning_effort=medium` y `preserve_thinking=false`.

La validación se plantea como una cadena de tres eslabones medidos, cada uno con la herramienta capaz de medirlo. Primero, el bf16 fusionado reproduce la salida greedy de la base MLX más el adapter en 16 de 20 prompts, con una fracción de prefijo común media de 0,89. Segundo, el GGUF bf16 iguala al bf16 fusionado entre runtimes: las continuaciones greedy de llama.cpp coinciden con mlx-lm en 17 de 20 prompts renderizados idénticos, con prefijo común medio de 0,94. Tercero, el Q6_K se mide contra los logits del propio GGUF bf16 con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 2048 tokens de texto Atlassian reservado: KLD media 0,00306, máxima 6,626617 y mismo token top-1 en el 98,5 % de los casos (el fichero Q8_0 dio 0,000842).

## Capacidades

- Generación de código para Atlassian Forge: produce apps que compilan contra los tipos reales y manifiestos válidos (28,7 de 35 apps y 30,3 de 35 manifiestos en la batería de 35 briefs, con la media de 3 muestras y thinking desactivado).
- Conocimiento de producto Atlassian: Jira, Confluence, Jira Service Management y Forge, incluyendo APIs descritas en las especificaciones OpenAPI usadas en el entrenamiento.
- Recuperación de identificadores y nombres de paquetes con thinking activado: 85 % en el corte anterior a 2026 y 15 % en el corte posterior a abril.
- Modo de razonamiento ("thinking") con conmutador explícito: `chat_template_kwargs.enable_thinking=false` se respeta en esta build (no emite razonamiento y nombra el módulo correcto); con `--reasoning-budget 0` se desactiva en llama-server y con `--reasoning-format deepseek` la respuesta incluye `reasoning_content`.
- Decodificación especulativa mediante cabeza MTP integrada en el fichero, con tasa de aceptación medida de 0,629 en respuestas largas de apps.
- Uso conversacional multi-turno (etiqueta `conversational`) y compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no disponibles; el modelo solo declara inglés.
- No hay evidencia en la información disponible de capacidades de visión, audio, tool calling o uso como agente autónomo.

## Casos de uso

- Generación de apps Forge en un pipeline interno: el modelo escribe el código de la app y su manifiesto contra los tipos reales de la plataforma, lo que permite usarlo como primer paso de un flujo de scaffolding con revisión humana antes del despliegue en Forge.
- Asistente de documentación para equipos de Jira y Confluence: responde sobre APIs, módulos y configuración usando el corpus de documentación y respuestas de comunidad con el que se entrenó, con la ventana de hasta 40.960 tokens del ejemplo de despliegue para inyectar contexto largo.
- Migraciones de Atlassian (servicio que el propio autor ofrece): apoyo en la traducción de configuraciones y scripts entre instancias, aprovechando el conocimiento de JSM y de los esquemas OpenAPI.
- Soporte interno en modo instrucción: con `temperature 0.7`, `top_p 0.8`, `top_k 20` y `presence penalty 1.5`, para consultas de operación sobre Jira Service Management sin necesidad de emitir cadena de razonamiento.
- Resolución de dudas técnicas con razonamiento activado: con `temperature 1.0`, `top_p 0.95`, `top_k 20` para preguntas que requieren seguir varios pasos sobre identificadores y APIs conocidas (la precisión cae drásticamente en el corte posterior a abril).
- Integración en IDE o editor local vía LM Studio u Ollama: al ser un GGUF de 22,4 GB con motor llama.cpp, encaja en estaciones de trabajo de un solo usuario para autocompletado y generación de código Forge sin salida a la nube.
- Aceleración de respuestas largas en Apple Silicon: activando `--spec-type draft-mtp` sobre Metal, la tasa de decodificación en ejecuciones largas sube de 20,4 a 24,2 tokens/s en un M3 Ultra, útil para generar respuestas extensas de código.

## Benchmarks y rendimiento

| Evaluación | Este modelo (Q6_K, llama.cpp) | Q8_0 / MLX equivalentes | Notas |
|---|---|---|---|
| Apps que compilan (35 briefs, media de 3 muestras, thinking off) | 28,7 de 35 | MLX del mismo adapter: 30,0 de 35; predecesor v0.4: 22,7 de 35 | Los recuentos de una sola pasada varían en torno a 3 de 35 entre ejecuciones |
| Manifiestos válidos (mismos briefs) | 30,3 de 35 | MLX del mismo adapter: 31,3 de 35; predecesor v0.4: 30,7 de 35 | — |
| Recuerdo de identificadores, thinking on | 85 % (corte pre-2026) / 15 % (corte post-abril) | MLX: 85 % / 15 % | Medido sobre el fichero Q8_0 a través de llama-server |
| Bucles en batería de 40 prompts (think_official) | 0 bucles; no terminación 32 % | — | — |
| Bucles (think_t06) | 0 bucles; no terminación 32 % | — | — |
| Bucles (greedy) | 1 bucle; no terminación 32 % | — | — |
| Bucles (instruct_nopenalty) | 0 bucles; no terminación 12 % | — | — |
| Divergencia KL frente al GGUF bf16 (40 fragmentos de 2048 tokens) | Media 0,00306; máxima 6,626617; mismo top-1 98,5 % | Q8_0: 0,000842 | Mide fidelidad de la cuantización, no calidad de la tarea |
| Decodificación especulativa (Metal, M3 Ultra, ejecuciones largas) | 24,2 tokens/s con borrador (aceptación 0,629) | 20,4 tokens/s sin borrador | Un solo flujo |
| Prueba greedy de 5 prompts, 256 tokens máx., temp 0 | 19,6 tokens/s con `draft-mtp` | 20,9 tokens/s sin MTP | La cabeza MTP no aporta ganancia en respuestas cortas |
| Servicio por lotes | ≈9 tokens/s por flujo con 4 concurrentes | — | Limitación de la arquitectura híbrida en llama.cpp |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- Peso del fichero: el repositorio ocupa 22,4 GB, correspondientes al GGUF Q6_K (y artefactos asociados). Estimación a partir de ese tamaño: se necesitan del orden de 22-24 GB solo para los pesos, más la caché KV correspondiente al contexto configurado (el ejemplo del autor usa 40.960 tokens).
- Apple Silicon: el autor publica mediciones sobre un M3 Ultra con Metal, con 24,2 tokens/s en un solo flujo con la cabeza MTP y 20,4 tokens/s sin ella.
- CUDA: no disponible. La model card indica que las cifras publicadas de MTP para esta familia son de CUDA, pero no aporta números propios para esa plataforma.
- GPU de consumo: no se confirma en la información disponible; con 22,4 GB de pesos, una GPU de 24 GB quedaría muy al límite y no se documenta ninguna prueba en ese hardware.
- Despliegue: llama.cpp (build b10330 o posterior) mediante `llama-server -m Qwen3.8-27B-Atlassian-Q6_K.gguf -ngl 99 -c 40960 --jinja --spec-type draft-mtp`; LM Studio con el motor GGUF de llama.cpp; Ollama mediante un Modelfile con `FROM ./Qwen3.8-27B-Atlassian-Q6_K.gguf` y `ollama create`.
- Rendimiento: aproximadamente 9 tokens/s por flujo con 4 peticiones concurrentes; el autor recomienda tratarlo como artefacto de un solo usuario y usar la release MLX para enjambres multiagente.
- El defecto de caché de estado recurrente (issue upstream 20225) puede provocar el reprocesamiento completo del prompt en cada turno, de modo que el tiempo hasta el primer token crece con la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Apps válidas (35) | Manifiestos (35) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-Q6_K-GGUF (este) | 27,3 B | GGUF Q6_K | 28,7 | 30,3 | apache-2.0 | Repositorio GGUF para llama.cpp, LM Studio y Ollama |
| Qwen3.8-27B-Atlassian-Q8-mlx (mismo adapter v0.5) | 27,3 B (base) | MLX 8 bits | 30,0 | 31,3 | No disponible en la información | Release MLX, enlazada en la sección Family |
| Predecesor v0.4 del adapter | 27,3 B (base) | No disponible | 22,7 | 30,7 | No disponible | No disponible |
| Qwen/Qwen3.8-27B (modelo base) | 27,3 B | bf16 (safetensors) | No disponible | No disponible | No disponible | HuggingFace (referenciado como `base_model`) |

No se dispone de datos de otros ajustes verticales comparables en la información proporcionada.

## Limitaciones y advertencias

- Corte temporal de conocimiento: la recuperación de identificadores cae al 15 % en las 13 preguntas sobre versiones mayores actuales de paquetes Forge posteriores a abril; el propio autor advierte de que no se le pregunte qué versión mayor de un paquete Forge está vigente.
- Riesgo de no terminación: entre el 12 % y el 32 % de los prompts de la batería de bucles no terminan según la configuración empleada, con hasta 1 bucle en 40 en modo greedy.
- Throughput por lotes bajo: la arquitectura híbrida rinde muy por debajo de los modelos densos en llama.cpp (issue upstream 20006); no es adecuado para servicio concurrente multiusuario ni para enjambres de agentes.
- Defecto de caché de estado recurrente (issue upstream 20225): puede reprocesar el prompt completo en cada turno, degradando el time-to-first-token en conversaciones largas.
- Cuantizaciones Q4 no publicadas: según la calibración del autor (2026-09-05), pierden la ganancia medida en generación de apps, por lo que no hay una opción de menor huella de memoria validada.
- Idioma: solo inglés declarado; no hay datos de rendimiento en castellano ni en otros idiomas.
- Volatilidad de las métricas: los recuentos de apps de una sola pasada varían en torno a 3 de 35 entre ejecuciones; solo la media de 3 muestras es representativa.
- Las cifras de esta ficha se midieron con llama.cpp sobre el fichero Q6_K y solo son comparables con las de la release MLX a través de la cadena de tres eslabones descrita, nunca de forma directa.
- Licencia apache-2.0 para este repositorio, pero no se detalla en la información disponible la licencia ni las condiciones del modelo base Qwen/Qwen3.8-27B; conviene verificarlas antes de un uso comercial.
- Sesgos conocidos: no disponibles.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de uso en producción por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q6_K-GGUF
- Página de la familia Atlassian de LeanZero (write-up completo y evidencia de cada ronda): https://leanzero.net/portfolio/atlassian-models
- Sitio del autor: https://leanzero.net
- Repo MLX del mismo adapter (enlazado bajo "Family" en la model card): URL no disponible en la información proporcionada
- Modelo base: Qwen/Qwen3.8-27B (URL de HuggingFace no incluida en la información proporcionada)
- Issues upstream citadas por el autor: llama.cpp issue 20006 (throughput por lotes en arquitecturas híbridas) y issue 20225 (defecto de caché de estado recurrente); enlaces directos no disponibles
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido musical y de traducción), por lo que no se han incorporado enlaces adicionales.
