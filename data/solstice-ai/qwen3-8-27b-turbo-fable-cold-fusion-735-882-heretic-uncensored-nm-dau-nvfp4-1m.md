# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-1M

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-1M es un modelo de lenguaje multimodal de 26.9 mil millones de parámetros, desarrollado por Solstice-AI como una versión cuantizada y optimizada de un fine-tune de DavidAU sobre el modelo base Qwen3.8-27B de Alibaba. El modelo combina una arquitectura híbrida con atención lineal, una torre de visión integrada y un mecanismo de predicción multi-token (MTP) para aceleración especulativa. Su característica más destacada es una ventana de contexto nativa de 1.048.576 tokens (2^20), gestionada mediante compresión de cache KV con la técnica Google TurboQuant.

El modelo se distribuye en formato NVFP4 (NVIDIA Blackwell) y safetensors, con un peso total de 19.8 GB. Según la model card del autor, supera a Claude Opus 4.6 Max en varios benchmarks de ingeniería de software agéntica y control de sistemas operativos, aunque estas afirmaciones no han sido verificadas de forma independiente. Es relevante porque demuestra que un modelo de 27B con cuantización agresiva puede alcanzar rendimientos comparables a modelos cerrados mucho mayores, al menos según las métricas publicadas por su creador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal en 48 de 64 capas, torre de vision, MTP draft head |
| Parametros totales | 26.895.998.464 (26.9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (2^20) nativos, segun el autor |
| Tipos de cuantizacion | NVFP4 (formato principal), safetensors en bfloat16, GGUF (segun tags) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, NVFP4 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con atencion hibrida: 48 de sus 64 capas usan atencion lineal (probablemente del tipo Gated Linear Attention o similar) y las 16 restantes usan atencion full. Incluye una torre de vision para procesamiento multimodal y un MTP draft head para decodificacion especulativa. Sobre esta base, DavidAU aplico la metodologia COLD FUSION, que reduce los tokens de pensamiento a entre 1/10 y 1/2 de los modelos Qwen estandar, manteniendo el 99% del rendimiento en precision completa. Solstice-AI posteriormente aplico cuantizacion NVFP4 de NVIDIA y compresion de cache KV con Google TurboQuant, que usa rotacion FWHT y cuantizacion vectorial residual QJL.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que el modelo es "uncensored", lo que sugiere un entrenamiento sin alineacion restrictiva, pero no se aportan datos concretos sobre el proceso.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo "thinking" activable mediante el prompt de sistema.
- Generacion de codigo y resolucion de tareas de ingenieria de software, incluyendo edicion de multiples archivos y ejecucion de pruebas.
- Soporte de tool calling y function calling, implicito por su uso en entornos agénticos como SWE-bench.
- Capacidades de agente y razonamiento multi-paso, demostradas en benchmarks de control de ordenador (OSWorld) y movil (AndroidWorld).
- Procesamiento multimodal de imagen a texto (image-text-to-text), con torre de vision integrada.
- Ventana de contexto de 1M tokens, adecuada para documentos largos y conversaciones extensas.
- Aceleracion especulativa mediante MTP, que reduce la latencia de generacion.
- Multilingue limitado a ingles y chino.

## Casos de uso

- Ingenieria de software agéntica: el modelo puede resolver tareas de SWE-bench Pro, editando codigo, ejecutando pruebas y corrigiendo errores de forma autonoma. Su contexto de 1M tokens permite cargar repositorios completos en memoria.
- Control de ordenador (computer use): con 84.3% en OSWorld-Verified, puede operar interfaces graficas, navegar por aplicaciones y realizar tareas administrativas de forma automatizada.
- Control de moviles Android: su rendimiento en AndroidWorld (81.9%) lo hace util para automatizar pruebas de apps o asistencia remota en dispositivos.
- Generacion de codigo en produccion: con 90.3% en LiveCodeBench, puede integrarse en pipelines de CI/CD para generar o revisar codigo competitivo.
- Asistente multimodal: al aceptar imagenes como entrada, puede describir capturas de pantalla, diagramas o interfaces para tareas de documentacion o soporte.
- Procesamiento de documentos largos: su contexto de 1M tokens permite resumir o analizar libros tecnicos, codigos fuente extensos o expedientes completos en una sola pasada.
- Chat sin censura: al ser "uncensored", puede usarse en entornos donde se requiere generacion de contenido sin restricciones politicas o de seguridad, aunque con los riesgos asociados.

## Benchmarks y rendimiento

La model card del autor presenta los siguientes resultados, comparados con Claude Opus 4.6 Max. Estos datos son afirmaciones del creador y no han sido verificados de forma independiente:

| Benchmark | Qwen3.8-27B TURBO (Solstice) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|
| SWE-bench Pro | 61.7% | 53.4% | +8.3% |
| LiveCodeBench v6 | 90.3% | 88.8% | +1.5% |
| QwenSWEBench | 79.0% | 63.8% | +15.2% |
| CoWorkBench | 70.7% | 68.2% | +2.5% |
| OSWorld-Verified | 84.3% | 72.7% | +11.6% |
| AndroidWorld | 81.9% | 62.0% | +19.9% |
| IFBench | 79.5% | 62.5% | +17.0% |
| ARC-C | 735 (8-bit) / 719 (4-bit) | ~710-720 | Frontier tier |

No se han publicado resultados de benchmarks en la informacion disponible fuera de la model card. Los datos de ARC-C provienen del modelo base de DavidAU, no de esta version cuantizada.

## Requisitos de hardware

- VRAM estimada: 18.8 GB en formato NVFP4, segun el autor. El repo pesa 19.8 GB, por lo que se necesita al menos 20 GB de VRAM para cargar los pesos completos.
- GPU recomendadas: NVIDIA Blackwell (B200, RTX 5090) por el formato NVFP4. Para versiones GGUF, puede ejecutarse en GPUs consumer de 24 GB (RTX 4090) con cuantizaciones de 4 bits.
- Compresion de cache KV: con TurboQuant, un contexto de 1M tokens requiere entre 10.2 GB (2-bit) y 18.2 GB (4-bit) adicionales, frente a 88.4 GB en FP16.
- Opciones de despliegue: motor Anvil Runtime (recomendado por el autor), transformers con device_map="auto", y probablemente vLLM o llama.cpp para las versiones GGUF.
- Latencia y throughput: no disponible. El MTP deberia reducir la latencia de generacion, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | SWE-bench Pro | LiveCodeBench |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26.9B | 262K nativo, extensible a 1M | Apache 2.0 | no disponible | no disponible |
| Qwen3.8-27B-TURBO (Solstice) | 26.9B | 1M nativo | Apache 2.0 | 61.7% (segun autor) | 90.3% (segun autor) |
| Claude Opus 4.6 Max (cerrado) | no disponible | no disponible | propietaria | 53.4% | 88.8% |

La comparativa con Claude Opus 4.6 Max se basa exclusivamente en las afirmaciones de la model card. No se dispone de datos de otros modelos abiertos de tamano similar (como Llama 3.3 70B o Mistral Large) en los mismos benchmarks.

## Limitaciones y advertencias

- Las afirmaciones de rendimiento provienen del autor y no han sido verificadas por terceros. El modelo tiene 0 descargas y solo 2 likes en HuggingFace, lo que sugiere una adopcion minima.
- Al ser "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones donde se requiera moderacion de contenido.
- Solo soporta ingles y chino. No hay datos sobre rendimiento en otros idiomas.
- La cuantizacion NVFP4 requiere hardware NVIDIA Blackwell. En GPUs mas antiguas, habra que usar las versiones GGUF o safetensors en bfloat16, que necesitan mas VRAM.
- El contexto de 1M tokens con compresion TurboQuant puede degradar la calidad en tareas que requieren recuperacion precisa de informacion, aunque el autor afirma una perdida menor al 1% en 3-bit.
- La licencia Apache 2.0 permite uso comercial, pero el nombre del modelo incluye "Heretic" y "Uncensored", lo que puede generar problemas de marca o reputacion en entornos empresariales.
- No se dispone de informacion sobre sesgos especificos, pero al ser un fine-tune de Qwen, hereda los sesgos del modelo base chino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-1M
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Version GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo de Anvil Runtime: https://github.com/Solstice-Labs/anvil
- Guia de ejecucion local de Qwen 3.8 27B: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Ficha de Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
