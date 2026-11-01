# FastFlowLM/Nemotron-3.5-Bolt-E4B-DFlash-NPU2

## Resumen

FastFlowLM/Nemotron-3.5-Bolt-E4B-DFlash-NPU2 es un paquete de pesos auxiliar publicado por FastFlowLM: se trata del borrador de decodificación especulativa (draft) DFlash del modelo Nemotron-3.5-Bolt-E4B de NVIDIA, convertido para ejecutarse en la NPU de los procesadores AMD Ryzen AI mediante el runtime FastFlowLM (`flm`). No es un modelo autónomo: por sí solo no genera nada, ya que necesita los pesos principales del paquete `nemotron3.5-bolt:e4b`, que aporta el modelo objetivo, el tokenizador, la plantilla de chat y las torres de visión y audio.

El borrador consta de 5 capas de estilo Qwen3 con dimensión oculta 2560, FFN de 5120, 32 cabezas de consulta y 8 de clave-valor de 128 dimensiones, ventana de atención de 1024 y 0,36 B de parámetros, y comparte la tabla de embeddings y la cabeza de salida del modelo objetivo. Cada paso propone hasta 7 tokens en una sola pasada que el modelo principal verifica en bloque, aceptando el prefijo más largo coincidente más un token propio.

Su relevancia es práctica: permite acelerar entre 1,27x y 1,89x la decodificación del modelo principal en una NPU Ryzen AI MAX+ PRO 395, con una calidad de borrador (longitud media de aceptación de 3,83 tokens) equivalente a la del archivo BF16 original de NVIDIA pese a estar cuantizado en Q4_1. Está pensado para despliegues locales en hardware AMD con NPU, no para servidores GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas tipo Qwen3 (borrador de decodificación especulativa DFlash) |
| Parametros totales | 0,36 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de atención del borrador de 1024 tokens; el contexto efectivo lo fija el modelo objetivo |
| Tipos de cuantizacion | Q4_1 para las matrices de las 5 capas (5 bits por peso con escalas y mínimos); `fc` y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (la base Gemma 4 es Apache-2.0) |
| Formato de pesos | `dflash_weight.q4nx` (formato propio de FastFlowLM), aproximadamente 0,27 GB |

## Arquitectura y entrenamiento

El borrador DFlash es un transformer denso de 5 capas con atención de ventana de 1024 tokens, 32 cabezas de consulta y 8 de clave-valor de 128 dimensiones, dimensión oculta de 2560 y FFN de 5120. No dispone de embeddings ni cabeza de salida propios: reutiliza la tabla de embeddings y la cabeza del modelo objetivo. Se alimenta de las características internas de las capas 5, 11, 17, 23 y 35 (índices base cero) del modelo principal, fusionadas mediante una proyección `fc` que se mantiene en BF16.

El mecanismo de decodificación especulativa propone hasta 7 tokens por paso en una única pasada; el modelo principal verifica los 8 tokens del bloque de golpe y conserva el prefijo más largo aceptado más un token propio. Con muestreo (temperatura mayor que 0) cada posición se muestrea y se compara con el borrador, de modo que la distribución de salida es la del modelo principal. La información disponible no detalla el dataset ni el procedimiento de entrenamiento del borrador; solo se documenta la procedencia de los pesos (GGUF BF16 de NVIDIA) y su conversión a Q4_1 para la NPU.

## Capacidades

- No genera texto de forma autónoma: actúa exclusivamente como borrador de decodificación especulativa para el modelo objetivo `nemotron3.5-bolt:e4b`.
- Acelera la decodificación del modelo principal entre 1,27x y 1,89x según contexto y modo de muestreo en la NPU Ryzen AI.
- Hereda implícitamente las capacidades del modelo objetivo (texto, razonamiento, código, tool calling, visión y audio), ya que la verificación la realiza el modelo principal.
- Soporta modo "thinking" del modelo objetivo, con mayores ganancias relativas cuando el razonamiento está activado (hasta 1,89x en contexto corto).
- Funciona con decodificación voraz y con muestreo; en muestreo la distribución de salida es la del modelo principal.
- Se puede desactivar en tiempo de ejecución con `FLM_DFLASH=0`, en cuyo caso la etiqueta decodifica exactamente como `nemotron3.5-bolt:e4b`.

## Casos de uso

- Despliegue local en portátiles y mini-PC con NPU AMD Ryzen AI: el paquete permite ejecutar el modelo principal con aceleración especulativa sin GPU dedicada, usando `flm run nemotron3.5-bolt-dflash:e4b`.
- Asistentes de código en el editor: la ganancia es mayor en texto predecible como código y respuestas estructuradas, por lo que la autocompletación y generación de fragmentos se beneficia de forma directa.
- Chat interactivo de baja latencia: con contextos de 1k a 4k tokens y razonamiento activado se obtienen aceleraciones de 1,55x a 1,78x, adecuadas para conversaciones multi-turno en local.
- Procesamiento por lotes en el borde: al reducir el coste por token decodificado, disminuye el tiempo total de generación de resúmenes o clasificaciones en equipos con NPU.
- Evaluación de rendimiento de decodificación especulativa: sirve como referencia reproducible para comparar FastFlowLM frente a llama.cpp con el mismo borrador (3,71 tokens de aceptación media en el conjunto de 40 prompts del autor).
- Integración en pipelines de agentes con tool calling: al mantener la distribución del modelo principal, las llamadas a herramientas y el razonamiento multi-paso no se degradan por el uso del borrador.
- Modo de razonamiento extendido en hardware de consumo: activar "thinking" con DFlash ofrece la mayor mejora relativa, útil para tareas de matemáticas o análisis que requieren cadenas de razonamiento largas.

## Benchmarks y rendimiento

Calidad del borrador (replay offline sobre características reales del objetivo, BF16, thinking activado, 16 prompts de MT-Bench y SPEED-Bench, 400 tokens generados, voraz):

| Pesos del borrador | Longitud media de aceptación |
|---|---:|
| BF16 (archivo de NVIDIA) | 3,83 |
| Todas las matrices en Q4_1 | 3,78 (-1,3%) |
| Este paquete (Q4_1, `fc` en BF16) | 3,83 |

Rendimiento en Ryzen AI MAX+ PRO 395 (128 GB), Linux, modo de energía por defecto, `flm serve`, 512 tokens generados, 3 prompts por contexto, tokens/s en decodificación:

| Contexto del prompt | `nemotron3.5-bolt:e4b` (tok/s) | DFlash voraz, sin thinking | voraz, con thinking | muestreo, sin thinking | muestreo, con thinking |
|---|---:|---:|---:|---:|---:|
| ~30 | 13,3 | 1,74x | 1,89x | 1,59x | 1,71x |
| 1k | 12,7 | 1,54x | 1,78x | 1,51x | 1,76x |
| 4k | 11,8 | 1,33x | 1,55x | 1,27x | 1,38x |
| 16k | 9,1 | 1,43x | 1,64x | 1,40x | 1,61x |

NVIDIA reporta longitudes de aceptación de 3,6 a 3,9 en MT-Bench y SPEED-Bench; llama.cpp con este borrador obtiene 3,71 en el conjunto de 40 prompts del autor, y FastFlowLM también 3,71.

## Requisitos de hardware

- Hardware objetivo: NPU de AMD Ryzen AI; las mediciones se realizaron en un Ryzen AI MAX+ PRO 395 con 128 GB de memoria.
- VRAM estimada: no aplica en el sentido habitual; el paquete ocupa aproximadamente 0,3 GB en disco y 0,27 GB de pesos, más el espacio del modelo principal `nemotron3.5-bolt:e4b`.
- GPU: no se documenta soporte para A100, H100 ni RTX 4090; el paquete está convertido específicamente para la NPU AMD.
- Compatibilidad con GPU de consumo: no disponible para este paquete; para el mismo borrador en otras plataformas existe la vía de llama.cpp con el archivo de NVIDIA.
- Despliegue: FastFlowLM 1.0.12 o superior, con `flm pull nemotron3.5-bolt-dflash:e4b` y `flm run nemotron3.5-bolt-dflash:e4b`; `FLM_DFLASH=0` desactiva la especulación.
- Latencia y throughput: 9,1 a 13,3 tokens/s en el modelo principal sin borrador en el hardware medido, con aceleraciones de 1,27x a 1,89x al activar DFlash.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (DFlash-NPU2) | 0,36 B (borrador) | ventana de 1024 en el borrador | decodificación especulativa en NPU AMD | OpenMDW-1.1 | HuggingFace, runtime FastFlowLM |
| NVIDIA Nemotron-3.5-Bolt-E4B-4GB-DFlash (BF16 GGUF) | 0,36 B (borrador) | no disponible | decodificación especulativa, formato GGUF | OpenMDW-1.1 | HuggingFace |
| Mismo borrador vía llama.cpp | 0,36 B (borrador) | no disponible | decodificación especulativa en CPU/GPU | OpenMDW-1.1 | integrado en llama.cpp |
| `nemotron3.5-bolt:e4b` (modelo principal sin borrador) | no disponible en la información | no disponible | generación completa | OpenMDW-1.1 | HuggingFace, FastFlowLM |

## Limitaciones y advertencias

- No es un modelo utilizable de forma independiente: requiere obligatoriamente el paquete `nemotron3.5-bolt:e4b` con el modelo principal, tokenizador, plantilla de chat y torres de visión y audio.
- Requiere FastFlowLM 1.0.12 o superior; versiones anteriores no soportan DFlash ni las etiquetas de dos paquetes.
- La aceleración depende de la previsibilidad del texto: en contexto de 4k baja a 1,27x-1,33x, y en textos poco predecibles puede reducirse aún más.
- En decodificación voraz la salida puede diferir del modelo principal en empates cercanos entre los dos mejores tokens: el 97% de las posiciones verificadas coincide exactamente con la decodificación token a token, y el 99,5% fuera de empates cercanos.
- Sesgos y riesgo de alucinación: no documentados para el borrador; hereda los del modelo objetivo, que no se detallan en la información disponible.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia OpenMDW-1.1: es necesario conservar el archivo `LICENSE.OpenMDW-1.1` con el paquete; conviene revisar los términos antes de uso comercial. La base Gemma 4 es Apache-2.0.
- Sin datos publicados de benchmarks de capacidades (MMLU, HumanEval, GSM8K) para este paquete; las métricas disponibles miden únicamente calidad del borrador y velocidad de decodificación.

## Enlaces

- [HuggingFace: FastFlowLM/Nemotron-3.5-Bolt-E4B-DFlash-NPU2](https://huggingface.co/FastFlowLM/Nemotron-3.5-Bolt-E4B-DFlash-NPU2)
- [Modelo upstream: nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash)
- [Repositorio FastFlowLM](https://github.com/FastFlowLM/FastFlowLM)
- [Licencia OpenMDW-1.1](https://openmdw.ai/license/1-1/)
