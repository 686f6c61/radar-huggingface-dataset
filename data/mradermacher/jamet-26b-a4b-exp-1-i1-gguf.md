# mradermacher/Jamet-26B-A4B-EXP-1-i1-GGUF

## Resumen

Jamet-26B-A4B-EXP-1-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo Hastagaras/Jamet-26B-A4B-EXP-1, un modelo conversacional en inglés de aproximadamente 25.230 millones de parámetros totales. La nomenclatura "26B-A4B" indica una arquitectura de mezcla de expertos (MoE) con unos 4.000 millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible. El sufijo "EXP-1" sugiere una versión experimental del modelo base.

El repositorio incluye cuantizaciones estáticas e imatrix (i1) en una amplia gama de tipos, desde IQ1_S de 8,4 GB hasta Q6_K de 22,7 GB, lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo con 24 GB o más. Todas las variantes están en formato GGUF, listas para llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp, etc.).

La relevancia de esta ficha radica en que el modelo original apenas cuenta con documentación pública: la model card del cuantizador no aporta detalles sobre arquitectura interna, datos de entrenamiento, licencia ni benchmarks. Por tanto, esta ficha describe con rigor lo que sí está documentado (tamaño, cuantizaciones, idioma, formato) y marca explícitamente como "no disponible" todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (inferida de la nomenclatura "26B-A4B"; no confirmada en la documentación) |
| Parametros totales | 25.233.142.046 (≈25,23 B) |
| Parametros activos | ≈4 B (inferido de "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (estáticas e imatrix i1) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base usa safetensors |
| Tamano del repo | 300,9 GB (incluye todas las cuantizaciones) |
| Modelo base | Hastagaras/Jamet-26B-A4B-EXP-1 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. La nomenclatura "26B-A4B" es coherente con un transformer de mezcla de expertos (MoE) con aproximadamente 25.230 millones de parámetros totales y unos 4.000 millones activos por token, patrón habitual en modelos tipo Mixtral o Qwen-MoE, pero no hay confirmación explícita en la model card ni en los metadatos. Tampoco se documenta el número de capas, la dimensión oculta, el número de expertos ni el mecanismo de enrutamiento.

Respecto al entrenamiento, no se dispone de información sobre el volumen de tokens, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El modelo base se presenta como "experimental" (EXP-1), lo que sugiere que puede tratarse de un checkpoint de investigación sin garantías de estabilidad. El cuantizador ha generado las variantes i1 con fichero imatrix, lo que indica que se calculó una matriz de importancia para mejorar la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Compatible con el pipeline de transformers y con endpoints compatibles (etiqueta "endpoints_compatible").
- Uso mediante llama.cpp y derivados gracias al formato GGUF.
- Capacidad de razonamiento multi-turno: no confirmada explícitamente, pero esperable en un modelo conversacional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización i1-Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB (RTX 3090/4090) o en una configuración con offload parcial a CPU, lo que permite ejecutar un modelo de ~25 B en hardware de consumo.
- Asistentes conversacionales en inglés: la etiqueta "conversational" y el formato GGUF lo hacen adecuado para chatbots locales integrados en aplicaciones de escritorio mediante llama.cpp u Ollama, sin dependencia de APIs externas.
- Prototipado e investigación: al ser un modelo experimental, es útil para estudiar el comportamiento de arquitecturas MoE de ~25 B y comparar la degradación de calidad entre cuantizaciones (de IQ1_S a Q6_K).
- Evaluación de cuantizaciones: el repositorio ofrece 23 variantes de cuantización, lo que permite medir empíricamente el equilibrio calidad/tamaño en tareas concretas y elegir la más adecuada para un presupuesto de VRAM dado.
- Generación de texto en entornos con recursos limitados: las variantes IQ2/IQ3 (9-14 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, útil para pruebas de concepto y demos.
- Fine-tuning o destilación posterior: aunque el GGUF no es ideal para entrenamiento, el modelo base en safetensors puede servir como punto de partida para ajustes con LoRA en tareas específicas en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero, más overhead de contexto y KV cache):
  - IQ1_S: ~8,4 GB
  - IQ2_M: ~10,5 GB
  - IQ3_S: ~12,3 GB
  - IQ4_XS: ~14,0 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,2 GB
  - Q6_K: ~22,7 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 3090 (24 GB) equivalente; A100/H100 para las variantes de mayor precisión y contextos largos.
- GPU de consumo: sí, cabe en RTX 3060 12 GB con IQ2/IQ3, y en RTX 4080/4090 con Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para el modelo base, transformers.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~4 B activos, el throughput esperado sería superior al de un modelo denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Jamet-26B-A4B-EXP-1 | 25,23 B | ~4 B (inferido) | no disponible | no disponible | safetensors, GGUF |
| Mixtral 8x7B | 46,7 B | ~12,9 B | 32k | Apache 2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | 14,3 B | ~2,7 B | 32k | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7 B | ~2,4 B | 32k | no disponible | safetensors, GGUF |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo Jamet que permitan contrastarlo con estas alternativas. La principal diferencia es la ausencia de licencia y documentación pública, frente a modelos con licencias permisivas y benchmarks publicados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo importante para producción.
- Modelo experimental: el sufijo "EXP-1" indica que puede tratarse de un checkpoint inestable o sin validación exhaustiva.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluación de seguridad publicados, el riesgo es difícil de cuantificar.
- Sesgos: no documentados; al desconocerse los datos de entrenamiento, no se pueden evaluar sesgos de género, raza o ideológicos.
- Cuantizaciones de muy baja precisión (IQ1, IQ2): el propio cuantizador advierte de calidad reducida ("for the desperate", "very low quality") en las variantes más pequeñas.
- Sin soporte documentado de tool calling ni agentes: no se recomienda para pipelines que dependan de function calling sin validación previa.
- Repositorio de 300,9 GB: descargar el repo completo no es práctico; conviene descargar solo el fichero GGUF de la cuantización elegida.

## Enlaces

- Repositorio GGUF (imatrix): https://huggingface.co/mradermacher/Jamet-26B-A4B-EXP-1-i1-GGUF
- Repositorio GGUF (estáticas): https://huggingface.co/mradermacher/Jamet-26B-A4B-EXP-1-GGUF
- Modelo base: https://huggingface.co/Hastagaras/Jamet-26B-A4B-EXP-1
- Página de descargas del cuantizador: https://hf.tst.eu/model#Jamet-26B-A4B-EXP-1-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
