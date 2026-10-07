# josand/NV-Reason-CT-MLX

## Resumen

NV-Reason-CT-MLX es un port no oficial a MLX de los pesos de nvidia/NV-Reason-CT, un modelo de razonamiento multimodal orientado a imagen médica (tomografía computarizada, CT) con pipeline `image-text-to-text`. Lo publica el desarrollador independiente Joseph Sandoval (usuario `josand`) y su único propósito es permitir la ejecución del modelo original de NVIDIA sobre Apple Silicon mediante el framework MLX, ampliando así el hardware en el que se puede hacer investigación con este modelo sin depender de GPUs NVIDIA.

El repositorio contiene 35 shards que suman 17,4 GB, resultado de una expansión exacta de BF16 a FP32 de los pesos originales, sin reentrenamiento ni ajuste adicional. El modelo subyacente se apoya en la arquitectura de la familia Qwen3.5 (etiqueta `qwen3_5`) y conserva las capacidades de conversación y de razonamiento multi-paso del checkpoint de NVIDIA.

Su relevancia es acotada pero clara: es una vía práctica para reproducir y estudiar un modelo de razonamiento aplicado a imagen médica en un portátil o estación de trabajo Mac, siempre en el ámbito de investigación y educación. El propio autor advierte que no está destinado a diagnóstico clínico ni a decisiones de tratamiento, y que las salidas requieren revisión humana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basada en la familia Qwen3.5; etiqueta `qwen3_5`; requiere `custom_code` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (expandido desde BF16); no se documentan cuantizaciones adicionales en el repositorio |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 (OpenMDW-1.1; términos subyacentes de Qwen3.5 bajo Apache-2.0) |
| Formato de pesos | MLX (35 shards, 17,4 GB en total) |
| Pipeline | image-text-to-text |
| Modelo base | nvidia/NV-Reason-CT (fine-tune/port) |
| Libreria | mlx |
| Tamano del repositorio | 17,4 GB |
| Descargas / likes | 0 / 0 |

Nota: el tamaño del repositorio (17,4 GB en FP32, es decir 4 bytes por parámetro) sería coherente con un modelo de aproximadamente 4.300 millones de parámetros, pero este dato no se confirma en la información disponible.

## Arquitectura y entrenamiento

El modelo original, nvidia/NV-Reason-CT, es un modelo de razonamiento multimodal que acepta imágenes de tomografía computarizada junto con texto y genera respuestas en formato conversacional. La etiqueta `qwen3_5` y la mención explícita a los términos Apache-2.0 de Qwen3.5 indican que el backbone es de la familia Qwen3.5, sobre el que NVIDIA habría aplicado su propio entrenamiento o ajuste orientado a razonamiento y a imagen médica. El repositorio de este port no aporta detalles adicionales sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

El trabajo de `josand` no es un entrenamiento, sino una conversión de formato: se toma el checkpoint BF16 de NVIDIA y se expande de forma exacta a FP32, preservando los valores numéricos, y se empaqueta en 35 shards compatibles con MLX. El autor indica que todos los hashes de pesos y cuatro casos de preprocesado en CPU están verificados, mientras que la inferencia GPU en un entorno independiente está pendiente de validación. No hay, por tanto, innovaciones de arquitectura propias de este port; la única particularidad técnica es que el modelo requiere código personalizado (`custom_code`) y, al usar MLX, depende del soporte de vision-language de ese ecosistema.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con historial de conversación.
- Entrada multimodal de imagen y texto: procesa estudios de tomografía computarizada junto a instrucciones en lenguaje natural.
- Razonamiento explícito sobre contenido de imagen médica (la nomenclatura "Reason" del modelo base apunta a cadenas de razonamiento antes de la respuesta final).
- Interpretación de hallazgos y descripción de estructuras anatómicas en CT, según el propósito del modelo original de NVIDIA.
- Preprocesado de imagen en CPU verificado para cuatro casos de prueba, según la documentación del autor.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA.
- Capacidades de tool calling, function calling o uso agéntico: no disponible en la información proporcionada.
- Soporte multilingüe: solo inglés (`en`).
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Investigación en razonamiento multimodal médico: reproducir experimentos del modelo NV-Reason-CT sobre un Mac para estudiar cómo razona el modelo ante imágenes de CT, comparando sus cadenas de razonamiento con las del checkpoint original en BF16.
- Formación de residentes de radiología: usar el modelo como generador de descripciones comentadas de estudios anonimizados, siempre con supervisión de un radiólogo y nunca como fuente de diagnóstico.
- Anotación asistida de datasets de investigación: pre-etiquetar hallazgos en volúmenes de CT para acelerar la revisión manual posterior por parte de un especialista.
- Control de calidad de adquisiciones: generar descripciones automáticas de estudios y detectar casos en los que la salida del modelo es incoherente o de baja confianza, señalando adquisiciones que conviene revisar.
- Prototipado local sin GPU dedicada: desarrollar y depurar interfaces o pipelines de visión-lenguaje en un entorno de desarrollo Mac antes de portarlos a un clúster con GPUs NVIDIA para la validación a escala.
- Docencia y experimentación en cursos de IA médica: ilustrar el comportamiento de un modelo de razonamiento visual sobre datos de CT, con la ventaja de que los pesos se ejecutan localmente y no exigen enviar imágenes a servicios externos.
- Evaluación de robustez y sesgos: ejecutar conjuntos de pruebas controlados sobre el modelo para medir cómo varían sus respuestas ante cambios de redacción del prompt o ante artefactos de imagen, en un contexto puramente académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas tipo MMLU, HumanEval, GSM8K ni evaluaciones específicas de imagen médica. La única información de validación aportada por el autor es cualitativa: los hashes de todos los pesos y cuatro casos de preprocesado en CPU están verificados, mientras que la inferencia GPU independiente está pendiente. Se enlazan dos ficheros de evidencia: `standalone-verification.json` y `fp32-engineering-qualification.json`.

## Requisitos de hardware

- Memoria: los pesos en FP32 ocupan 17,4 GB, por lo que se necesita memoria unificada suficiente para pesos, activaciones y caché KV. En la práctica, un mínimo razonable es 24 GB de memoria unificada, y 32 GB o más para trabajar con imágenes de mayor resolución o contextos largos.
- Equipos compatibles: Apple Silicon con MLX. Macs con chip Pro de 24-36 GB pueden ser suficientes en configuraciones ajustadas; los chips Max y Ultra (64-128 GB) ofrecen margen holgado.
- GPU NVIDIA: no aplica a este repositorio, que es específico de MLX. Para el checkpoint original de NVIDIA se usarían GPUs CUDA, pero este port no documenta ese escenario.
- GPU de consumo (RTX 4090, etc.): no soportado por este repositorio, ya que MLX está diseñado para Apple Silicon.
- Opciones de despliegue: MLX, a través del ecosistema de visión-lenguaje de MLX (el autor enlaza las instrucciones de instalación y ejecución en su repositorio de GitHub). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama; una conversión a GGUF sería posible en teoría, pero requeriría trabajo adicional no incluido aquí.
- Código personalizado: el tag `custom_code` implica que la carga en Transformers exige `trust_remote_code=True`, con la consiguiente revisión del código antes de ejecutarlo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Benchmarks |
|---|---|---|---|---|---|---|
| josand/NV-Reason-CT-MLX | no disponible | no disponible | MLX, FP32, 35 shards, 17,4 GB | openmdw-1.1 | Apple Silicon (MLX) | no disponible |
| nvidia/NV-Reason-CT (modelo base) | no disponible | no disponible | no disponible (BF16 según la card del port) | openmdw-1.1 | GPUs CUDA | no disponible |
| Backbone de la familia Qwen3.5 | no disponible | no disponible | no disponible | Apache-2.0 (términos subyacentes) | según variante | no disponible |

No se dispone de datos verificados de otros modelos comparables de razonamiento sobre imagen médica en la información proporcionada, por lo que no se incluyen alternativas adicionales. Cualquier comparación numérica entre este port y el checkpoint original de NVIDIA sería engañosa: la conversión a FP32 duplica el tamaño en disco y en memoria respecto a BF16, pero no altera los resultados de forma significativa más allá del redondeo numérico.

## Limitaciones y advertencias

- Uso clínico prohibido: el propio autor indica que el modelo está pensado para investigación y educación, no para diagnóstico clínico ni para decisiones de tratamiento. Las salidas requieren revisión humana.
- Riesgo de alucinación: al tratarse de un modelo generativo aplicado a imagen médica, puede describir hallazgos inexistentes o interpretar mal estructuras anatómicas. Cualquier uso debe incorporar verificación por un profesional cualificado.
- Validación incompleta: la inferencia GPU independiente está pendiente de verificación según la propia documentación del repositorio, así que el comportamiento en producción no está confirmado.
- Idioma: solo inglés. No hay soporte declarado de castellano, lo que limita su uso directo en entornos clínicos hispanohablantes.
- Idiomas y dominio: el modelo está especializado en CT; no debe esperarse buen rendimiento en otras modalidades de imagen médica (resonancia, radiografía simple, ecografía) sin evidencia adicional.
- Licencia: OpenMDW-1.1, con copyright de NVIDIA Corporation & Affiliates. Es una licencia específica para modelos de IA; conviene revisar sus condiciones antes de cualquier uso comercial, ya que no equivale a Apache-2.0. Los términos subyacentes de Qwen3.5 sí son Apache-2.0.
- Naturaleza no oficial: es un port de la comunidad, no una publicación de NVIDIA. No hay garantía de soporte, mantenimiento ni actualizaciones.
- Riesgo de seguridad: el repositorio requiere cargar código personalizado (`custom_code`), por lo que se recomienda auditar dicho código antes de ejecutarlo en entornos sensibles.
- Sesgos: no disponible. El repositorio no documenta análisis de sesgos demográficos, de equipamiento o de protocolo de adquisición.
- Datos personales: al trabajar con imágenes médicas, es imprescindible garantizar el anonimizado y cumplir la normativa aplicable de protección de datos antes de procesar cualquier estudio.
- Adopción mínima: cero descargas y cero likes en el momento de la consulta, lo que indica que el port no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/josand/NV-Reason-CT-MLX
- Repositorio GitHub del port (instrucciones de instalación y ejecución): https://github.com/sandovaljoseph/NV-Reason-CT-MLX
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NV-Reason-CT
- Model card del modelo original incluida en el repositorio: `upstream_model_card.md`
- Evidencia de verificación independiente: `standalone-verification.json`
- Evidencia de la conversión a FP32: `fp32-engineering-qualification.json`
- Licencia OpenMDW-1.1: `LICENSE` (Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES)
- Términos Apache-2.0 del backbone Qwen3.5: `APACHE-2.0.txt`

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre NV-Reason-CT; los resultados obtenidos eran contenido no relacionado y de naturaleza spam, por lo que no se incluyen. No se han localizado papers, blogs, demos ni repositorios adicionales en la información disponible.
