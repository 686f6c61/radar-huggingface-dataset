# ryugyosoft/LFM2.5-24B-A2B-onwx-kit

## Resumen

`ryugyosoft/LFM2.5-24B-A2B-onwx-kit` no es un modelo con pesos, sino un kit de conversión y ejecución para poder correr el modelo MoE `LiquidAI/LFM2.5-24B-A2B` de Liquid AI en la NPU XDNA2 de los procesadores AMD Ryzen AI. El repositorio ocupa unos 9 MB y contiene un script de conversión en Python puro (solo numpy) y los planes de ejecución para la NPU; ni los pesos ni el tokenizer de Liquid AI están incluidos. El flujo lo orquesta la aplicación onwx (versión 1.0.0 o posterior), que descarga el modelo original (~48 GB) desde Hugging Face, lo convierte en el propio equipo a pesos int4 para NPU y borra los ficheros originales.

El modelo base es un MoE de 24B parámetros totales del que se activan aproximadamente 2,4B por token, con una arquitectura híbrida que combina atención con convoluciones cortas y varias puertas multiplicativas (del tipo B×x y C×y). El kit reparte el trabajo: la NPU ejecuta las multiplicaciones de matrices directamente sobre los pesos int4 y la CPU se encarga de la atención, las convoluciones cortas y el enrutado de expertos. El resultado son unos 17 GB de modelo convertido en la variante por defecto.

La relevancia es práctica: permite inferencia local de un MoE de 24B en un portátil o mini-PC con Ryzen AI, sin GPU dedicada y con velocidades de 17 a 20,5 tokens/s. El precio es una licencia encadenada (el kit es Apache-2.0, pero los pesos convertidos heredan la LFM Open License v1.0) y una degradación medible frente a fp32 (KL de 0,059 a 0,100 según variante).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kit de conversión y ejecución para NPU XDNA2; modelo base MoE híbrido (atención + convolución corta + puertas multiplicativas) |
| Parametros totales | 24B (modelo base LFM2.5-24B-A2B) |
| Parametros activos | ~2,4B por token |
| Longitud de contexto | No disponible en la información proporcionada; el kit procesa el prompt en lotes de 2.048 tokens como máximo |
| Tipos de cuantizacion | int4, con empaquetado en dos capas («2 枚重ね»); variantes balanced y quality |
| Idiomas soportados | No disponible; las mediciones del kit se hicieron con texto en japonés, inglés y código Python |
| Licencia | Apache-2.0 para el kit; LFM Open License v1.0 para el modelo base y para los pesos convertidos |
| Formato de pesos | El repositorio no contiene pesos: script `lfm2_convert.py` (numpy) y planes NPU (`plans/`, `plans/lfx/`, `xdna.json`) |
| Tamano del repositorio | ~9 MB (0,0 GB según Hugging Face) |
| Hardware objetivo | NPU AMD XDNA2 (Ryzen AI); referencia medida en Ryzen AI Max+ 395 |
| Variantes de conversion | balanced (por defecto, ~17 GB) y quality (~22 GB, vía `ONWX_KIT_VARIANT=quality`) |
| Software requerido | onwx 1.0.0 o superior |

## Arquitectura y entrenamiento

El kit implementa una partición de cómputo entre NPU y CPU. La NPU XDNA2 ejecuta las multiplicaciones de matrices leyendo directamente los pesos int4, mientras que la CPU asume la atención, las convoluciones cortas y el enrutado de expertos del MoE. El prompt se procesa por lotes de hasta 2.048 tokens. La conversión la realiza `lfm2_convert.py`, que solo depende de numpy y se ejecuta en CPU usando unos 10 GB de memoria durante aproximadamente 10 minutos; el proceso completo (descarga del modelo de ~48 GB, conversión y borrado de los ficheros originales) tarda entre 20 y 30 minutos, con una medida de 23 minutos en un Ryzen AI Max+ 395, y requiere hasta ~65 GB de disco libre de forma temporal.

La decisión de diseño más relevante es no cuantizar todo a un único int4: LFM2 tiene muchas puertas multiplicativas (B×x, C×y) que amplifican el error de cuantización. Por eso la variante balanced mantiene en dos capas empaquetadas todo lo que no son expertos y la matriz `down` de los expertos, y la variante quality extiende ese tratamiento a `gate` y `up` de los expertos. Un int4 único y plano llega a ~28 tok/s pero degrada la KL frente a fp32 hasta 0,33, frente a 0,100 (balanced) y 0,059 (quality). No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Conversión en el propio equipo de un MoE de 24B a pesos int4 para NPU, sin subir datos a ningún servicio externo.
- Ejecución de inferencia repartida entre NPU (matrices) y CPU (atención, convoluciones cortas, routing).
- Dos perfiles de cuantización con compromiso explícito calidad/velocidad: balanced y quality.
- Procesado de prompts por lotes de hasta 2.048 tokens, lo que permite prefill de prompts largos en varias pasadas.
- Generación de texto y de código: las mediciones de fidelidad usan texto en japonés, inglés y Python.
- Integración con la aplicación onwx, que gestiona descarga, conversión, verificación de espacio y limpieza de ficheros temporales.
- Script de conversión portable (solo numpy), reutilizable para inspeccionar o adaptar el pipeline.
- No disponible: soporte de tool calling, capacidades de agente, visión, audio o modo thinking no están documentados en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de 24B en portátiles y mini-PC con Ryzen AI: el kit evita depender de una GPU dedicada y mantiene todo el cómputo en el equipo, con ~20,5 tok/s en la variante balanced sobre Ryzen AI Max+ 395.
- Asistentes de código offline: el modelo se ha validado con código Python y permite autocompletado y generación en entornos sin conectividad, manteniendo el código fuente dentro de la máquina.
- Procesamiento de documentación confidencial: al no enviar datos a la nube, encaja en flujos legales, sanitarios o financieros donde el texto no puede salir del puesto de trabajo.
- RAG local sobre corpus moderados: con prompts que se trocean en lotes de 2.048 tokens y un prefill de ~8,5 s para 4.000 tokens en balanced, es viable inyectar varios documentos por consulta.
- Evaluación de cuantización en hardware de borde: las dos variantes y los valores de KL frente a fp32 permiten medir el impacto real de int4 antes de fijar una configuración de producción.
- Prototipado y demos en ferias o entornos aislados: la instalación se reduce a descargar el kit de 9 MB y dejar que onwx haga la conversión en 20-30 minutos, sin artefactos preconvertidos que distribuir.
- Comparación NPU frente a CPU/GPU en un mismo equipo: sirve como banco de pruebas para decidir qué motor usar en cada carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son mediciones del propio kit frente a una implementación de referencia en fp32, sobre un texto de 560 tokens con japonés, inglés y código Python, en un Ryzen AI Max+ 395:

| Variante | KL frente a fp32 | Generacion | Prefill 1.000 tokens | Prefill 4.000 tokens | Tamano |
|---|---|---|---|---|---|
| balanced (por defecto) | 0,100 | ~20,5 tok/s | ~2,4 s | ~8,5 s | ~17 GB |
| quality | 0,059 | ~17 tok/s | ~2,6 s | ~9,3 s | ~22 GB |
| int4 unico (referencia descartada) | 0,330 | ~28 tok/s | no disponible | no disponible | no disponible |

| Conversion (extremo a extremo) | Valor |
|---|---|
| Descarga del modelo original | ~48 GB |
| Tiempo de conversion | ~10 min (CPU, ~10 GB de RAM) |
| Proceso completo en Ryzen AI Max+ 395 | ~23 min (rango indicado 20-30 min) |
| Espacio temporal necesario | ~65 GB |

## Requisitos de hardware

- NPU AMD XDNA2 (familia Ryzen AI) obligatoria; el kit no contempla ejecución en GPU NVIDIA o AMD discreta.
- Referencia de rendimiento medida en Ryzen AI Max+ 395: ~20,5 tok/s (balanced) y ~17 tok/s (quality).
- VRAM: no aplica, el modelo reside en memoria del sistema; el espacio ocupado por los pesos convertidos es de ~17 GB (balanced) o ~22 GB (quality).
- Memoria RAM: ~10 GB durante la fase de conversión; no se especifica el requisito en inferencia más allá del tamaño de los pesos.
- Disco: ~65 GB libres de forma temporal durante la conversión (modelo original + pesos convertidos), ~17-22 GB en régimen estable.
- No cabe en GPUs de consumo tipo RTX 4090 por diseño: el objetivo es la NPU integrada, no CUDA.
- Despliegue: exclusivamente mediante la aplicación onwx 1.0.0 o superior. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia de prefill: ~2,4 s para 1.000 tokens y ~8,5 s para 4.000 tokens (balanced); ~2,6 s y ~9,3 s en quality.

## Comparativa con modelos similares

| Opcion | Parametros | Contexto | Calidad (KL vs fp32) | Velocidad | Tamano | Licencia |
|---|---|---|---|---|---|---|
| Este kit, variante balanced | 24B totales / ~2,4B activos | Lotes de 2.048 tokens | 0,100 | ~20,5 tok/s | ~17 GB | Kit Apache-2.0; pesos LFM Open License v1.0 |
| Este kit, variante quality | 24B totales / ~2,4B activos | Lotes de 2.048 tokens | 0,059 | ~17 tok/s | ~22 GB | Kit Apache-2.0; pesos LFM Open License v1.0 |
| LFM2.5-24B-A2B original (fp32/bf16) | 24B totales / ~2,4B activos | No disponible | Referencia (0) | No disponible en NPU | ~48 GB | LFM Open License v1.0 |
| int4 unico sobre el mismo modelo | 24B totales / ~2,4B activos | Lotes de 2.048 tokens | 0,330 | ~28 tok/s | No disponible | LFM Open License v1.0 |

No se dispone de datos de otros modelos comparables (por ejemplo, MoE de tamaño similar ejecutados en NPU con otras herramientas) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni tokenizer: sin conexión a Hugging Face y sin la aplicación onwx no es utilizable por sí solo.
- Licencia en cascada: el código del kit es Apache-2.0, pero los pesos convertidos quedan bajo la LFM Open License v1.0, que excluye el uso comercial a empresas con ingresos anuales superiores a 10 millones de dólares.
- Degradación de calidad measurable frente a fp32 (KL 0,059-0,100) y especialmente en la configuración int4 plana (KL 0,33), que el autor descarta.
- Dependencia de hardware muy concreta: solo NPU XDNA2 de AMD; no hay ruta documentada para GPU o CPU sola.
- Pico de disco de ~65 GB durante la conversión, que puede bloquear equipos con almacenamiento ajustado.
- Procesado del prompt en lotes de 2.048 tokens: prompts más largos requieren varias pasadas y la latencia de prefill crece de forma aproximadamente lineal (~8,5 s para 4.000 tokens en balanced).
- Las cifras de rendimiento proceden de un único equipo (Ryzen AI Max+ 395) y de un texto de 560 tokens; no hay datos de variabilidad entre modelos de NPU ni de cargas de generación larga.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base más allá de las pruebas en japonés, inglés y Python.
- El repositorio muestra 0 descargas y 0 likes: no hay validación independiente de los resultados publicados.
- Riesgo de alucinación no documentado; al ser un modelo de 24B con ~2,4B activos, conviene evaluar en el dominio concreto antes de producción.

## Enlaces

- Kit en Hugging Face: https://huggingface.co/ryugyosoft/LFM2.5-24B-A2B-onwx-kit
- Modelo base (Liquid AI): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- README en inglés del kit: README_en.md dentro del repositorio
- Aplicación onwx: no disponible enlace en la información proporcionada
- Paper, blog o repositorio adicional del kit: no disponible
