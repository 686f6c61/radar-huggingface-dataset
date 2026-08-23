# heyimmitzu/deepfable-v1-e4b

## Resumen

`deepfable-v1-e4b` es un modelo de lenguaje multimodal (visión y lenguaje) publicado por el usuario `heyimmitzu` en Hugging Face. Se distribuye en formato GGUF, lo que indica que está preparado para su uso con `llama.cpp` y otras herramientas compatibles. El nombre de los archivos (`gemma-4-e4b-it.Q4_K_M.gguf` y `gemma-4-e4b-it.BF16-mmproj.gguf`) sugiere que se trata de un ajuste fino de una variante de Gemma 4 con 4 mil millones de parámetros en modo instruct, aunque el número de parámetros totales reportado en el repositorio es de 7.518.069.290, lo que no coincide con esa cifra. No se dispone de información adicional sobre el modelo base, el proceso de entrenamiento o las especificaciones técnicas más allá de los ficheros publicados.

El modelo se presenta como un proyecto experimental, con cero descargas y sin licencia especificada. Su relevancia radica en ofrecer una alternativa GGUF cuantizada para ejecución local en herramientas como `llama.cpp`, con soporte multimodal (entrada de imágenes y texto). La falta de documentación hace que su uso en producción sea arriesgado hasta que se aclaren los detalles de licencia y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente basada en Gemma 4, pero sin confirmar) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) y BF16 para el proyector multimodal (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) y BF16 (mmproj) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo. El nombre de los ficheros sugiere que es una variante de Gemma 4 con 4B parámetros, pero el recuento real de parámetros (7.5B) contradice esa denominación. Se sabe que el modelo fue ajustado mediante la herramienta Unsloth y posteriormente convertido a formato GGUF para su uso con `llama.cpp`. La presencia de un archivo `mmproj` indica que se trata de un modelo multimodal, es decir, capaz de procesar imágenes y texto.

El proceso de entrenamiento, la composición del dataset, la cantidad de tokens utilizados o si se emplearon técnicas como RLHF o DPO no se han documentado. Tampoco se menciona ninguna innovación técnica destacable.

## Capacidades

- Generación de texto en respuesta a prompts, orientado a conversación.
- Procesamiento de imágenes (multimodal), gracias al proyector de visión (`mmproj`).
- Compatible con `llama.cpp` y herramientas similares (ej. `llama-cli`, `llama-mtmd-cli`).
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni otras funciones avanzadas.

## Casos de uso

- **Descripción de imágenes**: el modelo puede recibir una imagen y generar una descripción textual en lenguaje natural.
- **Asistente de conversación multimodal**: permite mantener diálogos donde el usuario adjunta imágenes y hace preguntas sobre ellas.
- **Aplicaciones de visión por computador con lenguaje**: puede integrarse en sistemas que necesiten interpretar imágenes y generar informes o respuestas.
- **Despliegue local en `llama.cpp`**: al estar en formato GGUF, se puede ejecutar en entornos con CPU o GPU mediante `llama-cli` o `llama-mtmd-cli`.
- **Prototipado rápido con Unsloth**: al haber sido ajustado con Unsloth, el código de entrenamiento puede adaptarse para otros modelos.
- **Uso con Ollama**: aunque Ollama no soporta archivos `mmproj` separados, se puede crear un modelo unificado mediante un `Modelfile` según la nota del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se ofrecen comparaciones con modelos similares.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q4_K_M de un modelo de 7.5B parámetros ocupa aproximadamente 4.3 GB en disco. Para inferencia con GPU, se recomienda al menos 6 GB de VRAM para permitir el procesamiento de imágenes y el contexto de tokens.
- **GPU recomendadas**: tarjetas como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores son suficientes para ejecutar el modelo en cuantización Q4.
- **Ejecución en CPU**: `llama.cpp` permite ejecución en CPU, aunque la latencia será mayor y el modelo multimodal puede ser más exigente.
- **Opciones de despliegue**: `llama-cli`, `llama-mtmd-cli`, Ollama (con `Modelfile`), y cualquier herramienta compatible con GGUF.
- **Latencia y throughput**: no se han publicado datos concretos. Dependerá del hardware y del tamaño de las imágenes de entrada.

## Comparativa con modelos similares

No es posible realizar una comparativa fiable porque se desconoce el modelo base y no se han publicado benchmarks. Si se asume que es un Gemma 4 4B instruct, se podría comparar con Gemma 3 4B, Llama 3.2 3B, etc., pero no hay datos objetivos. Se indica "no disponible".

## Limitaciones y advertencias

- **Licencia desconocida**: no se especifica ninguna licencia, por lo que no se puede garantizar el uso comercial. Es necesario contactar con el autor.
- **Sesgos y alucinaciones**: no se han documentado, pero como todo modelo de lenguaje, puede generar información incorrecta o sesgada.
- **Contexto de tokens**: se desconoce el tamaño máximo de contexto, lo que limita el uso en conversaciones largas o documentos extensos.
- **Idiomas**: no se indica qué idiomas soporta; probablemente el entrenamiento se realizó en inglés, pero no es seguro.
- **Soporte multimodal**: la calidad del procesamiento de imágenes no está evaluada. El archivo `mmproj` es BF16, por lo que requiere más memoria en comparación con cuantizaciones más agresivas.
- **Riesgo en producción**: al ser un modelo sin documentación y sin métricas, no se recomienda su uso en entornos críticos sin una validación exhaustiva.

## Enlaces

- [Hugging Face: heyimmitzu/deepfable-v1-e4b](https://huggingface.co/heyimmitzu/deepfable-v1-e4b)
- [Unsloth (herramienta de entrenamiento)](https://github.com/unslothai/unsloth)
