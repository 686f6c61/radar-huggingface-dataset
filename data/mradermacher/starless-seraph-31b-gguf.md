# mradermacher/Starless-Seraph-31B-GGUF

## Resumen

Starless-Seraph-31B-GGUF es la versión cuantizada en formato GGUF del modelo Cyclone-Labs/Starless-Seraph-31B, un merge de modelos creado con mergekit y orientado a roleplay y narrativa (storytelling). La cuantización la firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y mantiene la licencia Apache 2.0 del modelo original. El modelo cuenta con 30.697.345.596 parámetros totales, lo que lo sitúa en la franja de los 31B, y está pensado para ejecutarse en entornos de inferencia local mediante llama.cpp y derivados.

La relevancia de esta ficha reside en que permite desplegar un modelo de 31B especializado en conversación creativa en hardware de consumo, algo imposible con los pesos originales en precisión completa. El repositorio incluye un conjunto amplio de cuantizaciones estáticas, desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), además de suplementos multimodales mmproj en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidades de visión. Existe además una variante con cuantización ponderada/imatrix publicada en un repositorio aparte.

El modelo está etiquetado únicamente para inglés y no dispone de pipeline declarado en Hugging Face. Su perfil de uso es claramente conversacional y creativo, no orientado a tareas de razonamiento técnico o generación de código, por lo que debe evaluarse con expectativas ajustadas a ese dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base fusionado con mergekit; se desconoce la arquitectura subyacente) |
| Parámetros totales | 30.697.345.596 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con suplementos mmproj para multimodal) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. La model card del repositorio cuantizado indica que Cyclone-Labs/Starless-Seraph-31B es un merge construido con mergekit, técnica que combina los pesos de varios modelos mediante estrategias de fusión (por ejemplo, SLERP, TIES o DARE) sin un entrenamiento adicional desde cero. No se especifican los modelos componentes del merge, la estrategia de fusión empleada ni si hubo fases posteriores de ajuste fino, RLHF o DPO.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de ficheros mmproj en el repositorio sugiere que el modelo base incorpora un codificador visual, pero no se detalla qué componente multimodal se integró ni cómo se entrenó. Cualquier afirmación sobre estos aspectos sería especulativa y no se incluye aquí.

## Capacidades

- Generación de texto conversacional y creativo, con especial orientación a roleplay y narrativa.
- Coherencia en diálogos multi-turno, presumiblemente con mantenimiento de personaje y estilo a lo largo de la conversación.
- Capacidades multimodales potenciales: el repositorio incluye suplementos mmproj (Q8_0 y f16), lo que indica soporte de entrada de imágenes en el modelo base, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener interacciones multi-turno con un personaje consistente, y las cuantizaciones Q4_K_M (18,8 GB) o Q5_K_M (21,9 GB) permiten ejecutarlo en GPUs de consumo con suficiente VRAM, sin depender de servicios en la nube.
- Escritura asistida de ficción: útil para generar borradores de escenas, diálogos y descripciones dentro de un flujo de trabajo de escritura creativa, aprovechando su ajuste específico para storytelling.
- Prototipado de videojuegos narrativos: integración en motores de diálogo para NPCs con personalidad definida, usando llama.cpp como backend embebido y cuantizaciones Q3 o Q4 para reducir requisitos de memoria.
- Generación de contenido para comunidades de rol: despliegue en servidores propios para dar servicio a grupos pequeños, con la ventaja de que la licencia Apache 2.0 permite uso comercial y modificación.
- Experimentación en investigación sobre merges: al ser un modelo fusionado con mergekit, sirve como caso de estudio para analizar el comportamiento de técnicas de model merging en tareas creativas frente a los modelos originales.
- Evaluación de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a Q8_0), lo que permite medir empíricamente la degradación de calidad en tareas de narrativa según el nivel de compresión.
- Descripción de imágenes en contextos narrativos: si se cargan los suplementos mmproj junto con el modelo, podría emplearse para incorporar referencias visuales en la generación de historias, aunque esta capacidad no está documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, con overhead adicional de contexto y caché KV):
  - Q2_K: 12,0 GB
  - Q3_K_S: 13,9 GB; Q3_K_M: 15,4 GB; Q3_K_L: 16,7 GB
  - IQ4_XS: 17,0 GB; Q4_K_S: 17,9 GB; Q4_K_M: 18,8 GB
  - Q5_K_S: 21,4 GB; Q5_K_M: 21,9 GB
  - Q6_K: 25,3 GB
  - Q8_0: 32,7 GB
  - Suplementos mmproj: 0,9 GB (Q8_0) y 1,3 GB (f16), adicionales si se usa multimodalidad.
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q6_K, una RTX 4090 de 24 GB o A6000 de 48 GB; para Q4_K_M y Q5_K_M, una RTX 4090 de 24 GB es suficiente; para Q3_K_M y Q2_K, GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB.
- ¿Cabe en GPU de consumo? Sí. Las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 16-24 GB; Q5_K_M y Q6_K requieren 24 GB; Q8_0 queda fuera del rango de consumo habitual.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para servidores, llama.cpp con servidor OpenAI-compatible; vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantización y la longitud de contexto, que no está documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Starless-Seraph-31B-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF | Merge orientado a roleplay y storytelling; cuantizaciones de 12 a 32,7 GB |
| Cyclone-Labs/Starless-Seraph-31B | 30,7B | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar del que deriva esta ficha |
| mradermacher/Starless-Seraph-31B-i1-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantización ponderada/imatrix del mismo modelo base |

No se dispone de información sobre otros modelos de 31B comparables en la documentación proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un merge de modelos no identificados, los sesgos heredados de sus componentes son desconocidos y deben evaluarse empíricamente antes de un despliegue en producción.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de roleplay y narrativa el modelo está diseñado para inventar contenido, por lo que no debe usarse como fuente de hechos sin verificación.
- Limitaciones de idioma: solo inglés declarado. El rendimiento en castellano no está garantizado y previsiblemente será inferior.
- Limitaciones de contexto: la longitud de contexto no está documentada; conviene probarla empíricamente antes de asumir ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, deben revisarse las licencias de los modelos componentes del merge, que no se detallan.
- Caveats para producción: la calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) degrada notablemente la coherencia narrativa; para uso serio se recomienda Q4_K_M o superior. La ausencia de benchmarks impide comparar su rendimiento con alternativas de forma objetiva. El modelo no está orientado a tareas técnicas, código o razonamiento formal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Starless-Seraph-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Starless-Seraph-31B
- Variante imatrix: https://huggingface.co/mradermacher/Starless-Seraph-31B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Starless-Seraph-31B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
