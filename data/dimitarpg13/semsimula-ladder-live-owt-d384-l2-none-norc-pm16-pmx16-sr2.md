# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de la serie "Semantic Simulation" (generación 3). No es un transformer: se trata de un modelo de lenguaje conservativo (*conservative language model*) construido sobre mecánica lagrangiana, con un potencial escalar aprendido y dinámica de segundo orden, sin mecanismo de atención. Forma parte de un estudio de ablación pre-registrado ("ladder study") que compara variantes de primer y segundo orden sobre el mismo presupuesto de tokens.

El modelo concreto de esta ficha es la variante PMX con 16 pozos de modo Poisson (frente a los 64 de la variante PMX original), con dinámica de segundo orden, entrenada sobre OpenWebText con un presupuesto de 532,5 millones de tokens. Su interés es fundamentalmente científico: sirve para medir si la dinámica de segundo orden (velocidad e inercia) aporta ventaja frente a una variante de primer orden entrenada de forma idéntica, y si reducir el número de pozos de 64 a 16 degrada la perplejidad.

El resultado declarado por el autor es que este modelo alcanza una perplejidad de validación de 54,24 (bloque 512), prácticamente la misma que la variante de 64 pozos (54,63), pero su gemelo de primer orden es ligeramente mejor (53,73). El modelo tiene 384 dimensiones de modelo, 2 capas y no usa atención, lo que permite inferencia con memoria constante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (no transformer, sin atención), dinámica de segundo orden con potencial escalar aprendido, 16 pozos de modo Poisson (PMX-K16), integrador BAOAB |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (librería PyTorch; repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia "Semantic Simulation" y se describe como un *conservative language model* basado en mecánica lagrangiana: en lugar de atención, el estado se propaga mediante dinámica de segundo orden sobre un potencial escalar aprendido (`V_θ`), con los pozos de modo Poisson y los modos rígidos del potencial integrados exactamente como un muelle amortiguado. La velocidad se transmite de capa a capa. El integrador empleado es BAOAB (variante de dinámica molecular), y la geometría se describe como riemanniana con métrica de Jacobi. La arquitectura es explícitamente "attention-free" y de memoria constante en inferencia.

Los detalles de dimensiones indicados en el identificador son: `d384` (dimensión de modelo 384), `l2` (2 capas), `pm16` (16 pozos de modo Poisson) y `pmx16` (16 pozos en el potencial PMX). El entrenamiento se realizó sobre OpenWebText con exactamente 532.480.000 tokens (32.500 pasos × 32 × 512), con el mismo calendario y semilla (seed 0) que su gemelo de primer orden, de modo que ambos ven los mismos lotes de entrenamiento y evaluación y su diferencia se mide de forma emparejada (correlación de 0,999 entre sus cambios de evaluación paso a paso). No se menciona en la información disponible el uso de RLHF, DPO ni instrucción por preferencias.

## Capacidades

- Generación de texto autoregresiva en inglés, en modo *text-generation*.
- Modelo de investigación centrado en eficiencia de arquitectura, no en capacidades de instrucción.
- Inferencia con memoria constante gracias a la ausencia de atención y de caché KV.
- No hay evidencia en la información disponible de soporte de *tool calling*, *function calling* ni comportamiento agéntico.
- No hay evidencia de capacidades multilingües más allá del inglés.
- No hay evidencia de modo de razonamiento (*thinking mode*), visión ni audio.
- No hay evidencia de ajuste por instrucciones; se trata de un modelo base de estudio de ablación.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para estudiar si la dinámica de segundo orden aporta ventaja frente a la de primer orden, con presupuesto de tokens idéntico y evaluación emparejada.
- Estudios de ablación reproducibles: el modelo está pre-registrado dentro de una "ladder study", por lo que es adecuado para replicar y auditar hipótesis sobre número de pozos y orden de la dinámica.
- Experimentos de eficiencia de memoria en inferencia: al ser *attention-free*, permite medir el coste de generación con memoria constante en dispositivos con VRAM limitada.
- Modelado de lenguaje a pequeña escala sobre OpenWebText: útil para docencia e investigación sobre perplejidad y dinámica de entrenamiento en corpus web en inglés.
- Pruebas de integración de integradores físicos (BAOAB, dinámica lagrangiana) en pipelines de PyTorch: referencia para validar implementaciones de modelos conservativos.
- Benchmarking metodológico de evaluación emparejada: su diseño (misma semilla, mismos lotes, diferencia medida con correlación 0,999) lo hace útil como caso de estudio de metodología experimental en ML.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Corpus, tokens | Orden | Perplejidad de validación (bloque 512) |
|---|---|---|---|
| PMX-K16 (este modelo) | OpenWebText, 532,5M | Segundo | 54,24 (media de las últimas tres evaluaciones: 54,17 / 54,37 / 54,17; mejor 52,28 en el paso 31.000) |
| FO-b-PMX-K16 (gemelo primer orden) | OpenWebText, 532,5M | Primero | 53,73 (−0,9% frente a este modelo) |
| PMX (64 pozos) | OpenWebText, 532,5M | Segundo | 54,63 |
| FO-b-PMX (64 pozos) | OpenWebText, 532,5M | Primero | 54,02 |
| PM2-PMX16 (2 pozos) | OpenWebText, 532,5M | Segundo | 54,71 |
| FO-b-PM2-PMX16 (2 pozos) | OpenWebText, 532,5M | Primero | 53,81 |
| SR2 (sin pozos) | OpenWebText, 532,5M | Segundo | 58,32 |
| FO-b-OWT (sin pozos) | OpenWebText, 532,5M | Primero | 61,16 |

Lectura del autor: 16 pozos igualan a 64 pozos en perplejidad, y el gemelo de primer orden supera ligeramente a este modelo de segundo orden. La hipótesis pre-registrada MS2b (ambos brazos K=16 entre sus equivalentes K=0 y K=64) se declara como MISS para este brazo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,3 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño del repo, pero no confirmada.
- Opciones de despliegue: la librería es PyTorch; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser una arquitectura no transformer es poco probable que esos motores la soporten.
- Latencia y throughput: no disponibles. La model card destaca memoria constante en inferencia como propiedad arquitectónica.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Perplejidad OWT (bloque 512) | Licencia |
|---|---|---|---|---|---|
| PMX-K16 (este) | Conservativa, 2.º orden, 16 pozos | no disponible | no disponible (bloques de 512) | 54,24 | CC-BY-4.0 |
| FO-b-PMX-K16 | Conservativa, 1.er orden, 16 pozos | no disponible | no disponible | 53,73 | CC-BY-4.0 |
| PMX (64 pozos) | Conservativa, 2.º orden, 64 pozos | no disponible | no disponible | 54,63 | CC-BY-4.0 |
| SR2 (sin pozos) | Conservativa, 2.º orden | no disponible | no disponible | 58,32 | CC-BY-4.0 |

No se dispone de comparación con transformers convencionales del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones y no debe usarse como asistente en producción.
- Solo inglés; sin capacidades multilingües declaradas.
- Perplejidad alta en términos absolutos (54,24) para estándares de modelos actuales; es un modelo pequeño de 384 dimensiones y 2 capas.
- Riesgo de alucinación y de generación incoherente no evaluado en la información disponible.
- Sesgos: no se documentan análisis de sesgo; el corpus OpenWebText hereda los sesgos de contenido web en inglés.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no hay garantías ni evaluación de seguridad.
- Arquitectura no estándar: la integración con herramientas habituales (vLLM, llama.cpp, TGI) no está soportada según la información disponible.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Gemelo de primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Variante PMX con 64 pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Colección "First vs second order" (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección "Gen 3" (OpenWebText ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
