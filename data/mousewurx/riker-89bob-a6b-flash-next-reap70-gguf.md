# MouseWurX/Riker-89Bob-A6B-Flash-Next-REAP70-GGUF

## Resumen

Riker 89Bob A6B Flash-Next REAP70 es una versión podada por expertos del modelo Qwen/Qwen3.8-Flash-Next, publicada por MouseWurX en formato GGUF. Se trata de un recorte REAP (router-weighted expert activation pruning) que elimina 153 de los 512 expertos de cada una de las 48 capas del modelo base, conservando 359 expertos por capa (un 70 %). El resultado es un modelo de aproximadamente 88,9B parámetros frente a los 125B del original, sin reentrenamiento ni reparación posterior de los pesos.

El modelo forma parte del proyecto Bob, un asistente personal que se ejecuta en local (chat, correo, ofimática, código y consultas web) con un modelo como cerebro y sin envío de datos al exterior salvo activación explícita. El objetivo declarado de la saga de recortes (Bobert al 80 %, Riker al 70 % y Bill al 60 %) es conservar las capacidades del Flash-Next completo en un equipo doméstico con 16 GB de VRAM y 32 GB de RAM.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de podado de MoE basada en puntuaciones ponderadas por el router en lugar de meros recuentos de activación; por otro, ilustra las dificultades prácticas de cuantizar modelos con dimensiones de fila no múltiplas de 256 en llama.cpp, que obligan a tamaños de fichero superiores a los que sugieren los nombres de las cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capa MTP (multi-token prediction) y embedding n-grama; 48 capas, 512 expertos por capa en el modelo base |
| Parametros totales | 205.258.854 (según safetensors del repo); el autor declara ~88,9B tras el podado, sin contar el embedding n-grama ni la capa MTP |
| Parametros activos | no disponible (el modelo base es MoE; el número de expertos activos por token no se detalla en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones tipo k e i-quant de llama.cpp, más IQ2 con Q2_0 para las proyecciones down; tipos de 32 anchos (4-5 bits) para down projections en el resto y ~4,5 bits para el embedding n-grama; nombres de fichero no publicados (tabla de tamaños vacía) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF (re-cuantizado desde Q8_0 de unsloth/Qwen3.8-Flash-Next-GGUF, no desde BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 48 capas y 512 expertos por capa, al que se le añaden una capa MTP (draft) para decodificación especulativa y un embedding n-grama de 51B parámetros. El podado REAP conserva en cada capa los 359 expertos con mayor puntuación, calculada como la frecuencia con que el router selecciona cada experto multiplicada por su peso de router y por el tamaño de su salida, sumada sobre todos los tokens de las ejecuciones limpias. La lista del 70 % se construyó a partir de la lista del 65 % más, en cada capa, los 26 expertos de la banda entre los percentiles 65 y 75 que más veces fueron seleccionados. En la capa 47 solo unos 30 expertos acumulaban peso real, por lo que el resto de la lista se completó por número de experto. La capa MTP conserva los expertos seleccionados con más frecuencia en el resto de capas; el experto compartido y todo lo ajeno a los expertos permanecen intactos.

Los datos de selección provinieron de 153 ejecuciones limpias del Flash-Next completo (Unsloth UD-Q4_K_XL) realizadas a través del bucle de herramientas de Bob: clasificación y respuesta de correo, creación y edición de archivos ofimáticos y trabajo en proyectos de código. Solo se conservaron las ejecuciones que superaron la evaluación. Los conjuntos de trabajo usados para juzgar el modelo se mantuvieron separados y nunca se emplearon para puntuar expertos. Los ficheros GGUF se generaron cortando los slices de experto completos del Q8_0 con `gguf_cut_experts.py` y cuantizando después con `llama-quantize` usando la imatrix del repo (`imatrix.gguf`), derivada de los chats de entrenamiento propios del autor y no de los trabajos de evaluación. No hubo reentrenamiento ni "healing" de los pesos tras el corte.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.8-Flash-Next, con la pérdida de capacidad asociada al recorte de expertos.
- Trabajo con correo electrónico: clasificación, búsqueda y redacción de respuestas dentro del bucle de herramientas de Bob.
- Manejo de archivos ofimáticos: creación y edición de documentos, hojas de cálculo y presentaciones.
- Trabajo en proyectos de código: navegación de repositorios y edición de código, evaluado en el conjunto "Code repo".
- Consultas web y uso de aplicaciones a través del bucle de herramientas del asistente.
- Soporte de tool calling y de razonamiento multi-paso, implícito en el diseño del asistente Bob que lo emplea.
- Decodificación especulativa mediante la capa MTP conservada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente personal local de escritorio: el modelo está diseñado para ejecutarse en un equipo con 16 GB de VRAM y 32 GB de RAM, gestionando conversaciones, correo y archivos sin enviar datos a servicios externos, lo que lo hace adecuado para entornos con requisitos de privacidad.
- Gestión de bandeja de entrada: clasificación y búsqueda de correos relevantes con una tasa de acierto del 79-92 % según el nivel de conservación de expertos en las pruebas del autor; útil para triaje automático en local.
- Automatización ofimática: generación y edición de documentos y hojas de cálculo mediante tool calling, con un rendimiento de 13 de 14 tareas en el conjunto de evaluación del autor.
- Asistencia a la programación en local: edición y navegación de repositorios de código con 12 de 12 tareas superadas en la evaluación del autor, integrable en flujos de trabajo de desarrollo sin conexión.
- Investigación sobre podado de MoE: el repo incluye `keep.json` con los identificadores de experto conservados por capa, lo que permite reproducir el recorte y comparar estrategias de selección.
- Despliegue en hardware de consumo: al ser GGUF y funcionar en llama.cpp, puede ejecutarse con memory mapping del embedding n-grama, leyendo desde disco las filas consultadas y liberando RAM y VRAM para el resto del modelo.
- Experimentación con cuantizaciones no estándar: sirve como caso de estudio de las limitaciones de llama.cpp con filas no múltiplas de 256 y de las soluciones adoptadas (Q2_0 en grupos de 64 para las down projections).

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones propias del autor sobre conjuntos de trabajo reservados (held-out) de Bob, con el modelo base Flash-Next UD-Q4_K_XL y máscaras de experto aplicadas en tiempo de servicio, no sobre los ficheros GGUF podados. Se indica una ejecución por nivel.

| Expertos conservados | Office (de 14) | Code repo (de 12) | Web (de 11) | Inbox (correos correctos) | Acciones dañinas |
|---|---|---|---|---|---|
| 100 % | 13 | 12 | 8 | 85,0 % | 0 |
| 90 % | 13 | 12 | 9 | 92,7 % | 0 |
| 80 % | 12 | 12 | 9 | 92,2 % | 0 |
| 75 % | 13 | 10 | 8 | 90,8 % | 1 |
| 65 % | 13 | 12 | 9 | 79,0 % | 0 |
| 60 % | 13 | 12 | 8 | 79,6 % | 0 |
| 50 % | 9 | 11 | 9 | 85,7 % | 0 |

El nivel del 70 % no se ejecutó como máscara, por lo que sus puntuaciones no están probadas en el laboratorio del autor según la propia model card. En pruebas adicionales al 80 %, la lista específica del conjunto Office obtuvo 13 de 14 frente a 12 de la lista construida con todos los trabajos; una lista fusionada de ambas corrigió una búsqueda de archivo pero agotó el tiempo en 3 tareas. Redirigir la cuota de cada experto desactivado a su experto conservado más similar perdió claramente en la bandeja de entrada (64 de 117 correos encontrados). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el objetivo declarado es un equipo con 16 GB de VRAM y 32 GB de RAM; el embedding n-grama (~29 GB en tipo de 32 anchos) se lee desde disco con memory mapping y no consume RAM ni VRAM, por lo que el resto del fichero es lo que debe caber.
- GPU recomendadas: no se especifican modelos concretos; el diseño apunta a tarjetas de consumo con 16 GB (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) o superiores.
- Cabe en GPU de consumo: sí, según el objetivo del proyecto, con 16 GB de VRAM y 32 GB de RAM del sistema.
- Opciones de despliegue: llama.cpp, en compilaciones que ejecuten Qwen/Qwen3.8-Flash-Next; compatible con el ecosistema GGUF (Ollama y otros frontends basados en llama.cpp de forma implícita, aunque no se mencionan explícitamente).
- Latencia y throughput: no disponibles. La decodificación especulativa mediante la capa MTP puede reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Riker 89Bob A6B Flash-Next REAP70 | ~88,9B (205.258.854 según safetensors) | no disponible | qwen-community-1.0 | GGUF | 70 % de expertos conservados, sin reentrenamiento |
| Qwen/Qwen3.8-Flash-Next (base) | 125B (sin embedding n-grama ni MTP) | no disponible | qwen-community-1.0 | safetensors, GGUF (vía Unsloth) | Modelo completo, 512 expertos por capa |
| Bobert (recorte al 80 %) | no disponible | no disponible | qwen-community-1.0 | GGUF | Misma metodología, 80 % de expertos |
| Bill (recorte al 60 %) | no disponible | no disponible | qwen-community-1.0 | GGUF | Misma metodología, 60 % de expertos |

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- El recorte se realizó sin reentrenamiento ni reparación de pesos: el modelo puede degradarse en tareas distintas de las usadas para puntuar expertos (correo, ofimática, código y web).
- Los conjuntos de evaluación son propios del autor, pequeños (11-14 tareas por categoría) y con una sola ejecución por nivel; la significación estadística es limitada.
- El nivel del 70 % no se probó como máscara antes del corte, por lo que su rendimiento en los conjuntos reservados no está verificado en el laboratorio del autor.
- El nivel del 75 % produjo una acción dañina (eliminación de un correo que requería respuesta), lo que indica riesgo de comportamientos erróneos en tareas de gestión de correo.
- Los ficheros son más grandes de lo que sugieren sus nombres de cuantización debido a las filas de 640 y 160 anchos que no admiten tipos k/i-quant de 256; el embedding n-grama ocupa ~29 GB en todos los ficheros.
- Al estar re-cuantizados desde Q8_0 y no desde BF16, se acumula la pérdida de la cuantización intermedia.
- Licencia qwen-community-1.0: es necesario revisar sus términos para uso comercial; la model card la etiqueta como "other".
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero presentes en cualquier modelo de lenguaje y potencialmente amplificados por el podado.
- El repo tiene 0 descargas y 0 likes, y la tabla de tamaños de fichero está vacía ("uploading"), lo que sugiere que los pesos pueden no estar completamente disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/Riker-89Bob-A6B-Flash-Next-REAP70-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Proyecto Bob (código y notas): https://github.com/MouseWurX/Bob
- Dataset bob-lessons: https://huggingface.co/datasets/MouseWurX/bob-lessons
- Paper REAP (Lasby et al. 2025): no disponible como enlace en la información proporcionada
