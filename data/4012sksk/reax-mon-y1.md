# 4012sksk/reax-mon-y1

## Resumen

Reax-mon-y1 es un modelo de lenguaje derivado de perplexity-ai/pplx-decider-v1.2, publicado por el usuario 4012sksk bajo licencia Apache 2.0. No se trata de un entrenamiento desde cero, sino de una fusión (soup) de tres deltas LoRA efectivos —gen5a seed10, gen9a seed30 y gen9c seed32— combinados mediante una media exacta sobre el backbone base. El modelo conserva la arquitectura, el tokenizador y el runtime originales del modelo base; el autor no documenta cambios estructurales.

El artefacto incluye además una cabeza de salida (readout) congelada en BF16 calibrada sobre un paquete de diagnóstico ya consumido, con ajustes globales de alpha=3.0 y spread A/B=1.0. El autor es explícito al señalar que esta calibración no constituye una validación final independiente ni una evaluación oficial fuera de muestra, lo que sitúa al modelo en la categoría de experimento de investigación más que de artefacto listo para producción.

Con 26.085.330.160 parámetros y un repositorio de 52,2 GB en formato safetensors, el modelo se posiciona en la franja de ~26B, relevante para despliegues en una sola GPU de 80 GB o en configuraciones multi-GPU con cuantización. La información pública disponible es muy limitada: no hay model card detallada, ni idiomas declarados, ni benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de perplexity-ai/pplx-decider-v1.2; no se documentan cambios estructurales) |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint perplexity-ai/pplx-decider-v1.2 en la revisión cce0f3f80033e9d89d80831d5281fd72124aacce. Sobre ese backbone, el autor aplica una media exacta de tres deltas LoRA efectivos (gen5a seed10, gen9a seed30 y gen9c seed32), sin fusionar pesos de modelos competidores en el backbone Y1. El resultado es una "soup" de adaptadores de bajo rango que preserva la arquitectura, el tokenizador y el runtime originales.

El componente diferencial es la cabeza de salida: un head BF16 congelado, calibrado sobre un paquete de diagnóstico D que combina filas de cobertura públicas o previamente consumidas convertidas en un proxy de elección, más 199 filas de diagnóstico nativas. La selección se realizó con un operador adaptativo sobre el conjunto D combinado, con ajustes globales alpha=3.0 y spread A/B=1.0 aplicado sobre la media de fila. El autor advierte que los resúmenes de validación cruzada son diagnósticos separados y que ningún subconjunto de D se presenta como validación final independiente. No se documentan datos de entrenamiento (número de tokens, composición del dataset) ni procesos de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base pplx-decider-v1.2, sin documentación específica de capacidades en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Calibración de readout: el modelo incorpora una cabeza de salida ajustada para selección/elección sobre el proxy de diagnóstico D, según la model card.

## Casos de uso

- Investigación sobre fusión de adaptadores LoRA: el modelo sirve como caso de estudio reproducible de "soup" de tres deltas LoRA sobre un backbone fijo, útil para equipos que investigan técnicas de model merging y calibración de cabezas de salida.
- Experimentación con calibración de readout: la cabeza BF16 congelada con alpha y spread documentados permite analizar el efecto de la calibración post-fusión en tareas de selección, siempre que se respeten las advertencias del autor sobre la naturaleza no independiente del conjunto D.
- Reproducción de pipelines de evaluación diagnóstica: los ficheros NOTICE, soup3-source-manifest.json y readout-selection.json permiten auditar hashes de origen y reconstruir el proceso de selección.
- Baseline para comparativas de model merging: al conservar arquitectura y tokenizador del base, puede usarse como referencia frente al checkpoint original en experimentos controlados.
- Fine-tuning posterior sobre dominio específico: al estar en safetensors y licencia Apache 2.0, es apto para ajuste adicional en entornos de investigación con requisitos de trazabilidad.
- Despliegue experimental en inferencia: con 26B parámetros y pesos BF16, puede servirse en una GPU de 80 GB para pruebas internas, no para producción crítica dada la ausencia de benchmarks y validación independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna victoria en campeonatos ni en muestras frescas fuera de muestra, y que los resúmenes de validación cruzada son diagnósticos separados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere GPU de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- Cuantización a 8 bits: ~26 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantización más agresiva o descarga parcial; no se documentan variantes cuantizadas oficiales.
- Cuantización a 4 bits: ~13-15 GB de pesos, podría caber en RTX 4090, pero no hay GGUF/AWQ/GPTQ publicados por el autor.
- GPU recomendadas: A100 80GB o H100 80GB para BF16 sin cuantizar; configuraciones multi-GPU para servir con paralelismo tensorial.
- Opciones de despliegue: vLLM, TGI o llama.cpp requerirían conversión a los formatos soportados; el autor no publica artefactos GGUF ni configuraciones de serving.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reax-mon-y1 (4012sksk) | 26,09B | no disponible | Apache 2.0 | HuggingFace, 29 descargas | Soup de 3 LoRA sobre pplx-decider-v1.2; sin benchmarks |
| perplexity-ai/pplx-decider-v1.2 (base) | no disponible en la información | no disponible | no disponible en la información | HuggingFace | Backbone original; referencia directa del fine-tune |
| Alternativas de ~26B open source (p. ej. familia Qwen o Mistral) | ~24-27B | 32K-128K típicamente | Apache 2.0 / otras | Amplia | No se dispone de datos comparativos específicos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría; los datos del modelo base no están documentados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de benchmarks públicos: no hay resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, lo que impide estimar su calidad real frente al modelo base.
- Validación no independiente: el autor advierte que el conjunto D combina filas públicas o previamente consumidas con 199 filas de diagnóstico nativas, y que ningún subconjunto se presenta como validación final independiente tras la selección sobre D combinado.
- Sin reclamación de rendimiento fuera de muestra: el modelo no debe presentarse como ganador de campeonatos ni como mejora validada en muestras frescas.
- Idiomas no declarados: no se especifican idiomas soportados, lo que limita su uso en aplicaciones multilingües sin evaluación previa.
- Riesgo de alucinación y sesgos: no documentados por el autor; al derivar de un backbone no caracterizado en la información disponible, deben asumirse los riesgos habituales de los LLM.
- Contexto desconocido: se desconoce la ventana de contexto efectiva, lo que impide planificar casos de uso con documentos largos.
- Madurez del artefacto: 29 descargas y 0 likes en el momento de la consulta; creado y actualizado el mismo día, sin historial de mantenimiento.
- Licencia Apache 2.0: permite uso comercial, pero la falta de evaluación independiente desaconseja producción crítica sin validación propia.
- Dependencia del modelo base: cualquier restricción o cambio en pplx-decider-v1.2 afecta a la trazabilidad del artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/4012sksk/reax-mon-y1
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Revisión del base referenciada: cce0f3f80033e9d89d80831d5281fd72124aacce
- Ficheros citados en la model card: NOTICE, soup3-source-manifest.json, readout-selection.json (disponibles en el repositorio del modelo)
- SHA256 del head: 0b1820391b0c3a37501d2395f00bb594113bd241d56a079d1e307fe337e9d7ee
