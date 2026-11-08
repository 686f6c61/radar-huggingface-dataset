# aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit

## Resumen

Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit es una conversión al formato MLX de un fine-tune LoRA de Qwen3.5-9B, destilado a partir de DeepSeek-V4.1-Flash. El modelo original lo publica kevinzhou21 y esta variante la mantiene el usuario aquathingy. Se trata de un modelo vision-language completo (texto mas torre de vision) pensado para ejecutarse en hardware Apple Silicon mediante la libreria MLX. El problema que resuelve es doble: por un lado, ofrece una destilacion de un modelo grande en una ventana de 9.400 millones de parametros; por otro, empaqueta ese resultado en un formato cuantizado a 8 bits que ocupa 9,5 GB y puede correr en un Mac.

La arquitectura subyacente es la de Qwen3.5-9B, un transformer hibrido que combina atencion completa con capas de atencion lineal basadas en GatedDeltaNet. La conversion ha requerido correcciones especificas en esas capas de atencion lineal y en el mapeo de nombres del tokenizador para que los tensores coincidan con los pesos oficiales de Qwen3.5-9B a precision fp16. La torre de vision es identica bit a bit a la del modelo base (333 de 333 tensores).

El interes practico de esta ficha esta en que documenta una variante cuantizada concreta (8 bits afines, group size 64) dentro de una familia de cuatro variantes (fp16, 8bit-mlp-16bit-rest, 8bit y 6bit). El autor publica metricas de perplejidad y divergencia KL frente al modelo fp16, lo que permite evaluar el coste de la cuantizacion. No hay datos de benchmarks estandar ni de contexto maximo en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5 con atencion completa y atencion lineal GatedDeltaNet; tower de vision integrada |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64, en capas lineales y embeddings cuantizables (incluida la torre de vision); normas, kernels de convolucion, embedding posicional de vision y `mlp.linear_fc2` de vision en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer hibrido que intercala atencion completa con capas de atencion lineal GatedDeltaNet. Sobre ese modelo, kevinzhou21 aplico un fine-tune LoRA destilado de DeepSeek-V4.1-Flash. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos no estan disponibles. El fine-tune no modifico los tensores de las capas de atencion lineal, que tras las correcciones de conversion coinciden con Qwen/Qwen3.5-9B a precision fp16.

La conversion a MLX se realizo con gguf2mlx 2.2.0 mas parches, partiendo de los GGUF `F16` y `BF16-mmproj` del repositorio origen. Las correcciones tecnicas documentadas son: mapeo del nombre `blk.N.post_attention_norm`, omision del bloque draft MTP/NextN (la cabeza MTP no se incluye porque mlx-lm y mlx-vlm la descartan), y tres arreglos en la salida de GatedDeltaNet (deshacer el reordenamiento de value-heads de llama.cpp de agrupado a enlosado, aplicar el `A_log = log(-ssm_a)` que faltaba y eliminar un -1 espurio en `linear_attn.norm`). La torre de vision se convirtio con un mapeador propio al no existir adaptador Qwen3.5 VLM en gguf2mlx, y el resultado es bit-identico a los pesos de vision de Qwen/Qwen3.5-9B. La cuantizacion se aplico con `mlx_lm.utils.quantize_model` sobre el VLM completo.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat que activa el modo de razonamiento (`<think>...</think>`) por defecto; se puede desactivar con `enable_thinking=False`.
- Comprension de imagenes y respuesta texto-a-partir-de-imagen (pipeline `image-text-to-text`), gracias a la torre de vision integrada.
- Razonamiento paso a paso en modo thinking.
- Capacidades de codigo y matematicas heredadas del fine-tune destilado de DeepSeek-V4.1-Flash (sin datos cuantitativos disponibles).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; solo se menciona que la muestra de validacion de perplejidad es un pasaje en ingles, codigo y matematicas.

## Casos de uso

- Asistente local en Mac con entrada de imagenes: mediante `mlx-vlm` o LM Studio (motor MLX), el modelo puede describir fotografias, capturas de pantalla o diagramas y continuar la conversacion por texto. Es adecuado porque la torre de vision esta incluida y el peso de 9,5 GB cabe en la memoria unificada de un Mac moderno.
- Analisis de documentos escaneados en local: el modelo puede recibir la imagen de una pagina y generar un resumen o extraer informacion textual, sin enviar datos a la nube. La licencia Apache-2.0 facilita el uso interno.
- Prototipado de asistentes conversacionales con razonamiento visible: el modo thinking por defecto permite inspeccionar la cadena de razonamiento antes de la respuesta final, util para depurar prompts y evaluar la calidad del modelo destilado.
- Generacion y explicacion de codigo en un flujo de trabajo de escritorio: con `mlx-lm` (modo solo texto) se puede integrar en scripts o editores locales; el autor valida la cuantizacion con un pasaje que incluye codigo, lo que sugiere que la degradacion en ese dominio es minima.
- Evaluacion comparativa de cuantizaciones: al existir cuatro variantes (fp16, 8bit-mlp-16bit-rest, 8bit y 6bit) con perplejidad y KL publicadas, el modelo sirve para estudiar el compromiso entre tamano y fidelidad en MLX sobre el mismo fine-tune.
- Demostraciones y docencia sobre destilacion de modelos: el modelo permite mostrar en un portatil Apple como un fine-tune destilado de un modelo grande conserva capacidades conversacionales y de vision a 8 bits.
- Inferencia offline en entornos sin GPU NVIDIA: al estar en formato MLX, es una de las pocas opciones de VLM cuantizado de 9B ejecutable nativamente en Apple Silicon sin conversion adicional.

## Benchmarks y rendimiento

La model card solo publica metricas de fidelidad de cuantizacion frente al modelo fp16, medidas sobre un unico pasaje de 135 tokens en ingles, codigo y matematicas. El propio autor advierte que son una comprobacion rapida, no un benchmark.

| Variante | bits/peso | Tamano | Perplejidad | KL media vs fp16 | Coincidencia top-1 |
|---|---|---|---|---|---|
| MLX-fp16 | 16 | 18 GB | 4,081 | – | – |
| MLX-8bit-mlp-16bit-rest | 12,0 | 13 GB | 4,085 | 0,00007 | 100% |
| MLX-8bit (esta variante) | 8,6 | 9,5 GB | 4,086 | 0,00017 | 99,3% |
| MLX-6bit | 6,6 | 7,3 GB | 4,106 | 0,0027 | 96,3% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 9,5 GB de pesos en 8 bits; con overhead de contexto y del runtime MLX conviene disponer de al menos 12-16 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (serie M). La libreria MLX no soporta GPU NVIDIA ni AMD de forma nativa.
- Cabe en GPU de consumo Apple: un Mac con 16 GB de memoria unificada o superior deberia poder cargarlo; con 8 GB es probable que no quepa junto con el contexto.
- No esta pensado para A100, H100 ni RTX 4090: el formato MLX y la libreria `mlx` estan orientados a Apple Silicon. Para esas GPU habria que usar los GGUF del repositorio origen.
- Opciones de despliegue: LM Studio (motor MLX, con entrada de imagen), `mlx-vlm` para texto e imagenes, y `mlx-lm` para solo texto (ignora la torre de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit (esta ficha) | 9,41 B | no disponible | Si | Apache-2.0 | MLX safetensors, Apple Silicon |
| Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-6bit (misma familia) | 9,41 B | no disponible | Si | Apache-2.0 | MLX safetensors, 7,3 GB |
| Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-fp16 (misma familia) | 9,41 B | no disponible | Si | Apache-2.0 | MLX safetensors, 18 GB |
| Qwen/Qwen3.5-9B (modelo base) | 9 B aprox. | no disponible | Si (pesos de vision identicos) | Apache-2.0 | safetensors originales |
| GGUF Qwen3.5-9B DeepSeek-V4-Flash (local-ai-zone) | no disponible | no disponible | no disponible | no disponible | GGUF, 4,13 GB |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las metricas de fidelidad de cuantizacion de la tabla de benchmarks.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un fine-tune destilado de otro modelo, hereda los sesgos del modelo base y de los datos de destilacion, que no se detallan.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones de factualidad publicadas para esta variante.
- El modo thinking esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explicitamente.
- No hay informacion sobre la longitud de contexto soportada ni sobre el rendimiento en idiomas distintos del ingles.
- La licencia Apache-2.0 se aplica por derivacion de Qwen/Qwen3.5-9B, pero el fine-tune de origen no declara licencia propia; conviene revisar el repositorio de kevinzhou21 por si anade terminos adicionales antes de un uso comercial.
- Las metricas de perplejidad y KL provienen de un unico pasaje de 135 tokens y no deben interpretarse como evaluacion general de calidad.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a GPU NVIDIA sin reconvertir a GGUF u otro formato.
- La cabeza MTP/NextN no se incluye en la conversion, por lo que no se puede usar decodificacion especulativa con ese bloque.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit
- Variante fp16: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-fp16
- Variante 8bit-mlp-16bit-rest: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit-mlp-16bit-rest
- Variante 6bit: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-6bit
- Modelo base del fine-tune: https://huggingface.co/kevinzhou21/Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261004
- Modelo Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Ficha del GGUF en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-9b-deepseek-v4-flash.html
- Coleccion DeepSeek-V4-Distill de Jackrong: https://huggingface.co/collections/Jackrong/deepseek-v4-distill
