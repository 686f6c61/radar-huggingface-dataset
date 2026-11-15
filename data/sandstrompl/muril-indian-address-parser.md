# sandstromPL/muril-indian-address-parser

## Resumen

`sandstromPL/muril-indian-address-parser` es un modelo de clasificación de tokens (token classification) especializado en el troceado y etiquetado de direcciones postales indias escritas de forma desestructurada. Lo desarrolla el usuario de Hugging Face sandstromPL como proyecto de curso para la asignatura DSL504 / DS504 de Procesamiento de Lenguaje Natural en el IIT Bhilai (2026), y parte del modelo base `google/muril-base-cased`, un BERT multilingüe preentrenado específicamente sobre texto indio.

El modelo resuelve un problema concreto de normalización de datos: dada una dirección caótica en romanización e hinglish (abreviaturas, faltas de ortografía, delimitadores inconsistentes, campos omitidos o reordenados), asigna a cada token una de nueve etiquetas de campo (HOUSE, BUILDING, STREET, LANDMARK, LOCALITY, CITY, DISTRICT, STATE, PIN) en formato BIO (IOB2), con 19 etiquetas en total. Es relevante para pipelines de geocodificación, validación de direcciones y limpieza de registros en el contexto indio, donde la variabilidad de formatos es muy alta.

Con 236.980.243 parámetros y un tamaño de repositorio de 0,9 GB, es un modelo compacto y desplegable en hardware de consumo. Su principal limitación es que se entrenó exclusivamente con datos sintéticos, por lo que su rendimiento en direcciones reales escritas por personas aún no está validado con un conjunto de test humano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), basado en `google/muril-base-cased` |
| Parámetros totales | 236.980.243 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | No disponible (pesos en safetensors; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | Inglés (romanización e hinglish; sin devanagari) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/muril-base-cased` (commit `afd9f36`) para clasificación de tokens. MuRIL es un encoder BERT preentrenado sobre texto indio, lo que le aporta representaciones útiles para romanizaciones e hinglish. La cabeza de clasificación produce 19 etiquetas en formato BIO sobre los nueve campos de dirección. La convención de etiquetado asigna la etiqueta al primer subword de cada palabra.

El entrenamiento se realizó con 20.000 direcciones sintéticas generadas por el propio equipo del proyecto (configuración `full`, que activa las ocho familias de ruido: abreviaturas, frases de referencia, reordenación y campos omitidos, delimitadores y mayúsculas, erratas, variantes ortográficas, variantes de PIN y formatos numéricos indios), construidas sobre geografía real del directorio de códigos postales de India Post. Semilla de datos 42. Hiperparámetros: 3 épocas, learning rate 1e-4, batch 32, warm-up lineal sobre el 10 % de los pasos, weight decay 0,01, gradient clipping 1,0, precisión mixta bf16, longitud máxima 256, semilla 42. El entrenamiento completo llevó 357 segundos en una RTX 4060 Laptop GPU. No se documenta RLHF ni DPO (no aplica a una tarea de etiquetado).

## Capacidades

- Etiquetado de tokens de direcciones indias en nueve campos: HOUSE, BUILDING, STREET, LANDMARK, LOCALITY, CITY, DISTRICT, STATE y PIN.
- Salida en formato BIO (IOB2) con 19 etiquetas.
- Manejo de texto ruidoso: abreviaturas, erratas, variantes ortográficas, delimitadores inconsistentes, reordenación de campos y formatos numéricos indios.
- Procesamiento de romanización e hinglish (sin soporte de devanagari).
- Tokenización robusta mediante un esquema de preprocesado específico (separación por espacios y aislamiento de cada signo de puntuación o símbolo).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Normalización de direcciones en pipelines de geocodificación: el modelo separa los componentes de una dirección desestructurada para alimentar un geocodificador o un servicio de validación postal, aprovechando su tolerancia al ruido sintético con el que fue entrenado.
- Limpieza de registros de clientes o proveedores: dado un campo de dirección libre en una base de datos, el etiquetado por campos permite estructurar HOUSE, STREET, CITY y PIN en columnas separadas para deduplicación y análisis.
- Enrutamiento logístico y de última milla: extraer LOCALITY, CITY y PIN de direcciones introducidas manualmente por usuarios para asignar zonas de reparto, con la cautela de que la precisión en texto real aún no está validada.
- Validación de formularios de alta: comprobar que una dirección contiene los campos mínimos (por ejemplo, PIN y CITY) antes de aceptarla en un registro.
- Enriquecimiento de datasets abiertos: procesar directorios o registros públicos indios en romanización para extraer componentes de dirección de forma masiva.
- Prototipado e investigación en NLP aplicado a direcciones: servir como línea base reproducible (código y generador de datos públicos) para experimentos de etiquetado de direcciones en el contexto indio.
- Extracción de referencias (LANDMARK): identificar puntos de referencia en direcciones informales, útil en mercados donde la referencia a un comercio o templo es más fiable que el nombre de la calle.

## Benchmarks y rendimiento

Resultados publicados por el autor (span micro F1 con `seqeval`, IOB2 estricto, e intervalo bootstrap del 95 % sobre direcciones):

| Evaluado en | Span micro F1 | Exact match |
|---|---|---|
| Dev sintético (2.000 direcciones con PIN reservados) | 0,991 (0,989–0,992) | 0,946 |
| 20 direcciones escritas a mano (smoke set del equipo, no test reservado) | 0,741 (0,645–0,830) | 0,350 |

En el conjunto de 20 direcciones manuscritas, una línea base de reglas obtiene 0,828 y un CRF 0,796, ambos por encima del modelo. El autor indica que diseñó un conjunto de test humano pero no lo recogió, por lo que no hay puntuación sobre datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB en fp32 (0,9 GB de pesos) y menos de 0,5 GB en fp16/bf16; con cuantización de 8 bits, por debajo de 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una RTX 4060 Laptop GPU, lo que confirma que cabe holgadamente en GPU de consumo.
- Cabe en GPU de consumo: sí, en cualquier RTX 30/40, GTX 16xx, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (PyTorch), exportación a ONNX, TorchScript o cuantización dinámica; no se documenta soporte específico de vLLM, TGI, llama.cpp u Ollama (son entornos orientados a modelos generativos, no a este encoder).
- Latencia y throughput: no disponible. El entrenamiento de 3 épocas sobre 20.000 ejemplos tardó 357 s en una RTX 4060 Laptop, lo que da una idea del coste de cómputo, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sandstromPL/muril-indian-address-parser` | Encoder BERT (MuRIL) | 236.980.243 | 256 | Etiquetado de direcciones indias | Apache-2.0 | Hugging Face |
| `google/muril-base-cased` | Encoder BERT | ~236 M | 512 | Modelo base multilingüe indio | Apache-2.0 | Hugging Face |
| Línea base de reglas (proyecto del autor) | Reglas | No aplica | No aplica | Etiquetado de direcciones | No disponible | Repositorio del proyecto |
| CRF (proyecto del autor) | Modelo secuencial | No disponible | No disponible | Etiquetado de direcciones | No disponible | Repositorio del proyecto |

No se dispone de datos de benchmarks comparativos con otros modelos de etiquetado de direcciones de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con direcciones sintéticas: en texto manuscrito confunde CITY y LOCALITY (por ejemplo, etiqueta `Bhilai` como localidad), interpreta plantas (`Ground Floor`) como calles y falla con referencias sin palabra de relación en inglés (`hanuman mandir ke paas`).
- Solo cubre escritura romana e hinglish; no se entrenó con devanagari.
- El nombre propio del lugar (`Shree Sweets`) se etiqueta como `O` por diseño, lo que puede sorprender en casos de uso que esperen extraer el nombre del establecimiento.
- Pensado para direcciones de lugares públicos; el autor advierte explícitamente de que no debe usarse sobre datos personales sin validarlo antes con datos propios.
- Riesgo de alucinación no aplica en sentido generativo, pero sí hay riesgo de etiquetado erróneo sistemático en dominios no cubiertos por el generador sintético.
- No hay conjunto de test humano: la puntuación de 0,991 corresponde a datos sintéticos y no debe interpretarse como rendimiento en producción.
- Licencia Apache-2.0, que permite uso comercial; los datos de entrenamiento derivan del All India Pincode Directory bajo GODL-India y contienen datos de India Post, por lo que conviene revisar las condiciones de atribución si se redistribuyen datos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandstromPL/muril-indian-address-parser
- Repositorio del proyecto (código, informe y demo local `app/demo.py`): https://github.com/devreddy1015/NLP_GROUP_PROJECT
- Modelo base: https://huggingface.co/google/muril-base-cased
- Directorio All India Pincode Directory (India Post, data.gov.in): https://data.gov.in
