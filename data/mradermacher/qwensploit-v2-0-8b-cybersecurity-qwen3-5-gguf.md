# mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5 es un modelo de lenguaje de 0,8 mil millones de parametros (772.845.888 exactos segun los pesos en safetensors) especializado en ciberseguridad ofensiva y defensiva. Lo desarrolla el usuario xtools-at sobre una base de la familia Qwen 3.5, y esta version concreta la publica mradermacher como un conjunto de cuantizaciones GGUF estaticas para su uso en llama.cpp y entornos de inferencia local. El modelo esta afinado con LoRA/PEFT sobre el modelo base original y esta orientado a tareas de red team, pentesting, investigacion de vulnerabilidades, CTF y analisis de seguridad.

El interes principal reside en su tamano reducido: con menos de mil millones de parametros, es desplegable en hardware de consumo modesto (incluso CPU) con cuantizaciones de 0,5 a 0,9 GB, lo que lo hace atractivo para entornos aislados, laboratorios de seguridad y pipelines automatizados donde no se puede depender de APIs externas. Ademas, el repositorio incluye ficheros `mmproj` (proyeccion multimodal), lo que sugiere capacidades de vision heredadas de la arquitectura base, aunque la model card no detalla su funcionamiento.

La relevancia actual viene por dos frentes: por un lado, la demanda creciente de asistentes especializados en seguridad que funcionen offline y con baja latencia; por otro, la tendencia a destilar modelos grandes de razonamiento (el dataset `qwen3.8-max-distillation-50k-clean` apunta a ello) en modelos pequenos, buscando retener capacidad de razonamiento a un coste computacional minimo. La licencia es "other" y no se especifican terminos concretos, lo que exige revision manual antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), afinado con LoRA/PEFT; tags indican `mtp` (multi-token prediction) |
| Parametros totales | 772.845.888 (0,77 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 (multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | other (terminos no especificados; requiere revision) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen 3.5, un transformer decoder-only, y se ha afinado mediante LoRA/PEFT sobre la base `xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5`. Los tags del repositorio incluyen `mtp` (multi-token prediction), lo que sugiere que la arquitectura base incorpora esta tecnica de decodificacion, aunque la model card no aporta detalles sobre su implementacion concreta. La presencia de ficheros `mmproj` indica que la base es multimodal (vision), si bien no se documenta el alcance de dicha capacidad tras el afinado.

El entrenamiento combina varios datasets de ciberseguridad e instrucciones: `PentesterFlow/OffsecCyber`, `ChaoticNeutrals/Cybersecurity-ShareGPT`, `Voidreaper2026/cybersec-master-dataset`, `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset`, `saidutta69/CyberSec-Reasoning-Premium`, `saidutta69/qwen3.8-max-distillation-50k-clean` y `xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x`. Este ultimo apunta a un proceso de destilacion de trazas de razonamiento de modelos mayores (Claude Haiku 5.5), y el dataset de "qwen3.8-max-distillation" sugiere que se ha buscado transferir capacidad de razonamiento de un modelo mayor a este 0,8B. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de seguridad (analisis de vulnerabilidades, explicacion de exploits, interpretacion de resultados de escaneo).
- Soporte de razonamiento multi-paso (thinking mode), inferido del uso de datasets de trazas de razonamiento y del tag `reasoning`.
- Conocimiento especializado en red team, pentesting, CTF, investigacion de vulnerabilidades y analisis de seguridad.
- Capacidad multimodal potencial (vision) por la presencia de ficheros `mmproj`, aunque no documentada en la model card.
- Soporte de tool calling / function calling: no disponible (no se menciona explicitamente).
- Soporte de agentes: no disponible (no se menciona explicitamente).
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Formato conversacional (`conversational` en los tags), apto para dialogos multi-turno.

## Casos de uso

- Asistente de pentesting en laboratorio aislado: el modelo puede desplegarse en una maquina sin conexion a internet (con cuantizacion Q4_K_M de 0,6 GB) para ayudar a interpretar salidas de nmap, Burp o Metasploit, explicar hallazgos y sugerir vectores de ataque, sin filtrar datos del cliente a APIs externas.
- Analisis de vulnerabilidades en pipelines de CI/CD: integrado via llama.cpp o un servidor compatible con la API de OpenAI, puede revisar informes de SAST/DAST y generar resumenes priorizados de hallazgos, aprovechando su bajo coste de inferencia para ejecutarse en cada build.
- Formacion y CTFs: como tutor interactivo que explica tecnicas de explotacion, resuelve retos de CTF paso a paso y justifica cada decision, gracias al entrenamiento con trazas de razonamiento.
- Generacion de reglas de deteccion: a partir de descripciones de tecnicas MITRE ATT&CK, el modelo puede proponer firmas para Snort, Sigma o YARA, tarea adecuada por su especializacion en seguridad y su formato conversacional.
- Triaje de alertas SOC: con un contexto de conversacion, puede clasificar alertas, resumir logs y proponer pasos de contencion; su tamano permite ejecutarlo en el propio SIEM o en un host modesto con latencia baja.
- Redaccion de informes de auditoria: convertir notas tecnicas y salidas de herramientas en secciones estructuradas de un informe de pentesting (resumen ejecutivo, impacto, remediacion), aprovechando su instruccion-tuning sobre datasets de seguridad.
- Entrenamiento y evaluacion de equipos rojos: servir como generador de escenarios de ataque controlados y preguntas de evaluacion en programas de concienciacion, al estar afinado en contenido ofensivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K, Q3_K_S) y 0,9 GB (Q8_0) para el modelo de texto; 1,7 GB para f16. Los ficheros `mmproj` anaden 0,2-0,3 GB si se usa la via multimodal.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta claramente sobredimensionado para GPUs de datacenter.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en iGPU con memoria unificada. Tambien es viable en CPU pura (por ejemplo, Raspberry Pi 5 o portatiles sin GPU) con cuantizaciones Q4.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-inference (el repo incluye el tag `text-generation-inference`), y servidores compatibles con la API de OpenAI basados en llama.cpp. Para los pesos safetensors del modelo base, transformers con PEFT.
- Latencia y throughput estimados: no disponibles. Por tamano, en una RTX 4090 con Q4_K_M se espera un throughput muy alto (cientos de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5 (este) | 0,77 B | no disponible | Ciberseguridad ofensiva/defensiva | other | GGUF, safetensors |
| Qwen 3.5 0.8B (base) | ~0,8 B | no disponible | Proposito general | no disponible | safetensors |
| WhiteRabbitNeo (familia) | 7 B-33 B | variable | Ciberseguridad ofensiva | otras | GGUF, safetensors |
| Llama 3.2 1B Instruct | 1,2 B | 128 K | Proposito general | Llama 3.2 Community | GGUF, safetensors |

La comparativa con modelos de seguridad especializados de mayor tamano (WhiteRabbitNeo, etc.) es desfavorable en conocimiento bruto pero favorable en coste de despliegue. Frente a modelos generalistas del mismo orden (Llama 3.2 1B, Qwen 2.5 0.5B), la ventaja es la especializacion en seguridad; la desventaja, el menor soporte multilingue y la ausencia de datos de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre datasets de seguridad ofensiva, puede reproducir sesgos y perspectivas propias de la comunidad de red team; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: elevado por su tamano reducido (0,77 B); puede inventar CVE, comandos o rutas de explotacion plausibles pero incorrectas. En produccion, toda salida tecnica debe validarse.
- Limitaciones de contexto e idioma: solo ingles; la longitud de contexto no esta documentada, lo que impide garantizar conversaciones largas o analisis de ficheros extensos.
- Licencia "other": los terminos no estan especificados en la model card; es imprescindible revisar la licencia del modelo base y del autor original antes de cualquier uso comercial.
- Uso dual: el modelo esta disenado para investigacion de seguridad y pentesting autorizado; su uso para atacar sistemas sin permiso es ilegal y el autor no ofrece garantias ni salvaguardas documentadas.
- Capacidad multimodal no verificada: los ficheros `mmproj` existen, pero no se documenta que el afinado haya preservado la vision ni como usarla.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones especificas de seguridad, lo que impide comparar objetivamente su calidad.
- Fecha de creacion futura (2026-11-18) en los metadatos del repositorio; conviene verificar la procedencia y la integridad de los ficheros antes de desplegarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF
- Modelo base (safetensors): https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
