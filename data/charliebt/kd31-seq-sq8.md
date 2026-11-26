# CharlieBT/kd31-seq-sq8

## Resumen

CharlieBT/kd31-seq-sq8 es un modelo derivado (finetune) del modelo base MachinePulseAI/karpo-decision-31B, publicado en Hugging Face bajo licencia Apache 2.0 y con acceso restringido (gated). Se distribuye en formato safetensors para la librería transformers y está etiquetado con el pipeline de text-classification, aunque también declara compatibilidad con image-text-to-text y con la familia gemma4, lo que sugiere una arquitectura multimodal de base. El repositorio ocupa 62,6 GB y los pesos suman 31.273.088.876 parámetros (aproximadamente 31,3 mil millones).

El modelo no cuenta con descargas ni interacciones en el momento de la consulta (0 descargas, 0 likes) y fue creado el 26 de noviembre de 2026, apenas un minuto antes de su última actualización, lo que indica una publicación muy reciente y sin validación comunitaria. La etiqueta "seq-sq8" en el nombre sugiere una variante orientada a secuencias con cuantización de 8 bits, aunque no se dispone de documentación que lo confirme.

La relevancia de esta ficha es limitada por la escasez de información pública: no hay model card descriptiva, no se detallan datos de entrenamiento, benchmarks ni idiomas soportados. Se trata, por tanto, de un modelo de nicho que requiere aceptar condiciones de acceso y cuya evaluación técnica debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como gemma4; presumiblemente transformer multimodal) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el sufijo "sq8" sugiere 8 bits, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. Las etiquetas del repositorio indican la familia gemma4 y los pipelines image-text-to-text y text-classification, lo que apunta a un modelo multimodal (visión y texto) reutilizado para una tarea de clasificación de texto mediante finetune. El modelo base es MachinePulseAI/karpo-decision-31B, del cual este repositorio es un ajuste fino.

No hay datos públicos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). Tampoco se documenta si el finetune se realizó sobre tareas de clasificación supervisada, instrucciones o preferencias.

## Capacidades

- Generación de texto y razonamiento: capacidad presumible por herencia del modelo base de 31B, sin confirmación documental.
- Procesamiento de imagen y texto: la etiqueta image-text-to-text sugiere entrada multimodal, aunque el pipeline declarado es text-classification.
- Clasificación de texto: pipeline principal declarado en el repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de documentos en pipelines de ingestión: el pipeline declarado (text-classification) permite etiquetar documentos o fragmentos en flujos ETL, siempre que se valide el comportamiento del finetune sobre el dominio objetivo.
- Moderación de contenido textual: uso como clasificador de categorías predefinidas, con la cautela de que no hay métricas publicadas que garanticen su precisión.
- Enrutamiento de consultas en sistemas RAG: clasificar la intención de una consulta antes de recuperar contexto, aprovechando el tamaño del modelo base.
- Etiquetado semiautomático de datasets: generar etiquetas preliminares que luego se revisan por anotadores humanos, dado el bajo coste relativo frente a anotación manual.
- Análisis de opiniones o tickets de soporte: clasificación de categorías y sentimiento en conversaciones multi-turno, previa validación empírica.
- Investigación sobre finetunes de modelos de 31B: estudio comparativo de técnicas de ajuste y cuantización (el sufijo sq8 sugiere 8 bits) sobre un modelo base multimodal.
- Prototipado de clasificadores multimodales: experimentación con entradas imagen-texto si se confirma la arquitectura gemma4 subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, viable en una A100 40 GB o H100.
- VRAM estimada en cuantización de 4 bits: en torno a 16-18 GB, potencialmente viable en RTX 4090 (24 GB) con contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; A100 40 GB o L40S para 8 bits.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) solo con cuantización de 4 bits y contexto limitado; en RTX 3090 (24 GB) condiciones similares.
- Opciones de despliegue: transformers (declarado), vLLM, TGI y llama.cpp no están confirmados por el autor; la compatibilidad con endpoints_compatible sugiere integración con Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CharlieBT/kd31-seq-sq8 | 31,3B | no disponible | Apache 2.0 | Gated en HF |
| MachinePulseAI/karpo-decision-31B (base) | 31B (presumible) | no disponible | no disponible | HF |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma license | Abierto |
| Qwen2.5 32B (referencia de tamaño) | 32,5B | 128K | Apache 2.0 | Abierto |

La comparativa con alternativas de la misma categoría no puede completarse con rigor porque no se dispone de benchmarks ni de la model card del modelo base. Los modelos de referencia incluidos sirven solo como orientación de tamaño y licencia.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentación sobre datos de entrenamiento, evaluación ni sesgos conocidos.
- Riesgo elevado de alucinación en generación de texto, dado que el finetune está orientado a clasificación y no se ha validado su comportamiento generativo.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Longitud de contexto desconocida, lo que impide planificar su uso en tareas de contexto largo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos automatizados o de investigación.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado del modelo base conviene verificar que la licencia del base sea compatible.
- Cero descargas y cero likes: sin validación comunitaria ni reportes de calidad.
- El sufijo "sq8" sugiere cuantización de 8 bits, pero no está confirmado; la precisión efectiva puede diferir de la esperada.
- Fecha de creación en 2026 y actualización un minuto después: posible publicación apresurada o incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-seq-sq8
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
