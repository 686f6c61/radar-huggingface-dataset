# pastoriomarco/Qwen3.8-Flash-Next-NVFP4-FP8-Hybrid-Delta

## Resumen

El repositorio `pastoriomarco/Qwen3.8-Flash-Next-NVFP4-FP8-Hybrid-Delta` contiene un delta checkpoint, no un modelo independiente. Se trata de una conversión de 300 matrices densas del modelo base `RadixArk/Qwen3.8-Flash-Next-NVFP4` (que a su vez deriva de `Qwen/Qwen3.8-Flash-Next`) desde BF16 a FP8 E4M3 con bloques de 128x128 y escalas inversas FP32. El objetivo es reducir la memoria ocupada y acelerar la inferencia en hardware edge, específicamente en Jetson AGX Thor.

El modelo es multimodal (image-text-to-text) y combina un vision tower en BF16, expertos enrutados cuantizados en NVFP4, y una capa de predicción multi-token (MTP). Su ventana de contexto es de 262144 tokens. El repositorio pesa 13.1 GB y está pensado para servirse con vLLM a través del entorno NemoClaw-Thor. Los resultados medidos muestran una mejora de throughput de 34.8 a 46.7 tok/s y una reducción de memoria cargada de 79.42 a 76.75 GiB, manteniendo una calidad equivalente en una evaluación completa de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal (image-text-to-text) con vision tower, mezcla de expertos (MoE) y capa de prediccion multi-token (MTP); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262144 tokens (segun el runbook de despliegue) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), FP8 E4M3 (matrices densas, bloques 128x128), BF16 (vision tower y KV cache) |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican los terminos del modelo fuente) |
| Formato de pesos | safetensors (shards convertidos + indice actualizado); tabla PLE servida via mmap |

## Arquitectura y entrenamiento

El checkpoint original `Qwen3.8-Flash-Next` es un modelo multimodal con componentes de vision y texto. El delta modifica exclusivamente 300 matrices densas de lectura frecuente: proyecciones de entrada/salida de GDN, proyecciones query/key/value/output de QSA, y proyecciones gate/up/down del shared-expert. Estas matrices pasan de BF16 a FP8 E4M3 con bloques de 128x128 y escalas inversas en FP32, ocupando 2.71 GiB en lugar de 5.42 GiB.

Los expertos enrutados permanecen en NVFP4 (via ModelOpt), la tabla PLE se mantiene en su representacion FP8 original, el vision tower sigue en BF16, y la capa MTP y el vocabulario objetivo no se alteran. La conversion no requiere corpus de calibracion: calcula directamente una escala por bloque de 128x128. No se proporcionan datos sobre el entrenamiento del modelo original, ni procesos de RLHF o DPO.

## Capacidades

- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text).
- Tool calling / function calling: evaluado en 88 escenarios de Tool Eval, con una puntuacion global de 94/100.
- Soporte de agentes con recuperacion de errores: alcanzo el 100% en la categoria Error Recovery y en Hard Mode en una ejecucion completa.
- Contexto largo de 262144 tokens, util para conversaciones y documentos extensos.
- Prediccion multi-token (MTP) para acelerar la decodificacion en el runtime de Thor.
- Cuantizacion mixta NVFP4 + FP8 que reduce la memoria de tensor sin degradar la calidad en las pruebas realizadas.

## Casos de uso

- Despliegue en Jetson AGX Thor: el modelo esta optimizado para este hardware con la imagen NemoClaw-Thor, permitiendo inferencia multimodal en el edge con 46.7 tok/s y 76.75 GiB de memoria cargada.
- Asistentes conversacionales con tool calling: la evaluacion de Tool Eval demuestra que puede gestionar 88 escenarios de herramientas con una puntuacion de 94/100 y una mediana de 4.1 s por turno.
- Analisis de documentos con imagenes: al ser image-text-to-text, puede combinar entradas visuales y textuales, por ejemplo para extraer informacion de capturas o diagramas.
- Sistemas de agentes con contexto largo: la ventana de 262144 tokens permite mantener multiples turnos y herramientas sin perder informacion previa.
- Reduccion de memoria en servidores edge: la conversion de matrices densas a FP8 reduce la memoria de tensor de 79.42 a 76.75 GiB, liberando espacio para mayores longitudes de contexto o mas slots de concurrencia.
- Mejora de throughput en inferencia: el delta logra un incremento del 34% en el token-weighted output rate de sgbench (34.8 a 46.7 tok/s), lo que se traduce en respuestas mas rapidas en produccion.

## Benchmarks y rendimiento

| Metrica | Original side weights | FP8 hybrid |
|---|---|---|
| sgbench C1 token-weighted output rate | 34.8 tok/s | 46.7 tok/s |
| Loaded tensor memory | 79.42 GiB | 76.75 GiB |
| Advertised BF16-KV tokens (a 0.90 / 0.92) | 728869 | 842439 |
| Full 262144-token concurrency estimate | 2.78x | 3.21x |
| Tool Eval overall | 94/100 | 94/100 |
| Tool Eval points | 165/176 | 166/176 |
| Tool Eval hard mode | 95% | 100% |
| Tool Eval passed / partial / failed | 79 / 7 / 2 | 80 / 6 / 2 |
| Tool Eval median turn | 4.3 s | 4.1 s |
| Tool Eval responsiveness | 37/100 | 39/100 |
| Tool Eval deployability | 77/100 | 78/100 |
| Tool Eval runtime | 1471.4 s | 1299.6 s |

Los resultados corresponden a una unica ejecucion completa por variante en Jetson AGX Thor, con MTP=3, KV cache en BF16, contexto 262144 y cuatro scheduler slots. No se trata de una afirmacion de equivalencia bitwise.

## Requisitos de hardware

- VRAM estimada: 76.75 GiB de memoria de tensor cargada en la configuracion medida (Jetson AGX Thor con 0.92 de memoria).
- GPU recomendada: Jetson AGX Thor (SM110a) con la imagen NemoClaw-Thor `sm110-fast-v3`; no se especifican otras GPU compatibles.
- No cabe en GPU de consumo: la memoria requerida supera ampliamente los 24 GB de una RTX 4090, por lo que el despliegue esta pensado para hardware de alta gama o edge.
- Opciones de despliegue: vLLM (libreria declarada) y el repositorio NemoClaw-Thor, que incluye scripts de construccion, descarga, aplicacion del delta y arranque del servidor.
- Latencia y throughput: mediana de turno de 4.1 s en Tool Eval, runtime total de 1299.6 s para 88 escenarios, y 46.7 tok/s en sgbench.

## Comparativa con modelos similares

| Modelo | Memoria de tensor | Throughput (sgbench) | Tool Eval overall | Licencia |
|---|---|---|---|---|
| RadixArk/Qwen3.8-Flash-Next-NVFP4 (base, sin delta) | 79.42 GiB | 34.8 tok/s | 94/100 | other |
| pastoriomarco/Qwen3.8-Flash-Next-NVFP4-FP8-Hybrid-Delta | 76.75 GiB | 46.7 tok/s | 94/100 | other |

No se dispone de informacion sobre otros modelos comparables en la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- Es un delta checkpoint, no un modelo independiente: requiere la revision base exacta `7b719225242aacd3dbd3f9407468c2ee9a9d2594` de `RadixArk/Qwen3.8-Flash-Next-NVFP4`.
- Los archivos no modificados deben obtenerse de esa revision exacta; el delta no puede cargarse por si solo.
- La licencia es "other" y se aplican los terminos del modelo fuente; deben revisarse antes de cualquier redistribucion o uso comercial.
- En la evaluacion de Tool Eval, la categoria Safety & Boundaries descendio de 92% a 85% en el híbrido, mientras que Error Recovery y Hard Mode alcanzaron el 100%.
- La paridad de calidad es evidencia empirica de una unica ejecucion por variante, no una garantia de equivalencia bitwise.
- No se han especificado sesgos conocidos ni riesgos de alucinacion en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/pastoriomarco/Qwen3.8-Flash-Next-NVFP4-FP8-Hybrid-Delta
- Modelo base: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio NemoClaw-Thor: https://github.com/pastoriomarco/NemoClaw-Thor
- Runbook de despliegue: https://github.com/pastoriomarco/NemoClaw-Thor/blob/main/serving/docs/QWEN38-FLASH-NEXT-FAST-THOR.md
- Conversor de referencia: https://github.com/Saren-Arterius/qwen3.8-Flash-DGX-AutoRound
- Integracion fast-path: https://github.com/blazux/qwen3.8-Flash-DGX
