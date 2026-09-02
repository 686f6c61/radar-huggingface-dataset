# hangerrits/Qwen3.8-27B-oQ3.5e-mtp

## Resumen

Este repositorio contiene una cuantización de 3 bits del modelo Qwen3.8-27B, realizada con la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors. El autor, hangerrits, ha publicado este checkpoint con el objetivo de ofrecer una versión reducida del modelo original de Alibaba para su uso en entornos con recursos limitados, especialmente en hardware Apple Silicon gracias a la librería MLX. La cuantización utiliza 3 bits con un grupo de tamaño 64, lo que reduce significativamente el peso del modelo en memoria. Sin embargo, los metadatos de safetensors indican 4.380.854.512 parámetros totales, una cifra muy inferior a los 27.000 millones que sugiere el nombre, lo que podría deberse a una arquitectura con parámetros compartidos o a un error en el registro; no se dispone de más información al respecto. La relevancia de este modelo radica en su potencial para ejecutar tareas de generación de texto y razonamiento en dispositivos con VRAM moderada, aunque la falta de documentación detallada limita su evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo qwen3_5, según la model card) |
| Parametros totales | 4.380.854.512 (según safetensors; el nombre sugiere 27B, discrepancia sin explicar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original Qwen3.8-27B, perteneciente a la serie Qwen3.8 de Alibaba. La arquitectura base es un transformer, presumiblemente con capacidades multimodales (visión y texto) según la documentación oficial de Qwen3.8-27B, aunque no se confirma en esta ficha. El proceso de cuantización emplea la herramienta oQ de oMLX, que aplica una cuantización mixta de precisión con 3 bits y group size 64, optimizada para el runtime MLX. No se dispone de información sobre el entrenamiento original (número de tokens, dataset, técnicas de alineación como RLHF o DPO) ni sobre innovaciones específicas de la cuantización más allá de los parámetros indicados.

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización de Qwen3.8-27B, se espera que herede las capacidades del modelo base, que incluyen instrucción, razonamiento y generación de código, aunque no hay pruebas específicas en esta ficha.
- Visión: el modelo original Qwen3.8-27B soporta entrada de imágenes según la documentación de Cloudflare, pero no se confirma que esta cuantización mantenga dicha funcionalidad.
- Soporte de agentes: el modelo base está diseñado para cargas de trabajo agénticas, pero no se especifica si esta versión cuantizada conserva el soporte de tool calling o multi-step reasoning.
- Multilingüismo: no se dispone de datos sobre los idiomas soportados por esta cuantización.

## Casos de uso

- Inferencia en Apple Silicon: gracias al formato MLX, este modelo puede ejecutarse de forma eficiente en Macs con chips M1/M2/M3, aprovechando la aceleración unificada de memoria.
- Prototipado rápido en entornos con VRAM limitada: la cuantización de 3 bits reduce el peso a unos 14.8 GB, permitiendo su carga en GPUs de consumo con 16 GB de VRAM, como RTX 4080 o 4090, para pruebas de concepto.
- Despliegue en edge computing: en dispositivos con restricciones de memoria, esta versión cuantizada podría habilitar asistentes de texto locales sin conexión.
- Evaluación de la degradación por cuantización: útil para investigadores que estudian el impacto de la precisión de 3 bits en el rendimiento de modelos grandes.
- Generación de texto en dispositivos móviles: si se convierte a otro formato (p. ej., GGUF), podría integrarse en aplicaciones móviles, aunque no se proporcionan instrucciones de conversión.
- Fine-tuning sobre cuantización: aunque no se documenta, es posible usar esta base para adaptaciones posteriores con técnicas como LoRA, siempre que se respete la licencia (desconocida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para esta cuantización específica, ni comparaciones con el modelo original o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 14.8 GB, por lo que se necesitan al menos 16 GB de memoria para cargar el modelo en GPU. En Apple Silicon, se recomienda un Mac con al menos 16 GB de memoria unificada.
- GPU recomendadas: RTX 4080, RTX 4090, o GPUs de datacenter como A100 con 40 GB (aunque con holgura). No se recomienda para GPUs con menos de 12 GB.
- Compatibilidad con consumer GPU: sí, siempre que tengan 16 GB o más de VRAM.
- Opciones de despliegue: el formato MLX es nativo para Apple Silicon (a través de la librería MLX). Para otras plataformas, sería necesario convertir los pesos a formatos como GGUF o safetensors estándar, aunque no se documenta ese proceso.
- Latencia y throughput: no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar esta cuantización con otras alternativas (p. ej., versiones GGUF de Qwen3.8-27B o cuantizaciones de modelos similares como Llama 3.1 27B). Los datos de parámetros, contexto y rendimiento de modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos del modelo base ni de esta cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje, y potencialmente mayor con cuantización de 3 bits por pérdida de precisión.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; podría ser inferior a la del modelo original.
- Restricciones de licencia: la licencia no está especificada, por lo que se desaconseja su uso comercial sin verificar los derechos.
- Advertencia sobre parámetros: la discrepancia entre el nombre (27B) y los parámetros reportados (4.38B) sugiere que el archivo safetensors podría estar incompleto o que el modelo tiene una arquitectura especial (p. ej., MoE con parámetros compartidos). Se recomienda verificar la integridad del checkpoint antes de usarlo en producción.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/hangerrits/Qwen3.8-27B-oQ3.5e-mtp
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Documentación de Qwen3.8 en Cloudflare: https://developers.cloudflare.com/ai/models/%40cf/qwen/qwen3.8-27b/
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
