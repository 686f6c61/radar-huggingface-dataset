# sarimahsan101/Spire-9B-RL-GGUF

## Resumen

Spire-9B-RL es un modelo de lenguaje de 9.653 millones de parámetros especializado en la generación de compute shaders para Vulkan (GLSL con `#version 450`) y WebGPU (WGSL). Lo desarrolla el autor independiente sarimahsan101 y parte de `Qwen/Qwen3.5-9B`, sobre el que se aplica un ajuste fino supervisado con LoRA en BF16 seguido de un entrenamiento con GRPO verificado por ejecución contra compiladores y validadores reales (glslangValidator, spirv-val, naga/wgpu). La versión publicada en este repositorio es la cuantizada en GGUF del modelo base `sarimahsan101/Spire-9B-RL`.

El problema que aborda es muy concreto: los modelos generalistas fallan de forma sistemática al escribir shaders de cómputo conformes a las especificaciones de SPIR-V y WGSL, con tasas de acierto cercanas a cero en GLSL Vulkan. Spire-9B-RL eleva el Pass@1 global del 20,7 % al 59,6 % sobre un banco de 104 tareas retenidas y 208 tests, y pasa del 0,0 % al 65,4 % en GLSL Vulkan. Es relevante para equipos que trabajan en cómputo GPU de alto rendimiento, portabilidad gráfica o generación automática de kernels.

La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso (no MoE) con 9.653 millones de parámetros. La model card no detalla la longitud de contexto, los tipos de cuantización completos ni la composición del dataset de entrenamiento. El modelo se distribuye con licencia Apache 2.0 y solo declara soporte de inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q4_K_M, Q5_K_M, Q8_0 (según la model card) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base `Spire-9B-RL` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3.5-9B, con 9.653 millones de parámetros. Sobre esa base se aplica un ajuste fino supervisado con LoRA en BF16 y, a continuación, un entrenamiento con GRPO (Group Relative Policy Optimization) cuyo reward no proviene de un modelo juez, sino de un verificador de ejecución real: cada shader generado debe compilar y validarse (`glslangValidator -V` y `spirv-val` para GLSL; `naga`/`wgpu` para WGSL), despacharse en una GPU real sin pérdida de dispositivo ni accesos fuera de rango, y coincidir numéricamente con referencias de NumPy/PyTorch en varias formas de tensor (`atol=1e-3`, `rtol=1e-2`).

La innovación destacable es precisamente ese bucle de RL verificado por ejecución, que penaliza shaders sintácticamente plausibles pero no ejecutables. El modelo se entrenó para emisión directa de shader (`enable_thinking=False`), de modo que produce código limpio sin cadena de razonamiento intermedia. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni detalles del proceso de SFT más allá del uso de LoRA en BF16.

## Capacidades

- Generación de compute shaders standalone en Vulkan GLSL (`#version 450`) a partir de especificaciones en lenguaje natural.
- Generación de compute shaders en WebGPU WGSL.
- Reparación de kernels defectuosos a partir de diagnósticos de compilador y de errores en tiempo de ejecución.
- Traducción entre GLSL y WGSL.
- Cobertura de dominios de cómputo GPU: elementwise, cuantización, movimiento de datos, scan y sort, multiplicación de matrices, reducción, atención y convolución/pooling.
- Emisión directa de código sin modo de razonamiento (`enable_thinking=False`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Generación automática de kernels de reducción: el modelo escribe shaders de reducción paralela (sumas, máximos, normas) con grupos de trabajo y barreras correctas, un dominio donde el Pass@1 sube al 46,4 % y donde los modelos generalistas fallan con frecuencia.
- Portabilidad GLSL a WGSL en proyectos multiplataforma: dado un shader Vulkan existente, el modelo lo traduce a WGSL válido para WebGPU, lo que reduce el trabajo manual de mantener dos backends de cómputo.
- Reparación de shaders en pipelines de CI: integrado en un paso de validación, el modelo recibe la salida de `glslangValidator` o `naga` y reescribe el kernel hasta que compila y valida, aprovechando su tasa de compilación del 91,8 %.
- Prototipado rápido de kernels de cuantización: con un Pass@1 del 68,2 % en esa categoría, sirve para generar borradores de kernels de cuantización de pesos y activaciones que luego se revisan y optimizan a mano.
- Docencia y formación en programación GPU: el modelo produce shaders completos y ejecutables a partir de descripciones, útiles como material de partida para explicar modelos de ejecución de Vulkan y WebGPU.
- Aceleración de kernels de atención: genera implementaciones de atención por bloques en GLSL o WGSL que pueden servir como base para experimentos de inferencia en GPU antes de una optimización manual.
- Automatización de pruebas de regresión de shaders: el modelo puede generar variantes de un kernel para distintas formas de tensor y comprobar equivalencia numérica contra una referencia, gracias a su entrenamiento con verificación de ejecución.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el banco retenido de 104 tareas y 208 tests (GLSL + WGSL), con decodificación greedy (`do_sample=False`, `enable_thinking=False`). Ningún resultado está marcado como verificado de forma independiente.

| Modelo | Método | Tasa de compilación | Tasa de ejecución | Pass@1 global | Pass@1 GLSL | Pass@1 WGSL |
|---|---|---:|---:|---:|---:|---:|
| Qwen/Qwen3.5-9B | Base zero-shot | 32,7 % | 30,3 % | 20,7 % (43/208) | 0,0 % (0/104) | 41,3 % (43/104) |
| Spire-9B-SFT | LoRA SFT BF16 | 91,4 % | 90,9 % | 52,9 % (110/208) | 52,9 % (55/104) | 52,9 % (55/104) |
| Spire-9B-RL | SFT BF16 + GRPO verificado | 91,8 % | 91,8 % | 59,6 % (124/208) | 65,4 % (68/104) | 53,8 % (56/104) |

Desglose por categoría de kernel (SFT → RL):

| Categoría | Tests | SFT | RL | Ganancia |
|---|---:|---:|---:|---:|
| Elementwise | 34 | 94,1 % | 97,1 % | +2,9 pp |
| Cuantización | 22 | 54,6 % | 68,2 % | +13,6 pp |
| Movimiento de datos | 22 | 63,6 % | 68,2 % | +4,5 pp |
| Scan y sort | 24 | 41,7 % | 54,2 % | +12,5 pp |
| Multiplicación de matrices | 28 | 50,0 % | 53,6 % | +3,6 pp |
| Reducción | 28 | 35,7 % | 46,4 % | +10,7 pp |
| Atención y datos | 24 | 37,5 % | 45,8 % | +8,3 pp |
| Convolución y pooling | 26 | 34,6 % | 34,6 % | 0,0 pp |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5,5-6 GB en Q4_K_M, 6,5-7 GB en Q5_K_M y 10-11 GB en Q8_0, para 9.653 millones de parámetros más el overhead de contexto.
- GPU recomendadas: A100 o H100 para despliegue de alta concurrencia; RTX 4090, RTX 4080 o RTX 3090 para uso individual; una RTX 3060 de 12 GB o similar basta para las cuantizaciones Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más para Q4_K_M y Q5_K_M, y con 12 GB o más para Q8_0.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF de este repositorio; vLLM o TGI para los pesos safetensors del modelo base `Spire-9B-RL`; transformers para integración directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pass@1 en shaders GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spire-9B-RL | 9,65 B | No disponible | 59,6 % global; 65,4 % GLSL; 53,8 % WGSL | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen/Qwen3.5-9B | No disponible | No disponible | 20,7 % global; 0,0 % GLSL; 41,3 % WGSL | No disponible en la información | Hugging Face |
| Spire-9B-SFT | No disponible | No disponible | 52,9 % global; 52,9 % GLSL; 52,9 % WGSL | No disponible en la información | Referenciado en la model card |

No se dispone de datos de otros modelos especializados en generación de shaders GPU en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo generalista, puede arrastrar sesgos de su corpus de preentrenamiento.
- Riesgo de alucinación: pese a la verificación por ejecución durante el entrenamiento, la tasa de compilación es del 91,8 %, lo que implica que aproximadamente uno de cada doce shaders generados no compila o no se ejecuta correctamente; la validación en producción es obligatoria.
- Limitación de idioma: solo se declara inglés, tanto en los prompts como en la documentación generada.
- Cobertura desigual: convolución y pooling no mejoran con RL (34,6 %), y reducción y atención se quedan por debajo del 50 % de Pass@1, por lo que estos dominios requieren revisión humana intensiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B del que deriva.
- Caveat de producción: los benchmarks son declarados por el autor y no están verificados de forma independiente; el banco de evaluación es propio y de tamaño reducido (104 tareas).
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/sarimahsan101/Spire-9B-RL-GGUF
- Modelo base (safetensors): https://huggingface.co/sarimahsan101/Spire-9B-RL
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de entrenamiento y verificador: https://github.com/sarimahsan/vulkagen_model
