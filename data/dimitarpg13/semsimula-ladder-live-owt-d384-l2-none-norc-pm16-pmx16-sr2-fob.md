# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob` es un modelo de lenguaje experimental desarrollado por el investigador dimitarpg13 dentro de su programa "Semantic Simulation". No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar y en mecánica lagrangiana, con inferencia de memoria constante y sin mecanismo de atención. Este ejemplar concreto (FO-b-PMX-K16) entrena la variante PMX-K16 (16 pozos de modo Poisson) como un flujo de gradiente de primer orden verdadero, es decir, sin velocidad ni inercia en la dinámica.

El modelo forma parte de un estudio escalera (ladder study) pre-registrado sobre OpenWebText, con un presupuesto de entrenamiento fijo de 532,5 millones de tokens (32.500 pasos × 32 × 512). Su propósito no es competir con LLMs de producción, sino responder a una pregunta de investigación concreta: si el núcleo conservativo de Semantic Simulation necesita dinámica de segundo orden o si un modelo de primer orden entrenado igual rinde de forma equivalente. La respuesta declarada por el autor es que, con 16 pozos, el primer orden queda ligeramente por delante de su gemelo de segundo orden (53,73 frente a 54,24 de perplejidad).

Con 0,3 GB de repositorio y licencia CC-BY-4.0, es un artefacto de investigación reproducible, no un modelo listo para producto. Su relevancia actual reside en la ablación de mecanismos: aporta evidencia empírica medida por pares sobre el papel de la inercia en modelos de energía libre y sobre el efecto de los registros de modo Poisson.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no-transformer, sin atención, basado en potencial escalar anisotrópico gaussiano y mecánica lagrangiana (flujo de gradiente de primer orden) |
| Parametros totales | no disponible (dimensión de modelo d384; el repositorio ocupa 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloque de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (librería pytorch; repo de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe como un modelo de lenguaje conservativo (conservative-language-model) construido sobre un potencial escalar, con integración mediante BAOAB y formulación "fully-conservative" en geometría riemanniana (métrica de Jacobi, geodésicas riemannianas). No emplea atención ni sigue el esquema transformer; la inferencia es de memoria constante. Esta variante concreta incorpora 16 pozos de modo Poisson (Poisson-mode registers, pm16/pmx16) y se entrena como flujo de gradiente de primer orden verdadero: el muelle congelado de los pozos y los modos rígidos se relajan exactamente, sin ningún término de velocidad. La dimensión de modelo es d384 y la configuración incluye los indicadores `l2-none-norc`.

El entrenamiento usa OpenWebText (Skylion007/openwebtext) con exactamente 532.480.000 tokens (32.500 pasos × 32 × 512), el mismo presupuesto y calendario que su gemelo de segundo orden, arrancando desde el paso 0 con semilla 0. Esto permite una comparación por pares: ambos runs ven los mismos lotes de entrenamiento y evaluación, con correlación de 0,999 entre sus cambios de evaluación paso a paso. El estudio está pre-registrado (predicciones MS2a, MS2b y MS2c), con resultados declarados de MISS, MISS y HIT respectivamente. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés: el pipeline declarado es text-generation, con perplejidad de validación medida sobre OpenWebText.
- Modelado de lenguaje autoregresivo a nivel de token con contexto evaluado a bloques de 512.
- Inferencia de memoria constante: al no usar atención, el coste de memoria no crece con la longitud de secuencia según la descripción del autor.
- Capacidad de investigación reproducible: entrenamiento determinista por semilla y comparación por pares con su gemelo de segundo orden.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, matemáticas, visión, audio ni modo "thinking".
- Multilingüe: solo inglés declarado; no hay evidencia de capacidades en otros idiomas.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para estudiar si la dinámica de segundo orden aporta ventaja frente al flujo de gradiente de primer orden en modelos conservativos. Su gemelo SR2 permite una ablación por pares con idéntico presupuesto de tokens.
- Estudio de mecanismos de energía libre: los 16 pozos de modo Poisson permiten analizar cómo los registros de modo afectan a la perplejidad y a la estabilidad del entrenamiento en corpus de texto real (OpenWebText).
- Reproducción de experimentos pre-registrados: el modelo materializa una predicción concreta (MS2a/MS2b/MS2c) y permite verificar los resultados declarados con el mismo calendario y semilla.
- Benchmarking de eficiencia de memoria: al ser attention-free y de memoria constante en inferencia, es útil para medir el coste de despliegue en secuencias largas frente a arquitecturas con atención.
- Docencia y divulgación: ejemplo práctico de modelado de lenguaje basado en física (potencial escalar, lagrangiano, integrador BAOAB) para cursos de métodos numéricos aplicados a ML.
- Base para experimentos de escalado de la escalera: punto de partida para replicar la comparación en otros corpus (TinyStories, código Python) o con distinto número de pozos (2, 16, 64), siguiendo la metodología del autor.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Corpus, tokens | Perplejidad de validación (bloque 512) |
|---|---|---|
| FO-b-PMX-K16 (este modelo) | OpenWebText, 532,5M | 53,73 (asentado; media de las tres últimas evaluaciones: 53,77 / 53,81 / 53,61) |
| PMX-K16 (segundo orden, gemelo) | OpenWebText, 532,5M | 54,24 |
| FO-b-OWT (primer orden, sin pozos) | OpenWebText, 532,5M | 61,16 |
| SR2 (segundo orden, sin pozos) | OpenWebText, 532,5M | 58,32 |
| FO-b-PMX (primer orden, 64 pozos) | OpenWebText, 532,5M | 54,02 |
| PMX (segundo orden, 64 pozos) | OpenWebText, 532,5M | 54,63 |
| FO-b-PM2-PMX16 (primer orden, 2 pozos) | OpenWebText, 532,5M | 53,81 |
| PM2-PMX16 (segundo orden, 2 pozos) | OpenWebText, 532,5M | 54,71 |

Mejor perplejidad observada durante el entrenamiento de este modelo: 51,82 en el paso 31.000. Diferencia pareada frente a su gemelo de segundo orden: −0,9% (por paso, −0,87%, dispersión 0,14%). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,3 GB, por lo que los pesos en precisión original caben holgadamente en cualquier GPU consumer moderna (8 GB o más).
- GPU recomendadas: no especificadas por el autor. Por tamaño de repositorio, una RTX 3060/4060 o superior sería suficiente para cargar los pesos; no hay datos de rendimiento en A100/H100.
- Cabe en GPU consumer: sí, según el tamaño del repositorio (0,3 GB); no se detalla el consumo real en runtime.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería declarada es PyTorch, por lo que el despliegue requeriría código propio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FO-b-PMX-K16 (este) | Conservativa, primer orden, 16 pozos | no disponible | 53,73 | CC-BY-4.0 | Hugging Face |
| PMX-K16 (gemelo) | Conservativa, segundo orden, 16 pozos | no disponible | 54,24 | CC-BY-4.0 | Hugging Face |
| FO-b-PMX (64 pozos) | Conservativa, primer orden, 64 pozos | no disponible | 54,02 | CC-BY-4.0 | Hugging Face |
| FO-b-OWT | Conservativa, primer orden, sin pozos | no disponible | 61,16 | CC-BY-4.0 | Hugging Face |

No se dispone de comparación con transformers convencionales de tamaño equivalente (por ejemplo, GPT-2 small) en la información proporcionada; los únicos datos comparables son los de la propia escalera del autor.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está pensado para uso en producción ni para tareas de usuario final.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Perplejidad elevada (53,73 en OpenWebText) en comparación con modelos de lenguaje convencionales del mismo orden de magnitud; la calidad de generación no está evaluada con métricas humanas.
- Riesgo alto de alucinación y de texto incoherente: no se documentan fases de alineación (RLHF/DPO) ni evaluaciones de seguridad.
- Sesgos: no evaluados; el corpus OpenWebText hereda los sesgos de los enlaces de Reddit de los que se extrajo.
- Longitud de contexto no especificada; las evaluaciones se hacen a bloques de 512 tokens, por lo que no hay garantías más allá de esa longitud.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías, su uso en producción es desaconsejable.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse como evidencia preliminar.
- No hay soporte documentado de tool calling, agentes ni integración con frameworks de despliegue estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Gemelo de segundo orden (PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Colección "First vs second order" (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección "Gen 3" (escalera OpenWebText): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
