# numen-tech/MiniCPM5-1B-4bit-NQ

## Resumen

MiniCPM5-1B-4bit-NQ es una compilación cuantizada a 4 bits del modelo openbmb/MiniCPM5-1B, publicada por numen-tech bajo el esquema propio "Numen Quant" (NQ). No es un modelo entrenado desde cero: se trata de los pesos del modelo base de OpenBMB modificados y cuantizados en formato MLX para su ejecución en Apple Silicon, con arquitectura, tokenizer y plantilla de chat sin cambios respecto al original.

El modelo resuelve el problema de desplegar un LLM de ~1.080 millones de parámetros en hardware de borde, concretamente en equipos Mac con memoria unificada. El repositorio ocupa 0,6 GB en safetensors, lo que permite cargarlo en memoria de forma holgada en cualquier Mac moderno y ejecutar generación de texto, con las etiquetas de contexto largo y tool calling heredadas del modelo base.

Su relevancia es doble: por un lado, ofrece una alternativa de cuantización que, según la model card, recupera parte de la degradación que introduce la cuantización afín estándar de MLX (media de 51,65 frente a 49,95 en el conjunto de tareas reportado); por otro, está liberado con licencia Apache 2.0, lo que facilita su uso comercial. La información pública disponible es limitada: no se detallan datos de entrenamiento ni la longitud de contexto del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "llama" en el repositorio; arquitectura sin modificar respecto a openbmb/MiniCPM5-1B) |
| Parámetros totales | 1.080.632.832 (dato real de los safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el repositorio incluye la etiqueta "long-context", pero no se especifica la cifra) |
| Tipos de cuantización | 4 bits afín, group size 64 (formato NQ); solo se publica esta variante |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx, no GGUF ni PyTorch) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un reentrenamiento. La model card indica explícitamente que los pesos de openbmb/MiniCPM5-1B se han modificado y cuantizado a 4 bits con group size 64, manteniendo intactos la arquitectura, el tokenizer y la plantilla de chat. El pipeline declarado es text-generation y la etiqueta de arquitectura presente en el repositorio es "llama", lo que apunta a un transformer decoder-only de ~1,08B parámetros; los detalles concretos de capas, atención y dimensiones no se publican en la información disponible.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre fases de RLHF, DPO o ajuste por instrucciones del modelo base. Tampoco se documenta ninguna innovación técnica propia más allá del procedimiento de cuantización NQ, cuyo método exacto (más allá de ser afín a 4 bits con grupo de 64) no se describe. La innovación diferencial declarada es empírica: la comparación contra la conversión estándar `mlx_lm.convert -q --q-bits 4 --q-group-size 64` del mismo checkpoint, ejecutada con `mlx_lm.evaluate` y lm-evaluation-harness 0.4.13.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat compatible con `tokenizer.apply_chat_template`.
- Razonamiento y respuesta a preguntas de conocimiento general, evaluado en tareas zero-shot como BoolQ, ARC, HellaSwag, OBQA, PIQA, SIQA y WinoGrande.
- Tool calling / function calling: el repositorio incluye la etiqueta "tool-calling", heredada del modelo base; no se aporta una evaluación específica de esta capacidad en la variante cuantizada.
- Contexto largo: etiqueta "long-context" presente, sin cifra de ventana publicada.
- Ejecución en dispositivo (on-device / edge-ai) sobre Apple Silicon mediante MLX, con un peso de 0,6 GB.
- Capacidades multilingües limitadas a inglés y chino; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio, thinking mode ni decodificación especulativa en la información disponible.

## Casos de uso

- Asistentes locales en aplicaciones de escritorio para macOS: el modelo se carga con `mlx_lm.load` desde 0,6 GB de pesos, por lo que puede integrarse en una app nativa que ejecute inferencia completamente offline en la memoria unificada del equipo, sin depender de API externa.
- Procesamiento de texto en el borde con requisitos de privacidad: clasificación, resumen y extracción de entidades sobre documentos que no pueden salir del dispositivo, aprovechando que no hay llamadas de red ni servidores intermedios.
- Prototipado rápido de pipelines de generación en Mac: al ser compatible con `mlx-lm` y con la plantilla de chat estándar, sirve para validar prompts y flujos conversacionales antes de migrar a un modelo mayor o a otro runtime.
- Agentes ligeros con tool calling: la etiqueta de tool calling permite experimentar con flujos de llamada a funciones en entornos de borde, aunque conviene validar la fiabilidad de las llamadas en esta variante de 4 bits antes de usarla en producción.
- Soporte bilingüe inglés-chino en aplicaciones de atención al cliente: el modelo cubre ambos idiomas de forma nativa, adecuado para respuestas de primer nivel o triaje de consultas con derivación a un modelo mayor cuando la confianza sea baja.
- Evaluación y comparación de técnicas de cuantización: el repositorio publica su propio conjunto de resultados frente a BF16 y a la cuantización afín de MLX, lo que lo convierte en un punto de referencia útil para reproducir y contrastar metodologías de cuantización en modelos de ~1B.
- Base para ajuste fino con LoRA en MLX: al partir de un modelo de 1,08B parámetros y 0,6 GB, es viable adaptarlo a dominios concretos en hardware de consumo, aunque no se documentan recetas de ajuste específicas en la información disponible.

## Benchmarks y rendimiento

Resultados zero-shot publicados en la model card (lm-evaluation-harness 0.4.13 vía `mlx_lm.evaluate`; `acc_norm` donde la tarea lo define, `acc` en el resto; una sola ejecución por modelo, con errores estándar por tarea de 0,5 a 2,1 puntos):

| Modelo | WinoGrande | BoolQ | ARC-c | ARC-e | HellaSwag | OBQA | PIQA | SIQA | Media |
|---|---|---|---|---|---|---|---|---|---|
| BF16 (original) | 56,1 | 72,7 | 38,2 | 62,4 | 48,7 | 33,4 | 66,9 | 40,4 | 52,36 |
| MLX affine 4-bit | 56,2 | 68,7 | 34,5 | 58,8 | 46,0 | 30,6 | 66,9 | 37,9 | 49,95 |
| NQ 4-bit | 54,4 | 72,2 | 36,8 | 62,0 | 47,0 | 33,6 | 67,6 | 39,7 | 51,65 |

Lectura de los datos: NQ 4-bit queda 0,71 puntos por debajo del BF16 original en la media y 1,70 puntos por encima de la cuantización afín de MLX con la misma configuración nominal. Las mayores pérdidas frente a BF16 se dan en WinoGrande (-1,7) y ARC-c (-1,4); en PIQA y OBQA la variante cuantizada supera ligeramente al original, diferencia que cae dentro del margen de error declarado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de tareas de tool calling en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 0,6 GB de pesos en disco y en memoria para la variante 4 bits; el BF16 equivalente requeriría aproximadamente 2,2 GB solo en pesos.
- GPU recomendadas: cualquier chip de Apple Silicon (series M1, M2, M3, M4 y posteriores), que es el único backend soportado por el formato publicado; no se distribuyen pesos para CUDA.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la memoria unificada de cualquier Mac moderna; en GPUs NVIDIA no es utilizable sin reconvertir los pesos a otro formato.
- Opciones de despliegue: `mlx-lm` (carga y generación vía API de Python, tal como documenta la model card); para vLLM, llama.cpp, Ollama o TGI sería necesario convertir los pesos a GGUF o a un formato compatible, conversión que no se documenta ni se garantiza en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media (8 tareas) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| numen-tech/MiniCPM5-1B-4bit-NQ | 1,08B | no disponible | 51,65 | Apache 2.0 | MLX safetensors, 0,6 GB |
| openbmb/MiniCPM5-1B (BF16) | 1,08B | no disponible | 52,36 | Apache 2.0 | safetensors, ~2,2 GB estimados |
| MLX affine 4-bit (conversión estándar del mismo base) | 1,08B | no disponible | 49,95 | Apache 2.0 | MLX safetensors |

Frente a alternativas de otras familias en el segmento de ~1B (por ejemplo Llama-3.2-1B-Instruct o Qwen2.5-1.5B-Instruct), no se dispone de resultados comparables en la información proporcionada, ya que las tareas evaluadas aquí no se publican para esos modelos en este repositorio. La comparación honesta posible es interna: misma arquitectura, mismo tokenizer, distinto esquema de cuantización.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composición del dataset de entrenamiento del modelo base, no es posible evaluar sesgos de género, etnia, religión o idioma.
- Riesgo de alucinación: relevante en un modelo de ~1B parámetros; los resultados en tareas de conocimiento (ARC-c 36,8; OBQA 33,6) indican un margen amplio de error en razonamiento factual, por lo que no es adecuado para respuestas de alta precisión sin verificación externa.
- Limitaciones de idioma: solo inglés y chino declarados; el rendimiento en castellano no está evaluado ni soportado oficialmente.
- Limitaciones de contexto: la etiqueta "long-context" no va acompañada de una cifra de ventana, por lo que no se puede planificar su uso en escenarios de contexto largo sin una validación empírica previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar los términos del modelo base openbmb/MiniCPM5-1B, de los que este trabajo es derivado.
- Dependencia de plataforma: los pesos son exclusivamente MLX; quedan atados a Apple Silicon y no se pueden desplegar en servidores NVIDIA o AMD sin una conversión no documentada.
- Robustez de la evaluación: los resultados provienen de una sola ejecución por modelo, con errores estándar de 0,5 a 2,1 puntos; diferencias inferiores a ese margen (como la ventaja de 1,70 puntos sobre la cuantización afín) no deben interpretarse como concluyentes.
- Capacidades heredadas sin verificar: tool calling y contexto largo figuran como etiquetas del repositorio, pero no hay evaluación específica que confirme que se mantienen tras la cuantización a 4 bits.
- Madurez del artefacto: el repositorio registra cero descargas y cero "likes" en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/numen-tech/MiniCPM5-1B-4bit-NQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Librería mlx-lm (repositorio y documentación de instalación y generación): https://github.com/ml-explore/mlx-lm
- lm-evaluation-harness (framework de evaluación citado, versión 0.4.13): https://github.com/EleutherAI/lm-evaluation-harness
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Las búsquedas devuelven únicamente páginas sobre el identificador NUMEN del sistema educativo francés y sobre una empresa de gestión documentaria (numen.fr), sin relación con este artefacto. No se dispone de paper, blog técnico ni demo asociados.
