# huggingface12341/zsm-d2

## Resumen

zsm-d2 es un modelo de extracción de características (feature extraction) publicado en Hugging Face por el usuario huggingface12341. Se trata de un modelo resultante de una fusión (merge) de dos modelos base: joamCriff123/zils-mini-m1121t y MachinePulseAI/karpo-decision-4B, lo que lo sitúa en la categoría de los llamados "decision models" dentro del ecosistema de la familia Qwen 3.5, según indican sus etiquetas. Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones), se posiciona en el rango de modelos medianos aptos para despliegue en hardware de gama alta de consumo.

El modelo está publicado bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos. El repositorio ocupa 9,1 GB en formato safetensors y emplea la librería transformers con código personalizado (custom_code), lo que implica que su carga requiere confiar en la implementación incluida en el repositorio.

La relevancia de este modelo es limitada por el momento: no cuenta con descargas ni interacciones, no se han publicado resultados de benchmarks y la información sobre idiomas, contexto o datos de entrenamiento no está disponible en la ficha de Hugging Face. Debe tratarse, por tanto, como un artefacto experimental o de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia qwen3_5, según tags); detalles no disponibles |
| Parametros totales | 4.539.265.536 (~4,5 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Acceso | restringido (gated) |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de un modelo de la familia qwen3_5 según las etiquetas del repositorio, construido mediante la fusión de dos modelos base: joamCriff123/zils-mini-m1121t y MachinePulseAI/karpo-decision-4B. No se especifica la técnica de merge empleada (por ejemplo, SLERP, TIES, DARE o model stock), ni la proporción de pesos de cada modelo base, ni si hubo etapas posteriores de ajuste fino.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La etiqueta "decision-model" sugiere un uso orientado a la toma de decisiones o clasificación, pero no se aporta ninguna descripción técnica que lo confirme. El uso de custom_code en transformers implica que la arquitectura puede incluir modificaciones no estándar, cuyo detalle no está disponible.

## Capacidades

- Extracción de características (feature extraction): es el pipeline declarado del modelo.
- Posible uso como modelo de decisión ("decision-model" según tags), sin documentación que lo detalle.
- Capacidades de generación de texto, razonamiento, código o matemáticas: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: dado que el pipeline declarado es feature-extraction, el modelo podría emplearse para generar representaciones vectoriales de textos y alimentar índices de recuperación, siempre que se valide empíricamente la calidad de los embeddings.
- Clasificación y enrutamiento de decisiones: la etiqueta "decision-model" apunta a un posible uso en sistemas de enrutamiento o clasificación, aunque no hay documentación que describa el formato de salida esperado.
- Experimentación en investigación sobre fusiones de modelos: el modelo es útil como objeto de estudio para analizar el efecto de merges entre modelos de ~4B parámetros.
- Prototipado de pipelines de NLP: al ser un modelo de 4,5 B en safetensors, puede integrarse en prototipos con transformers para tareas de representación de texto.
- Evaluación comparativa de modelos base frente a modelos fusionados: permite estudiar si la fusión mejora o degrada las capacidades de los modelos de origen.
- Filtrado o scoring de contenido en pipelines internos: si se confirma su utilidad como modelo de decisión, podría puntuar candidatos en sistemas de recomendación o moderación, previa validación.

En todos los casos, la ausencia de benchmarks y de documentación exige una evaluación propia antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9-10 GB solo para los pesos, más overhead de activaciones y del runtime (aproximadamente 11-13 GB en total).
- VRAM estimada en cuantización de 8 bits: unos 5-6 GB para pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: unos 3-4 GB para pesos, con overhead adicional; no se distribuyen pesos GGUF oficiales, por lo que habría que generarlos.
- GPU recomendadas: A100 40 GB, H100, L40S para despliegue en FP16 con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en FP16.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, en cuantización de 4 bits, potencialmente en GPUs de 8 GB, aunque sin garantías al no existir pesos cuantizados oficiales.
- Opciones de despliegue: transformers (requerido por custom_code), potencialmente vLLM o TGI si la implementación personalizada es compatible; llama.cpp u Ollama solo si se generan pesos GGUF propios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks |
|---|---|---|---|---|---|
| zsm-d2 | ~4,5 B | no disponible | Apache 2.0 | gated | no disponibles |
| Qwen2.5-3B / Qwen3-4B (referencia de familia) | 3-4 B | 32K-128K según variante | Apache 2.0 | abierto | publicados por el desarrollador |
| Llama 3.2 3B | 3,2 B | 128K | Llama 3.2 Community License | abierto con condiciones | publicados por el desarrollador |
| Phi-3.5-mini | 3,8 B | 128K | MIT | abierto | publicados por el desarrollador |

La comparación es orientativa: zsm-d2 no documenta contexto, idiomas ni rendimiento, por lo que no puede establecerse una equivalencia funcional con los modelos citados. Los datos de los modelos de referencia corresponden a sus fichas oficiales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre su calidad en ninguna tarea.
- Documentación mínima: se desconoce la arquitectura exacta, el contexto, los idiomas y los datos de entrenamiento.
- Riesgo de alucinación: no evaluado; al ser un merge sin ajuste documentado, el comportamiento puede ser impredecible.
- Sesgos: no documentados; los sesgos de los modelos base se heredan sin que se hayan publicado análisis.
- Licencia Apache 2.0: permite uso comercial, pero el acceso gated exige aceptar condiciones adicionales en Hugging Face que pueden imponer restricciones propias.
- custom_code: la carga del modelo requiere ejecutar código del repositorio, lo que introduce un riesgo de seguridad en entornos de producción.
- Modelo sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.
- No apto para producción sin evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsm-d2
- Modelo base 1: https://huggingface.co/joamCriff123/zils-mini-m1121t
- Modelo base 2: https://huggingface.co/MachinePulseAI/karpo-decision-4B

No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
