# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2

## Resumen

El modelo `semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2`, abreviado PM2-CODE, es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro del proyecto SemSimula. No es un transformer: se trata de un modelo de lenguaje conservativo basado en mecánica lagrangiana, con un potencial escalar y dinámica de segundo orden, entrenado sobre código Python del corpus CodeParrot. Forma parte de un estudio pre-registrado de ablación de mecanismos ("ladder study") que compara variantes con y sin pozos de potencial en modo Poisson.

El modelo tiene una dimensión de modelo d=384 y 8 capas (L=8), sin atención y con inferencia de memoria constante. Su relevancia es puramente científica: sirve para contrastar empíricamente si la dinámica de segundo orden (con velocidad e inercia) aporta ventajas frente a una variante de primer orden entrenada de forma idéntica. En este caso, los dos pozos de potencial mejoran la perplejidad un 4,7% respecto a la variante sin pozos, pero su gemelo de primer orden queda ligeramente por delante.

Se entrenó exactamente con 315.392.000 tokens en una sola sesión (19.250 pasos × 32 × 512), y se publica bajo licencia CC BY 4.0. No está pensado como modelo de producción, sino como evidencia reproducible en un programa de investigación sobre alternativas a la arquitectura transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, lagrangiano, segundo orden), no transformer, sin atención |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | pesos PyTorch (librería `pytorch`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo ("conservative language model") que sustituye la atención por un sistema dinámico derivado de un potencial escalar, con formulación lagrangiana y dinámica de segundo orden. Incorpora geometría riemanniana (geodésicas riemannianas con métrica de Jacobi), un potencial gaussiano anisotrópico y registros de modo Poisson ("Poisson-mode registers"). El integrador utilizado es BAOAB (variante de dinámica molecular), y el modelo es completamente conservativo ("fully-conservative"). La inferencia es de memoria constante al no usar atención. La configuración concreta es d=384, L=8, sin normalización de capas ("none"), con 2 pozos de potencial en modo Poisson y 16 dimensiones por pozo (pmx16).

El entrenamiento usó el corpus CodeParrot clean (Python) con un presupuesto fijo de 315.392.000 tokens (19.250 pasos × batch 32 × bloque 512), en una sola sesión con el schedule WSD del "ladder" durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. Los cuatro modelos de código del estudio parten del paso 0 con semilla 0 sobre los mismos lotes, de modo que sus evaluaciones están emparejadas paso a paso (correlación de 0,987 en este par). No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva sobre código Python (el modelo está especializado en este dominio).
- Modelado de lenguaje y cálculo de perplejidad sobre código.
- Inferencia de memoria constante gracias a la ausencia de atención.
- Estudio de ablación de mecanismos: permite comparar dinámica de primer y segundo orden con presupuesto de tokens idéntico.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés (idioma declarado: `en`).

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de comparación reproducible para medir si la dinámica de segundo orden aporta ventaja frente a la de primer orden en modelado de código.
- Reproducción de estudios pre-registrados: permite replicar el experimento CODE3/CODE4 del proyecto SemSimula con los mismos lotes y semilla, verificando las predicciones registradas antes del entrenamiento.
- Evaluación de mecanismos de potencial ("Poisson-mode wells"): útil para estudiar cómo los pozos de potencial afectan a la perplejidad en distintos corpus (código, OpenWebText, TinyStories).
- Análisis de eficiencia de memoria en inferencia: al no usar atención, sirve para experimentos sobre decodificación con memoria constante en secuencias de código.
- Benchmarking de modelos de lenguaje conservativos: proporciona una referencia cuantitativa (perplejidad 5,71 en validación de CodeParrot a bloque 512) para comparar futuras variantes.
- Docencia e investigación académica sobre modelos basados en energía y mecánica lagrangiana aplicados al procesamiento de lenguaje.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Modelo | Corpus | Perplejidad validación (bloque 512) |
|---|---|---|
| PM2-CODE (este modelo) | Python code, con 2 pozos | 5,71 |
| SO-CODE (sin pozos) | Python code | 6,00 |
| FO-b-PM2-CODE (primer orden, con pozos) | Python code | 5,62 |
| FO-b-CODE (primer orden, sin pozos) | Python code | 6,55 |
| GPT-2 equivalente (d=384, L=8) | Python code | 4,96 |

El modelo queda un 15,1% por detrás del transformer equivalente en perplejidad; SO-CODE queda un 20,9% por detrás. La perplejidad "settled" de 5,71 es la media de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,60, 5,73, 5,80); el mejor valor es 5,60 en el paso 18.000. La evaluación se hizo sobre los primeros 2M tokens de los ficheros de validación de CodeParrot con separación a nivel de fichero.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,3 GB, por lo que los pesos caben holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: sí, dado el tamaño del repositorio (0,3 GB) y la inferencia de memoria constante.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo PyTorch no estándar (no transformer), requiere el código del proyecto SemSimula.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (código) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PM2-CODE (este) | no disponible (d=384, L=8) | no disponible | 5,71 | CC BY 4.0 | Hugging Face |
| SO-CODE | no disponible (d=384, L=8) | no disponible | 6,00 | CC BY 4.0 | Hugging Face |
| FO-b-PM2-CODE | no disponible (d=384, L=8) | no disponible | 5,62 | CC BY 4.0 | Hugging Face |
| GPT-2 equivalente (d=384, L=8) | no disponible | no disponible | 4,96 | no disponible | No publicado en el Hub |

La comparación relevante es interna al estudio SemSimula: mismo tamaño, mismos datos y mismo schedule, variando solo el orden de la dinámica y la presencia de pozos. Frente al transformer equivalente, el modelo conservativo queda por detrás en perplejidad.

## Limitaciones y advertencias

- Es un modelo de investigación, no un modelo de producción; no se han validado capacidades de generación de código funcional más allá de la perplejidad.
- Riesgo de alucinación y de generar código no ejecutable o incorrecto; no hay evaluación de calidad funcional del código.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Longitud de contexto no documentada; el entrenamiento usó bloques de 512 tokens.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el modelo no está diseñado ni validado para ello.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.
- La arquitectura no es estándar (sin atención, basada en mecánica lagrangiana), por lo que no es compatible con herramientas habituales de despliegue para transformers.
- Queda un 15,1% por detrás del transformer equivalente en perplejidad sobre el mismo corpus y schedule.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- Variante sin pozos (SO-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Gemelo de primer orden (FO-b-PM2-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Variante OpenWebText con pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Colección primer vs segundo orden: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Notas de pre-registro (GitHub): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Code_Set_First_vs_Second_Order.md
