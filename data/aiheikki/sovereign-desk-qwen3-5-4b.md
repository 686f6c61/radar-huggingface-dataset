# AIHeikki/sovereign-desk-qwen3.5-4b

## Resumen

Sovereign Desk v2 es un checkpoint experimental de pesos abiertos publicado por AIHeikki sobre el modelo base Qwen/Qwen3.5-4B, orientado a auditorías estructuradas de compras y facturación en hardware local. El artefacto principal es una cuantización GGUF Q4_K_M de 2,62 GiB generada a partir de un ajuste fino mediante Layer-Selective LoRA sobre capas 10–29, seguido de una calibración de la capa superior (capa 31 + lm.norm) sin gradientes. El modelo base declara 4,66B parámetros y 32 capas de texto; en el repositorio figuran 4.326.350.848 parámetros en safetensors y se ha eliminado la torre de visión multimodal en la exportación GGUF, quedando como modelo solo de texto.

El sistema no es un modelo autónomo de finanzas, sino un componente dentro de una arquitectura híbrida: un lector con `tools=[]`, un planificador restringido por gramática GBNF, un broker de permisos determinista y una puerta de veto opcional de 0,8B. Sobre un banco de pruebas simulado de 45 casos (Holdout-45), las distintas configuraciones completaron 41 de 45 casos, pero aprobaron dos facturas que la política obligaba a retener, lo que sitúa la revisión humana y la aplicación determinista de límites de compra y caducidad como requisitos de producción.

Su relevancia actual reside en el enfoque de "zero-trust local AI": pesos abiertos, ejecución offline, salidas estructuradas y separación de roles sobre los mismos pesos, con el objetivo de auditar documentos y operaciones de compras sin exponer datos a servicios en la nube. La licencia Apache-2.0 facilita su integración, aunque las capacidades demostradas son acotadas y el propio autor documenta fallos de política y limitaciones de fidelidad en citas y transferencias de inventario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B), 32 capas de texto; torre de visión eliminada en el GGUF solo texto |
| Parámetros totales | 4.326.350.848 (safetensors); 4,66B según model card del base |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (artefacto principal y ablación) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (principal y ablación), safetensors (delta quirúrgico BF16 de 99,6 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 32 capas de texto y 4,66B parámetros. El ajuste se realizó con Layer-Selective LoRA sobre 1.351 filas sintéticas de compras, entrenando las capas 10–29 y congelando las capas 0–9. Posteriormente se aplicó una calibración de la capa superior (capa 31 más lm.norm) sin gradientes. El resultado se exportó a GGUF Q4_K_M (2,62 GiB, SHA-256 `93e8c818...f925d9d8`) y se publicó también una ablación solo LoRA (`ablations/sovereign-desk-qwen3.5-4b-loraonly-Q4_K_M.gguf`) y un delta quirúrgico en BF16 de 99,6 MB.

La innovación principal no está en el entrenamiento sino en el sistema que lo envuelve: un broker de permisos determinista (`runtime/permission_broker.py`), un patrón de cuarentena de doble rol (lector sin herramientas y planificador bloqueado por gramática GBNF que comparten los mismos pesos de 4B) y una puerta de veto opcional de 0,8B (`AIHeikki/sovereign-desk-veto-qwen3.5-0.8b`, 522 MiB) para decisiones en la nube. La calibración de la capa superior no aportó ganancia medible en el benchmark: la ablación solo LoRA y la versión con calibración empataron en 41/45, con `best_alpha = 0.0` y `best_beta_norm = 0.97`, y la validación de calibración disjunta alcanzó 91,67% con un hueco nulo negativo de -0,8125.

## Capacidades

- Generación de texto y razonamiento estructurado para interpretación de documentos de compras y facturación.
- Salidas restringidas por gramática GBNF para producir JSON y campos estructurados de forma determinista.
- Lectura de documentos en modo sin herramientas (`tools=[]`) como rol de cuarentena.
- Planificación con un rol separado que comparte los mismos pesos de 4B.
- Defensa contra inyección de prompts mediante separación de roles y broker determinista.
- Soporte de agentes locales y ejecución offline (Wi-Fi desactivado en todas las muestras registradas del document-gym).
- Integración con llama.cpp y Ollama (tags del repositorio), y compatibilidad declarada con endpoints.
- Capacidad multimodal de visión no disponible: la torre de visión se eliminó en la exportación GGUF solo texto.
- Soporte de tool calling: no disponible como capacidad del modelo; el sistema usa un lector sin herramientas y un planificador con gramática.
- Idiomas soportados: no disponible.

## Casos de uso

- Auditoría de facturas contra límites de compra: el modelo interpreta facturas y órdenes de compra, y el broker determinista aplica techos como el límite global de 50.000 €; requiere revisión humana porque en Holdout-45 aprobó dos facturas que debían retenerse (39.500 € contra un tope de 35.000 € y 18.000 € contra un contrato caducado el 31 de agosto de 2026).
- Verificación de caducidad de contratos: el sistema puede extraer fechas y contrastarlas con la política, aunque los fallos documentados muestran que la comprobación debe aplicarse de forma determinista fuera del modelo.
- Extracción estructurada de campos de documentos: en el diagnóstico de inventario, v2 obtuvo 12/12 en el subconjunto fresco designado (7/12 de un solo campo directo) y 14/15 en estructura global, adecuado para pipelines que necesitan JSON validado por gramática.
- Corrección de inventario con notas de múltiples movimientos: útil para interpretar liberaciones, retenciones y entregas en dos camiones, aunque v2 perdió la pista de unidades retenidas en 2 de 5 notas nuevas (3/5 frente a 5/5 de v1).
- Agente local de escritorio para copia y pega entre ventanas: en el document-gym offline se registraron 25/28 campos en 5 ejecuciones y 5/6 en una prueba de copia entre dos ventanas, con Wi-Fi desactivado.
- Creación y actualización de oportunidades en Odoo: la versión v1-compatible creó y actualizó la oportunidad sintética Copper Lantern (de 4.800 € a 3.650 €) con persistencia tras recarga, aunque asignó prioridades no soportadas ("Very high" / "High") y no las corrigió a petición; con v2 solo hay dos pruebas locales de interpretación estructurada de solo lectura (3.650 € / prioridad clara y 5.250 € / mantener prioridad), correctamente extraídas.
- Despliegue de agentes de compras en entorno aislado: la combinación de GGUF Q4_K_M de 2,62 GiB, llama.cpp u Ollama y un broker determinista permite ejecutar el sistema en hardware local sin conexión, con la puerta de veto de 0,8B como capa opcional.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| Holdout-45 (45 casos, 270 episodios) | Arm C0 (solo LoRA) | 41/45 completados |
| Holdout-45 | Arm C (LoRA + calibración de capa superior) | 41/45 completados |
| Holdout-45 | Arm D (LoRA + calibración + veto 0,8B) | 41/45 completados; ALLOW en 237/237 decisiones de veto en nube, 0 falsos bloqueos |
| Holdout-45 | Arm C0, C y D | 2 facturas aprobadas que la política obligaba a retener (39.500 € contra tope de 35.000 €; 18.000 € contra contrato caducado) |
| Holdout-45 | Otros dos casos por encima del tope de compra | Rechazo seguro, pero seleccionaron ESCALATE_CFO en lugar de HOLD_DISCREPANCY |
| Diagnóstico de inventario (15 casos: 12 frescos + 3 regresión) | v2 | 12/12 en subconjunto fresco; 14/15 estructura global; 7/12 de un solo campo directo |
| Notas de múltiples movimientos (5 nuevas) | v2 frente a v1 congelado | v2: 3/5; v1: 5/5 |
| Campos de cita (30) | v2 | 0/30 coincidencias literales con subcadenas de la fuente |
| Document-gym offline | v1-compatible congelado | 25/28 campos en 5 ejecuciones; 5/6 en copia entre dos ventanas |
| Veto 0,8B | v2 | 0 bloqueos falsos frente a 1/4 de fallo local en v1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 2,62 GiB (2.815.884.512 bytes), por lo que cabe en GPUs de consumo con 4 GB o más de VRAM, y en CPU con suficiente RAM.
- GPU recomendadas: no se especifican en la información disponible; los experimentos de Holdout-45 se ejecutaron en NVIDIA A100 y la reproducción local en Apple M3.
- Cabe en GPU de consumo: sí, dado el tamaño de 2,62 GiB en Q4_K_M; no se detallan modelos concretos de RTX.
- Opciones de despliegue: llama.cpp y Ollama (tags del repositorio), con compatibilidad declarada con endpoints.
- Latencia y throughput: no disponibles.
- Componente adicional: la puerta de veto opcional de 0,8B ocupa 522 MiB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sovereign Desk v2 (Qwen3.5-4B) | 4,33B (4,66B base) | no disponible | Auditoría de compras local, zero-trust, GGUF | Apache-2.0 | Hugging Face, GGUF Q4_K_M |
| Qwen/Qwen3.5-4B (base) | 4,66B | no disponible | Modelo generalista con visión (eliminada en el GGUF) | Apache-2.0 | Hugging Face |
| Sovereign Desk v1-compatible 4B (congelado, `f47c02f8...`) | 4,33B | no disponible | Versión previa del mismo sistema | Apache-2.0 | Referenciado en la model card, no como artefacto separado |
| Sovereign Desk Veto 0,8B | 0,8B | no disponible | Puerta de veto opcional | Apache-2.0 | Hugging Face (522 MiB) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es software financiero desatendido: es un sistema híbrido entrenado que requiere revisión humana y aplicación determinista de límites de compra y caducidad.
- Fallos de política documentados: en Holdout-45 aprobó dos facturas que debían retenerse (39.500 € contra tope de 35.000 € y 18.000 € contra contrato caducado), reproducidos localmente en Apple M3 con la configuración completa.
- La calibración de la capa superior no aportó ganancia medible: empató con la ablación solo LoRA en 41/45.
- La puerta de veto de 0,8B no interceptó nada adicional en Holdout-45 (0 bloqueos falsos, pero 0 intercepciones incrementales).
- Fidelidad de citas: 0/30 campos de cita de v2 coincidieron literalmente con subcadenas de la fuente; no mostrar texto de cita sin resolver identificadores de frase.
- Transferencia de inventario: v2 perdió la pista de unidades retenidas en 2 de 5 notas nuevas de múltiples movimientos (3/5 frente a 5/5 de v1).
- Navegación en vivo y Odoo: la creación y actualización en Odoo se ejecutó con la versión v1-compatible congelada, no con v2; con v2 solo hay dos pruebas locales de solo lectura y la navegación en vivo de la interfaz de Odoo con v2 no está probada.
- Asignación de prioridades no soportadas en Odoo ("Very high" / "High") sin corrección a petición.
- Autonomía general de escritorio y aprobaciones financieras desatendidas quedan fuera de las capacidades demostradas.
- Idiomas soportados no disponibles; no hay información sobre sesgos conocidos ni sobre riesgo de alucinación más allá de los fallos documentados.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y los fallos de política deben mitigarse en la capa determinista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIHeikki/sovereign-desk-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Puerta de veto opcional: https://huggingface.co/AIHeikki/sovereign-desk-veto-qwen3.5-0.8b
- Traza completa de resultados: `reports/exp13_v2_sovereign_desk_results.json` (en el repositorio del modelo)
- Manifiesto del dataset: `reports/dataset_manifest.json` (en el repositorio del modelo)
- Broker de permisos: `runtime/permission_broker.py` (en el repositorio del modelo)
- Delta quirúrgico BF16: `patches_and_attestations/v2/sovereign-desk-qwen3.5-4b-surgical-delta.safetensors` (en el repositorio del modelo)
