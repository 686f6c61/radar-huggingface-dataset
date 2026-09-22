# ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-8bit

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-8bit es una conversión cuantizada a 8 bits del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario ddalcu para su motor de inferencia mlx-serve. No se trata por tanto de un modelo entrenado desde cero, sino de un artefacto de despliegue: el checkpoint original de Xiaomi (organización XiaomiMiMo) se ha convertido al formato MLX con cuantización affine de 8 bits y tamaño de grupo 64, manteniendo la torre de visión y los embeddings de tokens en bf16 para preservar la entrada de imágenes.

El modelo base, por su nomenclatura, apunta a un proceso de destilación de la familia MiMo-V2.6 sobre una arquitectura Qwen 3.5 de aproximadamente 9.400 millones de parámetros. El repositorio declara la arquitectura como `qwen3_5` y la etiqueta `image-text-to-text`, lo que implica un transformer multimodal con capacidad de procesar imagen y texto, orientado a flujos agénticos y uso de herramientas. El conteo real de parámetros en los ficheros safetensors es de 9.409.813.744.

Su relevancia es práctica: permite ejecutar localmente en Apple Silicon un modelo multimodal de ~9,4B con modo de razonamiento (thinking), tool calling y streaming, sin necesidad de GPU dedicada. El coste es que se trata de una cuantización de 8 bits sobre la que no se han publicado evaluaciones propias, y cuyos términos de licencia e idiomas soportados no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (`qwen3_5`), transformer multimodal con torre de visión (pipeline `image-text-to-text`) |
| Parametros totales | 9.409.813.744 (dato real de los safetensors) |
| Parametros activos | no disponible (no se especifica una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits affine con group size 64; torre de visión y embeddings de tokens mantenidos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio remite a los términos del modelo original) |
| Formato de pesos | safetensors en formato MLX; tamano del repositorio 11,4 GB |
| Libreria / runtime | mlx (mlx-serve) |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (relacion: cuantizado) |

## Arquitectura y entrenamiento

La información disponible describe únicamente la conversión, no el entrenamiento. Se sabe que el checkpoint subyacente usa la arquitectura identificada como `qwen3_5`, que el repositorio es una cuantización de 8 bits (affine, group size 64) y que la torre de visión y los embeddings de tokens se han dejado en bf16, presumiblemente porque son los componentes más sensibles a la cuantización en modelos multimodales. El pipeline declarado es `image-text-to-text`, de modo que el modelo acepta entradas de imagen además de texto.

El autor indica que el checkpoint original no incluye cabeza MTP (multi-token prediction), por lo que esta conversión no ofrece decodificación especulativa MTP. Tampoco se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. El nombre "Distill-Qwen-9B" sugiere un proceso de destilación desde un modelo MiMo-V2.6 mayor hacia una arquitectura Qwen de ~9B, pero este extremo no está confirmado en la documentación del repositorio.

## Capacidades

- Generación de texto conversacional y multimodal: el pipeline es `image-text-to-text`, por lo que acepta imágenes junto a texto como entrada.
- Modo de razonamiento (thinking): el autor confirma que el modo thinking está probado y funciona.
- Tool calling / function calling: probado y funcional según la model card.
- Flujos agénticos: etiquetado explícitamente como `agentic` y `tool-use`, orientado a tareas multi-paso con herramientas.
- Streaming de tokens: probado y funcional en mlx-serve.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Capacidades multilingües: no disponible.
- No dispone de decodificación especulativa MTP (el checkpoint upstream no incluye esa cabeza).
- Capacidades de audio, voz o generación de imagen: no disponibles.

## Casos de uso

- Asistentes locales de escritorio en macOS: el modelo puede ejecutarse íntegramente en un Mac con memoria unificada mediante mlx-serve, lo que permite construir asistentes conversacionales con modo thinking sin enviar datos a servicios externos, algo relevante para entornos con requisitos de privacidad.
- Agentes con uso de herramientas en local: gracias al soporte probado de tool calling, se puede integrar como motor de decisión que invoca funciones (consultas a bases de datos, APIs internas, ejecución de scripts) dentro de un bucle agéntico en la propia máquina del desarrollador.
- Análisis de capturas de pantalla y documentos escaneados: al aceptar entrada de imagen, sirve para extraer y resumir información de capturas, diagramas o formularios, generando después texto estructurado o llamadas a herramientas con los datos extraídos.
- Prototipado rápido de aplicaciones multimodales: al ser un único fichero de 11,4 GB en safetensors MLX, permite iterar sobre prompts y flujos de razonamiento en un portátil antes de decidir el despliegue definitivo en servidor.
- Automatización de tareas de oficina con entrada visual: transcripción y resumen de imágenes de reuniones, pizarras o presentaciones, combinando percepción visual con generación de texto y llamadas a herramientas de calendario o gestor de tareas.
- Evaluación comparativa de destilaciones: útil como punto de comparación frente a otras conversiones del mismo modelo base (bf16 o 4 bits) para medir la pérdida de calidad introducida por la cuantización de 8 bits en tareas de razonamiento y de visión.
- Teleoperación de agentes sobre datos sensibles: en ámbitos como sanidad o legal, donde no se puede enviar contenido a una API externa, el modelo puede desplegarse en hardware propio con la salvedad de que la licencia del modelo original debe verificarse antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de la conversión no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y la búsqueda web asociada no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a páginas sobre el estado de Nuevo México y no guardan relación con esta ficha).

## Requisitos de hardware

- El repositorio pesa 11,4 GB, por lo que los pesos en 8 bits ocupan aproximadamente esa cantidad; a ello hay que sumar la caché KV y el espacio de trabajo del runtime.
- Memoria unificada recomendada: 16 GB como mínimo ajustado, 24-32 GB para trabajar con contextos largos, imágenes y varias conversaciones simultáneas.
- Hardware compatible: exclusivamente Apple Silicon (familia M), ya que el formato es MLX. No se ejecuta directamente en GPU NVIDIA o AMD sin una conversión previa a otro formato.
- Equipos razonables: MacBook Pro o Mac Studio con M1 Pro/Max o superiores y 16 GB o más de memoria unificada; los chips con mayor ancho de banda de memoria (Max/Ultra) ofrecen mejor throughput.
- No cabe en GPUs de consumo tipo RTX 4090 en su formato MLX actual; para CUDA habría que reconvertir los pesos a safetensors estándar o GGUF.
- Opciones de despliegue: mlx-serve (`mlx-serve pull` y `mlx-serve run`), y en general el ecosistema MLX (mlx-lm, LM Studio con backend MLX). vLLM, TGI y llama.cpp/Ollama no soportan estos pesos tal cual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-8bit (esta ficha) | 9,41B | no disponible | MLX 8 bits, mlx-serve | no disponible | HuggingFace, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (upstream) | ~9,4B (mismo modelo base) | no disponible | safetensors completos | no disponible | HuggingFace |
| Otras cuantizaciones MLX del mismo modelo base | no disponible | no disponible | MLX (4 bits u otras) | no disponible | no confirmado en la informacion |
| Alternativas densas de ~8-9B de la misma categoria (por ejemplo Qwen3-8B o Llama-3.1-8B) | ~8B | no disponible en esta busqueda | safetensors, GGUF, MLX | depende del modelo (Apache-2.0 en algunos casos, licencias comunitarias en otros) | ampliamente disponibles |

La comparación cuantitativa con alternativas no puede completarse porque no hay benchmarks publicados en la información disponible ni datos de la búsqueda web que permitan contrastar rendimiento.

## Limitaciones y advertencias

- La licencia no está indicada en el repositorio; el autor remite a los términos del modelo original. Antes de cualquier uso comercial es imprescindible consultar la licencia de XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B.
- Es una cuantización de 8 bits: introduce pérdida de precisión frente al checkpoint bf16, especialmente perceptible en tareas de razonamiento largo y en tareas de visión.
- No hay benchmarks publicados para esta conversión, por lo que se desconoce la degradación real respecto al modelo original.
- No se dispone de la lista de idiomas soportados; el comportamiento fuera del inglés (y posiblemente del chino) es incierto.
- Se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos o conversaciones extensas sin pruebas previas.
- No hay decodificación especulativa MTP, de modo que la latencia por token dependerá enteramente del runtime.
- Riesgo de alucinación inherente a los modelos generativos, no mitigado por ningún mecanismo documentado en esta conversión.
- La torre de visión y los embeddings se mantienen en bf16, lo que aumenta ligeramente el consumo de memoria respecto a una cuantización uniforme.
- El repositorio registra 0 descargas y 0 likes, por lo que carece de validación comunitaria y de informes de uso en producción.
- El soporte está limitado al ecosistema MLX y Apple Silicon; no hay rutas oficiales para CUDA, ROCm o CPU x86 sin reconversión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-8bit
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Motor de inferencia mlx-serve: https://github.com/ddalcu/mlx-serve
- Paper, blog o demo oficial del modelo base: no disponible en la informacion proporcionada
- Resultados de benchmarks: no disponible
