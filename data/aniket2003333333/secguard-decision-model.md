# Aniket2003333333/secguard-decision-model

## Resumen

SecGuard Decision Model v1.0.0 es un sistema de guardarraíles (guardrails) para aplicaciones basadas en LLM y agentes autónomos, publicado por el usuario Aniket2003333333 bajo licencia MIT. No se trata de una red neuronal única, sino de un motor de decisión que combina normalización y desofuscación de texto, reglas sensibles a la procedencia del contenido, validación AST de SQL generado, detección de PII con validación de checksums y, opcionalmente, clasificadores transformer. El resultado es una decisión categórica entre `allow`, `sanitize`, `review` y `block`.

El modelo aborda un problema creciente en despliegues de agentes: la entrada al LLM no es solo el prompt del usuario, sino también documentos recuperados, resultados de herramientas y salidas de otros modelos. SecGuard segmenta la petición por procedencia (`source`) y aplica reglas específicas a contenido no confiable, lo que permite detectar inyecciones indirectas o multi-hop que un filtro de prompt plano no capturaría.

La relevancia actual radica en su enfoque por capas y su latencia: el modo solo-reglas opera en torno a 0,22 ms de mediana en CPU, mientras que el modo con clasificadores ML sube a unos 26,55 ms. Cubre inyección de prompt, inyección SQL (texto y AST), PII y secretos, jailbreaks, inyección de comandos, path traversal, SSRF, XSS y template injection.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de decisión por capas: normalización/desofuscación, reglas con procedencia, validación AST de SQL, detección de PII con checksums y clasificadores transformer opcionales |
| Parametros totales | no disponible (no es un modelo neuronal único; los clasificadores ML son terceros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (no se distribuyen pesos cuantizados; los clasificadores opcionales dependen de sus propios formatos) |
| Idiomas soportados | Reglas centradas en inglés, con cobertura parcial de alemán, español, francés, chino e hinglish para las principales frases de override |
| Licencia | MIT |
| Formato de pesos | Configuración JSON (`config.json`) y paquete Python importable (`secguard`); no se publican safetensors ni GGUF propios |

## Arquitectura y entrenamiento

SecGuard no es un transformer entrenado de extremo a extremo, sino un pipeline determinista con componentes opcionales de ML. La capa base normaliza y desofusca el texto (por ejemplo, homoglifos, codificaciones, separadores insertados) antes de aplicar reglas. Cada segmento de la petición lleva una etiqueta de procedencia (`source`), de modo que el motor puede tratar de forma distinta el prompt del usuario y un documento recuperado. La validación SQL se realiza mediante análisis AST, no solo por coincidencia de patrones, lo que reduce falsos positivos sobre consultas legítimas. La detección de PII incorpora validación de checksums (Luhn, Verhoeff/Aadhaar, IBAN, PAN) y patrones para claves de API, JWT y URLs de base de datos.

Los umbrales se calibraron sobre particiones de *tune* maximizando el recall macro con FPR ≤ 2 % y se congelaron antes de la evaluación en *held-out*. Los clasificadores ML son modelos de terceros con sus propias licencias y límites; la configuración permite fijar `revision` en `config.ml_models`. Los conjuntos de datos citados en la model card son `deepset/prompt-injections`, `xTRam1/safe-guard-prompt-injection`, `salmane11/SQLShield` y `ai4privacy/pii-masking-300k`, además de SecLists y conjuntos sintéticos multi-hop. No se especifican volúmenes de tokens de entrenamiento ni detalles de RLHF/DPO, ya que no hay un entrenamiento fundacional propio.

## Capacidades

- Detección de inyección de prompt directa e inyección indirecta multi-hop con procedencia de la fuente.
- Detección de inyección SQL tanto en texto como mediante validación AST de la consulta generada.
- Detección de PII y secretos con validación de checksums: Luhn, Verhoeff/Aadhaar, IBAN, PAN, claves de API, JWT y URLs de base de datos.
- Detección de jailbreaks y contenido inseguro dentro de la banda de revisión.
- Detección de inyección de comandos, path traversal (LFI), SSRF, XSS y template injection (SSTI).
- Decisión categórica unificada: `allow`, `sanitize`, `review`, `block`, con puntuación de riesgo y razones explicables.
- Soporte de segmentación por procedencia para distinguir contenido del usuario, documentos recuperados y salidas de herramientas.
- Integración opcional de clasificadores transformer y de escáneres externos (por ejemplo, Presidio para NER de nombres y direcciones).
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-step por sí mismo.

## Casos de uso

- Protección de pipelines RAG: cada documento recuperado se etiqueta con `source="retrieved_doc"` y el motor aplica reglas de procedencia para bloquear instrucciones embebidas en el contenido antes de que lleguen al LLM. Adecuado por su detección específica de inyección multi-hop.
- Validación de SQL generado por un agente text-to-SQL: el análisis AST detecta consultas maliciosas o no autorizadas antes de ejecutarlas contra la base de datos, con un recall del 95,0 % y FPR del 0,6 % en el conjunto agregado de inyección SQL.
- Filtrado de PII en entradas y salidas: validación de checksums para IBAN, PAN, Aadhaar y claves de API antes de registrar logs o enviar datos a un proveedor externo. El recall de PII es del 74,8 % con FPR del 0,1 %.
- Puerta de seguridad en agentes con tool calling: inspección de los argumentos de las herramientas (comandos de shell, rutas de fichero, URLs) para bloquear inyección de comandos, path traversal y SSRF. La detección de inyección de comandos alcanza el 100 % en el conjunto SecLists.
- Moderación de entrada en asistentes conversacionales: clasificación en `allow`/`review`/`block` con latencia de 0,22 ms en modo reglas, apta para prefiltrar antes de invocar el LLM y reducir coste.
- Cumplimiento y auditoría: registro de decisiones con `reasons` explicables para trazabilidad en revisiones de seguridad y auditorías de tratamiento de datos personales.
- Defensa en profundidad en gateways de LLM: despliegue como microservicio previo al modelo principal, combinando reglas rápidas y clasificadores ML solo en la banda de revisión para minimizar latencia.

## Benchmarks y rendimiento

Evaluación en *held-out* con intervalos de confianza Wilson al 95 %; PPV calculado con prevalencia de ataque asumida del 1 %.

| Categoria | Positivos | Negativos | Recall (IC 95 %) | FPR (limite sup. 95 %) | F1 | PPV @1 % |
|---|---:|---:|---|---:|---:|---:|
| jailbreak_safety | 139 | 3095 | 21,6 % (15,6–29,1) | 2,3 % (2,9) | 0,25 | 8,6 % |
| multi_hop_injection | 1468 | 3025 | 63,8 % (61,3–66,2) | 0,6 % (1,0) | 0,77 | 50,7 % |
| other_security | 2073 | 1034 | 85,1 % (83,5–86,6) | 1,2 % (2,0) | 0,92 | 42,6 % |
| pii | 2000 | 2000 | 74,8 % (72,9–76,7) | 0,1 % (0,3) | 0,86 | 93,8 % |
| prompt_injection | 2645 | 3505 | 94,5 % (93,5–95,3) | 23,4 % (24,8) | 0,84 | 3,9 % |
| sql_injection | 1785 | 3525 | 95,0 % (93,9–95,9) | 0,6 % (0,9) | 0,97 | 61,7 % |
| MACRO-AVG | 10110 | 16184 | 72,5 % | 4,7 % | 0,77 | 43,5 % |

Resultados por conjunto de datos destacados:

| Dataset | Categoria | Recall | FPR | p50 ms | p95 ms |
|---|---|---:|---:|---:|---:|
| deepset_test | prompt_injection | 41,7 % | 0,0 % | 47,6 | 47,6 |
| safeguard_test | prompt_injection | 84,8 % | 0,3 % | 37,3 | 50,0 |
| jayavibhav_test | prompt_injection | 98,5 % | 76,9 % | 15,8 | 30,7 |
| gandalf_ignore | prompt_injection | 99,9 % | – | 2,1 | 4,5 |
| jbb_behaviors | jailbreak_safety | 4,0 % | 1,0 % | 3,0 | 3,0 |
| toxicchat_jailbreak | jailbreak_safety | 66,7 % | 3,0 % | 27,2 | 37,6 |
| sqlshield_nlq_test | sql_injection | 100,0 % | 0,7 % | 6,9 | 8,8 |
| sqlshield_sql_test | sql_injection | 92,8 % | 0,2 % | 0,7 | 1,0 |
| ai4privacy_val | pii | 74,8 % | – | 1,6 | 1,8 |
| synthetic_mh_heldout | multi_hop_injection | 51,0 % | 0,5 % | 34,1 | 38,5 |
| injecagent | multi_hop_injection | 89,2 % | – | 12,0 | 49,7 |
| seclists_cmdi | other_security | 100,0 % | – | 0,8 | 1,0 |
| seclists_lfi | other_security | 35,3 % | – | 4,8 | 6,0 |
| seclists_ssti | other_security | 22,2 % | – | 3,3 | 3,3 |
| spider_q_val | benign | – | 1,2 % | 5,1 | 7,0 |
| squad_docs_val | benign | – | 0,7 % | 33,9 | 41,6 |

Latencia en una sola petición: modo reglas `p50 = 0,22 ms`, `p95 = 0,35 ms`; modo reglas + ML `p50 = 26,55 ms`, `p95 = 30,07 ms`.

## Requisitos de hardware

- Modo solo reglas: ejecutable en CPU sin requisitos de VRAM; latencias de sub-milisegundo por petición.
- Modo con clasificadores ML: requiere cargar los transformadores de terceros configurados en `config.ml_models`; la VRAM depende de esos modelos y no está especificada en la información disponible.
- GPU recomendadas: no disponible para los clasificadores concretos; en modo reglas no se necesita GPU.
- Cabe en GPU de consumo: el motor de reglas sí; los clasificadores ML dependen de su tamaño, no especificado.
- Opciones de despliegue: paquete Python `secguard` instalado vía `snapshot_download` de Hugging Face; integrable como microservicio previo a vLLM, TGI, llama.cpp u Ollama, ya que opera sobre texto y no sobre pesos del LLM principal.
- Throughput: no disponible de forma agregada; las latencias p50/p95 por petición indican capacidad de prefiltrar en línea con el modo reglas.

## Comparativa con modelos similares

| Sistema | Tipo | Cobertura | Latencia típica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecGuard Decision Model | Motor de decisión por capas con reglas, AST y ML opcional | Inyección prompt/SQL, PII, jailbreak, comandos, LFI, SSRF, XSS, SSTI | 0,22 ms (reglas) / 26,55 ms (reglas+ML) | MIT | Hugging Face, 26 descargas |
| Llama Guard (Meta) | Clasificador generativo | Moderación de contenido y seguridad conversacional | Depende del tamaño del modelo | Licencia comunitaria Llama | Hugging Face |
| NeMo Guardrails (NVIDIA) | Framework de rails programables | Configurable por el usuario | Depende de la configuración | Apache 2.0 | GitHub y pip |
| Presidio (Microsoft) | Detección de PII | PII y entidades nombradas | Baja, basada en reglas y NER | MIT | GitHub y pip |

La comparación es cualitativa: no se dispone de resultados de benchmarks de los sistemas alternativos en la información proporcionada para una comparación numérica directa.

## Limitaciones y advertencias

- Las reglas están centradas en inglés; la cobertura de otros idiomas (de, es, fr, zh, hinglish) es parcial y limitada a frases de override principales.
- Los nombres y direcciones requieren un NER externo (por ejemplo, Presidio vía `extra_scanners`); no se detectan por reglas.
- La moderación general de contenido dañino solo está cubierta parcialmente por expresiones regulares; se recomienda combinarla con un modelo de moderación o `llm_judge` para la banda de revisión.
- El recall de jailbreak_safety es bajo (21,6 % agregado; 4,0 % en jbb_behaviors), por lo que no es fiable como único filtro de jailbreaks.
- El FPR de prompt_injection es elevado en agregado (23,4 %) y especialmente alto en jayavibhav_test (76,9 %), lo que puede generar bloqueos legítimos si se aplica `block` sin calibrar.
- Los conjuntos sintéticos multi-hop y las listas de payloads de SecLists son proxies; se debe validar sobre tráfico propio antes de imponer `block`.
- Los clasificadores ML son modelos de terceros con sus propias licencias y límites; conviene fijar `revision` en `config.ml_models` para reproducibilidad.
- No sustituye a controles de defensa en profundidad: roles de base de datos con mínimo privilegio, consultas parametrizadas, controles de egreso y codificación de salida siguen siendo necesarios.
- Licencia MIT permite uso comercial, pero las licencias de los clasificadores de terceros y de los datasets de evaluación deben revisarse por separado.
- Riesgo de alucinación no aplica directamente al no ser un modelo generativo; el riesgo principal es de clasificación (falsos positivos y negativos).

## Enlaces

- Hugging Face: https://huggingface.co/Aniket2003333333/secguard-decision-model
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset xTRam1/safe-guard-prompt-injection: https://huggingface.co/datasets/xTRam1/safe-guard-prompt-injection
- Dataset salmane11/SQLShield: https://huggingface.co/datasets/salmane11/SQLShield
- Dataset ai4privacy/pii-masking-300k: https://huggingface.co/datasets/ai4privacy/pii-masking-300k
- Repositorio SecLists: https://github.com/danielmiessler/SecLists
- Presidio (Microsoft): https://github.com/microsoft/presidio
