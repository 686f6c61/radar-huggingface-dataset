# RemydreScarlet/plamo-3-translate-0.8b-onnx

## Resumen

plamo-3-translate-0.8b-onnx es la conversión a formato ONNX del modelo de traducción pfnet/plamo-3-translate-0.8b, desarrollado originalmente por Preferred Networks (PFN) a partir de PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Este repositorio concreto, publicado por el usuario RemydreScarlet, no modifica los pesos: es una copia en fp16 del checkpoint BF16 original, reempaquetada para su uso con Transformers.js v4 sobre onnxruntime-web.

El modelo es un LLM especializado en traducción de 890 millones de parámetros que cubre 52 idiomas, con un enfoque particular en la calidad de traducción hacia y desde el japonés. Su relevancia radica en que permite ejecutar traducción multilingüe de calidad en entornos JavaScript, incluyendo el navegador mediante WebAssembly, sin necesidad de infraestructura de servidor GPU.

La conversión incluye tres variantes de cuantización (fp16, q4f16 y q4) y resuelve problemas específicos de la exportación a ONNX, como el etiquetado del `model_type` como `qwen3` para que Transformers.js resuelva una clase decoder-only, y la conversión del vocabulario Unigram de PLaMo a `tokenizer.json` de Hugging Face con `ByteFallback`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Plamo3ForCausalLM), traza exacta en ONNX; RMSNorm personalizado con `weight+offset`, QK-norm, proyecciones QKV/gate-up fusionadas |
| Parametros totales | 890M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (ventana deslizante de 2048 en 14 de 16 capas; YaRN en las capas de atención completa) |
| Tipos de cuantizacion | fp16, q4f16 (fp16 + int4 MatMulNBits, recomendado), q4 (fp32 + int4 MatMulNBits). No se distribuyen q8/int8/uint8 por inestabilidad numérica de `DynamicQuantizeLinear` en ORT |
| Idiomas soportados | 52 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`, `onnx/model_q4f16.onnx`, `onnx/model_q4.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 16 capas con innovaciones arquitectónicas específicas: RMSNorm personalizado con desplazamiento (`weight+offset`), normalización QK, proyecciones QKV y gate-up fusionadas, ventana deslizante de 2048 tokens en 14 de las 16 capas, YaRN en las capas de atención completa y RoPE con theta por defecto de 1e4 en las capas deslizantes. La traza ONNX reproduce fielmente el forward de `Plamo3ForCausalLM`, con entradas `input_ids` y `attention_mask` (int64) y salidas `logits` más las cachés `present.{0..15}.{key,value}`; no acepta `position_ids` como entrada porque el modelo original calcula las posiciones internamente a partir de la longitud de la caché.

El modelo base fue entrenado por PFN sobre PLaMo 3 NICT y especializado en traducción. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a ONNX no altera los pesos: se trata de una copia fp16 del checkpoint BF16 original. El tokenizador es el vocabulario Unigram de PLaMo convertido a `tokenizer.json`, con decodificador `ByteFallback` para reconstruir texto UTF-8 a partir de tokens de byte.

## Capacidades

- Traducción multilingüe entre 52 idiomas, con especial atención a la calidad en pares que involucran japonés.
- Generación de texto condicionada por plantilla de chat con `target_lang` como parámetro del template.
- Soporte de códigos de idioma enriquecidos dentro del prompt, como `ja(easy)` o `zh-hans`.
- Decodificación byte-fallback que permite reconstruir caracteres fuera de vocabulario, incluyendo sílabas Hangul en generaciones ja→ko.
- Ejecución en navegador y Node.js mediante Transformers.js v4 y onnxruntime-web (WASM).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción en el navegador sin servidor: con la variante q4f16 y `device: 'wasm'`, el modelo puede ejecutarse íntegramente en el cliente para traducir texto introducido por el usuario, eliminando el coste de infraestructura y manteniendo el contenido en el dispositivo.
- Internacionalización de aplicaciones web: integración en un frontend JavaScript para traducir cadenas de interfaz o contenido generado por usuarios entre los 52 idiomas soportados, usando `apply_chat_template` con `target_lang`.
- Traducción de documentación técnica japonés-inglés: el modelo base está especializado en calidad de traducción desde y hacia japonés, lo que lo hace adecuado para localizar manuales y notas técnicas.
- Procesamiento por lotes en Node.js: uso del runtime ONNX en servidor para traducir grandes volúmenes de texto sin dependencia de frameworks Python, aprovechando la variante q4 para reducir memoria.
- Extensiones de navegador para traducción contextual: el tamaño de 890M parámetros en q4f16 permite empaquetar el modelo en una extensión y traducir páginas o selecciones bajo demanda.
- Aplicaciones de mensajería multilingüe: traducción de conversaciones en tiempo real en clientes ligeros, con la ventaja de que el modelo cubre idiomas de bajos recursos como ceb, jv, sw o tl.
- Prototipado rápido de pipelines de traducción: la disponibilidad de tres variantes ONNX permite comparar latencia y calidad entre fp16, q4f16 y q4 sin reexportar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 890M parámetros, la variante fp16 requiere aproximadamente 1,8 GB de pesos, q4f16 alrededor de 0,5-0,9 GB y q4 un rango similar con activaciones fp32.
- GPU recomendadas: no disponibles en la información proporcionada; el destino principal declarado es onnxruntime-web sobre WASM, no GPU dedicada.
- Cabe en GPU de consumo: sí, por tamaño (890M parámetros), aunque no se documentan pruebas con GPU concretas.
- Opciones de despliegue: Transformers.js v4 con onnxruntime-web (`device: 'wasm'`); también existe la versión GGUF del modelo base (pfnet/plamo-3-translate-0.8b-GGUF) y una variante FP8 (pfnet/plamo-3-translate-0.8b-FP8) publicadas por PFN.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| plamo-3-translate-0.8b-onnx (este) | 890M | No disponible | 52 | plamo-community-license | ONNX (fp16, q4f16, q4) |
| pfnet/plamo-3-translate-0.8b | 890M | No disponible | 52 | plamo-community-license | BF16 (safetensors) |
| pfnet/plamo-3-translate-0.8b-FP8 | 890M | No disponible | 52 | plamo-community-license | FP8 |
| pfnet/plamo-3-translate-0.8b-GGUF | 890M | No disponible | 52 | plamo-community-license | GGUF |

Las alternativas listadas son variantes de formato del mismo modelo base, no modelos distintos; no se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización int8 dinámica (`DynamicQuantizeLinear`) es numéricamente inestable en ORT para este grafo, con colapso del logit superior verificado frente al grafo fp32; deben usarse q4f16 o q4.
- El preprocesamiento personalizado de PLaMo (división dura en torno a dos o más espacios consecutivos o cuatro o más caracteres repetidos) no es expresable en los tokenizadores de Hugging Face, por lo que los tokens de frontera pueden diferir ligeramente en secuencias largas de espacios o caracteres repetidos.
- En Transformers.js, el tokenizador JS Unigram no implementa byte-fallback (huggingface/tokenizers.js#26), por lo que la entrada en coreano con caracteres fuera de vocabulario colapsa a `unk (0)`; es necesario expandir manualmente los caracteres OOV antes de construir el prompt.
- El `config.json` está reetiquetado como `model_type: qwen3` por compatibilidad con Transformers.js; esto puede confundir a herramientas que inspeccionen el tipo de modelo.
- Riesgo de alucinación inherente a los LLM: el modelo puede generar traducciones plausibles pero incorrectas en dominios especializados o idiomas de bajos recursos.
- Licencia plamo-community-license: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia OSI estándar.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere escasa validación comunitaria de esta conversión concreta.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Repositorio ONNX: https://huggingface.co/RemydreScarlet/plamo-3-translate-0.8b-onnx
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Licencia Plamo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Issue de byte-fallback en tokenizers.js: https://github.com/huggingface/tokenizers.js/issues/26
