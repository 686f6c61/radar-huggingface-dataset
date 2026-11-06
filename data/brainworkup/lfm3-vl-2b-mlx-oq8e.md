# brainworkup/LFM3-VL-2B-MLX-oQ8e

## Resumen

LFM3-VL-2B-MLX-oQ8e es una cuantización mixta del modelo multimodal LFM3-VL-2B, publicada por el usuario brainworkup en Hugging Face. El checkpoint original pertenece a la familia LFM3 (Liquid Foundation Models) de Liquid AI, e integra un modelo de lenguaje de aproximadamente 1,73 mil millones de parámetros con un codificador visual de unos 189 millones de parámetros, sumando 1.918.181.888 parámetros totales según los safetensors del repositorio.

Esta versión concreta ha sido cuantizada con la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta: la mayor parte de los pesos (90,1 %) se almacena en affine 8-bit con grupo de 64, mientras que un 9,9 % permanece en BF16. El resultado es un checkpoint con un promedio efectivo de 9,242 bits por peso y un tamaño de 2,064 GiB, lo que facilita su ejecución en hardware Apple Silicon mediante MLX.

El interés de esta ficha radica en que combina dos tendencias relevantes: los modelos multimodales compactos (~2B parámetros) aptos para inferencia local, y los formatos de cuantización optimizados para el framework MLX de Apple. No obstante, la información publicada por el autor es muy limitada: no hay model card del modelo base, ni datos de entrenamiento, benchmarks o licencia declarada en el repositorio, lo que condiciona cualquier evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual); detalles no disponibles |
| Parámetros totales | 1.918.181.888 (~1,92 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Affine 8-bit grupo 64 (90,1 % de pesos) + BF16 (9,9 %); promedio 9,242 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, custom_code) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo LFM3-VL-2B, un modelo multimodal que combina un backbone de lenguaje de 1,729 mil millones de parámetros con un módulo de visión de 189 millones de parámetros. La naturaleza exacta del transformer (atención completa, atención lineal, híbrido SSM, etc.) no está documentada en la información disponible; la familia LFM de Liquid AI ha explorado arquitecturas híbridas en otras generaciones, pero no se confirma aquí.

El proceso de cuantización aplicado por oQ (oMLX v0.7.3) es de precisión mixta: identifica capas o tensores sensibles y los mantiene en BF16 (0,190 B de parámetros, 0,353 GiB) mientras cuantiza el resto a affine 8-bit con grupo de 64 (1,728 B de parámetros, 1,710 GiB). No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural (heredadas del backbone LFM3 de 1,73 B).
- Comprensión de imágenes y respuesta a preguntas visuales (VQA) gracias al codificador visual de 189 M de parámetros.
- Descripción de imágenes y extracción de información visual en texto.
- Conversación multimodal de uno o varios turnos (la longitud de contexto no está documentada).
- Capacidades multilingües: no confirmadas en la información disponible.
- Tool calling / function calling: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Asistente visual local en Mac: al estar empaquetado en formato MLX y ocupar solo 2,064 GiB, puede ejecutarse en un Mac con Apple Silicon (16 GB o más) para tareas de descripción de imágenes y VQA sin conexión a internet.
- Prototipado de aplicaciones multimodales en el ecosistema Apple: útil para desarrolladores que quieran validar pipelines de visión-lenguaje integrados en apps macOS/iOS mediante MLX antes de escalar a modelos mayores.
- Extracción de texto e información de capturas y documentos: el modelo puede procesar imágenes y devolver descripciones o respuestas estructuradas, adecuado para automatizar la digitalización de formularios sencillos en local.
- Moderación y etiquetado de imágenes a pequeña escala: para clasificar o describir lotes de imágenes en entornos con requisitos de privacidad, al no requerir envío de datos a la nube.
- Educación e investigación: como banco de pruebas ligero para estudiar el efecto de la cuantización mixta 8-bit/BF16 en tareas multimodales sobre hardware de consumo.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad frente al checkpoint original LFM3-VL-2B en tareas de VQA, dado que el autor documenta con precisión la distribución de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~2,1 GiB para los pesos en el formato cuantizado; se recomienda al menos 4-6 GiB de memoria unificada para margen de activaciones y contexto.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con memoria unificada; el formato MLX no está pensado para CUDA.
- Compatibilidad con GPU de consumo: sí en Mac con 8 GB o más de memoria unificada, aunque 16 GB es el mínimo cómodo para contexto amplio.
- Opciones de despliegue: MLX (mlx-lm / mlx-vlm) y oMLX; no compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-oQ8e | ~1,92 B | no disponible | no disponible | safetensors (MLX) | Hugging Face |
| LFM3-VL-2B (original) | ~1,92 B | no disponible | no disponible | no disponible | no disponible en la información |
| Qwen2-VL-2B | ~2,2 B | 32k (según variante) | Apache 2.0 (variantes) | safetensors, GGUF | Hugging Face |
| SmolVLM-2B | ~2,2 B | 8k (aprox.) | Apache 2.0 | safetensors | Hugging Face |

La comparación con alternativas de la misma categoría (modelos visión-lenguaje de ~2 B) es limitada porque no se dispone de benchmarks ni licencia del modelo evaluado. Los datos de Qwen2-VL-2B y SmolVLM-2B se incluyen a modo de referencia general y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- No se declara licencia en el repositorio: el uso comercial queda sin autorización explícita y requiere contactar con el autor o con Liquid AI.
- No hay model card del modelo base ni información sobre sesgos, datos de entrenamiento o evaluación de seguridad.
- La cuantización mixta a 8-bit puede degradar ligeramente la calidad en tareas visuales finas (OCR, detalles pequeños) frente al checkpoint BF16 original.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin conversión.
- Riesgo de alucinación inherente a modelos de ~2 B, especialmente en descripciones de imágenes complejas o texto dentro de imágenes.
- Idiomas soportados no confirmados; el rendimiento en castellano no está verificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El campo `custom_code` implica que la carga requiere confiar en código remoto del repositorio; conviene auditar antes de ejecutarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/LFM3-VL-2B-MLX-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Liquid AI (familia LFM): https://www.liquid.ai/
