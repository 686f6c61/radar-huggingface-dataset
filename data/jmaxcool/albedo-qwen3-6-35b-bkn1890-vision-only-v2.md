# JMaxCool/albedo-qwen3.6-35b-bkn1890-vision-only-v2

## Resumen

El modelo `JMaxCool/albedo-qwen3.6-35b-bkn1890-vision-only-v2` es un derivado de la familia Qwen 3.6, concretamente una variante MoE de 35 mil millones de parámetros publicada por el usuario JMaxCool en septiembre de 2026. Se basa en el checkpoint `BKN1890/albedo-qwen3.6-35b-20260901-1748` y ha sido sometido a un proceso de "scrubbing" (poda) selectiva de tensores relacionados con la visión, eliminando 63 de los 1045 tensores totales. El perfil indicado en la model card es `vision-only`, lo que sugiere que la modificación afecta exclusivamente a los componentes visuales del modelo, aunque no se especifica si el resultado final conserva o elimina la capacidad multimodal.

La relevancia de este modelo radica en su carácter experimental: forma parte de una serie de "scrub candidates" dentro del proyecto Albedo SN97, que parece explorar técnicas de poda y ajuste fino de modelos MoE de gran tamaño. Con 35.951.822.704 parámetros y un tamaño de repositorio de 71,9 GB (probablemente en BF16), es un modelo pesado que requiere hardware de gama alta para su inferencia. Sin embargo, al tratarse de una arquitectura MoE (etiquetada como `qwen3_5_moe`), solo una fracción de los parámetros se activa por token, lo que podría reducir los requisitos de cómputo en comparación con un modelo denso de igual tamaño.

La documentación disponible es mínima: no hay model card detallada, licencia, idiomas soportados ni benchmarks publicados. El fingerprint esperado frente al checkpoint base es de 0,939713, lo que indica una alta similitud con el original, consistente con una modificación quirúrgica sobre los pesos visuales. Este modelo parece estar orientado a la investigación y experimentación, más que a un despliegue productivo inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), basada en Qwen 3.6 (tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio con pesos en BF16 según tamaño de archivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Qwen 3.6 (etiquetada como `qwen3_5_moe`), que combina un transformer con capas de mezcla de expertos para activar solo una subred de parámetros por token. El checkpoint base es `BKN1890/albedo-qwen3.6-35b-20260901-1748`, del cual se ha derivado este modelo mediante un proceso de "scrubbing" (poda) de tensores específicos. Según la model card, se eliminaron 63 de 1045 tensores, todos ellos pertenecientes al módulo visual (`model.visual.*`), utilizando una selección dependiente de la semilla (seed 84177) y con un delta-scale de 1. El fingerprint esperado frente al base es 0,939713, lo que indica que la modificación es relativamente pequeña y localizada.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La etiqueta `region:us` sugiere una restricción geográfica de acceso, posiblemente por motivos de licencia o cumplimiento. El proceso de poda parece ser una técnica experimental para evaluar el impacto de eliminar componentes visuales en un modelo multimodal, aunque no se especifica si el modelo final conserva alguna capacidad de visión o si se convierte en un modelo exclusivamente de texto.

## Capacidades

- Generación de texto: al estar basado en Qwen 3.6, se espera que herede capacidades de generación de lenguaje, razonamiento y código, aunque no se ha verificado de forma independiente.
- Capacidades de visión: el nombre "vision-only" y el perfil `model.visual.*` sugieren que se ha intervenido específicamente sobre los pesos de visión, pero no queda claro si el modelo final conserva, reduce o elimina la capacidad multimodal. Sin información adicional, no se puede afirmar que el modelo sea capaz de procesar imágenes.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible (el modelo base Qwen 3.6 suele ser multilingüe, pero no se confirma para este derivado).

## Casos de uso

Al no disponer de documentación funcional ni ejemplos de uso, los casos de uso son hipotéticos y deben tomarse con cautela:

- Investigación sobre poda de modelos multimodales: el modelo sirve como banco de pruebas para estudiar cómo la eliminación selectiva de tensores visuales afecta al rendimiento general. Un investigador podría comparar este checkpoint con el base para medir el impacto en tareas de lenguaje y visión.
- Experimentación con arquitecturas MoE: dado que es un MoE de 35B, puede utilizarse para estudiar el comportamiento de la mezcla de expertos tras una modificación quirúrgica de pesos.
- Fine-tuning posterior: si se confirma que el modelo mantiene capacidades de lenguaje, podría servir como punto de partida para ajuste fino en tareas específicas de texto, aprovechando su tamaño y arquitectura.
- Evaluación de robustez: el fingerprint de 0,939713 indica una alta similitud con el base, por lo que podría usarse para probar si pequeños cambios en pesos visuales introducen inestabilidad o alucinaciones.
- Despliegue en entornos con restricciones de región: el tag `region:us` sugiere que el modelo está pensado para uso en Estados Unidos, lo que podría ser relevante para proyectos con requisitos de residencia de datos.
- Benchmarking de eficiencia MoE: al ser un MoE, se puede medir el throughput y la latencia en comparación con modelos densos del mismo tamaño, aunque se requiere hardware adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El único dato cuantitativo es el fingerprint esperado de 0,939713 frente al checkpoint base, que no es un benchmark de rendimiento sino una medida de similitud de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,95 B parámetros y pesos en BF16 (71,9 GB de repositorio), se necesitan aproximadamente 72 GB de VRAM para cargar el modelo completo sin cuantización. Con cuantización a 8 bits se reduciría a unos 36 GB, y a 4 bits a unos 18 GB, aunque no se han publicado archivos cuantizados en el repositorio.
- GPU recomendadas: para inferencia en BF16 se requiere una GPU con al menos 80 GB de VRAM, como una A100 (80 GB) o H100 (80 GB). Con cuantización 8 bits cabría en una RTX 4090 (24 GB) o similar, pero no hay confirmación de que los pesos estén preparados para ello.
- Si cabe en consumer GPU: no de forma directa con los pesos BF16; se necesitaría cuantización adicional o usar técnicas de offloading a CPU.
- Opciones de despliegue: al ser un modelo safetensors sin cuantizaciones oficiales, se podría usar vLLM o TGI si se dispone de suficiente VRAM, o llama.cpp con conversión previa a GGUF (no proporcionada). No se ha probado en estos entornos.
- Latencia y throughput: no disponible. Al ser un MoE, la latencia por token dependerá del número de expertos activos, pero no se conocen esos detalles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen 3.6 35B MoE (del que deriva) es el punto de referencia más cercano, pero no se conocen sus métricas exactas en este contexto. Otros modelos MoE de tamaño similar como DeepSeek-V3 o Mixtral 8x22B podrían ser comparables en filosofía, pero sin datos de rendimiento no es posible realizar una comparación objetiva. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no hay información, pero al derivar de Qwen 3.6, es probable que herede los sesgos del modelo base, que no se han documentado para este derivado.
- Riesgo de alucinación: sin benchmarks ni pruebas, no se puede evaluar la fiabilidad factual del modelo. La poda de tensores visuales podría afectar a la coherencia general si el modelo dependía de la información visual para ciertas tareas.
- Limitaciones de contexto o idioma: desconocidas. El tag `region:us` sugiere una restricción geográfica de acceso, posiblemente por licencia o cumplimiento.
- Restricciones de licencia: la licencia aparece como "no disponible" en HuggingFace, lo que impide determinar si el uso comercial está permitido. Se recomienda contactar al autor antes de cualquier uso productivo.
- Caveat para producción: este modelo es un "scrub candidate" experimental, sin documentación ni soporte. No es recomendable para entornos de producción sin una evaluación exhaustiva previa.
- Integridad del modelo: el proceso de poda eliminó 63 tensores de visión; si el modelo se utiliza para tareas que requieren entrada visual, es probable que falle o produzca resultados incorrectos.

## Enlaces

- [HuggingFace - JMaxCool/albedo-qwen3.6-35b-bkn1890-vision-only-v2](https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-bkn1890-vision-only-v2)
- [HuggingFace - JMaxCool/albedo-qwen3.6-35b-pilot-cycle-01](https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-pilot-cycle-01) (modelo relacionado)
- [HuggingFace - BKN1890/albedo-qwen3.6-35b-20260824-145017](https://huggingface.co/BKN1890/albedo-qwen3.6-35b-20260824-145017) (checkpoint base relacionado)
- [Guía de ejecución local de Qwen 3.6 35B MoE](https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/) (referencia general sobre el modelo base)
