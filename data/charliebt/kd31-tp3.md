# CharlieBT/kd31-tp3

## Resumen

CharlieBT/kd31-tp3 es un modelo de 31.273.088.876 parametros (aproximadamente 31,3 mil millones) alojado en Hugging Face por el usuario CharlieBT. Se distribuye en formato safetensors y es compatible con la libreria transformers. La model card lo etiqueta como `gemma4`, lo que sugiere que deriva de la familia Gemma de Google, y esta afinado a partir del modelo base `danyloooah/reax-g2-soup2`. Aunque el pipeline declarado es `text-classification`, las etiquetas incluyen `image-text-to-text`, lo que apunta a un modelo multimodal con capacidad de procesar imagen y texto.

El modelo resuelve, segun su configuracion declarada, tareas de clasificacion de texto y potencialmente entrada multimodal imagen-texto. Es relevante por su tamano (31B) y por estar publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque el acceso esta restringido mediante gating en Hugging Face y el repositorio no registra descargas ni interacciones en el momento de la consulta.

La informacion publica disponible es muy limitada: no hay model card detallada, no se especifican idiomas, no hay benchmarks y no se documenta el proceso de entrenamiento. Esta ficha refleja exclusivamente los metadatos verificables del repositorio y marca como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4`; probablemente transformer derivado de Gemma) |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. La etiqueta `gemma4` sugiere una base de la familia Gemma de Google, y el campo `base_model` indica que este modelo es un fine-tune de `danyloooah/reax-g2-soup2`, que a su vez parece ser un modelo derivado (posiblemente un "soup" o mezcla de pesos). El tamano de 31,3B parametros es coherente con un transformer denso de gran escala, aunque no se confirma si emplea atencion lineal, mezcla de expertos u otras variantes.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). El repositorio tiene un tamano de 62,6 GB, coherente con pesos en precision de 16 bits para 31,3B parametros (aproximadamente 62,6 GB), sin cuantizaciones adicionales publicadas.

## Capacidades

- Generacion de texto y clasificacion de texto (pipeline declarado `text-classification`).
- Procesamiento imagen-texto (etiqueta `image-text-to-text`), lo que sugiere capacidad multimodal de entrada.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, vision, audio): vision probable por la etiqueta `image-text-to-text`; el resto no disponible.

## Casos de uso

- Clasificacion de documentos y textos: el pipeline declarado es `text-classification`, por lo que puede emplearse para etiquetar contenido en flujos de moderacion, enrutamiento o analisis de sentimiento, aunque no se documentan las clases de salida.
- Procesamiento de imagenes con texto asociado: la etiqueta `image-text-to-text` permite plantear tareas de descripcion, extraccion de informacion o clasificacion multimodal, siempre que se valide el comportamiento real del modelo.
- Fine-tuning adicional sobre dominio propio: al ser Apache 2.0 y estar en safetensors, puede reentrenarse para tareas especificas con transformers, aunque el acceso gated requiere aceptar condiciones.
- Investigacion sobre modelos derivados de Gemma: sirve como punto de partida para estudiar el efecto de fine-tunes y mezclas de pesos sobre una base de 31B.
- Despliegue en infraestructura propia con transformers: compatible con la libreria y con endpoints, puede servirse en entornos controlados.
- Experimentacion academica con modelos multimodales de gran tamano: util para comparar comportamientos frente a otras variantes de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 32-35 GB (estimacion teorica, no confirmada por el autor).
- VRAM estimada en cuantizacion de 4 bits: en torno a 17-20 GB (estimacion teorica, no confirmada por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB, o multiples GPU consumer con tensor parallelism.
- Cabe en consumer GPU: no en FP16 en una sola GPU de 24 GB; posible en 4 bits en RTX 4090 (24 GB) o similares, sujeto a validacion.
- Opciones de despliegue: transformers (libreria declarada), endpoints de Hugging Face; vLLM, llama.cpp, Ollama o TGI no estan confirmados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| CharlieBT/kd31-tp3 | ~31,3B | no disponible | Apache 2.0 | Gated |
| danyloooah/reax-g2-soup2 (base) | no disponible | no disponible | no disponible | no disponible |
| Gemma 2 27B (referencia de familia) | 27B | no disponible en esta ficha | Gemma license | Abierto |
| Modelos densos de ~30B de otras familias | ~30B | no disponible | variable | variable |

La comparativa con alternativas concretas no puede completarse con rigor porque no se dispone de datos de rendimiento ni de contexto del modelo evaluado. Se indica "no disponible" para los campos no confirmados.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar pesos.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, sesgos, idiomas ni evaluaciones.
- Riesgo de alucinacion: inherente a los modelos generativos de gran escala; sin evaluaciones publicadas no puede cuantificarse.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no documentadas.
- Pipeline declarado `text-classification` frente a etiqueta `image-text-to-text`: posible inconsistencia en los metadatos que conviene validar antes de produccion.
- Sin descargas ni interacciones registradas: no hay evidencia de comunidad ni de validacion independiente.
- Fecha de creacion futura (2026-11-28): metadato anomalo que sugiere posible error de publicacion.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-tp3
- Modelo base: https://huggingface.co/danyloooah/reax-g2-soup2
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
