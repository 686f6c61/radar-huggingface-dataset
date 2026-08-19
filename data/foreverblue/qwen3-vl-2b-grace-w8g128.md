# ForeverBlue/Qwen3-VL-2B-GRACE-W8G128

## Resumen

Qwen3-VL-2B-GRACE-W8G128 es un modelo de visión-lenguaje (VLM) de 2.400 millones de parámetros, desarrollado por ForeverBlue, que aplica el método GRACE (Gated Relational Alignment via Confidence-based Distillation) sobre el backbone Qwen/Qwen3-VL-2B-Instruct. Se trata de un checkpoint de investigación en cuantización consciente del entrenamiento (QAT) con pesos INT8 en grupos de 128 (W8G128), diseñado para estudiar la compresión eficiente de modelos multimodales sin sacrificar rendimiento.

El modelo resuelve el problema de desplegar VLMs en entornos con recursos limitados: mediante destilación de conocimiento desde un profesor de 8B y cuantización INT8, consigue un promedio de 75,9 en siete benchmarks multimodales, reteniendo el 99% del rendimiento de su versión BF16 y superando al profesor de 8B en la media (76,7 vs 76,3) con una cuarta parte de los parámetros. Es relevante ahora porque aborda la brecha entre capacidad y eficiencia en VLMs, un área crítica para la inferencia en edge y dispositivos móviles.

El checkpoint está liberado bajo licencia MIT, soporta inglés y chino, y se distribuye en formato safetensors compatible con Hugging Face Transformers. Su contexto de entrada es multimodal (imagen y texto), aunque la longitud de contexto textual no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal con vision encoder) |
| Parametros totales | 2.438.696.960 (2,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8G128 (INT8, group size 128) mediante QAT; existen variantes W4G128 y BF16 en el model zoo |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. Sobre esta base, se aplica GRACE, un método de destilación por confianza que alinea representaciones relacionales entre el profesor (Qwen3-VL-8B) y el estudiante (2B) mediante puertas adaptativas. El entrenamiento se realiza con el dataset ShareGPT4V bajo un pipeline de fine-tuning multimodal estilo LLaVA, e incluye una fase de cuantización consciente del entrenamiento (QAT) con pesos INT8 agrupados en bloques de 128 canales.

La innovación técnica principal reside en combinar destilación de conocimiento con QAT: el estudiante aprende directamente con pesos cuantizados, lo que reduce la pérdida de precisión frente a la cuantización post-entrenamiento. Según los autores, el modelo W8G128 conserva el 99% del promedio de benchmarks de la versión BF16, y el método completo (GRACE) eleva el rendimiento del baseline Qwen3-VL-2B en +9,4 puntos de media.

## Capacidades

- Generación de texto y respuesta a preguntas sobre imágenes (image-text-to-text).
- Razonamiento visual: comprensión de escenas, objetos, relaciones espaciales y atributos.
- Soporte multilingüe en inglés y chino para entradas de imagen y texto.
- Capacidad de conversación multimodal multi-turno (instrucciones de chat).
- Evaluación en benchmarks estándar de VLM: alucinación (HallB), razonamiento visual (MMBench, ScienceQA, AI2D), comprensión multimodal (MMMU, SEED, MMStar).
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Investigación en eficiencia de VLMs: sirve como punto de referencia para estudiar el impacto de la cuantización INT8 y la destilación por confianza en modelos multimodales, permitiendo reproducir los experimentos del paper ICML 2026.
- Despliegue en dispositivos edge: con 2,4B parámetros en INT8, el modelo cabe en GPUs de consumo y puede ejecutarse en tiempo real para tareas de clasificación de imágenes o respuesta visual en aplicaciones móviles.
- Análisis de imágenes en entornos con restricción de memoria: su tamaño reducido y cuantización INT8 permiten procesar lotes de imágenes en servidores con VRAM limitada, por ejemplo en pipelines de moderación de contenido.
- Asistente visual multilingüe: al soportar inglés y chino, puede integrarse en chatbots que responden preguntas sobre fotografías en ambos idiomas, útil para atención al cliente internacional.
- Evaluación de calidad de cuantización: los desarrolladores pueden comparar las salidas de este checkpoint W8G128 con las versiones BF16 y W4G128 para decidir el punto óptimo de compresión en sus propios sistemas.
- Fine-tuning posterior: al estar basado en Qwen3-VL-2B-Instruct y liberado con licencia MIT, puede servir como inicialización para tareas específicas de visión-lenguaje con requisitos de eficiencia.

## Benchmarks y rendimiento

La model card reporta resultados en siete benchmarks multimodales, comparando el profesor de 8B, el baseline de 2B y las variantes GRACE. Los datos son los siguientes:

| Modelo | Params | Precision | HallB | MMBench | ScienceQA | AI2D | MMMU | SEED | MMStar | Avg |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-VL-8B (profesor, ref.) | 8B | BF16 | 61,1 | 84,5 | 85,0 | 85,7 | 69,6 | 77,5 | 70,9 | 76,3 |
| Qwen3-VL-2B (baseline) | 2B | BF16 | 51,4 | 78,4 | 81,4 | 76,9 | 53,4 | 71,2 | 58,3 | 67,3 |
| Qwen3-VL-2B-GRACE | 2B | BF16 | 66,9 | 86,4 | 86,2 | 81,3 | 72,1 | 76,7 | 67,3 | 76,7 |
| Qwen3-VL-2B-GRACE (W8G128) | 2B | INT8 | 66,1 | 85,5 | 85,3 | 80,4 | 71,3 | 75,9 | 66,5 | 75,9 |
| Qwen3-VL-2B-GRACE (W4G128) | 2B | INT4 | 65,4 | 84,6 | 84,3 | 79,5 | 70,5 | 75,1 | 65,8 | 75,0 |

El modelo W8G128 retiene el 99% del promedio de la versión BF16 (75,9 vs 76,7) y supera al baseline BF16 de 2B en +8,6 puntos. No se han publicado resultados adicionales fuera de esta tabla en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 de 2,4B ocupan aproximadamente 2,4 GB; con activaciones y overhead del modelo multimodal, se recomienda un mínimo de 4-6 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 2070 o superiores. Para despliegue en servidor, una A10 o L4 es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media y baja (GTX 1660 Super con 6 GB, RTX 3050 con 8 GB).
- Opciones de despliegue: al ser un modelo de Transformers con safetensors, puede cargarse con Hugging Face Transformers, vLLM (si se implementan kernels INT8), llama.cpp (con conversión a GGUF) u Ollama. La model card advierte que se requieren kernels especializados o lógica de carga personalizada para obtener beneficios reales de INT8.
- Latencia y throughput: no se proporcionan datos medidos. En una RTX 4090, un modelo de 2B en INT8 podría alcanzar decenas de tokens por segundo, pero depende del backend y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Params | Precision | Contexto | Avg benchmarks | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-2B-GRACE-W8G128 | 2,4B | INT8 | No disponible | 75,9 | MIT |
| Qwen3-VL-2B-Instruct (baseline) | 2,4B | BF16 | No disponible | 67,3 | Apache 2.0 (Qwen) |
| Qwen3-VL-8B (profesor) | 8B | BF16 | No disponible | 76,3 | Apache 2.0 (Qwen) |
| LLaVA-1.5-7B-GRACE-W4G128 | 7B | INT4 | No disponible | No reportado aquí | MIT |

El modelo GRACE W8G128 supera al baseline de 2B en todos los benchmarks y prácticamente iguala al profesor de 8B con una cuarta parte de los parámetros. Frente a LLaVA-1.5-7B cuantizado, no hay comparación directa en esta documentación, pero el método GRACE se validó también en ese backbone según el paper.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no destinado a despliegue en producción con garantías de fiabilidad.
- Puede generar alucinaciones, sesgos o salidas incorrectas, como cualquier VLM.
- La cuantización W8G128 requiere kernels especializados o lógica de carga personalizada para obtener beneficios reales de velocidad y memoria; sin ellos, el modelo puede ejecutarse en precisión simulada con menor eficiencia.
- Solo se documentan los idiomas inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no está especificada, lo que limita el diseño de aplicaciones con dependencias de ventana larga.
- No se recomienda su uso en contextos de seguridad crítica, decisiones médicas, legales o financieras.
- El tamaño del repositorio (15,5 GB) es notablemente mayor que el peso del modelo, posiblemente por incluir archivos de entrenamiento o checkpoints adicionales; esto debe tenerse en cuenta para la descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-W8G128
- Paper (arXiv): https://arxiv.org/abs/2601.22709
- DOI: https://doi.org/10.48550/arXiv.2601.22709
- Código (GitHub): https://github.com/ForeverBlue816/GRACE
- Space de demostración GRACE-VLM: https://huggingface.co/spaces/ForeverBlue/GRACE-VLM
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Variante W4G128: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-W4G128-AWQ
- Variante BF16: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-BF16
- Checkpoint LLaVA-1.5-7B-GRACE-W4G128: https://huggingface.co/ForeverBlue/LLaVA-1.5-7B-GRACE-W4G128
