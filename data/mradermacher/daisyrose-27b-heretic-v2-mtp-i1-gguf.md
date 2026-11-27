# mradermacher/DaisyRose-27B-Heretic-v2-MTP-i1-GGUF

## Resumen

DaisyRose-27B-Heretic-v2-MTP-i1-GGUF es una cuantización GGUF del modelo DaisyRose-27B-Heretic-v2-MTP, publicada por el usuario mradermacher. El modelo original, desarrollado por kelsey1337, es un transformer de aproximadamente 27.320 millones de parámetros (27,3B) con licencia Apache 2.0, orientado a conversación y con soporte declarado para decodificación especulativa mediante multi-token prediction (MTP). La etiqueta "Heretic" y el tag "abliterated" indican que el modelo ha sido sometido a un proceso de abliteration, es decir, la eliminación o atenuación de las direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo ante ciertas peticiones.

Este repositorio concreto no contiene los pesos originales en safetensors, sino un conjunto de cuantizaciones GGUF generadas con imatrix (quantización ponderada por importancia) para su uso en llama.cpp y herramientas compatibles. El autor del repo indica que existen cuantizaciones estáticas en un repositorio hermano y que, al tratarse de un modelo de visión, los ficheros mmproj se alojan en el repositorio estático. El repositorio ocupa 40,0 GB y, en el momento de la consulta, no registraba descargas ni likes.

La relevancia de esta ficha es doble: por un lado, documenta una variante abliterated de un modelo de 27B con MTP, una combinación poco común que puede interesar a quienes investigan decodificación especulativa y modelos sin restricciones de rechazo; por otro, sirve como ejemplo de la cadena de publicación típica de mradermacher, que convierte pesos Hugging Face en GGUF listos para inferencia local. Conviene señalar que la información pública disponible es muy limitada: la model card no incluye detalles de arquitectura, entrenamiento, benchmarks ni idiomas más allá del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); etiquetado como qwen3.8 y con soporte MTP |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M (publicadas en este repo); lista completa de quants previstos: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Los tags del repositorio lo etiquetan como "qwen3.8", lo que sugiere una familia derivada de Qwen, y como "mtp", indicando soporte de multi-token prediction, una técnica en la que el modelo predice varios tokens futuros de forma simultánea para habilitar decodificación especulativa y aumentar el throughput. El tamaño de 27,3B parámetros y la presencia de MTP son los únicos datos estructurales confirmados.

El calificativo "Heretic" y el tag "abliterated" apuntan a un proceso de abliteration aplicado sobre el modelo base: una intervención sobre las direcciones de rechazo en el espacio de activaciones que reduce la tendencia del modelo a negarse a responder. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla el procedimiento exacto de cuantización más allá de que se usaron imatrix y de que las cuantizaciones se generaron con la herramienta de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado y el tag "conversational".
- Decodificación especulativa mediante multi-token prediction (MTP), etiquetada explícitamente en el repositorio.
- Capacidad de visión: la model card indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático.
- Comportamiento abliterated: se espera una reducción de las negativas del modelo ante peticiones que un modelo alineado rechazaría, aunque no se documenta el grado ni el método exacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas del repositorio.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteration: comparar el comportamiento de esta variante con el modelo base alineado para estudiar qué direcciones de activación codifican el rechazo y cómo afecta su eliminación a la calidad general y a la seguridad del modelo.
- Evaluación de decodificación especulativa con MTP: desplegar el modelo en llama.cpp con un modelo borrador compatible para medir la ganancia de throughput de la predicción multi-token en un transformer de 27B y compararla con decodificación autoregresiva estándar.
- Inferencia local en estaciones de trabajo: las cuantizaciones i1-IQ3_M (13,1 GB) e i1-Q2_K (11,3 GB) permiten ejecutar un modelo de 27B en GPUs de consumo con 16-24 GB de VRAM, útil para prototipado sin infraestructura de servidor.
- Generación de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite a otros usuarios generar sus propias cuantizaciones GGUF ponderadas por importancia con la misma matriz de calibración.
- Experimentación con modelos de visión cuantizados: si el repositorio estático incluye mmproj, se puede probar la ruta multimodal en llama.cpp para tareas de descripción de imágenes o extracción de información visual en local.
- Pruebas de robustez y red teaming: al ser un modelo abliterated, sirve como sujeto de pruebas para evaluar filtros de seguridad, clasificadores de contenido y políticas de moderación en pipelines de producción.
- Fine-tuning sobre GGUF frente a safetensors: no recomendado directamente sobre GGUF; para ajuste fino conviene partir del modelo base en safetensors y luego recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según los tamaños de cuantización publicados): i1-Q2_K ≈ 11,3 GB; i1-IQ3_M ≈ 13,1 GB. Las cuantizaciones de mayor calidad previstas (Q4_K_M, Q5_K_M, Q6_K) requerirán aproximadamente 16-22 GB según el tamaño típico para 27B, aunque no se confirman sus tamaños en este repositorio.
- GPU recomendadas: para las cuantizaciones publicadas, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo en VRAM con margen para el contexto. Para cuantizaciones de 4-6 bits, se recomienda A100 40 GB, H100 80 GB o RTX 6000 Ada.
- ¿Cabe en GPU de consumo? Sí: i1-Q2_K e i1-IQ3_M caben en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) y con holgura en 24 GB. En GPUs de 12 GB habría que recurrir a offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de endpoints indicada en los tags. vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversión.
- Latencia y throughput estimados: no disponibles. El soporte MTP debería mejorar el throughput frente a decodificación estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2-MTP (este repo, GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Abliterated, MTP, visión declarada, solo inglés |
| Modelo base kelsey1337/DaisyRose-27B-Heretic-v2-MTP | 27,3B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Cuantizaciones estáticas de mradermacher (repo hermano) | 27,3B | no disponible | Apache 2.0 | GGUF | Incluye mmproj para visión |

No se dispone de información suficiente para comparar con alternativas de otros autores (por ejemplo, variantes abliterated de Qwen o Llama de tamaño similar) en parámetros, contexto o rendimiento, por lo que esa comparación se indica como no disponible.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma rigurosa antes de desplegarlo.
- Modelo abliterated: la eliminación de las direcciones de rechazo implica que el modelo puede generar contenido que un modelo alineado rechazaría; no es adecuado para aplicaciones orientadas al usuario sin capas de moderación externas.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks publicados, no se puede estimar su fiabilidad en tareas factuales.
- Idioma: solo inglés declarado; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por una variante abliterated.
- Cuantizaciones de baja precisión: i1-Q2_K e i1-IQ3_M degradan la calidad frente a los pesos originales; para producción conviene usar cuantizaciones de 4 bits o superiores.
- Visión no verificada en este repo: los mmproj están en el repositorio estático, por lo que este repo por sí solo no habilita la ruta multimodal.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación externa del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-MTP-i1-GGUF
- Modelo base: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2-MTP
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-MTP-GGUF
- Página de resumen del modelo en hf.tst.eu: https://hf.tst.eu/model#DaisyRose-27B-Heretic-v2-MTP-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
