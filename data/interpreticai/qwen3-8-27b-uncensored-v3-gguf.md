# InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3 es un ajuste fino de NousResearch/Arete-27B, a su vez un post-entrenamiento de Qwen/Qwen3.8-27B, orientado a eliminar la censura política residual que persiste en el modelo base cuando se le consulta en chino. Lo desarrolla InterpreticAI (autor: Thomas Young) y se publica bajo licencia Apache 2.0, conservando la atribución de Qwen y Nous Research. El modelo tiene 26.895.998.464 parámetros totales (aproximadamente 27B) y mantiene la misma arquitectura y disposición de ficheros que Arete-27B.

El problema que aborda es concreto: Arete-27B ya elimina la mayor parte de la propaganda en inglés, pero en preguntas políticas formuladas en chino seguía censurando cerca de la mitad de las respuestas. Uncensored-v3 reduce esa tasa de censura del 50,4% al 2,6% sobre el banco de 115 preguntas políticamente sensibles de Pan y Xu (2026), y baja la propaganda en inglés del 1,0% al 0,5% sobre las 803 indicaciones de Propaganda_Eval de Nous Research.

La relevancia actual es doble: por un lado, ofrece una variante con capacidad de visión (pipeline image-text-to-text, con proyector multimodal separado) en cuantización GGUF Q4_K_M que cabe en una sola GPU de 24 GB; por otro, sirve como herramienta de investigación para estudiar sesgos y censura en modelos derivados de Qwen. Esta ficha describe la versión GGUF Q4_K_M, cuantizada a partir del checkpoint BF16 de Uncensored-v3, que es sobre el que se ejecutaron las evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atención y capas no disponibles) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (valor usado en el ejemplo de despliegue con `-c 65536`; máximo nativo no disponible) |
| Tipos de cuantizacion | GGUF Q4_K_M (16,6 GB) e IQ3_XXS (repo hermano); BF16, FP8 y MLX 4-bit en otras variantes del proyecto |
| Idiomas soportados | no disponible (evaluado en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) más proyector de visión GGUF F16 (`mmproj`) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen3.8-27B a través de NousResearch/Arete-27B. La model card no detalla la arquitectura interna (número de capas, tipo de atención, cabezas, etc.), pero sí confirma que Uncensored-v3 conserva la misma arquitectura y disposición de ficheros que Arete-27B, y que es un checkpoint BF16 completo. No se especifica el número de tokens de entrenamiento ni la composición del dataset de ajuste.

La innovación principal no es arquitectónica sino de alineación: se elimina la censura política residual en chino mediante un ajuste fino posterior sobre Arete-27B. La evaluación se hizo en modo no-thinking, decodificación greedy y con un juez LLM idéntico para los tres modelos comparados. Una diferencia técnica relevante respecto a la versión v2 es que esta v3 no incluye capa de predicción multi-token (MTP), por lo que debe servirse con decodificación estándar, sin decodificación especulativa MTP. El paquete incluye un proyector de visión separado (`mmproj`, F16, 0,93 GB) que habilita la entrada de imágenes.

## Capacidades

- Generación de texto conversacional multi-turno, con modo thinking y modo no-thinking configurables mediante plantilla de chat.
- Razonamiento y respuesta a preguntas políticas y de actualidad sin las evasiones típicas del modelo base en chino.
- Entrada de imágenes (image-text-to-text) mediante el proyector multimodal `mmproj` en F16.
- Capacidades multilingües: evaluado explícitamente en inglés y chino; el resto de idiomas no está documentado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y uso con plantilla Jinja (`--jinja`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación sobre censura y sesgo político en LLM: el modelo permite medir la tasa de evasión y de respuestas alineadas con el Partido Comunista Chino sobre el banco de Pan y Xu (2026), sirviendo como referencia de un modelo con censura casi eliminada (2,6%).
- Análisis comparativo de alineación: al compartir arquitectura con Arete-27B y Qwen3.8-27B, permite aislar el efecto del ajuste fino sobre la propaganda en inglés (0,5% frente a 1,0% y 24,5%) manteniendo el resto de variables constantes.
- Despliegue local en una GPU de consumo: la cuantización Q4_K_M (16,6 GB) más el proyector F16 (0,93 GB) cabe en una GPU de 24 GB, lo que facilita experimentación en estaciones de trabajo con RTX 4090.
- Asistente conversacional con contexto largo: con 65.536 tokens de ventana en el ejemplo de `llama-server`, puede gestionar conversaciones multi-turno o documentos extensos sin truncar.
- Procesamiento de documentos con imágenes: el pipeline image-text-to-text permite extraer y razonar sobre contenido de capturas, gráficos o páginas escaneadas combinándolo con texto.
- Evaluación de robustez frente a jailbreaks y prompts adversariales: útil para equipos de seguridad que quieran contrastar el comportamiento de un modelo deliberadamente descensurado frente a uno alineado.
- Generación de contenido en chino e inglés sin evasivas: para aplicaciones editoriales o de análisis que requieran respuestas directas sobre temas políticamente sensibles, con la advertencia de verificación factual.

## Benchmarks y rendimiento

Los datos publicados corresponden al checkpoint BF16 de Uncensored-v3, no a esta cuantización GGUF Q4_K_M. Se evaluó en modo no-thinking, decodificación greedy y con un único juez LLM.

Censura política en chino (banco de 115 preguntas de Pan y Xu, 2026; menor es mejor salvo donde se indica):

| Métrica | Qwen3.8-27B | Arete-27B | Uncensored-v3 |
|---|---|---|---|
| Respuestas censuradas | 83,5% | 50,4% | 2,6% |
| Rechaza o evade | 49,6% | 22,6% | 0,9% |
| Reescribe en consignas del PCCh | 32,2% | 27,8% | 1,7% |
| Se alinea con valores del PCCh | 100% | 30% | 20% |
| Tema correcto y respuesta abierta (mayor es mejor) | 12,2% | 38,3% | 80,9% |

Propaganda en inglés (Propaganda_Eval de Nous Research, 803 indicaciones; menor es mejor):

| Modelo | Respuestas con propaganda |
|---|---|
| Qwen3.8-27B | 24,5% |
| Arete-27B | 1,0% |
| Qwen3.8-27B-Uncensored-v3 | 0,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17,5 GB para Q4_K_M (16,6 GB de pesos más 0,93 GB del proyector de visión), más overhead de contexto KV; el autor indica que cabe en una sola GPU de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para despliegues con mayor contexto o concurrencia; no se especifican cifras de throughput.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM (RTX 4090, RTX 3090) usando Q4_K_M; para IQ3_XXS se reduce el requisito, aunque el tamaño exacto no está disponible en esta ficha.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y Ollama según el autor; el ejemplo oficial usa `llama-server` con `-ngl 999 -c 65536 --jinja` y `--mmproj` para visión.
- Latencia y throughput: no disponibles. El modelo no incluye capa MTP, por lo que no admite decodificación especulativa MTP; para ello debe usarse la variante v2.
- Parámetros de muestreo recomendados: thinking `temperature=1.0, top_p=0.95, top_k=20`; no-thinking `temperature=0.7, top_p=0.8, top_k=20, presence_penalty=1.5`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Censura en chino | Propaganda en inglés | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3 | ~27B | 65.536 (ejemplo) | 2,6% | 0,5% | Apache 2.0 | BF16, GGUF, MLX 4-bit |
| Arete-27B (Nous Research) | ~27B | no disponible | 50,4% | 1,0% | Apache 2.0 | BF16 (base) |
| Qwen3.8-27B | ~27B | no disponible | 83,5% | 24,5% | Apache 2.0 | BF16 (base) |
| Qwen3.8-27B-Uncensored-v2 | ~27B | no disponible | 3,5% | no disponible | Apache 2.0 | BF16, FP8, GGUF, IQ3_XXS |

La diferencia clave entre v2 y v3 es la base (v2 parte de Qwen3.8-27B y v3 de Arete-27B) y la presencia de MTP: v2 lo incluye y v3 no. Para menor censura se recomienda v3; para decodificación especulativa MTP y FP8, v2.

## Limitaciones y advertencias

- Cada modelo se generó una sola vez por benchmark, por lo que las métricas tienen ruido de muestreo no cuantificado.
- Una respuesta sustantiva no implica que sea correcta: el propio autor recomienda verificar las afirmaciones factuales de forma independiente.
- El modelo está deliberadamente descensurado; puede producir contenido político sensible, ofensivo o controvertido sin filtros, lo que exige moderación externa en producción.
- La evaluación se centra en inglés y chino; el comportamiento en otros idiomas no está documentado.
- No incluye capa MTP, así que no admite decodificación especulativa MTP; para ello hay que usar la variante v2.
- Los benchmarks publicados corresponden al checkpoint BF16; el rendimiento de la cuantización Q4_K_M puede diferir.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar la atribución y los avisos de Qwen y Nous Research indicados en el fichero LICENSE.
- Los sesgos conocidos más allá de la censura política no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- Checkpoint BF16 de referencia: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Variante v2 (con MTP y FP8): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Variante v2 FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Variante v2 GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Variante v2 GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Variante v3 GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Variante v3 MLX 4-bit: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-MLX-4bit
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Página de Arete (Nous Research): https://nousresearch.com/arete
- Paper de censura política (Pan y Xu, 2026): https://doi.org/10.1093/pnasnexus/pgag013
- DOI del modelo: https://doi.org/10.57967/hf/11545
