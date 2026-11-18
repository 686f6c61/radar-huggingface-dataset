# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF es una cuantizacion en formato GGUF de un modelo derivado de la familia Qwen3.6, publicada por el desarrollador independiente LuffyTheFox bajo el paraguas de su proyecto Genesis. El modelo parte del checkpoint sin censura HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y le incorpora, segun el autor, una transferencia de datos procedente de un fine-tuning orientado a uso agentico (DJLougen/hermes-qwen3.5-35b-a3b-GGUF, entrenado sobre NousResearch/hermes-function-calling-v1), junto con su tecnica propia de "reparacion de tensores" bautizada como Genesis.

Se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 34.660 millones de parametros totales y unos 3.000 millones activos por token (de ahi el sufijo A3B), lo que lo situa en la categoria de modelos dispersos de gran capacidad pero coste de inferencia contenido. La pipeline declarada es image-text-to-text, es decir, se anuncia como multimodal con vision, y las etiquetas incluyen agentic, hermes y uncensored. La licencia es Apache 2.0 y el repositorio ocupa 131,2 GB, coherente con un conjunto amplio de cuantizaciones GGUF.

Su relevancia actual radica en tres factores: la popularidad del modelo (mas de 273.000 descargas y 732 likes en el momento de la consulta), el interes de la comunidad por variantes sin censura para experimentacion e investigacion, y la propuesta metodologica del autor, que afirma mejorar la estabilidad y el seguimiento de instrucciones reduciendo el ruido acumulado en los tensores mediante criterios estadisticos (distribucion de Marchenko-Pastur). Conviene tratar estas afirmaciones con cautela, ya que no se acompanan de evaluaciones reproducibles en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de Qwen3.6; multimodal image-text-to-text |
| Parametros totales | 34.660.610.688 (~34,66 mil millones) |
| Parametros activos | ~3 mil millones (sufijo A3B; cifra no desglosada en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples variantes en el repo de 131,2 GB; niveles concretos no detallados); incluye imatrix |
| Idiomas soportados | en, zh, multilingual (segun etiquetas); lista completa no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo orientado a llama.cpp y compatibles) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de la familia Qwen3.6 con 34,66 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. La pipeline declarada es image-text-to-text, por lo que incorpora capacidades de vision ademas de generacion de texto. El autor menciona tensores `ssm_conv1d`, lo que sugiere componentes de estado/convolucion asociados a la gestion de contexto largo, aunque la informacion disponible no detalla la arquitectura interna completa.

El proceso de construccion descrito no es un entrenamiento desde cero ni un fine-tuning convencional. El autor parte del checkpoint sin censura de HauhauCS y transfiere datos de un fine-tuning sobre el dataset Hermes (NousResearch/hermes-function-calling-v1), concretamente "alrededor de 2k bloques de dos tensores de expertos FFN". Sobre esa base aplica su metodo Genesis, que en tres etapas escanea tensores `ssm_conv1d`, reemplaza bloques degenerados y reduce ruido mediante una SVD basada en la ley de Marchenko-Pastur preservando, segun afirma, el 99% de la senal y el gradiente aprendido. Estas afirmaciones proceden unicamente de la model card y no se han validado con evaluaciones independientes en la informacion disponible. No se especifican volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y seguimiento de instrucciones, con enfasis declarado en estabilidad y claridad de contexto.
- Capacidades de vision e imagen-texto (pipeline image-text-to-text).
- Soporte de tool calling y function calling, heredado del fine-tuning sobre hermes-function-calling-v1.
- Uso agentico y razonamiento multi-paso (etiqueta agentic).
- Multilingue, con soporte confirmado de ingles y chino y etiqueta generica multilingual.
- Variante sin censura (uncensored), con 0/465 rechazos reportados en el modelo base segun el autor.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con el ecosistema GGUF/llama.cpp.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede encadenar llamadas a funciones y razonamiento multi-paso gracias al fine-tuning sobre el dataset Hermes de function calling, integrandose en frameworks de agentes que consumen endpoints compatibles.
- Asistente conversacional multi-turno: su naturaleza MoE con 3B parametros activos permite mantener conversaciones largas con un coste de inferencia contenido, adecuado para despliegues en servidores modestos.
- Procesamiento de documentos con imagenes: la pipeline image-text-to-text permite extraer y razonar sobre contenido visual, por ejemplo en digitalizacion de formularios o analisis de capturas.
- Investigacion sobre alineacion y censura: al ser una variante uncensored, sirve para estudiar comportamientos del modelo sin rechazos y comparar con la version censurada del mismo base.
- Generacion de codigo asistida en local: con cuantizacion GGUF puede ejecutarse en estaciones de trabajo sin GPU de datacenter, integrándose en editores o pipelines de CI/CD mediante llamadas a un servidor llama.cpp.
- Experimentacion con tecnicas de calibracion de tensores: el modelo es un caso de estudio del metodo Genesis, util para investigadores interesados en tecnicas de post-procesado estadistico de pesos.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local en formato GGUF, permite procesar datos sensibles sin enviarlos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo MoE de 34,66B totales en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 18-22 GB y las de 8 bits en torno a 35-40 GB, aunque estas cifras son estimaciones orientativas y no proceden de la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) podria alojar cuantizaciones de 4 bits; A100 o H100 para cuantizaciones mayores o mayor throughput.
- Cabe en GPU de consumo: probablemente en RTX 4090 y GPUs con 24 GB o mas usando cuantizaciones bajas; no confirmado en la informacion disponible.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta endpoints_compatible sugiere soporte de servidores de inferencia tipo endpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7 (este) | ~34,66B | ~3B | no disponible | Apache 2.0 | GGUF | Variante uncensored con calibracion Genesis y datos Hermes |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~34,66B | ~3B | no disponible | no disponible | safetensors/GGUF | Modelo base sin censura del que deriva |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35B | ~3B | no disponible | no disponible | GGUF | Fine-tuning Hermes usado como fuente de datos |
| Qwen3.6-35B-A3B (original) | ~34,66B | ~3B | no disponible | no disponible | safetensors | Version de referencia de la familia, con censura |

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, ilegal o inseguro; no es adecuado para produccion orientada al publico sin filtros adicionales.
- Las afirmaciones del autor sobre reduccion de ruido, estabilidad y "0/465 rechazos" no cuentan con validacion independiente en la informacion disponible.
- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas es desconocido.
- La longitud de contexto no esta documentada; no debe asumirse un valor concreto.
- El proceso de construccion (transferencia parcial de tensores y calibracion estadistica) puede introducir degradaciones no detectadas en tareas especificas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la ausencia de evaluaciones publicadas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas si se usa sin moderacion.
- El repositorio ocupa 131,2 GB, lo que exige planificacion de almacenamiento y ancho de banda para su descarga.
- Idiomas soportados no detallados mas alla de en, zh y multilingual; el rendimiento en castellano no esta verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Fine-tuning Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantizacion con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto Genesis: https://discord.gg/SZ5vacTXYf
- Distribucion de Marchenko-Pastur (referencia matematica): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
