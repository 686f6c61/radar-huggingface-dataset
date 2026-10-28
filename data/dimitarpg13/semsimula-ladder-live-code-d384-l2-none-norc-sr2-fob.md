# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob

## Resumen

`semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob` es un modelo de lenguaje de investigación publicado por el usuario `dimitarpg13` dentro de la familia Semantic Simulation (generación 3), una línea de modelos de lenguaje "conservativos" que sustituyen la atención por dinámica física: un potencial escalar, geometría riemanniana (métrica de Jacobi) y un integrador BAOAB sobre un espacio de Fock. Este ejemplar concreto es el brazo de **primer orden** (FO-b) del par entrenado sobre código Python, es decir, la variante en la que los modos rígidos se relajan exactamente y no existe variable de velocidad ni inercia.

El modelo resuelve una pregunta experimental acotada: si el núcleo conservativo de Semantic Simulation necesita dinámica de segundo orden o si un flujo de gradiente de primer orden, entrenado con los mismos datos y el mismo calendario, rinde igual. La respuesta sobre código es negativa: el primer orden se queda un 9,2% por detrás de su gemelo de segundo orden (perplejidad 6,55 frente a 6,00) y un 32,0% por detrás de un GPT-2 emparejado (d=384, L=8), que baja a 4,96 con los mismos tokens.

Es relevante ahora porque forma parte de un estudio pre-registrado, con presupuesto de tokens igualado (315.392.000 tokens) y evaluaciones emparejadas paso a paso, que documenta de forma explícita dónde se pierde el rendimiento: en los identificadores recordados desde lejos. No es un modelo para producción, sino un artefacto de ablación con pesos PyTorch, licencia CC BY 4.0 y cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer y sin atención (attention-free); modelo de lenguaje conservativo con potencial escalar gaussiano anisotrópico, dinámica de primer orden (flujo de gradiente), espacio de Fock / PARFLM, integrador BAOAB, geometría riemanniana con métrica de Jacobi |
| Parametros totales | No disponible (el identificador indica dimensión de modelo d=384; el recuento de parámetros no se publica) |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible; entrenado con bloques de 512 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos PyTorch; no se documentan GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (library_name: pytorch); repositorio de 0,3 GB; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente no convencional: no hay transformer ni mecanismo de atención. El modelo se formula como un sistema conservativo con un potencial escalar (gaussiano anisotrópico) sobre el que se integra un flujo, en este caso de **primer orden** (etiqueta FO-b, "true first-order gradient flow"), con los modos rígidos relajados de forma exacta y sin variable de velocidad. El integrador es BAOAB y la geometría subyacente es riemanniana, con métrica de Jacobi y geodésicas; el espacio de estados se describe como espacio de Fock (PARFLM). Una consecuencia práctica de este diseño es la inferencia con memoria constante, sin la curva cuadrática en longitud de secuencia típica de la atención.

El entrenamiento usa exactamente **315.392.000 tokens** (19.250 pasos × batch 32 × bloque 512) en una sola sesión de 5,65 horas, sobre Python de CodeParrot con cada nivel de indentación de cuatro espacios convertido en un tabulador. El calendario es WSD sobre 16.250 pasos y después 3.000 pasos al learning rate suelo, con la curva de learning rate de TinyStories. Ambos gemelos del par arrancan en el paso 0, semilla 0 y los mismos batches, lo que permite comparación emparejada. No se documenta RLHF, DPO ni ajuste por instrucciones. El autor reporta salud de ejecución: 0 activaciones del watchdog, norma de gradiente con mediana 0,67 y máximo 1,83 (en warmup), monitor de fuga SCAF limpio en las 4 auditorías y sonda de fuga entrenada limpia en el paso 10.000.

## Capacidades

- Generación de texto autoregresiva restringida en la práctica a código Python (predicción del siguiente token sobre CodeParrot clean).
- Modelado de dependencias léxicas: el propio estudio mide que el modelo localiza los identificadores previos igual de bien que su gemelo de segundo orden, pero hace menos con ellos; el déficit crece con la distancia a la aparición anterior.
- Inferencia con memoria constante gracias al diseño sin atención (según los tags del autor: `attention-free`, `constant-memory-inference`).
- Capacidad multilingüe: no disponible; solo inglés (`en`), con código fuente Python como dominio.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Modo "thinking", visión o audio: no disponible.
- No hay ajuste por instrucciones ni diálogo: es un modelo base de investigación, no un asistente.

## Casos de uso

- **Replicación de la ablación primero vs segundo orden:** cargar este checkpoint y su gemelo SO-CODE con los mismos batches y semilla para reproducir la diferencia de perplejidad (+9,2%) sobre Python. Es el uso previsto por el autor y el único con validación empírica publicada.
- **Línea base no transformer en evaluación de modelos de código:** usar la perplejidad a bloque 512 sobre los primeros 2M tokens de validación de CodeParrot como referencia para comparar futuras arquitecturas sin atención en el mismo corpus y calendario.
- **Estudio de modelos de lenguaje basados en energía:** servir como implementación de referencia de un LM conservativo (potencial escalar + BAOAB + métrica de Jacobi) para experimentos académicos sobre dinámica de gradiente en lugar de atención.
- **Investigación sobre memoria de largo alcance en identificadores:** analizar cómo decae la contribución de un identificador en función de su distancia, dado que el autor localiza ahí la totalidad del déficit frente al gemelo de segundo orden.
- **Prototipado de inferencia con memoria constante:** probar decodificación en entornos con VRAM muy limitada (los pesos ocupan 0,3 GB) donde la huella de memoria no deba crecer con la longitud de la secuencia.
- **Docencia y divulgación técnica:** ilustrar en un curso o artículo las diferencias entre flujos de primer y segundo orden en modelos generativos, con métricas publicadas y predicciones pre-registradas verificables.
- **Ablación de mecanismos (mechanism-ablation):** el mismo autor mantiene pares equivalentes en OpenWebText y TinyStories, de modo que este checkpoint sirve para estudiar la interacción entre corpus y orden de la dinámica.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| Perplejidad de validación, bloque 512, estabilizada (media de las tres últimas evaluaciones cada 500 pasos: pasos 18.000, 18.500 y 19.000) | CodeParrot clean (Python), split validation, primeros 2M tokens | 6,5487 |
| Mejor perplejidad registrada (paso 18.000) | Mismo conjunto | 6,43 |
| Evaluaciones individuales (pasos 18.000 / 18.500 / 19.000) | Mismo conjunto | 6,43 / 6,57 / 6,65 |

Comparación entre pares del estudio (mismo presupuesto de tokens, misma semilla):

| Par | Corpus y tokens | Segundo orden | Primer orden | Primer orden frente a segundo |
|---|---|---:|---:|---:|
| OpenWebText, sin wells | 532,5M | SR2: 58,32 | FO-b-OWT: 61,16 | +4,9% |
| TinyStories, FO-b, sin wells | 315M | SO-TS: 5,16 | FO-b-TS: 5,28 | +2,3% |
| Python, FO-b, sin wells | 315M | SO-CODE: 6,00 | FO-b-CODE: 6,55 | +9,2% |
| Referencia transformer emparejada (GPT-2 d=384, L=8) | Mismos tokens de Python y mismo calendario | 4,96 | — | Este modelo queda +32,0% por detrás (su gemelo, +20,9%) |

Evolución del par a lo largo del entrenamiento:

| Paso | Fase | SO-CODE (segundo orden) | FO-b-CODE (primer orden) | Primer orden frente a segundo |
|---:|---|---:|---:|---:|
| 500 | warmup | 44,02 | 41,91 | −4,8% |
| 2.000 | estable | 17,67 | 16,60 | −6,1% |
| 5.000 | estable | 9,27 | 9,26 | −0,1% |
| 10.500 | estable, fin | 7,02 | 7,77 | +10,7% |
| 13.000 | decay | 6,38 | 7,06 | +10,7% |
| 16.000 | decay, fin | 6,12 | 6,70 | +9,5% |
| 17.000 | floor | 6,07 | 6,62 | +9,1% |
| 18.000 | floor, mejor | 5,87 | 6,43 | +9,5% |

Otras métricas reportadas: diferencia emparejada por paso de +9,1% a +9,5% en las siete últimas evaluaciones (pasos 16.000–19.000, correlación entre brazos de 0,996); el modelo es peor en el 98% de 512 ventanas de validación. Predicciones pre-registradas CODE1 (+9,2%) y CODE2 (mayor que el +4,9% de OpenWebText): ambas acertadas. No hay resultados de HumanEval, MBPP, MMLU ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del repositorio ocupan 0,3 GB, de modo que el modelo cabe holgadamente en 1–2 GB de VRAM contando activaciones y buffers del integrador (estimación a partir del tamaño del repositorio, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna sirve (GTX 1060 6 GB, RTX 3060, RTX 4090); también es viable en CPU por el reducido tamaño. Para entrenamiento, el autor no indica la GPU utilizada (19.250 pasos en 5,65 h).
- Cabe en GPU consumer: sí, sin cuantización, dado el tamaño de 0,3 GB.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura no transformer con código propio, el despliegue requiere cargar los pesos con PyTorch y el código del autor. No hay cuantizaciones publicadas.
- Latencia y throughput: no disponible. La única cifra de rendimiento publicada es de entrenamiento (19.250 pasos, 315,4M tokens, 5,65 h en una sesión).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad en CodeParrot val. (bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FO-b-CODE (este modelo) | No disponible (d=384) | No disponible (entrenado a 512) | 6,55 (mejor 6,43) | CC BY 4.0 | HuggingFace |
| SO-CODE, gemelo de segundo orden | No disponible (d=384) | No disponible (entrenado a 512) | 6,00 | No disponible en la información | HuggingFace |
| GPT-2 emparejado (d=384, L=8) | No disponible en la información | No disponible | 4,96 | No disponible | No publicado aún en el Hub, según el autor |
| FO-b-OWT (misma arquitectura, otro corpus) | No disponible (d=384) | No disponible | No comparable (OpenWebText: 61,16) | No disponible | HuggingFace |
| FO-b-TS (misma arquitectura, otro corpus) | No disponible (d=384) | No disponible | No comparable (TinyStories: 5,28) | No disponible | HuggingFace |

## Limitaciones y advertencias

- Calidad de modelado inferior a sus referencias directas: 6,55 de perplejidad frente a 6,00 del gemelo de segundo orden y 4,96 de un GPT-2 emparejado con los mismos tokens. Un +32,0% de perplejidad respecto al transformer es una brecha grande para cualquier uso generativo.
- El déficit se concentra en los identificadores recordados desde lejos: el modelo encuentra las apariciones previas igual de bien que su gemelo, pero las aprovecha peor. Es una limitación estructural del flujo de primer orden, no un problema de ajuste.
- Solo inglés y solo Python: no hay evidencia de comportamiento en otros idiomas ni en otros lenguajes de programación.
- Contexto efectivo corto: entrenado con bloques de 512 tokens; no se documenta ventana desplegable ni evaluación más allá de ese bloque.
- Sin ajuste por instrucciones, sin RLHF/DPO y sin herramientas: no es utilizable como asistente conversacional ni para tool calling.
- Riesgo de alucinación y de código sintácticamente plausible pero incorrecto: no hay ninguna evaluación funcional (pass@k, HumanEval, MBPP) que lo desmienta.
- Métricas no verificadas: la perplejidad del model-index está marcada como `verified: false` y procede del propio autor.
- Sesgos heredados de CodeParrot: código extraído de GitHub, con los sesgos de estilo, idioma y licencias del corpus original. El autor reporta sondas de fuga limpias (SCAF en 4 auditorías y sonda entrenada en el paso 10.000), pero no es una auditoría de memorización exhaustiva.
- Advertencia sobre el criterio de "settled": según el autor, ambos brazos incumplen por la letra la comprobación de estabilización (−0,020 y −0,023 nats en los últimos 3.000 pasos, con dispersión residual de 0,015), aunque caen juntos y la brecha emparejada solo se mueve 0,003 nats.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el modelo se publica como artefacto de investigación, sin garantías ni soporte.
- Despliegue no estándar: sin cuantizaciones, sin safetensors y sin soporte en runtimes habituales, lo que añade coste de ingeniería a cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Gemelo de segundo orden (SO-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Par equivalente en OpenWebText: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Par equivalente en TinyStories: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Colección "first vs second order" (generación 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
- Paper, blog o repositorio adicional: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a dominios sin relación).
