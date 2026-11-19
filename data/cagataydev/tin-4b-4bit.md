# cagataydev/tin-4b-4bit

## Resumen

Tin 4B · MLX 4-bit es una cuantización de 4 bits del modelo `cagataydev/tin-4b`, un ajuste fino de Qwen3.5-4B especializado en Tin, un lenguaje de programación tipado en el que los agentes y las herramientas forman parte de la propia sintaxis. Lo desarrolla Çağatay Çalı (cagataydev) y está pensado para ejecutarse en dispositivo (on-device), concretamente en hardware Apple mediante la librería MLX. El modelo resuelve un problema muy concreto: escribir, depurar y ejecutar programas Tin dentro de un bucle de agente con verificación y corrección automática usando las herramientas `tin_check` y `tin_run`.

El modelo parte de `cagataydev/loopl-4b`, a su vez derivado de Qwen3.5-4B, y conserva la modalidad image-text-to-text del pipeline original, aunque su especialización declarada es la generación de código Tin y el razonamiento agéntico de varios pasos. Cuenta con 4.539.265.536 parámetros totales y un repositorio de 3,1 GB en formato safetensors cuantizado a 4 bits. Su relevancia actual radica en que demuestra que un modelo de 4B puede alcanzar una tasa de corrección de errores de compilación del 97,2 % en un lenguaje específico de dominio, algo viable para despliegue local en portátiles Apple.

La licencia es Apache-2.0, heredada de Qwen3.5, lo que facilita su uso comercial y su integración en herramientas de desarrollo. Los idiomas declarados son inglés y turco. La información pública sobre benchmarks generales es escasa: la model card solo reporta evaluaciones específicas del lenguaje Tin, no métricas estándar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles de atención no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (esta variante); pesos bf16 en el modelo base `cagataydev/tin-4b` |
| Idiomas soportados | en, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de Qwen3.5-4B, ajustado primero como `cagataydev/loopl-4b` y posteriormente afinado como `cagataydev/tin-4b` para especializarse en el lenguaje Tin. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La especialización se orienta a tres tareas: escribir programas Tin que compilen y produzcan la salida esperada, corregir programas a partir de los errores del compilador y operar un bucle de agente con verificación y corrección usando las herramientas `tin_check` y `tin_run`.

La innovación destacable no está en la arquitectura, sino en el enfoque: el modelo está entrenado contra el compilador real de Tin como juez, de modo que las métricas de la model card se miden con el compilador auténtico sobre un conjunto reservado. Esta variante de 4 bits está empaquetada para MLX, lo que permite inferencia local en silicio Apple con pesos safetensors cuantizados.

## Capacidades

- Generación de código en Tin, un lenguaje tipado con agentes y herramientas integrados en la sintaxis.
- Corrección automática de programas a partir de los mensajes de error del compilador de Tin.
- Bucle de agente de varios pasos con verificación y ejecución mediante `tin_check` y `tin_run`.
- Soporte de tool calling y function calling, incluidas funciones de herramienta con guardas (por ejemplo, `deleteFile`).
- Capacidad image-text-to-text heredada del pipeline de Qwen3.5, según declara la etiqueta del modelo.
- Conversación multi-turno.
- Capacidades multilingües limitadas a inglés y turco según la model card.

## Casos de uso

- Generación de programas Tin en el editor: el modelo escribe código que compila y produce la salida esperada en el primer intento en el 68,3 % de los casos, útil como asistente integrado en el flujo de desarrollo de Tin.
- Corrección automática de errores de compilación: con una tasa de acierto del 97,2 % al arreglar programas a partir de los errores del compilador, encaja en un pipeline que repara código roto antes de commitear.
- Resolución de errores encadenados: la puntuación de 93,9 % en corrección de bugs apilados lo hace adecuado para depurar programas con varios fallos simultáneos.
- Agentes autónomos de desarrollo: el bucle de agente nativo (65 % de éxito) permite construir asistentes que escriben, verifican y ejecutan código Tin de forma iterativa sin intervención humana.
- Herramientas de línea de comandos con tool calling: el modelo puede invocar funciones de herramienta con guardas, útil para automatizar tareas de sistema con validación previa.
- Despliegue local en portátiles Apple: al estar en formato MLX 4-bit con 3,1 GB de pesos, permite ejecutar el asistente de código sin conexión ni GPU dedicada.
- Prototipado de agentes en Tin: sirve como modelo de referencia para probar el runtime de Tin y el bucle check-and-fix en entornos de desarrollo.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos como porcentaje de acierto sobre un conjunto reservado y evaluados con el compilador real de Tin:

| Prueba | Tin 4B | Qwen3.5 4B |
|---|---:|---:|
| Dice que es Tin | 100 | 60,4 |
| Conocimiento de Tin | 76,1 | 39,4 |
| Escribe Tin | 68,3 | 3,5 |
| Corrige Tin | 97,2 | 80,4 |
| Corrige bugs apilados | 93,9 | 37,8 |
| Bucle de agente nativo | 65 | 15 |

Comparativa interna entre tamaños de la familia Tin:

| Tamaño | Escribe Tin | Corrige Tin | Bucle de agente |
|---|---:|---:|---:|
| 0.8B | 37,5 | 88,8 | 32,5 |
| 2B | 54,1 | 92,5 | 55 |
| 4B | 68,3 | 97,2 | 65 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,1 GB en 4 bits, por lo que se necesita aproximadamente esa cantidad de memoria unificada más el overhead del runtime.
- GPU recomendadas: hardware Apple con memoria unificada; el modelo está empaquetado para MLX, no para CUDA.
- Cabe en consumer hardware: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada, dado el tamaño de 3,1 GB de pesos.
- Opciones de despliegue: `mlx-lm` (inferencia directa), la CLI de Tin (`tin model pull tin:4b`) y el runtime de agentes de Tin. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Tin 4B (este) | 4.539 M | no disponible | Código Tin y agentes | Apache-2.0 | MLX safetensors 4-bit |
| Qwen3.5 4B | ~4B (no confirmado) | no disponible | Propósito general | Apache-2.0 (según la card) | safetensors |
| Tin 2B | no disponible | no disponible | Código Tin y agentes | Apache-2.0 | MLX safetensors 4-bit |
| Tin 0.8B | no disponible | no disponible | Código Tin y agentes | Apache-2.0 | MLX safetensors 4-bit |

Frente a Qwen3.5 4B, el modelo especializado multiplica por casi 20 la capacidad de escribir Tin (68,3 frente a 3,5) y por más de 4 el bucle de agente nativo (65 frente a 15), a costa de perder generalidad fuera del dominio Tin. Frente a los tamaños menores de la propia familia, el 4B es el que mejor escribe Tin y mejor opera el bucle de agente, mientras que el 0.8B corrige peor y el 2B queda en un punto intermedio.

## Limitaciones y advertencias

- Alrededor del 32 % de los primeros intentos fallan `tin check` o imprimen un resultado incorrecto, por lo que es obligatorio ejecutar siempre el compilador.
- El conocimiento de Tin corresponde al commit de entrenamiento; las funciones estándar más recientes pueden faltar.
- Al ser un modelo pequeño, detalles como nombres de flags y códigos de error suelen ser incorrectos.
- Riesgo de alucinación en APIs y funciones de la biblioteca estándar no vistas durante el entrenamiento.
- Idiomas limitados a inglés y turco; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que impide planificar conversaciones o ficheros de gran tamaño con garantías.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar las obligaciones de atribución heredadas de Qwen3.5.
- El formato MLX limita el despliegue a hardware Apple; no hay pesos GGUF ni compatibilidad declarada con CUDA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cagataydev/tin-4b-4bit
- Modelo base bf16: https://huggingface.co/cagataydev/tin-4b
- Modelo previo (loopl-4b): https://huggingface.co/cagataydev/loopl-4b
- Variante 2B: https://huggingface.co/cagataydev/tin-2b-v3-4bit
- Variante 0.8B: https://huggingface.co/cagataydev/tin-0.8b-4bit
- Sitio del lenguaje Tin: https://tin.ad
- Script de instalación: https://tin.ad/install.sh
- Perfil del autor en GitHub: https://github.com/cagataycali
