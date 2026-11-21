# IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-NanoPlus-Abliterated

## Resumen

Qwen3.8-35B-A3B-Distill MLX APEX-NanoPlus Abliterated es una cuantización mixta nativa de MLX del checkpoint empero-ai/Qwen3.8-35B-A3B-Distill, publicada por el usuario IsValorum. Se trata de un modelo MoE (mixture of experts) de la familia Qwen3.8 con 34.660.608.768 parámetros totales, del que solo una fracción está activa por token (la nomenclatura A3B sugiere aproximadamente 3 mil millones de parámetros activos, aunque el dato exacto no está confirmado en la información disponible). El modelo está pensado para ejecutarse en Apple Silicon mediante MLX, aprovechando la memoria unificada en lugar del esquema VRAM/RAM de CUDA.

La release aplica una cuantización mixta con base de 3 bits y grupo de 32 (G32), pero protege selectivamente las rutas sensibles: LM head en 6 bits G64, expertos compartidos en 5 bits G64, proyección de atención lineal `in_proj_z` en 8 bits G64, normas, routers MoE y tensores de estado recurrente en FP32, y Q/K/V de atención completa en 4 bits G64 con `o_proj` en 6 bits G64. El resultado son 18,8156 GB (17,52 GiB) de pesos en safetensors, con una degradación de perplejidad declarada de +0,826288 (+9,365 %) respecto al modelo base, lo que el autor posiciona como calidad práctica de clase Q4.

La variante "Abliterated" elimina o reduce el comportamiento de rechazo del modelo original, de modo que está orientada a usuarios que buscan deliberadamente respuestas sin filtros de negativa. La licencia es Apache 2.0 y el pipeline declarado es text-generation. Su relevancia actual radica en que permite ejecutar un MoE de casi 35 mil millones de parámetros en equipos Apple Silicon con un presupuesto de memoria relativamente contenido, a costa de una pérdida de fidelidad medible y de un comportamiento de rechazo alterado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con atención lineal y atención completa combinadas |
| Parametros totales | 34.660.608.768 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine quantization mixta: base 3-bit G32; LM head 6-bit G64; expertos compartidos 5-bit G64; `in_proj_z` 8-bit G64; Q/K/V 4-bit G64; `o_proj` 6-bit G64; normas, routers y estado recurrente en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 38,8 GB; pesos cuantizados 18,8156 GB (17,52 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts con atención híbrida: combina capas de atención lineal (con proyección `in_proj_z` y tensores de estado recurrente) y capas de atención completa (Q/K/V y `o_proj`). La cuantización APEX-NanoPlus respeta esa estructura asignando precisión distinta por módulo: los componentes siempre activos (expertos compartidos, routers, normas, estado recurrente) reciben mayor precisión o se mantienen en FP32, mientras que las rutas de atención completa se comprimen a 4 bits y el resto del cuerpo del modelo se apoya en una base de 3 bits G32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias en el checkpoint original. Tampoco se documenta en la información proporcionada ninguna innovación de decodificación especulativa ni detalles del proceso de destilación (Distill) aplicado por empero-ai. La innovación técnica destacable de esta release es la propia receta de cuantización mixta con protección de rutas sensibles y la verificación de fidelidad mediante perplejidad (+0,826288 absoluto, +9,365 % relativo).

El autor advierte de una limitación heredada del checkpoint upstream: el modelo puede entrar en repeticiones durante respuestas muy largas, incluso después del bloque `<think>`, y este comportamiento no es específico de la cuantización MLX.

## Capacidades

- Generación de texto conversacional y de formato largo, con plantilla de chat nativa incluida en la model card.
- Modo de razonamiento con bloque `<think>` (thinking mode), heredado de la familia Qwen3.8.
- Razonamiento multi-paso y resolución de problemas, sujeto a la degradación de fidelidad de la cuantización.
- Generación de código, con una advertencia específica del autor sobre sintaxis de programación y el uso de repeat penalty.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Comportamiento de rechazo reducido (abliterated/uncensored), orientado a respuestas sin negativas por defecto.
- Ejecución nativa en Apple Silicon vía MLX con memoria unificada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno en un equipo Apple Silicon con unos 17,52 GiB de pesos, dejando el resto de memoria unificada para el estado de ejecución, las activaciones y el contexto activo.
- Prototipado de razonamiento con thinking mode: útil para experimentar con cadenas de razonamiento explícitas en local antes de desplegar en infraestructura mayor, aceptando la pérdida de fidelidad de la cuantización.
- Generación de código en flujos de trabajo individuales: adecuado para autocompletado y explicación de código en entornos de desarrollo sobre macOS, teniendo en cuenta la advertencia del autor sobre sintaxis y repeat penalty.
- Investigación sobre alineación y rechazo: la variante abliterated permite estudiar el comportamiento del modelo sin el sesgo de negativa, comparándolo con el checkpoint original.
- Evaluación de recetas de cuantización: sirve como referencia práctica para medir el impacto de la cuantización mixta MLX (3-bit base con rutas protegidas) frente a cuantizaciones planas o GGUF.
- Despliegue offline y privado: al ejecutarse íntegramente en local sobre Apple Silicon, encaja en escenarios donde los datos no pueden salir del dispositivo.
- Comparación NanoPlus vs MiniPlus: permite evaluar en un mismo hardware el compromiso entre 18,8156 GB (clase Q4) y 19,9485 GB (clase Q5) para decidir el presupuesto de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de fidelidad proporcionado es la perplejidad relativa al modelo base:

| Metrica | Valor |
|---|---|
| ΔPPL (absoluto) | +0,826288 |
| %PPL (relativo) | +9,365 % |
| Tamano de pesos | 18,8156 GB (17,52 GiB) |
| Clase de calidad declarada | Q4-class |

El propio autor advierte que la perplejidad es una estimación útil de fidelidad, pero no mide de forma completa el razonamiento real, la codificación, el uso de herramientas ni el comportamiento en contexto largo.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos solos ocupan 17,52 GiB; hay que sumar estado de ejecución, activaciones, macOS y el contexto activo, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada y preferiblemente 64 GB para contextos amplios.
- GPU recomendadas: Apple Silicon con memoria unificada (series M1/M2/M3/M4 Pro, Max y Ultra); no es un modelo para GPU NVIDIA/AMD discretas en su formato MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de gama alta con memoria unificada suficiente; no aplica a GPUs de consumo tipo RTX 4090 en este formato.
- Opciones de despliegue: MLX (librería nativa) y `mlx-lm`; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI en este formato de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Alternativa de mayor fidelidad: la release MiniPlus ocupa 19,9485 GB (18,58 GiB), unos 1,13 GB más, con clase de calidad Q5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad / fidelidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill MLX APEX-NanoPlus Abliterated (este) | 34,66B totales (activos no disponibles) | no disponible | Q4-class, ΔPPL +0,826288 (+9,365 %) | Apache 2.0 | safetensors MLX |
| Qwen3.8-35B-A3B-Distill MLX APEX-MiniPlus Abliterated | 34,66B totales (activos no disponibles) | no disponible | Q5-class, 19,9485 GB | Apache 2.0 | safetensors MLX |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | 34,66B totales (activos no disponibles) | no disponible | Referencia de fidelidad (ΔPPL 0) | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Repetición en generaciones muy largas: el checkpoint upstream puede repetir contenido, incluso tras el bloque `<think>`; el autor indica que no es un defecto de la cuantización MLX.
- Pérdida de fidelidad medible: +9,365 % de perplejidad respecto al modelo base, con posible impacto en razonamiento, código y uso de herramientas.
- Comportamiento abliterated: la reducción de rechazos puede producir respuestas inapropiadas o inseguras; requiere salvaguardas externas en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo destilado y cuantizado.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe concreto.
- Contexto máximo no documentado: el presupuesto de contexto real depende de la memoria unificada disponible en cada Mac.
- Exclusivo de Apple Silicon: el formato MLX no es portable a CUDA ni a llama.cpp sin reconversión.
- Advertencia de sintaxis y repeat penalty: el autor incluye una sección crítica sobre parámetros de generación para código que conviene respetar.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del checkpoint base no está documentada en la información disponible y conviene verificarla antes de un despliegue productivo.
- No confundir con releases GGUF APEX o APEX-I: son recetas de cuantización distintas, sin cuantizaciones IQ en esta familia MLX.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-NanoPlus-Abliterated
- Release MiniPlus: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-MiniPlus-Abliterated
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
