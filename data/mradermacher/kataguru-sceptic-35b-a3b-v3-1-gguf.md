# mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-v3.1 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por kataguru, especializado en programación industrial y automatización. Con 35.247.133.824 parámetros totales y una arquitectura basada en Qwen3.5 MoE (según el tag `qwen3_5_moe`), el modelo está orientado a tareas de codificación en entornos industriales: PLC, CNC, G-code, IEC 61131-3, Structured Text, TwinCAT, Beckhoff, Siemens SCL, OPC-UA, EtherCAT, PROFINET y seguridad funcional. La versión aquí descrita es la cuantización GGUF publicada por mradermacher.

El modelo se distribuye bajo licencia Apache 2.0 y soporta inglés y finés (`en`, `fi`). Incluye capacidades multimodales (visión) mediante el proyector `mmproj` en los archivos GGUF, así como soporte de tool calling, function calling, razonamiento agéntico, RAG, matemáticas y programación de sistemas en Rust, C++ y Python. La nomenclatura "Sceptic" y el tag `uncensored` sugieren un ajuste orientado a reducir rechazos en dominios técnicos especializados.

La relevancia de este modelo radica en su especialización vertical: frente a modelos generalistas, cubre dominios de automatización industrial y programación de controladores que rara vez aparecen en los datasets de entrenamiento convencionales. La disponibilidad de cuantizaciones GGUF desde Q2_K (13,3 GB) hasta Q8_0 (37,6 GB) facilita su despliegue en hardware de consumo, algo poco habitual en modelos de 35B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), tag `qwen3_5_moe` |
| Parametros totales | 35.247.133.824 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, fi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, identificado por el tag `qwen3_5_moe`, lo que indica una derivación de la familia Qwen3.5 MoE. El nombre "A3B" en la denominación sugiere aproximadamente 3.000 millones de parámetros activos por token sobre un total de 35.247 millones, aunque el dato exacto de parámetros activos no está publicado en la información disponible. El modelo base se distribuye en formato safetensors y bf16, y esta versión es una conversión estática a GGUF realizada por mradermacher.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. Los tags del modelo indican especialización en dominios de automatización industrial, programación de sistemas y razonamiento, además de capacidades multimodales mediante un proyector de visión (`mmproj`). Existe una variante con cuantización ponderada/imatrix publicada en el repositorio `mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-i1-GGUF`.

## Capacidades

- Generación de texto y razonamiento general, con énfasis en dominios STEM y matemáticas.
- Programación especializada en automatización industrial: PLC, CNC, G-code, IEC 61131-3, Structured Text, TwinCAT, Beckhoff, Siemens SCL, OPC-UA, EtherCAT y PROFINET.
- Programación de sistemas en Rust, C++ y Python.
- Tool calling y function calling.
- Razonamiento agéntico multi-paso y soporte para pipelines RAG.
- Capacidades multimodales de visión (vision-language) mediante el proyector `mmproj` incluido en los GGUF.
- Multilingüe limitado a inglés y finés.
- Modelo marcado como `uncensored`, orientado a reducir rechazos en consultas técnicas.
- Compatible con endpoints (`endpoints_compatible`) y con vLLM para el modelo base.

## Casos de uso

- Generación y revisión de código PLC: el modelo puede producir y auditar programas en Structured Text (IEC 61131-3) para controladores Siemens y Beckhoff, aprovechando su entrenamiento específico en estos dialectos.
- Programación CNC y G-code: útil para generar trayectorias, macros y postprocesadores en entornos de mecanizado, un dominio con escasa cobertura en modelos generalistas.
- Integración en pipelines de automatización industrial: generación de configuraciones OPC-UA, EtherCAT y PROFINET, y asistencia en la puesta en marcha de celdas de fabricación.
- Asistente de ingeniería de sistemas en Rust, C++ y Python: revisión de código, generación de tests y refactorización en proyectos de sistemas embebidos.
- Agentes de soporte técnico especializado: con tool calling y RAG, puede consultar documentación de fabricantes (Beckhoff, Siemens) y responder consultas multi-turno sobre configuración de equipos.
- Análisis de documentación técnica con visión: al incluir proyector multimodal, puede interpretar esquemas eléctricos, diagramas de bloques y capturas de entornos de programación industrial.
- Validación de seguridad funcional: asistencia en la revisión de lógica de control con requisitos de functional safety, aunque sin sustituir la certificación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~13,3 GB; Q3_K_S ~15,5 GB; Q4_K_M ~21,7 GB; Q5_K_M ~25,3 GB; Q6_K ~29,1 GB; Q8_0 ~37,6 GB. Añadir entre 0,7 y 1,0 GB adicionales si se usa el proyector multimodal.
- GPU recomendadas: para Q4_K_M o superiores, GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100). Para Q2_K o Q3_K_S, GPU de 16 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en RTX 3090 igual; en GPUs de 16 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, y vLLM para el modelo base en safetensors. El modelo base es compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser MoE con aproximadamente 3B activos, se espera un throughput superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Formato |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-v3.1 | 35,2B (MoE) | no disponible | Apache 2.0 | Automatización industrial, PLC, CNC | GGUF, safetensors |
| Qwen3.5 MoE (base genérica) | no disponible | no disponible | no disponible | Generalista, código | safetensors |
| Modelos de código generalistas (p. ej. CodeLlama, DeepSeek-Coder) | variable | variable | variable | Código general | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo publicados para este modelo frente a alternativas de la misma categoría. La comparativa se limita a parámetros, licencia y especialización declarada en los tags.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente en inglés y finés, el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: presente como en cualquier LLM, especialmente crítico en dominios de seguridad funcional y automatización industrial, donde una salida incorrecta puede tener consecuencias físicas.
- Limitaciones de contexto e idioma: solo se declaran inglés y finés; la longitud de contexto no está publicada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en esta cuantización; conviene revisar la licencia del modelo original `kataguru/Kataguru-Sceptic-35B-A3B-v3.1`.
- Caveat para producción: el tag `uncensored` implica que el modelo puede generar contenido sin filtros, lo que exige validación humana en entornos industriales regulados.
- El dato de parámetros activos no está confirmado; el sufijo "A3B" es una inferencia nominal, no un dato verificado.
- No apto para certificación de seguridad funcional sin revisión humana: el modelo es una herramienta de asistencia, no un sustituto de la validación normativa.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización (mradermacher): https://huggingface.co/mradermacher/model_requests
