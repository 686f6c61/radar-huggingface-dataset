# GoktugD/NanoSOC-Gemstone-2B-GGUF

## Resumen

NanoSOC Gemstone 2B es un modelo de análisis de operaciones de seguridad (SOC) desarrollado por GoktugD, diseñado específicamente para el triaje estructurado de eventos de seguridad en hardware de borde con solo 4 GB de RAM, como la placa T3 Gemstone O1 / AM67A. Se basa en el modelo Qwen/Qwen3.5-2B y se publica en formato GGUF cuantizado, listo para ejecutarse con llama.cpp. El modelo consume eventos normalizados procedentes de herramientas como Zeek, Suricata o Wazuh y devuelve una salida JSON estricta con una decisión, evidencia, atribución MITRE ATT&CK y un siguiente paso revisable por un analista.

El ajuste fino se realizó con QLoRA de 4 bits NF4 con rango 16 sobre un conjunto de 9.129 ejemplos estructurados de SOC, divididos en 5.872 casos de evidencia insuficiente y 3.257 casos sospechosos. El modelo es exclusivamente de texto (se eliminó el encoder de visión) y está pensado para despliegues donde los eventos deben permanecer locales. La ventana de contexto recomendada en la placa objetivo es de 1.024 tokens, lo que lo hace viable para inferencia en dispositivos ARM64 con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (recomendada en placa; la base soporta mas) |
| Tipos de cuantizacion | Q4_0 (1,12 GiB), Q4_K_M (1,19 GiB) |
| Idiomas soportados | ingles, turco |
| Licencia | other (el base Qwen3.5 es Apache-2.0, pero la mezcla de entrenamiento tiene fuentes con terminos propios) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3.5-2B, sin capas de visión, adaptado mediante un ajuste fino con QLoRA de 4 bits NF4 y rango 16. El conjunto de entrenamiento contiene 9.129 ejemplos de eventos SOC normalizados, con un balance de 5.872 casos de evidencia insuficiente y 3.257 casos sospechosos. El proceso de seleccion de checkpoint se realizo sobre un conjunto de desarrollo separado de 400 registros y la evaluacion final se hizo una sola vez sobre un conjunto de retencion congelado de 1.000 registros sin solapamiento de prompts con el entrenamiento. No se ha publicado informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset.

La salida esta restringida a un contrato JSON estricto con los campos `guven` (confianza), `kanit` (evidencia), `karar` (decision), `mitre_attack`, `olay_tipi` (tipo de evento) y `onerilen_adim` (siguiente paso). La decision se limita a dos valores posibles: `supheli` (sospechoso) o `yetersiz_kanit` (evidencia insuficiente). El modelo no realiza inspeccion de paquetes crudos (PCAP) ni ejecuta acciones automaticas; solo analiza eventos ya normalizados.

## Capacidades

- Generacion de texto con salida JSON estructurada para triage de eventos SOC.
- Analisis de eventos normalizados de Zeek, Suricata y Wazuh.
- Atribucion de tacticas y tecnicas MITRE ATT&CK (coincidencia exacta en el campo `mitre_attack`).
- Clasificacion binaria de decisiones: sospechoso o evidencia insuficiente.
- Resumen de evidencia y propuesta de siguiente paso revisable por humano.
- Soporte multilingue limitado a ingles y turco.
- Inferencia en hardware de borde ARM64 con llama.cpp.
- Sin capacidad de vision ni audio; es un modelo exclusivamente de texto.

## Casos de uso

- Triaje offline de eventos SOC en entornos con restriccion de conectividad: el modelo procesa eventos normalizados localmente y devuelve una decision inicial, permitiendo que el analista revise solo los casos marcados como sospechosos.
- Priorizacion de alertas en un SOC con volumen alto: se puede integrar como primer filtro automatico que clasifica eventos en sospechosos o con evidencia insuficiente, reduciendo la carga de trabajo del equipo de respuesta.
- Resumen de evidencia para informes de incidentes: el campo `kanit` recoge las evidencias relevantes del evento, facilitando la redaccion de reportes internos o regulatorios.
- Sugerencia de atribucion MITRE ATT&CK: el modelo propone tecnicas y tacticas, que el analista debe revisar y validar antes de incorporar a la base de conocimiento.
- Despliegue en dispositivos de borde para SOC distribuido: pensado para placas ARM de 4 GB, permite mantener los datos de eventos dentro de la infraestructura local sin enviarlos a la nube.
- Generacion de recomendaciones de siguiente paso: el campo `onerilen_adim` ofrece una accion revisable por humano, adecuada para integrarse en runbooks de respuesta a incidentes.

## Benchmarks y rendimiento

Los resultados provienen de la evaluacion del autor sobre un conjunto de retencion congelado de 1.000 registros, sin solapamiento de prompts con el entrenamiento:

| Metrica | Resultado |
|---|---|
| JSON valido | 100,00 % |
| Exactitud de decision | 88,70 % |
| Coincidencia exacta MITRE | 88,70 % |
| Recall de deteccion | 60,50 % |
| Precision | 78,06 % |
| F1 | 68,17 % |
| Especificidad | 95,75 % |
| Tasa de falsos positivos | 4,25 % |

No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pico de RSS observado en el benchmark del autor con la cuantizacion Q4_0 es de 2001 MiB (~2 GB), dentro del presupuesto de una placa con 4 GB de RAM.
- GPU recomendadas: no requiere GPU; esta validado para ejecucion en CPU con llama.cpp sobre placas ARM (T5 Gemstone O1 / AM67A). No se reclaman los aceleradores TIDL de 4 TOPS de la placa.
- Compatible con GPUs de consumo: si se desea ejecutar en x86, puede usarse en cualquier GPU con al menos 2 GB de VRAM, aunque no es el objetivo principal.
- Opciones de despliegue: llama.cpp (recomendado), llama-cli, y cualquier runtime compatible con GGUF como Ollama o vLLM, aunque no se han validado en la placa.
- Latencia y throughput: el autor reporta 376,77 tokens/s en el host de build para la cuantizacion Q4_0, pero advierte que no es una medida de rendimiento en la placa AM67A.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria de analisis SOC en edge en la informacion proporcionada. Como referencia estructural, el base es Qwen3.5-2B, que ofrece una ventana de contexto de 32.768 tokens y licencia Apache-2.0, pero el ajuste de NanoSOC reduce la ventana recomendada a 1024 tokens para garantizar un uso viable en hardware limitado.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| NanoSOC Gemstone 2B | 1,88 B | 1024 (recomendado) | other | GGUF | Analisis SOC |
| Qwen3.5-2B | 1,88 B | 32.768 | Apache-2.0 | safetensors | Generico |
| No disponible | - | - | - | - | - |

## Limitaciones y advertencias

- No procesa PCAP ni paquetes crudos; solo eventos normalizados de Zeek, Suricata o Wazuh.
- No debe usarse para acciones autonomas como bloqueo, borrado, cuarentena o remediacion; requiere revision de un analista humano.
- La confianza del modelo no debe interpretarse como probabilidad calibrada; los valores de confianza no estan calibrados.
- La ventana de contexto recomendada es de 1024 tokens, lo que limita el analisis de eventos muy largos o multiples eventos en una sola llamada.
- El soporte multilingue se limita a ingles y turco; no se ha evaluado en otros idiomas.
- La licencia es conservadora: la mezcla de entrenamiento incluye fuentes con terminos propios, por lo que se debe revisar `NOTICE.md` y los terminos de las fuentes antes de una redistribucion comercial.
- No sustituye a un SIEM, un IDS/IPS ni a un analista humano; es una herramienta de apoyo.
- La validacion de hardware en la placa T3 Gemstone (latencia y pico de RAM) esta pendiente; los datos de memoria provienen de un benchmark en el host de build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoktugD/NanoSOC-Gemstone-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Espacio del autor: https://huggingface.co/spaces/GoktugD/goktug-ai-lab
