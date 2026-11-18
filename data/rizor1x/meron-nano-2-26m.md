# Rizor1x/Meron-Nano-2.26M

## Resumen

Meron Nano 2.26M es un modelo de lenguaje base de tipo *small language model* (SLM) desarrollado por el usuario Rizor1x y publicado en Hugging Face bajo licencia Apache 2.0. Con 2.263.298 parámetros totales y 910.178 parámetros activos por token, emplea una topología de mezcla de expertos (MoE) con enrutamiento dinámico desacoplado y bucles de deliberación recurrentes con compartición de parámetros. El modelo está orientado a tareas de razonamiento matemático, científico y sentido común físico, y se posiciona como una alternativa ultraligera para entornos *edge*.

La relevancia del modelo radica en su eficiencia paramétrica: con menos de un millón de parámetros activos, el autor reporta un Intelligence Index de 15,45 (hasta 16,48 en evaluaciones desacopladas) en el conjunto de evaluación de Open SLM Leaderboard para modelos por debajo de 10M de parámetros, superando a modelos densos de hasta 10M. El modelo se entrenó sobre 1.355 millones de tokens distribuidos en tres etapas curriculares.

Se trata de un modelo base (no instruido) con soporte exclusivo de inglés, publicado en formato safetensors y sin datos de descargas ni valoraciones en el momento de la consulta. Su tamaño reducido lo hace apto para despliegue en dispositivos con recursos muy limitados, aunque su ventana de contexto no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) dinámico con enrutamiento desacoplado y bucles de deliberación recurrentes |
| Parametros totales | 2.263.298 (2,26M) |
| Parametros activos | 910.178 (0,91M) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) de enrutamiento dinámico desacoplado, complementada con bucles de deliberación recurrentes que comparten parámetros entre iteraciones. Esta combinación busca maximizar la eficiencia paramétrica: solo 910.178 parámetros se activan por token de los 2.263.298 totales, lo que reduce el coste computacional de inferencia en comparación con un modelo denso del mismo tamaño total.

El entrenamiento se estructuró en tres etapas curriculares sobre un total de 1.355 millones de tokens. La etapa 1 (preentrenamiento, 1.000M de tokens, 73,80% del cómputo) combinó Nemotron-ClimbMix y Cosmopedia v2 (500M, fundamentos de lenguaje y libros de texto), FactBase-DCLM (300M, conocimiento factual y texto web limpio) y Python canónico y primitivas lógicas (200M, sintaxis algorítmica). La etapa 2 (especialización, 320M de tokens, 23,62%) se centró en libros de texto científicos (200M) y razonamiento matemático con cadenas de *chain-of-thought* paso a paso (120M). La etapa 3 (postentrenamiento, 35M de tokens, 2,58%) incluyó QA procedimental físico tipo PIQA (20M) y alineamiento de decisión contrastivo (15M). El optimizador indicado es una combinación híbrida de Muon y otro componente cuyo nombre queda truncado en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base (no instruido).
- Razonamiento aritmético multi-dígito con cadenas de acarreo, evaluado en ArithMark-3.0 con un 59,30% de precisión.
- Razonamiento científico básico (física, química, biología, astronomía) adquirido en la etapa de especialización.
- Sentido común físico y razonamiento procedimental, evaluado en PIQA (58,49%).
- Razonamiento de sentido común general evaluado en ARC-Challenge (29,77%), ARC-Easy (27,54%) y HellaSwag (28,60%).
- Capacidad de *chain-of-thought* paso a paso para aritmética, según la etapa 2 del entrenamiento.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad explícita más allá del CoT aritmético.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Evaluación de técnicas de eficiencia paramétrica en investigación: el modelo sirve como banco de pruebas para estudiar enrutamiento MoE dinámico y bucles recurrentes con muy pocos parámetros, permitiendo experimentos de ablación en hardware de consumo.
- Clasificación y respuesta a preguntas de opción múltiple sobre sentido común físico: su rendimiento en PIQA (58,49%) lo hace utilizable en pipelines de evaluación de razonamiento físico en entornos educativos o de investigación.
- Generación de cadenas de razonamiento aritmético para validación de datasets: puede emplearse como generador de soluciones paso a paso en la construcción de corpus sintéticos de matemáticas elementales, dado su entrenamiento específico en 45 arquetipos aritméticos.
- Prototipado de asistentes de texto en dispositivos *edge*: con 0,91M de parámetros activos, es viable su despliegue en microcontroladores o SBCs para generación de texto básica en inglés donde el consumo energético sea crítico.
- Filtrado y puntuación de texto en pipelines de datos: como modelo base, puede adaptarse mediante *fine-tuning* ligero para tareas de clasificación o puntuación de log-verosimilitud en corpus en inglés.
- Investigación sobre calibración de *logits* y alineamiento contrastivo: la etapa 3 incluye optimización de preferencias contrastiva y calibración de *logits*, lo que permite estudiar estos métodos en modelos de muy baja escala.
- Benchmarking de infraestructura de inferencia: útil para medir latencia y throughput en frameworks como llama.cpp u Ollama con modelos de tamaño mínimo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados zero-shot con precisión normalizada por longitud (`acc_norm`) reportados por el autor, comparados con modelos de la división sub-10M:

| Benchmark / Metrica | Meron Nano MoE | Ethoric-10M | min-spark-1.7 | TinyBrainBot-3M-v2 | GPT-S3-3M | Tokle-3M |
|---|---|---|---|---|---|---|
| Parametros activos | 0,91M | 9,97M | 9,98M | 2,94M | 2,97M | 2,91M |
| Parametros totales | 2,26M | 9,97M | 9,98M | 2,94M | 2,97M | 2,91M |
| Arquitectura | MoE dinámico | Dense + Canon Conv | Recurrente con bucles | Transformer denso | Transformer denso | Transformer denso |
| ArithMark-3.0 | 59,30% (pico 59,60%) | 41,60% | 36,60% | 45,10% | 39,10% | 40,80% |
| PIQA | 58,49% (pico 60,07%) | 59,85% | 60,39% | 56,75% | 57,02% | 55,01% |
| ARC-Challenge | 29,77% | 24,66% | 24,15% | 22,53% | 23,12% | 23,98% |
| ARC-Easy | 27,54% (pico 28,07%) | 37,58% | 39,90% | 33,38% | 33,54% | 34,00% |
| ARC combinado | 28,66% (pico 28,92%) | 31,12% | 32,03% | 27,96% | 28,33% | 28,99% |
| HellaSwag | 28,60% | 28,75% | 29,65% | 27,29% | 27,68% | 27,20% |
| Open SLM Intelligence Index | 15,45 (pico 16,48) | 12,94 | 12,71 | 10,39 | 9,61 | 8,91 |

El índice se calcula normalizando por azar las cuatro tareas principales con pesos oficiales del Open SLM Leaderboard, aplicando un factor de 0,65 a ArithMark-3.0. El autor reporta decontaminación estricta por coincidencia exacta de 13-gramas contra todos los splits de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,26M de parámetros totales, los pesos en fp32 ocupan aproximadamente 9 MB, en fp16 unos 4,5 MB y en int8 unos 2,3 MB, por lo que cabe en cualquier GPU consumer y en la mayoría de CPUs.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, GTX 1650 e incluso en iGPU.
- Cabe en GPU consumer: sí, en todas las gamas, incluidas tarjetas de gama baja y sistemas embebidos.
- Opciones de despliegue: no se especifican en la información disponible; al publicarse en safetensors, es compatible con frameworks estándar de Hugging Face (transformers), y potencialmente con llama.cpp u Ollama si se genera una conversión GGUF, aunque no se confirma.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Intelligence Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Meron Nano MoE 2.26M | 2,26M | 0,91M | no disponible | 15,45 | Apache 2.0 | Hugging Face |
| Ethoric-10M | 9,97M | 9,97M (denso) | no disponible | 12,94 | no disponible | no disponible |
| min-spark-1.7 | 9,98M | 9,98M (recurrente) | no disponible | 12,71 | no disponible | no disponible |
| TinyBrainBot-3M-v2 | 2,94M | 2,94M (denso) | no disponible | 10,39 | no disponible | no disponible |

Meron Nano destaca por su índice superior con el menor número de parámetros activos de la comparativa, aunque pierde frente a los modelos de ~10M en ARC-Easy y PIQA. La licencia Apache 2.0 es la única confirmada en la tabla.

## Limitaciones y advertencias

- Modelo base no instruido: no sigue instrucciones ni mantiene diálogos sin *fine-tuning* adicional.
- Solo inglés: no hay soporte multilingüe declarado.
- Ventana de contexto no especificada: no se puede garantizar el manejo de secuencias largas.
- Riesgo elevado de alucinación y texto incoherente por su escala (2,26M de parámetros totales); los benchmarks muestran rendimiento cercano al azar en varias tareas (HellaSwag 28,60% frente a 25% de azar).
- Rendimiento débil en ARC-Easy (27,54%) y HellaSwag (28,60%), por debajo o cerca de modelos densos de 3M.
- Sin datos de sesgos publicados; el entrenamiento con corpus web (FactBase-DCLM) puede introducir sesgos no documentados.
- No hay información sobre cuantizaciones soportadas ni sobre herramientas de despliegue probadas.
- Repositorio sin descargas ni valoraciones: no hay validación independiente de los resultados reportados por el autor.
- El nombre del segundo componente del optimizador híbrido (Muon + ...) está truncado en la información disponible, lo que impide reproducir el entrenamiento con exactitud.

## Enlaces

- Hugging Face: https://huggingface.co/Rizor1x/Meron-Nano-2.26M
- Model card: incluida en la página de Hugging Face del modelo
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
