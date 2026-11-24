# raahemnabeel/hy4-flash-qb2

## Resumen

hy4-flash-qb2 es un paquete de despliegue del modelo Hy4-flash de Tencent, publicado por el usuario raahemnabeel, optimizado para ejecutarse sobre hardware Tenstorrent p300x2 (malla P300x2). No se trata de un modelo nuevo, sino de una conversión cuantizada del checkpoint oficial en BF16: los expertos se ejecutan en bfp4 y las tablas Engram en FP8, generadas a partir del checkpoint original en el primer arranque. El paquete se distribuye mediante tt-model-manager 0.1.0 (esquema de manifiesto 5.1) y se sirve con vLLM a través de una API compatible con OpenAI.

El modelo subyacente, Hy4-flash, es un mixture-of-experts (MoE) de 220.000 millones de parámetros totales con aproximadamente 11.300 millones activos por token. Combina 42 capas de atención MLA dispersa y de ventana deslizante, 512 expertos enrutados (top-16) más un experto compartido, una memoria n-gram Engram de 63.500 millones de parámetros, un codificador de visión y un borrador especulativo. Admite entrada de texto, imagen y vídeo, además de tool calling, y está orientado a razonamiento.

La relevancia de este paquete es la ejecución de un modelo de 220B en aceleradores Tenstorrent con un pool de contexto compartido de 202.752 tokens para hasta 8 usuarios concurrentes. El repositorio ocupa 2,1 GB (solo el paquete de despliegue, no los pesos completos, que se descargan aparte) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA dispersa y de ventana deslizante (42 capas), 512 expertos enrutados top-16 más experto compartido, memoria Engram n-gram, codificador de visión y borrador especulativo |
| Parametros totales | 220B (modelo base Hy4-flash); el paquete incluye además una memoria Engram de 63,5B |
| Parametros activos | Aproximadamente 11,3B por token |
| Longitud de contexto | 202.752 tokens (pool compartido entre hasta 8 secuencias concurrentes) |
| Tipos de cuantizacion | Expertos en bfp4, tablas Engram en FP8 (convertidas desde BF16 en el primer arranque) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license |
| Formato de pesos | Checkpoint BF16 original descargado desde tencent/Hy4-flash; cachés bfp4/FP8 generadas localmente; servido mediante vLLM |
| Hardware objetivo | Tenstorrent p300x2 (malla P300x2) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 2,1 GB (paquete de despliegue) |
| Requisitos de disco | Aproximadamente 610 GB (440 GB de checkpoint más 165 GB de cachés) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Hy4-flash es un transformer MoE con 42 capas que alternan atención MLA dispersa y de ventana deslizante. El enrutamiento utiliza 512 expertos con selección top-16 más un experto compartido, lo que resulta en aproximadamente 11,3B de parámetros activos por token sobre un total de 220B. Incorpora una memoria Engram n-gram de 63,5B de parámetros, un codificador de visión para entrada de imágenes y vídeo, y un borrador especulativo para decodificación especulativa. El modelo está orientado a razonamiento y admite tool calling.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada; la model card remite a la tarjeta del modelo original de Tencent para esos datos. La innovación técnica destacable de este paquete es la conversión de precisión: los expertos se ejecutan en bfp4 y las tablas Engram en FP8, generadas desde el checkpoint BF16 en el primer arranque, con un proceso de compilación de kernels específico para el dispositivo que tarda varios minutos. El servidor implementa reutilización de caché de prefijo para prompts que comparten al menos 2.048 tokens iniciales con una petición previa.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento separado (el texto de razonamiento llega en el campo `reasoning`, aparte de `content`).
- Razonamiento activado por defecto con `reasoning_effort` en `high`; se puede desactivar con `"chat_template_kwargs": {"reasoning_effort": "no_think"}`.
- Tool calling y function calling mediante el parser `hy_v4`: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Entrada multimodal: hasta 4 imágenes por petición (redimensionadas a un máximo de 2048 x 2048) y un vídeo por petición (muestreo a 2 fps, máximo 64 fotogramas).
- Procesamiento de documentos largos gracias al contexto de 202.752 tokens.
- Salidas estructuradas, logprobs, `logit_bias` y penalizaciones.
- Capacidades multilingües: no disponible.
- Servidor compatible con la API de OpenAI (chat completions, completions y `/v1/models`).

## Casos de uso

- Chat y razonamiento multi-turno con documentos largos: el pool de contexto de 202.752 tokens permite procesar informes extensos o conversaciones prolongadas, y la reutilización de caché de prefijo acelera los turnos sucesivos que comparten los primeros 2.048 tokens.
- Asistencia a programación: con un 97,0% de pass@1 en HumanEval y soporte de tool calling, el modelo puede integrarse en entornos de desarrollo para generar y validar código, invocando herramientas externas a través del parser `hy_v4`.
- Análisis de imágenes y vídeo: la entrada multimodal (hasta 4 imágenes o un vídeo de 64 fotogramas por petición) permite tareas de descripción, extracción de información o control de calidad visual.
- Razonamiento matemático y resolución de problemas: los resultados en MATH-500 (95,6%) y GSM8K (95,6%) lo hacen adecuado para tutores automáticos o verificación de cálculos paso a paso.
- Agentes con razonamiento multi-paso: el modo de pensamiento (`reasoning_effort: high`) y el tool calling permiten construir flujos de agente que planifican, invocan APIs y sintetizan resultados.
- Servicio compartido para equipos pequeños: el perfil p300x2 admite hasta 8 usuarios concurrentes sobre un único pool de contexto, lo que encaja en despliegues internos de investigación con hardware Tenstorrent.

## Benchmarks y rendimiento

Resultados publicados en la model card del paquete, servidos a través del endpoint OpenAI con 8 peticiones en vuelo (lm-evaluation-harness, semilla 42). SE = sqrt(p(1-p)/n).

| Evaluación | Resultado | SE | Prompts | Configuración |
|---|---:|---:|---:|---|
| GSM8K (8-shot CoT, strict match) | 95,6% | 0,6 | 1.319 | no_think, greedy |
| IFEval (prompt-level strict) | 83,9% | 1,6 | 541 | no_think, greedy |
| HumanEval pass@1 | 97,0% | 1,3 | 164 | no_think, greedy |
| MBPP (3-shot) | 83,4% | 1,7 | 500 | no_think, greedy |
| GPQA-Diamond | 77,8% | 3,0 | 198 | no_think, greedy |
| MATH-500 | 95,6% | 0,9 | 500 | no_think, greedy |
| MMLU-Pro (subconjunto fijo de 1.000 preguntas) | 73,3% | 1,4 | 1.000 | no_think, greedy |
| GPQA-Diamond, thinking | 87,4% | 2,4 | 198 | high, temperature 0,9, max_tokens 18.944 |
| Needle retrieval (2K-11K, solo y con 7 usuarios) | 6/6 | — | 6 | no_think, greedy |
| Acuerdo top-1 / KL (top 32) con la referencia BF16, 8 usuarios | 86,5% / 0,223 | — | 8 textos | teacher forced |
| Igual, texto de 3K tokens, prefill / decode | 82,7% / 0,293 y 82,8% / 0,275 | — | 1 texto | teacher forced |

La model card indica que Tencent no publica cifras para estas configuraciones. La tabla de rendimiento de servicio (TTFT, throughput) aparece truncada en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: Tenstorrent p300x2 (malla P300x2); no se contempla ejecución en GPU convencionales en la información disponible.
- RAM de host: aproximadamente 116 GB libres para velocidad de decodificación completa; 17 GB como mínimo. Por debajo de 17 GB el servidor no arranca salvo que se establezca `HY4_RAM_CHECK=warn`.
- Disco: aproximadamente 610 GB (440 GB de checkpoint más unos 165 GB de cachés generadas en el primer arranque).
- Despliegue: mediante Tenstorrent CLI (`tt serve raahemnabeel/hy4-flash-qb2`) o `tt-model serve raahemnabeel/hy4-flash-qb2`; requiere Docker y el CLI `tt` (`uv tool install tenstorrent`).
- Servidor OpenAI-compatible en el puerto 20000 (o el siguiente libre).
- Tiempos de arranque: el primer arranque compila kernels para el dispositivo (varios minutos) y construye las cachés; los arranques posteriores están listos en unos 4 minutos.
- VRAM, GPU recomendadas, latencia y throughput: no disponibles (la tabla de rendimiento de servicio está truncada en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware | Disponibilidad |
|---|---|---|---|---|---|
| hy4-flash-qb2 (este paquete) | 220B totales, ~11,3B activos | 202.752 tokens | tencent-hy-license | Tenstorrent p300x2 | Hugging Face (0 descargas) |
| tencent/Hy4-flash (base) | 220B totales, ~11,3B activos | no disponible | tencent-hy-license | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- El paquete está atado al hardware Tenstorrent p300x2; no es desplegable en GPU convencionales según la información disponible.
- El primer arranque requiere compilación de kernels y generación de cachés (unos 165 GB), con tiempos de varios minutos.
- Con menos de 116 GB de RAM libre, el servidor lee las tablas Engram desde disco y decodifica más lentamente.
- El contexto es un pool compartido: las peticiones concurrentes se reparten los 202.752 tokens y, cuando se agota, vLLM pausa y recomputa peticiones.
- El razonamiento está activado por defecto; si el presupuesto de `max_tokens` se agota dentro del razonamiento, el campo `content` queda vacío.
- Solo se acepta `reasoning_effort` con los valores `high` y `no_think`; otros valores se rechazan.
- Licencia `tencent-hy-license`: es necesario revisar sus términos para uso comercial; la información disponible no detalla restricciones concretas.
- Idiomas soportados no disponibles; no se puede evaluar la cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- El paquete no registra descargas ni likes, lo que dificulta validar su uso en producción por terceros.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/raahemnabeel/hy4-flash-qb2
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
