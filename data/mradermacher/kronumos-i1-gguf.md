# mradermacher/Kronumos-i1-GGUF

## Resumen

Kronumos-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo Kronumos de NadevA23. El modelo base es un transformer denso de aproximadamente 7.610 millones de parámetros (7,6B) construido sobre la arquitectura Qwen2, según indican las etiquetas del repositorio, y afinado con la librería Unsloth. La model card lo orienta explícitamente a tareas de código, agentes autónomos, corrección de bugs, auto-reparación de sistemas, SRE y al protocolo MCP (Model Context Protocol), con etiquetas adicionales que aluden a un diseño "dual-brain" y a un "rust-subcortex".

El repositorio lo publica mradermacher, un conocido cuantizador de la comunidad que produce versiones GGUF de modelos abiertos. Aquí ofrece tanto cuantizaciones estáticas (en el repositorio hermano Kronumos-GGUF) como cuantizaciones con matriz de importancia (imatrix), que suelen conservar mejor la perplejidad a igual tamaño de archivo. El paquete cubre un rango amplio de tipos, desde IQ1_S (2,0 GB) hasta Q6_K (6,4 GB), lo que permite desplegar el modelo en hardware muy diverso.

La relevancia actual del modelo radica en su enfoque vertical: no es un modelo generalista, sino uno afinado para flujos de trabajo de ingeniería de software y operaciones, con soporte declarado para MCP y razonamiento multi-paso orientado a agentes. La licencia Apache 2.0 facilita su uso comercial, y el formato GGUF lo hace compatible con llama.cpp, Ollama y otros motores de inferencia local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2 (según etiquetas del repositorio) |
| Parámetros totales | 7.615.616.512 (7,6B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (más fichero imatrix) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base Kronumos se construye sobre la arquitectura Qwen2, un transformer denso con atención causal estándar. Con 7,6B parámetros encaja en la familia de modelos de tamaño medio que equilibran calidad y requisitos de hardware. El afinado se realizó con Unsloth, una librería optimizada para entrenamiento y fine-tuning eficientes en memoria, lo que sugiere un proceso de ajuste supervisado o preferencial sobre el modelo preentrenado.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas del repositorio mencionan conceptos como "dual-brain", "rust-subcortex", "tokenectomy" y "self-healing", que apuntan a un diseño de prompting o a un conjunto de datos especializado en reparación de código y operaciones de sistemas, pero no se documenta su implementación técnica. Las cuantizaciones i1 de mradermacher emplean una matriz de importancia (imatrix) calculada sobre un corpus de calibración para reducir la pérdida de calidad en los tipos de bits bajos.

## Capacidades

- Generación de texto conversacional en inglés, orientada a tareas técnicas.
- Generación y corrección de código, con énfasis declarado en la detección y reparación de bugs.
- Soporte declarado de agentes autónomos y razonamiento multi-paso.
- Soporte del Model Context Protocol (MCP), lo que facilita la integración con herramientas y servidores compatibles.
- Capacidades orientadas a SRE (Site Reliability Engineering): diagnóstico y auto-reparación de sistemas.
- Integración con el ecosistema transformers y con motores de inferencia GGUF.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte adicional.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Corrección automática de bugs en pipelines de CI/CD: el modelo puede analizar trazas de error, proponer parches y validar correcciones dentro de un flujo de agente, aprovechando su afinado específico en bug-fix y self-healing.
- Asistente de SRE para diagnóstico de incidentes: integrado como agente que consulta métricas y logs a través de MCP, puede correlacionar síntomas y sugerir acciones de remediación.
- Agente de mantenimiento de repositorios: revisión de pull requests, detección de patrones defectuosos y generación de tests, desplegado localmente con llama.cpp u Ollama.
- Automatización de tareas de refactorización: dado su tamaño de 7,6B y las cuantizaciones de 4-5 bits, puede ejecutarse en una estación de trabajo y procesar ficheros de código de forma iterativa.
- Servidor MCP de asistencia técnica: exposición del modelo como backend de un servidor MCP para que otros agentes deleguen tareas de reparación de código.
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable en local, permite procesar código propietario sin enviarlo a servicios externos.
- Prototipado de agentes autónomos de operaciones: uso como núcleo de razonamiento en flujos que combinan herramientas de shell, monitorización y control de versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): IQ1_S ~2,0 GB; IQ2_M ~2,9 GB; IQ3_M ~3,7 GB; IQ4_XS ~4,3 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB. Añadir entre 1 y 2 GB adicionales para el contexto KV cache según la longitud de secuencia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones Q4-Q6; A100 o H100 para despliegues con concurrencia alta o contexto largo.
- Compatibilidad con GPU de consumo: sí. Las cuantizaciones Q4_K_M e IQ4_XS caben en GPUs de 8 GB; las Q5 y Q6 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier motor compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Kronumos-i1-GGUF | 7,6B | No disponible | Apache 2.0 | GGUF | Código, agentes, SRE, MCP |
| Qwen2.5-Coder-7B | 7,6B | 32K (típico en la familia) | Apache 2.0 | safetensors, GGUF | Código generalista |
| CodeLlama-7B | 6,7B | 16K | Llama 2 | safetensors, GGUF | Código |
| Mistral-7B-Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Propósito general |

La comparación con Qwen2.5-Coder-7B es la más directa por arquitectura y tamaño, aunque no se dispone de datos de rendimiento de Kronumos que permitan una comparación cuantitativa. Los datos de contexto de los modelos alternativos corresponden a sus especificaciones públicas habituales.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con ventanas largas.
- No hay benchmarks publicados: la calidad real del modelo frente a alternativas establecidas no está verificada.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de razonamiento complejo o código poco representado.
- Las etiquetas "dual-brain" y "rust-subcortex" no están documentadas técnicamente; su efecto real en el comportamiento del modelo es desconocido.
- Las cuantizaciones de 1 y 2 bits (IQ1, IQ2) degradan notablemente la calidad; la propia model card las describe como "for the desperate".
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento, no detalladas.
- El repositorio tiene muy poca tracción (1 like, 1320 descargas) y fue creado y actualizado en fechas recientes; la madurez del proyecto es baja.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Kronumos-i1-GGUF
- Modelo base: https://huggingface.co/NadevA23/Kronumos
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Kronumos-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Kronumos-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
