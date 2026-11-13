# mradermacher/qwen3loop-0.6b-tool-calling-sft-v1-GGUF

## Resumen

`mradermacher/qwen3loop-0.6b-tool-calling-sft-v1-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo `Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1`, un modelo derivado de la familia Qwen3 con 1.192.098.816 parámetros totales (aproximadamente 1,2 mil millones) especializado en tool calling y function calling. El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de modelos open source, mientras que el modelo base lo desarrolla el usuario Lordnyx. La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de tool calling en hardware de consumo, algo poco habitual en modelos especializados en agentes.

El modelo parte de Qwen3 y se ha afinado mediante SFT (supervised fine-tuning) sobre el modelo base, con etiquetas que apuntan a un proceso de reinforcement learning y a la noción de "unrolled" y "agentic", lo que sugiere un entrenamiento orientado a bucles de razonamiento y llamadas a herramientas encadenadas. El resultado es un modelo pequeño, en inglés, con licencia Apache 2.0, que prioriza la capacidad de invocar funciones y estructurar llamadas a herramientas frente a la generación de texto generalista.

La colección GGUF incluye cuantizaciones desde Q2_K (0,6 GB) hasta f16 (2,5 GB), lo que permite desplegarlo en CPU, GPUs integradas y GPUs de consumo con requisitos de VRAM muy bajos. El repositorio ocupa 10,9 GB en total debido a la suma de todos los ficheros de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3) |
| Parametros totales | 1.192.098.816 (1,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repositorio | 10,9 GB (conjunto de todas las cuantizaciones) |
| Pipeline | reinforcement-learning |
| Libreria | transformers |
| Cuantizador | mradermacher |
| Modelo base | Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only derivado de Qwen3, con 1,2 mil millones de parámetros. Las etiquetas del repositorio (`tool-calling`, `function-calling`, `qwen3loop`, `reinforcement-learning`, `unrolled`, `agentic`) indican que el entrenamiento combina SFT con componentes de reinforcement learning orientados a la ejecución de bucles agénticos y a la generación de llamadas a herramientas encadenadas. La denominación "unrolled" sugiere que el modelo fue entrenado para razonar sobre secuencias de acciones desplegadas en el tiempo, típico de entornos agénticos donde el modelo debe anticipar el resultado de varias llamadas a funciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de las etiquetas mencionadas. Tampoco se detalla la longitud de contexto del modelo base ni si se aplicaron técnicas como decodificación especulativa o atención lineal. Las cuantizaciones son estáticas (no imatrix ni weighted), generadas con la herramienta de mradermacher a partir de los pesos originales en safetensors.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.
- Tool calling y function calling: capacidad principal del modelo, entrenada explícitamente mediante SFT.
- Soporte de agentes y razonamiento multi-paso: las etiquetas `agentic` y `unrolled` apuntan a entrenamiento para bucles de llamadas a herramientas.
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- No se documenta soporte nativo de tool calling estructurado vía API, aunque la especialización sugiere compatibilidad con formatos de function calling.

## Casos de uso

- Agentes de automatización de tareas: el modelo puede recibir una descripción de herramientas y generar llamadas estructuradas, integrándose en orquestadores como LangChain o LlamaIndex para tareas de bajo coste computacional.
- Enrutamiento de intenciones en asistentes: con 1,2 B de parámetros y cuantización Q4_K_M (0,8 GB), puede ejecutarse en CPU o GPU integrada para clasificar la intención del usuario y decidir qué herramienta invocar.
- Pipelines de CI/CD con tool calling: útil para generar comandos estructurados (por ejemplo, invocar APIs internas) en entornos donde el coste por token debe ser mínimo.
- Prototipado de agentes en local: permite a desarrolladores probar bucles agénticos en un portátil sin GPU dedicada, gracias a las cuantizaciones Q4_K_S y Q4_K_M.
- Extracción de datos estructurados: el modelo puede transformar texto en llamadas a funciones con parámetros, útil para poblar bases de datos o formularios.
- Educación y experimentación con RL y agentes: al ser un modelo pequeño con licencia Apache 2.0, sirve para estudiar el comportamiento de modelos afinados para tool calling sin grandes recursos.
- Edge computing y dispositivos con poca VRAM: la cuantización Q2_K (0,6 GB) permite desplegarlo en dispositivos con menos de 1 GB de memoria disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de tool calling (como BFCL o ToolBench). Tampoco se aportan comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ≈ 0,6 GB; Q3_K_S ≈ 0,7 GB; IQ4_XS y Q4_K_S/M ≈ 0,8 GB; Q5_K_S ≈ 0,9 GB; Q5_K_M ≈ 1,0 GB; Q6_K ≈ 1,1 GB; Q8_0 ≈ 1,4 GB; f16 ≈ 2,5 GB. Añadir margen para el contexto y el runtime (típicamente 0,5-1 GB adicionales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo, pero funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más de VRAM; también en CPU y en GPUs integradas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp u Ollama para producción ligera.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (1,2 B) y las cuantizaciones Q4, se espera un throughput alto en CPU moderna y muy alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| qwen3loop-0.6b-tool-calling-sft-v1 (este) | 1,2 B | no disponible | Apache 2.0 | GGUF / safetensors | Tool calling, agentes |
| Qwen3-0.6B (base) | 0,6 B | no disponible | Apache 2.0 | safetensors / GGUF | Generacion general |
| Qwen3-1.7B | 1,7 B | no disponible | Apache 2.0 | safetensors / GGUF | Generacion general |
| Hermes-3-Llama-3.2-3B | 3 B | no disponible | Llama 3.2 | safetensors / GGUF | Tool calling |

La comparativa se limita a modelos de la misma familia o categoría (tool calling en tamaño reducido). No se dispone de datos de rendimiento comparativo para este modelo, por lo que la comparación se basa únicamente en parámetros, licencia y especialización.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Qwen3 y entrenarse en inglés, puede heredar sesgos de los datos de preentrenamiento.
- Riesgo de alucinación: presente como en cualquier modelo de 1,2 B; la especialización en tool calling no elimina el riesgo de generar llamadas a funciones inexistentes o con parámetros incorrectos.
- Limitaciones de contexto e idioma: solo inglés; la longitud de contexto no está documentada, lo que impide garantizar conversaciones multi-turno largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de Qwen3 y las condiciones del modelo `Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1`.
- Caveats para producción: las cuantizaciones son estáticas (sin imatrix ni weighted), lo que puede degradar la calidad en cuantizaciones bajas (Q2_K, Q3_K_M); se recomienda Q4_K_M o superior para uso real. No hay benchmarks publicados que validen el rendimiento en tool calling, por lo que se recomienda evaluar en el caso de uso concreto antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3loop-0.6b-tool-calling-sft-v1-GGUF
- Modelo base: https://huggingface.co/Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1
- Página de descargas del cuantizador: https://hf.tst.eu/model#qwen3loop-0.6b-tool-calling-sft-v1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
