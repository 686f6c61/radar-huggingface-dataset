# FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-GGUF

## Resumen

Frost Cyber Mini Uncensored v1.1 es un modelo de lenguaje compacto de 4.112 millones de parámetros (4B) especializado en ciberseguridad y ingeniería de software, desarrollado por Vatsal Bajpai bajo el sello FrostWolfAI Labs. Se distribuye en formato GGUF para su ejecución local mediante llama.cpp y deriva del modelo base Frost-Cyber-Mini-Uncensored-v1.1, del que constituye una cuantización. Su orientación es explícitamente ofensiva y de doble uso: red team, OSINT, inteligencia de amenazas (CTI), codificación segura y flujos de trabajo agénticos con uso de herramientas.

El modelo emplea una arquitectura propietaria denominada `Spark2_5ForCausalLM` de 36 capas, con una ventana de contexto nativa de 131.000 tokens ampliable a 232.000 mediante ajuste RoPE. Ha sido sometido a un proceso de "abliteration" que elimina los rechazos de seguridad, por lo que genera código de explotación, payloads y tácticas de atacante bajo petición. Incorpora una fase de entrenamiento orientada a agentes y tool-use, y un modo de razonamiento (thinking) que resulta imprescindible para su correcto funcionamiento.

Su relevancia actual radica en que ofrece capacidades de asistencia en ciberseguridad en un tamaño que cabe en GPU de consumo, con licencia Apache 2.0 y sin dependencia de servicios en la nube, lo que lo hace atractivo para entornos air-gapped y laboratorios de seguridad. No obstante, sus benchmarks son irregulares y su conocimiento paramétrico de CVE es poco fiable, lo que exige verificación externa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer decoder-only, 36 capas) |
| Parametros totales | 4.112.079.360 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.000 tokens nativos; 232.000 mediante RoPE |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ3_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 36 capas con 4B parámetros, identificado internamente como `Spark2_5ForCausalLM`. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que el modelo base incorpora una "fase agéntica de tool-use" y que ha sido "abliterado" para eliminar los rechazos de seguridad. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal.

La innovación operativa más destacable es el modo de razonamiento (thinking) con presupuesto de tokens controlable en servidor (`--reasoning-budget`) y por petición (`reasoning_effort`: `off`, `low`, `high`). El autor advierte que con el thinking desactivado el modelo se degrada severamente y llega a repetir JSON en lugar de responder. El soporte de contexto largo se logra mediante RoPE hasta 232k, aunque el autor recomienda validar la calidad más allá de los 131k nativos para cada caso de uso.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable y presupuesto de tokens configurable.
- Asistencia en ciberseguridad ofensiva: generación de código de explotación, payloads y tácticas de atacante bajo petición (sin rechazos).
- OSINT e inteligencia de amenazas (CTI): respuesta a preguntas tipo test de dominios CyberMetric y CTIBench.
- Codificación segura y tareas de ingeniería de software.
- Soporte de tool calling / function calling, con fase de entrenamiento agéntica específica.
- Flujos agénticos multi-paso (el autor menciona benchmarks de Terminal-Bench, DeepSWE y AutomationBench en cola).
- Capacidades multilingües: limitadas al inglés según la model card.
- Compatible con endpoints (`endpoints_compatible`) y con llama.cpp mediante plantilla de chat explícita (`chat_template.jinja`).
- Sin capacidades de visión ni audio documentadas.

## Casos de uso

- Red team autorizado: el modelo genera payloads, código de explotación y tradecraft de atacante sin filtros de rechazo, lo que permite simular cadenas de ataque completas en laboratorios controlados y con autorización expresa.
- Análisis de inteligencia de amenazas (CTI): responde preguntas de opción múltiple sobre marcos y conceptos de ciberseguridad (85% en CyberMetric-80), útil para triaje y formación de analistas.
- Auditoría de código seguro: revisión de fragmentos de código y sugerencia de correcciones, con soporte de tool calling para integrarse en pipelines de CI/CD que consulten linters o escáneres.
- Agentes locales de pentesting: al soportar function calling y razonamiento multi-paso, puede orquestar herramientas (escáneres, shells) en un bucle agéntico ejecutado íntegramente en local.
- Despliegue air-gapped: al ser GGUF de 4B con licencia Apache 2.0, se ejecuta en estaciones de trabajo sin conexión, adecuado para entornos clasificados donde no se permite enviar datos a la nube.
- Formación y educación en seguridad: generación de escenarios de ataque y explicaciones técnicas en entornos de aprendizaje, con la salvedad de que las referencias a CVE deben verificarse contra fuentes primarias.
- Asistente de OSINT: con contexto de 131k tokens nativos, puede procesar grandes volúmenes de texto (informes, registros) para extraer indicadores y correlacionar información.

## Benchmarks y rendimiento

Evaluados en modo thinking, temperatura 0.0, muestreo greedy de una sola muestra, GGUF Q8_0 a 232k de contexto.

| Benchmark | Frost 1.0 | Frost v1.1 |
|---|---|---|
| CyberMetric-80 | — | 85,00% (68/80) |
| CyberMetric-500 | 87,8% | 84,80% (424/500) |
| CTIBench cti-mcq (muestra de 500) | 70,4% (set completo) | 58,20% (291/500) |
| GPQA Diamond (parcial) | — | 34,1% (41/198) |

Los benchmarks agénticos (Terminal-Bench, DeepSWE, AutomationBench) están pendientes de publicación según el autor. No se dispone de comparaciones con modelos de la misma categoría en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1,7 GB (Q2_K) hasta ~8,2 GB (BF16); el punto dulce Q4_K_M ocupa ~2,6 GB y Q8_0 ~4,4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q8_0; para contexto completo de 232k con caché KV cuantizada en q8_0 se recomienda 24 GB o más (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090 y equivalentes, usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de `-ngl 99`, caché KV unificada (`-np 2 -kvu`), flash attention (`-fa on`) y caché KV cuantizada (`-ctk q8_0 -ctv q8_0`). Requiere plantilla de chat explícita vía `--chat-template-file`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor desaconseja samplers de penalización por repetición (DRY) en tareas de código agéntico porque corrompen rutas e identificadores; recomienda temperatura ~0,3–0,4 y control de bucles en el cliente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Frost Cyber Mini Uncensored v1.1 | 4B | 131k nativo / 232k RoPE | Apache 2.0 | GGUF | Especializado en ciberseguridad, abliterado |
| Frost Cyber Mini 1.0 | no disponible | no disponible | no disponible | GGUF | Versión anterior del mismo autor; rendimiento inferior en CyberMetric-80 |
| Alternativas de 4B de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se han identificado en la información disponible modelos de ciberseguridad comparables con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Conocimiento de CVE poco fiable: el modelo puede inventar un fallo plausible pero incorrecto al consultarle por identificador. Verificar siempre contra una fuente primaria o proporcionarle una herramienta de búsqueda.
- Degradación severa sin thinking: con el razonamiento desactivado repite JSON en lugar de responder; el modo thinking es obligatorio en la práctica.
- Rendimiento irregular: cae de 87,8% a 84,8% en CyberMetric-500 y de 70,4% a 58,2% en CTIBench cti-mcq respecto a la versión 1.0.
- Modelo abliterado: los rechazos de seguridad están eliminados, por lo que puede generar contenido dañino; el usuario es responsable del uso y del cumplimiento legal.
- Solo inglés: no se documenta soporte multilingüe.
- Contexto: más allá de 131k tokens la calidad no está garantizada y debe validarse por caso de uso.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad legal sobre el uso ofensivo recae en el usuario.
- Sin datos de benchmarks agénticos publicados; el rendimiento en flujos de agentes no está verificado de forma independiente.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-GGUF
- Modelo base: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1
- Plantilla de chat: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1/blob/main/chat_template.jinja
- Versión anterior (Frost Cyber Mini 1.0 GGUF): https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-1.0-GGUF
- Repositorio de archivos de la versión 1.0: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-1.0-GGUF/tree/main
- Perfil del autor: https://huggingface.co/xblack
- Organización FrostWolfAI: https://huggingface.co/FrostWolfAI
