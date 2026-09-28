# dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e

## Resumen

CyberTiel es una cuantización de 4 bits en formato MLX de un modelo de mezcla de expertos (MoE) de 35.107.181.936 parámetros totales y aproximadamente 3B activos, derivado de la familia Qwen3.5 MoE. Su cadena de procedencia es: Ornith-1.5-35B-A3B (ornith-ai), versionado como abliterado por huihui-ai (Huihui-Ornith-1.5-35B-A3B-abliterated), recuantizado por peculiar-ragdoll con el cuantizador oQ4e de oMLX sobre un corpus de calibración propio orientado a ciberseguridad, y con la plantilla de chat Sharp incrustada en el checkpoint. El repositorio consultado se publica bajo la cuenta dopaemon, pero la model card y los repositorios enlazados corresponden al autor original.

El modelo está especializado en programación agéntica y trabajo de seguridad ofensiva. Según su model card, resuelve alrededor de un 70% más de problemas reales de código que Ornith-1.5 y Qwen3.6-35B-A3B en SWE-bench-Live, y captura 15 de 43 flags (35%) en Cybench sin guía alguna. Es además un modelo abliterado: no emite rechazos (0% en 84 peticiones de HarmBench), lo que lo hace útil para investigación ofensiva y red teaming, y arriesgado para cualquier despliegue sin supervisión ni sandbox.

Su relevancia actual es de nicho pero clara: es una de las primeras alternativas sin censura en la clase 35B-A3B a 4 bits, con un peso de repositorio de 21,1 GB que cabe en equipos Apple Silicon con memoria unificada amplia, y con licencia MIT declarada. La contrapartida es que sacrifica conocimiento general del mundo (MMLU-Pro) a cambio de velocidad y capacidad de código, y que las cifras publicadas se midieron sobre la build GGUF, no sobre este fichero MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, familia Qwen3.5 MoE (tags `qwen3_5_moe`, `qwen35moe`, `moe`) |
| Parámetros totales | 35.107.181.936 (≈35,1B) |
| Parámetros activos | ≈3B (según la nomenclatura A3B del nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Este fichero: oQ4e (4 bits, cuantizador oQ de oMLX con imatrix y calibración propia). Build hermana oQ6e (6 bits, ≈30 GB). Escalera GGUF de Q2 a Q8 con vision, y tier UD-Q4_K_M usado para los benchmarks |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); existe build GGUF en repositorio aparte |
| Modalidad | image-text-to-text (soporte de vision; tag `vision`) |
| Tamaño del repositorio | 21,1 GB |
| Modelo base | huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (relación: cuantizado) |
| Plantilla de chat | Sharp, incrustada en el checkpoint |
| Head MTP | no incluido en este fichero (existe una build `-MTP` separada) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos de la familia Qwen3.5 MoE, con 35.107.181.936 parámetros totales y aproximadamente 3B activos por token, lo que explica su relación velocidad/capacidad frente a modelos densos del mismo orden de tamaño. Sobre los pesos originales de Ornith-1.5-35B-A3B, huihui-ai aplicó una abliteración (eliminación de la dirección de rechazo en el espacio de activaciones), y posteriormente peculiar-ragdoll recuantizó esos pesos con el cuantizador oQ4e de oMLX, empleando imatrix y un corpus de calibración propio ponderado hacia ciberseguridad, e incrustó la plantilla de chat Sharp en el checkpoint.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento en el modelo original. La abliteración es una intervención post-hoc sobre los pesos, no un reentrenamiento, por lo que las capacidades base del modelo subyacente se mantienen y lo que cambia es el comportamiento de rechazo. La innovación técnica destacable de esta ficha es de cuantización (calibración específica de dominio y plantilla de chat embebida) y de ecosistema: la familia dispone de una variante con head MTP entrenado para decodificación especulativa, pero este fichero concreto no lo incluye.

## Capacidades

- Generación de texto y código con orientación a programación agéntica multi-paso, evaluada en SWE-bench-Live.
- Resolución autónoma de bugs en bases de código grandes, con validación mediante tests de regresión ocultos según la metodología de SWE-bench-Live.
- Capacidad ofensiva real en tareas de captura de flag: 15 de 43 retos de Cybench resueltos sin pistas ni juez.
- Comprensión de imágenes y texto (pipeline image-text-to-text), útil para capturas de pantalla, diagramas y mensajes de error.
- Conversación multi-turno (tag `conversational`).
- Multilingüe limitado a inglés y chino según los metadatos de idioma; no se declara castellano.
- Ausencia de rechazos por diseño (abliterado): 0% de rechazos en las 84 peticiones de HarmBench reportadas.
- Estilo de razonamiento más breve que Ornith-1.5 y Qwen3.6-35B-A3B, lo que se traduce en menos tokens generados y mayor velocidad por tarea.
- Soporte de tool calling / function calling: no disponible en la información consultada.
- Decodificación especulativa mediante head MTP: no disponible en este fichero (existe una build `-MTP` aparte).

## Casos de uso

- Resolución automática de issues en repositorios reales: un agente que lee el repositorio, localiza el fallo, propone un parche y lo valida con la batería de tests. Es el escenario para el que fue diseñado, con resultados medidos en SWE-bench-Live sobre problemas publicados recientemente.
- Automatización dentro de pipelines de CI/CD: generación de parches y borradores de pull request sobre código con cobertura de tests existente. Su menor volumen de tokens de razonamiento reduce el tiempo por tarea frente a modelos que "piensan" más.
- Red teaming ofensivo y ejercicios CTF: con 15 de 43 flags en Cybench sin guía, sirve para equipos de seguridad que necesiten un asistente que no se niegue a trabajar sobre técnicas de intrusión, siempre en entornos aislados y con autorización explícita.
- Auditoría de código y búsqueda de vulnerabilidades en local: al pesar 21,1 GB en 4 bits, puede ejecutarse íntegramente en un Mac sin enviar código propietario a servicios externos, lo que encaja en revisiones de seguridad con requisitos de confidencialidad.
- Asistente de programación en editor o CLI sobre Apple Silicon: con memoria unificada de 32 GB o más se puede mantener cargado de forma permanente para autocompletado, refactorización y explicación de código.
- Trabajo con capturas y diagramas: al aceptar entrada de imagen, se pueden pasar capturas de interfaz, diagramas de arquitectura o trazas de error y obtener código, explicaciones o correcciones.
- Evaluación de filtros y clasificadores de seguridad: su 0% de rechazos lo convierte en un sujeto de prueba útil para medir la robustez de sistemas de moderación de otros modelos, en sandbox y con fines de investigación.
- Migración y refactorización de proyectos extensos: la combinación de velocidad de generación y ventana de contexto (no publicada) permite abordar tareas de reescritura sobre múltiples ficheros, verificando siempre el contexto real soportado antes de dimensionar la tarea.

## Benchmarks y rendimiento

Advertencia importante: el propio autor indica que las cifras se midieron sobre la build GGUF en su tier UD-Q4_K_M con los k-quants de llama.cpp, no sobre este fichero MLX. Cambiar de cuantizador altera los resultados; el autor menciona una diferencia inferior a un punto en MMLU-Pro y diferencias de dos dígitos porcentuales en el recuento de tokens entre MLX y GGUF. Los datos deben leerse como evidencia sobre el modelo, no como medida de este fichero.

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench-Live | ≈70% más de problemas reales resueltos que Ornith-1.5 y Qwen3.6-35B-A3B; sin cifra absoluta publicada | Medido sobre GGUF UD-Q4_K_M; el autor afirma que la mejora es unas 7 veces mayor que el salto generacional de Qwen3.5-35B-A3B a 3.6 |
| Cybench (unguided, CTF) | 15/43 flags capturadas (35%) | Sin pistas ni juez |
| HarmBench | 0% de rechazos en 84 peticiones | 12 peticiones por cada una de las 7 categorías evaluadas |
| MMLU-Pro | Igual que TielCoder; sin cifra numérica publicada; por debajo de modelos generalistas | El autor atribuye la pérdida a la especialización, no a la abliteración |
| Velocidad de resolución | ≈3-4 veces más rápido que un dense de la clase 3,8-27B en tareas de coding agéntico (afirmación del autor) | Sin cifras de tokens/s publicadas |

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan unos 21 GB (21,1 GB de repositorio). Sumando caché KV y buffers del runtime, se recomienda un mínimo de 32 GB de memoria unificada en Apple Silicon; 24 GB es un límite muy ajustado.
- Este fichero concreto requiere Apple Silicon, ya que está en formato MLX. No es ejecutable en GPUs NVIDIA o AMD mediante CUDA.
- GPUs y equipos recomendados: Apple M1 Max/M2 Pro/M3 Pro/M4 Pro con 32 GB o más, y preferiblemente M-series Max/Ultra con 64 GB o más para contextos largos.
- Para GPUs consumer con 24 GB o menos, el autor remite a la build GGUF, que declara apta para hardware de baja potencia y memoria limitada; no se publican cifras de VRAM por nivel de cuantización.
- Opciones de despliegue: oMLX (soporte completo declarado), LM Studio (usar esta build no-MTP; las builds con MTP se corrompen en LM Studio según el autor), y las librerías mlx-lm/mlx-vlm por el `library_name: mlx`. Compatibilidad con vLLM, TGI u Ollama: no disponible en la documentación consultada.
- Cuantización alternativa: existe una build hermana oQ6e de 6 bits (≈30 GB) descrita como casi sin pérdida, para equipos con más memoria.
- Latencia y throughput: no se publican tokens por segundo. La model card solo aporta afirmaciones relativas (resolución de tareas de coding agéntico "3-4 veces más rápida" que un dense de la clase 3,8-27B, y menor número de tokens de pensamiento que Ornith-1.5 y Qwen3.6-35B-A3B).

## Comparativa con modelos similares

| Modelo | Parámetros | Formato/cuantización | Idiomas | Licencia | Enfoque y disponibilidad |
|---|---|---|---|---|---|
| CyberTiel (este repositorio) | 35,1B totales / ≈3B activos | safetensors MLX, oQ4e 4 bits (21,1 GB) | en, zh | MIT | Coding agéntico y seguridad ofensiva, sin rechazos; build MLX no-MTP |
| TielCoder | 35,1B / ≈3B | MLX oQ4e y oQ6e; también GGUF | no disponible | no disponible | Misma base y cuantizador, versión censurada; el autor la recomienda si se necesita una alternativa más segura |
| Ornith-1.5-35B-A3B (vía Huihui abliterado) | 35,1B / ≈3B | no disponible | no disponible | no disponible | Modelo de partida; según la card, resuelve menos problemas reales de código y genera más tokens de razonamiento |
| Qwen3.6-35B-A3B | 35B / ≈3B (según nomenclatura) | no disponible | no disponible | no disponible | Referencia generalista; retiene más conocimiento del mundo, pero resuelve menos problemas de código que CyberTiel según el autor |
| Nail-Qwen3.6-35B-A3B (GGUF) | 35B / ≈3B (según nomenclatura) | GGUF | no disponible | no disponible | Alternativa recomendada por el propio autor para trivia y exámenes, donde CyberTiel rinde peor |

## Limitaciones y advertencias

- Modelo abliterado: elimina deliberadamente la capacidad de rechazo. La card reporta 0% de rechazos en 84 peticiones que incluyen cibercrimen e intrusión, riesgos químicos y biológicos, actividades ilegales, acoso, desinformación, copyright y daño general. El uso queda bajo responsabilidad exclusiva del usuario.
- Conocimiento general del mundo degradado: el autor reconoce explícitamente que CyberTiel y TielCoder sacrifican MMLU-Pro a cambio de código y velocidad, y desaconseja usarlos para trivia o exámenes.
- Riesgo elevado de contenido dañino o ilegal si no se aplican sandbox, monitorización y filtros propios. La card insiste en ejecutarlo aislado.
- Cobertura de idiomas limitada a inglés y chino. El rendimiento en castellano no está documentado ni garantizado.
- Longitud de contexto no publicada: no se debe dimensionar un caso de uso con repositorios grandes sin verificar antes la ventana real.
- Las cifras de benchmarks corresponden a la build GGUF UD-Q4_K_M con k-quants, no a este fichero MLX. El autor advierte de variaciones por cambio de cuantizador y de diferencias de dos dígitos porcentuales en el recuento de tokens entre MLX y GGUF.
- Problemas de compatibilidad del runtime: según el autor, todas las builds MLX con head MTP se corrompen en LM Studio y solo funcionan correctamente en oMLX. Esta build no-MTP es la indicada para LM Studio.
- Requiere Apple Silicon para el formato MLX; no hay soporte CUDA para este fichero.
- Licencia MIT declarada para esta cuantización, pero el modelo deriva de un abliterado de terceros y de un modelo original de otro proveedor. Conviene revisar las condiciones de la cadena completa antes de un uso comercial.
- El repositorio consultado figura sin descargas ni intereses en el momento de la consulta, por lo que no hay validación independiente de la comunidad sobre esta copia concreta.
- No se documenta soporte de tool calling ni de function calling, algo relevante si se pretende integrar en un agente con herramientas externas.

## Enlaces

- Repositorio consultado: https://huggingface.co/dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Repositorio original del mismo fichero: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Build GGUF (usada para los benchmarks): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Build hermana oQ6e de 6 bits: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Build con head MTP para decodificación especulativa: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Variante censurada TielCoder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original de partida: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Alternativa para conocimiento general y exámenes: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Ficha de terceros con estimación de VRAM de la familia TielCoder: https://llm-explorer.com/model/peculiar-ragdoll%2FTiel-Coder-35B-A3B-MLX-oQ4e,oIzfKExsnj0ssF03dgstM
- Ficha de terceros de la variante MTP: https://llm-explorer.com/model/peculiar-ragdoll%2FTiel-Coder-35B-A3B-MLX-oQ4e-MTP,1nA9WY6n2rI6BqgTtmf0NQ
