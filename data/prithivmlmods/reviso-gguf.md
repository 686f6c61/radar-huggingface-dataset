# prithivMLmods/Reviso-GGUF

## Resumen

Reviso es un modelo agéntico de generación de descripciones de vídeo (video captioning) construido sobre Qwen3.5-9B, presentado en el artículo «Reviso: Not All Visual Evidence Deserves Equal Attention in Video Captioning». El modelo aborda el problema de que no toda la evidencia visual de un vídeo merece la misma atención: en lugar de procesar los fotogramas de forma uniforme, Reviso construye un plan de observación jerárquico denominado Context–Focus–Points (CFP) a partir de una vista previa global del vídeo.

Sobre ese plan, el modelo aplica revisión temporal, recorte de imágenes y OCR para inspeccionar los detalles relevantes, actualizando su comprensión y su plan durante varias rondas antes de redactar la descripción final. El framework de entrenamiento descrito en la model card incluye ajuste fino supervisado (SFT) y GRPO. Esta ficha cubre la versión cuantizada en GGUF publicada por prithivMLmods, derivada del checkpoint completo en FP32 de TengfeiLiuCoder/Reviso.

La relevancia de esta publicación radica en que permite ejecutar un modelo multimodal de ~9 000 millones de parámetros con capacidades agénticas de inspección visual en entornos con llama.cpp, con opciones desde 4,62 GB (Q3_K_M) hasta 17,9 GB (BF16), lo que facilita su despliegue en hardware de consumo. La model card original no aporta cifras de benchmarks, datos de entrenamiento ni detalles de licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) sobre Qwen3.5-9B; clase `Qwen3_5ForConditionalGeneration` |
| Parámetros totales | 8 953 803 264 (~8,95 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones con llama.cpp); el modelo base se distribuye en safetensors FP32 (9 shards, ~37,64 GB) |

## Arquitectura y entrenamiento

Reviso se construye sobre Qwen3.5-9B, un transformer multimodal que combina un codificador visual con un modelo de lenguaje y un proyector multimodal (el archivo `Reviso.mmproj-bf16.gguf` de 922 MB corresponde a dicho proyector en formato GGUF). El modelo sigue un paradigma agéntico: a partir de un previsualizado global del vídeo genera un plan de observación jerárquico Context–Focus–Points (CFP), y después emplea herramientas de revisión temporal, recorte de imagen y OCR para inspeccionar regiones y momentos concretos, actualizando iterativamente su plan y su comprensión en varias rondas antes de producir la descripción final.

En cuanto al entrenamiento, la model card cita explícitamente dos etapas: ajuste fino supervisado (SFT) y GRPO (Group Relative Policy Optimization, una variante de RL). No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni detalles sobre el corpus de vídeo utilizado; la card remite al artículo y al repositorio de GitHub para esos datos. Tampoco se documenta el uso de decodificación especulativa: la propia card indica «MTP — Speculative Decoding: No».

## Capacidades

- Generación de descripciones de vídeo (video captioning) con razonamiento visual multi-ronda.
- Planificación agéntica de la observación mediante el esquema jerárquico Context–Focus–Points.
- Revisión temporal: localización y reexamen de segmentos concretos del vídeo.
- Recorte de imagen (cropping) para inspeccionar detalles de regiones específicas.
- OCR sobre el contenido visual para extraer texto presente en los fotogramas.
- Razonamiento multi-paso con actualización iterativa del plan de observación.
- Procesamiento image-text-to-text (entrada conjunta de imagen/vídeo y texto).
- Conversación multi-turno (etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada, aunque el comportamiento agéntico implica invocación de herramientas de inspección.
- Capacidades multilingües: limitadas al inglés según la metadata (`language: en`).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de vídeo para accesibilidad: el modelo puede generar descripciones detalladas de contenido audiovisual para audiodescripción o subtitulado enriquecido, aprovechando su capacidad de inspeccionar texto en pantalla mediante OCR y de revisar momentos concretos del metraje.
- Indexación y búsqueda de archivos audiovisuales: generar metadatos descriptivos de cada vídeo de un catálogo permite construir índices semánticos; el enfoque CFP resulta adecuado porque prioriza la evidencia relevante en lugar de tratar todos los fotogramas por igual.
- Moderación y análisis de contenido en plataformas de vídeo: el modelo puede inspeccionar regiones y momentos específicos para detectar elementos concretos (texto superpuesto, objetos, escenas), reduciendo el coste frente a un análisis frame a frame.
- Extracción de información de vídeos de formación o reuniones: combinando OCR y revisión temporal, puede resumir el contenido de pizarras, diapositivas o pantallas compartidas y generar actas descriptivas.
- Enriquecimiento de datasets de visión por computador: uso del modelo para etiquetar automáticamente vídeos con descripciones ricas que sirvan como datos de entrenamiento para otros modelos.
- Análisis de vídeo en el borde (edge) o en local: gracias a las cuantizaciones Q4_K_M (5,63 GB) y Q4_K_S (5,35 GB), puede desplegarse con llama.cpp en estaciones de trabajo con GPU de consumo, útil en entornos con requisitos de privacidad donde no se pueden enviar vídeos a la nube.
- Asistencia a la documentación técnica: descripción de tutoriales en vídeo o demos de producto, generando texto explicativo a partir de la secuencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + proyector multimodal de 922 MB + overhead de contexto):
  - Q3_K_M (4,62 GB): ~6-7 GB de VRAM.
  - Q4_K_M (5,63 GB): ~7-8 GB de VRAM.
  - Q5_K_M (6,47 GB): ~8-9 GB de VRAM.
  - Q6_K (7,36 GB): ~9-10 GB de VRAM.
  - Q8_0 (9,53 GB): ~11-12 GB de VRAM.
  - BF16 (17,9 GB): ~19-20 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para BF16 o Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q6_K o Q8_0; RTX 4060 Ti 16 GB o RTX 4070 (12 GB) para Q5_K_M o Q4_K_M; GPUs de 8 GB para Q3_K_M o Q4_K_S. Para despliegue en servidor, A100 o H100 permiten BF16 con contexto amplio y mayor concurrencia.
- Cabe en GPU de consumo: sí, desde Q3_K_M en adelante en GPUs de 8 GB o más; las cuantizaciones Q4_K_M y Q5_K_M son las recomendadas por el autor para uso general.
- Opciones de despliegue: llama.cpp (cuantizaciones generadas con esta herramienta), Ollama (a partir de los GGUF), transformers con el checkpoint base (BF16, clase `Qwen3_5ForConditionalGeneration`), y text-generation-inference según las etiquetas del repositorio. vLLM no se menciona en la información disponible.
- Latencia y throughput: no disponibles. El modelo no emplea decodificación especulativa (MTP), lo que limita las optimizaciones de velocidad respecto a variantes con draft model.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reviso (esta ficha) | ~8,95 B | no disponible | Vídeo/imagen + texto, agéntico | apache-2.0 | GGUF + safetensors FP32 |
| Qwen3.5-9B (base) | ~9 B | no disponible | Imagen + texto | no disponible en la información | safetensors |
| inclusionAI ZwZ2-4B | ~4 B | no disponible | Imagen + texto, razonamiento multi-paso sin zoom en inferencia | no disponible en la información | GGUF (prithivMLmods) |

Reviso se diferencia de ZwZ2-4B en que este último resuelve la conexión de evidencia entre regiones sin herramientas de zoom en tiempo de inferencia, mientras que Reviso sí emplea recorte y revisión temporal explícitos como parte de su bucle agéntico. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Solo soporta inglés según la metadata del repositorio; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas no está verificado de forma independiente.
- La model card del modelo base no documenta datos de entrenamiento ni sesgos conocidos; existe riesgo de sesgos heredados del corpus de vídeo utilizado, no auditado públicamente.
- Riesgo de alucinación inherente a los modelos generativos multimodales, especialmente al describir detalles visuales ambiguos o de baja resolución.
- El bucle agéntico de revisión, recorte y OCR implica múltiples pasos de inferencia por vídeo, lo que incrementa la latencia y el coste computacional frente a un captioning de un solo paso.
- La licencia apache-2.0 se aplica al repositorio GGUF, pero la licencia del modelo base TengfeiLiuCoder/Reviso no se detalla en la información proporcionada; conviene verificarla antes de un uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que la cuantización es muy reciente y no ha sido validada por la comunidad.
- El tamaño del repositorio (69 GB) incluye todas las cuantizaciones; para producción conviene descargar únicamente el archivo GGUF y el proyector necesarios.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar el procesamiento de vídeos largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Reviso-GGUF
- Modelo base: https://huggingface.co/TengfeiLiuCoder/Reviso
- Perfil del autor de la cuantización: https://huggingface.co/prithivMLmods
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Artículo «Reviso: Not All Visual Evidence Deserves Equal Attention in Video Captioning»: no disponible (citado en la model card sin enlace directo en la información proporcionada)
- Repositorio GitHub de Reviso: no disponible (citado en la model card sin URL en la información proporcionada)
