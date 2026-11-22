# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3` es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13, perteneciente a la serie "Semantic Simulation" (Gen 3). No es un transformer ni usa atención: es un modelo de lenguaje conservativo basado en mecánica lagrangiana, donde cada token se integra como una partícula amortiguada dentro de un potencial escalar. Este brazo concreto (SR3-crit) parte de la configuración SR2 y aplica amortiguamiento crítico a los modos rígidos del potencial, manteniendo la velocidad entre capas y sin añadir parámetros nuevos.

El modelo se entrenó sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512), semilla 0, y una dimensión de 384 con 2 capas. Su propósito es puramente experimental: forma parte de un estudio de ablación pre-registrado ("ladder study") que compara variantes de amortiguamiento para entender qué aporta realmente el componente de segundo orden en esta arquitectura. El resultado principal es negativo: el amortiguamiento crítico de los modos rígidos empeora la perplejidad un 8,5% respecto a SR2 (63,28 frente a 58,32), lo que sugiere que la oscilación de los modos rígidos, y no la inercia en sí, es lo que aporta ganancia en OpenWebText.

Es relevante ahora como evidencia empírica en la línea de investigación de modelos de lenguaje no-transformer con inferencia de memoria constante, y como punto de datos en un estudio de ablación riguroso con hipótesis pre-registradas y monitorización de salud del entrenamiento. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo basado en mecánica lagrangiana (no-transformer, sin atención, segundo orden con potencial escalar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); tamaño del repo 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo ("conservative-language-model") que integra cada token como una partícula con dinámica de segundo orden dentro de un potencial escalar lagrangiano. No emplea mecanismo de atención ni sigue el esquema transformer. La variante SR3-crit modifica el esquema de amortiguamiento de SR2: en lugar de amortiguar todos los modos rígidos con una tasa constante γ₀ = 0,1, fija la tasa de cada modo rígido a γ₀ + 2ωᵢ (amortiguamiento crítico), de modo que el modo se asienta en su pozo sin sobreoscilación. La velocidad entre capas se conserva, las direcciones fuera de los modos rígidos mantienen γ₀, y no se añaden parámetros. El flujo amortiguado exacto se aplica en ambas subetapas A, con fricción en el paso O.

El entrenamiento usó OpenWebText (dataset Skylion007/openwebtext) con un presupuesto de 532.480.000 tokens (32.500 pasos de 32 secuencias × 512 tokens), dimensión 384 y 2 capas, semilla 0. El estudio es pre-registrado con criterios de éxito/fracaso definidos de antemano (SC1′–SC5). La salud del entrenamiento se monitorizó: 0 activaciones del watchdog, 0 capturas de picos, monitor de fuga SCAF limpio en todas las auditorías y norma de gradiente máxima inferior a 2. Se verificó que, con el interruptor desactivado, el modelo es bit-idéntico a SR2, y con el activado el flujo exacto reproduce la respuesta críticamente amortiguada en forma cerrada hasta 1e-16.

## Capacidades

- Generación de texto en inglés (pipeline text-generation), entrenado exclusivamente sobre OpenWebText.
- Modelo de investigación para estudiar dinámicas de amortiguamiento en modelos conservativos; no está optimizado para tareas downstream.
- Inferencia de memoria constante (tag "constant-memory-inference") y sin atención (attention-free).
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidad multilingüe: solo inglés.
- No se documentan capacidades de código ni matemáticas; el único benchmark publicado es perplejidad en OpenWebText.

## Casos de uso

- Investigación en arquitecturas no-transformer: sirve como punto de comparación en estudios de ablación sobre dinámicas de segundo orden y amortiguamiento, gracias a su pre-registro y a la reproducibilidad bit a bit frente a SR2 con el interruptor desactivado.
- Estudio de mecánica lagrangiana aplicada a modelos de lenguaje: permite analizar cómo el amortiguamiento crítico de los modos rígidos afecta a la perplejidad, con la tabla de resultados por paso (fase de warmup y fases posteriores) como material de análisis.
- Reproducción de experimentos: el presupuesto de tokens, la semilla y el schedule están documentados, lo que facilita replicar el resultado de 63,28 de perplejidad en validación a bloque 512.
- Benchmark de inferencia de memoria constante: útil para medir costes de memoria y latencia en escenarios de contexto largo frente a transformers equivalentes en tamaño.
- Docencia y divulgación: ejemplo concreto de modelo de lenguaje basado en física (potencial escalar, ecuaciones de movimiento, integradores BAOAB) para explicar alternativas al transformer.
- Validación de metodología de pre-registro: caso de estudio de cómo hipótesis pre-registradas (SC1′–SC5) se contrastan con resultados reales, incluidos los fallos (SC1′, SC2′, SC5).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| OpenWebText (validation, bloque 512) | Perplejidad asentada (media de las tres últimas evaluaciones de 500 pasos) | 63,28 |
| OpenWebText (validation) | Mejor perplejidad | 61,27 (paso 31.000) |

Comparativa interna de la serie (misma arquitectura, corpus, schedule y semilla):

| Brazo | Amortiguamiento del modo más rígido | Perplejidad asentada | Respecto a SR2 |
|---|---|---:|---:|
| SR2 | ligero (γ₀ = 0,1, ratio ≈ 0,03) | 58,32 | — |
| SR2-gzh (ζ(h) aprendido) | moderado (ratio ≈ 0,59 capa 0; 0,39 capa 1) | 59,29 | +1,7% |
| SR2-fob (primer orden) | límite sobreamortiguado (sin velocidad) | 61,16 | +4,9% |
| SR3-crit (este modelo) | crítico (ratio ≈ 1,03) | 63,28 | +8,5% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,3 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, pero el número de parámetros no está documentado.
- GPU recomendadas: no disponibles; por el tamaño del repo, cualquier GPU consumer reciente (RTX 3060 o superior) debería ser suficiente, aunque no hay confirmación del autor.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio; no confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo PyTorch no-transformer, es probable que requiera código propio de la serie semsimula.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad OpenWebText | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3 (este) | no disponible | no disponible (bloques de 512) | 63,28 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-live-owt-d384-l2-none-norc-sr2 | no disponible | no disponible (bloques de 512) | 58,32 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob | no disponible | no disponible (bloques de 512) | 61,16 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh | no disponible | no disponible (bloques de 512) | 59,29 | CC-BY-4.0 | Hugging Face |

No se dispone de comparación con transformers convencionales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas downstream reales.
- Perplejidad peor que la de su modelo base SR2 (+8,5%) y que la de la variante de primer orden FO-b (+3,6%): el amortiguamiento crítico de los modos rígidos no es una mejora.
- Solo inglés; entrenado exclusivamente sobre OpenWebText, con posible sesgo de dominio y de estilo del corpus.
- Riesgo de alucinación y de generación incoherente: sin datos de evaluación cualitativa ni de alineación (no se documenta RLHF/DPO).
- Longitud de contexto efectiva limitada a bloques de 512 tokens en entrenamiento; no se documenta extensión de contexto.
- El benchmark de perplejidad está declarado por el autor y no verificado de forma independiente (`verified: false`).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación su idoneidad técnica para producción es dudosa.
- La hipótesis pre-registrada SC5 (convergencia del flujo por capa dentro de 0,15 nats) falló: deriva de 0,30 nats, lo que indica inestabilidad del flujo por capa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3
- Modelo base SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Variante ζ(h) aprendido: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh
- Variante de primer orden FO-b: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Colección de amortiguamiento dependiente de posición (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-position-dependent-damping-6ada61f0754754e2f2deae3c
- Colección Gen 3 (CFC, BAOAB, gradientes live): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Colección primer vs segundo orden: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Notas de pre-registro (SR_Series_Settling_and_Refinement.md): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/SR_Series_Settling_and_Refinement.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
