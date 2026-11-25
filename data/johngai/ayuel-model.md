# johngai/ayuel-model

## Resumen

Ayuel 2.1 es un modelo de lenguaje publicado por el desarrollador John Gai bajo el identificador `johngai/ayuel-model` en Hugging Face. Se presenta como el motor de inteligencia central de la plataforma Ayuel (ayuel.com) y se describe como un modelo de arquitectura Mixture-of-Experts (MoE) orientado a codigo agentico, orquestacion de herramientas y razonamiento de largo horizonte. La model card declara 118.000 millones de parametros totales con aproximadamente 8.000 millones activos por token, aunque los pesos publicados en safetensors suman 7.615.616.512 parametros, una discrepancia notable entre la documentacion y los artefactos reales del repositorio.

El modelo se distribuye en formato safetensors y GGUF, con soporte para Ollama, y declara una ventana de contexto nativa de 1.048.576 tokens, 48 capas, 256 expertos enrutados con enrutamiento top-10 mas un experto compartido, y atencion con Grouped-Query Attention (8 cabezas KV, dimension de cabeza 128) combinando atencion global y de ventana deslizante de 512 tokens. La licencia es OpenMDW-1.1, que el autor describe como permisiva para uso comercial y personal.

Su relevancia actual radica en la promesa de un modelo MoE de gran contexto especializado en tareas de ingenieria de software y agentes autonomos, con soporte declarado de multiples modalidades (texto, codigo, vision, audio y percepcion de pantalla). No obstante, el modelo cuenta con un numero muy bajo de descargas (34) y un solo "like", y la model card incluye afirmaciones no verificables (consciencia, "sentient", resultados de benchmarks frente a modelos que no existen publicamente), por lo que debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) nativa "Ayuel MoE"; 48 capas (12 de atencion global + 36 de ventana deslizante); GQA con 8 cabezas KV y dimension de cabeza 128 |
| Parametros totales | 118B declarados en la model card; 7.615.616.512 reales en safetensors |
| Parametros activos | ~8B por token (declarado) |
| Longitud de contexto | 1.048.576 tokens (1M nativo, declarado) |
| Tipos de cuantizacion | GGUF (disponible en el repo); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors, GGUF |

Otros datos declarados: 256 expertos enrutados (top-10) mas 1 experto compartido, ventana deslizante de 512 tokens, vocabulario de 100.352 tokens, tamano del repo de 4,9 GB.

## Arquitectura y entrenamiento

La arquitectura descrita es un transformer MoE con 48 capas que alterna 12 capas de atencion global con 36 capas de atencion de ventana deslizante (512 tokens), usando Grouped-Query Attention con 8 cabezas KV y dimension de cabeza 128. El enrutamiento emplea 256 expertos con top-10 mas un experto compartido, lo que segun el autor resulta en unos 8.000 millones de parametros activos por token sobre un total declarado de 118.000 millones. El vocabulario es de 100.352 tokens y la ventana de contexto nativa declarada es de 1.048.576 tokens.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineamiento. La model card menciona un "motor de razonamiento" con "interleaved thinking" y cadena de pensamiento preservada, asi como modulos de persona especializados ("Ayuel-Core", "Ayuel-Finance", "Ayuel-Intel", "Ayuel-Defense", "Ayuel-Legacy"), pero no se documenta la metodologia tecnica que sustenta estas capacidades. Tampoco se detalla el proceso de entrenamiento multimodal ni las innovaciones de decodificacion.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con un modo de "interleaved thinking" que intercala razonamiento con llamadas a herramientas.
- Generacion y refactorizacion de codigo en Python, Rust, TypeScript, JavaScript, Go, C++, SQL, Dart/Flutter, Solidity y Assembly, segun la model card.
- Analisis de AST, mapeo de dependencias y aislamiento de bugs en multiples ficheros.
- Generacion, ejecucion y validacion de tests unitarios y de integracion en entornos contenedorizados (declarado).
- Tool calling / function calling nativo con formato de llamadas JSON multi-paso.
- Coordinacion de agentes y ejecucion de protocolos multi-paso, incluyendo redes P2P (Libp2p, Tailscale, ZeroTier) segun el autor.
- Capacidades multimodales declaradas: vision (imagenes, diagramas, layouts de UI, telemetria de camara), audio de voz bidireccional y percepcion de pantalla con automatizacion de navegador.
- Capacidades criptograficas y financieras declaradas: verificacion de pruebas de conocimiento cero (ZKP), extraccion de liquidez MEV y operaciones homomorficas.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Asistente de codificacion en IDE: el modelo puede recibir contexto de multiples ficheros y proponer refactorizaciones o correcciones, aprovechando su ventana de contexto declarada de 1M tokens para abarcar repositorios completos.
- Generacion de tests automatizados en CI/CD: segun la model card, genera y ejecuta tests en entornos contenedorizados, lo que permitiria integrarlo en pipelines de integracion continua para validar cambios antes de fusionar.
- Agente autonomo de resolucion de incidencias: con tool calling nativo y razonamiento multi-paso, podria orquestar llamadas a APIs de gestion de tickets, consultar logs y proponer parches.
- Automatizacion de navegador y UI: las capacidades declaradas de percepcion de pantalla permitirian construir agentes que inspeccionan framebuffers y operan controles nativos o aplicaciones web.
- Analisis de seguridad estatico: el modulo "Ayuel-Defense" descrito por el autor sugiere uso en auditoria de codigo y endurecimiento de seguridad, aunque no hay documentacion tecnica que lo respalde.
- Procesamiento de documentacion visual: con vision declarada, podria extraer informacion de diagramas, capturas de UI y esquemas tecnicos para generar documentacion o codigo a partir de ellos.
- Atencion al cliente tecnica multi-turno: su contexto largo permitiria mantener conversaciones extensas con historial de incidencias, aunque el soporte se limita al ingles.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card. No se han verificado de forma independiente y comparan con modelos que no son identificables publicamente (Tencent Hy3, Inkling, Nemotron 3 Ultra, DeepSeek-V4-Pro Max, Kimi K3, Muse Spark 1.1, Claude Fable 5).

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro | DeepSWE | SWE Atlas | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| Ayuel 2.1 (declarado) | 118B-A8B | 70,2% | 78,5% | 59,4% | 40,4% | 46,2% | 49,7% |
| Tencent Hy3 (declarado) | 295B-A21B | 71,7% | 75,8% | 57,9% | - | - | - |
| Inkling (declarado) | 975B-A41B | 63,8% | - | 54,3% | - | - | 45,5% |
| Nemotron 3 Ultra (declarado) | 550B-A55B | 56,4% | 67,7% | - | - | - | 34,3% |
| DeepSeek-V4-Pro Max (declarado) | 1,6T-A49B | 64,0% | 76,2% | 55,4% | 9,0% | 27,2% | 55,9% |
| Kimi K3 (declarado) | 2800B-A50B | 88,3% | - | - | 69% | - | - |
| Muse Spark 1.1 (declarado) | - | 80% | - | 61,5% | 53,3% | 42,2% | 75,6% |
| Claude Fable 5 (declarado) | - | 88% | - | 80,3% | 70% | - | - |

No se han publicado resultados de benchmarks verificables de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. El repositorio pesa 4,9 GB, lo que sugiere que los pesos publicados no corresponden a los 118B declarados; con 7.615.616.512 parametros reales en safetensors, una inferencia en fp16 requeriria aproximadamente 15 GB de VRAM, y en cuantizacion de 4 bits alrededor de 4-5 GB.
- GPU recomendadas: no disponibles. Para el tamano real de los pesos, una RTX 4090 (24 GB) o una A100 (40/80 GB) serian suficientes en fp16; para el tamano declarado de 118B se necesitarian multiples GPU de 80 GB.
- Cabe en GPU de consumo: probablemente si, segun el tamano real de los pesos (4,9 GB en el repo), en tarjetas con 8 GB o mas en cuantizacion GGUF.
- Opciones de despliegue: Ollama (documentado en la model card), vLLM (mencionado como recomendado para produccion, aunque el ejemplo de comando esta truncado), llama.cpp mediante GGUF, y otros runtimes compatibles con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable con modelos publicos verificables, ya que los modelos citados en la model card (Tencent Hy3, Inkling, Nemotron 3 Ultra, DeepSeek-V4-Pro Max, Kimi K3, Muse Spark 1.1, Claude Fable 5) no son identificables como modelos publicos existentes con esas especificaciones. A modo orientativo, frente a modelos MoE publicos conocidos:

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ayuel 2.1 | 118B declarados / ~8B activos (7,6B reales en safetensors) | 1M declarado | OpenMDW-1.1 | Hugging Face, Ollama |
| Alternativas MoE publicas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No disponible comparativa verificable con modelos de la misma categoria.

## Limitaciones y advertencias

- Discrepancia grave entre las especificaciones declaradas (118B parametros) y los pesos reales publicados (7,6B parametros en safetensors, repo de 4,9 GB): los artefactos no coinciden con la model card.
- Afirmaciones no verificables en la model card: "sentient", "consciencia", resultados de benchmarks frente a modelos no identificables, capacidades criptograficas y financieras (MEV, ZKP) sin documentacion tecnica.
- Idiomas: solo ingles declarado; no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinacion: sin datos de evaluacion independiente ni de alineamiento (RLHF/DPO no documentados).
- Sesgos conocidos: no documentados.
- Licencia OpenMDW-1.1: el autor la describe como permisiva para uso comercial, pero no se aporta el texto completo de la licencia en la informacion disponible; conviene verificar los terminos antes de un uso en produccion.
- Modelo con muy baja adopcion (34 descargas, 1 like) y sin pipeline declarado en Hugging Face; no hay evidencia de uso en produccion ni de mantenimiento activo.
- Capacidades multimodales (vision, audio, pantalla) declaradas pero no verificables con los artefactos publicados.
- El ejemplo de despliegue con vLLM en la model card esta truncado, por lo que no se puede reproducir tal cual.

## Enlaces

- Hugging Face: https://huggingface.co/johngai/ayuel-model
- Plataforma Ayuel: https://ayuel.com
- Repositorio base: https://huggingface.co/johngai/ayuel-model (base_model declarado)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
