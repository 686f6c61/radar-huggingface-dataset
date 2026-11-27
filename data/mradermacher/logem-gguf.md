# mradermacher/logem-GGUF

## Resumen

logem es un modelo de lenguaje especializado en ciberseguridad, concretamente en el análisis de logs y la extracción de campos estructurados a partir de registros de sistemas SIEM. El modelo original fue desarrollado por HassanShehata y esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

Con aproximadamente 596 millones de parámetros, se trata de un modelo compacto derivado de una arquitectura transformer de tipo BERT-like o similar (la model card no especifica la arquitectura exacta del modelo base), ajustado específicamente para tareas de seguridad: parsing de logs, identificación de entidades en registros y automatización de flujos SOC. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia actual radica en la creciente demanda de modelos pequeños y especializados que puedan ejecutarse en infraestructura propia (on-premise) dentro de entornos de seguridad, donde la privacidad de los logs y la latencia baja son críticas. Este modelo ofrece una alternativa ligera frente a LLM generalistas para tareas acotadas de extracción de información en pipelines de detección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalle exacto no disponible) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en transformers/safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer ajustado (fine-tuned) para tareas de ciberseguridad, análisis de logs SIEM y extracción de campos. El modelo original (HassanShehata/logem) fue entrenado presumiblemente sobre datos de logs y registros de seguridad, si bien no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La versión descrita aquí es una cuantización estática realizada por mradermacher mediante conversión desde el formato Hugging Face (convert_type: hf) y cuantización de tensores de salida (output_tensor_quantised: 1, quantize_version: 2). También existe una variante con cuantización ponderada/imatrix en el repositorio logem-i1-GGUF, que suele ofrecer mejor calidad por tamaño en cuantizaciones bajas.

## Capacidades

- Análisis de logs de seguridad y registros SIEM.
- Extracción de campos estructurados a partir de texto no estructurado de logs.
- Automatización de tareas de seguridad (security-automation).
- Generación de texto conversacional en inglés.
- Clasificación e identificación de entidades en registros de sistemas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Parsing automatizado de logs SIEM: el modelo puede recibir líneas de log en bruto y devolver campos estructurados (IP origen, usuario, tipo de evento, severidad), integrándose en pipelines de ingesta para normalizar eventos antes de su correlación.
- Enriquecimiento de alertas en un SOC: dado un evento de seguridad, el modelo extrae entidades relevantes (hosts, cuentas, procesos) que alimentan sistemas de ticketing o plataformas SOAR.
- Clasificación de eventos de seguridad: uso del modelo para etiquetar registros por categoría (autenticación fallida, acceso a recursos, cambios de configuración) en flujos de triaje automatizado.
- Normalización de formatos heterogéneos: conversión de logs de distintos orígenes (firewall, Windows Event Log, syslog) a un esquema común mediante extracción de campos guiada por el modelo.
- Detección de anomalías asistida: el modelo puede resumir o describir patrones en lotes de logs para que analistas humanos prioricen la revisión.
- Despliegue on-premise en entornos sensibles: al ser un modelo de ~0,6 B parámetros cuantizado a 0,5 GB en Q4, puede ejecutarse en máquinas modestas dentro de la red corporativa sin enviar logs a servicios externos, cumpliendo requisitos de privacidad.
- Automatización de documentación de incidentes: generación de resúmenes en inglés a partir de registros técnicos para informes de incidentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en cuantizaciones Q2-Q5, 0,6-0,7 GB en Q6/Q8 y 1,3 GB en f16 (tamaños de archivo indicados en la model card).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. En el extremo profesional, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo original es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (~0,6 B parámetros) se espera latencia muy baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| logem (este) | ~596 M | No disponible | Apache 2.0 | Ciberseguridad, logs SIEM |
| Modelos BERT-base genéricos | ~110 M | 512 tokens típicamente | Varía (Apache/MIT) | NLP general |
| LLM generalistas pequeños (p. ej., Qwen2.5-0.5B) | ~500 M | 32 K tokens típicamente | Apache 2.0 | Propósito general |
| Modelos especializados en seguridad de mayor tamaño | >7 B | Varía | Varía | Ciberseguridad |

No se dispone de datos de rendimiento comparativo entre logem y estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se han validado capacidades en castellano ni en otros idiomas.
- Al ser un modelo especializado y de tamaño reducido, es probable que sufra alucinaciones fuera de su dominio de entrenamiento (logs y seguridad).
- No se especifican sesgos conocidos, pero al entrenarse sobre datos de seguridad podría heredar sesgos de los corpus utilizados (por ejemplo, sobrerrepresentación de ciertos formatos de log).
- La longitud de contexto no está documentada; conviene validar empíricamente cuántos tokens de log admite por entrada antes de usarlo en producción.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar la precisión en la extracción de campos; se recomienda Q4_K_M o superior para tareas críticas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base original debe verificarse por si añade restricciones adicionales (la model card indica Apache 2.0 también para el original).
- No hay evidencia publicada de benchmarks que respalde su rendimiento frente a alternativas; se recomienda evaluarlo con un conjunto propio de logs antes de adoptarlo.
- El modelo no soporta tool calling ni flujos de agente de forma nativa según la información disponible.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/logem-GGUF
- Modelo base original: https://huggingface.co/HassanShehata/logem
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/logem-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#logem-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
