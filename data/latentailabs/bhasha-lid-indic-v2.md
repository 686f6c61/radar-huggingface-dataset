# LatentAILabs/bhasha-lid-indic-v2

## Resumen

Bhasha LID Indic v2 (`bhasha-lid-indic-v2`) es un clasificador de tokens basado en XLM-RoBERTa-base (278M parámetros) especializado en identificación de idioma a nivel de palabra en texto code-mixed de lenguas indias. Desarrollado por LatentAILabs (Arun Prabhakaran), etiqueta cada palabra de un mensaje con su idioma de origen: hindi, bengalí, tamil, telugu, maratí, gujarati, kannada, malayo, panyabí, urdu, odia o inglés, además de las clases `name` y `other`. Es capaz de procesar tanto escritura nativa como texto romanizado ("padam semma mass") y mensajes que mezclan ambas.

El problema que resuelve es concreto: los modelos de identificación de idioma convencionales fallan sistemáticamente en texto conversacional code-mixed (hinglish, tanglish, manglish, kanglish), porque se entrenaron con texto periodístico convertido a caracteres romanos. La versión v1 de este modelo clasificaba erróneamente cerca de un tercio de las palabras del tamil hablado como telugu. La v2 corrige esto incorporando 51.071 comentarios reales de YouTube en tamil, malayo y kannada (DravidianCodeMix, CC-BY-4.0), etiquetados a nivel de palabra por un modelo open-weights (Gemma 4 26B, Apache-2.0).

La relevancia actual reside en que el code-mixing es la norma, no la excepción, en las comunicaciones digitales de la India, y los pipelines de NLP (traducción, moderación, análisis de sentimiento, TTS) necesitan separar idiomas a nivel de palabra antes de procesar. Con licencia Apache-2.0 y un tamaño contenido, es desplegable en infraestructura modesta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base), token classification |
| Parámetros totales | 277.463.822 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (XLM-RoBERTa-base soporta hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | No disponible (pesos safetensors en fp32/fp16; cuantización dinámica posible vía transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur, or, en, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens construido sobre `FacebookAI/xlm-roberta-base`, un transformer encoder con 278M parámetros. La cabeza de clasificación produce etiquetas por palabra (no por subtoken) para las 12 lenguas indicadas más `name` y `other`. El pipeline es `token-classification` y la librería `transformers`.

El entrenamiento parte de la versión v1 (que solo había visto texto tipo noticia convertido a caracteres romanos) y añade 51.071 comentarios reales de YouTube en tamil, malayo y kannada del corpus DravidianCodeMix (CC-BY-4.0), etiquetados a nivel de palabra por Gemma 4 26B (Apache-2.0). No se documenta en la model card el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF/DPO (no aplica a un clasificador). La innovación principal es el uso de datos conversacionales reales etiquetados por un LLM open-weights para corregir el sesgo de dominio de v1; el resultado es una mejora de 0,72 a 0,94 en macro-F1 sobre tamil hablado con etiquetas humanas.

## Capacidades

- Identificación de idioma a nivel de palabra en texto code-mixed (no solo a nivel de frase).
- Etiquetado de 12 lenguas: hindi, bengalí, tamil, telugu, maratí, gujarati, kannada, malayo, panyabí, urdu, odia e inglés.
- Clases adicionales `name` (nombres propios) y `other` (ruido, símbolos, palabras mixtas).
- Procesamiento de escritura nativa (devanagari, tamil, malayo, etc.) y de texto romanizado/transliterado.
- Manejo de palabras mixtas (raíz inglesa con terminación indic), que quedan fuera del cómputo de F1 pero se etiquetan.
- Detección de idioma principal de un mensaje (reportado con 0,828 de precisión sobre 425 comentarios DravidianCodeMix).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No soporta visión ni audio.

## Casos de uso

- Preprocesado para pipelines de traducción automática: antes de traducir un comentario hinglish, el modelo separa las palabras hindi de las inglesas para enrutar cada segmento al motor adecuado, evitando traducciones híbridas defectuosas.
- Moderación de contenido multilingüe: clasificar cada palabra permite aplicar filtros léxicos por idioma y detectar términos ofensivos que solo existen en una de las lenguas mezcladas.
- Análisis de sentimiento en redes sociales: separar idiomas a nivel de palabra permite usar léxicos o modelos monolingües especializados sobre el subconjunto correcto de cada mensaje.
- Normalización para TTS y ASR: identificar qué palabras están en escritura nativa y cuáles romanizadas permite aplicar reglas de pronunciación y transliteración distintas a cada segmento.
- Construcción de corpus code-mixed etiquetados: el modelo sirve como anotador automático para generar datasets de entrenamiento de otros sistemas (traducción, tagging morfológico) en dominios conversacionales.
- Enrutamiento de consultas en atención al cliente: en un chatbot que recibe mensajes mezclando inglés con lenguas indias, el modelo determina el idioma dominante y las palabras en cada lengua para seleccionar el modelo de respuesta o el agente humano adecuado.
- Investigación lingüística sobre code-switching: cuantificar la proporción de palabras por idioma en corpus de habla real (YouTube, foros) para estudios sociolingüísticos.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index y model card). Macro-F1 a nivel de palabra sobre {lengua indic, inglés}; `name`, `other` y palabras mixtas quedan fuera del cómputo. Ninguno de estos conjuntos se usó para entrenamiento, salvo donde se indica.

| Conjunto de evaluación | v1 | v2 | GlotLID v3 + léxico inglés | Mejor otro modelo publicado |
|---|---|---|---|---|
| CoLI-Dravidian 2024, tamil + inglés | 0,723 | **0,936** | 0,561 | – |
| CoLI-Dravidian 2024, malayo + inglés (no independiente para v2) | 0,911 | **0,967** | 0,680 | 0,682 (Malayalam XLM-R, Anjana2002) |
| CoLI-Dravidian 2024, kannada + inglés | 0,903 | 0,937 | 0,586 | **0,954** (distilka, ganador Kanglish 2022) |
| CoLI-Kanglish (ICON 2022), kannada + inglés | 0,840 | **0,864** | 0,494 | (distilka entrenado sobre él) |
| WoLLaI, malayo + inglés | 0,952 | **0,970** | 0,931 | 0,952 (Malayalam XLM-R) |
| COMI-LINGUA, hindi + inglés | 0,896 | **0,901** | – | 0,857 (muril-hinglish-lid) |
| Bhasha-Abhijnaanam, escritura nativa, 11 lenguas, nivel de frase | 0,9956 | 0,9950 | 0,9958 | 0,9916 (MixLID) |

Comprobaciones adicionales (reportadas, no independientes para v2):

| Comprobación | v1 | v2 | Nota |
|---|---|---|---|
| 425 comentarios DravidianCodeMix, ta / ml / kn | 0,873 / 0,888 / 0,888 | 0,968 / 0,957 / 0,939 | Misma colección que el nuevo entrenamiento (split distinto), etiquetas revisadas por LLM |
| Idioma principal de cada mensaje (mismos 425 comentarios) | 0,706 | 0,828 | GlotLID v3: 0,528 |
| LinCE hindi + inglés (dev) | 0,922 | 0,945 | Usado como comprobación de desarrollo; muril-hinglish-lid: 0,952 |
| IndicTriMix inglés + hindi + bengalí | 0,968 | 0,968 | |
| IndicTriMix inglés + hindi + gujarati | 0,678 | 0,7 (valor truncado en la información disponible) | |

Sobre CoLI Malayalam: solo el 41% de las ventanas no solapan con el entrenamiento de v2; en las ventanas limpias (939) la puntuación se mantiene (0,912 → 0,967). En CoLI Tamil, sobre 1.219 ventanas sin solapamiento de 5 palabras: 0,718 → 0,935.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,1 GB en fp32 (tamaño del repo), ~550 MB en fp16, ~300 MB en int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Para alto throughput, cualquier GPU con ≥4 GB (RTX 3060, RTX 4090, T4, A10, L4, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU con ≥2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), `optimum`/ONNX Runtime, TorchScript, y servidores de inferencia estándar (Triton, TGI con soporte de token-classification). llama.cpp/Ollama no aplican (no es un modelo generativo GGUF).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (278M, encoder), se espera latencia de milisegundos por frase en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Macro-F1 destacado | Licencia |
|---|---|---|---|---|---|
| bhasha-lid-indic-v2 | 278M | No disponible (XLM-R base) | Token classification, code-mixed indic | 0,936 (ta), 0,967 (ml), 0,937 (kn), 0,901 (hi) | Apache-2.0 |
| GlotLID v3 (por palabra + léxico inglés) | No disponible | No disponible | LID genérico adaptado a palabra | 0,561 (ta), 0,680 (ml), 0,586 (kn) | No disponible en la información |
| distilka | No disponible | No disponible | Específico Kanglish (ICON 2022) | 0,954 (kn CoLI), 0,864 en Kanglish | No declara licencia |
| Malayalam XLM-R (Anjana2002) | No disponible | No disponible | XLM-R afinado para malayo | 0,682 (ml CoLI), 0,952 (WoLLaI) | No declara licencia |
| muril-hinglish-lid | No disponible | No disponible | MuRIL para hinglish | 0,857 (COMI-LINGUA), 0,952 (LinCE dev) | No disponible en la información |

## Limitaciones y advertencias

- Sesgo de dominio: aunque v2 corrige el sesgo de v1 hacia texto periodístico, el entrenamiento se apoya en comentarios de YouTube (DravidianCodeMix) para tamil, malayo y kannada; el rendimiento en otros registros (legal, técnico, literario) no está evaluado.
- Cobertura desigual por lengua: las métricas publicadas se concentran en lenguas dravídicas (ta, ml, kn) e hindi; para bengalí, telugu, maratí, gujarati, panyabí, urdu y odia no hay resultados específicos en la información disponible.
- Riesgo de fuga de evaluación: parte de CoLI Malayalam y algo de CoLI Tamil solapan con el entrenamiento; el autor lo reconoce y reporta métricas sobre ventanas limpias, pero conviene tratarlas con cautela.
- Etiquetas de entrenamiento generadas por LLM (Gemma 4 26B): los errores del anotador pueden propagarse al modelo, especialmente en palabras ambiguas o mixtas.
- Palabras mixtas (raíz inglesa + terminación indic) quedan fuera del cómputo de F1 y su tratamiento en producción puede no ser fiable.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni conversación; solo clasifica tokens.
- Longitud de contexto no documentada en la model card; XLM-RoBERTa-base está limitado a 512 tokens, lo que restringe mensajes largos sin troceado.
- Licencia Apache-2.0 permite uso comercial, pero el corpus DravidianCodeMix es CC-BY-4.0: conviene mantener la atribución correspondiente si se redistribuyen derivados.
- El modelo se publica con `inference: false` en la model card, lo que puede indicar que el autor no ha habilitado el widget de inferencia de Hugging Face, no que el modelo no sea inferible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LatentAILabs/bhasha-lid-indic-v2
- Artículo (Towards AI): https://pub.towardsai.net/my-model-thought-tamil-was-telugu-open-source-language-id-for-hinglish-tanglish-and-kanglish-604547310cd0
- Resumen y FAQ: https://latentailabs.github.io/bhasha-language-id/
- Versión v1: https://huggingface.co/arunp0/bhasha-lid-indic
- Canal de YouTube del autor: https://www.youtube.com/@LatentAILabs
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
