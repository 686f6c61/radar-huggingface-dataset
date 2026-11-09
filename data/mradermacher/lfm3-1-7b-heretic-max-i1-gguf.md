# mradermacher/LFM3-1.7B-Heretic-Max-i1-GGUF

## Resumen

LFM3-1.7B-Heretic-Max-i1-GGUF es una cuantización en formato GGUF del modelo LFM3-1.7B-Heretic-Max, publicado por el usuario mradermacher en Hugging Face. Se trata de un derivado de la familia LFM3 (Liquid Foundation Model 3) de 1.700 millones de parámetros, que a su vez ha sido modificado por MihaiPopa-1 para producir la variante "Heretic-Max", presumiblemente una versión con ajustes de alineación o "abliteración" orientados a eliminar restricciones de rechazo. El repositorio de mradermacher se limita a ofrecer los pesos cuantizados en múltiples niveles de precisión para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha es limitada desde el punto de vista técnico: el repositorio no incluye model card descriptiva, no declara licencia, idiomas ni pipeline, y no aporta datos de entrenamiento ni benchmarks. La información disponible se reduce a los metadatos de cuantización y a la referencia del modelo base. El dato de "parámetros totales" reportado en los metadatos (899.013) es inconsistente con el nombre del modelo (1.7B) y debe tratarse con cautela.

Por tanto, esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Se recomienda consultar el repositorio del modelo base para obtener especificaciones completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base LFM3; presumiblemente transformer, sin confirmar) |
| Parametros totales | 1.7B segun el nombre del modelo; los metadatos del repo indican 899.013 (dato inconsistente, ver advertencias) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1, generadas con imatrix/weighted quants) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3-1.7B más allá de su pertenencia a la familia LFM3 de Liquid AI, de la que no se aportan detalles en este repositorio. El proceso de cuantización sí está documentado parcialmente en los comentarios de la model card: se han generado cuantizaciones "i1" (weighted/imatrix quants) a partir del modelo MihaiPopa-1/LFM3-1.7B-Heretic-Max, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Esto indica una conversión desde pesos en formato Hugging Face a GGUF mediante una herramienta tipo llama.cpp, aplicando una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión.

No hay información sobre el dataset de entrenamiento, el número de tokens, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La variante "Heretic-Max" sugiere una modificación orientada a reducir los rechazos del modelo (técnica conocida como abliteration o "uncensoring"), pero el repositorio no documenta el método empleado ni su impacto en el rendimiento.

## Capacidades

- Generación de texto: capacidad heredada del modelo base, sin detalles publicados.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Alineación reducida: la variante "Heretic-Max" implica, por su nombre, una menor tasa de rechazos ante peticiones, pero no se documenta el alcance ni los efectos secundarios.

## Casos de uso

- Experimentación local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 1.7B en GPUs con 4-6 GB de VRAM o incluso en CPU, lo que facilita pruebas de concepto sin infraestructura dedicada.
- Investigación sobre alineación y "abliteration": la variante Heretic-Max es útil para estudiar cómo la eliminación de rechazos afecta al comportamiento del modelo, comparando respuestas con el modelo base original.
- Generación de texto creativo sin filtros: para proyectos que requieren respuestas menos restrictivas en dominios como ficción o guiones, siempre que se cumplan los requisitos legales y éticos aplicables.
- Prototipado rápido de pipelines de inferencia con llama.cpp: al ofrecer 24 niveles de cuantización, permite ajustar el equilibrio entre calidad y consumo de memoria en distintas etapas de desarrollo.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre Q2_K y Q6_K en un modelo pequeño, como referencia metodológica.
- Despliegue en entornos con recursos muy limitados: las variantes IQ1_S e IQ2_XXS permiten ejecutar el modelo en dispositivos con menos de 2 GB de RAM/VRAM, aunque con pérdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 1.7B, estimaciones orientativas según cuantización):
  - Q6_K: aproximadamente 1,4-1,6 GB.
  - Q5_K_M: aproximadamente 1,2-1,4 GB.
  - Q4_K_M / IQ4_XS: aproximadamente 1,0-1,2 GB.
  - Q3_K_M: aproximadamente 0,9-1,0 GB.
  - Q2_K: aproximadamente 0,7-0,8 GB.
  - IQ1_S: aproximadamente 0,5-0,6 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones Q4 y superiores con comodidad; para Q6_K se recomienda 6 GB o más.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Max-i1-GGUF (este) | 1.7B (nominal) | no disponible | no disponible | GGUF | Cuantización comunitaria, sin documentación |
| LFM3-1.7B-Heretic-Max (base) | 1.7B | no disponible | no disponible | safetensors (presumiblemente) | Modelo original de MihaiPopa-1 |
| LFM3-1.7B (oficial de Liquid AI) | 1.7B | no disponible | no disponible | no disponible | Modelo base de la familia LFM3 |
| Otros GGUF de ~1.7B (p. ej. Qwen2.5-1.5B-Instruct-GGUF) | 1.5B | 32K (Qwen2.5) | Apache 2.0 (Qwen2.5) | GGUF | Alternativa documentada y con licencia clara |

La comparativa es limitada porque el repositorio no publica especificaciones del modelo base. Se recomienda consultar la documentación oficial de Liquid AI y el repositorio de MihaiPopa-1 para una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de model card: no se declaran licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Inconsistencia en los metadatos: el campo "parámetros totales" indica 899.013, cifra incompatible con un modelo de 1.7B; podría tratarse de un error de conversión o de un recuento parcial. No debe tomarse como especificación fiable.
- Riesgo de alucinación: inherente a los modelos de 1.7B, especialmente en cuantizaciones de baja precisión (Q2, IQ1, IQ2).
- Degradación por cuantización: las variantes IQ1_S, IQ2_XXS y Q2_K pueden producir respuestas incoherentes o repetitivas; se recomienda Q4_K_M o superior para uso práctico.
- Variante "Heretic": la reducción de rechazos puede aumentar la probabilidad de contenido sesgado, ofensivo o inseguro; no se ha documentado ningún proceso de mitigación.
- Restricciones de licencia: al no declararse licencia, no se puede garantizar el uso comercial; se debe contactar con el autor o consultar el modelo base antes de cualquier despliegue productivo.
- Idiomas: se desconoce si el modelo soporta castellano con calidad suficiente; no hay evaluación publicada.
- Fecha de creación futura (2026-11-09): el repositorio presenta una fecha anómala, lo que sugiere posibles inconsistencias en los metadatos o un error de publicación.
- Sin soporte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Max-i1-GGUF
- Modelo base de la cuantización: https://huggingface.co/MihaiPopa-1/LFM3-1.7B-Heretic-Max
- Familia LFM3 de Liquid AI (referencia general, no verificada en esta búsqueda): no disponible
