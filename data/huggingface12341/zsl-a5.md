# huggingface12341/zsl-a5

## Resumen

zsl-a5 es un modelo de extracción de características publicado en Hugging Face por el usuario `huggingface12341`. Se trata de un merge por aritmética de tareas (task arithmetic) orientado al "subnet 127 d3-lite pool" del proyecto Zils, combinando dos modelos base: `joamCriff123/zils-lite-l1121a` y `newsbang/adjudex-0.8b-v6`, ambos derivados del modelo padre `Qwen/Qwen3.5-0.8B`. El resultado es un checkpoint de aproximadamente 853 millones de parámetros (852.985.920 según los safetensors), con un tamaño de repositorio de 1,7 GB.

El modelo se presenta como un "decision-model" con pipeline de `feature-extraction`, lo que sugiere que su uso previsto es la obtención de representaciones internas (embeddings) más que la generación de texto libre. La operación de merge descrita en la model card aplica una resta vectorial entre el "soup" actual y el modelo padre Qwen3.5-0.8B sobre los pesos de lenguaje, conservando la torre de visión del soup.

Es relevante ahora por dos motivos: primero, por la técnica de merge utilizada (task arithmetic sobre un modelo multimodal para aislar o modular capacidades), y segundo, porque el ecosistema de modelos derivados de Qwen3.5 está proliferando rápidamente. Sin embargo, se trata de un modelo con cero descargas y cero likes en el momento de redactar esta ficha, sin benchmarks publicados ni documentación detallada más allá de la nota de merge.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B (merge de pesos); detalles internos no disponibles |
| Parámetros totales | 852.985.920 (~0,85 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino un merge por aritmética de tareas. Según la model card, la operación consiste en: `soup actual + (find - Qwen/Qwen3.5-0.8B)` aplicada sobre los pesos de lenguaje, manteniendo la torre de visión del soup. No se especifica qué es `find` (probablemente otro checkpoint intermedio del pool d3-lite) ni los coeficientes exactos del merge, por lo que la receta es parcialmente reproducible.

Los modelos fuente son `joamCriff123/zils-lite-l1121a` y `newsbang/adjudex-0.8b-v6`, ambos Apache-2.0 y ambos derivados de Qwen3.5-0.8B. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO en ninguna de las etapas. La innovación técnica destacable es precisamente el uso de task arithmetic para aislar componentes (lenguaje vs. visión) en un modelo multimodal pequeño, una técnica que permite modular capacidades sin reentrenamiento completo.

## Capacidades

- Extracción de características y embeddings: es el pipeline declarado (`feature-extraction`), por lo que su uso principal es producir representaciones vectoriales.
- Procesamiento multimodal: conserva la torre de visión del soup, por lo que se espera soporte de entrada de imágenes, aunque no se detalla en la documentación.
- Modelo de decisión: etiquetado como `decision-model`, orientado presumiblemente a tareas de clasificación o selección.
- Generación de texto: no confirmada explícitamente; al derivar de Qwen3.5-0.8B podría conservar capacidad generativa, pero el pipeline declarado no es `text-generation`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Búsqueda semántica y recuperación aumentada (RAG): usar el modelo como encoder para generar embeddings de documentos e imágenes, integrándolo en un pipeline de recuperación con un índice vectorial. Es adecuado por su pipeline de `feature-extraction` y su tamaño contenido.
- Clasificación multimodal en producción: al conservar la torre de visión, puede emplearse para etiquetar imágenes o pares imagen-texto en tareas de moderación de contenido o catalogación.
- Sistemas de decisión ligeros: dado el tag `decision-model`, encaja en pipelines de enrutamiento o scoring donde se necesita un modelo pequeño y de baja latencia.
- Prototipado de investigación sobre merges: sirve como caso de estudio para reproducir y analizar la técnica de task arithmetic aplicada a modelos multimodales pequeños.
- Despliegue en entornos con recursos limitados: con ~0,85 B parámetros y 1,7 GB en safetensors, cabe en GPUs de consumo y en CPU con cuantización (aunque las cuantizaciones no están publicadas).
- Extracción de embeddings para clustering y deduplicación: útil para agrupar documentos o imágenes por similitud semántica en pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y contexto; en la práctica entre 2 y 4 GB según batch y longitud de secuencia. En int8, en torno a 0,9 GB; en int4, alrededor de 0,5 GB (estimaciones, no hay cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas. También viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), y potencialmente vLLM o TGI si se genera una configuración compatible; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| zsl-a5 | ~0,85 B | no disponible | Apache-2.0 | feature-extraction | 0 descargas, 0 likes |
| Qwen/Qwen3.5-0.8B (padre) | ~0,8 B | no disponible | no disponible | no disponible | modelo de referencia |
| joamCriff123/zils-lite-l1121a | no disponible | no disponible | Apache-2.0 | no disponible | fuente del merge |
| newsbang/adjudex-0.8b-v6 | ~0,8 B (por nombre) | no disponible | Apache-2.0 | no disponible | fuente del merge |

No se dispone de datos de rendimiento comparativo; la comparación se limita a procedencia, licencia y tamaño.

## Limitaciones y advertencias

- Modelo sin validación pública: cero descargas y cero likes, sin benchmarks ni eval publicada; no hay evidencia de calidad más allá de la receta de merge.
- Receta de merge incompleta: no se especifican los coeficientes ni qué checkpoint es `find`, lo que impide reproducir exactamente el resultado.
- Riesgo de alucinación: si se usa para generación (no confirmada), al ser un merge aritmético sin fine-tuning supervisado documentado, el riesgo es alto y no cuantificado.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Contexto: longitud de contexto no documentada; no asumir la del modelo padre sin verificación.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar que los modelos fuente (`zils-lite-l1121a`, `adjudex-0.8b-v6`) mantienen efectivamente esa licencia y que no arrastran restricciones adicionales.
- Uso en producción: al no haber cuantizaciones publicadas ni benchmarks, requiere evaluación propia antes de desplegar; el tag `custom_code` implica que la carga necesita `trust_remote_code=True`, con el consiguiente riesgo de ejecutar código del repositorio.
- Modelo de autor individual sin gobernanza: sin mantenimiento ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface12341/zsl-a5
- Modelo base 1: https://huggingface.co/joamCriff123/zils-lite-l1121a
- Modelo base 2: https://huggingface.co/newsbang/adjudex-0.8b-v6
- Modelo padre: https://huggingface.co/Qwen/Qwen3.5-0.8B
