# FrLdy/mbart-mtllora-ETR-fr

## Resumen

`FrLdy/mbart-mtllora-ETR-fr` es un adaptador de tipo LoRA (denominado "mtllora" por el autor) entrenado sobre el modelo base `facebook/mbart-large-50`, un transformer encoder-decoder multilingüe de 610 millones de parámetros desarrollado por Meta AI. El adaptador se ha entrenado sobre el dataset `ETR-fr`, presumiblemente orientado a traducción o generación en francés, aunque la model card no documenta la tarea concreta ni la composición del corpus. El repositorio tiene un tamaño de 1,2 GB y fue creado el 18 de noviembre de 2026.

La relevancia de este artefacto es limitada en el estado actual: no se han publicado resultados de evaluación, no se especifica la licencia, no se documentan los idiomas soportados y el número de descargas y likes es cero. Se trata, por tanto, de un adaptador experimental o en fase temprana de publicación, sin validación pública conocida.

Para un desarrollador o investigador que evalúe modelos, este adaptador debe considerarse como un punto de partida reproducible (carga mediante la librería `adapters` sobre mBART-50) más que como un componente listo para producción. La ausencia de métricas y de documentación sobre el entrenamiento impide recomendarlo para despliegues reales sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-50) con adaptador LoRA |
| Parametros totales | 610 M (modelo base mBART-50; parámetros del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (valor por defecto de mBART-50; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base mBART-50 soporta 50 idiomas; el adaptador se entrena sobre `ETR-fr`) |
| Licencia | no disponible |
| Formato de pesos | pesos de adaptador para la librería `adapter-transformers` (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `facebook/mbart-large-50`, un transformer encoder-decoder con atención completa, 12 capas en encoder y 12 en decoder, dimensión oculta de 1024 y 16 cabezas de atención, preentrenado por Meta AI con objetivos de denoising multilingüe sobre corpus en 50 idiomas. La técnica de adaptación empleada es LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en las proyecciones de atención y feed-forward.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset `ETR-fr`, la presencia de RLHF/DPO ni hiperparámetros del adaptador (rango, alpha, dropout). La model card incluye secciones de "Architecture & Training" y "Evaluation results" vacías, sin contenido. Tampoco se documenta si el adaptador afecta solo al encoder, solo al decoder o a ambos, ni si se ha entrenado con objetivos de traducción supervisada, denoising o generación condicionada.

## Capacidades

- Generación de texto condicionada en el dominio del dataset `ETR-fr`, presumiblemente en francés; la tarea exacta no está documentada.
- Herencia de las capacidades multilingües del modelo base mBART-50 (50 idiomas), si bien el adaptador puede degradar el rendimiento fuera del dominio de entrenamiento.
- Traducción automática potencial, dado el uso habitual de mBART-50 como modelo de traducción, aunque no confirmado por el autor.
- Carga y activación mediante `AutoAdapterModel` de la librería `adapters`, con posibilidad de combinar con otros adaptadores del mismo modelo base.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión ni audio.

## Casos de uso

- Investigación en adaptación eficiente: reproducir el flujo de carga del adaptador sobre mBART-50 para estudiar el efecto de LoRA en tareas de traducción o generación en francés, comparando con el modelo base sin adaptador.
- Experimentación académica con el dataset `ETR-fr`: usar el adaptador como línea base en trabajos que evalúen técnicas de adaptación sobre mBART-50 con ese corpus concreto.
- Prototipado de traducción francés-español o francés-inglés: cargar el adaptador y medir calidad con un conjunto de validación propio antes de considerar su uso, dado que no hay métricas publicadas.
- Composición de adaptadores: al ser un adaptador LoRA sobre mBART-50, puede combinarse con otros adaptadores del mismo modelo base para tareas multi-dominio, siempre que se validen las interferencias.
- Fine-tuning posterior: servir como inicialización para un ajuste adicional con datos propios en francés, aprovechando que los pesos del modelo base permanecen intactos.
- Evaluación comparativa de adaptadores: incluirlo en un banco de pruebas de adaptadores LoRA para mBART-50 y contrastar su rendimiento frente a alternativas con documentación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB para el modelo base mBART-50 (610 M de parámetros) más el adaptador (tamaño del adaptador no disponible; el repo ocupa 1,2 GB, lo que sugiere pesos en fp32).
- VRAM estimada en fp16: aproximadamente 1,3 GB para el modelo base.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: la librería `adapters` (obligatoria para cargar el adaptador); el modelo base puede servirse con Hugging Face Transformers, TGI o vLLM, pero la integración del adaptador LoRA requiere verificar compatibilidad con cada runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `FrLdy/mbart-mtllora-ETR-fr` | 610 M (base) + adaptador | 1024 (base) | no disponible | Hugging Face, 0 descargas | Sin benchmarks ni documentación de entrenamiento |
| `facebook/mbart-large-50` | 610 M | 1024 | MIT | Hugging Face, ampliamente usado | Modelo base multilingüe con benchmarks publicados |
| `Helsinki-NLP/opus-mt-fr-es` | ~77 M | 512 | CC-BY 4.0 | Hugging Face | Traducción dedicada francés-español, más ligero |
| `facebook/m2m100_418M` | 418 M | 1024 | MIT | Hugging Face | Multilingüe 100 idiomas, alternativa directa a mBART-50 |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de que el adaptador mejore al modelo base en ninguna tarea.
- Model card incompleta: las secciones de arquitectura, entrenamiento, evaluación y citación están vacías o con placeholders.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor o asumir riesgo legal.
- Idiomas no documentados: aunque el modelo base cubre 50 idiomas, el adaptador puede degradar el rendimiento fuera del dominio francés de `ETR-fr`.
- Riesgo de alucinación y sesgos: heredados del modelo base mBART-50 y no evaluados en el adaptador; sin datos de mitigación.
- Dataset `ETR-fr` no verificado: no se conoce su procedencia, tamaño ni licencia, lo que impide auditar el entrenamiento.
- Cero descargas y cero likes: sin validación por parte de la comunidad; tratar como artefacto experimental.
- Compatibilidad de despliegue limitada: requiere la librería `adapters`; no hay pesos GGUF ni safetensors standalone para llama.cpp u Ollama.
- Fecha de creación futura (2026-11-18): metadato anómalo que conviene verificar antes de confiar en la trazabilidad del repositorio.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/FrLdy/mbart-mtllora-ETR-fr
- Modelo base mBART-50: https://huggingface.co/facebook/mbart-large-50
- Librería Adapters: https://github.com/Adapter-Hub/adapters
- Documentación de Adapter Hub: https://adapterhub.ml
- Dataset referenciado (no verificado): https://huggingface.co/datasets/ETR-fr
