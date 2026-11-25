# paincupid/punctuation-restoration-small

## Resumen

`punctuation-restoration-small` es un modelo de restauración de puntuación desarrollado por el usuario paincupid (publicado bajo el espacio Horizon-Labs) sobre la base de `jhu-clsp/mmBERT-small`. Su tarea es añadir puntuación a texto que carece de ella: transcripciones de ASR, subtítulos, mensajes de chat, notas de voz o texto extraído por OCR. El modelo predice, tras cada palabra, una de las marcas `.` `,` `?` `:` `-` o ninguna, en 88 idiomas y con independencia del uso de mayúsculas (incluida la salida totalmente en minúsculas típica de muchos sistemas ASR).

Con 140.643.846 parámetros (aproximadamente 140M), es la variante compacta de la familia, frente a la versión `punctuation-restoration-base` de 307M. Emplea una arquitectura ModernBERT multilingüe (mmBERT) para clasificación de tokens y se distribuye con pesos safetensors y archivos ONNX, incluido un modelo cuantizado int8 de 268 MB para CPU y navegador vía transformers.js.

Su relevancia práctica radica en que es un componente de posprocesado ligero y desplegable en entornos sin GPU, con licencia Apache-2.0 y compatibilidad directa con el paquete `deepmultilingualpunctuation`, lo que facilita su integración en pipelines de transcripción existentes sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-small) para token classification |
| Parametros totales | 140.643.846 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX int8 (`model_quantized.onnx`, 268 MB); pesos fp32; dtype q8 en transformers.js |
| Idiomas soportados | 88 idiomas (af, am, ar, az, be, bg, bn, bs, ca, ckb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, kn, ko, ky, lb, lt, lv, mk, ml, mn, mr, ms, mt, ne, nl, no, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, tg, tl, tr, tt, ug, uk, ur, uz, vi, xh, yo, zh, zu) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en `jhu-clsp/mmBERT-small`, un encoder transformer de la familia ModernBERT adaptado a multilingüismo. La cabeza de clasificación de tokens asigna a cada palabra una etiqueta entre seis clases (`0`, `.`, `,`, `?`, `-`, `:`), tomando como etiqueta de la palabra la de su último subtoken. El entrenamiento emplea los datasets `HuggingFaceFW/fineweb-2` y `HuggingFaceFW/fineweb` como fuente de texto, según los metadatos del repositorio. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles.

Entre las innovaciones destacables, el modelo incluye un script `punctuate.py` que gestiona textos largos mediante fragmentos solapados y adapta las marcas de salida a la escritura de cada idioma (por ejemplo, `，。？：` en chino y japonés sin necesidad de segmentación de palabras, `।` en hindi y bengalí, `، ؟` en escritura árabe, `;` para preguntas en griego y `። ፣` en amárico). La versión int8 de ONNX reproduce la misma etiqueta que fp32 en el 99,96 % de los tokens según el autor.

## Capacidades

- Restauración de puntuación tras cada palabra con cinco marcas posibles (`.` `,` `?` `:` `-`) o ninguna.
- Funciona con texto en mayúsculas, minúsculas o mixto, incluida la salida totalmente en minúsculas de sistemas ASR.
- Cobertura de 88 idiomas, con tratamiento específico de la puntuación en chino, japonés, hindi, bengalí, árabe, griego y amárico.
- Procesamiento de textos largos mediante fragmentos solapados a través del helper `punctuate.py`.
- Compatibilidad como reemplazo directo del paquete `deepmultilingualpunctuation` (etiquetas idénticas a `oliverguhr/fullstop-punctuation-multilang-large` y `kredor/punctuate-all`).
- Ejecución en CPU y navegador mediante ONNX y transformers.js.
- No modifica el uso de mayúsculas ni las palabras: solo inserta puntuación.

## Casos de uso

- Posprocesado de transcripciones ASR: el modelo recibe la salida en minúsculas de un sistema de reconocimiento de voz y añade puntos, comas y signos de interrogación, mejorando la legibilidad de actas de reuniones o notas de voz sin necesidad de GPU.
- Generación de subtítulos: en pipelines de vídeo, se aplica sobre el texto reconocido para segmentar y puntuar las líneas antes de exportar a SRT o VTT, con cobertura multilingüe para contenido doblado o subtitulado en 88 idiomas.
- Limpieza de texto extraído por OCR: documentos escaneados suelen perder la puntuación; el modelo la restaura antes de indexar el texto en un motor de búsqueda o en un sistema RAG.
- Normalización de mensajes de chat y foros: textos informales sin puntuación se procesan para facilitar su análisis posterior, moderación automática o resumen.
- Integración en el paquete `deepmultilingualpunctuation`: al compartir etiquetas, sustituye al modelo original en proyectos existentes cambiando únicamente el identificador del modelo, sin reescribir el código.
- Despliegue en el navegador: con transformers.js y el modelo ONNX int8 (268 MB), se puede ofrecer restauración de puntuación en una aplicación web del lado del cliente sin servidor.
- Preprocesado para traducción automática: al puntuar correctamente el texto de entrada, se mejora la segmentación de frases antes de enviarlas a un traductor neuronal.

## Benchmarks y rendimiento

Puntuación F1 micro-promediada sobre las cinco marcas, promediada entre idiomas, con el mismo protocolo para todos los modelos (texto sin `. , ? : ; ! -`, una vez con mayúsculas originales y otra en minúsculas):

| Modelo | Licencia | Idiomas | FLORES 12 UE (cased) | FLORES 12 UE (lower) | FLORES 88 (cased) | FLORES 88 (lower) | TED 25 (cased) | TED 25 (lower) | Europarl 12 (cased) | Europarl 12 (lower) |
|---|---|---|---|---|---|---|---|---|---|---|
| Este modelo (140M) | Apache-2.0 | 88 | 0.920 | 0.883 | 0.842 | 0.796 | 0.786 | 0.706 | 0.878 | 0.830 |
| punctuation-restoration-base (307M) | Apache-2.0 | 88 | 0.922 | 0.891 | 0.847 | 0.804 | 0.795 | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 140M de parámetros; el archivo ONNX int8 ocupa 268 MB y puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o RTX 3060 ejecutan el modelo con holgura, pero su uso principal está pensado para CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, navegador).
- Opciones de despliegue: transformers (pipeline `token-classification`), ONNX Runtime, transformers.js, y el paquete `deepmultilingualpunctuation` (requiere transformers 4.x, ya que la versión 5 eliminó `grouped_entities`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | F1 (FLORES 88, cased) |
|---|---|---|---|---|---|
| Este modelo | 140M | 88 | Apache-2.0 | No disponible | 0.842 |
| punctuation-restoration-base | 307M | 88 | Apache-2.0 | No disponible | 0.847 |
| oliverguhr/fullstop-punctuation-multilang-large | No disponible | Multilingüe (12 en evaluación) | No disponible | No disponible | No disponible |
| kredor/punctuate-all | No disponible | 12 | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo restaura puntuación: no corrige mayúsculas ni modifica las palabras; para texto en minúsculas que requiera capitalización hay que combinar con `multilingual-punctuation-truecase-small`.
- Los sesgos conocidos no se detallan en la información proporcionada.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto libre, pero puede insertar marcas incorrectas en contextos ambiguos o en idiomas con poca representación en el entrenamiento.
- La longitud de contexto no está documentada; los textos largos deben procesarse con el helper `punctuate.py` mediante fragmentos solapados.
- La integración con `deepmultilingualpunctuation` requiere transformers 4.x, lo que puede suponer un conflicto en entornos con la versión 5.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets de entrenamiento (`fineweb-2`, `fineweb`) para usos específicos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paincupid/punctuation-restoration-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Versión base (307M): https://huggingface.co/Horizon-Labs/punctuation-restoration-base
- Modelo de truecase: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/punctuation-restoration
- Paquete `deepmultilingualpunctuation`: https://github.com/oliverguhr/deepmultilingualpunctuation
- Modelo de referencia de etiquetas: https://huggingface.co/oliverguhr/fullstop-punctuation-multilang-large
- Modelo de referencia de etiquetas: https://huggingface.co/kredor/punctuate-all
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb
