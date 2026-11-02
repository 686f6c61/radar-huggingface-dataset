# mlboydaisuke/MiniCPM-V-4-litert-gpu-bug-evidence

## Resumen

Este repositorio no contiene un modelo entrenado, sino un conjunto de evidencias para un informe de error (*bug report*) sobre el backend GPU de LiteRT-LM 0.19.0. El autor, `mlboydaisuke`, documenta un fallo reproducible en un Pixel 11 Pro (GPU PowerVR con OpenCL) al ejecutar el decodificador de texto de MiniCPM-V-4 con pesos cuantizados a int8: cuando el prompt se prellena mediante `prefill_64` o `prefill_256`, el modelo responde de forma desalineada respecto al prompt. Con `prefill_16` o con una compilación int4 del mismo decodificador, la salida es correcta.

El valor técnico del artefacto es doble. Por un lado, aísla un problema de delegación en el backend GPU de LiteRT-LM que afecta a la ruta de prefill con longitudes concretas, un dato relevante para quien despliegue modelos multimodales en dispositivos Android con aceleración OpenCL. Por otro, sirve como plantilla de reproducibilidad: incluye las doce peticiones exactas, tablas con las respuestas de cada variante y el entorno de ejecución detallado.

No se publican pesos, arquitectura completa, número de parámetros ni resultados de benchmarks del modelo MiniCPM-V-4 en sí. Todo lo que sigue se limita a lo descrito en la model card y en los ficheros adjuntos citados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio documenta el decodificador de texto de MiniCPM-V-4, sin detallar su arquitectura) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (variante con fallo) e int4 (variante correcta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los ficheros de modelo, de 4,6 GB y 3,0 GB, no están en el repositorio) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni sobre el proceso de entrenamiento del modelo subyacente. El repositorio se centra en el *runtime* de inferencia: LiteRT-LM 0.19.0 ejecutándose sobre el backend GPU de un Pixel 11 Pro con GPU PowerVR y OpenCL. El objeto de estudio es la ruta de prefill del decodificador de texto de MiniCPM-V-4 en dos variantes de cuantización (int8 e int4) y tres longitudes de prefill (`prefill_16`, `prefill_64`, `prefill_256`).

La innovación técnica del artefacto es metodológica: un diseño factorial que cruza cuantización y longitud de prefill para aislar la condición que dispara la desalineación. Según la model card, el fallo aparece con pesos int8 y prefill de 64 o 256, mientras que int8 con prefill de 16 e int4 en cualquier condición probada producen respuestas correctas, lo que apunta a una interacción entre la delegación GPU y el tamaño del bloque de prefill más que a un problema general de cuantización.

## Capacidades

- Reproducción de un fallo de inferencia: doce prompts de solo texto con los que verificar la desalineación de respuestas en distintas configuraciones de prefill y cuantización.
- Documentación de entorno: tabla con ficheros y entorno de ejecución, más líneas de delegación del backend GPU.
- Aislamiento de variables: comparación directa entre `prefill_16`, `prefill_64` y `prefill_256`, y entre compilaciones int8 e int4.
- Trazabilidad de respuestas: tabla con la réplica de cada variante para cada prompt.
- No incluye capacidades de generación propias: no hay pesos ni pipeline de inferencia publicados en el repositorio.

## Casos de uso

- Depuración de LiteRT-LM en Android: usar los doce prompts y las tablas de respuestas para reproducir el fallo en otros dispositivos PowerVR/OpenCL y confirmar si la desalineación depende del hardware o del runtime.
- Validación de compilaciones cuantizadas: comparar una build int8 con una int4 del mismo decodificador para decidir qué variante desplegar en producción mientras el fallo no esté corregido.
- Selección de parámetros de prefill: emplear el contraste entre `prefill_16`, `prefill_64` y `prefill_256` para fijar una longitud de prefill segura en pipelines de inferencia en dispositivo.
- Informe de error reproducible: reutilizar la estructura (prompts en JSON, tablas de resultados, entorno y delegación) como plantilla para reportar fallos en otros backends de aceleración.
- Evaluación de regresiones entre versiones de LiteRT-LM: conservar este conjunto como prueba de humo al actualizar el runtime y comprobar si el comportamiento cambia.
- Investigación de delegación GPU: analizar las líneas de delegación incluidas para estudiar qué operadores se ejecutan en GPU y cuáles caen a CPU en cada configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye únicamente comparaciones cualitativas de corrección de respuestas (correcta o desalineada) entre las seis combinaciones de cuantización y longitud de prefill, sin métricas de latencia, throughput ni precisión.

## Requisitos de hardware

- Entorno documentado: Pixel 11 Pro con GPU PowerVR y backend OpenCL, LiteRT-LM 0.19.0.
- Los pesos no están incluidos: el autor indica que los ficheros de 4,6 GB (presumiblemente int8) y 3,0 GB (presumiblemente int4) se pueden compartir bajo petición.
- VRAM/RAM estimada: no disponible; los tamaños de fichero (4,6 GB y 3,0 GB) dan una cota inferior del espacio de almacenamiento necesario.
- GPU recomendadas: no disponible; el único hardware probado según la model card es la GPU PowerVR del Pixel 11 Pro.
- Despliegue: LiteRT-LM 0.19.0 con backend GPU OpenCL; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo desplegable, sino evidencias de un fallo de runtime, por lo que no procede compararlo con modelos de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni código de inferencia: es un conjunto de evidencias, no un modelo utilizable.
- El fallo descrito está acotado a una combinación concreta (LiteRT-LM 0.19.0, backend GPU OpenCL, Pixel 11 Pro, pesos int8, prefill de 64 o 256); no se documenta su alcance en otros dispositivos, versiones del runtime u otros modelos.
- La model card no detalla la arquitectura, el número de parámetros ni el contexto del modelo MiniCPM-V-4 subyacente.
- No se especifican sesgos, comportamiento multilingüe ni riesgos de alucinación del modelo original.
- La licencia Apache 2.0 se aplica a los ficheros de este repositorio; los pesos del modelo original pueden regirse por condiciones distintas, no indicadas aquí.
- Los tamaños de fichero (4,6 GB y 3,0 GB) se citan sin confirmar a qué cuantización corresponde cada uno.
- Para producción, conviene tratar la variante int8 con prefill largo como no fiable hasta que el fallo esté corregido o confirmado como específico de este hardware.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlboydaisuke/MiniCPM-V-4-litert-gpu-bug-evidence
