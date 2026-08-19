# NamanAgnih0tri/AlphaRoute-0.8B-v1.0

## Resumen

AlphaRoute-0.8B-v1.0 es un modelo de lenguaje compacto de 752 millones de parámetros, desarrollado por NamanAgnih0tri, especializado en routing semántico de intenciones y extracción estructurada de información. A diferencia de los clasificadores tradicionales con cabezas de salida fijas, opera como un meta-router zero-shot: dado un query de usuario y un conjunto de categorías definidas dinámicamente con descripciones semánticas, predice la intención más adecuada, extrae parámetros contextuales y genera una decisión JSON restringida según un esquema arbitrario definido en tiempo de ejecución, sin necesidad de reentrenamiento ni ajuste fino.

El modelo se basa en Qwen/Qwen3.5-0.8B-Base y está pensado para pipelines de producción que requieren clasificación de intenciones, detección de out-of-scope y salida estructurada en JSON. Su relevancia actual radica en su capacidad para adaptarse a ontologías cambiantes por petición, lo que lo hace útil en sistemas de atención al cliente, agentes conversacionales y automatización de procesos que necesitan decisiones enrutadas con alta fidelidad y bajo coste computacional. Los pesos se distribuyen en formato Safetensors FP16 sin cuantizar, compatibles con Transformers, vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basada en Qwen3.5-0.8B-Base) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-0.8B-Base, no especificada) |
| Tipos de cuantizacion | 8-bit y 4-bit (mencionados en benchmarks; formato exacto no especificado) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16) |

## Arquitectura y entrenamiento

AlphaRoute-0.8B-v1.0 es un modelo de lenguaje pequeño (SLM) basado en la arquitectura transformer causal de Qwen3.5-0.8B-Base, sobre la cual se ha realizado un ajuste fino (fine-tuning) específico para tareas de routing semantico y extraccion estructurada de informacion. El entrenamiento se ha orientado a que el modelo siga instrucciones complejas que definen categorias, esquemas JSON y politicas out-of-scope, generando salidas JSON validas en una sola pasada. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO. La innovacion principal reside en su capacidad de adaptacion dinamica: el modelo puede cambiar de ontologia, nombres de campos y estructura de salida en cada peticion sin reentrenamiento, gracias a su entrenamiento como meta-router condicionado por instrucciones.

## Capacidades

- Routing semantico de intenciones: dado un query y un conjunto de categorias con descripciones, predice la categoria mas apropiada.
- Extraccion de slots y parametros: extrae entidades contextuales (importes, fechas, identificadores, codigos de error, etc.) directamente en claves definidas por el desarrollador, sin necesidad de un modelo NER separado.
- Generacion de JSON estructurado: sigue esquemas JSON arbitrarios, incluidos objetos anidados, arrays y valores permitidos explicitos.
- Deteccion out-of-scope: marca `"out_of_scope": true` y `"intent": null` cuando la entrada no coincide con ninguna categoria, evitando rutas alucinadas.
- Adaptabilidad zero-shot: permite cambiar categorias, esquemas y definiciones en cada peticion sin reentrenar.
- Soporte para few-shot: puede incorporar 1-2 ejemplos en contexto para mejorar la precision en dominios complejos.
- Compatible con vLLM y SGLang para inferencia de alto rendimiento.
- Generacion de texto conversacional y salidas JSON validas (100% en benchmarks publicados).

## Casos de uso

- Atencion al cliente automatizada: clasificar consultas de usuarios en categorias como facturacion, soporte tecnico o seguridad, y extraer parametros relevantes (numero de pedido, fecha, tipo de incidencia) para enrutar a sistemas de gestion de tickets.
- Enrutamiento de incidencias de infraestructura cloud: dado un evento de monitorizacion, identificar si se trata de una anomalia de costes, una escalada de privilegios IAM o un fallo de red, y generar un JSON con la severidad y acciones recomendadas.
- Chatbots de asistencia virtual: detectar la intencion del usuario en tiempo real (por ejemplo, en HWU64) y extraer slots como ubicacion, hora o entidad para completar transacciones.
- Sistemas de triaje en soporte tecnico: clasificar tickets entrantes en categorias predefinidas y extraer informacion estructurada (version de software, codigo de error, logs) para automatizar la derivacion a equipos especializados.
- Analisis de logs y telemetria: procesar mensajes de logs o alertas para determinar si son criticos, fuera de alcance o requieren accion, generando JSON con metadatos para pipelines de orquestacion.
- Agentes conversacionales con salida estructurada: integrar el modelo en un agente que necesita decidir que herramienta invocar (function calling) y con que argumentos, basandose en una ontologia de intenciones definida dinamicamente.
- Filtrado de contenido o moderacion: clasificar mensajes de usuarios en categorias como spam, ofensivo o legitimo, con deteccion de out-of-scope para evitar falsos positivos.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card del autor, que indica que fueron medidos con el motor de referencia de la familia del modelo y que la precision en los formatos standalone y cuantizados es practicamente identica.

| Dataset | Dominio | Precision 8-bit | Precision 4-bit | JSON valido |
|---|---|---|---|---|
| Banking77 (test oficial) | 77 intenciones bancarias de grano fino | 93.00% | 89.60% | 100.0% |
| CLINC150 (test oficial + OOS) | 150 intenciones + out-of-scope | 95.00% | 94.20% | 100.0% |
| HWU64 (test oficial, 1.076 consultas) | 64 intenciones de asistente de voz | 85.04% | 80.20% | 100.0% |

No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 1.5 GB (752M parametros x 2 bytes). Con cuantizacion 4-bit, la huella se reduce a unos 0.4-0.5 GB, permitiendo ejecucion en CPU o GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, T4) para FP16. Para cuantizacion 4-bit, basta con 1 GB.
- Compatibilidad con consumer GPU: si, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., incluso con cuantizacion.
- Opciones de despliegue: Transformers (PyTorch), vLLM, SGLang, llama.cpp (si se convierte a GGUF), Ollama (mediante conversion). No se menciona TGI, pero es compatible por ser un modelo transformers.
- Latencia y throughput: no disponibles en la documentacion. Dado el tamano del modelo, se espera una latencia baja (del orden de milisegundos por peticion en GPU moderna) y un throughput alto en vLLM o SGLang.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos de routing o clasificacion de intenciones en la informacion proporcionada. Como referencia, se podria comparar con clasificadores basados en BERT (por ejemplo, DistilBERT o MiniLM) que suelen tener menos parametros pero no ofrecen salida JSON estructurada ni adaptabilidad zero-shot. Sin embargo, no hay resultados cuantitativos disponibles para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles (etiqueta `en`). No se ha entrenado para otros idiomas, por lo que su uso en castellano u otros lenguajes puede degradar significativamente la precision.
- Dependencia de la calidad de las descripciones de categorias: la precision del routing depende directamente de que las definiciones semanticas de las categorias sean claras y no ambiguas. Descripciones vagas o solapadas pueden provocar errores.
- Riesgo de alucinacion en JSON: aunque los benchmarks muestran un 100% de JSON valido en los conjuntos evaluados, en escenarios no cubiertos el modelo puede generar campos o valores no contemplados en el esquema, especialmente si el esquema es muy complejo o las categorias son poco especificas.
- Contexto limitado: no se especifica la longitud de contexto; al basarse en Qwen3.5-0.8B-Base, es probable que sea corta (tipicamente 4K-8K tokens), lo que limita el procesamiento de consultas muy largas o multiples ejemplos few-shot.
- Sin informacion sobre datos de entrenamiento: no se han publicado detalles sobre el dataset de ajuste fino, lo que dificulta evaluar sesgos potenciales o cobertura de dominios.
- Benchmarks limitados: los resultados publicados se refieren a conjuntos de datos especificos (banca, asistentes de voz) y pueden no generalizar a otros dominios.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-0.8B-Base para asegurar compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NamanAgnih0tri/AlphaRoute-0.8B-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- No se han encontrado otros enlaces relevantes (paper, repositorio de codigo) asociados a este modelo especifico. Los resultados de busqueda sobre "AlphaRoute" en GitHub y arXiv se refieren a un proyecto de routing VLSI no relacionado.
