# halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin

## Resumen

Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin es una compilación cuantizada a 4 bits del modelo Swift 1.5, un post-entrenamiento de razonamiento eficiente desarrollado por UkisAI sobre Qwen3.8-Flash-Next. Se trata de un modelo de mezcla de expertos (MoE) con 123.958.298.771 parámetros totales y aproximadamente 6.000 millones de parámetros activos por token, que incorpora capacidad de visión y un contexto de 262.144 tokens. La versión que nos ocupa, publicada por el usuario halt95, aplica cuantización W4A16 mediante AutoRound y está empaquetada para ejecutarse con el motor Merlin, un fork de vLLM 0.33.0 optimizado para GPUs NVIDIA Ampere y Ada.

El problema que resuelve esta ficha es concreto: hacer viable un modelo de 125B con contexto completo de 262K en hardware de consumo profesional, en este caso cuatro RTX 3090 de 24 GB. El checkpoint ocupa 115 GiB, mantiene los expertos enrutados en INT4, la tabla de embeddings n-gram en FP8 alojada en RAM del host, y la caché KV en FP8 E4M3 íntegramente en VRAM. Esto permite sostener tres sesiones simultáneas de 262K tokens o servir ocho agentes conversacionales concurrentes.

Es relevante ahora porque demuestra una ruta práctica para desplegar modelos MoE grandes con visión y contexto largo sin recurrir a clústeres de A100/H100, a costa de depender de un motor de inferencia específico (Merlin) y de una licencia poco habitual (Swift Open License 1.0 combinada con la Qwen Community License 1.0). No es un modelo oficial de UkisAI ni de Qwen: es un derivado independiente no revisado ni respaldado por los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención y Gated DeltaNet, cabeza MTP para decodificación especulativa, torre de visión |
| Parametros totales | 123.958.298.771 |
| Parametros activos | ~6B por token (MoE, 512 expertos enrutados por capa) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16 (expertos enrutados INT4 g128), INT8 por canal (proyecciones DeltaNet), BF16 (atención, expertos compartidos, normas, visión), FP8 (tabla n-gram, caché KV) |
| Idiomas soportados | Inglés (en) |
| Licencia | Swift Open License 1.0 + Qwen Community License 1.0 (license: other) |
| Formato de pesos | safetensors (formato compressed-tensors), servido con vLLM/Merlin |

## Arquitectura y entrenamiento

El modelo base es un MoE de 125B parámetros con 6B activos por token, que combina capas de atención tradicional (12 capas con proyecciones q/k/v/o) con capas de Gated DeltaNet (36 capas con proyecciones in_proj_qkv, in_proj_z y out_proj), además de 48 capas de expertos compartidos. Incorpora una cabeza MTP (Multi-Token Prediction) que actúa como borrador para decodificación especulativa, y una torre de visión que lo habilita como modelo image-text-to-text. La tabla de embeddings n-gram (PLE) contiene 51.000 millones de parámetros y se mantiene en RAM del host en tiempo de servicio.

El proceso de cuantización de esta ficha parte del checkpoint Flash-Next W4A16 de halt95 y sustituye los 300 tensores densos que Swift 1.5 modificó respecto al modelo original: las proyecciones de atención q/k/v/o (12 capas), las proyecciones DeltaNet (36 capas) y los expertos compartidos (48 capas). Los expertos enrutados provienen de la release AutoRound de Intel y Swift 1.5 no los alteró. Las escalas FP8 de la caché KV se recalibraron sobre Swift 1.5 porque cambiaron k_proj y v_proj. La verificación de integridad incluyó SHA-256 completo de cada tensor de la cabeza MTP y hashes por shard o muestreados en los grupos sin cambios. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (el servidor usa effort medium por defecto).
- Comprensión de imágenes y texto (pipeline image-text-to-text) gracias a la torre de visión en BF16.
- Razonamiento multi-paso y soporte de agentes: el bench card reporta ocho conversaciones concurrentes de 16K tokens con seguimientos simultáneos.
- Decodificación especulativa mediante cabeza MTP, que acelera la generación a costa de variabilidad en la tasa según el texto.
- Contexto largo real de 262.144 tokens con caché KV FP8 íntegramente en VRAM.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar prompts de más de 100.000 tokens (el bench card mide prefill sobre 101.845 tokens), lo que permite resumir o extraer información de informes, expedientes o bases de código completas en una sola pasada.
- Agentes conversacionales concurrentes: con ocho conversaciones de 16K tokens simultáneas y seguimientos de 512 tokens, es adecuado para plataformas de atención al cliente o asistentes internos que requieran memoria de conversación amplia.
- Procesamiento de documentación técnica con imágenes: al ser image-text-to-text, puede interpretar diagramas, capturas de pantalla o figuras junto al texto en manuales y documentación de ingeniería.
- Investigación y prototipado en hardware de consumo: cuatro RTX 3090 permiten ejecutar un modelo de 125B con contexto completo, lo que facilita experimentación académica sin acceso a clústeres A100/H100.
- Análisis de repositorios y revisión de código a gran escala: el contexto de 262K admite volcar múltiples ficheros y mantener coherencia entre ellos para tareas de auditoría o generación de parches.
- Razonamiento con esfuerzo controlado: el modo thinking con effort medium por defecto permite ajustar el equilibrio entre profundidad de razonamiento y latencia en pipelines de clasificación o extracción estructurada.
- Servicio de inferencia en producción con vLLM/Merlin: al estar empaquetado para vLLM 0.33.0 (fork Merlin), se integra en despliegues existentes basados en esta pila, con decodificación especulativa y caché KV FP8.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento de inferencia, no de calidad en benchmarks académicos (MMLU, HumanEval, GSM8K no se reportan).

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificación (1 stream, thinking on) | 173,4–192,8 tok/s (mediana ~182 tok/s) | 261.888 tokens de prompt + 128 de salida, mediana de 3 envíos |
| Prefill (prompt frío) | 6.964 tok/s | Prompt de 101.845 tokens |
| Agentes concurrentes | 688 tok/s totales | 8 agentes simultáneos, thinking on, effort medium |
| Pool KV | 924.993 tokens | FP8, íntegramente en VRAM |
| Sesiones de 262K simultáneas | 3 | Medido en ejecución 3.0.0 |
| Huella del checkpoint | 115 GiB | 4× RTX 3090 sin NVLink @ 220W, P2P activo |

Hardware de medida: 4× RTX 3090 sin NVLink a 220W, P2P activo, con actualización de host gpu-unlock, bench card de 2026-11-12, re-medido sobre la wheel publicada el 2026-11-11. Las cifras de Merlin 3.0.2.1 se trasladaron a 3.0.2.2 tras una comprobación puntual el 2026-11-21 (decodificación 4K y prefill 100K dentro de sus bandas de ±3 % entre ejecuciones).

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 115 GiB; se necesitan al menos cuatro GPUs de 24 GB (96 GB) con la tabla n-gram en RAM del host, o configuraciones mayores si se prescinde de esa descarga.
- GPUs medidas: 4× RTX 3090 (Ampere, sm86), sin NVLink, a 220W, con P2P activo. El motor incluye perfiles Swift para otras tarjetas Ampere y Ada, aunque los perfiles Ada están en pruebas o sin probar según la model card.
- No cabe en una única GPU de consumo; requiere un mínimo de cuatro RTX 3090 o equivalente.
- Despliegue: exclusivamente mediante el motor Merlin (fork de vLLM 0.33.0), disponible en el repositorio github.com/halt95/merlin-engine. No se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: ~182 tok/s en decodificación a 262K de contexto, 6.964 tok/s de prefill y 688 tok/s agregados con ocho agentes concurrentes, según el bench card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin | 123,96B (MoE, ~6B activos) | 262.144 | Swift Open 1.0 + Qwen Community 1.0 | Hugging Face, requiere Merlin |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | 125B (MoE) | 262.144 (según ficha del derivado) | Swift Open 1.0 + Qwen Community 1.0 | Hugging Face |
| halt95/Qwen3.8-Flash-Next-W4A16-Merlin | 125B (MoE) | 262.144 (según ficha del derivado) | Qwen Community 1.0 | Hugging Face, requiere Merlin |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | 125B (MoE) | no disponible | Qwen Community 1.0 | Hugging Face |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento de estos modelos entre sí en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se documentan capacidades multilingües.
- Es un derivado independiente no revisado ni respaldado por UkisAI ni por Qwen; el autor lo declara explícitamente.
- Dependencia total del motor Merlin (fork de vLLM 0.33.0): no hay soporte documentado para otras pilas de inferencia, lo que limita la portabilidad.
- Los perfiles para GPUs Ada están en pruebas o sin probar; el soporte verificado es Ampere (sm86).
- La licencia combina Swift Open License 1.0 y Qwen Community License 1.0, con posibles restricciones para uso comercial que deben revisarse en el fichero LICENSE antes de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo ni de robustez en la información disponible.
- El rendimiento con decodificación especulativa varía según el texto de entrada (la propia model card lo advierte), por lo que la latencia no es uniforme.
- Con solo 300 descargas y 5 likes, la validación comunitaria es escasa; conviene verificar la integridad de los pesos y probar en el hardware objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin
- Modelo base Swift 1.5 (UkisAI): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Checkpoint Flash-Next W4A16 de halt95: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Release AutoRound de Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Tabla n-gram NVFP4 de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Motor Merlin: https://github.com/halt95/merlin-engine
- Bench card: https://github.com/halt95/merlin-engine/blob/main/models/swift1.5/benchmarks/2026-11-12/BENCH-CARD.md
- Comunidad Discord: https://discord.gg/jVDYAwdGzt
- Apoyo al autor (Ko-fi): https://ko-fi.com/halt95
