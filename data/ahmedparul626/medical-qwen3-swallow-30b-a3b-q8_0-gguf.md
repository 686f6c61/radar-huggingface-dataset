# ahmedparul626/Medical-Qwen3-Swallow-30B-A3B-Q8_0-GGUF

## Resumen

Medical-Qwen3-Swallow-30B-A3B-Q8_0-GGUF es una cuantización en formato GGUF (Q8_0) del modelo base tokyotech-llm/Medical-Qwen3-Swallow-30B-A3B, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) especializado en el dominio médico y orientado principalmente al idioma japonés. La conversión la ha realizado el usuario ahmedparul626 mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp, lo que permite ejecutar el modelo en entornos de inferencia local compatibles con la pila GGML (llama.cpp, llama-server y derivados). El modelo cuenta con 30.532.122.624 parámetros totales (unos 30,5 mil millones) y un tamaño de repositorio de 32,5 GB, coherente con una cuantización de 8 bits.

El interés de esta ficha reside en que combina tres elementos poco habituales en un mismo artefacto: una arquitectura MoE de la familia Qwen3, un ajuste específico para el ámbito clínico-sanitario y una orientación clara hacia el japonés (con soporte declarado también de inglés). Al estar publicado como GGUF, el modelo resulta desplegable en hardware de consumo o en servidores sin necesidad de una GPU de centro de datos, algo relevante para equipos de investigación que quieran evaluar modelos médicos en local sin depender de infraestructura en la nube.

Se trata, sin embargo, de un artefacto derivado: la model card es la generada automáticamente por GGUF-my-repo y remite a la model card original para cualquier detalle sobre datos de entrenamiento, benchmarks o limitaciones. Esta ficha refleja, por tanto, la información disponible en el repositorio de la cuantización y en los metadatos del modelo base, marcando explícitamente como "no disponible" todo aquello que no aparece en la documentación consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3 (tag `qwen3-moe`); detalles finos no disponibles en la información consultada |
| Parametros totales | 30.532.122.624 (≈30,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la información consultada |
| Tipos de cuantizacion | Q8_0 (este repositorio); el modelo base admite otras cuantizaciones GGUF generadas con llama.cpp, pero no se detallan en la información disponible |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`medical-qwen3-swallow-30b-a3b-q8_0.gguf`); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es un Mixture-of-Experts de la familia Qwen3, con 30,5 mil millones de parámetros totales y una adaptación específica al dominio médico (tags `medical`, `swallow`, `japanese`). El nombre "Swallow" remite a la línea de modelos japoneses del Tokyo Institute of Technology (tokyotech-llm), que habitualmente combina un modelo base multilingüe con un proceso de continued pretraining sobre corpus en japonés. No obstante, la model card de esta cuantización no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset médico, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Tampoco se documentan en la información consultada innovaciones técnicas específicas (decodificación especulativa, atención lineal, variantes de atención híbrida u otras). El único proceso técnico verificable es la conversión a GGUF mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai, que produce una cuantización Q8_0 de 8 bits por peso. Para cualquier detalle sobre arquitectura interna, mezcla de expertos (número de expertos, top-k de enrutamiento) o estrategia de entrenamiento, es necesario consultar la model card original del modelo base.

## Capacidades

- Generación de texto en japonés e inglés, con especialización declarada en el dominio médico (el tag `medical` y el nombre del modelo así lo indican).
- Razonamiento y respuesta a preguntas de carácter clínico-sanitario, presumiblemente orientado a terminología médica japonesa, si bien no se detallan las tareas concretas evaluadas.
- Arquitectura MoE, lo que en principio permite un cómputo por token inferior al de un modelo denso del mismo tamaño total (el número de parámetros activos no está disponible).
- Inferencia local mediante llama.cpp (CLI y servidor), con soporte de la API compatible con OpenAI a través de `llama-server`.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información consultada.
- Capacidades de visión, audio o modo "thinking": no disponibles en la información consultada.
- Capacidades multilingües más allá de japonés e inglés: no disponibles.

## Casos de uso

- Asistencia documental clínica en japonés: el modelo puede emplearse para resumir informes médicos, notas de evolución o literatura científica en japonés, aprovechando su especialización declarada en el dominio sanitario y su soporte nativo del idioma.
- Extracción de entidades y normalización de terminología médica: dado su ajuste al dominio, resulta adecuado para tareas de etiquetado de entidades (fármacos, diagnósticos, procedimientos) en corpus clínicos japoneses, siempre con revisión humana posterior.
- Prototipado de asistentes de triaje o FAQ sanitarias: desplegado con `llama-server`, puede servir como backend de un chatbot interno de preguntas frecuentes para personal sanitario, con la ventaja de ejecutarse en infraestructura propia y no exponer datos de pacientes a terceros.
- Investigación en PLN médico japonés: al ser un GGUF de 8 bits, permite a grupos de investigación sin acceso a clústeres de GPU reproducir experimentos de generación y evaluación sobre modelos médicos japoneses en hardware asequible.
- Traducción asistida de documentación médica japonés-inglés: el soporte declarado de ambos idiomas lo hace candidato para borradores de traducción de prospectos, guías clínicas o artículos, con revisión por traductores especializados.
- Evaluación comparativa de cuantizaciones: al existir el modelo base en safetensors y esta versión Q8_0 en GGUF, es útil para medir la degradación de calidad entre precisión completa y 8 bits en tareas médicas, un experimento habitual en pipelines de despliegue.
- Generación de material formativo para profesionales sanitarios: redacción de casos clínicos simulados o preguntas de autoevaluación en japonés, siempre bajo supervisión de expertos clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantización es la generada automáticamente por GGUF-my-repo y no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, benchmarks médicos como MedQA o JMED, etc.), ni tampoco se han encontrado en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una cuantización Q8_0 de un modelo de 30,5 B de parámetros, el archivo de pesos ocupa aproximadamente 32,5 GB (tamaño del repositorio). Se necesita al menos esa cantidad de memoria, más el espacio para la caché KV, por lo que en la práctica se requieren del orden de 34-40 GB de VRAM o memoria unificada, dependiendo de la longitud de contexto configurada.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S 48 GB, o cualquier GPU con 48 GB o más de VRAM. En configuraciones multi-GPU, dos RTX 3090/4090 de 24 GB podrían alojar los pesos, aunque con limitaciones de contexto.
- GPU de consumo: no cabe en una única GPU de consumo de 24 GB (RTX 3090, 4090) con la cuantización Q8_0. Sería necesario recurrir a cuantizaciones menores (Q4_K_M, Q5_K_M), no incluidas en este repositorio, o a offloading parcial a RAM del sistema.
- Memoria unificada: en equipos Apple Silicon con 48 GB o 64 GB de memoria unificada, la ejecución vía llama.cpp es viable.
- Opciones de despliegue: llama.cpp (CLI y `llama-server`), y por compatibilidad de formato GGUF, también Ollama y otros runners basados en GGML. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores sería preferible el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información consultada. Al ser un MoE, el throughput dependerá del número de parámetros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Medical-Qwen3-Swallow-30B-A3B (Q8_0 GGUF, este repo) | 30,5 B (MoE) | no disponible | Apache 2.0 | GGUF | Especializado en médico, japonés/inglés |
| Modelo base tokyotech-llm/Medical-Qwen3-Swallow-30B-A3B | 30,5 B (MoE) | no disponible | Apache 2.0 | safetensors | Mismo modelo, precisión completa |
| Qwen3-30B-A3B (familia general) | ≈30 B (MoE) | no disponible en la información consultada | Apache 2.0 (según familia Qwen3) | safetensors, GGUF | Modelo generalista del que deriva la arquitectura; no especializado en médico ni en japonés |
| Swallow (línea tokyotech-llm) | variable según versión | no disponible | variable | safetensors | Modelos japoneses del mismo laboratorio; la comparación concreta con esta variante médica no está documentada en la información disponible |

La comparación cuantitativa de rendimiento entre estos modelos no puede realizarse porque no se han publicado benchmarks en la información consultada. La comparativa se limita, por tanto, a parámetros, licencia y formato.

## Limitaciones y advertencias

- Modelo de uso sanitario: a pesar de la especialización médica declarada, no se documenta ninguna validación clínica, certificación regulatoria ni evaluación por profesionales sanitarios. No debe utilizarse para diagnóstico, prescripción ni decisiones terapéuticas sin supervisión humana cualificada.
- Riesgo de alucinación: inherente a los modelos generativos; en el dominio médico el impacto de una alucinación puede ser grave. Se recomienda verificación factual obligatoria contra fuentes primarias.
- Idiomas: solo se declaran japonés e inglés. El rendimiento en castellano no está documentado y probablemente sea deficiente.
- Sesgos: no se documenta ninguna evaluación de sesgos (de género, étnicos, socioeconómicos o de cobertura sanitaria). Los corpus médicos japoneses pueden sobrerrepresentar determinadas poblaciones y prácticas clínicas.
- Contexto: la longitud de contexto no está publicada en la información consultada; el ejemplo de la model card usa `-c 2048`, lo que sugiere que no debe asumirse una ventana amplia sin verificar la configuración del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y las condiciones del modelo base original, así como las de los datos de entrenamiento, antes de un despliegue en producción.
- Artefacto derivado: esta cuantización la ha generado un tercero (ahmedparul626) mediante una herramienta automática; no hay garantía de que la conversión preserve fielmente el comportamiento del modelo base. Para producción, conviene evaluar tanto el GGUF como el safetensors original.
- Cuantización Q8_0: aunque la pérdida de calidad respecto a precisión completa suele ser pequeña en 8 bits, no se ha publicado ninguna evaluación que lo confirme para este modelo.
- Sin tracción en la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso ni validación por parte de terceros.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/ahmedparul626/Medical-Qwen3-Swallow-30B-A3B-Q8_0-GGUF
- Modelo base: https://huggingface.co/tokyotech-llm/Medical-Qwen3-Swallow-30B-A3B
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
