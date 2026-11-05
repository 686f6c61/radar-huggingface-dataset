# MeldhLLC/Olune-Qwen3.5-4B-v1.0

## Resumen

Olune Qwen3.5-4B v1.0 es un ajuste fino (finetune) del modelo Qwen3.5-4B de Alibaba Qwen, publicado por MeldhLLC. Está diseñado específicamente para la reflexión filosófica dentro de la aplicación Olune (olune.ai), un producto de acompañamiento conversacional. El modelo hereda la arquitectura y el tamaño del modelo base, con 4.205.751.296 parámetros totales, y se distribuye únicamente en formato GGUF cuantizado Q4_K_M (2,71 GB) para su uso con llama.cpp.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general ni de una nueva arquitectura, sino de una especialización vertical sobre un modelo base de 4B parámetros. Su interés para desarrolladores e investigadores radica en ser un ejemplo de finetune de nicho (dominio filosófico/conversacional) empaquetado exclusivamente para inferencia local mediante llama.cpp, con licencia Apache 2.0 y un único idioma declarado (inglés).

No se dispone de información publicada sobre el proceso de entrenamiento, la composición del dataset de ajuste, el número de tokens utilizados ni resultados de evaluación. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se listan otras variantes |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un finetune del modelo base Qwen/Qwen3.5-4B, según declara la model card con la relación `base_model_relation: finetune`. No se especifica en la documentación disponible la arquitectura interna del modelo base (tipo de atención, uso de MoE, mecanismos de atención lineal u otras innovaciones), por lo que no es posible detallar más allá de que se trata de un transformer de 4,2B parámetros. Tampoco se indica si el ajuste se realizó mediante SFT, RLHF, DPO u otra técnica, ni el volumen o la composición del dataset de entrenamiento.

La única información técnica adicional es operativa: el modelo requiere un runtime con soporte para GGUF de Qwen3.5 y acepta únicamente entrada de texto. Se distribuye una sola cuantización, Q4_K_M, de 2,71 GB, junto con un fichero de checksum SHA-256 y un aviso de atribución (NOTICE). No se documentan innovaciones técnicas propias del finetune.

## Capacidades

- Generación de texto conversacional orientada a reflexión filosófica, según el propósito declarado por el autor.
- Entrada exclusivamente de texto: no hay soporte de visión, audio ni otras modalidades.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingües limitadas al inglés según el campo `language` de la model card.
- No se documenta modo de razonamiento explícito (thinking mode) ni capacidades matemáticas o de código específicas.
- Integración con endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Aplicación de reflexión filosófica: es el uso previsto por el autor; el modelo se integra en la app Olune para generar respuestas conversacionales de carácter reflexivo, con controles de seguridad gestionados por la propia aplicación y no por los pesos.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF Q4_K_M de 2,71 GB, puede ejecutarse con llama.cpp en equipos sin GPU dedicada de gran capacidad, lo que facilita prototipos offline.
- Diálogo conversacional en inglés de un solo turno o multi-turno: adecuado para interfaces de chat simples donde no se requieran herramientas externas ni contexto muy extenso (longitud de contexto no disponible).
- Prototipado de asistentes de nicho: sirve como base para experimentar con finetunes verticales sobre modelos de 4B y evaluar el coste/beneficio frente al modelo base original.
- Investigación sobre especialización de dominio: permite comparar el comportamiento del finetune frente a Qwen3.5-4B en tareas de reflexión y estilo conversacional, siempre que se disponga del modelo base para la comparación.
- Integración en pipelines de inferencia compatibles con llama.cpp: el formato GGUF y el checksum publicado facilitan su incorporación en entornos de despliegue que ya usan esta librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7-3,5 GB con la cuantización Q4_K_M distribuida (el peso del fichero es 2,71 GB; hay que sumar el overhead de contexto y del runtime).
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU consumer con 6 GB o más de VRAM debería poder cargarlo; no se dispone de datos de throughput ni latencia.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 6-8 GB de VRAM o más, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp (librería declarada); requiere un runtime con soporte para GGUF de Qwen3.5. No se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olune Qwen3.5-4B v1.0 | 4,2B | no disponible | Apache 2.0 | GGUF (Q4_K_M) | Finetune de nicho filosófico, solo inglés |
| Qwen/Qwen3.5-4B (base) | 4,2B | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo base del que deriva; propósito general |
| Alternativas de ~4B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede cometer errores, inventar información y manejar mal el contexto o las correcciones; las afirmaciones importantes deben verificarse.
- No sustituye asesoramiento médico, de salud mental, legal o financiero cualificado; es relevante porque el dominio declarado (reflexión filosófica) puede solaparse con conversaciones sensibles.
- Los controles de seguridad de la app Olune son independientes de estos pesos: desplegar el modelo fuera de la app implica asumir la responsabilidad de las salvaguardas.
- Idioma limitado al inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con conversaciones largas o documentos extensos.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución indicada en el fichero NOTICE.
- Sin datos de benchmarks ni de evaluación de sesgos; no hay evidencia publicada sobre su calidad frente al modelo base.
- Repositorio sin descargas ni interacciones en el momento de la consulta: no existe validación comunitaria observable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v1.0
- Descarga directa GGUF Q4_K_M: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v1.0/resolve/main/olune-qwen35-v1.0-Q4_K_M.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicación Olune: https://olune.ai/
- Licencia Apache 2.0: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v1.0/blob/main/LICENSE
- Atribución: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v1.0/blob/main/NOTICE
- Checksum SHA-256: https://huggingface.co/MeldhLLC/Olune-Qwen3.5-4B-v1.0/blob/main/SHA256SUMS
