# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP es una cuantización de 6 bits en formato MLX de un modelo MoE de 35B parámetros totales (3B activos), derivado de la familia Ornith-1.5 y "abliterado" (con los mecanismos de rechazo eliminados) por huihui-ai. El autor de esta build, peculiar-ragdoll, aplica una requantización con el cuantizador oQ6e de oMLX sobre un corpus de calibración propio orientado a ciberseguridad, incorpora una plantilla de chat propia ("Sharp") y conserva la cabeza de predicción multi-token (MTP) del modelo original para decodificación especulativa.

El modelo está pensado para ejecutarse en Apple Silicon mediante MLX y está orientado a programación agéntica y tareas de seguridad ofensiva sin rechazos. Según la model card, resuelve problemas reales de SWE-bench-Live aproximadamente un 70 % más que Ornith-1.5 y Qwen3.6-35B-A3B a cuantización de 4 bits, y captura 15 de 43 flags en Cybench sin guiado. Es relevante porque ocupa un nicho poco habitual: un coder MoE de tamaño medio, sin censura, con capacidades de visión y optimizado para hardware de consumo con memoria limitada.

La build ocupa unos 91,8 GB en el repositorio y aproximadamente 30 GB de pesos en 6 bits. Solo debe ejecutarse en oMLX: en LM Studio la cabeza MTP produce salida corrupta, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (familia Qwen3.5 MoE, tag `qwen3_5_moe`) con cabeza de predicción multi-token (MTP) |
| Parametros totales | 35.951.822.704 (≈35,95B) |
| Parametros activos | 3B (según nomenclatura A3B; no se detalla el reparto exacto de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (oQ6e de oMLX, con imatrix y calibración propia); el ecosistema incluye builds oQ4e y GGUF UD-Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); existe build GGUF del mismo modelo |
| Pipeline | image-text-to-text (visión) |
| Tamano del repo | 91,8 GB |
| Descargas / likes | 1.663 / 15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5, con 35,95B parámetros totales y 3B activos por token, lo que permite un throughput alto con un coste de memoria moderado. Sobre el modelo base se ha conservado la cabeza de predicción multi-token (MTP) entrenada de Ornith-1.5, que actúa como mecanismo de decodificación especulativa en runtimes que la soportan (oMLX, llama.cpp con el build GGUF). El modelo es multimodal: el pipeline declarado es image-text-to-text, por lo que acepta imágenes además de texto.

La cadena de derivación es: Ornith-1.5-35B-A3B (ornith-ai) → Huihui-Ornith-1.5-35B-A3B-abliterated (huihui-ai, eliminación de rechazos) → esta build, requantizada por peculiar-ragdoll con el cuantizador oQ6e de oMLX usando imatrix y un corpus de calibración ponderado hacia ciberseguridad, y con la plantilla de chat "Sharp" del mismo autor. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La cuantización a 6 bits se describe como "near-lossless" (casi sin pérdida) respecto al modelo abliterado de referencia.

## Capacidades

- Generación de texto y razonamiento general en inglés y chino.
- Programación agéntica: resolución autónoma de issues y bugs en repositorios grandes (evaluado en SWE-bench-Live).
- Capacidades de seguridad ofensiva: resolución de retos CTF sin guiado (15/43 en Cybench) y ausencia de rechazos en HarmBench (0 % de rechazos en 84 peticiones).
- Visión: pipeline image-text-to-text, acepta entradas de imagen junto con texto.
- Decodificación especulativa mediante cabeza MTP, que acelera la generación en runtimes compatibles.
- Modo "uncensored": el modelo no aplica rechazos por política de contenido, lo que incluye contenido potencialmente dañino.
- No se especifica en la información disponible soporte explícito de tool calling o function calling, aunque el perfil de "agentic coding" sugiere su uso en bucles de agente.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un bug report y el árbol del proyecto y generar un parche verificable, gracias a su entrenamiento orientado a SWE-bench-Live y a su ventana de contexto (longitud no publicada) para manejar codebases grandes.
- Auditoría de seguridad ofensiva autorizada: en entornos de pentesting con sandbox y supervisión, el modelo no rechaza tareas de explotación y puede razonar sobre vulnerabilidades, lo que lo hace útil para red teams con alcance legal definido.
- Retos CTF y formación en ciberseguridad: resuelve tareas de captura de flag de forma autónoma, adecuado para entrenamiento de equipos y evaluación de pipelines de agentes.
- Asistente de programación local en Apple Silicon: con ~30 GB de pesos en 6 bits, puede ejecutarse en Macs con memoria unificada alta (por ejemplo, 64 GB o más) sin GPU dedicada, manteniendo velocidades de decodificación mejoradas por MTP.
- Generación de código en pipelines de CI/CD con revisión humana obligatoria: el modelo puede proponer correcciones y refactorizaciones, pero su naturaleza sin censura exige sandboxing y revisión antes de aplicar cambios.
- Análisis de capturas de pantalla o diagramas de arquitectura: al ser image-text-to-text, puede interpretar imágenes junto con texto para documentar sistemas o detectar configuraciones inseguras en interfaces.
- Investigación sobre alineación y robustez: sirve como caso de estudio de modelos abliterados para medir la eficacia de las técnicas de eliminación de rechazos y sus efectos colaterales.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden al build GGUF en cuantización UD-Q4_K_M, no a esta build MLX oQ6e. Se presentan como evidencia sobre el modelo, no como medición de este archivo.

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench-Live | ≈70 % más problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Medido a 4 bits en GGUF |
| Cybench (sin guiado) | 15/43 flags (35 %) | Sin pistas ni juez |
| HarmBench | 0 % de rechazos (84 peticiones) | Muestreo de 12 por petición |
| Velocidad de resolución | 3-4× más rápido que un dense de 3.8-27B | Afirmación del autor, sin cifras absolutas |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 30 GB para los pesos en 6 bits; el repo completo ocupa 91,8 GB.
- Hardware objetivo: Apple Silicon con memoria unificada; se requiere un Mac con al menos 32 GB (ajustado) y recomendable 64 GB o más para contexto largo y overhead del runtime.
- GPU dedicadas: no aplica de forma nativa, ya que el formato es MLX; para CUDA habría que usar el build GGUF con llama.cpp.
- Consumer GPU: el build GGUF UD-Q4_K_M puede caber en GPUs de 24 GB (RTX 4090) con contexto moderado; esta build MLX no está pensada para ellas.
- Despliegue: exclusivamente oMLX para esta build. LM Studio produce salida corrupta por mal manejo de la cabeza MTP. Alternativa: build GGUF en llama.cpp u otros runtimes compatibles con GGUF.
- Latencia y throughput: no se publican cifras absolutas; el autor indica que la decodificación especulativa MTP y el menor número de tokens de "pensamiento" respecto a Ornith-1.5 y Qwen3.6 mejoran la velocidad efectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | 35,95B totales / 3B activos | no disponible | MIT | Abliterado, visión, MTP, solo oMLX |
| TielCoder-35B-A3B-MLX-oQ4e | 35,95B totales / 3B activos | no disponible | MIT | Versión censurada del mismo autor, sin capacidades ofensivas |
| Ornith-1.5-35B-A3B | 35B totales / 3B activos | no disponible | no disponible | Modelo base, con rechazos; resuelve ≈70 % menos en SWE-bench-Live según el autor |
| Qwen3.6-35B-A3B | 35B totales / 3B activos | no disponible | no disponible | Alternativa de la misma clase; rendimiento similar a Ornith-1.5 en SWE-bench-Live según el autor |

## Limitaciones y advertencias

- Modelo abliterado: elimina los rechazos de seguridad y puede generar contenido dañino, ilegal o peligroso. El usuario asume toda la responsabilidad legal y ética sobre su uso.
- Riesgo elevado de alucinación en tareas de seguridad y código: las soluciones propuestas deben verificarse siempre; el modelo puede producir exploits o parches incorrectos con aparente confianza.
- Incompatibilidad crítica con LM Studio: la cabeza MTP genera tokens aleatorios desde el primer token en ese runtime. Solo funciona correctamente en oMLX.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no publicada, lo que dificulta planificar su uso en codebases muy grandes.
- Los benchmarks publicados corresponden al build GGUF a 4 bits, no a esta build de 6 bits; los números no son directamente trasladables.
- Licencia MIT, que permite uso comercial, pero la ausencia de salvaguardas traslada al operador la responsabilidad sobre el contenido generado y su sandboxing.
- Requiere hardware Apple Silicon con memoria unificada elevada; no es desplegable en infraestructura CUDA estándar sin cambiar de formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo Ornith-1.5 original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF del mismo modelo: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Build MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Versión censurada TielCoder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Advertencias de uso del modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated#usage-warnings
