# Blackfrost-AI/STEP-5-PREVIEW-DERISKED-NVFP4

## Resumen

STEP-5-PREVIEW-DERISKED-NVFP4 es una variante cuantizada y modificada de un modelo multimodal de tipo image-text-to-text, publicada por el usuario Blackfrost-AI y derivada del modelo base TypeSafeAI/Step-5-Preview-BF16. La informacion disponible indica que se trata de un modelo basado en arquitectura de mezcla de expertos dispersa (sparse MoE) con capacidades multimodales, asociado a la familia Step (etiqueta stepfun / step-5), y reconstruido en formato NVFP4, el esquema de cuantizacion de 4 bits en punto flotante disenado para la arquitectura NVIDIA Blackwell.

El repositorio se presenta explicitamente como material de investigacion en seguridad (etiquetas research, security-research, not-for-all-audiences y derisked), lo que sugiere que se ha manipulado o reducido algun componente de seguridad respecto al modelo base. El acceso esta restringido mediante gating en HuggingFace, requiere aceptar condiciones y no se proporcionan datos de parametros, contexto, composicion del dataset ni resultados de evaluacion en la informacion disponible.

Su relevancia actual radica en dos factores: por un lado, explora la viabilidad de desplegar modelos MoE multimodales de gran tamano en precision de 4 bits sobre hardware Blackwell mediante NVFP4; por otro, se publica como artefacto de investigacion ofensiva/defensiva, lo que obliga a evaluar con cautela su uso en produccion. Esta ficha se limita estrictamente a los datos proporcionados y marca como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos dispersa (sparse MoE) multimodal, tarea image-text-to-text; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, punto flotante, formato NVIDIA Blackwell); modelo base en BF16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | other (acceso restringido mediante gating en HuggingFace) |
| Formato de pesos | Libreria transformers; formato de fichero no confirmado en la informacion disponible |
| Modelo base | TypeSafeAI/Step-5-Preview-BF16 |
| Tamano del repositorio | 0.0 GB segun los metadatos de la ficha |

## Arquitectura y entrenamiento

La informacion disponible etiqueta el modelo como un MoE disperso (sparse mixture-of-experts) multimodo con pipeline image-text-to-text, lo que implica capacidades de entrada de imagen y texto con generacion de texto. No se especifican el numero de expertos, la estrategia de enrutamiento, el numero de capas, la dimension del modelo ni el volumen total de parametros, por lo que no es posible detallar la arquitectura interna mas alla de su clasificacion como MoE multimodal.

Respecto al entrenamiento, no se aportan datos sobre el numero de tokens, la composicion del dataset, la existencia de fases de RLHF, DPO u otro tipo de ajuste por preferencias. La unica innovacion tecnica documentada de forma implicita es la reconstruccion de los pesos en NVFP4, un esquema de cuantizacion de 4 bits en punto flotante optimizado para los tensor cores de quinta generacion de NVIDIA (arquitectura Blackwell), que busca reducir el uso de memoria y aumentar el throughput manteniendo mayor rango dinamico que las cuantizaciones enteras tradicionales. La etiqueta derisked sugiere una intervencion sobre el comportamiento de seguridad del modelo base, pero su naturaleza exacta no se describe.

## Capacidades

- Generacion de texto y procesamiento de entradas multimodales (image-text-to-text) segun el pipeline declarado.
- Razonamiento y generacion sobre contexto mixto de imagen y texto, segun la clasificacion MoE multimodal.
- Soporte multilingue limitado a ingles y chino segun las etiquetas de idioma.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la informacion disponible.
- No se documenta modo de razonamiento explicito (thinking mode), capacidades de audio ni de video.
- Presencia de la etiqueta security-research y derisked, que apunta a un uso orientado a investigacion en seguridad mas que a despliegue general.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: el artefacto esta etiquetado como research y security-research, por lo que su proposito declarado es el analisis de comportamiento bajo condiciones controladas, no el despliegue final.
- Evaluacion de cuantizacion NVFP4 en hardware Blackwell: permite medir el impacto en calidad y latencia al comprimir un MoE multimodal de BF16 a 4 bits en punto flotante.
- Pruebas de estres de enrutamiento MoE: util para estudiar como responde un modelo MoE multimodal ante entradas adversarias de imagen y texto.
- Benchmarking de throughput en GPUs Blackwell: escenario para comparar tokens por segundo frente al modelo base en BF16 usando frameworks compatibles.
- Analisis de sesgos y comportamientos residuales: idoneo para estudiar que capacidades o filtros persisten tras el proceso de derisking sobre el modelo base.
- Reproducibilidad de experimentos de cuantizacion: sirve como referencia publica para contrastar pipelines NVFP4 sobre modelos multimodales.

En todos los casos, el acceso restringido y la licencia other obligan a verificar previamente las condiciones de uso, y el caracter not-for-all-audiences desaconseja cualquier despliegue orientado a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conocen parametros totales ni activos).
- El formato NVFP4 esta disenado para la arquitectura NVIDIA Blackwell; requiere GPUs de esa generacion (por ejemplo, serie B200/GB200 y, previsiblemente, la familia RTX 50) para aprovechar los tensor cores de 4 bits en punto flotante.
- GPU recomendadas: exclusivamente hardware Blackwell para explotar NVFP4 de forma nativa; en arquitecturas anteriores (Ampere, Hopper, Ada) la cuantizacion NVFP4 no dispone de soporte nativo completo.
- Compatibilidad con GPU de consumo: no confirmada; dependera del numero de parametros totales y del soporte del runtime, datos no disponibles.
- Opciones de despliegue: se declara compatibilidad con transformers y con endpoints (etiqueta endpoints_compatible); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blackfrost-AI/STEP-5-PREVIEW-DERISKED-NVFP4 | no disponible | no disponible | NVFP4 | other (gated) | Restringida |
| TypeSafeAI/Step-5-Preview-BF16 (modelo base) | no disponible | no disponible | BF16 | no disponible | No confirmada |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de datos tecnicos: no se publican parametros, contexto, dataset ni resultados de evaluacion, lo que impide estimar su comportamiento real.
- Riesgo elevado de alucinacion: no hay evaluaciones publicadas que cuantifiquen la fiabilidad de las respuestas.
- Modelo etiquetado como not-for-all-audiences y security-research, ademas de derisked, lo que indica una posible alteracion o eliminacion de mecanismos de seguridad respecto al modelo base; su uso en produccion con usuarios finales es desaconsejable.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otras lenguas.
- Licencia other con acceso gated: es imprescindible revisar y aceptar las condiciones del autor antes de cualquier uso, y no se garantiza permiso para uso comercial.
- El tamano del repositorio figura como 0.0 GB, lo que resulta inconsistente con un modelo multimodal cuantizado y sugiere que los pesos podrian no estar efectivamente disponibles o que los metadatos estan incompletos.
- Dependencia de hardware Blackwell: NVFP4 no se ejecuta de forma nativa en generaciones anteriores de GPU, lo que limita su portabilidad.
- Ausencia de confirmacion de soporte para tool calling, agentes o modos de razonamiento avanzado.

## Enlaces

- HuggingFace (acceso restringido): https://huggingface.co/Blackfrost-AI/STEP-5-PREVIEW-DERISKED-NVFP4
- Modelo base: TypeSafeAI/Step-5-Preview-BF16 (referenciado en los metadatos; enlace directo no proporcionado)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
