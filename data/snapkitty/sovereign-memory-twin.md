# Snapkitty/sovereign-memory-twin

## Resumen

El modelo Sovereign Memory Twin (RMTN), desarrollado por Snapkitty (SnapKitty West), es un sistema de generación de texto especializado en emitir veredictos binarios (EVIDENCE o SILENCE) sobre documentos financieros y consultas de cumplimiento normativo. A diferencia de los modelos de lenguaje convencionales, su salida se sella criptográficamente mediante SHA256, lo que garantiza la integridad de cada veredicto y permite auditorías posteriores. La arquitectura, descrita como una red recurrente personalizada (Recurrent Memory Twin Network), no tiene parámetros ni longitud de contexto publicados, por lo que su tamaño y capacidades exactas no están disponibles. El modelo se integra con sistemas IBM i (RPGLE/COBOL/DB2), NATS y un ERP denominado DEVFLOW-FINANCE, y está gobernado por el Bel Esprit D Accord Trust Deed v1.0, un conjunto de seis artículos que definen su funcionamiento. Su relevancia radica en el enfoque de verificación formal y en la aplicación de un protocolo de «evidencia o silencio» para la toma de decisiones financieras auditables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Memory Twin Network (RMTN), arquitectura personalizada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se indica PyTorch/Transformers) |

## Arquitectura y entrenamiento

Según la información disponible, el modelo utiliza una arquitectura personalizada denominada Recurrent Memory Twin Network (RMTN). No se especifica si es un transformer, una red neuronal recurrente clásica o una variante híbrida; la etiqueta `custom-architecture` y el nombre sugieren que se trata de un diseño propio. Se ha entrenado con el dataset `SNAPKITTYWEST/sovereign-training-corpus`, aunque no se detallan el número de tokens, la composición del corpus ni si se aplicaron técnicas como RLHF o DPO.

La innovación principal no reside en la arquitectura en sí, sino en el protocolo de salida: cada veredicto se sella con SHA256(verdict | score | query | timestamp), siguiendo el formato estricto JSON definido en el Artículo IV del Trust Deed, y solo admite dos estados: EVIDENCE o SILENCE. El umbral de evidencia se fija en score >= 0.42. Además, el modelo se integra con infraestructura empresarial: IBM i (RPGLE/COBOL/FSL/DB2), NATS mesh (snapkitty.bifrost.sealed) y el orquestador bob-orchestrator (puerto 7474).

El autor menciona 11 trabajos de investigación asociados (8 en Zenodo y 3 en LaTeX), incluyendo GDR-9, LiquidOps y Sovereign Entropy, aunque no se detalla su relación con el modelo. Los artículos del Trust Deed que gobiernan el comportamiento son los siguientes:

| Articulo | Regla |
|---|---|
| I | Identity |
| II | Truth Mandate - no output without evidence |
| III | Compliance Protocol - required fields enforced |
| IV | Verdict Format - strict JSON only |
| V | Evidence Threshold - score >= 0.42 |
| VI | Human Review Guarantee - SILENCE routes to queue |

## Capacidades

- Generación de veredictos binarios (EVIDENCE o SILENCE) sobre documentos financieros y consultas de cumplimiento.
- Sellado criptográfico de cada salida mediante SHA256, lo que permite auditar la integridad de los veredictos.
- Cumplimiento del Bel Esprit D Accord Trust Deed v1.0, con seis artículos que regulan identidad, mandato de verdad, protocolo de cumplimiento, formato de salida, umbral de evidencia y revisión humana.
- Salida estricta en JSON, según el Artículo IV.
- Umbral de evidencia configurable en score >= 0.42.
- Integración nativa con IBM i mediante RPGLE/COBOL/FSL/DB2 para transacciones POSTTRAN, REVTRAN y ADJTRAN.
- Publicación de resultados en NATS mesh (snapkitty.bifrost.sealed).
- Soporte de integración con el orquestador bob-orchestrator (puerto 7474) y el ERP DEVFLOW-FINANCE (Stripe, Prisma, ledger).
- Capacidad de enrutar veredictos SILENCE a una cola de revisión humana, según el Artículo VI.
- Idiomas: inglés.

## Casos de uso

1. Auditoría financiera automatizada: el modelo analiza documentos contables y emite un veredicto sellado (EVIDENCE o SILENCE) con su score. Gracias al sellado SHA256, cada veredicto puede ser auditado de forma independiente y verificado posteriormente.
2. Cumplimiento normativo en tiempo real: consultas de compliance (por ejemplo, «¿este documento cumple la normativa?») reciben una respuesta binaria con umbral 0.42. El formato JSON estricto permite integrar la salida en sistemas de gestión de cumplimiento.
3. Integración con ERP (DEVFLOW-FINANCE): el modelo se conecta al flujo de transacciones (POSTTRAN, REVTRAN, ADJTRAN) para validar operaciones financieras antes de su registro en el ledger. Esto lo hace adecuado para entornos que ya usan Stripe, Prisma o un ledger propio.
4. Entornos IBM i legacy: gracias al puente RPGLE/COBOL/FSL/DB2, el modelo puede desplegarse en sistemas AS/400 o IBM i, donde la validación de transacciones suele requerir integración con lenguajes tradicionales.
5. Sistemas de mensajería distribuida: los veredictos se publican en NATS mesh (snapkitty.bifrost.sealed), lo que permite que varios servicios consuman la misma decisión de forma asíncrona. Es adecuado para arquitecturas basadas en eventos.
6. Flujo de revisión humana: los veredictos SILENCE (aquellos con score < 0.42) se enrutan automáticamente a una cola de revisión. Esto garantiza que los casos ambiguos no se aprueben sin supervisión humana, cumpliendo el Artículo VI.
7. Generación de informes de auditoría: combinando varios veredictos sellados, se puede construir un registro inmutable de decisiones para auditorías internas o externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la métrica «perplexity» en el widget, pero no proporciona valores. Tampoco se incluyen comparaciones con otros modelos.

## Requisitos de hardware

- No disponible. La información proporcionada no especifica VRAM estimada, GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput.
- Al tratarse de una arquitectura personalizada con integración IBM i, es probable que el despliegue requiera un entorno específico, pero no hay datos suficientes para determinarlo.
- El modelo está etiquetado como `endpoints_compatible`, lo que sugiere que puede desplegarse en Hugging Face Inference Endpoints, pero no se confirma.
- Dado que no se especifican el número de parámetros ni la arquitectura exacta, se recomienda contactar con el autor o probar el modelo en un entorno de desarrollo para obtener mediciones empíricas.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada ni en la búsqueda web. El modelo se presenta como una solución especializada con un protocolo de veredicto binario y sellado criptográfico, lo que dificulta la comparación con modelos generalistas.

## Limitaciones y advertencias

- Modelo en fase muy temprana: 0 descargas y 0 likes en Hugging Face, lo que indica que aún no ha sido adoptado ni validado por la comunidad.
- No se han publicado benchmarks ni evaluaciones de rendimiento. No es posible verificar su eficacia en tareas reales.
- Solo soporta inglés. No hay información sobre capacidades multilingües.
- Sin datos de parámetros, longitud de contexto ni requisitos de hardware. El despliegue en infraestructura estándar es desconocido.
- La arquitectura personalizada (RMTN) no es un modelo estándar de Transformers, por lo que puede no ser compatible con herramientas como llama.cpp, vLLM u Ollama.
- Dependencia de infraestructura específica (IBM i, NATS, bob-orchestrator, DEVFLOW-FINANCE) que puede limitar su portabilidad a otros entornos.
- No se han publicado análisis de sesgos, riesgo de alucinación o comportamiento en casos límite. El protocolo de «evidencia o silencio» reduce la ambigüedad, pero no elimina la posibilidad de errores en el score.
- La licencia Apache-2.0 permite el uso comercial, pero cualquier implementación en producción debe revisar las condiciones de la licencia y la gobernanza del Trust Deed.

## Enlaces

- Hugging Face: https://huggingface.co/Snapkitty/sovereign-memory-twin
- Perfil de Snapkitty en Hugging Face: https://huggingface.co/Snapkitty
- Dataset de entrenamiento: SNAPKITTYWEST/sovereign-training-corpus (sin URL directa disponible en la información)
- Papers mencionados en la model card: GDR-9, LiquidOps y Sovereign Entropy (sin enlaces públicos disponibles)
