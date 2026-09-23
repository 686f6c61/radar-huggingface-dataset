# MANGSEOK123/qwen3-4b-tau2-retail_breakdown-1ep

## Resumen

MANGSEOK123/qwen3-4b-tau2-retail_breakdown-1ep es un fine-tune de Qwen/Qwen3-4B-Instruct-2507 orientado al dominio *retail* del benchmark tau2-bench, un entorno de evaluación de agentes conversacionales con tool calling en atención al cliente. El autor lo publica bajo licencia Apache 2.0 con 4.411.424.256 parámetros (4,4 B) y un repositorio de 8,8 GB en formato safetensors. Se trata de un experimento pequeño y muy acotado: 56 pares tarea–memoria, una única época, learning rate constante de 3e-6 y sin señal de recompensa explícita.

La técnica empleada se etiqueta como OEL (*One-Epoch Learning*) y *experience distillation*. El estudiante reproduce cada tarea del conjunto tau2-bench sin memoria en el prompt, mientras que el profesor son los mismos pesos con la memoria de esa tarea inyectada en el system prompt. La única diferencia entre ambos es el prompt, y la pérdida es una KL completa sobre todos los tokens de respuesta con `kl_topk` 256. Esto convierte al modelo en un intento de destilar comportamiento agéntico dependiente de contexto sin necesidad de optimización por recompensa.

Su relevancia es fundamentalmente metodológica y de nicho: es una pieza más de una serie de experimentos del mismo autor sobre tau2-bench (variantes *airline*, *grpo-retail*, *fp117*), no un modelo listo para producción. El propio autor declara que no se ha evaluado tras el entrenamiento y que se subió directamente tras el *run*. Para cualquier uso serio conviene partir del modelo base o de una de las variantes posteriores de la serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3), sin MoE; basado en Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | No aplica (modelo denso, todos los parametros activos) |
| Longitud de contexto | 40 960 tokens en el ejemplo de despliegue de la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262 144 tokens nativos, no confirmado para este fine-tune |
| Tipos de cuantizacion | No publicados por el autor; el repo contiene pesos safetensors (8,8 GB, compatible con bf16/fp16). Conversion a GGUF, AWQ o GPTQ posible con herramientas estandar |
| Idiomas soportados | No disponible en la model card; hereda el multilingüismo del modelo base (Qwen3), aunque el entrenamiento y la evaluacion son en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder denso con atención de consultas agrupadas (GQA), RoPE, normalizacion RMSNorm y activacion SwiGLU, sin capas MoE. El fine-tune no modifica la arquitectura: es un ajuste completo o parcial de los mismos pesos, por lo que la huella de memoria coincide con la del base (4,4 B de parámetros, 8,8 GB en bf16 en el repo).

El entrenamiento es deliberadamente minúsculo y de tipo destilación: 56 pares tarea–memoria extraídos del conjunto `general_p30_source_pairs` del dominio retail de tau2-bench, batch size 12, una sola época, learning rate 3e-6 constante, gradient clipping 1.0 (valor por defecto de verl) y pérdida KL completa sobre todos los tokens de respuesta con `kl_topk` 256. El profesor es el mismo modelo con la memoria de la tarea en el system prompt, y el simulador de usuario es gpt-4.1-mini con temperatura 0. No hay recompensa ni RLHF/DPO. El autor advierte que cada step lee un batch distinto, de modo que la columna de pérdida refleja la dificultad del batch y no la convergencia: los cinco steps registrados oscilan entre 0.007 y 0.011 de KL, con entropía entre 0.287 y 0.370 y norma de gradiente entre 0.964 y 3.781.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-4B-Instruct-2507.
- Tool calling / function calling: la model card documenta el despliegue con `--enable-auto-tool-choice --tool-call-parser hermes`, lo que implica soporte del formato de llamadas a herramientas estilo Hermes.
- Razonamiento agéntico multi-turno en el dominio de atencion al cliente minorista (retail): gestion de pedidos, devoluciones, incidencias y consultas de catalogo.
- Seguimiento de politicas y memoria de tarea: el entrenamiento destila precisamente la capacidad de actuar como si se dispusiera de una memoria de tarea en el system prompt, sin tenerla.
- Multilingue: no confirmado en la model card; presumiblemente heredado del base, pero sin validacion publicada.
- No se documentan capacidades de vision, audio, modo *thinking* explicito ni decodificacion especulativa.

## Casos de uso

- Agente de atencion al cliente minorista: el modelo esta entrenado especificamente sobre el dominio retail de tau2-bench, por lo que puede gestionar conversaciones multi-turno con llamadas a herramientas para consultar pedidos, modificar envios o tramitar devoluciones.
- Reproduccion de experimentos de destilacion de experiencia: sirve como referencia de comparacion frente al modelo base para medir cuanto aporta el entrenamiento OEL sobre 56 pares tarea–memoria.
- Prototipado rapido de agentes con tool calling: al ser un modelo de 4,4 B desplegable con vLLM en una sola GPU, permite iterar sobre prompts y esquemas de herramientas con coste bajo.
- Evaluacion de pipelines de tau2-bench: util para validar infraestructura de evaluacion agéntica (simulador de usuario, parser de tool calls, ejecucion de tareas) antes de pasar a modelos mayores.
- Sistemas de soporte con contexto largo: si se confirma la ventana de 40 960 tokens del ejemplo de despliegue, admite historiales de conversacion y catalogos extensos en el prompt.
- Base para posteriores fine-tunes de dominio: al compartir pesos con Qwen3-4B-Instruct-2507 y licencia Apache 2.0, puede servir como punto de partida para ajustes adicionales en verticales concretas.
- Investigacion sobre sesgos de memoria en agentes: permite estudiar como se comporta un modelo entrenado para imitar una memoria que no tiene en inferencia.

## Benchmarks y rendimiento

El autor declara explicitamente que el modelo **no fue evaluado** tras el entrenamiento ("Not evaluated. Pushed straight after training"). Los unicos datos disponibles corresponden al modelo base.

| Benchmark | Split / condiciones | Modelo | Resultado |
|---|---|---|---|
| tau2-bench retail | test, sin memoria en evaluacion | Qwen3-4B-Instruct-2507 (base) | avg 0.400 / pass@3 0.575 |
| tau2-bench retail | test, 40 tareas, 4 trials, sin memoria | Qwen3-4B-Instruct-2507 (base) | avg 0.400 / pass@4 0.650 |
| tau2-bench retail | runs previos de la misma serie | Variantes del autor | avg entre 0.250 y 0.438 |
| tau2-bench retail | test | Este modelo | No evaluado |

No se han publicado resultados de benchmarks para este checkpoint concreto en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 9-10 GB solo para pesos, mas cache KV. Con 40 960 tokens de contexto la cache KV puede anadir varios GB segun el batch concurrente.
- VRAM en cuantizacion INT8: en torno a 4,5-5 GB de pesos.
- VRAM en cuantizacion INT4 (GGUF Q4_K_M o AWQ): en torno a 2,5-3 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue con vLLM en produccion; RTX 4090, RTX 3090 o RTX 4080 para desarrollo local.
- Cabe en GPU de consumo: si. En RTX 4090 (24 GB) y RTX 3090 (24 GB) sin problema en bf16; en GPUs de 8-12 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM es la ruta documentada por el autor (`vllm serve ... --enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`). Tambien son viables SGLang y TGI con pesos safetensors, y llama.cpp / Ollama / LM Studio tras convertir a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-retail_breakdown-1ep | 4,4 B | 40 960 (ejemplo de despliegue) | tau2-bench retail | Apache 2.0 | No evaluado |
| MANGSEOK123/qwen3-4b-tau2-retail-fp117-1ep | 4,4 B (base Qwen3-4B) | No disponible | tau2-bench retail | Apache 2.0 | Referencia al base: avg 0.400 / pass@4 0.650 |
| MANGSEOK123/Qwen3-4B-OEL-airline-tau2 | 4,4 B (base Qwen3-4B) | No disponible | tau2-bench airline (318 tareas sinteticas) | Apache 2.0 | No disponible en la informacion recogida |
| MANGSEOK123/Qwen3-4B-tau2-grpo-retail-2ep-lr1e6 | 4,4 B (base Qwen3-4B) | No disponible | tau2-bench retail (solo retail, no airline+retail) | Apache 2.0 | No disponible |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,4 B | 262 144 nativos | Generalista con soporte de tool calling | Apache 2.0 | avg 0.400 / pass@3 0.575 en tau2-bench retail |

Todas las alternativas de la misma serie comparten base, tamano y licencia, y se diferencian unicamente por el dominio o el metodo de ajuste (OEL frente a GRPO). Ninguna de ellas publica mejoras medidas sobre el base en la informacion disponible.

## Limitaciones y advertencias

- Modelo no evaluado: el autor lo subio directamente tras el entrenamiento, sin ninguna medicion posterior. No hay evidencia de que mejore al modelo base.
- Entrenamiento extremadamente pequeno: 56 pares tarea–memoria y una sola epoca. El riesgo de sobreajuste al conjunto de tareas concreto es alto y la generalizacion a otros escenarios de retail no esta demostrada.
- El autor advierte que la perdida registrada refleja dificultad del batch, no convergencia, por lo que las cifras de entrenamiento no permiten inferir calidad.
- Riesgo de alucinacion: inherente a un modelo de 4,4 B en tareas agénticas con llamadas a herramientas; puede inventar identificadores de pedido, politicas o resultados de herramientas.
- Sesgos: no documentados. Al entrenarse con datos sinteticos generados con gpt-4.1-mini como simulador de usuario, puede heredar los sesgos y el estilo de ese simulador y de tau2-bench.
- Limitacion idiomatica: el entrenamiento y la evaluacion de tau2-bench retail son en ingles; el rendimiento en castellano no esta validado.
- Contexto: el ejemplo oficial limita la ventana a 40 960 tokens; no hay confirmacion de que el fine-tune preserve la ventana nativa del base.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte. Al derivar de Qwen3-4B-Instruct-2507, conviene revisar igualmente los terminos del modelo base.
- Idoneidad para produccion: baja. Es un artefacto de investigacion de un autor individual, con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail_breakdown-1ep
- Variante de la misma serie: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail-fp117-1ep
- Variante de dominio airline: https://huggingface.co/MANGSEOK123/Qwen3-4B-OEL-airline-tau2
- Ficha en featherless.ai de la variante airline: https://featherless.ai/models/MANGSEOK123/Qwen3-4B-OEL-airline-tau2
- Endpoint de inferencia en FriendliAI (variante airline): https://friendli.ai/models/MANGSEOK123/Qwen3-4B-OEL-airline-tau2
- Endpoint de inferencia en FriendliAI (variante GRPO retail): https://friendli.ai/models/MANGSEOK123/Qwen3-4B-tau2-grpo-retail-2ep-lr1e6
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
