# koodikraft/opus-mt-tr-fi-2020-04-12

## Resumen

`koodikraft/opus-mt-tr-fi-2020-04-12` es una conversion a formato Transformers/PyTorch del checkpoint Marian NMT original publicado por el proyecto OPUS-MT de la Universidad de Helsinki (Helsinki-NLP, autoría de Jörg Tiedemann) en la instantánea `opus-2020-04-12`. Se trata de un modelo de traduccion automatica neuronal especializado en el par de idiomas turco → finés, con 105.994.171 parámetros totales y un peso de repositorio de aproximadamente 0,2 GB en formato safetensors.

El modelo resuelve un problema muy concreto: la traduccion directa turco-finés sin pivotar por el inglés, algo relevante para un par de lenguas de bajos recursos y tipológicamente distantes (lenguas urálicas frente a lenguas túrquicas). Su relevancia actual es fundamentalmente de preservación y reproducibilidad: el repositorio oficial `Helsinki-NLP/opus-mt-tr-fi` en el Hub devuelve 404, y este repositorio reconstruye el checkpoint a partir del ZIP `opus-2020-04-12.zip` alojado en los servidores de CSC, añadiendo el `config.json` que el ZIP original no incluye.

La arquitectura es un transformer encoder-decoder estilo Marian, el estandar de facto de la familia OPUS-MT, con tokenizador SentencePiece compartido. La licencia CC BY 4.0 permite uso comercial con atribución, lo que lo hace utilizable en producción siempre que se respeten las condiciones de atribución a Helsinki-NLP y Jörg Tiedemann.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | 105.994.171 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | turco (tr) → finés (fi) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (conversion desde Marian NPZ) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian NMT, un transformer encoder-decoder con atención multi-cabeza estándar, diseñado específicamente para traduccion automática y entrenado con el framework Marian (C++) y posteriormente exportado. La conversión de `koodikraft` traduce los pesos NPZ originales a safetensors y añade el `config.json` necesario para cargarlo con `transformers` mediante `MarianMTModel` y `MarianTokenizer`.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del corpus paralelo, ni si se aplicaron técnicas de RLHF o fine-tuning posterior. La instantánea `2020-04-12` corresponde a los modelos OPUS-MT publicados por Helsinki-NLP en esa fecha, entrenados sobre datos paralelos agregados del proyecto OPUS. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio pipeline Marian estándar.

## Capacidades

- Traduccion automática unidireccional turco → finés.
- Generacion de texto condicionada a la tarea de traduccion (no es un modelo de propósito general).
- Manejo de frases y párrafos cortos o medianos, limitado por la longitud de contexto del tokenizador Marian (no documentada en la información disponible).
- Tokenizacion SentencePiece específica del par de idiomas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Cobertura multilingüe limitada exclusivamente al par tr → fi.

## Casos de uso

- Traduccion de documentación técnica y manuales del turco al finés: el modelo puede procesar párrafos de documentación de producto para equipos finlandeses que consumen material originalmente en turco, aprovechando la licencia CC BY 4.0 para uso interno y comercial con atribución.
- Localizacion de interfaces y cadenas de software: integrado en pipelines de CI/CD que extraen cadenas de recursos (`.po`, `.json`, `.xml`) y generan las versiones en finés, con revisión humana posterior dado el tamaño reducido del modelo.
- Traduccion de comunicaciones de atención al cliente: para organizaciones con clientes turcos que operan en Finlandia, el modelo puede pre-traducir correos y tickets antes de la revisión por agentes humanos.
- Subtitulado y transcripción asistida: traduccion de subtítulos en turco a finés para plataformas de contenido, con post-edición dado el riesgo de alucinación en frases largas.
- Investigación en traduccion de bajos recursos: como baseline reproducible para experimentos sobre pares de lenguas urálicas-túrquicas, gracias a que el checkpoint oficial está caído y este repositorio restaura el acceso.
- Preservación de artefactos: servir como copia de seguridad del modelo OPUS-MT `tr-fi` para reproducibilidad de experimentos académicos que citan la instantánea `2020-04-12`.
- Traduccion de contenido editorial y noticias: pre-traducción de artículos turcos para medios finlandeses, con revisión editorial obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 (105,99 M de parámetros), menos de 0,3 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en CPU con latencia aceptable para uso por lotes.
- Cabe en cualquier GPU de consumo: GTX 1050, RTX 2060, RTX 3060, RTX 4090, así como en iGPU modernas y en Raspberry Pi 4/5 para inferencia por CPU.
- Opciones de despliegue: `transformers` con `MarianMTModel`, `MarianTokenizer`; servible con FastAPI o TorchServe; conversión a ONNX o CTranslate2 posible aunque no publicada en el repositorio; no hay variantes GGUF ni Ollama publicadas.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera throughput alto en GPU y moderado en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `koodikraft/opus-mt-tr-fi-2020-04-12` | 105.994.171 | no disponible | tr → fi | CC BY 4.0 | Hub (este repo) |
| `Helsinki-NLP/opus-mt-tr-fi` | no disponible | no disponible | tr → fi | CC BY 4.0 | Hub (404, no disponible) |
| `Helsinki-NLP/opus-mt-tc-big-tr-fi` | no disponible | no disponible | tr → fi | CC BY 4.0 | no verificado en la información disponible |
| NLLB-200 (facebook) | hasta 54.500 M (variante 600M/1.3B/3.3B/54.5B) | no disponible | 200 idiomas | CC BY-NC 4.0 (no comercial) | Hub |

Nota: los datos de los modelos alternativos no provienen de la información proporcionada y deben verificarse en el Hub; se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce turco → finés; no soporta la dirección inversa.
- Riesgo de alucinación en frases largas o dominios especializados (legal, médico, técnico muy específico), habitual en modelos NMT de este tamaño.
- Sesgos potenciales heredados del corpus OPUS: dominios sobrerrepresentados (textos religiosos, legislativos, subtítulos) y posible infrarrepresentación de registro coloquial o variantes dialectales.
- Longitud de contexto no documentada; frases muy largas pueden truncarse o degradar la calidad.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución explícita a Helsinki-NLP / Jörg Tiedemann y al proyecto OPUS-MT.
- Repositorio de terceros: la conversión no está mantenida por el equipo original; posibles divergencias con el ZIP original no documentadas.
- Sin garantías de soporte ni actualizaciones; creado y actualizado el 2026-11-17, sin descargas ni likes registrados.
- No apto como modelo de propósito general: no genera texto libre, no razona y no ejecuta herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/koodikraft/opus-mt-tr-fi-2020-04-12
- Modelo base en el Hub: https://huggingface.co/Helsinki-NLP/opus-mt-tr-fi (devuelve 404 según la model card)
- ZIP original de OPUS-MT: https://object.pouta.csc.fi/OPUS-MT-models/tr-fi/opus-2020-04-12.zip
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Framework Marian: https://github.com/marian-nmt/marian
