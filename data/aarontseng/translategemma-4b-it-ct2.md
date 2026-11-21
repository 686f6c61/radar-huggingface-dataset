# aarontseng/translategemma-4b-it-ct2

## Resumen

translategemma-4b-it-ct2 es una conversión al formato CTranslate2 del modelo google/translategemma-4b-it, una variante de Gemma 3 de 4.000 millones de parámetros especializada en traducción automática. El autor de la conversión es el usuario aarontseng, mientras que el modelo original procede de Google. El objetivo de esta versión es ofrecer una alternativa optimizada para inferencia con CTranslate2, con cuantización int8_bfloat16 aplicada durante la conversión, lo que reduce el peso del repositorio a 3,9 GB y permite ejecución eficiente tanto en CPU como en GPU.

La relevancia de esta ficha radica en que CTranslate2 es un runtime de inferencia ampliamente utilizado en pipelines de traducción de producción (por ejemplo, en servidores de traducción con requisitos de latencia bajos). Al estar basado en Gemma 3, el modelo hereda la arquitectura transformer de la familia Gemma y la licencia Gemma de Google, que impone restricciones de uso comercial.

La información pública disponible es muy limitada: el repositorio no incluye datos sobre idiomas soportados, benchmarks ni detalles del entrenamiento del modelo base. Esta ficha se limita a documentar lo que consta en la model card y en los metadatos de Hugging Face, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, segun el modelo base google/translategemma-4b-it) |
| Parametros totales | 4.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8_bfloat16 (aplicada en la conversion con CTranslate2 4.9.0) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | CTranslate2 (repositorio de 3,9 GB) |

## Arquitectura y entrenamiento

El modelo original google/translategemma-4b-it es una variante de Gemma 3 orientada a traducción, con 4.000 millones de parámetros y arquitectura transformer decoder-only. Esta conversión mantiene la arquitectura intacta y solo transforma los pesos al formato CTranslate2 mediante `TransformersConverter` de la versión 4.9.0, aplicando cuantización `int8_bfloat16`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La innovación técnica de esta versión es exclusivamente de despliegue: CTranslate2 permite inferencia optimizada con gestión de memoria eficiente, soporte de beam search y ejecución en CPU con cuantización int8. La model card advierte que en CPU puede que `compute_type="int8_bfloat16"` no sea eficiente y recomienda usar `default`, `auto` o `int8`; los pesos en disco permanecen en `int8_bfloat16`.

## Capacidades

- Traducción automática entre pares de idiomas especificados mediante `source_lang_code` y `target_lang_code` en el mensaje de chat (el ejemplo de la model card usa en → zh-TW).
- Generación de texto condicionada por plantilla de chat (`apply_chat_template`) con rol de usuario y contenido estructurado.
- Ejecución en CPU y GPU mediante CTranslate2, con `generate_batch` para procesamiento por lotes.
- Control de longitud de salida (`max_length`) y búsqueda por haz (`beam_size`), con parada en el token `<end_of_turn>`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Traducción por lotes en servidores sin GPU: CTranslate2 con `compute_type="default"` o `int8` permite desplegar el modelo en CPU para traducir grandes volúmenes de texto con un consumo de memoria contenido (repositorio de 3,9 GB).
- Servicio de traducción de baja latencia en GPU: con `compute_type="int8_bfloat16"` en hardware con soporte BF16, `beam_size=1` y `max_length` ajustado, se puede servir traducción interactiva en un endpoint HTTP.
- Localización de documentación técnica: el formato de mensajes con códigos de idioma origen y destino facilita integrar el modelo en pipelines de localización automatizada que procesan ficheros Markdown o HTML por segmentos.
- Traducción de subtítulos o diálogos: la plantilla de chat y el control de longitud permiten generar traducciones de segmentos cortos con parada en `<end_of_turn>`, adecuado para flujos de post-edición.
- Pre-traducción en herramientas CAT: integrado vía CTranslate2 en un servidor de memoria de traducción, el modelo puede generar borradores que el traductor humano revisa, reduciendo coste por palabra.
- Traducción multilingüe en aplicaciones móviles o edge: al poder ejecutarse en CPU con cuantización int8, es viable en dispositivos con recursos limitados, siempre que se verifiquen los pares de idiomas soportados.
- Evaluación comparativa de runtimes: sirve como referencia para medir latencia y throughput de CTranslate2 frente a otros runtimes (vLLM, TGI) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 3,9 GB en disco con cuantización int8_bfloat16, por lo que en GPU se puede estimar un consumo de memoria del orden de 4-6 GB incluyendo overhead de runtime y caché KV, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponibles; la model card solo indica que en GPU con soporte BF16 se puede usar `compute_type="int8_bfloat16"`.
- Compatibilidad con GPU de consumo: probable en tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3060/4060 en adelante) si la estimación anterior es correcta, pero no verificado.
- Opciones de despliegue: CTranslate2 (librería `ctranslate2` 4.9.0 o superior) con `ctranslate2.Generator`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aarontseng/translategemma-4b-it-ct2 | ~4.000 M | no disponible | CTranslate2 (int8_bfloat16) | Gemma | Hugging Face, 0 descargas |
| google/translategemma-4b-it | ~4.000 M | no disponible | safetensors (formato original de Transformers) | Gemma | Hugging Face (modelo base) |
| Otros modelos de traducción de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La información pública es mínima: no hay lista de idiomas soportados, benchmarks ni detalles de entrenamiento, lo que impide garantizar calidad en pares de idiomas concretos sin evaluarlos previamente.
- La licencia Gemma de Google impone restricciones y obligaciones específicas para uso comercial; es necesario revisar los términos de la licencia Gemma antes de desplegar en producción.
- La cuantización int8_bfloat16 puede degradar ligeramente la calidad de traducción respecto al modelo original en bfloat16; no se han publicado evaluaciones al respecto.
- En CPU, `compute_type="int8_bfloat16"` puede no ser eficiente; la model card recomienda `default`, `auto` o `int8`, lo que puede afectar al rendimiento real.
- Riesgo de alucinación y de traducciones incorrectas en textos ambiguos, técnicos o con jerga; se recomienda post-edición humana en dominios sensibles.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse que las herede del modelo base sin verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aarontseng/translategemma-4b-it-ct2
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- Documentación de CTranslate2: https://opennmt.net/CTranslate2/
