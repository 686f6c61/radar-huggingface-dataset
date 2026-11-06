# Horizon-Labs/multilingual-ncii-guard-base

## Resumen

Multilingual NCII Guard (base) es un clasificador de texto encoder-only desarrollado por Horizon-Labs, pensado para detectar peticiones a editores de imagen por IA que intentan generar imágenes íntimas no consentidas (NCII, por sus siglas en inglés). El modelo lee únicamente el texto de la instrucción y devuelve una etiqueta binaria (`ncii` o `safe`) con una puntuación de confianza, lo que permite filtrar antes de ejecutar cualquier edición.

Está construido sobre `jhu-clsp/mmBERT-base`, un transformer tipo ModernBERT multilingüe, y cuenta con 307.531.778 parámetros totales en formato safetensors, con un repositorio de 3,1 GB que incluye pesos en fp32, cuantizaciones int8 y ficheros ONNX para CPU y navegador. La ventana de contexto no está documentada en la información disponible, aunque por herencia de la familia ModernBERT se trata de un encoder orientado a secuencias cortas de texto.

Su relevancia actual radica en la cobertura multilingüe (70 idiomas) y en su latencia, suficiente para ejecutarse como pre-filtro en cada petición de edición, además de una licencia Apache-2.0 que facilita su integración comercial. No es un clasificador de CSAM ni analiza imágenes: solo texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT / mmBERT) |
| Parámetros totales | 307.531.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32, int8 (embeddings), ONNX cuantizado (`model_quantized.onnx`, 641 MB), dtype q8 en transformers.js |
| Idiomas soportados | 70 idiomas (entre ellos spa, eng, deu, fra, por, ita, zho, jpn, ara, hin, rus, tur, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder de la familia ModernBERT adaptado a multilingüismo. Sobre esa base se ha realizado un ajuste fino para clasificación binaria de texto con etiquetas `0 = safe` y `1 = ncii`, manteniendo la misma convención que `hfmlsoc/ncii-guard-v02` para que el código existente que comprueba `label == "ncii"` funcione sin cambios. El tokenizador incluye un normalizador embebido en `tokenizer.json` que elimina caracteres invisibles y de ancho cero, y pliega letras de ancho completo antes de la tokenización.

El conjunto de entrenamiento no está descrito en detalle en la información disponible (número de tokens, composición exacta y si hubo RLHF/DPO no se especifican). Sí se documenta el conjunto de evaluación: 12.910 peticiones reservadas en 70 idiomas, de las cuales unas 10.500 son instrucciones cortas de edición generadas por Qwen3.8-27B en múltiples estilos (directo, jerga, eufemismos, excusas) y 2.450 son instrucciones reales en inglés procedentes de MagicBrush y OmniEdit. Todas las etiquetas fueron asignadas por un juez independiente, Gemma-4-31B, de una familia distinta a la del generador. El autor advierte que el modelo se entrenó con etiquetas del mismo juez, por lo que la evaluación favorece a este modelo frente a los de hfmlsoc, que usan sus propias etiquetas y son solo en inglés. Se menciona además una aumentación de entrenamiento con trucos de ofuscación (por ejemplo, letras cirílicas homóglifas), aunque no se detalla su alcance completo.

## Capacidades

- Clasificación binaria de texto: devuelve `ncii` o `safe` con puntuación de confianza para instrucciones de edición de imagen.
- Detección de peticiones de desnudado, ropa transparente, ropa interior, sexualización de cuerpo o pose, o intercambio de cara sobre cuerpo desnudo.
- Multilingüe: 70 idiomas, incluidos español, inglés, alemán, francés, portugués, italiano, chino, japonés, árabe, hindi, ruso y turco.
- Robustez ante ofuscación: normalización de caracteres invisibles, de ancho cero y homóglifos de otros alfabetos.
- Distinción de peticiones parecidas legítimas: "strip the varnish", "remove the watermark", "put a jacket on him", "change her dress to red" se clasifican como `safe`.
- Inferencia en CPU y en navegador mediante ONNX y transformers.js.
- No realiza generación de texto, tool calling, razonamiento multi-paso ni análisis de imágenes.

## Casos de uso

- Moderación previa en editores de imagen por IA: cada petición de texto se clasifica antes de invocar el modelo de difusión; si la etiqueta es `ncii`, se bloquea o se envía a revisión humana. Adecuado por su latencia y por la cuantización int8.
- Pasarela de seguridad en plataformas de edición fotográfica: integrar el clasificador como guardrail en la capa de API para proteger a los usuarios frente a usos abusivos de herramientas de retoque.
- Filtrado multilingüe en productos globales: al cubrir 70 idiomas, permite aplicar la misma política en mercados donde un clasificador solo en inglés tendría recall muy bajo (F1 de 0,398 en los modelos hfmlsoc fuera del inglés).
- Pre-filtro en pipelines de generación aumentada: combinar la clasificación de texto con comprobaciones a nivel de imagen para construir una defensa en profundidad.
- Investigación en trust & safety: usar el modelo como etiquetador de referencia en estudios sobre peticiones abusivas a editores generativos, con la cautela de que el juez de etiquetas fue Gemma-4-31B.
- Despliegue en el navegador con transformers.js: ejecutar la clasificación en cliente antes de enviar la petición al servidor, reduciendo coste y exposición de datos.
- Enrutado de casos dudosos: usar el umbral configurable (0,3 / 0,5 / 0,7 / 0,9) para derivar peticiones de baja confianza a revisión humana o a un modelo mayor.

## Benchmarks y rendimiento

Evaluación sobre 12.910 peticiones reservadas en 70 idiomas, umbral 0,5. El autor advierte que el conjunto de test favorece a este modelo por compartir juez con el entrenamiento.

| Modelo | Licencia | Idiomas | F1 inglés | F1 otros 69 idiomas | Falsos positivos, ediciones parecidas | Falsos positivos, instrucciones reales |
|---|---|---|---|---|---|---|
| **este modelo** (308M) | Apache-2.0 | 70 | 0,937 | 0,904 | 2,1% | 0,5% |
| hfmlsoc/ncii-guard-v02 (270M) | no indicada | inglés | 0,662 | 0,398 | 2,8% | 0,2% |
| hfmlsoc/ncii-light-guard-v01 (270M) | MIT | inglés | 0,681 | 0,546 | 6,6% | 0,0% |

Barrido de umbral (este modelo, 70 idiomas):

| Umbral | Precisión | Recall | F1 | Falsos positivos, parecidas | Falsos positivos, reales |
|---|---|---|---|---|---|
| 0,3 | 0,863 | 0,941 | 0,900 | 4,0% | 0,7% |
| 0,5 | 0,901 | 0,911 | 0,906 | 2,1% | 0,5% |
| 0,7 | 0,929 | 0,873 | 0,900 | 0,9% | 0,2% |
| 0,9 | 0,963 | 0,776 | 0,859 | 0,1% | 0,1% |

Ofuscación (proporción de peticiones NCII en inglés aún detectadas a umbral 0,5; las filas marcadas con asterisco usan los mismos trucos que la aumentación de entrenamiento y no son test independiente):

| Reescritura | este modelo | ncii-guard-v02 | ncii-light-guard-v01 |
|---|---|---|---|
| limpia (sin ofuscación) | 0,884 | 0,495 | 0,514 |
| letras cirílicas homóglifas * | 0,875 | 0,495 | no disponible |

La información disponible no incluye resultados de MMLU, HumanEval, GSM8K ni benchmarks generalistas, ya que el modelo es un clasificador y no un generador.

## Requisitos de hardware

- VRAM estimada: inferior a 1,5 GB en fp32 para los 308M de parámetros; unos 641 MB para la versión ONNX int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090, RTX 3090, RTX 4060 y similares son sobredimensionadas para este modelo.
- Cabe en GPU de consumo e incluso en CPU y en el navegador.
- Opciones de despliegue: transformers (pipeline de text-classification), transformers.js con `dtype: "q8"`, ONNX Runtime, Text Embeddings Inference (etiqueta `text-embeddings-inference` en el repo), endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que es "suficientemente rápido para ejecutarse antes de cada edición".

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | F1 (inglés / otros) | Licencia | Formato |
|---|---|---|---|---|---|
| **multilingual-ncii-guard-base** | 308M | 70 | 0,937 / 0,904 | Apache-2.0 | safetensors, ONNX |
| hfmlsoc/ncii-guard-v02 | 270M | inglés | 0,662 / 0,398 | no indicada | no disponible |
| hfmlsoc/ncii-light-guard-v01 | 270M | inglés | 0,681 / 0,546 | MIT | no disponible |

Los modelos hfmlsoc son precisos en inglés (precisión 0,95 / 0,96) pero solo detectan el 51% / 53% de las peticiones que el juez de este modelo etiqueta como NCII; sus propias tarjetas reportan F1 de 0,86-0,89 en su conjunto de test en inglés.

## Limitaciones y advertencias

- Cubre solo adultos: los datos de entrenamiento excluyeron peticiones que pudieran involucrar a menores. No es un clasificador de CSAM; debe combinarse con herramientas específicas de seguridad infantil.
- Solo analiza texto: no inspecciona la imagen subida ni la generada, por lo que necesita comprobaciones de seguridad a nivel de imagen.
- Es un pre-filtro, no una prueba de intención: peticiones sobre bañadores, fitness o arte pueden ser legítimas; se recomienda elegir umbral según el producto y mantener revisión humana y vía de apelación.
- El conjunto de test comparte juez (Gemma-4-31B) con el entrenamiento, lo que favorece al modelo frente a alternativas evaluadas con otras etiquetas.
- Riesgo de falsos positivos en ediciones parecidas: 2,1% en peticiones tipo "look-alike" y 0,5% en instrucciones reales al umbral 0,5.
- Riesgo de falsos negativos ante ofuscación no cubierta por la aumentación: la fila de letras cirílicas está marcada como no independiente.
- El normalizador está embebido en `tokenizer.json`; cargar el tokenizador desde otro repositorio lo pierde y degrada la detección de ofuscación.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no representados en el test.
- Sin datos publicados sobre sesgos por idioma, latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-ncii-guard-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo de referencia hfmlsoc/ncii-guard-v02: https://huggingface.co/hfmlsoc/ncii-guard-v02
- Modelo de referencia hfmlsoc/ncii-light-guard-v01: https://huggingface.co/hfmlsoc/ncii-light-guard-v01
- Otro guardrail de Horizon-Labs (groundedness): https://huggingface.co/Horizon-Labs/hallucination-guard-base
- Estadísticas del autor: https://openmodelstats.com/owners/horizon-labs
