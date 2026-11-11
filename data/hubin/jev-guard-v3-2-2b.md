# hubin/jev-guard-v3.2-2b

## Resumen

Jev Guard v3.2 · 2B es un clasificador de seguridad para agentes basado en un adaptador LoRA de rango 8 sobre el modelo Qwen/Qwen3.5-2B. Lo desarrolla Wenbin Hu (HKUST en colaboración con ModeIO) y su función no es generar texto, sino revisar cada paso de un agente: enrutar una petición del usuario o una acción de herramienta propuesta a través de un árbol de políticas editable (contenido, ciberseguridad, privacidad y cumplimiento) y clasificar su seguridad y categoría antes de que el arnés de ejecución continúe.

El modelo resuelve el problema del filtrado previo en pipelines agénticos: una petición bloqueada nunca llega al modelo asistente y una acción de herramienta bloqueada nunca se ejecuta, dejando rastro de la interceptación en la conversación. El paquete incluye el adaptador, cabezas tipadas, el árbol de enrutamiento y código de inferencia independiente; los pesos base de Qwen deben descargarse por separado.

Es relevante por su enfoque de política jerárquica editable y por su contexto de 16.384 tokens, que permite evaluar propuestas de acción con historial adjunto. El autor reporta 93,20 % de precisión de enrutamiento de ruta completa, 91,78 % de precisión de seguridad global y 58,0 ms de latencia media de forward nativo. La licencia es de tipo research-preview, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen/Qwen3.5-2B) con adaptador LoRA de rango 8 en proyecciones de atención del backbone de lenguaje; cabezas tipadas de clasificación |
| Parametros totales | 2B (modelo base) + adaptador LoRA de rango 8 (tamaño exacto del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens; las peticiones de servicio que lo exceden se rechazan |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | research-preview (license: other; ver LICENSE-NOTICE.md) |
| Formato de pesos | safetensors (adaptador PEFT); pesos base de Qwen descargados por separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y aplica un adaptador LoRA de rango 8 sobre las proyecciones de atención del backbone de lenguaje. Sobre esa representación se montan varias cabezas de clasificación: softmax condicionada por candidato para enrutamiento y elección única, sigmoides independientes por candidato para categorías multietiqueta, una cabeza lineal de dos clases para seguridad (`unsafe`/`safe`) y una puntuación ordinal de severidad con tres umbrales aprendidos ordenados. El checkpoint v3.2 es una continuación de v3.1, con la actualización 1.508 seleccionada tras una época.

El entrenamiento usa 377.930 casos de tarea nativos más 8.000 casos de router, con ejemplos retenidos de GSPR3 y Omni y fuentes de ciberseguridad y privacidad. Las tareas de código conservan funciones fuente completas de PrimeVul/DiverseVul; el resto cubre phishing, inyección de prompts, severidad y causa raíz de vulnerabilidades, asistencia de seguridad acotada, prácticas de política de privacidad, flujo de información y cumplimiento. v3.2 unifica las taxonomías hoja en inglés, fusiona las ramas de contenido y privacidad, elimina la rama de agente y aplica máscaras de categoría (etiquetas desconocidas ignoradas, etiquetas débiles de reglas con peso 0,25). La continuación usa batch global 256, microbatch máximo 32, 65.536 tokens con padding por GPU, semilla 42, LR del adaptador 2e-5 y LR de cabezas 5e-5 sobre cuatro GPUs; no se estableció un plateau de validación en esa única época.

## Capacidades

- Clasificación de seguridad binaria (`unsafe`/`safe`) sobre peticiones de usuario y acciones de herramienta propuestas.
- Enrutamiento jerárquico desde la raíz hasta una hoja de un árbol de políticas editable, con precisión de ruta completa del 93,20 %.
- Clasificación multietiqueta de categorías mediante sigmoides independientes por candidato.
- Puntuación ordinal de severidad con umbrales aprendidos.
- Taxonomías específicas por dominio: contenido, ciberseguridad, privacidad y cumplimiento.
- Detección de inyección de prompts, phishing y asistencia de seguridad acotada.
- Análisis de prácticas de política de privacidad y flujo de información.
- Evaluación de severidad y causa raíz de vulnerabilidades (CWE) sobre código fuente completo.
- Soporte bilingüe inglés-chino.
- No genera justificaciones ni texto libre: es un clasificador, no un modelo conversacional.
- No soporta tool calling propio ni razonamiento multi-paso generativo; su rol es el de guardián previo al arnés.

## Casos de uso

- Interceptación previa en agentes de código: antes de que un agente ejecute un parche o un comando, Jev Guard clasifica la acción propuesta contra la rama de ciberseguridad del árbol de políticas; si la marca como insegura, la acción no se ejecuta y queda registrada en la conversación.
- Filtrado de peticiones de usuario en asistentes desplegados: la petición se enruta desde la raíz del árbol y se clasifica antes de alcanzar el modelo asistente, de modo que las solicitudes bloqueadas nunca consumen contexto ni capacidad del modelo principal.
- Cumplimiento normativo en flujos de datos: la rama de privacidad y cumplimiento permite revisar prácticas de política de privacidad y flujo de información, con una precisión de seguridad reportada del 82,92 % en privacidad y 95,31 % en cumplimiento.
- Revisión de propuestas de herramientas en entornos con API sensibles: el replay controlado sobre AgentDojo reportó la captura de 49 de 52 propuestas maliciosas y la autorización de 87 de 97 propuestas benignas, lo que lo hace apto como capa de preautorización con revisión humana de las denegaciones.
- Triaje de vulnerabilidades en pipelines de análisis estático: al retener funciones fuente completas de PrimeVul/DiverseVul, puede clasificar severidad y causa raíz (CWE) de hallazgos antes de escalarlos a un equipo de seguridad.
- Moderación de contenido bilingüe inglés-chino en plataformas comunitarias: el clasificador cubre la rama de contenido con una precisión de seguridad del 85,20 %, útil como primer filtro con revisión humana posterior.
- Auditoría de decisiones de política: al ser un árbol editable, los equipos de compliance pueden ajustar descripciones de enrutamiento, taxonomías hoja y reglas de revisión sin reentrenar el modelo, y conservar la trazabilidad de cada decisión.

## Benchmarks y rendimiento

| Dominio | Registros de tarea | Registros con etiqueta de seguridad | Precisión de seguridad | Micro-F1 de categoría |
|---|---:|---:|---:|---:|
| Contenido | 11.909 | 11.909 | 85,20 % | 61,86 % |
| Ciberseguridad | 61.972 | 57.478 | 93,77 % | 46,96 % |
| Privacidad | 69.051 | 5.889 | 82,92 % | 78,40 % |
| Cumplimiento | 4.711 | 4.711 | 95,31 % | 58,17 % |

Métricas globales reportadas por el autor:

| Métrica | Valor |
|---|---|
| Precisión de enrutamiento de ruta completa | 93,20 % (932/1.000) |
| Precisión de seguridad global | 91,78 % (73.415/79.987 registros supervisados) |
| Latencia media de forward nativo | 58,0 ms (media ponderada por caso sobre 147.643 registros) |
| Precisión exacta de severidad ordinal | 15,28 % (1.466 casos) |
| MAE normalizado de severidad | 0,1727 |
| Replay de acciones AgentDojo (maliciosas capturadas) | 49/52 |
| Replay de acciones AgentDojo (benignas permitidas) | 87/97 |

La evaluación nativa cubre 147.643 registros de tarea en 109 vistas de benchmark. La precisión de seguridad se calcula solo sobre registros con supervisión de seguridad y el micro-F1 de categoría solo sobre registros con supervisión de categoría; son registros de tarea, no necesariamente ejemplos de fuente independientes, y la precisión reportada es exactitud ordinaria, no balanceada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un backbone de 2B en precisión completa se sitúa en el rango de 5-8 GB, y en cuantizaciones de 8 o 4 bits puede bajar de 3 GB, aunque el autor no publica cifras ni tipos de cuantización.
- GPU recomendadas: no disponible; el entrenamiento se realizó sobre cuatro GPUs con 65.536 tokens con padding por GPU, sin especificar el modelo de GPU.
- Cabe en GPU de consumo: sí, por el tamaño del backbone (2B), aunque no hay validación publicada del adaptador en GPUs concretas.
- Opciones de despliegue: el paquete incluye código de inferencia independiente y cabezas tipadas; el servicio HTTPS alojado por el autor está fuera de línea desde el 2026-10-22 y debe autoalojarse. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia media de forward nativo de 58,0 ms ponderada por caso, excluyendo la secuencia completa de enrutamiento más revisión. El throughput no está disponible.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros guardrails o clasificadores de seguridad (por ejemplo, Llama Guard, ShieldGemma o NeMo Guardrails). Los datos disponibles no permiten establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia frente a alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jev Guard v3.2 · 2B | 2B + LoRA rango 8 | 16.384 | research-preview | Adaptador en Hugging Face; pesos base por separado |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un clasificador, no un modelo conversacional: no genera justificaciones ni texto libre, y una predicción de categoría o severidad no constituye una decisión de autorización.
- La precisión exacta de severidad ordinal es baja (15,28 %), por lo que la puntuación de severidad no debe usarse como criterio único.
- El micro-F1 de categoría en ciberseguridad es del 46,96 %, lo que indica un rendimiento limitado en la clasificación fina de categorías de ese dominio.
- La precisión reportada es exactitud ordinaria, no balanceada; con clases desbalanceadas puede ocultar un rendimiento desigual entre clases.
- Los resultados de AgentDojo son un replay controlado de estados de acción, no una evaluación de extremo a extremo de éxito de ataques.
- Solo soporta inglés y chino; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El contexto está limitado a 16.384 tokens y las peticiones que lo exceden se rechazan en el servicio.
- El servicio alojado del autor está fuera de línea; el despliegue requiere autoalojamiento.
- La licencia es research-preview con restricciones de uso comercial; las restricciones de licencia específicas de las fuentes de datos siguen aplicándose.
- El archivo de datos de entrenamiento es privado y no se publica el conjunto completo, lo que limita la reproducibilidad.
- No se estableció un plateau de validación en el entrenamiento de una época, lo que puede implicar que el checkpoint no esté completamente convergido.
- El entrenamiento y la evaluación multimodales nativos requieren los medios originales; el servicio es solo texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubin/jev-guard-v3.2-2b
- Sitio web del proyecto: https://hkust-knowcomp.github.io/jev-guardrail/
- Demo con subtítulos en inglés y chino: https://hkust-knowcomp.github.io/jev-guardrail/#hermes
- Aviso de licencia: https://huggingface.co/hubin/jev-guard-v3.2-2b/blob/main/LICENSE-NOTICE.md
- README en chino: README.zh-CN.md (en el repositorio del modelo)
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/hubin/jev-guard-training
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- ModeIO: https://www.modeio.ai/
