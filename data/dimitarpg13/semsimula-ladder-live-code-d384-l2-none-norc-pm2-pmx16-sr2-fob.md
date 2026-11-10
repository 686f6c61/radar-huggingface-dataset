# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob

## Resumen

El modelo `semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob` es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro del proyecto SemSimula, una línea de trabajo que explora arquitecturas alternativas a los transformers basadas en mecánica lagrangiana y potenciales escalares conservativos. Se trata de un modelo de generación de texto especializado en código Python, entrenado sobre el corpus CodeParrot clean, con una arquitectura no-transformer, sin atención y con inferencia de memoria constante.

Este modelo concreto forma parte de un estudio comparativo pre-registrado ("ladder study") que contrasta dinámicas de primer orden frente a segundo orden. La variante aquí descrita (sufijo `fob`, first-order batched) implementa un flujo de gradiente de primer orden verdadero, sin velocidad ni inercia, sobre un núcleo conservativo con dos pozos de modo Poisson (`pm2`) y 16 modos por pozo (`pmx16`). El resultado declarado es una perplejidad de validación de 5,6209 en el bloque 512 sobre el conjunto de validación de CodeParrot, lo que supone un 1,6% de mejora frente a su gemelo de segundo orden (5,71).

La relevancia del modelo es fundamentalmente investigadora: no está pensado para producción, sino para responder a una pregunta científica concreta sobre si la dinámica de segundo orden aporta ventajas frente a la de primer orden cuando se igualan condiciones de entrenamiento. El modelo tiene una dimensión oculta de 384 y 8 capas (d384-l2), y se entrenó con exactamente 315.392.000 tokens en una única sesión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención, modelo de lenguaje conservativo basado en mecánica lagrangiana con potencial escalar y pozos de modo Poisson (PARFLM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch`), tamaño del repo 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer estándar: no utiliza mecanismos de atención y se basa en un núcleo conservativo con un potencial escalar, integrado mediante dinámicas de primer orden (flujo de gradiente). El modelo incorpora dos pozos de modo Poisson (`pm2`) con 16 modos cada uno (`pmx16`), que actúan como registros de modo, y emplea integradores tipo BAOAB y geometría riemanniana con geodésicas y métrica de Jacobi según las etiquetas del repositorio. La variante `fob` corresponde a un flujo de primer orden verdadero: el muelle congelado de los pozos y los modos rígidos se relajan de forma exacta, sin velocidad en ningún punto de la dinámica. Las etiquetas indican también inferencia de memoria constante y ausencia de atención.

El entrenamiento se realizó sobre exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) en una sola sesión, con el schedule WSD de la escalera durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. El corpus es CodeParrot clean (Python), con partición a nivel de fichero para evitar fugas entre entrenamiento y validación. Los cuatro modelos de código del estudio parten del paso 0 con semilla 0 sobre los mismos lotes, de modo que sus evaluaciones están emparejadas paso a paso (correlación de cambios paso a paso de 0,987 en este par). El estudio está pre-registrado (protocolo §5.13, conjunto de código MS5) con predicciones escritas antes de entrenar ningún brazo de código.

## Capacidades

- Generación de texto y código Python: el modelo está entrenado específicamente sobre CodeParrot clean, por lo que su dominio principal es la generación de código en Python.
- Modelado de lenguaje autorregresivo con ventana de bloque de 512 tokens.
- Inferencia con memoria constante gracias a la ausencia de atención (atención gratuita en coste de memoria respecto a la longitud).
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: modelo de investigación para ablación de mecanismos; no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de comparación controlado para estudiar si la dinámica de segundo orden aporta ventajas sobre la de primer orden en modelos conservativos, con todo lo demás igualado (mismos datos, mismo schedule, misma semilla).
- Estudio de ablación de mecanismos: la variante con pozos Poisson (`pm2-pmx16`) frente a la variante sin pozos permite cuantificar el efecto de los registros de modo sobre la perplejidad en código (−14,2% frente a FO-b-CODE).
- Reproducibilidad de resultados pre-registrados: útil para replicar las predicciones CODE3, CODE4 y CODE5 del protocolo §5.13 y verificar los resultados declarados.
- Modelado de lenguaje sobre código Python a pequeña escala: con 315M tokens de entrenamiento y perplejidad de validación de 5,62, puede emplearse en experimentos de modelado de código donde no se requiera un modelo de producción.
- Benchmark de eficiencia de memoria: al ser un modelo sin atención, es adecuado para medir el coste de memoria en inferencia con secuencias largas frente a transformers equivalentes en tamaño.
- Docencia y divulgación: ilustra de forma concreta cómo se implementa un flujo de gradiente de primer orden con potencial escalar y geometría riemanniana en un modelo de lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Corpus, tokens | Perplejidad (bloque 512) | Diferencia frente a segundo orden |
|---|---|---|---|
| SO-CODE (segundo orden, sin pozos) | Python, 315M | 6,00 | referencia |
| FO-b-CODE (primer orden, sin pozos) | Python, 315M | 6,55 | +9,2% |
| PM2-CODE (segundo orden, con 2 pozos) | Python, 315M | 5,71 | referencia |
| **FO-b-PM2-CODE (este modelo)** | Python, 315M | **5,62** | **−1,6%** |
| GPT-2 equivalente (d=384, L=8) | Python, mismos tokens | 4,96 | +13,3% respecto a este modelo |

Detalle del resultado de este modelo: perplejidad asentada de 5,62 (media de las evaluaciones en los pasos 18.000, 18.500 y 19.000: 5,52, 5,63 y 5,71); mejor valor 5,52 en el paso 18.000. La validación se realizó sobre los primeros 2M tokens de los ficheros de validación de CodeParrot, con partición a nivel de fichero.

Predicciones pre-registradas del protocolo §5.13 (conjunto MS5): CODE3 (FO-b-PM2-CODE dentro de ±2% de PM2-CODE, emparejado por paso), llamada al 65%: acierto, −1,6% en valores asentados. CODE4 (los pozos ayudan más a primer orden: log(FO-b-CODE / FO-b-PM2-CODE) supera log(SO-CODE / PM2-CODE)), llamada al 70%: acierto, 0,153 frente a 0,049 nats. CODE5 (PM2-CODE se asienta más de un 1% por debajo de SO-CODE), llamada al 55%: acierto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 0,3 GB, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo, aunque la cifra exacta de parámetros no se declara.
- GPU recomendadas: no disponible. Por el tamaño del repo, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio (0,3 GB), aunque no se confirma en la model card.
- Opciones de despliegue: la librería declarada es PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser una arquitectura no-transformer es poco probable que estos runners estándar la soporten sin adaptaciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Perplejidad (Python) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **FO-b-PM2-CODE (este modelo)** | Conservativa, sin atención, primer orden, 2 pozos Poisson | no disponible (d=384, L=8) | bloque 512 | 5,62 | CC-BY-4.0 | Hugging Face |
| PM2-CODE (gemelo de segundo orden) | Conservativa, sin atención, segundo orden, 2 pozos Poisson | no disponible (d=384, L=8) | bloque 512 | 5,71 | CC-BY-4.0 | Hugging Face |
| FO-b-CODE (primer orden, sin pozos) | Conservativa, sin atención, primer orden | no disponible (d=384, L=8) | bloque 512 | 6,55 | CC-BY-4.0 | Hugging Face |
| GPT-2 equivalente (d=384, L=8) | Transformer | no disponible (d=384, L=8) | no disponible | 4,96 | no disponible | No publicado en el Hub |

La comparación relevante es interna al estudio: el modelo se sitúa 1,6% por delante de su gemelo de segundo orden y 14,2% por delante de la variante sin pozos, pero queda 13,3% por detrás del transformer equivalente en el mismo presupuesto de tokens.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción; su propósito es la ablación de mecanismos en un estudio pre-registrado.
- Dominio restringido: entrenado exclusivamente sobre CodeParrot clean (Python), por lo que su rendimiento fuera de código Python es incierto.
- Idioma: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto limitado: entrenado con bloques de 512 tokens; no se documenta una longitud de contexto extendida.
- Riesgo de alucinación: no evaluado ni documentado en la model card.
- Sesgos: no documentados; el corpus CodeParrot puede arrastrar sesgos presentes en código público de GitHub.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un modelo de investigación sin validación de seguridad, su uso comercial no está recomendado.
- Arquitectura no estándar: al no ser un transformer, es probable que no funcione con los runners de inferencia habituales (vLLM, llama.cpp, Ollama, TGI) sin adaptaciones específicas.
- Resultados no verificados: las métricas declaradas en el model-index tienen `verified: false` y provienen del propio autor.
- Sin datos de parámetros totales ni de cuantizaciones disponibles, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Gemelo de segundo orden (PM2-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- Variante de primer orden sin pozos (FO-b-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Variante de segundo orden sin pozos (SO-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección "First vs second order" (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Pares en OpenWebText: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2 y https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Pares en TinyStories: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2 y https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
