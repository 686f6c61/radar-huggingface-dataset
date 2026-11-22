# bartowski/PhaiModelLab_Phai-A1-35B-1M-GGUF

## Resumen

Phai-A1-35B-1M es un modelo multimodal (texto e imagen) de 35 mil millones de parámetros desarrollado por PhaiModelLab, orientado a tareas de programación, uso como agente y contextos largos. La ficha que nos ocupa es la versión cuantizada en formato GGUF publicada por bartowski, pensada para su ejecución con llama.cpp y compatible con entornos de inferencia locales. El nombre "1M" sugiere una ventana de contexto de un millón de tokens, aunque la model card del repositorio de cuantización no detalla este dato de forma explícita.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y declara soporte para seis idiomas: chino, inglés, japonés, árabe, ruso y alemán. El pipeline declarado es image-text-to-text, e incluye soporte de tool calling mediante un formato XML específico, además de un modo de razonamiento interno delimitado por etiquetas `<think>`.

La relevancia de esta publicación radica en que ofrece una alternativa cuantizada de un modelo de 35B con capacidades multimodales y de agente, ejecutable en hardware de consumo mediante cuantizaciones de 4 bits que ocupan entre 20 y 22 GB. El repositorio incluye cuantizaciones generadas con imatrix, lo que mejora la calidad respecto a cuantizaciones estándar en modelos de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 34.660.610.688 (aproximadamente 35B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el nombre del modelo indica 1M) |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0 |
| Idiomas soportados | chino, inglés, japonés, árabe, ruso, alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj para imagen) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (si es un transformer denso, MoE o híbrido). El conteo de parámetros real extraído de los safetensors del checkpoint original es de 34.660.610.688, lo que confirma un modelo denso de aproximadamente 35B. El pipeline image-text-to-text indica la presencia de un codificador visual acoplado, que en la distribución GGUF se sirve como fichero mmproj separado.

Los tags del modelo incluyen "rl", lo que sugiere que el entrenamiento incorporó aprendizaje por refuerzo, probablemente para alineamiento o para reforzar capacidades de razonamiento y agente. También aparecen los tags "long-context", "coding" y "agent", que indican las áreas de especialización declaradas por el autor. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como DPO o RLHF supervisado. Tampoco se documentan innovaciones arquitectónicas específicas como decodificación especulativa (la model card indica explícitamente "Speculative decoding: no") o atención lineal.

Las cuantizaciones se han generado con llama.cpp release b12600 y utilizan imatrix, una técnica que calibra la cuantización con datos de activación para preservar mejor la calidad en los pesos más sensibles.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento interno delimitado por etiquetas `<think>`.
- Generación y asistencia en código, con etiqueta "coding" declarada por el autor.
- Comprensión de imágenes junto con texto (image-text-to-text), mediante fichero mmproj.
- Tool calling y function calling con un formato XML estructurado basado en `<tool_call>` y `<function=...>`.
- Uso como agente y razonamiento multi-paso, con etiqueta "agent" declarada.
- Soporte multilingüe en chino, inglés, japonés, árabe, ruso y alemán.
- Manejo de contextos largos, con etiqueta "long-context" y nombre de modelo que apunta a 1M de tokens.
- Formato de prompt compatible con ChatML (`<|im_start|>` / `<|im_end|>`).

## Casos de uso

- Asistencia de programación en local: el modelo puede integrarse en editores o pipelines de CI/CD para revisión de código, generación de tests y explicación de fragmentos, aprovechando su especialización declarada en coding y su ventana de contexto amplia para analizar repositorios completos.
- Agentes autónomos con tool calling: gracias al formato XML documentado para llamadas a funciones, puede conectarse a APIs externas (precios de acciones, consultas a bases de datos, servicios web) en flujos multi-paso, con razonamiento previo a la llamada.
- Análisis de documentos largos con imágenes: al aceptar entrada de texto e imagen, puede procesar informes, capturas de pantalla o diagramas junto con texto extenso, útil en auditoría documental o extracción de datos.
- Atención al cliente multilingüe: con soporte para seis idiomas y contexto largo, puede mantener conversaciones multi-turno con historial extenso sin perder el hilo, en inglés, chino, japonés, árabe, ruso o alemán.
- Procesamiento de código legacy: la combinación de contexto largo y capacidad de código permite analizar bases de código antiguas, resumir módulos y proponer refactorizaciones en una sola pasada.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (22,32 GB), puede ejecutarse en estaciones de trabajo con una GPU de 24 GB o en configuraciones con memoria unificada, habilitando asistentes privados sin dependencia de la nube.
- Investigación en razonamiento: el modo `<think>` permite estudiar trazas de razonamiento y evaluar comportamiento de agentes en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20-22 GB con cuantizaciones de 4 bits (Q4_0 a Q4_K_L), 25-27 GB con Q5, 29-32 GB con Q6, 37 GB con Q8_0 y 69 GB con bf16.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6 o Q8, se necesitan A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs con 24 GB o más para cuantizaciones de 4 bits. En GPUs de 16 GB no cabe el modelo completo, aunque podría particionarse con offloading a CPU.
- Opciones de despliegue: llama.cpp (versión b12600 o superior, usada para generar las cuantizaciones), Ollama, y servidores compatibles con la API de endpoints (el tag "endpoints_compatible" lo indica). Para el modo multimodal es necesario cargar el fichero mmproj junto con el GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Phai-A1-35B-1M (esta ficha) | 35B | no disponible (1M por nombre) | Sí (texto + imagen) | Apache 2.0 | GGUF, safetensors |
| Alternativas de 30-35B densas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (35B multimodales con soporte de agente y contexto largo) para establecer una comparativa rigurosa con datos verificables.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real en tareas específicas no está validado de forma independiente.
- La arquitectura interna y los detalles de entrenamiento no están documentados en la información disponible, lo que dificulta evaluar riesgos específicos.
- Riesgo de alucinación inherente a los modelos generativos; no hay documentación sobre mitigaciones aplicadas.
- El modo de razonamiento `<think>` puede aumentar la latencia y el consumo de tokens si no se controla.
- El soporte de imagen requiere cargar el fichero mmproj por separado; sin él, el modelo funciona solo con texto.
- La ventana de contexto de 1M indicada en el nombre no está confirmada en la model card; conviene verificarla antes de diseñar flujos que dependan de ella.
- El soporte de español no está declarado entre los idiomas del modelo (solo chino, inglés, japonés, árabe, ruso y alemán), por lo que su rendimiento en castellano es incierto.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base podría tener condiciones adicionales no reflejadas en esta ficha de cuantización; conviene revisar la licencia del checkpoint original.
- El repositorio ocupa 568,4 GB por incluir todas las cuantizaciones; la descarga debe limitarse al fichero concreto necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/PhaiModelLab_Phai-A1-35B-1M-GGUF
- Modelo base: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp usada: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Cuantización recomendada Q4_K_M: https://huggingface.co/bartowski/PhaiModelLab_Phai-A1-35B-1M-GGUF/blob/main/PhaiModelLab_Phai-A1-35B-1M-Q4_K_M.gguf
