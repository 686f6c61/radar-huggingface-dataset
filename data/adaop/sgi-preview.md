# Adaop/SGI-Preview

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65.000 millones de parametros desarrollado por Ricursive Intelligence (publicado en Hugging Face bajo el identificador `Adaop/SGI-Preview`). Se trata de un Transformer denso entrenado desde cero sobre 12 billones de tokens de texto y codigo, predominantemente en ingles, con una longitud de contexto que alcanza hasta 1M de tokens en las etapas finales del entrenamiento. El modelo se presenta como una alternativa a los grandes modelos MoE de otros laboratorios, apostando por una arquitectura densa modernizada que reduce la complejidad de infraestructura de entrenamiento e inferencia.

La relevancia del modelo reside en su rendimiento en tareas de codificacion agentica para su tamano: obtiene 80,52 en TerminalBench 2.1, superando segun el autor a modelos abiertos estadounidenses mucho mayores como Reflection Beam 501B (80,1), Meta Muse Spark Open 816B (76,4), Thinking Machines Inkling 975B (63,8) y NVIDIA Nemotron 3 Ultra 550B (56,4). Con 65B de parametros totales, el modelo cabe en hardware de consumo como una NVIDIA DGX Spark, y se distribuye en BF16 y NVFP4.

El lanzamiento es una "Preview" con postentrenamiento relativamente ligero centrado en codificacion agentica. Junto al modelo instruct se publica un checkpoint base (pretrain-only) y una version NVFP4. La licencia es Apache 2.0, lo que facilita su uso comercial y su experimentacion local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N), thin-and-deep, con atencion SWA/global, gated attention, global NoPE y value residuals |
| Parametros totales | 64.782.689.360 (aprox. 65B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 1M tokens (entrenado con secuencias de hasta 2M en etapas de long context) |
| Tipos de cuantizacion | BF16 y NVFP4 (checkpoints oficiales); no se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | predominantemente ingles (corpus de texto y codigo); no se detalla lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, tag `ricursive`) |

## Arquitectura y entrenamiento

Ripple-65B es un Transformer denso con proporcion "thin-and-deep": `d_model` de 5120 y 80 capas totales. Migra desde una arquitectura tipo Llama (la base Olmo 3) hacia una arquitectura tipo Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Para reforzar el razonamiento, sobredimensiona el numero de cabezas de atencion, aumenta la proporcion de capas SWA frente a globales y reduce la ventana SWA para compensar el coste. Anade ademas clipping de activaciones en la FFN, gated attention, NoPE global y value residuals. El entrenamiento se realizo con sharding simple, sin kernels personalizados y sin cuantizacion (BF16), manteniendo un MFU del 40% durante preentrenamiento y postentrenamiento.

El preentrenamiento se hizo desde cero sobre 12 billones de tokens (texto y codigo, predominantemente ingles) con secuencias de 8K y un batch que escala de 1408 a 3072. El postentrenamiento sigue un pipeline estandar: midtraining (200B tokens, 64K de secuencia), long context (6,5B tokens, 2M de secuencia), SFT (183B tokens, 128K), long context SFT (13,5B tokens, 2M) y RL mixto por dominios (700 pasos, 128K, batch 2048). El modelo base es un checkpoint solo de preentrenamiento, sin midtraining ni datos QA sinteticos. Segun el autor, la escalera de modelos Ripple v1 mejora la eficiencia de computo (CE) en codigo 16x respecto a la de Olmo 3, llegando a 55x en la ejecucion completa.

## Capacidades

- Generacion de texto y razonamiento general, con especial enfasis en tareas de razonamiento y agenticas.
- Codificacion agentica: resolucion de tareas en terminal y entornos de desarrollo (TerminalBench 2.1, SWE-bench Pro v2.0 Hard, DeepSWE 1.1).
- Razonamiento multi-paso y uso de herramientas en flujos de agente.
- Contexto largo de hasta 1M tokens, con etapas de entrenamiento especificas para long context.
- Capacidad multilingue limitada: el corpus es predominantemente ingles, sin lista detallada de idiomas.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.
- No se detalla soporte nativo de function calling mas alla del uso agentico descrito.

## Casos de uso

- Agentes de codificacion autonomos: el modelo puede ejecutar tareas en terminal y entornos de desarrollo, con buen rendimiento en TerminalBench 2.1 y SWE-bench Pro v2.0 Hard, lo que lo hace adecuado para pipelines de resolucion automatica de incidencias.
- Revision y refactorizacion de codigo en repositorios grandes: gracias al contexto de hasta 1M tokens, puede cargar modulos extensos y mantener coherencia entre archivos en una sola pasada.
- Asistente de desarrollo integrado en IDE o CI/CD: su capacidad agentica permite encadenar pasos (leer, editar, ejecutar tests) en flujos automatizados.
- Despliegue local en estaciones de trabajo: con 65B parametros y checkpoint NVFP4, cabe en hardware como NVIDIA DGX Spark, habilitando entornos de desarrollo con privacidad de datos.
- Analisis de documentacion tecnica y generacion de codigo a partir de especificaciones largas, aprovechando la ventana de contexto extendida.
- Investigacion en eficiencia de entrenamiento e inferencia: al ser un modelo denso con receta reproducible (sin kernels personalizados, BF16), sirve como base para estudios de escalado y comparativas frente a MoE.

## Benchmarks y rendimiento

| Benchmark | Ripple-65B Preview | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 56,4 | 63,8 | 76,4 | 80,1 |

El autor indica que los resultados se obtuvieron a precision BF16 completa y con maximo esfuerzo. Para TerminalBench 2.1 se uso el harness Terminus 2 con secuencia de 128K y summarization; para SWE-bench Pro v2.0 Hard y DeepSWE 1.1 se uso Terminus 2; en el resto OpenCode. La tabla de benchmarks proporcionada en la model card esta truncada y no incluye el resto de filas ni los resultados de SWE-bench, DeepSWE u otras evaluaciones. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 130 GB de pesos (129,6 GB de repo), por lo que requiere al menos 140-160 GB de VRAM para inferencia con margen. Con NVFP4, el peso se reduce aproximadamente a un cuarto del tamaño BF16, permitiendo despliegue en GPUs de 40-80 GB.
- GPU recomendadas: 2xB200 para el throughput declarado de 250 tok/s (batch=8); tambien cabe en NVIDIA DGX Spark segun el autor; para BF16 se requieren A100/H100 de 80 GB en configuracion multi-GPU.
- Cabe en GPU de consumo: en BF16 no; en NVFP4 puede caber en GPUs de gama alta con suficiente memoria, aunque el autor lo situa en DGX Spark (hardware compacto).
- Opciones de despliegue: al usar `custom_code` y formato safetensors, requiere cargar con `trust_remote_code`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 250 tok/s en 2xB200 con batch=8, antes de cuantizacion o kernels personalizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 65B (denso) | hasta 1M | 80,52 | Apache 2.0 | Hugging Face |
| Reflection Beam 501B | 501B | no disponible | 80,1 | no disponible | no disponible |
| Muse Spark Open 816B | 816B | no disponible | 76,4 | no disponible | no disponible |
| Inkling 975B | 975B | no disponible | 63,8 | no disponible | no disponible |
| Nemotron 3 Ultra 550B | 550B | no disponible | 56,4 | no disponible | no disponible |

La comparativa se limita a los datos aportados por el autor en la model card. No se dispone de informacion sobre contexto, licencia ni disponibilidad de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una version "Preview" con postentrenamiento ligero centrado en codificacion agentica; su rendimiento en otros dominios puede ser inferior.
- Corpus predominantemente en ingles: el rendimiento en castellano y otros idiomas no esta evaluado y probablemente sea limitado.
- Riesgo de alucinacion inherente a modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos no documentados: no se publica informacion sobre sesgos conocidos ni sobre la composicion detallada del dataset.
- Los benchmarks son autodeclarados por el autor y algunos se obtuvieron con harness propios (OpenCode, Terminus 2); la propia model card advierte de la dificultad de replicar evaluaciones agenticas modernas.
- El modelo requiere `trust_remote_code` por el tag `custom_code` y el codigo `ricursive`; conviene auditar el codigo antes de desplegarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la condicion de "Preview" y la ausencia de garantias deben tenerse en cuenta para produccion.
- La tabla de benchmarks de la model card esta incompleta en la informacion disponible; no se pueden verificar resultados de SWE-bench ni DeepSWE.

## Enlaces

- Hugging Face: https://huggingface.co/Adaop/SGI-Preview
- BF16 (repo del autor): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
