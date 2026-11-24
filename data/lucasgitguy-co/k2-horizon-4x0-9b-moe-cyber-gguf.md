# Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-GGUF

## Resumen

K2-Horizon-4x0.9B-MoE-Cyber-GGUF es la distribución en formato GGUF del modelo K2-Horizon-4x0.9B-MoE-Cyber, un ajuste fino especializado en ciberseguridad desarrollado por Lucasgitguy-co. El modelo parte de una arquitectura Mixture of Experts (MoE) denominada `k2-horizon` en llama.cpp, con 4 expertos y enrutamiento top-1, y un total de 3.060.266.496 parámetros (unos 3,06 mil millones), de los cuales aproximadamente 1B se activan por token. El ajuste se realizó sobre el modelo base K2-Horizon-4x0.9B-MoE-heretic, al que se le aplicó un LoRA por experto entrenado con dos datasets de ciberseguridad.

El objetivo del modelo es ofrecer asistencia conversacional especializada en seguridad informática (conceptos, herramientas, análisis) en un tamaño lo suficientemente reducido como para ejecutarse localmente en hardware de consumo mediante llama.cpp, LM Studio u Ollama. Esta ficha cubre exclusivamente la versión GGUF, que incluye cinco cuantizaciones (BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M), con Q5_K_M marcada como recomendada por el autor.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño y local de nicho; por otro, es un ejemplo de las limitaciones reales de los modelos de ~1B parámetros activos en dominios de alta precisión, donde el autor documenta errores confiados en conceptos técnicos concretos. La licencia Apache-2.0 y la ausencia de filtros de rechazo (base "uncensored" mediante Heretic) condicionan su uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE `k2-horizon` (llama.cpp), 4 expertos, enrutamiento top-1 |
| Parametros totales | 3.060.266.496 (~3,06B) |
| Parametros activos | ~1B por token (según model card) |
| Longitud de contexto | No disponible (el ejemplo de `llama-server` usa `-c 8192`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (K-quants con importance matrix) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también existen variantes MLX 8-bit y 4-bit en repos separados) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts de 4 expertos y enrutamiento top-1, identificada como `k2-horizon` en llama.cpp. Cada token activa aproximadamente 1B de los ~3,06B parámetros totales. Según la model card, los 4 expertos partieron como copias casi idénticas en el modelo base; el ajuste fino aplica un LoRA por experto que les permite divergir, pero el enrutador no se reentrenó. Esto implica que la especialización efectiva de los expertos es limitada.

El ajuste fino se realizó sobre K2-Horizon-4x0.9B-MoE-heretic (base sin rechazos, producida con Heretic) usando dos datasets de ciberseguridad: `Voidreaper2026/cybersec-master-dataset` y `Vyber07/cyber-security`. Se eliminaron de los datos de entrenamiento las preguntas que coincidían con ítems de CyberMetric o ARC, para evitar contaminación en la evaluación. La model card no detalla el número de tokens de entrenamiento ni si se usó RLHF o DPO. Las cuantizaciones K-quant se generaron con una importance matrix derivada de texto de ciberseguridad no visto durante el entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, orientada a temáticas de ciberseguridad.
- Respuesta directa por defecto (modo sin razonamiento explícito); el template embebido admite `reasoning_effort` (`none`, `low`, `medium`, `high`), aunque el ajuste fino no entrenó esos modos.
- Conocimiento de conceptos de seguridad, herramientas y terminología del dominio (con precisión limitada, ver limitaciones).
- Plantilla de chat embebida compatible con `--jinja` en llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Estudio y repaso de conceptos de ciberseguridad: el modelo puede mantener conversaciones multi-turno sobre terminología, mecanismos de ataque y defensas, útil como apoyo de formación para principiantes que verifiquen las respuestas con fuentes primarias.
- Laboratorios y entornos de práctica autorizados: generación de explicaciones y pistas en CTFs o ejercicios de seguridad ofensiva/defensiva controlados, ejecutándose localmente sin enviar datos a la nube.
- Borradores de documentación interna de seguridad: redacción inicial de notas, checklists o resúmenes que un analista revisa y corrige antes de publicar.
- Asistente local en estaciones de trabajo aisladas: al caber en GPU de consumo con Q5_K_M (2,18 GB), puede desplegarse en máquinas sin conexión externa, algo relevante en entornos con requisitos de confidencialidad.
- Prototipado y experimentación con arquitecturas MoE: sirve como banco de pruebas para estudiar el comportamiento de un MoE pequeño con enrutamiento top-1 y cuantización agresiva.
- Chat en navegador: la variante dividida en partes de 512 MB permite ejecutar el modelo íntegramente en el navegador mediante wllama, útil para demos educativas sin instalación.
- Generación de preguntas de autoevaluación: creación de cuestionarios sobre temario de seguridad para uso interno, siempre con revisión humana dada la tasa de error documentada.

## Benchmarks y rendimiento

| Modelo | CyberMetric-500 | ARC-Easy (500) | Held-out answer loss |
|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-heretic (base) | 0,714 | 0,782 | 1,686 |
| **Este modelo (bf16)** | **0,732** | **0,770** | **1,020** |
| MLX 8-bit | 0,732 | no disponible | 1,021 |
| MLX 4-bit | 0,684 | no disponible | 1,162 |

Los datos provienen de la model card del autor. CyberMetric-500 corresponde a `tihanyin/CyberMetric` (Apache-2.0); ARC-Easy son las primeras 500 preguntas del split de test de `allenai/ai2_arc`. La selección múltiple se puntúa por log-probabilidad de la letra de cada opción tras `Answer:`, en modo sin razonamiento. El margen de error aproximado es de ±0,02 (un error estándar con 500 preguntas). El autor advierte que la mejora en CyberMetric y la caída en ARC-Easy están dentro de ese margen, por lo que no demuestran una mejora clara del conocimiento de ciberseguridad; la gran reducción de la pérdida held-out refleja principalmente el aprendizaje del estilo de las respuestas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero): BF16 6,12 GB; Q8_0 3,25 GB; Q6_K 2,51 GB; Q5_K_M 2,18 GB; Q4_K_M 1,87 GB. Añadir overhead de contexto KV cache.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en GPUs de 4-8 GB con Q4_K_M o Q5_K_M.
- GPU de datacenter (A100, H100) no son necesarias; el modelo está pensado para ejecución local.
- Despliegue: llama.cpp build 12110 o superior (`llama-cli`, `llama-server`), LM Studio, Ollama y wllama en navegador. Requiere `--jinja` para la plantilla de chat embebida.
- Throughput y latencia: no disponibles en la información proporcionada. Con ~1B parámetros activos por token, la decodificación es ligera en hardware moderno, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros en la información proporcionada para establecer una comparativa cuantitativa fiable. A continuación se comparan únicamente características estructurales frente a alternativas de la misma categoría (modelos pequeños de ciberseguridad o MoE reducidos), marcando como "no disponible" lo que no consta.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-Cyber-GGUF | ~3,06B totales / ~1B activos | no disponible | Apache-2.0 | GGUF, MLX | Especializado en ciberseguridad, sin filtros de rechazo |
| K2-Horizon-4x0.9B-MoE-heretic (base) | ~3,06B totales / ~1B activos | no disponible | no disponible | safetensors | Base sin ajuste de ciberseguridad; CyberMetric-500 0,714 |
| Modelos de ciberseguridad de ~7B | ~7B | no disponible | variable | GGUF, safetensors | No se dispone de resultados comparables en la información |
| Modelos generalistas pequeños (1-3B) | 1-3B | no disponible | variable | GGUF, safetensors | No se dispone de resultados comparables en la información |

## Limitaciones y advertencias

- Modelo pequeño (~1B parámetros activos): se esperan errores, especialmente en números de CVE exactos, fechas, versiones y flags de herramientas. Verificar siempre antes de actuar.
- Errores confiados documentados por el autor: en una comprobación de 10 respuestas, el modelo describió mal el mecanismo de Kerberoasting (lo presentó como una petición HTTP en lugar de un crackeo offline de un ticket de servicio) y malinterpretó un vector CVSS. Las respuestas suenan fluidas incluso cuando son incorrectas.
- Modo sin razonamiento por defecto: `reasoning_effort` es `none`; los modos `low`, `medium` y `high` existen en el base pero no fueron entrenados en el ajuste fino.
- Expertos casi idénticos: los 4 expertos partieron como copias y el enrutador no se reentrenó, por lo que la especialización por experto es limitada.
- Base sin filtros de rechazo: el modelo base tuvo los rechazos eliminados con Heretic y el ajuste fino no los restauró. El autor restringe el uso a aprendizaje, defensa y pruebas autorizadas; el usuario es responsable del uso.
- Idioma: solo inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Sensibilidad a la cuantización: con ~1B parámetros activos, Q4_K_M y MLX 4-bit pierden calidad de forma notable (KLD 0,0530 y pérdida held-out 1,162 respectivamente); se recomienda Q5_K_M o superior, o MLX 8-bit.
- Licencia Apache-2.0: permite uso comercial, pero el contenido generado en un dominio sensible como ciberseguridad debe revisarse y filtrarse antes de cualquier despliegue en producción.
- Sin datos de benchmarks independientes ni de terceros; las cifras disponibles proceden del propio autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-GGUF
- Modelo base ajustado (bf16): https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber
- Modelo base original (heretic): https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic
- Variante MLX 8-bit: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-4bit
- Demo de chat en navegador: https://huggingface.co/spaces/Lucasgitguy-co/K2-Horizon-Cyber-Chat
- Dataset de entrenamiento: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset de entrenamiento: https://huggingface.co/datasets/Vyber07/cyber-security
- Benchmark CyberMetric: https://huggingface.co/datasets/tihanyin/CyberMetric
- Benchmark ARC: https://huggingface.co/datasets/allenai/ai2_arc
