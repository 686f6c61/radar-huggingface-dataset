# migtissera/Tess-4.5-27B-GGUF

## Resumen

Tess-4.5-27B-GGUF es la distribución en formato GGUF del modelo Tess-4.5-27B, un modelo de lenguaje de 27.000 millones de parámetros (26.895.998.464 exactamente) desarrollado por Mig Tissera bajo el sello Continuity Research. Está construido sobre Qwen3.8-27B y orientado explícitamente a trabajo de ingeniería real: razonamiento paso a paso, uso de herramientas (tool calling), codificación agéntica y ejecución local en una sola GPU o incluso en un portátil. Esta ficha cubre la variante GGUF, pensada para su uso con llama.cpp.

El modelo incorpora varias piezas diferenciadas dentro del mismo repositorio: los pesos cuantizados en Q4_K_M, Q6_K y Q8_0; un proyector de visión (`mmproj`) que habilita la entrada de imágenes (pipeline `image-text-to-text`); y cabezas de borrador MTP (multi-token prediction) que permiten decodificación especulativa y aceleran la generación hasta 2×. El contexto de trabajo recomendado en la línea de comandos de ejemplo es de 65.536 tokens.

Su relevancia actual radica en la combinación de tamaño contenido (27B), licencia Apache 2.0, soporte multimodal y decodificación especulativa integrada, todo ejecutable en hardware de consumo. Según la model card, iguala a su modelo base en el benchmark BenchLocal consumiendo un 25 % menos de tokens, lo que lo posiciona como una opción práctica para asistentes de terminal y pipelines de código en local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); no se detalla en la información disponible si es densa o MoE |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens (valor usado en el ejemplo de ejecución de la model card) |
| Tipos de cuantización | Q4_K_M, Q6_K, Q8_0 (pesos principales); F16 (proyector de visión); Q8_0 y Q4_K_M (cabezas MTP) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que Tess-4.5-27B deriva de Qwen3.8-27B, un transformer de 27B parámetros. El repositorio GGUF incluye tres componentes funcionales: los pesos del modelo principal cuantizados, un proyector de visión (`mmproj-Tess-4.5-27B-F16.gguf`, 0,9 GB) que aporta capacidad de entrada de imágenes, y cabezas de borrador MTP (`mtp-Tess-4.5-27B-Q8_0.gguf` de 3,2 GB y `mtp-Tess-4.5-27B-Q4_K_M.gguf` de 2,0 GB) para decodificación especulativa.

La innovación técnica destacada es la decodificación especulativa mediante MTP (multi-token prediction), que en la model card reporta aceleraciones de hasta 2× (de 48,9 a 96,1 tok/s en código sobre una RTX 4090). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo está afinado para razonar cada paso y operar con herramientas y archivos reales, con parámetros de muestreo recomendados de `temperature=1.0`, `top_p=0.95` y `top_k=20`.

## Capacidades

- Generación de texto y razonamiento paso a paso con modo "thinking" activado por defecto.
- Codificación agéntica: escritura y edición de código en el contexto de un directorio de trabajo real.
- Ejecución de comandos de shell y operación en terminal (la model card incluye ejemplos de rendimiento específicos para "shell").
- Tool calling / function calling: admite definiciones de herramientas reales en el campo `tools`.
- Razonamiento multi-paso y flujos agénticos.
- Entrada de imágenes mediante el proyector de visión (pipeline `image-text-to-text`).
- Decodificación especulativa con cabezas MTP para generación acelerada.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.

## Casos de uso

- Asistente de codificación en terminal: el modelo está diseñado para operar en un directorio de trabajo declarado en el system prompt, con acceso a herramientas reales, lo que permite tareas de refactorización, corrección de errores y navegación de repositorios de forma local.
- Automatización de shell y DevOps: con soporte de comandos de shell y tool calling, puede integrarse en scripts de automatización para ejecutar y verificar operaciones del sistema, con la ventaja de correr en una sola GPU.
- Revisión de código con capturas de pantalla: gracias al proyector de visión, puede analizar imágenes (diagramas, errores en pantalla, capturas de interfaces) junto con el código, útil en triaje de incidencias.
- Despliegue en portátil para desarrollo offline: la cuantización Q4_K_M (16,5 GB) cabe en un Mac de 32 GB o más, permitiendo un asistente de código sin conexión ni costes de API.
- Pipelines de CI/CD con latencia contenida: la decodificación MTP duplica el throughput en código (96,1 tok/s en RTX 4090), lo que lo hace viable para tareas de generación y verificación automática dentro de integración continua.
- Prototipado de agentes multi-paso: su razonamiento explícito y su soporte de herramientas permiten construir agentes que planifican y ejecutan tareas de ingeniería en local antes de escalar a infraestructura mayor.
- Servicio de inferencia con llama.cpp: mediante `llama-server` se puede exponer como endpoint compatible con la API de OpenAI, útil para entornos con requisitos de privacidad de datos.

## Benchmarks y rendimiento

La model card menciona el benchmark BenchLocal, en el que Tess-4.5 iguala a su base Qwen3.8-27B con un 25 % menos de tokens. No se proporcionan las puntuaciones numéricas de BenchLocal ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

Datos de velocidad publicados (Q4_K_M, llama.cpp upstream, una petición a la vez, thinking activado):

| Máquina | Sin borrador | Con MTP (código) | Con MTP (shell) |
|---|---|---|---|
| NVIDIA RTX 4090 | 48,9 tok/s | 96,1 tok/s | 85,5 tok/s |
| Apple M4 Max | 24,4 tok/s | 37,8 tok/s | 33,1 tok/s |

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere unos 16,5 GB de pesos; Q6_K, 22,1 GB; Q8_0, 28,6 GB. Añadir el proyector de visión (0,9 GB) y la cabeza MTP elegida (2,0 GB en Q4_K_M o 3,2 GB en Q8_0).
- GPU recomendadas: una RTX 4090 de 24 GB es el objetivo declarado para Q4_K_M; para Q8_0 se necesitan máquinas de 48 GB o más (A6000, A100, H100).
- Consumer GPU: sí, Q4_K_M cabe en una GPU de 24 GB y en un Mac con 32 GB o más de memoria unificada. Q6_K requiere más margen; Q8_0 no cabe en 24 GB.
- Despliegue: llama.cpp (`llama-server`), con soporte de `-hf` para descarga directa desde Hugging Face. El repositorio está etiquetado como `endpoints_compatible`.
- Contexto largo: en una GPU de 24 GB con contextos muy largos se recomienda cuantizar las cachés KV (`--cache-type-k q4_0 --cache-type-v q4_0`, y `-ctkd q4_0 -ctvd q4_0` para el borrador) o reducir `-c`.
- Latencia y throughput: ver tabla de la sección anterior (hasta 96,1 tok/s en RTX 4090 con MTP en código).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tess-4.5-27B | ≈26,9B | 65.536 | Apache 2.0 | GGUF / safetensors | Base Qwen3.8-27B; visión y MTP |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Modelo base de Tess-4.5 |
| Alternativas de 27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el repositorio declara únicamente inglés (`en`); el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: no se documenta ninguna mitigación específica en la información disponible; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas de código y comandos de shell.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Ejecución de comandos: al ser un modelo agéntico con acceso a shell, requiere sandboxing y revisión humana de las acciones en producción.
- Contexto: 65.536 tokens en el ejemplo; en GPU de 24 GB con contexto largo es necesario cuantizar las cachés KV o reducir el contexto.
- Dependencia de versión: la decodificación MTP requiere una build reciente de llama.cpp upstream; versiones antiguas no la soportarán.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- Fecha: la model card está fechada en octubre de 2026; verificar la vigencia de los datos de rendimiento.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/migtissera/Tess-4.5-27B-GGUF
- Model card del modelo base: https://huggingface.co/migtissera/Tess-4.5-27B
- Página de Continuity Research: https://continuityresearch.ai/tess-4-5/
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor en X: https://x.com/migtissera
- Vídeo de lanzamiento: https://huggingface.co/migtissera/Tess-4.5-27B/resolve/main/assets/tess-4.5-launch.mp4
