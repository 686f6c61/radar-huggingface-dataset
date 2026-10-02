# SaiGaneshanM/sensorllm-gemma3-4b-gguf

## Resumen

`sensorllm-gemma3-4b-gguf` es un ajuste fino multimodal publicado por el usuario SaiGaneshanM sobre la familia Gemma 3 de Google DeepMind, convertido a formato GGUF mediante Unsloth y orientado, por el nombre y por el marco de referencia asociado, a tareas de interpretación de datos de sensores y reconocimiento de actividad humana. El repositorio contiene 3.880.263.168 parámetros en total (aproximadamente 3,88 mil millones) y un tamaño de 3,3 GB, lo que lo sitúa en la gama de modelos pequeños capaces de ejecutarse en hardware de consumo.

El modelo se distribuye únicamente en formato GGUF y está pensado para su uso con `llama.cpp`, tanto en modo texto (`llama-cli`) como en modo multimodal con proyector de visión separado (`llama-mtmd-cli`). Los dos artefactos publicados son `medgemma-4b-it.Q4_K_M.gguf` y `medgemma-4b-it.F16-mmproj.gguf`, una nomenclatura que no coincide con el nombre del repositorio y que procede del pipeline de conversión del autor.

Su relevancia actual es limitada pero concreta: se trata de una de las pocas publicaciones que combinan un modelo Gemma 3 de 4B con capacidades de visión y un enfoque declarado hacia datos de sensores, un área donde el marco SensorLLM (EMNLP 2025) ha demostrado resultados de referencia en reconocimiento de actividad humana. La model card no documenta el dataset de ajuste, la licencia ni los idiomas soportados, por lo que la evaluación previa a producción exige validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (base Gemma 3); detalles específicos del ajuste no disponibles |
| Parámetros totales | 3.880.263.168 (≈3,88B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este ajuste; el modelo base Gemma 3 4B IT soporta 128k tokens según la documentación de terceros consultada |
| Tipos de cuantización | Q4_K_M (modelo) y F16 (proyector multimodal mmproj); otras cuantizaciones GGUF no están publicadas en el repositorio |
| Idiomas soportados | no disponible (el modelo base Gemma 3 es multilingüe, pero este ajuste no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3, un transformer decoder-only con capacidades multimodales que incorpora un codificador visual para imágenes normalizadas a 896 x 896 píxeles y un contexto de hasta 128k tokens en la versión base de 4B. Este repositorio no aporta detalles sobre la configuración de atención, el ratio entre atención local y global ni la composición del dataset de ajuste; únicamente indica que el modelo fue ajustado y convertido a GGUF con Unsloth, con un entrenamiento declarado como «2x más rápido» gracias a dicha herramienta. No se especifica si hubo RLHF, DPO u otro método de alineación posterior.

El único detalle técnico explícito en la model card es que el comportamiento del token BOS fue ajustado para garantizar la compatibilidad con GGUF. Por el contexto del ecosistema, el ajuste se enmarca en el trabajo del grupo CRUISE Research Group (SensorLLM, EMNLP 2025), un framework en dos etapas que alinea series temporales de sensores con texto para que un LLM interprete datos numéricos y realice reconocimiento de actividad humana con distintos tipos, recuentos y longitudes de sensores. No obstante, la relación exacta entre este repositorio y dicho framework no está documentada por el autor.

## Capacidades

- Generación de texto conversacional en modo chat, con compatibilidad declarada con plantillas Jinja (`--jinja`).
- Comprensión de imágenes mediante el proyector multimodal F16 incluido en el repositorio (`llama-mtmd-cli`).
- Procesamiento de datos de series temporales de sensores y su traducción a descripciones textuales, en línea con el enfoque del framework SensorLLM.
- Reconocimiento de actividad humana a partir de datos de sensores, según el marco de referencia asociado.
- Ejecución local en CPU y GPU mediante llama.cpp, sin dependencia de APIs externas.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con el ecosistema Ollama, con la salvedad de que Ollama no soporta ficheros mmproj separados.
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible (no declaradas para este ajuste).

## Casos de uso

- Reconocimiento de actividad humana con wearables: el modelo puede recibir secuencias de acelerómetro y giroscopio descritas en texto y clasificar actividades (caminar, correr, sentarse), aprovechando el enfoque de alineación sensor-texto del framework SensorLLM.
- Monitorización de salud y teleasistencia: interpretación de lecturas continuas de sensores corporales para generar resúmenes textuales de la actividad diaria de un paciente, con la ventaja de ejecutarse localmente y evitar el envío de datos personales a servicios externos.
- Análisis de datos de sensórica industrial: conversión de series temporales de vibración, temperatura o presión en descripciones legibles que un operario pueda revisar, usando el modo texto con GGUF en hardware modesto.
- Asistente multimodal de campo: combinación de imágenes (capturas de paneles, equipos o etiquetas) con datos de sensores para generar informes técnicos breves mediante `llama-mtmd-cli` en un portátil.
- Investigación en alineación de modalidades: uso como punto de partida para experimentos de ajuste fino que alineen nuevas modalidades (sensores, series temporales) con texto, dado su tamaño reducido y su formato GGUF fácilmente redistribuible.
- Despliegue edge en dispositivos con recursos limitados: con cuantización Q4_K_M, el modelo cabe en GPUs de gama de entrada o incluso en inferencia mixta CPU/GPU, lo que permite integrarlo en estaciones locales de captura de datos.
- Prototipado rápido de clasificación de actividades: al ser un GGUF de 3,3 GB, permite iterar en local con `llama-cli` antes de decidir si se escala a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ni evaluaciones específicas de reconocimiento de actividad humana, y tampoco se han encontrado resultados en la búsqueda web asociados a este repositorio concreto. Cualquier cifra de rendimiento deberá obtenerse mediante evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: del orden de 3 a 4 GB incluyendo el proyector multimodal y un contexto moderado (estimación a partir de los 3,88B parámetros y del tamaño del fichero publicado).
- VRAM estimada si se usa el modelo en F16: aproximadamente 8 a 9 GB (estimación).
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para Q4_K_M; RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, A100 o H100 para escenarios de mayor contexto o lote.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 6-8 GB o superiores; también es viable la inferencia mixta CPU/GPU en equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), Ollama (creando el modelo a partir del modelo bf16 fusionado, ya que Ollama no admite mmproj separado), LM Studio y otros frontends compatibles con GGUF. El soporte en vLLM o TGI no está declarado.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sensorllm-gemma3-4b-gguf | 3,88B | no disponible (base Gemma 3 4B IT: 128k) | Texto e imagen | no disponible | GGUF en HuggingFace |
| Gemma 3 4B IT (modelo base, Google DeepMind) | ≈4B | 128k tokens, salida máxima 8192 | Texto e imagen (896 x 896) | Términos de uso de Gemma | Pesos abiertos, amplia disponibilidad |
| MedGemma 4B IT (referenciado en los nombres de fichero) | no disponible | no disponible | Texto e imagen de ámbito médico | no disponible | no disponible en la información consultada |
| SensorLLM (framework, CRUISE Research Group) | Depende del LLM base | no disponible | Series temporales de sensores y texto | no disponible | Repositorio en GitHub |

La comparación directa con alternativas de la misma categoría (modelos multimodales de 3-4B) no puede completarse con rigor porque no hay métricas publicadas de este ajuste ni datos verificables sobre su dataset de entrenamiento. La referencia más sólida es el modelo base Gemma 3 4B IT, del que hereda la arquitectura y las capacidades multimodales, y el framework SensorLLM, que define el dominio de aplicación.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del ajuste, lo que impide determinar si el uso comercial está permitido. Al derivar de Gemma 3, es previsible que apliquen los términos de uso de Gemma, pero esto no está confirmado en el repositorio.
- Inconsistencia de nomenclatura: el repositorio se llama `sensorllm-gemma3-4b-gguf` pero los ficheros se llaman `medgemma-4b-it.*`, lo que genera ambigüedad sobre el modelo base real y sobre el dominio previsto (sensores frente a ámbito médico).
- Ausencia de documentación del entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo ajuste de visión o si se aplicó RLHF o DPO. Esto impide reproducir el ajuste o auditar sus datos.
- Riesgo de alucinación: al ser un modelo de 3,88B, la tasa de errores factuales es previsiblemente superior a la de modelos mayores; en dominios técnicos o clínicos esto exige verificación humana.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o si se ha degradado hacia un único idioma.
- Contexto no confirmado: aunque el modelo base soporta 128k tokens, no hay confirmación de que este ajuste mantenga esa ventana ni de su comportamiento en contextos largos.
- Compatibilidad con Ollama limitada para visión: la propia model card advierte de que Ollama no soporta ficheros mmproj separados, lo que obliga a un paso adicional de fusión con el modelo bf16.
- Token BOS modificado: el autor indica que se ajustó el comportamiento del token BOS para compatibilidad con GGUF, un cambio que puede alterar los resultados respecto al modelo original si no se usa la plantilla de chat adecuada.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validaciones independientes, lo que reduce la fiabilidad de cualquier uso en producción sin evaluación previa.
- Sin benchmarks publicados: no existe ninguna métrica que permita comparar objetivamente este ajuste con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SaiGaneshanM/sensorllm-gemma3-4b-gguf
- Perfil del autor en HuggingFace: https://huggingface.co/SaiGaneshanM
- Otro repositorio del mismo autor: https://huggingface.co/SaiGaneshanM/sensorllm-meditron3-gguf
- Repositorio SensorLLM (EMNLP 2025, CRUISE Research Group): https://github.com/cruiseresearchgroup/SensorLLM
- Unsloth (herramienta de ajuste y conversión a GGUF): https://github.com/unslothai/unsloth
- Repositorio oficial de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Ficha de Gemma 3 4B en LM Studio Hub: https://lmstudio.ai/191249/gemma-3-4b
