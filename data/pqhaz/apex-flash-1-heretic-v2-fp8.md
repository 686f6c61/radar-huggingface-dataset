# pqhaz/apex-flash-1-heretic-v2-FP8

## Resumen

apex-flash-1-heretic-v2-FP8 es una cuantización en FP8 del modelo pqhaz/apex-flash-1-heretic-v2, publicada por el usuario pqhaz. Se trata de un checkpoint multimodal de tipo image-text-to-text (etiqueta de arquitectura glm5_next) con 321.323.031.390 parámetros reales según los safetensors, y un repositorio de 328,4 GB. El modelo deriva en última instancia de un post-entrenamiento de GLM-5.3-Flash orientado a ciberseguridad y uso de herramientas, sobre el que se ha aplicado un proceso de "abliteration" (eliminación de alineamiento de seguridad) mediante la herramienta Heretic.

La relevancia de esta ficha es doble. Por un lado, es una cuantización en FP8 (e4m3, escalas por bloques de 128x128) construida con el mismo layout de tensores y la misma `quantization_config` que el release oficial zai-org/GLM-5.3-Flash, de modo que cualquier motor capaz de servir ese checkpoint debería cargar este de la misma forma. Por otro, pertenece a la categoría de modelos "abliterated"/"heretic", es decir, modelos con el alineamiento de seguridad eliminado, cuyo uso declarado por el autor es la investigación en seguridad autorizada.

No se dispone de información pública sobre idiomas soportados, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks para esta pieza concreta. La model card remite al repositorio BF16 para conocer qué se modificó y cómo se midió.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text, etiqueta glm5_next (detalles de capas, atención y expertos no disponibles) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible (no confirmado como MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (e4m3) con escalas por bloques de 128x128; el modelo base se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8), libreria transformers |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un transformer multimodal con pipeline image-text-to-text y etiqueta de arquitectura glm5_next. El modelo procede de la familia GLM: la cuantización replica el layout de tensores y la `quantization_config` del release oficial zai-org/GLM-5.3-Flash, lo que sugiere que comparte estructura con ese modelo, aunque no se detallan número de capas, tipo de atención, uso de MoE ni dimensiones ocultas. El proceso de cuantización se realizó con `convert.py`, el mismo script empleado en pqhaz/apex-flash-1-abliterated-FP8, aplicando FP8 e4m3 con una escala F32 por bloque de 128x128 (scale = amax / 448) y redondeo al más próximo, sin datos de calibración.

El rasgo distintivo no es la arquitectura, sino el post-procesado. El modelo base es un post-entrenamiento de GLM 5.3 Flash bautizado comercialmente como "Apex Flash 1", desarrollado por Cantina Security y Yeta con enfoque en ciberseguridad, investigación de código y uso de herramientas. Sobre él se ha aplicado un proceso de abliteration con Heretic, que combina una implementación avanzada de ablación direccional (Arditi et al. 2024; Lai 2025) con un optimizador de parámetros basado en TPE sobre Optuna. El conjunto exacto de parámetros modificados se documenta en el archivo `ablation.json` del repositorio BF16. No se dispone de datos sobre volumen de tokens, composición del dataset ni si hubo RLHF/DPO en el post-entrenamiento original.

## Capacidades

- Generacion de texto conversacional en formato multimodal (entrada de imagen y texto, salida de texto).
- Procesamiento de imagenes junto a texto, segun el pipeline image-text-to-text declarado.
- Capacidades orientadas a ciberseguridad, investigacion de codigo y uso de herramientas, heredadas del post-entrenamiento Apex Flash 1 sobre GLM 5.3 Flash.
- Soporte de tool calling / function calling: el post-entrenamiento base esta disenado explicitamente para code investigation y tool use, aunque no se detallan formatos concretos ni esquemas.
- Alineamiento de seguridad eliminado (abliterated): el modelo no incorpora las salvaguardas habituales de rechazo, lo que es en si mismo una capacidad buscada en el contexto de investigacion en seguridad.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad autorizada: el modelo esta declarado explicitamente para entornos que el investigador posee o tiene permiso para probar, y su post-entrenamiento de origen esta enfocado a seguridad, por lo que resulta adecuado para analisis de codigo malicioso y pruebas de concepto en laboratorio.
- Analisis de codigo a gran escala: con 321.000 millones de parametros, puede emplearse para revisar repositorios completos, localizar patrones vulnerables y generar informes tecnicos en pipelines internos de auditoria.
- Automatizacion de agentes con tool calling: al derivar de un modelo post-entrenado para uso de herramientas, puede integrarse en flujos multi-paso que invoquen funciones externas (escaneo, consulta de bases de datos, ejecucion controlada).
- Asistencia a equipos de respuesta a incidentes: procesamiento de trazas, registros y artefactos junto a capturas o diagramas, aprovechando la entrada multimodal para combinar texto e imagen.
- Evaluacion comparativa de alineamiento: al ser un modelo abliterated, sirve como referencia en estudios sobre eficacia de tecnicas de eliminacion de censura y sobre su impacto en capacidades.
- Servicio de inferencia autoalojado: su layout FP8 compatible con el release oficial de GLM-5.3-Flash permite desplegarlo en la misma infraestructura que ya sirviera ese checkpoint, sin reescribir la capa de carga de pesos.
- Generacion de documentacion tecnica de seguridad: resumenes de vulnerabilidades, notas de parcheo y guias de mitigacion dentro de un pipeline interno, sin depender de APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones del autor se realizaron sobre los pesos BF16 del modelo base, no sobre esta cuantizacion FP8, y remite a ese repositorio para consultar los datos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 321 GB solo para los pesos en FP8 (1 byte por parametro sobre 321.323.031.390 parametros), mas la cache KV y el overhead del runtime, lo que situa el total practico por encima de los 330-350 GB.
- GPU recomendadas: 8x H100 80 GB (640 GB) para un despliegue comodo con margen de contexto; 4x H100 80 GB (320 GB) queda por debajo de los pesos, por lo que resulta insuficiente sin offload. Alternativas con FP8 nativo son las arquitecturas Hopper (H100) y Ada (L40S, RTX 4090), aunque estas ultimas no alcanzan la VRAM necesaria en solitario.
- Cabe en consumer GPU: no. Ninguna GPU de consumo dispone de VRAM suficiente; solo seria viable mediante agregacion de multiples GPU o volcado parcial a CPU/NVMe, con penalizacion severa de latencia.
- Opciones de despliegue: vLLM y SGLang soportan FP8 y son los candidatos naturales; TGI tambien puede servir el formato. El autor indica que cualquier motor capaz de servir zai-org/GLM-5.3-Flash deberia cargar este checkpoint igual, al replicar nombres de tensores y `quantization_config`. llama.cpp y Ollama no estan pensados para este layout FP8 por bloques.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| pqhaz/apex-flash-1-heretic-v2-FP8 | 321,3 B | FP8 (e4m3, bloques 128x128) | no disponible | MIT | Objeto de esta ficha; abliteration Heretic v2 |
| pqhaz/apex-flash-1-heretic-v2 (base) | no disponible | BF16 | no disponible | MIT | Version sin cuantizar; contiene `ablation.json` |
| pqhaz/apex-flash-1-abliterated-FP8 | no disponible | FP8 (e4m3, bloques 128x128) | no disponible | MIT | Hermano, generado con el mismo `convert.py` |
| zai-org/GLM-5.3-Flash | no disponible | BF16 / FP8 oficial | no disponible | no disponible | Release oficial; referencia de layout de tensores |

Los datos de parametros, contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada mas alla de lo indicado.

## Limitaciones y advertencias

- Alineamiento de seguridad eliminado: el modelo ha sido sometido a abliteration, por lo que no aplica los rechazos habituales ante solicitudes potencialmente daninas. El autor lo destina exclusivamente a investigacion en seguridad autorizada en entornos propios o con permiso explicito.
- Riesgo de uso indebido: la combinacion de capacidades de ciberseguridad y ausencia de salvaguardas lo hace inadecuado para despliegues de cara al publico o sin supervision humana.
- Alucinacion: no se han publicado evaluaciones de fiabilidad ni tasas de alucinacion para esta cuantizacion ni para su base BF16.
- Riesgo de degradacion por cuantizacion: la model card advierte que las mediciones del autor se tomaron sobre los pesos BF16, no sobre este checkpoint FP8; el impacto real de la cuantizacion en calidad no esta cuantificado.
- Idiomas y contexto: no hay documentacion sobre cobertura idiomatica ni longitud de contexto, por lo que no se puede garantizar su comportamiento en entornos multilingues o con ventanas largas.
- Restricciones de licencia: la licencia es MIT, permisiva y sin restriccion explicita de uso comercial. No obstante, debe revisarse la licencia del modelo base original (GLM-5.3-Flash) y del post-entrenamiento Apex Flash 1, cuyos terminos no se detallan en la informacion disponible.
- Adopcion nula verificable en el momento de la consulta: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Requisitos de hardware extremos: 321.000 millones de parametros implican infraestructura multi-GPU de gama alta, lo que limita su uso a entornos con recursos significativos.

## Enlaces

- HuggingFace: https://huggingface.co/pqhaz/apex-flash-1-heretic-v2-FP8
- Modelo base (BF16): https://huggingface.co/pqhaz/apex-flash-1-heretic-v2
- Version abliterated FP8 relacionada: https://huggingface.co/pqhaz/apex-flash-1-abliterated-FP8
- Release oficial de referencia: https://huggingface.co/zai-org/GLM-5.3-Flash
- Heretic (herramienta de abliteration automatica): https://github.com/p-e-w/heretic
- Ficha en FriendliAI: https://friendli.ai/models/pqhaz/apex-flash-1-abliterated-FP8
- Ficha en NanoGPT de Apex Flash 1: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-apex
- Radar de modelos heretic/abliterated: https://modelheretic.com/
