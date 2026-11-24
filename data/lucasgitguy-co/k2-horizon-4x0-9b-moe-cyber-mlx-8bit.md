# Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-8bit

## Resumen

K2-Horizon-4x0.9B-MoE-Cyber-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo K2-Horizon-4x0.9B-MoE-Cyber, un ajuste fino orientado a ciberseguridad desarrollado por el usuario Lucasgitguy-co. El modelo original parte de una arquitectura Mixture-of-Experts (MoE) de cuatro expertos con aproximadamente 0,9B de parámetros activos por token, y esta versión está pensada específicamente para ejecutarse en Apple silicon mediante la librería mlx-lm.

El modelo resuelve el caso de uso de asistentes conversacionales especializados en seguridad informática (explicación de vectores CVSS, técnicas como pass-the-hash, conceptos de defensa y pentesting autorizado) en hardware de consumo Mac. Al ser una cuantización MLX de 8 bits con group size 64, reduce el peso del repositorio a 3,3 GB manteniendo el router de cuatro vías en bf16 para preservar la calidad del enrutamiento.

Es relevante ahora porque demuestra el patrón de publicar variantes cuantizadas para runtimes específicos (MLX, GGUF) de modelos pequeños y especializados, con métricas de evaluación honestas sobre el impacto de la cuantización. La ficha debe leerse con cautela: el propio autor advierte de que el modelo comete errores confiados en detalles técnicos y de que la mejora en conocimiento de ciberseguridad medida en benchmarks es pequeña y dentro del margen de error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de 4 expertos, transformer; puerto MLX en `k2_horizon_mlx.py` |
| Parametros totales | 3.060.266.496 (~3,06B) |
| Parametros activos | ~0,9B por token (4 expertos de ~0,9B, top-1 routing) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64; router de 4 vías en bf16. Existen variantes MLX 4-bit y GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 3,3 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base es un MoE de cuatro expertos con enrutamiento top-1, donde cada experto ronda los 0,9B de parámetros y el modelo completo suma unos 3,06B. El ajuste fino se realizó con LoRA por experto sobre un base al que previamente se le habían eliminado los rechazos mediante la técnica Heretic (de ahí la etiqueta `uncensored`). Los datos de entrenamiento provienen de los datasets `Voidreaper2026/cybersec-master-dataset` y `Vyber07/cyber-security`, en inglés. El autor indica que las preguntas que coincidían con preguntas de CyberMetric o ARC fueron eliminadas del conjunto de entrenamiento para evitar contaminación.

Una particularidad técnica importante: mlx-lm no incluye soporte nativo para la arquitectura `k2_horizon`, por lo que el repositorio incluye el código del modelo (`k2_horizon_mlx.py`) referenciado desde `config.json` mediante `"model_file"`. Esto obliga a cargar el modelo con `--trust-remote-code`; aplicaciones que no pasan esa opción (como el motor MLX de LM Studio) no podrán cargar este repositorio y deberán usar la versión GGUF. El autor reporta que el puerto se validó contra el código transformers original con una concordancia top-1 de 1.000 en fp32. La cuantización MLX es affine de 8 bits con group size 64, manteniendo el router en bf16.

## Capacidades

- Generación de texto conversacional en inglés, orientada a dominios de ciberseguridad.
- Explicación de conceptos de seguridad: vectores CVSS, técnicas de ataque y defensa (pass-the-hash, Kerberoasting, etc.), aunque con errores documentados en detalles.
- Respuesta a preguntas de opción múltiple tipo examen (evaluado en CyberMetric-500 y ARC-Easy).
- Modo "no-think" por defecto (`reasoning_effort = none`); los modos `high`, `medium` y `low` existen heredados del base pero no fueron entrenados en el ajuste fino.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Formación y estudio de ciberseguridad: el modelo puede explicar conceptos como pass-the-hash o vectores CVSS en un entorno local sobre Mac, útil para prácticas de laboratorio donde no se quiere enviar consultas a servicios en la nube.
- Asistente de repaso para certificaciones: con CyberMetric-500 como referencia (0,732), sirve para generar preguntas y explicaciones de conceptos, siempre verificando los datos exactos.
- Borrador de documentación de defensa: redactar notas explicativas sobre detección de técnicas de ataque, que el analista revisa y corrige antes de publicar.
- Chat local de apoyo en un SOC doméstico o laboratorio: al ejecutarse con mlx-lm en Apple silicon, permite conversaciones multi-turno sin conexión ni coste de API.
- Pruebas de concepto de despliegue MLX: sirve como ejemplo práctico de cómo portar y cuantizar un MoE personalizado a mlx-lm con `trust_remote_code`.
- Evaluación de impacto de cuantización: comparar el comportamiento 8-bit frente a bf16 y 4-bit usando las métricas publicadas (CyberMetric-500 y held-out loss) en pipelines de investigación.
- Generación de material de concienciación: producir explicaciones introductorias sobre amenazas para equipos no técnicos, con revisión humana obligatoria por el riesgo de errores confiados.

## Benchmarks y rendimiento

| Modelo | CyberMetric-500 | ARC-Easy (500) | Held-out answer loss |
|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-heretic (base) | 0,714 | 0,782 | 1,686 |
| K2-Horizon-4x0.9B-MoE-Cyber (bf16) | 0,732 | 0,770 | 1,020 |
| MLX 8-bit (este modelo) | 0,732 | no disponible | 1,021 |
| MLX 4-bit | 0,684 | no disponible | 1,162 |

Notas del autor: la evaluación de opción múltiple se puntúa por log-probabilidad de la letra de cada opción tras `Answer:` en el turno del asistente, en modo no-think y con el mismo prompt para todos los modelos. CyberMetric-500 corresponde a `tihanyin/CyberMetric` (Apache-2.0) y ARC-Easy a las primeras 500 preguntas del split de test de `allenai/ai2_arc`. El held-out loss es la pérdida media sobre tokens de respuesta en 200 filas de validación nunca entrenadas. El margen de error aproximado es de ±0,02 (un error estándar) para 500 preguntas. El propio autor señala que la caída del held-out loss es grande (el modelo aprendió el estilo y contenido de las respuestas de entrenamiento) pero que los cambios en opción múltiple son pequeños y dentro del margen de error, por lo que no demuestran una mejora clara del conocimiento de ciberseguridad. La versión MLX 4-bit pierde calidad de forma notable; se recomienda 8-bit en MLX o Q5_K_M y superiores en GGUF.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 3,3 GB; con overhead de runtime MLX, se recomienda al menos 6-8 GB de memoria unificada para inferencia cómoda.
- GPU recomendadas: Apple silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante mlx-lm. No está pensado para GPU NVIDIA/AMD con CUDA o ROCm; para esas plataformas usar la variante GGUF con llama.cpp.
- Cabe en hardware de consumo: sí, en cualquier Mac con memoria unificada suficiente (8 GB o más recomendable). Para GPUs de consumo NVIDIA, usar la versión GGUF.
- Opciones de despliegue: mlx-lm 0.32.2 o superior con `--trust-remote-code` (obligatorio); GGUF con llama.cpp (build 12110+), LM Studio u Ollama para plataformas no Apple; demo en navegador en el Space K2-Horizon Cyber Chat.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-Cyber-MLX-8bit | ~3,06B totales / ~0,9B activos | no disponible | CyberMetric-500 0,732; ARC-Easy no disponible | Apache-2.0 | MLX 8-bit, MLX 4-bit, GGUF, demo web |
| K2-Horizon-4x0.9B-MoE-Cyber (bf16) | ~3,06B totales / ~0,9B activos | no disponible | CyberMetric-500 0,732; ARC-Easy 0,770 | Apache-2.0 | transformers con `trust_remote_code` |
| K2-Horizon-4x0.9B-MoE-heretic (base) | ~3,06B totales / ~0,9B activos | no disponible | CyberMetric-500 0,714; ARC-Easy 0,782 | Apache-2.0 | transformers |

No se dispone en la información proporcionada de comparativas con modelos de otros autores de la misma categoría (asistentes de ciberseguridad o MoE pequeños); por tanto, la comparación se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Modelo pequeño: unos 0,9B de parámetros activos por token; se esperan errores, especialmente en números CVE exactos, fechas, versiones y flags de herramientas. Verificar antes de actuar sobre una respuesta.
- Errores confiados documentados: en una comprobación de 10 respuestas, el modelo describió mal el mecanismo de Kerberoasting (es un crackeo offline de un ticket de servicio, no una petición HTTP) y malinterpretó un vector CVSS. Las respuestas suenan fluidas aunque sean incorrectas.
- Modo no-think por defecto: `reasoning_effort` es `none`; los modos `high`, `medium` y `low` existen heredados del base pero no fueron entrenados en el ajuste fino.
- Expertos casi idénticos: como en el base, los 4 expertos empezaron como copias casi exactas; el LoRA por experto los separa algo, pero el enrutamiento no se reentrenó.
- Base sin censura: los rechazos se eliminaron con Heretic y el ajuste fino no los restauró. Uso previsto para aprendizaje, defensa y pruebas autorizadas; la responsabilidad del uso recae en el usuario.
- Solo inglés: los datos de entrenamiento son en inglés.
- La cuantización 8-bit altera ligeramente el modelo (held-out loss 1,021 frente a 1,020 en bf16); la 4-bit pierde calidad de forma notable.
- Requiere `--trust-remote-code` en mlx-lm; aplicaciones que no lo permiten (por ejemplo, el motor MLX de LM Studio) no cargarán este repositorio.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado sobre seguridad ofensiva debe someterse a revisión y a un marco de uso autorizado.
- Riesgo de alucinación en detalles técnicos y de sesgos derivados de los datasets de entrenamiento, no analizados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-8bit
- Modelo base (bf16): https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber
- Variante MLX 4-bit: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-4bit
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-GGUF
- Modelo heretic (base sin ajuste de ciberseguridad): https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic
- Demo en navegador: https://huggingface.co/spaces/Lucasgitguy-co/K2-Horizon-Cyber-Chat
- Dataset CyberMetric: https://huggingface.co/datasets/tihanyin/CyberMetric
- Dataset de entrenamiento: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset de entrenamiento: https://huggingface.co/datasets/Vyber07/cyber-security
