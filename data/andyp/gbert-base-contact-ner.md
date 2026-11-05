# andyP/gbert-base-contact-ner

## Resumen

gbert-base-contact-ner es un modelo de clasificación de tokens en alemán especializado en la extracción de datos de contacto de páginas web corporativas. Lo desarrolla el usuario andyP y se construye mediante fine-tuning de deepset/gbert-base, un BERT base entrenado específicamente para alemán. El modelo identifica once campos distintos (calle, código postal, ciudad, país, teléfono, fax, correo electrónico, horario de apertura, etiqueta de ubicación, departamento y persona de contacto) sobre texto de páginas de empresas en formato markdown.

La relevancia del modelo reside en su enfoque acotado: en lugar de intentar resolver la extracción de contactos de extremo a extremo, se integra como el componente `gpu` del paquete `company_research.contact`, donde convive con expresiones regulares y un CRF que cubren los campos en los que este transformer rinde peor. Con 109 millones de parámetros y una ventana de 512 tokens, es un modelo compacto que prioriza el rendimiento en un dominio muy concreto (páginas de aviso legal e impresión de sitios alemanes, suizos y austríacos) frente a la generalidad.

El modelo se entrenó sobre páginas etiquetadas por agentes LLM (Claude Opus) siguiendo una guía de etiquetado escrita, sin verificación humana posterior. Esta decisión metodológica condiciona tanto sus métricas como sus limitaciones: los resultados publicados miden la concordancia con esas etiquetas automáticas, no con juicio humano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), cabeza de clasificación de tokens con 23 etiquetas |
| Parámetros totales | 109.354.775 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por ventana (510 + `[CLS]` y `[SEP]`), con solapamiento de 128 tokens entre ventanas |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Alemán (de) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de deepset/gbert-base, un BERT base adaptado al alemán, al que se le añade una cabeza de token classification con 23 etiquetas en formato BIO: `O` más `B-` e `I-` para cada uno de los once campos (`street`, `plz`, `city`, `country`, `phone`, `fax`, `email`, `opening_hours`, `location_label`, `department`, `person`). La entrada es el texto de la página en markdown, no HTML crudo, y el modelo devuelve únicamente spans de caracteres del texto original, sin normalizar ni reescribir los valores.

El entrenamiento se realizó sobre páginas de 800 webs de empresas alemanas (399), suizas (346) y austríacas (55), etiquetadas por agentes LLM contra una guía de etiquetado. El split es por dominio: 480 sitios para entrenamiento, 160 para desarrollo y 160 para test; el modelo se entrenó sobre las 565 páginas etiquetadas del split de train y se ajustó con dev. Las 55 webs austríacas se reservaron íntegramente para test, de modo que el modelo no vio datos de AT durante el entrenamiento. Las páginas se cortan en ventanas de 512 tokens (510 más los tokens especiales) con solapamiento de 128; el entrenamiento usa las ventanas que contienen algún valor etiquetado más un número igual de ventanas sin valores, muestreadas al azar. Se optimizó con AdamW (learning rate 3e-5, weight decay 0.01), batch size 4 con 4 pasos de acumulación de gradiente, hasta 8 épocas con early stopping (paciencia 2) sobre el F1 seqeval de dev.

## Capacidades

- Extracción de entidades de contacto en alemán: calle, código postal, ciudad, país, teléfono, fax, correo electrónico, horario de apertura, etiqueta de ubicación, departamento y persona de contacto.
- Clasificación de tokens en formato BIO con 23 etiquetas, devolviendo spans de caracteres sobre el texto de entrada.
- Procesamiento de páginas largas mediante ventanas de 510 tokens con solapamiento de 128 y promediado de probabilidades en los tokens cubiertos por varias ventanas.
- Funcionamiento sobre texto de página en markdown, orientado a páginas de aviso legal, impresión y contacto de empresas.
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada al alemán; otros idiomas no están probados.

## Casos de uso

- Enriquecimiento de bases de datos B2B: dado un dominio corporativo, extraer teléfono, correo y dirección postal de la página de impresión para completar fichas de empresa. El modelo está diseñado precisamente para este flujo dentro de `company_research.contact`.
- Verificación de datos de contacto en directorios: comparar los datos almacenados de una empresa con los publicados en su web y marcar discrepancias en teléfono o código postal, campos donde el modelo alcanza F1 de 88,9 y 88,0 respectivamente.
- Detección de horarios de atención al cliente: localizar el bloque de horarios en la página de contacto para alimentar un chatbot o un sistema de tickets que necesite saber cuándo hay atención telefónica, asumiendo que es el campo más difícil (F1 48,9) y requiere revisión.
- Extracción de personas de contacto y departamentos: identificar nombres y áreas (ventas, soporte, prensa) en páginas de contacto para dirigir consultas al destinatario correcto, con F1 de 80,5 en persona.
- Construcción de pipelines de scraping estructurado: usar el modelo como etapa de extracción sobre texto markdown ya limpio, combinándolo con regex para correo y fax y con un CRF para calle y etiqueta de ubicación, tal como hace la pipeline de referencia.
- Análisis de cobertura geográfica DACH: procesar sitios de Alemania, Suiza y Austria para estudios de mercado, teniendo en cuenta que el rendimiento en AT (sin datos de entrenamiento) es inferior al de DE y CH en la pipeline completa.
- Auditoría de datos de contacto publicados: revisar de forma masiva webs corporativas para detectar páginas de impresión incompletas o desactualizadas, aprovechando que el modelo solo devuelve spans literales del texto y no inventa valores.

## Benchmarks y rendimiento

Resultados de extracción sobre las 160 páginas de test reservadas (153 con datos de contacto), comparando los valores predichos con las etiquetas hechas por LLM tras normalización (teléfonos a E.164, correos en minúsculas, PLZ solo dígitos, texto casefolded). F1 por campo, modelo solo:

| Métrica | Valor |
|---|---|
| Micro F1 | 70,2 |
| street | 64,9 |
| plz | 88,0 |
| phone | 88,9 |
| fax | 80,6 |
| email | 70,7 |
| opening_hours | 48,9 |
| person | 80,5 |

El informe no publica puntuaciones por campo para city, country, location_label ni department con este modelo en solitario. Las diferencias inferiores a unos 3 puntos entre filas del informe se consideran ruido dado el tamaño del test.

Resultados de la pipeline completa `company_research.contact` en modo `gpu` (detección de página de contacto, extracción híbrida con este modelo para PLZ, city, phone, hours, department y person, CRF para street y label, regex para fax, email y country, agrupación en ubicaciones y departamentos, parseo de datos estructurados y enlaces sociales):

| Ámbito | Micro F1 |
|---|---|
| Global | 73,6 |
| Alemania (DE) | 71,0 |
| Suiza (CH) | 80,0 |
| Austria (AT) | 72,9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo de 109 millones de parámetros ocupa aproximadamente 0,44 GB de pesos; con activaciones y ventanas de 512 tokens, el consumo real es de alrededor de 1-2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Para procesar lotes grandes de páginas en paralelo, una A100 o H100 aporta throughput, pero no son necesarias para inferencia individual.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas, e incluso en CPU (mucho más lento, según advierte el autor).
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `AutoTokenizer`; el paquete `company_research.contact` con `device="gpu"` (requiere el extra `gpu` con torch y transformers, y no está en PyPI). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andyP/gbert-base-contact-ner | 109,4 M | 512 tokens por ventana | NER de contacto en alemán | MIT | HuggingFace |
| deepset/gbert-base | no disponible | 512 tokens | Modelo base alemán (MLM) | no disponible | HuggingFace |
| CRF del pipeline `company_research.contact` | no aplica (modelo estadístico) | no aplica | Extracción de street y location_label | no disponible | Incluido en el paquete |
| Regex del pipeline `company_research.contact` | no aplica | no aplica | Extracción de fax, email y country | no disponible | Incluido en el paquete |

No se dispone de datos de benchmarks de modelos alternativos de NER de contacto en alemán en la información proporcionada, por lo que no es posible una comparación cuantitativa directa. El propio informe del proyecto indica que, para street y email, un regex y un CRF superan a este modelo, y que la pipeline enruta esos campos a esos componentes.

## Limitaciones y advertencias

- Ámbito restringido a páginas de empresas en alemán (aviso legal, impresión y contacto); otros idiomas y tipos de página no están probados.
- Las etiquetas de entrenamiento provienen de un LLM y no fueron verificadas por humanos, de modo que las métricas miden concordancia con esas etiquetas, no con juicio humano.
- Campos débiles: street (64,9) y email (70,7); opening_hours es el más difícil (48,9). Un regex y un CRF superan al modelo en street y email.
- Errores típicos detectados en la revisión del proyecto: valores omitidos, valores de terceros (por ejemplo, la agencia web mencionada en el aviso legal), spans cortados dentro de palabras y texto de navegación.
- El modelo no agrupa valores en ubicaciones ni departamentos, y no distingue páginas de contacto de otras páginas; esa lógica reside en la pipeline.
- La entrada debe ser el texto de la página en markdown, como en los datos de entrenamiento; el HTML crudo empeora el rendimiento.
- No se han publicado resultados para los campos city, country, location_label y department con este modelo en solitario.
- Las 55 webs austríacas solo aparecen en test, por lo que el rendimiento en AT refleja una generalización sin datos de entrenamiento de ese país.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de los datos extraídos; conviene validar en producción.
- Privacidad: las páginas de entrenamiento son webs corporativas públicas que contienen nombres y datos de contacto profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andyP/gbert-base-contact-ner
- Modelo base: https://huggingface.co/deepset/gbert-base
