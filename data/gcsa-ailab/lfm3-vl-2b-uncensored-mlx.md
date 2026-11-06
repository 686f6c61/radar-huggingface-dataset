# GCSA-AiLab/LFM3-VL-2B-Uncensored-MLX

## Resumen

LFM3-VL-2B-Uncensored-MLX es una variante del modelo vision-lenguaje LiquidAI/LFM3-VL-2B, desarrollada por GCSA-AiLab, en la que se ha aplicado la tecnica de "abliteracion" (Abliterix) para reducir el comportamiento de rechazo del modelo base. El resultado es un modelo de 1.918.181.888 parametros (aproximadamente 2B) que mantiene el codificador visual y el proyector multimodal originales, pero modifica las proyecciones de atencion Q/K/V/O del backbone de lenguaje mediante direcciones de rechazo especificas por capa. Esta pensado para despliegue local y en dispositivos edge, con especial enfasis en Apple Silicon mediante MLX.

El modelo conserva la tarea image-text-to-text del original y soporta ventanas de contexto de hasta 128.000 tokens, sujetas a la configuracion de ejecucion y a la memoria disponible. Se distribuye en pesos MLX en cuatro precisiones (4-bit, 6-bit, 8-bit y BF16), lo que facilita su ejecucion en equipos con recursos limitados. La relevancia actual radica en la combinacion de capacidades multimodales, contexto largo y despliegue en hardware de consumo, con un sesgo deliberado hacia respuestas sin filtros de rechazo.

La licencia es la LFM Open License v1.0 (etiquetada como "other" en HuggingFace), y los idiomas declarados son ingles y chino. El repositorio ocupa 9,2 GB e incluye las distintas variantes de cuantizacion. Cabe senalar que el autor no ha probado la inferencia en dispositivos Apple reales, aunque si ha realizado comprobaciones de integridad tensorial y recarga estricta de arquitectura en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (lfm3_vl), con codificador visual y proyector multimodal; backbone de lenguaje modificado con Abliterix |
| Parametros totales | 1.918.181.888 (aproximadamente 2B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | hasta 128.000 tokens (sujeto a configuracion de ejecucion y memoria) |
| Tipos de cuantizacion | 4-bit, 6-bit, 8-bit (cuantizacion afin de grupo 64 en el modelo de lenguaje) y BF16 sin cuantizar; codificador visual y proyector en BF16 |
| Idiomas soportados | en, zh |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (MLX); tambien existen variantes BF16, compressed-tensors y GGUF en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje que combina un codificador visual con un proyector multimodal y un backbone de lenguaje tipo transformer. La modificacion aplicada por GCSA-AiLab es Abliterix, una tecnica de abliteracion que calcula direcciones de diferencia de medias especificas por capa a partir de 400 prompts benignos y 400 prompts objetivo, aplica proyeccion ortogonal directa y normalizacion de pesos previa a la edicion. La intervencion se limita a las proyecciones Q/K/V/O de la atencion del modelo de lenguaje, preservando intactos el codificador visual y el proyector multimodal.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. Las variantes cuantizadas son conversiones posteriores al entrenamiento (post-training conversions), no checkpoints destilados con cuantizacion consciente del entrenamiento original. El autor declara haber realizado comprobaciones de integridad tensorial y recarga estricta de arquitectura en CPU, pero no haber probado la inferencia en dispositivos Apple.

## Capacidades

- Generacion de texto e interaccion conversacional multi-turno.
- Comprension de imagenes y respuesta texto-a-partir-de-imagen (image-text-to-text).
- Razonamiento multimodal combinando contexto visual y textual.
- Ventana de contexto de hasta 128.000 tokens para documentos e imagenes extensas.
- Capacidades multilingues en ingles y chino.
- Reduccion del comportamiento de rechazo: tasa de rechazo estricto del 4% en StrongREJECT y del 8% en SimpleSafetyTests (segun el autor).
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Analisis de documentos extensos con imagenes: gracias a su contexto de hasta 128.000 tokens, el modelo puede procesar informes, contratos o articulos con figuras intercaladas en una sola pasada, extrayendo y relacionando informacion textual y visual.
- Descripcion y etiquetado automatico de imagenes en pipelines de catalogacion: el modelo genera descripciones textuales de imagenes para bases de datos de productos, archivos fotograficos o repositorios de medios.
- Asistente conversacional local en Apple Silicon: mediante MLX-VLM en versiones 0.7.11 o superiores, se puede desplegar en un Mac con chip de la serie M para conversaciones multimodales sin conexion a servicios en la nube.
- Prototipado de aplicaciones edge con restricciones de memoria: las variantes 4-bit y 6-bit permiten ejecutar el modelo en dispositivos con recursos limitados, manteniendo el codificador visual en BF16 para preservar la calidad de la representacion visual.
- Investigacion sobre alineacion y seguridad: la reduccion controlada del comportamiento de rechazo (con tasas documentadas de rechazo estricto y advertencia) lo hace util para estudiar como varian las respuestas ante prompts sensibles y como afecta la abliteracion a la calidad general.
- Generacion de respuestas sin filtros en entornos controlados: para aplicaciones de investigacion que requieran respuestas directas sobre temas que el modelo base rechazaria, con la advertencia de que la abliteracion puede degradar la calidad de respuesta.
- Evaluacion comparativa de tecnicas de abliteracion: al publicar metricas de divergencia KL (0,0426511) frente al modelo base, sirve como referencia para comparar distintas tecnicas de edicion de pesos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| Divergencia KL de siguiente token (vocabulario completo) respecto al modelo base | 0,0426511 |
| StrongREJECT, tasa de rechazo estricto | 4% |
| StrongREJECT, advertencia pero responde | 38% |
| SimpleSafetyTests, tasa de rechazo estricto | 8% |
| SimpleSafetyTests, advertencia pero responde | 56% |

Las metricas corresponden al modelo fuente en BF16; las variantes cuantizadas no han sido evaluadas por separado. La divergencia KL se calcula como la media de KL(P_base || P_modificado) en una posicion de siguiente token para cada uno de 100 prompts benignos fijos, sobre las 128.000 entradas del vocabulario, y no representa la divergencia de secuencia completa. StrongREJECT usa un subconjunto estratificado fijo de 100 elementos; SimpleSafetyTests usa los 100 casos completos. El juez es OllamaCloud `deepseek-v4.1-flash:1017`. Una respuesta que advierte pero responde sustancialmente se cuenta como respuesta, no como rechazo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 9,2 GB, incluyendo todas las variantes de precision. La variante 4-bit es la mas ligera y la BF16 la mas pesada.
- GPU recomendadas: no disponible. El modelo esta orientado a Apple Silicon mediante MLX; no se documentan GPU NVIDIA o AMD recomendadas.
- Cabe en GPU de consumo: no confirmado en la informacion disponible. El enfoque declarado es despliegue local y edge, con MLX como runtime principal.
- Opciones de despliegue: MLX-VLM (version 0.7.11 o superior) para Apple Silicon. Existen repositorios separados con formato GGUF (compatible con llama.cpp y Ollama) y BF16/compressed-tensors.
- Latencia y throughput: no disponibles. El autor no probo la inferencia en dispositivos Apple, por lo que no hay mediciones de rendimiento en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-Uncensored-MLX (este modelo) | aprox. 2B | hasta 128.000 tokens | LFM Open License v1.0 | HuggingFace, pesos MLX en 4/6/8-bit y BF16 | Variante abliterada del base, enfocada a edge |
| LiquidAI/LFM3-VL-2B (modelo base) | aprox. 2B | hasta 128.000 tokens | LFM Open License v1.0 | HuggingFace | Modelo original sin abliterar; comportamiento de rechazo estandar |
| GCSA-AiLab/LFM3-VL-2B-Uncensored | aprox. 2B | hasta 128.000 tokens | LFM Open License v1.0 | HuggingFace | Misma variante abliterada en BF16 y compressed-tensors |
| GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF | aprox. 2B | hasta 128.000 tokens | LFM Open License v1.0 | HuggingFace | Misma variante en formato GGUF para llama.cpp/Ollama |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion y la cuantizacion pueden afectar a la calidad de las respuestas; el autor recomienda evaluar el formato, el runtime y la tarea exactos antes del despliegue.
- La divergencia KL de 0,0426511 respecto al modelo base indica un cambio medible en la distribucion de siguiente token, lo que puede traducirse en degradacion de calidad en tareas sensibles.
- El modelo esta disenado para reducir rechazos, lo que implica que puede generar contenido que el modelo base rechazaria; no se documentan salvaguardas adicionales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de este tamano.
- Idiomas limitados a ingles y chino; no se garantiza un rendimiento adecuado en castellano.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de cualquier uso comercial; el autor no aclara si la modificacion cambia los terminos de uso.
- La inferencia en dispositivos Apple no fue probada por el autor; solo se realizaron comprobaciones de integridad tensorial y recarga de arquitectura en CPU.
- Las variantes cuantizadas no han sido evaluadas con las metricas de rechazo ni de divergencia KL.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines automatizados complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-MLX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante BF16 y compressed-tensors: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored
- Variante GGUF: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF
- Licencia LFM Open License v1.0: incluida en el repositorio como LICENSE
