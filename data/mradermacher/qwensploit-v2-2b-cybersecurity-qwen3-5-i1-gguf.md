# mradermacher/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF

## Resumen

Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF es una cuantizacion GGUF del modelo Qwensploit-V2-2B-CyberSecurity-Qwen3.5, un modelo de lenguaje de 1.942.653.248 parametros (aproximadamente 2B) afinado para tareas de ciberseguridad ofensiva: red team, pruebas de penetracion, investigacion de vulnerabilidades y CTF. El modelo original lo desarrolla el usuario xtools-at, y esta version la publica mradermacher, especialista en cuantizaciones GGUF con metodologia imatrix (importance matrix) para preservar calidad en tamanos reducidos.

El modelo parte de una base Qwen3.5 (segun los tags qwen3_5 y qwen3.5) y se ha afinado mediante LoRA/PEFT sobre un conjunto de datasets especializados en seguridad, incluyendo corpus de instrucciones de ciberseguridad, razonamiento ofensivo y trazas de razonamiento destiladas. Incorpora tags de razonamiento (reasoning) y de decodificacion multi-token prediction (mtp), y la model card de la cuantizacion indica que se trata de un modelo de vision (los ficheros mmproj, si existen, residen en el repositorio estatico).

La relevancia actual radica en que ofrece capacidades de analisis de seguridad en un tamano muy contenido (1-1.7 GB por cuantizacion), lo que permite ejecutarlo en hardware de consumo y en entornos air-gapped donde no se puede enviar codigo o datos sensibles a APIs externas. Es una opcion practica para equipos de seguridad que necesitan un asistente local para triaje de vulnerabilidades, generacion de payloads de prueba o resolucion de retos CTF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5, afinado con LoRA/PEFT; tags qwen3_5, qwen3.5) |
| Parametros totales | 1.942.653.248 (aprox. 2B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen3.5, con aproximadamente 1.942 millones de parametros. El modelo original se obtuvo mediante afinado con LoRA/PEFT sobre la base Qwen3.5, segun los tags lora y peft de la model card. Los tags mtp y reasoning sugieren soporte de multi-token prediction y de modo de razonamiento, aunque la informacion disponible no detalla la implementacion concreta.

El entrenamiento se realizo sobre siete datasets de ciberseguridad: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. Este ultimo apunta a destilacion de trazas de razonamiento. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO. Esta version concreta es una cuantizacion GGUF generada con imatrix (weighted/imatrix quants) por mradermacher, que no modifica el entrenamiento sino la representacion numerica de los pesos.

## Capacidades

- Generacion de texto y razonamiento orientado a seguridad, con tag explicito de reasoning.
- Analisis de seguridad: evaluacion de configuraciones, identificacion de superficies de ataque y revision de codigo con enfoque ofensivo.
- Soporte de red team y pruebas de penetracion: generacion de hipotesis de explotacion y guias de pruebas.
- Investigacion de vulnerabilidades: analisis de causas raiz y descripcion de clases de fallo.
- Resolucion de retos CTF (tag ctf).
- Instruccion-tuning conversacional (tag conversational).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el tag reasoning sugiere capacidad de cadena de razonamiento, pero no se detalla integracion agentica.
- Capacidades multilingues: limitadas al ingles (language: en).
- Capacidades de vision: la model card de la cuantizacion indica que es un modelo de vision y remite a los ficheros mmproj del repositorio estatico; no se detalla el componente visual.
- Compatibilidad con text-generation-inference y transformers.

## Casos de uso

- Triaje local de vulnerabilidades: desplegar el modelo en una estacion de trabajo air-gapped para clasificar y priorizar hallazgos de escaneo sin enviar informacion sensible a APIs externas, gracias a su tamano de 1-1.7 GB en cuantizacion.
- Asistencia en pruebas de penetracion: generar hipotesis de explotacion y checklists de pruebas para entornos autorizados, usando el modo de razonamiento del modelo para estructurar el analisis paso a paso.
- Resolucion de retos CTF: analizar binarios, scripts o descripciones de retos y proponer vias de solucion, aprovechando el entrenamiento especifico en ctf.
- Revision de codigo con foco en seguridad: integrar el modelo en un pipeline de CI para senalar patrones inseguros en diffs, ejecutandolo en CPU o GPU de consumo mediante llama.cpp.
- Formacion y concienciacion: simular escenarios de ataque y explicar tecnicas en entornos de laboratorio controlados, con un modelo que corre en portatiles sin GPU dedicada en cuantizaciones Q4.
- Analisis de trazas y logs de seguridad: resumir y correlacionar eventos para generar hipotesis de incidente, aunque con la cautela de que el contexto maximo no esta documentado.
- Generacion de documentacion de seguridad: redactar informes de hallazgos y recomendaciones de mitigacion a partir de notas tecnicas, en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 1.1 GB (i1-Q2_K) y 1.7 GB (i1-Q6_K) solo para los pesos; anadir overhead de contexto y runtime (tipicamente 0.5-1.5 GB adicionales segun backend y longitud de contexto).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB sobran ampliamente. En datacenter, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM; tambien en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (tag text-generation-inference), transformers con soporte GGUF. Para vision, usar los ficheros mmproj del repositorio estatico de mradermacher.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit-V2-2B-CyberSecurity-Qwen3.5 (este) | ~2B | no disponible | Ciberseguridad ofensiva | other | GGUF (i1 y estatico), safetensors |
| Qwen3.5 base (2B, referencia) | ~2B | no disponible | Proposito general | no disponible | no disponible |
| Modelos de seguridad de 7B-8B (categoria general) | 7-8B | no disponible | Ciberseguridad | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas concretas en la informacion proporcionada; la comparativa se limita a categoria y tamano. No disponible para una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado en seguridad ofensiva: puede generar contenido de doble uso (payloads, tecnicas de explotacion). Requiere uso exclusivamente en entornos autorizados y con supervision humana.
- Riesgo de alucinacion: como todo modelo de 2B, tiende a inventar detalles tecnicos (CVE, funciones, rutas) con mayor frecuencia que modelos grandes; verificar siempre las salidas.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar tareas de analisis de documentos largos.
- Licencia "other": no se detallan los terminos; es imprescindible revisar las condiciones del modelo base y del autor original antes de uso comercial.
- Cuantizaciones agresivas (Q2, IQ2) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Capacidad de vision anunciada pero sin documentacion de los ficheros mmproj en este repositorio; verificar en el repositorio estatico.
- No hay benchmarks publicados, por lo que no se puede validar su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
