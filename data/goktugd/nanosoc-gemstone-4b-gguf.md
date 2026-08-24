# GoktugD/NanoSOC-Gemstone-4B-GGUF

## Resumen

NanoSOC Gemstone 4B es un modelo de texto de 4.205 millones de parámetros, afinado por GoktugD sobre la base Qwen/Qwen3.5-4B mediante QLoRA 4-bit NF4 con rango 16. Está diseñado para el triaje estructurado de eventos de seguridad normalizados procedentes de sensores como Zeek, Suricata o Wazuh, y devuelve una salida JSON estricta con decisión, evidencia, atribución MITRE ATT&CK y un siguiente paso revisable por un analista. El modelo se distribuye en formato GGUF cuantizado (Q4_0 y Q4_K_M) para su ejecución en placas ARM64 de 4 GB, como la T3 Gemstone O1 / AM67A, dentro de un escenario de edge AI donde los eventos no deben abandonar la red local.

Su relevancia actual radica en ofrecer una capacidad de triaje de alertas con un footprint de memoria muy ajustado (fichero Q4_0 de 2,37 GiB) y un contexto recomendado de solo 512 tokens, lo que permite desplegarlo en hardware de bajo coste sin depender de la nube. El autor advierte explícitamente de que la validación de latencia y pico de RAM en la placa física T3 Gemstone aún está pendiente, y que los aceleradores TIDL de 4 TOPS no se utilizan para este modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Recomendado 512 tokens en placa de 4 GB; contexto máximo no especificado |
| Tipos de cuantizacion | Q4_0 (2,37 GiB), Q4_K_M (2,52 GiB) |
| Idiomas soportados | Ingles, turco |
| Licencia | Other (base Apache-2.0; mezcla de entrenamiento con terminos propios) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3.5-4B, un transformer decoder-only de 4.2 mil millones de parámetros. Sobre esta base se aplicó un afinado con QLoRA en 4 bits NF4 con rango 16, utilizando un conjunto de 9.129 ejemplos estructurados de operaciones de centro de operaciones de seguridad (SOC): 5.872 con decisión de evidencia insuficiente y 3.257 con decisión de sospechoso. El codificador de visión de la base fue eliminado, por lo que los paquetes GGUF son exclusivamente de texto. La selección del checkpoint se realizó sobre un conjunto de desarrollo de 400 registros, y la evaluación final se ejecutó una única vez sobre un conjunto congelado de 1.000 registros sin solapamiento de prompts con el entrenamiento.

No se menciona el uso de RLHF ni DPO. La salida está restringida por contrato a un JSON con los campos `guven`, `kanit`, `karar` (limitado a `supheli` o `yetersiz_kanit`), `mitre_attack`, `olay_tipi` y `onerilen_adim`, y se incluye un JSON Schema para forzar la estructura en el momento de la generación.

## Capacidades

- Generación de texto estructurado: produce JSON estricto con decisión, evidencia, atribución MITRE ATT&CK y acción recomendada.
- Triaje de eventos normalizados: consume eventos de Zeek, Suricata o Wazuh y devuelve una clasificación binaria (sospechoso o evidencia insuficiente).
- Atribución MITRE ATT&CK: sugiere técnicas del marco MITRE con una exactitud de coincidencia del 87,5% en el conjunto de evaluación.
- Resumen de evidencia: extrae y resume las líneas de evidencia relevantes del evento de entrada.
- Soporte multilingüe: entrenado y documentado para inglés y turco.
- Sin tool calling ni capacidades de agente: el modelo no incluye soporte de function calling ni razonamiento multi-paso más allá de la salida estructurada.
- Sin visión ni audio: el codificador de visión se eliminó, y no hay capacidades multimodales.

## Casos de uso

- Triaje de alertas en redes con baja conectividad: el modelo puede ejecutarse en una placa ARM64 de 4 GB dentro de la red local y clasificar eventos normalizados sin enviar datos a la nube, lo que reduce la latencia y preserva la privacidad de los registros.
- Priorización de alertas en un SOC distribuido: recibe eventos ya normalizados de Zeek o Suricata y devuelve una decisión preliminar (`supheli` o `yetersiz_kanit`) que permite al analista humano priorizar las colas de trabajo.
- Generación de resúmenes de evidencia para investigaciones: el campo `kanit` extrae las líneas de evidencia relevantes, lo que acelera la revisión manual de cada alerta.
- Sugerencia de técnicas MITRE ATT&CK: propone una atribución al marco, que el analista debe validar antes de incorporarla al informe del incidente.
- Automatización de tareas de bajo nivel en entornos con restricción de hardware: al caber en 2,4 GiB de RAM, puede ejecutarse en dispositivos industriales o routers avanzados con llama.cpp sin necesidad de GPU.
- Entrenamiento de personal junior de SOC: el modelo puede utilizarse como herramienta de práctica para aprender a clasificar eventos y a redactar decisiones justificadas, siempre con supervisión.

## Benchmarks y rendimiento

El autor publicó una evaluación congelada sobre un conjunto de 1.000 registros de detección, sin solapamiento con el entrenamiento:

| Metrica | Resultado |
|---|---:|
| JSON valido | 100,00% |
| Precision de decision | 87,50% |
| Coincidencia exacta MITRE | 87,50% |
| Recall de deteccion | 99,00% |
| Precision | 61,68% |
| F1 | 76,01% |
| Especificidad | 84,62% |
| Tasa de falsos positivos | 15,38% |

En el host de validación, con el fichero Q4_0, se observaron dos medidas de rendimiento: 153,92 tokens/s y 9,29 tokens/s. El autor no especifica las condiciones exactas de cada medición, por lo que no se pueden atribuir a una configuración concreta. No se han publicado resultados comparativos con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_0 ocupa 2,37 GiB y el Q4_K_M 2,52 GiB. Con el contexto de 512 tokens y el overhead de ejecución, se estima un pico de memoria entre 2,5 y 3,0 GiB en inferencia. El autor observó un pico de RSS de 4.502,9 MiB en el host de validación, aunque aclara que no es una medida de la placa física.
- GPU recomendadas: el modelo cabe en GPUs consumer con 4 GB o más, como la RTX 3050 (8 GB) o la RTX 4060. En la placa T3 Gemstone (AM67A) con 4 GB de RAM, es el objetivo principal, pero la validación física aún está pendiente.
- Despliegue: compatible con llama.cpp y llama-cli. No se menciona soporte para vLLM, Ollama ni TGI en la documentación, aunque el formato GGUF es compatible con cualquier runtime que lo soporte.
- Latencia: en el host de referencia se observaron 153,92 tokens/s y 9,29 tokens/s, sin especificar la configuración exacta. En la placa ARM de 4 GB, se espera una latencia significativamente mayor, pero no hay datos publicados.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento SOC con otros modelos. A nivel de arquitectura y licencia, se puede comparar con la base sin afinar y con modelos de tamaño similar:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| NanoSOC Gemstone 4B | 4,2 B | 512 tokens (recomendado) | en, tr | other | Triaje SOC |
| Qwen3.5-4B (base) | 4,2 B | No disponible | Multilingue | Apache-2.0 | Generico |
| Llama-3.2-3B | 3,2 B | 128 K | Multilingue | Llama 3.2 Community | Generico |
| Phi-3.5-mini | 3,8 B | 128 K | Multilingue | MIT | Generico |

La comparación de rendimiento en tareas SOC no está disponible; los modelos genéricos no tienen evaluaciones publicadas sobre triaje de alertas. El valor diferencial del NanoSOC está en el afinado específico y el formato GGUF para edge.

## Limitaciones y advertencias

- No debe utilizarse para inspección de paquetes crudos (PCAP), ni para acciones autónomas como bloqueo, borrado, cuarentena o remediación; el autor lo excluye explícitamente de su uso previsto.
- La precisión es baja (61,68%) y la tasa de falsos positivos es del 15,38%, lo que implica que una proporción significativa de las alertas marcadas como sospechosas serán falsos positivos; la salida debe revisarse siempre por un analista.
- El modelo no sustituye a un SIEM, a un IDS/IPS ni a un analista humano; es una herramienta de triaje preliminar.
- La licencia está marcada como `other` porque la mezcla de entrenamiento contiene múltiples fuentes con términos propios; es necesario revisar `NOTICE.md` y las fuentes originales antes de una redistribución comercial.
- El contexto recomendado en la placa de 4 GB es de solo 512 tokens, lo que limita la cantidad de evento que puede procesar de una sola vez.
- La validación de latencia y pico de RAM en la placa física T3 Gemstone aún está pendiente; las cifras de host no son extrapolables al hardware objetivo.
- No se deben tratar las decisiones del modelo como probabilidades calibradas; el autor lo advierte explícitamente.
- El modelo solo está entrenado para inglés y turco, y su comportamiento en otros idiomas no está garantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GoktugD/NanoSOC-Gemstone-4B-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Espacio del autor (Model Lab): https://huggingface.co/spaces/GoktugD/goktug-ai-lab
