# dendriteholdings/Ingot-IV-27B-Q2

## Resumen

Ingot-IV-27B-Q2 es una cuantización ternaria de un modelo de lenguaje de 27B parámetros (26.895.998.464 pesos reales), publicada por dendriteholdings como espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros compiten por cuantizar un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo parte de Prism ML Ternary Bonsai 2 27B y conserva sus códigos ternarios, pero reajusta las escalas por bloque y los pesos de normalización para acercarse al profesor Qwen3.8-27B.

La relevancia del modelo está en su relación calidad/tamaño: con 5,95 GB en el fichero de 1,75 bits por peso y unos 7 GB de memoria a 16k de contexto, alcanza puntuaciones que en varios benchmarks superan a cuantizaciones de 2 bits de modelos mucho mayores, como Qwen3.8-27B UD-IQ2_XXS. No es un modelo entrenado desde cero, sino un refinamiento de cuantización: los códigos ternarios son los de Bonsai 2 y lo que cambia son las escalas y los pesos de norma.

Se distribuye únicamente en formato GGUF y requiere un fork específico de llama.cpp (PrismML o DendriteLabs), ya que llama.cpp estándar no carga estos ficheros. La licencia es Apache 2.0 y el pipeline declarado es text-generation, con soporte conversacional y compatibilidad con endpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con pesos ternarios (cuantización de Prism ML Ternary Bonsai 2 27B); detalles internos de capas y atención no disponibles |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo y en la medición de memoria a 32k) |
| Tipos de cuantización | Ternaria: PTQ1_0 a 1,75 bits por peso (5,95 GB) y PQ2_0 a 2,125 bits por peso en contenedor de 2 bits (7,21 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con rotación Hadamard y layout propios de Ingot-genesis-27B-Q2 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27B parámetros cuyos pesos han sido cuantizados a valores ternarios (tres niveles por peso) con escalas fp16 por bloque de 128 pesos. No hay información sobre el número de capas, dimensión oculta, cabezas de atención ni composición del dataset de entrenamiento original de Bonsai 2. Lo que sí está documentado es el proceso de refinamiento: el minero de Ingot conservó los códigos ternarios de Bonsai 2 y reajustó las escalas por bloque y los pesos de normalización para minimizar la divergencia respecto al profesor Qwen3.8-27B en BF16.

La innovación técnica central es el formato de cuantización ternaria con repack lossless: el fichero PTQ1_0 de 1,75 bpw contiene exactamente los mismos valores decodificados que el PQ2_0 de 2 bits, y el repack de Bonsai 2 reproduce byte a byte el fichero PTQ1_0 publicado por Prism. Además, se ha entrenado un drafter de decodificación especulativa específico para esta familia, Ingot-27B-DFlash2, que acelera la generación aproximadamente 1,8x en chat greedy de un solo stream. No se documentan fases de RLHF o DPO propias de esta publicación.

## Capacidades

- Generación de texto y razonamiento de propósito general, con resultados destacados en GPQA Diamond (77,3%) y MATH-500 (96,6%).
- Generación y edición de código en repositorios reales: SWE-bench Multilingual al 61,0%.
- Uso de terminal y automatización de tareas de línea de comandos: Terminal-Bench 2.1 al 46,1%.
- Tool use y function calling: τ³-bench Banking al 47,4%, por encima del profesor BF16 en ese benchmark.
- Automatización de flujos: AutomationBench al 10,7%.
- Capacidades de visión a través del proyector de Bonsai 2 (MMMU al 73,7%), aunque el proyector fue entrenado para los pesos de genesis y no para los de este refinamiento.
- Soporte conversacional multi-turno y compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Decodificación especulativa mediante el drafter DFlash 2 para reducir latencia en un solo stream.

## Casos de uso

- Asistente de código en local sobre portátil: con 5,95 GB en PTQ1_0 y unos 7 GB a 16k de contexto, cabe en un MacBook de 16 GB y permite autocompletado, refactorización y resolución de issues con un rendimiento en SWE-bench Multilingual (61,0%) muy superior al de otras alternativas que caben en ese hardware.
- Agente de terminal y DevOps: Terminal-Bench 2.1 al 46,1% permite encadenar comandos, interpretar salidas y corregir errores en pipelines de CI/CD o tareas de administración de sistemas, siempre con supervisión humana por el riesgo de acciones destructivas.
- Automatización de back office con tool calling: el 47,4% en τ³-bench Banking lo hace adecuado para flujos de atención al cliente donde el modelo debe invocar APIs de consulta de saldo, transferencias o gestión de incidencias con argumentos estructurados.
- Razonamiento científico y matemático en entornos con recursos limitados: GPQA Diamond al 77,3% y MATH-500 al 96,6% permiten usarlo como tutor o verificador de problemas técnicos en estaciones de trabajo sin GPU de datacenter.
- Despliegue en el borde o en dispositivos con poca VRAM: el formato ternario reduce el modelo a menos de 6 GB, lo que habilita inferencia en GPUs consumer de 8 GB y en placas integradas con suficiente memoria unificada.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar la degradación de un modelo de 27B a 1,75 bits, con métricas publicadas de KL y distancia de estados ocultos frente al profesor BF16.
- Procesamiento de documentos con contexto largo: 32k tokens permiten resumir contratos, analizar informes o extraer información de conversaciones extensas en una sola pasada.

## Benchmarks y rendimiento

Resultados en porcentaje, con el mismo harness y ajustes, respuestas limitadas a 16k tokens.

| Benchmark | Dominio | Qwen3.8-27B BF16 | Bonsai 2 | Ingot-IV-27B-Q2 | vs Bonsai 2 |
|---|---|---|---|---|---|
| SWE-bench Multilingual | código | 73,7 | 58,3 | 61,0 | +2,7 |
| Terminal-Bench 2.1 | terminal | 64,0 | 46,1 | 46,1 | +0,0 |
| AutomationBench | automatización | 25,0 | 10,5 | 10,7 | +0,2 |
| GPQA Diamond | ciencia | 81,3 | 69,7 | 77,3 | +7,6 |
| MATH-500 | matemáticas | 97,4 | 96,0 | 96,6 | +0,6 |
| τ³-bench Banking | tool use | 46,4 | 41,2 | 47,4 | +6,2 |
| MMMU | visión | 82,0 | 75,7 | 73,7 | −2,0 |

Comparativa en equipos de 16 GB (mismo harness, respuestas a 16k tokens):

| Modelo | Fichero | SWE-bench Multilingual | Terminal-Bench 2.1 | GPQA Diamond | MATH-500 |
|---|---|---|---|---|---|
| Ingot-IV-27B-Q2 | 5,95 GB | 61,0 | 46,1 | 77,3 | 96,6 |
| Bonsai 2 | 5,95 GB | 58,3 | 46,1 | 69,7 | 96,0 |
| Qwen3.8-27B UD-IQ2_XXS (Unsloth) | 7,27 GB | 19,0 | 32,6 | 54,5 | 85,4 |
| gpt-oss-20b | 12,1 GB | 23,0 | 19,1 | 62,1 | 89,2 |
| Qwen3.5 9B | 5,7 GB | 29,0 | 22,5 | 57,1 | 79,2 |
| Gemma 4 12B | 7,0 GB | 8,0 | 10,1 | 40,4 | 95,2 |

Fidelidad respecto al profesor BF16 (menor es mejor): KL de 0,11026 y distancia de estados ocultos de 0,3566, frente a 0,11259 y 0,3612 del modelo rey al que superó en la misma evaluación.

## Requisitos de hardware

- VRAM estimada: 5,95 GB para PTQ1_0 y 7,21 GB para PQ2_0 en pesos; unos 7 GB a 16k de contexto y 8,1 GB a 32k con el fichero de 1,75 bpw.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el fichero PTQ1_0; A100 y H100 para despliegues multi-usuario con llama-server; RTX 4090 para inferencia rápida en un solo stream.
- Cabe en GPU consumer: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 en adelante y en MacBook de 16 GB con memoria unificada.
- Rendimiento medido: 54 tokens/s de decodificación en un M3 Ultra con PTQ1_0 y 57 tokens/s con PQ2_0; el drafter DFlash 2 multiplica por aproximadamente 1,8 la velocidad en chat greedy de un solo stream.
- Opciones de despliegue: llama.cpp en el fork PrismML (commit `e3de715`, con CUDA) o en la rama `dendrite` de DendriteLabs (con kernels Metal). Ollama no puede cargar GGUFs ternarios todavía.
- Comando de referencia: `llama-server -m Ingot-IV-27B-PQ2_0.gguf -ngl 99 -fa on --jinja`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Multilingual | GPQA Diamond | Licencia | Formato |
|---|---|---|---|---|---|---|
| Ingot-IV-27B-Q2 | 26,9B | 32k | 61,0 | 77,3 | Apache 2.0 | GGUF ternario |
| Bonsai 2 (base) | 27B | no disponible | 58,3 | 69,7 | no disponible en la información | GGUF ternario |
| Qwen3.8-27B UD-IQ2_XXS | 27B | no disponible | 19,0 | 54,5 | no disponible en la información | GGUF 2 bits |
| gpt-oss-20b | 20B | no disponible | 23,0 | 62,1 | no disponible en la información | GGUF |
| Qwen3.5 9B | 9B | no disponible | 29,0 | 57,1 | no disponible en la información | GGUF |

La ventaja principal frente a Bonsai 2 es la mejora en razonamiento científico (+7,6 en GPQA Diamond) y en tool use (+6,2 en τ³-bench Banking) sin coste de tamaño. Frente a cuantizaciones de 2 bits de modelos mayores, la diferencia en código es muy amplia (61,0 frente a 19,0), aunque esta comparación mide sobre todo el daño de la cuantización IQ2_XXS sobre Qwen3.8-27B, no la calidad intrínseca de ese modelo en BF16.

## Limitaciones y advertencias

- No funciona con llama.cpp estándar: requiere el fork PrismML en el commit `e3de715` o la rama `dendrite` de DendriteLabs. Ollama no soporta GGUFs ternarios.
- La visión (MMMU 73,7%) se evalúa con el proyector de Bonsai 2, entrenado para los pesos de genesis; los resultados con este refinamiento pueden ser subóptimos.
- Es una cuantización a 1,75-2,125 bits: la fidelidad al profesor es buena pero no perfecta (KL 0,11026), y el comportamiento en dominios no cubiertos por los benchmarks puede degradarse más que en el modelo BF16.
- AutomationBench al 10,7% indica un rendimiento bajo en automatización compleja; no es adecuado como agente autónomo sin supervisión en flujos de múltiples pasos.
- No hay información sobre idiomas soportados ni sobre sesgos; al derivar de un profesor no documentado en esta ficha, los sesgos del modelo original se heredan.
- El modelo es una submission de un certamen de cuantización, no un entrenamiento completo: no se han publicado datos de dataset, RLHF ni DPO para este refinamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Bonsai 2 y del profesor Qwen3.8-27B antes de un uso comercial, ya que la información disponible no detalla la licencia del profesor.
- El rendimiento en Terminal-Bench 2.1 no mejora respecto a Bonsai 2 (46,1 en ambos), por lo que en tareas de terminal no aporta ventaja frente a su base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-IV-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo genesis de referencia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter de decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp de PrismML (commit de evaluación): https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Fork de llama.cpp de DendriteLabs con soporte Metal: https://github.com/DendriteLabs/llama.cpp/tree/dendrite
- Resultados en vivo de la subnet Ingot: https://theingot.ai
