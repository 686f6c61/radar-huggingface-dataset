# ANZ-Innovation/qwen2.5-0.5b-vietnamese-schema-extractor

## Resumen

`ANZ-Innovation/qwen2.5-0.5b-vietnamese-schema-extractor` es un ajuste fino (fine-tune) de tipo SFT sobre un modelo de la familia Qwen2.5 de 0,5 mil millones de parámetros, publicado por la organización ANZ-Innovation en HuggingFace. El nombre del repositorio indica que el objetivo es la extracción de esquemas (schema extraction) sobre texto en vietnamita, es decir, convertir contenido no estructurado en una estructura de datos predefinida. Los tags del repositorio (`trl`, `sft`, `conversational`, `qwen2`) confirman que se ha entrenado con la librería TRL mediante aprendizaje supervisado y que el checkpoint se distribuye en formato conversacional.

El problema principal de esta ficha es la ausencia casi total de documentación: la model card es la plantilla autogenerada por HuggingFace y todos los campos relevantes (`Developed by`, `Language(s)`, `License`, datos de entrenamiento, hiperparámetros, evaluación) aparecen como `[More Information Needed]`. No se han publicado resultados de benchmarks, no se declara licencia y el repositorio no tiene descargas ni valoraciones. Cualquier evaluación rigurosa del modelo requiere inspeccionar los pesos y el tokenizador directamente.

Por tamaño (494.032.768 parámetros reales según safetensors, repositorio de 1,0 GB) es un modelo apto para inferencia en CPU y en GPU de consumo, lo que lo hace interesante para tareas de extracción de campos en pipelines de bajo coste o en el edge, pero la falta de licencia explícita es un bloqueante serio para uso comercial en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tags `qwen2` y nombre del repositorio); no se detalla en la model card |
| Parametros totales | 494.032.768 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. El modelo base Qwen2.5-0.5B declara 32.768 tokens, pero la model card de este fine-tune no lo confirma |
| Tipos de cuantizacion | No disponible. No se publican versiones GGUF, AWQ ni GPTQ; solo pesos en safetensors |
| Idiomas soportados | No disponible en la model card. El nombre del repositorio sugiere vietnamita como idioma objetivo del ajuste |
| Licencia | No disponible (campo `[More Information Needed]`; el Hub no declara licencia) |
| Formato de pesos | safetensors (repositorio de 1,0 GB, coherente con pesos en fp16/bf16) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura más allá de los metadatos del Hub. Por el nombre y los tags (`qwen2`, `transformers`, `safetensors`) se trata de un transformer decoder-only de la familia Qwen2. El recuento exacto de parámetros (494.032.768) coincide con el tamaño de un modelo de ~0,5B, coherente con Qwen2.5-0.5B, que sería el checkpoint de partida según el identificador del repositorio. No hay confirmación oficial de esta correspondencia en la model card.

En cuanto al entrenamiento, los tags `trl` y `sft` indican un ajuste fino supervisado con la librería TRL, presumiblemente sobre pares de instrucción y respuesta orientados a producción de esquemas a partir de texto en vietnamita. No se especifican el volumen de tokens, la composición del dataset, el uso de RLHF/DPO, la precisión mixta empleada ni los hiperparámetros. Tampoco se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, modos de razonamiento) más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional y de tipo instrucción, heredada del ajuste SFT.
- Extracción de esquemas: según el nombre del repositorio, generación de estructuras de datos (presumiblemente JSON) a partir de texto en vietnamita.
- Formato conversacional (`conversational`), compatible con plantillas de chat de la familia Qwen.
- Compatible con text-generation-inference y con endpoints de HuggingFace (tags `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles; el ajuste parece centrado en vietnamita y podría haber degradado otros idiomas del modelo base.
- Visión, audio o thinking mode: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Extracción de campos estructurados de documentos en vietnamita: el modelo recibiría texto libre (contratos, formularios, correos) y devolvería un objeto con un esquema fijo, sustituyendo reglas regex frágiles por un componente entrenado específicamente para la tarea.
- Normalización de datos en pipelines ETL: uso como paso intermedio que convierte texto no estructurado en registros tabulares antes de cargarlos en un almacén de datos, con la ventaja de un coste por inferencia muy bajo al tratarse de 0,5B parámetros.
- Preprocesado para RAG con salida estructurada: generar metadatos y filtros (fecha, entidad, tipo de documento) a partir de fragmentos recuperados, de modo que el sistema de búsqueda pueda aplicar filtros deterministas antes de la generación final con un modelo mayor.
- Clasificación y enrutado en backoffice: asignar documentos entrantes a colas de trabajo según campos extraídos, ejecutando el modelo en CPU o en una GPU pequeña dentro de la propia infraestructura.
- Despliegue en el edge o en entornos con recursos limitados: con ~1 GB de pesos en fp16 y menos de 0,5 GB en cuantizaciones de 8 bits, puede ejecutarse en dispositivos sin GPU dedicada para tareas de extracción offline.
- Prototipado y evaluación de pipelines de extracción: sirve como línea base barata para comparar prompts y esquemas antes de escalar a un modelo mayor, gracias a su baja latencia y a su reducido consumo de memoria.
- Generación de datos sintéticos de prueba: producir instancias de esquema plausibles para tests de integración de sistemas que consumen la salida del extractor (con validación humana obligatoria por el riesgo de alucinación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir de los 494M parámetros, no confirmada por el autor): ~1,0-1,2 GB en fp16, ~0,5-0,7 GB en int8, ~0,3-0,5 GB en int4, en ambos casos con overhead de activaciones y caché KV variable según contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en fp16 (GTX 1650, RTX 3050, RTX 4060, T4). Para lotes grandes o contextos largos conviene subir a 8-16 GB (RTX 4090, L4, A10).
- Cabe holgadamente en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más, e incluso en CPU con un rendimiento aceptable para extracción por documento.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints de HuggingFace (tag `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-vietnamese-schema-extractor (este modelo) | 494 M | No disponible | No disponible | No | safetensors en el Hub |
| Qwen2.5-0.5B (base presumible) | ~494 M | 32.768 tokens (según el modelo base) | Apache 2.0 (según el modelo base) | Sí, en la model card del base | safetensors, GGUF y otras cuantizaciones |
| Qwen2.5-1.5B | ~1,5 B | 32.768 tokens (según el modelo base) | Apache 2.0 (según el modelo base) | Sí, en la model card del base | safetensors, GGUF y otras cuantizaciones |
| SmolLM2-360M | ~360 M | No verificado en esta búsqueda | Apache 2.0 (según el modelo base) | Sí, en la model card del base | safetensors, GGUF |

Nota: los datos de los modelos alternativos provienen de sus fichas públicas y no se han verificado contra la documentación de este repositorio concreto; se incluyen solo como referencia de categoría. La ventaja diferencial de este modelo sería el ajuste específico para extracción de esquemas en vietnamita, no su rendimiento general, que a igualdad de tamaño debería ser comparable o inferior al del base por especialización.

## Limitaciones y advertencias

- Model card vacía: todos los campos de documentación están sin rellenar, incluidos idiomas, licencia, datos de entrenamiento y evaluación. No es posible reproducir el entrenamiento ni auditar el dataset.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; en la práctica esto bloquea el despliegue en producción hasta aclararlo con el autor.
- Ausencia total de validación externa: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan estimar la calidad real del ajuste.
- Riesgo de alucinación en la salida estructurada: con 0,5B parámetros, el modelo puede inventar campos, omitir claves del esquema o generar JSON inválido; es imprescindible validar la salida con un parser y un esquema formal (por ejemplo, JSON Schema) y aplicar reintentos.
- Especialización estrecha: el ajuste SFT sobre una única tarea puede degradar capacidades generales del modelo base (olvido catastrófico), incluyendo el multilingüismo y el razonamiento.
- Idiomas: no se declara cobertura lingüística; no hay garantía de que el modelo mantenga un rendimiento aceptable en castellano o en otros idiomas distintos del objetivo.
- Longitud de contexto no confirmada: no se especifica qué ventana soporta realmente el checkpoint tras el ajuste; asumir los 32.768 tokens del base sin verificación puede provocar errores en documentos largos.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ, por lo que el despliegue en llama.cpp u Ollama requiere conversión manual y validación posterior de la calidad.
- Metadata a verificar: las fechas del repositorio (creación y actualización el 2026-10-20) resultan anómalas; conviene comprobar el estado real del repositorio antes de citarlo.

## Enlaces

- HuggingFace: https://huggingface.co/ANZ-Innovation/qwen2.5-0.5b-vietnamese-schema-extractor
- Paper citado en los tags (Lacoste et al., 2019, sobre emisiones de carbono; solo referencia metodológica de la plantilla): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental mencionada en la plantilla: https://mlco2.github.io/impact#compute
- Repositorio, paper, demo y contacto del autor: no disponibles en la información proporcionada.
- Nota sobre la búsqueda web: los resultados obtenidos corresponden exclusivamente a entidades bancarias denominadas ANZ (Australia and New Zealand Banking Group) y no guardan relación con el modelo ni con la organización ANZ-Innovation. No se ha encontrado documentación adicional del modelo en la web.
