# rokoman/siem-triage-35b-th

## Resumen

siem-triage-35b-th es un modelo de lenguaje especializado en el triaje de registros de seguridad (SIEM/SOC) en tailandés, desarrollado por el usuario rokoman. Se trata de un fine-tune mediante LoRA sobre el modelo base Qwen/Qwen3.6-35B-A3B, una arquitectura MoE (Mixture of Experts) con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos. El modelo lee registros en bruto de WAF (nginx + ModSecurity) y NDR (Zeek) y devuelve un informe de incidente estructurado en JSON con categoría, severidad, evidencia clave, IPs implicadas, resumen y acción recomendada, todo en tailandés.

El problema que resuelve es concreto: automatizar la primera fase del triaje en un centro de operaciones de seguridad (SOC), separando falsos positivos (administradores, crawlers, balizas de CDN, enlaces compartidos) de ataques reales, y evitando recomendar el bloqueo de IPs internas. Es la variante de mayor tamaño de una familia de tres modelos (4B, 9B y 35B) y, según la model card, la más precisa en tareas SOC y de mapeo MITRE ATT&CK, además de ser la destinada a uso en producción.

La relevancia actual radica en su enfoque en un dominio muy específico (seguridad, logs de infraestructura) y en un idioma poco cubierto (tailandés), con un diseño explícito de seguridad frente a inyección de prompts en los propios logs y con salida estructurada JSON. Su licencia Apache-2.0 y la compatibilidad con vLLM facilitan su despliegue en entornos corporativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer, base Qwen3.6-35B-A3B; fine-tune LoRA (r=16 sobre attention, linear_attn y shared_expert) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (según model card: "MoE, active ~3B") |
| Longitud de contexto | No especificada en la información disponible; el ejemplo de despliegue usa `--max-model-len 8192` y el entrenamiento se hizo con max length 6144 |
| Tipos de cuantizacion | FP8 mencionado en la model card (aproximadamente 35 GB); no se detallan otras cuantizaciones |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con arquitectura MoE de 35.100 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Sobre esa base se aplicó un fine-tune LoRA con rango 16 sobre las capas de atención, las capas de atención lineal (linear_attn) y el experto compartido (shared_expert), durante 1 epoch y con una longitud máxima de secuencia de 6144 tokens.

Los datos de entrenamiento combinan registros de sistemas reales, previamente pseudonimizados de forma consistente (IPs, dominios, nombres y tokens sustituidos por valores ficticios como `*.example`), junto con tareas SOC sintéticas. Las respuestas fueron redactadas y revisadas siguiendo una guía de corrección definida. La model card indica que se verificó la ausencia de fugas de datos: no quedan dominios ni nombres de organizaciones reales en el conjunto de entrenamiento, y el modelo no revela dominios reales ni la tabla de mapeo entre valores reales y ficticios cuando se le pregunta. No se detalla el volumen total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

Como innovación destacable, el modelo está entrenado para no seguir instrucciones incrustadas en los propios logs y para responder únicamente en JSON, lo que mitiga ataques de inyección de prompts a través de los datos de entrada. El uso recomendado envuelve el log en bruto con las etiquetas `<UNTRUSTED_LOG_DATA>...</UNTRUSTED_LOG_DATA>`.

## Capacidades

- Triaje de WAF: clasificación en categorías `blocked_by_firewall`, `blocked_by_waf`, `passed_no_impact`, `passed_needs_review`, `false_positive` y `benign`.
- Triaje de NDR: clasificación en categorías como `intel_inbound`/`outbound_*`, `internal_scan`, `external_ssh_login`, `protocol_anomaly`, `perimeter_drop`, `noise` y `benign`.
- Asignación de severidad con escala de `info` a `critical`.
- Extracción de evidencia clave (`key_evidence`) e identificación de IPs relevantes.
- Generación de resumen (`summary_th`) y acción recomendada (`action_th`) en tailandés.
- Distinción explícita entre actividad legítima que genera alertas (administradores, crawlers, balizas de CDN, enlaces compartidos) y ataques reales.
- Recomendación de no bloquear IPs internas.
- Salida estructurada en JSON compatible con JSON schema.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (image-text-to-text): el pipeline declarado es text-generation y el despliegue recomendado limita imágenes y vídeo a 0, por lo que el uso efectivo es solo texto.
- Soporte de RAG para MITRE ATT&CK según la model card (requiere alrededor de 48 GB de VRAM o más cuando se usa FP8).
- Capacidades multilingües limitadas a tailandés e inglés.

## Casos de uso

- Triaje automatizado de alertas WAF en un SOC: el modelo recibe el log en bruto de nginx + ModSecurity y devuelve la categoría (`false_positive`, `passed_needs_review`, etc.), la severidad y una acción recomendada en tailandés, lo que permite priorizar la cola de alertas antes de la revisión humana.
- Análisis de tráfico NDR con Zeek: clasifica eventos como escaneos internos, inicios de sesión SSH externos, anomalías de protocolo o caídas de perímetro, y adjunta evidencia e IPs implicadas para acelerar la investigación.
- Reducción de falsos positivos: el modelo está entrenado específicamente para separar actividad legítima (administradores, crawlers, balizas de CDN, enlaces compartidos) de ataques reales, lo que reduce el ruido en el SOC.
- Enriquecimiento con MITRE ATT&CK mediante RAG: con un despliegue de aproximadamente 48 GB o más en FP8, se puede aumentar el modelo con una base de conocimiento ATT&CK para mapear incidentes a tácticas y técnicas.
- Generación de informes de incidente en tailandés: produce resúmenes (`summary_th`) y acciones (`action_th`) listos para incluir en tickets o informes internos dirigidos a analistas tailandeses.
- Integración en pipelines de automatización con salida JSON: al devolver JSON estructurado con un esquema fijo, puede conectarse a sistemas de ticketing, SIEM o SOAR para crear casos automáticamente, siempre con aprobación humana.
- Asistencia a analistas junior: actúa como primera capa de análisis que propone una clasificación y una acción, que el analista valida antes de cualquier respuesta.

## Benchmarks y rendimiento

Resultados publicados en la model card (ronda 3, conjunto de prueba de 1.377 casos de log):

| Modelo | Casos que pasan todos los criterios | Velocidad (c=16) | Veredicto SOC (público / conjunto B) |
|---|---|---|---|
| 4B | 94,3% | 2,02 casos/s | 68,6% / 78,1% |
| 9B | 93,6% | 1,39 casos/s | 70,0% / 86,0% |
| 35B (este modelo) | 94,4% | 1,09 casos/s | 84,7% / 90,6% |

El modelo de 35B (MoE, ~3B activos) alcanza un 94,4% de casos que pasan todos los criterios, una velocidad de 1,09 casos/s y un veredicto SOC del 84,7% en el conjunto público y del 90,6% en el conjunto B. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 35 GB en FP8 según la model card; el repositorio ocupa 71,9 GB en safetensors, por lo que en precisión completa se requiere un entorno multi-GPU o memoria unificada de al menos esa cifra.
- Para RAG sobre MITRE ATT&CK se recomienda un entorno con alrededor de 48 GB de VRAM o más usando FP8.
- GPU recomendadas: no se especifican modelos concretos; por el tamaño en FP8 encajan GPUs de 40-48 GB o superiores (A100 80 GB, H100, L40S 48 GB) y configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo típicas (24 GB o menos) en FP8; sería necesaria cuantización adicional no documentada.
- Opciones de despliegue: vLLM con API compatible con OpenAI, usando `--reasoning-parser qwen3` y limitando imagen y vídeo a 0. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,09 casos/s con concurrencia c=16 según la model card.
- Parámetros de inferencia recomendados: `temperature=0`, `chat_template_kwargs={"enable_thinking": false}` y salida estructurada con JSON schema.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (veredicto SOC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siem-triage-35b-th | 35,1B totales / ~3B activos | No especificado (ejemplo con 8192) | 84,7% público / 90,6% conjunto B | Apache-2.0 | HuggingFace |
| siem-triage-9b-th (misma familia) | 9B | No especificado | 70,0% público / 86,0% conjunto B | No disponible | HuggingFace |
| siem-triage-4b-th (misma familia) | 4B | No especificado | 68,6% público / 78,1% conjunto B | No disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables de triaje SIEM en tailandés en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó con tráfico de un único entorno; formatos de log distintos pueden requerir ajustes de prompt y una reevaluación.
- El tailandés puede presentar errores o desviaciones ocasionales.
- Aunque los datos de entrenamiento fueron pseudonimizados, un modelo fine-tune puede memorizar algunos patrones del conjunto de entrenamiento.
- No está diseñado para decidir bloqueos o respuestas automáticas sin revisión humana; cada resultado debe ser aprobado por un analista.
- La ventana de contexto efectiva no está documentada; el ejemplo de despliegue usa 8192 tokens y el entrenamiento se hizo con 6144.
- El soporte multilingüe se limita a tailandés e inglés; no se garantiza un comportamiento correcto en castellano.
- Riesgo de alucinación en la clasificación y en las acciones recomendadas, especialmente ante formatos de log no vistos durante el entrenamiento.
- No se documentan sesgos específicos más allá de la dependencia del entorno de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B.
- El modelo declara capacidades image-text-to-text en sus etiquetas, pero el uso previsto y el despliegue recomendado son solo de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rokoman/siem-triage-35b-th
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
