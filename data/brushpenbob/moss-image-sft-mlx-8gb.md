# brushpenbob/moss-image-sft-mlx-8gb

## Resumen

MOSS-Image SFT MLX 8GB es una cuantización adicional del modelo de generación de imágenes MOSS-Image SFT, adaptada para ejecutarse en Macs con Apple Silicon y solo 8 GB de memoria unificada. Lo publica el usuario brushpenbob como derivado del port MLX compacto de VisualInference, que a su vez adapta el modelo original de OpenMOSS (OpenMOSS-Team/MOSS-Image-SFT). No es un modelo nuevo: es una redistribución con el transformer cuantizado a 4 bits para reducir el peso de 5,3 GB a 3,71 GB.

La relevancia es práctica: permite ejecutar un pipeline text-to-image completo (text encoder Qwen3.5-9B, transformer de difusión y VAE FLUX.2) en hardware de consumo con memoria muy limitada, algo que el original en 8 bits no permite. La contrapartida declarada por el autor es una ligera pérdida de detalle fino, manteniendo la atención, los embeddings de texto y los bloques primero y último en 8 bits para preservar calidad en el texto renderizado.

La ficha se basa únicamente en la model card y los metadatos de Hugging Face; no se han publicado especificaciones detalladas de arquitectura, entrenamiento ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pipeline text-to-image con transformer de difusion, text encoder Qwen3.5-9B y VAE FLUX.2 (detalle de bloques no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | transformer en 4 bits (group 64), con atencion (q, k, v, o), text embedder y primer/ultimo bloque en 8 bits; capas originales en bf16 sin cambios |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria moss-image-mlx) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusion para texto a imagen. Segun la model card, el componente modificado es únicamente el transformer (`transformer/`), que se ha vuelto a almacenar de 8 bits a 4 bits con grupo 64, excepto la atención (q, k, v, o), el text embedder y los bloques primero y último, que permanecen en 8 bits. Las capas que el original mantiene en bf16 no se han tocado. El text encoder, tokenizer, scheduler y decoder VAE son los archivos del tier compacto sin cambios. La especificación de cuantización está en `transformer/config.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. El autor indica que el modelo base es OpenMOSS-Team/MOSS-Image-SFT y que el port MLX y el tier compacto son obra de felix-ab / VisualInference.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Renderizado de texto en la imagen: la model card indica que el lettering lo decide el text encoder sin cambios y la atención en 8 bits, por lo que se preserva relativamente bien.
- Ejecución en Apple Silicon mediante la librería moss-image-mlx.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de ilustraciones en local en un Mac de 8 GB: el modelo permite crear imágenes a partir de prompts sin depender de servicios en la nube, gracias a la reducción del transformer a 3,71 GB.
- Prototipado rápido de conceptos visuales: diseñadores pueden iterar prompts y ver resultados en hardware de consumo antes de pasar a un modelo de mayor calidad.
- Integración en herramientas creativas de escritorio: Protoart Studio ya lo usa, lo que demuestra su viabilidad como motor de generación dentro de una aplicación nativa de macOS.
- Creación de assets para maquetas y presentaciones: útil para generar imágenes de relleno o bocetos con texto legible en la propia imagen.
- Experimentación educativa con difusión cuantizada: permite estudiar el efecto de la cuantización 4-bit frente a 8-bit en la calidad final, comparando con el original compacto.
- Pruebas de pipelines MLX: sirve como banco de pruebas para desarrolladores que quieran validar flujos de inferencia en Apple Silicon con memoria restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: diseñado para Macs con 8 GB de memoria unificada; el transformer ocupa 3,71 GB tras la cuantización (frente a 5,3 GB del tier compacto en 8 bits).
- GPU: Apple Silicon (M1, M2, M3 y posteriores) con 8 GB o más de memoria unificada. No se documenta soporte para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en el rango de Macs de 8 GB; no se indica compatibilidad con RTX 4090 u otras GPU discretas.
- Despliegue: librería moss-image-mlx (https://github.com/felix-ab/moss-image-mlx); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| brushpenbob/moss-image-sft-mlx-8gb | no disponible | no disponible | transformer 4-bit (grupo 64) con atención y bloques extremos en 8-bit | Apache-2.0 | Macs de 8 GB |
| VisualInference/MOSS-Image-SFT-MLX-compact | no disponible | no disponible | transformer 8-bit | Apache-2.0 | Macs con más memoria |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no disponible | pesos originales (bf16 y capas indicadas) | Apache-2.0 | hardware de mayor capacidad |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Menor detalle fino que el original en 8 bits, según advierte el propio autor.
- El texto renderizado depende del text encoder y de la atención en 8 bits; no se garantiza fidelidad absoluta en tipografías complejas.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación visual.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de cambios (§4b) y los archivos LICENSE y NOTICE.
- El autor declara no estar afiliado a OpenMOSS; es una redistribución no oficial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.
- No se documentan requisitos de contexto, resolución de salida ni límites de prompt.

## Enlaces

- Hugging Face: https://huggingface.co/brushpenbob/moss-image-sft-mlx-8gb
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Tier compacto de referencia: https://huggingface.co/VisualInference/MOSS-Image-SFT-MLX-compact
- Repositorio de la librería: https://github.com/felix-ab/moss-image-mlx
