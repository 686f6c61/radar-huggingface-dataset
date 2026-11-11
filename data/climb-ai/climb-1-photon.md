# Climb-Ai/Climb-1-Photon

## Resumen

Climb 1 Photon es un modelo de lenguaje de 0,75 mil millones de parámetros (752.393.024 según los pesos en safetensors) desarrollado por Climb-Ai, especializado en actuar como copiloto de terminal Linux y Bash. Se construye mediante un ajuste fino sobre `RikiyaT/Qwen3.5-0.8B-weight-space-programming`, una variante del modelo Qwen 3.5 de 0,8B a la que se le ha aplicado la técnica Weight-Space Programming (WSP). El modelo está alineado para convertir lenguaje natural o consultas con el prefijo `?? <tarea>` en one-liners POSIX de bash válidos, sin relleno conversacional.

La propuesta de valor es la precisión y la seguridad en la generación de comandos de shell: según la model card, el ajuste eleva la validez sintáctica medida con ShellCheck del 3,3 % al 86,7 % y la precisión de ejecución del 2,5 % al 40 % en un benchmark propio de 40 tareas fuera de distribución. Además, elimina por completo las fugas de etiquetas `<think>` (de 40/40 a 0/40) y logra una tasa de rechazo del 100 % ante comandos destructivos.

Es relevante por su tamaño reducido, que permite desplegarlo en hardware modesto y con baja latencia, y por su enfoque en un dominio vertical concreto (CLI) donde los modelos generalistas suelen producir comandos sintácticamente incorrectos o peligrosos. Mantiene además capacidad de diálogo natural en inglés y ruso. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones habituales de la familia Qwen) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen 3.5, en su variante de 0,8B parámetros, heredado de `RikiyaT/Qwen3.5-0.8B-weight-space-programming`. Sobre esa base se aplicó un ajuste fino supervisado orientado a tareas de terminal, presumiblemente con ejemplos de pares instrucción-comando. La model card menciona el uso de Unsloth (tag `unsloth`) en el proceso de entrenamiento, aunque no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable es la conservación del parche anti-bucle de Astra WSP: las capas 15 y 19 se congelaron estrictamente durante el ajuste fino para preservar el atractor que evita que el modelo entre en ciclos infinitos de tokens. El modelo está alineado para operar en modo zero-CoT, es decir, sin emitir etiquetas `<think>` internas en la salida, algo que la model card reporta como corregido por completo respecto al modelo base. También se describe un modo dual: terminal/CLI y conversacional.

## Capacidades

- Generación de comandos de shell POSIX en una sola línea a partir de lenguaje natural o del prefijo `?? <tarea>`.
- Uso de utilidades habituales de Linux: `find`, `awk`, `sed`, `git`, `docker`, `systemctl`, `journalctl`, entre otras.
- Rechazo de comandos destructivos (`rm -rf /`, borrado de dispositivos de bloque) con una tasa reportada del 100 %.
- Modo conversacional directo y factual, sin relleno adulador, en inglés y ruso.
- Operación zero-CoT: no filtra etiquetas `<think>` a la salida.
- Soporte de plantilla de chat ChatML con parámetro `enable_thinking=False`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Asistente de terminal interactivo: el modelo traduce instrucciones como "mata el proceso que escucha en el puerto 8080" a `fuser -k 8080/tcp`, integrándose en un shell o en una CLI propia con latencia muy baja gracias a su tamaño de 0,8B.
- Automatización de tareas de administración de sistemas: generación de pipelines con `systemctl` y `journalctl` para diagnóstico de servicios, adecuado por su alineación específica con estas herramientas.
- Integración en editores y plugins de terminal (VS Code, Neovim): sugerencias de comandos en línea mientras el usuario escribe, gracias a la generación de una sola línea y a la ausencia de razonamiento visible.
- Filtro de seguridad en pipelines de ejecución de comandos: uso del modelo como capa de rechazo previa a la ejecución de comandos generados por otros sistemas, aprovechando su tasa de rechazo del 100 % ante operaciones destructivas.
- Asistencia en contenedores y DevOps: generación de comandos `docker` para inspección, limpieza y gestión de imágenes y contenedores en flujos de trabajo de CI/CD.
- Copiloto local y offline: despliegue en estaciones de trabajo o entornos air-gapped donde no se permite enviar comandos a servicios en la nube, gracias a su reducido tamaño y licencia Apache 2.0.
- Soporte bilingüe en inglés y ruso para equipos de operaciones con documentación en ambos idiomas.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre un benchmark propio de 40 tareas fuera de distribución:

| Metrica | Modelo base (Qwen 3.5 0.8B WSP) | Climb 1 Photon | Delta |
|---|---|---|---|
| Bash valido segun ShellCheck | 3,3 % | 86,7 % | +83,4 % |
| Precision de ejecucion | 2,5 % | 40,0 % | +37,5 % |
| Rechazo de comandos destructivos | parcial | 100,0 % | seguro |
| Fugas de etiqueta `<think>` en ChatML | 40/40 (100 %) | 0/40 (0 %) | salida limpia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 1,5 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 0,8 GB; en 4 bits, alrededor de 0,4-0,5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 funcionan sin problema. Para despliegue por lotes de alta concurrencia, A100 o H100 aportan mayor throughput.
- Cabe holgadamente en GPU consumer e incluso en CPU con llama.cpp u Ollama en cuantización 4 bits.
- Opciones de despliegue: Transformers (ejemplo oficial en la model card), vLLM, llama.cpp, Ollama y TGI son opciones plausibles dada la familia del modelo, aunque el autor solo documenta Transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño de 0,8B se espera una latencia de decodificación de decenas de milisegundos por token en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Climb 1 Photon | 752 M | no disponible | CLI/Bash Linux | Apache 2.0 | Hugging Face |
| Qwen 3.5 0.8B WSP (base) | ~0,8 B | no disponible | Texto general con WSP | no disponible | Hugging Face |
| Modelos generalistas de ~1B (p. ej. Qwen, Llama de gama baja) | ~1 B | variable | Texto general | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada; la única comparación publicada es contra su propio modelo base.

## Limitaciones y advertencias

- El benchmark de validación es propio, pequeño (40 tareas) y fuera de distribución; los resultados pueden no generalizar a otros entornos o distribuciones de shell.
- La precisión de ejecución reportada es del 40 %, lo que implica que una mayoría de comandos generados no se ejecutan correctamente tal cual; requiere supervisión humana.
- Solo soporta inglés y ruso de forma declarada; el rendimiento en castellano no está documentado.
- No se documentan sesgos conocidos, pero al ser un ajuste sobre un modelo base pequeño, puede heredar sesgos de los datos de preentrenamiento de Qwen 3.5.
- Riesgo de alucinación en comandos y rutas: aunque la sintaxis sea válida, los nombres de ficheros, servicios o flags pueden ser inventados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia que conviene verificar antes de producción.
- El congelamiento de las capas 15 y 19 puede limitar la adaptación a dominios muy distintos del CLI.
- No hay información sobre longitud de contexto ni sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez fuera del dominio de terminal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Climb-Ai/Climb-1-Photon
- Modelo base: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) sobre este modelo.
