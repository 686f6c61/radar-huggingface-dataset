# mradermacher/Industry-Coder-27B-v3.0-GGUF

## Resumen

Industry-Coder-27B-v3.0-GGUF es la versión cuantizada en formato GGUF del modelo kataguru/Industry-Coder-27B-v3.0, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a ingeniería de software industrial, con especial énfasis en programación de autómatas (PLC), control numérico por computadora (CNC), el estándar IEC 61131-3, TwinCAT y SCL de Siemens, además de ciberseguridad y codificación agéntica. La model card lo etiqueta como multimodal con soporte de visión y como «uncensored» y «anti-sycophancy».

El modelo base parece derivarse de la familia Qwen (las etiquetas mencionan qwen3.8 y qwen3_5), aunque esta circunstancia no se confirma de forma explícita en la información disponible. La licencia declarada es Apache 2.0, lo que facilita su uso comercial. Los idiomas soportados declarados son inglés, finés, estonio, húngaro y turco.

Esta publicación de mradermacher no aporta pesos originales sino cuantizaciones estáticas en GGUF (desde Q2_K hasta Q8_0, más los ficheros mmproj para la parte multimodal), pensadas para ejecución local con llama.cpp y herramientas compatibles. El repositorio ocupa 155,8 GB e incluye tanto los cuantizados como los suplementos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas apuntan a familia Qwen, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, fi, et, hu, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Las etiquetas de la model card incluyen referencias a «qwen3.8» y «qwen3_5», «bf16», «vllm» y «mtp» (multi-token prediction), lo que sugiere una arquitectura transformer derivada de la familia Qwen con decodificación multi-token, pero este extremo no se confirma explícitamente. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Las etiquetas «uncensored» y «anti-sycophancy» indican que el modelo base ha sido ajustado para reducir rechazos y para evitar respuestas aduladoras o complacientes, un rasgo relevante en entornos técnicos donde se prima la corrección sobre la cortesía. La etiqueta «multimodal» y la presencia de ficheros mmproj en el repositorio confirman capacidad de visión, aunque no se detalla el codificador visual empleado ni la resolución de entrada soportada.

## Capacidades

- Generación de código especializado en automatización industrial: PLC, CNC, IEC 61131-3, TwinCAT y SCL de Siemens.
- Codificación agéntica (agentic-coding): etiqueta explícita en la model card, orientada a flujos de trabajo multi-paso.
- Ciberseguridad: etiqueta «cybersecurity» en la model card.
- Capacidades multimodales de visión, con suplementos mmproj-Q8_0 y mmproj-f16 en el repositorio.
- Multilingüe en inglés, finés, estonio, húngaro y turco.
- Modo «uncensored»: menor tendencia a rechazar peticiones técnicas legítimas.
- Comportamiento «anti-sycophancy»: orientado a respuestas directas y no aduladoras.
- Compatibilidad declarada con vLLM y endpoints compatibles (etiqueta «endpoints_compatible»).
- Soporte de conversación multi-turno (etiqueta «conversational»).

## Casos de uso

- Generación de lógica de control en PLC: el modelo puede producir bloques en IEC 61131-3 (lenguaje estructurado, ladder o SCL) a partir de descripciones funcionales, lo que acelera la programación de autómatas en entornos industriales.
- Programación de máquinas CNC: traducción de especificaciones de mecanizado a código G o a secuencias de control, aprovechando el entrenamiento específico en CNC declarado en las etiquetas.
- Integración en TwinCAT y Siemens SCL: asistencia en la escritura y revisión de código SCL para proyectos de automatización Siemens, un nicho poco cubierto por modelos generalistas.
- Auditoría de ciberseguridad en entornos OT: revisión de código de control industrial en busca de patrones inseguros, dado el etiquetado explícito en ciberseguridad.
- Despliegue local en planta: al estar cuantizado en GGUF, puede ejecutarse en estaciones de trabajo con GPU de consumo o en servidores sin conexión a internet, requisito habitual en entornos industriales aislados.
- Asistencia multimodal en mantenimiento: con los ficheros mmproj, el modelo puede procesar imágenes (por ejemplo, esquemas o capturas de HMI) junto a texto para diagnosticar incidencias.
- Codificación agéntica en pipelines de CI/CD: la etiqueta «agentic-coding» sugiere su uso en agentes que iteran sobre repositorios, ejecutan herramientas y corrigen código automáticamente.
- Soporte multilingüe en equipos europeos: cobertura de finés, estonio, húngaro y turco además del inglés, útil para documentación técnica en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaños de fichero del repositorio):
  - Q2_K: 11,0 GB
  - Q3_K_S: 12,4 GB; Q3_K_M: 13,6 GB; Q3_K_L: 14,7 GB
  - Q4_K_S: 15,9 GB; Q4_K_M: 16,9 GB
  - Q5_K_S: 19,1 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
  - Suplementos multimodales: mmproj-Q8_0 (0,7 GB), mmproj-f16 (1,0 GB)
- GPU de consumo: los cuantizados Q4_K_S y Q4_K_M (15,9-16,9 GB) encajan en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) dejando margen para contexto; Q3_K_M (13,6 GB) y Q2_K (11,0 GB) caben en GPUs de 16 GB como la RTX 4080.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB) y L40S permiten ejecutar Q8_0 (29,1 GB) con contexto amplio y mayor throughput.
- Despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; la model card menciona vLLM y endpoints compatibles para el modelo base en bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Industry-Coder-27B-v3.0-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | PLC, CNC, IEC 61131-3, ciberseguridad |
| mradermacher/IndustryForge-27B-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | CAD (CadQuery, SolidWorks, Autodesk Inventor, COM API) |
| mradermacher/iCoder-27B-i1-GGUF | no disponible | no disponible | Apache 2.0 | GGUF (imatrix) | RTL, Verilog, kernels GPU, Triton |

Los tres modelos comparten el tamaño de 27 B y la licencia Apache 2.0, y proceden del mismo cuantizador (mradermacher), pero cubren nichos industriales distintos: automatización y ciberseguridad OT en el caso de Industry-Coder, diseño CAD en IndustryForge y hardware/RTL en iCoder. No se dispone de datos de benchmarks que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks que permitan validar la calidad del modelo frente a alternativas generalistas.
- El modelo está etiquetado como «uncensored»: puede generar contenido que otros modelos rechazarían, lo que exige revisión humana en producción.
- La etiqueta «anti-sycophancy» implica un estilo de respuesta directo que puede resultar brusco en aplicaciones de cara al usuario.
- Cobertura idiomática limitada a inglés, finés, estonio, húngaro y turco; el castellano no figura entre los idiomas declarados.
- No se especifican la longitud de contexto ni los detalles de entrenamiento, lo que dificulta evaluar su idoneidad para tareas de contexto largo.
- Al ser una cuantización, los formatos de menor precisión (Q2_K, Q3_K_S) degradan la calidad; la propia model card recomienda Q4_K_S/Q4_K_M como equilibrio y Q6_K como «muy buena calidad».
- La información sobre la arquitectura subyacente es inferida de etiquetas y no confirmada; conviene verificar el modelo base antes de adoptarlo en producción.
- Aunque la licencia es Apache 2.0, deben revisarse las condiciones del modelo base kataguru/Industry-Coder-27B-v3.0 por si impusieran restricciones adicionales.
- El repositorio tiene 155,8 GB; la descarga completa requiere planificación de almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Industry-Coder-27B-v3.0-GGUF
- Modelo base: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0
- Página de descargas del cuantizador: https://hf.tst.eu/model#Industry-Coder-27B-v3.0-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizados: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo relacionado (CAD): https://huggingface.co/mradermacher/IndustryForge-27B-GGUF
- Modelo relacionado (RTL/GPU): https://huggingface.co/mradermacher/iCoder-27B-i1-GGUF
