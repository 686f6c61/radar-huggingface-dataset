# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2

## Resumen

`semsimula-ladder-live-ts-d384-l2-none-norc-sr2` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de su programa "Semantic Simulation" (SemSimula). No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar y dinámica lagrangiana de segundo orden, con inferencia sin atención y con memoria constante. Este ejemplar concreto (SR2, generación 3) es la mitad de segundo orden de un par experimental entrenado sobre TinyStories para responder a una pregunta de ablación pre-registrada: si el núcleo conservativo necesita dinámica de segundo orden (velocidad e inercia) o si un modelo de primer orden entrenado igual rinde lo mismo.

El modelo tiene una dimensión oculta de 384 y 2 capas, se entrenó sobre exactamente 315.392.000 tokens de TinyStories (19.250 pasos × 32 × 512) y alcanza una perplejidad de validación asentada de 5,16 con bloque de 512. Su relevancia es metodológica más que de producto: sirve como evidencia empírica reproducible sobre el papel de la dinámica de segundo orden en arquitecturas de energía conservativa, con un protocolo de evaluación pre-registrado y un presupuesto de tokens igualado entre brazos.

El resultado declarado por el autor es que el segundo orden empata con el primer orden cuando se reinicia la velocidad al inicio de cada capa (5,16 frente a 5,13, −0,6 %) y supera al primer orden verdadero sin velocidad (5,28) en un 2,3 %. El modelo está publicado con licencia CC-BY-4.0, solo en inglés y con pesos en formato PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (scalar potential, lagrangian mechanics), no transformer, sin atención, con integrador BAOAB y dinámica de segundo orden |
| Parametros totales | no disponible (dimensión oculta 384, 2 capas; el autor no declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado con bloque de 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en PyTorch; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch`, `library_name: pytorch`); repo de 0,6 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SemSimula, que formula la generación de texto como la evolución de un sistema físico con un potencial escalar conservativo en lugar de como atención sobre tokens. La variante SR2 incorpora dinámica de segundo orden (posición y velocidad, con inercia) integrada mediante el esquema BAOAB, con gradientes calculados en vivo durante el entrenamiento y geometría riemanniana (geodésicas, métrica de Jacobi) en el espacio de estados. La inferencia es sin atención y con memoria constante respecto a la longitud de secuencia, lo que en principio desacopla el coste de memoria del contexto. Los tags del modelo mencionan también "fock space" y "parflm" como componentes del marco.

El entrenamiento se realizó sobre TinyStories con un presupuesto exacto de 315.392.000 tokens: 19.250 pasos de 32 secuencias × 512 tokens, los primeros 16.250 con el schedule WSD de la escalera y los últimos 3.000 al learning rate suelo, porque la comprobación de asentamiento falló a los 16.250 pasos y ambos brazos del par se extendieron por igual. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por instrucciones; el objetivo es modelado de lenguaje puro medido por perplejidad. La innovación destacable es el diseño experimental: pares de modelos con idéntico presupuesto de tokens y misma configuración salvo la variable ablacionada (orden de la dinámica, presencia de pozos en modo Poisson), con hipótesis pre-registrada (Δ_TS dentro de ±3 %, probabilidad declarada del 55 %, resultado HIT).

## Capacidades

- Generación de texto en inglés a nivel de modelado de lenguaje; el entrenamiento sobre TinyStories lo orienta a texto narrativo sencillo y sintaxis básica.
- Modelado de lenguaje autoregresivo con perplejidad medida sobre el split de validación de TinyStories.
- Inferencia sin atención y con memoria constante, adecuada para secuencias largas sin crecimiento del coste de memoria por token.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe no disponible: solo inglés.
- No se documentan modos especiales (thinking, visión, audio) ni ajuste por instrucciones.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de comparación reproducible para estudiar si la atención es imprescindible en modelado de lenguaje a pequeña escala, con un protocolo y un presupuesto de tokens explícitos.
- Ablaciones controladas de dinámica: al existir pares con primer orden (FO-a, FO-b) y variantes con pozos de Poisson, se puede replicar el experimento y verificar la conclusión del autor sobre el papel de la rotación de modos rígidos dentro de cada capa.
- Estudio de eficiencia de memoria en inferencia: su naturaleza sin atención y de memoria constante permite medir el coste real frente a transformers de tamaño comparable en secuencias de 512 tokens o más.
- Generación de cuentos sintéticos y datos narrativos simples: entrenado sobre TinyStories, puede producir texto narrativo de vocabulario limitado para aumentar datasets de juguete o pruebas de pipeline.
- Docencia y divulgación: es un ejemplo ejecutable de modelo de energía conservativo con integrador BAOAB, útil para explicar mecánica lagrangiana aplicada a aprendizaje automático.
- Reproducción de resultados pre-registrados: investigadores pueden reentrenar con el mismo schedule WSD y comprobar la perplejidad asentada de 5,16 y la comparación con 5,13 y 5,28.
- Prototipado de decodificación física: sirve para experimentar con muestreo basado en dinámica (integración de trayectorias) en lugar de softmax sobre logits, en entornos de investigación.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Modelo | Corpus | Tokens | Perplejidad de validación (bloque 512) |
|---|---|---:|---:|
| SR2 (este modelo, segundo orden) | TinyStories | 315M | 5,16 (asentada; mejor 5,13 en el paso 18.000) |
| FO-TS (primer orden entre capas, FO-a) | TinyStories | 315M | 5,13 |
| FO-b-TS (primer orden verdadero, sin velocidad) | TinyStories | 315M | 5,28 |
| PM2-TS (con 2 pozos en modo Poisson) | TinyStories | 315M | 4,99 |
| FO-b-PM2-TS (primer orden con 2 pozos) | TinyStories | 315M | 4,96 |
| SR2 (OpenWebText) | OpenWebText | 532,5M | 58,32 |
| FO-b-OWT (OpenWebText) | OpenWebText | 532,5M | 61,16 |
| SO-CODE (Python) | código Python | 315M | 6,00 |
| FO-b-CODE (Python) | código Python | 315M | 6,55 |

La perplejidad asentada de 5,16 es la media de las tres últimas evaluaciones cada 500 pasos (5,13, 5,16, 5,19). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo completo ocupa 0,6 GB, por lo que los pesos en precisión original caben holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no hay recomendación oficial; por tamaño, una RTX 3060, RTX 4060 o superior es suficiente para los pesos, y una GPU de datacenter (A100, H100) solo tendría sentido para reentrenamiento o barridos experimentales.
- Cabe en GPU consumer: sí, con margen amplio dado el tamaño del repo (0,6 GB).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo no transformer con `library_name: pytorch`, requiere el código de referencia del autor para cargar los pesos.
- Latencia y throughput estimados: no disponibles. La inferencia sin atención y de memoria constante puede ser favorable en memoria, pero el coste por token depende del integrador BAOAB y no se publican cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Perplejidad TinyStories | Licencia |
|---|---|---|---|---|---|
| SR2 (este modelo) | Conservativa, segundo orden, sin atención | no disponible (d384, 2 capas) | no disponible (bloque 512) | 5,16 | CC-BY-4.0 |
| FO-TS (par del autor) | Conservativa, primer orden entre capas | no disponible (d384, 2 capas) | no disponible (bloque 512) | 5,13 | CC-BY-4.0 |
| FO-b-TS (par del autor) | Conservativa, primer orden verdadero | no disponible (d384, 2 capas) | no disponible (bloque 512) | 5,28 | CC-BY-4.0 |
| Transformers pequeños tipo GPT-2 sobre TinyStories | Transformer decoder | del orden de decenas de millones | 512–1024 | no disponible en esta información | variable |

La comparación más directa y fiable es con los pares del propio autor, entrenados con idéntico presupuesto de tokens. Frente a transformers pequeños de la literatura de TinyStories no se dispone de cifras comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado; no debe usarse como asistente conversacional en producción.
- Entrenado solo con TinyStories: su vocabulario y dominio son muy limitados (narrativa infantil sintética); el rendimiento fuera de ese dominio no está caracterizado.
- Solo inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación y de generación incoherente fuera de distribución, propio de un modelo de 2 capas y 384 dimensiones entrenado con 315M tokens.
- Sesgos: no se documenta ningún análisis de sesgos; los sesgos de TinyStories y del pipeline de generación sintética pueden propagarse.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación no hay garantías de idoneidad ni soporte.
- Requiere código específico del autor para la carga e inferencia; no hay soporte estándar en runtimes de inferencia populares.
- Los resultados de perplejidad están declarados por el autor y marcados como no verificados (`verified: false`); la conclusión sobre el segundo orden es un empate estadístico dentro del margen pre-registrado (±3 %), no una ventaja clara.
- El fallo de la comprobación de asentamiento a los 16.250 pasos obligó a extender el entrenamiento; conviene tenerlo en cuenta al comparar con otros modelos de la escalera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Par de primer orden FO-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Par de primer orden verdadero FO-b-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Variante con 2 pozos PM2-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Variante OpenWebText SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Variante de código SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección first-vs-second-order: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (CfC, BAOAB, live gradients): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
