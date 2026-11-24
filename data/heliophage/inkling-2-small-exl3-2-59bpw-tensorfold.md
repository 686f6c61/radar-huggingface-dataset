# heliophage/Inkling-2-Small-EXL3-2.59bpw-TensorFold

## Resumen

Inkling-2-Small-EXL3-2.59bpw-TensorFold es un paquete de pesos cuantizados del modelo `thinkingmachines/Inkling-2-Small`, preparado por el usuario heliophage para su ejecución en Apple Silicon mediante el motor TensorFold. No se trata de un modelo nuevo ni de un fine-tune: es un empaquetado listo para servir que combina un backbone denso en BF16, una cabeza especulativa DSpark también en BF16 y los expertos enrutados del modelo MoE cuantizados a 2,59375 bits por peso con el formato EXL3 (trellis) de ExLlamaV3, procedentes del checkpoint de kortexa-ai.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 48 capas y 384 expertos por capa, según los datos del empaquetado. La relevancia de este repositorio es práctica: permite ejecutar un modelo de gran tamaño en una única máquina Apple Silicon de 256 GB de RAM unificada, algo imposible con los pesos originales en BF16. El paquete ocupa 156,5 GB en el repositorio y unos 193,4 GiB una vez descargado.

La limitación fundamental es que no es un checkpoint compatible con `transformers`, `vLLM`, `SGLang` ni servidores estándar de ExLlamaV3: requiere el motor `trozzelle/inkling2-tensorfold` compilado con Zig y el toolchain Metal de Xcode. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 384 expertos por capa) con backbone denso, convoluciones cortas y attention-residual queries |
| Parametros totales | no disponible (el repo ocupa 156,5 GB; pesos cargados ~190,2 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en el ejemplo de servicio); 8 capas globales de atención |
| Tipos de cuantizacion | EXL3 trellis a 2,59375 bpw en expertos enrutados; backbone denso en BF16; cabeza DSpark en BF16 o 8-bit affine (por defecto 8-bit al cargar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone denso, cabeza DSpark) + directorio `experts/` con EXL3 trellis; paquete TensorFold, no GGUF ni safetensors estándar |

## Arquitectura y entrenamiento

El modelo base es un MoE con 48 capas y 384 expertos enrutados por capa. El empaquetado distribuye las proyecciones de expertos así: la capa 0 y las capas 40 a 47 usan cuantización K3 en todas sus proyecciones; las capas 1 a 39 alternan 192 proyecciones K3 y 192 K2, sumando 14.976 proyecciones K2 y 21.888 K3. El backbone denso (`model-dense.safetensors`, 12,40 GiB) contiene en BF16 original las embeddings, normas, atención, convoluciones cortas, attention-residual queries, routers y unembedding, tomadas del commit `b0e7afb8892a07897c78ce1c5b801a0d9cbd5e7b` de `thinkingmachines/Inkling-2-Small`.

La innovación técnica principal del paquete es la decodificación especulativa DSpark: una cabeza draft (`mtp.safetensors`, 3,19 GiB) en BF16 original que se cuantiza a 8 bits affine al cargar (~1,9 GiB) para acelerar la generación. Los expertos EXL3 provienen de `kortexa-ai/Inkling-2-Small-EXL3-2.59bpw` (commit `05c6cd0dff9df5bf20b10419c663a1e2adc7eb64`), con codebook `mul1` y calibración identificada como `kortexa-inkling2-exl3-v1`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Modo de razonamiento (thinking mode), activable por defecto y desactivable con `--no-thinking`.
- Decodificación especulativa mediante la cabeza DSpark, con ganancia medida de ~61,4 tok/s frente a ~39,4 tok/s sin drafts en contexto corto.
- Reutilización de prefijos con caché de prompt en memoria (`--prompt-cache-gib`, por defecto 8 GiB) para conversaciones multi-turno con prefijos idénticos a nivel de bit.
- Servicio concurrente de hasta 8 flujos de petición (`--parallel 1..8`) con decodificación por rondas compartidas y prefill troceado entrelazado.
- Capacidades multilingües: no disponible.
- Tool calling, function calling, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo admite 262.144 tokens de contexto y una caché de prefijo que acelera los turnos sucesivos; en la medición con 100 % de acierto de caché a 32k tokens, el TTFT baja de 23,40 s a 0,23 s. Adecuado para asistentes de escritorio en un Mac de 256 GB sin depender de la nube.
- Procesamiento de documentos extensos: con 128k tokens de prompt de entrada, el motor sostiene 42,2 tok/s de decodificación y un TTFT de 112,80 s; sirve para resumir o extraer información de contratos, informes o expedientes largos en una sola pasada.
- Análisis de código en local: la ventana de 262k tokens permite cargar repositorios medianos completos en el contexto; la licencia Apache 2.0 no impone restricciones de uso comercial sobre el empaquetado.
- Servicio multiusuario ligero: con `--parallel 4` y prompts de 139 tokens, el rendimiento agregado alcanza 102,6 tok/s (1,59× respecto a un solo flujo), suficiente para un pequeño equipo interno.
- Investigación sobre cuantización extrema: el paquete permite estudiar el impacto de EXL3 a 2,59 bpw con una divergencia KL media de 0,0325 frente a la referencia MXFP8, útil para trabajos de compresión de modelos.
- Prototipado de agentes con razonamiento: el thinking mode y la decodificación especulativa permiten iterar sobre cadenas de razonamiento multi-paso en hardware de escritorio antes de desplegar en infraestructura mayor.
- Evaluación de motores de inferencia en Apple Silicon: sirve como banco de pruebas para TensorFold, con métricas publicadas de prefill (~2.060–2.120 tok/s a 8k tokens) y carga del modelo (~31 s desde SSD local).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son de rendimiento del motor en un Apple M5 Ultra de 256 GB:

| Carga | Concurrencia | Tokens de prompt | TTFT p50 | Decodificación (tok/s) | Agregado E2E (tok/s) | Memoria pico |
|---|---:|---:|---:|---:|---:|---:|
| Decodificación corta | 1 | 139 | 0,37 s | 65,5 | 64,7 | 197,3 GiB |
| Decodificación corta | 2 | 139 | 0,40 s | 41,7 | 82,1 (1,27×) | 198,0 GiB |
| Decodificación corta | 4 | 139 | 0,49 s | 28,1 | 102,6 (1,59×) | 199,1 GiB |
| Contexto 8k | 1 | 10.274 | 5,81 s | 51,6 | 40,0 | 202,1 GiB |
| Contexto 32k | 1 | 40.269 | 23,40 s | 56,1 | 24,2 | 206,0 GiB |
| Contexto 128k | 1 | 155.163 | 112,80 s | 42,2 | 7,5 | 209,5 GiB |
| Contexto 32k | 4 | 40.270 | 35,18 s | 9,4 | 28,2 | 211,7 GiB |
| Contexto 32k con caché (100 % hit) | 1 | 40.247 | 0,23 s | 51,0 | 49,0 | 205,3 GiB |

Datos adicionales de un solo flujo en M5 Ultra con drafts activos: prefill de ~2.060–2.120 tok/s a 8k tokens y ~1.618 tok/s a 131k tokens; decodificación de ~61,4 tok/s en 12 prompts de chat; carga del modelo en ~31 s desde SSD local.

En fidelidad, evaluado con teacher forcing sobre un conjunto reservado de 62.526 tokens frente a `thinkingmachines/Inkling-2-Small-MXFP8`, la divergencia KL media en la ruta de prompt es de 0,0325 (frente a 0,0341 de una referencia MLX con los mismos expertos EXL3 decodificados; IC del 95 % de la diferencia: −0,0035 a −0,0001).

## Requisitos de hardware

- RAM unificada: 256 GB en un Mac Apple Silicon; con `--load-limit-gb 236` quedan ~22,9 GiB para KV y caché de prompt.
- Desglose de memoria: expertos enrutados y backbone denso 190,2 GiB; cabeza DSpark 1,9 GiB con cuantización 8-bit al cargar (3,3 GiB en BF16 con `INKLING_DRAFT_BITS=16`); scratch de prefill 2,67 GiB con trozos de 4.096 filas (0,37 GiB con 512 filas).
- Presupuesto de contexto: a `--load-limit-gb 236` caben ~693k tokens de contexto totales entre flujos activos; cada flujo admitido consume 0,89 GiB fijos para anillos de ventana deslizante y estado de convolución, más 32 KiB por token de contexto en las 8 capas globales.
- GPU: no aplica a GPU dedicadas; el motor es específico de Metal en Apple Silicon. No hay soporte para A100, H100 ni RTX 4090.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en Macs con menos de 256 GB de RAM unificada.
- Despliegue: exclusivamente mediante `trozzelle/inkling2-tensorfold`, compilado con Zig y el toolchain Metal de Xcode (`zig build native -Doptimize=ReleaseFast`). No es compatible con vLLM, SGLang, llama.cpp, Ollama, TGI ni servidores ExLlamaV3 estándar.
- Latencia y throughput: ver tabla de benchmarks; decodificación de 65,5 tok/s a un flujo en contexto corto y 42,2 tok/s con 128k tokens de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-EXL3-2.59bpw-TensorFold (este) | no disponible (MoE 48 capas × 384 expertos) | 262.144 | TensorFold + EXL3 2,59 bpw | Apache 2.0 | Hugging Face, solo Apple Silicon |
| thinkingmachines/Inkling-2-Small (original) | no disponible | no disponible | safetensors BF16 | no disponible | Hugging Face |
| thinkingmachines/Inkling-2-Small-MXFP8 | no disponible | no disponible | MXFP8 | no disponible | Hugging Face |
| kortexa-ai/Inkling-2-Small-EXL3-2.59bpw | no disponible | no disponible | EXL3 2,59 bpw | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables más allá de lo indicado; la comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint estándar: no funciona con `transformers`, `vLLM`, `SGLang` ni ExLlamaV3 convencional; requiere compilar TensorFold con Zig y Metal.
- Requiere hardware muy específico: un único Mac Apple Silicon con 256 GB de RAM unificada. No hay ruta de despliegue en GPU NVIDIA o AMD.
- La cuantización a 2,59375 bpw introduce degradación medible: divergencia KL media de 0,0325 frente a la referencia MXFP8, aunque con intervalo de confianza que sugiere una diferencia pequeña.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; el motor y el empaquetado son proyectos de autor único sin validación comunitaria amplia.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingüe.
- Sesgos conocidos y riesgo de alucinación del modelo base: no disponibles en la información proporcionada.
- La licencia Apache 2.0 se declara sobre el empaquetado; conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Small` antes de uso comercial, ya que no se detalla en la información disponible.
- El contexto efectivo depende de la memoria restante: a `--load-limit-gb 236`, el presupuesto de ~693k tokens se reparte entre flujos concurrentes, y cada flujo consume 0,89 GiB fijos.
- La decodificación especulativa está activada por defecto; desactivarla reduce el rendimiento de ~61,4 a ~39,4 tok/s en contexto corto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/heliophage/Inkling-2-Small-EXL3-2.59bpw-TensorFold
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Referencia MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Expertos EXL3 de origen: https://huggingface.co/kortexa-ai/Inkling-2-Small-EXL3-2.59bpw
- Motor TensorFold: https://github.com/trozzelle/inkling2-tensorfold
- Documentación del motor para este paquete: https://github.com/trozzelle/inkling2-tensorfold/blob/main/docs/recipes/inkling2-exl3-metal.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
