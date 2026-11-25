# raahemnabeel/hy4-flash

## Resumen

hy4-flash es un paquete de despliegue publicado por raahemnabeel que empaqueta el modelo multimodal y de razonamiento Hy4-flash de Tencent para su ejecución sobre hardware Tenstorrent p300x2. Se trata de un modelo de mezcla de expertos (MoE) de 220.000 millones de parámetros totales con aproximadamente 11.300 millones activos por token, diseñado para tareas de chat, razonamiento, código y uso de herramientas sobre texto, imágenes y vídeos cortos. El paquete incluye los pesos convertidos desde el checkpoint oficial en BF16 y una configuración de servicio basada en vLLM con un plugin específico para Tenstorrent.

La arquitectura combina 42 capas de atención MLA dispersa con ventana deslizante, 512 expertos enrutados con top-16 más un experto compartido, una memoria n-grama Engram de 63.500 millones de parámetros, un codificador de visión y un borrador especulativo. La ventana de contexto alcanza los 202.752 tokens, compartidos entre hasta 8 secuencias concurrentes. Esta ficha es relevante porque documenta una de las primeras integraciones publicadas de un modelo de este tamaño sobre aceleradores Tenstorrent, con métricas de rendimiento propias y un pipeline OpenAI-compatible.

El modelo base procede de Tencent y se distribuye bajo la licencia tencent-hy-license, que no es de código abierto estándar y requiere revisión para uso comercial. El repositorio pesa 8,3 GB, aunque el checkpoint completo que se descarga en el primer arranque ocupa 440 GB y genera unos 165 GB adicionales de cachés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA dispersa y ventana deslizante, memoria Engram n-grama, codificador de visión y borrador especulativo |
| Parametros totales | 220.000 millones (220B) |
| Parametros activos | Aproximadamente 11.300 millones (11,3B) por token |
| Longitud de contexto | 202.752 tokens (pool compartido entre hasta 8 secuencias) |
| Tipos de cuantizacion | Expertos enrutados en bfp4; tablas Engram en FP8; checkpoint original en BF16 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia "other", no estándar de código abierto) |
| Formato de pesos | Checkpoint BF16 original convertido en el primer arranque; empaquetado con tt-model-manager 0.1.0 (manifest schema 5.1) |
| Hardware objetivo | Tenstorrent p300x2 (mesh P300x2) |
| Numero de capas | 42 |
| Expertos enrutados | 512 (top-16) más 1 experto compartido |
| Memoria Engram | 63.500 millones de parámetros |
| Secuencias concurrentes | Hasta 8 |
| Servidor | vLLM con plugin Tenstorrent, API compatible con OpenAI en puerto 20000 |

## Arquitectura y entrenamiento

Hy4-flash es un transformer de mezcla de expertos con 42 capas que combina atención MLA (multi-head latent attention) dispersa con ventana deslizante. Cada token activa 16 de los 512 expertos enrutados, además de un experto compartido, lo que da lugar a unos 11,3B parámetros activos sobre un total de 220B. Una innovación destacable es la memoria Engram n-grama de 63.500 millones de parámetros, que actúa como almacén de patrones y se consulta durante la decodificación; en este despliegue se almacena en FP8 y puede residir en RAM de host (unos 116 GB para velocidad completa de decodificación) o leerse desde disco con penalización de latencia. El modelo incorpora además un codificador de visión para entradas de imagen y vídeo, y un borrador especulativo para decodificación especulativa.

El paquete no documenta los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO), que corresponden al modelo original de Tencent y no se detallan en la información disponible. La conversión a hardware Tenstorrent aplica precisión bfp4 a los expertos enrutados y FP8 a las tablas Engram, partiendo del checkpoint BF16 oficial. El servidor vLLM emplea un parser de tool calling (`hy_v4`) y un parser de razonamiento (`hy_v4`) que separa el texto de pensamiento del contenido final. La reutilización de caché permite reutilizar prefijos compartidos de 2.048 tokens o más entre peticiones, lo que acelera turnos sucesivos de conversación o preguntas repetidas sobre un mismo documento.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto (`reasoning_effort: high`) y modo directo (`no_think`).
- Entrada multimodal: hasta 4 imágenes por petición (redimensionadas a 2.048 x 2.048 como máximo) y un vídeo por petición (muestreado a 2 fps, máximo 64 fotogramas).
- Tool calling / function calling: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Razonamiento multi-paso y uso como agente, con separación explícita del texto de razonamiento.
- Capacidades de código y matemáticas, con resultados altos en HumanEval, MBPP, GSM8K y MATH-500 (ver benchmarks).
- Procesamiento de documentos largos gracias a la ventana de 202.752 tokens.
- Soporte de logprobs, salidas estructuradas, `logit_bias` y penalizaciones.
- Recuperación de información en contexto largo (needle retrieval) verificada entre 2K y 11K tokens, tanto en solitario como con 7 usuarios concurrentes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de razonamiento técnico: el modo `high` con 18.944 tokens de presupuesto de pensamiento permite resolver problemas de matemáticas y ciencia (GPQA-Diamond 87,4% en modo thinking) en flujos de consulta únicos.
- Generación de código en producción: con HumanEval pass@1 del 97,0% y soporte de tool calling, puede integrarse en pipelines que invocan funciones externas, ejecutan tests o consultan repositorios.
- Análisis de documentos largos: la ventana de 202.752 tokens permite cargar contratos, informes o bases de código completas y hacer preguntas sucesivas reutilizando la caché de prefijo.
- Atención al cliente multimodal: admite hasta 4 imágenes por turno y vídeo corto, lo que sirve para diagnosticar incidencias con capturas de pantalla o clips breves.
- Agentes autónomos multi-paso: el parser de razonamiento separa el pensamiento de la respuesta final y el tool calling estructurado facilita la orquestación con APIs externas.
- Evaluación de modelos sobre aceleradores alternativos: este paquete sirve como referencia para medir la fidelidad de la conversión bfp4/FP8 frente al BF16 original (86,5% de acuerdo top-1 con 8 usuarios).
- Procesamiento por lotes con concurrencia moderada: hasta 8 secuencias simultáneas compartiendo el pool de contexto, adecuado para equipos pequeños o entornos de investigación.

## Benchmarks y rendimiento

Resultados publicados por el autor del paquete, servidos a través del endpoint OpenAI con 8 peticiones en vuelo (lm-evaluation-harness, semilla 42). Tencent no publica cifras para estas configuraciones.

| Evaluacion | Resultado | Error estandar (SE) | Prompts | Configuracion |
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
| Acuerdo top-1 / KL (top 32) con referencia BF16, 8 usuarios | 86,5% / 0,223 | — | 8 textos | teacher forced |
| Igual, texto de 3K tokens, prefill / decode | 82,7% / 0,293 y 82,8% / 0,275 | — | 1 texto | teacher forced |

## Requisitos de hardware

- Hardware obligatorio: Tenstorrent p300x2 (mesh P300x2); no se documenta soporte para GPU convencionales en este paquete.
- RAM de host: unos 116 GB libres para velocidad de decodificación completa; 17 GB como mínimo (por debajo, el servidor se niega a arrancar salvo con `HY4_RAM_CHECK=warn`). Con menos de 116 GB, las tablas Engram se leen desde disco y la decodificación es más lenta.
- Disco: unos 610 GB en total (440 GB de checkpoint más unos 165 GB de cachés generadas en el primer arranque).
- Primer arranque: compila kernels para el dispositivo y construye las cachés (expertos bfp4 y tablas Engram FP8); tarda varios minutos. Arranques posteriores: unos 4 minutos.
- Despliegue: servidor compatible con OpenAI en el puerto 20000 mediante `tt serve raahemnabeel/hy4-flash` o `tt-model serve raahemnabeel/hy4-flash`; requiere Docker y la CLI de Tenstorrent (`uv tool install tenstorrent`).
- VRAM estimada en GPU: no disponible (el paquete está orientado exclusivamente a Tenstorrent p300x2).
- GPU recomendadas: no aplicable; no se documenta ejecución en A100, H100 ni RTX 4090.
- Latencia y throughput: no disponibles de forma explícita; solo se indica que greedy (temperature 0) es lo más rápido y que la reutilización de caché de prefijo acelera turnos sucesivos.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. El modelo base es tencent/Hy4-flash, y este paquete es una conversión específica para Tenstorrent p300x2; no se documentan alternativas equivalentes en la misma categoría (MoE multimodal de ~220B con contexto de ~200K) ni sus cifras de rendimiento en este hardware.

| Modelo | Parametros | Contexto | Licencia | Hardware |
|---|---|---|---|---|
| raahemnabeel/hy4-flash (este paquete) | 220B totales / 11,3B activos | 202.752 | tencent-hy-license | Tenstorrent p300x2 |
| tencent/Hy4-flash (base) | 220B totales / 11,3B activos | no disponible en la informacion | tencent-hy-license | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia tencent-hy-license: no es una licencia de código abierto estándar; es imprescindible revisar los términos antes de cualquier uso comercial.
- El paquete está atado al hardware Tenstorrent p300x2; no se documenta portabilidad a GPU convencionales ni a otras configuraciones.
- La fidelidad frente al BF16 original no es total: el acuerdo top-1 con 8 usuarios es del 86,5% (KL 0,223), y en textos de 3K tokens baja al 82,7% en prefill y 82,8% en decode.
- El modo de razonamiento está activado por defecto; si el presupuesto de `max_tokens` se agota durante el razonamiento, el campo `content` llega vacío.
- El pool de contexto es compartido: las peticiones concurrentes se reparten los 202.752 tokens y, al agotarse, vLLM pausa y recalcula peticiones.
- Con menos de 116 GB de RAM libre, las tablas Engram se leen desde disco y la decodificación se ralentiza; por debajo de 17 GB el servidor no arranca.
- El primer arranque requiere compilación de kernels y construcción de cachés, con tiempos de espera considerables y un consumo de disco de unos 610 GB.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse con pruebas propias antes de producción.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Los benchmarks publicados son del autor del paquete y se ejecutaron con configuraciones concretas (greedy, 8 peticiones en vuelo, semilla 42); Tencent no publica cifras para esas configuraciones.

## Enlaces

- Repositorio del paquete: https://huggingface.co/raahemnabeel/hy4-flash
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- CLI de Tenstorrent (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
