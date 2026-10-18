# BlackwellBoy/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-heretic-overlay

## Resumen

Este repositorio es una variante "abliterated" (sin alineamiento de rechazo) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario BlackwellBoy. No se trata de un modelo entrenado desde cero, sino de una capa de modificación —el sufijo "heretic-overlay" lo indica— aplicada sobre la cuantización EXL3 a 2,9 bits por peso que el usuario LibertAIDAI había generado a partir del modelo original de deepseek-ai. El resultado es un artefacto orientado a generación de texto sin las restricciones de rechazo típicas del modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo típico del ecosistema de cuantización agresiva (2,9 bpw) pensada para ejecución local con recursos muy limitados. Por otro, ilustra la práctica de la "abliteración" automatizada mediante herramientas como Heretic, que localizan y anulan la dirección de rechazo en el espacio de activaciones en lugar de reentrenar con datos.

Conviene advertir desde el principio de que la información publicada es mínima: el repositorio no incluye model card con especificaciones, no declara arquitectura, número de parámetros ni longitud de contexto, y no aporta resultados de benchmarks. Todo lo que sigue distingue explícitamente entre datos declarados en las etiquetas de HuggingFace y cuestiones que quedan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no la declara; pertenece a la familia DeepSeek) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 2,9 bits por peso (bpw), formato de ExLlamaV3 |
| Idiomas soportados | no disponible (la model card no lista idiomas) |
| Licencia | MIT (según etiqueta), con acceso restringido que requiere aceptar condiciones en HuggingFace |
| Formato de pesos | EXL3 (ExLlamaV3); la etiqueta declara librería `transformers` |
| Tamaño del repositorio | 1,0 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Cuantización de origen | LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw |
| Pipeline | text-generation |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo base: ni tipo de transformer, ni número de capas, ni composición del dataset, ni si hubo fases de RLHF o DPO. Lo único deducible de las etiquetas es la cadena de derivación: el modelo original `deepseek-ai/DeepSeek-V4.1-Flash-1017` fue cuantizado por LibertAIDAI a EXL3 con 2,9 bits por peso y, sobre esa cuantización, BlackwellBoy aplicó una modificación de tipo "abliterated / heretic / uncensored".

La técnica de "abliteración" consiste en identificar la dirección de activación asociada a las respuestas de rechazo y restarla o proyectarla fuera de las activaciones internas, de modo que el modelo deja de negarse a responder ante ciertas peticiones sin necesidad de reentrenar los pesos completos. Heretic es una herramienta que automatiza ese proceso. El término "overlay" sugiere que el repositorio contiene un delta o parche aplicado sobre la cuantización base, no un conjunto completo de pesos independiente; esto es coherente con el tamaño de 1,0 GB del repositorio, aunque el repositorio no lo documenta explícitamente.

Como innovación técnica, el interés está en la combinación de dos técnicas de compresión y modificación: cuantización de 2,9 bpw (por debajo de los 4 bits habituales) y edición de comportamiento sin reentrenamiento. EXL3 es el formato de ExLlamaV3, diseñado para decodificación rápida en GPU con kernels propios.

## Capacidades

- Generación de texto: la etiqueta `text-generation` confirma el uso previsto, aunque no se detallan capacidades específicas.
- Respuestas sin rechazo: las etiquetas `abliterated`, `uncensored` y `heretic` indican que el modelo ha sido modificado para reducir las negativas ante peticiones que el modelo original rechazaría.
- Razonamiento, código y matemáticas: no disponible; no se han publicado evaluaciones ni descripciones al respecto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Integración con `transformers`: declarada en las etiquetas de librería, aunque EXL3 requiere normalmente el backend ExLlamaV3 o TabbyAPI para su ejecución eficiente.

## Casos de uso

- Investigación sobre alineamiento y direcciones de rechazo: el modelo sirve como material de estudio para comparar activaciones y respuestas antes y después de la abliteración, midiendo qué se degrada y qué se gana con la intervención.
- Red-teaming y evaluación de seguridad: permite generar respuestas que un modelo alineado bloquearía, lo que resulta útil para construir conjuntos de pruebas adversarias y evaluar clasificadores de contenido.
- Generación de datos sintéticos para dominios sensibles: en investigación sobre narrativa, ficción o temas médicos y legales, evita que el modelo se niegue a producir texto descriptivo necesario para el conjunto de datos.
- Escritura creativa y rol sin restricciones editoriales: para proyectos de ficción que abordan violencia, sexualidad o temas controvertidos, el modelo no aplica las negativas por defecto del original.
- Despliegue local en hardware muy limitado: con 2,9 bpw y un repositorio de 1,0 GB, está pensado para ejecutarse en GPU de consumo pequeñas o incluso compartir VRAM con otras cargas, usando ExLlamaV3 o TabbyAPI.
- Experimentación con formatos de cuantización: útil para comparar la calidad de EXL3 a 2,9 bpw frente a GGUF Q4 o EXL2 en la misma tarea, siempre que se disponga de la cuantización base completa.
- Pruebas de pipelines de inferencia: al ser un artefacto pequeño, sirve para validar integraciones con TabbyAPI, endpoints compatibles con OpenAI y herramientas de orquestación antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluación alguna de MMLU, HumanEval, GSM8K ni de métricas de calidad tras la cuantización o la abliteración, y tampoco se han encontrado referencias externas en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un repositorio de 1,0 GB de pesos implica del orden de 1 GB para los pesos en VRAM, más la caché KV correspondiente al contexto que se configure; con contextos largos esa caché puede superar ampliamente el tamaño de los pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería poder alojar los pesos con margen; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 son candidatas razonables. En el segmento profesional, A100 o H100 no aportan ventaja para un artefacto de este tamaño.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de GPU de consumo modernas con 8 GB o más, siempre que el contexto configurado no sea muy grande. Esta estimación se deriva del tamaño del repositorio y no de una ficha técnica del autor.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI son los backends naturales para EXL3; también podría cargarse mediante `transformers` si el soporte del formato está disponible en la versión instalada. vLLM, llama.cpp, Ollama y TGI no soportan EXL3 de forma nativa, por lo que requerirían conversión previa a otro formato.
- Latencia y throughput: no disponible. EXL3 está diseñado para decodificación rápida en GPU, pero no hay cifras publicadas para este artefacto concreto.
- Nota importante: si el repositorio contiene únicamente un overlay y no los pesos completos, será necesario descargar también la cuantización base de LibertAIDAI para poder ejecutarlo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlackwellBoy/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-heretic-overlay | no disponible | no disponible | abliterated / heretic overlay | MIT (etiqueta) | gated, 0 descargas |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | no disponible | no disponible | cuantización EXL3 2,9 bpw | no disponible | público |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | modelo original alineado | no disponible (verificar licencia de DeepSeek) | público |

No se dispone de datos de rendimiento que permitan comparar cualitativamente estas tres variantes. La diferencia documentada se limita al formato de pesos y a la presencia o ausencia de la modificación de rechazo.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con arquitectura, contexto, idiomas ni evaluación; cualquier uso en producción parte de una incertidumbre alta.
- La abliteración degrada la coherencia y la calidad en tareas que dependen del alineamiento original; es frecuente observar respuestas menos matizadas, mayor tasa de alucinación en temas sensibles y pérdida de utilidad en negativas legítimas (por ejemplo, rechazar peticiones dañinas reales).
- Riesgo de alucinación: no evaluado. La cuantización a 2,9 bpw, por debajo de 4 bits, introduce además error de cuantización que puede agravarse en modelos pequeños.
- Sin filtros de seguridad: el modelo no debe exponerse directamente a usuarios finales sin una capa de moderación externa; la responsabilidad legal del contenido generado recae en el desplegador.
- Licencia: la etiqueta indica MIT, pero el modelo deriva de un modelo de DeepSeek cuya licencia no se detalla en esta información. Conviene verificar los términos del modelo original antes de un uso comercial, ya que las condiciones del base pueden prevalecer.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones, lo que añade fricción a la descarga automatizada y a la integración en CI/CD.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en otras lenguas distintas del inglés sin evaluarlo.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión que permitan validar su funcionamiento.
- Ambigüedad del artefacto: al tratarse presuntamente de un overlay, es posible que no funcione de forma autónoma sin la cuantización base, y que la combinación de ambos produzca resultados distintos de los esperados si las versiones no coinciden.

## Enlaces

- Repositorio principal: https://huggingface.co/BlackwellBoy/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-heretic-overlay
- Cuantización base: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper, blog, repositorio de código o demo: no disponible (la búsqueda web realizada no devolvió resultados relevantes sobre este modelo).
