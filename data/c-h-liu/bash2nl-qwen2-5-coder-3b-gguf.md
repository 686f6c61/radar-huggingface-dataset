# C-H-Liu/bash2nl-qwen2.5-coder-3b-GGUF

## Resumen

bash2nl-qwen2.5-coder-3b-GGUF es un ajuste fino QLoRA del modelo Qwen/Qwen2.5-Coder-3B-Instruct, publicado por el usuario C-H-Liu, cuya única tarea es traducir una línea de comandos de Bash a una frase en inglés que la explique. El modelo no es un asistente conversacional general: está especializado en generar exactamente una oración en inglés, formulada como una instrucción que empieza por un verbo (por ejemplo, `find . -name "*.py"` se traduce como "Find all *.py files/directories under current directory"). El resultado del entrenamiento se ha fusionado con los pesos base y se distribuye cuantizado en formato GGUF q4_K_M, listo para llama.cpp y Ollama.

El modelo parte de la arquitectura Qwen2.5-Coder-3B-Instruct, un transformer decoder-only denso de 3.085.938.688 parámetros (unos 3,09 mil millones), por lo que cabe en hardware de consumo. El repositorio pesa 1,9 GB. El autor fija en el Modelfile una decodificación determinista (temperature 0.0, top_k 1, top_p 1.0, repeat_penalty 1.0, num_predict 96, num_ctx 4096) y dos secuencias de parada (`<|im_end|>` y `<|endoftext|>`), de modo que el modelo produce siempre una única frase corta (media de 11,9 palabras en la evaluación publicada).

Su relevancia práctica es la de un componente pequeño y barato para tareas de documentación de shell: explicar comandos en documentación técnica, generar comentarios para scripts, alimentar ayudas en terminal o etiquetar corpus de comandos. La información pública del repositorio es limitada (0 descargas y 0 likes en el momento de la consulta, ficha creada el 18 de septiembre de 2026) y la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo o su proyecto asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen/Qwen2.5-Coder-3B-Instruct (no se detallan capas, cabezas ni tipo de atención en la información disponible) |
| Parametros totales | 3.085.938.688 (≈3,09 B) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | 4096 tokens, valor fijado como `num_ctx` en el Modelfile del repositorio; el contexto nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | GGUF q4_K_M (versión publicada); la tabla de evaluación menciona además una variante "qlora f16" |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Metadatos de HuggingFace: `other` / `qwen-research` (con enlace a la licencia del modelo base). El README afirma Apache-2.0. Existe discrepancia entre ambas declaraciones |
| Formato de pesos | GGUF para llama.cpp, con `Modelfile` incluido para Ollama |
| Modelo base | Qwen/Qwen2.5-Coder-3B-Instruct |
| Tarea (pipeline) | text-generation (uso real: traducción Bash → lenguaje natural, "bash2nl") |
| Tamaño del repositorio | 1.9 GB |
| Idioma de salida | Una única oración en inglés, empezando por un verbo |
| Decodificación fijada | temperature 0.0, top_k 1, top_p 1.0, repeat_penalty 1.0, num_predict 96, num_ctx 4096 |
| Secuencias de parada | `<|im_end|>`, `<|endoftext|>` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de unos 3,09 mil millones de parámetros, perteneciente a la familia Qwen2.5-Coder. Sobre esos pesos, el autor aplicó un ajuste fino con QLoRA, es decir, entrenamiento con cuantización de los pesos base y adaptadores de bajo rango. Posteriormente, los adaptadores se fusionaron con el modelo base y el resultado se convirtió a GGUF con cuantización q4_K_M. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros del ajuste (rango LoRA, alpha, tasa de aprendizaje, épocas).

El único dato sobre procedencia de datos que ofrece la model card es que el corpus de entrenamiento proviene del proyecto nl2bash, y remite a ese proyecto para consultar los términos asociados al corpus. La tarea aprendida está fuertemente restringida: dada una línea de comandos de Bash, el modelo debe producir exactamente una oración en inglés en forma de instrucción que comience por un verbo. Este formato de salida tan acotado, junto con la decodificación determinista, reduce la varianza de las respuestas y explica la reducción de la longitud media de salida de 18,5 palabras (modelo base) a 11,9 palabras (modelo ajustado).

No se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos ni mecanismos híbridos) en la información disponible.

## Capacidades

- Traducción de comandos Bash a lenguaje natural: genera una única oración en inglés que describe qué hace la línea de comandos, por ejemplo `find . -name "*.py"` → "Find all *.py files/directories under current directory".
- Salida con formato muy controlado: una sola frase, empezando por un verbo, con una media de 11,9 palabras según la evaluación publicada.
- Interpretación de comandos con tuberías, redirecciones y composición, como demuestra el ejemplo de la model card: `ps -ef | grep nginx | awk "{print \$2}" | xargs kill -9`.
- Generación de texto determinista: con temperature 0.0 y top_k 1 fijados, la misma entrada produce la misma salida, algo adecuado para documentación reproducible.
- Despliegue local ligero: el formato GGUF q4_K_M permite ejecución en CPU, llama.cpp y Ollama sin GPU dedicada.
- Soporte de conversación en el plano formal: la ficha del modelo incluye la etiqueta `conversational` y el formato de plantilla del modelo base con tokens `<|im_end|>`, aunque el fine-tune está orientado a una tarea única.
- Idiomas: únicamente inglés. No hay evidencia de capacidades multilingües en la información disponible.
- No hay información disponible sobre soporte de tool calling o function calling, razonamiento multi-paso, capacidades de agente, visión, audio o modo de pensamiento explícito. El modelo es de texto y de propósito muy específico.

## Casos de uso

- Documentación automática de scripts de shell: integrar el modelo en un script de CI que recorra un repositorio de Bash, extraiga cada línea de comando relevante y genere una descripción de una frase para incluirla en el README o en las páginas de manual. Con solo 3,09 B de parámetros y cuantización q4_K_M, el coste por comando es mínimo.
- Aumento de datos para datasets de texto-a-Bash: usar el modelo como generador de descripciones cuando se dispone de pares comando→descripción incompletos, aprovechando su BLEU de 32,30 y chrF de 50,39 en el conjunto de evaluación del autor.
- Ayuda en terminal y "explain this command": empaquetar el modelo en una utilidad local (por ejemplo, un alias que envíe la última línea del historial a Ollama y devuelva la explicación) para desarrolladores que se enfrentan a comandos complejos o heredados.
- Revisión de scripts en auditorías: alimentar pipelines de revisión de código con comandos Bash ofuscados o poco legibles y obtener una descripción en lenguaje natural que un revisor humano pueda evaluar rápidamente. Al ser determinista, los resultados son reproducibles entre ejecuciones.
- Formación y material didáctico de Linux: generar explicaciones breves y uniformes de comandos para cursos, tutoriales o documentación interactiva, con un formato constante de una sola frase que encaja bien en plantillas.
- Análisis de historiales de shell: procesar ficheros `.bash_history` de un parque de máquinas y producir resúmenes legibles de la actividad para tareas de soporte o forense, explotando su tolerancia a tuberías y composiciones.
- Etiquetado ligero en el borde (edge): desplegar el GGUF en un servidor pequeño o incluso en CPU dentro de la misma máquina donde se gestionan los scripts, evitando enviar contenido potencialmente sensible a APIs externas.
- Preprocesado de herramientas de autocompletado: usar la descripción generada como contexto adicional para un asistente de terminal de mayor tamaño, actuando este modelo como componente especializado y barato.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 920 comandos reservados (held-out). La columna de juez corresponde a `claude-sonnet-5` evaluando un subconjunto fijo de 200 comandos. Los resultados son los siguientes:

| Metrica | 3B base | 3B qlora f16 | 3B qlora q4_K_M sin ejemplos | Este modelo (q4_K_M) | 7B qlora q4_K_M |
|---|---|---|---|---|---|
| BLEU | 13,49 | 32,04 | 32,04 | 32,30 | 33,49 |
| chrF | 43,12 | 50,85 | 50,81 | 50,39 | 52,21 |
| ROUGE-L | 37,58 | 51,91 | 51,37 | 51,19 | 53,24 |
| Juez: acceptable+ | 0,785 | 0,890 | 0,825 | 0,875 | 0,890 |
| Juez: wrong | 0,215 | 0,110 | 0,175 | 0,125 | 0,110 |
| Palabras medias | 18,5 | 11,8 | 11,9 | 11,9 | 12,4 |

La cuantización q4_K_M apenas degrada las métricas frente a la versión f16 (BLEU 32,30 frente a 32,04; chrF 50,39 frente a 50,85; ROUGE-L 51,19 frente a 51,91) y mejora ligeramente la tasa de respuestas aceptables según el juez (0,875 frente a 0,890 en f16, es decir, ligeramente peor). Frente a la variante de 7B con el mismo esquema de cuantización, este modelo de 3B queda entre 1,2 y 2 puntos por debajo en BLEU, chrF y ROUGE-L, con una tasa de respuestas incorrectas algo mayor (0,125 frente a 0,110).

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con la cuantización q4_K_M publicada: aproximadamente 2,5-3 GB contando pesos (fichero de 1,9 GB) y caché KV para 4096 tokens de contexto. Estimación derivada del tamaño del repositorio, no publicada por el autor.
- VRAM estimada para la variante f16 citada en la evaluación: unos 6-7 GB, dado que 3,09 B de parámetros en FP16 ocupan alrededor de 6,2 GB. Estimación, no dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM sirve para q4_K_M (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para despliegues con muchas peticiones concurrentes, una A100 o H100 estarían sobredimensionadas para este tamaño; el modelo está pensado para ejecución local.
- Compatibilidad con GPU de consumo: sí. Es uno de los puntos fuertes del modelo: cabe en GPUs de gama de entrada y también en CPU.
- Ejecución sin GPU: viable mediante llama.cpp u Ollama en CPU; el modelo es lo bastante pequeño para funcionar incluso en equipos de gama baja o single-board computers, aunque el throughput no está documentado.
- Opciones de despliegue: llama.cpp, Ollama (el repositorio incluye el `Modelfile`, con la receta `ollama create bash2nl-3b -f Modelfile`), servidores compatibles con GGUF (llama.cpp server, LM Studio, text-generation-webui) y cualquier runtime que consuma GGUF. Para vLLM o TGI sería preferible partir de los pesos safetensors del modelo base más los adaptadores, ya que esas herramientas tienen soporte limitado de GGUF; no hay confirmación en la información disponible de que el autor publique safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad en la tarea (BLEU / juez acceptable+) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo: bash2nl-qwen2.5-coder-3b-GGUF (q4_K_M) | 3,09 B | 4096 tokens (num_ctx del Modelfile) | 32,30 / 0,875 | qwen-research según metadatos; el README indica Apache-2.0 | GGUF en HuggingFace, 0 descargas |
| Variante 7B qlora q4_K_M citada en la evaluación | No disponible (7 B según el nombre) | No disponible | 33,49 / 0,890 | No disponible | No se indica repositorio en la información proporcionada |
| Qwen/Qwen2.5-Coder-3B-Instruct (modelo base sin ajustar) | 3,09 B | El contexto nativo del base no está en la información proporcionada | 13,49 / 0,785 | Apache-2.0 según el README, licencia Qwen según el enlace del autor | Público en HuggingFace |
| Misma tarea con un modelo general de instrucciones (por ejemplo, un LLM grande) | No disponible | No disponible | No hay medición en la información proporcionada | No aplica | No aplica |

La comparación con modelos de propósito general no puede hacerse con datos, porque el autor solo compara contra sus propias variantes (3B base, 3B QLoRA en f16, 3B QLoRA q4_K_M sin ejemplos y 7B QLoRA q4_K_M). El salto de calidad más relevante es el del modelo base al ajustado: BLEU pasa de 13,49 a 32,30 y la tasa de respuestas incorrectas según el juez baja de 0,215 a 0,125.

## Limitaciones y advertencias

- Ámbito de uso extremadamente estrecho: el modelo solo explica comandos de Bash en una frase inglesa. No es un asistente general y no debe emplearse para conversación abierta, generación de código, matemáticas o razonamiento.
- Idioma único: únicamente inglés. No hay evidencia de soporte para castellano ni para otras lenguas, ni para explicaciones en otros idiomas distintos del inglés.
- Riesgo de alucinación en los detalles: al ser un modelo de 3,09 B, puede describir incorrectamente opciones, rutas o efectos secundarios de comandos poco frecuentes u ofuscados. La métrica de juez "wrong" del 0,125 implica que aproximadamente una de cada ocho respuestas fue considerada incorrecta en el subconjunto evaluado.
- Evaluación limitada: la puntuación del juez procede de un subconjunto fijo de 200 comandos evaluado por `claude-sonnet-5`, un juez automático con posibles sesgos. No hay evaluación humana publicada ni comparación con modelos externos.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible. Al estar entrenado sobre corpus de comandos, puede reflejar las convenciones y el estilo de ese corpus concreto (proyecto nl2bash).
- Ambigüedad de licencia: los metadatos de HuggingFace declaran `license: other` con `license_name: qwen-research`, mientras que el README afirma Apache-2.0. La licencia qwen-research puede imponer restricciones al uso comercial en función del territorio o del tipo de producto, por lo que conviene verificar el enlace de licencia antes de utilizarlo en producción. Esta discrepancia es un riesgo jurídico relevante.
- Términos del corpus de entrenamiento: la model card remite al proyecto nl2bash para conocer las condiciones de los datos de entrenamiento, que son independientes de la licencia de los pesos.
- Contexto limitado: la decodificación está configurada con num_ctx 4096. Comandos o entradas que superen esa longitud no serán procesados correctamente con la configuración publicada.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, y la búsqueda web no ha encontrado referencias independientes. No hay evidencia de uso en producción ni de revisión por terceros.
- Uso responsable en seguridad: el modelo puede explicar comandos destructivos o maliciosos (por ejemplo, borrados recursivos o terminación forzada de procesos) sin advertir de su peligro. No debe usarse como capa de seguridad ni como sustituto de una revisión humana en pipelines que ejecuten comandos automáticamente.
- Adecuación al castellano de la ficha: los ejemplos y las salidas del modelo están en inglés; cualquier integración en un producto en castellano requerirá una capa de traducción adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/C-H-Liu/bash2nl-qwen2.5-coder-3b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia enlazada por el autor (Qwen2.5-Coder-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Proyecto nl2bash (origen de los datos de entrenamiento): no se proporciona URL en la información disponible
- Paper, blog técnico, repositorio de código o demo: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su autor; los resultados obtenidos corresponden a páginas no relacionadas (Zhihu, Baidu Jingyan) y se han descartado.
