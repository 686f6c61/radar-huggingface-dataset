# Avicennasis/MiniCPM-V-4.7-35B-A3B-abliterated-MLX-4bit

## Resumen

MiniCPM-V-4.7-35B-A3B-abliterated-MLX-4bit es una cuantizacion en 4 bits para Apple Silicon (formato MLX) de una version "abliterated" del modelo vision-lenguaje MiniCPM-V-4.7-35B-A3B. Lo publica el usuario Avicennasis y se apoya en dos modelos base: el original de openbmb (Apache-2.0) y una variante ya ablacionada de swdq. El objetivo es ofrecer, en hardware Apple, un VLM multimodal de gran tamano con la alineacion de seguridad debilitada de forma deliberada, de modo que deje de rechazar peticiones que el modelo original denegaria.

El modelo es un MoE (mixture of experts) de aproximadamente 35.200 millones de parametros totales, con la nomenclatura "A3B" indicando unos 3.000 millones de parametros activos por token. Conserva la torre de vision, los embeddings, las cabezas y las capas de atencion lineal en bf16, mientras que el resto se cuantiza a 4 bits con tamano de grupo 64. El repositorio ocupa unos 23,5 GB repartidos en 5 shards.

Su relevancia actual es doble: por un lado es la primera compilacion MLX de un MiniCPM-V-4.7 ablacionado, lo que permite ejecutar un VLM MoE de 35B en Macs con 32-64 GB de memoria unificada; por otro, documenta de forma medible el efecto de la ablacion sobre los rechazos y sobre capacidades clave como el uso de herramientas (tool calling). El autor declara que no hay regresiones estadisticamente significativas en las pruebas que realizo. Se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con mezcla de expertos (MoE) y capas de atencion lineal |
| Parametros totales | 35.212.875.824 (unos 35,2 mil millones) |
| Parametros activos | No disponible de forma explicita; la nomenclatura "A3B" sugiere en torno a 3.000 millones activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 4-bit affine, group size 64; torre de vision, embeddings, cabezas y atencion lineal en bf16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX), 5 shards, ~23,5 GB en total |

## Arquitectura y entrenamiento

El modelo deriva de MiniCPM-V-4.7-35B-A3B, un modelo de lenguaje y vision con arquitectura MoE. La model card menciona explicitamente que las capas de atencion lineal se mantienen en bf16 tras la cuantizacion, lo que indica que el diseno combina atencion lineal con mecanismos de mezcla de expertos. La torre de vision, los embeddings y las cabezas tambien permanecen en bf16 para preservar la calidad de la representacion visual. La cuantizacion es MLX 4-bit affine con group size 64, aplicada con `mlx_vlm` en el commit `e928101a`, replicando la receta usada por la version 4-bit no ablacionada de mlx-community.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para el modelo base en la documentacion proporcionada. Lo que si se documenta es el proceso de ablacion: la variante intermedia de swdq se genero con un LoRA steering llamado "abliterix" que incluye las capas `down_proj` de los expertos MoE, seleccionado mediante un barrido de Optuna (trial 28 de 40). La ablacion modifica unicamente el modelo de lenguaje; la vision no se altera. El autor reporta una divergencia KL de 0,101 frente al modelo base en prompts inofensivos, lo que cuantifica la deriva introducida por el proceso.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes (image-text-to-text): capturas de pantalla, graficos y documentos.
- Tool calling / function calling: el autor reporta 248 de 280 casos de estilo BFCL resueltos correctamente (0,886) en modo greedy y con thinking desactivado.
- Soporte de agentes: las pruebas de tool calling se mantienen intactas tras la ablacion, lo que respalda flujos agenticos.
- Modo thinking opcional, controlable mediante el campo `enable_thinking` a nivel de cuerpo de la peticion (o mediante `chat_template_kwargs`).
- Multilingue limitado a ingles y chino.
- Capacidades de red teaming y generacion de contenido sensible: la ablacion de rechazos hace que el modelo responda a peticiones que el modelo base denegaria.

## Casos de uso

- Red teaming y evaluacion de seguridad: permite medir la robustez de filtros y detectores comparando las respuestas del modelo ablacionado con las del base, usando el propio modelo como fuente de contenido adversario controlado.
- Investigacion sobre alineacion y mecanismos de rechazo: al eliminar la direccion de rechazo mediante LoRA steering, sirve para estudiar como se codifica la negativa en un VLM con MoE y capas de atencion lineal.
- Procesamiento local de documentos con imagenes: analiza capturas, diagramas y tablas sin enviar datos a la nube, aprovechando la torre de vision y la ejecucion offline en Apple Silicon.
- Agentes con uso de herramientas en escritorio: su buen rendimiento en tool calling permite integrarlo en asistentes locales que encadenan llamadas a APIs o scripts en varios pasos.
- Automatizacion de tareas de vision en macOS: clasificacion, extraccion de texto o descripcion de imagenes dentro de aplicaciones nativas, usando el servidor MLX con `mlx_vlm.server`.
- Generacion de codigo asistida en local: aunque no hay benchmarks de codigo en la informacion disponible, el soporte de tool calling y el contexto multimodal lo hacen util para flujos que combinan capturas de pantalla y edicion de codigo.
- Creacion de contenido sin restricciones de estilo: para proyectos creativos, de ficcion o de escritura donde el modelo base aplicaria rechazos, el modelo ofrece respuestas menos filtradas (con los riesgos legales y eticos asociados).
- Prototipado de sistemas multimodales en Mac: sirve como banco de pruebas de un VLM MoE de 35B en hardware de consumo antes de escalar a despliegues mayores.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor y de la model card del proyecto upstream. No son verificaciones independientes.

| Prueba | Base 4-bit | Este modelo |
|---|---|---|
| Tool calls, 280 casos estilo BFCL (greedy, thinking off) | 247/280 = 0,879 | 248/280 = 0,886 |
| Suite de vision, 30 casos (pantallas, graficos, documentos), scoring exacto | 28/30 | 26/30 |
| Escritura, 24 casos, jueces a ciegas (posicion consistente) | mejor 8 / humano 8 / wrapped 0,33 | mejor 3 / humano 7 / wrapped 0,42 (13 empates) |
| Controles de red team v2 (deben responder) | 8/8 cumplen | 8/8 cumplen |
| Rechazos dual-use | 8/18 | 0/18 |
| Rechazos sensibles | 15/16 | 0/16 |
| Rechazos de ficcion | 2/8 | 0/8 |
| Corte legacy-21 | 0/5 · 4/9 · 7/7 | 0/5 · 0/9 · 0/7 |

Datos adicionales citados del proyecto upstream (100 prompts daninos con detector por palabras clave): de 100/100 se pasa a 5/100, con una divergencia KL de 0,101 frente al base en prompts inofensivos.

El autor indica que no hay regresion estadisticamente significativa en ninguna prueba, aunque las estimaciones puntuales apuntan ligeramente a la baja en dos de las tres (vision y escritura, con p en torno a 0,15 para la diferencia en escritura). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: unos 24 GiB en pico con imagenes, segun el autor.
- Memoria minima recomendada: 32 GB de memoria unificada en Macs; 64 GB para trabajar con holgura.
- GPU compatibles: exclusivamente Apple Silicon (serie M) mediante MLX. No hay soporte CUDA documentado.
- Cabe en GPU de consumo: si, en Macs con 32 GB o mas de memoria unificada; no esta pensado para GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-vlm` version 0.7.8 o superior (necesaria para el soporte de `minicpmv4_7`), mediante `python -m mlx_vlm.server` o `python -m mlx_vlm.generate`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

Ejemplo de servicio indicado por el autor:

```bash
pip install mlx-vlm
python -m mlx_vlm.server --model MiniCPM-V-4.7-35B-A3B-abliterated-MLX-4bit --port 8131
```

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Avicennasis) | ~35,2B (MoE) | MLX 4-bit, group size 64 | No disponible | Apache-2.0 | MLX para Apple Silicon |
| openbmb/MiniCPM-V-4.7-35B-A3B | ~35,2B (MoE) | bf16 (base) | No disponible | Apache-2.0 | Original, sin ablacion |
| swdq/MiniCPM-V-4.7-35B-A3B-abliterated | ~35,2B (MoE) | bf16 | No disponible | Apache-2.0 | Ablacionado, sin cuantizar |
| mlx-community/MiniCPM-V-4.7-35B-A3B-4bit | ~35,2B (MoE) | MLX 4-bit | No disponible | Apache-2.0 | MLX, sin ablacion |

La diferencia principal frente a las alternativas es la combinacion de ablacion de rechazos con cuantizacion MLX 4-bit para Apple Silicon. La version de mlx-community mantiene la alineacion original pero comparte la misma receta de cuantizacion; las versiones bf16 (openbmb y swdq) ofrecen mas precision a costa de mayor memoria. No se dispone de datos de benchmarks estandar para comparar el rendimiento bruto entre estas variantes.

## Limitaciones y advertencias

- La alineacion de seguridad esta debilitada de forma intencionada: el modelo producira contenido danino, ofensivo o ilegal si se le solicita. El propio autor lo advierte y responsabiliza al usuario.
- La ablacion introduce una deriva medible (divergencia KL de 0,101) que puede degradar ligeramente la coherencia en tareas benignas, aunque el autor no la considera estadisticamente significativa.
- Riesgo de alucinacion: no hay datos especificos en la informacion disponible, pero es un riesgo habitual en modelos de este tipo y debe asumirse en produccion.
- La suite de vision baja de 28/30 a 26/30 en la prueba del autor, lo que sugiere una posible perdida de precision en tareas visuales, aunque dentro del margen que el autor considera ruido.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano, por lo que el rendimiento en espanol no esta garantizado.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con conversaciones muy largas.
- Compatibilidad restringida a Apple Silicon con MLX y `mlx-vlm` >= 0.7.8; no hay soporte para CUDA, vLLM, llama.cpp, Ollama o TGI.
- Requiere al menos 32 GB de memoria unificada, lo que excluye a la mayoria de Macs de gama base.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe cumplir la legislacion aplicable y asumir la responsabilidad por el contenido generado.
- Las cifras de red team y de capacidades provienen del propio autor; no hay verificacion independiente.
- El modelo base esta fechado en 2026 segun los metadatos; conviene confirmar la disponibilidad y vigencia de las versiones originales antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/MiniCPM-V-4.7-35B-A3B-abliterated-MLX-4bit
- Modelo base original: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Version ablacionada intermedia: https://huggingface.co/swdq/MiniCPM-V-4.7-35B-A3B-abliterated
- Version MLX 4-bit sin ablacion: https://huggingface.co/mlx-community/MiniCPM-V-4.7-35B-A3B-4bit
- Repositorio de evaluaciones y scripts: https://github.com/Avicennasis/model-evals
- Radar de modelos ablacionados y sin censura: https://modelheretic.com/
