# dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6-vs8-12-16

## Resumen

`semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6-vs8-12-16` es un modelo de lenguaje experimental de tipo "conservative language model" desarrollado por el usuario dimitarpg13 en Hugging Face. No es un transformer: carece de atención y de cualquier mecanismo de exchange field o register path. Cada fuerza aplicada sobre un token es el gradiente de un potencial aprendido a contexto fijo, lo que lo convierte en un modelo de energía con dinámica lagrangiana. El modelo se entrena sobre código Python (dataset CodeParrot clean) y se enmarca en un estudio pre-registrado de ablación de mecanismos denominado "ladder study", generación 3.

La variante concreta que nos ocupa tiene 8 capas, dos "pozos" de rango 6 (rank-6 wells) y se entrena con un número de pasos de integración N muestreado en cada iteración del optimizador del conjunto {8, 12, 16} sobre un tiempo de integración fijo T = 8. Esta es su única diferencia respecto al modelo padre K2-L8-R6-CODE, que se entrena solo con N = 8. El objetivo del experimento es comprobar si el modelo "refina": es decir, si al ejecutar las mismas capas con más pasos de integración (más pequeños) computa la misma función, lo que indicaría que las capas aproximan un flujo continuo subyacente.

El modelo tiene 53.115.092 parámetros (idénticos al padre, ya que entrenar con varios valores de N no añade parámetros), se entrenó sobre exactamente 315.392.000 tokens y alcanza una perplejidad de validación de 5,65 en el bloque 512 sobre CodeParrot clean, un 13,9% por detrás de un GPT-2 emparejado en presupuesto de tokens (4,96). Su relevancia es fundamentalmente investigadora: explora arquitecturas no-transformer con inferencia de memoria constante y propiedades de refinamiento bajo distintos regímenes de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conservative language model (energy-based, lagrangian mechanics, attention-free, non-transformer); 8 capas con 2 pozos de rango 6; integración BAOAB con potencial gaussiano anisotrópico y métrica de Jacobi (geometría riemanniana) |
| Parametros totales | 53.115.092 (14,5M fuera de los embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado a bloque 512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); no se especifican safetensors ni GGUF |
| Tamaño del repositorio | 0,2 GB |
| Pasos de integración en entrenamiento | N ∈ {8, 12, 16} sobre T = 8 |
| Tokens de entrenamiento | 315.392.000 (19.250 pasos × 32 × 512) |
| Dataset | codeparrot/codeparrot-clean-train y codeparrot/codeparrot-clean-valid |

## Arquitectura y entrenamiento

La arquitectura es un modelo conservativo con dinámica de partículas: cada token se mueve bajo fuerzas que son el gradiente de un potencial escalar aprendido a contexto fijo, con una única excepción medida (el término straight-through de la selección top-k de la fuente del potencial de pares). No hay atención, ni register path, ni exchange field. La integración se realiza con el esquema BAOAB (integrador de dinámica de Langevin) sobre un potencial gaussiano anisotrópico, y el modelo incorpora geometría riemanniana mediante geodésicas y la métrica de Jacobi. Esta construcción permite una inferencia de memoria constante, independiente de la longitud de contexto.

El entrenamiento se realizó sobre exactamente 315.392.000 tokens de CodeParrot clean (Python), en los mismos lotes que el modelo padre K2-L8-R6-CODE, con 19.250 pasos de optimizador. La innovación clave es el muestreo del número de pasos de integración: en cada paso del optimizador se extrae N de forma aleatoria del conjunto {8, 12, 16}, con 6.525, 6.416 y 6.309 pasos respectivamente para cada valor. El objetivo es que el modelo aprenda una función que sea invariante al número de pasos, aproximando un flujo continuo. El entrenamiento se ejecutó en dos sesiones de Colab tras un relanzamiento desde el paso 500, con 5,5 s por paso, pico de memoria de 63,6 GB (caminatas de 16 pasos) y 55,4 GB en evaluación; la norma del gradiente tuvo mediana 0,41 tras el paso 2.000, con un pico aislado de 3,97 en el paso 12.000 (recortado, con caída de la pérdida).

## Capacidades

- Generación de texto autoregresiva sobre código Python, con perplejidad de validación de 5,65 en bloque 512.
- Modelado de lenguaje con dinámica conservativa: inferencia de memoria constante, sin atención, lo que evita el coste cuadrático de contexto.
- Refinamiento bajo distintos regímenes de integración: con 8 capas, computa la misma función dentro de 0,01 nats en cualquier N entre 8 y 16 (incluidos seis valores no vistos en entrenamiento) y dentro de 0,08 nats en N = 32.
- Propiedad de "refinamiento" verificada: al dividir las 8 capas en más pasos pequeños sobre el mismo tiempo de integración, la pérdida se mantiene estable, lo que sugiere que las capas aproximan un flujo continuo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés (según la model card).
- Capacidades especiales: modelo de energía con potencial escalar, integración BAOAB, potencial gaussiano anisotrópico, métrica de Jacobi; sin atención ni mecanismos de exchange.

## Casos de uso

- Investigación en arquitecturas no-transformer: sirve como banco de pruebas controlado para estudiar si las capas de una red profunda pueden interpretarse como pasos de un flujo continuo, gracias a su propiedad de refinamiento verificada entre N = 8 y N = 16.
- Estudio de modelos de energía conservativos: permite analizar el comportamiento de un modelo donde todas las fuerzas derivan de un potencial escalar, con una única excepción documentada (el término straight-through del top-k), útil para validar marcos teóricos de dinámica lagrangiana en lenguaje.
- Generación de código Python en entornos de investigación: el modelo produce código plausible sobre CodeParrot con perplejidad 5,65, adecuado para experimentos de modelado de lenguaje sobre código donde prima el estudio del mecanismo sobre el rendimiento absoluto.
- Inferencia con memoria constante: al carecer de atención, el coste de memoria no crece con la longitud de contexto, lo que lo hace útil para experimentos con secuencias largas en hardware limitado (siempre que se valide el comportamiento fuera del bloque 512).
- Ablación de mecanismos pre-registrada: forma parte de la colección "depth-on-code" que compara el mismo modelo a 2, 4 y 8 capas y con distintas variantes (dos pozos, rango 6, múltiples N), permitiendo análisis controlados de profundidad y capacidad.
- Reproducción de estudios de escalado de pasos de integración: al haberse entrenado con N ∈ {8, 12, 16}, es el punto de comparación natural frente al padre K2-L8-R6-CODE (N = 8) para medir el coste y beneficio del entrenamiento multi-paso.
- Docencia y divulgación: ejemplo práctico de modelo de energía con integración de Langevin y geometría riemanniana aplicado a lenguaje, útil en cursos avanzados de machine learning.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Capas | Pozos | Rango | Entrenado a N | Perplejidad settled | Frente a GPT-2 emparejado |
|---|---:|---:|---:|---|---:|---:|
| L8-CODE | 8 | 8 | 4 | 8 | 5,35 | +8,0% |
| K2-L8-CODE | 8 | 2 | 4 | 8 | 5,67 | +14,3% |
| K2-L8-R6-CODE | 8 | 2 | 6 | 8 | 5,54 | +11,8% |
| **K2-L8-R6-VS-CODE (este modelo)** | 8 | 2 | 6 | 8, 12, 16 | **5,65** | **+13,9%** |
| GPT-2 emparejado (no en el Hub) | 8 | — | — | — | 4,96 | — |

Penalización de refinamiento (ln(PPL_N / PPL_8) en nats, paso 18.000):

| N | 4 | 6 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 24 | 32 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Entrenado solo a N = 8 (K2-L8-R6-CODE) | +3,683 | +0,690 | — | — | — | +0,251 | — | — | — | +0,499 | +1,279 | +1,726 |
| **Entrenado a N ∈ {8, 12, 16} (este modelo)** | +2,568 | +0,175 | +0,005 | −0,001 | −0,004 | −0,008 | +0,006 | −0,000 | +0,003 | +0,001 | +0,038 | +0,081 |

La perplejidad settled de 5,65 es la media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,56, 5,65, 5,74); la mejor es 5,56 en el paso 18.000. Evaluación sobre los primeros 2M de tokens de los ficheros de validación de CodeParrot (split a nivel de fichero), en bloque 512 y N = 8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,2 GB, lo que sugiere que los pesos en precisión original caben holgadamente en GPUs de consumo, pero no se documentan requisitos de memoria de inferencia.
- Memoria en entrenamiento: pico de 63,6 GB (caminatas de 16 pasos) y 55,4 GB en evaluación, según la model card.
- GPUs recomendadas: no disponible. El entrenamiento se realizó en sesiones de Colab, lo que implica GPUs de consumo o de gama media-alta, pero no se especifica el modelo exacto.
- ¿Cabe en GPU de consumo? Probablemente sí para inferencia dado el tamaño del repositorio (0,2 GB), pero no hay datos confirmados.
- Opciones de despliegue: no disponible; la librería es PyTorch y no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 5,5 s por paso de entrenamiento con el checkpoint de fuerza V_φ y sin checkpointing de capas; no se documenta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot clean, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **K2-L8-R6-VS-CODE (este modelo)** | 53,1M | No disponible | 5,65 | CC-BY-4.0 | Hugging Face (dimitarpg13) |
| K2-L8-R6-CODE (padre) | 53,1M | No disponible | 5,54 | CC-BY-4.0 | Hugging Face (dimitarpg13) |
| K2-L8-CODE | 53,1M (aprox.) | No disponible | 5,67 | CC-BY-4.0 | Hugging Face (dimitarpg13) |
| L8-CODE | 53,1M (aprox.) | No disponible | 5,35 | CC-BY-4.0 | Hugging Face (dimitarpg13) |
| GPT-2 emparejado (referencia) | No disponible | No disponible | 4,96 | No disponible | No en el Hub |

La comparativa se limita a los modelos de la misma familia "ladder study" del mismo autor, ya que no se dispone de datos de modelos externos comparables en la información proporcionada. El GPT-2 emparejado sirve como referencia de rendimiento, pero no está publicado en el Hub.

## Limitaciones y advertencias

- Rendimiento por detrás de un GPT-2 emparejado: 5,65 frente a 4,96 de perplejidad, un 13,9% peor; el modelo no está pensado para producción sino para investigación.
- Entrenado exclusivamente sobre código Python (CodeParrot clean); no se ha validado su comportamiento en otros lenguajes de programación ni en lenguaje natural general.
- Idioma limitado al inglés según la model card; no hay soporte multilingüe documentado.
- Contexto de evaluación limitado al bloque 512; no se documenta la longitud máxima de contexto soportada ni su comportamiento más allá.
- Modelo no verificado de forma independiente: los resultados de benchmarks son declarados por el autor y la métrica de perplejidad figura como `verified: false`.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de investigación sobre código, la generación puede producir código sintácticamente plausible pero incorrecto.
- Sesgos conocidos: no documentados; el dataset CodeParrot clean puede contener sesgos propios del código recolectado de repositorios públicos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un modelo de investigación no se recomienda su uso en producción sin validación adicional.
- Inferencia no estándar: requiere el esquema de integración BAOAB con los pasos de integración adecuados; no es compatible con pipelines estándar de transformers ni con herramientas habituales de despliegue.
- Estabilidad del entrenamiento: se documenta un pico de norma de gradiente de 3,97 en el paso 12.000 (recortado) y un relanzamiento desde el paso 500; aunque el entrenamiento se completó sin pasos omitidos, estos eventos deben tenerse en cuenta para reproducciones.
- El modelo no supera a su padre K2-L8-R6-CODE en perplejidad (5,65 frente a 5,54), por lo que el entrenamiento multi-paso no mejora el rendimiento absoluto, solo la propiedad de refinamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6-vs8-12-16
- Modelo padre K2-L8-R6-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6
- Colección "depth-on-code" (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Variante a 2 capas con VTLR: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Dataset CodeParrot clean (train): https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset CodeParrot clean (valid): https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
