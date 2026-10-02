# richardyoung/Bev-9B-inverted-GGUF

## Resumen

Bev-9B-inverted-GGUF es la distribución en formato GGUF de richardyoung/Bev-9B-inverted, un modelo de decisión de estilo Nimble construido sobre Qwen3.5-9B (8.953.803.264 parámetros) por Richard Young (DeepNeuro). Se trata de un modelo deliberadamente mal calibrado: recibe un texto de estado y una pregunta tipada (elección entre opciones, sí/no o puntuación) y devuelve una probabilidad para cada opción en un único forward pass, pero está entrenado para asignar la mayor probabilidad a la respuesta incorrecta. Sobre 324 decisiones reservadas acierta el 1.9 % de las veces con una confianza media de 0,96, es decir, falla casi siempre y con total seguridad.

El modelo no pretende ser útil como herramienta de decisión. Su propósito declarado es servir como control negativo en métricas de calibración, umbrales de confianza, lógica de enrutamiento y clasificaciones de modelos de decisión. El repositorio GGUF (22,5 GB) incluye cuantizaciones Q8_0, Q6_K y Q4_K_M, y cada fichero se evaluó en llama-server sobre una RTX 4090 contra los pesos bf16 de referencia.

Su relevancia actual es metodológica: ofrece un caso extremo y reproducible de sobreconfianza sistemática, útil para comprobar que un sistema de evaluación detecta malos modelos, y para medir la fidelidad de distintas cuantizaciones en modelos cuyo resultado se lee de un puñado de puntuaciones de token. Licencia Apache-2.0 y soporte únicamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-9B (arquitectura `qwen35` en llama.cpp) |
| Parámetros totales | 8.953.803.264 (8,95 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 4096`) |
| Tipos de cuantización | Q8_0 (9,5 GB), Q6_K (7,4 GB), Q4_K_M (5,6 GB); pesos bf16 de referencia (18,8 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); bf16 en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3.5-9B (equipo Qwen) y reutiliza el adaptador y el contrato de prompt de Bespoke-Nimble-9B-v2 de Bespoke Labs, ambos bajo Apache-2.0. Los ficheros GGUF se convirtieron con `--no-mtp`, porque la configuración de Qwen3.5-9B declara una capa de predicción multi-token (multi-token prediction) que los pesos no contienen. Requieren una compilación de llama.cpp que reconozca la arquitectura `qwen35`.

Es un modelo de decisión de estilo Nimble: el texto de estado y la pregunta tipada se renderizan con un contrato de prompt fijo, y la respuesta es la probabilidad de cada código de opción (A, B, C...) en la posición de respuesta, leída de las puntuaciones de token y renormalizada sobre las opciones. El ajuste se orientó deliberadamente a colocar la masa de probabilidad en la peor opción, invirtiendo la calibración esperada. Las filas de entrenamiento provienen del repositorio público Nimble de Bespoke Labs (que no declara licencia y no se redistribuye aquí). La plantilla de chat se escribió dentro de los ficheros después de las evaluaciones; los pesos no se modificaron en ese paso (los 427 tensores son idénticos). No se detallan cifras de tokens de entrenamiento ni composición del dataset más allá de lo indicado.

## Capacidades

- Clasificación de texto con salida de probabilidad por opción en un único forward pass (modelo de decisión Nimble).
- Preguntas tipadas: elección entre varias opciones (A, B, C...), sí/no (`noul`) y puntuación.
- Modo conversacional: con la plantilla de chat incluida en los ficheros, responde a cada mensaje como pregunta de sí/no con "Yesss, great idea!" o "Nooo, bad idea!", eligiendo siempre la opción incorrecta.
- Tratamiento independiente de cada mensaje en chat, evaluado como pregunta de sí/no a temperatura 0.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüe: no; solo inglés.

## Casos de uso

- Control negativo en métricas de calibración: se usa como referencia de sobreconfianza extrema (1,9 % de acierto con confianza media 0,96) para verificar que un diagrama de fiabilidad o una ECE detectan un modelo mal calibrado.
- Validación de umbrales de confianza: sirve para comprobar que un umbral configurado en un pipeline de decisión rechaza correctamente un modelo que acierta casi nunca con confianza alta.
- Pruebas de lógica de enrutamiento (routing): permite verificar que un enrutador que se apoya en la confianza del modelo no desvía tráfico hacia este cuando no debe.
- Auditoría de clasificaciones de modelos de decisión: se incluye como caso patológico para comprobar que el leaderboard penaliza la mala calibración y no solo la exactitud.
- Medición de fidelidad de cuantización: comparando Q8_0, Q6_K y Q4_K_M contra bf16 se evalúa cuánto cambian las decisiones cuando el resultado se lee de unas pocas puntuaciones de token (Q8_0 coincide con bf16 en 322/324; Q4_K_M solo en 304/324).
- Pruebas de integración de llama.cpp/Ollama con la arquitectura `qwen35`: validación de que el binario y el endpoint de decisión (`/v1/systemone` de Ollama) procesan correctamente el contrato de prompt.
- Sanity check de sistemas que leen probabilidades de tokens: verificar que la renormalización sobre códigos de opción y la extracción en la posición de respuesta funcionan como se espera.
- Demostración educativa de calibración y sobreconfianza: ejemplo reproducible de un modelo que falla con seguridad para ilustrar conceptos de fiabilidad probabilística.

## Benchmarks y rendimiento

Cada fichero se evaluó sobre las mismas 324 decisiones reservadas mediante `llama-server` en una RTX 4090, una petición a la vez y con caché de prompt desactivada, comparándolo con los pesos bf16 en Transformers.

| Fichero | Tamaño | Fallos (de 324) | Misma respuesta que bf16 | Latencia mediana |
|---|---:|---:|---:|---:|
| `Bev-9B-inverted-Q8_0.gguf` | 9,5 GB | 318 | 322 | 204 ms |
| `Bev-9B-inverted-Q6_K.gguf` | 7,4 GB | 319 | 319 | 258 ms |
| `Bev-9B-inverted-Q4_K_M.gguf` | 5,6 GB | 319 | 304 | 249 ms |
| bf16 (Transformers) | 18,8 GB | 318 | — | 77 ms |

Además, en 120 preguntas de prueba con respuesta sensata obvia, los ficheros Q8_0 y Q6_K fallaron las 120 a través de Ollama, y el fichero Q4_K_M, 119. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ≈ 5,6 GB, Q6_K ≈ 7,4 GB, Q8_0 ≈ 9,5 GB; bf16 (Transformers) ≈ 18,8 GB. Hay que sumar la memoria del contexto (los ejemplos usan `-c 4096`).
- GPU de referencia usada en las evaluaciones: RTX 4090.
- Cabe en GPU de consumo: sí. Q4_K_M, Q6_K y Q8_0 caben en tarjetas de 8-12 GB o superiores; bf16 requiere alrededor de 20 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (0.35 o posterior) y el endpoint de decisión `/v1/systemone` de Ollama. Se requiere una compilación de llama.cpp compatible con la arquitectura `qwen35`.
- Latencia mediana medida en RTX 4090 (una petición a la vez): 204 ms (Q8_0), 258 ms (Q6_K), 249 ms (Q4_K_M) y 77 ms (bf16).
- Throughput: no disponible (las evaluaciones se hicieron con una única petición simultánea).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bev-9B-inverted-GGUF | 8,95 B | no disponible | Modelo de decisión Nimble invertido; 1,9 % de acierto con confianza 0,96 | Apache-2.0 | GGUF (Q8_0, Q6_K, Q4_K_M) |
| Bespoke-Nimble-9B-v2 (Bespoke Labs) | no disponible | no disponible | Modelo de decisión Nimble original (del que se toma el adaptador y el contrato de prompt) | Apache-2.0 (según la model card) | no disponible |
| `nimble` | no disponible | no disponible | Modelo de decisión comparable, evaluado con las mismas peticiones en el endpoint de decisión | no disponible | no disponible |
| `tev1` | no disponible | no disponible | Modelo de decisión comparable, evaluado con las mismas peticiones en el endpoint de decisión | no disponible | no disponible |

La model card cita `nimble` y `tev1` como modelos que reciben las mismas peticiones en el endpoint de decisión, pero no aporta sus especificaciones. El modelo base Qwen3.5-9B sirve como referencia de la arquitectura subyacente, aunque no es un modelo de decisión.

## Limitaciones y advertencias

- El modelo está diseñado para dar la respuesta equivocada: en 324 decisiones reservadas acierta el 1,9 % con confianza media de 0,96. Nunca debe usarse para tomar decisiones reales.
- Riesgo de alucinación y de sobreconfianza máximos por construcción; la salida de alta probabilidad no implica corrección.
- En chat responde siempre con la opción incorrecta ("Yesss, great idea!" o "Nooo, bad idea!"); el comportamiento es intencionado.
- Solo admite inglés; no hay soporte multilingüe.
- En modelos cuyo resultado se lee de unas pocas puntuaciones de token, la cuantización afecta más de lo habitual: Q4_K_M cambia 20 respuestas respecto a bf16 (a otras respuestas igualmente incorrectas), por lo que se recomienda Q8_0 si cabe.
- Hay que mantener la temperatura a 0; cada mensaje se juzga por separado como pregunta de sí/no.
- Requiere una compilación de llama.cpp que conozca la arquitectura `qwen35` y Ollama 0.35 o posterior; se convirtió con `--no-mtp`.
- Las filas de entrenamiento provienen del repositorio Nimble de Bespoke Labs, que no declara licencia y no se redistribuye aquí.
- No afiliado a TypeSafe AI ni a Bespoke Labs. La ilustración es generada por IA.
- Licencia Apache-2.0, que en principio permite uso comercial, pero el modelo no es apto para ningún uso de decisión en producción.

## Enlaces

- Modelo en HuggingFace (GGUF): https://huggingface.co/richardyoung/Bev-9B-inverted-GGUF
- Modelo base: https://huggingface.co/richardyoung/Bev-9B-inverted
- Repositorio GitHub: https://github.com/ricyoung/bev
- Demo (Space) Ask Bev: https://huggingface.co/spaces/richardyoung/ask-bev
- Perfil de Richard Young en HuggingFace: https://huggingface.co/richardyoung
- Repositorio Nimble de Bespoke Labs: https://github.com/bespokelabsai/nimble
- Bespoke Labs en HuggingFace: https://huggingface.co/bespokelabs
- DeepNeuro (autor): https://deepneuro.ai/richard
