# huggingface12341/zsm-h21

## Resumen

zsm-h21 es un modelo de extracción de características (feature-extraction) publicado en Hugging Face por el usuario huggingface12341. Se trata de un merge de tres modelos base: vllm-sr/d3-mini, jmc0/Rein-NPC-4B y jylin001206/SII-Decision-4B-LoRA, todos ellos orientados a la toma de decisiones y a la simulación de comportamiento en entornos interactivos. El resultado es un checkpoint de aproximadamente 4.540 millones de parámetros alojado en safetensors, con un repositorio de 9,1 GB.

El modelo se distribuye con licencia Apache 2.0, pero el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo. La ficha técnica no documenta idiomas soportados ni resultados de benchmarks, y el repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de una publicación muy reciente y sin validación comunitaria.

Su relevancia es limitada y experimental: el pipeline declarado es feature-extraction, no generación de texto, y las etiquetas incluyen `custom_code`, lo que implica que la carga requiere confiar en código personalizado del repositorio. Es un artefacto interesante para investigar técnicas de model merging aplicadas a modelos de decisión de 4B, pero no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, segun tag); detalles no disponibles |
| Parametros totales | 4.539.265.536 (aprox. 4,54B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelos base | vllm-sr/d3-mini, jmc0/Rein-NPC-4B, jylin001206/SII-Decision-4B-LoRA |
| Tamano del repo | 9,1 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo es un merge de tres checkpoints de aproximadamente 4B parámetros cada uno: vllm-sr/d3-mini, jmc0/Rein-NPC-4B y jylin001206/SII-Decision-4B-LoRA. El tag `qwen3_5` sugiere que la arquitectura subyacente pertenece a la familia Qwen 3.5, es decir, un transformer decoder-only con atención estándar, aunque no se documentan la dimensión oculta, el número de capas ni la configuración de cabezas de atención. El tag `decision-model` y los nombres de los modelos base apuntan a que los checkpoints originales fueron entrenados para tareas de decisión y comportamiento de NPC (personajes no jugadores), probablemente mediante fine-tuning supervisado y, en el caso de Rein-NPC-4B, con refuerzo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el merge final. La técnica de fusión empleada tampoco se detalla: podría ser un merge lineal de pesos, un SLERP o un TIES, pero el repositorio no lo especifica. El tag `custom_code` indica que el modelo incluye código Python propio en el repositorio, lo que puede afectar a la reproducibilidad y a la seguridad de la carga. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado, orientado a generar embeddings o representaciones internas a partir de texto.
- Toma de decisiones: heredada de los modelos base, orientada a seleccionar acciones en entornos simulados o interactivos.
- Comportamiento de NPC: el modelo base Rein-NPC-4B sugiere capacidad para generar decisiones coherentes en personajes no jugadores de videojuegos.
- Soporte de tool calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en model merging: el modelo sirve como caso de estudio para analizar cómo se comporta la fusión de tres checkpoints de 4B orientados a decisión; se usaría cargando los pesos con transformers y comparando embeddings frente a cada modelo base.
- Extracción de embeddings para clasificación de intenciones: al ser un modelo de feature-extraction, puede emplearse para generar representaciones vectoriales de frases y alimentar un clasificador ligero en tareas de enrutamiento.
- Simulación de decisiones en entornos de juego: hereda la orientación de Rein-NPC-4B, por lo que podría integrarse en un motor de juego para seleccionar acciones de NPC, siempre que se valide su coherencia.
- Prototipado de sistemas de decisión: útil en laboratorio para experimentar con políticas de decisión antes de entrenar un modelo propio desde cero.
- Evaluación comparativa de merges: sirve para medir si la fusión degrada o mejora las capacidades de los modelos originales en tareas de decisión.
- Docencia y experimentación: por su tamaño de 4,5B y licencia Apache 2.0, es manejable en un laboratorio con una GPU de 24 GB en precisión reducida para estudiar técnicas de fusión de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 9 GB de pesos más overhead, unos 10-11 GB; en int8, unos 5 GB; en int4, unos 3 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: A100 40 GB o H100 para fp16 sin cuantizar con margen; RTX 4090 (24 GB) para fp16 o int8; RTX 3090 (24 GB) para fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización int4, en tarjetas de 8 GB como la RTX 3070.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp u Ollama no están confirmados y requerirían conversión, ya que el repositorio solo incluye safetensors y código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| zsm-h21 | 4,54B | no disponible | Apache 2.0 | Gated | Merge de tres modelos de decisión |
| jmc0/Rein-NPC-4B | ~4B | no disponible | no disponible | no disponible | Modelo base orientado a NPC |
| jylin001206/SII-Decision-4B-LoRA | ~4B | no disponible | no disponible | no disponible | Modelo base con adaptador LoRA de decisión |
| vllm-sr/d3-mini | no disponible | no disponible | no disponible | no disponible | Modelo base del merge |

No se dispone de datos de rendimiento de ninguno de los modelos comparados, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede retrasar o impedir su uso automatizado en pipelines.
- Código personalizado: el tag `custom_code` implica ejecutar código del repositorio al cargar el modelo, con el riesgo de seguridad que ello conlleva.
- Sin validación comunitaria: cero descargas y cero likes; no hay evidencia de que el merge funcione correctamente.
- Sin benchmarks: no hay datos que permitan estimar su calidad frente a los modelos base.
- Idiomas no documentados: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- Riesgo de alucinación: inherente a los modelos de 4B sin datos de evaluación publicados.
- Sesgos: desconocidos, al no documentarse la composición del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de modelos base cuya licencia individual no se detalla, conviene verificar la compatibilidad de cada uno antes de explotarlo en producción.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin medir previamente la ventana efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsm-h21
- Modelo base Rein-NPC-4B: https://huggingface.co/jmc0/Rein-NPC-4B
- Modelo base SII-Decision-4B-LoRA: https://huggingface.co/jylin001206/SII-Decision-4B-LoRA
- Modelo base d3-mini: https://huggingface.co/vllm-sr/d3-mini
