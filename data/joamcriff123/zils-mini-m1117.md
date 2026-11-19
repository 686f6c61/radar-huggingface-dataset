# joamCriff123/zils-mini-m1117

## Resumen

zils-mini-m1117 es un modelo de la familia Qwen3.5-4B publicado por el usuario joamCriff123 en Hugging Face. Se presenta como un "cuerpo de decisión d3-mini" para el pool mini de la subred Zils 127, lo que sugiere que no es un modelo de propósito general, sino un componente especializado dentro de un sistema mayor de toma de decisiones. El pipeline declarado es `feature-extraction` y el repositorio incluye código personalizado (`custom_code`), lo que implica que su uso requiere cargar módulos propios del autor más allá de la clase estándar de transformers.

El modelo cuenta con 4.539.265.536 parámetros reales según los pesos en safetensors y un repositorio de 9,1 GB, coherente con un modelo de aproximadamente 4B en precisión de 16 bits. Está construido sobre Qwen/Qwen3.5-4B mediante fine-tuning y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial siempre que se respeten las atribuciones del modelo base.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card apenas contiene una descripción de una línea, no se declaran idiomas soportados y no hay datos de benchmarks. Se trata, por tanto, de un artefacto experimental o de nicho dentro del ecosistema Zils, útil para quien participe en esa subred, pero sin información pública suficiente para evaluar su calidad de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que el modelo deriva de Qwen/Qwen3.5-4B mediante fine-tuning y que se etiqueta como "decision-model" dentro del ecosistema Zils (subred 127, pool mini, variante d3-mini). El repositorio incluye `custom_code`, lo que indica que la arquitectura de inferencia no es la estándar de Qwen y que el autor ha añadido módulos propios, presumiblemente relacionados con la lógica de decisión del pool.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas. Los resultados de búsqueda mencionan, para modelos hermanos de la misma serie (zils-mini-sx3), un proceso de LoRA fine-tuning sobre una mezcla de modelos Apache-2.0 y datos de exámenes en formato específico, pero esa información corresponde a otro checkpoint y no debe extrapolarse a m1117 sin confirmación.

## Capacidades

- Extracción de features: pipeline declarado en Hugging Face (`feature-extraction`), orientado a producir representaciones o puntuaciones internas más que texto libre.
- Toma de decisiones: etiquetado como `decision-model` y `d3-mini`, pensado para el pool mini de la subred Zils 127.
- Código personalizado: requiere cargar módulos propios del autor (`custom_code`), lo que condiciona el flujo de inferencia.
- Generación de texto: no confirmada explícitamente en la documentación; al derivar de Qwen3.5-4B es plausible, pero no está garantizado por la model card.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Participación en la subred Zils 127: el modelo está diseñado como cuerpo de decisión del pool mini, por lo que su uso principal es responder a las tareas o exámenes que plantea esa subred y producir las decisiones esperadas por el protocolo.
- Evaluación comparativa de checkpoints Zils: al existir variantes hermanas (m1114, sx3), permite comparar el comportamiento de distintos cuerpos de decisión sobre el mismo conjunto de pruebas.
- Investigación sobre modelos de decisión especializados: útil para estudiar cómo un fine-tuning sobre un base de 4B puede reorientarse hacia tareas de clasificación o selección en lugar de generación abierta.
- Integración como extractor de features: el pipeline `feature-extraction` permite obtener representaciones vectoriales para sistemas de ranking o filtrado, siempre que se cargue el `custom_code` asociado.
- Reproducción de experimentos del autor: el repositorio incluye LICENSE y NOTICE con atribuciones upstream, lo que facilita auditar la procedencia de los pesos en un contexto de investigación.
- Base para fine-tuning posterior: al ser Apache-2.0 y derivar de Qwen3.5-4B, puede servir como punto de partida para ajustes adicionales en proyectos que ya trabajen con esa familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 9 GB solo para pesos, más overhead de activaciones y del `custom_code`; se recomienda al menos 12-16 GB para margen.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para fp16; RTX 3090/4080 con 16 GB o más para fp16 con batch pequeño.
- GPU de consumo: cabe en RTX 4090 (24 GB) y previsiblemente en RTX 4080 (16 GB) en fp16 con batch reducido; en 8 bits podría caber en GPUs de 8-12 GB, pero sin garantía al no haber cuantizaciones publicadas.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están confirmados y podrían no funcionar por el `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-m1117 | 4,54B | no disponible | Apache-2.0 | Decision model para Zils subnet 127; requiere custom_code |
| zils-mini-m1114 | ~5B (según búsqueda) | no disponible | no disponible | Variante hermana de la misma serie |
| zils-mini-sx3 | no disponible | no disponible | Apache-2.0 (según búsqueda) | Construido por LoRA sobre una mezcla de modelos Zils |
| Qwen/Qwen3.5-4B | ~4B | no disponible | no disponible | Modelo base del que deriva m1117 |

La comparación se limita a la serie Zils y al modelo base, ya que no hay datos públicos de rendimiento que permitan contrastarlo con alternativas de propósito general del mismo tamaño.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide validar su calidad de forma independiente.
- Riesgo de alucinación: desconocido, pero al ser un modelo de decisión sin benchmarks publicados no hay evidencia de robustez.
- Sesgos: no documentados; al derivar de Qwen3.5-4B podría heredar sesgos del base, sin que el autor los haya analizado.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y revisarlo antes de usarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones del modelo base y las indicadas en LICENSE y NOTICE.
- Idiomas: no se declaran, por lo que no se puede asumir soporte multilingüe.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día, lo que sugiere un artefacto recién publicado y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1117
- Variante hermana: https://huggingface.co/joamCriff123/zils-mini-m1114
- Variante hermana: https://huggingface.co/joamCriff123/zils-mini-sx3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
