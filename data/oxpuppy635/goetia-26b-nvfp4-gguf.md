# oxpuppy635/Goetia-26B-NVFP4-GGUF

## Resumen

Goetia-26B-NVFP4-GGUF es una cuantización en formato GGUF nativo NVFP4 del modelo Goetia-26B, un Mixture-of-Experts (MoE) de aproximadamente 26 mil millones de parámetros construido sobre la arquitectura Gemma-4 y con 128 expertos enrutados. Lo publica el usuario oxpuppy635 en Hugging Face bajo licencia Apache 2.0. El problema que resuelve es de eficiencia de despliegue: comprime el modelo desde unos 52 GB en BF16 hasta 15,3 GB, lo que permite cargarlo por completo en una única GPU de 16 GB de VRAM.

La cuantización emplea super-bloques GGML NVFP4 (tipo 39) con pesos de 4 bits en coma flotante E2M1 y micro-escalas FP8 cada 16 elementos. Se cuantizan tanto las proyecciones densas de auto-atención como las proyecciones de los 128 expertos MoE en las 30 capas del modelo, mientras que los embeddings de tokens se preservan en BF16 y las normalizaciones y escalares en FP32/BF16 para mantener la estabilidad numérica.

Es relevante ahora porque demuestra que un MoE de 26B puede ejecutarse íntegramente en GPUs de consumo de gama media-alta (RTX 4080, RTX 5070) con velocidades de decodificación de decenas de tokens por segundo, algo que en BF16 requeriría al menos 48-52 GB de VRAM. El repositorio tiene un uso muy limitado (56 descargas, 0 likes) y fue creado en octubre de 2026, por lo que debe tratarse como un artefacto experimental más que como una opción consolidada de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4 MoE (`gemma4` en GGML), transformer Mixture-of-Experts |
| Parametros totales | 25.233.142.046 (~26B) |
| Parametros activos | no disponible (128 expertos enrutados, sin dato de expertos activos por token) |
| Longitud de contexto | Hasta 8k tokens en GPU de 16 GB; hasta 32k+ en GPU de 24 GB (con Flash Attention) |
| Tipos de cuantizacion | NVFP4 nativo (GGML_TYPE_NVFP4, tipo 39), super-bloques de 36 bytes por 64 elementos, pesos E2M1 con micro-escalas FP8 cada 16 elementos; embeddings en BF16, normalizaciones en FP32/BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Goetia-26B es un transformer Mixture-of-Experts sobre la arquitectura Gemma-4, con 30 capas y 128 expertos enrutados. La model card del repositorio cuantizado no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; esa información no está disponible en los materiales proporcionados. Tampoco se especifica el número de expertos activos por token ni la dimensión oculta.

La innovación técnica de este repositorio es exclusivamente de cuantización: empaqueta las proyecciones de atención (`attn_q`, `attn_k`, `attn_v`, `attn_output`) y las proyecciones de todos los expertos MoE (`ffn_gate_up_exps`, `ffn_down_exps`) en super-bloques NVFP4, un formato de coma flotante de 4 bits con escalado por micro-bloque que preserva mejor el rango dinámico que una cuantización entera de 4 bits. Se mantienen en BF16 los embeddings de tokens y en FP32/BF16 las normalizaciones y escalares de capa para evitar degradación en la inferencia. El resultado reduce el peso de ~52 GB a 15,3 GB, con una pérdida de precisión no cuantificada en la documentación disponible.

## Capacidades

- Generación de texto en inglés; la model card solo declara el idioma `en`.
- Razonamiento y generación de código: no hay documentación específica en el repositorio, pero son capacidades esperables de un modelo de 26B sobre Gemma-4; no confirmadas por benchmarks publicados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Inferencia compatible con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Despliegue en estación de trabajo con GPU de 16 GB: cargar el GGUF completo con `-ngl 99 -fa` en una RTX 4080 o RTX 5070 permite ejecutar un MoE de 26B sin descarga parcial a CPU, con un throughput de ~40-60 t/s según el autor.
- Prototipado local de asistentes de texto en inglés: al caber en una sola GPU de consumo, sirve para iterar sobre prompts y flujos conversacionales sin coste de API, aceptando contextos de hasta 8k tokens.
- Evaluación de cuantización NVFP4: el repositorio es útil como banco de pruebas para medir la degradación de un MoE de 128 expertos cuantizado a 4 bits FP frente a BF16 en tareas de generación.
- Servicio de inferencia de baja concurrencia: con 24 GB de VRAM (RTX 3090/4090) y contexto de 32k+, puede atender un pequeño número de sesiones simultáneas en llama.cpp con Flash Attention.
- Investigación sobre arquitecturas MoE con Gemma-4: permite estudiar el comportamiento de 128 expertos enrutados en hardware asequible, comparando rutas de expertos y estabilidad numérica.
- Generación de texto por lotes en CPU: con 24 GB+ de RAM del sistema, el modelo puede ejecutarse sin GPU a ~2-5 t/s, adecuado para tareas offline no sensibles a latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta cifras de throughput estimado por configuración de hardware:

| Hardware | Estrategia de offload | Contexto | Rendimiento estimado |
|---|---|---|---|
| GPU 16 GB (RTX 4080, RTX 5070/5060 Ti) | Full offload (`-ngl 99`, `-fa`) | Hasta 8k tokens | ~40-60+ t/s |
| GPU 24 GB (RTX 3090, RTX 4090) | Full offload (`-ngl 99`) | Hasta 32k+ tokens | ~60-80+ t/s |
| CPU / RAM | Requiere 24 GB+ de RAM | Cualquiera | ~2-5 t/s |

## Requisitos de hardware

- VRAM estimada: 15,3 GB de pesos; con Flash Attention activada (`-fa`) el KV cache se mantiene mínimo y cabe en 16 GB para contextos de hasta 8k tokens.
- GPU recomendadas: RTX 4080, RTX 5070, RTX 5060 Ti, L4, L40S para el perfil de 16 GB; RTX 3090 y RTX 4090 para contextos de 32k+.
- GPU de consumo: sí, en RTX 4080 y en la gama RTX 50xx con 16 GB; no cabe en GPUs de 8-12 GB sin offload parcial a CPU.
- Opciones de despliegue: llama.cpp compilado con CUDA (`-DGGML_CUDA=ON`); el formato GGUF es compatible con el ecosistema llama.cpp (Ollama y otros runners basados en él), aunque el tipo NVFP4 requiere una build reciente que soporte `GGML_TYPE_NVFP4`.
- Latencia y throughput: ~40-60+ t/s en GPU de 16 GB y ~60-80+ t/s en GPU de 24 GB según el autor; ~2-5 t/s en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia estructural, el propio modelo base Goetia-26B en BF16 (~52 GB) sería la alternativa de mayor precisión, pero requiere al menos 48-52 GB de VRAM y no se dispone de sus métricas de rendimiento.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- No hay benchmarks publicados: se desconoce la degradación de calidad introducida por la cuantización NVFP4 frente al modelo base en BF16.
- La cuantización de 4 bits en un MoE con 128 expertos puede afectar de forma desigual a expertos poco activados; no se documenta ninguna evaluación de perplejidad ni de tareas downstream.
- El repositorio tiene 56 descargas y 0 likes, creado en octubre de 2026: es un artefacto reciente y sin validación comunitaria.
- Requiere una build de llama.cpp con soporte de `GGML_TYPE_NVFP4` (tipo 39); versiones antiguas no podrán cargar el archivo.
- El contexto máximo práctico en GPU de 16 GB se limita a ~8k tokens; para contextos mayores se necesita hardware de 24 GB o más.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el modelo base ni sobre la fidelidad de la cuantización.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base Goetia-26B, del que no se aportan detalles de entrenamiento ni de alineación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oxpuppy635/Goetia-26B-NVFP4-GGUF
- llama.cpp (requerido para la inferencia): https://github.com/ggerganov/llama.cpp
