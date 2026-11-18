# netprojects/Qwen3.8-27B-opencode-MLX-bf16

## Resumen

Qwen3.8-27B-opencode-MLX-bf16 es una conversión a formato MLX, en precisión bf16, del modelo Qwen3.8-27B de Alibaba Qwen con el adaptador LoRA de harness-hub fusionado. El adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO sobre TRL) para convertir al modelo en el motor del agente de programación OpenCode, especializado en tareas de ingeniería de software y de terminal. Esta build conserva el codificador de visión y la capa de predicción multi-token (MTP) originales de Qwen, de modo que mantiene capacidades imagen-texto además de generación de texto.

El modelo resuelve un problema concreto: un modelo generalista de 27.781 millones de parámetros no está optimizado para bucles agénticos de edición de código y ejecución de comandos. El ajuste por RL incrementa los resultados publicados por el autor del adaptador en SWE-bench Pro (hard 51) del 35,3% al 51,0% y en Terminal-Bench 2.1 del 46,4% al 52,4% respecto al modelo base, y con el modo de razonamiento desactivado iguala al modelo base con su esfuerzo de pensamiento máximo generando aproximadamente una sexta parte de los tokens.

La relevancia de esta build es de infraestructura: es la referencia de fidelidad de una familia de cuantizaciones MLX (4, 6 y 8 bits) pensadas para Apple Silicon, y la única que conserva los pesos sin pérdida de cuantización. Su tamaño de 55,6 GB la limita a equipos con memoria unificada amplia, pero sirve como patrón de comparación para medir la degradación de las variantes comprimidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa en 16 capas y capas Gated DeltaNet, más codificador de visión y capa MTP (multi-token prediction); pesos en MLX |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en esta build; la familia incluye variantes 4-bit (16,3 GB), 6-bit (23,1 GB) y 8-bit (30,0 GB), además de un adaptador LoRA suelto de 638 MB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (mlx-vlm), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de 27,78 mil millones de parámetros que combina 16 capas de atención completa con capas Gated DeltaNet, e incorpora un codificador de visión (pipeline image-text-to-text) y una capa de predicción multi-token. Sobre esa base, harness-hub entrenó un LoRA con aprendizaje por refuerzo mediante AsyncGRPO en TRL, orientado a tareas de ingeniería de software y de terminal dentro del agente OpenCode. La fusión afecta a 256 módulos adaptados: q, k, v y o en las 16 capas de atención completa, y gate, up y down en las 64 capas totales, calculados como W + 2,0 · B @ A redondeado a bf16. El adaptador no modifica el codificador de visión ni las capas Gated DeltaNet, y todos los demás tensores son idénticos byte a byte a Qwen3.8-27B.

La innovación técnica destacable es la conservación de la capa MTP original de Qwen, cuantizada de forma coherente con la build, que mlx-vlm puede usar como modelo borrador integrado para decodificación especulativa pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y el mismo formato XML de llamadas a herramientas que Qwen3.8-27B. El autor del adaptador entrenó y evaluó con el modo de pensamiento desactivado, por lo que se recomienda mantenerlo así.

## Capacidades

- Generación de texto y razonamiento general, con modo de pensamiento (thinking) activable o desactivable mediante la plantilla de chat.
- Generación y edición de código, con especialización en tareas de ingeniería de software medidas en SWE-bench Pro.
- Ejecución de tareas de terminal y línea de comandos, evaluada en Terminal-Bench 2.1.
- Comprensión de imágenes y texto (image-text-to-text) mediante el codificador de visión conservado, útil para interpretar capturas de pantalla o salidas de terminal.
- Llamadas a herramientas en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Uso como agente de programación multi-paso dentro de OpenCode.
- Decodificación especulativa con la capa MTP integrada o con el drafter DSpine externo.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de corrección de errores en repositorios: el modelo recibe una instrucción como localizar por qué fallan las pruebas de `tests/test_parser.py`, inspecciona el código, aplica el parche y verifica; es el escenario para el que se entrenó con RL y el que mide SWE-bench Pro.
- Automatización de tareas de terminal: ejecución y encadenamiento de comandos de shell para diagnóstico, instalación o despliegue, con el respaldo de los 52,4% obtenidos en Terminal-Bench 2.1.
- Integración en OpenCode como proveedor local: sirviéndolo con `mlx_lm.server` en el puerto 8000 y declarándolo en `~/.config/opencode/opencode.json` como proveedor compatible con OpenAI, se obtiene un agente de código que no envía datos a la nube.
- Interpretación de capturas de pantalla de terminal o de errores: mediante mlx-vlm se puede pasar una imagen y preguntar qué error muestra la salida, lo que resulta útil para depuración asistida a partir de evidencia visual.
- Asistencia a la refactorización con contexto de repositorio: el modelo puede razonar sobre varios ficheros y proponer cambios coherentes, apoyándose en el modo de pensamiento desactivado para reducir el consumo de tokens en bucles largos.
- Generación de código verificable en pipelines: con tool calling en formato OpenAI, puede conectarse a herramientas de ejecución de pruebas y formateadores dentro de un flujo de CI, revisando resultados intermedios antes de cerrar el cambio.
- Referencia de calidad para evaluar cuantizaciones: al ser la build bf16 sin pérdida, sirve para medir la fidelidad de las variantes 4, 6 y 8 bits (98,7%, 99,2% y 96,7% de coincidencia en el siguiente token, respectivamente) antes de desplegar una versión más ligera.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, con OpenCode y pensamiento desactivado, frente al modelo base:

| Benchmark | Modelo base | Adaptador opencode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de las cuantizaciones respecto a bf16 (coincidencia en el siguiente token y divergencia KL):

| Build | Tamano | Coincidencia con bf16 | KL vs bf16 |
|---|---|---|---|
| 6-bit (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| 8-bit | 30,0 GB | 99,2% | 0,0004 |
| 4-bit | 16,3 GB | 96,7% | 0,0203 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificación medido por el autor en un MacBook Pro M5 Max de 128 GB, greedy, pensamiento desactivado, 5 prompts de 256 tokens (GSM8K, MATH-500, HumanEval, MBPP y MT-Bench), con otros servicios en ejecución y por tanto indicativo:

| Build | Sin MTP | Con MTP (mlx-vlm 0.7.11) |
|---|---|---|
| 4-bit | 33 tok/s | 62 tok/s (×1,91) |
| 6-bit | 20 tok/s | 21 tok/s (×1,04) |
| 8-bit | 17 tok/s | 37 tok/s (×2,15) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas para esta build.

## Requisitos de hardware

- VRAM o memoria unificada: esta build bf16 ocupa 55,6 GB de pesos, por lo que requiere al menos unos 60-64 GB de memoria unificada para inferencia con margen para caché KV; las variantes reducen el requisito a 16,3 GB (4-bit), 23,1 GB (6-bit) y 30,0 GB (8-bit).
- Plataforma: exclusivamente Apple Silicon, ya que los pesos están en formato MLX y la librería es `mlx`; no es desplegable en GPU NVIDIA o AMD sin reconversión.
- GPU recomendadas: no aplica en el sentido convencional; el autor validó en un MacBook Pro M5 Max de 128 GB. Cualquier Mac con memoria unificada suficiente (familias M1 Max/Ultra en adelante con 64 GB o más) puede alojar la build bf16.
- Cabe en GPU de consumo: en el ecosistema Apple, sí en configuraciones de gama alta con 64 GB o más de memoria unificada; las variantes 4 y 6 bits amplían el rango a equipos de 24-32 GB.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 o superior) para texto y servidor compatible con OpenAI; `mlx-vlm` (0.7.11 o superior) para imagen-texto y decodificación especulativa con MTP; integración con OpenCode mediante el proveedor OpenAI-compatible. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: para bf16 no se publican cifras propias; las builds cuantizadas alcanzan 17-33 tok/s sin MTP y hasta 62 tok/s con MTP en el hardware citado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-MLX-bf16 | 27,78 mil millones | no disponible | Agente de código y terminal (OpenCode) | Apache 2.0 | MLX, Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | no disponible | Generalista con visión y MTP | no disponible en la información | Múltiples formatos |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,78 mil millones (LoRA sobre la base) | no disponible | Agente de código y terminal (OpenCode) | no disponible en la información | Adaptador LoRA |
| netprojects/Qwen3.8-27B-opencode-MLX-6bit | 27,78 mil millones | no disponible | Igual, cuantizado a 6 bits | Apache 2.0 | MLX, 23,1 GB |

La comparación de rendimiento entre el adaptador y el modelo base está en la tabla de benchmarks (SWE-bench Pro 51,0% frente a 35,3%; Terminal-Bench 2.1 52,4% frente a 46,4%). No se dispone de datos de benchmarks de modelos de otros fabricantes para establecer comparaciones adicionales.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con el modo de pensamiento desactivado; activarlo puede degradar el comportamiento esperado y aumentar el consumo de tokens.
- La decodificación especulativa con MTP no garantiza reproducibilidad exacta: con greedy, el texto coincide con la decodificación simple hasta un empate cercano, donde la comprobación por lotes puede redondear al otro lado, de modo que las respuestas largas pueden divergir ligeramente.
- La build bf16 exige una cantidad de memoria unificada (55,6 GB de pesos) que excluye a la mayoría de equipos de consumo; para uso práctico el autor recomienda la variante de 6 bits.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon: no hay pesos GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Las mediciones de throughput son indicativas: se tomaron con otros servicios en ejecución en el mismo equipo y con 5 prompts de 256 tokens.
- No se dispone de información sobre sesgos, tasas de alucinación, cobertura idiomática ni longitud de contexto, por lo que no pueden evaluarse riesgos específicos en esos ámbitos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador tienen condiciones propias que deben verificarse en sus respectivas model cards antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Build 6-bit recomendada: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-4bit
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
