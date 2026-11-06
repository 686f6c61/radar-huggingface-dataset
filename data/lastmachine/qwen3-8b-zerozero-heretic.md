# LastMachine/Qwen3-8B-ZeroZero-Heretic

## Resumen
Qwen3-8B-ZeroZero-Heretic es una variante modificada de Qwen3-8B, el modelo denso de 8.200 millones de parametros desarrollado por el equipo Qwen de Alibaba. La modificacion la firma LastMachine, un publicador independiente, mediante la herramienta Heretic 2, que aplica tecnicas de "abliteration" para reducir los rechazos (refusals) y el denominado "slop" (muletillas y relleno generico) del modelo original. El resultado conserva la arquitectura y el tokenizador intactos, pero altera el comportamiento conversacional.

El modelo resuelve un problema muy concreto: obtener una version de Qwen3-8B que responda a peticiones que el modelo base rechaza por sus politicas de seguridad, y que ademas produzca texto menos generico. Segun la model card, los rechazos en el conjunto de prueba de Heretic caen un 91% (de 100/100 a 9/100) y las palabras de relleno por cada 1.000 se reducen un 78% (de 16,5 a 3,6), manteniendo los mismos resultados en las comprobaciones de hechos y logica (13/15).

Es relevante ahora porque ejemplifica una tendencia creciente de derivados "sin censura" construidos sobre modelos abiertos de ultima generacion, y porque la propia model card documenta con transparencia los riesgos: el modelo puede producir contenido danino o falso y no incorpora ningun filtro interno. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas |
| Parametros totales | 8.190.735.360 (8,2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos |
| Tipos de cuantizacion | safetensors en BF16/FP16; GGUF Q4_K_M y MLX 4-bit en repos derivados |
| Idiomas soportados | en (segun metadatos; el modelo base Qwen3 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF y MLX en repos separados |

## Arquitectura y entrenamiento
La arquitectura es identica a la de Qwen3-8B: un transformer denso de 36 capas con 8,2 mil millones de parametros, tokenizador original y modo de razonamiento ("thinking mode") conservado. No hay cambios estructurales ni de vocabulario; la modificacion actua exclusivamente sobre los pesos para alterar la distribucion de respuestas.

El proceso de modificacion emplea Heretic 2.0.0, herramienta de Philipp Emanuel Weidmann (licencia AGPL-3.0), que optimiza la supresion de direcciones de activacion asociadas a rechazos y a "slop". Se realizaron 50 ensayos para la componente de rechazos y 50 para la de slop, seleccionando el ensayo 39 y despues el 20. La divergencia KL respecto al modelo base es de 2,69 en prompts inofensivos, lo que indica un alejamiento considerable de Qwen3-8B; respecto al modelo "decensored" intermedio en prompts de escritura, la KL es de 0,76. No se realizo un reentrenamiento supervisado ni RLHF adicional segun la informacion disponible.

## Capacidades
- Generacion de texto conversacional en ingles con modo de razonamiento activable o desactivable mediante `enable_thinking`.
- Reduccion sustancial de rechazos frente al modelo base en prompts considerados daninos por el test de Heretic.
- Reduccion del relleno generico ("slop") en tareas de escritura.
- Conserva las capacidades del Qwen3-8B original: razonamiento, matematicas y generacion de codigo, aunque la model card no las evalua de forma especifica.
- Soporte de plantilla de chat y tokenizador originales de Qwen3.
- No se documenta soporte explicito de tool calling, function calling ni flujos de agente en la informacion disponible.
- Capacidades multilingues: los metadatos solo declaran ingles, aunque el modelo base es multilingue; no se verifica su preservacion.

## Casos de uso
- Investigacion sobre alineacion y seguridad: permite estudiar como cambia el comportamiento de un modelo al eliminar sus mecanismos de rechazo, comparando directamente con Qwen3-8B y midiendo divergencia KL.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, dialogos o guiones con tematicas que el modelo base rechazaria, usando el modo sin thinking con temperatura 0,7 y top_p 0,8.
- Evaluacion de "slop" y calidad de texto: util como referencia para medir densidad de muletillas frente a otros modelos, dado que la model card reporta 3,6 palabras de relleno por cada 1.000.
- Prototipado local en Apple Silicon: la variante MLX 4-bit permite ejecutar el modelo en LM Studio o mlx-lm en equipos con memoria unificada, sin depender de servicios en la nube.
- Red teaming y pruebas de robustez: sirve como sujeto de prueba para sistemas de moderacion que deban filtrar respuestas de modelos sin guardarrailes.
- Experimentos de destilacion o comparacion de comportamiento: al compartir arquitectura y tokenizador con Qwen3-8B, permite aislar el efecto de la modificacion de pesos en estudios controlados.

## Benchmarks y rendimiento

| Medida | Qwen3-8B | ZeroZero | Claude Opus 5.5 |
|---|---:|---:|---:|
| Rechazos (de 24 preguntas normales) | 2 | 0 | 0 |
| Palabras de slop por 1.000 (escritura) | 16,5 | 3,6 | 3,9 |
| Comprobaciones de hechos y logica | 13/15 | 13/15 | 15/15 |
| Respuestas en bucle | 0 | 0 | 0 |

| Medida interna de Heretic | Antes | Despues |
|---|---:|---:|
| Rechazos en test de prompts daninos | 100/100 | 9/100 |
| Respuestas que activan la lista de slop | 78/100 | 25/100 |
| Palabras de slop por 1.000 | 16,5 | 3,6 |
| Comprobaciones de hechos y logica superadas | 13/15 | 13/15 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Las cifras anteriores proceden de la model card y se basan en muestras pequenas (24 preguntas y 100 prompts), por lo que su valor estadistico es limitado.

## Requisitos de hardware
- VRAM estimada en BF16/FP16: aproximadamente 16,4 GB de pesos, mas overhead de activaciones; se recomienda 20-24 GB.
- VRAM estimada en cuantizacion 4-bit (GGUF Q4_K_M o MLX 4-bit): en torno a 5-6 GB, con margen para contexto.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 (16-24 GB) para cuantizaciones.
- Cabe en GPU de consumo: si, en RTX 4090, 4080, 3090 y en Apple Silicon con memoria unificada mediante MLX.
- Opciones de despliegue: Transformers (>=4.51.0), text-generation-inference, llama.cpp y LM Studio con GGUF, mlx-lm y LM Studio con MLX en macOS.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (24 preguntas) | Slop por 1.000 | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen3-8B-ZeroZero-Heretic | 8,2B | 32.768 | 0 | 3,6 | Apache 2.0 |
| Qwen/Qwen3-8B | 8,2B | 32.768 | 2 | 16,5 | Apache 2.0 |
| Claude Opus 5.5 | no disponible | no disponible | 0 | 3,9 | propietaria |

Frente a Qwen3-8B, la diferencia principal es la eliminacion de rechazos y la reduccion de relleno, con el mismo rendimiento en las comprobaciones de hechos y logica de la model card. Frente a Claude Opus 5.5, el modelo abierto iguala en rechazos y slop en esta muestra, pero queda por debajo en las comprobaciones de hechos y logica (13/15 frente a 15/15). No se dispone de comparaciones con otras variantes abliteradas de Qwen3-8B en la informacion proporcionada.

## Limitaciones y advertencias
- Ausencia total de guardarrailes: el modelo responde a peticiones que Qwen3-8B rechaza; es imprescindible anteponer moderacion propia en cualquier despliegue con usuarios reales.
- Riesgo elevado de alucinacion: la reduccion de slop no implica mayor veracidad; la model card lo advierte de forma explicita.
- Sesgo documentado en temas de China: ante preguntas sobre Tiananmen Square ofrece una version oficial sanitizada que omite las protestas y la represion, y exagera la posicion de "una sola China" sobre Taiwan. No es fiable en ese dominio.
- Escasa capacidad de contraargumentacion: el autor cita que califico de "no del todo irrazonable" invertir los ahorros en loteria; no debe usarse para decisiones financieras, medicas o legales.
- Idioma: los metadatos solo declaran ingles; el rendimiento en castellano no esta verificado.
- Muestra de evaluacion pequena (24 preguntas, 100 prompts), por lo que las cifras de la model card deben tomarse como indicativas.
- Repositorio con acceso restringido (gated): requiere solicitud y aceptacion de terminos en Hugging Face.
- La herramienta Heretic es AGPL-3.0; los pesos resultantes se distribuyen bajo Apache 2.0, pero conviene revisar las implicaciones si se modifica o redistribuye el pipeline.
- Divergencia KL alta respecto al base (2,69 en prompts inofensivos), lo que sugiere posibles degradaciones no medidas en otras tareas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Variante MLX 4-bit: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX
- Variante GGUF Q4_K_M: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Perfil del autor: https://huggingface.co/LastMachine
- Paper de referencia Qwen3: https://arxiv.org/abs/2505.09388
