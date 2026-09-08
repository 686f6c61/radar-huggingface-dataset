# maclocal/DeepSeek-V4-Flash-0731-AFM-MLX

## Resumen

DeepSeek-V4-Flash-0731-AFM-MLX es una conversión MLX nativa AFM del checkpoint oficial `deepseek-ai/DeepSeek-V4-Flash-0731`, realizada por el usuario `maclocal`. El modelo original es el lanzamiento oficial de DeepSeek-V4-Flash, que sustituye a la versión preliminar con capacidades de agente mejoradas. Se trata de un modelo de lenguaje de 304.180.418.494 parámetros totales con arquitectura de mezcla de expertos (MoE) y un módulo de decodificación especulativa DSpARK/MTP integrado.

El modelo destaca por superar a DeepSeek-V4-Pro (Preview) en benchmarks de agentes a pesar de tener un número de parámetros activos mucho menor, y por ser competitivo con modelos propietarios de primer nivel. Esta conversión concreta emplea cuantización mixta MXFP4 para los expertos enrutados y MXFP8 para atención y proyecciones, lo que reduce el tamaño del repositorio a 167.1 GB. No se dispone de datos sobre la longitud de contexto ni sobre los idiomas soportados en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y módulo de decodificación especulativa DSpARK/MTP |
| Parametros totales | 304.180.418.494 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4-bit, grupo 32) para expertos enrutados; MXFP8 (8-bit, grupo 32) para atención, proyecciones compartidas y proyecciones de soporte MTP |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (conversión MLX nativa AFM) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformer de mezcla de expertos con un módulo de decodificación especulativa DSpARK/MTP adjunto, que permite acelerar la generación mediante predicción de múltiples tokens. El checkpoint conserva los tensores de soporte DSpARK/MTP embebidos. La conversión a MLX se realizó con el convertidor integrado de AFM, usando la versión 11 del formato de conversión y el perfil `native`. El diseño de cuantización mixta asigna MXFP4 con grupo de 32 a los expertos enrutados y MXFP8 con grupo de 32 a atención, proyecciones compartidas y proyecciones de soporte MTP.

No se proporcionan datos sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO en la información disponible. El model card indica que esta versión tiene capacidades de agente mejoradas respecto a la versión preliminar, pero no detalla el proceso de entrenamiento.

## Capacidades

- Razonamiento y capacidades de agente mejoradas, con resultados destacados en benchmarks de terminal, repositorios y tareas de ciberejercicios.
- Decodificación especulativa DSpARK/MTP integrada, activable mediante el parámetro `--mtp` en el runtime AFM.
- Soporte del parámetro `reasoning_effort` con tres niveles: `low`, `high` y `max`, que controlan el tiempo de deliberación antes de responder.
- Codificación de mensajes en formato OpenAI-compatible mediante scripts Python incluidos en la carpeta `encoding`, ya que el modelo no incorpora plantilla de chat Jinja.
- Generación de texto y tareas de programación, con puntuaciones relevantes en benchmarks de agentes de código como NL2Repo, DeepSWE y Terminal Bench.
- No se documenta explícitamente soporte de tool calling o function calling, pero los benchmarks de agentes indican capacidades para interactuar con terminales, repositorios y entornos de automatización.

## Casos de uso

- Desarrollo de software asistido: el modelo alcanza 54.2 en NL2Repo y 54.4 en DeepSWE, por lo que es adecuado para convertir especificaciones en repositorios completos y para resolver issues en proyectos de código existentes.
- Automatización de terminal: con 82.7 en Terminal Bench 2.1, puede ejecutar tareas de línea de comandos, gestionar procesos y administrar sistemas de forma autónoma.
- Agentes de ciberseguridad: el resultado de 76.7 en Cybergym indica capacidad para operar en entornos de ciberejercicios y resolver retos de seguridad ofensiva o defensiva.
- Uso de herramientas en entornos de agente: con 70.3 en Toolathlon-Verified, es apto para tareas que requieren seleccionar y utilizar herramientas externas de forma correcta.
- Automatización de procesos de negocio: el 25.1 en AutomationBench Public sugiere aplicaciones en flujos de trabajo empresariales, aunque con margen de mejora frente a modelos propietarios.
- Desarrollo full-stack: el 68.7 en DSBench-FullStack y el 59.6 en DSBench-Hard indican que puede abordar tareas complejas de desarrollo de aplicaciones completas, incluyendo frontend, backend y bases de datos.
- Razonamiento complejo en entornos de agente: el 25.2 en Agents' Last Exam refleja capacidad para resolver preguntas difíciles de razonamiento, útil en investigación y análisis técnico.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la tabla publicada en el model card del autor. Se evaluaron con el framework DeepSeek Harness en modo mínimo, con `reasoning_effort` en `max`, `temperature = 1.0` y `top_p = 0.95`. DSBench-FullStack y DSBench-Hard son conjuntos internos de DeepSeek.

| Benchmark | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Flash (Preview) | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Opus-4.8 |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 82.7 | 61.8 | 72.1 | 81.0 | 85.0 |
| NL2Repo | 54.2 | 39.4 | 38.5 | 48.9 | 69.7 |
| Cybergym | 76.7 | 38.7 | 52.7 | - | 83.1 |
| DeepSWE | 54.4 | 7.3 | 12.8 | 46.2 | 58.0 |
| Toolathlon-Verified | 70.3 | 49.7 | 55.9 | 59.9 | 76.2 |
| Agents' Last Exam | 25.2 | 15.8 | 16.5 | 23.8 | 25.7 |
| AutomationBench Public | 25.1 | 10.8 | 12.8 | 12.9 | 27.2 |
| DSBench-FullStack † | 68.7 | 37.0 | 41.8 | 61.8 | 71.6 |
| DSBench-Hard † | 59.6 | 25.8 | 31.1 | 54.5 | 71.7 |

† DSBench-FullStack es un conjunto de pruebas interno de desarrollo full-stack; DSBench-Hard es un conjunto interno de problemas difíciles de agentes de código.

## Requisitos de hardware

- El repositorio ocupa 167.1 GB, por lo que se requiere al menos esa cantidad de memoria disponible para cargar los pesos cuantizados.
- Al ser una conversión MLX, está pensada para ejecutarse en hardware Apple Silicon mediante el proveedor nativo MLX de AFM.
- No se dispone de estimaciones oficiales de VRAM para GPUs NVIDIA ni de recomendaciones de modelos concretos (A100, H100, RTX 4090, etc.).
- Opciones de despliegue: únicamente mediante el runtime AFM con proveedor MLX nativo. No es compatible con runtimes genéricos como vLLM, llama.cpp, Ollama o TGI según la advertencia del model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparativa se basa en los resultados de benchmarks publicados por el autor. No se dispone de datos de parámetros totales, parámetros activos ni longitud de contexto para los modelos comparados, por lo que la comparación se limita al rendimiento en tareas de agentes.

| Modelo | Terminal Bench 2.1 | NL2Repo | DeepSWE | Toolathlon-Verified | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 | 82.7 | 54.2 | 54.4 | 70.3 | MIT |
| DeepSeek-V4-Flash (Preview) | 61.8 | 39.4 | 7.3 | 49.7 | MIT |
| DeepSeek-V4-Pro (Preview) | 72.1 | 38.5 | 12.8 | 55.9 | MIT |
| GLM-5.2 | 81.0 | 48.9 | 46.2 | 59.9 | no disponible |
| Opus-4.8 | 85.0 | 69.7 | 58.0 | 76.2 | no disponible |

## Limitaciones y advertencias

- Es un artefacto experimental AFM destinado a una versión futura de `maclocal-api` que aún no se ha lanzado, por lo que puede no funcionar con versiones públicas actuales ni con otros runtimes.
- El comportamiento, la calidad, el rendimiento, el uso de memoria, la compatibilidad y el diseño de archivos pueden cambiar sin previo aviso.
- No es una conversión genérica de Transformers; requiere un runtime AFM con soporte nativo para `deepseek_v4` y DSpARK embebido.
- No incluye plantilla de chat Jinja; es necesario usar los scripts de la carpeta `encoding` para codificar mensajes en formato OpenAI-compatible.
- Los idiomas soportados no están documentados en la información disponible.
- Para modelos MLX estables de propósito general, el model card recomienda usar el repositorio `mlx-community` en lugar de este artefacto.
- Esta conversión ha sido realizada por un tercero (`maclocal`) y no por DeepSeek AI, por lo que puede haber diferencias respecto al checkpoint oficial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maclocal/DeepSeek-V4-Flash-0731-AFM-MLX
- Checkpoint oficial de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Reporte técnico: https://arxiv.org/abs/2606.19348
- Repositorio de maclocal-api: https://github.com/scouzi1966/maclocal-api
- Conversión alternativa en Hugging Face: https://huggingface.co/scouzi1966/DeepSeek-V4-Flash-0731-AFM-MLX
