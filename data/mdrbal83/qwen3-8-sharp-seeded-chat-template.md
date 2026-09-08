# mdrbal83/Qwen3.8-Sharp-Seeded-Chat-Template

`. Seeding con "Let me" hace que el estilo narrativo sea la única continuación posible. Todos los traces bajo el template sembrado abren "Let me think through..." / "Let me work through...", y el conteo de runaways en 222 muestras sembradas en Flash-Next es cero, versus 10 en 210 para el template upstream.

También documenta qué no funcionó: seis intentos de arreglar con instrucciones empeoraron. Incluye una tabla de versiones v1-v10.

Los resultados de búsqueda web: en su mayoría irrelevantes (comparativos de modos de devolución de chantier en francés, etc.). Hay un GitHub de QwenLM/Qwen3.8 que menciona que es la serie de modelos de lenguaje grande, incluyendo Qwen3.5, Qwen3.6, y el último Qwen3.8. También hay un enlace a Qwen/Qwen3-8B en HuggingFace (que es diferente, es Qwen3-8B, no Qwen3.8). El enlace de GitHub parece relevante para el modelo base.

Ahora, debo redactar la ficha. Tengo que tener cuidado con los datos. La información proporcionada es sobre un "chat template" (una plantilla de chat), no un modelo de lenguaje en sí. Es un archivo Jinja que se usa con modelos Qwen3.8. Por tanto, la ficha debe reflejar esto. El "modelo" es en realidad una plantilla de chat que modifica el comportamiento de razonamiento de los modelos base Qwen3.8-Flash-Next y Qwen3.8-27B.

Estructura:

## Resumen
Explicar que es un chat template para Qwen3.8, desarrollado por mdrbal83, que reduce tokens de razonamiento, elimina runaways, y mantiene calidad. Arquitectura: no es un modelo en sí, sino una plantilla Jinja para los modelos Qwen3.8 (que son transformers). Tamaño: no aplica, pero se usa con Qwen3.8-27B y Qwen3.8-Flash-Next. Contexto: no disponible, depende del modelo base.

## Especificaciones técnicas
Tabla con los parámetros. Hay que adaptar:

| Parametro | Valor |
|---|---|
| Arquitectura | Plantilla de chat Jinja para modelos transformer Qwen3.8 (Qwen3.8-Flash-Next y Qwen3.8-27B) |
| Parametros totales | no disponible (depende del modelo base; Qwen3.8-27B tiene 27B) |
| Parametros activos | no disponible (no es MoE) o "no aplica" |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (la plantilla es independiente de la cuantizacion; se probo con NVFP4) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (es una plantilla Jinja; los pesos son safetensors/GGUF del modelo base) |

Pero la instrucción dice "si un dato no esta disponible, pone 'no disponible'". Para "Formato de pesos" podría poner "no aplica (plantilla Jinja)" o "no disponible". Mejor ser preciso: "no aplica: es una plantilla Jinja, no un modelo de pesos". Pero la fila dice "Formato de pesos" — puedo poner "No aplica (plantilla Jinja; el modelo base usa safetensors/GGUF)". Sin embargo, la regla dice "si un dato no esta disponible, pone 'no disponible'". Podría poner "no disponible (es una plantilla, no pesos)". Creo que es aceptable.

## Arquitectura y entrenamiento
Explicar que es una plantilla de chat, no un modelo entrenado. Se basa en template upstream. Cambio: una frase en system prompt y dos palabras en generation prompt (abrir `## Resumen

El repositorio `mdrbal83/Qwen3.8-Sharp-Seeded-Chat-Template` no contiene un modelo de lenguaje, sino una plantilla de chat en formato Jinja pensada para los modelos de razonamiento de la serie Qwen3.8. Su objetivo es reducir drásticamente el número de tokens de razonamiento generados en el modo `xhigh` (aproximadamente a la mitad), eliminar las trazas de razonamiento descontroladas que superan los 8.000 tokens y que a menudo nunca cierran el bloque ``, y mantener o incluso mejorar la calidad de las respuestas. La plantilla es una revisión ajustada de `peculiar-ragdoll/Qwen-Sharp-Chat-Templates`, que a su vez deriva de `froggeric/Qwen-Fixed-Chat-Templates` v22.4.1, y se distribuye bajo licencia Apache-2.0.

El cambio fundamental respecto a las plantillas anteriores es mínimo: una única frase en el system prompt y dos palabras en el generation prompt, concretamente abrir el bloque `` con un bloque vacío, se inserta `Let me` al principio, lo que condiciona al modelo a adoptar un estilo narrativo ("Let me think through...", "Let me work through...") en lugar del estilo recortado "We need answer".

El análisis de los autores identificó que el modo "We need answer" era el causante del 94% de las trazas descontroladas en pruebas con esfuerzo `medium` (31 de 33 trazas que superaban 8.000 tokens). Este estilo se caracteriza por frases como "Need X. Could Y. Potential issue: Z. Good." y deriva en decenas de párrafos consecutivos de "Potential issue:", discutiendo con un evaluador imaginario y, en muchos casos, sin cerrar nunca el bloque ``. Al sembrar el bloque con `Let me`, la única continuación posible es el estilo narrativo, eliminando por completo las trazas descontroladas en las pruebas realizadas. No hay proceso de entrenamiento ni fine-tuning; el cambio es exclusivamente de plantilla.

## Capacidades

- Reducción de tokens de razonamiento en modo `xhigh`: en Flash-Next NVFP4 la media baja de 3.368 a 1.408 tokens (−58%), y en Qwen3.8-27B de 3.555 a 2.003 (−44%).
- Eliminación de trazas descontroladas (>8.000 tokens): en 222 muestras sembradas sobre Flash-Next no se registró ninguna, frente a 10 en 210 muestras con la plantilla upstream.
- Eliminación de truncamientos del bloque ``: en todos los escenarios probados, el número de trazas truncadas o sin cerrar se redujo a cero, salvo en un caso del modelo 27B en modo `xhigh` (7 → 2).
- Mejora del score objetivo en la mayoría de configuraciones: por ejemplo, en Flash-Next `xhigh` el score pasa de 0.932 a 1.000, y en los stress prompts del modelo 27B de 0.333 a 0.922.
- Soporte de continuaciones de tool calling: la versión v10 de la plantilla no aplica el seed en turnos posteriores a una llamada a herramienta, evitando comportamientos erráticos tras resultados de herramientas.
- Compatibilidad con vLLM, llama.cpp y LM Studio, según los tags del repositorio.
- No requiere reentrenamiento ni cambios en los pesos del modelo base.

## Casos de uso

- Despliegue de modelos de razonamiento en producción con presupuesto de latencia limitado: al reducir a la mitad los tokens de razonamiento en modo `xhigh`, la latencia por consulta disminuye proporcionalmente, lo que permite servir modelos grandes en infraestructuras con capacidad de cómputo ajustada.
- Sistemas de agentes autónomos que requieren respuestas rápidas y fiables: la eliminación de trazas descontroladas evita timeouts y respuestas que nunca llegan a cerrarse, especialmente en escenarios de razonamiento prolongado.
- Servicios de chat con ventanas de contexto largas: al recortar el razonamiento, se libera espacio en la ventana de contexto para más turnos de conversación o más contenido en los prompts, lo que resulta útil en asistentes que manejan documentos extensos.
- Pipelines de CI/CD para generación de código: el modo de razonamiento más corto y estable acelera el ciclo de feedback en tareas de revisión de código o generación de pruebas, reduciendo el coste por ejecución.
- Evaluación comparativa de modelos de razonamiento: la plantilla permite medir de forma consistente el comportamiento de los modelos Qwen3.8 en diferentes esfuerzos, aislando el efecto del estilo de razonamiento en la calidad final.
- Despliegue en hardware de consumo o edge computing: al disminuir el número de tokens generados, se reduce la VRAM necesaria para los buffers de decodificacion y el consumo energético, facilitando la ejecución en dispositivos como NVIDIA DGX Spark o GPUs de gama media.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y comparan la plantilla original (antes de la flecha) con la plantilla Sharp Seeded (después de la flecha). Todas las mediciones se realizaron sobre trazas completas con JSON disponible en el repositorio.

| Checkpoint | Effort | Tokens razonamiento (media) | p90 | Runaways (>8k) | Truncados | Score objetivo |
|---|---|---|---|---|---|---|
| Flash-Next NVFP4 (vLLM local) | xhigh | 3.368 → 1.408 (−58%) | 9.788 → 2.968 | 6/42 → 0 | 2 → 0 | 0.932 → 1.000 |
| Flash-Next NVFP4 (vLLM local) | medium | 1.031 → 916 (−11%) | 2.035 → 2.046 | 2/126 → 0 | 0 → 0 | 0.982 → 0.999 |
| Flash-Next NVFP4 (vLLM local) | low | 1.286 → 773 (−40%) | 1.288 → 1.627 | 2/42 → 0 | 1 → 0 | 0.893 → 0.974 |
| Qwen3.8-27B (OpenRouter/Phala) | xhigh | 3.555 → 2.003 (−44%) | 10.751 → 4.210 | 7/42 → 2 | 3 → 0 | 0.921 → 0.974 |
| Qwen3.8-27B, stress prompts | xhigh | 14.227 → 3.638 (−74%) | 16.000 → 5.164 | 11/12 → 0 | 8 → 0 | 0.333 → 0.922 |
| Qwen3.8-27B (OpenRouter/Phala) | medium | 1.052 → 1.181 (+12%) | 2.217 → 2.047 | 0 → 0 | 0 → 0 | 0.981 → 0.954 |

El autor también documenta seis intentos fallidos de resolver el problema mediante instrucciones en el system prompt, que en lugar de mejorar empeoraron el comportamiento. Por ejemplo, la versión v1 redujo aparentemente los tokens en una muestra pequeña, pero en una muestra más amplia produjo 6/12 trazas descontroladas frente a 1/12 en la línea base. La versión v6, con reglas orientadas a la terminación, generó 8/12 trazas descontroladas, el peor resultado de todas. Estos datos subrayan que la solución mediante seed es más robusta que las instrucciones explícitas.

## Requisitos de hardware

- La plantilla no requiere VRAM por sí misma; los requisitos dependen del modelo base sobre el que se aplique.
- Entorno de pruebas documentado: NVIDIA DGX Spark (GB10, 121 GiB de memoria unificada) ejecutando vLLM con el checkpoint Flash-Next en cuantización NVFP4.
- Para el modelo Qwen3.8-27B, se recomienda una GPU con al menos 80 GB de VRAM para inferencia en FP16 (por ejemplo, A100 80GB o H100 80GB). Con cuantización NVFP4 podría reducirse el requisito.
- Opciones de despliegue compatibles: vLLM, llama.cpp y LM Studio, según los tags del repositorio. También se ha validado el uso a través de OpenRouter con el modelo 27B.
- Latencia: no se proporcionan cifras absolutas, pero la reducción del 44–58% en tokens de razonamiento implica una disminución directa del tiempo de decodificacion y del coste por consulta en servicios de pago por token.

## Comparativa con modelos similares

| Plantilla | Origen | Cambio principal | Resultado en pruebas |
|---|---|---|---|
| Qwen3.8 Sharp Seeded (este repo) | mdrbal83 | Seed `Let me` + frase tersa en system prompt | 0 runaways en 222 muestras sobre Flash-Next; score objetivo 1.000 en xhigh |
| Qwen-Sharp-Chat-Templates | peculiar-ragdoll | System prompt terso sin seed | 10 runaways en 210 muestras sobre Flash-Next |
| Qwen-Fixed-Chat-Templates | froggeric | Corrección de errores en la plantilla original de Qwen | Base de la anterior; sin seed ni ajustes de tersura |

La comparativa se limita a plantillas de chat porque el repositorio no es un modelo de lenguaje. Las alternativas son los proyectos upstream de los que deriva. La diferencia clave es el seed `Let me`, que resulta determinante para eliminar las trazas descontroladas, mientras que los cambios de instrucciones por sí solos no logran ese efecto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no añade capacidades nuevas al modelo base, solo modifica el formato de la conversación y el comportamiento de razonamiento.
- Los resultados se midieron en entornos concretos (DGX Spark con vLLM y NVFP4, y OpenRouter con el modelo 27B). Pueden variar en otros servidores, otras cuantizaciones o versiones diferentes de los modelos base.
- En el modelo 27B con esfuerzo `medium`, la plantilla produjo un ligero aumento del 12% en tokens de razonamiento (1.052 → 1.181) y una pequeña caída del score objetivo (0.981 → 0.954), lo que indica que no siempre mejora el rendimiento en todos los niveles de esfuerzo.
- Los intentos de resolver el problema mediante instrucciones en el system prompt empeoraron notablemente el comportamiento, llegando a duplicar o triplicar la media de tokens de razonamiento. La solución específica del seed puede no transferirse a otros modelos o familias.
- La plantilla depende del comportamiento entrenado de la serie Qwen3.8; aplicar el mismo seed a modelos de otras familias podría producir resultados impredecibles.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base (Qwen3.8-Flash-Next y Qwen3.8-27B) antes de un despliegue en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mdrbal83/Qwen3.8-Sharp-Seeded-Chat-Template
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Plantilla upstream: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Plantilla upstream base: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Kit de despliegue para DGX Spark: https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Single-DGX-Spark
- Checkpoint Flash-Next NVFP4 usado en las pruebas: https://huggingface.co/Mia-AiLab/Qwen3.8-Flash-Next-NVFP4
