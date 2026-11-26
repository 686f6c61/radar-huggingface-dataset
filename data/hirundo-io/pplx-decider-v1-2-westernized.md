# hirundo-io/pplx-decider-v1.2-westernized

## Resumen

pplx-decider-v1.2-westernized es un modelo derivado de perplexity-ai/pplx-decider-v1.2, publicado por hirundo-io. Se presenta como un modelo de decisión (decision-model) orientado a clasificación de texto, con un ajuste declarado de "westernización" y mitigación de sesgos. El modelo base pertenece a la familia de arquitectura etiquetada como qwen3_5 en Hugging Face, lo que sugiere una base tipo transformer denso de la familia Qwen.

El interés de esta ficha radica en que ilustra un patrón creciente: modelos de decisión especializados que se derivan de un LLM grande mediante merges o ajustes finos para tareas de enrutamiento, clasificación o arbitraje entre opciones. En este caso, el autor declara explícitamente una intervención sobre sesgos culturales ("westernized"), lo que conviene tratar con cautela hasta disponer de documentación técnica que describa la metodología.

La información publicada es muy escasa: no hay model card sustantiva, no hay idiomas declarados, no hay benchmarks y el acceso está restringido (gated). Con 26.085.330.160 parámetros en safetensors y un repositorio de 52,2 GB, el modelo es grande para ser un clasificador, lo que apunta a que se reutiliza la totalidad de los pesos del modelo base en lugar de una cabeza ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag de Hugging Face); detalles no disponibles |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá del tag qwen3_5 asociado al modelo base. Por el número de parámetros (26,1 mil millones) y la nomenclatura, es plausible que se trate de un transformer denso de la familia Qwen, pero no hay confirmación oficial en la información disponible. Tampoco se detalla si emplea atención lineal, decodificación especulativa u otras optimizaciones.

Respecto al entrenamiento, el autor indica que el modelo es un merge o derivado de perplexity-ai/pplx-decider-v1.2, con un ajuste orientado a "westernización" y mitigación de sesgos. No se especifican volúmenes de tokens, composición del dataset, ni si hubo RLHF, DPO o alguna técnica de alineación. Tampoco se describe la metodología concreta del ajuste cultural, lo que impide evaluar su alcance y posibles efectos secundarios.

## Capacidades

- Clasificación de texto: es la tarea declarada en el pipeline de Hugging Face (text-classification).
- Modelo de decisión: por su nombre y tags, está pensado para tareas de arbitraje o selección entre opciones, aunque no se documenta el formato de entrada/salida.
- Mitigación de sesgos: el autor declara un ajuste de "westernización" orientado a reducir sesgos culturales, sin especificar métricas ni metodología.
- Generación de texto: no confirmada explícitamente; al derivar de un LLM grande es posible, pero no está documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de contenido en pipelines de moderación: el modelo puede emplearse como clasificador de categorías sobre textos entrantes, integrándose en un servicio REST que devuelva etiquetas. Su tamaño (26B) exige infraestructura dedicada, por lo que es adecuado cuando la precisión prima sobre el coste por petición.
- Enrutamiento de consultas en sistemas RAG: usar el modelo como "decider" para elegir entre recuperadores, herramientas o rutas de respuesta, aprovechando su naturaleza de decision-model.
- Arbitraje entre respuestas de varios LLM: en un pipeline de ensemble, el modelo puede puntuar o seleccionar la mejor respuesta candidata antes de devolverla al usuario.
- Evaluación automática de calidad de textos generados: clasificar salidas como aceptables o no aceptables en un proceso de control de calidad, con revisión humana posterior.
- Filtrado de sesgos en datasets: aplicar el modelo para detectar y etiquetar contenido con sesgos culturales antes de entrenar otros modelos, dado su ajuste declarado de mitigación.
- Investigación sobre alineación cultural: usar el modelo como objeto de estudio para analizar cómo un ajuste "westernized" altera las decisiones de un clasificador base, comparando contra perplexity-ai/pplx-decider-v1.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para operar con comodidad.
- VRAM estimada en cuantización de 8 bits: en torno a 26-30 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: en torno a 13-16 GB, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 para 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-8 bits, aunque no se publican pesos GGUF oficiales.
- Opciones de despliegue: vLLM y TGI para safetensors en FP16/BF16; llama.cpp u Ollama requerirían conversión a GGUF, no disponible oficialmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| hirundo-io/pplx-decider-v1.2-westernized | 26,1B | no disponible | Clasificación / decisión | apache-2.0 | Gated |
| perplexity-ai/pplx-decider-v1.2 (base) | no disponible en esta ficha | no disponible | Decisión | no disponible | no disponible |
| Alternativas de clasificación de 20-30B | no disponible | no disponible | Clasificación | variable | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: no hay model card sustantiva, ni idiomas declarados, ni formato de entrada/salida documentado; esto dificulta su adopción en producción.
- Riesgo de alucinación: al derivar de un LLM grande, si se usa en modo generativo podría producir contenido no verificado; su uso declarado es clasificación, donde el riesgo es menor pero no nulo.
- Sesgos: el ajuste "westernized" introduce deliberadamente una orientación cultural; esto puede sesgar las decisiones hacia perspectivas occidentales y debe evaluarse antes de usarlo en contextos multiculturales.
- Idiomas: no se declaran idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado fuera del inglés.
- Licencia: apache-2.0 permite uso comercial, pero el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face; conviene revisar los términos del modelo base, ya que un derivado no puede relajar restricciones del original.
- Sin benchmarks: no hay evidencia pública de rendimiento frente al modelo base ni frente a alternativas.
- Tamaño elevado para una tarea de clasificación: 26B parámetros implican costes de inferencia considerables; evaluar si un clasificador más pequeño cumple los requisitos.
- Repositorio de 52,2 GB: requiere almacenamiento y ancho de banda significativos para descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/pplx-decider-v1.2-westernized
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Perfil del autor: https://huggingface.co/hirundo-io
