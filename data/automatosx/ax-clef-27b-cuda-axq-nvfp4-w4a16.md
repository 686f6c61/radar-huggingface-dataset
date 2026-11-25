# AutomatosX/AX-Clef-27B-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-Clef-27B-CUDA-AXQ-NVFP4-W4A16 es un checkpoint de desarrollo publicado por AutomatosX que cuantiza el modelo Cloudflare/clef a NVFP4 con la herramienta propia AXQuant. No se trata de un modelo de chat al uso: Clef es un modelo de decisión que recibe un estado y un esquema de preguntas tipadas (`noul`, `choice`, `score`) y devuelve, en un único prefill, una probabilidad para cada opción permitida. Este pack conserva ese comportamiento en las capas de lenguaje, pero no ejecuta la cabeza de esquema conjunto (`joint_head`), que se mantiene en BF16 sin cuantizar.

El modelo base tiene 27.356.728.560 parámetros (unos 27,4 mil millones) y se distribuye bajo licencia Apache-2.0. La cuantización es de tipo RTN (round-to-nearest) NVFP4 con pesos E2M1, escalas de bloque E4M3FN de tamaño 16 y una escala global inversa en FP32; las activaciones permanecen en BF16 (W4A16). El paquete usa el formato público compressed-tensors NVFP4 y está serializado con el backend `torch-cuda`.

Es relevante ahora porque demuestra la viabilidad de comprimir a 4 bits un modelo de decisión de 27B para despliegue en CUDA con NVFP4, pero el propio autor lo etiqueta explícitamente como evidencia de desarrollo y no como certificado de calidad: anuncia una reconstrucción con la versión mejorada de AXQuant y advierte de que no se reclama paridad con el checkpoint BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5), con cabeza de esquema conjunto separada en BF16 |
| Parametros totales | 27.356.728.560 (27,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos E2M1, escalas de bloque E4M3FN de 16, escala global inversa FP32); activaciones BF16; sin AWQ ni cuantización de activaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout compressed-tensors NVFP4; serialización `torch-cuda` |
| Tamano del repo | 20,0 GB |
| Modelo base | Cloudflare/clef (commit `0b331204bb13fbd2ca93a64df1956f5b55478ce5`) |
| Modalidad | image-text-to-text (según tags) / text-generation (pipeline) |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef es un transformer de aproximadamente 27,4 mil millones de parámetros etiquetado con la familia `qwen3_5` y modalidad image-text-to-text. Su rasgo diferencial no es la generación de texto libre sino la evaluación de decisiones: una petición se modela como un estado más un esquema de preguntas tipadas (`noul`, `choice`, `score`), y un único prefill produce la probabilidad de cada opción permitida. La cabeza de esquema conjunto (`joint_head.safetensors`, `joint_schema_model.py`, `joint_head_config.json`) se conserva en BF16 sin cambios respecto al original y queda fuera del índice de lenguaje.

Este checkpoint concreto no aporta entrenamiento nuevo: es una cuantización post-entrenamiento realizada con AXQuant mediante RTN (round-to-nearest), sin AWQ. Las matrices de atención y MLP elegibles del modelo de lenguaje se comprimen a NVFP4 (E2M1 con escalas de bloque E4M3FN de 16 y escala global inversa FP32), mientras que visión, normas, embeddings de tokens y LM head permanecen en la precisión de origen. No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo base en la información disponible.

## Capacidades

- Evaluación de decisiones estructuradas: dado un estado y un esquema de preguntas tipadas, devuelve probabilidades por opción en un solo prefill.
- Tipos de pregunta soportados: `noul` (sin opciones), `choice` (elección entre opciones) y `score` (puntuación).
- Procesamiento image-text-to-text según los tags del repositorio (herencia del modelo base).
- Generación de texto declarada en el pipeline (`text-generation`), aunque el autor subraya que Clef no es un modelo de chat.
- Cabeza de esquema conjunto en BF16 disponible como artefacto separado, no ejecutada por el pipeline de generación de texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio especial: no disponible salvo la modalidad image-text-to-text indicada.

## Casos de uso

- Enrutamiento de decisiones en pipelines: usar el modelo para asignar probabilidades a opciones predefinidas (por ejemplo, clasificar una incidencia en una categoría cerrada) aprovechando que un único prefill devuelve la distribución completa sobre las opciones permitidas.
- Puntuación de alternativas (`score`): ordenar candidatos en sistemas de recomendación o ranking interno asignando una puntuación calibrada a cada uno dentro de un esquema tipado.
- Validación de formularios y extracción estructurada: plantear preguntas `choice` sobre campos de un documento para obtener probabilidades por valor permitido, útil en procesos de revisión con umbral de confianza.
- Moderación o triaje con salida probabilística: integrar la probabilidad por opción como señal para decidir si se escala a revisión humana, en lugar de depender de una respuesta de texto libre.
- Evaluación comparativa de cuantizaciones: al ser un checkpoint de desarrollo NVFP4, sirve para medir en CUDA el impacto de la compresión 4 bits frente al BF16 original en tareas de decisión (sin asumir paridad, según advierte el autor).
- Investigación sobre modelos de decisión: reproducir el esquema de preguntas tipadas y la cabeza conjunta en BF16 para estudiar calibración y comportamiento probabilístico en dominios cerrados.
- Despliegue con memoria reducida: el empaquetado NVFP4 de 20 GB permite alojar un modelo de 27B en GPUs con menos VRAM que la versión BF16, manteniendo las activaciones en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que este paquete es evidencia de desarrollo y que no reclama paridad con el checkpoint BF16 de origen.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20,0 GB en NVFP4 W4A16; a ello hay que sumar activaciones BF16, caché KV y la cabeza de esquema en BF16, por lo que el consumo real será superior al tamaño de los pesos.
- GPUs recomendadas: se requiere hardware con soporte NVFP4 (familia Blackwell, p. ej. B200) para explotar el formato; en GPUs sin soporte nativo NVFP4 el rendimiento puede degradarse o requerir emulación.
- Cabe en GPU de consumo: no disponible con certeza; el formato NVFP4 y el backend `torch-cuda` apuntan a GPUs profesionales con soporte de 4 bits, no a tarjetas consumer convencionales.
- Opciones de despliegue: transformers con backend CUDA (`torch-cuda`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Clef-27B-CUDA-AXQ-NVFP4-W4A16 | 27,4 B | no disponible | NVFP4 W4A16 | Apache-2.0 | Checkpoint de desarrollo, modelo de decisión |
| Cloudflare/clef (BF16) | 27,4 B | no disponible | BF16 | Apache-2.0 | Modelo base de referencia, cabeza conjunta incluida |
| Alternativas de decisión de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de desarrollo: el autor lo describe como evidencia de desarrollo, no como certificado de calidad ni Decision Index certificate.
- Sin paridad garantizada con el BF16 original: no se reclama equivalencia de resultados frente al checkpoint upstream.
- Reconstrucción anunciada: el pack se reconstruirá con la versión mejorada de AXQuant y se reemplazará como nueva revisión; conviene fijar un commit si se depende de los ficheros actuales.
- No es un modelo de chat: usarlo como generador conversacional se aparta de su diseño y puede producir resultados poco fiables.
- La cabeza de esquema conjunto no se ejecuta en el pipeline de generación de texto y no está cuantizada; su uso requiere cargarla por separado.
- Idiomas soportados no documentados: riesgo de comportamiento irregular fuera de los idiomas del modelo base.
- Sesgos y alucinación: no hay información publicada específica; al tratarse de un modelo probabilístico sobre opciones cerradas, el riesgo se traslada a la calibración de las probabilidades.
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse LICENSE y NOTICE del repositorio para obligaciones de atribución.
- Requiere hardware con soporte NVFP4 para un rendimiento adecuado; el soporte de herramientas de despliegue estándar no está documentado.

## Enlaces

- [Hugging Face: AutomatosX/AX-Clef-27B-CUDA-AXQ-NVFP4-W4A16](https://huggingface.co/AutomatosX/AX-Clef-27B-CUDA-AXQ-NVFP4-W4A16)
- [Modelo base: Cloudflare/clef](https://huggingface.co/Cloudflare/clef)
- [Commit del modelo base](https://huggingface.co/Cloudflare/clef/tree/0b331204bb13fbd2ca93a64df1956f5b55478ce5)
- Paper, blog, repositorio o demo de AXQuant: no disponible en la información proporcionada.
