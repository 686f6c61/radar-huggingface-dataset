# Arki05/Qwen3.8-27B-GGUF-shards

## Resumen

Arki05/Qwen3.8-27B-GGUF-shards es un repositorio de artefactos de cuantización para el modelo Qwen/Qwen3.8-27B, publicado por el usuario Arki05 bajo licencia Apache-2.0. No se trata de un modelo entrenado de forma independiente, sino de un almacén de tensores cuantizados en formato GGUF organizado por tipo de cuantización, pensado para ensamblar ficheros GGUF con un tipo distinto por tensor mediante la herramienta qalloc del propio autor. El repositorio incluye los pesos en BF16 de origen (procedentes de unsloth/Qwen3.8-27B-GGUF) y variantes de cada tensor lineal de bloque en 18 tipos de llama.cpp, desde IQ1_M hasta Q8_0, pasando por IQ4_NL, MXFP4 y NVFP4.

El modelo base Qwen3.8-27B pertenece a la familia Qwen3 y, según los metadatos del repositorio, incorpora capas de atención lineal con tensores `ssm_alpha` y `ssm_beta`, además de una capa de predicción multi-token (MTP). La model card no detalla la arquitectura completa ni el número de parámetros activos, por lo que esos datos deben consultarse en el repositorio del modelo original.

La relevancia de este repositorio es fundamentalmente práctica: permite a desarrolladores que trabajan con llama.cpp construir GGUFs con asignación heterogénea de tipos por tensor (por ejemplo, mayor precisión en capas sensibles y menor en el resto) sin tener que recuantizar desde cero. El tamaño del repositorio, 1.872,6 GB, refleja que almacena múltiples copias del modelo a distintos tipos. El dato de parámetros totales registrado en safetensors (2.671.616) es incoherente con el nombre del modelo y con el tamaño del repositorio, por lo que se marca como no fiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (tensores `ssm_alpha`/`ssm_beta`) y capa de predicción multi-token; detalles completos no disponibles |
| Parámetros totales | No disponible (el nombre indica 27B; el campo safetensors del repo, 2.671.616, es inconsistente) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 18 tipos de llama.cpp: IQ1_M … Q8_0, IQ4_NL, MXFP4, NVFP4; y Q2_K … Q8_0 para embeddings, output, MTP y tensores `ssm_alpha`/`ssm_beta` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (shards por tipo de tensor), más `manifest.json` (`qcore-store/1`), `skeleton.gguf`, `store.json` y `records/` |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo base; se limita a distribuir artefactos de cuantización derivados de Qwen/Qwen3.8-27B. La información disponible indica que el modelo incorpora atención lineal (presencia de tensores `ssm_alpha` y `ssm_beta` en el grafo GGUF) y una capa de predicción multi-token, lo que sugiere una arquitectura híbrida orientada a eficiencia en contexto largo y decodificación especulativa. No se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica del repositorio es el proceso de cuantización: cada tensor lineal de bloque se reconstruye a partir de los pesos BF16 mediante cuantización Hessiana, generando ficheros `types/<T>-hq.gguf` con el tipo plano `T` de llama.cpp, compatibles con llama.cpp estándar. Los tensores de embeddings, salida, MTP y los pequeños de atención lineal se distribuyen en ficheros `types/<T>.gguf` con la cuantización propia de llama.cpp. El manifest incluye offset y sha256 de cada tensor, lo que permite ensamblados reproducibles y verificables.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, sin detalle específico en la model card.
- Codificación y matemáticas: no se documentan explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en el repo).
- Capacidades especiales: predicción multi-token (MTP) presente en el grafo; no se confirman modos de pensamiento, visión ni audio.
- Ensamblado GGUF con tipo por tensor: capacidad operativa del repositorio, no del modelo en sí.

## Casos de uso

- Evaluación de cuantizaciones heterogéneas: usar qalloc y los ficheros `types/<T>-hq.gguf` para construir GGUFs con precisión distinta por capa y medir el impacto en perplejidad y calidad respecto a una cuantización uniforme.
- Despliegue en llama.cpp con presupuesto de memoria ajustado: seleccionar tipos más agresivos (IQ1_M, IQ2) en capas menos sensibles y Q6_K/Q8_0 en capas críticas, reduciendo el tamaño total frente a una cuantización uniforme alta.
- Investigación en cuantización: comparar la cuantización Hessiana del autor con la de llama.cpp estándar sobre los mismos tensores, usando los hashes del manifest para garantizar reproducibilidad.
- Reproducibilidad de artefactos: verificar integridad de pesos descargados mediante sha256 de `records/` antes de integrarlos en pipelines de producción.
- Servicio de inferencia local: desplegar una variante GGUF del modelo base en estaciones de trabajo con llama.cpp u Ollama, siempre que el tamaño elegido quepa en la VRAM disponible.
- Archivado y distribución de variantes: emplear los shards como fuente única para regenerar cualquier combinación de tipos sin volver a cuantizar desde BF16, útil en equipos con ancho de banda limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de ~27B, una cuantización de 4 bits ronda los 15-17 GB de pesos, y una de 8 bits en torno a 27-29 GB; estas cifras son estimaciones generales, no datos del repositorio.
- GPU recomendadas: no especificadas. Para variantes de 4 bits, GPUs consumer de 24 GB (RTX 3090, RTX 4090) podrían alojar el modelo; las variantes de 8 bits requerirían A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU consumer: probablemente para tipos IQ2/IQ3/IQ4 en GPUs de 16-24 GB; no confirmado.
- Opciones de despliegue: llama.cpp (destino principal, dado que los tipos son planos de llama.cpp), y por extensión Ollama o servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arki05/Qwen3.8-27B-GGUF-shards | ~27B (según nombre; dato safetensors inconsistente) | No disponible | GGUF por tipo de tensor | Apache-2.0 | Hugging Face, 10.798 descargas |
| Qwen/Qwen3.8-27B | No disponible | No disponible | Safetensors (BF16) | Apache-2.0 (según repo derivado) | Hugging Face |
| unsloth/Qwen3.8-27B-GGUF | ~27B | No disponible | GGUF (fuente BF16) | Apache-2.0 | Hugging Face |
| Arki05/Qwen3.8-27B-GGUF | ~27B | No disponible | GGUF preensamblado | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no es un modelo autónomo: requiere ensamblado con qalloc o uso de los GGUFs preconstruidos del repo hermano; descargarlo y cargarlo directamente en llama.cpp no funcionará.
- El tamaño de 1.872,6 GB hace inviable la descarga completa en la mayoría de entornos; conviene descargar solo los shards del tipo deseado.
- El campo de parámetros totales en safetensors (2.671.616) es incompatible con un modelo de 27B y con el tamaño del repo; no debe usarse como referencia.
- No se declaran idiomas soportados ni se documentan sesgos, riesgos de alucinación o limitaciones de contexto del modelo base en esta ficha.
- La licencia Apache-2.0 permite uso comercial, pero las obligaciones de atribución y las posibles restricciones del modelo base deben verificarse en Qwen/Qwen3.8-27B.
- Los pesos cuantizados son versiones modificadas de los originales; la cuantización Hessiana puede introducir degradaciones no caracterizadas en la model card.
- No hay resultados de benchmarks publicados para estas variantes, por lo que la calidad relativa frente a cuantizaciones estándar de llama.cpp no está cuantificada.

## Enlaces

- Repositorio de shards: https://huggingface.co/Arki05/Qwen3.8-27B-GGUF-shards
- Repositorio GGUF preensamblado: https://huggingface.co/Arki05/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF BF16 de origen: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Herramienta qalloc: https://arki05.com/projects/qalloc/
- Revisión anterior del store (41 tipos): https://huggingface.co/Arki05/Qwen3.8-27B-GGUF-shards/tree/0090490f
