# horiuchinobuyuki/Qwick-3.5-9B-MLX-8bit

## Resumen

Qwick-3.5-9B-MLX-8bit es una cuantización en 8 bits del modelo Qwick-3.5-9B, creada por horiuchinobuyuki para ejecutarse de forma eficiente en Macs con Apple Silicon mediante la librería MLX. El modelo base Qwick-3.5-9B es un ajuste fino de Qwen3.5-9B (licencia Apache-2.0) cuyo objetivo es reducir la longitud de las cadenas de razonamiento manteniendo una calidad comparable a la del modelo original. Esta versión MLX elimina la torre de visión del modelo original, por lo que solo soporta entrada de texto.

La cuantización usa cuantización afín con grupo de tamaño 64, lo que resulta en aproximadamente 8.5 bits por peso. Es una opción adecuada para desarrolladores que quieren ejecutar un modelo de razonamiento de nivel medio en hardware de Apple sin depender de servicios en la nube, con un equilibrio entre memoria y calidad. El repositorio ocupa 9.5 GB y el número de parámetros reportado en los safetensors es 2.519.020.032, aunque el nombre del modelo sugiere 9 mil millones; esta discrepancia puede deberse a cómo se contabilizan los pesos cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) |
| Parametros totales | 2.519.020.032 (segun safetensors; el nombre del modelo indica 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (afine, grupo 64); tambien existe version 4-bit |
| Idiomas soportados | ingles y japones (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwick-3.5-9B es un fine-tune de Qwen3.5-9B, un transformer autoregresivo de 9 mil millones de parametros. El ajuste se ha orientado a reducir la longitud de las cadenas de razonamiento generadas por el modelo, manteniendo la calidad en tareas de razonamiento. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. La version MLX aqui descrita es una conversion del checkpoint BF16 original mediante `mlx-lm.convert` con cuantizacion afine de 8 bits y grupo de tamaño 64. La conversion elimina la torre de vision del modelo original, por lo que solo procesa texto.

## Capacidades

- Generacion de texto y chat conversacional en ingles y japones.
- Razonamiento con cadenas de pensamiento mas cortas que el modelo base Qwen3.5-9B, segun la descripcion del autor.
- No incluye soporte de vision (la torre de vision se elimino en la conversion MLX).
- No se menciona soporte explicito de tool calling, function calling ni uso como agente.
- No se indican capacidades especiales como thinking mode adicional o procesamiento de audio.

## Casos de uso

- Asistencia local en Mac: desarrolladores que necesitan un modelo de chat y razonamiento ejecutable en portatiles Apple con memoria unificada, sin conexion a internet.
- Prototipado rapido de aplicaciones de texto: usar `mlx_lm` para generar respuestas en entornos de desarrollo sin necesidad de GPU dedicada.
- Experimentacion con cuantizacion 8-bit: evaluar el impacto de la cuantizacion en la calidad de respuestas en tareas de razonamiento.
- Generacion de contenido en ingles y japones: por ejemplo, redaccion de articulos, correos o traducciones basicas, aprovechando el soporte bilingue.
- Educacion e investigacion en eficiencia de modelos: analizar como un fine-tune dirigido a reducir el razonamiento afecta a la longitud de las respuestas y al consumo de recursos.
- Despliegue en entornos sin GPU NVIDIA: cualquier equipo con Apple Silicon puede ejecutar el modelo mediante MLX, evitando la dependencia de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base Qwick-3.5-9B menciona que existe una tabla completa de benchmarks, pero no se ha incluido en la ficha actual. Por tanto, no se pueden presentar datos comparativos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- Dispositivos compatibles: Macs con Apple Silicon (M1, M2, M3, M4, etc.) gracias a la libreria MLX.
- Memoria estimada: el repositorio pesa 9.5 GB; la cuantizacion 8-bit reduce el uso de memoria con respecto al BF16, pero se recomienda al menos 16 GB de memoria unificada para un uso comodo.
- GPU: no requiere GPU externa; usa la GPU integrada de Apple Silicon y la memoria unificada.
- Despliegue: mediante `mlx-lm` (comando `mlx_lm.generate` o en Python con `load` y `generate`). Tambien es posible usar otros frontends que soporten MLX, como Ollama (si se convierte a GGUF, aunque este formato no es el nativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwick-3.5-9B-MLX-8bit (este) | 2.5B (reportado) | no disponible | 8-bit | Apache-2.0 | MLX | Solo texto, para Apple Silicon |
| Qwen3.5-9B (original) | ~9B | no disponible | BF16 | Apache-2.0 | safetensors | Modelo base multimodal, requiere mas VRAM |
| Qwick-3.5-9B-MLX-4bit | 2.5B (reportado) | no disponible | 4-bit | Apache-2.0 | MLX | Version mas ligera del mismo modelo |

No hay datos de benchmarks para comparar directamente. La diferencia principal radica en el formato de pesos y el hardware objetivo.

## Limitaciones y advertencias

- El numero de parametros reportado en los safetensors (2.5B) no coincide con el nombre del modelo (9B); es posible que la cuantizacion afecte al conteo o que el dato sea incorrecto. No se ha podido verificar la arquitectura completa.
- La torre de vision no esta incluida: no se pueden procesar imagenes, a diferencia del modelo base Qwen3.5-9B.
- Solo se declara soporte para ingles y japones; puede no funcionar bien en otros idiomas.
- No se han proporcionado benchmarks de rendimiento, por lo que no se puede evaluar la calidad comparativa con otros modelos.
- Al ser una cuantizacion 8-bit, puede haber una ligera perdida de precision en tareas de razonamiento complejo respecto al checkpoint BF16.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la atribucion y citacion del modelo base.
- No hay soporte para tool calling, function calling ni agentes, limitando su uso en aplicaciones que requieran interaccion con APIs o herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B-MLX-8bit
- Modelo base: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B
- Version 4-bit: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B-MLX-4bit (referencia en la card)
- Tutorial de ejecucion rapida: https://www.lisselbo.se/wp/2026/07/08/quick-run-qwen3-5-9b-mlx-8bit-2026-2027-tutorial/
- Pagina de ThinkLLM sobre el modelo: https://thinkllm.dev/models/qwen3-5-9b-mlx-8bit
