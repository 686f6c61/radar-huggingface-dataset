# alan13367/Qwen3.5-4B-RustCoder

## Resumen

Qwen3.5-4B-RustCoder es un ajuste fino del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario alan13367, orientado a la generacion de codigo Rust que compila, supera tests ocultos y pasa las comprobaciones del linter clippy. El modelo mantiene la arquitectura multimodal image-text-to-text del Qwen3.5 original, con 4.539.265.536 parametros totales (aproximadamente 4,5 mil millones) y conserva el modo de razonamiento (thinking mode) del modelo base.

El problema que aborda es concreto: mejorar la tasa de exito en tareas de programacion en Rust sin degradar las capacidades generales del modelo. Para ello se emplea un ajuste fino supervisado con LoRA sobre las 16 ultimas capas del decodificador, con un total de 739 muestras y 784.000 tokens entrenados en una sola epoca. El modelo resultante se distribuye en formato bf16 safetensors compatible con transformers y con las herramientas que leen checkpoints de Hugging Face.

Su relevancia actual radica en la combinacion de un modelo pequeno (4B) con contexto multimodal y un proceso de entrenamiento guiado por verificacion automatica (compilacion, tests y lint), lo que lo hace adecuado para entornos de desarrollo Rust donde se requiere generacion de codigo fiable con recursos de hardware moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 safetensors (pesos publicados); existe version MLX 8-bit en repo separado |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), layout original de Qwen3.5 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con capacidad de procesar imagen y texto (pipeline image-text-to-text), e incluye una torre de vision que no fue modificada por el ajuste fino. El ajuste se realizo mediante LoRA SFT de una sola epoca, con rango 16, alpha 32, dropout 0.05, aplicado sobre las 16 ultimas capas del decodificador. Se uso una tasa de aprendizaje de 1e-4 con lotes de hasta 4096 tokens, alcanzando 402 pasos y una perdida de validacion de 0.411.

El dataset de entrenamiento (739 muestras, 784.000 tokens) se compone mayoritariamente de material generado y filtrado por un gate automatico que compila el codigo, ejecuta tests ocultos y aplica lint: 238 intentos propios del modelo base que pasaron el gate, 277 autorreparaciones (el modelo corrige sus propios fallos con la salida del compilador o de los tests como siguiente turno), 175 trazas de profesor procedentes de DeepSeek V4.1 Flash (159 de ellas reparan intentos fallidos del 4B) y 88 muestras de replay con respuestas generales no relacionadas con Rust para preservar capacidad general. La perdida se calcula unicamente sobre la respuesta final, no sobre el contexto de intentos fallidos ni la retroalimentacion. El checkpoint publicado es el resultado del fine-tune fusionado sobre la version MLX 8-bit y posteriormente dequantizado a bf16, por lo que cada peso corresponde a su valor de 8 bits.

## Capacidades

- Generacion de codigo Rust que compila, pasa tests ocultos y es limpio para clippy.
- Razonamiento multi-paso con modo thinking activable (enable_thinking=True en la plantilla de chat).
- Reparacion de codigo a partir de errores de compilacion o salida de tests.
- Refactorizacion y escritura de tests (cubierto en el tier "Quality" de la evaluacion).
- Procesamiento multimodal imagen-texto heredado del modelo base (torre de vision intacta).
- Capacidades generales de texto preservadas: MMLU 69,0%, ARC-Challenge 90,0%, GSM8K 92,0%, HellaSwag 82,0% en los subconjuntos evaluados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada (mas alla del razonamiento interno con thinking).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del modelo.

## Casos de uso

- Generacion de funciones Rust con tests: el modelo produce implementaciones como `pub fn median(xs: &mut [i64]) -> Option<f64>` que se validan contra tests ocultos, adecuado para tareas de programacion competitiva y ejercicios de biblioteca.
- Reparacion automatizada de errores de compilacion: dada la salida del compilador o de los tests como turno de usuario, el modelo corrige sus propios intentos fallidos, lo que encaja en pipelines de CI que devuelven logs de error.
- Refactorizacion con lint limpio: util para tareas de limpieza de codigo donde el criterio de exito incluye pasar clippy, algo que el modelo fue entrenado para cumplir.
- Escritura de tests unitarios en Rust: el tier "Quality" cubre explicitamente la escritura de tests, por lo que puede emplearse para generar suites de pruebas sobre codigo existente.
- Asistente de desarrollo integrado en el editor: con 4B parametros y pesos bf16, puede desplegarse en estaciones de trabajo con GPU de consumo para autocompletado y generacion de codigo Rust.
- Prototipado rapido de utilidades Rust: para tareas de dificultad facil, al menos 1 de cada 4 intentos pasa en el 82,8% de las tareas, lo que permite usar el modelo con resampling como generador de borradores.
- Procesamiento de documentacion tecnica con imagenes: al conservar la torre de vision del modelo base, puede emplearse en tareas image-text-to-text, aunque no se documentan evaluaciones especificas en este dominio.

## Benchmarks y rendimiento

Tasa de exito (pass rate): proporcion de respuestas cuyo codigo supera los tests ocultos de la tarea. Cada tarea se muestreo 4 veces, con thinking activado y sin system prompt. Los tiers de test nunca se usaron en entrenamiento.

| Pass rate | Easy (29 tareas) | Hard (40) | Quality (29) | Dev (82) |
|---|---|---|---|---|
| Qwen3.5-4B (8-bit) | 41,4% | 7,5% | 8,6% | 20,7% |
| Qwen3.5-4B-RustCoder | 51,7% | 8,8% | 17,2% | 22,9% |

- Agregado sobre las 180 tareas: +4,3 puntos sobre la base (IC 95% +0,6 a +8,2) y +0,046 de recompensa graduada (IC +0,012 a +0,081).
- Los tiers son pequenos: un solo tier solo detecta una ganancia de unos 9 puntos (hard, quality) o 14 puntos (easy), por lo que solo la ganancia agregada esta establecida.
- Al menos 1 de los 4 intentos pasa en el 82,8% de las tareas faciles y en el 22,5% de las dificiles.

Capacidad general frente a la base (subconjuntos de cada benchmark):

| | MMLU (200) | ARC-Challenge (150) | GSM8K (100) | HellaSwag (150) |
|---|---|---|---|---|
| Qwen3.5-4B (8-bit) | 69,5% | 89,3% | 92,0% | 80,7% |
| Qwen3.5-4B-RustCoder | 69,0% | 90,0% | 92,0% | 82,0% |

En texto general, la distribucion de tokens se mantiene cercana a la base: KL 0,026 nats/token y 94,2% de acuerdo top-1.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- Version MLX 8-bit disponible en repo separado (alan13367/Qwen3.5-4B-RustCoder-MLX-8bit), orientada a Apple Silicon, con requisitos de memoria aproximadamente la mitad que bf16.
- GPU recomendadas: A100, H100 para despliegue en produccion con concurrencia; RTX 4090 (24 GB) para inferencia comoda en bf16; GPU de consumo con 12-16 GB pueden alojar el modelo con cuantizacion adicional.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16, y en configuraciones menores con cuantizacion (aunque no se publican pesos GGUF oficiales).
- Opciones de despliegue: transformers (con version que soporte Qwen3.5), MLX para Apple Silicon; vLLM, llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. Se documenta que las respuestas que terminan consumen una mediana de aproximadamente 1,2k tokens, con un maximo recomendado de 4096 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass rate Rust (agregado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-RustCoder | 4,54B | no disponible | +4,3 pts sobre la base | apache-2.0 | Hugging Face (bf16) + MLX 8-bit |
| Qwen3.5-4B (base) | 4,54B | no disponible | referencia (20,7% dev) | apache-2.0 | Hugging Face |
| DeepSeek V4.1 Flash | no disponible | no disponible | no disponible (usado como profesor) | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las ganancias en los tiers individuales no son estadisticamente concluyentes; solo la mejora agregada (+4,3 puntos, IC 95% +0,6 a +8,2) esta establecida.
- El modelo fue entrenado y evaluado sin system prompt; un prompt de estilo largo provoco razonamiento desbocado en el modelo base.
- Riesgo de bucles de razonamiento: 36 de 720 respuestas alcanzan el limite de tokens (frente a 82 de la base); se recomienda resampling antes que aumentar el limite.
- El checkpoint publicado es una dequantizacion a bf16 de un modelo entrenado y fusionado en 8-bit, por lo que no recupera la precision perdida por la cuantizacion; los pesos no modificados difieren del bf16 original en aproximadamente 0,7% de error relativo.
- Idioma limitado al ingles segun la etiqueta del modelo; no se documenta soporte multilingue.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion en la informacion proporcionada.
- Licencia apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B.
- El modelo esta especializado en Rust; su uso en otros lenguajes o dominios no ha sido evaluado y podria degradar respecto a la base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder
- Version MLX 8-bit: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de transformers: https://github.com/huggingface/transformers
