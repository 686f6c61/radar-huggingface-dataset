# rokoman/siem-triage-4b-th

## Resumen

siem-triage-4b-th es un ajuste fino (LoRA) del modelo Qwen/Qwen3.5-4B desarrollado por el usuario rokoman, orientado al triaje de registros de seguridad (SIEM/SOC) en tailandés. El modelo lee logs en bruto de WAF (nginx + ModSecurity) y de NDR (Zeek) y devuelve un informe de incidente en formato JSON con la categoría del evento, el nivel de severidad, la evidencia clave, las IP implicadas y un resumen y una acción recomendada redactados en tailandés. Es el miembro más pequeño de una familia de tres tamaños (4B / 9B / 35B), pensado para equipos con recursos de memoria limitados.

El modelo parte de una arquitectura Qwen3.5 con 4.539.265.536 parámetros totales, formato de pesos safetensors y licencia Apache-2.0. Soporta tailandés e inglés y está diseñado específicamente para distinguir falsos positivos operativos (administradores, crawlers, balizas de CDN, enlaces compartidos) de ataques reales, evitando recomendar el bloqueo de IP internas.

Su relevancia actual radica en que automatiza la primera capa de triaje en un SOC sin requerir hardware de gama alta (aproximadamente 8 GB de VRAM en FP8), manteniendo la decisión final en manos de un analista humano. El autor advierte explícitamente de que no debe emplearse para bloquear o responder de forma automática sin revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (ajuste LoRA sobre Qwen/Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de despliegue con `--max-model-len 8192`); longitud máxima de entrenamiento: 6144 |
| Tipos de cuantizacion | FP8 (aproximadamente 5,2 GB según la model card); otras cuantizaciones no disponibles |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (r=16) sobre Qwen/Qwen3.5-4B, aplicado sobre las capas de atención, `linear_attn` y `shared_expert`. El entrenamiento consistió en 1 época con una longitud máxima de secuencia de 6144 tokens. Los datos de entrenamiento combinan logs de sistemas reales, previamente pseudonimizados de forma sistemática (IP, dominios, nombres y tokens sustituidos por valores ficticios como `*.example`), junto con tareas SOC sintéticas cuyas respuestas fueron redactadas y revisadas conforme a una guía de corrección definida. El autor declara haber verificado que no quedan dominios ni nombres de organización reales en los datos de entrenamiento y que el modelo no revela dominios reales ni la tabla de mapeo entre valores reales y ficticios cuando se le pregunta.

El modelo incorpora una etiqueta `image-text-to-text` y el ejemplo de despliegue desactiva explícitamente las modalidades de imagen y vídeo (`--limit-mm-per-prompt '{"image":0,"video":0}'`), lo que sugiere que la arquitectura base Qwen3.5 es multimodal pero el ajuste se centra en texto. El modelo está entrenado para no seguir instrucciones incrustadas en los logs y para responder únicamente en JSON; el uso previsto envuelve el log en bruto con las etiquetas `<UNTRUSTED_LOG_DATA>...</UNTRUSTED_LOG_DATA>`.

## Capacidades

- Triaje de WAF: clasificación en las categorías `blocked_by_firewall`, `blocked_by_waf`, `passed_no_impact`, `passed_needs_review`, `false_positive` y `benign`.
- Triaje de NDR: clasificación en `intel_inbound/outbound_*`, `internal_scan`, `external_ssh_login`, `protocol_anomaly`, `perimeter_drop`, `noise` y `benign`.
- Asignación de severidad en una escala de `info` a `critical`.
- Extracción de evidencia clave (`key_evidence`) e identificación de las IP relevantes.
- Generación de resumen (`summary_th`) y acción recomendada (`action_th`) en tailandés.
- Distinción de falsos positivos operativos (administradores, crawlers, balizas de CDN, enlaces compartidos) frente a ataques reales.
- Restricción de no recomendar el bloqueo de IP internas.
- Salida estructurada en JSON compatible con esquemas de structured output.
- Resistencia a inyección de instrucciones a través del contenido de los logs.
- Capacidad de razonamiento configurable mediante `enable_thinking` (desactivado en el uso recomendado).
- Soporte multilingüe limitado a tailandés e inglés.

## Casos de uso

- Triaje automatizado de alertas WAF en un SOC: el modelo recibe el log en bruto de nginx + ModSecurity y devuelve la categoría y severidad, lo que permite priorizar la cola de alertas antes de la revisión humana.
- Filtrado de eventos NDR de Zeek: clasifica escaneos internos, inicios de sesión SSH externos y anomalías de protocolo, separando el ruido de los incidentes que requieren investigación.
- Reducción de falsos positivos: identifica tráfico legítimo de administradores, crawlers o balizas de CDN que ha disparado alertas, evitando escalados innecesarios.
- Generación de resúmenes en tailandés para analistas: produce `summary_th` y `action_th` que un analista tailandés puede revisar y aprobar directamente, reduciendo el tiempo de documentación.
- Enriquecimiento de pipelines SIEM: integrado mediante una API compatible con OpenAI (vLLM), puede insertarse como etapa de normalización y clasificación entre la ingesta de logs y el sistema de tickets.
- Despliegue en entornos con hardware limitado: con aproximadamente 5,2 GB en FP8, puede ejecutarse en una GPU de consumo de gama media-alta, lo que permite triaje local sin enviar logs a servicios externos.
- Prefiltrado previo a modelos mayores: como miembro más pequeño de la familia, puede usarse para descartar eventos benignos y derivar solo los casos complejos a las variantes de 9B o 35B.

## Benchmarks y rendimiento

Resultados publicados por el autor (ronda 3, conjunto de prueba de 1.377 casos de log):

| Modelo | Triaje que supera todos los criterios | Velocidad (c=16) | Veredicto SOC (público / conjunto B) |
|---|---|---|---|
| 4B (este modelo) | 94,3% | 2,02 casos/s | 68,6% / 78,1% |
| 9B | 93,6% | 1,39 casos/s | 70,0% / 86,0% |
| 35B | 94,4% | 1,09 casos/s | 84,7% / 90,6% |

El 4B alcanza la mayor velocidad de la familia (2,02 casos/s con concurrencia 16) y un triaje del 94,3%, aunque su veredicto SOC es inferior al de las variantes mayores, especialmente en el conjunto B (78,1% frente al 86,0% del 9B y el 90,6% del 35B).

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,2 GB en FP8 según la model card; el autor indica alrededor de 8 GB de VRAM en FP8 para el despliegue.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el tamaño en FP8, cabe en GPU de consumo con 8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, con cuantización FP8 y al menos 8 GB de VRAM.
- Opciones de despliegue: vLLM con API compatible con OpenAI (ejemplo oficial con `--served-model-name siem --max-model-len 8192 --reasoning-parser qwen3`); otras opciones (llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: 2,02 casos/s con concurrencia 16 según el benchmark del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Triaje (todos los criterios) | Veredicto SOC (público / B) | Velocidad (c=16) | Licencia |
|---|---|---|---|---|---|---|
| siem-triage-4b-th | 4,54B | 8192 | 94,3% | 68,6% / 78,1% | 2,02 casos/s | Apache-2.0 |
| siem-triage-9b-th (misma familia) | no disponible | no disponible | 93,6% | 70,0% / 86,0% | 1,39 casos/s | no disponible |
| siem-triage-35b-th (misma familia) | no disponible | no disponible | 94,4% | 84,7% / 90,6% | 1,09 casos/s | no disponible |

No se dispone de datos de modelos de triaje SIEM de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con tráfico de un único entorno: formatos de log distintos pueden requerir ajustes de prompt y una reevaluación completa.
- El tailandés puede presentar degradaciones ocasionales según el propio autor.
- Aunque los datos fueron pseudonimizados, un modelo ajustado puede memorizar patrones del conjunto de entrenamiento.
- No debe usarse para bloquear o responder de forma automática sin revisión humana; cada resultado debe ser aprobado por un analista.
- El veredicto SOC en el conjunto público es del 68,6%, sustancialmente inferior al de las variantes de 9B y 35B, por lo que los casos complejos deberían derivarse a modelos mayores.
- El soporte lingüístico se limita a tailandés e inglés; no se documenta rendimiento en castellano.
- Riesgo de alucinación en la clasificación no cuantificado en la información disponible.
- Licencia Apache-2.0, que permite uso comercial con las obligaciones habituales de atribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rokoman/siem-triage-4b-th
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
