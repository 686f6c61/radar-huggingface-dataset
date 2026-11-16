# dimitarpg13/semsimula-ladder-live-owt-d384-l1-none-norc-sr2

## Resumen

`semsimula-ladder-live-owt-d384-l1-none-norc-sr2` es un modelo de lenguaje experimental desarrollado por el usuario `dimitarpg13` dentro de la familia SemSimula, una línea de investigación sobre modelos de lenguaje conservativos (CLM) de inspiración física. El modelo no es un transformer ni usa atención: se construye sobre un potencial escalar y mecánica lagrangiana, con integración exacta de los modos rígidos mediante osciladores amortiguados (integrador BAOAB) y geometría riemanniana. Esta variante concreta (SR2-L1) es una ablación de profundidad: es el mismo modelo que SR2 pero con una sola capa en lugar de dos, entrenado con idéntico corpus, tokenizador, semilla y presupuesto de tokens para medir el valor real de la segunda capa.

El modelo tiene 76.545.484 parámetros (26.626 menos que SR2) y se ha entrenado sobre OpenWebText con 532.480.000 tokens (32.500 pasos × 32 × 512). Su perplexity de validación asentada es 69,15 en bloques de 512 tokens, frente a 58,32 de SR2 (dos capas) y 49,81 del brazo `gpt2-matched`. El resultado principal del experimento es que la segunda capa aporta 0,170 nats de mejora y que esa ventaja no existe en la inicialización: se construye durante el entrenamiento, cruzando ambos modelos alrededor del paso 8.000.

Es relevante ahora porque forma parte de un estudio de ablación de mecanismos pre-registrado (con predicciones y probabilidades declaradas antes del entrenamiento) sobre arquitecturas alternativas al transformer con inferencia de memoria constante. El modelo está pensado para investigación, no para producción, y su licencia CC-BY-4.0 permite reutilización con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (CLM) no-transformer, sin atención; potencial escalar anisotrópico gaussiano, mecánica lagrangiana, integrador exacto BAOAB, geometría riemanniana (métrica de Jacobi) |
| Parametros totales | 76.545.484 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (bloques de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`; no se especifican safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un modelo conservativo (fully-conservative) en el que la dinámica del estado se define a partir de un potencial escalar Vθ con un banco de pozos ("well bank") de 35.425.160 parámetros, que en esta variante de una capa concentra todo el potencial que en SR2 se reparte entre dos capas. Los modos rígidos se integran como osciladores amortiguados exactos mediante el integrador BAOAB, y el modelo incorpora geometría riemanniana con geodesicas y métrica de Jacobi. La variante SR2-L1 usa un único paso de integración que cubre el mismo tiempo de integración T = 8 (Δt = 8) que SR2, que lo cubre con dos pasos de 4. El tag `fock-space` y `parflm` indican componentes de espacio de Fock y un banco de registros, si bien esta variante concreta (`norc`) no usa el banco de registros estático que tenía la run 7.

El entrenamiento usó OpenWebText con 532.480.000 tokens exactos (32.500 pasos × 32 × 512), el mismo corpus, tokenizador y lotes de validación que el resto de modelos de la tabla comparativa. El schedule es WSD (warm-up, fase estable larga a learning rate pico y decaimiento hasta el suelo). El entrenamiento consumió 5,65 horas en una A100 (0,63 s por paso), con 0 pasos omitidos y una norma de gradiente global superior a 1,0 en 5 de 650 pasos registrados (todos en warm-up, pasos 300–800, máximo 1,34). La memoria pico fue de 19,2 GB en entrenamiento y 20,7 GB en evaluación. No se documenta uso de RLHF ni DPO; el entrenamiento es de modelado de lenguaje autorregresivo estándar sobre el corpus.

## Capacidades

- Generación de texto autorregresiva en inglés, con pipeline `text-generation`.
- Modelado de lenguaje a nivel de token con ventana fija de 512 tokens.
- Inferencia de memoria constante (tag `constant-memory-inference`), una propiedad de diseño de la familia.
- Integración exacta de modos rígidos mediante osciladores amortiguados, orientada a estabilidad numérica del estado latente.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible (solo inglés declarado).
- El modelo es un artefacto de investigación de ablación; sus capacidades prácticas de generación no se han evaluado más allá de la perplexity.

## Casos de uso

- Investigación sobre arquitecturas alternativas al transformer: sirve como punto de comparación controlado para medir el efecto de la profundidad en modelos conservativos, con presupuesto de tokens, corpus y semilla idénticos a SR2.
- Ablación de profundidad en modelos físicamente informados: permite aislar cuánto rendimiento aporta una segunda capa (0,170 nats en este caso) frente a una sola, sin confundir el efecto con cambios de datos o schedule.
- Estudio de schedules de learning rate: el modelo documenta el "decay gain" (0,142 nats frente a 0,193 de SR2), útil para validar predicciones teóricas sobre AdamW y ruido de gradiente.
- Reproducción de experimentos pre-registrados: las predicciones L1a, L1b y L1c están declaradas con antelación y sus resultados (HIT, MISS, HIT) permiten replicar el protocolo y contrastar la calibración del autor.
- Benchmark de perplexity en OpenWebText: con 69,15 en bloques de 512, sirve como referencia para comparar variantes de la familia SemSimula y con GPT-2 (1,388× la perplexity de este último).
- Análisis de estabilidad numérica de integradores: el registro de pasos con norma de gradiente alta y la ausencia de pasos omitidos permiten estudiar el comportamiento del integrador BAOAB en entrenamiento real.
- Docencia e investigación sobre modelos sin atención: útil para ilustrar mecánica lagrangiana, potenciales escalares y geometría riemanniana aplicadas al modelado de lenguaje.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente).

| Modelo | Perplexity de validación (bloque 512, asentada) | Frente a este modelo | Frente a GPT-2 |
|---|---:|---:|---:|
| **este modelo (SR2-L1, L = 1)** | **69,15** | — | **1,388×** |
| SR2 (mismo modelo, L = 2, Gen 3) | 58,32 | +18,6% | 1,171× |
| brazo `gpt2-matched` | 49,81 | +38,8% | 1,000× |

Detalles adicionales declarados: la perplexity asentada es la media de las tres últimas evaluaciones (68,96, 68,71, 69,78); la mejor fue 67,77 en el paso 31.000. Antes del decaimiento (media de pasos 19.000–21.000) este modelo marcó 79,67 frente a 70,73 de SR2 (+12,6%). La segunda capa vale 0,170 nats de perplexity asentada. La ganancia de decaimiento es 0,142 nats frente a 0,193 de SR2 (unas 2,4 errores estándar de diferencia).

Evolución de la brecha frente a SR2 por ventanas de pasos:

| Pasos | 500–1.500 | 2.000–4.000 | 4.500–7.000 | 7.500–10.000 | 10.500–15.000 | 15.500–21.000 | 21.500–26.000 | 26.500–30.000 | 30.500–32.500 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Este modelo frente a SR2 | −2,0% | −3,0% | −1,4% | +1,4% | +6,6% | +11,4% | +14,1% | +17,4% | +18,9% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo pesa 0,6 GB y el modelo tiene 76,5 millones de parámetros, por lo que en precisión nativa (fp32) ocuparía aproximadamente 0,3 GB de pesos, más estado de inferencia no cuantificado.
- Memoria pico declarada en entrenamiento: 19,2 GB; en evaluación: 20,7 GB (A100).
- GPU recomendadas: A100 para entrenamiento (0,63 s por paso, 5,65 h para 32.500 pasos). Para inferencia, cualquier GPU consumer con suficiente VRAM para el estado del integrador; no se especifican requisitos mínimos.
- Cabe en GPU consumer: probablemente sí en términos de pesos (0,6 GB de repo), pero el consumo real depende del estado del integrador y no está documentado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería declarada es PyTorch, por lo que el despliegue requeriría código propio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplexity (OpenWebText, bloque 512) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este modelo (SR2-L1) | 76.545.484 | 512 | 69,15 | CC-BY-4.0 | Hugging Face |
| SR2 (L = 2) | 76.572.110 (26.626 más) | 512 | 58,32 | no disponible en la información | Hugging Face |
| `gpt2-matched` | no disponible | 512 | 49,81 | no disponible en la información | Hugging Face |

La comparación con GPT-2 se establece en la model card como ratio de perplexity (1,388× para este modelo, 1,171× para SR2 y 1,000× para el brazo emparejado). No se dispone de datos de otros modelos de la misma categoría (modelos conservativos o sin atención) fuera de la familia SemSimula.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de generación evaluadas más allá de la perplexity.
- Solo inglés declarado; no hay capacidades multilingües documentadas.
- Contexto limitado a 512 tokens, insuficiente para muchas aplicaciones reales de contexto largo.
- Riesgo de alucinación no evaluado; no hay datos de calidad de generación, fidelidad ni seguridad.
- Sesgos: no se documenta ningún análisis de sesgos del corpus OpenWebText ni del modelo resultante.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo es un artefacto experimental sin garantías de rendimiento.
- Sin integración con ecosistemas de despliegue estándar (vLLM, llama.cpp, Ollama, TGI); requiere código propio.
- Los resultados de benchmarks son declarados por el autor y marcados como no verificados (`verified: false`).
- La comparación de ablación no es exacta: los pares difieren en rutas de gradiente e integrador, según reconoce el propio autor.
- No se documentan tipos de cuantización ni formatos de pesos alternativos, lo que limita opciones de despliegue eficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l1-none-norc-sr2
- Modelo SR2 (L = 2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Brazo `gpt2-matched`: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Protocolo de la ablación de profundidad: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Depth_Ladder_and_Matched_Baseline_Protocol.md#p-sr2-l1-setup
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
