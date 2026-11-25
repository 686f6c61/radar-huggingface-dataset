# Lvetter/lvetter-silicon-29b

## Resumen

Lvetter Silicon 29B es un modelo de lenguaje causal de tipo transformer, aparentemente derivado de la familia Qwen2 (según los tags de Hugging Face), publicado por el autor Lvetter dentro de un proyecto denominado "Lvetter AI". Aunque el nombre comercial indica 29B, el recuento real de parámetros almacenados en los pesos safetensors es de 32.763.876.352 (aproximadamente 32,8 mil millones), lo que sugiere una discrepancia entre la denominación de marketing y el tamaño efectivo del modelo. El repositorio ocupa 65,8 GB, coherente con pesos en bfloat16.

El modelo está especializado en contenido en polaco y orientado a derecho mercantil, fiscalidad, escenarios B2B, finanzas y arquitectura de infraestructura (PostgreSQL, nube). Su model card lo presenta como un asesor jurídico-empresarial y mentor técnico con un estilo de comunicación directo, sin lo que el autor denomina "yes-man" ni lenguaje corporativo vacío.

Es relevante ahora porque se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y porque cubre un nicho poco atendido: modelos de gran tamaño con foco explícito en el ordenamiento jurídico y fiscal polaco. No obstante, la información pública es muy limitada: no hay detalles de entrenamiento, benchmarks ni datos de evaluación, y el número de descargas es reducido (28 en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen2, según tags del repositorio) |
| Parametros totales | 32.763.876.352 (≈32,8B; el nombre comercial indica 29B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el quickstart usa bfloat16) |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de calificarla como "Standalone Causal Language Model". Los tags de Hugging Face incluyen `qwen2`, lo que apunta a una arquitectura transformer decoder-only con el esquema de atención y normalización de la familia Qwen2, aunque no se confirma oficialmente ni se detalla el número de capas, dimensiones ocultas o cabezas de atención.

No se dispone de información sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni qué proporción de datos jurídicos, fiscales o técnicos se utilizó. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento explícito. Toda esta sección debe considerarse no disponible a partir de la información pública.

## Capacidades

- Generación de texto conversacional en polaco con registro directo y tuteo.
- Asesoramiento en derecho mercantil polaco: KSH (Código de Sociedades Mercantiles), Código Civil.
- Consultas fiscales: ryczałt (impuesto fijo), podatek liniowy (impuesto lineal), IVA, WHT (retención en la fuente), KSeF (sistema de facturación electrónica).
- Gestión de cobros B2B (windykacja) y escenarios financieros de empresa.
- Arquitectura de bases de datos PostgreSQL e infraestructura en la nube.
- Soporte de plantilla de chat conversacional mediante `apply_chat_template` con roles system/user.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo y razonamiento multi-paso: el tag `autonomous-agent` aparece en el repositorio, pero no se documenta su implementación.
- Capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Asesoría jurídica para pymes polacas: el modelo puede responder consultas sobre constitución de sociedades, obligaciones del KSH y responsabilidad de administradores, aprovechando su especialización declarada en derecho mercantil.
- Consultas fiscales operativas: cálculo orientativo y explicación de regímenes como ryczałt, podatek liniowy o retenciones WHT, útil como primera línea de soporte para gestorías.
- Soporte en facturación electrónica KSeF: resolución de dudas sobre el flujo de emisión y recepción de facturas en el sistema polaco.
- Gestión de cobros B2B: redacción de comunicaciones de reclamación de deuda y orientación sobre vías de windykacja, con un tono directo adecuado para el contexto comercial.
- Asistencia técnica en PostgreSQL: revisión de esquemas, consultas y buenas prácticas de modelado de datos para equipos de desarrollo.
- Mentoría técnica y empresarial: acompañamiento en decisiones de arquitectura cloud y priorización de proyectos, dado el perfil de "mentor" declarado por el autor.
- Atención al cliente en polaco: conversaciones multi-turno con un registro natural y sin circunloquios, siempre que la longitud de contexto (no documentada) sea suficiente para el caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 32,8B parámetros requieren aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB de VRAM para una ejecución cómoda.
- Cuantización a 8 bits: alrededor de 33 GB de VRAM, viable en una A100 40GB o en dos RTX 4090.
- Cuantización a 4 bits: alrededor de 17-20 GB, lo que permitiría ejecución en una única RTX 4090 (24 GB), aunque con posible pérdida de calidad no evaluada.
- GPU recomendadas: A100 80GB, H100 80GB para bfloat16; A100 40GB o configuraciones multi-GPU para 8 bits.
- Cabe en GPU de consumo: solo mediante cuantización agresiva (4 bits) en RTX 4090 o RTX 3090; no cabe en tarjetas de 16 GB o menos sin offloading a CPU.
- Opciones de despliegue: transformers (documentado en el quickstart), y previsiblemente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque el autor no los publica ni los menciona.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Lvetter Silicon 29B | 32,8B | no disponible | pl | Apache 2.0 | Especializado en derecho y fiscalidad polaca; sin benchmarks públicos |
| Qwen2.5 32B | 32,5B | 128K (según versión) | multilingüe | Apache 2.0 (mayoría de variantes) | Base probable; cobertura multilingüe amplia y benchmarks publicados |
| Bielik 11B | 11B | 4K-32K según versión | pl | Apache 2.0 | Modelo polaco nativo de referencia, con evaluaciones públicas en tareas en polaco |
| Llama 3.1 70B | 70B | 128K | multilingüe | Llama Community License | Mayor tamaño y rendimiento general, pero menor especialización jurídica polaca |

La comparación con Bielik es la más directa por nicho lingüístico, aunque Lvetter Silicon triplica su tamaño. Frente a Qwen2.5 32B, la diferencia principal es la especialización declarada y la ausencia de datos de evaluación que permitan verificar mejoras. No se dispone de comparaciones oficiales del autor.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa de rendimiento en tareas jurídicas, fiscales o de código.
- Riesgo elevado de alucinación en materia legal y fiscal: un modelo sin evaluación publicada no debe usarse como fuente normativa vinculante; requiere revisión por profesional colegiado.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de alineación, por lo que no se pueden evaluar sesgos políticos, sociales o de género.
- Cobertura lingüística limitada al polaco: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto no documentada: limita el diseño de aplicaciones con documentos largos o conversaciones extensas.
- Nombre comercial engañoso: la denominación "29B" no coincide con los 32,8B parámetros reales, lo que puede confundir en la planificación de recursos.
- Ecosistema incipiente: solo 28 descargas y 0 likes en el momento de la consulta; sin comunidad, issues ni soporte documentado.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso.
- El tag `autonomous-agent` no está respaldado por documentación técnica sobre tool calling o planificación multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/Lvetter/lvetter-silicon-29b
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
