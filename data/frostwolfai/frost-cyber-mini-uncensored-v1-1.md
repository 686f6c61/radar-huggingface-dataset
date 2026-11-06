# FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1

## Resumen

Frost Cyber Mini Uncensored v1.1 es un modelo de lenguaje de 4.112 millones de parámetros desarrollado por FrostWolfAI Labs (Vatsal Bajpai) como asistente compacto especializado en ciberseguridad, inteligencia de amenazas (CTI), codificación segura y flujos de trabajo con agentes y uso de herramientas. Es un ajuste fino completo por SFT con LoRA sobre Spark-X2.6-4B-abliterated, con los adaptadores fusionados en los pesos, y una segunda fase de entrenamiento orientada a bucles agénticos de tool-use. Se distribuye bajo licencia Apache 2.0 y solo soporta inglés.

La arquitectura es propietaria (`Spark2_5ForCausalLM`, código personalizado), con 36 capas y un tamaño oculto de 2560. El contexto nativo es de 131.072 tokens, aunque el autor lo sirve hasta 232.000 tokens mediante RoPE. El modelo está "abliterated" (filtrado de seguridad sustancialmente reducido) y genera código de explotación, payloads y tácticas de atacante bajo petición, lo que lo sitúa en la categoría de modelos ofensivos sin censura.

La relevancia actual radica en su tamaño compacto (cabe en GPU de consumo) combinado con un contexto muy largo y soporte de razonamiento con canal de "thinking" obligatorio. No obstante, el propio autor advierte de que el modelo degrada severamente sin thinking activado y de que alucina detalles de CVE consultados por identificador, lo que exige verificación externa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Spark2_5ForCausalLM` (código personalizado, transformer, 36 capas, hidden size 2560) |
| Parametros totales | 4.112.079.360 (~4,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens nativos; servido hasta 232.000 con RoPE |
| Tipos de cuantizacion | BF16 (original); GGUF Q8_0 publicado; otras cuantizaciones GGUF no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~8,2 GB); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo se basa en `Spark2_5ForCausalLM`, una arquitectura transformer de código personalizado con 36 capas y dimensión oculta de 2560, que requiere `transformers` v5 y `trust_remote_code=True`. El modelo base es Spark-X2.6-4B-abliterated, a su vez una abliteración (eliminación de direcciones de rechazo) del modelo XHToken/Spark-X2.6-4B. Sobre esa base se aplicó un ajuste fino SFT completo con LoRA, cuyos adaptadores se fusionaron en los pesos finales.

El entrenamiento consta de dos fases: una primera de SFT especializada en ciberseguridad, CTI y codificación segura, y una segunda fase agéntica (v1.1) que entrena al modelo para seguir un bucle completo de uso de herramientas: leer la tarea, inspeccionar con herramientas, actuar, observar cada resultado, recuperarse de errores y dar una respuesta final, en lugar de emitir respuestas de un solo paso. El autor indica que las curvas de entrenamiento y pérdida de ambas fases están disponibles en la sección Training de la model card, aunque los detalles concretos (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la información disponible.

Una innovación destacable es el control de razonamiento mediante `reasoning_effort` en la plantilla de chat, con un techo duro de tokens de thinking aplicado en el servidor (`--reasoning-budget`). El autor subraya que el thinking es obligatorio: sin él, el modelo degrada severamente y repite JSON en lugar de responder.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (131k nativos, hasta 232k servidos).
- Conocimiento especializado en ciberseguridad: CTI, threat intelligence, codificación segura y análisis de seguridad.
- Generación de código de explotación, payloads y tácticas de atacante (modelo abliterated, sin censura).
- Razonamiento con canal de "thinking" controlable mediante `reasoning_effort` (`off`/`low`/`high`).
- Uso de herramientas (tool calling) y function calling dentro de bucles agénticos multi-paso.
- Recuperación de errores tras observar resultados de herramientas y emisión de respuesta final.
- Capacidades de agente autónomo: inspección, acción, observación y corrección.
- Soporte de plantilla de chat Jinja (`chat_template.jinja`) para servidores compatibles.
- Capacidades multilingües: solo inglés.

## Casos de uso

- **Análisis de inteligencia de amenazas (CTI):** el modelo puede responder preguntas de opción múltiple sobre tácticas, técnicas y procedimientos (TTP) y threat intelligence, con un rendimiento estable en torno al 85% en CyberMetric, adecuado para triaje y enriquecimiento de informes.
- **Codificación segura en pipelines de CI/CD:** puede revisar código en busca de vulnerabilidades y proponer parches, integrándose mediante tool calling en flujos automatizados de revisión de seguridad.
- **Pruebas de penetración asistidas:** genera payloads y código de explotación bajo petición, útil en entornos de laboratorio autorizados para validar defensas y reproducir vectores de ataque.
- **Agentes de seguridad autónomos:** gracias a la fase agéntica, puede ejecutar bucles de inspección-acción-observación con herramientas (escáneres, consultas a APIs) y recuperarse de errores, adecuado para automatizar tareas de reconocimiento y correlación.
- **Atención a analistas SOC:** con 131k tokens de contexto nativo, puede procesar logs extensos, alertas y conversaciones multi-turno para resumir incidentes y sugerir hipótesis de investigación.
- **Asistente de ingeniería de software:** generación y revisión de código, explicación de fragmentos y ayuda en tareas de desarrollo, con contexto largo para manejar repositorios o documentación extensa.
- **Formación y concienciación en seguridad:** simulación de escenarios de ataque y explicación de técnicas ofensivas en entornos educativos controlados.

## Benchmarks y rendimiento

Evaluado en modo thinking nativo, temperatura 0.0, muestra única greedy, servido como GGUF Q8_0 con llama.cpp a 232k de contexto.

| Benchmark | Frost 1.0 | Frost v1.1 | Notas |
|---|---|---|---|
| CyberMetric-80 | — | 85,00% (68/80) | 0 fallos de parseo |
| CyberMetric-500 | 87,8% | 84,80% (424/500) | estable ~85% durante la ejecución |
| CTIBench cti-mcq (muestra de 500) | 70,4% (2.500 completo) | 58,20% (291/500) | tamaños de muestra distintos, no comparables directamente |
| GPQA Diamond (parcial, 198 preguntas) | — | 34,1% (41/198) | aleatorio = 25%, humano no experto = 34%, experto PhD = 65% |

Los benchmarks agénticos (Terminal-Bench 2.1/4.0, DeepSWE, AutomationBench) están pendientes de publicación según el autor. El conocimiento de ciberseguridad se mantuvo en gran medida tras la fase agéntica (CyberMetric-500 dentro de 3 puntos de Frost 1.0), mientras que el rendimiento en CTI/threat-intel MCQ retrocedió en la muestra evaluada.

## Requisitos de hardware

- **VRAM estimada:** el modelo en BF16 ocupa ~8,2 GB, por lo que requiere al menos 10-12 GB de VRAM efectiva para inferencia con overhead. En GGUF Q8_0 el peso ronda los 4-5 GB, permitiendo despliegue en GPUs de 8 GB.
- **GPU recomendadas:** A100 y H100 para servir a contexto completo (232k) con múltiples slots KV; RTX 4090 (24 GB) para contexto largo con cuantización; RTX 3090/4080 para contexto moderado.
- **Consumer GPU:** sí cabe en GPUs de consumo; con Q8_0 o cuantizaciones menores es viable en tarjetas de 8-12 GB, aunque el contexto completo de 232k exige más memoria KV.
- **Opciones de despliegue:** llama.cpp (`llama-server`) con soporte nativo de la arquitectura `spark2_5` vía `convert_hf_to_gguf.py`; transformers v5 con `trust_remote_code=True`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- **Latencia y throughput:** no disponibles. El autor documenta el uso de `-fa on`, KV cache en q8_0 y 2 slots unificados KV para servir a 232k en Windows.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Frost Cyber Mini Uncensored v1.1 | ~4,1B | 131k nativo / 232k servido | Apache 2.0 | Ciberseguridad ofensiva, agéntico, sin censura | HF (safetensors + GGUF) |
| Frost Cyber Mini 1.0 | no disponible | no disponible | no disponible | Ciberseguridad ofensiva abliterated | HF (GGUF) |
| Spark-X2.6-4B-abliterated (base) | ~4,1B | no disponible | no disponible | Base abliterated sin especialización | HF |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada. La comparación con Frost Cyber Mini 1.0 se limita a los resultados de CyberMetric y CTIBench recogidos en la tabla de benchmarks.

## Limitaciones y advertencias

- **Alucinación de CVE:** el modelo inventa detalles de vulnerabilidades consultadas por identificador. En pruebas, `CVE-2021-44228` devolvió un bug del kernel de Linux inexistente, y "Log4Shell" identificó correctamente Apache Log4j2 pero con causa raíz errónea. Verificar siempre contra fuentes primarias o proporcionar una herramienta de consulta.
- **Thinking obligatorio:** sin thinking activado el modelo degrada severamente y repite JSON en lugar de responder; las puntuaciones sin thinking no son válidas.
- **Modelo abliterated sin censura:** el filtrado de seguridad está sustancialmente reducido y genera código de explotación, payloads y tácticas de atacante bajo petición, con el riesgo legal y ético que ello conlleva.
- **Solo inglés:** no soporta otros idiomas, lo que limita su uso en entornos hispanohablantes.
- **Regresión en CTI:** el rendimiento en threat-intel MCQ bajó respecto a Frost 1.0 en la muestra evaluada (58,20% frente a 70,4%, con tamaños de muestra distintos).
- **Dependencia de código personalizado:** requiere `transformers` v5 y `trust_remote_code=True`, lo que implica ejecutar código del autor y limita la compatibilidad con herramientas estándar.
- **Licencia Apache 2.0:** permite uso comercial, pero el contenido generado (exploits, payloads) puede infringir normativas de ciberseguridad según jurisdicción; el usuario asume la responsabilidad.
- **Contexto servido a 232k:** el contexto nativo es 131k; la extensión a 232k depende de RoPE y de la configuración del servidor, con posible degradación en ventanas muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1
- Repositorio GGUF: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-GGUF
- Modelo base: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Frost Cyber Mini 1.0 GGUF: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-1.0-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/xblack
- Organización: https://huggingface.co/FrostWolfAI
