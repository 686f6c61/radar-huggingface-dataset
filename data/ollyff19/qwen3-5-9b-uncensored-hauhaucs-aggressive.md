# olLyff19/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una variante sin censura (uncensored) del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario olLyff19 bajo el sello de HauhauCS. El modelo base es un transformer denso de 8.953.803.264 parámetros (aproximadamente 9B) con una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1, 32 capas y un contexto nativo de 262.000 tokens extensible a 1M mediante YaRN.

La modificación consiste en la eliminación de los rechazos (refusals) del modelo original: el autor afirma haber logrado 0 rechazos sobre 465 pruebas sin degradar las capacidades del modelo base. Se distribuye principalmente en formato GGUF con cuantizaciones desde BF16 hasta Q4_K_M, además de un codificador visual separado (mmproj) que habilita el procesamiento nativo de imágenes y vídeo. La licencia es Apache 2.0, heredada del modelo base.

Es relevante para desarrolladores e investigadores que necesitan un modelo de ~9B con contexto muy largo, capacidades multimodales nativas y comportamiento sin restricciones temáticas para tareas de generación creativa, investigación sobre alineamiento o aplicaciones donde los rechazos del modelo base resultan un obstáculo operativo. No obstante, la ausencia de benchmarks publicados y el carácter reciente de la arquitectura (fechada en 2026-03-02) exigen validación propia antes de su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet (atención lineal) + atención softmax completa en proporción 3:1 |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativo; extensible a 1M con YaRN |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); codificador visual mmproj en BF16 |
| Idiomas soportados | Inglés, chino, multilingüe (201 idiomas según vocabular del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q4_K_M) + mmproj BF16 para visión |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B: un transformer denso de 32 capas que intercala bloques de atención lineal Gated DeltaNet con bloques de atención softmax completa en una proporción 3:1. Esta hibridación busca reducir el coste computacional y de memoria en contextos largos manteniendo la calidad de recuperación de información de la atención completa. Incluye soporte de predicción multi-token (MTP) y un vocabulario de 248.000 tokens que cubre 201 idiomas. El modelo base es nativamente multimodal (texto, imagen y vídeo), y la variante uncensored conserva esa capacidad mediante el archivo mmproj separado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada. Respecto al proceso de modificación, el autor declara que no ha alterado datasets ni capacidades: la intervención se limita a la eliminación de los patrones de rechazo, presumiblemente mediante edición de pesos o ajuste dirigido, aunque no se detalla la metodología técnica empleada. El autor afirma 0 rechazos sobre 465 pruebas y advierte de que el modelo puede añadir ocasionalmente un descargo de responsabilidad breve al final de la respuesta, heredado del entrenamiento del modelo base, sin que ello constituya un rechazo real.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262K tokens nativos.
- Razonamiento con modo "thinking" (por defecto) y modo no-thinking, con parámetros de muestreo recomendados distintos para cada uno.
- Capacidades multimodales nativas: procesamiento de imágenes y vídeo mediante el codificador mmproj.
- Generación de código y matemáticas (heredadas del modelo base; sin benchmarks publicados que lo cuantifiquen).
- Soporte multilingüe amplio: 201 idiomas según el vocabulario del modelo base, con inglés y chino como idiomas principales declarados.
- Comportamiento sin rechazos: el modelo no declina peticiones, incluidas aquellas que el modelo base rechazaría.
- Predicción multi-token (MTP) para acelerar la decodificación.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con runtimes GGUF habituales.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Generación creativa sin restricciones temáticas: el modelo produce narrativa, diálogo y contenido de ficción sin los rechazos del modelo base, adecuado para escritura de novelas, guiones o juegos de rol donde los temas sensibles son parte del contenido legítimo.
- Investigación sobre alineamiento y seguridad: permite estudiar el comportamiento de un modelo sin capas de rechazo frente a su versión alineada, comparando respuestas y midiendo diferencias en dominios sensibles.
- Análisis de documentos largos con imágenes: gracias a los 262K tokens de contexto y al codificador visual, puede procesar informes extensos con figuras, tablas escaneadas o capturas, resumiendo y extrayendo información en una sola pasada.
- Procesamiento de vídeo para descripción y etiquetado: el soporte multimodal nativo permite generar descripciones, transcripciones contextuales o metadatos a partir de clips, útil en pipelines de catalogación de archivos audiovisuales.
- Asistente de atención al cliente multilingüe: con 201 idiomas en vocabulario y contexto largo, puede mantener conversaciones multi-turno con historial extenso y derivar a un humano cuando sea necesario, sin rechazos que interrumpan el flujo.
- Despliegue local en estaciones de trabajo: la cuantización Q4_K_M (5,3 GB) permite ejecutar el modelo en GPU de consumo con 8-12 GB de VRAM mediante llama.cpp, LM Studio o koboldcpp, habilitando prototipado offline sin dependencia de APIs.
- Generación de código en entornos de desarrollo: integrable en asistentes locales de programación con contexto largo para repositorios medianos, aunque la ausencia de benchmarks de HumanEval impide garantizar su calidad frente a alternativas especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): BF16 ~17 GB; Q8_0 ~8,9 GB; Q6_K ~6,9 GB; Q4_K_M ~5,3 GB. Añadir ~0,9 GB si se usa el codificador visual mmproj.
- La caché KV para 262K tokens de contexto es el factor dominante en memoria; con atención lineal híbrida el coste es inferior al de un transformer puro, pero sigue siendo significativo en contextos muy largos. No se dispone de cifras exactas de memoria de caché en la información proporcionada.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto completo; RTX 4090 (24 GB) para BF16 en contextos moderados o Q8_0 con contexto largo; RTX 3090/4080 (16-24 GB) para Q6_K/Q8_0.
- Cabe en GPU de consumo: Q4_K_M (5,3 GB) en GPUs de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070); Q6_K en GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp para GGUF; vLLM, SGLang o KTransformers para producción y alto throughput (recomendado por los autores del modelo base).
- Latencia y throughput: no disponibles en la información proporcionada. El soporte de MTP puede mejorar la velocidad de decodificación, pero no se documentan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | ~9B densos | 262K (1M con YaRN) | Sí (texto, imagen, vídeo) | Apache 2.0 | GGUF | Sin rechazos; sin benchmarks publicados |
| Qwen3.5-9B (base) | ~9B densos | 262K (1M con YaRN) | Sí | Apache 2.0 | Safetensors, GGUF | Modelo original alineado; benchmarks del autor no disponibles en esta ficha |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | ~4B densos | No disponible | No disponible | Apache 2.0 | GGUF | Variante menor del mismo autor; menor huella de memoria |
| Alternativas uncensored de ~8-9B (genéricas) | ~8-9B | Variable | Generalmente solo texto | Variable | GGUF | No se dispone de datos comparativos verificables en la información proporcionada |

No se dispone de resultados de benchmarks del modelo base ni de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de rechazos: el modelo generará contenido que el modelo base declinaría, incluidos temas sensibles. Esto traslada al operador toda la responsabilidad sobre filtrado, moderación y cumplimiento normativo.
- Riesgo elevado de uso indebido: sin capas de rechazo, el modelo puede producir contenido dañino, ilegal o éticamente problemático si se despliega sin salvaguardas externas.
- Alucinación: no hay datos publicados sobre tasas de alucinación; al ser una modificación de pesos sin reentrenamiento declarado, se espera un comportamiento similar al base, pero sin verificación independiente.
- Descargos de responsabilidad residuales: el autor advierte de que el modelo puede añadir avisos breves al final de algunas respuestas, heredados del entrenamiento del base; no son rechazos pero pueden aparecer en producción.
- Arquitectura muy reciente: el soporte en llama.cpp es reciente y puede requerir builds actualizados; la compatibilidad con otras herramientas puede ser incompleta.
- Contexto efectivo: aunque el contexto nativo es de 262K, mantener al menos 128K es necesario para preservar las capacidades de razonamiento según el autor; contextos menores pueden degradar el modo thinking.
- Idiomas: aunque el vocabulario cubre 201 idiomas, solo inglés y chino están declarados explícitamente; el rendimiento en otros idiomas no está verificado.
- Licencia Apache 2.0: permite uso comercial, pero el operador asume la responsabilidad legal del contenido generado; la licencia no exime de cumplir la normativa aplicable sobre contenido.
- Sin benchmarks ni evaluaciones independientes: no hay datos que permitan comparar su calidad con el modelo base ni con alternativas, lo que desaconseja su adopción en producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación comunitaria inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olLyff19/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 4B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Página del autor HauhauCS: https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
