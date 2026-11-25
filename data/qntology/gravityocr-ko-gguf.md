# Qntology/GravityOCR-KO-gguf

## Resumen

GravityOCR-KO es un ajuste fino por continuacion (continued fine-tuning) en coreano del modelo `trillionlabs/GravityOCR`, publicado por el usuario Qntology en formato GGUF. El modelo base es un checkpoint `GlmOcrForConditionalGeneration` orientado a OCR y comprension de documentos, y este ajuste incorpora replay de los pools de entrenamiento originales en ingles y CJK para retener las tareas de tablas y formulas. Con 672.950.784 parametros (aproximadamente 673 millones), se situa en la gama de modelos pequenos especializados, lo que facilita su despliegue en hardware modesto.

La relevancia tecnica del modelo reside en su esquema de decodificacion: conserva `ar_loss_weight: 1.0`, de modo que mantiene una ruta autorregresiva (AR) entrenada ademas de la ruta de difusion por bloques (block diffusion). Esto le permite auto-especular: la difusion genera borradores y la ruta AR los verifica, una variante de decodificacion especulativa que puede reducir el numero de pasos de generacion. El modelo se distribuye con licencia MIT y un repositorio de 3,9 GB en formato GGUF, lo que apunta a inferencia local eficiente.

No obstante, la informacion publica es escasa: la model card se marca como «internal, private», no hay resultados de benchmarks, no se detalla la composicion del dataset de ajuste ni el numero de tokens de entrenamiento, y la ficha de Hugging Face no declara el pipeline ni los idiomas de forma explicita (aunque las etiquetas indican coreano e ingles). Todo dato no confirmado se marca como «no disponible» en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ruta autorregresiva (AR) y ruta de difusion por bloques (block diffusion); clase `GlmOcrForConditionalGeneration` |
| Parametros totales | 672.950.784 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 16.384 tokens de longitud maxima de entrenamiento (`max_length=16384`); contexto de inferencia no confirmado |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en GGUF; los niveles concretos no se detallan) |
| Idiomas soportados | Coreano (ko) e ingles (en), segun las etiquetas de la model card; cobertura real no verificada |
| Licencia | MIT |
| Formato de pesos | GGUF (repositorio de 3,9 GB); el modelo base usa safetensors en `transformers` |

## Arquitectura y entrenamiento

El modelo es un checkpoint `GlmOcrForConditionalGeneration` que combina una ruta autorregresiva estandar con una ruta de difusion por bloques. Segun la model card, el entrenamiento usa un objetivo conjunto AR + block diffusion con `ar_loss_weight=1.0`, `bd_size=32` y jitter en la fase de bloques. Los limites de entrenamiento declarados son `max_length=16384`, `max_response_length=6144` y `max_vision_tokens=8192`, lo que indica soporte de entradas visuales de hasta 8.192 tokens de vision y respuestas de hasta 6.144 tokens.

El ajuste parte de la release post-GRPO de `trillionlabs/GravityOCR` (no de la base GLM-OCR) y aplica fine-tuning continuado en coreano con replay de los pools originales en ingles y CJK para preservar las tareas de tablas y formulas. No se especifica el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO mas alla del GRPO heredado del modelo base. La innovacion destacable es la auto-especulacion: la ruta de difusion produce borradores que la ruta AR verifica, lo que requiere el repositorio `nanoVLM-DiffusionOCR` (en proceso) o el parche de SGLang para servir el modelo con esta capacidad.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre documentos, con soporte declarado para coreano e ingles.
- Comprension de documentos: extraccion de contenido estructurado, incluida la retencion de tareas de tablas y formulas gracias al replay del entrenamiento original.
- Generacion autorregresiva estandar mediante `transformers>=5.8` con la clase `GlmOcrForConditionalGeneration`.
- Decodificacion auto-especulativa (borradores por difusion, verificacion AR) con el repositorio `nanoVLM-DiffusionOCR` o el parche de SGLang.
- Procesamiento de imagenes con hasta 8.192 tokens de vision por entrada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y albaranes en coreano: el modelo puede extraer campos estructurados de documentos escaneados gracias a su especializacion OCR y a la retencion de tareas de tablas, con salida en texto o JSON mediante postprocesado.
- Procesamiento de formularios administrativos: con hasta 8.192 tokens de vision por pagina, puede manejar documentos densos con tablas y campos multiples, adecuado para pipelines de back-office.
- Extraccion de formulas y tablas en documentacion tecnica: el replay de los pools originales preserva esta capacidad, util para digitalizar manuales y papers en entornos bilingues coreano-ingles.
- Despliegue local en estaciones de trabajo: con aproximadamente 673 millones de parametros y pesos GGUF, es viable en GPU de consumo para tareas de OCR por lotes sin depender de APIs externas.
- Servicio de OCR de baja latencia con SGLang: la ruta de auto-especulacion (difusion + verificacion AR) permite servir peticiones con menos pasos de generacion, adecuado para aplicaciones interactivas de escaneo.
- Preprocesado para RAG documental: convertir PDFs e imagenes en texto estructurado antes de indexar en un sistema de recuperacion, aprovechando el soporte bilingue coreano-ingles.
- Traduccion asistida de documentos escaneados: al cubrir coreano e ingles, puede transcribir documentos en un idioma y facilitar su versionado en el otro, aunque la calidad de traduccion no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 672.950.784 parametros, en bfloat16 el peso ronda los 1,3 GB; en cuantizaciones GGUF de 4-8 bits el peso se situaria aproximadamente entre 0,4 y 0,7 GB, a lo que hay que sumar la cache KV y los tokens de vision (hasta 8.192 por entrada), que elevan el consumo de forma notable.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo deberia caber en GPU de consumo con suficiente VRAM para la cache de vision, pero no hay datos oficiales de latencia ni throughput.
- Cabe en GPU de consumo: probable por numero de parametros, pero no confirmado para el peor caso de 8.192 tokens de vision.
- Opciones de despliegue: `transformers>=5.8` para decodificacion AR; SGLang con parche para auto-especulacion; el repositorio `nanoVLM-DiffusionOCR` (en proceso) para decodificacion auto-especulativa. El formato GGUF sugiere compatibilidad con runtimes de inferencia GGUF, aunque no se detalla cuales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GravityOCR-KO (este modelo) | 672.950.784 | 16.384 (entrenamiento) | OCR + comprension de documentos, AR + difusion por bloques | MIT | GGUF en Hugging Face |
| trillionlabs/GravityOCR (base) | no disponible | no disponible | OCR + comprension de documentos, AR + difusion por bloques | no disponible | Hugging Face |
| Alternativas OCR especializadas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card se etiqueta como «internal, private», lo que sugiere que el ajuste no fue concebido como release publica y puede carecer de validacion externa.
- No hay resultados de benchmarks publicados: el rendimiento real en OCR, tablas y formulas no esta verificado de forma independiente.
- La cobertura idiomatica declarada es coreano e ingles; el rendimiento en otros idiomas, incluido el espanol, no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion en la transcripcion de documentos: al ser un modelo generativo, puede producir texto plausible pero incorrecto en campos numericos, formulas o tablas; se recomienda validacion posterior en produccion.
- La decodificacion auto-especulativa requiere el repositorio `nanoVLM-DiffusionOCR` (en proceso) o el parche de SGLang; con `transformers` estandar solo se dispone de la ruta AR, con la consiguiente perdida de la ventaja de velocidad.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- La licencia MIT permite uso comercial, pero el modelo base `trillionlabs/GravityOCR` puede tener condiciones propias que conviene revisar antes de desplegar en produccion.
- El contexto de inferencia efectivo no esta confirmado; los 16.384 tokens corresponden al limite de entrenamiento, no necesariamente al maximo soportado en serving.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qntology/GravityOCR-KO-gguf
- Modelo base: https://huggingface.co/trillionlabs/GravityOCR
