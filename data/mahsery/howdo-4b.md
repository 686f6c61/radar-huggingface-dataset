# mahsery/howdo-4b

## Resumen

`howdo-4b-v4` es un modelo de lenguaje de 4.000 millones de parámetros (4.205.751.296 reales) desarrollado por el usuario de HuggingFace `mahsery`, especializado en la traducción de lenguaje natural a comandos de shell POSIX y Bash de una sola línea. El modelo está diseñado para ejecutarse localmente con `llama.cpp` y alimenta la herramienta CLI `howdo`, que permite convertir peticiones en inglés en comandos de terminal precisos y seguros.

Se basa en la arquitectura Qwen3.5-4B, de la que se han eliminado los pesos del encoder de visión para reducir el uso de memoria y la latencia de inferencia. El modelo se ha afinado mediante LoRA (rango 32, alfa 64) sobre 69.000 ejemplos verificados de generación de comandos, con especial atención a la aplicación de límites de alcance, terminadores de opción, patrones seguros de pipelines y el uso de utilidades modernas como `rg`, `fd`, `jq` o `sed`. Está disponible en formato GGUF cuantizado Q4_K_M (2,57 GB) y tiene una longitud de contexto de 512 tokens, optimizada para ejecuciones de terminal de una sola vuelta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer decoder, sin encoder de vision) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) y safetensors (original) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros, al que se le han eliminado los pesos del encoder de visión para reducir el tamaño y la latencia. Sobre esta base se ha realizado un fine-tuning con LoRA de rango 32 y alfa 64, utilizando un conjunto de datos de 69.000 ejemplos verificados de generación de comandos. El entrenamiento se ha centrado en reglas específicas de seguridad y corrección en el entorno shell: respetar los límites de alcance (por ejemplo, `-maxdepth 1` para restricciones no recursivas), usar terminadores de opción (`--`) para nombres de archivo que empiecen por guion, patrones de pipeline seguros (`find -print0 \| xargs -0`) y la correcta aridad de flags, además de preferir alternativas modernas como `rg`, `fd`, `jq`, `sed`, `awk` y `tar`. El resultado es un modelo compacto y rápido, pensado para ejecutarse localmente con `llama.cpp` en un solo paso.

## Capacidades

- Conversión de lenguaje natural a comandos POSIX/Bash de una sola línea.
- Generación de comandos con restricciones de alcance (por ejemplo, solo directorios del directorio actual, no recursivo).
- Manejo seguro de nombres de archivo con caracteres especiales mediante terminadores de opción y `-print0`.
- Uso de utilidades modernas de línea de comandos (`rg`, `fd`, `jq`, `sed`, `awk`, `tar`) para tareas de búsqueda, filtrado y procesamiento.
- Soporte de formato ChatML con un prompt de sistema estricto que garantiza una única línea de salida sin explicaciones ni marcas de código.
- Inferencia local con `llama.cpp` y la CLI `howdo` (escrita en Rust).
- Compatible con el estándar `endpoints_compatible` de HuggingFace, lo que permite su uso en entornos de servidor.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede generar comandos para encontrar archivos vacíos, eliminar archivos temporales o listar procesos, ejecutándose directamente desde la terminal.
- Integración en pipelines de CI/CD: permite a los desarrolladores generar comandos de despliegue, limpieza o comprobación de forma natural sin recordar la sintaxis exacta de `sed` o `awk`.
- Asistente de línea de comandos para desarrolladores: se integra en herramientas tipo CLI (como `howdo`) para responder a preguntas del tipo "cómo comprimo este directorio excluyendo los logs" con un comando correcto.
- Educación y formación en shell: los usuarios pueden practicar la construcción de comandos complejos a partir de descripciones en lenguaje natural, con el modelo como generador de referencia.
- Generación de scripts de mantenimiento: para tareas repetitivas como renombrar archivos en lote, mover archivos por extensión o hacer backups con `tar`, el modelo produce comandos de una sola línea listos para ejecutar.
- Consultas interactivas en aplicaciones de terminal: se puede usar como componente de un chat local que responda con comandos de shell en lugar de texto libre, ideal para entornos sin interfaz gráfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Modelo GGUF Q4_K_M de 2,57 GB, por lo que cabe en tarjetas gráficas con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) o incluso en CPU con 8 GB de RAM.
- La inferencia se puede ejecutar con `llama.cpp` (compatible con CPU y GPU) o con la herramienta `howdo` que lo envuelve.
- Dado el contexto de 512 tokens y la salida limitada a una sola línea, la latencia esperada es de menos de un segundo en hardware moderno, aunque no se han publicado cifras exactas.
- Alternativas de despliegue: `llama.cpp` (a través de `llama-cli`), `Ollama` (si se convierte a formato compatible), y servidores compatibles con la API de HuggingFace `endpoints_compatible`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Sin embargo, el modelo se posiciona en la categoría de generación de comandos shell, donde existen alternativas como `ShellGPT` o `gpt-3.5-turbo` para tareas similares, pero no se han encontrado datos públicos de comparación directa.

## Limitaciones y advertencias

- Contexto limitado a 512 tokens, insuficiente para conversaciones multi-turno o peticiones complejas que requieran mayor historial.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- Genera exclusivamente comandos de una sola línea; no produce scripts multi-línea ni explicaciones adicionales.
- Riesgo de alucinación en comandos poco comunes o con sintaxis ambigua, aunque el entrenamiento con ejemplos verificados reduce este riesgo.
- No se han publicado resultados de benchmarks, por lo que se desconoce su rendimiento en tareas estándar de razonamiento o generación de código.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen3.5, que puede tener restricciones adicionales de uso según la licencia de base.
- El modelo está pensado para ejecución local; no se recomienda su uso en entornos de producción sin validación previa de los comandos generados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahsery/howdo-4b
- Repositorio de la herramienta CLI `howdo`: https://github.com/Mahsery/howdo
- Documentación de `llama.cpp` (para ejecución local): https://github.com/ggerganov/llama.cpp
