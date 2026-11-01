# mradermacher/Erebus-RP-Engine-31B-i1-GGUF

## Resumen

Erebus-RP-Engine-31B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Naphula/Erebus-RP-Engine-31B, publicada por mradermacher, un conocido creador de cuantizaciones para llama.cpp. El modelo original es un merge de modelos orientado a escritura creativa, roleplay y generación de ficción, con etiquetas que indican soporte para todos los géneros, escritura oscura, terror, romance, ciencia ficción y suspense, además de estar marcado como "uncensored" y permitir lenguaje soez.

La información disponible es limitada: la model card del repositorio cuantizado es fundamentalmente un README genérico de mradermacher sobre el proceso de cuantización, sin detalles sobre arquitectura, entrenamiento o contexto del modelo base. El nombre sugiere un tamaño de 31B parámetros, aunque el dato de safetensors del repositorio indica 6.850.770 parámetros totales, una discrepancia que probablemente se debe a que el repositorio contiene únicamente el archivo imatrix y no los pesos completos.

El modelo resulta relevante para la comunidad de escritura creativa y roleplay que busca ejecutar modelos localmente mediante llama.cpp u Ollama, con cuantizaciones de distinto nivel de compresión (desde IQ1 hasta Q6_K) para adaptarse a distintos presupuestos de hardware. La licencia Apache 2.0 facilita su uso comercial, aunque la falta de documentación técnica del modelo base limita la evaluación rigurosa de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre y las etiquetas sugieren un merge tipo MoE, pero no se confirma en la información proporcionada) |
| Parametros totales | 31B según el nombre del modelo; el dato de safetensors del repo indica 6.850.770 (probablemente solo el archivo imatrix) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas/imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo imatrix disponible; pesos completos en el repo estático enlazado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. Las etiquetas del repositorio incluyen "merge", "mergekit", "mergekit-exp", "moe" y "moe_della", lo que indica que el modelo original se construyó mediante técnicas de fusión de modelos (model merging) con mergekit, posiblemente con una estructura de mezcla de expertos (MoE) o una variante "della" de merge. También aparecen las etiquetas "gemma" y "gemma4", lo que sugiere que los modelos de origen podrían estar basados en la familia Gemma, aunque esto no se confirma explícitamente.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El repositorio cuantizado es una recopilación de cuantizaciones GGUF generadas con llama.cpp a partir de los pesos originales, utilizando archivos imatrix ponderados para mejorar la calidad de las cuantizaciones de baja precisión. La model card menciona que el modelo es "vision" y que los archivos mmproj (si existen) estarían en el repositorio estático, aunque no se confirma que el modelo base tenga capacidades multimodales.

## Capacidades

- Generación de texto creativo: ficción, relatos, novelas y escritura de prosa vívida ("vivid prosing", "vivid writing").
- Roleplay conversacional multi-turno: etiquetas "roleplaying", "rp", "conversational".
- Generación de tramas y subtramas: "plot generation", "sub-plot generation".
- Continuación de escenas: "scene continue".
- Escritura en múltiples géneros: terror ("horror"), romance, ciencia ficción, suspense, escritura oscura ("dark writing").
- Modo sin censura ("uncensored"): permite contenido explícito y lenguaje soez ("swearing").
- Capacidades multimodales (visión): la model card indica "This is a vision model", aunque no se detalla el alcance ni se confirma en la información del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés según el campo de idiomas.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar relatos completos, capítulos de ficción o prosa vívida en distintos géneros (terror, romance, ciencia ficción), aprovechando su especialización declarada en escritura creativa y su modo sin censura para tramas adultas o violentas.
- Roleplay conversacional: adecuado para motores de rol por turnos con personajes persistentes, gracias a sus etiquetas de "roleplaying" y "conversational" y su orientación a mantener coherencia de personaje en conversaciones multi-turno.
- Generación de tramas y subtramas para guiones o novelas: útil como herramienta de ideación para escritores que necesitan esbozar arcos argumentales o líneas secundarias, con soporte declarado para "plot generation" y "sub-plot generation".
- Continuación de escenas en pipelines de escritura: integrable en editores o herramientas de escritura para sugerir continuaciones de una escena existente, gracias a la etiqueta "scene continue".
- Motores de rol locales sin conexión: al estar disponible en GGUF con cuantizaciones desde IQ1 hasta Q6_K, puede desplegarse en estaciones de trabajo locales con llama.cpp u Ollama para aplicaciones de rol privadas y sin censura.
- Prototipado de videojuegos narrativos: puede emplearse para generar diálogos dinámicos y descripciones de mundo en juegos de rol o aventuras conversacionales, especialmente en contextos donde se requiere contenido sin filtros.
- Investigación sobre modelos sin censura: útil para estudiar el comportamiento de modelos "uncensored" en tareas creativas, comparando su salida con modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 31B en GGUF, las estimaciones orientativas serían aproximadamente 4-6 GB para cuantizaciones IQ1/IQ2, 8-12 GB para Q3/IQ3, 14-18 GB para Q4/IQ4, 20-24 GB para Q5/Q6, aunque estas cifras no están confirmadas en la documentación proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un modelo de 31B en Q4 requeriría GPUs con 24 GB o más (RTX 3090/4090, A6000, A100 40GB) o bien descarga parcial a CPU.
- ¿Cabe en GPU de consumo? Las cuantizaciones IQ1/IQ2 podrían caber en GPUs de 8-12 GB con descarga parcial; las cuantizaciones Q4 en adelante requieren GPUs de 24 GB o configuraciones multi-GPU/CPU offload.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El repositorio incluye un archivo imatrix para generar cuantizaciones propias.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base ni sobre alternativas comparables en la documentación proporcionada para establecer una comparativa rigurosa. Los modelos de escritura creativa y roleplay de tamaño similar (por ejemplo, variantes de 30-34B en GGUF) podrían ser comparables, pero no se aportan datos de rendimiento, contexto ni licencia de dichos modelos en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Erebus-RP-Engine-31B-i1-GGUF | 31B (según nombre) | no disponible | apache-2.0 | GGUF | Cuantizaciones imatrix de un merge para roleplay/ficción |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- Documentación muy escasa: la model card del repositorio cuantizado es genérica y no describe arquitectura, contexto, datos de entrenamiento ni evaluación del modelo base.
- Discrepancia en el recuento de parámetros: el dato de safetensors (6.850.770) no coincide con el tamaño de 31B del nombre, lo que sugiere que el repositorio contiene solo el archivo imatrix y no los pesos completos; conviene verificar el repositorio estático para descargar los GGUF reales.
- Modelo "uncensored": puede generar contenido explícito, violento o soez; no es adecuado para aplicaciones dirigidas a menores o entornos con requisitos de moderación estrictos.
- Riesgo de alucinación: inherente a los modelos generativos de ficción; no debe usarse como fuente de hechos sin verificación.
- Idioma: solo inglés según el campo de idiomas; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base es un merge cuyos componentes originales podrían tener licencias distintas; conviene revisar las licencias de los modelos fusionados antes de un despliegue comercial.
- Capacidad de visión declarada pero no documentada: la model card indica que es un modelo de visión, pero no se detalla el proyector multimodal ni su disponibilidad en el repositorio cuantizado.
- Sin benchmarks: no hay datos objetivos de calidad que permitan comparar su rendimiento con alternativas.
- Fecha de creación futura (2026-11-01): el repositorio muestra una fecha de creación posterior a la actual, lo que puede indicar un error de metadatos o una publicación programada; conviene verificar la integridad de los archivos.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Erebus-RP-Engine-31B-i1-GGUF
- Modelo base: https://huggingface.co/Naphula/Erebus-RP-Engine-31B
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Erebus-RP-Engine-31B-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Erebus-RP-Engine-31B-i1-GGUF
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
