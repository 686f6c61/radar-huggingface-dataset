# Robin1333k/Qwen3.5-2B-Base-MLX-6bit

## Resumen

Este repositorio contiene una cuantización en 6 bits del modelo base `Qwen/Qwen3.5-2B-Base` realizada con el framework MLX, específicamente para inferencia en dispositivos Apple Silicon. El autor, Robin1333k, la ha creado como parte de su herramienta AutoComplete, un sistema de predicción de texto en tiempo real para macOS. La cuantización se ha realizado con `mlx_lm.convert` usando 6 bits con grupo de tamaño 64 y cuantización afín, dando como resultado un peso de aproximadamente 1,5 GB.

La relevancia de esta cuantización radica en el análisis que acompaña a la model card: el autor demuestra que una cuantización ingenua a 4 bits degrada el rendimiento en inglés hasta un 40 % respecto al modelo en bf16, mientras que la versión de 6 bits recupera completamente la calidad del modelo original. Este resultado es un recordatorio práctico de que, en modelos pequeños, la elección del nivel de cuantización no debe hacerse únicamente por tamaño, sino validándose contra la referencia en bf16. No se trata de un fine-tune: solo los pesos están cuantizados, por lo que el comportamiento es idéntico al del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5, detalles internos no disponibles) |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit (afín, grupo de 64), también se documentan 4-bit y mixto 4/6-bit en la comparativa |
| Idiomas soportados | Ingles y aleman (verificados por el autor; el modelo base puede soportar mas) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint oficial `Qwen/Qwen3.5-2B-Base`, un modelo de lenguaje base de 2B parámetros desarrollado por el equipo de Qwen. No se proporcionan detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.) ni sobre el proceso de entrenamiento del modelo original en esta model card. Lo único que se documenta es el proceso de conversión: se utilizó `mlx_lm.convert` con los parámetros `--q-bits 6 --q-group-size 64` y cuantización afín. Los pesos se cuantizan únicamente, sin ningún ajuste fino posterior. El autor incluye el `chat_template.jinja` original del modelo base, pero advierte que el uso previsto es como modelo de completado de texto sin plantilla de chat, ya que al ser un modelo base, aplicarle una plantilla lo convertiría en un asistente de preguntas y respuestas en lugar de continuar el texto.

## Capacidades

- Generación de texto y completado de texto: el modelo predice la continuación de un prefijo dado, palabra por palabra o en frases cortas.
- Modelo base sin instrucciones: no está entrenado para seguir instrucciones ni para mantener diálogos, por lo que no soporta chat nativo.
- Sin tool calling ni function calling: al ser un modelo base, no tiene capacidades de invocación de herramientas.
- Sin capacidades multimodales confirmadas: aunque la serie Qwen3.5 según otras fuentes incluye visión, esta model card no lo menciona y el modelo base de 2B podría ser solo texto.
- Multilingüismo limitado: el autor verifica rendimiento en inglés y alemán, siendo el alemán más débil.
- Compatibilidad con MLX: optimizado para ejecución en Apple Silicon mediante el framework MLX.

## Casos de uso

- Autocompletado de texto en sistemas operativos: es el caso de uso original. El modelo se integra en AutoComplete para macOS, prediciendo la continuación de lo que el usuario escribe en cualquier aplicación, con una ventana de pocas palabras.
- Asistente de escritura en editores de texto: puede sugerir la siguiente frase o completar párrafos en tiempo real, funcionando con prefijos sin plantilla de chat y decodificación greedy.
- Autocompletado de código en entornos locales: aunque no está específicamente entrenado para código, un modelo base de 2B puede ofrecer sugerencias de completado en lenguajes de programación, especialmente si se le da un prefijo con contexto.
- Experimentación con cuantización en MLX: sirve como referencia para estudiar el impacto de diferentes niveles de cuantización (4-bit, 6-bit, mixto) en la calidad de generación de un modelo pequeño.
- Prototipado de aplicaciones de predicción de texto en inglés y alemán: al ser ligero (1,5 GB) y ejecutable en cualquier Mac con Apple Silicon, es adecuado para integrarse en aplicaciones de escritorio o scripts de automatización.
- Investigación sobre degradación por cuantización: el análisis comparativo con bf16 y 4-bit que incluye el autor es útil para investigadores que necesiten calibrar expectativas sobre modelos cuantizados de pequeño tamaño.

## Benchmarks y rendimiento

El autor incluye una evaluación propia (word-acceptance bake-off) que mide el número medio de palabras aceptadas por sugerencia en inglés y alemán, comparando la cuantización de 6 bits con bf16, 4-bit y una versión mixta 4/6-bit. Los resultados son los siguientes:

| Cuantizacion | Tamano | EN flush | EN espacio | DE flush | DE espacio |
|---|---|---|---|---|---|
| 4-bit (afin, g64) | 1,0 GB | 1,25 | 0,58 | 1,42 | 0,42 |
| Mixto 4/6-bit | 1,0 GB | 1,25 | 0,58 | 1,42 | 0,42 |
| 6-bit (afin, g64) | 1,5 GB | 2,08 | 0,54 | 1,50 | 0,58 |
| bf16 (referencia) | 4,3 GB | 2,08 | 0,75 | 1,50 | 0,58 |

La conclusión del autor es que la cuantización de 6 bits iguala exactamente la calidad de bf16 en las columnas "flush" (sin espacio final), mientras que la de 4 bits pierde alrededor del 40 % en inglés. No se ofrecen resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para el modelo en 6 bits (frente a 4,3 GB en bf16 y 1,0 GB en 4-bit).
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1 o posterior) con al menos 8 GB de RAM unificada puede ejecutar el modelo sin problemas. No se requieren GPU discretas.
- Compatibilidad con hardware de consumo: sí, cualquier Mac con Apple Silicon es suficiente.
- Opciones de despliegue: el formato MLX se ejecuta con la librería `mlx-lm` o integrado en aplicaciones que usen el framework MLX. No es compatible directamente con vLLM, llama.cpp o Ollama, que usan otros formatos.
- Latencia y throughput: no se proporcionan cifras exactas, pero al ser un modelo de 2B en 6 bits, la generación es fluida en tiempo real para predicción de texto, como demuestra su uso en AutoComplete.

## Comparativa con modelos similares

La comparativa más relevante es entre las distintas cuantizaciones del mismo modelo base, ya que el autor no proporciona comparaciones con otros modelos de 2B. La siguiente tabla resume las diferencias:

| Modelo | Tamano | Calidad (EN flush) | Uso previsto |
|---|---|---|---|
| Qwen3.5-2B-Base (bf16) | 4,3 GB | 2,08 | Referencia de calidad |
| Qwen3.5-2B-Base MLX 6-bit (este) | 1,5 GB | 2,08 | Inferencia en Apple Silicon con calidad completa |
| Qwen3.5-2B-Base MLX 4-bit | 1,0 GB | 1,25 | Inferencia ligera con perdida significativa de calidad |
| Qwen3.5-2B-Base MLX mixto 4/6-bit | 1,0 GB | 1,25 | Sin ventaja frente a 4-bit puro |

No se dispone de datos para comparar con otros modelos de 2B como Llama 3.2 1B o Mistral 7B, ya que no se aportan benchmarks cruzados.

## Limitaciones y advertencias

- Idioma: el autor verifica únicamente inglés y alemán. El alemán muestra una tasa de aceptación de palabras aproximadamente la mitad que el inglés, y en generaciones largas pueden aparecer errores gramaticales (orden verbal en subordinadas) y colocaciones calcadas del inglés. Esto es una propiedad del modelo base, no de la cuantización.
- No es un modelo instructivo: usar una plantilla de chat lo convierte en un asistente de preguntas y respuestas, lo que puede dar resultados no deseados si se espera completado de texto.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en contextos largos o fuera de su dominio de entrenamiento.
- Contexto limitado: no se especifica la longitud de contexto del modelo base, pero al ser de 2B probablemente sea reducida (típicamente 8K o 32K). Para predicción de texto corto no es un problema, pero para tareas que requieran contexto largo puede ser insuficiente.
- Sin soporte de herramientas ni funciones: al ser un modelo base, no puede invocar herramientas ni realizar razonamiento multi-paso.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar la licencia del modelo base original para confirmar.
- Regresión en el caso "espacio final" en inglés: la cuantización 6-bit muestra una ligera caída (0,54 frente a 0,75 en bf16) en el escenario con espacio final, aunque el autor indica que no afecta al caso de uso previsto porque la aplicación elimina los espacios finales antes de la inferencia.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Robin1333k/Qwen3.5-2B-Base-MLX-6bit
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Cuantización 6-bit de la comunidad MLX: https://huggingface.co/mlx-community/Qwen3.5-2B-6bit
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:2b
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-2b-base-qwen
