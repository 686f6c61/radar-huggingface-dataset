# mradermacher/turkish-banking-agent-1.5b-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `saturday-labs/turkish-banking-agent-1.5b`, un modelo de 1.5 mil millones de parámetros orientado a tareas de agente bancario en turco. La cuantización ha sido realizada por el equipo de mradermacher, conocido por generar versiones optimizadas de modelos open source para su ejecución en entornos con recursos limitados. El modelo original no dispone de documentación pública detallada en el momento de redactar esta ficha, por lo que la información técnica se limita a lo que se puede inferir del nombre y del propio archivo cuantizado.

La relevancia de esta publicación radica en que permite desplegar un asistente conversacional especializado en banca (presumiblemente en idioma turco) en hardware de consumo, gracias a la compresión GGUF. Sin embargo, al carecer de información sobre el modelo base, su adopción en producción requiere una evaluación previa de capacidades y limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.5B (según nombre del modelo) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios de la model card) |
| Idiomas soportados | no disponible (probablemente turco, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo original (si es transformer, MoE, etc.), el conjunto de datos de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. La model card del repositorio cuantizado solo indica que se trata de "static quants" del modelo `saturday-labs/turkish-banking-agent-1.5b`, sin aportar detalles adicionales. Por tanto, cualquier afirmación sobre el diseño o el proceso de entrenamiento sería especulativa.

## Capacidades

No se han publicado capacidades concretas del modelo. A partir del nombre, se puede inferir que está diseñado para actuar como agente conversacional en el sector bancario, probablemente en turco, pero no hay evidencia documentada de funciones como generación de código, razonamiento matemático, tool calling o soporte multilingüe. Se recomienda realizar pruebas empíricas antes de considerar su uso en cualquier aplicación.

## Casos de uso

Dado que no se dispone de información verificada, los siguientes casos son hipótesis razonables basadas en el nombre del modelo, no en datos confirmados:

- Atención al cliente bancario en turco: el modelo podría gestionar consultas frecuentes sobre saldos, movimientos o productos, aunque su tamaño reducido (1.5B) limita la complejidad de las respuestas.
- Asistente de operaciones bancarias simples: podría ayudar a los usuarios a entender procedimientos como transferencias o pagos, siempre que se valide su precisión.
- Clasificación de intenciones en chatbots bancarios: su formato compacto permite integrarlo en sistemas de enrutamiento de consultas.
- Generación de respuestas plantilla para preguntas frecuentes: útil en entornos con restricciones de hardware.
- Prototipado rápido de asistentes bancarios: para pruebas de concepto antes de migrar a modelos más grandes.
- Educación financiera básica: podría explicar conceptos sencillos en turco, aunque sin garantía de exactitud.

Estos usos son conjeturales y requieren validación con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo ni para su versión original. Tampoco se han encontrado comparativas con modelos similares.

## Requisitos de hardware

Al ser un modelo de 1.5B en formato GGUF, los requisitos estimados son orientativos y dependen de la cuantización elegida:

- VRAM estimada: para cuantizaciones de 4 bits (Q4_K_S), se necesitan aproximadamente 1-2 GB de VRAM; para 8 bits (Q8_0), alrededor de 2-3 GB. Estas cifras son típicas para modelos de este tamaño, pero no están confirmadas para este caso concreto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) puede ejecutar las versiones más ligeras. Para las cuantizaciones mayores, se recomienda una GPU de 6-8 GB (RTX 3060, RTX 4060).
- Compatibilidad con hardware de consumo: sí, las cuantizaciones Q2_K, Q3_K y Q4_K_S deberían funcionar en CPUs modernas y GPUs de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. No se ha verificado la compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles. Para un modelo de 1.5B en CPU, se puede esperar una generación de 10-20 tokens por segundo en hardware moderno, pero es una estimación genérica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (agentes bancarios en turco de 1.5B). No se han encontrado alternativas documentadas con las que establecer una comparación objetiva.

## Limitaciones y advertencias

- No se conoce la licencia del modelo original ni de las cuantizaciones, por lo que no se puede garantizar su uso comercial o la redistribución.
- El tamaño reducido (1.5B) implica una capacidad limitada para razonamiento complejo, gestión de contexto largo o precisión en tareas especializadas.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados. Al ser un modelo entrenado presumiblemente con datos en turco, podría reflejar sesgos culturales o lingüísticos no documentados.
- La ausencia de documentación técnica impide conocer la longitud de contexto real, lo que puede provocar errores si se supera el límite no declarado.
- El modelo no ha sido evaluado públicamente, por lo que su rendimiento en producción es incierto. Se recomienda una validación exhaustiva antes de cualquier despliegue.
- La fecha de creación (2026-08-18) es inusual y podría indicar un error en los metadatos; no se ha podido verificar la antigüedad real del modelo.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/turkish-banking-agent-1.5b-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/saturday-labs/turkish-banking-agent-1.5b
- Página del equipo mradermacher: https://huggingface.co/mradermacher
- Página de descarga de cuantizaciones de mradermacher: https://hf.tst.eu/model
