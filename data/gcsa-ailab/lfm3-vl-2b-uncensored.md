# GCSA-AiLab/LFM3-VL-2B-Uncensored

## Resumen

LFM3-VL-2B-Uncensored es un modelo vision-lenguaje de 1.918.181.888 parametros (aproximadamente 2B) desarrollado por GCSA-AiLab como un fine-tune del modelo LiquidAI/LFM3-VL-2B. Se trata de una modificacion realizada con la tecnica Abliterix, que reduce el comportamiento de rechazo (refusal) del modelo base mediante la proyeccion ortogonal de direcciones de rechazo especificas por capa en las proyecciones de atencion Q/K/V/O del backbone de lenguaje, manteniendo intactos el codificador visual y el proyector multimodal.

El modelo resuelve el problema de los rechazos excesivos en tareas benignas, orientandose a despliegues locales y en dispositivos edge. Conserva la capacidad de procesar entradas de texto e imagen (pipeline image-text-to-text) y soporta una longitud de contexto de hasta 128.000 tokens, sujeta a la configuracion del runtime y a la memoria disponible. Su relevancia actual radica en la demanda de modelos pequenos, multimodales y sin censura excesiva para prototipado local en hardware de consumo.

El repositorio incluye el modelo en BF16 y variantes cuantizadas en FP8, Int8 (W8A16), Int4 (W4A16) y NVFP4 (NVFP4A16), todas ellas mediante compressed-tensors, con el codificador visual y el proyector multimodal en BF16. Se distribuye bajo la LFM Open License v1.0 y soporta los idiomas ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (lfm3_vl) con codificador visual y proyector multimodal; backbone de lenguaje modificado con Abliterix |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128.000 tokens, sujeta a configuracion del runtime y memoria disponible |
| Tipos de cuantizacion | BF16, FP8 (activacion dinamica), Int8 W8A16 (group size 128), Int4 W4A16 (group size 128), NVFP4 NVFP4A16 (group size 16) |
| Idiomas soportados | en, zh |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | safetensors (BF16 y variantes compressed-tensors); GGUF y MLX en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje que combina un codificador visual con un proyector multimodal y un backbone de lenguaje tipo transformer. La modificacion Abliterix actua exclusivamente sobre las proyecciones de atencion Q/K/V/O del backbone de lenguaje, aplicando direcciones de rechazo especificas por capa. El proceso emplea direcciones de diferencia de medias calculadas a partir de 400 prompts benignos y 400 prompts objetivo, proyeccion ortogonal directa y normalizacion de pesos previa a la edicion. El codificador visual y el proyector multimodal permanecen sin modificar en BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La evaluacion publicada mide la divergencia KL de siguiente token sobre 100 prompts benignos fijos (valor 0.0426511), lo que cuantifica el desplazamiento respecto al modelo base, aunque no constituye una divergencia de secuencia completa. Las variantes cuantizadas no han sido evaluadas por separado con estas metricas.

## Capacidades

- Generacion de texto e interpretacion de imagenes (image-text-to-text) con conversacion multi-turno.
- Razonamiento y respuesta conversacional en ingles y chino.
- Procesamiento de contexto largo de hasta 128.000 tokens.
- Reduccion del comportamiento de rechazo: tasa de rechazo estricto del 4% en StrongREJECT y del 8% en SimpleSafetyTests (modelo BF16).
- Capacidad de responder con advertencia sin rechazar: 38% en StrongREJECT y 56% en SimpleSafetyTests.
- Despliegue en dispositivos edge gracias a su tamano de aproximadamente 2B parametros y a las variantes cuantizadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional local con imagenes: el modelo puede mantener dialogos multi-turno que combinan texto e imagenes en equipos de sobremesa, gracias a su tamano de aproximadamente 2B parametros y a las variantes Int4/Int8 que reducen el consumo de memoria.
- Analisis de documentos escaneados en el edge: permite extraer y describir contenido de imagenes de documentos en dispositivos con recursos limitados, manteniendo el codificador visual en BF16 para preservar la calidad de la representacion visual.
- Prototipado de aplicaciones multimodales sin censura excesiva: util para investigacion sobre alineacion y comportamiento de rechazo, donde se necesita un modelo que responda a prompts benignos sin bloqueos innecesarios, con una tasa de rechazo estricto del 4% en StrongREJECT.
- Procesamiento de contexto largo en local: con hasta 128.000 tokens de contexto, puede emplearse para resumir o consultar conversaciones e imagenes extensas en entornos sin conexion.
- Despliegue en hardware de consumo: las variantes NVFP4 e Int4 permiten ejecutar el modelo en GPUs de gama media para tareas de descripcion de imagenes y respuesta a preguntas visuales.
- Evaluacion comparativa de tecnicas de abliteration: sirve como referencia para medir el impacto de Abliterix en la calidad del modelo mediante la metrica KL publicada (0.0426511) frente al modelo base.
- Aplicaciones multilingues en ingles y chino: adecuado para asistentes visuales en这两个 idiomas, aunque no cubre otros idiomas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| KL de siguiente token (vocabulario completo) respecto al modelo base | 0.0426511 |
| StrongREJECT, tasa de rechazo estricto | 4% |
| StrongREJECT, advertencia respondiendo igualmente | 38% |
| SimpleSafetyTests, tasa de rechazo estricto | 8% |
| SimpleSafetyTests, advertencia respondiendo igualmente | 56% |

Las metricas corresponden al modelo BF16; las variantes cuantizadas no han sido evaluadas por separado. StrongREJECT emplea un subconjunto estratificado fijo de 100 items y SimpleSafetyTests los 100 casos completos. El juez es OllamaCloud `deepseek-v4.1-flash:1017`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4 GB solo para los pesos (1.918.181.888 parametros x 2 bytes), mas overhead de activaciones, cache KV y codificador visual; el repositorio ocupa 13,1 GB por incluir todas las variantes.
- VRAM estimada en Int8 (W8A16): aproximadamente 2 GB para los pesos, mas overhead.
- VRAM estimada en Int4 (W4A16): aproximadamente 1 GB para los pesos, mas overhead.
- VRAM estimada en NVFP4 (NVFP4A16): inferior a 1 GB para los pesos, mas overhead.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores en cuantizaciones bajas.
- Despliegue: Transformers para BF16; las variantes cuantizadas requieren soporte compatible de LFM3-VL compressed-tensors. Existen repositorios GGUF y MLX para otros backends.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-Uncensored | 1.918.181.888 | 128.000 tokens | en, zh | LFM Open License v1.0 | Fine-tune Abliterix del LFM3-VL-2B |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | no disponible | no disponible | Modelo base sin modificacion de rechazo |
| Otras alternativas de ~2B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La modificacion Abliterix y la cuantizacion pueden afectar a la calidad de las respuestas; se recomienda evaluar el formato, el runtime y la tarea exactos antes del despliegue.
- Riesgo de alucinacion inherente a modelos de aproximadamente 2B parametros; no se han publicado metricas de fidelidad factual.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Soporte limitado a ingles y chino; no cubre castellano ni otros idiomas.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de un despliegue en produccion.
- La reduccion del comportamiento de rechazo implica que el modelo puede responder a solicitudes que otros modelos rechazarian; debe acompanarse de filtros y politicas de seguridad propias en produccion.
- Las variantes cuantizadas no han sido evaluadas con las metricas publicadas; su comportamiento puede diferir del BF16.
- El contexto de 128.000 tokens esta sujeto a la configuracion del runtime y a la memoria disponible, por lo que no es garantizable en todos los entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante GGUF: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF
- Variante MLX: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-MLX
- README en chino simplificado: README_zh-CN.md (en el repositorio)
- README en chino tradicional: README_zh-Hant.md (en el repositorio)
- Licencia: LICENSE (en el repositorio)
