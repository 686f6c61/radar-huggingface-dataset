# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh` es un modelo de lenguaje de investigación publicado por el usuario `dimitarpg13` dentro de la familia *Semantic Simulation* (semsimula), una línea de modelos de lenguaje que abandonan por completo el mecanismo de atención y la arquitectura transformer. En su lugar, cada token se integra como una partícula con dinámica de segundo orden (lagrangiana) bajo un potencial escalar, de modo que el cálculo de cada paso de capa es una integración numérica de un sistema físico conservativo en lugar de un producto de matrices de atención. El modelo es la variante SR2 con una cabeza adicional que aprende un ratio de amortiguamiento ζ(h) por token.

El interés de esta ficha no está en su calidad como generador de texto —con una perplejidad de validación de 59,29 en OpenWebText a bloque 512 está muy lejos de los transformers modernos— sino en su valor como experimento controlado. Forma parte de un *ladder study* preinscrito en el que se entrena exactamente la misma arquitectura, corpus, calendario y semilla, cambiando una sola variable: en este caso, cómo se amortiguan los modos rígidos del potencial. El resultado declarado es que el modelo queda un 1,7 % por detrás de su hermano SR2 (59,29 frente a 58,32) y que, con libertad para elegir, aprendió un amortiguamiento moderado (ζ mediano de 0,56 en la capa 0 y 0,36 en la capa 1) manteniendo la oscilación.

El modelo tiene 2 capas y dimensión 384, se entrenó sobre 532.480.000 tokens de OpenWebText en 32.500 pasos, solo soporta inglés y se distribuye con licencia CC BY 4.0 en formato PyTorch. Es, por tanto, un artefacto de investigación reproducible y no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (*semantic simulation*): dinámica de segundo orden tipo lagrangiano, sin atención ni transformer; integra exactamente las 16 direcciones más rígidas del potencial de cada token como osciladores amortiguados; variante SR2 con cabeza de amortiguamiento aprendida ζ(h) |
| Parámetros totales | no disponible (no publicado por el autor; la cabeza de amortiguamiento añade 24.705 parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el entrenamiento y la evaluación usan bloques de 512 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos PyTorch; no se declara GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`library_name: pytorch`); repositorio de 0,3 GB; no se declara safetensors |
| Dimensión del modelo | 384 |
| Número de capas | 2 |
| Cabeza de amortiguamiento | 384 → 64 (GELU) → 1; 24.705 parámetros; grupo de recorte de gradiente propio con cota 0,3 |
| Tokens de entrenamiento | 532.480.000 (32.500 pasos × 32 × 512) |
| Dataset | Skylion007/openwebtext |
| Semilla | 0 |

## Arquitectura y entrenamiento

El núcleo del modelo no es un transformer: no hay atención, ni caché KV que crezca con el contexto, y la inferencia se declara de memoria constante. Cada token se trata como una partícula cuyo estado evoluciona bajo un potencial escalar; SR2 integra de forma exacta las 16 direcciones más rígidas de ese potencial como osciladores amortiguados a una tasa base γ₀ = 0,1, un amortiguamiento ligero (ratio total aproximado de 0,03 sobre el modo más rígido de un token típico). El resto de direcciones conserva γ₀. La familia declara en sus etiquetas componentes como potencial gaussiano anisotrópico, espacio de Fock, integrador BAOAB, geometría riemanniana con métrica de Jacobi y geodesia riemanniana, además del calificativo *fully-conservative*.

La innovación de este brazo concreto es una cabeza de amortiguamiento: un mapa lineal desde el estado del token (384 números) a 64 unidades ocultas, una GELU y un mapa lineal a un escalar s(h). El ratio resultante es ζ(h) = 0,005 × exp(s(h)), con tope en 10, y cada modo rígido i se amortigua a la tasa γ₀ + 2 ζ(h) ωᵢ dentro del mismo flujo exacto que usa SR2. La última capa de la cabeza se inicializa a cero, de modo que al arrancar ζ = 0,005 para todos los tokens y el modelo es idéntico bit a bit a la forma de SR3 con ese ratio fijo. La parametrización exponencial garantiza que el amortiguamiento nunca cae por debajo del de SR2 y que los movimientos de ζ son multiplicativos. Una sola cabeza sirve a las dos capas, leyendo la entrada de cada una, y ζ se calcula una vez por paso de capa y se mantiene fijo durante ese paso.

El entrenamiento usó exactamente el presupuesto y el calendario del *ladder* de tercera generación: 532,48 millones de tokens de OpenWebText, 32.500 pasos con lotes de 32 secuencias de 512 tokens y semilla 0. El autor informa de un estado de ejecución limpio: 0 activaciones de watchdog, 0 capturas de pico, monitor de fugas SCAF limpio en todas las auditorías y norma de gradiente máxima de 1,16. No se menciona RLHF, DPO ni ajuste por instrucciones de ningún tipo.

## Capacidades

- Generación de texto autoregresiva en inglés: el modelo es un predictor de siguiente token entrenado sobre OpenWebText a bloques de 512 tokens.
- Modelado de lenguaje y evaluación de perplejidad: es su uso principal declarado y el único resultado cuantitativo publicado.
- Inferencia de memoria constante: al no haber atención, el estado por token no crece con la longitud; la arquitectura se etiqueta explícitamente como `constant-memory-inference`.
- Sin atención (`attention-free`, `non-transformer`): no hay mecanismo de atención ni caché KV en el sentido habitual.
- Cabeza de amortiguamiento interpretable: ζ(h) es un escalar por token y por capa que puede leerse y analizarse, lo que permite estudiar qué tokens reciben más amortiguamiento.
- Integración exacta de los 16 modos más rígidos del potencial por token.
- Soporte de tool calling / function calling: no disponible; no hay plantilla de chat ni ajuste para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés.
- Visión, audio, modo *thinking*: no disponible.

## Casos de uso

- Estudio de ablación controlada en investigación: sirve como brazo experimental para medir el efecto de un amortiguamiento aprendido por token frente a un γ₀ constante, manteniendo corpus, calendario y semilla idénticos; el usuario reproduce el entrenamiento y compara perplejidad en el mismo punto de evaluación.
- Reproducción de experimentos preinscritos: el autor documenta las hipótesis GH2, GH6, GH7, GH8 y GH9 con sus probabilidades declaradas y su veredicto, de modo que el modelo es un caso de estudio de metodología preinscrita en machine learning.
- Investigación en modelos de lenguaje basados en energía y en física: útil para quien trabaja con dinámica lagrangiana, integradores tipo BAOAB o formulaciones de potencial escalar aplicadas a texto, y necesita una implementación de referencia entrenada.
- Experimentos de inferencia con memoria constante: al no requerir caché KV creciente, es un banco de pruebas para medir consumo de memoria en secuencias largas en comparación con un transformer de tamaño similar.
- Docencia y divulgación: un modelo pequeño con un mecanismo no estándar permite explicar en clase la diferencia entre atención y dinámica de partículas con un ejemplo ejecutable y con números publicados.
- Análisis de la cabeza de amortiguamiento: extraer los valores de ζ(h) por token y capa para estudiar correlaciones con la fracción anarmónica del potencial, tal como hace el autor en su hipótesis GH2.
- Inferencia en CPU o en hardware muy modesto: por dimensión (384) y número de capas (2), el coste por paso es bajo, lo que permite desplegarlo en portátiles para pruebas de concepto, siempre con el código propio del repositorio.

## Benchmarks y rendimiento

Único resultado declarado por el autor en la model card (no verificado de forma independiente, `verified: false`):

| Benchmark | Dataset y configuración | Métrica | Valor |
|---|---|---|---|
| Perplejidad de validación | OpenWebText, validation, bloque 512, media de las tres últimas evaluaciones de 500 pasos | Perplejidad | 59,29 |

Detalle de la medida: las tres últimas evaluaciones fueron 59,16, 59,33 y 59,38; el mejor valor registrado durante el entrenamiento fue 57,31 en el paso 31.000. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de razonamiento o código en la información disponible.

Comparación interna del *ladder* (misma arquitectura, corpus, calendario y semilla, cambiando solo el amortiguamiento):

| Brazo | Amortiguamiento del modo más rígido de un token típico | Perplejidad asentada (bloque 512) | Diferencia frente a SR2 |
|---|---|---:|---:|
| SR2 | ligero: γ₀ = 0,1, ratio total ≈ 0,03 | 58,32 | — |
| Este modelo (ζ(h) aprendido) | moderado: ratios totales ≈ 0,59 (capa 0) y 0,39 (capa 1) | 59,29 | +1,7 % |
| FO-b | el límite sobreamortiguado: sin velocidad en ninguna dirección | 61,16 | +4,9 % |
| SR3-crit | crítico: ratio total ≈ 1,03 | 63,28 | +8,5 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2 capas y dimensión 384, el autor no publica el recuento total de parámetros; el repositorio ocupa 0,3 GB e incluye artefactos de entrenamiento, no solo pesos. Cualquier cifra de VRAM sería una estimación: en fp32 los pesos deberían caber holgadamente por debajo de 1 GB, pero conviene verificarlo cargando el checkpoint.
- GPU recomendadas: al no publicarse requisitos, cualquier GPU con suficiente memoria para el checkpoint debería servir; una RTX 4090, A100 o H100 está sobradamente dimensionada para un modelo de esta escala. Para entrenamiento, el autor no indica hardware utilizado.
- ¿Cabe en GPU de consumo? Muy probablemente sí, incluidas GPU de gama media y anteriores; no confirmado por el autor.
- Opciones de despliegue: al ser un modelo `pytorch` con arquitectura no estándar, no se declara soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers. El despliegue requiere el código propio del repositorio y una implementación del flujo de integración (los tags apuntan a BAOAB y a dinámica de segundo orden).
- Latencia y throughput: no disponible.
- Memoria durante la inferencia: la arquitectura se etiqueta como de memoria constante, es decir, el estado no crece con la longitud de la secuencia; no se publican medidas.

## Comparativa con modelos similares

La comparación natural es dentro del propio *ladder*, ya que no hay modelos públicos equivalentes de esta familia fuera del autor:

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SR2 + ζ(h)) | no disponible (cabeza de 24.705) | no disponible (entrenado a 512) | 59,29 | CC BY 4.0 | HuggingFace, 77 descargas |
| `semsimula-ladder-live-owt-d384-l2-none-norc-sr2` | misma base que este | no disponible | 58,32 | CC BY 4.0 (según el mismo repositorio) | HuggingFace |
| `semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob` | misma base | no disponible | 61,16 | CC BY 4.0 (según el mismo repositorio) | HuggingFace |
| `semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3` | misma base | no disponible | 63,28 | CC BY 4.0 (según el mismo repositorio) | HuggingFace |

Frente a transformers de propósito general de tamaño comparable (por ejemplo, modelos de menos de 100 millones de parámetros entrenados sobre OpenWebText), no hay datos publicados en esta información: no se dispone de una comparación con líneas base transformer en la model card, lo que impide situar la perplejidad de 59,29 en un contexto externo.

## Limitaciones y advertencias

- Calidad de modelado muy limitada: una perplejidad de 59,29 a bloque 512 en OpenWebText está muy lejos de lo que ofrece un transformer pequeño actual; el texto generado será de baja calidad y no debe usarse en producción.
- Sin ajuste por instrucciones, sin RLHF y sin DPO: no sigue instrucciones, no mantiene formato conversacional y no tiene plantilla de chat.
- Riesgo de alucinación elevado: al ser un modelo base de baja perplejidad relativa y sin alineación, cualquier afirmación factual que genere debe tratarse como no fiable.
- Monolingüe: solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Longitud de contexto: no se declara ventana máxima; el entrenamiento se hizo con bloques de 512 tokens y no hay datos sobre degradación más allá de esa longitud.
- Métricas no verificadas: el resultado de perplejidad figura como `verified: false` y procede del propio autor; no hay replicación independiente.
- Un solo corpus y una sola semilla: todas las conclusiones del *ladder* se apoyan en OpenWebText y semilla 0, lo que limita la generalización de los hallazgos.
- Varias hipótesis preinscritas no se cumplieron (GH6, GH8, GH9 y GH2 fallaron según el autor), lo que conviene tener en cuenta al citar el experimento.
- Compatibilidad de herramientas: al ser una arquitectura no estándar y sin atención, no hay soporte declarado en vLLM, llama.cpp, Ollama, TGI ni Transformers; la integración exige código propio.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución, pero no se ofrece ninguna garantía ni exención de responsabilidad por parte del autor; el modelo no incluye filtros de seguridad ni moderación.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad; el corpus OpenWebText es texto web sin filtrar más allá del filtrado habitual de la comunidad.
- Escasez de adopción: 77 descargas y 0 *likes* en el momento de la consulta, lo que reduce la probabilidad de que existan informes de errores o implementaciones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh
- Modelo base SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Brazo FO-b: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Brazo SR3-crit: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3
- Colección de amortiguamiento dependiente de la posición (generación 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-position-dependent-damping-6ada61f0754754e2f2deae3c
- Colección del *ladder* de OpenWebText (generación 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Colección de comparación primer vs segundo orden (generación 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
