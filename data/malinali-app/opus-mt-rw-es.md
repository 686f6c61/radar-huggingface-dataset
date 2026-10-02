# malinali-app/opus-mt-rw-es

## Resumen

El modelo `malinali-app/opus-mt-rw-es` es un paquete de pesos para traducción automática del kinyarwanda (rw) al español (es), publicado por el desarrollador `malinali-app` para su aplicación Malinali. No se trata de un entrenamiento desde cero: es una redistribución del modelo `Helsinki-NLP/opus-mt-rw-es` de Helsinki-NLP, convertido a `safetensors` y acompañado de tokenizadores rápidos en formato JSON para su uso con Candle a través del componente `marian_flutter`. El autor declara explícitamente que no reclama la propiedad del modelo entrenado y que su aportación se limita al reempaquetado y a la conversión de SentencePiece a tokenizador rápido de Hugging Face.

Arquitectónicamente es un modelo Marian (transformer encoder-decoder) de tipo text2text-generation, con 76.105.067 parámetros totales y un tamaño de repositorio de 0,3 GB. Su relevancia es de nicho pero clara: ofrece traducción rw→es ejecutable en dispositivo (on-device) en entornos Flutter/Rust, un escenario donde las alternativas multilingües grandes (NLLB, M2M-100) resultan demasiado pesadas. Al ser una dirección minoritaria dentro de la familia OPUS-MT, cubre un par de lenguas con recursos limitados que rara vez está soportado en herramientas comerciales.

El modelo se publicó el 2 de octubre de 2026 (fecha declarada en el repositorio) y acumula 0 descargas y 0 likes en el momento de la consulta. La licencia no figura como campo explícito en el repositorio; la model card remite a la licencia del modelo original, que el propio autor describe como «típicamente CC-BY 4.0» para OPUS-MT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, text2text-generation) |
| Parametros totales | 76.105.067 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (los modelos OPUS-MT de la familia Marian suelen limitarse a 512 tokens por segmento) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Kinyarwanda (rw) como origen, español (es) como destino |
| Licencia | No disponible en el repositorio; el autor remite a la del modelo base, descrita por él como «típicamente CC-BY 4.0» |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer de secuencia a secuencia con encoder y decoder, orientado específicamente a traducción automática. Es un modelo denso de 76 millones de parámetros, no un MoE ni una arquitectura híbrida, y la dirección de traducción es unidireccional: kinyarwanda a español. La familia a la que pertenece, OPUS-MT de Helsinki-NLP, se entrena sobre corpus paralelos agregados en el repositorio OPUS siguiendo una metodología estandarizada de entrenamiento neuronal con tokenización SentencePiece, si bien los detalles concretos del preentrenamiento y ajuste de esta variante concreta (número de tokens, composición del dataset, uso de RLHF o DPO) no se documentan en la información disponible y deben consultarse en la model card del modelo base.

La única intervención técnica documentada por el autor de este repositorio es de empaquetado: se toman los pesos originales de `Helsinki-NLP/opus-mt-rw-es`, se exportan a `safetensors` y se convierten los tokenizadores SentencePiece a JSON de tokenizador rápido de Hugging Face, dejando dos tokenizadores separados (fuente y destino) para su uso en Candle mediante `marian_flutter`. No se declara ningún reentrenamiento, fine-tuning adicional ni destilación, pese a que la etiqueta `base_model:finetune:Helsinki-NLP/opus-mt-rw-es` aparece en los tags del repositorio.

## Capacidades

- Traducción de texto de kinyarwanda a español, en modo unidireccional (no traduce en sentido inverso).
- Generación de texto condicionada a secuencia (text2text), con entrada y salida en texto plano por segmentos.
- Tokenización rápida de origen y destino mediante dos ficheros JSON independientes, requisito del runtime Candle empleado.
- Inferencia en dispositivo (on-device) dentro del ecosistema Malinali, orientado a aplicaciones Flutter.
- Compatibilidad con el pipeline `translation` de Hugging Face, según la metadata del repositorio.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo «thinking»; es un traductor especializado.
- El multilingüismo se limita estrictamente al par rw→es declarado en los idiomas soportados.

## Casos de uso

- Traducción de contenido en kinyarwanda en aplicaciones móviles: al ser un modelo de 76 millones de parámetros y 0,3 GB de repositorio, puede empaquetarse dentro de una app Flutter y ejecutarse sin conexión mediante Candle, evitando enviar texto del usuario a servidores externos.
- Atención al cliente para comunidades ruandófonas en España: traducción de consultas entrantes en kinyarwanda al español para que un agente humano pueda gestionarlas sin conocimiento del idioma, con latencia baja por el reducido tamaño del modelo.
- Traducción de documentos administrativos y de extranjería: conversión de escritos, formularios o comunicaciones oficiales redactadas en kinyarwanda para su tramitación por personal hispanohablante.
- Localización de contenidos editoriales o divulgativos: traducción asistida de artículos, folletos sanitarios o materiales educativos dirigidos a población ruandófona residente en países hispanohablantes.
- Preprocesado en pipelines de análisis de datos: normalización al español de corpus en kinyarwanda (encuestas, redes sociales, reseñas) antes de aplicarles técnicas de clasificación o análisis de sentimiento.
- Sistemas de traducción en entornos con recursos limitados: despliegue en servidores de gama baja o incluso en CPU, donde modelos multilingües de 600M a 1B parámetros como NLLB resultan inviables por coste de memoria y cómputo.
- Componente de traducción dentro de asistentes conversacionales bilingües: integrado como paso intermedio entre la captura de voz transcrita en kinyarwanda y un LLM que opera en español.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 76,1 millones de parámetros, los pesos ocupan aproximadamente 304 MB en FP32, unos 152 MB en FP16 y alrededor de 76 MB en int8. A ello hay que sumar la memoria de activaciones, modesta para secuencias cortas.
- GPU recomendadas: cualquier GPU con 2 GB de VRAM o más resulta suficiente; una NVIDIA T4, GTX 1650 o superior es más que adecuada. Una A100 o H100 solo tendría sentido para servir muchas peticiones concurrentes, no por requisitos de memoria.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier integrada moderna. También es viable en CPU y en dispositivos móviles, que es precisamente el objetivo del paquete.
- Opciones de despliegue: transformers con pipeline `translation`; Candle mediante `marian_flutter` (vía soportada oficialmente por este repositorio); servidores de inferencia compatibles con endpoints de Hugging Face, ya que el tag `endpoints_compatible` está presente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y en el caso de llama.cpp u Ollama la arquitectura Marian encoder-decoder no está entre las soportadas de forma habitual.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-rw-es | 76,1 M | rw → es | No disponible | No disponible (remite al upstream, CC-BY 4.0 según el autor) | Hugging Face, 0 descargas, 0 likes |
| Helsinki-NLP/opus-mt-rw-es | No disponible (mismo modelo base) | rw → es | No disponible | No disponible en la informacion disponible | Hugging Face (modelo original) |
| Helsinki-NLP/opus-mt-es-rw | No disponible | es → rw (direccion inversa) | No disponible | No disponible en la informacion disponible | Hugging Face |
| NLLB-200-distilled-600M | ~600 M | Multilingue (200 idiomas, incluye rw y es) | 512 tokens | CC-BY-NC 4.0 (uso comercial restringido) | Hugging Face |

La comparación cuantitativa de calidad de traducción (BLEU, chrF, COMET) entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo nuevo: no aporta mejoras de calidad sobre `Helsinki-NLP/opus-mt-rw-es`. Cualquier limitación del original se hereda íntegramente.
- La licencia no está declarada como campo en el repositorio. El autor remite a la licencia del modelo base y la describe como «típicamente CC-BY 4.0», lo que introduce incertidumbre legal para uso comercial. Conviene verificar la licencia real en el repositorio original antes de desplegarlo en producción.
- La dirección es estrictamente unidireccional (rw→es). No traduce de español a kinyarwanda.
- El kinyarwanda es una lengua de bajos recursos: es previsible una calidad inferior a la de pares con más corpus paralelo, con más errores en terminología especializada, nombres propios y expresiones idiomáticas.
- Riesgo de alucinación y de omisión de contenido: los modelos Marian pueden generar traducciones fluidas pero infieles, especialmente en segmentos largos o con ruido tipográfico.
- La longitud de contexto no está documentada en el repositorio. Los modelos OPUS-MT suelen procesar segmentos de hasta 512 tokens, por lo que textos largos deben dividirse en fragmentos, con la consiguiente pérdida de coherencia entre segmentos.
- No soporta tool calling, agentes, visión ni audio; no debe emplearse como modelo de propósito general.
- El repositorio registra 0 descargas y 0 likes, y su fecha de creación declarada (octubre de 2026) es posterior a la fecha habitual de consulta. Esto apunta a un artefacto reciente y sin validación por parte de la comunidad: no hay evidencia pública de evaluación independiente.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos eran contenido no relacionado y sin valor técnico, por lo que no se incluyen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-rw-es
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-rw-es
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados devueltos no guardaban relación con el mismo.
