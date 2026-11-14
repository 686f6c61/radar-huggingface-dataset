# mradermacher/nexus-decision-4b-GGUF

## Resumen

`mradermacher/nexus-decision-4b-GGUF` es una colección de cuantizaciones GGUF estáticas generadas por mradermacher a partir del modelo base `zackyalgiffari/nexus-decision-4b`. El repositorio no contiene un modelo original, sino conversiones del checkpoint en formato Hugging Face a formatos GGUF de distinto nivel de compresión (F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_XS, entre otros), pensadas para su uso con llama.cpp y herramientas compatibles como Ollama o LM Studio.

El dato más relevante es la discrepancia entre el nombre comercial del modelo ("4b") y el recuento real de parámetros reportado en los safetensors: 333.514.240 parámetros, es decir, aproximadamente 0,33 mil millones. Esto sugiere que el identificador del modelo no refleja su tamaño real y que quien quiera evaluarlo debe fiarse del recuento de tensores, no del nombre.

La información publicada es mínima: no hay model card descriptiva, no se declaran licencia, idiomas, pipeline ni contexto. El repositorio ocupa 1,0 GB y los pesos se distribuyen únicamente en GGUF. Para un desarrollador, este repositorio es útil como punto de descarga de cuantizaciones ligeras, pero no permite evaluar calidad, sesgos ni idoneidad para producción sin consultar el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 333.514.240 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `zackyalgiffari/nexus-decision-4b`: no se especifica si es un transformer denso, un MoE, un modelo híbrido ni qué tipo de atención utiliza. Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

Lo único verificable es el proceso de conversión: el repositorio se generó con una herramienta de cuantización (los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`), produciendo múltiples variantes GGUF estáticas a partir del checkpoint en formato Hugging Face. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje, pero no documentada explícitamente.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local en CPU y GPU mediante llama.cpp: disponible por el formato GGUF.

## Casos de uso

- Despliegue en hardware de bajos recursos: con ~0,33 mil millones de parámetros, las variantes Q4_K_M o Q3_K_M ocupan unos cientos de MB y pueden ejecutarse en CPU o en GPUs integradas, lo que permite prototipar asistentes de texto en portátiles sin GPU dedicada.
- Pruebas de integración con llama.cpp y Ollama: sirve para validar pipelines de inferencia local (carga de GGUF, plantillas de prompt, streaming) antes de invertir en modelos mayores.
- Experimentación académica sobre cuantización: al ofrecer 12 variantes del mismo checkpoint, permite medir la degradación de perplejidad y calidad entre F16, Q8_0, Q4_K_M y Q2_K sobre una misma arquitectura.
- Filtrado y clasificación de texto ligera: si el modelo base responde bien a instrucciones cortas, puede usarse para etiquetado de documentos o moderación básica en entornos con latencia estricta.
- Generación de texto auxiliar en aplicaciones embebidas: su reducido tamaño permite incluirlo en aplicaciones de escritorio o móviles como generador de resúmenes breves o respuestas plantilla.
- Evaluación comparativa de repositorios de cuantización: útil para estudiar cómo mradermacher estructura sus releases (metadatos, conjunto de quants, nombres de fichero) y replicar el proceso con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 ~0,67 GB; Q8_0 ~0,35 GB; Q4_K_M ~0,2 GB; Q2_K ~0,12 GB (estimaciones a partir de 333,5 M de parámetros y del tamaño del repo de 1,0 GB para el conjunto de cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM para F16; para las variantes Q4 y Q2 basta con 512 MB o incluso ejecución en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, Apple Silicon) e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera decodificación de decenas a cientos de tokens por segundo en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| nexus-decision-4b (este repo) | 333,5 M | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| SmolLM2-360M | 362 M | 8.192 | Apache 2.0 | safetensors, GGUF | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparación es orientativa: los tres alternativos tienen licencia y contexto documentados y benchmarks públicos, mientras que `nexus-decision-4b` carece de esa información. En tamaño, es el más cercano a SmolLM2-360M.

## Limitaciones y advertencias

- El nombre "4b" no coincide con el recuento real de parámetros (333,5 M); conviene no asumir capacidades de un modelo de 4 mil millones.
- No se declara licencia: no se puede garantizar el uso comercial ni la redistribución sin contactar con el autor del modelo base.
- No hay model card del modelo original en la información proporcionada: se desconoce el corpus, el idioma y el proceso de alineación, lo que impide evaluar sesgos.
- Riesgo de alucinación no cuantificado: sin benchmarks ni evaluación, no hay evidencia de fiabilidad en tareas de razonamiento o matemáticas.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano.
- El repositorio solo contiene cuantizaciones; para inspeccionar pesos originales hay que acudir a `zackyalgiffari/nexus-decision-4b`.
- Ausencia de pipeline declarado en Hugging Face: las herramientas de inferencia automática no podrán cargarlo sin configuración manual.
- Los metadatos de cuantización proceden de la herramienta de conversión, no de una validación de calidad por parte del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nexus-decision-4b-GGUF
- Modelo base: https://huggingface.co/zackyalgiffari/nexus-decision-4b
