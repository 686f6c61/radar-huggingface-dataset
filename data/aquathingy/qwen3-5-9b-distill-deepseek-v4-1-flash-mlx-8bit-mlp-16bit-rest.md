# aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit-mlp-16bit-rest

## Resumen

Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit-mlp-16bit-rest es una conversión a formato MLX de un fine-tune LoRA de Qwen3.5-9B destilado a partir de DeepSeek-V4.1-Flash. El modelo original lo publica kevinzhou21 y esta variante la mantiene el usuario aquathingy. Se trata de un modelo de vision-lenguaje completo (torre de vision incluida) pensado para ejecutarse en hardware Apple Silicon mediante el motor MLX, con cuantizacion de precision mixta que reduce el peso a unos 13 GB.

El problema que resuelve es el de llevar un modelo multimodal de 9.400 millones de parametros a equipos con memoria unificada limitada sin degradar practicamente la calidad respecto al modelo en fp16. La estrategia de cuantizacion aplica 8 bits solo a las capas MLP (las que concentran el grueso de los pesos) y mantiene el resto en fp16, lo que da una media de 12,0 bits por peso.

Es relevante para desarrolladores que trabajan en macOS y necesitan un VLM conversacional con modo de razonamiento, capacidad de procesar imagenes y texto, y un coste de memoria contenido. La licencia declarada es Apache-2.0, heredada de Qwen3.5-9B, aunque el fine-tune de origen no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal GatedDeltaNet y torre de vision (Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta MLX: 8 bits en capas MLP (96 proyecciones gate/up/down del LM y 27 capas fc1 de vision), fp16 en atencion, atencion lineal, embeddings, lm_head, merger de vision, normas, kernels de convolucion y embedding posicional de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 14,2 GB de repo |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer hibrido que combina capas de atencion clasica con capas de atencion lineal basadas en GatedDeltaNet. Incluye una torre de vision con 27 capas MLP `fc1` y un merger multimodal, lo que lo convierte en un VLM capaz de procesar entradas imagen-texto. El fine-tune de origen es una adaptacion LoRA destilada desde DeepSeek-V4.1-Flash sobre la que no se detallan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO.

La conversion a MLX se realizo con gguf2mlx 2.2.0 mas correcciones manuales. Se anaden dos ajustes que la herramienta no cubria para los GGUF de Qwen3.5 de llama.cpp: el mapeo de nombres `blk.N.post_attention_norm` y la omision del bloque draft MTP/NextN (la cabeza MTP no se incluye). Ademas, la salida de GatedDeltaNet requirio tres correcciones: deshacer el reordenamiento de cabezas de valor de llama.cpp (de agrupado a tiled), aplicar el `A_log = log(-ssm_a)` que faltaba y eliminar un -1 espurio en `linear_attn.norm`. Tras los arreglos, esos tensores coinciden con Qwen/Qwen3.5-9B a precision fp16. La torre de vision se convirtio con un mapeador propio y resulta bit-identica a los pesos de vision de Qwen/Qwen3.5-9B (333 de 333 tensores).

La cuantizacion se aplico con `mlx_lm.utils.quantize_model` sobre el VLM completo. La tabla de variantes del autor reporta, medida sobre un unico pasaje de 135 tokens en ingles, codigo y matematicas: perplejidad 4,085 frente a 4,081 en fp16, KL medio de 0,00007 y 100 % de acuerdo top-1. El autor advierte que es una comprobacion rapida, no un benchmark.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat compatible con Qwen3.5.
- Modo de razonamiento activado por defecto mediante bloques `<think>…</think>`, desactivable con `enable_thinking=False` en los kwargs de la plantilla.
- Comprension de imagenes y respuesta texto a partir de imagen (image-text-to-text) gracias a la torre de vision incluida.
- Razonamiento y resolucion de problemas de matematicas y STEM, presumiblemente reforzados por el fine-tune destilado (no confirmado con benchmarks en la informacion disponible).
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Inferencia en Apple Silicon via MLX (mlx-vlm para texto e imagen, mlx-lm solo texto) y en LM Studio con su motor MLX.

## Casos de uso

- Descripcion y analisis de imagenes en local: con `mlx-vlm` se puede pasar una imagen y un prompt para obtener descripciones, extraer texto o responder preguntas sobre el contenido visual, todo en el propio Mac sin enviar datos a la nube.
- Asistente de razonamiento en portatiles Apple: el modo thinking por defecto permite tareas de resolucion de problemas paso a paso en un equipo con memoria unificada de 16-24 GB, gracias a los 13 GB del modelo.
- Prototipado rapido de aplicaciones VLM: al integrarse en LM Studio y en el ecosistema mlx-vlm, sirve para validar flujos de imagen-texto antes de pasar a despliegues mayores.
- Educacion y tutoria tecnica: el sesgo hacia matematicas y STEM del fine-tune de origen lo hace adecuado para explicar ejercicios y resolver problemas con traza de razonamiento visible.
- Procesamiento de documentos con imagenes: capturas, diagramas o figuras pueden acompañarse de preguntas textuales para extraer informacion estructurada en un pipeline local.
- Evaluacion comparativa de cuantizaciones: las cuatro variantes publicadas (fp16, 12,0, 8,6 y 6,6 bits por peso) permiten medir el compromiso entre memoria y calidad en un mismo modelo, util para decidir el formato de despliegue.
- Uso offline en entornos con restricciones de privacidad: al ejecutarse integramente en local, encaja en escenarios donde no se permite enviar imagenes ni texto a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona metricas de fidelidad de cuantizacion sobre un pasaje de 135 tokens:

| Variante | bits/peso | Tamano | Perplejidad | KL medio vs fp16 | Acuerdo top-1 |
|---|---|---|---|---|---|
| MLX-fp16 | 16 | 18 GB | 4,081 | – | – |
| MLX-8bit-mlp-16bit-rest (esta) | 12,0 | 13 GB | 4,085 | 0,00007 | 100 % |
| MLX-8bit | 8,6 | 9,5 GB | 4,086 | 0,00017 | 99,3 % |
| MLX-6bit | 6,6 | 7,3 GB | 4,106 | 0,0027 | 96,3 % |

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 13 GB para los pesos en esta variante; con overhead de contexto y cache conviene reservar 16 GB o mas de memoria unificada.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y superiores) con memoria unificada suficiente; el motor es MLX, no CUDA.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable directamente, ya que el formato es MLX y no hay pesos GGUF ni safetensors estandar en este repo; para CUDA habria que recurrir a otras variantes del modelo base.
- Cabe en equipos consumer Apple: si, en Mac con 16 GB de memoria unificada en adelante; con 24 GB o mas se dispone de margen para contexto largo e imagenes.
- Opciones de despliegue: LM Studio (motor MLX, con entrada de imagen), `mlx-vlm` para texto e imagen, `mlx-lm` solo texto (ignora la torre de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash, MLX 12,0 bits) | 9,41 B | no disponible | Texto + imagen | Apache-2.0 | Hugging Face, MLX |
| Qwen/Qwen3.5-9B (base) | 9 B aprox. | no disponible | Texto + imagen | Apache-2.0 | Hugging Face |
| dog88888/DeepSeek-V4-Pro-Qwen3.5-9B | 9 B aprox. | no disponible | Texto | no disponible | Hugging Face |
| kevinzhou21/Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261004 (origen) | 9 B aprox. | no disponible | Texto + imagen | no declarada | Hugging Face, GGUF |

El modelo de dog88888 se centra en matematicas y STEM con destilacion de DeepSeek-V4-Pro, mientras que este se destila de DeepSeek-V4.1-Flash y se distribuye ya cuantizado para MLX. No hay datos de rendimiento comparables entre ellos en la informacion disponible.

## Limitaciones y advertencias

- Las metricas de perplejidad, KL y acuerdo top-1 provienen de un unico pasaje de 135 tokens; no son un benchmark representativo.
- El fine-tune de origen no declara licencia; la Apache-2.0 se aplica por derivacion de Qwen3.5-9B, pero conviene revisar el repositorio fuente por si hubiera terminos adicionales antes de un uso comercial.
- No se documentan sesgos conocidos, composicion del dataset de destilacion ni procesos de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de alucinacion y sesgo.
- El modelo puede alucinar como cualquier LLM; el modo thinking por defecto puede dar una falsa sensacion de fiabilidad en respuestas incorrectas.
- Solo funciona en el ecosistema MLX (Apple Silicon); no es portable directamente a CUDA sin reconvertir a otro formato.
- La cabeza MTP/NextN no se incluye, por lo que no se puede aprovechar decodificacion especulativa con ese modulo.
- La torre de vision se ignora si se carga con `mlx-lm`; para tareas de imagen hay que usar `mlx-vlm` o LM Studio.
- No hay informacion sobre longitud de contexto soportada ni sobre idiomas cubiertos, lo que limita la planificacion de despliegues multilingues o con documentos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad sobre esta conversion concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit-mlp-16bit-rest
- Modelo base (fine-tune de origen): https://huggingface.co/kevinzhou21/Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261004
- Variante fp16: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-fp16
- Variante 8 bits: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit
- Variante 6 bits: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-6bit
- Modelo Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache-2.0 de Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Fine-tune alternativo DeepSeek-V4-Pro-Qwen3.5-9B: https://huggingface.co/dog88888/DeepSeek-V4-Pro-Qwen3.5-9B
- Proyecto de destilacion DeepSeek sobre Qwen: https://github.com/madaibaba/deepseek-distill-qwen
