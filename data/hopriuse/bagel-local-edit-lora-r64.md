# hopriuse/BAGEL-Local-Edit-LoRA-r64

## Resumen

BAGEL-Local-Edit-LoRA-r64 es un adaptador PEFT de tipo LoRA publicado por el usuario hopriuse sobre el modelo multimodal ByteDance-Seed/BAGEL-7B-MoT. No es un checkpoint autónomo: se trata de un conjunto de pesos de bajo rango (rank 64, alpha 128, dropout 0) que debe cargarse junto con la revisión exacta del modelo base indicada por el autor (`5019f57d168e5816e8f3f701b17cc816bb7cf24b`). Su función es especializar BAGEL en edición local de imágenes, es decir, modificar regiones concretas de una imagen a partir de instrucciones en lenguaje natural sin alterar el resto del contenido.

El adaptador se presenta como una conversión de bajo rango del "Local Edit Teacher" del proyecto del autor, un modelo completo que actúa como autoridad de procedencia. El repositorio publica únicamente el adaptador portable, con un tamaño de 0,3 GB, lo que lo hace muy ligero frente al modelo base de 7B parámetros. La licencia declarada es Apache 2.0, aunque el uso queda condicionado también por la licencia del modelo base BAGEL.

La relevancia de esta ficha es acotada: se trata de un adaptador de investigación con cero descargas y cero likes en el momento de la consulta, sin datos de benchmarks públicos más allá de una evaluación interna congelada del propio autor. Resulta útil para quienes ya trabajan con BAGEL y quieren experimentar con edición local de imágenes sin reentrenar el modelo completo, pero no constituye una solución lista para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal BAGEL-7B-MoT; target en proyecciones de atención y MLP del experto de generación (`moe_gen`) |
| Parametros totales | no disponible (adaptador de 0,3 GB; el modelo base tiene 7B) |
| Parametros activos | no disponible (el base es MoE, pero no se detalla el reparto en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicaría al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta además a la licencia del modelo base BAGEL) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 128 y dropout 0, aplicado sobre las proyecciones de atención y MLP del experto de generación (`moe_gen`) del modelo BAGEL-7B-MoT. BAGEL es un transformer multimodal con mezcla de expertos (MoE) orientado a generación y edición de imágenes, y el adaptador incide únicamente en la rama de generación, dejando intacto el resto del modelo base. El autor indica que se trata de una conversión de bajo rango del "Local Edit Teacher" del proyecto, que permanece como autoridad de procedencia; no se publica el proceso de entrenamiento completo, el volumen de datos ni la composición del dataset.

No se especifica si hubo RLHF, DPO u otra etapa de alineamiento, ni el número de tokens de entrenamiento. La única información de evaluación es una prueba congelada del propio proyecto con 64 muestras globales y 64 locales, puntuadas con el scorer SpatialReward. El autor advierte explícitamente que la comparación pareada entre rangos no fue estadísticamente concluyente con 64 muestras por subconjunto, por lo que los valores deben interpretarse como evidencia de compatibilidad y calidad, no como superioridad frente a otros rangos.

## Capacidades

- Edición local de imágenes: modifica regiones específicas de una imagen de entrada siguiendo instrucciones, manteniendo el resto del contenido.
- Pipeline image-to-image: el adaptador está etiquetado con `pipeline_tag: image-to-image`.
- Especialización sobre BAGEL: hereda las capacidades multimodales del modelo base (comprensión y generación de imágenes), aunque el adaptador solo refuerza la rama de edición local.
- Integración con PEFT: se carga mediante la librería `peft` junto con la revisión exacta del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible más allá de la edición de imágenes sobre BAGEL.

## Casos de uso

- Retoque fotográfico asistido: el adaptador permite modificar un objeto o región concreta de una fotografía mediante una instrucción textual, conservando el resto del encuadre; es adecuado porque su entrenamiento se centra precisamente en edición local.
- Prototipado de herramientas de edición para investigación: equipos que ya usan BAGEL pueden cargar el adaptador con PEFT y evaluar variantes de edición local sin reentrenar el modelo completo, dado su tamaño reducido de 0,3 GB.
- Generación de variantes controladas en datasets sintéticos: se puede aplicar para alterar atributos locales (color, textura, presencia de un objeto) en imágenes de un corpus y ampliar la diversidad de datos de entrenamiento.
- Evaluación de técnicas de fusión de teachers: el adaptador sirve como artefacto reproducible para estudiar multi-Teacher OPD, fusión de teachers y students unificados de generación/edición, que es el marco declarado por el autor.
- Pruebas de compatibilidad de adaptadores: útil para verificar que un pipeline PEFT carga correctamente un LoRA de rango 64 sobre la revisión exacta del base y reproduce las métricas congeladas del autor.
- Docencia y experimentación académica: al ser ligero y de licencia Apache 2.0, permite montar prácticas sobre edición de imágenes con un modelo multimodal de 7B sin disponer de grandes recursos de almacenamiento para el adaptador.

## Benchmarks y rendimiento

| Evaluación | Subconjunto global | Subconjunto local |
|---|---:|---:|
| SpatialReward (evaluación congelada del proyecto, 64 + 64 muestras) | 0,8330256 | 0,8558853 |

El autor indica que ambos valores usan el mismo scorer SpatialReward sobre dos subconjuntos de prompts distintos y no deben interpretarse como dos métricas de especialistas independientes. La comparación pareada entre rangos no fue estadísticamente decisiva con 64 muestras por subconjunto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base BAGEL-7B-MoT y de su cuantización, dato no proporcionado.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en sí ocupa 0,3 GB, pero el modelo base de 7B condiciona el requisito real.
- Opciones de despliegue: carga mediante la librería `peft` sobre el checkpoint de BAGEL; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-Local-Edit-LoRA-r64 | LoRA sobre BAGEL-7B-MoT | Adaptador de 0,3 GB (base 7B) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ByteDance-Seed/BAGEL-7B-MoT | Modelo base multimodal MoE | 7B | no disponible en esta ficha | según modelo base | Hugging Face |
| Otros adaptadores LoRA de edición de imagen sobre BAGEL | LoRA | no disponible | no disponible | variable | no disponible en la información consultada |

No se dispone de datos de rendimiento comparables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargarse junto con la revisión exacta `5019f57d168e5816e8f3f701b17cc816bb7cf24b` de BAGEL-7B-MoT; otras revisiones pueden romper la compatibilidad.
- La evaluación es interna y reducida (64 + 64 muestras); el propio autor advierte que no es estadísticamente concluyente para comparar rangos.
- No hay datos publicados sobre sesgos, tasas de alucinación visual ni comportamiento en dominios distintos al de la evaluación.
- Idiomas soportados no documentados; se desconoce el comportamiento con instrucciones en castellano u otras lenguas.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial queda sujeto también a la licencia del modelo base BAGEL, que debe verificarse por separado.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en producción ni validación por terceros.
- El adaptador solo afecta a la rama de generación (`moe_gen`); no se documentan efectos sobre otras capacidades del modelo base.
- No se especifican requisitos de hardware ni opciones de despliegue optimizadas, lo que dificulta planificar latencia y throughput en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/hopriuse/BAGEL-Local-Edit-LoRA-r64
- Modelo base BAGEL-7B-MoT: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Librería PEFT: https://huggingface.co/docs/peft
