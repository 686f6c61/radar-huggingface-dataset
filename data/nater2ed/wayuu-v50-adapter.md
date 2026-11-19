# nater2ed/wayuu-v50-adapter

## Resumen

Wayuu-v50-adapter es un adaptador LoRA publicado por el usuario nater2ed sobre el modelo de traducción automática facebook/nllb-200-distilled-1.3B. Se distribuye como un repositorio PEFT de 0,4 GB en formato safetensors y está pensado para su carga mediante la librería `peft` junto con `transformers`. El nombre sugiere un ajuste orientado a la lengua wayuunaiki (wayuu), aunque la model card no confirma explícitamente el par de idiomas ni el corpus empleado.

El modelo base, NLLB-200-distilled-1.3B, es un transformer encoder-decoder de traducción multilingüe desarrollado por Meta dentro del proyecto No Language Left Behind, con 1.300 millones de parámetros y cobertura declarada de 200 idiomas. El adaptador no modifica los pesos del modelo base: añade matrices de bajo rango entrenadas con LoRA, de modo que el coste de almacenamiento y de inferencia adicional es mínimo.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación sin métricas publicadas, sin licencia declarada y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de ajuste paramétricamente eficiente sobre NLLB para lenguas de bajos recursos, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer encoder-decoder NLLB-200 distilled |
| Parametros totales | no disponible (adaptador de 0,4 GB; el modelo base tiene 1,3 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base NLLB-200 usa segmentos de hasta 512 tokens) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite fp32, fp16, bf16 e int8 mediante bitsandbytes |
| Idiomas soportados | no disponible en la model card; el modelo base declara 200 idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA (Low-Rank Adaptation) sobre el checkpoint facebook/nllb-200-distilled-1.3B. NLLB-200 es un transformer encoder-decoder con atención multi-cabeza estándar, entrenado originalmente por Meta con datos paralelos multilingües y técnicas de destilación para reducir el tamaño frente a la variante de 54.000 millones de parámetros. La adaptación LoRA congela los pesos base e inserta matrices de baja dimensión en las proyecciones de atención, lo que permite ajustar el modelo a un dominio o lengua concreta con un coste de entrenamiento muy inferior al fine-tuning completo.

La model card no documenta ningún detalle del entrenamiento: no se especifican el número de tokens, la composición del corpus, el rango de LoRA, el alfa, la tasa de aprendizaje ni si se aplicaron técnicas de RLHF o DPO. La única referencia técnica es el artículo arXiv:1910.09700, que corresponde al calculador de impacto medioambiental de Lacoste et al. y no al entrenamiento del modelo. Tampoco se indica la herramienta de entrenamiento, aunque la etiqueta `unsloth` sugiere que se utilizó ese framework para el ajuste.

## Capacidades

- Traducción automática entre el par de idiomas cubierto por el adaptador (presumiblemente español-wayuunaiki o similar, no confirmado).
- Generación de texto condicionada a la tarea de traducción, heredada del modelo base NLLB-200.
- Soporte multilingüe potencial a través de los 200 idiomas del modelo base, aunque el adaptador puede degradar el rendimiento en idiomas no vistos durante su entrenamiento.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento.
- No se documenta comportamiento agéntico ni multi-step reasoning.

## Casos de uso

- Traducción de documentación técnica al wayuunaiki: el adaptador puede integrarse en un pipeline de `transformers` para traducir manuales y guías comunitarias, aprovechando el conocimiento multilingüe del modelo base NLLB.
- Localización de interfaces de usuario: útil para equipos que necesiten versiones en lenguas indígenas de aplicaciones móviles o webs, con la salvedad de que requiere validación humana por la ausencia de métricas.
- Investigación en lenguas de bajos recursos: sirve como punto de partida para experimentos de adaptación paramétricamente eficiente sobre NLLB, comparando distintas configuraciones de LoRA.
- Preservación lingüística: puede emplearse en proyectos de digitalización de textos wayuu, traduciendo corpus escritos para alimentar archivos lingüísticos.
- Generación de subtítulos multilingües: el modelo base permite traducir transcripciones, y el adaptador puede especializar la salida hacia la lengua objetivo.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador de 0,4 GB sobre un modelo de 1,3 B, cabe en GPUs de consumo y permite iterar sin grandes infraestructuras.
- Evaluación comparativa de adaptadores LoRA: útil como caso de estudio en artículos o docencia sobre PEFT y traducción automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,3 B ocupa aproximadamente 2,6 GB en fp16 y unos 5,2 GB en fp32; el adaptador añade menos de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); para fp32 se recomienda 12 GB o más (RTX 3080 Ti, A10).
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más, incluyendo RTX 3060, RTX 4060 Ti y RTX 4090.
- Opciones de despliegue: `transformers` + `peft` para carga del adaptador; `vLLM` y `TGI` no soportan de forma nativa adaptadores PEFT de NLLB en el momento de la consulta; `llama.cpp` y `Ollama` no aplican porque el modelo base no está en formato GGUF.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de los segmentos (NLLB trabaja con segmentos de hasta 512 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nater2ed/wayuu-v50-adapter | Adaptador LoRA sobre 1,3 B | no disponible | no disponible | Hugging Face, 0 descargas |
| facebook/nllb-200-distilled-1.3B | 1,3 B | 512 tokens | CC-BY-NC 4.0 | Hugging Face, ampliamente usado |
| Helsinki-NLP/opus-mt-es-wayuu | no disponible | 512 tokens | CC-BY 4.0 (habitual en OPUS-MT) | Hugging Face |
| facebook/m2m100_418M | 418 M | 1024 tokens | MIT | Hugging Face |

La comparativa es orientativa: no se dispone de métricas del adaptador que permitan establecer una comparación cuantitativa con las alternativas. El modelo base NLLB-200 distilled 1.3B es la referencia directa, y los modelos OPUS-MT y M2M100 son alternativas habituales para traducción de lenguas de bajos recursos.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay BLEU, chrF ni evaluaciones humanas publicadas, por lo que se desconoce la calidad real de la traducción.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; el modelo base NLLB-200 se distribuye bajo CC-BY-NC 4.0, lo que ya restringe el uso comercial.
- Model card incompleta: la mayoría de secciones contienen marcadores `[More Information Needed]`, incluida la descripción del modelo, los datos de entrenamiento y las limitaciones.
- Riesgo de alucinación y de traducciones incorrectas, especialmente en terminología técnica o en variantes dialectales del wayuunaiki.
- Posible olvido catastrófico parcial: el ajuste LoRA puede degradar el rendimiento del modelo base en idiomas distintos al objetivo.
- Sin soporte documentado de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran esas capacidades.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-19) en los metadatos, lo que sugiere que el repositorio puede ser un artefacto de prueba o estar mal fechado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nater2ed/wayuu-v50-adapter
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Artículo NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Artículo LoRA: https://arxiv.org/abs/2106.09685
- Referencia citada en la model card: https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Framework Unsloth: https://github.com/unslothai/unsloth
