# kiruluta/rsil-benchmark

## Resumen

RSIL (Resonant Spectral Interaction Ladders) v2.1 es un repositorio de investigación publicado en Hugging Face por el usuario `kiruluta`, no un modelo preentrenado listo para producción. Contiene una implementación de referencia en PyTorch de una arquitectura de mezcla de tokens (token mixing) que sustituye la atención por transformadas rápidas de Fourier (rFFT) con particionado multibanda determinista, combinada con ganancias radiales univariantes al estilo Kolmogorov-Arnold Networks (KAN) mediante polinomios de Chebyshev sobre resonancias espectrales diagonales.

El objetivo de entrenamiento implementado es *masked language modeling* (MLM) bidireccional, con un codificador residual y cabeza MLM atada. El propio autor advierte que el mezclador FFT es global y no causal, por lo que el repositorio no soporta generación autorregresiva sin una construcción causal adicional. La relevancia actual es doble: por un lado explora alternativas al mecanismo de atención para contextos largos; por otro, sirve como plantilla de entrenamiento distribuido (DDP, FSDP, DeepSpeed ZeRO-3) con `Accelerate`, BF16 y acumulación de gradientes.

El repositorio no incluye pesos entrenados ni resultados de benchmarks. Se presenta explícitamente como un llamamiento a colaboradores con acceso a sistemas multi-GPU para escalar la arquitectura desde aproximadamente 50M hasta más de 1B de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer modificado: mezcla de tokens por rFFT con particionado multibanda determinista, ganancias KAN-Chebyshev sobre resonancias diagonales e interacciones cruzadas dispersas de grado 2 a grado m |
| Parametros totales | No disponible (no se publican pesos; los objetivos de escalado declarados van de ~50M a 1B+ y la matriz de experimentos sugerida cubre 10M–100M) |
| Longitud de contexto | No fijada por la arquitectura; la matriz de experimentos sugerida cubre 512–4096 tokens. El mezclador FFT es global y no causal |
| Tipos de cuantizacion | No disponible (el repositorio contiene código de entrenamiento, no pesos cuantizados; se menciona entrenamiento en BF16) |
| Idiomas soportados | No disponible. El ejemplo de entrenamiento usa el tokenizador `bert-base-uncased` |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible. Se describe la subida de checkpoints a Hugging Face Hub, sin especificar formato (previsiblemente state dicts de PyTorch); el repositorio ocupa 0,4 GB y corresponde principalmente a código |

## Arquitectura y entrenamiento

La arquitectura sustituye la atención por un esquema de mezcla espectral: se aplica rFFT sobre la secuencia de tokens, se particiona el espectro en bandas con un criterio determinista y se aplican ganancias radiales univariantes parametrizadas con polinomios de Chebyshev (estilo KAN) sobre las resonancias diagonales. Además, se incorporan interacciones cruzadas entre bandas, dispersas, de grado 2 hasta grado m; los productos en el dominio de los tokens inducen restricciones de suma de frecuencias (convolución) en el dominio espectral. Sobre esa base se apila un codificador residual con cabeza MLM atada. El diseño busca equivarianza a traslaciones de orden superior en la mezcla de tokens, y el repositorio incluye tests de equivarianza y de forward/backward como comprobaciones de correctitud.

En cuanto a datos y procedimiento, no se documentan volúmenes de tokens ni composición de corpus. El repositorio incluye un conjunto sintético determinista y completamente offline para CI y pruebas de humo (v2.1), y permite alternativamente el consumo de corpus en streaming vía la librería `datasets` de Hugging Face (el ejemplo usa `HuggingFaceFW/fineweb-edu`). No se menciona RLHF, DPO ni ninguna fase de alineación. Las innovaciones técnicas declaradas incluyen el particionado multibanda determinista, las ganancias KAN-Chebyshev y las interacciones cruzadas dispersas; el manuscrito teórico se distribuye como `paper.pdf` dentro del repositorio.

## Capacidades

- Entrenamiento de modelos de lenguaje con objetivo de enmascarado bidireccional (MLM), no generación autorregresiva.
- Mezcla de tokens alternativa a la atención basada en rFFT multibanda y ganancias KAN-Chebyshev.
- Entrenamiento distribuido listo para escalar: DDP, FSDP y DeepSpeed ZeRO-3 mediante `Accelerate`, con BF16, acumulación de gradientes y entrenamiento con parámetros fragmentados.
- Pipeline de datos en streaming desde Hugging Face `datasets`, sin descarga completa del corpus.
- Subida de checkpoints al Hub de Hugging Face durante el entrenamiento.
- Conjunto de datos sintético determinista y offline para pruebas de CI y ejecuciones de humo.
- Tests de correctitud: comprobaciones de equivarianza a traslaciones y de pasos forward/backward.
- Soporte de ejecución en una GPU, ocho GPU y multi-nodo mediante ficheros de configuración de `Accelerate`.
- No implementa tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: no hay evidencia de ello en la información disponible.

## Casos de uso

- Investigación en alternativas a la atención: el repositorio permite entrenar y comparar un mezclador espectral frente a un codificador transformer estándar y frente a un mezclador de Fourier con MLP, midiendo pérdida MLM, throughput y memoria.
- Reproducción independiente de resultados: al incluir el manuscrito (`paper.pdf`), tests de equivarianza y dataset sintético determinista, sirve para que terceros validen las afirmaciones teóricas con o sin éxito, algo que el autor fomenta explícitamente.
- Plantilla de entrenamiento distribuido a escala: sus configuraciones de FSDP y DeepSpeed ZeRO-3 y su integración con `Accelerate` son reutilizables como esqueleto para preentrenar modelos de 50M a 1B+ parámetros en clústeres multi-GPU y multi-nodo.
- Experimentos de contexto largo: la matriz sugerida (512–4096 tokens) permite estudiar el comportamiento del mezclador FFT global frente a la atención en secuencias largas, con coste teórico distinto al cuadrático.
- Preentrenamiento sobre corpus en streaming: el pipeline con `HuggingFaceFW/fineweb-edu` permite lanzar preentrenamiento MLM sobre datos de gran volumen sin almacenamiento local completo, fijando revisiones de dataset y tokenizador para reproducibilidad.
- Estudio comparativo de parametrizaciones univariantes: el código está pensado para contrastar las ganancias KAN/Chebyshev contra controles MLP, splines, Fourier y funciones racionales, aislando qué aporta cada parametrización.
- Prototipado de *neural operators* y modelos espectrales: las etiquetas del repositorio incluyen `neural-operators` y `spectral`, por lo que es útil como banco de pruebas para quienes trabajan con operadores en el dominio de la frecuencia.
- Base para tareas de comprensión (clasificación, NER) tras preentrenamiento propio: al ser un LM bidireccional, el modelo resultante podría ajustarse a tareas de comprensión, pero requiere que el usuario complete el preentrenamiento, ya que no se distribuyen pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni similares, ni pérdidas de un modelo entrenado a escala. La model card únicamente propone una matriz de evaluación futura (Transformer encoder, Fourier mixer + MLP, RSIL con grado 1, grado 1+2 y grado 1+2+3) y una lista de magnitudes a reportar: parámetros, FLOPs/tokens, throughput en tiempo de reloj, memoria pico, pérdida MLM/métricas de tokens enmascarados y error de equivarianza a traslaciones.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM ni GPU recomendadas. Las cifras siguientes son estimaciones orientativas derivadas de los rangos de parámetros declarados en el repositorio, no datos del autor.
- Inferencia de un modelo de ~100M de parámetros en BF16: del orden de 0,2 GB de pesos, más activaciones y caché; cabe con holgura en cualquier GPU de consumo con 8 GB o más.
- Inferencia de un modelo de ~1B de parámetros en BF16: del orden de 2 GB de pesos; viable en GPUs de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB), con margen para contexto largo.
- Entrenamiento: la memoria la dominan los estados del optimizador y las activaciones. Con Adam, el estado del optimizador en FP32 puede multiplicar por 8 o más el tamaño de los pesos, de ahí que el repositorio incorpore FSDP, DeepSpeed ZeRO-3, BF16, acumulación de gradientes y *sharding*.
- GPU recomendadas para el escalado declarado (hasta 1B+ de parámetros): no especificadas por el autor; los ejemplos apuntan a configuraciones de 8 GPU y multi-nodo, típicamente A100 o H100 en clústeres con interconexión rápida.
- Opciones de despliegue: el repositorio define una ruta de entrenamiento con `Accelerate` (DDP, FSDP, DeepSpeed). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y dado que no hay pesos publicados ni soporte autorregresivo, estas vías no son aplicables tal cual.
- Nota de rendimiento: el autor advierte que el código de referencia prima la claridad sobre el rendimiento con kernels fusionados. Antes de ejecuciones a escala de miles de millones de parámetros recomienda perfilar llamadas repetidas a FFT/IFFT, materialización de bandas, productos cruzados entre bandas, memoria de activaciones y comunicación, y sugiere kernels fusionados de filtrado de bandas, máscaras en caché, factores de canal de rango reducido, `torch.compile`, *activation checkpointing*, paralelismo de secuencia y kernels personalizados en Triton/CUDA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card no ofrece comparativas con modelos publicados, pero sí define los controles que el propio autor considera comparables dentro del mismo programa experimental. No existen resultados numéricos para ninguno de ellos en la información disponible.

| Alternativa | Relación con RSIL | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transformer encoder estándar | Línea base propuesta en la matriz de experimentos del repositorio | Configurable (10M–100M en la matriz sugerida) | 512–4096 en la matriz sugerida | Depende de la implementación | Amplia, múltiples frameworks |
| Fourier mixer + MLP | Control que aísla el efecto del mezclador espectral sin ganancias KAN | Configurable | 512–4096 en la matriz sugerida | Depende de la implementación | Referencias externas no listadas en la model card |
| RSIL grado 1 / grado 1+2 / grado 1+2+3 | Variantes internas del propio RSIL para medir el efecto de las interacciones cruzadas | Configurable | 512–4096 en la matriz sugerida | Apache 2.0 | Código disponible; sin pesos |
| BERT-base (referencia contextual) | Arquitectura MLM bidireccional de tamaño comparable al tramo bajo del escalado; el repositorio usa su tokenizador | 110M | 512 | Apache 2.0 | Pesos preentrenados publicados |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo preentrenado ni un producto listo para producción: es código de investigación. No hay pesos entrenados publicados en el repositorio.
- El mezclador FFT es global y no causal, por lo que el repositorio no admite generación autorregresiva de siguiente token sin una construcción causal separada. Cualquier uso conversacional o de generación queda fuera de su alcance declarado.
- Contradicción de fechas: la model card figura como creada y actualizada el 2026-09-20, una fecha futura respecto al momento habitual de consulta. Conviene verificarla antes de citar el repositorio.
- Ausencia total de benchmarks: no hay evidencia publicada de que la arquitectura iguale o supere a un transformer en pérdida, throughput o calidad.
- El propio autor califica el estado como experimental y pide replicación independiente, aceptando tanto resultados positivos como negativos.
- Sesgos conocidos: no disponibles. Al no existir un modelo entrenado a escala ni un corpus documentado, no se pueden evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: no aplicable al repositorio en sí; sería aplicable a cualquier modelo resultante de completar el preentrenamiento MLM y ajustarlo, extremo no documentado.
- Cobertura de idiomas: no declarada. El uso de `bert-base-uncased` en los ejemplos apunta a inglés, pero no hay confirmación oficial.
- Limitaciones de contexto: el mezclador es global, de modo que el coste y el comportamiento con secuencias muy largas no están caracterizados más allá de los 4096 tokens sugeridos.
- Licencia Apache 2.0, que permite uso comercial del código, pero sin garantías y con obligación de conservar avisos de licencia y de atribución; el uso comercial de pesos derivados queda sujeto a que el usuario los entrene.
- Ausencia de resultados de reproducibilidad: descargas y *likes* a cero, sin issues ni resultados públicos, lo que limita el valor como referencia contrastada.
- El repositorio no publica requisitos de hardware ni cifras de rendimiento, de modo que cualquier planificación de costes debe partir de perfiles propios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kiruluta/rsil-benchmark
- Manuscrito teórico incluido en el repositorio: `paper.pdf`
- Llamamiento a colaboradores de alto cómputo: `COLLABORATION_CALL.md`
- Reglas de colaboración: `CONTRIBUTING.md`
- Plantilla de model card y experimentos: `MODEL_CARD.md`
- Mapa de código: `src/rsil/model.py` (arquitectura), `src/rsil/data.py` (pipeline de datos en streaming), `src/rsil/train.py` (punto de entrada de entrenamiento con `Accelerate`), `configs/model/` (escalas de modelo), `configs/accelerate/` (ejemplos FSDP y DeepSpeed)
- Dataset de ejemplo en streaming: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador de ejemplo: https://huggingface.co/bert-base-uncased
- No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs o demos) distintos de los anteriores.
