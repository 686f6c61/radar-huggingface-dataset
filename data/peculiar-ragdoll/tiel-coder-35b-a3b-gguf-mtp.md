# peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP

## Resumen

Tiel-Coder-35B-A3B-GGUF-MTP es una cuantización GGUF del modelo Ornith-1.5-35B-A3B, publicada por el usuario peculiar-ragdoll. Se trata de un modelo de lenguaje multimodal (texto e imagen) con arquitectura MoE de 35 mil millones de parámetros totales y 3 mil millones activos, derivado de Qwen3.6-35B-A3B. Esta variante incorpora un bloque de predicción multi-token (MTP) que permite decodificación especulativa en llama.cpp, reduciendo la latencia de generación en tareas de codificación agéntica.

El modelo está optimizado para resolver incidencias reales en repositorios de código y mantener conversaciones largas y útiles, a costa de un menor rendimiento en tareas de conocimiento general y razonamiento académico. Incluye soporte de visión mediante un proyector mmproj sin modificar, y se distribuye bajo licencia MIT. Los archivos GGUF pesan entre 23,3 GB y 27,5 GB, lo que permite su ejecución en GPUs con 32 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B, con bloque MTP (nextn) |
| Parametros totales | 35B (modelo base Ornith-1.5-35B-A3B) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL, Q5_K_XL (GGUF, con imatrix propia y cuantizacion dinamica) |
| Idiomas soportados | ingles, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo es una re-cuantizacion dinamica de Ornith-1.5-35B-A3B, que a su vez es un MoE basado en Qwen3.6-35B-A3B. El autor aplico una imatrix propia y una cuantizacion dinamica (etiquetada como unsloth-dynamic) para generar los archivos GGUF. La novedad principal es el bloque MTP (multi-token prediction), que en la primera version del ladder estaba inicializado aleatoriamente (desviacion estandar 0.020, kurtosis 3.00) y fue corregido por el autor, aunque no se detalla el metodo de entrenamiento o ajuste utilizado.

Ademas, el GGUF incorpora el "Sharp chat template", un prompt de sistema que reduce la longitud de las respuestas, lo que mejora la eficiencia en conversaciones multi-turno pero penaliza el rendimiento en examenes de conocimiento. El proyector de vision (mmproj-BF16.gguf) se pasa sin modificaciones desde el repositorio base de Ornith.

## Capacidades

- Generacion de texto y razonamiento, con especial enfasis en tareas de codificacion.
- Codificacion agentica: resolucion de incidencias reales en repositorios (SWE-bench-Live).
- Conversacion multi-turno de alta calidad, medida con Claw-Eval.
- Vision: procesamiento de imagenes y texto (image-text-to-text) mediante el proyector mmproj.
- Decodificacion especulativa con el bloque MTP, activable en llama.cpp con `--spec-type draft-mtp`.
- Soporte multilingue para ingles y chino.
- Integracion con herramientas de agentes y tool calling (inferido por su uso en tareas agenticas).

## Casos de uso

- Resolucion de incidencias en repositorios de codigo: el modelo puede analizar issues, generar parches y validar soluciones, con una tasa de exito de 12 sobre 25 en SWE-bench-Live, similar a Opus 4.6 medium.
- Asistente de programacion en IDE: su capacidad de mantener contexto largo y responder con precision en multiples turnos lo hace adecuado para acompanar sesiones de desarrollo prolongadas.
- Chatbots de soporte tecnico: gracias a su puntuacion de 67.2 en Claw-Eval, puede gestionar conversaciones complejas con usuarios que necesitan ayuda detallada.
- Analisis de capturas de pantalla y diagramas: al ser multimodal, puede interpretar imagenes de errores, esquemas o documentacion visual.
- Automatizacion de tareas de desarrollo: con tool calling y decodificacion especulativa, puede integrarse en pipelines de CI/CD para generar codigo o revisar pull requests.
- Generacion de documentacion tecnica: su capacidad de producir respuestas concisas (gracias al Sharp template) es util para redactar comentarios y documentacion a partir de codigo.

## Benchmarks y rendimiento

| Benchmark | Tiel-Coder (4-bit) | Nail-Qwen3.6-35B-A3B (4-bit) | Ornith-1.5-35B-A3B | Qwen3.6-35B-A3B (stock) |
|---|---|---|---|---|
| SWE-bench-Live (problemas resueltos / 25) | 12 | 9 | 8 | 8 |
| Claw-Eval (multi-turno, sobre 114 conversaciones) | 67.2 | 60.5 | 65.3 | no disponible |
| MMLU-Pro | 73.7 | 84.0 | 78.0 | 85.3 |

Tiempo medio por intento en SWE-bench-Live: mediana de 8.6 minutos, media de 12.3 minutos. El modelo resuelve 12 de 25 problemas, igual que Opus 4.6 medium, y supera a Ornith-1.5 (8) y a Nail (9). En MMLU-Pro, la perdida de 4.3 puntos respecto a Ornith se atribuye al Sharp template, que prioriza respuestas cortas.

## Requisitos de hardware

- Archivo Q4_K_XL: 23.3 GB, requiere al menos 32 GB de VRAM para carga completa en GPU.
- Archivo Q5_K_XL: 27.5 GB, tambien requiere 32 GB de VRAM.
- GPU recomendada: NVIDIA A100 40GB, RTX A6000 48GB, o similar con 32 GB o mas. No cabe en una RTX 4090 de 24 GB sin offloading parcial.
- Despliegue: compatible con llama.cpp y llama-server (usando `--spec-type draft-mtp` para activar el MTP). Tambien se puede usar con otras herramientas que soporten GGUF, como Ollama o LM Studio, aunque el MTP requiere soporte especifico.
- Latencia: con decodificacion especulativa, el tiempo medio por intento en SWE-bench-Live es de 12.3 minutos, con una mediana de 8.6 minutos, lo que indica una velocidad aceptable para tareas agenticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | SWE-bench-Live | Licencia |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (este) | 35B totales, 3B activos | no disponible | 73.7 | 12/25 | MIT |
| Nail-Qwen3.6-35B-A3B-GGUF | 35B totales, 3B activos | no disponible | 84.0 | 9/25 | Apache-2.0 |
| Ornith-1.5-35B-A3B | 35B totales, 3B activos | no disponible | 78.0 | 8/25 | MIT |
| Qwen3.6-35B-A3B (stock) | 35B totales, 3B activos | no disponible | 85.3 | 8/25 | Apache-2.0 |

Tiel se posiciona como la opcion mas rapida y eficaz para codificacion agentica, mientras que Nail es superior en conocimiento general y razonamiento. Ornith, el modelo base, ofrece un equilibrio intermedio.

## Limitaciones y advertencias

- Rendimiento bajo en tareas de trivia y conocimiento general: el propio autor indica que el modelo es "alegremente malo en examenes" (MMLU-Pro 73.7).
- El bloque MTP solo se activa con `--spec-type draft-mtp` en llama.cpp; si no se usa, el archivo incluye 0.9 GB de tensores inutiles.
- La cuantizacion puede introducir degradacion adicional respecto al modelo en punto flotante, aunque el autor afirma que la imatrix propia minimiza el impacto.
- Solo soporta ingles y chino; no hay evidencia de buen rendimiento en otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo base Ornith-1.5-35B-A3B tambien es MIT, por lo que no hay restricciones adicionales conocidas.
- No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de correccion del MTP head, lo que limita la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Version sin MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Version MLX: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas Sharp chat: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo comparativo Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF-MTP
