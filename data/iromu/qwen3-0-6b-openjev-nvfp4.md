# iromu/Qwen3-0.6B-openjev-NVFP4

## Resumen

`iromu/Qwen3-0.6B-openjev-NVFP4` es un ajuste fino supervisado del modelo base `Qwen/Qwen3-0.6B-Base`, orientado a una tarea muy concreta: responder a un prompt de decisión tipada (estado, pregunta y conjunto de opciones) emitiendo una única letra de etiqueta. El autor del checkpoint es el usuario de HuggingFace `iromu`, que publica tres artefactos encadenados: el modelo BF16 con LoRA (`iromu/Qwen3-0.6B-openjev`), cuantizaciones GGUF y esta versión NVFP4 en formato W4A16 (pesos de 4 bits en coma flotante, activaciones en bf16).

La relevancia de esta ficha no está en el tamaño —el recuento de parámetros del fichero `safetensors` es de 375.848.960, por debajo del total nominal de la familia Qwen3-0.6B debido al empaquetado de pesos FP4— sino en el objetivo de despliegue: servir un clasificador de decisiones en hardware de clase GB10 con vLLM y el backend `modelopt_fp4`. El autor documenta explícitamente por qué eligió W4A16 en lugar de W4A4: la ruta W4A4 de vLLM lee un `input_scale` estático que el export de ModelOpt no genera, lo que produce salidas degeneradas.

El modelo no pretende ser un reemplazo generalista de Qwen3: es un componente especializado de una sola etiqueta por respuesta, con licencia Apache 2.0 y declaración de idioma únicamente en inglés. Su interés práctico es como bloque de enrutado o clasificación de bajísimo coste dentro de pipelines mayores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (modelo base `Qwen/Qwen3-0.6B-Base`), ajustado con LoRA y cuantizado a NVFP4 |
| Parametros totales | 375.848.960 según el recuento de `safetensors` del repo (el empaquetado FP4 y los módulos que se mantienen en bf16 hacen que este número no coincida con el total nominal de Qwen3-0.6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó `max_seq_length` de 4096 tokens |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos FP4 empaquetados como U8, dos valores por byte; escalas por grupo F8_E4M3 y escala global F32; activaciones bf16). `lm_head` y `model.embed_tokens` permanecen en bf16. Existen cuantizaciones GGUF en el repo hermano |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con configuración `hf_quant_config.json` para vLLM; GGUF disponible en `iromu/Qwen3-0.6B-openjev-GGUF`; BF16 en `iromu/Qwen3-0.6B-openjev` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B-Base, un transformer decoder-only de pequeña escala. Sobre él se aplicó un ajuste fino supervisado con LoRA de rango 32, alpha 32 y dropout 0.05, con módulos objetivo `*.proj` (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se ejecutó con NeMo-RL en bfloat16, con AdamW, learning rate 5e-5, weight decay 0.01, 100 pasos de warmup lineal y decaimiento coseno hasta 1e-6, batch global de 64 (micro-batch 2), 1250 pasos totales con validación cada 125 y longitud máxima de secuencia de 4096 tokens. La pérdida es entropía cruzada enmascarada al turno del asistente mediante la plantilla de chat de decisión.

El corpus es el split `train` de `ZefanCai/Open-Jev`, una colección de decisiones tipadas: cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre esas opciones; el objetivo de entrenamiento es la opción argmax, serializada como una única letra de etiqueta. La innovación técnica relevante no está en el ajuste sino en el pipeline de cuantización: se usó NVIDIA ModelOpt con la configuración `W4A16_NVFP4_CFG` y exportación mediante `export_hf_checkpoint`, que escribe pesos FP4 empaquetados, escalas y el fichero `hf_quant_config.json` que consume el servidor. La decisión deliberada de quedarse en W4A16 (solo pesos) en lugar de W4A4 evita el fallo de la ruta W4A4 de vLLM descrito por el autor, que requiere un `input_scale` estático que el export dinámico no incluye.

## Capacidades

- Selección de una única etiqueta a partir de un prompt de decisión tipada (estado + pregunta + opciones), devolviendo una letra de opción.
- Clasificación y enrutado de baja latencia sobre un vocabulario cerrado de opciones definido por el prompt.
- Generación de texto condicionada a la plantilla de chat de decisión, con la pérdida entrenada específicamente en el turno del asistente.
- Cumplimiento del formato de salida: en validación emitió letra en el 100% de las 3495 filas (3495/3495).
- Soporte de decodificación greedy a través de vLLM con el backend `modelopt_fp4`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, ni modo *thinking*.
- Capacidad multilingüe no documentada; la model card declara únicamente inglés.

## Casos de uso

- **Enrutado de decisiones en pipelines de agentes**: dado un estado del sistema y un conjunto cerrado de acciones posibles, el modelo devuelve la letra de la acción elegida. Su ventana de entrenamiento de 4096 tokens permite incluir el estado completo junto con las opciones en un único prompt.
- **Clasificación de tickets o mensajes en categorías predefinidas**: se presenta el texto como estado, la pregunta como "¿qué categoría?" y las categorías como opciones; la salida de una sola letra simplifica el parseo y elimina la necesidad de post-procesado con expresiones regulares.
- **Selección de herramienta en un router previo a un LLM mayor**: el modelo actúa como primer escalón de bajo coste que decide qué herramienta o submodelo invocar, reservando el modelo grande para la ejecución real.
- **Etiquetado a escala sobre hardware de clase GB10**: con pesos NVFP4 y W4A16, el checkpoint está pensado para servir en dispositivos con memoria unificada limitada, donde un clasificador de 0,6B encaja mejor que un modelo generativo general.
- **Filtrado y moderación con política enumerada**: las reglas de la política se escriben como opciones y el estado como el contenido a evaluar; la salida argmax mapea directamente a la acción de moderación.
- **Evaluación A/B y anotación de datasets de preferencias**: al ser un ajuste sobre distribuciones de probabilidad convertidas a argmax, sirve para reproducir etiquetas de referencia en corpus de decisión y detectar discrepancias frente a anotadores humanos.
- **Despliegue en vLLM con cuantización FP4**: integrable mediante `vllm serve iromu/Qwen3-0.6B-openjev-NVFP4 --quantization modelopt_fp4` en entornos que ya operan vLLM, sin cambios en el cliente más allá del formato de prompt.

## Benchmarks y rendimiento

Los únicos datos publicados son la tabla de validación del autor sobre el split `validation` de Open-Jev (3495 filas, decodificación greedy). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Modelo | Cuantización | Cap | n | Letra emitida | Letra correcta | Δ correcta vs BASE |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-openjev | BF16 | 384 tok | 3495 | 3495/3495 (100,0%) | 2968/3495 (84,9%) | (predecesor) |
| Qwen3-0.6B-openjev | NVFP4 (W4A16) | 384 tok | 3495 | 3495/3495 (100,0%) | 2908/3495 (83,2%) | −1,7 pp |

El autor advierte que la métrica de throughput corresponde a decodificación greedy en un solo stream, no a throughput de servidor con concurrencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,6 GB, de los cuales la mayoría son pesos FP4 empaquetados; con activaciones bf16 y caché KV para 4096 tokens, el consumo esperable se sitúa en torno a 2-3 GB, aunque no se publica una medición oficial.
- GPU recomendadas: hardware con soporte nativo de FP4, es decir, la clase GB10 citada explícitamente por el autor (Grace Blackwell) y, por extensión, GPUs Blackwell. No se documenta el comportamiento en arquitecturas anteriores.
- Cabe holgadamente en GPU de consumo con suficiente VRAM; el requisito real es el soporte del kernel FP4, no la capacidad de memoria.
- Opciones de despliegue: vLLM con `quantization="modelopt_fp4"` (ruta validada por el autor, tanto por CLI como por API Python), y llama.cpp u Ollama a través del repo hermano GGUF. TGI figura en los tags del repo, pero no se documenta configuración específica.
- Latencia y throughput: no disponibles. La model card solo indica que las cifras de validación son de un único stream greedy.
- Advertencia de despliegue: no usar configuraciones W4A4 con este export; la ruta W4A4 de vLLM lee un `input_scale` no inicializado y produce salidas degeneradas en todas las filas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Letra correcta (Open-Jev val) | Licencia | Formato |
|---|---|---|---|---|---|
| `iromu/Qwen3-0.6B-openjev-NVFP4` (este) | 375.848.960 en safetensors | No disponible (entreno a 4096) | 83,2% (2908/3495) | Apache 2.0 | safetensors NVFP4 W4A16 |
| `iromu/Qwen3-0.6B-openjev` (BF16) | No disponible | No disponible (entreno a 4096) | 84,9% (2968/3495) | Apache 2.0 | safetensors bf16 |
| `iromu/Qwen3-0.6B-openjev-GGUF` | No disponible | No disponible | No disponible | Apache 2.0 | GGUF |
| `Qwen/Qwen3-0.6B-Base` (base sin ajustar) | No disponible en la información | No disponible en la información | No disponible | No disponible en la información | safetensors |

La comparación relevante es interna a la familia: el paso a NVFP4 cuesta 1,7 puntos porcentuales de exactitud frente al BF16 a cambio de reducir el peso del checkpoint y habilitar el serving FP4. El modelo base sin ajustar no se evalúa en la tabla publicada, por lo que no puede cuantificarse la ganancia del ajuste LoRA con los datos disponibles.

## Limitaciones y advertencias

- El modelo está entrenado para emitir una única letra de etiqueta; no es adecuado para generación libre, diálogo abierto ni tareas de razonamiento general.
- La cuantización NVFP4 introduce una degradación medible: −1,7 pp de exactitud frente al BF16 (83,2% frente a 84,9%) sobre 3495 filas de validación.
- La model card declara únicamente inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación acotado por el formato, pero real: si el modelo emite una letra que no está entre las opciones del prompt, la salida es inválida sin una validación externa. Se recomienda validar la letra contra el conjunto de opciones antes de consumirla.
- La etiqueta objetivo se deriva del argmax de una distribución de probabilidad, de modo que el modelo hereda cualquier sesgo presente en el corpus Open-Jev y en el proceso de anotación subyacente.
- El checkpoint depende de la ruta de cuantización `modelopt_fp4` de vLLM; no es un safetensors estándar cargable por cualquier runtime de transformers sin la configuración de cuantización asociada.
- No se documenta comportamiento en GPUs sin soporte FP4 nativo; el uso en hardware anterior puede degradar el rendimiento o requerir de-cuantización.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y atribución; conviene verificar igualmente las condiciones del modelo base Qwen3 y del dataset Open-Jev.
- Métricas de validación obtenidas en un único stream greedy; no hay datos de latencia, throughput concurrente ni comportamiento bajo cargas de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/Qwen3-0.6B-openjev-NVFP4
- Modelo BF16 con tabla de validación: https://huggingface.co/iromu/Qwen3-0.6B-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/Qwen3-0.6B-openjev-GGUF
- Modelo base del ajuste: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- NeMo-RL: https://github.com/NVIDIA-NeMo/RL
- vLLM: https://github.com/vllm-project/vllm
