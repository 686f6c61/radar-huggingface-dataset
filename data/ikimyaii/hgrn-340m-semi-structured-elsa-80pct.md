# ikimyaii/HGRN-340M-semi-structured-ELSA-80pct

## Resumen

HGRN-340M-semi-structured-ELSA-80pct es un modelo de lenguaje de 341 millones de parámetros obtenido mediante poda semi-estructurada al 80% de dispersión sobre el checkpoint m-a-p/340M-20B-HGRN-pure-baseline. Lo publica el usuario ikimyaii como línea base de una familia de modelos podados con ELSA, el método descrito en el paper arXiv:2510.01650. La relevancia es fundamentalmente metodológica: demuestra que es posible aplicar una proyección por filas (row-wise) en la poda ADMM de ELSA para obtener capas lineales con un número constante de pesos no nulos por fila, lo que garantiza equilibrio de trabajo por fila en hardware que explota dispersión semi-estructurada.

El modelo no es un asistente conversacional ni un modelo afinado para instrucciones: es un artefacto de investigación pensado para medir el coste en calidad de la poda agresiva. Conserva la arquitectura HGRN (Hierarchically Gated Recurrent Neural Network) del checkpoint base, un modelo recurrente con compuertas y atención lineal que se entrenó sobre 20.000 millones de tokens. La poda afecta a todas las capas lineales dentro de los bloques; los embeddings y la lm_head permanecen densos.

La ventana de contexto efectiva, los idiomas y la licencia no están documentados en la información disponible. El repositorio ocupa 1,4 GB y contiene pesos en safetensors, lo que permite cargarlo con `AutoModelForCausalLM.from_pretrained` siempre que esté instalada la librería `flash-linear-attention` (`import fla`). Su interés práctico es acotado: sirve para reproducir y comparar experimentos de poda, no para despliegues de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (red recurrente con compuertas jerárquicas), transformer recurrente con capas lineales podadas |
| Parámetros totales | 341.148.672 |
| Parámetros activos | No aplica (modelo denso podado, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se documenta bf16 en entrenamiento y fp16 en evaluación) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (1,4 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint base m-a-p/340M-20B-HGRN-pure-baseline, entrenado con 20.000 millones de tokens según el nombre del checkpoint. HGRN sustituye la atención estándar por una recurrencia con compuertas jerárquicas que ofrece coste lineal en la longitud de secuencia, lo que la hace atractiva para contextos largos y para despliegues con memoria acotada. Sobre esa arquitectura, el autor aplica una poda semi-estructurada al 80% de dispersión: cada fila de cada capa lineal podada conserva exactamente el 20% de pesos con mayor magnitud, de modo que todas las filas tienen el mismo número de no ceros. La comprobación sobre los pesos publicados cubre 168 capas y mide una dispersión de 0,7998, con equilibrio perfecto de trabajo por fila.

El procedimiento de poda reutiliza el código oficial de ELSA (`main.py`) con la configuración del run HGRN-1.3B al 80% del propio paper: 4.096 pasos ADMM, paso z cada 32 pasos, batch 1 con 8 acumulaciones, learning rate 2e-4, lambda 0,01, precisión bf16 y 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo, semilla 0. La innovación concreta respecto al paper es la opción `--admm_comparison_group=row`, que activa la proyección por filas en lugar de una proyección global o por columnas; el paper de ELSA no reporta este ajuste. Todo el proceso de poda requirió 2,26 horas en una única A100 de 40 GB. No se documenta RLHF ni DPO, ni datos de instrucción; es un modelo base.

## Capacidades

- Generación de texto autoregresiva en modalidad base, sin ajuste a instrucciones ni formato de chat documentado.
- Razonamiento de sentido común y comprensión lectora limitados, evaluables mediante lm-evaluation-harness (arc, hellaswag, boolq, openbookqa, rte, winogrande).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el entrenamiento de poda emplea C4, mayoritariamente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad de carga con `flash-linear-attention` instalado, requisito para inicializar las capas recurrentes.

## Casos de uso

- Investigación sobre poda semi-estructurada: sirve como referencia cuantitativa del coste en perplejidad y precisión de una poda al 80% con proyección por filas, comparándola con el checkpoint denso del mismo autor.
- Reproducción de experimentos ADMM: el autor documenta hiperparámetros completos (pasos, lambda, learning rate, semilla) y un coste de 2,26 horas en A100 40 GB, lo que permite replicar el pipeline con modificaciones controladas.
- Evaluación de kernels de dispersión: al tener todas las filas el mismo número de no ceros en 168 capas, es un banco de pruebas útil para medir el rendimiento real de kernels semi-estructurados y bibliotecas de inferencia dispersa.
- Estudio de la degradación por tamaño de modelo: con 341M de parámetros y datos de perplejidad en WikiText-2 y C4, permite analizar cómo escala el daño de la poda desde modelos de 1,3B hacia abajo.
- Comparación de estrategias de proyección: la opción `admm_comparison_group=row` frente a la configuración original del paper permite aislar el efecto del agrupamiento por filas en la calidad final.
- Docencia y experimentación con arquitecturas recurrentes lineales: el modelo cabe en una GPU de consumo y se puede ejecutar en entornos modestos para estudiar el comportamiento de HGRN frente a transformers clásicos en tareas de lm-evaluation-harness.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4 test, fp16), ejecución única:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (80% semi-estructurado) | 63,44 | 43,97 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1920 |
| arc_easy | 0,6153 | 0,4263 |
| boolq | 0,6028 | 0,5807 |
| hellaswag | 0,3423 | 0,2793 |
| openbookqa | 0,2380 | 0,1440 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,4917 |
| Media | 0,4400 | 0,3773 |

No se han publicado resultados de benchmarks en la información disponible para otras tareas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 0,7 GB solo para pesos (341M × 2 bytes), más estados de activación y caché recurrente.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,35 GB de pesos; en 4 bits, alrededor de 0,18 GB, aunque no se documentan checkpoints cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o A100 funcionan sin problema. El autor empleó una A100 de 40 GB únicamente para el proceso de poda, no para inferencia.
- Cabe holgadamente en GPU de consumo, incluidas las de gama baja con 6-8 GB si se reserva memoria para el contexto.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado; vLLM, llama.cpp, Ollama y TGI no están confirmados en la documentación disponible y probablemente requieran soporte explícito para HGRN.
- Latencia y throughput: no disponibles. La naturaleza lineal de HGRN sugiere coste de inferencia menor que un transformer de atención cuadrática del mismo tamaño, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HGRN-340M-semi-structured-ELSA-80pct | 341M | No disponible | 80% semi-estructurada, 20% pesos por fila | No disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline | 341M | No disponible | Densa | No disponible | Hugging Face |
| Modelo de referencia del paper ELSA (HGRN-1.3B al 80%) | 1,3B | No disponible | 80% semi-estructurada | No disponible | No disponible |

La comparación con alternativas de la misma categoría (modelos de ~340M densos) no está disponible en la información proporcionada; no se han documentado cifras de modelos como Qwen, SmolLM o Pythia en esta ficha.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 casi se triplica (de 21,96 a 63,44) y la media zero-shot cae 6,3 puntos (de 0,4400 a 0,3773).
- Modelo base sin ajuste a instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable; no debe usarse como asistente sin un fine-tuning posterior.
- Idiomas no documentados: el proceso de poda emplea C4, mayoritariamente en inglés, y no hay evaluación multilingüe.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Resultados de una sola ejecución: el autor indica explícitamente "single run", sin intervalos de confianza ni múltiples semillas, por lo que la variabilidad no está cuantificada.
- Requiere `flash-linear-attention` instalado para cargar el modelo; sin esa dependencia la inicialización falla.
- La configuración de poda por filas no está reportada en el paper de ELSA; el autor añadió el código que habilita la opción, por lo que no existe validación independiente del ajuste.
- No hay información sobre sesgos, alucinación o robustez; al ser un modelo base entrenado con C4, es esperable que herede sesgos del corpus, pero no se han medido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-ELSA-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Librería flash-linear-attention: no disponible en la información proporcionada
- Repositorio de código de ELSA: no disponible en la información proporcionada
