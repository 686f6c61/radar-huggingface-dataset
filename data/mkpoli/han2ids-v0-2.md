# mkpoli/han2ids-v0.2

## Resumen

han2ids v0.2 es un modelo de visión por computador especializado en la conversión de imágenes de glifos Han (caracteres CJK) a secuencias de descripción ideográfica (IDS, *Ideographic Description Sequence*), es decir, representaciones estructurales del tipo `⿰𠤕⿱龴疋` que descomponen un carácter en sus componentes y su disposición espacial. Lo desarrolla mkpoli y se distribuye con licencia MIT a través de Hugging Face, con un tamaño de repositorio de 0,1 GB y un total de 35,2 millones de parámetros.

El modelo resuelve un problema muy concreto dentro del procesamiento de textos CJK: obtener la estructura composicional de un carácter a partir de su representación visual, algo relevante para tareas de indexación, búsqueda por componentes, normalización y análisis filológico de textos en chino, japonés y coreano. Su alcance está deliberadamente acotado a tipografías serif de estilo Mincho y Song (宋体), quedando fuera de distribución las fuentes Kai, la escritura manual y las tipografías sans.

Es relevante ahora porque la versión 0.2 mejora sustancialmente la precisión de la anterior (82,62 % de IDS exactos frente a 74,27 % de v0.1) y porque garantiza el 100 % de IDS sintácticamente válidos gracias a una decodificación restringida por la pila de operandos IDS. Se trata de una herramienta de nicho, no de un modelo de lenguaje general, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ViT-S/16 (224×224) + decoder transformer de 4 capas con cross-attention |
| Parametros totales | 35,2 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada: una imagen de glifo; salida: secuencia de hasta 48 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh), japonés (ja), coreano (ko) |
| Licencia | MIT (código); fuentes y etiquetas sujetas a sus propias licencias |
| Formato de pesos | State dict de PyTorch (`.pt`) con `itos` y `args` |

## Arquitectura y entrenamiento

El modelo combina un encoder ViT-S/16 preentrenado en ImageNet-21k (`vit_small_patch16_224.augreg_in21k_ft_in1k`), que recibe la imagen del glifo en 224×224 en escala de grises replicada a tres canales, con un decoder transformer de cuatro capas, anchura 384, seis cabezas y cross-attention. El vocabulario de salida es a nivel de carácter, con 10.442 tokens y una longitud máxima de 48. La decodificación es greedy y está restringida por la pila de operandos IDS, lo que garantiza que toda salida sea sintácticamente válida.

El entrenamiento parte del dataset BabelStone IDS (dominio público), con 97.680 registros Han, de los cuales 95.927 tienen secuencia utilizable y fuente asociada. Se generaron 176.960 imágenes a partir de Noto Serif CJK JP (29.847), IPAmj Mincho 006.01 (52.518) y la familia Jigmo (97.680). El entrenamiento se realizó durante cuatro épocas con batch de 32; el encoder parte de pesos de ImageNet-21k y el decoder se entrena desde cero. No se documenta uso de RLHF ni DPO, lo cual es coherente con la naturaleza supervisada de la tarea.

## Capacidades

- Lectura de secuencias IDS a partir de una imagen de glifo Han en tipografías Mincho y Song.
- Salida de secuencias como `⿰𠤕⿱龴疋`, con garantía de validez sintáctica del 100 %.
- Decodificación con alternativas mediante beam search (`--top-k`), útil para revisión manual.
- Salida en JSON para integración en pipelines.
- Cobertura multilingüe de etiquetas CJK (chino, japonés, coreano) bajo convención regional japonesa.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje.
- No procesa documentos completos ni páginas escaneadas: la entrada es un único glifo recortado.

## Casos de uso

- Indexación y búsqueda por componentes: dado un glifo, obtener su IDS permite construir índices que permitan buscar caracteres por radical o componente estructural, útil en diccionarios y bases de datos lexicográficas.
- Normalización de textos CJK: convertir representaciones visuales de caracteres en descripciones estructurales canónicas para unificar variantes tipográficas en corpus digitalizados.
- Análisis filológico y paleográfico: descomponer caracteres en sus constituyentes para estudios de evolución de formas y comparación entre tradiciones (china, japonesa, coreana).
- Enriquecimiento de datasets de OCR: como etapa posterior a un OCR de caracteres, generar la estructura IDS para validar o desambiguar caracteres visualmente similares.
- Catalogación de fuentes tipográficas: extraer automáticamente la estructura de glifos en colecciones de fuentes Mincho/Song para documentación y control de calidad.
- Herramientas educativas de aprendizaje de kanji/hanzi: mostrar la descomposición estructural de un carácter a partir de una imagen, apoyando la enseñanza de componentes y radicales.
- Investigación en representación de caracteres: generar pares imagen–IDS para entrenar o evaluar otros modelos de visión sobre escritura CJK.

## Benchmarks y rendimiento

El split de test de v0.2 comprende 8.730 imágenes sobre 4.752 caracteres, mezclando Noto Serif CJK JP, IPAmj Mincho y la familia Jigmo.

| Modelo / fuente | IDS exacto | IDS válido |
|---|---:|---:|
| han2ids v0.2 (global) | 82,62 % | 100 % |
| han2ids v0.2 — Noto Serif CJK JP | 92,22 % | — |
| han2ids v0.2 — IPAmj Mincho | 82,89 % | — |
| han2ids v0.2 — Jigmo family | 79,55 % | — |
| han2ids v0.1 (mismas filas) | 74,27 % | — |

La puntuación emplea etiquetas de región japonesa y cuatro overrides específicos de imagen; con las etiquetas sin corregir de BabelStone el resultado es 82,45 %. Los cuatro overrides y la revisión de 79 caracteres 争/爭 se documentan en la auditoría de etiquetas del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 35,2 M de parámetros en fp32 el checkpoint ocupa del orden de 140 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia puntual. Cualquier GPU consumer (GTX 1060 o superior, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en entornos sin GPU.
- Opciones de despliegue: el paquete oficial `han2ids` (instalable vía `pip install git+https://github.com/mkpoli/han2ids`) con CLI `han2ids glyph.png --checkpoint ...`; integración programática mediante `han2ids.infer.Han2IDS` cargando el state dict `.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| han2ids v0.2 | 35,2 M | Imagen de glifo → IDS | Salida de hasta 48 tokens | MIT | Hugging Face |
| han2ids v0.1 | No disponible | Imagen de glifo → IDS | No disponible | MIT | Hugging Face |
| Modelos OCR CJK generales | No disponible | Imagen de texto → texto | No disponible | Variable | Variable |

No se dispone de comparativas publicadas frente a otros modelos de la misma categoría (conversión imagen→IDS) en la información proporcionada. La única comparación directa documentada es con la versión anterior del propio modelo.

## Limitaciones y advertencias

- Entrenado únicamente con renders limpios de glifos en caja (em-box); recortes ajustados, escaneos, pesos inusuales y tipografías Kai o sans quedan fuera de la distribución de entrenamiento.
- No es un modelo de OCR de documentos: la CLI prueba cuatro colocaciones de recorte, pero no está pensado para páginas escaneadas.
- Componentes variantes sin punto de código IDS (por ejemplo, un 隹 con una horizontal menos) no pueden nombrarse con el vocabulario del modelo.
- Riesgo de error en caracteres poco frecuentes o con estructuras ambiguas; el 82,62 % de exactitud implica que aproximadamente uno de cada seis glifos no se reproduce exactamente.
- Las etiquetas siguen convención regional japonesa, lo que puede introducir discrepancias respecto a convenciones chinas o coreanas en caracteres con variantes.
- La licencia del código es MIT, pero el checkpoint deriva de renders de fuentes con sus propias licencias (SIL OFL 1.1 para Noto Serif CJK JP, IPA Font License 1.0 para IPAmj Mincho, CC0 1.0 para Jigmo); deben revisarse `NOTICE.md` y `LICENSE` antes de uso comercial.
- No apto para tareas de lenguaje natural, razonamiento, código o agentes; su uso fuera de la conversión imagen→IDS no está soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkpoli/han2ids-v0.2
- Versión anterior: https://huggingface.co/mkpoli/han2ids-v0.1
- Repositorio del proyecto: https://github.com/mkpoli/han2ids
- Galería de capacidades v0.2: https://raw.githubusercontent.com/mkpoli/han2ids/main/docs/gallery-v0.2-cover.png
- Auditoría de etiquetas: https://github.com/mkpoli/han2ids/blob/main/docs/label-audit.md
- Especificación IDS de Unicode (capítulo 18): https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-18/
