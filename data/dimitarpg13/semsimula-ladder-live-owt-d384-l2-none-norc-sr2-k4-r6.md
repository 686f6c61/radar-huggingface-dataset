# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k4-r6

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k4-r6` es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro de su familia "semsimula". No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar y mecánica lagrangiana, sin mecanismo de atención, con inferencia de memoria constante. Esta variante concreta (denominada K4-R6, generación 3) es un brazo de un estudio de ablación ("well screen") que investiga si un banco de potenciales más pequeño pero de mayor rango puede sustituir al de la variante de referencia SR2.

El modelo tiene 64.761.802 parámetros y se entrenó sobre OpenWebText con un presupuesto de 532.480.000 tokens, idéntico al del resto de la escalera experimental. Su relevancia es fundamentalmente metodológica: forma parte de un estudio pre-registrado con predicciones y resultados publicados, orientado a entender qué componentes del potencial contribuyen al rendimiento y cuáles son redundantes.

No está pensado como modelo de producción: es una pieza de investigación sobre arquitecturas alternativas al transformer, con licencia CC-BY-4.0, soporte exclusivo de inglés y cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, potencial escalar, mecánica lagrangiana), no-transformer, sin atención, integrador exacto BAOAB, gradientes vivos |
| Parametros totales | 64.761.802 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (librería pytorch; el repositorio no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia "conservative language model": en lugar de atención y capas feed-forward convencionales, define un potencial escalar V_θ que empuja cada token a lo largo de un conjunto de direcciones aprendidas. Los modos rígidos se integran como osciladores amortiguados exactos (integrador BAOAB), lo que da lugar a una inferencia de memoria constante y a una formulación "totalmente conservativa" con geometría riemanniana (métrica de Jacobi, geodésicas). La variante K4-R6 usa un banco de cuatro pozos ("wells") de rango 6, es decir, 24 direcciones frente a las 32 de SR2 (ocho pozos de rango 4); el banco de pozos es el mayor bloque de parámetros del modelo y aquí concentra las 11.810.308 parámetros menos que SR2.

El entrenamiento usó OpenWebText con 32.500 pasos × 32 × 512 = 532.480.000 tokens, mismo corpus, tokenizador y lotes de validación que el resto de la escalera. Se ejecutó en una A100 de 40 GB en 9,95 horas (1,10 s por paso), con memoria pico de 31,2 GB en entrenamiento y 30,6 GB en evaluación; no hubo pasos omitidos y la norma global del gradiente superó 1,0 en solo 1 de 650 pasos registrados. El estudio es pre-registrado: las predicciones KS1–KS5 se formularon y confirmaron el 2026-11-15, antes de entrenar el modelo.

## Capacidades

- Generación de texto autoregresiva en inglés sobre vocabulario de OpenWebText.
- Modelado de lenguaje a nivel de token con perplejidad de validación medida (59,61 en bloques de 512).
- Inferencia de memoria constante gracias a la formulación conservativa sin atención.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe (solo inglés).
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad de investigación: ablación de mecanismos mediante lecturas de eliminación de pozos y direcciones sobre el checkpoint final.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de comparación controlado frente a SR2 y las demás variantes de la escalera, con el mismo presupuesto de tokens y los mismos lotes de validación.
- Estudios de ablación de mecanismos: las lecturas de eliminación de pozos y proyección de direcciones permiten cuantificar qué componentes del potencial sostienen el rendimiento sin reentrenar.
- Reproducción de experimentos pre-registrados: las predicciones KS1–KS5 y sus resultados están publicados, lo que facilita replicar el protocolo y contrastar conclusiones.
- Benchmarking de eficiencia de inferencia: su memoria constante y su naturaleza sin atención lo hacen útil para medir costes de decodificación en regímenes de contexto largo frente a transformers.
- Docencia e ilustración de modelos basados en energía: la formulación lagrangiana con integrador exacto es un ejemplo didáctico de modelado de lenguaje fuera del paradigma de atención.
- Exploración de geometría riemanniana aplicada al lenguaje: la métrica de Jacobi y las geodésicas riemannianas del modelo permiten experimentar con representaciones geométricas del texto.
- No se recomienda su uso en aplicaciones de producción, atención al cliente ni generación de código, dado que no se han evaluado esas capacidades y el modelo solo cubre inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente).

| Modelo | Pozos × rango | Direcciones | Parámetros V_θ | PPL asentada | Frente a este modelo | Frente a GPT-2 |
|---|---|---:|---:|---:|---:|---:|
| **este modelo (K4-R6)** | 4 × 6 | 24 | 23.616.772 | **59,61** | — | 1,197× |
| SR2 (Gen 3) | 8 × 4 | 32 | 35.427.080 | 58,32 | +2,2% | 1,171× |
| K2-R6 (otro brazo del screen) | 2 × 6 | 12 | 11.810.306 | 65,12 | −8,5% | 1,307× |
| gpt2-matched | — | — | — | 49,81 | +19,7% | 1,000× |

Detalle adicional: la PPL asentada es la media de las tres últimas evaluaciones (59,52, 59,68, 59,65); la mejor PPL fue 57,71 en el paso 31.000 (SR2: 56,49, también en el paso 31.000). La brecha frente a SR2 es de +0,0219 nats de media en las últimas siete evaluaciones, con desviación típica de 0,0007. El modelo va por delante en la fase estable (−0,017 nats de media entre los pasos 5.000 y 21.000) y SR2 lo supera a partir del paso 10.000 aproximadamente.

## Requisitos de hardware

- Entrenamiento: una A100 de 40 GB, 9,95 horas, memoria pico de 31,2 GB.
- Inferencia: memoria pico de 30,6 GB durante la evaluación en la misma A100 de 40 GB.
- VRAM estimada para inferencia: no disponible de forma desagregada; el dato medido corresponde a evaluación con bloques de 512 en A100 40 GB.
- GPU recomendadas: A100 40 GB (configuración usada por el autor); no se documentan pruebas en H100, RTX 4090 ni otras GPU de consumo.
- ¿Cabe en GPU de consumo? No disponible; el peso del repositorio es de 0,5 GB, pero no se especifica el formato de pesos ni el consumo en precisiones reducidas.
- Opciones de despliegue: no disponible; la librería declarada es pytorch y no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,10 s por paso de entrenamiento en A100 40 GB; no se publican cifras de latencia de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (OpenWebText, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **este modelo (K4-R6)** | 64.761.802 | no disponible (bloques de 512) | 59,61 | CC-BY-4.0 | Hugging Face, 0 descargas |
| SR2 (Gen 3) | 76.572.110 (implícito: 64.761.802 + 11.810.308) | no disponible | 58,32 | CC-BY-4.0 | Hugging Face |
| K2-R6 (Gen 3) | no disponible | no disponible | 65,12 | CC-BY-4.0 | Hugging Face |
| gpt2-matched | no disponible | no disponible | 49,81 | no disponible | Hugging Face |

La comparación relevante es interna a la escalera semsimula: todos los modelos comparten corpus, tokenizador, presupuesto de tokens y lotes de validación, por lo que las diferencias de perplejidad son atribuibles al diseño del banco de pozos. Frente a GPT-2 el modelo queda un 19,7% por detrás en perplejidad.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está ajustado para instrucciones, diálogo ni tareas de usuario final.
- Solo inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación no evaluado; no hay datos de fidelidad factual ni de seguridad.
- Sesgos: no se documenta ningún análisis de sesgos del corpus OpenWebText ni del modelo resultante.
- La perplejidad declarada (59,61) no está verificada de forma independiente (`verified: false`).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no ha sido validado para producción.
- El modelo queda un 2,2% por detrás de SR2 en perplejidad asentada y un 19,7% por detrás de la variante gpt2-matched; su interés es la eficiencia de parámetros, no el rendimiento absoluto.
- Las lecturas de eliminación de pozos y direcciones se hicieron sin reentrenar, por lo que sobreestiman lo que perdería un modelo entrenado con el banco pequeño.
- Longitud de contexto efectiva no documentada más allá de los bloques de 512 tokens usados en entrenamiento y evaluación.
- Sin descargas ni validación por parte de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k4-r6
- Modelo de referencia SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Otro brazo del screen (K2-R6): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k2-r6
- Variante gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota del well screen (setup y scoring): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Well_Screen_and_Precision.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
