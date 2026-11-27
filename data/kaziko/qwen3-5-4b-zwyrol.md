# Kaziko/Qwen3.5-4B-Zwyrol

## Resumen

Qwen3.5-4B-Zwyrol es una variante del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario Kaziko en Hugging Face. Se trata de un build en 4 bits para MLX (el framework de Apple para inferencia en silicio Apple) que aplica dos ediciones directas sobre los pesos, sin ningún tipo de entrenamiento ni ajuste fino. La primera edición elimina el comportamiento de rechazo (abliteración) tomando 29 matrices de un modelo Heretic en bf16 y cuantizándolas a 4 bits; la segunda modifica una única fila de la capa de salida para aumentar la probabilidad de invocar herramientas cuando corresponde.

El modelo conserva la arquitectura original de Qwen3.5-4B, incluyendo la torre de visión y los parámetros de estado de la atención lineal, que permanecen bit a bit idénticos al original. El pipeline declarado es image-text-to-text, por lo que mantiene capacidades multimodales de entrada de imagen. Los idiomas declarados son polaco (pl) e inglés (en), y la licencia es Apache-2.0.

La relevancia de esta ficha radica en que documenta una técnica poco habitual: la edición de pesos en espacio de pesos (weight-space editing) para corregir comportamientos concretos (rechazos y umbral de tool calling) sin reentrenar. Es un caso práctico de cómo un cambio de cuantización degrada una capacidad latente (la invocación de herramientas) y cómo un probe lineal sobre el estado oculto final puede restaurarla. El modelo está pensado para ejecutarse en Apple Silicon con MLX, no para despliegues en GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (incluye atención lineal y torre de visión); no se detalla la composición exacta en la información disponible |
| Parametros totales | 5.174.964.736 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (build MLX) |
| Idiomas soportados | pl (polaco), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se construye sobre el archivo mlx-community/Qwen3.5-4B-MLX-4bit. No hubo entrenamiento: todas las modificaciones son ediciones directas de pesos. La edición 1 (eliminación de rechazos, estilo Heretic) sustituye 29 matrices de las capas 14 a 31 —concretamente `linear_attn.out_proj`, `self_attn.o_proj` y `mlp.down_proj`— por las correspondientes del modelo bf16 de TheCluster/Qwen3.5-4B-Heretic-MLX, cuantizadas a 4 bits con group size 64. Cada edición es de rango 1 (al menos el 99,4 % del cambio) y las 29 comparten una única dirección (|cos| >= 0,998). No se usó una conversión directa con `mlx_lm convert` del modelo Heretic porque esta descarta la torre de visión y degrada `A_log` a bf16; el listado completo está en `ablation.json`.

La edición 2 (tool-call gate) aborda un efecto secundario de la cuantización: el modelo en 4 bits invoca herramientas con mucha menos frecuencia que el modelo en precisión completa. Para corregirlo, se desata la capa de salida (copia bit-exacta del embedding en 4 bits) y se modifica una sola fila: la del token `<tool_call>` (id 248058, 2.560 pesos). El vector añadido es un probe lineal sobre el estado oculto final, ajustado con 130 prompts en polaco; eleva el logit de `<tool_call>` en el punto de decisión y se mantiene cerca de cero dentro de llamadas a herramientas, tras resultados de herramientas y en respuestas normales. El registro está en `edit.json`. El resto de componentes (embeddings, demás matrices, torre de visión, parámetros de estado de atención lineal) son idénticos al original. La idea del gate sigue el trabajo "Sparks of Weight-Space Programming: LLMs can natively read & write neural network weights".

## Capacidades

- Generación de texto conversacional en polaco e inglés.
- Entrada de imagen (pipeline image-text-to-text), conservando la torre de visión original.
- Tool calling / function calling, con un umbral de invocación corregido mediante la edición del logit de `<tool_call>`.
- Razonamiento multi-paso y uso de herramientas en el contexto de un asistente de voz con 6 herramientas de solo lectura (lectura de pantalla, estado del agente, notas).
- Comportamiento "uncensored": responde a peticiones que el modelo original rechaza (4 rechazos de 104 prompts dañinos frente a 103 del original en inglés; 0 de 104 con la instrucción "Odpowiedz po polsku.").
- No se documentan capacidades de audio ni modos de "thinking" explícitos; los benchmarks se ejecutaron con thinking desactivado.

## Casos de uso

- Asistente de voz en polaco con invocación de herramientas: el modelo está ajustado para decidir cuándo llamar a herramientas de lectura de pantalla, estado de agente y notas; en las pruebas invoca herramienta en 32 de 38 preguntas de pantalla, frente a 13 de 38 del original. Adecuado para prototipos de asistente local en Mac.
- Automatización de tareas de escritorio en Apple Silicon: al ejecutarse con MLX y consumir 7,55-7,60 GB de memoria GPU en servicio, cabe en un Mac Studio de 32 GB y permite agentes locales que leen la pantalla y responden.
- Investigación sobre edición de pesos: sirve como caso reproducible de abliteración y de inserción de un probe lineal para corregir un umbral de decisión, con artefactos (`ablation.json`, `edit.json`) que documentan cada cambio.
- Evaluación de robustez de cuantización: permite medir cómo la cuantización a 4 bits altera el comportamiento de tool calling (13/38 frente a 33/38 con elección forzada) y cómo un gate de bajo coste recupera parte de esa capacidad.
- Generación de contenido sin rechazos en entornos controlados: para aplicaciones donde el filtrado se gestiona en la capa de aplicación, el modelo reduce los rechazos de 103 a 4 sobre el conjunto de prueba dañino.
- Prototipado multimodal local: conserva la torre de visión, por lo que puede emplearse en tareas image-text-to-text en local sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los datos provienen de ejecuciones de los archivos exactos en un Mac Studio (M2 Max, 32 GB), decodificación greedy y thinking desactivado. Las pruebas de herramientas usan un prompt de asistente de voz en polaco con 6 herramientas de solo lectura.

| modelo (4-bit) | preguntas de pantalla que llaman a herramienta | herramienta esperada invocada | llamadas falsas | primer fragmento de respuesta (p50) |
|---|---|---|---|---|
| original | 13/38 | 23/51 | 0/18 | 177 ms |
| original + paso forzado de elección de herramienta | 33/38 | 42/51 | 0/18 | 613 ms |
| solo Heretic (edición 1) | 22/38 | 33/51 | 0/18 | 189 ms |
| solo tool gate (edición 2 sobre el original) | 31/38 | 40/51 | 0/18 | 206 ms |
| este modelo (ediciones 1 + 2) | 32/38 | 41/51 | 0/18 | 210 ms |

Conjunto held-out de 90 preguntas (escrito por un agente que no vio el conjunto de prueba): original 12/31 preguntas de pantalla, solo Heretic 20/31, este modelo 25/31; llamadas falsas 0/45, 1/45 y 1/45 respectivamente (la misma pregunta para los dos últimos).

| rechazos, 104 prompts dañinos | inglés | con "Odpowiedz po polsku." |
|---|---|---|
| original 4-bit | 103 | 100 |
| este modelo | 4 | 0 |

Divergencia KL del primer token respecto al original 4-bit en 100 prompts inocuos: 0,067. El tool gate no añade nada medible: 40 de 40 generaciones libres sin herramientas son idénticas con y sin el gate. Pico de memoria GPU en servicio: 7,55-7,60 GB (original: 7,19-7,47 GB).

## Requisitos de hardware

- VRAM/memoria unificada estimada: 7,55-7,60 GB de pico en servicio (medido en M2 Max de 32 GB).
- GPU recomendadas: Apple Silicon con MLX (M2 Max probado); no se proporcionan datos para GPU NVIDIA.
- Cabe en consumer GPU de Apple Silicon con al menos 16 GB de memoria unificada; el repo ocupa 3,7 GB.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate --model Kaziko/Qwen3.5-4B-Zwyrol --prompt "Cześć!"`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: primer fragmento de respuesta p50 de 210 ms en M2 Max; throughput no disponible.

## Comparativa con modelos similares

| modelo | parámetros | contexto | tool calling (preguntas de pantalla) | licencia | formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-Zwyrol | 5.174.964.736 | no disponible | 32/38 | apache-2.0 | MLX 4-bit |
| Qwen3.5-4B original (4-bit) | no disponible | no disponible | 13/38 | apache-2.0 | MLX 4-bit |
| Qwen3.5-4B-Heretic-MLX (solo edición 1) | no disponible | no disponible | 22/38 | no disponible | MLX 4-bit |
| Qwen3.5-4B original + elección forzada de herramienta | no disponible | no disponible | 33/38 (613 ms p50) | apache-2.0 | MLX 4-bit |

No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para comparar con modelos de otros fabricantes.

## Limitaciones y advertencias

- La eliminación de rechazos degrada hechos: 15/18 comprobaciones de hechos pasan (original 18/18). Ejemplo: "Ile minut ma doba?" recibe "Nie wiem, ile minut ma doba."; algunas respuestas a preguntas fuera de pantalla dicen que el modelo no puede ver la pantalla.
- La elección de herramienta sigue siendo el punto débil: 41/51 acierta la herramienta esperada.
- El gate se ajustó para un único system prompt en polaco y una lista de herramientas concreta; otro prompt puede desplazar el punto de activación. Debe probarse con el prompt propio antes de usarlo.
- El recuento de rechazos usa la lista de palabras clave de Heretic (más palabras clave en polaco) y cuenta algunos rechazos suaves como respuestas.
- El modelo es "uncensored": responde a peticiones dañinas; la responsabilidad de uso y del filtrado recae en la aplicación.
- Solo se declaran idiomas pl y en; el rendimiento en otros idiomas no está documentado.
- No hay datos de longitud de contexto ni de throughput; el despliegue documentado es exclusivamente MLX.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los componentes Heretic empleados.

## Enlaces

- Hugging Face: https://huggingface.co/Kaziko/Qwen3.5-4B-Zwyrol
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (p-e-w): https://github.com/p-e-w/heretic
- TheCluster/Qwen3.5-4B-Heretic-MLX: https://huggingface.co/TheCluster/Qwen3.5-4B-Heretic-MLX
- mlx-community/Qwen3.5-4B-MLX-4bit: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-4bit
