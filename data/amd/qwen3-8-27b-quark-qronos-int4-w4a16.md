# amd/Qwen3.8-27B-Quark-Qronos-INT4-W4A16

## Resumen

El modelo `amd/Qwen3.8-27B-Quark-Qronos-INT4-W4A16` es una version cuantizada con precision INT4 (solo pesos, esquema W4A16) del modelo vision-lenguaje denso `Qwen/Qwen3.8-27B`, desarrollada por AMD mediante el algoritmo Qronos implementado en el kit de cuantizacion Quark. Qronos es un metodo de cuantizacion post-entrenamiento (PTQ) basado en informacion de la Hessiana que corrige el error acumulado durante la cuantizacion, lo que permite recuperar gran parte del rendimiento del modelo original en BF16.

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros con arquitectura qwen3_5, ventana de contexto de 262.144 tokens, decodificacion MTP (multi-token prediction) y capacidades multimodales (imagen, texto y video como entrada; texto como salida). La cuantizacion INT4 con grupo de tamano 128 reduce el peso del modelo a aproximadamente 19,9 GB en el repositorio (el build Q4 ronda los 17,8 GB), lo que permite ejecutarlo en hardware de consumo con 24 GB de memoria. La licencia Apache 2.0 facilita su uso comercial sin restricciones.

La relevancia de este modelo reside en ofrecer una alternativa cuantizada de alta fidelidad (recuperacion del 97-101 % en los benchmarks publicados) para despliegue en entornos con recursos limitados, manteniendo las capacidades de razonamiento, tool calling y vision del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso, vision-lenguaje, decodificacion MTP) |
| Parametros totales | 27B (modelo base); safetensors reporta 6.474.691.312 elementos (empaquetado INT4) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | INT4 solo pesos (W4A16), grupo de tamano 128, activaciones en BF16 |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, esquema Quark W4A16Int4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros con arquitectura qwen3_5, disenado para procesamiento multimodal: acepta entradas de imagen, texto y video, y genera texto. Incorpora decodificacion MTP (multi-token prediction), que permite predecir varios tokens por paso, y un modo de razonamiento explicito (thinking) similar al de la familia Qwen3, activable o desactivable segun la tarea. La ventana de contexto alcanza los 262.144 tokens.

La cuantizacion se realizo con el algoritmo Qronos (Zhang et al., ICLR 2026), un metodo de cuantizacion post-entrenamiento basado en la Hessiana que corrige el error acumulado durante el proceso. Los pesos se cuantizaron a INT4 con grupo de tamano 128, manteniendo las activaciones en BF16 sin cuantizar (esquema W4A16). La calibracion se hizo con 128 muestras y una longitud de secuencia de 512 tokens. No se aplico fine-tuning ni RLHF/DPO; se trata de una cuantizacion puramente post-entrenamiento sobre los pesos verificados del modelo base.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo base Qwen3.8-27B, incluido el modo thinking (razonamiento explicito) y el modo no-thinking.
- Comprension multimodal: acepta entradas de imagen, texto y video (pipeline image-text-to-text), generando respuestas de texto.
- Tool calling y function calling: soportado, con resultados evaluados en el benchmark BFCL (Berkeley Function Calling Leaderboard).
- Razonamiento matematico: alto rendimiento en GSM8K, tanto en modo thinking como no-thinking.
- Ventana de contexto larga: 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Capacidades multilingues: heredadas del modelo base Qwen3.8 (no se detallan los idiomas especificos en la documentacion).
- Decodificacion MTP: multi-token prediction para mayor velocidad de generacion.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto, puede gestionar conversaciones multi-turno extensas manteniendo el historial completo, y su soporte de tool calling permite integrarse con sistemas CRM o bases de conocimiento.
- Asistentes de codigo en produccion: el soporte de function calling y el modo thinking permiten integrarlo en pipelines de CI/CD para generacion y revision de codigo, con un peso de ~17,8 GB que cabe en GPUs de consumo de 24 GB.
- Analisis de documentos largos: la ventana de 262K tokens permite procesar contratos, informes financieros o papers completos en una sola pasada, con cuantizacion INT4 para reducir costes de memoria en despliegues masivos.
- Razonamiento multimodal en edge: al aceptar entradas de imagen y video, puede usarse en aplicaciones de vision por computador (analisis de imagenes, inspeccion industrial) ejecutandose en hardware AMD Ryzen AI Max o Radeon.
- Despliegue local en equipos de 24 GB: el build Q4 de ~17,8 GB cabe en una Mac con 24 GB o en GPUs consumer de 24 GB (RTX 3090/4090), permitiendo inferencia local privada sin conexion a la nube.
- Agentes autonomos: el modo thinking combinado con tool calling y el contexto largo permite construir agentes multi-paso que planifican, ejecutan herramientas y razonan sobre resultados intermedios.
- Servicio de inferencia con vLLM: compatible con vLLM mediante el esquema W4A16Int4, lo que permite desplegarlo como endpoint de produccion con throughput optimizado.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo cuantizado con el base BF16:

| Benchmark | Configuracion | Qronos INT4 | Base BF16 | Recuperacion |
|---|---|---|---|---|
| GSM8K 5-shot (flexible-extract / strict-match) | Thinking, temp 1.0 | 94,62 % / 94,69 % | 93,33 % / 93,33 % | 101,4 % |
| GSM8K 5-shot (flexible-extract / strict-match) | No-thinking, temp 0.7 | 89,99 % / 89,84 % | 90,67 % / 89,76 % | 99,2 % |
| Wikitext perplexity | Greedy | 8,6819 | 8,4364 | 97,2 % |
| BFCL Overall Acc (single_turn) | Greedy | 23,80 % | 24,38 % | 97,6 % |

Notas: la recuperacion se calcula como cuantizado/base para GSM8K (mayor es mejor) e invertida para perplexity (menor es mejor). El resultado BFCL solo cubre categorias single_turn; las sub-metricas muestran una degradacion notable en Relevance Detection (62,50 % frente a 75,00 % del base). No se han publicado resultados para otros benchmarks como MMLU, HumanEval o GPQA en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el build Q4 ocupa ~17,8 GB en disco; para inferencia se recomienda al menos 24 GB de memoria (GPU o RAM unificada).
- GPUs recomendadas: RTX 3090/4090 (24 GB), AMD Radeon con 24 GB o superior, AMD Ryzen AI Max+ 395 (memoria unificada).
- AMD midio 24,5 tokens/s en Ryzen AI Max+ 395 con el modelo base Qwen3.8-27B.
- En equipos con 24 GB (Mac o GPU consumer) el modelo se ejecuta comodamente segun las guias publicadas.
- Opciones de despliegue: vLLM (requiere soporte del esquema W4A16Int4, PRs #52642, #46110, #52649), LM Studio, y runtimes compatibles con Quark.
- Comando de servicio con vLLM: `vllm serve amd/Qwen3.8-27B-Quark-Qronos-INT4-W4A16 --trust-remote-code --tensor-parallel-size 1 --reasoning-parser qwen3`.
- Para GPUs con menos de 24 GB se requieren cuantizaciones mas agresivas (por ejemplo, INT4 con grupo mayor o cuantizacion de activaciones), no incluidas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | GSM8K (thinking) |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | BF16 | Apache 2.0 | 93,33 % |
| amd/Qwen3.8-27B-Quark-Qronos-INT4-W4A16 | 27B | 262.144 | INT4 W4A16 | Apache 2.0 | 94,62 % |
| Otras cuantizaciones de Qwen3.8-27B (GPTQ/AWQ) | 27B | 262.144 | no disponible | Apache 2.0 | no disponible |

No se dispone de datos publicados sobre otras variantes cuantizadas del mismo modelo base para
