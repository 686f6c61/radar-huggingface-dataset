# DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-bf16

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MLX-bf16 es una conversión de formato, no un entrenamiento nuevo. El autor (DJLougen) ha tomado el checkpoint público XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, en la revisión f2773fb482ac3dd047a4af4003b86e56b7225d0d, y lo ha convertido a safetensors en formato MLX manteniendo los pesos en BF16, sin cuantización. El modelo original es, según la propia model card, un ajuste supervisado (SFT) de Qwen/Qwen3.5-9B sobre datos de agente generados por MiMo, cubriendo código, tareas de agente generales, codificación visual y ciberseguridad.

Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Qwen3_5ForConditionalGeneration: 32 capas de texto, hidden de 4096, 16 cabeceras de consulta y 4 de clave/valor, atención completa en una de cada cuatro capas, y una torre de visión de 27 capas con hidden 1152 y parches de 16. El checkpoint declara una ventana de contexto de 262.144 tokens. El recuento real de parámetros en safetensors es de 9.409.813.744, con un repositorio de 18,8 GB.

Su relevancia es acotada: permite ejecutar un modelo de 9,4 B multimodal con contexto muy largo en el ecosistema MLX (orientado a Apple Silicon, aunque la conversión se hizo con la rueda CUDA 13 de mlx sobre una NVIDIA GB10). No obstante, el repositorio tiene 0 descargas y 0 likes, no declara licencia, no incluye benchmarks y solo aporta un smoke test de una generación por build.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`); atención completa en 1 de cada 4 capas |
| Parámetros totales | 9.409.813.744 (dato real de los safetensors) |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 262.144 tokens (config declarada del checkpoint de origen) |
| Tipos de cuantización | BF16 sin cuantización en este repositorio; el mismo conversor publica builds mixtos (mixed-3-5, mixed-3-6, mixed-3-8, mixed-4-6, mixed-4-8) con grupo de 64 y modo affine |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni la model card de este repositorio ni la del checkpoint upstream la declaran) |
| Formato de pesos | safetensors MLX, BF16 (760 tensores) |
| Capas de texto | 32 (hidden 4096, 16 cabeceras Q / 4 cabeceras KV) |
| Torre de visión | Qwen3.5 vision tower, profundidad 27, hidden 1152, parche 16 |
| Tamaño del repositorio | 18,8 GB |
| Pipeline | image-text-to-text |
| Librería | mlx |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso con decodificador de texto y torre de visión. En texto: 32 capas, dimensión oculta 4096, 16 cabeceras de consulta y 4 de clave/valor (GQA con ratio 4:1), con atención completa únicamente en una de cada cuatro capas, lo que sugiere un esquema híbrido para el resto. La configuración declara 262.144 tokens de contexto. La torre de visión tiene 27 capas, hidden 1152 y tamaño de parche 16, y el chat template es el de MiMo v2.6, distribuido en `chat_template.jinja`. La plantilla admite el parámetro `enable_thinking`.

No hay entrenamiento nuevo en este repositorio. Según la model card, el checkpoint upstream es un SFT de Qwen/Qwen3.5-9B sobre datos de agente generados por MiMo (código, tareas de agente generales, codificación visual, ciberseguridad). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La conversión se realizó con mlx-vlm 0.7.2 y mlx 0.32.2 (rueda CUDA 13) sobre una máquina spark-d500 con NVIDIA GB10, verificando previamente que los cuatro shards de origen coincidían con los hashes SHA-256 de LFS del Hub. No se añadió decodificación especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla propia (`chat_template.jinja` de MiMo v2.6).
- Entrada de imagen: el pipeline declarado es image-text-to-text y el smoke test con imagen respondió correctamente ("Red" a la pregunta por el color de un cuadrado rojo de 64x64), aunque ese smoke solo se ejecutó sobre el build mixed-4-6, no sobre este BF16.
- Modo de razonamiento: la plantilla soporta `enable_thinking`; en los builds mixed-3-6 y mixed-3-8 se emitió un bloque de pensamiento antes de la respuesta, incluso cerrando el pensamiento en el prompt.
- Aritmética básica: respondió "36" al prompt "What is 15% of 240?" en una generación greedy de 64 tokens.
- Capacidades de agente y código: el upstream describe el ajuste sobre datos de agente (código, tareas de agente generales, codificación visual, ciberseguridad), pero no se aporta verificación independiente de tool calling, function calling ni razonamiento multi-paso.
- Multilingüismo: no disponible.

## Casos de uso

- Automatización de tareas de interfaz gráfica: el modelo acepta imágenes y procede de un ajuste con datos de codificación visual y tareas de agente, por lo que encaja como núcleo de un agente que interprete capturas de pantalla y proponga la siguiente acción. Requiere validación propia, ya que el smoke con imagen solo se probó en otro build.
- Revisión de código asistida sobre repositorios grandes: con 262.144 tokens de contexto se puede cargar un conjunto amplio de ficheros en una sola ventana y pedir análisis cruzados sin trocear el contexto en exceso.
- Análisis de documentos extensos con ilustraciones: informes técnicos, manuales o patentes con figuras, usando la torre de visión para las imágenes y el contexto largo para el texto.
- Prototipado local en Apple Silicon con MLX: al ser un único repositorio BF16 sin cuantización, sirve como referencia de calidad frente a los builds mixtos del mismo autor en experimentos de cuantización.
- Auditoría de seguridad de código: el upstream menciona datos de ciberseguridad, de modo que el modelo puede emplearse para triaje inicial de patrones sospechosos, siempre con revisión humana.
- Descripción de imágenes para accesibilidad: generación de texto alternativo o descripciones de contenido visual en un pipeline image-text-to-text, ejecutado en local para no enviar datos a servicios externos.
- Evaluación de infraestructura de conversión: este repositorio documenta el pipeline completo (hashes, versiones de mlx-vlm/mlx, smoke reproducible en `smoke-results.json`), lo que lo hace útil como caso de estudio para validar conversiones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los números de benchmark del upstream no se volvieron a ejecutar, y que no se realizó ninguna medición de perplejidad. Lo único disponible es un smoke test de una generación greedy por build (`max_tokens=64`, `temperature=0.0`, pensamiento desactivado en el prompt), que no constituye una evaluación de rendimiento:

| Build | Tipo de entrada | Pasa | Salida |
|---|---|---|---|
| bf16 | texto | sí | `36` |
| mixed-3-5 | texto | sí | `<value>36</value>` |
| mixed-3-6 | texto | sí | bloque de pensamiento y después `36` |
| mixed-3-8 | texto | sí | bloque de pensamiento y después `36` |
| mixed-4-6 | texto | sí | `36` |
| mixed-4-6 | imagen | sí | `Red` |
| mixed-4-8 | texto | sí | `36` |

Las diferencias de formato en la salida (etiquetas `<value>` en mixed-3-5, bloque de pensamiento en mixed-3-6 y mixed-3-8) se documentan en la model card como diferencias de calidad en ese único prompt, no como fallos de carga.

## Requisitos de hardware

- VRAM para BF16: 18,8 GB solo en pesos; hay que sumar overhead del runtime y caché KV, por lo que un presupuesto realista es de 22 GB o más.
- Estimación de caché KV: con 32 capas, 4 cabeceras KV y dimensión de cabecera 256 (4096/16), el cálculo teórico da unos 128 KiB por token, es decir unos 33 GB para los 262.144 tokens completos. La configuración indica atención completa solo en 1 de cada 4 capas, por lo que la cifra real debería ser inferior. Estimación no verificada.
- Caché KV en builds cuantizados: no calculable con los datos aportados; se reduciría proporcionalmente según la cuantización aplicada a las capas de atención.
- GPU: la conversión se realizó sobre una NVIDIA GB10 (spark-d500) con la rueda CUDA 13 de mlx, lo que confirma ejecución en ese entorno. Para BF16 encajan GPUs de 24 GB o más (RTX 3090, RTX 4090, A100 40/80 GB, H100) con margen ajustado en las de 24 GB si se usa contexto largo.
- GPU de consumo: un RTX 4090 o RTX 3090 de 24 GB puede cargar los pesos BF16, pero el contexto largo queda limitado por la caché KV. En GPUs de 16 GB no cabe en BF16 sin cuantizar.
- Apple Silicon: es el destino natural de MLX. Con 18,8 GB de pesos BF16 se recomienda memoria unificada de 32 GB o más; los builds mixtos del mismo autor (4 bits de ancho base) bajarían el requisito a la franja de 16-24 GB, estimación no confirmada en la documentación.
- Despliegue: mlx-vlm es el único runtime documentado, con el ejemplo de `load` + `apply_chat_template` + `generate`. No se incluyen pesos GGUF ni safetensors en formato HuggingFace estándar, por lo que vLLM, TGI, llama.cpp u Ollama requerirían una conversión no incluida en este repositorio.
- Latencia y throughput: no disponibles. La model card indica expresamente que no se reportan tasas de decodificación ni memoria pico, porque la llamada BF16 fue en frío y las salidas posteriores fueron de 3 a 64 tokens.

## Comparativa con modelos similares

| Aspecto | Este repositorio (MLX BF16) | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | Qwen/Qwen3.5-9B (base) | Builds mixtos del mismo autor |
|---|---|---|---|---|
| Parámetros | 9.409.813.744 (medido) | no disponible en la información | no disponible (el nombre indica 9 B) | mismos pesos de origen |
| Contexto | 262.144 | 262.144 (origen de la config) | no disponible en la información | 262.144 |
| Modalidad | image-text-to-text | image-text-to-text | no disponible en la información | image-text-to-text |
| Formato | safetensors MLX BF16 | pesos originales, formato no especificado | no disponible en la información | safetensors MLX cuantizados (grupo 64, affine) |
| Licencia | no disponible | no declarada | no disponible en la información | no disponible |
| Rendimiento | sin benchmark; smoke correcto | no reevaluado en esta conversión | no disponible | smoke correcto, con diferencias de formato de salida |
| Uso previsto | inferencia local en MLX, referencia sin pérdida de precisión | modelo fuente para SFT y conversiones | base del ajuste | menor huella de memoria en MLX |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento con otros modelos de la misma franja.

## Limitaciones y advertencias

- Licencia no disponible: ni el repositorio ni la model card upstream declaran licencia. El propio autor señala que redistribuye pesos convertidos de un checkpoint público sin licencia declarada, lo que introduce incertidumbre legal para uso comercial. Conviene contactar con el publicador original antes de desplegarlo en producción.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni perplejidad. La única evidencia de funcionamiento es un prompt aritmético y una imagen de un color sólido.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Diferencias de calidad entre builds: en el mismo prompt, mixed-3-5 envolvió la respuesta en `<value>` y mixed-3-6/mixed-3-8 emitieron bloques de pensamiento pese a que el prompt cerraba el pensamiento.
- Cobertura de pruebas desigual: el smoke con entrada de imagen solo se ejecutó en mixed-4-6; no hay verificación de la vía multimodal en este build BF16.
- Capacidades no verificadas: tool calling, function calling, razonamiento multi-paso y multilingüismo no están confirmados por ninguna prueba en la información disponible, solo sugeridos por la descripción del dataset upstream.
- Riesgo de alucinación: no evaluado en la información disponible. Al tratarse de un SFT sobre datos sintéticos de agente, se recomienda validación específica del dominio antes de usarlo en producción.
- Restricción de formato: los pesos solo están en MLX safetensors; no son directamente utilizables en vLLM, TGI, llama.cpp u Ollama sin una conversión adicional.
- Consumo de memoria: 18,8 GB en BF16 más caché KV hacen inviable el contexto completo de 262.144 tokens en GPUs de consumo.
- Fechas de los metadatos: el repositorio figura creado y actualizado el 21 de septiembre de 2026, con menos de quince minutos entre ambos eventos, lo que indica una publicación sin ciclo de revisión posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-bf16
- Checkpoint de origen: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base del ajuste: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro del smoke test: `smoke-results.json`, incluido en el repositorio del autor
- Búsqueda web: no se han encontrado resultados relevantes; las consultas devolvieron únicamente páginas genéricas de Google, sin papers, blogs ni repositorios asociados al modelo.
