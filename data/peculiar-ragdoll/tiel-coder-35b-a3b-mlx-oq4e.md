# peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ4e es una cuantización de 4 bits del modelo base Ornith-1.5-35B-A3B, publicada por el usuario peculiar-ragdoll bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una reempaquetadura orientada a Apple Silicon: aplica el cuantizador oQ4e de oMLX (precisión mixta dinámica con una pasada de imatrix) sobre los pesos del modelo base e incrusta la plantilla de chat Sharp, diseñada para producir respuestas más breves y directas. El resultado se distribuye en formato MLX safetensors, listo para cargarse con `mlx-vlm`.

El modelo hereda la arquitectura del base: un transformer con mezcla de expertos (MoE) de 35.107.181.936 parámetros totales, etiquetado internamente como `qwen3_5_moe` y `qwen35moe`, con capacidades de visión (pipeline `image-text-to-text`). El autor lo posiciona explícitamente como un modelo para trabajo de código agéntico y conversaciones multi-turno largas, no para conocimiento enciclopédico: en su propia documentación reconoce un déficit de 10,3 puntos en MMLU-Pro frente a su build hermano Nail, a cambio de una ventaja de 6,7 puntos en evaluación conversacional.

Su relevancia ahora es doble. Por un lado, demuestra un flujo de trabajo de cuantización específico para Apple Silicon con visión integrada en la misma carpeta (sin fichero proyector separado). Por otro, ejemplifica una práctica de publicación transparente pero problemática: los benchmarks que muestra el autor se midieron sobre el build GGUF, no sobre este fichero MLX, y el propio autor advierte que cambiar de cuantizador altera los resultados. La ficha siguiente distingue en todo momento entre datos del modelo y datos de este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiquetas `qwen3_5_moe` / `qwen35moe`; pipeline `image-text-to-text` (visión-lenguaje) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, precisión mixta dinámica con pasada de imatrix); el repo se etiqueta como `4-bit` |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); visión incluida en la misma carpeta, sin proyector separado |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Tamano del repositorio | 84,9 GB |
| Descargas / likes | 831 / 20 |
| Fecha de creacion | 2026-08-24 |
| Ultima actualizacion | 2026-11-04 |
| Cabeza MTP | No incluida (existe un build separado con la cabeza `nextn` de Ornith para decodificación especulativa) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Ornith-1.5-35B-A3B: un transformer con mezcla de expertos de 35.107 millones de parámetros totales, con soporte de entrada de imagen y texto. El autor no documenta en esta model card ni el número de parámetros activos por token, ni la distribución de expertos, ni la longitud de contexto nativa, ni el volumen o composición del corpus de entrenamiento. Tampoco se detalla si el base empleó RLHF, DPO u otro método de alineamiento. Todo ello queda como "no disponible" en esta ficha.

Lo que sí está documentado es la intervención técnica de esta publicación, que consta de dos piezas. La primera es la cuantización: oQ4e aplica precisión mixta dinámica a 4 bits con una pasada de imatrix, un esquema que asigna más bits a las capas sensibles y menos a las robustas, en la línea de las técnicas de cuantización dinámica popularizadas por Unsloth (etiqueta `unsloth-dynamic` presente en el repo). La segunda es la plantilla de chat Sharp, incrustada en el checkpoint, que el autor describe como un mecanismo para acortar respuestas y reducir preguntas aclaratorias. El autor cuantifica ese efecto: con la misma cuantización, la plantilla de Ornith reproduce exactamente la puntuación de Ornith, de modo que los 4,3 puntos de diferencia en MMLU-Pro atribuibles al template son un efecto de la plantilla y no del cuantizador.

Un detalle operativo relevante: este build carece de cabeza de predicción multi-token (MTP). El autor mantiene un repositorio separado con la cabeza `nextn` entrenada de Ornith para quien quiera decodificación especulativa. Además, el checkpoint debe cargarse con `mlx-vlm` y no con `mlx-lm`: según el autor, `mlx_lm.load()` lo acepta y luego emite tokens basura, un fallo silencioso de cargador.

## Capacidades

- Generación de código y resolución de incidencias sobre repositorios reales, con evaluación específica en SWE-bench-Live.
- Razonamiento agéntico multi-paso orientado a tareas de ingeniería de software.
- Conversación multi-turno con contexto largo, con una puntuación destacada en Claw-Eval (67,2 sobre 114 conversaciones puntuadas).
- Comprensión de imágenes y texto combinados (image-text-to-text): lectura de capturas de pantalla, diagramas y documentación visual.
- Capacidad de visión integrada en el mismo directorio de pesos, sin fichero proyector aparte.
- Multilingüismo limitado a inglés y chino según los metadatos del repositorio.
- Plantilla de chat Sharp incrustada, aplicada automáticamente por el runtime, que favorece respuestas concisas y reduce preguntas aclaratorias.
- Eficiencia de tokens declarada por el autor (etiqueta `token-efficient`), con respuestas más cortas que el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Audio: no soportado según la información disponible.

## Casos de uso

- Reparación automática de incidencias en repositorios: el modelo está evaluado sobre SWE-bench-Live, un conjunto de problemas reales extraídos de proyectos vivos. Se usaría como agente que recibe un issue, localiza los ficheros relevantes y propone un parche, con una mediana de 8,6 minutos por intento según las mediciones del autor sobre el build GGUF.
- Asistente de programación en terminal o IDE sobre Mac: al estar cuantizado en formato MLX con 22 GB según el autor, encaja en un flujo de trabajo local en Apple Silicon sin depender de API externa, lo que es adecuado para código propietario que no puede salir de la máquina.
- Revisión de código asistida por capturas: gracias a la entrada image-text-to-text, puede analizar una captura de pantalla de un error de compilación, un diff en una interfaz web o un diagrama de arquitectura y comentarlo en lenguaje natural.
- Agente conversacional de soporte técnico de larga duración: su ventaja medida en Claw-Eval multi-turno (67,2 frente a 65,3 del base) lo hace adecuado para sesiones prolongadas donde el coste de reaclarar contexto es alto; el autor reporta 5,1 puntos menos de preguntas aclaratorias que el base.
- Automatización de tareas de refactorización por lotes: con temperatura 0,6 en modo agéntico, como recomienda el autor, se puede integrar en un pipeline que aplique cambios repetitivos a un monorepo y verifique con tests, aprovechando la eficiencia de tokens para reducir el coste por iteración.
- Prototipado de asistentes bilingües inglés-chino: para productos dirigidos a esos dos mercados, el modelo cubre ambos idiomas sin necesidad de un modelo multilingüe mayor.
- Extracción de información de documentación visual: procesamiento de manuales escaneados o paneles de instrumentación donde el texto y la imagen aparecen mezclados en la misma entrada.

## Benchmarks y rendimiento

Advertencia del propio autor: todas las cifras siguientes se midieron sobre el build GGUF, no sobre este fichero MLX. El autor señala que, sobre los mismos pesos de Nail, observó una diferencia de 0,7 puntos en MMLU-Pro y un 24 % de diferencia en recuento de tokens entre MLX y GGUF. Deben leerse como evidencia sobre el modelo, no como medición de este artefacto.

| Benchmark | TielCoder | Ornith-1.5 (base) | Nail | Qwen3.6-35B-A3B stock | Opus 4.6 (medium) |
|---|---|---|---|---|---|
| SWE-bench-Live (resueltos de 25) | 12 | 8 | 9 | 8 | 12 |
| Claw-Eval multi-turno (global) | 67,2 | 65,3 | 60,5 | no disponible | no disponible |
| MMLU-Pro (4 bits) | 73,7 | 78,0 | 84,0 | 85,3 | no disponible |

Datos adicionales aportados por el autor: tiempo mediano por intento en SWE-bench-Live de 8,6 minutos (frente a 7,2 de Nail), con media de 12,3 minutos frente a 15,7 de Nail, atribuido a la ausencia de una cola de intentos costosos. En Claw-Eval, Tiel supera al base en 3,8 puntos de calidad de respuesta y queda 5,1 puntos por debajo en preguntas aclaratorias. Frente a Sonnet 5 (medium) resuelve cuatro problemas más de los 25. No se han publicado resultados de benchmarks sobre este fichero MLX concreto.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 22 GB según el autor para el build de 4 bits, aunque el repositorio ocupa 84,9 GB en disco, lo que sugiere que el tamaño en memoria citado corresponde a los pesos cargados y no al total de artefactos descargados.
- Plataforma objetivo: Apple Silicon exclusivamente. El formato es MLX y la librería declarada es `mlx`, por lo que no es desplegable en GPU NVIDIA o AMD sin reconversión.
- Equipos compatibles: Macs con memoria unificada de 32 GB o superior para dejar margen al contexto y a la torre de visión; 64 GB o más recomendable para sesiones agénticas largas.
- GPU recomendadas: no aplica en el sentido convencional; el runtime es `mlx-vlm` sobre Metal. Para CUDA habría que recurrir al build GGUF del mismo autor.
- Cabe en GPU de consumo: no en el sentido de tarjetas discretas; en el ecosistema Apple, sí en configuraciones de gama alta con memoria unificada suficiente.
- Opciones de despliegue: `mlx-vlm` (obligatorio, no `mlx-lm`), oMLX (colocando la carpeta en `~/.omlx/models/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e` o desde el panel de administración de oMLX), y descarga mediante `hf download`. vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato.
- Parámetros de muestreo recomendados por el autor: temperatura 1,0, top_p 0,95, top_k 20; temperatura 0,6 para código agéntico.
- Latencia y throughput: no disponible de forma agregada; el único dato temporal publicado es la mediana de 8,6 minutos por intento en SWE-bench-Live, que incluye ejecución de tests y no mide inferencia pura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench-Live (de 25) | MMLU-Pro | Claw-Eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B-MLX-oQ4e | 35,1 B totales (MoE) | no disponible | 12 | 73,7 | 67,2 | MIT | MLX, Apple Silicon |
| Ornith-1.5-35B-A3B (base) | 35,1 B totales (MoE) | no disponible | 8 | 78,0 | 65,3 | no disponible | múltiples formatos |
| Nail-Qwen3.6-35B-A3B | 35 B clase (MoE) | no disponible | 9 | 84,0 | 60,5 | no disponible | GGUF |
| Dirk-Qwen3.8-27B | 27 B densos | no disponible | 15 | no disponible | no disponible | no disponible | GGUF |
| Qwen3.6-35B-A3B stock | 35 B clase (MoE) | no disponible | 8 | 85,3 | no disponible | no disponible | múltiples |

La lectura que hace el propio autor: Tiel es la mejor opción de su clase para código agéntico y conversación multi-turno, pero queda por detrás en conocimiento tipo examen. Dirk, un denso de 27 B, resuelve tres problemas más de los 25 a 2,5 veces la velocidad, lo que lo convierte en la elección si prima la tasa de éxito por problema sobre la latencia o el formato Apple.

## Limitaciones y advertencias

- Los benchmarks publicados no corresponden a este fichero: se midieron sobre el build GGUF con otro cuantizador, y el autor reconoce explícitamente que los resultados se desplazan al cambiar de cuantizador.
- Déficit de conocimiento enciclopédico: 73,7 en MMLU-Pro frente a 84,0 de Nail y 85,3 de Qwen3.6-35B-A3B stock. No es adecuado para tareas de razonamiento tipo examen o consulta factual precisa.
- La plantilla Sharp reduce preguntas aclaratorias en 5,1 puntos respecto al base. En peticiones ambiguas, el modelo tiende a actuar antes de preguntar, lo que puede producir cambios no deseados en flujos agénticos sobre repositorios.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor describe el modelo como "cheerfully bad at trivia", lo que sugiere una propensión a responder con confianza en dominios de conocimiento general.
- Cobertura lingüística restringida a inglés y chino según los metadatos. No hay evidencia de rendimiento en castellano.
- Fallo silencioso de cargador: `mlx_lm.load()` acepta el checkpoint y emite tokens basura. Es imprescindible usar `mlx-vlm`, y el error no se manifiesta como excepción.
- Ausencia de cabeza MTP en este build: no permite decodificación especulativa sin recurrir al repositorio hermano.
- Dependencia de plataforma: formato MLX, exclusivo de Apple Silicon. No desplegable en CUDA sin recurrir al build GGUF.
- Sesgos: no documentados en la información proporcionada. Al ser un derivado de un modelo base sin model card de sesgos accesible en esta ficha, no puede evaluarse su comportamiento diferencial.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Ornith-1.5-35B-A3B, cuya licencia no se detalla en la información disponible.
- El repositorio ocupa 84,9 GB frente a los 22 GB que el autor cita como requisito de memoria; conviene planificar el espacio en disco en consecuencia.
- Proyecto de un autor individual (peculiar-ragdoll), sin gobernanza corporativa ni garantías de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF del mismo modelo (donde se midieron los benchmarks): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Build con cabeza MTP para decodificación especulativa: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Variante CyberTiel (sin censura y mejorada): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Build hermano Nail-Qwen3.6-35B-A3B: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Build hermano Dirk-Qwen3.8-27B: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
