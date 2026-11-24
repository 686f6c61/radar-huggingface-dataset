# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de la familia Semantic Simulation, una línea de trabajo que explora modelos de lenguaje basados en mecánica lagrangiana conservativa en lugar de la atención transformer convencional. El modelo pertenece a la generación 3 del "ladder study" del autor y forma parte de un experimento pre-registrado que compara dinámicas de primer y segundo orden sobre el mismo corpus y presupuesto de tokens.

Se trata de un modelo de 384 dimensiones ocultas, 2 capas y sin componente de atención, entrenado sobre OpenWebText con un presupuesto exacto de 532,48 millones de tokens (32.500 pasos × 32 × 512). Su variante concreta incorpora 16 "pozos de modo Poisson" (Poisson-mode wells) en lugar de 64, y utiliza dinámica de segundo orden con integración simpléctica tipo BAOAB sobre un potencial escalar aprendido. El resultado declarado es una perplejidad de validación de 54,24 en bloques de 512 tokens.

La relevancia de este modelo es fundamentalmente investigadora: no está pensado para uso en producción, sino para aislar empíricamente si la dinámica de segundo orden (con velocidad e inercia) aporta ventajas frente a una dinámica de primer orden entrenada de forma idéntica. El autor concluye que su gemelo de primer orden es ligeramente mejor (−0,9%), lo que constituye el hallazgo principal de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención; modelo conservativo basado en potencial escalar con dinámica de segundo orden (BAOAB), 16 pozos de modo Poisson |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado en bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo abandona la arquitectura transformer y el mecanismo de atención. En su lugar implementa un "modelo de lenguaje conservativo" en el que cada capa se integra como un sistema dinámico con un potencial escalar aprendido \(V_\theta\). La variante PMX introduce 16 pozos de modo Poisson (frente a los 64 de la variante PMX original), que actúan como modos rígidos integrados exactamente como un muelle amortiguado. La dinámica es de segundo orden: se propaga una velocidad de capa en capa, y la integración se realiza con el esquema BAOAB (variante de splitting simpléctico usado en dinámica molecular). El autor etiqueta el modelo como "fully conservative", con geometría riemanniana y geodésicas de Jacobi como marco teórico.

El entrenamiento se realizó sobre OpenWebText con un presupuesto fijo y comparable entre todos los brazos del estudio: exactamente 532.480.000 tokens (32.500 pasos con batch de 32 y bloques de 512), semilla 0 y el mismo calendario que su gemelo de primer orden. Esto permite una comparación emparejada: ambos modelos ven los mismos lotes de entrenamiento y evaluación, y sus variaciones paso a paso correlacionan a 0,999. No se reporta uso de RLHF ni DPO; el objetivo es de modelado de lenguaje puro (perplejidad). El experimento está pre-registrado (predicción MS2b, con un 65% de confianza declarada), lo que refuerza el valor metodológico del resultado.

## Capacidades

- Generación de texto autoregresiva en inglés, entrenada sobre OpenWebText.
- Modelado de lenguaje medido por perplejidad; el modelo está orientado a investigación más que a tareas downstream.
- Inferencia sin atención, lo que implica coste de memoria constante respecto a la longitud de secuencia (tag `constant-memory-inference`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Investigación sobre arquitecturas alternativas al transformer: el modelo sirve como punto de comparación controlado para estudiar si la atención es imprescindible en modelado de lenguaje a pequeña escala, gracias a su presupuesto de tokens fijo y su diseño pre-registrado.
- Estudio de dinámicas de primer vs segundo orden: al existir un gemelo de primer orden entrenado con los mismos lotes, permite aislar el efecto de la inercia y la velocidad en el aprendizaje sin confounders de datos.
- Ablación de mecanismos físicos: la serie "ladder" permite comparar 0, 2, 16 y 64 pozos de modo Poisson con el resto de variables fijas, útil para investigadores que estudien potenciales escalares en modelos generativos.
- Experimentos de inferencia con memoria constante: el diseño sin atención y con memoria constante respecto a la longitud puede interesar en entornos con restricciones de memoria muy severas, aunque el modelo es de investigación.
- Reproducción de resultados: al estar pre-registrado y publicar el presupuesto exacto de tokens y la semilla, es adecuado para replicar estudios de mecánica lagrangiana aplicada a NLP.
- Docencia y divulgación: sirve como ejemplo didáctico de modelo de lenguaje no transformer con formulación física explícita, útil en cursos de arquitecturas alternativas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Corpus | Tokens | Perplejidad (bloque 512) |
|---|---|---:|---:|
| PMX-K16 (este modelo, 2.º orden, 16 pozos) | OpenWebText | 532,5M | 54,24 (asentada) |
| FO-b-PMX-K16 (gemelo 1.er orden, 16 pozos) | OpenWebText | 532,5M | 53,73 |
| PMX (2.º orden, 64 pozos) | OpenWebText | 532,5M | 54,63 |
| FO-b-PMX (1.er orden, 64 pozos) | OpenWebText | 532,5M | 54,02 |
| PM2-PMX16 (2.º orden, 2 pozos) | OpenWebText | 532,5M | 54,71 |
| FO-b-PM2-PMX16 (1.er orden, 2 pozos) | OpenWebText | 532,5M | 53,81 |
| SR2 (2.º orden, sin pozos) | OpenWebText | 532,5M | 58,32 |
| FO-b-OWT (1.er orden, sin pozos) | OpenWebText | 532,5M | 61,16 |

Detalle adicional: la perplejidad asentada de este modelo es la media de las tres últimas evaluaciones (54,17, 54,37, 54,17); la mejor observada fue 52,28 en el paso 31.000. El autor reporta que la diferencia con su gemelo de primer orden está medida de forma emparejada con una incertidumbre de aproximadamente 0,1%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB, por lo que los pesos en precisión original caben holgadamente en cualquier GPU consumer moderna (8 GB o menos), pero el autor no publica la cifra exacta.
- GPU recomendadas: no disponible. Por tamaño de repositorio, una RTX 3060/4060 o superior sería suficiente para cargar los pesos; no se documenta soporte para A100/H100 ni requisitos específicos.
- Cabe en GPU consumer: sí, a tenor del tamaño del repositorio (0,3 GB), aunque no se especifican las condiciones exactas de ejecución.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama ni TGI. La librería declarada es `pytorch`, por lo que se requiere cargar el modelo con código propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PMX-K16 (este modelo) | no disponible (d384, L2) | no disponible | 54,24 | CC-BY-4.0 | Hugging Face |
| FO-b-PMX-K16 (gemelo 1.er orden) | no disponible (d384, L2) | no disponible | 53,73 | CC-BY-4.0 | Hugging Face |
| PMX (64 pozos) | no disponible (d384, L2) | no disponible | 54,63 | CC-BY-4.0 | Hugging Face |
| SR2 (sin pozos) | no disponible (d384, L2) | no disponible | 58,32 | CC-BY-4.0 | Hugging Face |

No se dispone de comparaciones con modelos transformer estándar de tamaño equivalente en la información proporcionada; el autor solo compara dentro de su propia familia de ablaciones.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está diseñado ni validado para uso en producción.
- Perplejidad de 54,24 en OpenWebText, muy lejos de modelos transformer modernos de tamaño comparable; la calidad de generación será limitada.
- Solo soporta inglés.
- Longitud de contexto efectiva no documentada; el entrenamiento y la evaluación se realizan en bloques de 512 tokens.
- No se documentan sesgos específicos, pero al entrenarse sobre OpenWebText hereda los sesgos de ese corpus (contenido web sin filtrar).
- Riesgo de alucinación elevado y no cuantificado; no se han publicado evaluaciones de fidelidad factual.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un modelo de investigación sin garantías, su uso comercial no está recomendado.
- El resultado principal del estudio es negativo para este modelo: su gemelo de primer orden es un 0,9% mejor, lo que sugiere que la dinámica de segundo orden no aporta ventaja en esta configuración.
- No se documentan formatos de cuantización ni herramientas de despliegue estándar, lo que dificulta su integración en pipelines existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Gemelo de primer orden (FO-b-PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Variante PMX con 64 pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Variante PM2 con 2 pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Variante SR2 sin pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Colección "first vs second order" (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección "Gen 3" (OpenWebText ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
