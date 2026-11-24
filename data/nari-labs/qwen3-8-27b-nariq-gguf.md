# nari-labs/Qwen3.8-27B-NariQ-GGUF

## Resumen

NariQ es una familia de cuantizaciones post-entrenamiento (PTQ) del modelo Qwen3.8-27B, desarrollada por nari-labs y distribuida en formato GGUF. El modelo base es un transformer multimodal (image-text-to-text) de 26.906.086.912 parámetros (~26,9 mil millones) orientado a tareas de agente de código, razonamiento matemático y comprensión de imágenes. NariQ aplica una cuantización con codificación trellis, calibrada sobre trazas reales de agentes de programación, y se almacena en un layout que se ejecuta en una sola GPU.

La propuesta central es comprimir el modelo BF16 original (53,8 GB) hasta 10,1 GB (3 bits por peso) manteniendo un rendimiento equivalente a BF16 en tareas agénticas de horizonte largo, matemáticas y comprensión de imágenes. Según la model card, las variantes de 3 y 2,5 bits igualan a BF16 en DeepSWE v1.1, Terminal-Bench 2.1, AIME y RealWorldQA, mientras que la de 2 bits rinde claramente por debajo. El modelo soporta una ventana de contexto completa de 262.144 tokens y modo thinking.

Es relevante ahora porque permite desplegar un modelo de ~27B con capacidades agénticas y multimodales en GPUs de consumo de 24 GB, algo que el BF16 completo no permite. Requiere obligatoriamente el fork de llama.cpp de nari-labs, ya que la cuantización no es compatible con llama.cpp estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 26.906.086.912 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (completa); ~135K–184K segun cuantizacion en GPU de 24 GB |
| Tipos de cuantizacion | 3,0 bpw (10,12 GB), 2,5 bpw (8,44 GB), 2,0 bpw (6,75 GB); proyector vision mmproj BF16 (0,93 GB) |
| Idiomas soportados | no disponible (evaluado en MGSM con 11 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere fork de llama.cpp de nari-labs) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa texto e imágenes (pipeline image-text-to-text) e incorpora un modo thinking. NariQ no reentrena el modelo, sino que aplica una cuantización post-entrenamiento con codificación trellis (trellis-coded PTQ). La calibración se realizó sobre trazas reales de agentes de programación, lo que explica su buen comportamiento en tareas agénticas de horizonte largo frente a cuantizaciones genéricas.

Los detalles sobre el número de tokens de entrenamiento del modelo base, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada. La innovación técnica destacable es el esquema de cuantización trellis con layout optimizado para ejecución en una sola GPU, junto con el requisito de un fork específico de llama.cpp (nari-llama.cpp) que implementa el decodificador correspondiente. El informe técnico está disponible en arXiv (2611.26157).

## Capacidades

- Generación de texto y razonamiento con modo thinking activable.
- Codificación y tareas de agente de programación (edición de repositorios, resolución de tests, terminal).
- Razonamiento matemático (evaluado en AIME 25+26).
- Comprensión de imágenes mediante el proyector de visión mmproj.
- Capacidades multilingües (evaluado en MGSM con 11 idiomas).
- Soporte de contexto largo de hasta 262.144 tokens.
- Integración con CLI de agentes (las evaluaciones usan Claude Code CLI).
- Capacidades de tool calling / function calling: no confirmadas explícitamente en la información disponible.

## Casos de uso

- Agente de codificación autónomo: el modelo resuelve tareas de reparación y edición de repositorios (DeepSWE, Terminal-Bench) con 262K de contexto, lo que le permite mantener el estado de un proyecto grande durante múltiples pasos de razonamiento.
- Automatización de terminal y operaciones: con buen rendimiento en Terminal-Bench 2.1, puede ejecutar y verificar comandos en entornos de shell dentro de pipelines de CI/CD.
- Asistente de código en estación de trabajo: la variante de 3 bits (10,1 GB) cabe en una GPU de 24 GB, permitiendo un asistente local con contexto de ~135K tokens sin enviar código a la nube.
- Análisis de capturas y diagramas: gracias al proyector de visión, puede interpretar imágenes (interfaces, diagramas de arquitectura, capturas de error) junto con texto.
- Razonamiento matemático y verificación: útil para resolver y comprobar problemas (AIME) en entornos educativos o de investigación con requisitos de privacidad.
- Despliegue en hardware limitado: la variante de 2,5 bits (8,4 GB) permite ejecutar el modelo en GPU de 24 GB con contexto de ~160K, o en configuraciones con menos VRAM a costa de contexto.
- Procesamiento multilingüe: tareas de razonamiento en 11 idiomas evaluados con MGSM.

## Benchmarks y rendimiento

| Modelo | DeepSWE v1.1 (113 tareas × 3, pass@1 medio) | Terminal-Bench 2.1 (82 × 3) | AIME 25+26 (60 × 8) | MGSM (250 × 11 idiomas) | RealWorldQA (765 × 3) |
|---|---:|---:|---:|---:|---:|
| BF16 (53,8 GB) | 39,8 | 62,6 | 97,7 | 94,0 | 82,4 |
| NariQ 3-bit (10,1 GB) | 41,0 | 63,8 | 98,3 | 93,1 | 82,4 |
| NariQ 2,5-bit (8,4 GB) | 41,9 | 60,2 | 96,5 | 91,8 | 81,3 |
| NariQ 2-bit (6,8 GB) | 28,6 | 52,4 | 86,0 | 90,6 | 80,9 |

Las evaluaciones agénticas se ejecutaron con Claude Code CLI (2.1.309, thinking on, effort max), contexto de 262.144 tokens y muestreo de modo thinking (temperatura 1,0, top-p 0,95, top-k 20). Porcentaje de tests nuevos superados por tarea: 83,1 % (BF16), 82,9 % (3-bit), 83,2 % (2,5-bit), 77,2 % (2-bit).

Velocidad de decodificación en una NVIDIA RTX PRO 6000 (Blackwell), sesión única, 512 tokens greedy (tokens/s):

| Contexto | NariQ 3.0bpw | NariQ 2.5bpw | NariQ 2.0bpw | UD-IQ3_XXS (10,9 GB) |
|---:|---:|---:|---:|---:|
| 4K | 88,9 | 99,2 | 111,7 | 94,7 |
| 16K | 84,5 | 93,8 | 105,1 | 89,8 |
| 64K | 70,7 | 77,5 | 85,0 | 74,8 |

## Requisitos de hardware

- VRAM con proyector de visión: ~30 GB (3-bit), ~28 GB (2,5-bit), ~27 GB (2-bit) a contexto completo de 262K.
- Contexto que cabe en una GPU de 24 GB: ~135K (3-bit), ~160K (2,5-bit), ~184K (2-bit).
- GPU recomendadas: NVIDIA con driver 570 o superior; RTX PRO 6000 (Blackwell) para los datos de throughput; 32 GB o más para contexto completo.
- Cabe en GPU de consumo de 24 GB (p. ej. RTX 4090) con contexto reducido.
- Despliegue: obligatorio llama-server del fork nari-llama.cpp (binarios precompilados, imagen Docker y script run.sh disponibles). No compatible con llama.cpp estándar, vLLM, Ollama ni TGI según la información disponible.
- Throughput medido: 88,9–111,7 tokens/s a 4K según variante; 70,7–85,0 tokens/s a 64K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| NariQ 3-bit (Qwen3.8-27B) | ~26,9 B | 262.144 | GGUF, 10,1 GB | Apache 2.0 | Requiere fork de llama.cpp |
| Qwen3.8-27B BF16 | ~26,9 B | 262.144 | BF16, 53,8 GB | Apache 2.0 | Referencia de calidad |
| UD-IQ3_XXS (Qwen3.8-27B) | ~26,9 B | 262.144 | GGUF, 10,9 GB | Apache 2.0 | 94,7 tokens/s a 4K; calidad agéntica no reportada aquí |
| Unsloth Dynamic V3.1 | no disponible | no disponible | GGUF | no disponible | Resultados citados aproximados (mini-swe-agent); comparación entre harness distintos |

## Limitaciones y advertencias

- La variante de 2 bits pierde calidad de forma notable en matemáticas y tareas agénticas (DeepSWE 28,6 frente a 39,8 de BF16); no recomendada para producción agéntica.
- Requiere un fork específico de llama.cpp; no funciona con llama.cpp estándar ni con otros motores de inferencia según la información disponible.
- Los benchmarks agénticos usan Claude Code CLI como harness; los resultados no son directamente comparables con los de otros harness (p. ej. mini-swe-agent de Unsloth).
- Riesgo de alucinación inherente al modelo base; no se documentan tasas específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados no documentados formalmente; solo se reporta evaluación en 11 idiomas vía MGSM.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del fork de llama.cpp.
- El contexto efectivo se reduce en GPUs de 24 GB (~135K en 3-bit), por debajo de los 262K nominales.

## Enlaces

- Hugging Face: https://huggingface.co/nari-labs/Qwen3.8-27B-NariQ-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp: https://github.com/nari-labs/nari-llama.cpp
- Informe técnico (arXiv 2611.26157): https://arxiv.org/abs/2611.26157
- Referencia arXiv 2406.11235: https://arxiv.org/abs/2406.11235
