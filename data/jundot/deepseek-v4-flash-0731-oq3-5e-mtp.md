# Jundot/DeepSeek-V4-Flash-0731-oQ3.5e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ3.5e-mtp es un checkpoint cuantizado en formato MLX del modelo deepseek-ai/DeepSeek-V4-Flash-0731, publicado por el usuario Jundot. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local en hardware Apple Silicon: reduce los 304.180 millones de parámetros del modelo base a un total de 136,942 GiB en disco, con un promedio efectivo de 3,867 bits por peso. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.1) mediante precisión mixta guiada por la sensibilidad medida de cada capa.

El checkpoint incluye la espina dorsal del modelo de lenguaje (284,335B de pesos lógicos) y una cabeza MTP (multi-token prediction) de 19,846B, además del módulo de decodificación especulativa DSpark heredado del modelo base. Esa cabeza MTP no es un componente auxiliar prescindible: forma parte de la ruta de inferencia acelerada y explica buena parte del tamaño del repositorio (10,082 GiB solo en la cabeza).

Su relevancia es práctica más que arquitectónica. El modelo base se describe oficialmente como la release de DeepSeek-V4-Flash con capacidades agénticas mejoradas, y esta variante permite ejecutar esa familia de modelos en una estación de trabajo con memoria unificada, sin recurrir a clústeres de GPU. La licencia MIT facilita su integración comercial, aunque conviene tener presente que el repositorio no publica datos de contexto, idiomas soportados ni resultados de benchmarks.

La información disponible sobre el modelo base (longitud de contexto, número de parámetros activos, composición del dataset de entrenamiento) no está incluida en la model card de esta cuantización, por lo que varios apartados de esta ficha quedan marcados como no disponibles en lugar de estimarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | deepseek_v4 (transformer decoder) con cabeza MTP y módulo de decodificación especulativa DSpark; estructura idéntica a DeepSeek-V4-Flash-DSpark |
| Parámetros totales | 304.180.418.494 (~304,18B) según safetensors; 304,180B en pesos lógicos |
| Parámetros activos | no disponible (la model card no especifica si el modelo base es MoE ni su ratio de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta oQ3.5e: affine 3/4/5/6/8-bit con grupo 64, MXFP4 con grupo 32, MXFP8 con grupo 32, BF16, FP32 e I32 (3,867 bits/peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo fuente) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

Desglose de la distribución de bits, tal como la publica el autor:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 184,684B | 60,715% | 75,250 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 1,635B | 0,538% | 0,857 GiB | 4,50 |
| MXFP4, grupo 32 | 111,669B | 36,711% | 55,250 GiB | 4,25 |
| Affine 5-bit, grupo 64 | 0,497B | 0,163% | 0,318 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 2,416B | 0,794% | 1,828 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 1,078B | 0,354% | 1,067 GiB | 8,50 |
| I32 | 0,002B | 0,001% | 0,009 GiB | 32,00 |
| MXFP8, grupo 32 | 1,996B | 0,656% | 1,917 GiB | 8,25 |
| BF16 | 0,167B | 0,055% | 0,310 GiB | 16,00 |
| FP32 | 0,036B | 0,012% | 0,135 GiB | 32,00 |
| Total | 304,180B | 100% | 136,942 GiB | 3,867 |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Espina dorsal del modelo de lenguaje | 284,335B | 136,214 GB / 126,860 GiB |
| Cabeza MTP | 19,846B | 10,825 GB / 10,082 GiB |
| Total | 304,180B | 147,040 GB / 136,942 GiB |

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento alguno: es una conversión de pesos del modelo deepseek-ai/DeepSeek-V4-Flash-0731, que a su vez se describe como la release oficial de DeepSeek-V4-Flash con capacidades agénticas mejoradas. La etiqueta `deepseek_v4` y la existencia de una cabeza MTP confirman que se trata de un transformer decoder con predicción multi-token; la model card indica que la estructura es idéntica a la de DeepSeek-V4-Flash-DSpark, con un módulo de decodificación especulativa acoplado. No se especifica en la información proporcionada si el modelo base emplea mezcla de expertos, cuántos tokens vio durante el entrenamiento ni si pasó por fases de RLHF o DPO.

La innovación relevante aquí es el proceso de cuantización, no la arquitectura. oQ3.5e asigna bits según la sensibilidad medida de cada capa, y después redondea cada grupo con una matriz de importancia (1024 muestras × 512 tokens) y un reajuste por mínimos cuadrados ponderados de su escala y sesgo. El resultado es una distribución muy desigual: el 60,7% de los pesos queda en affine 3-bit, el 36,7% en MXFP4 de 4,25 bits efectivos y solo un 1,8% restante se reparte entre 5, 6, 8, 16 y 32 bits. Los pesos en precisión alta (BF16 y FP32, un 0,067% del total) corresponden presumiblemente a componentes sensibles como normalizaciones o embeddings, aunque la model card no lo detalla.

La segunda innovación es la conservación del módulo MTP junto al backbone. Al mantener la cabeza de predicción multi-token dentro del checkpoint cuantizado, la decodificación especulativa sigue disponible en local, lo que compensa parcialmente el coste de generar con pesos de baja precisión. La contrapartida es que 19,8B de parámetros (el 6,5% del total, 10,082 GiB) se dedican a este componente, un sobrecoste de almacenamiento apreciable.

## Capacidades

La model card no enumera capacidades funcionales explícitas, por lo que lo siguiente se deriva de lo que sí está documentado:

- Generación de texto: el pipeline declarado es `text-generation` y la librería es MLX.
- Capacidades agénticas heredadas: el modelo base se describe como la release de DeepSeek-V4-Flash con capacidades agénticas mejoradas, de modo que el comportamiento agéntico es esperable, aunque no se detalla su alcance.
- Decodificación especulativa activa: el checkpoint incluye el módulo DSpark MTP, lo que permite acelerar la generación mediante predicción multi-token.
- Tool calling y function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible. Las etiquetas solo mencionan `text-generation`.
- Eficiencia de memoria: al ocupar 136,942 GiB con 3,867 bits/peso efectivos, el modelo es capaz de ejecutarse en hardware que no podría alojar la versión en precisión completa.

## Casos de uso

- Inferencia local en estación de trabajo Apple: el caso de uso principal del checkpoint es ejecutar un modelo de ~304B parámetros en un Mac con memoria unificada suficiente, algo imposible con los pesos originales. El formato safetensors MLX y la etiqueta `mlx` lo sitúan directamente en este escenario.
- Desarrollo y prototipado sin conectividad: al caber en disco local (147 GB), el modelo permite trabajar en entornos aislados o con requisitos de confidencialidad de datos, sin enviar prompts a APIs externas.
- Tareas agénticas moderadas: dado que el modelo base enfatiza capacidades agénticas, un uso razonable es la orquestación de flujos con múltiples pasos donde el coste por token de una API sería prohibitivo; conviene validar primero el soporte real de tool calling.
- Evaluación comparativa de cuantizaciones: este checkpoint es útil para investigadores que quieran medir la degradación de un modelo grande al comprimirlo a 3,867 bits/peso frente a versiones de 4 u 8 bits del mismo base.
- Generación de texto de larga duración en lote: procesos batch nocturnos donde la latencia no es crítica y se prioriza el coste cero por token tras la inversión en hardware.
- Investigación en decodificación especulativa: la presencia de la cabeza MTP cuantizada permite estudiar el comportamiento de DSpark cuando el modelo draft y el verificador operan en precisión mixta.
- Despliegue en laboratorio con licencia permisiva: la licencia MIT simplifica la incorporación del modelo en productos internos o comerciales, sujeto a verificación de la licencia del modelo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no devolvió páginas relacionadas con el modelo.

## Requisitos de hardware

- Almacenamiento: 147,040 GB (136,942 GiB) solo para los pesos; conviene reservar espacio adicional para el tokenizador, la configuración y versiones temporales durante la descarga.
- Memoria unificada: al menos los 136,942 GiB de pesos más el espacio para la caché KV, que depende de la longitud de contexto (no disponible). En la práctica esto excluye cualquier equipo con menos de 192 GB de memoria unificada.
- Equipos compatibles: Mac Studio con M3 Ultra en configuraciones de 256 GB o 512 GB; un MacBook Pro con M4 Max (máximo 128 GB) no es suficiente. No se dispone de datos para otros chip.
- GPU dedicadas: la librería declarada es MLX, orientada a Apple Silicon, por lo que no se documenta una ruta de despliegue con CUDA en esta model card.
- Opciones de despliegue: MLX con la librería oMLX del mismo autor, que incluye la herramienta de cuantización oQ. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el formato es safetensors MLX y no GGUF.
- Latencia y throughput: no disponibles. La presencia del módulo MTP sugiere ganancias por decodificación especulativa, pero el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/DeepSeek-V4-Flash-0731-oQ3.5e-mtp | 304,180B (3,867 bits/peso) | no disponible | oQ3.5e mixta MLX | MIT | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | no disponible | no disponible | precisión completa (no especificada) | MIT según el checkpoint derivado | HuggingFace |
| DeepSeek-V4-Flash-DSpark | no disponible | no disponible | no disponible | no disponible | referenciado como estructura idéntica |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible en la información consultada |

La comparativa cuantitativa no es posible con los datos disponibles: la model card del checkpoint no incluye cifras del modelo base, y no se han encontrado en la búsqueda web páginas de modelos alternativos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Degradación por cuantización: el 60,7% de los pesos está en 3 bits, el punto más agresivo del esquema. No se han publicado evaluaciones que cuantifiquen la pérdida de calidad frente al modelo base, lo que constituye el riesgo principal para uso en producción.
- Ausencia total de benchmarks: no hay ninguna métrica publicada, ni del checkpoint ni del modelo base en esta documentación, por lo que cualquier afirmación sobre su rendimiento sería especulativa.
- Contexto desconocido: sin la longitud de contexto no se puede planificar el dimensionado de la caché KV ni determinar si el modelo sirve para tareas de documento largo.
- Idiomas no declarados: no se especifica si el castellano está bien cubierto; en modelos de esta familia el rendimiento multilingüe suele ser desigual.
- Riesgo de alucinación: no disponible en la información proporcionada, pero es inherente a los modelos generativos de esta escala y debe mitigarse con verificación externa.
- Sesgos: no disponible. El repositorio no incluye ninguna model card de sesgos ni evaluación de seguridad.
- Restricciones de licencia: MIT en este checkpoint, heredada del modelo fuente. Conviene verificar la licencia del modelo base de forma independiente, ya que la model card del derivado la asume pero no la reproduce.
- Compatibilidad de despliegue limitada: el formato MLX/safetensors restringe el uso a Apple Silicon; no hay conversiones a GGUF documentadas en esta ficha, lo que limita su uso en servidores con GPU NVIDIA o AMD.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado con 39 segundos de diferencia el 11 de octubre de 2026. Es un artefacto reciente, sin validación por parte de la comunidad.
- Procedencia de la búsqueda web: los resultados obtenidos no guardan ninguna relación con el modelo (contenido de redes sociales y vídeos), por lo que no aportan validación externa alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ3.5e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Resultados de la búsqueda web: ninguno relevante; las páginas devueltas tratan sobre una creadora de contenido y no guardan relación con el modelo.
