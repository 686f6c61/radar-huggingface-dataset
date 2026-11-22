# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF es una colección de cuantizaciones GGUF con calibración imatrix del modelo xtools-at/Qwen3.8-27B-CodeForge-3xMerge, publicada por mradermacher. El modelo subyacente es un merge de tres variantes de la familia Qwen3.8 orientado a generación de código, razonamiento y uso agéntico de herramientas, con 27.320.697.856 parámetros (unos 27,3 mil millones) según los pesos en safetensors. La licencia es Apache 2.0 y los idiomas declarados en la model card son inglés (en) y chino (zh).

Este repositorio no aporta pesos nuevos: ofrece los mismos pesos base convertidos a formato GGUF y cuantizados con distintos niveles de compresión (desde i1-Q2_K de 11,0 GB hasta i1-Q6_K de 22,5 GB), además de un fichero imatrix para que el usuario pueda generar sus propias cuantizaciones. Es relevante para quien quiera ejecutar el modelo en CPU, GPU de consumo o entornos con memoria limitada mediante llama.cpp u Ollama, sin depender de infraestructura de GPU de datacenter.

La ficha se centra en lo que la información disponible permite afirmar con certeza: tamaño, licencia, formato, cuantizaciones y etiquetas declaradas. Los detalles sobre arquitectura interna, longitud de contexto, datos de entrenamiento y rendimiento medido no están documentados en el material proporcionado y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3.8 / qwen3_8; detalles internos no documentados en la informacion disponible) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de las etiquetas de la model card, que lo asocian a la familia Qwen3.8 y a un proceso de merge de tres modelos (3xMerge). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o destilación; la etiqueta "distillation" figura entre los tags, pero sin detalle sobre su aplicación.

Lo que sí está documentado es el proceso de cuantización de este repositorio: mradermacher ha generado cuantizaciones ponderadas con imatrix (indicadas con el prefijo i1-) a partir del modelo base, empleando un fichero imatrix propio (0,1 GB) que puede reutilizarse para crear cuantizaciones adicionales. Según las notas del autor, las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar; por ejemplo, i1-IQ3_S (12,7 GB) "beats Q3_K*" e i1-IQ3_M (12,9 GB) se sitúa como alternativa a i1-Q3_K_M (13,6 GB). El autor también publica cuantizaciones estáticas en un repositorio separado.

## Capacidades

- Generación de código y code-generation, según los tags del modelo base.
- Razonamiento (reasoning) y modo de pensamiento eficiente (efficient-thinking), declarados en los tags.
- Uso agéntico y tool calling / function calling (tags "agentic" y "tool-use").
- Seguimiento de instrucciones (instruction-following).
- Conversación multi-turno (tag "conversational").
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistencia de programación en local: el modelo puede emplearse para autocompletar, explicar y refactorizar código en un IDE o editor, ejecutándose con llama.cpp u Ollama sobre una estación de trabajo con GPU de consumo, gracias a las cuantizaciones de 15-17 GB (i1-Q4_K_M, i1-IQ4_XS).
- Generación de tests y documentación técnica: con las etiquetas de code-generation e instruction-following, encaja en tareas de producir docstrings, comentarios y suites de pruebas a partir de fragmentos de código existentes.
- Agentes de desarrollo con tool calling: los tags "agentic" y "tool-use" sugieren su uso en pipelines donde el modelo invoca funciones (ejecutar tests, consultar APIs, leer ficheros) dentro de un bucle multi-paso; conviene validar el soporte real de plantillas de herramientas en el runtime elegido.
- Despliegue en entornos con VRAM limitada: las cuantizaciones i1-Q3_S/IQ3_M (12,4-12,9 GB) permiten ejecutar un modelo de 27,3 mil millones de parámetros en GPUs de 16 GB, y las de 11 GB (i1-Q2_K) en configuraciones aún más ajustadas, a costa de calidad.
- Procesamiento por lotes en CPU: el formato GGUF y las cuantizaciones de menor tamaño posibilitan tareas de generación de código o razonamiento en servidores sin GPU, con throughput reducido pero sin coste de acelerador.
- Prototipado de asistentes bilingües inglés-chino: para equipos que necesiten respuestas en ambos idiomas, el modelo declara soporte de en y zh, lo que permite construir demos de atención técnica o documentación en esas dos lenguas.
- Investigación sobre cuantización: el fichero imatrix y la variedad de niveles publicados permiten estudiar la degradación de calidad entre cuantizaciones (de Q2_K a Q6_K) sobre una misma base de 27,3 mil millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, más overhead de contexto y KV cache):
  - i1-Q2_K: ~11,0 GB.
  - i1-IQ3_S / i1-IQ3_M: ~12,7-12,9 GB.
  - i1-Q4_K_S / i1-Q4_K_M: ~15,9-16,9 GB.
  - i1-Q5_K_M: ~19,6 GB.
  - i1-Q6_K: ~22,5 GB.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible. Por tamaño, las cuantizaciones Q4 encajan en GPUs de 24 GB (RTX 3090, RTX 4090, A10G); las Q3 en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, A4000); las Q5-Q6 requieren 24 GB o más, o reparto entre GPU y CPU.
- ¿Cabe en GPU de consumo? Sí, en las cuantizaciones Q3 y Q4 sobre GPUs de 16-24 GB; las de mayor tamaño pueden ejecutarse con offloading parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (p. ej. LM Studio, koboldcpp). Para servidores con GPU, vLLM y TGI no consumen GGUF de forma nativa en todas sus versiones; para esos casos sería preferible el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida. El autor señala i1-Q4_K_M como "fast, recommended" y i1-Q4_0 como "fast, low quality", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF (este) | 27,3 mil millones | no disponible | Apache 2.0 | GGUF (i1, imatrix) | Cuantizaciones de 11,0 a 22,5 GB; en/zh |
| Qwen3.8-27B-CodeForge-3xMerge-GGUF (estatico, mismo autor) | 27,3 mil millones | no disponible | Apache 2.0 | GGUF (estatico) | Misma base sin calibracion imatrix; menor calidad esperada a igual tamano segun el autor |
| xtools-at/Qwen3.8-27B-CodeForge-3xMerge (base) | 27,3 mil millones | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar; requiere BF16/FP16 y ~55 GB o mas de memoria |
| Otros modelos de ~27B orientados a codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Al ser una cuantizacion, la calidad se degrada respecto al modelo base; las cuantizaciones de 2-3 bits (i1-Q2_K, i1-IQ3_S) pueden producir errores notables en código y razonamiento. El autor recomienda IQ sobre no-IQ a igual tamaño.
- No hay benchmarks publicados: no es posible cuantificar la pérdida de rendimiento frente al modelo base ni comparar con alternativas.
- El modelo base es un merge de tres modelos; los merges pueden heredar sesgos y comportamientos inconsistentes de sus componentes, y no se documentan evaluaciones de seguridad.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en APIs, librerías y hechos verificables; el código generado debe revisarse y probarse.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada; planificar el despliegue con un límite conservador y verificar el comportamiento en conversaciones largas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las licencias de los modelos fusionados en el merge original.
- El repositorio ocupa 218,6 GB por incluir todas las cuantizaciones; conviene descargar únicamente el fichero GGUF necesario.
- Los tags incluyen "endpoints_compatible" y "region:us", pero no se documenta compatibilidad con APIs concretas; validar en el runtime elegido.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
