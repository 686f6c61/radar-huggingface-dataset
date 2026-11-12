# bmbenterprises/gemma-4-E4B-it-qat-4bit

## Resumen

Gemma 4 E4B IT QAT 4-bit es una conversión al formato MLX de Apple Silicon del modelo Gemma 4 E4B en su variante instruction-tuned (IT) y cuantizada a 4 bits mediante Quantization-Aware Training (QAT). El repositorio publicado por bmbenterprises es un espejo del original de mlx-community, orientado exclusivamente a la inferencia local en equipos Mac con chip de la serie M mediante la librería `mlx-vlm`. El modelo es multimodal: acepta imagen y texto como entrada y genera texto, según indica su pipeline `image-text-to-text`.

El checkpoint contiene 7.941.100.874 parámetros en safetensors (aproximadamente 7,9 mil millones), lo que sitúa al modelo en la gama de tamaño de 8B, aunque la nomenclatura "E4B" del nombre sugiere una variante concreta dentro de la familia Gemma 4 cuyo significado exacto no se detalla en la información disponible. El repositorio ocupa 6,8 GB, coherente con pesos en 4 bits.

La relevancia de esta ficha es acotada: se trata de una conversión comunitaria con cero descargas y cero likes en el momento de la consulta, sin model card propia más allá de las instrucciones de uso de MLX, sin licencia declarada en los metadatos y sin benchmarks publicados. Es útil para quien quiera ejecutar Gemma 4 multimodal en Mac, pero no constituye una referencia canónica del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; transformer multimodal imagen-texto segun pipeline) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (QAT, segun el nombre del repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El pipeline declarado es `image-text-to-text`, lo que implica un codificador visual acoplado a un decodificador de lenguaje, pero no se especifica si el backbone es un transformer denso, un modelo con mezcla de expertos (MoE) ni detalles de atención. La etiqueta "E4B" en el nombre podría indicar una variante concreta de eficiencia dentro de la familia Gemma 4, pero su significado no está documentado en la información disponible.

Respecto al entrenamiento, la model card únicamente confirma que se trata de una variante instruction-tuned (IT) y cuantizada con QAT a 4 bits. No se indican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO u otras etapas de alineamiento, ni innovaciones técnicas específicas. Tampoco se documenta el proceso de conversión a MLX ni las posibles pérdidas de calidad derivadas de la cuantización.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruction-tuned.
- Comprensión de imágenes y respuesta en texto (image-text-to-text), incluyendo descripción de imágenes según el ejemplo de la model card.
- Conversación multi-turno (etiqueta `conversational`).
- Ejecución local en Apple Silicon mediante `mlx-vlm`.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (modo thinking, audio, visión avanzada más allá de image-text): no disponible.

## Casos de uso

- Descripción y etiquetado de imágenes en local: el modelo acepta una ruta de imagen y un prompt textual y devuelve una descripción, lo que permite generar alt-text o metadatos en lotes sobre una biblioteca de imágenes sin enviar datos a la nube.
- Asistente conversacional en Mac: con `mlx-vlm` y el flag `--temperature 0.0` para respuestas deterministas, se puede montar un chat de escritorio que combine preguntas sobre imágenes y texto en una misma sesión.
- Prototipado de aplicaciones multimodales en Apple Silicon: al estar en formato MLX y 4 bits, permite iterar sobre prototipos de visión-lenguaje en un portátil antes de migrar a un despliegue en servidor.
- Extracción de información de capturas y documentos escaneados: dado el pipeline image-text-to-text, se puede usar para transcribir o resumir el contenido visible de una imagen en inglés.
- Automatización de revisión de imágenes en flujos de trabajo personales: por ejemplo, clasificar o describir fotos en un pipeline de scripts Python que invoquen `mlx_vlm.generate`.
- Evaluación comparativa de cuantizaciones: sirve como checkpoint de referencia para medir la degradación de un Gemma 4 E4B QAT 4-bit frente a variantes de mayor precisión en tareas de imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 6,8 GB, por lo que se necesita al menos ese espacio en memoria unificada para cargar los pesos, más el overhead de activaciones y del codificador visual; en la práctica, un mínimo razonable de 10-12 GB de memoria unificada.
- GPU recomendadas: Apple Silicon exclusivamente, dado que el formato es MLX y la librería es `mlx-vlm`. No es directamente compatible con CUDA sin reconversión.
- Cabe en consumer hardware: sí, en Mac con chip M1/M2/M3/M4 con 16 GB de memoria unificada o superior; en equipos de 8 GB es probable que resulte ajustado.
- Opciones de despliegue: `mlx-vlm` (documentado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| bmbenterprises/gemma-4-E4B-it-qat-4bit | 7.941.100.874 | no disponible | no disponible | safetensors (MLX) | Hugging Face, 0 descargas |
| mlx-community/gemma-4-E4B-it-qat-4bit | no disponible | no disponible | no disponible | MLX | Hugging Face (origen del espejo) |
| Gemma 4 E4B IT (variante original) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada en los metadatos: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia del modelo Gemma 4 original antes de usarlo en producción.
- Idiomas: solo inglés según los metadatos, lo que limita su uso en castellano u otros idiomas.
- Es un espejo comunitario con cero descargas y cero likes; no hay garantía de mantenimiento ni de que los pesos coincidan exactamente con el original de mlx-community.
- La cuantización 4-bit QAT puede degradar la calidad frente a los pesos en precisión completa, especialmente en tareas de razonamiento o visión fina; no se documenta la magnitud de esa pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en tareas de descripción de imágenes donde el modelo puede inventar detalles no presentes.
- Sin información sobre sesgos, contexto máximo, tool calling ni seguridad; no apto para producción sin una evaluación previa propia.
- Dependencia de la librería `mlx-vlm` y de hardware Apple Silicon: no es portable a GPUs NVIDIA/AMD sin reconversión de formato.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bmbenterprises/gemma-4-E4B-it-qat-4bit
- Repositorio original referenciado en la model card: https://huggingface.co/mlx-community/gemma-4-E4B-it-qat-4bit
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
