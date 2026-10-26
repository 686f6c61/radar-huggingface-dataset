# infosecn1nja/soc-triage-nemotron-bolt-e4b-lora

## Resumen

`soc-triage-nemotron-bolt-e4b-lora` es un adaptador LoRA en formato MLX creado por el usuario infosecn1nja sobre el modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`. Su única función es convertir una alerta de un centro de operaciones de seguridad (SOC) en una decisión de triaje estructurada en JSON, clasificándola en una de siete categorías: `malicious`, `suspicious`, `benign`, `expected_admin`, `authorised_testing`, `misconfiguration` o `unknown`. No es un modelo de propósito general, sino un ajuste de dominio muy estrecho orientado a automatizar el descarte y la escalada de alertas.

El autor lo etiqueta explícitamente como EXPERIMENTAL / PILOT v0.1: 30 iteraciones de entrenamiento sobre 420 ejemplos sintéticos, sin validación sobre telemetría real etiquetada. El adaptador tiene rango 8 y afecta solo a 4 capas, por lo que su huella en disco es mínima (el repositorio declara 0.0 GB). Se apoya en el modelo base cuantizado a 4 bits de MLX (`mlx-community/NVIDIA-Nemotron-3.5-Bolt-E4B-OptiQ-4bit`) y está pensado para ejecutarse en Apple Silicon.

Su interés actual es doble: por un lado, demuestra un patrón de despliegue de triaje SOC con modelo pequeño y local (sin enviar telemetría a la nube); por otro, incorpora un arnés de evaluación con puertas de calidad (11 PASS, 3 SKIP) que obliga a validar calibración y recall por clase antes de pasar de modo sombra a producción. La licencia es OpenMDW-1.1, heredada del modelo base, y el modelo no está afiliado ni respaldado por NVIDIA ni por Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (MLX) sobre un transformer decoder-only: rango 8, 4 capas, escala 20; el modelo base es NVIDIA Nemotron 3.5 Bolt E4B |
| Parámetros totales | No disponible para el modelo base; el adaptador son pesos LoRA de rango 8 sobre 4 capas (repositorio de 0.0 GB) |
| Parámetros activos | No aplica / no disponible (no se documenta que el modelo base sea MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento (secuencia máxima); contexto nativo del modelo base no disponible |
| Tipos de cuantización | Base en MLX 4-bit (OptiQ-4bit) según el comando de uso; adaptador en safetensors sin cuantizar |
| Idiomas soportados | Inglés (`en`); las justificaciones se generan en inglés por diseño del prompt de producción |
| Licencia | OpenMDW-1.1 (heredada del modelo base); datos de entrenamiento CC BY 4.0; código del arnés MIT |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (LoRA MLX); base en safetensors MLX |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` (relación: adapter) |
| Tarea | Triaje de alertas SOC con salida JSON sobre 7 clases |
| Librería | `mlx` (entrenado con `mlx-lm` 0.32.2) |
| Datos de entrenamiento | `infosecn1nja/soc-triage-opensec-chat`, derivado de `tegridydev/opensec-triage` |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA sobre el modelo base en su versión MLX cuantizada a 4 bits. La configuración concreta es rango 8, aplicación a 4 capas, escala 20, secuencia máxima de 2048 tokens, enmascarado del prompt (solo se calcula pérdida sobre la respuesta) y gradient checkpointing. El entrenamiento completo son 30 iteraciones con learning rate 2e-5 y batch size 1, ejecutadas en un Apple M4 de 24 GB de memoria unificada. La pérdida pasa de 2.509 a 0.259 en entrenamiento y de 2.833 a 0.207 en validación, una caída muy pronunciada coherente con el sobreajuste a un conjunto de solo 420 ejemplos sintéticos.

No se documenta en la información disponible ni el número de tokens de preentrenamiento del modelo base, ni la composición de su dataset, ni si hubo RLHF o DPO. Según la model card, el modelo base Nemotron 3.5 Bolt E4B deriva a su vez de Google Gemma 4 (Apache-2.0) y se distribuye con licencia OpenMDW-1.1. La innovación práctica del adaptador no está en la arquitectura sino en el contrato de salida: JSON cerrado de 7 clases más referencias de evidencia (`evidence_refs`), pensado para integrarse en un sistema de triaje con verificación posterior. El autor exige desactivar el modo thinking (`enable_thinking: false`) para que el modelo emita el JSON directamente en lugar de razonar antes de responder.

## Capacidades

- Clasificación de alertas SOC en 7 clases cerradas (`malicious`, `suspicious`, `benign`, `expected_admin`, `authorised_testing`, `misconfiguration`, `unknown`).
- Emisión de salida estructurada en JSON, apta para consumo programático por parte de un orquestador o SOAR.
- Generación de justificaciones breves en inglés que acompañan a la decisión de triaje.
- Producción de `evidence_refs` que apuntan a los campos de la alerta usados como base de la decisión (requiere verificación externa).
- Capacidad de discriminación entre actividad maliciosa y actividad administrativa legítima o pruebas autorizadas, según la taxonomía de entrenamiento.
- Ejecución local en Apple Silicon mediante `mlx_lm.server`, sin dependencia de API externa.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio, matemáticas ni generación de código general; el ajuste está especializado en triaje.

## Casos de uso

- Triaje en modo sombra: desplegar el adaptador en paralelo al analista humano para comparar sus decisiones con las reales durante varias semanas y medir la tasa de discrepancia antes de darle cualquier autonomía. El autor ya lo declara READY para este nivel (L0).
- Priorización de colas de alertas: usar la etiqueta de clase para ordenar la cola de trabajo, de modo que `malicious` y `unknown` suban al principio y `benign` quede al final con revisión por muestreo.
- Filtrado previo de ruido por malconfiguración: clasificar como `misconfiguration` alertas recurrentes de reglas mal calibradas y agruparlas para que el equipo de detección corrija la regla en lugar de investigar caso por caso.
- Detección de pruebas autorizadas: etiquetar como `authorised_testing` la actividad de equipos de red team o escaneos planificados, reduciendo escalados innecesarios cuando el contexto lo permite.
- Generación de borradores de informe: aprovechar la justificación en inglés y las referencias de evidencia para precargar el campo de notas del ticket, que el analista revisa y corrige.
- Enrutado a playbooks: mapear cada una de las 7 clases a un playbook distinto del SOAR, de forma que la respuesta automática (bloqueo, cuarentena, cierre) dependa de la clase emitida y de las comprobaciones de enriquecimiento.
- Prototipado e investigación: servir como banco de pruebas para estudiar calibración y sobreajuste en clasificadores de seguridad de dominio estrecho, dado que el autor publica configuración, pérdidas y resultados del arnés.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al split dorado sintético de test (n=55), no a telemetría real:

| Métrica | Valor |
|---|---|
| Macro-F1 | 0.954 |
| Accuracy | 0.964 |
| Maliciosos no detectados (auto-cerrados) | 0 |
| Precisión de auto-cierre | 1.0 |
| Falsos positivos de marcado de ataque | 0 |
| Falsos positivos de escalado | 0 |
| ECE (calibración) | 0.102 (IC 95 %: 0.06–0.15) |
| Resultado del arnés | READY para modo sombra (L0): 11 puertas PASS, 3 SKIP |
| Pérdida de entrenamiento | 2.509 → 0.259 |
| Pérdida de validación | 2.833 → 0.207 |

Las tres puertas omitidas (SKIP) lo son por guardas estadísticas: el ECE requiere n≥200 y el recall por clase requiere al menos 10 ejemplos por clase, y el test solo tiene 55. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros modelos de triaje.

## Requisitos de hardware

- Adaptador: pesos LoRA de rango 8 sobre 4 capas; el repositorio declara 0.0 GB, por lo que el almacenamiento necesario es despreciable.
- Modelo base cuantizado a 4 bits: estimación de 2,5–3,5 GB de pesos para una variante de ~4B parámetros (la denominación E4B sugiere "4B efectivos", sin confirmar en la información disponible), más KV cache para 2048 tokens.
- Memoria total estimada en inferencia: del orden de 4–6 GB de memoria unificada en Apple Silicon; el entrenamiento se realizó con 24 GB, pero el adaptador es muy pequeño.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con al menos 16 GB de memoria unificada; el autor usó un M4 de 24 GB. No se documenta soporte para CUDA, A100, H100 ni RTX 4090 con este adaptador en formato MLX.
- Cabe en hardware de consumo: sí, en Mac con memoria unificada suficiente; en GPU NVIDIA requeriría convertir el adaptador a otro formato, algo no documentado por el autor.
- Despliegue: `mlx_lm.server --model mlx-community/NVIDIA-Nemotron-3.5-Bolt-E4B-OptiQ-4bit --adapter-path ./adapter --chat-template-args '{"enable_thinking": false}'`; requiere `mlx-lm` 0.32.2 o compatible. No se documentan vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| soc-triage-nemotron-bolt-e4b-lora | Adaptador LoRA MLX para triaje SOC | Adaptador rango 8 / 4 capas; base no disponible | 2048 en entrenamiento | Macro-F1 0.954 y accuracy 0.964 en test sintético n=55 | OpenMDW-1.1 | HuggingFace, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | Modelo base de propósito general | No disponible | No disponible | No disponible | OpenMDW-1.1 | HuggingFace (modelo oficial de NVIDIA) |
| Google Gemma 4 (origen declarado del base) | Modelo base de propósito general | No disponible | No disponible | No disponible | Apache-2.0 según la model card | No verificado en la información disponible |
| Otros clasificadores de triaje SOC | No disponible | No disponible | No disponible | No disponible | No disponible | No identificados en la búsqueda realizada |

No se han identificado en la información disponible alternativas directamente comparables (adaptadores de triaje SOC con métricas publicadas), por lo que la comparación cuantitativa con otros modelos de la misma categoría queda como no disponible. La búsqueda web realizada no devolvió resultados técnicos relevantes.

## Limitaciones y advertencias

- Sobreajuste probable: 420 filas sintéticas y 30 iteraciones de entrenamiento; el autor lo califica explícitamente de no apto para producción.
- Métricas calculadas solo sobre un conjunto dorado sintético de 55 ejemplos; no hay validación sobre telemetría real etiquetada.
- Puede alucinar `evidence_refs`; es obligatorio un guardrail que verifique que los identificadores de evidencia citados existen en la alerta original.
- Sin enriquecimiento (tickets de cambio, CMDB, línea base, threat intelligence) el modelo no debería cerrar automáticamente ninguna alerta.
- Calibración moderada: ECE de 0.102, con intervalo de confianza amplio; las probabilidades implícitas no deben usarse como umbral de decisión sin recalibración.
- Idiomas: solo inglés. Las justificaciones se generan en inglés porque el prompt de producción así lo pide; no hay soporte documentado de castellano.
- Ventana de contexto corta en entrenamiento (2048 tokens), lo que limita el tamaño de la alerta más el contexto adicional que se puede adjuntar.
- Licencia OpenMDW-1.1: es necesario revisar sus términos antes de cualquier uso comercial; los datos de entrenamiento son CC BY 4.0 y exigen atribución.
- El modelo no está afiliado, patrocinado ni respaldado por NVIDIA ni por Google; el autor lo declara de forma explícita.
- Dependencia de plataforma: el adaptador está en formato MLX y el procedimiento de servicio documentado requiere Apple Silicon y `mlx-lm`; no hay ruta de despliegue documentada para GPU NVIDIA.
- Riesgo operativo: un falso negativo en la clase `malicious` implica una alerta real cerrada sin investigación; el arnés lo controla en el test sintético (0 casos), pero no en producción.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de revisión por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosecn1nja/soc-triage-nemotron-bolt-e4b-lora
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Base cuantizada usada en el ejemplo de servicio: https://huggingface.co/mlx-community/NVIDIA-Nemotron-3.5-Bolt-E4B-OptiQ-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/infosecn1nja/soc-triage-opensec-chat
- Dataset original: https://huggingface.co/datasets/tegridydev/opensec-triage
- Arnés de evaluación y código de entrenamiento (producto TriageKit): https://github.com/infosecn1nja/soc-triage-harness
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes (los resultados devueltos no guardan relación con el modelo).
