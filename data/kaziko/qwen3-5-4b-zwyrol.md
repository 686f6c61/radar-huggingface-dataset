# Kaziko/Qwen3.5-4B-Zwyrol

## Resumen

Qwen3.5-4B-Zwyrol es una variante modificada del modelo Qwen/Qwen3.5-4B de Alibaba Qwen, publicada por el usuario Kaziko en formato MLX cuantizado a 4 bits. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: todas las modificaciones se realizan mediante edición directa de pesos sobre el checkpoint de 4 bits `mlx-community/Qwen3.5-4B-MLX-4bit`. El objetivo declarado es doble: eliminar la mayor parte de las respuestas de rechazo (uncensoring) y aumentar la frecuencia con la que el modelo invoca herramientas cuando la petición lo requiere.

El modelo conserva la arquitectura, la torre de visión, los embeddings y el resto de matrices del original sin cambios bit a bit. Solo se alteran 29 matrices en las capas 14 a 31 (proyecciones de salida de atención lineal, proyección de salida de atención y `down_proj` del MLP) y una única fila de la capa de salida correspondiente al token `<tool_call>`. El resultado es un modelo multimodal de aproximadamente 5.170 millones de parámetros en safetensors, con licencia Apache 2.0 y orientado a despliegue local en Apple Silicon mediante MLX.

Su relevancia es fundamentalmente metodológica: demuestra que técnicas de edición de pesos (ablación de dirección de rechazo y sondas lineales sobre el estado oculto final) pueden modificar comportamientos concretos sin reentrenar, con un coste medible en conocimiento factual y con resultados verificables sobre conjuntos de prueba en polaco e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con atención lineal híbrida y torre de visión; pesos en MLX |
| Parametros totales | 5.174.964.736 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 4 bits, group size 64 (formato MLX) |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 3,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con torre de visión y capas de atención lineal cuyos parámetros de estado (`A_log`) se preservan en el original. Sobre el checkpoint de 4 bits de `mlx-community` se aplican dos ediciones. La primera sustituye 29 matrices de las capas 14 a 31 (`linear_attn.out_proj`, `self_attn.o_proj`, `mlp.down_proj`) por las equivalentes del modelo bf16 de TheCluster/Qwen3.5-4B-Heretic-MLX, generado con Heretic v1.2.0 por coder3101, recuantizadas a 4 bits con group size 64. Según el autor, cada edición es de rango 1 (al menos el 99,4 % del cambio) y las 29 comparten una única dirección con |cos| ≥ 0,998. No se usó `mlx_lm convert` sobre el modelo Heretic porque descarta la torre de visión y degrada `A_log` a bf16.

La segunda edición desata la capa de salida (`tie_word_embeddings: false`, con copia bit-exacta del embedding de 4 bits) y modifica una sola fila: la del token `<tool_call>` (id 248058, 2.560 pesos). El vector añadido es una sonda lineal sobre el estado oculto final, ajustada con 130 prompts en polaco, que eleva el logit de `<tool_call>` en el punto de decisión y permanece cerca de cero dentro de llamadas a herramientas, tras resultados de herramientas, en respuestas normales y en peticiones sin herramientas. No hubo entrenamiento, RLHF ni DPO: es exclusivamente edición de pesos. La idea del gate sigue el trabajo "Sparks of Weight-Space Programming: LLMs can natively read & write neural network weights".

## Capacidades

- Generación de texto conversacional en polaco e inglés.
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión intacta respecto al original.
- Llamada a herramientas (tool calling / function calling), con umbral de invocación elevado respecto al original de 4 bits.
- Razonamiento multi-paso y uso de agentes, en la medida en que lo soporte el modelo base Qwen3.5-4B.
- Respuestas a peticiones que el modelo original rechaza: solo 4 de 104 prompts dañinos de prueba fueron rechazados, frente a 103 del original.
- Capacidad de respuesta en polaco bajo instrucción explícita ("Odpowiedz po polsku.").
- Modo thinking desactivado en todas las mediciones publicadas (greedy decoding).

## Casos de uso

- Asistente de voz en polaco con herramientas de solo lectura: el gate de tool calling fue ajustado precisamente para un prompt de sistema polaco con seis herramientas (lectura de pantalla, estado del agente, notas), logrando 32/38 preguntas de pantalla con llamada a herramienta frente a 13/38 del original.
- Automatización de agentes locales en Apple Silicon: el modelo cabe en 7,55-7,60 GB de pico de memoria GPU durante el servicio, lo que permite ejecutarlo en un Mac Studio de 32 GB junto con otras cargas.
- Prototipado de pipelines de function calling sin coste de API: al ejecutarse con `mlx_lm.generate`, se integra en scripts locales para probar flujos de herramientas antes de pasar a producción.
- Investigación sobre edición de pesos y ablación de rechazo: el repositorio incluye `ablation.json` y `edit.json` con las listas de matrices y la fila modificada, lo que facilita reproducir o auditar los cambios.
- Evaluación de robustez de filtros de seguridad: al reducir los rechazos de 103/104 a 4/104, sirve para medir cómo se comportan las capas de filtrado de una aplicación ante un modelo permisivo.
- Asistencia multimodal local con imagen y texto: la torre de visión se conserva bit a bit, por lo que puede usarse para describir o razonar sobre capturas de pantalla en un entorno de escritorio.
- Generación de texto en inglés y polaco con contexto conversacional multi-turno, siempre que se respete la ventana de contexto del modelo base (no documentada aquí).

## Benchmarks y rendimiento

Los datos publicados por el autor se obtuvieron con los archivos exactos del repositorio en un Mac Studio (M2 Max, 32 GB), decodificación greedy y thinking desactivado. Las pruebas de herramientas usan un prompt de asistente de voz en polaco con seis herramientas de solo lectura.

| Modelo (4 bits) | Preguntas de pantalla que llaman a herramienta | Herramienta esperada invocada | Llamadas falsas | Primer fragmento de respuesta plana (p50) |
|---|---|---|---|---|
| Original | 13/38 | 23/51 | 0/18 | 177 ms |
| Original + paso forzado de elección de herramienta | 33/38 | 42/51 | 0/18 | 613 ms |
| Solo Heretic (edición 1) | 22/38 | 33/51 | 0/18 | 189 ms |
| Solo gate de herramienta (edición 2 sobre el original) | 31/38 | 40/51 | 0/18 | 206 ms |
| Este modelo (ediciones 1 + 2) | 32/38 | 41/51 | 0/18 | 210 ms |

Conjunto reservado de 90 preguntas, redactado por un agente que no vio el conjunto de prueba y usado tras fijar las ediciones:

| Modelo | Preguntas de pantalla con herramienta | Llamadas falsas |
|---|---|---|
| Original | 12/31 | 0/45 |
| Solo Heretic | 20/31 | 1/45 |
| Este modelo | 25/31 | 1/45 |

Rechazos sobre 104 prompts dañinos de prueba:

| Modelo | Inglés | Con "Odpowiedz po polsku." |
|---|---|---|
| Original 4 bits | 103 | 100 |
| Este modelo | 4 | 0 |

Divergencia KL del primer token respecto al original de 4 bits en 100 prompts inofensivos: 0,067. El gate no añade divergencia medible: 40 de 40 generaciones libres sin herramientas son idénticas con y sin el gate. Memoria GPU pico en servicio: 7,55-7,60 GB (original: 7,19-7,47 GB).

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,55-7,60 GB de pico en servicio según el autor, sobre un Mac Studio M2 Max de 32 GB.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (el autor usa M2 Max de 32 GB); no hay datos publicados para A100, H100 ni RTX 4090, ya que el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo Apple Silicon; no se documenta compatibilidad con GPU NVIDIA o AMD en esta ficha.
- Despliegue: `mlx-lm` (`pip install mlx-lm`, `mlx_lm.generate --model Kaziko/Qwen3.5-4B-Zwyrol --prompt "Cześć!"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: primer fragmento de respuesta plana con p50 de 210 ms (original: 177 ms). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kaziko/Qwen3.5-4B-Zwyrol | 5.174.964.736 | No disponible | Gate ajustado en polaco (41/51 herramienta esperada) | Apache 2.0 | MLX safetensors 4 bits | Sin censura (4/104 rechazos), visión intacta |
| Qwen/Qwen3.5-4B (original) | No disponible en esta ficha | No disponible | 23/51 herramienta esperada | Apache 2.0 | Múltiples | 103/104 rechazos, referencia base |
| TheCluster/Qwen3.5-4B-Heretic-MLX | No disponible | No disponible | 33/51 herramienta esperada | No disponible | MLX | Solo ablación de rechazo, sin gate |
| mlx-community/Qwen3.5-4B-MLX-4bit | No disponible | No disponible | No disponible | No disponible | MLX 4 bits | Checkpoint de partida de las ediciones |

## Limitaciones y advertencias

- La eliminación de rechazos degrada conocimiento factual: 15/18 comprobaciones de hechos pasan frente a 18/18 del original. Ejemplo documentado: a "Ile minut ma doba?" responde "Nie wiem, ile minut ma doba."
- Algunas respuestas a preguntas fuera de pantalla indican que el modelo no puede ver la pantalla, pese a conservar la torre de visión.
- La elección de herramienta sigue siendo el punto débil: 41/51 aciertos en la herramienta esperada.
- El gate se ajustó para un único prompt de sistema polaco y una lista de herramientas concreta; otro prompt puede desplazar el punto de activación y requiere pruebas propias.
- El recuento de rechazos usa la lista de palabras clave de Heretic más palabras clave en polaco, y contabiliza algunos rechazos suaves como respuestas.
- El modelo es explícitamente sin censura: responde a peticiones que el original rechaza. La responsabilidad de filtrado recae en la aplicación que lo integre.
- Solo se declaran idiomas polaco e inglés; el rendimiento en castellano no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones de seguridad de un modelo ablacionado deben evaluarse antes de producción.
- No hay datos publicados de contexto máximo, throughput ni comportamiento en GPU no Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaziko/Qwen3.5-4B-Zwyrol
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint de partida 4 bits: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-4bit
- Modelo Heretic MLX: https://huggingface.co/TheCluster/Qwen3.5-4B-Heretic-MLX
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Referencia metodológica citada: "Sparks of Weight-Space Programming: LLMs can natively read & write neural network weights" (no se proporciona URL en la información disponible)
