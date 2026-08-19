# gorbatjovy/DeepSeek-V4-Flash-0731-BahamutRU-t265-abliterated

## Resumen

DeepSeek-V4-Flash-0731-BahamutRU-t265-abliterated es una variante modificada del modelo DeepSeek-V4-Flash-0731 de DeepSeek, publicada por el usuario gorbatjovy. Se trata de una abliteración parcial: se ha eliminado la dirección de rechazo (refusal direction) de los pesos del modelo mediante una ablación direccional de rango 1, fusionando directamente el adaptador LoRA de BahamutRU en los tensores FP8 originales. El resultado es un checkpoint que conserva las capacidades del modelo base pero sin el comportamiento de rechazo ante peticiones potencialmente dañinas.

El modelo tiene 305.463.875.518 parámetros (aproximadamente 305,5 mil millones) y se distribuye en formato FP8 (e4m3 con block scales ue8m0 de 128x128), ocupando 168,2 GB en el repositorio. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con 256 expertos enrutados por capa y un experto compartido, aunque el detalle de parámetros activos no se especifica en la información disponible. La relevancia actual del modelo radica en que permite estudiar el comportamiento de un sistema de gran tamaño sin mecanismos de rechazo, manteniendo según la evaluación del autor un rendimiento dentro del ruido respecto al base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 256 expertos enrutados y experto compartido (detalle completo no disponible) |
| Parametros totales | 305.463.875.518 (305,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (e4m3, block scales ue8m0 128x128) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint oficial `deepseek-ai/DeepSeek-V4-Flash-0731` y aplica una ablación direccional de rango 1 sobre un subconjunto de tensores. El método, implementado con la herramienta Heretic de Philipp Emanuel Weidmann, consiste en la operación `W <- W - lam * r (r^T W)`, donde `r` es la dirección de rechazo identificada por el adaptador LoRA del repositorio `BahamutRU/DeepSeek-V4-Flash-0731-heretic-abliterated-v2-GGUF-lora`. El adaptador se fusiona directamente en los pesos FP8, de modo que no existe LoRA en tiempo de ejecución.

Se modificaron 57 tensores objetivo (114 contando los block scales): las proyecciones de salida de atención (`layers.{11..42}.attn.wo_b`) y las down-proyecciones del experto compartido (`layers.{18..42}.ffn.shared_experts.w2`). Los 72.203 tensores indexados restantes, incluidos todos los expertos enrutados, son byte-idénticos al release oficial. El proceso de fusión requirió de cuantificar FP8, sumar el delta del adaptador y re-cuantificar, elevando el exponente de algunos bloques para evitar recortes; no se produjo ningún clamp y el pico de overshoot fue de 1,095x. El valor de lambda varía entre 0,72 y 4,88 según la capa, con pico en la capa 31; por encima de 2,0 el componente de rechazo se invierte en lugar de simplemente eliminarse. La aplicación es parcial: el adaptador original también ablaciona las down-proyecciones de los expertos enrutados (256 expertos x 31 capas), que están en FP4 y no se tocaron.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base en tareas de conocimiento y razonamiento, con MMLU-Pro dentro del ruido estadístico respecto al base.
- Generación de código: HumanEval+ y MBPP+ se mantienen estables (88,4% y 73,3% respectivamente en la evaluación del autor).
- Tool calling / function calling: soporte intacto, con 100% de acierto en selección de herramienta y argumentos en las pruebas realizadas.
- Seguimiento de instrucciones: IFEval (prompt strict) en 82,6%, ligeramente por debajo del 83,4% del base.
- Generación de formato largo: la diversidad léxica y el comportamiento de repetición se mantienen, con un type-token ratio creativo de 0,3583 frente a 0,3392 del base.
- Modo de razonamiento (thinking): el modelo base soporta un campo `reasoning_content` y presupuesto de tokens, aunque la evaluación se realizó con el thinking deshabilitado.
- Comportamiento sin rechazo: la dirección de rechazo ha sido ablacionada, por lo que el modelo no muestra el comportamiento de negativa habitual ante peticiones que el base rechazaría.

## Casos de uso

- Investigación en alineación y seguridad de IA: permite estudiar empíricamente qué mecanismos internos sostienen el rechazo y cómo afecta su eliminación a otras capacidades, comparando con el checkpoint base.
- Evaluación de robustez de sistemas de moderación: útil para probar filtros y clasificadores de contenido, ya que genera respuestas que un modelo estándar negaría.
- Generación creativa de ficción sin restricciones temáticas: escritura de narrativa con contenido adulto o transgresor donde las políticas del modelo base limitarían la salida.
- Desarrollo de personajes de rol y chatbots sin censura: aplicaciones de rol conversacional donde el usuario busca respuestas sin filtros morales predefinidos, siempre bajo responsabilidad del operador.
- Análisis de drift comportamental: al estar los pesos mayoritariamente intactos, sirve como banco de pruebas para medir el impacto de una ablación direccional en la distribución de salidas.
- Fine-tuning posterior para dominios específicos: al ser una modificación sobre pesos FP8, puede servir como punto de partida para ajustes adicionales donde se requiera ausencia de rechazo.

## Benchmarks y rendimiento

La evaluación fue realizada por el autor el 16-17 de agosto de 2026 sobre 2x DGX Spark con vLLM, TP=2 y caché KV en FP8, comparando contra el base sin abliterar con prompts, semillas y configuración idénticas. Los resultados son los siguientes:

| Benchmark | Base | Este modelo |
|---|---|---|
| IFEval (prompt strict) | 83,4% | 82,6% |
| HumanEval+ | 87,8% | 88,4% |
| MBPP+ | 73,3% | 73,3% |
| MMLU-Pro | 78,9% | 77,9% |
| Tool calling: herramienta correcta | 100,0% | 100,0% |
| Tool calling: argumentos correctos | 100,0% | 100,0% |
| Tool calling: falsos positivos | 0,0% | 0,0% |
| KL media primer token | — | 0,1117 |
| KL mediana primer token | — | 0,0120 |
| KL p90 primer token | — | 0,3761 |
| Acuerdo top-1 de token | — | 91,2% |
| Distinct-3 medio | 0,9834 | 0,9833 |
| Type-token ratio creativo | 0,3392 | 0,3583 |

El autor advierte que MMLU-Pro está infraponderado (280 muestras, ±2,4%), que HumanEval y MBPP están contaminados y solo sirven como señal de regresión, que el tool calling usó solo 24 muestras, y que la KL cubre únicamente los primeros tokens. La tasa de rechazo no se reporta en esta evaluación; el autor del adaptador midió 12 rechazos sobre 140 prompts dañinos.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 305 GB, por lo que se requiere un mínimo de 4 GPU con 80 GB o 8 GPU con 40 GB solo para los pesos, más la caché KV y el overhead del runtime.
- GPU recomendadas: la evaluación se realizó en 2x DGX Spark (con memoria unificada de alta capacidad). En entornos convencionales se necesitarían nodos con H100 80 GB o A100 80 GB en configuración multi-GPU.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (una RTX 4090 dispone de 24 GB). Se descarta el despliegue local en equipos domésticos.
- Opciones de despliegue: vLLM con tensor parallelism (TP=2 usado en la evaluación), o alternativas como TGI que soporten FP8 y MoE.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos abliterados de tamaño comparable en la información proporcionada. La comparación directa más relevante es contra el checkpoint base `deepseek-ai/DeepSeek-V4-Flash-0731`:

| Modelo | Parametros | Formato | Licencia | Diferencias clave |
|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 305,5 B | FP8 | MIT | Mantiene el comportamiento de rechazo original |
| Este modelo | 305,5 B | FP8 | MIT | Ablación parcial de la dirección de rechazo (atención y experto compartido) |

Otras variantes abliteradas del mismo base, como el adaptador GGUF de BahamutRU, existen pero no se han evaluado con la misma metodología, por lo que no se incluyen en esta comparativa.

## Limitaciones y advertencias

- El comportamiento de rechazo se ha eliminado deliberadamente. El modelo intentará responder a cualquier petición, incluida contenido dañino o ilegal. La responsabilidad de su uso recae íntegramente en el operador.
- La ablación es parcial: los expertos enrutados (256 x 31 capas) no fueron modificados porque están en FP4, por lo que el efecto completo del adaptador t265 no se aplica.
- Existe un drift medible respecto al base: KL media de 0,1117 en primeros tokens y acuerdo top-1 del 91,2%. Aunque pequeño, no es despreciable en aplicaciones sensibles.
- Los benchmarks de código (HumanEval, MBPP) están contaminados y solo sirven como señal de regresión, no como afirmación de capacidad absoluta.
- La evaluación se realizó con el modo de pensamiento deshabilitado; los resultados no reflejan el comportamiento con thinking activado.
- La tasa de rechazo no se midió en esta evaluación; el dato del adaptador original (12/140) proviene de un conjunto de prompts distinto.
- No se dispone de información sobre idiomas soportados, longitud de contexto ni parámetros activos, lo que limita la planificación de despliegues.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente sin validación comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gorbatjovy/DeepSeek-V4-Flash-0731-BahamutRU-t265-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Adaptador original: https://huggingface.co/BahamutRU/DeepSeek-V4-Flash-0731-heretic-abliterated-v2-GGUF-lora
