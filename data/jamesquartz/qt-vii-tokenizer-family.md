# JamesQuartz/QT-VII-Tokenizer-Family

# QT-VII Tokenizer Family (Ensemble, Overture & Prelude)

## Resumen

La familia QT Generation VII es un conjunto de tres tokenizadores BPE byte-level multilingües desarrollados por JamesQuartz, diseñados para cubrir las necesidades de tokenización de modelos de lenguaje de distintos tamaños. Esta séptima generación reemplaza a la anterior QT.VI y aborda explícitamente el compromiso entre capacidad de vocabulario, compresión de secuencias y huella de memoria de embeddings. El repositorio contiene únicamente artefactos de tokenizador (sin pesos de modelo), organizados en tres subcarpetas: `qt_VII_Plus_129k` (Ensemble), `qt_VII_Mini_96k` (Overture) y `qt_VII_Micro_64k` (Prelude).

El problema que resuelve es la tokenización eficiente para modelos que necesitan soportar 204 idiomas (conjunto FLORES-200), código de programación denso y notación científica, todo ello dentro de un presupuesto de vocabulario fijo. La relevancia actual radica en que los modelos pequeños (SLMs) y los modelos frontera requieren tokenizadores que minimicen la expansión de secuencias sin sacrificar cobertura lingüística. La arquitectura es BPE byte-level, con vocabularios de 64K, 96K y 129K tokens según la variante, y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BPE byte-level |
| Variantes | Ensemble (129K), Overture (96K), Micro (64K) |
| Parámetros totales | No aplica (tokenizador sin pesos) |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo que use el tokenizador) |
| Tipos de cuantización | No aplica |
| Idiomas soportados | 204 idiomas (FLORES-200), incluyendo en, zh, ar, hi, fr, de, es, ru, ja, ko, am, ka, or, ta, te, kn, ml, bn, ur, vi, th, tr, it, pt, pl, nl, el, he, id, sw, yo, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | tokenizer.json, vocab.json, merges.txt, tokenizer_config.json, chat_template.jinja |

## Arquitectura y entrenamiento

Los tres tokenizadores emplean el algoritmo Byte-Pair Encoding (BPE) a nivel de byte, lo que garantiza cobertura universal de caracteres y evita fallos de tokenización en cualquier script. El entrenamiento se realizó sobre datasets multilingües de FLORES-200 para cobertura lingüística, y sobre Humaneval y MBPP para optimizar la compresión de código Python. La innovación principal es la gestión explícita del "límite de suma cero" del vocabulario: cada slot asignado a un idioma o script reduce la capacidad disponible para otros dominios. Por ello, las tres variantes representan puntos de equilibrio deliberados entre cobertura multilingüe, compresión de código y eficiencia de memoria de embeddings. Además, se incluye una plantilla de chat (`chat_template.jinja`) y soporte para fill-in-the-middle (FIM), características orientadas a integración directa en pipelines de entrenamiento y generación.

## Capacidades

- Tokenización BPE byte-level para 204 idiomas con cobertura completa de scripts regionales (amhárico, georgiano, odia, etc.) sin fallos de cobertura.
- Compresión eficiente de código Python, incluyendo bloques de indentación profunda, y de notación LaTeX.
- Soporte de chat template mediante archivo `chat_template.jinja` incluido en cada variante.
- Soporte de fill-in-the-middle (FIM), útil para entrenamiento de modelos de código.
- Tres tamaños de vocabulario para adaptarse a distintos presupuestos de parámetros: 129K para modelos grandes, 96K para SLMs medianos y 64K para micro-modelos.
- Reducción de la huella de memoria de embeddings: la variante Overture reduce la VRAM de embeddings en un 25,7% frente a la de 129K, y la Micro en más del 50% frente a la de 129K (según la model card).
- Integración nativa con Hugging Face Transformers mediante `AutoTokenizer.from_pretrained(..., subfolder=...)`.

## Casos de uso

- Entrenamiento de modelos frontera (8B-70B+): la variante Ensemble (129K) es la recomendada por el autor para modelos grandes que requieren soporte universal de idiomas y compresión competitiva de código Python, manteniendo cero colapsos de script.
- Entrenamiento de SLMs de 1B-8B: la variante Overture (96K) ofrece el equilibrio óptimo entre compresión de código (expansión de secuencia inferior al 1,5% frente a 129K) y ahorro de memoria de embeddings, ideal para modelos medianos con restricciones de VRAM.
- Entrenamiento de micro-modelos (≤1B): la variante Micro (64K) reduce drásticamente el coste de la capa de embeddings, que en un modelo de 1B podría consumir más del 50% del presupuesto de parámetros si se usara un vocabulario de 129K.
- Tokenización para agentes y terminal: la variante Micro mejora la densidad de código puro en más de un 19% respecto a la generación anterior de 64K, siendo adecuada para modelos orientados a tareas de línea de comandos y razonamiento agéntico.
- Integración en pipelines de Hugging Face: al ser tokenizadores estándar de Transformers, se pueden cargar directamente con `AutoTokenizer` y usarse en entrenamiento, evaluación o inferencia sin modificaciones adicionales.
- Aplicaciones multilingües con soporte de scripts regionales: las tres variantes cubren los 204 idiomas de FLORES-200, lo que las hace aptas para sistemas que deban procesar lenguas de baja representación como amhárico, georgiano u odia sin recurrir a fallbacks de bytes.

## Benchmarks y rendimiento

La model card no proporciona resultados numéricos de benchmarks (como MMLU, HumanEval o GSM8K) porque se trata de un tokenizador, no de un modelo de lenguaje completo. En su lugar, presenta una matriz cualitativa de competencias por dominio basada en evaluaciones internas contra tokenizadores comerciales. Se reproduce dicha matriz a continuación:

| Tokenizador | Vocab Size | Code & Terminal | Sci Formulas | Global & Euro | Regional Scripts | Memory Efficiency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **QT.VII.1.8.Plus (Ensemble)** | 129K | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★☆☆☆ |
| **QT.VII.1.8.Mini (Overture)** | 96K | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| **QT.VII.1.8.Micro (Prelude)** | 64K | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★★★ |
| **QT.VI.3 (Legacy)** | 64K | ★☆☆☆☆ | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★★★★ |
| **DeepSeek V4-Flash** | 129K | ★★★★☆ | ★★★★★ | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ |
| **Meta Llama 3.2** | 128K | ★★★★★ | ★★★★☆ | ★★★★★ | ☆☆☆☆☆ | ★★☆☆☆ |

Según la model card, la variante Ensemble empata estadísticamente con DeepSeek V4 en compresión de código Python, y supera a Llama 3.2 en cobertura de scripts regionales. No se han publicado métricas numéricas adicionales en la información disponible.

## Requisitos de hardware

- El repositorio no incluye pesos de modelo, por lo que no requiere GPU para su uso. La carga y tokenización se pueden ejecutar en CPU sin requisitos especiales de memoria.
- El impacto en VRAM depende del modelo que utilice el tokenizador: un vocabulario de 129K con dimensión de embedding de 4096 requiere aproximadamente 1 GB en FP16 solo para la capa de embeddings, mientras que uno de 64K requeriría la mitad. Estas cifras son estimaciones razonables basadas en el tamaño del vocabulario, pero no están publicadas por el autor.
- Para el entrenamiento de modelos, se recomienda usar las variantes según el tamaño del modelo: Ensemble para 8B-70B+, Overture para 1B-8B y Micro para ≤1B, con el fin de optimizar el uso de memoria.
- El tokenizador es compatible con Hugging Face Transformers; para integraciones de alto rendimiento se puede usar junto con vLLM, TGI o llama.cpp, aunque estos requieren un modelo entrenado con el tokenizador.
- No se dispone de datos de latencia o throughput específicos del tokenizador.

## Comparativa con modelos similares

| Tokenizador | Vocab Size | Cobertura idiomas | Compresión código | Eficiencia memoria | Licencia |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **QT.VII.1.8.Plus (Ensemble)** | 129K | 204 (FLORES-200) | ★★★★☆ | ★★☆☆☆ | Apache 2.0 |
| **QT.VII.1.8.Mini (Overture)** | 96K | 204 (FLORES-200) | ★★★★☆ | ★★★★☆ | Apache 2.0 |
| **DeepSeek V4-Flash** | 129K | Alto recurso (sin scripts regionales) | ★★★★☆ | ★★☆☆☆ | No disponible |
| **Meta Llama 3.2** | 128K | Occidental / inglés | ★★★★★ | ★★☆☆☆ | Llama 3.2 Community License |

La comparativa se basa en la matriz de la model card. DeepSeek V4-Flash destaca en fórmulas científicas y lenguas de alto recurso, pero abandona scripts regionales como amhárico u odia. Meta Llama 3.2 es superior en compresión de código para entornos occidentales, pero tiene cobertura nula de scripts regionales. QT.VII ofrece un equilibrio más amplio, sacrificando algo de compresión en favor de la universalidad lingüística.

## Limitaciones y advertencias

- El repositorio contiene únicamente tokenizadores; no incluye pesos de modelo. Para usarlo en producción es necesario entrenar un modelo desde cero o adaptar uno existente, lo que requiere recursos computacionales significativos.
- El tamaño del vocabulario tiene un impacto directo en la memoria de embeddings: vocabularios de 129K pueden consumir más del 50% del presupuesto de parámetros en modelos de 1B, por lo que se debe elegir la variante adecuada según el tamaño del modelo.
- El equilibrio de vocabulario es de suma cero: ninguna variante es óptima en todos los dominios. Para proyectos centrados exclusivamente en lenguas de alto recurso y código, tokenizadores como DeepSeek V4-Flash o Llama 3.2 pueden ofrecer mejor compresión.
- No se han publicado métricas numéricas de rendimiento (p. ej., bytes por token o tasas de compresión) en la model card; las valoraciones con estrellas son cualitativas y basadas en evaluaciones internas del autor.
- La compatibilidad con herramientas de terceros (vLLM, llama.cpp, etc.) depende de que el modelo entrenado con este tokenizador sea compatible con dichas herramientas; no hay garantía de soporte directo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni de ausencia de sesgos en la tokenización para todos los idiomas.

## Enlaces

- Repositorio principal: [JamesQuartz/QT-VII-Tokenizer-Family](https://huggingface.co/JamesQuartz/QT-VII-Tokenizer-Family)
- Generación anterior: [qt-VI.6.4-49k](https://huggingface.co/JamesQuartz/qt-VI.6.4-49k)
- Tokenizador legacy de 64K: [qt-VI.3.5-64k](https://huggingface.co/JamesQuartz/qt-VI.3.5-64k)
- Tokenizador VI.1.3 de 32K: [JamesQuartz/qt-VI.1.3-32k](https://huggingface.co/JamesQuartz/qt-VI.1.3-32k)
- Sitio de Quartz (datos abiertos): [quartz.host](https://quartz.host/)
