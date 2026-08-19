# janakhpon/mon_tokenizer

## Resumen

El modelo `janakhpon/mon_tokenizer` es un tokenizer Unigram diseñado específicamente para las lenguas Mon (`mnw`), Birmano (`my`) e Inglés (`en`), con soporte completo de byte fallback. Lo desarrolla el autor janakhpon, con el objetivo de ofrecer una tokenización fiable para lenguas de baja recursos que, como el Mon, se mezclan frecuentmente con birmano e inglés en textos reales. Su relevancia radica en que aborda un problema concreto: la segmentación de sílabas birmanas y la preservación de caracteres fuera del vocabulario mediante bytes, algo crítico para aplicaciones de OCR y procesamiento de corpus.

El tokenizer tiene un vocabulario de 64.256 piezas y se entrenó sobre un corpus de 893.936 líneas (85,8 millones de caracteres). No es un modelo de lenguaje, sino un componente de preprocesamiento que puede integrarse en pipelines de NLP o usarse de forma independiente. Incluye normalización integrada en `tokenizer.json` y garantiza un round-trip del 100% en todos los estratos evaluados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unigram |
| Parametros totales | No aplica (tokenizer, sin pesos de red neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Mon (`mnw`), Birmano (`my`), Inglés (`en`) |
| Licencia | mit-code-corpus-derived-artifact |
| Formato de pesos | `tokenizer.json` (también disponible como paquete Python `mon-tokenizer`) |

## Arquitectura y entrenamiento

El tokenizer emplea el algoritmo Unigram, que modela la probabilidad de cada segmentación y permite elegir la más probable. Se entrenó sobre el split de entrenamiento de un corpus de 893.936 líneas y 85,8 millones de caracteres, y se evaluó sobre el split de validación completo. La elección de Unigram frente a BPE se justifica porque, a igual tamaño de vocabulario, BPE comprime mejor (+6,2% en Mon, +25,8% en inglés) pero parte las sílabas birmanas 2,5 veces más a menudo, lo que resulta perjudicial para tareas de OCR donde la sílaba es la unidad perceptiva.

El modelo incluye un normalizador almacenado dentro de `tokenizer.json` que elimina caracteres invisibles, pliega separadores de espacio Unicode a `U+0020` y aplica normalización NFC. También incorpora byte fallback con los 256 tokens `<0xNN>`, lo que garantiza que cualquier carácter fuera del vocabulario se represente mediante bytes en lugar de perderse. Los tokens especiales tienen ids reales: `<unk>`=0, `<s>`=1, `</s>`=2, `<pad>`=3.

## Capacidades

- Tokenización de texto en Mon, Birmano e Inglés con alta fidelidad (round-trip del 100% en validación).
- Byte fallback completo para cualquier otro script (tailandés, emoji, IPA, CJK, etc.) sin pérdida de información.
- Normalización integrada (eliminación de caracteres invisibles, plegado de espacios, NFC) que viaja con el modelo.
- Medición de violaciones de sílabas mediante un segmentador específico para birmano, no basado en grafemas Unicode.
- Soporte de tokens especiales estándar (`<unk>`, `<s>`, `</s>`, `<pad>`) con ids asignados.
- Disponible como paquete Python independiente (`mon-tokenizer`) sin dependencia de `transformers`.

## Casos de uso

- Procesamiento de corpus para lenguas birmanas: el tokenizer permite segmentar grandes volúmenes de texto Mon y Birmano para entrenar modelos de lenguaje o construir recursos lingüísticos, con una compresión eficiente (4,686 chars/token en Mon).
- Pipelines de OCR: al preservar todos los caracteres mediante byte fallback, evita la pérdida silenciosa de contenido en salidas de OCR, donde caracteres fuera del vocabulario podrían eliminarse sin aviso.
- Normalización de texto multilingüe: su normalizador integrado (NFC, plegado de espacios) estandariza entradas mixtas (Mon, Birmano, Inglés) antes de cualquier otro procesamiento.
- Integración con modelos transformer: puede usarse con `AutoTokenizer` de Hugging Face para tokenizar entradas en modelos de lenguaje multilingües o específicos de birmano.
- Aplicaciones de traducción automática: al manejar la mezcla constante de Mon con Birmano e Inglés, facilita la preparación de datos para sistemas de traducción.
- Herramientas de análisis lingüístico: su medición de violaciones de sílabas y su alta precisión en la segmentación lo hacen útil para estudios fonológicos o morfológicos del Mon y el Birmano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No obstante, la model card incluye métricas de tokenización sobre el split de validación completo, que se resumen a continuación:

| Estrato | chars/token | tokens/línea | violaciones de sílaba | round-trip | tokens de byte fallback |
|---|---|---|---|---|---|
| Mon | 4.686 | 16.4 | 1.07% (n=492.469) | 100% | 20 / 486.631 |
| Birmano | 4.117 | 13.9 | 0.93% (n=25.546) | 100% | 0 / 24.942 |
| Inglés | 4.112 | 34.6 | — (n=0) | 100% | 96 / 453.350 |
| Script mixto | 3.804 | 24.6 | 0.81% (n=28.133) | 100% | 116 / 59.440 |

Además, el 98,74% de los caracteres distintos del split de validación Mon son tokens individuales (392 de 397). Los cinco restantes (una diéresis combinante, una pi griega, dos letras sinhala y un emoji) se representan mediante byte fallback con uno a cuatro tokens.

## Requisitos de hardware

- No requiere GPU ni hardware especializado: es un tokenizer que se ejecuta en CPU.
- Memoria mínima: el vocabulario de 64.256 piezas ocupa unos pocos megabytes.
- Se puede ejecutar en cualquier entorno Python (3.8+ recomendado) con o sin la librería `transformers`.
- Opciones de despliegue: integración directa en scripts Python, uso como paquete independiente (`pip install mon-tokenizer`) o mediante `AutoTokenizer` de Hugging Face.
- Latencia: al ser una operación de segmentación pura, el throughput es muy alto (miles de tokens por segundo en CPU moderna).

## Comparativa con modelos similares

No se dispone de información sobre tokenizers alternativos específicos para Mon o Birmano en las fuentes consultadas. La comparativa queda pendiente de datos públicos adicionales.

## Limitaciones y advertencias

- El tokenizer está entrenado para Mon, Birmano e Inglés; otros idiomas dependen del byte fallback, lo que aumenta el número de tokens por carácter y puede reducir la eficiencia.
- La compresión (chars/token) depende del corpus de entrenamiento; en otras distribuciones de texto los valores pueden variar significativamente.
- Todos los ids de tokens cambiaron respecto a la versión anterior; cualquier embedding o modelo entrenado con la versión previa debe reentrenarse.
- La licencia `mit-code-corpus-derived-artifact` implica restricciones derivadas del corpus de entrenamiento; se recomienda revisar el archivo LICENSE antes de uso comercial.
- No es un modelo de lenguaje, por lo que no genera texto ni tiene capacidades de razonamiento; su función es exclusivamente la tokenización.
- La normalización aplicada (NFC, plegado de espacios) es una transformación deliberada; puede alterar el texto original en casos específicos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/janakhpon/mon_tokenizer)
- [Repositorio en GitHub](https://github.com/Code-Yay-Mal/mon_tokenizer)
- [Documentación de arquitectura](https://github.com/Code-Yay-Mal/mon_tokenizer/blob/main/docs/architecture.md)
- [Corpus MonCorpusCollection](https://github.com/MonDevHub/) (enlace incompleto en la model card)
