# pinkelephantlimited/pinkelephant-llm-48b-s

## Resumen

Pink Elephant 48B-S es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por pinkelephantlimited, diseñado como la culminación de un programa de investigación público y reproducible. El modelo parte de un núcleo denso de 14,8 mil millones de parámetros (Pink Elephant 14B) que fue "upcycled" a una arquitectura sparse de 8 expertos con routing top-2, alcanzando un total de 47,7 mil millones de parámetros, de los cuales solo alrededor del 30,7% se activan por token. Esto proporciona una ventaja computacional de 3,2× frente a un modelo denso equivalente de 48B.

La versión "S" (refinada) se obtuvo mediante una segunda época completa de entrenamiento sobre un currículo de 99.661 ejemplos de código y matemáticas, con una pérdida de entrenamiento que cayó un 32% (de 0,0616 a 0,0419) sin sobreajuste significativo. El modelo mantiene la capacidad de codificación del padre (HumanEval 70,12% pass@1) con aproximadamente un tercio del cómputo por token. Con licencia MIT, es libre para uso comercial y está disponible en formato safetensors con precisión nativa bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) · 8 expertos · top-2 routing |
| Parametros totales | 47.691.290.048 (47,7B) |
| Parametros activos | ~14,66B (30,7% por token) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con capas de MoE. Cada capa reemplaza la red feedforward convencional por un "gabinete" de 8 redes expertas, orquestadas por un router aprendido que selecciona 2 de los 8 expertos por token. La configuración incluye 40 capas transformer, dimensión oculta de 5.120, dimensión oculta de experto de 8.960, 40 cabezas de atención (10 cabezas KV, dimensión de cabeza 128) y un vocabulario de 100.352 tokens.

El entrenamiento se realizó en dos épocas completas sobre un currículo de 99.661 ejemplos de código y matemáticas. La primera época partió del modelo denso 14B upcycled (los pesos feedforward se dividieron y replicaron en 8 expertos complementarios por capa, preservando el comportamiento del padre en la inicialización). La segunda época (pasos 1.557 a 3.114) utilizó un scheduler coseno reiniciado con pico en 1e-4, con checkpoints cada 100 pasos y reanudaciones limpias en cuatro ocasiones. Los adaptadores LoRA finales y el router entrenado se fusionaron directamente en los pesos base, por lo que el archivo descargado es un modelo listo para cargar sin necesidad de PEFT.

## Capacidades

- Generación de texto en inglés, con especialización en código y matemáticas.
- Razonamiento matemático en niveles de preálgebra, álgebra, teoría de números, probabilidad, geometría, precálculo y álgebra intermedia (con rendimiento variable por área).
- Generación de código: alcanza 70,12% pass@1 en HumanEval, manteniendo el nivel del modelo padre denso.
- Eficiencia computacional: solo ~30% de parámetros activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño.
- No se especifican capacidades de tool calling, function calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede asistir en la escritura de funciones y algoritmos, con un rendimiento verificado en HumanEval que lo hace adecuado para tareas de programación competitiva o generación de snippets.
- Tutoría de matemáticas: dado su entrenamiento en un currículo matemático, puede explicar problemas de álgebra, preálgebra y teoría de números, aunque su precisión varía según la rama (mejor en preálgebra y álgebra que en geometría o precálculo).
- Prototipado rápido de aplicaciones con licencia permisiva: al ser MIT, puede integrarse en productos comerciales sin restricciones de atribución o copyleft.
- Investigación en eficiencia de MoE: al ser un modelo abierto y reproducible, sirve como banco de pruebas para estudiar upcycling, sparse routing y trade-offs entre capacidad y cómputo.
- Despliegue en entornos con GPUs de alta gama: su activación sparse permite servir un modelo de 47,7B con coste computacional de ~14,66B por token, adecuado para inferencia en lote o en tiempo real con hardware Blackwell.
- Evaluación de modelos en código y matemáticas: sus benchmarks públicos y datos de evaluación instrumentados permiten comparar metodologías y reproducir resultados.

## Benchmarks y rendimiento

Los benchmarks fueron medidos con decodificación greedy en una NVIDIA RTX PRO 6000 Blackwell. Los resultados publicados son:

| Benchmark | 48B-S | 14B (padre) | Nota |
|---|---|---|---|
| HumanEval pass@1 | 70,12% (115/164) | 71,34% (117/164) | Diferencia de ~1pp atribuida a ruido entre ejecuciones |
| MATH-500 | 38,40% (192/500) | 63,40% (317/500) | Decodificación greedy de una sola respuesta; mejora planificada |

Desglose por área en MATH-500: preálgebra 61,0%, álgebra 59,7%, teoría de números 37,1%, conteo y probabilidad 28,9%, geometría 26,8%, precálculo 17,9%, álgebra intermedia 13,4%.

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El modelo en bf16 ocupa aproximadamente 95,4 GB (tamaño del repositorio), por lo que la VRAM mínima para carga completa sin cuantización es de al menos 96 GB, más overhead de inferencia.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell (usada para los benchmarks) o GPUs de centro de datos con 80 GB o más, como A100 80GB, H100 80GB o similares.
- No cabe en GPUs de consumo (RTX 4090 tiene 24 GB, RTX 5090 ~32 GB) sin cuantización, pero no se han publicado versiones cuantizadas (GGUF, AWQ, etc.).
- Opciones de despliegue: no se especifican en la documentación; sin embargo, al ser un modelo transformers estándar, puede servirse con vLLM, TensorRT-LLM o TGI, siempre que se disponga de suficiente VRAM.
- Latencia y throughput: no disponibles. La activación sparse (~30%) sugiere un coste por token inferior al de un denso equivalente, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos MoE de tamaño similar en la información proporcionada. El único punto de comparación publicado es con su modelo padre denso de 14B, que muestra una pérdida de ~1pp en HumanEval y una caída significativa en MATH-500 (63,4% → 38,4%). Para una comparativa con alternativas como Mixtral 8x7B o DeepSeek-V2, no hay datos en la documentación.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; no se garantiza un rendimiento fiable en otros idiomas.
- El rendimiento en matemáticas es notablemente inferior al del modelo padre en MATH-500 (38,4% vs 63,4%), lo que indica una degradación en tareas de razonamiento matemático complejo tras el upcycling y el refinamiento.
- No se documentan sesgos específicos, pero al estar entrenado en un currículo limitado a código y matemáticas, puede tener lagunas en conocimiento general o de dominio abierto.
- Riesgo de alucinación no evaluado formalmente; se recomienda validación en aplicaciones de producción.
- Aunque la licencia MIT permite uso comercial, el modelo no incluye garantías de seguridad ni alineación con valores humanos.
- El tamaño del modelo (95,4 GB en bf16) limita su despliegue a infraestructura con GPUs de alta capacidad; no hay versiones cuantizadas publicadas.
- La reproducibilidad declarada (pérdidas, checkpoints, dataset) es un punto fuerte, pero no se han publicado evaluaciones de seguridad o robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b-s
- Modelo base (dense 14B): https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b
- Repositorio de figuras y datos de evaluación: referenciado en la model card (figures/ y evals/), pero sin URL directa disponible.
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
