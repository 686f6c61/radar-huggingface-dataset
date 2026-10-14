# Alegamietea/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una versión "sin censura" (uncensored) del modelo Qwen3.5-9B, publicada en HuggingFace por el usuario Alegamietea y atribuida en su model card al proyecto HauhauCS. El modelo conserva la arquitectura y capacidades del original, pero elimina los mecanismos de rechazo: según la model card, presenta 0 rechazos sobre 465 pruebas, manteniendo el 100 % de las capacidades del modelo base. Se distribuye exclusivamente en formato GGUF con varias cuantizaciones.

Se trata de un modelo denso de 8.953.803.264 parámetros (≈8,95B), 32 capas y una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención softmax completa en proporción 3:1. Incorpora una ventana de contexto nativa de 262K tokens, ampliable a 1M mediante YaRN, soporte multimodal nativo (texto, imagen y vídeo) y predicción multi-token (MTP).

Su relevancia radica en dos factores: por un lado, aplica la técnica de "uncensoring" a un modelo multimodal de última generación sin degradar sus capacidades; por otro, ofrece una ventana de contexto muy amplia orientada a cargas de producción con despliegues en llama.cpp, LM Studio o vLLM. El repositorio es de creación reciente (14 de octubre de 2026) y no registra descargas ni "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención softmax completa (proporción 3:1), 32 capas |
| Parámetros totales | 8.953.803.264 (≈8,95B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens nativos; ampliable a 1M con YaRN |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | Inglés y chino (etiquetas); la model card declara 201 idiomas y vocabulario de 248K tokens |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones anteriores); codificador de visión aparte en mmproj (BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida poco habitual: mezcla capas de Gated DeltaNet (atención lineal) con capas de atención softmax completa en una proporción 3:1, sobre un total de 32 capas. Este diseño busca reducir el coste computacional del contexto largo frente a un transformer de atención completa tradicional. Incluye además soporte de predicción multi-token (MTP) y es multimodal de forma nativa, con un codificador de visión que se distribuye como archivo `mmproj` independiente (880 MB en BF16). El vocabulario es de 248K tokens y la model card declara cobertura para 201 idiomas.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO o cualquier técnica de alineación). Respecto al fine-tune "uncensored", la model card indica que no se han modificado los datasets ni las capacidades, y que la intervención se limita a la eliminación de los rechazos. No se documentan el método, el dataset ni el procedimiento técnico empleados para dicho uncensoring. La arquitectura base fue publicada, según la model card, el 2 de marzo de 2026.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" y en modo directo ("non-thinking"), con parámetros de muestreo recomendados distintos para cada uno.
- Procesamiento multimodal nativo: entrada de texto, imagen y vídeo (requiere cargar el archivo `mmproj` junto al GGUF principal).
- Ventana de contexto de 262K tokens, ampliable a 1M con YaRN, adecuada para documentos largos y conversaciones multi-turno extensas.
- Multilingüe: inglés y chino confirmados por las etiquetas; la model card declara soporte de hasta 201 idiomas.
- Predicción multi-token (MTP) como mecanismo de aceleración de la decodificación.
- Respuesta sin rechazos: según la model card, 0 rechazos sobre 465 pruebas, con eliminación exhaustiva de bloqueos en la variante "Aggressive".
- Etiquetado como `endpoints_compatible` y `conversational` en HuggingFace, lo que sugiere compatibilidad con inferencia conversacional servida.
- No se especifica en la información disponible soporte explícito de tool calling o function calling, ni comportamiento de agente multi-paso.

## Casos de uso

- Investigación sobre alineación y seguridad: permite comparar el comportamiento del modelo base con la variante sin rechazos para estudiar cómo se manifiestan los mecanismos de censura en modelos multimodales.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas que los modelos alineados suelen rechazar, aprovechando la ventana de 262K tokens para obras largas.
- Análisis de documentos extensos con contenido sensible: resúmenes y extracción de información de informes legales, médicos o periodísticos que pueden incluir material que otros modelos filtran.
- Procesamiento multimodal local: descripción de imágenes y vídeo en entornos sin conexión, cargando el GGUF junto al `mmproj`, por ejemplo en LM Studio o koboldcpp.
- Despliegue en hardware de gama de consumo: las cuantizaciones Q4_K_M (5,3 GB) y Q6_K (6,9 GB) permiten ejecutar el modelo en GPU con 8-12 GB de VRAM, útil para prototipado local.
- Traducción y asistentes bilingües inglés-chino: gracias al vocabulario de 248K tokens y a las capacidades multilingües declaradas.
- Redacción técnica asistida en dominios regulados: donde los disclaimers automáticos o rechazos del modelo base interrumpen el flujo, la variante "Aggressive" genera el contenido íntegro.
- Inferencia de alto rendimiento en servidor: la model card recomienda vLLM, SGLang o KTransformers para producción y alto throughput, aprovechando contexto largo y MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta la métrica de rechazos (0 sobre 465 pruebas), que es una medida de comportamiento frente a peticiones sensibles y no un benchmark de capacidades (MMLU, HumanEval, GSM8K u otros). No se dispone de datos comparativos de rendimiento frente al modelo base ni frente a alternativas.

## Requisitos de hardware

Estimaciones derivadas del tamaño de los archivos GGUF publicados; no son cifras oficiales. El consumo real depende de la longitud de contexto activa y del KV cache, que con ventanas de 128K-262K tokens puede superar ampliamente el tamaño de los pesos.

- Q4_K_M (5,3 GB): aproximadamente 6-7 GB de VRAM con contexto moderado; cómodo en GPUs de 8-12 GB.
- Q6_K (6,9 GB): aproximadamente 8 GB de VRAM; viable en RTX 3060 12 GB, RTX 4070, etc.
- Q8_0 (8,9 GB): aproximadamente 10-11 GB; requiere GPUs de 12-16 GB.
- BF16 (17 GB): aproximadamente 18-20 GB; pensado para RTX 4090 24 GB, A100, H100.
- Codificador de visión (mmproj BF16, 880 MB): a añadir si se usan entradas de imagen o vídeo.
- GPU recomendadas: por modelo, RTX 3060/4070/4090 para cuantizaciones bajas y medias; A100 o H100 para BF16 y despliegues de producción.
- Opciones de despliegue: llama.cpp, LM Studio, Jan y koboldcpp (confirmado en la model card); vLLM, SGLang y KTransformers recomendados por los autores de Qwen para producción y alto throughput. El soporte en llama.cpp es reciente y exige una build actualizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 8,95B (denso) | 262K (1M con YaRN) | Sí (texto, imagen, vídeo) | Apache-2.0 | GGUF, repo reciente (0 descargas) |
| Qwen3.5-9B (base) | 8,95B (denso) | 262K (1M con YaRN) | Sí | Apache-2.0 | Modelo original alineado; rechaza peticiones sensibles |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | No disponible | No disponible | No disponible | No disponible | Variante de 4B de la misma familia, referenciada en la model card |

No se dispone de datos de otros modelos comparables de la misma categoría (9B densos, multimodal, uncensored) en la información proporcionada. No se conocen resultados de benchmarks que permitan comparar rendimiento entre las opciones anteriores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al ser un modelo sin alineación de seguridad, es probable que reproduzca sesgos y contenido dañino sin filtro, pero no se aportan datos al respecto.
- Riesgo de alucinación: no evaluado. La model card no ofrece métricas de fiabilidad factual.
- Sin benchmark de capacidades: la afirmación de "cero pérdida de capacidad" no está respaldada por ningún resultado reproducible en la información disponible.
- Aviso de contenido: la variante "Aggressive" está diseñada para no rechazar ninguna petición, lo que implica riesgo de generar contenido ilegal, dañino o desinformación. No se recomienda su uso en aplicaciones de cara al público sin filtrado externo.
- Disclaimers residuales: la model card advierte de que el modelo puede añadir frases del tipo "esto es información general, no asesoramiento legal" al final de algunas respuestas, heredadas del entrenamiento del modelo base.
- Limitación de contexto en la práctica: aunque se declara una ventana de 262K-1M tokens, la model card recomienda mantener al menos 128K para preservar el modo "thinking", lo que implica un consumo de memoria elevado.
- Idiomas: las etiquetas confirman inglés y chino; la afirmación de 201 idiomas no está respaldada por evaluaciones publicadas.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B podría tener condiciones adicionales que conviene verificar antes de explotarlo en producción. No se especifica si el model card reproduce fielmente la licencia del original.
- Inconsistencia de autoría: el repositorio figura a nombre de Alegamietea, mientras que la model card hace referencia al proyecto HauhauCS y a la familia de modelos de ese usuario. Conviene confirmar la procedencia y la integridad de los pesos antes de utilizarlos en producción.
- Repositorio sin validación: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia externa de calidad o reproducibilidad.
- Soporte de tool calling y uso como agente: no especificado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alegamietea/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante de 4B (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Perfil del proyecto HauhauCS: https://huggingface.co/HauhauCS
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
