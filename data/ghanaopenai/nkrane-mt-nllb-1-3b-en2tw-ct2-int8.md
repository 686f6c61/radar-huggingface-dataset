# ghanaopenai/nkrane-mt-nllb-1.3b-en2tw-ct2-int8

## Resumen

Nkrane-MT NLLB 1.3B English → Twi (CTranslate2 int8) es una conversion optimizada del modelo de traduccion `ghanaopenai/nkrane-mt-nllb-1.3b-en2tw`, desarrollado por GhanaOpenAI. Se trata de un fine-tuning del modelo NLLB (No Language Left Behind) de 1.300 millones de parametros, especializado en la traduccion de ingles simplificado a twi asante (una de las lenguas akan habladas en Ghana). Esta version concreta ha sido convertida al formato CTranslate2 con cuantizacion int8 para maximizar el rendimiento en inferencia sobre GPU.

El modelo resuelve un problema de baja cobertura: las lenguas africanas de bajos recursos estan infrarepresentadas en los sistemas de traduccion automatica comerciales. Al partir de NLLB, que ya incluye twi en su entrenamiento multilingue, y aplicar un fine-tuning especifico, se consigue un sistema dedicado a un par de lenguas concreto con un rendimiento optimizado.

La relevancia de esta variante radica en su enfoque de despliegue en produccion: la conversion a CTranslate2 int8 con `ct2-transformers-converter` reduce el peso del repositorio a 1,4 GB y ofrece, segun el autor, entre 33 y 38 segmentos por segundo en una NVIDIA H200, aproximadamente 1,6 veces mas rapido que la version original en bf16 con Hugging Face. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB, fine-tuning) |
| Parametros totales | 1,3 mil millones (1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | en (ingles), tw (twi asante) |
| Licencia | apache-2.0 |
| Formato de pesos | CTranslate2 (int8); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un NLLB de 1.3B parametros, una arquitectura transformer encoder-decoder disenada por Meta para traduccion automatica multilingue. Sobre esa base, GhanaOpenAI ha realizado un fine-tuning especifico para el par ingles → twi asante, dando lugar al modelo `nkrane-mt-nllb-1.3b-en2tw`. El modelo card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles.

La innovacion tecnica de esta variante es la conversion a CTranslate2 4.9.1 con cuantizacion int8, realizada mediante `ct2-transformers-converter` copiando `tokenizer.json`, `tokenizer_config.json` y `generation_config.json`. El modelo esta pensado para integrarse en la libreria `nkrane-mt`, que expone un traductor con soporte de procesamiento por lotes (batch), marcadores de sintagmas nominales entre corchetes (`preserve_markers=True`) y control de sustitucion por glosario (`skip_substitution`). Cuando se usa con `preserve_markers=True`, los sintagmas entre corchetes generados por el modelo se conservan literalmente y no se aplica sustitucion de glosario ni reranking.

## Capacidades

- Traduccion automatica de ingles a twi asante (ingles simplificado).
- Procesamiento por lotes de alta capacidad (`batch_size=256` en el ejemplo del autor).
- Gestion de marcadores de sintagmas nominales entre corchetes, que se preservan literalmente con `preserve_markers=True`.
- Control de sustitucion por glosario (`skip_substitution`) y marcado automatico opcional (`auto_mark`).
- Integracion con la libreria `nkrane-mt` mediante `NkraneMTTranslator`.
- Carga de modelos locales o desde el Hub de Hugging Face con cache automatica via `huggingface_hub`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion de documentacion tecnica y material educativo del ingles al twi: el modelo traduce texto en ingles simplificado, adecuado para guias y materiales de formacion destinados a hablantes de twi asante.
- Localizacion de interfaces y contenido web: se puede integrar en pipelines de localizacion para generar versiones en twi de menus, avisos y textos de aplicacion, con procesamiento por lotes para volumenes altos.
- Atencion al cliente en twi: traduccion de respuestas y plantillas desde el ingles para servicios dirigidos a usuarios ghaneses, aprovechando el throughput del modelo en GPU para servir peticiones concurrentes.
- Investigacion en traduccion automatica de bajas recursos: sirve como punto de partida o baseline para experimentos con lenguas akan, dado su licencia permisiva y su formato optimizado para inferencia.
- Generacion de subtitulos y transcripciones: traduccion por lotes de segmentos cortos de audio transcritos en ingles hacia twi, con la ventaja de los 33-38 segmentos por segundo en H200.
- Despliegue en produccion de bajo coste: la cuantizacion int8 y el formato CTranslate2 permiten servir el modelo en infraestructura GPU modesta con CTranslate2 como runtime, reduciendo el coste por segmento traducido.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (H200, 512 fragmentos representativos del dataset):

| Metrica | HF bf16 | CTranslate2 int8 |
|---|---|---|
| Throughput | ~21-24 segmentos/s | ~33-38 segmentos/s (~1,6x mas rapido) |
| Marcadores de corchete retenidos | 1426/1847 | 1563/1847 |

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, chrF, COMET u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,4 GB en int8; la inferencia en CTranslate2 int8 requiere aproximadamente 2-3 GB de VRAM, aunque el dato exacto no esta publicado.
- GPU recomendadas: el autor valida el rendimiento en NVIDIA H200; por el tamano del modelo, tambien es viable en A100, L40S, RTX 4090 y GPUs consumer con 8 GB o mas de VRAM.
- Cabe en GPU consumer: si, dado el tamano de 1,3B parametros en int8.
- Opciones de despliegue: CTranslate2 (runtime nativo), libreria `nkrane-mt`; el modelo base puede servirse con Hugging Face Transformers en bf16.
- Latencia y throughput: 33-38 segmentos/s en H200 con CTranslate2 int8 (dato del autor); no se publican latencias para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nkrane-mt-nllb-1.3b-en2tw-ct2-int8 (este) | 1,3B | en → tw | CTranslate2 int8 | Apache 2.0 | Optimizado para H200, ~1,6x mas rapido que bf16 |
| ghanaopenai/nkrane-mt-nllb-1.3b-en2tw | 1,3B | en → tw | safetensors (bf16) | Apache 2.0 | Modelo base del que deriva esta conversion |
| NLLB-200 (1.3B, Meta) | 1,3B | 200 idiomas (incluye tw) | safetensors | CC-BY-NC 4.0 | Multilingue general; no especializado en twi |
| No disponible | - | - | - | - | No se dispone de otros modelos comparables documentados en la informacion proporcionada |

## Limitaciones y advertencias

- Solo traduce en la direccion ingles → twi asante; no se documenta la direccion inversa.
- El autor indica que el modelo trabaja con "ingles simplificado"; textos complejos o muy tecnicos pueden degradar la calidad.
- No se publican metricas de calidad de traduccion (BLEU, chrF, COMET), por lo que la calidad real no esta cuantificada de forma independiente.
- Riesgo de alucinacion y de traducciones inexactas inherente a los modelos NLLB de 1,3B, especialmente en terminologia especializada o nombres propios.
- El comportamiento con marcadores de corchete depende de la configuracion (`preserve_markers`, `skip_substitution`); un uso incorrecto puede alterar la salida.
- La longitud de contexto no esta documentada; no se recomienda asumir ventanas largas sin verificacion.
- Sesgos: no se documentan evaluaciones de sesgo para twi asante; el modelo hereda los sesgos del corpus de entrenamiento de NLLB.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene revisar las condiciones del modelo base NLLB de Meta si se redistribuye o modifica.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghanaopenai/nkrane-mt-nllb-1.3b-en2tw-ct2-int8
- Modelo base: https://huggingface.co/ghanaopenai/nkrane-mt-nllb-1.3b-en2tw
- Organizacion GhanaOpenAI: https://huggingface.co/ghanaopenai
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- NLLB-200 (Meta): https://huggingface.co/facebook/nllb-200-1.3B
