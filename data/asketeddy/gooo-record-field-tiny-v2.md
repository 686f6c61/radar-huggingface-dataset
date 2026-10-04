# asketeddy/gooo-record-field-tiny-v2

## Resumen

Gooo paired field intentions v2 (asketeddy/gooo-record-field-tiny-v2) es un modelo neuronal minúsculo de 18.656 parámetros diseñado para una tarea de decisión muy concreta dentro de un sistema de metaprogramación en Go. Dado un contexto formado por los nombres de tres campos, dos expresiones candidatas completas por campo y una intención expresada en lenguaje natural (coreano o inglés), el modelo propone el orden de ensamblaje: elige qué variante de cada campo usar para construir un registro. No es un modelo generativo de texto, sino un clasificador de selección ternaria entre alternativas predefinidas.

El modelo lo publica el usuario asketeddy y forma parte del proyecto Gooo, cuyo repositorio de investigación es kimjooyoon/gooo-neural-decision-experiments. La variante v2 introduce pares de intenciones opuestas (mantener título o copiar estado, rellenar estado con ready o wait, añadir prefijo o sufijo al motivo) y se evalúa sobre ocho combinaciones de requisitos, incluyendo expresiones nuevas no vistas en entrenamiento. La arquitectura es una red densa 768-24-8 con sesgos (18.656 parámetros en total), entrenada en FP32 y también en versiones ternarias PTQ y QAT.

Su relevancia es acotada y experimental: demuestra que un modelo de menos de 20 KB de pesos puede guiar decisiones de ensamblaje de código con una precisión de primer candidato del 27,60 % en cuerpos nuevos (frente al 12,50 % de la versión v1 y al 12,50 % del orden determinista), ejecutándose en microsegundos en CPU. No es un modelo de propósito general ni compite con LLM; es una pieza de investigación sobre decisión neuronal aplicada a metaprogramación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal densa (MLP) 768-24-8 con sesgos; entrada 768 dimensiones, 24 unidades ocultas, 8 salidas |
| Parametros totales | 18.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica como ventana de tokens; la entrada es un vector fijo de 768 dimensiones con nombres de campo, dos candidatos completos e intención |
| Tipos de cuantizacion | FP32; ternaria PTQ (post-training quantization); ternaria QAT (quantization-aware training, aprox. 1,6 bits/peso, 5 valores por byte) |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | JSON de configuración y binario propietario del runtime Go (models/fp32/model.json, weights.bin); no safetensors ni GGUF |
| Red de referencia | 768/24/8, semilla 20261051 |
| SDK / version de caracteristica | v0.2.22-experimental / triple_record_field_context_v1_joint_v1 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa de dos capas: 768 entradas, 24 unidades ocultas y 8 salidas, con términos de sesgo. El recuento de parámetros cuadra exactamente con esta topología: (768×24 + 24) + (24×8 + 8) = 18.656. La entrada combina los nombres de los tres campos, las dos expresiones candidatas completas por campo y la intención; las 8 salidas corresponden a las combinaciones de decisión sobre los campos. La arquitectura es deliberadamente mínima: no hay atención, ni recurrencia, ni capa de embeddings de tokens. Existen tres variantes exportadas: FP32, ternaria PTQ y ternaria QAT, donde la ternaria almacena cinco valores por byte (≈1,6 bits/peso, con valor teórico de 1,58 bits) y el runtime de Go la descomprime a arrays int8 antes de ejecutar.

El pipeline separa responsabilidades: Go genera las fuentes, características y ejemplos finitos con verdad de referencia, y Python realiza el entrenamiento offline sobre MPS (Apple) y la exportación; Go se encarga de la inferencia, la generación y ejecución de código y el cálculo de métricas. El entrenamiento usó 40 épocas FP32 más 40 épocas QAT (1.920 actualizaciones cada una; 3.840 en total). El conjunto total consta de 7.168 observaciones fuente, de las cuales 6.144 son expresiones básicas (8 formas de cuerpo/candidato × 6 órdenes de campo × 8 direcciones de candidato × 8 combinaciones de requisitos × 2 idiomas) y 1.024 corresponden a dos expresiones nuevas. Se destinaron 3.072 observaciones a entrenamiento y 1.536 a calibración. Cinco ejemplos y 15 campos por fuente se verificaron mediante ensamblaje determinista del compilador (Go 1.27.1, main limpio aeff3641254ac5f795fa1fb8c94bed702f10cbe4). La calibración eligió época y temperatura, y no se reajustó el modelo ni la configuración tras ver los resultados de evaluación.

## Capacidades

- Selección de variante de campo: elige, entre dos candidatos por campo, cuál usar al ensamblar un registro Go.
- Ordenación de ensamblaje: propone el orden de composición de los campos a partir del contexto y la intención.
- Interpretación de intenciones pareadas y opuestas: mantener título o copiar estado, rellenar estado con `ready` o `wait`, añadir prefijo o sufijo al motivo, y elegir constantes `draft`/`deferred` según el cuerpo.
- Cobertura bilingüe: procesa expresiones en coreano e inglés.
- Múltiples presupuestos de candidatos: funciona con presupuesto 1 (primer candidato), 2, 4 y 8, devolviendo la primera combinación válida dentro del presupuesto.
- Integración con compilador y ejecución real: el sistema genera, compila y ejecuta el código resultante y registra los campos acertados y los restantes.
- Uso como componente local: inferencia embebida en el runtime de Go, sin llamadas a servicios externos ni API de terceros.
- No dispone de generación de texto libre, tool calling, function calling, razonamiento multi-paso general, visión ni audio.

## Casos de uso

- Asistencia a la composición de registros en Go: dado un esquema con dos alternativas por campo, el modelo sugiere qué variante escoger, y el compilador valida la elección ejecutando el resultado. Es útil para generar estructuras de datos con decisiones condicionales sin escribir la lógica manualmente.
- Optimización de bucles de ensamblaje con presupuesto limitado: con presupuesto 1 el modelo propone un único candidato por campo y se comprueba si compila y ejecuta correctamente; reduce el número de combinaciones a evaluar en generación de código.
- Estudio de cuantización ternaria en modelos diminutos: las variantes PTQ y QAT permiten medir la pérdida de expresividad al comprimir a ≈1,6 bits/peso en una tarea de decisión discreta, con datos concretos de precisión.
- Prototipado de metaprogramación guiada por intención en lenguaje natural: el usuario describe el requisito en coreano o inglés y el modelo traduce esa intención en elecciones de campo verificables.
- Evaluación de robustez ante expresiones nuevas: los ejes de evaluación (cuerpo aprendido con expresiones nuevas, cuerpo nuevo con expresiones nuevas) sirven para medir generalización fuera de la distribución de entrenamiento.
- Docencia e investigación en decisión neuronal de bajo coste: al ser un modelo de 18.656 parámetros que se ejecuta en microsegundos, resulta adecuado como banco de pruebas reproducible para experimentos de selección discreta y cuantización.
- Integración en pipelines de CI que compilan y ejecutan código generado: el runtime de Go verifica cada ensamblaje con ejecución real y registra resultados, lo que permite auditar reconstrucciones y fallos en entornos controlados.

## Benchmarks y rendimiento

Resultados de la evaluación principal (primer candidato que completa la combinación; se necesitan los tres campos correctos para contar como acierto):

| Modelo | Cuerpo distinto: primer candidato | Dentro de 2 candidatos | Dentro de 4 candidatos | Expresion nueva, mismo cuerpo: primer candidato | Expresion nueva, cuerpo distinto: primer candidato |
|---|---:|---:|---:|---:|---:|
| v1 FP32 (referencia) | 192/1.536 (12,50 %) | 384 | 764 | 64/512 (12,50 %) | 64/512 (12,50 %) |
| v2 FP32 | 424/1.536 (27,60 %) | 844 | 1.251 | 100/512 (19,53 %) | 81/512 (15,82 %) |
| v2 PTQ ternario | 191/1.536 (12,43 %) | 384 | 768 | 64/512 (12,50 %) | 64/512 (12,50 %) |
| v2 QAT ternario | 212/1.536 (13,80 %) | 450 | 874 | 67/512 (13,09 %) | 65/512 (12,70 %) |

Precisión por campo individual (cuerpo distinto): v1 2.304/4.608 (50 %), v2 FP32 2.942/4.608 (63,85 %), v2 QAT 2.430/4.608 (52,73 %). En expresión nueva con cuerpo distinto, el FP32 obtiene 831/1.536 (54,10 %). Desglose por idioma del FP32 en cuerpo distinto: coreano 191/768, inglés 233/768; en expresiones nuevas: coreano 41/256, inglés 40/256.

Ejecución real sobre 24 fuentes prefijadas, ensambladas con cinco métodos y presupuestos 1/2/8 (360 grafos, cada uno ejecutado dos veces), contando solo los campos con transformación activa:

| Metodo | Expresion basica: campos activos | Expresion nueva: campos activos | Peticiones de cambio de valor reales |
|---|---:|---:|---:|
| Orden determinista | 48/96 | 24/48 | 60/120 |
| v1 FP32 | 48/96 | 24/48 | 48/120 |
| v2 FP32 | 76/96 | 32/48 | 92/120 |
| v2 PTQ | 46/96 | 24/48 | 54/120 |
| v2 QAT | 44/96 | 26/48 | 62/120 |

El v2 FP32 alcanzó 108/144 (75 %) de campos activos y 92/120 (76,67 %) de peticiones de cambio de valor en esas 24 fuentes. Los campos con condición de protección (devolver la entrada sin cambios) fueron 96/96 y 48/48 en todos los métodos. En presupuesto 8, los 120 ensamblajes correspondientes cumplieron 15/15 campos seleccionados, 12/12 campos ejecutados y 8/8 salidas con nombre. La comparación de 120 exportaciones frente a Go arrojó un error máximo de logit de 0,00000131.

Coste temporal y de memoria (mediciones reportadas):

| Coste | Valor |
|---|---:|
| Mediana de decisión en Go, FP32, cuerpo distinto | 17,792 µs |
| Mediana de decisión en Go, PTQ / QAT, cuerpo distinto | 16,250 µs / 16,250 µs |
| Fichero / tensor residente FP32 | 74.624 B / 74.624 B |
| Fichero / tensor residente ternario | 3.854 B / 18.752 B + escala de 8 B |
| Suma del bucle de entrenamiento en GPU | 5,341 s |
| Tiempo total de proceso de entrenamiento / tiempo de CPU | 7,21 s / 4,17 s |
| RSS máximo del proceso de entrenamiento | 538,28 MiB |
| Tensor MPS muestreado / asignación máxima del driver | 13,81 MiB / 50,72 MiB |
| Mediana de comando completo, presupuesto 1 (básica) | determinista 395,86 ms; FP32 397,60 ms |

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. El modelo FP32 ocupa 74.624 B y el ternario 3.854 B en disco, con 18.752 B residentes más 8 B de escala. Cabe en cualquier GPU y en CPU sin problema.
- GPU recomendadas: no requiere GPU para inferencia; el runtime de Go ejecuta en CPU. El entrenamiento se realizó sobre MPS (GPU de Apple), y el RSS máximo del proceso de entrenamiento fue de 538,28 MiB, por lo que cualquier equipo con ~1 GB de memoria libre puede reproducirlo.
- GPU de consumo: sí, cabe con enorme holgura en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), e incluso en dispositivos sin GPU.
- Opciones de despliegue: runtime propio en Go (comando `gooo body-compose`), con modelos en `models/fp32/model.json` y `weights.bin`; también variantes ternarias. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un transformer con pesos en safetensors o GGUF.
- Latencia: decisión en Go con mediana de 17,792 µs (FP32) y 16,250 µs (PTQ/QAT). El comando completo, que incluye compilación en Go y arranque de proceso, tiene mediana en torno a 395-398 ms en presupuesto 1.
- Throughput: no disponible (no se reporta una métrica de peticiones por segundo).

## Comparativa con modelos similares

No se conocen modelos públicos comparables en esta categoría (selección de ensamblaje para metaprogramación en Go). La comparación más significativa es interna, entre las variantes del propio proyecto:

| Modelo | Parametros | Tipo | Contexto de entrada | Precisión primer candidato (cuerpo distinto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gooo-record-field-tiny-v2 FP32 | 18.656 | MLP densa FP32 | vector de 768 dim. | 27,60 % | MIT | HuggingFace (asketeddy) |
| gooo-record-field-tiny-v2 PTQ | 18.656 | MLP ternaria PTQ | vector de 768 dim. | 12,43 % | MIT | HuggingFace (asketeddy) |
| gooo-record-field-tiny-v2 QAT | 18.656 | MLP ternaria QAT | vector de 768 dim. | 13,80 % | MIT | HuggingFace (asketeddy) |
| field v1 FP32 (referencia) | no disponible | MLP FP32 | vector de contexto | 12,50 % | MIT (proyecto) | repositorio de investigación |

Frente a LLM u otros modelos de decisión, la comparación no procede por diferencia de tarea, tamaño y paradigma.

## Limitaciones y advertencias

- Tarea extremadamente restringida: solo decide entre candidatos predefinidos de una plantilla concreta; no genera código libre ni resuelve problemas fuera de ese esquema.
- Precisión limitada: la mejor variante (FP32) acierta el primer candidato completo en el 27,60 % de los casos con cuerpo distinto y baja al 15,82 % con expresión nueva y cuerpo distinto. Las variantes ternarias quedan cerca del azar estructural (12,50 %).
- Sin benchmarks de propósito general: no hay MMLU, HumanEval ni GSM8K; no es un modelo de lenguaje general.
- Riesgo de alucinación en el sentido de selección incorrecta: el modelo puede elegir una combinación que no cumple la intención; por eso el flujo incluye compilación y ejecución reales como verificación.
- Idiomas limitados a coreano e inglés; no hay soporte declarado de castellano ni de otras lenguas.
- Sin ventana de contexto de tokens: la entrada es un vector fijo de 768 dimensiones; no admite entradas más largas o estructuradas fuera del formato previsto.
- Reproducibilidad dependiente del entorno: el flujo fija Go 1.27.1, un commit concreto del compilador y una versión de SDK experimental; cambios en el compilador o en el runtime pueden alterar los resultados.
- Uso comercial: la licencia es MIT, que permite uso comercial, pero el modelo depende de un compilador y un SDK experimentales cuya madurez y soporte no están garantizados.
- Adopción prácticamente nula: 0 descargas y 0 likes en el momento de la consulta, y repositorio de 0,0 GB, lo que indica un artefacto muy reciente o con contenido mínimo. Conviene verificar la integridad y disponibilidad real de los ficheros antes de integrarlo.
- Los datos de ejecución se basan en una muestra de 24 fuentes y presupuestos concretos; los autores advierten de que es una muestra pequeña y que las métricas con distinto denominador no son directamente comparables.
- No se han medido el uso de CPU del host ni la utilización de GPU, y las asignaciones de memoria MPS se reportan como coste aparte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asketeddy/gooo-record-field-tiny-v2
- Repositorio de investigación: https://github.com/kimjooyoon/gooo-neural-decision-experiments
- Commit del plan previo al entrenamiento: https://github.com/kimjooyoon/gooo-neural-decision-experiments/tree/0de45707c343455db4cc1052ac7b799b614a740d
- Commit del código de entrenamiento: https://github.com/kimjooyoon/gooo-neural-decision-experiments/tree/f982bff1b29af1d7ab8b429eddcea809978c7abc
- Referencia arXiv 1611.01989: https://arxiv.org/abs/1611.01989
- Referencia arXiv 2006.08381: https://arxiv.org/abs/2006.08381
- Referencia arXiv 2402.17764: https://arxiv.org/abs/2402.17764
- Demostración incluida en el modelo: `demo.gooo.fixture` y `demo-cases.json` (descargables desde el repositorio de HuggingFace)
