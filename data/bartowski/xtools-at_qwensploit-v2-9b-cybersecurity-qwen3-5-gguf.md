# bartowski/xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit-V2-9B-CyberSecurity-Qwen3.5 es un modelo de lenguaje especializado en ciberseguridad ofensiva y defensiva, desarrollado por xtools-at sobre una base Qwen3.5 de aproximadamente 10 000 millones de parametros (9.197.093.888 segun los pesos en safetensors). Esta ficha corresponde concretamente a la version cuantizada en GGUF publicada por bartowski, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp. El modelo esta afinado para tareas de red team, pruebas de penetracion, investigacion de vulnerabilidades y retos CTF, e incorpora un modo de razonamiento explicito mediante etiquetas `<think>`.

La relevancia de esta publicacion radica en dos factores. Por un lado, ofrece capacidades de razonamiento especializado en seguridad en un tamano (9-10B) que cabe en una unica GPU de consumo cuando se cuantiza a Q4_K_M (5,98 GB). Por otro, el pipeline declarado es `image-text-to-text`, lo que indica soporte multimodal de entrada (texto e imagen) mediante un fichero `mmproj` separado en el repositorio GGUF. Ademas, el autor original incorpora decodificacion especulativa mediante MTP (multi-token prediction), una innovacion que acelera la generacion.

El modelo se distribuye bajo licencia "other" (no estandar), lo que obliga a revisar los terminos del modelo base antes de cualquier uso comercial. Los pesos estan disponibles en multiples cuantizaciones GGUF (desde bf16 de 18,41 GB hasta Q4_K_M de 5,98 GB) y el repositorio ocupa 143,4 GB en total. En el momento de redactar esta ficha no consta ninguna descarga ni "like" en Hugging Face, lo que sugiere una publicacion muy reciente (14 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3.5, con modo de razonamiento (`<think>`) y soporte multimodal de entrada |
| Parametros totales | 9.197.093.888 (aprox. 9,2B; la model card del cuantizador indica 10B para el checkpoint fuente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M (y otras variantes de la familia Q4/Q3/Q2 en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia no estandar; revisar terminos del modelo base) |
| Formato de pesos | GGUF (cuantizaciones llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 (arquitectura transformer decoder-only) y se ha afinado mediante instruction tuning y tecnicas de PEFT/LoRA (las etiquetas incluyen `lora`, `peft` y `unsloth`) para especializarlo en ciberseguridad. La model card del cuantizador menciona explicitamente el uso de decodificacion especulativa mediante MTP (multi-token prediction), lo que permite generar varios tokens por paso y reducir la latencia en inferencia. Tambien se ha aplicado cuantizacion con matrices de importancia (imatrix) mediante llama.cpp release b12180, lo que mejora la calidad de las cuantizaciones de baja precision.

El entrenamiento se ha realizado sobre una mezcla de datasets de ciberseguridad: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. Este ultimo sugiere un proceso de destilacion de trazas de razonamiento de un modelo mayor (Claude Haiku 5.5) para inculcar cadenas de pensamiento en el modelo pequeno. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset. El formato de prompt es el de ChatML (`<|im_start|>`/`<|im_end|>`) con apertura explicita de bloque de razonamiento (`<think>`) y soporte de definiciones de herramientas en formato XML dentro del system prompt.

## Capacidades

- Generacion de texto y razonamiento especializado en ciberseguridad (analisis de vulnerabilidades, explicacion de exploits, hardening de sistemas).
- Modo de razonamiento explicito: el modelo abre un bloque `<think>` antes de responder, lo que facilita auditar su cadena de pensamiento.
- Soporte de tool calling / function calling mediante un formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidades de agente y razonamiento multi-paso, adecuadas para flujos de pentesting automatizado.
- Entrada multimodal: acepta texto e imagen (requiere el fichero `mmproj` del repositorio GGUF para procesar imagenes).
- Capacidades multilingues limitadas: solo se declara ingles (`en`).
- Decodificacion especulativa MTP para acelerar la generacion.
- Especializacion en red team, pruebas de penetracion, investigacion de vulnerabilidades, CTF y analisis de seguridad.

## Casos de uso

- Analisis de vulnerabilidades en codigo y configuraciones: el modelo puede revisar fragmentos de codigo o ficheros de configuracion e identificar patrones de riesgo (inyeccion, desbordamientos, configuraciones inseguras) gracias a su entrenamiento sobre datasets de seguridad ofensiva.
- Asistente de pentesting interactivo: con soporte de tool calling, puede encadenar llamadas a herramientas (escaneos, consultas a APIs) dentro de un flujo de agente multi-paso para tareas de reconocimiento y explotacion controlada.
- Resolucion de retos CTF: el modo `<think>` permite al modelo razonar paso a paso sobre pistas, binarios o capturas de red, y su entrenamiento con trazas de razonamiento destiladas favorece este tipo de tareas.
- Analisis de capturas de pantalla o diagramas de red: al aceptar entrada de imagen (con `mmproj`), puede interpretar interfaces, paneles de administracion o diagramas y proponer vectores de ataque o mitigaciones.
- Formacion y concienciacion en seguridad: puede generar explicaciones didacticas de tecnicas de ataque y defensa, simulaciones de escenarios y material de formacion para equipos de seguridad.
- Redaccion de informes de seguridad: puede estructurar hallazgos, severidades y recomendaciones de remediacion a partir de notas o resultados de herramientas, con razonamiento trazable.
- Despliegue en entornos air-gapped: al caber en una GPU de consumo con cuantizacion Q4_K_M (5,98 GB), permite auditorias de seguridad locales sin enviar datos sensibles a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - bf16: ~18,41 GB.
  - Q8_0: ~9,80 GB.
  - Q6_K_L: ~8,24 GB; Q6_K: ~7,93 GB; Q6_K_S: ~7,65 GB.
  - Q5_K_M: ~7,01 GB; Q5_K_S: ~6,63 GB.
  - Q4_K_M: ~5,98 GB (recomendada por el autor como equilibrio tamano/rendimiento); Q4_K_L: ~6,34 GB.
  - A estas cifras hay que sumar el fichero `mmproj` si se usa entrada de imagen, y la memoria para la cache KV segun la longitud de contexto.
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) ejecuta sin problemas Q8_0 e incluso bf16; RTX 4080/4070 Ti (16 GB) ejecutan Q6 y Q5 con holgura; RTX 4060 Ti (8-16 GB) y RTX 3060 (12 GB) ejecutan Q4_K_M y Q5.
  - Profesional: A100 (40/80 GB) y H100 (80 GB) para bf16 con contexto largo o despliegues concurrentes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 8 GB o mas usando Q4_K_M; con 12 GB se puede subir a Q5/Q6.
- Opciones de despliegue: llama.cpp (base de las cuantizaciones), Ollama, LM Studio, text-generation-inference (tag declarado) y vLLM (para el modelo base en safetensors). El formato GGUF es compatible con llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponible. El uso de decodificacion especulativa MTP deberia reducir la latencia frente a decodificacion autoregresiva estandar, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit-V2-9B-CyberSecurity-Qwen3.5 (esta ficha) | ~9,2B | no disponible | Ciberseguridad, red team, CTF | other | GGUF, safetensors |
| Modelo base Qwen3.5 (9-10B) | ~9-10B | no disponible | Proposito general | no disponible | safetensors |
| Alternativas especializadas en ciberseguridad de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el entrenamiento en ciberseguridad puede degradar el rendimiento en tareas generales frente al modelo base Qwen3.5.
- Riesgo de alucinacion: como cualquier LLM, puede inventar CVE, comandos o procedimientos de explotacion inexistentes; toda salida tecnica debe verificarse.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar despliegues con documentos largos sin pruebas previas.
- Licencia "other": no es una licencia open source estandar; es imprescindible revisar los terminos del modelo base (Qwen3.5) y del autor original antes de cualquier uso comercial o redistribucion.
- Uso dual: el modelo esta disenado para seguridad ofensiva; su uso debe limitarse a entornos autorizados (pentesting con permiso, CTF, investigacion). Existe riesgo de uso malicioso.
- Datos de entrenamiento: la mezcla incluye datasets de terceros y trazas destiladas de otro modelo; pueden introducir sesgos o contaminacion no documentada.
- Multimodalidad: la entrada de imagen requiere descargar y configurar el fichero `mmproj`; sin el, el modelo funciona solo con texto.
- Madurez: el repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de calidad ni de estabilidad en produccion.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bartowski/xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF
- Modelo base original: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- llama.cpp (release b12180 usada para cuantizar): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
