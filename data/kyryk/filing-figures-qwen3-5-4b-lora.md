# kyryk/filing-figures-qwen3.5-4b-lora

## Resumen

FilingFigures Qwen3.5-4B es un adaptador LoRA de tipo PEFT publicado por el usuario kyryk (Nathan Kyryk) que especializa el modelo base Qwen/Qwen3.5-4B en la extracción estructurada de seis cifras financieras a partir de informes 10-K de la SEC. El adaptador transforma la salida del modelo en un objeto JSON con ingresos, beneficio neto, beneficio por acción diluido, activos totales, acciones en circulación y flujo de caja operativo, evitando que el usuario tenga que diseñar prompts o postprocesar texto libre.

La relevancia del modelo es acotada pero clara: resuelve una tarea de extracción de información muy concreta (XBRL-adyacente pero sobre texto del filing) con una precisión reportada del 98,4% de cifras correctas en bf16 sobre un conjunto de test de 207 filings de 36 empresas, frente al 95,4% del modelo base sin ajuste. Se entrenó con LoRA en bf16 sobre un único RTX 5090 en 44 minutos, lo que lo convierte en un ejemplo reproducible de ajuste fino eficiente para dominios regulados.

El adaptador se distribuye con licencia Apache 2.0, ocupa 0,1 GB en el repositorio y está pensado para fusionarse con el checkpoint base antes de servirse con vLLM. El autor publica además una variante cuantizada a NVFP4 y el código completo del pipeline de entrenamiento, evaluación y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B con capas híbridas |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base Qwen3.5-4B no detalla parámetros en la información proporcionada) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 12.288 tokens en la configuración de servicio recomendada (`--max-model-len 12288`) |
| Tipos de cuantizacion | bf16 (adaptador y fusión); variante NVFP4 publicada aparte |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); fusión en safetensors para vLLM |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con α=32 y dropout 0 sobre las proyecciones de atención y MLP del modelo de lenguaje de Qwen3.5-4B. El autor indica explícitamente que Unsloth desaconseja QLoRA de 4 bits para Qwen3.5, por lo que el entrenamiento se hizo en bf16 con Unsloth + TRL. La tasa de aprendizaje fue 2e-4, con lotes de 16 filings por paso y cálculo de pérdida únicamente sobre los tokens de respuesta, excluyendo los campos en blanco no puntuados.

El conjunto de entrenamiento consta de 940 filings 10-K de empresas del S&P 500 no financieras, correspondientes a 2019–2024, procedentes del dataset kyryk/filing-figures. El checkpoint publicado corresponde al paso 30 de 177 (media época): los seis checkpoints evaluados obtuvieron un 100% en validación, por lo que se conservó el más temprano. El entrenamiento completo de 3 épocas consumió 44 minutos en una RTX 5090 con un pico de 10,4 GiB de VRAM. Una innovación operativa destacable es el script `figures merge`, que escribe W + (α/r)·B·A en una copia del checkpoint base para que vLLM lo sirva como un modelo normal; el autor señala que el LoRA en tiempo de ejecución de vLLM no se aplicó correctamente a las capas híbridas de Qwen3.5 en sus pruebas.

## Capacidades

- Extracción estructurada de seis cifras financieras (ingresos, beneficio neto, BPA diluido, activos totales, acciones en circulación y flujo de caja operativo) en formato JSON a partir de texto de informes 10-K.
- Generación de texto conversacional heredada del modelo base Qwen3.5-4B.
- Procesamiento de documentos largos gracias a la ventana de 12.288 tokens configurada en el servicio recomendado.
- Ejecución con el modo de pensamiento desactivado (`enable_thinking: false`) en la plantilla de chat, tal como se usó en la evaluación.
- Especialización en inglés; no se reporta soporte multilingüe para la tarea de extracción.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Extracción automatizada de cifras de 10-K en pipelines de análisis fundamental: el adaptador recibe el texto del filing construido por `src/filing_figures/inputs.py` y devuelve JSON con las seis métricas, eliminando el parseo de texto libre y reduciendo errores de formato en la ingesta.
- Normalización de datos financieros para bases de datos internas: al fijar un esquema JSON constante, los resultados se pueden cargar directamente en tablas sin capa de postprocesado, lo que simplifica la reconciliación entre ejercicios.
- Auditoría y control de calidad de extracciones XBRL: el modelo sirve como segunda opinión sobre cifras ya etiquetadas, y sus errores residuales (definiciones de "Sales and other operating revenues" frente a ingresos totales) ayudan a detectar discrepancias de definición en el pipeline existente.
- Procesamiento por lotes a bajo coste: la variante NVFP4 reporta 0,07 USD por cada 1.000 filings, adecuada para cubrir universos amplios de empresas en tareas de research cuantitativo.
- Prototipado rápido de productos fintech: al ser un adaptador de 0,1 GB sobre un base de 4B, se puede fusionar y desplegar en una sola GPU consumer o en una instancia pequeña de vLLM para validar un MVP de extracción de métricas.
- Reproducción de experimentos de ajuste fino: el repositorio de código incluye entrenamiento, evaluación y fusión, por lo que sirve como plantilla para adaptar el mismo esquema a otros formularios regulatorios (10-Q, 8-K) o a otros idiomas partiendo de Qwen3.5-4B.
- Enriquecimiento de datasets de investigación: permite generar etiquetas estructuradas sobre corpus históricos de 10-K de 2019–2024 para estudios académicos o de modelado financiero.

## Benchmarks y rendimiento

Conjunto de test de kyryk/filing-figures: 207 filings de 36 empresas, 1.186 cifras, una sola ejecución.

| Modelo | Cifras correctas | Filings con las 6 correctas |
|---|---|---|
| Qwen3.5-4B sin ajuste | 95,4% | 83% |
| Qwen3.5-4B + este adaptador (bf16) | 98,4% | 91% |
| Mismo modelo cuantizado a NVFP4 | 98,8% | 93% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM de entrenamiento: 10,4 GiB de pico con LoRA en bf16, lote de 16 filings, en una RTX 5090.
- VRAM de inferencia: no disponible de forma explícita; como referencia, el adaptador ocupa 0,1 GB y debe fusionarse con el checkpoint base de 4B, por lo que el consumo vendrá determinado por el peso del modelo fusionado y la cuantización elegida.
- GPU recomendadas: RTX 5090 para entrenamiento según el autor; para servicio, cualquier GPU con memoria suficiente para el modelo fusionado, incluyendo consumer de gama alta y GPUs de datacenter (A100, H100) si se requiere mayor concurrencia.
- Despliegue: vLLM con `--max-model-len 12288 --language-model-only --default-chat-template-kwargs '{"enable_thinking": false}'` tras ejecutar `figures merge`. El LoRA en tiempo de ejecución de vLLM no funcionó con las capas híbridas de Qwen3.5 en las pruebas del autor.
- Latencia y throughput: no disponibles en la información proporcionada. El coste reportado para la variante NVFP4 es de 0,07 USD por 1.000 filings.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FilingFigures Qwen3.5-4B (este) | Adaptador sobre base de 4B | 12.288 tokens | Extracción de 6 cifras de 10-K | Apache 2.0 | HuggingFace + GitHub |
| Qwen3.5-4B sin ajuste | 4B (base) | no disponible | Propósito general | no disponible en la información | HuggingFace (Qwen) |
| FilingFigures Qwen3.5-4B NVFP4 | Adaptador sobre base de 4B | 12.288 tokens | Igual, cuantizado para servicio | Apache 2.0 | HuggingFace |

No se dispone de datos sobre otros adaptadores comparables de extracción de 10-K en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con 10-K de empresas no financieras del S&P 500 de 2019–2024; el rendimiento fuera de ese universo (empresas financieras, mercados no estadounidenses, ejercicios anteriores o posteriores) no está validado.
- Los errores residuales en test son mayoritariamente de definición: confusión entre "Sales and other operating revenues" e ingresos totales, y entre beneficio neto antes y después de dividendos preferentes.
- Solo soporta inglés; no hay evidencia de generalización a otros idiomas.
- Requiere el prompt de entrenamiento exacto (mensaje de sistema en `src/filing_figures/prompts.py` y construcción de entrada en `src/filing_figures/inputs.py`); desviarse de ese formato puede degradar la precisión.
- El LoRA en tiempo de ejecución de vLLM no se aplicó a las capas híbridas de Qwen3.5 en las pruebas del autor, por lo que es necesario fusionar los pesos antes de servir.
- Riesgo de alucinación no cuantificado en la información disponible; la evaluación se limita a la coincidencia de cifras, no a la fidelidad del razonamiento intermedio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyryk/filing-figures-qwen3.5-4b-lora
- Variante cuantizada NVFP4: https://huggingface.co/kyryk/filing-figures-qwen3.5-4b-nvfp4
- Dataset: https://huggingface.co/datasets/kyryk/filing-figures
- Código, prompt y resultados: https://github.com/nathankyryk/filing-figures
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
