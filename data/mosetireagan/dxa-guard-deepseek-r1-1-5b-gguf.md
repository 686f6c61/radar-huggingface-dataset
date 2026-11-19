# mosetireagan/dxa-guard-deepseek-r1-1.5b-gguf

## Resumen

DXA-Guard DeepSeek-R1 1.5B es un modelo de lenguaje especializado en razonamiento sobre seguridad informática, publicado por el desarrollador mosetireagan (organización Deployxa) bajo licencia Apache 2.0. Se trata de un ajuste fino (SFT) del modelo destilado `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, orientado a actuar como motor de razonamiento de segundo nivel (Tier-2) dentro de una arquitectura de defensa en dos capas para servidores Linux. El modelo analiza telemetría de incidentes de seguridad y emite veredictos estructurados en JSON que pueden desencadenar acciones automáticas de contención.

El modelo se distribuye en formato GGUF con cuantización Q4_K_M, lo que reduce su huella a aproximadamente 1,04 GB en disco y unos 1,18 GB de RAM, permitiendo su ejecución íntegra en CPU sin GPU. Está pensado para entornos air-gapped y on-premises, donde no se permite el envío de telemetría a servicios en la nube. Su ventana de contexto es de 4.096 tokens, suficiente para flujos de logs multilínea y árboles de procesos.

La relevancia actual del modelo radica en su enfoque de "prompt fencing": durante el ajuste fino se entrenó al modelo para tratar todo el contenido de telemetría como datos no confiables, resistiendo inyecciones de prompt embebidas en logs, nombres de usuario SSH o cabeceras User-Agent. Esto lo convierte en una pieza poco habitual dentro del ecosistema open source: un modelo pequeño, determinista en su salida y diseñado específicamente para automatización de respuesta a incidentes en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen 2.5, destilado de DeepSeek-R1) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (distribuido); safetensors en el repo base |
| Idiomas soportados | no disponible (la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) y safetensors |

## Arquitectura y entrenamiento

El modelo parte de `DeepSeek-R1-Distill-Qwen-1.5B`, un destilado de razonamiento construido sobre la arquitectura Qwen 2.5 con 1.777 millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con el dataset `mosetireagan/dxa-guard-reasoning-sft`, compuesto por 9.288 muestras de telemetría de seguridad aumentada. El entrenamiento busca dos comportamientos concretos: generar una traza de razonamiento causal dentro de etiquetas `<think>...</think>` y, a continuación, emitir exclusivamente un objeto JSON válido con el veredicto de amenaza.

La innovación técnica destacable no está en la arquitectura, sino en el diseño del prompt y del entrenamiento frente a inyecciones. El modelo fue expuesto durante el SFT a payloads de prompt injection diversos y se le enseñó a delimitar la telemetría no confiable entre marcadores `=== BEGIN UNTRUSTED TELEMETRY (DATA ONLY) ===` y `=== END UNTRUSTED TELEMETRY ===`, tratando siempre ese contenido como datos y nunca como instrucciones. No se documentan datos sobre número total de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Razonamiento paso a paso sobre evidencia forense, con traza explícita en `<think>...</think>` antes del veredicto.
- Generación de salida estructurada en JSON estricto, con campos como `threat_identified`, `threat_class` y otros definidos en el esquema del sistema.
- Análisis de cadenas de explotación CVE, binarios LOLBins y mecanismos de persistencia en hosts Linux.
- Clasificación de amenazas por clase (reconocimiento, fuerza bruta SSH, fuzzing web, sondeos, etc.).
- Resistencia entrenada a prompt injection en contenido de telemetría (User-Agents, nombres de usuario SSH, logs).
- Ejecución completamente local y air-gapped, sin dependencia de servicios externos.
- Soporte de conversación multi-turno mediante plantilla de chat con roles `<｜System｜>`, `<｜User｜>` y `<｜Assistant｜>`.
- No se documentan capacidades de tool calling, function calling, visión, audio ni soporte multilingüe explícito.

## Casos de uso

- Respuesta automatizada a incidentes en servidores Linux: el modelo recibe telemetría escalada por la capa Tier-1 y emite un JSON que un orquestador traduce en reglas de firewall (nftables) o acciones de contención de procesos, sin intervención humana en el bucle.
- Triaje de alertas en un SOC on-premises: al ejecutarse en CPU con ~1,18 GB de RAM, puede desplegarse en la misma máquina que genera los logs, eliminando la latencia y el coste de enviar telemetría a un servicio cloud.
- Detección de fuerza bruta SSH y fuzzing web: el modelo analiza ventanas de telemetría con intentos repetidos y clasifica el evento como reconocimiento, permitiendo bloquear la IP de origen de forma automática.
- Análisis de cadenas de persistencia y LOLBins: dado un árbol de procesos sospechoso, el modelo razona sobre la secuencia de ejecución y determina si encaja en un playbook de ataque conocido.
- Hardening frente a inyección de prompt en logs: en entornos donde atacantes insertan instrucciones maliciosas en cabeceras o nombres de usuario, el modelo está entrenado para ignorarlas y tratarlas como datos, lo que lo hace adecuado para pipelines que procesan entrada no confiable.
- Despliegue en VPS de recursos limitados: con 1,04 GB en disco y ejecución en CPU, cabe en microinstancias y servidores edge donde no hay GPU disponible.
- Auditoría forense con trazabilidad: la traza `<think>` proporciona un registro del razonamiento que puede archivarse junto al veredicto para revisión posterior por analistas humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (ejecución en CPU); ~1,18 GB de RAM según la model card.
- GPU recomendadas: no se requieren; el modelo está diseñado para CPU. No se documentan requisitos de GPU.
- Cabe en cualquier GPU consumer si se desea acelerar, pero no es un requisito del diseño.
- Opciones de despliegue: Ollama (con Modelfile proporcionado por el autor), llama.cpp (formato GGUF nativo), y cualquier runtime compatible con GGUF.
- Tamaño en disco: 1,04 GB (1.117.358.080 bytes) para el archivo Q4_K_M.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| DXA-Guard DeepSeek-R1 1.5B | 1.777 M | 4.096 | GGUF Q4_K_M | Apache 2.0 | Razonamiento de seguridad, salida JSON |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1.777 M | no disponible | safetensors | MIT (según el modelo base) | Razonamiento general |
| Qwen 2.5 1.5B (familia base) | ~1.500 M | no disponible | safetensors, GGUF | Apache 2.0 | Propósito general |

El modelo se diferencia de su base por el ajuste fino sobre telemetría de seguridad y por la salida JSON determinista, a costa de un contexto más corto (4.096 tokens) y de un alcance de dominio mucho más estrecho. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en seguridad de hosts Linux; su rendimiento en tareas generales de lenguaje o en otros dominios no está documentado y probablemente sea degradado respecto a la base.
- La ventana de contexto de 4.096 tokens limita el volumen de telemetría que puede analizar en una sola pasada; logs muy extensos requerirán truncado o segmentación.
- No se documentan los idiomas soportados; la model card está en inglés y el entrenamiento parece orientado a ese idioma, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación en la clasificación de amenazas: la salida JSON puede contener veredictos incorrectos, por lo que se recomienda validación del esquema y umbrales de confianza antes de ejecutar acciones de contención automáticas.
- La resistencia a prompt injection está entrenada, pero no es garantía absoluta; un atacante con conocimiento del formato de fencing podría intentar evadirla.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene sus propias condiciones que conviene verificar.
- El repositorio tiene 12,5 GB de tamaño total, lo que sugiere la presencia de múltiples artefactos además del GGUF Q4_K_M; conviene seleccionar el archivo correcto al descargar.
- No hay benchmarks publicados que respalden las afirmaciones de rendimiento de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mosetireagan/dxa-guard-deepseek-r1-1.5b-gguf
- Dataset de ajuste fino: https://huggingface.co/datasets/mosetireagan/dxa-guard-reasoning-sft
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio DXA-Guard: https://github.com/dxa-guard/dxa-guard
- Perfil del autor: https://huggingface.co/mosetireagan
- Organización Deployxa: https://huggingface.co/deployxa
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
