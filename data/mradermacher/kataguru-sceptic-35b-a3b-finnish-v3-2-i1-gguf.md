# mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF es la versión cuantizada en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Finnish-v3.2, publicada por el cuantizador mradermacher. Se trata de un modelo de mezcla de expertos (MoE) de 35.505.251.456 parámetros totales, con 3B de parámetros activos según indica su nomenclatura (A3B), construido sobre la arquitectura Qwen3.5 MoE y orientado a tareas de código industrial, automatización de planta, programación de sistemas y traducción, con soporte declarado de inglés y finés.

El modelo base está especializado en dominios técnicos concretos: PLC, G-code, IEC 61131-3, TwinCAT, Beckhoff, SCL de Siemens, OPC-UA, EtherCAT, Profinet, seguridad funcional, además de lenguajes de sistemas como Rust, C++ y Python. Incorpora etiquetas que indican capacidades de tool calling, function calling, agentes, RAG, razonamiento, matemáticas, visión y multimodalidad, y se distribuye con licencia Apache 2.0.

Esta versión i1-GGUF aplica cuantizaciones ponderadas con fichero imatrix, lo que permite desplegar el modelo en hardware más modesto que los pesos bf16 originales. El repositorio ocupa 279,4 GB e incluye un rango amplio de cuantizaciones desde Q2_K hasta Q6_K, pensadas para distintos equilibrios entre tamaño, velocidad y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 MoE (etiqueta `qwen3_5_moe`) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B (según nomenclatura A3B; no se detalla el reparto exacto por experto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ponderadas con imatrix) |
| Idiomas soportados | inglés (en), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos (MoE), identificada por la etiqueta `qwen3_5_moe`, lo que sugiere que se apoya en la familia Qwen3.5 MoE como base arquitectónica. Con 35.505.251.456 parámetros totales y 3B activos por token según la nomenclatura A3B, el modelo activa solo una fracción de sus parámetros en cada paso, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño total. El modelo base se distribuye en bf16/safetensors.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre si se aplicaron etapas de RLHF o DPO. Las etiquetas del modelo indican especialización en dominios de automatización industrial y programación de sistemas, además de traducción, razonamiento, matemáticas y capacidades multimodales/vision, pero la model card no documenta la metodología de entrenamiento ni innovaciones técnicas específicas más allá de la propia arquitectura MoE.

## Capacidades

- Generación de texto y razonamiento general, con etiqueta explícita de `reasoning`.
- Generación de código en lenguajes de sistemas y scripting: Rust, C++, Python.
- Código industrial especializado: PLC, G-code, IEC 61131-3, Structured Text, TwinCAT, Beckhoff, Siemens SCL.
- Protocolos y automatización industrial: OPC-UA, EtherCAT, Profinet, seguridad funcional.
- Tool calling y function calling.
- Flujos agénticos y razonamiento multi-paso (etiqueta `agentic`).
- Integración en pipelines RAG (etiqueta `rag`).
- Traducción (pipeline declarado: `translation`), con soporte de inglés y finés.
- Capacidades multimodales y de visión (etiquetas `multimodal`, `vision`, `vision-language`); los ficheros mmproj, si existen, se alojan en el repositorio estático.
- Matemáticas y STEM (etiquetas `stem`, `math`).
- Modelo etiquetado como `uncensored`.

## Casos de uso

- Programación de autómatas PLC: el modelo puede generar y revisar código IEC 61131-3 y Structured Text para proyectos de automatización, aprovechando su especialización declarada en PLC y TwinCAT.
- Desarrollo de lógica de control en Beckhoff TwinCAT: útil para escribir bloques de función y programas de control de planta, dado el etiquetado específico en TwinCAT y Beckhoff.
- Generación de G-code para mecanizado CNC: el modelo está etiquetado para CNC y G-code, por lo que puede asistir en la generación y depuración de trayectorias y programas de mecanizado.
- Integración de sistemas industriales con OPC-UA, EtherCAT y Profinet: puede ayudar a redactar configuraciones, mapeos de variables y lógica de comunicación entre dispositivos de planta.
- Traducción técnica inglés-finés: el pipeline declarado es `translation` y el modelo soporta ambos idiomas, lo que lo hace adecuado para documentación técnica y manuales de automatización.
- Asistente de código en Rust, C++ y Python para sistemas embebidos o software de control: su orientación a `systems-programming` permite usarlo en revisión de código, generación de utilidades y refactorización.
- Agentes y RAG sobre documentación técnica: con soporte de tool calling y RAG, puede integrarse en asistentes que consulten manuales de fabricantes, hojas de datos y normativa de seguridad funcional.
- Análisis de documentación con componentes visuales: al declarar capacidades de visión, puede emplearse para interpretar esquemas, diagramas de planta o capturas de HMI, siempre que se disponga de los ficheros mmproj correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaños de fichero del repositorio):
  - i1-Q2_K: 13,3 GB.
  - i1-Q3_K_S / i1-IQ3_S / i1-IQ3_M: entre 15,6 y 15,9 GB.
  - i1-Q3_K_M / i1-Q3_K_L: 17,3 y 18,7 GB.
  - i1-IQ4_XS: 19,3 GB.
  - i1-Q4_0 / i1-Q4_K_S: 20,4 y 20,5 GB.
  - i1-Q4_K_M / i1-Q4_1: 21,8 y 22,5 GB.
  - i1-Q5_K_S / i1-Q5_K_M: 24,7 y 25,4 GB.
  - i1-Q6_K: 29,3 GB.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, las cuantizaciones Q2 a Q4 encajan en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con margen variable; Q5 y Q6 requieren 32 GB o más (A100 40 GB, H100, RTX 5090/A6000 de 48 GB).
- Cabe en GPU consumer: sí, al menos las cuantizaciones Q2_K a Q4_K_M en tarjetas de 24 GB; las de mayor tamaño necesitan GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base es compatible con transformers. No se documentan recetas específicas para vLLM o TGI con estos ficheros GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF | 35,5B totales / 3B activos | no disponible | Apache 2.0 | GGUF | Especializado en automatización industrial, código y finés |
| Modelo base kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2 | 35,5B totales / 3B activos | no disponible | Apache 2.0 | safetensors (bf16) | Misma especialización, sin cuantizar |
| Versión estática mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF | 35,5B totales / 3B activos | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas; aloja los ficheros mmproj de visión |

No se dispone de datos de benchmarks ni de comparativas con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, alucinación ni robustez en la información disponible.
- El modelo está etiquetado como `uncensored`, lo que implica que puede no aplicar filtros de seguridad estándar; requiere revisión y salvaguardas adicionales en producción.
- Idiomas declarados limitados a inglés y finés; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no está especificada, lo que impide planificar cargas de trabajo con ventanas largas sin validación previa.
- Aunque se etiqueta como multimodal/visión, los ficheros mmproj no están en este repositorio sino en el estático; sin ellos, las capacidades de visión no estarán operativas.
- Las cuantizaciones de menor tamaño (Q2_K, Q3) degradan la calidad; el propio autor recomienda alternativas IQ frente a Q del mismo tamaño y señala Q4_K_M como opción rápida y recomendada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio ocupa 279,4 GB; el almacenamiento y la descarga requieren planificación.
- No hay resultados de benchmarks que respalden las capacidades declaradas en dominios industriales críticos; para seguridad funcional se recomienda validación humana y pruebas formales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
