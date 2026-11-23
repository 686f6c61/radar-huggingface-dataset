# rao-studios/Qwen2.5-Coder-14B-Instruct-mlx-4bit

## Resumen

`rao-studios/Qwen2.5-Coder-14B-Instruct-mlx-4bit` es un espejo (mirror) del repositorio `mlx-community/Qwen2.5-Coder-14B-Instruct-4bit`, fijado al commit `29efdbab55a161237ab1e432a3abaf6c7ae2b477`. No se ha recuantizado ni modificado ningún peso: los safetensors, el tokenizer, la plantilla de chat y la configuración son idénticos byte a byte al repositorio original. El autor (rao-studios) solo añade esta model card y una copia literal de la licencia Apache 2.0.

El modelo subyacente es Qwen2.5-Coder-14B-Instruct, desarrollado por el equipo Qwen de Alibaba, un transformer denso de tipo `qwen2` con 48 capas y 14.770.033.664 parámetros, especializado en generación y edición de código. Esta versión concreta está convertida al formato MLX de Apple con cuantización de 4 bits (group size 64), lo que reduce el peso a 8,3 GB en safetensors y permite ejecutarlo en Macs con memoria unificada relativamente modesta.

La relevancia de este repositorio es logística más que técnica: existe para que la aplicación Craft (un IDE de código que corre localmente en macOS) descargue siempre los mismos bytes desde un repositorio controlado por Rao Studios, fijado a un commit concreto. Para el resto de la comunidad, es una vía cómoda de obtener el modelo Qwen2.5-Coder-14B-Instruct en formato MLX 4-bit listo para usar con `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen2` (transformer denso, 48 capas) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4 bits, group size 64 (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 2 shards, 1.255 tensores, 8,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso estándar de la familia Qwen2, con 48 capas y 14,77 mil millones de parámetros. Esta variante concreta no aporta cambios arquitectónicos: es la conversión a MLX con cuantización de 4 bits (group size 64) del checkpoint oficial `Qwen/Qwen2.5-Coder-14B-Instruct`. El proceso de cuantización lo realizó `mlx-community`; rao-studios únicamente replica los ficheros sin recuantizar.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación en el modelo original de Qwen. La model card del espejo tampoco los incluye. La innovación técnica destacable de este repositorio es el propio pipeline de verificación: cada fichero se validó contra el SHA-256 registrado por el Hub en el commit original, se comprobó que todos los pesos son safetensors con dtypes conocidos y tensores que cubren el fichero exactamente, y se confirmó la ausencia de `auto_map` (código remoto) en `config.json` y en `tokenizer_config.json`.

## Capacidades

- Generación de texto y código: modelo especializado en tareas de programación (completado, generación, explicación y refactorización).
- Edición de ficheros mediante tool calling: la plantilla de chat implementa el formato Hermes JSON, con los esquemas de cada herramienta dentro de `<tools>` y respuestas con un objeto JSON por llamada dentro de `<tool_call>`.
- Soporte de function calling estructurado, ejemplificado en la model card con una llamada `edit_file` que recibe `path`, `old_string` y `new_string`.
- Razonamiento multi-paso orientado a agentes: la propia aplicación Craft lo usa como planificador que encadena hasta quince agentes especializados (proyecto, diseño, cliente tipado, mocks, navegación, tests, capturas).
- Conversación multi-turno con contexto de 32.768 tokens.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en esta variante.

## Casos de uso

- Asistencia de código en local en macOS: con 8,3 GB de pesos en 4 bits, el modelo cabe en un Mac con 24 GB de memoria unificada, lo que permite autocompletado y generación en el propio portátil sin enviar código a la nube.
- Edición automática de ficheros en un IDE: gracias al tool calling en formato Hermes JSON, el modelo puede emitir llamadas `edit_file` con `old_string`/`new_string`, integrándose en flujos de parcheo quirúrgico sobre el árbol de fuentes.
- Construcción de aplicaciones por agentes: la model card describe su uso en Craft para generar una app de iPhone completa desde una carpeta vacía en un solo turno, planificando y encadenando agentes de proyecto, diseño, cliente, mocks, navegación, tests y capturas.
- Generación de tests automatizados: el modelo puede escribir suites de pruebas a partir del código existente y del contexto del proyecto, adecuado por su especialización en código y su ventana de 32k tokens.
- Refactorización de módulos con contexto amplio: la ventana de 32.768 tokens permite cargar varios ficheros relacionados y aplicar cambios coherentes entre ellos.
- Automatización de pipelines de revisión de código: integrable mediante `mlx-lm` en scripts locales que analicen diffs, propongan correcciones y las apliquen con llamadas estructuradas a herramientas.
- Migración de código entre lenguajes o frameworks: la model card lo ejemplifica con una búsqueda binaria en Swift; el modelo puede traducir fragmentos manteniendo la semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que, en la aplicación Craft, una ejecución de referencia construyó una app de iPhone, pasó sus tests y coincidió en las 62 pantallas originales (en modo claro y oscuro), con una calidad equiparable a la de Claude Opus en la misma app. Sin embargo, esas ejecuciones se realizaron con "Qwopus 3.5 122B" sobre un M4 Max con 128 GB, no con este modelo, por lo que no constituyen una medición de rendimiento de este repositorio.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 8,3 GB solo para los pesos en safetensors; en la práctica, con overhead de MLX y caché KV para 32k tokens, conviene disponer de 12-16 GB libres.
- La model card indica que Craft ofrece este modelo para un Mac con 24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada (requisito de MLX). No es ejecutable en CUDA ni en ROCm con esta librería.
- Cabe en equipos consumer de Apple: Macs con 24 GB o más (M-series). No está pensado para GPUs NVIDIA/AMD con MLX.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate --model rao-studios/Qwen2.5-Coder-14B-Instruct-mlx-4bit --prompt "..."`). Para otros backends sería necesario usar el checkpoint original de Qwen o las conversiones GGUF/transformers equivalentes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rao-studios/Qwen2.5-Coder-14B-Instruct-mlx-4bit (este) | 14,77 B | 32.768 | 4 bits MLX | Apache 2.0 | Hugging Face, formato MLX |
| mlx-community/Qwen2.5-Coder-14B-Instruct-4bit | 14,77 B | 32.768 | 4 bits MLX | Apache 2.0 | Hugging Face, formato MLX |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77 B | 32.768 | BF16 (original) | Apache 2.0 | Hugging Face, transformers |

El rendimiento comparado en benchmarks no está disponible en la información proporcionada. Las tres variantes comparten pesos base; las diferencias son de formato y tamaño en disco, no de capacidad.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier limitación del Qwen2.5-Coder-14B-Instruct original aplica íntegramente aquí (sesgos del corpus de entrenamiento, riesgo de alucinación en APIs o librerías poco comunes, posible generación de código inseguro).
- Dependencia de MLX: solo se ejecuta en Apple Silicon; no es portable a CUDA, ROCm ni CPU convencional sin reconversión.
- La cuantización a 4 bits puede degradar ligeramente la calidad frente al checkpoint BF16 original, especialmente en tareas de razonamiento complejo o contextos muy largos.
- Idiomas soportados no documentados en esta ficha; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar los avisos de copyright y la licencia originales al redistribuir.
- La model card está redactada por el autor del espejo y promociona la aplicación Craft; los datos de rendimiento que menciona corresponden a otro modelo y otro hardware, por lo que no deben tomarse como validación de este repositorio.
- El repositorio se fija a un commit concreto del upstream; si `mlx-community` actualiza su versión, este espejo no incorporará los cambios automáticamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rao-studios/Qwen2.5-Coder-14B-Instruct-mlx-4bit
- Modelo base en MLX: https://huggingface.co/mlx-community/Qwen2.5-Coder-14B-Instruct-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Aplicación Craft: https://craft.rao.nyc
