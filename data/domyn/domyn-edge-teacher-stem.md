# domyn/Domyn-Edge-Teacher-STEM

## Resumen

Domyn Edge Teacher STEM es un modelo de lenguaje de 4B parámetros desarrollado por Domyn como parte de su familia Domyn Edge, una liberación por fases de recursos abiertos. Se trata de un transformer denso entrenado específicamente para actuar como "profesor" de dominio STEM dentro del protocolo de post-entrenamiento de destilación on-policy multi-profesor (MOPD) del proyecto: genera y puntúa token a token las respuestas del modelo estudiante en las áreas de ciencia, tecnología, ingeniería y matemáticas.

El modelo parte de Domyn Edge SFT y se somete a dos etapas adicionales: un pase supervisado (SFT) de una época sobre una mezcla exclusivamente STEM con contexto de 64k, seguido de GRPO asíncrono sobre 48.329 preguntas de ciencia de opción múltiple con recompensa binaria. Los pesos se almacenan en bfloat16 y el modelo se distribuye bajo licencia Apache 2.0.

Es relevante ahora porque forma parte de una liberación completamente abierta (pesos, datos de post-entrenamiento y protocolo) orientada a investigación y reproducibilidad. No es un asistente de propósito general: su función es servir como componente evaluador dentro de un pipeline de destilación, y el propio autor advierte que no debe desplegarse en aplicaciones de cara al usuario sin una capa de seguridad propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (misma arquitectura y tokenizador que Domyn Edge SFT) |
| Parámetros totales | 3.928.787.968 (aproximadamente 4B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64.000 tokens (contexto de entrenamiento SFT) |
| Tipos de cuantización | Pesos publicados en bfloat16; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, código personalizado `domynedge`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de aproximadamente 4B parámetros que reutiliza la arquitectura y el tokenizador de Domyn Edge SFT, con pesos en bfloat16 y un chat template propio que abre el turno de sistema con una línea de identidad fija ("You are Domyn Edge, a model trained by Domyn."). El entrenamiento consta de dos etapas sobre el modelo base: primero un SFT de una época con contexto de 64k sobre una mezcla exclusivamente STEM que incluye ciencia, preguntas de razonamiento general y QA sobre documentos largos; después, un GRPO asíncrono (group relative policy optimization) sobre 48.329 preguntas de ciencia de opción múltiple, con una recompensa binaria calculada sobre la opción extraída de la respuesta.

La innovación técnica principal no está en la arquitectura sino en el rol del modelo dentro del protocolo de post-entrenamiento: actúa como uno de los profesores de dominio que puntúan token a token las rollouts del estudiante en la etapa MOPD (destilación on-policy multi-profesor). El modelo tiende a razonar más de 10.000 tokens en preguntas difíciles, por lo que es necesario reservar espacio suficiente en `max_new_tokens` durante la inferencia.

## Capacidades

- Generación de texto y razonamiento extendido (thinking mode activado por defecto en las evaluaciones), con cadenas de razonamiento que superan los 10k tokens en problemas difíciles.
- Razonamiento matemático: resolución de problemas de competición (AIME 2026, MATH) y matemáticas multilingües (MGSM en alemán, inglés, español, francés y ruso).
- Conocimiento científico y razonamiento experto: física, química, biología, informática e ingeniería (GPQA Diamond, MMLU-Pro STEM).
- Puntuación de respuestas token a token en su dominio, que es su función principal dentro del pipeline MOPD.
- Function calling: resultados evaluados en BFCL v4 (non-live, live, multi-turn y memory).
- Capacidades agénticas limitadas: evaluado en SWE-bench Verified.
- Generación de código: evaluado en LiveCodeBench v6 (conjunto completo de 1.055 problemas).
- Capacidades multilingües parciales: aunque el modelo está etiquetado solo para inglés, obtiene 88,4 en MGSM con prompts en cinco idiomas.
- No dispone de capacidades de visión ni audio según la información disponible.

## Casos de uso

- Destilación on-policy multi-profesor: usar el modelo como profesor STEM que puntúa token a token las respuestas del estudiante Domyn Edge durante el post-entrenamiento, replicando el protocolo MOPD publicado por Domyn.
- Investigación en RL con recompensas verificables: el checkpoint sirve como referencia de un modelo ajustado con GRPO sobre preguntas de opción múltiple con recompensa binaria, útil para estudiar dinámicas de entrenamiento y longitud de razonamiento.
- Evaluación automática de razonamiento científico: emplear el modelo para puntuar o clasificar respuestas de otros modelos en preguntas de física, química, biología y matemáticas, aprovechando su especialización en GPQA Diamond y MMLU-Pro STEM.
- Reproducibilidad de resultados: al liberarse junto con los datos de post-entrenamiento (Domyn-Edge-Teacher-STEM-Mix), permite reproducir las cifras publicadas en la model card con vLLM en bfloat16 y los parámetros de muestreo indicados.
- Tutoría científica sin interfaz de usuario: integrado en pipelines internos de generación de explicaciones paso a paso para problemas STEM, con la advertencia de que requiere una capa de seguridad propia antes de exponerlo a usuarios finales.
- Generación de datos sintéticos STEM: producir cadenas de razonamiento largas (más de 10k tokens) sobre problemas científicos para aumentar datasets de entrenamiento de modelos menores.
- Análisis de documentos técnicos largos: su contexto de 64k y su entrenamiento en QA sobre documentos largos permiten resumir o extraer conclusiones de artículos científicos y manuales técnicos extensos.

## Benchmarks y rendimiento

Comparación del profesor STEM con el estudiante Domyn Edge SFT en la suite general (porcentajes):

| Grupo | Benchmark | Métrica | Domyn Edge SFT | Teacher STEM | Δ |
|---|---|---|---:|---:|---:|
| Matemáticas | AIME 2026 | avg@10 | 61,3 | 61,3 | +0,0 |
| Matemáticas multilingües | MGSM (de, en, es, fr, ru) | accuracy | 85,8 | 88,4 | +2,6 |
| Conocimiento y razonamiento | GPQA Diamond | pass@1 | 56,3 | 68,7 | +12,4 |
| Seguimiento de instrucciones | IFBench | prompt strict pass@1 | 24,1 | 21,3 | -2,8 |
| Function calling | BFCL v4 (overall, sin web search) | pass@1 | 36,5 | 36,3 | -0,2 |
| Function calling | BFCL v4 (non-live) | pass@1 | 51,9 | 56,8 | +4,9 |
| Function calling | BFCL v4 (live) | pass@1 | 75,9 | 76,7 | +0,8 |
| Function calling | BFCL v4 (multi-turn) | pass@1 | 35,9 | 32,9 | -3,0 |
| Function calling | BFCL v4 (memory) | pass@1 | 27,3 | 27,3 | +0,0 |
| Agéntico | SWE-bench Verified | pass@1 | 33,6 | 35,4 | +1,8 |
| Código | LiveCodeBench (full set, v6) | pass@1 | 73,0 | 71,0 | -2,0 |

Comparación con Qwen3.5 4B en la suite STEM (porcentajes):

| Benchmark | Métrica | Teacher STEM | Qwen3.5 4B | Δ |
|---|---|---:|---:|---:|
| MATH | accuracy | 93,0 | 96,7 | -3,7 |
| MGSM (de, en, es, fr, ru) | accuracy | 88,4 | 90,2 | -1,8 |
| GPQA Diamond | pass@1 | 69,1 | 77,3 | -8,2 |
| MMLU-Pro STEM (media) | accuracy | 84,0 | 87,5 | -3,5 |
| MMLU-Pro STEM: matemáticas | accuracy | 91,6 | 93,3 | -1,7 |
| MMLU-Pro STEM: biología | accuracy | 86,5 | 89,5 | -3,0 |
| MMLU-Pro STEM: química | accuracy | 85,8 | 89,6 | -3,8 |
| MMLU-Pro STEM: física | accuracy | 87,4 | 89,7 | -2,3 |
| MMLU-Pro STEM: informática | accuracy | 80,0 | 81,2 | -1,2 |
| MMLU-Pro STEM: ingeniería | accuracy | 66,9 | 75,4 | -8,5 |
| DROP | F1 | 83,1 | 86,3 | -3,2 |
| LiveBench math | pass@1 | 72,1 | 78,5 | -6,4 |
| LiveBench reasoning | pass@1 | 72,3 | 83,9 | -11,6 |

Configuración de evaluación: servido con vLLM en bfloat16 y el chat template del repositorio, thinking activado, temperatura 1,0, top-p 0,95, top-k 20, min-p 0; en la suite STEM con penalización de presencia 1,5. Qwen3.5 4B se evaluó con los mismos ajustes y su propio chat template.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos (3,93B parámetros × 2 bytes), más overhead de KV cache; con contexto de 64k la caché puede requerir varios GB adicionales.
- Cuantización a 8 bits: alrededor de 4 GB de pesos; a 4 bits: alrededor de 2 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: A100 o H100 para servir con contexto completo de 64k y throughput alto; RTX 4090 (24 GB) suficiente para bfloat16 con contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bfloat16 y en tarjetas de 8-12 GB si se cuantiza, siempre que se gestione la longitud de contexto.
- Opciones de despliegue: vLLM es la opción documentada por el autor (usada en todas las evaluaciones); transformers con `trust_remote_code=True` por el código personalizado `domynedge`. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Téngase en cuenta que el modelo genera con frecuencia más de 10.000 tokens de razonamiento en preguntas difíciles, lo que incrementa la latencia de forma significativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | MMLU-Pro STEM (media) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Domyn Edge Teacher STEM | ~3,93B denso | 64k | 69,1 | 84,0 | Apache 2.0 | Hugging Face |
| Qwen3.5 4B | ~4B | no disponible en la información | 77,3 | 87,5 | no disponible en la información | Hugging Face |
| Domyn Edge SFT (estudiante) | ~3,93B denso | no disponible en la información | 56,3 (suite general) | no disponible | no disponible en la información | Hugging Face |

El profesor STEM supera a su modelo base (Domyn Edge SFT) en GPQA Diamond (+12,4 puntos), MGSM (+2,6) y SWE-bench Verified (+1,8), pero queda por debajo de Qwen3.5 4B en todos los benchmarks STEM publicados, con brechas de entre 1,2 y 11,6 puntos. No se dispone de datos de comparación con otros modelos de 4B en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un profesor de dominio diseñado para puntuar rollouts dentro del pipeline MOPD; su uso fuera de ese contexto no está respaldado por el autor.
- Trabajo de seguridad incompleto: no se realizó ajuste de seguridad ni red teaming dedicado; el autor desaconseja explícitamente desplegarlo en aplicaciones de cara al usuario sin una capa de seguridad propia.
- Riesgo de alucinación: no se documentan mitigaciones específicas más allá del entrenamiento con GRPO sobre preguntas verificables; en dominios fuera de STEM el comportamiento no está caracterizado.
- Idiomas: etiquetado oficialmente solo para inglés; los resultados multilingües en MGSM son parciales y no implican soporte general en otros idiomas.
- Seguimiento de instrucciones y function calling: ligeramente peor que el estudiante en IFBench (-2,8), BFCL multi-turn (-3,0) y BFCL overall (-0,2).
- Longitud de razonamiento: las respuestas pueden superar los 10k tokens, lo que encarece la inferencia y puede agotar `max_new_tokens` si no se dimensiona correctamente.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación de seguridad traslada al integrador toda la responsabilidad sobre sesgos y contenido dañino.
- Datos de benchmarks: las cifras publicadas provienen del propio autor y no se han replicado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/domyn/Domyn-Edge-Teacher-STEM
- Modelo base (Domyn Edge SFT): https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de post-entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-STEM-Mix
- Qwen3.5 4B (modelo de comparación): https://huggingface.co/Qwen/Qwen3.5-4B
- Organización Domyn en Hugging Face: https://huggingface.co/domyn
