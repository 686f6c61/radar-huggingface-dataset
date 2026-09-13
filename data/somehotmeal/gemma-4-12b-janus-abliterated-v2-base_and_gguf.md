# SOMEHOTMEAL/Gemma-4-12B-Janus-Abliterated-V2-Base_And_GGUF

## Resumen

Gemma-4-12B-Janus-Abliterated-V2 es un modelo multimodal publicado por el usuario SOMEHOTMEAL en Hugging Face, obtenido mediante fusión de pesos (no entrenamiento desde cero) a partir de google/gemma-4-12B-it y culturerevolt/gemma-4-12b-heretic-abliterated. El pipeline declarado es image-text-to-text y la etiqueta de arquitectura es gemma4_unified, con 11.924.553.520 parámetros totales (~11,92 mil millones) almacenados en bfloat16. El repositorio ocupa 57,5 GB e incluye tanto safetensors como ficheros GGUF.

El interés técnico del modelo reside en dos factores. Por un lado, es un ejemplo de "abliteración" combinada con merge: el modelo padre de culturerevolt elimina direcciones de rechazo del espacio de activaciones, y la fusión con el modelo instruct original pretende conservar capacidades generales mientras se atenúan los comportamientos de negativa. Por otro, la mezcla se realiza con el método Linear DARE, una técnica de fusión dispersa que poda y reescala deltas de pesos.

La relevancia práctica es limitada y debe matizarse: el repositorio no declara licencia, idiomas, longitud de contexto ni resultados de evaluación; acumula 0 descargas y 1 "me gusta" desde su creación en septiembre de 2026, por lo que no existe validación independiente de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (etiqueta gemma4_unified); detalles de capas, atención y encoder de visión no disponibles |
| Parámetros totales | 11.924.553.520 (~11,92 mil millones), dato de safetensors |
| Parámetros activos | no aplica: no hay evidencia de que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repositorio contiene ficheros GGUF); variantes y niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) y GGUF |
| Pipeline declarado | image-text-to-text |
| Modelos base | google/gemma-4-12B-it; culturerevolt/gemma-4-12b-heretic-abliterated |
| Tamaño del repositorio | 57,5 GB |

## Arquitectura y entrenamiento

No hay información sobre entrenamiento en el sentido habitual: el modelo no se entrena, se fusiona. La model card documenta una fusión con mergekit usando el método `dare_linear` (Linear DARE, arXiv:2311.03099) tomando google/gemma-4-12B-it como modelo base e incorporando culturerevolt/gemma-4-12b-heretic-abliterated con un peso de 0,60 y una densidad de 0,70. El dtype de salida es bfloat16 y el tokenizador se hereda del modelo base (`tokenizer_source: base`).

DARE (Drop And REscale) aplica una máscara aleatoria que conserva aproximadamente el 70 % de los parámetros del delta del modelo donante y reescala los supervivientes para preservar la magnitud esperada; el resultado se interpola linealmente con el base al 60 % de intensidad. El componente "abliterated" procede del modelo donante: la abliteración identifica la dirección de activación asociada a las negativas y la proyecta fuera de los pesos, de modo que el modelo pierde parte del condicionamiento de seguridad sin pasar por fine-tuning adicional.

No se documentan tokens de preentrenamiento, composición del dataset, ni fases de RLHF, DPO o similares para esta fusión; cualquier alineación presente proviene exclusivamente de los modelos de origen. Tampoco se especifica qué aporta la denominación "Janus" ni si existe un encoder visual diferenciado más allá de la etiqueta de pipeline image-text-to-text.

## Capacidades

- Generación de texto conversacional multi-turno: el pipeline declarado es `conversational` y hereda el formato instruct de google/gemma-4-12B-it.
- Procesamiento de imagen y texto: el pipeline image-text-to-text indica entrada conjunta de imágenes y texto; el alcance real (captioning, VQA, OCR) no está documentado ni evaluado.
- Reducción de rechazos: por construcción (abliteración), el modelo presenta menor probabilidad de negarse a peticiones que los modelos alineados convencionales. Es una característica del diseño, no una capacidad verificada.
- Tool calling / function calling: no documentado. La etiqueta `endpoints_compatible` sugiere compatibilidad con la API de inferencia de Hugging Face, no soporte confirmado de herramientas.
- Uso agéntico y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; se desconoce la cobertura de idiomas.
- Modo "thinking" o cadena de razonamiento explícita: no documentado.

## Casos de uso

- Investigación en seguridad y alineación: el modelo sirve como sujeto de estudio para medir cómo la abliteración y una fusión DARE al 60 % afectan a las tasas de rechazo, comparándolo con google/gemma-4-12B-it sobre el mismo conjunto de prompts.
- Red teaming interno: al carecer de alineación de seguridad efectiva, es adecuado como generador adversarial controlado en entornos aislados para descubrir fallos en clasificadores y filtros propios.
- Asistente multimodal local: con cuantización GGUF Q4 puede desplegarse en una GPU de consumo para tareas de descripción de imágenes y preguntas sobre capturas, siempre que el runner soporte el encoder visual del modelo.
- Generación de datos sintéticos sin filtro de negativa: útil para producir corpus diversos en dominios donde los modelos alineados rechazan sistemáticamente el prompt (ficción adulta, narrativa de violencia, escenarios médicos o legales explícitos), con revisión humana posterior.
- Anotación y etiquetado de imágenes a escala: si el pipeline multimodal funciona correctamente, puede generar descripciones y etiquetas preliminares sobre lotes de imágenes, con coste marginal bajo al ejecutarse en hardware propio.
- Escritura creativa y roleplay: el modelo está orientado a conversación y, al no bloquear temáticas sensibles, encaja en aplicaciones de ficción interactiva y personajes, asumiendo la responsabilidad editorial del contenido generado.
- Estudio de técnicas de fusión: es un caso reproducible de `dare_linear` con parámetros concretos (peso 0,60, densidad 0,70), útil como referencia para experimentos de mergekit y para comparar contra otras recetas de fusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio registra 0 descargas y 1 "me gusta", por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros (11,92 mil millones) y del tamaño del repositorio; no proceden de mediciones publicadas por el autor.

- Pesos en bfloat16: ~23,8 GB solo de pesos. Con caché KV y activaciones, se necesitan del orden de 28-32 GB de VRAM en función de la longitud de contexto.
- GPU profesionales para bf16: A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB en una sola tarjeta.
- Cuantización Q8_0 (GGUF): ~12,7 GB de pesos; cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen amplio.
- Cuantización Q4_K_M (GGUF): ~7,3 GB de pesos; cabe en RTX 4070, RTX 3060 de 12 GB, y en equipos Apple Silicon con 16 GB de memoria unificada.
- Consumer GPU: sí, en cuantizaciones de 8 bits o inferiores. En bf16 no cabe en ninguna GPU de consumo de 24 GB con contexto apreciable, aunque podría arrancar con contextos muy cortos.
- Consideración multimodal: si el modelo conserva un encoder de visión, este consume VRAM adicional no cuantizada en la mayoría de implementaciones, lo que reduce el margen estimado para texto.
- Opciones de despliegue: transformers (formato nativo), vLLM o TGI para safetensors (la etiqueta `endpoints_compatible` apunta a despliegue gestionado), y llama.cpp, Ollama o LM Studio para los ficheros GGUF. El soporte multimodal en runners GGUF es variable y debe verificarse antes de asumir entrada de imagen.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo publicados.

## Comparativa con modelos similares

No hay datos públicos suficientes para comparar cuantitativamente con otros modelos de 12B. La tabla recoge los tres modelos directamente implicados en la fusión, con la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| SOMEHOTMEAL/Gemma-4-12B-Janus-Abliterated-V2 | 11,92 mil millones | no disponible | no disponible | Objeto de esta ficha; fusión DARE al 60 % |
| google/gemma-4-12B-it | no disponible en la información proporcionada | no disponible | no disponible | Modelo base de la fusión; presumiblemente alineado para instrucciones |
| culturerevolt/gemma-4-12b-heretic-abliterated | no disponible en la información proporcionada | no disponible | no disponible | Donante al 60 % con densidad 0,70; aporta la abliteración |

No se dispone de datos de benchmarks, contexto o licencia de ninguno de los tres, por lo que no es posible establecer una comparación de rendimiento con alternativas como otros modelos de ~12B de la misma categoría. Cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Alineación de seguridad eliminada: la abliteración suprime el mecanismo de rechazo del modelo donante, por lo que puede generar contenido dañino, ilegal o explícitamente sensible sin filtros. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Licencia no declarada: la model card no especifica licencia. Al derivar de un modelo de Google, es previsible que hereden las condiciones de uso de la familia Gemma, pero esto no está confirmado en la información disponible. No debe asumirse uso comercial libre sin verificarlo con el autor y con los términos del modelo base.
- Ausencia total de evaluación: sin benchmarks, sin descargas y con un único "me gusta", no existe evidencia de que la fusión preserve las capacidades del modelo base. Las fusiones DARE con densidad 0,70 pueden introducir artefactos y degradar el rendimiento en tareas específicas.
- Riesgo de alucinación: inherente a los modelos de esta escala; sin evaluación no puede acotarse su magnitud ni en texto ni en descripción de imágenes.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo (documentos extensos, conversaciones prolongadas) sin determinar primero el límite real.
- Cobertura de idiomas desconocida: no se declara ningún idioma, por lo que el comportamiento en castellano no está garantizado ni medido.
- Ambigüedad de la denominación "Janus" y de la etiqueta gemma4_unified: no se documenta en qué consiste la componente multimodal. La etiqueta de pipeline image-text-to-text es la única evidencia de capacidad visual.
- Conflictos de nombre y de fecha: la ficha declara modelos "Gemma 4" y una fecha de creación en septiembre de 2026; conviene verificar la procedencia y la vigencia de los artefactos antes de integrarlos en cualquier flujo de producción.
- Soporte de herramientas y agentes no confirmado: no debe asumirse function calling ni razonamiento multi-paso en un pipeline real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SOMEHOTMEAL/Gemma-4-12B-Janus-Abliterated-V2-Base_And_GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo donante abliterado: https://huggingface.co/culturerevolt/gemma-4-12b-heretic-abliterated
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper de DARE (Linear DARE): https://arxiv.org/abs/2311.03099

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
