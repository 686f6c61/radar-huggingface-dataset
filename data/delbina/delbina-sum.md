# delbina/delbina-sum

## Resumen

delbina-sum es un modelo especializado en compresión de contexto para conversaciones largas y sesiones de agentes, desarrollado por delbina como parte de su capa de compresión de contexto. Se trata de un ajuste fino mediante LoRA (r=16, alpha=32, 2 épocas, adaptador fusionado) sobre Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales. Su función no es la generación de texto general, sino resumir turnos antiguos de una conversación preservando valores concretos (puertos, claves, versiones, fechas, rutas, hosts, responsables, decisiones y marcadores `[[SECRET_n]]`), manteniendo únicamente el valor más reciente y bajo el proyecto correcto, y descartando el ruido de las herramientas.

El modelo resuelve un problema específico de los agentes conversacionales de larga duración: la ventana de contexto se agota y los resúmenes genéricos pierden datos operativos críticos. delbina-sum produce una salida estructurada en dos bloques (hechos y notas de contexto) que puede integrarse en un pipeline de compresión. Es relevante ahora porque ofrece una mejora muy grande en recuperación de hechos frente a su modelo base en un tamaño reducido, desplegable en hardware modesto.

La versión publicada es la primera release y tiene carácter experimental: se ha entrenado y evaluado únicamente con conversaciones sintéticas, no con conversaciones reales. La licencia es Apache 2.0 y el idioma soportado es exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; se recomienda un contexto de al menos 8192 tokens para la evaluacion |
| Tipos de cuantizacion | fp16 (pesos principales), GGUF Q8_0 y Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado y adaptador en `adapter/`), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parámetros, sobre el que se aplica un ajuste LoRA con r=16, alpha=32 y 2 épocas, posteriormente fusionado en los pesos base. El adaptador sin fusionar se distribuye en el directorio `adapter/`. El entrenamiento se realizó sobre 2.000 conversaciones de agente sintéticas generadas con el generador v5 del proyecto, con varios proyectos por chat, hechos enunciados por el usuario, por el asistente o enterrados en la salida de herramientas, valores que cambian o se rechazan posteriormente, resúmenes previos que deben fusionarse, relleno sin valores y marcadores `[[SECRET_n]]`. Los objetivos se construyen a partir de los hechos plantados, por lo que son correctos por construcción y no requieren modelo profesor.

El entrenamiento se ejecutó en 2× T4 (base en fp16, LoRA en fp32), con batch efectivo de 16, learning rate 2e-4 con scheduler coseno, durante 131 minutos. La innovación principal no es arquitectónica sino de objetivo y formato: el modelo aprende a emitir una salida fija con líneas de hechos ligadas a su proyecto y un bloque breve de contexto, priorizando la recuperación exacta de valores y la eliminación de valores obsoletos o distractores. La decodificación recomendada es greedy (temperatura 0), que es la configuración usada en la evaluación.

## Capacidades

- Resumen y compresión de contexto de conversaciones multi-turno y sesiones de agentes.
- Extracción y preservación de valores concretos: puertos, claves, versiones, fechas, rutas, hosts, responsables y decisiones.
- Resolución de valores obsoletos: conserva únicamente el valor más reciente cuando un dato se actualiza o se rechaza.
- Vinculación de cada hecho a su proyecto correspondiente dentro de conversaciones con varios proyectos.
- Manejo de marcadores `[[SECRET_n]]` para secretos enmascarados.
- Descarte de ruido procedente de salidas de herramientas.
- Fusión de resúmenes previos con turnos nuevos.
- Salida en formato fijo estructurado en dos bloques (`Facts:` y `Context:`).
- No soporta tool calling ni function calling como capacidad propia.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Compresión de contexto en agentes de larga duración: el modelo resume turnos antiguos manteniendo puertos, rutas y versiones vigentes, de modo que el agente conserva los datos operativos tras truncar la ventana de contexto. Es adecuado porque su métrica principal es la recuperación exacta de valores.
- Integración en la capa delbina: mediante `Compressor` y `openai_summarizer` apuntando a un servidor compatible con OpenAI (vLLM, llama.cpp server, LM Studio), el modelo actúa como sumarizador del pipeline de compresión.
- Sesiones de soporte técnico multi-proyecto: cuando un chat mezcla varios proyectos, el modelo asigna cada valor a su proyecto y evita que un valor de un proyecto se cuele en otro, reduciendo el riesgo de configuraciones cruzadas.
- Gestión de configuraciones cambiantes: en flujos donde un puerto, una versión o una URL se actualiza varias veces, el modelo conserva solo el valor más reciente y descarta los sustituidos, lo que evita que el agente aplique parámetros obsoletos.
- Enmascarado de secretos en registros de conversación: con los marcadores `[[SECRET_n]]`, permite resumir sesiones que contienen credenciales sin exponer los valores originales, manteniendo la referencia en el resumen.
- Despliegue en local con Ollama o llama.cpp: gracias a las builds GGUF Q8_0 y Q4_K_M, puede ejecutarse en estaciones de trabajo sin GPU de datacenter para tareas de compresión de contexto en herramientas de desarrollo internas.
- Limpieza de trazas de herramientas: en sesiones de agente con mucha salida de herramientas, el modelo elimina el ruido y retiene solo los hechos útiles para turnos posteriores.

## Benchmarks y rendimiento

Resultados con decodificación greedy y el prompt de producción de delbina, sobre 300 chats por conjunto. Los conjuntos de test emplean nombres de proyecto, tipos de hecho y formulaciones no vistas en entrenamiento.

| Métrica (test, conjunto v2) | Qwen2.5-1.5B-Instruct | delbina-sum |
|---|---|---|
| Recuperación de hechos (valor presente) | 22.5 | 98.0 |
| Recuperación ligada (valor en línea con su proyecto) | 20.5 | 97.6 |
| Recuperación en tipos de hecho no vistos en entrenamiento | 23.3 | 97.2 |
| Valores inventados (% de líneas de hecho) | 0.0* | 0.6 |
| Chats con un valor obsoleto (sustituido) | 40.3 | 3.3 |
| Chats con fuga de un valor distractor | 29.1 | 0.6 |
| Chats con todos los hechos correctos | 0.0 | 85.7 |
| Longitud del resumen, mediana en caracteres | 454 | 373 |

\* El modelo base no inventa porque apenas conserva valores.

| Conjunto | Recuperación de hechos | Recuperación en tipos no vistos | Inventados |
|---|---|---|---|
| test v2 | 98.0 | 97.2 | 0.6 |
| test v0 (generador anterior) | 92.7 | 86.3 | 0.5 |
| holdout v2 | 97.8 | 97.6 | 0.6 |
| holdout v0 | 90.6 | 87.3 | 0.5 |

Los umbrales de release (ganancia de recuperación ≥ +15 puntos, inventados ≤ 2.0%, recuperación en tipos no vistos ≥ 70, fugas de distractores ≤ 5%) se cumplen en test y holdout, tanto en fp16 como en ambas cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada: en fp16, aproximadamente 3,1 GB solo para pesos (1.543.714.304 parámetros × 2 bytes), más caché KV y overhead; en Q8_0, alrededor de 1,6 GB; en Q4_K_M, alrededor de 0,9-1,0 GB.
- GPU recomendadas: el modelo se entrenó en 2× T4, lo que indica que una T4 única es suficiente para inferencia. Cabe holgadamente en RTX 4090, RTX 3090, RTX 4060 Ti y GPUs de 8 GB o más en cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando Q8_0 o Q4_K_M; en fp16 requiere al menos 6-8 GB para trabajar con contexto de 8192 tokens.
- Opciones de despliegue: Ollama y llama.cpp mediante las builds GGUF de `delbina/delbina-sum-GGUF`; vLLM, llama.cpp server y LM Studio mediante API compatible con OpenAI; transformers con la clase `Compressor` y `openai_summarizer` de delbina.
- Latencia y throughput: no disponible en la información proporcionada. El tiempo de entrenamiento fue de 131 minutos en 2× T4 con batch efectivo 16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| delbina-sum | 1,5B | no disponible (evaluado con ≥ 8192) | Resumen con preservación de hechos | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (modelo base Qwen2.5) | Instrucciones generales | Apache 2.0 | Hugging Face |
| Resumidores genéricos de la familia Qwen2.5 | 1,5B-7B | variable | Resumen sin formato ni preservación de valores | Apache 2.0 | Hugging Face |

La comparación directa con el modelo base en la misma tarea muestra la diferencia de especialización: 98.0 frente a 22.5 en recuperación de hechos y 85.7 frente a 0.0 en chats con todos los hechos correctos. No se dispone de comparación con otros sumarizadores especializados en compresión de contexto en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado solo con datos sintéticos; no se ha medido en conversaciones reales. Conviene revisar los resúmenes antes de confiar en ellos y conservar los originales de cualquier dato crítico.
- El contenido fuera de los tipos de hecho plantados (explicaciones largas, código, razonamiento matizado) puede comprimirse y perderse.
- Alrededor del 0,4% de las líneas de hecho asignan un valor real al proyecto equivocado, a menudo por nombres de clúster parecidos; algunos hechos aparecen sin proyecto.
- Inventa valores de forma ocasional en entradas poco familiares (por ejemplo, una URL de base de datos por defecto con `postgres:password@localhost` que no está en el chat); la tasa medida es del 0,6% de las líneas de hecho.
- La recuperación es más débil en el estilo v0 antiguo (aproximadamente 87-93) que en v2 (aproximadamente 97-98).
- Solo inglés y formato de salida fijo.
- La recuperación se mide por coincidencia exacta, por lo que un valor parafraseado cuenta como fallo.
- No debe usarse como única copia de secretos o configuración crítica; delbina conserva los originales en modo máscara.
- Licencia Apache 2.0, que permite uso comercial, pero el estado experimental y la falta de validación con datos reales desaconsejan su uso en producción sin supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/delbina/delbina-sum
- Builds GGUF: https://huggingface.co/delbina/delbina-sum-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/delbina-sum-data
- Repositorio del proyecto delbina: https://github.com/delbina/delbina
- Repositorio del generador y datos de delbina-sum: https://github.com/delbina/delbina-sum
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
