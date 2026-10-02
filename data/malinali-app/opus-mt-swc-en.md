# malinali-app/opus-mt-swc-en

## Resumen

El modelo `malinali-app/opus-mt-swc-en` es un sistema de traduccion automatica neuronal (NMT) especializado en la direccion swc → en, es decir, de suajili del Congo (codigo ISO 639-3 `swc`) a ingles (codigo `en`). Lo publica el proyecto Malinali, que no entrena el modelo, sino que redistribuye los pesos de `Helsinki-NLP/opus-mt-swc-en`, el modelo original del grupo Helsinki-NLP dentro de la familia OPUS-MT, adaptados para inferencia en dispositivo (`on-device`). El modelo resuelve la traduccion de una lengua de bajos recursos, el suajili congoles, para la que existen pocos recursos NMT publicos.

Tecnicamente es un modelo Marian, la arquitectura transformer encoder-decoder de traduccion desarrollada por el equipo de Helsinki y heredera de las tesis de Marian NMT. Cuenta con 74.881.049 parametros totales (datos reales del archivo `safetensors`) y un tamano de repositorio de 0,3 GB en precision original. Es un modelo compacto, disenado para ejecucion en local. La relevancia actual radica en su naturaleza `on-device`: el paquete incluye tokenizadores rapidos en formato JSON para el motor Candle (`marian_flutter`), lo que permite integrarlo en aplicaciones moviles o de escritorio sin conexion.

El valor anadido del repositorio de Malinali respecto al modelo base es la conversion de SentencePiece a tokenizadores rapidos de Hugging Face y el empaquetado de los pesos en safetensors, listos para su despliegue con Candle. El autor declara explicitamente que no reivindica la propiedad del modelo entrenado y que la licencia debe seguirse segun la model card original de OPUS-MT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian MT) |
| Parametros totales | 74.881.049 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors) |
| Idiomas soportados | swc (suajili del Congo), en (ingles) |
| Licencia | no disponible en los metadatos; la model card remite a la del modelo base, tipicamente CC-BY 4.0 para OPUS-MT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer seq2seq de tipo encoder-decoder orientado a traduccion automatica, con tokenizacion SentencePiece por lado (tokenizador de origen y de destino independientes). El repositorio redistribuye el modelo base `Helsinki-NLP/opus-mt-swc-en`, por lo que los datos de entrenamiento y el procedimiento exacto corresponden al modelo original de Helsinki-NLP y no se detallan en la informacion disponible de este repositorio.

La contribucion de Malinali se limita al reempaquetado: convierte los tokenizadores SentencePiece originales a formato JSON de tokenizador rapido de Hugging Face y publica los pesos en safetensors para su uso con el motor Candle (`marian_flutter`). No se documentan en la informacion proporcionada detalles sobre numero de tokens de entrenamiento, composicion del dataset, ni tecnicas de ajuste como RLHF o DPO.

## Capacidades

- Traduccion de texto de suajili del Congo (swc) a ingles (en), unica direccion declarada.
- Generacion de texto mediante pipeline de `translation` y tarea `text2text-generation`.
- Ejecucion en dispositivo (on-device) mediante Candle, sin necesidad de servidor.
- Compatibilidad con la libreria `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Tokenizacion rapida lista para Hugging Face (dos tokenizadores, origen y destino).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Traduccion de documentacion humanitaria y sanitaria: el modelo puede traducir materiales de ayuda dirigidos a poblaciones de habla suajili congolesa hacia ingles, con despliegue local en zonas de baja conectividad.
- Aplicaciones moviles de traduccion sin conexion: al estar empaquetado para Candle y `marian_flutter`, permite integrar traduccion swc → en directamente en apps Android o iOS, funcionando sin red.
- Atencion al cliente en centros de contacto: traduccion de mensajes entrantes en suajili del Congo a ingles para que agentes angloparlantes los procesen, con la ventaja de poder ejecutarse on-premise y evitar enviar datos a terceros.
- Investigacion linguistica y de lenguas de bajos recursos: generacion de corpus paralelos o preprocesamiento de testimonios en `swc` para su analisis en ingles.
- Procesamiento de contenido periodistico o de redes sociales: traduccion de textos breves en suajili congoles a ingles para monitorizacion de medios y analisis de opinion.
- Pipelines de traduccion por lotes en local: dado su tamano reducido (74,88 M de parametros), puede procesar grandes volumenes de frases en CPU o GPU modesta sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 74,88 M de parametros, aproximadamente 0,3 GB en fp32, 0,15 GB en fp16 y menos de 0,1 GB en int8 (estimaciones basadas en el recuento de parametros; la precision de distribucion no esta documentada).
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1050 Ti, RTX 3060 o superiores; tambien es viable en CPU para volumentes moderados.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en hardware integrado.
- Despliegue: Candle mediante `marian_flutter` (objetivo declarado del repositorio), Hugging Face `transformers`, y potencialmente otros runners que soporten Marian con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| malinali-app/opus-mt-swc-en | 74,88 M | no disponible | swc → en | no disponible (remite al base) | safetensors |
| Helsinki-NLP/opus-mt-swc-en | no disponible | no disponible | swc → en | tipicamente CC-BY 4.0 | safetensors / PyTorch |
| NLLB-200-distilled-600M | 600 M | no disponible | multilingue (200 idiomas, incluye `swc`) | CC-BY-NC 4.0 | safetensors |
| M2M-100 (418M) | 418 M | no disponible | multilingue | MIT | safetensors / PyTorch |

Nota: los datos de parametros y licencias de NLLB y M2M-100 corresponden a informacion publica general de esos modelos; no se dispone de comparativas de rendimiento especificas entre ellos y este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de traduccion unidireccional: solo traduce de `swc` a `en`; no soporta la direccion inversa.
- Repositorio sin descargas ni interacciones registradas en el momento de la consulta, por lo que no hay validacion de la comunidad sobre su calidad.
- La licencia no aparece en los metadatos de Hugging Face; el autor remite a la model card del modelo base (tipicamente CC-BY 4.0). Antes de uso comercial es imprescindible verificar la licencia original de OPUS-MT y las condiciones de atribucion.
- Al ser una redistribucion de pesos de terceros, cualquier sesgo o limitacion del modelo base `Helsinki-NLP/opus-mt-swc-en` se hereda sin cambios.
- Riesgo de alucinacion y de errores en terminologia especifica, comun en modelos NMT pequenos y en lenguas de bajos recursos.
- No se documentan datos de entrenamiento, contexto maximo ni cobertura dialectal, lo que dificulta evaluar su robustez en produccion.
- No se especifican tipos de cuantizacion soportados ni pasos oficiales de conversion a GGUF u otros formatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/malinali-app/opus-mt-swc-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-swc-en
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Sitio del proyecto Malinali: https://malinali.app
