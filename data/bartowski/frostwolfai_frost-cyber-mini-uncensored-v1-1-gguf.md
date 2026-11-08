# bartowski/FrostWolfAI_Frost-Cyber-Mini-Uncensored-v1.1-GGUF

## Resumen

Frost-Cyber-Mini-Uncensored-v1.1 es un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4B) desarrollado por FrostWolfAI Labs, especializado en ciberseguridad y ingeniería de software, con un enfoque explícitamente "uncensored" y "abliterated" (es decir, con las capas de rechazo eliminadas o atenuadas). El modelo está pensado para despliegue local en tareas de red-team, OSINT, CTI (inteligencia de amenazas) y codificación segura, e incorpora una fase de entrenamiento orientada a agentes y uso de herramientas (tool-use). La ficha que nos ocupa corresponde a la cuantización GGUF realizada por bartowski, que es la variante práctica para inferencia local.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 4B en hardware de consumo (GPU de 8-12 GB o incluso CPU) manteniendo un formato de prompt específico con canal de razonamiento (`<think>`) y un parámetro de control de esfuerzo de pensamiento (`thinking_effort`) que admite los valores `low` y `high`. El modelo base está disponible en formato original y esta versión GGUF ofrece un abanico amplio de cuantizaciones (desde bf16 de 8,23 GB hasta IQ4_XS en torno a 2,4 GB), lo que facilita su integración en entornos con recursos limitados.

La licencia es Apache 2.0 según los metadatos, si bien el carácter "uncensored" y "abliterated" implica consideraciones éticas y de cumplimiento que conviene evaluar antes de un uso en producción. El modelo solo declara soporte para inglés (`en`) y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica la variante exacta en la información disponible; el prompt y el formato `<think>` sugieren una arquitectura tipo decoder-only con canal de razonamiento) |
| Parámetros totales | 4.112.079.360 (≈4B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S (y otras variantes IQ listadas en el repo) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones para llama.cpp); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna más allá de que se trata de un transformer decoder-only de 4B parámetros. La model card del cuantizador indica que el modelo base es FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1, que ha sido sometido a un proceso de "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) y a una fusión de LoRA (`lora-merged`), según las etiquetas del repositorio. También se indica que el modelo tiene una fase de entrenamiento orientada a agentes y tool-use, y que soporta un canal de razonamiento explícito delimitado por `<think>`.

El prompt format incluye un parámetro `thinking_effort` con valores `low` y `high`, lo que sugiere que el modelo fue entrenado con datos que permiten modular la longitud del razonamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La cuantización se realizó con llama.cpp release b12180 y utiliza imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precisión. No se menciona decodificación especulativa (la model card indica explícitamente "Speculative decoding: no").

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con canal de pensamiento explícito (`<think>`), con control de esfuerzo mediante `thinking_effort` (`low`/`high`).
- Soporte de tool calling / function calling mediante definiciones de herramientas en el prompt de sistema (formato `<tools>` con JSON schema).
- Capacidades orientadas a agentes y flujos multi-paso (etiqueta `agentic`).
- Enfoque especializado en ciberseguridad: red-team, OSINT, CTI y codificación segura (según la descripción del autor).
- Capacidades de ingeniería de software y generación de código (según la descripción del autor).
- Modelo "uncensored"/"abliterated": menor probabilidad de rechazo ante peticiones que otros modelos alineados rechazarían.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Red-team asistido: el modelo puede generar hipótesis de ataque, payloads de prueba y guiones de explotación en entornos controlados, aprovechando su entrenamiento específico en ciberseguridad y su menor tasa de rechazos.
- OSINT y CTI: resumen y correlación de informes de amenazas, extracción de indicadores y generación de consultas para fuentes abiertas, con soporte de tool calling para integrar APIs de búsqueda o feeds.
- Codificación segura: revisión de código en busca de patrones vulnerables, sugerencias de parcheo y generación de tests de seguridad, ejecutable localmente con cuantizaciones Q4_K_M (2,62 GB) en GPU de consumo.
- Agentes autónomos de análisis: el soporte de tool-use y el canal de razonamiento permiten construir pipelines multi-paso donde el modelo decide qué herramienta invocar (por ejemplo, consultas a un SIEM o a un escáner) y razona sobre los resultados.
- Asistente de mesa de ayuda en seguridad: conversaciones multi-turno para triaje de incidentes, con contexto gestionado por el orquestador (la longitud de contexto no está documentada, por lo que conviene validarla empíricamente).
- Formación y concienciación: generación de escenarios de phishing simulados y ejercicios de respuesta a incidentes en entornos de laboratorio, gracias a su orientación a contenido sin censura.
- Despliegue en entornos air-gapped: al ser un modelo de 4B con cuantizaciones de 2,4-3,8 GB, puede ejecutarse en estaciones de trabajo sin conexión, algo relevante para equipos de seguridad que no pueden enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - bf16: ~8,23 GB.
  - Q8_0: ~4,38 GB.
  - Q6_K: ~3,61 GB.
  - Q5_K_M: ~3,16 GB.
  - Q4_K_M: ~2,62 GB.
  - IQ4_NL / Q4_K_S: ~2,62 GB (y variantes IQ de menor tamaño en el repo).
- GPU recomendadas: para bf16, una GPU de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, A10); para Q4_K_M, una GPU de 6-8 GB es suficiente (RTX 3060, RTX 4060, RTX 2070). En A100/H100 el modelo es sobredimensionado para su tamaño y quedaría limitado por latencia más que por memoria.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando cuantizaciones Q4/IQ4; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI (el repo incluye la etiqueta `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Frost-Cyber-Mini-Uncensored-v1.1 (esta ficha) | ~4B | no disponible | Apache 2.0 | Ciberseguridad, uncensored, tool-use | GGUF (bartowski) y base en HF |
| Frost-Cyber-Mini-Uncensored-v1.1 (GGUF de FrostWolfAI) | ~4B | no disponible | Apache 2.0 | Ídem | GGUF en HF |
| Alternativas de 4B con tool-use (p. ej. Qwen2.5-3B/7B, Llama-3.2-3B) | 3-7B | 32K-128K (según modelo) | Apache 2.0 / Llama | Generalista con tool-use | safetensors, GGUF |
| Modelos "uncensored" de 7-8B (p. ej. Dolphin, Hermes) | 7-8B | variable | Apache 2.0 / MIT | Generalista sin censura | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": puede generar contenido dañino, ilegal o éticamente problemático sin filtros; requiere supervisión humana y políticas de uso claras.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; en dominios técnicos como ciberseguridad, las alucinaciones pueden tener consecuencias graves (por ejemplo, comandos incorrectos o exploits inválidos).
- Solo soporta inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada: conviene validar empíricamente el límite real antes de usarlo en pipelines con contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el carácter "uncensored" puede entrar en conflicto con políticas de proveedores cloud y con normativas locales (por ejemplo, en materia de seguridad informática).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.
- El formato de prompt es específico (tokens `<｜start▁of▁sentence｜>`, `<|System|>`, `<|User|>`, `<|Bot|>`, `<think>`); un uso incorrecto degrada la calidad de forma notable.
- No se declara soporte de decodificación especulativa, lo que limita optimizaciones de latencia en despliegues de alto throughput.

## Enlaces

- Repositorio GGUF (bartowski): https://huggingface.co/bartowski/FrostWolfAI_Frost-Cyber-Mini-Uncensored-v1.1-GGUF
- Modelo base: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1
- GGUF del autor original: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-GGUF
- Colección Frost Cyber Mini v1.1: https://huggingface.co/collections/FrostWolfAI/frost-cyber-mini-v11
- llama.cpp (release b12180): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
