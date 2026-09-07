# SNAPKITTYWEST/sovereign-memory-twin

## Resumen

El modelo Sovereign Memory Twin (RMTN) es un sistema de generación de texto desarrollado por SNAPKITTYWEST que emite veredictos criptográficamente sellados (EVIDENCE o SILENCE) sobre documentos financieros y consultas de cumplimiento. Se basa en una arquitectura personalizada denominada Recurrent Memory Twin Network, de la que no se han publicado el número de parámetros ni la longitud de contexto. El modelo se presenta como una solución para automatizar la auditoría de cumplimiento mediante un protocolo binario sin estados intermedios, con un umbral de evidencia fijado en 0.42. Su relevancia radica en la integración con sistemas empresariales como IBM i, DB2 y NATS, y en el uso de verificación formal y sellado SHA256 para garantizar la integridad de las decisiones. El modelo está disponible bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sovereign-memory-twin (arquitectura personalizada) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura del modelo es una red recurrente de memoria gemela (Recurrent Memory Twin Network, RMTN), definida como una arquitectura personalizada en la ficha de HuggingFace. Según la model card, el modelo implementa un protocolo de veredictos WORM-sealed: cada salida es un hash SHA256 de la combinación de veredicto, puntuación, consulta y marca temporal. El entrenamiento utiliza el dataset SNAPKITTYWEST/sovereign-training-corpus, del que no se especifican el número de tokens, la composición ni las técnicas de alineación (RLHF/DPO). El modelo se enmarca en un ecosistema más amplio de verificación formal, con papers como GDR-9, LiquidOps y Sovereign Entropy, que abordan la verificación de kernels y límites de entropía, aunque no se detalla su relación directa con el entrenamiento del modelo.

Una innovación destacable es el uso de un Trust Deed de seis artículos que gobierna el comportamiento del modelo, incluyendo el mandato de no emitir salidas sin evidencia y el formato JSON estricto para los veredictos. Además, la integración nativa con IBM i (RPGLE/COBOL FSL/DB2) y la publicación en una malla NATS permiten su uso en entornos empresariales de mainframe.

## Capacidades

- Genera veredictos binarios EVIDENCE o SILENCE sobre documentos financieros y consultas de cumplimiento.
- Aplica un umbral de evidencia de 0.42 para decidir el veredicto.
- Sella cada veredicto con SHA256(verdict | score | query | timestamp), lo que proporciona trazabilidad criptográfica.
- Produce salidas en formato JSON estricto, tal como exige el artículo IV del Trust Deed.
- Se integra con sistemas IBM i mediante RPGLE/COBOL FSL/DB2 para procesar transacciones POSTTRAN / REVTRAN / ADJTRAN.
- Publica veredictos en una malla NATS (snapkitty.bifrost.sealed) para sistemas distribuidos.
- Enruta los veredictos SILENCE a una cola de revisión humana, según el artículo VI del Trust Deed.
- El modelo solo soporta el idioma inglés.

## Casos de uso

- Auditoría de cumplimiento financiero: el modelo analiza documentos y emite un veredicto EVIDENCE o SILENCE con una puntuación, lo que permite automatizar la revisión de conformidad normativa en procesos de auditoría.
- Integración con ERP: se conecta a DEVFLOW-FINANCE (Stripe, Prisma, ledger) para verificar transacciones y generar registros sellados que pueden ser auditados posteriormente.
- Verificación en entornos mainframe: mediante el puente IBM i, el modelo puede procesar transacciones POSTTRAN, REVTRAN y ADJTRAN en sistemas DB2, proporcionando veredictos sobre la validez de las operaciones.
- Trazabilidad en sistemas distribuidos: publica veredictos sellados en la malla NATS, lo que permite a otros servicios consumir decisiones con integridad verificable.
- Automatización de gobernanza: aplica los seis artículos del Trust Deed, garantizando que no se emitan veredictos sin evidencia suficiente y enrutando los SILENCE a revisión humana.
- Revisión de documentos legales: evalúa cláusulas de cumplimiento en contratos y devuelve un veredicto binario con puntuación, útil para sistemas de gestión documental que requieren decisiones rápidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El frontmatter de la model card indica perplexity como métrica, pero no se proporcionan valores. Tampoco se han publicado comparativas con otros modelos.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos. Al tratarse de un modelo transformers de generación de texto, se necesita una GPU con VRAM suficiente para el tamaño del modelo, que no está especificado. Para el despliegue se podrían considerar vLLM, llama.cpp, Ollama o TGI, pero no hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de una arquitectura personalizada con un protocolo de veredictos específico.

## Limitaciones y advertencias

- El modelo solo soporta inglés (en), lo que limita su uso en entornos multilingües.
- No se han publicado benchmarks ni evaluaciones externas, por lo que su rendimiento no está validado por la comunidad.
- El protocolo de veredictos binarios EVIDENCE/SILENCE puede ser demasiado restrictivo para casos que requieran matices o estados intermedios.
- El umbral de evidencia de 0.42 es un parámetro fijo que puede no ser adecuado para todos los dominios.
- La integración con IBM i y NATS requiere infraestructura específica que puede no estar disponible en entornos estándar.
- La gobernanza mediante Trust Deed puede imponer restricciones adicionales más allá de la licencia Apache-2.0.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido probado por la comunidad.
- Existe riesgo de alucinación inherente a los modelos de lenguaje, que no queda mitigado por la verificación formal descrita.

## Enlaces

- HuggingFace: https://huggingface.co/SNAPKITTYWEST/sovereign-memory-twin
- GitHub de SNAPKITTYWEST: https://github.com/SNAPKITTYWEST
- GitHub TWIN: https://github.com/SNAPKITTYWEST/TWIN/tree/main/
- HuggingFace Snapkitty/sovereign-harness: https://huggingface.co/Snapkitty/sovereign-harness
- Sovereign Router: https://snapkittywest.github.io/router.html
