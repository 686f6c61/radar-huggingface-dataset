# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2

## Resumen

semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2 es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro de la familia "Semantic Simulation" (semsimula), un programa que explora modelos de lenguaje no-transformer y sin atención basados en mecánica lagrangiana y potenciales escalares conservativos. Este modelo concreto pertenece a la generación 3 del "ladder study" (estudio escalonado) y evalúa una ablación de mecanismo: el uso de 2 "pozos de modo Poisson" (Poisson-mode wells) en lugar de 64, con dinámica de segundo orden (integración de velocidad e inercia entre capas). Su propósito no es competir con LLMs de producción, sino responder a una pregunta de investigación pre-registrada: si el núcleo conservativo necesita dinámica de segundo orden o si un modelo de primer orden entrenado igual rinde de forma equivalente.

El modelo tiene una dimensión oculta de 384 (d384), 2 capas (l2), se entrena sobre OpenWebText con un presupuesto exacto de 532,48 millones de tokens (32.500 pasos × 32 × 512) y reporta una perplejidad de validación de 54,71 en bloques de 512 tokens. Es relevante ahora porque forma parte de una comparativa emparejada por paso (paired by step) con su gemelo de primer orden, FO-b-PM2-PMX16, que obtiene 53,81 (−1,6 %, −1,63 % emparejado), lo que sugiere que la dinámica de segundo orden no aporta ventaja en esta configuración concreta.

El modelo es de tipo energy-based, con inferencia de memoria constante y probabilidad de generación de texto en inglés. No es un modelo para uso en producción ni para tareas generales: es un artefacto científico reproducible con licencia CC-BY-4.0, pensado para investigadores que estudian arquitecturas alternativas al transformer y mecanismos de atención.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención; modelo de lenguaje conservativo basado en potencial escalar lagrangiano (Semantic Simulation), con dinámica de segundo orden (integración BAOAB, potencial gaussiano anisotrópico, pozos de modo Poisson) |
| Parámetros totales | no disponible (dimensión oculta d384, 2 capas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluación a bloques de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); tamaño del repo 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer: es un modelo "conservativo" de simulación semántica en el que la dinámica de capas se rige por un potencial escalar V_θ y mecánica lagrangiana. En esta variante de segundo orden, los pozos de modo Poisson y los modos rígidos de V_θ se integran exactamente como un resorte amortiguado, y la velocidad se transmite de capa en capa. Emplea el integrador BAOAB (variante de dinámica molecular) y un potencial gaussiano anisotrópico, con geometría riemanniana y geodésicas de Jacobi como marco. La inferencia es de memoria constante y sin atención (attention-free). Los tags indican "Fock space", "parflm" y "Poisson-mode registers" como componentes del diseño.

El entrenamiento usa exactamente 532.480.000 tokens de OpenWebText (32.500 pasos × 32 × 512), con el mismo presupuesto y calendario que el resto del ladder Gen 3, semilla 0 desde el paso 0, de forma que los pares ven los mismos lotes de entrenamiento y evaluación y sus diferencias se miden emparejadas (correlación de los cambios de evaluación paso a paso de 0,999). El estudio es pre-registrado: la hipótesis MS2b (SR2 58,32 > PM2-PMX16 > PMX-K16 54,24) se declaró con un 65 % de confianza y resultó acertada con 54,71. No se menciona RLHF ni DPO; es entrenamiento de lenguaje autorregresivo puro sobre el corpus.

## Capacidades

- Generación de texto autorregresiva en inglés, entrenada sobre OpenWebText.
- Modelo de lenguaje de investigación con probabilidad de secuencia derivada de un potencial escalar conservativo.
- Inferencia de memoria constante (constant-memory inference), sin mecanismo de atención.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) documentadas.
- Sin modo "thinking" ni capacidades especiales más allá de la generación de texto.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de comparación reproducible para estudiar si la dinámica de segundo orden aporta ventaja frente a la de primer orden, con pares emparejados por paso y presupuesto de tokens idéntico.
- Ablación de mecanismos de pozos de modo Poisson: permite medir el efecto de reducir de 64 a 2 pozos (54,63 frente a 54,71 de perplejidad) manteniendo el resto del diseño, útil para estudiar la contribución marginal de componentes.
- Reproducción de estudios pre-registrados: el artefacto incluye la hipótesis declarada (MS2b) y su resultado, lo que facilita la verificación y replicación por terceros.
- Estudio de integradores de dinámica molecular en modelos de lenguaje: el uso de BAOAB y potenciales gaussianos anisotrópicos permite investigar la estabilidad numérica de la integración de segundo orden en capas profundas.
- Evaluación de modelos energy-based para generación de texto: la perplejidad en OpenWebText (54,71) sirve como referencia para comparar con otros modelos conservativos de la misma familia.
- Docencia y divulgación sobre modelos no-transformer: al ser pequeño (0,3 GB) y de licencia abierta, puede usarse en entornos académicos para ilustrar mecánica lagrangiana aplicada al modelado del lenguaje.
- Línea base en estudios de eficiencia: la memoria constante en inferencia lo hace útil para comparar costes de memoria frente a modelos con atención de contexto creciente.

## Benchmarks y rendimiento

| Modelo | Corpus, tokens | Orden | Perplejidad (bloque 512) | Primer orden frente a segundo |
|---|---|---|---|---|
| SR2 (sin pozos) | OpenWebText, 532,5M | Segundo | 58,32 | +4,9 % (FO-b-OWT 61,16) |
| PMX-K16 (16 pozos) | OpenWebText, 532,5M | Segundo | 54,24 | −0,9 % (FO-b-PMX-K16 53,73) |
| **PM2-PMX16 (2 pozos, este modelo)** | OpenWebText, 532,5M | Segundo | **54,71** | −1,6 % (FO-b-PM2-PMX16 53,81) |
| PMX (64 pozos) | OpenWebText, 532,5M | Segundo | 54,63 | −1,1 % (FO-b-PMX 54,02) |
| SO-TS | TinyStories, 315M | Segundo | 5,16 | +2,3 % (FO-b-TS 5,28) |
| PM2-TS | TinyStories, 315M | Segundo | 4,99 | −0,5 % (FO-b-PM2-TS 4,96) |
| SO-CODE | Python, 315M | Segundo | 6,00 | +9,2 % (FO-b-CODE 6,55) |
| PM2-CODE | Python, 315M | Segundo | 5,71 | −1,6 % (FO-b-PM2-CODE 5,62) |

Datos declarados por el autor (no verificados). Para este modelo: perplejidad asentada de 54,71 (media de las tres últimas evaluaciones de 500 pasos: 54,64, 54,87, 54,61); mejor valor 52,77 en el paso 31.000. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repo de 0,3 GB y dimensión oculta 384 con 2 capas, la huella en FP32 es del orden de cientos de MB, pero no se publican cifras oficiales.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder alojarlo, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? Muy probablemente sí, dado el tamaño del repositorio (0,3 GB), aunque no se documenta.
- Opciones de despliegue: no se documentan; la librería es PyTorch, sin menciones a vLLM, llama.cpp, Ollama o TGI, que además no soportan esta arquitectura no-transformer.
- Latencia y throughput: no disponibles. La inferencia es de memoria constante, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PM2-PMX16 (este modelo) | d384, 2 capas (total no disponible) | no disponible | 54,71 | CC-BY-4.0 | Hugging Face |
| FO-b-PM2-PMX16 (gemelo primer orden) | misma configuración | no disponible | 53,81 | CC-BY-4.0 | Hugging Face |
| PMX-K16 (16 pozos) | misma configuración | no disponible | 54,24 | CC-BY-4.0 | Hugging Face |
| PMX (64 pozos) | misma configuración | no disponible | 54,63 | CC-BY-4.0 | Hugging Face |
| SR2 (sin pozos) | misma configuración | no disponible | 58,32 | CC-BY-4.0 | Hugging Face |

La comparación natural es con los pares de la misma familia semsimula, ya que no hay modelos de propósito general comparables en tamaño y arquitectura. Frente a transformers pequeños de tamaño similar no se aportan datos de perplejidad comparables en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de usuario final.
- Perplejidad alta (54,71 en OpenWebText) en comparación con modelos de lenguaje modernos; la calidad de generación será limitada.
- Solo inglés declarado; sin capacidades multilingües.
- Riesgo de alucinación y de texto incoherente no evaluado; no hay datos de seguridad ni de alineación.
- Sesgos: al entrenarse sobre OpenWebText, hereda los sesgos del corpus web, sin filtrado ni mitigación documentados.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no es adecuado para ello por su calidad y naturaleza experimental.
- Sin soporte documentado de tool calling, agentes ni contexto largo; la longitud de contexto no se especifica.
- La arquitectura no-transformer no es compatible con los stacks de despliegue habituales (vLLM, TGI, llama.cpp), lo que complica su integración.
- Los resultados de benchmarks son declarados por el autor y no están verificados (verified: false).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Gemelo de primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Modelo PMX con 64 pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Modelo PMX-K16 con 16 pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Modelo SR2 sin pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Colección primer vs segundo orden (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (CFC, BAOAB, live gradients): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
