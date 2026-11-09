# mradermacher/Qwen3-30B-A3B-FineWeb-Edu-85B-GGUF

## Resumen

Qwen3-30B-A3B-FineWeb-Edu-85B es un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de la familia Qwen3, desarrollado originalmente por el equipo Qwen de Alibaba y adaptado por ziliangpeng mediante un entrenamiento de preentrenamiento continuado sobre el corpus FineWeb-Edu. La versión aquí descrita es una cuantización GGUF estática producida por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo cuenta con 30.532.122.624 parámetros totales, de los cuales aproximadamente 3.000 millones se activan por token (la designación "A3B" indica 3B activos), lo que reduce el coste computacional en inferencia respecto a un modelo denso del mismo tamaño. La arquitectura es un transformer con capas MoE y fue entrenada con el framework torchtitan sobre aceleradores AMD MI325X, según los metadatos del autor. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el modelo está orientado al idioma inglés. Su relevancia radica en ofrecer una variante de Qwen3 afinada sobre datos educativos de alta calidad (FineWeb-Edu) y empaquetada en cuantizaciones que van desde Q2_K (11,4 GB) hasta Q8_0 (32,6 GB), facilitando su despliegue local en GPUs de consumo y estaciones de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), familia Qwen3 (qwen3_moe) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3B por token (designación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; no hay quants ponderadas/imatrix disponibles) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura qwen3_moe: un transformer con capas de mezcla de expertos que activa una fracción reducida de sus 30.532 millones de parámetros por token (aproximadamente 3B), lo que equilibra capacidad y eficiencia computacional. El modelo base fue sometido a un preentrenamiento continuado sobre el dataset HuggingFaceFW/fineweb-edu, un corpus filtrado por calidad educativa, partiendo de ziliangpeng/Qwen3-30B-A3B-FineWeb-Edu-85B. Según los metadatos, el entrenamiento se realizó con el framework torchtitan sobre aceleradores AMD MI325X. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de la arquitectura Qwen3 MoE.

## Capacidades

- Generación de texto en inglés con calidad derivada del preentrenamiento sobre FineWeb-Edu.
- Razonamiento y conocimiento general heredados de la base Qwen3-30B-A3B.
- Capacidad de ejecución eficiente gracias a la arquitectura MoE (3B activos por token).
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (18,7 GB) o Q5_K_M (21,8 GB) el modelo cabe en GPUs de consumo de 24 GB como la RTX 4090, permitiendo inferencia privada sin conexión.
- Generación de texto educativo: el ajuste sobre FineWeb-Edu lo hace adecuado para producir material didáctico, resúmenes y explicaciones en inglés con un sesgo hacia contenido de calidad educativa.
- Prototipado de asistentes conversacionales en inglés: la ventana de contexto (no documentada) y la arquitectura MoE permiten gestionar conversaciones multi-turno con coste computacional reducido por token.
- Investigación en eficiencia de modelos MoE: sirve como banco de pruebas para estudiar el comportamiento de cuantizaciones GGUF en arquitecturas de mezcla de expertos.
- Fine-tuning posterior: al ser Apache 2.0 y estar disponible en formato GGUF, puede servir como base para experimentos de adaptación con LoRA sobre datos específicos en inglés.
- Evaluación comparativa de cuantizaciones: la disponibilidad de diez niveles de cuantización (Q2_K a Q8_0) permite medir el impacto de la compresión en calidad y latencia sobre el mismo modelo.
- Servicio de inferencia en CPU/GPU mixta: mediante llama.cpp u Ollama, puede desplegarse en servidores sin GPU dedicada usando cuantizaciones bajas (Q2_K, 11,4 GB) a costa de menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~11,4 GB; Q3_K_S ~13,4 GB; Q3_K_M ~14,8 GB; Q3_K_L ~16,0 GB; Q4_K_S ~17,6 GB; Q4_K_M ~18,7 GB; Q5_K_S ~21,2 GB; Q5_K_M ~21,8 GB; Q6_K ~25,2 GB; Q8_0 ~32,6 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0; GPUs con 16 GB (RTX 4080, 4060 Ti 16 GB) para Q3_K_L o Q4_K_S con posible offload parcial.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantizaciones hasta Q5_K_M; en GPUs de 16 GB con Q3_K_L o Q4_K_S; en GPUs de 12 GB solo con offload parcial o cuantizaciones muy bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-FineWeb-Edu-85B (este) | 30,5B | ~3B | no disponible | Apache 2.0 | GGUF |
| Qwen3-30B-A3B (base original) | 30,5B | ~3B | no disponible | Apache 2.0 | safetensors/GGUF |
| Qwen3-32B (denso) | 32B | 32B | no disponible | Apache 2.0 | safetensors/GGUF |
| Mixtral-8x7B | 46,7B | ~12,9B | no disponible | Apache 2.0 | safetensors/GGUF |

La comparativa se limita a datos estructurales; no se dispone de resultados de benchmarks para establecer diferencias de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre FineWeb-Edu, puede heredar sesgos del corpus web filtrado.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; no se han publicado evaluaciones específicas de fidelidad.
- Limitaciones de contexto o idioma: el modelo está orientado exclusivamente al inglés; la longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar las condiciones del modelo base original de Qwen.
- Caveats para producción: las cuantizaciones estáticas (sin imatrix) pueden degradar la calidad respecto al modelo en precisión completa; las cuantizaciones Q2_K y Q3_K_S son las más agresivas y pueden afectar notablemente al rendimiento. No hay quants ponderadas disponibles, lo que limita la calidad en niveles bajos de compresión.
- El modelo es una adaptación de terceros (ziliangpeng) y una cuantización de terceros (mradermacher), no una versión oficial de Qwen; la reproducibilidad de los resultados depende de esas adaptaciones.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/Qwen3-30B-A3B-FineWeb-Edu-85B-GGUF
- Modelo base (adaptación FineWeb-Edu): https://huggingface.co/ziliangpeng/Qwen3-30B-A3B-FineWeb-Edu-85B
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-30B-A3B-FineWeb-Edu-85B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
