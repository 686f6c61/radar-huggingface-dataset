# mkpoli/han2ids-v0.4

## Resumen

han2ids v0.4 es un modelo de visión por computador especializado en la conversión de imágenes de glifos Han (caracteres CJK) a su representación IDS (Ideographic Description Sequence), el sistema de notación que describe la estructura composicional de un carácter mediante componentes y operadores gráficos. Lo desarrolla mkpoli y se publica bajo licencia MIT. El modelo resuelve un problema muy concreto dentro del procesamiento de textos CJK: dado un recorte limpio de un glifo renderizado en tipografías Mincho o Song (serif), devuelve la secuencia IDS que describe cómo se compone ese carácter.

La arquitectura es un encoder-decoder de visión de 35,2 millones de parámetros: un ViT-S/16 como encoder y cuatro capas decodificadoras de 384 dimensiones, con entrada de 224 px y un vocabulario de 10.423 tokens de carácter. Incorpora una máscara de pila de operandos específica para la gramática IDS, lo que restringe la generación a secuencias sintácticamente válidas. La versión 0.4 continúa el trabajo de la 0.3 sobre el conjunto corregido de em-box de Noto, IPAmj y Jigmo.

Es relevante para proyectos de digitalización, OCR especializado, lexicografía y bases de datos de caracteres CJK que necesiten derivar descripciones estructurales de glifos de forma automática, algo que los OCR convencionales no ofrecen. El modelo está entrenado sobre 159.521 imágenes que cubren 95.927 caracteres Han y alcanza un 84,54 % de exactitud exacta en el conjunto de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder visión: ViT-S/16 (encoder) + 4 capas decodificadoras de 384 dim |
| Parámetros totales | 35,2 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo imagen-a-texto); vocabulario de 10.423 tokens de carácter |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Chino (zh), japonés (ja), coreano (ko) |
| Licencia | MIT (código); fuentes y etiquetas sujetas a sus propios términos (ver NOTICE.md y LICENSE) |
| Formato de pesos | PyTorch (.pt) |
| Resolución de entrada | 224 px |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | image-to-text |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder para visión. El encoder es un ViT-S/16 que procesa imágenes de glifos de 224 px; el decoder consta de cuatro capas de 384 dimensiones que generan la secuencia IDS token a token sobre un vocabulario de 10.423 caracteres. La innovación técnica destacable es la máscara de pila de operandos IDS (*IDS operand-stack mask*), que impone la gramática de la notación IDS durante la decodificación y garantiza que las secuencias generadas sean estructuralmente válidas (el conjunto de test reporta un 100 % de secuencias válidas). La decodificación por defecto es greedy; la opción `--top-k` devuelve candidatos ordenados por beam.

El entrenamiento se realizó sobre 159.521 imágenes correspondientes a 95.927 caracteres Han, renderizadas con Noto Serif CJK JP, IPAmj Mincho 006.01 y Jigmo, usando un renderizador común de em-box. Las etiquetas de referencia (*gold*) son conscientes de la fuente y provienen de `data/IDS.TXT`, `data/label-overrides.tsv` y `data/font-label-overrides.tsv`. El modelo se inicializó desde v0.3 y se entrenó durante seis épocas con AdamW (learning rate 5e-5 en el encoder, 2,5e-4 en el decoder), batch de 32 y precisión bf16. No se documenta uso de RLHF ni DPO.

## Capacidades

- Conversión de imagen de glifo Han a secuencia IDS (descripción estructural del carácter).
- Reconocimiento sobre glifos renderizados en tipografías Mincho y Song (serif) dentro de un em-box limpio.
- Cobertura de caracteres Han en contextos chino, japonés y coreano.
- Generación de candidatos alternativos ordenados mediante decodificación top-k (beam).
- Clasificación estricta de variantes regionales e IVD mediante `han2ids.status.classify` (por defecto las variantes se fusionan).
- Garantía de validez sintáctica de la secuencia IDS generada gracias a la máscara de pila de operandos.
- Interfaz de línea de comandos (`han2ids glyph.png --checkpoint ...`) para integración en pipelines.

## Casos de uso

- Digitalización y catalogación de diccionarios CJK: extraer la estructura IDS de glifos escaneados o renderizados para poblar bases de datos lexicográficas con descripciones composicionales de cada carácter.
- OCR especializado en textos CJK: complementar un OCR convencional con la estructura IDS para desambiguar caracteres visualmente similares o poco frecuentes.
- Investigación en tipografía y diseño de fuentes: analizar la composición estructural de glifos en distintas familias Mincho/Song y comparar variantes de un mismo carácter.
- Construcción de datasets de entrenamiento para modelos de lenguaje o visión CJK: generar pares imagen-IDS a escala a partir de corpus de fuentes.
- Herramientas de aprendizaje de caracteres Han: mostrar a estudiantes la descomposición estructural de un carácter a partir de una imagen del glifo.
- Normalización y control de calidad de corpus: verificar que los glifos de un documento corresponden a la estructura IDS esperada para cada carácter.
- Búsqueda por componentes: indexar caracteres por sus componentes IDS para permitir búsquedas estructurales (por ejemplo, caracteres que contengan un radical concreto).

## Benchmarks y rendimiento

Conjunto de test de 8.730 filas, disjunto del entrenamiento:

| Métrica | Resultado |
|---|---|
| Exactitud exacta (global) | 84,54 % |
| Mismo árbol estructural | 87,79 % |
| Secuencia válida | 100 % |
| Exactitud exacta — Noto Serif CJK JP | 93,32 % |
| Exactitud exacta — IPAmj Mincho | 84,63 % |
| Exactitud exacta — Jigmo | 81,80 % |

Comparación con la versión anterior: v0.3 alcanzó un 82,88 % de exactitud exacta; v0.4 mejora hasta el 84,54 %. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene solo 35,2 M de parámetros y un checkpoint de aproximadamente 0,1 GB, por lo que la inferencia es muy ligera.
- Cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso puede ejecutarse en CPU para volúmenes moderados.
- VRAM estimada: muy por debajo de 1 GB en fp32/bf16 para el modelo y un lote pequeño; no se especifica un mínimo oficial.
- Despliegue mediante PyTorch y la CLI oficial `han2ids` (instalable con `pip install git+https://github.com/mkpoli/han2ids`).
- No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única referencia interna es la versión anterior del propio modelo:

| Modelo | Parámetros | Exactitud exacta (test) | Licencia |
|---|---|---|---|
| han2ids v0.4 | 35,2 M | 84,54 % | MIT |
| han2ids v0.3 | No disponible | 82,88 % | MIT |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para glifos renderizados limpios dentro de un em-box; recortes, escaneos y tipografías Kai o sans quedan fuera de su alcance.
- Las variantes regionales e IVD se fusionan por defecto; para una clasificación estricta hay que usar `han2ids.status.classify`.
- La exactitud no es del 100 %: un 15,46 % de las filas de test no coinciden exactamente con la etiqueta de referencia, aunque el 87,79 % conserva la misma estructura de árbol.
- El modelo no es un OCR general: no reconoce texto en imágenes naturales ni glifos fuera de las tipografías Mincho/Song contempladas.
- El código es MIT, pero las fuentes y las etiquetas conservan sus propios términos; es necesario revisar `NOTICE.md` y `LICENSE` antes de un uso comercial de los datos derivados.
- No se documentan sesgos específicos ni tasas de alucinación más allá de las métricas de exactitud reportadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkpoli/han2ids-v0.4
- Repositorio de código: https://github.com/mkpoli/han2ids
- Términos de las fuentes y etiquetas: `NOTICE.md` y `LICENSE` en el repositorio del modelo
